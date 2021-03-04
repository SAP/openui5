/* global QUnit, sinon */

// only test what is not tested in FieldBase

/*eslint max-nested-callbacks: [2, 6]*/

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/field/FieldValueHelp",
	"sap/ui/mdc/field/FieldMultiInput", // async. loading of content control tested in FieldBase test
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/enum/BaseType",
	"sap/ui/mdc/odata/v4/FieldBaseDelegate", // make sure delegate is loaded (test delegate loading in FieldBase test)
	"sap/ui/events/KeyCodes"
	], function (
		jQuery,
		qutils,
		FilterField,
		FieldValueHelp,
		FieldMultiInput,
		FilterOperatorUtil,
		BaseType,
		FieldBaseDelegate,
		KeyCodes
		) {
	"use strict";

	var oFilterField;
	var sId;
	var sValue;
	var bValid;
	var aChangedConditions;
	var iCount = 0;

	var _myChangeHandler = function(oEvent) {
		iCount++;
		sId = oEvent.oSource.getId();
		sValue = oEvent.getParameter("value");
		bValid = oEvent.getParameter("valid");
		aChangedConditions = oEvent.getParameter("conditions");
	};

	var sLiveId;
	var sLiveValue;
	var iLiveCount = 0;

	var _myLiveChangeHandler = function(oEvent) {
		iLiveCount++;
		sLiveId = oEvent.oSource.getId();
		sLiveValue = oEvent.getParameter("value");
	};

	QUnit.module("FilterField rendering", {
		beforeEach: function() {
			oFilterField = new FilterField("FF1");
		},
		afterEach: function() {
			oFilterField.destroy();
			oFilterField = undefined;
		}
	});

	QUnit.test("default rendering", function(assert) {

		oFilterField.placeAt("content");
		sap.ui.getCore().applyChanges();

		var aContent = oFilterField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "default content exist");
		assert.equal(oContent && oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.field.FieldMultiInput is default");
		assert.ok(oContent.getShowValueHelp(), "valueHelp used");
		assert.equal(oFilterField._sDefaultFieldHelp, "Field-DefineConditions-Help", "Default Field help set");
		var oFieldHelp = sap.ui.getCore().byId(oFilterField._sDefaultFieldHelp);
		assert.ok(oFieldHelp && oFieldHelp instanceof FieldValueHelp, "FieldValueHelp used");

	});

	QUnit.module("Eventing", {
		beforeEach: function() {
			oFilterField = new FilterField("FF1", {
				dataType: "sap.ui.model.type.Integer",
				dataTypeConstraints: {maximum: 100},
				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler
			}).placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oFilterField.destroy();
			oFilterField = undefined;
			iCount = 0;
			sId = null;
			sValue = null;
			bValid = null;
			aChangedConditions = null;
			iLiveCount = 0;
			sLiveId = null;
			sLiveValue = null;
		}
	});

	QUnit.test("with internal content", function(assert) {

		var aContent = oFilterField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("10");
		qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 1, "change event fired once");
		assert.equal(sId, "FF1", "change event fired on Field");
		assert.equal(sValue, 10, "change event value");
		assert.ok(bValid, "change event valid");
		assert.equal(aChangedConditions.length, 1, "Conditions of the change event");
		assert.equal(aChangedConditions[0].values[0], 10, "condition value");
		assert.equal(aChangedConditions[0].operator, "EQ", "condition operator");
		var aConditions = oFilterField.getConditions();
		assert.equal(aConditions.length, 1, "one condition in Codition model");
		assert.equal(aConditions[0].values[0], 10, "condition value");
		assert.equal(aConditions[0].operator, "EQ", "condition operator");
		var aTokens = oContent.getTokens ? oContent.getTokens() : [];
		assert.equal(aTokens.length, 1, "MultiInput has one Token");
		var oToken = aTokens[0];
		assert.equal(oToken && oToken.getText(), "=10", "Text on token set");

		//simulate liveChange by calling from internal control
		oContent.fireLiveChange({value: "2"});
		assert.equal(iLiveCount, 1, "liveChange event fired once");
		assert.equal(sLiveId, "FF1", "liveChange event fired on Field");
		assert.equal(sLiveValue, "2", "liveChange event value");

		jQuery(oContent.getFocusDomRef()).val("1000");
		qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.equal(iCount, 2, "change event fired again");
		assert.notOk(bValid, "Value is not valid");
		assert.equal(sValue, "1000", "change event wrongValue");

	});

	QUnit.module("API", {
		beforeEach: function() {
			oFilterField = new FilterField("FF1");
		},
		afterEach: function() {
			oFilterField.destroy();
			oFilterField = undefined;
		}
	});

	QUnit.test("_getOperators", function(assert) {

		sinon.spy(FilterOperatorUtil, "getOperatorsForType");

		var aOperators = oFilterField._getOperators();
		assert.ok(aOperators.length > 0, "Operators returned");
		assert.ok(FilterOperatorUtil.getOperatorsForType.calledWith(BaseType.String), "Default operators for string used");

		FilterOperatorUtil.getOperatorsForType.resetHistory();
		oFilterField.setOperators(["EQ"]);
		aOperators = oFilterField._getOperators();
		assert.equal(aOperators.length, 1, "one Operator returned");
		assert.equal(aOperators[0], "EQ", "right Operator returned");
		assert.notOk(FilterOperatorUtil.getOperatorsForType.called, "Default operators not used");

		FilterOperatorUtil.getOperatorsForType.restore();

	});

	QUnit.test("set/add/removeOperators", function(assert) {

		var oNE = FilterOperatorUtil.getOperator("NE");

		var aOperators = oFilterField.getOperators();
		assert.ok(aOperators.length == 0, "no Operators returned");

		oFilterField.setOperators(["BT"]);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 1, "one Operator returned");
		assert.equal(aOperators[0], "BT", "right Operator returned");

		oFilterField.addOperator("EQ");
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 2, "two Operators returned");

		oFilterField.removeOperator("EQ");
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 1, "one Operator returned");
		assert.equal(aOperators[0], "BT", "right Operator returned");

		oFilterField.addOperators(["LT", oNE]);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 3, "two Operators returned");

		oFilterField.removeOperators(["LT", oNE]);
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 1, "one Operator returned");
		assert.equal(aOperators[0], "BT", "right Operator returned");

		oFilterField.removeAllOperators();
		aOperators = oFilterField.getOperators();
		assert.ok(aOperators.length == 0, "no Operators returned");

	});

	QUnit.test("set/getDefaultOperator", function(assert) {

		var oNE = FilterOperatorUtil.getOperator("NE");

		var sOperatorName = oFilterField.getDefaultOperator();
		assert.equal(sOperatorName, "", "no default Operator set");

		oFilterField.setDefaultOperator("BT");
		sOperatorName = oFilterField.getDefaultOperator();
		assert.equal(sOperatorName, "BT", "correct defaultOperator returned");

		oFilterField.setDefaultOperator(oNE);
		sOperatorName = oFilterField.getDefaultOperator();
		assert.equal(sOperatorName, "NE", "correct defaultOperator returned");

		oFilterField.setDefaultOperator();
		sOperatorName = oFilterField.getDefaultOperator();
		assert.equal(sOperatorName, "", "no default Operator set");

	});

});
