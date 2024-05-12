async function getProject(api, project) {
  return fetchJSON(`${api}/projects/${project}`);
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

async function addImage(api, project, imgname, file, type, token) {
  return uploadFile(
    file,
    type,
    `${api}/projects/${project}/images/${imgname}`,
    token
  );
}

function imageUrl(api, project, filename) {
  return `${api}/projects/${project}/images/${filename}`;
}

async function addRelease(api, project, pkg, version, file, type, token) {
  return uploadFile(
    file,
    type,
    `${api}/projects/${project}/packages/${pkg}/${version}`,
    token
  );
}

class Client {
  constructor(api, project) {
    this.api = api;
    this.project = project;
  }

  async getProject() {
    return getProject(this.api, this.project);
  }

  async updateProject(data, token) {
    return updateProject(this.api, this.project, data, token);
  }

  async getPlayers() {
    return getPlayers(this.api, this.project);
  }

  async addPlayer(token) {
    return addPlayer(this.api, this.project, token);
  }

  async removePlayer(token) {
    return removePlayer(this.api, this.project, token);
  }

  async addOwners(owners, token) {
    return addOwners(this.api, this.project, owners, token);
  }

  async removeOwners(owners, token) {
    return removeOwners(this.api, this.project, owners, token);
  }

  async addPackage(pkg, token) {
    const data = {'description': ''};
    return addPackage(this.api, this.project, pkg, data, token);
  }

  async addImage(imgname, file, type, token) {
    return addImage(this.api, this.project, imgname, file, type, token);
  }

  imageUrl(filename) {
    return imageUrl(this.api, this.project, filename);
  }

  async addRelease(pkg, version, file, type, token) {
    return addRelease(this.api, this.project, pkg, version, file, type, token);
  }
}
