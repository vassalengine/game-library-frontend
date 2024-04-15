function getCookie(name) {
  return document.cookie.split('; ')
    .find((c) => c.startsWith(`${name}=`))
    ?.split('=')[1];
}

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
      body: JSON.stringify({ "users": owners })
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
      body: JSON.stringify({ "users": owners })
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

function formatSizeWithUnit(n) {
  const k = n > 0 ? Math.floor((Math.log2(n) / 10)) : 0;
  const unit = (k > 0 ? 'KMGT'[k - 1] + 'i' : '') + 'B';
  const count = Math.floor(n / 1024**k);
  return `${count} ${unit}`;
}

function makeUserLink(username, forum) {
  const ums_url = 'http://localhost:4000/api/v1';

  const img = document.createElement('img');
  img.classList.add('avatar', `avatar_${username}`);
  img.loading = "lazy";
  img.src = `${ums_url}/users/${username}/avatar/24`;
  img.width = 24;
  img.height = 24;

  const a = document.createElement('a');
  a.appendChild(img);

  const username_text = document.createTextNode(username);
  a.appendChild(username_text);
  a.href = `${forum}/u/${username}`;

  return a;
}

function populatePlayers(players, username) {
  let user_is_player = false;

  const e_players = document.getElementById('players');

  const get_avatars = [];

  for (const p of players['users']) {
    const li = document.createElement('li');
    li.appendChild(makeUserLink(p));
    e_players.appendChild(li);

    if (p === username) {
      user_is_player = true;
    }

//    const img = document.createElement('img');

/*
//    const user_url = `https://forum.vassalengine.org/u/${p}.json`;
    const user_url = `http://localhost:4000/api/v1/user/${p}/avatar`;
    get_avatars.push(
      fetch(user_url)
        .then((response) => response.json())
        .then((user_json) => {
          const img_path = user_json.replace('{size}', '48');
          img.src = `https://forum.vassalengine.org/${img_path}`;
        })
    );
*/

/*
    const a = document.createElement('a');
    a.appendChild(img);

    const p_name = document.createTextNode(p);
    a.appendChild(p_name);
    a.href = `https://forum.vassalengine.org/u/${p}`;

    const li = document.createElement('li');
    li.appendChild(a);
    e_players.appendChild(li);
*/
  }

//  await Promise.all(get_avatars);

  if (username !== null) {
    const add_button = document.getElementById('add_player_button');
    const remove_button = document.getElementById('remove_player_button');

    add_button.style.display = user_is_player ? 'none' : 'inline';
    remove_button.style.display = user_is_player ? 'inline' : 'none';
  }

}

function hideEditLinks() {
  for (const ed of document.querySelectorAll('.edit_link')) {
    ed.classList.remove('is_editable');
  }
}

function showEditLinks() {
  for (const ed of document.querySelectorAll('.edit_link')) {
    ed.classList.add('is_editable');
  }
}

function startEditGameSection(proj) {
  const inner = document.getElementById('game_section_inner');
  inner.replaceWith(makeGameSectionEditor(proj));
  hideEditLinks();
}

function cancelEditGameSection(proj, username) {
  const inner = document.getElementById('game_section_inner');
  inner.replaceWith(makeGameSection(proj, username));
  showEditLinks();
}

function startEditProjectSection(proj) {
  console.log("PROJECT SECTION EDIT MODE!");
  hideEditLinks();
}

function cancelEditProjectSection(proj) {
  console.log("PROJECT SECTION EDIT MODE!");
  showEditLinks();
}

function startEditPackagesSection(proj) {
  const packages_list = document.getElementById('packages_list');
  packages_list.prepend(makeNewPackageBox(proj));
  hideEditLinks();
}

function cancelEditPackagesSection(proj) {

  showEditLinks();
}

function startEditReadmeSection(proj) {
  console.log("README SECTION EDIT MODE!");
  hideEditLinks();
}

