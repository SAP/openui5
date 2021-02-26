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
		[true, false].forEach(function(bDefault) {
			var sText = "when a CompVariantSaveAs command is created, executed, undone and redone with default ";
			sText += bDefault ? "set" : "not set";
			QUnit.test(sText, function(assert) {
				var oSaveAsCommand;
				var sVariantId = "variant";
				var oVariant = {
					getId: function() {
						return sVariantId;
					}
				};
				var oAddVariantAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "addVariant").returns(oVariant);
				var oRemoveVariantAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "removeVariant");
				var oSetDefaultVariantIdAPIStub = sandbox.stub(SmartVariantManagementWriteAPI, "setDefaultVariantId");

				var oActivateStub = sandbox.stub();
				this.oControl.activateVariant = oActivateStub;

				var oAddVariantControlStub = sandbox.stub();
				this.oControl.addVariant = oAddVariantControlStub;

				var oRemoveStub = sandbox.stub();
				this.oControl.removeWeakVariant = oRemoveStub;

				function assertExecute(oControl) {
					assert.equal(oAddVariantAPIStub.callCount, 1, "the FL API was called");
					var mExpectedProperties = {
						changeSpecificData: {
							type: "myType",
							texts: {
								variantName: "myText"
							},
							content: {foo: "bar"},
							executeOnSelection: false,
							favorite: true,
							contexts: {
								role: ["someRole"]
							},
							layer: Layer.CUSTOMER
						},
						generator: "sap.ui.rta.command",
						command: "compVariantSaveAs",
						control: oControl
					};
					assert.deepEqual(oAddVariantAPIStub.lastCall.args[0].changeSpecificData, mExpectedProperties.changeSpecificData, "the API was called with the correct properties");
					assert.deepEqual(oAddVariantAPIStub.lastCall.args[0].control, mExpectedProperties.control, "the API was called with the correct properties");
					assert.equal(oSetDefaultVariantIdAPIStub.callCount, bDefault ? 1 : 0, "the default variant was (or not) set in FL");

					assert.equal(oActivateStub.callCount, 1, "the Control API to activate was called");
					assert.equal(sVariantId, oActivateStub.lastCall.args[0], "the activate api was called with the correct property");

					assert.equal(oAddVariantControlStub.callCount, 1, "the API to add was called");
					assert.deepEqual(oAddVariantControlStub.lastCall.args[0], oVariant, "the first parameter is correct");
					assert.equal(oAddVariantControlStub.lastCall.args[1], bDefault, "the second parameter is correct");
				}

				return CommandFactory.getCommandFor(this.oControl, "compVariantSaveAs", {
					newVariantProperties: {
						type: "myType",
						text: "myText",
						content: {foo: "bar"},
						executeOnSelect: false,
						contexts: {
							role: ["someRole"]
						},
						"default": bDefault
					},
					previousDirtyFlag: true,
					previousVariantId: "previousId",
					previousDefault: "previous"
				}, {})
				.then(function(oCreatedCommand) {
					oSaveAsCommand = oCreatedCommand;

					return oSaveAsCommand.execute();
				}).then(function() {
					assertExecute(this.oControl);

					return oSaveAsCommand.undo();
				}.bind(this)).then(function() {
					assert.equal(oAddVariantAPIStub.callCount, 1, "the FL API was not called again");
					assert.equal(oActivateStub.callCount, 1, "the Control API to activate was not called again");
					assert.equal(oAddVariantControlStub.callCount, 1, "the API to add was not called again");
					assert.equal(oSetDefaultVariantIdAPIStub.callCount, bDefault ? 2 : 0, "the default variant was set (or not) in FL");

					assert.equal(oRemoveVariantAPIStub.callCount, 1, "the FL API to remove was called");
					assert.equal(oRemoveVariantAPIStub.lastCall.args[0].id, sVariantId, "the first parameter is correct");
					assert.equal(oRemoveVariantAPIStub.lastCall.args[0].control, this.oControl, "the first parameter is correct");
					assert.equal(oRemoveVariantAPIStub.lastCall.args[0].revert, true, "the first parameter is correct");

					assert.equal(oRemoveStub.callCount, 1, "the Control API to remove was called");
					var oExpectedProperties = {
						previousDirtyFlag: true,
						previousVariantId: "previousId",
						previousDefault: "previous",
						variantId: sVariantId
					};
					assert.deepEqual(oRemoveStub.lastCall.args[0], oExpectedProperties, "the first parameter is correct");

					sandbox.resetHistory();
					return oSaveAsCommand.execute();
				}.bind(this)).then(function() {
					assertExecute(this.oControl);
				}.bind(this));
			});
		});
	});
});