/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/UsageTracker",
	"sap/base/i18n/Localization"],
function (UsageTracker, Localization) {
	"use strict";

	const testRouteTitle = "test title";

	function MockObjectsFactory() {
		var oMockRouter = createMockRouter(),
			oMockAppComponent = createMockAppComponent();

		associateRouterWithComponent(oMockRouter, oMockAppComponent);

		this.getRouter = function() {
			return oMockRouter;
		};
		this.getAppComponent = function() {
			return oMockAppComponent;
		};

		// keep in closure to prevent being called from outside
		function createMockAppComponent() {
			return {
				getConfig: function() {
					return {};
				},
				loadVersionInfo: function() {
					return Promise.resolve();
				},
				getModel: function() {
					return {
						getProperty: function(sProperty) {
							const oMockedProperties = {
								"/versionName": "SAPUI5 Distribution"
							};
							return oMockedProperties[sProperty];
						}
					};
				}
			};
		}
		function createMockRouter() {
			return {
				attachRouteMatched: function () {
					// not relevant to this test
				},
				attachBypassed: function () {	// not relevant to this test
					// not relevant to this test
				},
				attachEvent: function () {
					// not relevant to this test
				},
				getRouteTopLevelTitle: function () {
					return testRouteTitle;
				}
			};
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

	QUnit.module("getPageInfo", {
		before: function () {
			this.oTracker = new UsageTracker(new MockObjectsFactory().getAppComponent());
			this.oTracker.start();
		},
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute")
				.returns(""); // not relevant to this test
		},
		after: function () {
			this.oTracker.destroy();
			this.oTracker = null;
		},
		afterEach: function () {
			this.sandbox.restore();
		}
	});

	QUnit.test("tracks correct section for each route", function (assert) {
		var sRouteName = "apiId",
			oRouteConfig = {
				name: sRouteName
			},
			oRouteMatchEventParameters = {
				config: oRouteConfig
			};
		this.oTracker._getPageInfoFromRoute(oRouteMatchEventParameters, function (oPageInfo) {
			var sSection = oPageInfo.section;
			assert.strictEqual(sSection, testRouteTitle, "section for route " + sRouteName + " is defined");
		});
	});

	QUnit.test("tracks localization info", function (assert) {
		var oUserLanguageTag = Localization.getLanguageTag(),
			sExpectedLanguage = oUserLanguageTag.language,
			sExpectedRegion = oUserLanguageTag.region,
			oRouteMatchEventParameters = {
				config: {
					name: "apiId"
				}
			};
		this.oTracker._getPageInfoFromRoute(oRouteMatchEventParameters, function (oPageInfo) {
			assert.equal(oPageInfo.language, sExpectedLanguage, "language is correct");
			assert.equal(oPageInfo.country, sExpectedRegion, "region is correct");
		});
	});

	QUnit.test("site name is correct", function (assert) {
		var done = assert.async();
		this.oTracker._getSiteName().then(function (sSiteName) {
			assert.strictEqual(sSiteName, "ui5", "Site name is correct as expected by remote site-registry (AA-side)");
			done();
		});
	});

	QUnit.test("site name is tracked", function (assert) {
		var oSpy = this.sandbox.spy(this.oTracker, "_getSiteName");

		// act
		this.oTracker._initRemoteServiceConnector();

		// assert
		assert.ok(oSpy.calledOnce, "_getSiteName is called once");
	});
});