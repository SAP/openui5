/*!
 * ${copyright}
 */

// Provides control sap.tnt.NavigationList
sap.ui.define([
    'jquery.sap.global',
    './library',
    'sap/ui/core/Control',
    'sap/m/Popover',
    'sap/ui/core/delegate/ItemNavigation',
    'sap/ui/core/InvisibleText',
    "./NavigationListRenderer"
],
	function(
	    jQuery,
		library,
		Control,
		Popover,
		ItemNavigation,
		InvisibleText,
		NavigationListRenderer
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
					expanded: {type: "boolean", group: "Misc", defaultValue: true}
				},
				defaultAggregation: "items",
				aggregations: {

					/**
					 * The items displayed in the list.
					 */
					items: {type: "sap.tnt.NavigationListItem", multiple: true, singularName: "item"}
				},
				associations : {
					/**
					 * Association to controls / IDs, which describe this control (see WAI-ARIA attribute aria-describedby).
					 */
					ariaDescribedBy : { type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy" },

					/**
					 * Association to controls / IDs, which label this control (see WAI-ARIA attribute aria-labelledby).
					 */
					ariaLabelledBy : { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" },

					/**
					 * The currently selected <code>NavigationListItem</code>.
					 *
					 * @since 1.52.0
					 */
					selectedItem : { type: "sap.tnt.NavigationListItem", multiple: false }
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
				sapnext : ["alt", "meta"],
				sapprevious : ["alt", "meta"]
			});

			this._resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");

			if (sap.ui.getCore().getConfiguration().getAccessibility() && !NavigationList._sAriaPopupLabelId) {
				NavigationList._sAriaPopupLabelId = new InvisibleText({
					text: '' // add empty string in order to prevent the redundant speech output
				}).toStatic().getId();
			}
		};

		/**
		 * Called after the control is rendered.
		 */
		NavigationList.prototype.onAfterRendering = function() {
			this._itemNavigation.setRootDomRef(this.getDomRef());
			this._itemNavigation.setItemDomRefs(this._getDomRefs());

			if (this._selectedItem) {
				this._selectedItem._select();
			}
		};

		NavigationList.prototype._updateNavItems = function() {
			this._itemNavigation.setItemDomRefs(this._getDomRefs());
		};

		/**
		 * Gets DOM references of the navigation items.
		 * @private
		 */
		NavigationList.prototype._getDomRefs = function() {
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

				this._arrowOffset = 18;
				this._offsets = ["0 -18", "18 0", "0 18", "-18 0"];

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

			if (this._selectedItem) {
				this._selectedItem._unselect();
			}

			item._select();

			this._selectedItem = item;
			this.setAssociation('selectedItem', item, true);
		};

		/**
		 * Gets the currently selected <code>NavigationListItem</code>.
		 * @public
		 * @return {sap.tnt.NavigationListItem|null} The selected item or null if nothing is selected
		 */
		NavigationList.prototype.getSelectedItem = function() {
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
		 * @param {boolean} suppressInvalidate If true, the managed object's invalidate method is not called
		 * @return {sap.tnt.NavigationList|null} The <code>selectedItem</code> association
		 */
		NavigationList.prototype.setSelectedItem = function(selectedItem, suppressInvalidate) {
			jQuery.sap.require('sap.tnt.NavigationListItem');
			var navigationListItem;

			if (this._selectedItem) {
				this._selectedItem._unselect();
			}

			if (!selectedItem) {
				this._selectedItem = null;
				return sap.ui.core.Control.prototype.setAssociation.call(this, 'selectedItem', selectedItem, suppressInvalidate);
			}

			if (typeof selectedItem !== 'string' && !(selectedItem instanceof sap.tnt.NavigationListItem)) {
				jQuery.sap.log.warning('Type of selectedItem association should be string or instance of sap.tnt.NavigationListItem. New value was not set.');
				return this;
			}

			if (typeof selectedItem === 'string') {
				navigationListItem = sap.ui.getCore().byId(selectedItem);
			} else {
				navigationListItem = selectedItem;
			}

			if (navigationListItem instanceof sap.tnt.NavigationListItem) {
				navigationListItem._select();
				this._selectedItem = navigationListItem;
				return sap.ui.core.Control.prototype.setAssociation.call(this, 'selectedItem', selectedItem, suppressInvalidate);
			} else {
				jQuery.sap.log.warning('Type of selectedItem association should be a valid NavigationListItem object or ID. New value was not set.');
				return this;
			}
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

	}, /* bExport= */ true);
