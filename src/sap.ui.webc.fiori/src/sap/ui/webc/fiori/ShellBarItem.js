/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.fiori.ShellBarItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ShellBarItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ShellBarItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 *
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.ShellBarItem
	 * @implements sap.ui.webc.fiori.IShellBarItem
	 */
	var ShellBarItem = WebComponent.extend("sap.ui.webc.fiori.ShellBarItem", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-shellbar-item-ui5",
			interfaces: [
				"sap.ui.webc.fiori.IShellBarItem"
			],
			properties: {

				/**
				 * Defines the count displayed in the top-right corner.
				 */
				count: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the name of the item's icon.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the item text.
				 */
				text: {
					type: "string",
					defaultValue: ""
				}
			},
			events: {

				/**
				 * Fired, when the item is pressed.
				 */
				click: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * DOM ref of the clicked element
						 */
						targetRef: {
							type: "HTMLElement"
						}
					}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ShellBarItem;
});