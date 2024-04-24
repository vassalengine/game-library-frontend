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

function makeUserLink(username, ums) {
  const img = document.createElement('img');
  img.classList.add('avatar', `avatar_${username}`);
  img.loading = 'lazy';
  const size = 24;
  img.src = `${ums}/users/${username}/avatar/${size}`;
  img.width = size;
  img.height = size;

  const a = document.createElement('a');
  a.appendChild(img);

  const username_text = document.createTextNode(username);
  a.appendChild(username_text);
  a.href = `${ums}/users/${username}`;

  return a;
}

function makePlayerItem(username, ums) {
  const li = document.createElement('li');
  li.id = `player_${username}`;
  li.appendChild(makeUserLink(username, ums));
  return li;
}

async function populatePlayers(players, config) {
  const { username, ums } = config;

  let user_is_player = false;

  const e_players = document.getElementById('players');

  for (const p of players.users) {
    const li = makePlayerItem(p, ums);
    e_players.appendChild(li);

    if (p === username) {
      user_is_player = true;
    }
  }

  return user_is_player;
}

function hideEditLinks() {
  for (const ed of document.querySelectorAll('.edit_button')) {
    ed.classList.remove('is_editable');
  }
}

function showEditLinks() {
  for (const ed of document.querySelectorAll('.edit_button')) {
    ed.classList.add('is_editable');
  }
}

function makeGameSection(proj, client) {
  const tmpl = document.querySelector('#game_section_tmpl');
  const inner = document.importNode(tmpl.content.firstElementChild, true);
  updateGameSection(inner, proj, client);
  return inner;
}

function updateGameSection(inner, proj, client) {
  // image
  const e_box_image_container = inner.querySelector('#box_image_container');
  const e_box_image = inner.querySelector('#box_image');
  if (proj.image !== null) {
    e_box_image.src = client.imageUrl(proj.image);
    e_box_image_container.classList.remove('no_image');
  }
  else {
    e_box_image.src = '';
    e_box_image_container.classList.add('no_image');
  }

// TODO: field for sort key
// TODO: suggest sort key

  // title
  const e_title = inner.querySelector('#game_title');
  e_title.textContent = proj.game.title;
  document.title = `${proj.game.title} - Module Library - Vassal`;

  // publisher
  const e_publisher = inner.querySelector('#game_publisher');
  e_publisher.textContent = proj.game.publisher;

  // year
  const e_year = inner.querySelector('#game_year');
  e_year.textContent = proj.game.year;

  // hide the comma if one of publisher and year are blank
  const e_pub_year_sep = inner.querySelector('#game_publisher_year_sep');
  e_pub_year_sep.hidden = proj.game.publisher === '' || proj.game.year === '';

  // description
  const e_description =  inner.querySelector('#description');
  e_description.textContent = proj.description;
}

function makeGameSectionEditor(proj, client) {
  const tmpl = document.querySelector('#game_section_edit_tmpl');
  const inner = document.importNode(tmpl.content.firstElementChild, true);

  // image
  const e_box_image = inner.querySelector('#box_image');
  const e_box_image_container = inner.querySelector('#box_image_container');
  if (proj.image !== null) {
    e_box_image.src = client.imageUrl(proj.image);
    e_box_image_container.classList.remove('no_image');
  }
  else {
    e_box_image.src = '';
    e_box_image_container.classList.add('no_image');
  }

  // title
  const e_title = inner.querySelector('#game_title_input');
  e_title.value = proj.game.title;

  // publisher
  const e_publisher = inner.querySelector('#game_publisher_input');
  e_publisher.value = proj.game.publisher;

  // year
  const e_year = inner.querySelector('#game_year_input');
  e_year.value = proj.game.year;

  // description
  const e_description = inner.querySelector('#description_input');
  e_description.value = proj.description;

  return inner;
}

