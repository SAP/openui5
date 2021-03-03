/* global QUnit,sinon */
sap.ui.define([
	"sap/ui/mdc/p13n/Engine", "../../QUnitUtils", "sap/ui/mdc/Table", "sap/ui/mdc/TableDelegate",  "sap/m/Button", "sap/ui/mdc/table/Column", "sap/ui/mdc/FilterField", "sap/ui/mdc/p13n/modification/FlexModificationHandler", "test-resources/sap/ui/mdc/qunit/p13n/TestModificationHandler"
], function (Engine, MDCQUnitUtils, Table, TableDelegate, Button, Column, FilterField, FlexModificationHandler, TestModificationHandler) {
	"use strict";
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	QUnit.module("Engine API tests showUI Table", {
        setLiveMode: function(sController, bLiveMode) {
            Engine.getInstance().getController(this.oTable, sController).getLiveMode = function() {
                return bLiveMode;
            };
        },
		beforeEach: function () {
				var aPropertyInfos = [
				{
					"name": "col1",
					"path": "nav/col1",
					"label": "col1",
					"sortable": true,
					"filterable": true,
					"visible": true
				}, {
					"name": "col2",
					"path": "nav/col2",
					"label": "col2",
					"sortable": true,
					"filterable": false,
					"visible": true
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

            MDCQUnitUtils.stubPropertyInfos(this.oTable, aPropertyInfos);

            sinon.stub(TableDelegate,"getFilterDelegate").callsFake(function() {
                return {
                    addItem: function(sPropName, oControl){
                        return Promise.resolve(new FilterField({
                            conditions: "{$filters>/conditions/" + sPropName + "}"
                        }));
                    }
                };
            });
		},
		destroyTestObjects: function() {
            this.oTable.destroy();
            TableDelegate.getFilterDelegate.restore();
			MDCQUnitUtils.restorePropertyInfos(this.oTable);
		}
	});

	QUnit.test("Check 'Engine' subcontroller registration", function(assert) {
        assert.ok(Engine.getInstance().getController(this.oTable, "Column"), "ColumnsController has been registered");
        assert.ok(Engine.getInstance().getController(this.oTable, "Sort"), "SortController has been registered");
        assert.ok(Engine.getInstance().getController(this.oTable, "Filter"), "FilterController has been registered");
	});

	QUnit.test("liveMode true", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
        this.setLiveMode("Column", true);

		Engine.getInstance().showUI(this.oTable, "Column", oBtn).then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.getVerticalScrolling(), "Vertical scrolling is active");
			assert.ok(oP13nControl.isA("sap.m.ResponsivePopover"));
			assert.equal(oP13nControl.getTitle(), oResourceBundle.getText("table.SETTINGS_COLUMN"), "Correct title has been set");
			assert.ok(Engine.getInstance()._hasActiveP13n(this.oTable),"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SelectionPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
			var oPropertyHelper = Engine.getInstance()._getRegistryEntry(this.oTable).helper;
			assert.equal(oInnerTable.getItems().length, oPropertyHelper.getProperties().length, "correct amount of items has been set");
			done();
		}.bind(this));
	});

	QUnit.test("liveMode false", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
		this.setLiveMode("Column", false);

		Engine.getInstance().showUI(this.oTable, "Column", oBtn).then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.isA("sap.m.Dialog"));
			assert.equal(oP13nControl.getTitle(), oResourceBundle.getText("table.SETTINGS_COLUMN"), "Correct title has been set");
			assert.ok(Engine.getInstance()._hasActiveP13n(this.oTable),"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SelectionPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
			var oPropertyHelper = Engine.getInstance()._getRegistryEntry(this.oTable).helper;
			assert.equal(oInnerTable.getItems().length, oPropertyHelper.getProperties().length, "correct amount of items has been set");
			done();
		}.bind(this));
	});

	QUnit.test("open filter dialog", function (assert) {
		var done = assert.async();
		var oBtn = new Button();

		this.oTable.initialized().then(function(){
			this.oTable.retrieveInbuiltFilter().then(function(oP13nFilter){
				Engine.getInstance().showUI(this.oTable, "Filter", oBtn).then(function(oP13nControl){

					//check container
					assert.ok(oP13nControl, "Container has been created");
					assert.ok(oP13nControl.isA("sap.m.Dialog"));
					assert.equal(oP13nControl.getTitle(), oResourceBundle.getText("filter.PERSONALIZATION_DIALOG_TITLE"), "Correct title has been set");
					assert.ok(Engine.getInstance()._hasActiveP13n(this.oTable),"dialog is open");

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
				Engine.getInstance().showUI(this.oTable, "Filter", oBtn).then(function(oP13nControl){
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

		Engine.getInstance().createUI(this.oTable, "Column", aPropertyInfos).then(function(oP13nControl){
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
		Engine.getInstance().showUI(this.oTable, "Column").then(function(oP13nControl){

			//trigger event handler manually --> usually triggered by user interaction
			//user interaction manipulates the inner model of the panel,
			//to mock user interaction we directly act the change on the p13n panel model
			var aItems = Engine.getInstance().getController(this.oTable, "Column").oP13nData.items;
			aItems.pop(); //remove one item to trigger a change

			var oModificationHandler = TestModificationHandler.getInstance();
			oModificationHandler.processChanges = function(aChanges){
				assert.ok(aChanges,"event has been executed");
				assert.equal(aChanges.length, 1, "correct amounf oc changes has been created");

				//check that only required information is present in the change content
				var oChangeContent = aChanges[0].changeSpecificData.content;
				assert.ok(oChangeContent.name);
				assert.ok(!oChangeContent.hasOwnProperty("descending"));
				var oPropertyHelper = Engine.getInstance()._getRegistryEntry(this.oTable).helper;
				assert.equal(oChangeContent.name, oPropertyHelper.getProperties()[1].getName(),
					"The stored key should be equal to the 'name' in property info (NOT PATH!)");
				Engine.getInstance()._setModificationHandler(this.oTable, FlexModificationHandler.getInstance());
				done();
			}.bind(this);
			Engine.getInstance()._setModificationHandler(this.oTable, oModificationHandler);

			Engine.getInstance()._handleChange(this.oTable, "Column", {items: aItems});

		}.bind(this));

	});

	QUnit.test("check with 'Sort'", function (assert) {
		var done = assert.async();
		var oBtn = new Button();

		Engine.getInstance().showUI(this.oTable, "Sort", oBtn).then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.getVerticalScrolling(), "Vertical scrolling is active");
			assert.ok(Engine.getInstance()._hasActiveP13n(this.oTable),"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SortPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
            var oPropertyHelper = Engine.getInstance()._getRegistryEntry(this.oTable).helper;
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

		Engine.getInstance().showUI(this.oTable, "Sort", oBtn).then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(Engine.getInstance()._hasActiveP13n(this.oTable),"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SortPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");

			//-1 non sortable property
			var oPropertyHelper = Engine.getInstance()._getRegistryEntry(this.oTable).helper;
			assert.equal(oInnerTable.getItems().length, oPropertyHelper.getProperties().length - 1, "correct amount of items has been set");
			done();
		}.bind(this));
	});

	QUnit.test("check with 'Columns' +  non visible properties", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
		this.destroyTestObjects();

		var aPropertyInfos = [
			{
				"name": "col1",
				"path": "nav/col1",
				"label": "col1",
				"sortable": false,
				"filterable": true,
				"visible": true
			}, {
				"name": "col2",
				"path": "nav/col2",
				"label": "col2",
				"sortable": true,
				"filterable": false,
				"visible": false //Don't show this column in the UI at all
			}
		];

		this.createTestObjects(aPropertyInfos);

		Engine.getInstance().showUI(this.oTable, "Column", oBtn).then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(Engine.getInstance()._hasActiveP13n(this.oTable),"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SelectionPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");

			//-1 non visible property
			var oPropertyHelper = Engine.getInstance()._getRegistryEntry(this.oTable).helper;
			assert.equal(oInnerTable.getItems().length, oPropertyHelper.getProperties().length - 1, "correct amount of items has been set");
			done();
		}.bind(this));
	});

	QUnit.test("use 'createChanges' to create changes without UI panel (sort)", function (assert) {
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

		Engine.getInstance().createChanges({
            control: this.oTable,
            key: "Sort",
            state: aP13nData,
            suppressAppliance: true
        }).then(function(aChanges){
            assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 1, "one change created");
            assert.equal(aChanges[0].changeSpecificData.changeType, "addSort", "once sort change created");

            //Sort changes should only store 'name' and 'descending' and 'index'
            assert.equal(Object.keys(aChanges[0].changeSpecificData.content).length, 3, "Only name, index + descending persisted");
            assert.ok(aChanges[0].changeSpecificData.content.hasOwnProperty("name"), "Correct attribute persisted");
            assert.ok(aChanges[0].changeSpecificData.content.hasOwnProperty("descending"), "Correct attribute persisted");
            assert.ok(aChanges[0].changeSpecificData.content.hasOwnProperty("index"), "Correct attribute persisted");

			done();
        });

	});

	QUnit.test("use 'createChanges' to create changes without UI panel (create new columns)", function(assert){
		var done = assert.async();

		var aP13nData = [
			{name:"col3", position: 2},
			{name:"col4", position: 3}
		];

		Engine.getInstance().createChanges({
            control: this.oTable,
            key: "Column",
            state: aP13nData,
            suppressAppliance: true
        }).then(function(aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 2, "one change created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "addColumn", "once column change created");
            assert.equal(aChanges[1].changeSpecificData.changeType, "addColumn", "once column change created");

            //addColumn changes should only store 'name' and 'index'
            assert.equal(Object.keys(aChanges[0].changeSpecificData.content).length, 2, "Only name + index persisted");
            assert.ok(aChanges[0].changeSpecificData.content.hasOwnProperty("name"), "Correct attribute persisted");
            assert.ok(aChanges[0].changeSpecificData.content.hasOwnProperty("index"), "Correct attribute persisted");
			done();
		});
	});

	QUnit.test("use 'createChanges' to create changes without UI panel (remove non present column from calculation)", function(assert){
		var done = assert.async();

		var aP13nData = [
			{name:"col3", position: 2},
			{name:"col4", visible: false}// column is not present, so no change should be created
		];

		Engine.getInstance().createChanges({
            control: this.oTable,
            key: "Column",
            state: aP13nData,
            suppressAppliance: true
        }).then(function(aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 1, "one change created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "addColumn", "once column change created");
			done();
		});
	});

	QUnit.test("use 'createChanges' to create changes without UI panel (remove existing column)", function(assert){
		var done = assert.async();

		var aP13nData = [
			{name:"col1", visible: false}
		];

		Engine.getInstance().createChanges({
            control: this.oTable,
            key: "Column",
            state: aP13nData,
            suppressAppliance: true
        }).then(function(aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 1, "one change created");
            assert.equal(aChanges[0].changeSpecificData.changeType, "removeColumn", "once column change created");

            //removeColumn changes should only store 'name'
            assert.ok(aChanges[0].changeSpecificData.content.hasOwnProperty("name"), "Correct attribute persisted");
			done();
		});
	});

	QUnit.test("use 'createChanges' to create changes without UI panel (move existing column)", function(assert){
		var done = assert.async();

		var aP13nData = [
			{name:"col1", position: 1}//position changed
		];

		Engine.getInstance().createChanges({
            control: this.oTable,
            key: "Column",
            state: aP13nData,
            suppressAppliance: true
        }).then(function(aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 1, "one change created");
            assert.equal(aChanges[0].changeSpecificData.changeType, "moveColumn", "once column change created");

            //moveColumn changes should only store 'name' and 'index'
            assert.ok(aChanges[0].changeSpecificData.content.hasOwnProperty("name"), "Correct attribute persisted");
            assert.ok(aChanges[0].changeSpecificData.content.hasOwnProperty("index"), "Correct attribute persisted");
			done();
		});
	});

});