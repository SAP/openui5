/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	CommandFactory,
	SmartVariantManagementWriteAPI,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("Given a control", {
		beforeEach: function() {
			this.oControl = new Control();
			this.oActivateStub = sandbox.stub();
			this.oControl.activateVariant = this.oActivateStub;
			this.oSetModifiedStub = sandbox.stub();
			this.oControl.setModified = this.oSetModifiedStub;
			this.oDiscardVariantContentStub = sandbox.stub(SmartVariantManagementWriteAPI, "discardVariantContent");
			this.oRevertStub = sandbox.stub(SmartVariantManagementWriteAPI, "revert");
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
			return CommandFactory.getCommandFor(this.oControl, "compVariantSwitch", {
				sourceVariantId: sSourceVariantId,
				targetVariantId: sTargetVariantId
			}, {})
			.then(function(oCreatedCommand) {
				oSwitchCommand = oCreatedCommand;
				assert.equal(oSwitchCommand.getSourceVariantId(), sSourceVariantId, "the property was properly set");
				assert.equal(oSwitchCommand.getTargetVariantId(), sTargetVariantId, "the property was properly set");
				assert.notOk(oSwitchCommand.getDiscardVariantContent(), "the discardVariantContent property was not set");

				return oSwitchCommand.execute();
			}).then(function() {
				assert.equal(this.oActivateStub.callCount, 1, "on execute, activate was called");
				assert.equal(this.oActivateStub.lastCall.args[0], sTargetVariantId, "with the correct ID");
				assert.ok(this.oDiscardVariantContentStub.notCalled, "discardVariantContent was not called");
				assert.ok(this.oSetModifiedStub.notCalled, "setModified was not called on the control");

				return oSwitchCommand.undo();
			}.bind(this)).then(function() {
				assert.equal(this.oActivateStub.callCount, 2, "on undo, activate was called again");
				assert.equal(this.oActivateStub.lastCall.args[0], sSourceVariantId, "with the correct ID");
				assert.ok(this.oDiscardVariantContentStub.notCalled, "discardVariantContent was not called");
				assert.ok(this.oSetModifiedStub.notCalled, "setModified was not called on the control");

				return oSwitchCommand.execute();
			}.bind(this)).then(function() {
				assert.equal(this.oActivateStub.callCount, 3, "on redo, activate was called again");
				assert.equal(this.oActivateStub.lastCall.args[0], sTargetVariantId, "with the correct ID");
				assert.ok(this.oDiscardVariantContentStub.notCalled, "discardVariantContent was not called");
				assert.ok(this.oSetModifiedStub.notCalled, "setModified was not called on the control");
			}.bind(this));
		});

		QUnit.test("when a CompVariantSwitch command is created, executed, undone and redone - discarding changes on source variant", function(assert) {
			var oSwitchCommand;
			var sTargetVariantId = "foo";
			var sSourceVariantId = "bar";
			return CommandFactory.getCommandFor(this.oControl, "compVariantSwitch", {
				sourceVariantId: sSourceVariantId,
				targetVariantId: sTargetVariantId,
				discardVariantContent: true
			}, {})
			.then(function(oCreatedCommand) {
				oSwitchCommand = oCreatedCommand;
				assert.equal(oSwitchCommand.getSourceVariantId(), sSourceVariantId, "the property was properly set");
				assert.equal(oSwitchCommand.getTargetVariantId(), sTargetVariantId, "the property was properly set");
				assert.ok(oSwitchCommand.getDiscardVariantContent(), "the discardVariantContent property was set");

				return oSwitchCommand.execute();
			}).then(function() {
				assert.equal(this.oActivateStub.callCount, 1, "on execute, activate was called");
				assert.equal(this.oActivateStub.lastCall.args[0], sTargetVariantId, "with the correct ID");
				assert.ok(this.oDiscardVariantContentStub.called, "discardVariantContent was called");
				assert.equal(this.oSetModifiedStub.callCount, 1, "setModified was called on the control");
				assert.notOk(this.oSetModifiedStub.lastCall.args[0], "with value 'false'");

				return oSwitchCommand.undo();
			}.bind(this)).then(function() {
				assert.equal(this.oActivateStub.callCount, 2, "on undo, activate was called again");
				assert.equal(this.oActivateStub.lastCall.args[0], sSourceVariantId, "with the correct ID");
				assert.ok(this.oRevertStub.called, "revert was called");
				assert.equal(this.oSetModifiedStub.callCount, 2, "setModified was called again on the control");
				assert.ok(this.oSetModifiedStub.lastCall.args[0], "with value 'true'");

				return oSwitchCommand.execute();
			}.bind(this)).then(function() {
				assert.equal(this.oActivateStub.callCount, 3, "on redo, activate was called again");
				assert.equal(this.oActivateStub.lastCall.args[0], sTargetVariantId, "with the correct ID");
				assert.ok(this.oDiscardVariantContentStub.called, "discardVariantContent was called");
				assert.equal(this.oSetModifiedStub.callCount, 3, "setModified was called again on the control");
				assert.notOk(this.oSetModifiedStub.lastCall.args[0], "with value 'false'");
			}.bind(this));
		});
	});
});