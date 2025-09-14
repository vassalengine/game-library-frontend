import { slug_for } from './util.js';

import { expect, test } from 'vitest';

test('slug_for_abcd', () => {
  expect(slug_for('abcd')).toEqual('abcd');
});

test('slug_for_whitespace', () => {
  expect(slug_for('x      x')).toEqual('x-x');
});

test('slug_for_consecutive_hyphens', () => {
  expect(slug_for('x----x---x')).toEqual('x-x-x');
});

test('slug_for_trim_hyphens', () => {
  expect(slug_for('-x-')).toEqual('x');
});

test('slug_for_special', () => {
  expect(slug_for("x/#?*x")).toEqual("xx");
});

test('slug_for_nonascii', () => {
  expect(slug_for("x💩x")).toEqual("x%F0%9F%92%A9x");
});

