sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/XMLView"
],
function(
	UIComponent,
	XMLView
) {
	"use strict";

	return UIComponent.extend("sap.m.sample.Table.Component", {
		metadata: {
			manifest: "json",
			publicMethods: [
				"getTable"
			],
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config: {
				sample: {
					files: [
						"Table.view.xml",
						"Table.controller.js",
						"Formatter.js"
					]
				}
			}
		},

		getTable: function () {
			return this._rootView.getContent()[0];
		},

		createContent: function () {
			var oApp = new sap.m.App();

			XMLView.create({
				id: "idMain1",
				viewName: "sap.m.sample.Table.Table"
			}).then(function(oPage) {
				oApp.addPage(oPage);
			});
			return oApp;
		}

	});
});
