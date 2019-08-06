/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/TabStrip",
	"sap/m/TabStripItem",
	"sap/m/library",
	"sap/m/Button",
	"jquery.sap.keycodes",
	"sap/ui/Device",
	"jquery.sap.global",
	"jquery.sap.mobile"
], function(
	qutils,
	createAndAppendDiv,
	TabStrip,
	TabStripItem,
	mobileLibrary,
	Button,
	jQuery,
	Device
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;


	// prepare DOM
	createAndAppendDiv("content");



	var oCore = sap.ui.getCore();

	QUnit.module("API", {
		beforeEach: function () {
			this.sut = new TabStrip({
				items: [
					new TabStripItem({
						text: "Tab 1"
					}),
					new TabStripItem({
						text: "Tab 2"
					}),
					new TabStripItem({
						text: "Tab 3"
					})
				]
			});
			this.sut.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			this.sut.destroy();
		}
	});

	QUnit.test("Initialization without parameters", function (assert) {
		var oTabStrip = new TabStrip();
		assert.strictEqual(typeof oTabStrip === 'object', true, 'Sucessfully initialized.');
		oTabStrip.destroy();
		oTabStrip = null;
	});

	QUnit.test("Set default selected item", function (assert) {
		var oItem2 = new TabStripItem({
			text: "Tab 2"
		});
		var oTS = new TabStrip({
			hasSelect: true,
			selectedItem: oItem2,
			items: [
				new TabStripItem({
					text: "Tab 1"
				}),
				oItem2,
				new TabStripItem({
					text: "Tab 3"
				})
			]
		});
		oTS.placeAt('qunit-fixture');

		this.clock.tick(1000);

		assert.strictEqual(oTS.getAggregation('_select').getSelectedItem().getText(), oItem2.getText(), "Correct default selectedItem property value");

		oTS.destroy();
	});

	QUnit.test("DOM", function (assert) {
		//assert
		assert.ok(this.sut.$().length > 0, "The control was successfully rendered");
	});

	QUnit.test("Control defaults", function (assert) {
		//assert
		assert.ok(!this.sut.getHasSelect(), "Correct default hasSelect property value");
		assert.strictEqual(this.sut.$("touchArea").children(".sapMTSOverflowSelect").length, 0,
				"Select is not rendered in DOM");
		assert.strictEqual(this.sut.getSelectedItem(), null, "Correct default selectedItem property value");

		this.sut.setHasSelect(true);

		assert.ok(this.sut.getHasSelect(), "Correct default hasSelect property value");

		assert.strictEqual(this.sut.getFocusDomRef(), null, "When no item is selected there is no focused DomRef");

		this.sut.setSelectedItem(this.sut.getItems()[1]);

		assert.strictEqual(this.sut.getSelectedItem(),this.sut.getItems()[1].getId(),
				"Correctly set selectedItem property value");
		this.clock.tick(1000);

		assert.strictEqual(this.sut.$("touchArea").children(".sapMTSOverflowSelect").length, 1,
				"Toucharea is rendered in DOM");

		assert.strictEqual(this.sut.getFocusDomRef(), this.sut.getItems()[1].getDomRef(),
				"When there is a selected item the focus is properly set as focused DOM ref");

		assert.strictEqual(this.sut.getAggregation('_select').getSelectedItem().getId(),
				this.sut.getSelectedItem() + TabStrip.SELECT_ITEMS_ID_SUFFIX,
				"The selected item in the select aggregation is the same as the one in the TabStrip area");

		var fnActivateItemSpy = sinon.spy(this.sut, "_activateItem");
		var fnFireItemPressSpy = sinon.spy(this.sut, "fireItemPress");
		var fnSetSelectedItemSpy = sinon.spy(this.sut, "setSelectedItem");

		var srcControl = this.sut.getItems()[1];
		qutils.triggerTouchEvent('touchstart', this.sut.getDomRef(), {changedTouches: [{pageX: srcControl.$().offset().left + 2}], target: srcControl.getDomRef()});
		qutils.triggerTouchEvent('touchend', this.sut.getDomRef(), {changedTouches: [{pageX: srcControl.$().offset().left + 2}], target: srcControl.getDomRef()});
		assert.strictEqual(fnActivateItemSpy.calledWith(srcControl), true, "On tap activates the correct item");

		assert.strictEqual(fnFireItemPressSpy.calledOnce, true, "On tap fires item press event");
		assert.strictEqual(fnSetSelectedItemSpy.calledOnce, false, "On tap does not fire selection change when the same selected tab is pressed");

		srcControl = this.sut.getItems()[2];
		qutils.triggerTouchEvent('touchstart', this.sut.getDomRef(), {changedTouches: [{pageX: srcControl.$().offset().left + 2}], target: srcControl.getDomRef()});
		qutils.triggerTouchEvent('touchend', this.sut.getDomRef(), {changedTouches: [{pageX: srcControl.$().offset().left + 2}], target: srcControl.getDomRef()});
		assert.strictEqual(fnActivateItemSpy.calledWith(srcControl), true, "On tap activates the correct item");

		assert.strictEqual(fnFireItemPressSpy.calledOnce, false, "On tap does not fire an item press event");
		assert.strictEqual(fnSetSelectedItemSpy.calledOnce, true,
				"On tap does not fire selection change when the same selected tab is pressed");

		fnActivateItemSpy.restore();
		fnFireItemPressSpy.restore();
		fnSetSelectedItemSpy.restore();

		assert.strictEqual(this.sut.getItems().length, 3,
				"There are 3 items");

		this.sut.removeAggregation('items', this.sut.getItems()[2]);
		assert.strictEqual(this.sut.getItems().length, 2,
				"After removing an item there are 2 left");
		var oItem = this.sut.getItems()[0];
		var oItemButton = oItem.getAggregation("_closeButton");
		qutils.triggerTouchEvent('touchstart', this.sut.getDomRef(), {changedTouches: [{pageX: oItemButton.$().offset().left + 2}], target: oItemButton.getDomRef()});
		qutils.triggerTouchEvent('touchend', this.sut.getDomRef(), {changedTouches: [{pageX: oItemButton.$().offset().left + 2}], target: oItemButton.getDomRef()});

		this.clock.tick(1000);
		assert.strictEqual(this.sut.getItems().length, 1,
				"Successfuly deleted element when pressing close button");

		this.sut.removeAllAggregation('items', false);
		assert.strictEqual(this.sut.getItems().length, 0,
				"All tabs are removed after remove all aggregation");

		var item1 = new TabStripItem({
			text: "insert item"
		});
		this.sut.insertAggregation('items', item1, 1);
		assert.strictEqual(this.sut.getItems().length, 1,
				"Insert aggregation inserts successfuly");

		this.sut.destroyAggregation('items');
		assert.strictEqual(this.sut.getItems().length, 0,
				"Destroy aggregation destroys successfuly");

		var item2 = new TabStripItem({
			text: "add item"
		});
		this.sut.addAggregation('items', item2, 1);
		assert.strictEqual(this.sut.getItems().length, 1,
				"Add aggregation adds successfuly");
	});

	QUnit.test("Render all tabs", function (assert) {
		//arrange
		this.sut.addItem(new TabStripItem({
			text: "Button tab 1"
		}));
		this.sut.addItem(new TabStripItem({
			text: "Button tab 2"
		}));
		this.sut.addItem(new TabStripItem({
			text: "Button tab 3",
			modified:true
		}));
		oCore.applyChanges();
		assert.strictEqual(this.sut.$().find(".sapMTSTabs").children().length, 6, "All tabs are rendered");

		assert.ok(!this.sut.getAggregation("_leftArrowButton"), "Left button aggregation is not created");
		assert.ok(!this.sut.getAggregation("_rightArrowButton"), "Right button aggregation is not created");

		var itemToBeRemovedId = this.sut.getItems()[2].getId();

		this.sut.removeItem(this.sut.getItems()[2]);
		this.clock.tick(1000);

		assert.strictEqual(this.sut.$("tabs").children("#" + itemToBeRemovedId).length, 0,
				"The ID of the item on position 2 is removed");

		assert.strictEqual(this.sut.getItems()[4].getModified(), true,
				"Modified state is correct");

		var modifiedItem = TabStripItem.CSS_CLASS_MODIFIED;
		assert.strictEqual(jQuery(this.sut.getItems()[3].getFocusDomRef()).hasClass(modifiedItem), false,
				"The correspondent CSS class for the item change state is available ");
		assert.strictEqual(jQuery(this.sut.getItems()[4].getFocusDomRef()).hasClass(modifiedItem), true,
				"The correspondent CSS class for the item change state is available ");

		this.sut.changeItemState(this.sut.getItems()[3].getId(), true);
		assert.strictEqual(jQuery(this.sut.getItems()[3].getFocusDomRef()).hasClass(modifiedItem), true,
				"The correspondent CSS class for the item change state is available ");
	});

	QUnit.test("Add modified symbol class and attributes", function(assert){
		//arrange
		var $modifiedTabSymbol;
		this.sut.addItem(new TabStripItem({
			text: "Button tab 1"
		}));
		this.sut.addItem(new TabStripItem({
			text: "Button tab 2"
		}));
		this.sut.addItem(new TabStripItem({
			text: "Button tab 3",
			modified:true
		}));
		oCore.applyChanges();

		$modifiedTabSymbol = this.sut.getItems()[5].$().find(".sapMTabStripItemModifiedSymbol");

		//assert
		assert.strictEqual($modifiedTabSymbol.attr("role"), "presentation","The proper role is applied.");
		assert.strictEqual($modifiedTabSymbol.attr("aria-hidden"), "true", "The star is hidden from screen reader.");
	});

	// tests for a bug that resulted in destroying the select aggr if it already existed on setHasSelect(true)
	QUnit.test("setHasSelect(true)", function (assert) {
		this.sut.setHasSelect(true);
		assert.strictEqual(this.sut.getHasSelect(), true, "Correct hasSelect property value");
		this.sut.setHasSelect(true);
		assert.strictEqual(this.sut.getAggregation('_select') instanceof sap.m.Select, true, "The select aggregation should not be destroyed when hasSelect is set to 'true'");
	});


	QUnit.test("Selection prevented", function (assert) {
		var oTabStrip = new TabStrip({
			selectedItem: 0,
			itemSelect: function (oEvent) {
				oEvent.preventDefault();
			},
			items: [
				new TabStripItem({
					text: "Tab 1"
				}),
				new TabStripItem({
					text: "Tab 2"
				})
			]
		});

		oTabStrip.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oItem = oTabStrip.getItems()[1];

		assert.strictEqual(oItem.getId() === oTabStrip.getSelectedItem(), false);

		var aTargetTouches = [{pageX: oItem.$().offset().left}];
		qutils.triggerTouchEvent('touchstart', oTabStrip.getDomRef(), {changedTouches: aTargetTouches, target: oItem.getDomRef()}, 'on', true);
		qutils.triggerTouchEvent('touchend', oTabStrip.getDomRef(), {changedTouches: aTargetTouches, target: oItem.getDomRef()}, 'on', true);

		this.clock.tick(1000);

		assert.strictEqual(oItem.getId() === oTabStrip.getSelectedItem(), false);

		oTabStrip.destroy();
		oTabStrip = null;
	});

	QUnit.test("Selected item association is cleared when items are destroyed.", function (assert) {
		//prepare
		var oTabStrip = new TabStrip({
			items: [
				new TabStripItem({
					text: "Tab 1"
				}),
				new TabStripItem({
					text: "Tab 2"
				})
			],
			hasSelect: true
		});
		oTabStrip.setSelectedItem(oTabStrip.getItems()[0]);
		oTabStrip.placeAt("qunit-fixture");

		//act
		oTabStrip.destroyItems();

		//assert
		assert.equal(oTabStrip.getSelectedItem(), undefined, 'Selected item should not be set when items are destroyed.');

		//cleanup
		oTabStrip.destroy();
	});

	QUnit.test("fireItemSelect not fired when select is not on item.", function (assert) {
		//prepare
		var fnFireItemSelectSpy = this.spy();
		var oTabStrip = new TabStrip({
				itemSelect: fnFireItemSelectSpy
			}),
			oItem = {key: "fake", value: "item"},
			oEvent = { type: "onsapselect", srcControl: oItem, isDefaultPrevented: function() {return true;}, preventDefault: function() {return true;}, setMarked: function() {return true;} };

		oTabStrip.placeAt("qunit-fixture");

		//act
		oTabStrip.onsapselect(oEvent);

		//assert
		assert.equal(fnFireItemSelectSpy.callCount, 0, 'fireItemSelect was not fiered if not on item');

		//cleanup
		fnFireItemSelectSpy.reset();
		oTabStrip.destroy();
	});


	QUnit.test("TabStripSelectList rendering", function (assert) {
		var oItem,
			oCSList = new mobileLibrary.internal.TabStripSelectList({
				items: [
					oItem = new TabStripItem("tab1", {text: "Tab 1"})
				]
			});

		oCSList.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oItem.$().focus();

		//assert
		assert.strictEqual(oItem.$().attr("tabindex"), "0", "TabStripSelectList has tabindex 0 set");

		// clean up
		oCSList.destroy();
	});

	QUnit.test("TabStripSelectList _getValueIcon returns null", function (assert) {
		var oCustomSelect = new mobileLibrary.internal.TabStripSelect({}),
			oSpy = sinon.spy(oCustomSelect, "_getValueIcon");

		// act
		oCustomSelect.setValue("tab1");

		//assert
		assert.strictEqual(oSpy.callCount, 1, "overwritten function is called on set Value");

		// clean up
		oSpy.restore();
		oCustomSelect.destroy();
	});

	QUnit.module("Keyboard Handling", {
		beforeEach: function () {
			this.items = [
				new TabStripItem({
					text: "Tab 1"
				}),
				new TabStripItem({
					text: "Tab 2"
				}),
				new TabStripItem({
					text: "Tab 3"
				}),
				new TabStripItem({
					text: "Tab 4"
				}),
				new TabStripItem({
					text: "Tab 5"
				})
			];
			this.sut = new TabStrip({
				selectedItem: 0,
				items: this.items,
				addButton: new Button("addButton", {
					type: ButtonType.Transparent
				})
			});
			this.sut.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			this.sut.destroy();
		}
	});

	QUnit.test("Tabs focus handling", function (assert) {
		var oTabs = this.sut.getItems();

		//arrage
		oTabs[0].focus();
		this.clock.tick(1000);
		//assert
		assert.strictEqual(oTabs[0].getId(), document.activeElement.id, "First tab is focused");
		//arrange
		qutils.triggerKeydown(this.sut.$("tabs"), jQuery.sap.KeyCodes.ARROW_RIGHT);
		this.clock.tick(1000);
		//assert
		assert.strictEqual(oTabs[1].getId(), document.activeElement.id, "Second tab is focused on ARROW_RIGHT");
		//arrange
		qutils.triggerKeydown(this.sut.$("tabs"), jQuery.sap.KeyCodes.ARROW_DOWN);
		this.clock.tick(1000);
		//assert
		assert.strictEqual(oTabs[2].getId(), document.activeElement.id, "Third tab is focused on ARROW_DOWN");
		//arrange
		qutils.triggerKeydown(this.sut.$("tabs"), jQuery.sap.KeyCodes.ARROW_LEFT);
		this.clock.tick(1000);
		//assert
		assert.strictEqual(oTabs[1].getId(), document.activeElement.id, "Second tab is focused on forth ARROW_LEFT");
		//arrange
		qutils.triggerKeydown(this.sut.$("tabs"), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(1000);
		//assert
		assert.strictEqual(oTabs[0].getId(), document.activeElement.id, "First is focused on fifth ARROW_UP");

	});

	//ToDo: Might be reconsidered when TabStrip is released for standalone usage
	QUnit.test("Select first item, focus it and remove it", function (assert) {
		//arrange
		var oTabStripItemToRemove = this.items[0];
		var oTabStripItemToBeSelectedAndFocused = this.items[1];
		this.sut.setSelectedItem(oTabStripItemToRemove);
		this.clock.tick(1000);
		jQuery(oTabStripItemToRemove).focus();
		this.sut._removeItem(oTabStripItemToRemove);
		this.clock.tick(1000);
		//assert
		assert.equal(this.sut.getItems().length, 4, "Length check");
		assert.equal(this.sut.getItems().indexOf(oTabStripItemToRemove), -1, "The item should not exist at any index");
		assert.equal(this.sut.getSelectedItem(), oTabStripItemToBeSelectedAndFocused.getId(), "Selection is applied to the right item");
		assert.strictEqual(document.activeElement.id, oTabStripItemToBeSelectedAndFocused.getId(), "Focus is applied to the right item");
	});

	//ToDo: Might be reconsidered when TabStrip is released for standalone usage
	QUnit.test("Select last item, focus it and remove it", function (assert) {
		//arrange
		var oTabStripItemToRemove = this.items[4];
		var oTabStripItemToBeSelectedAndFocused = this.items[3];
		this.sut.setSelectedItem(oTabStripItemToRemove);
		this.clock.tick(1000);
		jQuery(oTabStripItemToRemove).focus();
		this.sut._removeItem(oTabStripItemToRemove);
		this.clock.tick(1000);
		//assert
		assert.equal(this.sut.getItems().length, 4, "Length check");
		assert.equal(this.sut.getItems().indexOf(oTabStripItemToRemove), -1, "The item should not exist at any index");
		assert.equal(this.sut.getSelectedItem(), oTabStripItemToBeSelectedAndFocused.getId(), "Selection is applied to the right item");
		assert.strictEqual(document.activeElement.id, oTabStripItemToBeSelectedAndFocused.getId(), "Focus is applied to the right item");
	});

	//ToDo: Might be reconsidered when TabStrip is released for standalone usage
	QUnit.test("Select random item, focus another and remove it", function (assert) {
		//arrange
		var oTabStripItemToRemove = this.items[3];
		var oTabStripItemToBeSelected = this.items[0];
		var oTabStripItemToBeFocused = this.items[4];
		this.sut.setSelectedItem(oTabStripItemToBeSelected);
		this.clock.tick(1000);
		jQuery(oTabStripItemToRemove).focus();
		this.sut._removeItem(oTabStripItemToRemove);
		this.clock.tick(1000);
		//assert
		assert.equal(this.sut.getItems().length, 4, "Length check");
		assert.equal(this.sut.getItems().indexOf(oTabStripItemToRemove), -1, "The item should not exist at any index");
		assert.equal(this.sut.getSelectedItem(), oTabStripItemToBeSelected.getId(), "Selection is applied to the right item");
		assert.strictEqual(document.activeElement.id, oTabStripItemToBeFocused.getId(), "Focus is applied to the right item");
	});

	QUnit.test("alt + right/left is not handled", function(assert) {
		var oModifiers = this.sut._oItemNavigation.getDisabledModifiers();
		assert.ok(oModifiers["sapnext"], "sapnext has disabled modifiers");
		assert.ok(oModifiers["sapprevious"], "sapprevious has disabled modifiers");
		assert.equal(oModifiers["sapnext"][0], "alt", "alt is not handled when right is pressed");
		assert.equal(oModifiers["sapprevious"][0], "alt", "alt is not handled when left is pressed");
	});

	QUnit.module("Scrolling", {
		beforeEach: function () {
			this.sut = new TabStrip({
				items: [
					new TabStripItem({
						text: "Tab 1"
					}),
					new TabStripItem({
						text: "Tab 2"
					}),
					new TabStripItem({
						text: "Tab 3"
					})
				]
			});
			this.sut.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			this.resetAllTabs();
			this.sut.destroy();
			this.sut = null;
		},
		addTabs: function (iNumberOfTabs) {
			for (var iIndex = 1; iIndex <= iNumberOfTabs; iIndex++) {
				this.sut.addItem(
						new TabStripItem({
							text: "Tab with long title " + iIndex
						})
				);
			}
		},
		resetAllTabs: function () {
			this.sut.destroyAggregation("items");
		}
	});

	QUnit.test("Is scrolling needed", function (assert) {
		//assert
		assert.ok(!this.sut._checkScrolling(), "Scrolling is not needed when tabs don't overflow (" + this.sut.getItems().length + ") tabs");

		//arrange
		this.addTabs(15);
		oCore.applyChanges();
		assert.ok(this.sut._checkScrolling(), "Scrolling is needed when tabs overflow (" + this.sut.getItems().length + ") tabs");
	});

	QUnit.test("Overflow Buttons", function (assert) {
		//arrange
		var iTestCurrentScrollLeft = this._iCurrentScrollLeft;
		var fnUpdateTestScrollValue = function () {
			iTestCurrentScrollLeft = this.sut._iCurrentScrollLeft;
		}.bind(this);
		this.addTabs(15);
		oCore.applyChanges();
		fnUpdateTestScrollValue();
		//assert
		assert.strictEqual(iTestCurrentScrollLeft, 0, "The initial ScrollLeft value is as expected");
		assert.strictEqual(this.sut.getAggregation("_leftArrowButton").$().css("visibility"), "hidden", "Left scroll button is hidden when scrollLeft is " + iTestCurrentScrollLeft + "/" + this.sut._iMaxOffsetLeft );
		assert.strictEqual(this.sut.getAggregation("_rightArrowButton").$().css("visibility"), "visible", "Right scroll button is visible when scrollLeft is " + iTestCurrentScrollLeft + "/" + this.sut._iMaxOffsetLeft);
		//arrange
		this.sut.getAggregation("_rightArrowButton").firePress({});
		this.clock.tick(1000);
		this.sut.getAggregation("_rightArrowButton").firePress({});
		this.clock.tick(1000);
		this.sut._handleOverflowButtons();
		//assert
		assert.ok(iTestCurrentScrollLeft != this.sut._iCurrentScrollLeft, "ScrollLeft value was successfully changed on RightScrollButton press");
		//arrange
		fnUpdateTestScrollValue();
		//assert
//			assert.strictEqual(iTestCurrentScrollLeft, 640, "ScrollLeft value is as expected");
		assert.strictEqual(this.sut.getAggregation("_leftArrowButton").$().css("visibility"), "visible", "Left scroll button is visible when scrollLeft is " + iTestCurrentScrollLeft + "/" + this.sut._iMaxOffsetLeft);
		assert.strictEqual(this.sut.getAggregation("_rightArrowButton").$().css("visibility"), "visible", "Right scroll button is visible when scrollLeft is " + iTestCurrentScrollLeft + "/" + this.sut._iMaxOffsetLeft);
		//arrange
		this.sut.getAggregation("_leftArrowButton").firePress({});
		this.clock.tick(1000);
		this.sut._handleOverflowButtons();
		//assert
		assert.ok(iTestCurrentScrollLeft != this.sut._iCurrentScrollLeft, "ScrollLeft value was successfully changed on LeftScrollButton press");
		//arrange
		fnUpdateTestScrollValue();
//			assert.strictEqual(iTestCurrentScrollLeft, 320, "ScrollLeft value is as expected");
		//arrange
		var iLargeScroll = 100000;
		this.sut._scroll(iLargeScroll, 500); //make sure that this enforces max right position
		assert.ok(true, "Performing very large scroll (" + iLargeScroll + "/" + this.sut._iMaxOffsetLeft + ")");
		this.clock.tick(1000);
		this.sut._handleOverflowButtons();
		//assert
		assert.ok(iTestCurrentScrollLeft != this.sut._iCurrentScrollLeft, "ScrollLeft value was successfully changed on _scroll call");
		assert.equal(this.sut._iCurrentScrollLeft, this.sut._iMaxOffsetLeft, "Scroll out of range test passed successfully");
		fnUpdateTestScrollValue();
		assert.ok(iTestCurrentScrollLeft === this.sut._iCurrentScrollLeft && iTestCurrentScrollLeft === this.sut._iMaxOffsetLeft, "ScrollLeft value is as expected");
		assert.strictEqual(this.sut.getAggregation("_leftArrowButton").$().css("visibility"), "visible", "Left scroll button is visible when scrollLeft is " + iTestCurrentScrollLeft + "/" + this.sut._iMaxOffsetLeft);
//			assert.strictEqual(this.sut._oRightArrowButton.$().css("visibility"), "hidden", "Right scroll button is hidden when scrollLeft is " + iTestCurrentScrollLeft + "/" + this.sut._iMaxOffsetLeft);
	});

	QUnit.module("ARIA", {
		beforeEach: function () {
			var _aItems = this._aItems = [
				new TabStripItem({
					text: "Tab 1"
				}),
				new TabStripItem({
					text: "Tab 2"
				}),
				new TabStripItem({
					text: "Tab 3"
				})
			];
			this.sut = new TabStrip({
				selectedItem: _aItems[0],
				items: _aItems
			});
			this.sut.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			this.sut.destroy();
		}
	});

	QUnit.test("Initial aria attributes", function (assert) {
		var that = this;
		//assert
		assert.strictEqual(this.sut.$('tabs').attr("role"), 'tablist', "TabStrip container has correct role");
		assert.ok(!!(this.sut.$('tabs').children().eq(0).attr("aria-selected")), "The initial aria-selected attribute value is correct");
		this.sut.$('tabs').children().each(function () {
			var $Tab = jQuery(this),
					bHasRole = $Tab.is("[role]"),
					sRoleValue = $Tab.attr("role"),
					bHasAriaSelected = $Tab.is("[aria-selected]"),
					bIsSelected = $Tab.attr("aria-selected");

			assert.ok(bHasRole, this.id + " has role attribute assigned");
			assert.strictEqual(sRoleValue, "tab", this.id + " has a correct role value");
			assert.ok(bHasAriaSelected, this.id + " has aria-selected attribute");
			if (that.sut.getSelectedItem() === this.id) {
				assert.strictEqual(bIsSelected, "true", this.id + " has correct aria-selected value (true)");
			} else {
				assert.strictEqual(bIsSelected, "false", this.id + " has correct aria-selected value (false)");
			}
		});
		assert.strictEqual(this.sut.$().find("[aria-selected]").length, this.sut.getItems().length, "All elements with aria-selected attributes are equal to the number of aggregations passed to TabStrip");
	});

	QUnit.test("Select item changes the aria-selected value", function (assert) {
		//arrange
		this.sut.setSelectedItem(this._aItems[1]);
		//assert
		assert.ok(!!(this.sut.$('tabs').children().eq(1).attr("aria-selected")), "aria-selected was updated successfully");
		//arrange
		this.sut.setSelectedItem(this._aItems[2]);
		//assert
		assert.ok(!!(this.sut.$('tabs').children().eq(2).attr("aria-selected")), "aria-selected was updated successfully");
	});

	QUnit.test("Check for undesired aria attributes", function (assert) {
		assert.strictEqual(this.sut.$().find("[aria-aria-selected]").length, 0, "the duplicate aria-aria-selected attribute is not present in the DOM");
	});

	QUnit.test("Items has aria-setsize attribute set correctly to number of items in the items aggregation", function (assert) {
		var aItems = this.sut.getDomRef().querySelectorAll(".sapMTabStripItem"),
			iExpected = this.sut.getItems().length;

		Array.prototype.forEach.call(aItems, function (oItem) {
			assert.equal(oItem.getAttribute("aria-setsize"), iExpected, "aria-setsize is set correctly");
		});
	});

	QUnit.test("Items has aria-setsize attribute set correctly to number of items in the items aggregation", function (assert) {
		var aItems = this.sut.getDomRef().querySelectorAll(".sapMTabStripItem");

		Array.prototype.forEach.call(aItems, function (oItem, iIndex) {
			var iExpected = iIndex + 1;
			assert.equal(oItem.getAttribute("aria-posinset"), iExpected, "Index of the " + iExpected + " item is set properly");
		});
	});



	QUnit.module("TabSelect PHONE", {
		afterEach: function () {
			this.oTS.destroy();
			this.oTS = null;
		}
	});

	QUnit.test("Rendering", function (assert) {
		var stubs = preparePhonePlatform.call(this);
		this.oTS = new TabStrip({
			hasSelect: true,
			items: [
				new TabStripItem({key: "0", text: "01234567890123456789012345"}),
				new TabStripItem({key: "1", text: "item 1"}),
				new TabStripItem({key: "2", text: "item 2"})
			]
		});

		this.oTS.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oTS.$("leftOverflowButtons").length, 0, "Left overflow buttons are not rendered");
		assert.strictEqual(this.oTS.$("rightflowButtons").length, 0, "Right overflow buttons are not rendered");
		assert.strictEqual(this.oTS.$("tabsContainer").length, 0, "Tab container is not rendered");

		assert.strictEqual(jQuery(this.oTS.$()).find('.sapMSltLabel').length, 1, 'Label is rendered');
		assert.strictEqual(jQuery(this.oTS.$()).find('.sapMSltArrow').length, 1, 'Arrow is rendered');
		jQuery('body').removeClass('sap-phone');
		stubs.forEach(function(item){item.restore();}); // restore stubs
	});


	function preparePhonePlatform() {
		var oSystem = {
			desktop : false,
			phone : true,
			tablet : false
		};
		var stubs = [];
		stubs.push(this.stub(Device, "system", oSystem));
		stubs.push(this.stub(jQuery.device, "is", oSystem));
		jQuery('body').addClass('sap-phone');
		return stubs;
	}

	QUnit.module("Selection", {
		beforeEach: function () {
			this.selectedItem = new TabStripItem({
				text: "Initially selected tab"
			});
			this.items = [
				new TabStripItem({
					text: "Tab 1"
				}),
				this.selectedItem,
				new TabStripItem({
					text: "Tab 3"
				})
			];
			this.selectedItemIndex = this.items.indexOf(this.selectedItem);
		},
		afterEach: function () {
			this.sut.destroy();
		}
	});

	QUnit.test("Initial selection if no selected item is passed", function (assert) {
		//arrange
		this.sut = new TabStrip({
			items: this.items
		});
		oCore.applyChanges();
		//assert
		assert.strictEqual(this.sut.$("tabs").children("." + TabStripItem.CSS_CLASS_SELECTED).length, 0, "The initial selection is not applied");
		assert.strictEqual(this.sut.getSelectedItem(), null, "Correct value of selectedItem association");
	});

	QUnit.test("Initial selection if selected item is applied", function (assert) {
		//arrange
		this.sut = new TabStrip({
			selectedItem: this.selectedItem,
			items: this.items
		});
		this.sut.placeAt('qunit-fixture');
		oCore.applyChanges();
		//assert
		assert.strictEqual(this.sut.getSelectedItem(), this.sut.getItems()[this.selectedItemIndex].getId(), "Correct selectedItem aggregation value");
		assert.ok(this.sut.$("tabs").children().eq(this.selectedItemIndex).hasClass(TabStripItem.CSS_CLASS_SELECTED), "The initial selection is applied correctly");
	});

	QUnit.test("Initial scrolling to selected item", function (assert) {
		//arrange
		this.sut = new TabStrip({
			selectedItem: this.selectedItem,
			items: this.items
		});
		var fnScrollingSpy = sinon.spy(this.sut, "_handleInititalScrollToItem");

		this.sut.placeAt('qunit-fixture');
		oCore.applyChanges();

		//assert
		assert.equal(fnScrollingSpy.callCount, 1, "_handleInititalScrollToItem function is called");
	});

	QUnit.test("Initial scrolling when selected item is null", function (assert) {
		//arrange
		this.sut = new TabStrip({
			items: this.items
		});
		var fnScrollingSpy = sinon.spy(this.sut, "_scrollIntoView");

		this.sut.placeAt('qunit-fixture');
		oCore.applyChanges();

		//assert
		assert.equal(this.sut.getSelectedItem(), null, "selected item is null");
		assert.equal(fnScrollingSpy.callCount, 0, "_scrollIntoView function is not called");
	});

	QUnit.test("No Overflow Buttons on phone", function (assert) {
		//arrange
		var stubs = preparePhonePlatform.call(this);
		this.sut = new TabStrip({
			hasSelect: true,
			items: [
				new TabStripItem({key: "0", text: "item 1"})
			]
		});

		var fnScrollingSpy = sinon.spy(this.sut, "_adjustScrolling");

		this.sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(fnScrollingSpy.callCount, 0, "scrolling calcualtion is not utilized on phone");
		assert.ok(!this.sut.getAggregation("_leftArrowButton"), "Left button aggregation is not created");
		assert.ok(!this.sut.getAggregation("_rightArrowButton"), "Right button aggregation is not created");

		assert.ok(!this.sut.$().hasClass(this.sut.getRenderer().LEFT_OVERRFLOW_BTN_CLASS_NAME), "No left button placeholder");
		assert.ok(!this.sut.$().hasClass(this.sut.getRenderer().RIGHT_OVERRFLOW_BTN_CLASS_NAME), "No right button placeholder");

		jQuery('body').removeClass('sap-phone');
		stubs.forEach(function(item){item.restore();}); // restore stubs
	});

	QUnit.module("Tablet platform tests", {
		beforeEach: function () {
			this.oOriginalSysInfo = this.getSystemInfo();
			this.prepareSystem();
			this.oTS = new TabStrip({
				hasSelect: true,
				items: [
					new TabStripItem({key: "0", text: "01234567890123456789012345"}),
					new TabStripItem({key: "1", text: "item 1"}),
					new TabStripItem({key: "2", text: "item 2"})
				]
			});
			this.oTS.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.restoreSystemValues();
			this.oTS.destroy();
			this.oTS = null;
		},
		getSystemInfo: function () {
			return {
				desktop: Device.system.desktop,
				tablet: Device.system.tablet,
				phone: Device.system.phone
			};
		},
		prepareSystem: function () {
			sap.ui.Device.system.desktop = false;
			sap.ui.Device.system.tablet = true;
			sap.ui.Device.system.phone = false;
			jQuery("html").removeClass("sap-desktop");
			jQuery("html").removeClass("sapUiMedia-Std-Desktop");
			jQuery("html").addClass("sap-tablet");
			jQuery("html").addClass("sapUiMedia-Std-Tablet");
		},
		restoreSystemValues: function () {
			sap.ui.Device.system.desktop = this.oOriginalSysInfo.desktop;
			sap.ui.Device.system.tablet = this.oOriginalSysInfo.tablet;
			sap.ui.Device.system.phone = this.oOriginalSysInfo.phone;
			jQuery("html").removeClass("sap-tablet");
			jQuery("html").removeClass("sapUiMedia-Std-Tablet");
			jQuery("html").addClass("sap-desktop");
			jQuery("html").addClass("sapUiMedia-Std-Desktop");
		}
	});

	QUnit.test("All close buttons are visible on tablet", function (assert) {
		//arrange
		var fnAreAllItemsButtonsVisible = function (oItem) {
			return oItem.$().find("button").css("visibility") === 'visible';
		};
		//assert
		assert.ok(this.oTS.getItems().every(fnAreAllItemsButtonsVisible), "All buttons on tablet are visible");
	});
});