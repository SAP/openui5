/* global QUnit, sinon */
sap.ui.define([
	"../QUnitUtils", "sap/ui/mdc/p13n/FlexUtil" ,"sap/ui/mdc/p13n/AdaptationController", "sap/ui/mdc/p13n/panels/BasePanel", "sap/ui/mdc/FilterBarDelegate", "sap/ui/mdc/Table", "sap/ui/mdc/Chart", "sap/ui/mdc/ChartDelegate", "sap/ui/mdc/TableDelegate", "sap/ui/mdc/table/TableSettings", "sap/ui/mdc/chart/ChartSettings", "sap/ui/mdc/FilterBar", "sap/m/Button", "sap/ui/mdc/table/Column","sap/ui/mdc/chart/DimensionItem", "sap/ui/mdc/chart/MeasureItem", "sap/ui/mdc/FilterField"
], function (MDCQUnitUtils, FlexUtil, AdaptationController, BasePanel, FilterBarDelegate, Table, Chart, ChartDelegate, TableDelegate, TableSettings, ChartSettings, FilterBar, Button, Column, Dimension, Measure, FilterField) {
	"use strict";
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	QUnit.module("AdaptationController API tests showP13n Table", {
		beforeEach: function () {
				var aPropertyInfos = [
				{
					"name": "col1",
					"path": "nav/col1",
					"label": "col1",
					"sortable": true,
					"filterable": true
				}, {
					"name": "col2",
					"path": "nav/col2",
					"label": "col2",
					"sortable": true,
					"filterable": false
				}
			];

			return this.createTestObjects(aPropertyInfos);
		},
		afterEach: function () {
			this.destroyTestObjects();
		},
		createTestObjects: function(aPropertyInfos) {
			this.oTable = new Table("TestTabl", {
				columns: [
					new Column("col1",{
						header:"col1",
						dataProperty: "col1"
					}),
					new Column("col2",{
						header:"col2",
						dataProperty: "col2"
					})
				]
			});
			this.oTable.setP13nMode(["Column","Sort","Filter"]);

			return this.oTable.retrieveAdaptationController().then(function (oAdaptationController) {
				MDCQUnitUtils.stubPropertyInfos(this.oTable, aPropertyInfos);

				this.oAdaptationController = oAdaptationController;
				this.oAdaptationController.oAdaptationControlDelegate = TableDelegate;//necessary as the "getCurrentState" is in TableDelegate + retrieve in AC is stubbed

				this.oAdaptationController.oAdaptationControlDelegate.getFilterDelegate = function() {
					return {
						addFilterItem: function(oProp, oControl){
							return Promise.resolve(new FilterField({
								conditions: "{$filters>/conditions/" + oProp.name + "}"
							}));
						}
					};
				};
			}.bind(this));
		},
		destroyTestObjects: function() {
			this.oTable.destroy();
			this.oAdaptationController.destroy();
			MDCQUnitUtils.restorePropertyInfos(this.oTable);
		}
	});

	QUnit.test("Check 'AdaptationController' instantiation", function(assert) {
		assert.ok(this.oAdaptationController,"AdaptationController has been instantiated");
		assert.ok(this.oAdaptationController.oAdaptationModel,"inner model has been created");
		assert.ok(this.oAdaptationController.oAdaptationModel.iSizeLimit, 10000, "inner model size limit has been adjusted");
		assert.ok(!this.oAdaptationController.bIsDialogOpen, "dialog is not open");
	});

	QUnit.test("liveMode true", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
		this.oAdaptationController.setLiveMode(true);

		this.oAdaptationController.showP13n(oBtn, "Item").then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.getVerticalScrolling(), "Vertical scrolling is active");
			assert.ok(oP13nControl.isA("sap.m.ResponsivePopover"));
			assert.equal(oP13nControl.getTitle(), oResourceBundle.getText("table.SETTINGS_COLUMN"), "Correct title has been set");
			assert.ok(this.oAdaptationController.bIsDialogOpen,"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SelectionPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
			var oPropertyHelper = this.oAdaptationController.getAdaptationControl().getPropertyHelper();
			assert.equal(oInnerTable.getItems().length, oPropertyHelper.getProperties().length, "correct amount of items has been set");
			done();
		}.bind(this));
	});

	QUnit.test("liveMode false", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
		this.oAdaptationController.setLiveMode(false);

		this.oAdaptationController.showP13n(oBtn, "Item").then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.isA("sap.m.Dialog"));
			assert.equal(oP13nControl.getTitle(), oResourceBundle.getText("table.SETTINGS_COLUMN"), "Correct title has been set");
			assert.ok(this.oAdaptationController.bIsDialogOpen,"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SelectionPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
			var oPropertyHelper = this.oAdaptationController.getAdaptationControl().getPropertyHelper();
			assert.equal(oInnerTable.getItems().length, oPropertyHelper.getProperties().length, "correct amount of items has been set");
			done();
		}.bind(this));
	});

	QUnit.test("open filter dialog", function (assert) {
		var done = assert.async();
		var oBtn = new Button();

		this.oTable.initialized().then(function(){
			this.oTable.retrieveInbuiltFilter().then(function(oP13nFilter){
				this.oAdaptationController.showP13n(oBtn, "Filter").then(function(oP13nControl){

					//check container
					assert.ok(oP13nControl, "Container has been created");
					assert.ok(oP13nControl.isA("sap.m.Dialog"));
					assert.equal(oP13nControl.getTitle(), oResourceBundle.getText("filter.PERSONALIZATION_DIALOG_TITLE"), "Correct title has been set");
					assert.ok(this.oAdaptationController.bIsDialogOpen,"dialog is open");

					//check inner Control
					assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar"), "Correct control created");

					//check that only 'filterable' fields have been created
					assert.equal(oP13nControl.getContent()[0].getFilterItems().length, 1, "Only one field is filterable");

					//check that inner oP13nFilter is an IFilter
					assert.ok(oP13nFilter.isA("sap.ui.mdc.IFilter"));
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("open filter dialog - do not maintain 'filterable'", function (assert) {
		var done = assert.async();
		var oBtn = new Button();

		this.oTable.initialized().then(function(){
			this.oTable.retrieveInbuiltFilter().then(function(oP13nFilter){
				this.oAdaptationController.showP13n(oBtn, "Filter").then(function(oP13nControl){
						var aFilterItems = oP13nControl.getContent()[0].getFilterItems();

						//always display in Filter dialog by default
						assert.equal(aFilterItems.length, 1, "correct amount of items has been set");
					done();
				});
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("create filter control for personalization", function (assert) {
		var done = assert.async();

		var aPropertyInfos = [
			{
				"name": "col1",
				"path": "nav/col1",
				"label": "col1",
				"sortable": true,
				"filterable": false
			}
		];

		this.oAdaptationController.createP13n("Item", aPropertyInfos).then(function(oP13nControl){
			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.isA("sap.m.Dialog"));

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SelectionPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
			assert.equal(oInnerTable.getItems().length, 1, "only one item has been created (as only one has been passed as parameter)");
			done();
		});
	});

	QUnit.test("_handleChange callback execution",function(assert){
		var done = assert.async();

		//first we need to open the settings dialog to ensure that all models have been prepared
		this.oAdaptationController.showP13n(this.oTable, "Item").then(function(oP13nControl){

			//trigger event handler manually --> usually triggered by user interaction
			//user interaction manipulates the inner model of the panel,
			//to mock user interaction we directly act the change on the p13n panel model
			var aItems = this.oAdaptationController.oAdaptationModel.getData().items;
			aItems.pop(); //remove one item to trigger a change
			this.oAdaptationController.oAdaptationModel.setProperty("/items",aItems);

			this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
				assert.ok(aChanges,"event has been executed");
				assert.equal(aChanges.length, 1, "correct amounf oc changes has been created");

				//check that only required information is present in the change content
				var oChangeContent = aChanges[0].changeSpecificData.content;
				assert.ok(oChangeContent.name);
				assert.ok(!oChangeContent.hasOwnProperty("descending"));
			});

			this.oAdaptationController._handleChange();
			done();
		}.bind(this));

	});

	QUnit.test("check that according hook will be called with the 'name' as key",function(assert){
		var done = assert.async();

		//first we need to open the settings dialog to ensure that all models have been prepared
		this.oAdaptationController.showP13n(this.oTable, "Item").then(function(oP13nControl){

			//trigger event handler manually --> usually triggered by user interaction
			//user interaction manipulates the inner model of the panel,
			//to mock user interaction we directly act the change on the p13n panel model
			var aItems = this.oAdaptationController.oAdaptationModel.getData().items;

			aItems.pop();

			this.oAdaptationController.oAdaptationModel.setProperty("/items",aItems);

			this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
				assert.ok(aChanges,"event has been executed");
				assert.equal(aChanges.length, 1, "correct amounf oc changes has been created");

				//check that only required information is present in the change content
				var oChangeContent = aChanges[0].changeSpecificData.content;
				var oPropertyHelper = this.oAdaptationController.getAdaptationControl().getPropertyHelper();
				assert.equal(oChangeContent.name, oPropertyHelper.getProperties()[1].getName(),
					"The stored key should be equal to the 'name' in property info (NOT PATH!)");
				done();
			}.bind(this));

			this.oAdaptationController._handleChange();

		}.bind(this));

	});

	QUnit.test("check with 'Sort'", function (assert) {
		var done = assert.async();
		var oBtn = new Button();

		this.oAdaptationController.showP13n(oBtn, "Sort").then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.getVerticalScrolling(), "Vertical scrolling is active");
			assert.ok(this.oAdaptationController.bIsDialogOpen,"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SortPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
			var oPropertyHelper = this.oAdaptationController.getAdaptationControl().getPropertyHelper();
			assert.equal(oInnerTable.getItems().length, oPropertyHelper.getProperties().length, "correct amount of items has been set");
			done();
		}.bind(this));
	});

	QUnit.test("check with 'Sort' +  non sortable properties", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
		this.destroyTestObjects();

		var aPropertyInfos = [
			{
				"name": "col1",
				"path": "nav/col1",
				"label": "col1",
				"sortable": false,
				"filterable": true
			}, {
				"name": "col2",
				"path": "nav/col2",
				"label": "col2",
				"sortable": true,
				"filterable": false
			}
		];

		this.createTestObjects(aPropertyInfos);

		this.oAdaptationController.showP13n(oBtn, "Sort").then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(this.oAdaptationController.bIsDialogOpen,"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SortPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");

			//-1 non sortable property
			var oPropertyHelper = this.oAdaptationController.getAdaptationControl().getPropertyHelper();
			assert.equal(oInnerTable.getItems().length, oPropertyHelper.getProperties().length - 1, "correct amount of items has been set");
			done();
		}.bind(this));
	});

	QUnit.test("use 'createSortChanges' to create changes without UI panel", function (assert) {
		var done = assert.async();
		this.destroyTestObjects();

		var aPropertyInfos = [
			{
				"name": "col1",
				"path": "nav/col1",
				"label": "col1",
				"sortable": false,
				"filterable": true
			}, {
				"name": "col2",
				"path": "nav/col2",
				"label": "col2",
				"sortable": true,
				"filterable": false
			}
		];

		this.createTestObjects(aPropertyInfos);

		var aP13nData = [
			{name:"col2", descending: true}
		];

		this.oAdaptationController.createSortChanges(aP13nData, true).then(function(){
			assert.ok(true, "Callback triggered");
		});

		this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 1, "one change created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "addSort", "once sort change created");
			done();
		});

	});

	QUnit.test("use 'createItemChanges' to create changes without UI panel (create new columns)", function(assert){
		var done = assert.async();

		var aP13nData = [
			{name:"col3", position: 2},
			{name:"col4", position: 3}
		];

		this.oAdaptationController.createItemChanges(aP13nData).then(function(){
			assert.ok(true, "Callback triggered");
		});

		this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 2, "one change created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "addColumn", "once column change created");
			assert.equal(aChanges[1].changeSpecificData.changeType, "addColumn", "once column change created");
			done();
		});
	});

	QUnit.test("use 'createItemChanges' to create changes without UI panel (remove non present column)", function(assert){
		var done = assert.async();

		var aP13nData = [
			{name:"col3", position: 2},
			{name:"col4", visible: false}// column is not present, so no change should be created
		];

		this.oAdaptationController.createItemChanges(aP13nData).then(function(){
			assert.ok(true, "Callback triggered");
		});

		this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 1, "one change created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "addColumn", "once column change created");
			done();
		});
	});

	QUnit.test("use 'createItemChanges' to create changes without UI panel (remove existing column)", function(assert){
		var done = assert.async();

		var aP13nData = [
			{name:"col1", visible: false}
		];

		this.oAdaptationController.createItemChanges(aP13nData).then(function(){
			assert.ok(true, "Callback triggered");
		});

		this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 1, "one change created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "removeColumn", "once column change created");
			done();
		});
	});

	QUnit.test("use 'createItemChanges' to create changes without UI panel (move existing column)", function(assert){
		var done = assert.async();

		var aP13nData = [
			{name:"col1", position: 1}//position changed
		];

		this.oAdaptationController.createItemChanges(aP13nData).then(function(){
			assert.ok(true, "Callback triggered");
		});

		this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 1, "one change created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "moveColumn", "once column change created");
			done();
		});
	});

	QUnit.module("AdaptationController API tests showP13n Chart", {
		beforeEach: function () {
			//mock delegate data
			var aPropertyInfos = [
				{
					"name": "item1",
					"label": "Item 1"
				}, {
					"name": "item2",
					"label": "Item 2"
				}
			];

			this.bModuleRunning = true;
			return this.createTestObjects(aPropertyInfos);
		},
		afterEach: function () {
			this.bModuleRunning = false;
			this.oChart.destroy();

			if (this.oAdaptationController) {
				this.oAdaptationController.destroy();
			}
		},
		createTestObjects: function(aPropertyInfos) {
			this.oChart = new Chart("TestChart", {
				p13nMode: ['Item', 'Sort'],
				items: [
					new Dimension("item1",{
						header:"item1",
						key:"item1"
					}),
					new Measure("item2",{
						header:"item2",
						key:"item2"
					})
				]
			});

			this.bModuleRunning = true;

			return this.oChart.retrieveAdaptationController().then(function () {
				MDCQUnitUtils.stubPropertyInfos(this.oChart, aPropertyInfos);
				this.oAdaptationController = this.oChart.getAdaptationController();
				this.oAdaptationController.oAdaptationControlDelegate = ChartDelegate;
			}.bind(this));
		},
		destroyTestObjects: function() {
			this.oChart.destroy();
			this.oAdaptationController.destroy();
			MDCQUnitUtils.restorePropertyInfos(this.oChart);
		}
	});

	QUnit.test("use ChartItemPanel", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
		this.oAdaptationController.setLiveMode(true);
		this.oAdaptationController.showP13n(oBtn, "Item").then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.isA("sap.m.ResponsivePopover"));
			assert.equal(oP13nControl.getTitle(), oResourceBundle.getText("chart.PERSONALIZATION_DIALOG_TITLE"), "Correct title has been set");
			assert.ok(this.oAdaptationController.bIsDialogOpen,"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.ChartItemPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
			var oPropertyHelper = this.oAdaptationController.getAdaptationControl().getPropertyHelper();
			assert.equal(oInnerTable.getItems().length, oPropertyHelper.getProperties().length, "correct amount of items has been set");
			assert.equal(oInnerTable.getItems()[0].getCells()[2].getSelectedKey(), "category", "Correct role selected");
			done();
		}.bind(this));
	});

	QUnit.test("use 'createItemChanges' to create changes for a different role", function(assert){
		var done = assert.async();

		var aP13nData = [
			{name:"item1", role: "series"}
		];

		this.oAdaptationController.createItemChanges(aP13nData).then(function(){
			assert.ok(true, "Callback triggered");
		});

		this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 2, "two change created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "removeItem", "one 'removeItem' change created");
			assert.equal(aChanges[1].changeSpecificData.changeType, "addItem", "one 'addItem' change created");
			assert.equal(aChanges[1].changeSpecificData.content.role, "series", "Role has been changed in 'addItem' change");
			done();
		});
	});

	QUnit.test("use ChartItemPanel - getCurrentState returns different 'role'", function (assert) {
		var done = assert.async();
		var oBtn = new Button();

		this.oChart.getItems()[0].setRole("series");

		this.oAdaptationController.showP13n(oBtn, "Item").then(function(oP13nControl){

			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.equal(oInnerTable.getItems()[0].getCells()[2].getSelectedKey(), "series", "Correct role selected");

			done();
		});
	});

	QUnit.test("check sorting in Chart", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
		this.oAdaptationController.setLiveMode(true);

		this.oChart.setSortConditions({
			sorters: [
				{name: "item1", descending: true}
			]
		});

		this.oAdaptationController.showP13n(oBtn, "Sort").then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.isA("sap.m.ResponsivePopover"));
			assert.equal(oP13nControl.getTitle(), "Sort", "Correct title has been set");
			assert.ok(this.oAdaptationController.bIsDialogOpen,"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SortPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
			assert.equal(oInnerTable.getItems()[0].getSelected(), true, "Correct sorter in the dialog");
			assert.equal(oInnerTable.getItems()[1].getSelected(), false, "Correct sorter in the dialog");
			assert.equal(oInnerTable.getItems()[0].getCells()[1].getSelectedItem().getText(), "Descending", "Correct sorter in the dialog");
			done();
		}.bind(this));
	});

	QUnit.module("AdaptationController API tests showP13n FilterBar", {
		beforeEach: function () {
			this.aPropertyInfos = [
				{
					"name": "item1",
					"label": "item1"
				}, {
					"name": "item2",
					"label": "item2"
				}, {
					"name": "item3",
					"label": "item3"
				}, {
					"name": "$search"
				}
			];

			return this.createTestObjects(this.aPropertyInfos);
		},
		afterEach: function () {
			this.destroyTestObjects();
		},
		createTestObjects: function(aPropertyInfos) {
			this.oFilterBar = new FilterBar("TestFB", {
				p13nMode: ["Item","Value"],
				filterItems: [
					new FilterField("item1",{
						label:"item1",
						conditions: "{$filters>/conditions/item1}"
					}),
					new FilterField("item2",{
						label:"item2",
						conditions: "{$filters>/conditions/item2}"
					})
				]
			});

			return this.oFilterBar.retrieveAdaptationController().then(function (oAdaptationController) {
				MDCQUnitUtils.stubPropertyInfos(this.oFilterBar, aPropertyInfos);
				this.oAdaptationController = oAdaptationController;

				FilterBarDelegate.addItem = function(sKey, oFilterBar) {
					return Promise.resolve(new FilterField({
						conditions: "{$filters>/conditions/" + sKey + "}"
					}));
				};

				this.oAdaptationController.oAdaptationControlDelegate = FilterBarDelegate;
			}.bind(this));
		},
		destroyTestObjects: function() {
			this.oFilterBar.destroy();
			this.oAdaptationController.destroy();
			MDCQUnitUtils.restorePropertyInfos(this.oFilterBar);
		}
	});

	QUnit.test("Custom 'retrievePropertyInfo' should not take $search into account for FilterBar", function(assert){
		var done = assert.async();

		this.oAdaptationController.setLiveMode(false);

		this.oAdaptationController.showP13n(undefined, "Filter").then(function(oP13nControl){
			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.isA("sap.m.Dialog"));
			assert.ok(!oP13nControl.getVerticalScrolling(), "Vertical scrolling is disabled for FilterBarBase 'filterConfig'");
			assert.equal(oP13nControl.getCustomHeader().getContentLeft()[0].getText(), oResourceBundle.getText("filterbar.ADAPT_TITLE"), "Correct title has been set");
			assert.ok(this.oAdaptationController.bIsDialogOpen,"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oFilterBarLayout.getInner().getCurrentViewContent()._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar"), "Correct P13n UI created");
			assert.ok(oInnerTable, "Inner Table has been created");

			done();

		}.bind(this));

	});

	QUnit.test("use AdaptationFilterBar", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
		this.oAdaptationController.showP13n(oBtn, "Filter").then(function(oP13nControl){

			assert.ok(oP13nControl.isA("sap.m.Dialog"), "Dialog as container created");

			var oP13nFilter = oP13nControl.getContent()[0];
			assert.ok(oP13nFilter.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar"), "P13n FilterBar created for filter UI adaptation");

			var oAdaptFilterPanel = oP13nFilter._oFilterBarLayout.getInner();
			oAdaptFilterPanel.switchView("group");
			assert.ok(oAdaptFilterPanel.isA("sap.ui.mdc.p13n.panels.AdaptFiltersPanel"), "AdaptFiltersPanel as inner layout");

			var oList = oAdaptFilterPanel.getView("group").getContent()._oListControl;
			assert.ok(oList.isA("sap.m.ListBase"), "ListBase control as inner representation");

			var oFirstGroup = oList.getItems()[0];
			assert.ok(oFirstGroup.isA("sap.m.ListItemBase"), "ListItem for grup presentation");

			var oFirstGroupList = oFirstGroup.getCells()[0].getContent()[0];
			assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
			assert.equal(oFirstGroupList.getSelectedItems().length, 2, "2 items selected");

			done();

		});
	});

	QUnit.test("check inner model reset", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
		this.oAdaptationController.showP13n(oBtn, "Filter").then(function(oP13nControl){

			var oP13nFilter = oP13nControl.getContent()[0];
			var oAFPanel = oP13nFilter._oFilterBarLayout.getInner();
			oAFPanel.switchView("group");
			var oList = oAFPanel.getCurrentViewContent()._oListControl;
			var oFirstGroup = oList.getItems()[0];

			//3 items, 2 initially selected
			var oFirstGroupList = oFirstGroup.getCells()[0].getContent()[0];
			assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
			assert.equal(oFirstGroupList.getSelectedItems().length, 2, "2 items selected");

			var aModelItems = this.oAdaptationController.oAdaptationModel.getData().items;
			var aModelItemsGrouped = this.oAdaptationController.oAdaptationModel.getData().itemsGrouped;

			aModelItems[2].selected = true;
			aModelItemsGrouped[0].items[2].selected = true;

			//3 items selected --> mock a model change
			this.oAdaptationController.oAdaptationModel.setProperty("/items", aModelItems);
			this.oAdaptationController.oAdaptationModel.setProperty("/itemsGrouped", aModelItemsGrouped);

			assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
			assert.equal(oFirstGroupList.getSelectedItems().length, 3, "3 items selected");

			sinon.stub(FlexUtil, "discardChanges").callsFake(function(){
				return Promise.resolve();
			});

			this.oAdaptationController.resetP13n().then(function(){
				//Model has been reset --> initial state recovered in model
				assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
				assert.equal(oFirstGroupList.getSelectedItems().length, 2, "2 items selected");
				done();
			});

		}.bind(this));
	});

	QUnit.test("create condition changes via 'createConditionChanges'", function(assert){
		var done = assert.async();

		var mConditions = {
			item1: [{operator: "EQ", values:["Test"]}],
			item2: [{operator: "EQ", values:["Test"]}],
			item3: [{operator: "EQ", values:["Test"]}]
		};

		this.oAdaptationController.createP13n("Filter").then(function() {
			this.oAdaptationController.createConditionChanges(mConditions).then(function(){
				assert.ok(true, "Callback triggered");
			});

			this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
				assert.ok(aChanges, "changes created");
				assert.equal(aChanges.length, 3, "three changes created");
				assert.equal(aChanges[0].changeSpecificData.changeType, "addCondition", "one condition change created");
				assert.equal(aChanges[1].changeSpecificData.changeType, "addCondition", "one condition change created");
				assert.equal(aChanges[2].changeSpecificData.changeType, "addCondition", "one condition change created");
				done();
			});
		}.bind(this));

	});

	QUnit.test("AdaptationController should not crash for non present properties", function(assert){
		var done = assert.async();

		//use AdaptationController with a non existing property
		var mConditions = {
			someNonexistingProperty: [{operator: "EQ", values:["Test"]}]
		};

		this.oAdaptationController.createConditionChanges(mConditions).then(function(){
			assert.ok(true, "Callback triggered");
		});

		//--> _hasProperty inbetween should always return something, but no changes should be created for "wrong" properties
		this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 0, "no change created as the property is not defined in the PropertyInfo");
			done();
		});
	});

	QUnit.test("create condition changes via 'createConditionChanges' with initial filterConditions", function(assert){
		var done = assert.async();

		var mConditions = {
			item1: [{operator: "EQ", values:["Test"]}],
			item2: [{operator: "EQ", values:["Test"]}],
			item3: [{operator: "EQ", values:["Test"]}]
		};

		sinon.stub(this.oFilterBar, "getPropertyInfoSet").returns(this.aPropertyInfos);
		this.oFilterBar.setFilterConditions({item1: [{operator: "EQ", values:["Test"]}]});

		this.oAdaptationController.createConditionChanges(mConditions).then(function(){
			assert.ok(true, "Callback triggered");
		});

		this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 2, "three changes created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "addCondition", "one condition change created");
			assert.equal(aChanges[1].changeSpecificData.changeType, "addCondition", "one condition change created");
			done();
		});

	});

	QUnit.test("create condition changes via 'createConditionChanges' with initial filterConditions", function(assert){
		var done = assert.async();

		var mConditions = {
			item1: [],
			item2: [{operator: "EQ", values:["Test"]}],
			item3: [{operator: "EQ", values:["Test"]}]
		};

		sinon.stub(this.oFilterBar, "getPropertyInfoSet").returns(this.aPropertyInfos);
		this.oFilterBar.setFilterConditions({item1: [{operator: "EQ", values:["Test"]}]});

		this.oAdaptationController.createConditionChanges(mConditions).then(function(){
			assert.ok(true, "Callback triggered");
		});

		this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 3, "three changes created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "removeCondition", "one condition change created");
			assert.equal(aChanges[1].changeSpecificData.changeType, "addCondition", "one condition change created");
			assert.equal(aChanges[2].changeSpecificData.changeType, "addCondition", "one condition change created");
			done();
		});

	});

	QUnit.test("create condition changes via 'createConditionChanges' and always consider $search", function(assert){
		var done = assert.async();

		var mConditions = {
			$search: [{operator: "EQ", values:["Test"]}]
		};

		sinon.stub(this.oFilterBar, "getPropertyInfoSet").returns(this.aPropertyInfos);
		this.oFilterBar.setFilterConditions({item1: [{operator: "EQ", values:["Test"]}]});

		this.oAdaptationController.createConditionChanges(mConditions).then(function(){
			assert.ok(true, "Callback triggered");
		});

		this.oAdaptationController.setProperty("afterChangesCreated", function(oAC, aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 1, "three changes created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "addCondition", "one condition change created");
			done();
		});

	});

	QUnit.module("AdaptationController p13n container creation", {
		beforeEach: function() {
			this.oAdaptationController = new AdaptationController(
				{
					stateRetriever: function() {
						return {};
					}
				}
			);
			this.oAdaptationController.sP13nType = "Item";
			this.oAdaptationController.setItemConfig({
				containerSettings: {
					title: "Test"
				},
				adaptationUI: new BasePanel()
			});
		},
		afterEach: function() {
			this.oAdaptationController.destroy();
			this.oAdaptationController = null;
		}
	});

	QUnit.test("call _createPopover - check vertical scrolling", function(assert) {
		var done = assert.async();

		this.oAdaptationController.sP13nType = "Item";

		this.oAdaptationController._createPopover(new BasePanel()).then(function(oPopover){
			var bVerticalScrolling = oPopover.getVerticalScrolling();

			assert.ok(bVerticalScrolling, "Popover has been created with verticalScrolling set to true");
			assert.ok(oPopover.isA("sap.m.ResponsivePopover"));

			oPopover.destroy();
			done();
		});
	});

	QUnit.test("check live vertical scrolling", function(assert){
		var done = assert.async();
		this.oAdaptationController.setLiveMode(true);

		this.oAdaptationController._createP13nContainer(new BasePanel()).then(function(oContainer){
			assert.ok(oContainer.isA("sap.m.ResponsivePopover"), "Popover in liveMode");
			assert.ok(oContainer.getVerticalScrolling(), "Vertical Scrolling true by default");
			oContainer.destroy();
			done();
		});
	});

	QUnit.test("check modal vertical scrolling", function(assert){
		var done = assert.async();
		this.oAdaptationController.setLiveMode(false);

		this.oAdaptationController._createP13nContainer(new BasePanel()).then(function(oContainer){
			assert.ok(oContainer.isA("sap.m.Dialog"), "Dialog in non-liveMode");
			assert.ok(oContainer.getVerticalScrolling(), "Vertical Scrolling true by default");
			oContainer.destroy();
			done();
		});
	});

	QUnit.test("check container settings derivation in liveMode", function(assert){
		var done = assert.async();
		this.oAdaptationController.setLiveMode(true);
		this.oAdaptationController.setItemConfig({
			containerSettings: {
				verticalScrolling: false,
				title: "Some Title"
			}
		});

		this.oAdaptationController._createP13nContainer(new BasePanel()).then(function(oContainer){
			assert.ok(!oContainer.getVerticalScrolling(), "Vertical Scrolling overwritten by config in liveMode");
			assert.equal(oContainer.getTitle(), "Some Title", "Correct title provided");
			oContainer.destroy();
			done();
		});
	});

	QUnit.test("check container settings derivation in non-liveMode", function(assert){
		var done = assert.async();
		this.oAdaptationController.setLiveMode(true);
		this.oAdaptationController.setItemConfig({
			containerSettings: {
				verticalScrolling: false,
				title: "Some Title"
			}
		});

		this.oAdaptationController._createP13nContainer(new BasePanel()).then(function(oContainer){
			assert.ok(!oContainer.getVerticalScrolling(), "Vertical Scrolling overwritten by config in liveMode");
			assert.equal(oContainer.getTitle(), "Some Title", "Correct title provided");
			oContainer.destroy();
			done();
		});
	});

	QUnit.test("check bIsDialogOpen - should be set to true from start", function(assert){
		var done = assert.async();

		this.oAdaptationController.setAdaptationControl(new Table());

		this.oAdaptationController.showP13n(this, "Item").then(function(oP13nControl){
			oP13nControl.getButtons()[1].firePress();
			oP13nControl.fireAfterClose();
			assert.ok(!this.oAdaptationController.bIsDialogOpen, "bIsDialogOpen has ben reset");
			done();
		}.bind(this));

		assert.ok(this.oAdaptationController.bIsDialogOpen, "Prevent duplicate issues");
	});

	QUnit.test("check title creation - no reset provided", function(assert){
		var done = assert.async();
		this.oAdaptationController.setLiveMode(false);
		this.oAdaptationController.setItemConfig({
			containerSettings: {
				verticalScrolling: false,
				title: "Some Title"
			}
		});

		this.oAdaptationController._createP13nContainer(new BasePanel()).then(function(oContainer){
			assert.ok(!oContainer.getVerticalScrolling(), "Vertical Scrolling overwritten by config in liveMode");
			assert.equal(oContainer.getTitle(), "Some Title", "Correct title provided");
			assert.ok(!oContainer.getCustomHeader(), "No custom header provided if no reset is provided");
			oContainer.destroy();
			done();
		});
	});

	QUnit.test("check title creation - no reset provided", function(assert){
		var done = assert.async();
		this.oAdaptationController.setLiveMode(false);
		this.oAdaptationController.setItemConfig({
			containerSettings: {
				verticalScrolling: false,
				title: "Some Title"
			}
		});

		this.oAdaptationController.setOnReset(function(){
			//Control specific reset handling
		});

		this.oAdaptationController._createP13nContainer(new BasePanel()).then(function(oContainer){
			assert.ok(!oContainer.getVerticalScrolling(), "Vertical Scrolling overwritten by config in liveMode");
			assert.equal(oContainer.getTitle(), "Some Title", "Correct title provided");
			assert.ok(oContainer.getCustomHeader(), "Custom header provided as reset has been providded");
			oContainer.destroy();
			done();
		});
	});

});
