/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.TreeItem.
sap.ui.define([
	"./ListItem",
	"./thirdparty/ui5-wc-bundles/TreeItem"
], function(ListItem) {
	"use strict";

	/**
	 * Constructor for a new <code>TreeItem</code>.
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
	 * @alias sap.ui.webcomponents.TreeItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TreeItem = ListItem.extend("sap.ui.webcomponents.TreeItem", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-tree-item",
			properties: {
				/**
				 * Defines the text of the tree item.
				 *
				 * @public
				 * @type {String}
				 * @defaultValue ""
				 */
				text: {
					type: "string"
				},

				/**
				 * Defines whether the tree node is expanded or collapsed. Only has visual effect for tree nodes with children.
				 *
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				expanded: {
					type: "boolean"
				},

				/**
				 * Defines whether the tree node has children, even if currently no other tree nodes are slotted inside.
				 * <br>
				 * <i>Note:</i> This property is useful for showing big tree structures where not all nodes are initially loaded due to performance reasons.
				 * Set this to <code>true</code> for nodes you intend to load lazily, when the user clicks the expand button.
				 * It is not necessary to set this property otherwise. If a tree item has children, the expand button will be displayed anyway.
				 *
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				hasChildren: {
					type: "boolean"
				},

				/**
				 * Defines whether the tree node is selected by the user. Only has effect if the <code>ui5-tree</code> is in one of the
				 * following modes: in <code>SingleSelect</code>, <code>SingleSelectBegin</code>, <code>SingleSelectEnd</code> and <code>MultiSelect</code>.
				 *
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				selected: {
					type: "boolean"
				},

				/**
				 * If set, an icon will be displayed before the text, representing the tree item.
				 *
				 * @public
				 * @type {String}
				 * @defaultValue ""
				 */
				icon: {
					type: "string"
				},
			},
			defaultAggregation: "items",
			aggregations: {

				items: {
					type: "sap.ui.core.Control",
					singularName: "item",
					multiple: true
				}
			},
			methods: [
				"toggle"
			]
		}
	});

	/*
	TreeItem.prototype.toggle = function() {
		this.setExpanded(!this.getExpanded());
	};
	*/

	return TreeItem;
});
