/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/ApiMaster.controller"
],
function (
	ApiMasterController
) {
	"use strict";

	QUnit.module("Test", {
		beforeEach: function () {
			this.controller = new ApiMasterController();
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("Test compareTreeNodes", function (assert) {
		assert.strictEqual(this.controller.compareTreeNodes("EXPERIMENTAL", "DEPRECATED"), 1, "Experimental is always last");
		assert.strictEqual(this.controller.compareTreeNodes("DEPRECATED", "EXPERIMENTAL"), -1, "Experimental is always last");
		assert.strictEqual(this.controller.compareTreeNodes("sap.m", "DEPRECATED"), -1, "Deprecated is always after all libraries");
		assert.strictEqual(this.controller.compareTreeNodes("DEPRECATED", "sap.f"), 1, "Deprecated is always after all libraries");
		assert.strictEqual(this.controller.compareTreeNodes("sap.m", "sap.f"), 1, "sap.m is alphabetically after sap.f");
		assert.strictEqual(this.controller.compareTreeNodes("sap.ui.unified", "sap.uxap"), -1, "sap.uxap is after sap.ui.unified");
		assert.strictEqual(this.controller.compareTreeNodes("sap.m", "sap.m"), 0, "sap.m is equal to sap.m");
	});
});