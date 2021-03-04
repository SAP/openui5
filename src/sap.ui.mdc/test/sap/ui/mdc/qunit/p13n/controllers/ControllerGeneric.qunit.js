/* global QUnit*/
sap.ui.define([
	"sap/ui/mdc/Control",
	"sap/ui/mdc/p13n/subcontroller/BaseController",
	"sap/ui/mdc/util/PropertyHelper",
	"sap/base/util/UriParameters"
], function (Control, Controller, PropertyHelper, SAPUriParameters) {
	"use strict";

	QUnit.module("Generic API tests", {
		prepareController: function() {
			var oURLParams = new SAPUriParameters(window.location.search);
			var sSubControllerClassPath = "sap/ui/mdc/p13n/subcontroller/" + oURLParams.getAll("test")[0];

			var TestClass = Control.extend("temp",{
				metadata: {
					properties: {
						delegate: {
							type: "object",
							defaultValue: {
								name: "sap/ui/mdc/AggregationBaseDelegate"
							}
						}
					},
					interfaces: [
						"sap.ui.mdc.IFilterSource",
						"sap.ui.mdc.IxState"
					]
				}
			});

			this.oAdaptationControl = new TestClass();

			this.oAdaptationControl.getFilterConditions = function() {
				return {};
			};

			this.oAdaptationControl.getCurrentState = function() {
				return {
					items: [
						{name: "test"}
					],
					sorters: [
						{name: "test"}
					],
					filter: {
						test: [
							{
								operator: "EQ",
								values: [
									"testvalue"
								]
							}
						]
					}
				};
			};

			this.aPropertyInfo = [
				{
					name: "test"
				}
			];

			return new Promise(function(resolve, reject){
				sap.ui.require([sSubControllerClassPath], function(SubController){
					resolve(new SubController(this.oAdaptationControl));
				}.bind(this));
			}.bind(this));

		},
		beforeEach: function(){
			return this.prepareController()
			.then(function(oController){
				this.oController = oController;
			}.bind(this))
			.then(function(){
				this.oAdaptationControl.initControlDelegate();
			}.bind(this));
		},
		afterEach: function(){
			this.oAdaptationControl.destroy();
			this.oController.destroy();
		}
	});

	QUnit.test("Instantiate SubController", function(assert){
		assert.ok(this.oController, "SubController has been successfully instantiated");
	});

	QUnit.test("Check 'getAdaptationControl'", function(assert){
		var bIsMDCControl = this.oController.getAdaptationControl().isA("sap.ui.mdc.Control");
		var bIsMDCElement = this.oController.getAdaptationControl().isA("sap.ui.mdc.Element");
		assert.ok(bIsMDCControl || bIsMDCElement, "Adaptation is only allowed for MDC instances");
	});

	QUnit.test("check 'getAdaptationUI' return value", function(assert){

		var done = assert.async();
		var vAdaptationUI = this.oController.getAdaptationUI();

		assert.ok(vAdaptationUI, "'getAdaptationControl' has a return value");

		if (typeof vAdaptationUI == "string" ) {
			sap.ui.require([vAdaptationUI], function(Class){
				var oTest = new Class();
				assert.ok(oTest.isA("sap.ui.mdc.p13n.panels.BasePanel", "A BasePanel derivation has been provided as UI"));
				done();
			});
		}else if (vAdaptationUI instanceof Promise){
			vAdaptationUI.then(function(oP13nUI){
				assert.ok(oP13nUI.isA("sap.ui.core.Control"), "A custom control has been provided as UI in a Promise");
				done();
			});
		} else if (vAdaptationUI instanceof Function){
			var oP13nUI = vAdaptationUI();
			assert.ok(oP13nUI.isA("sap.ui.core.Control"), "A custom control has been provided as UI in a Callback");
		} else {
			assert.ok(false, "Please provide either a 1)String 2)Promise or 3) Callback as adaptationControl");
		}

	});

	QUnit.test("check 'getLiveMode' ", function(assert){
		var bLiveMode = this.oController.getLiveMode();
		assert.ok(typeof bLiveMode == "boolean", "'getLiveMode' returns a Boolean");
	});

	QUnit.test("check 'getResetEnabled' ", function(assert){
		var bResetEnabled = this.oController.getResetEnabled();
		assert.ok(typeof bResetEnabled == "boolean", "'getResetEnabled' returns a Boolean");
	});

	QUnit.test("check 'initializeUI' ", function(assert){
		var pInitializeUI = this.oController.initializeUI();
		assert.ok(pInitializeUI instanceof Promise, "'initializeUI' returns a Promise");
	});

	QUnit.test("check 'getBeforeApply' ", function(assert){
		var pBeforeApply = this.oController.getBeforeApply();
		assert.ok(pBeforeApply instanceof Promise, "'getBeforeApply' returns a Promise");
	});

	QUnit.test("check 'getCurrentState'", function(assert){
		//Can not be generically tested, as it depends on the subcontrollers delta logic
		//--> Tested in FlexUtil.qunit
		assert.ok(this.oController.getCurrentState(), "'getCurrentState' returns a value");
	});

	QUnit.test("check 'getDelta'", function(assert){

		var aChanges = this.oController.getDelta({
			control: this.oAdaptationControl,
			existingState: this.oController.getCurrentState(),
			changeOperations: this.oController.getChangeOperations(),
			changedState: [],
			deltaAttributes: ["name"],
			applyAbsolute: true,
			propertyInfo: this.aPropertyInfo
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");

		//TODO: absolute appliance (?)
		//assert.equal(aChanges.length, 1, "Absolute appliance removed the state object");

	});

	QUnit.test("check 'getDelta' without absolute appliance", function(assert){

		var aChanges = this.oController.getDelta({
			control: this.oAdaptationControl,
			deltaAttributes: ["name"],
			changeOperations: this.oController.getChangeOperations(),
			existingState: this.oController.getCurrentState(),
			changedState: [],
			propertyInfo: this.aPropertyInfo
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 0, "No absolute appliance, state kept");

	});

	QUnit.test("check 'setP13nData'", function(assert){
		this.oController.setP13nData(new PropertyHelper(this.aPropertyInfo));
		assert.ok(this.oController.oP13nData, "'setP13nData' returns a value");
	});

	QUnit.test("check 'getP13nModel'", function(assert){
		this.oController.setP13nData(new PropertyHelper(this.aPropertyInfo));
		assert.ok(this.oController.getP13nModel().isA("sap.ui.model.json.JSONModel"), "'getP13nModel' returns a JSONModel");
	});

	QUnit.test("check 'getChangeOperations'", function(assert){

		var mChangeOperations = this.oController.getChangeOperations();

		//This might be a valid assumption in the current setup, but can be changed
		assert.ok(mChangeOperations.hasOwnProperty("add"), "Required changetype provided");
		assert.ok(mChangeOperations.hasOwnProperty("remove"), "Required changetype provided");
		assert.ok(Object.keys(mChangeOperations).length <= 3, "Only allowed changetypes are provided");
	});

	QUnit.test("check 'model2State'", function(assert){
		this.oController.setP13nData(new PropertyHelper(this.aPropertyInfo));
		this.oController.getP13nModel();

		var fnValidateP13n = this.oController.model2State;

		if (fnValidateP13n instanceof Function) {
			var oTheoreticalState = this.oController.model2State();
			assert.ok(oTheoreticalState, "State returned");
		} else {
			assert.strictEqual(fnValidateP13n, false, "The Subcontroller does not implement a validation.");
		}

	});

});
