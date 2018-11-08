sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.f.sample.FlexibleColumnLayoutWithFullscreenPage.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "webapp/index.html",
						stretch: true,
						files: [
							"webapp/view/Detail.view.xml",
							"webapp/view/DetailDetail.view.xml",
							"webapp/view/FlexibleColumnLayout.view.xml",
							"webapp/view/Master.view.xml",
							"webapp/view/DetailDetailDetail.view.xml",
							"webapp/controller/Detail.controller.js",
							"webapp/controller/DetailDetail.controller.js",
							"webapp/controller/FlexibleColumnLayout.controller.js",
							"webapp/controller/Master.controller.js",
							"webapp/controller/DetailDetailDetail.controller.js",
							"webapp/Component.js",
							"webapp/index.html",
							"webapp/manifest.json"
						]
					}
				}
			}

		});

		return Component;
	});
