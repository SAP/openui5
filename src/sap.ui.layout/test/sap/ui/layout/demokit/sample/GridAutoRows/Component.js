sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.layout.sample.GridAutoRows.Component", {

			metadata : {
				rootView : {
					"viewName": "sap.ui.layout.sample.GridAutoRows.GridAutoRows",
					"type": "XML",
					"async": true
				},
				dependencies : {
					libs : [
						"sap.ui.layout",
						"sap.m"
					]
				},
				includes : [ "main.css" ],
				config : {
					sample : {
						files : [
							"GridAutoRows.view.xml",
							"GridAutoRows.controller.js",
							"main.css"
						]
					}
				}
			}
		});

		return Component;
	});
