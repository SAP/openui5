sap.ui.define(["sap/ui/core/UIComponent"],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.m.sample.MessagePageCustom.Component", {
			metadata : {
				rootView : "sap.m.sample.MessagePageCustom.Page",
				dependencies : {
					libs : [
						"sap.m",
						"sap.ui.layout"
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
