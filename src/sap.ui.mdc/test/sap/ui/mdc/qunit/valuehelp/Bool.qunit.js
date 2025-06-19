// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/content/Bool",
	"sap/ui/mdc/valuehelp/content/FixedListItem",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/model/ParseException",
	"sap/ui/model/FormatException",
	"sap/ui/model/odata/type/Boolean", // use odata type because of language dependent text
	"sap/m/library",
	"sap/m/ScrollContainer",
	"sap/ui/core/library",
	"sap/ui/core/Lib",
	"sap/ui/test/utils/nextUIUpdate"
], (
		ValueHelpDelegate,
		Bool,
		FixedListItem,
		Condition,
		OperatorName,
		ValueHelpSelectionType,
		ParseException,
		FormatException,
		BooleanType,
		mLibrary,
		ScrollContainer,
		coreLibrary,
		Library,
		nextUIUpdate
	) => {
	"use strict";

	let oBool;
	let oType;
	let bIsOpen = true;
	let oScrollContainer = null;
	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

	const oContainer = { //to fake Container
		getScrollDelegate() {
			return oScrollContainer;
		},
		isOpen() {
			return !!oScrollContainer?.getDomRef() && bIsOpen; // only open if rendered
		},
		invalidate() {},
		getValueHelpDelegate() {}
	};

	const _teardown = () => {
		oBool.destroy();
		oBool = null;
		oType.destroy();
		oType = undefined;
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
			const aConditions = [Condition.createItemCondition(true, "True")];
			oType = new BooleanType();
			oBool = new Bool("B1", {
				conditions: aConditions, // don't need to test the binding of Container here
				config: { // don't need to test the binding of Container here
					maxConditions: 1,
					operators: [OperatorName.EQ],
					dataType: oType,
					emptyAllowed: false
				}
			});
			sinon.stub(oBool, "getParent").returns(oContainer);
			oBool.oParent = oContainer; // fake
		},
		afterEach: _teardown
	});

	QUnit.test("configuration", (assert) => {

		assert.ok(oBool.getUseFirstMatch(), "useFirstMatch active");
		assert.ok(oBool.getUseAsValueHelp(), "useAsValueHelp active");
		assert.notOk(oBool.getFilterList(), "filterList not active");
		assert.notOk(oBool.getCaseSensitive(), "caseSensitive not active");

	});

	QUnit.test("getContent", (assert) => {

		let iSelect = 0;
		let aConditions;
		let sType;
		oBool.attachEvent("select", (oEvent) => {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		let iConfirm = 0;
		oBool.attachEvent("confirm", (oEvent) => {
			iConfirm++;
		});

		const oContent = oBool.getContent();

		return oContent?.then(async (oContent) => {
			await _renderScrollContainer(oContent);
			await oBool.onShow(); // to update selection and scroll
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
			let oItem = oBool.getItems()[0];
			assert.ok(oItem.isA("sap.ui.mdc.valuehelp.content.FixedListItem"), "Item0 is FixedListItem");
			assert.equal(oItem.getKey(), oType.formatValue(true, "string"), "Item0 key"); // as formatted key needs to be used - in FixedList later internalValue of Binding is used
			assert.equal(oItem.getText(), oType.formatValue(true, "string"), "Item0 text"); // as text of type is language dependednt
			oItem = oBool.getItems()[1];
			assert.ok(oItem.isA("sap.ui.mdc.valuehelp.content.FixedListItem"), "Item1 is FixedListItem");
			assert.equal(oItem.getKey(), oType.formatValue(false, "string"), "Item0 key"); // as formatted key needs to be used - in FixedList later internalValue of Binding is used
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

			const aNewConditions = [
				Condition.createItemCondition(false, oType.formatValue(false, "string"))
			];
			oItem.setSelected(true);
			oContent.fireItemPress({listItem: oItem});
			assert.equal(iSelect, 1, "select event fired");
			assert.deepEqual(aConditions, aNewConditions, "select event conditions");
			assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
			assert.equal(iConfirm, 1, "confirm event fired");
			assert.deepEqual(oBool.getConditions(), aNewConditions, "FixedList conditions");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError.message || oError);
		});

	});

	QUnit.test("getContent - empty allowed", (assert) => {

		let iSelect = 0;
		let aConditions;
		let sType;
		oBool.attachEvent("select", (oEvent) => {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		let iConfirm = 0;
		oBool.attachEvent("confirm", (oEvent) => {
			iConfirm++;
		});
		oBool.setConfig({ // don't need to test the binding of Container here
			maxConditions: 1,
			operators: [OperatorName.EQ],
			dataType: oType,
			emptyAllowed: true
		});

		const oContent = oBool.getContent();

		return oContent?.then(async (oContent) => {
			await _renderScrollContainer(oContent);
			await oBool.onShow(); // to update selection and scroll
			// internal items
			assert.equal(oBool.getEmptyText(), oResourceBundle.getText("valuehelp.NOT_SELECTED"), "EmptyText set");
			assert.equal(oBool.getItems().length, 2, "Number of items");
			let oItem = oBool.getItems()[0];
			assert.ok(oItem.isA("sap.ui.mdc.valuehelp.content.FixedListItem"), "Item0 is FixedListItem");
			assert.equal(oItem.getKey(), oType.formatValue(true, "string"), "Item0 key"); // as formatted key needs to be used - in FixedList later internalValue of Binding is used
			assert.deepEqual(oItem.getBinding("key").getInternalValue(), true, "Item0 bound key");
			assert.equal(oItem.getText(), oType.formatValue(true, "string"), "Item0 text"); // as text of type is language dependent
			oItem = oBool.getItems()[1];
			assert.ok(oItem.isA("sap.ui.mdc.valuehelp.content.FixedListItem"), "Item1 is FixedListItem");
			assert.equal(oItem.getKey(), oType.formatValue(false, "string"), "Item1 key"); // as formatted key needs to be used - in FixedList later internalValue of Binding is used
			assert.deepEqual(oItem.getBinding("key").getInternalValue(), false, "Item1 bound key");
			assert.equal(oItem.getText(), oType.formatValue(false, "string"), "Item1 text"); // as text of type is language dependent

			// rendered items
			assert.equal(oContent.getItems().length, 3, "Number of items");
			oItem = oContent.getItems()[0];
			assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item0 is DisplayListItem");
			assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item0 type");
			assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.Inherit, "Item0 valueTextDirection");
			assert.equal(oItem.getLabel(), oResourceBundle.getText("valuehelp.NOT_SELECTED"), "Item0 label");
			assert.equal(oItem.getValue(), "", "Item0 value");
			assert.notOk(oItem.getSelected(), "Item0 selected");
			assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item0 has style class sapMComboBoxNonInteractiveItem");
			oItem = oContent.getItems()[1];
			assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item1 is DisplayListItem");
			assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item1 type");
			assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.Inherit, "Item1 valueTextDirection");
			assert.equal(oItem.getLabel(), oType.formatValue(true, "string"), "Item1 label");
			assert.equal(oItem.getValue(), "", "Item1 value");
			assert.ok(oItem.getSelected(), "Item1 selected");
			assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item1 has style class sapMComboBoxNonInteractiveItem");
			oItem = oContent.getItems()[2];
			assert.ok(oItem.isA("sap.m.DisplayListItem"), "Item2 is DisplayListItem");
			assert.equal(oItem.getType(), mLibrary.ListType.Active, "Item2 type");
			assert.equal(oItem.getValueTextDirection(), coreLibrary.TextDirection.Inherit, "Item2 valueTextDirection");
			assert.equal(oItem.getLabel(), oType.formatValue(false, "string"), "Item2 label");
			assert.equal(oItem.getValue(), "", "Item2 value");
			assert.notOk(oItem.getSelected(), "Item2 not selected");
			assert.ok(oItem.hasStyleClass("sapMComboBoxNonInteractiveItem"), "Item2 has style class sapMComboBoxNonInteractiveItem");

			oItem = oContent.getItems()[0];
			oItem.setSelected(true);
			oContent.fireItemPress({listItem: oItem});
			assert.equal(iSelect, 1, "select event fired");
			assert.deepEqual(aConditions, [], "select event conditions");
			assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
			assert.equal(iConfirm, 1, "confirm event fired");
			assert.deepEqual(oBool.getConditions(), [], "FixedList conditions");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called: " + oError.message || oError);
		});

	});

	QUnit.test("getValueHelpIcon", (assert) => {

		assert.equal(oBool.getValueHelpIcon(), "sap-icon://slim-arrow-down", "icon");

	});

	function _checkForKey(assert, bKey, bExpectException, bEmptyAllowed) {

		const oConfig = {
			parsedValue: bKey,
			value: bKey,
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: true,
			checkDescription: false,
			exception: ParseException,
			emptyAllowed: !!bEmptyAllowed
		};

		const oPromise = oBool.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.ok(!bExpectException, "Promise Then called");
			const sDescription = bKey === null && bEmptyAllowed ? oResourceBundle.getText("valuehelp.NOT_SELECTED") : oType.formatValue(bKey, "string");
			assert.deepEqual(oItem, {key: bKey, description: sDescription}, "Item returned");
		}).catch((oError) => {
			assert.ok(bExpectException, "Promise Catch called: " + oError.message || oError);
		});
	}

	QUnit.test("getItemForValue - key: true", (assert) => {

		return _checkForKey(assert, true, false);

	});

	QUnit.test("getItemForValue - key: false", (assert) => {

		return _checkForKey(assert, false, false);

	});

	QUnit.test("getItemForValue - key: undefined", (assert) => {

		return _checkForKey(assert, undefined, true);

	});

	QUnit.test("getItemForValue - key: null (Empty allowed)", (assert) => {

		return _checkForKey(assert, null, false, true);

	});

	QUnit.test("getItemForValue - key: null (Empty not allowed)", (assert) => {

		return _checkForKey(assert, null, false, true);

	});

	QUnit.test("getItemForValue - key: missing type", (assert) => {

		const oConfig = oBool.getConfig();
		delete oConfig.dataType;
		return _checkForKey(assert, true, true);

	});

	function _checkForDescription(assert, bKey, bExpectException) {

		let sDescription;

		if (bKey !== true && bKey !== false) {
			sDescription = bKey;
		} else {
			sDescription = oType.formatValue(bKey, "string").slice(0, 2); // just use first 2 characters
		}

		const oConfig = {
			parsedValue: undefined,
			value: sDescription,
			inParameters: undefined,
			outParameters: undefined,
			bindingContext: undefined,
			checkKey: false,
			checkDescription: true,
			exception: ParseException
		};

		const oPromise = oBool.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.ok(!bExpectException, "Promise Then called");
			assert.deepEqual(oItem, {key: bKey, description: oType.formatValue(bKey, "string")}, "Item returned");
		}).catch((oError) => {
			assert.ok(bExpectException, "Promise Catch called: " + oError.message || oError);
		});
	}

	QUnit.test("getItemForValue - description: true", (assert) => {

		return _checkForDescription(assert, true, false);

	});

	QUnit.test("getItemForValue - description: false", (assert) => {

		return _checkForDescription(assert, false, false);

	});

	QUnit.test("getItemForValue - description: invalid", (assert) => {

		return _checkForDescription(assert, "XXX", true);

	});

	/**
	 * @deprecated As of version 1.137
	 */
	QUnit.test("shouldOpenOnClick", (assert) => {

		assert.ok(oBool.shouldOpenOnClick(), "should open on click");

	});

	QUnit.test("isNavigationEnabled", (assert) => {

		assert.ok(oBool.isNavigationEnabled(), "navigation is enabled");

	});

	QUnit.test("isRestrictedToFixedValues", (assert) => {

		assert.ok(oBool.isRestrictedToFixedValues(), "Result");

	});

});
