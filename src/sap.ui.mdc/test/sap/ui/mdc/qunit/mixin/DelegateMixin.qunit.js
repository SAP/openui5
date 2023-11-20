/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 20]*/

sap.ui.define([
	"sap/ui/mdc/mixin/DelegateMixin",
	"sap/ui/base/ManagedObject"
], function(
	DelegateMixin,
	ManagedObject
) {
	"use strict";

	let	TestClass;
	let oSomeInstance;
	//var PropertyHelperSubclass = PropertyHelper.extend("sap.ui.mdc.mixin.test.PropertyHelper");
	const TestClassWithFetchProperties = TestClass = ManagedObject.extend("sap.ui.mdc.mixin.test.TestClassWithFetchProperties", {
		metadata: {
			properties: {
				delegate: {
					type: "object",
					group: "Data",
					defaultValue: {
						name: "sap/ui/mdc/AggregationBaseDelegate"
					}
				}
			}
		}
	});
	DelegateMixin.call(TestClassWithFetchProperties.prototype);

	QUnit.module("DelegateMixin", {
		beforeEach: function() {

			const stubbedRequire = sinon.stub(sap.ui, "require").callThrough(); // subsequent calls in loadModules use array signature therefore function normally
			stubbedRequire.withArgs('sap/ui/mdc/BaseDelegate').returns(undefined);
			stubbedRequire.withArgs('sap/ui/mdc/odata/BaseDelegate').returns(undefined);
			stubbedRequire.withArgs('sap/ui/mdc/odata/v4/TypeMap').returns(undefined);

			TestClass = ManagedObject.extend("temp", {
				metadata: {
					properties: {
						delegate: {
							type: "object",
							group: "Data",
							defaultValue: {
								name: "sap/ui/mdc/BaseDelegate"
							}
						}
					}
				}
			});
			DelegateMixin.call(TestClass.prototype);
		},
		afterEach: function() {
			sap.ui.require.restore();

			if (oSomeInstance) {
				oSomeInstance.destroy();
				oSomeInstance = undefined;
			}
			if (TestClass) {
				TestClass = undefined;
			}
		}
	});

	QUnit.test("initialization / destruction", function(assert) {
		sinon.spy(TestClass.prototype, "init");
		sinon.spy(TestClass.prototype, "exit");
		oSomeInstance = new TestClass();
		assert.ok(TestClass.prototype.init.calledOnce, "Original init called");
		assert.ok(oSomeInstance.awaitControlDelegate(), "Delegate promise successfully set");
		assert.ok(oSomeInstance.initControlDelegate, "initControlDelegate method successfully set");
		oSomeInstance.destroy();
		assert.notOk(oSomeInstance.awaitControlDelegate(), "Delegate promise successfully removed");
		assert.ok(TestClass.prototype.exit.calledOnce, "Original exit called");

		TestClass.prototype.init.restore();
		TestClass.prototype.exit.restore();

		oSomeInstance = undefined;
	});

	QUnit.test("delegate module loading", function(assert) {
		const done = assert.async(2);
		oSomeInstance = new TestClass();
		oSomeInstance.initControlDelegate().then(function (oDelegate) {
			assert.ok(!!oDelegate, "module loaded successfully");
			done();
		});
		assert.ok(oSomeInstance.bDelegateLoading, "module loading");

		const oSomeInstance1 = new TestClass({delegate: {name: "/delegate-doesnt-exist"}});
		oSomeInstance1.initControlDelegate().catch(function (oError) {
			assert.ok(oError instanceof Error, "module loading failed");
			oSomeInstance1.destroy();
			done();
		});
	});

	QUnit.test("subsequent initControlDelegate calls", function(assert) {
		const done = assert.async();
		oSomeInstance = new TestClass();
		const oFirstCall = oSomeInstance.initControlDelegate();
		assert.ok(oFirstCall instanceof Promise, "First call to initControlDelegate");
		oFirstCall.then(function (oDelegate) {
			assert.ok(!!oDelegate, "module loaded successfully");

			const oThirdCall = oSomeInstance.initControlDelegate();
			assert.ok(oThirdCall instanceof Promise, "Third call to initControlDelegate ");
			oThirdCall.then(function () {
				assert.ok(sap.ui.require.withArgs("sap/ui/mdc/BaseDelegate").calledOnce, "module is only loaded once");
				done();
			});
		});
		assert.ok(oSomeInstance.bDelegateLoading, "module loading");
		assert.ok(oSomeInstance.initControlDelegate() instanceof Promise, "Second call to initControlDelegate during loading");
		assert.ok(oSomeInstance.bDelegateLoading, "module still loading");
	});

	QUnit.test("subsequent delegate configuration changes", function(assert) {
		oSomeInstance = new TestClass();
		assert.deepEqual(oSomeInstance.getDelegate(), {name: "sap/ui/mdc/BaseDelegate"}, "Default delegate configuration");

		const oSomeInstance1 = new TestClass(undefined, {delegate: {name: "sap/ui/mdc/odata/BaseDelegate"}});
		assert.deepEqual(oSomeInstance1.getDelegate(), {name: "sap/ui/mdc/odata/BaseDelegate"}, "explicit delegate configuration");
		oSomeInstance1.destroy();

		assert.throws(function () {
			oSomeInstance.setDelegate({name: "delegates/odata/v4/BaseDelegate"});
		}, function(oError) {
			return oError instanceof Error && oError.message === "Runtime delegate configuration is not permitted.";
		},  "runtime configuration changes fail");
	});

	QUnit.test("awaitControlDelegate", function(assert) {
		oSomeInstance = new TestClass();
		assert.ok(oSomeInstance.awaitControlDelegate() === oSomeInstance._oDelegateInitialized, "Default initialization promise returned");
	});

	QUnit.test("getControlDelegate", function(assert) {
		oSomeInstance = new TestClass();
		assert.deepEqual(oSomeInstance.getDelegate(), {name: "sap/ui/mdc/BaseDelegate"}, "Default delegate configuration");

		assert.throws(function () {
			oSomeInstance.getControlDelegate();
		}, function(oError) {
			return oError instanceof Error && oError.message === "A delegate instance is not (yet) available. You must call initControlDelegate before calling getControlDelegate.";
		},  "throws error if called before delegated is initialized");

		oSomeInstance.initControlDelegate();

		const done = assert.async();

		oSomeInstance.awaitControlDelegate().then(function () {
			assert.ok(oSomeInstance.getControlDelegate() === oSomeInstance._oDelegate, "delegate returned");
			done();
		});
	});

	QUnit.test("isControlDelegateInitialized", function(assert) {
		oSomeInstance = new TestClass();
		assert.notOk(oSomeInstance.isControlDelegateInitialized(), "Delegate is not initialized");
		oSomeInstance.initControlDelegate();

		return oSomeInstance.awaitControlDelegate().then(function () {
			assert.ok(oSomeInstance.isControlDelegateInitialized(), "Delegate is initialized");
		});
	});

	QUnit.test("getPayload", function(assert) {
		const oPayload = {x:1};
		oSomeInstance = new TestClass({delegate: {name: "sap/ui/mdc/BaseDelegate", payload: oPayload}});
		assert.ok(oSomeInstance.getPayload() === oPayload, "Payload returned");
	});

	QUnit.test("getTypeUtil", function(assert) {
		oSomeInstance = new TestClass();

		if (!oSomeInstance.getTypeUtil) {
			assert.ok(true, "Test not executed in legacy-free build");
			return undefined;
		}

		sinon.spy(oSomeInstance, "getTypeMap");
		return oSomeInstance.initControlDelegate().then(function () {
			assert.notOk(oSomeInstance.getTypeMap.called, "getTypeMap not executed yet");
			const oTypeMap = oSomeInstance.getTypeUtil();
			assert.ok(oSomeInstance.getTypeMap.calledOnce, "getTypeUtil calls getTypeMap");
			assert.equal(oTypeMap, oSomeInstance.getTypeMap(), "getTypeUtil returns getTypeMap result");
			oSomeInstance.getTypeMap.restore();
		});
	});

	QUnit.test("getTypeMap", function(assert) {
		oSomeInstance = new TestClass();
		assert.deepEqual(oSomeInstance.getDelegate(), {name: "sap/ui/mdc/BaseDelegate"}, "Default delegate configuration");

		assert.throws(function () {
			oSomeInstance.getTypeMap();
		}, function(oError) {
			return oError instanceof Error && oError.message === "A delegate instance providing a TypeMap is not (yet) available.";
		},  "throws error if called before delegated is initialized");

		oSomeInstance.initControlDelegate();

		const done = assert.async();

		oSomeInstance.awaitControlDelegate().then(function () {
			assert.ok(oSomeInstance.getTypeMap() === oSomeInstance._oDelegate.getTypeMap(), "delegate returned");
			done();
		});
	});
});
