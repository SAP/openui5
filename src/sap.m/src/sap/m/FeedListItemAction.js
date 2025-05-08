/*!
 * ${copyright}
 */

sap.ui.define(["./ListItemActionBase"],
	function(ListItemActionBase) {
	"use strict";

	/**
	 * Constructor for a new FeedListItemAction.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class An action item of FeedListItem
	 *
	 * @extends sap.m.ListItemActionBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.FeedListItemAction
	 * @since 1.52.0
	 */
	var FeedListItemAction = ListItemActionBase.extend("sap.m.FeedListItemAction", /** @lends sap.m.FeedListItemAction.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * The key of the item.
				 */
				key: { type: "string", group: "Misc", defaultValue: "" },
				/**
				 * Enables or disables a button on the UI. All buttons are enabled by default.
				 * Disabled buttons are colored differently as per the theme of the UI.
				 */
				enabled: { type: "boolean", group: "Appearance", defaultValue: true }
			},
			events: {
				/**
				 * The <code>press</code> event is fired when the user triggers the corresponding action.
				 */
				press: {}
			}
		}
	});

	return FeedListItemAction;
});
