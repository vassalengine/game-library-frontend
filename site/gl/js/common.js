function intlFormatDistance(rtf, date, base) {
  // https://www.builder.io/blog/relative-time

  // Get the amount of seconds between the given date and now
  const dsec = Math.round((date.getTime() - base.getTime()) / 1000);

  // Array reprsenting one minute, hour, day, week, month, year in seconds
  const cutoffs = [
    60,
    3600,
    86400,
    86400 * 7,
    86400 * 30,
    86400 * 365,
    Infinity
  ];

  // Array equivalent to the above but in the string representation of the units
  const units = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year"
  ];

  // Grab the ideal cutoff unit
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(dsec));

  // Get the divisor to divide from the seconds. E.g., if our unit is "day"
  // our divisor is one day in seconds, so we can divide our seconds by
  // this to get the # of days
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  // Do the formatting
  return rtf.format(Math.floor(dsec / divisor), units[unitIndex]);
}

function makeErrorBox(msg) {
  const e_error = document.createElement('div');
  e_error.classList.add(
    'border', 'rounded', 'border-danger', 'border-3',
    'p-3', 'my-2'
  );

  const e_msg = document.createElement('p');
  e_error.classList.add('pb-0');
  e_msg.textContent = msg;
  e_error.appendChild(e_msg);

  return e_error;
}

function replaceWithErrorBox(el, msg) {
  const e_error = makeErrorBox(msg);
  el.replaceWith(e_error);
}

function insertErrorBoxBefore(el, msg) {
  const e_error = makeErrorBox(msg);
  el.before(e_error);
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

async function checkError(response) {
  if (!response.ok) {
    const json = await response.json();
    const message = json?.['error'] ?? json.toString();
    throw new APIError(response.status, response.statusText, message);
  }
}

async function fetchJSON(url, options={}) {
  const response = await fetch(url, options);
  checkError(response);
  return await response.json();
}

async function fetchOK(url, options={}) {
  const response = await fetch(url, options);
  checkError(response);
}

function handleErrorReplace(err, id) {
  console.log(err);
  replaceWithErrorBox(
    document.getElementById(id),
    err.toString()
  );
}

function handleErrorBefore(err, id) {
  console.log(err);
  insertErrorBoxBefore(
    document.getElementById(id),
    err.toString()
  );
}
