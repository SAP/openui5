// Shortcuts
jQuery.sap.require("sap.ui.Device");
var Device = sap.ui.Device;


//************************************************************************
// Test Code
//************************************************************************

sap.ui.test.qunit.delayTestStart(500);


QUnit.module("Initialization", {
	setup: function() {
		createTables();
	},
	teardown: function () {
		destroyTables();
	}
});

QUnit.test("init()", function(assert) {
	var oExtension = oTable._getScrollExtension();
	assert.ok(!!oExtension, "Scroll Extension available");

	var iCount = 0;
	for (var i = 0; i < oTable.aDelegates.length; i++) {
		if (oTable.aDelegates[i].oDelegate === oExtension._delegate) {
			iCount++;
		}
	}
	assert.ok(iCount == 1, "Scroll Delegate registered");
});

QUnit.test("_debug()", function(assert) {
	var oExtension = oTable._getKeyboardExtension();
	assert.ok(!oExtension._ExtensionHelper, "No debug mode");
	oExtension._debug();
	// TBD: assert.ok(!!oExtension._ExtensionHelper, "Debug mode");
});


QUnit.module("Destruction", {
	setup: function() {
		createTables();
	},
	teardown: function () {
		oTable = null;
		oTreeTable.destroy();
		oTreeTable = null;
	}
});


QUnit.test("destroy()", function(assert) {
	var oExtension = oTable._getScrollExtension();
	oTable.destroy();
	assert.ok(!oExtension.getTable(), "Table cleared");
	assert.ok(!oExtension._delegate, "Delegate cleared");
});


QUnit.module("Scrollbars", {
	beforeEach: function() {
		this.sOriginalWidth = document.getElementById("content").style.width;
		this.sOriginalHeight = document.getElementById("content").style.height;

		document.getElementById("content").style.width = "300px";
		document.getElementById("content").style.height = "100px";

		createTables();

		this.oHSb = oTable.getDomRef(sap.ui.table.SharedDomRef.HorizontalScrollBar);
		this.oVSb = oTable.getDomRef(sap.ui.table.SharedDomRef.VerticalScrollBar);
	},
	afterEach: function() {
		document.getElementById("content").style.width = this.sOriginalWidth;
		document.getElementById("content").style.height = this.sOriginalHeight;
		destroyTables();
	}
});

QUnit.test("Horizontal scrollbar visibility", function(assert) {
	assert.ok(this.oHSb.offsetWidth > 0 && this.oHSb.offsetHeight > 0, "Table content does not fit width -> Horizontal scrollbar is visible");

	destroyTables();
	document.getElementById("content").style.width = this.sOriginalWidth;
	createTables();
	assert.ok(this.oHSb.offsetWidth === 0 && this.oHSb.offsetHeight === 0, "Table content fits width -> Horizontal scrollbar is not visible");
});

QUnit.test("Vertical scrollbar visibility", function(assert) {
	assert.ok(this.oVSb.offsetWidth > 0 && this.oVSb.offsetHeight > 0, "Table content does not fit height -> Vertical scrollbar is visible");

	destroyTables();
	document.getElementById("content").style.height = this.sOriginalHeight;
	createTables();
	assert.ok(this.oVSb.offsetWidth === 0 && this.oVSb.offsetHeight === 0, "Table content fits height -> Vertical scrollbar is not visible");
});

QUnit.module("Vertical scrolling", {
	beforeEach: function() {
		createTables();

		this.oDefaultSetting = {
			length: 30,
			visibleRowCount: 10,
			expectedFirstVisibleRow: 0,
			tolerance: 0,
			scrollTop: 0,
			rowHeight: 50,
			variableRowHeight: false
		}

		this.iAssertionDelay = 75;
	},
	afterEach: function() {
		destroyTables();
	},
	doTest: function(assert, oSetting) {
		oSetting = jQuery.extend({}, this.oDefaultSetting, oSetting);
		oTable.setVisibleRowCount(oSetting.visibleRowCount);
		oTable.setRowHeight(oSetting.rowHeight);
		oTable.unbindRows();
		oTable.bindRows("/rows");
		oTable._bVariableRowHeightEnabled = oSetting.variableRowHeight;
		if (oTable._bVariableRowHeightEnabled) {
			oTable.setFixedRowCount(0);
			oTable.setFixedBottomRowCount(0);
			oTable._collectRowHeights = function() {
				var oDomRef = this.getDomRef();
				if (!oDomRef) {
					return [];
				}
				var aResult = [];
				for (var i = 0; i < oSetting.visibleRowCount; i++) {
					aResult.push(i == 1 ? 70 : oSetting.rowHeight);
				}
			}
		}
		oTable.getBinding("rows").getLength = function() {
			return oSetting.length;
		};
		sap.ui.getCore().applyChanges();

		var iDelay = this.iAssertionDelay;

		setTimeout(function() {
			var oVSb = oTable.getDomRef(sap.ui.table.SharedDomRef.VerticalScrollBar);
			oVSb.scrollTop = oSetting.scrollTop;

			setTimeout(function() {
				var iExpectedFirstVisibleRow = oSetting.expectedFirstVisibleRow;
				if (typeof oSetting.expectedFirstVisibleRow === "function") {
					iExpectedFirstVisibleRow = oSetting.expectedFirstVisibleRow();
				}
				if (oSetting.tolerance > 0) {
					assert.ok(oTable.getFirstVisibleRow() >= iExpectedFirstVisibleRow - oSetting.tolerance , "Check FirstVisibleRow (>)");
					assert.ok(oTable.getFirstVisibleRow() <= iExpectedFirstVisibleRow + oSetting.tolerance , "Check FirstVisibleRow (<)");
				} else {
					assert.strictEqual(oTable.getFirstVisibleRow(), iExpectedFirstVisibleRow, "Check FirstVisibleRow");
				}
				QUnit.start();
			}, iDelay);
		}, iDelay);
	}
});

QUnit.asyncTest("To Middle - small data - no variable row heights", function(assert) {
	this.doTest(assert, {scrollTop: 750, expectedFirstVisibleRow: 15});
});

QUnit.asyncTest("To End - small data - no variable row heights", function(assert) {
	this.doTest(assert, {scrollTop: 1000, expectedFirstVisibleRow: 20});
});

QUnit.asyncTest("To Middle - big data - no variable row heights", function(assert) {
	this.doTest(assert, {length: 20000000, tolerance: 5200, scrollTop: oTable._iMaxScrollbarHeight / 2, expectedFirstVisibleRow: 10000000});
});

QUnit.asyncTest("To End - big data - no variable row heights", function(assert) {
	this.doTest(assert, {length: 20000000, scrollTop: oTable._iMaxScrollbarHeight, expectedFirstVisibleRow: 20000000 - 10});
});

QUnit.asyncTest("To Middle - small data - variable row heights", function(assert) {
	this.doTest(assert, {scrollTop: 750, expectedFirstVisibleRow: 15});
});

QUnit.asyncTest("To End - small data - variable row heights", function(assert) {
	this.doTest(assert, {scrollTop: 1000, expectedFirstVisibleRow: 20});
});

QUnit.asyncTest("To Middle - big data - variable row heights", function(assert) {
	this.doTest(assert, {length: 20000000, tolerance: 5200, scrollTop: oTable._iMaxScrollbarHeight / 2, expectedFirstVisibleRow: 10000000});
});

QUnit.asyncTest("To End - big data - variable row heights", function(assert) {
	this.doTest(assert, {length: 20000000, scrollTop: oTable._iMaxScrollbarHeight, expectedFirstVisibleRow: 20000000 - 10});
});