/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/rowmodes/Type",
	"sap/ui/table/rowmodes/Fixed",
	'sap/ui/Device',
	"sap/ui/model/Filter",
	"sap/ui/core/Core"
], function(
	TableQUnitUtils,
	RowModeType,
	FixedRowMode,
	Device,
	Filter,
	oCore
) {
	"use strict";

	QUnit.module("Initialization and Destruction", {
		before: function() {
			Device.os.ios = true;
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();

			return new Promise(function(resolve) {
				sap.ui.require(["sap/ui/table/extensions/ScrollingIOS"], resolve);
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("_init", function(assert) {
		var oExtension = this.oTable._getScrollIOSExtension();
		assert.ok(!!oExtension, "Extension available in table");
	});

	QUnit.test("destroy", function(assert) {
		var oExtension = this.oTable._getScrollIOSExtension();

		this.oTable.destroy();
		assert.ok(!oExtension.getTable(), "Reference to table removed");
	});

	QUnit.module("Scrollbar", {
		before: function() {
			Device.os.ios = true;
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				columns: [TableQUnitUtils.createTextColumn()],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(6),
				rowMode: new FixedRowMode({
					rowCount: 6
				})
			});

			return Promise.all([
				this.oTable.qunit.whenRenderingFinished(),
				new Promise(function(resolve) {
					sap.ui.require(["sap/ui/table/extensions/ScrollingIOS"], resolve);
				})
			]);
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertThumbHeight: function(assert) {
			var oTable = this.oTable;
			var oScrollExtension = oTable._getScrollExtension();
			var iVerticalScrollbarHeight = oScrollExtension.getVerticalScrollbarHeight();
			var iVerticalScrollHeight = oScrollExtension.getVerticalScrollHeight();
			var oVSb = oScrollExtension.getVerticalScrollbar();
			var oVSbIOS = oVSb.nextSibling;
			var oVSbThumb = oVSbIOS.firstChild;

			assert.strictEqual(oVSbThumb.style.height, Math.round(Math.pow(iVerticalScrollbarHeight, 2) / iVerticalScrollHeight) + "px",
				"The thumb height is correct");
		}
	});

	QUnit.test("Visibility, thumb height and position update", function(assert) {
		var that = this;
		var oTable = this.oTable;
		var oScrollExtension = oTable._getScrollExtension();
		var oVSb = oScrollExtension.getVerticalScrollbar();
		var oVSbIOS = oVSb.nextSibling;
		var oVSbThumb = oVSbIOS.firstChild;
		var oScrollIOSExtension = oTable._getScrollIOSExtension();
		var oTotalRowCountChangeSpy = sinon.spy(oScrollIOSExtension, "onTotalRowCountChanged");
		var oUpdatePositionSpy = sinon.spy(oScrollIOSExtension, "updateVerticalScrollbarThumbPosition");

		assert.ok(oVSbIOS.parentElement.classList.contains("sapUiTableHidden") && oVSbThumb.style.height === "0px",
			"Table content fits height -> Vertical scrollbar is not visible");

		oTable.getRowMode().setRowCount(3);
		oCore.applyChanges();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oVSbIOS = oVSb.nextSibling;
			oVSbThumb = oVSbIOS.firstChild;
			assert.ok(oUpdatePositionSpy.called, "updateVerticalScrollbarThumbPosition has been called");
			assert.ok(!oVSbIOS.classList.contains("sapUiTableHidden") && oVSbThumb.style.height !== "0px",
				"Table content does not fit height -> Vertical scrollbar is visible");
			that.assertThumbHeight(assert);

			oTable.getBinding().filter(new Filter("A", "EQ", "A1"));
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.ok(oTotalRowCountChangeSpy.calledOnce, "onTotalRowCountChanged hook has been called once");
			assert.ok(oVSbIOS.parentElement.classList.contains("sapUiTableHidden") && oVSbThumb.style.height === "0px",
				"Table content fits height -> Vertical scrollbar is not visible");
		});
	});

	QUnit.module("Scrolling", {
		before: function() {
			Device.os.ios = true;
			Device.support.pointer = false;
			Device.support.touch = true;
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				columns: [TableQUnitUtils.createTextColumn()],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			});

			return Promise.all([
				this.oTable.qunit.whenRenderingFinished(),
				new Promise(function(resolve) {
					sap.ui.require(["sap/ui/table/extensions/ScrollingIOS"], resolve);
				})
			]);
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		scrollWithTouch: function(iScrollDelta) {
			return function() {
				TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				return this.oTable.qunit.whenVSbScrolled().then(this.oTable.qunit.whenRenderingFinished);
			}.bind(this);
		},
		assertThumbPosition: function(assert) {
			var oScrollExtension = this.oTable._getScrollExtension();
			var oVSb = oScrollExtension.getVerticalScrollbar();
			var oVSbIOS = oVSb.nextSibling;
			var oVSbThumb = oVSbIOS.firstChild;
			var iVerticalScrollbarHeight = oScrollExtension.getVerticalScrollbarHeight();
			var iVerticalScrollHeight = oScrollExtension.getVerticalScrollHeight();
			var iVerticalScrollTop = oScrollExtension.getVerticalScrollbar().scrollTop;

			var iScrollPosition = Math.round(iVerticalScrollTop * iVerticalScrollbarHeight / iVerticalScrollHeight);
			assert.strictEqual(oVSbThumb.style.top, iScrollPosition + "px", "Thumb position is correct");
		}
	});

	QUnit.test("Scroll by setting FirstVisibleRow", function(assert) {
		var that = this;
		var oTable = this.oTable;

		return oTable.qunit.whenRenderingFinished().then(function() {
			that.assertThumbPosition(assert);
			oTable.setFirstVisibleRow(10);
		}).then(function() {
			that.assertThumbPosition(assert);
			oTable.setFirstVisibleRow(50);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertThumbPosition(assert);
			oTable.setFirstVisibleRow(90);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertThumbPosition(assert);
		});

	});

	QUnit.test("Touch scroll on table content", function(assert) {
		var that = this;
		var oTable = this.oTable;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.qunit.preventFocusOnTouch();
			TableQUnitUtils.startTouchScrolling(oTable.qunit.getDataCell(0, 0));
		}).then(that.scrollWithTouch(200)).then(function() {
			that.assertThumbPosition(assert);
		}).then(that.scrollWithTouch(300)).then(function() {
			that.assertThumbPosition(assert);
		}).then(that.scrollWithTouch(-300)).then(function() {
			that.assertThumbPosition(assert);
		}).then(that.scrollWithTouch(-1000, true, "Scrolled to the top")).then(function() {
			that.assertThumbPosition(assert);
			TableQUnitUtils.endTouchScrolling();
		});
	});

	QUnit.test("touchMove on scroll thumb", function(assert) {
		var that = this;
		var oTable = this.oTable;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.qunit.preventFocusOnTouch();
			TableQUnitUtils.startTouchScrolling(oTable._getScrollIOSExtension().getVerticalScrollbarThumb());
		}).then(that.scrollWithTouch(-400)).then(function() {
			that.assertThumbPosition(assert);
		}).then(that.scrollWithTouch(-400)).then(function() {
			that.assertThumbPosition(assert);
		}).then(that.scrollWithTouch(1000)).then(function() {
			that.assertThumbPosition(assert);
		}).finally(function() {
			TableQUnitUtils.endTouchScrolling();
		});
	});

	QUnit.test("pointerDown on scrollbar", function(assert) {
		var that = this;
		var oTable = this.oTable;
		var oTarget = oTable._getScrollIOSExtension().getVerticalScrollbar();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTarget.dispatchEvent(new PointerEvent("pointerdown", {
				clientX: oTarget.getBoundingClientRect().x + 5,
				clientY: oTarget.getBoundingClientRect().y + 200
			}));
		}).then(function() {
			return that.oTable.qunit.whenVSbScrolled().then(that.oTable.qunit.whenRenderingFinished);
		}).then(function() {
			that.assertThumbPosition(assert);
			oTarget.dispatchEvent(new PointerEvent("pointerdown", {
				clientX: oTarget.getBoundingClientRect().x + 5,
				clientY: oTarget.getBoundingClientRect().y + 400
			}));
		}).then(function() {
			return that.oTable.qunit.whenVSbScrolled().then(that.oTable.qunit.whenRenderingFinished);
		}).then(function() {
			that.assertThumbPosition(assert);
		});
	});

	QUnit.test("pointerDown on scrollbar after rendering only rows", function(assert) {
		var that = this;
		var oTable = this.oTable;
		var oTarget;

		oTable.setRowMode(RowModeType.Auto);

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTarget = oTable._getScrollIOSExtension().getVerticalScrollbar();
			oTarget.dispatchEvent(new PointerEvent("pointerdown", {
				clientX: oTarget.getBoundingClientRect().x + 5,
				clientY: oTarget.getBoundingClientRect().y + 200
			}));
		}).then(function() {
			return that.oTable.qunit.whenVSbScrolled().then(that.oTable.qunit.whenRenderingFinished);
		}).then(function() {
			that.assertThumbPosition(assert);
		});
	});
});