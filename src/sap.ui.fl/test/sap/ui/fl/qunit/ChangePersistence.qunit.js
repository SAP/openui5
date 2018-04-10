/*global sinon, QUnit*/
sap.ui.require([
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Change",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Cache",
	"sap/ui/fl/registry/Settings",
	"sap/m/MessageBox"
],
function (ChangePersistence, FlexControllerFactory, Utils, Change, LrepConnector, Cache, Settings, MessageBox) {
	"use strict";
	sinon.config.useFakeTimers = false;

	// resource path for test manifests
	jQuery.sap.registerModulePath("sap/ui/fl/qunit/integration", "./integration");

	var sandbox = sinon.sandbox.create();
	var controls = [];

	QUnit.module("sap.ui.fl.ChangePersistence", {
		beforeEach: function () {
			this._mComponentProperties = {
				name: "MyComponent",
				appVersion: "1.2.3"
			};
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);
			this._oComponentInstance = sap.ui.component({
				name: "sap/ui/fl/qunit/integration/testComponentComplex"
			});
			Utils.setMaxLayerParameter("USER");
		},
		afterEach: function () {
			sandbox.restore();

			controls.forEach(function(control){
				control.destroy();
			});
		}
	});

	QUnit.test("Shall be instantiable", function (assert) {
		assert.ok(this.oChangePersistence, "Shall create a new instance");
	});

	QUnit.test("the cache key is returned asynchronous", function (assert) {
		var sChacheKey = "abc123";

		var oMockedWrappedContent = {
			changes: [{}],
			etag: "abc123",
			status: "success"
		};

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));

		return this.oChangePersistence.getCacheKey().then(function (oCacheKeyResponse) {
			assert.equal(oCacheKeyResponse, sChacheKey);
		});
	});

	QUnit.test("the cache key returns a tag if no cache key could be determined", function (assert) {
		var oMockedWrappedContent = {
			changes: [{}],
			etag: "",
			status: "success"
		};

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));

		return this.oChangePersistence.getCacheKey().then(function (oCacheKeyResponse) {
			assert.equal(oCacheKeyResponse, Cache.NOTAG);
		});
	});

	QUnit.test("when getChangesForComponent is called with no change cacheKey", function (assert) {
		var oSettingsStoreInstanceStub = this.stub(Settings, "_storeInstance");
		return this.oChangePersistence.getChangesForComponent({cacheKey : "<NO CHANGES>"}).then(function (aChanges) {
			assert.equal(aChanges.length, 0, "then empty array is returned");
			assert.equal(oSettingsStoreInstanceStub.callCount, 0 , "the _storeInstance function of the fl.Settings was not called.");
		});
	});

	QUnit.test("when getChangesForComponent is called with a variantSection when changes section is not empty", function (assert) {
		var oMockedWrappedContent = {
			"changes" : {
				"changes": [{
					fileType: "change",
					selector: {
						id: "controlId"
					}
				}],
				"variantSection" : {
					"variantManagementId" : {
						"variants" : [{
							"content" : {
								"content" : {
									"title": "variant 0"
								},
								"fileName": "variant0"
							},
							"controlChanges" : [],
							"variantChanges" : {}
						},
							{
								"content" : {
									"content" : {
										"title": "variant 1"
									},
									"fileName": "variant1"
								},
								"controlChanges" : [],
								"variantChanges" : {}
							}]
					}
				}
			}
		};

		var fnSetChangeFileContentSpy = this.spy(this.oChangePersistence._oVariantController, "_setChangeFileContent");
		var fnLoadInitialChangesStub = this.stub(this.oChangePersistence._oVariantController, "loadInitialChanges").returns([]);
		var fnApplyChangesOnVariantManagementStub = this.stub(this.oChangePersistence._oVariantController, "_applyChangesOnVariantManagement");
		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));

		return this.oChangePersistence.getChangesForComponent().then(function () {
			assert.ok(fnSetChangeFileContentSpy.calledOnce, "then _setChangeFileContent of VariantManagement called once as file content is not set");
			assert.ok(fnLoadInitialChangesStub.calledOnce, "then loadDefaultChanges of VariantManagement called for the first time");
			assert.ok(fnApplyChangesOnVariantManagementStub.calledOnce, "then applyChangesOnVariantManagement called once for one variant management reference, as file content is not set");
		}).then(function () {
			this.oChangePersistence.getChangesForComponent().then(function () {
				assert.ok(fnSetChangeFileContentSpy.calledOnce, "then _setChangeFileContent of VariantManagement not called again as file content is set");
				assert.ok(fnLoadInitialChangesStub.calledTwice, "then loadDefaultChanges of VariantManagement called again");
				assert.ok(fnApplyChangesOnVariantManagementStub.calledOnce, "then applyChangesOnVariantManagement not called again as file content is set\"");
			});
		}.bind(this));
	});

	QUnit.test("when getChangesForComponent is called with a variantSection and changes section is empty", function (assert) {
		var oMockedWrappedContent = {
			"changes" : {
				"changes": [],
				"variantSection" : {
					"variantManagementId" : {
						"variants" : [{
							"content" : {
								"content" : {
									"title": "variant 0"
								},
								"fileName": "variant0"
							},
							"controlChanges" : [],
							"variantChanges" : {}
						},
							{
								"content" : {
									"content" : {
										"title": "variant 1"
									},
									"fileName": "variant1"
								},
								"controlChanges" : [],
								"variantChanges" : {}
							}]
					}
				}
			}
		};

		var fnSetChangeFileContentSpy = this.spy(this.oChangePersistence._oVariantController, "_setChangeFileContent");
		var fnLoadInitialChangesStub = this.stub(this.oChangePersistence._oVariantController, "loadInitialChanges").returns([]);
		var fnApplyChangesOnVariantManagementStub = this.stub(this.oChangePersistence._oVariantController, "_applyChangesOnVariantManagement");
		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));

		return this.oChangePersistence.getChangesForComponent().then(function () {
			assert.ok(fnSetChangeFileContentSpy.calledOnce, "then _setChangeFileContent of VariantManagement called once as file content is not set");
			assert.ok(fnLoadInitialChangesStub.calledOnce, "then loadDefaultChanges of VariantManagement called for the first time");
			assert.ok(fnApplyChangesOnVariantManagementStub.calledOnce, "then applyChangesOnVariantManagement called once for one variant management reference, as file content is not set");
		}).then(function () {
			this.oChangePersistence.getChangesForComponent().then(function () {
				assert.ok(fnSetChangeFileContentSpy.calledOnce, "then _setChangeFileContent of VariantManagement not called again as file content is set");
				assert.ok(fnLoadInitialChangesStub.calledTwice, "then loadDefaultChanges of VariantManagement called again");
				assert.ok(fnApplyChangesOnVariantManagementStub.calledOnce, "then applyChangesOnVariantManagement not called again as file content is set\"");
			});
		}.bind(this));
	});

	QUnit.test("when getChangesForComponent is called with 'ctrl_variant' and 'ctrl_variant_change' fileTypes", function (assert) {
		var aWrappedContent = {
			changes: {
				changes: [
					{
						fileName: "variant0",
						fileType: "ctrl_variant",
						variantManagementReference: "varMgmt"
					},
					{
						fileName: "variant0",
						fileType: "ctrl_variant_change",
						changeType: "setTitle",
						variantReference: "variant0"
					}
				]
			}
		};
		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(aWrappedContent));
		return this.oChangePersistence.getChangesForComponent().then(function (aChanges) {
			assert.equal(aChanges[0].getId(), aWrappedContent.changes.changes[0].fileName, "then change with 'ctrl_variant' fileType received");
			assert.equal(aChanges[1].getId(), aWrappedContent.changes.changes[1].fileName, "then change with 'ctrl_variant_change' fileType received");
		});
	});

	QUnit.test("when getChangesForComponent is called with includeCtrlVariants and includeVariants set to true", function(assert) {
		var oMockedWrappedContent = {
			"changes" : {
				"changes": [
					{
						fileName: "change0",
						fileType: "change",
						selector: {
							id: "controlId"
						}
					}
				],
				"variantSection" : {
					"variantManagementId" : {
						"variants" : [
							{
								"content" : {
									"fileName": "variant0",
									"content" : {
										"title": "variant 0"
									},
									"fileType": "ctrl_variant",
									"variantManagementReference": "variantManagementId"
								},
								"controlChanges": [
									{
										"variantReference":"variant0",
										"fileName":"controlChange0",
										"fileType":"change",
										"content":{},
										"selector":{
											"id":"selectorId"
										}
									}
								],
								"variantChanges": {
									"setTitle": [
										{
											"fileName":"variantChange0",
											"fileType": "ctrl_variant_change",
											"selector": {
												"id" : "variant0"
											}
										}
									]
								},
								"changes" : []
							},
							{
								"content" : {
									"content" : {
										"title": "variant 1"
									},
									"fileName": "variant1",
									"fileType": "ctrl_variant",
									"variantManagementReference": "variantManagementId"
								},
								"controlChanges": [
								],
								"variantChanges": {
									"setTitle": [
										{
											"fileName":"variantChange1",
											"fileType": "ctrl_variant_change",
											"selector": {
												"id" : "variant1"
											}
										}
									],
									"setVisible": [
										{
											"fileName":"variantChange2",
											"fileType": "ctrl_variant_change",
											"selector": {
												"id" : "variant2_invisible"
											},
											"content": {
												"visible": false,
												"createdByReset": false
											}
										}
									]
								},
								"changes" : []
							},
							{
								"content" : {
									"content" : {
										"title": "variant 2"
									},
									"fileName": "variant2_invisible",
									"fileType": "ctrl_variant",
									"variantManagementReference": "variantManagementId"
								},
								"controlChanges": [
									{
										"variantReference":"variant2",
										"fileName":"controlChange1",
										"fileType":"change",
										"content":{},
										"selector":{
											"id":"selectorId"
										}
									}
								],
								"variantChanges": {
									"setVisible": [
										{
											"fileName":"variantChange3",
											"fileType": "ctrl_variant_change",
											"selector": {
												"id" : "variant2_invisible"
											},
											"content": {
												"visible": false,
												"createdByReset": true
											}
										}
									]
								},
								"changes" : []
							}
						],
						"variantManagementChanges": {
							"setDefault" : [{
								"fileName": "setDefault",
								"fileType": "ctrl_variant_management_change",
								"content": {
									"defaultVariant":"variant0"
								},
								"selector": {
									"id": "variantManagementId"
								}
							}]
						}
					}
				}
			}
		};

		var oInvisibleVariant = oMockedWrappedContent.changes.variantSection.variantManagementId.variants[2];
		var aInvisibleChangFileNames = [
			oInvisibleVariant.content.fileName,
			oInvisibleVariant.controlChanges[0].fileName,
			oInvisibleVariant.variantChanges.setVisible[0].fileName
		];

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));
		return this.oChangePersistence.getChangesForComponent({includeCtrlVariants: true, includeVariants: true}).then(function(aChanges) {
			var aFilteredChanges = aChanges.filter( function (oChange) {
				return aInvisibleChangFileNames.indexOf(oChange.getId()) > -1;
			});
			assert.ok(aFilteredChanges.length === 0, "then no changes belonging to invisible variant returned");
			assert.equal(aChanges.length, 8, "then all the visible variant related changes are part of the response");
		});
	});

	QUnit.test("getChangesForComponent shall not bind the messagebundle as a json model into app component if no VENDOR change is available", function(assert) {
		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({
			changes: { changes: [] },
			messagebundle: {"i_123": "translatedKey"}
		}));
		var mPropertyBag = {};
		mPropertyBag.oComponent = this._oComponentInstance;
		return this.oChangePersistence.getChangesForComponent(mPropertyBag).then(function(changes) {
			var oModel = this._oComponentInstance.getModel("i18nFlexVendor");
			assert.equal(oModel, undefined);
		}.bind(this));
	});

	QUnit.test("getChangesForComponent shall not bind the messagebundle as a json model into app component if no VENDOR change is available", function(assert) {
		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({
			changes: { changes: [{
				fileType: "change",
				selector: {
					id: "controlId"
				},
				layer : "VENDOR"
			}] },
			messagebundle: {"i_123": "translatedKey"}
		}));
		var mPropertyBag = {};
		mPropertyBag.oComponent = this._oComponentInstance;
		return this.oChangePersistence.getChangesForComponent(mPropertyBag).then(function(changes) {
			var oModel = this._oComponentInstance.getModel("i18nFlexVendor");
			assert.notEqual(oModel, undefined);
		}.bind(this));
	});

	QUnit.test("getChangesForComponent shall return the changes for the component", function(assert) {
		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: []}}));

		return this.oChangePersistence.getChangesForComponent().then(function(changes) {
			assert.ok(changes);
		});
	});

	QUnit.test("getChangesForComponent shall return the changes for the component when variantSection is empty", function(assert) {
		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(
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

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
			{
				fileName: "change1",
				layer: "VENDOR",
				fileType: "change",
				selector: {
					id: "controlId"
				}
			},
			{
				fileName: "change2",
				layer: "CUSTOMER",
				fileType: "change",
				selector: {
					id: "controlId1"
				}
			},
			{
				fileName: "change3",
				layer: "USER",
				fileType: "change",
				selector: {
					id: "controlId2"
				}
			}
		]}}));

		return this.oChangePersistence.getChangesForComponent({currentLayer: "CUSTOMER"}).then(function(changes) {
			assert.strictEqual(changes.length, 1, "1 change shall be returned");
			assert.strictEqual(changes[0].getDefinition().layer, "CUSTOMER", "then it returns only current layer (CUSTOMER) changes");
		});
	});

	QUnit.test("getChangesForComponent shall return the changes for the component, not filtering changes with the current layer", function(assert) {

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
			{
				fileName: "change1",
				layer: "VENDOR",
				fileType: "change",
				selector: {
					id: "controlId"
				}
			},
			{
				fileName: "change2",
				layer: "CUSTOMER",
				fileType: "change",
				selector: {
					id: "controlId1"
				}
			},
			{
				fileName: "change3",
				layer: "USER",
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

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
			{
				fileName: "file1",
				fileType: "change",
				changeType: "defaultVariant",
				layer: "CUSTOMER",
				selector: { persistencyKey: "SmartFilter_Explored" }
			},
			{
				fileName: "file2",
				fileType: "change",
				changeType: "renameGroup",
				layer: "CUSTOMER",
				selector: { id: "controlId1" }
			},
			{
				fileName: "file3",
				filetype: "change",
				changetype: "removeField",
				layer: "customer",
				selector: {}
			},
			{
				fileName: "file4",
				fileType: "variant",
				changeType: "filterBar",
				layer: "CUSTOMER",
				selector: { persistencyKey: "SmartFilter_Explored" }
			},
			{
				fileName: "file6",
				fileType: "variant",
				changeType: "filterBar",
				layer: "CUSTOMER"
			},
			{
				fileName: "file7",
				fileType: "change",
				changeType: "codeExt",
				layer: "CUSTOMER",
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

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
			{
				fileName: "file1",
				fileType: "change",
				changeType: "defaultVariant",
				layer: "CUSTOMER",
				selector: { persistencyKey: "SmartFilter_Explored" }
			},
			{
				fileName: "file2",
				fileType: "change",
				changeType: "defaultVariant",
				layer: "CUSTOMER",
				selector: {}
			},
			{
				fileName: "file3",
				fileType: "change",
				changeType: "renameGroup",
				layer: "CUSTOMER",
				selector: { id: "controlId1" }
			},
			{
				fileName: "file4",
				fileType: "variant",
				changeType: "filterBar",
				layer: "CUSTOMER",
				selector: { persistencyKey: "SmartFilter_Explored" }
			},
			{
				fileName: "file5",
				fileType: "variant",
				changeType: "filterBar",
				layer: "CUSTOMER"
			},
			{
				fileName: "file6",
				fileType: "variant",
				changeType: "filterBar",
				layer: "CUSTOMER"
			},
			{
				fileName: "file7",
				fileType: "change",
				changeType: "codeExt",
				layer: "CUSTOMER",
				selector: { id: "controlId2" }
			},
			{

				fileType: "somethingelse"
			},
			{
				fileName: "file8",
				fileType: "change",
				changeType: "appdescr_changes",
				layer: "CUSTOMER"
			}
		]}}));

		var fnWarningLogStub = sandbox.stub(jQuery.sap.log, "warning");

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
			assert.notOk(changes[4].getSelector() , "and does not have selector");
			assert.ok(fnWarningLogStub.calledOnce, "then the a log for warning is called once");
			assert.ok(fnWarningLogStub.calledWith, "A change without fileName is detected and excluded from component: MyComponent", "with correct component name");
		});
	});

	QUnit.test("getChangesForComponent shall only return changes in the max layer or below", function(assert) {

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
			{
				fileName:"change1",
				fileType: "change",
				layer: "USER",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change2",
				fileType: "change",
				layer: "VENDOR",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change3",
				fileType: "change",
				layer: "USER",
				selector: { id: "anotherControlId" },
				dependentSelector: []
			},
			{
				fileName:"change4",
				fileType: "change",
				layer: "CUSTOMER",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change5",
				fileType: "change",
				layer: "PARTNER",
				selector: { id: "controlId" },
				dependentSelector: []
			}
		]}}));

		Utils.setMaxLayerParameter("CUSTOMER");

		return this.oChangePersistence.getChangesForComponent().then(function(oChanges) {
			assert.strictEqual(oChanges.length, 3, "only changes which are under max layer are returned");
			assert.ok(oChanges[0].getId() === "change2", "with correct id");
			assert.ok(oChanges[1].getId() === "change4", "with correct id");
			assert.ok(oChanges[2].getId() === "change5", "with correct id");
		});
	});

	QUnit.test("getChangesForComponent shall ignore max layer parameter when current layer is set", function(assert) {

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
			{
				fileName:"change2",
				fileType: "change",
				layer: "VENDOR",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change3",
				fileType: "change",
				layer: "USER",
				selector: { id: "anotherControlId" },
				dependentSelector: []
			},
			{
				fileName:"change4",
				fileType: "change",
				layer: "CUSTOMER",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change5",
				fileType: "change",
				layer: "PARTNER",
				selector: { id: "controlId" },
				dependentSelector: []
			}
		]}}));

		Utils.setMaxLayerParameter("CUSTOMER");

		return this.oChangePersistence.getChangesForComponent({currentLayer: "CUSTOMER"}).then(function(oChanges) {
			assert.strictEqual(oChanges.length, 1, "only changes which are under max layer are returned");
			assert.ok(oChanges[0].getId() === "change4", "with correct id");
		});
	});

	QUnit.test("getChangesForComponent shall also pass the settings data to the fl.Settings", function(assert) {
		var oFileContent = {
			changes: {
				settings: {
					isKeyUser: true
				}
			}
		};
		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFileContent));
		var oSettingsStoreInstanceStub = this.stub(Settings, "_storeInstance");

		return this.oChangePersistence.getChangesForComponent().then(function() {
			assert.ok(oSettingsStoreInstanceStub.calledOnce, "the _storeInstance function of the fl.Settings was called.");
			var aPassedArguments = oSettingsStoreInstanceStub.getCall(0).args;
			assert.deepEqual(aPassedArguments[0], oFileContent.changes.settings, "the settings content was passed to the function");
		});
	});

	QUnit.test("getChangesForComponent shall also pass the returned data to the fl.Settings, but only if the data comes from the back end", function(assert) {
		var oFileContent = {};
		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFileContent));
		var oSettingsStoreInstanceStub = this.stub(Settings, "_storeInstance");

		return this.oChangePersistence.getChangesForComponent().then(function() {
			assert.ok(oSettingsStoreInstanceStub.notCalled, "the _storeInstance function of the fl.Settings was not called.");
		});
	});

	QUnit.test("getChangesForComponent ignore filtering when ignoreMaxLayerParameter property is available", function(assert) {

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
			{
				fileName:"change1",
				fileType: "change",
				layer: "USER",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change2",
				fileType: "change",
				layer: "VENDOR",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change3",
				fileType: "change",
				layer: "USER",
				selector: { id: "anotherControlId" },
				dependentSelector: []
			},
			{
				fileName:"change4",
				fileType: "change",
				layer: "CUSTOMER",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change5",
				fileType: "change",
				layer: "PARTNER",
				selector: { id: "controlId" },
				dependentSelector: []
			}
		]}}));

		Utils.setMaxLayerParameter("CUSTOMER");

		return this.oChangePersistence.getChangesForComponent({ignoreMaxLayerParameter : true}).then(function(oChanges) {
			assert.strictEqual(oChanges.length, 5, "filtering is ignored, all changes are returned");
		});
	});

	QUnit.test("getChangesForVariant does nothing if entry in variant changes map is available", function(assert) {
		var aStubChanges = [
			{
				fileName:"change1",
				fileType: "change",
				layer: "USER",
				selector: { id: "controlId" },
				dependentSelector: []
			}
		];
		var oStubGetChangesForComponent = this.stub(this.oChangePersistence, "getChangesForComponent");
		this.oChangePersistence._mVariantsChanges["SmartFilterBar"] = aStubChanges;
		return this.oChangePersistence.getChangesForVariant("someProperty", "SmartFilterBar", {}).then(function(aChanges) {
			assert.deepEqual(aChanges, aStubChanges);
			sinon.assert.notCalled(oStubGetChangesForComponent);
		});
	});

	QUnit.test("getChangesForVariant return promise reject when flexibility service is not available", function() {
		var oStubGetChangesForComponent = this.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve([]));
		var oStubGetServiceAvailabilityStatus = this.stub(LrepConnector, "isFlexServiceAvailable").returns(Promise.resolve(false));
		return this.oChangePersistence.getChangesForVariant("someProperty", "SmartFilterBar", {}).catch(function() {
			sinon.assert.calledOnce(oStubGetChangesForComponent);
			sinon.assert.calledOnce(oStubGetServiceAvailabilityStatus);
		});
	});

	QUnit.test("getChangesForVariant return promise reject when flexibility service availability is not definied", function() {
		var oStubGetChangesForComponent = this.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve([]));
		var oStubGetServiceAvailabilityStatus = this.stub(LrepConnector, "isFlexServiceAvailable").returns(Promise.resolve(undefined));
		return this.oChangePersistence.getChangesForVariant("someProperty", "SmartFilterBar", {}).then(function() {
			sinon.assert.calledOnce(oStubGetChangesForComponent);
			sinon.assert.calledOnce(oStubGetServiceAvailabilityStatus);
		});
	});

	QUnit.test("getChangesForVariant return promise resolve with empty object when flexibility service is available", function(assert) {
		var oStubGetChangesForComponent = this.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve([]));
		var oStubGetServiceAvailabilityStatus = this.stub(LrepConnector, "isFlexServiceAvailable").returns(Promise.resolve(true));
		return this.oChangePersistence.getChangesForVariant("someProperty", "SmartFilterBar", {}).then(function(aChanges) {
			assert.deepEqual(aChanges, {});
			sinon.assert.calledOnce(oStubGetChangesForComponent);
			sinon.assert.calledOnce(oStubGetServiceAvailabilityStatus);
		});
	});

	QUnit.test("getChangesForVariant call getChangesForComponent and filter results after that if entry in variant changes map is not available", function(assert) {
		var oPromise = new Promise(function(resolve, reject){
			setTimeout(function(){
				resolve({changes: {changes: [
							{
								fileName: "change1",
								fileType: "change",
								changeType: "defaultVariant",
								layer: "CUSTOMER",
								selector: { persistencyKey: "SmartFilter_Explored" },
								originalLanguage: "EN"
							},
							{
								fileName: "change2",
								fileType: "change",
								changeType: "defaultVariant",
								layer: "CUSTOMER",
								selector: {}
							},
							{
								fileName: "change3",
								fileType: "change",
								changeType: "renameGroup",
								layer: "CUSTOMER",
								selector: { id: "controlId1" }
							},
							{
								fileName: "variant1",
								fileType: "variant",
								changeType: "filterBar",
								layer: "CUSTOMER",
								selector: { persistencyKey: "SmartFilter_Explored" },
								originalLanguage: "EN"
							},
							{
								fileName: "variant2",
								fileType: "variant",
								changeType: "filterBar",
								layer: "CUSTOMER"
							},
							{
								fileName: "change4",
								fileType: "change",
								changeType: "codeExt",
								layer: "CUSTOMER",
								selector: { id: "controlId2" }
							},
							{
								fileType: "change",
								changeType: "appdescr_changes",
								layer: "CUSTOMER"
							}
						]}});
			}, 100);
		});
		this.stub(Cache, "getChangesFillingCache").returns(oPromise);
		var oPromise1 = this.oChangePersistence.getChangesForVariant("persistencyKey", "SmartFilter_Explored", {includeVariants: true});
		var oPromise2 = this.oChangePersistence.getChangesForVariant("persistencyKey", "SmartFilter_Explored", {includeVariants: true});
		return Promise.all([oPromise1, oPromise2]).then(function(values){
			assert.deepEqual(values[0], values[1]);
		});
	});

	QUnit.test("loadChangesMapForComponent shall return a map of changes for the component", function(assert) {

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
			{
				fileName:"change1",
				fileType: "change",
				layer: "USER",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change2",
				fileType: "change",
				layer: "VENDOR",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change3",
				fileType: "change",
				layer: "CUSTOMER",
				selector: { id: "anotherControlId" },
				dependentSelector: []
			}
			]}}));

		return this.oChangePersistence.loadChangesMapForComponent({}, {appComponent: ""}).then(function(fnGetChangesMap) {

			assert.ok(typeof fnGetChangesMap === "function", "a function is returned");
			var mChanges = fnGetChangesMap().mChanges;
			assert.ok(mChanges);
			assert.ok(mChanges["controlId"]);
			assert.ok(mChanges["anotherControlId"]);
			assert.equal(mChanges["controlId"].length, 2);
			assert.equal(mChanges["anotherControlId"].length, 1);
			assert.ok(mChanges["controlId"][0] instanceof Change, "Change is instanceof Change" );
			assert.ok(mChanges["controlId"][1] instanceof Change, "Change is instanceof Change" );
			assert.ok(mChanges["anotherControlId"][0] instanceof Change, "Change is instanceof Change" );
			assert.ok(mChanges["controlId"].some(function(oChange){return oChange.getId() === "change1";}));
			assert.ok(mChanges["controlId"].some(function(oChange){return oChange.getId() === "change2";}));
			assert.ok(mChanges["anotherControlId"].some(function(oChange){return oChange.getId() === "change3";}));
		});
	});

	QUnit.test("loadChangesMapForComponent returns a map with dependencies - test1", function(assert) {
		var oChange1 = new Change(Change.createInitialFileContent({
				id : "fileNameChange1",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "field3-2" },
				dependentSelector: {
					"alias" : [{
						id: "group3"
					},{
						id: "group2"
					}]
				}
		}));
		var oChange2 = new Change(Change.createInitialFileContent({
				id : "fileNameChange2",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "field3-2" },
				dependentSelector: {
					"alias" : [{
						id: "group2"
					},{
						id: "group1"
					}],
					"alias2" :{
						id: "field3-2"
					}
				}
		}));
		var oChange3 = new Change(Change.createInitialFileContent({
				id : "fileNameChange3",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "group1" }
		}));

		var mExpectedChanges = {
			mChanges: {
				"field3-2": [oChange1, oChange2],
				"group1": [oChange3]
			},
			mDependencies: {
				"fileNameChange1": {
					"changeObject": oChange1,
					"dependencies": [],
					"controlsDependencies": ["group3", "group2"]
				},
				"fileNameChange2": {
					"changeObject": oChange2,
					"dependencies": ["fileNameChange1"],
					"controlsDependencies": ["group2", "group1"]
				},
				"fileNameChange3": {
					"changeObject": oChange3,
					"dependencies": ["fileNameChange2"]
				}
			},
			mDependentChangesOnMe: {
				"fileNameChange1": ["fileNameChange2"],
				"fileNameChange2": ["fileNameChange3"]
			}
		};

		this.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve([
			oChange1,
			oChange2,
			oChange3
		]));

		return this.oChangePersistence.loadChangesMapForComponent({}, {appComponent: ""}).then(function(fnGetChangesMap) {

			assert.ok(typeof fnGetChangesMap === "function", "a function is returned");
			var mChanges = fnGetChangesMap();

			assert.deepEqual(mChanges, mExpectedChanges);
		});
	});

	QUnit.test("loadChangesMapForComponent returns a map with dependencies - test2", function(assert) {
		var oChange0 = new Change(Change.createInitialFileContent({
				id : "fileNameChange0",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "group1" }
		}));
		var oChange1 = new Change(Change.createInitialFileContent({
				id : "fileNameChange1",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "field3-2" },
				dependentSelector: {
					"alias" : [{
						id: "group3"
					},{
						id: "group2"
					}]
				}
		}));
		var oChange2 = new Change(Change.createInitialFileContent({
				id : "fileNameChange2",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "field3-2" },
				dependentSelector: {
					"alias" : [{
						id: "group2"
					},{
						id: "group1"
					}],
					"alias2" :{
						id: "field3-2"
					}
				}
		}));

		var mExpectedChanges = {
			mChanges: {
				"field3-2": [oChange1, oChange2],
				"group1": [oChange0]
			},
			mDependencies: {
				"fileNameChange1": {
					"changeObject": oChange1,
					"dependencies": [],
					"controlsDependencies": ["group3", "group2"]
				},
				"fileNameChange2": {
					"changeObject": oChange2,
					"dependencies": ["fileNameChange1", "fileNameChange0"],
					"controlsDependencies": ["group2", "group1"]
				}
			},
			mDependentChangesOnMe: {
				"fileNameChange0": ["fileNameChange2"],
				"fileNameChange1": ["fileNameChange2"]
			}
		};

		this.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve([
			oChange0,
			oChange1,
			oChange2
		]));

		return this.oChangePersistence.loadChangesMapForComponent({}, {appComponent: ""}).then(function(fnGetChangesMap) {

			assert.ok(typeof fnGetChangesMap === "function", "a function is returned");
			var mChanges = fnGetChangesMap();

			assert.deepEqual(mChanges, mExpectedChanges);
		});
	});

	QUnit.test("loadChangesMapForComponent returns a map with dependencies - test3", function(assert) {
		var oChange1 = new Change(Change.createInitialFileContent({
				id : "fileNameChange1",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "field3-2" },
				dependentSelector: {
					"alias" : {
						id: "group3"
					},
					"alias2" : {
						id: "group2"
					}
				}
		}));
		var oChange2 = new Change(Change.createInitialFileContent({
				id : "fileNameChange2",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "group2" }
		}));

		var mExpectedChanges = {
			mChanges: {
				"field3-2": [oChange1],
				"group2": [oChange2]
			},
			mDependencies: {
				"fileNameChange1": {
					"changeObject": oChange1,
					"dependencies": [],
					"controlsDependencies": ["group3", "group2"]
				},
				"fileNameChange2": {
					"changeObject": oChange2,
					"dependencies": ["fileNameChange1"]
				}
			},
			mDependentChangesOnMe: {
				"fileNameChange1": ["fileNameChange2"]
			}
		};

		this.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve([
			oChange1,
			oChange2
		]));

		return this.oChangePersistence.loadChangesMapForComponent({}, {appComponent: ""}).then(function(fnGetChangesMap) {

			assert.ok(typeof fnGetChangesMap === "function", "a function is returned");
			var mChanges = fnGetChangesMap();

			assert.deepEqual(mChanges, mExpectedChanges);
		});
	});

	QUnit.test("loadChangesMapForComponent returns a map with dependencies - test4", function(assert) {
		var oChange1 = new Change(Change.createInitialFileContent({
				id : "fileNameChange1",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "group2" }
		}));
		var oChange2 = new Change(Change.createInitialFileContent({
				id : "fileNameChange2",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "field3-2" },
				dependentSelector: {
					"alias" : {
						id: "group3"
					},
					"alias2" : {
						id: "group2"
					}
				}
		}));
		var mExpectedChanges = {
			mChanges: {
				"group2": [oChange1],
				"field3-2": [oChange2]
			},
			mDependencies: {
				"fileNameChange2": {
					"changeObject": oChange2,
					"dependencies": ["fileNameChange1"],
					"controlsDependencies": ["group3", "group2"]
				}
			},
			mDependentChangesOnMe: {
				"fileNameChange1": ["fileNameChange2"]
			}
		};

		this.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve([
			oChange1,
			oChange2
		]));

		return this.oChangePersistence.loadChangesMapForComponent({}, {appComponent: ""}).then(function(fnGetChangesMap) {

			assert.ok(typeof fnGetChangesMap === "function", "a function is returned");
			var mChanges = fnGetChangesMap();

			assert.deepEqual(mChanges, mExpectedChanges);
		});
	});

	QUnit.test("loadChangesMapForComponent returns a map with dependencies - test5", function(assert) {
		var oChange1 = new Change(Change.createInitialFileContent({
				id : "fileNameChange1",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "group2" }
		}));
		var oChange2 = new Change(Change.createInitialFileContent({
				id : "fileNameChange2",
				layer : "USER",
				namespace: "namespace",
				selector: { id: "group2" }
		}));

		var mExpectedChanges = {
			mChanges: {
				"group2": [oChange1, oChange2]
			},
			mDependencies: {
				"fileNameChange2": {
					"changeObject": oChange2,
					"dependencies": ["fileNameChange1"]
				}
			},
			mDependentChangesOnMe: {
				"fileNameChange1": ["fileNameChange2"]
			}
		};

		this.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve([
			oChange1,
			oChange2
		]));

		return this.oChangePersistence.loadChangesMapForComponent({}, {appComponent: ""}).then(function(fnGetChangesMap) {

			assert.ok(typeof fnGetChangesMap === "function", "a function is returned");
			var mChanges = fnGetChangesMap();

			assert.deepEqual(mChanges, mExpectedChanges);
		});
	});

	QUnit.test("loadChangesMapForComponent adds legacy change only once in case the component prefix matches the app component ID", function(assert) {
		var sAppComponentId = "appComponentId";

		var oComponent = {
			getId: function () {
				return sAppComponentId;
			},
			createId: function (sSuffix) {
				return sAppComponentId + "---" + sSuffix;
			}
		};

		var oChange = new Change({
			fileName:"change1",
			fileType: "change",
			layer: "USER",
			selector: { id: oComponent.createId("controlId") },
			dependentSelector: []
		});

		this.oChangePersistence._addChangeIntoMap(oComponent, oChange);

		assert.equal(Object.keys(this.oChangePersistence._mChanges.mChanges).length, 1, "thje change was written only once");
		assert.equal(this.oChangePersistence._mChanges.mChanges[oComponent.createId("controlId")][0], oChange,
			"the change was written for the selector ID");
	});

	QUnit.test("loadChangesMapForComponent adds legacy change twice in case the component prefix does not match the app component ID", function(assert) {
		var sAppComponentId = "appComponentId";

		var oComponent = {
			getId: function () {
				return sAppComponentId;
			},
			createId: function (sSuffix) {
				return sAppComponentId + "---" + sSuffix;
			}
		};

		var oChange = new Change({
			fileName:"change1",
			fileType: "change",
			layer: "USER",
			selector: { id: "anotherComponentId---controlId" },
			dependentSelector: []
		});

		this.oChangePersistence._addChangeIntoMap(oComponent, oChange);

		assert.equal(Object.keys(this.oChangePersistence._mChanges.mChanges).length, 2, "the change was written twice");
		assert.equal(this.oChangePersistence._mChanges.mChanges["anotherComponentId---controlId"].length, 1,
			"a change was written for the original selector ID");
		assert.equal(this.oChangePersistence._mChanges.mChanges["anotherComponentId---controlId"][0], oChange,
			"the change was written for the original selector ID");
		assert.equal(this.oChangePersistence._mChanges.mChanges["appComponentId---controlId"].length, 1,
			"a change was written for the selector ID concatenated with the app component ID");
		assert.equal(this.oChangePersistence._mChanges.mChanges["appComponentId---controlId"][0], oChange,
			"the change was written for the app selector ID");
	});

	QUnit.test("loadChangesMapForComponent adds non legacy change only once in case the component prefix does not match the app component ID", function(assert) {
		var sAppComponentId = "appComponentId";

		var oComponent = {
			getId: function () {
				return sAppComponentId;
			},
			createId: function (sSuffix) {
				return sAppComponentId + "---" + sSuffix;
			}
		};

		var oChange = new Change({
			fileName:"change1",
			fileType: "change",
			layer: "USER",
			selector: { id: "anotherComponentId---controlId", idIsLocal: false },
			dependentSelector: []
		});

		this.oChangePersistence._addChangeIntoMap(oComponent, oChange);

		assert.equal(Object.keys(this.oChangePersistence._mChanges.mChanges).length, 1, "the change was written only once");
		assert.equal(this.oChangePersistence._mChanges.mChanges["anotherComponentId---controlId"].length, 1,
			"a change was written for the original selector ID");
		assert.equal(this.oChangePersistence._mChanges.mChanges["anotherComponentId---controlId"][0], oChange,
			"the change was written for the original selector ID");
	});

	QUnit.test("deleteChanges shall remove the given change from the map", function(assert) {

		var that = this;

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
			{
				fileName:"change1",
				fileType: "change",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change2",
				fileType: "change",
				selector: { id: "controlId" },
				dependentSelector: []
			},
			{
				fileName:"change3",
				fileType: "change",
				selector: { id: "anotherControlId" },
				dependentSelector: []
			}
		]}}));

		return this.oChangePersistence.loadChangesMapForComponent({}, {appComponent: ""}).then(function(fnGetChangesMap) {
			var mChanges = fnGetChangesMap().mChanges;
			var oChangeForDeletion = mChanges["controlId"][1]; // second change for 'controlId' shall be removed
			that.oChangePersistence.deleteChange(oChangeForDeletion);
			assert.equal(mChanges["controlId"].length, 1, "'controlId' has only one change in the map");
			assert.equal(mChanges["controlId"][0].getId(), "change1", "the change has the id 'change1'");
			assert.equal(mChanges["anotherControlId"].length, 1, "'anotherControlId' has still one change in the map");
		});
	});

	QUnit.test("getChangesForView shall return the changes that are prefixed with the same view", function(assert) {

		var change1Button1 = {
			fileName:"change1Button1",
			fileType: "change",
			selector:{
				id: "view1--view2--button1"
			}
		};

		var change2Button1 = {
			fileName:"change2Button1",
			fileType: "change",
			selector: {
				id: "view1--button1"
			}
		};

		var change1Button2 = {
			fileName:"change1Button2",
			fileType: "change",
			selector: {
				id: "view1--button2"
			}
		};

		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({
			changes: {
				changes: [change1Button1, change2Button1, change1Button2]
			}
		}));

		var mPropertyBag = {viewId: "view1--view2"};

		return this.oChangePersistence.getChangesForView("view1--view2", mPropertyBag).then(function(changes) {
			assert.strictEqual(changes.length, 1);
			assert.strictEqual(changes.some(function(oChange){return oChange.getId() === "change1Button1";}), true);
			assert.strictEqual(changes.some(function(oChange){return oChange.getId() === "change1Button2";}), false);
			assert.strictEqual(changes.some(function(oChange){return oChange.getId() === "change2Button1";}), false);
		});
	});

	QUnit.test("when calling transportAllUIChanges successfully", function(assert) {
		var oMockTransportInfo = {
			packageName : "PackageName",
			transport : "transportId"
		};
		var oMockNewChange = {
			packageName : "$TMP",
			fileType : "change",
			id : "changeId2",
			namespace : "namespace",
			getDefinition : function(){
				return {
					packageName : this.packageName,
					fileType : this.fileType
				};
			},
			getId : function(){
				return this.id;
			},
			getNamespace : function(){
				return this.namespace;
			},
			setResponse : function(oDefinition){
				this.packageName = oDefinition.packageName;
			},
			getPackage : function(){
				return this.packageName;
			}
		};
		var aMockLocalChanges = [oMockNewChange];

		sandbox.stub(Utils, "getClient").returns('');
		var fnOpenTransportSelectionStub = sandbox.stub(this.oChangePersistence._oTransportSelection, "openTransportSelection").returns(Promise.resolve(oMockTransportInfo));
		var fnCheckTransportInfoStub = sandbox.stub(this.oChangePersistence._oTransportSelection, "checkTransportInfo").returns(true);
		var fnGetChangesForComponentStub = sandbox.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve(aMockLocalChanges));
		var fnPrepareChangesForTransportStub = sandbox.stub(this.oChangePersistence._oTransportSelection, "_prepareChangesForTransport").returns(Promise.resolve());

		return this.oChangePersistence.transportAllUIChanges().then(function(){
			assert.ok(fnOpenTransportSelectionStub.calledOnce, "then openTransportSelection called once");
			assert.ok(fnCheckTransportInfoStub.calledOnce, "then checkTransportInfo called once");
			assert.ok(fnGetChangesForComponentStub.calledOnce, "then getChangesForComponent called once");
			assert.ok(fnPrepareChangesForTransportStub.calledOnce, "then _prepareChangesForTransport called once");
			assert.ok(fnPrepareChangesForTransportStub.calledWith(oMockTransportInfo, aMockLocalChanges), "then _prepareChangesForTransport called with the transport info and changes array");
		});
	});

	QUnit.test("when calling transportAllUIChanges unsuccessfully", function(assert){
		sandbox.stub(this.oChangePersistence._oTransportSelection, "openTransportSelection").returns(Promise.reject());
		sandbox.stub(MessageBox, "show");
		return this.oChangePersistence.transportAllUIChanges().then(function(sResponse){
			assert.equal(sResponse, "Error", "then Promise.resolve() with error message is returned");
		});
	});

	QUnit.test("when calling transportAllUIChanges successfully, but with cancelled transport selection", function(assert){
		sandbox.stub(this.oChangePersistence._oTransportSelection, "openTransportSelection").returns(Promise.resolve());
		return this.oChangePersistence.transportAllUIChanges().then(function(sResponse){
			assert.equal(sResponse, "Cancel", "then Promise.resolve() with cancel message is returned");
		});
	});

	QUnit.test("when calling resetChanges", function (assert) {
		var done = assert.async();

		// changes for the component
		var oUserChange = new Change({
			"fileType": "change",
			"layer": "USER",
			"fileName": "a",
			"namespace": "b",
			"packageName": "c",
			"changeType": "labelChange",
			"creation": "",
			"reference": "",
			"selector": {
				"id": "abc123"
			},
			"content": {
				"something": "createNewVariant"
			}
		});

		var oVendorChange1 = new Change({
			"fileType": "change",
			"layer": "CUSTOMER",
			"fileName": "a",
			"namespace": "b",
			"packageName": "c",
			"changeType": "labelChange",
			"creation": "",
			"reference": "",
			"selector": {
				"id": "abc123"
			},
			"content": {
				"something": "createNewVariant"
			}
		});

		var oVendorChange2 = new Change({
			"fileType": "change",
			"layer": "CUSTOMER",
			"fileName": "a",
			"namespace": "b",
			"packageName": "c",
			"changeType": "labelChange",
			"creation": "",
			"reference": "",
			"selector": {
				"id": "abc123"
			},
			"content": {
				"something": "createNewVariant"
			}
		});

		var aChanges = [oVendorChange1, oUserChange, oVendorChange2];
		sandbox.stub(this.oChangePersistence, "getChangesForComponent").returns(Promise.resolve(aChanges));

		// Settings in registry
		var oSetting = {
			isKeyUser: true,
			isAtoAvailable: true,
			isProductiveSystem: function() {return false;},
			hasMergeErrorOccured: function() {return false;},
			isAtoEnabled: function() {return true;}
		};
		sandbox.stub(sap.ui.fl.registry.Settings, "getInstance").returns(Promise.resolve(oSetting));

		// LREP Connector
		var sExpectedUri = "/sap/bc/lrep/changes/" +
			"?reference=MyComponent" +
			"&appVersion=1.2.3" +
			"&layer=CUSTOMER" +
			"&generator=Change.createInitialFileContent" +
			"&changelist=ATO_NOTIFICATION";
		var oLrepStub = sandbox.stub(this.oChangePersistence._oConnector, "send").returns(Promise.resolve());

		this.oChangePersistence.resetChanges("CUSTOMER", "Change.createInitialFileContent").then(function() {
			assert.ok(oLrepStub.calledOnce, "the LrepConnector is called once");
			assert.equal(oLrepStub.args[0][0], sExpectedUri, "and with the correct URI");
			done();
		});
	});


	QUnit.module("sap.ui.fl.ChangePersistence addChange", {
		beforeEach: function () {
			this._mComponentProperties = {
				name : "saveChangeScenario",
				appVersion : "1.2.3"
			};
			this._oComponentInstance = sap.ui.component({
				name: "sap/ui/fl/qunit/integration/testComponentComplex"
			});
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);
		},
		afterEach: function () {
			sandbox.restore();
		}
	});

	QUnit.test("Shall add a new change and return it", function (assert) {
		var oChangeContent, aChanges;

		oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		var fnAddDirtyChangeSpy = sandbox.spy(this.oChangePersistence, "addDirtyChange");

		//Call CUT
		var newChange = this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

		assert.ok(fnAddDirtyChangeSpy.calledWith(oChangeContent), "then addDirtyChange called with the change content");
		aChanges = this.oChangePersistence._aDirtyChanges;
		assert.ok(aChanges);
		assert.strictEqual(aChanges.length, 1);
		assert.strictEqual(aChanges[0].getId(), oChangeContent.fileName);
		assert.strictEqual(aChanges[0], newChange);
	});

	QUnit.test("also adds the flexibility propagation listener in case the application component does not have one yet", function (assert) {
		var aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function (fnListener) {
			return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
		});

		// check in case the life cycle of flexibility processing changes (possibly incompatible)
		assert.equal(aRegisteredFlexPropagationListeners.length, 0, "bo propagation listener is present at startup");

		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
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
		assert.equal(aRegisteredFlexPropagationListeners.length, 0, "to propagation listener is present at startup");

		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
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
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
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

		var fnGetChangesMap = function () {
			return this.oChangePersistence._mChanges;
		}.bind(this);
		var oFlexController = FlexControllerFactory.create(this._mComponentProperties.name, this._mComponentProperties.appVersion);
		var fnPropagationListener = oFlexController.getBoundApplyChangesOnControl(fnGetChangesMap, this._oComponentInstance);

		this._oComponentInstance.addPropagationListener(fnPropagationListener);

		fnAssertFlPropagationListenerCount(1, "one propagation listener was added");

		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

		fnAssertFlPropagationListenerCount(1, "no additional propagation listener was added");
	});

	QUnit.module("sap.ui.fl.ChangePersistence saveChanges", {
		beforeEach: function () {
			this._mComponentProperties = {
				name : "saveChangeScenario",
				appVersion : "1.2.3"
			};
			this._oComponentInstance = sap.ui.component({
				name: "sap/ui/fl/qunit/integration/testComponentComplex"
			});
			this.lrepConnectorMock = {
				create: sinon.stub().returns(Promise.resolve()),
				deleteChange: sinon.stub().returns(Promise.resolve()),
				loadChanges: sinon.stub().returns(Promise.resolve({changes: {changes: []}}))
			};
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);
			this.oChangePersistence._oConnector = this.lrepConnectorMock;

			this.oServer = sinon.fakeServer.create();
		},
		afterEach: function () {
			this.oServer.restore();
			sandbox.restore();
			Cache._entries = {};
		}
	});

	QUnit.test("Shall save the dirty changes when adding a new change and return a promise", function (assert) {
		var oChangeContent;

		oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

		//Call CUT
		return this.oChangePersistence.saveDirtyChanges().then(function(){
			sinon.assert.calledOnce(this.lrepConnectorMock.create);
		}.bind(this));
	});

	QUnit.test("(Save As scenario) Shall save the dirty changes for the created app variant when pressing a 'Save As' button and return a promise", function (assert) {
		var oChangeContent;

		oChangeContent = {
			fileName: "Gizorillus",
			layer: "CUSTOMER",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
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

		//Call CUT
		return this.oChangePersistence.saveDirtyChanges(true).then(function(){
			sinon.assert.calledOnce(this.lrepConnectorMock.create);
			assert.equal(oAddChangeSpy.callCount, 0, "then addChange was never called for the change related to app variants");
		}.bind(this));
	});

	QUnit.test("Shall save the dirty changes when deleting a change and return a promise", function (assert) {
		var oChangeContent, oChange;

		oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};
		oChange = new Change(oChangeContent);

		this.oChangePersistence.deleteChange(oChange);

		//Call CUT
		return this.oChangePersistence.saveDirtyChanges().then(function(){
			sinon.assert.calledOnce(this.lrepConnectorMock.deleteChange);
			sinon.assert.notCalled(this.lrepConnectorMock.create);
		}.bind(this));
	});

	QUnit.test("Shall save the dirty changes in a bulk", function (assert) {
		assert.expect(3);
		// REVISE There might be more elegant implementation
		var oChangeContent1, oChangeContent2, oCreateStub;

		oCreateStub = this.lrepConnectorMock.create;

		oChangeContent1 = {
			fileName: "Gizorillus1",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		oChangeContent2 = {
			fileName: "Gizorillus2",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
		this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);

		//Call CUT
		return this.oChangePersistence.saveDirtyChanges().then(function(){
			assert.ok(oCreateStub.calledOnce, "the create method of the connector is called once");
			assert.deepEqual(oCreateStub.getCall(0).args[0][0], oChangeContent1, "the first change was processed first");
			assert.deepEqual(oCreateStub.getCall(0).args[0][1], oChangeContent2, "the second change was processed afterwards");
		});
	});

	QUnit.test("(Save As scenario) Shall save the dirty changes for the new created app variant in a bulk when pressing a 'Save As' button", function (assert) {
		assert.expect(3);
		var oChangeContent1, oChangeContent2, oCreateStub;

		oCreateStub = this.lrepConnectorMock.create;

		oChangeContent1 = {
			fileName: "Gizorillus1",
			layer: "CUSTOMER",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		oChangeContent2 = {
			fileName: "Gizorillus2",
			layer: "CUSTOMER",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
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

		//Call CUT
		return this.oChangePersistence.saveDirtyChanges(true).then(function(){
			assert.ok(oCreateStub.calledOnce, "the create method of the connector is called once");
			assert.deepEqual(oCreateStub.getCall(0).args[0][0], oChangeContent1, "the first change was processed first");
			assert.deepEqual(oCreateStub.getCall(0).args[0][1], oChangeContent2, "the second change was processed afterwards");
		});
	});

	QUnit.test("after a change creation has been saved, the change shall be added to the cache", function (assert) {
		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
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

		//Call CUT
		return this.oChangePersistence.getChangesForComponent().then(function() {
			return this.oChangePersistence.saveDirtyChanges();
		}.bind(this))
			.then(this.oChangePersistence.getChangesForComponent.bind(this.oChangePersistence))
			.then(function(aChanges) {
				assert.ok(aChanges.some(function(oChange) {
					return oChange.getId() === "Gizorillus";
				}), "Newly added change shall be added to Cache");
		});
	});

	QUnit.test("Shall not add a variant related change to the cache", function (assert) {
		var oChangeContent;

		oChangeContent = {
			"content" : {
				"title": "variant 0"
			},
			"fileName": "variant0",
			"fileType": "ctrl_variant",
			"variantManagementReference": "variantManagementId"
		};
		this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

		oChangeContent = {
			"variantReference":"variant0",
			"fileName":"controlChange0",
			"fileType":"change",
			"content":{},
			"selector":{
				"id":"selectorId"
			}
		};
		this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

		oChangeContent = {
			"fileType": "ctrl_variant_change",
			"selector": {
				"id" : "variant0"
			}
		};
		this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

		oChangeContent = {
			"fileName": "setDefault",
			"fileType": "ctrl_variant_management_change",
			"content": {
				"defaultVariant":"variant0"
			},
			"selector": {
				"id": "variantManagementId"
			}
		};
		this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

		oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};
		this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

		var oAddChangeSpy = sandbox.spy(Cache, "addChange");
		return this.oChangePersistence.saveDirtyChanges().then(function(){
			assert.equal(oAddChangeSpy.callCount, 1, "then addChange was only called for the change not related to variants");
		});
	});

	QUnit.test("(Save As scenario) after a change creation has been saved for the new app variant, the change shall not be added to the cache", function (assert) {
		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

		//Call CUT
		return this.oChangePersistence.getChangesForComponent().then(function() {
			return this.oChangePersistence.saveDirtyChanges(true);
		}.bind(this))
			.then(this.oChangePersistence.getChangesForComponent.bind(this.oChangePersistence))
			.then(function(aChanges) {
				assert.equal(aChanges.length, 0, "Newly added change shall not be added to Cache");
		});
	});

	QUnit.test("shall remove the change from the dirty changes, after is has been saved", function (assert) {
		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		this.lrepConnectorMock.loadChanges = sinon.stub().returns(Promise.resolve({changes: {changes: []}}));

		//Call CUT
		return this.oChangePersistence.getChangesForComponent().then(function() {
			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			return this.oChangePersistence.saveDirtyChanges();
		}.bind(this)).then(function() {
			var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
			assert.strictEqual(aDirtyChanges.length, 0);
		}.bind(this));
	});

	QUnit.test("(Save As scenario) shall remove the change from the dirty changes, after it has been saved for the new app variant", function (assert) {
		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		this.lrepConnectorMock.loadChanges = sinon.stub().returns(Promise.resolve({changes: {changes: []}}));

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

		//Call CUT
		return this.oChangePersistence.getChangesForComponent().then(function() {
			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			return this.oChangePersistence.saveDirtyChanges(true);
		}.bind(this)).then(function() {
			var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
			assert.strictEqual(aDirtyChanges.length, 0);
		}.bind(this));
	});

	QUnit.test("shall delete the change from the cache, after a change deletion has been saved", function (assert) {
		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		this.lrepConnectorMock.loadChanges = sinon.stub().returns(Promise.resolve({changes: {changes: [oChangeContent]}}));

		//Call CUT
		return this.oChangePersistence.getChangesForComponent()
			.then(function(aChanges){
				this.oChangePersistence.deleteChange(aChanges[0]);
				return this.oChangePersistence.saveDirtyChanges();
			}.bind(this))
			.then(this.oChangePersistence.getChangesForComponent.bind(this.oChangePersistence))
			.then(function(aChanges) {
				assert.strictEqual(aChanges.length, 0, "Change shall be deleted from the cache");
			});
	});

	QUnit.test("shall delete a change from the dirty changes, if it has just been added to the dirty changes, having a pending action of NEW", function (assert) {

		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		var oChange = this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

		//Call CUT
		this.oChangePersistence.deleteChange(oChange);

		var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
		assert.strictEqual(aDirtyChanges.length, 0);
	});

	QUnit.test("shall keep a change in the dirty changes, if it has a pending action of DELETE", function (assert) {

		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		var oChange = this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
		oChange.markForDeletion();

		//Call CUT
		this.oChangePersistence.deleteChange(oChange);

		var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
		assert.strictEqual(aDirtyChanges.length, 1);
	});

	QUnit.test("shall delete a change from the dirty changes after the deletion has been saved", function (assert) {
		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		this.lrepConnectorMock.loadChanges = sinon.stub().returns(Promise.resolve({changes: {changes: [oChangeContent]}}));

		return this.oChangePersistence.getChangesForComponent().then(function(aChanges) {
			//Call CUT
			this.oChangePersistence.deleteChange(aChanges[0]);
			return this.oChangePersistence.saveDirtyChanges();
		}.bind(this)).then(function() {
			var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
			assert.strictEqual(aDirtyChanges.length, 0);
		}.bind(this));
	});

	QUnit.test("saveSequenceOfDirtyChanges shall save a sequence of the dirty changes in a bulk", function (assert) {
		assert.expect(3);
		// REVISE There might be more elegant implementation
		var oChangeContent1, oChangeContent2, oChangeContent3, oCreateStub;

		oCreateStub = this.lrepConnectorMock.create;

		oChangeContent1 = {
			fileName: "Gizorillus1",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		oChangeContent2 = {
			fileName: "Gizorillus2",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		oChangeContent3 = {
			fileName: "Gizorillus3",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
		this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);
		this.oChangePersistence.addChange(oChangeContent3, this._oComponentInstance);

		var aDirtyChanges = [this.oChangePersistence._aDirtyChanges[0], this.oChangePersistence._aDirtyChanges[2]];

		//Call CUT
		return this.oChangePersistence.saveSequenceOfDirtyChanges(aDirtyChanges).then(function(){
			assert.ok(oCreateStub.calledTwice, "the create method of the connector is called for each selected change");
			assert.deepEqual(oCreateStub.getCall(0).args[0], oChangeContent1, "the first change was processed first");
			assert.deepEqual(oCreateStub.getCall(1).args[0], oChangeContent3, "the second change was processed afterwards");
		});
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

	QUnit.test("saveAllChangesForVariant should use the lrep connector to create the change in the backend if pending action is NEW or delete the change if pending action is DELETE", function(assert) {
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
		var oCreateResponse = {response : oChange._oDefinition};
		var oDeleteResponse = {};
		this.lrepConnectorMock.create = sinon.stub().returns(Promise.resolve(oCreateResponse));
		this.lrepConnectorMock.deleteChange = sinon.stub().returns(Promise.resolve(oDeleteResponse));

		return this.oChangePersistence.saveAllChangesForVariant("SmartFilterbar").then(function (aResults) {
			assert.ok(jQuery.isArray(aResults));
			assert.equal(aResults.length, 1);
			assert.strictEqual(aResults[0], oCreateResponse);
			oChange.markForDeletion();
			return this.oChangePersistence.saveAllChangesForVariant("SmartFilterbar").then(function (aResults) {
				assert.ok(jQuery.isArray(aResults));
				assert.equal(aResults.length, 1);
				assert.strictEqual(aResults[0], oDeleteResponse);
				var bIsVariant = true;
				sinon.assert.calledWith(this.lrepConnectorMock.deleteChange, {
					sChangeName: "changeId",
					sChangelist: "",
					sLayer: "CUSTOMER",
					sNamespace: "apps/saveChangeScenario/changes/"
				}, bIsVariant);
				assert.deepEqual(this.oChangePersistence._mVariantsChanges["SmartFilterbar"], {});
			}.bind(this));
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
		this.lrepConnectorMock.create = sinon.stub().returns(Promise.resolve(Promise.reject({
			messages: [
				{text: "Backend says: Boom"}
			]
		})));

		this.oChangePersistence.saveAllChangesForVariant("SmartFilterbar")['catch'](function(err) {
			assert.equal(err.messages[0].text, "Backend says: Boom");
		});
	});

	QUnit.module("Given map dependencies need to be updated", {
		beforeEach: function (assert) {
			this._mComponentProperties = {
				name: "MyComponent",
				appVersion: "1.2.3"
			};
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);
			Utils.setMaxLayerParameter("USER");

			var oChangeContent1 = {
				fileName: "Gizorillus1",
				layer: "VENDOR",
				fileType: "change",
				changeType: "addField",
				selector: {"id": "control1"},
				content: {},
				originalLanguage: "DE"
			};

			var oChangeContent2 = {
				fileName: "Gizorillus2",
				layer: "VENDOR",
				fileType: "change",
				changeType: "addField",
				selector: {"id": "control1"},
				content: {},
				originalLanguage: "DE"
			};

			var oChangeContent3 = {
				fileName: "Gizorillus3",
				layer: "VENDOR",
				fileType: "change",
				changeType: "addField",
				selector: {"id": "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oChange1 = new Change(oChangeContent1);
			this.oChange2 = new Change(oChangeContent2);
			this.oChange3 = new Change(oChangeContent3);
			this.oChange1Id = this.oChange1.getId();
			this.oChange2Id = this.oChange2.getId();
			this.oChange3Id = this.oChange3.getId();

			this.mChanges = {
				"mChanges": {
					"control1": [this.oChange1, this.oChange2]
				},
				"mDependencies": {},
				"mDependentChangesOnMe": {}
			};
			this.mChanges["mDependencies"][this.oChange1Id] = {"dependencies": [this.oChange2Id]};
			this.mChanges["mDependentChangesOnMe"][this.oChange2Id] = [this.oChange1Id, this.oChange3Id];

			this.oChangePersistence._mChanges = this.mChanges;
		},
		afterEach: function (assert) {
			this.oChange1.destroy();
			this.oChange2.destroy();
			this.oChange3.destroy();
			delete this.oChange1Id;
			delete this.oChange2Id;
			delete this.oChange3Id;
			delete this.mChanges;
			sandbox.restore();
			controls.forEach(function(control){
				control.destroy();
			});
		}
	});

	QUnit.test("when '_deleteChangeInMap' is called", function (assert) {
		this.oChangePersistence._deleteChangeInMap(this.oChange1);
		assert.equal(this.oChangePersistence._mChanges.mChanges["control1"].length, 1, "then one change deleted from map");
		assert.strictEqual(this.oChangePersistence._mChanges.mChanges["control1"][0].getId(), this.oChange2.getId(), "then only second change present");
		assert.deepEqual(this.oChangePersistence._mChanges.mDependencies, {}, "then dependencies are cleared for change1");
		assert.equal(this.oChangePersistence._mChanges["mDependentChangesOnMe"][this.oChange2Id].length, 1, "then mDependentChangesOnMe for change2 only has one change");
		assert.strictEqual(this.oChangePersistence._mChanges["mDependentChangesOnMe"][this.oChange2Id][0], this.oChange3Id, "then mDependentChangesOnMe for change2 still has change3");
	});
});
