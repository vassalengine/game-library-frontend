import { parseJWT, setCookie } from './util.js';

class APIError extends Error {
  constructor(status, statusText, message) {
    super(message);
    this.status = status;
    this.statusText = statusText;
  }

  name = this.constructor.name;
}

APIError.prototype.toString = function () {
  return `APIError: ${this.status} ${this.statusText}: ${this.message}`;
};

class NetworkError extends Error {
  constructor(cause) {
    if (cause) {
      super("", { cause: cause });
    }
    else {
      super();
    }
  }

  name = this.constructor.name;
}

NetworkError.prototype.toString = function () {
  return 'NetworkError: Request failed' + (this.cause ? `: ${this.cause}` : '');
};

class TimeoutError extends Error {
  name = this.constructor.name;
}

TimeoutError.prototype.toString = function () {
  return 'TimeoutError: Request timed out';
};

const UPLOAD_OK = 'UploadOk';

const UPLOAD_ABORTED = 'UploadAborted';

async function checkError(response) {
  if (!response.ok) {
    const json = await response.json();
    const message = json?.error ?? json.toString();
    throw new APIError(response.status, response.statusText, message);
  }
}

async function doFetch(url, options={}) {
  let response;
  try {
    response = await fetch(url, options);
  }
  catch (err) {
    if (err.name === 'TimeoutError') {
      throw new TimeoutError;
    }
    else {
      throw new NetworkError(err);
    }
  }

  await checkError(response);
  return response;
}

async function fetchOk(url, options={}) {
  await doFetch(url, options);
}

export async function fetchJSON(url, options={}) {
  return (await doFetch(url, options)).json();
}

function doUpload(file, type, url, token) {
  const xhr = new XMLHttpRequest();

  const promise = new Promise((resolve, reject) => {
    xhr.upload.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(UPLOAD_OK);
      }
      else {
        const message = JSON.parse(result.response)?.error;
        reject(new APIError(result.status, result.statusText, message));
      }
    });

    xhr.upload.addEventListener('abort', () => resolve(UPLOAD_ABORTED));
    xhr.upload.addEventListener('error', () => reject(new NetworkError));
    xhr.upload.addEventListener('timeout', () => reject(new TimeoutError));

    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', type);
    xhr.send(file);
  });

  return [xhr, promise];
}

function isTokenExpired(token) {
  // Date.now() is milliseconds, token exp is seconds
  return Date.now() / 1000 >= parseJWT(token).exp
}

class Client {
  constructor(gls_api, ums_api, project, token, refresh) {
    this.gls_api = gls_api;
    this.ums_api = ums_api;
    this.project = project;
    this.token = token;
    this.refresh = refresh;
    this.fetch_timeout = 10000; // ms
  }

  async fetchJSON(url, options={}) {
    return await fetchJSON(
      url,
      {
        signal: AbortSignal.timeout(this.fetch_timeout),
        ...options
      }
    );
  }

  async fetchOk(url, options={}) {
    await fetchOk(
      url,
      {
        signal: AbortSignal.timeout(this.fetch_timeout),
        ...options
      }
    );
  }

  authHeaders() {
    return { 'Authorization': `Bearer ${this.refresh}` }
  }

  authAndJSONHeaders() {
    return {
      'Authorization': `Bearer ${this.refresh}`,
      'Content-Type': 'application/json'
    }
  }

  async refreshAccessToken() {
    return this.fetchJSON(
      `${this.ums_api}/refresh`,
      {
        method: 'POST',
        headers: this.authHeaders()
      }
    );
  }

  async refreshTokenIfExpired() {
    if (!this.token || isTokenExpired(this.token)) {
      this.token = (await this.refreshAccessToken()).token;
      const parsed_token = parseJWT(this.token);
      // Date() wants milliseconsds, token exp is in seconds
      const expires = new Date(parsed_token.exp * 1000);
      setCookie('token', this.token, { expires: expires, secure: true });
    }
  }

  async getProject() {
    return this.fetchJSON(`${this.gls_api}/projects/${this.project}`);
  }

  async createProject(data) {
    await this.refreshTokenIfExpired();
    return this.fetchOk(
      `${this.gls_api}/projects/${this.project}`,
      {
        method: 'POST',
        headers: this.authAndJSONHeaders(),
        body: JSON.stringify(data)
      }
    );
  }

  async updateProject(data) {
    await this.refreshTokenIfExpired();
    return this.fetchOk(
      `${this.gls_api}/projects/${this.project}`,
      {
        method: 'PATCH',
        headers: this.authAndJSONHeaders(),
        body: JSON.stringify(data)
      }
    );
  }

  async getPlayers() {
    return this.fetchJSON(`${this.gls_api}/projects/${this.project}/players`);
  }

  async addPlayer() {
    await this.refreshTokenIfExpired();
    return this.fetchOk(
      `${this.gls_api}/projects/${this.project}/players`,
      {
        method: 'PUT',
        headers: this.authHeaders()
      }
    );
  }

  async removePlayer() {
    await this.refreshTokenIfExpired();
    return this.fetchOk(
      `${this.gls_api}/projects/${this.project}/players`,
      {
        method: 'DELETE',
        headers: this.authHeaders()
      }
    );
  }

  async addOwners(owners) {
    await this.refreshTokenIfExpired();
    return this.fetchOk(
      `${this.gls_api}/projects/${this.project}/owners`,
      {
        method: 'PUT',
        headers: this.authJSONHeaders(),
        body: JSON.stringify({ 'users': owners })
      }
    );
  }

  async removeOwners(owners) {
    await this.refreshTokenIfExpired();
    return this.fetchOk(
      `${this.gls_api}/projects/${this.project}/owners`,
      {
        method: 'DELETE',
        headers: this.authJSONHeaders(),
        body: JSON.stringify({ 'users': owners })
      }
    );
  }

  async addPackage(pkg) {
    await this.refreshTokenIfExpired();
    const data = {'description': ''};
    return this.fetchOk(
      `${this.gls_api}/projects/${this.project}/packages/${pkg}`,
      {
        method: 'POST',
        headers: this.authJSONHeaders(),
        body: JSON.stringify(data)
      }
    );
  }

  async addRelease(pkg, version) {
    await this.refreshTokenIfExpired();
    return this.fetchOk(
      `${this.gls_api}/projects/${this.project}/packages/${pkg}/${version}`,
      {
        method: 'POST',
        headers: this.authHeaders()
      }
    );
  }

  static UPLOAD_OK = UPLOAD_OK;

  static UPLOAD_ABORTED = UPLOAD_ABORTED;

  async addFile(pkg, version, file) {
    await this.refreshTokenIfExpired();
    return doUpload(
      file,
      'application/octet-stream',
      `${this.gls_api}/projects/${this.project}/packages/${pkg}/${version}/${file.name}`,
      this.token
    );
  }

  async addImage(imgname, file, type) {
    await this.refreshTokenIfExpired();
    return doUpload(
      file,
      type,
      `${this.gls_api}/projects/${this.project}/images/${imgname}`,
      this.token
    );
  }

  imageUrl(filename) {
    return `${this.gls_api}/projects/${this.project}/images/${filename}`;
  }

  async addFlag(flag, message) {
    await this.refreshTokenIfExpired();
    return this.fetchOk(
      `${this.gls_api}/projects/${this.project}/flag`,
      {
        method: 'POST',
        headers: this.authJSONHeaders(),
        body: JSON.stringify({ 'flag': flag, 'message': message })
      }
    );
  }
}

export default Client;
