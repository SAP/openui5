/*global QUnit, sinon */
(function() {
	"use strict";

	QUnit.module("Core boot", {
		before: function() {

			this.requireSyncStub = sinon.spy(sap.ui, "requireSync");
			window["sap-ui-config"] = {support: ["a", "b"]};
			return new Promise(function(resolve) {
				sap.ui.require(["sap/base/Log"], function(Log) {
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
			var iCount = 4;
			// Only in IE: the Normalize Polyfill is required sync by the FilterProcessor
			if (!String.prototype.normalize && !sap.ui.Device.browser.mobile) {
				iCount = 5;
			}
			assert.equal(this.requireSyncStub.callCount, iCount);
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