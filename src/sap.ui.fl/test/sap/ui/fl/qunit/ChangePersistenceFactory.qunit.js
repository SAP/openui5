/*global QUnit,sinon*/

jQuery.sap.require("sap.ui.fl.ChangePersistenceFactory");
jQuery.sap.require("sap.ui.fl.ChangePersistence");

(function(ChangePersistenceFactory, ChangePersistence, Control, Utils) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oAsyncHints;

	QUnit.module("sap.ui.fl.ChangePersistenceFactory", {
		beforeEach: function(assert) {
			var done = assert.async();
			jQuery.getJSON( "./testResources/asyncHints.json", function( oLoadedAsyncHints ) {
				oAsyncHints = oLoadedAsyncHints;

				// MOCK find for phantomJS
				oAsyncHints.requests.find = function () {
					return oAsyncHints.requests[0];
				};

				done();
			});
		},
		afterEach: function() {
			sandbox.restore();
			sap.ui.core.Component._fnManifestLoadCallback = null;
		}
	});

	QUnit.test("shall provide an API to create a ChangePersistence for a component", function(assert) {
		assert.equal(typeof ChangePersistenceFactory.getChangePersistenceForComponent, "function");
	});

	QUnit.test("shall provide an API to create a ChangePersistence for a control", function(assert) {
		assert.equal(typeof ChangePersistenceFactory.getChangePersistenceForControl, "function");
	});

	QUnit.test("shall create a new ChangePersistence for a given component", function(assert) {
		var oChangePersistence;

		//Call CUT
		oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent("RambaZambaComponent", "1.2.3");

		assert.ok(oChangePersistence, "ChangePersistence shall be created");
	});

	QUnit.test("shall create a new ChangePersistence for a given control", function(assert) {
		var oControl, oChangePersistence, sComponentName, sAppVersion;
		sComponentName = "AComponentForAControl";
		sAppVersion = "1.2.3";
		oControl = new Control();
		var oComponent = {
			getManifest: function () {
				return {
					"sap.app" : {
						applicationVersion : {
							version : sAppVersion
						}
					}
				};
			}
		};
		sandbox.stub(ChangePersistenceFactory, "_getComponentClassNameForControl").returns(sComponentName);
		sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

		//Call CUT
		oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oControl);

		assert.ok(oChangePersistence, "ChangePersistence shall be created");
		assert.equal(sComponentName, oChangePersistence._oComponent.name, "with correct component name");
		assert.ok(sAppVersion, oChangePersistence._oComponent.appVersion, "and correct application version");
	});

	QUnit.test("shall return the same cached instance, if it exists", function(assert) {
		var componentName = "Sinalukasi";

		var firstlyRequestedChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(componentName, "1.2.3");
		var secondlyRequestedChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(componentName, "1.2.3");

		assert.strictEqual(firstlyRequestedChangePersistence, secondlyRequestedChangePersistence, "Retrieved ChangePersistence instances are equal");
	});

	QUnit.test("onLoadComponent does nothing if no manifest was passed", function (assert) {

		var oComponent = {
			name : "componentName"
		};
		var oConfig = {
			"name": oComponent.name,
			"asyncHints": {
				"requests": [
					{
						"name": "sap.ui.fl.changes",
						"reference": oComponent.name
					}
				]
			}
		};

		var oChangePersistence = new ChangePersistence(oComponent);
		var oChangePersistenceStub = sandbox.stub(oChangePersistence, "getChangesForComponent");

		ChangePersistenceFactory._onLoadComponent(oConfig, undefined);

		assert.equal(oChangePersistenceStub.callCount, 0, "no change request was sent");
	});

	QUnit.test("onLoadComponent does nothing if the passed manifest does not contain a type", function (assert) {

		var oComponent = {
			name : "componentName"
		};
		var oConfig = {
			"name": oComponent.name,
			"asyncHints": {
				"requests": [
					{
						"name": "sap.ui.fl.changes",
						"reference": oComponent.name
					}
				]
			}
		};

		var oManifest = {
			"sap.app": {},
			getEntry: function (key) {
				return this[key];
			}
		};

		var oChangePersistence = new ChangePersistence(oComponent);
		var oChangePersistenceStub = sandbox.stub(oChangePersistence, "getChangesForComponent");

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);

		assert.equal(oChangePersistenceStub.callCount, 0, "no change request was sent");
	});

	QUnit.test("onLoadComponent does nothing if the passed manifest is not of the type 'application'", function (assert) {

		var oComponent = {
			name : "componentName"
		};
		var oConfig = {
			"name": oComponent.name,
			"asyncHints": {
				"requests": [
					{
						"name": "sap.ui.fl.changes",
						"reference": oComponent.name
					}
				]
			}
		};

		var oManifest = {
			"sap.app": {
				"type": "notAnApplication"
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		var oChangePersistence = new ChangePersistence(oComponent);
		var oChangePersistenceStub = sandbox.stub(oChangePersistence, "getChangesForComponent");

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);

		assert.equal(oChangePersistenceStub.callCount, 0, "no change request was sent");
	});

	QUnit.test("onLoadComponent determines legacy app variant ids and has no caching", function (assert) {

		var oComponent = {
			name : "componentName"
		};
		var sAppVariantId = "legacyAppVariantId";

		var oConfig = {
			"name": oComponent.name,
			"componentData": {
				"startupParameters": {
					"sap-app-id": [sAppVariantId]
				}
			}
		};

		var oManifest = {
			"sap.app": {
				"type": "application"
			},
			"sap.ui5" : null,
			getEntry: function (key) {
				return this[key];
			}
		};

		var oChangePersistence = new ChangePersistence(oComponent);
		var oChangePersistenceStub = sandbox.stub(oChangePersistence, "getChangesForComponent");
		var oStubbedGetChangePersistence = sandbox.stub(ChangePersistenceFactory,"getChangePersistenceForComponent").returns(oChangePersistence);

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);

		assert.equal(oChangePersistenceStub.callCount, 1, "changes were requested once");
		var oGetChangePersistenceForComponentCall = oStubbedGetChangePersistence.getCall(0).args[0];
		assert.equal(oGetChangePersistenceForComponentCall, sAppVariantId, "the app variant id was passed correct");
		var oGetChangesForComponentCall = oChangePersistenceStub.getCall(0).args[0];
		assert.notOk( "cacheKey" in oGetChangesForComponentCall, "no cache parameter was passed");
	});

	QUnit.test("onLoadComponent determines the component name from the component config and that no changes are present", function (assert) {

		var oComponent = {
			name : "componentName"
		};
		var oConfig = {
			"name": oComponent.name,
			"asyncHints": {
				"requests": [
					{
						"name": "sap.ui.fl.changes",
						"reference": oComponent.name + ".Component"
					}
				]
			}
		};

		var oManifest = {
			"sap.app": {
				"type": "application"
			},
			"sap.ui5" : {
				"componentName": oComponent.name
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		// MOCK find for phantomJS
		oConfig.asyncHints.requests.find = function () {
			return oConfig.asyncHints.requests[0];
		};

		var oChangePersistence = new ChangePersistence(oComponent);
		var oChangePersistenceStub = sandbox.stub(oChangePersistence, "getChangesForComponent");
		var oStubbedGetChangePersistence = sandbox.stub(ChangePersistenceFactory,"getChangePersistenceForComponent").returns(oChangePersistence);

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);

		assert.equal(oChangePersistenceStub.callCount, 1, "changes were requested once");
		var oGetChangePersistenceForComponentCall = oStubbedGetChangePersistence.getCall(0).args[0];
		assert.equal(oGetChangePersistenceForComponentCall, oComponent.name  + ".Component", "the component name was passed correct");
		var oGetChangesForComponentCall = oChangePersistenceStub.getCall(0).args[0];
		assert.ok( "cacheKey" in oGetChangesForComponentCall, "a cache parameter was passed");
		assert.equal(oGetChangesForComponentCall.cacheKey, "<NO CHANGES>", "no changes was the cache information");
	});

	QUnit.test("onLoadComponent determines the app variant id within the async hints", function (assert) {

		var oComponent = {
			name : "componentName"
		};
		var sAppVariantId = "legacyAppVariantId";

		var oConfig = {
			"name": oComponent.name,
			"asyncHints": {
				"requests": [
					{
						"name": "sap.ui.fl.changes",
						"reference": sAppVariantId
					}
				]
			}
		};

		var oManifest = {
			"sap.app": {
				"type": "application"
			},
			"sap.ui5" : {
				"appVariantId": sAppVariantId
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		// MOCK find for phantomJS
		oConfig.asyncHints.requests.find = function () {
			return oConfig.asyncHints.requests[0];
		};

		var oChangePersistence = new ChangePersistence(oComponent);
		var oChangePersistenceStub = sandbox.stub(oChangePersistence, "getChangesForComponent");
		var oStubbedGetChangePersistence = sandbox.stub(ChangePersistenceFactory,"getChangePersistenceForComponent").returns(oChangePersistence);

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);

		assert.equal(oChangePersistenceStub.callCount, 1, "changes were requested once");
		var oGetChangePersistenceForComponentCall = oStubbedGetChangePersistence.getCall(0).args[0];
		assert.equal(oGetChangePersistenceForComponentCall, sAppVariantId, "the component name was passed correct");
	});

	QUnit.test("onLoadComponent determines the cache key within the async hints", function (assert) {

		var oComponent = {
			name : "componentName"
		};
		var sCacheKey = "abc123";

		var oConfig = {
			"name": oComponent.name,
			"asyncHints": {
				"requests": [
					{
						"name": "sap.ui.fl.changes",
						"reference": oComponent.name + ".Component",
						"cachebusterToken": sCacheKey
					}
				]
			}
		};

		var oManifest = {
			"sap.app": {
				"type": "application"
			},
			"sap.ui5" : {
				"componentName": oComponent.name
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		// MOCK find for phantomJS
		oConfig.asyncHints.requests.find = function () {
			return oConfig.asyncHints.requests[0];
		};

		var oChangePersistence = new ChangePersistence(oComponent);
		var oChangePersistenceStub = sandbox.stub(oChangePersistence, "getChangesForComponent");
		sandbox.stub(ChangePersistenceFactory,"getChangePersistenceForComponent").returns(oChangePersistence);

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);

		var oGetChangesForComponentCall = oChangePersistenceStub.getCall(0).args[0];
		assert.ok( "cacheKey" in oGetChangesForComponentCall, "a cache parameter was passed");
		assert.equal(oGetChangesForComponentCall.cacheKey, sCacheKey, "the cacneKey was determined correct");
	});

	QUnit.test("onLoadComponent sets max layer filter passed on component data", function (assert) {

		var oComponent = {
			name : "componentName"
		};
		var oConfig = {
			"name": oComponent.name,
			componentData : {
				technicalParameters : {
					"sap-ui-fl-max-layer" : ["CUSTOMER"]
				}
			}
		};

		var oManifest = {
			"sap.app": {
				"type": "application"
			},
			"sap.ui5" : {
				"componentName": oComponent.name
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		var oChangePersistence = new ChangePersistence(oComponent);
		sandbox.stub(oChangePersistence, "getChangesForComponent");
		sandbox.stub(ChangePersistenceFactory,"getChangePersistenceForComponent").returns(oChangePersistence);

		//---------Actual Test----------------
		var fnSetMaxLayer = sandbox.stub(Utils, "setMaxLayerParameter");

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);
		assert.equal(fnSetMaxLayer.callCount, 1, "max layer was set once");
		assert.equal(fnSetMaxLayer.firstCall.args[0], "CUSTOMER", "correct layer has been passed");

	});

	QUnit.test("onLoadComponent sets max layer filter passed on component data (the old way)", function (assert) {

		var oComponent = {
			name : "componentName"
		};
		var oConfig = {
			"name": oComponent.name,
			componentData : {
				startupParameters : {
					"sap-ui-fl-max-layer" : ["CUSTOMER"]
				}
			}
		};

		var oManifest = {
			"sap.app": {
				"type": "application"
			},
			"sap.ui5" : {
				"componentName": oComponent.name
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		var oChangePersistence = new ChangePersistence(oComponent);
		sandbox.stub(oChangePersistence, "getChangesForComponent");
		sandbox.stub(ChangePersistenceFactory,"getChangePersistenceForComponent").returns(oChangePersistence);

		//---------Actual Test----------------
		var fnSetMaxLayer = sandbox.stub(Utils, "setMaxLayerParameter");

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);
		assert.equal(fnSetMaxLayer.callCount, 1, "max layer was set once");
		assert.equal(fnSetMaxLayer.firstCall.args[0], "CUSTOMER", "correct layer has been passed");

	});

	QUnit.test("onLoadComponent sets default max layer if nothing is passed", function (assert) {

		var oComponent = {
			name : "componentName"
		};
		var oConfig = {
			"name": oComponent.name
		};

		var oManifest = {
			"sap.app": {
				"type": "application"
			},
			"sap.ui5" : {
				"componentName": oComponent.name
			},
			getEntry: function (key) {
				return this[key];
			}
		};

		var oChangePersistence = new ChangePersistence(oComponent);
		sandbox.stub(oChangePersistence, "getChangesForComponent");
		sandbox.stub(ChangePersistenceFactory,"getChangePersistenceForComponent").returns(oChangePersistence);

		//---------Actual Test----------------
		var fnSetMaxLayer = sandbox.stub(Utils, "setMaxLayerParameter");

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);
		assert.equal(fnSetMaxLayer.callCount, 1, "max layer was set once");
		assert.equal(fnSetMaxLayer.firstCall.args[0], undefined, "correct layer has been passed");

	});

	QUnit.test("_findFlAsyncHint cn determine the flAsyncHint", function(assert) {
		var oFlAsyncHint = {name: "sap.ui.fl.changes"};

		var aAsyncHints = [
			{
				name: "some_name"
			},
			oFlAsyncHint,
			{
				name: "some_other_name"
			}
		];

		var oMatcherSpy = this.spy(ChangePersistenceFactory, "_flAsyncHintMatches");
		var oDeterminedFlAsyncHint = ChangePersistenceFactory._findFlAsyncHint(aAsyncHints);

		assert.equal(oFlAsyncHint, oDeterminedFlAsyncHint, "the flHint was determined correct");
		assert.equal(oMatcherSpy.callCount, 2, "the matcher was called twice");
	});

	QUnit.test("_onLoadComponent does nothing if the component is not of the type 'application'", function (assert) {

		var oConfig = {
			name: "theComponentName"
		};
		var oManifest = {
			"sap.app": {
				"type": "component"
			},
			getEntry: function (key) {
				return this[key];
			}
		};
		var oComponent = {};

		var oGetChangePersistenceForComponentStub = this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent");

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest, oComponent);

		assert.equal(oGetChangePersistenceForComponentStub.callCount, 0, "no Change persistence was retrieved");
	});

	QUnit.test("_onLoadComponent requests mapped changes for a component of the type 'application'", function (assert) {

		var oConfig = {
			name: "theComponentName"
		};
		var oManifest = {
			"sap.app": {
				"type": "application"
			},
			getEntry: function (key) {
				return this[key];
			}
		};
		var oComponent = {};

		var oMappedChangesPromise = Promise.resolve({});

		var oChangePersistence = new ChangePersistence(oConfig);
		var oGetChangesForComponentStub = this.stub(oChangePersistence, "getChangesForComponent").returns(oMappedChangesPromise);
		this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);

		ChangePersistenceFactory._onLoadComponent(oConfig, oManifest, oComponent);

		assert.ok(oGetChangesForComponentStub.calledOnce, "changes were requested once");
	});

	QUnit.test("_getChangesForComponentAfterInstantiation does nothing if the component is not of the type 'application'", function (assert) {

		var oConfig = {
			name: "theComponentName"
		};
		var oManifest = {
			"sap.app": {
				"type": "component"
			},
			getEntry: function (key) {
				return this[key];
			}
		};
		var oComponent = {};

		var oGetChangePersistenceForComponentStub = this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent");

		ChangePersistenceFactory._getChangesForComponentAfterInstantiation(oConfig, oManifest, oComponent);

		assert.equal(oGetChangePersistenceForComponentStub.callCount, 0, "no Change persistence was retrieved");
	});

	QUnit.test("_getChangesForComponentAfterInstantiation requests mapped changes for a component of the type 'application'", function (assert) {


		var oConfig = {
			name: "theComponentName"
		};
		var oManifest = {
			"sap.app": {
				"type": "application"
			},
			getEntry: function (key) {
				return this[key];
			}
		};
		var oComponent = {};

		var oMappedChangesPromise = Promise.resolve({});

		var oChangePersistence = new ChangePersistence(oConfig);
		var oGetChangesForComponentStub = this.stub(oChangePersistence, "loadChangesMapForComponent").returns(oMappedChangesPromise);
		this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);

		var oPromise = ChangePersistenceFactory._getChangesForComponentAfterInstantiation(oConfig, oManifest, oComponent);

		assert.ok(oGetChangesForComponentStub.calledOnce, "changes were requested once");
		assert.equal(oPromise, oMappedChangesPromise, "a promise for the changes was returned");
	});

}(sap.ui.fl.ChangePersistenceFactory, sap.ui.fl.ChangePersistence, sap.ui.core.Control, sap.ui.fl.Utils));
