/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Control,
	ElementDesignTimeMetadata,
	JSONModel,
	ChangesWriteAPI,
	Layer,
	ControlVariantApplyAPI,
	CommandFactory,
	sinon,
	RtaQunitUtils
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	function actualTest(assert, bJsOnly, bVariantIndependent, bVariantPresent) {
		const oInnerActionsObject = {
			...this.mCurrentInfo.additionalDesigntimeAttributes,
			changeType: this.mCurrentCommandProperties.changeType,
			jsOnly: bJsOnly,
			CAUTION_variantIndependent: bVariantIndependent
		};

		const oActionsObject = {};
		if (Array.isArray(this.mCurrentInfo.designtimeActionStructure)) {
			oActionsObject[this.mCurrentInfo.designtimeActionStructure[0]] = {};
			oActionsObject[this.mCurrentInfo.designtimeActionStructure[0]][this.mCurrentInfo.designtimeActionStructure[1]] = oInnerActionsObject;
		} else {
			oActionsObject[this.mCurrentInfo.designtimeActionStructure] = oInnerActionsObject;
		}

		const oData = {
			actions: {},
			aggregations: {}
		};
		if (this.mCurrentInfo.aggregation) {
			oData.aggregations.customData = {
				actions: oActionsObject
			};
		} else {
			oData.actions = oActionsObject;
		}
		const oDesignTimeMetadata = new ElementDesignTimeMetadata({
			data: oData
		});

		const sVariantManagementReference = bVariantPresent ? "variantReference" : "";
		const oCommandFactory = new CommandFactory();
		return oCommandFactory.getCommandFor(this.oControl, this.mCurrentInfo.commandName, this.mCurrentCommandProperties, oDesignTimeMetadata, sVariantManagementReference)

		.then(function(oCommand) {
			assert.ok(oCommand, "the command was created");
			assert.equal(this.oCreateStub.callCount, 1, "the change got created");

			// add some default properties to the specific data
			this.mCurrentExpectedSpecificData.command = this.mCurrentInfo.commandName;
			this.mCurrentExpectedSpecificData.jsOnly = bJsOnly;
			this.mCurrentExpectedSpecificData.layer = Layer.CUSTOMER;
			this.mCurrentExpectedSpecificData.developerMode = true;
			this.mCurrentExpectedSpecificData.generator = "sap.ui.rta.command";
			if (!bVariantIndependent && bVariantPresent) {
				this.mCurrentExpectedSpecificData.variantManagementReference = "variantReference";
				this.mCurrentExpectedSpecificData.variantReference = "variantReference";
				this.mCurrentExpectedSpecificData.isChangeOnStandardVariant = true;
			}

			assert.deepEqual(this.oCreateStub.lastCall.args[0].changeSpecificData, this.mCurrentExpectedSpecificData, "the correct change specific data were passed");
		}.bind(this));
	}

	/**
	 * Executes a test for a command. The test mocks the needed designtime metadata and calls the <code>sap.ui.rta.command.CommandFactory</code> to create the Command.
	 * Also tests if the change specific data are correctly passed to the ChangesWriteAPI.create function.
	 *
	 * @param {object} mInfo - Information about the command and the test
	 * @param {string} mInfo.commandName - Name of the command defined in the <code>sap.ui.rta.command.CommandFactory</code>
	 * @param {string} [mInfo.moduleName] - Name for the QUnit module
	 * @param {any} [mInfo.additionalDesigntimeAttributes] - Additional functions or properties that end up in the designtime mock
	 * @param {string|string[]} mInfo.designtimeActionStructure - Name of the action in the designtime file - nested structures should be put into an array
	 * @param {object} mCommandProperties - Properties with which the command will be created
	 * @param {object} mExpectedSpecificData - Command specific data that will be passed to the creation of the <code>sap.ui.fl.apply._internal.flexObjects.UIChange</code>
	 */
	function basicCommandTest(mInfo, mCommandProperties, mExpectedSpecificData) {
		const sMsg = mInfo.moduleName || `Test for '${mInfo.commandName}' command`;
		QUnit.module(sMsg, {
			beforeEach() {
				this.mCurrentInfo = { ...mInfo };
				this.mCurrentCommandProperties = { ...mCommandProperties };
				this.mCurrentExpectedSpecificData = { ...mExpectedSpecificData };
				this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
				const oVariantModel = new JSONModel();
				oVariantModel.getCurrentVariantReference = function(sVariantManagementReference) {
					return sVariantManagementReference;
				};
				this.oMockedAppComponent.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());
				sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
				this.oCreateStub = sandbox.stub(ChangesWriteAPI, "create").resolves();
				this.oControl = new Control("myFancyControlId");
			},
			afterEach() {
				sandbox.restore();
				this.oControl.destroy();
				this.oMockedAppComponent.destroy();
			}
		}, function() {
			if (mInfo.designtimeAction) {
				QUnit.test("when creating the Command via the CommandFactory", function(assert) {
					return actualTest.call(this, assert, false, false, false);
				});

				QUnit.test("when creating the Command via the CommandFactory with jsOnly=true and a VariantManagement", function(assert) {
					return actualTest.call(this, assert, true, false, true);
				});

				QUnit.test("when creating the Command via the CommandFactory with variantIndependent=true and a VariantManagement", function(assert) {
					return actualTest.call(this, assert, false, true, true);
				});

				QUnit.test("when creating the Command via the CommandFactory with variantIndependent=true and no VariantManagement", function(assert) {
					return actualTest.call(this, assert, false, true, false);
				});

				QUnit.test("when creating the Command via the CommandFactory with jsOnly=true and variantIndependent=true and a VariantManagement", function(assert) {
					return actualTest.call(this, assert, true, true, true);
				});
			} else {
				QUnit.test("when creating the Command via the CommandFactory", function(assert) {
					return actualTest.call(this, assert, false, false, false);
				});

				QUnit.test("when creating the Command via the CommandFactory and a VariantManagement", function(assert) {
					return actualTest.call(this, assert, false, false, true);
				});
			}
		});
	}

	return basicCommandTest;
});