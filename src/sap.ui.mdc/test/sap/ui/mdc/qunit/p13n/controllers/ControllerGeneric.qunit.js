/* global QUnit*/
sap.ui.define([
	"sap/ui/mdc/Control",
	"sap/ui/mdc/p13n/subcontroller/BaseController",
	"sap/ui/mdc/util/PropertyHelper",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/Chart",
	"sap/ui/mdc/enums/OperatorName"
], function (Control, Controller, PropertyHelper, Table, Chart, OperatorName) {
	"use strict";

	QUnit.module("Generic API tests", {
		prepareController: function() {
			const oURLParams = new URLSearchParams(window.location.search);
			const sSubControllerClassPath = "sap/ui/mdc/p13n/subcontroller/" + oURLParams.getAll("test")[0];

			const TestClass = Control.extend("temp",{
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
					groupLevels: [
						{name: "test"}
					],
					filter: {
						test: [
							{
								operator: OperatorName.EQ,
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
		const bIsMDCControl = this.oController.getAdaptationControl().isA("sap.ui.mdc.Control");
		const bIsMDCElement = this.oController.getAdaptationControl().isA("sap.ui.mdc.Element");
		assert.ok(bIsMDCControl || bIsMDCElement, "Adaptation is only allowed for MDC instances");
	});

	QUnit.test("check 'getAdaptationUI' return value", function(assert){

		const vAdaptationUI = this.oController.getAdaptationUI(new PropertyHelper(this.aPropertyInfo));

		assert.ok(vAdaptationUI, "'getAdaptationControl' has a return value");
		assert.ok(vAdaptationUI instanceof Promise, "'getAdaptationControl' returns a Promise");

	});

	QUnit.test("check 'getLiveMode' ", function(assert){
		const bLiveMode = this.oController.getLiveMode();
		assert.ok(typeof bLiveMode == "boolean", "'getLiveMode' returns a Boolean");
	});

	QUnit.test("check 'getResetEnabled' ", function(assert){
		const bResetEnabled = this.oController.getResetEnabled();
		assert.ok(typeof bResetEnabled == "boolean", "'getResetEnabled' returns a Boolean");
	});

	QUnit.test("check 'getBeforeApply' ", function(assert){
		const pBeforeApply = this.oController.getBeforeApply();
		assert.ok(pBeforeApply instanceof Promise, "'getBeforeApply' returns a Promise");
	});

	QUnit.test("check 'getCurrentState'", function(assert){
		//Can not be generically tested, as it depends on the subcontrollers delta logic
		//--> Tested in FlexUtil.qunit
		assert.ok(this.oController.getCurrentState(), "'getCurrentState' returns a value");
	});

	QUnit.test("check 'getDelta'", function(assert){

		const aChanges = this.oController.getDelta({
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

		const aChanges = this.oController.getDelta({
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

	QUnit.test("check 'mixInfoAndState'", function(assert){
		const oP13nData = this.oController.mixInfoAndState(new PropertyHelper(this.aPropertyInfo));
		assert.ok(oP13nData, "'setP13nData' returns a value");
	});

	QUnit.test("check '_getP13nModel'", function(assert){
		const oAdaptationModel = this.oController._getP13nModel(new PropertyHelper(this.aPropertyInfo));
		assert.ok(oAdaptationModel.isA("sap.ui.model.json.JSONModel"), "'getP13nModel' returns a JSONModel");
	});

	QUnit.test("check 'getChangeOperations'", function(assert){

		const mChangeOperations = this.oController.getChangeOperations();

		//This might be a valid assumption in the current setup, but can be changed
		assert.ok(mChangeOperations.hasOwnProperty("add"), "Required changetype provided");
		assert.ok(mChangeOperations.hasOwnProperty("remove"), "Required changetype provided");
		assert.ok(Object.keys(mChangeOperations).length <= 3, "Only allowed changetypes are provided");
	});

	QUnit.test("check 'model2State'", function(assert){

		const fnValidateP13n = this.oController.model2State;

		if (fnValidateP13n) {
			assert.ok(fnValidateP13n instanceof Function, "Model2State implemented");
		} else {
			assert.strictEqual(fnValidateP13n, false, "The Subcontroller does not implement a validation.");
		}

	});
});
