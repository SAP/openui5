/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/Element"], function(Element) {
	"use strict";

	/**
	 * Constructor for a new action for list items.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new action
	 *
	 * @class
	 * The <code>sap.m.ListItemActionBase</code> class serves as a foundation for list item actions.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @abstract
	 * @alias sap.m.ListItemActionBase
	 * @since 1.137
	 */
	var ListItemActionBase = Element.extend("sap.m.ListItemActionBase", /** @lends sap.m.ListItemActionBase.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines the icon of the action.
				 */
				icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue: "" },

				/**
				 * Defines the text of the action.
				 */
				text : {type : "string", group : "Appearance", defaultValue : ""},

				/**
				 * Defines the visibility of the action.
				 */
				visible: { type: "boolean", group: "Appearance", defaultValue: true }
			}
		}
	});

	return ListItemActionBase;
});
