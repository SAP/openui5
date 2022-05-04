/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.StandardListItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/library",
	"./thirdparty/StandardListItem"
], function(WebComponent, library, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var ListItemType = library.ListItemType;

	/**
	 * Constructor for a new <code>StandardListItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * The <code>sap.ui.webc.main.StandardListItem</code> represents the simplest type of item for a <code>sap.ui.webc.main.List</code>.
	 *
	 * This is a list item, providing the most common use cases such as <code>text</code>, <code>image</code> and <code>icon</code>.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.StandardListItem</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>title - Used to style the title of the list item</li>
	 *     <li>description - Used to style the description of the list item</li>
	 *     <li>additional-text - Used to style the additionalText of the list item</li>
	 *     <li>icon - Used to style the icon of the list item</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.StandardListItem
	 * @implements sap.ui.webc.main.IListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var StandardListItem = WebComponent.extend("sap.ui.webc.main.StandardListItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-li-ui5",
			interfaces: [
				"sap.ui.webc.main.IListItem"
			],
			properties: {

				/**
				 * Defines the text alternative of the component. Note: If not provided a default text alternative will be set, if present.
				 */
				accessibleName: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the <code>additionalText</code>, displayed in the end of the list item.
				 */
				additionalText: {
					type: "string"
				},

				/**
				 * Defines the state of the <code>additionalText</code>. <br>
				 * Available options are: <code>"None"</code> (by default), <code>"Success"</code>, <code>"Warning"</code>, <code>"Information"</code> and <code>"Erorr"</code>.
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
				 * <b>Note:</b> SAP-icons font provides numerous built-in icons. To find all the available icons, see the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
				 */
				icon: {
					type: "string"
				},

				/**
				 * Defines whether the <code>icon</code> should be displayed in the beginning of the list item or in the end. <br>
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
				 * <b>Note:</b> The <code>image</code> would be displayed in the beginning of the list item.
				 */
				image: {
					type: "string"
				},

				/**
				 * Defines the selected state of the <code>ListItem</code>.
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
				},

				/**
				 * Defines the visual indication and behavior of the list items. Available options are <code>Active</code> (by default), <code>Inactive</code> and <code>Detail</code>. <br>
				 * <br>
				 * <b>Note:</b> When set to <code>Active</code>, the item will provide visual response upon press and hover, while with type <code>Inactive</code> and <code>Detail</code> - will not.
				 */
				type: {
					type: "sap.ui.webc.main.ListItemType",
					defaultValue: ListItemType.Active
				}
			},
			events: {

				/**
				 * Fired when the user clicks on the detail button when type is <code>Detail</code>.
				 */
				detailClick: {
					parameters: {}
				}
			},
			designtime: "sap/ui/webc/main/designtime/StandardListItem.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return StandardListItem;
});