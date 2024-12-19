/*!
 * ${copyright}
 */

/**
 * Utility class that helps find the path to a specific node in a tree
 */
sap.ui.define([],
	function () {
		"use strict";

		var oCreatedTreeUtils = {};

		/**
		 * For the class to work, it needs to know what some information about the structure of the tree
		 * @param nodeIdField - what is the name of the field that holds the unique identifier of the node
		 * @param childrenField - what is the name of the field that holds the array with children for this node
		 * @constructor
		 */
		var TreeUtil = function (nodeIdField, childrenField) {
			this.nodeIdField = nodeIdField;
			this.childrenField = childrenField;
			this.memoizedIndex = [];
		};

		/**
		 * Returns an array, containing the ids of all nodes from "tree" leading to node "nodeId"
		 * @param nodeId - the destination node
		 * @param tree - the tree structure to search in
		 * @returns {Array}
		 */
		TreeUtil.prototype.getPathToNode = function (nodeId, tree) {
			const stored = this.memoizedIndex[nodeId];
			if (stored) {
				return stored.stack;
			}
			var stack = [];
			this._walkTree(nodeId, tree, stack);
			return stack;
		};

		TreeUtil.prototype.getNodeById = function (nodeId, tree) {
			const stored = this.memoizedIndex[nodeId];
			if (stored) {
				return stored.node;
			}
			this.getPathToNode(nodeId, tree);
			return this.memoizedIndex[nodeId]?.node;
		};

		TreeUtil.prototype._walkTree = function (nodeId, tree, stack) {

			var node = this._findLeaf(tree, nodeId),
				found = !!node;
			if (found) {
				stack.push(nodeId);
				this.memoizedIndex[nodeId] = {
					node,
					stack
				};
				return true;
			}

			for (var i = 0; i < tree.length; i++) {
				if (tree[i][this.childrenField]) {
					stack.push(tree[i][this.nodeIdField]);
					if (this._walkTree(nodeId, tree[i][this.childrenField], stack)) {
						return true;
					}
					stack.pop();
				}
			}
		};

		TreeUtil.prototype._findLeaf = function (tree, nodeId) {
			for (var i = 0; i < tree.length; i++) {
				if (tree[i][this.nodeIdField] === nodeId) {
					return tree[i];
				}
			}
			return null;
		};

		return {
			treeTypes: {
				"Documentation": "Documentation",
				"ApiReference": "ApiReference"
			},
			getInstance: function (treeType, nodeIdField, childrenField) {
				if (!oCreatedTreeUtils[treeType]) {
					oCreatedTreeUtils[treeType] = new TreeUtil(nodeIdField, childrenField);
				}
				return oCreatedTreeUtils[treeType];
			}
		};

	});
