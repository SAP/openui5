/* global QUnit, sinon */

// only test what is not tested in FieldBase

/*eslint max-nested-callbacks: [2, 6]*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/ValueHelp",
	"sap/ui/mdc/valuehelp/Dialog",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/ui/mdc/field/FieldInput", // async. loading of content control tested in FieldBase test
	"sap/ui/mdc/field/FieldMultiInput", // async. loading of content control tested in FieldBase test
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/enum/BaseType",
	"sap/ui/mdc/odata/v4/FieldBaseDelegate", // make sure delegate is loaded (test delegate loading in FieldBase test)
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core"
], function (
		jQuery,
		qutils,
		FilterField,
		ValueHelp,
		Dialog,
		Conditions,
		FieldInput,
		FieldMultiInput,
		FilterOperatorUtil,
		BaseType,
		FieldBaseDelegate,
		KeyCodes,
		oCore
	) {
	"use strict";

	var oFilterField;
	var sId;
	var sValue;
	var bValid;
	var aChangedConditions;
	var iCount = 0;
	var oPromise;

	var _myChangeHandler = function(oEvent) {
		iCount++;
		sId = oEvent.oSource.getId();
		sValue = oEvent.getParameter("value");
		bValid = oEvent.getParameter("valid");
		aChangedConditions = oEvent.getParameter("conditions");
		oPromise = oEvent.getParameter("promise");
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
		oCore.applyChanges();

		var aContent = oFilterField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		assert.ok(oContent, "default content exist");
		assert.equal(oContent && oContent.getMetadata().getName(), "sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.field.FieldMultiInput is default");
		assert.ok(oContent.getShowValueHelp(), "valueHelp used");
		assert.equal(oFilterField._sDefaultFieldHelp, "Field-DefineConditions-Help", "Default Field help set");
		var oFieldHelp = oCore.byId(oFilterField._sDefaultFieldHelp);
		assert.ok(oFieldHelp && oFieldHelp instanceof ValueHelp, "ValueHelp used");

	});

	QUnit.test("internal control creation", function(assert) {

		var fnDone = assert.async();
		setTimeout(function() { // async control creation in applySettings
			var aContent = oFilterField.getAggregation("_content");
			var oContent = aContent && aContent.length > 0 && aContent[0];
			assert.notOk(oContent, "no content exist before rendering");

			oFilterField.destroy();
			oFilterField = new FilterField("FF1", {
				dataType: "sap.ui.model.type.String"
			});

			setTimeout(function() { // async control creation in applySettings
				aContent = oFilterField.getAggregation("_content");
				oContent = aContent && aContent.length > 0 && aContent[0];
				assert.ok(oContent, "content exist before rendering");
				fnDone();
			}, 0);
		}, 0);

	});

	QUnit.module("Eventing", {
		beforeEach: function() {
			oFilterField = new FilterField("FF1", {
				dataType: "sap.ui.model.type.Integer",
				dataTypeConstraints: {maximum: 100},
				change: _myChangeHandler,
				liveChange: _myLiveChangeHandler
			}).placeAt("content");
			oCore.applyChanges();
		},
		afterEach: function() {
			oFilterField.destroy();
			oFilterField = undefined;
			iCount = 0;
			sId = null;
			sValue = null;
			bValid = null;
			aChangedConditions = null;
			oPromise = null;
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

	QUnit.test("clenaup wrong input for single value", function(assert) {

		var fnDone = assert.async();
		oCore.getMessageManager().registerObject(oFilterField, true); // to test valueState
		oFilterField.setDataType("sap.ui.model.type.Integer");
		oFilterField.setMaxConditions(1);
		oFilterField.placeAt("content");
		oCore.applyChanges();

		var aContent = oFilterField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("XXXX");
		qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.ok(oFilterField._bParseError, "ParseError fired");
		assert.equal(iCount, 1, "change event fired again");
		assert.notOk(bValid, "Value is not valid");
		assert.equal(sValue, "XXXX", "Value of change event");
		assert.deepEqual(oFilterField.getConditions(), [], "FilterField conditions");
		assert.ok(oPromise, "Promise returned");
		setTimeout(function() { // to wait for valueStateMessage
			oPromise.then(function(vResult) {
				assert.notOk(true, "Promise must not be resolved");
				fnDone();
			}).catch(function(oException) {
				assert.ok(true, "Promise rejected");
				assert.equal(oException, "XXXX", "wrongValue");
				assert.equal(oFilterField.getValueState(), "Error", "ValueState");

				// cleanup should remove valueState
				oFilterField.setConditions([]);
				setTimeout(function() { // to wait for ManagedObjectModel update
					setTimeout(function() { // to wait for Message update
						assert.equal(jQuery(oContent.getFocusDomRef()).val(), "", "no value shown");
						assert.equal(oFilterField.getValueState(), "None", "ValueState removed");

						fnDone();
					}, 0);
				}, 0);
			});
		}, 0);

	});

	QUnit.test("clenaup wrong input for multi value", function(assert) {

		var fnDone = assert.async();
		oCore.getMessageManager().registerObject(oFilterField, true); // to test valueState
		oFilterField.setDataType("sap.ui.model.type.Date");
		oFilterField.placeAt("content");
		oCore.applyChanges();

		var aContent = oFilterField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];
		oContent.focus();
		jQuery(oContent.getFocusDomRef()).val("XXXX");
		qutils.triggerKeyboardEvent(oContent.getFocusDomRef().id, KeyCodes.ENTER, false, false, false);
		assert.ok(oFilterField._bParseError, "ParseError fired");
		assert.equal(iCount, 1, "change event fired again");
		assert.notOk(bValid, "Value is not valid");
		assert.equal(sValue, "XXXX", "Value of change event");
		assert.deepEqual(oFilterField.getConditions(), [], "FilterField conditions");
		assert.ok(oPromise, "Promise returned");
		setTimeout(function() { // to wait for valueStateMessage
			oPromise.then(function(vResult) {
				assert.notOk(true, "Promise must not be resolved");
				fnDone();
			}).catch(function(oException) {
				assert.ok(true, "Promise rejected");
				assert.equal(oException, "XXXX", "wrongValue");
				assert.equal(oFilterField.getValueState(), "Error", "ValueState");

				// cleanup should remove valueState
				oFilterField.setConditions([]);
				setTimeout(function() { // to wait for ManagedObjectModel update
					setTimeout(function() { // to wait for Message update
						assert.equal(jQuery(oContent.getFocusDomRef()).val(), "", "no value shown");
						assert.equal(oFilterField.getValueState(), "None", "ValueState removed");

						fnDone();
					}, 0);
				}, 0);
			});
		}, 0);

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

		oFilterField.setOperators("BT,LT");
		aOperators = oFilterField.getOperators();
		assert.equal(aOperators.length, 2, "two Operator returned");
		assert.equal(aOperators[0], "BT", "right Operator returned");
		assert.equal(aOperators[1], "LT", "right Operator returned");

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

	QUnit.test("value updates in searchfield scenario", function(assert) { // BCP: 2280085536
		oFilterField.destroy();
		oFilterField = new FilterField("FF1", {
			conditions: "{$filters>/conditions/$search}",
			maxConditions: 1,
			delegate: '{name: "sap/ui/mdc/odata/v4/FieldBaseDelegate", payload: {}}'
		});

		sinon.spy(oFilterField, "fireChange");

		oFilterField.placeAt("content");
		oCore.applyChanges();


		var aContent = oFilterField.getAggregation("_content");
		var oContent = aContent && aContent.length > 0 && aContent[0];

		oContent.fireChange({
			id: 'F1-inner-inner',
			value: '123'
		});

		assert.equal(oFilterField.fireChange.lastCall.args[0].value, '123', "Contains expected value");

		oContent.fireChange({
			id: 'F1-inner-inner',
			value: ''
		});

		assert.equal(oFilterField.fireChange.lastCall.args[0].value, undefined, "Contains expected value");

		oFilterField.fireChange.restore();
	});

});
