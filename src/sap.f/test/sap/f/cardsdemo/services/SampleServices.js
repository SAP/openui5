sap.ui.define([
	'sap/ui/core/service/ServiceFactory',
	'sap/ui/core/service/ServiceFactoryRegistry'
], function (ServiceFactory, ServiceFactoryRegistry) {
	"use strict";

	//Factories
	var oFactory = ServiceFactory.extend("cardsdemo.service.SampleNavigationFactory", {
		createInstance: function (oServiceContext) {
			return new Promise(function (resolve) {
				sap.ui.require(["sap/f/cardsdemo/services/SampleNavigation"], function (SampleNavigation) {
					resolve(new SampleNavigation(oServiceContext));
				});
			});
		}
	});
	ServiceFactoryRegistry.register("cardsdemo.service.SampleNavigationFactory", new oFactory());

	return oFactory;
}, true);
