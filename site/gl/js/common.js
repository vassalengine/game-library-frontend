function replaceWithErrorBox(section_to_replace, msg) {
  const e_error = document.createElement('div');
  e_error.classList.add(
    'border', 'rounded', 'border-danger', 'border-3',
    'p-3', 'my-2'
  );

  const e_msg = document.createElement('p');
  e_error.classList.add('pb-0');
  e_msg.textContent = msg;
  e_error.appendChild(e_msg);

  section_to_replace.replaceWith(e_error);
}

class APIError extends Error {
  constructor(status, statusText, message) {
    super(message);
    this.status = status;
    this.statusText = statusText;
  }

  name = this.constructor.name;
}

APIError.prototype.toString = function () {
  return `${this.name}: ${this.status} ${this.statusText}: ${this.message}`;
};

async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const json = await response.json();
    const message = json?.['error'] ?? json.toString();
    throw new APIError(response.status, response.statusText, message);
  }

  return await response.json();
}

function handleError(err, section_id) {
  console.log(err);
  replaceWithErrorBox(
    document.getElementById(section_id),
    err.toString()
  );
}
