// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/content/FixedList",
	"sap/ui/mdc/valuehelp/content/FixedListItem",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/model/ParseException",
	"sap/ui/model/FormatException",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/String",
	"sap/m/library",
	"sap/m/ScrollContainer",
	"sap/ui/core/library",
	"sap/ui/core/date/UI5Date",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/base/strings/whitespaceReplacer"
], (
		ValueHelpDelegate,
		FixedList,
		FixedListItem,
		Condition,
		OperatorName,
		ValueHelpSelectionType,
		ParseException,
		FormatException,
		JSONModel,
		IntegerType,
		DateType,
		StringType,
		mLibrary,
		ScrollContainer,
		coreLibrary,
		UI5Date,
		nextUIUpdate,
		whitespaceReplacer
	) => {
	"use strict";

	let oFixedList;
	let bIsOpen = true;
	let oScrollContainer = null;

	const oContainer = { //to fake Container
		getScrollDelegate() {
			return null;
		},
		isOpen() {
			return bIsOpen;
		},
		isOpening() {
			return bIsOpen;
		},
		isTypeahead() {
			return true;
		},
		getValueHelpDelegatePayload() {
			return undefined;
		},
		invalidate() {},
		getValueHelpDelegate() {
			return ValueHelpDelegate;
		},
		getControl() {
			return undefined;
		},
		getValueHelp() {
			return {
				getDisplay() {
					return "DescriptionValue";
				}
			};
		},
		getId() {return "MyContainer";},
		getParent() {return null;}
	};

	const _teardown = () => {
		oFixedList.destroy();
		oFixedList = null;
		bIsOpen = true;
		if (oScrollContainer) {
			oScrollContainer.getContent.restore();
			oScrollContainer.destroy();
			oScrollContainer = null;
			delete oContainer.getUIAreaForContent;
		}
	};

	async function _renderScrollContainer(oList) {

		oScrollContainer = new ScrollContainer(); // to test scrolling
		sinon.stub(oScrollContainer, "getContent").returns([oList]); // to render List
		oContainer.getUIAreaForContent = () => {
			return oScrollContainer.getUIArea();
		};
		oScrollContainer.placeAt("content"); // render ScrollContainer
		await nextUIUpdate();

	}

	QUnit.module("basic features", {
		beforeEach() {
			const aConditions = [Condition.createItemCondition("I2", "My Item 2")];
			oFixedList = new FixedList("FL1", {
				items: [
					new FixedListItem("I1", {key: "I1", text: "Item 1", additionalText: "My Item 1", groupKey: "G1", groupText: "Group 1"}),
					new FixedListItem("I2", {key: "I2", text: "My Item   2", additionalText: "Item   2", groupKey: "G2", groupText: "Group 2", textDirection: coreLibrary.TextDirection.RTL}),
					new FixedListItem("I3", {key: "I3", text: "item 3", additionalText: "My Item 3", groupKey: "G1", groupText: "Group 1"})
				],
				conditions: aConditions, // don't need to test the binding of Container here
				config: { // don't need to test the binding of Container here
					maxConditions: -1,
					operators: [OperatorName.EQ]
				}
			});
			sinon.stub(oFixedList, "getParent").returns(oContainer);
			oFixedList.oParent = oContainer; // fake
		},
		afterEach: _teardown
	});

	QUnit.test("getContent", (assert) => {

		let iSelect = 0;
		let aConditions;
		let sType;
		oFixedList.attachEvent("select", (oEvent) => {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		let iConfirm = 0;
		oFixedList.attachEvent("confirm", (oEvent) => {
			iConfirm++;
		});

		const oContent = oFixedList.getContent();

		return oContent?.then((oContent) => {
			const oShowResult = oFixedList.onShow(); // to update selection and scroll
			assert.ok(oContent, "Content returned");
			assert.ok(oContent.isA("sap.m.List"), "Content is sap.m.List");
			assert.notOk(oContent.hasStyleClass("sapMListFocus"), "List has no style class sapMListFocus");
			assert.equal(oFixedList.getDisplayContent(), oContent, "sap.m.List stored in displayContent");
			assert.equal(oContent.getWidth(), "100%", "List width");
			assert.notOk(oContent.getShowNoData(), "List showNoData");
			assert.notOk(oContent.getRememberSelections(), "List rememberSelections");
			assert.equal(oContent.getMode(), mLibrary.ListMode.SingleSelectMaster, "List mode");
			assert.ok(oContent.hasStyleClass("sapMComboBoxBaseList"), "List has style class sapMComboBoxBaseList");
			assert.ok(oContent.hasStyleClass("sapMComboBoxList"), "List has style class sapMComboBoxList");
			assert.equal(oContent.getAriaRole(), "listbox", "List aria role");
			assert.equal(oContent.getItems().length, 3, "Number of items");
			let oItem = oContent.getItems()[0];
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
			assert.notOk(oItem.hasStyleClass("sapMLIBFocused"), "Item is not focused");
			assert.equal(oShowResult?.itemId, oItem.getId(), "OnShow returns selected itemId");
			assert.equal(oShowResult?.items, 3, "OnShow returns number of items");
			oItem = oContent.getItems()[2];
			assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item2 is DisplayListItem");
			assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item2 type");
			assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.Inherit, "Item2 valueTextDirection");
			assert.equal(oItem.getLabel(), "item 3", "Item2 label");
			assert.equal(oItem.getValue(), "My Item 3", "Item2 value");
			assert.notOk(oItem.getSelected(), "Item2 not selected");
			assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item2 has style class sapMComboBoxNonInteractiveItem");

			const aNewConditions = [
				Condition.createItemCondition("I3", "item 3")
			];
			oItem.setSelected(true);
			oContent.fireItemPress({listItem: oItem});
			assert.equal(iSelect, 1, "select event fired");
			assert.deepEqual(aConditions, aNewConditions, "select event conditions");
			assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
			assert.equal(iConfirm, 1, "confirm event fired");
			assert.deepEqual(oFixedList.getConditions(), aNewConditions, "FixedList conditions");

		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getContent with grouping", (assert) => {

		oFixedList.setGroupable(true);

		const oContent = oFixedList.getContent();

		return oContent?.then((oContent) => {
			oFixedList.onShow(true); // to update selection and scroll
			oFixedList.setVisualFocus(); // fake focus

			assert.ok(oContent, "Content returned");
			assert.ok(oContent.isA("sap.m.List"), "Content is sap.m.List");
			assert.ok(oContent.hasStyleClass("sapMListFocus"), "List has style class sapMListFocus");
			assert.equal(oContent.getItems().length, 5, "Number of items");
			let oItem = oContent.getItems()[0];
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
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("Filtering", (assert) => {

		let iTypeaheadSuggested = 0;
		oFixedList.attachEvent("typeaheadSuggested", (oEvent) => {
			iTypeaheadSuggested++;
		});

		oFixedList.setFilterValue("i");
		const oContent = oFixedList.getContent();

		return oContent?.then((oContent) => {
			oFixedList.onShow(); // to update selection and scroll
			assert.equal(oContent.getItems().length, 2, "Number of items");
			let oItem = oContent.getItems()[0];
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

			assert.equal(iTypeaheadSuggested, 1, "typeaheadSuggested event fired");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("Filtering without hiding", (assert) => {

		let iTypeaheadSuggested = 0;
		let oCondition;
		let sFilterValue;
		let sItemId;
		let iItems;
		let bTypeaheadCaseSensitive;
		oFixedList.attachEvent("typeaheadSuggested", (oEvent) => {
			iTypeaheadSuggested++;
			oCondition = oEvent.getParameter("condition");
			sFilterValue = oEvent.getParameter("filterValue");
			sItemId = oEvent.getParameter("itemId");
			iItems = oEvent.getParameter("items");
			bTypeaheadCaseSensitive = oEvent.getParameter("caseSensitive");
		});

		oFixedList.setUseFirstMatch(true);
		oFixedList.setFilterList(false);
		oFixedList.setConditions([]);
		oFixedList.setFilterValue("i");
		const oContent = oFixedList.getContent();

		return oContent?.then((oContent) => {
			assert.equal(oContent.getItems().length, 3, "Number of items");
			let oItem = oContent.getItems()[0];
			assert.equal(oItem.getLabel(), "Item 1", "Item0 label");
			assert.equal(oItem.getValue(), "My Item 1", "Item0 value");
			oItem = oContent.getItems()[1];
			assert.equal(oItem.getLabel(), whitespaceReplacer("My Item   2"), "Item1 label");
			assert.equal(oItem.getValue(), whitespaceReplacer("Item   2"), "Item1 value");
			oItem = oContent.getItems()[2];
			assert.equal(oItem.getLabel(), "item 3", "Item2 label");
			assert.equal(oItem.getValue(), "My Item 3", "Item2 value");

			oItem = oContent.getItems()[0];

			oFixedList.setCaseSensitive(true);
			iTypeaheadSuggested = 0;
			oFixedList.setFilterValue("M");
			assert.notOk(oItem.getSelected(), "Item0 not selected");
			oItem = oContent.getItems()[1];
			assert.equal(iTypeaheadSuggested, 1, "typeaheadSuggested event fired");
			assert.deepEqual(oCondition, Condition.createItemCondition("I2", "My Item   2"), "typeaheadSuggested event condition");
			assert.equal(sFilterValue, "M", "typeaheadSuggested event filterValue");
			assert.equal(sItemId, oItem.getId(), "typeaheadSuggested event itemId");
			assert.equal(iItems, 3, "typeaheadSuggested event items");
			assert.equal(bTypeaheadCaseSensitive, true, "typeaheadSuggested event caseSensitive");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getItemForValue - match", (assert) => {

		const oConfig = {
			parsedValue: "I2",
			parsedDescription: "I2",
			value: "I2",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: true,
			checkDescription: true,
			exception: ParseException
		};

		const oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) =>  {
			assert.ok(true, "Promise Then must be called");
			assert.deepEqual(oItem, {key: "I2", description: "My Item   2"}, "Item returned");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getItemForValue - match for description", (assert) => {

		const oConfig = {
			parsedValue: undefined,
			parsedDescription: "item 3",
			value: "ITEM 3",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: false,
			checkDescription: true,
			exception: ParseException
		};

		const oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.ok(true, "Promise Then must be called");
			assert.deepEqual(oItem, {key: "I3", description: "item 3"}, "Item returned");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getItemForValue - no value for key", (assert) => {

		const oConfig = {
			parsedValue: undefined,
			parsedDescription: undefined,
			value: undefined,
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: true,
			checkDescription: false,
			exception: ParseException
		};

		const oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.ok(true, "Promise Then must be called");
			assert.deepEqual(oItem, null, "no Item returned");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getItemForValue - empty value for key", (assert) => {

		const oConfig = {
			parsedValue: "",
			parsedDescription: undefined,
			value: "",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: true,
			checkDescription: false,
			exception: ParseException
		};

		const oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.ok(true, "Promise Then must be called");
			assert.deepEqual(oItem, null, "no Item returned");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getItemForValue - empty value for description", (assert) => {

		const oConfig = {
			parsedValue: "",
			parsedDescription: "",
			value: "",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: false,
			checkDescription: true,
			exception: ParseException
		};

		const oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.ok(true, "Promise Then must be called");
			assert.deepEqual(oItem, null, "no Item returned");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getItemForValue - useFirstMatch for key", (assert) => {

		const oConfig = {
			parsedValue: undefined,
			parsedDescription: undefined,
			value: "I",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: false, // as value might not be a valid key, jsut a part of it
			checkDescription: false,
			exception: ParseException
		};
		oFixedList.setUseFirstMatch(true);

		const oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.ok(true, "Promise Then must be called");
			assert.deepEqual(oItem, {key: "I1", description: "Item 1"}, "Item returned");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getItemForValue - useFirstMatch for description", (assert) => {

		const oConfig = {
			parsedValue: undefined,
			parsedDescription: "I",
			value: "I",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: false,
			checkDescription: true,
			exception: ParseException
		};
		oFixedList.setUseFirstMatch(true);

		const oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.ok(true, "Promise Then must be called");
			assert.deepEqual(oItem, {key: "I1", description: "Item 1"}, "Item returned");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getItemForValue - not found", (assert) => {

		const oConfig = {
			parsedValue: "I",
			parsedDescription: undefined,
			value: "I",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: true,
			checkDescription: false,
			exception: FormatException
		};
		oFixedList.setUseFirstMatch(false);

		const oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.notOk(true, "Promise Then must not be called");
		}).catch((oError) => {
			assert.ok(true, "Promise Catch called");
			assert.ok(oError instanceof FormatException, "ParseException fired");
			assert.equal(oError.message, 'Value "I" does not exist.', "Error message");
		});

	});

	QUnit.test("isValidationSupported", (assert) => {

		assert.ok(oFixedList.isValidationSupported(), "validation is supported");

	});

	let iNavigate = 0;
	let oNavigateCondition;
	let sNavigateItemId;
	let bNavigateLeaveFocus;
	let bNavigateCaseSensitive;
	let iVisualFocusSet = 0;

	function _checkNavigatedItem(assert, oContent, iNavigatedIndex, iSelectedIndex, oCondition, bLeaveFocus) {

		const aItems = oContent.getItems();
		assert.equal(oContent.hasStyleClass("sapMListFocus"), bIsOpen, "List has style class sapMListFocus");
		assert.equal(iVisualFocusSet, bIsOpen && iNavigatedIndex >= 0 && !bNavigateLeaveFocus ? 1 : 0, "visualFocusSet event fired");

		for (let i = 0; i < aItems.length; i++) {
			const oItem = aItems[i];
			if (i === iSelectedIndex) {
				assert.equal(oItem.hasStyleClass("sapMLIBFocused"), bIsOpen, "Item" + i + " is focused");
				if (!oItem.isA("sap.m.GroupHeaderListItem")) {
					assert.ok(oItem.getSelected(), "Item" + i + " is selected");
				}
			} else {
				assert.notOk(oItem.hasStyleClass("sapMLIBFocused"), "Item" + i + " not focused");
				if (!oItem.isA("sap.m.GroupHeaderListItem")) {
					assert.notOk(oItem.getSelected(), "Item" + i + " not selected");
				}
			}
		}

		assert.equal(iNavigate, 1, "Navigated Event fired");
		if (!bLeaveFocus) {
			assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
			assert.equal(sNavigateItemId, aItems[iNavigatedIndex].getId(), "Navigated itemId");
			if (oCondition) { // not set for group-items
				assert.equal(bNavigateCaseSensitive, oFixedList.getCaseSensitive(), "Navigated caseSensitive");
			}
		} else {
			assert.deepEqual(oNavigateCondition, undefined, "Navigated condition");
			assert.equal(sNavigateItemId, undefined, "Navigated itemId");
			assert.equal(bNavigateCaseSensitive, undefined, "Navigated caseSensitive");
		}
		assert.equal(bNavigateLeaveFocus, bLeaveFocus, "Navigated leaveFocus");
		assert.deepEqual(oFixedList.getConditions(), oCondition ? [oCondition] : [], "FixedList conditions");
		assert.equal(oFixedList._iNavigateIndex, iNavigatedIndex, "navigated index stored");
		iNavigate = 0;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		bNavigateLeaveFocus = undefined;
		bNavigateCaseSensitive = undefined;
		iVisualFocusSet = 0;
	}

	QUnit.test("navigate", (assert) => {

		iNavigate = 0;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		bNavigateLeaveFocus = undefined;
		bNavigateCaseSensitive = undefined;
		oFixedList.attachEvent("navigated", (oEvent) => {
			iNavigate++;
			oNavigateCondition = oEvent.getParameter("condition");
			sNavigateItemId = oEvent.getParameter("itemId");
			bNavigateLeaveFocus = oEvent.getParameter("leaveFocus");
			bNavigateCaseSensitive = oEvent.getParameter("caseSensitive");
		});
		iVisualFocusSet = 0;
		oFixedList.attachEvent("visualFocusSet", (oEvent) => {
			iVisualFocusSet++;
		});

		oFixedList.setCaseSensitive(true);
		oFixedList.setConditions([]);
		const aItems = oFixedList.getItems();
		aItems[1].setText("Item 2"); // to test filtering
		const oContent = oFixedList.getContent(); // as content needs to be crated before navigation is possible

		return oContent?.then(async (oContent) => {
			await _renderScrollContainer(oContent);
			// oFixedList.onShow(); // to update selection and scroll
			oFixedList.navigate(1);
			_checkNavigatedItem(assert, oContent, 0, 0, Condition.createItemCondition("I1", "Item 1"), false);

			// no previout item
			oFixedList.navigate(-1);
			_checkNavigatedItem(assert, oContent, 0, 0, Condition.createItemCondition("I1", "Item 1"), true);

			// next item of selected one
			oFixedList.navigate(1);
			_checkNavigatedItem(assert, oContent, 1, 1, Condition.createItemCondition("I2", "Item 2"), false);
			oContent.getItems()[1].setSelected(false); // initialize
			oFixedList.onConnectionChange(); // simulate new assignment

			// no item selected -> navigate to last
			oFixedList.navigate(-1);
			_checkNavigatedItem(assert, oContent, 2, 2, Condition.createItemCondition("I3", "item 3"), false);

			oFixedList.navigate(-9999);
			_checkNavigatedItem(assert, oContent, 0, 0, Condition.createItemCondition("I1", "Item 1"), false);

			oFixedList.navigate(9999);
			_checkNavigatedItem(assert, oContent, 2, 2, Condition.createItemCondition("I3", "item 3"), false);

			// Filtering initializes navigation
			oFixedList.setFilterValue("I");
			oFixedList.navigate(2);
			_checkNavigatedItem(assert, oContent, 1, 1, Condition.createItemCondition("I2", "Item 2"), false);

			oFixedList.onHide();
			assert.notOk(oContent.hasStyleClass("sapMListFocus"), "List removed style class sapMListFocus");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("navigate - without filtering but groupable (closed list)", (assert) => {

		iNavigate = 0;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		bNavigateLeaveFocus = undefined;
		bNavigateCaseSensitive = undefined;
		oFixedList.attachEvent("navigated", (oEvent) => {
			iNavigate++;
			oNavigateCondition = oEvent.getParameter("condition");
			sNavigateItemId = oEvent.getParameter("itemId");
			bNavigateLeaveFocus = oEvent.getParameter("leaveFocus");
			bNavigateCaseSensitive = oEvent.getParameter("caseSensitive");
		});
		iVisualFocusSet = 0;
		oFixedList.attachEvent("visualFocusSet", (oEvent) => {
			iVisualFocusSet++;
		});

		oFixedList.setGroupable(true);
		oFixedList.setConditions([]);
		oFixedList.setFilterList(false);
		oFixedList.setFilterValue("M");
		bIsOpen = false;
		const oContent = oFixedList.getContent(); // as content needs to be crated before navigation is possible

		return oContent?.then((oContent) => {
			oFixedList.navigate(1);
			_checkNavigatedItem(assert, oContent, 4, 4, Condition.createItemCondition("I2", "My Item   2"), false);
			iNavigate = 0;
			oNavigateCondition = undefined;
			sNavigateItemId = undefined;

			// ignore group header backwards
			oFixedList.navigate(-1);
			_checkNavigatedItem(assert, oContent, 2, 2, Condition.createItemCondition("I3", "item 3"), false);

			// ignore group header forwards
			oFixedList.navigate(1);
			_checkNavigatedItem(assert, oContent, 4, 4, Condition.createItemCondition("I2", "My Item   2"), false);
			oContent.getItems()[4].setSelected(false); // initialize
			oFixedList.onConnectionChange(); // simulate new assignment

			// find filtered item backwards
			oFixedList.navigate(-1);
			_checkNavigatedItem(assert, oContent, 4, 4, Condition.createItemCondition("I2", "My Item   2"), false);

			// ignore group header backwards
			oContent.getItems()[4].setSelected(false); // initialize
			oContent.getItems()[2].setSelected(true); // set as selected
			oFixedList.onConnectionChange(); // simulate new assignment
			oFixedList.navigate(-2);
			_checkNavigatedItem(assert, oContent, 1, 1, Condition.createItemCondition("I1", "Item 1"), false);

		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("navigate - without filtering but groupable (open list)", (assert) => {

		iNavigate = 0;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		bNavigateLeaveFocus = undefined;
		bNavigateCaseSensitive = undefined;
		oFixedList.attachEvent("navigated", (oEvent) => {
			iNavigate++;
			oNavigateCondition = oEvent.getParameter("condition");
			sNavigateItemId = oEvent.getParameter("itemId");
			bNavigateLeaveFocus = oEvent.getParameter("leaveFocus");
			bNavigateCaseSensitive = oEvent.getParameter("caseSensitive");
		});
		iVisualFocusSet = 0;
		oFixedList.attachEvent("visualFocusSet", (oEvent) => {
			iVisualFocusSet++;
		});

		oFixedList.setGroupable(true);
		oFixedList.setConditions([]);
		oFixedList.setFilterList(false);
		oFixedList.setFilterValue("M");
		bIsOpen = true;
		const oContent = oFixedList.getContent(); // as content needs to be crated before navigation is possible

		return oContent?.then(async (oContent) => {
			await _renderScrollContainer(oContent);
			oFixedList.navigate(1);
			_checkNavigatedItem(assert, oContent, 4, 4, Condition.createItemCondition("I2", "My Item   2"), false);

			// select group header backwards
			oFixedList.navigate(-1);
			_checkNavigatedItem(assert, oContent, 3, 3, undefined, false);

			// navigate from group header to previous item
			oFixedList.navigate(-1);
			_checkNavigatedItem(assert, oContent, 2, 2, Condition.createItemCondition("I3", "item 3"), false);

			// select group header forwards
			oFixedList.navigate(1);
			_checkNavigatedItem(assert, oContent, 3, 3, undefined, false);

			// navigate from gropu header to next item
			oFixedList.navigate(1);
			_checkNavigatedItem(assert, oContent, 4, 4, Condition.createItemCondition("I2", "My Item   2"), false);
			oContent.getItems()[4].setSelected(false); // initialize
			oFixedList.onConnectionChange(); // simulate new assignment

			// find filtered item backwards
			oFixedList.navigate(-1);
			_checkNavigatedItem(assert, oContent, 4, 4, Condition.createItemCondition("I2", "My Item   2"), false);

			// do not ignore group header backwards
			oContent.getItems()[4].setSelected(false); // initialize
			oContent.getItems()[2].setSelected(true); // set as selected
			oFixedList.onConnectionChange(); // simulate new assignment
			oFixedList.navigate(-3);
			_checkNavigatedItem(assert, oContent, 0, 0, undefined, false);

		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getValueHelpIcon", (assert) => {

		assert.equal(oFixedList.getValueHelpIcon(), "sap-icon://slim-arrow-down", "icon");
		oFixedList.setUseAsValueHelp(false);
		assert.notOk(oFixedList.getValueHelpIcon(), "no icon");

	});

	QUnit.test("getAriaAttributes", (assert) => {

		const oCheckAttributes = {
			contentId: "FL1-List",
			ariaHasPopup: "listbox",
			roleDescription: null,
			valueHelpEnabled: false,
			autocomplete: "both"
		};
		let oAttributes = oFixedList.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

		oFixedList.setUseFirstMatch(false);
		oCheckAttributes.autocomplete = "none";
		oAttributes = oFixedList.getAriaAttributes();
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("shouldOpenOnClick", (assert) => {

		assert.notOk(oFixedList.shouldOpenOnClick(), "should not open if filterList set");
		oFixedList.setFilterList(false);
		assert.ok(oFixedList.shouldOpenOnClick(), "should open if filterList not set");

	});

	QUnit.test("isFocusInHelp", (assert) => {

		assert.notOk(oFixedList.isFocusInHelp(), "Focus should stay in field");

	});

	QUnit.test("isSingleSelect", (assert) => {

		assert.ok(oFixedList.isSingleSelect(), "only singe selection");

	});

	QUnit.test("shouldOpenOnNavigate", (assert) => {

		assert.ok(oFixedList.shouldOpenOnNavigate(), "should open if maxConditions != 1");

		const oConfig = oFixedList.getConfig();
		oConfig.maxConditions = 1;
		oFixedList.setConfig(oConfig);
		assert.notOk(oFixedList.shouldOpenOnNavigate(), "should not open if maxConditions == 1");

	});

	QUnit.test("isNavigationEnabled", (assert) => {

		assert.ok(oFixedList.isNavigationEnabled(1), "Navigation is enabled");

	});

	QUnit.test("isSearchSupported", (assert) => {

		const bSupported = oFixedList.isSearchSupported();
		assert.ok(bSupported, "Search is supported");

	});

	QUnit.test("setHighlightId", async (assert) => {
		oFixedList.setConditions([]);
		const oContent = await oFixedList.getContent();
		const aItems = oContent.getItems();

		await _renderScrollContainer(oContent);

		oFixedList.setHighlightId(aItems[0].getId());
		assert.notOk(aItems[0].hasStyleClass("sapMLIBFocused"), "setHighlightId not added class sapMLIBFocused");

		oFixedList.setHighlightId(aItems[1].getId());
		assert.notOk(aItems[0].hasStyleClass("sapMLIBFocused"), "setHighlightId not added class sapMLIBFocused");
		assert.notOk(aItems[1].hasStyleClass("sapMLIBFocused"), "setHighlightId not added class sapMLIBFocused");

		oFixedList.navigate(0);
		assert.ok(aItems[1].hasStyleClass("sapMLIBFocused"), "navigation added class sapMLIBFocused");

		oFixedList.setHighlightId();
	});

	QUnit.test("destroyItems", (assert) => {

		const oContent = oFixedList.getContent();

		return oContent?.then((oContent) => {
			assert.equal(oContent.getItems().length, 3, "Number of items");

			oFixedList.destroyItems();
			assert.equal(oFixedList.getItems().length, 0, "Number of  outer items");
			assert.equal(oContent.getItems().length, 0, "Number of inner items (immideately destroyed)");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	let oModel;
	QUnit.module("Using Binding", {
		beforeEach() {
			oModel = new JSONModel({
				conditions: [Condition.createItemCondition(2, UI5Date.getInstance(2024, 11, 13))],
				items: [
					{key: 1, date: UI5Date.getInstance(2023, 11, 13), description: "last year"},
					{key: 2, date: UI5Date.getInstance(2024, 11, 13), description: "today"},
					{key: 3, date: UI5Date.getInstance(2025, 11, 13), description: "next year"}
				],
				config: {
					maxConditions: -1,
					operators: [OperatorName.EQ]
				}
			});

			const oIntegerType = new IntegerType();
			const oDateType = new DateType({pattern: "yyyy-MM-dd"});
			const oStringType = new StringType();
			const oFixedListItem = new FixedListItem("MyTemplate", {
				key: {path: "key", type: oIntegerType},
				text: {path: "date", type: oDateType},
				additionalText: {path: "description", type: oStringType}
			});

			oFixedList = new FixedList("FL1", {
				items: {path: "/items", template: oFixedListItem},
				conditions: {path: "/conditions"},
				config: {path: "/config"},
				models: oModel
			});
			sinon.stub(oFixedList, "getParent").returns(oContainer);
			oFixedList.oParent = oContainer; // fake
		},
		afterEach() {
			_teardown();
			oModel.destroy();
			oModel = undefined;
		}
	});

	QUnit.test("getContent", (assert) => {

		let iSelect = 0;
		let aConditions;
		let sType;
		oFixedList.attachEvent("select", (oEvent) => {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});

		const oContent = oFixedList.getContent();

		return oContent?.then((oContent) => {
			const oShowResult = oFixedList.onShow(); // to update selection and scroll
			assert.ok(oContent, "Content returned");
			assert.ok(oContent.isA("sap.m.List"), "Content is sap.m.List");
			assert.equal(oContent.getItems().length, 3, "Number of items");
			let oItem = oContent.getItems()[0];
			assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item0 is DisplayListItem");
			assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item0 type");
			assert.equal(oItem.getLabel(), "2023-12-13", "Item0 label");
			assert.equal(oItem.getValue(), "last year", "Item0 value");
			assert.notOk(oItem.getSelected(), "Item0 not selected");
			oItem = oContent.getItems()[1];
			assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item1 is DisplayListItem");
			assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item1 type");
			assert.equal(oItem.getLabel(), "2024-12-13", "Item1 label");
			assert.equal(oItem.getValue(), "today", "Item1 value");
			assert.ok(oItem.getSelected(), "Item1 selected");
			assert.notOk(oItem.hasStyleClass("sapMLIBFocused"), "Item is not focused");
			assert.equal(oShowResult?.itemId, oItem.getId(), "OnShow returns selected itemId");
			assert.equal(oShowResult?.items, 3, "OnShow returns number of items");
			oItem = oContent.getItems()[2];
			assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item2 is DisplayListItem");
			assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item2 type");
			assert.equal(oItem.getLabel(), "2025-12-13", "Item2 label");
			assert.equal(oItem.getValue(), "next year", "Item2 value");
			assert.notOk(oItem.getSelected(), "Item2 not selected");

			const aNewConditions = [
				Condition.createItemCondition(3, UI5Date.getInstance(2025, 11, 13))
			];
			oItem.setSelected(true);
			oContent.fireItemPress({listItem: oItem});
			assert.equal(iSelect, 1, "select event fired");
			assert.deepEqual(aConditions, aNewConditions, "select event conditions");
			assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
			assert.deepEqual(oFixedList.getConditions(), aNewConditions, "FixedList conditions");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("Filtering", (assert) => {

		oFixedList.setFilterValue("2024");
		const oContent = oFixedList.getContent();

		return oContent?.then((oContent) => {
			oFixedList.onShow(); // to update selection and scroll
			assert.equal(oContent.getItems().length, 1, "Number of items");
			const oItem = oContent.getItems()[0];
			assert.equal(oItem.getLabel(), "2024-12-13", "Item0 label");
			assert.equal(oItem.getValue(), "today", "Item0 value");

		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("getItemForValue", (assert) => {

		const oConfig = {
			parsedValue: 2,
			parsedDescription: UI5Date.getInstance(2025, 11, 13),
			value: "2024-12-13",
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: true,
			checkDescription: true,
			exception: ParseException
		};

		const oPromise = oFixedList.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.ok(true, "Promise Then must be called");
			assert.deepEqual(oItem, {key: 2, description: UI5Date.getInstance(2024, 11, 13)}, "Item returned");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

	QUnit.test("navigate", (assert) => {

		iNavigate = 0;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		bNavigateLeaveFocus = undefined;
		bNavigateCaseSensitive = undefined;
		oFixedList.attachEvent("navigated", (oEvent) => {
			iNavigate++;
			oNavigateCondition = oEvent.getParameter("condition");
			sNavigateItemId = oEvent.getParameter("itemId");
			bNavigateLeaveFocus = oEvent.getParameter("leaveFocus");
			bNavigateCaseSensitive = oEvent.getParameter("caseSensitive");
		});
		iVisualFocusSet = 0;
		oFixedList.attachEvent("visualFocusSet", (oEvent) => {
			iVisualFocusSet++;
		});

		oFixedList.setCaseSensitive(true);
		const oContent = oFixedList.getContent(); // as content needs to be crated before navigation is possible

		return oContent?.then(async (oContent) => {
			await _renderScrollContainer(oContent);
			oFixedList.navigate(1);
			_checkNavigatedItem(assert, oContent, 2, 2, Condition.createItemCondition(3, UI5Date.getInstance(2025, 11, 13)), false);
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError);
		});

	});

});