function cancelEditReadmeSection(proj) {
  console.log("README SECTION EDIT MODE!");
  showEditLinks();
}

function makeGameSection(proj, username) {
  const tmpl = document.querySelector('#game_section_tmpl');
  const inner = document.importNode(tmpl.content.firstElementChild, true);

  // image
  const e_box_image = inner.querySelector('#box_image');
  e_box_image.src = `${api}/projects/${project}/images/${proj['image']}`;

  // title
  const e_title = inner.querySelector('#game_title');
  e_title.textContent = proj['game']['title'];
  document.title = `${proj['game']['title']} - Module Library - Vassal`;

  // publisher
  const e_publisher = inner.querySelector('#game_publisher');
  e_publisher.textContent = proj.game.publisher;

  // year
  const e_year = inner.querySelector('#game_year');
  e_year.textContent = proj.game.year;

  // description
  const e_description =  inner.querySelector('#description');
  e_description.textContent = proj['description'];

  if (proj['owners'].includes(username)) {
    // edit game section
    const ed = inner.querySelector('.edit_link');
    ed.classList.add('is_editable');
    ed.addEventListener('click', (e) => startEditGameSection(proj, username));
  }

  return inner;
}

function makeGameSectionEditor(proj, username) {
  const tmpl = document.querySelector('#game_section_edit_tmpl');
  const inner = document.importNode(tmpl.content.firstElementChild, true);

  // image
  const e_box_image = inner.querySelector('#box_image');
  e_box_image.src = `${api}/projects/${project}/images/${proj['image']}`;

  // title
  const e_title = inner.querySelector('#game_title_input');
  e_title.value = proj['game']['title'];
//  document.title = `${proj['game']['title']} - Module Library - Vassal`;

  // publisher
  const e_publisher = inner.querySelector('#game_publisher_input');
  e_publisher.value = proj.game.publisher;

  // year
  const e_year = inner.querySelector('#game_year_input');
  e_year.value = proj.game.year;

  // description
  const e_description = inner.querySelector('#description_input');
  e_description.value = proj['description'];

  // cancel
  const cancel = inner.querySelector('#cancel');
  cancel.addEventListener('click', (e) => cancelEditGameSection(proj, username));

  return inner;
}

function makeProjectSection(proj, rtf, now) {
  const tmpl = document.querySelector('#project_section_tmpl');
  const inner = document.importNode(tmpl.content.firstElementChild, true);

  const e_name = inner.querySelector('#name');
  e_name.textContent = proj.name;

  const e_created_at = inner.querySelector('#project_created_at');
  e_created_at.dateTime = proj.created_at;

  const e_created_rel = inner.querySelector('#project_created_rel');
  e_created_rel.textContent = intlFormatDistance(rtf, new Date(proj.created_at), now);

  const e_modified_at = inner.querySelector('#project_modified_at');
  e_modified_at.dateTime = proj.modified_at;

  const e_modified_rel = inner.querySelector('#project_modified_rel');
  e_modified_rel.textContent = intlFormatDistance(rtf, new Date(proj.modified_at), now);

  const e_tags = inner.querySelector('#tags');
  for (const t of proj['tags']) {
    const li = document.createElement('li');
    li.textContent = '#' + t;
    e_tags.appendChild(li);
  }

  const e_owners = inner.querySelector('#owners');
  for (const o of proj['owners']) {
    const li = document.createElement('li');
    li.appendChild(makeUserLink(o));
    e_owners.appendChild(li);
  }

  return inner;
}

function makeNewPackageBox(proj) {
  const tmpl = document.querySelector('#package_new_tmpl');
  const inner = document.importNode(tmpl.content.firstElementChild, true);
  return inner;
}

