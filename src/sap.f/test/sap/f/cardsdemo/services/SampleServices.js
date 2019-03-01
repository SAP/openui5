sap.ui.define([
	"sap/ui/core/service/ServiceFactory",
	"sap/ui/core/service/ServiceFactoryRegistry"
], function (ServiceFactory, ServiceFactoryRegistry) {
	"use strict";

	//Factories
	var NavigationFactory = ServiceFactory.extend("cardsdemo.service.SampleNavigationFactory", {
		createInstance: function (oServiceContext) {
			return new Promise(function (resolve) {
				sap.ui.require(["sap/f/cardsdemo/services/SampleNavigation"], function (SampleNavigation) {
					resolve(new SampleNavigation(oServiceContext));
				});
			});
		}
	});
	var oNavigationFactory = new NavigationFactory();
	ServiceFactoryRegistry.register("cardsdemo.service.SampleNavigationFactory", oNavigationFactory);

	var UserRecentFactory = ServiceFactory.extend("cardsdemo.service.UserRecentFactory", {
		createInstance: function (oServiceContext) {
			return new Promise(function (resolve) {
				sap.ui.require(["sap/f/cardsdemo/services/UserRecent"], function (UserRecent) {
					resolve(new UserRecent(oServiceContext));
				});
			});
		}
	});
	var oUserRecentFactory = new UserRecentFactory();
	ServiceFactoryRegistry.register("cardsdemo.service.UserRecentFactory", oUserRecentFactory);

	var RandomSalesOrdersFactory = ServiceFactory.extend("cardsdemo.service.RandomSalesOrdersFactory", {
		createInstance: function (oServiceContext) {
			return new Promise(function (resolve) {
				sap.ui.require(["sap/f/cardsdemo/services/RandomSalesOrdersService"], function (RandomSalesOrdersService) {
					resolve(new RandomSalesOrdersService(oServiceContext));
				});
			});
		}
	});
	var oRandomSalesOrdersFactory = new RandomSalesOrdersFactory();
	ServiceFactoryRegistry.register("cardsdemo.service.RandomSalesOrdersFactory", oRandomSalesOrdersFactory);

	return {
		"navigation": oNavigationFactory,
		"data": oUserRecentFactory,
		"randomSalesOrders": oRandomSalesOrdersFactory
	};
}, true);
