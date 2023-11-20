/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.ToolbarSelectOption.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"./thirdparty/ToolbarSelectOption"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ToolbarSelectOption</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.ToolbarSelectOption</code> component defines the content of an option in the <code>sap.ui.webc.main.ToolbarSelect</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.120.0
	 * @experimental Since 1.120.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.ToolbarSelectOption
	 * @implements sap.ui.webc.main.IToolbarSelectOption
	 */
	var ToolbarSelectOption = WebComponent.extend("sap.ui.webc.main.ToolbarSelectOption", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-toolbar-select-option-ui5",
			interfaces: [
				"sap.ui.webc.main.IToolbarSelectOption"
			],
			properties: {

				/**
				 * Defines the selected state of the component.
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the content of the control
				 */
				text: {
					type: "string",
					defaultValue: "",
					mapping: "textContent"
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return ToolbarSelectOption;
});
