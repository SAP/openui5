/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	SmartVariantManagementWriteAPI,
	Layer,
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
		QUnit.test("Update in the Save scenario", function(assert) {
			var oUpdateCommand;
			var sVariantId = "variantId";
			var oContent = {foo: "bar"};

			var oUpdateControlStub = sandbox.stub();
			this.oControl.updateVariant = oUpdateControlStub;
			var oSetModifiedStub = sandbox.stub();
			this.oControl.setModified = oSetModifiedStub;

			var oUpdateFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "updateVariant");
			var oUndoVariantFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "revert");

			return CommandFactory.getCommandFor(this.oControl, "compVariantUpdate", {
				newVariantProperties: {
					variantId: {
						content: oContent
					}
				},
				onlySave: true
			}, {})
			.then(function(oCreatedCommand) {
				oUpdateCommand = oCreatedCommand;

				return oUpdateCommand.execute();
			}).then(function() {
				assert.equal(oUpdateFlAPIStub.callCount, 1, "the FL update function was called");
				var mExpectedProperties = {
					id: sVariantId,
					control: this.oControl,
					content: oContent,
					generator: "sap.ui.rta.command",
					command: "compVariantUpdate",
					layer: Layer.CUSTOMER
				};
				assert.deepEqual(oUpdateFlAPIStub.lastCall.args[0], mExpectedProperties, "the FL API was called with the correct properties");
				assert.equal(oSetModifiedStub.callCount, 1, "the setModified was called..");
				assert.equal(oSetModifiedStub.lastCall.args[0], false, "and set to false");

				return oUpdateCommand.undo();
			}.bind(this)).then(function() {
				assert.equal(oUndoVariantFlAPIStub.callCount, 1, "the undo function was called");
				assert.equal(oSetModifiedStub.callCount, 2, "the setModified was called again..");
				assert.equal(oSetModifiedStub.lastCall.args[0], true, "and set to true");
				return oUpdateCommand.execute();
			}).then(function() {
				assert.equal(oUpdateFlAPIStub.callCount, 2, "the FL update function was called again");
				var mExpectedProperties = {
					id: sVariantId,
					control: this.oControl,
					content: oContent,
					generator: "sap.ui.rta.command",
					command: "compVariantUpdate",
					layer: Layer.CUSTOMER
				};
				assert.deepEqual(oUpdateFlAPIStub.lastCall.args[0], mExpectedProperties, "the FL API was called with the correct properties");
				assert.equal(oSetModifiedStub.callCount, 3, "the setModified was called again..");
				assert.equal(oSetModifiedStub.lastCall.args[0], false, "and set to false");
			}.bind(this));
		});

		QUnit.test("Update in the Manage Views scenario", function(assert) {
			var oUpdateCommand;

			var oUpdateControlStub = sandbox.stub();
			this.oControl.updateVariant = oUpdateControlStub;
			var oRemoveControlStub = sandbox.stub();
			this.oControl.removeVariant = oRemoveControlStub;
			var oAddControlStub = sandbox.stub();
			this.oControl.addVariant = oAddControlStub;
			var oSetDefaultControlStub = sandbox.stub();
			this.oControl.setDefaultVariantId = oSetDefaultControlStub;
			var oSetModifiedStub = sandbox.stub();
			this.oControl.setModified = oSetModifiedStub;
			var oUpdateFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "updateVariant").callsFake(function(mPropertyBag) {
				return mPropertyBag.id;
			});
			var oSetDefaultFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "setDefaultVariantId");
			var oRemoveVariantFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "removeVariant");
			var oRevertFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "revert").callsFake(function(mPropertyBag) {
				return mPropertyBag.id;
			});

			function assertExecute(oControl) {
				assert.equal(oUpdateFlAPIStub.callCount, 2, "the FL update function was called twice");
				var mExpectedProperties1 = {
					id: "variant2",
					control: oControl,
					generator: "sap.ui.rta.command",
					command: "compVariantUpdate",
					layer: Layer.CUSTOMER,
					favorite: false
				};
				assert.deepEqual(oUpdateFlAPIStub.getCall(0).args[0], mExpectedProperties1, "the FL API was called with the correct properties 2");
				var mExpectedProperties2 = {
					id: "variant3",
					control: oControl,
					generator: "sap.ui.rta.command",
					command: "compVariantUpdate",
					layer: Layer.CUSTOMER,
					executeOnSelect: true,
					name: "newName",
					oldName: "oldName",
					favorite: true
				};
				assert.deepEqual(oUpdateFlAPIStub.getCall(1).args[0], mExpectedProperties2, "the FL API was called with the correct properties 3");

				assert.equal(oSetDefaultFlAPIStub.callCount, 1, "the FL API setDefault was called");
				assert.equal(oSetDefaultFlAPIStub.lastCall.args[0].id, "variant3", "the correct variant id was passed");

				assert.equal(oRemoveVariantFlAPIStub.callCount, 1, "the FL API removeVariant was called");
				assert.equal(oRemoveVariantFlAPIStub.lastCall.args[0].id, "variant1", "the correct variant id was passed");

				assert.equal(oUpdateControlStub.callCount, 2, "the control API updateVariant was called twice");
				assert.equal(oUpdateControlStub.getCall(0).args[0], "variant2", "with the return value of FL updateVariant");
				assert.equal(oUpdateControlStub.getCall(1).args[0], "variant3", "with the return value of FL updateVariant");

				assert.equal(oSetDefaultControlStub.callCount, 1, "the control API setDefault was called");
				assert.equal(oSetDefaultControlStub.lastCall.args[0], "variant3", "the correct variant id was passed");

				assert.equal(oRemoveControlStub.callCount, 1, "the control API removeVariant was called");
				assert.equal(oRemoveControlStub.lastCall.args[0].variantId, "variant1", "the correct variant id was passed");
			}

			return CommandFactory.getCommandFor(this.oControl, "compVariantUpdate", {
				newVariantProperties: {
					variant1: {
						executeOnSelect: false,
						deleted: true
					},
					variant2: {
						favorite: false
					},
					variant3: {
						executeOnSelect: true,
						name: "newName",
						oldName: "oldName",
						favorite: true
					}
				},
				newDefaultVariantId: "variant3",
				oldDefaultVariantId: "variant1"
			}, {})
			.then(function(oCreatedCommand) {
				oUpdateCommand = oCreatedCommand;

				return oUpdateCommand.execute();
			}).then(function() {
				assertExecute(this.oControl);

				return oUpdateCommand.undo();
			}.bind(this)).then(function() {
				assert.equal(oRevertFlAPIStub.callCount, 3, "the revert function was called thrice");
				assert.equal(oRevertFlAPIStub.getCall(0).args[0].id, "variant1", "the correct variant id was passed 1");
				assert.equal(oRevertFlAPIStub.getCall(1).args[0].id, "variant2", "the correct variant id was passed 2");
				assert.equal(oRevertFlAPIStub.getCall(2).args[0].id, "variant3", "the correct variant id was passed 3");

				assert.equal(oAddControlStub.callCount, 1, "the addVariant function on the control was called once");
				assert.equal(oAddControlStub.lastCall.args[0], "variant1", "the correct variant was added");

				assert.equal(oUpdateControlStub.callCount, 4, "the updateVariant function on the control was called twice");
				assert.equal(oUpdateControlStub.getCall(2).args[0], "variant2", "the correct variant was updated 1");
				assert.equal(oUpdateControlStub.getCall(3).args[0], "variant3", "the correct variant was updated 2");

				sandbox.resetHistory();
				return oUpdateCommand.execute();
			}).then(function() {
				assertExecute(this.oControl);
			}.bind(this));
		});
	});
});