/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/ChangesController",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Utils",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesController,
	PersistenceWriteAPI,
	Cache,
	Utils,
	DescriptorInlineChangeFactory,
	JsControlTreeModifier,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sReturnValue = "returnValue";

	function mockFlexController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getFlexControllerInstance")
			.withArgs(oControl)
			.returns(oReturn);
	}

	function mockDescriptorController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getDescriptorFlexControllerInstance")
			.withArgs(oControl)
			.returns(oReturn);
	}

	function getMethodStub(aArguments, vReturnValue) {
		var fnPersistenceStub = sandbox.stub();
		fnPersistenceStub
			.withArgs.apply(fnPersistenceStub, aArguments)
			.returns(vReturnValue);
		return fnPersistenceStub;
	}

	QUnit.module("Given PersistenceWriteAPI", {
		beforeEach: function () { },
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getCacheKey is called", function(assert) {
			var sComponentName = "componentName";
			var sAppVersion = "1.2.3";
			var sCacheKey = "cacheKey";
			var mComponentProperties = {
				name: sComponentName,
				appVersion: sAppVersion
			};
			var oAppComponent = {
				getManifest: function() { }
			};
			sandbox.stub(Utils, "getComponentName")
				.withArgs(oAppComponent).returns(sComponentName);
			sandbox.stub(Utils, "getAppVersionFromManifest").returns(sAppVersion);
			sandbox.stub(Cache, "getCacheKey")
				.withArgs(mComponentProperties, oAppComponent)
				.returns(sCacheKey);
			assert.deepEqual(PersistenceWriteAPI.getCacheKey(oAppComponent), sCacheKey, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when saveChanges is called", function(assert) {
			var aArguments = [{skipCacheUpdate: true}, {type: "managedObject"}];
			var fnFlexStub = getMethodStub(aArguments.slice(0, 0), Promise.resolve());
			var fnDescriptorStub = getMethodStub([], Promise.resolve(sReturnValue));
			mockFlexController(aArguments[1], { saveAll : fnFlexStub });
			mockDescriptorController(aArguments[1], { saveAll : fnDescriptorStub });
			return PersistenceWriteAPI.saveChanges.apply(null, aArguments)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when resetChanges is called", function(assert) {
			var aArguments = [{type: "layer"}, {type: "generator"}, {type: "component"}, {type: "selectors"}, {type: "changeTypes"}];
			var fnPersistenceStub = getMethodStub(aArguments, Promise.resolve());
			var fnDescriptorStub = getMethodStub(aArguments, Promise.resolve(sReturnValue));
			mockFlexController(aArguments[2], { resetChanges : fnPersistenceStub });
			mockDescriptorController(aArguments[2], {resetChanges: fnDescriptorStub});
			return PersistenceWriteAPI.resetChanges.apply(null, aArguments)
				.then(function (sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when transportChanges is called", function(assert) {
			var aArguments = [{type: "rootControl"}, {type: "styleClass"}, {type: "layer"}, {type: "appVariantDescriptors"}];
			var fnPersistenceStub = getMethodStub(aArguments, sReturnValue);
			mockFlexController(aArguments[0], { _oChangePersistence: { transportAllUIChanges : fnPersistenceStub } });
			assert.strictEqual(PersistenceWriteAPI._transportChanges.apply(null, aArguments), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when getUIChanges is called", function(assert) {
			var aArguments = [{type: "propertyBag", invalidateCache: true, managedObject: "managedObject"}];
			var fnPersistenceStub = getMethodStub([aArguments[0], aArguments[0].invalidateCache], Promise.resolve(sReturnValue));
			mockFlexController(aArguments[0].managedObject, { getComponentChanges : fnPersistenceStub });
			return PersistenceWriteAPI.getUIChanges.apply(null, aArguments)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called correctly");
				});
		});

		QUnit.test("when getDirtyChanges is called", function(assert) {
			var aArguments = [{type: "managedObject"}];
			var fnPersistenceStub = getMethodStub([], sReturnValue);
			mockFlexController(aArguments[0], { _oChangePersistence: { getDirtyChanges: fnPersistenceStub } });
			assert.strictEqual(PersistenceWriteAPI.getDirtyChanges.apply(null, aArguments), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when add is called with a flex change", function(assert) {
			var aArguments = [{getChangeType: function() { return "flexChange"; }}, {type: "control"}];
			var aPersistenceArguments = [aArguments[0], {type: "appComponent"}];
			sandbox.stub(Utils, "getAppComponentForControl").withArgs(aArguments[1]).returns(aPersistenceArguments[1]);
			var fnPersistenceStub = getMethodStub(aPersistenceArguments, sReturnValue);
			mockFlexController(aPersistenceArguments[1], { addPreparedChange : fnPersistenceStub });
			assert.strictEqual(PersistenceWriteAPI.add.apply(null, aArguments), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when add is called with a descriptor change", function(assert) {
			var done = assert.async();
			var sDescriptorChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var aArguments = [
				{
					getChangeType: function() {
						return sDescriptorChangeType;
					},
					store: function() {
						assert.ok(true, "then changes's store() was called");
						done();
					}
				},
				{type: "control"}
			];
			PersistenceWriteAPI.add.apply(null, aArguments);
		});

		QUnit.test("when add is called but an error is thrown", function(assert) {
			var sError = "mock error";
			var aArguments = [
				{
					getChangeType: function () {
						throw new Error(sError);
					}
				},
				{type: "control"}
			];
			assert.throws(
				function() {
					PersistenceWriteAPI.add.apply(null, aArguments);
				},
				new Error(sError),
				"then an error is caught during the process"
			);
		});

		QUnit.test("when remove is called with a revert", function(assert) {
			var aArguments = [{getChangeType: function() {}}, {appComponent: "appComponent", revert: true}];
			var fnPersistenceStub = getMethodStub([[aArguments[0]], aArguments[1].appComponent], Promise.resolve(sReturnValue));
			mockFlexController(aArguments[1].appComponent, { revertChangesOnControl: fnPersistenceStub });
			return PersistenceWriteAPI.remove.apply(null, aArguments)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when remove is called without a revert", function(assert) {
			var aArguments = [{getSelector: function() {}, getChangeType: function() {}}, {appComponent: "appComponent"}];
			var oControl = {type: "control"};
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(oControl);
			var fnRemoveChangesFromControlStub = getMethodStub([aArguments[0], aArguments[1].appComponent, oControl], Promise.resolve());
			var fnDeleteChangeStub = getMethodStub([aArguments[0], aArguments[1].appComponent], Promise.resolve(sReturnValue));
			mockFlexController(aArguments[1].appComponent, { removeFromAppliedChangesOnControl: fnRemoveChangesFromControlStub, deleteChange: fnDeleteChangeStub});
			return PersistenceWriteAPI.remove.apply(null, aArguments)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when remove is called for a descriptor change", function(assert) {
			var sDescriptorChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var aArguments = [{getChangeType: function() { return sDescriptorChangeType; }}, {appComponent: "appComponent"}];
			var fnDeleteChangeStub = sandbox.stub();
			mockDescriptorController(aArguments[1].appComponent, { deleteChange: fnDeleteChangeStub });
			return PersistenceWriteAPI.remove.apply(null, aArguments)
				.then(function() {
					assert.ok(fnDeleteChangeStub.calledWith(aArguments[0], aArguments[1].appComponent), "then the flex persistence was called with correct parameters");
				});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
