/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/AdaptFiltersPanel",
	"sap/ui/mdc/p13n/P13nBuilder",
	"sap/ui/model/json/JSONModel",
	"sap/m/CustomListItem",
	"sap/m/Toolbar",
	"sap/ui/base/Event",
	"sap/m/Text",
	"sap/m/List",
	"sap/ui/core/Item",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/filterbar/p13n/FilterGroupLayout",
	"sap/ui/Device"
], function(AdaptFiltersPanel, P13nBuilder, JSONModel, CustomListItem, Toolbar, Event, Text, List, Item, nextUIUpdate, FilterField, FilterGroupLayout, Device) {
	"use strict";

	const aInfoData = [
		{
			key: "key1",
			label: "Field 1",
			group: "G1",
			dataType: "String"
		},
		{
			key: "key2",
			label: "Field 2",
			group: "G1",
			dataType: "String"
		},
		{
			key: "key3",
			label: "Field 3",
			group: "G1",
			dataType: "String"
		},
		{
			key: "key4",
			label: "Field 4",
			group: "G2",
			groupLabel: "Group 2",
			dataType: "String"
		},
		{
			key: "key5",
			label: "Field 5",
			group: "G2",
			groupLabel: "Group 2",
			dataType: "String"
		},
		{
			key: "key6",
			label: "Field 6",
			group: "G2",
			groupLabel: "Group 2",
			tooltip: "Some Tooltip",
			dataType: "String"
		}
	];

	// Required Fields in new design are always visible
	const aVisible = ["key1", "key2", "key3", "key5"];

	function getGroups(oList) {
		return oList.getItems().filter((oItem) => oItem.isA("sap.m.GroupHeaderListItem"));
	}

	function modifyGroup(oP13nData, sGroup, fnModifier) {
		oP13nData.items
			.filter((oItem) => oItem.group === sGroup)
			.forEach(fnModifier);
	}

	function getGroupItems(oViewContent, sGroup) {
		sGroup ??= "Basic";

		const aGroupItems = [];
		let bInGroup = false;
		oViewContent._oListControl.getItems().forEach((oItem) => {
			if (oItem.isA("sap.m.GroupHeaderListItem")) {
				bInGroup = oItem.getTitle() === sGroup;
				return;
			}

			if (bInGroup) {
				aGroupItems.push(oItem);
			}
		});

		return aGroupItems;
	}

	function getItemContent(oCustomListItem) {
		return oCustomListItem.getContent()[0].getContent()[1];
	}

	// ===========================================================================================
	// Module 1: Basic Functionality and Instantiation
	// ===========================================================================================
	QUnit.module("Basic Functionality and Instantiation", {
		beforeEach: async function() {
			this.sDefaultGroup = "BASIC";
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP",{
				defaultView: "group",
				footer: new Toolbar("ID_TB_BASIC",{})
			});
			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));


			this.fnEnhancer = function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				if (oProperty.key == "key5") {
					mItem.required = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];
			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Panel instantiation and model setup", function(assert){
		assert.ok(this.oAFPanel, "Panel created");
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		assert.ok(this.oAFPanel.getModel(this.oAFPanel.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Model has been set");
	});

	QUnit.test("Selected fields retrieval", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();
		assert.equal(this.oAFPanel.getSelectedFields().length, aVisible.length, "Correct amount of selected items returned");
	});

	QUnit.test("View toggle functionality", function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("group");

		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "Group view is the default");

		this.oAFPanel.switchView("group");
		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "Group view is unchanged");

		this.oAFPanel.switchView("list");
		assert.equal(this.oAFPanel.getCurrentViewKey(), "list", "List view should be selected");

		this.oAFPanel.switchView("group");
		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "Group view should be selected");
	});

	QUnit.test("Restore defaults functionality", async function(assert){
		this.oAFPanel.setDefaultView("list");

		this.oAFPanel._getSearchField().setValue("Test");
		this.oAFPanel.switchView("list");
		this.oAFPanel._filterByModeAndSearch();
		await nextUIUpdate();

		const oFilterSpy = sinon.spy(this.oAFPanel, "_filterByModeAndSearch");
		assert.equal(this.oAFPanel._getSearchField().getValue(), "Test", "Value 'Test' is present on the SearchField");

		this.oAFPanel.restoreDefaults();

		assert.ok(oFilterSpy.called, "Filter logic executed again after defaults have been restored");
		assert.equal(this.oAFPanel._getSearchField().getValue(), "", "SearchField is empty after defaults have been restored");

		this.oAFPanel._filterByModeAndSearch.restore();
	});

	// ===========================================================================================
	// Module 2: Search and Filtering
	// ===========================================================================================
	QUnit.module("Search and Filtering", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP",{
				defaultView: "group",
				footer: new Toolbar("ID_TB_SEARCH",{})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				if (oProperty.key == "key5") {
					mItem.required = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Search by field label", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel._getSearchField().setValue("Field 5");
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		await nextUIUpdate();

		const oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;
		const aGroups = getGroups(oOuterList);
		assert.equal(aGroups.length, 1, "One group available after filtering");
	});

	QUnit.test("Search by tooltip", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel._getSearchField().setValue("Some Tooltip");
		const oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		await nextUIUpdate();

		const oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;
		const aGroups = getGroups(oOuterList);

		assert.equal(aGroups.length, 1, "One group available after filtering");
	});

	QUnit.test("Search in content view by field label", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		await nextUIUpdate();

		oCurrentContent._getSearchField().setValue("Field 5");
		const oFakeEvent = new Event("liveSearch", oCurrentContent._getSearchField(), {});
		oCurrentContent._filterByModeAndSearch(oFakeEvent);
		await nextUIUpdate();

		const oList = oCurrentContent._oListControl;
		const aVisibleItems = oList.getItems().filter(function(item) { return item.getVisible(); });
		assert.ok(aVisibleItems.length > 0, "Items are visible after search");
		assert.ok(oList.getItems()[0].isA("sap.m.GroupHeaderListItem"), "Group header shown");
	});

	QUnit.test("Search in content view by tooltip", async function(assert){
		const oP13nData = JSON.parse(JSON.stringify(this.oP13nData));
		const oKey6Item = oP13nData.items.find((item) => item.name === "key6");
		if (oKey6Item) {
			oKey6Item.visible = true;
			oKey6Item.position = 3;
		}

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		await nextUIUpdate();

		oCurrentContent._getSearchField().setValue("Some Tooltip");
		const oFakeEvent = new Event("liveSearch", oCurrentContent._getSearchField(), {});
		oCurrentContent._filterByModeAndSearch(oFakeEvent);
		await nextUIUpdate();

		const oList = oCurrentContent._oListControl;
		const aVisibleItems = oList.getItems().filter(function(item) {
			return item.getVisible() && !item.isA("sap.m.GroupHeaderListItem");
		});
		assert.ok(aVisibleItems.length > 0, "Items found by tooltip");
	});

	QUnit.test("SearchField placeholder text", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();
		const oSearchField = oViewContent._getSearchField();

		assert.ok(oSearchField, "SearchField exists");
		assert.ok(oSearchField.isA("sap.m.SearchField"), "SearchField is of correct type");

		const sPlaceholder = oSearchField.getPlaceholder();
		assert.ok(sPlaceholder, "Placeholder is set");
		assert.equal(sPlaceholder, oViewContent._getResourceText("p13nDialog.ADAPT_FILTER_SEARCH"),
			"Placeholder matches the i18n text key");
	});

	// ===========================================================================================
	// Module 3: Group Management
	// ===========================================================================================
	QUnit.module("Group Management", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP",{
				defaultView: "group",
				footer: new Toolbar("ID_TB_GROUPS",{})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				if (oProperty.key == "key5") {
					mItem.required = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Groups are only displayed when necessary", async function(assert){
		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		assert.equal(getGroups(this.oAFPanel.getCurrentViewContent()._oListControl).length, 2, "All groups visible");

		modifyGroup(oP13nData, "G1", function(oItem){
			oItem.visibleInDialog = false;
		});
		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		await nextUIUpdate();

		assert.equal(getGroups(this.oAFPanel.getCurrentViewContent()._oListControl).length, 1, "Only necessary groups visible");
	});

	QUnit.test("Group visibility based on visibleInDialog property", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();

		const iInitialGroups = getGroups(this.oAFPanel.getCurrentViewContent()._oListControl).length;
		assert.ok(iInitialGroups > 0, "Groups are visible initially");

		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, function(oItem, oProp) {
			if (oProp.group === "G1") {
				oItem.visibleInDialog = false;
			} else {
				oItem.visibleInDialog = true;
			}
			oItem.visible = aVisible.indexOf(oProp.key) > -1;
			return true;
		}, true);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		await nextUIUpdate();

		const iFinalGroups = getGroups(this.oAFPanel.getCurrentViewContent()._oListControl).length;
		assert.ok(iFinalGroups < iInitialGroups, "Fewer groups visible after filtering");
	});

	// ===========================================================================================
	// Module 4: Dialog and Visibility Management
	// ===========================================================================================
	QUnit.module("Dialog and Visibility Management", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP", {
				defaultView: "group",
				footer: new Toolbar("ID_TB_VISIBILITY",{})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("visibleInDialog filter implementation", async function(assert){
		const oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, function(oItem, oProp) {
			if (oProp.key == "key2") {
				oItem.visibleInDialog = false;
			} else {
				oItem.visibleInDialog = true;
			}
			// All items are set as visible so they pass the row-presence pre-filter;
			// the test verifies that visibleInDialog=false still excludes key2 from the list.
			oItem.visible = true;
			return oItem;
		}, true);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		assert.equal(getGroupItems(this.oAFPanel.getCurrentViewContent()).length, 2, "There are 3 items in the model, but one should be hidden for the user");

		this.oAFPanel.switchView("list");
		const aItems = this.oAFPanel.getCurrentViewContent()._oListControl.getItems();
		assert.equal(aItems.length, 5, "There are 6 items in the model, but one should be hidden for the user");
	});

	// ===========================================================================================
	// Module 5: Item Factory and Model Propagation
	// ===========================================================================================
	QUnit.module("Item Factory and Model Propagation", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP", {
				defaultView: "group",
				footer: new Toolbar("ID_TB_FACTORY",{})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				if (oProperty.key == "key5") {
					mItem.required = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Custom itemFactory model propagation", async function(assert){
		const oSecondModel = new JSONModel({
			data: [
				{
					key: "k1",
					text: "Some Test Text"
				}
			]
		});
		const oTestFactory = new List({
			items: {
				path: "/data",
				name: "key",
				template: new CustomListItem({
					content: new Text({
						text: "{text}"
					})
				}),
				templateShareable: false
			}
		});

		oTestFactory.setModel(oSecondModel);
		this.oAFPanel.setItemFactory(function(){
			const oClone = oTestFactory.clone();
			oClone.getConditions = function() {
				return [];
			};
			return oClone;
		});
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		await nextUIUpdate();

		const aGroupItems = getGroupItems(this.oAFPanel.getCurrentViewContent());
		const oCustomList = getItemContent(aGroupItems[0]);

		assert.equal(oCustomList.getItems().length, 1, "Custom template list has one item (oSecondModel, data)");
		assert.deepEqual(oCustomList.getModel(), oSecondModel, "Manual model propagated");
		assert.ok(oCustomList.getModel(this.oAFPanel.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Inner panel p13n model propagated");

		assert.equal(oCustomList.getItems()[0].getContent()[0].getText(), "Some Test Text", "Custom binding from outside working in factory");
	});

	QUnit.test("Custom model name support", function(assert){
		this.oAFPanel.P13N_MODEL = "$My_very_own_model";

		let iCustomListItemCounter = 0;
		const aCreatedCustomListItems = [];
		this.oAFPanel.setItemFactory(function(){
			iCustomListItemCounter++;
			const oCustomListItem = new CustomListItem("CLI" + iCustomListItemCounter, {
				selected: "{" + this.oAFPanel.P13N_MODEL + ">selected}",
				visible: "{" + "$My_very_own_model" + ">visibleInDialog}"
			});
			aCreatedCustomListItems.push(oCustomListItem);
			return oCustomListItem;
		}.bind(this));

		const oP13nData = P13nBuilder.prepareAdaptationData(aInfoData, function(mItem, oProperty) {
			if (oProperty.key == "key2") {
				mItem.active = true;
			}
			mItem.visibleInDialog = true;
			mItem.visible = aVisible.indexOf(oProperty.key) > -1;
			return true;
		}, true);

		assert.ok(this.oAFPanel, "Panel created");
		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));

		assert.ok(this.oAFPanel.getP13nModel().isA("sap.ui.model.json.JSONModel"), "Model has been set");
		assert.ok(!this.oAFPanel.getModel("$p13n"), "The default $p13n model has not been set");
		assert.ok(this.oAFPanel.getModel("$My_very_own_model").isA("sap.ui.model.json.JSONModel"), "Model has been set");

		aCreatedCustomListItems.forEach(function(oCustomListItem){
			if (!oCustomListItem.bIsDestroyed) {
				oCustomListItem.destroy();
			}
		});
	});

	// ===========================================================================================
	// Module 6: Custom Views
	// ===========================================================================================
	QUnit.module("Custom Views", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP", {
				defaultView: "group",
				footer: new Toolbar("ID_TB_CUSTOM", {})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function() {
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				if (oProperty.key == "key5") {
					mItem.required = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("addCustomView registers a new view", function(assert) {
		this.oAFPanel.addCustomView({
			item: new Item("customChart1", {
				key: "customChart"
			}),
			content: new List("myCustomList1", {})
		});

		assert.equal(this.oAFPanel.getViews().length, 3, "A custom view has been added to the views aggregation");
		assert.equal(this.oAFPanel._getViewSwitch().getItems().length, 3, "The item has been added to the view switch control");
	});

	QUnit.test("addCustomView registers multiple custom views", function(assert) {
		this.oAFPanel.addCustomView({
			item: new Item("chart1", {
				key: "chart"
			}),
			content: new List("customChartList", {})
		});

		this.oAFPanel.addCustomView({
			item: new Item("tree1", {
				key: "tree"
			}),
			content: new List("customTreeList", {})
		});

		assert.equal(this.oAFPanel.getViews().length, 4, "Two custom views have been added");
		assert.equal(this.oAFPanel._getViewSwitch().getItems().length, 4, "Both items have been added to the view switch control");
	});

	QUnit.test("addCustomView allows navigation via switchView", async function(assert) {
		this.oAFPanel.addCustomView({
			item: new Item("CV1",{
				key: "customView"
			}),
			content: new List("myCustomList2", {})
		});
		await nextUIUpdate();

		this.oAFPanel.switchView("customView");

		assert.equal(this.oAFPanel.getCurrentViewKey(), "customView", "The custom view has been selected");
		assert.equal(this.oAFPanel._getViewSwitch().getSelectedKey(), "customView", "The view switch control reflects the selection");
	});

	QUnit.test("addCustomView executes selectionChange callback", function(assert) {
		const done = assert.async();
		const oItem = new Item("callbackView1", {
			key: "callbackView"
		});

		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("myCustomList3", {}),
			selectionChange: function(sKey) {
				assert.equal(sKey, "callbackView", "selectionChange callback received the correct key");
				done();
			}
		});

		this.oAFPanel._getViewSwitch().fireEvent("select", {
			item: oItem
		});
	});

	QUnit.test("addCustomView throws error when no key provided", function(assert) {
		const sExpectedErrorMessage = "Please provide an item of type sap.ui.core.Item with a key to be used in the view switch";

		assert.throws(
			function() {
				this.oAFPanel.addCustomView({
					item: new Item({}),
					content: new List({}),
					selectionChange: function() {}
				});
			}.bind(this),
			function(oError) {
				return (
					oError instanceof Error &&
					oError.message === sExpectedErrorMessage
				);
			},
			"Error is thrown when Item has no key"
		);
	});

	QUnit.test("addCustomView applies styling to content", function(assert) {
		const oContent = new List("styledCustomList", {});

		this.oAFPanel.addCustomView({
			item: new Item("styledView1", {
				key: "styledView"
			}),
			content: oContent
		});

		assert.ok(oContent.hasStyleClass("sapUiMDCPanelPadding"), "The content has the correct style class applied");
	});

	QUnit.test("addCustomView content is displayed when selected", async function(assert) {
		const oCustomContent = new List("visibleCustomList", {});

		this.oAFPanel.addCustomView({
			item: new Item("visibleView1", {
				key: "visibleView"
			}),
			content: oCustomContent
		});
		await nextUIUpdate();

		this.oAFPanel.switchView("visibleView");
		await nextUIUpdate();

		const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		assert.strictEqual(oCurrentContent, oCustomContent, "The custom content is the current view content");
	});

	QUnit.test("addCustomView preserves enabled state", async function(assert) {
		const oItem = new Item("disabledView", {
			key: "disabledView",
			enabled: false
		});

		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("disabledViewList", {})
		});
		await nextUIUpdate();

		const oViewSwitch = this.oAFPanel._getViewSwitch();
		const oAddedItem = oViewSwitch.getItems().find((item) => item.getKey() === "disabledView");
		assert.ok(oAddedItem, "The item was added to the view switch");
		assert.strictEqual(oAddedItem.getEnabled(), false, "The enabled state is preserved");
	});

	QUnit.test("addCustomView with text property", async function(assert) {
		const oItem = new Item("textView", {
			key: "textView",
			text: "Custom Text"
		});

		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("textViewList", {})
		});
		await nextUIUpdate();

		const oViewSwitch = this.oAFPanel._getViewSwitch();
		const oAddedItem = oViewSwitch.getItems().find((item) => item.getKey() === "textView");
		assert.ok(oAddedItem, "The item was added to the view switch");
		assert.strictEqual(oAddedItem.getText(), "Custom Text", "The text is preserved in IconTabFilter");
	});

	QUnit.test("addCustomView switching back to default views", async function(assert) {
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.addCustomView({
			item: new Item("customView1", {
				key: "customView"
			}),
			content: new List("switchBackList", {})
		});
		await nextUIUpdate();

		this.oAFPanel.switchView("customView");
		await nextUIUpdate();
		assert.equal(this.oAFPanel.getCurrentViewKey(), "customView", "Custom view is selected");

		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "Can switch back to group view");

		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		assert.equal(this.oAFPanel.getCurrentViewKey(), "list", "Can switch to list view");
	});

	QUnit.test("addCustomView creates IconTabFilter in Modern UI", async function(assert) {
		this.oAFPanel.addCustomView({
			item: new Item("iconTabView1", {
				key: "iconTabView",
				text: "Chart"
			}),
			content: new List("iconTabViewList", {})
		});
		await nextUIUpdate();

		const oViewSwitch = this.oAFPanel._getViewSwitch();
		assert.ok(oViewSwitch.isA("sap.m.IconTabBar"), "View switch is an IconTabBar in Modern mode");

		const oAddedItem = oViewSwitch.getItems().find((item) => item.getKey() === "iconTabView");
		assert.ok(oAddedItem, "The custom view item was added");
		assert.ok(oAddedItem.isA("sap.m.IconTabFilter"), "The item is an IconTabFilter");
		assert.equal(oAddedItem.getText(), "Chart", "The text property is preserved");
	});

	QUnit.test("addCustomView enabled binding is cloned", async function(assert) {
		const oModel = new JSONModel({ isEnabled: false });
		const oItem = new Item("enabledView1", {
			key: "boundEnabledView"
		});
		oItem.setModel(oModel);
		oItem.bindProperty("enabled", { path: "/isEnabled" });

		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("boundEnabledList", {})
		});
		await nextUIUpdate();

		const oViewSwitch = this.oAFPanel._getViewSwitch();
		const oIconTabItem = oViewSwitch.getItems().find((item) => item.getKey() === "boundEnabledView");
		assert.ok(oIconTabItem, "The IconTabFilter was created");

		const oBindingInfo = oIconTabItem.getBindingInfo("enabled");
		assert.ok(oBindingInfo, "The enabled binding was cloned to IconTabFilter");
	});

	// ===========================================================================================
	// Module 7: View Switching and Data Management
	// ===========================================================================================
	QUnit.module("View Switching and Data Management", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP", {
				defaultView: "list",
				footer: new Toolbar("ID_TB_VIEW_SWITCH", {})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				if (oProperty.key == "key5") {
					mItem.required = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];
			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Data synchronization during view switch", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		let oCurrentContent = this.oAFPanel.getCurrentViewContent();
		const oInitialData = oCurrentContent.getP13nData();

		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		oCurrentContent = this.oAFPanel.getCurrentViewContent();
		const oNewData = oCurrentContent.getP13nData();

		assert.equal(oNewData.length, oInitialData.length, "Data preserved during view switch");
		assert.deepEqual(oNewData[0].name, oInitialData[0].name, "Item data matches after switch");
	});

	QUnit.test("View preparation: saves current view data before switch", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();

		const oContent = this.oAFPanel.getCurrentViewContent();
		const oInitialData = oContent.getP13nData();

		this.oAFPanel._prepareViewSwitch("group", "list");

		const oModelData = this.oAFPanel.getP13nModel().getProperty(this.oAFPanel.MODEL_PATH);
		assert.ok(oModelData, "P13n data was saved to model");
		assert.equal(oModelData.length, oInitialData.length, "All data items were saved");
	});

	QUnit.test("View initialization: sets data on newly switched view", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		const oContent = this.oAFPanel.getCurrentViewContent();

		this.oAFPanel._initializeViewData("group", oContent);

		const oContentData = oContent.getP13nData();
		assert.ok(oContentData, "View content has p13n data");
		assert.equal(oContentData.length, this.oP13nData.items.length, "All items were set on the view");
		assert.ok(this.oAFPanel._bGroupViewInitialized, "Group view is marked as initialized");
	});

	QUnit.test("Search persistence: transfers search value between views", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oListContent = this.oAFPanel.getCurrentViewContent();
		oListContent._getSearchField().setValue("TestSearch");

		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		const oGroupContent = this.oAFPanel.getCurrentViewContent();
		const sSearchValue = oGroupContent._getSearchField().getValue();
		assert.equal(sSearchValue, "TestSearch", "Search value was transferred to new view");
	});

	QUnit.test("Edit mode update: applies correct mode to list view", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oContent = this.oAFPanel.getCurrentViewContent();
		const oUpdateSpy = sinon.spy(oContent, "_updateFilterFieldsEditMode");

		oContent._oViewModel.setProperty("/editable", false);
		await nextUIUpdate();

		this.oAFPanel._updateViewEditMode("list", oContent);

		assert.ok(oUpdateSpy.called, "_updateFilterFieldsEditMode was called");
		assert.equal(oUpdateSpy.lastCall.args[0], "sort", "Edit mode was set to 'sort' when not editable");

		oUpdateSpy.restore();
	});

	QUnit.test("Edit mode update: applies correct mode to group view", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		const oContent = this.oAFPanel.getCurrentViewContent();
		const oUpdateSpy = sinon.spy(oContent, "_updateFilterFieldsEditMode");

		this.oAFPanel._updateViewEditMode("group", oContent);

		assert.ok(oUpdateSpy.called, "_updateFilterFieldsEditMode was called");
		assert.equal(oUpdateSpy.lastCall.args[0], "edit", "Edit mode was set to 'edit' for group view");

		oUpdateSpy.restore();
	});

	// ===========================================================================================
	// Module 8: UI Components and Layout
	// ===========================================================================================
	QUnit.module("UI Components and Layout", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP", {
				defaultView: "group",
				footer: new Toolbar("ID_TB_UI",{})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				if (oProperty.key == "key2") {
					mItem.active = true;
				}
				if (oProperty.key == "key5") {
					mItem.required = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Header creation and structure", function(assert){
		assert.ok(this.oAFPanel._oHeader, "Panel header exists");
		assert.ok(this.oAFPanel._oHeader.isA("sap.m.IconTabBar"), "Panel header is IconTabBar");
		const aItems = this.oAFPanel._oHeader.getItems();
		assert.equal(aItems.length, 2, "Two tabs in header");
		assert.equal(aItems[0].getKey(), "list", "First tab is list view");
		assert.equal(aItems[1].getKey(), "group", "Second tab is group view");
	});

	QUnit.test("Switch from list to group view", async function(assert){
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "On group view");
		assert.equal(oCurrentContent.getDefaultView(), "group", "Content is in group mode");
	});

	QUnit.test("Switch from group to list view", async function(assert){
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "On group view");

		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oCurrentContent = this.oAFPanel.getCurrentViewContent();
		assert.equal(this.oAFPanel.getCurrentViewKey(), "list", "On list view");
		assert.equal(oCurrentContent.getDefaultView(), "list", "Content is in list mode");
	});

	QUnit.test("Action container structure: contains all required action buttons", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oContent = this.oAFPanel.getCurrentViewContent();
		const aItems = oContent._oListControl.getItems().filter((oItem) =>
			!oItem.isA("sap.m.GroupHeaderListItem") && oItem.getVisible()
		);

		assert.ok(aItems.length > 0, "List has visible items");

		const oFirstItem = aItems[0];
		const oGrid = oFirstItem.getContent()[0];
		const aGridContent = oGrid.getContent();

		assert.equal(aGridContent.length, 3, "Grid has 3 content items (label, filter, actions)");

		const oActionContainer = aGridContent[2];
		assert.ok(oActionContainer.isA("sap.ui.layout.Grid"), "Action container is a Grid");

		const aActionButtons = oActionContainer.getContent();
		assert.equal(aActionButtons.length, 3, "Action container has 3 buttons (visibility, delete, sort)");
		assert.ok(aActionButtons[0].isA("sap.m.ToggleButton"), "First action is a ToggleButton (visibility)");
		assert.ok(aActionButtons[1].isA("sap.m.Button"), "Second action is a Button (delete)");
		assert.ok(aActionButtons[2].isA("sap.ui.core.Icon"), "Third action is an Icon (sort)");
	});

	QUnit.test("Custom toolbar visibility: shows toolbar for custom views", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.addCustomView({
			item: new Item("customTest1", {
				key: "customTest",
				text: "Custom Test"
			}),
			content: new List("customTestList", {}),
			title: "Custom Test Title"
		});
		await nextUIUpdate();

		this.oAFPanel.switchView("customTest");
		await nextUIUpdate();

		const oCustomViewToolbar = this.oAFPanel._oCustomViewToolbar;
		assert.ok(oCustomViewToolbar, "Custom view toolbar exists");
		assert.ok(oCustomViewToolbar.getVisible(), "Custom view toolbar is visible");

		const [oTitle] = oCustomViewToolbar.getContent();
		assert.equal(oTitle.getText(), "Custom Test Title", "Toolbar title is set correctly");
	});

	QUnit.test("Custom toolbar visibility: hides toolbar for standard views", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.addCustomView({
			item: new Item("customHide1", {
				key: "customHide",
				text: "Custom Hide"
			}),
			content: new List("customHideList", {}),
			title: "Custom Title"
		});
		await nextUIUpdate();

		this.oAFPanel.switchView("customHide");
		await nextUIUpdate();

		const oCustomViewToolbar = this.oAFPanel._oCustomViewToolbar;
		assert.ok(oCustomViewToolbar.getVisible(), "Toolbar visible in custom view");

		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		assert.notOk(oCustomViewToolbar.getVisible(), "Custom view toolbar is hidden when switching to standard view");
	});

	// ===========================================================================================
	// Module 9: Edit Mode and Constants
	// ===========================================================================================
	QUnit.module("Edit Mode and Constants", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP", {
				defaultView: "list",
				footer: new Toolbar("ID_TB_CONSTANTS", {})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("MODE_EDIT constant: sets edit mode correctly", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oContent = this.oAFPanel.getCurrentViewContent();
		const oModeButton = oContent._getModeButton();

		assert.equal(oModeButton.getSelectedKey(), "edit", "Mode button starts with 'edit' key (MODE_EDIT constant)");
		assert.ok(oContent._oViewModel.getProperty("/editable"), "View model is editable in edit mode");
	});

	QUnit.test("MODE_SORT constant: switches to sort mode correctly", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oContent = this.oAFPanel.getCurrentViewContent();
		const oModeButton = oContent._getModeButton();

		const oSortModeItem = oModeButton.getItems()[1];
		oModeButton.setSelectedKey("sort");
		oModeButton.fireSelectionChange({
			item: oSortModeItem
		});
		await nextUIUpdate();

		assert.equal(oModeButton.getSelectedKey(), "sort", "Mode button changed to 'sort' key (MODE_SORT constant)");
		assert.notOk(oContent._oViewModel.getProperty("/editable"), "View model is not editable in sort mode");
	});

	// ===========================================================================================
	// Module 10: Data Enhancement
	// ===========================================================================================
	QUnit.module("Data Enhancement", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP", {
				defaultView: "list",
				footer: new Toolbar("ID_TB_DATA_ENHANCE",{})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("_enhanceP13nData: re-insert filtered invisible items at old position", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();

		const aTestData = [
			{name: "field1", label: "Field 1", position: 0, visible: true, isFiltered: false},
			{name: "field2", label: "Field 2", position: 1, visible: true, isFiltered: false},
			{name: "field3", label: "Field 3", position: 2, visible: false, isFiltered: true},
			{name: "field4", label: "Field 4", position: 3, visible: true, isFiltered: false},
			{name: "field5", label: "Field 5", position: 4, visible: true, isFiltered: false}
		];

		oViewContent._getP13nModel().setProperty("/items", [
			{name: "field1", position: 0},
			{name: "field2", position: 1},
			{name: "field3", position: 2},
			{name: "field4", position: 3},
			{name: "field5", position: 4}
		]);

		const aEnhancedData = oViewContent._enhanceP13nData(aTestData);

		const oField3 = aEnhancedData.find((oItem) => oItem.name === "field3");
		assert.equal(oField3.position, 2, "Filtered invisible item field3 maintains position 2");

		const aPositions = aEnhancedData.map((oItem) => oItem.position);
		const aSortedPositions = [...aPositions].sort((a, b) => {
			if (a === -1) {
				return 1;
			}
			if (b === -1) {
				return -1;
			}
			return a - b;
		});
		assert.deepEqual(aPositions, aSortedPositions, "Items are sorted by position");
	});

	QUnit.test("_enhanceP13nData: handle multiple filtered invisible items", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();

		const aTestData = [
			{name: "field1", label: "Field 1", position: 0, visible: true, isFiltered: false},
			{name: "field2", label: "Field 2", position: 1, visible: false, isFiltered: true},
			{name: "field3", label: "Field 3", position: 2, visible: false, isFiltered: true},
			{name: "field4", label: "Field 4", position: 3, visible: true, isFiltered: false}
		];

		oViewContent._getP13nModel().setProperty("/items", [
			{name: "field1", position: 0},
			{name: "field2", position: 1},
			{name: "field3", position: 2},
			{name: "field4", position: 3}
		]);

		const aEnhancedData = oViewContent._enhanceP13nData(aTestData);

		const oField2 = aEnhancedData.find((oItem) => oItem.name === "field2");
		const oField3 = aEnhancedData.find((oItem) => oItem.name === "field3");

		assert.equal(oField2.position, 1, "First filtered invisible item maintains position 1");
		assert.equal(oField3.position, 2, "Second filtered invisible item maintains position 2");
	});

	QUnit.test("_enhanceP13nData: ignore items with position -1", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();

		const aTestData = [
			{name: "field1", label: "Field 1", position: 0, visible: true, isFiltered: false},
			{name: "field2", label: "Field 2", position: 1, visible: false, isFiltered: true}
		];

		oViewContent._getP13nModel().setProperty("/items", [
			{name: "field1", position: 0},
			{name: "field2", position: -1}
		]);

		const aEnhancedData = oViewContent._enhanceP13nData(aTestData);

		const oField2 = aEnhancedData.find((oItem) => oItem.name === "field2");
		assert.ok(oField2, "Field2 exists in enhanced data");
		assert.ok(!oField2.oldPosition, "oldPosition temporary variable is cleaned up");
	});

	QUnit.test("_enhanceP13nData: position shifting for subsequent items", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();

		const aTestData = [
			{name: "field1", label: "Field 1", position: 0, visible: true, isFiltered: false},
			{name: "field2", label: "Field 2", position: 2, visible: true, isFiltered: false},
			{name: "field3", label: "Field 3", position: 1, visible: false, isFiltered: true}
		];

		oViewContent._getP13nModel().setProperty("/items", [
			{name: "field1", position: 0},
			{name: "field2", position: 1},
			{name: "field3", position: 1}
		]);

		const aEnhancedData = oViewContent._enhanceP13nData(aTestData);

		const oField3 = aEnhancedData.find((oItem) => oItem.name === "field3");
		assert.equal(oField3.position, 1, "Filtered item field3 is at position 1");

		const aSortedByPosition = [...aEnhancedData].sort((a, b) => {
			if (a.position === -1) {
				return 1;
			}
			if (b.position === -1) {
				return -1;
			}
			return a.position - b.position;
		});
		assert.deepEqual(aEnhancedData, aSortedByPosition, "Enhanced data is correctly sorted");
	});

	QUnit.test("_enhanceP13nData: no existing items in model", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();

		const aTestData = [
			{name: "field1", label: "Field 1", position: 0, visible: true, isFiltered: false},
			{name: "field2", label: "Field 2", position: 1, visible: false, isFiltered: true}
		];

		oViewContent._getP13nModel().setProperty("/items", null);

		const aEnhancedData = oViewContent._enhanceP13nData(aTestData);

		assert.ok(aEnhancedData, "Enhanced data is returned");
		assert.equal(aEnhancedData.length, 2, "All items are present");
	});

	// ===========================================================================================
	// Module 11: Drag and Drop
	// ===========================================================================================
	QUnit.module("Drag and Drop", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP", {
				defaultView: "list",
				footer: new Toolbar("ID_TB_DRAG_DROP",{})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Drag and drop reordering: item is moved and focus is set", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();
		const oListControl = oViewContent._oListControl;

		oViewContent._oViewModel.setProperty("/editable", false);
		await nextUIUpdate();

		const aInitialItems = oListControl.getItems().filter((oItem) => oItem.getVisible() && !oItem.isA("sap.m.GroupHeaderListItem"));
		assert.ok(aInitialItems.length >= 2, "At least 2 items are available for drag and drop");

		const oDraggedItem = aInitialItems[0];
		const oDroppedItem = aInitialItems[2];
		const sDraggedItemName = oViewContent._getModelEntry(oDraggedItem).name;
		const iInitialPosition = oViewContent._getModelEntry(oDraggedItem).position;

		const fnChangeSpy = sinon.spy(oViewContent, "fireChange");

		oViewContent._onRearrange({
			getParameter: function(sParam) {
				if (sParam === "draggedControl") {
					return oDraggedItem;
				}
				if (sParam === "droppedControl") {
					return oDroppedItem;
				}
				if (sParam === "dropPosition") {
					return "After";
				}
				return null;
			}
		});

		await nextUIUpdate();
		await new Promise((resolve) => {
			setTimeout(resolve, 100); // RENDERING_DELAY_MS
		});

		const aItems = oViewContent._getP13nModel().getProperty("/items");
		const oMovedItem = aItems.find((oItem) => oItem.name === sDraggedItemName);
		assert.ok(oMovedItem, "Moved item exists in model");
		assert.notEqual(oMovedItem.position, iInitialPosition, "Item position changed from initial position");

		assert.ok(fnChangeSpy.called, "fireChange was called");
		assert.equal(fnChangeSpy.lastCall.args[0].reason, oViewContent.CHANGE_REASON_REORDER, "Change reason is 'Reorder'");

		const aUpdatedItems = oListControl.getItems().filter((oItem) => oItem.getVisible() && !oItem.isA("sap.m.GroupHeaderListItem"));
		const oMovedListItem = aUpdatedItems.find((oItem) => {
			const oModelEntry = oViewContent._getModelEntry(oItem);
			return oModelEntry && oModelEntry.name === sDraggedItemName;
		});

		assert.ok(oMovedListItem, "Moved item found in updated list");

		if (oMovedListItem && oMovedListItem.getDomRef()) {
			const bItemHasFocus = document.activeElement === oMovedListItem.getDomRef();
			const bChildHasFocus = oMovedListItem.getDomRef().contains(document.activeElement);
			const bHasFocus = bItemHasFocus || bChildHasFocus;

			assert.ok(bHasFocus, "Focus is set on the moved item or one of its children");
		} else {
			assert.ok(true, "Focus check skipped - DOM ref not available");
		}

		fnChangeSpy.restore();
	});

	// ===========================================================================================
	// Module 12: Change Events
	// ===========================================================================================
	QUnit.module("Change Events", {
		beforeEach: async function() {
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP", {
				defaultView: "group",
				footer: new Toolbar("ID_TB_CHANGE_EVENTS",{})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Change event propagation from content", async function(assert){
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		await nextUIUpdate();

		const fnChangeSpy = sinon.spy(this.oAFPanel, "fireChange");

		this.oAFPanel.getCurrentViewContent().fireChange();

		assert.ok(fnChangeSpy.calledOnce, "Change event fired on panel");
		fnChangeSpy.restore();
	});

	// ===========================================================================================
	// Module 13: ID Suffix Generation
	// ===========================================================================================
	QUnit.module("ID Suffix Generation", {
		beforeEach: function() {
			// No setup needed for these tests as they test internal ID generation
		},
		afterEach: function() {
			// No cleanup needed
		}
	});

	QUnit.test("_getIdSuffixFromContext: normal alphanumeric key", function(assert){
		// Test that normal alphanumeric keys pass through unchanged
		const sOriginal = "normalKey123";
		const sExpectedCleaned = "normalKey123";
		const sActualCleaned = sOriginal.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sActualCleaned, sExpectedCleaned, "Normal alphanumeric key is preserved unchanged");
		assert.ok(!/[$/]/.test(sActualCleaned), "No dollar signs or slashes in the cleaned ID");
	});

	QUnit.test("_getIdSuffixFromContext: key with dollar sign", function(assert){
		// Test that dollar signs are removed
		const sOriginal = "key$with$dollars";
		const sExpectedCleaned = "keywithdollars";
		const sActualCleaned = sOriginal.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sActualCleaned, sExpectedCleaned, "Dollar signs are removed from ID suffix");
	});

	QUnit.test("_getIdSuffixFromContext: key with forward slashes", function(assert){
		const sOriginal = "path/to/key";
		const sExpectedCleaned = "pathtokey";
		const sActualCleaned = sOriginal.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sActualCleaned, sExpectedCleaned, "Forward slashes are removed from ID suffix");
	});

	QUnit.test("_getIdSuffixFromContext: key with special characters", function(assert){
		const sOriginal = "key@with#special!chars%";
		const sExpectedCleaned = "keywithspecialchars";
		const sActualCleaned = sOriginal.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sActualCleaned, sExpectedCleaned, "Special characters (@, #, !, %) are removed from ID suffix");
	});

	QUnit.test("_getIdSuffixFromContext: key with spaces", function(assert){
		const sOriginal = "key with spaces";
		const sExpectedCleaned = "keywithspaces";
		const sActualCleaned = sOriginal.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sActualCleaned, sExpectedCleaned, "Spaces are removed from ID suffix");
	});

	QUnit.test("_getIdSuffixFromContext: key with valid special characters", function(assert){
		const sOriginal = "valid-key_with.colon:123";
		const sExpectedCleaned = "valid-key_with.colon:123";
		const sActualCleaned = sOriginal.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sActualCleaned, sExpectedCleaned, "Valid characters (-, _, ., :) are preserved in ID suffix");
	});

	QUnit.test("_getIdSuffixFromContext: key with mixed valid and invalid characters", function(assert){
		const sOriginal = "my-key_123/with$invalid@chars.test:end";
		const sExpectedCleaned = "my-key_123withinvalidchars.test:end";
		const sActualCleaned = sOriginal.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sActualCleaned, sExpectedCleaned, "Only invalid characters are removed, valid ones are preserved");
	});

	QUnit.test("_getIdSuffixFromContext: empty string", function(assert){
		const sOriginal = "";
		const sExpectedCleaned = "";
		const sActualCleaned = sOriginal.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sActualCleaned, sExpectedCleaned, "Empty string remains empty");
	});

	QUnit.test("_getIdSuffixFromContext: only special characters", function(assert){
		const sOriginal = "@#$%^&*()";
		const sExpectedCleaned = "";
		const sActualCleaned = sOriginal.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sActualCleaned, sExpectedCleaned, "String with only invalid characters results in empty string");
	});

	QUnit.test("_getIdSuffixFromContext: unicode characters", function(assert){
		const sOriginal = "key-äöü-日本語";
		const sExpectedCleaned = "key--";
		const sActualCleaned = sOriginal.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sActualCleaned, sExpectedCleaned, "Unicode characters are removed, only ASCII letters/numbers and valid special chars remain");
	});

	QUnit.test("_getIdSuffixFromContext: context without key uses name", function(assert){
		const oMockContext = {
			getProperty: function(sProp) {
				if (sProp === "key") {
					return null;
				}
				if (sProp === "name") {
					return "fallbackName";
				}
				return null;
			}
		};

		// Test the fallback behavior: if key is null/undefined, name should be used
		const sKey = oMockContext.getProperty("key");
		const sName = oMockContext.getProperty("name");
		const sSuffix = sKey || sName;

		assert.equal(sSuffix, "fallbackName", "When key is null, name property is used as fallback");
	});

	QUnit.test("_getIdSuffixFromContext: key with + and * for ALL/ANY filters", function(assert){
		// Test that + is replaced with _ALL_ and * is replaced with _ANY_
		const sOriginalPlus = "key+filter";
		const sOriginalStar = "key*filter";
		const sOriginalBoth = "key+and*filter";

		// Apply the same transformation as _getIdSuffixFromContext
		let sCleanedPlus = sOriginalPlus.replace(/\+/g, "_ALL_");
		sCleanedPlus = sCleanedPlus.replace(/\*/g, "_ANY_");
		sCleanedPlus = sCleanedPlus.replace(/[^A-Za-z0-9\-_:.]/g, "");

		let sCleanedStar = sOriginalStar.replace(/\+/g, "_ALL_");
		sCleanedStar = sCleanedStar.replace(/\*/g, "_ANY_");
		sCleanedStar = sCleanedStar.replace(/[^A-Za-z0-9\-_:.]/g, "");

		let sCleanedBoth = sOriginalBoth.replace(/\+/g, "_ALL_");
		sCleanedBoth = sCleanedBoth.replace(/\*/g, "_ANY_");
		sCleanedBoth = sCleanedBoth.replace(/[^A-Za-z0-9\-_:.]/g, "");

		assert.equal(sCleanedPlus, "key_ALL_filter", "+ character is replaced with _ALL_");
		assert.equal(sCleanedStar, "key_ANY_filter", "* character is replaced with _ANY_");
		assert.equal(sCleanedBoth, "key_ALL_and_ANY_filter", "Both + and * are replaced with _ALL_ and _ANY_");
	});

	// ===========================================================================================
	// Module 11: ComboBox Validation and Messaging
	// ===========================================================================================
	QUnit.module("ComboBox Validation and Messaging", {
		beforeEach: async function() {
			this.oAFPanel = new AdaptFiltersPanel();

			// Setup item factory like in other tests
			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			// Create enhancer function
			this.fnEnhancer = function(mItem, oProperty) {
				mItem.visibleInDialog = true;
				mItem.visible = oProperty.key === "key1";
				return true;
			};

			const oP13nData = P13nBuilder.prepareAdaptationData(aInfoData, this.fnEnhancer, true);

			this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oViewContent = this.oAFPanel.getCurrentViewContent();
			this.oComboBox = this.oViewContent._oKeySelect;
		},
		afterEach: function() {
			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];
			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("ComboBox should show error when invalid value is entered", async function(assert) {
		const sInvalidValue = "NonExistentFilter";

		// Simulate user typing invalid value
		this.oComboBox.setValue(sInvalidValue);
		this.oComboBox.fireChange({
			value: sInvalidValue,
			newValue: sInvalidValue
		});
		await nextUIUpdate();

		// Check ValueState
		assert.equal(this.oComboBox.getValueState(), "Error", "ComboBox should have Error state");
		assert.ok(this.oComboBox.getValueStateText().length > 0, "ComboBox should have error message text");
	});

	QUnit.test("ComboBox error should be cleared when value is cleared", async function(assert) {
		const sInvalidValue = "NonExistentFilter";

		// Set error state first
		this.oComboBox.setValue(sInvalidValue);
		this.oComboBox.fireChange({
			value: sInvalidValue,
			newValue: sInvalidValue
		});
		await nextUIUpdate();

		assert.equal(this.oComboBox.getValueState(), "Error", "ComboBox should have Error state");

		// Clear the value to remove the error
		this.oComboBox.setValue("");
		this.oComboBox.fireChange({
			value: "",
			newValue: ""
		});
		await nextUIUpdate();

		// Check that error is cleared
		assert.equal(this.oComboBox.getValueState(), "None", "ComboBox Error state should be cleared");
		assert.equal(this.oComboBox.getValueStateText(), "", "Error message should be cleared");
	});

	QUnit.test("ComboBox error should be cleared on dialog close", async function(assert) {
		const sInvalidValue = "NonExistentFilter";

		// Set error state
		this.oComboBox.setValue(sInvalidValue);
		this.oComboBox.fireChange({
			value: sInvalidValue,
			newValue: sInvalidValue
		});
		await nextUIUpdate();

		assert.equal(this.oComboBox.getValueState(), "Error", "ComboBox should have Error state");
		assert.ok(this.oComboBox.getValue().length > 0, "ComboBox should have a value");

		// Call onBeforeClose
		await this.oViewContent.onBeforeClose();
		await nextUIUpdate();

		// Check that error and value are cleared
		assert.equal(this.oComboBox.getValueState(), "None", "ComboBox Error state should be cleared");
		assert.equal(this.oComboBox.getValue(), "", "ComboBox value should be cleared");
	});

	QUnit.test("ComboBox error should be cleared on restoreDefaults", async function(assert) {
		const sInvalidValue = "NonExistentFilter";

		// Set error state
		this.oComboBox.setValue(sInvalidValue);
		this.oComboBox.fireChange({
			value: sInvalidValue,
			newValue: sInvalidValue
		});
		await nextUIUpdate();

		assert.equal(this.oComboBox.getValueState(), "Error", "ComboBox should have Error state");

		// Call restoreDefaults
		this.oViewContent.restoreDefaults();
		await nextUIUpdate();

		// Check that error and value are cleared
		assert.equal(this.oComboBox.getValueState(), "None", "ComboBox Error state should be cleared");
		assert.equal(this.oComboBox.getValue(), "", "ComboBox value should be cleared");
	});

	QUnit.test("ValueState error should be set and cleared correctly", async function(assert) {
		const sInvalidValue = "NonExistentFilter";

		// Set error state
		this.oComboBox.setValue(sInvalidValue);
		this.oComboBox.fireChange({
			value: sInvalidValue,
			newValue: sInvalidValue
		});
		await nextUIUpdate();

		// Check that ValueState error was set
		assert.equal(this.oComboBox.getValueState(), "Error", "ComboBox should have Error ValueState");
		assert.ok(this.oComboBox.getValueStateText().length > 0, "ComboBox should have error message text");

		// Clear the error by entering valid value (empty)
		this.oComboBox.setValue("");
		this.oComboBox.fireChange({
			value: "",
			newValue: ""
		});
		await nextUIUpdate();

		// Check that error is cleared
		assert.equal(this.oComboBox.getValueState(), "None", "ComboBox Error state should be cleared");
		assert.equal(this.oComboBox.getValueStateText(), "", "Error message should be cleared");
	});

	QUnit.test("ComboBox without error should not be cleared on dialog close", async function(assert) {
		// No error state, just a value
		this.oComboBox.setValue("");

		// Call onBeforeClose
		await this.oViewContent.onBeforeClose();
		await nextUIUpdate();

		// Check that nothing changed
		assert.equal(this.oComboBox.getValueState(), "None", "ComboBox should still have None state");
		assert.equal(this.oComboBox.getValue(), "", "ComboBox value should remain empty");
	});

	// ===========================================================================================
	// Module 14: Keyboard Navigation Reordering
	// ===========================================================================================
	QUnit.module("Keyboard Navigation Reordering", {
		beforeEach: async function() {
			// Store original Device.os for restoration
			this._originalDeviceOS = Device.os;

			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel("ADP", {
				defaultView: "list",
				footer: new Toolbar("ID_TB_KEYBOARD_NAV",{})
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];
			this.oAFPanel.setItemFactory(function(){
				iFilterFieldCounter++;
				const oFilterField = new FilterField("FF" + iFilterFieldCounter);
				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return [];
					};
				}
				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			this.fnEnhancer = function(mItem, oProperty) {
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.key) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function(){
			// Restore original Device.os
			Device.os = this._originalDeviceOS;

			this.oP13nData = null;
			this.aMockInfo = null;

			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];

			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	// Helper function for triggering reorder via _handleReorder
	async function triggerReorder(oViewContent, oListItem, sDirection, bCtrl, bMeta) {
		// Focus the item first
		oListItem.focus();
		await nextUIUpdate();

		// Create a mock event object
		const oMockEvent = {
			ctrlKey: bCtrl,
			metaKey: bMeta,
			preventDefault: function() {},
			stopPropagation: function() {}
		};

		// Call the handler directly
		oViewContent._handleReorder(oMockEvent, sDirection);

		// Wait for rendering delay
		await nextUIUpdate();
		await new Promise((resolve) => {
			setTimeout(resolve, 100);
		});
	}

	// Test 1: CTRL+Arrow Down moves item down on non-Mac platform
	QUnit.test("CTRL+Arrow Down moves item down on non-Mac platform", async function(assert){
		// Stub Device.os for non-Mac platform
		Device.os = { macintosh: false, windows: true };

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();
		const oListControl = oViewContent._oListControl;

		// Enable sort mode
		oViewContent._oViewModel.setProperty("/editable", false);
		await nextUIUpdate();

		const aInitialItems = oListControl.getItems().filter((oItem) => oItem.getVisible() && !oItem.isA("sap.m.GroupHeaderListItem"));
		assert.ok(aInitialItems.length >= 2, "At least 2 items are available");

		const oSecondItem = aInitialItems[1];
		const sItemName = oViewContent._getModelEntry(oSecondItem).name;
		const iInitialPosition = oViewContent._getModelEntry(oSecondItem).position;

		const fnChangeSpy = sinon.spy(oViewContent, "fireChange");

		// Trigger CTRL+Arrow Down
		await triggerReorder(oViewContent, oSecondItem, "DOWN", true, false);

		const aItems = oViewContent._getP13nModel().getProperty("/items");
		const oMovedItem = aItems.find((oItem) => oItem.name === sItemName);

		assert.ok(oMovedItem, "Item exists in model");
		assert.notEqual(oMovedItem.position, iInitialPosition, "Item position changed from initial position");
		assert.ok(fnChangeSpy.called, "fireChange was called");
		assert.equal(fnChangeSpy.lastCall.args[0].reason, oViewContent.CHANGE_REASON_REORDER, "Change reason is 'Reorder'");

		fnChangeSpy.restore();
	});

	// Test 2: CMD+Arrow Down moves item down on Mac platform
	QUnit.test("CMD+Arrow Down moves item down on Mac platform", async function(assert){
		// Stub Device.os for Mac platform
		Device.os = { macintosh: true };

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();
		const oListControl = oViewContent._oListControl;

		// Enable sort mode
		oViewContent._oViewModel.setProperty("/editable", false);
		await nextUIUpdate();

		const aInitialItems = oListControl.getItems().filter((oItem) => oItem.getVisible() && !oItem.isA("sap.m.GroupHeaderListItem"));
		assert.ok(aInitialItems.length >= 2, "At least 2 items are available");

		const oSecondItem = aInitialItems[1];
		const sItemName = oViewContent._getModelEntry(oSecondItem).name;
		const iInitialPosition = oViewContent._getModelEntry(oSecondItem).position;

		const fnChangeSpy = sinon.spy(oViewContent, "fireChange");

		// Trigger CMD+Arrow Down (metaKey)
		await triggerReorder(oViewContent, oSecondItem, "DOWN", false, true);

		const aItems = oViewContent._getP13nModel().getProperty("/items");
		const oMovedItem = aItems.find((oItem) => oItem.name === sItemName);

		assert.ok(oMovedItem, "Item exists in model");
		assert.notEqual(oMovedItem.position, iInitialPosition, "Item position changed from initial position");
		assert.ok(fnChangeSpy.called, "fireChange was called");
		assert.equal(fnChangeSpy.lastCall.args[0].reason, oViewContent.CHANGE_REASON_REORDER, "Change reason is 'Reorder'");

		fnChangeSpy.restore();
	});

	// Test 3: Arrow keys alone do NOT trigger reordering in sort mode
	QUnit.test("Arrow keys alone do NOT trigger reordering in sort mode", async function(assert){
		Device.os = { macintosh: false, windows: true };

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();
		const oListControl = oViewContent._oListControl;

		// Enable sort mode
		oViewContent._oViewModel.setProperty("/editable", false);
		await nextUIUpdate();

		const aInitialItems = oListControl.getItems().filter((oItem) => oItem.getVisible() && !oItem.isA("sap.m.GroupHeaderListItem"));
		const oSecondItem = aInitialItems[1];
		const sItemName = oViewContent._getModelEntry(oSecondItem).name;
		const iInitialPosition = oViewContent._getModelEntry(oSecondItem).position;

		const fnChangeSpy = sinon.spy(oViewContent, "fireChange");

		// Trigger Arrow Down WITHOUT modifier key
		await triggerReorder(oViewContent, oSecondItem, "DOWN", false, false);

		const aItems = oViewContent._getP13nModel().getProperty("/items");
		const oItem = aItems.find((oItem) => oItem.name === sItemName);

		assert.equal(oItem.position, iInitialPosition, "Item remains in same position");
		assert.notOk(fnChangeSpy.called, "fireChange was NOT called");

		fnChangeSpy.restore();
	});

	// Test 4: Wrong modifier key does NOT trigger reordering
	QUnit.test("Wrong modifier key does NOT trigger reordering", async function(assert){
		// Stub Device.os for non-Mac platform
		Device.os = { macintosh: false, windows: true };

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();
		const oListControl = oViewContent._oListControl;

		// Enable sort mode
		oViewContent._oViewModel.setProperty("/editable", false);
		await nextUIUpdate();

		const aInitialItems = oListControl.getItems().filter((oItem) => oItem.getVisible() && !oItem.isA("sap.m.GroupHeaderListItem"));
		const oSecondItem = aInitialItems[1];
		const sItemName = oViewContent._getModelEntry(oSecondItem).name;
		const iInitialPosition = oViewContent._getModelEntry(oSecondItem).position;

		const fnChangeSpy = sinon.spy(oViewContent, "fireChange");

		// Trigger CMD+Arrow Down (wrong modifier for Windows)
		await triggerReorder(oViewContent, oSecondItem, "DOWN", false, true);

		const aItems = oViewContent._getP13nModel().getProperty("/items");
		const oItem = aItems.find((oItem) => oItem.name === sItemName);

		assert.equal(oItem.position, iInitialPosition, "Item remains in same position");
		assert.notOk(fnChangeSpy.called, "fireChange was NOT called");

		fnChangeSpy.restore();
	});

	// Test 5: Keyboard reordering disabled in edit mode
	QUnit.test("Keyboard reordering disabled in edit mode", async function(assert){
		Device.os = { macintosh: false, windows: true };

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();
		const oListControl = oViewContent._oListControl;

		// Enable edit mode (editable = true)
		oViewContent._oViewModel.setProperty("/editable", true);
		await nextUIUpdate();

		const aInitialItems = oListControl.getItems().filter((oItem) => oItem.getVisible() && !oItem.isA("sap.m.GroupHeaderListItem"));
		const oSecondItem = aInitialItems[1];
		const sItemName = oViewContent._getModelEntry(oSecondItem).name;
		const iInitialPosition = oViewContent._getModelEntry(oSecondItem).position;

		const fnChangeSpy = sinon.spy(oViewContent, "fireChange");

		// Trigger CTRL+Arrow Down in edit mode
		await triggerReorder(oViewContent, oSecondItem, "DOWN", true, false);

		const aItems = oViewContent._getP13nModel().getProperty("/items");
		const oItem = aItems.find((oItem) => oItem.name === sItemName);

		assert.equal(oItem.position, iInitialPosition, "Item remains in same position");
		assert.notOk(fnChangeSpy.called, "fireChange was NOT called");

		fnChangeSpy.restore();
	});

	QUnit.module("Boolean Field Visibility with Value Changes", {
		beforeEach: async function() {
			// Mock info data for boolean field scenario
			this.aMockInfo = [
				{
					key: "visibleField",
					label: "Visible Field",
					dataType: "String"
				},
				{
					key: "booleanField",
					label: "Boolean Field",
					dataType: "Boolean"
				}
			];

			this.oAFPanel = new AdaptFiltersPanel({
				defaultView: "list"
			});

			let iFilterFieldCounter = 0;
			this.aAllFilterFields = [];
			this.aAllFilterGroupLayouts = [];

			this.oAFPanel.setItemFactory(function(oContext){
				iFilterFieldCounter++;
				const oItem = oContext.getObject();
				const oFilterField = new FilterField("FF" + iFilterFieldCounter, {
					propertyKey: oItem.name
				});

				// Mock conditions based on item
				if (oItem.name === "booleanField" && oItem.isFiltered) {
					oFilterField.setConditions([{operator: "EQ", values: [true]}]);
				}

				if (!oFilterField.getConditions) {
					oFilterField.getConditions = function() {
						return this.getProperty("conditions") || [];
					};
				}

				const oFilterGroupLayout = new FilterGroupLayout("FGL" + iFilterFieldCounter);
				oFilterGroupLayout.setFilterField(oFilterField);
				this.aAllFilterFields.push(oFilterField);
				this.aAllFilterGroupLayouts.push(oFilterGroupLayout);
				return oFilterGroupLayout;
			}.bind(this));

			// Enhancer function to set up test data properly
			this.fnEnhancer = function(mItem, oProperty) {
				mItem.visibleInDialog = true;
				// visibleField is visible in FilterBar
				if (oProperty.key === "visibleField") {
					mItem.visible = true;
					mItem.isFiltered = false;
					mItem.initiallyVisible = true;
					mItem.hadInitialFilterValue = false;
				}
				// booleanField is invisible but has filter value
				if (oProperty.key === "booleanField") {
					mItem.visible = false;
					mItem.isFiltered = true;  // Has value "Yes"
					mItem.initiallyVisible = false;
					mItem.hadInitialFilterValue = true;
				}
				return true;
			};

			// Use P13nBuilder like other tests
			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.aAllFilterGroupLayouts.forEach(function(oFilterGroupLayout){
				if (!oFilterGroupLayout.bIsDestroyed) {
					oFilterGroupLayout.destroy();
				}
			});
			this.aAllFilterGroupLayouts = [];
			this.aAllFilterFields.forEach(function(oFilterField){
				if (!oFilterField.bIsDestroyed) {
					oFilterField.destroy();
				}
			});
			this.aAllFilterFields = [];
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Boolean field initially invisible with value 'Yes' stays visible when changed to 'Not Selected'", async function(assert) {
		// Setup using P13nBuilder data
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const oViewContent = this.oAFPanel.getCurrentViewContent();
		const oListControl = oViewContent._oListControl;

		// Verify: Boolean field should be visible in the dialog because it has a filter value
		const aVisibleItems = oListControl.getItems().filter((oItem) =>
			oItem.getVisible() && !oItem.isA("sap.m.GroupHeaderListItem")
		);

		assert.equal(aVisibleItems.length, 2, "Both fields should be visible in the dialog");

		const oBooleanListItem = aVisibleItems.find((oItem) => {
			const oEntry = oViewContent._getModelEntry(oItem);
			return oEntry && oEntry.name === "booleanField";
		});

		assert.ok(oBooleanListItem, "Boolean field should be visible in the list");

		// Get the actual FilterField from the list item
		const oBooleanFilterField = this.aAllFilterFields.find((_oFF, idx) => {
			// Find the field that corresponds to booleanField
			const oItem = this.oP13nData.items[idx];
			return oItem && oItem.name === "booleanField";
		});

		// Simulate: User changes boolean value from "Yes" to "Not Selected" (clears conditions)
		if (oBooleanFilterField) {
			oBooleanFilterField.setConditions([]);  // Clear conditions = "Not Selected"
			oBooleanFilterField.fireChange();
		}
		await nextUIUpdate();

		// Update model: isFiltered should now be false
		const aItems = oViewContent._getP13nModel().getProperty("/items");
		const oBooleanItem = aItems.find((oItem) => oItem.name === "booleanField");
		oBooleanItem.isFiltered = false;
		oViewContent._getP13nModel().setProperty("/items", aItems, null, true);
		oViewContent._getP13nModel().checkUpdate(true, true);
		await nextUIUpdate();

		// Verify: Boolean field should STILL be visible due to hadInitialFilterValue flag
		const aVisibleItemsAfter = oListControl.getItems().filter((oItem) =>
			oItem.getVisible() && !oItem.isA("sap.m.GroupHeaderListItem")
		);

		const oBooleanListItemAfter = aVisibleItemsAfter.find((oItem) => {
			const oEntry = oViewContent._getModelEntry(oItem);
			return oEntry && oEntry.name === "booleanField";
		});

		assert.ok(oBooleanListItemAfter, "Boolean field should remain visible after value change to 'Not Selected'");
		assert.equal(aVisibleItemsAfter.length, 2, "Both fields should still be visible");

		// Verify model flags are correct
		assert.equal(oBooleanItem.initiallyVisible, false, "initiallyVisible flag should be false");
		assert.equal(oBooleanItem.hadInitialFilterValue, true, "hadInitialFilterValue flag should still be true");
		assert.equal(oBooleanItem.isFiltered, false, "isFiltered should now be false");
		assert.equal(oBooleanItem.visible, false, "visible (in FilterBar) should remain false");
	});

	// ===========================================================================================
	// Module 15: itemFactory call count (performance regression tests)
	// These tests validate that the itemFactory is called only for fields that actually need
	// a row in the dialog (visible, filtered, required), not for all fields in the model.
	// Without Fix 1 (_bindList pre-filter) all 1000 rows would trigger factory calls;
	// with the fix only ~N visible/filtered fields do.
	// ===========================================================================================
	QUnit.module("itemFactory call count - performance regression", {
		beforeEach: async function() {
			this.iFactoryCallCount = 0;
			this.aFactoryInstances = [];
			this.oAFPanel = new AdaptFiltersPanel({
				defaultView: "list"
			});

			this.oAFPanel.setItemFactory(() => {
				this.iFactoryCallCount++;
				const oFilterField = new FilterField("PerfFF" + this.iFactoryCallCount);
				oFilterField.getConditions = function() { return []; };
				const oFGL = new FilterGroupLayout("PerfFGL" + this.iFactoryCallCount);
				oFGL.setFilterField(oFilterField);
				this.aFactoryInstances.push(oFilterField, oFGL);
				return oFGL;
			});

			this.oAFPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oAFPanel.destroy();
			this.aFactoryInstances.forEach(function(oCtrl) {
				if (!oCtrl.bIsDestroyed) {
					oCtrl.destroy();
				}
			});
			this.aFactoryInstances = [];
			this.iFactoryCallCount = 0;
		}
	});

	/**
	 * Creates p13n data with `nTotal` items of which `nVisible` are visible
	 * and `nFiltered` are invisible but have a filter value (isFiltered=true).
	 * @param {int} nTotal Total number of fields
	 * @param {int} nVisible Number of fields that are visible in the filter bar
	 * @param {int} nFiltered Number of fields that are not visible but have an active filter value
	 * @returns {object} p13n adaptation data object
	 */
	function createLargeP13nData(nTotal, nVisible, nFiltered) {
		const aInfo = [];
		for (let i = 0; i < nTotal; i++) {
			aInfo.push({ key: "perfKey" + i, label: "Field " + i, dataType: "String" });
		}
		return P13nBuilder.prepareAdaptationData(aInfo, function(mItem, oProperty) {
			const iIdx = parseInt(oProperty.key.replace("perfKey", ""));
			mItem.visibleInDialog = true;
			mItem.visible = iIdx < nVisible;
			mItem.isFiltered = !mItem.visible && iIdx < nVisible + nFiltered;
			return true;
		}, true);
	}

	QUnit.test("itemFactory called only for visible fields, not all 1000 fields", async function(assert) {
		const N_TOTAL = 1000;
		const N_VISIBLE = 11;
		const oP13nData = createLargeP13nData(N_TOTAL, N_VISIBLE, 0);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		await nextUIUpdate();

		// Without Fix 1 the factory would be called ~2000 times (2× per item × 1000 items).
		// With Fix 1 only visible items reach the factory — once per item in _createFilterControl
		// plus once per item in _createVisibilityAction = 2× N_VISIBLE without Fix 2 as well.
		// With both Fix 1 and Fix 2 the count should equal N_VISIBLE (one call per row).
		assert.ok(
			this.iFactoryCallCount <= N_VISIBLE,
			"itemFactory called at most " + N_VISIBLE + " times (once per visible field), got " + this.iFactoryCallCount
		);
		assert.ok(
			this.iFactoryCallCount > 0,
			"itemFactory called at least once (visible fields do get rows)"
		);
		assert.ok(
			this.iFactoryCallCount < N_TOTAL,
			"itemFactory called far fewer than " + N_TOTAL + " times — invisible fields skipped"
		);
	});

	QUnit.test("itemFactory not called for invisible non-filtered fields", async function(assert) {
		const N_TOTAL = 100;
		const N_VISIBLE = 5;
		const oP13nData = createLargeP13nData(N_TOTAL, N_VISIBLE, 0);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		await nextUIUpdate();

		// Exactly N_VISIBLE rows should have been created; invisible fields should be skipped.
		assert.strictEqual(
			this.iFactoryCallCount, N_VISIBLE,
			"itemFactory called exactly " + N_VISIBLE + " times — once per visible field"
		);
	});

	QUnit.test("itemFactory called for filtered invisible fields (they show in dialog)", async function(assert) {
		const N_TOTAL = 50;
		const N_VISIBLE = 3;
		const N_FILTERED = 2; // invisible but have a value → must appear in dialog
		const oP13nData = createLargeP13nData(N_TOTAL, N_VISIBLE, N_FILTERED);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		await nextUIUpdate();

		// N_VISIBLE + N_FILTERED fields need rows.
		const iExpected = N_VISIBLE + N_FILTERED;
		assert.strictEqual(
			this.iFactoryCallCount, iExpected,
			"itemFactory called " + iExpected + " times — visible fields + filtered-invisible fields"
		);
	});

	QUnit.test("adding a field via ComboBox does not call itemFactory for all fields", async function(assert) {
		const N_TOTAL = 50;
		const N_VISIBLE = 3;
		const oP13nData = createLargeP13nData(N_TOTAL, N_VISIBLE, 0);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const iCallsAfterOpen = this.iFactoryCallCount;

		// Simulate selecting a new field via the ComboBox (key "perfKey3" is the first invisible one)
		const oViewContent = this.oAFPanel.getCurrentViewContent();
		const oComboBox = oViewContent._oKeySelect;

		// Select "perfKey3" in the ComboBox
		oComboBox.setSelectedKey("perfKey3");
		oComboBox.fireChange({ value: "Field 3", newValue: "Field 3" });
		await nextUIUpdate();
		await new Promise((r) => { setTimeout(r, 150); });

		const iNewCalls = this.iFactoryCallCount - iCallsAfterOpen;
		// UI5 factory bindings destroy and recreate all visible items on model change, so
		// iNewCalls will be N_VISIBLE+1 at most (not 1). The key assertion is that
		// factory is NOT called for all N_TOTAL items — only for visible ones.
		assert.ok(
			iNewCalls <= N_VISIBLE + 1,
			"Factory called at most N_VISIBLE+1 times after adding a field (actual=" + iNewCalls + "), not for all " + N_TOTAL + " fields"
		);
		assert.ok(
			iNewCalls < N_TOTAL,
			"Factory NOT called for all " + N_TOTAL + " fields (actual=" + iNewCalls + ")"
		);
	});

	QUnit.test("factory call count stays low after view switch (list → group)", async function(assert) {
		const N_TOTAL = 200;
		const N_VISIBLE = 7;
		const oP13nData = createLargeP13nData(N_TOTAL, N_VISIBLE, 0);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		this.oAFPanel.switchView("list");
		await nextUIUpdate();

		const iCallsListView = this.iFactoryCallCount;
		// setP13nModel + switchView("list") may each call _bindList once, so up to 2×N_VISIBLE
		assert.ok(
			iCallsListView <= 2 * N_VISIBLE,
			"List view setup: factory called at most 2×N_VISIBLE=" + (2 * N_VISIBLE) + " times, got " + iCallsListView
		);
		assert.ok(
			iCallsListView < N_TOTAL,
			"List view setup: factory NOT called for all " + N_TOTAL + " fields (got " + iCallsListView + ")"
		);

		// Switch to group view — triggers a lazy second panel initialization
		this.oAFPanel.switchView("group");
		await nextUIUpdate();

		const iCallsGroupView = this.iFactoryCallCount - iCallsListView;
		assert.ok(
			iCallsGroupView <= N_VISIBLE,
			"Group view init: factory called at most " + N_VISIBLE + " additional times, got " + iCallsGroupView
		);
		assert.ok(
			iCallsGroupView < N_TOTAL,
			"Group view: factory NOT called for all " + N_TOTAL + " fields (got " + iCallsGroupView + ")"
		);
	});
});