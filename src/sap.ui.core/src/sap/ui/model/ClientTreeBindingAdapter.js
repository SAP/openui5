/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides class sap.ui.model.odata.ODataAnnotations
sap.ui.define([
	'sap/ui/model/TreeBinding',
	'sap/ui/model/ClientTreeBinding',
	'./TreeBindingAdapter',
	'sap/ui/model/ChangeReason',
	"sap/base/assert",
	"sap/base/Log"
], function(
	TreeBinding,
	ClientTreeBinding,
	TreeBindingAdapter,
	ChangeReason,
	assert,
	Log
) {
	"use strict";

	/**
	 * Adapter for {@link sap.ui.model.ClientTreeBinding} to add the list binding functionality and use the tree
	 * structure in list based controls. {@link sap.ui.model.TreeBindingAdapter} is applied before the client model
	 * specific adapter part is applied.
	 *
	 * @alias sap.ui.model.ClientTreeBindingAdapter
	 * @namespace
	 *
	 * @private
	 * @ui5-restricted sap.m.Tree, sap.ui.table.TreeTable
	 */
	var ClientTreeBindingAdapter = function() {

		// ensure only TreeBindings are enhanced which have not been enhanced yet
		if (!(this instanceof TreeBinding) || this._bIsAdapted) {
			return;
		}

		TreeBindingAdapter.apply(this);

		// apply the methods of the adapters prototype to the TreeBinding instance
		for (var fn in ClientTreeBindingAdapter.prototype) {
			if (ClientTreeBindingAdapter.prototype.hasOwnProperty(fn)) {
				this[fn] = ClientTreeBindingAdapter.prototype[fn];
			}
		}

		this._invalidTree = true;

		//set the default auto expand mode
		this.setNumberOfExpandedLevels(this.mParameters.numberOfExpandedLevels || 0);
	};

	ClientTreeBindingAdapter.prototype.setNumberOfExpandedLevels = function (iNumberOfExpandedLevels) {
		this._iNumberOfExpandedLevels = parseInt(iNumberOfExpandedLevels);
	};

	ClientTreeBindingAdapter.prototype.getNumberOfExpandedLevels = function () {
		return this._iNumberOfExpandedLevels;
	};

	/**
	 * Returns true or false, depending on the child count of the given node.
	 * @param {Object} oNode Node instance to check whether it has children
	 * @returns {boolean} True if the node has children
	 */
	ClientTreeBindingAdapter.prototype.nodeHasChildren = function(oNode) {
		assert(oNode, "TreeBindingAdapter.nodeHasChildren: No node given!");

		//check if the node has children
		if (!oNode) {
			return false;
		} else if (oNode.isArtificial) {
			//our artificial root node ALWAYS has children
			return true;
		} else {
			return ClientTreeBinding.prototype.hasChildren.call(this, oNode.context);
		}
	};

	ClientTreeBindingAdapter.prototype.resetData = function(oContext, mParameters) {
		var vReturn = ClientTreeBinding.prototype.resetData.call(this, oContext, mParameters);

		// clear the mapping table
		this._aRowIndexMap = [];

		// and the root node
		this._oRootNode = undefined;

		// clear page size
		this._iPageSize = 0;
		this._iThreshold = 0;

		if (!mParameters || mParameters.reason !== ChangeReason.Sort) {
			//remove the selection/reset lead selection index
			this.clearSelection();

			// clear the tree state
			this._createTreeState(true);
		}

		return vReturn;
	};

	/**
	 * Calculates a unique group ID for a given node
	 * @param {Object} oNode Node of which the group ID shall be calculated
	 * @returns {string} Group ID for oNode
	 */
	ClientTreeBindingAdapter.prototype._calculateGroupID = function (oNode) {
		var sBindingPath = this.getPath();
		var sGroupId;
		if (oNode.context) {
			var sContextPath = oNode.context.getPath();
			// only split the contextpath along the binding path, if it is not the top-level ("/"),
			// otherwise the "_" replace regex, will replace wrongly substitute the context-path
			if (sBindingPath != "/") {
				// match the context-path in case the "arrayNames" property of the ClientTreeBindings is identical to the binding path
				var aMatch = sContextPath.match(sBindingPath + "(.*)");
				if (aMatch != null && aMatch[1]) {
					sGroupId = aMatch[1];
				} else {
					Log.warning("CTBA: BindingPath/ContextPath matching problem!");
				}
			}
			if (!sGroupId) {
				sGroupId = sContextPath;
			}

			// slashes are used to separate levels. As in the data model not every path-part represents a level,
			// the remaining slashes must be replaced by some other character. "_" is used
			if (sGroupId.startsWith("/")) {
				sGroupId = sGroupId.substring(1, sGroupId.length);
			}

			var sParentGroupId;
			if (!oNode.parent) {
				// If there is no parent object we expect that:
				//   1. the parent group id is unknown and
				//   2. the parent context is known (added in ClientTreeBinding._applyFilterRecursive)
				//
				// We use the parent context to recursively calculate the parent group id
				// In case the parent context is empty, we expect this node to be a child of the root node (which has a context of null)
				sParentGroupId = this._calculateGroupID({
					context: oNode.context._parentContext || null
				});
			} else {
				// "Normal" case: We know the parent group id
				sParentGroupId = oNode.parent.groupID;
			}
			sGroupId = sParentGroupId + sGroupId.replace(/\//g, "_") + "/";

		} else if (oNode.context === null) {
			// only the root node should have null as context
			sGroupId = "/";
		}

		return sGroupId;
	};

	/**
	 * Expand function.
	 * Due to the tree invalidation mechanism the tree has to be rebuilt before an expand operation.
	 * Calling buildTree is performance-safe, as the tree is invalid anyway.
	 */
	ClientTreeBindingAdapter.prototype.expand = function() {
		this._buildTree();
		TreeBindingAdapter.prototype.expand.apply(this, arguments);
	};

	/**
	 * Collapse function.
	 * Due to the tree invalidation mechanism the tree has to be rebuilt before a collapse operation.
	 * Calling buildTree is performance-safe, as the tree is invalid anyway.
	 */
	ClientTreeBindingAdapter.prototype.collapse = function() {
		this._buildTree();
		TreeBindingAdapter.prototype.collapse.apply(this, arguments);
	};

	/**
	 * Builds the tree from start index with the specified number of nodes
	 * @param {int} iStartIndex Index from which the tree shall be built
	 * @param {int} iLength Number of Nodes
	 */
	ClientTreeBindingAdapter.prototype._buildTree = function(iStartIndex, iLength) {
		if (this._invalidTree) {
			iStartIndex = iStartIndex || 0;
			iLength = iLength || this.getRootContexts().length;
			this._invalidTree = false;
			this._aRowIndexMap = []; // clear cache to prevent inconsistent state between cache and real tree
			TreeBindingAdapter.prototype._buildTree.call(this, iStartIndex, iLength);
		}
	};

	/**
	 * Find the first node in the tree matching the search criteria. In case the tree structure
	 * is invalid, it is rebuilt before finding the node.
	 *
	 * @param {any} vParam The search criteria
	 *
	 * @returns {object} A tree node which may be a cached sum row
	 */
	ClientTreeBindingAdapter.prototype.findNode = function (vParam) {
		this._buildTree();
		return TreeBindingAdapter.prototype.findNode.apply(this, arguments);
	};

	/**
	 * Marks a single node as selected. In case the tree structure is invalid, it is rebuilt
	 * before a <code>setSelectedIndex</code> operation.
	 *
	 * @param {number} iRowIndex Row to mark as selected
	 */
	ClientTreeBindingAdapter.prototype.setSelectedIndex = function (iRowIndex) {
		this._buildTree();
		TreeBindingAdapter.prototype.setSelectedIndex.apply(this, arguments);
	};

	/**
	 * Marks multiple nodes as selected. In case the tree structure is invalid, it is rebuilt
	 * before a <code>setSelectionInterval</code> operation.
	 *
	 * @param {number} iFromIndex The first index to mark as selected
	 * @param {number} iToIndex The last index to mark as selected
	 */
	ClientTreeBindingAdapter.prototype.setSelectionInterval = function (iFromIndex, iToIndex) {
		this._buildTree();
		TreeBindingAdapter.prototype.setSelectionInterval.apply(this, arguments);
	};

	/**
	 * Due to the tree invalidation mechanism the tree has to be rebuilt before an addSelectionInterval operation.
	 * Calling buildTree is performance-safe, as the tree is invalid anyway.
	 */
	ClientTreeBindingAdapter.prototype.addSelectionInterval = function () {
		this._buildTree();
		TreeBindingAdapter.prototype.addSelectionInterval.apply(this, arguments);
	};

	/**
	 * Due to the tree invalidation mechanism the tree has to be rebuilt before an addSelectionInterval operation.
	 * Calling buildTree is performance-safe, as the tree is invalid anyway.
	 */
	ClientTreeBindingAdapter.prototype.removeSelectionInterval = function () {
		this._buildTree();
		TreeBindingAdapter.prototype.removeSelectionInterval.apply(this, arguments);
	};

	/**
	 * Due to the tree invalidation mechanism the tree has to be rebuilt before an addSelectionInterval operation.
	 * Calling buildTree is performance-safe, as the tree is invalid anyway.
	 */
	ClientTreeBindingAdapter.prototype.clearSelection = function () {
		this._buildTree();
		TreeBindingAdapter.prototype.clearSelection.apply(this, arguments);
	};

	/**
	 * Due to the tree invalidation mechanism the tree has to be rebuilt before an addSelectionInterval operation.
	 * Calling buildTree is performance-safe, as the tree is invalid anyway.
	 */
	ClientTreeBindingAdapter.prototype.selectAll = function () {
		this._buildTree();
		TreeBindingAdapter.prototype.selectAll.apply(this, arguments);
	};

	/**
	 * Calculate the request length based on the given information.
	 *
	 * Because client treebinding knows the complete data from the very beginning, it returns
	 * the maximum group size, the current section is not considered.
	 *
	 * @param {number} iMaxGroupSize The maximum group size
	 * @param {object} oSection Information of the current section
	 *
	 * @returns {number} The request length
	 */
	ClientTreeBindingAdapter.prototype._calculateRequestLength = function(iMaxGroupSize, oSection) {
		return iMaxGroupSize;
	};

	ClientTreeBindingAdapter.prototype.getLength = function() {
		this._buildTree();
		return TreeBindingAdapter.prototype.getLength.apply(this, arguments);
	};

	ClientTreeBindingAdapter.prototype._fireChange = function() {
		this._invalidTree = true;
		this.constructor.prototype._fireChange.apply(this, arguments);
	};

	return ClientTreeBindingAdapter;

});