/*

fn split_title_sort_key(title: &str) -> (&str, Option<&str>) {
    match title.split_once(' ') {
        // Probably Spanish or French, "A" is not an article
        Some(("A", rest)) if rest.starts_with("la") => (title, None),
        // Put leading article at end
        Some(("A", rest)) => (rest, Some("A")),
        Some(("An", rest)) => (rest, Some("An")),
        Some(("The", rest)) => (rest, Some("The")),
        // Doesn't start with an article
        Some(_) | None => (title, None)
    }
}

fn title_sort_key(title: &str) -> String {
    match split_title_sort_key(title) {
        (_, None) => title.into(),
        (rest, Some(art)) => format!("{rest}, {art}")
    }
}

*/

function startEditGameSection(proj, client) {
  const game_sec = document.getElementById('game_section_inner');
  const game_ed = makeGameSectionEditor(proj, client);

  // set box image
  const box_img_container = game_ed.querySelector('#box_image_container');
  const box_img_clear = game_ed.querySelector('#box_image_clear');
  const box_img = game_ed.querySelector('#box_image');

  const img_loaded = () => {
    URL.revokeObjectURL(box_img.src);
    box_img_container.classList.remove('no_image');
    box_img_clear.value = false;
  };

  const img_cleared = () => {
    box_img.src = '';
    box_img_container.classList.add('no_image');
    box_img_clear.value = true;
  };

  const load_if_image = (file) => {
    if (file.type.startsWith('image/')) {
      box_img.src = URL.createObjectURL(file);
      box_img.onload = img_loaded;
    }
  };

  const box_img_label = game_ed.querySelector('#box_image_label');

  box_img_label.addEventListener('dragenter', (e) => {
    e.stopPropagation();
    e.preventDefault();
  });

  box_img_label.addEventListener('dragover', (e) => {
    e.stopPropagation();
    e.preventDefault();
  });

  box_img_label.addEventListener('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.dataTransfer;
    const file = dt.files[0];

    load_if_image(file);
  });

  const box_img_input = game_ed.querySelector('#box_image_input');
  box_img_input.addEventListener('change', () => {
    const file = box_img_input.files[0];
    load_if_image(file);
  });

  const box_img_delete = game_ed.querySelector('#box_image_delete');
  box_img_delete.addEventListener('click', img_cleared);

  // update
  const form = game_ed.querySelector('#game_section_form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitEditGameSection(form, proj, client, game_sec);
  });

  // cancel
  const cancel = game_ed.querySelector('#cancel');
  cancel.addEventListener('click', () => stopEditGameSection(game_sec));

  game_sec.replaceWith(game_ed);
  hideEditLinks();
}

async function submitEditGameSection(form, proj, client, game_sec) {
  // build the request
  const fdata = new FormData(form);
  const data = { game: {} };

  const description = fdata.get('description');
  if (description !== proj.description) {
    data.description = description;
  }

  for (const k of ['title', 'publisher', 'year']) {
    const fv = fdata.get(`game_${k}`);
    if (fv !== proj.game[k]) {
      data.game[k] = fv;
    }
  }

  console.log(fdata);

  const box_image = fdata.get('box_image');
  if (box_image.name !== '') {
    data.image = box_image.name;
  }
  else if (fdata.get('box_image_clear') === 'true') {
    data.image = null;
  }

  // do nothing if no changes were made
  if (Object.keys(data.game).length === 0 && Object.keys(data).length === 1) {
    stopEditGameSection(game_sec);
    return;
  }

  const token = getCookie('token');

  if (data.image) {
    data.image = box_image.name;

    try {
      await client.addImage(
        box_image.name,
        box_image,
        box_image.type,
        token
      );
    }
    catch (error) {
      handleErrorBefore(error, 'game_section_form');
      return;
    }
  }

  try {
    await client.updateProject(data, token);
  }
  catch (error) {
    handleErrorBefore(error, 'game_section_form');
    return;
  }

  // update the project data
  proj.game = { ...proj.game, ...data.game };

  if (data.description) {
    proj.description = data.description;
  }

  if (data.image !== undefined) {
    proj.image = data.image;
  }

  updateGameSection(game_sec, proj, client);
  stopEditGameSection(game_sec);
}

function stopEditGameSection(game_sec) {
  const game_ed = document.getElementById('game_section_inner');
  game_ed.replaceWith(game_sec);
  showEditLinks();
}

