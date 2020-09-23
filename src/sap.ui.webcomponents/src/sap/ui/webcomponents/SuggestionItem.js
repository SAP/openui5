/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.SuggestionItem.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"sap/ui/core/library",
	"./thirdparty/ui5-wc-bundles/SuggestionItem"
], function(WebComponent, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>SuggestionItem</code>.
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
	 * @alias sap.ui.webcomponents.SuggestionItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SuggestionItem = WebComponent.extend("sap.ui.webcomponents.SuggestionItem", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-suggestion-item",
			properties: {
				text: {
					type: "string"
				},

				valueState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None
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
				},

				group: {
					type: "boolean"
				}
			}
		}
	});

	return SuggestionItem;
});
