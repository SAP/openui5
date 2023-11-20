/* global QUnit */

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
		afterEach() {
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
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});