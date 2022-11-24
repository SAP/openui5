// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/content/Bool",
	"sap/ui/mdc/field/ListFieldHelpItem",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/SelectType",
	"sap/ui/model/ParseException",
	"sap/ui/model/FormatException",
	"sap/ui/model/odata/type/Boolean", // use odata type because of language dependent text
	"sap/m/library",
	"sap/ui/core/library"
], function (
		ValueHelpDelegate,
		Bool,
		ListFieldHelpItem,
		Condition,
		SelectType,
		ParseException,
		FormatException,
		BooleanType,
		mLibrary,
		coreLibrary
	) {
	"use strict";

	var oBool;
	var oType;
	var bIsOpen = true;

	var oContainer = { //to fake Container
		getScrollDelegate: function() {
			return null;
		},
		isOpen: function() {
			return bIsOpen;
		},
		invalidate: function () {},
		getValueHelpDelegate: function () {}
	};

	var _teardown = function() {
		oBool.destroy();
		oBool = null;
		oType.destroy();
		oType = undefined;
		bIsOpen = true;
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			var aConditions = [Condition.createItemCondition(true, "True")];
			oType = new BooleanType();
			oBool = new Bool("B1", {
				conditions: aConditions, // don't need to test the binding of Container here
				config: { // don't need to test the binding of Container here
					maxConditions: 1,
					operators: ["EQ"],
					dataType: oType
				}
			});
			sinon.stub(oBool, "getParent").returns(oContainer);
			oBool.oParent = oContainer; // fake
		},
		afterEach: _teardown
	});

	QUnit.test("configuration", function(assert) {

		assert.ok(oBool.getUseFirstMatch(), "useFirstMatch active");
		assert.ok(oBool.getUseAsValueHelp(), "useAsValueHelp active");
		assert.notOk(oBool.getFilterList(), "filterList not active");
		assert.notOk(oBool.getCaseSensitive(), "caseSensitive not active");

	});

	QUnit.test("getContent", function(assert) {

		var iSelect = 0;
		var aConditions;
		var sType;
		oBool.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		var iConfirm = 0;
		oBool.attachEvent("confirm", function(oEvent) {
			iConfirm++;
		});

		var oContent = oBool.getContent();

		if (oContent) {
			var fnDone = assert.async();
			oContent.then(function(oContent) {
				oBool.onShow(); // to update selection and scroll
				assert.ok(oContent, "Content returned");
				assert.ok(oContent.isA("sap.m.List"), "Content is sap.m.List");
				assert.equal(oBool.getDisplayContent(), oContent, "sap.m.List stored in displayContent");
				assert.equal(oContent.getWidth(), "100%", "List width");
				assert.notOk(oContent.getShowNoData(), "List showNoData");
				assert.notOk(oContent.getRememberSelections(), "List rememberSelections");
				assert.equal(oContent.getMode(), mLibrary.ListMode.SingleSelectMaster, "List mode");
				assert.ok(oContent.hasStyleClass("sapMComboBoxBaseList"), "List has style class sapMComboBoxBaseList");
				assert.ok(oContent.hasStyleClass("sapMComboBoxList"), "List has style class sapMComboBoxList");

				// internal items
				assert.equal(oBool.getItems().length, 2, "Number of items");
				var oItem = oBool.getItems()[0];
				assert.ok(oItem.isA("sap.ui.mdc.field.ListFieldHelpItem"), "Item0 is ListFieldHelpItem");
				assert.equal(oItem.getKey(), "true", "Item0 key");
				assert.equal(oItem.getText(), oType.formatValue(true, "string"), "Item0 text"); // as text of type is language dependednt
				oItem = oBool.getItems()[1];
				assert.ok(oItem.isA("sap.ui.mdc.field.ListFieldHelpItem"), "Item1 is ListFieldHelpItem");
				assert.equal(oItem.getKey(), "false", "Item1 key");
				assert.equal(oItem.getText(), oType.formatValue(false, "string"), "Item1 text"); // as text of type is language dependednt

				// rendered items
				assert.equal(oContent.getItems().length, 2, "Number of items");
				oItem = oContent.getItems()[0];
				assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item0 is DisplayListItem");
				assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item0 type");
				assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.Inherit, "Item0 valueTextDirection");
				assert.equal(oItem.getLabel(), oType.formatValue(true, "string"), "Item0 label");
				assert.equal(oItem.getValue(), "", "Item0 value");
				assert.ok(oItem.getSelected(), "Item0 selected");
				assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item0 has style class sapMComboBoxNonInteractiveItem");
				oItem = oContent.getItems()[1];
				assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item1 is DisplayListItem");
				assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item1 type");
				assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.Inherit, "Item1 valueTextDirection");
				assert.equal(oItem.getLabel(), oType.formatValue(false, "string"), "Item1 label");
				assert.equal(oItem.getValue(), "", "Item1 value");
				assert.notOk(oItem.getSelected(), "Item1 not selected");
				assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item1 has style class sapMComboBoxNonInteractiveItem");

				var aNewConditions = [
					Condition.createItemCondition(false, oType.formatValue(false, "string"))
				];
				oItem.setSelected(true);
				oContent.fireItemPress({listItem: oItem});
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, aNewConditions, "select event conditions");
				assert.equal(sType, SelectType.Set, "select event type");
				assert.equal(iConfirm, 1, "confirm event fired");
				assert.deepEqual(oBool.getConditions(), aNewConditions, "FixedList conditions");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("getValueHelpIcon", function(assert) {

		assert.equal(oBool.getValueHelpIcon(), "sap-icon://slim-arrow-down", "icon");

	});

	function _checkForKey(assert, bKey) {

		var bExpectException = bKey !== true && bKey !== false;

		var oConfig = {
			parsedValue: bKey,
			value: bKey,
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			conditionModel: undefined,
			conditionModelName: undefined,
			checkKey: true,
			checkDescription: false,
			exception: ParseException
		};

		var oPromise = oBool.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(!bExpectException, "Promise Then called");
				assert.deepEqual(oItem, {key: bKey, description: oType.formatValue(bKey, "string")}, "Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.ok(bExpectException, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}
	}

	QUnit.test("getItemForValue - key: true", function(assert) {

		_checkForKey(assert, true);

	});

	QUnit.test("getItemForValue - key: false", function(assert) {

		_checkForKey(assert, false);

	});

	QUnit.test("getItemForValue - key: undefined", function(assert) {

		_checkForKey(assert, undefined);

	});

	function _checkForDescription(assert, bKey) {

		var bExpectException = bKey !== true && bKey !== false;
		var sDescription;

		if (bExpectException) {
			sDescription = bKey;
		} else {
			sDescription = oType.formatValue(bKey, "string").slice(0, 2); // just use first 2 characters
		}

		var oConfig = {
			parsedValue: undefined,
			value: sDescription,
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			conditionModel: undefined,
			conditionModelName: undefined,
			checkKey: false,
			checkDescription: true,
			exception: ParseException
		};

		var oPromise = oBool.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(!bExpectException, "Promise Then called");
				assert.deepEqual(oItem, {key: bKey, description: oType.formatValue(bKey, "string")}, "Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.ok(bExpectException, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}
	}

	QUnit.test("getItemForValue - description: true", function(assert) {

		_checkForDescription(assert, true);

	});

	QUnit.test("getItemForValue - description: false", function(assert) {

		_checkForDescription(assert, false);

	});

	QUnit.test("getItemForValue - description: invalid", function(assert) {

		_checkForDescription(assert, "XXX");

	});

	QUnit.test("shouldOpenOnClick", function(assert) {

		assert.notOk(oBool.shouldOpenOnClick(), "should not open on click");

	});

	QUnit.test("isNavigationEnabled", function(assert) {

		assert.ok(oBool.isNavigationEnabled(), "navigation is enabled");

	});

});
