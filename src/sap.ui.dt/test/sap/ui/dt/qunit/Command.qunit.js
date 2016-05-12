/* global QUnit sinon */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.Input");
jQuery.sap.require("sap.ui.dt.command.BaseCommand");
jQuery.sap.require("sap.ui.dt.command.CommandFactory");

(function() {
	"use strict";

	var CommandFactory = sap.ui.dt.command.CommandFactory;

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a command factory", {
		beforeEach : function(assert) {
			this.oVisibleControl = new sap.m.Button();
		},
		afterEach : function(assert) {
			this.oVisibleControl.destroy();
		}
	});

	QUnit.test("when getting a base command,", function(assert) {
		var oCmd = new sap.ui.dt.command.BaseCommand();
		assert.ok(oCmd, "then command can be instantiated");
	});

	QUnit.test("when getting a move command,", function(assert) {
		var oCmd = CommandFactory.getCommandFor(this.oVisibleControl, "Move");
		assert.ok(oCmd, "then command can be instantiated");
		assert.strictEqual(oCmd.getName(), "Move");
		assert.strictEqual(oCmd.getElement(), this.oVisibleControl);
	});

})();
