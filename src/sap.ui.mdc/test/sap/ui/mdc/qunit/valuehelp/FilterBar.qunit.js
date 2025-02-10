/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/valuehelp/FilterBar",
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/valuehelp/CollectiveSearchSelect",
	"sap/ui/core/Lib"
], (
	FilterBar,
	FilterBarBase,
	FilterField,
	CollectiveSearchSelect,
	Library
) => {
	"use strict";

	const mdcMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	let oFilterBar;

	QUnit.module("FilterBar", {
		beforeEach() {
			oFilterBar = new FilterBar("FB1", {
				//delegate: { name: "delegates/GenericVhFilterBarDelegate", payload: {} }
			});

		},
		afterEach() {
			oFilterBar?.destroy();
			oFilterBar = undefined;
		}
	});


	QUnit.test("instanciable", (assert) => {
		assert.ok(oFilterBar);
	});

	QUnit.test("inner layout exists on initialization", (assert) => {
		const done = assert.async();
		assert.ok(oFilterBar);

		oFilterBar.initialized().then(() => {
			assert.ok(!!oFilterBar.getAggregation("layout"));
			done();
		});
	});

	QUnit.test("getConditionModelName ", (assert) => {
		assert.equal(oFilterBar.getConditionModelName(), FilterBarBase.CONDITION_MODEL_NAME);
	});

	QUnit.test("get GO/Search button visiblity", (assert) => {
		const oButton = oFilterBar._btnSearch;

		assert.equal(oFilterBar.getBasicSearchField(), null, "No Basis Search exist");
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");
		assert.notOk(oFilterBar._oBtnFilters.getVisible(), "showFilters button is not visible");

		assert.ok(oButton);

		oFilterBar.setBasicSearchField(new FilterField("BS1", {
			conditions: "{$filters>/conditions/$search}",
			propertyKey: "$search",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		}));

		assert.ok(!!oFilterBar.getBasicSearchField(), "Basic Search exist");

		const oFilterField = new FilterField("FF1", {
			conditions: "{$filters>/conditions/ff1}",
			propertyKey: "ff1",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});
		oFilterBar.addFilterItem(oFilterField);

		assert.ok(oFilterBar._oBtnFilters.getVisible(), "showFilters button is visible");

		assert.ok(oButton.getVisible(), "Search/Go button is visible");

		oFilterBar.setShowGoButton(false);
		assert.notOk(oButton.getVisible(), "Search/Go button is not visible");

		oFilterBar.setShowGoButton(true);
		assert.ok(oButton.getVisible(), "Search/Go button is visible");

		oFilterBar.setLiveMode(true);

		if (oFilterBar._isPhone()) {
			assert.ok(oButton.getVisible(), "Search/Go button is visible");
		} else {
			assert.notOk(oButton.getVisible(), "Search/Go button is not visible");
		}

		oFilterBar.setLiveMode(false);
		oFilterBar.removeFilterItem(oFilterField);
		oFilterField.destroy();
		assert.notOk(oFilterBar._oBtnFilters.getVisible(), "showFilters button is not visible");
		assert.ok(oButton.getVisible(), "Search/Go button is visible");
	});

	QUnit.test("filterFieldThreshold / showAllFilters button", (assert) => {
		const oLayout = oFilterBar._oFilterBarLayout.oAlgnLayout;
		sinon.spy(oLayout, "removeAllContent");

		oFilterBar.setFilterFieldThreshold(2);
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");

		let oFilterField = new FilterField("FF1", {
			conditions: "{$filters>/conditions/ff1}",
			propertyKey: "ff1",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});
		oFilterBar.addFilterItem(oFilterField);
		let aContent = oLayout.getContent();
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");
		assert.equal(aContent.length, 1, "One FilterField shown");
		assert.equal(aContent[0]._getFilterField(), oFilterField, "New FilterField is first item");

		oLayout.removeAllContent.reset();
		oFilterField = new FilterField("FF2", {
			conditions: "{$filters>/conditions/ff2}",
			propertyKey: "ff2",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});
		oFilterBar.insertFilterItem(oFilterField, 0);
		aContent = oLayout.getContent();
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");
		assert.equal(aContent.length, 2, "Two FilterFields shown");
		assert.equal(aContent[0]._getFilterField(), oFilterField, "New FilterField is first item");
		assert.ok(oLayout.removeAllContent.calledOnce, "Layout content new assigned");

		oLayout.removeAllContent.reset();
		oFilterField = new FilterField("FF3", {
			conditions: "{$filters>/conditions/ff3}",
			propertyKey: "ff3",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});
		oFilterBar.insertFilterItem(oFilterField, 0);
		aContent = oLayout.getContent();
		assert.ok(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is visible");
		assert.equal(aContent.length, 2, "Two FilterFields shown");
		assert.equal(aContent[0]._getFilterField(), oFilterField, "New FilterField is first item");
		assert.ok(oLayout.removeAllContent.calledOnce, "Layout content new assigned");

		oLayout.removeAllContent.reset();
		oFilterField = new FilterField("FF4", {
			conditions: "{$filters>/conditions/ff4}",
			propertyKey: "ff3",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		});
		oFilterBar.addFilterItem(oFilterField);
		aContent = oLayout.getContent();
		assert.ok(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is visible");
		assert.equal(aContent.length, 2, "Two FilterFields shown");
		assert.equal(aContent[0]._getFilterField().getId(), "FF3", "Old FilterField is first item");
		assert.ok(oLayout.removeAllContent.notCalled, "Layout content not changed");

		oLayout.removeAllContent.reset();
		oFilterBar._oShowAllFiltersBtn.firePress();
		aContent = oLayout.getContent();
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");
		assert.equal(aContent.length, 4, "Four FilterFields shown");
		assert.ok(oLayout.removeAllContent.calledOnce, "Layout content new assigned");
	});

	QUnit.test("check liveMode property", (assert) => {
		const oButton = oFilterBar._btnSearch;
		assert.ok(oButton);

		assert.ok(!oFilterBar.getLiveMode());
		assert.ok(oButton.getVisible());

		oFilterBar.setLiveMode(true);
		assert.ok(oFilterBar.getLiveMode());
		if (oFilterBar._isPhone()) {
			assert.ok(oButton.getVisible());
		} else {
			assert.ok(!oButton.getVisible());
		}
	});

	QUnit.test("check ExpandFilterFields", (assert) => {
		const oLayout = oFilterBar._oFilterBarLayout.oAlgnLayout;
		const oButton = oFilterBar._oBtnFilters;
		const bExpanded = oFilterBar.getExpandFilterFields();
		assert.ok(bExpanded);

		assert.equal(oButton.getText(), "Hide Filters");
		assert.ok(oLayout.getVisible(), "FilterFields layout should be visible");

		oFilterBar.setExpandFilterFields(false);
		assert.ok(!oFilterBar.getExpandFilterFields());

		assert.ok(oButton.getText() === "Show Filters");
		assert.ok(!oLayout.getVisible(), "FilterFields layout should be invisible");

		oFilterBar._onToggleFilters();
		assert.equal(oButton.getText(), "Hide Filters");
		assert.ok(oLayout.getVisible(), "FilterFields layout should be visible");

		oFilterBar._onShowAllFilters();
		assert.notOk(oFilterBar._oShowAllFiltersBtn.getVisible(), "Show All button should be invisible");
	});

	QUnit.test("check BasicSearch", (assert) => {
		let oCtrl = oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === undefined, "BasicSearchField should not exist");

		const oBSField = new FilterField("BS1");
		oFilterBar.setBasicSearchField(oBSField);
		oCtrl = oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === oBSField, "BasicSearchField should exist");

		const oNewBSField = new FilterField("BS2");
		oFilterBar.setBasicSearchField(oNewBSField);
		oCtrl = oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === oNewBSField, "new BasicSearchField should exist");
		assert.notOk(oBSField.getParent(), "old BasicSearchField has no parent");

		oFilterBar.destroyBasicSearchField();
		oCtrl = oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === undefined, "BasicSearchField should not exist");

		oBSField.destroy();
	});

	QUnit.test("check CollectiveSearch", (assert) => {
		let oCtrl = oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === undefined, "CollectiveSearchSelect should not exist");

		const oColSearch = new CollectiveSearchSelect("CS1");
		oFilterBar.setCollectiveSearch(oColSearch);
		oCtrl = oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === oColSearch, "CollectiveSearchSelect should exist");

		const oNewColSearch = new CollectiveSearchSelect("CS2");
		oFilterBar.setCollectiveSearch(oNewColSearch);
		oCtrl = oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === oNewColSearch, "new CollectiveSearchSelect should exist");
		assert.notOk(oColSearch.getParent(), "old CollectiveSearchSelect has no parent");

		oFilterBar.destroyCollectiveSearch();
		oCtrl = oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === undefined, "CollectiveSearchSelect should not exist");
		assert.ok(oNewColSearch.isDestroyed(), "New CollectiveSearchSelect destroyed");

		oFilterBar.setCollectiveSearch(oColSearch);
		oCtrl = oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === oColSearch, "CollectiveSearchSelect should exist");
		oFilterBar.destroy();
		oFilterBar = undefined;
		assert.notOk(oColSearch.isDestroyed() || oColSearch.isDestroyStarted(), "CollectiveSearch not destroyed after FilterBar destroyed");

		oColSearch.destroy();
	});

	QUnit.test("getInitialFocusedControl", (assert) => {
		let oControl = oFilterBar.getInitialFocusedControl();
		assert.ok(oControl, "Control returned");
		assert.equal(oControl, oFilterBar._btnSearch, "Control is Go-Button");

		oFilterBar.setShowGoButton(false);
		oControl = oFilterBar.getInitialFocusedControl();
		assert.notOk(oControl, "no Control returned");

		const oBSField = new FilterField("BS1");
		oFilterBar.setBasicSearchField(oBSField);
		oControl = oFilterBar.getInitialFocusedControl();
		assert.ok(oControl, "Control returned");
		assert.equal(oControl, oBSField, "Control is SearchField");
	});

	QUnit.test("Properties", (assert) => {
		sinon.stub(oFilterBar, "getParent").returns({
			isPropertyInitial(sName) {return true;},
			isInvalidateSuppressed() {return false;},
			invalidate() {}
		});
		return oFilterBar._retrieveMetadata().then(() => {
			const aPropertyInfos = oFilterBar.getPropertyInfoSet();

			assert.equal(aPropertyInfos?.length, 1, "One Property");
			assert.equal(aPropertyInfos?.[0].key, "$search", "Key");
			assert.equal(aPropertyInfos?.[0].dataType, "sap.ui.model.type.String", "dataType");
			assert.equal(aPropertyInfos?.[0].label, mdcMessageBundle.getText("filterbar.SEARCH"), "Label");
		});
	});

	/**
	 *  @deprecated since 1.120.2
	 */
	QUnit.test("Properties using FilterFields", (assert) => {
		sinon.stub(oFilterBar, "getParent").returns({
			isPropertyInitial(sName) {return sName !== "filterFields";},
			getFilterFields() {return "myField";},
			isInvalidateSuppressed() {return false;},
			invalidate() {}
		});
		return oFilterBar._retrieveMetadata().then(() => {
			const aPropertyInfos = oFilterBar.getPropertyInfoSet();

			assert.equal(aPropertyInfos?.length, 1, "One Property");
			assert.equal(aPropertyInfos?.[0].key, "myField", "Key");
			assert.equal(aPropertyInfos?.[0].dataType, "sap.ui.model.type.String", "dataType");
			assert.equal(aPropertyInfos?.[0].label, mdcMessageBundle.getText("filterbar.SEARCH"), "Label");
		});
	});

});
