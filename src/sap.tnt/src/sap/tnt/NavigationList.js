/*!
 * ${copyright}
 */

// Provides control sap.tnt.NavigationList
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'sap/ui/core/Element',
	'sap/ui/core/Control',
	'sap/m/Popover',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/core/InvisibleText',
	"./NavigationListRenderer",
	"sap/base/Log"
],
	function(
		jQuery,
		library,
		Element,
		Control,
		Popover,
		ItemNavigation,
		InvisibleText,
		NavigationListRenderer,
		Log
	) {
		"use strict";

		/**
		 * Constructor for a new NavigationList.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The NavigationList control is an interactive control, which provides a choice of
		 * different items, ordered as a list.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.tnt.NavigationList
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var NavigationList = Control.extend("sap.tnt.NavigationList", /** @lends sap.tnt.NavigationList.prototype */ {
			metadata: {
				library: "sap.tnt",
				properties: {
					/**
					 * Specifies the width of the control.
					 */
					width: {type: "sap.ui.core.CSSSize", group: "Dimension"},
					/**
					 * Specifies if the control is in expanded or collapsed mode.
					 */
					expanded: {type: "boolean", group: "Misc", defaultValue: true},
					/**
					 * Specifies the currently selected key.
					 *
					 * @since 1.62.0
					 */
					selectedKey: {type: "string", group: "Data"}
				},
				defaultAggregation: "items",
				aggregations: {

					/**
					 * The items displayed in the list.
					 */
					items: {type: "sap.tnt.NavigationListItem", multiple: true, singularName: "item"}
				},
				associations: {
					/**
					 * Association to controls / IDs, which describe this control (see WAI-ARIA attribute aria-describedby).
					 */
					ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

					/**
					 * Association to controls / IDs, which label this control (see WAI-ARIA attribute aria-labelledby).
					 */
					ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"},

					/**
					 * The currently selected <code>NavigationListItem</code>.
					 *
					 * @since 1.52.0
					 */
					selectedItem: {type: "sap.tnt.NavigationListItem", multiple: false}
				},
				events: {
					/**
					 * Fired when an item is selected.
					 */
					itemSelect: {
						parameters: {
							/**
							 * The selected item.
							 */
							item: {type: "sap.ui.core.Item"}
						}
					}
				}
			}
		});

		/**
		 * Initializes the control.
		 * @private
		 * @override
		 */
		NavigationList.prototype.init = function () {
			this._itemNavigation = new ItemNavigation();
			this._itemNavigation.setCycling(false);
			this.addEventDelegate(this._itemNavigation);

			this._itemNavigation.setPageSize(10);
			this._itemNavigation.setDisabledModifiers({
				sapnext: ["alt", "meta"],
				sapprevious: ["alt", "meta"]
			});

			if (sap.ui.getCore().getConfiguration().getAccessibility() && !NavigationList._sAriaPopupLabelId) {
				NavigationList._sAriaPopupLabelId = new InvisibleText({
					text: '' // add empty string in order to prevent the redundant speech output
				}).toStatic().getId();
			}
		};

		/**
		 * Called before the control is rendered.
		 */
		NavigationList.prototype.onBeforeRendering = function () {

			// make sure the initial selected item (if any) is correct
			var selectedKey = this.getSelectedKey();
			this.setSelectedKey(selectedKey);
		};

		/**
		 * Called after the control is rendered.
		 */
		NavigationList.prototype.onAfterRendering = function () {
			this._itemNavigation.setRootDomRef(this.getDomRef());
			this._itemNavigation.setItemDomRefs(this._getDomRefs());
		};

		NavigationList.prototype._updateNavItems = function () {
			this._itemNavigation.setItemDomRefs(this._getDomRefs());
		};

		/**
		 * Gets DOM references of the navigation items.
		 * @private
		 */
		NavigationList.prototype._getDomRefs = function () {
			var domRefs = [];

			var items = this.getItems();

			for (var i = 0; i < items.length; i++) {
				jQuery.merge(domRefs, items[i]._getDomRefs());
			}

			return domRefs;
		};

		/**
		 * Adapts popover position.
		 * @private
		 */
		NavigationList.prototype._adaptPopoverPositionParams = function () {
			if (this.getShowArrow()) {
				this._marginLeft = 10;
				this._marginRight = 10;
				this._marginBottom = 10;

				this._arrowOffset = 8;
				this._offsets = ["0 -8", "8 0", "0 8", "-8 0"];

				this._myPositions = ["center bottom", "begin top", "center top", "end top"];
				this._atPositions = ["center top", "end top", "center bottom", "begin top"];
			} else {
				this._marginTop = 0;
				this._marginLeft = 0;
				this._marginRight = 0;
				this._marginBottom = 0;

				this._arrowOffset = 0;
				this._offsets = ["0 0", "0 0", "0 0", "0 0"];

				this._myPositions = ["begin bottom", "begin top", "begin top", "end top"];
				this._atPositions = ["begin top", "end top", "begin bottom", "begin top"];
			}
		};

		/**
		 * Clears the control dependencies.
		 * @private
		 */
		NavigationList.prototype.exit = function () {
			if (this._itemNavigation) {
				this._itemNavigation.destroy();
			}
		};

		/**
		 * Selects an item.
		 * @private
		 */
		NavigationList.prototype._selectItem = function (params) {
			this.fireItemSelect(params);

			var item = params.item;
			this.setSelectedItem(item, true);
		};

		NavigationList.prototype._findItemByKey = function (selectedKey) {
			var groupItems = this.getItems(),
				groupItem,
				items,
				item,
				i,
				j;

			for (i = 0; i < groupItems.length; i++) {
				groupItem = groupItems[i];
				if (groupItem._getUniqueKey() === selectedKey) {
					return groupItem;
				}

				items = groupItem.getItems();

				for (j = 0; j < items.length; j++) {
					item = items[j];
					if (item._getUniqueKey() === selectedKey) {
						return item;
					}
				}
			}

			return null;
		};

		/**
		 * Sets the selected item based on a key.
		 * @public
		 * @param {string} selectedKey The key of the item to be selected
		 * @return {sap.tnt.NavigationList} this pointer for chaining
		 */
		NavigationList.prototype.setSelectedKey = function (selectedKey) {

			var item = this._findItemByKey(selectedKey);
			this.setSelectedItem(item, true);

			this.setProperty('selectedKey', selectedKey, true);

			return this;
		};

		/**
		 * Gets the currently selected <code>NavigationListItem</code>.
		 * @public
		 * @return {sap.tnt.NavigationListItem|null} The selected item or null if nothing is selected
		 */
		NavigationList.prototype.getSelectedItem = function () {
			var selectedItem = this.getAssociation('selectedItem');

			if (!selectedItem) {
				return null;
			}

			return sap.ui.getCore().byId(selectedItem);
		};

		/**
		 * Sets the association for selectedItem. Set <code>null</code> to deselect.
		 * @public
		 * @param {string|sap.tnt.NavigationListItem} selectedItem The control to be set as selected
		 * @return {sap.tnt.NavigationList|null} The <code>selectedItem</code> association
		 */
		NavigationList.prototype.setSelectedItem = function (selectedItem) {
			var navigationListItem,
				selectedKey,
				isNavigationListItem;

			if (this._selectedItem) {
				this._selectedItem._unselect();
			}

			if (!selectedItem) {
				this._selectedItem = null;
			}

			isNavigationListItem = selectedItem instanceof Element && selectedItem.isA("sap.tnt.NavigationListItem");

			if (typeof selectedItem !== 'string' && !isNavigationListItem) {
				Log.warning('Type of selectedItem association should be string or instance of sap.tnt.NavigationListItem. New value was not set.');
				this.setAssociation('selectedItem', null, true);
				return this;
			}

			this.setAssociation('selectedItem', selectedItem, true);

			if (typeof selectedItem === 'string') {
				navigationListItem = sap.ui.getCore().byId(selectedItem);
			} else {
				navigationListItem = selectedItem;
			}

			selectedKey = navigationListItem ? navigationListItem._getUniqueKey() : '';
			this.setProperty('selectedKey', selectedKey, true);

			if (navigationListItem) {
				navigationListItem._select();
				this._selectedItem = navigationListItem;
				return this;
			}

			Log.warning('Type of selectedItem association should be a valid NavigationListItem object or ID. New value was not set.');
			return this;
		};

		/**
		 * Opens a popover.
		 * @private
		 */
		NavigationList.prototype._openPopover = function (source, list) {

			var that = this;
			var selectedItem = list.getSelectedItem();
			if (selectedItem && list.isGroupSelected) {
				selectedItem = null;
			}

			var popover = this._popover = new Popover({
				showHeader: false,
				horizontalScrolling: false,
				verticalScrolling: true,
				initialFocus: selectedItem,
				afterClose: function () {
					if (that._popover) {
						that._popover.destroy();
						that._popover = null;
					}
				},
				content: list,
				ariaLabelledBy: [NavigationList._sAriaPopupLabelId]
			}).addStyleClass('sapContrast sapContrastPlus');

			popover._adaptPositionParams = this._adaptPopoverPositionParams;

			popover.openBy(source);
		};

		NavigationList.prototype._closePopover = function () {
			if (this._popover) {
				this._popover.close();
			}
		};

		return NavigationList;

	});