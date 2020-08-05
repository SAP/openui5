sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
	'use strict';

	var oComponent = UIComponent.extend('sap.f.tutorial.fiori2.10.Component', {
		metadata: {
			config: {
				sample: {
					iframe: 'webapp/index.html',
					stretch: true,
					files: [
						"webapp/view/App.view.xml",
						"webapp/view/Master.view.xml",
						"webapp/view/Detail.view.xml",
						"webapp/view/DetailDetail.view.xml",
						"webapp/view/AboutPage.view.xml",
						"webapp/controller/App.controller.js",
						"webapp/controller/Master.controller.js",
						"webapp/controller/Detail.controller.js",
						"webapp/controller/DetailDetail.controller.js",
						"webapp/Component.js",
						"webapp/index.html",
						"webapp/manifest.json"
					]
				}
			}
		}
	});

	return oComponent;

});