sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.layout.sample.GridResponsiveness.Component", {

			metadata : {
				rootView : {
					"viewName": "sap.ui.layout.sample.GridResponsiveness.GridResponsiveness",
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
							"GridResponsiveness.view.xml",
							"GridResponsiveness.controller.js",
							"main.css"
						]
					}
				}
			}
		});

		return Component;
	});
