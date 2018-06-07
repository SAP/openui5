sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
	'use strict';

	var oComponent = UIComponent.extend('sap.f.tutorial.fiori2.02.Component', {
		metadata: {
			config: {
				sample: {
					iframe: 'webapp/index.html',
					stretch: true,
					files: [
						"webapp/view/App.view.xml",
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