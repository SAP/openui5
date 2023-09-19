/* global QUnit, sinon*/

sap.ui.define([
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/DefaultTypeMap",
	'sap/base/Log'
], function (
	FilterBarBase, FilterField, DefaultTypeMap, Log
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
    });

    QUnit.test("getCurrentState returns conditions based on the persistence setting", function(assert){
        const done = assert.async();


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
            sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: this.oFilterBarBase.getTypeMap().getTypeConfig("sap.ui.model.type.String")});

            let oCurrentState = this.oFilterBarBase.getCurrentState();

            assert.ok(oCurrentState.filter, "The persistence for filter values is always enabled, current state will return filter conditions");


            oCurrentState = this.oFilterBarBase.getCurrentState();
            assert.ok(oCurrentState.filter, "The persistence for filter values is always enabled, current state will return filter conditions");

            done();
        }.bind(this));
    });

    QUnit.test("'getConditions' should always return the externalized conditions", function(assert){
        const done = assert.async();

        const oDummyCondition = {
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

            sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: this.oFilterBarBase.getTypeMap().getTypeConfig("sap.ui.model.type.String")});

            this.oFilterBarBase._setXConditions(oDummyCondition)
            .then(function(){
				// simulate change appliance
				this.oFilterBarBase.setFilterConditions(this.oFilterBarBase._getXConditions());

                assert.deepEqual(oDummyCondition, this.oFilterBarBase.getConditions(), "Condition returned without persistence active");
                assert.ok(!this.oFilterBarBase.getConditions()["key1"][0].hasOwnProperty("isEmpty"), "External format");
                assert.ok(!this.oFilterBarBase._getXConditions()["key1"][0].hasOwnProperty("isEmpty"), "External format");
                assert.ok(this.oFilterBarBase.getInternalConditions()["key1"][0].hasOwnProperty("isEmpty"), "Internal format");

                done();
            }.bind(this));
        }.bind(this));

    });

    QUnit.test("check reaction to the FilterField 'submit' event", function(assert){
        const oFilterField = new FilterField();
        sinon.stub(this.oFilterBarBase, "triggerSearch");

        assert.ok(!oFilterField.hasListeners("submit"));

        let fPromiseResolved;
        const oPromise = new Promise(function(resolve) {
            fPromiseResolved = resolve;
        });
        this.oFilterBarBase.addFilterItem(oFilterField);

        const fCallback = function(oEvent) {
            setTimeout(function() { fPromiseResolved(); }, 100);
        };

        oFilterField.attachSubmit(fCallback);

        assert.ok(oFilterField.hasListeners("submit"));

        assert.ok(!this.oFilterBarBase.triggerSearch.called);
        oFilterField.fireSubmit({promise: Promise.resolve()});

        return oPromise.then(function() {
            assert.ok(this.oFilterBarBase.triggerSearch.calledOnce);

            oFilterField.detachSubmit(fCallback);
            this.oFilterBarBase.removeFilterItem(oFilterField);

            assert.ok(!oFilterField.hasListeners("submit"));

            oFilterField.destroy();
            this.oFilterBarBase.triggerSearch.restore();
        }.bind(this));

    });

    QUnit.test("check reaction to the basic search 'submit' event", function(assert){
        const oFilterField = new FilterField();
        sinon.stub(this.oFilterBarBase, "triggerSearch");

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
        let nIdx = 0;
        const oFilterField = new FilterField();

        let fTestPromiseResolve = null;
        const oTestPromise = new Promise(function(resolve) {
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

    QUnit.test("check submit with liveMode and no changes", function(assert){

		let fPromiseResolved;
		let oPromise = new Promise(function(resolve) {
			fPromiseResolved = resolve;
		});

		const oFilterField = new FilterField();
		this.oFilterBarBase.addFilterItem(oFilterField);

		this.oFilterBarBase.setLiveMode(true);

		sinon.stub(this.oFilterBarBase, "triggerSearch").returns(fPromiseResolved());
		//sinon.stub(this.oFilterBarBase, "_hasAppliancePromises").returns();


		oFilterField.fireSubmit({ promise: Promise.resolve() });

		return oPromise.then(function() {
			assert.ok(this.oFilterBarBase.triggerSearch.calledOnce);
			this.oFilterBarBase.triggerSearch.restore();

			this.oFilterBarBase.setLiveMode(false);
			oPromise = new Promise(function(resolve) {
				fPromiseResolved = resolve;
			});

			sinon.stub(this.oFilterBarBase, "triggerSearch").returns(fPromiseResolved());
			oFilterField.fireSubmit({ promise: Promise.resolve() });
			return oPromise.then(function() {
				assert.ok(this.oFilterBarBase.triggerSearch.calledOnce);
				this.oFilterBarBase.triggerSearch.reset();
			}.bind(this));
		}.bind(this));
    });

    QUnit.test("check submit with changes and liveMode=true", function(assert){
		const done = assert.async();

		let fPromiseResolved;
		const oPromise = new Promise(function(resolve) {
			fPromiseResolved = resolve;
		});

		const oFilterField = new FilterField();
		this.oFilterBarBase.addFilterItem(oFilterField);

		this.oFilterBarBase.setLiveMode(true);

		sinon.stub(this.oFilterBarBase, '_hasAppliancePromises').callsFake(function fakeFn() {
			fPromiseResolved();
			return [Promise.resolve()];
		});

		oFilterField.fireSubmit({ promise: Promise.resolve() });
		oPromise.then(function() {
			assert.ok(!this.oFilterBarBase.triggerSearch.calledOnce);
			done();
		}.bind(this));
    });

    QUnit.test("check submit with changes and liveMode=false", function(assert){
		const done = assert.async();

		let fPromiseResolved;
		const oPromise = new Promise(function(resolve) {
			fPromiseResolved = resolve;
		});

		const oFilterField = new FilterField();
		this.oFilterBarBase.addFilterItem(oFilterField);

		this.oFilterBarBase.setLiveMode(false);

		sinon.stub(this.oFilterBarBase, '_hasAppliancePromises').callsFake(function fakeFn() {
			return [Promise.resolve()];
		});

		sinon.stub(this.oFilterBarBase, "triggerSearch").callsFake(function fakeFn() {
			fPromiseResolved();
		});
		oFilterField.fireSubmit({ promise: Promise.resolve() });
		oPromise.then(function() {
			assert.ok(this.oFilterBarBase.triggerSearch.calledOnce);
			done();
		}.bind(this));
    });

    QUnit.test("Check 'valid' promise - do not provide parameter", function(assert){
        const oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        const oValid = this.oFilterBarBase.validate();

        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 1, "Search executed by default");
        });
    });

    QUnit.test("Check 'valid' promise - explicitly fire search", function(assert){
        const oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        const oValid = this.oFilterBarBase.triggerSearch();

        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 1, "Search executed");
        });
    });

    QUnit.test("Check 'valid' promise - do not fire search", function(assert){
        const oSearchSpy = sinon.spy(this.oFilterBarBase, "fireSearch");

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        const oValid = this.oFilterBarBase.validate(true);
        return oValid.then(function(){
            assert.ok(true, "Valid Promise resolved");
            assert.equal(oSearchSpy.callCount, 0, "No Search executed");
        });
    });

    QUnit.test("Check cleanup for search promise", function(assert){

        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());

        const oValidPromise = this.oFilterBarBase.validate();

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
        let oValidPromise = this.oFilterBarBase.validate();

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

        const done = assert.async();

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

        let fnTriggerPromiseResolve = null;
        const oTriggerPromise = new Promise(function(resolve, reject) { fnTriggerPromiseResolve = resolve; });

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

        let fnSubmitPromiseResolve = null;
        const fCallBack = function() {
            setTimeout(fnSubmitPromiseResolve, 100);
        };

        let oSubmitPromise = new Promise(function(resolve, reject) { fnSubmitPromiseResolve = resolve; });
        let oEvent = {
            getParameter: function() { fCallBack(); return Promise.resolve(); }
        };

        const done = assert.async();

        this.oFilterBarBase._handleFilterItemSubmit(oEvent);
        oSubmitPromise.then(function() {

            assert.ok(this.oFilterBarBase.triggerSearch.calledOnce, "should be called once");

            let fnChangePromiseResolve = null;
            const oChangePromise = new Promise(function(resolve, reject) { fnChangePromiseResolve = resolve; });
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
        const done = assert.async();

        let fnSubmitPromiseResolve = null;
        const oSubmitPromise = new Promise(function(resolve, reject) { fnSubmitPromiseResolve = resolve; });
        const oEvent = {
            getParameter: function() { fnSubmitPromiseResolve(); return oSubmitPromise; }
        };

        let fnFlexPromiseResolve = null;
        const oFlexPromise = new Promise(function(resolve, reject) { fnFlexPromiseResolve = resolve; });
        sinon.stub(this.oFilterBarBase, "_getWaitForChangesPromise").returns(oFlexPromise);

        sinon.stub(this.oFilterBarBase, "_applyInitialFilterConditions").callsFake(function() {
            this.oFilterBarBase._bInitialFiltersApplied = true;
            this.oFilterBarBase._fResolveInitialFiltersApplied();
            this.oFilterBarBase._fResolveInitialFiltersApplied = null;
        }.bind(this));

        let nStep = 0;
        const fSearch = function(oEvent) {
            assert.equal(++nStep, 2);
            done();
        };
        const fFiltersChanged = function(oEvent) {
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

        const done = assert.async();

        sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String")});

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

		const oReportSpy = sinon.spy(this.oFilterBarBase, "_reportModelChange");

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

		const done = assert.async();

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
        sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String")});

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

	QUnit.test("Check _setXConditions applies a fine granular delta (Remove a condition)", function(assert){

		const done = assert.async();

		//mock the missing typeConfig information
		sinon.stub(this.oFilterBarBase, "_getPropertyByName").callsFake(function(sKey){
			return {
				name: sKey,
				typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String")
			};
		});

		//set initial conditions
		this.oFilterBarBase.setFilterConditions({
			key2: [
				{operator: "EQ", values: ["Test"]}
			],
			key1: [
				{operator: "EQ", values: ["Test"]}
			]
		});

		return this.oFilterBarBase.initialized().then(function () {

			//check that only the necessary operations will be executed
			const oCMRemoveAllSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "removeAllConditions");
			const oCMRemoveSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "removeCondition");
			const oCMAddSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "addCondition");

			//clear the current condition
			this.oFilterBarBase._setXConditions({
				key1: [],
				key2: [
					{operator: "EQ", values: ["Test"]}
				]
			})
			.then(function(){

				//Only one condition has been removed, we expect no clear or no add to be executed --> only one remove
				assert.equal(oCMRemoveAllSpy.callCount, 0, "CM has not been cleared");
				assert.equal(oCMRemoveSpy.callCount, 1, "Remove has not been called once");
				assert.equal(oCMAddSpy.callCount, 0, "Add has not been called");

				this.oFilterBarBase._getConditionModel().removeAllConditions.restore();
				this.oFilterBarBase._getConditionModel().removeCondition.restore();
				this.oFilterBarBase._getConditionModel().addCondition.restore();
				done();
			}.bind(this));

		}.bind(this));

	});

	QUnit.test("Check _setXConditions applies a fine granular delta (Add a condition)", function(assert){

		const done = assert.async();

		//mock the missing typeConfig information
		sinon.stub(this.oFilterBarBase, "_getPropertyByName").callsFake(function(sKey){
			return {
				name: sKey,
				typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String")
			};
		});

		//set initial conditions
		this.oFilterBarBase.setFilterConditions(this.oFilterBarBase._setXConditions({
			key2: [{operator: "EQ", values: ["Test"]}]
		}));

		return this.oFilterBarBase.initialized().then(function () {

			//check that only the necessary operations will be executed
			const oCMRemoveAllSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "removeAllConditions");
			const oCMRemoveSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "removeCondition");
			const oCMAddSpy = sinon.spy(this.oFilterBarBase._getConditionModel(), "addCondition");

			//clear the current condition
			this.oFilterBarBase._setXConditions({
				key1: [{operator: "EQ", values: ["Test"]}]
			})
			.then(function(){

				//Only one condition has been removed, we expect no clear or no add to be executed --> only one remove
				assert.equal(oCMRemoveAllSpy.callCount, 0, "CM has not been cleared");
				assert.equal(oCMRemoveSpy.callCount, 0, "Remove has not been called once");
				assert.equal(oCMAddSpy.callCount, 1, "Add has not been called");

				this.oFilterBarBase._getConditionModel().removeAllConditions.restore();
				this.oFilterBarBase._getConditionModel().removeCondition.restore();
				this.oFilterBarBase._getConditionModel().addCondition.restore();
				done();
			}.bind(this));

		}.bind(this));

	});

    QUnit.test("Check cleanUpAllFilterFieldsInErrorState", function(assert){

		const oFilterField = new FilterField("key1", {
			label: "key1",
			conditions: "{$filters>/conditions/key1}",
			propertyKey: "key1",
			dataTypeConstraints: { maxLength: 2},
			dataType: "sap.ui.model.type.String",
			required: false
		});

		oFilterField.setValueState("Error");
		this.oFilterBarBase.addFilterItem(oFilterField);

		assert.equal(oFilterField.getValueState(), "Error");
		this.oFilterBarBase.cleanUpAllFilterFieldsInErrorState();

		assert.equal(oFilterField.getValueState(), "None");
    });

    QUnit.test("Check required missing handling on filter changes", function(assert){

        const done = assert.async();

		const oStub = sinon.stub(this.oFilterBarBase, "_getPropertyByName");
		oStub.withArgs("key1").returns({name: "key1", required: true, typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String"), constraints: {maxLength: 4}});
		oStub.withArgs("key2").returns({name: "key2", required: true, typeConfig: DefaultTypeMap.getTypeConfig("sap.ui.model.type.String")});

		sinon.stub(this.oFilterBarBase, "_getRequiredPropertyNames").returns(["key1", "key2"]);

		const oFilterField1 = new FilterField("key1", {
			label: "key1",
			conditions: "{$filters>/conditions/key1}",
			propertyKey: "key1",
			dataType: "sap.ui.model.type.String",
			required: true
		});
        this.oFilterBarBase.addFilterItem(oFilterField1);

		const oFilterField2 = new FilterField("key2", {
			label: "key2",
			conditions: "{$filters>/conditions/key2}",
			propertyKey: "key2",
			dataType: "sap.ui.model.type.String",
			required: true
		});
        this.oFilterBarBase.addFilterItem(oFilterField2);


        this.oFilterBarBase.checkFilters();
        assert.equal(oFilterField1.getValueState(), "Error");
        assert.equal(oFilterField2.getValueState(), "Error");


		this.oFilterBarBase.initialized().then(function () {
            // --> this would happen during runtime through a change
            this.oFilterBarBase.setFilterConditions({
                "key1": [
                    {
                    "operator": "EQ",
                    "values": [
                        "test"
                    ]
                    }
                ]
            });

            //trigger the handling after changes have been applied
            this.oFilterBarBase._onModifications().then(function() {
                assert.equal(oFilterField1.getValueState(), "None");
                assert.equal(oFilterField2.getValueState(), "Error");
                assert.equal(oFilterField2.getValueStateText(), this.oFilterBarBase._getRequiredFilterFieldValueText(oFilterField2));


                //Check required field in error state
                oFilterField1.setValueState("Error");
                oFilterField1.setValueStateText("Some Error Text");
                this.oFilterBarBase.setFilterConditions({
                    "key1": [
                        {
                        "operator": "EQ",
                        "values": [
                           "too long"
                        ],
                        "validated": "Validated"
                        }
                    ]
                });
                this.oFilterBarBase._onModifications().then(function() {
                    assert.equal(oFilterField1.getValueState(), "Error");
                    assert.equal(oFilterField1.getValueStateText(), "Some Error Text");
                    assert.equal(oFilterField2.getValueState(), "Error");
                    assert.equal(oFilterField2.getValueStateText(), this.oFilterBarBase._getRequiredFilterFieldValueText(oFilterField2));
                    done();
                }.bind(this));
            }.bind(this));
        }.bind(this));

    });

    QUnit.test("check reason information", function(assert){

        const done = assert.async(3);

        let fnSubmittedResolve = null;
        const oSubmittedPromise = new Promise(function(resolve) {
            fnSubmittedResolve = resolve;
        });

        let fnGoResolve = null;
        const oGoPromise = new Promise(function(resolve) {
            fnGoResolve = resolve;
        });

        let nCall = 0;
        this.oFilterBarBase.attachSearch(function(oEvent) {

            const sReason = oEvent.getParameter("reason");
            ++nCall;

            if (nCall === 1) {
                assert.equal("Enter", sReason, "expected reason 'Enter'");
                fnSubmittedResolve();
            } else if (nCall === 2) {
                assert.equal("Go", sReason, "expected reason 'Go'");
                fnGoResolve();
            } else if (nCall === 3) {
                assert.equal("Variant", sReason, "expected reason 'Variant'");
            }

            done();
        });

        //SUBMIT
        const oFilterField = new FilterField();
        this.oFilterBarBase.setBasicSearchField(oFilterField);
        oFilterField.fireSubmit({promise: Promise.resolve()});
		sap.ui.getCore().applyChanges();

        //GO
		oSubmittedPromise.then(function() {
	        this.oFilterBarBase.onSearch();
			sap.ui.getCore().applyChanges();
		}.bind(this));


        //VARIANT
		oGoPromise.then(function() {
        sinon.stub(this.oFilterBarBase, "_getExecuteOnSelectionOnVariant").returns( true );
        this.oFilterBarBase._handleVariantSwitch({});
		}.bind(this));

    });


    QUnit.test("Check the new 'validationState' handling ", function(assert){
        const done = assert.async();

        const oDelegate = {
            determineValidationState: function(oControl) {
                assert.equal(oControl, this.oFilterBarBase);
                return 44;
            }.bind(this),
            visualizeValidationState: function(oControl, mMap) {
                assert.equal(mMap.status, 44);
                done();
            }
        };

        sinon.stub(this.oFilterBarBase, "_hasRetrieveMetadataToBeCalled").returns(false);
        sinon.stub(this.oFilterBarBase, "waitForInitialization").returns(Promise.resolve());
        sinon.stub(this.oFilterBarBase, "awaitControlDelegate").returns(Promise.resolve(oDelegate));
        this.oFilterBarBase._oDelegate = oDelegate;

        this.oFilterBarBase.validate(true);
    });

	QUnit.test("check variantSwitch for non filterbar & for filterbar", function(assert) {

		const aAffectedControls = ["Item"];

		sinon.stub(this.oFilterBarBase, "awaitPendingModification").returns(Promise.resolve(aAffectedControls));
		sinon.stub(this.oFilterBarBase, "_getExecuteOnSelectionOnVariant").returns(true);
		sinon.stub(this.oFilterBarBase, "_reportModelChange");

		this.oFilterBarBase._bInitialFiltersApplied = true;

		return this.oFilterBarBase._handleVariantSwitch({}).then(function() {
			assert.ok(this.oFilterBarBase._reportModelChange.called);
			this.oFilterBarBase._reportModelChange.reset();
			aAffectedControls.push("Filter");
			return this.oFilterBarBase._handleVariantSwitch({}).then(function() {
				assert.ok(!this.oFilterBarBase._reportModelChange.called);
			}.bind(this));

		}.bind(this));

	});

    QUnit.test("_setXConditions with unknown properties", function(assert){
        const done = assert.async();

        const mDummyCondition = {
            "key1": [
                {
                  "operator": "EQ",
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": "Validated"
                }
              ],
             "unknown": [                {
                  "operator": "EQ",
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": "Validated"
                }]
        };
        const mResultCondition = {
            "key1": [
                {
				  "isEmpty": false,
                  "operator": "EQ",
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": "Validated"
                }
              ]
        };


        this.oFilterBarBase.initialized().then(function(){

            sinon.stub(this.oFilterBarBase, "_getPropertyByName").callsFake(function(sPropertyName){
				if (sPropertyName === "key1") {
					return {name: "key1", typeConfig: this.oFilterBarBase.getTypeMap().getTypeConfig("sap.ui.model.type.String")};
				} else {
					return null;
				}
			}.bind(this));

			sinon.spy(Log, "error");
			assert.ok(!Log.error.called);

            this.oFilterBarBase._setXConditions(mDummyCondition)
            .then(function(){
                assert.deepEqual(mResultCondition, this.oFilterBarBase.getInternalConditions(), "Condition returned without persistence active");
				assert.ok(Log.error.calledOnce);
				Log.error.restore();

                done();
            }.bind(this));
        }.bind(this));

    });

});