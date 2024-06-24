/* global QUnit, sinon */
sap.ui.define([
	"sap/m/p13n/Engine", "../../QUnitUtils", "sap/ui/core/Lib", "sap/ui/mdc/FilterBarDelegate", "sap/ui/mdc/FilterBar", "sap/ui/mdc/FilterField", "sap/ui/mdc/enums/OperatorName", "test-resources/sap/m/qunit/p13n/TestModificationHandler"
], function (Engine, MDCQUnitUtils, Library, FilterBarDelegate, FilterBar, FilterField, OperatorName, TestModificationHandler) {
	"use strict";
	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

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
					"dataType": "String"
				}, {
					"name": "item2",
					"label": "item2",
					"dataType": "String"
				}, {
					"name": "item3",
					"label": "item3",
					"dataType": "String",
					"required": true
				}, {
					"name": "$search",
					"label": "",
					"dataType": "String"
				},{
					"name": "someHiddenProperty",
					"label": "",
					"dataType": "String",
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
						conditions: "{$filters>/conditions/item1}",
						propertyKey: "item1"
					}),
					new FilterField("item2",{
						label:"item2",
						conditions: "{$filters>/conditions/item2}",
						propertyKey: "item2"
					})
				]
			});
			MDCQUnitUtils.stubPropertyInfos(this.oFilterBar, aPropertyInfos);

			sinon.stub(FilterBarDelegate, "addItem").callsFake(function(sKey, oFilterBar) {
				return Promise.resolve(new FilterField({
					conditions: "{$filters>/conditions/" + sKey + "}",
					propertyKey: sKey
				}));
			});

			return this.oFilterBar.initializedWithMetadata();
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
		const done = assert.async();

		this.setLiveMode("Item", false);

		this.oFilterBar.onAdaptFilters().then(function(oP13nControl){
			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.isA("sap.m.p13n.Popup"));
			assert.ok(!oP13nControl._oPopup.getVerticalScrolling(), "Vertical scrolling is disabled for FilterBarBase 'filterConfig'");
			assert.equal(oP13nControl._oPopup.getCustomHeader().getContentLeft()[0].getText(), oResourceBundle.getText("filterbar.ADAPT_TITLE"), "Correct title has been set");
			assert.ok(Engine.getInstance().hasActiveP13n(this.oFilterBar),"dialog is open");

			//check inner panel
			const oPanel = oP13nControl.getPanels()[0]._oFilterBarLayout.getInner();
			oPanel.switchView(oPanel.LIST_KEY);
			const oInnerTable = oP13nControl.getPanels()[0]._oFilterBarLayout.getInner().getCurrentViewContent()._oListControl;
			assert.ok(oP13nControl.getPanels()[0].isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar"), "Correct P13n UI created");
			assert.ok(oInnerTable, "Inner Table has been created");
			assert.equal(oInnerTable.getItems().length, 3, "Inner Table does not know $search");
			done();

		}.bind(this));

	});

	QUnit.test("PropertyInfo should not take 'hiddenFilter' into account for FilterBar 'Adapt Filters'", function(assert){
		const done = assert.async();

		Engine.getInstance().uimanager.show(this.oFilterBar, "Item").then(function(oP13nControl){
			const oInnerTable = oP13nControl.getContent()[0]._oFilterBarLayout.getInner().getCurrentViewContent()._oListControl;
			assert.equal(oInnerTable.getItems().length, 3, "Inner Table does not know about 'hiddenFilter'");
			done();
		});

	});

	QUnit.test("PropertyInfo 'required' should be respected in 'Adapt Filters' Dialog", function(assert){
		const done = assert.async();

		Engine.getInstance().uimanager.show(this.oFilterBar, "Item").then(function(oP13nControl){
			const oAdaptationFilterBar = oP13nControl.getContent()[0];
			const oAdaptFiltersPanel = oAdaptationFilterBar._oFilterBarLayout.getInner();
			const oInnerTable = oAdaptFiltersPanel.getCurrentViewContent()._oListControl;
			const oLabelThirdItem = oInnerTable.getItems()[2].getCells()[0].getItems()[0];
			assert.ok(oLabelThirdItem.getRequired(), "Required property info has been propagated to the UI");
			done();
		});

	});

	QUnit.test("use AdaptationFilterBar", function (assert) {
		const done = assert.async();

		Engine.getInstance().uimanager.show(this.oFilterBar, "Item").then(function(oP13nControl){

			assert.ok(oP13nControl.isA("sap.m.Dialog"), "Dialog as container created");

			const oP13nFilter = oP13nControl.getContent()[0];
			assert.ok(oP13nFilter.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar"), "P13n FilterBar created for filter UI adaptation");

			const oAdaptFilterPanel = oP13nFilter._oFilterBarLayout.getInner();
			oAdaptFilterPanel.switchView("group");
			assert.ok(oAdaptFilterPanel.isA("sap.ui.mdc.p13n.panels.AdaptFiltersPanel"), "AdaptFiltersPanel as inner layout");

			const oList = oAdaptFilterPanel.getView("group").getContent()._oListControl;
			assert.ok(oList.isA("sap.m.ListBase"), "ListBase control as inner representation");

			const oFirstGroup = oList.getItems()[0];
			assert.ok(oFirstGroup.isA("sap.m.ListItemBase"), "ListItem for group presentation");

			const oFirstGroupList = oFirstGroup.getContent()[0].getContent()[0];
			assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
			assert.equal(oFirstGroupList.getSelectedItems().length, 2, "2 items selected");

			done();

		});
	});

	QUnit.test("check inner model reset", function (assert) {
		const done = assert.async();
		Engine.getInstance().uimanager.show(this.oFilterBar, "Item").then(function(oP13nControl){

			const oP13nFilter = oP13nControl.getContent()[0];
			const oAFPanel = oP13nFilter._oFilterBarLayout.getInner();
			oAFPanel.switchView("group");
			const oList = oAFPanel.getCurrentViewContent()._oListControl;
			const oFirstGroup = oList.getItems()[0];

			//3 items, 2 initially selected
			const oFirstGroupList = oFirstGroup.getContent()[0].getContent()[0];
			assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
			assert.equal(oFirstGroupList.getSelectedItems().length, 2, "2 items selected");

			const oAddaptFiltersController = Engine.getInstance().getController(this.oFilterBar, "Item");
			const aModelItems = oAddaptFiltersController._oPanel.getP13nData().items;
			const aModelItemsGrouped = oAddaptFiltersController._oPanel.getP13nData().itemsGrouped;

			aModelItems[2].visible = true;
			aModelItemsGrouped[0].items[2].visible = true;

			//3 items selected --> mock a model change
			oAFPanel.setP13nData({
				items: aModelItems,
				itemsGrouped: aModelItemsGrouped
			});

			assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
			assert.equal(oFirstGroupList.getSelectedItems().length, 3, "3 items selected");

			const oTestModifier = TestModificationHandler.getInstance();
			oTestModifier.reset = function() {
				return Promise.resolve();
			};
			Engine.getInstance()._setModificationHandler(this.oFilterBar, oTestModifier);

			Engine.getInstance().reset(this.oFilterBar, "Item").then(function(){
				setTimeout(function(){
					//Model has been reset --> initial state recovered in model
					assert.equal(oFirstGroupList.getItems().length, 3, "3 items created");
					assert.equal(oFirstGroupList.getSelectedItems().length, 2, "2 items selected");
					done();
				});
			});

		}.bind(this));
	});

	QUnit.test("create condition changes via 'createChanges'", function(assert){
		const done = assert.async();

		const mConditions = {
			item1: [{operator: OperatorName.EQ, values:["Test"]}],
			item2: [{operator: OperatorName.EQ, values:["Test"]}],
			item3: [{operator: OperatorName.EQ, values:["Test"]}]
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
		const done = assert.async();

		//use Engine with a non existing property
		const mConditions = {
			someNonexistingProperty: [{operator: OperatorName.EQ, values:["Test"]}]
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
		const done = assert.async();

		const mConditions = {
			item1: [{operator: OperatorName.EQ, values:["Test"]}],
			item2: [{operator: OperatorName.EQ, values:["Test"]}],
			item3: [{operator: OperatorName.EQ, values:["Test"]}]
		};

		sinon.stub(this.oFilterBar, "getPropertyInfoSet").returns(this.aPropertyInfos);
		this.oFilterBar.setFilterConditions({item1: [{operator: OperatorName.EQ, values:["Test"]}]});

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
		const done = assert.async();

		const mConditions = {
			item1: [],
			item2: [{operator: OperatorName.EQ, values:["Test"]}],
			item3: [{operator: OperatorName.EQ, values:["Test"]}]
		};

		sinon.stub(this.oFilterBar, "getPropertyInfoSet").returns(this.aPropertyInfos);
		this.oFilterBar.setFilterConditions({item1: [{operator: OperatorName.EQ, values:["Test"]}]});

		Engine.getInstance().createChanges({
			control: this.oFilterBar,
			key: "Filter",
			applyAbsolute: "FullReplace",
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
		const done = assert.async();

		const mConditions = {
			$search: [{operator: OperatorName.EQ, values:["Test"]}]
		};

		sinon.stub(this.oFilterBar, "getPropertyInfoSet").returns(this.aPropertyInfos);
		this.oFilterBar.setFilterConditions({item1: [{operator: OperatorName.EQ, values:["Test"]}]});

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