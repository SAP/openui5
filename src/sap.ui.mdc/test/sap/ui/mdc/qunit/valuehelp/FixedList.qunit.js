// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/content/FixedList",
	"sap/ui/mdc/field/ListFieldHelpItem",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/SelectType",
	"sap/ui/model/ParseException",
	"sap/ui/model/FormatException",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/base/strings/whitespaceReplacer"
], function (
		ValueHelpDelegate,
		FixedList,
		ListFieldHelpItem,
		Condition,
		SelectType,
		ParseException,
		FormatException,
		mLibrary,
		coreLibrary,
		whitespaceReplacer
	) {
	"use strict";

	var oFixedList;
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
		oFixedList.destroy();
		oFixedList = null;
		bIsOpen = true;
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			var aConditions = [Condition.createItemCondition("I2", "My Item 2")];
			oFixedList = new FixedList("FL1", {
				items: [
					new ListFieldHelpItem("I1", {key: "I1", text: "Item 1", additionalText: "My Item 1", groupKey: "G1", groupText: "Group 1"}),
					new ListFieldHelpItem("I2", {key: "I2", text: "My Item   2", additionalText: "Item   2", groupKey: "G2", groupText: "Group 2", textDirection: coreLibrary.TextDirection.RTL}),
					new ListFieldHelpItem("I3", {key: "I3", text: "item 3", additionalText: "My Item 3", groupKey: "G1", groupText: "Group 1"})
				],
				conditions: aConditions, // don't need to test the binding of Container here
				config: { // don't need to test the binding of Container here
					maxConditions: -1,
					operators: ["EQ"]
				}
			});
			sinon.stub(oFixedList, "getParent").returns(oContainer);
			oFixedList.oParent = oContainer; // fake
		},
		afterEach: _teardown
	});

	QUnit.test("getContent", function(assert) {

		var iSelect = 0;
		var aConditions;
		var sType;
		oFixedList.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		var iConfirm = 0;
		oFixedList.attachEvent("confirm", function(oEvent) {
			iConfirm++;
		});

		var oContent = oFixedList.getContent();

		if (oContent) {
			var fnDone = assert.async();
			oContent.then(function(oContent) {
				oFixedList.onShow(); // to update selection and scroll
				assert.ok(oContent, "Content returned");
				assert.ok(oContent.isA("sap.m.List"), "Content is sap.m.List");
				assert.equal(oFixedList.getDisplayContent(), oContent, "sap.m.List stored in displayContent");
				assert.equal(oContent.getWidth(), "100%", "List width");
				assert.notOk(oContent.getShowNoData(), "List showNoData");
				assert.notOk(oContent.getRememberSelections(), "List rememberSelections");
				assert.equal(oContent.getMode(), mLibrary.ListMode.SingleSelectMaster, "List mode");
				assert.ok(oContent.hasStyleClass("sapMComboBoxBaseList"), "List has style class sapMComboBoxBaseList");
				assert.ok(oContent.hasStyleClass("sapMComboBoxList"), "List has style class sapMComboBoxList");
				assert.equal(oContent.getItems().length, 3, "Number of items");
				var oItem = oContent.getItems()[0];
				assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item0 is DisplayListItem");
				assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item0 type");
				assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.Inherit, "Item0 valueTextDirection");
				assert.equal(oItem.getLabel(), "Item 1", "Item0 label");
				assert.equal(oItem.getValue(), "My Item 1", "Item0 value");
				assert.notOk(oItem.getSelected(), "Item0 not selected");
				assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item0 has style class sapMComboBoxNonInteractiveItem");
				oItem = oContent.getItems()[1];
				assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item1 is DisplayListItem");
				assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item1 type");
				assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.RTL, "Item1 valueTextDirection");
				assert.equal(oItem.getLabel(), whitespaceReplacer("My Item   2"), "Item1 label");
				assert.equal(oItem.getValue(), whitespaceReplacer("Item   2"), "Item1 value");
				assert.ok(oItem.getSelected(), "Item1 selected");
				assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item1 has style class sapMComboBoxNonInteractiveItem");
				oItem = oContent.getItems()[2];
				assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item2 is DisplayListItem");
				assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item2 type");
				assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.Inherit, "Item2 valueTextDirection");
				assert.equal(oItem.getLabel(), "item 3", "Item2 label");
				assert.equal(oItem.getValue(), "My Item 3", "Item2 value");
				assert.notOk(oItem.getSelected(), "Item2 not selected");
				assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item2 has style class sapMComboBoxNonInteractiveItem");

				var aNewConditions = [
					Condition.createItemCondition("I3", "item 3")
				];
				oItem.setSelected(true);
				oContent.fireItemPress({listItem: oItem});
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, aNewConditions, "select event conditions");
				assert.equal(sType, SelectType.Set, "select event type");
				assert.equal(iConfirm, 1, "confirm event fired");
				assert.deepEqual(oFixedList.getConditions(), aNewConditions, "FixedList conditions");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("getContent with grouping", function(assert) {

		oFixedList.setGroupable(true);

		var oContent = oFixedList.getContent();

		if (oContent) {
			var fnDone = assert.async();
			oContent.then(function(oContent) {
				oFixedList.onShow(); // to update selection and scroll
				assert.ok(oContent, "Content returned");
				assert.ok(oContent.isA("sap.m.List"), "Content is sap.m.List");
				assert.equal(oContent.getItems().length, 5, "Number of items");
				var oItem = oContent.getItems()[0];
				assert.ok(oItem.isA("sap.m.GroupHeaderListItem"), "Item0 is GroupHeaderListItem");
				assert.equal(oItem.getType(), mLibrary.ListType.Inactive, "Item0 type");
				assert.equal(oItem.getTitle(), "Group 1", "Item0 title");
				oItem = oContent.getItems()[1];
				assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item1 is DisplayListItem");
				assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item1 type");
				assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.Inherit, "Item1 valueTextDirection");
				assert.equal(oItem.getLabel(), "Item 1", "Item1 label");
				assert.equal(oItem.getValue(), "My Item 1", "Item1 value");
				assert.notOk(oItem.getSelected(), "Item1 not selected");
				assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item1 has style class sapMComboBoxNonInteractiveItem");
				oItem = oContent.getItems()[2];
				assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item2 is DisplayListItem");
				assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item2 type");
				assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.Inherit, "Item2 valueTextDirection");
				assert.equal(oItem.getLabel(), "item 3", "Item2 label");
				assert.equal(oItem.getValue(), "My Item 3", "Item2 value");
				assert.notOk(oItem.getSelected(), "Item2 not selected");
				assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item2 has style class sapMComboBoxNonInteractiveItem");
				oItem = oContent.getItems()[3];
				assert.ok(oItem.isA("sap.m.GroupHeaderListItem"), "Item3 is GroupHeaderListItem");
				assert.equal(oItem.getType(), mLibrary.ListType.Inactive, "Item3 type");
				assert.equal(oItem.getTitle(), "Group 2", "Item3 title");
				oItem = oContent.getItems()[4];
				assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item4 is DisplayListItem");
				assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item4 type");
				assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.RTL, "Item4 valueTextDirection");
				assert.equal(oItem.getLabel(), whitespaceReplacer("My Item   2"), "Item4 label");
				assert.equal(oItem.getValue(), whitespaceReplacer("Item   2"), "Item4 value");
				assert.ok(oItem.getSelected(), "Item4 selected");
				assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item4 has style class sapMComboBoxNonInteractiveItem");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("Filtering", function(assert) {

		oFixedList.setFilterValue("i");
		var oContent = oFixedList.getContent();

		if (oContent) {
			var fnDone = assert.async();
			oContent.then(function(oContent) {
				oFixedList.onShow(); // to update selection and scroll
				assert.equal(oContent.getItems().length, 2, "Number of items");
				var oItem = oContent.getItems()[0];
				assert.equal(oItem.getLabel(), "Item 1", "Item0 label");
				assert.equal(oItem.getValue(), "My Item 1", "Item0 value");
				oItem = oContent.getItems()[1];
				assert.equal(oItem.getLabel(), "item 3", "Item1 label");
				assert.equal(oItem.getValue(), "My Item 3", "Item1 value");

				oFixedList.setCaseSensitive(true);
				assert.equal(oContent.getItems().length, 1, "Number of items");
				oItem = oContent.getItems()[0];
				assert.equal(oItem.getLabel(), "item 3", "Item0 label");
				assert.equal(oItem.getValue(), "My Item 3", "Item0 value");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("Filtering without hiding", function(assert) {

		oFixedList.setFilterValue("i");
		oFixedList.setConditions([]);
		oFixedList.setUseFirstMatch(true);
		oFixedList.setFilterList(false);
		var oContent = oFixedList.getContent();

		if (oContent) {
			var fnDone = assert.async();
			oContent.then(function(oContent) {
				oFixedList.onShow(); // to update selection and scroll
				assert.equal(oContent.getItems().length, 3, "Number of items");
				var oItem = oContent.getItems()[0];
				assert.equal(oItem.getLabel(), "Item 1", "Item0 label");
				assert.equal(oItem.getValue(), "My Item 1", "Item0 value");
				assert.ok(oItem.getSelected(), "Item0 selected");
				oItem = oContent.getItems()[1];
				assert.equal(oItem.getLabel(), whitespaceReplacer("My Item   2"), "Item1 label");
				assert.equal(oItem.getValue(), whitespaceReplacer("Item   2"), "Item1 value");
				assert.notOk(oItem.getSelected(), "Item1 not selected");
				oItem = oContent.getItems()[2];
				assert.equal(oItem.getLabel(), "item 3", "Item2 label");
				assert.equal(oItem.getValue(), "My Item 3", "Item2 value");
				assert.notOk(oItem.getSelected(), "Item2 not selected");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue - match", function(assert) {

		var oConfig = {
			parsedValue: "I2",
			value: "I2",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			conditionModel: undefined,
			conditionModelName: undefined,
			checkKey: true,
			checkDescription: true,
			exception: ParseException
		};

		var oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "I2", description: "My Item   2"}, "Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue - no value for key", function(assert) {

		var oConfig = {
			parsedValue: undefined,
			value: undefined,
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			conditionModel: undefined,
			conditionModelName: undefined,
			checkKey: true,
			checkDescription: false,
			exception: ParseException
		};

		var oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, null, "no Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue - empty value for key", function(assert) {

		var oConfig = {
			parsedValue: "",
			value: "",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			conditionModel: undefined,
			conditionModelName: undefined,
			checkKey: true,
			checkDescription: false,
			exception: ParseException
		};

		var oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, null, "no Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue - empty value for description", function(assert) {

		var oConfig = {
			parsedValue: "",
			value: "",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			conditionModel: undefined,
			conditionModelName: undefined,
			checkKey: false,
			checkDescription: true,
			exception: ParseException
		};

		var oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, null, "no Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue - useFirstMatch for key", function(assert) {

		var oConfig = {
			parsedValue: undefined,
			value: "I",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			conditionModel: undefined,
			conditionModelName: undefined,
			checkKey: false, // as value might not be a valid key, jsut a part of it
			checkDescription: false,
			exception: ParseException
		};
		oFixedList.setUseFirstMatch(true);

		var oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "I1", description: "Item 1"}, "Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue - useFirstMatch for description", function(assert) {

		var oConfig = {
			parsedValue: undefined,
			value: "I",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			conditionModel: undefined,
			conditionModelName: undefined,
			checkKey: false,
			checkDescription: true,
			exception: ParseException
		};
		oFixedList.setUseFirstMatch(true);

		var oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.ok(true, "Promise Then must be called");
				assert.deepEqual(oItem, {key: "I1", description: "Item 1"}, "Item returned");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue - not found", function(assert) {

		var oConfig = {
			parsedValue: "I",
			value: "I",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			conditionModel: undefined,
			conditionModelName: undefined,
			checkKey: true,
			checkDescription: false,
			exception: FormatException
		};
		oFixedList.setUseFirstMatch(false);

		var oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function(oItem) {
				assert.notOk(true, "Promise Then must not be called");
				fnDone();
			}).catch(function(oError) {
				assert.ok(true, "Promise Catch called");
				assert.ok(oError instanceof FormatException, "ParseException fired");
				assert.equal(oError.message, 'Value "I" does not exist.', "Error message");
				fnDone();
			});
		}

	});

	QUnit.test("isValidationSupported", function(assert) {

		assert.ok(oFixedList.isValidationSupported(), "validation is supported");

	});

	QUnit.test("navigate", function(assert) {

		var iNavigate = 0;
		var oNavigateCondition;
		var sNavigateItemId;
		var bNavigateLeaveFocus;
		oFixedList.attachEvent("navigated", function(oEvent) {
			iNavigate++;
			oNavigateCondition = oEvent.getParameter("condition");
			sNavigateItemId = oEvent.getParameter("itemId");
			bNavigateLeaveFocus = oEvent.getParameter("leaveFocus");
		});

		oFixedList.setConditions([]);
		var oContent = oFixedList.getContent(); // as content needs to be crated before navigation is possible

		if (oContent) {
			var fnDone = assert.async();
			oContent.then(function(oContent) {
				oFixedList.onShow(); // to update selection and scroll
				oFixedList.navigate(1);
				assert.ok(oContent.hasStyleClass("sapMListFocus"), "List has style class sapMListFocus");
				var oItem = oContent.getItems()[0];
				assert.ok(oItem.getSelected(), "Item0 selected");
				oItem = oContent.getItems()[1];
				assert.notOk(oItem.getSelected(), "Item1 not selected");
				oItem = oContent.getItems()[2];
				assert.notOk(oItem.getSelected(), "Item2 not selected");

				var oCondition = Condition.createItemCondition("I1", "Item 1");
				assert.equal(iNavigate, 1, "Navigated Event fired");
				assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
				assert.equal(sNavigateItemId, "FL1-item-FL1-List-0", "Navigated itemId");
				assert.notOk(bNavigateLeaveFocus, "Navigated leaveFocus");
				assert.deepEqual(oFixedList.getConditions(), [oCondition], "FixedList conditions");
				iNavigate = 0;
				oNavigateCondition = undefined;
				sNavigateItemId = undefined;

				// no previout item
				oFixedList.navigate(-1);
				oItem = oContent.getItems()[0];
				assert.ok(oItem.getSelected(), "Item0 selected");
				oItem = oContent.getItems()[1];
				assert.notOk(oItem.getSelected(), "Item1 not selected");
				oItem = oContent.getItems()[2];
				assert.notOk(oItem.getSelected(), "Item2 not selected");

				assert.equal(iNavigate, 1, "Navigated Event fired");
				assert.deepEqual(oNavigateCondition, undefined, "no Navigated condition");
				assert.equal(sNavigateItemId, undefined, " no Navigated itemId");
				assert.ok(bNavigateLeaveFocus, "Navigated leaveFocus");
				assert.deepEqual(oFixedList.getConditions(), [oCondition], "FixedList conditions");
				iNavigate = 0;
				oNavigateCondition = undefined;
				sNavigateItemId = undefined;

				// next item of selected one
				oFixedList.navigate(1);
				oItem = oContent.getItems()[0];
				assert.notOk(oItem.getSelected(), "Item0 not selected");
				oItem = oContent.getItems()[1];
				assert.ok(oItem.getSelected(), "Item1 selected");
				oItem = oContent.getItems()[2];
				assert.notOk(oItem.getSelected(), "Item2 not selected");

				oCondition = Condition.createItemCondition("I2", "My Item   2");
				assert.equal(iNavigate, 1, "Navigated Event fired");
				assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
				assert.equal(sNavigateItemId, "FL1-item-FL1-List-1", "Navigated itemId");
				assert.notOk(bNavigateLeaveFocus, "Navigated leaveFocus");
				assert.deepEqual(oFixedList.getConditions(), [oCondition], "FixedList conditions");
				iNavigate = 0;
				oNavigateCondition = undefined;
				sNavigateItemId = undefined;
				oContent.getItems()[1].setSelected(false); // initialize

				// no item selected -> navigate to last
				oFixedList.navigate(-1);
				oItem = oContent.getItems()[0];
				assert.notOk(oItem.getSelected(), "Item0 not selected");
				oItem = oContent.getItems()[1];
				assert.notOk(oItem.getSelected(), "Item1 not selected");
				oItem = oContent.getItems()[2];
				assert.ok(oItem.getSelected(), "Item2 selected");

				oCondition = Condition.createItemCondition("I3", "item 3");
				assert.equal(iNavigate, 1, "Navigated Event fired");
				assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
				assert.equal(sNavigateItemId, "FL1-item-FL1-List-2", "Navigated itemId");
				assert.notOk(bNavigateLeaveFocus, "Navigated leaveFocus");
				assert.deepEqual(oFixedList.getConditions(), [oCondition], "FixedList conditions");

				oFixedList.onHide();
				assert.notOk(oContent.hasStyleClass("sapMListFocus"), "List removed style class sapMListFocus");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("navigate - without filtering but groupable", function(assert) {

		var iNavigate = 0;
		var oNavigateCondition;
		var sNavigateItemId;
		var bNavigateLeaveFocus;
		oFixedList.attachEvent("navigated", function(oEvent) {
			iNavigate++;
			oNavigateCondition = oEvent.getParameter("condition");
			sNavigateItemId = oEvent.getParameter("itemId");
			bNavigateLeaveFocus = oEvent.getParameter("leaveFocus");
		});

		oFixedList.setGroupable(true);
		oFixedList.setConditions([]);
		oFixedList.setFilterList(false);
		oFixedList.setFilterValue("M");
		bIsOpen = false;
		var oContent = oFixedList.getContent(); // as content needs to be crated before navigation is possible

		if (oContent) {
			var fnDone = assert.async();
			oContent.then(function(oContent) {
				oFixedList.navigate(1);
				var oItem = oContent.getItems()[1];
				assert.notOk(oItem.getSelected(), "Item1 not selected");
				oItem = oContent.getItems()[2];
				assert.notOk(oItem.getSelected(), "Item2 not selected");
				oItem = oContent.getItems()[4];
				assert.ok(oItem.getSelected(), "Item4 selected");

				var oCondition = Condition.createItemCondition("I2", "My Item   2");
				assert.equal(iNavigate, 1, "Navigated Event fired");
				assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
				assert.equal(sNavigateItemId, "FL1-item-FL1-List-2", "Navigated itemId");
				assert.notOk(bNavigateLeaveFocus, "Navigated leaveFocus");
				assert.deepEqual(oFixedList.getConditions(), [oCondition], "FixedList conditions");
				assert.equal(oFixedList._iNavigateIndex, 4, "navigated index stored as closed");
				iNavigate = 0;
				oNavigateCondition = undefined;
				sNavigateItemId = undefined;

				// ignore group header backwards
				oFixedList.navigate(-1);
				oItem = oContent.getItems()[1];
				assert.notOk(oItem.getSelected(), "Item1 not selected");
				oItem = oContent.getItems()[2];
				assert.ok(oItem.getSelected(), "Item2 selected");
				oItem = oContent.getItems()[4];
				assert.notOk(oItem.getSelected(), "Item4 not selected");

				oCondition = Condition.createItemCondition("I3", "item 3");
				assert.equal(iNavigate, 1, "Navigated Event fired");
				assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
				assert.equal(sNavigateItemId, "FL1-item-FL1-List-1", "Navigated itemId");
				assert.notOk(bNavigateLeaveFocus, "Navigated leaveFocus");
				assert.deepEqual(oFixedList.getConditions(), [oCondition], "FixedList conditions");
				assert.equal(oFixedList._iNavigateIndex, 2, "navigated index stored as closed");
				iNavigate = 0;
				oNavigateCondition = undefined;
				sNavigateItemId = undefined;

				// ignore group header forwards
				oFixedList.navigate(1);
				oItem = oContent.getItems()[1];
				assert.notOk(oItem.getSelected(), "Item1 not selected");
				oItem = oContent.getItems()[2];
				assert.notOk(oItem.getSelected(), "Item2 not selected");
				oItem = oContent.getItems()[4];
				assert.ok(oItem.getSelected(), "Item4 selected");

				oCondition = Condition.createItemCondition("I2", "My Item   2");
				assert.equal(iNavigate, 1, "Navigated Event fired");
				assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
				assert.equal(sNavigateItemId, "FL1-item-FL1-List-2", "Navigated itemId");
				assert.notOk(bNavigateLeaveFocus, "Navigated leaveFocus");
				assert.deepEqual(oFixedList.getConditions(), [oCondition], "FixedList conditions");
				assert.equal(oFixedList._iNavigateIndex, 4, "navigated index stored as closed");
				iNavigate = 0;
				oNavigateCondition = undefined;
				sNavigateItemId = undefined;
				oContent.getItems()[4].setSelected(false); // initialize

				// find filtered item backwards
				oFixedList.navigate(-1);
				oItem = oContent.getItems()[1];
				assert.notOk(oItem.getSelected(), "Item1 not selected");
				oItem = oContent.getItems()[2];
				assert.notOk(oItem.getSelected(), "Item2 not selected");
				oItem = oContent.getItems()[4];
				assert.ok(oItem.getSelected(), "Item4 selected");

				oCondition = Condition.createItemCondition("I2", "My Item   2");
				assert.equal(iNavigate, 1, "Navigated Event fired");
				assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
				assert.equal(sNavigateItemId, "FL1-item-FL1-List-2", "Navigated itemId");
				assert.notOk(bNavigateLeaveFocus, "Navigated leaveFocus");
				assert.deepEqual(oFixedList.getConditions(), [oCondition], "FixedList conditions");
				assert.equal(oFixedList._iNavigateIndex, 4, "navigated index stored as closed");

				// ignore group header backwards
				iNavigate = 0;
				oNavigateCondition = undefined;
				sNavigateItemId = undefined;
				oContent.getItems()[4].setSelected(false); // initialize
				oContent.getItems()[2].setSelected(true); // set as selected
				oFixedList.navigate(-2);
				oItem = oContent.getItems()[1];
				assert.ok(oItem.getSelected(), "Item1 selected");
				oItem = oContent.getItems()[2];
				assert.notOk(oItem.getSelected(), "Item2 not selected");
				oItem = oContent.getItems()[4];
				assert.notOk(oItem.getSelected(), "Item4 not selected");

				oCondition = Condition.createItemCondition("I1", "Item 1");
				assert.equal(iNavigate, 1, "Navigated Event fired");
				assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
				assert.equal(sNavigateItemId, "FL1-item-FL1-List-0", "Navigated itemId");
				assert.notOk(bNavigateLeaveFocus, "Navigated leaveFocus");
				assert.deepEqual(oFixedList.getConditions(), [oCondition], "FixedList conditions");
				assert.equal(oFixedList._iNavigateIndex, 1, "navigated index stored as closed");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError);
				fnDone();
			});
		}

	});

	QUnit.test("getValueHelpIcon", function(assert) {

		assert.equal(oFixedList.getValueHelpIcon(), "sap-icon://slim-arrow-down", "icon");
		oFixedList.setUseAsValueHelp(false);
		assert.notOk(oFixedList.getValueHelpIcon(), "no icon");

	});

	QUnit.test("getAriaAttributes", function(assert) {

		var oCheckAttributes = {
			contentId: "FL1-List",
			ariaHasPopup: "listbox",
			roleDescription: null
		};
		var oAttributes = oFixedList.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("shouldOpenOnClick", function(assert) {

		assert.notOk(oFixedList.shouldOpenOnClick(), "should not open if filterList set");
		oFixedList.setFilterList(false);
		assert.ok(oFixedList.shouldOpenOnClick(), "should open if filterList not set");

	});

	QUnit.test("isFocusInHelp", function(assert) {

		assert.notOk(oFixedList.isFocusInHelp(), "Focus should stay in field");

	});

	QUnit.test("_isSingleSelect", function(assert) {

		assert.ok(oFixedList._isSingleSelect(), "only singe selection");

	});

	QUnit.test("shouldOpenOnNavigate", function(assert) {

		assert.ok(oFixedList.shouldOpenOnNavigate(), "should open if maxConditions != 1");

		var oConfig = oFixedList.getConfig();
		oConfig.maxConditions = 1;
		oFixedList.setConfig(oConfig);
		assert.notOk(oFixedList.shouldOpenOnNavigate(), "should not open if maxConditions == 1");

	});

	QUnit.test("isSearchSupported", function(assert) {

		var bSupported = oFixedList.isSearchSupported();
		assert.ok(bSupported, "Search is supported");

	});

});
