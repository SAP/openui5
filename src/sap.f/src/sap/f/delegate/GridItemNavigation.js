/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/events/KeyCodes"
], function (
	ItemNavigation,
	KeyCodes
) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.f.delegate.GridItemNavigation</code>.
	 *
	 * @param {object} [mSettings] Initial settings
	 *
	 * @class
	 * ...
	 *
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.core.delegate.ItemNavigation
	 *
	 * @private
	 * @constructor
	 * @alias sap.f.delegate.GridItemNavigation
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridItemNavigation = ItemNavigation.extend("sap.f.delegate.GridItemNavigation", /** @lends sap.f.GridItemNavigation.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

			},
			events: {

			}
		}
	});

	/**
	 * Handles the onsapnext event
	 * Sets the focus to the next item
	 *
	 * @param {jQuery.Event} oEvent the browser event
	 * @private
	 */
	GridItemNavigation.prototype.onsapnext = function(oEvent) {

		ItemNavigation.prototype.onsapnext.call(this, oEvent);

		// switch (oEvent.keyCode) {
		// 	case KeyCodes.ARROW_DOWN:
		// 		break;
		// 	case KeyCodes.ARROW_RIGHT:
		// 		break;
		// }
	};

	/**
	 * Handles the onsapprevious event
	 * Sets the focus to the previous item
	 *
	 * @param {jQuery.Event} oEvent the browser event
	 * @private
	 */
	GridItemNavigation.prototype.onsapprevious = function(oEvent) {

		ItemNavigation.prototype.onsapprevious.call(this, oEvent);

		// switch (oEvent.keyCode) {
		// 	case KeyCodes.ARROW_UP:
		// 		break;
		// 	case KeyCodes.ARROW_LEFT:
		// 		break;
		// }
	};

	return GridItemNavigation;
});
