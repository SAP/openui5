/*global QUnit */
sap.ui.define([
	"sap/ui/core/routing/HashChangerBase"
], function (HashChangerBase) {
	"use strict";

	QUnit.module("Events", {
		beforeEach: function(assert) {
			this.oHashChangerBase = new HashChangerBase();
		},
		afterEach: function(assert) {
			this.oHashChangerBase.destroy();
		}
	});

	QUnit.test("setHash", function(assert) {
		assert.expect(1);
		this.oHashChangerBase.attachEvent("hashSet", function(oEvent) {
			assert.equal(oEvent.getParameter("hash"), "newHash");
		});

		this.oHashChangerBase.setHash("newHash");
	});

	QUnit.test("replaceHash", function(assert) {
		assert.expect(1);
		this.oHashChangerBase.attachEvent("hashReplaced", function(oEvent) {
			assert.equal(oEvent.getParameter("hash"), "newHash");
		});

		this.oHashChangerBase.replaceHash("newHash");
	});
});
