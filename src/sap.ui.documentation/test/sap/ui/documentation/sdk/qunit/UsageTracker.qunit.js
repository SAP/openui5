/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/UsageTracker",
	"sap/base/i18n/Localization",
	"./TestUtil"],
function (UsageTracker, Localization, TestUtil) {
	"use strict";

	const aSections = ["home", "documentation", "apiReference", "samples", "demoApps", "resources"];

	function removeLegacyRoutes(aRoutes) {
		return aRoutes.filter(function (oRoute) {
			return oRoute.name.toLowerCase().indexOf("legacy") === -1;
		});
	}

	function MockObjectsFactory(oManifest) {
		var oTracker,
			oRouter = createMockRouter(oManifest),
			oMockAppComponent = createMockAppComponent(oManifest);

		associateRouterWithComponent(oRouter, oMockAppComponent);
		oTracker = new UsageTracker(oMockAppComponent);

		this.getRouter = function() {
			return oRouter;
		};
		this.getTracker = function() {
			return oTracker;
		};

		// keep in closure to prevent being called from outside
		function createMockAppComponent(oManifest) {
			return {
				getConfig: function() {
					return oManifest["sap.ui5"].config;
				}
			};
		}
		function createMockRouter(oManifest) {
			var oRouter = TestUtil.createRouterFromManifest(oManifest);
				oRouter.getConfig = function () {
					return oManifest["sap.ui5"].routing;
				};
			return oRouter;
		}
		function associateRouterWithComponent(oRouter, oMockAppComponent) {
			oMockAppComponent.getRouter = function () {
				return oRouter;
			};
			oRouter._getOwnerComponent = function () {
				return oMockAppComponent;
			};
		}
	}

	QUnit.module("getPageInfoFromRoute", {
		before: function (assert) {
			var done = assert.async();
			TestUtil.getManifest().then(function (oManifest) {
				const aRoutes = oManifest["sap.ui5"].routing.routes,
					aRoutesToTest = removeLegacyRoutes(aRoutes),
					oMockObjectsFactory = new MockObjectsFactory(oManifest);
				this.oRouter = oMockObjectsFactory.getRouter();
				this.oTracker = oMockObjectsFactory.getTracker();
				this.aRoutesToTest = aRoutesToTest;
				this.stubGetTitle = sinon.stub(this.oTracker, "_composeDefaultPageTitleFromRoute").returns(""); // not relevant to this test

				this.oTracker.start();
				done();
			}.bind(this))
			.catch(function(error) {
				assert.ok(false, "Could not load manifest.json file: " + error);
				done();
			});
		},
		after: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.oRouter.destroy();
			this.oRouter = null;
		}
	});


	QUnit.test("tracks correct section for each route", function (assert) {
		this.aRoutesToTest.forEach(function (oRouteConfig) {
			var sRouteName = oRouteConfig.name,
				oRouteMatchEventParameters = {
					config: oRouteConfig
				};
			this.oTracker._getPageInfoFromRoute(oRouteMatchEventParameters, function (oPageInfo) {
				var sSection = oPageInfo.section;
				assert.ok(sSection, "section for route " + sRouteName + " is defined");
				assert.ok(aSections.includes(sSection), "section " + sSection + " matches one of the main sections");
			});
		}, this);
	});
	QUnit.test("tracks localization info", function (assert) {
			var oUserLanguageTag = Localization.getLanguageTag(),
				sExpectedLanguage = oUserLanguageTag.language,
				sExpectedRegion = oUserLanguageTag.region,
				oRouteConfig = this.aRoutesToTest[0],
				oRouteMatchEventParameters = {
					config: oRouteConfig
				};
			this.oTracker._getPageInfoFromRoute(oRouteMatchEventParameters, function (oPageInfo) {
				assert.equal(oPageInfo.language, sExpectedLanguage, "language is correct");
				assert.equal(oPageInfo.country, sExpectedRegion, "region is correct");
			});

	});
});