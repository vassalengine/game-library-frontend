import { formatSizeWithUnit, slug_for } from './util.js';

import { expect, test } from 'vitest';

test.each([
  [0, '0 B'],
  [1, '1 B'],
  [1023, '1023 B'],
  [1024, '1 KiB'],
  [1048575, '1023 KiB'],
  [1048576, '1 MiB'],
  [1073741823, '1023 MiB'],
  [1073741824, '1 GiB'],
  [1099511627775, '1023 GiB'],
  [1099511627776, '1 TiB']
])(
  'formatSizeWithUnit %i',
  (n, exp) => expect(formatSizeWithUnit(n)).toEqual(exp)
);

test.each([
  ['abcd' , 'abcd'],
  ['x      x', 'x-x'],
  ['x----x---x', 'x-x-x'],
  ['-x-', 'x'],
  ['x/#?*x', 'xx'],
  ['x💩x', 'x%F0%9F%92%A9x']
])(
  'slug_for %s',
  (name, exp) => expect(slug_for(name)).toEqual(exp)
);
