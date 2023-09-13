/*global QUnit */

sap.ui.define([
	"sap/m/IconTabHeader",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/IconTabBarSelectList",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/events/KeyCodes"
], function(
	IconTabHeader,
	IconTabFilter,
	IconTabSeparator,
	IconTabBarSelectList,
	Text,
	Core,
	coreLibrary,
	createAndAppendDiv,
	KeyCodes
) {
	"use strict";

	var TextDirection = coreLibrary.TextDirection;

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

	QUnit.module("Select List Rendering");

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
			isA: function() {},
			getSelectedItem: function() {},
			fireSelectionChange: function() {},
			ontap: IconTabBarSelectList.prototype.ontap,
			onkeydown: IconTabBarSelectList.prototype.onkeydown,
			_selectItem: IconTabBarSelectList.prototype._selectItem
		};

		var oFakeEvent = {
			srcControl: null,
			preventDefault: function() {}
		};

		var oTab = new IconTabFilter({ content: new Text({ text: "a" }) }),
			_oSelectionSpy = this.spy(oSelectListStub, "_selectItem"),
			oSelectionChangeSpy = this.spy(oSelectListStub, "fireSelectionChange");

		// Act
		IconTabBarSelectList.prototype.ontap.call(oSelectListStub, oFakeEvent);

		// Assert
		assert.strictEqual(_oSelectionSpy.callCount, 1, "_selectItem was called");
		assert.ok(oSelectionChangeSpy.notCalled, "fireSelectionChange was not called");

		// Arrange
		oFakeEvent.srcControl = oSelectListStub;

		// Act
		IconTabBarSelectList.prototype.ontap.call(oSelectListStub, oFakeEvent);

		// Assert
		assert.strictEqual(_oSelectionSpy.callCount, 2, "_selectItem was called");
		assert.ok(oSelectionChangeSpy.notCalled, "fireSelectionChange was not called");

		// Act
		IconTabBarSelectList.prototype.onkeydown.call(oSelectListStub, {
			which: KeyCodes.SPACE,
			srcControl: oTab,
			preventDefault: function() {}
		});

		// Assert
		assert.strictEqual(_oSelectionSpy.callCount, 2, "_selectItem was called");
		assert.ok(oSelectionChangeSpy.notCalled, "fireSelectionChange was not called");

		// Act
		IconTabBarSelectList.prototype.onkeyup.call(oSelectListStub, {
			which: KeyCodes.SPACE,
			srcControl: oTab,
			preventDefault: function() {}
		});

		// Assert
		assert.strictEqual(_oSelectionSpy.callCount, 3, "_selectItem was called");
		assert.ok(oSelectionChangeSpy.called, "fireSelectionChange was called");

		// Arrange
		oFakeEvent.srcControl = new IconTabFilter({ enabled: false });

		// Act
		IconTabBarSelectList.prototype.ontap.call(oSelectListStub, oFakeEvent);

		// Assert
		assert.strictEqual(_oSelectionSpy.callCount, 4, "_selectItem was called");
		assert.strictEqual(oSelectionChangeSpy.callCount, 1, "fireSelectionChange was not called");

		// Arrange
		oFakeEvent.srcControl = oTab;

		// Act
		IconTabBarSelectList.prototype.ontap.call(oSelectListStub, oFakeEvent);

		// Assert
		assert.strictEqual(_oSelectionSpy.callCount, 5, "_selectItem was called");
		assert.strictEqual(oSelectionChangeSpy.callCount, 2, "fireSelectionChange was called");

		// Clean-up
		_oSelectionSpy.restore();
		oSelectionChangeSpy.restore();
		oSelectListStub._oIconTabHeader.destroy();
	});

	QUnit.module("Text Direction", {
		beforeEach: function () {
			this.oSL = new IconTabBarSelectList();
			// Fake ITH
			this.oSL._oIconTabHeader = new IconTabHeader();
			this.oSL.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oSL._oIconTabHeader.destroy();
			this.oSL.destroy();
		}
	});

	QUnit.test("Text direction of tabs in the SelectList", function (assert) {
		// Arrange
		var oFilter1 = new IconTabFilter({
				text: "filter1",
				textDirection: TextDirection.LTR
			}),
			oFilter2 = new IconTabFilter({
				text: "filter1",
				textDirection: TextDirection.RTL
			}),
			oFilter3 = new IconTabFilter({
				text: "filter1",
				textDirection: TextDirection.Inherit
			});
		this.oSL.addItem(oFilter1).addItem(oFilter2).addItem(oFilter3);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oFilter1.$().find(".sapMITBText").attr("dir"), "ltr", "'dir' attribute is correctly set");
		assert.strictEqual(oFilter2.$().find(".sapMITBText").attr("dir"), "rtl", "'dir' attribute is correctly set");
		assert.strictEqual(oFilter3.$().find(".sapMITBText").attr("dir"), "auto", "'dir' attribute is correctly set");
	});

});