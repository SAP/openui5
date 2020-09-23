/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.StandardListItem.
sap.ui.define([
	"./ListItem",
	"sap/ui/core/library",
	"./thirdparty/ui5-wc-bundles/StandardListItem"
], function(ListItem, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>StandardListItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.StandardListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var StandardListItem = ListItem.extend("sap.ui.webcomponents.StandardListItem", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-li",
			properties: {

				text : {
					type : "string",
					group : "Appearance",
					mapping: "textContent"
				},

				description: {
					type: "string"
				},

				icon: {
					type: "string"
				},

				iconEnd: {
					type: "boolean"
				},

				image: {
					type: "string"
				},

				info: {
					type: "string"
				},

				infoState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None,
				}
			}
		}
	});

	return StandardListItem;
});
