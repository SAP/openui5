/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/util/DocumentationRouter",
	"./TestUtil",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
],
function (
	DocumentationRouter,
	TestUtil
) {
	"use strict";

	const SPECIAL_ROUTE_TEST_CASES = {
		// Static i.e. conventional URLs:
		// For these URLs, the URL tokens [listed below] FOLLOW the '#'
		// e.g. demokitBaseURL#/api/sap.ui.base.ManagedObject%23overview
		// The URL tokens contain '%23' (i.e. always encoded #) to separate the token parts
		STATIC_ONLY: {
			"/api/sap.ui.base.ManagedObject%23overview": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject%23overview" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "overview" }
			},
			"/api/sap.ui.base.ManagedObject%23properties": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject%23properties" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "properties" }
			},
			"/api/sap.ui.base.ManagedObject%23constructor": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject%23constructor" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "constructor" }
			},
			"/api/sap.ui.base.ManagedObject%23events": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject%23events" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "events" }
			},
			"/api/sap.ui.base.ManagedObject%23events/Summary": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject%23events", p1: "Summary" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "events", entityId: "Summary" }
			},
			"/api/sap.ui.base.ManagedObject%23events/formatError": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject%23events", p1: "formatError" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "events", entityId: "formatError" }
			},
			"/api/sap.ui.base.ManagedObject%23methods": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject%23methods" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "methods" }
			},
			"/api/sap.ui.base.ManagedObject%23methods/Summary": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject%23methods", p1: "Summary" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "methods", entityId: "Summary" }
			},
			"/api/sap.ui.base.ManagedObject%23methods/addAggregation": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject%23methods", p1: "addAggregation" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "methods", entityId: "addAggregation" }
			},
			"/api/sap.ui.base.ManagedObject%23specialsettings": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject%23specialsettings" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "specialsettings" }
			},
			"/api/module:sap/ui/core/date/UI5Date%23methods/sap/ui/core/date/UI5Date.getInstance": {
				expectedPatternMatch: { id: "module:sap", p1: "ui", p2: "core", p3: "date", p4: "UI5Date%23methods",
					p5: "sap", p6: "ui", p7: "core", p8: "date", p9: "UI5Date.getInstance" },
				expectedDecoderOutput: { id: "module:sap/ui/core/date/UI5Date", entityType: "methods",
					entityId: "sap/ui/core/date/UI5Date.getInstance" }
			}
		},

		// SEO Urls:
		// For these URLs, the URL tokens [listed below] CONTAIN '#'
		// e.g. demokitBaseURL/api/sap.ui.base.ManagedObject#overview
		// The URL tokens use the '#' to separate the token parts
		SEO_ONLY: {
			"/api/sap.ui.base.ManagedObject#overview": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject#overview" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "overview" }
			},
			"/api/sap.ui.base.ManagedObject#properties": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject#properties" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "properties" }
			},
			"/api/sap.ui.base.ManagedObject#constructor": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject#constructor" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "constructor" }
			},
			"/api/sap.ui.base.ManagedObject#events": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject#events" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "events" }
			},
			"/api/sap.ui.base.ManagedObject#events/Summary": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject#events", p1: "Summary" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "events", entityId: "Summary" }
			},
			"/api/sap.ui.base.ManagedObject#events/formatError": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject#events", p1: "formatError" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "events", entityId: "formatError" }
			},
			"/api/sap.ui.base.ManagedObject#methods": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject#methods" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "methods" }
			},
			"/api/sap.ui.base.ManagedObject#methods/Summary": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject#methods", p1: "Summary" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "methods", entityId: "Summary" }
			},
			"/api/sap.ui.base.ManagedObject#methods/addAggregation": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject#methods", p1: "addAggregation" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "methods", entityId: "addAggregation" }
			},
			"/api/sap.ui.base.ManagedObject#specialsettings": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject#specialsettings" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "specialsettings" }
			},
			"/api/module:sap/ui/core/date/UI5Date#methods/sap/ui/core/date/UI5Date.getInstance": {
				expectedPatternMatch: { id: "module:sap", p1: "ui", p2: "core", p3: "date", p4: "UI5Date#methods",
					p5: "sap", p6: "ui", p7: "core", p8: "date", p9: "UI5Date.getInstance" },
				expectedDecoderOutput: { id: "module:sap/ui/core/date/UI5Date", entityType: "methods",
					entityId: "sap/ui/core/date/UI5Date.getInstance" }
			}
		},

		// URL tokens that should work in any deployment type:
		// They do not use NEITHER '#' NOR '%23'
		// and instead use '/' to separate the token parts
		// e.g. both should work in any deployment type:
		// (1) demokitBaseURL/#/api/sap.ui.base.ManagedObject/overview
		// (2) demokitBaseURL/api/sap.ui.base.ManagedObject/overview
		SEO_STATIC_BOTH: {
			"/api/sap.base": {
				expectedPatternMatch: { id: "sap.base" },
				expectedDecoderOutput: { id: "sap.base" }
			},
			"/api/sap.ui.base.ManagedObject": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject" }
			},
			"/api/sap.ui.base.ManagedObject/overview": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject", p1: "overview" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "overview" }
			},
			"/api/sap.ui.base.ManagedObject/properties": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject", p1: "properties" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "properties" }
			},
			"/api/sap.ui.base.ManagedObject/constructor": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject", p1: "constructor" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "constructor" }
			},
			"/api/sap.ui.base.ManagedObject/events": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject", p1: "events" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "events" }
			},
			"/api/sap.ui.base.ManagedObject/events/Summary": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject", p1: "events", p2: "Summary" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "events", entityId: "Summary" }
			},
			"/api/sap.ui.base.ManagedObject/events/formatError": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject", p1: "events", p2: "formatError" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "events", entityId: "formatError" }
			},
			"/api/sap.ui.base.ManagedObject/methods": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject", p1: "methods" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "methods" }
			},
			"/api/sap.ui.base.ManagedObject/methods/Summary": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject", p1: "methods", p2: "Summary" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "methods", entityId: "Summary" }
			},
			"/api/sap.ui.base.ManagedObject/methods/addAggregation": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject", p1: "methods", p2: "addAggregation" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "methods", entityId: "addAggregation" }
			},
			"/api/sap.ui.base.ManagedObject/specialsettings": {
				expectedPatternMatch: { id: "sap.ui.base.ManagedObject", p1: "specialsettings" },
				expectedDecoderOutput: { id: "sap.ui.base.ManagedObject", entityType: "specialsettings" }
			},
			"/api/module:sap/ui/core/date/UI5Date": {
				expectedPatternMatch: { id: "module:sap", p1: "ui", p2: "core", p3: "date", p4: "UI5Date" },
				expectedDecoderOutput: { id: "module:sap/ui/core/date/UI5Date" }
			},
			"/api/module:sap/ui/core/date/UI5Date/methods/sap/ui/core/date/UI5Date.getInstance": {
				expectedPatternMatch: { id: "module:sap", p1: "ui", p2: "core", p3: "date", p4: "UI5Date",
					p5: "methods", p6: "sap", p7: "ui", p8: "core", p9: "date", p10: "UI5Date.getInstance" },
				expectedDecoderOutput: { id: "module:sap/ui/core/date/UI5Date", entityType: "methods",
					entityId: "sap/ui/core/date/UI5Date.getInstance" }
			}
		}
	};

	const Utils = {
		getDecoderExpectedReturnValue: function (oDecodedValue) {
			return Object.assign({
				id: undefined,
				entityId: undefined,
				entityType: undefined
			}, oDecodedValue);
		},
		getSpecialRouteEventArguments: function(oArguments) {
			const oResult = {
				id: undefined
			};
			for (var i = 1; i <= 15; i++) {
				oResult["p" + i] = undefined;
			}

			return Object.assign(oResult, oArguments);
		},
		createRouter: function(oManifest) {
			var oRoutingManifestEntry = oManifest["sap.ui5"].routing,
				oRoutingConfig = oRoutingManifestEntry.config,
				aRoutes = oRoutingManifestEntry.routes;
			return new DocumentationRouter(aRoutes, oRoutingConfig, null, oRoutingManifestEntry.targets);
		}
	};


	function addSpecialRouteTests(bStaticDeplayment) {

		const sDeploymentType = bStaticDeplayment ? "static" : "SEOptimized";

		QUnit.module("apiSpecialRoute " + sDeploymentType + " deployment", {

			before: function(assert) {

				this.oTestCases = bStaticDeplayment
					? Object.assign({}, SPECIAL_ROUTE_TEST_CASES.STATIC_ONLY, SPECIAL_ROUTE_TEST_CASES.SEO_STATIC_BOTH)
					: Object.assign({}, SPECIAL_ROUTE_TEST_CASES.SEO_ONLY, SPECIAL_ROUTE_TEST_CASES.SEO_STATIC_BOTH);

				this.originalDeploymentTypeFlag = window['sap-ui-documentation-static'];
				window['sap-ui-documentation-static'] = bStaticDeplayment;

				var done = assert.async();

				TestUtil.createRouter()
					.then(function (oRouter) {
						this.oRouter = oRouter;
						done();
					}.bind(this))
					.catch(function (err) {
						assert.notOk("invalid test setup " + err);
						done();
					});
			},
			after: function() {
				window['sap-ui-documentation-static'] = this.originalDeploymentTypeFlag;
				this.oRouter.destroy();
				this.oRouter = null;
			}
		});

		QUnit.test("_decodeSpecialRouteArguments", function (assert) {
			const oRoute = this.oRouter.getRoute("apiSpecialRoute");
			const oRouteMatchedSpy = this.spy(oRoute, "_routeMatched");

			Object.keys(this.oTestCases).forEach(function(sUrlPath) {
				const oTestCase = this.oTestCases[sUrlPath],
					oExpectedPatternMatch = Utils.getSpecialRouteEventArguments(oTestCase.expectedPatternMatch),
					oExpectedDecoderOutput = Utils.getDecoderExpectedReturnValue(oTestCase.expectedDecoderOutput);

				oRouteMatchedSpy.reset();

				// Act: call the router to first verify the expected 'patternMatched' event arguments
				this.oRouter.parse(sUrlPath);

				// check 'patternMatched' event arguments as this is prerequisite for the actual test
				assert.ok(oRouteMatchedSpy.calledWithMatch(oExpectedPatternMatch), "correct 'patternMatched' event arguments for " + sUrlPath);

				// Act: synchronously call the tested function
				const oOutput = this.oRouter._decodeSpecialRouteArguments(oExpectedPatternMatch);

				// Check
				assert.deepEqual(oOutput, oExpectedDecoderOutput, "correctly decoded result for " + sUrlPath);
			}.bind(this));
		});
	}

	addSpecialRouteTests(true /* static */);
	addSpecialRouteTests(false /* SEOptimized */);
});