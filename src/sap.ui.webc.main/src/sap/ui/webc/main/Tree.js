/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Tree.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Tree"
], function(WebComponent, library) {
	"use strict";

	var ListMode = library.ListMode;

	/**
	 * Constructor for a new <code>Tree</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The <code>sap.ui.webc.main.Tree</code> component provides a tree structure for displaying data in a hierarchy.
	 *
	 * <h3>Usage</h3>
	 *
	 * <h4>When to use:</h4>
	 * <ul>
	 *     <li>To display hierarchically structured items.</li>
	 *     <li>To select one or more items out of a set of hierarchically structured items.</li>
	 * </ul>
	 *
	 * <h4>When not to use:</h4>
	 * <ul>
	 *     <li>To display items not hierarchically strcutured. In this case, use the List component.</li>
	 *     <li>To select one item from a very small number of non-hierarchical items. Select or ComboBox might be more appropriate.</li>
	 *     <li>The hierarchy turns out to have only two levels. In this case, use List with group items.</li>
	 * </ul>
	 *
	 * <h3>Keyboard Handling</h3>
	 *
	 * The <code>sap.ui.webc.main.Tree</code> provides advanced keyboard handling. The user can use the following keyboard shortcuts in order to navigate trough the tree:
	 * <ul>
	 *     <li>[UP/DOWN] - Navigates up and down the tree items that are currently visible.</li>
	 *     <li>[RIGHT] - Drills down the tree by expanding the tree nodes.</li>
	 *     <li>[LEFT] - Goes up the tree and collapses the tree nodes.</li>
	 * </ul> <br>
	 *
	 *
	 * The user can use the following keyboard shortcuts to perform selection, when the <code>mode</code> property is in use:
	 * <ul>
	 *     <li>[SPACE] - Selects the currently focused item upon keyup.</li>
	 *     <li>[ENTER] - Selects the currently focused item upon keydown.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Tree
	 */
	var Tree = WebComponent.extend("sap.ui.webc.main.Tree", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-tree-ui5",
			properties: {

				/**
				 * Defines the component footer text.
				 */
				footerText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the component header text. <br>
				 * <br>
				 * <b>Note:</b> If the <code>header</code> slot is set, this property is ignored.
				 */
				headerText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines the mode of the component. Since the tree uses a <code>sap.ui.webc.main.List</code> to display its structure, the tree modes are exactly the same as the list modes, and are all applicable.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b>
				 *
				 *
				 * <ul>
				 *     <li><code>None</code></li>
				 *     <li><code>SingleSelect</code></li>
				 *     <li><code>SingleSelectBegin</code></li>
				 *     <li><code>SingleSelectEnd</code></li>
				 *     <li><code>MultiSelect</code></li>
				 *     <li><code>Delete</code></li>
				 * </ul>
				 */
				mode: {
					type: "sap.ui.webc.main.ListMode",
					defaultValue: ListMode.None
				},

				/**
				 * Defines the text that is displayed when the component contains no items.
				 */
				noDataText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Defines the component header. <br>
				 * <br>
				 * <b>Note:</b> When the <code>header</code> slot is set, the <code>headerText</code> property is ignored.
				 */
				header: {
					type: "sap.ui.core.Control",
					multiple: true,
					slot: "header"
				},

				/**
				 * Defines the items of the component. Tree items may have other tree items as children. <br>
				 * <br>
				 * <b>Note:</b> Use <code>sap.ui.webc.main.TreeItem</code> for the intended design.
				 */
				items: {
					type: "sap.ui.webc.main.ITreeItem",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired when a tree item is activated.
				 */
				itemClick: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * The clicked item.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when the Delete button of any tree item is pressed. <br>
				 * <br>
				 * <b>Note:</b> A Delete button is displayed on each item, when the component <code>mode</code> property is set to <code>Delete</code>.
				 */
				itemDelete: {
					parameters: {
						/**
						 * the deleted item.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when the mouse cursor leaves the tree item borders.
				 */
				itemMouseout: {
					parameters: {
						/**
						 * the hovered item.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when the mouse cursor enters the tree item borders.
				 */
				itemMouseover: {
					parameters: {
						/**
						 * the hovered item.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when a tree item is expanded or collapsed. <i>Note:</i> You can call <code>preventDefault()</code> on the event object to suppress the event, if needed. This may be handy for example if you want to dynamically load tree items upon the user expanding a node. Even if you prevented the event's default behavior, you can always manually call <code>toggle()</code> on a tree item.
				 */
				itemToggle: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * the toggled item.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when selection is changed by user interaction in <code>SingleSelect</code>, <code>SingleSelectBegin</code>, <code>SingleSelectEnd</code> and <code>MultiSelect</code> modes.
				 */
				selectionChange: {
					parameters: {
						/**
						 * An array of the selected items.
						 */
						selectedItems: {
							type: "Array"
						},

						/**
						 * An array of the previously selected items.
						 */
						previouslySelectedItems: {
							type: "Array"
						}
					}
				}
			},
			methods: ["walk"]
		}
	});

	/**
	 * Perform Depth-First-Search walk on the tree and run a callback on each node
	 * @param {function} callback function to execute on each node of the tree with 2 arguments: the node and the level
	 * @public
	 * @name sap.ui.webc.main.Tree#walk
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Tree;
});