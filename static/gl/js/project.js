async function populateProject(project) {
  const api = '{{ api_url }}';

  const presp = await fetch(`${api}/projects/${project}`);

  if (presp.status !== 200) {
    return;
  }

  const proj = await presp.json();

  const e_box_image = document.getElementById('box_image');
  e_box_image.src = `${api}/projects/${project}/images/${proj['image']}`;

  const e_name = document.getElementById('name');
  e_name.textContent = proj['name'];

  const e_title = document.getElementById('game.title');
  e_title.textContent = proj['game']['title'];
  document.title = `${proj['game']['title']} - Module Library - Vassal`;
 
  const e_publisher = document.getElementById('game.publisher');
  e_publisher.textContent = proj['game']['publisher'];
 
  const e_year = document.getElementById('game.year');
  e_year.textContent = proj['game']['year'];

  const e_description = document.getElementById('description');
  e_description.textContent = proj['description'];

  const e_created_at = document.getElementById('created_at');
  e_created_at.textContent = proj['created_at'];

  const e_modified_at = document.getElementById('modified_at');
  e_modified_at.textContent = proj['modified_at'];

  const e_tags = document.getElementById('tags');
  for (const t of proj['tags']) {
    const li = document.createElement('li');
    li.textContent = '#' + t;
    e_tags.appendChild(li);
  }

  const e_owners = document.getElementById('owners');
  for (const o of proj['owners']) {
    const li = document.createElement('li');
    li.textContent = o;
    e_owners.appendChild(li);
  }

  const e_packages = document.getElementById('packages');

  for (const p of proj['packages']) {
    const li_pkg = document.createElement('li');

    const div_pkg_name = document.createElement('div');
    div_pkg_name.textContent = p.name;

    const div_pkg_desc = document.createElement('div');
    div_pkg_desc.textContent = p.description;

    const ul_ver = document.createElement('ul');

    for (const v of p.releases) {
      const li_ver = document.createElement('li');
      
      const div_ver_ver = document.createElement('div');
      div_ver_ver.textContent = v.version;

      const a_ver_ver = document.createElement('a');
      a_ver_ver.textContent = v.filename;
      a_ver_ver.href = v.url;
      
      li_ver.appendChild(div_ver_ver);
      li_ver.appendChild(a_ver_ver);
      ul_ver.appendChild(li_ver);
    }

    li_pkg.appendChild(div_pkg_name);
    li_pkg.appendChild(div_pkg_desc);
    li_pkg.appendChild(ul_ver);
    e_packages.appendChild(li_pkg);
  }

  const e_readme = document.getElementById('readme');

  // TODO: do something with the readme data here
  // TODO: sanitize all input from JSON API
  e_readme.innerHTML = DOMPurify.sanitize(marked.parse(proj['readme']));
}

const project = document.getElementById("project-script").dataset.project;
await populateProject(project);
