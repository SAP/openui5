/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	UIComponent,
	ElementDesignTimeMetadata,
	ChangesWriteAPI,
	Layer,
	FlUtils,
	CommandFactory,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

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
	 * @param {object} mExpectedSpecificData - Command specific data that will be passed to the creation of the <code>sap.ui.fl.Change</code>
	 */
	function basicCommandTest(mInfo, mCommandProperties, mExpectedSpecificData) {
		var sMsg = mInfo.moduleName || "Test for '" + mInfo.commandName + "' command";
		QUnit.module(sMsg, {
			beforeEach: function() {
				this.oMockedAppComponent = new UIComponent();
				sandbox.stub(FlUtils, "getAppComponentForControl").returns(this.oMockedAppComponent);
				sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
				this.oCreateStub = sandbox.stub(ChangesWriteAPI, "create").resolves();
				this.oControl = new Control("myFancyControlId");
			},
			afterEach: function() {
				sandbox.restore();
				this.oControl.destroy();
				this.oMockedAppComponent.destroy();
			}
		}, function() {
			QUnit.test("when creating the Command via the CommandFactory", function(assert) {
				var oInnerActionsObject = Object.assign({}, mInfo.additionalDesigntimeAttributes, {
					changeType: mCommandProperties.changeType
				});

				var oActionsObject = {};
				if (Array.isArray(mInfo.designtimeActionStructure)) {
					oActionsObject[mInfo.designtimeActionStructure[0]] = {};
					oActionsObject[mInfo.designtimeActionStructure[0]][mInfo.designtimeActionStructure[1]] = oInnerActionsObject;
				} else {
					oActionsObject[mInfo.designtimeActionStructure] = oInnerActionsObject;
				}

				var oData = {
					actions: {},
					aggregations: {}
				};
				if (mInfo.aggregation) {
					oData.aggregations.customData = {
						actions: oActionsObject
					};
				} else {
					oData.actions = oActionsObject;
				}
				var oDesignTimeMetadata = new ElementDesignTimeMetadata({
					data: oData
				});

				return CommandFactory.getCommandFor(this.oControl, mInfo.commandName, mCommandProperties, oDesignTimeMetadata)
				.then(function(oCommand) {
					assert.ok(oCommand, "the command was created");
					assert.equal(this.oCreateStub.callCount, 1, "the change got created");

					// add some default properties to the specific data
					mExpectedSpecificData.command = mInfo.commandName;
					mExpectedSpecificData.jsOnly = undefined;
					mExpectedSpecificData.layer = Layer.CUSTOMER;
					mExpectedSpecificData.developerMode = true;
					mExpectedSpecificData.generator = "sap.ui.rta.command";

					assert.deepEqual(this.oCreateStub.lastCall.args[0].changeSpecificData, mExpectedSpecificData, "the correct change specific data were passed");
				}.bind(this));
			});
		});
	}

	return basicCommandTest;
});