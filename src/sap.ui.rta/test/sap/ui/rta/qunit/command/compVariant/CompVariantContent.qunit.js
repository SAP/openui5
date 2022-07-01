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

	function assertApplyVariantByPersistencyKeyCalled(assert, oCommand, oContent) {
		assert.strictEqual(this.oApplyVariantByPersistencyKeyStub.callCount, 1, "then _applyVariantByPersistencyKey was called");
		assert.strictEqual(this.oApplyVariantByPersistencyKeyStub.lastCall.args[0], "myKey", "then the key was passed correctly");
		var oExpectedContent = { myKey: oContent };
		assert.deepEqual(this.oApplyVariantByPersistencyKeyStub.lastCall.args[1], oExpectedContent, "then the content was passed correctly");
		assert.strictEqual(this.oApplyVariantByPersistencyKeyStub.lastCall.args[2], "KEY_USER", "then the role was passed correctly");
		assert.deepEqual(oCommand.getOldContent(), this.oOldContent, "then the old content was set");
		this.oApplyVariantByPersistencyKeyStub.reset();
	}

	function assertApplyVariantCalled(assert, oCommand, oContent) {
		assert.strictEqual(this.oApplyVariantStub.callCount, 1, "then _applyVariantByPersistencyKey was called");
		assert.strictEqual(this.oApplyVariantStub.lastCall.args[0], this.sMyPersoController, "then the key was passed correctly");
		assert.deepEqual(this.oApplyVariantStub.lastCall.args[1], oContent, "then the content was passed correctly");
		assert.strictEqual(this.oApplyVariantStub.lastCall.args[2], "KEY_USER", "then the role was passed correctly");
		assert.deepEqual(oCommand.getOldContent(), this.oOldContent, "then the old content was set");
		this.oApplyVariantStub.reset();
	}

	QUnit.module("Given a control", {
		beforeEach: function() {
			this.oControl = new Control();

			this.oNewContent = { content: "newContent" };
			this.oOldContent = { content: "oldContent" };

			this.oIsPageVariantStub = sandbox.stub();
			this.oControl.isPageVariant = this.oIsPageVariantStub;

			this.oApplyVariantByPersistencyKeyStub = sandbox.stub();
			this.oControl._applyVariantByPersistencyKey = this.oApplyVariantByPersistencyKeyStub;

			this.oApplyVariantStub = sandbox.stub();
			this.oControl._applyVariant = this.oApplyVariantStub;

			this.sMyPersoController = "myPersoController";
			this.oGetPersoControllerStub = sandbox.stub().returns(this.sMyPersoController);
			this.oControl._getPersoController = this.oGetPersoControllerStub;

			this.oGetVariantContent = sandbox.stub();
			this.oControl._getVariantContent = this.oGetVariantContent;
		},
		afterEach: function() {
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a CompVariantContent command is created, executed, undone and redone for a page variant", function(assert) {
			var oCommand;
			this.oIsPageVariantStub.returns(true);
			this.oGetVariantContent.returns({ myKey: this.oOldContent });

			return CommandFactory.getCommandFor(this.oControl, "compVariantContent", {
				variantId: "myId",
				persistencyKey: "myKey",
				newContent: this.oNewContent
			}, {})
				.then(function(oCreatedCommand) {
					oCommand = oCreatedCommand;

					return oCommand.execute();
				}).then(function() {
					assertApplyVariantByPersistencyKeyCalled.call(this, assert, oCommand, this.oNewContent);

					return oCommand.undo();
				}.bind(this)).then(function() {
					assertApplyVariantByPersistencyKeyCalled.call(this, assert, oCommand, this.oOldContent);

					return oCommand.execute();
				}.bind(this)).then(function() {
					assertApplyVariantByPersistencyKeyCalled.call(this, assert, oCommand, this.oNewContent);
				}.bind(this));
		});

		QUnit.test("when a CompVariantContent command is created, executed, undone and redone", function(assert) {
			var oCommand;
			this.oIsPageVariantStub.returns(false);
			this.oGetVariantContent.returns(this.oOldContent);

			return CommandFactory.getCommandFor(this.oControl, "compVariantContent", {
				variantId: "myId",
				persistencyKey: "myKey",
				newContent: this.oNewContent
			}, {})
				.then(function(oCreatedCommand) {
					oCommand = oCreatedCommand;

					return oCommand.execute();
				}).then(function() {
					assertApplyVariantCalled.call(this, assert, oCommand, this.oNewContent);

					return oCommand.undo();
				}.bind(this)).then(function() {
					assertApplyVariantCalled.call(this, assert, oCommand, this.oOldContent);

					return oCommand.execute();
				}.bind(this)).then(function() {
					assertApplyVariantCalled.call(this, assert, oCommand, this.oNewContent);
				}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});