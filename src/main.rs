use axum::{
    Router, serve,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use const_format::formatcp;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::{
    compression::CompressionLayer,
    services::{ServeDir, ServeFile}
};

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

#[tokio::main]
async fn main() {
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
    let listener = TcpListener::bind(addr)
        .await
        .unwrap();
    serve(listener, app)
        .await
        .unwrap();
}
