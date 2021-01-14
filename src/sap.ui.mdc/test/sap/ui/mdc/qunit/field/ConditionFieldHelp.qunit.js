// Use this test page to test the API and features of the FieldHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/field/ConditionFieldHelp",
	"sap/ui/mdc/field/FieldHelpBaseDelegate",
	"sap/ui/mdc/field/DefineConditionPanel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/core/Icon",
	"sap/ui/model/odata/type/Date",
	"sap/m/library",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function (
		qutils,
		ConditionFieldHelp,
		FieldHelpBaseDelegate,
		DefineConditionPanel,
		Condition,
		ConditionValidated,
		Icon,
		DateType,
		mLibrary,
		Popover,
		Button,
		Toolbar,
		ToolbarSpacer
	) {
	"use strict";

	var oFieldHelp;
	var oField;
	var iDisconnect = 0;
	var iSelect = 0;
	var aSelectConditions;
	var bSelectAdd;
	var bSelectClose;
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

	var _myDataUpdateHandler = function(oEvent) {
		iDataUpdate++;
	};

	var _myOpenHandler = function(oEvent) {
		iOpen++;
	};

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	/* first test it without the Field to prevent loading of popup etc. */
	/* use dummy control to simulate Field */

	var _initFieldHelp = function() {
		oFieldHelp = new ConditionFieldHelp("F1-H", {
			disconnect: _myDisconnectHandler,
			select: _mySelectHandler,
			dataUpdate: _myDataUpdateHandler,
			open: _myOpenHandler
		});

		oField = new Icon("F1", {src:"sap-icon://sap-ui5"});
		oField._getFormatOptions = function() {
			return {valueType: new DateType()};
		};
		oField.placeAt("content");

		oField.addDependent(oFieldHelp);

		sap.ui.getCore().applyChanges();
	};

	var _teardown = function() {
		oFieldHelp.destroy();
		oFieldHelp = undefined;
		oField.destroy();
		oField = undefined;
		iDisconnect = 0;
		iSelect = 0;
		aSelectConditions = undefined;
		bSelectAdd = undefined;
		bSelectClose = undefined;
		iDataUpdate = 0;
		iOpen = 0;
		ConditionFieldHelp._init();
	};

	QUnit.module("Content", {
		beforeEach: _initFieldHelp,
		afterEach: _teardown
	});

	QUnit.test("default values", function(assert) {

		assert.notOk(oFieldHelp.openByTyping(), "openByTyping");
		assert.ok(oFieldHelp.isFocusInHelp(), "isFocusInHelp");
//		assert.equal(oFieldHelp.getIcon(), "sap-icon://filter-fields", "getIcon");
		assert.equal(oFieldHelp.getIcon(), "sap-icon://value-help", "getIcon");
		assert.notOk(oFieldHelp.isValidationSupported(), "isValidationSupported");

	});

	function _popoverContent(assert) {

		var oPopover = oFieldHelp.getAggregation("_popover");
		assert.ok(oPopover, "Popover created");
		assert.ok(oPopover.getShowArrow(), "Popover arrow enabled");

		var aContent = oPopover._getAllContent();
		var oFormatOptions = oFieldHelp._oField ? oFieldHelp._oField._getFormatOptions() : {};
		assert.equal(aContent.length, 1, "Popover has content");
		if (aContent.length > 0) {
			assert.ok(aContent[0] && aContent[0].isA("sap.ui.mdc.field.DefineConditionPanel"), "Popover has DefineConditionPanel as content");
			assert.deepEqual(aContent[0].getFormatOptions(), oFormatOptions, "FormatOptions of Field used");
		}

		var oFooter = oPopover.getFooter();
		assert.ok(oFooter, "Popover has footer");
		if (oFooter) {
			assert.ok(oFooter.isA("sap.m.Toolbar"), "Popover has Toolbar as Footer");
			var aToolbarContent = oFooter.getContent();
			assert.equal(aToolbarContent.length, 3, "Toolbar has 3 items");
			assert.ok(aToolbarContent[0] && aToolbarContent[0].isA("sap.m.ToolbarSpacer"), "Toolbar has Spacer");
			assert.ok(aToolbarContent[1] && aToolbarContent[1].isA("sap.m.Button"), "Toolbar has first Button");
			assert.equal(aToolbarContent[1] && aToolbarContent[1].getType(), mLibrary.ButtonType.Emphasized, "first button is emphasized");
			assert.equal(aToolbarContent[1] && aToolbarContent[1].getText(), oResourceBundle.getText("valuehelp.OK"), "first button text");
			assert.ok(aToolbarContent[2] && aToolbarContent[2].isA("sap.m.Button"), "Toolbar has second Button");
			assert.equal(aToolbarContent[2] && aToolbarContent[2].getType(), mLibrary.ButtonType.Default, "second button has default type");
			assert.equal(aToolbarContent[2] && aToolbarContent[2].getText(), oResourceBundle.getText("valuehelp.CANCEL"), "second button text");
		}

	}

	QUnit.test("popover content", function(assert) {

		assert.notOk(oFieldHelp._oDefineConditionPanel, "no DefineConditionPanel created by default");

		oFieldHelp.open(); // open unconnected to test defaults

		_popoverContent(assert);

	});

	QUnit.test("popover content (loading modules async)", function(assert) {

		var oStub = sinon.stub(sap.ui, "require");
		oStub.withArgs("sap/ui/mdc/field/DefineConditionPanel").onFirstCall().returns(undefined);
		oStub.callThrough();

		oFieldHelp.connect(oField);
		oFieldHelp.open();
		var fnDone = assert.async();
		setTimeout( function(){ // to wait for loading DefineConditionPanel
			_popoverContent(assert);
			fnDone();
		}, 0);

		oStub.restore();

	});

	QUnit.test("_getControlForSuggestion", function(assert) { // TODO: better way to test arrow position

		sinon.stub(oField, "getAggregation").withArgs("_endIcon").returns("X");
		oFieldHelp.connect(oField);
		var oControl = oFieldHelp._getControlForSuggestion();

		assert.equal(oControl, "X", "Control for opening Popover");

	});

	QUnit.module("Interaction", {
		beforeEach: _initFieldHelp,
		afterEach: _teardown
	});

	QUnit.test("conditions", function(assert) {

		oFieldHelp.connect(oField);
		var oCondition = Condition.createCondition("StartsWith", ["A"], undefined, undefined, ConditionValidated.NotValidated);
		oFieldHelp.setConditions([oCondition]);

		var oClock = sinon.useFakeTimers();
		oFieldHelp.open();
		oClock.tick(500); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var aContent = oPopover._getAllContent();
			if (aContent.length > 0) {
				var oDCP = aContent[0];
				var aConditions = oDCP.getConditions();
				assert.deepEqual(aConditions, oFieldHelp.getConditions(), "Conditions of Fieldhelp used");

				oCondition = Condition.createCondition("StartsWith", ["B"], undefined, undefined, ConditionValidated.NotValidated);
				aConditions = [oCondition];
				oDCP.setConditions(aConditions);
				assert.deepEqual(aConditions, oFieldHelp.getConditions(), "Conditions of DefineConditionPanel transfered to Fieldhelp");

				oFieldHelp.close();
				oClock.tick(500); // fake closing time

				oCondition = Condition.createCondition("StartsWith", ["C"], undefined, undefined, ConditionValidated.NotValidated);
				oFieldHelp.setConditions([oCondition]);
				aConditions = oDCP.getConditions();
				assert.notDeepEqual(aConditions, oFieldHelp.getConditions(), "Conditions of Fieldhelp not used if closed");
			}
		}

		oClock.restore();

	});

	QUnit.test("invalid condition", function(assert) {

		oFieldHelp.connect(oField);

		var oClock = sinon.useFakeTimers();
		oFieldHelp.open();
		oClock.tick(500); // fake opening time

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var aContent = oPopover._getAllContent();
			if (aContent.length > 0) {
				var oDCP = aContent[0];
				var oButtonOK = oPopover.getFooter().getContent()[1];
				assert.ok(oButtonOK.getEnabled(), "OK-Button is enabled");

				oDCP.setInputOK(false);
				assert.notOk(oButtonOK.getEnabled(), "OK-Button is disabled");

				oDCP.setInputOK(true);
				assert.ok(oButtonOK.getEnabled(), "OK-Button is enabled");

				sinon.spy(oFieldHelp._oDefineConditionPanel, "cleanUp");

				oFieldHelp.close();
				oClock.tick(500); // fake closing time

				assert.ok(oFieldHelp._oDefineConditionPanel.cleanUp.called, "DefineConditionPanel cleanUp used on closing");
			}
		}

		oClock.restore();

	});

	QUnit.test("press OK", function(assert) {

		oFieldHelp.connect(oField);
		oFieldHelp.open();

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var aContent = oPopover._getAllContent();
			if (aContent.length > 0) {
				var oDCP = aContent[0];
				var oCondition = Condition.createCondition("StartsWith", ["A"], undefined, undefined, ConditionValidated.NotValidated);
				var aConditions = [oCondition];
				oCondition = Condition.createCondition("TODAY", ["staticTextDummy"], undefined, undefined, ConditionValidated.NotValidated);
				aConditions.push(oCondition);
				oDCP.setConditions(aConditions);

				var oToolbar = oPopover.getFooter();
				var aToolbarContent = oToolbar.getContent();
				var oButton = aToolbarContent[1];
				oButton.firePress(); // simulate user action

				assert.equal(iSelect, 1, "Select event fired");
				assert.equal(aSelectConditions.length, 2, "Selected conditions length");
				assert.equal(aSelectConditions[0].operator, "StartsWith", "Condition0 operator");
				assert.equal(aSelectConditions[0].values[0], "A", "Condition0 value0");
				assert.equal(aSelectConditions[0].values[1], undefined, "Condition0 value1");
				assert.equal(aSelectConditions[0].validated, ConditionValidated.NotValidated, "Condition0 is not validated");
				assert.equal(aSelectConditions[1].operator, "TODAY", "Condition1 operator");
				assert.equal(aSelectConditions[1].values[0], undefined, "Condition1 value0");
				assert.equal(aSelectConditions[1].values[1], undefined, "Condition1 value1");
				assert.equal(aSelectConditions[1].validated, ConditionValidated.NotValidated, "Condition1 is not validated");
				assert.notOk(bSelectAdd, "all items should be used");
				assert.ok(bSelectClose, "FieldHelp closed in Event");
			}
		}

	});

	QUnit.test("press Cancel", function(assert) {

		oFieldHelp.connect(oField);
		oFieldHelp.open();

		var oPopover = oFieldHelp.getAggregation("_popover");
		if (oPopover) {
			var aContent = oPopover._getAllContent();
			if (aContent.length > 0) {
				var oDCP = aContent[0];
				var oCondition = Condition.createCondition("StartsWith", ["A"], undefined, undefined, ConditionValidated.NotValidated);
				var aConditions = [oCondition];
				oDCP.setConditions(aConditions);

				var oToolbar = oPopover.getFooter();
				var aToolbarContent = oToolbar.getContent();
				var oButton = aToolbarContent[2];
				oButton.firePress(); // simulate user action

				assert.equal(iSelect, 0, "Select event not fired");
			}
		}

	});

	QUnit.module("formatting/parsing", {
		beforeEach: _initFieldHelp,
		afterEach: _teardown
	});

	QUnit.test("getTextForKey", function(assert) {

		var sText = oFieldHelp.getTextForKey("A");
		assert.equal(sText, "", "no description");

	});

	QUnit.test("getKeyForText", function(assert) {

		var sKey = oFieldHelp.getKeyForText("A");
		assert.equal(sKey, null, "no key");

	});

	QUnit.test("getItemForValue", function(assert) {

		var oItem = oFieldHelp.getItemForValue("1", 1, undefined, undefined, undefined, true, true, true);
		assert.deepEqual(oItem, {key: 1, description: undefined}, "only key filled");

	});

});
