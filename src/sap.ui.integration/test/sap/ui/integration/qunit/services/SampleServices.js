sap.ui.define([
	"sap/ui/core/service/ServiceFactory",
	"sap/ui/core/service/ServiceFactoryRegistry"
], function (ServiceFactory, ServiceFactoryRegistry) {
	"use strict";

	//Factories
	var NavigationFactory = ServiceFactory.extend("test.service.SampleNavigationFactory", {
		createInstance: function (oServiceContext) {
			return new Promise(function (resolve) {
				sap.ui.require(["test-resources/sap/ui/integration/qunit/services/SampleNavigation"], function (SampleNavigation) {
					resolve(new SampleNavigation(oServiceContext));
				});
			});
		}
	});
	var oNavigationFactory = new NavigationFactory();
	ServiceFactoryRegistry.register("test.service.SampleNavigationFactory", oNavigationFactory);

	return {
		"navigation": oNavigationFactory
	};
}, true);
