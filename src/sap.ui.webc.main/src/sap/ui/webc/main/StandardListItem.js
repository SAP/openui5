/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.StandardListItem.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
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
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * The <code>sap.ui.webc.main.StandardListItem</code> represents the simplest type of item for a <code>sap.ui.webc.main.List</code>.
	 *
	 * This is a list item, providing the most common use cases such as <code>text</code>, <code>image</code> and <code>icon</code>.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.StandardListItem</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>title - Used to style the title of the list item</li>
	 *     <li>description - Used to style the description of the list item</li>
	 *     <li>additional-text - Used to style the additionalText of the list item</li>
	 *     <li>icon - Used to style the icon of the list item</li>
	 *     <li>native-li - Used to style the main li tag of the list item</li>
	 *     <li>content - Used to style the content area of the list item</li>
	 *     <li>detail-button - Used to style the button rendered when the list item is of type detail</li>
	 *     <li>delete-button - Used to style the button rendered when the list item is in delete mode</li>
	 *     <li>radio - Used to style the radio button rendered when the list item is in single selection mode</li>
	 *     <li>checkbox - Used to style the checkbox rendered when the list item is in multiple selection mode</li>
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
				 * An object of strings that defines several additional accessibility attribute values for customization depending on the use case.
				 *
				 * It supports the following fields:
				 *
				 *
				 * <ul>
				 *     <li><code>ariaSetsize</code>: Defines the number of items in the current set of listitems or treeitems when not all items in the set are present in the DOM. The value of each <code>aria-setsize</code> is an integer reflecting number of items in the complete set. <b>Note: </b> If the size of the entire set is unknown, set <code>aria-setsize="-1"</code>. </li>
				 *     <li><code>ariaPosinset</code>: Defines an element's number or position in the current set of listitems or treeitems when not all items are present in the DOM. The value of each <code>aria-posinset</code> is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known. </li>
				 * </ul>
				 */
				accessibilityAttributes: {
					type: "object",
					defaultValue: {}
				},

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
				 * Available options are: <code>"None"</code> (by default), <code>"Success"</code>, <code>"Warning"</code>, <code>"Information"</code> and <code>"Error"</code>.
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
				 * The navigated state of the list item. If set to <code>true</code>, a navigation indicator is displayed at the end of the list item.
				 */
				navigated: {
					type: "boolean"
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
				 * Defines the visual indication and behavior of the list items. Available options are <code>Active</code> (by default), <code>Inactive</code>, <code>Detail</code> and <code>Navigation</code>. <br>
				 * <br>
				 * <b>Note:</b> When set to <code>Active</code> or <code>Navigation</code>, the item will provide visual response upon press and hover, while with type <code>Inactive</code> and <code>Detail</code> - will not.
				 */
				type: {
					type: "sap.ui.webc.main.ListItemType",
					defaultValue: ListItemType.Active
				}
			},
			aggregations: {

				/**
				 * Defines the delete button, displayed in "Delete" mode. <b>Note:</b> While the slot allows custom buttons, to match design guidelines, please use the <code>sap.ui.webc.main.Button</code> component. <b>Note:</b> When the slot is not present, a built-in delete button will be displayed.
				 */
				deleteButton: {
					type: "sap.ui.webc.main.IButton",
					multiple: false,
					slot: "deleteButton"
				},

				/**
				 * <b>Note:</b> While the slot allows option for setting custom avatar, to match the design guidelines, please use the <code>sap.ui.webc.main.Avatar</code> with it`s default size - S. <b>Note:</b> If bigger <code>sap.ui.webc.main.Avatar</code> needs to be used, then the size of the <code>sap.ui.webc.main.StandardListItem</code> should be customized in order to fit.
				 */
				imageContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "imageContent"
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
