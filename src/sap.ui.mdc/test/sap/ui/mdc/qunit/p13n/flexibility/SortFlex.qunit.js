/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment", "sap/ui/mdc/flexibility/SortFlex", "sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/core/util/reflection/JsControlTreeModifier"
], function(createAppEnvironment, SortFlex, ChangesWriteAPI, JsControlTreeModifier) {
	"use strict";

	var fCreateAddSortDefinition = function(){
		return {
			"changeType": "addSort",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"name": "Category",
				"descending": false,
				"index": 0
			}
		};
	};

	var fCreateRemoveSortDefintion = function(){
		return {
			"changeType": "removeSort",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"name": "Category",
				"descending": false,
				"index": 0
			}
		};
	};

	QUnit.module("change handlers", {
		beforeEach: function() {

			var sTableView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table"><Table id="myTable"></Table></mvc:View>';

			return createAppEnvironment(sTableView, "Table").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				this.oTable = this.oView.byId('myTable');

				//addSort
				this.fAddSort = SortFlex.addSort.changeHandler.applyChange;
				this.fRevertAddSort = SortFlex.addSort.changeHandler.revertChange;

				//removeSort
				this.fRemoveSort = SortFlex.removeSort.changeHandler.applyChange;
				this.fRevertRemoveSort = SortFlex.removeSort.changeHandler.revertChange;
			}.bind(this));
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("addSort", function(assert) {
		var done = assert.async();
		var oContent = fCreateAddSortDefinition();

		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oTable
		}).then(function(oChange) {

			this.fAddSort(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				var oSortConditions = this.oTable.getSortConditions();
				var aSorters = oSortConditions.sorters;

				assert.equal(aSorters.length, 1, "one sorter has been created");
				assert.equal(aSorters[0].name, "Category", "correct sorter has been created");
				assert.equal(aSorters[0].descending, false, "correct sort order has been created");

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("removeSort", function(assert) {
		var done = assert.async();
		var oAddContent = fCreateAddSortDefinition();

		//create addSort
		return ChangesWriteAPI.create({
			changeSpecificData: oAddContent,
			selector: this.oTable
		}).then(function(oChange) {

			this.fAddSort(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				var oSortConditions = this.oTable.getSortConditions();
				var aSorters = oSortConditions.sorters;

				assert.equal(aSorters.length, 1, "one sorter has been created");
				assert.equal(aSorters[0].name, "Category", "correct sorter has been created");
				assert.equal(aSorters[0].descending, false, "correct sort order has been created");

				//create removeSort
				var oRemoveContent = fCreateRemoveSortDefintion();
				return ChangesWriteAPI.create({
					changeSpecificData: oRemoveContent,
					selector: this.oTable
				}).then(function(oChange) {

					this.fRemoveSort(oChange, this.oTable, {
						modifier: JsControlTreeModifier,
						appComponent: this.oUiComponent,
						view: this.oView
					}).then(function(){

						oSortConditions = this.oTable.getSortConditions();

						assert.equal(oSortConditions.sorters.length, 0, "sort conditions contains an empty array");

						done();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("apply and revert 'removeSort' with exisiting sortConditions", function(assert) {
		var done = assert.async();

		this.oTable.setSortConditions({
			sorters: [
				{
					"name": "Category",
					"descending": false
				}
			]
		});

		var oInitialSortConditions = this.oTable.getSortConditions();

		//create removeSort
		var oRemoveContent = fCreateRemoveSortDefintion();
		return ChangesWriteAPI.create({
			changeSpecificData: oRemoveContent,
			selector: this.oTable
		}).then(function(oChange) {

			//apply 'removeSort'
			this.fRemoveSort(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				//existing sort condition removed
				var oSortConditions = this.oTable.getSortConditions();
				assert.equal(oSortConditions.sorters.length, 0, "no sorters - sort has been removed");

				//revert 'removeSort'
				this.fRevertRemoveSort(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){

					//sortConditions should be similar to the initial state
					var oCurrentSortConditions = this.oTable.getSortConditions();
					assert.deepEqual(oCurrentSortConditions, oInitialSortConditions, "sorter has been reverted and is available again");

				}.bind(this));

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("apply and revert 'addSort'", function(assert) {
		var done = assert.async();

		//create removeSort
		var oRemoveContent = fCreateAddSortDefinition();
		return ChangesWriteAPI.create({
			changeSpecificData: oRemoveContent,
			selector: this.oTable
		}).then(function(oChange) {

			//apply 'removeSort'
			this.fAddSort(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				//existing sort condition removed
				var oSortConditions = this.oTable.getSortConditions();
				assert.equal(oSortConditions.sorters.length, 1, "sorter added");

				//revert 'removeSort'
				this.fRevertAddSort(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){

					//'addSort' reverted --> no sorters
					var oSortConditions = this.oTable.getSortConditions();
					assert.equal(oSortConditions.sorters.length, 0, "no sorter available - addSort successfully reverted");

				}.bind(this));

				done();
			}.bind(this));
		}.bind(this));
	});

});
