sap.ui.define([
	'jquery.sap.global',
	'sap/ui/model/json/JSONModel',
	"sap/ui/demo/iconexplorer/model/formatter",
	"sap/ui/demo/iconexplorer/controller/BaseController"
], function (jQuery, JSONModel, formatter, BaseController ) {
	"use strict";

	return BaseController.extend("sap.ui.demo.iconexplorer.controller.Home", {

		formatter:formatter,

		onInit: function () {
			// model used to manipulate control states
			var oViewModel = new JSONModel({
				sapui5: sap.ui.versioninfo.libraries.some(function (oLib) { return oLib.name === "sap.ushell"; }),
				searchBackground: "image/" + (sap.ui.Device.system.desktop ? "IcoExp_M_and_L.jpg" : "IcoExp_S.jpg" ),
				imagePath: "image/" + "logo_sap.png"
			});
			this.setModel(oViewModel, "view");

			// search in tags and icon string for the global search
			var oSearchField = this.byId("search");
			oSearchField.setFilterFunction(function (sValue, oControl) {
				var oContext = oControl.getBindingContext().getObject();

				return !!(oContext.name.indexOf(sValue) >= 0 || oContext.tagString.indexOf(sValue) >= 0);
			});

			var getValueHelpIcon = oSearchField._getValueHelpIcon();
			if (getValueHelpIcon) {
				getValueHelpIcon.setSrc("sap-icon://search");
			}

			oSearchField.addEventDelegate({
				// add clearIcon to the search field
				onAfterRendering: function () {
					// create a new icon once
					if (!this.__clearIcon) {
						this.__clearIcon = new sap.ui.core.Icon(this.getId() + "-__clearIcon", {
							src : "sap-icon://sys-cancel",
							press : function (oEvent) {
								this.setValue("");
								this.__clearIcon.$().addClass("sapMSFR");
								this.closeSuggestions();
								//activate press only for the icon, not for the whole input field
								oEvent.cancelBubble();
							}.bind(this)
						}).addStyleClass("sapMInputValHelpInner sapMSFB sapMSFR");
						//add Icon to control tree
						this.addDependent(this.__clearIcon);
					}
					// Create new div container
					this.$().append('<div class="sapMInputValHelp inputClear" tabindex="-1"></div>');
					var oNode = this.$().find(".inputClear")[0];
					// render icon into created div
					var oRenderManager = sap.ui.getCore().createRenderManager();
					oRenderManager.renderControl(this.__clearIcon);
					oRenderManager.flush(oNode);
					oRenderManager.destroy();
				//this pointer needs to point to the searchField
				}.bind(oSearchField),

				// re-open suggestions when pressing inside the search field again
				ontap: function (oEvent) {
					// skip when clicked on an icon
					if (jQuery(oEvent.target).control(0) instanceof sap.ui.core.Icon) {
						return;
					}
					// open the suggestion popup when search value is valid
					if (this.getValue().length >= this.getStartSuggestion()) {
						this._oSuggestionPopup.open();
					}
				}.bind(oSearchField)
			});
		},

		/**
		 * Controls the visibility of clearIcon in searchField by enabling CSS classes
		 * depending on value of input field
		 * @param {sap.ui.base.Event} oEvent the liveChange event of input field
		 * @public
		 */
		onSearch : function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oClearIcon = this.byId("search-__clearIcon");

			oClearIcon.$().toggleClass("sapMSFR", !sValue);
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
