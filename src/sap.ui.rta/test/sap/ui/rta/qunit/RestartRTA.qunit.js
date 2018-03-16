/*global QUnit*/

(function() {
	"use strict";

	jQuery.sap.require("sap.ui.qunit.qunit-coverage");

	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
	jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

	jQuery.sap.require("sap.ui.rta.RuntimeAuthoring");

	var RTA = sap.ui.rta.RuntimeAuthoring;

	var sLayer = "CUSTOMER";

	QUnit.module("Given I use restart of RTA", {

		beforeEach : function(assert) {
			RTA.disableRestart(sLayer);
		},
		afterEach : function(assert) {
			RTA.disableRestart(sLayer);
		}
	});

	QUnit.test("when in INITAL status", function(assert) {

		var bRestart = RTA.needsRestart(sLayer);

		assert.equal(bRestart, false, "then no restart is needed");
	});

	QUnit.test("when I want to restart", function(assert) {

		RTA.enableRestart(sLayer);

		var bRestart = RTA.needsRestart(sLayer);

		assert.equal(bRestart, true, "then the restart is needed");
	});

	QUnit.test("when I want disable the restart later", function(assert) {

		RTA.enableRestart(sLayer);
		RTA.enableRestart(sLayer);
		RTA.enableRestart(sLayer);

		RTA.disableRestart(sLayer);

		var bRestart = RTA.needsRestart(sLayer);

		assert.equal(bRestart, false, "then no restart is needed");
	});

})();
