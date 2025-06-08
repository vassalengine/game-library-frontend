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

class Client {
  constructor(api, project, token, refresh) {
    this.api = api;
    this.project = project;
    this.token = token,
    this.refresh = refresh;
  }

  async getProject() {
    return getProject(this.api, this.project);
  }

  async createProject(data) {
    return createProject(this.api, this.project, data, this.token);
  }

  async updateProject(data) {
    return updateProject(this.api, this.project, data, this.token);
  }

  async getPlayers() {
    return getPlayers(this.api, this.project);
  }

  async addPlayer() {
    return addPlayer(this.api, this.project, this.token);
  }

  async removePlayer() {
    return removePlayer(this.api, this.project, this.token);
  }

  async addOwners(owners) {
    return addOwners(this.api, this.project, owners, this.token);
  }

  async removeOwners(owners) {
    return removeOwners(this.api, this.project, owners, this.token);
  }

  async addPackage(pkg) {
    const data = {'description': ''};
    return addPackage(this.api, this.project, pkg, data, this.token);
  }

  async addRelease(pkg, version) {
    return addRelease(this.api, this.project, pkg, version, this.token);
  }

  async addFile(pkg, version, file) {
    return addFile(this.api, this.project, pkg, version, file.name, file, 'application/octet-stream', this.token);
  }

  async addImage(imgname, file, type) {
    return addImage(this.api, this.project, imgname, file, type, this.token);
  }

  imageUrl(filename) {
    return imageUrl(this.api, this.project, filename);
  }

  async addFlag(flag, message) {
    return addFlag(this.api, this.project, flag, message, this.token);
  }
}

export default Client;
