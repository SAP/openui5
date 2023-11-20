sap.ui.define([
	"sap/ui/demo/iconexplorer/model/formatter",
	"sap/ui/demo/iconexplorer/controller/BaseController"
], function(formatter, BaseController) {
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
				}.bind(oSearchField)
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
		 * Navigate to the selected icon font
		 * @param {sap.ui.base.Event} oEvent the press event
		 * @public
		 */
		onTitleLinkPress: function (oEvent) {
			var sSelectedFont = oEvent.getSource().getCustomData().length && oEvent.getSource().getCustomData()[0].getValue();

			this.getRouter().navTo("overview", {
				fontName : sSelectedFont
			});
		}
	});
});