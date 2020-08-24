/* global QUnit, sinon*/

sap.ui.define([
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/FilterField"
], function (
	FilterBarBase, FilterField
) {
	"use strict";

	QUnit.module("FilterBarBase API tests", {
		beforeEach: function () {
			this.oFilterBarBase = new FilterBarBase({
				delegate: { name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate", payload: { modelName: undefined, collectionName: "test" } }
            });
		},
		afterEach: function () {
			this.oFilterBarBase.destroy();
            this.oFilterBarBase = undefined;
            this.oProperty1 = null;
		}
	});

	QUnit.test("instanciable", function (assert) {
        assert.ok(this.oFilterBarBase, "FilterBarBase instance created");
        assert.ok(!this.oFilterBarBase._bPersistValues, "Persistence is not given by default");
    });

    QUnit.test("getCurrentState returns conditions based on the persistence setting", function(assert){
        this.oFilterBarBase.setFilterConditions({
            "key1": [
                {
                  "operator": "EQ",
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": "Validated"
                }
              ]
        });
        var oCurrentState = this.oFilterBarBase.getCurrentState();

        assert.ok(!oCurrentState.filter, "As the persistence for filter values is disabled, current state will not return filter conditions");

        this.oFilterBarBase._bPersistValues = true;
        oCurrentState = this.oFilterBarBase.getCurrentState();

        assert.ok(oCurrentState.filter, "Filter values are returned once the persistence is given");
    });

    QUnit.test("'getConditions' should always return the externalized conditions", function(assert){
        var done = assert.async();

        this.oFilterBarBase._bPersistValues = false;

        var oDummyCondition = {
            "key1": [
                {
                  "operator": "EQ",
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": "Validated"
                }
              ]
        };

        this.oFilterBarBase.initialized().then(function(){

            sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: this.oFilterBarBase.getTypeUtil().getTypeConfig("sap.ui.model.type.String")});

            this.oFilterBarBase._setXConditions(oDummyCondition);

            assert.deepEqual(oDummyCondition, this.oFilterBarBase.getConditions(), "Condition returned without persistence active");
            assert.ok(!this.oFilterBarBase.getConditions()["key1"][0].hasOwnProperty("isEmpty"), "External format");
            assert.ok(!this.oFilterBarBase._getXConditions()["key1"][0].hasOwnProperty("isEmpty"), "External format");
            assert.ok(this.oFilterBarBase.getInternalConditions()["key1"][0].hasOwnProperty("isEmpty"), "Internal format");
            done();

        }.bind(this));

    });

    QUnit.test("check reaction to the FilterField 'submit' event", function(assert){
        var oFilterField = new FilterField();
        sinon.stub(this.oFilterBarBase, "triggerSearch");
        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        assert.ok(!oFilterField.hasListeners("submit"));

        this.oFilterBarBase.addFilterItem(oFilterField);

        assert.ok(oFilterField.hasListeners("submit"));

        assert.ok(!this.oFilterBarBase.triggerSearch.called);
        oFilterField.fireSubmit({promise: Promise.resolve()});

        return this.oFilterBarBase.waitForInitialization().then(function() {
            assert.ok(this.oFilterBarBase.triggerSearch.calledOnce);

            this.oFilterBarBase.removeFilterItem(oFilterField);
            assert.ok(!oFilterField.hasListeners("submit"));

            oFilterField.destroy();
            this.oFilterBarBase.triggerSearch.restore();
        }.bind(this));

    });

    QUnit.test("check reaction to the basic search 'submit' event", function(assert){
        var oFilterField = new FilterField();
        sinon.stub(this.oFilterBarBase, "triggerSearch");
        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        assert.ok(!oFilterField.hasListeners("submit"));

        this.oFilterBarBase.setBasicSearchField(oFilterField);
        assert.ok(oFilterField.hasListeners("submit"));

		assert.ok(!this.oFilterBarBase.triggerSearch.called);
        oFilterField.fireSubmit({promise: Promise.resolve()});

        return this.oFilterBarBase.waitForInitialization().then(function() {
            assert.ok(this.oFilterBarBase.triggerSearch.calledOnce);

            this.oFilterBarBase.triggerSearch.restore();
        }.bind(this));

    });

    QUnit.test("Check 'valid' promise - do not provide parameter", function(assert){
        var done = assert.async();

        var oValid = this.oFilterBarBase.valid();

        var oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 1, "Search executed by default");
            done();
        });
    });

    QUnit.test("Check 'valid' promise - explicitly fire search", function(assert){
        var done = assert.async();

        var oValid = this.oFilterBarBase.valid(true);

        var oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 1, "Search executed");
            done();
        });
    });

    QUnit.test("Check 'valid' promise - do not fire search", function(assert){
        var done = assert.async();

        var oValid = this.oFilterBarBase.valid(false);

        var oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 0, "No Search executed");
            done();
        });
    });

    QUnit.test("Check cleanup for search promise", function(assert){

        var done = assert.async();

        var oValidPromise = this.oFilterBarBase.valid(false);

        oValidPromise.then(function(){
            assert.ok(!this.oFilterBarBase._fResolvedSearchPromise, "Search resolve has been cleaned up");
            assert.ok(!this.oFilterBarBase._fRejectedSearchPromise, "Search reject has been cleaned up");

            done();
        }.bind(this));

    });

    QUnit.test("Check cleanup for metadata promise", function(assert){

        var done = assert.async();

        var oMetadataPromise = this.oFilterBarBase._oMetadataAppliedPromise;

        oMetadataPromise.then(function(){
            assert.ok(!this.oFilterBarBase._fResolveMetadataApplied, "Metadata resolve has been cleaned up");

            done();
        }.bind(this));

    });

    QUnit.test("Check cleanup for initial filters promise", function(assert){

        var done = assert.async();

        var oInitialFiltersPromise = this.oFilterBarBase._oInitialFiltersAppliedPromise;

        oInitialFiltersPromise.then(function(){
            assert.ok(!this.oFilterBarBase._fResolveInitialFiltersApplied, "Initial filter resolve has been cleaned up");

            done();
        }.bind(this));

    });

});
