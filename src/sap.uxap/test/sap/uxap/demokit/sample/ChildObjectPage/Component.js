sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	return UIComponent.extend("sap.uxap.sample.ChildObjectPage.Component", {
		metadata: {
			rootView: "sap.uxap.sample.ChildObjectPage.ChildObjectPage",
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.core"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ChildObjectPage.view.xml",
						"ChildObjectPage.controller.js",
						"employee.json",
						"products.json"
					]
				}
			}
		}
	});
}, true);
