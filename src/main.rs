use askama::Template;
use axum::{
    Router, serve,
    extract::Path,
    routing::get,
};
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

const STATIC_DIR: &str = "static";

const API_URL: &str = "http://localhost:3000/api/v1/projects";
const YEAR: &str = "2024";
const CURRENT_VERSION: &str = "3.7.8";
const NEWS_LINK: &str = "https://forum.vassalengine.org/t/vassal-3-7-8-released/78867";

#[derive(Template)]
#[template(path = "projects.html")]
struct ProjectsTemplate<'a> {
    api_url: &'a str,
    year: &'a str,
    current_version: &'a str,
    news_link: &'a str
}

async fn get_projects() -> ProjectsTemplate<'static> {
    ProjectsTemplate {
        api_url: API_URL,
        year: YEAR,
        current_version: CURRENT_VERSION,
        news_link: NEWS_LINK
    }
}

#[derive(Template)]
#[template(path = "project.html")]
struct ProjectTemplate<'a> {
    api_url: &'a str,
    year: &'a str,
    current_version: &'a str,
    news_link: &'a str,
    project: String
}

async fn get_project(
    Path(proj): Path<String>
) ->ProjectTemplate<'static>
{
    ProjectTemplate {
        api_url: API_URL,
        year: YEAR,
        current_version: CURRENT_VERSION,
        news_link: NEWS_LINK,
        project: proj
    }
}

// TODO: client-side templating?
// TODO: sanitize strings going into HTML
// TODO: compression

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route(
            "/projects",
            get(get_projects)
        )
        .route(
            "/projects/:project",
            get(get_project)
        )
        .nest_service(
            "/",
            ServeDir::new(STATIC_DIR)
        );

    let listener = TcpListener::bind("0.0.0.0:8000").await.unwrap();
    serve(listener, app)
        .await
        .unwrap();
}
