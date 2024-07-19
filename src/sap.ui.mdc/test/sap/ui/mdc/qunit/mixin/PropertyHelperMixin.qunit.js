/* global QUnit, sinon */

sap.ui.define([
    "sap/ui/mdc/Control",
    "sap/ui/mdc/util/PropertyHelper",
    "sap/ui/mdc/mixin/PropertyHelperMixin",
	"sap/ui/base/ManagedObject",
	"sap/ui/mdc/AggregationBaseDelegate",
	"sap/base/util/Deferred"
], function(
	Control,
    PropertyHelper,
    PropertyHelperMixin,
    ManagedObject,
	AggregationBaseDelegate,
	Deferred
) {
    "use strict";

    let TestClass;
    let oSomeInstance;
	let oFlexPromiseStub;
    const PropertyHelperSubclass = PropertyHelper.extend("sap.ui.mdc.mixin.test.PropertyHelper");

    function fnCreateTestClass(bEnablePropertyInfo, fnWaitForChangesPromise) {
		const oPropertyDefinitions = Object.assign({
			delegate: {
				type: "object",
				group: "Data",
				defaultValue: {
					name: "sap/ui/mdc/AggregationBaseDelegate"
				}
			}
		});

		if (bEnablePropertyInfo) {
			oPropertyDefinitions.propertyInfo = {
				type: "object",
				defaultValue: []
			};
		}

		TestClass = Control.extend("temp", {
			metadata: {
				properties: oPropertyDefinitions
			}
		});

		if (bEnablePropertyInfo) {
			const fnOriginalApplySettings = TestClass.prototype.applySettings;
			TestClass.prototype.applySettings = function (mSettings) {
				this._setupPropertyInfoStore("propertyInfo");
				return fnOriginalApplySettings.apply(this, arguments);
			};
		}

		TestClass.prototype._getWaitForChangesPromise = fnWaitForChangesPromise || function () {
			return Promise.resolve();
		};
	}

	function fnCreateInstance(oSettings) {
		oSomeInstance = new TestClass(oSettings);
		return oSomeInstance;
	}

    const fnCleanup = function () {

		if (oFlexPromiseStub) {
			oFlexPromiseStub.restore();
		}

		if (oSomeInstance) {
            oSomeInstance.destroy();
            oSomeInstance = undefined;
        }
        if (TestClass) {
            TestClass = undefined;
        }
    };

	function fnValidateHelperProperties (aExpectedProperties) {
		const aCurrentProperties = oSomeInstance._oPropertyHelper.getProperties();
		const bLengthMatch = aCurrentProperties.length === aExpectedProperties.length;
		const bNoMissingProperty = !!aExpectedProperties.find(function (oExpected) {
			return !!aCurrentProperties.find(function (oCurrent) {
				return oExpected.name === oCurrent.name;
			});
		});
		return bLengthMatch && bNoMissingProperty;
	}

    QUnit.module("Basics", {
        beforeEach: function () {
			fnCreateTestClass();
        },
        afterEach: function () {
            fnCleanup();
        }
    });


	QUnit.test("Control initialization", function(assert) {
		oSomeInstance = fnCreateInstance();
        assert.ok(oSomeInstance, "Control instance created");
    });

    QUnit.test("Manual PropertyHelper initialization", function(assert) {
		oSomeInstance = fnCreateInstance();
        const fnDone = assert.async();
        assert.ok(oSomeInstance._oPropertyHelperDeferred, "property helper init promise available");
        const oPropertyHelperPromise = oSomeInstance.initPropertyHelper();
        assert.ok(oSomeInstance._bPropertyHelperInitializing, "property helper init flag");

        oPropertyHelperPromise.then(function (oPropertyHelper) {
            assert.ok(oSomeInstance._oPropertyHelper, "property helper field available");
            assert.equal(oSomeInstance._oPropertyHelper, oPropertyHelper, "property helper equals promise result");
            fnDone();
        });
    });

	QUnit.test("Manual PropertyHelper initialization with subclass of sap.ui.mdc.util.PropertyHelper", function(assert) {
		oSomeInstance = fnCreateInstance();
		oSomeInstance.initControlDelegate();

		return oSomeInstance.initPropertyHelper(PropertyHelperSubclass).then(function (oPropertyHelper) {
			assert.ok(oPropertyHelper instanceof PropertyHelperSubclass, "Property helper is an instance of the subclass");
		});
	});

	QUnit.test("PropertyHelper initialization with invalid class", function(assert) {
		oSomeInstance = fnCreateInstance();
		assert.throws(function() {
			oSomeInstance.initPropertyHelper(ManagedObject);
		}, "Error thrown");
	});

	QUnit.test("PropertyHelper initialization from delegate with valid class", function(assert) {
		let oDelegate;

		oSomeInstance = fnCreateInstance();

		return oSomeInstance.initControlDelegate().then(function(_oDelegate) {
			oDelegate = _oDelegate;
			oDelegate.getPropertyHelperClass = function() {
				return PropertyHelperSubclass;
			};
			return oSomeInstance.initPropertyHelper();
		}).then(function(oPropertyHelper) {
			assert.ok(oPropertyHelper instanceof PropertyHelperSubclass, "Property helper type");
		}).finally(function() {
			delete oDelegate.getPropertyHelperClass;
		});
	});

	QUnit.test("PropertyHelper initialization from delegate with invalid class", function(assert) {
		let oDelegate;
		oSomeInstance = fnCreateInstance();

		return oSomeInstance.initControlDelegate().then(function(_oDelegate) {
			oDelegate = _oDelegate;
			oDelegate.getPropertyHelperClass = function() {
				return PropertyHelper;
			};
			return oSomeInstance.initPropertyHelper(PropertyHelperSubclass);
		}).then(function() {
			assert.ok(false, "Error thrown");
		}).catch(function() {
			assert.ok(true, "Error thrown");
		}).finally(function() {
			delete oDelegate.getPropertyHelperClass;
		});
	});

	QUnit.test("PropertyHelper initialization from delegate with instance", function(assert) {
		let oDelegate;

		oSomeInstance = fnCreateInstance();

		return oSomeInstance.initControlDelegate().then(function(_oDelegate) {
			oDelegate = _oDelegate;
			oDelegate.getPropertyHelperClass = function() {
				return new PropertyHelperSubclass([]);
			};
			return oSomeInstance.initPropertyHelper();
		}).then(function() {
			assert.ok(false, "Error thrown");
		}).catch(function() {
			assert.ok(true, "Error thrown");
		}).finally(function() {
			delete oDelegate.getPropertyHelperClass;
		});
	});

	QUnit.test("Destroy during PropertyHelper initialization", function(assert) {
		const done = assert.async();

		oSomeInstance = fnCreateInstance();
		oSomeInstance.initControlDelegate().then(function() {
			const oErrorSpy = sinon.spy();
			const fnOldOnError = window.onerror;

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
		oSomeInstance = fnCreateInstance();

		const pFirstPromise = oSomeInstance.initPropertyHelper();

		assert.throws(function () {
			oSomeInstance.initPropertyHelper(PropertyHelper.extend("sap.ui.mdc.mixin.test.PropertyHelper"));
		}, function(oError) {
			return oError instanceof Error && oError.message === "PropertyHelper already initializing/ed.";
		},  "throws error if called with different base class");

		const pSecondPromise = oSomeInstance.initPropertyHelper();
		let oFirstPropertyHelper;

		assert.ok(pFirstPromise instanceof Promise, "First call to initControlDelegate returns a promise");
		assert.strictEqual(pFirstPromise, pSecondPromise, "Second call returns the same promise instance as the first call");

		oSomeInstance.initControlDelegate();

		return Promise.all([pFirstPromise, pSecondPromise]).then(function(aPropertyHelpers) {
			oFirstPropertyHelper = aPropertyHelpers[0];
			assert.strictEqual(oFirstPropertyHelper, aPropertyHelpers[1], "First and second promise resolve with the same property helper instance");
			assert.ok(oFirstPropertyHelper && oFirstPropertyHelper.isA("sap.ui.mdc.util.PropertyHelper"),
				"Property helper is an instance of sap.ui.mdc.util.PropertyHelper");

			const pThirdPromise = oSomeInstance.initPropertyHelper();
			assert.strictEqual(pFirstPromise, pThirdPromise,
				"After the promise has already resolved, calls to initControlDelegate return the same promise");

			return pThirdPromise;
		}).then(function(oPropertyHelper) {
			assert.strictEqual(oFirstPropertyHelper, oPropertyHelper, "First and third promise resolve with the same property helper instance");
		});
	});

	QUnit.test("awaitPropertyHelper", function(assert) {
		oSomeInstance = fnCreateInstance();

		const pAwaitPropertyHelper = oSomeInstance.awaitPropertyHelper();
		const pInitPropertyHelper = oSomeInstance.initPropertyHelper();
		oSomeInstance.initControlDelegate();

		assert.strictEqual(pAwaitPropertyHelper, pInitPropertyHelper, "initPropertyHelper and awaitPropertyHelper return the same promise");

		return Promise.all([pAwaitPropertyHelper, pInitPropertyHelper]).then(function(aPropertyHelpers) {
			assert.strictEqual(aPropertyHelpers[0], aPropertyHelpers[1], "Init and await resolve with the same property helper instance");
		});
	});

	QUnit.test("getPropertyHelper", function(assert) {
		oSomeInstance = fnCreateInstance();

		assert.equal(oSomeInstance.getPropertyHelper(), null, "Returns null if called before the property helper is initialized");

		oSomeInstance.initControlDelegate();
		oSomeInstance.initPropertyHelper();

		return oSomeInstance.awaitControlDelegate().then(function (oPropertyHelper) {
			assert.strictEqual(oSomeInstance.getControlDelegate(), oPropertyHelper, "Returns the correct property helper instance");
		});
	});


    QUnit.test("finalizePropertyHelper, isPropertyHelperFinal, propertiesFinalized", function(assert) {

		fnCreateTestClass(true);

		const oSomeInstance = fnCreateInstance({propertyInfo: [{name: "a", label: "a", dataType: "String"}]});
		sinon.stub(AggregationBaseDelegate, "fetchProperties").returns(
			Promise.resolve([
				{name : "a", label: "a", dataType: "String"},
				{name : "b", label: "b", dataType: "String"},
				{name : "c", label: "b", dataType: "String"}
			])
		);

        return oSomeInstance.awaitPropertyHelper().then(function (oPropertyHelper) {

            const aProperties = oPropertyHelper.getProperties();

            assert.ok(aProperties, "property helper field available");
			assert.equal(aProperties.length, 1," expected 1 property");
            assert.ok(aProperties[0].name === "a", "properties contain expected fields");
            assert.notOk(oSomeInstance.isPropertyHelperFinal(), "property helper is not yet marked as final");

			oSomeInstance.setPropertyInfo([{name : "a", label: "a", dataType: "String"}, {name : "b", label: "b", dataType: "String"}]);

			assert.notOk(oSomeInstance.isPropertyHelperFinal(), "property helper is not yet marked as final");

			// eslint-disable-next-line max-nested-callbacks
			return Promise.all([
				oSomeInstance.propertiesFinalized(),
				oSomeInstance.finalizePropertyHelper().then(function () {
					assert.ok(oSomeInstance.isPropertyHelperFinal(), "property helper is now final");
					const aFinalProperties = oPropertyHelper.getProperties();
					assert.equal(aFinalProperties.length, 3, "all properties are now available");
				})
			]).then(function() {
				assert.ok(true, "propertiesFinalized and finalizePropertyHelper did resolve");
				// eslint-disable-next-line max-nested-callbacks
				return oSomeInstance.finalizePropertyHelper().then(function () {
					assert.ok(AggregationBaseDelegate.fetchProperties.calledOnce, "Delegate properties were only fetched once on repeated calls to finalize.");
					AggregationBaseDelegate.fetchProperties.restore();
				});
			});
        });
    });

	QUnit.test("Automatic PropertyHelper initialization and updates", function(assert) {
		fnCreateTestClass(true);
		const aInitialProperties = [{name: "A", label: "A", dataType: "String"}];
		const aUpdatedProperties = [...aInitialProperties, {name: "B", label: "B", dataType: "String"}, {name: "C", label: "C", dataType: "String"}];
		const aFinalProperties = [...aUpdatedProperties,
			{name : "D", label: "D", dataType: "String"},
			{name : "E", label: "E", dataType: "String"},
			{name : "F", label: "F", dataType: "String"}
		];
		const aIgnoredProperties = [...aUpdatedProperties, {name: "X", label: "X", dataType: "String"}, {name: "Y", label: "Y", dataType: "String"}];

		sinon.stub(AggregationBaseDelegate, "fetchProperties").returns(
			Promise.resolve(aFinalProperties)
		);

		oSomeInstance = fnCreateInstance();
        assert.notOk(oSomeInstance._oPropertyHelper, "property helper not available");
		assert.ok(oSomeInstance._bPropertyHelperInitializing, "property helper initializing without initial properties");
		oSomeInstance.destroy();


		oSomeInstance = fnCreateInstance({propertyInfo: aInitialProperties});
		return oSomeInstance._oApplySettingsDeferred.promise.then(function () {
			assert.ok(oSomeInstance._bPropertyHelperInitializing, "property helper initializing");

			return oSomeInstance.awaitPropertyHelper().then(function (oPropertyHelper) {
				assert.ok(oSomeInstance._oPropertyHelper, "property helper field available");
				assert.equal(oSomeInstance._oPropertyHelper, oPropertyHelper, "property helper equals promise result");
				assert.ok(fnValidateHelperProperties(aInitialProperties), "property helper properties valid.");

				oSomeInstance.setPropertyInfo(aUpdatedProperties);
				assert.ok(fnValidateHelperProperties(aUpdatedProperties), "property helper properties valid.");
				// eslint-disable-next-line max-nested-callbacks
				return oSomeInstance.finalizePropertyHelper().then(function () {
					assert.ok(oSomeInstance._bPropertyHelperFinal, "property helper is final.");
					assert.ok(fnValidateHelperProperties(aFinalProperties), "property helper properties valid.");
					oSomeInstance.setPropertyInfo(aIgnoredProperties);
					assert.ok(fnValidateHelperProperties(aFinalProperties), "propertyinfo updates have no effect on final propertyHelper");
				});
			});
		});
    });
});
