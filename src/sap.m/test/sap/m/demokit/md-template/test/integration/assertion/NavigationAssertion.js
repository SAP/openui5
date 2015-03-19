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
				},
				errorMessage : "Object list was not found."
			});
		},

		theObjectPageShowsTheFirstObject : function () {
			return this.waitFor({
				controlType : "sap.m.ObjectHeader",
				viewName : "Detail",
				matchers : [ new PropertyStrictEquals({name : "title", value : "Object 1"}) ],
				success : function () {
					ok(true, "was on the first object page");
				},
				errorMessage : "First object is not shown"
			});
		},

		theObjectListShouldHave10Entries : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				matchers : [ new AggregationLengthEquals({name : "items", length : 10}) ],
				success : function (oList) {
					strictEqual(oList.getItems().length, 10, "The list has 10 items");
				},
				errorMessage : "List does not have 10 entries."
			});
		},
		
		theMasterPageHeaderShouldDisplay20Entries : function () {
			return this.waitFor({
				id : "page",
				viewName : "Master",
				matchers : [ new PropertyStrictEquals({name : "title", value : "Objects (20)"}) ],
				success : function (oList) {
					ok(true, "The master page header displays 20 items");
				},
				errorMessage : "The  master page header does not display 20 items."
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

		iShouldBeOnTheObjectNPage : function (iObjIndex) {
			return this.iShouldBeOnPage("Detail", "Object " + iObjIndex);
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
		
		theLineItemsHeaderShouldDisplay4Entries : function () {
			return this.waitFor({
				id : "lineItemsHeader",
				viewName : "Detail",
				matchers : [ new PropertyStrictEquals({name : "text", value : "Line Items (4)"}) ],
				success : function (oList) {
					ok(true, "The line item list displays 4 items");
				},
				errorMessage : "The line item list does not display 4 items."
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

		theObjectNShouldBeSelectedInTheMasterList : function(iObjIndex) {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				matchers : [ new AggregationLengthEquals({name : "items", length : 10}) ],
				success : function (oList) {
					strictEqual(oList.getSelectedItem().getTitle(), "Object " + iObjIndex, "Object 3 is selected");
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

		iShouldSeeTheNotFoundPage : function () {
			return this.waitFor({
				//controlType : "sap.m.MessagePage"
				id : "notFoundPage",
				viewName : "NotFound",
				success : function (oPage) {
					// workaround, we currently cannot test not loaded controls in Opa, awaiting fix
					strictEqual(oPage.getMetadata().getName(), "sap.m.MessagePage", "shows the message page");
				},
				errorMessage: "did not reach the empty page"
			});
		},

		theNotFoundPageShouldSayResourceNotFound : function () {
			return this.waitFor({
				id : "notFoundPage",
				viewName : "NotFound",
				success: function (oPage) {
					strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("notFoundTitle"), "the not found text is shown as title");
					strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("notFoundText"), "the resource not found text is shown");
				},
				errorMessage: "did not display the resource not found text"
			});
		},

		iShouldSeeTheObjectNotFoundPage : function () {
			return this.waitFor({
				//controlType : "sap.m.MessagePage"
				id : "detailObjectNotFoundPage",
				viewName : "DetailObjectNotFound",
				success : function (oPage) {
					// workaround, we currently cannot test not loaded controls in Opa, awaiting fix
					strictEqual(oPage.getMetadata().getName(), "sap.m.MessagePage", "shows the message page");
				},
				errorMessage: "did not reach the empty page"
			});
		},

		theNotFoundPageShouldSayObjectNotFound : function () {
			return this.waitFor({
				id : "detailObjectNotFoundPage",
				viewName : "DetailObjectNotFound",
				success: function (oPage) {
					strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("detailTitle"), "the object text is shown as title");
					strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("noObjectFoundText"), "the object not found text is shown");
				},
				errorMessage: "did not display the object not found text"
			});
		},

		iShouldSeeTheLineItemNotFoundPage : function () {
			return this.waitFor({
				//controlType : "sap.m.MessagePage"
				id : "lineItemNotFoundPage",
				viewName : "LineItemNotFound",
				success : function (oPage) {
					// workaround, we currently cannot test not loaded controls in Opa, awaiting fix
					strictEqual(oPage.getMetadata().getName(), "sap.m.MessagePage", "shows the message page");
				},
				errorMessage: "did not reach the empty page"
			});
		},

		theListShouldHaveNoSelection : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				success: function (oList) {
					strictEqual(oList.getSelectedItems().length, 0, "the list selection is removed");
				},
				errorMessage: "list selection was not removed"
			});
		},

		theNotFoundPageShouldSayLineItemNotFound : function () {
			return this.waitFor({
				id : "lineItemNotFoundPage",
				viewName : "LineItemNotFound",
				success: function (oPage) {
					strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("lineItemTitle"), "the line item text is shown as title");
					strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("noLineItemFoundText"), "the line item not found text is shown");
				},
				errorMessage: "did not display the object not found text"
			});
		},

		theListShouldSayResourceNotFound : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				success: function (oList) {
					strictEqual(oList.getNoDataText(), oList.getModel("i18n").getProperty("masterListNoDataText"), "the list should show the no objects available text");
				},
				errorMessage: "list does not show the no objects available text"
			});
		},

		iShouldSeeTheNoDataTextForNoSearchResults : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				success: function (oList) {
					strictEqual(oList.getNoDataText(), oList.getModel("i18n").getProperty("masterListNoDataWithFilterOrSearchText"), "the list should show the no data text for search and filter");
				},
				errorMessage: "list does not show the no data text for search and filter"
			});
		},
		
		iShouldSeeTheHashForObjectN : function (iObjIndex) {
			return this.waitFor({
				success : function () {
					var oHashChanger = Opa5.getHashChanger(),
						sHash = oHashChanger.getHash();
					strictEqual(sHash, "object/ObjectID_" + iObjIndex, "The Hash is not correct");
				},
				errorMessage : "The Hash is not Correct!"
			});
		},
		
		iShouldSeeAnEmptyHash : function () {
			return this.waitFor({
				success : function () {
					var oHashChanger = Opa5.getHashChanger(),
						sHash = oHashChanger.getHash();
					strictEqual(sHash, "", "The Hash should be empty");
				},
				errorMessage : "The Hash is not Correct!"
			});
		}
	});
}, /* bExport= */ true);
