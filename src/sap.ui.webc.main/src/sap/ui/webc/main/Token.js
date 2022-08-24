/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Token.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Token"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>Token</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * Tokens are small items of information (similar to tags) that mainly serve to visualize previously selected items.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Token
	 * @implements sap.ui.webc.main.IToken
	 */
	var Token = WebComponent.extend("sap.ui.webc.main.Token", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-token-ui5",
			interfaces: [
				"sap.ui.webc.main.IToken"
			],
			properties: {

				/**
				 * Defines whether the component is read-only. <br>
				 * <br>
				 * <b>Note:</b> A read-only component can not be deleted or selected, but still provides visual feedback upon user interaction.
				 */
				readonly: {
					type: "boolean"
				},

				/**
				 * Defines whether the component is selected or not.
				 */
				selected: {
					type: "boolean"
				},

				/**
				 * Defines the text of the token.
				 */
				text: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {

				/**
				 * Defines the close icon for the token. If nothing is provided to this slot, the default close icon will be used. Accepts <code>sap.ui.webc.main.Icon</code>.
				 */
				closeIcon: {
					type: "sap.ui.webc.main.IIcon",
					multiple: false,
					slot: "closeIcon"
				}
			},
			events: {

				/**
				 * Fired when the the component is selected by user interaction with mouse or by clicking space.
				 */
				select: {
					parameters: {}
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Token;
});