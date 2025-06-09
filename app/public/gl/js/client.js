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

async function checkError(response) {
  if (!response.ok) {
    const json = await response.json();
    const message = json?.error ?? json.toString();
    throw new APIError(response.status, response.statusText, message);
  }
}

export async function fetchJSON(url, options={}) {
  const response = await fetch(url, options);
  await checkError(response);
  return response.json();
}

async function fetchOk(url, options={}) {
  const response = await fetch(url, options);
  await checkError(response);
}

async function getProject(api, project) {
  return fetchJSON(`${api}/projects/${project}`);
}

async function createProject(api, project, data, token) {
  return fetchOk(
    `${api}/projects/${project}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );
}

async function updateProject(api, project, data, token) {
  return fetchOk(
    `${api}/projects/${project}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );
}

async function getPlayers(api, project) {
  return fetchJSON(`${api}/projects/${project}/players`);
}

async function addPlayer(api, project, token) {
  return fetchOk(
    `${api}/projects/${project}/players`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
}

async function removePlayer(api, project, token) {
  return fetchOk(
    `${api}/projects/${project}/players`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
}

async function addOwners(api, project, owners, token) {
  return fetchOk(
    `${api}/projects/${project}/owners`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'users': owners })
    }
  );
}

async function removeOwners(api, project, owners, token) {
  return fetchOk(
    `${api}/projects/${project}/owners`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'users': owners })
    }
  );
}

async function addPackage(api, project, pkg, data, token) {
  return fetchOk(
    `${api}/projects/${project}/packages/${pkg}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );
}

async function addRelease(api, project, pkg, version, token) {
  return fetchOk(
    `${api}/projects/${project}/packages/${pkg}/${version}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
}

function uploadFile(file, type, url, token) {
  return new Promise((resolve, reject) => {
    console.log(file.size);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        console.log('upload progress:', e.loaded / e.total);
      }
    });

    xhr.addEventListener('load', () => {
      const result = {
        status: xhr.status,
        statusText: xhr.statusText,
        response: xhr.response
      };

      (xhr.status === 200 ? resolve : reject)(result);
    });

    xhr.addEventListener('error', () => {
      const result = {
        status: xhr.status,
        statusText: xhr.statusText,
        response: xhr.response
      };

      reject(result);
    });

    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', type);
    xhr.send(file);
  });
}

async function addFile(api, project, pkg, version, filename, file, type, token) {
  try {
    return await uploadFile(
      file,
      type,
      `${api}/projects/${project}/packages/${pkg}/${version}/${filename}`,
      token
    );
  }
  catch (result) {
    const message = JSON.parse(result.response)?.error;
    throw new APIError(result.status, result.statusText, message);
  }
}

async function addImage(api, project, imgname, file, type, token) {
  try {
    return await uploadFile(
      file,
      type,
      `${api}/projects/${project}/images/${imgname}`,
      token
    );
  }
  catch (result) {
    const message = JSON.parse(result.response)?.error;
    throw new APIError(result.status, result.statusText, message);
  }
}

function imageUrl(api, project, filename) {
  return `${api}/projects/${project}/images/${filename}`;
}

async function addFlag(api, project, flag, message, token) {
  return fetchOk(
    `${api}/projects/${project}/flag`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'flag': flag, 'message': message })
    }
  );
}

function isTokenExpired(token) {
  // Date.now() is milliseconds, token exp is seconds
  return Date.now() / 1000 >= parseJWT(token).exp
}

async function refreshAccessToken(api, refresh_token) {
  return fetchJSON(
    `${api}/refresh`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refresh_token}`
      }
    }
  );
}

class Client {
  constructor(gls_api, ums_api, project, token, refresh) {
    this.gls_api = gls_api;
    this.ums_api = ums_api;
    this.project = project;
    this.token = token;
    this.refresh = refresh;
  }

  async refreshTokenIfExpired() {
    if (isTokenExpired(this.token)) {
      this.token = await refreshAccessToken(this.ums_api, this.refresh).token;
      const parsed_token = parseJWT(this.token);
      const max_age = parsed_token.exp - Date.now() / 1000;
      setCookie('token', this.token, { 'max-age': max_age, secure: true });
    }
  }

  async getProject() {
    return getProject(this.gls_api, this.project);
  }

  async createProject(data) {
    await this.refreshTokenIfExpired();
    return createProject(this.gls_api, this.project, data, this.token);
  }

  async updateProject(data) {
    await this.refreshTokenIfExpired();
    return updateProject(this.gls_api, this.project, data, this.token);
  }

  async getPlayers() {
    return getPlayers(this.gls_api, this.project);
  }

  async addPlayer() {
    await this.refreshTokenIfExpired();
    return addPlayer(this.gls_api, this.project, this.token);
  }

  async removePlayer() {
    await this.refreshTokenIfExpired();
    return removePlayer(this.gls_api, this.project, this.token);
  }

  async addOwners(owners) {
    await this.refreshTokenIfExpired();
    return addOwners(this.gls_api, this.project, owners, this.token);
  }

  async removeOwners(owners) {
    await this.refreshTokenIfExpired();
    return removeOwners(this.gls_api, this.project, owners, this.token);
  }

  async addPackage(pkg) {
    await this.refreshTokenIfExpired();
    const data = {'description': ''};
    return addPackage(this.gls_api, this.project, pkg, data, this.token);
  }

  async addRelease(pkg, version) {
    await this.refreshTokenIfExpired();
    return addRelease(this.gls_api, this.project, pkg, version, this.token);
  }

  async addFile(pkg, version, file) {
    await this.refreshTokenIfExpired();
    return addFile(this.gls_api, this.project, pkg, version, file.name, file, 'application/octet-stream', this.token);
  }

  async addImage(imgname, file, type) {
    await this.refreshTokenIfExpired();
    return addImage(this.gls_api, this.project, imgname, file, type, this.token);
  }

  imageUrl(filename) {
    return imageUrl(this.gls_api, this.project, filename);
  }

  async addFlag(flag, message) {
    await this.refreshTokenIfExpired();
    return addFlag(this.gls_api, this.project, flag, message, this.token);
  }
}

export default Client;
