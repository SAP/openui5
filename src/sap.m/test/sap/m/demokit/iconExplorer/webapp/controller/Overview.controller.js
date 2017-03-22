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
	"sap/m/ToggleButton"
], function (BaseController, IconPool, JSONModel, formatter, Filter, FilterOperator, Device, MessageToast, Label, ToggleButton) {
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
				growingThreshold : 50,
				iconFilterCount: this.getResourceBundle().getText("overviewTabAllInitial"),
				overviewNoDataText : this.getResourceBundle().getText("overviewNoDataText")
			});
			this.setModel(oViewModel, "view");

			// helper model for managing the tag selection
			oTagModel = new JSONModel();
			this.setModel(oTagModel, "tags");

			this.getRouter().getRoute("overview").attachPatternMatched(this._updateUI, this);

			// you don't want to know
			this._finetuneUI();
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
			history.go(-1);
		},

		/**
		 * Triggered by the table's 'updateFinished' event and by the other tabs change: after new table
		 * data is available, this handler method updates the icon counter.
		 * @public
		 */
		onUpdateFinished : function () {
			function getRootControl(oEvent) {
				return oEvent.srcControl.getMetadata().getName().search("VerticalLayout") >= 0 ? oEvent.srcControl : oEvent.srcControl.getParent();
			}

			// show total count of items
			this.getModel("view").setProperty("/iconFilterCount", this.byId("results").getBinding(this._sAggregationName).getLength());
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
				}

				// there is no addEventDelegateOnce so we remove and add it for all items
				this.byId("results").getAggregation(this._sAggregationName).forEach(function (oItem) {
					oItem.removeEventDelegate(this._oPressLayoutCellDelegate);
					oItem.addEventDelegate(this._oPressLayoutCellDelegate);
				}.bind(this));
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
				oResourceBundle = this.getResourceBundle();

			if (this.getModel("fav").toggleFavorite(oBindingContext)) {
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
		 * Copies the value of the code input field to the clipboard and display a message
		 */
		onCopyCodeToClipboard: function () {
			var sString = this.byId("previewCopyCode").getValue(),
				$temp = $("<input>"),
				oResourceBundle = this.getResourceBundle();

			try {
				$("body").append($temp);
				$temp.val(sString).select();
				document.execCommand("copy");
				$temp.remove();

				MessageToast.show(oResourceBundle.getText("previewCopyToClipboardSuccess", [sString]));
			} catch (oException) {
				MessageToast.show(oResourceBundle.getText("previewCopyToClipboardFail", [sString]));
			}
		},

		/**
		 * Copies the value of the code input field to the clipboard and display a message
		 */
		onCopyIconToClipboard: function () {
			var sString = this.byId("previewCopyCode").getValue();
			var sIcon = this.getModel().getUnicode(sString);
			var $temp = $("<input>");

			try {
				$("body").append($temp);
				$temp.val(sIcon).select();
				document.execCommand("copy");
				$temp.remove();

				MessageToast.show("Icon \"" + sString + "\" has been copied to clipboard");
			} catch (oException) {
				MessageToast.show("Icon \"" + sString + "\" could not be copied to clipboard");
			}
		},

		/**
		 * Shows a random icon in the preview pane
		 * @public
		 */
		onSurpriseMe: function () {
			var aIcons = this.getModel().getProperty("/groups/0/icons"),
				oRandomItem = aIcons[Math.floor(Math.random() * aIcons.length)];

			this._updateHash("icon", oRandomItem.name);
		},

		/**
		 * Closes the preview pane
		 * @public
		 */
		onClosePreview: function () {
			this._updateHash("icon");
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Corrects several control issues for improved display in the icon explorer.
		 * Caution: some of the following hacks are not recommended for standard app development
		 * @private
		 */
		_finetuneUI : function () {
			var fnMakeTransparent = function (sId) {
				this.byId(sId).addEventDelegate({
					onAfterRendering: function () {
						try {
							var $control = this.byId(sId).$();
							var sBackgroundColor = $control.css("background-color");
							var sAlphaColor = "rgba(" + sBackgroundColor.match(/rgb\((.+)\)/)[1] + ", 0.80)";

							$control.css("background-color", sAlphaColor);
						} catch (oException) {
							// do nothing
						}
					}.bind(this)
				});
			}.bind(this);

			/* make preview controls semi-transparent to look better on accent cells */
			fnMakeTransparent("previewIconTabBar--header");
			fnMakeTransparent("previewToolbar");
			fnMakeTransparent("previewListItem");
			fnMakeTransparent("previewGenericTile");

			/* resize preview icon based on splitter size */
			// hack: splitter does not have a resize event that we need to resize the content
			var fnUpdatePreviewSize = function () {
				var iWidth = this.byId("previewCell").$().width();
				if (iWidth) {
					this.byId("previewIcon").setSize((iWidth / 2) + "px");
				}
			}.bind(this);

			// if the icon is getting rerendered we also set the size again
			this.byId("previewIcon").addEventDelegate({
				onAfterRendering: function () {
					fnUpdatePreviewSize();
				}
			});

			var fnDelayedResize = sap.ui.layout.Splitter.prototype._delayedResize;
			if (fnDelayedResize) {
				// caution: overriding prototype methods is dangerous
				sap.ui.layout.Splitter.prototype._delayedResize = function () {
					fnDelayedResize.apply(this, arguments);
					// update icon size after splitter change is applied
					setTimeout(function () {
						fnUpdatePreviewSize();
					}, 0);
				};
			}

			// hack: token does not mark the event so the table cell gets highlighted
			var fnOnTokenTouchstart = sap.m.Token.prototype.ontouchstart;
			if (fnOnTokenTouchstart) {
				// caution: overriding prototype methods is dangerous
				sap.m.Token.prototype.ontouchstart = function () {
					arguments[0].setMarked();
					fnOnTokenTouchstart.apply(this, arguments);
				};
			}
		},

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {string} sIcon the icon name to be previewed
		 * @private
		 */
		_previewIcon : function (sIcon) {
			this.getModel().iconsLoaded().then(function () {
				// bind the preview to the item path
				this.byId("preview").bindElement({
					path: this.getModel().getIconPath(sIcon)
				});

				this.byId("previewCopyIcon").setHtmlText("<span>" + this.getModel().getUnicodeHTML(sIcon) + "</span>" + sIcon);

				// update the group information with a timeout as this task takes some time to calculate
				setTimeout(function () {
					var aGroups = this.getModel().getIconGroups(sIcon);
					this.byId("categoryInfo").setText(aGroups.join(", "));
				}.bind(this),0);

				// update unicode info
				this.byId("unicodeInfo").setText(this.getModel().getUnicodeHTML(sIcon));
			}.bind(this));
		},

		/**
		 * Updates the UI according to the hash
		 * @param {sap.ui.base.Event} oEvent the routing event
		 * @private
		 */
		_updateUI: function (oEvent) {
			var oQuery = oEvent.getParameter("arguments")["?query"],
				bInitial = false;

			// set a default query object in case no has is defined
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
			var bTabularResults = !!(oQuery.tab === "details" || oQuery.tab === "favorites");
			var bTabChanged = this._oPreviousQueryContext.tab !== oQuery.tab;
			var bCategoryChanged = this._oPreviousQueryContext.cat !== oQuery.cat;
			var bSearchChanged = this._oPreviousQueryContext.search !== oQuery.search;
			var bTagChanged = this._oPreviousQueryContext.tag !== oQuery.tag;
			var bIconChanged = this._oPreviousQueryContext.icon !== oQuery.icon;

			this._sAggregationName = (bTabularResults  ? "items" : "content");

			this.getOwnerComponent().iconsLoaded().then(function () {
				// tab
				this._toggleScrollToLoad(!bTabularResults);
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
					var oResultsFragment = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.demo.iconexplorer.view.browse." + sFragmentName, this);
					this.byId("resultContainer").addContent(oResultsFragment);
					this.byId("categorySelection").setVisible(oQuery.tab !== "favorites");
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
				this.byId("categorySelection").setSelectedKey(oQuery.cat);
				if ((oQuery.cat || bCategoryChanged) && oQuery.tab !== "favorites") {
					if (bInitial || bTabChanged) {
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
				if (bInitial || bSearchChanged || bTagChanged || bTabChanged) {
					// search
					if (bInitial || bTabChanged) {
						if (oQuery.search || bTabChanged) {
							this._searchIcons(oQuery.search, oQuery.tag);
						}
					} else {
						clearTimeout(this._iSearchTimeout);
						this._iSearchTimeout = setTimeout(function () {
							this._searchIcons(oQuery.search, oQuery.tag);
						}.bind(this), TYPING_DELAY);
					}

					// tags
					if (bInitial || bTabChanged) {
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
					oFilterSearchTags = (sSearchValue ? new Filter("tagString", FilterOperator.Contains, sSearchValue) : undefined),
					oFilterSearchNameTags = (sSearchValue ? new Filter({
						filters: [oFilterSearchTags, oFilterSearchName],
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
				this.getModel("view").setProperty("/overviewNoDataText", this.getResourceBundle().getText("overviewNoDataWithSearchText"));
			}
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
				template: this.byId("results").getBindingInfo(this._sAggregationName).template,
				events: {
					change: this.onUpdateFinished.bind(this)
				}
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
				i;

			// collect all current tags from the result list
			for (i = 0; i < aContexts.length; i++) {
				aAllTags = aAllTags.concat(aContexts[i].getProperty("tags").map(function(oItem) { return oItem.name; }));
			}

			// no category selected yet: use all tags
			if (!this._aCategoryTags) {
				this._aCategoryTags = this.getModel().getProperty("/groups/0/tags");
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
					text: "{i18n>overviewTagSelectionLabel}",
					tooltip: "{i18n>overviewSelectTagsTooltip}"
				});
			} else {
				return new ToggleButton(sId, {
					text: "{tags>name}",
					pressed: "{tags>pressed}",
					press: [this.onTagSelect, this]
				});
			}
		},

		/**
		 * Enables/Disables scroll to load functionality for the grid and visual view
		 * @param {boolean} bToggle whether to enable or disable scroll to load
		 * @private
		 */
		_toggleScrollToLoad: function (bToggle) {
			var oScrollContainer = this.byId("resultContainer");

			// hack: we side-step all the scrolling complexity and attach growing-list-style to the ScrollEnablement callback directly
			if (!oScrollContainer._oScroller) { // not initialize yet
				return;
			}
			if (bToggle) {
				if (!this._fnInjectedScrollToLoadCallback) {
					this._fnInjectedScrollToLoadCallback = function () {
						this._loadMoreIcons();
						if (this._fnScrollLoadCallback && (this._oCurrentQueryContext.tab === "details" || this._oCurrentQueryContext.tab === "favorites")) {
							this._fnScrollLoadCallback();
						}
					}.bind(this);
				}

				// store initial callback once
				if (!this._fnScrollLoadCallback && oScrollContainer._oScroller._fnScrollLoadCallback !== this._fnInjectedScrollToLoadCallback) {
					this._fnScrollLoadCallback = oScrollContainer._oScroller._fnScrollLoadCallback;
				}

				// hook in our callback
				oScrollContainer._oScroller._fnScrollLoadCallback = this._fnInjectedScrollToLoadCallback;
			} else {
				// reset initial callback
				oScrollContainer._oScroller._fnScrollLoadCallback = this._fnScrollLoadCallback;
			}
		},

		/**
		 * Loads [growingThreshold] more icons when scrolling down in the grid or visual tab
		 * @private
		 */
		_loadMoreIcons: function () {
			var oBindingInfo = this.byId("results").getBindingInfo(this._sAggregationName),
				iOldLength = parseInt(oBindingInfo.length, 10),
				iTotalLength = this.byId("results").getBinding("content").getLength();

			// exit condition
			if (iOldLength >= iTotalLength) {
				this._toggleScrollToLoad(false);
				return;
			}

			// calculate new length
			oBindingInfo.length = iOldLength + this.getModel("view").getProperty("/growingThreshold");

			// rebind the result set to show the new items
			this.byId("results").bindAggregation(this._sAggregationName, oBindingInfo);
			this._oScrollToLastResultPositionEventDelegate = {
				onAfterRendering: function () {
					var oLastItemFromOldLength = this.byId("results").getAggregation(this._sAggregationName)[iOldLength - 1];
					if (oLastItemFromOldLength.$()[0].scrollIntoView) {
						oLastItemFromOldLength.$()[0].scrollIntoView(false);
					} else {
						this.byId("resultContainer").scrollToElement(oLastItemFromOldLength);
					}
					this.byId("results").removeEventDelegate(this._oScrollToLastResultPositionEventDelegate);
				}.bind(this)
			};
			this.byId("results").addEventDelegate(this._oScrollToLastResultPositionEventDelegate);
		}

	});
});