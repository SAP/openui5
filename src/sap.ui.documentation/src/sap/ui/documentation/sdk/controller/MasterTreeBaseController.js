/*!
 * ${copyright}
 */

/**
 * Common controller for the API Reference & Documentation master controllers (as they both use a tree)
 */
sap.ui.define([
		"sap/ui/thirdparty/jquery",
		"./BaseController",
		"./util/TreeUtil",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (jQuery, BaseController, TreeUtil, Filter, FilterOperator) {
		"use strict";

		var TREE_SCROLL_DURATION = 300; // The time in "ms" to scroll the tree in order to move an element to view

		var MasterTreeBaseController = BaseController.extend("sap.ui.documentation.sdk.controller.MasterTreeBaseController", {

			/**
			 * This method tells the utility class that walks the model what are the names of the fields in the model
			 * @param nodeIdField - the field which holds the unique tree node id
			 * @param childrenField - the field which holds the array with the node's children
			 * @private
			 */
			_initTreeUtil: function (nodeIdField, childrenField) {
				this._oTreeUtil = new TreeUtil(nodeIdField, childrenField);
			},

			/**
			 * Makes the tree open all nodes up to the node with "sTopicId" and then selects it
			 * @private
			 */
			_expandTreeToNode: function (sTopicId, oModel) {
				var oTree = this.byId("tree"),
					oData = oModel.getData();

				// Find the path to the new node, traversing the model
				var aTopicIds = this._oTreeUtil.getPathToNode(sTopicId, oData);

				// Expand all nodes on the path to the target node
				var oLastItem;
				aTopicIds.forEach(function(sId) {
					var oItem = this._findTreeItem(sId);
					if (oItem) {
						oTree.getBinding("items").expand(oTree.indexOfItem(oItem));
						oLastItem = oItem;
					}
				}, this);

				// Select the target node and scroll to it
				if (oLastItem) {
					oLastItem.setSelected(true);

					// Only scroll after the dom is ready
					setTimeout(function () {
						if (oLastItem.getDomRef() && !isInViewport(oLastItem.getDomRef())) {
							this._scrollTreeItemIntoView(oLastItem);
						}
					}.bind(this), 0);
				}
			},

			/**
			 * Scans the items aggregation of a sap.m.Tree for an item that has custom data with key="topicId" and value=sId
			 * Note: It's important to always fetch the items before searching as they change dynamically when nodes expand/collapse
			 * @param {string} sId
			 * @returns {null}
			 * @private
			 */
			_findTreeItem: function (sId) {
				var oItems = this.byId("tree").getItems();

				for (var i = 0; i < oItems.length; i++) {
					var oCustomData = oItems[i].getCustomData()[0]; // assumes one custom data element only
					if (oCustomData.getKey() === "nodeId" && oCustomData.getValue() === sId) {
						return oItems[i];
					}
				}
				return null;
			},

			_scrollTreeItemIntoView: function (oItem) {
				var oPage = this.byId("page");
				oPage.scrollToElement(oItem.getDomRef(), TREE_SCROLL_DURATION);
			},

			/**
			 * Handler for the SearchField
			 * @param oEvent
			 */
			onTreeFilter: function (oEvent) {
				// Update filter value
				this._sFilter = oEvent.getParameter("newValue").trim();

				if (this._filterTimeout) {
					clearTimeout(this._filterTimeout);
				}

				this._filterTimeout = setTimeout(function () {

					if (this.buildAndApplyFilters()) {
						this._expandAllNodes();
					} else {
						this._collapseAllNodes();
					}

					this._filterTimeout = null;
				}.bind(this), 250);

			},

			/**
			 * Build and apply filters to the tree model.
			 * @returns {boolean} if search filter is applied
			 */
			buildAndApplyFilters: function () {
				var oBinding = this.byId("tree").getBinding("items");
				if (this._sFilter) {
					oBinding.filter(new Filter({
						path: "name",
						operator: FilterOperator.Contains,
						value1: this._sFilter
					}));
					return true;
				} else {
					oBinding.filter();
					return false;
				}
			},

			_expandAllNodes: function () {
				this.byId("tree").expandToLevel(10);
			},

			_collapseAllNodes: function () {
				this.byId("tree").collapseAll();
			},

			_clearSelection: function () {
				var aItems = this.byId("tree").getItems();

				if (aItems.length) {
					aItems[0].setSelected(false);
				}
			},

			/**
			 * Handler for the Expand all button
			 * @param oEvent
			 */
			onTreeExpandAll: function (oEvent) {
				this._expandAllNodes();
			},

			/**
			 * Handler for the Collapse all button
			 * @param oEvent
			 */
			onTreeCollapseAll: function (oEvent) {
				this._collapseAllNodes();
			}
		});

		function isInViewport (oDomElement) {

			var oRect = oDomElement.getBoundingClientRect();

			return (
				oRect.top >= 0 &&
				oRect.left >= 0 &&
				oRect.bottom <= jQuery(document).height() &&
				oRect.right <= jQuery(document).width()
			);
		}

		return MasterTreeBaseController;
	}
);