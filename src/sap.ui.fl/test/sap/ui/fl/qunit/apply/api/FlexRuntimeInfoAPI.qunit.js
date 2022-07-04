/* global QUnit */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	UIComponent,
	VariantUtils,
	VariantManagementState,
	FlexState,
	ChangesController,
	FlexRuntimeInfoAPI,
	Cache,
	Layer,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function mockFlexController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getFlexControllerInstance")
			.withArgs(oControl)
			.returns(oReturn);
	}

	QUnit.module("isPersonalized", {
		beforeEach: function() {
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

			var oChangeContent0 = {fileName: "change0", fileType: "change", variantReference: "", selector: {id: "controlId1", idIsLocal: false}, changeType: "changeType1", layer: Layer.USER};
			var oChangeContent1 = {fileName: "change1", fileType: "change", variantReference: "variantManagementId", selector: {id: "controlId1", idIsLocal: false}, changeType: "changeType1", layer: Layer.USER};
			var oChangeContent2 = {fileName: "change2", fileType: "change", variantReference: "variantManagementId", selector: {id: "controlId1", idIsLocal: false}, changeType: "changeType2", layer: Layer.USER};
			var oChangeContent3 = {fileName: "change3", fileType: "change", variantReference: "variant1", selector: {id: "controlId1", idIsLocal: false}, changeType: "changeType2", layer: Layer.USER};
			var oVariantChangeContent0 = {fileName: "variantChange0", fileType: "ctrl_variant_change", layer: Layer.USER, selector: {id: "variantManagementId"}, changeType: "changeType1"};
			var oVariantManagementChangeContent0 = {fileName: "variantManagementChange0", fileType: "ctrl_variant_management_change", layer: Layer.USER, changeType: "changeType1", selector: {id: "variantManagementId"}, content: {defaultVariant: "defaultVariant0"}};


			var oMockedWrappedContent = {
				changes: {
					changes: [oChangeContent0],
					variantSection: {
						variantManagementId: {
							variants: [{
								content: {
									fileName: "variantManagementId",
									fileType: "ctrl_variant",
									content: {
										title: "variant 0"
									}
								},
								controlChanges: [oChangeContent1, oChangeContent2],
								variantChanges: {
									setTitle: [oVariantChangeContent0]
								}
							},
							{
								content: {
									fileName: "variant1",
									fileType: "ctrl_variant",
									variantReference: "variantManagementId",
									content: {
										title: "variant 1"
									}
								},
								controlChanges: [oChangeContent3],
								variantChanges: {}
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
			var oChangeContent0 = {fileName: "change0", fileType: "change", variantReference: "", selector: {id: "controlId1", idIsLocal: false}, changeType: "changeType1", layer: Layer.USER};
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
			var oChangeContent0 = {fileName: "change0", fileType: "change", variantReference: "", selector: {id: "controlId1", idIsLocal: false}, changeType: "changeType1", layer: Layer.USER};
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

			var oChangeContent0 = {fileName: "change0", variantReference: ""};
			var oChangeContent1 = {fileName: "change1", variantReference: "variant0"};
			var oChangeContent2 = {fileName: "change2", variantReference: "variant0"};
			var oChangeContent3 = {fileName: "change3", variantReference: "variant1"};
			var oChangeContent4 = {fileName: "change4", variantReference: "variant1"};

			var oMockedWrappedContent = {
				changes: {
					changes: [oChangeContent0],
					variantSection: {
						variantManagementId: {
							variants: [{
								content: {
									fileName: "variantManagementId",
									content: {
										title: "variant 0"
									}
								},
								controlChanges: [oChangeContent1, oChangeContent2],
								variantChanges: {}
							},
							{
								content: {
									fileName: "variant1",
									variantReference: "variant0",
									content: {
										title: "variant 1"
									}
								},
								controlChanges: [oChangeContent3, oChangeContent4],
								variantChanges: {}
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

				var aPassedValue = [{
					selector: oControl
				}];
				assert.ok(oWaitForChangesStub.alwaysCalledWithExactly(aPassedValue), "the controls are passed as parameter");
			});
		});

		QUnit.test("FlexRuntimeInfoAPI.waitForChanges on multiple controls", function(assert) {
			var oControl = new Control();
			var oControl1 = new Control();
			this.aObjectsToDestroy.push(oControl, oControl1);
			var aControls = [oControl, oControl1];
			var oWaitForChangesStub = sandbox.stub().resolves();
			mockFlexController(oControl, {waitForChangesToBeApplied: oWaitForChangesStub});

			return FlexRuntimeInfoAPI.waitForChanges({selectors: aControls}).then(function() {
				assert.equal(oWaitForChangesStub.callCount, 1, "the waitForChanges method was called");

				var aPassedValue = [{
					selector: oControl
				}, {
					selector: oControl1
				}];
				assert.ok(oWaitForChangesStub.alwaysCalledWithExactly(aPassedValue), "the controls are passed as parameter");
			});
		});

		QUnit.test("FlexRuntimeInfoAPI.waitForChanges with change types", function(assert) {
			var oControl = new Control();
			var oControl1 = new Control();
			this.aObjectsToDestroy.push(oControl, oControl1);
			var oWaitForChangesStub = sandbox.stub().resolves();
			var aComplexSelectors = [
				{
					selector: oControl,
					changeTypes: ["changeType1", "changeType2"]
				},
				{
					selector: oControl1,
					changeTypes: ["changeType3", "changeType4"]
				}
			];
			mockFlexController(oControl, {waitForChangesToBeApplied: oWaitForChangesStub});

			return FlexRuntimeInfoAPI.waitForChanges({complexSelectors: aComplexSelectors}).then(function() {
				assert.equal(oWaitForChangesStub.callCount, 1, "the waitForChanges method was called");

				var aPassedValue = [{
					selector: oControl,
					changeTypes: ["changeType1", "changeType2"]
				}, {
					selector: oControl1,
					changeTypes: ["changeType3", "changeType4"]
				}];
				assert.ok(oWaitForChangesStub.alwaysCalledWithExactly(aPassedValue), "the controls are passed as parameter");
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

	QUnit.module("hasVariantManagement", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called with an object", function(assert) {
			var oBelongsToVMStub = sandbox.stub(VariantUtils, "belongsToVariantManagement").returns("foo");

			var sResult = FlexRuntimeInfoAPI.hasVariantManagement({element: "element"});
			assert.strictEqual(oBelongsToVMStub.callCount, 1, "the Util was called once");
			assert.strictEqual(oBelongsToVMStub.firstCall.args[0], "element", "the Util was called with the correct property");
			assert.strictEqual(sResult, "foo", "the function returns whatever the Util returns");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