function populateProject(proj, username) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();

  //
  // game section
  //

  const game_section = document.getElementById('game_section');
  game_section.appendChild(makeGameSection(proj, username));

  //
  // project section
  //

  const project_section = document.getElementById('project_section');
  project_section.appendChild(makeProjectSection(proj, rtf, now));


  //
  // packages section
  //

  const packageTemplate = document.querySelector('#package_tmpl');
  const releaseTemplate = document.querySelector('#release_tmpl');

  const e_packages = document.getElementById('packages_list');

  for (const [pi, p] of proj['packages'].entries()) {
    const pkg_t = document.importNode(packageTemplate.content, true);

    const pkg = pkg_t.querySelector('.package_tmpl_top');

    const div_pkg_name = pkg.querySelector('.package_tmpl_name');
    div_pkg_name.textContent = p.name;

    const div_pkg_desc = pkg.querySelector('.package_tmpl_description');
    div_pkg_desc.textContent = p.description;

    if (p.releases.length < 2) {
      const old_details = pkg.querySelector('.package_tmpl_releases_older_details');
      old_details.hidden = true;
    }

    const ul_ver = pkg.querySelector('.package_tmpl_releases');
    const ul_ver_old = pkg.querySelector('.package_tmpl_releases_older');

    for (const [vi, v] of p.releases.entries()) {
      const release = document.importNode(releaseTemplate.content, true);

      const div_ver = release.querySelector('.release_tmpl_version');
      div_ver.textContent = v.version;
      if (vi === 0) {
        div_ver.classList.add('current_release');
      }
      else {
        div_ver.classList.add('release');
      }

      const a_file = release.querySelector('.release_tmpl_filename');
      a_file.textContent = v.filename;
      a_file.href = v.url;

      const div_size = release.querySelector('.release_tmpl_size');
      div_size.textContent = formatSizeWithUnit(v.size);

      const sp_requires = release.querySelector('.release_tmpl_requires');
      sp_requires.textContent = v.requires === '' ? 'Unknown' : v.requires;

      const sp_pub_by = release.querySelector('.release_tmpl_published_by');
      sp_pub_by.appendChild(makeUserLink(v.published_by));

      const time_time = release.querySelector('.release_tmpl_published_at');
      time_time.dateTime = v.published_at;

      const sp_reltime = release.querySelector('.release_tmpl_published_rel');
      sp_reltime.textContent = intlFormatDistance(rtf, new Date(v.published_at), now);

      (vi === 0 ? ul_ver : ul_ver_old).appendChild(release);
    }

    e_packages.appendChild(pkg);
  }

  //
  // readme
  //

  const e_readme = document.getElementById('readme');

  // TODO: sanitize all input from JSON API
  e_readme.innerHTML = DOMPurify.sanitize(marked.parse(proj['readme']));

  //
  // enable edit links for owners
  //

  if (proj['owners'].includes(username)) {
    {
      // edit project section
      const ed = document.querySelector('#project_section .edit_link');
      ed.classList.add('is_editable');
      ed.addEventListener('click', (e) => startEditProjectSection(proj));
    }

    // add package
    {
      const ed = document.querySelector('#packages_section .edit_link');
      ed.classList.add('is_editable');
      ed.addEventListener('click', (e) => startEditPackagesSection(proj));
    }

    // add release

    {
      // edit readme
      const ed = document.querySelector('#readme_section .edit_link');
      ed.classList.add('is_editable');
      ed.addEventListener('click', (e) => startEditReadmeSection(proj));
    }
  }
}

const project_script_data = document.getElementById('project-script').dataset;
const api = project_script_data.api;
const username = project_script_data.username ?? null;

const project = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);

const sections = [
  [
    `${api}/projects/${project}`,
    (proj) => populateProject(proj, username),
    'project_content'
  ],
  [
    `${api}/projects/${project}/players`,
    (players) => populatePlayers(players, username),
    'players_content'
  ]
];

Promise.allSettled(
  sections.map((item, i) => fetchJSON(item[0]).then(item[1]))
).then((results) => {
  results.forEach((result, i) => {
    if (result.status !== 'fulfilled') {
      handleError(result.reason, sections[i][2]);
    }
  });
});
