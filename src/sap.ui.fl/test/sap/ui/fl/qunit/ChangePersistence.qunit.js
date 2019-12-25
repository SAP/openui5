/*global QUnit*/
var iOriginalMaxDepth = QUnit.dump.maxDepth;
QUnit.dump.maxDepth = 10;

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/fl/Cache",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/apply/_internal/StorageUtils",
	"sap/ui/core/Component",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState"
],
function (
	FlexState,
	DependencyHandler,
	ChangePersistence,
	Layer,
	Utils,
	LayerUtils,
	Change,
	Variant,
	CompatibilityConnector,
	Cache,
	Settings,
	Storage,
	StorageUtils,
	Component,
	Log,
	jQuery,
	URLHandler,
	sinon,
	merge,
	VariantManagementState
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	sinon.stub(FlexState, "getVariantsState");
	var controls = [];

	function getInitialChangesMap(mPropertyBag) {
		return merge(DependencyHandler.createEmptyDependencyMap(), mPropertyBag);
	}

	QUnit.module("sap.ui.fl.ChangePersistence", {
		beforeEach: function () {
			sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(VariantManagementState, "loadInitialChanges").returns([]);
			this._mComponentProperties = {
				name: "MyComponent",
				appVersion: "1.2.3"
			};
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);

			return Component.create({
				name: "sap.ui.fl.qunit.integration.testComponentComplex",
				manifest: false
			}).then(function(oComponent) {
				this._oComponentInstance = oComponent;
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			controls.forEach(function(control) {
				control.destroy();
			});
		}
	}, function() {
		QUnit.test("Shall be instantiable", function (assert) {
			assert.ok(this.oChangePersistence, "Shall create a new instance");
		});

		QUnit.test("the cache key is returned asynchronous", function (assert) {
			var sChacheKey = "abc123";

			var oMockedWrappedContent = {
				changes: [{}],
				cacheKey: "abc123",
				status: "success"
			};
			var oMockedAppComponent = {
				getComponentData: function() {
					return {};
				},
				getModel: function() {
					return { getCurrentControlVariantIds: function () { return []; } };
				}
			};

			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));

			return this.oChangePersistence.getCacheKey(oMockedAppComponent).then(function (oCacheKeyResponse) {
				assert.equal(oCacheKeyResponse, sChacheKey);
			});
		});

		QUnit.test("the cache key returns a tag if no cache key could be determined", function (assert) {
			var oMockedWrappedContent = {
				changes: [{}],
				etag: "",
				status: "success"
			};

			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));

			return this.oChangePersistence.getCacheKey().then(function (oCacheKeyResponse) {
				assert.equal(oCacheKeyResponse, Cache.NOTAG);
			});
		});

		QUnit.test("when getChangesForComponent is called with _bHasChangesOverMaxLayer set and ignoreMaxLayerParameter is passed as true", function (assert) {
			this.oChangePersistence._bHasChangesOverMaxLayer = true;

			var oMockedWrappedContent = {
				changes: {
					changes: ["mockChange"]
				}
			};

			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));

			return this.oChangePersistence.getChangesForComponent({ignoreMaxLayerParameter: true}).then(function (sResponse) {
				assert.strictEqual(sResponse, this.oChangePersistence.HIGHER_LAYER_CHANGES_EXIST, "then the correct response is returned");
				assert.notOk(this.oChangePersistence._bHasChangesOverMaxLayer, "then _bHasChangesOverMaxLayer is unset");
			}.bind(this));
		});

		QUnit.test("when getChangesForComponent is called with a variantSection", function (assert) {
			var oMockedWrappedContent = {
				changes : {
					changes: [],
					variantSection : {
						variantManagementId : {
							variants : []
						}
					}
				}
			};

			var oGetAllCtrlVariantChanges = sandbox.stub(this.oChangePersistence, "_getAllCtrlVariantChanges").returns([]);
			sandbox.stub(Cache, "getChangesFillingCache").resolves(oMockedWrappedContent);

			return this.oChangePersistence.getChangesForComponent().then(function () {
				assert.ok(oGetAllCtrlVariantChanges.calledWith(oMockedWrappedContent), "then current variant control changes were returned");
			});
		});

		QUnit.test("when getChangesForComponent is called for all variant changes", function (assert) {
			var oMockedWrappedContent = {
				changes : {
					changes: [],
					variantSection : {
						variantManagementId : {
							variants : []
						}
					}
				}
			};

			var oGetAllCtrlVariantChanges = sandbox.stub(this.oChangePersistence, "_getAllCtrlVariantChanges").returns([]);
			sandbox.stub(Cache, "getChangesFillingCache").resolves(oMockedWrappedContent);

			return this.oChangePersistence.getChangesForComponent({includeCtrlVariants: true}).then(function () {
				assert.ok(oGetAllCtrlVariantChanges.calledWith(oMockedWrappedContent, true), "then current variant control changes were returned");
			});
		});

		QUnit.test("when _getAllCtrlVariantChanges is called to get only current variant control changes", function(assert) {
			var oMockResponse = {changes: StorageUtils.getEmptyFlexDataResponse()};
			Object.keys(oMockResponse.changes).forEach(function(sType) {
				if (Array.isArray(oMockResponse.changes[sType])) {
					oMockResponse.changes[sType].push(sType + "1", sType + "2");
				}
			});
			VariantManagementState.loadInitialChanges.returns(oMockResponse.changes.variantDependentControlChanges);
			var aChangesForComponent = this.oChangePersistence._getAllCtrlVariantChanges(oMockResponse, false);
			assert.equal(aChangesForComponent.length, 2, "then only current variant control changes were returned");
			assert.equal(aChangesForComponent[0], "variantDependentControlChanges1");
			assert.equal(aChangesForComponent[1], "variantDependentControlChanges2");
		});

		QUnit.test("when _getAllCtrlVariantChanges is called to get all variant changes", function(assert) {
			var oMockResponse = {changes: StorageUtils.getEmptyFlexDataResponse()};
			Object.keys(oMockResponse.changes).forEach(function(sType) {
				if (Array.isArray(oMockResponse.changes[sType])) {
					oMockResponse.changes[sType].push(sType + "1", sType + "2");
				}
			});
			var aChangesForComponent = this.oChangePersistence._getAllCtrlVariantChanges(oMockResponse, true, function() {return true;});
			assert.equal(aChangesForComponent.length, 8, "then only current variant control changes were returned");
		});

		QUnit.test("when _getAllCtrlVariantChanges is called with a filter function", function(assert) {
			var oMockResponse = {changes: StorageUtils.getEmptyFlexDataResponse()};
			Object.keys(oMockResponse.changes).forEach(function(sType) {
				if (Array.isArray(oMockResponse.changes[sType])) {
					oMockResponse.changes[sType].push(sType + "1", sType + "2");
				}
			});
			var aChangesForComponent = this.oChangePersistence._getAllCtrlVariantChanges(oMockResponse, true, function(sChangeString) {
				return parseInt(sChangeString.slice(-1)) % 2 === 0;
			});
			assert.equal(aChangesForComponent.length, 4, "then only filtered current variant control changes were returned");
			var bValidChanges = aChangesForComponent.every(function (sChangeString) {
				return parseInt(sChangeString.slice(-1)) % 2 === 0;
			});
			assert.ok(bValidChanges, true, "then filtered changes were returned");
		});

		QUnit.test("when getChangesForComponent is called without includeCtrlVariants, max layer and current layer parameters", function(assert) {
			var fnGetCtrlVariantChangesSpy = sandbox.spy(this.oChangePersistence, "_getAllCtrlVariantChanges");

			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(
				{
					changes: {
						changes : [
							{
								fileName: "change0",
								fileType: "change",
								selector: {
									id: "controlId"
								}
							}
						]
					}
				}
			));
			return this.oChangePersistence.getChangesForComponent().then(function() {
				assert.equal(fnGetCtrlVariantChangesSpy.callCount, 1, "then  _getAllCtrlVariantChanges is called in all cases");
			});
		});

		QUnit.test("getChangesForComponent shall not bind the messagebundle as a json model into app component if no VENDOR change is available", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({
				changes: { changes: [] },
				messagebundle: {i_123: "translatedKey"}
			}));
			var mPropertyBag = {};
			mPropertyBag.component = this._oComponentInstance;
			return this.oChangePersistence.getChangesForComponent(mPropertyBag).then(function() {
				var oModel = this._oComponentInstance.getModel("i18nFlexVendor");
				assert.equal(oModel, undefined);
			}.bind(this));
		});

		QUnit.test("getChangesForComponent shall not bind the messagebundle as a json model into app component if no VENDOR change is available", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({
				changes: { changes: [{
					fileType: "change",
					selector: {
						id: "controlId"
					},
					layer : Layer.VENDOR
				}] },
				messagebundle: {i_123: "translatedKey"}
			}));
			var mPropertyBag = {};
			mPropertyBag.component = this._oComponentInstance;
			return this.oChangePersistence.getChangesForComponent(mPropertyBag).then(function() {
				var oModel = this._oComponentInstance.getModel("i18nFlexVendor");
				assert.notEqual(oModel, undefined);
			}.bind(this));
		});

		QUnit.test("getChangesForComponent shall return the changes for the component", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: []}}));

			return this.oChangePersistence.getChangesForComponent().then(function(changes) {
				assert.ok(changes);
			});
		});

		QUnit.test("getChangesForComponent shall return the changes for the component when variantSection is empty", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(
				{
					changes: {
						changes: [
							{
								fileName: "change1",
								fileType: "change",
								selector: {
									id: "controlId"
								}
							}]
					},
					variantSection : {}
				}));

			return this.oChangePersistence.getChangesForComponent().then(function(changes) {
				assert.strictEqual(changes.length, 1, "Changes is an array of length one");
				assert.ok(changes[0] instanceof Change, "Change is instanceof Change");
			});
		});

		QUnit.test("getChangesForComponent shall return the changes for the component, filtering changes with the current layer (CUSTOMER)", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
				{
					fileName: "change1",
					layer: Layer.VENDOR,
					fileType: "change",
					selector: {
						id: "controlId"
					}
				},
				{
					fileName: "change2",
					layer: Layer.CUSTOMER,
					fileType: "change",
					selector: {
						id: "controlId1"
					}
				},
				{
					fileName: "change3",
					layer: Layer.USER,
					fileType: "change",
					selector: {
						id: "controlId2"
					}
				}
			]}}));

			return this.oChangePersistence.getChangesForComponent({currentLayer: Layer.CUSTOMER}).then(function(changes) {
				assert.strictEqual(changes.length, 1, "1 change shall be returned");
				assert.strictEqual(changes[0].getDefinition().layer, Layer.CUSTOMER, "then it returns only current layer (CUSTOMER) changes");
			});
		});

		QUnit.test("getChangesForComponent shall return the changes for the component, not filtering changes with the current layer", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
				{
					fileName: "change1",
					layer: Layer.VENDOR,
					fileType: "change",
					selector: {
						id: "controlId"
					}
				},
				{
					fileName: "change2",
					layer: Layer.CUSTOMER,
					fileType: "change",
					selector: {
						id: "controlId1"
					}
				},
				{
					fileName: "change3",
					layer: Layer.USER,
					fileType: "change",
					selector: {
						id: "controlId2"
					}
				}
			]}}));

			return this.oChangePersistence.getChangesForComponent().then(function(changes) {
				assert.strictEqual(changes.length, 3, "all the 3 changes shall be returned");
			});
		});

		QUnit.test("After run getChangesForComponent without includeVariants parameter", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
				{
					fileName: "file1",
					fileType: "change",
					changeType: "defaultVariant",
					layer: Layer.CUSTOMER,
					selector: { persistencyKey: "SmartFilter_Explored" }
				},
				{
					fileName: "file2",
					fileType: "change",
					changeType: "renameGroup",
					layer: Layer.CUSTOMER,
					selector: { id: "controlId1" }
				},
				{
					fileName: "file3",
					filetype: "change",
					changetype: "removeField",
					layer: Layer.CUSTOMER,
					selector: {}
				},
				{
					fileName: "file4",
					fileType: "variant",
					changeType: "filterBar",
					layer: Layer.CUSTOMER,
					selector: { persistencyKey: "SmartFilter_Explored" }
				},
				{
					fileName: "file6",
					fileType: "variant",
					changeType: "filterBar",
					layer: Layer.CUSTOMER
				},
				{
					fileName: "file7",
					fileType: "change",
					changeType: "codeExt",
					layer: Layer.CUSTOMER,
					selector: { id: "controlId2" }
				},
				{
					fileType: "somethingelse"
				}
			]}}));

			return this.oChangePersistence.getChangesForComponent().then(function(changes) {
				assert.strictEqual(changes.length, 2, "only standard UI changes were returned, smart variants were excluded");
				assert.ok(changes[0]._oDefinition.fileType === "change", "first change has file type change");
				assert.ok(changes[0].getChangeType() === "renameGroup", "and change type renameGroup");
				assert.ok(changes[1]._oDefinition.fileType === "change", "second change has file type change");
				assert.ok(changes[1].getChangeType() === "codeExt", "and change type codeExt");
			});
		});

		QUnit.test("After run getChangesForComponent with includeVariants parameter", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
				{
					fileName: "file1",
					fileType: "change",
					changeType: "defaultVariant",
					layer: Layer.CUSTOMER,
					selector: { persistencyKey: "SmartFilter_Explored" }
				},
				{
					fileName: "file2",
					fileType: "change",
					changeType: "defaultVariant",
					layer: Layer.CUSTOMER,
					selector: {}
				},
				{
					fileName: "file3",
					fileType: "change",
					changeType: "renameGroup",
					layer: Layer.CUSTOMER,
					selector: { id: "controlId1" }
				},
				{
					fileName: "file4",
					fileType: "variant",
					changeType: "filterBar",
					layer: Layer.CUSTOMER,
					selector: { persistencyKey: "SmartFilter_Explored" }
				},
				{
					fileName: "file5",
					fileType: "variant",
					changeType: "filterBar",
					layer: Layer.CUSTOMER
				},
				{
					fileName: "file6",
					fileType: "variant",
					changeType: "filterBar",
					layer: Layer.CUSTOMER
				},
				{
					fileName: "file7",
					fileType: "change",
					changeType: "codeExt",
					layer: Layer.CUSTOMER,
					selector: { id: "controlId2" }
				},
				{
					fileType: "somethingelse"
				},
				{
					fileName: "file8",
					fileType: "change",
					changeType: "appdescr_changes",
					layer: Layer.CUSTOMER
				}
			]}}));

			var fnWarningLogStub = sandbox.stub(Log, "warning");

			return this.oChangePersistence.getChangesForComponent({includeVariants : true}).then(function(changes) {
				assert.strictEqual(changes.length, 5, "both standard UI changes and smart variants were returned");
				assert.ok(changes[0]._oDefinition.fileType === "change", "first change has file type change");
				assert.ok(changes[0].getChangeType() === "defaultVariant", "and change type defaultVariant");
				assert.ok(changes[1]._oDefinition.fileType === "change", "second change has file type change");
				assert.ok(changes[1].getChangeType() === "renameGroup", "and change type renameGroup");
				assert.ok(changes[2]._oDefinition.fileType === "variant", "third change has file type variant");
				assert.ok(changes[2].getChangeType() === "filterBar", "and change type filterBar");
				assert.ok(changes[3]._oDefinition.fileType === "change", "forth change has file type change");
				assert.ok(changes[3].getChangeType() === "codeExt", "and change type codeExt");
				assert.ok(changes[4]._oDefinition.fileType === "change", "fifth change has file type change");
				assert.notOk(changes[4].getSelector(), "and does not have selector");
				assert.ok(fnWarningLogStub.calledWith("A change without fileName is detected and excluded from component: MyComponent"), "with correct component name");
			});
		});

		QUnit.test("when getChangesForComponent is called with a max layer parameter and includeCtrlVariants set to true", function(assert) {
			var oResponse = {
				changes: [
					{
						fileName: "vendorChange",
						fileType: "change",
						layer: Layer.VENDOR
					},
					{
						fileName: "partnerChange",
						fileType: "change",
						layer: Layer.PARTNER
					},
					{
						fileName: "customerChange",
						fileType: "change",
						layer: Layer.CUSTOMER
					},
					{
						fileName: "userChange",
						fileType: "change",
						layer: Layer.USER
					}
				],
				variantSection: {
					variantManagementId: {
						variants: [
							{
								content: {
									fileName: "variantManagementId"
								},
								controlChanges: [
									{
										fileName: "variantDependentControlChange"
									}
								]
							}
						]
					}
				}
			};
			sandbox.stub(Cache, "getChangesFillingCache").resolves({
				changes: oResponse
			});

			sandbox.stub(LayerUtils, "getMaxLayer").returns(Layer.CUSTOMER);
			sandbox.stub(this.oChangePersistence, "_getAllCtrlVariantChanges")
				.withArgs(sinon.match.any, true)
				.returns([
					{
						fileName: "variantDependentControlChange",
						fileType: "change",
						layer: Layer.CUSTOMER,
						variantReference: "variantManagementId"
					},
					{
						fileName: "variantChange",
						fileType: "ctrl_variant_change",
						layer: Layer.USER,
						selector: {
							id: "variantManagementId"
						}
					}
				]);
			sandbox.stub(this.oChangePersistence._oVariantController, "checkAndSetVariantContent");
			sandbox.stub(VariantManagementState, "updateVariantsState");

			return this.oChangePersistence.getChangesForComponent({includeCtrlVariants: true}).then(function(aChanges) {
				assert.strictEqual(aChanges.length, 5, "only changes which are under max layer are returned");
				var aChangeFileNames = aChanges.map(function(oChangeOrChangeContent) {
					return oChangeOrChangeContent.fileName || oChangeOrChangeContent.getId();
				});
				var bExpectedChangesExist = ["vendorChange", "partnerChange", "customerChange", "variantDependentControlChange", "variantChange"].every(function(sChangeFileName) {
					return aChangeFileNames.indexOf(sChangeFileName) !== -1;
				});
				assert.equal(bExpectedChangesExist, true, "then max layer filtered changes were returned");
				assert.equal(VariantManagementState.updateVariantsState.firstCall.args[0].content["variantManagementId"].variants[0].controlChanges[0].getId(), "variantDependentControlChange",
					"then variant dependent control change content was replaced with an instance");
				assert.strictEqual(this.oChangePersistence._bHasChangesOverMaxLayer, true, "then the flag _bHasChangesOverMaxLayer is set");
			}.bind(this));
		});

		QUnit.test("when getChangesForComponent is called without a max layer parameter and includeCtrlVariants set to true", function(assert) {
			var oResponse = {
				changes: [
					{
						fileName: "vendorChange",
						fileType: "change",
						layer: Layer.VENDOR
					},
					{
						fileName: "userChange",
						fileType: "change",
						layer: Layer.USER
					}
				],
				variantSection: {
					variantManagementId: {
						variants: [
							{
								content: {
									fileName: "variantManagementId"
								},
								controlChanges: [
									{
										fileName: "variantDependentControlChange"
									}
								]
							}
						]
					}
				}
			};
			sandbox.stub(Cache, "getChangesFillingCache").resolves({
				changes: oResponse
			});

			sandbox.stub(this.oChangePersistence, "_getAllCtrlVariantChanges")
				.withArgs(sinon.match.any, undefined)
				.returns([
					{
						fileName: "variantDependentControlChange",
						fileType: "change",
						layer: Layer.CUSTOMER,
						variantReference: "variantManagementId"
					}
				]);
			sandbox.stub(this.oChangePersistence._oVariantController, "checkAndSetVariantContent");
			sandbox.stub(VariantManagementState, "updateVariantsState");

			return this.oChangePersistence.getChangesForComponent().then(function(aChanges) {
				assert.strictEqual(aChanges.length, 3, "only changes which are under max layer are returned");
				var aChangeFileNames = aChanges.map(function(oChangeOrChangeContent) {
					return oChangeOrChangeContent.fileName || oChangeOrChangeContent.getId();
				});
				var bExpectedChangesExist = ["vendorChange", "userChange", "variantDependentControlChange"].every(function(sChangeFileName) {
					return aChangeFileNames.indexOf(sChangeFileName) !== -1;
				});
				assert.equal(bExpectedChangesExist, true, "then the expected changes were returned");
				assert.equal(VariantManagementState.updateVariantsState.firstCall.args[0].content["variantManagementId"].variants[0].controlChanges[0].getId(), "variantDependentControlChange",
					"then variant dependent control change content was replaced with an instance");
				assert.strictEqual(this.oChangePersistence._bHasChangesOverMaxLayer, false, "then the flag _bHasChangesOverMaxLayer was not set");
			}.bind(this));
		});

		QUnit.test("when _getLayerFromChangeOrChangeContent is called with a change instance", function(assert) {
			var oChange = new Change({
				fileName:"change1",
				layer: Layer.USER,
				selector: { id: "controlId" },
				dependentSelector: []
			});
			assert.strictEqual(this.oChangePersistence._getLayerFromChangeOrChangeContent(oChange), Layer.USER, "then the correct layer is returned");
		});

		QUnit.test("when _getLayerFromChangeOrChangeContent is called with a variant instance", function(assert) {
			var oVariant = new Variant({
				content: {
					fileName: "variant1",
					layer: Layer.USER
				}
			});
			assert.strictEqual(this.oChangePersistence._getLayerFromChangeOrChangeContent(oVariant), Layer.USER, "then the correct layer is returned");
		});

		QUnit.test("getChangesForComponent shall ignore max layer parameter when current layer is set", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
				{
					fileName:"change2",
					fileType: "change",
					layer: Layer.VENDOR,
					selector: { id: "controlId" },
					dependentSelector: []
				},
				{
					fileName:"change3",
					fileType: "change",
					layer: Layer.USER,
					selector: { id: "anotherControlId" },
					dependentSelector: []
				},
				{
					fileName:"change4",
					fileType: "change",
					layer: Layer.CUSTOMER,
					selector: { id: "controlId" },
					dependentSelector: []
				},
				{
					fileName:"change5",
					fileType: "change",
					layer: Layer.PARTNER,
					selector: { id: "controlId" },
					dependentSelector: []
				}
			]}}));

			sandbox.stub(LayerUtils, "getMaxLayer").returns(Layer.CUSTOMER);

			return this.oChangePersistence.getChangesForComponent({currentLayer: Layer.CUSTOMER}).then(function(oChanges) {
				assert.strictEqual(oChanges.length, 1, "only changes which are under max layer are returned");
				assert.ok(oChanges[0].getId() === "change4", "with correct ID");
			});
		});

		QUnit.test("getChangesForComponent shall also pass the returned data to the fl.Settings, but only if the data comes from the back end", function(assert) {
			var oFileContent = {};
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFileContent));
			var oSettingsStoreInstanceStub = sandbox.stub(Settings, "_storeInstance");

			return this.oChangePersistence.getChangesForComponent().then(function() {
				assert.ok(oSettingsStoreInstanceStub.notCalled, "the _storeInstance function of the fl.Settings was not called.");
			});
		});

		QUnit.test("getChangesForComponent ignore filtering when ignoreMaxLayerParameter property is available", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
				{
					fileName:"change1",
					fileType: "change",
					layer: Layer.USER,
					selector: { id: "controlId" },
					dependentSelector: []
				},
				{
					fileName:"change2",
					fileType: "change",
					layer: Layer.VENDOR,
					selector: { id: "controlId" },
					dependentSelector: []
				},
				{
					fileName:"change3",
					fileType: "change",
					layer: Layer.USER,
					selector: { id: "anotherControlId" },
					dependentSelector: []
				},
				{
					fileName:"change4",
					fileType: "change",
					layer: Layer.CUSTOMER,
					selector: { id: "controlId" },
					dependentSelector: []
				},
				{
					fileName:"change5",
					fileType: "change",
					layer: Layer.PARTNER,
					selector: { id: "controlId" },
					dependentSelector: []
				}
			]}}));

			sandbox.stub(LayerUtils, "getMaxLayer").returns(Layer.CUSTOMER);

			return this.oChangePersistence.getChangesForComponent({ignoreMaxLayerParameter : true}).then(function(oChanges) {
				assert.strictEqual(oChanges.length, 5, "filtering is ignored, all changes are returned");
			});
		});

		QUnit.test("getChangesForVariant does nothing if entry in variant changes map is available", function(assert) {
			var aStubChanges = [
				{
					fileName:"change1",
					fileType: "change",
					layer: Layer.USER,
					selector: { id: "controlId" },
					dependentSelector: []
				}
			];
			var oStubGetChangesForComponent = sandbox.stub(this.oChangePersistence, "getChangesForComponent");
			this.oChangePersistence._mVariantsChanges["SmartFilterBar"] = aStubChanges;
			return this.oChangePersistence.getChangesForVariant("someProperty", "SmartFilterBar", {}).then(function(aChanges) {
				assert.deepEqual(aChanges, aStubChanges);
				sinon.assert.notCalled(oStubGetChangesForComponent);
			});
		});

		QUnit.test("getChangesForVariant call getChangesForComponent and filter results after that if entry in variant changes map is not available", function(assert) {
			var oPromise = new Promise(function(resolve) {
				setTimeout(function() {
					resolve({changes: {changes: [
						{
							fileName: "change1",
							fileType: "change",
							changeType: "defaultVariant",
							layer: Layer.CUSTOMER,
							selector: { persistencyKey: "SmartFilter_Explored" },
							originalLanguage: "EN"
						},
						{
							fileName: "change2",
							fileType: "change",
							changeType: "defaultVariant",
							layer: Layer.CUSTOMER,
							selector: {}
						},
						{
							fileName: "change3",
							fileType: "change",
							changeType: "renameGroup",
							layer: Layer.CUSTOMER,
							selector: { id: "controlId1" }
						},
						{
							fileName: "variant1",
							fileType: "variant",
							changeType: "filterBar",
							layer: Layer.CUSTOMER,
							selector: { persistencyKey: "SmartFilter_Explored" },
							originalLanguage: "EN"
						},
						{
							fileName: "variant2",
							fileType: "variant",
							changeType: "filterBar",
							layer: Layer.CUSTOMER
						},
						{
							fileName: "change4",
							fileType: "change",
							changeType: "codeExt",
							layer: Layer.CUSTOMER,
							selector: { id: "controlId2" }
						},
						{
							fileType: "change",
							changeType: "appdescr_changes",
							layer: Layer.CUSTOMER
						}
					]}});
				}, 100);
			});
			sandbox.stub(Cache, "getChangesFillingCache").returns(oPromise);
			var oPromise1 = this.oChangePersistence.getChangesForVariant("persistencyKey", "SmartFilter_Explored", {includeVariants: true});
			var oPromise2 = this.oChangePersistence.getChangesForVariant("persistencyKey", "SmartFilter_Explored", {includeVariants: true});
			return Promise.all([oPromise1, oPromise2]).then(function(values) {
				assert.ok(values[0] === values[1]);
			});
		});

		QUnit.test("loadChangesMapForComponent shall return a map of changes for the component", function(assert) {
			var oAppComponent = {
				id: "mockAppComponent"
			};
			sandbox.stub(this.oChangePersistence, "getChangesForComponent").resolves([new Change("a"), new Change("b"), new Change("c")]);

			var mExpectedChangesMap = {changesStub: true};
			var oAddChangeStub = sandbox.stub(DependencyHandler, "addChangeAndUpdateDependencies");
			var oSetStateStub = sandbox.stub(Change.prototype, "setInitialApplyState");
			sandbox.stub(DependencyHandler, "createEmptyDependencyMap").returns(mExpectedChangesMap);
			return this.oChangePersistence.loadChangesMapForComponent(oAppComponent, {}).then(function (fnGetChangesMap) {
				assert.ok(typeof fnGetChangesMap === "function", "a function is returned");
				assert.equal(oAddChangeStub.callCount, 3, "3 changes were added");
				assert.equal(oSetStateStub.callCount, 3, "the state was set 3 times");

				var mChangesMap = fnGetChangesMap();
				assert.deepEqual(mChangesMap, mExpectedChangesMap, "the changes map is properly returned");
				assert.deepEqual(mChangesMap, this.oChangePersistence._mChangesInitial, "the changes map is saved in _mChangesInitial");
			}.bind(this));
		});

		QUnit.test("copyDependenciesFromInitialChangesMap", function(assert) {
			var oChange0 = {
				getId: function() {
					return "fileNameChange0";
				}
			};
			var oChange1 = {
				getId: function() {
					return "fileNameChange1";
				},
				getDependentControlSelectorList: function() {
					return [{
						id: "group3"
					}, {
						id: "group2"
					}];
				}
			};
			var oChange2 = {
				getId: function() {
					return "fileNameChange2";
				},
				getDependentControlSelectorList: function() {
					return [{
						id: "group2"
					}, {
						id: "group1"
					}];
				}
			};
			var mChanges = {
				"field3-2": [oChange1, oChange2],
				group1: [oChange0]
			};
			var mInitialChangesMap = getInitialChangesMap({
				mChanges: mChanges,
				mDependencies: {
					fileNameChange1: {
						changeObject: oChange1,
						dependencies: [],
						controlsDependencies: ["group3", "group2"]
					},
					fileNameChange2: {
						changeObject: oChange2,
						dependencies: ["fileNameChange1", "fileNameChange0"],
						controlsDependencies: ["group2", "group1"]
					}
				},
				mDependentChangesOnMe: {
					fileNameChange0: ["fileNameChange2"],
					fileNameChange1: ["fileNameChange2"]
				},
				mControlsWithDependencies: {
					group1: [
						"fileNameChange2"
					],
					group2: [
						"fileNameChange1",
						"fileNameChange2"
					],
					group3: [
						"fileNameChange1"
					]
				}
			});
			var mCurrentChangesMap = getInitialChangesMap({
				mChanges: mChanges
			});
			var mExpectedDependenciesMapAfterFirstChange = getInitialChangesMap({
				mChanges: mChanges,
				mDependencies: {
					fileNameChange1: {
						changeObject: oChange1,
						dependencies: [],
						controlsDependencies: ["group3", "group2"]
					}
				},
				mControlsWithDependencies: {
					group2: [
						"fileNameChange1"
					],
					group3: [
						"fileNameChange1"
					]
				}
			});

			var mExpectedDependenciesMapAfterSecondChange = getInitialChangesMap({
				mChanges: mChanges,
				mDependencies: {
					fileNameChange1: {
						changeObject: oChange1,
						dependencies: [],
						controlsDependencies: ["group3", "group2"]
					},
					fileNameChange2: {
						changeObject: oChange2,
						dependencies: [],
						controlsDependencies: ["group2", "group1"]
					}
				},
				mControlsWithDependencies: {
					group1: [
						"fileNameChange2"
					],
					group2: [
						"fileNameChange1",
						"fileNameChange2"
					],
					group3: [
						"fileNameChange1"
					]
				}
			});

			this.oChangePersistence._mChangesInitial = mInitialChangesMap;
			this.oChangePersistence._mChanges = mCurrentChangesMap;
			function dependencyValid() {
				return true;
			}
			function dependencyInvalid() {
				return false;
			}

			var mUpdatedDependenciesMap = this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange0, dependencyValid);
			assert.deepEqual(mUpdatedDependenciesMap, mCurrentChangesMap, "no dependencies got copied");

			mUpdatedDependenciesMap = this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange1, dependencyValid);
			assert.deepEqual(mUpdatedDependenciesMap, mExpectedDependenciesMapAfterFirstChange, "all dependencies from change1 got copied");

			mUpdatedDependenciesMap = this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange2, dependencyInvalid);
			assert.deepEqual(mUpdatedDependenciesMap, mExpectedDependenciesMapAfterSecondChange, "no dependencies from change2 got copied");

			mUpdatedDependenciesMap = this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange2, dependencyValid);
			assert.deepEqual(mUpdatedDependenciesMap, mInitialChangesMap, "all dependencies from change2 got copied");

			assert.deepEqual(mUpdatedDependenciesMap, this.oChangePersistence._mChanges, "the updated dependencies map is saved in the internal changes map");
		});

		QUnit.test("deleteChanges with bRunTimeCreatedChange parameter set, shall remove the given change from the map", function(assert) {
			var oAppComponent = {
				id :"mockAppComponent"
			};
			sandbox.stub(Cache, "getChangesFillingCache").resolves({
				changes: {
					changes: [
						{
							fileName: "change1",
							fileType: "change",
							selector: {id: "controlId"},
							reference: "appComponentReference",
							dependentSelector: []
						},
						{
							fileName: "change2",
							fileType: "change",
							selector: {id: "controlId"},
							reference: "appComponentReference",
							dependentSelector: []
						},
						{
							fileName: "change3",
							fileType: "change",
							selector: {id: "anotherControlId"},
							reference: "appComponentReference",
							dependentSelector: []
						}
					]
				}
			});

			sandbox.stub(Utils, "getComponentName").callThrough().withArgs(oAppComponent).returns("appComponentReference");
			sandbox.spy(this.oChangePersistence, "_deleteChangeInMap");

			return this.oChangePersistence.loadChangesMapForComponent(oAppComponent, {})
				.then(function (fnGetChangesMap) {
					var mChanges = fnGetChangesMap().mChanges;
					var oChangeForDeletion = mChanges["controlId"][1]; // second change for 'controlId' shall be removed
					this.oChangePersistence.deleteChange(oChangeForDeletion, true);
					assert.equal(mChanges["controlId"].length, 1, "'controlId' has only one change in the map");
					assert.equal(mChanges["controlId"][0].getId(), "change1", "the change has the ID 'change1'");
					assert.equal(mChanges["anotherControlId"].length, 1, "'anotherControlId' has still one change in the map");
					assert.ok(this.oChangePersistence._deleteChangeInMap.calledWith(oChangeForDeletion, true), "then _deleteChangeInMap() was called with the correct parameters");
				}.bind(this));
		});

		QUnit.test("when getChangesForView is called with a view ID and an app component", function(assert) {
			var oAppComponent = {
				getLocalId: function() {
					return "viewId";
				},
				id :"componentId"
			};

			var oChangeWithViewPrefix = {
				fileName:"changeWithViewPrefix",
				fileType: "change",
				reference: "appComponentReference",
				selector:{
					id: "componentId---viewId--controlId"
				}
			};

			var oChangeWithoutViewPrefix = {
				fileName:"changeWithoutViewPrefix",
				fileType: "change",
				reference: "appComponentReference",
				selector: {
					id: "componentId---RandomId"
				}
			};

			var oChangeWithPrefixAndLocalId = {
				fileName:"changeWithPrefixAndLocalId",
				fileType: "change",
				reference: "appComponentReference",
				selector: {
					id: "viewId--controlId",
					idIsLocal: true
				}
			};

			// when additionally ID prefixes could be present e.g. fragment ID, control ID containing "--"
			var oChangeWithViewAndAdditionalPrefixes = {
				fileName:"changeWithViewAndAdditionalPrefixes",
				fileType: "change",
				reference: "appComponentReference",
				selector: {
					id: "componentId---viewId--fragmentId--controlId"
				}
			};


			sandbox.stub(Cache, "getChangesFillingCache").resolves({
				changes: {
					changes: [oChangeWithViewPrefix, oChangeWithoutViewPrefix, oChangeWithPrefixAndLocalId, oChangeWithViewAndAdditionalPrefixes]
				}
			});

			sandbox.stub(Utils, "getComponentName").callThrough().withArgs(oAppComponent).returns("appComponentReference");

			var mPropertyBag = {
				viewId: "componentId---viewId",
				appComponent: oAppComponent
			};

			return this.oChangePersistence.getChangesForView(mPropertyBag)
				.then(function (aChanges) {
					assert.strictEqual(aChanges.length, 3, "then two changes belonging to the view were returned");
					assert.strictEqual(aChanges[0].getId(), "changeWithViewPrefix", "then the change with view prefix was returned");
					assert.strictEqual(aChanges[1].getId(), "changeWithPrefixAndLocalId", "then the change with view prefix was returned");
					assert.strictEqual(aChanges[2].getId(), "changeWithViewAndAdditionalPrefixes", "then the change with view and additional prefixes was returned");
				});
		});

		QUnit.test("when getChangesForView is called with an embedded component and a view ID existing both for app and embedded components", function(assert) {
			var oEmbeddedComponent = {
				id :"mockEmbeddedComponent"
			};

			var oChange1View1 = {
				fileName:"change1View1",
				fileType: "change",
				reference: "appComponentReference",
				selector:{
					id: "view1--button1",
					idIsLocal: true
				}
			};

			var oChange1View2 = {
				fileName:"change1View2",
				fileType: "change",
				reference: "appComponentReference",
				selector: {
					id: "mockEmbeddedComponent---view1--button1",
					idIsLocal: false
				}
			};

			sandbox.stub(Cache, "getChangesFillingCache").resolves({
				changes: {
					changes: [oChange1View1, oChange1View2]
				}
			});
			sandbox.stub(Utils, "getComponentName").callThrough().withArgs(oEmbeddedComponent).returns("embeddedComponentReference");

			var mPropertyBag = {
				viewId: "mockEmbeddedComponent---view1",
				component: oEmbeddedComponent
			};

			return this.oChangePersistence.getChangesForView(mPropertyBag)
				.then(function (aChanges) {
					assert.strictEqual(aChanges.length, 1, "then only one change is returned");
					assert.strictEqual(aChanges[0].getId(), "change1View2", "then only the change belonging to the embedded component was returned");
				});
		});

		QUnit.test("when getChangesForView is called with an extension point selector containing a view ID", function(assert) {
			var oAppComponent = {
				id :"appComponentReference"
			};

			var oChange1View1 = {
				fileName:"change1View1",
				fileType: "change",
				reference: "appComponentReference",
				selector:{
					name: "Extension1",
					viewSelector: {
						id: "viewWithExtension",
						idIsLocal: true
					}
				}
			};

			var oChange1View2 = {
				fileName:"change1View2",
				fileType: "change",
				reference: "appComponentReference",
				selector:{
					name: "Extension1",
					viewSelector: {
						id: "viewWithoutExtension",
						idIsLocal: true
					}
				}
			};

			var oChange2View2 = {
				fileName:"change2View2",
				fileType: "change",
				reference: "appComponentReference",
				selector: {
					name: "Extension2",
					viewSelector: {
						id: "viewWithoutExtension",
						idIsLocal: true
					}
				}
			};

			var oChange3View3 = {
				fileName:"change3View3",
				fileType: "change",
				reference: "appComponentReference",
				selector: {
					name: "Extension3",
					viewSelector: {
						id: "viewWithAnotherExtension",
						idIsLocal: true
					}
				}
			};

			var oChange4View3 = {
				fileName:"change4View3",
				fileType: "change",
				reference: "appComponentReference",
				selector: {
					name: "Extension4",
					viewSelector: {
						id: "appComponentReference---viewWithAnotherExtension",
						idIsLocal: false
					}
				}
			};

			var oChange4View1 = {
				fileName:"change4View1",
				fileType: "change",
				reference: "appComponentReference",
				selector: {
					name: "Extension4",
					viewSelector: {
						id: "appComponentReference---viewWithExtension",
						idIsLocal: false
					}
				}
			};


			sandbox.stub(Cache, "getChangesFillingCache").resolves({
				changes: {
					changes: [oChange1View1, oChange1View2, oChange2View2, oChange3View3, oChange4View3, oChange4View1]
				}
			});

			sandbox.stub(Utils, "getComponentName").callThrough().withArgs(oAppComponent).returns("appComponentReference");

			var mPropertyBag = {
				modifier: {
					getControlIdBySelector: function(oSelector) {
						if (oSelector.idIsLocal) {
							return "appComponentReference---" + oSelector.id;
						}
						return oSelector.id;
					}
				},
				viewId: "appComponentReference---viewWithExtension",
				appComponent: oAppComponent
			};

			return this.oChangePersistence.getChangesForView(mPropertyBag)
				.then(function (aChanges) {
					assert.strictEqual(aChanges.length, 2, "then only two change were returned");
					assert.strictEqual(aChanges[0].getId(), "change1View1", "then only the change with the correct viewId of the selector was returned");
					assert.strictEqual(aChanges[1].getId(), "change4View1", "then only the change with the correct viewId of the selector was returned");
				});
		});

		QUnit.test("_getChangesFromMapByNames returns array of changes with corresponding name", function (assert) {
			var oAppComponent = {
				id: "mockAppComponent"
			};
			var oChange0 = new Change(
				Change.createInitialFileContent({
					id: "fileNameChange0",
					layer: Layer.USER,
					reference: "appComponentReference",
					namespace: "namespace",
					selector: {id: "group1"}
				})
			);
			var oChange1 = new Change(
				Change.createInitialFileContent({
					id: "fileNameChange1",
					layer: Layer.USER,
					reference: "appComponentReference",
					namespace: "namespace",
					selector: {id: "field3-2"},
					dependentSelector: {
						alias: [{
							id: "group3"
						}, {
							id: "group2"
						}]
					}
				})
			);
			var oChange2 = new Change(
				Change.createInitialFileContent({
					id: "fileNameChange2",
					layer: Layer.USER,
					reference: "appComponentReference",
					namespace: "namespace",
					selector: {id: "field3-2"},
					dependentSelector: {
						alias: [{
							id: "group2"
						}, {
							id: "group1"
						}],
						alias2: {
							id: "field3-2"
						}
					}
				})
			);
			var aNames = ["fileNameChange0", "fileNameChange2"];
			var aExpectedChanges = [oChange0, oChange2];

			sandbox.stub(this.oChangePersistence, "getChangesForComponent").resolves([oChange0, oChange1, oChange2]);
			sandbox.stub(Utils, "getComponentName").callThrough().withArgs(oAppComponent).returns("appComponentReference");

			return this.oChangePersistence.loadChangesMapForComponent(oAppComponent, {})
				.then(function () {
					return this.oChangePersistence._getChangesFromMapByNames(aNames);
				}.bind(this))
				.then(function (aChanges) {
					assert.deepEqual(aChanges, aExpectedChanges, " 2 changes should be found");
				});
		});

		QUnit.test("when calling transportAllUIChanges successfully", function(assert) {
			var oMockNewChange = {
				fileType : "change",
				id : "changeId2"
			};

			var oAppVariantDescriptor = {
				packageName : "$TMP",
				fileType : "appdescr_variant",
				fileName : "manifest",
				id : "customer.app.var.id",
				namespace : "namespace"
			};
			var oRootControl = {
				id: "sampleControl"
			};
			var sStyleClass = "sampleStyle";
			var sLayer = Layer.CUSTOMER;
			var aMockLocalChanges = [oMockNewChange];
			var aAppVariantDescriptors = [oAppVariantDescriptor];

			var fnPublishStub = sandbox.stub(Storage, "publish").resolves();
			var fnGetChangesForComponentStub = sandbox.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve(aMockLocalChanges));

			return this.oChangePersistence.transportAllUIChanges(oRootControl, sStyleClass, sLayer, aAppVariantDescriptors).then(function() {
				assert.ok(fnGetChangesForComponentStub.calledOnce, "then getChangesForComponent called once");
				assert.ok(fnPublishStub.calledOnce, "then publish called once");
				assert.ok(fnPublishStub.calledWith({
					transportDialogSettings: {
						rootControl: oRootControl,
						styleClass: sStyleClass
					},
					layer: sLayer,
					reference: this._mComponentProperties.name,
					appVersion: this._mComponentProperties.appVersion,
					localChanges: aMockLocalChanges,
					appVariantDescriptors: aAppVariantDescriptors
				}), "then publish called with the transport info and changes array");
			}.bind(this));
		});

		QUnit.test("when calling resetChanges without generator, selector IDs and change types specified", function (assert) {
			sandbox.stub(Log, "error");
			this.oChangePersistence.resetChanges(Layer.VENDOR);
			assert.ok(Log.error.calledWith("Of the generator, selector IDs and change types parameters at least one has to filled"), "then Log.error() is called with an error");
		});

		QUnit.test("when calling resetChanges without aSelectorIds and aChangeTypes (application reset)", function (assert) {
			var done = assert.async();
			// changes for the component
			var oVENDORChange1 = new Change({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "1",
				namespace: "b",
				packageName: "$TMP",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var oVENDORChange2 = new Change({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var aChanges = [oVENDORChange1, oVENDORChange2];
			sandbox.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve(aChanges));
			var aDeletedChangeContentIds = {response : [{name: "1"}, {name: "2"}]};

			var oResetChangesStub = sandbox.stub(CompatibilityConnector, "resetChanges").returns(Promise.resolve(aDeletedChangeContentIds));
			var oCacheRemoveChangesStub = sandbox.stub(Cache, "removeChanges");
			var oGetChangesFromMapByNamesStub = sandbox.stub(this.oChangePersistence, "_getChangesFromMapByNames").returns(Promise.resolve());

			this.oChangePersistence.resetChanges(Layer.VENDOR, "Change.createInitialFileContent").then(function(aChanges) {
				assert.ok(oResetChangesStub.calledOnce, "CompatibilityConnector.deleteChange is called once");
				var oResetArgs = oResetChangesStub.getCall(0).args[0];
				assert.equal(oResetArgs.reference, "MyComponent");
				assert.equal(oResetArgs.appVersion, "1.2.3");
				assert.equal(oResetArgs.layer, Layer.VENDOR);
				assert.equal(oResetArgs.generator, "Change.createInitialFileContent");
				assert.equal(oCacheRemoveChangesStub.callCount, 0, "the Cache.removeChanges is not called");
				assert.equal(oGetChangesFromMapByNamesStub.callCount, 0, "the getChangesFromMapByNames is not called");
				assert.deepEqual(aChanges, [], "empty array is returned");
				done();
			});
		});

		QUnit.test("when calling resetChanges with selector and change type (control reset)", function (assert) {
			// changes for the component
			var oVENDORChange1 = new Change({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "1",
				namespace: "b",
				packageName: "$TMP",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var oVENDORChange2 = new Change({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var aChanges = [oVENDORChange1, oVENDORChange2];
			sandbox.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve(aChanges));
			var aDeletedChangeContentIds = {response: [{name: "1"}, {name: "2"}]};

			var oResetChangesStub = sandbox.stub(CompatibilityConnector, "resetChanges").returns(Promise.resolve(aDeletedChangeContentIds));
			var oCacheRemoveChangesStub = sandbox.stub(Cache, "removeChanges");
			var oGetChangesFromMapByNamesStub = sandbox.stub(this.oChangePersistence, "_getChangesFromMapByNames").returns(Promise.resolve());

			return this.oChangePersistence.resetChanges(Layer.VENDOR, "", ["abc123"], ["labelChange"]).then(function() {
				assert.ok(oResetChangesStub.calledOnce, "CompatibilityConnector.deleteChange is called once");
				var oResetArgs = oResetChangesStub.getCall(0).args[0];
				assert.equal(oResetArgs.reference, "MyComponent");
				assert.equal(oResetArgs.appVersion, "1.2.3");
				assert.equal(oResetArgs.layer, Layer.VENDOR);
				assert.deepEqual(oResetArgs.selectorIds, ["abc123"]);
				assert.deepEqual(oResetArgs.changeTypes, ["labelChange"]);
				assert.ok(oCacheRemoveChangesStub.calledOnce, "the Cache.removeChanges is called once");
				assert.deepEqual(oCacheRemoveChangesStub.args[0][1], ["1", "2"], "and with the correct names");
				assert.ok(oGetChangesFromMapByNamesStub.calledOnce, "the getChangesFromMapByNames is called once");
				assert.deepEqual(oGetChangesFromMapByNamesStub.args[0][0], ["1", "2"], "and with the correct names");
			});
		});

		QUnit.test("checkForOpenDependenciesForControl", function(assert) {
			var oModifier = {
				getControlIdBySelector: function(oSelector) {
					return oSelector.id;
				}
			};
			this.oChangePersistence._mChanges.mDependencies = {
				fileNameChange1: {
					changeObject: {getDependentSelectorList: function() {return ["id"];}}
				},
				fileNameChange2: {
					changeObject: {getDependentSelectorList: function() {return ["id2"];}}
				}
			};

			assert.ok(this.oChangePersistence.checkForOpenDependenciesForControl({id: "id"}, oModifier), "the unresolved dependency was found");
			assert.notOk(this.oChangePersistence.checkForOpenDependenciesForControl({id: "anotherId"}, oModifier), "there is no unresolved dependency, so false is returned");
		});
	});

	QUnit.module("sap.ui.fl.ChangePersistence addChange", {
		beforeEach: function () {
			sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(FlexState, "getAppDescriptorChanges").returns([]);
			sandbox.stub(VariantManagementState, "loadInitialChanges").returns([]);
			this._mComponentProperties = {
				name : "saveChangeScenario",
				appVersion : "1.2.3"
			};
			sandbox.stub(Utils, "isApplication").returns(false);
			return Component.create({
				name: "sap/ui/fl/qunit/integration/testComponentComplex"
			}).then(function(oComponent) {
				this._oAppComponentInstance = oComponent;
				this._oComponentInstance = Component.get(oComponent.createId("sap.ui.fl.qunit.integration.testComponentReuse"));
				this.oChangePersistence = new ChangePersistence(this._mComponentProperties);
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When call addChange 3 times, 4 new changes are returned and the dependencies map also got updated", function (assert) {
			var oChangeContent1;
			var oChangeContent2;
			var oChangeContent3;
			var aChanges;

			oChangeContent1 = {
				fileName: "Gizorillus1",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "Gizorillus2",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "removeField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			oChangeContent3 = {
				fileName: "Gizorillus3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			var fnAddDirtyChangeSpy = sandbox.spy(this.oChangePersistence, "addDirtyChange");
			var fnAddRunTimeCreatedChangeAndUpdateDependenciesSpy = sandbox.stub(this.oChangePersistence, "_addRunTimeCreatedChangeAndUpdateDependencies");

			var newChange1 = this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			var newChange2 = this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);
			var newChange3 = this.oChangePersistence.addChange(oChangeContent3, this._oComponentInstance);

			assert.deepEqual(fnAddDirtyChangeSpy.getCall(0).args[0], oChangeContent1, "then addDirtyChange called with the change content 1");
			assert.deepEqual(fnAddDirtyChangeSpy.getCall(1).args[0], oChangeContent2, "then addDirtyChange called with the change content 2");
			assert.deepEqual(fnAddDirtyChangeSpy.getCall(2).args[0], oChangeContent3, "then addDirtyChange called with the change content 3");
			assert.equal(fnAddRunTimeCreatedChangeAndUpdateDependenciesSpy.callCount, 3, "_addRunTimeCreatedChangeAndUpdateDependencies is called three times");
			aChanges = this.oChangePersistence._aDirtyChanges;
			assert.ok(aChanges);
			assert.strictEqual(aChanges.length, 3);
			assert.strictEqual(aChanges[0].getId(), oChangeContent1.fileName);
			assert.strictEqual(aChanges[0], newChange1);
			assert.strictEqual(aChanges[1].getId(), oChangeContent2.fileName);
			assert.strictEqual(aChanges[1], newChange2);
			assert.strictEqual(aChanges[2].getId(), oChangeContent3.fileName);
			assert.strictEqual(aChanges[2], newChange3);
		});

		QUnit.test("Shall add propagation listener on the app component if an embedded component is passed", function (assert) {
			var oChangeContent = { };
			var done = assert.async();
			sandbox.stub(this.oChangePersistence, "addDirtyChange");
			sandbox.stub(this.oChangePersistence, "_addRunTimeCreatedChangeAndUpdateDependencies");
			sandbox.stub(Utils, "getAppComponentForControl")
				.callThrough()
				.withArgs(this._oComponentInstance)
				.callsFake(done);

			var fnAddPropagationListenerStub = sandbox.spy(this.oChangePersistence, "_addPropagationListener");

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			assert.ok(fnAddPropagationListenerStub.calledOnce, "then _addPropagationListener is called once");
			assert.notOk(fnAddPropagationListenerStub.calledWith(this._oAppComponentInstance), "then _addPropagationListener not called with the embedded component");
		});

		QUnit.test("Shall not add the same change twice", function (assert) {
			// possible scenario: change gets saved, then without reload undo and redo gets called. both would add a dirty change
			var oChangeContent;
			var aChanges;

			oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			var fnAddDirtyChangeSpy = sandbox.spy(this.oChangePersistence, "addDirtyChange");

			var oNewChange = this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			var oSecondChange = this.oChangePersistence.addChange(oNewChange, this._oComponentInstance);

			assert.ok(fnAddDirtyChangeSpy.calledWith(oChangeContent), "then addDirtyChange called with the change content");
			assert.ok(fnAddDirtyChangeSpy.callCount, 2, "addDirtyChange was called twice");
			aChanges = this.oChangePersistence._aDirtyChanges;
			assert.ok(aChanges);
			assert.strictEqual(aChanges.length, 1);
			assert.strictEqual(aChanges[0].getId(), oChangeContent.fileName);
			assert.strictEqual(aChanges[0], oNewChange);
			assert.deepEqual(oNewChange, oSecondChange);
		});

		QUnit.test("also adds the flexibility propagation listener in case the application component does not have one yet", function (assert) {
			var aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function (fnListener) {
				return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			});

			// check in case the life cycle of flexibility processing changes (possibly incompatible)
			assert.equal(aRegisteredFlexPropagationListeners.length, 0, "no initial propagation listener is present at startup");

			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function (fnListener) {
				return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			});

			assert.equal(aRegisteredFlexPropagationListeners.length, 1, "one propagation listener is added");
		});

		QUnit.test("adds the flexibility propagation listener only once even when adding multiple changes", function (assert) {
			var aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function (fnListener) {
				return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			});

			// check in case the life cycle of flexibility processing changes (possibly incompatible)
			assert.equal(aRegisteredFlexPropagationListeners.length, 0, "no propagation listener is present at startup");

			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};
			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function (fnListener) {
				return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			});

			assert.equal(aRegisteredFlexPropagationListeners.length, 1, "one propagation listener is added");
		});

		QUnit.test("also adds the flexibility propagation listener in case the application component does not have one yet (but other listeners)", function (assert) {
			this._oComponentInstance.addPropagationListener(function () {});

			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			var aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function (fnListener) {
				return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			});

			assert.equal(aRegisteredFlexPropagationListeners.length, 1, "one propagation listener is added");
		});

		QUnit.test("also adds the flexibility propagation listener in case the application component does not have one yet (but other listeners)", function (assert) {
			var fnAssertFlPropagationListenerCount = function (nNumber, sAssertionText) {
				var aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function (fnListener) {
					return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
				});
				assert.equal(aRegisteredFlexPropagationListeners.length, nNumber, sAssertionText);
			}.bind(this);

			var fnEmptyFunction = function() {};
			this._oComponentInstance.addPropagationListener(fnEmptyFunction.bind());

			fnAssertFlPropagationListenerCount(0, "no FL propagation listener was added");

			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: {},
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			fnAssertFlPropagationListenerCount(1, "no additional propagation listener was added");
		});
	});

	QUnit.module("sap.ui.fl.ChangePersistence saveChanges", {
		beforeEach: function () {
			sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(VariantManagementState, "loadInitialChanges").returns([]);
			var oBackendResponse = {changes: StorageUtils.getEmptyFlexDataResponse()};
			this.oLoadChangeStub = sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(oBackendResponse.changes);
			this._mComponentProperties = {
				name : "saveChangeScenario",
				appVersion : "1.2.3"
			};
			this._oComponentInstance = sap.ui.component({
				name: "sap/ui/fl/qunit/integration/testComponentComplex"
			});

			this.oCreateStub = sandbox.stub(CompatibilityConnector, "create").resolves();
			this.oDeleteChangeStub = sandbox.stub(CompatibilityConnector, "deleteChange").resolves();
			this.oLoadChangeStub = sandbox.stub(CompatibilityConnector, "loadChanges").resolves(oBackendResponse);
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);

			this.oServer = sinon.fakeServer.create();
		},
		afterEach: function () {
			this.oServer.restore();
			sandbox.restore();
			Cache._entries = {};
		}
	}, function() {
		QUnit.test("Shall save the dirty changes when adding a new change and return a promise", function (assert) {
			var oChangeContent;

			oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			return this.oChangePersistence.saveDirtyChanges().then(function() {
				assert.ok(this.oCreateStub.calledOnce);
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes for a draft when adding a new change and return a promise", function (assert) {
			var oChangeContent;

			oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			return this.oChangePersistence.saveDirtyChanges(undefined, undefined, true).then(function() {
				assert.equal(this.oCreateStub.callCount, 1, "the Connector was called once");
				assert.equal(this.oCreateStub.getCall(0).args[3], true, "the draft flag was passed");
			}.bind(this));
		});

		QUnit.test("(Save As scenario) Shall save the dirty changes for the created app variant when pressing a 'Save As' button and return a promise", function (assert) {
			var oChangeContent;

			oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			this.oServer.respondWith([
				200,
				{
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				},
				"{ \"changes\":[], \"contexts\":[], \"settings\":{\"isAtoEnabled\":true} }"
			]);

			this.oServer.autoRespond = true;

			var oAddChangeSpy = sandbox.spy(Cache, "addChange");

			return this.oChangePersistence.saveDirtyChanges(true).then(function() {
				assert.ok(this.oCreateStub.calledOnce);
				assert.equal(oAddChangeSpy.callCount, 0, "then addChange was never called for the change related to app variants");
			}.bind(this));
		});

		QUnit.test("Shall save all dirty changes with changes in DELETE state", function (assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" }
			};
			var oChange = new Change(oChangeContent);

			this.oChangePersistence.deleteChange(oChange);

			assert.equal(this.oChangePersistence.getDirtyChanges().length, 1, "then one dirty change exists initially");
			return this.oChangePersistence.saveDirtyChanges().then(function() {
				assert.equal(this.oDeleteChangeStub.callCount, 1);
				assert.equal(this.oCreateStub.callCount, 0);
				assert.equal(this.oChangePersistence.getDirtyChanges().length, 0, "then no dirty changes exist anymore");
			}.bind(this));
		});

		QUnit.test("Shall save passed dirty changes with changes in DELETE state", function (assert) {
			var oChangeNotToBeSaved = new Change({
				fileName: "Gizorillus1",
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" }
			});

			var oChangeToBeSaved = new Change({
				fileName: "Gizorillus2",
				fileType: "change",
				changeType: "addField",
				selector: { id: "control2" }
			});

			this.oChangePersistence.deleteChange(oChangeNotToBeSaved);
			this.oChangePersistence.deleteChange(oChangeToBeSaved);

			assert.equal(this.oChangePersistence.getDirtyChanges().length, 2, "then two dirty changes exists initially");
			return this.oChangePersistence.saveDirtyChanges(false, [oChangeToBeSaved]).then(function() {
				assert.equal(this.oDeleteChangeStub.callCount, 1);
				assert.equal(this.oCreateStub.callCount, 0);
				assert.equal(this.oChangePersistence.getDirtyChanges().length, 1, "then one dirty change still exists");
				assert.deepEqual(this.oChangePersistence.getDirtyChanges()[0], oChangeNotToBeSaved, "the the correct dirty change was not saved");
			}.bind(this));
		});

		QUnit.test("Shall save all dirty changes in a bulk", function (assert) {
			var oChangeContent1 = {
				fileName: "Gizorillus1",
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" }
			};

			var oChangeContent2 = {
				fileName: "Gizorillus2",
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" }
			};
			this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);

			assert.equal(this.oChangePersistence.getDirtyChanges().length, 2, "then two dirty changes exist initially");
			return this.oChangePersistence.saveDirtyChanges().then(function() {
				assert.ok(this.oCreateStub.calledOnce, "the create method of the connector is called once");
				assert.deepEqual(this.oCreateStub.getCall(0).args[0][0], oChangeContent1, "the first change was processed first");
				assert.deepEqual(this.oCreateStub.getCall(0).args[0][1], oChangeContent2, "the second change was processed afterwards");
				assert.equal(this.oChangePersistence.getDirtyChanges(), 0, "then no dirty changes exist any more");
			}.bind(this));
		});

		QUnit.test("Shall save passed dirty changes in a bulk", function (assert) {
			var oChangeContent1 = {
				fileName: "Gizorillus1",
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" }
			};

			var oChangeContent2 = {
				fileName: "Gizorillus2",
				fileType: "change",
				changeType: "addField",
				selector: { id: "control2" }
			};

			var oChangeToBeSaved = this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			var oChangeNotToBeSaved = this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);

			assert.equal(this.oChangePersistence.getDirtyChanges().length, 2, "then two dirty changes exist initially");
			return this.oChangePersistence.saveDirtyChanges(false, [oChangeToBeSaved]).then(function() {
				assert.ok(this.oCreateStub.calledOnce, "the create method of the connector is called once");
				assert.equal(this.oChangePersistence.getDirtyChanges().length, 1, "then one dirty change still exists");
				assert.deepEqual(this.oChangePersistence.getDirtyChanges()[0], oChangeNotToBeSaved, "then the correct change was not saved");
			}.bind(this));
		});

		QUnit.test("(Save As scenario) Shall save the dirty changes for the new created app variant in a bulk when pressing a 'Save As' button", function (assert) {
			var oChangeContent1;
			var oChangeContent2;

			oChangeContent1 = {
				fileName: "Gizorillus1",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "Gizorillus2",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};
			this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);

			this.oServer.respondWith([
				200,
				{
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				},
				"{ \"changes\":[], \"contexts\":[], \"settings\":{\"isAtoEnabled\":true} }"
			]);

			this.oServer.autoRespond = true;

			return this.oChangePersistence.saveDirtyChanges(true).then(function() {
				assert.ok(this.oCreateStub.calledOnce, "the create method of the connector is called once");
				assert.deepEqual(this.oCreateStub.getCall(0).args[0][0], oChangeContent1, "the first change was processed first");
				assert.deepEqual(this.oCreateStub.getCall(0).args[0][1], oChangeContent2, "the second change was processed afterwards");
			}.bind(this));
		});

		QUnit.test("Shall add and remove changes to the cache depending upon change category", function (assert) {
			var aSavedChanges = [];
			sandbox.stub(VariantManagementState, "updateVariantsState");

			var oChangeContent1 = {
				content : {
					title: "variant 0"
				},
				fileName: "variant0",
				fileType: "ctrl_variant",
				variantManagementReference: "variantManagementId"
			};

			var oChangeContent2 = {
				variantReference:"variant0",
				fileName:"controlChange0",
				fileType:"change",
				content:{},
				selector:{
					id:"selectorId"
				}
			};

			var oChangeContent3 = {
				fileType: "ctrl_variant_change",
				selector: {
					id : "variant0"
				}
			};

			var oChangeContent4 = {
				fileName: "setDefault",
				fileType: "ctrl_variant_management_change",
				content: {
					defaultVariant:"variant0"
				},
				selector: {
					id: "variantManagementId"
				}
			};

			var oChangeContent5 = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			aSavedChanges.push(
				this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance),
				this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance),
				this.oChangePersistence.addChange(oChangeContent3, this._oComponentInstance),
				this.oChangePersistence.addChange(oChangeContent4, this._oComponentInstance),
				this.oChangePersistence.addChange(oChangeContent5, this._oComponentInstance)
			);

			var oAddChangeSpy = sandbox.spy(Cache, "addChange");
			var oDeleteChangeSpy = sandbox.spy(Cache, "deleteChange");
			var mPropertyBag = {
				reference: this.oChangePersistence._mComponent.name,
				content: this.oChangePersistence._oVariantController.getChangeFileContent()
			};

			function _checkVariantSyncCall() {
				aSavedChanges.forEach(function (oSavedChange, iIndex) {
					if (iIndex < 4) { // only first 4 changes are variant related
						assert.ok(VariantManagementState.updateVariantsState.getCall(iIndex).calledWith(Object.assign(mPropertyBag, {changeToBeAddedOrDeleted: oSavedChange})), "then variant controller content was synced with the FlexState");
					}
				});
			}

			return this.oChangePersistence.saveDirtyChanges().then(function() {
				_checkVariantSyncCall();
				assert.equal(oAddChangeSpy.callCount, 1, "then addChange was called for only non-variant related change");
				assert.ok(oAddChangeSpy.calledWith(this._mComponentProperties, oChangeContent5));
				aSavedChanges.forEach(function(oSavedChange) {
					this.oChangePersistence.deleteChange(oSavedChange);
				}.bind(this));
				return this.oChangePersistence.saveDirtyChanges().then(function() {
					_checkVariantSyncCall();
					assert.ok(oDeleteChangeSpy.calledWith(this._mComponentProperties, aSavedChanges[4].getDefinition()));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("shall remove the change from the dirty changes, after is has been saved", function (assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			return this.oChangePersistence.saveDirtyChanges().then(function() {
				var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
				assert.strictEqual(aDirtyChanges.length, 0);
			}.bind(this));
		});

		QUnit.test("(Save As scenario) shall remove the change from the dirty changes, after it has been saved for the new app variant", function (assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			this.oServer.respondWith([
				200,
				{
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				},
				"{ \"changes\":[], \"contexts\":[], \"settings\":{\"isAtoEnabled\":true} }"
			]);

			this.oServer.autoRespond = true;

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			return this.oChangePersistence.saveDirtyChanges(true).then(function() {
				var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
				assert.strictEqual(aDirtyChanges.length, 0);
			}.bind(this));
		});

		QUnit.test("shall delete a change from the dirty changes, if it has just been added to the dirty changes, having a pending action of NEW", function (assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			var oChange = this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			this.oChangePersistence.deleteChange(oChange);

			var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
			assert.strictEqual(aDirtyChanges.length, 0);
		});

		QUnit.skip("shall not change the state of a dirty change in case of a connector error", function (assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			var oRaisedError = {messages: [{severity : "Error", text : "Error"}]};

			// this test requires a slightly different setup
			this.oLoadChangeStub.restore();
			sandbox.stub(CompatibilityConnector, "loadChanges").returns(Promise.resolve({changes: {changes: [oChangeContent]}}));
			this.oCreateStub.restore();
			sandbox.stub(CompatibilityConnector, "create").returns(Promise.reject(oRaisedError));

			this._updateCacheAndDirtyStateSpy = sandbox.spy(this.oChangePersistence, "_updateCacheAndDirtyState");

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			return this.oChangePersistence.saveDirtyChanges()
				['catch'](function(oError) {
					assert.equal(oError, oRaisedError, "the error object is correct");
					return this.oChangePersistence.getChangesForComponent();
				}.bind(this))
				.then(function(aChanges) {
					assert.equal(aChanges.length, 1, "Change is not deleted from the cache");
					var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
					assert.equal(aDirtyChanges.length, 1, "Change is still a dirty change");
					assert.equal(this._updateCacheAndDirtyStateSpy.callCount, 0, "no update of cache and dirty state took place");
				}.bind(this));
		});

		QUnit.test("shall keep a change in the dirty changes, if it has a pending action of DELETE", function (assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			var oChange = this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			oChange.markForDeletion();

			this.oChangePersistence.deleteChange(oChange);

			var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
			assert.strictEqual(aDirtyChanges.length, 1);
		});

		QUnit.test("shall delete a change from the dirty changes after the deletion has been saved", function (assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			// this test requires a slightly different setup
			this.oLoadChangeStub.restore();
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [oChangeContent]}}));

			return this.oChangePersistence.getChangesForComponent().then(function(aChanges) {
				this.oChangePersistence.deleteChange(aChanges[0]);
				return this.oChangePersistence.saveDirtyChanges();
			}.bind(this)).then(function() {
				var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
				assert.strictEqual(aDirtyChanges.length, 0);
			}.bind(this));
		});

		QUnit.test("saveSequenceOfDirtyChanges shall save a sequence of the dirty changes in a bulk", function (assert) {
			var oChangeContent1;
			var oChangeContent2;
			var oChangeContent3;

			oChangeContent1 = {
				fileName: "Gizorillus1",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "Gizorillus2",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			oChangeContent3 = {
				fileName: "Gizorillus3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};
			this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent3, this._oComponentInstance);

			var aDirtyChanges = [this.oChangePersistence._aDirtyChanges[0], this.oChangePersistence._aDirtyChanges[2]];

			return this.oChangePersistence.saveSequenceOfDirtyChanges(aDirtyChanges).then(function() {
				assert.equal(this.oCreateStub.callCount, 2, "the create method of the connector is called for each selected change");
				assert.deepEqual(this.oCreateStub.getCall(0).args[0], oChangeContent1, "the first change was processed first");
				assert.deepEqual(this.oCreateStub.getCall(1).args[0], oChangeContent3, "the second change was processed afterwards");
			}.bind(this));
		});

		QUnit.test("saveSequenceOfDirtyChanges shall save a sequence of the dirty changes in a bulk for drafts", function (assert) {
			var oChangeContent1;
			var oChangeContent2;
			var oChangeContent3;

			oChangeContent1 = {
				fileName: "Gizorillus1",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "Gizorillus2",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};

			oChangeContent3 = {
				fileName: "Gizorillus3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: { id: "control1" },
				content: { },
				originalLanguage: "DE"
			};
			this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent3, this._oComponentInstance);

			var aDirtyChanges = [this.oChangePersistence._aDirtyChanges[0], this.oChangePersistence._aDirtyChanges[2]];

			return this.oChangePersistence.saveSequenceOfDirtyChanges(aDirtyChanges, undefined, true).then(function() {
				assert.equal(this.oCreateStub.callCount, 2, "the create method of the connector is called for each selected change");
				assert.deepEqual(this.oCreateStub.getCall(0).args[0], oChangeContent1, "the first change was processed first");
				assert.equal(this.oCreateStub.getCall(0).args[3], true, "the draft flag was passed");
				assert.deepEqual(this.oCreateStub.getCall(1).args[0], oChangeContent3, "the second change was processed afterwards");
				assert.equal(this.oCreateStub.getCall(1).args[3], true, "the draft flag was passed");
			}.bind(this));
		});

		QUnit.test("addChangeForVariant should add a new change object into variants changes mapp with pending action is NEW", function(assert) {
			var mParameters = {
				id: "changeId",
				type: "filterBar",
				ODataService: "LineItems",
				texts: {variantName: "myVariantName"},
				content: {
					filterBarVariant: {},
					filterbar: [
						{
							group: "CUSTOM_GROUP",
							name: "MyOwnFilterField",
							partOfVariant: true,
							visibleInFilterBar: true
						}
					]
				},
				isVariant: true,
				packageName: "",
				isUserDependend: true
			};
			var sId = this.oChangePersistence.addChangeForVariant("persistencyKey", "SmartFilterbar", mParameters);
			assert.equal(sId, "changeId");
			assert.deepEqual(Object.keys(this.oChangePersistence._mVariantsChanges["SmartFilterbar"]), ["changeId"]);
			assert.equal(this.oChangePersistence._mVariantsChanges["SmartFilterbar"]["changeId"].getPendingAction(), "NEW");
		});

		QUnit.test("saveAllChangesForVariant should use the CompatibilityConnector to create the change in the backend if pending action is NEW, update when pending action is UPDATE and delete the change if pending action is DELETE", function(assert) {
			var mParameters = {
				id: "changeId",
				type: "filterBar",
				ODataService: "LineItems",
				texts: {variantName: "myVariantName"},
				content: {
					filterBarVariant: {},
					filterbar: [
						{
							group: "CUSTOM_GROUP",
							name: "MyOwnFilterField",
							partOfVariant: true,
							visibleInFilterBar: true
						}
					]
				},
				isVariant: true,
				packageName: "",
				isUserDependend: true
			};
			var sId = this.oChangePersistence.addChangeForVariant("persistencyKey", "SmartFilterbar", mParameters);
			assert.ok(sId);
			var oChange = this.oChangePersistence._mVariantsChanges["SmartFilterbar"]["changeId"];
			assert.equal(oChange.getPendingAction(), "NEW");
			var oCreatedContent = merge(oChange.getDefinition(), {support: { user: "creator"}});
			var oCreateResponse = {response: [oCreatedContent]};
			var oUpdatedContent = merge(oCreatedContent, {texts: { variantName: "newName"}});
			var oUpdateResponse = {response: oUpdatedContent};
			var oDeleteResponse = {};

			// this test requires a slightly different setup
			this.oCreateStub.restore();
			sandbox.stub(CompatibilityConnector, "create").returns(Promise.resolve(oCreateResponse));
			sandbox.stub(CompatibilityConnector, "update").returns(Promise.resolve(oUpdateResponse));
			this.oDeleteChangeStub.restore();
			this.oDeleteChangeStub = sandbox.stub(CompatibilityConnector, "deleteChange").returns(Promise.resolve(oDeleteResponse));

			return this.oChangePersistence.saveAllChangesForVariant("SmartFilterbar").then(function (aResults) {
				assert.ok(Array.isArray(aResults));
				assert.equal(aResults.length, 1);
				assert.strictEqual(aResults[0], oCreateResponse);
				assert.equal(oChange.getDefinition().support.user, "creator");
				assert.equal(oChange.getState(), Change.states.PERSISTED);
				oChange.setState(Change.states.DIRTY);
				return this.oChangePersistence.saveAllChangesForVariant("SmartFilterbar").then(function (aResults) {
					assert.strictEqual(aResults[0], oUpdateResponse);
					assert.equal(oChange.getDefinition().texts.variantName, "newName");
					assert.equal(oChange.getState(), Change.states.PERSISTED);
					oChange.markForDeletion();
					return this.oChangePersistence.saveAllChangesForVariant("SmartFilterbar").then(function (aResults) {
						assert.ok(Array.isArray(aResults));
						assert.equal(aResults.length, 1);
						assert.strictEqual(aResults[0], oDeleteResponse);
						assert.ok(this.oDeleteChangeStub.calledWith(oChange.getDefinition(), ""));
						assert.deepEqual(this.oChangePersistence._mVariantsChanges["SmartFilterbar"], {});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("saveAllChangesForVariant should update state of variant when using with non-backend connectors", function(assert) {
			var mParameters = {
				id: "changeId",
				type: "filterBar",
				ODataService: "LineItems",
				texts: {variantName: "myVariantName"},
				content: {
					filterBarVariant: {},
					filterbar: [
						{
							group: "CUSTOM_GROUP",
							name: "MyOwnFilterField",
							partOfVariant: true,
							visibleInFilterBar: true
						}
					]
				},
				isVariant: true,
				packageName: "",
				isUserDependend: true
			};
			var sId = this.oChangePersistence.addChangeForVariant("persistencyKey", "SmartFilterbar", mParameters);
			assert.ok(sId);
			var oChange = this.oChangePersistence._mVariantsChanges["SmartFilterbar"]["changeId"];
			assert.equal(oChange.getPendingAction(), "NEW");

			// this test requires a slightly different setup
			this.oCreateStub.restore();
			sandbox.stub(CompatibilityConnector, "create").resolves();
			sandbox.stub(CompatibilityConnector, "update").resolves();

			return this.oChangePersistence.saveAllChangesForVariant("SmartFilterbar").then(function (aResults) {
				assert.ok(Array.isArray(aResults));
				assert.equal(aResults.length, 1);
				assert.equal(aResults[0], undefined);
				assert.equal(oChange.getState(), Change.states.PERSISTED);
				oChange.setState(Change.states.DIRTY);
				return this.oChangePersistence.saveAllChangesForVariant("SmartFilterbar").then(function (aResults) {
					assert.equal(aResults[0], undefined);
					assert.equal(oChange.getState(), Change.states.PERSISTED);
					oChange.markForDeletion();
				});
			}.bind(this));
		});

		QUnit.test("saveAllChangesForVariant shall reject if the backend raises an error", function(assert) {
			var mParameters = {
				id: "changeId",
				type: "filterBar",
				ODataService: "LineItems",
				texts: {variantName: "myVariantName"},
				content: {
					filterBarVariant: {},
					filterbar: [
						{
							group: "CUSTOM_GROUP",
							name: "MyOwnFilterField",
							partOfVariant: true,
							visibleInFilterBar: true
						}
					]
				},
				isVariant: true,
				packageName: "",
				isUserDependend: true
			};
			var sId = this.oChangePersistence.addChangeForVariant("persistencyKey", "SmartFilterbar", mParameters);
			assert.ok(sId);
			assert.equal(this.oChangePersistence._mVariantsChanges["SmartFilterbar"]["changeId"].getPendingAction(), "NEW");


			// this test requires a slightly different setup
			this.oCreateStub.restore();
			sandbox.stub(CompatibilityConnector, "create").returns(Promise.reject({
				messages: [
					{text: "Backend says: Boom"}
				]
			}));

			return this.oChangePersistence.saveAllChangesForVariant("SmartFilterbar")['catch'](function(err) {
				assert.equal(err.messages[0].text, "Backend says: Boom");
			});
		});
	});

	QUnit.module("Given map dependencies need to be updated", {
		beforeEach: function () {
			sandbox.stub(FlexState, "initialize").resolves();
			this._mComponentProperties = {
				name: "MyComponent",
				appVersion: "1.2.3"
			};
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);
			sandbox.stub(LayerUtils, "getMaxLayer").returns(Layer.USER);
			var mDependencies = {};
			var mDependentChangesOnMe = {};

			var oChangeContent1 = {
				fileName: "Gizorillus1",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			var oChangeContent2 = {
				fileName: "Gizorillus2",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			var oChangeContent3 = {
				fileName: "Gizorillus3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oChange1 = new Change(oChangeContent1);
			this.oChange2 = new Change(oChangeContent2);
			this.oChange3 = new Change(oChangeContent3);

			mDependencies[this.oChange1.getId()] = {
				dependencies: [this.oChange2.getId()]
			};
			mDependentChangesOnMe[this.oChange2.getId()] = [this.oChange1.getId(), this.oChange3.getId()];

			this.oChangePersistence._mChanges = {
				aChanges: [this.oChange1, this.oChange2, this.oChange3],
				mChanges: {
					control1: [this.oChange1, this.oChange2]
				},
				mDependencies: mDependencies,
				mDependentChangesOnMe: mDependentChangesOnMe
			};

			this.oChangePersistence._mChangesInitial = merge({}, this.oChangePersistence._mChanges);
		},
		afterEach: function () {
			this.oChange1.destroy();
			this.oChange2.destroy();
			this.oChange3.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when '_deleteChangeInMap' is called", function (assert) {
			this.oChangePersistence._deleteChangeInMap(this.oChange1);
			assert.equal(this.oChangePersistence._mChanges.mChanges["control1"].length, 1, "then one change deleted from map");
			assert.strictEqual(this.oChangePersistence._mChanges.mChanges["control1"][0].getId(), this.oChange2.getId(), "then only second change present");
			assert.deepEqual(this.oChangePersistence._mChanges.mDependencies, {}, "then dependencies are cleared for change1");
			assert.equal(this.oChangePersistence._mChanges["mDependentChangesOnMe"][this.oChange2.getId()].length, 1, "then mDependentChangesOnMe for change2 only has one change");
			assert.strictEqual(this.oChangePersistence._mChanges["mDependentChangesOnMe"][this.oChange2.getId()][0], this.oChange3.getId(), "then mDependentChangesOnMe for change2 still has change3");
		});

		QUnit.test("when '_deleteChangeInMap' is called with a change created at runtime", function (assert) {
			this.oChangePersistence._deleteChangeInMap(this.oChange1, true);
			assert.equal(this.oChangePersistence._mChanges.mChanges["control1"].length, 1, "then one change deleted from map");
			assert.strictEqual(this.oChangePersistence._mChanges.mChanges["control1"][0].getId(), this.oChange2.getId(), "then only second change present");
			assert.ok(!jQuery.isEmptyObject(this.oChangePersistence._mChanges.mDependencies), "then dependencies in _mChanges are not cleared for change1");
			assert.ok(jQuery.isEmptyObject(this.oChangePersistence._mChangesInitial.mDependencies), "then dependencies in _mChangesInitial are cleared for change1");
			assert.equal(this.oChangePersistence._mChanges["mDependentChangesOnMe"][this.oChange2.getId()].length, 2, "then _mChanges.mDependentChangesOnMe for change2 is unchanged");
			assert.equal(this.oChangePersistence._mChangesInitial["mDependentChangesOnMe"][this.oChange2.getId()].length, 1, "then _mChangesInitial.mDependentChangesOnMe for change2 has only one change left");
			assert.strictEqual(this.oChangePersistence._mChangesInitial["mDependentChangesOnMe"][this.oChange2.getId()][0], this.oChange3.getId(), "then _mChangesInitial.mDependentChangesOnMe for change2 still has change3");
		});
	});

	QUnit.module("getResetAndPublishInfo", {
		beforeEach: function () {
			sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(CompatibilityConnector, "getFlexInfo").returns(
				Promise.resolve({
					isResetEnabled: true,
					isPublishEnabled: true
				})
			);
			this._mComponentProperties = {
				name: "testScenarioComponent",
				appVersion: "1.2.3"
			};
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "testScenarioComponent",
				appVersion: "1.2.3"
			};
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("call getResetAndPublishInfo", function (assert) {
			return this.oChangePersistence.getResetAndPublishInfo(this.mPropertyBag)
			.then(function (oResetAndPublishInfo) {
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, true, "isPublishEnabled is true");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
		QUnit.dump.maxDepth = iOriginalMaxDepth;
	});
});