use axum::{
    Router, serve,
    extract::{ConnectInfo, Request},
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Deserialize;
use std::{
    fs,
    io,
    net::{IpAddr, SocketAddr},
    time::Duration
};
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer,
    services::{ServeDir, ServeFile},
    timeout::TimeoutLayer,
    trace::{DefaultOnFailure, DefaultOnResponse, TraceLayer}
};
use tracing::{error, info, info_span, Level, Span};
use tracing_panic::panic_hook;
use tracing_subscriber::{
    EnvFilter,
    layer::SubscriberExt,
    util::SubscriberInitExt
};

const SITE_DIR: &str = "app/dist";

enum AppError {
    InternalError
}

impl From<&AppError> for StatusCode {
    fn from(err: &AppError) -> Self {
        match err {
            AppError::InternalError => StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let code = StatusCode::from(&self);
        let body = "";
        (code, body).into_response()
    }
}

fn real_addr(request: &Request) -> String {
    // If we're behind a proxy, get IP from X-Forwarded-For header
    match request.headers().get("x-forwarded-for") {
        Some(addr) => addr.to_str()
            .map(String::from)
            .ok(),
        None => request.extensions()
            .get::<ConnectInfo<SocketAddr>>()
            .map(|info| info.ip().to_string())
    }
    .unwrap_or_else(|| "<unknown>".into())
}

fn make_span(request: &Request) -> Span {
    // adapted from tower_http::trace::DefaultMakeSpan
    info_span!(
        "request",
        source = %real_addr(request),
        method = %request.method(),
        uri = %request.uri(),
        version = ?request.version(),
        headers = ?request.headers()
    )
}

#[derive(Debug, thiserror::Error)]
enum StartupError {
    #[error("{0}")]
    AddrParse(#[from] std::net::AddrParseError),
    #[error("{0}")]
    TomlParse(#[from] toml::de::Error),
    #[error("{0}")]
    Io(#[from] io::Error)
}

fn routes(base_path: &str) -> Router {
    Router::new()
        .route_service(
            &format!("{base_path}/projects"),
            ServeFile::new(format!("{SITE_DIR}/projects.html"))
        )
        .route_service(
            &format!("{base_path}/projects/{{project}}"),
            ServeFile::new(format!("{SITE_DIR}/project.html"))
        )
        .route_service(
            &format!("{base_path}/new"),
            ServeFile::new(format!("{SITE_DIR}/new.html"))
        )
        .fallback_service(ServeDir::new(SITE_DIR))
        .layer(
            ServiceBuilder::new()
                .layer(CompressionLayer::new())
                 // ensure requests don't block shutdown
                .layer(TimeoutLayer::new(Duration::from_secs(10)))
        )
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(make_span)
                .on_response(
                    DefaultOnResponse::new().level(Level::INFO)
                )
                .on_failure(
                    DefaultOnFailure::new().level(Level::WARN)
                )
        )
}

async fn shutdown_signal() {
    use tokio::signal::unix::{signal, SignalKind};

    let mut interrupt = signal(SignalKind::interrupt())
        .expect("failed to install signal handler");

    // Docker sends SIGQUIT for some unfathomable reason
    let mut quit = signal(SignalKind::quit())
        .expect("failed to install signal handler");

    let mut terminate = signal(SignalKind::terminate())
        .expect("failed to install signal handler");

    tokio::select! {
        _ = interrupt.recv() => info!("received SIGINT"),
        _ = quit.recv() => info!("received SIGQUIT"),
        _ = terminate.recv() => info!("received SIGTERM")
    }
}

#[derive(Debug, Deserialize)]
pub struct Config {
    pub base_path: String,
    pub listen_ip: String,
    pub listen_port: u16
}

async fn run() -> Result<(), StartupError> {
    info!("Reading config.toml");
    let config: Config = toml::from_str(&fs::read_to_string("config.toml")?)?;

    // set up router
    let app = routes(&config.base_path);

    // serve pages
    let ip: IpAddr = config.listen_ip.parse()?;
    let addr = SocketAddr::from((ip, config.listen_port));
    let listener = TcpListener::bind(addr).await?;
    info!("Listening on {}", addr);

    serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>()
    )
    .with_graceful_shutdown(shutdown_signal())
    .await?;

    Ok(())
}

#[tokio::main]
async fn main() {
    // set up logging
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| {
                [
                    // log this crate at info level
                    &format!("{}=info", env!("CARGO_CRATE_NAME")),
                    // tower_http is noisy below info
                    "tower_http=info",
                    // axum::rejection=trace shows rejections from extractors
                    "axum::rejection=trace",
                    // every panic is a fatal error
                    "tracing_panic=error"
                ].join(",").into()
            }),
        )
        .with(tracing_subscriber::fmt::layer().with_target(false))
        .init();

    // ensure that panics are logged
    std::panic::set_hook(Box::new(panic_hook));

    info!("Starting");

    if let Err(e) = run().await {
        error!("{}", e);
    }

    info!("Exiting");
}
