/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ComboBoxItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/ComboBoxItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ComboBoxItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * The <code>sap.ui.webc.main.ComboBoxItem</code> represents the item for a <code>sap.ui.webc.main.ComboBox</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ComboBoxItem
	 * @implements sap.ui.webc.main.IComboBoxItem
	 */
	var ComboBoxItem = WebComponent.extend("sap.ui.webc.main.ComboBoxItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-cb-item-ui5",
			interfaces: [
				"sap.ui.webc.main.IComboBoxItem"
			],
			properties: {

				/**
				 * Defines the additional text of the component.
				 */
				additionalText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the text of the component.
				 */
				text: {
					type: "string",
					defaultValue: ""
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ComboBoxItem;
});