use askama::Template;
use axum::{
    Router, serve,
    extract::{Path, Query},
    http::{StatusCode, Uri},
    response::{Html, IntoResponse, Redirect, Response},
    routing::get
};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use base64::{Engine as _};
use mime::APPLICATION_JSON;
use hmac::{Hmac, Mac};
use rand::{
    self,
    distributions::{Alphanumeric, DistString}
};
use reqwest::{
    Client, // StatusCode,
    header::ACCEPT
};
use serde::Deserialize;
//use serde_json::json;
use sha2::Sha256;
use std::collections::HashMap;
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

const SHARED_SECRET: &[u8] = b"DSQh*Q`HQF$!hz2SuSl@";
const DISCOURSE_URL: &str = "https://forum.vassalengine.org";

//const GL_URL: &str = "http://localhost:8000";
const GL_URL: &str = "https://vassalengine.org/test/gl";
const GL_BASE: &str = "/test/gl";

const SITE_DIR: &str = "site";

// TODO: client-side templating?
// TODO: sanitize strings going into HTML
// TODO: compression
// TODO: shoule empty hrefs be # instead? something else?

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

#[derive(Deserialize)]
struct LoginParams {
    returnto: String
}

#[derive(Debug, Deserialize)]
struct LoginResponseParams {
    sso: String,
    sig: String,
    returnto: String
}

#[derive(Debug, Deserialize)]
struct LogoutResponseParams {
    returnto: String
}

async fn handle_complete_logout(
    Query(params): Query<LogoutResponseParams>,
    jar: CookieJar
) -> Result<(CookieJar, Redirect), AppError> {
    Ok(
        (
            jar.remove(Cookie::from("nonce"))
                .remove(Cookie::from("username"))
                .remove(Cookie::from("name")),
            Redirect::to(&params.returnto)
        )
    )
}

async fn handle_complete_login(
    Query(params): Query<LoginResponseParams>,
    jar: CookieJar
) -> Result<(CookieJar, Redirect), AppError> {

    let mut mac = Hmac::<Sha256>::new_from_slice(SHARED_SECRET)
        .or(Err(AppError::InternalError))?;

    mac.update(params.sso.as_bytes());

    let code_bytes = hex::decode(params.sig)
        .or(Err(AppError::InternalError))?;

    mac.verify_slice(&code_bytes)
        .or(Err(AppError::InternalError))?;

    let b = base64::engine::general_purpose::STANDARD
        .decode(params.sso)
        .or(Err(AppError::InternalError))?;

    let q = String::from_utf8(b)
        .or(Err(AppError::InternalError))?;

    let args = format!("/?{}", q);

    let uri: Uri = args.parse()
        .or(Err(AppError::InternalError))?;

    let Query(qargs): Query<HashMap<String, String>> = Query::try_from_uri(&uri)
        .or(Err(AppError::InternalError))?;

//    println!("{}", serde_json::to_string_pretty(&json!(qargs)).unwrap());
//    println!("{}", params.returnto);

    let nonce_actual = qargs.get("nonce")
        .ok_or(AppError::InternalError)?
        .to_string();

    let nonce_expected = jar.get("nonce")
        .ok_or(AppError::InternalError)?
        .value()
        .to_owned();

    // check that the nonce matches the one we sent
    if nonce_actual != nonce_expected {
        return Err(AppError::InternalError);
    }

    let jar = jar.remove(Cookie::from("nonce"));

    // TODO: username can change! must use external_id!

    let username = qargs.get("username")
        .ok_or(AppError::InternalError)?
        .to_string();

    let jar = if let Some(name) = qargs.get("name") {
        jar.add(Cookie::new("name", name.to_string()))
    }
    else {
        jar
    };

    Ok(
        (
            jar.add(Cookie::new("username", username)),
            Redirect::to(&params.returnto)
        )
    )
}

fn make_sso_request(
    params: LoginParams,
    jar: CookieJar,
    login: bool
) -> Result<(CookieJar, Redirect), AppError> {
    // generate a nonce
    let mut rng = rand::thread_rng();
    let nonce = Alphanumeric.sample_string(&mut rng, 20);

    // create a payload with the nonce and a return URL
    let returnto = params.returnto;

    let payload = if login {
        format!("nonce={nonce}&return_sso_url={returnto}")
    }
    else {
        format!("nonce={nonce}&return_sso_url={returnto}&logout=true")
    };

    let b64_payload = base64::engine::general_purpose::STANDARD.encode(payload);
    let enc_payload = urlencoding::encode(&b64_payload);

    let mut mac = Hmac::<Sha256>::new_from_slice(SHARED_SECRET)
        .or(Err(AppError::InternalError))?;
    mac.update(b64_payload.as_bytes());

    let result = mac.finalize();
    let code_bytes = result.into_bytes();

    let hex_signature = hex::encode(code_bytes);

    Ok(
        (
            jar.add(Cookie::new("nonce", nonce)),
            Redirect::to(
                &format!(
                    "{}/session/sso_provider?sso={}&sig={}",
                    DISCOURSE_URL,
                    enc_payload,
                    hex_signature
                )
            )
        )
    )
}

async fn handle_logout(
    Query(params): Query<LoginParams>,
    jar: CookieJar
) -> Result<(CookieJar, Redirect), AppError> {
    make_sso_request(params, jar, false)
}

async fn handle_login(
   Query(params): Query<LoginParams>,
    jar: CookieJar
) -> Result<(CookieJar, Redirect), AppError> {
    make_sso_request(params, jar, true)
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

//const API_URL: &str = "http://localhost:3000/api/v1";
const API_URL: &str = "https://vassalengine.org/test/gls/api/v1";
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

    let enc_real_returnto = urlencoding::encode(&here);

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
                "{GL_URL}/completeLogout?returnto={}",
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
                "{GL_URL}/completeLogin?returnto={}",
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
        .route("/completeLogin", get(handle_complete_login))
        .route("/completeLogout", get(handle_complete_logout))
        .route("/login", get(handle_login))
        .route("/logout", get(handle_logout))
        .route("/projects", get(handle_projects))
        .route("/projects/:project", get(handle_project))
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
