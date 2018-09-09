/* global QUnit */

sap.ui.define([
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/thirdparty/sinon-4"
], function(
	VariantModel,
	VariantManagement,
	Utils,
	ControlPersonalizationAPI,
	FlexControllerFactory,
	ChangeRegistry,
	Component,
	UIComponent,
	ComponentContainer,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var fnStubTechnicalParameterValues = function (aUrlTechnicalParameters) {
		sandbox.stub(this.oModel, "_getLocalId").withArgs(this.oDummyControl.getId(), this.oComponent).returns("variantMgmtId1");
		sandbox.spy(this.oModel, "updateHasherEntry");
		sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variant1").returns(true);
		sandbox.stub(Utils, "getUshellContainer").returns(true);
		sandbox.stub(Utils, "getParsedURLHash").returns({
			params: {
			'sap-ui-fl-control-variant-id' : aUrlTechnicalParameters
			}
		});
		sandbox.stub(Utils, "setTechnicalURLParameterValues");
	};

	var fnStubUpdateCurrentVariant = function () {
		sandbox.stub(this.oModel, "updateCurrentVariant").returns(Promise.resolve());
	};

	var fnCheckUpdateCurrentVariantCalled = function (assert, sVariantManagement, sVariant) {
		assert.ok(this.oModel.updateCurrentVariant.calledOnce, "then variantModel.updateCurrentVariant called once");
		assert.ok(this.oModel.updateCurrentVariant.calledWithExactly(sVariantManagement, sVariant, this.oComponent), "then variantModel.updateCurrentVariant called to activate the target variant");
	};

	var fnCheckActivateVariantErrorResponse = function (assert, sExpectedError, sReceivedError) {
		assert.equal(sReceivedError, sExpectedError, "then Promise.reject() with the appropriate error message returned");
		assert.equal(this.oModel.updateCurrentVariant.callCount, 0, "then variantModel.updateCurrentVariant not called");
	};

	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function() {
			this.oData = {
				"variantMgmtId1": {
					"defaultVariant": "variantMgmtId1",
					"originalDefaultVariant": "variantMgmtId1",
					"variants": [
						{
							"author": "SAP",
							"key": "variantMgmtId1",
							"layer": "VENDOR",
							"title": "Standard",
							"favorite": true,
							"visible": true
						},
						{
							"author": "Me",
							"key": "variant1",
							"layer": "CUSTOMER",
							"title": "variant B",
							"favorite": false,
							"visible": true
						}
					]
				}
			};

			var oMockFlexController = {
				_oChangePersistence: {
					_oVariantController: {
						getVariant: function () {},
						sVariantTechnicalParameterName: "sap-ui-fl-control-variant-id"
					}
				}
			};

			this.oDummyControl = new VariantManagement("dummyControl");

			this.oModel = new VariantModel(this.oData, oMockFlexController);
			this.oAppComponent = new Component("AppComponent");
			this.oAppComponent.setModel(this.oModel, "$FlexVariants");
			this.oComponent = new Component("EmbeddedComponent");
			sandbox.stub(Utils, "getAppComponentForControl")
				.callThrough()
				.withArgs(this.oDummyControl).returns(this.oAppComponent)
				.withArgs(this.oComponent).returns(this.oAppComponent);
			sandbox.stub(Utils, "getSelectorComponentForControl")
				.callThrough()
				.withArgs(this.oDummyControl).returns(this.oComponent)
				.withArgs(this.oComponent).returns(this.oComponent);
		},
		afterEach: function() {
			sandbox.restore();
			this.oModel.destroy();
			this.oAppComponent.destroy();
			this.oComponent.destroy();
			this.oDummyControl.destroy();
		}
	}, function() {
		QUnit.test("when calling 'clearVariantParameterInURL' with a control as parameter", function(assert) {
			var aUrlTechnicalParameters = ["fakevariant", "variant1"];
			fnStubTechnicalParameterValues.call(this, aUrlTechnicalParameters);

			ControlPersonalizationAPI.clearVariantParameterInURL(this.oDummyControl);

			assert.ok(Utils.getParsedURLHash.calledOnce, "then hash parameter values are requested");
			assert.ok(Utils.setTechnicalURLParameterValues.calledWithExactly(this.oAppComponent, 'sap-ui-fl-control-variant-id', [aUrlTechnicalParameters[0]]), "then 'sap-ui-fl-control-variant-id' parameter value for the provided variant management control is cleared");
			assert.deepEqual(this.oModel.updateHasherEntry.getCall(0).args[0], {
				parameters: [aUrlTechnicalParameters[0]],
				updateURL: true,
				component: this.oAppComponent
			}, "then VariantModel.updateHasherEntry called with the desired arguments");
		});

		QUnit.test("when calling 'clearVariantParameterInURL' without a parameter", function(assert) {
			var aUrlTechnicalParameters = ["fakevariant", "variant1"];
			fnStubTechnicalParameterValues.call(this, aUrlTechnicalParameters);

			ControlPersonalizationAPI.clearVariantParameterInURL();

			assert.equal(Utils.getParsedURLHash.callCount, 0, "then 'sap-ui-fl-control-variant-id' parameter values are not requested");
			assert.ok(Utils.setTechnicalURLParameterValues.calledWithExactly(undefined, 'sap-ui-fl-control-variant-id', []), "then all 'sap-ui-fl-control-variant-id' parameter values are cleared");
			assert.strictEqual(this.oModel.updateHasherEntry.callCount, 0, "then VariantModel.updateHasherEntry not called");
		});

		QUnit.test("when calling 'activateVariant' with a control id", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlPersonalizationAPI.activateVariant("dummyControl", "variant1")
			.then( function () {
				fnCheckUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a control", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlPersonalizationAPI.activateVariant(this.oDummyControl, "variant1")
			.then( function () {
				fnCheckUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a component id", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlPersonalizationAPI.activateVariant(this.oComponent.getId(), "variant1")
			.then( function () {
				fnCheckUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a component", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlPersonalizationAPI.activateVariant(this.oComponent, "variant1")
			.then(function () {
				fnCheckUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with an invalid variant reference", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlPersonalizationAPI.activateVariant(this.oComponent, "variantInvalid")
			.then(function() {},
				function (oError) {
					fnCheckActivateVariantErrorResponse.call(this, assert, "A valid control or component, and a valid variant/ID combination are required", oError.message);
				}.bind(this)
			);
		});

		QUnit.test("when calling 'activateVariant' with a random object", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlPersonalizationAPI.activateVariant({}, "variant1")
			.then(function() {},
				function (oError) {
					fnCheckActivateVariantErrorResponse.call(this, assert, "A valid variant management control or component (instance or ID) should be passed as parameter", oError.message);
				}.bind(this)
			);
		});

		QUnit.test("when calling 'activateVariant' with an invalid id", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlPersonalizationAPI.activateVariant("invalidId", "variant1")
			.then(function() {},
				function (oError) {
					fnCheckActivateVariantErrorResponse.call(this, assert, "No valid component or control found for the provided ID", oError.message);
				}.bind(this)
			);
		});

		QUnit.test("when calling 'activateVariant' with a control with an invalid variantModel", function(assert) {
			fnStubUpdateCurrentVariant.call(this);
			this.oAppComponent.setModel(null, "$FlexVariants");

			return ControlPersonalizationAPI.activateVariant(this.oDummyControl, "variant1")
			.then(function() {},
				function (oError) {
					fnCheckActivateVariantErrorResponse.call(this, assert, "No variant management model found for the passed control or application component", oError.message);
				}.bind(this)
			);
		});
	});

	QUnit.module("_checkChangeSpecificData", {
	}, function() {
		QUnit.test("when _checkChangeSpecificData is called without selector control", function(assert) {
			var oChange = {
				changeSpecificData: {
					changeType: "foo"
				}
			};
			var oError = ControlPersonalizationAPI._checkChangeSpecificData(oChange);
			assert.deepEqual(oError.change, oChange, "the function returns the given change");
			assert.equal(oError.message, "No valid selectorControl", "the function returns an error");
		});

		QUnit.test("when _checkChangeSpecificData is called without selector control getMetadata function", function(assert) {
			var oChange = {
				changeSpecificData: {
					changeType: "foo"
				},
				selectorControl: {}
			};
			var oError = ControlPersonalizationAPI._checkChangeSpecificData(oChange);
			assert.deepEqual(oError.change, oChange, "the function returns the given change");
			assert.equal(oError.message, "No valid selectorControl", "the function returns an error");
		});

		QUnit.test("when _checkChangeSpecificData is called without changeSpecificData", function(assert) {
			var oChange = {
				selectorControl: {
					getMetadata: function() {
						return {
							getName: function() {
								return "sap.ui.fl.test.Foo";
							}
						};
					}
				}
			};
			var oError = ControlPersonalizationAPI._checkChangeSpecificData(oChange);
			assert.deepEqual(oError.change, oChange, "the function returns the given change");
			assert.equal(oError.message, "No changeSpecificData available", "the function returns an error");
		});

		QUnit.test("when _checkChangeSpecificData is called without changeType", function(assert) {
			var oChange = {
				changeSpecificData: {},
				selectorControl: {
					getMetadata: function() {
						return {
							getName: function() {
								return "sap.ui.fl.test.Foo";
							}
						};
					}
				}
			};
			var oError = ControlPersonalizationAPI._checkChangeSpecificData(oChange);
			assert.deepEqual(oError.change, oChange, "the function returns the given change");
			assert.equal(oError.message, "No valid changeType", "the function returns an error");
		});

		QUnit.test("when _checkChangeSpecificData is called without valid changeHandler", function(assert) {
			var oChange = {
				changeSpecificData: {
					changeType: "foo"
				},
				selectorControl: {
					getMetadata: function() {
						return {
							getName: function() {
								return "sap.ui.fl.test.Foo";
							}
						};
					}
				}
			};
			var oError = ControlPersonalizationAPI._checkChangeSpecificData(oChange);
			assert.deepEqual(oError.change, oChange, "the function returns the given change");
			assert.equal(oError.message, "No valid ChangeHandler", "the function returns an error");
		});

		QUnit.test("when _checkChangeSpecificData is called without valid revertChange function in changeHandler", function(assert) {
			var oChange = {
				changeSpecificData: {
					changeType: "foo"
				},
				selectorControl: {
					getMetadata: function() {
						return {
							getName: function() {
								return "sap.ui.fl.test.Foo";
							}
						};
					}
				}
			};
			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.ui.fl.test.Foo" : {
					"foo" : function() {
						return {
							applyChange: function() {},
							completeChangeContent: function() {}
						};
					}
				}
			});
			var oError = ControlPersonalizationAPI._checkChangeSpecificData(oChange);
			assert.deepEqual(oError.change, oChange, "the function returns the given change");
			assert.equal(oError.message, "ChangeHandler has no revertChange function", "the function returns an error");
		});
	});

	QUnit.module("Given an instance of VariantModel", {
		beforeEach : function(assert) {
			var done = assert.async();

			jQuery.get("test-resources/sap/ui/fl/qunit/testResources/VariantManagementTestApp.view.xml", null,
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
						var oApp = new sap.m.App(this.createId("mockapp"));
						var oView = sap.ui.xmlview({
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
				}).placeAt("qunit-fixture");

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
		afterEach: function() {
			sandbox.restore();
			this.oCompContainer.destroy();
			this.oComp.destroy();
		}
	}, function() {
		QUnit.test("when calling 'hasVariantManagement' with a control that belong to a variant management control", function(assert) {
			var bVariantManagementReference1 = ControlPersonalizationAPI.hasVariantManagement(this.mMoveChangeData1.selectorControl);
			var bVariantManagementReference2 = ControlPersonalizationAPI.hasVariantManagement(this.mRenameChangeData2.selectorControl);
			assert.ok(bVariantManagementReference1, "true is returned for the first variant management control");
			assert.ok(bVariantManagementReference2, "true is returned for the second variant management control");
		});

		QUnit.test("when calling 'hasVariantManagement' with a control that doesn't belong to a variant management control", function(assert) {
			var bVariantManagementReference = ControlPersonalizationAPI.hasVariantManagement(sap.ui.getCore().byId("testComponent---mockview--Button"));
			assert.notOk(bVariantManagementReference, "false is returned");
		});

		QUnit.test("when calling 'addPersonalizationChanges' with two valid variant changes", function(assert) {
			return ControlPersonalizationAPI.addPersonalizationChanges([this.mMoveChangeData1, this.mMoveChangeData2])
			.then(function() {
				assert.equal(this.fnUtilsLogErrorSpy.callCount, 0, "no errors ocurred");
				assert.equal(this.fnAddPreparedChangeSpy.callCount, 2, "addDirtyChange has been called twice");
			}.bind(this));
		});

		QUnit.test("when calling 'addPersonalizationChanges' with a change with invalid changeSpecificData", function(assert) {
			sandbox.stub(ControlPersonalizationAPI, "_checkChangeSpecificData").returns({message: "myError"});
			return ControlPersonalizationAPI.addPersonalizationChanges([this.mMoveChangeData1])
			.then(function() {
				assert.equal(this.fnUtilsLogErrorSpy.callCount, 1, "one error ocurred");
				assert.equal(this.fnUtilsLogErrorSpy.args[0][0], "Error during execPromiseQueueSequentially processing occured: myError", "error message: myError");
				assert.equal(this.fnAddPreparedChangeSpy.callCount, 0, "addDirtyChange has not been called");
			}.bind(this));
		});

		QUnit.test("when calling 'addPersonalizationChanges' with two valid variant changes and an invalid change", function(assert) {
			this.mRenameChangeData1.selectorControl = undefined;
			return ControlPersonalizationAPI.addPersonalizationChanges([this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2])
			.then(function() {
				assert.equal(this.fnUtilsLogErrorSpy.callCount, 1, "one error ocurred");
				assert.equal(this.fnAddPreparedChangeSpy.callCount, 2, "addDirtyChange has been called twice");
			}.bind(this));
		});

		QUnit.test("when calling 'addPersonalizationChanges' with variant changes for different variant management controls", function(assert) {
			sandbox.stub(Utils, "getCurrentLayer").returns("CUSTOMER"); //needed as some ChangeHandlers are not available for USER layer
			return ControlPersonalizationAPI.addPersonalizationChanges([this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2, this.mRenameChangeData2])
			.then(function() {
				assert.equal(this.fnUtilsLogErrorSpy.callCount, 0, "no error ocurred");
				assert.equal(this.fnAddPreparedChangeSpy.callCount, 4, "addDirtyChange has been called four times");
				assert.equal(this.fnAddPreparedChangeSpy.args[0][0].getVariantReference(), "mockview--VariantManagement1", "first change is for VariantManagement1");
				assert.equal(this.fnAddPreparedChangeSpy.args[1][0].getVariantReference(), "mockview--VariantManagement1", "second change is for VariantManagement1");
				assert.equal(this.fnAddPreparedChangeSpy.args[2][0].getVariantReference(), "mockview--VariantManagement1", "third change is for VariantManagement1");
				assert.equal(this.fnAddPreparedChangeSpy.args[3][0].getVariantReference(), "mockview--VariantManagement2", "fourth change is for VariantManagement2");
			}.bind(this));
		});

		QUnit.test("when calling 'addPersonalizationChanges' with a change outside of a variant management control", function(assert) {
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
			return ControlPersonalizationAPI.addPersonalizationChanges([oChangeData])
			.then(function() {
				assert.equal(this.fnUtilsLogErrorSpy.callCount, 0, "no error occurred");
				assert.equal(this.fnAddPreparedChangeSpy.callCount, 1, "addDirtyChange has been called once");
				assert.deepEqual(this.fnAddPreparedChangeSpy.firstCall.args[0].getSelector(), {id: "mockview--Button", idIsLocal: true} , "addDirtyChange was called with the correct change");
				assert.deepEqual(this.fnAddPreparedChangeSpy.firstCall.args[1], this.oComp, "addDirtyChange was called with the correct component");
				assert.notOk(this.fnAddPreparedChangeSpy.firstCall.args[0].getVariantReference(), "addDirtyChange was called for a change without variant management");
			}.bind(this));
		});

		QUnit.test("when calling 'addPersonalizationChanges' with variant changes for different variant management controls, with 'bIgnoreVariantManagement' set to true", function(assert) {
			sandbox.stub(Utils, "getCurrentLayer").returns("CUSTOMER"); //needed as some ChangeHandlers are not available for USER layer
			return ControlPersonalizationAPI.addPersonalizationChanges([this.mMoveChangeData1, this.mRenameChangeData1, this.mMoveChangeData2, this.mRenameChangeData2], true)
				.then(function() {
					assert.equal(this.fnUtilsLogErrorSpy.callCount, 0, "no error ocurred");
					assert.equal(this.fnAddPreparedChangeSpy.callCount, 4, "addDirtyChange has been called four times");
					assert.notOk(this.fnAddPreparedChangeSpy.args[0][0].getVariantReference(), "first change is without VariantManagement1");
					assert.notOk(this.fnAddPreparedChangeSpy.args[1][0].getVariantReference(), "second change is without VariantManagement1");
					assert.notOk(this.fnAddPreparedChangeSpy.args[2][0].getVariantReference(), "third change is without VariantManagement1");
					assert.notOk(this.fnAddPreparedChangeSpy.args[3][0].getVariantReference(), "fourth change is without VariantManagement2");
				}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});