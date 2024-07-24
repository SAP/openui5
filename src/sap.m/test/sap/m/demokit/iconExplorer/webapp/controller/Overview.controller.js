sap.ui.define([
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Token",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/IconPool",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters",
	"sap/ui/demo/iconexplorer/controller/BaseController",
	"sap/ui/demo/iconexplorer/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/documentation/sdk/controller/util/ThemePicker"
], function(
	Label,
	MessageToast,
	Token,
	Device,
	Element,
	Fragment,
	IconPool,
	Theming,
	Parameters,
	BaseController,
	formatter,
	Filter,
	FilterOperator,
	JSONModel,
	ThemePicker
) {
	"use strict";

	var TYPING_DELAY = 200; // ms

	return BaseController.extend("sap.ui.demo.iconexplorer.controller.Overview", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the overview controller is instantiated.
		 * @public
		 */
		onInit : function () {
			var oViewModel,
				oTagModel,
				sThemeKey = ThemePicker._oConfigUtil.getCookieValue("appearance") || "light";

				this._oPreviousQueryContext = {};
			this._oCurrentQueryContext = null;

			// model used to manipulate control states
			oViewModel = new JSONModel({
				growingThreshold : 200,
				iconFilterCount: this.getResourceBundle().getText("overviewTabAllInitial"),
				allIconsCount: 99,
				overviewNoDataText : this.getResourceBundle().getText("overviewNoDataText"),
				SelectedCopyMode: "uri",
				SelectedTheme: sThemeKey,
				CopyModeCollection: [
					{
						"CopyModeId": "uri",
						"Name": "URI"
					},
					{
						"CopyModeId": "sym",
						"Name": "Symbol"
					},
					{
						"CopyModeId": "uni",
						"Name": "Unicode"
					}
				],
				fontName: "",
				iconPath : "",
				busy : true,
				iconsFound: true
			});
			this.setModel(oViewModel, "view");

			// helper model for managing the tag selection
			oTagModel = new JSONModel();
			this.setModel(oTagModel, "tags");

			// register to both new and legacy pattern to not break bookmarked URLs
			this.getRouter().getRoute("legacy").attachPatternMatched(this._updateUI, this);
			this.getRouter().getRoute("overview").attachPatternMatched(this._updateUI, this);
		},

		/**
		 * Focus search field after rendering for immediate searchability
		 */
		onAfterRendering: function () {
			setTimeout(function () {
				this.byId("searchField").focus();
			}.bind(this),0);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
		onNavBack : function() {
			this.getRouter().navTo("home");
		},

		/**
		 * Event handler for the navigation button, opens a Popover with all fonts
		 * @public
		 * @param oEvent
		 */
		onSelectFont : function(oEvent) {
			var sFontName = this.getModel("view").getProperty("/fontName"),
				aListItems = this.byId("selectFontList").getItems(),
				oSelectedItem = aListItems.filter(function (oListItem) {
					return oListItem.getCustomData()[0].getValue() === sFontName;
				}).pop();

			this.byId("selectFont").openBy(oEvent.getSource());
			this.byId("selectFontList").setSelectedItem(oSelectedItem);
		},

		/**
		 * Event handler for pressing a list item in the navigation popover
		 * @public
		 * @param oEvent
		 */
		onChangeFont : function(oEvent) {
			var oListItem = oEvent.getParameter("selectedItem"),
				sSelectedFont = oListItem.getKey();

			this.getModel("view").setProperty("/busy", true, null, true);
			this.getRouter().navTo("overview", {
				query: {
					tab: this._oCurrentQueryContext.tab
				},
				fontName: sSelectedFont
			});
		},

		handleThemeSelection: function (oEvent) {
			var sTargetText = oEvent.getParameter("selectedItem").getKey();
			if (ThemePicker._getTheme()[sTargetText]) {
				ThemePicker._updateAppearance(sTargetText);
			}
		},

		handleCopyToClipboardClick: function (oEvent) {
			var oParent = oEvent.getSource().getParent(),
				// Depending where we press the copy button (from the Grid or Detail fragment), the
				// drill-down for the icon src is different
				sIconURI = oParent.getParent().getItems()[0].getSrc ? // Grid fragment
				oParent.getParent().getItems()[0].getSrc() : // Grid fragment
				oParent.getCells()[0].getSrc(), // Detail fragment
				sSelectedCopyMode = this.getModel("view").getProperty("/SelectedCopyMode");

			if (sSelectedCopyMode === "uri") {
				this._onCopyCodeToClipboard(sIconURI);
			} else if (sSelectedCopyMode === "sym") {
				this._onCopyIconToClipboard(sIconURI);
			} else if (sSelectedCopyMode === "uni") {
				this._onCopyUnicodeToClipboard(sIconURI.substr(sIconURI.lastIndexOf("/") + 1, sIconURI.length - 1));
			}
		},

		/**
		 * Triggered by the table's 'updateFinished' event and by the other tabs change: after new table
		 * data is available, this handler method updates the icon counter.
		 * @public
		 */
		onUpdateFinished : function () {
			var oResultItemsBinding = this.byId("results").getBinding(this._sAggregationName),
				iFilteredIcons = oResultItemsBinding.getLength(),
				iAllIcons = oResultItemsBinding.oList.length;

			function getRootControl(oEvent) {
				return Element.getElementById(oEvent.currentTarget.id);
			}
			// show total count of items
			this.getModel("view").setProperty("/iconFilterCount", iFilteredIcons, null, true);
			this.getModel("view").setProperty("/allIconsCount", iAllIcons, null, true);
			this.getModel("view").setProperty("/iconsFound", iFilteredIcons > 0, null, true);

			// register press callback for grid
			if (this._oCurrentQueryContext.tab === "grid") {
				if (!this._oPressLayoutCellDelegate) {
					this._oPressLayoutCellDelegate = {
						// tap: set selected and hoverable class
						ontap: function (oEvent) {
							var oBindingContext = oEvent.srcControl.getBindingContext();
							var oRoot = getRootControl(oEvent);

							// prevent setting styles on the favorite button
							if (oRoot.getMetadata().getName().search("ToggleButton") >= 0 || oEvent.srcControl.getMetadata().getName().search("ToggleButton") >= 0) {
								return;
							}

							// select the icon
							this._updateHash("icon", oBindingContext.getProperty("name"));
						}.bind(this),
						// touchstart: set item active and remove hoverable class, invert icon color
						ontouchstart: function (oEvent) {
							var oRoot = getRootControl(oEvent);

							oRoot.addStyleClass("sapMLIBActive");
							oRoot.removeStyleClass("sapMLIBHoverable");
							if (!this._sNormalIconColor) {
								this._sNormalIconColor = Element.closestTo(oRoot.$().find(".sapUiIcon")[0]).getColor();
							}
							oRoot.$().find(".sapMFlexItem > .sapUiIcon").get().forEach(function (oDomRef) {
								const oIcon = Element.closestTo(oDomRef);
								oIcon?.setColor(Parameters.get("sapUiTextInverted"));
							});
						}.bind(this),
						// touchend: remove active class, reset icon color
						ontouchend: function (oEvent) {
							var oRoot = getRootControl(oEvent);

							oRoot.removeStyleClass("sapMLIBActive");
							oRoot.$().find(".sapMFlexItem > .sapUiIcon").get().forEach(function (oDomRef) {
								const oIcon = Element.closestTo(oDomRef);
								oIcon?.setColor(this._sNormalIconColor);
							}.bind(this));
						}.bind(this)
					};
					// enter + space key: same as tab
					this._oPressLayoutCellDelegate.onsapenter = this._oPressLayoutCellDelegate.ontap;
				}

				// there is no addEventDelegateOnce so we remove and add it for all items
				var aItems = this.byId("results").getAggregation(this._sAggregationName);
				if (aItems) {
					aItems.forEach(function (oItem) {
						oItem.removeEventDelegate(this._oPressLayoutCellDelegate);
						oItem.addEventDelegate(this._oPressLayoutCellDelegate);
					}.bind(this));
				}
			}
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onSelectionChange : function (oEvent) {
			var sModelName = (this._oCurrentQueryContext.tab === "favorites" ? "fav" : undefined),
				oItem = oEvent.getParameter("listItem");

			this._updateHash("icon", oItem.getBindingContext(sModelName).getProperty("name"));
		},

		/**
		 * Event handler for changing the icon browse mode.
		 * We update the hash in case a new tab is selected.
		 * @param {sap.ui.base.Event} oEvent the selectionChange event of the SegmentedButton
		 */
		onSegmentSelected : function (oEvent){
			if (oEvent.getParameter("item").getKey() === "all") {
				this._updateHash("reset", "all");
			} else {
				this._updateHash("tab", oEvent.getParameter("item").getKey());
			}
		},

		formatToolbarTitleText : function (iconFilterCount) {
			if (this._oCurrentQueryContext?.tab === "favorites") {
				return this.getResourceBundle().getText("previewFavoritesResults") + " (" + iconFilterCount + ")";
			} else {
				return this.getResourceBundle().getText("previewSearchResults") + " (" + iconFilterCount + ")";
			}
		},

		/**
		 * Searches the icons and filters the bindings accordingly
		 * @param {sap.ui.base.Event} oEvent the liveChange event of the SearchField
		 * @public
		 */
		onSearch: function (oEvent) {
			this._updateHash("search", oEvent.getParameter("newValue"));
		},

		/**
		 * Event handler for the category selection
		 * @param {sap.ui.base.Event} oEvent the selectionChange event
		 */
		onSelectCategory : function (oEvent) {
			this._updateHash("cat", (oEvent.getParameter("selectedItem") ? oEvent.getParameter("selectedItem").getKey() : undefined));
		},

		/**
		 * Searches the icons for a single tag only and filters the bindings accordingly
		 * @param {sap.ui.base.Event} oEvent the liveChange event of the SearchField
		 * @public
		 */
		onTagSelect: function (oEvent) {
			this._updateHash("tag", oEvent.getParameter("selected") === false ? "" : oEvent.getSource().getText());
		},

		/**
		 * Toggles the favorite state of an icon when the user presses on the favorite button
		 * @param {sap.ui.base.Event} oEvent the press event of the ToggleButton
		 * @public
		 */
		onToggleFavorite: function (oEvent) {
			var sModelName = (this._oCurrentQueryContext.tab === "favorites" ? "fav" : undefined),
				oBindingContext = oEvent.getSource().getBindingContext(sModelName),
				sName = oBindingContext.getProperty("name"),
				oResourceBundle = this.getResourceBundle(),
				bFavorite = this.getModel("fav").toggleFavorite(oBindingContext);

			if (bFavorite) {
				MessageToast.show(oResourceBundle.getText("overviewFavoriteAdd", [sName]));
			} else {
				MessageToast.show(oResourceBundle.getText("overviewFavoriteRemove", [sName]));
			}
		},

		/**
		 * Switches between code and icon copy mode
		 * @param {sap.ui.base.Event} oEvent the select event of the RadioButtonGroup
		 */
		onCopySelect: function (oEvent) {
			var iIndex = oEvent.getParameter("selectedIndex");

			if (iIndex === 0) {
				this.byId("previewCopy").getContent()[0].setVisible(true);
				this.byId("previewCopy").getContent()[1].setVisible(false);
			} else {
				this.byId("previewCopy").getContent()[1].setVisible(true);
				this.byId("previewCopy").getContent()[0].setVisible(false);
			}
		},

		/**
		 * Copies the value of the code input field to the clipboard and displays a message
		 * @public
		 */
		onCopyCodeToClipboard: function () {
			var sIconSrc = this.byId("previewCopyCode").getValue();

			this._onCopyCodeToClipboard(sIconSrc);
		},

		/**
		 * Copies the unicode part from the input field to the clipboard and displays a message
		 * @public
		 */
		onCopyUnicodeToClipboard: function () {
			var sIconName = this.byId("preview").getBindingContext().getObject().name;

			this._onCopyUnicodeToClipboard(sIconName);
		},

		/**
		 * Copies the icon to the clipboard and displays a message
		 * @public
		 */
		onCopyIconToClipboard: function () {
			var sIconSrc = this.byId("previewCopyCode").getValue();

			this._onCopyIconToClipboard(sIconSrc);
		},

		/* =========================================================== */
		/* internal method                                             */
		/* =========================================================== */

		/**
		 * Copies the icon to the clipboard and displays a message
		 * @param {string} iconSrc the icon source string that has to be copied to the clipboard
		 * @private
		 */
		_onCopyIconToClipboard: function (iconSrc) {
			var	oResourceBundle = this.getResourceBundle(),
				sSuccessText, sExceptionText,
				sIcon = this.getModel().getUnicode(iconSrc);

			sSuccessText = oResourceBundle.getText("previewCopyToClipboardSuccess", [iconSrc]);
			sExceptionText = oResourceBundle.getText("previewCopyToClipboardFail", [iconSrc]);
			this._copyStringToClipboard(sIcon, sSuccessText, sExceptionText);
		},

		/**
		 * Copies the unicode part from the input field to the clipboard and displays a message
		 * @param {string} iconName the icon name string that has to be copied to the clipboard
		 * @private
		 */
		_onCopyUnicodeToClipboard: function (iconName) {
			var oResourceBundle = this.getResourceBundle(),
				sSuccessText, sExceptionText,
				sString = this.getModel().getUnicodeHTML(iconName);
			sString = sString.substring(2, sString.length - 1);
			sSuccessText = oResourceBundle.getText("previewCopyUnicodeToClipboardSuccess", [sString]);
			sExceptionText = oResourceBundle.getText("previewCopyUnicodeToClipboardFail", [sString]);
			this._copyStringToClipboard(sString, sSuccessText, sExceptionText);
		},

		/**
		 * Copies the value of the code input field to the clipboard and displays a message
		 * @param {string} iconSrc the icon source string that has to be copied to the clipboard
		 * @private
		 */
		_onCopyCodeToClipboard: function (iconSrc) {
			var oResourceBundle = this.getResourceBundle(),
				sSuccessText, sExceptionText;

			sSuccessText = oResourceBundle.getText("previewCopyToClipboardSuccess", [iconSrc]);
			sExceptionText = oResourceBundle.getText("previewCopyToClipboardFail", [iconSrc]);
			this._copyStringToClipboard(iconSrc, sSuccessText, sExceptionText);
		},

		/**
		 * Copies the string to the clipboard and displays a message
		 * @param {string} copyText the text string that has to be copied to the clipboard
		 * @private
		 */
		_copyStringToClipboard: function (copyText, successText, exceptionText) {
			var oTemp = document.createElement("input");

			try {
				document.body.append(oTemp);
				oTemp.value = copyText;
				oTemp.select();
				document.execCommand("copy");
				oTemp.remove();

				MessageToast.show(successText);
			} catch (oException) {
				MessageToast.show(exceptionText);
			}
		},

		/**
		 * Shows the selected item on the object page
		 * On phones an additional history entry is created
		 * @param {string} sIcon the icon name to be previewed
		 * @private
		 */
		_previewIcon : function (sIcon) {
			this.getModel().iconsLoaded().then(function () {
				var sPath = this.getModel().getIconPath(sIcon);

				if (sPath) {
					// bind the preview to the item path
					this.byId("preview").bindElement({
						path: sPath
					});

					// update the group information with a timeout as this task takes some time to calculate
					setTimeout(function () {
						var aGroups = this.getModel().getIconGroups(sIcon);
						this.byId("categoryInfo").setText(aGroups.join(", "));
					}.bind(this), 0);

					// update unicode info
					this.byId("unicodeInfo").setText(this.getModel().getUnicodeHTML(sIcon));
				}
			}.bind(this));
		},

		/**
		 * Updates the UI according to the hash
		 * @param {sap.ui.base.Event} oEvent the routing event
		 * @private
		 */
		_updateUI: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments"),
				sFontName = oArguments.fontName || "SAP-icons",
				oQuery = oArguments["?query"],
				bInitial = false,
				oViewModel = this.getModel("view");

			// set a default query object in case no hash is defined
			if (!oQuery) {
				oQuery = {
					tab: "grid"
				};
			}

			// keep the previous item if all tab (remove filters) has been pressed
			if (oQuery.tab === "all") {
				oQuery.tab = this._oPreviousQueryContext.tab;
			}

			if (oQuery.icon) {
				this.expandSidePanel();
			}

			// check tab value against an allowlist
			var aValidKeys = ["details", "grid", "favorites"];
			if (aValidKeys.indexOf(oQuery.tab) < 0) {
				oQuery.tab = "grid";
			}

			// store current context
			if (!this._oCurrentQueryContext) {
				bInitial = true;
			}
			this._oCurrentQueryContext = oQuery;

			// helper variables for updating the UI pieces
			var bFontChanged = sFontName !== oViewModel.getProperty("/fontName");
			var bTabChanged = this._oPreviousQueryContext.tab !== oQuery.tab;
			var bCategoryChanged = this._oPreviousQueryContext.cat !== oQuery.cat;
			var bSearchChanged = this._oPreviousQueryContext.search !== oQuery.search;
			var bTagChanged = this._oPreviousQueryContext.tag !== oQuery.tag;
			var bIconChanged = this._oPreviousQueryContext.icon !== oQuery.icon;

			this._sAggregationName = "items";

			this.getOwnerComponent().iconsLoaded().then(function () {
				// bind the view if the displayed icon font changes or is not set yet
				if (bFontChanged) {
					// avoid refresh of preview area when setting new properties since we hide it anyway
					this.byId("preview") && this.byId("preview").unbindElement();

					// store the current font name in the view model and set the path to the new font (async)
					oViewModel.setProperty("/fontName", sFontName, null, true);
					oViewModel.setProperty("/iconPath", (sFontName === "SAP-icons" ? "" : sFontName + "/"), null, true);

					// update the view to the new path
					this.getView().bindElement({
						path: "/" + sFontName,
						suspend: true
					});

					// set the font on the icon model
					this.getModel().setFont(sFontName);
					oViewModel.setProperty("/busy", false, null, true);
				}
				this.byId("layoutSelectionSB").setSelectedKey(oQuery.tab);
				if (bTabChanged) {
					var oResultContainer = this.byId("resultContainer");

					// uppercase first letter
					var sFragmentName = formatter.uppercaseFirstLetter(oQuery.tab);

					// first destroy old content, then add new content to the end of result container
					this._resultsLoaded = Promise.resolve(this._resultsLoaded)
						.catch(function() {})
						.then(function() {
							oResultContainer.getContent()[2] && oResultContainer.getContent()[2].destroy();
							// load the fragment only now
							return Fragment.load({
								id: this.getView().getId(),
								name: "sap.ui.demo.iconexplorer.view.browse." + sFragmentName,
								controller: this
							});
						}.bind(this))
						.then(function(oFragmentContent){
							oResultContainer.addContent(oFragmentContent);
						});

					var bCategoriesVisible = !(Device.system.phone || oQuery.tab == "favorites");
					this.byId("categorySelectionContainer").setVisible(bCategoriesVisible);
				}

				this._resultsLoaded.then(function() {
					// icon
					if (oQuery.icon && bIconChanged) {
						this._previewIcon(oQuery.icon);
						this.byId("preview").setVisible(true);
					} else if (!oQuery.icon) {
						if (bInitial) {
							this._previewIcon("sap-ui5");
						}
						this.byId("preview").setVisible(false);
					}

					// category
					this.byId("categorySelection").setSelectedKey(oQuery.cat || "all");
					if ((oQuery.cat || bCategoryChanged || bFontChanged) && oQuery.tab !== "favorites") {
						if (bInitial || bFontChanged || bTabChanged) {
							this._selectCategory(oQuery);
						} else {
							clearTimeout(this._iCategorySelectionTimeout);
							this._iCategorySelectionTimeout = setTimeout(function () {
								this._selectCategory(oQuery);
							}.bind(this), TYPING_DELAY);
						}
					}

					// search & tags
					this.byId("searchField").setValue(oQuery.search);
					if (bInitial || bFontChanged || bSearchChanged || bTagChanged || bTabChanged) {
						// search
						if (bInitial || bFontChanged || bTabChanged) {
							this._searchIcons(oQuery.search, oQuery.tag);
						} else {
							clearTimeout(this._iSearchTimeout);
							this._iSearchTimeout = setTimeout(function () {
								this._searchIcons(oQuery.search, oQuery.tag);
							}.bind(this), TYPING_DELAY);
						}

						// tags
						if (bInitial || bFontChanged || bTabChanged) {
							if (oQuery.tab === "favorites") {
								this._aCategoryTags = undefined;
							}
							this._updateTags(oQuery);
						} else {
							clearTimeout(this._iTagTimeout);
							this._iTagTimeout = setTimeout(function () {
								this._updateTags(oQuery);
							}.bind(this), TYPING_DELAY);
						}
					}
				}.bind(this));

			}.bind(this));
		},

		/**
		 * Updates the hash with the current UI state
		 * @param {string} [sKey] the key of the query to be updated
		 * @param {string} [sValue] the value of the query to be updated
		 * @private
		 */
		_updateHash: function (sKey, sValue) {
			var oQuery = {};

			// deep copy of the context
			if (this._oCurrentQueryContext.tab) {
				oQuery.tab = this._oCurrentQueryContext.tab;
			}
			if (this._oCurrentQueryContext.icon) {
				oQuery.icon = this._oCurrentQueryContext.icon;
			}
			if (this._oCurrentQueryContext.search) {
				oQuery.search = this._oCurrentQueryContext.search;
			}
			if (this._oCurrentQueryContext.cat) {
				oQuery.cat = this._oCurrentQueryContext.cat;
			}
			if (this._oCurrentQueryContext.tag) {
				oQuery.tag = this._oCurrentQueryContext.tag;
			}

			// explicit reset for tags and search when the all item was pressed
			if (sKey === "reset") {
				delete oQuery.tag;
				delete oQuery.search;
				delete oQuery.cat;
			} else {
				// override the key value pair passed in as parameters
				if (sKey && sValue) {
					oQuery[sKey] = sValue;
				}

				// reset tags under the following conditions
				// - navigating from or to favorite tab
				// - category was changed
				// - emtpy tag value
				if (this._oCurrentQueryContext.tab !== oQuery.tab  && (this._oCurrentQueryContext.tab === "favorites" || oQuery.tab === "favorites") ||
					this._oCurrentQueryContext.cat !== oQuery.cat ||
					sKey === "tag" && !sValue) {
					delete oQuery.tag;
				}

				// reset search if no value has been passed
				if (sKey === "search" && !sValue) {
					delete oQuery.search;
				}

				// reset icon if no value has been passed
				if (sKey === "icon" && !sValue) {
					delete oQuery.icon;
				}
			}

			// call route with query parameter
			this.getRouter().navTo("overview", {
				fontName: this.getModel("view").getProperty("/fontName"),
				query: oQuery
			});

			// store previous context
			this._oPreviousQueryContext = this._oCurrentQueryContext;
			// store the new context
			this._oCurrentQueryContext = oQuery;
		},

		/**
		 * Does the real search after a short delay to improve the perceived performance of the app
		 * The following search modes can apply depending on the parameter values
		 * - search, no tag: reset the filters
		 * - search, no tag: search for the string in the name OR the tags of the icons
		 * - no search, tag: search for the tag in the tags of the icons
		 * - search, tag: search for the tag in the tags of the icons AND search for the string in the name OR the tags of the icons
		 * @param {string} sSearchValue the search string
		 * @param {string} sTagValue the tag string
		 * @private
		 */
		_searchIcons : function (sSearchValue, sTagValue) {
			if (sSearchValue || sTagValue) {
				// only initialize the filters if needed to save some time
				var aFilters = [],
					oFilterTags = (sTagValue ? new Filter("tagString", FilterOperator.Contains, sTagValue) : undefined),
					oFilterSearchName = (sSearchValue ? new Filter("name", FilterOperator.Contains, sSearchValue) : undefined),
					fnUnicodeCustomFilter = (sSearchValue ? this._unicodeFilterFactory(sSearchValue) : undefined),
					oFilterSearchUnicode = (sSearchValue ? new Filter("name", fnUnicodeCustomFilter) : undefined),
					oFilterSearchTags = (sSearchValue ? new Filter("tagString", FilterOperator.Contains, sSearchValue) : undefined),
					oFilterSearchNameTags = (sSearchValue ? new Filter({
						filters: [oFilterSearchTags, oFilterSearchName, oFilterSearchUnicode],
						and: false
					}) : undefined);

				// search for name
				if (sSearchValue) {
					aFilters.push(oFilterSearchNameTags);
				}
				// search for tags
				if (sTagValue) {
					aFilters.push(oFilterTags);
				}
				if (aFilters.length <= 1) {
					// search or tag: just take the filter
					this._vFilterSearch = aFilters;
				} else {
					// search and tag: tags contain the tag value and search for name or tags
					this._vFilterSearch = [new Filter({
						filters: aFilters,
						and: true
					})];
				}
			} else {
				// reset search
				this._vFilterSearch = [];
			}

			// filter icon list
			this._resultsLoaded.then(function () {
				var oResultBinding = this.byId("results").getBinding(this._sAggregationName);
				if (oResultBinding !== undefined) {
					oResultBinding.filter(this._vFilterSearch);
					this.getModel("view").setProperty("/overviewNoDataText", this.getResourceBundle().getText("overviewNoDataWithSearchText"), null, true);
				}
			}.bind(this));
		},

		/**
		 * Factory that produces the custom filter for the given unicode query
		 * @param {string} query the query text that has been entered in the search field and contains the unicode character
		 * @return {function} the custom filter function that takes the name of the icon and returns true if the icon's unicode contains the query string
		 * @private
		 */
		_unicodeFilterFactory: function(query) {
			return function (name) {
				var sUnicode = this.getModel().getUnicodeHTML(name.toLowerCase());
				return sUnicode.indexOf(query) !== -1;
			}.bind(this);
		},

		/**
		 * Event handler for the category selection
		 * @param {object} oQuery the query object from the routing event
		 * @private
		 */
		_selectCategory: function (oQuery) {
			var sGroupPath = this.getModel().getGroupPath(oQuery.cat);

			// rebind the result set to the current group
			this.byId("results").bindAggregation(this._sAggregationName, {
				path: sGroupPath + "/icons",
				length: this.getModel("view").getProperty("/growingThreshold"),
				template: this.byId("results").getBindingInfo(this._sAggregationName).template.clone(),
				templateShareable: true,
				events: {
					change: this.onUpdateFinished.bind(this)
				},
				suspended: true
			});
			// apply filters
			this._resultsLoaded.then(function () {
				this.byId("results").getBinding(this._sAggregationName).filter(this._vFilterSearch);
			}.bind(this));

			// update tags
			this._aCategoryTags = this.getModel().getProperty(sGroupPath + "/tags");
			// update tag bar directly with all tags of this category when no search or tag is selected
			if (!oQuery.tag && !oQuery.search) {
				this._updateTagSelectionBar(this._aCategoryTags);
			}
		},

		/**
		 * updates the tags to the currently available binding contexts
		 * @param {Object} oQuery the current query state
		 * @private
		 */
		_updateTags: function (oQuery) {
			// caution: it is really important to use getCurrentContexts and not getContexts here as the later modifies the binding
			this._resultsLoaded.then(function () {
				var aContexts = this.byId("results").getBinding(this._sAggregationName).getCurrentContexts(),
					aAllTags = [],
					aCurrentTags = [],
					bTagVisible = false,
					sFontName = this.getModel("view").getProperty("/fontName"),
					i;

				// collect all current tags from the result list
				for (i = 0; i < aContexts.length; i++) {
					aAllTags = aAllTags.concat(aContexts[i].getProperty("tags").map(function(oItem) { return oItem.name; }));
				}

				// no category selected yet: use all tags
				if (!this._aCategoryTags) {
					this._aCategoryTags = this.getModel().getProperty("/" + sFontName + "/groups/0/tags");
				}

				// filter tags to the currently visible
				for (i = 0; i < this._aCategoryTags.length; i++) {
					if (aAllTags.indexOf(this._aCategoryTags[i].name) >= 0) {
						this._aCategoryTags[i].selected = (this._aCategoryTags[i].name === oQuery.tag);
						if (this._aCategoryTags[i].selected) {
							bTagVisible = true;
						}
						aCurrentTags.push(this._aCategoryTags[i]);
					}
				}

				// add current tag if it is not visible yet (tag bar only contains the top [x] tags)
				if (oQuery.tag && !bTagVisible) {
					aCurrentTags.push({
						selected : true,
						name : oQuery.tag
					});
				}

				// update model data and bind the tags
				this._updateTagSelectionBar(aCurrentTags);
			}.bind(this));
		},

		/**
		 * Binds tags to the tag selection bar and appends a label
		 * @param {object[]} aTags the tags to be bound
		 * @private
		 */
		_updateTagSelectionBar: function (aTags) {
			this.getModel("tags").setData(aTags);
			this.byId("tagSelection").bindAggregation("tokens", {
				path: "tags>/",
				length: 51,
				factory: this._tagSelectionFactory.bind(this)
			});
		},

		/**
		 * Factory function for filling the tag bar.
		 * First item is a label, then the tags are listed
		 * @param {string} sId the id for the control to be created
		 * @param {sap.ui.model.Context} oContext the binding context for the control to be created
		 * @return {sap.m.Label|sap.m.Token} the control for the toolbar
		 * @private
		 */
        _tagSelectionFactory: function (sId, oContext) {
			return new Token(sId, {
				text: "{tags>name}",
				press: [this.onTagSelect, this],
				selected: "{tags>selected}",
				ariaLabelledBy: this.byId("labelTags"),
				editable: false
			});
        },

		/**
		 * Expands the details view when icon is clicked.
		 */

		expandSidePanel: function() {
			var oSidePanelExpanded = this.byId("mySidePanel").getProperty("actionBarExpanded");

			if (!oSidePanelExpanded) {
				this.byId("mySidePanel").setProperty("actionBarExpanded", true);
			}

		}

	});
});
