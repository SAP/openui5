/*global QUnit*/

sap.ui.define([
		'sap/ui/support/supportRules/CoreFacade'],
	function(CoreFacade) {
		'use strict';

		QUnit.module("CoreFacade API test");

		QUnit.test("Fixed public methods", function (assert) {
			var cf = CoreFacade(),
				getUIAreasIsAMethod = cf.getUIAreas && typeof cf.getUIAreas === "function",
				getComponentsIsAMethod = cf.getComponents && typeof cf.getComponents === "function";

			assert.ok(getUIAreasIsAMethod, " should not be changed");
			assert.ok(getComponentsIsAMethod, " should not be changed");
		});

		/**
		 * @deprecated As of version 1.118.0
		 */
		QUnit.test("Deprecated public methods", function (assert) {
			var cf = CoreFacade(),
				getMetadataIsAMethod = cf.getMetadata && typeof cf.getMetadata === "function",
				getModelsIsAMethod = cf.getModels && typeof cf.getModels === "function";

			assert.ok(getMetadataIsAMethod, " should not be changed");
			assert.ok(getModelsIsAMethod, " should not be changed");
		});
	});
