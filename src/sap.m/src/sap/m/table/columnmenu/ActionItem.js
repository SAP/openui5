/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/table/columnmenu/ItemBase"
], function(
	ItemBase
) {
	"use strict";

	/**
	 * Constructor for a new <code>ActionItem</code>.
	 *
	 * @param {string} [sId] ID for the new <code>ActionItem</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>ActionItem</code>
	 *
	 * @class
	 * The <code>ActionItem</code> class is used for action items for the <code>sap.m.table.columnmenu.Menu</code>.
	 * It can be used to specify control- and application-specific items that should solely serve as actions.
	 *
	 * @extends sap.m.table.columnmenu.ItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 *
	 * @alias sap.m.table.columnmenu.ActionItem
	 */
	var ActionItem = ItemBase.extend("sap.m.table.columnmenu.ActionItem", {

		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines the label that is used for the action item.
				 */
				label: {type: "string"},
				/**
				 * Defines the icon for the action item.
				 */
				icon: {type: "sap.ui.core.URI"}
			},
			events: {
				/**
				 * This event is fired when the action item is pressed.
				 * The default behavior can be prevented by the application, in which case the menu will not close.
				 */
				press: {
					allowPreventDefault : true
				}
			}
		}
	});

	/**
	 * @override
	 */
	ActionItem.prototype.onPress = function (oEvent) {
		oEvent.preventDefault();
		if (this.firePress()) {
			this.getMenu().close();
		}
	};

	ActionItem.prototype.getContent = function () {
		return null;
	};

	return ActionItem;
});