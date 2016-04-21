
//************************************************************************
// Preparation Code
//************************************************************************

sap.ui.core.Control.extend("TestControl", {
	metadata : {
		properties : {
			"text" : "string",
			"src" : "sap.ui.core.URI",
			"alt" : "string",
			"index" : "int" // Results in different behavior of the control in different columns
		}
	},

	renderer : function(oRm, oControl) {
		oRm.write("<span");
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oControl.getText() || oControl.getAlt() || "");
		oRm.write("</span>");
	}
});

sap.ui.table.TableHelper = {
	createLabel: function(mConfig){ return new TestControl(mConfig); },
	createTextView: function(mConfig){ return new TestControl(mConfig); },
	createTextField: function(mConfig){ throw new Error("no TextField control available!"); },
	createImage: function(mConfig){ return new TestControl(mConfig); },
	addTableClass: function() { return "sapUiTableM"; },
	bFinal: true
};

var oTable = new sap.ui.table.Table({
	rows: "{/rows}",
	title: "TABLE_TITLE",
	selectionMode: "MultiToggle",
	visibleRowCount: 3,
	fixedColumnCount: 1
});

var aFields = ["A", "B", "C", "D", "E"];
var oData = {rows: []};
var oRow;
for (var i = 0; i < 5; i++) {
	oRow = {};
	for (var j = 0; j < aFields.length; j++) {
		oRow[aFields[j]] = aFields[j] + (i+1);
		if (i == 0) {
			oTable.addColumn(new sap.ui.table.Column({
				label: aFields[j] + "_TITLE",
				width: "100px",
				template: new TestControl({
					text: "{" + aFields[j] + "}",
					index: j
				})
			}));
		}
	}
	oData.rows.push(oRow);
}

jQuery.sap.require("sap.ui.model.json.JSONModel");
var oModel = new sap.ui.model.json.JSONModel();
oModel.setData(oData);
oTable.setModel(oModel);
oTable.placeAt("content");

//************************************************************************
// Helper Functions
//************************************************************************

function getCell(iRow, iCol, bFocus, assert) {
	var oCell = jQuery.sap.domById(oTable.getId() + "-rows-row" + iRow + "-col" + iCol);
	if (bFocus) {
		oCell.focus();
		assert.ok(oCell === document.activeElement, "Cell [" + iRow + ", " + iCol + "] focused");
	} else {
		assert.ok(oCell != document.activeElement, "Cell [" + iRow + ", " + iCol + "] not focused");
	}
	return jQuery(oCell);
}

function setFocusOutsideOfTable() {
	var oOuterElement = jQuery.sap.domById("outerelement");
	oOuterElement.focus();
	assert.ok(oOuterElement === document.activeElement, "Outer element focused");
}


//************************************************************************
// Test Code
//************************************************************************

sap.ui.test.qunit.delayTestStart(500);


QUnit.module("Initialization");

QUnit.test("init()", function(assert) {
	var oExtension = oTable._getKeyboardExtension();
	assert.ok(!!oExtension, "Keyboard Extension available");
	assert.ok(!oExtension._itemNavigation, "Item Navigation not yet initialized");

	var iCount = 0;
	for (var i = 0; i < oTable.aDelegates.length; i++) {
		if (oTable.aDelegates[i].oDelegate === oExtension._delegate) {
			iCount++;
		}
	}
	assert.ok(iCount == 1, "Keyboard Delegate registered");

	getCell(0, 0, true, assert);
	assert.ok(oExtension._itemNavigation, "Item Navigation initialized on focus");
	setFocusOutsideOfTable();
});


QUnit.module("Item Navigation");


QUnit.test("init() / destroy()", function(assert) {
	var oExtension = sap.ui.table.TableExtension.enrich(new sap.ui.table.Table(), sap.ui.table.TableKeyboardExtension);
	assert.ok(!oExtension._itemNavigation, "Item Navigation not yet initialized");
	oExtension.initItemNavigation();
	assert.ok(oExtension._itemNavigation, "Item Navigation initialized on focus");
	oExtension.destroy();
	assert.ok(!oExtension._itemNavigation, "Item Navigation not available anymore after destroy");
});

QUnit.test("invalidation", function(assert) {
	var oExtension = oTable._getKeyboardExtension();
	ok(!oExtension._itemNavigationInvalidated, "Item Navigation not invalid");
	oExtension.invalidateItemNavigation();
	ok(oExtension._itemNavigationInvalidated, "Item Navigation invalid");
	oExtension.initItemNavigation();
	ok(!oExtension._itemNavigationInvalidated, "Item Navigation not invalid");
});

var aEvents = ["focusin", "sapfocusleave", "mousedown", "sapnext", "sapnextmodifiers", "sapprevious", "sappreviousmodifiers",
				"sappageup", "sappagedown", "saphome", "saphomemodifiers", "sapend", "sapendmodifiers", "sapkeyup"];

function setupItemNavigationFakeTest() {
	var oControl = new TestControl();
	var oExtension = sap.ui.table.TableExtension.enrich(oControl, sap.ui.table.TableKeyboardExtension);
	oExtension._itemNavigation = {destroy : function() {}};
	for (var i = 0; i < aEvents.length; i++) {
		oExtension._itemNavigation["on" + aEvents[i]] = function(oEvent) { ok(true, oEvent.type + " reached ItemNavigation"); };
	}
	oControl.removeEventDelegate(oExtension._delegate);
	return oControl;
}

QUnit.test("ItemNavigationDelegate", function(assert) {
	var oControl = setupItemNavigationFakeTest();

	assert.expect(14);
	for (var i = 0; i < aEvents.length; i++) {
		oControl._handleEvent(jQuery.Event(aEvents[i]));
	}

	oControl._getKeyboardExtension().destroy();
});

QUnit.test("Suspend / Resume", function(assert) {
	var oControl = setupItemNavigationFakeTest();

	oControl._getKeyboardExtension().suspendItemNavigation();

	assert.expect(14);

	for (var i = 0; i < aEvents.length; i++) {
		oControl._handleEvent(jQuery.Event(aEvents[i]));
	}

	oControl._getKeyboardExtension().resumeItemNavigation();

	for (var i = 0; i < aEvents.length; i++) {
		oControl._handleEvent(jQuery.Event(aEvents[i]));
	}

	oControl._getKeyboardExtension().destroy();
});

QUnit.test("Marked Event", function(assert) {
	var oControl = setupItemNavigationFakeTest();

	assert.expect(14);

	for (var i = 0; i < aEvents.length; i++) {
		var oEvent = jQuery.Event(aEvents[i]);
		oEvent.setMarked("sapUiTableSkipItemNavigation");
		oControl._handleEvent(oEvent);
	}

	for (var i = 0; i < aEvents.length; i++) {
		oControl._handleEvent(jQuery.Event(aEvents[i]));
	}

	oControl._getKeyboardExtension().destroy();
});


QUnit.module("Destruction");


QUnit.test("destroy()", function(assert) {
	var oExtension = oTable._getKeyboardExtension();
	oTable.destroy();
	assert.ok(!oExtension.getTable(), "Table cleared");
	assert.ok(!oExtension._itemNavigation, "Item Navigation cleared");
	assert.ok(!oExtension._delegate, "Delegate cleared");
});