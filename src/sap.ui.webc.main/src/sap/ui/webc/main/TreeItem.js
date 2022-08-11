/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.TreeItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/library",
	"./thirdparty/TreeItem"
], function(WebComponent, library, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>TreeItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> This is the item to use inside a <code>sap.ui.webc.main.Tree</code>. You can represent an arbitrary tree structure by recursively nesting tree items.
	 *
	 * <h3>Usage</h3> <code>sap.ui.webc.main.TreeItem</code> is an abstract element, representing a node in a <code>sap.ui.webc.main.Tree</code>. The tree itself is rendered as a list, and each <code>sap.ui.webc.main.TreeItem</code> is represented by a list item(<code>sap.ui.webc.main.TreeListItem</code>) in that list. Therefore, you should only use <code>sap.ui.webc.main.TreeItem</code> directly in your apps. The <code>sap.ui.webc.main.TreeListItem</code> list item is internal for the list, and not intended for public use.
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
				 * Defines the <code>additionalText</code>, displayed in the end of the tree item.
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
				 * Defines whether the tree node is expanded or collapsed. Only has visual effect for tree nodes with children.
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
				 * If set, an icon will be displayed before the text, representing the tree item.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the selection of a tree node is displayed as partially selected. <br>
				 * <br>
				 * <b>Note:</b> The indeterminate state can be set only programatically and can’t be achieved by user interaction, meaning that the resulting visual state depends on the values of the <code>indeterminate</code> and <code>selected</code> properties:
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
				 * Defines whether the tree node is selected by the user. Only has effect if the <code>sap.ui.webc.main.Tree</code> is in one of the following modes: in <code>SingleSelect</code>, <code>SingleSelectBegin</code>, <code>SingleSelectEnd</code> and <code>MultiSelect</code>.
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
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the items of this component.
				 */
				items: {
					type: "sap.ui.webc.main.ITreeItem",
					multiple: true
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