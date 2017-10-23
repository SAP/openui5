sap.ui.define(["sap/ui/core/UIComponent"],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.m.sample.MaskInput.Component", {
			metadata : {
				rootView : {
					"viewName": "sap.m.sample.MaskInput.Page",
					"type": "XML",
					"async": true
				},
				dependencies : {
					libs : [
						"sap.m"
					]
				},
				config : {
					sample : {
						stretch : true,
						files : [
							"Page.view.xml"
						]
					}
				}
			}
		});
	}
);
