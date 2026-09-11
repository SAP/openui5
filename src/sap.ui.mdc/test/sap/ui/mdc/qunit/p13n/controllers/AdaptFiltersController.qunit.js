/* global QUnit, sinon*/
sap.ui.define([
	"sap/ui/mdc/p13n/subcontroller/AdaptFiltersController",
    "sap/ui/mdc/filterbar/p13n/AdaptationFilterBar",
    "sap/ui/mdc/Control"
], function (AdaptFiltersController, AdaptationFilterBar, MDCControl) {
	"use strict";

	/**
	 * Builds an AdaptFiltersController instance with a stubbed panel and adaptation control.
	 *
	 * @param {object} mConfig
	 * @param {*} mConfig.panelData Value the panel's getP13nData returns.
	 * @param {string[]} mConfig.propertyKeys The canonical propertyKeys order.
	 * @param {object} mConfig.properties Map of property key to PropertyInfo (with isActive).
	 * @param {boolean} [mConfig.propertyKeysMode=true] Whether the control reports propertyKeys mode.
	 * @returns {sap.ui.mdc.p13n.subcontroller.AdaptFiltersController} Controller under test.
	 */
	function createController(mConfig) {
		const oControl = {
			isInPropertyKeysMode: function() {
				return mConfig.propertyKeysMode !== false;
			},
			getPropertyKeys: function() {
				return mConfig.propertyKeys;
			},
			getPropertyHelper: function() {
				return {
					getProperty: function(sKey) {
						return mConfig.properties[sKey];
					}
				};
			}
		};

		const oController = Object.create(AdaptFiltersController.prototype);
		oController.getAdaptationControl = function() {
			return oControl;
		};
		oController._oPanel = {
			getP13nData: function() {
				return mConfig.panelData;
			}
		};
		return oController;
	}

	QUnit.module("getP13nData");

	QUnit.test("Unwraps {items:[...]} panel shape and injects inactive keys", function(assert) {
		const oController = createController({
			panelData: {items: [{key: "A", name: "A"}, {key: "B", name: "B"}]},
			propertyKeys: ["I", "A", "B"],
			properties: {I: {isActive: false}, A: {isActive: true}, B: {isActive: true}}
		});

		assert.deepEqual(
			oController.getP13nData(),
			[{key: "I", name: "I"}, {key: "A", name: "A"}, {key: "B", name: "B"}],
			"Unwraps {items:[...]} then injects inactive key I at its propertyKeys position"
		);
	});

	QUnit.test("Unwraps {items:[...]} panel shape without injection when not in propertyKeys mode", function(assert) {
		const oController = createController({
			panelData: {items: [{key: "A", name: "A"}, {key: "B", name: "B"}]},
			propertyKeys: ["I", "A", "B"],
			properties: {I: {isActive: false}, A: {isActive: true}, B: {isActive: true}},
			propertyKeysMode: false
		});

		assert.deepEqual(
			oController.getP13nData(),
			[{key: "A", name: "A"}, {key: "B", name: "B"}],
			"Unwraps to plain array; no injection in aggregation mode"
		);
	});

	QUnit.module("determineValidationState",{
        beforeEach: function(){
            this.oControl = new MDCControl();
            AdaptationFilterBar.prototype._checkAdvancedParent = sinon.stub().returns(true);
            AdaptationFilterBar.prototype.isControlDelegateInitialized = sinon.stub().returns(true);
            AdaptationFilterBar.prototype.getControlDelegate = sinon.stub().returns({});
			this.oAdaptationFilterBar = new AdaptationFilterBar({
                adaptationControl: this.oControl
            });
		},
		afterEach: function(){
			this.oControl.destroy();
			this.oAdaptationFilterBar.destroy();
		}
    });

    QUnit.test("initAdaptationUI calls determineValidationState", function(assert){
        const done = assert.async();

        // arrange
        const oDetermineValidationStateSpy = sinon.spy();

        const oMockDelegate = {
            determineValidationState: oDetermineValidationStateSpy
        };

        this.oAdaptationFilterBar.setP13nData = sinon.stub();
        this.oAdaptationFilterBar.setLiveMode = sinon.stub();
        this.oAdaptationFilterBar.setProperty = sinon.stub();
        this.oAdaptationFilterBar.getTitle = sinon.stub();
        this.oAdaptationFilterBar.createFilterFields = sinon.stub().returns(Promise.resolve());
        this.oAdaptationFilterBar.awaitControlDelegate = sinon.stub().returns(Promise.resolve(oMockDelegate));

        const oMockAdaptationControl = {
            retrieveInbuiltFilter: sinon.stub().returns(Promise.resolve(this.oAdaptationFilterBar))
        };

        const oController = new AdaptFiltersController({
            control: oMockAdaptationControl
        });
        sinon.stub(oController, "getAdaptationControl").returns(oMockAdaptationControl);
        sinon.stub(oController, "mixInfoAndState").returns({ items: [] });

        const oMockPropertyHelper = {};

        // act
        oController.initAdaptationUI(oMockPropertyHelper).then(() => {
            // assert
            assert.ok(oDetermineValidationStateSpy.calledOnce, "determineValidationState was called");
            assert.ok(oDetermineValidationStateSpy.calledWith(this.oAdaptationFilterBar), "determineValidationState was called with the adaptation filter bar");

            // Clean up
            oController.destroy();
            done();
        }).catch((error) => {
            assert.ok(false, "initAdaptationUI should not fail: " + error.message);
            oController.destroy();
            done();
        });
    });

    QUnit.test("initAdaptationUI calls determineValidationState with getFilterDelegate", function(assert){
        const done = assert.async();

        // arrange
        const oDetermineValidationStateSpy = sinon.spy();

        const oMockFilterDelegate = {
            determineValidationState: oDetermineValidationStateSpy
        };

        const oGetFilterDelegateSpy = sinon.stub().returns(oMockFilterDelegate);

        const oMockDelegate = {
            getFilterDelegate: oGetFilterDelegateSpy
        };

        this.oAdaptationFilterBar.setP13nData = sinon.stub();
        this.oAdaptationFilterBar.setLiveMode = sinon.stub();
        this.oAdaptationFilterBar.setProperty = sinon.stub();
        this.oAdaptationFilterBar.getTitle = sinon.stub();
        this.oAdaptationFilterBar.createFilterFields = sinon.stub().returns(Promise.resolve());
        this.oAdaptationFilterBar.awaitControlDelegate = sinon.stub().returns(Promise.resolve(oMockDelegate));

        const oMockAdaptationControl = {
            retrieveInbuiltFilter: sinon.stub().returns(Promise.resolve(this.oAdaptationFilterBar))
        };

        const oController = new AdaptFiltersController({
            control: oMockAdaptationControl
        });
        sinon.stub(oController, "getAdaptationControl").returns(oMockAdaptationControl);
        sinon.stub(oController, "mixInfoAndState").returns({ items: [] });

        const oMockPropertyHelper = {};

        // act
        oController.initAdaptationUI(oMockPropertyHelper).then(() => {
            // assert
            assert.ok(oDetermineValidationStateSpy.calledOnce, "determineValidationState was called on the filter delegate");
            assert.ok(oDetermineValidationStateSpy.calledWith(this.oAdaptationFilterBar), "determineValidationState was called with the adaptation filter bar");

            // Clean up
            oController.destroy();
            done();
        }).catch((error) => {
            assert.ok(false, "initAdaptationUI should not fail: " + error.message);
            oController.destroy();
            done();
        });
    });

});
