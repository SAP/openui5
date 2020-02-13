/*global QUnit, sinon */
(function() {
	"use strict";

	QUnit.module("Core boot", {
		before: function() {
			var oTestModule = this;

			this.requireSyncStub = sinon.spy(sap.ui, "requireSync");
			window["sap-ui-config"] = {support: ["a", "b"]};
			return new Promise(function(resolve) {
				sap.ui.require(["sap/ui/Device", "sap/base/Log"], function(Device, Log) {

					// Note: Expected synchronous requests for the following modules:

					// sap/ui/core/support/Support.js
					// sap/ui/support/Bootstrap.js
					// sap/ui/base/Object.js
					// In case preloads are used, there is also an additional sync request for the sap.ui.core library-preload.js

					oTestModule.iExpectedMaxSyncCalls = 4;

					// the Normalize Polyfill is optionally required sync by the FilterProcessor
					if (!String.prototype.normalize && Device.system.desktop) {
						oTestModule.iExpectedMaxSyncCalls = 5;
					}

					Log.logSupportInfo(true);
					Log.setLevel(4);
					sap.ui.require(["sap/ui/core/Core"], function(core) {
						core.boot();
						core.attachInit(resolve);
					});
				});
			});
		},
		after: function(assert) {
			assert.ok(this.requireSyncStub.callCount <= this.iExpectedMaxSyncCalls,
				"the number of sync requests does not exceed the defined maximum of " + this.iExpectedMaxSyncCalls + " calls");
			this.requireSyncStub.restore();
		}
	});

	QUnit.test("globalSyncXHR", function(assert) {
		var done = assert.async();

		sap.ui.require(["sap/ui/support/RuleAnalyzer", "jquery.sap.script"], function(RuleAnalyzer /* jquery.sap.script */) {
			RuleAnalyzer.analyze({
					type: "global"
				},
				[{
					libName: "sap.ui.core",
					ruleId: "globalSyncXHR"
				}]
			).then(function() {
				var oHistory = RuleAnalyzer.getLastAnalysisHistory();

				assert.equal(oHistory.issues.length, 2, " there should be " + 2 + " issues");

				// If there are issues found check the rule id
				assert.equal(oHistory.issues[0].rule.id, "globalSyncXHR", " should be an issue from rule " + "globalSyncXHR");

				done();
			});

		});

	});

})();
