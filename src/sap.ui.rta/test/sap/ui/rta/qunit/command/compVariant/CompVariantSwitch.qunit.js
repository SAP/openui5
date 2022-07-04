/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	CommandFactory,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("Given a control", {
		beforeEach: function() {
			this.oControl = new Control();
		},
		afterEach: function() {
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a CompVariantSwitch command is created, executed, undone and redone", function(assert) {
			var oSwitchCommand;
			var sTargetVariantId = "foo";
			var sSourceVariantId = "bar";
			var oActivateStub = sandbox.stub();
			this.oControl.activateVariant = oActivateStub;
			return CommandFactory.getCommandFor(this.oControl, "compVariantSwitch", {
				sourceVariantId: sSourceVariantId,
				targetVariantId: sTargetVariantId
			}, {})
			.then(function(oCreatedCommand) {
				oSwitchCommand = oCreatedCommand;
				assert.equal(oSwitchCommand.getSourceVariantId(), sSourceVariantId, "the property was properly set");
				assert.equal(oSwitchCommand.getTargetVariantId(), sTargetVariantId, "the property was properly set");

				return oSwitchCommand.execute();
			}).then(function() {
				assert.equal(oActivateStub.callCount, 1, "activate was called");
				assert.equal(oActivateStub.lastCall.args[0], sTargetVariantId, "with the correct ID");

				return oSwitchCommand.undo();
			}).then(function() {
				assert.equal(oActivateStub.callCount, 2, "activate was called again");
				assert.equal(oActivateStub.lastCall.args[0], sSourceVariantId, "with the correct ID");

				return oSwitchCommand.execute();
			}).then(function() {
				assert.equal(oActivateStub.callCount, 3, "activate was called again");
				assert.equal(oActivateStub.lastCall.args[0], sTargetVariantId, "with the correct ID");
			});
		});
	});
});