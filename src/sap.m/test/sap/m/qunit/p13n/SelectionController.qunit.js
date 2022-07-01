/* global QUnit*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/p13n/SelectionController",
	"sap/m/p13n/MetadataHelper",
	"sap/m/p13n/modules/xConfigAPI"
], function (Control, SelectionController, MetadataHelper, xConfigAPI) {
	"use strict";

	QUnit.module("Generic API tests", {
		initHelper: function() {

			var oHelper = new MetadataHelper([
				{key: "fieldA", label: "Field A"},
				{key: "fieldB", label: "Field B"},
				{key: "fieldC", label: "Field C"}
			]);

			return oHelper;
		},
        beforeEach: function() {
			this.oTestControl = new Control();
			this.oSelectionController = new SelectionController({
				control: new Control(),
				targetAggregation: "dependents"
			});
        },
        afterEach: function() {
			this.oTestControl.destroy();
			this.oTestControl = null;
			this.oSelectionController.destroy();
			this.oSelectionController = null;
		}
	});

	QUnit.test("Instantiate", function(assert){

		var oSelectionController;

		assert.throws(function () {
			oSelectionController = new SelectionController();
		}, function(oError) {
			return oError instanceof Error;
		},  "Controller can not be instanciated without a control configuration");


		oSelectionController = new SelectionController({
			control: new Control()
		});

		assert.ok(oSelectionController, "SelectionController is instanciable when a control instance has been provided");
	});

	QUnit.test("Check 'targetAggregation' constructor config", function(assert){
		var oSelectionController = new SelectionController({
			control: new Control("TestControl"),
			targetAggregation: "items"
		});

		assert.equal(oSelectionController.getAdaptationControl().getId(), "TestControl", "AdaptationControl provided");
		assert.equal(oSelectionController.getTargetAggregation(), "items", "Targetaggregation provided");
	});

	QUnit.test("Check 'initAdaptationUI' ", function(assert){

		var oHelper = this.initHelper();

		return this.oSelectionController.initAdaptationUI(oHelper)
		.then(function(oSelectionPanel) {
			assert.ok(oSelectionPanel.isA("sap.m.p13n.SelectionPanel"), "The SelectionController creates a SelectionPanel as UI");
			assert.ok(oSelectionPanel.getEnableReorder(), "Reordering is enabled per default");
		});

	});

	QUnit.test("Check 'initAdaptationUI' - reordering disabled", function(assert){

		var oHelper = this.initHelper();
		var oSelectionController = new SelectionController({
			control: new Control(),
			targetAggregation: "items",
			enableReorder: false
		});

		return oSelectionController.initAdaptationUI(oHelper)
		.then(function(oSelectionPanel) {
			assert.ok(oSelectionPanel.isA("sap.m.p13n.SelectionPanel"), "The SelectionController creates a SelectionPanel as UI");
			assert.notOk(oSelectionPanel.getEnableReorder(), "Reordering is disabled");
		});

	});

	QUnit.test("Check 'getCurrentState' --> it should reflect the aggregation", function(assert){

		//Start and check empty
		var aCurrentState = this.oSelectionController.getCurrentState();
		assert.deepEqual(aCurrentState, [], "The control does currently not have any aggregation state");

		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		//Add three items and assert
		var oField1 = new Control("fieldA");
		var oField2 = new Control("fieldB");
		var oField3 = new Control("fieldC");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);
		oAdaptationControl.addDependent(oField3);

		var aState = [
			{key: "fieldA"},
			{key: "fieldB"},
			{key: "fieldC"}
		];

		var aAddState = this.oSelectionController.getCurrentState();
		assert.deepEqual(aAddState, aState, "The control state has changed");

		//Remove one item and assert again
		oAdaptationControl.removeDependent(2);
		aState = [
			{key: "fieldA"},
			{key: "fieldB"}
		];
		var aRemoveState = this.oSelectionController.getCurrentState();
		assert.deepEqual(aRemoveState, aState, "The control state has changed");

		oField1.destroy();
		oField2.destroy();
		oField3.destroy();
	});

	QUnit.test("Check 'getCurrentState' --> it should reflect the aggregation and merge it with xConfig if provided", function(assert){

		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		//Add three items
		var oField1 = new Control("fieldA");
		var oField2 = new Control("fieldB");
		var oField3 = new Control("fieldC");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);
		oAdaptationControl.addDependent(oField3);

		//Set one to invsibile via xConfig
		return xConfigAPI.enhanceConfig(oAdaptationControl, {
			key: "fieldA",
			property: "visible",
			controlMeta: {
				aggregation: "dependents"
			},
			value: {
				value: false
			}
		})
		.then(function(){
			var aState = [
				{key: "fieldB"},
				{key: "fieldC"}
			];

			var aCurrentState = this.oSelectionController.getCurrentState();
			assert.deepEqual(aCurrentState, aState, "The control state has been merged with xConfig");
			oField1.destroy();
			oField2.destroy();
			oField3.destroy();
		}.bind(this));

	});

	QUnit.test("check 'getDelta' without absolute appliance", function(assert){

		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var oField1 = new Control("fieldA");
		var oField2 = new Control("fieldB");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);

		var aChanges = this.oSelectionController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oSelectionController.getChangeOperations(),
			existingState: this.oSelectionController.getCurrentState(),
			changedState: [],
			propertyInfo: this.initHelper().getProperties()
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 0, "No absolute appliance, state kept");

		oField1.destroy();
		oField2.destroy();

	});


	QUnit.test("check 'getDelta' but with absolute appliance", function(assert){

		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var oField1 = new Control("fieldA");
		var oField2 = new Control("fieldB");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);

		var aChanges = this.oSelectionController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oSelectionController.getChangeOperations(),
			existingState: this.oSelectionController.getCurrentState(),
			changedState: [],
			propertyInfo: this.initHelper().getProperties(),
			applyAbsolute: true
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 2, "Absolute appliance --> state will be removed implicitly");

		assert.equal(aChanges[0]["changeSpecificData"].changeType, "removeItem", "Remove change created");
		assert.equal(aChanges[0]["changeSpecificData"].content.key, "fieldA", "Remove change created with correct key");

		assert.equal(aChanges[1]["changeSpecificData"].changeType, "removeItem", "Remove change created");
		assert.equal(aChanges[1]["changeSpecificData"].content.key, "fieldB", "Remove change created with correct key");

		oField1.destroy();
		oField2.destroy();

	});
});