/*global QUnit, sinon */
(function() {
	"use strict";

	QUnit.module("Core boot Debug", {
		before: function() {
			var oTestModule = this;
			this.requireSyncStub = sinon.spy(sap.ui, "requireSync");
			window["sap-ui-config"] = {debug: true};
			return new Promise(function(resolve) {
				sap.ui.require(["sap/ui/Device", "sap/base/Log"], function(Device, Log) {

					oTestModule.iExptectedSyncCalls = 3;

					// the Normalize Polyfill is optionally required sync by the FilterProcessor
					if (!String.prototype.normalize && !Device.browser.mobile) {
						oTestModule.iExptectedSyncCalls = 4;
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
			assert.equal(this.requireSyncStub.callCount, this.iExptectedSyncCalls);
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

				assert.equal(oHistory.issues.length, 1, " there should be " + 1 + " issues");

				// If there are issues found check the rule id
				assert.equal(oHistory.issues[0].rule.id, "globalSyncXHR", " should be an issue from rule " + "globalSyncXHR");

				done();
			});

		});

	});

})();