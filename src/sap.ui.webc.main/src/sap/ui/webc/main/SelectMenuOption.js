/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.SelectMenuOption.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"./thirdparty/SelectMenuOption"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>SelectMenuOption</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The code>ui5-select-menu-option</code> component represents an option in the <code>sap.ui.webc.main.SelectMenu</code>.
	 *
	 * <h3>Usage</h3>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.120.0
	 * @experimental Since 1.120.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.SelectMenuOption
	 * @implements sap.ui.webc.main.ISelectMenuOption
	 */
	var SelectMenuOption = WebComponent.extend("sap.ui.webc.main.SelectMenuOption", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-select-menu-option-ui5",
			interfaces: [
				"sap.ui.webc.main.ISelectMenuOption"
			],
			properties: {

				/**
				 * Defines the text, displayed inside the <code>sap.ui.webc.main.Select</code> input filed when the option gets selected.
				 */
				displayText: {
					type: "string"
				},

				/**
				 * Defines the value of the <code>sap.ui.webc.main.Select</code> inside an HTML Form element when this component is selected. For more information on HTML Form support, see the <code>name</code> property of <code>sap.ui.webc.main.Select</code>.
				 */
				value: {
					type: "string"
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the content of the component. <br>
				 * <br>
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return SelectMenuOption;
});
