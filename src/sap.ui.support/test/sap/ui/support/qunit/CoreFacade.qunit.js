/*global QUnit*/

(function () {
	"use strict";

	jQuery.sap.require("sap/ui/support/supportRules/CoreFacade");

	QUnit.module("CoreFacade API test", {
		setup: function () {
			this.cf = sap.ui.support.supportRules.CoreFacade();
		},
		teardown: function () {
			this.cf = null;
		}
	});

	QUnit.test("Fixed public methods", function (assert) {
		var getMetadataIsAMethod = this.cf.getMetadata && typeof this.cf.getMetadata === "function",
			getUIAreasIsAMethod = this.cf.getUIAreas && typeof this.cf.getUIAreas === "function",
			getComponentsIsAMethod = this.cf.getComponents && typeof this.cf.getComponents === "function",
			getModelsIsAMethod = this.cf.getModels && typeof this.cf.getModels === "function";

		assert.ok(getMetadataIsAMethod, " should not be changed");
		assert.ok(getUIAreasIsAMethod, " should not be changed");
		assert.ok(getComponentsIsAMethod, " should not be changed");
		assert.ok(getModelsIsAMethod, " should not be changed");
	});

}());
