sap.ui.define(["sap/ui/core/UIComponent"],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.m.sample.MaskInput.Component", {
			metadata : {
				rootView : "sap.m.sample.MaskInput.Page",
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
