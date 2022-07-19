/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/p13n/enum/PersistenceMode",
	"sap/m/p13n/modules/DefaultProviderRegistry",
	"sap/m/p13n/Engine"
], function (Control, PersistenceMode, DefaultProviderRegistry, Engine) {
	"use strict";

	QUnit.module("Init");

	QUnit.test("Use DefaultProviderRegistry as Singleton", function(assert){

		var oFirstDefaultProviderRegistry = DefaultProviderRegistry.getInstance(Engine);
		var oSecondDefaultProviderRegistry = DefaultProviderRegistry.getInstance(Engine);
		assert.ok(oFirstDefaultProviderRegistry.isA("sap.m.p13n.modules.DefaultProviderRegistry"), "getInstance() returns an instance of DefaultProviderRegistry");
		assert.deepEqual(oFirstDefaultProviderRegistry, oSecondDefaultProviderRegistry, "There is only one 'DefaultProviderRegistry' instance per session");

		assert.throws(
			function() {
				return new DefaultProviderRegistry();
			},
			function(oError) {
				return (
					oError instanceof Error &&
					oError.message === "DefaultProviderRegistry: This class is a singleton and should not be used without an AdaptationProvider. Please use 'sap.m.p13n.Engine.getInstance().defaultProviderRegistry' instead"
				);
			},
			"calling the constructor subsequently throws an error."
		);
	});


	QUnit.module("Basics", {
		beforeEach: function() {
			this.oFirstControl = new Control("myControl1");
			this.oSecondControl = new Control("myControl2");
			this.defaultProviderRegistry = DefaultProviderRegistry.getInstance(Engine);
		},
		afterEach: function() {
			this.oFirstControl.destroy();
			this.oSecondControl.destroy();
			this.defaultProviderRegistry.destroy();
		}
	});

	QUnit.test("attach", function(assert) {

		var _retrieveDefaultProviderSpy = sinon.spy(this.defaultProviderRegistry, "_retrieveDefaultProvider");

		assert.equal(Object.keys(this.defaultProviderRegistry._mDefaultProviders).length, 0, "No persistence provider exists yet.");
		var oEngineStub = sinon.stub(Engine, "isRegisteredForModification").returns(true);

		assert.throws(
			function() {
				this.defaultProviderRegistry.attach(this.oFirstControl, PersistenceMode.Transient);
			}.bind(this),
			function(oError) {
				return (
					oError instanceof Error &&
					oError.message === "DefaultProviderRegistry: You must not change the modificationSettings for an already registered element"
				);
			},
			"Attaching a control having already determined modification settings is prevented."
		);

		oEngineStub.restore();

		var oPersistenceProvider = this.defaultProviderRegistry.attach(this.oFirstControl, PersistenceMode.Transient);

		assert.ok(_retrieveDefaultProviderSpy.calledOnce, "_retrieveDefaultProvider was called");
		_retrieveDefaultProviderSpy.restore();
		assert.ok(oPersistenceProvider.isA("sap.m.p13n.PersistenceProvider"), "A persistence provider was successfully created");
		assert.deepEqual(oPersistenceProvider.getFor(), [this.oFirstControl.getId()], "It's for association contains the controls id");
		this.defaultProviderRegistry.attach(this.oFirstControl, PersistenceMode.Transient);
		assert.deepEqual(oPersistenceProvider.getFor(), [this.oFirstControl.getId()], "Subsequent calls will not create duplicate ids.");

		this.defaultProviderRegistry.attach(this.oSecondControl, PersistenceMode.Transient);
		assert.deepEqual(oPersistenceProvider.getFor(), [this.oFirstControl.getId(), this.oSecondControl.getId()], "Additional controls attached using the same mode will share existing providers.");


	});


	QUnit.test("detach", function(assert) {
		assert.equal(Object.keys(this.defaultProviderRegistry._mDefaultProviders).length, 0, "No persistence provider exists yet.");
		var oPersistenceProvider = this.defaultProviderRegistry.attach(this.oFirstControl, PersistenceMode.Transient);
		assert.ok(oPersistenceProvider.isA("sap.m.p13n.PersistenceProvider"), "A persistence provider was successfully created");
		assert.deepEqual(oPersistenceProvider.getFor(), [this.oFirstControl.getId()], "It's for association contains the controls id");
		this.defaultProviderRegistry.detach(this.oFirstControl);
		assert.deepEqual(oPersistenceProvider.getFor(), [], "detach will remove the controls id from the existing default persistence provider.");

	});

	QUnit.test("destroy", function(assert) {
		assert.equal(Object.keys(this.defaultProviderRegistry._mDefaultProviders).length, 0, "No persistence provider exists yet.");
		var oPersistenceProvider = this.defaultProviderRegistry.attach(this.oFirstControl, PersistenceMode.Transient);
		assert.ok(oPersistenceProvider.isA("sap.m.p13n.PersistenceProvider"), "A persistence provider was successfully created");
		assert.deepEqual(oPersistenceProvider.getFor(), [this.oFirstControl.getId()], "It's for association contains the controls id");
		this.defaultProviderRegistry.destroy();
		assert.ok(oPersistenceProvider.bIsDestroyed, "The persistence provider was destroyed.");
		assert.notOk(Object.keys(this.defaultProviderRegistry._mDefaultProviders).length, "All persistence providers were removed from the cache.");

	});

});
