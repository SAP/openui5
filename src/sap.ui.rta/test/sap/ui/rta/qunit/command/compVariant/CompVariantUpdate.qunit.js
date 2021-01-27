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

	QUnit.module("moduleName", {
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
			var oUpdateFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "updateVariant");
			// var oUndoVariantFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "undoVariant");

			return CommandFactory.getCommandFor(this.oControl, "compVariantUpdate", {
				newVariantProperties: {
					variantId: {
						content: oContent
					}
				}
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
					layer: Layer.CUSTOMER,
					saveUndoOperation: true
				};
				assert.deepEqual(oUpdateFlAPIStub.lastCall.args[0], mExpectedProperties, "the FL API was called with the correct properties");
				return oUpdateCommand.undo();
			}.bind(this)).then(function() {
				// assert.equal(oUndoVariantFlAPIStub.callCount, 1, "the undo function was called");
				return oUpdateCommand.execute();
			}).then(function() {
				assert.ok(true);
			});
		});

		QUnit.test("Update in the Manage Views scenario", function(assert) {
			var oUpdateCommand;

			var oUpdateControlStub = sandbox.stub();
			this.oControl.updateVariant = oUpdateControlStub;
			var oSetDefaultControlStub = sandbox.stub();
			this.oControl.setDeafultVariantId = oSetDefaultControlStub;
			var oUpdateFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "updateVariant");
			var oSetDefaultFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "setDefaultVariantId");
			// var oUndoVariantFlAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "undoVariant");

			return CommandFactory.getCommandFor(this.oControl, "compVariantUpdate", {
				newVariantProperties: {
					variant1: {
						executeOnSelect: false,
						"delete": true
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
				assert.equal(oUpdateFlAPIStub.callCount, 3, "the FL update function was called");
				var mExpectedProperties0 = {
					id: "variant1",
					control: this.oControl,
					generator: "sap.ui.rta.command",
					command: "compVariantUpdate",
					layer: Layer.CUSTOMER,
					executeOnSelect: false,
					saveUndoOperation: true,
					"delete": true
				};
				assert.deepEqual(oUpdateFlAPIStub.getCall(0).args[0], mExpectedProperties0, "the FL API was called with the correct properties");
				var mExpectedProperties1 = {
					id: "variant2",
					control: this.oControl,
					generator: "sap.ui.rta.command",
					command: "compVariantUpdate",
					layer: Layer.CUSTOMER,
					favorite: false,
					saveUndoOperation: true
				};
				assert.deepEqual(oUpdateFlAPIStub.getCall(1).args[0], mExpectedProperties1, "the FL API was called with the correct properties");
				var mExpectedProperties2 = {
					id: "variant3",
					control: this.oControl,
					generator: "sap.ui.rta.command",
					command: "compVariantUpdate",
					layer: Layer.CUSTOMER,
					executeOnSelect: true,
					name: "newName",
					oldName: "oldName",
					favorite: true,
					saveUndoOperation: true
				};
				assert.deepEqual(oUpdateFlAPIStub.getCall(2).args[0], mExpectedProperties2, "the FL API was called with the correct properties");
				assert.equal(oSetDefaultFlAPIStub.callCount, 1, "the FL API setDefault was called");
				assert.equal(oSetDefaultFlAPIStub.lastCall.args[0].id, "variant3", "the correct variant id was passed");
				assert.equal(oSetDefaultControlStub.callCount, 1, "the control API setDefault was called");
				assert.equal(oSetDefaultControlStub.lastCall.args[0], "variant3", "the correct variant id was passed");
				// return oUpdateCommand.undo();
			// }.bind(this)).then(function() {
				// assert.equal(oUndoVariantFlAPIStub.callCount, 1, "the undo function was called");
				// return oUpdateCommand.execute();
			// }).then(function() {
				// assert.ok(true);
			}.bind(this));
		});
	});
});