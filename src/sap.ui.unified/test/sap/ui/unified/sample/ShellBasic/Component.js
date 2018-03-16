sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.ShellBasic.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.unified.sample.ShellBasic.View",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.unified",
					"sap.ui.layout",
					"sap.m"
				]
			},
			includes : [
				"../style.css"
			],
			config : {
				sample : {
					files : [
						"View.view.xml",
						"Controller.controller.js",
						"ShellOverlay.fragment.xml"
					]
				}
			}
		}
	});

	return Component;

});
