sap.ui.define([
	"sap/ui/demo/iconexplorer/model/formatter",
	"sap/ui/demo/iconexplorer/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/VersionInfo"
], function(formatter, BaseController, Filter, FilterOperator, VersionInfo) {
	"use strict";

	return BaseController.extend("sap.ui.demo.iconexplorer.controller.Home", {

		formatter:formatter,

		onInit: function () {
			// search in tags and icon string for the global search
			var oSearchField = this.byId("search");
			oSearchField.setFilterFunction(function (sValue, oControl) {
				var oContext = oControl.getBindingContext().getObject();

				return !!(oContext.name.indexOf(sValue) >= 0 || oContext.tagString.indexOf(sValue) >= 0);
			});

			oSearchField.setValueHelpIconSrc("sap-icon://search");
			oSearchField.addEventDelegate({
				// re-open suggestions when pressing inside the search field again
				ontap: function (oEvent) {
					// open the suggestion popup when search value is valid
					if (this.getValue().length >= this.getStartSuggestion()) {
						this._oSuggestionPopup.open();
					}
				}.bind(oSearchField),
				oninput: function () {
					this.applyFilters();
				}.bind(this)
			});

		},

		/**
		 * Navigate to the selected icon font and preselect the icon
		 * @param {sap.ui.base.Event} oEvent the suggestionItemSelected event
		 * @public
		 */
		onSuggestionSelect: function(oEvent){
			var sSearch = oEvent.getSource().getValue(),
				oBindingContext = oEvent.getParameter("selectedRow").getBindingContext().getObject();

			this.getRouter().navTo("overview",{
				fontName : oBindingContext.font,
				query: {
					search: sSearch,
					icon: oBindingContext.name
				}
			});
		},
		/**
		 * Navigate to the selected icon font and preselect the icon when pressing enter
		 * @param {sap.ui.base.Event} oEvent the enter event
		 * @public
		 */
		onEnter: function(oEvent){
			var oInput = oEvent.getSource(),
				aVisibleSuggestions = oEvent.getSource().getSuggestionRows().filter(function (oRow) {
					return oRow.getVisible();
				}),
				oBindingContext;

			if (oInput.getValue().length >= oInput.getStartSuggestion() && aVisibleSuggestions.length) {
				oBindingContext = aVisibleSuggestions[0].getBindingContext().getObject();
				this.getRouter().navTo("overview",{
					fontName : oBindingContext.font,
					query: {
						icon: oBindingContext.name
					}
				});
			}
		},

		/**
         * Triggered on each checkbox de/selection.
         */
		onCheckBoxSelect: function () {
			this.applyFilters();
		},

		/**
         * Applies filters depending on the selected checkboxes.
         */
		applyFilters: function () {
			var oView = this.getView(),
				aLibraryFilters = [],
				oSuggestionInput = oView.byId("search"),
				oSuggestionRowBinding = oSuggestionInput.getBinding("suggestionRows"),
				sSearchValue = oSuggestionInput.getValue(),
				aAllFilters = [];

			// Check each checkbox's state and add corresponding filters
			if (oView.byId("cbSAPIconsTNT").getSelected()) {
				aLibraryFilters.push(new Filter("font", FilterOperator.EQ, "SAP-icons-TNT"));
			}

			if (oView.byId("cbSAPIcons").getSelected()) {
				aLibraryFilters.push(new Filter("font", FilterOperator.EQ, "SAP-icons"));
			}

			if (oView.byId("cbInfoSAPBusinessSuite").getSelected()) {
				aLibraryFilters.push(new Filter("font", FilterOperator.EQ, "BusinessSuiteInAppSymbols"));
			}

			aAllFilters = [new Filter({
				filters: aLibraryFilters,
				or: true
			})];

			if (aLibraryFilters.length > 0 && sSearchValue.length > 0) {
				aAllFilters.push(new Filter("tagString", FilterOperator.Contains, sSearchValue));
			}

			oSuggestionRowBinding.filter(aAllFilters);

			return null;
		}
	});
});