function updateProjectSection(inner, proj, rtf, now, ums) {
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
  e_tags.replaceChildren(
    ...proj.tags.map((t) => {
      const li = document.createElement('li');
      li.textContent = '#' + t;
      return li;
    })
  );

  const e_owners = inner.querySelector('#owners');
  e_owners.replaceChildren(
    ...proj.owners.map((o) => {
      const li = document.createElement('li');
      li.appendChild(makeUserLink(o, ums));
      return li;
    })
  );
}

function makeProjectSection(proj, rtf, now, ums) {
  const tmpl = document.querySelector('#project_section_tmpl');
  const inner = document.importNode(tmpl.content.firstElementChild, true);
  updateProjectSection(inner, proj, rtf, now, ums);
  return inner;
}

function makeProjectSectionEditor(proj) {
  const tmpl = document.querySelector('#project_section_edit_tmpl');
  const inner = document.importNode(tmpl.content.firstElementChild, true);

  const owners = UseBootstrapTag(inner.querySelector('#owners_input'));
  owners.addValue(proj.owners);

  return [inner, owners];
}

function startEditProjectSection(proj, username, rtf, now, ums, client) {
  const proj_sec = document.getElementById('project_section_inner');
  const [proj_ed, owners] = makeProjectSectionEditor(proj);

// TODO: make autocomplete look like Discourse's, with avatars
// FIXME: Enter doesn't create chit
  const input = proj_ed.querySelector('.input-wrapper input');
  input.id = 'newowner';
  input.name = 'newowner';

  const ac = document.createElement('auto-complete');
  ac.id = 'newownerauto';
  ac.resultdata = 'users';
  ac.resultname = 'username';
  ac.querymin = 2;
  ac.optionmax = 100;
  ac.inputdelay = 200;

  const par = input.parentNode;
  ac.appendChild(input);
  par.appendChild(ac);

  // TODO: prevent removal of last owner
  // TODO: prevent addition of duplicate owners

  // update
  const form = proj_ed.querySelector('#project_section_form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitEditProjectSection(proj, owners, client, proj_sec, rtf, now, ums);
  });

  // cancel
  const cancel = proj_ed.querySelector('#cancel');
  cancel.addEventListener('click', () => stopEditProjectSection(proj_sec));

  proj_sec.replaceWith(proj_ed);

  // auto-complete element must be in the DOM when its api is updated,
  // and setting it directly doesn't work; setAttribute must be used.
  ac.setAttribute('api', `${ums}/users?term=\${newowner}&include_groups=false&limit=6`);

  hideEditLinks();
}

async function submitEditProjectSection(proj, owners, client, proj_sec, rtf, now, ums) {
  const cur_owners = new Set(owners.getValues());
  const prev_owners = new Set(proj.owners);
  const to_add = [...[...cur_owners.values()].filter((u) => !prev_owners.has(u))];
  const to_remove = [...[...prev_owners.values()].filter((u) => !cur_owners.has(u))];

  const token = getCookie('token');

  try {
    if (to_add) {
      await client.addOwners(to_add, token);
    }

    if (to_remove) {
      await client.removeOwners(to_remove, token);
    }
  }
  catch (error) {
    handleErrorBefore(error, 'project_section_form');
    return;
  }

  proj.owners = [...cur_owners];
  updateProjectSection(proj_sec, proj, rtf, now, ums);
  stopEditProjectSection(proj_sec);

  // user can stop being an owner
  const user_is_owner = proj.owners.includes(username);
  if (!user_is_owner) {
    hideEditLinks();
  }
}

function stopEditProjectSection(proj_sec) {
  const proj_ed = document.getElementById('project_section_inner');
  proj_ed.replaceWith(proj_sec);
  showEditLinks();
}

