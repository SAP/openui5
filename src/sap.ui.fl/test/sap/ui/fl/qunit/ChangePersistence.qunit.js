/*global sinon, QUnit*/
sap.ui.require([
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Change",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Cache",
	"sap/ui/fl/registry/Settings"
],
function (ChangePersistence, FlexControllerFactory, Utils, Change, LrepConnector, Cache, Settings) {
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

	QUnit.test("when getChangesForComponent is called with a variantSection", function (assert) {
		var done = assert.async();
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
								"fileName": "variant0",
								"title": "variant 0"
							},
							"changes" : []
						},
							{
								"content" : {
									"fileName": "variant1",
									"title": "variant 1"
								},
								"changes" : []
							}]
					}
				}
			}
		};
		var fnSetChangeFileContentSpy = this.spy(this.oChangePersistence._oVariantController, "_setChangeFileContent");
		var fnLoadDefaultChangesStub = this.stub(this.oChangePersistence._oVariantController, "loadDefaultChanges").returns([]);

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));

		return this.oChangePersistence.getChangesForComponent().then(function () {
			assert.ok(fnSetChangeFileContentSpy.calledOnce, "then _setChangeFileContent of VariantManagement called once as file content is not set");
			assert.ok(fnLoadDefaultChangesStub.calledOnce, "then loadDefaultChanges of VariantManagement called once as file content is not set");
		}).then(function () {
			this.oChangePersistence.getChangesForComponent().then(function () {
				assert.ok(fnSetChangeFileContentSpy.calledOnce, "then _setChangeFileContent of VariantManagement not called again as file content is set");
				assert.ok(fnLoadDefaultChangesStub.calledOnce, "then loadDefaultChanges of VariantManagement not called again as file content is set");
				done();
			});
		}.bind(this));
	});

	QUnit.test("getChangesForComponent shall not bind the messagebundle as a json model into app component if no VENDOR change is available", function(assert) {
		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({
			changes: { changes: [] },
			messagebundle: {"i_123": "translatedKey"}
		}));
		var mPropertyBag = {};
		mPropertyBag.oComponent = this._oComponentInstance;
		return this.oChangePersistence.getChangesForComponent(mPropertyBag).then(function() {
			var oModel = this._oComponentInstance.getModel("i18nFlexVendor");
			assert.equal(oModel, undefined);
		}.bind(this));
	});

	QUnit.test("getChangesForComponent shall bind the messagebundle as a json model into app component if no VENDOR change is available", function(assert) {
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
		return this.oChangePersistence.getChangesForComponent(mPropertyBag).then(function() {
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

	QUnit.test("getChangesForComponent shall return the changes for the component", function(assert) {

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [{
			fileType: "change",
			selector: {
				id: "controlId"
			}
		}]}}));

		return this.oChangePersistence.getChangesForComponent().then(function(changes) {
			assert.strictEqual(changes.length, 1, "Changes is an array of length one");
			assert.ok(changes[0] instanceof Change, "Change is instanceof Change");
		});
	});

	QUnit.test("getChangesForComponent shall return the changes for the component, filtering changes with the current layer (CUSTOMER)", function(assert) {

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [
			{
				layer: "VENDOR",
				fileType: "change",
				selector: {
					id: "controlId"
				}
			},
			{
				layer: "CUSTOMER",
				fileType: "change",
				selector: {
					id: "controlId1"
				}
			},
			{
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
				layer: "VENDOR",
				fileType: "change",
				selector: {
					id: "controlId"
				}
			},
			{
				layer: "CUSTOMER",
				fileType: "change",
				selector: {
					id: "controlId1"
				}
			},
			{
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
				fileType: "change",
				changeType: "defaultVariant",
				layer: "CUSTOMER",
				selector: { persistencyKey: "SmartFilter_Explored" }
			},
			{
				fileType: "change",
				changeType: "renameGroup",
				layer: "CUSTOMER",
				selector: { id: "controlId1" }
			},
			{
				filetype: "change",
				changetype: "removeField",
				layer: "customer",
				selector: {}
			},
			{
				fileType: "variant",
				changeType: "filterBar",
				layer: "CUSTOMER",
				selector: { persistencyKey: "SmartFilter_Explored" }
			},
			{
				fileType: "variant",
				changeType: "filterBar",
				layer: "CUSTOMER"
			},
			{
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
				fileType: "change",
				changeType: "defaultVariant",
				layer: "CUSTOMER",
				selector: { persistencyKey: "SmartFilter_Explored" }
			},
			{
				fileType: "change",
				changeType: "defaultVariant",
				layer: "CUSTOMER",
				selector: {}
			},
			{
				fileType: "change",
				changeType: "renameGroup",
				layer: "CUSTOMER",
				selector: { id: "controlId1" }
			},
			{
				fileType: "variant",
				changeType: "filterBar",
				layer: "CUSTOMER",
				selector: { persistencyKey: "SmartFilter_Explored" }
			},
			{
				fileType: "variant",
				changeType: "filterBar",
				layer: "CUSTOMER"
			},
			{
				fileType: "variant",
				changeType: "filterBar",
				layer: "CUSTOMER"
			},
			{
				fileType: "change",
				changeType: "codeExt",
				layer: "CUSTOMER",
				selector: { id: "controlId2" }
			},
			{
				fileType: "somethingelse"
			},
			{
				fileType: "change",
				changeType: "appdescr_changes",
				layer: "CUSTOMER"
			}
		]}}));


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

	QUnit.test("copyDependenciesFromInitialChangesMap", function(assert) {
		var oChange0 = {
			getId: function() {
				return "fileNameChange0";
			}
		};
		var oChange1 = {
			getId: function() {
				return "fileNameChange1";
			}
		};
		var oChange2 = {
			getId: function() {
				return "fileNameChange2";
			}
		};
		var mChanges = {
			"field3-2": [oChange1, oChange2],
			"group1": [oChange0]
		};
		var mInitialDependenciesMap = {
			mChanges: mChanges,
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
		var mCurrentDependenciesMap = {
			mChanges: mChanges,
			mDependencies: {},
			mDependentChangesOnMe: {}
		};
		var mExpectedDependenciesMapAfterFirstChange = {
			mChanges: mChanges,
			mDependencies: {
				"fileNameChange1": {
					"changeObject": oChange1,
					"dependencies": [],
					"controlsDependencies": ["group3", "group2"]
				}
			},
			mDependentChangesOnMe: {}
		};

		var mExpectedDependenciesMapAfterSecondChange = {
			mChanges: mChanges,
			mDependencies: {
				"fileNameChange1": {
					"changeObject": oChange1,
					"dependencies": [],
					"controlsDependencies": ["group3", "group2"]
				},
				"fileNameChange2": {
					"changeObject": oChange2,
					"dependencies": [],
					"controlsDependencies": ["group2", "group1"]
				}
			},
			mDependentChangesOnMe: {}
		};

		this.oChangePersistence._mChangesInitial = mInitialDependenciesMap;
		this.oChangePersistence._mChanges = mCurrentDependenciesMap;
		function fnCallbackTrue() {
			return true;
		}
		function fnCallbackFalse() {
			return false;
		}

		var mUpdatedDependenciesMap = this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange0, fnCallbackTrue);
		assert.deepEqual(mUpdatedDependenciesMap, mCurrentDependenciesMap, "no dependencies got copied");

		mUpdatedDependenciesMap = this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange1, fnCallbackTrue);
		assert.deepEqual(mUpdatedDependenciesMap, mExpectedDependenciesMapAfterFirstChange, "all dependencies from change1 got copied");

		mUpdatedDependenciesMap = this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange2, fnCallbackFalse);
		assert.deepEqual(mUpdatedDependenciesMap, mExpectedDependenciesMapAfterSecondChange, "no dependencies from change2 got copied");

		mUpdatedDependenciesMap = this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange2, fnCallbackTrue);
		assert.deepEqual(mUpdatedDependenciesMap, mInitialDependenciesMap, "all dependencies from change2 got copied");

		assert.deepEqual(mUpdatedDependenciesMap, this.oChangePersistence._mChanges, "the updated dependencies map is saved in the internal changes map");
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

		var fnGetChangesMap = function () {
			return this.oChangePersistence._mChanges;
		}.bind(this);
		var oFlexController = FlexControllerFactory.create(this._mComponentProperties.name, this._mComponentProperties.appVersion);
		var fnPropagationListener = oFlexController.getBoundApplyChangesOnControl(fnGetChangesMap, this._oComponentInstance);

		this._oComponentInstance.addPropagationListener(fnPropagationListener);

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

		//Call CUT
		return this.oChangePersistence.saveAsDirtyChanges("AppVariantId").then(function(){
			sinon.assert.calledOnce(this.lrepConnectorMock.create);
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
		return this.oChangePersistence.saveAsDirtyChanges("AppVariantId").then(function(){
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
			return this.oChangePersistence.saveAsDirtyChanges("AppVariantId");
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

	QUnit.test("(Save As scenario) shall remove the change from the dirty changes, after is has been saved for the new app variant", function (assert) {
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
			return this.oChangePersistence.saveAsDirtyChanges("AppVariantId");
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
