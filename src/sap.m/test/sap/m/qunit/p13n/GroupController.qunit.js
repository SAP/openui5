/* global QUnit*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/p13n/GroupController",
	"sap/m/p13n/MetadataHelper",
	"sap/m/p13n/modules/xConfigAPI",
	"sap/m/p13n/enums/ProcessingStrategy"
], function (Control, GroupController, MetadataHelper, xConfigAPI, ProcessingStrategy) {
	"use strict";

	QUnit.module("Generic API tests", {
		initHelper: function() {
			const oHelper = new MetadataHelper([
				{key: "fieldA", label: "Field A"},
				{key: "fieldB", label: "Field B"},
				{key: "fieldC", label: "Field C", groupable: false}
			]);

			return oHelper;
		},
		beforeEach: function() {
			this.oTestControl = new Control();
			this.oGroupController = new GroupController({
				control: new Control()
			});
		},
		afterEach: function() {
			this.oTestControl.destroy();
			this.oTestControl = null;
			this.oGroupController.destroy();
			this.oGroupController = null;
		}
	});

	QUnit.test("Instantiate", function(assert){

		let oGroupController;

		assert.throws(function () {
			oGroupController = new GroupController();
		}, function(oError) {
			return oError instanceof Error;
		},  "Controller can not be instanciated without a control configuration");


		oGroupController = new GroupController({
			control: new Control()
		});

		assert.ok(oGroupController, "GroupController is instanciable when a control instance has been provided");
	});

	QUnit.test("check 'getDelta' (add a new grouper)", function(assert){

		var oAdaptationControl = this.oGroupController.getAdaptationControl();

		var aChanges = this.oGroupController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oGroupController.getChangeOperations(),
			existingState: this.oGroupController.getCurrentState(),
			changedState: [{key: "fieldA", descending: true}],
			propertyInfo: this.initHelper().getProperties(),
			applyAbsolute: true
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 1, "One grouper has been added");

		assert.equal(aChanges[0]["changeSpecificData"].changeType, "addGroup", "Add change created");
		assert.equal(aChanges[0]["changeSpecificData"].content.key, "fieldA", "Add change created with correct key");

	});

	QUnit.test("check 'getDelta' (apply same state --> no change)", function(assert){

		var oAdaptationControl = this.oGroupController.getAdaptationControl();

		var aChanges = this.oGroupController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oGroupController.getChangeOperations(),
			existingState: [{key: "fieldA"}],
			changedState: [{key: "fieldA"}],
			propertyInfo: this.initHelper().getProperties(),
			applyAbsolute: true
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 0, "No grouper has been added");

	});

	QUnit.test("check 'getDelta' (move position)", function(assert){

		var oAdaptationControl = this.oGroupController.getAdaptationControl();

		var aChanges = this.oGroupController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oGroupController.getChangeOperations(),
			existingState: [{key: "fieldA"}, {key: "fieldB"}],
			changedState: [{key: "fieldB"}, {key: "fieldA"}],
			propertyInfo: this.initHelper().getProperties(),
			applyAbsolute: true
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 1, "One grouping has been moved");

		assert.equal(aChanges[0]["changeSpecificData"].changeType, "moveGroup", "Move change created");

	});

	QUnit.test("check 'getDelta' (remove grouper)", function(assert){

		var oAdaptationControl = this.oGroupController.getAdaptationControl();

		var aChanges = this.oGroupController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oGroupController.getChangeOperations(),
			existingState: [{key: "fieldA"}],
			changedState: [],
			propertyInfo: this.initHelper().getProperties(),
			applyAbsolute: true
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 1, "One grouper has been removed");

		assert.equal(aChanges[0]["changeSpecificData"].changeType, "removeGroup", "Remove change created");
		assert.equal(aChanges[0]["changeSpecificData"].content.key, "fieldA", "Remove change created with correct key");

	});

});