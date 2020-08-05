/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/flexibility/SortFlex", "sap/ui/core/UIComponent", "sap/ui/core/ComponentContainer", "sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/core/util/reflection/JsControlTreeModifier"
], function(SortFlex, UIComponent, ComponentContainer, ChangesWriteAPI, JsControlTreeModifier) {
	"use strict";

	var UIComp = UIComponent.extend("test", {
		metadata: {
			manifest: {
				"sap.app": {
					"id": "",
					"type": "application"
				}
			}
		},
		createContent: function() {
			// create empty table in view to enable flex changes
			var oView = sap.ui.view({
				async: false,
				type: "XML",
				id: this.createId("view"),
				viewContent: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table"><Table id="myTable"></Table></mvc:View>'
			});
			return oView;
		}
	});

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
			this.oUiComponent = new UIComp("comp");
			// Place component in container and display
			this.oUiComponentContainer = new ComponentContainer({
				component: this.oUiComponent,
				async: false
			});
			this.oView = this.oUiComponent.getRootControl();
			this.oUiComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oView = this.oUiComponent.getRootControl();
			this.oTable = this.oView.byId('myTable');

			this.fAddSort = SortFlex.addSort.changeHandler.applyChange;
			this.fRemoveSort = SortFlex.removeSort.changeHandler.applyChange;
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

});
