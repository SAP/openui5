sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.sample.MessagePopoverMessageHandling.Component", {

			metadata : {
				rootView : {
					"viewName": "sap.m.sample.MessagePopoverMessageHandling.MessageHandling",
					"type": "XML",
					"async": true
				},
				dependencies : {
					libs : [
						"sap.m",
						"sap.ui.layout",
						"sap.ui.core"
					]
				},
				config : {
					sample : {
						stretch : true,
						files : [
							"MessageHandling.view.xml",
							"MessageHandling.controller.js",
							"FormsModel.json"
						]
					}
				}
			}
		});

		return Component;
	});
