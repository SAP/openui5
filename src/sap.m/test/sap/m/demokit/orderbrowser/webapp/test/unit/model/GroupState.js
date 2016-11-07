sap.ui.define([
		"sap/ui/demo/orderbrowser/model/GroupState",
		"sap/ui/model/Sorter",
		"sap/ui/model/json/JSONModel"
	], function (GroupState, Sorter, JSONModel) {
	"use strict";

	QUnit.module("GroupSortState - grouping", {
		beforeEach: function () {
			this.oModel = new JSONModel({});
			// System under test
			this.oInitialSorter = new Sorter("Dummy", true);
			/*
			 * Resource bundle: Initial properties file without language extension, so that
			 * the test is language-independent.
			 */
			var oResourceBundle = jQuery.sap.resources({ url: "../../i18n/i18n.properties" });
			this.oGroupState = new GroupState(this.oInitialSorter, oResourceBundle);
		}
	});

	QUnit.test("Should always return sorters when grouping", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupState.groupBy("CompanyName").length, 2, "The grouping by company name returned two sorters");
		assert.strictEqual(this.oGroupState.groupBy("OrderPeriod").length, 2, "The grouping by order period returned two sorters");
		assert.strictEqual(this.oGroupState.groupBy("ShippedPeriod").length, 2, "The grouping by shipping period returned two sorters");
		assert.strictEqual(this.oGroupState.groupBy("NO_GROUPING").length, 1, "The grouping according to the initial Sorter returned a sorter");
		assert.strictEqual(this.oGroupState.groupBy("invalid").length, 1, "The grouping by an invalid key returned a sorter");
	});

	QUnit.test("By company name: Should return company name as key and text", function (assert) {
		// Arrange
		var sTestCompany = "Test Company 123";
		var oContextStub = { getProperty: this.stub().withArgs("Customer/CompanyName").returns(sTestCompany) };

		// Act + Assert
		var oGroupingInfo = this.oGroupState._groupByCompanyName(oContextStub);
		assert.strictEqual(oGroupingInfo.key , sTestCompany, "The grouping by company name returned the company name as key" );
		assert.strictEqual(oGroupingInfo.text, sTestCompany, "The grouping by company name returned the company name as text");
	});

	QUnit.test("By order period: Should return order period (year + month) in certain string formats as key and text", function (assert) {
		// Arrange
		var oTestDate = new Date(2016, 10 - 1, 5); // Attention: Counting of months starts with 0, not 1!
		var oContextStub = { getProperty: this.stub().withArgs("OrderDate").returns(oTestDate) };

		// Act + Assert
		var oGroupingInfo = this.oGroupState._groupByOrderPeriod(oContextStub);
		assert.strictEqual(oGroupingInfo.key , "2016-10", "The grouping by order date returned an object with the expected string with month name and year as 'key'");
		assert.strictEqual(oGroupingInfo.text, "Ordered in October 2016", "The grouping by order date returned an object with the expected string with month name and year as 'text'");
	});

	QUnit.test("By shipping period (case: order was shipped already): Should return shipping period (year + month) in certain string formats as key and text", function (assert) {
		// Arrange
		var oTestDate = new Date(2016, 10 - 1, 5); // Attention: Counting of months starts with 0, not 1!
		var oContextStub = { getProperty: this.stub().withArgs("OrderDate").returns(oTestDate) };

		// Act
		var oGroupingInfo = this.oGroupState._groupByOrderPeriod(oContextStub);

		// Assert
		assert.strictEqual(oGroupingInfo.key , "2016-10", "The grouping by order date returned an object with the expected string with month name and year as 'key'");
		assert.strictEqual(oGroupingInfo.text, "Ordered in October 2016", "The grouping by order date returned an object with the expected string with month name and year as 'text'");
	});

	QUnit.test("By shipping period (case: order was NOT shipped yet): Should return fixed key and text values", function (assert) {
		// Arrange
		var oTestDate = null; // Not shipped yet
		var oContextStub = { getProperty: this.stub().withArgs("ShippedDate").returns(oTestDate) };

		// Act
		var oGroupingInfo = this.oGroupState._groupByShippedPeriod(oContextStub);

		// Assert
		assert.strictEqual(oGroupingInfo.key , 0, "The grouping by order date returned an object with fixed value 0 as 'key'");
		assert.strictEqual(oGroupingInfo.text, "Not Shipped Yet", "The grouping by order date returned an object with the expected fixed string as 'text'");
	});

});