/* global QUnit, sinon*/

sap.ui.define([
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/FilterField",
    "sap/ui/mdc/odata/TypeUtil"
], function (
	FilterBarBase, FilterField, TypeUtil
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
        var done = assert.async();


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

        sinon.stub(this.oFilterBarBase, "_applyFilterConditionsChanges").returns(Promise.resolve());
        this.oFilterBarBase.initialized().then(function(){
            sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: this.oFilterBarBase.getTypeUtil().getTypeConfig("sap.ui.model.type.String")});

            var oCurrentState = this.oFilterBarBase.getCurrentState();

            assert.ok(!oCurrentState.filter, "As the persistence for filter values is disabled, current state will not return filter conditions");


            this.oFilterBarBase._bPersistValues = true;
            oCurrentState = this.oFilterBarBase.getCurrentState();

            assert.ok(oCurrentState.filter, "Filter values are returned once the persistence is given");

            done();
        }.bind(this));
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
        sinon.stub(this.oFilterBarBase, "getPropertyInfoSet").returns([]);
        sinon.stub(this.oFilterBarBase, "initialized").returns(Promise.resolve());

        assert.ok(!oFilterField.hasListeners("submit"));

        this.oFilterBarBase.addFilterItem(oFilterField);

        assert.ok(oFilterField.hasListeners("submit"));

        assert.ok(!this.oFilterBarBase.triggerSearch.called);
        oFilterField.fireSubmit({promise: Promise.resolve()});

        return this.oFilterBarBase.initialized().then(function() {
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

    QUnit.test("check reaction to the basic search 'submit' with an filter change event", function(assert){
        var nIdx = 0;
        var oFilterField = new FilterField();

        var fTestPromiseResolve = null;
        var oTestPromise = new Promise(function(resolve) {
            fTestPromiseResolve = resolve;
        });

        sinon.stub(this.oFilterBarBase, "triggerSearch");
        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        sinon.stub(this.oFilterBarBase, "_retrieveMetadata").returns(Promise.resolve());
        this.oFilterBarBase._addConditionChange = function() {
            assert.equal(++nIdx, 1);
        };
        this.oFilterBarBase.triggerSearch = function() {
            assert.equal(++nIdx, 2);
            fTestPromiseResolve();
        };


        this.oFilterBarBase.setBasicSearchField(oFilterField);

        this.oFilterBarBase._bPersistValues = true;
        sinon.stub(this.oFilterBarBase, "_isPersistenceSupported").returns(true);

        this.oFilterBarBase._handleConditionModelPropertyChange({ getParameter: function(sParam) {
            if (sParam === "path") {
                return "/conditions/$search";
            } else if (sParam === "value") {
                return [{
                    "operator": "EQ",
                    "values": ["SomeTestValue"],
                    "validated": "Validated"
                }];
            }
        }});

        oFilterField.fireSubmit({promise: Promise.resolve()});

        return oTestPromise;
    });

    QUnit.test("Check 'valid' promise - do not provide parameter", function(assert){
        var oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        var oValid = this.oFilterBarBase.validate();

        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 1, "Search executed by default");
        });
    });

    QUnit.test("Check 'valid' promise - explicitly fire search", function(assert){
        var oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        var oValid = this.oFilterBarBase.triggerSearch();

        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 1, "Search executed");
        });
    });

    QUnit.test("Check 'valid' promise - do not fire search", function(assert){
        var oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        var oValid = this.oFilterBarBase.validate(true);
        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 0, "No Search executed");
        });
    });

    QUnit.test("Check cleanup for search promise", function(assert){

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        var oValidPromise = this.oFilterBarBase.validate();

        return oValidPromise.then(function(){
            assert.ok(!this.oFilterBarBase._fResolvedSearchPromise, "Search resolve has been cleaned up");
            assert.ok(!this.oFilterBarBase._fRejectedSearchPromise, "Search reject has been cleaned up");
        }.bind(this));

    });

    QUnit.test("Check validate without/with existing metadata", function(assert){

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        sinon.stub(this.oFilterBarBase, "_retrieveMetadata").returns(Promise.resolve());
        sinon.stub(this.oFilterBarBase, '_validate').callsFake(function fakeFn() {
            this.oFilterBarBase._fResolvedSearchPromise();
            this.oFilterBarBase._fRejectedSearchPromise = null;
            this.oFilterBarBase._fResolvedSearchPromise = null;
        }.bind(this));

        sinon.stub(this.oFilterBarBase, "_hasRetrieveMetadataToBeCalled").returns(false);
        var oValidPromise = this.oFilterBarBase.validate();

        return oValidPromise.then(function(){
            assert.ok(!this.oFilterBarBase._retrieveMetadata.called);

            this.oFilterBarBase._hasRetrieveMetadataToBeCalled.restore();
            sinon.stub(this.oFilterBarBase, "_hasRetrieveMetadataToBeCalled").returns(true);

            oValidPromise = this.oFilterBarBase.validate();

            return oValidPromise.then(function(){
                assert.ok(this.oFilterBarBase._retrieveMetadata.calledOnce);
            }.bind(this));

        }.bind(this));
    });

    QUnit.test("Check cleanup for metadata promise", function(assert){

        var done = assert.async();

        this.oFilterBarBase._waitForMetadata().then(function(){
            assert.ok(!this.oFilterBarBase._fResolveMetadataApplied, "Metadata resolve has been cleaned up");

            done();
        }.bind(this));

    });

    QUnit.test("Check cleanup for initial filters promise", function(assert){

        sinon.stub(this.oFilterBarBase, "awaitPropertyHelper").returns(Promise.resolve());

        return this.oFilterBarBase.initialized().then(function(){
            assert.ok(!this.oFilterBarBase._fResolveInitialFiltersApplied, "Initial filter resolve has been cleaned up");
        }.bind(this));

    });

    QUnit.test("Check multiple onSearch calls", function(assert){

        var fnTriggerPromiseResolve = null;
        var oTriggerPromise = new Promise(function(resolve, reject) { fnTriggerPromiseResolve = resolve; });

        sinon.stub(this.oFilterBarBase, "triggerSearch").callsFake(function() {
            return oTriggerPromise;
        });

        assert.ok(!this.oFilterBarBase._bSearchPressed, "not yet set");


        this.oFilterBarBase.onSearch();
        assert.ok(this.oFilterBarBase._bSearchPressed, "should be set");

        this.oFilterBarBase.onSearch();
        assert.ok(this.oFilterBarBase._bSearchPressed, "should be set");

        fnTriggerPromiseResolve();
        return oTriggerPromise.then(function(){
            assert.ok(this.oFilterBarBase.triggerSearch.calledOnce, "should be called once");
            assert.ok(!this.oFilterBarBase._bSearchPressed, "should be resetted");
        }.bind(this));

    });

    QUnit.test("Check _handleFilterItemSubmit", function(assert){
        sinon.stub(this.oFilterBarBase, "triggerSearch");

        var fnSubmitPromiseResolve = null;
        var oSubmitPromise = new Promise(function(resolve, reject) { fnSubmitPromiseResolve = resolve; });
        var oEvent = {
            getParameter: function() { fnSubmitPromiseResolve(); return oSubmitPromise; }
        };

        var done = assert.async();

        this.oFilterBarBase._handleFilterItemSubmit(oEvent);
        oSubmitPromise.then(function() {

            assert.ok(this.oFilterBarBase.triggerSearch.calledOnce, "should be called once");

            var fnChangePromiseResolve = null;
            var oChangePromise = new Promise(function(resolve, reject) { fnChangePromiseResolve = resolve; });
            this.oFilterBarBase._aCollectedChangePromises = [ Promise.resolve(), Promise.resolve(), oChangePromise];

            oSubmitPromise = Promise.resolve();

            oEvent = {
               getParameter: function() { return oSubmitPromise; }
            };
            this.oFilterBarBase._handleFilterItemSubmit(oEvent);
            oSubmitPromise.then(function() {

                fnChangePromiseResolve();

                Promise.all(this.oFilterBarBase._aCollectedChangePromises).then(function() {
                    assert.ok(this.oFilterBarBase.triggerSearch.calledTwice, "should be called twice");
                    done();
                }.bind(this));
            }.bind(this));
        }.bind(this));
    });


    QUnit.test("Check _handleFilterItemSubmit with ongoing flex changes", function(assert){
        var done = assert.async();

        var fnSubmitPromiseResolve = null;
        var oSubmitPromise = new Promise(function(resolve, reject) { fnSubmitPromiseResolve = resolve; });
        var oEvent = {
            getParameter: function() { fnSubmitPromiseResolve(); return oSubmitPromise; }
        };

        var fnFlexPromiseResolve = null;
        var oFlexPromise = new Promise(function(resolve, reject) { fnFlexPromiseResolve = resolve; });
        sinon.stub(this.oFilterBarBase, "_getWaitForChangesPromise").returns(oFlexPromise);

        sinon.stub(this.oFilterBarBase, "_applyInitialFilterConditions").callsFake(function() {
            this.oFilterBarBase._bInitialFiltersApplied = true;
            this.oFilterBarBase._fResolveInitialFiltersApplied();
            this.oFilterBarBase._fResolveInitialFiltersApplied = null;
        }.bind(this));

        var nStep = 0;
        var fSearch = function(oEvent) {
            assert.equal(++nStep, 2);
            done();
        };
        var fFiltersChanged = function(oEvent) {
            assert.equal(++nStep, 1);
        };
        this.oFilterBarBase.attachFiltersChanged(fFiltersChanged);
        this.oFilterBarBase.attachSearch(fSearch);

		sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        this.oFilterBarBase._reportModelChange({
            triggerSearch: true,
            triggerFilterUpdate: true
        });

        this.oFilterBarBase._handleFilterItemSubmit(oEvent);
        oSubmitPromise.then(function() {
            setTimeout(function() { fnFlexPromiseResolve(); });
        });
    });

    QUnit.test("Check 'filtersChange' event handling on filter changes", function(assert){

        var done = assert.async();

        sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String")});

		this.oFilterBarBase.initialized().then(function () {
            // --> this would happen during runtime through a change
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

            this.oFilterBarBase.attachFiltersChanged(function(oEvent){
                assert.ok(oEvent, "Event gets triggered since a filter update is done by _onModifications");
                done();
            });

            //trigger the handling after changes have been applied
            this.oFilterBarBase._onModifications();
        }.bind(this));

    });

    QUnit.test("Check change appliance handling", function(assert){

        assert.ok(this.oFilterBarBase._aOngoingChangeAppliance.length === 0, "no pending appliance");
        this.oFilterBarBase._addConditionChange({
			key1: [
				{operator: "EQ", value: ["Test"]}
			]
		});
        assert.ok(this.oFilterBarBase._aOngoingChangeAppliance.length === 1, "pending appliance");
    });

    QUnit.test("Check modification handling & pending modification (awaitPendingModification)", function(assert){

		var oReportSpy = sinon.spy(this.oFilterBarBase, "_reportModelChange");

        // usually this promise is provided by sap/ui/mdc/flexibility/Util --> since this is propagated by AdaptationMixin#awaitPendingModification
        // this test is using this variable to mock a long pending change appliance
        this.oFilterBarBase._pPendingModification = new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve();
            }, 200);
        });

		assert.notOk(oReportSpy.called, "No change reported yet");

		return this.oFilterBarBase.awaitPendingModification().then(function(){
			assert.ok(oReportSpy.calledOnce, "Change has been reported to update FilterBar");
		});

    });

	QUnit.test("Check modification handlingg & pending modification (awaitPendingModification)", function(assert){

		var done = assert.async();

		this.oFilterBarBase.attachFiltersChanged(function(oEvt){
			assert.ok(oEvt, "Filter event fired after modification has been processed");
			done();
		});

        // usually this promise is provided by sap/ui/mdc/flexibility/Util --> since this is propagated by AdaptationMixin#awaitPendingModification
        // this test is using this variable to mock a long pending change appliance
        this.oFilterBarBase._pPendingModification = new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve();
            }, 200);
        });

    });

    QUnit.test("Check sync of ConditionModel with filterConditions after change appliance", function(assert){
        sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String")});

		return this.oFilterBarBase.initialized().then(function () {

            //add condition to filterConditions --> simulate flex change
            this.oFilterBarBase.setFilterConditions({
                key1: [
                    {operator: "EQ", values: ["Test"]}
                ]
            });

            //Check empty CM
            assert.equal(this.oFilterBarBase._getConditionModel().getConditions("key1").length, 0, "No conditions yet in CM");

            //trigger the sync
            return this.oFilterBarBase._onModifications()
            .then(function(){
                assert.equal(this.oFilterBarBase._getConditionModel().getConditions("key1").length, 1, "CM and filterConditons are now in sync");
            }.bind(this));

        }.bind(this));


    });

});
