/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	CommandFactory,
	Layer,
	SmartVariantManagementWriteAPI,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	function assertApplyVariantByPersistencyKeyCalled(assert, oCommand, oContent) {
		assert.strictEqual(this.oApplyVariantByPersistencyKeyStub.callCount, 1, "then _applyVariantByPersistencyKey was called");
		assert.strictEqual(this.oApplyVariantByPersistencyKeyStub.lastCall.args[0], "myKey", "then the key was passed correctly");
		assert.deepEqual(this.oApplyVariantByPersistencyKeyStub.lastCall.args[1], oContent, "then the content was passed correctly");
		assert.strictEqual(this.oApplyVariantByPersistencyKeyStub.lastCall.args[2], "KEY_USER", "then the role was passed correctly");
		this.oApplyVariantByPersistencyKeyStub.reset();
	}

	function assertApplyVariantCalled(assert, oCommand, oContent) {
		assert.strictEqual(this.oApplyVariantStub.callCount, 1, "then _applyVariantByPersistencyKey was called");
		assert.strictEqual(this.oApplyVariantStub.lastCall.args[0], this.sMyPersoController, "then the key was passed correctly");
		assert.deepEqual(this.oApplyVariantStub.lastCall.args[1], oContent, "then the content was passed correctly");
		assert.strictEqual(this.oApplyVariantStub.lastCall.args[2], "KEY_USER", "then the role was passed correctly");
		this.oApplyVariantStub.reset();
	}

	QUnit.module("Given a control", {
		beforeEach() {
			this.oControl = new Control();
			this.sPersistencyKey = "myKey";
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
		afterEach() {
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a CompVariantContent command is created, executed, undone and redone for a page variant", function(assert) {
			var oCommand;
			var oSetModifiedStub = sandbox.stub();
			this.oControl.setModified = oSetModifiedStub;
			var oUpdateFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "updateVariantContent");
			var oUndoVariantFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "revert").returns({
				getRevertData() {
					return [];
				},
				getContent() {
					return { myKey: {content: "oldContent"} };
				},
				getDirtyStatus() {
					return false;
				}
			});
			var mExpectedProperties = {
				id: "myId",
				control: this.oControl,
				content: {myKey: this.oNewContent},
				generator: "sap.ui.rta.command",
				command: "compVariantContent",
				layer: Layer.CUSTOMER
			};
			this.oIsPageVariantStub.returns(true);
			this.oGetVariantContent.returns({ myKey: this.oOldContent });

			return CommandFactory.getCommandFor(this.oControl, "compVariantContent", {
				variantId: "myId",
				persistencyKey: this.sPersistencyKey,
				newContent: this.oNewContent,
				isModifiedBefore: false
			}, {})
			.then(function(oCreatedCommand) {
				oCommand = oCreatedCommand;

				return oCommand.execute();
			}).then(function() {
				assert.deepEqual(oUpdateFlAPIStub.lastCall.args[0], mExpectedProperties, "the FL API was called with the correct properties");
				assert.equal(oSetModifiedStub.callCount, 1, "the setModified was called..");
				assert.equal(oSetModifiedStub.lastCall.args[0], true, "and set to true");
				assert.equal(oCommand.getIsModifiedBefore(), false, "isModifiedBefore value stored correctly");
				assertApplyVariantByPersistencyKeyCalled.call(this, assert, oCommand, {myKey: this.oNewContent});

				return oCommand.undo();
			}.bind(this)).then(function() {
				assert.equal(oUndoVariantFlAPIStub.callCount, 1, "the undo function was called");
				assert.equal(oSetModifiedStub.callCount, 2, "the setModified was called again..");
				assert.equal(oSetModifiedStub.lastCall.args[0], false, "and set to false");
				assertApplyVariantByPersistencyKeyCalled.call(this, assert, oCommand, {myKey: this.oOldContent});

				return oCommand.execute();
			}.bind(this)).then(function() {
				assert.equal(oUpdateFlAPIStub.callCount, 2, "the FL update function was called again");
				assert.deepEqual(oUpdateFlAPIStub.lastCall.args[0], mExpectedProperties, "the FL API was called with the correct properties");
				assert.equal(oSetModifiedStub.callCount, 3, "the setModified was called again..");
				assert.equal(oSetModifiedStub.lastCall.args[0], true, "and set to true");
				assert.equal(oCommand.getIsModifiedBefore(), false, "isModifiedBefore value stored correctly");
				assertApplyVariantByPersistencyKeyCalled.call(this, assert, oCommand, {myKey: this.oNewContent});
			}.bind(this));
		});

		QUnit.test("when a CompVariantContent command is created, executed, undone and redone", function(assert) {
			var oCommand;
			var oSetModifiedStub = sandbox.stub();
			this.oControl.setModified = oSetModifiedStub;
			var oUpdateFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "updateVariantContent");
			var oUndoVariantFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "revert").returns({
				getRevertData() {
					return [];
				},
				getContent() {
					return { content: "oldContent"};
				},
				getDirtyStatus() {
					return false;
				}
			});
			var mExpectedProperties = {
				id: "myId",
				control: this.oControl,
				content: this.oNewContent,
				generator: "sap.ui.rta.command",
				command: "compVariantContent",
				layer: Layer.CUSTOMER
			};
			this.oIsPageVariantStub.returns(false);
			this.oGetVariantContent.returns(this.oOldContent);
			return CommandFactory.getCommandFor(this.oControl, "compVariantContent", {
				variantId: "myId",
				persistencyKey: this.sPersistencyKey,
				newContent: this.oNewContent,
				isModifiedBefore: true
			}, {})
			.then(function(oCreatedCommand) {
				oCommand = oCreatedCommand;

				return oCommand.execute();
			}).then(function() {
				assert.deepEqual(oUpdateFlAPIStub.lastCall.args[0], mExpectedProperties, "the FL API was called with the correct properties");
				assert.equal(oSetModifiedStub.callCount, 1, "the setModified was called..");
				assert.equal(oSetModifiedStub.lastCall.args[0], true, "and set to true");
				assert.equal(oCommand.getIsModifiedBefore(), true, "isModifiedBefore value stored correctly");
				assertApplyVariantCalled.call(this, assert, oCommand, this.oNewContent);

				return oCommand.undo();
			}.bind(this)).then(function() {
				assert.equal(oUndoVariantFlAPIStub.callCount, 1, "the undo function was called");
				assert.equal(oSetModifiedStub.callCount, 2, "the setModified was called again..");
				assert.equal(oSetModifiedStub.lastCall.args[0], true, "and set to true");
				assertApplyVariantCalled.call(this, assert, oCommand, this.oOldContent);

				return oCommand.execute();
			}.bind(this)).then(function() {
				assert.equal(oUpdateFlAPIStub.callCount, 2, "the FL update function was called again");
				assert.deepEqual(oUpdateFlAPIStub.lastCall.args[0], mExpectedProperties, "the FL API was called with the correct properties");
				assert.equal(oSetModifiedStub.callCount, 3, "the setModified was called again..");
				assert.equal(oCommand.getIsModifiedBefore(), true, "isModifiedBefore value stored correctly");
				assert.equal(oSetModifiedStub.lastCall.args[0], true, "and set to true");
				assertApplyVariantCalled.call(this, assert, oCommand, this.oNewContent);
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});