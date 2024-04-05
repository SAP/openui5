/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/m/App",
	"sap/m/Button",
	"sap/ui/base/Event",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Lib",
	"sap/ui/core/Manifest",
	"sap/ui/core/UIComponent",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element"
], function(
	_omit,
	Log,
	App,
	Button,
	Event,
	JsControlTreeModifier,
	XMLView,
	BusyIndicator,
	ComponentContainer,
	Lib,
	Manifest,
	UIComponent,
	ResourceModel,
	Applier,
	Reverter,
	URLHandler,
	VariantUtil,
	FlexObjectFactory,
	Switcher,
	VariantManagementState,
	FlexState,
	ManifestUtils,
	ControlVariantApplyAPI,
	Settings,
	VariantManagement,
	VariantModel,
	ContextBasedAdaptationsAPI,
	FlexControllerFactory,
	LayerUtils,
	Layer,
	Utils,
	sinon,
	nextUIUpdate,
	Element
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");
	var sVMReference = "variantMgmtId1";
	const sReference = "MyComponent";
	sinon.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
	sinon.stub(BusyIndicator, "show");
	sinon.stub(BusyIndicator, "hide");
	var oDummyControl = {
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
			return FlexState.initialize({
				reference: sReference,
				componentId: "RTADemoAppMD",
				componentData: {},
				manifest: {}
			}).then(function() {
				var oManifestObj = {
					"sap.app": {
						id: sReference,
						applicationVersion: {
							version: "1.2.3"
						}
					}
				};
				var oManifest = new Manifest(oManifestObj);

				this.oComponent = {
					name: sReference,
					getId() {
						return "RTADemoAppMD";
					},
					getManifest() {
						return oManifest;
					},
					getLocalId() {}
				};
				sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);
				sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(this.oComponent.name);
				sandbox.stub(URLHandler, "attachHandlers");

				this.oFlexController = FlexControllerFactory.createForControl(this.oComponent, oManifest);
				sandbox.spy(URLHandler, "initialize");
				this.oDataSelectorUpdateSpy = sandbox.spy(VariantManagementState.getVariantManagementMap(), "addUpdateListener");

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
					})
				]);

				this.oModel = new VariantModel({}, {
					flexController: this.oFlexController,
					appComponent: this.oComponent
				});
				return this.oModel.initialize();
			}.bind(this));
		},
		afterEach() {
			FlexState.clearState();
			FlexState.clearRuntimeSteadyObjects(sReference, "RTADemoAppMD");
			VariantManagementState.resetCurrentVariantReference(sReference);
			sandbox.restore();
			this.oModel.destroy();
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
		});

		QUnit.test("when destroy() is called", function(assert) {
			assert.ok(this.oDataSelectorUpdateSpy.calledWith(this.oModel.fnUpdateListener), "the update listener was added");
			var oRemoveSpy = sandbox.spy(VariantManagementState.getVariantManagementMap(), "removeUpdateListener");
			var oClearSpy = sandbox.spy(VariantManagementState, "clearRuntimeSteadyObjects");
			var oClearCurrentVariantSpy = sandbox.spy(VariantManagementState, "resetCurrentVariantReference");
			this.oModel.destroy();
			assert.ok(oClearSpy.calledOnce, "then fake standard variants were reset");
			assert.ok(oClearCurrentVariantSpy.calledOnce, "then the saved current variant was reset");
			assert.ok(oRemoveSpy.calledWith(this.oModel.fnUpdateListener), "the update listener was removed");
		});

		QUnit.test("when there is an update from the DataSelector", function(assert) {
			this.oModel.oChangePersistence.addDirtyChange(
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
			);
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});
			this.oModel.oChangePersistence.addDirtyChange(
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
			);
			this.oModel.oChangePersistence.addDirtyChange(
				FlexObjectFactory.createUIChange({
					id: "someUIChange",
					layer: Layer.CUSTOMER,
					variantReference: "variant0"
				})
			);
			this.oModel.oChangePersistence.addDirtyChange(
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
			);
			this.oModel.oChangePersistence.addDirtyChange(
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
			);
			this.oModel.oChangePersistence.addDirtyChange(
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
			);
			this.oModel.oChangePersistence.addDirtyChange(
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
				oTestParams.inputParams.appComponent = this.oComponent;
				var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
				if (!oTestParams.inputParams.adaptationId) {
					sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
					sandbox.stub(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId").returns("id_12345");
				}
				var oVariantInstance = createVariant(this.oModel.oData[sVMReference].variants[2]);
				sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

				var oChange = this.oModel.addVariantChange(sVMReference, oTestParams.inputParams);
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
				assert.ok(
					fnAddDirtyChangeStub.calledWith(oChange),
					"then 'FlexController.addDirtyChange called with the newly created change"
				);
			});
		});

		QUnit.test("when calling 'deleteVariantChange'", function(assert) {
			var fnChangeStub = sandbox.stub().returns({
				convertToFileContent() {}
			});
			var mPropertyBag = {foo: "bar"};
			var oDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var oSetPropertiesStub = sandbox.stub(this.oModel, "setVariantProperties");
			this.oModel.deleteVariantChange(sVMReference, mPropertyBag, fnChangeStub());
			assert.ok(oDeleteChangeStub.calledWith(fnChangeStub()), "then 'FlexController.deleteChange' called with the passed change");
			assert.ok(oSetPropertiesStub.calledWith(sVMReference, mPropertyBag), "the correct properties were passed");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' with different current and default variants, in UI adaptation mode", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData[sVMReference].variants[2])});
			var mPropertyBag = {
				changeType: "setDefault",
				defaultVariant: "variant1",
				layer: Layer.CUSTOMER,
				variantManagementReference: sVMReference,
				appComponent: this.oComponent,
				change: {
					convertToFileContent() {}
				}
			};
			sandbox.stub(URLHandler, "getStoredHashParams").returns([]);
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			sandbox.stub(URLHandler, "update");

			// set adaptation mode true
			this.oModel._bDesignTimeMode = true;

			// mock current variant id to make it different
			this.oModel.oData[sVMReference].currentVariant = "variantCurrent";

			this.oModel.setVariantProperties(sVMReference, mPropertyBag);
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: [this.oModel.oData[sVMReference].currentVariant],
				updateURL: !this.oModel._bDesignTimeMode,
				updateHashEntry: true,
				model: this.oModel
			}), "then the URLHandler.update() called with the current variant id as a parameter in UI adaptation mode");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' with same current and default variants, in personalization mode", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData[sVMReference].variants[2])});
			var mPropertyBag = {
				changeType: "setDefault",
				defaultVariant: "variant1",
				layer: Layer.CUSTOMER,
				variantManagementReference: sVMReference,
				appComponent: this.oComponent,
				change: {
					convertToFileContent() {}
				}
			};
			// current variant already exists in hash parameters
			sandbox.stub(URLHandler, "getStoredHashParams").returns([this.oModel.oData[sVMReference].currentVariant]);
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			sandbox.stub(URLHandler, "update");

			// set adaptation mode false
			this.oModel._bDesignTimeMode = false;

			this.oModel.setVariantProperties(sVMReference, mPropertyBag);
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: [],
				updateURL: !this.oModel._bDesignTimeMode,
				updateHashEntry: true,
				model: this.oModel
			}), "then the URLHandler.update() called without the current variant id as a parameter in personalization mode");
		});

		QUnit.test("when calling 'updateCurrentVariant' with root app component", function(assert) {
			sandbox.stub(Switcher, "switchVariant").resolves();
			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");
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
					flexController: this.oModel.oFlexController,
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
			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");

			this.oModel.oData[sVMReference].updateVariantInURL = true;
			return this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant0"
			}).then(function() {
				assert.ok(Switcher.switchVariant.calledWith({
					vmReference: sVMReference,
					currentVReference: "variant1",
					newVReference: "variant0",
					flexController: this.oModel.oFlexController,
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

			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");

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

			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");
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

			var oaddRuntimeSteadyObjectStub = sandbox.stub(VariantManagementState, "addRuntimeSteadyObject");
			var oCreateVariantStub = sandbox.stub(FlexObjectFactory, "createFlVariant").returns("variant");
			this.oModel.setData({});
			this.oModel._ensureStandardVariantExists("mockVariantManagement");

			assert.strictEqual(oaddRuntimeSteadyObjectStub.callCount, 1, "a variant was added");
			assert.deepEqual(oaddRuntimeSteadyObjectStub.firstCall.args[2], "variant", "the standard variant was added correctly");
			assert.strictEqual(oCreateVariantStub.callCount, 1, "a variant was created");
			assert.deepEqual(oCreateVariantStub.firstCall.args[0], oExpectedVariant, "the standard variant was created correctly");
		});

		[true, false].forEach(function(bVendorLayer) {
			QUnit.test(bVendorLayer ? "when calling 'copyVariant' in VENDOR layer" : "when calling 'copyVariant'", function(assert) {
				sandbox.stub(Settings, "getInstanceOrUndef").returns({
					getUserId() {return "test user";}
				});
				sandbox.stub(JsControlTreeModifier, "getSelector").returns({id: sVMReference});
				var oAddDirtyChangesSpy = sandbox.spy(this.oModel.oChangePersistence, "addDirtyChanges");

				var mPropertyBag = {
					sourceVariantReference: sVMReference,
					variantManagementReference: sVMReference,
					appComponent: this.oComponent,
					generator: "myFancyGenerator",
					newVariantReference: "potato",
					layer: bVendorLayer ? Layer.VENDOR : Layer.CUSTOMER,
					additionalVariantChanges: []
				};
				sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
				return this.oModel.copyVariant(mPropertyBag).then(function(aChanges) {
					var oNewVariant = this.oModel.oData[sVMReference].variants.find(function(oVariant) {
						return oVariant.key === "potato";
					});
					assert.ok(oAddDirtyChangesSpy.calledOnce, "then the changes were added");
					assert.ok(oNewVariant.rename, "then the property was added correctly");
					assert.ok(oNewVariant.change, "then the property was added correctly");
					assert.ok(oNewVariant.remove, "then the property was added correctly");
					assert.strictEqual(oNewVariant.sharing, this.oModel.sharing.PUBLIC, "then the property was added correctly");
					assert.strictEqual(oNewVariant.author, bVendorLayer ? "SAP" : oResourceBundle.getText("VARIANT_SELF_OWNER_NAME"), "then the author is set correctly");
					assert.strictEqual(
						aChanges[0].getId(), "potato",
						"then the returned variant is the duplicate variant"
					);
				}.bind(this));
			});
		});

		QUnit.test("when calling 'copyVariant' with public layer", function(assert) {
			var oVariantData = {
				instance: createVariant({
					fileName: "variant0",
					variantManagementReference: sVMReference,
					variantReference: "",
					layer: Layer.PUBLIC,
					title: "Text for TextDemo",
					author: ""
				}),
				controlChanges: [],
				variantChanges: {}
			};
			var oAddDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChanges").returnsArg(0);

			sandbox.stub(this.oModel, "_duplicateVariant").returns(oVariantData);
			sandbox.stub(JsControlTreeModifier, "getSelector").returns({id: sVMReference});
			sandbox.stub(this.oModel, "updateCurrentVariant").resolves();

			var mPropertyBag = {
				variantManagementReference: sVMReference,
				appComponent: this.oComponent,
				generator: "myFancyGenerator",
				layer: Layer.PUBLIC,
				additionalVariantChanges: []
			};
			return this.oModel.copyVariant(mPropertyBag).then(function(aChanges) {
				assert.ok(this.oModel.getVariant("variant0", sVMReference), "then variant added to VariantModel");
				assert.strictEqual(oVariantData.instance.getFavorite(), false, "then variant has favorite set to false");
				assert.strictEqual(aChanges.length, 2, "then there are 2 changes");
				assert.strictEqual(aChanges[0].getLayer(), Layer.USER, "the first change is a user layer change");
				assert.strictEqual(aChanges[0].getChangeType(), "setFavorite", "with changeType 'setFavorite'");
				assert.deepEqual(aChanges[0].getContent(), {favorite: true}, "and favorite set to true");
				assert.strictEqual(aChanges[1].getLayer(), Layer.PUBLIC, "then the second change is a public layer change");
				assert.strictEqual(
					aChanges[1].getId(),
					oVariantData.instance.getId(),
					"then the returned variant is the duplicate variant"
				);
				assert.equal(
					oAddDirtyChangesStub.firstCall.args[0].length,
					2,
					"then both changes are added as dirty changes"
				);
			}.bind(this));
		});

		QUnit.test("when calling 'removeVariant' with a component", function(assert) {
			var fnDeleteChangesStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChanges");
			var oChangeInVariant = {
				fileName: "change0",
				variantReference: "variant0",
				layer: Layer.VENDOR,
				getId() {
					return this.fileName;
				},
				getVariantReference() {
					return this.variantReference;
				}
			};
			var oVariant = {
				fileName: "variant0",
				getId() {
					return this.fileName;
				}
			};
			var aDummyDirtyChanges = [oVariant].concat(oChangeInVariant);

			var fnUpdateCurrentVariantSpy = sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns(aDummyDirtyChanges);

			assert.strictEqual(this.oModel.oData[sVMReference].variants.length, 5, "then initial length is 5");
			var mPropertyBag = {
				variant: oVariant,
				sourceVariantReference: "sourceVariant",
				variantManagementReference: sVMReference,
				component: this.oModel.oAppComponent
			};
			return this.oModel.removeVariant(mPropertyBag).then(function() {
				assert.deepEqual(fnUpdateCurrentVariantSpy.getCall(0).args[0], {
					variantManagementReference: mPropertyBag.variantManagementReference,
					newVariantReference: mPropertyBag.sourceVariantReference,
					appComponent: mPropertyBag.component
				}, "then updateCurrentVariant() called with the correct parameters");
				assert.ok(fnDeleteChangesStub.calledOnce, "then ChangePersistence.deleteChanges called once");
				assert.strictEqual(fnDeleteChangesStub.lastCall.args[0].length, 2, "with both changes");
				assert.strictEqual(
					fnDeleteChangesStub.lastCall.args[0][0],
					oVariant,
					"then ChangePersistence.deleteChanges called including variant"
				);
				assert.strictEqual(
					fnDeleteChangesStub.lastCall.args[0][1],
					oChangeInVariant,
					"then ChangePersistence.deleteChanges called including change in variant"
				);
			});
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
			const aChanges = this.oModel._collectModelChanges(sVMReference, Layer.CUSTOMER, oManageEvent);
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

			const aChanges = this.oModel._collectModelChanges(sVMReference, Layer.USER, oManageEvent);
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
			var oVariantManagement = new VariantManagement(sVMReference);
			var sLayer = Layer.CUSTOMER;
			var sDummyClass = "DummyClass";
			var oFakeComponentContainerPromise = {property: "fake"};
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
			var oOpenManagementDialogStub = sandbox.stub(oVariantManagement, "openManagementDialog")
			.callsFake(() => oVariantManagement.fireManage(oManageParameters));
			var oVariantInstance = createVariant(this.oModel.oData[sVMReference].variants[1]);
			sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

			this.oModel.setModelPropertiesForControl(sVMReference, true, oVariantManagement);

			return this.oModel.manageVariants(oVariantManagement, sVMReference, sLayer, sDummyClass, oFakeComponentContainerPromise)
			.then(function(aChanges) {
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
					layer: Layer.CUSTOMER
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
				oVariantManagement.destroy();
			});
		});

		QUnit.test("when the VM Control fires the manage event in Personalization mode with dirty VM changes and UI Changes", function(assert) {
			const oVariantManagement = new VariantManagement(sVMReference);
			oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			const oVariantInstance = createVariant(this.oModel.getData()[sVMReference].variants[1]);
			sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

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
			const oAddVariantChangesSpy = sandbox.spy(this.oModel, "addVariantChanges");
			const oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges");

			oVariantManagement.fireManage(oManageParameters, {variantManagementReference: sVMReference});
			assert.strictEqual(oUpdateVariantStub.callCount, 0, "the variant was not switched");
			const aArgs = oSaveDirtyChangesStub.lastCall.args;
			assert.strictEqual(aArgs[0], this.oComponent, "the app component was passed");
			assert.strictEqual(aArgs[1], false, "the second parameter is false");
			assert.deepEqual(aArgs[2].length, 4, "an array with 4 changes was passed");
			assert.strictEqual(oAddVariantChangesSpy.lastCall.args[1].length, 4, "4 changes were added");
			oVariantManagement.destroy();
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
			const oAddVariantChangesSpy = sandbox.spy(this.oModel, "addVariantChanges");
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").callsFake((oAppComponent, bSkipUpdateCache, aChanges) => {
				assert.strictEqual(oUpdateVariantStub.callCount, 1, "the variant was switched");
				assert.deepEqual(oUpdateVariantStub.lastCall.args[0], {
					variantManagementReference: sVMReference,
					newVariantReference: sVMReference
				}, "the correct variant was switched to");
				assert.strictEqual(oAppComponent, this.oComponent, "the app component was passed");
				assert.strictEqual(bSkipUpdateCache, false, "the second parameter is false");
				assert.deepEqual(aChanges.length, 1, "an array with 1 change was passed");
				assert.strictEqual(oAddVariantChangesSpy.lastCall.args[1].length, 1, "1 changes were added");
				oVariantManagement.destroy();
				done();
			});

			oVariantManagement.fireManage(oManageParameters, {variantManagementReference: sVMReference});
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

			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns(aControlChanges);

			var aDirtyChanges = this.oModel._getDirtyChangesFromVariantChanges(aControlChanges);
			assert.strictEqual(aDirtyChanges.length, 2, "only two of the given changes are returned as dirty by the model");
			assert.strictEqual(aDirtyChanges[0].getId(), "change1", "change1 is dirty");
			assert.strictEqual(aDirtyChanges[1].getId(), "change3", "change3 is dirty");
		});

		function createChanges(oChangePersistence, sLayer, sVariantReference) {
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				layer: sLayer || Layer.USER, // Changes are on user layer until they are saved to a variant
				selector: {
					id: "abc123"
				},
				variantReference: sVariantReference || "variant1"
			});
			oChangePersistence.addDirtyChange(oChange1);
			var oChange2 = FlexObjectFactory.createFromFileContent({
				fileName: "change2",
				layer: sLayer || Layer.USER,
				selector: {
					id: "abc123"
				},
				variantReference: sVariantReference || "variant1"
			});
			oChangePersistence.addDirtyChange(oChange2);
			var oChange3 = FlexObjectFactory.createFromFileContent({
				fileName: "change3",
				layer: sLayer || Layer.USER,
				selector: {
					id: "abc123"
				},
				variantReference: sVariantReference || "variant1"
			});
			oChangePersistence.addDirtyChange(oChange3);
			return [oChange1, oChange2, oChange3];
		}

		QUnit.test("when calling '_handleSaveEvent' with parameter from SaveAs button and default/execute box checked", function(assert) {
			assert.expect(9);
			var aChanges = createChanges(this.oModel.oChangePersistence);
			var oVariantManagement = new VariantManagement(sVMReference);
			var sCopyVariantName = "variant1";
			var oEvent = {
				getParameters() {
					return {
						overwrite: false,
						name: "Test",
						def: true,
						execute: true,
						contexts: {
							role: ["testRole"]
						}
					};
				},
				getSource() {
					return oVariantManagement;
				}
			};
			var sUserName = "testUser";
			var oResponse = {response: [{fileName: sCopyVariantName, support: {user: sUserName}}]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			var oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);
			var oDeleteChangesSpy = sandbox.spy(this.oModel.oChangePersistence, "deleteChanges");
			var oCopyVariantSpy = sandbox.spy(this.oModel, "copyVariant");
			var oCreateChangeSpy = sandbox.spy(FlexObjectFactory, "createUIChange");
			var oCreateDefaultFileNameSpy = sandbox.spy(Utils, "createDefaultFileName");

			return this.oModel._handleSaveEvent(oEvent)
			.then(function() {
				var sNewVariantReference = oCreateDefaultFileNameSpy.getCall(0).returnValue;
				assert.strictEqual(
					oCreateDefaultFileNameSpy.getCall(0).args[0],
					"flVariant",
					"then the file type was passed to sap.ui.fl.Utils.createDefaultFileName"
				);
				assert.strictEqual(oCreateChangeSpy.callCount, 2, "two changes were created");
				assert.ok(oCopyVariantSpy.calledOnce, "then copyVariant() was called once");
				assert.deepEqual(oCopyVariantSpy.lastCall.args[0], {
					appComponent: this.oComponent,
					layer: Layer.USER,
					currentVariantComparison: -1,
					generator: undefined,
					contexts: {
						role: ["testRole"]
					},
					newVariantReference: sNewVariantReference,
					sourceVariantReference: sCopyVariantName,
					title: "Test",
					variantManagementReference: sVMReference,
					adaptationId: undefined,
					additionalVariantChanges: [oCreateChangeSpy.getCall(0).returnValue, oCreateChangeSpy.getCall(1).returnValue]
				}, "then copyVariant() was called with the right parameters");

				assert.strictEqual(oSaveDirtyChangesStub.callCount, 1, "then dirty changes were saved");
				assert.strictEqual(
					oSaveDirtyChangesStub.args[0][2].length, 6,
					"then six dirty changes were saved (new variant, 3 copied ctrl changes, setDefault change, setExecuteOnSelect change"
				);
				assert.ok(
					oDeleteChangesSpy.calledBefore(oSaveDirtyChangesStub),
					"the changes were deleted from default variant before the copied variant was saved"
				);
				assert.ok(
					oDeleteChangesSpy.calledWith(aChanges.reverse()), // the last change is reverted first
					"then dirty changes from source variant were deleted from the persistence (in the right order)"
				);
				this.oModel.getData()[sVMReference].variants.forEach(function(oVariant) {
					if (oVariant.key === sCopyVariantName) {
						assert.strictEqual(oVariant.author, sUserName, "then 'testUser' is add as author");
					}
				});
				oVariantManagement.destroy();
			}.bind(this));
		});

		QUnit.test("when calling '_handleSaveEvent' with parameter from SaveAs button and default/execute and public box checked", function(assert) {
			assert.expect(11);
			var aChanges = createChanges(this.oModel.oChangePersistence);
			var oVariantManagement = new VariantManagement(sVMReference);
			var sCopyVariantName = "variant1";
			var oEvent = {
				getParameters() {
					return {
						overwrite: false,
						"public": true,
						name: "Test",
						def: true,
						execute: true,
						contexts: {
							role: ["testRole"]
						}
					};
				},
				getSource() {
					return oVariantManagement;
				}
			};
			var sUserName = "testUser";
			var oResponse = {response: [{fileName: sCopyVariantName, support: {user: sUserName}}]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			var oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);
			var oDeleteChangesSpy = sandbox.spy(this.oModel.oChangePersistence, "deleteChanges");
			var oCopyVariantSpy = sandbox.spy(this.oModel, "copyVariant");
			var oCreateDefaultFileNameSpy = sandbox.spy(Utils, "createDefaultFileName");
			var oCreateChangeSpy = sandbox.spy(FlexObjectFactory, "createUIChange");

			return this.oModel._handleSaveEvent(oEvent)
			.then(function() {
				var sNewVariantReference = oCreateDefaultFileNameSpy.getCall(0).returnValue;
				assert.strictEqual(
					oCreateDefaultFileNameSpy.getCall(0).args[0],
					"flVariant",
					"then the file type was passed to sap.ui.fl.Utils.createDefaultFileName"
				);
				assert.ok(oCopyVariantSpy.calledOnce, "then copyVariant() was called once");
				assert.strictEqual(oCreateChangeSpy.callCount, 3, "three changes were created");
				assert.deepEqual(oCopyVariantSpy.lastCall.args[0], {
					appComponent: this.oComponent,
					layer: Layer.PUBLIC,
					currentVariantComparison: 0,
					generator: undefined,
					contexts: {
						role: ["testRole"]
					},
					newVariantReference: sNewVariantReference,
					sourceVariantReference: sCopyVariantName,
					title: "Test",
					variantManagementReference: sVMReference,
					adaptationId: undefined,
					additionalVariantChanges: [oCreateChangeSpy.getCall(0).returnValue, oCreateChangeSpy.getCall(1).returnValue]
				}, "then copyVariant() was called with the right parameters");

				assert.strictEqual(
					oSaveDirtyChangesStub.callCount, 1,
					"then dirty changes were saved"
				);
				assert.strictEqual(
					oSaveDirtyChangesStub.args[0][2].length, 7,
					"then a new variant, 3 copied ctrl changes, setDefault change, setExecuteOnSelect change, setFavorite change were saved"
				);
				assert.strictEqual(
					oSaveDirtyChangesStub.args[0][2][0].getChangeType(), "setFavorite",
					"then a setFavorite change was added"
				);
				assert.strictEqual(
					oSaveDirtyChangesStub.args[0][2][5].getChangeType(), "setDefault",
					"the last change was 'setDefault'"
				);
				assert.ok(
					oDeleteChangesSpy.calledBefore(oSaveDirtyChangesStub),
					"the changes were deleted from default variant before the copied variant was saved"
				);
				assert.ok(
					oDeleteChangesSpy.calledWith(aChanges.reverse()), // the last change is reverted first
					"then dirty changes from source variant were deleted from the persistence (in the right order)"
				);
				this.oModel.getData()[sVMReference].variants.forEach(function(oVariant) {
					if (oVariant.key === sCopyVariantName) {
						assert.strictEqual(oVariant.author, sUserName, "then 'testUser' is add as author");
					}
				});
				oVariantManagement.destroy();
			}.bind(this));
		});

		QUnit.test("when calling '_handleSaveEvent' with parameter from Save button", function(assert) {
			createChanges(this.oModel.oChangePersistence);
			var oVariantManagement = new VariantManagement(sVMReference);
			var oEvent = {
				getParameters() {
					return {
						overwrite: true,
						name: "Test"
					};
				},
				getSource() {
					return oVariantManagement;
				}
			};

			var oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves({
				response: [{fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]
			});
			var oCopyVariantSpy = sandbox.spy(this.oModel, "copyVariant");
			var oSetVariantPropertiesSpy = sandbox.spy(this.oModel, "setVariantProperties");

			return this.oModel._handleSaveEvent(oEvent)
			.then(function() {
				assert.ok(oCopyVariantSpy.notCalled, "CopyVariant is not called");
				assert.ok(oSetVariantPropertiesSpy.notCalled, "SetVariantProperties is not called");
				assert.ok(oSaveDirtyChangesStub.calledOnce, "SaveAll is called");
				oVariantManagement.destroy();
				assert.notOk(
					this.oModel.getData()[sVMReference].modified,
					"then the modified flag is reset"
				);
			}.bind(this));
		});

		QUnit.test("when calling '_handleSaveEvent' on a USER variant with setDefault, executeOnSelect and public boxes checked", function(assert) {
			createChanges(this.oModel.oChangePersistence);
			var oVariantManagement = new VariantManagement(sVMReference);
			var sCopyVariantName = "variant1";
			var oEvent = {
				getParameters() {
					return {
						name: "Test",
						def: true,
						"public": true,
						execute: true
					};
				},
				getSource() {
					return oVariantManagement;
				}
			};
			var sUserName = "testUser";
			var oResponse = {response: [{fileName: sCopyVariantName, support: {user: sUserName}}]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			var oCopyVariantSpy = sandbox.spy(this.oModel, "copyVariant");
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);

			return this.oModel._handleSaveEvent(oEvent)
			.then(function() {
				assert.ok(
					oCopyVariantSpy.calledOnceWith(sinon.match({
						layer: Layer.PUBLIC
					})),
					"then the variant is created on the PUBLIC layer"
				);
				oVariantManagement.destroy();
			});
		});

		QUnit.test("when calling '_handleSaveEvent' with parameter from SaveAs button and default box unchecked", function(assert) {
			assert.expect(9);
			var aChanges = createChanges(this.oModel.oChangePersistence);
			var oVariantManagement = new VariantManagement(sVMReference);
			var sCopyVariantName = "variant1";
			var oEvent = {
				getParameters() {
					return {
						overwrite: false,
						name: "Test",
						def: false,
						execute: false,
						contexts: {
							role: ["testRole"]
						}
					};
				},
				getSource() {
					return oVariantManagement;
				}
			};
			var sUserName = "testUser";
			var oResponse = {response: [{fileName: sCopyVariantName, support: {user: sUserName}}]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			var oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);
			var oDeleteChangesSpy = sandbox.spy(this.oModel.oChangePersistence, "deleteChanges");
			var oCopyVariantSpy = sandbox.spy(this.oModel, "copyVariant");
			var oAddVariantChangeSpy = sandbox.spy(this.oModel, "addVariantChange");
			var oCreateDefaultFileNameSpy = sandbox.spy(Utils, "createDefaultFileName");

			return this.oModel._handleSaveEvent(oEvent)
			.then(function() {
				var sNewVariantReference = oCreateDefaultFileNameSpy.getCall(0).returnValue;
				assert.strictEqual(
					oCreateDefaultFileNameSpy.getCall(0).args[0],
					"flVariant",
					"then the file type was passed to sap.ui.fl.Utils.createDefaultFileName"
				);
				assert.ok(oCopyVariantSpy.calledOnce, "then copyVariant() was called once");
				assert.deepEqual(oCopyVariantSpy.lastCall.args[0], {
					appComponent: this.oComponent,
					layer: Layer.USER,
					currentVariantComparison: -1,
					generator: undefined,
					contexts: {
						role: ["testRole"]
					},
					newVariantReference: sNewVariantReference,
					sourceVariantReference: sCopyVariantName,
					title: "Test",
					variantManagementReference: sVMReference,
					adaptationId: undefined,
					additionalVariantChanges: []
				}, "then copyVariant() was called with the right parameters");

				assert.ok(oAddVariantChangeSpy.notCalled, "then no new changes were created");
				assert.strictEqual(oSaveDirtyChangesStub.callCount, 1, "then dirty changes were saved");
				assert.strictEqual(
					oSaveDirtyChangesStub.args[0][2].length,
					4,
					"then six dirty changes were saved (new variant, 3 copied ctrl changes"
				);
				assert.ok(
					oDeleteChangesSpy.calledBefore(oSaveDirtyChangesStub),
					"the changes were deleted from default variant before the copied variant was saved"
				);
				assert.ok(
					oDeleteChangesSpy.calledWith(aChanges.reverse()), // the last change is reverted first
					"then dirty changes from source variant were deleted from the persistence (in the right order)"
				);
				this.oModel.getData()[sVMReference].variants.forEach(function(oVariant) {
					if (oVariant.key === sCopyVariantName) {
						assert.strictEqual(oVariant.author, sUserName, "then 'testUser' is add as author");
					}
				});
				oVariantManagement.destroy();
			}.bind(this));
		});

		QUnit.test("when calling '_handleSaveEvent' with bDesignTimeMode set to true", function(assert) {
			var fnDone = assert.async();
			var oVariantManagement = new VariantManagement(sVMReference);
			var oEvent = {
				getParameters() {
					return {
						overwrite: false,
						name: "Test",
						def: false
					};
				},
				getSource() {
					return oVariantManagement;
				}
			};

			this.oModel._bDesignTimeMode = true;

			var oHandleSaveSpy = sandbox.spy(this.oModel, "_handleSave");

			return this.oModel._handleSaveEvent(oEvent).then(function() {
				assert.strictEqual(oHandleSaveSpy.callCount, 0, "then _handleSave() was not called");
				oVariantManagement.destroy();
				fnDone();
			});
		});

		QUnit.test("when calling '_handleSave' with with bDesignTimeMode set to true and parameters from SaveAs button and default/execute box checked", function(assert) {
			assert.expect(9);
			var sNewVariantReference = "variant2";
			var aChanges = createChanges(this.oModel.oChangePersistence, Layer.CUSTOMER, "variant0");
			var oVariantManagement = new VariantManagement(sVMReference);
			var sCopyVariantName = "variant0";
			var mParameters = {
				overwrite: false,
				name: "Key User Test Variant",
				def: true,
				execute: true,
				layer: Layer.CUSTOMER,
				newVariantReference: sNewVariantReference,
				generator: "myFancyGenerator",
				contexts: {
					role: ["testRole"]
				}
			};
			var sUserName = "testUser";
			var oResponse = {response: [{fileName: sCopyVariantName, support: {user: sUserName}}]};

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			var oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").callsFake(function() {
				return Promise.resolve(oResponse);
			});
			var oDeleteChangesSpy = sandbox.spy(this.oModel.oChangePersistence, "deleteChanges");
			var oCopyVariantSpy = sandbox.spy(this.oModel, "copyVariant");
			var oCreateChangeSpy = sandbox.spy(FlexObjectFactory, "createUIChange");

			// Copy a variant from the CUSTOMER layer
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVMReference,
				newVReference: "variant0"
			});
			this.oModel._bDesignTimeMode = true;
			return this.oModel._handleSave(oVariantManagement, mParameters)
			.then(function(aDirtyChanges) {
				assert.ok(oCopyVariantSpy.calledOnce, "then copyVariant() was called once");
				assert.strictEqual(oCreateChangeSpy.callCount, 2, "two changes were created");
				assert.deepEqual(oCopyVariantSpy.lastCall.args[0], {
					appComponent: this.oComponent,
					layer: Layer.CUSTOMER,
					currentVariantComparison: 0,
					generator: "myFancyGenerator",
					newVariantReference: sNewVariantReference,
					sourceVariantReference: sCopyVariantName,
					title: "Key User Test Variant",
					variantManagementReference: sVMReference,
					contexts: {
						role: ["testRole"]
					},
					adaptationId: undefined,
					additionalVariantChanges: [oCreateChangeSpy.getCall(0).returnValue, oCreateChangeSpy.getCall(1).returnValue]
				}, "then copyVariant() was called with the right parameters");
				assert.strictEqual(oSaveDirtyChangesStub.callCount, 0, "then dirty changes were not saved");
				assert.strictEqual(
					aDirtyChanges.length,
					6,
					"then six dirty changes were created (new variant, 3 copied ctrl changes, setDefault change, setExecuteOnSelect change"
				);
				assert.strictEqual(aDirtyChanges[4].getChangeType(), "setDefault", "the last change was 'setDefault'");
				assert.strictEqual(aDirtyChanges[0].getLayer(), Layer.CUSTOMER, "the ctrl change has the correct layer");
				assert.ok(
					oDeleteChangesSpy.calledBefore(oSaveDirtyChangesStub),
					"the changes were deleted from default variant before the copied variant was saved"
				);
				assert.ok(
					oDeleteChangesSpy.calledWith(aChanges.reverse()), // the last change is reverted first
					"then dirty changes from source variant were deleted from the persistence (in the right order)"
				);
				oVariantManagement.destroy();
			}.bind(this));
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

		QUnit.test("When eraseDirtyChangesOnVariant is called", function(assert) {
			var aDummyChanges = ["c1", "c2"];

			var oRevertMultipleChangesStub = sandbox.stub(Reverter, "revertMultipleChanges");
			var oGetControlChangesForVariantStub = sandbox.stub(VariantManagementState, "getControlChangesForVariant");
			sandbox.stub(this.oModel, "_getDirtyChangesFromVariantChanges").returns(aDummyChanges);
			sandbox.stub(this.oModel.oChangePersistence, "deleteChanges");

			return this.oModel.eraseDirtyChangesOnVariant("vm1", "v1")
			.then(function(aChanges) {
				assert.deepEqual(aChanges, aDummyChanges, "then the correct changes are returned");
				assert.ok(oRevertMultipleChangesStub.calledOnce, "then the changes were reverted");
				assert.ok(oGetControlChangesForVariantStub.calledOnce, "then are changes are retrieved for the variant");
			});
		});

		QUnit.test("When addAndApplyChangesOnVariant is called", function(assert) {
			var aDummyChanges = [
				{
					fileName: "c1",
					getSelector() {}
				},
				{
					fileName: "c2",
					getSelector() {}
				}
			];
			var oAddChangesStub = sandbox.stub(this.oModel.oChangePersistence, "addChanges");
			var oApplyChangeStub = sandbox.stub(Applier, "applyChangeOnControl").resolves({success: true});
			sandbox.stub(JsControlTreeModifier, "getControlIdBySelector");

			return this.oModel.addAndApplyChangesOnVariant(aDummyChanges)
			.then(function() {
				assert.strictEqual(oAddChangesStub.lastCall.args[0].length, 2, "then every change in the array was added");
				assert.ok(oApplyChangeStub.calledTwice, "then every change in the array was applied");
			});
		});
	});

	QUnit.module("_duplicateVariant", {
		beforeEach() {
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
		beforeEach() {
			return FlexState.initialize({
				reference: sReference,
				componentId: "RTADemoAppMD",
				componentData: {},
				manifest: {}
			})
			.then(function() {
				var oManifestObj = {
					"sap.app": {
						id: sReference,
						applicationVersion: {
							version: "1.2.3"
						}
					}
				};
				var oManifest = new Manifest(oManifestObj);
				this.sVMReference = "varMgmtRef1";
				this.oVariantManagement = new VariantManagement(this.sVMReference);
				var oComponent = {
					name: sReference,
					getId() {
						return "RTADemoAppMD";
					},
					getManifest() {
						return oManifest;
					},
					getLocalId: function(sId) {
						if (sId === this.oVariantManagement.getId()) {
							return this.sVMReference;
						}
						return null;
					}.bind(this)
				};

				sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
				this.fnGetAppComponentForControlStub = sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
				this.oFlexController = FlexControllerFactory.createForControl(oComponent, oManifest);
				this.fnApplyChangesStub = sandbox.stub(this.oFlexController, "saveSequenceOfDirtyChanges").resolves();
				this.oRegisterControlStub = sandbox.stub(URLHandler, "registerControl");

				sandbox.stub(VariantManagementState, "getInitialUIChanges").returns([]);

				this.oModel = new VariantModel({}, {
					flexController: this.oFlexController,
					appComponent: oComponent
				});

				return this.oModel.initialize();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oModel.destroy();
			this.oVariantManagement.destroy();
			this.oModel.oChangePersistence.removeDirtyChanges();
			FlexControllerFactory._instanceCache = {};
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when calling invalidateMap", function(assert) {
			var oInvalidationStub = sandbox.stub(this.oModel.oDataSelector, "checkUpdate");
			this.oModel.invalidateMap();
			assert.strictEqual(oInvalidationStub.callCount, 1, "the DataSelector was invalidated");
		});

		QUnit.test("when calling 'setModel' of VariantManagement control", function(assert) {
			var fnRegisterToModelSpy = sandbox.spy(this.oModel, "registerToModel");
			sandbox.stub(VariantManagementState, "waitForInitialVariantChanges").resolves("foo");
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
			return this.oModel._oVariantSwitchPromise.then(function(sValue) {
				assert.strictEqual(sValue, "foo", "the initial changes promise was added to the variant switch promise");
			});
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
			assert.deepEqual(this.oRegisterControlStub.getCall(0).args[0], {
				vmReference: this.oModel.oAppComponent.getLocalId(this.oVariantManagement.getId()),
				updateURL: false,
				model: this.oModel
			}, "then URLHandler.attachHandlers was called once for a control to update URL");
			assert.deepEqual(this.oRegisterControlStub.getCall(1).args[0], {
				vmReference: oVariantManagementWithURLUpdate.getId(),
				updateURL: true,
				model: this.oModel
			}, "then URLHandler.attachHandlers was called once for a control without URL update");
			oVariantManagementWithURLUpdate.destroy();
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control where app component couldn't be retrieved", function(assert) {
			this.fnGetAppComponentForControlStub.returns(null);
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

		QUnit.test("when 'save' event event is triggered from a variant management control for a new variant, when variant model is busy", function(assert) {
			var fnDone = assert.async();
			var fnSwitchPromiseStub = sandbox.stub();

			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
			this.oVariantManagement.attachEventOnce("save", function() {
				this.oModel._oVariantSwitchPromise.then(function() {
					// resolved when variant model is not busy anymore
					assert.ok(fnSwitchPromiseStub.calledOnce, "then first the previous variant switch was performed completely");
					assert.ok(
						this.oFlexController.saveSequenceOfDirtyChanges.getCall(0).args[0][0].getName(),
						"variant created title",
						"then the required variant change was saved"
					);
					fnDone();
				}.bind(this));
			}.bind(this));

			// set variant model busy
			this.oModel._oVariantSwitchPromise = new Promise(function(resolve) {
				fnSwitchPromiseStub.callsFake(function() {
					resolve();
				});
				setTimeout(fnSwitchPromiseStub, 0);
			});

			this.oVariantManagement.fireSave({
				name: "variant created title",
				overwrite: false,
				def: false
			});
		});

		QUnit.test("when 'save' event is triggered from a variant management control for an existing variant, when variant model is busy", function(assert) {
			var fnDone = assert.async();
			var fnSwitchPromiseStub = sandbox.stub();

			var oDirtyChange1 = FlexObjectFactory.createFromFileContent({fileName: "newChange1"});
			var oDirtyChange2 = FlexObjectFactory.createFromFileContent({fileName: "newChange2"});
			this.oFlexController._oChangePersistence.addDirtyChange(oDirtyChange1);
			this.oFlexController._oChangePersistence.addDirtyChange(oDirtyChange2);

			sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([oDirtyChange1, oDirtyChange2]);

			this.oVariantManagement.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

			this.oVariantManagement.attachEventOnce("save", function() {
				this.oModel._oVariantSwitchPromise.then(function() {
					// resolved when variant model is not busy anymore
					assert.ok(fnSwitchPromiseStub.calledOnce, "then first the previous variant switch was performed completely");
					assert.deepEqual(
						this.oFlexController.saveSequenceOfDirtyChanges.getCall(0).args[0],
						[oDirtyChange1, oDirtyChange2],
						"then the control changes inside the variant were saved"
					);
					fnDone();
				}.bind(this));
			}.bind(this));

			// set variant model busy
			this.oModel._oVariantSwitchPromise = new Promise(function(resolve) {
				fnSwitchPromiseStub.callsFake(function() {
					resolve();
				});
				setTimeout(fnSwitchPromiseStub, 0);
			});
			this.oVariantManagement.fireSave({
				overwrite: true,
				def: false
			});
		});

		function createTranslationVariants(sTitleBinding) {
			return [createVariant({
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
					this.oModel.oChangePersistence.getDirtyChanges().length,
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
					viewName: "sap.ui.test.VariantManagementTestApp"
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
				sandbox.stub(VariantManagementState, "waitForInitialVariantChanges").resolves();
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
				sandbox.stub(VariantManagementState, "getControlChangesForVariant");
				sandbox.stub(this.oVariantModel.oChangePersistence, "deleteChanges");
				sandbox.stub(this.oVariantModel.oChangePersistence, "getDirtyChanges");
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
						assert.ok(this.oVariantModel.oChangePersistence.deleteChanges.notCalled, "then no dirty changes were deleted");
						fnDone();
					}.bind(this));
					return Promise.resolve();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 0);
		});

		QUnit.test("when the control is switched to a new variant with unsaved personalization changes", function(assert) {
			var fnDone = assert.async();
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "callVariantSwitchListeners");
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = Element.getElementById(sVMControlId);

			this.oVariantModel.oData[this.sVMReference].modified = true;
			var aMockDirtyChanges = [
				FlexObjectFactory.createFromFileContent({fileName: "dirtyChange1"}),
				FlexObjectFactory.createFromFileContent({fileName: "dirtyChange2"})
			];
			VariantManagementState.getControlChangesForVariant.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// FIXME: Use actual data selectors in this module instead of faking their behavior
			this.oUpdateCurrentVariantStub.callsFake(function() {
				// Modified flag will immediately be set to false by the VariantManagementState
				// when the variant was switched
				this.oVariantModel.oData[this.sVMReference].modified = false;
			}.bind(this));

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function(oEvent) {
				var sTargetVariantId = oEvent.getParameters().key;
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.strictEqual(oCallListenerStub.callCount, 0, "the listeners are not notified again");
					assert.deepEqual(this.oVariantModel.updateCurrentVariant.getCall(0).args[0], {
						variantManagementReference: sTargetVariantId,
						newVariantReference: this.sVMReference,
						appComponent: this.oComp,
						internallyCalled: true
					}, "then variant switch was performed");
					assert.ok(Reverter.revertMultipleChanges.notCalled, "then variant was not reverted explicitly");

					assert.ok(
						this.oVariantModel.oChangePersistence.deleteChanges.calledWith(aMockDirtyChanges.reverse()),
						"then dirty changes from source variant were deleted from the persistence (in the right order)"
					);
					fnDone();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 0);
		});

		QUnit.test("when the control is switched to the same variant with no unsaved personalization changes", function(assert) {
			var fnDone = assert.async();
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "callVariantSwitchListeners");
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = Element.getElementById(sVMControlId);

			var aMockDirtyChanges = [
				FlexObjectFactory.createFromFileContent({fileName: "dirtyChange1"}),
				FlexObjectFactory.createFromFileContent({fileName: "dirtyChange2"})
			];
			VariantManagementState.getControlChangesForVariant.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function() {
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.strictEqual(oCallListenerStub.callCount, 1, "the listeners are notified");
					assert.strictEqual(
						oCallListenerStub.lastCall.args[0],
						this.sVMReference,
						"the function is called with the correct parameters"
					);
					assert.strictEqual(
						oCallListenerStub.lastCall.args[1],
						"variant1",
						"the function is called with the correct parameters"
					);
					assert.ok(this.oVariantModel.updateCurrentVariant.notCalled, "then variant switch was not performed");
					assert.ok(
						this.oVariantModel.oChangePersistence.deleteChanges.notCalled,
						"then dirty changes were not deleted from the persistence"
					);
					fnDone();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 1);
		});

		QUnit.test("when the control is switched to the same variant with unsaved personalization changes", function(assert) {
			var fnDone = assert.async();
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = Element.getElementById(sVMControlId);
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "callVariantSwitchListeners");

			this.oVariantModel.oData[this.sVMReference].modified = true;
			var aMockDirtyChanges = [
				FlexObjectFactory.createFromFileContent({fileName: "dirtyChange1"}),
				FlexObjectFactory.createFromFileContent({fileName: "dirtyChange2"})
			];
			VariantManagementState.getControlChangesForVariant.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function() {
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.strictEqual(oCallListenerStub.callCount, 1, "the listeners are notified");
					assert.strictEqual(
						oCallListenerStub.lastCall.args[0],
						this.sVMReference,
						"the function is called with the correct parameters"
					);
					assert.strictEqual(
						oCallListenerStub.lastCall.args[1],
						"variant1",
						"the function is called with the correct parameters"
					);
					assert.ok(this.oVariantModel.updateCurrentVariant.notCalled, "then variant switch was not performed");
					var aChangesInReverseOrder = aMockDirtyChanges.reverse();
					// the order of the changes should be reversed on revertMultipleChanges (change2, change1)
					assert.ok(Reverter.revertMultipleChanges.calledWith(aChangesInReverseOrder, {
						appComponent: this.oComp,
						modifier: JsControlTreeModifier,
						flexController: this.oFlexController
					}), "then variant was reverted in correct order");

					assert.ok(
						this.oVariantModel.oChangePersistence.deleteChanges.calledWith(aChangesInReverseOrder),
						"then dirty changes from source variant were deleted from the persistence (in the right order)"
					);

					fnDone();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 1);
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

			sandbox.stub(Utils, "getUShellService").callsFake(function(sServiceName) {
				return Promise.resolve(sServiceName);
			});
			sandbox.stub(Utils, "getUshellContainer").returns({});
			sandbox.stub(URLHandler, "initialize");
			return this.oModel.initialize();
		},
		afterEach() {
			this.oModel.destroy();
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