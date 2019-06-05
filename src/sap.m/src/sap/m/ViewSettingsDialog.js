/*!
* ${copyright}
*/

// Provides control sap.m.ViewSettingsDialog.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'./Toolbar',
	'./CheckBox',
	'./SearchField',
	'./List',
	'./StandardListItem',
	'sap/ui/base/ManagedObject',
	'sap/ui/base/EventProvider',
	'sap/ui/Device',
	'sap/ui/core/InvisibleText',
	'./ViewSettingsDialogRenderer',
	"sap/m/GroupHeaderListItem",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "firstFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
],
function(
	library,
	Control,
	IconPool,
	Toolbar,
	CheckBox,
	SearchField,
	List,
	StandardListItem,
	ManagedObject,
	EventProvider,
	Device,
	InvisibleText,
	ViewSettingsDialogRenderer,
	GroupHeaderListItem,
	Log,
	jQuery
) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.m.StringFilterOperator
	var StringFilterOperator = library.StringFilterOperator;

	var LIST_ITEM_SUFFIX = "-list-item";

	/**
	 * Constructor for a new <code>ViewSettingsDialog</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Helps the user to sort, filter, or group data within a (master) {@link sap.m.List} or a
	 * {@link sap.m.Table}. The dialog is triggered by icon buttons in the table toolbar. Each
	 * button shows a dropdown list icon.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>ViewSettingsDialog</code> is a composite control,
	 * consisting of a modal {@link sap.m.Popover} and several internal lists.
	 * There are three different tabs (Sort, Group, Filter) in the dialog that can be
	 * activated by filling the respective associations. If only one association is
	 * filled, the other tabs are automatically hidden. The selected options can be used
	 * to create sorters and filters for the table.
	 *
	 * <b>Note:</b> If the app does not offer all three sorting, filtering, and grouping
	 * operations, but only one of these (such as sort), we recommend placing the
	 * icon button directly in the toolbar. Do not place sort, filter, or group buttons in
	 * the footer toolbar if they refer to a table. Place group, sort, and filter buttons
	 * in the footer toolbar if they refer to a master list.
	 *
	 * <h3>Usage</h3>
	 *
	 * <i>When to use?</i>
	 * <ul><li>If you need to allow the user to sort line items in a manageable list or
	 * table (up to 20 columns)</li>
	 * <li>If you need to offer custom filter settings in a manageable list or table
	 * (up to 20 columns)</li>
	 * <li>If you need to allow the user to group line items in a manageable list or
	 * table (up to 20 columns)</li></ul>
	 *
	 * <i>When not to use?</i>
	 * <ul><li>If you have complex tables (more than 20 columns)</li>
	 * <li>If you need to rearrange columns within your table (use the
	 * {@link sap.m.TablePersoDialog} instead)</li>
	 * <li>If you need very specific sort, filter, or column sorting options within
	 * complex tables (use the {@link sap.m.P13nDialog} instead)</li></ul>
	 *
	 * <h3>Responsive behavior</h3>
	 *
	 * The popover dialog appears as a modal window on desktop and tablet screen sizes,
	 * but full screen on smartphones.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.ViewSettingsDialog
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/view-settings-dialog/ View Settings Dialog}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ViewSettingsDialog = Control.extend("sap.m.ViewSettingsDialog", /** @lends sap.m.ViewSettingsDialog.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the title of the dialog. If not set and there is only one active tab, the dialog uses the default "View" or "Sort", "Group", "Filter" respectively.
			 */
			title : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * Determines whether the sort order is descending or ascending (default).
			 */
			sortDescending : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Determines whether the group order is descending or ascending (default).
			 */
			groupDescending : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Provides a string filter operator which is used when the user searches items in filter details page.
			 * Possible operators are: <code>AnyWordStartsWith</code>, <code>Contains</code>, <code>StartsWith</code>, <code>Equals</code>.
			 * This property will be ignored if a custom callback is provided through <code>setFilterSearchCallback</code> method.
			 * @since 1.42
			 */
			filterSearchOperator: {type: "sap.m.StringFilterOperator", group: "Behavior", defaultValue: StringFilterOperator.StartsWith }
		},
		aggregations : {

			/**
			 * The list of items with key and value that can be sorted over (for example, a list of columns for a table).
			 * @since 1.16
			 */
			sortItems : {type : "sap.m.ViewSettingsItem", multiple : true, singularName : "sortItem", bindable : "bindable"},

			/**
			 * The list of items with key and value that can be grouped on (for example, a list of columns for a table).
			 * @since 1.16
			 */
			groupItems : {type : "sap.m.ViewSettingsItem", multiple : true, singularName : "groupItem", bindable : "bindable"},

			/**
			 * The list of items with key and value that can be filtered on (for example, a list of columns for a table). A filterItem is associated with one or more detail filters.
			 *
			 * <b>Note:</b> It is recommended to use the <code>sap.m.ViewSettingsFilterItem</code> as it fits best at the filter page.
			 * @since 1.16
			 */
			filterItems : {type : "sap.m.ViewSettingsItem", multiple : true, singularName : "filterItem", bindable : "bindable"},

			/**
			 * The list of preset filter items with key and value that allows the selection of more complex or custom filters.
			 * These entries are displayed at the top of the filter tab.
			 * @since 1.16
			 */
			presetFilterItems : {type : "sap.m.ViewSettingsItem", multiple : true, singularName : "presetFilterItem", bindable : "bindable"},
			/**
			 * The list of all the custom tabs.
			 * @since 1.30
			 */
			customTabs: {type: "sap.m.ViewSettingsCustomTab", multiple: true, singularName: "customTab", bindable : "bindable"}
		},
		associations : {

			/**
			 * The sort item that is selected. It can be set by either passing a key or the item itself to the function setSelectedSortItem.
			 */
			selectedSortItem : {type : "sap.m.ViewSettingsItem", multiple : false},

			/**
			 * The group item that is selected. It can be set by either passing a key or the item itself to the function setSelectedGroupItem.
			 * By default 'None' is selected. You can restore back to 'None' by setting this association to empty value.
			 */
			selectedGroupItem : {type : "sap.m.ViewSettingsItem", multiple : false},

			/**
			 * The preset filter item that is selected. It can be set by either passing a key or the item itself to the function setSelectedPresetFilterItem. Note that either a preset filter OR multiple detail filters can be active at the same time.
			 */
			selectedPresetFilterItem : {type : "sap.m.ViewSettingsItem", multiple : false}
		},
		events : {

			/**
			 * Indicates that the user has pressed the OK button and the selected sort, group, and filter settings should be applied to the data on this page.
			 * </br></br><b>Note:</b> Custom tabs are not converted to event parameters automatically. For custom tabs, you have to read the state of your controls inside the callback of this event.
			 */
			confirm : {
				parameters : {

					/**
					 * The selected sort item.
					 */
					sortItem : {type : "sap.m.ViewSettingsItem"},

					/**
					 * The selected sort order (true = descending, false = ascending).
					 */
					sortDescending : {type : "boolean"},

					/**
					 * The selected group item.
					 */
					groupItem : {type : "sap.m.ViewSettingsItem"},

					/**
					 * The selected group order (true = descending, false = ascending).
					 */
					groupDescending : {type : "boolean"},

					/**
					 * The selected preset filter item.
					 */
					presetFilterItem : {type : "sap.m.ViewSettingsItem"},

					/**
					 * The selected filters in an array of ViewSettingsItem.
					 */
					filterItems : {type : "sap.m.ViewSettingsItem[]"},

					/**
					 * The selected filter items in an object notation format: { key: boolean }. If a custom control filter was displayed (for example, the user clicked on the filter item), the value for its key is set to true to indicate that there has been an interaction with the control.
					 * @deprecated as of version 1.42, replaced by <code>filterCompoundKeys</code> event
					 */
					filterKeys : {type : "object", deprecated: true},

					/**
					 * The selected filter items in an object notation format: { parentKey: { key: boolean, key2: boolean, ...  }, ...}. If a custom control filter was displayed (for example, the user clicked on the filter item), the value for its key is set to true to indicate that there has been an interaction with the control.
					 * @since 1.42
					 */
					filterCompoundKeys : {type : "object"},

					/**
					 * The selected filter items in a string format to display in the control's header bar in format "Filtered by: key (subkey1, subkey2, subkey3)".
					 */
					filterString : {type : "string"}
				}
			},

			/**
			 * Called when the Cancel button is pressed. It can be used to set the state of custom filter controls.
			 */
			cancel : {},

			/**
			 * Called when the reset filters button is pressed. It can be used to clear the state of custom filter controls.
			 */
			resetFilters : {},

			/**
			 * Fired when the filter detail page is opened.
			 */
			filterDetailPageOpened: {
				parameters: {
					/**
					 * The filter item for which the details are opened.
					 */
					parentFilterItem: {type: "sap.m.ViewSettingsFilterItem"}
				}
			}
		}
	}});


	/* =========================================================== */
	/* begin: API methods */
	/* =========================================================== */

	ViewSettingsDialog.prototype.init = function() {
		this._rb                            = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._sDialogWidth                  = "350px";
		this._sDialogHeight                 = "434px";

		/* this control does not have a
		 renderer, so we need to take care of
		 adding it to the ui tree manually */
		this._bAppendedToUIArea             = false;
		this._showSubHeader                 = false;
		this._filterDetailList              = undefined;
		this._vContentPage                  = -1;
		this._oContentItem                  = null;
		this._oPreviousState                = {};
		this._sCustomTabsButtonsIdPrefix    = '-custom-button-';
		this._sTitleLabelId                 = this.getId() + "-title";

		/* setup a name map between the sortItems
		 aggregation and an sap.m.List with items
		 the list itself will not be created right now */
		this._aggregationToListItems("sortItems", {
			text: {
				listProp: "title"
			},
			selected: {
			}
		}, {
			tooltip: {}
		},{
			type : ListType.Active
		}, {
			mode : ListMode.SingleSelectLeft,
			includeItemInSelection : true,
			selectionChange : function(oEvent) {
				var oListItem = oEvent.getParameter('listItem'),
					aItems = this.getSortItems(),
					oVSItemToSelect = this._getVSItem(oListItem),
					i;

				oVSItemToSelect.setProperty('selected', oEvent.getParameter('selected'), true, false);
				this.setAssociation('selectedSortItem', oVSItemToSelect, true);

				for (i = 0; i < aItems.length; i++) {
					if (oVSItemToSelect !== aItems[i]) {
						aItems[i].setProperty('selected', false, true, false);
					}
				}
			}.bind(this)
		});
	};

	ViewSettingsDialog.prototype.exit = function() {
		// helper variables
		this._rb                            = null;
		this._sDialogWidth                  = null;
		this._sDialogHeight                 = null;
		this._bAppendedToUIArea             = null;
		this._showSubHeader                 = null;
		this._vContentPage                  = null;
		this._oContentItem                  = null;
		this._oPreviousState                = null;
		this._sortContent                   = null;
		this._groupContent                  = null;
		this._filterContent                 = null;
		this._sCustomTabsButtonsIdPrefix    = null;
		this._fnFilterSearchCallback        = null;

		// sap.ui.core.Popup removes its content on close()/destroy() automatically from the static UIArea,
		// but only if it added it there itself. As we did that, we have to remove it also on our own
		if ( this._bAppendedToUIArea && this._dialog ) {
			var oStatic = sap.ui.getCore().getStaticAreaRef();
			oStatic = sap.ui.getCore().getUIArea(oStatic);
			oStatic.removeContent(this._dialog, true);
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

		if (this._ariaSortListInvisibleText) {
			this._ariaSortListInvisibleText.destroy();
			this._ariaSortListInvisibleText = null;
		}

		if (this._sortOrderList) {
			this._sortOrderList.destroy();
			this._sortOrderList = null;
			this._ariaSortOrderInvisibleText.destroy();
			this._ariaSortOrderInvisibleText = null;
		}

		if (this._oGroupingNoneItem) {
			this._oGroupingNoneItem.destroy();
			this._oGroupingNoneItem = null;
		}
		if (this._groupList) {
			this._groupList.destroy();
			this._groupList = null;
			this._ariaGroupListInvisibleText.destroy();
			this._ariaGroupListInvisibleText = null;
		}
		if (this._groupOrderList) {
			this._groupOrderList.destroy();
			this._groupOrderList = null;
			this._ariaGroupOrderInvisibleText.destroy();
			this._ariaGroupOrderInvisibleText = null;
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
		if (this._oStringFilter) {
			this._oStringFilter = null;
		}
	};

	ViewSettingsDialog.prototype._aggregationToListItems = function(sAggregationName, oItemPropertyMap, oItemAggregationMap, oListItemInitials, oListOptions) {
		var sType = this._getListType(sAggregationName),
			sListName = "_" + sType + "List";

		if (!this.mToList) {
			this.mToList = {};
		}

		this.mToList[sType] = {
			"itemPropertyMap": oItemPropertyMap,
			"itemAggregationMap": oItemAggregationMap,
			"listItemOptions": oListItemInitials,
			"listOptions": oListOptions,
			"listName": sListName
		};
	};

	ViewSettingsDialog.prototype._getListType = function(sAggregationName) {
		return sAggregationName.replace('Items', '');
	};

	ViewSettingsDialog.prototype._createList = function(sType) {
		var sListId = this.getId() + "-" + sType + "list",
			oList = new List(sListId, this.mToList[sType].listOptions),
			oGHI = this._createGroupHeaderItem(sType);

		oList.addItem(oGHI);
		this[this.mToList[sType].listName] = oList;

		return oList;
	};

	ViewSettingsDialog.prototype._createGroupHeaderItem = function(sListType) {
		return new GroupHeaderListItem({ title: this._rb.getText("VIEWSETTINGS_" + sListType.toUpperCase() + "_OBJECT") });
	};

	ViewSettingsDialog.prototype._getList = function(sType) {
		if (!this.mToList || !this.mToList[sType]) {
			return;
		}

		return this[this.mToList[sType].listName];
	};

	ViewSettingsDialog.prototype._createListItem = function(sType, oVSItem) {
		var oOptions = this.mToList[sType].listItemOptions,
			mItemPropertyMap = this.mToList[sType].itemPropertyMap,
			mItemAggregationMap = this.mToList[sType].itemAggregationMap,
			sListProp,
			oCreatedListItem;

		// Pass the properties
		for (var sProperty in mItemPropertyMap) {
			if (mItemPropertyMap.hasOwnProperty(sProperty)) {
				sListProp = mItemPropertyMap[sProperty].listProp || sProperty;
				oOptions[sListProp] = this._createListItemPropertyValue(sType, sProperty, oVSItem);
			}
		}

		// Pass the aggregations
		for (var sAggregationName in mItemAggregationMap) {
			if (mItemAggregationMap.hasOwnProperty(sAggregationName)) {
				oOptions[sAggregationName] = oVSItem.getAggregation(sAggregationName);
			}
		}

		oCreatedListItem = new StandardListItem(oOptions).data('item', oVSItem);

		return oCreatedListItem;
	};

	ViewSettingsDialog.prototype._createListItemPropertyValue = function(sType, sPropertyName, oVSItem) {
		var vVal = oVSItem.getMetadata().getAllProperties()[sPropertyName].get(oVSItem),
			fn = this.mToList[sType].itemPropertyMap[sPropertyName].fn;
		return fn ? fn(vVal) : vVal;
	};

	ViewSettingsDialog.prototype._getListItem = function(sType, oVSItem) {
		var aListItems = this._getList(sType).getItems().filter(function(oItem) {
			return oItem.data('item') === oVSItem;
		});

		return aListItems.length ? aListItems[0] : null;
	};

	ViewSettingsDialog.prototype._getVSItem = function(oListItem) {
		return oListItem.data('item');
	};

	/**
	 * Overwrites the aggregation setter in order to have ID validation logic as some strings
	 * are reserved for the predefined tabs.
	 *
	 * @overwrite
	 * @public
	 * @param {object} oCustomTab The custom tab to be added
	 * @returns {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.addCustomTab = function (oCustomTab) {
		var sId = oCustomTab.getId();
		if (sId === 'sort' || sId === 'filter' || sId === 'group') {
			throw 'Id "' + sId + '" is reserved and cannot be used as custom tab id.';
		}

		this.addAggregation('customTabs', oCustomTab);

		return this;
	};

	ViewSettingsDialog.prototype.invalidate = function() {
		// Invalidate call on ViewSettingsDialog is directly forwarded to the sap.m.Dialog
		// since the ViewSettingsDialog has no renderer.
		// CSN #80686/2014: only invalidate inner dialog if call does not come from inside
		// BCP #1670394376
		if (this._dialog && (!arguments[0] || arguments[0] && arguments[0].getId() !== this.getId() + "-dialog")) {
			this._dialog.invalidate(arguments);
		}
	};


	/**
	 * Forward method to the inner dialog method: addStyleClass.
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
	 * Forward method to the inner dialog method: removeStyleClass.
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
	 * Forward method to the inner dialog method: toggleStyleClass.
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
	 * Forward method to the inner dialog method: hasStyleClass.
	 * @public
	 * @override
	 * @returns {boolean} true if the class is set, false otherwise
	 */
	ViewSettingsDialog.prototype.hasStyleClass = function () {
		var oDialog = this._getDialog();

		return oDialog.hasStyleClass.apply(oDialog, arguments);
	};

	/**
	 * Forward method to the inner dialog method: getDomRef.
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
	 * Sets the title of the internal dialog.
	 *
	 * @overwrite
	 * @public
	 * @param {string} sTitle The title text for the dialog
	 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.setTitle = function(sTitle) {
		this._getTitleLabel().setText(sTitle);
		this.setProperty("title", sTitle, true);
		return this;
	};


	/**
	 * Override the method in order to attach some event handlers
	 * @override
	 * @param {string} sAggregationName Name of the added aggregation
	 * @param {object} oObject Instance that is going to be added
	 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be supressed
	 * @returns {object} This instance for chaining
	 */
	ViewSettingsDialog.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		Control.prototype.addAggregation.apply(this, arguments);

		var sType = this._getListType(sAggregationName);
		if (this.mToList[sType]) {
			var oListItem = this._createListItem(sType, oObject);
			var oList = this._getList(sType);
			if (!oList) {
				oList = this._createList(sType);
			} else if (!oList.getItems().length) {
				oList.addItem(this._createGroupHeaderItem(sType));
			}

			oList.addItem(oListItem);
			this._attachItemPropertyChange(sType, oObject);
		} else {
			this._attachItemEventHandlers(sAggregationName, oObject);
		}

		return this;
	};

	/**
	 * Override the method in order to attach some event handlers
	 * @override
	 * @param {string} sAggregationName Name of the added aggregation
	 * @param {object} oObject Instance that is going to be added
	 * @param {int} iIndex the <code>0</code>-based index the managed object should be inserted
	 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be supressed
	 * @returns {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 */
	ViewSettingsDialog.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		Control.prototype.insertAggregation.apply(this, arguments);

		var sType = this._getListType(sAggregationName);
		if (this.mToList[sType]) {
			var oListItem = this._createListItem(sType, oObject);
			var oList = this._getList(sType);
			if (!oList) {
				oList = this._createList(sType);
				oList.insertItem(oListItem, iIndex);
			} else if (!oList.getItems().length) {
				oList.addItem(this._createGroupHeaderItem(sType));
				oList.insertItem(oListItem, iIndex + 1);
			} else {
				oList.insertItem(oListItem, iIndex);
			}

			this._attachItemPropertyChange(sType, oObject);
		} else {
			this._attachItemEventHandlers(sAggregationName, oObject);
		}

		return this;
	};

	ViewSettingsDialog.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
		restoreCustomTabContentAggregation.call(this, sAggregationName, vObject);

		var vRemovedObject = Control.prototype.removeAggregation.apply(this, arguments);

		var sType = this._getListType(sAggregationName);
		if (this.mToList[sType]) {
			var oListItem = this._getListItem(sType, vRemovedObject);
			var oList = this._getList(sType);
			var oRemovedListItem = oList.removeItem(oListItem);
			oRemovedListItem.destroy();
			this._detachItemPropertyChange(vRemovedObject);
		}

		return vRemovedObject;
	};

	ViewSettingsDialog.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		// custom tabs aggregation needs special handling - make sure it happens
		restoreCustomTabContentAggregation.call(this);

		var vRemovedObjects = Control.prototype.removeAllAggregation.apply(this, arguments);

		var sType = this._getListType(sAggregationName);
		if (this.mToList[sType]) {
			var oList = this._getList(sType);
			if (oList) { //we may not have any internal lists (e.g. no sortItems for this VSD instance)
				var oRemovedListItems = oList.removeAllItems();

				oRemovedListItems.forEach(function(oItem) {
					oItem.destroy();
				});
			}
			vRemovedObjects.forEach(function(oItem) {
				this._detachItemPropertyChange(oItem);
			}, this);
		}

		return vRemovedObjects;
	};

	ViewSettingsDialog.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
		restoreCustomTabContentAggregation.call(this);

		Control.prototype.destroyAggregation.apply(this, arguments);

		var sType = this._getListType(sAggregationName);
		if (this.mToList[sType]) {
			var oList = this._getList(sType);
			if (oList) {
				oList.destroyItems();
			}
		}

		return this;
	};

	ViewSettingsDialog.prototype._detachItemPropertyChange = function(oVSItem) {
		delete EventProvider.getEventList(oVSItem)["itemPropertyChanged"];
	};

	ViewSettingsDialog.prototype._attachItemPropertyChange = function(sType, oVSItem) {
		oVSItem.attachEvent('itemPropertyChanged', function fnHandleItemPropertyChanged(oEvent) {
			var oListItem,
				sProp,
				sListProp,
				vVal,
				fn,
				vListPropVal;

			oListItem = this._getListItem(sType, oVSItem);
			sProp = oEvent.getParameter('propertyKey');

			if (!this.mToList[sType].itemPropertyMap[sProp]) {
				return;
			}

			sListProp = this.mToList[sType].itemPropertyMap[sProp].listProp || sProp;
			vVal = oEvent.getParameter('propertyValue');
			fn = this.mToList[sType].itemPropertyMap[sProp].fn;
			vListPropVal = fn ? fn(vVal) : vVal;

			oListItem.getMetadata().getAllProperties()[sListProp].set(oListItem, vListPropVal);
		}, this);
	};

	/**
	 * Attaches event handlers responsible for propagating
	 * item property changes as well as filter detail items' change.
	 * @param {string} sAggregationName The name of the aggregation
	 * @param {Object} oObject
	 * @returns {object} This instance for chaining
	 */
	ViewSettingsDialog.prototype._attachItemEventHandlers = function(sAggregationName, oObject) {
		// perform the following logic only for the items aggregations, except custom tabs
		if (sAggregationName !== 'groupItems' && sAggregationName !== 'filterItems') {
			return this;
		}

		var sType = sAggregationName.replace('Items', ''); // extract "filter"/"group"
		sType = sType.charAt(0).toUpperCase() + sType.slice(1); // capitalize


		// Attach 'itemPropertyChanged' handler, that will re-initiate (specific) dialog content
		oObject.attachEvent('itemPropertyChanged', function (sAggregationName, oEvent) {
			/* If the changed item was a 'sap.m.ViewSettingsItem'
			 * then threat it differently as filter detail item.
			 * */
			if (sAggregationName === 'filterItems' &&
				oEvent.getParameter('changedItem').getParent().getMetadata().getName() === 'sap.m.ViewSettingsFilterItem') {
				// handle the select differently
				if (oEvent.getParameter('propertyKey') !== 'selected') {
					// if on filter details page for a concrete filter item
					if (this._vContentPage === 3 && this._oContentItem) {
						this._setFilterDetailTitle(this._oContentItem);
						this._initFilterDetailItems(this._oContentItem);
					}
				} else {
					// Change only the "select" property on the concrete item (instead calling _initFilterDetailItems() all over) to avoid re-rendering
					// ToDo: make this optimization for all properties
					if (this._filterDetailList) {
						var aItems = this._filterDetailList.getItems();
						aItems.forEach(function (oItem) {
							if (oItem.data('item').getId() === oEvent.getParameter('changedItem').getId()) {
								oItem.setSelected(oEvent.getParameter('propertyValue'));
							}
						});

						this._updateSelectAllCheckBoxState();
					}
				}
				this._updateFilterCounters(); //selected item has changed, so counters must be updated
			} else {
				// call _initFilterContent and _initFilterItems methods, where "Filter" might be also "Group"
				if (typeof this['_init' + sType + 'Content'] === 'function') {
					this['_init' + sType + 'Content']();
				}
				if (typeof this['_init' + sType + 'Items'] === 'function') {
					this['_init' + sType + 'Items']();
				}
			}
		}.bind(this, sAggregationName));

		// Attach 'filterDetailItemsAggregationChange' handler, that will re-initiate (specific) dialog content
		oObject.attachEvent('filterDetailItemsAggregationChange', function (oEvent) {
			if (this._vContentPage === 3 && this._oContentItem) {
				this._setFilterDetailTitle(this._oContentItem);
				this._initFilterDetailItems(this._oContentItem);
			}
		}.bind(this));

		return this;
	};

	/**
	 * Set header title for the filter detail page.
	 * @param {object} oItem Item that will serve as a title
	 * @private
	 */
	ViewSettingsDialog.prototype._setFilterDetailTitle = function (oItem) {
		this._getDetailTitleLabel().setText(
			this._rb.getText("VIEWSETTINGS_TITLE_FILTERBY") + " "
			+ oItem.getText());
	};

	/**
	 * Take care to update the internal instances when any of the corresponding aggregation is being updated.
	 *
	 * @override
	 * @param {string} sAggregationName Name of the updated aggregation
	 * @returns {ViewSettingsDialog} this instance for chaining
	 */
	ViewSettingsDialog.prototype.updateAggregation = function (sAggregationName) {
		Control.prototype.updateAggregation.apply(this, arguments);

		// perform the following logic only for the items aggregations, except custom tabs
		if (sAggregationName !== 'groupItems' && sAggregationName !== 'filterItems') {
			return this;
		}

		var sType = sAggregationName.replace('Items', ''); // extract "filter"/"group"/"sort"
		sType = sType.charAt(0).toUpperCase() + sType.slice(1); // capitalize

		// call _initFilterContent and _initFilterItems methods, where "Filter" might be also "Group" or "Sort"
		if (typeof this['_init' + sType + 'Content'] === 'function') {
			this['_init' + sType + 'Content']();
		}
		if (typeof this['_init' + sType + 'Items'] === 'function') {
			this['_init' + sType + 'Items']();
		}
	};

	/**
	 * Adds a sort item and sets the association to reflect the selected state.
	 *
	 * @overwrite
	 * @public
	 * @param {sap.m.ViewSettingsItem} oItem The item to be added to the aggregation
	 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.addSortItem = function(oItem) {
		this.addAggregation("sortItems", oItem);

		if (oItem.getSelected()) {
			this.setSelectedSortItem(oItem);
		}
		return this;
	};

	/**
	 * Adds a group item and sets the association to reflect the selected state.
	 *
	 * @overwrite
	 * @public
	 * @param {sap.m.ViewSettingsItem} oItem The item to be added to the group items
	 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.addGroupItem = function(oItem) {
		this.addAggregation("groupItems", oItem);

		if (oItem.getSelected()) {
			this.setSelectedGroupItem(oItem);
		}
		return this;
	};

	/**
	 * Adds a preset filter item and sets the association to reflect the selected state.
	 *
	 * @overwrite
	 * @public
	 * @param {sap.m.ViewSettingsItem} oItem The selected item or a string with the key
	 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.addPresetFilterItem = function(oItem) {
		this.addAggregation("presetFilterItems", oItem);

		if (oItem.getSelected()) {
			this.setSelectedPresetFilterItem(oItem);
		}
		return this;
	};

	/**
	 * Sets the selected sort item (either by key or by item).
	 *
	 * @overwrite
	 * @public
	 * @param {sap.m.ViewSettingsItem|string} vItemOrKey The selected item or the item's key string
	 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.setSelectedSortItem = function(vItemOrKey) {
		var aItems = this.getSortItems(),
			i = 0,
			oItem = findViewSettingsItemByKey(
				vItemOrKey,
				aItems,
				"Could not set selected sort item. Item is not found: '" + vItemOrKey + "'"
			);

		//change selected item only if it is found among the sort items
		if (validateViewSettingsItem(oItem)) {
			// set selected = true for this item & selected = false for all others items
			for (i = 0; i < aItems.length; i++) {
				if (aItems[i].getId() !== oItem.getId()) {
					aItems[i].setProperty('selected', false, true);
				}
			}

			if (oItem.getProperty('selected') !== true) {
				oItem.setProperty('selected', true, true);
			}

			// update the list selection
			if (this._getDialog().isOpen()) {
				this._updateListSelection(this._sortList, oItem);
			}
			this.setAssociation("selectedSortItem", oItem, true);
		}

		return this;
	};

	/**
	 * Sets the selected group item (either by key or by item).
	 *
	 * @overwrite
	 * @public
	 * @param {sap.m.ViewSettingsItem|string} vItemOrKey The selected item or the item's key string
	 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.setSelectedGroupItem = function(vItemOrKey) {
		var aItems = this.getGroupItems(),
			i = 0,
			oItem = findViewSettingsItemByKey(
				vItemOrKey,
				aItems,
				"Could not set selected group item. Item is not found: '" + vItemOrKey + "'"
			);

		// if no Item is found and the key is empty set the default "None" item as selected
		// BCP: 1780536754
		if (!oItem && !vItemOrKey) {
			oItem = this._oGroupingNoneItem;
		}
		//change selected item only if it is found among the group items
		if (validateViewSettingsItem(oItem)) {
			// set selected = true for this item & selected = false for all others items
			for (i = 0; i < aItems.length; i++) {
				aItems[i].setProperty('selected', false, true);
			}

			oItem.setProperty('selected', true, true);

			// update the list selection
			if (this._getDialog().isOpen()) {
				this._updateListSelection(this._groupList, oItem);
			}
			this.setAssociation("selectedGroupItem", oItem, true);
		}

		return this;
	};

	/**
	 * Sets the selected preset filter item.
	 *
	 * @overwrite
	 * @public
	 * @param {sap.m.ViewSettingsItem|string|null} vItemOrKey The selected item or the item's key string
	 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.setSelectedPresetFilterItem = function(vItemOrKey) {
		var aItems = this.getPresetFilterItems(),
			i = 0,
			oItem = findViewSettingsItemByKey(
				vItemOrKey,
				aItems,
				"Could not set selected preset filter item. Item is not found: '" + vItemOrKey + "'"
			);

		//change selected item if it is found among the preset filter items or in case of resetting the value
		if (validateViewSettingsItem(oItem) || oItem === null) {
			// set selected = true for this item & selected = false for all others items
			for (i = 0; i < aItems.length; i++) {
				aItems[i].setProperty('selected', false, true);
			}

			if (oItem !== null) {
				oItem.setProperty('selected', true, true);
			}
			// clear filters (only one mode is allowed, preset filters or filters)
			this._clearSelectedFilters();

			this.setAssociation("selectedPresetFilterItem", oItem, true);
		}

		return this;
	};

	/**
	 * Opens the ViewSettingsDialog relative to the parent control.
	 *
	 * @public
	 * @param {string} [sPageId] The ID of the initial page to be opened in the dialog.
	 *	The available values are "sort", "group", "filter" or IDs of custom tabs.
	 *
	 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ViewSettingsDialog.prototype.open = function(sPageId) {

		// add to static UI area manually because we don't have a renderer

		if (!this.getParent() && !this._bAppendedToUIArea) {
			var oStatic = sap.ui.getCore().getStaticAreaRef();
			oStatic = sap.ui.getCore().getUIArea(oStatic);
			// add as content the Dialog to the Static area and not the ViewSettingsDialog
			// once the Static area is invalidated, the Dialog will be rendered and not the ViewSettingsDialog which has no renderer
			// and uses the renderer of the Dialog
			oStatic.addContent(this._getDialog(), true);
			this._bAppendedToUIArea = true;
		}

		// if there is a default tab and the user has been at filter details view on page2, go back to page1
		if (sPageId && this._vContentPage === 3) {
			setTimeout(this._getNavContainer()["to"].bind(this._getNavContainer(), this._getPage1().getId(), "show"), 0);
		}

		// init the dialog content based on the aggregations
		this._initDialogContent(sPageId);

		// store the current dialog state to be able to reset it on cancel
		this._oPreviousState = {
			sortItem : sap.ui.getCore().byId(this.getSelectedSortItem()),
			sortDescending : this.getSortDescending(),
			groupItem : sap.ui.getCore().byId(this.getSelectedGroupItem()),
			groupDescending : this.getGroupDescending(),
			presetFilterItem : sap.ui.getCore().byId(
				this.getSelectedPresetFilterItem()),
			filterKeys : this.getSelectedFilterKeys(),
			filterCompoundKeys: this.getSelectedFilterCompoundKeys(),
			navPage : this._getNavContainer().getCurrentPage(),
			contentPage : this._vContentPage,
			contentItem : this._oContentItem
		};

		//focus the first focusable item in current page's content
		if (Device.system.desktop) {
			this._getDialog().attachEventOnce("afterOpen", function () {
				var oCurrentPage = this._getNavContainer().getCurrentPage(),
					$firstFocusable;
				if (oCurrentPage) {
					$firstFocusable = oCurrentPage.$("cont").firstFocusableDomRef();
					if ($firstFocusable) {
						if (jQuery($firstFocusable).hasClass('sapMListUl')) {
							var $aListItems = jQuery($firstFocusable).find('.sapMLIB');
							$aListItems.length && $aListItems[0].focus();
							return;
						}

						$firstFocusable.focus();
					}
				}
			}, this);
		}

		// open dialog
		this._getDialog().open();

		return this;
	};

	/**
	 * Returns the selected filters as an array of ViewSettingsItems.
	 *
	 * It can be used to create matching sorters and filters to apply the selected settings to the data.
	 * @overwrite
	 * @public
	 * @return {sap.m.ViewSettingsItem[]} An array of selected filter items
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
	 * Gets the filter string in format: "filter name (subfilter1 name, subfilter2
	 * name, ...), ...".
	 * For custom and preset filters it will only add the filter name to the resulting string.
	 *
	 * @public
	 * @return {string} The selected filter string
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ViewSettingsDialog.prototype.getSelectedFilterString = function() {
		var sFilterString       = "",
			sSubfilterString,
			oPresetFilterItem   = this.getSelectedPresetFilterItem(),
			aFilterItems        = this.getFilterItems(),
			aSubFilterItems,
			bMultiSelect        = true,
			i                   = 0,
			j;

		if (oPresetFilterItem) {
			// preset filter: add "filter name"
			sFilterString = this._rb.getText("VIEWSETTINGS_FILTERTEXT").concat(" " + sap.ui.getCore().byId(oPresetFilterItem).getText());
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
				sFilterString = this._rb.getText("VIEWSETTINGS_FILTERTEXT").concat(" " + sFilterString);
			}
		}
		return sFilterString;
	};

	/**
	 * Gets the selected filter object in format {key: boolean}.
	 *
	 * It can be used to create matching sorters and filters to apply the selected settings to the data.
	 *
	 * @public
	 * @return {object} An object with item and sub-item keys
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @deprecated as of version 1.42, replaced by <code>getSelectedFilterCompoundKeys</code> method
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
	 * Gets the selected filter object in format { parent_key: { key: boolean, key2: boolean, ...}, ... }.
	 *
	 * @public
	 * @return {object} An object with item and sub-item keys
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.42
	 */
	ViewSettingsDialog.prototype.getSelectedFilterCompoundKeys = function() {
		var oSelectedFilterKeys = {},
			aSelectedFilterItems = this.getSelectedFilterItems(),
			i,
			sKey,
			sParentKey,
			oFilterItem;

		for (i = 0; i < aSelectedFilterItems.length; i++) {
			oFilterItem = aSelectedFilterItems[i];
			if (oFilterItem instanceof sap.m.ViewSettingsCustomItem) {
				sKey = oFilterItem.getKey();
				oSelectedFilterKeys[sKey] = oFilterItem.getSelected();

			} else {
				sKey = oFilterItem.getKey();
				sParentKey = oFilterItem.getParent().getKey();
				if (!oSelectedFilterKeys[sParentKey]) {
					oSelectedFilterKeys[sParentKey] = {};
				}
				oSelectedFilterKeys[sParentKey][sKey] = oFilterItem.getSelected();
			}
		}

		return oSelectedFilterKeys;
	};

	/**
	 * Sets the selected filter object in format {key: boolean}.
	 * <b>Note:</b> Do not use duplicated item keys with this method.
	 *
	 * @public
	 * @param {object} oSelectedFilterKeys
	 *         A configuration object with filter item and sub item keys in the format: { key: boolean }.
	 *         Setting boolean to true will set the filter to true, false or omitting an entry will set the filter to false.
	 *         It can be used to set the dialog state based on presets.
	 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @deprecated as of version 1.42, replaced by <code>setSelectedFilterCompoundKeys</code> method
	 */
	ViewSettingsDialog.prototype.setSelectedFilterKeys = function(oSelectedFilterKeys) {
		var aFilterItems    = this.getFilterItems(),
			aSubFilterItems = {},
			oFilterItem,
			bMultiSelect,
			i,
			j,
			k;

		// clear preset filters (only one mode is allowed, preset filters or filters)
		if (Object.keys(oSelectedFilterKeys).length) {
			this._clearPresetFilter();
		}

		// loop through the provided object array {key -> subKey -> boolean}
		for (var sKey in oSelectedFilterKeys) { // filter key
			oFilterItem = null;
			if (oSelectedFilterKeys.hasOwnProperty(sKey)) {
				for (i = 0; i < aFilterItems.length; i++) {
					if (aFilterItems[i] instanceof sap.m.ViewSettingsCustomItem) {
						// just compare the key of this control
						if (aFilterItems[i].getKey() === sKey) {
							oFilterItem = aFilterItems[i];
							aFilterItems[i].setProperty('selected', oSelectedFilterKeys[sKey], true);
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
										aSubFilterItems[k].setProperty('selected', false, true);
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
					Log.warning('Cannot set state for key "' + sKey
					+ '" because there is no filter with these keys');
					continue;
				}

				// set the selected state on the item
				oFilterItem.setProperty('selected', oSelectedFilterKeys[sKey], true);
			}
		}

		return this;
	};

	/**
	 * Sets the selected filter object in format { parent_key: { key: boolean, key2: boolean, ...}, ... }.
	 *
	 * @public
	 * @param {object} oSelectedFilterKeys
	 *         A configuration object with filter item and sub item keys in the format: { parent_key: { key: boolean, key2: boolean, ...}, ... }.
	 *         Setting boolean to true will set the filter to true, false or omitting an entry will set the filter to false.
	 *         It can be used to set the dialog state based on presets.
	 * @return {sap.m.ViewSettingsDialog} this pointer for chaining
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.42
	 */
	ViewSettingsDialog.prototype.setSelectedFilterCompoundKeys = function(oSelectedFilterKeys) {
		var aFilterItems = this.getFilterItems();
		var fnGetSelectedItemFromFilterKey = function (aFilterItems, oFilterKeys, sKey) {
			if (!oFilterKeys.hasOwnProperty(sKey)) {
				return;
			}

			var oItem = getViewSettingsItemByKey(aFilterItems, sKey);

			return oItem;
		};

		// clear preset filters (only one mode is allowed, preset filters or filters)
		if (Object.keys(oSelectedFilterKeys).length) {
			this._clearPresetFilter();
		}

		// loop through the provided object array {key -> subKey -> boolean}
		for (var sParentKey in oSelectedFilterKeys) { // filter key
			var oParentItem = fnGetSelectedItemFromFilterKey(aFilterItems, oSelectedFilterKeys, sParentKey);

			if (!oParentItem) {
				Log.warning('No filter with key "' + sParentKey);
				continue;
			}

			if (oParentItem instanceof sap.m.ViewSettingsCustomItem) {
				oParentItem.setProperty('selected', oSelectedFilterKeys[sParentKey], true);
			} else if (oParentItem instanceof sap.m.ViewSettingsFilterItem) {
				var oSelectedSubFilterKeys = oSelectedFilterKeys[sParentKey];
				var aSubFilterItems = oParentItem.getItems();
				var bMultiSelect = oParentItem.getMultiSelect();

				for (var sKey in oSelectedSubFilterKeys) {
					var oItem = fnGetSelectedItemFromFilterKey(aSubFilterItems, oSelectedSubFilterKeys, sKey);

					if (!oItem) {
						Log.warning('No filter with key "' + sKey);
						continue;
					}

					if (!bMultiSelect) {
						aSubFilterItems.forEach(function(item) {
							item.setProperty('selected', false, true);
						});
					}

					oItem.setProperty('selected', oSelectedSubFilterKeys[sKey], true);
				}
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

	/**
	 * Lazy initialization of the internal dialog.
	 * @returns {sap.m.Dialog} The created dialog
	 * @private
	 */
	ViewSettingsDialog.prototype._getDialog = function() {
		var that = this;

		// create an internal instance of a dialog
		if (this._dialog === undefined) {
			this._dialog = new sap.m.Dialog(this.getId() + "-dialog", {
				ariaLabelledBy      : this._sTitleLabelId,
				showHeader          : false,
				stretch             : Device.system.phone,
				verticalScrolling   : true,
				horizontalScrolling : false,
				contentWidth        : this._sDialogWidth,
				contentHeight       : this._sDialogHeight,
				content             : this._getNavContainer(),
				beginButton         : new sap.m.Button(this.getId() + "-acceptbutton", {
					text : this._rb.getText("VIEWSETTINGS_ACCEPT"),
					type: sap.m.ButtonType.Emphasized
				}).attachPress(this._onConfirm, this),
				endButton           : new sap.m.Button(this.getId() + "-cancelbutton", {
					text : this._rb.getText("VIEWSETTINGS_CANCEL")
				}).attachPress(this._onCancel, this)
			}).addStyleClass("sapMVSD");

			this.addDependent(this._dialog);

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

	/**
	 * Lazy initialization of the internal nav container.
	 * @returns {sap.m.NavContainer} The created navigation container
	 * @private
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

	/**
	 * Lazy initialization of the internal title label.
	 * @returns {sap.m.Label} The created title label
	 * @private
	 */
	ViewSettingsDialog.prototype._getTitleLabel = function() {
		if (this._titleLabel === undefined) {
			this._titleLabel = new sap.m.Label(this._sTitleLabelId, {
				text : this._rb.getText("VIEWSETTINGS_TITLE")
			}).addStyleClass("sapMVSDTitle");
		}
		return this._titleLabel;
	};

	/**
	 * Lazy initialization of the internal reset button.
	 * @returns {sap.m.Button} The created reset button
	 * @private
	 */
	ViewSettingsDialog.prototype._getResetButton = function() {
		var that = this;

		if (this._resetButton === undefined) {
			this._resetButton = new sap.m.Button(this.getId() + "-resetbutton", {
				icon : IconPool.getIconURI("clear-filter"),
				press : function() {
					that._onClearFilters();
				},
				tooltip : this._rb.getText("VIEWSETTINGS_CLEAR_FILTER_TOOLTIP")
			});
		}
		return this._resetButton;
	};

	/**
	 * Lazy initialization of the internal detail title label.
	 * @returns {sap.m.Label} The created detail title label
	 * @private
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

	/**
	 * Lazy initialization of the internal header.
	 * @returns {sap.m.Bar} The created header
	 * @private
	 */
	ViewSettingsDialog.prototype._getHeader = function() {
		if (this._header === undefined) {
			this._header = new sap.m.Bar({
				contentMiddle : [ this._getTitleLabel() ]
			}).addStyleClass("sapMVSDBar");
		}
		return this._header;
	};

	/**
	 * Lazy initialization of the internal sub header.
	 * @returns {sap.m.Bar} The created sub-header
	 * @private
	 */
	ViewSettingsDialog.prototype._getSubHeader = function() {
		if (this._subHeader === undefined) {
			this._subHeader = new sap.m.Bar({
				contentLeft : [ this._getSegmentedButton() ]
			}).addStyleClass("sapMVSDBar");
		}
		return this._subHeader;
	};

	/**
	 * Lazy initialization of the internal segmented button.
	 * @returns {sap.m.SegmentedButton} The created segmentedButton
	 * @private
	 */
	ViewSettingsDialog.prototype._getSegmentedButton = function() {
		var that                = this,
			aCustomTabs         = this.getCustomTabs(),
			iCustomTabsLength   = aCustomTabs.length,
			i                   = 0;

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
					} else {
						for (i = 0; i < iCustomTabsLength; i++) {
							var oCustomTab = aCustomTabs[i],
								sCustomTabId = that.getId() + that._sCustomTabsButtonsIdPrefix + oCustomTab.getId();
							if (!that._isEmptyTab(oCustomTab) && selectedId === sCustomTabId) {
								that._switchToPage(oCustomTab.getId());
								break;
							}
						}
					}
					Log.info('press event segmented: '
					+ oEvent.getParameter('id'));
				}
			}).addStyleClass("sapMVSDSeg");

			// workaround to fix flickering caused by css measurement in SegmentedButton. Temporary solution that
			// may be removed once VSD current page rendering implementation is changed.
			this._segmentedButton._bPreventWidthRecalculationOnAfterRendering = true;
		}
		return this._segmentedButton;
	};

	/**
	 * Lazy initialization of the internal sort button.
	 * @returns {sap.m.Button} The created sort button
	 * @private
	 */
	ViewSettingsDialog.prototype._getSortButton = function() {
		if (this._sortButton === undefined) {
			this._sortButton = new sap.m.Button(this.getId() + "-sortbutton", {
				icon : IconPool.getIconURI("sort"),
				tooltip : this._rb.getText("VIEWSETTINGS_TITLE_SORT")
			});
		}
		return this._sortButton;
	};

	/**
	 * Lazy initialization of the internal group button.
	 * @returns {sap.m.Button} The created group button
	 * @private
	 */
	ViewSettingsDialog.prototype._getGroupButton = function() {
		if (this._groupButton === undefined) {
			this._groupButton = new sap.m.Button(this.getId() + "-groupbutton", {
				icon : IconPool.getIconURI("group-2"),
				tooltip : this._rb.getText("VIEWSETTINGS_TITLE_GROUP")
			});
		}
		return this._groupButton;
	};

	/**
	 * Lazy initialization of the internal filter button.
	 * @returns {sap.m.Button} The created filter sap.m.Button
	 * @private
	 */
	ViewSettingsDialog.prototype._getFilterButton = function() {
		if (this._filterButton === undefined) {
			this._filterButton = new sap.m.Button(this.getId() + "-filterbutton", {
				icon : IconPool.getIconURI("filter"),
				tooltip : this._rb.getText("VIEWSETTINGS_TITLE_FILTER")
			});
		}
		return this._filterButton;
	};

	/**
	 * Lazy initialization of the internal page1 (sort/group/filter).
	 * @param {boolean} bSuppressCreation If true, no page will be create in case it doesn't exist.
	 * @returns {sap.m.Page} The created first page
	 * @private
	 */
	ViewSettingsDialog.prototype._getPage1 = function(bSuppressCreation) {
		if (this._page1 === undefined && !bSuppressCreation) {
			this._page1 = new sap.m.Page(this.getId() + '-page1', {
				title           : this._rb.getText("VIEWSETTINGS_TITLE"),
				customHeader    : this._getHeader()
			});
			this._getNavContainer().addPage(this._page1); // sort, group, filter
		}

		return this._page1;
	};

	/**
	 * Lazy initialization of the internal page2 (detail filters).
	 * @returns {sap.m.Page} The created second page
	 * @private
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
				icon : IconPool.getIconURI("clear-filter"),
				press : function() {
					that._onClearFilters();
				},
				tooltip : this._rb.getText("VIEWSETTINGS_CLEAR_FILTER_TOOLTIP")
			});
			oDetailHeader = new sap.m.Bar({
				contentLeft     : [ oBackButton ],
				contentMiddle   : [ this._getDetailTitleLabel() ],
				contentRight    : [ oDetailResetButton ]
			}).addStyleClass("sapMVSDBar");
			this._page2 = new sap.m.Page(this.getId() + '-page2', {
				title           : this._rb.getText("VIEWSETTINGS_TITLE_FILTERBY"),
				customHeader    : oDetailHeader
			});
			this._getNavContainer().addPage(this._page2); // filter details
		}
		return this._page2;
	};


	/**
	 * Create list item instance for each filter detail item.
	 * @param {object} oItem Filter item instance for which the details should be displayed
	 * @private
	 */
	ViewSettingsDialog.prototype._initFilterDetailItems = function(oItem) {
		if (!(oItem instanceof sap.m.ViewSettingsFilterItem)) {
			return;
		}

		var oListItem;
		var bMultiSelectMode = oItem.getMultiSelect();
		var aSubFilters = oItem.getItems();
		var that = this;

		if (this._filterDetailList) { // destroy previous list
			this._filterDetailList.destroy();
		}

		this._getPage2().removeAllAggregation('content');

		this._filterDetailList = new List(
		{
			mode : (bMultiSelectMode ? ListMode.MultiSelect
				: ListMode.SingleSelectLeft),
			includeItemInSelection : true,
			selectionChange : function(oEvent) {
				var oSubItem,
					aEventListItems = oEvent.getParameter("listItems"),
					aSubItems,
					i = 0,
					bNewValue;

				that._clearPresetFilter();

				if (bMultiSelectMode) {
					this._updateSelectAllCheckBoxState();
				}

				// check if multiple items are selected - [CTRL] + [A] combination from the list
				if (aEventListItems.length > 1 && bMultiSelectMode){
					aSubItems = oItem.getItems();
					for (; i < aSubItems.length; i++) {
						for (var j = 0; j < aEventListItems.length; j++){
							if (aSubItems[i].getKey() === aEventListItems[j].getCustomData()[0].getValue().getKey()){
								aSubItems[i].setProperty('selected', aEventListItems[j].getSelected(), true);
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
							if (aSubItems[i].getId() !== oSubItem.getId()) {
								aSubItems[i].setProperty('selected', false, true);
							}
						}
					}

					bNewValue = oEvent.getParameter("listItem").getSelected();
					if (oSubItem.getProperty('selected') !== bNewValue) {
						oSubItem.setProperty('selected', bNewValue, true);
					}
				}
			}.bind(this)
		});

		for (var i = 0; i < aSubFilters.length; i++) {
			// use name if there is no key defined
			oListItem = new StandardListItem({
				title : ManagedObject.escapeSettingsValue(aSubFilters[i].getText()),
				type : ListType.Active,
				selected : aSubFilters[i].getSelected(),
				tooltip : aSubFilters[i].getTooltip()
			}).data("item", aSubFilters[i]);
			this._filterDetailList.addItem(oListItem);
		}

		this._filterSearchField = this._getFilterSearchField(this._filterDetailList);
		this._getPage2().addContent(this._filterSearchField.addStyleClass('sapMVSDFilterSearchField'));
		// add this css style for recognizing when after the sap.m.Bar is SearchField, so we can remove the bar border
		this._getPage2().getCustomHeader().addStyleClass('sapMVSDBarWithSearch');

		if (bMultiSelectMode) {
			this._selectAllCheckBox = this._createSelectAllCheckbox(aSubFilters, this._filterDetailList);

			this._filterDetailList.setHeaderToolbar(new Toolbar({
				content: [ this._selectAllCheckBox ]
			}).addStyleClass('sapMVSDFilterHeaderToolbar'));
		}

		this._getPage2().addContent(this._filterDetailList);
	};

	/**
	 * Creates and initializes the sort content controls.
	 * @private
	 */
	ViewSettingsDialog.prototype._initSortContent = function() {
		var that = this;

		if (this._sortContent) {
			return;
		}
		this._vContentPage = -1;

		// Aria - used to label the sort order list
		this._ariaSortOrderInvisibleText = new InvisibleText(this.getId() + "-sortOrderLabel", {
			text: this._rb.getText("VIEWSETTINGS_SORT_DIRECTION").concat(":")
		});

		this._sortOrderList = new List(this.getId() + "-sortorderlist", {
			mode : ListMode.SingleSelectLeft,
			includeItemInSelection : true,
			selectionChange : function(oEvent) {
				that.setProperty('sortDescending', oEvent.getParameter("listItem").data("item"), true);
			},
			ariaLabelledBy: this._ariaSortOrderInvisibleText
		});

		this._sortOrderList.addItem(new StandardListItem({
			title : this._rb.getText("VIEWSETTINGS_ASCENDING_ITEM")
		}).data("item", false).setSelected(true));
		this._sortOrderList.addItem(new StandardListItem({
			title : this._rb.getText("VIEWSETTINGS_DESCENDING_ITEM")
		}).data("item", true));

		// Aria - used to label the sort list
		this._ariaSortListInvisibleText = new InvisibleText(this.getId() + "-sortListLabel", {
			text: this._rb.getText("VIEWSETTINGS_TITLE_SORT").concat(":")
		});

		this._sortList.addAriaLabelledBy(this._ariaSortListInvisibleText);

		this._sortContent = [ this._ariaSortOrderInvisibleText, this._sortOrderList, this._ariaSortListInvisibleText, this._sortList ];
	};

	/**
	 * Create list item instance for each group item.
	 * @private
	 */
	ViewSettingsDialog.prototype._initGroupItems = function () {
		var oListItem,
			bHasSelections,
			aGroupItems = this.getGroupItems(),
			sTitleGroupObject = this._rb.getText("VIEWSETTINGS_GROUP_OBJECT");

		this._groupList.destroyItems();
		if (!!aGroupItems.length) {
			this._groupList.addItem(new GroupHeaderListItem({title: sTitleGroupObject}));
			aGroupItems.forEach(function (oItem) {
				oListItem = new StandardListItem({
					id: oItem.getId() + LIST_ITEM_SUFFIX,
					title: ManagedObject.escapeSettingsValue(oItem.getText()),
					type: ListType.Active,
					selected: oItem.getSelected(),
					tooltip : oItem.getTooltip()
				}).data("item", oItem);
				this._groupList.addItem(oListItem);
			}, this);

			if (!this._oGroupingNoneItem || this._oGroupingNoneItem.bIsDestroyed) {
				bHasSelections = !!this.getSelectedGroupItem();
				this._oGroupingNoneItem = new sap.m.ViewSettingsItem({
					text: this._rb.getText("VIEWSETTINGS_NONE_ITEM"),
					selected: !bHasSelections,
					/**
					 * Set properly selections. ViewSettingsItem-s are attached
					 * to that listener when addAggregation is executed
					 */
					itemPropertyChanged: function () {
						this._initGroupContent();
						this._initGroupItems();
					}.bind(this)
				});

				!bHasSelections && this.setAssociation("selectedGroupItem", this._oGroupingNoneItem, true);
			}

			// Append the None button to the list
			oListItem = new StandardListItem({
				id: this._oGroupingNoneItem.getId() + LIST_ITEM_SUFFIX,
				title: this._oGroupingNoneItem.getText(),
				type: ListType.Active,
				selected: this._oGroupingNoneItem.getSelected()
			}).data("item", this._oGroupingNoneItem);
			this._groupList.addItem(oListItem);
		}
	};

	/**
	 * Creates and initializes the group content controls.
	 * @private
	 */
	ViewSettingsDialog.prototype._initGroupContent = function() {
		var that = this,
			sTitleGroupBy = this._rb.getText("VIEWSETTINGS_GROUP_BY");

		if (this._groupContent) {
			return;
		}
		this._vContentPage = -1;

		// Aria - used to label the group order
		this._ariaGroupOrderInvisibleText = new InvisibleText(this.getId() + "-groupOrderLabel", {
			text: this._rb.getText("VIEWSETTINGS_GROUP_DIRECTION").concat(":")
		});

		this._groupOrderList = new List(this.getId() + "-grouporderlist", {
			mode : ListMode.SingleSelectLeft,
			includeItemInSelection : true,
			selectionChange : function(oEvent) {
				that.setProperty('groupDescending', oEvent.getParameter("listItem").data("item"), true);
			},
			ariaLabelledBy: this._ariaGroupOrderInvisibleText
		});

		this._groupOrderList.addItem(new GroupHeaderListItem({title: sTitleGroupBy}));
		this._groupOrderList.addItem(new StandardListItem({
			title : this._rb.getText("VIEWSETTINGS_ASCENDING_ITEM")
		}).data("item", false).setSelected(true));
		this._groupOrderList.addItem(new StandardListItem({
			title : this._rb.getText("VIEWSETTINGS_DESCENDING_ITEM")
		}).data("item", true));

		// Aria - used to label the group list
		this._ariaGroupListInvisibleText = new InvisibleText(this.getId() + "-groupListLabel", {
			text: this._rb.getText("VIEWSETTINGS_TITLE_GROUP").concat(":")
		});

		this._groupList = new List(this.getId() + "-grouplist",
			{
				mode : ListMode.SingleSelectLeft,
				includeItemInSelection : true,
				selectionChange: function (oEvent) {
					var item = oEvent.getParameter("listItem").data("item");
					that.setSelectedGroupItem(item);
				},
				ariaLabelledBy: this._ariaGroupListInvisibleText
			});

		this._groupContent = [ this._ariaGroupOrderInvisibleText, this._groupOrderList, this._ariaGroupListInvisibleText, this._groupList ];
	};

	/**
	 * Create list instance for each filter item.
	 * @private
	 */
	ViewSettingsDialog.prototype._initFilterItems = function() {
		var aPresetFilterItems,
			aFilterItems,
			oListItem,
			that = this,
			sTitleFilterBy = this._rb.getText("VIEWSETTINGS_FILTER_BY");

		this._presetFilterList.destroyItems();
		aPresetFilterItems = this.getPresetFilterItems();
		if (aPresetFilterItems.length) {
			aPresetFilterItems.forEach(function(oItem) {
				oListItem = new StandardListItem({
					id: oItem.getId() + LIST_ITEM_SUFFIX,
					title: ManagedObject.escapeSettingsValue(oItem.getText()),
					type: ListType.Active,
					selected: oItem.getSelected(),
					tooltip: oItem.getTooltip()
				}).data("item", oItem);
				this._presetFilterList.addItem(oListItem);
			}, this);
		}
		// add none item to preset filter list
		if (aPresetFilterItems.length) {
			oListItem = new StandardListItem({
				id: this._presetFilterList.getId() + "-none" + LIST_ITEM_SUFFIX,
				title : this._rb.getText("VIEWSETTINGS_NONE_ITEM"),
				selected : !!this.getSelectedPresetFilterItem()
			});
			this._presetFilterList.addItem(oListItem);
		}

		this._filterList.destroyItems();
		aFilterItems = this.getFilterItems();

		this._filterList.addItem(new GroupHeaderListItem({title: sTitleFilterBy}));

		if (aFilterItems.length) {
			aFilterItems.forEach(function(oItem) {
				oListItem = new StandardListItem(
					{
						id: oItem.getId() + LIST_ITEM_SUFFIX,
						title : ManagedObject.escapeSettingsValue(oItem.getText()),
						type : ListType.Active,
						tooltip : oItem.getTooltip(),
						press : (function(oItem) {
							return function(oEvent) {
								// navigate to details page
								if (that._navContainer.getCurrentPage() .getId() !== that.getId() + '-page2') {
									that._switchToPage(3, oItem);
									that._prevSelectedFilterItem = this;
									setTimeout(that._navContainer["to"].bind(that._navContainer, that.getId() + '-page2', "slide"), 0);
								}
								if (Device.system.desktop && that._filterDetailList && that._filterDetailList.getItems()[0]) {
									that._getNavContainer().attachEventOnce("afterNavigate", function() {
										that._filterDetailList.getItems()[0].focus();
									});
								}
							};
						}(oItem))
					}).data("item", oItem);
				this._filterList.addItem(oListItem);
			}, this);
		}
	};

	/**
	 * Creates and initializes the filter content controls.
	 * @private
	 */
	ViewSettingsDialog.prototype._initFilterContent = function() {
		var that = this;

		if (this._filterContent) {
			return;
		}
		this._vContentPage = -1;

		this._presetFilterList = new List(
			this.getId() + "-predefinedfilterlist",
			{
				mode : ListMode.SingleSelectLeft,
				includeItemInSelection : true,
				selectionChange : function(oEvent) {
					var item = oEvent.getParameter("listItem").data("item");
					if (item) {
						item.setProperty('selected', oEvent.getParameter("listItem").getSelected(), true);
					}
					that.setAssociation("selectedPresetFilterItem", item, true);
					that._clearSelectedFilters();
				}
			});

		this._filterList = new List(this.getId() + "-filterlist", {});

		this._filterContent = [ this._presetFilterList, this._filterList ];
	};

	/**
	 * Fills the dialog with the aggregation data.
	 * @param {string} [sPageId] The ID of the page to be opened in the dialog
	 * @private
	 */
	ViewSettingsDialog.prototype._initDialogContent = function(sPageId) {
		var bSort               = !!this.getSortItems().length,
			bGroup              = !!this.getGroupItems().length,
			bPredefinedFilter   = !!this.getPresetFilterItems().length,
			bFilter             = !!this.getFilterItems().length;

		// sort
		if (bSort) {
			this._initSortContent();
		}

		// group
		if (bGroup) {
			this._initGroupContent();
			this._initGroupItems();
		}

		// filters
		if (bPredefinedFilter || bFilter) {
			this._initFilterContent();
			this._initFilterItems();
		}

		// hide elements that are not visible and set the active content
		this._updateDialogState(sPageId);

		// select the items that are reflected in the control's properties
		this._updateListSelections();
	};

	/**
	 * Gets or creates the sap.m.Button which is used inside the SegmentedButton for representation of the custom tab.
	 * @private
	 * @param {Object} oCustomTab with options for the button
	 * @param {String} sButtonIdPrefix preffix for the button id
	 * @returns {sap.m.Button} The created button
	 */
	ViewSettingsDialog.prototype._getTabButton = function (oCustomTab, sButtonIdPrefix) {
		var sButtonId = sButtonIdPrefix + oCustomTab.getId(),
			oButton = sap.ui.getCore().byId(sButtonId);

		if (oButton) {
			return oButton;
		} else {
			return new sap.m.Button({
				id      : sButtonId,
				icon    : oCustomTab.getIcon(),
				tooltip : oCustomTab.getTooltip()
			});
		}
	};

	/**
	 * Sets the state of the dialog when it is opened.
	 * If content for only one tab is defined, then tabs are not displayed, otherwise,
	 * a SegmentedButton is displayed and the button for the initially displayed page is focused.
	 * @param {string} [sPageId] The ID of the page to be opened in the dialog
	 * @private
	 */
	ViewSettingsDialog.prototype._updateDialogState = function(sPageId) {
		var bSort                       = !!this.getSortItems().length,
			bGroup                      = !!this.getGroupItems().length,
			bPredefinedFilter           = !!this.getPresetFilterItems().length,
			bFilter                     = !!this.getFilterItems().length,
			bCustomTabs                 = !!this.getCustomTabs().length,
			oSegmentedButton            = this._getSegmentedButton(),
			sSelectedButtonId           = null,
			bIsPageIdOfPredefinedPage   = false,
			oDefaultPagesIds            = {
				"sort"          : 0,
				"group"         : 1,
				"filter"        : 2
			};

		// reset state
		oSegmentedButton.removeAllButtons();
		if (this._filterContent) {
			this._presetFilterList.setVisible(true);
			this._filterList.setVisible(true);
		}



		// add segmented button segments
		if (bSort) {
			oSegmentedButton.addButton(this._getSortButton());
		}
		if (bPredefinedFilter || bFilter) {
			oSegmentedButton.addButton(this._getFilterButton());
			if (!bPredefinedFilter) {
				this._presetFilterList.setVisible(false);
			}
			if (!bFilter) {
				this._filterList.setVisible(false);
			}
		}
		if (bGroup) {
			oSegmentedButton.addButton(this._getGroupButton());
		}
		if (bCustomTabs) {
			this.getCustomTabs().forEach(function (oCustomTab) {
				if (!this._isEmptyTab(oCustomTab)) {
					var sCustomTabButtonIdPrefix = this.getId() + this._sCustomTabsButtonsIdPrefix,
						oButton = this._getTabButton(oCustomTab, sCustomTabButtonIdPrefix);
					// add custom tab to segmented button
					oSegmentedButton.addButton(oButton);
				}
			}.bind(this));
		}

		// show header only when there are multiple tabs active
		this._showSubHeader = this._hasSubHeader();


		// make sure to reopen the a page if it was opened before but only if no specific page is requested
		if (sPageId === undefined && this._vContentPage !== -1) {
			sPageId = this._vContentPage;
			switch (sPageId) {
				case 0:
					sPageId = 'sort';
					break;
				case 1:
					sPageId = 'group';
					break;
				case 2:
					sPageId = 'filter';
					break;
			}
		}

		// CSN# 3802530/2013: if filters were modified by API we need to refresh the
		// filter detail page
		if (sPageId === this._vContentPage && this._vContentPage === 3) {
			this._vContentPage = -1;
			this._switchToPage(3, this._oContentItem);
		} else {
			// i.e. page id may be undefined or an invalid string, or the page might have no content
			sPageId = this._determineValidPageId(sPageId);

			// if the selected page id is of a predefined page - translate it to a numeric id for the switchToPage() method
			// and construct corresponding segmented button id
			for (var sPageName in oDefaultPagesIds) {
				if (sPageId === sPageName) {
					bIsPageIdOfPredefinedPage = true;
					sSelectedButtonId = this.getId() + '-' + sPageId + 'button';
					sPageId = oDefaultPagesIds[sPageName];
					break;
				}
			}

			if (!bIsPageIdOfPredefinedPage) {
				// construct segmented button id corresponding to custom tab
				sSelectedButtonId = this.getId() + this._sCustomTabsButtonsIdPrefix + sPageId;
			}

			this._getSegmentedButton().setSelectedButton(sSelectedButtonId);
			this._switchToPage(sPageId);

			/* 1580045867 2015: make sure navContainer's current page is always page1,
			because at this point we are always switching to sort,group,filter or custom tab.*/
			if (this._getNavContainer().getCurrentPage() !== this._getPage1()) {
				this._getNavContainer().to(this._getPage1().getId());
			}
		}
	};


	/**
	 * Determines the page ID of a valid page to load.
	 * @param {string} [sPageId] The ID of the page to be opened in the dialog
	 * @returns {string} sPageId
	 * @private
	 */
	ViewSettingsDialog.prototype._determineValidPageId = function (sPageId) {
		var sDefaultPageId      = 'sort',
			bHasMatch           = false,
			aValidPageIds       = [];

		// get a list of 'valid' page ids - meaning that each one exists and has content
		aValidPageIds       = this._fetchValidPagesIds();

		if (aValidPageIds.length) {
			// use the first valid page as default page id
			sDefaultPageId = aValidPageIds[0];
		} else {
			Log.warning('No available pages to load - missing items.');
		}

		// if no specific page id is wanted give a default one
		if (!sPageId) {
			sPageId = sDefaultPageId;
		} else {
			// if specific page id is wanted - make sure it exists in the valid pages array
			aValidPageIds.filter(function (sValidPageId) {
				if (sValidPageId === sPageId) {
					bHasMatch = true;
					return false;
				}
				return true;
			});
			if (!bHasMatch) {
				// if specific page is required but no such valid page exists, use the default page id
				sPageId = sDefaultPageId;
			}
		}

		return sPageId;
	};


	/**
	 * Fetches a list of valid pages IDs - each page must have valid content.
	 * @returns {Array} aValidPageIds List of valid page IDs
	 * @private
	 */
	ViewSettingsDialog.prototype._fetchValidPagesIds = function () {
		var i,
			aCustomTabs         = this.getCustomTabs(),
			aCustomTabsLength   = aCustomTabs.length,
			aValidPageIds       = [];

		/* make sure to push the predefined pages ids before the custom tabs as the order is important - if the control
		 *  has to determine which page to load it takes the first valid page id */

		/* check all predefined pages that could be opened and make sure they have content */
		var aPredefinedPageNames = ['sort', 'filter', 'group']; // order is important
		aPredefinedPageNames.forEach( function (sPageName) {
			if (this._isValidPredefinedPageId(sPageName)) {
				aValidPageIds.push(sPageName);
			}
		}, this);

		/* check all custom tabs and make sure they have content */
		for (i = 0; i < aCustomTabsLength; i++) {
			var oCustomTab = aCustomTabs[i];
			if (!this._isEmptyTab(oCustomTab)) {
				aValidPageIds.push(oCustomTab.getId());
			}
		}
		return aValidPageIds;
	};


	/**
	 * Checks whether a custom tab instance is not empty.
	 * @param {Object} oCustomTab The tab to be checked
	 * @returns {boolean} Whether the tab is empty
	 * @private
	 */
	ViewSettingsDialog.prototype._isEmptyTab = function (oCustomTab) {
		/*  if the tab has no content check if the content aggregation
		 is not currently transferred to the main page instance - if the last page content
		 corresponds to the tab id that must be the case */
		return !(oCustomTab.getContent().length || this._vContentPage === oCustomTab.getId() && this._getPage1().getContent().length);
	};

	/**
	 * Checks whether a given page name corresponds to a valid predefined page ID.
	 * The meaning of valid would be for the predefined page to also have content.
	 * @param {string} sName The page name
	 * @returns {boolean} whether the name is valid
	 * @private
	 */
	ViewSettingsDialog.prototype._isValidPredefinedPageId = function (sName) {
		if (!sName) {
			Log.warning('Missing mandatory parameter.');
			return false;
		}

		var bHasContents = false;
		// make sure the desired predefined page id has contents
		switch (sName) {
			case 'sort':
				bHasContents = !!this.getSortItems().length;
				break;
			case 'filter':
				bHasContents = !!this.getFilterItems().length || !!this.getPresetFilterItems().length;
				break;
			case 'group':
				bHasContents = !!this.getGroupItems().length;
				break;
		}
		return bHasContents;
	};


	ViewSettingsDialog.prototype._pressBackButton = function() {
		var that = this;
		if (this._vContentPage === 3) {
			this._updateFilterCounters();
			this._getNavContainer().attachEvent("afterNavigate", function(){
				if (that._prevSelectedFilterItem) {
					that._prevSelectedFilterItem.focus();
				}
			});
			setTimeout(this._getNavContainer()['back'].bind(this._getNavContainer()), 0);
			this._switchToPage(2);
			this._segmentedButton.setSelectedButton(this._filterButton);
		}
	};


	/**
	 * Overwrites the model setter to reset the remembered page in case it was a filter detail page, to make sure
	 * that the dialog is not trying to re-open a page for a removed item.
	 *
	 * @param {sap.ui.model.Model} oModel The model whose setter will be overwritten
	 * @param {string} sName The name of the model
	 * @returns {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.setModel = function (oModel, sName) {
		// BCP 1570030370
		if (this._vContentPage === 3 && this._oContentItem) {
			resetFilterPage.call(this);
		}
		return ManagedObject.prototype.setModel.call(this, oModel, sName);
	};

	/**
	 * Removes a filter Item and resets the remembered page if it was the filter detail page of the removed filter.
	 *
	 * @overwrite
	 * @public
	 * @param { int| sap.m.ViewSettingsFilterItem | string } vFilterItem The filter item's index, or the item itself, or its id
	 * @returns {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.removeFilterItem = function (vFilterItem) {
		var sFilterItemId = "";

		if (this._vContentPage === 3 && this._oContentItem) {
			if (typeof (vFilterItem) === "object") {
				sFilterItemId = vFilterItem.getId();
			} else if (typeof (vFilterItem) === "string") {
				sFilterItemId = vFilterItem;
			} else if (typeof (vFilterItem) === "number") {
				sFilterItemId = this.getFilterItems()[vFilterItem].getId();
			}

			if (this._oContentItem.getId() === sFilterItemId) {
				resetFilterPage.call(this);
			}
		}

		return this.removeAggregation('filterItems', vFilterItem);
	};

	/**
	 * Removes all filter Items and resets the remembered page if it was a filter detail page and all of its filter items are being removed.
	 *
	 * @overwrite
	 * @public
	 * @returns {sap.m.ViewSettingsDialog} this pointer for chaining
	 */
	ViewSettingsDialog.prototype.removeAllFilterItems = function () {
		if (this._vContentPage === 3 && this._oContentItem) {
			resetFilterPage.call(this);
		}
		return this.removeAllAggregation('filterItems');
	};

	/**
	 * Sets a callback that will check the ViewSettingsItem's text against the search query.
	 * If a callback is set, <code>filterSearchOperator</code> property will be ignored, as it serves the same purpose.
	 * @param {function} fnTest A function that accepts two parameters fnTest({string} query, {string} value) and returns boolean if the value satisfies the query.
	 * @returns {sap.m.ViewSettingsDialog} this instance for chaining
	 * @public
	 * @since 1.42
	 */
	ViewSettingsDialog.prototype.setFilterSearchCallback = function(fnTest) {
		this._fnFilterSearchCallback = fnTest;
		return this;
	};

	/**
	 * Switches to a dialog page (0 = sort, 1 = group, 2 = filter, 3 = subfilter and custom pages).
	 * @param {int|string} vWhich The page to be navigated to
	 * @param {sap.m.FilterItem} oItem The filter item for the detail page (optional, only used for page 3).
	 *
	 * @private
	 */
	ViewSettingsDialog.prototype._switchToPage = function(vWhich, oItem) {
		var i               = 0,
			oTitleLabel     = this._getTitleLabel(),
			oResetButton    = this._getResetButton(),
			oHeader         = this._getHeader(),
			oSubHeader      = this._getSubHeader();

		// nothing to do if we are already on the requested page (except for filter detail page)
		if (this._vContentPage === vWhich && vWhich !== 3) {

			// On switching to different pages, the content (Reset Button) of the header and sub-header is removed and added again
			// only if vWhich is not 3(filter detail page). So when opening the dialog and navigating to
			// filter detail page the Reset Button is only removed from page1. On clicking Ok and opening the dialog again vWhich is 2 and
			// is equal to this._vContentPage so we skip all the following logic that should add the reset button again.
			// Added logic for adding the Reset Button explicitly when we going into this state and there is no Reset Button.
			// BCP 0020079747 0000728077 2015
			if (oHeader.getContentRight().length === 0 && oSubHeader.getContentRight().length === 0) {
				this._addResetButtonToPage1();
			}

			return false;
		}
		//needed in order when we navigate through the pages to have correctly set box-shadows
		this._getPage2().getCustomHeader().removeStyleClass('sapMVSDBarWithSearch');

		// needed because the content aggregation is changing it's owner control from custom tab to page and vice-versa
		// if there is existing page content and the last opened page was a custom tab
		if (isLastPageContentCustomTab.call(this)) {
			restoreCustomTabContentAggregation.call(this);
		}

		// reset controls
		oHeader.removeAllContentRight();
		oSubHeader.removeAllContentRight();
		this._vContentPage = vWhich;
		this._oContentItem = oItem;


		// purge the current content & reset pages
		if (vWhich !== 3 /* filter detail */) {
			// purge page contents
			this._getPage1().removeAllAggregation("content", true);
			// set subheader when there are multiple tabs active
			this._addResetButtonToPage1();
		} else if (vWhich === 3) {
			this._getPage2().removeAllAggregation("content", true);
		}

		if (this.getTitle()) { // custom title
			oTitleLabel.setText(this.getTitle());
		} else { // default title
			oTitleLabel.setText(this._rb.getText("VIEWSETTINGS_TITLE"));
		}

		switch (vWhich) {
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
				this._setFilterDetailTitle(oItem);
				// fill detail page
				if (oItem instanceof sap.m.ViewSettingsCustomItem
					&& oItem.getCustomControl()) {
					this._clearPresetFilter();
					this._getPage2().addContent(oItem.getCustomControl());
				} else if (oItem instanceof sap.m.ViewSettingsFilterItem
					&& oItem.getItems()) {
					this._initFilterDetailItems(oItem);
				}
				break;
			case 0: // sorting
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
			default:
				// custom tabs
				oResetButton.setVisible(false);
				this._getPage1().removeAllAggregation("content", true);

				var sTitle = "VIEWSETTINGS_TITLE";
				var aCustomTabs = this.getCustomTabs();
				if (aCustomTabs.length < 2) {
					// use custom tab title only if there is a single custom tab
					sTitle = aCustomTabs[0].getTitle();
				}

				if (!this._getPage1().getSubHeader() && !this.getTitle()) {
					oTitleLabel.setText(sTitle);
				}
				aCustomTabs.forEach(function (oCustomTab) {
					if (oCustomTab.getId() === vWhich) {
						oCustomTab.getContent().forEach(function (oContent) {
							this._getPage1().addContent(oContent);
						}, this);
					}
				}, this);


				break;
		}

		// fire "filterDetailPageOpened" event if that is the case
		if (vWhich === 3) {
			this.fireFilterDetailPageOpened({parentFilterItem : oItem});
		}
	};

	/**
	 * Creates the Select All checkbox.
	 *
	 * @param {Array} aFilterSubItems The detail filter items
	 * @param oFilterDetailList The actual list created for the detail filter page
	 * @returns {sap.m.CheckBox} A checkbox instance
	 * @private
	 */
	ViewSettingsDialog.prototype._createSelectAllCheckbox = function(aFilterSubItems, oFilterDetailList) {
		var bAllSelected = false;

		if (aFilterSubItems && aFilterSubItems.length !== 0) {
			bAllSelected = aFilterSubItems.every(function (oItem) {
				return oItem.getSelected();
			});
		}

		var oSelectAllCheckBox = new CheckBox({
			text: this._rb.getText("COLUMNSPANEL_SELECT_ALL"),
			selected: bAllSelected,
			select: function(oEvent) {
				var bSelected = oEvent.getParameter('selected');
				//update the list items
				//and corresponding view settings items
				oFilterDetailList.getItems().filter(function(oItem) {
					return oItem.getVisible();
				}).forEach(function(oItem) {
					var oVSDItem = oItem.data("item");
					oVSDItem.setSelected(bSelected);
				});
			}
		});

		return oSelectAllCheckBox;
	};

	/**
	 * Updates the state of the select all checkbox after selecting a single item or after filtering items.
	 *
	 * @private
	 */
	ViewSettingsDialog.prototype._updateSelectAllCheckBoxState = function() {
		var bAllSelected = false,
			aItems = this._filterDetailList.getItems(),
			aItemsVisible = [];

		if (!this._selectAllCheckBox) {
			return;
		}

		if (aItems && aItems.length !== 0) {
			aItemsVisible = aItems.filter(function (oItem) {
				return oItem.getVisible();
			});
		}
		// if empty array, the 'every' call will return true
		if (aItemsVisible.length !== 0) {
			bAllSelected = aItemsVisible.every(function (oItem) {
				return oItem.getSelected();
			});
		}

		this._selectAllCheckBox.setSelected(bAllSelected);
	};

	/**
	 * Creates the filter items search field.
	 *
	 * @param {Array} oFilterDetailList The actual list created for the detail filter page
	 * @returns {sap.m.SearchField} A search field instance
	 * @private
	 */
	ViewSettingsDialog.prototype._getFilterSearchField = function(oFilterDetailList) {
		var that = this,
			oFilterSearchField = new SearchField({
				liveChange: function(oEvent) {
					var sQuery = oEvent.getParameter('newValue'),
						fnStringFilter = that._getStringFilter();

					oFilterDetailList.getItems().forEach(function (oItem) {
						var bTitleSatisfiesTheQuery = fnStringFilter(sQuery, oItem.getTitle());
						oItem.setVisible(bTitleSatisfiesTheQuery);
					});

					//update Select All checkbox
					that._updateSelectAllCheckBoxState();
				}
			});

		return oFilterSearchField;
	};

	/**
	 * Gets the function that will filter the ViewSettingsItem's text based on the search query.
	 * @returns {Function} A string filter function
	 * @private
	 */
	ViewSettingsDialog.prototype._getStringFilter = function() {
		if (this._fnFilterSearchCallback) {
			return this._fnFilterSearchCallback;
		}

		if (!this._oStringFilter || this._oStringFilter.sOperator !== this.getFilterSearchOperator()) {
			this._oStringFilter = new StringFilter(this.getFilterSearchOperator());
		}

		return this._oStringFilter.filter.bind(this._oStringFilter);
	};

	/**
	 * Updates the internal lists based on the dialogs state.
	 * @private
	 */
	ViewSettingsDialog.prototype._updateListSelections = function() {
		this._updateListSelection(this._sortList, sap.ui.getCore().byId(this.getSelectedSortItem()));
		this._updateListSelection(this._sortOrderList, this.getSortDescending());
		this._updateListSelection(this._groupList, sap.ui.getCore().byId(this.getSelectedGroupItem()));
		this._updateListSelection(this._groupOrderList, this.getGroupDescending());
		this._updateListSelection(this._presetFilterList, sap.ui.getCore().byId(this.getSelectedPresetFilterItem()));
		this._updateFilterCounters();
	};

	/**
	 * Sets selected item on single selection lists based on the item data.
	 * @private
	 */
	ViewSettingsDialog.prototype._updateListSelection = function(oList, oItem) {
		var items,
			i = 0,
			bGroupHeaderItem;

		if (!oList) {
			return false;
		}

		items = oList.getItems();

		oList.removeSelections();
		for (; i < items.length; i++) {
			bGroupHeaderItem = items[i].isA("sap.m.GroupHeaderListItem"); //group header items should not be selected
			if (!bGroupHeaderItem && (items[i].data("item") === oItem || items[i].data("item") === null)) { // null
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

	/**
	 * Updates the amount of selected filters in the filter list.
	 * @private
	 */
	ViewSettingsDialog.prototype._updateFilterCounters = function() {
		var aListItems = (this._filterList ? this._filterList.getItems() : []),
			oItem,
			aSubItems,
			iFilterCount = 0,
			i = 0,
			j;

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
					subItems[j].setProperty('selected', false, true);
				}
			}
			items[i].setProperty('selected', false, true);
		}

		// update counters if visible
		if (this._vContentPage === 2 && this._getDialog().isOpen()) {
			this._updateFilterCounters();
		}
	};

	/**
	 * Clears preset filter item.
	 * @private
	 */
	ViewSettingsDialog.prototype._clearPresetFilter = function() {
		if (this.getSelectedPresetFilterItem()) {
			this.setSelectedPresetFilterItem(null);
		}
	};


	/**
	 * Determines the number of pages (tabs).
	 * @private
	 * @return {int} iActivePages The number of pages in the dialog
	 */
	ViewSettingsDialog.prototype._calculateNumberOfPages = function () {
		var iActivePages        = 0,
			bSort               = !!this.getSortItems().length,
			bGroup              = !!this.getGroupItems().length,
			bPredefinedFilter   = !!this.getPresetFilterItems().length,
			bFilter             = !!this.getFilterItems().length;

		if (bSort) {
			iActivePages++;
		}
		if (bPredefinedFilter || bFilter) {
			iActivePages++;
		}
		if (bGroup) {
			iActivePages++;
		}

		this.getCustomTabs().forEach(function (oCustomTab) {
			if (!this._isEmptyTab(oCustomTab)) {
				iActivePages++;
			}
		}, this);

		return iActivePages;
	};

	/**
	 * Determines if a sub header should be displayed or not.
	 * @private
	 * @return {boolean} Whether a sub header should be displayed
	 */
	ViewSettingsDialog.prototype._hasSubHeader = function () {
		return !(this._calculateNumberOfPages() < 2);
	};

	/**
	 * Sets the current page to the filter page, clears info about the last opened page (content),
	 * and navigates to the filter page.
	 * @private
	 */
	function resetFilterPage() {
		this._vContentPage = 2;
		this._oContentItem = null;
		this._navContainer.to(this._getPage1().getId(), "show");
	}

	/**
	 * Gets an sap.m.ViewSettingsItem from a list of items by a given key.
	 *
	 * @param {array} aViewSettingsItems The list of sap.m.ViewSettingsItem objects to be searched
	 * @param {string} sKey The key of the searched item
	 * @returns {*} The sap.m.ViewSettingsItem found in the list of items
	 * @private
	 */
	function getViewSettingsItemByKey(aViewSettingsItems, sKey) {
		var i, oItem;

		// convenience, also allow strings
		// find item with this key
		for (i = 0; i < aViewSettingsItems.length; i++) {
			if (aViewSettingsItems[i].getKey() === sKey) {
				oItem = aViewSettingsItems[i];
				break;
			}
		}

		return oItem;
	}

	/**
	 * Finds an sap.m.ViewSettingsItem from a list of items by a given key.
	 * If it does not succeed logs an error.
	 *
	 * @param {sap.m.ViewSettingsItem|string} vItemOrKey The searched item or its key
	 * @param {array} aViewSettingsItems The list of sap.m.ViewSettingsItem objects to be searched
	 * @param {string} sErrorMessage The error message that will be logged if the item is not found
	 * @returns {*} The sap.m.ViewSettingsItem found in the list of items
	 * @private
	 */
	function findViewSettingsItemByKey(vItemOrKey, aViewSettingsItems, sErrorMessage) {
		var oItem;

		// convenience, also allow strings
		if (typeof vItemOrKey === "string") {
			// find item with this key
			oItem = getViewSettingsItemByKey(aViewSettingsItems, vItemOrKey);

			if (!oItem) {
				Log.error(sErrorMessage);
			}
		} else {
			oItem = vItemOrKey;
		}

		return oItem;
	}

	/**
	 * Checks if the item is an sap.m.ViewSettingsItem.
	 *
	 * @param {*} oItem The item to be validated
	 * @returns {*|boolean} Returns true if the item is an sap.m.ViewSettingsItem
	 * @private
	 */
	function validateViewSettingsItem(oItem) {
		return oItem && oItem instanceof sap.m.ViewSettingsItem;
	}

	/* =========================================================== */
	/* end: internal methods */
	/* =========================================================== */

	/* =========================================================== */
	/* begin: event handlers */
	/* =========================================================== */

	/**
	 * Internal event handler for the Confirm button.
	 * @param {Object} oEvent The fired event
	 * @private
	 */
	ViewSettingsDialog.prototype._onConfirm = function(oEvent) {
		var oDialog         = this._getDialog(),
			that            = this,
			fnAfterClose = function () {
				var oSettingsState, vGroupItem,
					sGroupItemId = that.getSelectedGroupItem();

				// BCP: 1670245110 "None" should be undefined
				if (!that._oGroupingNoneItem || sGroupItemId != that._oGroupingNoneItem.getId()) {
					vGroupItem = sap.ui.getCore().byId(sGroupItemId);
				}

				oSettingsState = {
					sortItem            : sap.ui.getCore().byId(that.getSelectedSortItem()),
					sortDescending      : that.getSortDescending(),
					groupItem           : vGroupItem,
					groupDescending     : that.getGroupDescending(),
					presetFilterItem    : sap.ui.getCore().byId(that.getSelectedPresetFilterItem()),
					filterItems         : that.getSelectedFilterItems(),
					filterKeys          : that.getSelectedFilterKeys(),
					filterCompoundKeys  : that.getSelectedFilterCompoundKeys(),
					filterString        : that.getSelectedFilterString()
				};

				// detach this function
				that._dialog.detachAfterClose(fnAfterClose);
				// fire confirm event
				that.fireConfirm(oSettingsState);
			};

		// attach the reset function to afterClose to hide the dialog changes from
		// the end user
		oDialog.attachAfterClose(fnAfterClose);
		oDialog.close();
	};

	/**
	 * Internal event handler for the Cancel button.
	 * @param {Object} oEvent The fired event
	 * @private
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
			that.setSelectedFilterCompoundKeys(that._oPreviousState.filterCompoundKeys);

			// navigate to old page if necessary
			if (that._navContainer.getCurrentPage() !== that._oPreviousState.navPage) {
				setTimeout(that._navContainer["to"].bind(that._navContainer, that._oPreviousState.navPage.getId(), "show"), 0);
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

	/**
	 * Internal event handler for the reset filter button.
	 * @private
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
		if (this._vContentPage === 3) { // go to filter overview page if necessary
			setTimeout(this._getNavContainer()['to'].bind(this._getNavContainer(), this._getPage1().getId()), 0);
			this._switchToPage(2);
			this._getSegmentedButton().setSelectedButton(this._getFilterButton());
		}
		// update preset list selection
		this._updateListSelection(this._presetFilterList, sap.ui.getCore().byId(
			this.getSelectedPresetFilterItem()));
	};

	/**
	 * Adds the Reset Button to the header/subheader of page1.
	 * @private
	 */
	ViewSettingsDialog.prototype._addResetButtonToPage1 = function() {
		var oHeader         = this._getHeader(),
			oSubHeader      = this._getSubHeader(),
			oResetButton    = this._getResetButton();

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
	};
	/* =========================================================== */
	/* end: event handlers */
	/* =========================================================== */

	/**
	 * Popup controls should not propagate contextual width
	 * @private
	 */
	ViewSettingsDialog.prototype._applyContextualSettings = function () {
		ManagedObject.prototype._applyContextualSettings.call(this, ManagedObject._defaultContextualSettings);
	};

	/**
	 * Handle the "content" aggregation of a custom tab, as the items in it might be transferred to the dialog page
	 * instance.
	 * @param {string} sAggregationName The string identifying the aggregation that the given object should be removed from
	 * @param {object} oCustomTab Custom tab instance
	 * @private
	 */
	function restoreCustomTabContentAggregation(sAggregationName, oCustomTab) {
		// Make sure page1 exists, as this method may be called on destroy(), after the page was destroyed
		// Suppress creation of new page as the following logic is needed only when a page already exists
		if (!this._getPage1(true)) {
			return;
		}

		// only the 'customTabs' aggregation is manipulated with shenanigans
		if (sAggregationName === 'customTabs' && oCustomTab) {
			/* oCustomTab must be an instance of the "customTab" aggregation type and must be the last opened page */
			if (oCustomTab.getMetadata().getName() === this.getMetadata().getManagedAggregation(sAggregationName).type &&
				this._vContentPage === oCustomTab.getId()) {
				/* the iContentPage property corresponds to the custom tab id - set the custom tab content aggregation
				 back to the custom tab instance */
				var oPage1Content = this._getPage1().getContent();
				oPage1Content.forEach(function (oContent) {
					oCustomTab.addAggregation('content', oContent, true);
				});
			}
		} else if (!sAggregationName && !oCustomTab) {
			/* when these parameters are missing, cycle through all custom tabs and detect if any needs manipulation */
			var oPage1Content = this._getPage1().getContent();
			/* the vContentPage property corresponds to a custom tab id - set the  custom tab content aggregation back
			 to the corresponding custom tab instance, so it can be reused later */
			this.getCustomTabs().forEach(function (oCustomTab) {
				if (this._vContentPage === oCustomTab.getId()) {
					oPage1Content.forEach(function (oContent) {
						oCustomTab.addAggregation('content', oContent, true);
					});
				}
			}, this);
		}

	}

	/**
	 * Determine if the last opened page has custom tab contents
	 * @private
	 * @returns {boolean} Whether the last opened page has custom tab contents
	 */
	function isLastPageContentCustomTab() {
		// ToDo: make this into enumeration
		var aPageIds = [
			-1, // not set
			0,  // sort
			1,  // group
			2,  // filter
			3   // filter detail
		];
		return (this._getPage1().getContent().length && aPageIds.indexOf(this._vContentPage) === -1);
	}

	/**
	 * Forward the busy state setting to the internal dialog instance.
	 * Needed because of the not-bullet proof implementation of setBusy in sap.ui.core.Control
	 * @public
	 * @param {boolean} bBusy The busy state flag
	 * @return {sap.m.ViewSettingsDialog} this Instance for chaining
	 */
	ViewSettingsDialog.prototype.setBusy = function (bBusy) {
		this._getDialog().setBusy(bBusy);
		return this;
	};

	/**
	 * String filter helper class.
	 * @param {string} sOperator sap.m.StringFilterOperator value. Default is sap.m.StringFilterOperator.StartsWith.
	 * @constructor
	 * @private
	 */
	var StringFilter = function(sOperator) {
		this.sOperator = sOperator || StringFilterOperator.StartsWith;

		switch (this.sOperator) {
			case StringFilterOperator.Equals:
				this.fnOperator = fnEquals;
				break;
			case StringFilterOperator.Contains:
				this.fnOperator = fnContains;
				break;
			case StringFilterOperator.StartsWith:
				this.fnOperator = fnStartsWith;
				break;
			case StringFilterOperator.AnyWordStartsWith:
				this.fnOperator = fnAnyWordStartsWith;
				break;
			default:
				//warning when operator has been given but it doesn't match a value from sap.m.StringFilterOperator enum
				Log.warning("Unknown string compare operator. Use values from sap.m.StringFilterOperator. Default operator should be used.");
				this.fnOperator = fnContains;
				break;
		}
	};

	/**
	 * Tests if a string satisfies the query string.
	 * @param {string} sQuery The string to which will be compared
	 * @param {string} sValue The tested string
	 * @returns {boolean} true if the string satisfies the query string
	 * @private
	 */
	StringFilter.prototype.filter = function (sQuery, sValue) {
		if (!sQuery) {
			return true;
		}

		if (!sValue) {
			return false;
		}

		sValue = sValue.toLowerCase();
		sQuery = sQuery.toLowerCase();

		return this.fnOperator(sQuery, sValue);
	};

	function fnEquals(sQuery, sValue) {
		return sValue === sQuery;
	}

	function fnContains(sQuery, sValue) {
		return sValue.indexOf(sQuery) > -1;
	}

	function fnStartsWith(sQuery, sValue) {
		return sValue.indexOf(sQuery) === 0;
	}

	function fnAnyWordStartsWith(sQuery, sValue) {
		var rAnyWordStartsWith = new RegExp(".*\\b" + sQuery + ".*");
		return rAnyWordStartsWith.test(sValue);
	}

	return ViewSettingsDialog;

});