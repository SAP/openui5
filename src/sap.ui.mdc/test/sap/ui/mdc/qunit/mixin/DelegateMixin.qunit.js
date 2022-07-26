/* global QUnit, sinon */

/*eslint max-nested-callbacks: [2, 20]*/

sap.ui.define([
	"sap/ui/mdc/mixin/DelegateMixin",
	"sap/ui/mdc/util/PropertyHelper",
	"sap/ui/base/ManagedObject",
	"jquery.sap.global"
], function(
	DelegateMixin,
	PropertyHelper,
	ManagedObject,
	jQuery
) {
	"use strict";

	var	TestClass;
	var oSomeInstance;
	//var PropertyHelperSubclass = PropertyHelper.extend("sap.ui.mdc.mixin.test.PropertyHelper");
	var TestClassWithFetchProperties = TestClass = ManagedObject.extend("sap.ui.mdc.mixin.test.TestClassWithFetchProperties", {
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

			jQuery.sap.unloadResources("sap/ui/mdc/BaseDelegate.js", false, true, true);
			jQuery.sap.unloadResources("sap/ui/mdc/odata/BaseDelegate.js", false, true, true);
			jQuery.sap.unloadResources("delegates/odata/v4/BaseDelegate.js", false, true, true);

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
		var done = assert.async(2);
		oSomeInstance = new TestClass();
		oSomeInstance.initControlDelegate().then(function (oDelegate) {
			assert.ok(!!oDelegate, "module loaded successfully");
			done();
		});
		assert.ok(oSomeInstance.bDelegateLoading, "module loading");

		var oSomeInstance1 = new TestClass({delegate: {name: "/delegate-doesnt-exist"}});
		oSomeInstance1.initControlDelegate().catch(function (oError) {
			assert.ok(oError instanceof Error, "module loading failed");
			oSomeInstance1.destroy();
			done();
		});
	});

	QUnit.test("subsequent initControlDelegate calls", function(assert) {
		var done = assert.async();
		sinon.spy(sap.ui, "require");
		oSomeInstance = new TestClass();
		var oFirstCall = oSomeInstance.initControlDelegate();
		assert.ok(oFirstCall instanceof Promise, "First call to initControlDelegate");
		oFirstCall.then(function (oDelegate) {
			assert.ok(!!oDelegate, "module loaded successfully");

			var oThirdCall = oSomeInstance.initControlDelegate();
			assert.ok(oThirdCall instanceof Promise, "Third call to initControlDelegate ");
			oThirdCall.then(function () {
				assert.ok(sap.ui.require.withArgs("sap/ui/mdc/BaseDelegate").calledOnce, "module is only loaded once");
				sap.ui.require.restore();
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

		var oSomeInstance1 = new TestClass(undefined, {delegate: {name: "sap/ui/mdc/odata/BaseDelegate"}});
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

		var done = assert.async();

		oSomeInstance.awaitControlDelegate().then(function () {
			assert.ok(oSomeInstance.getControlDelegate() === oSomeInstance._oDelegate, "delegate returned");
			done();
		});
	});

	QUnit.test("getPayload", function(assert) {
		var oPayload = {x:1};
		oSomeInstance = new TestClass({delegate: {name: "sap/ui/mdc/BaseDelegate", payload: oPayload}});
		assert.ok(oSomeInstance.getPayload() === oPayload, "Payload returned");
	});

	QUnit.test("getTypeUtil", function(assert) {
		oSomeInstance = new TestClass();
		assert.deepEqual(oSomeInstance.getDelegate(), {name: "sap/ui/mdc/BaseDelegate"}, "Default delegate configuration");

		assert.throws(function () {
			oSomeInstance.getTypeUtil();
		}, function(oError) {
			return oError instanceof Error && oError.message === "A delegate instance providing typeUtil is not (yet) available.";
		},  "throws error if called before delegated is initialized");

		oSomeInstance.initControlDelegate();

		var done = assert.async();

		oSomeInstance.awaitControlDelegate().then(function () {
			assert.ok(oSomeInstance.getTypeUtil() === oSomeInstance._oDelegate.getTypeUtil(), "delegate returned");
			done();
		});
	});
});
