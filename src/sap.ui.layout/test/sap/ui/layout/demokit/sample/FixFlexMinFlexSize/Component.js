sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.FixFlexMinFlexSize.Component", {

		metadata: {
			rootView: "sap.ui.layout.sample.FixFlexMinFlexSize.V",
			dependencies: {
				libs: [
					"sap.ui.layout",
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"V.view.xml",
					]
				}
			}
		}
	});


	return Component;

});
