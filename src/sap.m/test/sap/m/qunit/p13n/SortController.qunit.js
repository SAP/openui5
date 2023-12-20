/* global QUnit*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/p13n/SortController",
	"sap/m/p13n/MetadataHelper",
	"sap/m/p13n/modules/xConfigAPI",
	"sap/m/p13n/enums/ProcessingStrategy"
], function (Control, SortController, MetadataHelper, xConfigAPI, ProcessingStrategy) {
	"use strict";

	QUnit.module("Generic API tests", {
		initHelper: function() {
			const oHelper = new MetadataHelper([
				{key: "fieldA", label: "Field A"},
				{key: "fieldB", label: "Field B"},
				{key: "fieldC", label: "Field C", sortable: false}
			]);

			return oHelper;
		},
		beforeEach: function() {
			this.oTestControl = new Control();
			this.oSortController = new SortController({
				control: new Control()
			});
		},
		afterEach: function() {
			this.oTestControl.destroy();
			this.oTestControl = null;
			this.oSortController.destroy();
			this.oSortController = null;
		}
	});

	QUnit.test("Instantiate", function(assert){

		let oSortController;

		assert.throws(function () {
			oSortController = new SortController();
		}, function(oError) {
			return oError instanceof Error;
		},  "Controller can not be instanciated without a control configuration");


		oSortController = new SortController({
			control: new Control()
		});

		assert.ok(oSortController, "SortController is instanciable when a control instance has been provided");
	});

	QUnit.test("check 'getDelta' (add a new sorter)", function(assert){

		var oAdaptationControl = this.oSortController.getAdaptationControl();

		var aChanges = this.oSortController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oSortController.getChangeOperations(),
			existingState: this.oSortController.getCurrentState(),
			changedState: [{key: "fieldA", descending: true}],
			propertyInfo: this.initHelper().getProperties(),
			applyAbsolute: true
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 1, "One sorter has been added");

		assert.equal(aChanges[0]["changeSpecificData"].changeType, "addSort", "Add change created");
		assert.equal(aChanges[0]["changeSpecificData"].content.key, "fieldA", "Add change created with correct key");
		assert.equal(aChanges[0]["changeSpecificData"].content.descending, true, "Add change created with correct descending attribute");

	});

	QUnit.test("check 'getDelta' (apply same state --> no change)", function(assert){

		var oAdaptationControl = this.oSortController.getAdaptationControl();

		var aChanges = this.oSortController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oSortController.getChangeOperations(),
			existingState: [{key: "fieldA", descending: true}],
			changedState: [{key: "fieldA", descending: true}],
			propertyInfo: this.initHelper().getProperties(),
			applyAbsolute: true
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 0, "No sorter has been added");

	});

	QUnit.test("check 'getDelta' (move position)", function(assert){

		var oAdaptationControl = this.oSortController.getAdaptationControl();

		var aChanges = this.oSortController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oSortController.getChangeOperations(),
			existingState: [{key: "fieldA"}, {key: "fieldB"}],
			changedState: [{key: "fieldB"}, {key: "fieldA"}],
			propertyInfo: this.initHelper().getProperties(),
			applyAbsolute: true
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 1, "One sorter has been moved");

		assert.equal(aChanges[0]["changeSpecificData"].changeType, "moveSort", "Move change created");

	});

	QUnit.test("check 'getDelta' (remove sorter)", function(assert){

		var oAdaptationControl = this.oSortController.getAdaptationControl();

		var aChanges = this.oSortController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oSortController.getChangeOperations(),
			existingState: [{key: "fieldA"}],
			changedState: [],
			propertyInfo: this.initHelper().getProperties(),
			applyAbsolute: true
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 1, "One sorter has been removed");

		assert.equal(aChanges[0]["changeSpecificData"].changeType, "removeSort", "Remove change created");
		assert.equal(aChanges[0]["changeSpecificData"].content.key, "fieldA", "Remove change created with correct key");

	});

});