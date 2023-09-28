sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/filterbar/vh/FilterBar",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/MessageToast",
	"sap/m/Table",
	"sap/m/Text",
	"delegates/odata/v4/FieldBaseDelegate", // to have it loaded before rendering starts
	"sap/ui/mdc/field/FieldMultiInput", // to have it loaded before rendering starts
	"sap/m/Token", // to have it loaded before rendering starts
	"sap/m/ExpandableText", // to have it loaded before rendering starts
	"sap/ui/mdc/enums/FilterBarValidationStatus",
	'sap/base/Log'
], function (Controller, UIComponent, FilterField, FilterBar, Column, ColumnListItem, MessageToast, Table, Text, FieldBaseDelegate, FieldMultiInput, Token, ExpandableText, FilterBarValidationStatus, Log) {

	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Books", {

		onInit: function () {
			this.byId("bookChart").attachSelectionDetailsActionPressed(function(oEvent) {
				MessageToast.show(oEvent.getParameter("action").getText() + " is pressed" + "\n " + oEvent.getParameter("itemContexts").length + " items selected" + "\n level is: " + oEvent.getParameter("level"));
			});
		},

		onSearch: function(oEvent) {
			Log.info("--> 'search' reason: " + oEvent.getParameter("reason"));
		},

		onStateChanged: function(oEvent) {

			var oView = this.getView();
			var oFilterBar = oView.byId("booksFilterBar");
			if (oFilterBar) {
				var oDelegate = oFilterBar._oDelegate;
				if (oDelegate && !oEvent.getParameter("isExpanded")) {
						var mStatus = oDelegate.determineValidationState(oFilterBar);
						var oText = oView.byId("errorTextCollapsed");
						if (oText) {
							var sErrorText = "";
							if (mStatus === FilterBarValidationStatus.FieldInErrorState) {
								sErrorText = oFilterBar.getText("filterbar.VALIDATION_ERROR");
							} else if (mStatus === FilterBarValidationStatus.RequiredHasNoValue) {
								sErrorText = oFilterBar.getText("filterbar.REQUIRED_FILTER_VALUE_MISSING");
							}

							if (sErrorText) {
								sErrorText = "\u00a0\u00a0" + sErrorText.replace("\n", "");
							}

							oText.setText(sErrorText);

							if (oText.$()) {
								oText.$().css("color", "red");
							}
						}
				} else {
					oFilterBar.setFocusOnFirstErroneousField();
				}
			}
		},

		onAfterRendering: function(oEvent) {
			var oText = this.getView().byId("errorTextCollapsed");
			if (oText && !oText.__formerOnAfterRendering) {
				oText.__formerOnAfterRendering = oText.onAfterRendering;
				oText.onAfterRendering = function() {
					oText.__formerOnAfterRendering();
					if (oText.$()) {
						oText.$().css("color", "red");
					}
				};
			}
		},

		onFiltersChanged: function(oEvent) {
			var oText = this.getView().byId("statusTextExpanded");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersTextExpanded);
			}

			oText = this.getView().byId("statusTextCollapsed");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersText);
			}
		},

		onAddButtonPress: function (oEvent) {
			UIComponent.getRouterFor(this).navTo("bookdetails", {
				bookId: "add"
			});
		},

		onRowPress: function (oEvent) {
			var oContext = oEvent.getParameter("bindingContext") || oEvent.getSource().getBindingContext();

			UIComponent.getRouterFor(this).navTo("bookdetails", {
				bookId: oContext.getProperty("ID")
			});

		}
	});
});