function makePackageSection(pkg, user_is_owner, client, pkg_t, release_t, ums, rtf, now) {
  const inner = document.importNode(pkg_t.content.firstElementChild, true);

  const div_pkg_name = inner.querySelector('.package_tmpl_name');
  div_pkg_name.textContent = pkg.name;

  const div_pkg_desc = inner.querySelector('.package_tmpl_description');
  div_pkg_desc.textContent = pkg.description;

  if (pkg.releases.length < 2) {
    const old_details = inner.querySelector('.package_tmpl_releases_older_details');
    old_details.hidden = true;
  }

  const ul_ver = inner.querySelector('.package_tmpl_releases');

  const itr = pkg.releases.values();
  let item = itr.next();
  if (!item.done) {
    // current release
    const release = makeRelease(item.value, release_t, true, ums, rtf, now);
    ul_ver.appendChild(release);

    // older releases
    item = itr.next();
    if (!item.done) {
      const ul_ver_old = inner.querySelector('.package_tmpl_releases_older');
      do {
        const release = makeRelease(item.value, release_t, false, ums, rtf, now);
        ul_ver_old.appendChild(release);
        item = itr.next();
      } while (!item.done);
    }
  }

  // add release
  if (user_is_owner) {
    const ed = inner.querySelector('.edit_button');
// TODO: must pass on pkg
    ed.addEventListener('click', () => startEditReleaseSection(ul_ver, client));
  }

  return inner;
}

function makeNewPackageBox() {
// TODO: reject duplicate package
  const tmpl = document.querySelector('#package_new_tmpl');
  return document.importNode(tmpl.content.firstElementChild, true);
}

function startEditPackageSection(client) {
  const packages_list = document.getElementById('packages_list');
  const package_new = makeNewPackageBox();

  // create
  const form = package_new.querySelector('#package_new_form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitEditPackageSection(form, client);
  });

  // cancel
  const cancel = package_new.querySelector('#cancel_new_package');
  cancel.addEventListener('click', () => removeNewPackageSection());

  packages_list.prepend(package_new);
  hideEditLinks();
}

async function submitEditPackageSection(form, client) {
  const pkg = new FormData(form).get('package_name');
  try {
    await client.addPackage(pkg, getCookie('token'));
  }
  catch (error) {
    handleErrorBefore(error, 'package_new_form');
    return;
  }

  const packageTemplate = document.querySelector('#package_tmpl');
  const e_packages = document.getElementById('packages_list');
  e_packages.appendChild(
    makePackageSection(
      {
        name: pkg,
        description: '',
        releases: []
      },
      true,
      client,
      packageTemplate,
      null,
      null,
      null,
      null
    )
  );

// TODO: update proj?

  removeNewPackageSection();
}

function removeNewPackageSection() {
  const package_new = document.getElementById('package_new');
  package_new.remove();
  showEditLinks();
}

function makeRelease(release, release_t, current, ums, rtf, now) {
  const inner = document.importNode(release_t.content.firstElementChild, true);

  const div_ver = inner.querySelector('.release_tmpl_version');
  div_ver.textContent = release.version;
  div_ver.classList.add(current ? 'current_release' : 'release');

  const a_file = inner.querySelector('.release_tmpl_filename');
  a_file.textContent = release.filename;
  a_file.href = release.url;

  const div_size = inner.querySelector('.release_tmpl_size');
  div_size.textContent = formatSizeWithUnit(release.size);

  const sp_requires = inner.querySelector('.release_tmpl_requires');
  sp_requires.textContent = release.requires === '' ? 'Unknown' : release.requires;

  const sp_pub_by = inner.querySelector('.release_tmpl_published_by');
  sp_pub_by.appendChild(makeUserLink(release.published_by, ums));

  const time_time = inner.querySelector('.release_tmpl_published_at');
  time_time.dateTime = release.published_at;

  const sp_reltime = inner.querySelector('.release_tmpl_published_rel');
  sp_reltime.textContent = intlFormatDistance(rtf, new Date(release.published_at), now);

  return inner;
}

function makeNewReleaseBox() {
  const tmpl = document.querySelector('#release_new_tmpl');
  return document.importNode(tmpl.content.firstElementChild, true);
}

function startEditReleaseSection(list, client) {
  const release_new = makeNewReleaseBox();

  // create
  const form = release_new.querySelector('#release_new_form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitNewReleaseSection(form, client);
  });

////

