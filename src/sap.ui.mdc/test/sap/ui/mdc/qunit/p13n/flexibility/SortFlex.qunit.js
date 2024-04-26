/* global QUnit */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment", "sap/ui/mdc/flexibility/SortFlex", "sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/ui/qunit/utils/nextUIUpdate"
], function(createAppEnvironment, SortFlex, ChangesWriteAPI, JsControlTreeModifier, nextUIUpdate) {
	"use strict";

	const fCreateAddSortDefinition = function(){
		return {
			"changeType": "addSort",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"key": "Category",
				"descending": false,
				"index": 0
			}
		};
	};

	const fCreateRemoveSortDefintion = function(){
		return {
			"changeType": "removeSort",
			"selector": {
				"id": "comp---view--myTable"
			},
			"content": {
				"key": "Category",
				"descending": false,
				"index": 0
			}
		};
	};

	QUnit.module("change handlers", {
		beforeEach: function() {

			const sTableView = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table"><Table id="myTable"></Table></mvc:View>';

			return createAppEnvironment(sTableView, "Table").then(async function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				await nextUIUpdate();

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
		const done = assert.async();
		const oContent = fCreateAddSortDefinition();

		return ChangesWriteAPI.create({
			changeSpecificData: oContent,
			selector: this.oTable
		}).then(function(oChange) {

			this.fAddSort(oChange, this.oTable, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).then(function(){

				const oSortConditions = this.oTable.getSortConditions();
				const aSorters = oSortConditions.sorters;

				assert.equal(aSorters.length, 1, "one sorter has been created");
				assert.equal(aSorters[0].key, "Category", "correct sorter has been created");
				assert.equal(aSorters[0].descending, false, "correct sort order has been created");

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("removeSort", function(assert) {
		const done = assert.async();
		const oAddContent = fCreateAddSortDefinition();

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

				let oSortConditions = this.oTable.getSortConditions();
				const aSorters = oSortConditions.sorters;

				assert.equal(aSorters.length, 1, "one sorter has been created");
				assert.equal(aSorters[0].key, "Category", "correct sorter has been created");
				assert.equal(aSorters[0].descending, false, "correct sort order has been created");

				//create removeSort
				const oRemoveContent = fCreateRemoveSortDefintion();
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

	QUnit.test("removeSort (for a sorter that does not exist) with a different existing sorter", function(assert) {
		const done = assert.async();
		const oAddContent = fCreateAddSortDefinition();

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

				let oSortConditions = this.oTable.getSortConditions();
				const aSorters = oSortConditions.sorters;

				assert.equal(aSorters.length, 1, "one sorter has been created");
				assert.equal(aSorters[0].key, "Category", "correct sorter has been created");
				assert.equal(aSorters[0].descending, false, "correct sort order has been created");

				//create removeSort
				const oRemoveContent = {
					changeType: "removeSort",
					selector: {
						id: "comp---view--myTable"
					},
					content: {
						key: "someNonExistingPropertyName"
					}
				};
				return ChangesWriteAPI.create({
					changeSpecificData: oRemoveContent,
					selector: this.oTable
				}).then(function(oChange) {

					this.fRemoveSort(oChange, this.oTable, {
						modifier: JsControlTreeModifier,
						appComponent: this.oUiComponent,
						view: this.oView
					}).finally(function(){

						oSortConditions = this.oTable.getSortConditions();

						//Check that the false change has been ignored gracefully, the further appliance and chain of appliance works as expected
						assert.equal(oSortConditions.sorters.length, 1, "sort conditions still contains the earlier existing sorter");

						done();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("apply and revert 'removeSort' with exisiting sortConditions", function(assert) {
		const done = assert.async();

		this.oTable.setSortConditions({
			sorters: [
				{
					"key": "Category",
					"descending": false
				}
			]
		});

		const oInitialSortConditions = this.oTable.getSortConditions();

		//create removeSort
		const oRemoveContent = fCreateRemoveSortDefintion();
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
				const oSortConditions = this.oTable.getSortConditions();
				assert.equal(oSortConditions.sorters.length, 0, "no sorters - sort has been removed");

				//revert 'removeSort'
				this.fRevertRemoveSort(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){

					//sortConditions should be similar to the initial state
					const oCurrentSortConditions = this.oTable.getSortConditions();
					assert.deepEqual(oCurrentSortConditions, oInitialSortConditions, "sorter has been reverted and is available again");

				}.bind(this));

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("apply and revert 'addSort'", function(assert) {
		const done = assert.async();

		//create removeSort
		const oRemoveContent = fCreateAddSortDefinition();
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
				const oSortConditions = this.oTable.getSortConditions();
				assert.equal(oSortConditions.sorters.length, 1, "sorter added");

				//revert 'removeSort'
				this.fRevertAddSort(oChange, this.oTable, {
					modifier: JsControlTreeModifier,
					appComponent: this.oUiComponent,
					view: this.oView
				}).then(function(){

					//'addSort' reverted --> no sorters
					const oSortConditions = this.oTable.getSortConditions();
					assert.equal(oSortConditions.sorters.length, 0, "no sorter available - addSort successfully reverted");

				}.bind(this));

				done();
			}.bind(this));
		}.bind(this));
	});

});
