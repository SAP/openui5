/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/ChangesController",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Utils",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesController,
	PersistenceWriteAPI,
	Cache,
	Utils,
	DescriptorInlineChangeFactory,
	ManagedObject,
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
		beforeEach: function () {
			this.aObjectsToDestroy = [];
		},
		afterEach: function() {
			sandbox.restore();
			this.aObjectsToDestroy.forEach(function(oObject) {oObject.destroy();});
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

		QUnit.test("when hasHigherLayerChanges is called", function(assert) {
			var oControl = {};
			var mPropertyBag = {type: "propertyBag"};
			var fnPersistenceStub = getMethodStub(mPropertyBag, sReturnValue);
			mockFlexController(oControl, { hasHigherLayerChanges : fnPersistenceStub });

			assert.strictEqual(PersistenceWriteAPI.hasHigherLayerChanges(oControl, mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when saveChanges is called", function(assert) {
			var bSkipUpdateCache = true;
			var oManagedObject = new ManagedObject();
			this.aObjectsToDestroy.push(oManagedObject);
			var fnFlexStub = getMethodStub(oManagedObject, Promise.resolve());
			var fnDescriptorStub = getMethodStub([], Promise.resolve(sReturnValue));
			mockFlexController(oManagedObject, { saveAll : fnFlexStub });
			mockDescriptorController(oManagedObject, { saveAll : fnDescriptorStub });
			return PersistenceWriteAPI.saveChanges(bSkipUpdateCache, oManagedObject)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when resetChanges is called", function(assert) {
			var sLayer = "customer";
			var sGenerator = "generator";
			var oComponent = {type: "component"};
			var aSelectorIds = [];
			var aChangeTypes = [];
			var fnPersistenceStub = getMethodStub([sLayer, sGenerator, oComponent, aSelectorIds, aChangeTypes], Promise.resolve());
			var fnDescriptorStub = getMethodStub([sLayer, sGenerator, oComponent, aSelectorIds, aChangeTypes], Promise.resolve(sReturnValue));
			mockFlexController(oComponent, { resetChanges : fnPersistenceStub });
			mockDescriptorController(oComponent, {resetChanges: fnDescriptorStub});
			return PersistenceWriteAPI.resetChanges(sLayer, sGenerator, oComponent, aSelectorIds, aChangeTypes)
				.then(function (sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when transportChanges is called", function(assert) {
			var oRootControl = {};
			var sStyleClass = "";
			var sLayer = "customer";
			var aAppVariantDescriptors = [];
			var fnPersistenceStub = getMethodStub([oRootControl, sStyleClass, sLayer, aAppVariantDescriptors], sReturnValue);
			mockFlexController(oRootControl, { _oChangePersistence: { transportAllUIChanges : fnPersistenceStub } });
			assert.strictEqual(PersistenceWriteAPI._transportChanges(oRootControl, sStyleClass, sLayer, aAppVariantDescriptors), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when getUIChanges is called", function(assert) {
			var mPropertyBag = {type: "propertyBag", invalidateCache: true, managedObject: "managedObject"};
			var fnPersistenceStub = getMethodStub([mPropertyBag, mPropertyBag.invalidateCache], Promise.resolve(sReturnValue));
			mockFlexController(mPropertyBag.managedObject, { getComponentChanges : fnPersistenceStub });
			return PersistenceWriteAPI.getUIChanges(mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called correctly");
				});
		});

		QUnit.test("when getDirtyChanges is called", function(assert) {
			var oManagedObject = {};
			var fnPersistenceStub = getMethodStub([], sReturnValue);
			mockFlexController(oManagedObject, { _oChangePersistence: { getDirtyChanges: fnPersistenceStub } });
			assert.strictEqual(PersistenceWriteAPI.getDirtyChanges(oManagedObject), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when add is called with a flex change", function(assert) {
			var oChange = {
				getChangeType: function() { return "flexChange"; }
			};
			var oManagedObject = {};
			var aPersistenceArguments = [oChange, {type: "appComponent"}];
			sandbox.stub(Utils, "getAppComponentForControl").withArgs(oManagedObject).returns(aPersistenceArguments[1]);
			var fnPersistenceStub = getMethodStub(aPersistenceArguments, sReturnValue);
			mockFlexController(aPersistenceArguments[1], { addPreparedChange : fnPersistenceStub });
			assert.strictEqual(PersistenceWriteAPI.add(oChange, oManagedObject), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when add is called with a descriptor change", function(assert) {
			var done = assert.async();
			var sDescriptorChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var oChange = {
				getChangeType: function() {
					return sDescriptorChangeType;
				},
				store: function() {
					assert.ok(true, "then changes's store() was called");
					done();
				}
			};
			var oManagedObject = {};
			PersistenceWriteAPI.add(oChange, oManagedObject);
		});

		QUnit.test("when add is called but an error is thrown", function(assert) {
			var sError = "mock error";
			var oChange = {
				getChangeType: function () {
					throw new Error(sError);
				}
			};
			var oManagedObject = {};
			assert.throws(
				function() {
					PersistenceWriteAPI.add(oChange, oManagedObject);
				},
				new Error(sError),
				"then an error is caught during the process"
			);
		});

		QUnit.test("when remove is called with a revert", function(assert) {
			var oChange = {
				getChangeType: function() {}
			};
			var mPropertyBag = {
				appComponent: "appComponent",
				revert: true
			};
			var fnPersistenceStub = getMethodStub([[oChange], mPropertyBag.appComponent], Promise.resolve(sReturnValue));
			mockFlexController(mPropertyBag.appComponent, { revertChangesOnControl: fnPersistenceStub });
			return PersistenceWriteAPI.remove(oChange, mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when remove is called without a revert", function(assert) {
			var oChange = {
				getSelector: function() {},
				getChangeType: function() {}
			};
			var mPropertyBag = {
				appComponent: "appComponent"
			};
			var oControl = {type: "control"};
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(oControl);
			var fnRemoveChangesFromControlStub = getMethodStub([oChange, mPropertyBag.appComponent, oControl], Promise.resolve());
			var fnDeleteChangeStub = getMethodStub([oChange, mPropertyBag.appComponent], Promise.resolve(sReturnValue));
			mockFlexController(mPropertyBag.appComponent, { removeFromAppliedChangesOnControl: fnRemoveChangesFromControlStub, deleteChange: fnDeleteChangeStub});
			return PersistenceWriteAPI.remove(oChange, mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when remove is called for a descriptor change", function(assert) {
			var sDescriptorChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var oChange = {
				getChangeType: function() {return sDescriptorChangeType;}
			};
			var mPropertyBag = {
				appComponent: "appComponent"
			};
			var fnDeleteChangeStub = sandbox.stub();
			mockDescriptorController(mPropertyBag.appComponent, { deleteChange: fnDeleteChangeStub });
			return PersistenceWriteAPI.remove(oChange, mPropertyBag)
				.then(function() {
					assert.ok(fnDeleteChangeStub.calledWith(oChange, mPropertyBag.appComponent), "then the flex persistence was called with correct parameters");
				});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
