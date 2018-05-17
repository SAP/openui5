/*globals sinon, QUnit*/
jQuery.sap.require("sap.ui.fl.ChangePersistence");
jQuery.sap.require("sap.ui.fl.Utils");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.LrepConnector");
jQuery.sap.require("sap.ui.core.Control");
jQuery.sap.require("sap.ui.fl.Cache");
jQuery.sap.require("sap.ui.fl.registry.Settings");

(function (utils, ChangePersistence, Control, Change, LrepConnector, Cache, Settings) {
	"use strict";
	sinon.config.useFakeTimers = false;

	var sandbox = sinon.sandbox.create();
	var controls = [];

	QUnit.module("sap.ui.fl.ChangePersistence", {
		beforeEach: function () {
			this.sComponentName = "MyComponent";
			this.oChangePersistence = new ChangePersistence(this.sComponentName);
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

	QUnit.test("when getChangesForComponent is called with no change cacheKey", function (assert) {
		var oSettingsStoreInstanceStub = this.stub(Settings, "_storeInstance");
		return this.oChangePersistence.getChangesForComponent({cacheKey : "<NO CHANGES>"}).then(function (aChanges) {
			assert.equal(aChanges.length, 0, "then empty array is returned");
			assert.equal(oSettingsStoreInstanceStub.callCount, 0 , "the _storeInstance function of the fl.Settings was not called.");
			});
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

	QUnit.test("getChangesForComponent shall return the changes for the component, filtering changes having no selector", function(assert) {

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [{
			fileType: "change"
		}]}}));

		return this.oChangePersistence.getChangesForComponent().then(function(changes) {
			assert.strictEqual(changes.length, 0, "No changes shall be returned");
		});
	});

	QUnit.test("getChangesForComponent shall return the changes for the component, filtering default variant changes", function(assert) {

		this.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({changes: {changes: [{
			fileType: "change",
			changeType: "defaultVariant"
		}]}}));

		return this.oChangePersistence.getChangesForComponent().then(function(changes) {
			assert.strictEqual(changes.length, 0, "No changes shall be returned");
		});
	});
	QUnit.test("getChangesForComponent shall also pass the settings data to the fl.Settings", function(assert) {
		var oFileContent = {
			changes: {
				settings: { isKeyUser: true }
			}};
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

	QUnit.test("loadChangesMapForComponent shall return a map of changes for the component", function(assert) {

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
				"fileNameChange2USERnamespace": {
					"changeObject": oChange2,
					"dependencies": ["fileNameChange1USERnamespace"]
				},
				"fileNameChange3USERnamespace": {
					"changeObject": oChange3,
					"dependencies": ["fileNameChange2USERnamespace"]
				}
			},
			mDependentChangesOnMe: {
				"fileNameChange1USERnamespace": ["fileNameChange2USERnamespace"],
				"fileNameChange2USERnamespace": ["fileNameChange3USERnamespace"]
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
				"fileNameChange2USERnamespace": {
					"changeObject": oChange2,
					"dependencies": ["fileNameChange1USERnamespace", "fileNameChange0USERnamespace"]
				}
			},
			mDependentChangesOnMe: {
				"fileNameChange0USERnamespace": ["fileNameChange2USERnamespace"],
				"fileNameChange1USERnamespace": ["fileNameChange2USERnamespace"]
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
				"fileNameChange2USERnamespace": {
					"changeObject": oChange2,
					"dependencies": ["fileNameChange1USERnamespace"]
				}
			},
			mDependentChangesOnMe: {
				"fileNameChange1USERnamespace": ["fileNameChange2USERnamespace"]
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
				"fileNameChange2USERnamespace": {
					"changeObject": oChange2,
					"dependencies": ["fileNameChange1USERnamespace"]
				}
			},
			mDependentChangesOnMe: {
				"fileNameChange1USERnamespace": ["fileNameChange2USERnamespace"]
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
				"fileNameChange2USERnamespace": {
					"changeObject": oChange2,
					"dependencies": ["fileNameChange1USERnamespace"]
				}
			},
			mDependentChangesOnMe: {
				"fileNameChange1USERnamespace": ["fileNameChange2USERnamespace"]
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
			this.sComponentName = "MyComponent";
			this.oChangePersistence = new ChangePersistence(this.sComponentName, this.lrepConnectorMock);
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

		//Call CUT
		var newChange = this.oChangePersistence.addChange(oChangeContent);

		aChanges = this.oChangePersistence._aDirtyChanges;
		assert.ok(aChanges);
		assert.strictEqual(aChanges.length, 1);
		assert.strictEqual(aChanges[0].getId(), oChangeContent.fileName);
		assert.strictEqual(aChanges[0], newChange);
	});

	QUnit.module("sap.ui.fl.ChangePersistence saveChanges", {
		beforeEach: function () {
			this.lrepConnectorMock = {
				create: sinon.stub().returns(Promise.resolve()),
				deleteChange: sinon.stub().returns(Promise.resolve()),
				loadChanges: sinon.stub().returns(Promise.resolve({changes: {changes: []}}))
			};
			this.oChangePersistence = new ChangePersistence("saveChangeScenario", this.lrepConnectorMock);
		},
		afterEach: function () {
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

		this.oChangePersistence.addChange(oChangeContent);

		//Call CUT
		return this.oChangePersistence.saveDirtyChanges().then(function(){
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

	QUnit.test("Shall save the dirty changes in a bulk", 4, function (assert) {
		// REVISE There might be more elegant implementation
		var oChangeContent1, oChangeContent2, lrepConnectorMock;

		var createSlowPromise = function(){
			return new Promise(function(resolve){
				setTimeout(function(){resolve();}, 100);
			});
		};

		lrepConnectorMock = this.lrepConnectorMock;
		lrepConnectorMock.create = function(aChanges){
			assert.equal(aChanges.length, 2, "both changes should be passed within one call");
			assert.equal(aChanges[0], oChangeContent1, "the first change was passed as first");
			assert.equal(aChanges[1], oChangeContent2, "the second change was passed as second");

			return Promise.resolve();
		};

		sinon.spy(lrepConnectorMock, "create");

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

		this.oChangePersistence.addChange(oChangeContent1);
		this.oChangePersistence.addChange(oChangeContent2);

		//Call CUT
		return this.oChangePersistence.saveDirtyChanges().then(function(){
			sinon.assert.calledOnce(lrepConnectorMock.create, "the connector was called only once");
		});
	});

	QUnit.test("after a change creation has been saved, the change shall be added to the cache", function (assert){
		var oChangeContent = {
			fileName: "Gizorillus",
			layer: "VENDOR",
			fileType: "change",
			changeType: "addField",
			selector: { "id": "control1" },
			content: { },
			originalLanguage: "DE"
		};

		this.oChangePersistence.addChange(oChangeContent);

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
			this.oChangePersistence.addChange(oChangeContent);
			return this.oChangePersistence.saveDirtyChanges();
		}.bind(this)).then(function() {
			var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
			assert.strictEqual(aDirtyChanges.length, 0);
		}.bind(this));
	});

	QUnit.test("shall delete the change from the cache, after a change deletion has been saved", function (assert){
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

		var oChange = this.oChangePersistence.addChange(oChangeContent);

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

		var oChange = this.oChangePersistence.addChange(oChangeContent);
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

}(sap.ui.fl.Utils, sap.ui.fl.ChangePersistence, sap.ui.core.Control, sap.ui.fl.Change, sap.ui.fl.LrepConnector, sap.ui.fl.Cache, sap.ui.fl.registry.Settings));
