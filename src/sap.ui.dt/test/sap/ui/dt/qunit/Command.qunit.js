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

	QUnit.test("when getting a SimpleFormMove command,", function(assert) {
		var oCmd = new sap.ui.dt.command.SimpleFormMove({
			elementId : 'id_of_SimpleForm',
			movedElement : 'id_of_FormContainer_or_FormElement',
			source : {
				aggregation : 'formContainer_or_formElements',
				index : 0
			},
			target : {
				aggregation : 'formContainer_or_formElements',
				index : 1
			}
		});
		assert.ok(oCmd, "then command can be instantiated");
	});

})();
