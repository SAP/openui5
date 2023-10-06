/* global QUnit */

sap.ui.define([
	"sap/ui/dt/enablement/report/Statistic",
	"sap/ui/core/Core"
],
function(
	Statistic,
	oCore
) {
	"use strict";

	var getValue = function(oControl, sStatus) {
		return oCore.byId(`${oControl.getId()}--form-${sStatus}-value`).getText();
	};

	QUnit.module("Given that a statistic report is created", {
		beforeEach() {
			this.oResult = {
				statistic: {
					SUPPORTED: 10,
					PARTIAL_SUPPORTED: 0,
					NOT_SUPPORTED: 20,
					UNKNOWN: 10,
					ERROR: 5
				}
			};
			this.oStatistic = new Statistic({
				data: this.oResult
			});
			this.oStatistic.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach() {
			this.oStatistic.destroy();
		}
	}, function() {
		QUnit.test("when data are set", function(assert) {
			var {oStatistic} = this;
			assert.equal(getValue(oStatistic, "supported"), this.oResult.statistic.SUPPORTED, "then the supported value is displayed correctly");
			assert.equal(getValue(oStatistic, "partial-supported"), this.oResult.statistic.PARTIAL_SUPPORTED, "and the partial supported value is displayed correctly");
			assert.equal(getValue(oStatistic, "not-supported"), this.oResult.statistic.NOT_SUPPORTED, "and the not-supported value is displayed correctly");
			assert.equal(getValue(oStatistic, "unknown"), this.oResult.statistic.UNKNOWN, "and the unknown value is displayed correctly");
			assert.equal(getValue(oStatistic, "error"), this.oResult.statistic.ERROR, "and the error value is displayed correctly");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});