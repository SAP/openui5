sap.ui.define(['sap/ui/test/Opa5', 'sap/ui/test/matchers/AggregationLengthEquals', 'sap/ui/test/matchers/PropertyStrictEquals'],
	function(Opa5, AggregationLengthEquals, PropertyStrictEquals) {
	"use strict";

	return Opa5.extend("sap.ui.demo.mdtemplate.test.integration.assertion.NavigationAssertion", {
		iShouldSeeTheObjectList : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				success : function (oList) {
					ok(oList, "Found the object List");
				}
			});
		},

		theObjectPageShowsTheFirstObject : function () {
			return this.waitFor({
				controlType : "sap.m.ObjectHeader",
				viewName : "Detail",
				matchers : [ new PropertyStrictEquals({name : "title", value : "Object 1"}) ],
				success : function () {
					ok(true, "was on the first object page");
				}
			});
		},

		theObjectListShouldHave9Entries : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				matchers : [ new AggregationLengthEquals({name : "items", length : 9}) ],
				success : function (oList) {
					strictEqual(oList.getItems().length, 9, "The list has 9 items");
				},
				errorMessage : "List does not have 9 entries."
			});
		},

		iShouldBeOnPage : function (sViewName, sTitleName) {
			return this.waitFor({
				controlType : "sap.m.ObjectHeader",
				viewName : sViewName,
				matchers : [ new PropertyStrictEquals({name : "title", value : sTitleName}) ],
				success : function (aControls) {
					strictEqual(aControls.length, 1, "found only one Objectheader with the object name");
					ok(true, "was on the " + sTitleName + " " + sViewName + " page");
				},
				errorMessage : "We are not on " + sTitleName
			});
		},

		iShouldBeOnTheObject3Page : function () {
			return this.iShouldBeOnPage("Detail", "Object 3");
		},

		iShouldBeOnTheObject1Page : function () {
			return this.iShouldBeOnPage("Detail", "Object 1");
		},
		
		iShouldSeeTheObjectLineItemsList : function () {
			return this.waitFor({
				id : "lineItemsList",
				viewName : "Detail",
				success : function (oList) {
					ok(oList, "Found the line items list.");
				}
			});
		},
		
		theLineItemsListShouldHave4Entries : function () {
			return this.waitFor({
				id : "lineItemsList",
				viewName : "Detail",
				matchers : [ new AggregationLengthEquals({name : "items", length : 4}) ],
				success : function (oList) {
					ok(true, "The list has 4 items");
				},
				errorMessage : "The list does not have 4 items."
			});
		},
		
		theFirstLineItemHasIDLineItemID_1 : function () {
			return this.waitFor({
				id : "lineItemsList",
				viewName : "Detail",
				matchers : [ new AggregationLengthEquals({name : "items", length : 4}) ],
				success : function (oList) {
					var oFirstItem = oList.getItems()[0];
					strictEqual(oFirstItem.getBindingContext().getProperty('LineItemID'), "LineItemID_1", "The first line item has Id 'LineItemID_1'");
				},
				errorMessage : "The first line item does not have Id 'LineItemID_1'."
			});
		},
		
		theObject3ShouldBeSelectedInTheMasterList : function() {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				matchers : [ new AggregationLengthEquals({name : "items", length : 9}) ],
				success : function (oList) {
					strictEqual(oList.getSelectedItem().getTitle(), "Object 3", "Object 3 is selected");
				},
				errorMessage : "Object 3 is not selected."
			});
		},
		
		iShouldBeOnTheLineItem1Page : function() {
			return this.iShouldBeOnPage("LineItem", "Line Item: LineItemID_1");
		},
		
		theLineItemNavigationButtonHasCorrectEnabledState : function( sName, sIcon, bEnabled) {
			var sSuccessMessage = bEnabled ? "' button is enabled." : "' button is disabled.",
				sErrorMessage = bEnabled ? "' button is disabled." : "' button is enabled.";
			
			return this.waitFor({
				controlType : "sap.m.Button",
				viewName : "LineItem",
				matchers : [ new PropertyStrictEquals({ name : "icon", value : sIcon }) ],
				success : function (aButtons) {
					strictEqual(aButtons[0].getEnabled(), bEnabled, "'" + sName + sSuccessMessage);
				},
				errorMessage : "'" + sName + sErrorMessage
			});
		},
		
		thePreviousButtonIsDisabled : function() {
			return this.theLineItemNavigationButtonHasCorrectEnabledState('Previous', 'sap-icon://up', false );
		},
		
		thePreviousButtonIsEnabled : function() {
			return this.theLineItemNavigationButtonHasCorrectEnabledState('Previous', 'sap-icon://up', true );
		},
		
		theNextButtonIsEnabled : function() {
			return this.theLineItemNavigationButtonHasCorrectEnabledState('Next', 'sap-icon://down', true );
		},
		
		iShouldBeOnTheLineItem2Page : function() {
			return this.iShouldBeOnPage("LineItem", "Line Item: LineItemID_2");
		},

		iShouldSeeTheEmptyPage : function () {
			return this.waitFor({
				viewName : "NotFound",
				id : "notFoundPage",
				success : function (oPage) {
					strictEqual(oPage.getTitle(), oPage.getModel("i18n").getResourceBundle().getText("notFoundTitle"), "was on the empty page");
				},
				errorMessage: "did not reach the empty page"
			});
		},

		theTextShouldSayResourceNotFound : function () {
			return this.waitFor({
				viewName: "NotFound",
				id: "notFoundText",
				success: function (oText) {
					strictEqual(oText.getText(), oText.getModel("i18n").getResourceBundle().getText("notFoundText"), "did show the correct not found text");
				},
				errorMessage: "did not display the resource not found text"
			});
		}
		
	});
}, /* bExport= */ true);