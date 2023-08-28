/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.TreeItem.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"sap/ui/core/library",
	"./thirdparty/TreeItem"
], function(WebComponent, library, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var ListItemType = library.ListItemType;

	/**
	 * Constructor for a new <code>TreeItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.TreeItem</code> represents a node in a tree structure, shown as a <code>sap.ui.webc.main.List</code>. <br>
	 * This is the item to use inside a <code>sap.ui.webc.main.Tree</code>. You can represent an arbitrary tree structure by recursively nesting tree items.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.TreeItem</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>title - Used to style the title of the tree list item</li>
	 *     <li>additionalText - Used to style the additionalText of the tree list item</li>
	 *     <li>icon - Used to style the icon of the tree list item</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.TreeItem
	 * @implements sap.ui.webc.main.ITreeItem
	 */
	var TreeItem = WebComponent.extend("sap.ui.webc.main.TreeItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-tree-item-ui5",
			interfaces: [
				"sap.ui.webc.main.ITreeItem"
			],
			properties: {

				/**
				 * Defines the accessible name of the component.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * Defines the <code>additionalText</code>, displayed in the end of the tree item.
				 */
				additionalText: {
					type: "string",
					defaultValue: ""
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
				 * Defines whether the tree list item will show a collapse or expand icon inside its toggle button.
				 */
				expanded: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the tree node has children, even if currently no other tree nodes are slotted inside. <br>
				 * <i>Note:</i> This property is useful for showing big tree structures where not all nodes are initially loaded due to performance reasons. Set this to <code>true</code> for nodes you intend to load lazily, when the user clicks the expand button. It is not necessary to set this property otherwise. If a tree item has children, the expand button will be displayed anyway.
				 */
				hasChildren: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * If set, an icon will be displayed before the text of the tree list item.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the selection of a tree node is displayed as partially selected. <br>
				 * <br>
				 * <b>Note:</b> The indeterminate state can be set only programmatically and can’t be achieved by user interaction, meaning that the resulting visual state depends on the values of the <code>indeterminate</code> and <code>selected</code> properties:
				 * <ul>
				 *     <li> If a tree node has both <code>selected</code> and <code>indeterminate</code> set to <code>true</code>, it is displayed as partially selected.
				 *     <li> If a tree node has <code>selected</code> set to <code>true</code> and <code>indeterminate</code> set to <code>false</code>, it is displayed as selected.
				 *     <li> If a tree node has <code>selected</code> set to <code>false</code>, it is displayed as not selected regardless of the value of the <code>indeterminate</code> property.
				 * </ul> <br>
				 * <b>Note:</b> This property takes effect only when the <code>sap.ui.webc.main.Tree</code> is in <code>MultiSelect</code> mode.
				 */
				indeterminate: {
					type: "boolean",
					defaultValue: false
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
				 * Defines the text of the tree item.
				 */
				text: {
					type: "string",
					defaultValue: ""
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
			defaultAggregation: "items",
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
				 * Defines the items of the component. <br /> <br /> <b>Note:</b> Use <code>sap.ui.webc.main.TreeItem</code> or <code>sap.ui.webc.main.TreeItemCustom</code>
				 */
				items: {
					type: "sap.ui.webc.main.ITreeItem",
					multiple: true
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
			methods: ["toggle"]
		}
	});

	/**
	 * Call this method to manually switch the <code>expanded</code> state of a tree item.
	 * @public
	 * @name sap.ui.webc.main.TreeItem#toggle
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return TreeItem;
});
