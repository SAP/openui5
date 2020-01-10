/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/Utils",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexState,
	ChangePersistenceFactory,
	ChangePersistence,
	Utils,
	Control,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.ChangePersistenceFactory", {
		afterEach: function() {
			sandbox.restore();
			sap.ui.core.Component._fnManifestLoadCallback = null;
		}
	}, function() {
		QUnit.test("shall provide an API to create a ChangePersistence for a component", function(assert) {
			assert.equal(typeof ChangePersistenceFactory.getChangePersistenceForComponent, "function");
		});

		QUnit.test("shall provide an API to create a ChangePersistence for a control", function(assert) {
			assert.equal(typeof ChangePersistenceFactory.getChangePersistenceForControl, "function");
		});

		QUnit.test("shall create a new ChangePersistence for a given component", function(assert) {
			assert.ok(ChangePersistenceFactory.getChangePersistenceForComponent("RambaZambaComponent", "1.2.3"), "ChangePersistence shall be created");
		});

		QUnit.test("shall create a new ChangePersistence for a given control", function(assert) {
			var sComponentName = "AComponentForAControl";
			var sAppVersion = "1.2.3";
			var oControl = new Control();
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
			sandbox.stub(Utils, "getComponentClassName").returns(sComponentName);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oControl);

			assert.ok(oChangePersistence, "ChangePersistence shall be created");
			assert.equal(sComponentName, oChangePersistence._mComponent.name, "with correct component name");
			assert.ok(sAppVersion, oChangePersistence._mComponent.appVersion, "and correct application version");
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
				name: oComponent.name,
				asyncHints: {
					requests: [
						{
							name: "sap.ui.fl.changes",
							reference: oComponent.name
						}
					]
				}
			};

			var oInitializeStub = sandbox.stub(FlexState, "initialize");
			ChangePersistenceFactory._onLoadComponent(oConfig, undefined);
			assert.equal(oInitializeStub.callCount, 0, "then flex state was not initialized");
		});

		QUnit.test("onLoadComponent does nothing if the passed manifest does not contain a type", function (assert) {
			var oComponent = {
				name : "componentName"
			};
			var oConfig = {
				name: oComponent.name,
				asyncHints: {
					requests: [
						{
							name: "sap.ui.fl.changes",
							reference: oComponent.name
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

			var oInitializeStub = sandbox.stub(FlexState, "initialize");
			ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);
			assert.equal(oInitializeStub.callCount, 0, "then flex state was not initialized");
		});

		QUnit.test("onLoadComponent does nothing if the passed manifest is not of the type 'application'", function (assert) {
			var oComponent = {
				name : "componentName"
			};
			var oConfig = {
				name: oComponent.name,
				asyncHints: {
					requests: [
						{
							name: "sap.ui.fl.changes",
							reference: oComponent.name
						}
					]
				}
			};

			var oManifest = {
				"sap.app": {
					type: "notAnApplication"
				},
				getEntry: function (key) {
					return this[key];
				}
			};

			var oInitializeStub = sandbox.stub(FlexState, "initialize");
			ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);
			assert.equal(oInitializeStub.callCount, 0, "then flex state was not initialized");
		});

		QUnit.test("onLoadComponent does nothing if component ID is not passed", function (assert) {
			var oConfig = {};

			var oManifest = {
				"sap.app": {
					type: "application"
				},
				getEntry: function (key) {
					return this[key];
				}
			};

			var oInitializeStub = sandbox.stub(FlexState, "initialize");
			ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);
			assert.equal(oInitializeStub.callCount, 0, "then flex state was not initialized");
		});

		QUnit.test("onLoadComponent determines legacy app variant ids and has no caching", function (assert) {
			var oInitializeStub = sandbox.stub(FlexState, "initialize");
			var oConfig = {
				name: "componentName",
				componentData: {
					startupParameters: {
						"sap-app-id": ["legacyAppVariantId"]
					}
				},
				id: "id"
			};
			var oManifest = {
				"sap.app": {
					type: "application"
				},
				"sap.ui5" : null,
				getEntry: function (key) {
					return this[key];
				}
			};
			var oExpectedParameter = {
				componentData: oConfig.componentData,
				asyncHints: oConfig.asyncHints,
				manifest: oManifest,
				componentId: oConfig.id
			};

			ChangePersistenceFactory._onLoadComponent(oConfig, oManifest);
			assert.equal(oInitializeStub.callCount, 1, "the FlexState was initialized");
			assert.deepEqual(oInitializeStub.firstCall.args[0], oExpectedParameter, "the FlexState was initialized with the correct parameter");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});