/*global QUnit*/

(function(JsControlTreeModifier) {
	"use strict";

	jQuery.sap.registerModulePath("testComponent", "../testComponent");

	QUnit.module("The XmlTreeModifier", {
		beforeEach: function () {

			var oMockedLrepResponse = {
				changes: [],
				contexts: [],
				settings: []
			};

			sap.ui.fl.Cache._entries["testComponent.Component"] = {
				file: oMockedLrepResponse,
				promise: Promise.resolve(oMockedLrepResponse)
			};

			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				"metadata": {
					"manifest": "json"
				}
			});

			this.oJsView = this.oComponent.byId("myView");
			return this.oJsView;
		},

		afterEach: function () {
			this.oComponent.destroy();
			this.oJsView.destroy();
		}
	});

	QUnit.test("does nothing", function (assert) {
		assert.ok(true);
	});
}(sap.ui.fl.changeHandler.JsControlTreeModifier));
