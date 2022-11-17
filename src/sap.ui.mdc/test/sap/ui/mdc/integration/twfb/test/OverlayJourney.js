/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/Ancestor",
	"test-resources/sap/ui/mdc/testutils/opa/table/Assertions",
	"test-resources/sap/ui/mdc/testutils/opa/chart/AssertionsViz",
	"test-resources/sap/ui/fl/testutils/opa/TestLibrary"
], function(
	Opa5,
	opaTest,
	Press,
	EnterText,
	Ancestor,
	TableAssertions,
	ChartAssertions,
	FlTestLib
) {
	"use strict";

	Opa5.extendConfig({

		// TODO: increase the timeout timer from 15 (default) to 45 seconds
		// to see whether it influences the success rate of the first test on
		// the build infrastructure.
		// As currently, the underlying service takes some time for the
		// creation and initialization of tenants.
		// You might want to remove this timeout timer after the underlying
		// service has been optimized or if the timeout timer increase does
		// not have any effect on the success rate of the tests.
		timeout: 45,


		appParams: {
			"sap-ui-xx-complexP13n": true
		},

		arrangements: {
			iStartMyUIComponentInViewMode: function() {

				// In some cases when a test fails in a success function,
				// the UI component is not properly teardown.
				// As a side effect, all the following tests in the stack
				// fails when the UI component is started, as only one UI
				// component can be started at a time.
				// Teardown the UI component to ensure it is not started
				// twice without a teardown, which results in less false
				// positives and more reliable reporting.
				if (this.hasUIComponentStarted()) {
					this.iTeardownMyUIComponent();
				}

				return this.iStartMyUIComponent({
					componentConfig: {
						name: "sap.ui.v4demo",
						async: true,
						settings: { id: "listreport" }
					},
					hash: "",
					autoWait: true
				});
			}
		},
		actions: new Opa5({
			/*
			 * Some overlay tests have very specific requirements which don't make sense for an application and are therefore implemented in custom actions here
			 */
			iEnterRandomValueInFilterFieldOnVH: function() {
				return this.waitFor({
					controlType: "sap.m.Button",
					properties: {
						icon: 'sap-icon://group-2'
					},
					matchers: {
						ancestor: {
							controlType: "sap.ui.mdc.FilterBar",
							visible: false
						}
					},
					actions: new Press(),
					success: function(){
						return this.waitFor({
							controlType: "sap.ui.mdc.FilterField",
							matchers: {
								ancestor: {
									controlType: "sap.m.Dialog"
								}
							},
							success: function(aFields) {
								Opa5.assert.ok(aFields.length >= 1, "Filter fields found in dialog");
								return this.waitFor({
									controlType: "sap.ui.mdc.field.FieldMultiInput",
									matchers: new Ancestor(aFields[0]),
									actions: new EnterText({
										text: "abcdefg",
										clearTextFirst: false,
										pressEnterKey: true
									})
								});
							}
						});
					}
				});
			},
			iClearAuthorFieldInVH: function() {
				return this.waitFor({
					controlType: "sap.m.Button",
					properties: {
						icon: 'sap-icon://group-2'
					},
					matchers: {
						ancestor: {
							controlType: "sap.ui.mdc.FilterBar",
							visible: false
						}
					},
					actions: new Press(),
					success: function(){
						return this.waitFor({
							controlType: "sap.m.Button",
							properties: {
								icon: 'sap-icon://slim-arrow-right'
							},
							matchers: {
								ancestor: {
									controlType: "sap.ui.mdc.FilterBar",
									visible: false
								}
							},
							actions: new Press(),
							success: function(){
								return this.waitFor({
									controlType: "sap.ui.mdc.FilterField",
									matchers: {
										ancestor: {
											controlType: "sap.m.Dialog"
										}
									},
									success: function(aFields) {
										Opa5.assert.ok(aFields.length >= 1, "Filter fields found in dialog");
										return this.waitFor({
											controlType: "sap.ui.core.Icon",
											matchers: new Ancestor(aFields[0]),
											properties: {
												src: "sap-icon://decline"
											},
											actions: new Press()
										});
									}
								});
							}
						});
					}
				});
			}
		}),
		assertions: new Opa5({
			iShouldSeeAnOverlayOnTable: function() {
				return TableAssertions.iShouldSeeAnOverlay.apply(this, arguments);
			},
			iShouldSeeNoOverlayOnTable: function() {
				return TableAssertions.iShouldSeeNoOverlay.apply(this, arguments);
			},
			iShouldSeeAnOverlayOnChart: function(sId) {
				return ChartAssertions.iShouldSeeAnOverlay.apply(this, arguments);
			},
			iShouldSeeNoOverlayOnChart: function(sId) {
				return ChartAssertions.iShouldSeeNoOverlay.apply(this, arguments);
			}
		})
	});

	var oModuleSettings = {
		beforeEach: function() {},
		afterEach: function() {}
	};

	QUnit.module("Overlay Tests", oModuleSettings);

	opaTest("When entering Filter Values, I should see an overlay", function(Given, When, Then){
		var oFilterBar = "listreport---books--booksFilterBar";
		var oMDCChart = "listreport---books--bookChart";
		Given.iStartMyUIComponentInViewMode();

		When.onTheMDCFilterBar.iEnterFilterValue(oFilterBar, {
			Books: {
				label: "Author ID",
				values: [ "101" ]
			}
		});

		Then.iShouldSeeAnOverlayOnTable();
		Then.iShouldSeeAnOverlayOnChart(oMDCChart);
	});

	opaTest("When I press Go, the overlay should be gone", function(Given, When, Then){
		var oFilterBar = "listreport---books--booksFilterBar";
		var oMDCChart = "listreport---books--bookChart";
		When.onTheMDCFilterBar.iExpectSearch(oFilterBar);

		Then.iShouldSeeNoOverlayOnTable();
		Then.iShouldSeeNoOverlayOnChart(oMDCChart);
		Then.iTeardownMyUIComponent();
	});

	opaTest("When opening and closing the AF dialog without changing values, there should be no overlay", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();
		var oFilterBar = "listreport---books--booksFilterBar";
		var oMDCChart = "listreport---books--bookChart";

		When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton(oFilterBar);
		When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithCancel();
		Then.iShouldSeeNoOverlayOnTable();
		Then.iShouldSeeNoOverlayOnChart(oMDCChart);

		When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton(oFilterBar);
		When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();

		Then.iShouldSeeNoOverlayOnTable();
		Then.iShouldSeeNoOverlayOnChart(oMDCChart);
		Then.iTeardownMyUIComponent();
	});

	opaTest("When opening and closing the AF dialog with changing values then pressing cancel, there should be no overlay", function(Given,When,Then) {
		Given.iStartMyUIComponentInViewMode();
		var oFilterBar = "listreport---books--booksFilterBar";
		var oMDCChart = "listreport---books--bookChart";

		When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton(oFilterBar);
		When.iEnterRandomValueInFilterFieldOnVH();
		When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithCancel();

		Then.iShouldSeeNoOverlayOnTable();
		Then.iShouldSeeNoOverlayOnChart(oMDCChart);
		Then.iTeardownMyUIComponent();
	});

	opaTest("When opening and closing the AF dialog with changing values then pressing OK, there should be an overlay", function(Given, When, Then){
		Given.iStartMyUIComponentInViewMode();
		var oFilterBar = "listreport---books--booksFilterBar";
		var oMDCChart = "listreport---books--bookChart";

		When.onTheMDCFilterBar.iEnterFilterValue(oFilterBar, {
			Books: {
				label: "Author ID",
				values: [ "101" ]
			}
		});

		Then.iShouldSeeAnOverlayOnTable();
		Then.iShouldSeeAnOverlayOnChart(oMDCChart);
	});

	opaTest("When opening and closing the AF dialog with deleting the values then pressing OK, there should be an overlay", function(Given, When, Then){
		var oFilterBar = "listreport---books--booksFilterBar";
		var oMDCChart = "listreport---books--bookChart";
		When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton(oFilterBar);
		When.iClearAuthorFieldInVH();
		When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();

		Then.iShouldSeeAnOverlayOnTable();
		Then.iShouldSeeAnOverlayOnChart(oMDCChart);
		Then.iTeardownMyUIComponent();
	});

	opaTest("When saving a new variant without changing any filters, there should be no overlay", function(Given, When, Then){
		var oVM = "listreport---books--IDVariantManagementOfTable";
		var oVariantName = "New Variant";
		var oMDCChart = "listreport---books--bookChart";

		Given.iStartMyUIComponentInViewMode();
		Then.iShouldSeeNoOverlayOnTable();
		Then.iShouldSeeNoOverlayOnChart(oMDCChart);

		When.onFlVariantManagement.iOpenMyView(oVM);
		When.onFlVariantManagement.iOpenSaveView(oVM);
		When.onFlVariantManagement.iCreateNewVariant(oVM, oVariantName, false, false, false);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(oVM, oVariantName);
		Then.iShouldSeeNoOverlayOnTable();
		Then.iShouldSeeNoOverlayOnChart(oMDCChart);

		When.onFlVariantManagement.iOpenMyView(oVM);
		When.onFlVariantManagement.iOpenManageViews(oVM);
		When.onFlVariantManagement.iRemoveVariant(oVariantName);
		When.onFlVariantManagement.iPressTheManageViewsSave(oVM);
		Then.iShouldSeeNoOverlayOnTable();
		Then.iShouldSeeNoOverlayOnChart(oMDCChart);
		Then.iTeardownMyUIComponent();
	});

	opaTest("When adding a new filter via the AF dialog, there should be no overlay", function(Given, When, Then) {
		var oFilterBar = "listreport---books--booksFilterBar";
		var oMDCChart = "listreport---books--bookChart";

		Given.iStartMyUIComponentInViewMode();

		When.onTheMDCFilterBar.iPersonalizeFilter(oFilterBar, {
			Books: [
				"Author ID", "Title", "Stock range", "Language", "Genre", "Sub Genre", "Book ID" //Book ID is a new filter
			]
		});

		Then.iShouldSeeNoOverlayOnTable();
		Then.iShouldSeeNoOverlayOnChart(oMDCChart);
		Then.iTeardownMyUIComponent();
	});
});
