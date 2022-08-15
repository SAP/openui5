/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.SuggestionItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/library",
	"./thirdparty/SuggestionItem"
], function(WebComponent, library, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var ListItemType = library.ListItemType;

	/**
	 * Constructor for a new <code>SuggestionItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * The <code>sap.ui.webc.main.SuggestionItem</code> represents the suggestion item of the <code>sap.ui.webc.main.Input</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.SuggestionItem
	 * @implements sap.ui.webc.main.IInputSuggestionItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SuggestionItem = WebComponent.extend("sap.ui.webc.main.SuggestionItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-suggestion-item-ui5",
			interfaces: [
				"sap.ui.webc.main.IInputSuggestionItem"
			],
			properties: {

				/**
				 * Defines the <code>additionalText</code>, displayed in the end of the item.
				 */
				additionalText: {
					type: "string"
				},

				/**
				 * Defines the state of the <code>additionalText</code>. <br>
				 * <br>
				 * Available options are: <code>"None"</code> (by default), <code>"Success"</code>, <code>"Information"</code>, <code>"Warning"</code> and <code>"Erorr"</code>.
				 */
				additionalTextState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None
				},

				/**
				 * Defines the description displayed right under the item text, if such is present.
				 */
				description: {
					type: "string"
				},

				/**
				 * Defines the <code>icon</code> source URI. <br>
				 * <br>
				 * <b>Note:</b> SAP-icons font provides numerous built-in icons. To find all the available icons, see the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "string"
				},

				/**
				 * Defines whether the <code>icon</code> should be displayed in the beginning of the item or in the end. <br>
				 * <br>
				 * <b>Note:</b> If <code>image</code> is set, the <code>icon</code> would be displayed after the <code>image</code>.
				 */
				iconEnd: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the <code>image</code> source URI. <br>
				 * <br>
				 * <b>Note:</b> The <code>image</code> would be displayed in the beginning of the item.
				 */
				image: {
					type: "string"
				},

				/**
				 * Defines the text of the component.
				 */
				text: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the visual indication and behavior of the item. Available options are <code>Active</code> (by default), <code>Inactive</code> and <code>Detail</code>. <br>
				 * <br>
				 * <b>Note:</b> When set to <code>Active</code>, the item will provide visual response upon press and hover, while when <code>Inactive</code> or <code>Detail</code> - will not.
				 */
				type: {
					type: "sap.ui.webc.main.ListItemType",
					defaultValue: ListItemType.Active
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return SuggestionItem;
});