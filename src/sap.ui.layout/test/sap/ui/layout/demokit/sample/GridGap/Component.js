sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.layout.sample.GridGap.Component", {

			metadata : {
				rootView : {
					"viewName": "sap.ui.layout.sample.GridGap.GridGap",
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
							"GridGap.view.xml",
							"GridGap.controller.js",
							"main.css"
						]
					}
				}
			}
		});

		return Component;
	});
