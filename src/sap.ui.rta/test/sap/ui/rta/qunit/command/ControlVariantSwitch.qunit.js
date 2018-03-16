/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/ControlVariantSwitch",
	"sap/ui/fl/Utils",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	// should be last
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
], function (
	CommandFactory,
	ControlVariantSwitch,
	Utils,
	VariantManagement,
	VariantModel,
	sinon
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	var fnGetMockedAppComponent = function(oModel) {
		return {
			getLocalId: function () {
				return undefined;
			},
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
			getModel: function () { return oModel; }
		};
	};

	QUnit.module("Given a VariantManagement control and its designtime metadata are created...", {
		beforeEach : function(assert) {

			this.sVariantManagementReference = "variantManagementReference-1";
			this.oVariantManagement = new VariantManagement(this.sVariantManagementReference, {});

			var oModel = new VariantModel({}, {}),
				oMockedAppComponent = fnGetMockedAppComponent(oModel);

			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			this.fnUpdateCurrentVariantStub = sandbox.stub(oModel, "updateCurrentVariant");

		},
		afterEach : function(assert) {
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when getting a switch command for VariantManagement...", function(assert) {
		var oSwitchCommandData = {
			targetVariantReference : "newVariantReference",
			sourceVariantReference : "oldVariantReference"
		};
		var oCommand = CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData);

		assert.ok(oCommand, "switch command for VariantManagement exists");

		return oCommand.execute()

		.then(function() {
			assert.equal(this.fnUpdateCurrentVariantStub.callCount, 1, "then updateCurrentVariant after execute command is called once");
			assert.equal(this.fnUpdateCurrentVariantStub.calledWithExactly(this.sVariantManagementReference, oSwitchCommandData.targetVariantReference), true,
				"then updateCurrentVariant after execute command is called with the correct parameters");
		}.bind(this))

		.then(oCommand.undo.bind(oCommand))

		.then(function() {
			assert.equal(this.fnUpdateCurrentVariantStub.callCount, 2, "then updateCurrentVariant after undo command is called once again");
			assert.deepEqual(this.fnUpdateCurrentVariantStub.getCall(1).args, [this.sVariantManagementReference, oSwitchCommandData.sourceVariantReference],
				"then updateCurrentVariant after undo command is called with the correct parameters");
		}.bind(this));
	});

	QUnit.test("when getting a switch command for VariantManagement with equal source and target variantId ...", function(assert) {
		var oSwitchCommandData = {
			targetVariantReference : "variantReference",
			sourceVariantReference : "variantReference"
		};
		var oCommand = CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData);

		return oCommand.execute()

		.then(function() {
			assert.equal(this.fnUpdateCurrentVariantStub.callCount, 0, "then updateCurrentVariant after execute command is not called");
		}.bind(this))

		.then(oCommand.undo.bind(oCommand))

		.then(function() {
			assert.equal(this.fnUpdateCurrentVariantStub.callCount, 0, "then updateCurrentVariant after undo command is not called");
		}.bind(this));
	});
});
