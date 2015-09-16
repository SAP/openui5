sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		return UIComponent.extend("sap.m.sample.HelloWorld.Component", {

			metadata : {
				dependencies : {
					libs : [
						"sap.m"
					]
				},
				config : {
					sample : {
						iframe : "index.html",
						stretch : true,
						files : [
							"index.html"
						]
					}
				}
			}

		});
	});
