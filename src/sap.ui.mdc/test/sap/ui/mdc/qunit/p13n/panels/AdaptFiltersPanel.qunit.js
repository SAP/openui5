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
	"sap/m/SegmentedButtonItem",
	"sap/ui/mdc/util/PropertyHelper",
	"sap/m/VBox",
	"sap/ui/core/Core"
], function(AdaptFiltersPanel, P13nBuilder, JSONModel, CustomListItem, Toolbar, Event, Text, List, SegmentedButtonItem, PropertyHelper, VBox, oCore) {
	"use strict";

	var aVisible = ["key1", "key2", "key3"];

	var aInfoData = [
		{
			name: "key1",
			label: "Field 1",
			group: "G1",
			dataType: "String"
		},
		{
			name: "key2",
			label: "Field 2",
			group: "G1",
			dataType: "String"
		},
		{
			name: "key3",
			label: "Field 3",
			group: "G1",
			dataType: "String"
		},
		{
			name: "key4",
			label: "Field 4",
			group: "G2",
			dataType: "String"
		},
		{
			name: "key5",
			label: "Field 5",
			group: "G2",
			dataType: "String"
		},
		{
			name: "key6",
			label: "Field 6",
			group: "G2",
			tooltip: "Some Tooltip",
			dataType: "String"
		}
	];

	QUnit.module("API Tests", {
		beforeEach: function(){
			this.sDefaultGroup = "BASIC";
			this.aMockInfo = aInfoData;
			this.oAFPanel = new AdaptFiltersPanel({
				defaultView: "group",
				footer: new Toolbar("ID_TB1",{})
			});

			this.oAFPanel.setItemFactory(function(){
				return new VBox();
			});

			this.fnEnhancer = function(mItem, oProperty) {

				//Add (mock) an 'active' field
				if (oProperty.name == "key2") {
					mItem.active = true;
				}

				//Add (mock) a 'mandatory' field
				if (oProperty.name == "key5") {
					mItem.required = true;
				}

				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.name) > -1;
				return true;
			};

			this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

			this.oAFPanel.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function(){
			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.aMockInfo = null;
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("check instantiation", function(assert){
		assert.ok(this.oAFPanel, "Panel created");
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		assert.ok(this.oAFPanel.getModel(this.oAFPanel.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Model has been set");
	});

	QUnit.test("Check Search implementation", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._getSearchField().setValue("Field 5");
		var oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});

		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		var oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
	});

	QUnit.test("Check Search implementation - also for ToolTip", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._getSearchField().setValue("Some Tooltip");
		var oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});

		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		var oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
	});

	QUnit.test("Check Search implementation in combination with 'group mode' Select for 'active'", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._sModeKey = "active";
		var oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		var oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;

		//filter only via select control --> only first group has an active item
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is invisible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		//filter with additional search --> active item does not have this tooltip
		this.oAFPanel._getSearchField().setValue("Some Tooltip");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		//filter with a search filter and 'all' --> only affected item with the tooltip should be visible
		this.oAFPanel._sModeKey = "all";
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
	});

	QUnit.test("Check Search implementation in combination with 'group mode' Select for 'mandatory'", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._sModeKey = "mandatory";
		var oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		var oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;

		//filter only via select control --> only second group has a mandatory item
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since one item is available");

		//filter with a search filter and 'all'
		this.oAFPanel._sModeKey = "all";
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
	});

	QUnit.test("Check Search implementation in combination with 'group mode' Select for 'visibleactive'", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._sModeKey = "visibleactive";
		var oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});
		var oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;

		//filter only via select control --> only first group has an active and visible item
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		//filter with additional search --> active item is still present as it fits the label
		this.oAFPanel._getSearchField().setValue("Field 2");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		this.oAFPanel._getSearchField().setValue("Field 1");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		//filter with additional search --> active item is still present as it fits the label
		this.oAFPanel._getSearchField().setValue("Field 2");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		//filter with a search filter and 'all' --> only affected item with the tooltip should be visible
		this.oAFPanel._sModeKey = "all";
		this.oAFPanel._getSearchField().setValue("");
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
	});

	QUnit.test("Check Search implementation in combination with 'group mode' Select", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._getSearchField().setValue("Some Tooltip");
		this.oAFPanel._sModeKey = "visible";
		var oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});

		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		var oOuterList = this.oAFPanel.getCurrentViewContent()._oListControl;
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

		this.oAFPanel._sModeKey = "all";
		this.oAFPanel._filterByModeAndSearch(oFakeEvent);
		assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
		assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
	});

	QUnit.test("Check that groups are initially only displayed if necessary", function(assert){

		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);
		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));

		assert.equal(this.oAFPanel.getCurrentViewContent()._oListControl.getVisibleItems().length, 2, "All groups visible");

		oP13nData.itemsGrouped[0].items.forEach(function(oItem){
			oItem.visibleInDialog = false;
		});

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		assert.equal(this.oAFPanel.getCurrentViewContent()._oListControl.getVisibleItems().length, 1, "Only necessary groups visible");

	});

	QUnit.test("Check additional filter implementation (visibleInDialog)", function(assert){

		var oP13nData = this.oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, function(oItem, oProp) {
			if (oProp.name == "key2") {
				oItem.visibleInDialog = false;
			} else {
				oItem.visibleInDialog = true;
			}
			return oItem;
		}, true);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));

		var aGroupPanels = this.oAFPanel.getCurrentViewContent().getPanels();

		//Check in GroupView
		assert.equal(aGroupPanels[0].getContent()[0].getVisibleItems().length, 2, "There are 3 items in the model, but one should be hidden for the user");

		//Check in ListView
		this.oAFPanel.switchView("list");
		var aItems = this.oAFPanel.getCurrentViewContent()._oListControl.getItems();
		assert.equal(aItems.length, 5, "There are 6 items in the model, but one should be hidden for the user");

	});

	QUnit.test("Check 'itemFactory' execution for only necessary groups", function(assert){

		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

		var fnItemFactoryCallback = function(oContext) {
			return new VBox();
		};

		this.oAFPanel.setItemFactory(fnItemFactoryCallback);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));
		this.oAFPanel.getCurrentViewContent()._loopGroupList(function(oItem, sKey){
			var oProp = this.oAFPanel.getP13nModel().getProperty(oItem.getBindingContext(this.oAFPanel.P13N_MODEL).sPath);
			var iExpectedLength = oProp.group === "G1" ? 2 : 1;

			assert.equal(oItem.getContent().length, iExpectedLength, "Only required callbacks executed");

		}.bind(this));

	});

	QUnit.test("Check 'itemFactory' execution for expanded groups", function(assert){

		//6 items in 2 groups --> 6x callback excuted after expanding --> +3x for initial filtering
		var done = assert.async(9);

		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

		var fnItemFactoryCallback = function (oContext) {
			assert.ok(oContext, "Callback executed with binding context");
			done(6);
		};

		this.oAFPanel.setItemFactory(fnItemFactoryCallback);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));

		this.oAFPanel.setGroupExpanded("G2");

	});

	QUnit.test("Check 'itemFactory' execution for expanded groups by checking created controls", function(assert){

		var oP13nData = P13nBuilder.prepareAdaptationData(this.aMockInfo, this.fnEnhancer, true);

		var fnItemFactoryCallback = function (oContext) {

			return new VBox();
		};

		this.oAFPanel.setItemFactory(fnItemFactoryCallback);

		this.oAFPanel.setP13nModel(new JSONModel(oP13nData));

		this.oAFPanel.setGroupExpanded("G2");

		this.oAFPanel.getCurrentViewContent()._loopGroupList(function(oItem, sKey){

			//All Panels expanded --> all fields created
			assert.equal(oItem.getContent().length, 2, "Only required callbacks executed");

		});

	});

	QUnit.test("Check 'itemFactory' execution combined with filtering - panel not expaned while searching", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._getSearchField().setValue("Field 5");
		var oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});

		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		assert.equal(this.oAFPanel.getCurrentViewContent()._getInitializedLists().length, 1, "Filter triggerd, but group not yet initialized");

		this.oAFPanel.getCurrentViewContent()._loopGroupList(function(oItem, sKey){
			var oProp = this.oAFPanel.getP13nModel().getProperty(oItem.getBindingContext(this.oAFPanel.P13N_MODEL).sPath);
			var iExpectedLength = oProp.group === "G1" ? 2 : 1;

			assert.equal(oItem.getContent().length, iExpectedLength, "Only required callbacks executed");

		}.bind(this));
	});

	QUnit.test("Check 'itemFactory' execution combined with filtering - panel is expaned while searching", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		this.oAFPanel._getSearchField().setValue("Field 5");
		var oFakeEvent = new Event("liveSearch", this.oAFPanel._getSearchField(), {});

		this.oAFPanel.setGroupExpanded("G2");

		this.oAFPanel._filterByModeAndSearch(oFakeEvent);

		assert.equal(this.oAFPanel.getCurrentViewContent()._getInitializedLists().length, 2, "Filter triggerd - group initialized");

	});

	QUnit.test("Check method 'setGroupExpanded' ", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		var oSecondPanel = this.oAFPanel.getCurrentViewContent()._oListControl.getItems()[1].getContent()[0];
		assert.ok(!oSecondPanel.getExpanded(), "Panel is initially collapsed");

		this.oAFPanel.setGroupExpanded("G2", true);
		assert.ok(oSecondPanel.getExpanded(), "Panel is expanded after manually triggering");

		this.oAFPanel.setGroupExpanded("G2");
		assert.ok(!oSecondPanel.getExpanded(), "Panel is collapsed when calling with 'undefined' as second parameter");

		this.oAFPanel.setGroupExpanded("G2", true);
		assert.ok(oSecondPanel.getExpanded(), "Panel is expanded after manually triggering");

		this.oAFPanel.setGroupExpanded("G2", false);
		assert.ok(!oSecondPanel.getExpanded(), "Panel is collapsed when calling with 'false'' as second parameter");
	});

	QUnit.test("Check 'getSelectedFields' - should only return selected fields", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		//Three existing items --> the amount of selected items should match the initially visible ones
		assert.equal(this.oAFPanel.getSelectedFields().length, aVisible.length, "Correct amount of selected items returned");

	});

	QUnit.test("Check 'itemFactory' model propagation", function(assert){

		var oSecondModel = new JSONModel({
			data: [
				{
					key: "k1",
					text: "Some Test Text"
				}
			]
		});

		var oTestFactory = new List({
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

			return oTestFactory.clone();

		});

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		var aGroups = this.oAFPanel.getCurrentViewContent()._oListControl.getItems();
		var oFirstGroup = aGroups[0].getContent()[0];
		var oFirstList = oFirstGroup.getContent()[0];

		//List created via template 'oTestFactory'
		var oCustomList = oFirstList.getItems()[0].getContent()[1];

		assert.equal(oCustomList.getItems().length, 1, "Custom template list has one item (oSecondModel, data)");
		assert.deepEqual(oCustomList.getModel(), oSecondModel, "Manual model propagated");
		assert.ok(oCustomList.getModel(this.oAFPanel.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Inner panel p13n model propagated");

		assert.equal(oCustomList.getItems()[0].getContent()[0].getText(), "Some Test Text", "Custom binding from outside working in factory");

	});

	QUnit.test("Check view toggle", function(assert){

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("group");

		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "Group view is the default");

		this.oAFPanel.switchView("group");
		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "Group view is unchanged");

		this.oAFPanel.switchView("list");
		assert.equal(this.oAFPanel.getCurrentViewKey(), "list", "List view should be selected");

		this.oAFPanel.switchView("group");
		assert.equal(this.oAFPanel.getCurrentViewKey(), "group", "List view should be selected");

	});

	QUnit.test("Check inner controls upon toggling the view", function (assert) {

		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));
		this.oAFPanel.switchView("group");

		this.oAFPanel.switchView("list");
		assert.ok(this.oAFPanel.getCurrentViewContent().isA("sap.m.p13n.SelectionPanel"));

		this.oAFPanel.switchView("group");
		assert.ok(this.oAFPanel.getCurrentViewContent().isA("sap.ui.mdc.p13n.panels.GroupView"));

	});

	QUnit.test("Check 'addCustomView'", function(assert){

		//add a custom view
		this.oAFPanel.addCustomView({
			item: new SegmentedButtonItem({
				key: "test",
				icon: "sap-icon://bar-chart"
			}),
			content: new List("myCustomList1",{})
		});

		//Check that the UI has been enhanced
		assert.equal(this.oAFPanel.getViews().length, 3, "A custom view has been added");
		assert.equal(this.oAFPanel._getViewSwitch().getItems().length, 3, "The item has been set on the view switch control");
	});

	QUnit.test("Check 'addCustomView' can be used via 'switchView'", function(assert){

		//add a custom view
		this.oAFPanel.addCustomView({
			item: new SegmentedButtonItem({
				key: "test",
				icon: "sap-icon://bar-chart"
			}),
			content: new List("myCustomList2",{})
		});

		this.oAFPanel.switchView("test");

		assert.equal(this.oAFPanel.getCurrentViewKey(), "test", "Correct view has been selected");

		assert.equal(this.oAFPanel._getViewSwitch().getSelectedKey(), "test", "Correct item has been selected in the SegmentedButton");
	});

	QUnit.test("Check 'addCustomView' search callback execution", function(assert){
		var done = assert.async();

		//add a custom view
		this.oAFPanel.addCustomView({
			item: new SegmentedButtonItem({
				key: "test",
				icon: "sap-icon://bar-chart"
			}),
			content: new List("myCustomList",{}),
			search: function(sValue){
				assert.equal(sValue, "Test", "Callback executed with searched String");
				done();
			}
		});

		this.oAFPanel.switchView("test");

		this.oAFPanel._getSearchField().setValue("Test");
		this.oAFPanel._getSearchField().fireLiveChange();
	});

	QUnit.test("Check 'addCustomView' filterChange callback execution", function(assert){
		var done = assert.async(2);

		var iCount = 0;

		//add a custom view
		this.oAFPanel.addCustomView({
			item: new SegmentedButtonItem({
				key: "test",
				icon: "sap-icon://bar-chart"
			}),
			content: new List("myCustomList",{}),
			filterSelect: function(sValue){
				if (iCount == 1) {
					assert.equal(sValue, "all", "Callback executed with 'all' key");
				}
				if (iCount == 2) {
					assert.equal(sValue, "visible", "Callback executed with 'visible' key");
				}
				iCount++;
				done();
			}
		});

		//Switch to custom view
		this.oAFPanel.switchView("test");

		//Trigger a Select event (with 'all')
		this.oAFPanel._getQuickFilter().fireChange({
			selectedItem: this.oAFPanel._getQuickFilter().getItems()[0]
		});

		//Trigger a Select event (with 'visible')
		this.oAFPanel._getQuickFilter().fireChange({
			selectedItem: this.oAFPanel._getQuickFilter().getItems()[0]
		});
	});

	QUnit.test("Check 'addCustomView' view switch callback execution", function(assert){
		var done = assert.async();
		var oItem = new SegmentedButtonItem({
			key: "test",
			icon: "sap-icon://bar-chart"
		});

		//add a custom view
		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("myCustomList3",{}),
			selectionChange: function(sKey){
				assert.equal(sKey, "test", "Callback executed with key");
				done();
			}
		});

		this.oAFPanel._getViewSwitch().fireSelectionChange({
			item: oItem
		});

	});

	QUnit.test("Check 'addCustomView' searchcallback on view switch execution", function (assert) {
		var done = assert.async();
		var oItem = new SegmentedButtonItem({
			key: "test",
			icon: "sap-icon://bar-chart"
		});
		//add a custom view
		this.oAFPanel.addCustomView({
			item: oItem,
			content: new List("myCustomList4", {}),
			search: function (sSearch) {
				assert.equal(sSearch, "Test", "Callback executed with key");
				done();
			}
		});
		this.oAFPanel._getSearchField().setValue("Test");
		this.oAFPanel._getViewSwitch().fireSelectionChange({
			item: oItem
		});
	});


	QUnit.test("Check 'addCustomView' error if no key is provided", function(assert){

		assert.throws(
			function () {
				this.oAFPanel.addCustomView({
					item: new SegmentedButtonItem({
						icon: "sap-icon://bar-chart"
					}),
					content: new List("myCustomList5",{}),
					selectionChange: function(sKey){
					}
				});
			},
			function (oError) {
				return (
					oError instanceof Error &&
					oError.message ===
						"Please provide an item of type sap.m.SegmentedButtonItem with a key"
				);
			},
			"An error should be thrown if no item is provided or if the key is missing"
		);

	});

	QUnit.test("Check 'restoreDefaults' to reset the searchfield text", function(assert){

		this.oAFPanel._getSearchField().setValue("Test");
		var oFilterSpy = sinon.spy(this.oAFPanel, "_filterByModeAndSearch");

		assert.equal(this.oAFPanel._getSearchField().getValue(), "Test", "Value 'Test' is present on the SearchField");

		this.oAFPanel.restoreDefaults();
		assert.ok(oFilterSpy.calledOnce, "Filter logic executed again after defaults have been restored");
		assert.equal(this.oAFPanel._getSearchField().getValue(), "", "SearchField is empty after defaults have been restored");

		this.oAFPanel._filterByModeAndSearch.restore();

	});

	QUnit.module("'AdaptFiltersPanel' instance with a custom model name",{
		beforeEach: function() {
			this.oAFPanel = new AdaptFiltersPanel();

			this.oAFPanel.P13N_MODEL = "$My_very_own_model";

			this.aMockInfo = aInfoData;
			this.oAFPanel.setItemFactory(function(){
				return new CustomListItem({
					//Check both ways, one time via P13N_MODEL, one time hard coded
					selected: "{" + this.oAFPanel.P13N_MODEL + ">selected}",
					visible: "{" + "$My_very_own_model" + ">visibleInDialog}"
				});
			}.bind(this));

			this.oPropertyHelper = new PropertyHelper(this.aMockInfo);
			this.oP13nData = P13nBuilder.prepareAdaptationData(aInfoData, function(mItem, oProperty) {
				if (oProperty.name == "key2") {
					mItem.active = true;
				}
				mItem.visibleInDialog = true;
				mItem.visible = aVisible.indexOf(oProperty.name) > -1;
				return true;
			}, true);

			this.oAFPanel.placeAt("qunit-fixture");
			oCore.applyChanges();

		},
		afterEach: function() {
			this.oAFPanel.destroy();
		}
	});

	QUnit.test("Instantiate panel and check model", function(assert){
		assert.ok(this.oAFPanel, "Panel created");
		this.oAFPanel.setP13nModel(new JSONModel(this.oP13nData));

		assert.ok(this.oAFPanel.getP13nModel().isA("sap.ui.model.json.JSONModel"), "Model has been set");
		assert.ok(!this.oAFPanel.getModel("$p13n"), "The default $p13n model has not been set");
		assert.ok(this.oAFPanel.getModel("$My_very_own_model").isA("sap.ui.model.json.JSONModel"), "Model has been set");
	});

});
