sap.ui.define(['sap/ui/core/UIComponent','sap/ui/core/mvc/XMLView'],
	function(UIComponent, XMLView) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.CurrencyInTable.Component", {

		metadata : {
			publicMethods : [
				"getTable"
			],
			dependencies : {
				libs : [
					"sap.ui.unified",
					"sap.m"
				]
			},
			config : {
				sample : {
					files : [
						"View.view.xml",
						"Controller.controller.js"
					]
				}
			}
		},

		getTable : function () {
			return this._rootView.getContent()[0];
		}
	});

	Component.prototype.createContent = function () {
		this._rootView = sap.ui.xmlview({ viewName : "sap.ui.unified.sample.CurrencyInTable.View" });
		return this._rootView;
	};

	return Component;

});