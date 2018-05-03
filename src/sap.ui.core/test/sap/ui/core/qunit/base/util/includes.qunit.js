/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define([
	'sap/base/util/includes'
], function (
	includes
) {
	"use strict";

	QUnit.module("sap.base.util.includes", function () {
		QUnit.test("lookup in array", function (assert) {
			assert.strictEqual(includes(['foo'], 'foo'), true);
			assert.strictEqual(includes(['foo', 'bar'], 'bar'), true);
			assert.strictEqual(includes([], 'foo'), false);
			assert.strictEqual(includes([], undefined), false);
			assert.strictEqual(includes([], undefined), false);
		});
		QUnit.test("lookup in plain object", function (assert) {
			assert.strictEqual(includes({ foo: 'bar' }, 'foo'), false);
			assert.strictEqual(includes({ foo: 'bar' }, 'bar'), true);
			assert.strictEqual(includes({}, 'foo'), false);
			assert.strictEqual(includes({}, {}), false);
			assert.strictEqual(includes({ foo: 'bar' }, null), false);
		});
		QUnit.test("invalid argument", function (assert) {
			assert.throws(function () {
				includes();
			});
			assert.throws(function () {
				includes(function () {});
			});
			assert.throws(function () {
				includes('string');
			});
		});
	});
});