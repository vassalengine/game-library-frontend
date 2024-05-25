use askama::Template;
use axum::{
    Router, serve,
    extract::Path,
    http::StatusCode,
    response::{Html, IntoResponse, Response},
    routing::get
};
use axum_extra::extract::cookie::CookieJar;
use const_format::formatcp;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::{
    compression::CompressionLayer,
    services::{ServeDir, ServeFile}
};

const DISCOURSE_URL: &str = "https://forum.vassalengine.org";

const GL_BASE: &str = "/gl";
//const GL_BASE: &str = "/test/gl";

const UMS_URL: &str = "http://localhost:4000/api/v1";

const SITE_DIR: &str = "app/dist";

const API_URL: &str = "http://localhost:3000/api/v1";
//const API_URL: &str = "https://vassalengine.org/test/gls/api/v1";
const YEAR: &str = "2024";
const CURRENT_VERSION: &str = "3.7.12";
const NEWS_LINK: &str = "https://forum.vassalengine.org/t/vassal-3-7-12-released/79548";

// TODO: client-side templating?
// TODO: sanitize strings going into HTML
// TODO: should empty hrefs be # instead? something else?
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

struct UserInfo {
    username: String,
    name: String,
    avatar_url: String
}

#[derive(Template)]
#[template(path = "projects.html")]
struct ProjectsTemplate {
    api_url: String,
    year: String,
    current_version: String,
    news_link: String,
    user_info: Option<UserInfo>,
    returnto: String
}

#[derive(Template)]
#[template(path = "project.html")]
struct ProjectTemplate {
    api_url: String,
    year: String,
    current_version: String,
    news_link: String,
    user_info: Option<UserInfo>,
    returnto: String
}

struct HtmlTemplate<T>(T);

impl<T> IntoResponse for HtmlTemplate<T>
where
    T: Template
{
    fn into_response(self) -> Response {
        match self.0.render() {
            Ok(html) => Html(html).into_response(),
            Err(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to render template. Error: {err}"),
            ).into_response()
        }
    }
}

async fn setup_user_info(
    here: &str,
    jar: CookieJar
) -> Result<(String, Option<UserInfo>), AppError>
{
    let username: Option<String> = jar.get("username")
        .map(|cookie| cookie.value().to_owned());

    let enc_real_returnto = urlencoding::encode(here);

    match username {
        Some(username) => {
            let name = jar.get("name")
                .map(|cookie| cookie.value().to_owned())
                .unwrap_or_else(|| username.clone());

            let avatar_url = format!("{UMS_URL}/users/{username}/avatar/48");

            let sso_returnto = format!(
                "{UMS_URL}/sso/completeLogout?returnto={}",
                enc_real_returnto
            );

            let enc_sso_returnto = urlencoding::encode(&sso_returnto);

            Ok(
                (
                    enc_sso_returnto.into(),
                    Some(
                        UserInfo {
                            username,
                            name,
                            avatar_url
                        }
                    )
                )
            )
        },
        _ => {
            let sso_returnto = format!(
                "{UMS_URL}/sso/completeLogin?returnto={}",
                enc_real_returnto
            );

            let enc_sso_returnto = urlencoding::encode(&sso_returnto);

            Ok((enc_sso_returnto.into(), None))
        }
    }
}

async fn handle_projects(
    jar: CookieJar
) -> Result<HtmlTemplate<ProjectsTemplate>, AppError> {
    let here = format!("{GL_BASE}/projects");
    let (returnto, user_info) = setup_user_info(&here, jar).await?;

    Ok(
        HtmlTemplate(
            ProjectsTemplate {
                api_url: API_URL.into(),
                year: YEAR.into(),
                current_version: CURRENT_VERSION.into(),
                news_link: NEWS_LINK.into(),
                user_info,
                returnto
            }
        )
    )
}

/*
async fn handle_project(
    Path(proj): Path<String>,
    jar: CookieJar
) -> Result<HtmlTemplate<ProjectTemplate>, AppError> {
    let here = format!("{GL_BASE}/projects/{proj}");
    let (returnto, user_info) = setup_user_info(&here, jar).await?;

    Ok(
        HtmlTemplate(
            ProjectTemplate {
                api_url: API_URL.into(),
                year: YEAR.into(),
                current_version: CURRENT_VERSION.into(),
                news_link: NEWS_LINK.into(),
                user_info,
                returnto
            }
        )
    )
}
*/

#[tokio::main]
async fn main() {
    let listen_ip = [0, 0, 0, 0];
    let listen_port = 8000;

    // set up router
    let app = Router::new()
        .route(&format!("{GL_BASE}/projects"), get(handle_projects))
        .route_service(
            &format!("{GL_BASE}/projects/:project"),
            ServeFile::new(formatcp!("{SITE_DIR}/index.html"))
        )
        .nest_service("/", ServeDir::new(SITE_DIR))
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
