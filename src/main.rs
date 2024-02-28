use askama::Template;
use axum::{
    Router, serve,
    extract::{Path, Query},
    http::StatusCode,
    response::{Html, Json, IntoResponse, Response},
    routing::get
};
use axum_extra::extract::cookie::CookieJar;
use mime::APPLICATION_JSON;
use reqwest::{
    Client, // StatusCode,
    header::ACCEPT
};
use serde::Deserialize;
use serde_json::Value;
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

const SHARED_SECRET: &[u8] = b"DSQh*Q`HQF$!hz2SuSl@";
const DISCOURSE_URL: &str = "https://forum.vassalengine.org";

const GL_URL: &str = "http://localhost:8000";
const GL_BASE: &str = GL_URL;
//const GL_URL: &str = "https://vassalengine.org/test/gl";
//const GL_BASE: &str = "/test/gl";

const UMS_URL: &str = "http://localhost:4000/api/v1";

const SITE_DIR: &str = "site";

// TODO: client-side templating?
// TODO: sanitize strings going into HTML
// TODO: compression
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

#[derive(Deserialize)]
struct User {
    avatar_template: String
}

#[derive(Deserialize)]
struct UserReply {
    user: User
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

const API_URL: &str = "http://localhost:3000/api/v1";
//const API_URL: &str = "https://vassalengine.org/test/gls/api/v1";
const YEAR: &str = "2024";
const CURRENT_VERSION: &str = "3.7.8";
const NEWS_LINK: &str = "https://forum.vassalengine.org/t/vassal-3-7-8-released/78867";

async fn get_avatar(url: &str) -> Result<String, AppError> {
    let client = Client::builder().build().unwrap();

    // do the GET
    let response = client.get(url)
        .header(ACCEPT, APPLICATION_JSON.as_ref())
        .send()
        .await
        .or(Err(AppError::InternalError))?
        .error_for_status()
        .or(Err(AppError::InternalError))?;

    // non-200 results are errors
    if response.status() != reqwest::StatusCode::OK {
        return Err(AppError::InternalError);
    }

    Ok(
        response.json::<UserReply>()
            .await
            .or(Err(AppError::InternalError))?
            .user.avatar_template
    )
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

            let user_url = format!("{DISCOURSE_URL}/u/{username}.json");
            let avatar_template = get_avatar(&user_url).await?;

            let avatar_url = format!(
                "{DISCOURSE_URL}/{}",
                avatar_template.replace("{size}", "48")
            );

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

#[tokio::main]
async fn main() {
    // set up router
    let app = Router::new()
        .route("/projects", get(handle_projects))
        .route("/projects/:project", get(handle_project))
        .nest_service("/", ServeDir::new(SITE_DIR));

    // serve pages
    let listener = TcpListener::bind("0.0.0.0:8000").await.unwrap();
    serve(listener, app)
        .await
        .unwrap();
}
