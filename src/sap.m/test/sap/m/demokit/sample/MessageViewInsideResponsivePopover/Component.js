sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.sample.MessageViewInsideResponsivePopover.Component", {

			metadata : {
				rootView : "sap.m.sample.MessageViewInsideResponsivePopover.MessageView",
				dependencies : {
					libs : [
						"sap.m"
					]
				},
				config : {
					sample : {
						stretch : true,
						files : [
							"MessageView.view.xml",
							"MessageView.controller.js"
						]
					}
				}
			}
		});

		return Component;

	});
