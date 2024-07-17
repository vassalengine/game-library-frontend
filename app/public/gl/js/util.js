export function getCookie(name) {
  return document.cookie.split('; ')
    .find((c) => c.startsWith(`${name}=`))
    ?.split('=')[1];
}

export function formatSizeWithUnit(n) {
  const k = n > 0 ? Math.floor((Math.log2(n) / 10)) : 0;
  const unit = (k > 0 ? 'KMGT'[k - 1] + 'i' : '') + 'B';
  const count = Math.round(n / 1024**k);
  return `${count} ${unit}`;
}

export function intlFormatDistance(rtf, date, base) {
  // https://www.builder.io/blog/relative-time

  // Get the amount of seconds between the date and base 
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
