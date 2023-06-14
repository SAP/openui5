sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
	'use strict';

	var oComponent = UIComponent.extend('sap.ui.mdc.sample.TableFilterBarJson.Component', {
		metadata: {
			config: {
				sample: {
					iframe: 'webapp/index.html',
					stretch: true,
					files: [
						"webapp/Component.js",
						"webapp/index.html",
						"webapp/manifest.json",
						"webapp/delegate/JSONFilterBarDelegate.js",
						"webapp/delegate/JSONTableDelegate.js"
					]
				}
			}
		}
	});

	return oComponent;

});