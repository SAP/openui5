sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/core/mvc/XMLView',
	"sap/ui/fl/FakeLrepConnectorLocalStorage"
],
function(
	UIComponent,
	XMLView,
	FakeLrepConnectorLocalStorage
) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.Table.Component", {

		metadata : {
			manifest: "json",
			publicMethods : [
				"getTable"
			],
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"Table.view.xml",
						"Table.controller.js",
						"Formatter.js"
					]
				}
			}
		},

		getTable : function () {
			return this._rootView.getContent()[0];
		}
	});

	Component.prototype.createContent = function () {
		this._createFakeLrep();
		this._rootView = sap.ui.xmlview(this.createId("idMain1"), { viewName : "sap.m.sample.Table.Table" });
		return this._rootView;
	};

	Component.prototype._createFakeLrep = function () {
		FakeLrepConnectorLocalStorage.enableFakeConnector();
	};

	return Component;

});
