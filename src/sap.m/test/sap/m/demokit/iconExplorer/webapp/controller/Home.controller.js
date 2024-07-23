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
			this._oSearchField = this.byId("search");
			this._oSearchField.setFilterFunction(function (sValue, oControl) {
				var oContext = oControl.getBindingContext().getObject();

				return !!(oContext.name.indexOf(sValue) >= 0 || oContext.tagString.indexOf(sValue) >= 0);
			});

			this._oSearchField.setValueHelpIconSrc("sap-icon://search");
			this._oSearchField.addEventDelegate({
				// re-open suggestions when pressing inside the search field again
				ontap: function (oEvent) {
					// open the suggestion popup when search value is valid
					if (this.getValue().length >= this.getStartSuggestion()) {
						this._oSuggestionPopup.open();
					}
				}.bind(this._oSearchField),
				oninput: function () {
					this.applyFilters();
				}.bind(this)
			});

			this.getRouter().attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		},

		onBeforeRouteMatched : function () {
			this._bNavigatedFromTag = false;
		},

		/**
		 * Navigate to the selected icon font and preselect the icon
		 * @param {sap.ui.base.Event} oEvent the suggestionItemSelected event
		 * @public
		 */
		onSuggestionSelect: function(oEvent){
			var sSearch = oEvent.getSource().getValue(),
				oBindingContext = oEvent.getParameter("selectedRow").getBindingContext().getObject();

			if (this._bNavigatedFromTag) {
				return;
			}

			this.getRouter().navTo("overview",{
				fontName : oBindingContext.font,
				query: {
					search: sSearch,
					icon: oBindingContext.name
				}
			});
		},

		onTokenPress: function (oEvent) {
			var oTarget = oEvent.getSource(),
				oRow = oTarget.getParent().getParent(),
				oBindingContext = oRow.getBindingContext().getObject(),
				sSearch = this._oSearchField.getValue(),
				sTag = oTarget.getText();

			this.getRouter().navTo("overview",{
				fontName : oBindingContext.font,
				query: {
					search: sSearch,
					tag: sTag
				}
			});

			this._bNavigatedFromTag = true;
		},

		/**
		 * Navigate to the selected icon font and preselect the icon when pressing enter
		 * @param {sap.ui.base.Event} oEvent the enter event
		 * @public
		 */
		onEnter: function(oEvent){
			var oInput = oEvent.getSource(),
				sSearch = oEvent.getSource().getValue(),
				aVisibleSuggestions = oEvent.getSource().getSuggestionRows().filter(function (oRow) {
					return oRow.getVisible();
				}),
				oBindingContext;

			if (oInput.getValue().length >= oInput.getStartSuggestion() && aVisibleSuggestions.length) {
				oBindingContext = aVisibleSuggestions[0].getBindingContext().getObject();
				this.getRouter().navTo("overview",{
					fontName : oBindingContext.font,
					query: {
						search: sSearch,
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
				inputFilters = [],
				oSuggestionInput = oView.byId("search"),
				oSuggestionRowBinding = oSuggestionInput.getBinding("suggestionRows"),
				sSearchValue = oSuggestionInput.getValue(),
				aAllFilters = [];

			// Check each checkbox's state and add corresponding filters
			if (oView.byId("cbSAPIcons").getSelected()) {
				aAllFilters.push(new Filter("font", FilterOperator.EQ, "SAP-icons"));
			}

			if (oView.byId("cbSAPIconsTNT").getSelected()) {
				aAllFilters.push(new Filter("font", FilterOperator.EQ, "SAP-icons-TNT"));
			}

			if (oView.byId("cbInfoSAPBusinessSuite").getSelected()) {
				aAllFilters.push(new Filter("font", FilterOperator.EQ, "BusinessSuiteInAppSymbols"));
			}

			if (aAllFilters.length > 0 && sSearchValue.length > 0) {
				// Filter icons, where 'name' or 'tag' contains the provided input value
				inputFilters = (new Filter({
					filters: [
						new Filter("tagString", FilterOperator.Contains, sSearchValue),
						new Filter("name", FilterOperator.Contains, sSearchValue)
					],
					or: true
				}));
			}
			aAllFilters.push(inputFilters);

			oSuggestionRowBinding.filter(aAllFilters);

			return null;
		}
	});
});