sap.ui.define([
	"sap/ui/core/UIComponent"
],
function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.MessageManager.ODataBackendMessagesComp.Component", {
		metadata: {
			config: {
				dependencies: {
					libs: [
						"sap.m"
					]
				},
				sample: {
					iframe: "webapp/index.html",
					stretch: true,
					files: [
						"webapp/controller/App.controller.js",
						"webapp/controller/BaseController.js",
						"webapp/controller/Employee.controller.js",
						"webapp/controller/NotFound.controller.js",
						"webapp/fragment/MessagePopover.fragment.xml",
						"webapp/i18n/i18n.properties",
						"webapp/localService/mockdata/Employees_3.json",
						"webapp/localService/mockdata/Employees.json",
						"webapp/localService/response/ODataErrorResponseTemplate.json",
						"webapp/localService/response/SAP-Message-Header.json",
						"webapp/localService/metadata.xml",
						"webapp/localService/mockserver.js",
						"webapp/view/App.view.xml",
						"webapp/view/Employee.view.xml",
						"webapp/view/NotFound.view.xml",
						"webapp/Component.js",
						"webapp/index.html",
						"webapp/manifest.json"
					]
				}
			}
		}
	});
});
