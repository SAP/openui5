/*global QUnit */

sap.ui.define([
	"sap/m/IconTabHeader",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/IconTabBarSelectList",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(
	IconTabHeader,
	IconTabFilter,
	IconTabSeparator,
	IconTabBarSelectList,
	Text,
	Core,
	createAndAppendDiv
) {
	"use strict";

	var DOM_RENDER_LOCATION = "content";

	createAndAppendDiv(DOM_RENDER_LOCATION);

	function createHeaderWithItems(iNum) {
		var aItems = [];
		for (var i = 0; i < iNum; i++) {
			aItems.push(new IconTabFilter({
				text: "Tab " + i,
				key: i
			}));
		}

		return new IconTabHeader({
			items: aItems
		});
	}

	QUnit.module("Rendering");

	QUnit.module("Select list");

	QUnit.test("overflowing separators are rendered in the overflow list", function (assert) {
		// Arrange
		var oITH = createHeaderWithItems(100);
		var oSep = new IconTabSeparator("mySeparator", {});
		oITH.addItem(oSep);
		oITH.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		oITH._getOverflow()._expandButtonPress();

		// Assert
		var oSepInOverflow = oITH._getOverflow()._oSelectList.getItems().pop();
		assert.deepEqual(oSepInOverflow._getRealTab(), oSep, "Separator has been cloned to select list items aggregation");
		assert.ok(oITH._getOverflow()._oSelectList.getDomRef().contains(oSepInOverflow.getDomRef()), "cloned separator is rendered within overflow list");

		// Clean-up
		oITH.destroy();
		Core.applyChanges();
	});

	QUnit.module("event handling");

	QUnit.test("pressing on a select list doesn't throw an error", function (assert) {
		// Arrange
		var oSelectListStub = {
			_oIconTabHeader: createHeaderWithItems(1),
			isA: jQuery.noop,
			getSelectedItem: jQuery.noop,
			fireSelectionChange: jQuery.noop
		};

		var oFakeEvent = {
			srcControl: null,
			preventDefault: jQuery.noop
		};

		var oTapHandlerSpy = this.spy(IconTabBarSelectList.prototype, "ontap"),
			oSelectionChangeSpy = this.spy(oSelectListStub, "fireSelectionChange");

		// Act
		IconTabBarSelectList.prototype.ontap.call(oSelectListStub, oFakeEvent);

		// Assert
		assert.strictEqual(oTapHandlerSpy.callCount, 1, "ontap handler was called");
		assert.ok(oSelectionChangeSpy.notCalled, "fireSelectionChange was not called");

		// Arrange
		oFakeEvent.srcControl = oSelectListStub;

		// Act
		IconTabBarSelectList.prototype.ontap.call(oSelectListStub, oFakeEvent);

		// Assert
		assert.strictEqual(oTapHandlerSpy.callCount, 2, "ontap handler was called");
		assert.ok(oSelectionChangeSpy.notCalled, "fireSelectionChange was not called");

		// Arrange
		oFakeEvent.srcControl = new IconTabFilter({ enabled: false });

		// Act
		IconTabBarSelectList.prototype.ontap.call(oSelectListStub, oFakeEvent);

		// Assert
		assert.strictEqual(oTapHandlerSpy.callCount, 3, "ontap handler was called");
		assert.ok(oSelectionChangeSpy.notCalled, "fireSelectionChange was not called");

		// Arrange
		oFakeEvent.srcControl = new IconTabFilter({ content: new Text({ text: "a" }) });

		// Act
		IconTabBarSelectList.prototype.ontap.call(oSelectListStub, oFakeEvent);

		// Assert
		assert.ok(oTapHandlerSpy.callCount, 4, "ontap handler was called");
		assert.ok(oSelectionChangeSpy.called, "fireSelectionChange was called");

		// Clean-up
		oTapHandlerSpy.restore();
		oSelectionChangeSpy.restore();
		oSelectListStub._oIconTabHeader.destroy();
	});


});