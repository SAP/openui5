sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.tutorial.odatav4.01.Component", {

		metadata : {
			config : {
				sample : {
					iframe : "webapp/index.html",
					stretch : true,
					files : [
						"webapp/controller/App.controller.js",
						"webapp/i18n/i18n.properties",
						"webapp/view/App.view.xml",
						"webapp/model/models.js",
						"webapp/Component.js",
						"webapp/index.html",
						"webapp/initMockServer.js",
						"webapp/manifest.json",
						"webapp/localService/mockdata/people.json",
						"webapp/localService/metadata.xml",
						"webapp/localService/mockserver.js",
						"ui5.yaml",
						"package.json"
					]
				}
			}
		}
	});

	return Component;
});
