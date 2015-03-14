sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.CheckBox.Component", {

		metadata : {
			rootView : "sap.m.sample.CheckBox.CheckBoxGroup",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"CheckBoxGroup.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
