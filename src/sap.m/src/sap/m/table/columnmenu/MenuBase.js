/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control"
], function (
	Control
) {
	"use strict";

	/**
	 * Constructor for a new <code>MenuBase</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class This control serves as base class for column menus. It implements the {@link sap.m.table.IColumnHeaderMenu} interface.
	 * @abstract
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.126
	 *
	 * @alias sap.m.table.columnmenu.MenuBase
	 */
	var MenuBase = Control.extend("sap.m.table.columnmenu.MenuBase", {

		metadata: {
			library: "sap.m",
			interfaces: ["sap.ui.core.IColumnHeaderMenu"],
			events: {
				/**
				 * Fired before the column menu is opened.
				 */
				beforeOpen: {
					allowPreventDefault : true,
					parameters : {
						/**
						 * The element for which the menu is opened. If it is an <code>HTMLElement</code>, the nearest {@link sap.ui.core.Element}
						 * that wraps the given DOM element is passed for this event (if it exists).
						 */
						openBy : {type : "sap.ui.core.Element"}
					}
				},
				/**
				 * Fired after the column menu has been closed.
				 */
				afterClose: {
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	/**
	 * Opens the popover at the specified target.
	 *
	 * @param {sap.ui.core.Element | HTMLElement} oAnchor This is the control or HTMLElement where the popover is placed
	 * @public
	 * @abstract
	 */
	MenuBase.prototype.openBy = function(oAnchor) {
		throw new Error("This method should be implemented in one of the inherited classes.");
	};

	/**
	 * Returns the <code>sap.ui.core.aria.HasPopup</code> type of the menu.
	 *
	 * @returns {sap.ui.core.aria.HasPopup} <code>sap.ui.core.aria.HasPopup</code> type of the menu
	 * @public
	 */
	MenuBase.prototype.getAriaHasPopupType = function () {
		return "Menu";
	};

	/**
	 * Determines whether the menu is open.
	 *
	 * @returns {boolean} Whether the menu is open
	 * @public
	 * @abstract
	 */
	MenuBase.prototype.isOpen = function () {
		throw new Error("This method should be implemented in one of the inherited classes.");
	};

	/**
	 * Closes the menu.
	 *
	 * @public
	 * @abstract
	 */
	MenuBase.prototype.close = function () {
		throw new Error("This method should be implemented in one of the inherited classes.");
	};

	return MenuBase;
});