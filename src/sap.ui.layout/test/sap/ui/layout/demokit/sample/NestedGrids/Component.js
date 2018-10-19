sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.layout.sample.NestedGrids.Component", {

			metadata : {
				rootView : {
					"viewName": "sap.ui.layout.sample.NestedGrids.NestedGrids",
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
						stretch : true,
						files : [
							"NestedGrids.view.xml",
							"NestedGrids.controller.js",
							"main.css"
						]
					}
				}
			}
		});

		return Component;
	});
