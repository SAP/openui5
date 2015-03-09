jQuery.sap.declare("sap.ui.layout.sample.FixFlexMinFlexSize.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.FixFlexMinFlexSize.Component", {

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
