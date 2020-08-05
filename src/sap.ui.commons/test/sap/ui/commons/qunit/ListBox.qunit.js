/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/ListBox",
	"sap/ui/core/ListItem",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/core/library"
], function(
	createAndAppendDiv,
	ListBox,
	ListItem,
	jQuery,
	Device,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// prepare DOM
	createAndAppendDiv("uiArea1");



	var bEditable = true,
		bEnabled = true,
		bAllowMultiSelect = true,
		bVisible = true,
		sWidth = "100px",
		sHeight = "200px",
		sTooltip = "fooltip",
		iScrollTop = 0;

	function selectEventHandler() {
		// this test tests by just being counted in the respective test
		QUnit.config.current.assert.ok(true, "This text means the select event handler has been executed.");
	}

	var oCtrl = new ListBox("ListBox1", {
		editable:bEditable,
		enabled:bEnabled,
		allowMultiSelect:bAllowMultiSelect,
		visible:bVisible,
		width:sWidth,
		height:sHeight,
		tooltip:sTooltip,
		scrollTop:iScrollTop
	});
	oCtrl.attachSelect(selectEventHandler);
	oCtrl.placeAt("uiArea1");

	var oItem0 = new ListItem("item0",{text:"An Item",additionalText:"abc",key:"key0"});
	var oItem1 = new ListItem("item1",{text:"Second Item",additionalText:"d",key:"key1"});
	var oItem2 = new ListItem("item2",{text:"Third Item", key:"" });



	/**************** TESTS ********************/

	QUnit.module("Properties", {
		beforeEach: function(){
			oCtrl.removeAllItems();
			oCtrl.addItem(oItem0);
			oCtrl.addItem(oItem1);
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Initial Check", function(assert) {
		assert.ok(oCtrl, "ListBox should exist after creating");

		var oDomRef = document.getElementById("ListBox1");
		assert.ok(oDomRef, "ListBox root element should exist");
	});


	/**
	 * Test width
	 */
	QUnit.test("Width", function(assert) {
		assert.equal(oCtrl.getWidth(), sWidth, "ListBox width property should have the value that was set");

		// check width in DOM
		var oDomRef = document.getElementById("ListBox1");
		assert.equal(oDomRef.offsetWidth, parseInt(sWidth), "actual ListBox width should match the applied setting");
	});


	/**
	 * Test min-width
	 */
	QUnit.test("MinWidth", function(assert) {
		oCtrl.setMinWidth("400px");
		sap.ui.getCore().applyChanges();

		// check width in DOM
		var expectedSetting = (Device.browser.msie
				&& (!document.documentMode || document.documentMode < 9)) ? "398px" : "400px"; // the visual result is 400px in both cases
		var $DomRef = jQuery("#ListBox1");
		assert.equal($DomRef.css("min-width"), expectedSetting, "min-width should be set in CSS");
		assert.equal($DomRef[0].offsetWidth, 400, "actual ListBox width should be determined by the min-width");
		oCtrl.setMinWidth(null);
	});


	/**
	 * Test max-width
	 */
	QUnit.test("MaxWidth", function(assert) {
		oCtrl.setMaxWidth("50px");
		sap.ui.getCore().applyChanges();

		// check width in DOM
		var expectedSetting = (Device.browser.internet_explorer
				&& (!document.documentMode || document.documentMode < 9)) ? "48px" : "50px"; // the visual result is 50px in both cases
		var $DomRef = jQuery("#ListBox1");
		assert.equal($DomRef.css("max-width"), expectedSetting, "max-width should be set in CSS");
		assert.equal($DomRef[0].offsetWidth, 50, "actual ListBox width should be determined by the max-width");
		oCtrl.setMaxWidth(null);
	});


	/**
	 * Tests accessor method for property allowMultiSelect of control ListBox.
	 */
	QUnit.test("Multi Selection", function(assert) {
	   assert.equal(oCtrl.getAllowMultiSelect(), bAllowMultiSelect);

	   oCtrl.addSelectedIndex(1);
	   oCtrl.addSelectedIndex(0);
	   assert.equal(2, oCtrl.getSelectedIndices().length, "number of selected indices with multi-select must be correct");

	   oCtrl.setAllowMultiSelect(false);
	   assert.equal(oCtrl.getSelectedIndices().length, 1, "number of selected indices after removing multi-select must be correct");
	   assert.equal(oCtrl.getSelectedIndices()[0], 0, "selected index after removing multi-select is wrong");
	   oCtrl.setAllowMultiSelect(true);
   });


	/**
	 * Test height
	 */
	QUnit.test("Height", function(assert) {
		assert.equal(oCtrl.getHeight(), sHeight, "ListBox height property must reflect settings");

		// check height in DOM
		var oDomRef = document.getElementById("ListBox1");

		assert.equal(oDomRef.offsetHeight, parseInt(sHeight), "actual ListBox height must reflect settings");
	});


	/**
	 * Test tooltip
	 */
	QUnit.test("Tooltip", function(assert) {
		assert.equal(oCtrl.getTooltip(), sTooltip, "ListBox tooltip property must reflect settings");

		// check tooltip in DOM
		var oDomRef = document.getElementById("ListBox1");
		assert.equal(oDomRef.getAttribute("title"), sTooltip, "actual Tooltip must reflect settings");
	});


	/**
	 * Test DisplaySecondaryValues + DisplayIcons
	 */
	QUnit.test("DisplaySecondaryValues and DisplayIcons", function(assert) {
		var oDomRef = document.getElementById("item0");
		assert.equal(oDomRef.childNodes.length, 1, "ListItem should only have one child node by default");

		oCtrl.setDisplaySecondaryValues(true);
		sap.ui.getCore().applyChanges();
		oDomRef = document.getElementById("item0");
		assert.equal(oDomRef.childNodes.length, 2, "ListItem should have two child nodes if secondary values are displayed");

		oCtrl.setDisplayIcons(true);
		sap.ui.getCore().applyChanges();
		oDomRef = document.getElementById("item0");
		assert.equal(oDomRef.childNodes.length, 3, "ListItem should have three child nodes if also icons are displayed");
		var imgSpan = oDomRef.childNodes[0];
		assert.equal(imgSpan.firstChild.tagName.toUpperCase(), "IMG", "there should actually be an image in the first column");
	});

	/**
	 * Test text alignment
	 */
	QUnit.test("Text Alignment", function(assert) {
		oCtrl.setDisplaySecondaryValues(true);
		oCtrl.setDisplayIcons(true);
		sap.ui.getCore().applyChanges();
		var oDomRef = document.getElementById("item0");
		var iconSpan = jQuery(oDomRef.childNodes[0]);
		var valueSpan = jQuery(oDomRef.childNodes[1]);
		var secondaryValueSpan = jQuery(oDomRef.childNodes[2]);

		// default alignments
		assert.equal(iconSpan.css("text-align"), "center", "icon should be center-aligned by default");
		assert.equal(valueSpan.css("text-align"), "left", "text should be left-aligned by default");
		assert.equal(secondaryValueSpan.css("text-align"), "left", "text should be left-aligned by default");

		// change alignment to end
		oCtrl.setValueTextAlign(TextAlign.End);
		oCtrl.setSecondaryValueTextAlign(TextAlign.End);
		sap.ui.getCore().applyChanges();
		oDomRef = document.getElementById("item0");
		iconSpan = jQuery(oDomRef.childNodes[0]);
		valueSpan = jQuery(oDomRef.childNodes[1]);
		secondaryValueSpan = jQuery(oDomRef.childNodes[2]);

		// end alignments
		assert.equal(valueSpan.css("text-align"), "right", "text should be right-aligned");
		assert.equal(secondaryValueSpan.css("text-align"), "right", "text should be right-aligned");

		// change alignment to right
		oCtrl.setValueTextAlign(TextAlign.Right);
		oCtrl.setSecondaryValueTextAlign(TextAlign.Right);
		sap.ui.getCore().applyChanges();
		oDomRef = document.getElementById("item0");
		iconSpan = jQuery(oDomRef.childNodes[0]);
		valueSpan = jQuery(oDomRef.childNodes[1]);
		secondaryValueSpan = jQuery(oDomRef.childNodes[2]);

		// right alignments
		assert.equal(valueSpan.css("text-align"), "right", "text should be right-aligned");
		assert.equal(secondaryValueSpan.css("text-align"), "right", "text should be right-aligned");
	});


	/**
	 * Tests accessor method for property scrollTop of control ListBox.
	 */
	QUnit.test("ScrollTop", function(assert) {
		assert.equal(oCtrl.getScrollTop(), iScrollTop, "getScrollTop() must be correct initially");
		var oDomRef = document.getElementById("ListBox1");
		assert.equal(oDomRef.scrollTop, iScrollTop, "oDomRef.scrollTop must be correct initially");

		// add more items to allow scrolling
		for (var i = 0; i < 30; i++) {
			var oItem = new ListItem();
			oItem.setText("item " + i);
			oCtrl.addItem(oItem);
		}
		sap.ui.getCore().applyChanges();
		oDomRef = document.getElementById("ListBox1");
		assert.equal(oCtrl.getScrollTop(), iScrollTop, "getScrollTop() must be correct after adding items");
		assert.equal(oDomRef.scrollTop, iScrollTop, "oDomRef.scrollTop must be correct after adding items");

		// now scroll - no re-rendering should be required
		oCtrl.setScrollTop(33);
		oDomRef = document.getElementById("ListBox1");
		assert.equal(oCtrl.getScrollTop(), 33, "getScrollTop() must be correct after changing scrollTop");
		assert.equal(oDomRef.scrollTop, 33, "oDomRef.scrollTop must be correct after changing scrollTop");

		// make sure the scroll position remains after re-rendering
		oCtrl.invalidate();
		sap.ui.getCore().applyChanges();
		oDomRef = document.getElementById("ListBox1");
		assert.equal(oCtrl.getScrollTop(), 33, "getScrollTop() must be correct after re-rendering");
		assert.equal(oDomRef.scrollTop, 33, "oDomRef.scrollTop must be correct after re-rendering");
	});



	// ==================================================
	//    test control methods
	//==================================================

	QUnit.module("Selected Indices", {
		beforeEach: function(){
			oCtrl.removeAllItems();
			oCtrl.addItem(oItem0);
			oCtrl.addItem(oItem1);
			sap.ui.getCore().applyChanges();
		}
	});

	/**
	 * Tests method getSelectedIndex of control ListBox.
	 */
	QUnit.test("GetSelectedIndex", function(assert) {
		assert.equal(oCtrl.getSelectedIndex(), -1, "oCtrl.getSelectedIndex() is wrong");
	});

	/**
	 * Tests method setSelectedIndex of control ListBox.
	 */
	QUnit.test("SetSelectedIndex", function(assert) {
		oCtrl.setSelectedIndex(2); // invalid indices may not change the selection
		assert.equal(oCtrl.getSelectedIndex(), -1, "oCtrl.getSelectedIndex() after .setSelectedIndex() with invalid indices is wrong");
		oCtrl.setSelectedIndex(-2);
		assert.equal(oCtrl.getSelectedIndex(), -1, "oCtrl.getSelectedIndex() after .setSelectedIndex() with invalid indices is wrong");
		oCtrl.setSelectedIndex(999);
		assert.equal(oCtrl.getSelectedIndex(), -1, "oCtrl.getSelectedIndex() after .setSelectedIndex() with invalid indices is wrong");

		oCtrl.setSelectedIndex(1);
		assert.equal(oCtrl.getSelectedIndex(), 1, "oCtrl.getSelectedIndex() after .setSelectedIndex(1) is wrong");
		oCtrl.setSelectedIndex(0);
		assert.equal(oCtrl.getSelectedIndex(), 0, "oCtrl.getSelectedIndex() after .setSelectedIndex(0) is wrong");
		oCtrl.setSelectedIndex(-1); // reset for next tests
	});

	/**
	 * Tests method addSelectedIndex of control ListBox.
	 */
	QUnit.test("AddSelectedIndex", function(assert) {
		oCtrl.addSelectedIndex(1);
		oCtrl.addSelectedIndex(-3);
		assert.equal(oCtrl.getSelectedIndex(), 1, "selected index after adding first index is wrong");
		oCtrl.addSelectedIndex(0);
		assert.equal(oCtrl.getSelectedIndex(), 0, "selected index after adding second index is wrong");

		assert.equal(oCtrl.getSelectedIndices().length, 2, "number of selected indices after adding second index is wrong");
		assert.equal(oCtrl.getSelectedIndices()[0], 0, "first selected index after adding second index is wrong");
		assert.equal(oCtrl.getSelectedIndices()[1], 1, "second selected index after adding second index is wrong");
	});

	/**
	 * Tests method removeSelectedIndex of control ListBox.
	 */
	QUnit.test("RemoveSelectedIndex", function(assert) {
		oCtrl.addSelectedIndex(1);
		oCtrl.addSelectedIndex(0);
		oCtrl.addSelectedIndex(-3);
		oCtrl.addSelectedIndex(99);
		oCtrl.removeSelectedIndex(0);
		assert.equal(oCtrl.getSelectedIndex(), 1, "selected index after adding two and removing the first index is wrong");
		oCtrl.removeSelectedIndex(1);
		assert.equal(oCtrl.getSelectedIndex(), -1, "selected index after adding two and removing both is wrong");
	});

	/**
	 * Tests method getSelectedIndices of control ListBox.
	 */
	QUnit.test("GetSelectedIndices", function(assert) {
		oCtrl.addSelectedIndex(1);
		oCtrl.addSelectedIndex(0);
		oCtrl.addSelectedIndex(99);
		assert.equal(oCtrl.getSelectedIndices().length, 2, "number of selected indices after adding second index is wrong");
		assert.equal(oCtrl.getSelectedIndices()[0], 0, "first selected index after adding second index is wrong");
		assert.equal(oCtrl.getSelectedIndices()[1], 1, "second selected index after adding second index is wrong");
	});

	/**
	 * Tests method setSelectedIndices of control ListBox.
	 */
	QUnit.test("SetSelectedIndices", function(assert) {
		var aIndices = [-3,0,1,99];
		oCtrl.setSelectedIndices(aIndices);
		assert.equal(oCtrl.getSelectedIndices().length, 2, "number of selected indices after adding second index is wrong");
		assert.equal(oCtrl.getSelectedIndices()[0], 0, "first selected index after setting two valid indices is wrong");
		assert.equal(oCtrl.getSelectedIndices()[1], 1, "second selected index after setting two valid indices is wrong");

		oCtrl.setSelectedIndices([]);
		assert.equal(oCtrl.getSelectedIndices().length, 0, "number of selected indices after setting an empty selection is wrong");
	});

	/**
	 * Tests method addSelectedIndices of control ListBox.
	 */
	QUnit.test("AddSelectedIndices", function(assert) {
		var aIndices = [-3,0,1,99];
		oCtrl.addSelectedIndices(aIndices);
		assert.equal(oCtrl.getSelectedIndices().length, 2, "number of selected indices after adding two valid indices is wrong");
		assert.equal(oCtrl.getSelectedIndices()[0], 0, "first selected index after adding two valid indices is wrong");
		assert.equal(oCtrl.getSelectedIndices()[1], 1, "second selected index after adding two valid indices is wrong");
	});

	/**
	 * Tests method isIndexSelected of control ListBox.
	 */
	QUnit.test("IsIndexSelected", function(assert) {
		oCtrl.setSelectedIndex(1);
		assert.equal(oCtrl.isIndexSelected(1), true, "oCtrl.isIndexSelected(1) after .setSelectedIndex(1) is wrong");
		assert.equal(oCtrl.isIndexSelected(0), false, "oCtrl.isIndexSelected(0) after .setSelectedIndex(1) is wrong");
	});



	QUnit.module("Keys", {
		beforeEach: function(){
			oCtrl.removeAllItems();
			oCtrl.addItem(oItem0);
			oCtrl.addItem(oItem1);
			oCtrl.addItem(oItem2);
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("SetSelectedKeys + GetSelectedKeys", function(assert) {
		var aKeys = [undefined,"key0","key2"];
		oCtrl.setSelectedKeys(aKeys);
		assert.equal(oCtrl.getSelectedKeys().length, 1, "number of selected keys should be 1");
		assert.equal(oCtrl.getSelectedKeys()[0], "key0", "selected key after setting selected keys should be 'key0'");

		oCtrl.setSelectedKeys(["key0","key1"]);
		assert.equal(oCtrl.getSelectedKeys().length, 2, "number of selected keys should be 2");
		assert.equal(oCtrl.getSelectedKeys()[0], "key0", "first selected key after setting selected keys should be 'key0'");
		assert.equal(oCtrl.getSelectedKeys()[1], "key1", "second selected key after setting selected keys should be 'key1'");

		oCtrl.setSelectedKeys(["key1"]);
		assert.equal(oCtrl.getSelectedKeys().length, 1, "number of selected keys should be 1");
		assert.equal(oCtrl.getSelectedKeys()[0], "key1", "selected key after setting selected keys should be 'key1'");

		oCtrl.setSelectedKeys([""]);
		assert.equal(oCtrl.getSelectedKeys().length, 1, "number of selected keys should be 1");
		assert.equal(oCtrl.getSelectedKeys()[0], "", "selected key after setting selected keys should be '' (empty string)");

		oCtrl.setSelectedKeys([]);
		assert.equal(oCtrl.getSelectedKeys().length, 0, "number of selected keys should be 0");
	});



	QUnit.module("Items", {
		beforeEach: function(){
			oCtrl.removeAllItems();
			oCtrl.addItem(oItem0);
			oCtrl.addItem(oItem1);
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("GetSelectedItem", function(assert) {
		var item = oCtrl.getSelectedItem();
		assert.ok(item == null, "oCtrl.getSelectedItem() with no selection is wrong");
		oCtrl.addSelectedIndex(1);
		oCtrl.addSelectedIndex(0);
		item = oCtrl.getSelectedItem();
		assert.ok(item == oItem0, "oCtrl.getSelectedItem() is wrong");
	});

	/**
	 * Tests method getSelectedItems of control ListBox.
	 */
	QUnit.test("GetSelectedItems", function(assert) {
		assert.equal(oCtrl.getSelectedItems().length, 0, "oCtrl.getSelectedItems() with no selection is wrong");
		oCtrl.addSelectedIndex(1);
		oCtrl.addSelectedIndex(0);

		assert.equal(oCtrl.getSelectedItems().length, 2, "number of selected items returned by oCtrl.getSelectedItems is wrong");
		assert.ok(oCtrl.getSelectedItems()[0] == oItem0, "first returned item is wrong");
		assert.ok(oCtrl.getSelectedItems()[1] == oItem1, "second returned item is wrong");
	});


	QUnit.test("GetItems", function(assert) {
		assert.equal(oCtrl.getItems().length, 2, "oCtrl.getItems() with no selection is wrong");
		assert.ok(oCtrl.getItems()[0] == oItem0, "first returned item is wrong");
		assert.ok(oCtrl.getItems()[1] == oItem1, "second returned item is wrong");
	});

	QUnit.test("AddItem", function(assert) {
		oCtrl.addSelectedIndex(1);
		oCtrl.addSelectedIndex(0);

		var oItem2 = new ListItem();
		oItem2.setText("Third Item");
		oCtrl.addItem(oItem2);

		// test the items
		assert.equal(oCtrl.getItems().length, 3, "oCtrl.getItems() after adding a third item is wrong");
		assert.ok(oCtrl.getSelectedItems()[0] == oItem0, "first returned item is wrong");
		assert.ok(oCtrl.getSelectedItems()[1] == oItem1, "second returned item is wrong");
		assert.ok(oCtrl.getItems()[2] == oItem2, "third returned item is wrong");

		// test the adoption of the selection
		assert.equal(oCtrl.getSelectedIndices().length, 2, "number of selected indices after adding third item is wrong");
		assert.ok(oCtrl.getSelectedIndices()[0] == 0, "first selected index after third item is wrong");
		assert.ok(oCtrl.getSelectedIndices()[1] == 1, "second selected index after third item is wrong");
	});

	QUnit.test("InsertItem", function(assert) {
		oCtrl.addSelectedIndex(1);
		oCtrl.addSelectedIndex(0);

		var oItem2 = new ListItem();
		oItem2.setText("Third Item inserted");
		oCtrl.insertItem(oItem2, 1);

		// test the items
		assert.equal(oCtrl.getItems().length, 3, "oCtrl.getItems() after adding a third item is wrong");
		assert.ok(oCtrl.getItems()[0] == oItem0, "first returned item is wrong");
		assert.ok(oCtrl.getItems()[1] == oItem2, "second returned item is wrong");
		assert.ok(oCtrl.getItems()[2] == oItem1, "third returned item is wrong");

		// test the adoption of the selection
		assert.equal(oCtrl.getSelectedIndices().length, 2, "number of selected indices after adding third item is wrong");
		assert.ok(oCtrl.getSelectedIndices()[0] == 0, "first selected index after third item is wrong");
		assert.ok(oCtrl.getSelectedIndices()[1] == 2, "second selected index after third item is wrong");
	});

	QUnit.test("RemoveItem", function(assert) {
		oCtrl.addSelectedIndex(1);
		oCtrl.addSelectedIndex(0);

		oCtrl.removeItem(0);

		// test the items
		assert.equal(oCtrl.getItems().length, 1, "oCtrl.getItems() after removing an item is wrong");
		assert.ok(oCtrl.getItems()[0] == oItem1, "first returned item is wrong");

		// test the adoption of the selection
		assert.equal(oCtrl.getSelectedIndices().length, 1, "number of selected indices after removing an item is wrong");
		assert.ok(oCtrl.getSelectedIndices()[0] == 0, "first selected index after removing an item is wrong");
	});

	QUnit.test("RemoveAllItems", function(assert) {
		oCtrl.addSelectedIndex(1);
		oCtrl.addSelectedIndex(0);

		oCtrl.removeAllItems();

		// test the items
		assert.equal(oCtrl.getItems().length, 0, "oCtrl.getItems() after removing all items is wrong");

		// test the adoption of the selection
		assert.equal(oCtrl.getSelectedIndices().length, 0, "number of selected indices after removing all items is wrong");
	});

	QUnit.test("DestroyItems", function(assert) {
		oCtrl.addSelectedIndex(1);
		oCtrl.addSelectedIndex(0);

		oCtrl.destroyItems();

		// test the items
		assert.equal(oCtrl.getItems().length, 0, "oCtrl.getItems() after destroying all items is wrong");

		// test the adoption of the selection
		assert.equal(oCtrl.getSelectedIndices().length, 0, "number of selected indices after destroying all items is wrong");
	});



	QUnit.module("Height in Items", {
		beforeEach: function(){
			oCtrl.removeAllItems();
			// add more items to allow scrolling
			for (var i = 0; i < 20; i++) {
				var oItem = new ListItem();
				oItem.setText("item " + i);
				oCtrl.addItem(oItem);
			}
			oCtrl.setHeight("100px");
			sap.ui.getCore().applyChanges();
		}
	});


	// ==================================================
	//          test event handlers
	// ==================================================

	QUnit.module("Events");

	/**
	 * Tests event handling for event select of control ListBox.
	 */
	QUnit.test("Select Event", function(assert) {
		assert.expect(1); // needs to include the test in selectEventHandler !!
		oCtrl.fireSelect();
	});
});