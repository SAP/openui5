/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/ux3/NavigationBar",
	"sap/ui/thirdparty/jquery",
	"sap/ui/ux3/NavigationItem"
], function(qutils, createAndAppendDiv, NavigationBar, jQuery, NavigationItem) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1").setAttribute("style", "margin-top:10px;");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		".sapUiUx3NavBarArrow {" +
		"	/* Enable testing of the arrow, even though it is not used outside the shell in BC */" +
		"	display: inline-block !important;" +
		"}";
	document.head.appendChild(styleElement);


	var expectedItemId;

	function eventHandler(oEvent) {
		var itemId = oEvent.getParameter("itemId");
		QUnit.config.current.assert.equal(itemId, expectedItemId, "the item ID should be the one of the clicked item: " + expectedItemId);
		var item = oEvent.getParameter("item");
		QUnit.config.current.assert.ok(item, "item should be given as well");
		QUnit.config.current.assert.equal(item.getId(), expectedItemId, "the item's ID should be the one of the clicked item: " + expectedItemId);
	}

	var oCtrl = new NavigationBar("n1", {select:eventHandler});
	oCtrl.placeAt("uiArea1");


	QUnit.test("Initial Check", function(assert) {
		assert.ok(oCtrl, "NavBar should exist after creating");
		var oDomRef = window.document.getElementById("n1");
		assert.ok(oDomRef, "NavBar root element should exist in the page");
	});


	var item1 = new NavigationItem({text:"Item 1"});
	var item2 = new NavigationItem({text:"Item 2", href:"http://item2.org/"});
	var item3 = new NavigationItem({text:"Item 3"});

	QUnit.test("Add Items", function(assert) {
		oCtrl.addItem(item1);
		oCtrl.addItem(item2);
		oCtrl.addItem(item3);
		sap.ui.getCore().applyChanges();

		var oDomRef = item1.getDomRef();
		assert.ok(oDomRef, "Item element should exist in the page");
		assert.equal(jQuery(oDomRef).text(), "Item 1", "Item 1 text should be written to the page");

		var $list = oCtrl.$("list");
		assert.equal($list.children().length, 5, "3 items plus the selection arrow plus dummy should be in the NavigationBar");
		assert.equal($list.children(":eq(3)").text(), "Item 3", "The text of the third item should be rendered inside the NavigationBar");

		var $items = jQuery(".sapUiUx3NavBarItem");
		assert.equal($items.length, 4, "3 items plus the dummy should be in the page");

		assert.equal($items[2].getAttribute("href"), "http://item2.org/", "item 2 should have a URL set as href");
		assert.equal($items[3].getAttribute("href"), "#", "item 3 should have no URL set as href");
	});

	QUnit.test("Select Item", function(assert) {
		oCtrl.setSelectedItem(item2);
		assert.equal(oCtrl.getSelectedItem(), item2.getId(), "item 2 should be selected");

		var $selItems = jQuery(".sapUiUx3NavBarItemSel");
		assert.equal($selItems.length, 1, "1 item should be selected");
		assert.equal($selItems.children()[0].id, item2.getId(), "DOM element marked as selected should be the one with the same ID as the selected item");
	});

	var firstPos;
	QUnit.test("Selection Arrow", function(assert) {
		var done = assert.async();
		var arrow = oCtrl.getDomRef("arrow");
		assert.ok(arrow, "there should be one selection arrow");

		setTimeout(function(){
			var item = item2.getDomRef();
			var left = item.offsetLeft;
			var width = item.offsetWidth;
			var right = left + 3 * width / 5;
			left = left + 2 * width / 5;
			var arrowPos = arrow.offsetLeft + (arrow.offsetWidth / 2);
			firstPos = arrowPos;

			assert.ok(arrowPos > left && arrowPos < right, "arrow position (" + arrowPos
					+ ") should be around the center of the selected item (between " + left + " and " + right + ")");
			done();
		}, 600);
	});

	QUnit.test("Selection Arrow Animation", function(assert) {
		var done = assert.async();
		oCtrl.setSelectedItem(item3);
		var arrow = oCtrl.getDomRef("arrow");

		setTimeout(function(){
			var arrowPos = arrow.offsetLeft + (arrow.offsetWidth / 2);
			assert.ok(arrowPos > firstPos, "arrow should have moved to the right a bit in the middle of the animation (from " + firstPos + ", now " + arrowPos + ")");

			setTimeout(function() {
				var newArrowPos = arrow.offsetLeft + (arrow.offsetWidth / 2);
				var item = item3.getDomRef();
				var left = item.offsetLeft;
				var width = item.offsetWidth;
				var right = left + 3 * width / 5;
				left = left + 2 * width / 5;

				assert.ok(newArrowPos > arrowPos, "arrow should have moved further to the right after the animation (from " + arrowPos + ", now " + newArrowPos + ")");
				assert.ok(newArrowPos > left && newArrowPos < right, "arrow position (" + newArrowPos
						+ ") should be around the center of the newly selected item (between " + left + " and " + right + ")");
				done();
			}, 400);
		}, 300);
	});

	QUnit.test("Item selection (mouse)", function(assert) {
		var done = assert.async();
		assert.expect(5); // including event handler
		var oldSel = oCtrl.getSelectedItem();
		assert.equal(oldSel, item3.getId(), "item 3 should be selected"); // make sure previous selection is right

		// click first item
		var target = item1.getDomRef();
		expectedItemId = item1.getId();
		qutils.triggerMouseEvent(target, "click");

		// wait selection animation to be finished
		setTimeout(function(){
			var newSel = oCtrl.getSelectedItem();
			assert.equal(newSel, item1.getId(), "item 1 should be selected after clicking it"); // make sure selection is right after clicking
			done();
		}, 600);
	});

	QUnit.test("Render With Association", function(assert) {
		oCtrl.removeAllItems();
		sap.ui.getCore().applyChanges();
		var $list = oCtrl.$("list");
		assert.equal($list.children().length, 2, "no items except for dummy and arrow should be in the NavigationBar");

		oCtrl.addAssociatedItem(item1);
		oCtrl.addAssociatedItem(item2);
		oCtrl.addAssociatedItem(item3);
		sap.ui.getCore().applyChanges();

		var oDomRef = item1.getDomRef();
		assert.ok(oDomRef, "Item element should exist in the page");
		assert.equal(jQuery(oDomRef).text(), "Item 1", "Item 1 text should be written to the page");

		$list = oCtrl.$("list");
		assert.equal($list.children().length, 5, "3 items plus dummy plus the selection arrow should be in the NavigationBar");
		assert.equal($list.children(":eq(3)").text(), "Item 3", "The text of the third item should be rendered inside the NavigationBar");
	});

	QUnit.test("isSelectedItemValid", function(assert) {
		oCtrl.setSelectedItem(item1);
		var valid = oCtrl.isSelectedItemValid();
		assert.equal(valid, true, "item1 is a valid selection");

		oCtrl.setSelectedItem("item4");
		valid = oCtrl.isSelectedItemValid();
		assert.equal(valid, false, "the ID 'item4' is not a valid selection");

		oCtrl.setSelectedItem(item1.getId());
		valid = oCtrl.isSelectedItemValid();
		assert.equal(valid, true, "the ID 'item1' is a valid selection");
	});

	QUnit.test("enabaling the overflowItemsToUppercase", function (assert) {
		var oOverflowMenu = oCtrl._getOverflowMenu();

		assert.strictEqual(oCtrl.getOverflowItemsToUpperCase(), false, "the property is disabled by default");

		oCtrl.setOverflowItemsToUpperCase(true);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(oOverflowMenu.hasStyleClass("sapUiUx3NavBarUpperCaseText"), true,  "the items in the menu are uppercased");

		oCtrl.setOverflowItemsToUpperCase(false);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(oOverflowMenu.hasStyleClass("sapUiUx3NavBarUpperCaseText"), false,  "the items in the menu are with their original case");
	});

	QUnit.test("Overflow", function(assert) {
		var done = assert.async();
		jQuery(document.getElementById("uiArea1")).css("width", "80px");
		setTimeout(function(){
			assert.equal(isForwardVisible(), true, "forward arrow should be visible");
			assert.equal(isForwardEnabled(), true, "forward arrow should be enabled");
			assert.equal(isBackVisible(), true, "back arrow should be visible");
			assert.equal(isBackEnabled(), false, "back arrow should not be enabled");

			jQuery(document.getElementById("uiArea1")).css("width", "800px");
			setTimeout(function(){
				assert.equal(isForwardVisible(), false, "forward arrow should not be visible");
				assert.equal(isBackVisible(), false, "back arrow should not be visible");

				oCtrl.addAssociatedItem(new NavigationItem({text:"Item with some quite long text to cause overflow 4"}));
				oCtrl.addAssociatedItem(new NavigationItem({text:"Item with some quite long text to cause overflow 5"}));
				setTimeout(function(){
					assert.equal(isForwardVisible(), true, "forward arrow should be visible");
					assert.equal(isForwardEnabled(), true, "forward arrow should be enabled");

					assert.equal(isBackVisible(), true, "back arrow should not be visible");
					assert.equal(isBackEnabled(), false, "back arrow should not be enabled");
					done();
				}, 500);
			}, 500);
		}, 500);
	});

	QUnit.test("Scrolling + Overflow", function(assert) {
		var done = assert.async();
		assert.equal(oCtrl.getDomRef("list").scrollLeft, 0, "list should not be scrolled initially");

		// click first item
		var target = oCtrl.$("off");
		qutils.triggerMouseEvent(target, "click");
		setTimeout(function(){
			assert.equal(isForwardVisible(), true, "forward arrow should be visible");
			assert.equal(isBackVisible(), true, "back arrow should be visible");
			assert.ok(oCtrl.getDomRef("list").scrollLeft != 0, "list should be scrolled now");

			// scroll to end
			qutils.triggerMouseEvent(target, "click");
			setTimeout(function(){
				assert.equal(isForwardVisible(), true, "forward arrow should be visible");
				assert.equal(isForwardEnabled(), false, "forward arrow should not be enabled");
				assert.equal(isBackVisible(), true, "back arrow should be visible");
				assert.equal(isBackEnabled(), true, "back arrow should be enabled");

				// scroll to the beginning again
				target = oCtrl.getDomRef("ofb");
				qutils.triggerMouseEvent(target, "click");
				setTimeout(function(){
					qutils.triggerMouseEvent(target, "click");
					setTimeout(function(){
						assert.equal(isForwardVisible(), true, "forward arrow should be visible");
						assert.equal(isForwardEnabled(), true, "forward arrow should be enabled");
						assert.equal(isBackVisible(), true, "back arrow should be visible");
						assert.equal(isBackEnabled(), false, "back arrow shouldnot  be enabled");
						assert.equal(oCtrl.getDomRef("list").scrollLeft, 0, "list should not be scrolled now");

						done();
					}, 600);
				}, 600);
			}, 600);
		}, 600);
	});

	function isForwardVisible() {
		return oCtrl.$("off").is(":visible");
	}
	function isBackVisible() {
		return oCtrl.$("ofb").is(":visible");
	}

	function isForwardEnabled() {
		return oCtrl.$("off").is(":visible") && oCtrl.$().hasClass("sapUiUx3NavBarScrollForward");
	}
	function isBackEnabled() {
		return oCtrl.$("ofb").is(":visible") && oCtrl.$().hasClass("sapUiUx3NavBarScrollBack");
	}
});