sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.f.sample.FlexibleColumnLayoutWithTwoColumnStart.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "../FlexibleColumnLayoutWithOneColumnStart/webapp/index.html?initial=2",
						stretch: true,
						files: [
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/view/Detail.view.xml",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/view/DetailDetail.view.xml",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/view/FlexibleColumnLayout.view.xml",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/view/Master.view.xml",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/view/AboutPage.view.xml",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/controller/Detail.controller.js",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/controller/DetailDetail.controller.js",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/controller/FlexibleColumnLayout.controller.js",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/controller/Master.controller.js",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/controller/AboutPage.controller.js",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/Component.js",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/index.html",
							"../FlexibleColumnLayoutWithOneColumnStart/webapp/manifest.json"
						]
					}
				}
			}

		});

		return Component;
	});
