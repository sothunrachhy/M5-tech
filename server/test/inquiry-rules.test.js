// Unit tests for the shared validator (no database needed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanText, firstStepWithError, validateInquiry } from '../../shared/inquiry.mjs';

const valid = {
  fullName: 'Sopheak Chan',
  email: 'Sopheak@Example.com',
  phone: '+855 12 345 678',
  systemType: 'Management System',
  description: 'We need a clinic inventory system with FEFO.',
};

test('accepts a valid request and normalises email', () => {
  const { data, errors } = validateInquiry(valid);
  assert.deepEqual(errors, {});
  assert.equal(data.email, 'sopheak@example.com');
});

test('accepts Khmer names and text', () => {
  const { errors } = validateInquiry({ ...valid, fullName: 'សុភ័ក្រ ចាន់', description: 'យើងត្រូវការប្រព័ន្ធគ្រប់គ្រងស្តុកឱសថសម្រាប់គ្លីនិក។' });
  assert.deepEqual(errors, {});
});

test('requires the five core fields', () => {
  const { errors } = validateInquiry({});
  assert.deepEqual(Object.keys(errors).sort(), ['description', 'email', 'fullName', 'phone', 'systemType']);
});

test('rejects names without letters, whitespace-only names', () => {
  assert.ok(validateInquiry({ ...valid, fullName: '12345' }).errors.fullName);
  assert.ok(validateInquiry({ ...valid, fullName: '    ' }).errors.fullName);
});

test('rejects malformed emails', () => {
  for (const email of ['nope', 'a@b', 'a b@c.com', 'x@y.c', '<a>@b.com']) {
    assert.ok(validateInquiry({ ...valid, email }).errors.email, email);
  }
});

test('phone must be digits/+/spaces with 8–15 digits', () => {
  for (const phone of ['call me maybe', '12345', '+855 12 345 678 999 999']) {
    assert.ok(validateInquiry({ ...valid, phone }).errors.phone, phone);
  }
  assert.equal(validateInquiry({ ...valid, phone: '(012) 345-678' }).errors.phone, undefined);
});

test('telegram accepts @handle or phone, rejects junk', () => {
  assert.equal(validateInquiry({ ...valid, telegram: '@m5tech_kh' }).errors.telegram, undefined);
  assert.equal(validateInquiry({ ...valid, telegram: '+855 88 472 8991' }).errors.telegram, undefined);
  assert.ok(validateInquiry({ ...valid, telegram: 'http://evil.example' }).errors.telegram);
});

test('choice fields only accept listed options', () => {
  assert.ok(validateInquiry({ ...valid, systemType: '<script>alert(1)</script>' }).errors.systemType);
  assert.ok(validateInquiry({ ...valid, budget: '$1 billion; DROP TABLE x' }).errors.budget);
  assert.equal(validateInquiry({ ...valid, budget: 'Need Consultation' }).errors.budget, undefined);
});

test('length limits', () => {
  assert.equal(validateInquiry({ ...valid, description: 'too short' }).errors.description, 'description');
  assert.equal(validateInquiry({ ...valid, description: 'x'.repeat(5001) }).errors.description, 'tooLong');
});

test('non-string values are rejected, unknown keys ignored', () => {
  assert.equal(validateInquiry({ ...valid, fullName: { $ne: 1 } }).errors.fullName, 'invalid');
  assert.equal(validateInquiry({ ...valid, phone: 85512345678 }).errors.phone, 'invalid');
  assert.equal('isAdmin' in validateInquiry({ ...valid, isAdmin: true }).data, false);
  assert.ok(validateInquiry([1, 2, 3]).errors.fullName);
});

test('cleanText strips NUL, control and bidi-override characters', () => {
  assert.equal(cleanText('Ab\u0000\u0007‮evil'), 'Abevil');
  assert.equal(cleanText('  a \t  b  '), 'a b');
  assert.equal(cleanText('line1\r\nline2\n\n\n\n\nline3', true), 'line1\nline2\n\n\nline3');
});

test('firstStepWithError points at the right form step', () => {
  assert.equal(firstStepWithError({ budget: 'invalid' }), 2);
  assert.equal(firstStepWithError({ description: 'description', email: 'email' }), 0);
  assert.equal(firstStepWithError({}), -1);
});