/*
    const url = 'https://httpbin.org/post';
    await uploadFile(release_file, 'application/octet-stream', url);
*/

    // TODO: display new release
/*
    const release = makeRelease(item.value, release_t, true, ums, rtf, now);

    release_new.replace(release);
*/

  // cancel
  const cancel = release_new.querySelector('#cancel_new_release');
  cancel.addEventListener('click', () => removeNewReleaseSection());

  list.prepend(release_new);
  hideEditLinks();
}

async function submitNewReleaseSection(form, client) {
  const fdata = new FormData(form);
  console.log(fdata);
// HERE
  const release_file = fdata.get('release_file');

  try {
    await client.addRelease(
      '13_Days_Official',
      '1.0.1',
      release_file,
      release_file.type,
      getCookie('token')
    );
  }
  catch (error) {
//      handleErrorBefore(error, 'game_section_form');
    console.log(error);
    return;
  }

}

function removeNewReleaseSection() {
  const release_new = document.getElementById('release_new');
  release_new.remove();
  showEditLinks();
}

function updateReadme(inner, proj, md) {
  // TODO: sanitize all input from JSON API
  inner.innerHTML = DOMPurify.sanitize(md.render(proj.readme));
}

function makeReadme(proj, md) {
  const inner = document.createElement('div');
  inner.id = 'readme';
  updateReadme(inner, proj, md);
  return inner;
}

function updateReadmeResult(source, result, md) {
// TODO: do we need to sanitize here?
  result.innerHTML = md.render(source.value);
}

function makeReadmeEditor(proj, md) {
  const tmpl = document.querySelector('#readme_edit_tmpl');
  const inner = document.importNode(tmpl.content.firstElementChild, true);

  const source = inner.querySelector('#readme_source');
  source.value = proj.readme;

  return inner;
}

function startEditReadmeSection(proj, client, md) {
  const readme_sec = document.getElementById('readme');
  const readme_ed = makeReadmeEditor(proj, md);

// TODO: Add formatting bar like Discourse

  const source = readme_ed.querySelector('#readme_source');
  const result = readme_ed.querySelector('#readme_result');

  // sync result with source while editing
  updateReadmeResult(source, result, md);
  source.addEventListener('input', () => updateReadmeResult(source, result, md));

  // update
  const form = readme_ed.querySelector('#readme_form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitEditReadmeSection(proj, source, client, md, readme_sec);
  });

  // cancel
  const cancel = readme_ed.querySelector('#cancel');
  cancel.addEventListener('click', () => stopEditReadmeSection(readme_sec));

  readme_sec.replaceWith(readme_ed);
  hideEditLinks();
}

async function submitEditReadmeSection(proj, source, client, md, readme_sec) {
  const data = { readme: source.value };

  try {
    await client.updateProject(data, getCookie('token'));
  }
  catch (error) {
    handleErrorBefore(error, 'readme_form');
    return;
  }

  // update the project data
  proj.readme = source.value;

  updateReadme(readme_sec, proj, md);
  stopEditReadmeSection(readme_sec);
}

function stopEditReadmeSection(readme_sec) {
  const readme_ed = document.getElementById('readme');
  readme_ed.replaceWith(readme_sec);
  showEditLinks();
}

