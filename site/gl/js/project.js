function formatSizeWithUnit(n) {
  const k = n > 0 ? Math.floor((Math.log2(n) / 10)) : 0;
  const unit = (k > 0 ? 'KMGT'[k - 1] + 'i' : '') + 'B';
  const count = Math.floor(n / 1024**k);
  return `${count} ${unit}`;
}

function makeUserLink(username) {
  const img = document.createElement('img');

  const a = document.createElement('a');
  a.appendChild(img);

  const username_text = document.createTextNode(username);
  a.appendChild(username_text);
  a.href = `https://forum.vassalengine.org/u/${username}`;

  return a;
}

function populatePlayers(players) {
  const e_players = document.getElementById('players');

  const get_avatars = [];

  for (const p of players['users']) {
    const li = document.createElement('li');
    li.appendChild(makeUserLink(p));
    e_players.appendChild(li);

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
}

function populateProject(proj) {
  const now = new Date();
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  //
  // game section
  //

  const e_box_image = document.getElementById('box_image');
  e_box_image.src = `${api}/projects/${project}/images/${proj['image']}`;

  const e_title = document.getElementById('game.title');
  e_title.textContent = proj['game']['title'];
  document.title = `${proj['game']['title']} - Module Library - Vassal`;

  const e_publisher = document.getElementById('game.publisher');
  e_publisher.textContent = proj['game']['publisher'];

  const e_year = document.getElementById('game.year');
  e_year.textContent = proj['game']['year'];

  const e_description = document.getElementById('description');
  e_description.textContent = proj['description'];

  // 
  // project section
  //

  const e_name = document.getElementById('name');
  e_name.textContent = proj['name'];

  const e_created_at = document.getElementById('project_created_at');
  e_created_at.dateTime = proj.created_at;

  const e_created_rel = document.getElementById('project_created_rel');
  e_created_rel.textContent = intlFormatDistance(rtf, new Date(proj.created_at), now);

  const e_modified_at = document.getElementById('project_modified_at');
  e_modified_at.dateTime = proj.modified_at;

  const e_modified_rel = document.getElementById('project_modified_rel');
  e_modified_rel.textContent = intlFormatDistance(rtf, new Date(proj.modified_at), now);

  const e_tags = document.getElementById('tags');
  for (const t of proj['tags']) {
    const li = document.createElement('li');
    li.textContent = '#' + t;
    e_tags.appendChild(li);
  }

  const e_owners = document.getElementById('owners');
  for (const o of proj['owners']) {
    const li = document.createElement('li');
    li.appendChild(makeUserLink(o));
    e_owners.appendChild(li);
  }

  //
  // packages section
  //

  const packageTemplate = document.querySelector('#package_tmpl');
  const releaseTemplate = document.querySelector('#release_tmpl');

  const e_packages = document.getElementById('packages');

  for (const [pi, p] of proj['packages'].entries()) {
    const pkg_t = document.importNode(packageTemplate.content, true);

    const pkg = pkg_t.querySelector(".package_tmpl_top");

    const div_pkg_name = pkg.querySelector(".package_tmpl_name");
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
      sp_requires.textContent = v.requires === "" ? 'Unknown' : v.requires;

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
}

const project_script_data = document.getElementById("project-script").dataset;
const api = project_script_data.api;

const project = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);

const sections = [
  [ `${api}/projects/${project}`, populateProject, 'project_content' ],
  [ `${api}/projects/${project}/players`, populatePlayers, 'players_content' ]
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
