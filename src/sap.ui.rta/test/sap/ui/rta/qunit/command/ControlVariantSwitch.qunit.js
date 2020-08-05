/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/Utils",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/thirdparty/sinon-4"
], function (
	CommandFactory,
	Utils,
	VariantManagement,
	VariantModel,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a VariantManagement control and its designtime metadata are created...", {
		before: function () {
			this.fnGetMockedAppComponent = function() {
				return {
					getLocalId: function () {},
					getManifestEntry: function () {
						return {};
					},
					getMetadata: function () {
						return {
							getName: function () {
								return "someName";
							}
						};
					},
					getManifest: function () {
						return {
							"sap.app" : {
								applicationVersion : {
									version : "1.2.3"
								}
							}
						};
					},
					getModel: function () {
						return this.oModel;
					}.bind(this)
				};
			};
		},
		beforeEach: function () {
			this.sVariantManagementReference = "variantManagementReference-1";
			this.oVariantManagement = new VariantManagement(this.sVariantManagementReference, {});
			this.oMockedAppComponent = this.fnGetMockedAppComponent();
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oMockedAppComponent);
			this.oModel = new VariantModel({variantManagementReference: {variants: []}}, undefined, this.oMockedAppComponent);
			this.fnUpdateCurrentVariantStub = sandbox.stub(this.oModel, "updateCurrentVariant");
		},
		afterEach: function () {
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getting a switch command for VariantManagement...", function(assert) {
			var oSwitchCommand;
			var oSwitchCommandData = {
				targetVariantReference : "newVariantReference",
				sourceVariantReference : "oldVariantReference"
			};

			return CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData)
				.then(function(oCommand) {
					assert.ok(oCommand, "switch command for VariantManagement exists");
					oSwitchCommand = oCommand;
					return oSwitchCommand.execute();
				})
				.then(function() {
					assert.equal(this.fnUpdateCurrentVariantStub.callCount, 1, "then updateCurrentVariant after execute command is called once");
					assert.equal(this.fnUpdateCurrentVariantStub.calledWithExactly(this.sVariantManagementReference, oSwitchCommandData.targetVariantReference, this.oMockedAppComponent), true,
						"then updateCurrentVariant after execute command is called with the correct parameters");
				}.bind(this))
				.then(function() {
					return oSwitchCommand.undo();
				})
				.then(function() {
					assert.equal(this.fnUpdateCurrentVariantStub.callCount, 2, "then updateCurrentVariant after undo command is called once again");
					assert.deepEqual(this.fnUpdateCurrentVariantStub.getCall(1).args, [this.sVariantManagementReference, oSwitchCommandData.sourceVariantReference, this.oMockedAppComponent],
						"then updateCurrentVariant after undo command is called with the correct parameters");
				}.bind(this))
				.catch(function (oError) {
					assert.ok(false, 'catch must never be called - Error: ' + oError);
				});
		});

		QUnit.test("when getting a switch command for VariantManagement with equal source and target variantId ...", function(assert) {
			var oSwitchCommand;
			var oSwitchCommandData = {
				targetVariantReference : "variantReference",
				sourceVariantReference : "variantReference"
			};

			return CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData)
				.then(function(oCommand) {
					oSwitchCommand = oCommand;
					return oSwitchCommand.execute();
				})
				.then(function() {
					assert.equal(this.fnUpdateCurrentVariantStub.callCount, 0, "then updateCurrentVariant after execute command is not called");
				}.bind(this))
				.then(function() {
					return oSwitchCommand.undo();
				})
				.then(function() {
					assert.equal(this.fnUpdateCurrentVariantStub.callCount, 0, "then updateCurrentVariant after undo command is not called");
				}.bind(this))
				.catch(function (oError) {
					assert.ok(false, 'catch must never be called - Error: ' + oError);
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
