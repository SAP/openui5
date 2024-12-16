// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit,sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/base/FilterableListContent",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/valuehelp/FilterBar",
	"sap/ui/mdc/valuehelp/FilterBarDelegate",
	"sap/ui/mdc/valuehelp/CollectiveSearchSelect",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/json/JSONListBinding",
	"sap/m/p13n/Engine",
	'sap/ui/mdc/p13n/StateUtil',
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment"
], (
		Library,
		ValueHelpDelegate,
		FilterableListContent,
		Condition,
		FilterBar,
		FilterBarDelegate,
		CollectiveSearchSelect,
		ConditionValidated,
		OperatorName,
		JSONModel,
		JSONListBinding,
		Engine,
		StateUtil,
		createAppEnvironment
	) => {
	"use strict";

	let oContent;
	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

	const _init = () => {
		oContent = new FilterableListContent("FLC1");
		sinon.stub(oContent, "getValueHelpDelegate").returns(ValueHelpDelegate);
		sinon.stub(oContent, "isValueHelpDelegateInitialized").returns(true);
		oContent.getListBinding = () => null; // fake implementation
	};

	const _teardown = () => {
		oContent.destroy();
		oContent = null;
	};

	QUnit.module("basic features", {
		beforeEach: _init,
		afterEach: _teardown
	});

	QUnit.test("handleFilterValueUpdate", (assert) => {
		sinon.spy(oContent, "applyFilters");
		sinon.spy(ValueHelpDelegate, "showTypeahead");
		sinon.stub(oContent, "isContainerOpen").returns(true);
		sinon.stub(oContent, "isTypeahead").returns(true);
		oContent._bContentBound = true;

		oContent.setFilterValue("X");
		assert.ok(oContent.applyFilters.calledOnce, "applyFilters called");

		const fnDone = assert.async();
		setTimeout(() => { // as Promise inside
			assert.ok(ValueHelpDelegate.showTypeahead.calledOnce, "ValueHelpDelegate.showTypeahead called");
			ValueHelpDelegate.showTypeahead.restore();
			fnDone();
		}, 0);
	});

	QUnit.test("_createDefaultFilterBar", (assert) => {
		sinon.stub(ValueHelpDelegate, "isSearchSupported").returns(false);

		return oContent._createDefaultFilterBar().then((oFilterBar) => {
			assert.ok(oFilterBar, "FilterBar is created");
			assert.equal(oFilterBar, oContent.getAggregation("_defaultFilterBar"), "FilerBar is set as defaultFilterBar");
			assert.notOk(oFilterBar.getBasicSearchField(), "No SearchField created and assigned");
			ValueHelpDelegate.isSearchSupported.restore();
		});
	});

	QUnit.test("getActiveFilterBar", (assert) => {
		sinon.stub(ValueHelpDelegate, "isSearchSupported").returns(true);

		return oContent._createDefaultFilterBar().then(() => {
			let oFilterBar = oContent.getActiveFilterBar();
			assert.equal(oFilterBar, oContent.getAggregation("_defaultFilterBar"), "returns defaultFilterBar if none is set");
			assert.ok(oFilterBar.getBasicSearchField(), "SearchField created and assigned");
			const oMyFilterBar = new FilterBar("MyFilterBar");
			oContent.setFilterBar(oMyFilterBar);
			oFilterBar = oContent.getActiveFilterBar();
			assert.equal(oFilterBar, oMyFilterBar, "returns dedicated filterbar, if available");
			assert.ok(oFilterBar.getBasicSearchField(), "SearchField created and assigned");

			// remove
			oContent.setFilterBar();
			oFilterBar.destroy();
			oFilterBar = oContent.getActiveFilterBar();
			assert.equal(oFilterBar, oContent.getAggregation("_defaultFilterBar"), "returns defaultFilterBar if none is set");
			assert.ok(oFilterBar.getBasicSearchField(), "SearchField created and assigned");
			ValueHelpDelegate.isSearchSupported.restore();
		});
	});

	/**
	 *  @deprecated since 1.120.2
	 */
	QUnit.test("getActiveFilterBar and filterFields", (assert) => {
		oContent.setFilterFields("$search");
		const oMyFilterBar = new FilterBar("MyFilterBar");
		oContent.setFilterBar(oMyFilterBar);

		let oFilterBar = oContent.getActiveFilterBar();
		assert.equal(oFilterBar, oMyFilterBar, "returns dedicated filterbar, if available");
		assert.ok(oFilterBar.getBasicSearchField(), "SearchField created and assigned");

		oContent.setFilterFields();
		assert.notOk(oFilterBar.getBasicSearchField(), "No SearchField created and assigned");

		// remove
		oFilterBar.destroy();
		oFilterBar = oContent.getActiveFilterBar();
		assert.equal(oFilterBar, oContent.getAggregation("_defaultFilterBar"), "returns defaultFilterBar if none is set");
		assert.notOk(oFilterBar.getBasicSearchField(), "No SearchField created and assigned");
	});

	QUnit.test("onContainerClose", (assert) => {
		let sLocalFilter = "X";
		const oContainer = {
			setLocalFilterValue(sValue) {
				sLocalFilter = sValue;
			}
		};
		sinon.stub(oContent, "getParent").returns(oContainer);
		oContent.onContainerClose();
		assert.notOk(sLocalFilter, "LocalFilter cleared");
	});

	QUnit.test("getFormattedTokenizerTitle", (assert) => {

		assert.equal(oContent.getFormattedTokenizerTitle(0), oResourceBundle.getText("valuehelp.SELECTFROMLIST.TokenizerTitleNoCount"), "formatted TokenizerTitle");
		assert.equal(oContent.getFormattedTokenizerTitle(1), oResourceBundle.getText("valuehelp.SELECTFROMLIST.TokenizerTitle", [1]), "formatted TokenizerTitle");

		oContent.setTokenizerTitle("myTitleText");
		assert.equal(oContent.getFormattedTokenizerTitle(0), "myTitleText", "formatted TokenizerTitle");
		assert.equal(oContent.getFormattedTokenizerTitle(1), "myTitleText", "formatted TokenizerTitle");

	});

	QUnit.test("getFormattedTitle", (assert) => {
		assert.equal(oContent.getFormattedTitle(0), oResourceBundle.getText("valuehelp.SELECTFROMLISTNONUMBER"), "formatted Title");
		assert.equal(oContent.getFormattedTitle(1), oResourceBundle.getText("valuehelp.SELECTFROMLIST", [1]), "formatted Title");

		oContent.setTitle("myTitleText ({0})");
		assert.equal(oContent.getFormattedTitle(0), "myTitleText ()", "formatted Title");
		assert.equal(oContent.getFormattedTitle(1), "myTitleText (1)", "formatted Title");
	});

	QUnit.test("getFormattedShortTitle", (assert) => {
		assert.equal(oContent.getFormattedShortTitle(), oResourceBundle.getText("valuehelp.SELECTFROMLIST.Shorttitle"), "formatted Title");

		oContent.setShortTitle("myTitleText");
		assert.equal(oContent.getFormattedShortTitle(), "myTitleText", "formatted Title");
	});

	QUnit.test("_getListItemBindingContext", (assert) => {

		const sModelName = "MyModel";

		sinon.stub(oContent, "getListBindingInfo").callsFake(() => {
			return {
				model: sModelName
			};
		});

		const oItem = {getBindingContext() {}};
		sinon.spy(oItem, "getBindingContext");

		oContent._getListItemBindingContext(oItem);

		assert.ok(oItem.getBindingContext.called, "getBindingContext was called");
		assert.ok(oContent.getListBindingInfo.called, "getListBindingInfo was called");
		assert.equal(oItem.getBindingContext.lastCall.args[0], sModelName, "modelname was considered");

	});

	QUnit.test("onBeforeShow", (assert) => {

		let sLocalFilter;
		const oContainer = {
			setLocalFilterValue(sValue) {
				sLocalFilter = sValue;
			},
			getLocalFilterValue() {
				return sLocalFilter;
			},
			isOpening() {
				return false;
			},
			isOpen() {
				return false;
			}
		};
		sinon.stub(oContent, "getParent").returns(oContainer);
		oContent.setFilterValue("I");
		const oConditions = {test: [Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.NotValidated)]};
		sinon.stub(ValueHelpDelegate, "getFilterConditions").returns(oConditions);
		sinon.stub(StateUtil, "applyExternalState").returns(); // prevent Flex logic, just test as BlackBox
		return oContent._createDefaultFilterBar().then(() => {
			const oFilterBar = oContent.getActiveFilterBar();
			sinon.spy(oFilterBar, "cleanUpAllFilterFieldsInErrorState");
			sinon.stub(oFilterBar, "getSearch").returns("i");
			sinon.stub(FilterBarDelegate, "fetchProperties").returns(
				Promise.resolve([{
						name: "$search",
						label: "Search",
						dataType: "sap.ui.model.type.String"
					},
					{
						name: "test",
						label: "Test",
						dataType: "sap.ui.model.type.String"
					}
				])
			);

			sinon.spy(oContent, "applyFilters");

			return oContent.onBeforeShow(true).then(() => {
				const oTestConditions = {
					test: [Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.NotValidated)],
					$search: [Condition.createCondition(OperatorName.Contains, ["I"], undefined, undefined, ConditionValidated.NotValidated)]
				};
				assert.ok(oFilterBar.cleanUpAllFilterFieldsInErrorState.called, "FilterBar.cleanUpAllFilterFieldsInErrorState called");
				assert.ok(StateUtil.applyExternalState.calledWith(oFilterBar, {filter: oTestConditions}), "StateUtil.applyExternalState called");
				oFilterBar.fireSearch();
				assert.ok(oContent.applyFilters.called, "applyFilters called");
				oFilterBar.cleanUpAllFilterFieldsInErrorState.reset();
				StateUtil.applyExternalState.reset();
				oContent.applyFilters.reset();

				return oContent.onBeforeShow(true).then(() => {
					oTestConditions.$search[0].values[0] = "i";
					assert.ok(oFilterBar.cleanUpAllFilterFieldsInErrorState.called, "FilterBar.cleanUpAllFilterFieldsInErrorState called");
					assert.ok(StateUtil.applyExternalState.calledWith(oFilterBar, {filter: oTestConditions}), "StateUtil.applyExternalState called");
					oFilterBar.cleanUpAllFilterFieldsInErrorState.reset();
					StateUtil.applyExternalState.reset();
					oContent.applyFilters.reset();

					return oContent.onBeforeShow(false).then(() => {
						assert.notOk(oFilterBar.cleanUpAllFilterFieldsInErrorState.called, "FilterBar.cleanUpAllFilterFieldsInErrorState called");
						assert.ok(StateUtil.applyExternalState.notCalled, "StateUtil.applyExternalState called");
						oFilterBar.fireSearch();
						assert.ok(oContent.applyFilters.called, "applyFilters called");
						oFilterBar.cleanUpAllFilterFieldsInErrorState.restore();
						ValueHelpDelegate.getFilterConditions.restore();
						FilterBarDelegate.fetchProperties.restore();
						oContent.applyFilters.restore();
					});
				});
			});
		});

	});

	QUnit.test("clone", (assert) => {

		const oMyFilterBar = new FilterBar("FB1");
		oContent.setFilterBar(oMyFilterBar);
		const oClone = oContent.clone("MyClone");
		const oCloneFilterBar = oClone.getFilterBar();

		sinon.spy(oContent, "applyFilters");
		oCloneFilterBar.fireSearch();
		assert.notOk(oContent.applyFilters.called, "search of FilterBar");
		oClone.destroy();

		return oContent.onBeforeShow(true).then(() => {
			const oClone = oContent.clone("MyClone");
			const oCloneFilterBar = oClone.getFilterBar();

			oCloneFilterBar.fireSearch();
			assert.notOk(oContent.applyFilters.called, "search of FilterBar");
			oClone.destroy();
		});

	});

	QUnit.test("onHide", (assert) => {
		const oMyFilterBar = new FilterBar("FB1");
		oContent.setFilterBar(oMyFilterBar);

		return oContent.onBeforeShow(true).then(() => {
			oContent._bVisible = true;
			sinon.spy(oContent, "applyFilters");

			oContent.onHide();
			oMyFilterBar.fireSearch();
			assert.notOk(oContent.applyFilters.called, "search of FilterBar");
			assert.notOk(oContent._bVisible, "visible flag");
		});
	});

	QUnit.test("CollectiveSearch", (assert) => {
		const oCollectiveSearchSelect = new CollectiveSearchSelect("CSS1", {selectedKey: "1"});
		const oFilterBar = new FilterBar("MyFilterBar");
		oContent.setFilterBar(oFilterBar);
		oContent.setCollectiveSearchSelect(oCollectiveSearchSelect);

		assert.equal(oFilterBar.getCollectiveSearch(), oCollectiveSearchSelect, "CollectiveSearchSelect assigned to FilterBar");
		assert.equal(oContent.getCollectiveSearchKey(), "1", "getCollectiveSearchKey");
	});

	QUnit.test("_fireSelect", (assert) => {
		let iSelectCount = 0;
		let oParameters;
		oContent.attachSelect((oEvent) => {
			iSelectCount++;
			oParameters = oEvent.getParameters();
		});

		oContent._fireSelect({test: "X"});
		assert.equal(iSelectCount, 1, "Select event fired");
		assert.equal(oParameters?.test, "X", "Select event parameters");
	});

	QUnit.test("getCount", (assert) => {
		const aConditions = [
			Condition.createItemCondition(1, "Item 1"),
			Condition.createCondition(OperatorName.NE, [2], undefined, undefined, ConditionValidated.NotValidated)
		];

		assert.equal(oContent.getCount(aConditions), 1, "without Delegate");

		ValueHelpDelegate.getCount = (oValueHelp, oContent, aConditions, sGroup) => {
			return aConditions.length;
		};
		assert.equal(oContent.getCount(aConditions), 2, "with Delegate");
		delete ValueHelpDelegate.getCount;
	});

	QUnit.test("getListBindingInfo", (assert) => {
		try {
			oContent.getListBindingInfo();
		} catch (oError) {
			assert.equal(oError.message, "FilterableListContent: Every filterable listcontent must implement this method.", "Error thrown");
		}
	});

	QUnit.test("getInitialFocusedControl", (assert) => {
		const oFilterBar = new FilterBar("MyFilterBar");
		oContent.setFilterBar(oFilterBar);
		assert.equal(oContent.getInitialFocusedControl()?.getId(), "MyFilterBar-btnSearch", "returned control");
	});

	QUnit.test("_getTypesForConditions", (assert) => {
		sinon.stub(ValueHelpDelegate, "getTypesForConditions").returns({test: "X"});

		assert.deepEqual(oContent._getTypesForConditions({}), {test: "X"}, "just result of Delegate returned");
		ValueHelpDelegate.getTypesForConditions.restore();
	});

	QUnit.test("getSelectableConditions", (assert) => {
		oContent.setConditions([
			Condition.createItemCondition(1, "Item 1"),
			Condition.createCondition(OperatorName.NE, [2], undefined, undefined, ConditionValidated.NotValidated)
		]);
		const aTestConditions = [
			Condition.createItemCondition(1, "Item 1")
		];
		const aSelectableConditions = oContent.getSelectableConditions();
		assert.deepEqual(aSelectableConditions, aTestConditions, "returned conditions");
	});

	let oModel;
	let oMyListBinding;

	QUnit.module("Bindiung features", {
		beforeEach() {
			_init();
			oContent.setKeyPath("key");
			oContent.setDescriptionPath("text");
			oModel = new JSONModel({items: [{key: 1, text: "Item 1"}]});
			oMyListBinding = new JSONListBinding(oModel, "/items");
			oContent.getListBinding = () => oMyListBinding; // fake implementation
		},
		afterEach() {
			_teardown();
			oMyListBinding.destroy();
			oMyListBinding = undefined;
			oModel.destroy();
			oModel = undefined;
		}
	});

	QUnit.test("listBinding Promise", (assert) => {

		sinon.spy(oContent, "_updateBasicSearchField");

		assert.ok(oContent.promiseCache._oCache.listBinding.promise, "listBinding Promise initially created");

		const oPromise = oContent.awaitListBinding();
		assert.ok(oPromise instanceof Promise, "listBinding Promise returned");

		assert.equal(oContent.resolveListBinding(), oMyListBinding, "ListBinding returned in resolveListBinding");

		return oPromise?.then((oListBinding) => {
			assert.equal(oListBinding, oMyListBinding, "ListBinding returned in Promise");
			assert.ok(oContent._updateBasicSearchField.calledOnce, "_updateBasicSearchField called");
		});

	});

	QUnit.test("getItemFromContext", (assert) => {
		const oContext = oMyListBinding.getContexts()[0];
		const oOptions = {
			keyPath: "key",
			descriptionPath: "text"
		};

		sinon.stub(ValueHelpDelegate, "createConditionPayload").callsFake((oValueHelp, oContent, aValues, oContext) => {
			return {myKey: aValues[0]};
		});

		const oResult = oContent.getItemFromContext(oContext, oOptions);
		assert.deepEqual(oResult, {key: 1, description: "Item 1", payload: {myKey: 1}}, "Result");
		ValueHelpDelegate.createConditionPayload.restore();
	});

	QUnit.test("_isContextSelected", (assert) => {
		const oContext = oMyListBinding.getContexts()[0];
		const aConditions = [Condition.createItemCondition(3, "Item 3")];

		sinon.stub(ValueHelpDelegate, "findConditionsForContext").returns([]);
		assert.notOk(oContent._isContextSelected(oContext, aConditions), "not selected");

		ValueHelpDelegate.findConditionsForContext.returns([Condition.createItemCondition(3, "Item 3")]);
		assert.ok(oContent._isContextSelected(oContext, aConditions), "selected");
		ValueHelpDelegate.findConditionsForContext.restore();
	});

	/**
	 *  @deprecated since 1.118
	 */
	QUnit.test("_isContextSelected - using isFilterableListItemSelected", (assert) => {
		const oContext = oMyListBinding.getContexts()[0];
		const aConditions = [Condition.createItemCondition(3, "Item 3")];

		ValueHelpDelegate.isFilterableListItemSelected = (oValueHelp, oContent, oItem, aConditions) => {
			const oObject = oItem.getBindingContext().getObject();
			for (let i = 0; i < aConditions.length; i++) {
				if (oObject.key === aConditions[i].values[0]) {
					return true;
				}
			}
		};
		assert.notOk(oContent._isContextSelected(oContext, aConditions), "not selected");

		aConditions.push(Condition.createItemCondition(1, "Item 1"));
		assert.ok(oContent._isContextSelected(oContext, aConditions), "selected");
		delete ValueHelpDelegate.isFilterableListItemSelected;
	});

});
