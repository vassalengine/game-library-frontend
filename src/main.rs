use axum::{
    Router, serve,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use const_format::formatcp;
use std::{
    io,
    net::SocketAddr
};
use tokio::net::TcpListener;
use tower_http::{
    compression::CompressionLayer,
    services::{ServeDir, ServeFile}
};
use tracing::{error, info};

const GL_BASE: &str = "/gl";
//const GL_BASE: &str = "/test/gl";

const SITE_DIR: &str = "app/dist";

// TODO: look into tracing

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

#[derive(Debug, thiserror::Error)]
enum StartupError {
//    #[error("{0}")]
//    AddrParse(#[from] std::net::AddrParseError),
//    #[error("{0}")]
//    TomlParse(#[from] toml::de::Error),
    #[error("{0}")]
    Io(#[from] io::Error)
}

async fn run() -> Result<(), StartupError> {
    let listen_ip = [0, 0, 0, 0];
    let listen_port = 8000;

    // set up router
    let app = Router::new()
        .route_service(
            &format!("{GL_BASE}/projects"),
            ServeFile::new(formatcp!("{SITE_DIR}/projects.html"))
        )
        .route_service(
            &format!("{GL_BASE}/projects/{{project}}"),
            ServeFile::new(formatcp!("{SITE_DIR}/project.html"))
        )
        .route_service(
            &format!("{GL_BASE}/new"),
            ServeFile::new(formatcp!("{SITE_DIR}/new.html"))
        )
        .fallback_service(ServeDir::new(SITE_DIR))
        .layer(CompressionLayer::new());

    // serve pages
    let addr = SocketAddr::from((listen_ip, listen_port));
    let listener = TcpListener::bind(addr).await?;

    info!("Listening on {}", addr);

    serve(listener, app)
        .await?;

    Ok(())
}

#[tokio::main]
async fn main() {

    info!("Starting");

    if let Err(e) = run().await {
        error!("{}", e);
    }

    info!("Exiting");
}
