/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define([
	'sap/base/util/values'
], function (
	values
) {
	"use strict";

	QUnit.module("sap.base.util.values", function () {
		QUnit.test("basic functionality", function (assert) {
			assert.deepEqual(values({ a: 'b', c: 'd'}), ['b', 'd']);
			assert.deepEqual(values({ a: 'b', c: 'd'}).sort(), ['d', 'b'].sort());
			assert.deepEqual(values({}), []);
		});
		QUnit.test("invalid argument", function (assert) {
			assert.throws(function () {
				values();
			});
			assert.throws(function () {
				values([]);
			});
			assert.throws(function () {
				values(null);
			});
			assert.throws(function () {
				values(undefined);
			});
			assert.throws(function () {
				values('');
			});
			assert.throws(function () {
				values(function () {});
			});
		});
	});
});