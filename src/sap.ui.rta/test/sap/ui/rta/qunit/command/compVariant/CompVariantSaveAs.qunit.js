/* eslint-disable max-nested-callbacks */
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
		beforeEach() {
			this.oControl = new Control();
		},
		afterEach() {
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		[true, false].forEach(function(bActivateAfterUndo) {
			[true, false].forEach(function(bDefault) {
				var sText = "when a CompVariantSaveAs command is created, executed, undone and redone with default ";
				sText += bDefault ? "set" : "not set";
				sText += bActivateAfterUndo ? " and activateAfterUndo set" : " and activateAfterUndo not set";
				QUnit.test(sText, function(assert) {
					var oSaveAsCommand;
					var sVariantId = "variant";
					var oVariant = {
						getVariantId() {
							return sVariantId;
						},
						setContent() {}
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

					var oVariantByIdStub = sandbox.stub().returns(oVariant);
					this.oControl._getVariantById = oVariantByIdStub;

					var oCurrentVariantIdStub = sandbox.stub();
					this.oControl.getCurrentVariantId = oCurrentVariantIdStub;

					var oModifiedStub = sandbox.stub();
					this.oControl.setModified = oModifiedStub;

					function assertExecute(oControl, bRedo) {
						assert.equal(oAddVariantAPIStub.callCount, 1, "the FL API was called");
						var oChangeSpecificData = {
							id: bRedo ? sVariantId : undefined,
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
						};
						var oLastCallArgs = oAddVariantAPIStub.lastCall.args[0];
						assert.deepEqual(oLastCallArgs.changeSpecificData, oChangeSpecificData, "the changeSpecificData were passed");
						assert.deepEqual(oLastCallArgs.control, oControl, "the control was passed");
						assert.strictEqual(oLastCallArgs.generator, "sap.ui.rta.command", "the generator was passed");
						assert.strictEqual(oLastCallArgs.command, "compVariantSaveAs", "the command was passed");
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
							executeOnSelection: false,
							contexts: {
								role: ["someRole"]
							},
							"default": bDefault
						},
						previousDirtyFlag: true,
						previousVariantId: "previousId",
						previousDefault: "previous",
						activateAfterUndo: bActivateAfterUndo
					}, {})
					.then(function(oCreatedCommand) {
						oSaveAsCommand = oCreatedCommand;

						return oSaveAsCommand.execute();
					}).then(function() {
						assertExecute(this.oControl);

						return oSaveAsCommand.undo();
					}.bind(this)).then(function() {
						if (bActivateAfterUndo) {
							assert.equal(oActivateStub.callCount, 2, "the Control API to activate was called again");
						} else {
							assert.equal(oActivateStub.callCount, 1, "the Control API to activate was not called again");
						}
						assert.equal(oAddVariantAPIStub.callCount, 1, "the FL API was not called again");
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

						assert.equal(oCurrentVariantIdStub.callCount, 2, "the Control API to get current variant id was called twice");
						assert.equal(oVariantByIdStub.callCount, 1, "the Control API to get by variant id was called");
						assert.equal(oModifiedStub.callCount, 1, "the Control API to set modified was called");
						assert.deepEqual(oModifiedStub.lastCall.args[0], oExpectedProperties.previousDirtyFlag, "modified is set correct");

						sandbox.resetHistory();
						return oSaveAsCommand.execute();
					}.bind(this)).then(function() {
						assertExecute(this.oControl, true);
					}.bind(this));
				});
			});
		});
	});
});