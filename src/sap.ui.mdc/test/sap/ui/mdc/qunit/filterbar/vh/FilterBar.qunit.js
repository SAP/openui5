/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/ui/mdc/filterbar/FilterBarBase",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/FilterField"
], function (
	FilterBar,
	FilterBarBase,
	Condition,
	FilterField
) {
	"use strict";

	QUnit.module("FilterBar", {
		beforeEach: function () {
			this.oFilterBar = new FilterBar({
				//delegate: { name: "sap/ui/mdc/filterbar/vh/GenericFilterBarDelegate", payload: {} }
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
		var done = assert.async();
		assert.ok(this.oFilterBar);

		this.oFilterBar.initialized().then(function() {
			assert.ok(!!this.oFilterBar.getAggregation("layout"));
			done();
		}.bind(this));
	});

	QUnit.test("getConditionModelName ", function (assert) {
		assert.equal(this.oFilterBar.getConditionModelName(), FilterBarBase.CONDITION_MODEL_NAME);
	});

	QUnit.test("get GO button", function (assert) {
		var oButton = this.oFilterBar._btnSearch;
		assert.ok(oButton);
		assert.ok(oButton.getVisible());

		this.oFilterBar.setShowGoButton(false);
		assert.ok(!oButton.getVisible());

		this.oFilterBar.setShowGoButton(true);
		assert.ok(oButton.getVisible());

		this.oFilterBar.setLiveMode(true);

		if (this.oFilterBar._isPhone()) {
			assert.ok(oButton.getVisible());
		} else {
			assert.ok(!oButton.getVisible());
		}
	});


	QUnit.test("check liveMode property", function (assert) {
		var oButton = this.oFilterBar._btnSearch;
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
		var oLayout = this.oFilterBar._oFilterBarLayout.oAlgnLayout;
		var oButton = this.oFilterBar._oBtnFilters;
		var bExpanded = this.oFilterBar.getExpandFilterFields();
		assert.ok(bExpanded);

		assert.equal(oButton.getText(), "Hide Filters");
		assert.ok(oLayout.getVisible(), "FilterFields layout  should be visible");

		this.oFilterBar.setExpandFilterFields(false);
		assert.ok(!this.oFilterBar.getExpandFilterFields());

		assert.ok(oButton.getText() === "Show Filters");
		assert.ok(!oLayout.getVisible(), "FilterFields layout should be invisible");
	});

	QUnit.test("check BasicSearch", function (assert) {
		var oCtrl = this.oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === undefined, "BasicSearchField should not exist");

		var oBSField = new FilterField();
		this.oFilterBar.setBasicSearchField(oBSField);
		oCtrl = this.oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === oBSField, "BasicSearchField should exist");

		this.oFilterBar.destroyBasicSearchField();
		oCtrl = this.oFilterBar.getBasicSearchField();
		assert.ok(oCtrl === undefined, "BasicSearchField should not exist");
	});

});
