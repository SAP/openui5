/* global QUnit, sinon*/

sap.ui.define([
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/filterbar/vh/CollectiveSearchSelect",
	"sap/ui/core/Lib"
], function (
	FilterBar,
	FilterBarBase,
	Condition,
	FilterField,
	CollectiveSearchSelect,
	Library
) {
	"use strict";

	const mdcMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");

	QUnit.module("FilterBar", {
		beforeEach: function () {
			this.oFilterBar = new FilterBar({
				//delegate: { name: "delegates/GenericVhFilterBarDelegate", payload: {} }
			});

		},
		afterEach: function () {
			this.oFilterBar.destroy();
			this.oFilterBar = undefined;
		}
	});


	QUnit.test("instanciable", function (assert) {
		assert.ok(this.oFilterBar);
	});

	QUnit.test("inner layout exists on initialization", function(assert) {
		const done = assert.async();
		assert.ok(this.oFilterBar);

		this.oFilterBar.initialized().then(function() {
			assert.ok(!!this.oFilterBar.getAggregation("layout"));
			done();
		}.bind(this));
	});

	QUnit.test("getConditionModelName ", function (assert) {
		assert.equal(this.oFilterBar.getConditionModelName(), FilterBarBase.CONDITION_MODEL_NAME);
	});

	QUnit.test("get GO/Search button visiblity", function (assert) {
		const oButton = this.oFilterBar._btnSearch;

		assert.equal(this.oFilterBar.getBasicSearchField(), null, "No Basis Search exist");
		assert.notOk(this.oFilterBar._oShowAllFiltersBtn.getVisible(), "showAllFilters button is not visible");
		assert.notOk(this.oFilterBar._oBtnFilters.getVisible(), "showFilters button is not visible");

		assert.ok(oButton);

		this.oFilterBar.setBasicSearchField(new FilterField({
			conditions: "{$filters>/conditions/$search}",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		}));

		assert.ok(!!this.oFilterBar.getBasicSearchField(), "Basic Search exist");

		this.oFilterBar.addFilterItem(new FilterField({
			conditions: "{$filters>/conditions/$search}",
			maxConditions: 1,
			delegate: '{name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}'
		}));

		assert.ok(this.oFilterBar._oBtnFilters.getVisible(), "showFilters button is visible");

		assert.ok(oButton.getVisible(), "Search/Go button is visible");

		this.oFilterBar.setShowGoButton(false);
		assert.notOk(oButton.getVisible(), "Search/Go button is not visible");

		this.oFilterBar.setShowGoButton(true);
		assert.ok(oButton.getVisible(), "Search/Go button is visible");

		this.oFilterBar.setLiveMode(true);

		if (this.oFilterBar._isPhone()) {
			assert.ok(oButton.getVisible(), "Search/Go button is visible");
		} else {
			assert.notOk(oButton.getVisible(), "Search/Go button is not visible");
		}
	});


	QUnit.test("check liveMode property", function (assert) {
		const oButton = this.oFilterBar._btnSearch;
		assert.ok(oButton);

		assert.ok(!this.oFilterBar.getLiveMode());
		assert.ok(oButton.getVisible());

		this.oFilterBar.setLiveMode(true);
		assert.ok(this.oFilterBar.getLiveMode());
		if (this.oFilterBar._isPhone()) {
			assert.ok(oButton.getVisible());
		} else {
			assert.ok(!oButton.getVisible());
		}
	});

	QUnit.test("check ExpandFilterFields", function (assert) {
		const oLayout = this.oFilterBar._oFilterBarLayout.oAlgnLayout;
		const oButton = this.oFilterBar._oBtnFilters;
		const bExpanded = this.oFilterBar.getExpandFilterFields();
		assert.ok(bExpanded);

		assert.equal(oButton.getText(), "Hide Filters");
		assert.ok(oLayout.getVisible(), "FilterFields layout should be visible");

		this.oFilterBar.setExpandFilterFields(false);
		assert.ok(!this.oFilterBar.getExpandFilterFields());

		assert.ok(oButton.getText() === "Show Filters");
		assert.ok(!oLayout.getVisible(), "FilterFields layout should be invisible");

		this.oFilterBar._onToggleFilters();
		assert.equal(oButton.getText(), "Hide Filters");
		assert.ok(oLayout.getVisible(), "FilterFields layout should be visible");

		this.oFilterBar._onShowAllFilters();
		assert.ok(!this.oFilterBar._oShowAllFiltersBtn.getVisible(), "Show All button should be invisible");
	});

	QUnit.test("check BasicSearch", function (assert) {
		let oCtrl = this.oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === undefined, "BasicSearchField should not exist");

		const oBSField = new FilterField();
		this.oFilterBar.setBasicSearchField(oBSField);
		oCtrl = this.oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === oBSField, "BasicSearchField should exist");

		const oNewBSField = new FilterField();
		this.oFilterBar.setBasicSearchField(oNewBSField);
		oCtrl = this.oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === oNewBSField, "new BasicSearchField should exist");

		this.oFilterBar.destroyBasicSearchField();
		oCtrl = this.oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === undefined, "BasicSearchField should not exist");
	});

	QUnit.test("check CollectiveSearch", function (assert) {
		let oCtrl = this.oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === undefined, "CollectiveSearchSelect should not exist");

		const oColSearch = new CollectiveSearchSelect();
		this.oFilterBar.setCollectiveSearch(oColSearch);
		oCtrl = this.oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === oColSearch, "CollectiveSearchSelect should exist");

		const oNewColSearch = new CollectiveSearchSelect();
		this.oFilterBar.setCollectiveSearch(oNewColSearch);
		oCtrl = this.oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === oNewColSearch, "new CollectiveSearchSelect should exist");

		this.oFilterBar.destroyCollectiveSearch();
		oCtrl = this.oFilterBar.getCollectiveSearch();
		assert.ok(oCtrl === undefined, "CollectiveSearchSelect should not exist");
	});

	QUnit.test("Properties", function (assert) {
		sinon.stub(this.oFilterBar, "getParent").returns({
			isPropertyInitial(sName) {return true;},
			isInvalidateSuppressed() {return false;},
			invalidate() {}
		});
		return this.oFilterBar._retrieveMetadata().then(() => {
			const aPropertyInfos = this.oFilterBar.getPropertyInfoSet();

			assert.equal(aPropertyInfos?.length, 1, "One Property");
			assert.equal(aPropertyInfos?.[0].name, "$search", "Name");
			assert.equal(aPropertyInfos?.[0].dataType, "sap.ui.model.type.String", "dataType");
			assert.equal(aPropertyInfos?.[0].label, mdcMessageBundle.getText("filterbar.SEARCH"), "Label");
		});
	});

	/**
	 *  @deprecated since 1.120.2
	 */
	QUnit.test("Properties using FilterFields", function (assert) {
		sinon.stub(this.oFilterBar, "getParent").returns({
			isPropertyInitial(sName) {return sName !== "filterFields";},
			getFilterFields() {return "myField";},
			isInvalidateSuppressed() {return false;},
			invalidate() {}
		});
		return this.oFilterBar._retrieveMetadata().then(() => {
			const aPropertyInfos = this.oFilterBar.getPropertyInfoSet();

			assert.equal(aPropertyInfos?.length, 1, "One Property");
			assert.equal(aPropertyInfos?.[0].name, "myField", "Name");
			assert.equal(aPropertyInfos?.[0].dataType, "sap.ui.model.type.String", "dataType");
			assert.equal(aPropertyInfos?.[0].label, mdcMessageBundle.getText("filterbar.SEARCH"), "Label");
		});
	});

});
