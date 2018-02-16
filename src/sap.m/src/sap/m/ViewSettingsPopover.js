/*!
 * ${copyright}
 */
// Provides control sap.m.ViewSettingsPopover.
sap.ui.define([
	"jquery.sap.global",
	"./ResponsivePopover",
	"./Button",
	"./Toolbar",
	"./ToolbarSpacer",
	"./Bar",
	"./List",
	"./StandardListItem",
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"./SegmentedButton",
	"./Page",
	"./NavContainer",
	"./ViewSettingsItem",
	"sap/ui/base/ManagedObject",
	"sap/ui/Device",
	"sap/ui/core/InvisibleText",
	"./ViewSettingsPopoverRenderer"
], function(
	jQuery,
	ResponsivePopover,
	Button,
	Toolbar,
	ToolbarSpacer,
	Bar,
	List,
	StandardListItem,
	library,
	Control,
	IconPool,
	SegmentedButton,
	Page,
	NavContainer,
	ViewSettingsItem,
	ManagedObject,
	Device,
	InvisibleText,
	ViewSettingsPopoverRenderer
	) {
		"use strict";

		// shortcut for sap.m.VerticalPlacementType
		var VerticalPlacementType = library.VerticalPlacementType;

		// shortcut for sap.m.ListType
		var ListType = library.ListType;

		// shortcut for sap.m.ListMode
		var ListMode = library.ListMode;

		var TOOLBAR_SUFFIX                  = '-toolbar';
		var SEGMENTED_BUTTON_SUFFIX         = '-segmented';
		var LIST_ITEMS_SUFFIX               = '-listitem';
		var LIST_ITEMS_SUFFIX_GROUP			= '-group';
		var LIST_ITEMS_SUFFIX_FILTER		= '-filter';
		var LIST_ITEMS_SUFFIX_SORT			= '-sort';
		var FILTERDETAIL_LIST_ITEMS_SUFFIX  = '-filterdetailItem';
		var NAV_CONTAINER_SUFFIX            = '-navContainer';
		var MAIN_PAGE_SUFFIX                = '-mainPage';
		var DETAILS_PAGE_SUFFIX             = '-detailspage';
		var BACK_BUTTON_SUFFIX              = '-backbutton';
		var TITLE_SUFFIX                    = '-title';
		var SEARCH_FIELD_SUFFIX             = '-searchfield';
		var SELECT_ALL_SUFFIX               = '-selectall';
		var CUSTOM_TAB_SUFFIX               = '-custom-button';

		/**
		 * Constructor for a new <code>ViewSettingsPopover</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ` is given
		 * @param {Object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A <code>ViewSettingsPopover</code> is a Popover containing a summarized list with messages.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.38
		 * @alias sap.m.ViewSettingsPopover
		 * @ui5-metamodel This control also will be described in the legacy UI5 design-time metamodel
		 */
		var ViewSettingsPopover = Control.extend("sap.m.ViewSettingsPopover", /** @lends sap.m.ViewSettingsPopover.prototype */ {
			metadata: {
				library: "sap.m",
				aggregations: {
					/**
					 * Holds public collection of sort items.
					 */
					sortItems: {type: "sap.ui.core.Item", multiple: true, singularName: "sortItem"},
					/**
					 * Holds public collection of filter items.
					 */
					filterItems: {type: "sap.ui.core.Item", multiple: true, singularName: "filterItem"},
					/**
					 * Holds public collection of filter detail items.
					 */
					filterDetailItems: {type: "sap.ui.core.Item", multiple: true, singularName: "filterDetailItem"},
					/**
					 * Holds public collection of group items.
					 */
					groupItems: {type: "sap.ui.core.Item", multiple: true, singularName: "groupItem"},
					/**
					 * The list of all the custom tabs.
					 */
					customTabs: {type: "sap.m.ViewSettingsCustomTab", multiple: true, singularName: "customTab", bindable : "bindable"}
				},
				associations : {
					/**
					 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
					 */
					ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
				},
				events: {
					/**
					 * Fired after the popover is opened.
					 */
					afterOpen: {
						parameters: {
							/**
							 * This Refers to the control that opens the popover
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * Fired after the popover is closed.
					 */
					afterClose: {
						parameters: {
							/**
							 * Refers to the control that opens the popover
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * Fired when the popover is opened
					 */
					beforeOpen: {
						parameters: {
							/**
							 * Refers to the control that opens the popover
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * Fired when the popover is closed
					 */
					beforeClose: {
						parameters: {
							/**
							 * Refers to the control that opens the popover
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * Fired when sort filters are selected.
					 */
					sortSelected: {
						allowPreventDefault: true,
						parameters: {
							/**
							 * The item to be closed.
							 */
							items: {type: "array"}
						}
					},

					/**
					 * Fired when filter filters are selected.
					 */
					filterSelected: {
						allowPreventDefault: true,
						parameters: {
							/**
							 * The item to be closed.
							 */
							items: {type: "array"}
						}
					},

					/**
					 * Fired when group filters are selected.
					 */
					groupSelected: {
						allowPreventDefault: true,
						parameters: {
							/**
							 * The item to be closed.
							 */
							items: {type: "array"}
						}
					},

					/**
					 * Fired when the filter detail page is opened.
					 */
					afterFilterDetailPageOpened: {
						parameters: {
							/**
							 * The filter item for which the details are opened.
							 */
							parentFilterItem: {type: "sap.m.ViewSettingsFilterItem"}
						}
					}
				}
			},
			constructor : function (vId, mSettings) {
				this._stashedItems = {};
				// normalize the expected arguments
				if (!mSettings && vId && typeof vId === 'object') {
					mSettings = vId;
				}
				// remove all items before creating the whole aggregation hierarchy and add them afterwards
				this._stashItems(mSettings);

				if (mSettings && Array.isArray(mSettings['sortItems'])) {
					mSettings['sortItems'] = null;
				}
				if (mSettings && Array.isArray(mSettings['filterItems'])) {
					mSettings['filterItems'] = null;
				}
				if (mSettings && Array.isArray(mSettings['groupItems'])) {
					mSettings['groupItems'] = null;
				}

				ManagedObject.prototype.constructor.apply(this, arguments);
				this._getPopover().addContent(this._getNavContainer());

				// add the items
				this._addStashedItems();
			}
		});

		/**
		 * Initialization method for creating some base internal properties.
		 * @public
		 */
		ViewSettingsPopover.prototype.init = function () {
			/*
			 * The following internal properties are assigned upon instantiating the control /triggered in the constructor/.
			 *
			 this._currentPageId; // ID of current open page if in opened state
			 this._initialHeight; // Remember height of the toolbar without content
			 this._oPreviousSelectedFilters; // Object storing ids of selected filter detail items
			 this._lastViewedFilterParent; // Last standard list item instance for which detail page was opened.

			 this._sortList; // Internal list instance for rendering sort items
			 this._filterList; // For filter
			 this._filterDetailList; // For filter detail
			 this._groupList; // For group

			 this._mainPage; // Internal page instance for sort/filter/group pages content
			 this._detailsPage; // Internal page instance for filter detail content
			 this._navContainer; // Internal instance for managing and rendering main and detail pages

			 this._toolbar; // Internal toolbar instance for toolbar tabs and close button
			 this._title; // Internal instance storing the current title text for the opened page
			 this._popover; // Internal popover instance for rendering
			 this._segmentedButton // Internal segmented button instance for toolbar tabs
			 this._filterSearchField // Internal search input field instance
			 this._removeSortingItem // Standard list item for removing sorting
			 this._removeGroupingItem // Standard list item for removing grouping
			 this._removeFilteringItem // Standard list item for removing filtering
			 */

			/**
			 * Internal map object, each property is id of a "button ID/page content ID" in the popover.
			 * @type {{sort: string, filter: string, filterDetail: string, group: string}}
			 * @private
			 */
			this._tabMap = {
				sort            : 'sort',
				filter          : 'filter',
				filterDetail    : 'filterDetail',
				group           : 'group'
			};
		};

		/**
		 * Opens the popover.
		 * @param {Object} oControl Instance of the control that triggered the opening
		 */
		ViewSettingsPopover.prototype.openBy = function (oControl) {
			var oPopover = this._getPopover(oControl),
				sPageToOpen = this._determinePageToOpen();

			oPopover.openBy(oControl);

			if (sPageToOpen) {
				if (Device.system.phone) {
					this._showContentFor(sPageToOpen);
				} else {
					// no tab pressed by default
					this._removeSegmentedButtonSelection();
					this._adjustInitialWidth();
				}
			}

			this._initialHeight = this._getPopover().getContentHeight();

			// if only one tab is present, directly show it's content
			if (this._getSegmentedButton().getItems() && this._getSegmentedButton().getItems().length === 1 && sPageToOpen) {
				this._showContentFor(sPageToOpen);
			}

			if (oPopover.getAriaLabelledBy() && oPopover.getAriaLabelledBy().indexOf(this._getPopoverAriaLabel()) === -1) {
				oPopover.addAriaLabelledBy(this._getPopoverAriaLabel());
			}
		};

		/**
		 * Removes default selected item of <code>SegmentedButton</code>.
		 */
		ViewSettingsPopover.prototype._removeSegmentedButtonSelection = function () {
			this._getSegmentedButton().setProperty('selectedKey', '', true).removeAllAssociation('selectedButton', true);
			// by default the SegmentedButton sets the first button as selected if the association is set to false
			// the only way to not have a selected button is to give the association invalid value
			this._getSegmentedButton().setAssociation("selectedButton", "no_selected_button", true);
			this._getSegmentedButton().getButtons().forEach(function (oButton) {
				oButton.$().removeClass("sapMSegBBtnSel").attr("aria-checked", false);
			});
		};

		/**
		 * Toggles between open and closed state of the <code>ViewSettingsPopover</code> instance.
		 * oControl parameter is mandatory in the same way as in <code>openBy</code> method.
		 * oControl parameter is mandatory in the same way as in 'openBy' method
		 *
		 * @param {sap.ui.core.Control} oControl Control which opens the <code>ViewSettingsPopover</code>
		 * @returns {sap.m.ViewSettingsPopover} Reference to the 'this' for chaining purposes
		 * @public
		 */
		ViewSettingsPopover.prototype.toggle = function (oControl) {
			if (this.isOpen()) {
				this.close();
			} else {
				this.openBy(oControl);
			}
			return this;
		};

		/**
		 * The method checks if the <code>ViewSettingsPopover</code> is open. It returns true when the <code>ViewSettingsPopover</code> is currently open
		 * (this includes opening and closing animations), otherwise it returns false
		 *
		 * @public
		 * @returns {boolean} Whether that <code>ViewSettingsPopover</code> is open
		 */
		ViewSettingsPopover.prototype.isOpen = function () {
			return this._getPopover().isOpen();
		};

		/**
		 * Closes the <code>ViewSettingsPopover</code>.
		 *
		 * @returns {sap.m.ViewSettingsPopover} Reference to the 'this' for chaining purposes
		 * @public
		 */
		ViewSettingsPopover.prototype.close = function () {
			this._getPopover().close();
			this._cleanAfterClose();
			return this;
		};

		/**
		 * Determines the page ID of the right page to open by default.
		 * @returns {string} sPageId ID of the right page to be opened
		 * @private
		 */
		ViewSettingsPopover.prototype._determinePageToOpen = function () {
			var i, j,
				sProperty,
				sType,
				aItems,
				aSegmentedButtonItems,
				oCustomTab,
				sCustomTabButtonId,
				oCustomTabs = this.getCustomTabs();

			// check for page to open among the predefined tabs
			for (sProperty in this._tabMap) {
				sType = this._tabMap[sProperty];
				sType = sType.slice(0,1).toUpperCase() + sType.slice(1);
				aItems = this['_get' + sType + 'List']().getItems();

				if (aItems.length === 1) {
					// if we have only one item, don't open page, it will be selected by default
					return;
				} else if (aItems.length > 1) {
					return this._tabMap[sProperty];
				}
			}

			// if there are custom tabs check for page to open
			if (oCustomTabs) {
				aSegmentedButtonItems = this._getSegmentedButton().getItems();
				for (i = 0; i < oCustomTabs.length; i++) {
					oCustomTab = oCustomTabs[i];
					sCustomTabButtonId = this.getId() + oCustomTab.getId() + CUSTOM_TAB_SUFFIX;
					if (!this._isEmptyCustomTab(oCustomTab)) {
						for (j = 0; j < aSegmentedButtonItems.length; j++) {
							if (sCustomTabButtonId === aSegmentedButtonItems[j].getId()) {
								return oCustomTab.getId();
							}
						}
					}
				}
			}
			// if no page is found open default empty page
			return this._tabMap['sort'];
		};

		/**
		 * Removes the internal popover footer.
		 */
		ViewSettingsPopover.prototype._removeFooter = function () {
			// hide any footer buttons from detail page
			if (this._getPopover()._oFooter) {
				this._getPopover()._oFooter.destroy();
				this._getPopover()._oFooter = null;
			}
			this._getPopover().destroyAggregation('beginButton');
			this._getPopover().destroyAggregation('endButton');
		};

		/**
		 * Manage internal aggregations so that the correct contents are being set for rendering.
		 * @param {string} sPageId ID of the page for which to show content
		 * @param {Object} oParentItem of a parent item (e.g. filter details page parent)
		 * @param {boolean} bDisableSlideEffect Flag enabling or disabling the slide animation on pages navigation
		 * @private
		 */
		ViewSettingsPopover.prototype._showContentFor = function (sPageId, oParentItem, bDisableSlideEffect) {
			var oPopoverAriaLabelledBy = sap.ui.getCore().byId(this._getPopoverAriaLabel()),
				sAriaText;

			this._getPopover().setContentHeight('300px');
			this._getPopover().setContentWidth('300px');

			// remove any current contents from the page
			this._removePageContents(sPageId);
			// add new content to the page to show
			this._addPageContents(sPageId);

			if (sPageId === this._tabMap['filterDetail']) {
				sAriaText = this._getText('VIEWSETTINGS_TITLE_FILTERBY') + this._updateTitleText(oParentItem.getTitle(), true);
				this._goToDetailsPage(oParentItem, bDisableSlideEffect);
			} else {
				if (sPageId in this._tabMap) {
					sAriaText = this._updateTitleText(sPageId);
					if (sPageId === this._tabMap['filter']) {
						this._updateFilterListItemsCount();
					}
				}
				this._goToMainPage();
			}
			oPopoverAriaLabelledBy.setText(sAriaText);
			this._getSegmentedButton().setSelectedKey(sPageId); // make sure segmented button is always in sync
			this._currentPageId = sPageId;
		};

		/**
		 * Updates the text of the title aggregation.
		 * @param {string} sText String to be shown as new title
		 * @param {boolean} bSkipTranslate Whether to translate a key ot displayed a string directly
		 * @returns {string} the computed title text
		 * @private
		 */
		ViewSettingsPopover.prototype._updateTitleText = function (sText, bSkipTranslate) {
			var sStringKey,
				sString = sText;
			if (!bSkipTranslate) {
				sStringKey = sText;
				if (sStringKey == 'filterDetail') {
					sStringKey = 'filter';
				}
				sStringKey = "VIEWSETTINGS_TITLE_" + sStringKey.toUpperCase();
				sString = this._getText(sStringKey);
			}

			if (bSkipTranslate && this._getDetailsPage().getHeaderContent()[0].getContentMiddle()) {
				// filter detail page title is a bit more special
				this._getDetailsPage().getHeaderContent()[0].getContentMiddle()[0].setText(sString);
			} else {
				this._getTitle().setText(sString);
			}
			return sString;
		};

		/**
		 * Goes to the details page.
		 * @param {Object} oParentItem The parent item
		 * @param {boolean} bDisableSlideEffect Flag enabling or disabling the slide animation on pages navigation
		 * @private
		 */
		ViewSettingsPopover.prototype._goToDetailsPage = function (oParentItem, bDisableSlideEffect) {
			var bMultiSelectMode = this._findViewSettingsItemFromListItem(oParentItem).getMultiSelect();
			if (bMultiSelectMode) {
				// add toolbar with 'search' field and 'show selected only' button
				this._getSearchField().setValue('');
				this._getDetailsPage().insertAggregation('content', new Toolbar({
					content: [ this._getSearchField().addStyleClass('sapMVSDFilterSearchField'), this._getShowSelectedOnlyButton() ]
				}), 0);

				// add 'select all' checkbox
				this._getFilterDetailList().setHeaderToolbar(new Toolbar({
					content: [ this._getSelectAllCheckbox(this._findViewSettingsItemFromListItem(oParentItem).getItems(), this._getFilterDetailList()) ]
				}).addStyleClass('sapMVSDFilterHeaderToolbar'));
			} else {
				this._getFilterDetailList().removeAllAggregation('headerToolbar');
			}
			this._updateFilterDetailListFor(oParentItem);
			this._navigateToPage('Details', bDisableSlideEffect);
			this._addFooterButtons();
			this._updateSelectAllCheckBoxState();

			if (Device.system.phone) {
				// hide the header on filter detail page
				this._hideToolbarButtons();
			}

			this._lastViewedFilterParent = oParentItem;
			this._oPreviousSelectedFilters = {
				selectedItemIds: this._getFilterDetailList().getSelectedItems().map(function (oItem) {
					return oItem.getId();
				})
			};
			this.fireAfterFilterDetailPageOpened({parentFilterItem : oParentItem});
		};


		/**
		 * Returns reference to the button for filtering selected items.
		 * @returns {Object} Reference to <code>sap.m.Button</code>
		 * @private
		 */
		ViewSettingsPopover.prototype._getShowSelectedOnlyButton = function () {
			var bShowSelectedOnly = false;
			if (!this._oShowSelectedOnlyButton) {
				this._oShowSelectedOnlyButton = new Button({
					icon : IconPool.getIconURI("multiselect-all"),
					tooltip: this._getText('SHOW_SELECTED_ONLY'),
					press: function (oEvent) {
						bShowSelectedOnly = !bShowSelectedOnly;
						if (bShowSelectedOnly) {
							oEvent.getSource().$("inner").addClass('sapMBtnActive');
						}
						this._getFilterDetailList().getItems().forEach(function (oItem) {
							if (bShowSelectedOnly) {
								if (!oItem.getSelected()) {
									oItem.setVisible(false);
								}
							} else if (!bShowSelectedOnly) {
								this._filterItemsBy(this._getSearchField().getValue());
							}
						}, this);
						this._updateSelectAllCheckBoxState();
					}.bind(this)
				});
			}
			return this._oShowSelectedOnlyButton;
		};


		/**
		 * Updates the state of the select all checkbox after selecting a single item or after filtering items.
		 *
		 * @private
		 */
		ViewSettingsPopover.prototype._updateSelectAllCheckBoxState = function() {
			var oSelectAllCheckBox = sap.ui.getCore().byId(this.getId() + SELECT_ALL_SUFFIX),
				aItems = this._getFilterDetailList().getItems() || [],
				bAllSelected = true,
				iVisibleItems = 0,
				i;

			for (i = 0; i < aItems.length; i++) {
				if (aItems[i].getVisible()) {
					iVisibleItems++;
					if (!aItems[i].getSelected()) {
						bAllSelected = false;
					}
				}
			}

			if (oSelectAllCheckBox) {
				oSelectAllCheckBox.setSelected(bAllSelected && iVisibleItems);
			}
		};

		/**
		 * Adds footer buttons.
		 * @private
		 */
		ViewSettingsPopover.prototype._addFooterButtons = function () {
			var oButtonOk = new Button({
					text: this._getText("VIEWSETTINGS_ACCEPT"),
					press: this._confirmFilterDetail.bind(this)
				}),
				oButtonCancel = new Button({
					text: this._getText("VIEWSETTINGS_CANCEL"),
					press: this._cancel.bind(this)
				});

			this._getPopover().setBeginButton(oButtonOk);
			this._getPopover().setEndButton(oButtonCancel);
		};

		/**
		 * Handles selected items confirmation.
		 * @private
		 */
		ViewSettingsPopover.prototype._confirmFilterDetail = function () {
			var oSelectedListItems = this._getFilterDetailList().getItems().filter(function (oItem) {
				return oItem.getSelected();
			});

			this.fireFilterSelected({
				items: oSelectedListItems.map(function (oListItem) {
					return this._findViewSettingsItemFromListItem(oListItem);
				}.bind(this))
			});
			this.close();
		};

		/**
		 * Handles the cancellation of selected items.
		 * @private
		 */
		ViewSettingsPopover.prototype._cancel = function () {
			this._restorePreviousState();
			this._updateFilterListItemsCount();
			this.close();
		};

		/**
		 * Restores the state of the items.
		 * @private
		 */
		ViewSettingsPopover.prototype._restorePreviousState = function () {
			var fnRestorePreviousState;

			if (this._oPreviousSelectedFilters) {
				// select again those that were initially selected
				fnRestorePreviousState = function (aPrevStateItems, oItem, oVSPItem) {
					var i;
					for (i = 0; i < aPrevStateItems.length; i++) {
						if (oItem.getId() === aPrevStateItems[i]) {
							oVSPItem.setProperty('selected', true, true);
							break;
						}
					}
				};

				this._getFilterDetailList().getItems().forEach(function (oItem) {
					// reset all to false
					var oVSPItem = this._findViewSettingsItemFromListItem(oItem);
					oVSPItem.setProperty('selected', false, true);

					fnRestorePreviousState(this._oPreviousSelectedFilters.selectedItemIds, oItem, oVSPItem);
				}, this);

				this._updateSelectAllCheckBoxState();
			}
		};

		/**
		 * Hildes the toolbar buttons.
		 * @private
		 */
		ViewSettingsPopover.prototype._hideToolbarButtons = function () {
			this._getPopover().setShowHeader(false);
			jQuery.sap.delayedCall(0, this, function () {
				if (this._getPopover().getAggregation('_popup')._internalHeader) {
					this._getPopover().getAggregation('_popup')._internalHeader.$().hide();
				}
			});
		};

		/**
		 * Goes to the main page.
		 * @private
		 */
		ViewSettingsPopover.prototype._goToMainPage = function () {
			// show main page
			this._getPopover().setShowHeader(true);
			this._getPopover().setCustomHeader(this._getToolbar());
			this._oPreviousSelectedFilters = null;
			this._navigateToPage('Main');
		};

		/**
		 * Adjusts the initial toolbar width.
		 * @private
		 */
		ViewSettingsPopover.prototype._adjustInitialWidth = function () {
			var iButtonWidth, iButtonMargin, iButtonsLen, iNewWidth,
				oSegmentedButton = this._getSegmentedButton(),
				aSegmentedButtonAggregations = oSegmentedButton && oSegmentedButton.getButtons();

			if (!aSegmentedButtonAggregations || !aSegmentedButtonAggregations[0]) {
				return;
			}

			iButtonWidth = aSegmentedButtonAggregations[0].$().width();
			iButtonMargin = parseInt(aSegmentedButtonAggregations[0].$().css('margin-right'), 10);
			iButtonsLen = aSegmentedButtonAggregations.length;

			if (library._bSizeCompact || !!document.querySelector('.sapUiSizeCompact')) {
				iButtonWidth = iButtonWidth * 2;
			}
			iNewWidth = (iButtonWidth + iButtonMargin) * (iButtonsLen + 1.6); // make more room for close button
			this._getPopover().setContentWidth(iNewWidth + "px");
		};

		/**
		 * Triggers the sliding effect of nav container to display certain page.
		 * @param {string} sPageName Name of the page to be shown
		 * @param {boolean} bDisableSlideEffect Flag enabling or disabling sliding animation on page navigation
		 * @private
		 */
		ViewSettingsPopover.prototype._navigateToPage = function (sPageName, bDisableSlideEffect) {
			var oBackButton;
			// navigate to details page
			if (this._getNavContainer().getCurrentPage().getId() !== this['_get' + sPageName + 'PageId']()) {
				if (sPageName === 'Details') {
					if (bDisableSlideEffect) {
						this._getNavContainer().to(this['_get' + sPageName + 'Page'](), 'show');
						oBackButton = sap.ui.getCore().byId(this.getId() + BACK_BUTTON_SUFFIX);
						oBackButton && oBackButton.destroy();
						oBackButton = null;
					} else {
						jQuery.sap.delayedCall(0, this._getNavContainer(), "to", [this['_get' + sPageName + 'Page'](), "slide"]);
					}
				} else {
					jQuery.sap.delayedCall(0, this._getNavContainer(), 'back');
				}
			}

			this._getNavContainer().attachEventOnce("afterNavigate", function() {
				if (this._currentPageId !== this._tabMap['filterDetail']) {
					this._removeFooter();
					if (Device.system.desktop && this._lastViewedFilterParent && this._lastViewedFilterParent.getFocusDomRef()) {
						// focus filter item
						this._lastViewedFilterParent.getFocusDomRef().focus();
					}
				} else {
					// focus first item on filter detail page
					if (Device.system.desktop && this._getFilterDetailList().getItems()[0] && this._getFilterDetailList().getItems()[0].getFocusDomRef()) {
						this._getFilterDetailList().getItems()[0].getFocusDomRef().focus();
					}
				}
			}.bind(this));
		};


		/**
		 * Updates sub selected items count on filter items.
		 * @private
		 */
		ViewSettingsPopover.prototype._updateFilterListItemsCount = function () {
			var iFilterCount,
				oVSPItem,
				aListItems = this._getFilterList().getItems();
			aListItems.forEach(function (oListItem) {
				if (oListItem.getId().indexOf('nofiltering') === -1) {
					oVSPItem = this._findViewSettingsItemFromListItem(oListItem);
					if (oVSPItem instanceof sap.m.ViewSettingsCustomItem) {
						// for custom filter oItems the oItem is directly selected
						iFilterCount = oVSPItem.getFilterCount();
					} else if (oVSPItem instanceof sap.m.ViewSettingsFilterItem) {
						// for filter oItems the oItem counter has to be calculated from
						// the sub oItems
						iFilterCount = oVSPItem.getItems().filter(function (oSubItem) { return oSubItem.getSelected(); }).length;
					}
					oListItem.setCounter(iFilterCount);
				}
			}, this);
		};

		/**
		 * Updates the list with the items for a concrete parent filter item
		 * @param {Object} oParentFilterItem The parent filter item
		 * @private
		 */
		ViewSettingsPopover.prototype._updateFilterDetailListFor = function (oParentFilterItem) {
			var bMultiSelectMode = this._findViewSettingsItemFromListItem(oParentFilterItem).getMultiSelect();
			var oParent = sap.ui.getCore().byId(oParentFilterItem.getId().split(LIST_ITEMS_SUFFIX).shift());
			var oVSPItems = oParent && oParent.getItems() || [];
			var oList = this._getFilterDetailList();

			oList.destroyAggregation("items");

			if (bMultiSelectMode) {
				oList.setIncludeItemInSelection(true);
				oList.setMode(ListMode.MultiSelect);
			} else {
				oList.setMode(ListMode.SingleSelectLeft);
			}

			// create items anew
			oVSPItems.forEach(function (oVSPItem) {
				oList.addItem(new StandardListItem({
					id: oVSPItem.getId() + FILTERDETAIL_LIST_ITEMS_SUFFIX,
					title: oVSPItem.getText(),
					type: ListType.Active,
					selected: oVSPItem.getSelected()
				}));
			}, this);
		};

		/**
		 * Removes any current contents from a page by making them aggregations of this instance.
		 * @param {string} sPageId ID of the page for which to remove content
		 * @private
		 */
		ViewSettingsPopover.prototype._removePageContents = function(sPageId) {
			var sProperty,
				sType,
				oPageContent,
				oPageList,
				sGetPageMethodName = '_getMainPage';
			if (sPageId === 'filterDetail') {
				sGetPageMethodName = '_getDetailsPage';
			}
			oPageContent = this[sGetPageMethodName]().getContent();
			oPageList = oPageContent[0];
			for (sProperty in this._tabMap) {
				sType = this._tabMap[sProperty];
				if (oPageList) {
					if (oPageList.getId() === sType + 'list') {
						this['_' + sType + 'List'] = oPageList;
					}
				}
			}

			if (!(sPageId in this._tabMap) || isLastPageContentCustomTab.call(this)) {
				// custom tabs
				this.getCustomTabs().forEach(function (oCustomTab) {
					if (this._currentPageId === oCustomTab.getId()) {
						oPageContent.forEach(function (oContent) {
							oCustomTab.addAggregation('content', oContent, true);
						});
					}
				}, this);
			}

			this[sGetPageMethodName]().removeAllContent();
		};


		/**
		 * Adds corresponding contents to a page.
		 * @param {string} sPageId ID of the page for which to add content
		 * @private
		 */
		ViewSettingsPopover.prototype._addPageContents = function(sPageId) {
			var sProperty,
				sType,
				oList,
				aCustomTabs = this.getCustomTabs(),
				sGetPageMethodName = '_getMainPage';

			if (sPageId === 'filterDetail') {
				sGetPageMethodName = '_getDetailsPage';
			}
			for (sProperty in this._tabMap) {
				sType = this._tabMap[sProperty];
				if (sType === sPageId) {
					sType = sType.slice(0, 1).toUpperCase() + sType.slice(1);
					oList = this['_get' + sType + 'List']();
					this[sGetPageMethodName]().addContent(oList);
				}
			}

			if (!(sPageId in this._tabMap)) {
				// custom tabs
				aCustomTabs.forEach(function (oCustomTab) {
					if (oCustomTab.getId() === sPageId) {
						oCustomTab.getContent().forEach(function (oContent) {
							this[sGetPageMethodName]().addContent(oContent);
						}, this);
					}
				}, this);
			}
		};


		/**
		 * Stash items for later use.
		 * @param {Object} mSettings Object holding a collection of settings
		 * @private
		 */
		ViewSettingsPopover.prototype._stashItems = function (mSettings) {
			/* Store the items for later and remove them for the initialization of the control to avoid racing
			 * condition with the initialization of <code>ViewSettingsPopover</code>. This is only required when the items aggregation
			 * is initialized directly with an array of ViewSettingsPopover items without data binding and a template. */
			var aTabs = ['sort','filter','group'];
			aTabs.forEach(function (sType) {
				if (mSettings && Array.isArray(mSettings[sType + 'Items'])) {
					this._stashedItems[sType] = mSettings[sType + 'Items'];
				}
			}, this);
		};

		/**
		 * If any items are stashed, used them and add them to the corresponding aggregation.
		 * @param {array} aStashedItems Stashed items
		 * @private
		 */
		ViewSettingsPopover.prototype._addStashedItems = function (aStashedItems) {
			// re-introduce any existing items from the constructor settings
			var sProperty,
				vStashedItems,
				sStashedItemKey,
				sType;
			for (sProperty in this._tabMap) {
				// sort/filter/group
				var sType = this._tabMap[sProperty];
				vStashedItems = this._stashedItems[sType];

				for (sStashedItemKey in vStashedItems) {
					var oStashedItem = vStashedItems[sStashedItemKey];
					this.addAggregation(sType + 'Items', oStashedItem);
				}
			}
		};

		/**
		 * Handles "back" navigation logic.
		 * @param {Object} oEvent Original event trigger for the "back" action
		 */
		ViewSettingsPopover.prototype._handleBack = function (oEvent) {
			if (this._currentPageId === 'filterDetail') {
				this._showContentFor('filter');
			}
		};

		/**
		 * Creates "select all" checkbox.
		 * @param {array} aFilterSubItems The filter sub-items
		 * @param {Object} oFilterDetailList The filter details list
		 * @returns {sap.m.CheckBox} The created checkBox
		 * @private
		 */
		ViewSettingsPopover.prototype._getSelectAllCheckbox = function (aFilterSubItems, oFilterDetailList) {
			var oCheckBox = sap.ui.getCore().byId(this.getId() + SELECT_ALL_SUFFIX);
			if (oCheckBox) {
				return oCheckBox;
			}

			return new sap.m.CheckBox({
				id: this.getId() + SELECT_ALL_SUFFIX,
				text: 'Select All',
				selected: aFilterSubItems && aFilterSubItems.every(function(oItem) { return oItem && oItem.getSelected(); }),
				select: function(oEvent) {
					var bSelected = oEvent.getParameter('selected');
					//update the list items
					//and corresponding view settings items
					oFilterDetailList.getItems().filter(function(oItem) {
						return oItem.getVisible();
					}).forEach(function(oItem) {
						var oVSDItem = this._findViewSettingsItemFromListItem(oItem);
						oVSDItem.setProperty('selected', bSelected, true);
					}.bind(this));

					this._toggleRemoveFilterItem();
				}.bind(this)
			});
		};


		/**
		 * Creates a single <code>sap.m.List</code>.
		 * @param {string} sType Adds namespace for list's Id to avoid duplicates and make list selections easier
		 * @private
		 */
		ViewSettingsPopover.prototype._createList = function (sType) {
			var oVSPItem,
				sEventName = sType.slice(0,1).toUpperCase() + sType.slice(1),
				oList = new List({
					id : this.getId() + '-' + sType + 'list',
					itemPress: function (oEvent) {
						oVSPItem = this._findViewSettingsItemFromListItem(oEvent.getParameter('listItem'));

						// if we click on an already selected item from grouping or sorting fire select event
						// inside filtering the select event is fired after "OK" button is pressed
						if (sType === 'group' || sType === 'sort') {
							this['fire' + sEventName + 'Selected']({
								items: [oVSPItem]
							});
							this.close();
						}
					}.bind(this),
					selectionChange: function (oEvent) {
						var aFilterItems;
						var aSubItems;
						var aAllDetailItems = [];

						this._updateSelectAllCheckBoxState();
						oVSPItem = this._findViewSettingsItemFromListItem(oEvent.getParameter('listItem'));

						oVSPItem.setProperty('selected', oEvent.getParameter('selected'), true);

						// make sure only one item is selected in single select mode
						if (oList.getMode() !== ListMode.MultiSelect) {
							aFilterItems = this.getFilterItems();
							if (aFilterItems) {
								aFilterItems.forEach(function (oItem) {
									aSubItems = oItem.getItems();
									if (aSubItems) {
										aAllDetailItems = aAllDetailItems.concat(aSubItems);
									}
								});
							}
							aAllDetailItems.forEach(function (oFilterDetailItem) {
								if (
									oFilterDetailItem.getParent().getId() === oVSPItem.getParent().getId() &&
									oFilterDetailItem.getSelected(true) &&
									oFilterDetailItem.getId() !== oVSPItem.getId()
								) {
									oFilterDetailItem.setProperty('selected', false, true);
								}
							});
						}

						if (sType === 'filterDetail') {
							sEventName = 'Filter';
						} else {
							this['fire' + sEventName + 'Selected']({
								items: [oVSPItem]
							});
							this.close();
						}

						switch (sType) {
							case 'group':
								// add 'no grouping' option
								this._getGroupList().addItem(this._getRemoveGroupingItem());
								break;
						}
					}.bind(this)
				});

			if (sType !== 'filter') {
				oList.setMode(ListMode.SingleSelectMaster);
			}
			this['_' + sType + 'List'] = oList;
		};

		/**
		 * Returns or create list item for removing any existing grouping.
		 * @returns {sap.m.StandardListItem} List item for removing any existing grouping
		 * @private
		 */
		ViewSettingsPopover.prototype._getRemoveGroupingItem = function () {
			if (!this._removeGroupingItem) {
				this._removeGroupingItem = new StandardListItem({
					id: this.getId() + '-nogrouping',
					title: this._getText('NO_GROUPING'),
					type: ListType.Active
				});
			}
			return this._removeGroupingItem;
		};

		/**
		 * Returns or creates list item for removing any existing filtering.
		 * @returns {sap.m.StandardListItem|*} List item for removing any existing filtering
		 * @private
		 */
		ViewSettingsPopover.prototype._getRemoveFilterItem = function () {
			if (!this._removeFilteringItem) {
				this._removeFilteringItem = new StandardListItem({
					id: this.getId() + '-nofiltering',
					title: this._getText('REMOVE_FILTER'),
					type: ListType.Active,
					press: function () {
						this.getFilterItems().forEach(function (oFilterItem) {
							oFilterItem.getItems().forEach(function (oSubItem) {
								oSubItem.setProperty('selected', false, true);
							});
						});

						this.close();

						// self destruct
						this._removeFilteringItem.destroy();
						this._removeFilteringItem = null;
					}.bind(this)
				});
			}
			return this._removeFilteringItem;
		};

		/**
		 * Create <code>sap.m.SegmentedButtonItem</code> for the <code>customTab</code>.
		 * @param {sap.m.ViewSettingsCustomTab} oCustomTab custom tab for which should be created SegmentedButtonItem
		 * @returns {sap.m.SegmentedButtonItem}
		 * @private
		 */
		ViewSettingsPopover.prototype._getTabButtonItem = function (oCustomTab) {
			var sButtonId = this.getId() + oCustomTab.getId() + CUSTOM_TAB_SUFFIX,
				oButton = sap.ui.getCore().byId(sButtonId);

			if (oButton) {
				return oButton;
			} else {
				return new sap.m.SegmentedButtonItem({
					key     : sButtonId,
					id      : sButtonId,
					icon    : oCustomTab.getIcon(),
					tooltip : oCustomTab.getTooltip()
				});
			}
		};

		/**
		 * Adds <code>sap.m.SegmentedButtonItem</code>.
		 * @param {string} sType Type of item to add
		 * @private
		 */
		ViewSettingsPopover.prototype._addPredefinedTab = function (sType) {
			var sIconName = this._tabMap[sType];

			switch (sIconName) {
			case 'group':
				sIconName = sIconName + '-2';
				break;
			}
			var oNewButton = new sap.m.SegmentedButtonItem({
				key: sType,
				icon : IconPool.getIconURI(sIconName),
				tooltip : this._getText("VIEWSETTINGS_TITLE_" + sType.toUpperCase()),
				press: function onTabPress (oEvent) {
					var sPageId = oEvent.getSource().getProperty('key');
					var aItems = this['get' + sPageId.slice(0, 1).toUpperCase() + sPageId.slice(1) + 'Items']();
					if (this._currentPageId === sPageId || this._currentPageId === this._tabMap['filterDetail'] && aItems && aItems.length > 1) {
						if (Device.system.phone) {
							this._cancel();
						} else {
							this._hideContent();
						}
					} else {
						if (aItems && aItems.length === 1) {
							if (sPageId !== 'filter') {
								// if there's a single item for 'sort' and 'group' - directly consider it as selected
								aItems.forEach(function (oItem) {
									// toggle selection property
									oItem.setSelected(!oItem.getSelected());
								});
								this['fire' + sPageId.slice(0, 1).toUpperCase() + sPageId.slice(1) + 'Selected']({
									items: aItems
								});
								this.close();
							} else {
								this._showContentFor('filterDetail', this._findListItemFromViewSettingsItem(aItems[0]), true);
							}
						} else {
							this._showContentFor(sPageId);
						}
					}
				}.bind(this)
			});

			switch (sType) {
			case 'sort':
				this._getSegmentedButton().insertItem(oNewButton, 0);
				break;
			case 'filter':
				this._getSegmentedButton().insertItem(oNewButton, 1);
				break;
			case 'group':
				this._getSegmentedButton().insertItem(oNewButton, 2);
				break;
			}
		};

		/**
		 * Overwrites the aggregation setter in order to have ID validation logic as some strings
		 * are reserved for the predefined tabs.
		 *
		 * @overwrite
		 * @public
		 * @param {sap.m.ViewSettingsCustomTab} oCustomTab The custom tab to be added
		 * @returns {sap.m.ViewSettingsPopover} this pointer for chaining
		 */
		ViewSettingsPopover.prototype.addCustomTab = function (oCustomTab) {
			var sId = oCustomTab.getId();
			if (sId === 'sort' || sId === 'filter' || sId === 'group') {
				throw new Error('Id "' + sId + '" is reserved and cannot be used as custom tab id.');
			}
			this.addAggregation('customTabs', oCustomTab);
			if (!this._isEmptyCustomTab(oCustomTab)) {
				var oButton = this._getTabButtonItem(oCustomTab);
				oButton.attachEvent("press", this._handleCustomTabPress, this);
				// add custom tab to segmented button
				this._getSegmentedButton().addItem(oButton);
			}
			return this;
		};

		ViewSettingsPopover.prototype._handleCustomTabPress = function (oEvent) {
			var i,
				oCustomTab,
				sCustomTabButtonId,
				sCurrentPage,
				aCustomTabs = this.getCustomTabs(),
				iCustomTabsLength = aCustomTabs.length,
				sPageId = oEvent.getParameter('id');

			for (i = 0; i < iCustomTabsLength; i++) {
				oCustomTab = aCustomTabs[i];
				sCustomTabButtonId = this.getId() + oCustomTab.getId() + CUSTOM_TAB_SUFFIX;
				sCurrentPage = this.getId() + this._currentPageId + CUSTOM_TAB_SUFFIX;

				if (sCurrentPage === sPageId) {
					if (Device.system.phone) {
						this._cancel();
						break;
					} else {
						this._hideContent();
						break;
					}
				} else {
					if (!this._isEmptyCustomTab(oCustomTab) && sPageId === sCustomTabButtonId) {
						this._showContentFor(oCustomTab.getId());
						break;
					}
				}
			}
		};

		/**
		 * Hides content and collapses in toolbar view.
		 */
		ViewSettingsPopover.prototype._hideContent = function () {
			this._removeSegmentedButtonSelection();
			this._cleanAfterClose();
			jQuery.sap.delayedCall(0, this, '_adjustInitialWidth');
		};


		/**
		 * Cleans up the state after close.
		 * @private
		 */
		ViewSettingsPopover.prototype._cleanAfterClose = function () {
			this._removePageContents(this._currentPageId);
			this._getPopover().setContentHeight(this._initialHeight);
			this._removeFooter();
			this._navigateToPage('Main');
			this._currentPageId = null;
		};


		/**
		 * Removes <code>sap.m.SegmentedButtonItem</code>.
		 * @param {string} sType Type of item to remove
		 * @private
		 */
		ViewSettingsPopover.prototype._removePredefinedTab = function (sType) {
			var aTabs = this._getSegmentedButton().getItems();

			aTabs.forEach(function (oItem) {
				if (oItem.getKey() === sType.toLowerCase()) {
					this._getSegmentedButton().removeItem(oItem);
				}
			}, this);
			if (this._currentPageId === sType.toLowerCase()) {
				this._showContentFor(this._determinePageToOpen());
			}
		};

		/**
		 * Removes <code>sap.m.SegmentedButtonItem</code>.
		 * @param {Object} oObject if given only the button for that custom tab will be removed
		 * @private
		 */
		ViewSettingsPopover.prototype._removeCustomTab = function (oObject) {
			var bShouldRemovePage,
				sCustomTabButtonId,
				sCurrentCustomPageId = this.getId() + this._currentPageId + CUSTOM_TAB_SUFFIX,
				bObjectIsCustomTabButton = false,
				aTabs = this._getSegmentedButton().getItems();

			aTabs.forEach(function (oItem) {
				if (oItem.getKey().indexOf(CUSTOM_TAB_SUFFIX) !== -1) {
					if (oObject) {
						bShouldRemovePage = (this._currentPageId === oObject.getId());
						sCustomTabButtonId = this.getId() + oObject.getId() + CUSTOM_TAB_SUFFIX;
						bObjectIsCustomTabButton = (oObject && sCustomTabButtonId === oItem.getId());
					} else {
						bShouldRemovePage = (sCurrentCustomPageId === oItem.getId());
					}

					if (!oObject || bObjectIsCustomTabButton) {
						this._getSegmentedButton().removeItem(oItem);
					}
					// if the opened page belongs to the removed item of the segementedButton
					// it will be removed also and we should find which page should be opened on its place
					if (bShouldRemovePage) {
						this._showContentFor(this._determinePageToOpen());
					}
				}
			}, this);
		};

		/**
		 * Gets <code>LabelledBy</code> association or create label and return its ID
		 * @returns {sap.ui.core.InvisibleText} The created label
		 * @private
		 */
		ViewSettingsPopover.prototype._getPopoverAriaLabel = function () {
			var sLabel = this.getAssociation("ariaLabelledBy");
			if (!sLabel) {
				sLabel = new InvisibleText({
					text: this._getText("ARIA_LABELLED_BY_POPOVER")
				}).toStatic().getId();
				this.setAssociation("ariaLabelledBy", sLabel, true);
			}
			return sLabel;
		};

		/**
		 * Determine if a string is actually a name of one of the items aggregations.
		 * @param {string} sAggregationName Suggested name of aggregation
		 * @returns {boolean} Whether a string is actually a name of one of the items aggregations
		 * @private
		 */
		ViewSettingsPopover.prototype._isItemsAggregation = function (sAggregationName) {
			var aItemsAggregations = [];
			var sPropertyKey;
			for (sPropertyKey in this._tabMap) {
				aItemsAggregations.push(sPropertyKey + 'Items');
			}
			if (aItemsAggregations.indexOf(sAggregationName) === -1) {
				return false;
			}
			return true;
		};

		/**
		 * Adds an entity <code>oObject</code> to the aggregation identified by <code>sAggregationName</code>.
		 *
		 * @param {string} sAggregationName The name of the aggregation where the new entity is to be added
		 * @param {any} oObject The value of the aggregation to be added
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.ViewSettingsPopover} <code>this</code> pointer for chaining
		 * @override
		 */
		ViewSettingsPopover.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			if (this._isItemsAggregation(sAggregationName)) {
				(!this.getAggregation(sAggregationName) || this.getAggregation(sAggregationName).length === 0) && this._addPredefinedTab(sAggregationName.replace('Items', ''));
				this._handleItemsAggregation.call(this, ['addAggregation', sAggregationName, oObject, bSuppressInvalidate], true);
			}
			return Control.prototype.addAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		};

		/**
		 * Inserts an entity to the aggregation named <code>sAggregationName</code> at position <code>iIndex</code>.
		 *
		 * @param {string} sAggregationName The name of the aggregation
		 * @param {any} oObject The value of the aggregation to be inserted
		 * @param {int} iIndex Where to insert
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.ViewSettingsPopover} <code>this</code> pointer for chaining
		 * @override
		 */
		ViewSettingsPopover.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			if (this._isItemsAggregation(sAggregationName)) {
				(!this.getAggregation(sAggregationName) || this.getAggregation(sAggregationName).length === 0) && this._addPredefinedTab(sAggregationName.replace('Items', ''));
				this._handleItemsAggregation.call(this, ['insertAggregation', sAggregationName, oObject, iIndex, bSuppressInvalidate], true);
			}
			return Control.prototype.insertAggregation.call(this, sAggregationName, oObject, iIndex, bSuppressInvalidate);
		};

		/**
		 * Removes an entity from the aggregation named <code>sAggregationName</code>.
		 *
		 * @param {string} sAggregationName The name of the aggregation
		 * @param {any} oObject The value of aggregation to be removed
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.ViewSettingsPopover} <code>this</code> pointer for chaining
		 * @override
		 */
		ViewSettingsPopover.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			if (this._isItemsAggregation(sAggregationName)) {
				this._handleItemsAggregation.call(this, ['removeAggregation', sAggregationName, oObject, bSuppressInvalidate]);
				if (!this['getAggregation'](sAggregationName)) {
					this._removePredefinedTab(sAggregationName.replace('Items', ''));
				}
			} else {
				this._removeCustomTab(oObject);
			}
			return Control.prototype.removeAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		};

		/**
		 * Removes all objects from the aggregation named <code>sAggregationName</code>.
		 *
		 * @param {string} sAggregationName The name of aggregation
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.ViewSettingsPopover} <code>this</code> pointer for chaining
		 * @override
		 */
		ViewSettingsPopover.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
			if (this._isItemsAggregation(sAggregationName)) {
				this._handleItemsAggregation.call(this, ['removeAllAggregation', sAggregationName, null, bSuppressInvalidate]);
				this._removePredefinedTab(sAggregationName.replace('Items', ''));
			} else {
				this._removeCustomTab();
			}
			return Control.prototype.removeAllAggregation.call(this, sAggregationName, bSuppressInvalidate);
		};

		/**
		 * Destroys all the entities in the aggregation named <code>sAggregationName</code>.
		 *
		 * @param {string} sAggregationName The name of aggregation
		 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation
		 * @returns {sap.m.ViewSettingsPopover} <code>this</code> pointer for chaining
		 * @override
		 */
		ViewSettingsPopover.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
			if (this._isItemsAggregation(sAggregationName)) {
				var sType = sAggregationName.replace('Items', '');
				this._handleItemsAggregation.call(this, ['destroyAggregation', sAggregationName, bSuppressInvalidate]);
				this._removePredefinedTab(sType.slice(0,1).toUpperCase() + sType.slice(1));
			} else if (this._segmentedButton) {
				// check if the segmentedButton exists before removing some of its buttons
				this._removeCustomTab();
			}
			return Control.prototype.destroyAggregation.call(this, sAggregationName, bSuppressInvalidate);
		};

		/**
		 * Ensures proper handling of <code>ViewSettingsPopover</code> <code>items</code> aggregation> and proxies to the list <code>items</code> aggregation.
		 *
		 * @param {array} aArgs
		 * @param {boolean} bIsAdding
		 * @returns {sap.m.ViewSettingsPopover} <code>this</code> instance for chaining
		 */
		ViewSettingsPopover.prototype._handleItemsAggregation = function (aArgs, bIsAdding) {
			var sFunctionName = aArgs[0],
				sAggregationName = aArgs[1],
				oObject = aArgs[2],
				aNewArgs = aArgs.slice(1);

			// no need to handle anything else for other aggregations than 'items'
			if (!this._isItemsAggregation(sAggregationName)) {
				return this;
			}

			if (bIsAdding) {
				// attach and detach (or only detach if not adding) event listeners for the item
				this._handleItemEventListeners(oObject);
			}

			this._handleListItemsAggregation(aNewArgs,  bIsAdding, sFunctionName, oObject);
			return this;
		};

		/**
		 * Ensures proper handling of <code>ViewSettingsPopover</code> <code>items</code> aggregation and proxies to the List <code>items</code> aggregation.
		 *
		 * @param {array} aArgs
		 * @param {boolean} bIsAdding
		 * @param {string} sFunctionName
		 * @param {Object} oObject
		 * @returns {*}
		 */
		ViewSettingsPopover.prototype._handleListItemsAggregation = function (aArgs, bIsAdding, sFunctionName, oObject) {
			var oList,
				oListItem,
			// a new instance, holding a copy of the ViewSettingsItem which is given to the List instance
				oDerivedObject,
				sProperty,
				sType,
				sAggregationName = aArgs[0],
				bHasDetailsPage = false;

			switch (sAggregationName) {
				case 'sortItems':
					oList = this._getSortList();
					break;
				case 'groupItems':
					oList = this._getGroupList();
					break;
				case 'filterItems':
					oList = this._getFilterList();
					break;
				case 'filterDetailItems':
					oList = this._getFilterDetailList();
					break;
			}

			if (sFunctionName === 'destroyAggregation' && !oList) {
				return;
			}
			// destroyAggregation and removeAllAggregation no not need oObject, action can be directly taken
			if (oObject === null || typeof oObject !== 'object') {
				return oList[sFunctionName]['apply'](oList, aArgs);
			}

			if (bIsAdding) {
				bHasDetailsPage = sAggregationName === 'filterItems' && oObject.getItems;
				oDerivedObject = this._createListItemFromViewSettingsItem(oObject, sAggregationName.replace("Items", ""), bHasDetailsPage);
			} else {
				oDerivedObject = this._findListItemFromViewSettingsItem(oObject);
			}

			// substitute the <code>ViewSettingsPopover</code> item instance with the ListItem instance
			aArgs.forEach(function (oItem, iIndex) {
				if (oItem && typeof oItem === 'object') {
					aArgs[iIndex] = oDerivedObject;
				}
			});

			// the aggregation in oList is called 'items', so the first argument needs to be altered
			for (sProperty in this._tabMap) {
				sType = this._tabMap[sProperty];
				aArgs[0] = aArgs[0].replace(sType + 'I', 'i');
			}

			oListItem = oList[sFunctionName].apply(oList, aArgs);

			// If listItem is removed/detached, it should be destroyed as it's not needed anymore
			if (sFunctionName == 'removeAggregation') {
				oListItem.destroy();
			}

			switch (sAggregationName) {
				case 'filterItems':
					this._toggleRemoveFilterItem();
					break;
			}

			return oListItem;
		};


		/**
		 * Adds or removes the option to clear any selected filters.
		 * @private
		 */
		ViewSettingsPopover.prototype._toggleRemoveFilterItem = function () {
			var bHasFilter = false;

			this.getFilterItems().forEach(function (oFilterItem) {
				if (oFilterItem.getItems) {
					oFilterItem.getItems().forEach(function (oSubItem) {
						if (oSubItem.getSelected()) {
							bHasFilter = true;
						}
					});
				}
			});

			if (bHasFilter) {
				// add 'Remove Filter' option
				if (!this._getRemoveFilterItem().getParent()) {
					this._getFilterList().addItem(this._getRemoveFilterItem());
				}
			} else {
				if (this._removeFilteringItem) {
					this._removeFilteringItem.destroy();
					this._removeFilteringItem = null;
				}
			}
		};

		/**
		 * Attaches and detaches any previously added event handlers.
		 *
		 * @param {Object} oObject The <code>ViewSettingsItem</code> instance on which events will be attached
		 * @private
		 */
		ViewSettingsPopover.prototype._handleItemEventListeners = function (oObject) {
			if (oObject instanceof ViewSettingsItem && oObject.getId().indexOf('nogrouping') === -1) {
				// make sure we always have one listener at a time only
				oObject.detachItemPropertyChanged(this._handleViewSettingsItemPropertyChanged, this);
				oObject.attachItemPropertyChanged(this._handleViewSettingsItemPropertyChanged, this);
			}

			if (oObject instanceof sap.m.ViewSettingsFilterItem) {
				oObject.detachFilterDetailItemsAggregationChange(this._handleFilterDetailItemsAggregationChange, this);
				oObject.attachFilterDetailItemsAggregationChange(this._handleFilterDetailItemsAggregationChange, this);
			}
		};

		/**
		 * Handles ViewSettingsItem property change
		 *
		 * @param {Object} oEvent The fired event
		 * @private
		 */
		ViewSettingsPopover.prototype._handleViewSettingsItemPropertyChanged = function (oEvent) {
			var oItem = oEvent.getParameter('changedItem');
			var oListItem = this._findListItemFromViewSettingsItem(oItem);
			var sParamKey = oEvent.getParameter('propertyKey');
			var vNewValue = oEvent.getParameter('propertyValue');
			if (sParamKey === 'text') {
				sParamKey = 'title';
			}

			if (oListItem && ['key', 'multiSelect'].indexOf(sParamKey) == -1) {
				oListItem.setProperty(sParamKey, vNewValue);
			}
		};

		/**
		 * Handles FilterDetailItem aggregation change to redraw its corresponding list item
		 *
		 * @param {Object} oEvent The fired event
		 * @private
		 */
		ViewSettingsPopover.prototype._handleFilterDetailItemsAggregationChange = function (oEvent) {
			var mParameters = oEvent.getParameters(),
				oItem = mParameters.item || mParameters.changedItem;

			// Update filterDetails layout
			if (oItem && oItem.getParent && oItem.getParent() instanceof ViewSettingsItem) {
				this._updateFilterDetailListFor(oItem.getParent());
			}
		};

		/**
		 * Ensures proper <code>ViewSettingsItem</code> inheritance in context of List.
		 *
		 * @param {Object} oViewSettingsItem The sap.m.ViewSettingsItem to be inherit
		 * @param {string} sType Its type
		 * @param {boolean} bHasDetailsPage Whether it has details page
		 * @returns {sap.ui.core.Element} The created list item
		 */
		ViewSettingsPopover.prototype._createListItemFromViewSettingsItem = function (oViewSettingsItem, sType, bHasDetailsPage) {
			var oListItem,
				sSuffix = LIST_ITEMS_SUFFIX;

			if (!oViewSettingsItem && !(oViewSettingsItem instanceof ViewSettingsItem)) {
				jQuery.sap.log.error('Expecting instance of "sap.m.ViewSettingsItem": instead of ' + oViewSettingsItem + ' given.');
				return;
			}

			switch (sType) {
				case "group":
					sSuffix += LIST_ITEMS_SUFFIX_GROUP;
					break;
				case "filter":
					sSuffix += LIST_ITEMS_SUFFIX_FILTER;
					break;
				case "sort":
					sSuffix += LIST_ITEMS_SUFFIX_SORT;
					break;
			}

			oListItem = new StandardListItem({
				id      : oViewSettingsItem.getId() + sSuffix,
				title   : oViewSettingsItem.getText(),
				type    : ListType.Active
			});
			bHasDetailsPage && oListItem.attachPress(this._showContentFor.bind(this, 'filterDetail', oListItem, false)) && oListItem.setType(ListType.Navigation);

			return oListItem;
		};

		/**
		 * Finds the correct <code>ViewSettingsItem</code> in context of <code>ViewSettingsPopover</code> by a given <code>StandardListItem</code> instance.
		 *
		 * @param {sap.m.ViewSettingsItem} oListItem The <code>ViewSettingsItem</code> instance which analogue is to be found
		 * @returns {sap.m.ViewSettingsItem} The <code>ViewSettingsItem</code> in context of List found (if any)
		 */
		ViewSettingsPopover.prototype._findViewSettingsItemFromListItem = function (oListItem) {
			var sSearchSuffix = LIST_ITEMS_SUFFIX;
			if (oListItem.getId().indexOf('filterdetail') !== -1) {
				sSearchSuffix = FILTERDETAIL_LIST_ITEMS_SUFFIX;
			}
			return sap.ui.getCore().byId(oListItem.getId().split(sSearchSuffix).shift());
		};

		/**
		 * Finds the correct <code>ViewSettingsItem</code> in context of List by a given <code>ViewSettingsItem</code> instance.
		 *
		 * @param {sap.m.ViewSettingsItem} oViewSettingsItem The <code>ViewSettingsItem</code> instance which analogue is to be found
		 * @returns {sap.m.ViewSettingsItem} The <code>ViewSettingsItem</code> in context of List found (if any)
		 */
		ViewSettingsPopover.prototype._findListItemFromViewSettingsItem = function (oViewSettingsItem) {
			var sBase = oViewSettingsItem.getId() + LIST_ITEMS_SUFFIX,
				oItem = sap.ui.getCore().byId(sBase + LIST_ITEMS_SUFFIX_GROUP) ||
					sap.ui.getCore().byId(sBase + LIST_ITEMS_SUFFIX_FILTER) ||
					sap.ui.getCore().byId(sBase + LIST_ITEMS_SUFFIX_SORT);

			if (!oItem) {
				oItem = sap.ui.getCore().byId(oViewSettingsItem.getId() + FILTERDETAIL_LIST_ITEMS_SUFFIX);
			}
			return oItem;
		};

		/**
		 * Returns a reference to the <code>sap.m.Page</code> main page internal aggregation or create it.
		 * @returns {sap.m.Page} Main page instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getMainPage = function () {
			if (!this._mainPage) {
				this._mainPage = new Page({
					showHeader: false,
					id: this._getMainPageId()
				});
			}
			return this._mainPage;
		};

		/**
		 * Returns a reference to the <code>sap.m.Page</code> details page internal aggregation or create it.
		 * @returns {sap.m.Page} Details page instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getDetailsPage = function () {
			var oBackButton,
				oDetailHeader;
			if (!this._detailsPage) {
				this._detailsPage = new Page({
					showHeader: true,
					id        : this._getDetailsPageId()
				});

				var oTitle = new sap.m.Label({
					text: this._getText("VIEWSETTINGS_TITLE")
				}).addStyleClass("sapMVSDTitle");

				oDetailHeader = new Bar({
					contentMiddle: [oTitle]
				}).addStyleClass("sapMVSPCompactHeaderBar");

				this._getDetailsPage().addHeaderContent(oDetailHeader);

				// create back button here, as it is meant to be present only on the details page
				oBackButton = new Button(this.getId() + BACK_BUTTON_SUFFIX, {
					icon : IconPool.getIconURI("nav-back"),
					press: this._handleBack.bind(this)
				});
				oDetailHeader.addContentLeft(oBackButton);
			}
			return this._detailsPage;
		};

		/**
		 * Returns the id of the main page.
		 * @returns {Object} Main page instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getMainPageId = function () {
			return this.getId() + MAIN_PAGE_SUFFIX;
		};

		/**
		 * Returns the id of the details.
		 * @returns {Object} Details page instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getDetailsPageId = function () {
			return this.getId() + DETAILS_PAGE_SUFFIX;
		};

		/**
		 * Returns a reference to {sap.m.Popover} instance or creates one if it doesn't exist.
		 * @param {Object} oOpener Instance of the control that triggered the opening
		 * @returns {Object} Popover instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getPopover = function (oOpener) {
			if (!this._popover) {
				this._popover = new ResponsivePopover({
					showHeader     : true,
					contentWidth   : "300px",
					placement      : VerticalPlacementType.Vertical,
					showCloseButton: false,
					modal          : false,
					afterOpen      : function (oEvent) {
						this.fireAfterOpen({openBy: oEvent.getParameter("openBy")});
						this.$().attr("aria-labelledby", this._getPopoverAriaLabel());
						this._getSegmentedButton().getFocusDomRef().focus(); // focus first tab button after toolbar open
					}.bind(this),
					afterClose     : function (oEvent) {
						this._cleanAfterClose();
						this.fireAfterClose({openBy: oEvent.getParameter("openBy")});
					}.bind(this),
					beforeOpen     : function (oEvent) {
						this.fireBeforeOpen({openBy: oEvent.getParameter("openBy")});
					}.bind(this),
					beforeClose    : function (oEvent) {
						this.fireBeforeClose({openBy: oEvent.getParameter("openBy")});
					}.bind(this)
				}).addStyleClass('sapMVSPopover');
				this._popover.setCustomHeader(this._getToolbar());

				if (this._popover.getAggregation('_popup').setShowArrow) {
					this._popover.getAggregation('_popup').setShowArrow(false);
				}
			}

			if (oOpener  && oOpener.$()) {
				this._popover.setOffsetY(-oOpener.$().outerHeight());
			}
			return this._popover;
		};

		/**
		 * Returns a reference to <code>sap.m.NavContainer</code> instance or create new one if it doesn't exist.
		 * @private
		 * @returns {Object} NavContainer instance
		 */
		ViewSettingsPopover.prototype._getNavContainer = function () {
			if (!this._navContainer) {
				this._navContainer = new NavContainer(this.getId() + NAV_CONTAINER_SUFFIX, {
					initialPage: this._getMainPageId(),
					pages      : [this._getMainPage(), this._getDetailsPage()]
				});
			}
			return this._navContainer;
		};

		/**
		 * Returns a reference to the sort list internal aggregation.
		 * @returns {Object} Sort list instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getSortList = function () {
			if (!this._sortList) {
				this._createList('sort');
			}
			return this._sortList;
		};

		/**
		 * Returns a reference to the group list internal aggregation.
		 * @returns {Object} Group list instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getGroupList = function () {
			if (!this._groupList) {
				this._createList('group');
			}
			return this._groupList;
		};

		/**
		 * Returns a reference to the filter list internal aggregation.
		 * @returns {Object} Filter list instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getFilterList = function () {
			if (!this._filterList) {
				this._createList('filter');
			}
			return this._filterList;
		};

		/**
		 * Returns a reference to the filter  detail list internal aggregation.
		 * @returns {Object} Filter list instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getFilterDetailList = function () {
			if (!this._filterDetailList) {
				this._createList('filterDetail');
				this._filterDetailList.attachEvent('selectionChange', function () {
					this._toggleRemoveFilterItem();
				}.bind(this));
			}
			return this._filterDetailList;
		};

		/**
		 * Returns a reference to the <code>sap.m.Toolbar</code> toolbar internal instance or create it.
		 * @returns {sap.m.Toolbar} Toolbar instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getToolbar = function () {
			if (!this._toolbar) {
				var oCloseBtn;

				this._toolbar = new Toolbar({
					id: this.getId() + TOOLBAR_SUFFIX
				});

				// create close button
				oCloseBtn = new Button({
					icon: IconPool.getIconURI("decline"),
					press: this._cancel.bind(this)
				}).addStyleClass('sapMVSPCloseBtn');

				this._toolbar.addContent(this._getSegmentedButton());
				this._toolbar.addContent(new ToolbarSpacer());
				this._toolbar.addContent(oCloseBtn);
			}
			return this._toolbar;
		};

		/**
		 * Returns a reference to the <code>sap.m.Label</code> title internal instance or create it.
		 * @returns {Object} Toolbar instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getTitle = function () {
			if (!this._title) {
				this._title = new sap.m.Label(this.getId() + "-title", {
					id  : this.getId() + TITLE_SUFFIX,
					text: this._getText("VIEWSETTINGS_TITLE")
				}).addStyleClass("sapMVSDTitle");
			}
			return this._title;
		};

		/**
		 * Returns a reference to the search field instance.
		 * @returns {Object} Search instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getSearchField = function () {
			if (!this._filterSearchField) {
				this._filterSearchField = new sap.m.SearchField({
					id: this.getId() + SEARCH_FIELD_SUFFIX,
					liveChange: function (oEvent) {
						this._filterItemsBy(oEvent.getParameter('newValue').toLowerCase());
					}.bind(this)
				});

				//update Select All checkbox
				this._updateSelectAllCheckBoxState();
			}
			return this._filterSearchField;
		};

		/**
		 * Applies string query filter to the list of visible items.
		 * @param {string} sQuery String to filter the items by
		 * @private
		 */
		ViewSettingsPopover.prototype._filterItemsBy = function (sQuery) {
			//update the list items visibility
			this._getFilterDetailList().getItems().forEach(function (oItem) {
				var bStartsWithQuery = oItem.getTitle().toLowerCase().indexOf(sQuery) === 0;
				oItem.setVisible(bStartsWithQuery);
			});

			//update Select All checkbox
			this._updateSelectAllCheckBoxState();
		};

		/**
		 * Returns a reference to the segmented button internal aggregation.
		 * @returns {Object} Segmented button instance
		 * @private
		 */
		ViewSettingsPopover.prototype._getSegmentedButton = function () {
			if (!this._segmentedButton) {
				this._segmentedButton = new SegmentedButton(this.getId() + SEGMENTED_BUTTON_SUFFIX);
			}
			return this._segmentedButton;
		};

		/**
		 * Gets text translation from resource bundle.
		 * @param {string} sKey Key corresponding to a word or phrase
		 * @returns {string} Translated string
		 * @private
		 */
		ViewSettingsPopover.prototype._getText = function (sKey) {
			return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText(sKey);
		};

		/**
		 * Gets dom object corresponding to this control.
		 * @param {string} sSuffix Suffix
		 * @returns {boolean|*|string|HTMLElement|HTMLElement|sap.m.ViewSettingsPopover}
		 * @override
		 */
		ViewSettingsPopover.prototype.getDomRef = function (sSuffix) {
			return this._popover && this._popover.getAggregation("_popup").getDomRef(sSuffix);
		};

		//ToDo: this is taken from MessagePopover, but those auto generated methods are not having doc blocks this way - check if it's ok
		// proxy several methods to the inner popover instance
		["invalidate", "close", "isOpen", "addStyleClass", "removeStyleClass", "toggleStyleClass", "hasStyleClass", "setBindingContext", "getBindingContext", "getBinding", "getBindingInfo", "getBindingPath", "setBusy", "getBusy", "setBusyIndicatorDelay", "getBusyIndicatorDelay"].forEach(function(sName){
			ViewSettingsPopover.prototype[sName] = function() {
				if (this._popover && this._popover[sName]) {
					var res = this._popover[sName].apply(this._popover ,arguments);
					return res === this._popover ? this : res;
				}
			};
		});

		/**
		 * Cleans up instance properties.
		 */
		ViewSettingsPopover.prototype.exit = function () {
			if (this._sortList) {
				this._sortList.destroy();
				this._sortList = null;
			}
			if (this._filterList) {
				this._filterList.destroy();
				this._filterList = null;
			}
			if (this._filterDetailList) {
				this._filterDetailList.destroy();
				this._filterDetailList = null;
			}
			if (this._groupList) {
				this._groupList.destroy();
				this._groupList = null;
			}

			this._popover.destroy();
			this._popover = null;

			this._title = null;
			this._navContainer = null;
			this._mainPage = null;
			this._detailsPage = null;
			this._toolbar = null;
			this._segmentedButton = null;
			this._currentPageId = null;
			this._tabMap = null;
			this._oPreviousSelectedFilters  = null;

			// Tries to destroy that association as it could be created internally
			var oLabel = sap.ui.getCore().byId(this.getAssociation("ariaLabelledBy"));
			if (oLabel && oLabel.destroy && !oLabel.bIsDestroyed) {
				oLabel.destroy();
				oLabel = null;
			}

			if (this._removeFilteringItem) {
				this._removeFilteringItem.destroy();
				this._removeFilteringItem = null;
			}
		};

		/**
		 * Checks whether a custom tab instance is empty.
		 * @param {sap.m.ViewSettingsCustomTab} oCustomTab the tab to be checked
		 * @returns {boolean} Whether the tab is empty
		 * @private
		 */
		ViewSettingsPopover.prototype._isEmptyCustomTab = function (oCustomTab) {
			/*  if the tab has no content check if the content aggregation
			 is not currently transferred to the main page instance - if the last page content
			 corresponds to the tab id that must be the case */
			var bCustomTabContent = oCustomTab.getContent().length,
				bCustomTabContentInsideMainPage = this._currentPageId === oCustomTab.getId() && this._getMainPage().getContent().length;

			return !(bCustomTabContent || bCustomTabContentInsideMainPage);
		};

		function isLastPageContentCustomTab() {
			return (this._getMainPage().getContent().length && !(this._currentPageId in this._tabMap));
		}

		return ViewSettingsPopover;
	});
