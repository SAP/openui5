/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/json/JSONModel",
	"sap/ui/ux3/DataSetItem",
	"sap/ui/ux3/DataSetSimpleView",
	"sap/ui/ux3/DataSet",
	"sap/ui/core/Control",
	"sap/ui/commons/Button",
	"sap/ui/core/mvc/View" // sap.ui.view
], function(
	qutils,
	createAndAppendDiv,
	jQuery,
	JSONModel,
	DataSetItem,
	DataSetSimpleView,
	DataSet,
	Control,
	Button
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["content", "content2"]);


	var oDataSet,oDataSetItem, oDataSetItem2, oView, oDataSetSimpleView, oDataSetSimpleView2, oButton,
		oModel = new JSONModel(),
		data = { test : [] };

	function search(oEvent) {
		window.filterValue = oEvent.getParameters().query;
		QUnit.config.current.assert.ok(true,"search");
	}

	function handleSelection(oEvent) {
		//window.filterValue = oEvent.getParameters().filterValue;
		QUnit.config.current.assert.ok(true,"item selection");
	}

	var i;

	for ( i = 0; i < 5; i++) {
		var item = {};
		item.imageSrc = "test-resources/sap/ui/ux3/images/dataset/img" + (i + 1)
				+ ".jpg";
		item.title = "Image: img" + (i + 1) + ".jpg";
		item.test = [];
		for ( var j = 6; j < 12; j++) {
			var item2 = {};
			item2.imageSrc = "test-resources/sap/ui/ux3/images/dataset/img"
					+ (j + 1) + ".jpg";
			item2.title = "Image: img" + (j + 1) + ".jpg";
			item.test.push(item2);
		}
		data.test.push(item);
	}
	oModel.setData(data);

	oView = sap.ui.view({
		type : "XML",
		viewName : "dataset.item"
	});
	oDataSetItem = new DataSetItem();
	oDataSetItem2 = new DataSetItem();
	oDataSetSimpleView = new DataSetSimpleView("SV1",{
		template : oView
	});
	oDataSet = new DataSet();
	oDataSet.setModel(oModel);

	var TestItem = Control.extend("TestItem", {
		renderer: function(rm, ctrl){
			rm.write("<div");
			rm.writeControlData(ctrl);
			rm.writeAttribute("style", "display:inline-block;min-width:200px;height:20px;padding:5px;position:relative;box-sizing:border-box;-moz-box-sizing:border-box;");
			rm.write("><div");
			rm.writeAttribute("style", "background-color:red;height:100%;");
			rm.write("></div></div>");
		}
	});

	var oModel2 = new JSONModel();
	var data2 = {items: []};
	for (i = 0; i < 10; i++){
		data2.items.push({key:"" + i});
	}

	var data3 = {items: []};
	for (i = 0; i < 2; i++){
		data3.items.push({key:"" + i});
	}

	oModel2.setData(data2);
	var oDataSetLayout = new DataSetSimpleView({
		floating: true,
		responsive: false,
		itemMinWidth: 0,
		template: new TestItem()
	});
	var oDataSet2 = new DataSet({
		items: {
			path: "/items",
			template: new DataSetItem({
				title : "{key}"
			})
		},
		views: [oDataSetLayout]
	});
	oDataSet2.setModel(oModel2);
	oDataSet2.placeAt("content2");


	QUnit.test("InitialCheck", function(assert) {
		assert.expect(3);
		assert.ok(DataSet, "sap.ui.ux3.DataSet must be defined");
		assert.ok(DataSetItem, "sap.ui.ux3.DataSetItem must be defined");
		assert.ok(DataSetSimpleView,
				"sap.ui.ux3.DataSetSimpleView must be defined");
	});

	QUnit.module("DataSetItem");

	QUnit.test("Instantiation", function(assert) {
		assert.expect(2);
		assert.ok(oDataSetItem, "oDataSetItem must exist after creation");
		assert.ok(oDataSetItem instanceof DataSetItem,
				"oDataSetItem must be instance of sap.ui.ux3.DataSetItem");
	});

	QUnit.module("DataSetSimpleView");

	QUnit.test("Instantiation", function(assert) {
		assert.expect(2);
		assert.ok(oDataSetSimpleView,
				"oDataSetSimpleView must exist after creation");
		assert.ok(oDataSetSimpleView instanceof DataSetSimpleView,
				"oDataSetSimpleView must be instance of sap.ui.ux3.DataSetSimpleView");
	});

	QUnit.module("DataSet");

	QUnit.test("Instantiation", function(assert) {
		assert.expect(2);
		assert.ok(oDataSet, "oDataSet must exist after creation");
		assert.ok(oDataSet instanceof DataSet,
				"oDataSet must be instance of sap.ui.ux3.DataSet");
	});

	QUnit.test("AddItems", function(assert) {
		assert.expect(2);
		oDataSet.addItem(oDataSetItem);
		assert.equal(oDataSet.getItems().length, 1, "getItems must return 1 item");
		oDataSetItem2 = oDataSetItem.clone();
		oDataSet.addItem(oDataSetItem2);
		assert.equal(oDataSet.getItems().length, 2, "getItems must return 2 items");
	});

	QUnit.test("RemoveItems", function(assert) {
		assert.expect(2);
		oDataSet.removeItem(oDataSetItem2);
		assert.equal(oDataSet.getItems().length, 1, "getItems must return 1 item");
		oDataSet.removeItem(oDataSetItem);
		assert.equal(oDataSet.getItems().length, 0, "getItems must return 0 items");
	});

	QUnit.test("LeadSelection", function(assert) {
		assert.expect(3);
		//add some items again
		oDataSet.bindItems("/test",oDataSetItem);

		assert.equal(oDataSet.getLeadSelection(), -1, "LeadSelection: initial selection");
		oDataSet.setLeadSelection(1);
		assert.equal(oDataSet.getLeadSelection(), 1, "LeadSelection: item 1 selected");
		oDataSet.setLeadSelection(2);
		assert.equal(oDataSet.getLeadSelection(), 2, "LeadSelection: item 2 selected");
	});

	QUnit.test("AddViews", function(assert) {
		assert.expect(2);
		oDataSet.addView(oDataSetSimpleView);
		assert.equal(oDataSet.getViews().length, 1, "getView must return 1 view");
		oDataSetSimpleView2 = new DataSetSimpleView("SV2",{
			template : oView.clone()
		});
		oDataSet.addView(oDataSetSimpleView2);
		assert.equal(oDataSet.getViews().length, 2, "getViews must return 2 views");
	});

	QUnit.test("RemoveViews", function(assert) {
		assert.expect(2);
		oDataSet.removeView(oDataSetSimpleView2);
		assert.equal(oDataSet.getViews().length, 1, "getView must return 1 view");
		oDataSet.removeView(oDataSetSimpleView);
		assert.equal(oDataSet.getViews().length, 0, "getView must return 0 views");
	});

	QUnit.test("select view", function(assert) {
		assert.expect(2);
		oDataSet.addView(oDataSetSimpleView);
		oDataSetSimpleView2 = new DataSetSimpleView("SV3",{
			template : oView.clone()
		});
		oDataSet.addView(oDataSetSimpleView2);
		// if no view selected the first view must be selected (0)
		assert.equal(oDataSet.getSelectedView(), "SV1", "selectedView: default selection");
		oDataSet.setSelectedView("SV3");
		assert.equal(oDataSet.getSelectedView(), "SV3", "selectedView: view2 selected");
	});

	QUnit.test("rendering", function(assert) {
		assert.expect(4);
		var done = assert.async();
		oDataSet.placeAt("content");
		setTimeout(function() {
			assert.ok(oDataSet.getDomRef(), "dataset should exist in the page");
			assert.ok(oDataSet.getDomRef("searchValue"),
					"filter field should exist in the page");
			assert.ok(oDataSet.getId() + "-view-" + oDataSet.getViews()[0].getId() ? window.document.getElementById(oDataSet.getId() + "-view-" + oDataSet.getViews()[0].getId()) : null,
					"view button 1 should exist in the page");
			assert.ok(oDataSet.getId() + "-view-" + oDataSet.getViews()[1].getId() ? window.document.getElementById(oDataSet.getId() + "-view-" + oDataSet.getViews()[1].getId()) : null,
					"view button 2 should exist in the page");
			done();
		}, 1000);
	});

	QUnit.test("events", function(assert) {
		assert.expect(6);
		oDataSet.attachSearch(search);
		oDataSet.attachSelectionChanged(handleSelection);
		oDataSet.$("searchValue-tf-input").trigger("focus");
		oDataSet.$("searchValue-tf-input").val("img2");
		qutils.triggerKeydown(oDataSet.$("searchValue-tf-input"), "ENTER");
		assert.equal(window.filterValue, "img2", "Search value");
		oDataSet.$("searchValue-tf-input").trigger("focus");
		oDataSet.$("searchValue-tf-input").val("img4");
		qutils.triggerKeydown(oDataSet.$("searchValue-tf-input"), "ENTER");
		assert.equal(window.filterValue, "img4", "Search value");
		qutils.triggerMouseEvent(oDataSet.getItems()[0].$(),
				"click", 1, 1, 1, 1);
		qutils.triggerMouseEvent(oDataSet.getItems()[3].$(),
				"click", 1, 1, 1, 1);
	});

	QUnit.test("switch views", function(assert) {
		assert.expect(2);
		var done = assert.async();
		assert.ok(oDataSetSimpleView2.getDomRef(), "view 2 must be rendered");
		qutils.triggerMouseEvent(oDataSet.$("view-" + oDataSet.getViews()[0].getId()),
				"click", 1, 1, 1, 1);
		setTimeout(function() {
			assert.ok(oDataSetSimpleView.getDomRef(), "view 1 must be rendered");
			done();
		},500);
	});

	QUnit.test("Toolbar", function(assert) {
		assert.expect(5);
		assert.ok(oDataSet.getShowSearchField(), "SearchField enabled");
		assert.ok(oDataSet.getDomRef("searchValue"), "SearchField rendered");
		oDataSet.setShowSearchField(false);
		assert.ok(!oDataSet.getDomRef("searchValue"), "SearchField hidden");
		oDataSet.setShowSearchField(true);
		oButton = new Button("myBut",{text:"myBut"});
		oDataSet.addToolbarItem(oButton);
		assert.ok(oButton.$(), "Custom Toolbaritem rendered");
		oDataSet.removeToolbarItem(oButton);
		assert.ok(!oButton.$().length, "Custom Toolbaritem removed");
	});

	QUnit.test("Dataset call invalidate when model data is changed when data is initially empty", function (assert) {
		var oModel = new JSONModel(),
			oDataSet = new DataSet({
				items: {
					path: "/items",
					template: new DataSetItem({
						title : "{key}"
					})
				}
			});

		oModel.setData({ items: []});
		oDataSet.setModel(oModel);

		var oDataInvalidateSpy = this.spy(oDataSet, "invalidate");
		oModel.setData({ items: [{}, {}, {}] });

		assert.equal(oDataInvalidateSpy.callCount, 1, "invalidate method is called once when model is changed");

		oDataInvalidateSpy.restore();
		oDataSet.destroy();
	});

	QUnit.module("DataSetSimpleView");

	QUnit.test("selection", function(assert) {
		assert.expect(4);
		assert.ok(oDataSet.getItems()[3].$().hasClass("sapUiUx3DSSVSelected"),"class selected of item 1 is set");
		qutils.triggerMouseEvent(oDataSet.getItems()[1].$(),
				"click", 1, 1, 1, 1);
		assert.ok(oDataSet.getItems()[3].$().hasClass("sapUiUx3DSSVSelected") === false,"class selected of item 1 removed");
		assert.ok(oDataSet.getItems()[1].$().hasClass("sapUiUx3DSSVSelected"),"class selected of item 2 is set");
	});


	function getNumberOfItemsPerRow(){
		var lastOffsetLeft = -1;
		var count = 0;

		oDataSetLayout.$().children().each(function() {
			var offset = jQuery(this)[0].offsetLeft;
			if (lastOffsetLeft < offset){
				count++;
				lastOffsetLeft = offset;
			} else {
				return false;
			}
		});

		return count;
	}


	QUnit.test("Floating Layout", function(assert) {
		assert.ok(oDataSetLayout.$().hasClass("sapUiUx3DSSVFloating"), "class 'sapUiUx3DSSVFloating' is set");
		var expectedItems = Math.floor(oDataSetLayout.$().width() / 200);
		assert.equal(getNumberOfItemsPerRow(), expectedItems, expectedItems + " item(s) per row");
		assert.ok(jQuery(oDataSetLayout.$().children()[0]).outerWidth() - 200 <= 10 /*just some tolerance*/, "item has width of 200px");
	});

	QUnit.test("Responsive Layout", function(assert) {
		oDataSetLayout.setResponsive(true);
		oDataSetLayout.setItemMinWidth(200);
		sap.ui.getCore().applyChanges();

		assert.ok(oDataSetLayout.$().hasClass("sapUiUx3DSSVResponsive"), "class 'sapUiUx3DSSVResponsive' is set");
		var expectedItems = oDataSetLayout._itemsPerRow;
		assert.equal(getNumberOfItemsPerRow(), expectedItems, expectedItems + " item(s) per row");
		assert.ok(jQuery(oDataSetLayout.$().children()[0]).outerWidth() >= 200, "item has at least width of 200px");

		var $Items = oDataSetLayout.$().children();
		var iWidth = 0;
		for (var i = 0; i < expectedItems; i++){
			iWidth += jQuery($Items[i]).outerWidth();
		}
		assert.ok(Math.abs(oDataSetLayout.$().width() - iWidth) <= 10 /*just some tolerance*/, "items in a row occupy the whole row");
	});

	QUnit.test("Single Row Layout", function(assert) {
		oDataSetLayout.setFloating(false);
		oDataSetLayout.setResponsive(false);
		oDataSetLayout.setItemMinWidth(0);
		sap.ui.getCore().applyChanges();

		assert.ok(oDataSetLayout.$().hasClass("sapUiUx3DSSVSingleRow"), "class 'sapUiUx3DSSVSingleRow' is set");
		assert.equal(getNumberOfItemsPerRow(), 1, "one item per row");
		assert.ok(Math.abs(oDataSetLayout.$().width() - jQuery(oDataSetLayout.$().children()[0]).outerWidth()) <= 10 /*just some tolerance*/, "item occupies the whole row");
	});

	QUnit.test("If the view is invisible, items will be destroyed on updateView", function(assert) {
		oDataSetLayout.setVisible(false);
		sap.ui.getCore().applyChanges();

		var sItemId = oDataSet2.getItems()[3].getId();

		assert.ok(sap.ui.getCore().byId(sItemId), "element is presented before updating view");

		// update model so the updateItems function from the DataSet can be triggered
		// it will then trigger updateView function in DataSetSimpleView
		// since the view is not visible and doesn't have DOM ref, before the function was simply returning
		// without doing anything, now it should destroy unused items
		oModel2.setData(data3);
		oDataSet2.setModel(oModel2);
		sap.ui.getCore().applyChanges();

		assert.ok(!oDataSetLayout.getDomRef(), "View is not presented in the DOM");
		assert.ok(!sap.ui.getCore().byId(sItemId), "element is destroyed after updating the View");
	});
});
