sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.CSSGrid.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.layout.sample.CSSGrid.CSSGridPageLayout",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.layout",
					"sap.m",
					"sap.ui.core"
				]
			},
			includes : [ "main.css" ],
			config : {
				sample : {
					files : [
						"CSSGridPageLayout.view.xml",
						"CSSGridPageLayout.controller.js",
						"main.css"
					]
				}
			}
		}
	});

		return Component;
	});
