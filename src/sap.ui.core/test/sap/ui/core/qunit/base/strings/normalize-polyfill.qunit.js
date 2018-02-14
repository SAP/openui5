/*global String QUnit */
sap.ui.define(["sap/base/strings/normalize-polyfill"], function(normalizePolyfill) {
	"use strict";

	QUnit.module("normalize-polyfill", {
		beforeEach: function () {
			this.fnNormalize = String.prototype.normalize;
		}, afterEach: function () {
			/* eslint-disable no-extend-native */
			String.prototype.normalize = this.fnNormalize;
			/* eslint-enable no-extend-native */
		}
	});

	QUnit.test("apply polyfill", function(assert) {

		normalizePolyfill.apply();

		assert.ok(String.prototype.normalize);
		assert.ok(typeof String.prototype.normalize === 'function');

	});

	QUnit.test("apply polyfill and compare to prototype", function(assert) {

		normalizePolyfill.apply();

		assert.notStrictEqual(String.prototype.normalize, this.fnNormalize, "the newly set normalize function is not the same as the original");

	});

});
