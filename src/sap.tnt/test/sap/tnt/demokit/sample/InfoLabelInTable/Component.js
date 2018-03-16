sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/mvc/XMLView"],
	function(UIComponent, XMLView) {
	'use strict';

	var Component = UIComponent.extend("sap.tnt.sample.InfoLabelInTable.Component", {
		metadata : {
			publicMethods : [
				"getTable"
			],
			dependencies : {
				libs : [
					"sap.tnt",
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"V.view.xml",
						"V.controller.js",
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
			this._rootView = sap.ui.xmlview({ viewName : "sap.tnt.sample.InfoLabelInTable.V" });
			return this._rootView;
		};

		return Component;
	});