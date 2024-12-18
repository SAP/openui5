/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/UsageTracker",
	"./TestUtil"],
function (UsageTracker, TestUtil) {
	"use strict";

	const aSections = ["home", "documentation", "apiReference", "samples", "demoApps", "resources"];

	function removeLegacyRoutes(aRoutes) {
		return aRoutes.filter(function (oRoute) {
			return oRoute.name.toLowerCase().indexOf("legacy") === -1;
		});
	}

	TestUtil.getManifest().then(function (oManifest) {
		const aRoutes = oManifest["sap.ui5"].routing.routes,
			aRoutesToTest = removeLegacyRoutes(aRoutes);

		QUnit.module("getPageInfoFromRoute", {

			before: function (assert) {
				var done = assert.async(),
					oRouter = TestUtil.createRouterFromManifest(oManifest),
					oMockComponent = {
						getRouter: function () {
							return oRouter;
						},
						getConfig: function() {
							return oManifest["sap.ui5"].config;
						}
					};
				oRouter._getOwnerComponent = function () {
					return oMockComponent;
				};
				oRouter.getConfig = function () {
					return oManifest["sap.ui5"].routing;
				};
				this.oRouter = oRouter;
				this.oTracker = new UsageTracker(oMockComponent);
				this.stubGetTitle = sinon.stub(this.oTracker, "_composeDefaultPageTitleFromRoute").returns(""); // not relevant to this test
				done();
			},
			after: function () {
				this.oTracker.destroy();
				this.oTracker = null;
				this.oRouter.destroy();
				this.oRouter = null;
			}
		});

		aRoutesToTest.forEach(function (oRouteConfig) {
			var sRouteName = oRouteConfig.name;

			QUnit.test("tracks correct section for route " + sRouteName, function (assert) {
				var done = assert.async(),
					oRouteMatchEventParameters = {
						config: oRouteConfig
					};
				this.oTracker._getPageInfoFromRoute(oRouteMatchEventParameters, function (oPageInfo) {
					var sSection = oPageInfo.section;
					assert.ok(sSection, "section for route " + sRouteName + " is defined");
					assert.ok(aSections.includes(sSection), "section " + sSection + " matches one of the main sections");
					done();
				});
			});
		}, this);
	});
});