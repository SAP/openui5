/* global QUnit, sinon */

sap.ui.define([
    "sap/ui/mdc/Control",
    "sap/ui/mdc/mixin/FilterIntegrationMixin",
    "sap/ui/mdc/filterbar/FilterBarBase",
    "sap/ui/mdc/enums/ReasonMode"
], function(
	Control,
    FilterIntegrationMixin,
    FilterBarBase,
    ReasonMode
) {
    "use strict";

    let TestClass;
    let oSomeInstance;

    //can be used to toggle inbuilt filtering
    let bInbuiltEnabled = false;

    //Can be used for assertions
    let fnExecuteOnRebind = function(){};

    const fnExtendTestClass = function () {
        TestClass = Control.extend("temp",{
            metadata: {
                associations: {
                    filter: {
                        type: "sap.ui.mdc.IFilter",
                        multiple: false
                    }
                }
            }
        });

        FilterIntegrationMixin.call(TestClass.prototype);

    };

    const fnCreateValidInstance = function () {
        fnExtendTestClass();
        oSomeInstance = new TestClass();
        oSomeInstance._rebind = function() {
            fnExecuteOnRebind(...arguments);
        };
        oSomeInstance.isFilteringEnabled = function() { return bInbuiltEnabled; };
        oSomeInstance.getFilterConditions = function() { return { conditionA : ["abc"], conditionB: ["def"] }; };
        oSomeInstance.getPropertyHelper = function() {
            return {
                getProperty : function(sPropName) {
                    if (sPropName === "conditionA") {
                        return {label: "ABC"};
                    } else if (sPropName === "conditionB") {
                        return {label: "DEF"};
                    }

                    return undefined;
                }
            };
        };

        return oSomeInstance;
    };

    const fnCleanup = function () {
        if (oSomeInstance) {
            oSomeInstance.destroy();
            oSomeInstance = undefined;
        }
        if (TestClass) {
            TestClass = undefined;
        }
    };

    QUnit.module("FilterIntegrationMixin error handling", {
        beforeEach: function () {
            fnExtendTestClass();
        },
        afterEach: function () {
            fnCleanup();
        }
    });

    QUnit.test("create a control instance that does not fulfill 'FilterIntegrationMixin' requirements", function (assert) {
        assert.throws(
            function () {
                oSomeInstance = new TestClass();
                //Error should still occur even with a valid IFilter, as some methods are missing for the TestClass
                oSomeInstance.setFilter(new FilterBarBase());
            },
            function (oError) {
                return oError instanceof Error;
            },
            "Error has been raised as a method is missing"
        );
    });

    QUnit.test("setFilter error for invalid 'IFilter' connections", function (assert) {
        const vFilter = new Control();
        const IFILTER = "sap.ui.mdc.IFilter";
        assert.throws(
            function () {
                oSomeInstance = fnCreateValidInstance();
                oSomeInstance.setFilter(vFilter);
            },
            function (oError) {
                return (
                    oError instanceof Error &&
                    oError.message === ("\"" + vFilter + "\" is not valid for association \"filter\"."
										+ " Please use an object that implements the \"" + IFILTER + "\" interface")
                );
            },
            "Error has been raised for false provided 'filter' association"
        );
    });

    QUnit.test("setFilter vor valid 'IFiter' connections", function(assert) {
        const oFilter = new FilterBarBase();
        oSomeInstance = fnCreateValidInstance();
        oSomeInstance.setFilter(oFilter);
        assert.ok("'setFilter' does not crash when used with a valid 'IFilter' implementing control");
    });

    QUnit.module("FilterIntegrationMixin API", {
        beforeEach: function () {
            fnCreateValidInstance();
            oSomeInstance = new TestClass();
        },
        afterEach: function () {
            fnCleanup();
        }
    });

	QUnit.test("initialization", function(assert) {
        assert.ok(oSomeInstance, "Control instance created");
    });

    QUnit.test("check '_validateFilter'", function(assert) {
        assert.ok(oSomeInstance._validateFilter instanceof Function, "Method provided");
    });

    QUnit.test("check 'rebind'", function(assert) {
        assert.ok(oSomeInstance.rebind instanceof Function, "Method provided");
    });

    QUnit.module("FilterIntegrationMixin integration in Control", {
        beforeEach: function () {
            oSomeInstance = fnCreateValidInstance();
        },
        afterEach: function () {
            fnExecuteOnRebind = function(){};
            fnCleanup();
        }
    });

    QUnit.test("Check 'search' registration", function(assert) {
        const done = assert.async();

        const oExternalFilter = new FilterBarBase();

        oSomeInstance.setFilter(oExternalFilter);

        fnExecuteOnRebind = function() {
            assert.ok(true, "Rebind executed");
            done();
        };

        oExternalFilter.fireSearch();

    });

    QUnit.test("Check forced refresh on search", function(assert) {
        const oExternalFilter = new FilterBarBase();

        fnExecuteOnRebind = sinon.stub();

        oSomeInstance.setFilter(oExternalFilter);
        oExternalFilter.fireSearch({reason: ReasonMode.Go});
        oExternalFilter.fireSearch({reason: ReasonMode.Enter});
        oExternalFilter.fireSearch();

        assert.notOk(oExternalFilter.getLiveMode(), "LiveMode is not enabled on FilterBar");
        assert.ok(fnExecuteOnRebind.calledThrice, "Function _rebind was called three times");
        assert.ok(fnExecuteOnRebind.firstCall.calledWith(true), "Reason 'Go' without liveMode forces refresh");
        assert.ok(fnExecuteOnRebind.secondCall.calledWith(false), "Reason 'Enter' will not force a refresh when liveMode is set to false");
        assert.ok(fnExecuteOnRebind.thirdCall.calledWith(false), "Without reason, no refresh is forced");
    });

    QUnit.test("Check forced refresh with liveMode", function(assert) {
        const oExternalFilter = new FilterBarBase({ liveMode: true });

        fnExecuteOnRebind = sinon.stub();

        oSomeInstance.setFilter(oExternalFilter);
        oExternalFilter.fireSearch({reason: ReasonMode.Enter});
        oExternalFilter.fireSearch({reason: ReasonMode.Go});
        oExternalFilter.fireSearch();

        assert.ok(oExternalFilter.getLiveMode(), "LiveMode is enabled on FilterBar");
        assert.ok(fnExecuteOnRebind.calledThrice, "Function _rebind was called three times");
        assert.ok(fnExecuteOnRebind.firstCall.calledWith(true), "Reason 'Enter' with liveMode forces refresh");
        assert.ok(fnExecuteOnRebind.secondCall.calledWith(false), "Reason 'Go' will not force a refresh when liveMode is set to true");
        assert.ok(fnExecuteOnRebind.thirdCall.calledWith(false), "Without reason, no refresh is forced");
    });

    QUnit.test("Check 'rebind' functionality - only external filtering enabled", function(assert) {

        bInbuiltEnabled = false;

        const oExternalFilter = new FilterBarBase();
        const oInternalFilter = new FilterBarBase();

        oSomeInstance.setFilter(oExternalFilter);

        oSomeInstance.retrieveInbuiltFilter = function() {
            return Promise.resolve(oInternalFilter);
        };

        const oExternalFilterSpy = sinon.spy(oExternalFilter, "validate");
        const oRetrieveInnerSpy = sinon.spy(oSomeInstance, "retrieveInbuiltFilter");

        oSomeInstance.rebind();

        assert.equal(oExternalFilterSpy.callCount, 1, "Filter Promise fetched");
        assert.equal(oRetrieveInnerSpy.callCount, 0, "Filter Promise not fetched");

    });

    QUnit.test("Check 'rebind' functionality - no filter association, but inbuilt enabled", async function(assert) {

        bInbuiltEnabled = true;

        const oInternalFilter = new FilterBarBase();

        oSomeInstance.retrieveInbuiltFilter = function() {
            return Promise.resolve(oInternalFilter);
        };

        const oRetrieveInnerSpy = sinon.spy(oSomeInstance, "retrieveInbuiltFilter");
        const oIternalFilterSpy = sinon.spy(oInternalFilter, "validate");

        await oSomeInstance.rebind();

        assert.equal(oRetrieveInnerSpy.callCount, 1, "Filter Promise fetched");
        assert.equal(oIternalFilterSpy.callCount, 1, "Internal filter validated");

    });

    QUnit.test("Check 'rebind' functionality - no filter association, inbuilt not enabled", async function(assert) {

        bInbuiltEnabled = false;

        const oInternalFilter = new FilterBarBase();

        oSomeInstance.retrieveInbuiltFilter = sinon.stub().resolves(oInternalFilter);
        oSomeInstance._rebind = sinon.stub().resolves("_rebind-someResult");

        await oSomeInstance.rebind().then((sResult) => {
            assert.strictEqual(sResult, "_rebind-someResult", "#rebind resolves if #_rebind resolves");
        }).catch(() => {
            assert.ok(false, "#rebind resolves if #_rebind resolves");
        }).finally(() => {
            assert.equal(oSomeInstance.retrieveInbuiltFilter.callCount, 0, "Filter Promise not fetched");
            assert.equal(oSomeInstance._rebind.callCount, 1, "#_rebind called once");
        });

        // eslint-disable-next-line require-atomic-updates
        oSomeInstance._rebind = sinon.stub().rejects(new Error("_rebind-someError"));
        await oSomeInstance.rebind().then(() => {
            assert.ok(false, "#rebind rejects if #_rebind rejects");
        }).catch((oError) => {
            assert.deepEqual(oError, new Error("_rebind-someError"),"#rebind rejects if #_rebind rejects");
        }).finally(() => {
            assert.equal(oSomeInstance._rebind.callCount, 1, "#_rebind called once");
        });
    });

    QUnit.test("Check 'rebind' functionality - both (internal/external) enabled", async function(assert) {

        bInbuiltEnabled = true;

        const oExternalFilter = new FilterBarBase();
        const oInternalFilter = new FilterBarBase();

        oSomeInstance.setFilter(oExternalFilter);

        oExternalFilter.validate = sinon.stub().resolves("externalFilter#validate-someResult");
        oSomeInstance.retrieveInbuiltFilter = sinon.stub().resolves(oInternalFilter);
        oInternalFilter.validate = sinon.stub().resolves("internalFilter#validate-someResult");
        oSomeInstance._rebind = sinon.stub().resolves("_rebind-someResult");

        await oSomeInstance.rebind().then((sResult) => {
            assert.strictEqual(sResult, "_rebind-someResult", "#rebind resolves if #_rebind resolves");
        }).catch(() => {
            assert.ok(false, "#rebind resolves if #_rebind resolves");
        }).finally(() => {
            assert.equal(oSomeInstance._rebind.callCount, 1, "#_rebind called once if all filters are valid");
        });

        // eslint-disable-next-line require-atomic-updates
        oSomeInstance._rebind = sinon.stub().rejects(new Error("_rebind-someError"));
        await oSomeInstance.rebind().then(() => {
            assert.ok(false, "#rebind rejects if #_rebind rejects");
        }).catch((oError) => {
            assert.deepEqual(oError, new Error("_rebind-someError"),"#rebind rejects if #_rebind rejects");
        }).finally(() => {
            assert.equal(oSomeInstance._rebind.callCount, 1, "#_rebind called once if all filters are valid");
        });

        oExternalFilter.validate = sinon.stub().rejects(new Error("externalFilter#validate-someError"));
        // eslint-disable-next-line require-atomic-updates
        oSomeInstance._rebind = sinon.stub().resolves("_rebind-someResult");
        await oSomeInstance.rebind().then(() => {
            assert.ok(false, "#rebind rejects if external filters are invalid");
        }).catch((oError) => {
            assert.deepEqual(oError, new Error("externalFilter#validate-someError"), "#rebind rejects if external filters are invalid");
        }).finally(() => {
            assert.equal(oSomeInstance._rebind.callCount, 0, "#_rebind not called if external filters are invalid");
        });

        oExternalFilter.validate = sinon.stub().resolves("externalFilter#validate-someResult");
        oInternalFilter.validate = sinon.stub().rejects(new Error("internalFilter#validate-someError"));
        oSomeInstance._rebind.resetHistory();
        await oSomeInstance.rebind().then(() => {
            assert.ok(false, "#rebind rejects if internal filters are invalid");
        }).catch((oError) => {
            assert.deepEqual(oError, new Error("internalFilter#validate-someError"), "#rebind rejects if internal filters are invalid");
        }).finally(() => {
            assert.equal(oSomeInstance._rebind.callCount, 0, "#_rebind not called if internal filters are invalid");
        });
    });

    QUnit.test("Hooks", function(assert) {
		const oFilter = new FilterBarBase();
		const oOtherFilter = new FilterBarBase();
		const oOnFilterProvided = sinon.spy();
		const oOnFilterRemoved = sinon.spy();
		const oOnFiltersChanged = sinon.spy();
		const oOnFilterSearch = sinon.spy();

		oSomeInstance._onFilterProvided = oOnFilterProvided;
		oSomeInstance._onFilterRemoved = oOnFilterRemoved;
		oSomeInstance._onFiltersChanged = function(oEvent) {
			oOnFiltersChanged(oEvent);
			assert.ok(oEvent && oEvent.isA && oEvent.isA("sap.ui.base.Event"),
				"Fired 'filtersChanged' event: _onFiltersChanged is called with the event object");
		};
		oSomeInstance._onFilterSearch = function(oEvent) {
			oOnFilterSearch(oEvent);
			assert.ok(oEvent && oEvent.isA && oEvent.isA("sap.ui.base.Event"),
				"Fired 'search' event: _onFilterSearch is called with the event object");
		};

		oSomeInstance.setFilter(oFilter);
		assert.ok(oOnFilterRemoved.notCalled, "Set filter: _onFilterRemoved is not called");
		assert.ok(oOnFilterProvided.calledOnceWithExactly(oFilter), "Set filter: _onFilterProvided is called once with the filter instance");

		oOnFilterRemoved.reset();
		oOnFilterProvided.reset();
		oSomeInstance.setFilter();
		assert.ok(oOnFilterRemoved.calledOnceWithExactly(oFilter), "Remove filter: _onFilterRemoved is called once with the filter instance");
		assert.ok(oOnFilterProvided.notCalled, "Remove filter: _onFilterProvided is not called");

		oSomeInstance.setFilter(oFilter);
		oOnFilterRemoved.reset();
		oOnFilterProvided.reset();
		oSomeInstance.setFilter(oOtherFilter);
		assert.ok(oOnFilterRemoved.calledOnceWithExactly(oFilter), "Change filter: _onFilterRemoved is called once with the filter instance");
		assert.ok(oOnFilterProvided.calledOnceWithExactly(oOtherFilter), "Change filter: _onFilterProvided is called once with the filter instance");

		oOtherFilter.fireFiltersChanged();
		oOtherFilter.fireSearch();
		assert.ok(oOnFiltersChanged.calledOnce, "Fired 'filtersChanged' event: _onFiltersChanged is called once");
		assert.ok(oOnFilterSearch.calledOnce, "Fired 'search' event: _onFilterSearch is called once");

		oOnFiltersChanged.reset();
		oOnFilterSearch.reset();
		oFilter.fireFiltersChanged();
		oFilter.fireSearch();
		assert.ok(oOnFiltersChanged.notCalled, "Fired 'filtersChanged' event on previously associated filter: _onFiltersChanged is not called");
		assert.ok(oOnFilterSearch.notCalled, "Fired 'search' event on previously associated filter: _onFilterSearch is not called");
	});

    QUnit.test("Filter label functionality", function(assert) {
        //Arrange
        oSomeInstance = fnCreateValidInstance();

        //Act
        const aLabels = oSomeInstance._getLabelsFromFilterConditions();

        //Assert
        assert.equal(aLabels.length, 2, "Expected two filter labels");
        assert.equal(aLabels[0], "ABC", "Correct first label returned");
        assert.equal(aLabels[1], "DEF", "Correct second label returned");


    });
});