/*
 * ! ${copyright}
 */

// Provides control sap.m.CustomTreeItem.
sap.ui.define([
	'./TreeItemBase',
	'./ListItemBase',
	'./library',
	"./CustomTreeItemRenderer"
], function(TreeItemBase, ListItemBase, library, CustomTreeItemRenderer) {
	"use strict";

	/**
	 * Constructor for a new CustomTreeItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The <code>CustomTreeItem</code> control with a content aggregation is used to customize the tree items within the <code>Tree</code>
	 *        control.<br><b>Note:</b> Even though the content aggregation can be used for any control, complex responsive layout controls, such as
	 *        <code>Table, Form</code> etc, should not be aggregated as content.
	 * @extends sap.m.TreeItemBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.48.0
	 * @alias sap.m.CustomTreeItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CustomTreeItem = TreeItemBase.extend("sap.m.CustomTreeItem", /** @lends sap.m.CustomTreeItem.prototype */
	{
		metadata: {

			library: "sap.m",
			defaultAggregation: "content",
			aggregations: {

				/**
				 * The content of this tree item.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content",
					bindable: "bindable"
				}
			}
		}
	});

	CustomTreeItem.prototype.getContentAnnouncement = function() {
		return this.getContent().map(function(oContent) {
			return ListItemBase.getAccessibilityText(oContent);
		}).join(" ").trim();
	};

	return CustomTreeItem;
});
