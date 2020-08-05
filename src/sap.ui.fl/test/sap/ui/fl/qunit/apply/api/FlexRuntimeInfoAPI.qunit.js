/* global QUnit */

sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/thirdparty/sinon-4"
], function(
	ComponentContainer,
	Control,
	UIComponent,
	Cache,
	Layer,
	Utils,
	FlexRuntimeInfoAPI,
	VariantModel,
	ChangesController,
	FlexState,
	VariantManagementState,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function mockFlexController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getFlexControllerInstance")
			.withArgs(oControl)
			.returns(oReturn);
	}

	QUnit.module("isPersonalized", {
		beforeEach : function() {
			this.oAppComponent = new UIComponent("AppComponent21");
			this.oGetAppComponentStub = sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach: function() {
			if (this.oControl) {
				this.oControl.destroy();
			}
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When isPersonalized() is called with controls of type sap.ui.core.Element and no change type", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").resolves({});
			this.aChangeTypes = ["changeType1", "changeType2"];
			this.oControl = new Control("controlId1");
			var aControls = [this.oControl, {id: "controlId2", appComponent: this.oAppComponent}];
			return FlexRuntimeInfoAPI.isPersonalized({
				selectors: aControls,
				changeTypes: this.aChangeTypes
			}).then(function(bIsPersonalized) {
				assert.ok(!bIsPersonalized, "No personalization changes on control were found.");
			});
		});

		QUnit.test("When isPersonalized() is called with controls as a map and no change type", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({}));
			this.aChangeTypes = ["changeType1", "changeType2"];
			var aControls = [{id: "controlId1", appComponent: this.oAppComponent}];
			return FlexRuntimeInfoAPI.isPersonalized({
				selectors: aControls,
				changeTypes: this.aChangeTypes
			}).then(function(bIsPersonalized) {
				assert.ok(!bIsPersonalized, "No personalization changes on control were found.");
			});
		});

		QUnit.test("When isPersonalized() is called with an array of control ids and change type", function(assert) {
			this.aChangeTypes = ["changeType1", "changeType2"];
			this.oControl = new Control("controlId1");
			var aControls = [this.oControl];

			var oChangeContent0 = {fileName:"change0", fileType:"change", variantReference:"", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType1", layer: Layer.USER};
			var oChangeContent1 = {fileName:"change1", fileType:"change", variantReference:"variantManagementId", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType1", layer: Layer.USER};
			var oChangeContent2 = {fileName:"change2", fileType:"change", variantReference:"variantManagementId", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType2", layer: Layer.USER};
			var oChangeContent3 = {fileName:"change3", fileType:"change", variantReference:"variant1", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType2", layer: Layer.USER};
			var oVariantChangeContent0 = {fileName: "variantChange0", fileType: "ctrl_variant_change", layer: Layer.USER, selector: {id: "variantManagementId"}, changeType: "changeType1"};
			var oVariantManagementChangeContent0 = {fileName: "variantManagementChange0", fileType: "ctrl_variant_management_change", layer: Layer.USER, changeType: "changeType1", selector: {id: "variantManagementId"}, content: {defaultVariant: "defaultVariant0"}};


			var oMockedWrappedContent = {
				changes : {
					changes : [oChangeContent0],
					variantSection : {
						variantManagementId : {
							variants : [{
								content : {
									fileName: "variantManagementId",
									fileType:"ctrl_variant",
									content: {
										title: "variant 0"
									}
								},
								controlChanges : [oChangeContent1, oChangeContent2],
								variantChanges : {
									setTitle: [oVariantChangeContent0]
								}
							},
								{
									content : {
										fileName: "variant1",
										fileType:"ctrl_variant",
										variantReference:"variantManagementId",
										content: {
											title: "variant 1"
										}
									},
									controlChanges : [oChangeContent3],
									variantChanges : {}
								}],
							variantManagementChanges: {
								setDefault: [oVariantManagementChangeContent0]
							}
						}
					}
				}
			};

			sandbox.stub(VariantManagementState, "updateVariantsState");
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));
			return FlexRuntimeInfoAPI.isPersonalized({
				selectors: aControls,
				changeTypes: this.aChangeTypes
			}).then(function(bIsPersonalized) {
				assert.ok(bIsPersonalized, "Personalization changes were found on control.");
			});
		});

		QUnit.test("When isPersonalized() is called with an empty control ids, non-empty change types", function(assert) {
			this.aChangeTypes = ["changeType1", "changeType2"];
			assert.throws(
				FlexRuntimeInfoAPI.isPersonalized({
					selectors: [],
					changeTypes: this.aChangeTypes
				}),
				"a rejection takes place"
			);
		});

		QUnit.test("When isPersonalized() is called with an array of control maps, without an app component and empty changes", function(assert) {
			var aControlIds = [{id: "controlId1"}];
			this.oGetAppComponentStub.returns(undefined);
			assert.throws(
				FlexRuntimeInfoAPI.isPersonalized({
					selectors: aControlIds,
					changeTypes: []
				}),
				"a rejection takes place"
			);
		});

		QUnit.test("When isPersonalized() is called with undefined change types", function(assert) {
			var oChangeContent0 = {fileName:"change0", fileType:"change", variantReference:"", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType1", layer: Layer.USER};
			var aControls = [{id: "controlId1", appComponent: this.oAppComponent}];
			var oMockedWrappedContent = {
				changes: {
					changes: [oChangeContent0]
				}
			};
			sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(oMockedWrappedContent.changes);
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));
			return FlexRuntimeInfoAPI.isPersonalized({
				selectors: aControls
			}).then(function(bIsPersonalized) {
				assert.equal(!!bIsPersonalized, true, "Personalization changes were found on control.");
			});
		});

		QUnit.test("When isPersonalized() is called with an empty array of change types", function(assert) {
			var oChangeContent0 = {fileName:"change0", fileType:"change", variantReference:"", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType1", layer: Layer.USER};
			var aControls = [{id: "controlId1", appComponent: this.oAppComponent}];
			var oMockedWrappedContent = {
				changes: {
					changes: [oChangeContent0]
				}
			};
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));
			return FlexRuntimeInfoAPI.isPersonalized({
				selectors: aControls,
				changeTypes: []
			}).then(function(bIsPersonalized) {
				assert.equal(!!bIsPersonalized, true, "Personalization changes were found on control.");
			});
		});

		QUnit.test("When isPersonalized() is called with variant control changes", function(assert) {
			this.aChangeTypes = ["change0", "changeType2"];
			this.oControl = new Control("controlId1");

			var oChangeContent0 = {fileName:"change0", variantReference:""};
			var oChangeContent1 = {fileName:"change1", variantReference:"variant0"};
			var oChangeContent2 = {fileName:"change2", variantReference:"variant0"};
			var oChangeContent3 = {fileName:"change3", variantReference:"variant1"};
			var oChangeContent4 = {fileName:"change4", variantReference:"variant1"};

			var oMockedWrappedContent = {
				changes : {
					changes : [oChangeContent0],
					variantSection : {
						variantManagementId : {
							variants : [{
								content : {
									fileName: "variantManagementId",
									content: {
										title: "variant 0"
									}
								},
								controlChanges : [oChangeContent1, oChangeContent2],
								variantChanges : {}
							},
								{
									content : {
										fileName: "variant1",
										variantReference:"variant0",
										content: {
											title: "variant 1"
										}
									},
									controlChanges : [oChangeContent3, oChangeContent4],
									variantChanges : {}
								}],
							variantManagementChanges: {}
						}
					}
				}
			};
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));
			return FlexRuntimeInfoAPI.isPersonalized({
				selectors: [this.oControl],
				changeTypes: this.aChangeTypes
			}).then(function(bIsPersonalized) {
				assert.equal(bIsPersonalized, false, "Personalization changes were found on control.");
			});
		});
	});

	QUnit.module("waitForChanges", {
		beforeEach: function () {
			this.aObjectsToDestroy = [];
		},
		afterEach: function() {
			sandbox.restore();
			this.aObjectsToDestroy.forEach(function(oObject) {oObject.destroy();});
		}
	}, function() {
		QUnit.test("FlexRuntimeInfoAPI.waitForChanges", function(assert) {
			var oControl = new Control();
			this.aObjectsToDestroy.push(oControl);
			var oWaitForChangesStub = sandbox.stub().resolves();
			mockFlexController(oControl, {waitForChangesToBeApplied: oWaitForChangesStub});

			return FlexRuntimeInfoAPI.waitForChanges({element: oControl}).then(function() {
				assert.equal(oWaitForChangesStub.callCount, 1, "the waitForChanges method was called");
				assert.ok(oWaitForChangesStub.alwaysCalledWithExactly(oControl), "the controls are passed as parameter");
			});
		});
		QUnit.test("FlexRuntimeInfoAPI.waitForChanges on multiple controls", function(assert) {
			var oControl = new Control();
			this.aObjectsToDestroy.push(oControl);
			var aControls = [oControl];
			var oWaitForChangesStub = sandbox.stub().resolves();
			mockFlexController(oControl, {waitForChangesToBeApplied: oWaitForChangesStub});

			return FlexRuntimeInfoAPI.waitForChanges({selectors: aControls}).then(function() {
				assert.equal(oWaitForChangesStub.callCount, 1, "the waitForChanges method was called");
				assert.ok(oWaitForChangesStub.alwaysCalledWithExactly(aControls), "the controls are passed as parameter");
			});
		});
	});

	QUnit.module("isFlexSupported", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when there is an app component associated with the control", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns({});
			assert.equal(FlexRuntimeInfoAPI.isFlexSupported({element: {}}), true, "the function returns true");
		});

		QUnit.test("when there is no app component associated with the control", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns();
			assert.equal(FlexRuntimeInfoAPI.isFlexSupported({element: {}}), false, "the function returns false");
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
				this.oFlexController = ChangesController.getFlexControllerInstance(this.oComp);
				var oVariantModel = new VariantModel({
					variantManagement: {
						variants: []
					}
				}, this.oFlexController, this.oComp);
				this.oComp.setModel(oVariantModel, Utils.VARIANT_MODEL_NAME);
				this.oCompContainer = new ComponentContainer("sap-ui-static", {
					component: this.oComp
				}).placeAt("qunit-fixture");

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
			var bVariantManagementReference1 = FlexRuntimeInfoAPI.hasVariantManagement({element: sap.ui.getCore().byId("testComponent---mockview--ObjectPageLayout")});
			var bVariantManagementReference2 = FlexRuntimeInfoAPI.hasVariantManagement({element: sap.ui.getCore().byId("testComponent---mockview--TextTitle1")});
			assert.ok(bVariantManagementReference1, "true is returned for the first variant management control");
			assert.ok(bVariantManagementReference2, "true is returned for the second variant management control");
		});

		QUnit.test("when calling 'hasVariantManagement' with a control that doesn't belong to a variant management control", function(assert) {
			var bVariantManagementReference = FlexRuntimeInfoAPI.hasVariantManagement({element: sap.ui.getCore().byId("testComponent---mockview--Button")});
			assert.notOk(bVariantManagementReference, "false is returned");
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
