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

	var BrokenNavigationFactory = ServiceFactory.extend("test.service.BrokenNavigationFactory", {
		createInstance: function (oServiceContext) {
			return new Promise(function (resolve) {
				sap.ui.require(["test-resources/sap/ui/integration/qunit/services/BrokenNavigation"], function (BrokenNavigation) {
					resolve(new BrokenNavigation(oServiceContext));
				});
			});
		}
	});
	var oBrokenNavigationFactory = new BrokenNavigationFactory();
	ServiceFactoryRegistry.register("test.service.BrokenNavigationFactory", oBrokenNavigationFactory);

	return {
		"navigation": oNavigationFactory,
		"brokenNavigation": oBrokenNavigationFactory
	};
}, true);
