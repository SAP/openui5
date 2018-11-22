sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.layout.sample.GridTemplateRows.Component", {

			metadata : {
				rootView : {
					"viewName": "sap.ui.layout.sample.GridTemplateRows.GridTemplateRows",
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
							"GridTemplateRows.view.xml",
							"GridTemplateRows.controller.js",
							"main.css"
						]
					}
				}
			}
		});

		return Component;
	});
