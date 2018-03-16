sap.ui.define(['sap/ui/core/UIComponent','sap/ui/core/mvc/XMLView'],
	function(UIComponent, XMLView) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TableTest.applicationUnderTest.Component", {

		metadata : {
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
						"./view/Table.view.xml",
						"./view/Table.controller.js",
						"./view/Formatter.js"
					]
				}
			}
		},

		getTable : function () {
			return this._rootView.getContent()[0];
		}
	});

	Component.prototype.createContent = function () {
		this._rootView = sap.ui.xmlview({ viewName : "view.Table" });
		return this._rootView;
	};

	return Component;

});
