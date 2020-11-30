/* global QUnit, sinon */

sap.ui.define([
    "sap/ui/mdc/Control",
    "sap/ui/mdc/mixin/FilterIntegrationMixin",
    "sap/ui/mdc/filterbar/FilterBarBase"
], function(
	Control,
    FilterIntegrationMixin,
    FilterBarBase
) {
    "use strict";

    var TestClass;
    var oSomeInstance;

    //can be used to toggle inbuilt filtering
    var bInbuiltEnabled = false;

    //Can be used for assertions
    var fnExecuteOnRebind = function(){};

    var fnExtendTestClass = function () {
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

    var fnCreateValidInstance = function () {
        fnExtendTestClass();
        oSomeInstance = new TestClass();
        oSomeInstance.rebind = function(){
            fnExecuteOnRebind();
        };
        oSomeInstance.isFilteringEnabled = function(){ return bInbuiltEnabled;};

        return oSomeInstance;
    };

    var fnCleanup = function () {
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
        var vFilter = new Control();
        var IFILTER = "sap.ui.mdc.IFilter";
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

    QUnit.test("setFilter vor valid 'IFiter' connections", function(assert){
        var oFilter = new FilterBarBase();
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

    QUnit.test("check 'checkAndRebind'", function(assert) {
        assert.ok(oSomeInstance.checkAndRebind instanceof Function, "Method provided");
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

    QUnit.test("Check 'search' registration", function(assert){

        var done = assert.async(1);

        var oExternalFilter = new FilterBarBase();

        oSomeInstance.setFilter(oExternalFilter);

        fnExecuteOnRebind = function() {
            assert.ok(true, "Rebind executed");
            done();
        };

        oExternalFilter.fireSearch();

    });

    QUnit.test("Check 'checkAndRebind' functionality - only external filtering enabled", function(assert){

        bInbuiltEnabled = false;

        var oExternalFilter = new FilterBarBase();
        var oInternalFilter = new FilterBarBase();

        oSomeInstance.setFilter(oExternalFilter);

        oSomeInstance.retrieveInbuiltFilter = function() {
            return Promise.resolve(oInternalFilter);
        };

        var oExternalFilterSpy = sinon.spy(oExternalFilter, "valid");
        var oRetrieveInnerSpy = sinon.spy(oSomeInstance, "retrieveInbuiltFilter");

        oSomeInstance.checkAndRebind();

        assert.equal(oExternalFilterSpy.callCount, 1, "Filter Promise fetched");
        assert.equal(oRetrieveInnerSpy.callCount, 0, "Filter Promise not fetched");

    });

    QUnit.test("Check 'checkAndRebind' functionality - no filter association, but inbuilt enabled", function(assert){

        bInbuiltEnabled = true;

        var oInternalFilter = new FilterBarBase();

        oSomeInstance.retrieveInbuiltFilter = function() {
            return Promise.resolve(oInternalFilter);
        };

        var oRetrieveInnerSpy = sinon.spy(oSomeInstance, "retrieveInbuiltFilter");

        oSomeInstance.checkAndRebind();

        assert.equal(oRetrieveInnerSpy.callCount, 1, "Filter Promise fetched");

    });

    QUnit.test("Check 'checkAndRebind' functionality - no filter association, inbuilt not enabled", function(assert){

        bInbuiltEnabled = false;

        var oInternalFilter = new FilterBarBase();

        oSomeInstance.retrieveInbuiltFilter = function() {
            return Promise.resolve(oInternalFilter);
        };

        var oRetrieveInnerSpy = sinon.spy(oSomeInstance, "retrieveInbuiltFilter");

        oSomeInstance.checkAndRebind();

        assert.equal(oRetrieveInnerSpy.callCount, 0, "Filter Promise not fetched");

    });

    QUnit.test("Check 'checkAndRebind' functionality - both (internal/external) enabled", function(assert){

        bInbuiltEnabled = true;

        var oExternalFilter = new FilterBarBase();
        var oInternalFilter = new FilterBarBase();

        oSomeInstance.setFilter(oExternalFilter);

        oSomeInstance.retrieveInbuiltFilter = function() {
            return Promise.resolve(oInternalFilter);
        };

        var oExternalFilterSpy = sinon.spy(oExternalFilter, "valid");
        var oRetrieveInnerSpy = sinon.spy(oSomeInstance, "retrieveInbuiltFilter");

        oSomeInstance.checkAndRebind();

        assert.equal(oExternalFilterSpy.callCount, 1, "Filter Promise fetched");
        assert.equal(oRetrieveInnerSpy.callCount, 1, "Filter Promise fetched");

    });

    QUnit.test("Hooks", function(assert) {
		var oFilter = new FilterBarBase();
		var oOtherFilter = new FilterBarBase();
		var oOnFilterProvided = sinon.spy();
		var oOnFilterRemoved = sinon.spy();
		var oOnFiltersChanged = sinon.spy();
		var oOnFilterSearch = sinon.spy();

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

});
