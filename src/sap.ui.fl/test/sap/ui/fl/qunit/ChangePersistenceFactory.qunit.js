/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/core/Control",
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Component"
], function(
	FlexState,
	ManifestUtils,
	ChangePersistenceFactory,
	Control,
	Manifest,
	Applier,
	sinon,
	Component
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.ChangePersistenceFactory", {
		afterEach: function() {
			sandbox.restore();
			Component._fnManifestLoadCallback = null;
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
			var oControl = new Control();
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sComponentName);

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oControl);

			assert.ok(oChangePersistence, "ChangePersistence shall be created");
			assert.equal(sComponentName, oChangePersistence._mComponent.name, "with correct component name");
		});

		QUnit.test("shall return the same cached instance, if it exists", function(assert) {
			var componentName = "Sinalukasi";

			var firstlyRequestedChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(componentName);
			var secondlyRequestedChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(componentName);

			assert.strictEqual(firstlyRequestedChangePersistence, secondlyRequestedChangePersistence, "Retrieved ChangePersistence instances are equal");
		});

		QUnit.test("onLoadComponent does nothing if no manifest was passed", function (assert) {
			var oComponent = {
				name: "componentName"
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
				name: "componentName"
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
				name: "componentName"
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
			var oManifest = new Manifest({
				"sap.app": {
					type: "application"
				},
				"sap.ui5": null
			});
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

	QUnit.module("Given onLoadComponent is called ", {
		beforeEach: function() {
			this.oInitializeStub = sandbox.stub(FlexState, "initialize");
			this.oConfig = {
				id: "id",
				name: "componentName",
				asyncHints: {
					requests: [
						{
							name: "sap.ui.fl.changes",
							reference: "componentName"
						}
					]
				}
			};
		},
		afterEach: function() {
			sandbox.restore();
			Component._fnManifestLoadCallback = null;
		}
	}, function() {
		QUnit.test("with client side app descriptor changes", function (assert) {
			var oManifestContent = {
				"sap.app": {
					type: "application"
				},
				"sap.ui5": {
					dependencies: {}
				},
				"sap.ovp": {
					cards: {}
				},
				"$sap.ui.fl.changes": {
					descriptor: [
						{
							changeType: "appdescr_ui5_addLibraries",
							content: {
								libraries: {
									myCustomLib: {
										minVersion: "1.88"
									}
								}
							}
						}, {
							changeType: "appdescr_ovp_addNewCard",
							content: {
								card: {
									customercard: {
										model: "modelX"
									}
								}
							}
						}, {
							changeType: "appdescr_app_addNewInbound",
							content: {}
						}
					]
				}
			};
			var oManifest = new Manifest(oManifestContent);

			var fnApplyChangesStub = sandbox.spy(Applier, "applyChanges");

			return ChangePersistenceFactory._onLoadComponent(this.oConfig, oManifest).then(function() {
				assert.equal(this.oInitializeStub.callCount, 1, "the FlexState was initialized");
				assert.equal(fnApplyChangesStub.callCount, 1, "Applier.applyChanges is called once");
				var oManifestJSON = oManifest.getJson();
				assert.equal(oManifestJSON["$sap.ui.fl.descriptor.changes"], undefined, "descriptor change section is removed");
				assert.equal(oManifestJSON["sap.ui5"].dependencies.libs.myCustomLib.minVersion, "1.88", "addLibraries change is applied correctly");
				assert.equal(oManifestJSON["sap.ovp"].cards.customercard.model, "modelX", "addNewCard change is applied correctly");
			}.bind(this));
		});

		QUnit.test("without client side app descriptor changes", function (assert) {
			var oManifestContent = {
				"sap.app": {
					type: "application"
				},
				"sap.ui5": {
					dependencies: {}
				}
			};
			var oManifest = new Manifest(oManifestContent);

			var fnApplyChangesStub = sandbox.spy(Applier, "applyChanges");

			return ChangePersistenceFactory._onLoadComponent(this.oConfig, oManifest).then(function() {
				assert.equal(this.oInitializeStub.callCount, 1, "the FlexState was initialized");
				assert.equal(fnApplyChangesStub.callCount, 0, "Applier.applyChanges is never called");
				assert.deepEqual(oManifestContent, oManifest.getJson(), "manifest is not changed");
			}.bind(this));
		});

		QUnit.test("with client side app descriptor changes in wrong section", function (assert) {
			var oManifestContent = {
				"sap.app": {
					type: "application"
				},
				"sap.ui5": {
					dependencies: {}
				},
				"$sap.ui.fl.descriptor.changes": []
			};
			var oManifest = new Manifest(oManifestContent);

			var fnApplyChangesStub = sandbox.spy(Applier, "applyChanges");

			return ChangePersistenceFactory._onLoadComponent(this.oConfig, oManifest).then(function() {
				assert.equal(this.oInitializeStub.callCount, 1, "the FlexState was initialized");
				assert.equal(fnApplyChangesStub.callCount, 0, "Applier.applyChanges is never called");
				assert.deepEqual(oManifestContent, oManifest.getJson(), "manifest is not changed");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});