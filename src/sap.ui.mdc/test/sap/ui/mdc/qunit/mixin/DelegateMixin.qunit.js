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
	var PropertyHelperSubclass = PropertyHelper.extend("sap.ui.mdc.mixin.test.PropertyHelper");
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
			jQuery.sap.unloadResources("sap/ui/mdc/odata/v4/BaseDelegate.js", false, true, true);

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
		assert.ok(oSomeInstance.awaitPropertyHelper(), "Property helper promise successfully set");
		assert.ok(oSomeInstance.initPropertyHelper(), "initPropertyHelper method successfully set");
		oSomeInstance.destroy();
		assert.notOk(oSomeInstance.awaitControlDelegate(), "Delegate promise successfully removed");
		assert.notOk(oSomeInstance.awaitPropertyHelper(), "Property helper promise successfully removed");
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
			oSomeInstance.setDelegate({name: "sap/ui/mdc/odata/v4/BaseDelegate"});
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

	QUnit.test("PropertyHelper initialization with default class", function(assert) {
		var pInitPropertyHelper;

		oSomeInstance = new TestClassWithFetchProperties();

		return Promise.race([
			pInitPropertyHelper = oSomeInstance.initPropertyHelper(),
			new Promise(function(resolve) {
				setTimeout(resolve, 200);
			})
		]).then(function() {
			assert.throws(function() {
				oSomeInstance.getPropertyHelper();
			}, "Property helper not yet initialized");
			return Promise.all([pInitPropertyHelper, oSomeInstance.initControlDelegate()]);
		}).then(function(aValues) {
			var oPropertyHelper = aValues[0];
			assert.ok(oPropertyHelper instanceof PropertyHelper, "Property helper type");
			if (oPropertyHelper) {
				assert.strictEqual(oPropertyHelper.getParent(), oSomeInstance, "Property helper parent");
			}
		});
	});

	QUnit.test("PropertyHelper initialization with subclass of sap.ui.mdc.util.PropertyHelper", function(assert) {
		oSomeInstance = new TestClassWithFetchProperties();
		oSomeInstance.initControlDelegate();

		return oSomeInstance.initPropertyHelper(PropertyHelperSubclass).then(function (oPropertyHelper) {
			assert.ok(oPropertyHelper instanceof PropertyHelperSubclass, "Property helper is an instance of the subclass");
		});
	});

	QUnit.test("PropertyHelper initialization with invalid class", function(assert) {
		oSomeInstance = new TestClassWithFetchProperties();
		assert.throws(function() {
			oSomeInstance.initPropertyHelper(ManagedObject);
		}, "Error thrown");
	});

	QUnit.test("PropertyHelper initialization from delegate with valid class", function(assert) {
		var oDelegate;

		oSomeInstance = new TestClassWithFetchProperties();

		return oSomeInstance.initControlDelegate().then(function(_oDelegate) {
			oDelegate = _oDelegate;
			oDelegate.fetchPropertyHelper = function() {
				return Promise.resolve(PropertyHelperSubclass);
			};
			return oSomeInstance.initPropertyHelper();
		}).then(function(oPropertyHelper) {
			assert.ok(oPropertyHelper instanceof PropertyHelperSubclass, "Property helper type");
		}).finally(function() {
			delete oDelegate.fetchPropertyHelper;
		});
	});

	QUnit.test("PropertyHelper initialization from delegate with valid class and property extensions", function(assert) {
		var oDelegate;
		var fnFetchProperties;
		var fnFetchPropertyExtensions;
		var fnFetchPropertyHelper;
		var oFetchPropertiesSpy = sinon.spy();
		var oFetchPropertyExtensionsSpy = sinon.spy();
		var oFetchPropertyHelperSpy = sinon.spy();
		var oPropertyHelperConstructorSpy = sinon.spy();
		var PropertyHelperStub = PropertyHelperSubclass.extend("sap.ui.mdc.mixin.test.PropertyHelperStub", {
			constructor: function() {
				oPropertyHelperConstructorSpy.apply(this, arguments);
				PropertyHelperSubclass.call(this, []);
			}
		});
		var aProperties = [];
		var mExtensions = {};

		oSomeInstance = new TestClassWithFetchProperties();

		return oSomeInstance.initControlDelegate().then(function(_oDelegate) {
			oDelegate = _oDelegate;
			fnFetchProperties = oDelegate.fetchProperties;
			oDelegate.fetchProperties = function() {
				oFetchPropertiesSpy.apply(this, arguments);
				return Promise.resolve(aProperties);
			};
			fnFetchPropertyExtensions = oDelegate.fetchPropertyExtensions;
			oDelegate.fetchPropertyExtensions = function() {
				oFetchPropertyExtensionsSpy.apply(this, arguments);
				return Promise.resolve(mExtensions);
			};
			fnFetchPropertyHelper = oDelegate.fetchPropertyHelper;
			oDelegate.fetchPropertyHelper = function() {
				oFetchPropertyHelperSpy.apply(this, arguments);
				return Promise.resolve(PropertyHelperStub);
			};
			return oSomeInstance.initPropertyHelper();
		}).then(function(oPropertyHelper) {
			assert.ok(oPropertyHelper instanceof PropertyHelperStub, "Property helper type");
			assert.ok(oFetchPropertiesSpy.calledOnceWithExactly(oSomeInstance), "Delegate.fetchProperties");
			assert.ok(oFetchPropertyExtensionsSpy.calledOnceWithExactly(oSomeInstance, aProperties), "Delegate.fetchPropertyExtensions");
			assert.ok(oFetchPropertyHelperSpy.calledOnceWithExactly(oSomeInstance, aProperties, mExtensions), "Delegate.fetchPropertyHelper");
			assert.ok(oPropertyHelperConstructorSpy.calledOnceWithExactly(aProperties, mExtensions, oSomeInstance), "PropertyHelper constructor");
		}).finally(function() {
			oDelegate.fetchProperties = fnFetchProperties;
			oDelegate.fetchPropertyExtensions = fnFetchPropertyExtensions;
			oDelegate.fetchPropertyHelper = fnFetchPropertyHelper;
		});
	});

	QUnit.test("PropertyHelper initialization from delegate with valid instance", function(assert) {
		var oDelegate;

		oSomeInstance = new TestClassWithFetchProperties();

		return oSomeInstance.initControlDelegate().then(function(_oDelegate) {
			oDelegate = _oDelegate;
			oDelegate.fetchPropertyHelper = function() {
				return Promise.resolve(new PropertyHelperSubclass([]));
			};
			return oSomeInstance.initPropertyHelper();
		}).then(function(oPropertyHelper) {
			assert.ok(oPropertyHelper instanceof PropertyHelperSubclass, "Property helper type");
		}).finally(function() {
			delete oDelegate.fetchPropertyHelper;
		});
	});

	QUnit.test("PropertyHelper initialization from delegate with invalid class", function(assert) {
		var oDelegate;

		oSomeInstance = new TestClassWithFetchProperties();

		return oSomeInstance.initControlDelegate().then(function(_oDelegate) {
			oDelegate = _oDelegate;
			oDelegate.fetchPropertyHelper = function() {
				return Promise.resolve(PropertyHelper);
			};
			return oSomeInstance.initPropertyHelper(PropertyHelperSubclass);
		}).then(function() {
			assert.ok(false, "Error thrown");
		}).catch(function() {
			assert.ok(true, "Error thrown");
		}).finally(function() {
			delete oDelegate.fetchPropertyHelper;
		});
	});

	QUnit.test("PropertyHelper initialization from delegate with invalid instance", function(assert) {
		var oDelegate;

		oSomeInstance = new TestClassWithFetchProperties();

		return oSomeInstance.initControlDelegate().then(function(_oDelegate) {
			oDelegate = _oDelegate;
			oDelegate.fetchPropertyHelper = function() {
				return Promise.resolve(new PropertyHelper([]));
			};
			return oSomeInstance.initPropertyHelper(PropertyHelperSubclass);
		}).then(function() {
			assert.ok(false, "Error thrown");
		}).catch(function() {
			assert.ok(true, "Error thrown");
		}).finally(function() {
			delete oDelegate.fetchPropertyHelper;
		});
	});

	QUnit.test("Destroy during PropertyHelper initialization", function(assert) {
		var done = assert.async();

		oSomeInstance = new TestClassWithFetchProperties();
		oSomeInstance.initControlDelegate().then(function() {
			var oErrorSpy = sinon.spy();
			var fnOldOnError = window.onerror;

			window.onerror = null; // Deactivate qunit global error handler.
			window.addEventListener("error", oErrorSpy);
			window.addEventListener("unhandledrejection", oErrorSpy);

			oSomeInstance.initPropertyHelper();
			oSomeInstance.destroy();

			setTimeout(function() {
				window.removeEventListener("error", oErrorSpy);
				window.removeEventListener("unhandledrejection", oErrorSpy);
				window.onerror = fnOldOnError;
				assert.equal(oErrorSpy.callCount, 0, "Destroying the control during initialization of the property helper does not cause errors");
				done();
			}, 0);
		});
	});

	QUnit.test("subsequent initPropertyHelper calls", function(assert) {
		oSomeInstance = new TestClassWithFetchProperties();

		var pFirstPromise = oSomeInstance.initPropertyHelper();
		var pSecondPromise = oSomeInstance.initPropertyHelper(PropertyHelper.extend("sap.ui.mdc.mixin.test.PropertyHelper"));
		var oFirstPropertyHelper;

		assert.ok(pFirstPromise instanceof Promise, "First call to initControlDelegate returns a promise");
		assert.strictEqual(pFirstPromise, pSecondPromise, "Second call returns the same promise instance as the first call");

		oSomeInstance.initControlDelegate();

		return Promise.all([pFirstPromise, pSecondPromise]).then(function(aPropertyHelpers) {
			oFirstPropertyHelper = aPropertyHelpers[0];
			assert.strictEqual(oFirstPropertyHelper, aPropertyHelpers[1], "First and second promise resolve with the same property helper instance");
			assert.ok(oFirstPropertyHelper && oFirstPropertyHelper.isA("sap.ui.mdc.util.PropertyHelper"),
				"Property helper is an instance of sap.ui.mdc.util.PropertyHelper");

			var pThirdPromise = oSomeInstance.initPropertyHelper();
			assert.strictEqual(pFirstPromise, pThirdPromise,
				"After the promise has already resolved, calls to initControlDelegate return the same promise");

			return pThirdPromise;
		}).then(function(oPropertyHelper) {
			assert.strictEqual(oFirstPropertyHelper, oPropertyHelper, "First and third promise resolve with the same property helper instance");
		});
	});

	QUnit.test("awaitPropertyHelper", function(assert) {
		oSomeInstance = new TestClassWithFetchProperties();

		var pAwaitPropertyHelper = oSomeInstance.awaitPropertyHelper();
		var pInitPropertyHelper = oSomeInstance.initPropertyHelper();
		oSomeInstance.initControlDelegate();

		assert.strictEqual(pAwaitPropertyHelper, pInitPropertyHelper, "initPropertyHelper and awaitPropertyHelper return the same promise");

		return Promise.all([pAwaitPropertyHelper, pInitPropertyHelper]).then(function(aPropertyHelpers) {
			assert.strictEqual(aPropertyHelpers[0], aPropertyHelpers[1], "Init and await resolve with the same property helper instance");
		});
	});

	QUnit.test("getPropertyHelper", function(assert) {
		oSomeInstance = new TestClassWithFetchProperties();

		assert.throws(function () {
			oSomeInstance.getPropertyHelper();
		}, "Throws error if called before the property helper is initialized");

		oSomeInstance.initControlDelegate();
		oSomeInstance.initPropertyHelper();

		return oSomeInstance.awaitControlDelegate().then(function (oPropertyHelper) {
			assert.strictEqual(oSomeInstance.getControlDelegate(), oPropertyHelper, "Returns the correct property helper instance");
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
