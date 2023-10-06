/*!
 * ${copyright}
 */

// Provides control sap.t.SideNavigation.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	"sap/ui/core/theming/Parameters",
	'sap/ui/core/Icon',
	"./SideNavigationRenderer"
],
	function(
		library,
		Control,
		Parameters,
		Icon,
		SideNavigationRenderer
	) {
		'use strict';

		/**
		 * Constructor for a new SideNavigation.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The SideNavigation control is a container, which consists of flexible and fixed parts on top of each other.
		 * <h4>Responsive Behavior</h4>
		 * <ul>
		 * <li>The flexible part adapts its size to the fixed one.</li>
		 * <li>The flexible part has a scrollbar when the content is larger than the available space.</li>
		 * </ul>
		 *<b>Note:</b> In order for the SideNavigation to stretch properly, its parent layout control should only be the sap.tnt.ToolPage.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.tnt.SideNavigation
		 */
		var SideNavigation = Control.extend('sap.tnt.SideNavigation', /** @lends sap.t.SideNavigation.prototype */ {
			metadata: {
				library: 'sap.tnt',
				properties: {
					/**
					 * Specifies the width of the control.
					 *
					 * <Note:> Depending on the theme, there is a minimum width set (16rem for Horizon theme).
					 * This property can be used to set a bigger width.
					 * @since 1.120
					 */
					width: {type: "sap.ui.core.CSSSize", group: "Dimension"},
					/**
					 * Specifies if the control is expanded.
					 */
					expanded: {type: 'boolean', group: 'Misc', defaultValue: true},
					/**
					 * Specifies the currently selected key.
					 *
					 * @since 1.62.0
					 */
					selectedKey: {type: "string", group: "Data"},
					/**
					 * Specifies an optional aria-label that can be used by the screen readers.
					 * @since 1.98
					 */
					ariaLabel: {type : "string", group : "Accessibility", defaultValue : null}
				},
				defaultAggregation: "item",
				aggregations: {
					/**
					 * Defines the content inside the flexible part.
					 */
					item: {type: 'sap.tnt.NavigationList', multiple: false, bindable: "bindable"},
					/**
					 * Defines the content inside the fixed part.
					 */
					fixedItem: {type: 'sap.tnt.NavigationList', multiple: false},
					/**
					 * Defines the content inside the footer.
					 */
					footer: {type: 'sap.tnt.NavigationList', multiple: false}
				},
				associations: {
					/**
					 * The selected <code>NavigationListItem</code>.
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
							item: {type: 'sap.ui.core.Item'}
						}
					}
				}
			},

			renderer: SideNavigationRenderer
		});

		SideNavigation.prototype.init = function () {
			// Define group for F6 handling
			this.data('sap-ui-fastnavgroup', 'true', true);
		};

		SideNavigation.prototype.setAggregation = function (aggregationName, object) {
			if (object && object.attachItemSelect) {
				object.attachItemSelect(this._itemSelectionHandler.bind(this));
			}

			return Control.prototype.setAggregation.apply(this, arguments);
		};

		/**
		 * Sets if the control is in expanded or collapsed mode.
		 *
		 * @public
		 * @param {boolean} isExpanded Indication if the SideNavigation is expanded.
		 * @returns {this} this SideNavigation reference for chaining.
		 */
		SideNavigation.prototype.setExpanded = function (isExpanded) {
			if (this.getExpanded() === isExpanded) {
				return this;
			}

			var that = this,
				itemAggregation = that.getAggregation('item'),
				fixedItemAggregation = that.getAggregation('fixedItem');

			this.setProperty('expanded', isExpanded);

			if (itemAggregation) {
				itemAggregation.setExpanded(isExpanded);
			}

			if (fixedItemAggregation) {
				fixedItemAggregation.setExpanded(isExpanded);
			}

			return this;
		};

		/**
		 * @private
		 */
		SideNavigation.prototype.onBeforeRendering = function () {
			var selectedItem = this.getSelectedItem(),
				selectedKey = this.getSelectedKey();

			if (selectedKey) {
				this.setSelectedKey(selectedKey);
			} else if (selectedItem) {
				this.setSelectedItem(selectedItem);
			}
		};

		/**
		 * Sets the selected item based on a key.
		 * @public
		 * @param {string} selectedKey The key of the item to be selected
		 * @return {this} this pointer for chaining
		 */
		SideNavigation.prototype.setSelectedKey = function (selectedKey) {

			var selectedItem,
				navigationList = this.getItem(),
				fixedNavigationList = this.getFixedItem();

			if (selectedKey && navigationList) {
				selectedItem = navigationList._findItemByKey(selectedKey);

				if (!selectedItem && fixedNavigationList) {
					selectedItem = fixedNavigationList._findItemByKey(selectedKey);
				}
			}

			if (selectedItem) {
				this.setSelectedItem(selectedItem);
			}

			this.setProperty('selectedKey', selectedKey, true);

			return this;
		};

		/**
		 * Sets the association for selectedItem
		 * @public
		 * @param {string|sap.tnt.NavigationListItem} selectedItem The control to be set as selected
		 * @return {sap.tnt.SideNavigation|null} The <code>selectedItem</code> association
		 */
		SideNavigation.prototype.setSelectedItem = function (selectedItem) {
			var navigationList = this.getAggregation('item');
			var fixedNavigationList = this.getAggregation('fixedItem');
			var listItemToSelect;
			var selectedKey;

			if (!selectedItem) {
				if (navigationList) {
					navigationList.setSelectedItem(null);
				}
				if (fixedNavigationList) {
					fixedNavigationList.setSelectedItem(null);
				}
			}

			if (typeof selectedItem === 'string') {
				listItemToSelect = sap.ui.getCore().byId(selectedItem);
			} else {
				listItemToSelect = selectedItem;
			}

			selectedKey = listItemToSelect ? listItemToSelect._getUniqueKey() : '';
			this.setProperty('selectedKey', selectedKey, true);

			var selectedInFlexibleList = listItemToSelect && listItemToSelect.getNavigationList && listItemToSelect.getNavigationList() === navigationList;
			var selectedInFixedList = listItemToSelect && listItemToSelect.getNavigationList && listItemToSelect.getNavigationList() === fixedNavigationList;

			if (selectedInFlexibleList) {
				navigationList.setSelectedItem(listItemToSelect);
				if (fixedNavigationList) {
					fixedNavigationList.setSelectedKey(null);
				}
			}

			if (selectedInFixedList) {
				fixedNavigationList.setSelectedItem(listItemToSelect);
				if (navigationList) {
					navigationList.setSelectedKey(null);
				}
			}

			return Control.prototype.setAssociation.call(this, 'selectedItem', listItemToSelect, true);
		};

		/**
		 * @private
		 */
		SideNavigation.prototype.exit = function () {
			this._mThemeParams = null;
		};

		/**
		 *
		 * @param event
		 * @private
		 */
		SideNavigation.prototype._itemSelectionHandler = function (event) {
			var item = event.getParameter('item');
			this.setSelectedItem(item);

			this.fireItemSelect({
				item: item
			});
		};

		return SideNavigation;
	}
);