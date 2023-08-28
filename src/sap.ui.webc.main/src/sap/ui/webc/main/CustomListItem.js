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
