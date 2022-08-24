/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.MultiComboBoxItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/MultiComboBoxItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>MultiComboBoxItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * The <code>sap.ui.webc.main.MultiComboBoxItem</code> represents the item for a <code>sap.ui.webc.main.MultiComboBox</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.MultiComboBoxItem
	 * @implements sap.ui.webc.main.IMultiComboBoxItem
	 */
	var MultiComboBoxItem = WebComponent.extend("sap.ui.webc.main.MultiComboBoxItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-mcb-item-ui5",
			interfaces: [
				"sap.ui.webc.main.IMultiComboBoxItem"
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
				 * Defines the selected state of the component.
				 */
				selected: {
					type: "boolean",
					defaultValue: false
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

	return MultiComboBoxItem;
});