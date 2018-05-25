sap.ui.define([
	"sap/ui/demo/iconexplorer/controller/BaseController",
	"sap/ui/core/IconPool",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/iconexplorer/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/m/MessageToast",
	"sap/m/Label",
	"sap/m/ToggleButton",
	"sap/m/library",
	"jquery.sap.global"
], function (BaseController, IconPool, JSONModel, formatter, Filter, FilterOperator, Device, MessageToast, Label, ToggleButton, mobileLibrary, $) {
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
				oTagModel;

			this._oPreviousQueryContext = {};
			this._oCurrentQueryContext = null;

			// model used to manipulate control states
			oViewModel = new JSONModel({
				growingThreshold : 200,
				iconFilterCount: this.getResourceBundle().getText("overviewTabAllInitial"),
				overviewNoDataText : this.getResourceBundle().getText("overviewNoDataText"),
				fontName: "",
				iconPath : "",
				busy : true
			});
			this.setModel(oViewModel, "view");

			// helper model for managing the tag selection
			oTagModel = new JSONModel();
			this.setModel(oTagModel, "tags");

			// Sets the current previewCopyIcon and the fontName when pressing an icon
			this.byId("previewCopyIcon").addEventDelegate({
				onAfterRendering: function () {
					var $previewCopyIcon = this.byId("previewCopyIcon").$(),
						sFontName = this.getModel("view").getProperty("/fontName");

					// always set current font family for the preview
					$previewCopyIcon.children("span").css("font-family", sFontName);
				}.bind(this)
			});

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
			var oListItem = oEvent.getParameter("listItem"),
				sSelectedFont = oListItem.getCustomData()[0].getValue();

			this.getModel("view").setProperty("/busy", true, null, true);
			this.getRouter().navTo("overview", {
				query: {
					tab: this._oCurrentQueryContext.tab
				},
				fontName: sSelectedFont
			});
			this.byId("selectFont").close();
		},

		/**
		 * Triggered by the table's 'updateFinished' event and by the other tabs change: after new table
		 * data is available, this handler method updates the icon counter.
		 * @public
		 */
		onUpdateFinished : function () {
			function getRootControl(oEvent) {
				if (oEvent.srcControl.getMetadata().getName().search("CustomListItem") >= 0) {
					// keyboard event, get child
					return oEvent.srcControl.getContent()[0];
				} else if (oEvent.srcControl.getMetadata().getName().search("VerticalLayout") >= 0) {
					// layout clicked, just return it
					return oEvent.srcControl;
				} else {
					// inner control clicked, return parent
					return oEvent.srcControl.getParent();
				}
			}
			// show total count of items
			this.getModel("view").setProperty("/iconFilterCount", this.byId("results").getBinding(this._sAggregationName).getLength(), null, true);
			// register press callback for grid and visual mode
			if (this._oCurrentQueryContext.tab === "grid" || this._oCurrentQueryContext.tab === "visual") {
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

							// reset previoulsy pressed item and store current item
							if (this._oPreviouslySelectedLayoutCell) {
								this._oPreviouslySelectedLayoutCell.removeStyleClass("sapMLIBSelected");
								this._oPreviouslySelectedLayoutCell.removeStyleClass("sapMLIBHoverable");
							}
							// set the LIB styles on the current cell
							oRoot.addStyleClass("sapMLIBSelected");

							this._oPreviouslySelectedLayoutCell = oRoot;
							oRoot.addStyleClass("sapMLIBHoverable");

							// select the icon
							this._updateHash("icon", oBindingContext.getProperty("name"));
						}.bind(this),
						// touchstart: set item active and remove hoverable class, invert icon color
						ontouchstart: function (oEvent) {
							var oRoot = getRootControl(oEvent);

							oRoot.addStyleClass("sapMLIBActive");
							oRoot.removeStyleClass("sapMLIBHoverable");
							if (!this._sNormalIconColor) {
								this._sNormalIconColor = oRoot.$().find(".sapUiIcon").control(0).getColor();
							}
							oRoot.$().find(".sapUiVltCell > .sapUiIcon").control().forEach(function (oIcon) {
								oIcon.setColor(sap.ui.core.theming.Parameters.get("sapUiTextInverted"));
							});
						}.bind(this),
						// touchend: remove active class, reset icon color
						ontouchend: function (oEvent) {
							var oRoot = getRootControl(oEvent);

							oRoot.removeStyleClass("sapMLIBActive");
							oRoot.$().find(".sapUiVltCell > .sapUiIcon").control().forEach(function (oIcon) {
								oIcon.setColor(this._sNormalIconColor);
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
		 * @param {sap.ui.base.Event} oEvent the tabSelect event of the IconTabBar
		 */
		onTabSelect : function (oEvent){
			if (oEvent.getParameter("selectedKey") === "all") {
				this._updateHash("reset", "all");
			} else {
				this._updateHash("tab", oEvent.getParameter("selectedKey"));
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
			this._updateHash("tag", oEvent.getParameter("pressed") === false ? "" : oEvent.getSource().getText());
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
			var sString = this.byId("previewCopyCode").getValue(),
				oResourceBundle = this.getResourceBundle(),
				sSuccessText, sExceptionText;

			sSuccessText = oResourceBundle.getText("previewCopyToClipboardSuccess", [sString]);
			sExceptionText = oResourceBundle.getText("previewCopyToClipboardFail", [sString]);
			this._copyStringToClipboard(sString, sSuccessText, sExceptionText);
		},

		/**
		 * Copies the unicode part from the input field to the clipboard and displays a message
		 * @public
		 */
		onCopyUnicodeToClipboard: function () {
			var oResourceBundle = this.getResourceBundle(),
				sSuccessText, sExceptionText,
				sIconName = this.byId("preview").getBindingContext().getObject().name,
				sString = this.getModel().getUnicodeHTML(sIconName);
			sString = sString.substring(2, sString.length - 1);
			sSuccessText = oResourceBundle.getText("previewCopyUnicodeToClipboardSuccess", [sString]);
			sExceptionText = oResourceBundle.getText("previewCopyUnicodeToClipboardFail", [sString]);
			this._copyStringToClipboard(sString, sSuccessText, sExceptionText);
		},

		/**
		 * Copies the icon to the clipboard and displays a message
		 * @public
		 */
		onCopyIconToClipboard: function () {
			var sString = this.byId("previewCopyCode").getValue(),
				oResourceBundle = this.getResourceBundle(),
				sSuccessText, sExceptionText,
				sIcon = this.getModel().getUnicode(sString);

			sSuccessText = oResourceBundle.getText("previewCopyToClipboardSuccess", [sString]);
			sExceptionText = oResourceBundle.getText("previewCopyToClipboardFail", [sString]);
			this._copyStringToClipboard(sIcon, sSuccessText, sExceptionText);
		},

		/**
		 * Shows a random icon in the preview pane
		 * @public
		 */
		onSurpriseMe: function () {
			var sFontName = this.getModel("view").getProperty("/fontName"),
				aIcons = this.getModel().getProperty("/" + sFontName + "/groups/0/icons"),
				oRandomItem = aIcons[Math.floor(Math.random() * aIcons.length)];

			this._updateHash("icon", oRandomItem.name);
		},

		/**
		 * Downloads the icon font relatively from the UI5 delivery
		 * @public
		 */
		onDownload: function () {
			var sFontName = this.getModel("view").getProperty("/fontName");
			mobileLibrary.URLHelper.redirect(sap.ui.require.toUrl("sap/ui/core") + "/themes/base/fonts/" + sFontName + ".ttf");
		},

		/* =========================================================== */
		/* internal method                                             */
		/* =========================================================== */

		/**
		 * Copies the string to the clipboard and displays a message
		 * @param {string} copyText the text string that has to be copied to the clipboard
		 * @private
		 */
		_copyStringToClipboard: function (copyText, successText, exceptionText) {
			var $temp = $("<input>");

			try {
				$("body").append($temp);
				$temp.val(copyText).select();
				document.execCommand("copy");
				$temp.remove();

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

					var sIconSymbol = this.getModel().getUnicodeHTML(sIcon);
					this.byId("previewCopyIcon").setHtmlText("<span>" + sIconSymbol + "</span>" + sIcon);

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

			// check tab value against a whitelist
			var aValidKeys = ["details", "grid", "visual", "favorites"];
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

				// tab
				if (!this.byId("iconTabBar")) {
					return;
				}
				this.byId("iconTabBar").setSelectedKey(oQuery.tab);
				if (bTabChanged) {
					var oContent = this.byId("resultContainer").getContent();

					// destroy last content item (1 is the search bar and 2 is the tags bar)
					if (oContent.length === 3) {
						oContent.pop().destroy();
					}
					// uppercase first letter
					var sFragmentName = formatter.uppercaseFirstLetter(oQuery.tab);

					// add new content to the end of result container
					var oResultsFragment = sap.ui.xmlfragment(
						this.getView().getId(),
						"sap.ui.demo.iconexplorer.view.browse." + sFragmentName,
						this);
					this.byId("resultContainer").addContent(oResultsFragment);

					var bCategoriesVisible = !(Device.system.phone || oQuery.tab == "favorites");
					this.byId("categorySelection").setVisible(bCategoriesVisible);
				}

				// icon
				if (oQuery.icon && bIconChanged) {
					this._previewIcon(oQuery.icon);
					this.byId("preview").setVisible(true);
					if (this.byId("preview").getLayoutData().getSize() === "0px") {
						this.byId("preview").getLayoutData().setSize("350px");
					}
				} else if (!oQuery.icon) {
					if (bInitial) {
						this._previewIcon("sap-ui5");
					}
					this.byId("preview").setVisible(false);
					this.byId("preview").getLayoutData().setSize("0px");
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
			var oResultBinding = this.byId("results").getBinding(this._sAggregationName);
			if (oResultBinding !== undefined) {
				oResultBinding.filter(this._vFilterSearch);
				this.getModel("view").setProperty("/overviewNoDataText", this.getResourceBundle().getText("overviewNoDataWithSearchText"), null, true);
			}
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
				templateSharable: true,
				events: {
					change: this.onUpdateFinished.bind(this)
				},
				suspended: true
			});
			// apply filters
			this.byId("results").getBinding(this._sAggregationName).filter(this._vFilterSearch);
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
					this._aCategoryTags[i].pressed = (this._aCategoryTags[i].name === oQuery.tag);
					if (this._aCategoryTags[i].pressed) {
						bTagVisible = true;
					}
					aCurrentTags.push(this._aCategoryTags[i]);
				}
			}

			// add current tag if it is not visible yet (tag bar only contains the top [x] tags)
			if (oQuery.tag && !bTagVisible) {
				aCurrentTags.push({
					pressed : true,
					name : oQuery.tag
				});
			}

			// update model data and bind the tags
			this._updateTagSelectionBar(aCurrentTags);
		},

		/**
		 * Binds tags to the tag selection bar and appends a label
		 * @param {object[]} aTags the tags to be bound
		 * @private
		 */
		_updateTagSelectionBar: function (aTags) {
			this.getModel("tags").setData([{"name" : ""}].concat(aTags));
			this.byId("tagSelection").bindAggregation("content", {
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
		 * @return {sap.m.Label|sap.m.ToggleButton} the control for the toolbar
		 * @private
		 */
		_tagSelectionFactory: function (sId, oContext) {
			if (oContext.getProperty("name") === "") {
				return new Label(sId, {
					text: "{i18n>overviewTagSelectionLabel}"
				});
			} else {
				return new ToggleButton(sId, {
					text: "{tags>name}",
					pressed: "{tags>pressed}",
					press: [this.onTagSelect, this]
				});
			}
		}

	});
});