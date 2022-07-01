/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/App",
	"sap/m/Button",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Manifest",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/Change",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	Log,
	App,
	Button,
	JsControlTreeModifier,
	XMLView,
	BusyIndicator,
	ComponentContainer,
	Manifest,
	UIComponent,
	Reverter,
	URLHandler,
	VariantUtil,
	FlexObjectFactory,
	Switcher,
	VariantManagementState,
	FlexState,
	ManifestUtils,
	ChangesController,
	Settings,
	VariantManagement,
	VariantModel,
	Change,
	FlexControllerFactory,
	LayerUtils,
	Layer,
	Utils,
	jQuery,
	sinon,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
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
			reference: mVariantProperties.reference || "myReference",
			layer: mVariantProperties.layer,
			user: mVariantProperties.author,
			variantReference: mVariantProperties.variantReference,
			variantManagementReference: mVariantProperties.variantManagementReference,
			variantName: mVariantProperties.title,
			favorite: mVariantProperties.favorite,
			visible: mVariantProperties.visible,
			executeOnSelection: mVariantProperties.executeOnSelect,
			contexts: mVariantProperties.contexts
		});
	}

	QUnit.module("Given an instance of VariantModel", {
		before: function() {
			return FlexState.initialize({
				reference: "MyComponent",
				componentId: "RTADemoAppMD",
				componentData: {},
				manifest: {}
			});
		},
		beforeEach: function() {
			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};
			var oManifest = new Manifest(oManifestObj);

			this.oComponent = {
				name: "MyComponent",
				getId: function() {
					return "RTADemoAppMD";
				},
				getManifest: function() {
					return oManifest;
				},
				getLocalId: function() {}
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(this.oComponent.name);
			sandbox.stub(URLHandler, "attachHandlers");
			sandbox.stub(FlexState, "getVariantsState").returns({});

			this.oFlexController = FlexControllerFactory.createForControl(this.oComponent, oManifest);
			this.oData = {
				variantMgmtId1: {
					defaultVariant: "variant1",
					originalDefaultVariant: "variant1",
					variants: [
						{
							author: VariantUtil.DEFAULT_AUTHOR,
							key: "variantMgmtId1",
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true,
							executeOnSelect: false,
							contexts: {}
						}, {
							author: "Me",
							key: "variant0",
							layer: Layer.CUSTOMER,
							title: "variant A",
							favorite: true,
							visible: true,
							executeOnSelect: false,
							contexts: { role: ["ADMINISTRATOR", "HR"], country: ["DE"] }
						}, {
							author: "Me",
							key: "variant1",
							layer: Layer.PUBLIC,
							title: "variant B",
							favorite: false,
							visible: true,
							executeOnSelect: true,
							contexts: { role: ["ADMINISTRATOR"], country: ["DE"] }
						}, {
							author: "Not Me",
							key: "variant2",
							layer: Layer.PUBLIC,
							title: "variant C",
							favorite: false,
							visible: true,
							executeOnSelect: true,
							contexts: {}
						}, {
							author: "Me",
							key: "variant3",
							layer: Layer.USER,
							title: "variant D",
							favorite: false,
							visible: true,
							executeOnSelect: true,
							contexts: { role: [], country: [] }
						}
					]
				}
			};

			sandbox.spy(URLHandler, "initialize");
			sandbox.stub(VariantManagementState, "fillVariantModel").returns(this.oData);
			sandbox.spy(VariantManagementState, "addUpdateStateListener");

			this.oModel = new VariantModel({}, {
				flexController: this.oFlexController,
				appComponent: this.oComponent
			});
			return this.oModel.initialize();
		},
		afterEach: function() {
			sandbox.restore();
			this.oModel.destroy();
			delete this.oFlexController;
		},
		after: function() {
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when initializing a variant model instance", function(assert) {
			assert.ok(URLHandler.initialize.calledOnce, "then URLHandler.initialize() called once");
			assert.ok(URLHandler.initialize.calledWith({model: this.oModel}), "then URLHandler.initialize() called with the the VariantModel");
			assert.strictEqual(VariantManagementState.addUpdateStateListener.callCount, 1, "the updateListener was added");
		});

		QUnit.test("when destroy() is called", function(assert) {
			sandbox.stub(URLHandler, "update");
			sandbox.stub(Switcher, "switchVariant").resolves();
			sandbox.spy(VariantManagementState, "clearFakedStandardVariants");
			sandbox.spy(VariantManagementState, "removeUpdateStateListener");

			this.oModel.destroy();
			assert.equal(VariantManagementState.clearFakedStandardVariants.callCount, 1, "then faked standard variants were reset");
			assert.strictEqual(VariantManagementState.removeUpdateStateListener.callCount, 1, "the updateListener was removed");
		});

		QUnit.test("when the updateStateListener is called", function(assert) {
			sandbox.stub(VariantManagementState, "getContent").returns("{}");
			var oCheckStub = sandbox.stub(this.oModel, "checkDirtyStateForControlModels");
			var oChange = {
				getState: function() {return Change.states.NEW;},
				convertToFileContent: function() {
					return {fileType: "change"};
				}
			};
			VariantManagementState.updateVariantsState({
				reference: this.oComponent.name,
				changeToBeAddedOrDeleted: oChange,
				content: {}
			});

			assert.strictEqual(oCheckStub.callCount, 1, "the check function was called once");
			assert.deepEqual(oCheckStub.firstCall.args[0], ["variantMgmtId1"], "an array of references is passed");
		});

		QUnit.test("when calling 'getData'", function(assert) {
			var sExpectedJSON = '{"variantMgmtId1":' +
				'{' +
					'"currentVariant": "variant1",' +
					'"defaultVariant": "variant1",' +
					'"originalCurrentVariant": "variant1",' +
					'"originalDefaultVariant": "variant1",' +
					'"variants":[' +
						'{' +
							'"author":"' + VariantUtil.DEFAULT_AUTHOR + '",' +
							'"favorite":true,' +
							'"key":"variantMgmtId1",' +
							'"layer":"VENDOR",' +
							'"originalFavorite":true,' +
							'"originalTitle":"Standard",' +
							'"originalVisible":true,' +
							'"originalExecuteOnSelect":false,' +
							'"executeOnSelect":false,' +
							'"title":"Standard",' +
							'"visible":true,' +
							'"contexts":{},' +
							'"originalContexts":{}' +
						'},{"author":"Me","favorite":true,"key":"variant0","layer":"' + Layer.CUSTOMER + '","originalFavorite":true,"originalTitle":"variant A","originalVisible":true,"originalExecuteOnSelect":false,"executeOnSelect":false,"title":"variant A","visible":true, "contexts":{ "role": ["ADMINISTRATOR", "HR"], "country": ["DE"] }, "originalContexts":{ "role": ["ADMINISTRATOR", "HR"], "country": ["DE"] }},{"author":"Me","favorite":false,"key":"variant1","layer":"' + Layer.PUBLIC + '","originalFavorite":false,"originalTitle":"variant B","originalVisible":true,"originalExecuteOnSelect":true,"executeOnSelect":true,"title":"variant B","visible":true, "contexts":{ "role": ["ADMINISTRATOR"], "country": ["DE"] }, "originalContexts": { "role": ["ADMINISTRATOR"], "country": ["DE"] }},{"author":"Not Me","favorite":false,"key":"variant2","layer":"' + Layer.PUBLIC + '","originalFavorite":false,"originalTitle":"variant C","originalVisible":true,"originalExecuteOnSelect":true,"executeOnSelect":true,"title":"variant C","visible":true, "contexts": {}, "originalContexts": {}},{"author":"Me","favorite":false,"key":"variant3","layer":"' + Layer.USER + '","originalFavorite":false,"originalTitle":"variant D","originalVisible":true,"originalExecuteOnSelect":true,"executeOnSelect":true,"title":"variant D","visible":true, "contexts":{ "role": [], "country": [] }, "originalContexts":{ "role": [], "country": [] }}]}}';
			var sCurrentVariant = this.oModel.getCurrentVariantReference("variantMgmtId1");
			assert.deepEqual(this.oModel.getData(), JSON.parse(sExpectedJSON));
			assert.equal(sCurrentVariant, "variant1", "then the key of the current variant is returned");
		});

		QUnit.test("when calling 'setModelPropertiesForControl'", function(assert) {
			var done = assert.async();
			sandbox.stub(Settings, "getInstance").resolves({
				isVariantPersonalizationEnabled: function () {
					return false;
				}
			});
			this.oModel.getData()["variantMgmtId1"]._isEditable = true;
			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.ok(this.oModel.getData()["variantMgmtId1"].variantsEditable, "the parameter variantsEditable is initially true");
			assert.ok(this.oModel.getData()["variantMgmtId1"].variants[4].rename, "user variant can be renamed by default");
			assert.ok(this.oModel.getData()["variantMgmtId1"].variants[4].remove, "user variant can be removed by default");
			assert.ok(this.oModel.getData()["variantMgmtId1"].variants[4].change, "user variant can be changed by default");
			setTimeout(function() {
				assert.notOk(this.oModel.getData()["variantMgmtId1"].variants[4].rename, "user variant can not be renamed after flp setting is received");
				assert.notOk(this.oModel.getData()["variantMgmtId1"].variants[4].remove, "user variant can not be removed after flp setting is received");
				assert.notOk(this.oModel.getData()["variantMgmtId1"].variants[4].change, "user variant can not be changed after flp setting is received");
				done();
			}.bind(this), 0);
			this.oModel.setModelPropertiesForControl("variantMgmtId1", true, oDummyControl);
			assert.notOk(this.oModel.getData()["variantMgmtId1"].variantsEditable, "the parameter variantsEditable is set to false for bDesignTimeMode = true");
			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.ok(this.oModel.getData()["variantMgmtId1"].variantsEditable, "the parameter variantsEditable is set to true for bDesignTimeMode = false");
			Settings.getInstance.restore();
		});

		QUnit.test("when calling 'setModelPropertiesForControl' of a PUBLIC variant", function(assert) {
			var bIsKeyUser = false;
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isKeyUser: function () {
					return bIsKeyUser;
				}
			});
			this.oModel.getData()["variantMgmtId1"]._isEditable = true;
			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, true, "the parameter variantsEditable is true");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[2].rename, true, "a user can renamed its own PUBLIC variant");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[2].remove, true, "a user can removed its own PUBLIC variant");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[2].change, true, "a user can changed its own PUBLIC variant");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[3].rename, true, "a user can renamed another users PUBLIC variant in case the ushell user cannot be determined");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[3].remove, true, "a user can removed another users PUBLIC variant in case the ushell user cannot be determined");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[3].change, true, "a user can changed another users PUBLIC variant in case the ushell user cannot be determined");

			this.oModel._oUserInfoService = {
				getUser: function () {
					return {
						getId: function () {
							return "Me";
						}
					};
				}
			};

			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[3].rename, false, "a user cannot renamed another users PUBLIC variant");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[3].remove, false, "a user cannot removed another users PUBLIC variant");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[3].change, false, "a user cannot changed another users PUBLIC variant");

			bIsKeyUser = true;
			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[3].rename, true, "a key user can renamed another users PUBLIC variant");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[3].remove, true, "a key user can removed another users PUBLIC variant");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[3].change, true, "a eky user can changed another users PUBLIC variant");
			Settings.getInstanceOrUndef.restore();
		});

		QUnit.test("when calling 'setModelPropertiesForControl' and variant management control has property editable=false", function(assert) {
			this.oModel.getData()["variantMgmtId1"]._isEditable = false;
			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable is initially false");
			this.oModel.setModelPropertiesForControl("variantMgmtId1", true, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable stays false for bDesignTimeMode = true");
			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable stays false for bDesignTimeMode = false");
		});

		QUnit.test("when calling 'setModelPropertiesForControl' with updateVariantInURL = true", function(assert) {
			assert.expect(8);
			this.oModel.getData()["variantMgmtId1"]._isEditable = true;
			this.oModel.getData()["variantMgmtId1"].updateVariantInURL = true;
			this.oModel.getData()["variantMgmtId1"].currentVariant = "variant0";
			var iUpdateCallCount = 0;
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
				assert.strictEqual(mPropertyBag.model._bDesignTimeMode, iUpdateCallCount === 0, "then model's _bDesignTime property was set before URLHandler.update() was called");

				assert.deepEqual(mPropertyBag, mExpectedParameters, "then URLHandler.update() called with the correct parameters");
				iUpdateCallCount++;
			}.bind(this));
			sandbox.stub(URLHandler, "getStoredHashParams").returns(["currentHash1", "currentHash2"]);

			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");
			assert.strictEqual(this.oModel._bDesignTimeMode, false, "the model's _bDesignTimeMode property is initially false");

			this.oModel.setModelPropertiesForControl("variantMgmtId1", true, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");

			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 1, "then URLHandler.getStoredHashParams() called once");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' for a current variant reference", function(assert) {
			var done = assert.async();
			this.oData["variantMgmtId1"].currentVariant = "variant0";
			sandbox.stub(this.oModel, "updateCurrentVariant").callsFake(function(mPropertyBag) {
				assert.equal(mPropertyBag.variantManagementReference, "variantMgmtId1", "the correct variant management reference was passed");
				assert.equal(mPropertyBag.newVariantReference, this.oData["variantMgmtId1"].defaultVariant, "the correct variant reference was passed");
				return Promise.resolve().then(done);
			});
			this.oModel.switchToDefaultForVariant("variant0");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' for a variant reference which is not the current variant", function(assert) {
			sandbox.stub(this.oModel, "updateCurrentVariant").returns(Promise.resolve());
			this.oModel.switchToDefaultForVariant("variant0");
			assert.strictEqual(this.oModel.updateCurrentVariant.callCount, 0, "then VariantModel.updateCurrentVariant not called");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' without a variant reference", function(assert) {
			var done = assert.async();
			this.oData["dummy"] = {
				defaultVariant: "dummyDefaultVariant",
				currentVariant: "dummyCurrentVariant"
			};
			// currentVariant and defaultVariant should be different
			this.oData["variantMgmtId1"].currentVariant = "mockCurrentVariant";

			var aVariantManagementReferences = ["variantMgmtId1", "dummy"];

			sandbox.stub(this.oModel, "updateCurrentVariant").callsFake(function(mPropertyBag) {
				return Promise.resolve().then(function() {
					var iIndex = aVariantManagementReferences.indexOf(mPropertyBag.variantManagementReference);
					assert.equal(mPropertyBag.variantManagementReference, aVariantManagementReferences[iIndex], "the correct variant management reference was passed");
					assert.equal(mPropertyBag.newVariantReference, this.oData[aVariantManagementReferences[iIndex]].defaultVariant, "the correct variant reference was passed");
					aVariantManagementReferences.splice(iIndex, 1);
					if (aVariantManagementReferences.length === 0) {
						done();
					}
				}.bind(this));
			}.bind(this));
			this.oModel.switchToDefaultForVariant();
		});

		QUnit.test("when calling 'switchToDefaultForVariantManagement' for a variant management reference", function(assert) {
			// currentVariant and defaultVariant should be different
			this.oData["variantMgmtId1"].currentVariant = "mockCurrentVariant";
			sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
			this.oModel.switchToDefaultForVariantManagement("variantMgmtId1");
			assert.deepEqual(this.oModel.updateCurrentVariant.getCall(0).args[0], {
				variantManagementReference: "variantMgmtId1",
				newVariantReference: this.oData["variantMgmtId1"].defaultVariant
			}, "then VariantModel.updateCurrentVariant called once with the correct parameters");
		});

		QUnit.test("when calling 'getVariantManagementReference'", function(assert) {
			var mVariantManagementReference = this.oModel.getVariantManagementReference("variant1");
			assert.deepEqual(mVariantManagementReference, {
				variantIndex: 2,
				variantManagementReference: "variantMgmtId1"
			}, "then the correct variant management reference is returned");
		});

		QUnit.test("when calling 'getVariantTitle'", function(assert) {
			var sPropertyValue = this.oModel.getVariantTitle("variant1", "variantMgmtId1");
			assert.equal(sPropertyValue, this.oData["variantMgmtId1"].variants[2].title, "then the correct title value is returned");
		});

		QUnit.test("when calling 'addVariantChange' for 'setTitle' to add a change", function(assert) {
			var fnSetVariantDataStub = sandbox.stub(VariantManagementState, "setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var mPropertyBag = {
				changeType: "setTitle",
				title: "New Title",
				layer: Layer.CUSTOMER,
				variantReference: "variant1",
				appComponent: this.oComponent
			};

			var oChange = this.oModel.addVariantChange("variantMgmtId1", mPropertyBag);
			assert.equal(oChange.getText("title"), mPropertyBag.title, "then the new change created with the new title");
			assert.equal(oChange.getChangeType(), "setTitle", "then the new change created with 'setTitle' as changeType");
			assert.equal(oChange.getFileType(), "ctrl_variant_change", "then the new change created with 'ctrl_variant_change' as fileType");
			assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].title, mPropertyBag.title, "then the new title updated in the VariantModel");
			assert.equal(fnSetVariantDataStub.callCount, 1, "then VariantManagementState.setVariant() was called");
			assert.equal(fnUpdateChangesForVariantManagementInMap.callCount, 1, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'deleteVariantChange' for 'setTitle' to delete a change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var fnSetVariantDataStub = sandbox.stub(VariantManagementState, "setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			var fnChangeStub = sandbox.stub().returns({
				getDefinition: function() {}
			});
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var mPropertyBag = {
				changeType: "setTitle",
				title: "Old Title",
				variantReference: "variant1"
			};

			var oChange = this.oModel.deleteVariantChange("variantMgmtId1", mPropertyBag, fnChangeStub());
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(fnChangeStub()), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].title, mPropertyBag.title, "then the new title updated in the VariantModel");
			assert.equal(fnSetVariantDataStub.callCount, 1, "then VariantManagementState.setVariant() was called");
			assert.equal(fnUpdateChangesForVariantManagementInMap.callCount, 1, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'addVariantChange' for 'setFavorite' to add a change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var fnSetVariantDataStub = sandbox.stub(VariantManagementState, "setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			var mPropertyBag = {
				changeType: "setFavorite",
				favorite: false,
				layer: Layer.CUSTOMER,
				variantReference: "variant1",
				appComponent: this.oComponent
			};

			var oChange = this.oModel.addVariantChange("variantMgmtId1", mPropertyBag);
			assert.equal(oChange.getContent().favorite, mPropertyBag.favorite, "then the new change created with the parameter 'favorite' in content");
			assert.equal(oChange.getChangeType(), "setFavorite", "then the new change created with 'setFavorite' as changeType");
			assert.equal(oChange.getFileType(), "ctrl_variant_change", "then the new change created with 'ctrl_variant_change' as fileType");
			assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].favorite, mPropertyBag.favorite, "then the parameter 'favorite' updated in the VariantModel");
			assert.equal(fnSetVariantDataStub.callCount, 1, "then VariantManagementState.setVariant() was called");
			assert.equal(fnUpdateChangesForVariantManagementInMap.callCount, 1, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'deleteVariantChange' for 'setFavorite' to delete a change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var fnSetVariantDataStub = sandbox.stub(VariantManagementState, "setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			var fnChangeStub = sandbox.stub().returns({
				getDefinition: function() {}
			});
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var mPropertyBag = {
				changeType: "setFavorite",
				favorite: true,
				variantReference: "variant1"
			};

			var oChange = this.oModel.deleteVariantChange("variantMgmtId1", mPropertyBag, fnChangeStub());
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(fnChangeStub()), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].favorite, mPropertyBag.favorite, "then the parameter 'favorite' updated in the VariantModel");
			assert.equal(fnSetVariantDataStub.callCount, 1, "then VariantManagementState.setVariant() was called");
			assert.equal(fnUpdateChangesForVariantManagementInMap.callCount, 1, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'addVariantChange' for 'setVisible' to add a change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var fnSetVariantDataStub = sandbox.stub(VariantManagementState, "setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			var mPropertyBag = {
				changeType: "setVisible",
				visible: false,
				layer: Layer.CUSTOMER,
				variantReference: "variant1",
				appComponent: this.oComponent
			};

			var oChange = this.oModel.addVariantChange("variantMgmtId1", mPropertyBag);
			assert.equal(oChange.getContent().visible, mPropertyBag.visible, "then the new change created with the parameter 'visible' in content");
			assert.equal(oChange.getChangeType(), "setVisible", "then the new change created with 'setVisible' as changeType");
			assert.equal(oChange.getFileType(), "ctrl_variant_change", "then the new change created with 'ctrl_variant_change' as fileType");
			assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].visible, mPropertyBag.visible, "then the parameter 'visible' updated in the VariantModel");
			assert.equal(fnSetVariantDataStub.callCount, 1, "then VariantManagementState.setVariant() was called");
			assert.equal(fnUpdateChangesForVariantManagementInMap.callCount, 1, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'deleteVariantChange' for 'setVisible' to delete a change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var fnSetVariantDataStub = sandbox.stub(VariantManagementState, "setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			var fnChangeStub = sandbox.stub().returns({
				getDefinition: function() {}
			});
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var mPropertyBag = {
				changeType: "setVisible",
				visible: true,
				variantReference: "variant1"
			};

			var oChange = this.oModel.deleteVariantChange("variantMgmtId1", mPropertyBag, fnChangeStub());
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(fnChangeStub()), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].visible, mPropertyBag.visible, "then the parameter 'visible' updated in the VariantModel");
			assert.equal(fnSetVariantDataStub.callCount, 1, "then VariantManagementState.setVariant() was called");
			assert.equal(fnUpdateChangesForVariantManagementInMap.callCount, 1, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'addVariantChange' for 'setExecuteOnSelect' to add a change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var fnSetVariantDataStub = sandbox.stub(VariantManagementState, "setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(1);
			var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			var mPropertyBag = {
				changeType: "setExecuteOnSelect",
				executeOnSelect: true,
				layer: Layer.CUSTOMER,
				variantReference: "variant1",
				appComponent: this.oComponent
			};

			var oChange = this.oModel.addVariantChange("variantMgmtId1", mPropertyBag);
			assert.equal(oChange.getContent().executeOnSelect, mPropertyBag.executeOnSelect, "then the new change created with the parameter 'executeOnSelect' in content");
			assert.equal(oChange.getChangeType(), "setExecuteOnSelect", "then the new change created with 'setExecuteOnSelect' as changeType");
			assert.equal(oChange.getFileType(), "ctrl_variant_change", "then the new change created with 'ctrl_variant_change' as fileType");
			assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].executeOnSelect, mPropertyBag.executeOnSelect, "then the parameter 'executeOnSelect' updated in the VariantModel");
			assert.ok(fnSetVariantDataStub.calledOnce, "then '_setVariantData' of VariantController called");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'deleteVariantChange' for 'setExecuteOnSelect' to delete a change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var fnSetVariantDataStub = sandbox.stub(VariantManagementState, "setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(1);
			var fnChangeStub = sandbox.stub().returns({
				getDefinition: function() {}
			});
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var mPropertyBag = {
				changeType: "setExecuteOnSelect",
				executeOnSelect: false,
				variantReference: "variant1"
			};

			var oChange = this.oModel.deleteVariantChange("variantMgmtId1", mPropertyBag, fnChangeStub());
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(fnChangeStub()), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].executeOnSelect, mPropertyBag.executeOnSelect, "then the parameter 'executeOnSelect' updated in the VariantModel");
			assert.ok(fnSetVariantDataStub.callCount, 0, "then '_setVariantData' of VariantController not called");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'addVariantChange' for 'setDefault' to add a change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			var mPropertyBag = {
				changeType: "setDefault",
				defaultVariant: "variant0",
				layer: Layer.CUSTOMER,
				variantManagementReference: "variantMgmtId1",
				appComponent: this.oComponent
			};

			var oChange = this.oModel.addVariantChange("variantMgmtId1", mPropertyBag);
			assert.equal(oChange.getContent().defaultVariant, mPropertyBag.defaultVariant, "then the new change created with the parameter 'visible' in content");
			assert.equal(oChange.getChangeType(), "setDefault", "then the new change created with 'setDefault' as changeType");
			assert.equal(oChange.getFileType(), "ctrl_variant_management_change", "then the new change created with 'ctrl_variant_change' as fileType");
			assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].defaultVariant, mPropertyBag.defaultVariant, "then the parameter 'defaultVariant' updated in the VariantModel");
			assert.equal(fnUpdateChangesForVariantManagementInMap.callCount, 1, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'deleteVariantChange' for 'setDefault' to delete a change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			var fnChangeStub = sandbox.stub().returns({
				getDefinition: function() {}
			});
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var mPropertyBag = {
				changeType: "setDefault",
				defaultVariant: "variant1",
				variantManagementReference: "variantMgmtId1"
			};

			var oChange = this.oModel.deleteVariantChange("variantMgmtId1", mPropertyBag, fnChangeStub());
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(fnChangeStub()), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].defaultVariant, mPropertyBag.defaultVariant, "then the parameter 'defaultVariant' updated in the VariantModel");
			assert.equal(fnUpdateChangesForVariantManagementInMap.callCount, 1, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'deleteVariantChange' for 'setDefault' to delete a change while current variant is not the default variant", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			var fnChangeStub = sandbox.stub().returns({
				getDefinition: function() {}
			});
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var fnUpdateCurrentVariantStub = sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
			var mPropertyBag = {
				changeType: "setDefault",
				defaultVariant: "variant0",
				variantManagementReference: "variantMgmtId1"
			};

			var oChange = this.oModel.deleteVariantChange("variantMgmtId1", mPropertyBag, fnChangeStub());
			assert.ok(fnUpdateCurrentVariantStub.calledOnce, "then 'updateCurrentVariant' called");
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(fnChangeStub()), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].defaultVariant, mPropertyBag.defaultVariant, "then the parameter 'defaultVariant' updated in the VariantModel");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then VariantManagementState.updateChangesForVariantManagementInMap() was called");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' with different current and default variants, in UI adaptation mode", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var mPropertyBag = {
				changeType: "setDefault",
				defaultVariant: "variant1",
				layer: Layer.CUSTOMER,
				variantManagementReference: "variantMgmtId1",
				appComponent: this.oComponent,
				change: {
					getDefinition: function() {}
				}
			};
			sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			sandbox.stub(URLHandler, "getStoredHashParams").returns([]);
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			sandbox.stub(URLHandler, "update");

			// set adaptation mode true
			this.oModel._bDesignTimeMode = true;

			// mock current variant id to make it different
			this.oModel.oData["variantMgmtId1"].currentVariant = "variantCurrent";

			this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag);
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: [this.oModel.oData["variantMgmtId1"].currentVariant],
				updateURL: !this.oModel._bDesignTimeMode,
				updateHashEntry: true,
				model: this.oModel
			}), "then the URLHandler.update() called with the current variant id as a parameter in UI adaptation mode");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' with same current and default variants, in personalization mode", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns({instance: createVariant(this.oModel.oData["variantMgmtId1"].variants[2])});
			var mPropertyBag = {
				changeType: "setDefault",
				defaultVariant: "variant1",
				layer: Layer.CUSTOMER,
				variantManagementReference: "variantMgmtId1",
				appComponent: this.oComponent,
				change: {
					getDefinition: function() {}
				}
			};
			sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap").returns(true);
			// current variant already exists in hash parameters
			sandbox.stub(URLHandler, "getStoredHashParams").returns([this.oData["variantMgmtId1"].currentVariant]);
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			sandbox.stub(URLHandler, "update");

			// set adaptation mode false
			this.oModel._bDesignTimeMode = false;

			this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag);
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
			var oCallVariantSwitchListenersStub = sandbox.stub(this.oModel, "_callVariantSwitchListeners");

			assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant1", "then initially current variant was correct before updating");
			assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant1", "then initially original current variant was correct before updating");

			this.oModel.oData["variantMgmtId1"].updateVariantInURL = true;
			return this.oModel.updateCurrentVariant({
				variantManagementReference: "variantMgmtId1",
				newVariantReference: "variant0",
				appComponent: this.oModel.oAppComponent
			}).then(function() {
				assert.ok(Switcher.switchVariant.calledWith({
					vmReference: "variantMgmtId1",
					currentVReference: "variant1",
					newVReference: "variant0",
					flexController: this.oModel.oFlexController,
					appComponent: this.oModel.oAppComponent,
					modifier: JsControlTreeModifier,
					reference: this.oModel.sFlexReference
				}), "then ChangePersistence.loadSwitchChangesMapForComponent() called with correct parameters");
				assert.ok(oSetVariantSwitchPromiseStub.calledBefore(Switcher.switchVariant), "the switch variant promise was set before switching");
				assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant0", "then current variant was updated");
				assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant0", "then the original current variant was updated");
				assert.equal(oCallVariantSwitchListenersStub.callCount, 1, "the listeners were called");
			}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' without a root app component", function(assert) {
			sandbox.stub(Switcher, "switchVariant").resolves();
			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");

			this.oModel.oData["variantMgmtId1"].updateVariantInURL = true;
			return this.oModel.updateCurrentVariant({
				variantManagementReference: "variantMgmtId1",
				newVariantReference: "variant0"
			}).then(function() {
				assert.ok(Switcher.switchVariant.calledWith({
					vmReference: "variantMgmtId1",
					currentVReference: "variant1",
					newVReference: "variant0",
					flexController: this.oModel.oFlexController,
					appComponent: this.oModel.oAppComponent,
					modifier: JsControlTreeModifier,
					reference: this.oModel.sFlexReference
				}), "then ChangePersistence.loadSwitchChangesMapForComponent() called with correct parameters");
				assert.ok(oSetVariantSwitchPromiseStub.calledBefore(Switcher.switchVariant), "the switch variant promise was set before switching");
			}.bind(this));
		});

		QUnit.skip("when calling 'updateCurrentVariant' with dirty changes in current variant", function(assert) {
			sandbox.stub(VariantManagementState, "getControlChangesForVariant");

			this.oModel.oData["variantMgmtId1"].modified = true;
			assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant1", "then initially current variant is variant1");
			return this.oModel.updateCurrentVariant("variantMgmtId1", "variant0")
				.then(function() {
					assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant0", "then original current variant updated to variant0");
				}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' twice without waiting for the first one to be finished", function(assert) {
			assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant1", "then initially current variant was correct before updating");
			assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant1", "then initially original current variant was correct before updating");

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
				variantManagementReference: "variantMgmtId1",
				newVariantReference: "variant2",
				appComponent: this.oModel.oAppComponent
			});

			// second call
			return this.oModel.updateCurrentVariant({
				variantManagementReference: "variantMgmtId1",
				newVariantReference: "variant0",
				appComponent: this.oModel.oAppComponent
			})
			.then(this.oModel._oVariantSwitchPromise)
			.then(function() {
				assert.equal(oSwitchVariantStub.callCount, 2, "then Switcher.switchVariant() was called twice");
				assert.equal(oSetVariantSwitchPromiseStub.callCount, 2, "then variant switch promise was set twice inside FlexController");
				assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant0", "then current variant was updated");
				assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant0", "then the original current variant was updated");
			}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' twice without waiting for the first one to be failed and finished", function(assert) {
			assert.expect(11);
			var sVMReference = "variantMgmtId1";
			assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant1", "then initially current variant was correct before updating");
			assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant1", "then initially original current variant was correct before updating");

			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");
			var SwitchVariantStub = sandbox.stub(Switcher, "switchVariant")
				.onCall(0).callsFake(function() {
					assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, true, "then 'variantBusy' property was set before the first update call");
					return new Promise(function(resolve, reject) {
						setTimeout(reject, 0);
					});
				}.bind(this))
				.onCall(1).callsFake(function() {
					assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, true, "then 'variantBusy' property was set before the second update call");
					return Promise.resolve();
				}.bind(this));

			// first call with a Promise.reject()
			this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant2",
				appComponent: this.oModel.oAppComponent
			}).catch(function() {
				assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, false, "then 'variantBusy' property was unset after the first update call was rejected");
				assert.ok(true, "then the first promise was rejected");
			}.bind(this));

			// second call with a Promise.resolve()
			return this.oModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: "variant0",
				appComponent: this.oModel.oAppComponent
			}).then(function() {
				assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, false, "then 'variantBusy' property was unset after the second update call was resolved");
				assert.equal(SwitchVariantStub.callCount, 2, "then Switcher.switchVariant() was called twice");
				assert.equal(oSetVariantSwitchPromiseStub.callCount, 2, "then variant switch promise was set twice inside FlexController");
				assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant0", "then current variant was updated");
				assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant0", "then the original current variant was updated");
			}.bind(this));
		});

		QUnit.test("when calling '_ensureStandardVariantExists'", function(assert) {
			var oExpectedProperties = {
				mockVariantManagement: {
					defaultVariant: "mockVariantManagement",
					variants: [{
						instance: "variant",
						controlChanges: [],
						variantChanges: {}
					}],
					variantManagementChanges: {}
				}
			};
			var oExpectedVariant = {
				id: "mockVariantManagement",
				reference: "MyComponent",
				user: VariantUtil.DEFAULT_AUTHOR,
				variantManagementReference: "mockVariantManagement",
				variantName: oResourceBundle.getText("STANDARD_VARIANT_TITLE")
			};

			var oVariantModelResponse = {
				currentVariant: "mockVariantManagement",
				originalCurrentVariant: "mockVariantManagement",
				defaultVariant: "mockVariantManagement",
				originalDefaultVariant: "mockVariantManagement",
				variants: [{
					key: "mockVariantManagement",
					title: "Standard",
					originalTitle: "Standard",
					favorite: true,
					originalFavorite: true,
					visible: true,
					originalVisible: true,
					contexts: {},
					originalContexts: {},
					executeOnSelect: false,
					originalExecuteOnSelect: false,
					author: VariantUtil.DEFAULT_AUTHOR
				}]
			};

			var oAddFakeVariantStub = sandbox.stub(VariantManagementState, "addFakeStandardVariant");
			var oCreateVariantStub = sandbox.stub(FlexObjectFactory, "createFlVariant").returns("variant");
			this.oModel.setData({});
			var oVariantsMap = {};
			FlexState.getVariantsState.restore();
			sandbox.stub(FlexState, "getVariantsState").returns(oVariantsMap);
			this.oModel._ensureStandardVariantExists("mockVariantManagement");

			assert.deepEqual(this.oModel.oData["mockVariantManagement"], oVariantModelResponse, "then standard variant entry created for variant model");
			assert.strictEqual(oAddFakeVariantStub.callCount, 1, "a variant was added");
			assert.deepEqual(oAddFakeVariantStub.firstCall.args[2], oExpectedProperties, "the standard variant was added correctly");
			assert.strictEqual(oCreateVariantStub.callCount, 1, "a variant was created");
			assert.deepEqual(oCreateVariantStub.firstCall.args[0], oExpectedVariant, "the standard variant was created correctly");
		});

		QUnit.test("when calling 'copyVariant'", function(assert) {
			var oAddVariantStub = sandbox.stub(VariantManagementState, "addVariantToVariantManagement").returns(3);
			var oVariantData = {
				instance: createVariant({
					fileName: "variant0",
					variantManagementReference: "variantMgmtId1",
					variantReference: "",
					reference: "Dummy.Component",
					layer: Layer.CUSTOMER,
					title: "Text for TextDemo",
					author: ""
				}),
				controlChanges: [],
				variantChanges: {}
			};
			sandbox.stub(this.oModel, "_duplicateVariant").returns(oVariantData);
			sandbox.stub(JsControlTreeModifier, "getSelector").returns({id: "variantMgmtId1"});
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange").returnsArg(0);

			var mPropertyBag = {
				variantManagementReference: "variantMgmtId1",
				appComponent: this.oComponent,
				generator: "myFancyGenerator"
			};
			return this.oModel.copyVariant(mPropertyBag).then(function(aChanges) {
				assert.ok(oAddVariantStub.calledOnce, "then function to add variant to variants map was called");

				assert.ok(oAddVariantStub.calledWith({
					reference: this.oModel.sFlexReference,
					vmReference: "variantMgmtId1",
					variantData: oVariantData
				}), "then function to add variant to variants map was called");
				assert.equal(this.oModel.oData["variantMgmtId1"].variants[3].key, oVariantData.instance.getId(), "then variant added to VariantModel");
				assert.equal(aChanges[0].getId(), oVariantData.instance.getId(), "then the returned variant is the duplicate variant");
			}.bind(this));
		});

		QUnit.test("when calling 'removeVariant' with a component", function(assert) {
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var oChangeInVariant = {
				fileName: "change0",
				variantReference: "variant0",
				layer: Layer.VENDOR,
				getId: function() {
					return this.fileName;
				},
				getVariantReference: function() {
					return this.variantReference;
				}
			};
			var oVariant = {
				fileName: "variant0",
				getId: function() {
					return this.fileName;
				}
			};
			var aDummyDirtyChanges = [oVariant].concat(oChangeInVariant);

			var oRemoveVariantStub = sandbox.stub(VariantManagementState, "removeVariantFromVariantManagement").returns(2);
			var fnUpdateCurrentVariantSpy = sandbox.spy(this.oModel, "updateCurrentVariant");
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns(aDummyDirtyChanges);

			assert.equal(this.oModel.oData["variantMgmtId1"].variants.length, 5, "then initial length is 5");
			var mPropertyBag = {
				variant: oVariant,
				sourceVariantReference: "sourceVariant",
				variantManagementReference: "variantMgmtId1",
				component: this.oModel.oAppComponent
			};
			return this.oModel.removeVariant(mPropertyBag).then(function() {
				assert.equal(this.oModel.oData["variantMgmtId1"].variants.length, 4, "then one variant removed from VariantModel");
				assert.ok(oRemoveVariantStub.calledOnce, "then function to remove variant from variants map was called");
				assert.deepEqual(fnUpdateCurrentVariantSpy.getCall(0).args[0], {
					variantManagementReference: mPropertyBag.variantManagementReference,
					newVariantReference: mPropertyBag.sourceVariantReference,
					appComponent: mPropertyBag.component
				}, "then updateCurrentVariant() called with the correct parameters");
				assert.ok(fnDeleteChangeStub.calledTwice, "then ChangePersistence.deleteChange called twice");
				assert.ok(fnDeleteChangeStub.calledWith(oChangeInVariant), "then ChangePersistence.deleteChange called for change in variant");
				assert.ok(fnDeleteChangeStub.calledWith(oVariant), "then ChangePersistence.deleteChange called for variant");
				assert.ok(fnUpdateCurrentVariantSpy.calledBefore(oRemoveVariantStub), "then previous variant is reverted before removing the current variant");
			}.bind(this));
		});

		QUnit.test("when calling 'addChange'", function(assert) {
			var oAddVariantStub = sandbox.stub(VariantManagementState, "addChangeToVariant");
			var oChange = {
				fileName: "addedChange",
				getVariantReference: function() {
					return "variant1";
				},
				getState: function() {
					return Change.states.NEW;
				}
			};
			this.oModel.oData["variantMgmtId1"].modified = false;
			this.oModel.oData["variantMgmtId1"].variantsEditable = false;
			this.oModel.addChange(oChange);
			assert.ok(this.oModel.oData["variantMgmtId1"].modified, "then modified property is set to true");
			assert.strictEqual(oAddVariantStub.callCount, 1, "then function for adding change to variant was called once");
			assert.ok(oAddVariantStub.calledWith({
				change: oChange,
				vmReference: "variantMgmtId1",
				vReference: oChange.getVariantReference(),
				reference: this.oModel.sFlexReference
			}), "then function to add change to variant in variants map was called");
		});

		QUnit.test("when calling 'removeChange'", function(assert) {
			var oRemoveVariantStub = sandbox.stub(VariantManagementState, "removeChangeFromVariant");
			var oCheckDirtyStateSpy = sandbox.spy(this.oModel, "checkDirtyStateForControlModels");
			var oChange = {
				fileName: "ChangeToBeRemoved",
				getVariantReference: function() {
					return "variant1";
				}
			};
			this.oModel.removeChange(oChange);
			assert.equal(oRemoveVariantStub.callCount, 1, "then function for removing change from variant was called once");
			assert.ok(oRemoveVariantStub.calledWith({
				change: oChange,
				vmReference: "variantMgmtId1",
				vReference: oChange.getVariantReference(),
				reference: this.oModel.sFlexReference
			}), "then function to remove change from variant in variants map was called");
			assert.equal(oCheckDirtyStateSpy.callCount, 1, "then dirty state check has been called");
			assert.ok(oCheckDirtyStateSpy.calledWith(["variantMgmtId1"]), "then dirty state check has been called with the correct vm reference");
		});

		QUnit.test("when calling 'collectModelChanges'", function(assert) {
			this.oModel.getData()["variantMgmtId1"].variants[1].title = "test";
			this.oModel.getData()["variantMgmtId1"].variants[1].favorite = false;
			this.oModel.getData()["variantMgmtId1"].variants[1].visible = false;
			this.oModel.getData()["variantMgmtId1"].variants[1].executeOnSelect = true;
			this.oModel.getData()["variantMgmtId1"].variants[1].contexts = { role: ["ADMIN"], country: ["DE"] };
			this.oModel.getData()["variantMgmtId1"].defaultVariant = "variant0";

			var aChanges = this.oModel.collectModelChanges("variantMgmtId1", Layer.CUSTOMER);
			assert.equal(aChanges.length, 6, "then 6 changes with mPropertyBags were created");
		});

		QUnit.test("when calling 'manageVariants' in Adaptation mode once with changes and then without changes", function(assert) {
			var sVariantManagementReference = "variantMgmtId1";
			var oVariantManagement = new VariantManagement(sVariantManagementReference);
			var sLayer = Layer.CUSTOMER;
			var sDummyClass = "DummyClass";
			var oFakeComponentContainerPromise = {property: "fake"};
			oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);

			var oOpenManagementDialogStub = sandbox.stub(oVariantManagement, "openManagementDialog").callsFake(oVariantManagement.fireManage);
			sandbox.stub(VariantManagementState, "setVariantData");
			sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap");
			var oVariantInstance = createVariant(this.oModel.getData()[sVariantManagementReference].variants[1]);
			sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

			this.oModel.setModelPropertiesForControl(sVariantManagementReference, true, oVariantManagement);

			this.oModel.getData()[sVariantManagementReference].variants[1].title = "test";
			this.oModel.getData()[sVariantManagementReference].variants[1].favorite = false;
			this.oModel.getData()[sVariantManagementReference].variants[1].visible = false;
			this.oModel.getData()[sVariantManagementReference].defaultVariant = "variant0";

			return this.oModel.manageVariants(oVariantManagement, sVariantManagementReference, sLayer, sDummyClass, oFakeComponentContainerPromise).then(function(aChanges) {
				assert.equal(aChanges.length, 4, "then 4 changes were returned since changes were made in the manage dialog");
				aChanges.forEach(this.oModel.setVariantProperties.bind(this.oModel, sVariantManagementReference));
				assert.strictEqual(oVariantInstance.getName(), "test", "the title was changed");
				assert.strictEqual(oVariantInstance.getFavorite(), false, "the favorite was changed");
				assert.strictEqual(oVariantInstance.getVisible(), false, "the visible was changed");
				return this.oModel.manageVariants(oVariantManagement, sVariantManagementReference, sLayer).then(function(aChanges) {
					assert.equal(aChanges.length, 0, "then no changes were returned the since no changes were made in the manage dialog");
					assert.ok(oOpenManagementDialogStub.calledWith(true, sDummyClass, oFakeComponentContainerPromise), "then openManagementControl is called with the right parameters");
					oVariantManagement.destroy();
				});
			}.bind(this));
		});

		QUnit.test("when the VM Control fires the manage event in Personalization mode with dirty VM changes and UI Changes", function(assert) {
			var sVariantManagementReference = "variantMgmtId1";
			var oVariantManagement = new VariantManagement(sVariantManagementReference);
			oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);
			sandbox.stub(VariantManagementState, "setVariantData");
			sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap");
			var oVariantInstance = createVariant(this.oModel.getData()[sVariantManagementReference].variants[1]);
			sandbox.stub(this.oModel, "getVariant").returns({instance: oVariantInstance});

			this.oModel.getData()[sVariantManagementReference].variants[1].title = "test";
			this.oModel.getData()[sVariantManagementReference].variants[1].favorite = false;
			this.oModel.getData()[sVariantManagementReference].variants[1].visible = false;
			this.oModel.getData()[sVariantManagementReference].defaultVariant = "variant0";

			var oSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges");

			oVariantManagement.fireManage(null, {variantManagementReference: sVariantManagementReference});
			var aArgs = oSaveDirtyChangesStub.lastCall.args;
			assert.equal(aArgs[0], this.oComponent, "the app component was passed");
			assert.equal(aArgs[1], false, "the second parameter is false");
			assert.deepEqual(aArgs[2].length, 4, "an array with 4 changes was passed");
			aArgs[2].forEach(function(oChange) {
				assert.ok(oChange instanceof Change);
			});
			assert.strictEqual(oVariantInstance.getName(), "test", "the title was changed");
			assert.strictEqual(oVariantInstance.getFavorite(), false, "the favorite was changed");
			assert.strictEqual(oVariantInstance.getVisible(), false, "the visible was changed");
			oVariantManagement.destroy();
		});

		QUnit.test("when calling '_initializeManageVariantsEvents'", function(assert) {
			assert.notOk(this.oModel.fnManageClick, "the function 'this.fnManageClick' is not available before");
			assert.notOk(this.oModel.fnManageClickRta, "the function 'this.fnManageClickRta' is not available before");
			this.oModel._initializeManageVariantsEvents();
			assert.ok(this.oModel.fnManageClick, "the function 'this.fnManageClick' is available afterwards");
			assert.ok(this.oModel.fnManageClick, "the function 'this.fnManageClick' is available afterwards");
		});

		QUnit.test("when calling '_getDirtyChangesFromVariantChanges'", function(assert) {
			var oChange1 = new Change({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = new Change({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = new Change({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});
			oChange2.assignedToVariant = true;
			var aControlChanges = [oChange1, oChange2, oChange3];

			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns(aControlChanges);

			var aDirtyChanges = this.oModel._getDirtyChangesFromVariantChanges(aControlChanges);
			assert.equal(aDirtyChanges.length, 2, "only two of the given changes are returned as dirty by the model");
			assert.equal(aDirtyChanges[0].getFileName(), "change1", "change1 is dirty");
			assert.equal(aDirtyChanges[1].getFileName(), "change3", "change3 is dirty");
		});

		QUnit.test("when calling '_handleSaveEvent' with parameter from SaveAs button and default/execute box checked", function(assert) {
			var done = assert.async();
			var sVMReference = "variantMgmtId1";
			var oChange1 = new Change({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = new Change({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = new Change({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var sCopyVariantName = "variant1";
			var oCopiedVariantContent = {
				title: "Personalization Test Variant",
				variantManagementReference: sVMReference,
				variantReference: sCopyVariantName,
				layer: Layer.USER,
				contexts: {
					role: ["testRole"]
				}
			};
			var oCopiedVariant = createVariant(oCopiedVariantContent);
			var oEvent = {
				getParameters: function() {
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
				getSource: function() {
					return oVariantManagement;
				}
			};
			var sUserName = "testUser";
			var oResponse = {response: [{fileName: sCopyVariantName, support: {user: sUserName}}]};
			this.oModel.getData()[sVMReference].modified = true;

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(VariantManagementState, "getControlChangesForVariant")
				.callThrough()
				.withArgs({
					vmReference: sVMReference,
					vReference: this.oModel.oData[sVMReference].currentVariant,
					reference: this.oModel.sFlexReference
				})
				.returns([oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges")
				.callThrough()
				.onFirstCall()
				.returns([oCopiedVariant, oChange1, oChange2, oChange3]);
			sandbox.stub(VariantManagementState, "removeChangeFromVariant");
			sandbox.stub(this.oModel.oFlexController, "deleteChange");
			sandbox.stub(this.oModel, "copyVariant").resolves([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
			sandbox.stub(this.oModel, "addVariantChange").returns({fileName: "changeWithSetDefault"});
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);
			sandbox.spy(Utils, "createDefaultFileName");

			return this.oModel._handleSaveEvent(oEvent)
				.then(function() {
					var sNewVariantReference = Utils.createDefaultFileName.getCall(0).returnValue;
					assert.strictEqual(Utils.createDefaultFileName.getCall(0).args.length, 0, "then no argument was passed to sap.ui.fl.Utils.createDefaultFileName");
					assert.equal(this.oModel.copyVariant.called, 1, "then copyVariant() was called once");
					assert.deepEqual(this.oModel.copyVariant.lastCall.args[0], {
						appComponent: this.oComponent,
						layer: Layer.USER,
						generator: undefined,
						contexts: {
							role: ["testRole"]
						},
						newVariantReference: sNewVariantReference,
						sourceVariantReference: oCopiedVariant.getVariantReference(),
						title: "Test",
						variantManagementReference: sVMReference
					}, "then copyVariant() was called with the right parameters");

					assert.equal(this.oModel.addVariantChange.callCount, 2, "then addVariantChange() was called twice; for setDefault and setExecuteOnSelect");
					assert.equal(this.oModel.oChangePersistence.saveDirtyChanges.callCount, 1, "then dirty changes were saved");
					assert.equal(this.oModel.oChangePersistence.saveDirtyChanges.args[0][2].length, 6, "then six dirty changes were saved (new variant, 3 copied ctrl changes, setDefault change, setExecuteOnSelect change");
					assert.equal(this.oModel.oChangePersistence.saveDirtyChanges.args[0][2][4].fileName, "changeWithSetDefault", "the last change was 'setDefault'");
					assert.notOk(this.oModel.getData()[sVMReference].modified, "finally the model property 'modified' was set to false");
					assert.ok(this.oModel.oFlexController.deleteChange.calledBefore(this.oModel.oChangePersistence.saveDirtyChanges), "the changes were deleted from default variant before the copied variant wass saved");
					[oChange1, oChange2, oChange3].forEach(function(oDirtyChange) {
						assert.ok(VariantManagementState.removeChangeFromVariant.calledWith({
							change: oDirtyChange,
							vmReference: oCopiedVariantContent.variantManagementReference,
							vReference: oCopiedVariantContent.variantReference,
							reference: this.oModel.sFlexReference
						}), "then dirty changes were removed from the source variant");
						assert.ok(this.oModel.oFlexController.deleteChange.calledWith(oDirtyChange, this.oComponent), "then dirty changes from source variant were deleted from the persistence");
					}.bind(this));
					this.oModel.getData()[sVMReference].variants.forEach(function(oVariant) {
						if (oVariant.key === sCopyVariantName) {
							assert.equal(oVariant.author, sUserName, "then 'testUser' is add as author");
						}
					});
					oVariantManagement.destroy();
					done();
				}.bind(this));
		});

		QUnit.test("when calling '_handleSaveEvent' on a USER variant with setDefault, executeOnSelect and public boxes checked", function(assert) {
			var sVMReference = "variantMgmtId1";
			var oVariantManagement = new VariantManagement(sVMReference);
			var oCopiedVariant = createVariant({
				title: "Personalization Test Variant",
				variantManagementReference: sVMReference,
				variantReference: "variant1",
				layer: Layer.USER
			});
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves();
			var oCopyVariantStub = sandbox.stub(this.oModel, "copyVariant").resolves([oCopiedVariant]);
			var oAddVariantChangeStub = sandbox.stub(this.oModel, "addVariantChange").returns();
			var oEvent = {
				getParameters: function() {
					return {
						name: "Test",
						def: true,
						"public": true,
						execute: true
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			return this.oModel._handleSaveEvent(oEvent)
				.then(function() {
					assert.ok(
						oCopyVariantStub.calledOnceWith(sinon.match({
							layer: Layer.PUBLIC
						})),
						"then the variant is created on the PUBLIC layer"
					);
					assert.strictEqual(
						oAddVariantChangeStub.callCount,
						2,
						"then addVariantChange() was called twice; for setDefault and setExecuteOnSelect"
					);
					assert.ok(
						oAddVariantChangeStub.alwaysCalledWith(
							sVMReference,
							sinon.match({
								layer: Layer.USER
							})
						),
						"then the variant changes are created on the USER layer"
					);
					oVariantManagement.destroy();
				});
		});

		QUnit.test("when calling '_handleSaveEvent' with parameter from SaveAs button and default box unchecked", function(assert) {
			var done = assert.async();
			var sVMReference = "variantMgmtId1";
			var oChange1 = new Change({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = new Change({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = new Change({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var oCopiedVariantContent = {
				title: "Personalization Test Variant",
				variantManagementReference: sVMReference,
				variantReference: "variant1",
				layer: Layer.USER,
				contexts: {
					role: ["testRole"]
				}
			};
			var oCopiedVariant = createVariant(oCopiedVariantContent);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: false,
						name: "Test",
						def: false
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			this.oModel.getData()[sVMReference].modified = true;

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(VariantManagementState, "getControlChangesForVariant")
				.callThrough()
				.withArgs({
					vmReference: sVMReference,
					vReference: this.oModel.oData[sVMReference].currentVariant,
					reference: this.oModel.sFlexReference
				})
				.returns([oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges")
				.callThrough()
				.onFirstCall()
				.returns([oCopiedVariant, oChange1, oChange2, oChange3]);
			sandbox.stub(VariantManagementState, "removeChangeFromVariant");
			sandbox.stub(this.oModel.oFlexController, "deleteChange");
			sandbox.stub(this.oModel, "copyVariant").resolves([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
			sandbox.stub(this.oModel, "addVariantChange").returns({fileName: "changeWithSetDefault"});
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves();

			return this.oModel._handleSaveEvent(oEvent).then(function() {
				assert.equal(this.oModel.copyVariant.callCount, 1, "then copyVariant() was called once");
				assert.equal(this.oModel.addVariantChange.callCount, 0, "then addVariantChange() was not called");
				assert.equal(this.oModel.oChangePersistence.saveDirtyChanges.callCount, 1, "then dirty changes were saved");
				assert.notOk(this.oModel.getData()[sVMReference].modified, "finally the model property 'modified' is set to false");
				assert.ok(this.oModel.oFlexController.deleteChange.calledBefore(this.oModel.oChangePersistence.saveDirtyChanges), "the changes were deleted from default variant before the copied variant is saved");
				[oChange1, oChange2, oChange3].forEach(function(oDirtyChange) {
					assert.ok(VariantManagementState.removeChangeFromVariant.calledWith({
						change: oDirtyChange,
						vmReference: oCopiedVariantContent.variantManagementReference,
						vReference: oCopiedVariantContent.variantReference,
						reference: this.oModel.sFlexReference
					}), "then dirty changes were removed from the source variant");
					assert.ok(this.oModel.oFlexController.deleteChange.calledWith(oDirtyChange, this.oComponent), "then dirty changes from source variant were deleted from the persistence");
				}.bind(this));
				oVariantManagement.destroy();
				done();
			}.bind(this));
		});

		QUnit.test("when calling '_handleSaveEvent' with parameter from Save button, which calls 'checkDirtyStateForControlModels' later, with no dirty changes existing after Save", function(assert) {
			var sVMReference = "variantMgmtId1";
			var oChange1 = new Change({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = new Change({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: true,
						name: "Test"
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			this.oModel.getData()[sVMReference].modified = true;

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(VariantManagementState, "getControlChangesForVariant")
				.callThrough()
				.withArgs(sVMReference, this.oModel.oData[sVMReference].currentVariant, true)
				.returns([oChange1, oChange2]);
			var fnCopyVariantStub = sandbox.stub(this.oModel, "copyVariant");
			var fnSetVariantPropertiesStub = sandbox.stub(this.oModel, "setVariantProperties");
			var fnSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves();
			// only when getting it for the first time, second time they are asked when already saved
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges")
				.callThrough()
				.onFirstCall().returns([oChange1, oChange2]);

			return this.oModel._handleSaveEvent(oEvent).then(function() {
				assert.equal(fnCopyVariantStub.callCount, 0, "CopyVariant is not called");
				assert.equal(fnSetVariantPropertiesStub.callCount, 0, "SetVariantProperties is not called");
				assert.ok(fnSaveDirtyChangesStub.calledOnce, "SaveAll is called");
				assert.notOk(this.oModel.getData()[sVMReference].modified, "finally the model property 'modified' is set to false");
				oVariantManagement.destroy();
			}.bind(this));
		});

		QUnit.test("when calling the checkDirtyStateForControlModels check with newly added dirty changes", function (assert) {
			var sVMReference = "variantMgmtId1";
			var oChange1 = new Change({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});

			// Simulate that new dirty changes were added since the last check
			this.oModel.getData()[sVMReference].modified = false;
			sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns([oChange1]);
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns([oChange1]);

			this.oModel.checkDirtyStateForControlModels([sVMReference]);
			assert.ok(
				this.oModel.getData()[sVMReference].modified,
				"then the modified state is switched to true"
			);
		});

		QUnit.test("when calling '_handleSaveEvent' with bDesignTimeMode set to true", function(assert) {
			var done = assert.async();
			var sVMReference = "variantMgmtId1";
			var oVariantManagement = new VariantManagement(sVMReference);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: false,
						name: "Test",
						def: false
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			this.oModel._bDesignTimeMode = true;
			this.oModel.getData()[sVMReference].modified = true;

			var oHandleSaveSpy = sandbox.spy(this.oModel, "_handleSave");

			return this.oModel._handleSaveEvent(oEvent).then(function() {
				assert.equal(oHandleSaveSpy.callCount, 0, "then _handleSave() was not called");
				oVariantManagement.destroy();
				done();
			});
		});

		QUnit.test("when calling '_handleSave' with with bDesignTimeMode set to true and parameters from SaveAs button and default/execute box checked", function(assert) {
			var done = assert.async();
			var sVMReference = "variantMgmtId1";
			var sNewVariantReference = "variant2";
			var oChange1 = new Change({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = new Change({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = new Change({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var sCopyVariantName = "variant1";
			var oCopiedVariantContent = {
				title: "Key User Test Variant",
				variantManagementReference: sVMReference,
				variantReference: sCopyVariantName,
				layer: Layer.CUSTOMER
			};
			var oCopiedVariant = createVariant(oCopiedVariantContent);
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
			this.oModel.getData()[sVMReference].modified = true;
			this.oModel._bDesignTimeMode = true;

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(VariantManagementState, "getControlChangesForVariant")
				.callThrough()
				.withArgs({
					vmReference: sVMReference,
					vReference: this.oModel.oData[sVMReference].currentVariant,
					reference: this.oModel.sFlexReference
				})
				.returns([oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns([oCopiedVariant, oChange1, oChange2, oChange3]);
			sandbox.stub(VariantManagementState, "removeChangeFromVariant");
			sandbox.stub(this.oModel.oFlexController, "deleteChange");
			sandbox.stub(this.oModel, "copyVariant").resolves([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
			sandbox.stub(this.oModel, "addVariantChange").returns({fileName: "changeWithSetDefault"});
			sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves(oResponse);
			sandbox.spy(Utils, "createDefaultFileName");

			return this.oModel._handleSave(oVariantManagement, mParameters)
				.then(function(aDirtyChanges) {
					assert.equal(this.oModel.copyVariant.called, 1, "then copyVariant() was called once");
					assert.deepEqual(this.oModel.copyVariant.lastCall.args[0], {
						appComponent: this.oComponent,
						layer: Layer.CUSTOMER,
						generator: "myFancyGenerator",
						newVariantReference: sNewVariantReference,
						sourceVariantReference: oCopiedVariant.getVariantReference(),
						title: "Key User Test Variant",
						variantManagementReference: sVMReference,
						contexts: {
							role: ["testRole"]
						}
					}, "then copyVariant() was called with the right parameters");
					assert.equal(this.oModel.addVariantChange.callCount, 2, "then addVariantChange() was called twice; for setDefault and setExecuteOnSelect");
					assert.equal(this.oModel.oChangePersistence.saveDirtyChanges.callCount, 0, "then dirty changes were not saved");
					assert.equal(aDirtyChanges.length, 6, "then six dirty changes were created (new variant, 3 copied ctrl changes, setDefault change, setExecuteOnSelect change");
					assert.equal(aDirtyChanges[5].fileName, "changeWithSetDefault", "the last change was 'setDefault'");
					assert.equal(aDirtyChanges[0].getLayer(), Layer.CUSTOMER, "the ctrl change has the correct layer");
					assert.notOk(this.oModel.getData()[sVMReference].modified, "finally the model property 'modified' was set to false");
					assert.ok(this.oModel.oFlexController.deleteChange.calledBefore(this.oModel.oChangePersistence.saveDirtyChanges), "the changes were deleted from default variant before the copied variant wass saved");
					[oChange1, oChange2, oChange3].forEach(function(oDirtyChange) {
						assert.ok(VariantManagementState.removeChangeFromVariant.calledWith({
							change: oDirtyChange,
							vmReference: oCopiedVariantContent.variantManagementReference,
							vReference: oCopiedVariantContent.variantReference,
							reference: this.oModel.sFlexReference
						}), "then dirty changes were removed from the source variant");
						assert.ok(this.oModel.oFlexController.deleteChange.calledWith(oDirtyChange, this.oComponent), "then dirty changes from source variant were deleted from the persistence");
					}.bind(this));
					oVariantManagement.destroy();
					done();
				}.bind(this));
		});

		QUnit.test("when calling '_getVariantTitleCount' with a title having 2 occurrences", function(assert) {
			this.oModel.oData["variantMgmtId1"].variants.push({
				title: "SampleTitle Copy(5)",
				visible: true
			}, {
				title: "SampleTitle Copy(5)",
				visible: true
			});
			assert.strictEqual(this.oModel._getVariantTitleCount("SampleTitle Copy(5)", "variantMgmtId1"), 2, "then 2 occurrences returned");
			this.oModel.oData["variantMgmtId1"].variants.splice(3, 1);
		});

		QUnit.test("when calling '_getVariantTitleCount' with a title having 4 occurrences with different cases of characters", function(assert) {
			this.oModel.oData["variantMgmtId1"].variants.push({
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
			assert.strictEqual(this.oModel._getVariantTitleCount("TeSt", "variantMgmtId1"), 4, "then 4 occurrences returned");
			this.oModel.oData["variantMgmtId1"].variants.splice(3, 4);
		});

		QUnit.test("when calling 'getVariant' without a variant management reference", function(assert) {
			sandbox.stub(VariantManagementState, "getVariant").callsFake(function() {
				assert.ok(this.oModel.getVariantManagementReference.calledOnce, "then variant management reference calculated");
				assert.equal(arguments[0].vmReference, "varMgmtRef", "then correct variant management reference received");
				assert.equal(arguments[0].vReference, "varRef", "then correct variant reference received");
			}.bind(this));
			sandbox.stub(this.oModel, "getVariantManagementReference").returns({
				variantManagementReference: "varMgmtRef"
			});
			this.oModel.getVariant("varRef");
		});

		QUnit.test("when 'getCurrentControlVariantIds' is called to get all current variant references", function(assert) {
			this.oData = {
				variantManagementRef1: {
					currentVariant: "currentVariantRef1"
				},
				variantManagementRef2: {
					currentVariant: "currentVariantRef2"
				}
			};
			this.oModel.setData(this.oData);
			assert.deepEqual(
				this.oModel.getCurrentControlVariantIds(),
				[this.oData["variantManagementRef1"]["currentVariant"], this.oData["variantManagementRef2"]["currentVariant"]],
				"then the function returns an array current variant references"
			);
		});

		QUnit.test("when 'getCurrentControlVariantIds' is called with no variant model data", function(assert) {
			this.oModel.setData({});
			assert.deepEqual(this.oModel.getCurrentControlVariantIds(), [], "then the function returns an empty array");
		});
	});

	QUnit.module("_duplicateVariant", {
		beforeEach: function() {
			sandbox.stub(VariantManagementState, "fillVariantModel").returns({});
			this.oModel = new VariantModel({}, {flexController: {_oChangePersistence: {getComponentName: function() {}}}, appComponent: {getId: function() {}}});

			var oChange0 = new Change({
				fileName: "change0",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.CUSTOMER,
				support: {},
				reference: "test.Component",
				packageName: "MockPackageName"
			});
			var oChange1 = new Change({
				fileName: "change1",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.USER,
				reference: "test.Component"
			});
			this.oSourceVariant = {
				instance: createVariant({
					fileName: "variant0",
					title: "foo",
					variantManagementReference: "variantMgmtId1",
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
			sandbox.stub(VariantManagementState, "removeUpdateStateListener");
			sandbox.stub(VariantManagementState, "clearFakedStandardVariants");

			return this.oModel.initialize();
		},
		afterEach: function() {
			this.oModel.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_duplicateVariant' on the same layer", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
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
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getDefinition().support.sourceChangeFileName, "change0", "the sourceChangeFileName is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges[1].getDefinition().support.sourceChangeFileName, "change1", "the sourceChangeFileName is correct");
		});

		QUnit.test("when calling '_duplicateVariant' from USER layer referencing a CUSTOMER layer variant", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
				layer: Layer.USER,
				reference: "myReference",
				title: "variant A Copy",
				contexts: {
					role: ["testRole2"]
				}
			};

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.USER, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "variant0", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 1, "one change was copied");
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getDefinition().support.sourceChangeFileName, "change1", "the sourceChangeFileName is correct");
		});

		QUnit.test("when calling '_duplicateVariant' from PUBLIC layer referencing a USER layer variant", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
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
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getDefinition().support.sourceChangeFileName, "change1", "the sourceChangeFileName is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getLayer(), Layer.PUBLIC, "the layer is correct");
		});

		QUnit.test("when calling '_duplicateVariant' from USER layer referencing a PUBLIC layer variant", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
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
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getDefinition().support.sourceChangeFileName, "change1", "the sourceChangeFileName is correct");
		});

		QUnit.test("when calling '_duplicateVariant' from PUBLIC layer referencing a USER layer variant, that references a PUBLIC layer variant", function(assert) {
			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
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
						getLayer: function() {return Layer.PUBLIC;},
						getVariantReference: function() {return "publicVariantReference";}
					}
				};
			}.bind(this));

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.strictEqual(oDuplicateVariant.instance.getName(), "variant A Copy", "the name is correct");
			assert.strictEqual(oDuplicateVariant.instance.getId(), "newVariant", "the id is correct");
			assert.strictEqual(oDuplicateVariant.instance.getLayer(), Layer.PUBLIC, "the layer is correct");
			assert.deepEqual(oDuplicateVariant.instance.getContexts(), {role: ["testRole2"]}, "the contexts object is correct");
			assert.strictEqual(oDuplicateVariant.instance.getVariantReference(), "publicVariantReference", "the variantReference is correct");
			assert.strictEqual(oDuplicateVariant.controlChanges.length, 1, "one change was copied");
			assert.strictEqual(oDuplicateVariant.controlChanges[0].getDefinition().support.sourceChangeFileName, "change1", "the sourceChangeFileName is correct");
		});
	});

	QUnit.module("Given a VariantModel with no data and a VariantManagement control", {
		before: function() {
			return FlexState.initialize({
				reference: "MyComponent",
				componentId: "RTADemoAppMD",
				componentData: {},
				manifest: {}
			});
		},
		beforeEach: function() {
			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};
			var oManifest = new Manifest(oManifestObj);
			this.oVariantManagement = new VariantManagement("varMgmtRef1");
			var oComponent = {
				name: "MyComponent",
				getId: function() {
					return "RTADemoAppMD";
				},
				getManifest: function() {
					return oManifest;
				},
				getLocalId: function(sId) {
					if (sId === this.oVariantManagement.getId()) {
						return "varMgmtRef1";
					}
					return null;
				}.bind(this)
			};

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("MyComponent");
			sandbox.stub(FlexState, "getVariantsState").returns({});
			this.fnGetAppComponentForControlStub = sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			this.oFlexController = FlexControllerFactory.createForControl(oComponent, oManifest);
			this.fnApplyChangesStub = sandbox.stub(this.oFlexController, "saveSequenceOfDirtyChanges").resolves();
			this.oRegisterControlStub = sandbox.stub(URLHandler, "registerControl");

			sandbox.stub(VariantManagementState, "fillVariantModel").returns(this.oData);
			sandbox.stub(VariantManagementState, "getInitialChanges").returns([]);

			this.oModel = new VariantModel({}, {
				flexController: this.oFlexController,
				appComponent: oComponent
			});

			return this.oModel.initialize();
		},
		afterEach: function() {
			sandbox.restore();
			this.oModel.destroy();
			this.oVariantManagement.destroy();
			delete this.oFlexController;
		},
		after: function() {
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when calling 'setModel' of VariantManagement control", function(assert) {
			var fnRegisterToModelSpy = sandbox.spy(this.oModel, "registerToModel");
			sandbox.stub(this.oModel, "getVariantManagementReferenceForControl").returns("varMgmtRef1");
			this.oVariantManagement.setExecuteOnSelectionForStandardDefault(true);
			this.oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);

			assert.ok(fnRegisterToModelSpy.calledOnce, "then registerToModel called once, when VariantManagement control setModel is called");
			assert.ok(fnRegisterToModelSpy.calledWith(this.oVariantManagement), "then registerToModel called with VariantManagement control");
			assert.ok(this.oModel.oData["varMgmtRef1"].init, "the init flag is set");
			assert.equal(this.oModel.oData["varMgmtRef1"].showExecuteOnSelection, false, "showExecuteOnSelection is set to false");
		});

		QUnit.test("when waitForVMControlInit is called before the control is initialized", function(assert) {
			var done = assert.async();
			var oData = {
				varMgmtRef1: {
					defaultVariant: "variant1",
					originalDefaultVariant: "variant1",
					variants: [
						{
							author: VariantUtil.DEFAULT_AUTHOR,
							key: "varMgmtRef1",
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
			this.oModel.waitForVMControlInit("varMgmtRef1").then(function() {
				assert.ok(true, "the function resolves");
				done();
			});
			this.oModel.registerToModel(this.oVariantManagement);
		});

		QUnit.test("when waitForVMControlInit is called after the control is initialized", function(assert) {
			var oData = {
				varMgmtRef1: {
					defaultVariant: "variant1",
					originalDefaultVariant: "variant1",
					variants: [
						{
							author: VariantUtil.DEFAULT_AUTHOR,
							key: "varMgmtRef1",
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
			return this.oModel.waitForVMControlInit("varMgmtRef1").then(function() {
				assert.ok(true, "the function resolves");
			});
		});

		QUnit.test("when waitForVMControlInit is called before the control is initialized and with no variant data yet", function(assert) {
			var oStandardVariant = {
				currentVariant: "varMgmtRef1",
				originalCurrentVariant: "varMgmtRef1",
				defaultVariant: "varMgmtRef1",
				originalDefaultVariant: "varMgmtRef1",
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
					key: "varMgmtRef1",
					title: "Standard",
					originalTitle: "Standard",
					favorite: true,
					originalFavorite: true,
					visible: true,
					originalVisible: true,
					executeOnSelect: false,
					originalExecuteOnSelect: false,
					author: VariantUtil.DEFAULT_AUTHOR,
					sharing: "public",
					contexts: {},
					originalContexts: {}
				}]
			};
			var oReturnPromise = this.oModel.waitForVMControlInit("varMgmtRef1").then(function() {
				assert.ok(true, "the function resolves");
				assert.deepEqual(oStandardVariant, this.oModel.oData["varMgmtRef1"], "the standard variant is properly set");
			}.bind(this));
			this.oModel.registerToModel(this.oVariantManagement);

			return oReturnPromise;
		});

		QUnit.test("when variant management controls are initialized with with 'updateVariantInURL' property set and default (false)", function(assert) {
			this.oRegisterControlStub.resetHistory();
			var oVariantManagementWithURLUpdate = new VariantManagement("varMgmtRef2", {updateVariantInURL: true});
			this.oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);
			oVariantManagementWithURLUpdate.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);
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
			assert.strictEqual(this.oModel.getVariantManagementReferenceForControl(this.oVariantManagement), this.oVariantManagement.getId(), "then control's id is returned");
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control with no app component prefix", function(assert) {
			assert.strictEqual(this.oModel.getVariantManagementReferenceForControl({
				getId: function() {
					return "mockControl";
				}
			}), "mockControl", "then control's id is returned");
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control with an app component prefix", function(assert) {
			assert.strictEqual(this.oModel.getVariantManagementReferenceForControl(this.oVariantManagement), "varMgmtRef1", "then the local id of the control is retuned");
		});

		QUnit.test("when 'save' event event is triggered from a variant management control for a new variant, when variant model is busy", function(assert) {
			var done = assert.async();
			var fnSwitchPromiseStub = sandbox.stub();

			this.oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);
			this.oVariantManagement.attachEventOnce("save", function() {
				this.oModel._oVariantSwitchPromise.then(function() {
					// resolved when variant model is not busy anymore
					assert.ok(fnSwitchPromiseStub.calledOnce, "then first the previous variant switch was performed completely");
					assert.ok(this.oFlexController.saveSequenceOfDirtyChanges.getCall(0).args[0][0].getName(), "variant created title", "then the required variant change was saved");
					done();
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
			var done = assert.async();
			var sVMReference = "varMgmtRef1";
			var fnSwitchPromiseStub = sandbox.stub();

			var oDirtyChange1 = new Change({fileName: "newChange1"});
			var oDirtyChange2 = new Change({fileName: "newChange2"});
			this.oFlexController._oChangePersistence.addDirtyChange(oDirtyChange1);
			this.oFlexController._oChangePersistence.addDirtyChange(oDirtyChange2);

			sandbox.stub(VariantManagementState, "getControlChangesForVariant")
				.callThrough()
				.withArgs({
					vmReference: sVMReference,
					vReference: sVMReference,
					reference: this.oModel.sFlexReference
				})
				.returns([oDirtyChange1, oDirtyChange2]);

			this.oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);

			this.oVariantManagement.attachEventOnce("save", function() {
				this.oModel._oVariantSwitchPromise.then(function() {
					// resolved when variant model is not busy anymore
					assert.ok(fnSwitchPromiseStub.calledOnce, "then first the previous variant switch was performed completely");
					assert.deepEqual(this.oFlexController.saveSequenceOfDirtyChanges.getCall(0).args[0], [oDirtyChange1, oDirtyChange2], "then the control changes inside the variant were saved");
					done();
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

		QUnit.test("when 'save' event is triggered from a variant management control for a new variant, with another update variant call being triggered in parallel", function(assert) {
			var done = assert.async();
			assert.expect(4);
			var sVMReference = "varMgmtRef1";
			sandbox.stub(Reverter, "revertMultipleChanges");

			this.oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);

			Reverter.revertMultipleChanges.onFirstCall().callsFake(function() {
				assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, true, "then 'variantBusy' property is set");
				// make second update call to set variant model busy, when the first call is still in process
				this.oModel.updateCurrentVariant({
					variantManagementReference: sVMReference,
					newVariantReference: sVMReference
				}).then(function() {
					assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, false, "then 'variantBusy' property is unset");
					done();
				}.bind(this));
				return Promise.resolve();
			}.bind(this));

			Reverter.revertMultipleChanges.onSecondCall().callsFake(function() {
				assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, true, "then 'variantBusy' property is set");
				// on second call check if the first call was completed successfully
				assert.ok(this.oFlexController.saveSequenceOfDirtyChanges.getCall(0).args[0][0].getName(), "variant created title", "then a variant change was saved before the second update call was executed");
				return Promise.resolve();
			}.bind(this));

			this.oVariantManagement.fireSave({
				name: "variant created title",
				overwrite: false,
				def: false
			});
		});
	});

	QUnit.module("Given a variant management control in personalization mode", {
		beforeEach: function() {
			return FlexState.initialize({
				reference: "MockController.Component",
				componentId: "testComponent",
				componentData: {},
				manifest: {}
			}).then(function() {
				var oView;
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
					createContent: function() {
						oView = new XMLView({
							viewName: "sap.ui.test.VariantManagementTestApp",
							id: this.createId("mockview")
						});
						var oApp = new App(oView.createId("mockapp"));
						oApp.addPage(oView);
						return oApp;
					}
				});

				this.oComp = new MockComponent({id: "testComponent"});
				this.oView = oView;
				this.oFlexController = ChangesController.getFlexControllerInstance(this.oComp);
				this.oVariantModel = new VariantModel({}, {
					flexController: this.oFlexController,
					appComponent: this.oComp
				});
				return this.oVariantModel.initialize();
			}.bind(this)).then(function() {
				this.oComp.setModel(this.oVariantModel, Utils.VARIANT_MODEL_NAME);
				this.sVMReference = "mockview--VariantManagement1";

				var oData = this.oVariantModel.getData();
				oData[this.sVMReference].defaultVariant = "variant1";
				oData[this.sVMReference].originalDefaultVariant = "variant1";
				oData[this.sVMReference].currentVariant = "variant1";
				oData[this.sVMReference].originalCurrentVariant = "variant1";
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
				sandbox.stub(this.oVariantModel, "updateCurrentVariant").resolves();
				sandbox.stub(VariantManagementState, "removeChangeFromVariant");
				sandbox.stub(VariantManagementState, "getCurrentVariantReference").returns("variant1");
				sandbox.stub(VariantManagementState, "getControlChangesForVariant");
				sandbox.stub(this.oVariantModel.oFlexController, "deleteChange");
				sandbox.stub(this.oVariantModel.oChangePersistence, "getDirtyChanges");
				sandbox.stub(Switcher, "switchVariant").resolves();
				sandbox.stub(Reverter, "revertMultipleChanges").resolves();

				this.oVariantModel.setData(oData);
				this.oVariantModel.checkUpdate(true);

				this.oCompContainer = new ComponentContainer("ComponentContainer", {
					component: this.oComp
				}).placeAt("qunit-fixture");
				oCore.applyChanges();
			}.bind(this));
		},
		afterEach: function() {
			this.oCompContainer.destroy();
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		function clickOnVMControl(oVMControl) {
			// to create variant list control - inside variant management control's popover
			oVMControl.getDomRef().click();
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
			var done = assert.async();
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "_callVariantSwitchListeners");
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = oCore.byId(sVMControlId);

			oVMControl.attachEventOnce("select", function(oEvent) {
				var sSelectedVariantReference = oEvent.getParameters().key;
				this.oVariantModel.updateCurrentVariant.onFirstCall().callsFake(function(mPropertyBag) {
					// update call will make variant model busy, which will be resolved after the whole update process has taken place
					this.oVariantModel._oVariantSwitchPromise.then(function() {
						assert.equal(oCallListenerStub.callCount, 0, "the listeners are not notified again");
						assert.deepEqual(mPropertyBag, {
							variantManagementReference: sSelectedVariantReference,
							newVariantReference: this.sVMReference,
							appComponent: this.oComp,
							internallyCalled: true
						}, "then variant switch was performed");
						assert.ok(Reverter.revertMultipleChanges.notCalled, "then variant was not reverted explicitly");
						assert.ok(VariantManagementState.removeChangeFromVariant.notCalled, "then dirty changes were not removed from the source variant");
						assert.ok(this.oVariantModel.oFlexController.deleteChange.notCalled, "then no dirty changes were deleted");
						done();
					}.bind(this));
					return Promise.resolve();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 0);
		});

		QUnit.test("when the control is switched to a new variant with unsaved personalization changes", function(assert) {
			var done = assert.async();
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "_callVariantSwitchListeners");
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = oCore.byId(sVMControlId);
			var sSourceVariantId = this.oVariantModel.oData[this.sVMReference].currentVariant;

			this.oVariantModel.oData[this.sVMReference].modified = true;
			var aMockDirtyChanges = [new Change({fileName: "dirtyChange1"}), new Change({fileName: "dirtyChange2"})];
			VariantManagementState.getControlChangesForVariant.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function(oEvent) {
				var sTargetVariantId = oEvent.getParameters().key;
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.equal(oCallListenerStub.callCount, 0, "the listeners are not notified again");
					assert.deepEqual(this.oVariantModel.updateCurrentVariant.getCall(0).args[0], {
						variantManagementReference: sTargetVariantId,
						newVariantReference: this.sVMReference,
						appComponent: this.oComp,
						internallyCalled: true
					}, "then variant switch was performed");
					assert.ok(Reverter.revertMultipleChanges.notCalled, "then variant was not reverted explicitly");
					assert.strictEqual(this.oVariantModel.oData[this.sVMReference].modified, false);

					aMockDirtyChanges.forEach(function(oDirtyChange) {
						assert.ok(VariantManagementState.removeChangeFromVariant.calledWith({
							change: oDirtyChange,
							vmReference: this.sVMReference,
							vReference: sSourceVariantId,
							reference: this.oVariantModel.sFlexReference
						}), "then a dirty change was removed from the variant");
						assert.ok(this.oVariantModel.oFlexController.deleteChange.calledWith(oDirtyChange, this.oComp), "then a dirty change was deleted from the persistence");
					}.bind(this));
					done();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 0);
		});

		QUnit.test("when the control is switched to the same variant with no unsaved personalization changes", function(assert) {
			var done = assert.async();
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "_callVariantSwitchListeners");
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = oCore.byId(sVMControlId);

			var aMockDirtyChanges = [new Change({fileName: "dirtyChange1"}), new Change({fileName: "dirtyChange2"})];
			VariantManagementState.getControlChangesForVariant.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function() {
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.equal(oCallListenerStub.callCount, 1, "the listeners are notified");
					assert.equal(oCallListenerStub.lastCall.args[0], this.sVMReference, "the function is called with the correct parameters");
					assert.equal(oCallListenerStub.lastCall.args[1], "variant1", "the function is called with the correct parameters");
					assert.ok(this.oVariantModel.updateCurrentVariant.notCalled, "then variant switch was not performed");
					assert.ok(VariantManagementState.removeChangeFromVariant.notCalled, "then dirty changes were not removed from the variant");
					assert.ok(this.oVariantModel.oFlexController.deleteChange.notCalled, "then dirty changes were not deleted from the persistence");
					done();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 1);
		});

		QUnit.test("when the control is switched to the same variant with unsaved personalization changes", function(assert) {
			var done = assert.async();
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = oCore.byId(sVMControlId);
			var oCallListenerStub = sandbox.stub(this.oVariantModel, "_callVariantSwitchListeners");

			this.oVariantModel.oData[this.sVMReference].modified = true;
			var aMockDirtyChanges = [new Change({fileName: "dirtyChange1"}), new Change({fileName: "dirtyChange2"})];
			VariantManagementState.getControlChangesForVariant.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function(oEvent) {
				var sTargetVariantId = oEvent.getParameters().key;
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.equal(oCallListenerStub.callCount, 1, "the listeners are notified");
					assert.equal(oCallListenerStub.lastCall.args[0], this.sVMReference, "the function is called with the correct parameters");
					assert.equal(oCallListenerStub.lastCall.args[1], "variant1", "the function is called with the correct parameters");
					assert.ok(this.oVariantModel.updateCurrentVariant.notCalled, "then variant switch was not performed");
					// the order of the changes should be reversed on revertMultipleChanges (change2, change1)
					assert.ok(Reverter.revertMultipleChanges.calledWith(aMockDirtyChanges.reverse(), {
						appComponent: this.oComp,
						modifier: JsControlTreeModifier,
						flexController: this.oFlexController
					}), "then variant was reverted in correct order");
					assert.strictEqual(this.oVariantModel.oData[this.sVMReference].modified, false);

					aMockDirtyChanges.forEach(function(oDirtyChange) {
						assert.ok(VariantManagementState.removeChangeFromVariant.calledWith({
							change: oDirtyChange,
							vmReference: this.sVMReference,
							vReference: sTargetVariantId,
							reference: this.oVariantModel.sFlexReference
						}), "then a dirty change was removed from the variant");
						assert.ok(this.oVariantModel.oFlexController.deleteChange.calledWith(oDirtyChange, this.oComp), "then a dirty change was deleted from the persistence");
					}.bind(this));

					done();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 1);
		});

		QUnit.test("when 'attachVariantApplied' is called with callAfterInitialVariant=false", function(assert) {
			var sVMControlId = "testComponent---mockview--VariantManagement1";
			var sVMReference = "mockview--VariantManagement1";
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
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
				assert.equal(oErrorStub.callCount, 1, "an error was logged");
				assert.equal(oUpdateStub.callCount, 1, "the update function was called");
				assert.equal(this.oVariantModel.oData[sVMReference].showExecuteOnSelection, true, "the parameter is set to true");
				assert.equal(fnCallback1.callCount, 0, "the callback was not called yet");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called yet");

				this.oVariantModel._callVariantSwitchListeners(sVMReference, "variant1");
				assert.equal(fnCallback1.callCount, 1, "the callback was called once");
				assert.deepEqual(fnCallback1.lastCall.args[0], this.oVariant1, "the new variant is passed as parmeter");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called");

				return this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("MainForm"),
					callback: fnCallback2,
					callAfterInitialVariant: false
				});
			}.bind(this))
			.then(function() {
				this.oVariantModel._callVariantSwitchListeners(sVMReference, "variant2");
				assert.equal(fnCallback1.callCount, 1, "the callback was not called again");
				assert.equal(fnCallback2.callCount, 1, "the callback was called once");
				assert.deepEqual(fnCallback2.lastCall.args[0], this.oVariant2, "the new variant is passed as parmeter");

				return this.oVariantModel.attachVariantApplied({
					vmControlId: sVMControlId,
					control: this.oView.byId("ObjectPageSection1"),
					callback: fnCallback1,
					callAfterInitialVariant: false
				});
			}.bind(this))
			.then(function() {
				this.oVariantModel._callVariantSwitchListeners(sVMReference, "variant2");
				assert.equal(fnCallback1.callCount, 2, "the callback was called again");
				assert.equal(fnCallback2.callCount, 2, "the callback was called again");

				this.oVariantModel.detachVariantApplied(sVMControlId, this.oView.createId("MainForm"));
				this.oVariantModel._callVariantSwitchListeners(sVMReference, "variant2");
				assert.equal(fnCallback1.callCount, 3, "the callback was called again");
				assert.equal(fnCallback2.callCount, 2, "the callback was not called again");

				this.oVariantModel.detachVariantApplied(sVMControlId, this.oView.createId("ObjectPageSection1"));
				this.oVariantModel._callVariantSwitchListeners(sVMReference, "variant2");
				assert.equal(fnCallback1.callCount, 3, "the callback was not called again");
				assert.equal(fnCallback2.callCount, 2, "the callback was not called again");
			}.bind(this));
		});

		QUnit.test("when 'attachVariantApplied' is called with the control not being rendered yet", function(assert) {
			var sVMControlId = "testComponent---mockview--VariantManagement1";
			var sVMReference = "mockview--VariantManagement1";
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			var fnCallback3 = sandbox.stub();
			var oNewControl1 = new Button("newControl1", {text: "foo"});
			var oNewControl2 = new Button("newControl2", {text: "foo"});
			var oNewControl3 = new Button("newControl3", {text: "foo"});
			sandbox.stub(VariantManagementState, "waitForInitialVariantChanges").resolves();

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
				assert.equal(fnCallback3.callCount, 0, "the callback was not called yet");

				this.oVariantModel._callVariantSwitchListeners(sVMReference, "variant1");
				assert.equal(fnCallback1.callCount, 2, "the callback was called again");
				assert.equal(fnCallback2.callCount, 1, "the callback was not called again");
				assert.equal(fnCallback3.callCount, 1, "the callback was called once");
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
			var sVMReference = "mockview--VariantManagement2";
			var sVMControlId = "testComponent---" + sVMReference;
			this.oView.byId(sVMControlId).setExecuteOnSelectionForStandardDefault(true);
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "waitForInitialVariantChanges").resolves();
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
				assert.equal(fnCallback1.callCount, 1, "the callback was called");
				assert.equal(fnCallback1.lastCall.args[0].executeOnSelect, true, "the flag to apply automatically is set");
				assert.equal(fnCallback1.lastCall.args[0].originalExecuteOnSelect, true, "the flag to apply automatically is set");
				assert.equal(fnCallback2.callCount, 1, "the callback was called");
				assert.equal(fnCallback2.lastCall.args[0].executeOnSelect, true, "the flag to apply automatically is set");
				assert.equal(fnCallback2.lastCall.args[0].originalExecuteOnSelect, true, "the flag to apply automatically is set");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called without executeOnSelectionForStandardDefault set, standard being default and no flex change for apply automatically", function(assert) {
			var sVMReference = "mockview--VariantManagement2";
			var sVMControlId = "testComponent---" + sVMReference;
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "waitForInitialVariantChanges").resolves();
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
				assert.equal(fnCallback1.callCount, 1, "the callback was called");
				assert.equal(fnCallback1.lastCall.args[0].executeOnSelect, false, "the flag to apply automatically is not set");
				assert.equal(fnCallback1.lastCall.args[0].originalExecuteOnSelect, false, "the flag to apply automatically is not set");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard being default and a flex change for apply automatically", function(assert) {
			var sVMReference = "mockview--VariantManagement2";
			var sVMControlId = "testComponent---" + sVMReference;
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "waitForInitialVariantChanges").resolves();
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
				assert.equal(fnCallback1.callCount, 1, "the callback was called");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called");
			});
		});

		QUnit.test("when 'attachVariantApplied' is called with executeOnSelectionForStandardDefault set, standard not being default and no flex change for apply automatically", function(assert) {
			var sVMReference = "mockview--VariantManagement1";
			var sVMControlId = "testComponent---" + sVMReference;
			var oVMControl = oCore.byId(sVMControlId);
			oVMControl.setExecuteOnSelectionForStandardDefault(true);
			var fnCallback1 = sandbox.stub();
			var fnCallback2 = sandbox.stub();
			sandbox.stub(VariantManagementState, "waitForInitialVariantChanges").resolves();
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
				assert.equal(fnCallback1.callCount, 1, "the callback was called");
				assert.equal(fnCallback2.callCount, 0, "the callback was not called");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});