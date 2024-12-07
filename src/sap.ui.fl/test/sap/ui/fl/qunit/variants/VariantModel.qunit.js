/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/m/App",
	"sap/m/Button",
	"sap/ui/base/Event",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/_internal/controlVariants/ControlVariantWriteUtils",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	_omit,
	Log,
	App,
	Button,
	Event,
	XMLView,
	JsControlTreeModifier,
	BusyIndicator,
	ComponentContainer,
	Element,
	Lib,
	UIComponent,
	Reverter,
	URLHandler,
	VariantUtil,
	FlexObjectFactory,
	States,
	Switcher,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	ControlVariantApplyAPI,
	Settings,
	VariantManagement,
	VariantManager,
	VariantModel,
	ControlVariantWriteUtils,
	FlexObjectManager,
	ContextBasedAdaptationsAPI,
	FlexControllerFactory,
	Layer,
	LayerUtils,
	Utils,
	ResourceModel,
	nextUIUpdate,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");
	const sVMReference = "variantMgmtId1";
	let oComponent;
	const sReference = "MyComponent";
	sinon.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
	sinon.stub(BusyIndicator, "show");
	sinon.stub(BusyIndicator, "hide");
	const oDummyControl = {
		attachManage: sandbox.stub(),
		detachManage: sandbox.stub(),
		openManagementDialog: sandbox.stub()
	};

	function createVariant(mVariantProperties) {
		return FlexObjectFactory.createFlVariant({
			id: mVariantProperties.fileName || mVariantProperties.key,
			reference: mVariantProperties.reference || sReference,
			layer: mVariantProperties.layer,
			user: mVariantProperties.author,
			variantReference: mVariantProperties.variantReference,
			variantManagementReference: mVariantProperties.variantManagementReference || sVMReference,
			variantName: mVariantProperties.title,
			contexts: mVariantProperties.contexts
		});
	}

	function stubFlexObjectsSelector(aFlexObjects) {
		var oFlexObjectsSelector = FlexState.getFlexObjectsDataSelector();
		var oGetFlexObjectsStub = sandbox.stub(oFlexObjectsSelector, "get");
		oGetFlexObjectsStub.callsFake(function(...aArgs) {
			return aFlexObjects.concat(oGetFlexObjectsStub.wrappedMethod.apply(this, aArgs));
		});
		oFlexObjectsSelector.checkUpdate();
	}

	QUnit.module("Given an instance of VariantModel", {
		beforeEach() {
			oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sReference);
			return FlexState.initialize({
				reference: sReference,
				componentId: "RTADemoAppMD",
				componentData: {},
				manifest: {}
			}).then(function() {
				sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
				sandbox.stub(URLHandler, "attachHandlers");

				this.oFlexController = FlexControllerFactory.create(sReference);
				sandbox.spy(URLHandler, "initialize");
				this.oDataSelectorUpdateSpy = sandbox.spy(VariantManagementState.getVariantManagementMap(), "addUpdateListener");

				const oPersistedUIChange = FlexObjectFactory.createUIChange({
					id: "someUIChange",
					selector: {
						id: "someControlId"
					},
					layer: Layer.CUSTOMER,
					variantReference: "variant1"
				});
				oPersistedUIChange.setProperty("state", States.LifecycleState.PERSISTED);
				stubFlexObjectsSelector([
					createVariant({
						author: VariantUtil.DEFAULT_AUTHOR,
						key: sVMReference,
						layer: Layer.VENDOR,
						title: "Standard",
						contexts: {}
					}),
					createVariant({
						author: "Me",
						key: "variant0",
						layer: Layer.CUSTOMER,
						title: "variant A",
						contexts: { role: ["ADMINISTRATOR", "HR"], country: ["DE"] }
					}),
					createVariant({
						author: "Me",
						key: "variant1",
						layer: Layer.PUBLIC,
						variantReference: sVMReference,
						title: "variant B",
						favorite: false,
						executeOnSelect: true,
						contexts: { role: ["ADMINISTRATOR"], country: ["DE"] }
					}),
					createVariant({
						author: "Not Me",
						key: "variant2",
						layer: Layer.PUBLIC,
						variantReference: sVMReference,
						title: "variant C",
						favorite: false,
						executeOnSelect: true,
						contexts: {}
					}),
					createVariant({
						author: "Me",
						key: "variant3",
						layer: Layer.USER,
						variantReference: sVMReference,
						title: "variant D",
						favorite: false,
						executeOnSelect: true,
						contexts: { role: [], country: [] }
					}),
					FlexObjectFactory.createUIChange({
						id: "setDefaultVariantChange",
						layer: Layer.CUSTOMER,
						changeType: "setDefault",
						fileType: "ctrl_variant_management_change",
						selector: {
							id: sVMReference
						},
						content: {
							defaultVariant: "variant1"
						}
					}),
					FlexObjectFactory.createUIChange({
						id: "setFavoriteChange",
						layer: Layer.CUSTOMER,
						changeType: "setFavorite",
						fileType: "ctrl_variant_change",
						selector: {
							id: "variant1"
						},
						content: {
							favorite: false
						}
					}),
					FlexObjectFactory.createUIChange({
						id: "setExecuteOnSelectChange",
						layer: Layer.CUSTOMER,
						changeType: "setExecuteOnSelect",
						fileType: "ctrl_variant_change",
						selector: {
							id: "variant1"
						},
						content: {
							executeOnSelect: true
						}
					}),
					oPersistedUIChange
				]);

				this.oModel = new VariantModel({}, {
					flexController: this.oFlexController,
					appComponent: oComponent
				});
				oComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
				return this.oModel.initialize();
			}.bind(this));
		},
		afterEach() {
			FlexState.clearState();
			FlexState.clearRuntimeSteadyObjects(sReference, "RTADemoAppMD");
			VariantManagementState.resetCurrentVariantReference(sReference);
			sandbox.restore();
			FlexObjectManager.removeDirtyFlexObjects({ reference: sReference });
			this.oModel.destroy();
			oComponent.destroy();
			delete this.oFlexController;
		}
	}, function() {
		QUnit.test("when initializing a variant model instance", function(assert) {
			assert.ok(URLHandler.initialize.calledOnce, "then URLHandler.initialize() called once");
			assert.ok(
				URLHandler.initialize.calledWith({model: this.oModel}),
				"then URLHandler.initialize() called with the the VariantModel"
			);

			var oVMData = this.oModel.getData()[sVMReference];
			assert.strictEqual(oVMData.currentVariant, "variant1", "the currentVariant was set");
			assert.strictEqual(oVMData.defaultVariant, "variant1", "the defaultVariant was set");
			assert.strictEqual(oVMData.modified, false, "the modified flag was set");

			assert.strictEqual(
				FlexObjectState.getLiveDependencyMap(sReference).mChanges.someControlId.length,
				1,
				"then the persisted UI change of the current variant is added to the dependency map"
			);
		});

		QUnit.test("when destroy() is called", function(assert) {
			assert.ok(this.oDataSelectorUpdateSpy.calledWith(this.oModel.fnUpdateListener), "the update listener was added");
			var oRemoveSpy = sandbox.spy(VariantManagementState.getVariantManagementMap(), "removeUpdateListener");
			var oClearSpy = sandbox.spy(VariantManagementState, "clearRuntimeSteadyObjects");
			var oClearCurrentVariantSpy = sandbox.spy(VariantManagementState, "resetCurrentVariantReference");
			this.oModel.destroy();
			assert.strictEqual(
				FlexObjectState.getLiveDependencyMap(sReference).mChanges.someControlId.length,
				0,
				"then the persisted UI change of the current variant is removed from the dependency map"
			);
			assert.ok(oClearSpy.calledOnce, "then fake standard variants were reset");
			assert.ok(oClearCurrentVariantSpy.calledOnce, "then the saved current variant was reset");
			assert.ok(oRemoveSpy.calledWith(this.oModel.fnUpdateListener), "the update listener was removed");
		});

		QUnit.test("when there is an update from the DataSelector", function(assert) {
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createUIChange({
						id: "setDefaultVariantChange",
						layer: Layer.CUSTOMER,
						changeType: "setDefault",
						fileType: "ctrl_variant_management_change",
						selector: {
							id: sVMReference
						},
						content: {
							defaultVariant: "variant2"
						}
					})
				]
			);
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createUIChange({
						id: "setFavoriteChange",
						layer: Layer.CUSTOMER,
						changeType: "setFavorite",
						fileType: "ctrl_variant_change",
						selector: {
							id: "variant1"
						},
						content: {
							favorite: true
						}
					})
				]
			);
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createUIChange({
						id: "someUIChange",
						layer: Layer.CUSTOMER,
						variantReference: "variant0"
					})
				]
			);
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createUIChange({
						id: "setExecuteOnSelectChange",
						layer: Layer.CUSTOMER,
						changeType: "setExecuteOnSelect",
						fileType: "ctrl_variant_change",
						selector: {
							id: "variant1"
						},
						content: {
							executeOnSelect: false
						}
					})
				]
			);
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createUIChange({
						id: "setTitleChange",
						layer: Layer.CUSTOMER,
						changeType: "setTitle",
						fileType: "ctrl_variant_change",
						selector: {
							id: "variant1"
						},
						texts: {
							title: { value: "variant B1" }
						}
					})
				]
			);
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createUIChange({
						id: "setVisibleChange",
						layer: Layer.CUSTOMER,
						changeType: "setVisible",
						fileType: "ctrl_variant_change",
						selector: {
							id: "variant1"
						},
						content: {
							visible: false
						}
					})
				]
			);
			FlexObjectManager.addDirtyFlexObjects(
				this.oModel.sFlexReference,
				[
					FlexObjectFactory.createUIChange({
						id: "setContextsChange",
						layer: Layer.CUSTOMER,
						changeType: "setContexts",
						fileType: "ctrl_variant_change",
						selector: {
							id: "variant1"
						},
						content: {
							contexts: { role: ["ADMINISTRATOR1"], country: ["DE1"] }
						}
					})
				]
			);

			var oVMData = this.oModel.getData()[sVMReference];
			assert.strictEqual(oVMData.currentVariant, "variant0", "the currentVariant was set");
			assert.strictEqual(oVMData.defaultVariant, "variant2", "the defaultVariant was set");
			assert.strictEqual(oVMData.modified, true, "the modified flag was set");

			var oVariantEntry = oVMData.variants[2];
			assert.strictEqual(oVariantEntry.executeOnSelect, false, "then executeOnSelect was updated");
			assert.strictEqual(oVariantEntry.favorite, true, "then favorite was updated");
			assert.strictEqual(oVariantEntry.title, "variant B1", "then title was updated");
			assert.strictEqual(oVariantEntry.visible, false, "then visible was updated");
			assert.deepEqual(oVariantEntry.contexts, { role: ["ADMINISTRATOR1"], country: ["DE1"] }, "then contexts were updated");
		});

		QUnit.test("when calling 'setModelPropertiesForControl'", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isKeyUser() {
					return false;
				},
				isPublicFlVariantEnabled() {
					return false;
				},
				isVariantPersonalizationEnabled() {
					return false;
				},
				getUserId() {
					return undefined;
				}
			});
			var oVMData = this.oModel.getData()[sVMReference];
			oVMData._isEditable = true;
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.ok(oVMData.variantsEditable, "the parameter variantsEditable is initially true");
			assert.strictEqual(oVMData.variants[4].rename, false, "user variant cannot renamed by default");
			assert.strictEqual(oVMData.variants[4].remove, false, "user variant cannot removed by default");
			assert.strictEqual(oVMData.variants[4].change, false, "user variant cannot changed by default");
			setTimeout(function() {
				assert.notOk(oVMData.variants[4].rename, "user variant can not be renamed after flp setting is received");
				assert.notOk(oVMData.variants[4].remove, "user variant can not be removed after flp setting is received");
				assert.notOk(oVMData.variants[4].change, "user variant can not be changed after flp setting is received");
				fnDone();
			}, 0);
			this.oModel.setModelPropertiesForControl(sVMReference, true, oDummyControl);
			assert.notOk(oVMData.variantsEditable, "the parameter variantsEditable is set to false for bDesignTimeMode = true");
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.ok(oVMData.variantsEditable, "the parameter variantsEditable is set to true for bDesignTimeMode = false");
			Settings.getInstanceOrUndef.restore();
		});

		QUnit.test("when calling 'setModelPropertiesForControl' of a PUBLIC variant", function(assert) {
			var bIsKeyUser = false;
			var bIsPublicFlVariantEnabled = true;
			var sUserId;
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isKeyUser() {
					return bIsKeyUser;
				},
				isPublicFlVariantEnabled() {
					return bIsPublicFlVariantEnabled;
				},
				getUserId() {
					return sUserId;
				},
				isVariantPersonalizationEnabled() {
					return true;
				}
			});
			var oVMData = this.oModel.getData()[sVMReference];
			oVMData._isEditable = true;
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.strictEqual(oVMData.variantsEditable, true, "the parameter variantsEditable is true");
			assert.strictEqual(oVMData.variants[2].rename, true, "a public view editor can renamed its own PUBLIC variant");
			assert.strictEqual(oVMData.variants[2].remove, true, "a public view editor can removed its own PUBLIC variant");
			assert.strictEqual(oVMData.variants[2].change, true, "a public view editor can changed its own PUBLIC variant");
			assert.strictEqual(
				oVMData.variants[3].rename,
				true,
				"a public view editor can renamed another users PUBLIC variant in case the user cannot be determined"
			);
			assert.strictEqual(
				oVMData.variants[3].remove,
				true,
				"a public view editor can removed another users PUBLIC variant in case the user cannot be determined"
			);
			assert.strictEqual(
				oVMData.variants[3].change,
				true,
				"a public view editor can changed another users PUBLIC variant in case the user cannot be determined"
			);

			sUserId = "OtherPerson";
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.strictEqual(oVMData.variants[3].rename, false, "a public view editor cannot renamed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].remove, false, "a public view editor cannot removed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].change, false, "a public view editor cannot changed another users PUBLIC variant");

			bIsKeyUser = true;
			bIsPublicFlVariantEnabled = false;
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.strictEqual(oVMData.variants[3].rename, true, "a key user can renamed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].remove, true, "a key user can removed another users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].change, true, "a key user can changed another users PUBLIC variant");

			bIsKeyUser = false;
			sUserId = "Me";
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.strictEqual(oVMData.variants[3].rename, false, "a end user cannot renamed its own users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].remove, false, "a end user cannot removed its own users PUBLIC variant");
			assert.strictEqual(oVMData.variants[3].change, false, "a end user cannot changed its own users PUBLIC variant");
			assert.strictEqual(oVMData.variants[4].rename, true, "a end user can renamed its own users variant");
			assert.strictEqual(oVMData.variants[4].remove, true, "a end user can removed its own users variant");
			assert.strictEqual(oVMData.variants[4].change, true, "a end user can changed its own users variant");

			Settings.getInstanceOrUndef.restore();
		});

		QUnit.test("when calling 'setModelPropertiesForControl' and variant management control has property editable=false", function(assert) {
			this.oModel.getData()[sVMReference]._isEditable = false;
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.strictEqual(
				this.oModel.getData()[sVMReference].variantsEditable,
				false,
				"the parameter variantsEditable is initially false"
			);
			this.oModel.setModelPropertiesForControl(sVMReference, true, oDummyControl);
			assert.strictEqual(
				this.oModel.getData()[sVMReference].variantsEditable,
				false,
				"the parameter variantsEditable stays false for bDesignTimeMode = true"
			);
			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.strictEqual(
				this.oModel.getData()[sVMReference].variantsEditable,
				false,
				"the parameter variantsEditable stays false for bDesignTimeMode = false"
			);
		});

		QUnit.test("when calling 'setModelPropertiesForControl' with updateVariantInURL = true", function(assert) {
			assert.expect(8);
			this.oModel.getData()[sVMReference]._isEditable = true;
			this.oModel.getData()[sVMReference].updateVariantInURL = true;
			this.oModel.getData()[sVMReference].currentVariant = "variant0";
			var iUpdateCallCount = 0;
			var oParams = {};
			oParams[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = "foo";
			var oMockedURLParser = {
				parseShellHash() {
					return {
						params: oParams
					};
				}
			};
			sandbox.stub(this.oModel, "getUShellService").withArgs("URLParsing").returns(oMockedURLParser);
			sandbox.stub(URLHandler, "update").callsFake(function(mPropertyBag) {
				var mExpectedParameters = {
					parameters: [],
					updateURL: true,
					updateHashEntry: false,
					model: this.oModel
				};

				if (iUpdateCallCount === 1) {
					// second URLHandler.update() call with designTime mode being set from true -> false
					mExpectedParameters.parameters = ["currentHash1", "currentHash2"];
				}
				assert.strictEqual(
					mPropertyBag.model._bDesignTimeMode,
					iUpdateCallCount === 0,
					"then model's _bDesignTime property was set before URLHandler.update() was called"
				);

				assert.deepEqual(mPropertyBag, mExpectedParameters, "then URLHandler.update() called with the correct parameters");
				iUpdateCallCount++;
			}.bind(this));
			sandbox.stub(URLHandler, "getStoredHashParams").returns(["currentHash1", "currentHash2"]);

			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");
			assert.strictEqual(this.oModel._bDesignTimeMode, false, "the model's _bDesignTimeMode property is initially false");

			this.oModel.setModelPropertiesForControl(sVMReference, true, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");

			this.oModel.setModelPropertiesForControl(sVMReference, false, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 1, "then URLHandler.getStoredHashParams() called once");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' for a current variant reference", function(assert) {
			var fnDone = assert.async();
			this.oModel.oData[sVMReference].currentVariant = "variant0";
			sandbox.stub(this.oModel, "updateCurrentVariant").callsFake(function(mPropertyBag) {
				assert.strictEqual(
					mPropertyBag.variantManagementReference,
					sVMReference,
					"the correct variant management reference was passed"
				);
				assert.strictEqual(
					mPropertyBag.newVariantReference,
					this.oModel.oData[sVMReference].defaultVariant,
					"the correct variant reference was passed"
				);
				return Promise.resolve().then(fnDone);
			}.bind(this));
			this.oModel.switchToDefaultForVariant("variant0");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' for a variant reference which is not the current variant", function(assert) {
			sandbox.stub(this.oModel, "updateCurrentVariant").returns(Promise.resolve());
			this.oModel.switchToDefaultForVariant("variant0");
			assert.strictEqual(this.oModel.updateCurrentVariant.callCount, 0, "then VariantModel.updateCurrentVariant not called");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' without a variant reference", function(assert) {
			var fnDone = assert.async();
			this.oModel.oData.dummy = {
				defaultVariant: "dummyDefaultVariant",
				currentVariant: "dummyCurrentVariant"
			};
			// currentVariant and defaultVariant should be different
			this.oModel.oData[sVMReference].currentVariant = "mockCurrentVariant";

			var aVariantManagementReferences = [sVMReference, "dummy"];

			sandbox.stub(this.oModel, "updateCurrentVariant").callsFake(function(mPropertyBag) {
				var iIndex = aVariantManagementReferences.indexOf(mPropertyBag.variantManagementReference);
				assert.strictEqual(
					mPropertyBag.variantManagementReference,
					aVariantManagementReferences[iIndex],
					"the correct variant management reference was passed"
				);
				assert.strictEqual(
					mPropertyBag.newVariantReference,
					this.oModel.oData[aVariantManagementReferences[iIndex]].defaultVariant,
					"the correct variant reference was passed"
				);
				aVariantManagementReferences.splice(iIndex, 1);
				if (aVariantManagementReferences.length === 0) {
					fnDone();
				}
				return Promise.resolve();
			}.bind(this));
			this.oModel.switchToDefaultForVariant();
		});

		QUnit.test("when calling 'switchToDefaultForVariantManagement' for a variant management reference", function(assert) {
			// currentVariant and defaultVariant should be different
			this.oModel.oData[sVMReference].currentVariant = "mockCurrentVariant";
			sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
			this.oModel.switchToDefaultForVariantManagement(sVMReference);
			assert.deepEqual(this.oModel.updateCurrentVariant.getCall(0).args[0], {
				variantManagementReference: sVMReference,
				newVariantReference: this.oModel.oData[sVMReference].defaultVariant
			}, "then VariantModel.updateCurrentVariant called once with the correct parameters");
		});

		QUnit.test("when calling 'getVariantManagementReference'", function(assert) {
			var mVariantManagementReference = this.oModel.getVariantManagementReference("variant1");
			assert.deepEqual(mVariantManagementReference, {
				variantIndex: 2,
				variantManagementReference: sVMReference
			}, "then the correct variant management reference is returned");
		});

		QUnit.test("when calling 'getVariantTitle'", function(assert) {
			var sPropertyValue = this.oModel.getVariantTitle("variant1", sVMReference);
			assert.strictEqual(
				sPropertyValue,
				this.oModel.oData[sVMReference].variants[2].title,
				"then the correct title value is returned"
			);
		});

		[
			{
				inputParams: {
					changeType: "setTitle",
					title: "New Title",
					// layer: Layer.CUSTOMER,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getName",
					returnValue: "New Title"
				},
				fileType: "ctrl_variant_change",
				textKey: "title"
			},
			{
				inputParams: {
					changeType: "setFavorite",
					favorite: false,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getFavorite",
					returnValue: false
				},
				expectedChangeContent: {
					favorite: false
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setVisible",
					visible: false,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getVisible",
					returnValue: false
				},
				expectedChangeContent: {
					createdByReset: false,
					visible: false
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setVisible",
					visible: false,
					variantReference: "variant1",
					adaptationId: "migration_test_id"
				},
				variantCheck: {
					functionName: "getVisible",
					returnValue: false
				},
				expectedChangeContent: {
					createdByReset: false,
					visible: false
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setExecuteOnSelect",
					executeOnSelect: true,
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getExecuteOnSelection",
					returnValue: true
				},
				expectedChangeContent: {
					executeOnSelect: true
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setContexts",
					contexts: { role: ["ADMIN"], country: ["DE"] },
					variantReference: "variant1"
				},
				variantCheck: {
					functionName: "getContexts",
					returnValue: { role: ["ADMIN"], country: ["DE"] }
				},
				expectedChangeContent: {
					contexts: { role: ["ADMIN"], country: ["DE"] }
				},
				fileType: "ctrl_variant_change"
			},
			{
				inputParams: {
					changeType: "setDefault",
					defaultVariant: "variant0",
					variantManagementReference: sVMReference
				},
				expectedChangeContent: {
					defaultVariant: "variant0"
				},
				fileType: "ctrl_variant_management_change"
			}
		].forEach(function(oTestParams) {
			QUnit.test(`when calling 'addVariantChange' for ${oTestParams.inputParams.changeType} to add a change`, function(assert) {
				oTestParams.inputParams.appComponent = oComponent;
				const oAddDirtyFlexObjectsStub = sandbox.stub(FlexObjectManager, "addDirtyFlexObjects");
				if (!oTestParams.inputParams.adaptationId) {
					sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
					sandbox.stub(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId").returns("id_12345");
				}
				var oVariantInstance = createVariant(this.oModel.oData[sVMReference].variants[2]);
				sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

				var oChange = VariantManager.addVariantChange(sVMReference, oTestParams.inputParams);
				if (oTestParams.textKey) {
					assert.strictEqual(
						oChange.getText(oTestParams.textKey),
						oTestParams.inputParams.title,
						"then the new change created with the new title"
					);
				}
				if (oTestParams.expectedChangeContent) {
					assert.deepEqual(oChange.getContent(), oTestParams.expectedChangeContent, "the change content was set");
				}
				if (oTestParams.variantCheck) {
					assert.deepEqual(
						oVariantInstance[oTestParams.variantCheck.functionName](),
						oTestParams.variantCheck.returnValue, "the variant was updated"
					);
				}
				if (oTestParams.inputParams.adaptationId) {
					assert.strictEqual(oChange.getAdaptationId(), oTestParams.inputParams.adaptationId);
				} else {
					assert.strictEqual(oChange.getAdaptationId(), "id_12345", "then the new change created with the current adaptationId");
				}
				assert.strictEqual(
					oChange.getChangeType(),
					oTestParams.inputParams.changeType,
					"then the new change created with 'setTitle' as changeType"
				);
				assert.strictEqual(
					oChange.getFileType(),
					oTestParams.fileType,
					"then the new change created with 'ctrl_variant_change' as fileType"
				);
				assert.deepEqual(
					oAddDirtyFlexObjectsStub.firstCall.args[1],
					[oChange],
					"then 'FlexController.addDirtyChange called with the newly created change"
				);
			});
		});

		QUnit.test("when calling 'deleteVariantChange'", function(assert) {
			const fnChangeStub = sandbox.stub().returns({
				convertToFileContent() {}
			});
			const mPropertyBag = { appComponent: oComponent };
			const oDeleteFlexObjectsStub = sandbox.stub(FlexObjectManager, "deleteFlexObjects");
			const oSetPropertiesStub = sandbox.stub(this.oModel, "setVariantProperties");
			VariantManager.deleteVariantChange(sVMReference, mPropertyBag, fnChangeStub());
			assert.ok(oDeleteFlexObjectsStub.calledWith({
				reference: sReference, flexObjects: [fnChangeStub()]
			}), "then deleteFlexObjects called with the passed change");
			assert.ok(oSetPropertiesStub.calledWith(sVMReference, mPropertyBag), "the correct properties were passed");
		});

		[true, false].forEach(function(bUpdateVariantInURL) {
			const sTitle = `when calling 'setVariantProperties' for 'setDefault' with different current and default variants, in UI adaptation mode ${bUpdateVariantInURL ? "with" : "without"} updateVariantInURL`;
			QUnit.test(sTitle, function(assert) {
				sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData[sVMReference].variants[2])});
				var mPropertyBag = {
					changeType: "setDefault",
					defaultVariant: "variant1",
					layer: Layer.CUSTOMER,
					variantManagementReference: sVMReference,
					appComponent: oComponent,
					change: {
						convertToFileContent() {}
					}
				};
				sandbox.stub(URLHandler, "getStoredHashParams").returns([]);
				sandbox.stub(FlexObjectManager, "addDirtyFlexObjects");
				sandbox.stub(URLHandler, "update");

				// set adaptation mode true
				this.oModel._bDesignTimeMode = true;

				// mock current variant id to make it different
				this.oModel.oData[sVMReference].currentVariant = "variantCurrent";
				this.oModel.getData()[sVMReference].updateVariantInURL = bUpdateVariantInURL;

				this.oModel.setVariantProperties(sVMReference, mPropertyBag);
				if (bUpdateVariantInURL) {
					assert.ok(URLHandler.update.calledWithExactly({
						parameters: [this.oModel.oData[sVMReference].currentVariant],
						updateURL: false,
						updateHashEntry: true,
						model: this.oModel
					}), "then the URLHandler.update() called with the current variant id as a parameter in UI adaptation mode");
				} else {
					assert.ok(URLHandler.update.notCalled, "then the URLHandler.update() not called");
				}
			});

			const sTitle1 = `when calling 'setVariantProperties' for 'setDefault' with same current and default variants, in personalization mode ${bUpdateVariantInURL ? "with" : "without"} updateVariantInURL`;
			QUnit.test(sTitle1, function(assert) {
				sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData[sVMReference].variants[2])});
				var mPropertyBag = {
					changeType: "setDefault",
					defaultVariant: "variant1",
					layer: Layer.CUSTOMER,
					variantManagementReference: sVMReference,
					appComponent: oComponent,
					change: {
						convertToFileContent() {}
					}
				};
				// current variant already exists in hash parameters
				sandbox.stub(URLHandler, "getStoredHashParams").returns([this.oModel.oData[sVMReference].currentVariant]);
				sandbox.stub(FlexObjectManager, "addDirtyFlexObjects");
				sandbox.stub(URLHandler, "update");

				// set adaptation mode false
				this.oModel._bDesignTimeMode = false;
				this.oModel.getData()[sVMReference].updateVariantInURL = bUpdateVariantInURL;

				this.oModel.setVariantProperties(sVMReference, mPropertyBag);
				if (bUpdateVariantInURL) {
					assert.ok(URLHandler.update.calledWithExactly({
						parameters: [],
						updateURL: bUpdateVariantInURL,
						updateHashEntry: true,
						model: this.oModel
					}), "then the URLHandler.update() called without the current variant id as a parameter in personalization mode");
				} else {
					assert.ok(URLHandler.update.notCalled, "then the URLHandler.update() not called");
				}
			});

			const sTitle2 = `when calling 'setVariantProperties' for 'setDefault' with different current and default variants, in personalization mode ${bUpdateVariantInURL ? "with" : "without"} updateVariantInURL`;
			QUnit.test(sTitle2, function(assert) {
				sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData[sVMReference].variants[2])});
				var mPropertyBag = {
					changeType: "setDefault",
					defaultVariant: "variant1",
					layer: Layer.CUSTOMER,
					variantManagementReference: sVMReference,
					appComponent: oComponent,
					change: {
						convertToFileContent() {}
					}
				};
				sandbox.stub(URLHandler, "getStoredHashParams").returns([]);
				sandbox.stub(FlexObjectManager, "addDirtyFlexObjects");
				sandbox.stub(URLHandler, "update");

				// set adaptation mode false
				this.oModel._bDesignTimeMode = false;

				// mock current variant id to make it different
				this.oModel.oData[sVMReference].currentVariant = "variantCurrent";
				this.oModel.getData()[sVMReference].updateVariantInURL = bUpdateVariantInURL;

				this.oModel.setVariantProperties(sVMReference, mPropertyBag);
				if (bUpdateVariantInURL) {
					assert.ok(URLHandler.update.calledWithExactly({
						parameters: [this.oModel.oData[sVMReference].currentVariant],
						updateURL: bUpdateVariantInURL,
						updateHashEntry: true,
						model: this.oModel
					}), "then the URLHandler.update() called with the current variant id as a parameter in personalization mode");
				} else {
					assert.ok(URLHandler.update.notCalled, "then the URLHandler.update() not called");
				}
			});
		});

		QUnit.test("when calling 'updateCurrentVariant' with root app component", function(assert) {
			sandbox.stub(Switcher, "switchVariant").resolves();
			var oSetVariantSwitchPromiseStub = sandbox.stub(VariantManagementState, "setVariantSwitchPromise");
			var oCallVariantSwitchListenersStub = sandbox.stub(this.oModel, "callVariantSwitchListeners");

			assert.strictEqual(
				this.oModel.oData[sVMReference].currentVariant,
				"variant1",
				"then initially current variant was correct before updating"
			);

			this.oModel.oData[sVMReference].updateVariantInURL = true;
			return this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant0",
				appComponent: this.oModel.oAppComponent
			}).then(function() {
				assert.ok(Switcher.switchVariant.calledWith({
					vmReference: sVMReference,
					currentVReference: "variant1",
					newVReference: "variant0",
					appComponent: this.oModel.oAppComponent,
					modifier: JsControlTreeModifier,
					reference: this.oModel.sFlexReference
				}), "then ChangePersistence.loadSwitchChangesMapForComponent() called with correct parameters");
				assert.ok(
					oSetVariantSwitchPromiseStub.calledBefore(Switcher.switchVariant),
					"the switch variant promise was set before switching"
				);
				assert.strictEqual(oCallVariantSwitchListenersStub.callCount, 1, "the listeners were called");
			}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' without a root app component", function(assert) {
			sandbox.stub(Switcher, "switchVariant").resolves();
			var oSetVariantSwitchPromiseStub = sandbox.stub(VariantManagementState, "setVariantSwitchPromise");

			this.oModel.oData[sVMReference].updateVariantInURL = true;
			return this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant0"
			}).then(function() {
				assert.ok(Switcher.switchVariant.calledWith({
					vmReference: sVMReference,
					currentVReference: "variant1",
					newVReference: "variant0",
					appComponent: this.oModel.oAppComponent,
					modifier: JsControlTreeModifier,
					reference: this.oModel.sFlexReference
				}), "then ChangePersistence.loadSwitchChangesMapForComponent() called with correct parameters");
				assert.ok(
					oSetVariantSwitchPromiseStub.calledBefore(Switcher.switchVariant),
					"the switch variant promise was set before switching"
				);
			}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' twice without waiting for the first one to be finished", function(assert) {
			assert.strictEqual(
				this.oModel.oData[sVMReference].currentVariant,
				"variant1",
				"then initially current variant was correct before updating"
			);

			var oSetVariantSwitchPromiseStub = sandbox.stub(VariantManagementState, "setVariantSwitchPromise");

			var oSwitchVariantStub = sandbox.stub(Switcher, "switchVariant")
			.onCall(0).returns(new Promise(function(resolve) {
				setTimeout(function() {
					resolve();
				}, 0);
			}))
			.onCall(1).resolves();

			// first call
			this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant2",
				appComponent: this.oModel.oAppComponent
			});

			// second call
			return this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant0",
				appComponent: this.oModel.oAppComponent
			})
			.then(this.oModel._oVariantSwitchPromise)
			.then(function() {
				assert.strictEqual(oSwitchVariantStub.callCount, 2, "then Switcher.switchVariant() was called twice");
				assert.strictEqual(
					oSetVariantSwitchPromiseStub.callCount,
					2,
					"then variant switch promise was set twice inside FlexController"
				);
			});
		});

		QUnit.test("when calling 'updateCurrentVariant' twice without waiting for the first one to be failed and finished", function(assert) {
			assert.expect(4);
			assert.strictEqual(
				this.oModel.oData[sVMReference].currentVariant,
				"variant1",
				"then initially current variant was correct before updating"
			);

			var oSetVariantSwitchPromiseStub = sandbox.stub(VariantManagementState, "setVariantSwitchPromise");
			var SwitchVariantStub = sandbox.stub(Switcher, "switchVariant")
			.onCall(0).callsFake(function() {
				return new Promise(function(resolve, reject) {
					setTimeout(reject, 0);
				});
			})
			.onCall(1).callsFake(function() {
				return Promise.resolve();
			});

			// first call with a Promise.reject()
			this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant2",
				appComponent: this.oModel.oAppComponent
			}).catch(function() {
				assert.ok(true, "then the first promise was rejected");
			});

			// second call with a Promise.resolve()
			return this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant0",
				appComponent: this.oModel.oAppComponent
			}).then(function() {
				assert.strictEqual(SwitchVariantStub.callCount, 2, "then Switcher.switchVariant() was called twice");
				assert.strictEqual(
					oSetVariantSwitchPromiseStub.callCount,
					2,
					"then variant switch promise was set twice inside FlexController"
				);
			});
		});

		QUnit.test("when calling '_ensureStandardVariantExists'", function(assert) {
			var oExpectedVariant = {
				id: "mockVariantManagement",
				reference: sReference,
				user: VariantUtil.DEFAULT_AUTHOR,
				variantManagementReference: "mockVariantManagement",
				variantName: oResourceBundle.getText("STANDARD_VARIANT_TITLE"),
				layer: Layer.BASE
			};

			var oAddRuntimeSteadyObjectStub = sandbox.stub(VariantManagementState, "addRuntimeSteadyObject");
			var oCreateVariantStub = sandbox.stub(FlexObjectFactory, "createFlVariant").returns("variant");
			this.oModel.setData({});
			this.oModel._ensureStandardVariantExists("mockVariantManagement");

			assert.strictEqual(oAddRuntimeSteadyObjectStub.callCount, 1, "a variant was added");
			assert.deepEqual(oAddRuntimeSteadyObjectStub.firstCall.args[2], "variant", "the standard variant was added correctly");
			assert.strictEqual(oCreateVariantStub.callCount, 1, "a variant was created");
			assert.deepEqual(oCreateVariantStub.firstCall.args[0], oExpectedVariant, "the standard variant was created correctly");
		});

		QUnit.test("when calling '_collectModelChanges'", function(assert) {
			const sVariantKey = this.oModel.getData()[sVMReference].variants[1].key;
			const oManageEvent = new Event("manage", this.oModel, {
				renamed: [{
					key: sVariantKey,
					name: "test"
				}],
				fav: [{
					key: sVariantKey,
					visible: false
				}],
				exe: [{
					key: sVariantKey,
					exe: true
				}],
				deleted: [sVariantKey],
				contexts: [{
					key: sVariantKey,
					contexts: { role: ["ADMIN"], country: ["DE"] }
				}],
				def: "variant0"
			});
			const aChanges = this.oModel._collectModelChanges(sVMReference, Layer.CUSTOMER, oManageEvent).changes;
			assert.strictEqual(aChanges.length, 6, "then 6 changes with mPropertyBags were created");
		});

		QUnit.test("when calling '_collectModelChanges' and public variant is enabled", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isPublicFlVariantEnabled() {
					return true;
				}
			});
			const sPublicVariantKey = this.oModel.getData()[sVMReference].variants[2].key;
			const sUserVariantKey = this.oModel.getData()[sVMReference].variants[4].key;
			const oManageEvent = new Event("manage", this.oModel, {
				renamed: [{
					key: sPublicVariantKey,
					name: "test"
				}],
				fav: [{
					key: sPublicVariantKey,
					visible: false
				}],
				deleted: [sPublicVariantKey, sUserVariantKey],
				def: "variant0"
			});

			const aChanges = this.oModel._collectModelChanges(sVMReference, Layer.USER, oManageEvent).changes;
			assert.strictEqual(aChanges.length, 5, "then 5 changes with mPropertyBags were created");
			aChanges.forEach(function(oChange) {
				if (oChange.variantReference === "variant3" && oChange.changeType === "setVisible") {
					assert.strictEqual(oChange.layer, Layer.USER, "keep variant USER layer in setVisible change");
				} else if (oChange.changeType === "setFavorite") {
					assert.strictEqual(oChange.layer, Layer.USER, "set USER layer in setFavorite change");
				} else if (oChange.changeType === "setDefault") {
					assert.strictEqual(oChange.layer, Layer.USER, "set USER layer in setDefault change");
				} else if (oChange.changeType === "setTitle") {
					assert.strictEqual(oChange.layer, Layer.PUBLIC, "keep variant PUBLIC layer in setTitle change");
				} else if (oChange.variantReference === "variant1" && oChange.changeType === "setVisible") {
					assert.strictEqual(oChange.layer, Layer.PUBLIC, "keep variant PUBLIC layer in setVisible change");
				}
			});
		});

		QUnit.test("when calling 'manageVariants' in Adaptation mode with changes", function(assert) {
			const oVariantManagement = new VariantManagement(sVMReference);
			const sLayer = Layer.CUSTOMER;
			const sDummyClass = "DummyClass";
			const oFakeComponentContainerPromise = {property: "fake"};
			oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			const sVariant1Key = this.oModel.oData[sVMReference].variants[1].key;
			const oManageParameters = {
				renamed: [{
					key: sVariant1Key,
					name: "test"
				}],
				fav: [{
					key: sVariant1Key,
					visible: false
				}],
				exe: [{
					key: this.oModel.oData[sVMReference].variants[2].key,
					exe: false
				}],
				deleted: [sVariant1Key],
				contexts: [{
					key: this.oModel.oData[sVMReference].variants[3].key,
					contexts: { foo: "bar" }
				}],
				def: "variant0"
			};
			const oOpenManagementDialogStub = sandbox.stub(oVariantManagement, "openManagementDialog")
			.callsFake(() => oVariantManagement.fireManage(oManageParameters));
			const oVariantInstance = createVariant(this.oModel.oData[sVMReference].variants[1]);
			sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

			this.oModel.setModelPropertiesForControl(sVMReference, true, oVariantManagement);

			return VariantManager.manageVariants(oVariantManagement, sVMReference, sLayer, sDummyClass, oFakeComponentContainerPromise)
			.then(function({ changes: aChanges, variantsToBeDeleted: aVariantsToBeDeleted }) {
				assert.strictEqual(aChanges.length, 6, "then 6 changes were returned since changes were made in the manage dialog");
				assert.deepEqual(aChanges[0], {
					variantReference: "variant0",
					changeType: "setTitle",
					title: "test",
					originalTitle: "variant A",
					layer: Layer.CUSTOMER
				}, "the setTitle change is correct");
				assert.deepEqual(aChanges[1], {
					variantReference: "variant0",
					changeType: "setFavorite",
					favorite: false,
					originalFavorite: true,
					layer: Layer.CUSTOMER
				}, "the setFavorite change is correct");
				assert.deepEqual(aChanges[2], {
					variantReference: "variant1",
					changeType: "setExecuteOnSelect",
					executeOnSelect: false,
					originalExecuteOnSelect: true,
					layer: Layer.PUBLIC
				}, "the setExecuteOnSelect change is correct");
				assert.deepEqual(aChanges[3], {
					variantReference: "variant0",
					changeType: "setVisible",
					visible: false,
					layer: Layer.CUSTOMER
				}, "the setVisible change is correct");
				assert.deepEqual(aChanges[4], {
					variantReference: "variant2",
					changeType: "setContexts",
					contexts: {foo: "bar"},
					originalContexts: {},
					layer: Layer.CUSTOMER
				}, "the setContexts change is correct");
				assert.deepEqual(aChanges[5], {
					variantManagementReference: sVMReference,
					changeType: "setDefault",
					defaultVariant: "variant0",
					originalDefaultVariant: "variant1",
					layer: Layer.CUSTOMER
				}, "the setDefault change is correct");
				assert.ok(
					oOpenManagementDialogStub.calledWith(true, sDummyClass, oFakeComponentContainerPromise),
					"then openManagementControl is called with the right parameters"
				);
				assert.deepEqual(
					aVariantsToBeDeleted,
					["variant0"],
					"then the removed variant is returned as variant to be deleted"
				);
				oVariantManagement.destroy();
			});
		});

		QUnit.test("when the VM Control fires the manage event in Personalization mode with dirty VM changes and UI Changes", function(assert) {
			const done = assert.async();
			const oVariantManagement = new VariantManagement(sVMReference);
			oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const oVariantInstance = createVariant(this.oModel.getData()[sVMReference].variants[1]);
			sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});
			const oDeleteVariantSpy = sandbox.stub(ControlVariantWriteUtils, "deleteVariant");

			const sVariantKey = this.oModel.getData()[sVMReference].variants[1].key;
			const oManageParameters = {
				renamed: [{
					key: sVariantKey,
					name: "test"
				}],
				fav: [{
					key: sVariantKey,
					visible: false
				}],
				deleted: [sVariantKey],
				def: "variant0"
			};

			const oUpdateVariantStub = sandbox.stub(this.oModel, "updateCurrentVariant");
			const oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges");
			const oAddVariantChangesSpy = sandbox.stub(VariantManager, "handleManageEvent").callsFake(async (...aArgs) => {
				await oAddVariantChangesSpy.wrappedMethod.apply(this, aArgs);

				assert.strictEqual(oUpdateVariantStub.callCount, 0, "the variant was not switched");
				const aArguments = oSaveDirtyChangesStub.lastCall.args;
				assert.strictEqual(aArguments[0], oComponent, "the app component was passed");
				assert.strictEqual(aArguments[1], false, "the second parameter is false");
				// Changes must be passed in this case to avoid that UI changes are read from the FlexState and persisted as well
				assert.deepEqual(
					aArguments[2].length,
					4,
					"an array with 4 changes was passed instead of taking the changes directly from the FlexState"
				);
				assert.ok(oDeleteVariantSpy.notCalled, "for the CUSTOMER layer variant, deleteVariant is not called");
				oVariantManagement.destroy();
				done();
			});

			oVariantManagement.fireManage(oManageParameters, {variantManagementReference: sVMReference});
		});

		QUnit.test("when the VM Control fires the manage event in Personalization mode with deleting the current variant", function(assert) {
			const done = assert.async();
			const oVariantManagement = new VariantManagement(sVMReference);
			oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const oVariantInstance = createVariant(this.oModel.getData()[sVMReference].variants[2]);
			sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

			this.oModel.getData()[sVMReference].variants[2].visible = false;
			const oManageParameters = {
				deleted: [this.oModel.getData()[sVMReference].variants[2].key]
			};

			const oUpdateVariantStub = sandbox.stub(this.oModel, "updateCurrentVariant");
			const oAddVariantChangesSpy = sandbox.spy(VariantManager, "addVariantChanges");
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").callsFake((oAppComponent, bSkipUpdateCache, aChanges) => {
				assert.strictEqual(oUpdateVariantStub.callCount, 1, "the variant was switched");
				assert.deepEqual(oUpdateVariantStub.lastCall.args[0], {
					variantManagementReference: sVMReference,
					newVariantReference: sVMReference
				}, "the correct variant was switched to");
				assert.strictEqual(oAppComponent, oComponent, "the app component was passed");
				assert.strictEqual(bSkipUpdateCache, false, "the second parameter is false");
				assert.strictEqual(oAddVariantChangesSpy.lastCall.args[1].length, 1, "1 changes were added");
				assert.deepEqual(aChanges.length, 1, "an array with 1 change was passed");
				oVariantManagement.destroy();
				done();
			});

			oVariantManagement.fireManage(oManageParameters, {variantManagementReference: sVMReference});
		});

		QUnit.test("when the VM Control fires the manage event in Personalization mode deleting a USER and a PUBLIC layer variant", function(assert) {
			const fnDone = assert.async();
			const oVariantManagement = new VariantManagement(sVMReference);
			oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const oVariantInstance = createVariant(this.oModel.getData()[sVMReference].variants[4]);
			sandbox.stub(this.oModel, "getVariant").returns({ instance: oVariantInstance });
			const oDeleteVariantSpy = sandbox.spy(ControlVariantWriteUtils, "deleteVariant");

			const oManageParameters = {
				deleted: ["variant2", "variant3"]
			};

			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").callsFake((oAppComponent, bSkipUpdateCache, aChanges) => {
				assert.ok(
					oDeleteVariantSpy.calledWith(sReference, sVMReference, "variant3"),
					"then the variant and related objects were deleted"
				);
				assert.notOk(
					oDeleteVariantSpy.calledWith(sReference, sVMReference, "variant2"),
					"then the PUBLIC variant is only hidden and not deleted"
				);

				assert.strictEqual(
					aChanges.length,
					1,
					"then only one change is saved since the rest is dirty and directly removed from FlexState"
				);
				assert.strictEqual(
					aChanges[0].getSelector().id,
					"variant2",
					"then only the PUBLIC variant is hidden via setVisible"
				);

				oVariantManagement.destroy();
				fnDone();
			});

			oVariantManagement.fireManage(oManageParameters, { variantManagementReference: sVMReference });
		});

		QUnit.test("when calling '_initializeManageVariantsEvents'", function(assert) {
			assert.notOk(this.oModel.fnManageClick, "the function 'this.fnManageClick' is not available before");
			assert.notOk(this.oModel.fnManageClickRta, "the function 'this.fnManageClickRta' is not available before");
			this.oModel._initializeManageVariantsEvents();
			assert.ok(this.oModel.fnManageClick, "the function 'this.fnManageClick' is available afterwards");
			assert.ok(this.oModel.fnManageClick, "the function 'this.fnManageClick' is available afterwards");
		});

		QUnit.test("when calling '_getDirtyChangesFromVariantChanges'", function(assert) {
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = FlexObjectFactory.createFromFileContent({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = FlexObjectFactory.createFromFileContent({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});
			oChange2.setSavedToVariant(true);
			var aControlChanges = [oChange1, oChange2, oChange3];

			sandbox.stub(FlexObjectState, "getDirtyFlexObjects").returns(aControlChanges);

			var aDirtyChanges = this.oModel._getDirtyChangesFromVariantChanges(aControlChanges);
			assert.strictEqual(aDirtyChanges.length, 2, "only two of the given changes are returned as dirty by the model");
			assert.strictEqual(aDirtyChanges[0].getId(), "change1", "change1 is dirty");
			assert.strictEqual(aDirtyChanges[1].getId(), "change3", "change3 is dirty");
		});

		QUnit.test("when calling '_getVariantTitleCount' with a title having 2 occurrences", function(assert) {
			this.oModel.oData[sVMReference].variants.push({
				title: "SampleTitle Copy(5)",
				visible: true
			}, {
				title: "SampleTitle Copy(5)",
				visible: true
			});
			assert.strictEqual(this.oModel._getVariantTitleCount("SampleTitle Copy(5)", sVMReference), 2, "then 2 occurrences returned");
			this.oModel.oData[sVMReference].variants.splice(3, 1);
		});

		QUnit.test("when calling '_getVariantTitleCount' with a title having 4 occurrences with different cases of characters", function(assert) {
			this.oModel.oData[sVMReference].variants.push({
				title: "Test",
				visible: true
			}, {
				title: "TEST",
				visible: true
			}, {
				title: "tesT",
				visible: true
			}, {
				title: "test",
				visible: true
			});
			assert.strictEqual(this.oModel._getVariantTitleCount("TeSt", sVMReference), 4, "then 4 occurrences returned");
			this.oModel.oData[sVMReference].variants.splice(3, 4);
		});

		QUnit.test("when calling 'getVariant' without a variant management reference", function(assert) {
			assert.deepEqual(
				this.oModel.getVariant("variant0"),
				this.oModel.oData[sVMReference].variants[1],
				"the default Variant is returned"
			);
		});

		QUnit.test("when 'getCurrentControlVariantIds' is called to get all current variant references", function(assert) {
			var oData = {
				variantManagementRef1: {
					currentVariant: "currentVariantRef1"
				},
				variantManagementRef2: {
					currentVariant: "currentVariantRef2"
				}
			};
			this.oModel.setData(oData);
			assert.deepEqual(
				this.oModel.getCurrentControlVariantIds(),
				[oData.variantManagementRef1.currentVariant, oData.variantManagementRef2.currentVariant],
				"then the function returns an array current variant references"
			);
		});

		QUnit.test("when 'getCurrentControlVariantIds' is called with no variant model data", function(assert) {
			this.oModel.setData({});
			assert.deepEqual(this.oModel.getCurrentControlVariantIds(), [], "then the function returns an empty array");
		});
	});

	QUnit.module("_duplicateVariant", {
		beforeEach() {
			oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sReference);
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("foo");
			this.oModel = new VariantModel({}, {
				flexController: {},
				appComponent: {getId() {}}
			});

			var oChange0 = FlexObjectFactory.createFromFileContent({
				fileName: "change0",
				adaptationId: "id_12345",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.CUSTOMER,
				support: {},
				reference: "test",
				packageName: "MockPackageName"
			});
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.USER,
				reference: "test"
			});
			this.oSourceVariant = {
				instance: createVariant({
					fileName: "variant0",
					title: "foo",
					adaptationId: "id_12345",
					variantManagementReference: sVMReference,
					variantReference: "variantReference",
					contexts: {
						role: ["testRole"]
					},
					layer: Layer.CUSTOMER
				}),
				controlChanges: [oChange0, oChange1],
				variantChanges: {}
			};

			sandbox.stub(this.oModel, "getVariant").returns(this.oSourceVariant);
			sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([oChange0, oChange1]);
			sandbox.stub(VariantManagementState, "clearRuntimeSteadyObjects");

			return this.oModel.initialize();
		},
		afterEach() {
			this.oModel.destroy();
			oComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_duplicateVariant' on the same layer", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: sVMReference,
				layer: Layer.CUSTOMER,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.CUSTOMER, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "variantReference", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 2, "both changes were copied");
			assert.strictEqual(
				oDuplicateVariant.controlChanges[0].getSupportInformation().sourceChangeFileName,
				"change0",
				"the sourceChangeFileName is correct"
			);
			assert.strictEqual(
				oDuplicateVariant.controlChanges[1].getSupportInformation().sourceChangeFileName,
				"change1",
				"the sourceChangeFileName is correct"
			);
			assert.notEqual(oDuplicateVariant.controlChanges[0].getId(), "change0", "the fileName is different from the source");
			assert.notEqual(oDuplicateVariant.controlChanges[1].getId(), "change1", "the fileName is different from the source");
		});

		QUnit.test("when calling '_duplicateVariant' from USER layer referencing a CUSTOMER layer variant", function(assert) {
			var oFlexObjectFactorySpy = sandbox.spy(FlexObjectFactory, "createFromFileContent");
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: sVMReference,
				layer: Layer.USER,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.notOk(oFlexObjectFactorySpy.getCall(0).args[0].adaptationId, "the properties for the change don't contain adaptationId");
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.USER, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "variant0", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 1, "one change was copied");
			assert.strictEqual(
				oDuplicateVariant.controlChanges[0].getSupportInformation().sourceChangeFileName,
				"change1",
				"the sourceChangeFileName is correct"
			);
		});

		QUnit.test("when calling '_duplicateVariant' from PUBLIC layer referencing a USER layer variant", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: sVMReference,
				layer: Layer.PUBLIC,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};
			this.oSourceVariant.instance.setLayer(Layer.USER);

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.PUBLIC, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "variantReference", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 1, "one change was copied");
			assert.strictEqual(
				oDuplicateVariant.controlChanges[0].getSupportInformation().sourceChangeFileName,
				"change1",
				"the sourceChangeFileName is correct"
			);
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getLayer(), Layer.PUBLIC, "the layer is correct");
		});

		QUnit.test("when calling '_duplicateVariant' from USER layer referencing a PUBLIC layer variant", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: sVMReference,
				layer: Layer.USER,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};
			this.oSourceVariant.instance.setLayer(Layer.PUBLIC);

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.USER, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "variant0", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 1, "one change was copied");
			assert.strictEqual(
				oDuplicateVariant.controlChanges[0].getSupportInformation().sourceChangeFileName,
				"change1",
				"the sourceChangeFileName is correct"
			);
		});

		QUnit.test("when calling '_duplicateVariant' from PUBLIC layer referencing a USER layer variant, that references a PUBLIC layer variant", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: sVMReference,
				layer: Layer.PUBLIC,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};
			this.oSourceVariant.instance.setLayer(Layer.USER);
			this.oModel.getVariant.restore();
			sandbox.stub(this.oModel, "getVariant").callsFake(function(sSourceVariantReference) {
				if (sSourceVariantReference === "variant0") {
					return this.oSourceVariant;
				}
				return {
					instance: {
						getLayer() {return Layer.PUBLIC;},
						getVariantReference() {return "publicVariantReference";}
					}
				};
			}.bind(this));

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.PUBLIC, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(
				oDuplicateVariant.instance.getVariantReference(),
				"publicVariantReference",
				"the variantReference is correct"
			);
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 1, "one change was copied");
			assert.strictEqual(
				oDuplicateVariant.controlChanges[0].getSupportInformation().sourceChangeFileName,
				"change1",
				"the sourceChangeFileName is correct"
			);
		});
	});

	QUnit.module("Given a VariantModel with no data and a VariantManagement control", {
		async beforeEach() {
			oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sReference);
			await FlexState.initialize({
				reference: sReference,
				componentId: sReference,
				componentData: {},
				manifest: {}
			});
			this.sVMReference = "varMgmtRef1";
			this.oVariantManagement = new VariantManagement(this.sVMReference);

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			this.oFlexController = FlexControllerFactory.create(sReference);
			this.fnApplyChangesStub = sandbox.stub(this.oFlexController, "saveSequenceOfDirtyChanges").resolves();
			this.oRegisterControlStub = sandbox.stub(URLHandler, "registerControl");
			sandbox.stub(VariantManagementState, "getInitialUIChanges").returns([FlexObjectFactory.createUIChange({
				changeType: "foo",
				selector: {id: this.sVMReference}
			})]);
			sandbox.stub(FlexObjectState, "waitForFlexObjectsToBeApplied").resolves();

			this.oModel = new VariantModel({}, {
				flexController: this.oFlexController,
				appComponent: oComponent
			});
			oComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			await this.oModel.initialize();
		},
		afterEach() {
			sandbox.restore();
			this.oModel.destroy();
			oComponent.destroy();
			this.oVariantManagement.destroy();
			FlexObjectManager.removeDirtyFlexObjects({ reference: sReference });
			FlexControllerFactory._instanceCache = {};
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when calling invalidateMap", function(assert) {
			var oInvalidationStub = sandbox.stub(this.oModel.oDataSelector, "checkUpdate");
			this.oModel.invalidateMap();
			assert.strictEqual(oInvalidationStub.callCount, 1, "the DataSelector was invalidated");
		});

		QUnit.test("when calling 'setModel' of VariantManagement control", async function(assert) {
			var fnRegisterToModelSpy = sandbox.spy(this.oModel, "registerToModel");
			sandbox.stub(this.oModel, "getVariantManagementReferenceForControl").returns(this.sVMReference);
			this.oVariantManagement.setExecuteOnSelectionForStandardDefault(true);
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			assert.ok(
				fnRegisterToModelSpy.calledOnce,
				"then registerToModel called once, when VariantManagement control setModel is called"
			);
			assert.ok(
				fnRegisterToModelSpy.calledWith(this.oVariantManagement),
				"then registerToModel called with VariantManagement control"
			);
			assert.ok(this.oModel.oData[this.sVMReference].init, "the init flag is set");
			assert.strictEqual(
				this.oModel.oData[this.sVMReference].showExecuteOnSelection,
				false,
				"showExecuteOnSelection is set to false"
			);
			await this.oModel._oVariantSwitchPromise;
			assert.strictEqual(
				FlexObjectState.waitForFlexObjectsToBeApplied.callCount, 1,
				"the initial changes promise was added to the variant switch promise"
			);
		});

		QUnit.test("when creating a new variant based on a faked standard variant, and the Model gets destroyed", async function(assert) {
			const oAddRuntimeOnlySpy = sandbox.spy(VariantManagementState, "addRuntimeOnlyFlexObjects");
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const oVariant = FlexObjectFactory.createFlVariant({
				id: "newVariant",
				layer: Layer.USER,
				variantReference: this.sVMReference,
				variantManagementReference: this.sVMReference
			});
			FlexObjectManager.addDirtyFlexObjects(sReference, [oVariant]);
			this.oModel.destroy();
			assert.strictEqual(oAddRuntimeOnlySpy.callCount, 1, "then the fake Standard variant is added to the runtimeOnlyData");

			this.oModel = new VariantModel({}, {
				flexController: this.oFlexController,
				appComponent: oComponent
			});

			await this.oModel.initialize();
			assert.strictEqual(this.oModel.oData[this.sVMReference].variants.length, 2, "then the fake and the new variant are available");
		});

		QUnit.test("when creating a new UIChange based on a faked standard variant, and the Model gets destroyed", async function(assert) {
			const oAddRuntimeOnlySpy = sandbox.spy(VariantManagementState, "addRuntimeOnlyFlexObjects");
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const oUIChange = FlexObjectFactory.createUIChange({
				id: "newUIChange",
				layer: Layer.CUSTOMER,
				variantReference: this.sVMReference
			});
			FlexObjectManager.addDirtyFlexObjects(this.oModel.sFlexReference, [oUIChange]);
			this.oModel.destroy();
			const oFlexObjects = FlexState.getFlexObjectsDataSelector().get({ reference: sReference });
			assert.strictEqual(oFlexObjects[0].getId(), "newUIChange", "then the change was not removed from the flex state");
			assert.strictEqual(oAddRuntimeOnlySpy.callCount, 1, "then the fake Standard variant is added to the runtimeOnlyData");

			this.oModel = new VariantModel({}, {
				flexController: this.oFlexController,
				appComponent: oComponent
			});

			await this.oModel.initialize();
			assert.strictEqual(this.oModel.oData[this.sVMReference].variants.length, 1, "then the fake variant is available");
			assert.strictEqual(this.oModel.oData[this.sVMReference].variants[0].controlChanges.length, 1, "then the UIChange is available");
		});

		QUnit.test("when waitForVMControlInit is called before the control is initialized", function(assert) {
			var fnDone = assert.async();
			var oData = {
				varMgmtRef1: {
					defaultVariant: "variant1",
					variants: [
						{
							author: VariantUtil.DEFAULT_AUTHOR,
							key: this.sVMReference,
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true,
							executeOnSelect: false
						}
					]
				}
			};
			this.oModel.setData(oData);
			this.oModel.waitForVMControlInit(this.sVMReference).then(function() {
				assert.ok(true, "the function resolves");
				fnDone();
			});
			this.oModel.registerToModel(this.oVariantManagement);
		});

		QUnit.test("when waitForVMControlInit is called after the control is initialized", function(assert) {
			var oData = {
				varMgmtRef1: {
					defaultVariant: "variant1",
					variants: [
						{
							author: VariantUtil.DEFAULT_AUTHOR,
							key: this.sVMReference,
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true,
							executeOnSelect: false
						}
					]
				}
			};
			this.oModel.setData(oData);
			this.oModel.registerToModel(this.oVariantManagement);
			return this.oModel.waitForVMControlInit(this.sVMReference).then(function() {
				assert.ok(true, "the function resolves");
			});
		});

		QUnit.test("when waitForVMControlInit is called before the control is initialized and with no variant data yet", function(assert) {
			var oStandardVariant = {
				currentVariant: this.sVMReference,
				defaultVariant: this.sVMReference,
				showExecuteOnSelection: false,
				init: true,
				modified: false,
				showFavorites: true,
				updateVariantInURL: false,
				variantsEditable: true,
				_isEditable: true,
				variants: [{
					change: false,
					remove: false,
					rename: false,
					key: this.sVMReference,
					title: "Standard",
					favorite: true,
					visible: true,
					executeOnSelect: false,
					author: VariantUtil.DEFAULT_AUTHOR,
					sharing: "public",
					contexts: {}
				}]
			};
			var oReturnPromise = this.oModel.waitForVMControlInit(this.sVMReference).then(function() {
				assert.ok(this.oModel.oData[this.sVMReference].variants, "the variant structure was added");
				assert.strictEqual(
					this.oModel.oData[this.sVMReference].variants[0].key,
					this.sVMReference,
					oStandardVariant,
					"the standard variant is properly set"
				);
			}.bind(this));
			this.oModel.registerToModel(this.oVariantManagement);

			return oReturnPromise;
		});

		QUnit.test("when variant management controls are initialized with with 'updateVariantInURL' property set and default (false)", function(assert) {
			this.oRegisterControlStub.resetHistory();
			var oVariantManagementWithURLUpdate = new VariantManagement("varMgmtRef2", {updateVariantInURL: true});
			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			oVariantManagementWithURLUpdate.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			assert.strictEqual(this.oRegisterControlStub.callCount, 1, "then URLHandler.attachHandlers was called once");
			assert.deepEqual(this.oRegisterControlStub.getCall(0).args[0], {
				vmReference: oVariantManagementWithURLUpdate.getId(),
				updateURL: true,
				model: this.oModel
			}, "then URLHandler.attachHandlers was called once for a control without URL update");
			oVariantManagementWithURLUpdate.destroy();
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control where app component couldn't be retrieved", function(assert) {
			sandbox.stub(oComponent, "getLocalId").returns(undefined);
			assert.strictEqual(
				this.oModel.getVariantManagementReferenceForControl(this.oVariantManagement),
				this.oVariantManagement.getId(),
				"then control's id is returned"
			);
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control with no app component prefix", function(assert) {
			assert.strictEqual(this.oModel.getVariantManagementReferenceForControl({
				getId() {
					return "mockControl";
				}
			}), "mockControl", "then control's id is returned");
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control with an app component prefix", function(assert) {
			assert.strictEqual(
				this.oModel.getVariantManagementReferenceForControl(this.oVariantManagement),
				this.sVMReference,
				"then the local id of the control is returned"
			);
		});

		QUnit.test("when 'save' event event is triggered from a variant management control for a new variant", function(assert) {
			var fnDone = assert.async();

			sandbox.stub(this.oModel, "callVariantSwitchListeners").callsFake(function(sVmReference, sNewVMReference) {
				assert.strictEqual(
					this.oVariantManagement.getCurrentVariantKey(),
					sNewVMReference,
					"then when the listeners are called the VM control model is up-to-date"
				);
				fnDone();
			}.bind(this));

			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			this.oVariantManagement.fireSave({
				name: "variant created title",
				overwrite: false,
				def: false
			});
		});

		function createTranslationVariants(sTitleBinding) {
			const aVariants = [createVariant({
				author: VariantUtil.DEFAULT_AUTHOR,
				key: this.sVMReference,
				layer: Layer.VENDOR,
				variantManagementReference: this.sVMReference,
				title: "Default",
				favorite: true,
				visible: true,
				executeOnSelect: false
			}), createVariant({
				author: VariantUtil.DEFAULT_AUTHOR,
				key: "translatedVariant",
				layer: Layer.VENDOR,
				title: sTitleBinding, // key chosen arbitrarily
				variantManagementReference: this.sVMReference,
				favorite: true,
				visible: true,
				executeOnSelect: false
			})];
			aVariants.forEach((oVariant) => oVariant.setState(States.LifecycleState.PERSISTED));
			return aVariants;
		}

		QUnit.test("when there is a variant with a resource model key as its title", function(assert) {
			var oResourceModel = new ResourceModel({bundleUrl: oResourceBundle.oUrlInfo.url});
			this.oVariantManagement.setModel(oResourceModel, "i18n");
			var sTitleBinding = "{i18n>VARIANT_MANAGEMENT_AUTHOR}";
			stubFlexObjectsSelector(createTranslationVariants.call(this, sTitleBinding));
			this.oModel.registerToModel(this.oVariantManagement);
			return this.oModel.waitForVMControlInit(this.sVMReference).then(function() {
				assert.strictEqual(
					this.oModel.getData()[this.sVMReference].variants[1].title,
					oResourceBundle.getText("VARIANT_MANAGEMENT_AUTHOR"),
					"then the text is resolved"
				);
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"and no dirty change was added for the title resolution"
				);
			}.bind(this));
		});

		QUnit.test("when there is a variant with a resource model key with dots as its title", function(assert) {
			var oResourceModel = new ResourceModel({bundleUrl: oResourceBundle.oUrlInfo.url});
			oResourceModel._oResourceBundle.aPropertyFiles[0].mProperties["test.with.dots"] = "Text From Key With Dots";
			this.oVariantManagement.setModel(oResourceModel, "i18n");
			var sTitleBinding = "{i18n>test.with.dots}";
			stubFlexObjectsSelector(createTranslationVariants.call(this, sTitleBinding));
			this.oModel.registerToModel(this.oVariantManagement);
			return this.oModel.waitForVMControlInit(this.sVMReference).then(function() {
				assert.strictEqual(
					this.oModel.getData()[this.sVMReference].variants[1].title,
					"Text From Key With Dots",
					"then the text is resolved"
				);
			}.bind(this));
		});

		QUnit.test("when there is a variant with a resource model key as its title but the model was not yet set", function(assert) {
			var fnDone = assert.async();
			var oResourceModel = new ResourceModel({bundleUrl: oResourceBundle.oUrlInfo.url});
			this.oVariantManagement.setModel(oResourceModel, "i18n");
			var sTitleBinding = "{anotherResourceModel>VARIANT_MANAGEMENT_AUTHOR}";
			stubFlexObjectsSelector(createTranslationVariants.call(this, sTitleBinding));
			this.oModel.registerToModel(this.oVariantManagement);
			this.oVariantManagement.attachModelContextChange(function() {
				assert.strictEqual(
					this.oModel.getData()[this.sVMReference].variants[1].title,
					oResourceBundle.getText("VARIANT_MANAGEMENT_AUTHOR"),
					"when the model is set, the text gets resolved"
				);
				fnDone();
			}.bind(this));
			return this.oModel.waitForVMControlInit(this.sVMReference).then(function() {
				assert.strictEqual(
					this.oModel.getData()[this.sVMReference].variants[1].title,
					"{anotherResourceModel>VARIANT_MANAGEMENT_AUTHOR}",
					"before the model is set, the string is not resolved yet"
				);
				this.oVariantManagement.setModel(oResourceModel, "anotherResourceModel");
			}.bind(this));
		});
	});

	QUnit.module("Given a variant management control in personalization mode", {
		beforeEach() {
			return FlexState.initialize({
				reference: "MockController",
				componentId: "testComponent",
				componentData: {},
				manifest: {}
			}).then(async function() {
				const oView = await XMLView.create({
					id: "testComponent---mockview",
					viewName: "fl.test.VariantManagementTestApp"
				});
				var MockComponent = UIComponent.extend("MockController", {
					metadata: {
						manifest: {
							"sap.app": {
								applicationVersion: {
									version: "1.2.3"
								},
								id: "MockController"
							}
						}
					},
					createContent() {
						var oApp = new App(oView.createId("mockapp"));
						oApp.addPage(oView);
						return oApp;
					}
				});

				this.oComp = new MockComponent({id: "testComponent"});
				this.oView = oView;
				this.oFlexController = FlexControllerFactory.createForControl(this.oComp);
				this.oVariantModel = new VariantModel({}, {
					flexController: this.oFlexController,
					appComponent: this.oComp
				});
				return this.oVariantModel.initialize();
			}.bind(this)).then(async function() {
				this.oComp.setModel(this.oVariantModel, ControlVariantApplyAPI.getVariantModelName());
				this.sVMReference = "mockview--VariantManagement1";

				var oData = this.oVariantModel.getData();
				oData[this.sVMReference].defaultVariant = "variant1";
				oData[this.sVMReference].currentVariant = "variant1";
				this.oVariant1 = {
					author: "Me",
					key: "variant1",
					layer: Layer.CUSTOMER,
					title: "variant A",
					favorite: true,
					visible: true,
					executeOnSelect: false
				};
				this.oVariant2 = {
					author: "Me",
					key: "variant2",
					layer: Layer.CUSTOMER,
					title: "variant B",
					favorite: true,
					visible: true,
					executeOnSelect: false
				};
				oData[this.sVMReference].variants.push(this.oVariant1);
				oData[this.sVMReference].variants.push(this.oVariant2);
				this.oUpdateCurrentVariantStub = sandbox.stub(this.oVariantModel, "updateCurrentVariant").resolves();
				sandbox.stub(VariantManagementState, "getCurrentVariantReference").returns("variant1");
				sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([]);
				sandbox.stub(FlexObjectManager, "deleteFlexObjects");
				this.oGetDirtyFlexObjectsStub = sandbox.stub(FlexObjectState, "getDirtyFlexObjects");
				sandbox.stub(Switcher, "switchVariant").resolves();
				sandbox.stub(Reverter, "revertMultipleChanges").resolves();

				this.oVariantModel.setData(oData);
				this.oVariantModel.checkUpdate(true);

				this.oCompContainer = new ComponentContainer("ComponentContainer", {
					component: this.oComp
				}).placeAt("qunit-fixture");
				await nextUIUpdate();
			}.bind(this));
		},
		afterEach() {
			this.oCompContainer.destroy();
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		function clickOnVMControl(oVMControl) {
			// to create variant list control - inside variant management control's popover
			oVMControl._getEmbeddedVM().getDomRef().click();
		}

		function makeSelection(oVMControl, iIndex) {
			var oVariantListControl = oVMControl._getEmbeddedVM().oVariantPopOver.getContent()[0].getContent()[0];
			var oSelectedItem = oVariantListControl.getItems()[iIndex];
			oVariantListControl.fireItemPress({
				item: oSelectedItem
			});
		}

		function selectTargetVariant(oVMControl, iIndex) {
			// variant management control popover
			if (oVMControl._getEmbeddedVM().oVariantPopOver && oVMControl._getEmbeddedVM().oVariantPopOver.isOpen()) {
				makeSelection(oVMControl, iIndex);
			} else {
				oVMControl._getEmbeddedVM().oVariantPopOver.attachEventOnce("afterOpen", makeSelection.bind(null, oVMControl, iIndex));
			}
		}

		function waitForInitialCallbackCall(fnCallbackStub, oExpectedVariant, assert) {
			return new Promise(function(resolve) {
				fnCallbackStub.callsFake(function(oNewVariant) {
					assert.ok(true, "the callback was called once");
					assert.deepEqual(oNewVariant, oExpectedVariant, "the correct variant was passed");
					resolve();
				});
			});
		}

		QUnit.test("when the control is switched to a new variant with no unsaved personalization changes", function(assert) {
			var fnDone = assert.async();
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "callVariantSwitchListeners");
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = Element.getElementById(sVMControlId);

			oVMControl.attachEventOnce("select", function(oEvent) {
				var sSelectedVariantReference = oEvent.getParameters().key;
				this.oVariantModel.updateCurrentVariant.onFirstCall().callsFake(function(mPropertyBag) {
					// update call will make variant model busy, which will be resolved after the whole update process has taken place
					this.oVariantModel._oVariantSwitchPromise.then(function() {
						assert.strictEqual(oCallListenerStub.callCount, 0, "the listeners are not notified again");
						assert.deepEqual(mPropertyBag, {
							variantManagementReference: sSelectedVariantReference,
							newVariantReference: this.sVMReference,
							appComponent: this.oComp,
							internallyCalled: true
						}, "then variant switch was performed");
						assert.ok(Reverter.revertMultipleChanges.notCalled, "then variant was not reverted explicitly");
						assert.ok(FlexObjectManager.deleteFlexObjects.notCalled, "then no dirty changes were deleted");
						fnDone();
					}.bind(this));
					return Promise.resolve();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 0);
		});

		QUnit.test("when 'attachVariantApplied' is called with callAfterInitialVariant=false", function(assert) {
			var sVMControlId = "testComponent---mockview--VariantManagement1";
			var sVMReference1 = "mockview--VariantManagement1";
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			var fnCallback3 = sandbox.stub();
			var oErrorStub = sandbox.stub(Log, "error");
			var oUpdateStub = sandbox.stub(this.oVariantModel, "checkUpdate");

			return Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: false
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("hbox2InnerButton1"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.strictEqual(oErrorStub.callCount, 1, "an error was logged");
				assert.strictEqual(oUpdateStub.callCount, 1, "the update function was called");
				assert.strictEqual(this.oVariantModel.oData[sVMReference1].showExecuteOnSelection, true, "the parameter is set to true");
				assert.strictEqual(fnCallback1.callCount, 0, "the callback was not called yet");
				assert.strictEqual(fnCallback2.callCount, 0, "the callback was not called yet");

				this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant1");
				assert.strictEqual(fnCallback1.callCount, 1, "the callback was called once");
				assert.deepEqual(fnCallback1.lastCall.args[0], this.oVariant1, "the new variant is passed as parameter");
				assert.strictEqual(fnCallback2.callCount, 0, "the callback was not called");

				this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant1", fnCallback3, "scenario");
				assert.strictEqual(fnCallback3.callCount, 1, "the callback was called once");
				assert.strictEqual(fnCallback3.lastCall.args[0].key, this.oVariant1.key, "the new variant is passed as parameter");
				assert.strictEqual(fnCallback3.lastCall.args[0].createScenario, "scenario", "the scenario was saved in the variant");
				assert.strictEqual(fnCallback1.callCount, 1, "the callback was not called");
				assert.strictEqual(fnCallback2.callCount, 0, "the callback was not called");

				return this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				});
			}.bind(this))
			.then(function() {
				this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant2");
				assert.strictEqual(fnCallback1.callCount, 1, "the callback was not called again");
				assert.strictEqual(fnCallback2.callCount, 1, "the callback was called once");
				assert.deepEqual(fnCallback2.lastCall.args[0], this.oVariant2, "the new variant is passed as parameter");

				return this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("ObjectPageSection1"),
					callback: fnCallback1,
					callAfterInitialVariant: false
				});
			}.bind(this))
			.then(function() {
				this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant2");
				assert.strictEqual(fnCallback1.callCount, 2, "the callback was called again");
				assert.strictEqual(fnCallback2.callCount, 2, "the callback was called again");

				this.oVariantModel.detachVariantApplied(sVMControlId, this.oView.createId("MainForm"));
				this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant2");
				assert.strictEqual(fnCallback1.callCount, 3, "the callback was called again");
				assert.strictEqual(fnCallback2.callCount, 2, "the callback was not called again");

				this.oVariantModel.detachVariantApplied(sVMControlId, this.oView.createId("ObjectPageSection1"));
				this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant2");
				assert.strictEqual(fnCallback1.callCount, 3, "the callback was not called again");
				assert.strictEqual(fnCallback2.callCount, 2, "the callback was not called again");
			}.bind(this));
		});

		QUnit.test("when 'attachVariantApplied' is called with the control not being rendered yet", function(assert) {
			var sVMControlId = "testComponent---mockview--VariantManagement1";
			var sVMReference1 = "mockview--VariantManagement1";
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			var fnCallback3 = sandbox.stub();
			var oNewControl1 = new Button("newControl1", {text: "foo"});
			var oNewControl2 = new Button("newControl2", {text: "foo"});
			var oNewControl3 = new Button("newControl3", {text: "foo"});

			var oReturnPromise = Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: oNewControl1,
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: oNewControl2,
					callback: fnCallback2,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: oNewControl3,
					callback: fnCallback3,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.strictEqual(fnCallback3.callCount, 0, "the callback was not called yet");

				this.oVariantModel.callVariantSwitchListeners(sVMReference1, "variant1");
				assert.strictEqual(fnCallback1.callCount, 2, "the callback was called again");
				assert.strictEqual(fnCallback2.callCount, 1, "the callback was not called again");
				assert.strictEqual(fnCallback3.callCount, 1, "the callback was called once");
			}.bind(this));

			Promise.all([
				waitForInitialCallbackCall(fnCallback1, this.oVariant1, assert),
				waitForInitialCallbackCall(fnCallback2, this.oVariant1, assert)
			]).then(function() {
				this.oView.byId("MainForm").addContent(oNewControl1);
				this.oView.byId("hbox1").addItem(oNewControl2);
				this.oView.byId("MainForm").addContent(oNewControl3);
			}.bind(this));

			return oReturnPromise;
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard being default and no flex change for apply automatically", function(assert) {
			var sVMReference1 = "mockview--VariantManagement2";
			var sVMControlId = `testComponent---${sVMReference1}`;
			this.oView.byId(sVMControlId).setExecuteOnSelectionForStandardDefault(true);
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns({});
			VariantManagementState.getCurrentVariantReference.restore();

			return Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.strictEqual(fnCallback1.callCount, 1, "the callback was called");
				assert.strictEqual(fnCallback1.lastCall.args[0].executeOnSelect, true, "the flag to apply automatically is set");
				assert.strictEqual(fnCallback2.callCount, 1, "the callback was called");
				assert.strictEqual(fnCallback2.lastCall.args[0].executeOnSelect, true, "the flag to apply automatically is set");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard being default, no flex change for apply automatically and a different current variant", function(assert) {
			var sVMReference1 = "mockview--VariantManagement2";
			var sVMControlId = `testComponent---${sVMReference1}`;
			this.oView.byId(sVMControlId).setExecuteOnSelectionForStandardDefault(true);
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns({});
			VariantManagementState.getCurrentVariantReference.restore();
			this.oVariantModel.getData()[sVMReference1].currentVariant = "variant2";

			return this.oVariantModel.attachVariantApplied({
				vmControlId: sVMControlId,
				control: this.oView.byId("MainForm"),
				callback() {},
				callAfterInitialVariant: true
			}).then(function() {
				assert.ok(
					this.oVariantModel.getData()[sVMReference1].variants[0].executeOnSelect,
					"then executeOnSelect is still set for the default variant"
				);
			}.bind(this));
		});

		QUnit.test("when 'attachVariantApplied' is called without executeOnSelectionForStandardDefault set, standard being default and no flex change for apply automatically", function(assert) {
			var sVMReference1 = "mockview--VariantManagement2";
			var sVMControlId = `testComponent---${sVMReference1}`;
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns({});
			VariantManagementState.getCurrentVariantReference.restore();

			return Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.strictEqual(fnCallback1.callCount, 1, "the callback was called");
				assert.strictEqual(fnCallback1.lastCall.args[0].executeOnSelect, false, "the flag to apply automatically is not set");
				assert.strictEqual(fnCallback2.callCount, 0, "the callback was not called");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard being default and a flex change for apply automatically", function(assert) {
			var sVMReference1 = "mockview--VariantManagement2";
			var sVMControlId = `testComponent---${sVMReference1}`;
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns({setExecuteOnSelect: {}});
			VariantManagementState.getCurrentVariantReference.restore();

			return Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.strictEqual(fnCallback1.callCount, 1, "the callback was called");
				assert.strictEqual(fnCallback2.callCount, 0, "the callback was not called");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard not being default and no flex change for apply automatically", function(assert) {
			var sVMReference1 = "mockview--VariantManagement1";
			var sVMControlId = `testComponent---${sVMReference1}`;
			var oVMControl = Element.getElementById(sVMControlId);
			oVMControl.setExecuteOnSelectionForStandardDefault(true);
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "getVariantChangesForVariant").returns({});

			return Promise.all([
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback1,
					callAfterInitialVariant: true
				}),
				this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				})
			]).then(function() {
				assert.strictEqual(fnCallback1.callCount, 1, "the callback was called");
				assert.strictEqual(fnCallback2.callCount, 0, "the callback was not called");
			});
		});
	});

	QUnit.module("Given a VariantModel without data and with Ushell available", {
		beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("foo");
			this.oModel = new VariantModel({}, {
				flexController: {},
				appComponent: {getId() {}}
			});
			oComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			sandbox.stub(Utils, "getUShellService").callsFake(function(sServiceName) {
				return Promise.resolve(sServiceName);
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});
			sandbox.stub(URLHandler, "initialize");
			return this.oModel.initialize();
		},
		afterEach() {
			this.oModel.destroy();
			oComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling getUShellService", function(assert) {
			assert.strictEqual(this.oModel.getUShellService("UserInfo"), "UserInfo", "the UserInfo service was loaded");
			assert.strictEqual(this.oModel.getUShellService("URLParsing"), "URLParsing", "the URLParsing service was loaded");
			assert.strictEqual(
				this.oModel.getUShellService("Navigation"),
				"Navigation", "the Navigation service was loaded"
			);
			assert.strictEqual(
				this.oModel.getUShellService("ShellNavigationInternal"),
				"ShellNavigationInternal",
				"the ShellNavigationInternal service was loaded"
			);
			assert.notOk(this.oModel.getUShellService("UnknownService"), "the UnknownService service was not loaded");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});