/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/util/UsageTracker",
	"sap/base/i18n/Localization"],
function (UsageTracker, Localization) {
	"use strict";

	const testRouteTitle = "test title",
		sVersionName = {
			"openui5": "OpenUI5 Distribution",
			"sapui5": "SAPUI5 Distribution"
		},
		sSiteName = {
			"openui5": "oui5",
			"sapui5": "ui5"
		},
		trackerEventId = {
			"sessionStart": "globalDL",
			"pageView": "pageView",
			"publish": "stBeaconReady"
		};

	var oFactory = (function () {
		return {
			getAppComponent: function() {
				var oMockAppComponent = createMockAppComponent(),
					oMockRouter = createMockRouter();
				associateRouterWithComponent(oMockRouter, oMockAppComponent);

				// keep in closure to prevent being called directly from outside
				function createMockAppComponent() {
					return {
						getConfig: function() {
							return {};
						}
					};
				}
				function createMockRouter() {
					return {
						attachRouteMatched: function () {}, // not relevant to this test
						attachBypassed: function () {}, // not relevant to this test
						attachEvent: function () {}, // not relevant to this test
						detachRouteMatched: function () {}, // not relevant to this test
						detachBypassed: function () {}, // not relevant to this test
						detachEvent: function () {}, // not relevant to this test
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
				return oMockAppComponent;
			},
			getRouteMatchEventParameters: function (sRouteName){
				return {
					eventId: "routeMatched",
					name: sRouteName,
					config: {
						name: sRouteName
					}
				};
			},
			getSessionStartEventObject: function(sSiteName) {
				return {
					event: trackerEventId.sessionStart,
					site: {
						name: sSiteName
					},
					'user': {
						'loginStatus': 'no'
					}
				};
			}
		};
	})();

	QUnit.module("getPageInfo", {
		before: function () {
			this.oTracker = new UsageTracker(oFactory.getAppComponent());
			this.oTracker.start(sVersionName.sapui5);
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
			oRouteMatchEventParameters = oFactory.getRouteMatchEventParameters("apiId");

		this.oTracker._getPageInfoFromRoute(oRouteMatchEventParameters, function (oPageInfo) {
			assert.equal(oPageInfo.language, sExpectedLanguage, "language is correct");
			assert.equal(oPageInfo.country, sExpectedRegion, "region is correct");
		});
	});

	QUnit.module("session-start event", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(new oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute")
				.returns(""); // not relevant to this test
		},
		afterEach: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	QUnit.test("result of _getSiteName is correct", function (assert) {
		// act
		var sTracketVersionNameSAPUI5 = this.oTracker._getSiteName(sVersionName.sapui5),
			sTracketVersionNameOpenui5 = this.oTracker._getSiteName(sVersionName.openui5);

		// assert
		assert.strictEqual(sTracketVersionNameSAPUI5, sSiteName.sapui5, "Site name for SAPUI6 is correct as expected by remote site-registry (AA-side)");
		assert.strictEqual(sTracketVersionNameOpenui5, sSiteName.openui5, "Site name for OpenUI5 is correct as expected by remote site-registry (AA-side)");
	});

	QUnit.test("session-start event is logged", function (assert) {
		var oSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			sTestSiteName = "testSiteName",
			oExpectedEventContent = oFactory.getSessionStartEventObject(sTestSiteName);
		this.sandbox.stub(this.oTracker, "_getSiteName").returns(sTestSiteName);

		// act
		this.oTracker.start();

		// assert
		assert.ok(oSpy.calledOnceWithExactly, oExpectedEventContent, "session-start is logged with correct content");
	});

	QUnit.test("session-start event precedes pageView events", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			sTestSiteName = "testSiteName",
			oMockRouteEventDetail = oFactory.getRouteMatchEventParameters("welcome");

		// act
		this.oTracker.start(sTestSiteName, [oMockRouteEventDetail]);

		// assert low level logs order
		assert.ok(oAddToLogsSpy.calledThrice, "3 events are logged");
		assert.ok(oAddToLogsSpy.firstCall.calledWithMatch({event: trackerEventId.sessionStart}), "first event is for session-start");
		assert.ok(oAddToLogsSpy.secondCall.calledWithMatch({event: trackerEventId.pageView}), "second event is for pageView");
		assert.ok(oAddToLogsSpy.lastCall.calledWithMatch({event: trackerEventId.publish}), "last event is for publishing the logs");
	});

	QUnit.module("page re-visit", {
		beforeEach: function () {
			this.oTracker = new UsageTracker(new oFactory.getAppComponent());
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub(this.oTracker, "_composeDefaultPageTitleFromRoute")
				.returns(""); // not relevant to this test
		},
		afterEach: function () {
			this.oTracker.destroy();
			this.oTracker = null;
			this.sandbox.restore();
		}
	});

	QUnit.test("duplicate routeMatched event is ignored", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			sTestSiteName = "testSiteName",
			oMockRouteEventDetail = oFactory.getRouteMatchEventParameters("welcome");

		this.oTracker.start(sTestSiteName);
		oAddToLogsSpy.resetHistory();

		// act
		this.oTracker._logRouteMatched(oMockRouteEventDetail);
		assert.ok(oAddToLogsSpy.firstCall.calledWithMatch({event: trackerEventId.pageView}), "page-view event is logged");
		assert.ok(oAddToLogsSpy.secondCall.calledWithMatch({event: trackerEventId.publish}), "page-view event is logged");

		oAddToLogsSpy.resetHistory();

		// act: log the same event again
		this.oTracker._logRouteMatched(oMockRouteEventDetail);
		assert.strictEqual(oAddToLogsSpy.callCount, 0, "the duplicate event is ignored");
	});

	QUnit.test("lofs page re-visit after restarting the tracker", function (assert) {
		var oAddToLogsSpy = this.sandbox.spy(this.oTracker, "_addToLogs"),
			sTestSiteName = "testSiteName",
			oMockRouteEventDetail = oFactory.getRouteMatchEventParameters("welcome");

		this.oTracker.start(sTestSiteName);
		oAddToLogsSpy.resetHistory();

		// act: log first route
		this.oTracker._logRouteMatched(oMockRouteEventDetail);
		assert.ok(oAddToLogsSpy.calledTwice, "page-view event is logged");

		this.oTracker.stop();
		this.oTracker.start(sTestSiteName);
		oAddToLogsSpy.resetHistory();

		// act: revisit first route again
		this.oTracker._logRouteMatched(oMockRouteEventDetail);
		assert.ok(oAddToLogsSpy.calledTwice, "page-view event is logged");
	});
});