/*!
 * ${copyright}
 */

// Provides control sap.m.ViewSettingsDialog.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, IconPool) {
		"use strict";



		/**
		 * Constructor for a new ViewSettingsDialog.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * ViewSettingsDialog provides functionality to easily select the options for sorting, grouping, and filtering data. It is a composite control, consisting of a modal popover and several internal lists. There are three different tabs (Sort, Group, Filter) in the dialog that can be activated by filling the respecive associations. If only one assication is filled, the other tabs are automatically hidden. The selected options can be used to create sorters and filters for the table.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.16
		 * @alias sap.m.ViewSettingsDialog
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ViewSettingsDialog = Control.extend("sap.m.ViewSettingsDialog", /** @lends sap.m.ViewSettingsDialog.prototype */ { metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Title of the dialog. If not set, the dialog uses the default "View" or "Sort", "Group", "Filter" respectively if there is only one active tab.
				 */
				title : {type : "string", group : "Behavior", defaultValue : null},

				/**
				 * If set to true, the sort order is descending, otherwise ascending (default).
				 */
				sortDescending : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * If set to true, the group order is descending, otherwise ascending (default).
				 */
				groupDescending : {type : "boolean", group : "Behavior", defaultValue : false}
			},
			aggregations : {

				/**
				 * List of items with key and value that can be sorted over (e.g. a list of columns for a table).
				 */
				sortItems : {type : "sap.m.ViewSettingsItem", multiple : true, singularName : "sortItem", bindable : "bindable"},

				/**
				 * List of items with key and value that can be grouped on (e.g. a list of columns for a table).
				 */
				groupItems : {type : "sap.m.ViewSettingsItem", multiple : true, singularName : "groupItem", bindable : "bindable"},

				/**
				 * List of items with key and value that can be filtered on (e.g. a list of columns for a table). A filterItem is associated with one or more detail filters.
				 */
				filterItems : {type : "sap.m.ViewSettingsItem", multiple : true, singularName : "filterItem", bindable : "bindable"},

				/**
				 * List of preset filter items that allow the selection of more complex or custom filters. These entries are displayed at the top of the filter tab.
				 */
				presetFilterItems : {type : "sap.m.ViewSettingsItem", multiple : true, singularName : "presetFilterItem", bindable : "bindable"}
			},
			associations : {

				/**
				 * Sort item that is selected. It can be set by either passing a key or the item itself to the function "setSelectedSortItem"
				 */
				selectedSortItem : {type : "sap.m.ViewSettingsItem", multiple : false},

				/**
				 * Group item that is selected. It can be set by either passing a key or the item itself to the function "setSelectedGrouptItem"
				 */
				selectedGroupItem : {type : "sap.m.ViewSettingsItem", multiple : false},

				/**
				 * Preset filter item that is selected. It can be set by either passing a key or the item itself to the function "setSelectedPresetFilterItem". Note that either a preset filter OR multiple detail filters can be active at the same time.
				 */
				selectedPresetFilterItem : {type : "sap.m.ViewSettingsItem", multiple : false}
			},
			events : {

				/**
				 * The event indicates that the user has pressed the OK button and the selected sort, group, and filter settings should be applied to the data on this page.
				 */
				confirm : {
					parameters : {

						/**
						 * Selected sort item.
						 */
						sortItem : {type : "sap.m.ViewSettingsItem"},

						/**
						 * Selected sort order (true = descending, false = ascending).
						 */
						sortDescending : {type : "boolean"},

						/**
						 * Selected group item
						 */
						groupItem : {type : "sap.m.ViewSettingsItem"},

						/**
						 * Selected group order (true = descending, false = ascending).
						 */
						groupDescending : {type : "boolean"},

						/**
						 * Selected preset filter item.
						 */
						presetFilterItem : {type : "sap.m.ViewSettingsItem"},

						/**
						 * Selected filters in an array of ViewSettingsItem.
						 */
						filterItems : {type : "sap.m.ViewSettingsItem[]"},

						/**
						 * Selected filter items in an object notation format: { key: boolean }. If a custom control filter was displayed (e.g. the user clicked on the filter item), the value for its key is set to true to indicate that there has been an interaction with the control.
						 */
						filterKeys : {type : "object"},

						/**
						 * Selected filter items in string format to display in a control's header bar in format "Filtered by: key (subkey1, subkey2, subkey3)".
						 */
						filterString : {type : "string"}
					}
				},

				/**
				 * Event is called when the cancel button is pressed. It can be used to set the state of custom filter controls.
				 */
				cancel : {},

				/**
				 * Event is called when the reset filters button is pressed. It can be used to clear the state of custom filter controls.
				 */
				resetFilters : {}
			}
		}});


		/* =========================================================== */
		/* begin: API methods */
		/* =========================================================== */

		ViewSettingsDialog.prototype.init = function() {
			this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			this._sDialogWidth = "350px";
			this._sDialogHeight = "434px";
			this._bAppendedToUIArea = false; // this control does not have a
			// renderer, so we need to take care of
			// adding it to the ui tree manually
			this._showSubHeader = false;
			this._filterDetailList = undefined;
			this._iContentPage = -1;
			this._oContentItem = null;
			this._oPreviousState = {};
		};

		ViewSettingsDialog.prototype.exit = function() {
			// helper variables
			this._rb = null;
			this._sDialogWidth = null;
			this._sDialogHeight = null;
			this._bAppendedToUIArea = null;
			this._showSubHeader = null;
			this._iContentPage = null;
			this._oContentItem = null;
			this._oPreviousState = null;
			this._sortContent = null;
			this._groupContent = null;
			this._filterContent = null;

			// sap.ui.core.Popup removes its content on close()/destroy() automatically from the static UIArea,
			// but only if it added it there itself. As we did that, we have to remove it also on our own
			if ( this._bAppendedToUIArea ) {
				var oStatic = sap.ui.getCore().getStaticAreaRef();
				oStatic = sap.ui.getCore().getUIArea(oStatic);
				oStatic.removeContent(this, true);
			}

			// controls that are internally managed and may or may not be assigned to an
			// aggregation (have to be destroyed manually to be sure)

			// dialog
			if (this._dialog) {
				this._dialog.destroy();
				this._dialog = null;
			}
			if (this._navContainer) {
				this._navContainer.destroy();
				this._navContainer = null;
			}
			if (this._titleLabel) {
				this._titleLabel.destroy();
				this._titleLabel = null;
			}

			// page1 (sort/group/filter)
			if (this._page1) {
				this._page1.destroy();
				this._page1 = null;
			}
			if (this._header) {
				this._header.destroy();
				this._header = null;
			}
			if (this._resetButton) {
				this._resetButton.destroy();
				this._resetButton = null;
			}
			if (this._subHeader) {
				this._subHeader.destroy();
				this._subHeader = null;
			}
			if (this._segmentedButton) {
				this._segmentedButton.destroy();
				this._segmentedButton = null;
			}
			if (this._sortButton) {
				this._sortButton.destroy();
				this._sortButton = null;
			}
			if (this._groupButton) {
				this._groupButton.destroy();
				this._groupButton = null;
			}
			if (this._filterButton) {
				this._filterButton.destroy();
				this._filterButton = null;
			}
			if (this._sortList) {
				this._sortList.destroy();
				this._sortList = null;
			}
			if (this._sortOrderList) {
				this._sortOrderList.destroy();
				this._sortOrderList = null;
			}

			if (this._groupList) {
				this._groupList.destroy();
				this._groupList = null;
			}
			if (this._groupOrderList) {
				this._groupOrderList.destroy();
				this._groupOrderList = null;
			}

			if (this._presetFilterList) {
				this._presetFilterList.destroy();
				this._presetFilterList = null;
			}
			if (this._filterList) {
				this._filterList.destroy();
				this._filterList = null;
			}

			// page2 (filter details)
			if (this._page2) {
				this._page2.destroy();
				this._page2 = null;
			}
			if (this._detailTitleLabel) {
				this._detailTitleLabel.destroy();
				this._detailTitleLabel = null;
			}
			if (this._filterDetailList) {
				this._filterDetailList.destroy();
				this._filterDetailList = null;
			}
		};

		/*
		 * Invalidates the control (suppressed because we don't have a renderer)
		 * @overwrite @public
		 */
		ViewSettingsDialog.prototype.invalidate = function() {
			// CSN #80686/2014: only invalidate inner dialog if call does not come from inside
			if (this._dialog && (!arguments[0] || arguments[0] && arguments[0].getId() !== this.getId() + "-dialog")) {
				this._dialog.invalidate(arguments);
			} else {
				Control.prototype.invalidate.apply(this, arguments);
			}
		};


		/**
		 * Forward method to the inner dialog: addStyleClass
		 * @public
		 * @override
		 * @returns {sap.m.ViewSettingsDialog} this pointer for chaining
		 */
		ViewSettingsDialog.prototype.addStyleClass = function () {
			var oDialog = this._getDialog();

			oDialog.addStyleClass.apply(oDialog, arguments);
			return this;
		};

		/**
		 * Forward method to the inner dialog: removeStyleClass
		 * @public
		 * @override
		 * @returns {sap.m.ViewSettingsDialog} this pointer for chaining
		 */
		ViewSettingsDialog.prototype.removeStyleClass = function () {
			var oDialog = this._getDialog();

			oDialog.removeStyleClass.apply(oDialog, arguments);
			return this;
		};

		/**
		 * Forward method to the inner dialog: toggleStyleClass
		 * @public
		 * @override
		 * @returns {sap.m.ViewSettingsDialog} this pointer for chaining
		 */
		ViewSettingsDialog.prototype.toggleStyleClass = function () {
			var oDialog = this._getDialog();

			oDialog.toggleStyleClass.apply(oDialog, arguments);
			return this;
		};

		/**
		 * Forward method to the inner dialog: hasStyleClass
		 * @public
		 * @override
		 * @returns {boolean} true if the class is set, false otherwise
		 */
		ViewSettingsDialog.prototype.hasStyleClass = function () {
			var oDialog = this._getDialog();

			return oDialog.hasStyleClass.apply(oDialog, arguments);
		};

		/**
		 * Forward method to the inner dialog: getDomRef
		 * @public
		 * @override
		 * @return {Element} The Element's DOM Element sub DOM Element or null
		 */
		ViewSettingsDialog.prototype.getDomRef = function () {
			// this is also called on destroy to remove the DOM element, therefore we directly check the reference instead of the internal getter
			if (this._dialog) {
				return this._dialog.getDomRef.apply(this._dialog, arguments);
			} else {
				return null;
			}
		};

		/**
		 * Set the title of the internal dialog
		 *
		 * @overwrite
		 * @public
		 * @param {string}
		 *            sTitle the title text for the dialog
		 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
		 */
		ViewSettingsDialog.prototype.setTitle = function(sTitle) {
			this._getTitleLabel().setText(sTitle);
			this.setProperty("title", sTitle, true);
			return this;
		};

		/**
		 * Adds a sort item and sets the association to reflect the selected state
		 *
		 * @overwrite
		 * @public
		 * @param {sap.m.ViewSettingsItem}
		 *            oItem the item to be added to the aggregation
		 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
		 */
		ViewSettingsDialog.prototype.addSortItem = function(oItem) {
			if (oItem.getSelected()) {
				this.setSelectedSortItem(oItem);
			}
			this.addAggregation("sortItems", oItem);
			return this;
		};

		/**
		 * Adds a group item and sets the association to reflect the selected state
		 *
		 * @overwrite
		 * @public
		 * @param {sap.m.ViewSettingsItem}
		 *            oItem the item to be added to the aggregation
		 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
		 */
		ViewSettingsDialog.prototype.addGroupItem = function(oItem) {
			if (oItem.getSelected()) {
				this.setSelectedGroupItem(oItem);
			}
			this.addAggregation("groupItems", oItem);
			return this;
		};

		/**
		 * Adds a preset filter item and sets the association to reflect the selected
		 * state
		 *
		 * @overwrite
		 * @public
		 * @param {sap.m.ViewSettingsItem}
		 *            oItem the selected item or a string with the key
		 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
		 */
		ViewSettingsDialog.prototype.addPresetFilterItem = function(oItem) {
			if (oItem.getSelected()) {
				this.setSelectedPresetFilterItem(oItem);
			}
			this.addAggregation("presetFilterItems", oItem);
			return this;
		};

		/**
		 * Set the selected sort item (either by key or by item)
		 *
		 * @overwrite
		 * @public
		 * @param {sap.m.ViewSettingsItem}
		 *            oItem the selected item or a string with the key
		 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
		 */
		ViewSettingsDialog.prototype.setSelectedSortItem = function(oItem) {
			var aItems = this.getSortItems(), i = 0;

			// convenience, also allow strings
			if (typeof oItem === "string") {
				// find item with this id
				for (; i < aItems.length; i++) {
					if (aItems[i].getKey() === oItem) {
						oItem = aItems[i];
						break;
					}
				}
			}

			// set selected = true for this item & selected = false for all others items
			for (i = 0; i < aItems.length; i++) {
				aItems[i].setSelected(false);
			}
			if (oItem) {
				oItem.setSelected(true);
			}

			// update the list selection
			if (this._getDialog().isOpen()) {
				this._updateListSelection(this._sortList, oItem);
			}
			this.setAssociation("selectedSortItem", oItem, true);
			return this;
		};

		/**
		 * Set the selected group item (either by key or by item)
		 *
		 * @overwrite
		 * @public
		 * @param {sap.m.ViewSettingsItem}
		 *            oItem the selected item or a string with the key
		 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
		 */
		ViewSettingsDialog.prototype.setSelectedGroupItem = function(oItem) {
			var aItems = this.getGroupItems(), i = 0;

			// convenience, also allow strings
			if (typeof oItem === "string") {
				// find item with this id
				for (; i < aItems.length; i++) {
					if (aItems[i].getKey() === oItem) {
						oItem = aItems[i];
						break;
					}
				}
			}

			// set selected = true for this item & selected = false for all others items
			for (i = 0; i < aItems.length; i++) {
				aItems[i].setSelected(false);
			}
			if (oItem) {
				oItem.setSelected(true);
			}

			// update the list selection
			if (this._getDialog().isOpen()) {
				this._updateListSelection(this._groupList, oItem);
			}
			this.setAssociation("selectedGroupItem", oItem, true);
			return this;
		};

		/**
		 * Set the selected preset filter item
		 *
		 * @overwrite
		 * @public
		 * @param {sap.m.ViewSettingsItem}
		 *            oItem the selected item or a string with the key
		 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
		 */
		ViewSettingsDialog.prototype.setSelectedPresetFilterItem = function(oItem) {
			var aItems = this.getPresetFilterItems(), i = 0;

			// convenience, also allow strings
			if (typeof oItem === "string") {
				// find item with this id
				for (; i < aItems.length; i++) {
					if (aItems[i].getKey() === oItem) {
						oItem = aItems[i];
						break;
					}
				}
			}
			// set selected = true for this item & selected = false for all others items
			for (i = 0; i < aItems.length; i++) {
				aItems[i].setSelected(false);
			}
			if (oItem) {
				oItem.setSelected(true);
				// clear filters (only one mode is allowed, preset filters or filters)
				this._clearSelectedFilters();
			}
			this.setAssociation("selectedPresetFilterItem", oItem, true);
			return this;
		};

		/**
		 * Opens the view settings dialog relative to the parent control
		 *
		 * @param {string} the initial page to be opened in the dialog.
		 *                 available values: "sort", "group", "filter"
		 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		ViewSettingsDialog.prototype.open = function(sCurrentPage) {
			// add to static UI area manually because we don't have a renderer
			if (!this.getParent() && !this._bAppendedToUIArea) {
				var oStatic = sap.ui.getCore().getStaticAreaRef();
				oStatic = sap.ui.getCore().getUIArea(oStatic);
				oStatic.addContent(this, true);
				this._bAppendedToUIArea = true;
			}

			// if there is a default tab and the user has been at filter details view on page2, go back to page1
			if (sCurrentPage && this._iContentPage === 3) {
				jQuery.sap.delayedCall(0, this._getNavContainer(), "to", [
					this._getPage1().getId(), "show" ]);
			}

			// init the dialog content based on the aggregations
			this._initDialogContent();

			// store the current dialog state to be able to reset it on cancel
			this._oPreviousState = {
				sortItem : sap.ui.getCore().byId(this.getSelectedSortItem()),
				sortDescending : this.getSortDescending(),
				groupItem : sap.ui.getCore().byId(this.getSelectedGroupItem()),
				groupDescending : this.getGroupDescending(),
				presetFilterItem : sap.ui.getCore().byId(
					this.getSelectedPresetFilterItem()),
				filterKeys : this.getSelectedFilterKeys(),
				navPage : this._getNavContainer().getCurrentPage(),
				contentPage : this._iContentPage,
				contentItem : this._oContentItem
			};

			// set initial focus to the segmentedButton if available
			this._getDialog().setInitialFocus((sap.ui.Device.system.desktop && this._showSubHeader) ? this._segmentedButton : null);
			// open dialog
			this._getDialog().open();

			// switch to the user defined page if set and valid
			if (sCurrentPage) {
				var oSegmentedButtons = {
					"sort": 0,
					"group": 1,
					"filter": 2
				};
				if (oSegmentedButtons.hasOwnProperty(sCurrentPage)) {
					var sSelectedButton = this.getId() + "-" + sCurrentPage + "button";
					this._getSegmentedButton().setSelectedButton(sSelectedButton);
					this._switchToPage(oSegmentedButtons[sCurrentPage]);
				}
			}

			return this;
		};

		/**
		 * Returns the selected filters as an array of ViewSettingsItems.
		 *
		 * It can be used to create matching sorters and filters to apply the selected settings to the data.
		 * @overwrite
		 * @public
		 * @return {sap.m.ViewSettingsItem[]} an array of selected filter items
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		ViewSettingsDialog.prototype.getSelectedFilterItems = function() {
			var aSelectedFilterItems = [], aFilterItems = this.getFilterItems(), aSubFilterItems, bMultiSelect = true, i = 0, j;

			for (; i < aFilterItems.length; i++) {
				if (aFilterItems[i] instanceof sap.m.ViewSettingsCustomItem) {
					if (aFilterItems[i].getSelected()) {
						aSelectedFilterItems.push(aFilterItems[i]);
					}
				} else if (aFilterItems[i] instanceof sap.m.ViewSettingsFilterItem) {
					aSubFilterItems = aFilterItems[i].getItems();
					bMultiSelect = aFilterItems[i].getMultiSelect();
					for (j = 0; j < aSubFilterItems.length; j++) {
						if (aSubFilterItems[j].getSelected()) {
							aSelectedFilterItems.push(aSubFilterItems[j]);
							if (!bMultiSelect) {
								break; // only first item is added to the selection on
								// single select items
							}
						}
					}
				}
			}

			return aSelectedFilterItems;
		};

		/**
		 * Get the filter string in the format "filter name (subfilter1 name, subfilter2
		 * name, ...), ..." For custom filters and preset filters it will only add the
		 * filter name to the resulting string
		 *
		 * @public
		 * @return {string} the selected filter string
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		ViewSettingsDialog.prototype.getSelectedFilterString = function() {
			var sFilterString = "", sSubfilterString, oPresetFilterItem = this
				.getSelectedPresetFilterItem(), aFilterItems = this
				.getFilterItems(), aSubFilterItems, bMultiSelect = true, i = 0, j;

			if (oPresetFilterItem) {
				// preset filter: add "filter name"
				sFilterString = this._rb.getText("VIEWSETTINGS_FILTERTEXT").concat(
					" " + sap.ui.getCore().byId(oPresetFilterItem).getText());
			} else { // standard & custom filters
				for (; i < aFilterItems.length; i++) {
					if (aFilterItems[i] instanceof sap.m.ViewSettingsCustomItem) {
						// custom filter: add "filter name,"
						if (aFilterItems[i].getSelected()) {
							sFilterString += aFilterItems[i].getText() + ", ";
						}
					} else if (aFilterItems[i] instanceof sap.m.ViewSettingsFilterItem) {
						// standard filter: add "filter name (sub filter 1 name, sub
						// filter 2 name, ...), "
						aSubFilterItems = aFilterItems[i].getItems();
						bMultiSelect = aFilterItems[i].getMultiSelect();
						sSubfilterString = "";
						for (j = 0; j < aSubFilterItems.length; j++) {
							if (aSubFilterItems[j].getSelected()) {
								sSubfilterString += aSubFilterItems[j].getText() + ", ";
								if (!bMultiSelect) {
									break; // only first item is added to the selection
									// on single select items
								}
							}
						}
						// remove last comma
						sSubfilterString = sSubfilterString.substring(0,
							sSubfilterString.length - 2);

						// add surrounding brackets and comma
						if (sSubfilterString) {
							sSubfilterString = " (" + sSubfilterString + ")";
							sFilterString += aFilterItems[i].getText()
							+ sSubfilterString + ", ";
						}
					}
				}

				// remove last comma
				sFilterString = sFilterString.substring(0, sFilterString.length - 2);

				// add "Filtered by: " text
				if (sFilterString) {
					sFilterString = this._rb.getText("VIEWSETTINGS_FILTERTEXT").concat(
						" " + sFilterString);
				}
			}
			return sFilterString;
		};

		/**
		 * Get the selected filter object in format {key: boolean}.
		 *
		 * It can be used to create matching sorters and filters to apply the selected settings to the data.
		 *
		 * @public
		 * @return {object} an object with item and subitem keys
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		ViewSettingsDialog.prototype.getSelectedFilterKeys = function() {
			var oSelectedFilterKeys = {}, aSelectedFilterItems = this
				.getSelectedFilterItems(), i = 0;

			for (; i < aSelectedFilterItems.length; i++) {
				oSelectedFilterKeys[aSelectedFilterItems[i].getKey()] = aSelectedFilterItems[i]
					.getSelected();
			}

			return oSelectedFilterKeys;
		};

		/**
		 * Set the selected filter object in format {key: boolean}
		 *
		 * @public
		 * @param {object} oSelectedFilterKeys
		 *         A configuration object with filter item and sub item keys in the format: { key: boolean }.
		 *         Setting boolean to true will set the filter to true, false or omitting an entry will set the filter to false.
		 *         It can be used to set the dialog state based on presets.
		 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		ViewSettingsDialog.prototype.setSelectedFilterKeys = function(
			oSelectedFilterKeys) {
			var sKey = "", aFilterItems = this.getFilterItems(), aSubFilterItems = {}, oFilterItem, bMultiSelect, i, j, k;

			// clear preset filters (only one mode is allowed, preset filters or
			// filters)
			if (Object.keys(oSelectedFilterKeys).length) {
				this._clearPresetFilter();
			}

			// loop through the provided object array {key -> subKey -> boolean}
			for (sKey in oSelectedFilterKeys) { // filter key
				oFilterItem = null;
				if (oSelectedFilterKeys.hasOwnProperty(sKey)) {
					for (i = 0; i < aFilterItems.length; i++) {
						if (aFilterItems[i] instanceof sap.m.ViewSettingsCustomItem) {
							// just compare the key of this control
							if (aFilterItems[i].getKey() === sKey) {
								oFilterItem = aFilterItems[i];
								aFilterItems[i].setSelected(oSelectedFilterKeys[sKey]);
							}
						} else if (aFilterItems[i] instanceof sap.m.ViewSettingsFilterItem) {
							// find the sub filter item with the specified key
							aSubFilterItems = aFilterItems[i].getItems();
							bMultiSelect = aFilterItems[i].getMultiSelect();
							for (j = 0; j < aSubFilterItems.length; j++) {
								if (aSubFilterItems[j].getKey() === sKey) {
									oFilterItem = aSubFilterItems[j];
									// set all other entries to false for single select
									// entries
									if (!bMultiSelect) {
										for (k = 0; k < aSubFilterItems.length; k++) {
											aSubFilterItems[k].setSelected(false);
										}
									}
									break;
								}
							}
						}
						if (oFilterItem) {
							break;
						}
					}

					// skip if we don't have an item with this key
					if (oFilterItem === null) {
						jQuery.sap.log.warning('Cannot set state for key "' + sKey
						+ '" because there is no filter with these keys');
						continue;
					}

					// set the the selected state on the item
					oFilterItem.setSelected(oSelectedFilterKeys[sKey]);
				}
			}

			return this;
		};

		/* =========================================================== */
		/* end: API methods */
		/* =========================================================== */

		/* =========================================================== */
		/* begin: internal methods and properties */
		/* =========================================================== */

		/*
		 * Lazy initialization of the internal dialog @private
		 */
		ViewSettingsDialog.prototype._getDialog = function() {
			var that = this;

			// create an internal instance of a dialog
			if (this._dialog === undefined) {
				this._dialog = new sap.m.Dialog(this.getId() + "-dialog", {
					showHeader : false,
					stretch : sap.ui.Device.system.phone,
					verticalScrolling : true,
					horizontalScrolling : false,
					contentWidth : this._sDialogWidth,
					contentHeight : this._sDialogHeight,
					content : this._getNavContainer(),
					beginButton : new sap.m.Button({
						text : this._rb.getText("VIEWSETTINGS_ACCEPT")
					}).attachPress(this._onConfirm, this),
					endButton : new sap.m.Button({
						text : this._rb.getText("VIEWSETTINGS_CANCEL")
					}).attachPress(this._onCancel, this)
				}).addStyleClass("sapMVSD");

				// CSN# 3696452/2013: ESC key should also cancel dialog, not only close
				// it
				var fnDialogEscape = this._dialog.onsapescape;
				this._dialog.onsapescape = function(oEvent) {
					// call original escape function of the dialog
					if (fnDialogEscape) {
						fnDialogEscape.call(that._dialog, oEvent);
					}
					// execute cancel action
					that._onCancel();
				};

				// [SHIFT]+[ENTER] triggers the “Back” button of the dialog
				this._dialog.onsapentermodifiers = function (oEvent) {

					if (oEvent.shiftKey && !oEvent.ctrlKey && !oEvent.altKey ) {
						that._pressBackButton();
					}
				};
			}

			return this._dialog;
		};

		/*
		 * Lazy initialization of the internal nav container @private
		 */
		ViewSettingsDialog.prototype._getNavContainer = function() {
			// create an internal instance of a dialog
			if (this._navContainer === undefined) {
				this._navContainer = new sap.m.NavContainer(this.getId()
				+ '-navcontainer', {
					pages : []
				});
			}
			return this._navContainer;
		};

		/*
		 * Lazy initialization of the internal title label @private
		 */
		ViewSettingsDialog.prototype._getTitleLabel = function() {
			if (this._titleLabel === undefined) {
				this._titleLabel = new sap.m.Label(this.getId() + "-title", {
					text : this._rb.getText("VIEWSETTINGS_TITLE")
				}).addStyleClass("sapMVSDTitle");
			}
			return this._titleLabel;
		};

		/*
		 * Lazy initialization of the internal reset button @private
		 */
		ViewSettingsDialog.prototype._getResetButton = function() {
			var that = this;

			if (this._resetButton === undefined) {
				this._resetButton = new sap.m.Button(this.getId() + "-resetbutton", {
					icon : IconPool.getIconURI("refresh"),
					press : function() {
						that._onClearFilters();
					},
					tooltip : this._rb.getText("VIEWSETTINGS_CLEAR_FILTER_TOOLTIP")
				});
			}
			return this._resetButton;
		};

		/*
		 * Lazy initialization of the internal detail title lable @private
		 */
		ViewSettingsDialog.prototype._getDetailTitleLabel = function() {
			if (this._detailTitleLabel === undefined) {
				this._detailTitleLabel = new sap.m.Label(this.getId() + "-detailtitle",
					{
						text : this._rb.getText("VIEWSETTINGS_TITLE_FILTERBY")
					}).addStyleClass("sapMVSDTitle");
			}
			return this._detailTitleLabel;
		};

		/*
		 * Lazy initialization of the internal header @private
		 */
		ViewSettingsDialog.prototype._getHeader = function() {
			if (this._header === undefined) {
				this._header = new sap.m.Bar({
					contentMiddle : [ this._getTitleLabel() ]
				}).addStyleClass("sapMVSDBar");
			}
			return this._header;
		};

		/*
		 * Lazy initialization of the internal sub header @private
		 */
		ViewSettingsDialog.prototype._getSubHeader = function() {
			if (this._subHeader === undefined) {
				this._subHeader = new sap.m.Bar({
					contentLeft : [ this._getSegmentedButton() ]
				}).addStyleClass("sapMVSDBar");
			}
			return this._subHeader;
		};

		/*
		 * Lazy initialization of the internal segmented button @private
		 */
		ViewSettingsDialog.prototype._getSegmentedButton = function() {
			var that = this;

			if (this._segmentedButton === undefined) {
				this._segmentedButton = new sap.m.SegmentedButton({
					select : function(oEvent) {
						var selectedId = oEvent.getParameter('id');
						if (selectedId === that.getId() + "-sortbutton") {
							that._switchToPage(0);
						} else if (selectedId === that.getId() + "-groupbutton") {
							that._switchToPage(1);
						} else if (selectedId === that.getId() + "-filterbutton") {
							that._switchToPage(2);
						}
						jQuery.sap.log.info('press event segmented: '
						+ oEvent.getParameter('id'));
					}
				}).addStyleClass("sapMVSDSeg");

				// workaround to fix flickering caused by css measurement in
				// SegmentedButton
				this._segmentedButton._fCalcBtnWidth = function() {
					// do nothing here
				};
			}
			return this._segmentedButton;
		};

		/*
		 * Lazy initialization of the internal sort button @private
		 */
		ViewSettingsDialog.prototype._getSortButton = function() {
			if (this._sortButton === undefined) {
				this._sortButton = new sap.m.Button(this.getId() + "-sortbutton", {
					visible : false, // controlled by update state method
					icon : IconPool.getIconURI("sort"),
					tooltip : this._rb.getText("VIEWSETTINGS_TITLE_SORT")
				});
			}
			return this._sortButton;
		};

		/*
		 * Lazy initialization of the internal group button @private
		 */
		ViewSettingsDialog.prototype._getGroupButton = function() {
			if (this._groupButton === undefined) {
				this._groupButton = new sap.m.Button(this.getId() + "-groupbutton", {
					visible : false, // controlled by update state method
					icon : IconPool.getIconURI("group-2"),
					tooltip : this._rb.getText("VIEWSETTINGS_TITLE_GROUP")
				});
			}
			return this._groupButton;
		};

		/*
		 * Lazy initialization of the internal filter button @private
		 */
		ViewSettingsDialog.prototype._getFilterButton = function() {
			if (this._filterButton === undefined) {
				this._filterButton = new sap.m.Button(this.getId() + "-filterbutton", {
					visible : false, // controlled by update state method
					icon : IconPool.getIconURI("filter"),
					tooltip : this._rb.getText("VIEWSETTINGS_TITLE_FILTER")
				});
			}
			return this._filterButton;
		};

		/*
		 * Lazy initialization of the internal page1 (sort/group/filter) @private
		 */
		ViewSettingsDialog.prototype._getPage1 = function() {
			if (this._page1 === undefined) {
				this._page1 = new sap.m.Page(this.getId() + '-page1', {
					title : this._rb.getText("VIEWSETTINGS_TITLE"),
					customHeader : this._getHeader()
				});
				this._getNavContainer().addPage(this._page1); // sort, group, filter
			}
			return this._page1;
		};

		/*
		 * Lazy initialization of the internal page2 (detail filters) @private
		 */
		ViewSettingsDialog.prototype._getPage2 = function() {
			var that = this, oDetailHeader, oBackButton, oDetailResetButton;

			if (this._page2 === undefined) {
				// init internal page content
				oBackButton = new sap.m.Button(this.getId() + "-backbutton", {
					icon : IconPool.getIconURI("nav-back"),
					press : [this._pressBackButton, this]
				});
				oDetailResetButton = new sap.m.Button(this.getId()
				+ "-detailresetbutton", {
					icon : IconPool.getIconURI("refresh"),
					press : function() {
						that._onClearFilters();
					},
					tooltip : this._rb.getText("VIEWSETTINGS_CLEAR_FILTER_TOOLTIP")
				});
				oDetailHeader = new sap.m.Bar({
					contentLeft : [ oBackButton ],
					contentMiddle : [ this._getDetailTitleLabel() ],
					contentRight : [ oDetailResetButton ]
				}).addStyleClass("sapMVSDBar");

				this._page2 = new sap.m.Page(this.getId() + '-page2', {
					title : this._rb.getText("VIEWSETTINGS_TITLE_FILTERBY"),
					customHeader : oDetailHeader
				});
				this._getNavContainer().addPage(this._page2); // filter details
			}
			return this._page2;
		};

		/*
		 * Create and initialize the sort content controls @private
		 */
		ViewSettingsDialog.prototype._initSortContent = function() {
			var that = this;

			if (this._sortContent) {
				return;
			}
			this._iContentPage = -1;

			this._sortOrderList = new sap.m.List(this.getId() + "-sortorderlist", {
				mode : sap.m.ListMode.SingleSelectLeft,
				includeItemInSelection : true,
				selectionChange : function(oEvent) {
					that.setProperty('sortDescending', oEvent.getParameter("listItem").data("item"), true);
				}
			}).addStyleClass("sapMVSDUpperList");
			this._sortOrderList.addItem(new sap.m.StandardListItem({
				title : this._rb.getText("VIEWSETTINGS_ASCENDING_ITEM")
			}).data("item", false).setSelected(true));
			this._sortOrderList.addItem(new sap.m.StandardListItem({
				title : this._rb.getText("VIEWSETTINGS_DESCENDING_ITEM")
			}).data("item", true));

			this._sortList = new sap.m.List(this.getId() + "-sortlist",
				{
					mode : sap.m.ListMode.SingleSelectLeft,
					includeItemInSelection : true,
					selectionChange : function(oEvent) {
						var item = oEvent.getParameter("listItem").data("item");
						if (item) {
							item.setProperty('selected', oEvent.getParameter("listItem").getSelected(), true);
						}
						that.setAssociation("selectedSortItem", item, true);
					}
				});

			this._sortContent = [ this._sortOrderList, this._sortList ];
		};

		/*
		 * Create and initialize the group content controls @private
		 */
		ViewSettingsDialog.prototype._initGroupContent = function() {
			var that = this;

			if (this._groupContent) {
				return;
			}
			this._iContentPage = -1;

			this._groupOrderList = new sap.m.List(this.getId() + "-grouporderlist", {
				mode : sap.m.ListMode.SingleSelectLeft,
				includeItemInSelection : true,
				selectionChange : function(oEvent) {
					that.setProperty('groupDescending', oEvent.getParameter("listItem").data("item"), true);
				}
			}).addStyleClass("sapMVSDUpperList");
			this._groupOrderList.addItem(new sap.m.StandardListItem({
				title : this._rb.getText("VIEWSETTINGS_ASCENDING_ITEM")
			}).data("item", false).setSelected(true));
			this._groupOrderList.addItem(new sap.m.StandardListItem({
				title : this._rb.getText("VIEWSETTINGS_DESCENDING_ITEM")
			}).data("item", true));

			this._groupList = new sap.m.List(this.getId() + "-grouplist",
				{
					mode : sap.m.ListMode.SingleSelectLeft,
					includeItemInSelection : true,
					selectionChange : function(oEvent) {
						var item = oEvent.getParameter("listItem").data("item");
						if (item) {
							item.setProperty('selected', oEvent.getParameter("listItem").getSelected(), true);
						}
						that.setAssociation("selectedGroupItem", item, true);
					}
				});

			this._groupContent = [ this._groupOrderList, this._groupList ];
		};

		/*
		 * Create and initialize the filter content controls @private
		 */
		ViewSettingsDialog.prototype._initFilterContent = function() {
			var that = this;

			if (this._filterContent) {
				return;
			}
			this._iContentPage = -1;

			this._presetFilterList = new sap.m.List(
				this.getId() + "-predefinedfilterlist",
				{
					mode : sap.m.ListMode.SingleSelectLeft,
					includeItemInSelection : true,
					selectionChange : function(oEvent) {
						var item = oEvent.getParameter("listItem").data("item");
						if (item) {
							item.setProperty('selected', oEvent.getParameter("listItem").getSelected(), true);
						}
						that.setAssociation("selectedPresetFilterItem", item, true);
						that._clearSelectedFilters();
					}
				}).addStyleClass("sapMVSDUpperList");

			this._filterList = new sap.m.List(this.getId() + "-filterlist", {});

			this._filterContent = [ this._presetFilterList, this._filterList ];
		};

		/*
		 * Fill the dialog with the aggregation data @private
		 */
		ViewSettingsDialog.prototype._initDialogContent = function() {
			var bSort = !!this.getSortItems().length, bGroup = !!this.getGroupItems().length, bPredefinedFilter = !!this
				.getPresetFilterItems().length, bFilter = !!this.getFilterItems().length, that = this, oListItem, aSortItems = [], aGroupItems = [], aPresetFilterItems = [], aFilterItems = [];


			// sort
			if (bSort) {
				this._initSortContent();
				this._sortList.removeAllItems();
				aSortItems = this.getSortItems();
				if (aSortItems.length) {
					aSortItems.forEach(function(oItem) {
						oListItem = new sap.m.StandardListItem({
							title : oItem.getText(),
							type : sap.m.ListType.Active,
							selected : oItem.getSelected()
						}).data("item", oItem);
						this._sortList.addItem(oListItem);
					}, this);
				}
			}

			// group
			if (bGroup) {
				this._initGroupContent();
				this._groupList.removeAllItems();
				aGroupItems = this.getGroupItems();
				if (aGroupItems.length) {
					aGroupItems.forEach(function(oItem) {
						oListItem = new sap.m.StandardListItem({
							title : oItem.getText(),
							type : sap.m.ListType.Active,
							selected : oItem.getSelected()
						}).data("item", oItem);
						this._groupList.addItem(oListItem);
					}, this);
				}
				// add none item to group list
				if (aGroupItems.length) {
					oListItem = new sap.m.StandardListItem({
						title : this._rb.getText("VIEWSETTINGS_NONE_ITEM"),
						type : sap.m.ListType.Active,
						selected : !!this.getSelectedGroupItem()
					});
					this._groupList.addItem(oListItem);
				}
			}

			// predefined filters
			if (bPredefinedFilter || bFilter) {
				this._initFilterContent();
				this._presetFilterList.removeAllItems();
				aPresetFilterItems = this.getPresetFilterItems();
				if (aPresetFilterItems.length) {
					aPresetFilterItems.forEach(function(oItem) {
						oListItem = new sap.m.StandardListItem({
							title : oItem.getText(),
							type : sap.m.ListType.Active,
							selected : oItem.getSelected()
						}).data("item", oItem);
						this._presetFilterList.addItem(oListItem);
					}, this);
				}
				// add none item to preset filter list
				if (aPresetFilterItems.length) {
					oListItem = new sap.m.StandardListItem({
						title : this._rb.getText("VIEWSETTINGS_NONE_ITEM"),
						selected : !!this.getSelectedPresetFilterItem()
					});
					this._presetFilterList.addItem(oListItem);
				}

				// filters
				this._filterList.removeAllItems();
				aFilterItems = this.getFilterItems();
				if (aFilterItems.length) {
					aFilterItems.forEach(function(oItem) {
						oListItem = new sap.m.StandardListItem(
							{
								title : oItem.getText(),
								type : sap.m.ListType.Active,
								press : (function(oItem) {
									return function(oEvent) {
										// navigate to details page
										if (that._navContainer.getCurrentPage()
												.getId() !== that.getId()
											+ '-page2') {
											that._switchToPage(3, oItem);
											that._prevSelectedFilterItem = this;
											jQuery.sap.delayedCall(0,
												that._navContainer, "to",
												[ that.getId() + '-page2',
													"slide" ]);
										}
										if (sap.ui.Device.system.desktop && that._filterDetailList && that._filterDetailList.getItems()[0]) {
											that._getNavContainer().attachEventOnce("afterNavigate", function(){
												that._filterDetailList.getItems()[0].focus();
											});
										}
									};
								}(oItem))
							}).data("item", oItem);
						this._filterList.addItem(oListItem);
					}, this);
				}
			}

			// hide elements that are not visible and set the active content
			this._updateDialogState();

			// select the items that are reflected in the control's properties
			this._updateListSelections();
		};

		/*
		 * Sets the state of the dialog when it is opened If only Sort or Group or
		 * Filter items are defined, then only one tab is displayed If multiple items
		 * are defined, a segmented button is displayed and the first page is set
		 * @private
		 */
		ViewSettingsDialog.prototype._updateDialogState = function() {
			var bSort = !!this.getSortItems().length, bGroup = !!this.getGroupItems().length, bPredefinedFilter = !!this
				.getPresetFilterItems().length, bFilter = !!this.getFilterItems().length, bNothing = !bSort
				&& !bGroup && !bPredefinedFilter && !bFilter, bInvalidState = false, iActivePages = 0, oSegmentedButton = this
				._getSegmentedButton();

			// reset state
			oSegmentedButton.removeAllButtons();
			if (this._filterContent) {
				this._presetFilterList.setVisible(true);
				this._filterList.setVisible(true);
			}

			// set invalid state if the previous tab is not valid anymore or has never
			// been selected
			if (this._iContentPage === -1 || this._iContentPage === 0 && !bSort
				|| this._iContentPage === 1 && !bGroup || this._iContentPage === 2
				&& !(bPredefinedFilter || bFilter)) {
				bInvalidState = true;
			}

			// count active dialog pages and update segmentedButton
			if (bSort) {
				oSegmentedButton.addButton(this._getSortButton());
				if (this._iContentPage === 0) {
					oSegmentedButton.setSelectedButton(this._getSortButton());
				}
				iActivePages++;
			}
			if (bPredefinedFilter || bFilter) {
				oSegmentedButton.addButton(this._getFilterButton());
				if (this._iContentPage === 2) {
					oSegmentedButton.setSelectedButton(this._getFilterButton());
				}
				if (!bPredefinedFilter) {
					this._presetFilterList.setVisible(false);
					this._presetFilterList.addStyleClass("sapMVSDUpperList");
				}
				if (!bFilter) {
					this._filterList.setVisible(false);
					this._presetFilterList.removeStyleClass("sapMVSDUpperList");
				}
				iActivePages++;
			}
			if (bGroup) {
				oSegmentedButton.addButton(this._getGroupButton());
				if (this._iContentPage === 1) {
					oSegmentedButton.setSelectedButton(this._getGroupButton());
				}
				iActivePages++;
			}

			// show header only when there are multiple tabs active
			this._showSubHeader = (iActivePages > 1 ? true : false);

			if (bInvalidState) {
				if (bSort || bNothing) { // default = sort
					this._switchToPage(0);
				} else if (bPredefinedFilter || bFilter) { // filter
					this._switchToPage(2);
				} else if (bGroup) { // group
					this._switchToPage(1);
				}
			}

			// CSN# 3802530/2013: if filters were modified by API we need to refresh the
			// filter detail page
			if (this._iContentPage === 3) {
				this._iContentPage = -1;
				this._switchToPage(3, this._oContentItem);
			}
		};

		sap.m.ViewSettingsDialog.prototype._pressBackButton = function() {
			var that = this;

			if (this._iContentPage === 3) {
				this._updateFilterCounters();
				jQuery.sap.delayedCall(0, this._navContainer, "back");
				this._switchToPage(2);
				this._segmentedButton.setSelectedButton(this._filterButton);
				this._navContainer.attachEventOnce("afterNavigate", function(){
					if (that._prevSelectedFilterItem) {
						that._prevSelectedFilterItem.focus();
					}
				});
			}
		};

		/**
		 * Overwrite the model setter in order to reset the remembered page in case it was a filter detail page to make sure
		 * the dialog is not trying to re-open a page for a removed item BCP 1570030370
		 *
		 * @param oModel
		 * @param sName
		 * @returns {ViewSettingsDialog}
		 */
		ViewSettingsDialog.prototype.setModel = function (oModel, sName) {
			if (this._iContentPage === 3 && this._oContentItem) {
				resetFilterPage.call(this);
			}
			return sap.ui.base.ManagedObject.prototype.setModel.call(this, oModel, sName);
		};

		/**
		 * Reset the remembered page if it was the filter detail page of the removed filter
		 *
		 * @param oFilterItem
		 * @returns {ViewSettingsDialog}
		 */
		ViewSettingsDialog.prototype.removeFilterItem = function (oFilterItem) {
			if (this._iContentPage === 3 && this._oContentItem && this._oContentItem.getId() === oFilterItem.getId()) {
				resetFilterPage.call(this);
			}
			return this.removeAggregation('filterItems', oFilterItem);
		};

		/**
		 * Reset the remembered page if it was a filter detail page and all filter items are being removed
		 * @returns {ViewSettingsDialog}
		 */
		ViewSettingsDialog.prototype.removeAllFilterItems = function () {
			if (this._iContentPage === 3 && this._oContentItem) {
				resetFilterPage.call(this);
			}
			return this.removeAllAggregation('filterItems');
		};
		/*
		 * Switches to a dialog page (0 = sort, 1 = group, 2 = filter, 3 = subfilter)
		 * @param {int} iWhich the page to be navigated to @param {sap.m.FilterItem}
		 * oItem The filter item for the detail page (optional, only used for page 3)
		 * @private
		 */
		ViewSettingsDialog.prototype._switchToPage = function(iWhich, oItem) {
			var i = 0, that = this, aSubFilters = [], oTitleLabel = this
				._getTitleLabel(), oResetButton = this._getResetButton(), oHeader = this
				._getHeader(), oSubHeader = this._getSubHeader(), oListItem;

			// nothing to do if we are already on the requested page (except for filter
			// detail page)
			if (this._iContentPage === iWhich && iWhich !== 3) {
				return false;
			}

			// reset controls
			oHeader.removeAllContentRight();
			oSubHeader.removeAllContentRight();
			this._iContentPage = iWhich;
			this._oContentItem = oItem;

			// purge the current content & reset pages
			if (iWhich >= 0 && iWhich < 3) {
				this._getPage1().removeAllAggregation("content", true);
				// set subheader when there are multiple tabs active
				if (this._showSubHeader) {
					if (!this._getPage1().getSubHeader()) {
						this._getPage1().setSubHeader(oSubHeader);
					}
					// show reset button in subheader
					oSubHeader.addContentRight(oResetButton);
				} else {
					if (this._getPage1().getSubHeader()) {
						this._getPage1().setSubHeader();
					}
					// show reset button in header
					oHeader.addContentRight(oResetButton);
				}
			} else if (iWhich === 3) {
				this._getPage2().removeAllAggregation("content", true);
			}

			if (this.getTitle()) { // custom title
				oTitleLabel.setText(this.getTitle());
			} else { // default title
				oTitleLabel.setText(this._rb.getText("VIEWSETTINGS_TITLE"));
			}

			switch (iWhich) {
				case 1: // grouping
					oResetButton.setVisible(false);
					if (!this._showSubHeader && !this.getTitle()) {
						oTitleLabel.setText(this._rb.getText("VIEWSETTINGS_TITLE_GROUP"));
					}
					for (; i < this._groupContent.length; i++) {
						this._getPage1().addContent(this._groupContent[i]);
					}
					break;
				case 2: // filtering
					// only show reset button when there are detail filters available
					oResetButton.setVisible(!!this.getFilterItems().length);
					if (!this._showSubHeader && !this.getTitle()) {
						oTitleLabel.setText(this._rb.getText("VIEWSETTINGS_TITLE_FILTER"));
					}
					// update status (something could have been changed on a detail filter
					// page or by API
					this._updateListSelection(this._presetFilterList, sap.ui.getCore()
						.byId(this.getSelectedPresetFilterItem()));
					this._updateFilterCounters();
					for (; i < this._filterContent.length; i++) {
						this._getPage1().addContent(this._filterContent[i]);
					}
					break;
				case 3: // filtering details
					// display filter title
					this._getDetailTitleLabel().setText(
						this._rb.getText("VIEWSETTINGS_TITLE_FILTERBY") + " "
						+ oItem.getText());
					// fill detail page
					if (oItem instanceof sap.m.ViewSettingsCustomItem
						&& oItem.getCustomControl()) {
						this._clearPresetFilter();
						this._getPage2().addContent(oItem.getCustomControl());
					} else if (oItem instanceof sap.m.ViewSettingsFilterItem
						&& oItem.getItems()) {
						aSubFilters = oItem.getItems();
						if (this._filterDetailList) { // destroy previous list
							this._filterDetailList.destroy();
						}
						this._filterDetailList = new sap.m.List(
							{
								mode : (oItem.getMultiSelect() ? sap.m.ListMode.MultiSelect
									: sap.m.ListMode.SingleSelectLeft),
								includeItemInSelection : true,
								selectionChange : function(oEvent) {
									var oSubItem,
										aEventListItems = oEvent.getParameter("listItems"),
										aSubItems,
										i = 0;

									that._clearPresetFilter();
									// check if multiple items are selected - [CTRL] + [A] combination from the list
									if (aEventListItems.length > 1 && oItem.getMultiSelect()){
										aSubItems = oItem.getItems();
										for (; i < aSubItems.length; i++) {
											for (var j = 0; j < aEventListItems.length; j++){
												if (aSubItems[i].getKey() === aEventListItems[j].getCustomData()[0].getValue().getKey()){
													aSubItems[i].setSelected(aEventListItems[j].getSelected());
												}
											}
										}
									} else {
										oSubItem = oEvent.getParameter("listItem").data("item");
										// clear selection of all subitems if this is a
										// single select item
										if (!oItem.getMultiSelect()) {
											aSubItems = oItem.getItems();
											for (; i < aSubItems.length; i++) {
												aSubItems[i].setSelected(false);
											}
										}
										oSubItem.setSelected(oEvent.getParameter("listItem").getSelected());
									}
								}
							});
						for (i = 0; i < aSubFilters.length; i++) {
							// use name if there is no key defined
							oListItem = new sap.m.StandardListItem({
								title : aSubFilters[i].getText(),
								type : sap.m.ListType.Active,
								selected : aSubFilters[i].getSelected()
							}).data("item", aSubFilters[i]);
							this._filterDetailList.addItem(oListItem);
						}
						this._getPage2().addContent(this._filterDetailList);
					}
					break;
				case 0: // sorting
				default:
					oResetButton.setVisible(false);
					if (!this._getPage1().getSubHeader() && !this.getTitle()) {
						oTitleLabel.setText(this._rb.getText("VIEWSETTINGS_TITLE_SORT"));
					}
					if (this._sortContent) {
						for (; i < this._sortContent.length; i++) {
							this._getPage1().addContent(this._sortContent[i]);
						}
					}
					break;
			}
		};

		/*
		 * Updates the internal lists based on the dialogs state @private
		 */
		ViewSettingsDialog.prototype._updateListSelections = function() {
			this._updateListSelection(this._sortList, sap.ui.getCore().byId(
				this.getSelectedSortItem()));
			this._updateListSelection(this._sortOrderList, this.getSortDescending());
			this._updateListSelection(this._groupList, sap.ui.getCore().byId(
				this.getSelectedGroupItem()));
			this._updateListSelection(this._groupOrderList, this.getGroupDescending());
			this._updateListSelection(this._presetFilterList, sap.ui.getCore().byId(
				this.getSelectedPresetFilterItem()));
			this._updateFilterCounters();
		};

		/*
		 * Sets selected item on single selection lists based on the "item" data
		 * @private
		 */
		ViewSettingsDialog.prototype._updateListSelection = function(oList, oItem) {
			var items, i = 0;

			if (!oList) {
				return false;
			}

			items = oList.getItems();

			oList.removeSelections();
			for (; i < items.length; i++) {
				if (items[i].data("item") === oItem || items[i].data("item") === null) { // null
					// is
					// "None"
					// item
					oList.setSelectedItem(items[i], (oItem && oItem.getSelected ? oItem
						.getSelected() : true)); // true or the selected state if
					// it is a ViewSettingsItem
					return true;
				}
			}
			return false;
		};

		/*
		 * Updates the amount of selected filters in the filter list @private
		 */
		ViewSettingsDialog.prototype._updateFilterCounters = function() {
			var aListItems = (this._filterList ? this._filterList.getItems() : []), oItem, aSubItems, iFilterCount = 0, i = 0, j;

			for (; i < aListItems.length; i++) {
				oItem = aListItems[i].data("item");
				iFilterCount = 0;
				if (oItem) {
					if (oItem instanceof sap.m.ViewSettingsCustomItem) {
						// for custom filter oItems the oItem is directly selected
						iFilterCount = oItem.getFilterCount();
					} else if (oItem instanceof sap.m.ViewSettingsFilterItem) {
						// for filter oItems the oItem counter has to be calculated from
						// the sub oItems
						iFilterCount = 0;
						aSubItems = oItem.getItems();

						for (j = 0; j < aSubItems.length; j++) {
							if (aSubItems[j].getSelected()) {
								iFilterCount++;
							}
						}
					}
				}
				aListItems[i].setCounter(iFilterCount);
			}
		};

		ViewSettingsDialog.prototype._clearSelectedFilters = function() {
			var items = this.getFilterItems(), subItems, i = 0, j;

			// reset all items to selected = false
			for (; i < items.length; i++) {
				if (items[i] instanceof sap.m.ViewSettingsFilterItem) {
					subItems = items[i].getItems();
					for (j = 0; j < subItems.length; j++) {
						subItems[j].setSelected(false);
					}
				}
				items[i].setSelected(false);
			}

			// update counters if visible
			if (this._iContentPage === 2 && this._getDialog().isOpen()) {
				this._updateFilterCounters();
			}
		};

		/*
		 * Clears preset filter item @private
		 */
		ViewSettingsDialog.prototype._clearPresetFilter = function() {
			if (this.getSelectedPresetFilterItem()) {
				this.setSelectedPresetFilterItem(null);
			}
		};

		/**
		 * Sets the current page to the filter page, clears info about the last opened page (content)
		 * and navigates to the filter page
		 * @private
		 * @return
		 */
		function resetFilterPage() {
			this._iContentPage = 2;
			this._oContentItem = null;
			this._navContainer.to(this._getPage1().getId(), "show");
		}
		/* =========================================================== */
		/* end: internal methods */
		/* =========================================================== */

		/* =========================================================== */
		/* begin: event handlers */
		/* =========================================================== */

		/*
		 * Internal event handler for the confirm button @private
		 */
		ViewSettingsDialog.prototype._onConfirm = function(oEvent) {
			var that = this, oDialog = this._getDialog(), fnAfterClose = function() {
				// detach this function
				that._dialog.detachAfterClose(fnAfterClose);

				// fire confirm event
				that.fireConfirm({
					sortItem : sap.ui.getCore().byId(that.getSelectedSortItem()),
					sortDescending : that.getSortDescending(),
					groupItem : sap.ui.getCore().byId(that.getSelectedGroupItem()),
					groupDescending : that.getGroupDescending(),
					presetFilterItem : sap.ui.getCore().byId(
						that.getSelectedPresetFilterItem()),
					filterItems : that.getSelectedFilterItems(),
					filterKeys : that.getSelectedFilterKeys(),
					filterString : that.getSelectedFilterString()
				});
			};

			// attach the reset function to afterClose to hide the dialog changes from
			// the end user
			oDialog.attachAfterClose(fnAfterClose);
			oDialog.close();
		};

		/*
		 * Internal event handler for the cancel button @private
		 */
		ViewSettingsDialog.prototype._onCancel = function(oEvent) {
			var that = this, oDialog = this._getDialog(), fnAfterClose = function() {
				// reset the dialog to the previous state
				that.setSelectedSortItem(that._oPreviousState.sortItem);
				that.setSortDescending(that._oPreviousState.sortDescending);
				that.setSelectedGroupItem(that._oPreviousState.groupItem);
				that.setGroupDescending(that._oPreviousState.groupDescending);
				that.setSelectedPresetFilterItem(that._oPreviousState.presetFilterItem);

				// selected filters need to be cleared before
				that._clearSelectedFilters();
				that.setSelectedFilterKeys(that._oPreviousState.filterKeys);

				// navigate to old page if necessary
				if (that._navContainer.getCurrentPage() !== that._oPreviousState.navPage) {
					jQuery.sap.delayedCall(0, that._navContainer, "to", [
						that._oPreviousState.navPage.getId(), "show" ]);
				}

				// navigate to old tab if necessary
				that._switchToPage(that._oPreviousState.contentPage,
					that._oPreviousState.contentItem);

				// detach this function
				that._dialog.detachAfterClose(fnAfterClose);

				// fire cancel event
				that.fireCancel();
			};

			// attach the reset function to afterClose to hide the dialog changes from
			// the end user
			oDialog.attachAfterClose(fnAfterClose);
			oDialog.close();
		};

		/*
		 * Internal event handler for the reset filter button @private
		 */
		ViewSettingsDialog.prototype._onClearFilters = function() {
			// clear data and update selections
			this._clearSelectedFilters();
			this._clearPresetFilter();

			// fire event to allow custom controls to react and reset
			this.fireResetFilters();

			// update counters
			this._updateFilterCounters();

			// page updates
			if (this._iContentPage === 3) { // go to filter overview page if necessary
				jQuery.sap.delayedCall(0, this._getNavContainer(), "back");
				this._switchToPage(2);
				this._getSegmentedButton().setSelectedButton(this._getFilterButton());
			}
			// update preset list selection
			this._updateListSelection(this._presetFilterList, sap.ui.getCore().byId(
				this.getSelectedPresetFilterItem()));
		};

		/* =========================================================== */
		/* end: event handlers */
		/* =========================================================== */


		return ViewSettingsDialog;

	}, /* bExport= */ true);
