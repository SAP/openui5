sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
	'use strict';

	var oComponent = UIComponent.extend('sap.f.tutorial.fiori2.03.Component', {
		metadata: {
			config: {
				sample: {
					iframe: 'webapp/index.html',
					stretch: true,
					files: [
						"webapp/view/App.view.xml",
						"webapp/view/Master.view.xml",
						"webapp/controller/Master.controller.js",
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