function populateProject(proj, config, client) {
  const { md, username, ums, rtf, now } = config;

  const user_is_owner = proj.owners.includes(username);

  //
  // game section
  //

  const game_section = document.getElementById('game_section');
  game_section.appendChild(makeGameSection(proj, client));

  if (user_is_owner) {
    // edit game section
    const ed = game_section.querySelector('.edit_button');
    ed.addEventListener('click', () => startEditGameSection(proj, client));
  }

  //
  // project section
  //

  const project_section = document.getElementById('project_section');
  project_section.appendChild(makeProjectSection(proj, rtf, now, ums));

  if (user_is_owner) {
    // edit project section
    const ed = project_section.querySelector('.edit_button');
    ed.addEventListener('click', () => startEditProjectSection(proj, username, rtf, now, ums, client));
  }

  //
  // packages section
  //

  const packageTemplate = document.querySelector('#package_tmpl');
  const releaseTemplate = document.querySelector('#release_tmpl');

  const e_packages = document.getElementById('packages_list');

  for (const pkg of proj.packages) {
    e_packages.appendChild(
      makePackageSection(
        pkg,
        user_is_owner,
        client,
        packageTemplate,
        releaseTemplate,
        ums,
        rtf,
        now
      )
    );
  }

  if (user_is_owner) {
    // add package
    const ed = document.querySelector('#packages_section .edit_button');
    ed.addEventListener('click', () => startEditPackageSection(client));
  }

  //
  // readme
  //

  const readme_section = document.getElementById('readme_section');
  readme_section.appendChild(makeReadme(proj, md));

  if (user_is_owner) {
    // edit readme
    const ed = readme_section.querySelector('.edit_button');
    ed.addEventListener('click', () => startEditReadmeSection(proj, client, md));
  }

  // enable edit links for owners
  if (user_is_owner) {
    showEditLinks();
  }

  return proj;
}

function updatePlayerAddRemoveButtons(user_is_player) {
  const add_button = document.getElementById('add_player_button');
  const remove_button = document.getElementById('remove_player_button');

  add_button.style.display = user_is_player ? 'none' : 'inline';
  remove_button.style.display = user_is_player ? 'inline' : 'none';
}

function enablePlayerAddRemoveButtons(user_is_player, config, client) {
  const { username, ums } = config;

  const add_button = document.getElementById('add_player_button');
  const remove_button = document.getElementById('remove_player_button');

  add_button.addEventListener('click', async () => {
    try {
      await client.addPlayer(getCookie('token'));
    }
    catch (error) {
      handleErrorBefore(error, 'players');
      return;
    }
    addPlayerToList(username, ums);
  });

  remove_button.addEventListener('click', async () => {
    try {
      await client.removePlayer(getCookie('token'));
    }
    catch (error) {
      handleErrorBefore(error, 'players');
      return;
    }
    removePlayerFromList(username);
  });

  updatePlayerAddRemoveButtons(user_is_player);
}

function addPlayerToList(username, ums) {
  const player_li = makePlayerItem(username, ums);
  document.getElementById('players').appendChild(player_li);
  updatePlayerAddRemoveButtons(true);
}

function removePlayerFromList(username) {
  document.getElementById(`player_${username}`).remove();
  updatePlayerAddRemoveButtons(false);
}

function mdInit() {
  const defaults = {
    html: false,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'language-',
    linkify: true,
    typographer: true,
//    highlight: doHighlight
  };

  const md = window.markdownit(defaults);

//  mdHtml.renderer.rules.paragraph_open = mdHtml.renderer.rules.heading_open = injectLineNumbers;

  return md;
}

(function() {
  const project_script_data = document.getElementById('project-script').dataset;
  const path = window.location.pathname;

  const api = project_script_data.api;
  const username = project_script_data.username ?? null;
  const project = path.substring(path.lastIndexOf('/') + 1);

  const config = {
    md: mdInit(),
    api: api,
    ums: 'http://localhost:4000/api/v1',
    username: username,
    project: project,
    rtf: new Intl.RelativeTimeFormat('en', { numeric: 'auto' }),
    now: new Date()
  };

  const client = new Client(api, project);

  const loadProject = async function() {
    try {
      return await client.getProject();
    }
    catch (error) {
      handleErrorReplace(error, 'project_content');
      throw error;
    }
  };

  const loadPlayers = async function() {
    try {
      return await client.getPlayers();
    }
    catch (error) {
      handleErrorReplace(error, 'players_content');
      throw error;
    }
  };

  Promise.allSettled(
    [
      loadProject().then((proj) => populateProject(proj, config, client)),
      loadPlayers().then((players) => populatePlayers(players, config))
    ]
  ).then((results) => {
    if (results.every((r) => r.status === 'fulfilled')) {
      if (username !== null) {
        const proj = results[0].value;
        const user_is_player = results[1].value;
        enablePlayerAddRemoveButtons(user_is_player, config, client);
      }
    }
  });


}());
