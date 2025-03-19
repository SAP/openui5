/*!
 * ${copyright}
 */
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"./SideNavigationRenderer"
], function (
	library,
	Control,
	Element,
	SideNavigationRenderer
) {
	"use strict";

	// shortcut for SideNavigationDesign in sap.tnt library
	const SideNavigationDesign = library.SideNavigationDesign;

	/**
	 * Constructor for a new <code>SideNavigation</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>SideNavigation</code> control is a container, which consists of flexible and fixed parts on top of each other.
	 * <h4>Responsive Behavior</h4>
	 * <ul>
	 * <li>The flexible part adapts its size to the fixed one.</li>
	 * <li>The flexible part has a scrollbar when the content is larger than the available space.</li>
	 * </ul>
	 * <b>Note:</b> In order for the <code>SideNavigation</code> to stretch properly, its parent layout control should only be the <code>sap.tnt.ToolPage</code>.
	 * <b>Note:</b> If used outside the intended parent layout <code>sap.tnt.ToolPage</code>, for example inside a <code>sap.m.ResponsivePopover</code> to achieve a Side Navigation Overlay Mode, the application developer should set the <code>design</code> property to <code>Plain</code>.
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
	const SideNavigation = Control.extend("sap.tnt.SideNavigation", /** @lends sap.tnt.SideNavigation.prototype */ {
		metadata: {
			library: "sap.tnt",
			properties: {
				/**
				 * Specifies the width of the control.
				 *
				 * <Note:> Depending on the theme, there is a minimum width set (16rem for Horizon theme).
				 * This property can be used to set a bigger width.
				 * @since 1.120
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Dimension" },
				/**
				 * Specifies if the control is expanded.
				 */
				expanded: { type: "boolean", group: "Misc", defaultValue: true },
				/**
				 * Specifies the currently selected key.
				 *
				 * @since 1.62.0
				 */
				selectedKey: { type: "string", group: "Data" },
				/**
				 * Specifies an optional <code>aria-label</code> that can be used by the screen readers.
				 * @since 1.98
				 */
				ariaLabel: { type: "string", group: "Accessibility", defaultValue: null },
				/**
				 * Specifies whether the control should have own container styling, such as a box-shadow and border, or not.
				 * <b>Note:</b> This property has to be set to <code>Plain</code> when the control is used inside a <code>sap.m.ResponsivePopover</code> to achieve a Side Navigation Overlay Mode.
				 * @since 1.134
				 * @experimental Since 1.134
				 */
				design: { type: "sap.tnt.SideNavigationDesign", group: "Appearance", defaultValue: SideNavigationDesign.Decorated }
			},
			defaultAggregation: "item",
			aggregations: {
				/**
				 * Defines the content inside the flexible part.
				 */
				item: { type: "sap.tnt.NavigationList", multiple: false, bindable: "bindable" },

				/**
				 * Defines the content inside the fixed part.
				 */
				fixedItem: { type: "sap.tnt.NavigationList", multiple: false }
			},
			associations: {
				/**
				 * The selected <code>NavigationListItem</code>.
				 *
				 * @since 1.52.0
				 */
				selectedItem: { type: "sap.tnt.NavigationListItem", multiple: false }
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
						item: { type: "sap.ui.core.Item" }
					}
				},
				/**
				 * Fired when an item is pressed.
				 */
				itemPress: {
					parameters: {
						/**
						 * The pressed item.
						 */
						item: { type: "sap.ui.core.Item" }
					}
				}
			}
		},

		renderer: SideNavigationRenderer
	});

	SideNavigation.prototype.setAggregation = function (aggregationName, oObject) {
		if (oObject && oObject.attachItemSelect) {
			oObject.attachItemSelect(this._itemSelectionHandler.bind(this));
		}

		if (oObject && oObject.attachItemPress) {
			oObject.attachItemPress(this._itemPressHandler.bind(this));
		}

		return Control.prototype.setAggregation.apply(this, arguments);
	};

	/**
	 * Sets if the control is in expanded or collapsed mode.
	 *
	 * @public
	 * @param {boolean} bExpanded Indication if the SideNavigation is expanded.
	 * @returns {this} this SideNavigation reference for chaining.
	 */
	SideNavigation.prototype.setExpanded = function (bExpanded) {
		if (this.getExpanded() === bExpanded) {
			return this;
		}

		this.setProperty("expanded", bExpanded);
		// set to validated property
		bExpanded = this.getExpanded();

		const oFlexibleList = this.getItem(),
			oFixedList = this.getFixedItem();

		if (oFlexibleList) {
			oFlexibleList.setExpanded(bExpanded);
		}

		if (oFixedList) {
			oFixedList.setExpanded(bExpanded);
		}

		return this;
	};

	/**
	 * @private
	 */
	SideNavigation.prototype.onBeforeRendering = function () {
		const oSelectedItem = this.getSelectedItem(),
			sSelectedKey = this.getSelectedKey(),
			oFlexibleList = this.getItem(),
			oFixedList = this.getFixedItem(),
			bExpanded = this.getExpanded();

		if (sSelectedKey) {
			this.setSelectedKey(sSelectedKey);
		} else if (oSelectedItem) {
			this.setSelectedItem(oSelectedItem);
		}

		if (!bExpanded && oFlexibleList) {
			oFlexibleList.setExpanded(false);
		}

		if (!bExpanded && oFixedList) {
			oFixedList.setExpanded(false);
		}
	};

	/**
	 * Sets the selected item based on a key.
	 * @public
	 * @param {string} sSelectedKey The key of the item to be selected
	 * @return {this} this pointer for chaining
	 */
	SideNavigation.prototype.setSelectedKey = function (sSelectedKey) {
		const oFlexibleList = this.getItem(),
			oFixedList = this.getFixedItem();

		let oFoundItem;
		if (sSelectedKey && oFlexibleList) {
			oFoundItem = oFlexibleList._findItemByKey(sSelectedKey);

			if (!oFoundItem && oFixedList) {
				oFoundItem = oFixedList._findItemByKey(sSelectedKey);
			}
		}

		if (oFoundItem) {
			this.setSelectedItem(oFoundItem);
		}

		this.setProperty("selectedKey", sSelectedKey, true);

		return this;
	};

	/**
	 * Sets the association for <code>selectedItem</code>.
	 * @public
	 * @param {sap.ui.core.ID|sap.tnt.NavigationListItem} vSelectedItem The control to be set as selected
	 * @return {sap.tnt.SideNavigation|null} The <code>selectedItem</code> association
	 */
	SideNavigation.prototype.setSelectedItem = function (vSelectedItem) {
		const oFlexibleList = this.getItem(),
			oFixedList = this.getFixedItem();

		if (!vSelectedItem) {
			oFlexibleList?.setSelectedItem(null);
			oFixedList?.setSelectedItem(null);
		}

		let oListItemToSelect;
		if (typeof vSelectedItem == "string") {
			oListItemToSelect = Element.getElementById(vSelectedItem);
		} else {
			oListItemToSelect = vSelectedItem;
		}

		const sSelectedKey = oListItemToSelect ? oListItemToSelect._getUniqueKey() : "";
		this.setProperty("selectedKey", sSelectedKey, true);

		const bSelectedInFlexibleList = oListItemToSelect?.getNavigationList && oListItemToSelect.getNavigationList() === oFlexibleList,
			bSelectedInFixedList = oListItemToSelect?.getNavigationList && oListItemToSelect.getNavigationList() === oFixedList;

		if (bSelectedInFlexibleList) {
			oFlexibleList.setSelectedItem(oListItemToSelect);
			oFixedList?.setSelectedKey(null);
		}

		if (bSelectedInFixedList) {
			oFixedList.setSelectedItem(oListItemToSelect);
			oFlexibleList?.setSelectedKey(null);
		}

		return this.setAssociation("selectedItem", oListItemToSelect, true);
	};

	/**
	 * Propagates the select event from each <code>sap.tnt.NavigationList</code> upwards.
	 * @param {sap.ui.base.Event} oEvent select event
	 * @private
	 */
	SideNavigation.prototype._itemSelectionHandler = function (oEvent) {
		const oItem = oEvent.getParameter("item");
		this.setSelectedItem(oItem);

		this.fireItemSelect({
			item: oItem
		});
	};

	SideNavigation.prototype._itemPressHandler = function (oEvent) {
		const oItem = oEvent.getParameter("item");

		this.fireItemPress({
			item: oItem
		});
	};

	return SideNavigation;
});