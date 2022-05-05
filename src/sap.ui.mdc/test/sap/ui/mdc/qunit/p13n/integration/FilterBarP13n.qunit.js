/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/p13n/Engine", "../../QUnitUtils", "sap/ui/mdc/FilterBarDelegate", "sap/ui/mdc/FilterBar", "sap/ui/mdc/FilterField", "test-resources/sap/ui/mdc/qunit/p13n/TestModificationHandler", "sap/ui/core/Core"
], function (Engine, MDCQUnitUtils, FilterBarDelegate, FilterBar, FilterField, TestModificationHandler, oCore) {
	"use strict";
	var oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

	QUnit.module("Engine API tests showUI FilterBar", {
		setLiveMode: function(sController, bLiveMode) {
			Engine.getInstance().getController(this.oFilterBar, sController).getLiveMode = function() {
				return bLiveMode;
			};
		},
		beforeEach: function () {
			this.aPropertyInfos = [
				{
					"name": "item1",
					"label": "item1",
					"typeConfig": { className: "Edm.String"}
				}, {
					"name": "item2",
					"label": "item2",
					"typeConfig": { className: "Edm.String"}
				}, {
					"name": "item3",
					"label": "item3",
					"typeConfig": { className: "Edm.String"},
					"required": true
				}, {
					"name": "$search",
					"typeConfig": { className: "Edm.String"}
				},{
					"name": "someHiddenProperty",
					"hiddenFilter": true
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
			MDCQUnitUtils.stubPropertyInfos(this.oFilterBar, aPropertyInfos);

			sinon.stub(FilterBarDelegate, "addItem").callsFake(function(sKey, oFilterBar) {
				return Promise.resolve(new FilterField({
					conditions: "{$filters>/conditions/" + sKey + "}"
				}));
			});

			return this.oFilterBar.initialized();
		},
		destroyTestObjects: function() {
			this.oFilterBar.destroy();
			FilterBarDelegate.addItem.restore();
			MDCQUnitUtils.restorePropertyInfos(this.oFilterBar);
		}
	});

	QUnit.test("Check 'Engine' subcontroller registration", function(assert) {
		assert.ok(Engine.getInstance().getController(this.oFilterBar, "Item"), "AdaptFiltersController has been registered");
		assert.ok(Engine.getInstance().getController(this.oFilterBar, "Filter"), "FilterController has been registered");
	});


	QUnit.test("PropertyInfo should not take $search into account for FilterBar", function(assert){
		var done = assert.async();

		this.setLiveMode("Item", false);

		Engine.getInstance().uimanager.show(this.oFilterBar, "Item").then(function(oP13nControl){
			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.isA("sap.m.Dialog"));
			assert.ok(!oP13nControl.getVerticalScrolling(), "Vertical scrolling is disabled for FilterBarBase 'filterConfig'");
			assert.equal(oP13nControl.getCustomHeader().getContentLeft()[0].getText(), oResourceBundle.getText("filterbar.ADAPT_TITLE"), "Correct title has been set");
			assert.ok(Engine.getInstance().hasActiveP13n(this.oFilterBar),"dialog is open");

			//check inner panel
			var oPanel = oP13nControl.getContent()[0]._oFilterBarLayout.getInner();
			oPanel.switchView(oPanel.LIST_KEY);
			var oInnerTable = oP13nControl.getContent()[0]._oFilterBarLayout.getInner().getCurrentViewContent()._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar"), "Correct P13n UI created");
			assert.ok(oInnerTable, "Inner Table has been created");
			assert.equal(oInnerTable.getItems().length, 3, "Inner Table does not know $search");
			done();

		}.bind(this));

	});

	QUnit.test("PropertyInfo should not take 'hiddenFilter' into account for FilterBar 'Adapt Filters'", function(assert){
		var done = assert.async();

		Engine.getInstance().uimanager.show(this.oFilterBar, "Item").then(function(oP13nControl){
			var oInnerTable = oP13nControl.getContent()[0]._oFilterBarLayout.getInner().getCurrentViewContent()._oListControl;
			assert.equal(oInnerTable.getItems().length, 3, "Inner Table does not know about 'hiddenFilter'");
			done();
		});

	});

	QUnit.test("PropertyInfo 'required' should be respected in 'Adapt Filters' Dialog", function(assert){
		var done = assert.async();

		Engine.getInstance().uimanager.show(this.oFilterBar, "Item").then(function(oP13nControl){
			var oAdaptationFilterBar = oP13nControl.getContent()[0];
			var oAdaptFiltersPanel = oAdaptationFilterBar._oFilterBarLayout.getInner();
			var oInnerTable = oAdaptFiltersPanel.getCurrentViewContent()._oListControl;
			var oLabelThirdItem = oInnerTable.getItems()[2].getCells()[0].getItems()[0];
			assert.ok(oLabelThirdItem.getRequired(), "Required property info has been propagated to the UI");
			done();
		});

	});

	QUnit.test("use AdaptationFilterBar", function (assert) {
		var done = assert.async();

		Engine.getInstance().uimanager.show(this.oFilterBar, "Item").then(function(oP13nControl){

			assert.ok(oP13nControl.isA("sap.m.Dialog"), "Dialog as container created");

			var oP13nFilter = oP13nControl.getContent()[0];
			assert.ok(oP13nFilter.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar"), "P13n FilterBar created for filter UI adaptation");

			var oAdaptFilterPanel = oP13nFilter._oFilterBarLayout.getInner();
			oAdaptFilterPanel.switchView("group");
			assert.ok(oAdaptFilterPanel.isA("sap.ui.mdc.p13n.panels.AdaptFiltersPanel"), "AdaptFiltersPanel as inner layout");

			var oList = oAdaptFilterPanel.getView("group").getContent()._oListControl;
			assert.ok(oList.isA("sap.m.ListBase"), "ListBase control as inner representation");

			var oFirstGroup = oList.getItems()[0];
			assert.ok(oFirstGroup.isA("sap.m.ListItemBase"), "ListItem for group presentation");

			var oFirstGroupList = oFirstGroup.getContent()[0].getContent()[0];
			assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
			assert.equal(oFirstGroupList.getSelectedItems().length, 2, "2 items selected");

			done();

		});
	});

	QUnit.test("check inner model reset", function (assert) {
		var done = assert.async();
		Engine.getInstance().uimanager.show(this.oFilterBar, "Item").then(function(oP13nControl){

			var oP13nFilter = oP13nControl.getContent()[0];
			var oAFPanel = oP13nFilter._oFilterBarLayout.getInner();
			oAFPanel.switchView("group");
			var oList = oAFPanel.getCurrentViewContent()._oListControl;
			var oFirstGroup = oList.getItems()[0];

			//3 items, 2 initially selected
			var oFirstGroupList = oFirstGroup.getContent()[0].getContent()[0];
			assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
			assert.equal(oFirstGroupList.getSelectedItems().length, 2, "2 items selected");

			var oAddaptFiltersController = Engine.getInstance().getController(this.oFilterBar, "Item");
			var aModelItems = oAddaptFiltersController._oAdaptationModel.getData().items;
			var aModelItemsGrouped = oAddaptFiltersController._oAdaptationModel.getData().itemsGrouped;

			aModelItems[2].visible = true;
			aModelItemsGrouped[0].items[2].visible = true;

			//3 items selected --> mock a model change
			oAFPanel.setP13nData({
				items: aModelItems,
				itemsGrouped: aModelItemsGrouped
			});

			assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
			assert.equal(oFirstGroupList.getSelectedItems().length, 3, "3 items selected");

			var oTestModifier = TestModificationHandler.getInstance();
			oTestModifier.reset = function() {
				return Promise.resolve();
			};
			Engine.getInstance()._setModificationHandler(this.oFilterBar, oTestModifier);

			Engine.getInstance().reset(this.oFilterBar, "Item").then(function(){
				//Model has been reset --> initial state recovered in model
				assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
				assert.equal(oFirstGroupList.getSelectedItems().length, 2, "2 items selected");
				done();
			});

		}.bind(this));
	});

	QUnit.test("create condition changes via 'createChanges'", function(assert){
		var done = assert.async();

		var mConditions = {
			item1: [{operator: "EQ", values:["Test"]}],
			item2: [{operator: "EQ", values:["Test"]}],
			item3: [{operator: "EQ", values:["Test"]}]
		};

        sinon.stub(Engine.getInstance(), '_processChanges').callsFake(function fakeFn(vControl, aChanges) {
			return Promise.resolve(aChanges);
        });

		Engine.getInstance().createChanges({
			control: this.oFilterBar,
			key: "Filter",
			state: mConditions
		}).then(function(aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 3, "three changes created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "addCondition", "one condition change created");
			assert.equal(aChanges[1].changeSpecificData.changeType, "addCondition", "one condition change created");
			assert.equal(aChanges[2].changeSpecificData.changeType, "addCondition", "one condition change created");
			done();
		});

	});


	QUnit.test("Engine/FilterBar should not crash for non present properties", function(assert){
		var done = assert.async();

		//use Engine with a non existing property
		var mConditions = {
			someNonexistingProperty: [{operator: "EQ", values:["Test"]}]
		};

		Engine.getInstance().createChanges({
			control: this.oFilterBar,
			key: "Filter",
			state: mConditions
		}).then(function(aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 0, "no change created as the property is not defined in the PropertyInfo");
			done();
		});

	});

	QUnit.test("create condition changes via 'createChanges' with initial filterConditions", function(assert){
		var done = assert.async();

		var mConditions = {
			item1: [{operator: "EQ", values:["Test"]}],
			item2: [{operator: "EQ", values:["Test"]}],
			item3: [{operator: "EQ", values:["Test"]}]
		};

		sinon.stub(this.oFilterBar, "getPropertyInfoSet").returns(this.aPropertyInfos);
		this.oFilterBar.setFilterConditions({item1: [{operator: "EQ", values:["Test"]}]});

		Engine.getInstance().createChanges({
			control: this.oFilterBar,
			key: "Filter",
			state: mConditions
		}).then(function(aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 2, "two changes created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "addCondition", "one condition change created"); // item1
			assert.equal(aChanges[1].changeSpecificData.changeType, "addCondition", "one condition change created"); // item2
			done();
		});

	});

	QUnit.test("create condition changes via 'createChanges' with initial filterConditions", function(assert){
		var done = assert.async();

		var mConditions = {
			item1: [],
			item2: [{operator: "EQ", values:["Test"]}],
			item3: [{operator: "EQ", values:["Test"]}]
		};

		sinon.stub(this.oFilterBar, "getPropertyInfoSet").returns(this.aPropertyInfos);
		this.oFilterBar.setFilterConditions({item1: [{operator: "EQ", values:["Test"]}]});

		Engine.getInstance().createChanges({
			control: this.oFilterBar,
			key: "Filter",
			state: mConditions
		}).then(function(aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 3, "three changes created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "removeCondition", "one condition change created");
			assert.equal(aChanges[1].changeSpecificData.changeType, "addCondition", "one condition change created");
			assert.equal(aChanges[2].changeSpecificData.changeType, "addCondition", "one condition change created");
			done();
		});

	});

	QUnit.test("create condition changes via 'createChanges' and always consider $search", function(assert){
		var done = assert.async();

		var mConditions = {
			$search: [{operator: "EQ", values:["Test"]}]
		};

		sinon.stub(this.oFilterBar, "getPropertyInfoSet").returns(this.aPropertyInfos);
		this.oFilterBar.setFilterConditions({item1: [{operator: "EQ", values:["Test"]}]});

		Engine.getInstance().createChanges({
			control: this.oFilterBar,
			key: "Filter",
			state: mConditions
		}).then(function(aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 1, "one changes created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "addCondition", "one condition change created");
			done();
		});

	});

});