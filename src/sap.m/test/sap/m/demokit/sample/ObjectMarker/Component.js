sap.ui.define(['sap/ui/core/UIComponent','sap/ui/core/mvc/XMLView'],
	function(UIComponent, XMLView) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ObjectMarker.Component", {

		metadata : {
			publicMethods : [
				"getTable"
			],
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					files : [
						"Table.view.xml",
						"Table.controller.js"
					]
				}
			}
		},

		getTable : function () {
			return this._rootView.getContent()[0];
		}
	});

	Component.prototype.createContent = function () {
		this._rootView = sap.ui.xmlview({ viewName : "sap.m.sample.ObjectMarker.Table" });
		return this._rootView;
	};

	return Component;

});
