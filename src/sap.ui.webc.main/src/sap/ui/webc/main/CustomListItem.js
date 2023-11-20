/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.CustomListItem.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"./thirdparty/CustomListItem"
], function(WebComponent, library) {
	"use strict";

	var ListItemType = library.ListItemType;

	/**
	 * Constructor for a new <code>CustomListItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * A component to be used as custom list item within the <code>sap.ui.webc.main.List</code> the same way as the standard <code>sap.ui.webc.main.StandardListItem</code>.
	 *
	 * The component accepts arbitrary HTML content to allow full customization.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.CustomListItem</code> exposes the following CSS Shadow Parts:
	 * <ul>
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
	 * @alias sap.ui.webc.main.CustomListItem
	 * @implements sap.ui.webc.main.IListItem
	 */
	var CustomListItem = WebComponent.extend("sap.ui.webc.main.CustomListItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-li-custom-ui5",
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
				 * Defines the visual indication and behavior of the list items. Available options are <code>Active</code> (by default), <code>Inactive</code>, <code>Detail</code> and <code>Navigation</code>. <br>
				 * <br>
				 * <b>Note:</b> When set to <code>Active</code> or <code>Navigation</code>, the item will provide visual response upon press and hover, while with type <code>Inactive</code> and <code>Detail</code> - will not.
				 */
				type: {
					type: "sap.ui.webc.main.ListItemType",
					defaultValue: ListItemType.Active
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the content of the component.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Defines the delete button, displayed in "Delete" mode. <b>Note:</b> While the slot allows custom buttons, to match design guidelines, please use the <code>sap.ui.webc.main.Button</code> component. <b>Note:</b> When the slot is not present, a built-in delete button will be displayed.
				 */
				deleteButton: {
					type: "sap.ui.webc.main.IButton",
					multiple: false,
					slot: "deleteButton"
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
			designtime: "sap/ui/webc/main/designtime/CustomListItem.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return CustomListItem;
});
