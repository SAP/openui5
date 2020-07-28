// Use this test page to test the API and features of the FieldHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/field/BoolFieldHelp",
	"sap/ui/mdc/field/FieldHelpBaseDelegate",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/core/Icon",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/Filter",
	"sap/m/library",
	"sap/m/Popover",
	"sap/m/List",
	"sap/m/StandardListItem"
], function (
		qutils,
		BoolFieldHelp,
		FieldHelpBaseDelegate,
		Condition,
		ConditionValidated,
		Icon,
		BooleanType,
		FormatException,
		ParseException,
		Filter,
		mLibrary,
		Popover,
		List,
		StandardListItem
	) {
	"use strict";

	var oFieldHelp;
	var oField;
	var oField2;
	var iDisconnect = 0;
	var iSelect = 0;
	var aSelectConditions;
	var bSelectAdd;
	var bSelectClose;
	var iNavigate = 0;
	var sNavigateValue;
	var sNavigateKey;
	var oNavigateCondition;
	var sNavigateItemId;
	var iDataUpdate = 0;
	var iOpen = 0;

	var _myDisconnectHandler = function(oEvent) {
		iDisconnect++;
	};

	var _mySelectHandler = function(oEvent) {
		iSelect++;
		aSelectConditions = oEvent.getParameter("conditions");
		bSelectAdd = oEvent.getParameter("add");
		bSelectClose = oEvent.getParameter("close");
	};

	var _myNavigateHandler = function(oEvent) {
		iNavigate++;
		sNavigateValue = oEvent.getParameter("value");
		sNavigateKey = oEvent.getParameter("key");
		oNavigateCondition = oEvent.getParameter("condition");
		sNavigateItemId = oEvent.getParameter("itemId");
	};

	var _myDataUpdateHandler = function(oEvent) {
		iDataUpdate++;
	};

	var _myOpenHandler = function(oEvent) {
		iOpen++;
	};

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	/* first test it without the Field to prevent loading of popup etc. */
	/* use dummy control to simulate Field */

	var _initFields = function() {
		oField = new Icon("F1", {src:"sap-icon://sap-ui5"});
		oField2 = new Icon("F2", {src:"sap-icon://sap-ui5"});
		oField2._getFormatOptions = function() {
			return {valueType: new BooleanType()};
		};

		oField.placeAt("content");
		oField2.placeAt("content");
		sap.ui.getCore().applyChanges();
	};

	var _teardown = function() {
		oFieldHelp.destroy();
		oFieldHelp = undefined;
		oField.destroy();
		oField = undefined;
		oField2.destroy();
		oField2 = undefined;
		iDisconnect = 0;
		iSelect = 0;
		aSelectConditions = undefined;
		bSelectAdd = undefined;
		bSelectClose = undefined;
		iNavigate = 0;
		sNavigateValue = undefined;
		sNavigateKey = undefined;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		iDataUpdate = 0;
		iOpen = 0;
		BoolFieldHelp._init();
	};

	QUnit.module("BoolFieldHelp", {
		beforeEach: function() {
			oFieldHelp = new BoolFieldHelp("F1-H", {
				disconnect: _myDisconnectHandler,
				select: _mySelectHandler,
				navigate: _myNavigateHandler,
				dataUpdate: _myDataUpdateHandler,
				open: _myOpenHandler
			});
			_initFields();
			oField.addDependent(oFieldHelp);
		},
		afterEach: _teardown
	});

	QUnit.test("default values", function(assert) {

		assert.ok(oFieldHelp.openByTyping(), "openByTyping");

	});

	function _listCreation(assert) {

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			assert.equal(iOpen, 1, "Open event fired");
			var oList = oPopover.getContent()[0];
			assert.ok(oList, "Popover has content");
			assert.ok(oList instanceof List, "content is List");
			var aItems = oList.getItems();
			assert.equal(aItems.length, 2, "List has 2 Items");
			assert.ok(aItems[0] instanceof StandardListItem, "Item is StandardListItem");
			assert.equal(aItems[0].getTitle(), "true", "default text assigned to item");
			assert.equal(aItems[1].getTitle(), "false", "default text assigned to item");
			assert.equal(iDataUpdate, 0, "DataUpdate event not fired");
			assert.equal(oPopover.getInitialFocus(), "F1", "Initial focus on Field");
		}

	}

	QUnit.test("List creation", function(assert) {

		assert.notOk(oFieldHelp._oList, "no List created by default");

		oFieldHelp.open();

		_listCreation(assert);

	});

	QUnit.test("List creation (loading list async)", function(assert) {

		var oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/m/List").onFirstCall().returns(undefined);
		oStub.callThrough();

		oFieldHelp.open();
		var fnDone = assert.async();
		setTimeout( function(){ // to wait for loading list
			_listCreation(assert);
			fnDone();
		}, 0);

		oStub.restore();

	});

	QUnit.test("conditions", function(assert) {

		var oCondition = Condition.createItemCondition(true, "true");
		oFieldHelp.setConditions([oCondition]);
		oFieldHelp.open();

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var oList = oPopover.getContent()[0];
			var aItems = oList.getItems();
			assert.ok(aItems[0].getSelected(), "Item 0 is selected");
			oCondition = Condition.createItemCondition(false);
			oFieldHelp.setConditions([oCondition]);
			assert.notOk(aItems[0].getSelected(), "Item 0 is not selected");
			assert.ok(aItems[1].getSelected(), "Item 1 is selected");
		}

	});

	QUnit.test("FilterValue", function(assert) {

		oFieldHelp.setFilterValue("t");
		oFieldHelp.open();

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var oList = oPopover.getContent()[0];
			var aItems = oList.getItems();
			assert.equal(aItems.length, 1, "List has 1 Items");
			assert.equal(aItems[0].getTitle(), "true", "Text assigned to item");
			oFieldHelp.setFilterValue("f");
			aItems = oList.getItems();
			assert.equal(aItems.length, 1, "List has 1 Item");
			assert.equal(aItems[0].getTitle(), "false", "Text assigned to item");
		}

	});

	QUnit.test("navigate", function(assert) {

		oFieldHelp.navigate(1);

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			assert.equal(iOpen, 1, "Open event fired");
			assert.ok(oPopover.isOpen(), "Field help opened");
			var oList = oPopover.getContent()[0];
			var aItems = oList.getItems();
			assert.ok(aItems[0].getSelected(), "Item 1 is selected");
			assert.equal(iNavigate, 1, "Navigate event fired");
			assert.equal(sNavigateValue, "true", "Navigate event value");
			assert.equal(sNavigateKey, true, "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "Navigate event condition operator");
			assert.equal(oNavigateCondition.values[0], true, "Navigate event condition key");
			assert.equal(oNavigateCondition.values[1], "true", "Navigate event condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Navigate event Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-0", "Navigate event itemId");
			var aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], true, "conditions key");

			oFieldHelp.navigate(1);
			assert.ok(aItems[1].getSelected(), "Item 2 is selected");
			assert.equal(iNavigate, 2, "Navigate event fired");
			assert.equal(sNavigateValue, "false", "Navigate event value");
			assert.equal(sNavigateKey, false, "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "Navigate event condition operator");
			assert.equal(oNavigateCondition.values[0], false, "Navigate event condition key");
			assert.equal(oNavigateCondition.values[1], "false", "Navigate event condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Navigate event Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-1", "Navigate event itemId");
			aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], false, "conditions key");

			oFieldHelp.navigate(-1);
			assert.ok(aItems[0].getSelected(), "Item 1 is selected");
			assert.equal(iNavigate, 3, "Navigate event fired");
			assert.equal(sNavigateValue, "true", "Navigate event value");
			assert.equal(sNavigateKey, true, "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "Navigate event condition operator");
			assert.equal(oNavigateCondition.values[0], true, "Navigate event condition key");
			assert.equal(oNavigateCondition.values[1], "true", "Navigate event condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Navigate event Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-0", "Navigate event itemId");
			aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], true, "conditions key");

			oFieldHelp.navigate(-1);
			assert.ok(aItems[0].getSelected(), "Item 1 is selected");
			assert.equal(iNavigate, 3, "Navigate event not fired");

			oFieldHelp.navigate(5);
			assert.ok(aItems[1].getSelected(), "Item 2 is selected");
			assert.equal(iNavigate, 4, "Navigate event fired");
			assert.equal(sNavigateValue, "false", "Navigate event value");
			assert.equal(sNavigateKey, false, "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "Navigate event condition operator");
			assert.equal(oNavigateCondition.values[0], false, "Navigate event condition key");
			assert.equal(oNavigateCondition.values[1], "false", "Navigate event condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Navigate event Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-1", "Navigate event itemId");
			aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], false, "conditions key");

			oFieldHelp.setConditions([]); // to initialize
			oFieldHelp.navigate(-1);
			assert.ok(aItems[1].getSelected(), "Item 2 is selected");
			assert.equal(iNavigate, 5, "Navigate event fired");
			assert.equal(sNavigateValue, "false", "Navigate event value");
			assert.equal(sNavigateKey, false, "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "Navigate event condition operator");
			assert.equal(oNavigateCondition.values[0], false, "Navigate event condition key");
			assert.equal(oNavigateCondition.values[1], "false", "Navigate event condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Navigate event Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-1", "Navigate event itemId");
			aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], false, "conditions key");

			oFieldHelp.navigate(1);
			assert.ok(aItems[1].getSelected(), "Item 2 is selected");
			assert.equal(iNavigate, 5, "Navigate event not fired");

			oFieldHelp.navigate(-5);
			assert.ok(aItems[0].getSelected(), "Item 1 is selected");
			assert.equal(iNavigate, 6, "Navigate event fired");
			assert.equal(sNavigateValue, "true", "Navigate event value");
			assert.equal(sNavigateKey, true, "Navigate event key");
			assert.equal(oNavigateCondition.operator, "EQ", "Navigate event condition operator");
			assert.equal(oNavigateCondition.values[0], true, "Navigate event condition key");
			assert.equal(oNavigateCondition.values[1], "true", "Navigate event condition description");
			assert.equal(oNavigateCondition.validated, ConditionValidated.Validated, "Navigate event Condition is validated");
			assert.equal(sNavigateItemId, "F1-H-item-F1-H-List-0", "Navigate event itemId");
			aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].values[0], true, "conditions key");
		}

	});

	QUnit.test("getTextForKey", function(assert) {

		var sText = oFieldHelp.getTextForKey(true);
		assert.equal(sText, "true", "Text for key");

		sText = oFieldHelp.getTextForKey(null);
		assert.equal(sText, null, "no Text for initial key");

		try {
			sText = oFieldHelp.getTextForKey("Test");
		} catch (oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof FormatException, "Error is a FormatException");
			var sError = oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["Test"]);
			assert.equal(oError.message, sError, "Error message");
		}

	});

	QUnit.test("getKeyForText", function(assert) {

		var sKey = oFieldHelp.getKeyForText("true");
		assert.equal(sKey, true, "key for text");

		sKey = oFieldHelp.getKeyForText("");
		assert.equal(sKey, null, "no key for empty text");

		try {
			sKey = oFieldHelp.getKeyForText("X");
		} catch (oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof ParseException, "Error is a ParseException");
			var sError = oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", ["X"]);
			assert.equal(oError.message, sError, "Error message");
		}

	});

	QUnit.test("select item", function(assert) {

		var oClock = sinon.useFakeTimers();
		oFieldHelp.open();
		oClock.tick(500); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var oList = oPopover.getContent()[0];
			var aItems = oList.getItems();
			qutils.triggerEvent("tap", aItems[1].getId());
			oClock.tick(500); // fake closing time

			assert.equal(iSelect, 1, "Select event fired");
			assert.equal(aSelectConditions.length, 1, "Selected conditions length");
			assert.equal(aSelectConditions[0].operator, "EQ", "Condition operator");
			assert.equal(aSelectConditions[0].values[0], false, "Selected conditions value0");
			assert.equal(aSelectConditions[0].values[1], "false", "Selected conditions value1");
			assert.equal(aSelectConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
			assert.ok(bSelectAdd, "Items should be added");
			assert.ok(bSelectClose, "FieldHelp closed in Event");
			var aConditions = oFieldHelp.getConditions();
			assert.equal(aConditions.length, 1, "conditions length");
			assert.equal(aConditions[0].operator, "EQ", "Condition operator");
			assert.equal(aConditions[0].values[0], false, "conditions key");
			assert.equal(aConditions[0].validated, ConditionValidated.Validated, "Condition is validated");
			assert.notOk(oPopover.isOpen(), "Field help closed");
		}

		oClock.restore();

	});

	QUnit.test("text from type", function(assert) {

		oFieldHelp.connect(oField2);
		oFieldHelp.open();

		var sText = oFieldHelp.getTextForKey(true);
		assert.equal(sText, "Yes", "Text for key");
		sText = oFieldHelp.getTextForKey(false);
		assert.equal(sText, "No", "Text for key");

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var oList = oPopover.getContent()[0];
			var aItems = oList.getItems();
			assert.equal(aItems[0].getTitle(), "Yes", "text assigned to item");
			assert.equal(aItems[1].getTitle(), "No", "text assigned to item");
		}

	});

});
