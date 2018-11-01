sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.layout.sample.GridAutoFlow.Component", {

			metadata : {
				rootView : {
					"viewName": "sap.ui.layout.sample.GridAutoFlow.GridAutoFlow",
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
							"GridAutoFlow.view.xml",
							"GridAutoFlow.controller.js",
							"main.css"
						]
					}
				}
			}
		});

		return Component;
	});
