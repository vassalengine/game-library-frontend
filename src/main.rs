use axum::{Router, serve};
use tokio::net::TcpListener;
use tower_http::services::{ServeDir, ServeFile};

const SITE_DIR: &str = "site";

// TODO: client-side templating?
// TODO: sanitize strings going into HTML
// TODO: compression

#[tokio::main]
async fn main() {
    // set up router
    let app = Router::new()
        .route_service(
            "/projects",
            ServeFile::new(format!("{SITE_DIR}/projects.html"))
        )
        .route_service(
            "/projects/:project",
            ServeFile::new(format!("{SITE_DIR}/project.html"))
        )
        .nest_service(
            "/",
            ServeDir::new(SITE_DIR)
        );

    // serve pages
    let listener = TcpListener::bind("0.0.0.0:8000").await.unwrap();
    serve(listener, app)
        .await
        .unwrap();
}
