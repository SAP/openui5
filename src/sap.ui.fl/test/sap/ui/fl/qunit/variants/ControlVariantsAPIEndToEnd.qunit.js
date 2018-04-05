/* global sinon QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/variants/VariantController",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	'sap/ui/fl/FlexControllerFactory',
	"sap/ui/core/Manifest",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/variants/ControlVariantsAPI"
], function(
	VariantController,
	VariantModel,
	ChangeRegistry,
	Utils,
	FakeLrepConnectorLocalStorage,
	FlexControllerFactory,
	Manifest,
	UIComponent,
	ComponentContainer,
	ControlVariantsAPI
) {
	"use strict";
//	sinon.config.useFakeTimers = false;
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	var oView, oApp;
	FakeLrepConnectorLocalStorage.enableFakeConnector();

	QUnit.module("Given an instance of VariantModel", {
		beforeEach : function(assert) {
			var done = assert.async();

			jQuery.get("../testResources/VariantManagementTestApp.view.xml", null,
			function(viewContent) {
				var MockComponent = UIComponent.extend("MockController", {
					metadata: {
						manifest: 	{
							"sap.app" : {
								applicationVersion : {
									version : "1.2.3"
								}
							}
						}
					},
					createContent : function() {
						oApp = new sap.m.App(this.createId("mockapp"));
						oView = sap.ui.xmlview({
							id: this.createId("mockview"),
							viewContent: viewContent
						});
						oApp.addPage(oView);
						return oApp;
					}
				});
				this.oComp = new MockComponent("testComponent");
				this.oFlexController = FlexControllerFactory.createForControl(this.oComp);
				this.oComp.setModel(new VariantModel({}, this.oFlexController, this.oComp), "$FlexVariants");
				this.oCompContainer = new ComponentContainer("sap-ui-static", {
					component: this.oComp
				}).placeAt("content");

				this.mMoveChangeData1  = {
					selectorControl : sap.ui.getCore().byId("testComponent---mockview--ObjectPageLayout"),
					changeSpecificData: {
						changeType: "moveControls",
						movedElements: [{
							"id": "testComponent---mockview--ObjectPageSection1",
							"sourceIndex": 0,
							"targetIndex": 1
						}],
						source: {
							"id": "testComponent---mockview--ObjectPageLayout",
							"aggregation": "sections"
						},
						target: {
							"id": "testComponent---mockview--ObjectPageLayout",
							"aggregation": "sections"
						}
					}
				};
				this.mMoveChangeData2  = {
					selectorControl : sap.ui.getCore().byId("testComponent---mockview--ObjectPageLayout"),
					changeSpecificData: {
						changeType: "moveControls",
						movedElements: [{
							"id": "testComponent---mockview--ObjectPageSection3",
							"sourceIndex": 2,
							"targetIndex": 1
						}],
						source: {
							"id": "testComponent---mockview--ObjectPageLayout",
							"aggregation": "sections"
						},
						target: {
							"id": "testComponent---mockview--ObjectPageLayout",
							"aggregation": "sections"
						}
					}
				};
				this.mRenameChangeData1  = {
					selectorControl : sap.ui.getCore().byId("testComponent---mockview--ObjectPageSection1"),
					changeSpecificData: {
						changeType: "rename",
						renamedElement: {
							id: "testComponent---mockview--ObjectPageSection1"
						},
						value : "Personalization Test"
					}
				};
				this.mRenameChangeData2  = {
					selectorControl : sap.ui.getCore().byId("testComponent---mockview--TextTitle1"),
					changeSpecificData: {
						changeType: "rename",
						renamedElement: {
							id: "testComponent---mockview--TextTitle1"
						},
						value : "Change for the inner variant"
					}
				};

				this.fnUtilsLogErrorSpy = sandbox.spy(Utils.log, "error");
				this.fnAddPreparedChangeSpy = sandbox.spy(this.oFlexController, "addPreparedChange");

				done();
			}.bind(this));
		},
		afterEach: function(assert) {
			sandbox.restore();
			this.oCompContainer.destroy();
			this.oComp.destroy();
		}
	});

	QUnit.test("when calling 'hasVariantManagement' with a control that belong to a variant management control", function(assert) {
		var bVariantManagementReference1 = ControlVariantsAPI.hasVariantManagement(this.mMoveChangeData1.selectorControl);
		var bVariantManagementReference2 = ControlVariantsAPI.hasVariantManagement(this.mRenameChangeData2.selectorControl);
		assert.ok(bVariantManagementReference1, "true is returned for the first variant management control");
		assert.ok(bVariantManagementReference2, "true is returned for the second variant management control");
	});

	QUnit.test("when calling 'hasVariantManagement' with a control that doesn't belong to a variant management control", function(assert) {
		var bVariantManagementReference = ControlVariantsAPI.hasVariantManagement(sap.ui.getCore().byId("testComponent---mockview--Button"));
		assert.notOk(bVariantManagementReference, "false is returned");
	});

	QUnit.test("when calling 'addPersonalizationChanges' with two valid variant changes", function(assert) {
		var done = assert.async();
		ControlVariantsAPI.addPersonalizationChanges([this.mMoveChangeData1, this.mMoveChangeData2])
		.then(function() {
			assert.equal(this.fnUtilsLogErrorSpy.callCount, 0, "no errors ocurred");
			assert.equal(this.fnAddPreparedChangeSpy.callCount, 2, "addDirtyChange has been called twice");
			done();
		}.bind(this));
	});

	QUnit.test("when calling 'addPersonalizationChanges' with a change without selector control", function(assert) {
		var done = assert.async();
		this.mMoveChangeData1.selectorControl = undefined;
		ControlVariantsAPI.addPersonalizationChanges([this.mMoveChangeData1])
		.then(function() {
			assert.equal(this.fnUtilsLogErrorSpy.callCount, 1, "one error ocurred");
			assert.equal(this.fnUtilsLogErrorSpy.args[0][0], "Error during execPromiseQueueSequentially processing occured: No valid selectorControl", "error message: No valid selectorControl");
			assert.equal(this.fnAddPreparedChangeSpy.callCount, 0, "addDirtyChange has not been called");
			done();
		}.bind(this));
	});

	QUnit.test("when calling 'addPersonalizationChanges' with a change without changeSpecificData", function(assert) {
		var done = assert.async();
		this.mMoveChangeData1.changeSpecificData = undefined;
		ControlVariantsAPI.addPersonalizationChanges([this.mMoveChangeData1])
		.then(function() {
			assert.equal(this.fnUtilsLogErrorSpy.callCount, 1, "one error ocurred");
			assert.equal(this.fnUtilsLogErrorSpy.args[0][0], "Error during execPromiseQueueSequentially processing occured: No changeSpecificData available", "error message: No changeSpecificData available");
			assert.equal(this.fnAddPreparedChangeSpy.callCount, 0, "addDirtyChange has not been called");
			done();
		}.bind(this));
	});

	QUnit.test("when calling 'addPersonalizationChanges' with a change without valid changeType", function(assert) {
		var done = assert.async();
		this.mMoveChangeData1.changeSpecificData.changeType = undefined;
		ControlVariantsAPI.addPersonalizationChanges([this.mMoveChangeData1])
		.then(function() {
			assert.equal(this.fnUtilsLogErrorSpy.callCount, 1, "one error ocurred");
			assert.equal(this.fnUtilsLogErrorSpy.args[0][0], "Error during execPromiseQueueSequentially processing occured: No valid changeType", "error message: No valid changeType");
			assert.equal(this.fnAddPreparedChangeSpy.callCount, 0, "addDirtyChange has not been called");
			done();
		}.bind(this));
	});

	QUnit.test("when calling 'addPersonalizationChanges' with a change without a valid change handler", function(assert) {
		var done = assert.async();
		this.mMoveChangeData1.changeSpecificData.changeType = "noChangeHandlerForThisType";
		ControlVariantsAPI.addPersonalizationChanges([this.mMoveChangeData1])
		.then(function() {
			assert.equal(this.fnUtilsLogErrorSpy.callCount, 1, "one error ocurred");
			assert.equal(this.fnUtilsLogErrorSpy.args[0][0], "Error during execPromiseQueueSequentially processing occured: No valid ChangeHandler", "error message: No valid ChangeHandler");
			assert.equal(this.fnAddPreparedChangeSpy.callCount, 0, "addDirtyChange has not been called");
			done();
		}.bind(this));
	});

	QUnit.test("when calling 'addPersonalizationChanges' with a change whose change handler has no revertChange", function(assert) {
		var done = assert.async();
		var oControl = sap.ui.getCore().byId("testComponent---mockview--ObjectPageLayout");
		var oChangeHandler = jQuery.extend(true, {}, ChangeRegistry.getInstance().getChangeHandler("moveControls", oControl.getMetadata().getName(), oControl, sap.ui.fl.changeHandler.JsControlTreeModifier,"CUSTOMER"));
		oChangeHandler.revertChange = undefined;
		sandbox.stub(ChangeRegistry.getInstance(), "getChangeHandler").returns(oChangeHandler);
		ControlVariantsAPI.addPersonalizationChanges([this.mMoveChangeData1])
		.then(function() {
			assert.equal(this.fnUtilsLogErrorSpy.callCount, 1, "one error ocurred");
			assert.equal(this.fnUtilsLogErrorSpy.args[0][0], "Error during execPromiseQueueSequentially processing occured: ChangeHandler has no revertChange function", "error message: ChangeHandler has no revertChange function");
			assert.equal(this.fnAddPreparedChangeSpy.callCount, 0, "addDirtyChange has not been called");
			done();
		}.bind(this));
	});

	QUnit.test("when calling 'addPersonalizationChanges' with two valid variant changes and an invalid change", function(assert) {
		var done = assert.async();
		this.mRenameChangeData1.selectorControl = undefined;
		ControlVariantsAPI.addPersonalizationChanges([this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2])
		.then(function() {
			assert.equal(this.fnUtilsLogErrorSpy.callCount, 1, "one error ocurred");
			assert.equal(this.fnAddPreparedChangeSpy.callCount, 2, "addDirtyChange has been called twice");
			done();
		}.bind(this));
	});

	QUnit.test("when calling 'addPersonalizationChanges' with variant changes for different variant management controls", function(assert) {
		var done = assert.async();
		sandbox.stub(Utils, "getCurrentLayer").returns("CUSTOMER"); //needed as some ChangeHandlers are not available for USER layer
		ControlVariantsAPI.addPersonalizationChanges([this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2, this.mRenameChangeData2])
		.then(function() {
			assert.equal(this.fnUtilsLogErrorSpy.callCount, 0, "no error ocurred");
			assert.equal(this.fnAddPreparedChangeSpy.callCount, 4, "addDirtyChange has been called four times");
			assert.equal(this.fnAddPreparedChangeSpy.args[0][0].getDefinition().variantReference, "mockview--VariantManagement1", "first change is for VariantManagement1");
			assert.equal(this.fnAddPreparedChangeSpy.args[1][0].getDefinition().variantReference, "mockview--VariantManagement1", "second change is for VariantManagement1");
			assert.equal(this.fnAddPreparedChangeSpy.args[2][0].getDefinition().variantReference, "mockview--VariantManagement1", "third change is for VariantManagement1");
			assert.equal(this.fnAddPreparedChangeSpy.args[3][0].getDefinition().variantReference, "mockview--VariantManagement2", "fourth change is for VariantManagement2");
			done();
		}.bind(this));
	});

	QUnit.test("when calling 'addPersonalizationChanges' with a change outside of a variant management control", function(assert) {
		var done = assert.async();
		sandbox.stub(Utils, "getCurrentLayer").returns("CUSTOMER"); //needed as some ChangeHandlers are not available for USER layer
		var oChangeData = {
			selectorControl: sap.ui.getCore().byId("testComponent---mockview--Button"),
			changeSpecificData: {
				changeType: "rename",
				renamedElement: {
					id: "testComponent---mockview--Button"
				},
				value : "Personalized Text"
			}
		};
		ControlVariantsAPI.addPersonalizationChanges([oChangeData])
		.then(function() {
			assert.equal(this.fnUtilsLogErrorSpy.callCount, 1, "one error ocurred");
			assert.equal(this.fnUtilsLogErrorSpy.args[0][0], "Error during execPromiseQueueSequentially processing occured: No Variant Management Control available for change", "error message: No Variant Management Control available for change");
			assert.equal(this.fnAddPreparedChangeSpy.callCount, 0, "addDirtyChange has not been called");
			done();
		}.bind(this));
	});

});
