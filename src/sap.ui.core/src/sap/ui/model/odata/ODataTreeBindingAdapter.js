/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.ODataTreeBindingAdapter
sap.ui.define(['jquery.sap.global', 'sap/ui/model/TreeBinding', './v2/ODataTreeBinding', 'sap/ui/model/TreeBindingAdapter', 'sap/ui/model/TreeAutoExpandMode', 'sap/ui/model/ChangeReason', './OperationMode'],
	function(jQuery, TreeBinding, ODataTreeBinding, TreeBindingAdapter, TreeAutoExpandMode, ChangeReason, OperationMode) {
	"use strict";

	/**
	 * Adapter for TreeBindings to add the ListBinding functionality and use the
	 * tree structure in list based controls.
	 * Only usable with the sap.ui.table.TreeTable control.
	 * The functions defined here are only available when you are using a TreeTable and an ODataModel.
	 *
	 * @alias sap.ui.model.odata.ODataTreeBindingAdapter
	 * @function
	 * @experimental This module is only for experimental and internal use!
	 * @public
	 */
	var ODataTreeBindingAdapter = function() {

		// ensure only TreeBindings are enhanced which have not been enhanced yet
		if (!(this instanceof TreeBinding) || this._bIsAdapted) {
			return;
		}

		TreeBindingAdapter.apply(this);

		// apply the methods of the adapters prototype to the TreeBinding instance
		for (var fn in ODataTreeBindingAdapter.prototype) {
			if (ODataTreeBindingAdapter.prototype.hasOwnProperty(fn)) {
				this[fn] = ODataTreeBindingAdapter.prototype[fn];
			}
		}

		// make sure we have a parameter object
		this.mParameters = this.mParameters || {};

		// initialize the contexts
		this._aRowIndexMap = [];

		//Store length and threshold for all requests
		this._iThreshold = 0;
		this._iPageSize = 0;

		//set the default auto expand mode
		this.setAutoExpandMode(this.mParameters.autoExpandMode || TreeAutoExpandMode.Sequential);

		//default value for collapse recursive
		if (this.mParameters.collapseRecursive === undefined) {
			this.bCollapseRecursive = true;
		} else {
			this.bCollapseRecursive = !!this.mParameters.collapseRecursive;
		}

		//create general tree structure
		this._createTreeState();

		// restore old tree state if given AND if the binding is running in OperationMode.Client
		// OperationMode.Auto is not supported, as the binding would behave fundamentally different in case the threshold is rejected.
		if (this.mParameters.treeState && this.sOperationMode == OperationMode.Client) {
			this.setTreeState(this.mParameters.treeState);
		}
	};

	/**
	 * Returns true or false, depending on the child count of the given node.
	 * @override
	 * @private
	 */
	ODataTreeBindingAdapter.prototype.nodeHasChildren = function(oNode) {
		jQuery.sap.assert(oNode, "ODataTreeBindingAdapter.nodeHasChildren: No node given!");

		//check if the node has children
		if (!oNode) {
			return false;
		} else if (oNode.isArtificial) {
			//our artificial root node ALWAYS has children
			return true;
		} else {
			return ODataTreeBinding.prototype.hasChildren.call(this, oNode.context);
		}
	};

	/**
	 * Calculates a group id for the given node.
	 * The actual group ID differs between hierarchy-annotations and navigation properties
	 * @override
	 * @private
	 */
	ODataTreeBindingAdapter.prototype._calculateGroupID = function (oNode) {

		var sGroupIDBase = "";
		var sGroupIDSuffix = "";
		var sEncodedValue;

		//artificial root has always "/" as groupID
		if (oNode.context === null) {
			return "/";
		}

		if (oNode.parent) {
			//case 1: nested node, group id is the path along the parents
			sGroupIDBase = oNode.parent.groupID;
			sGroupIDBase = sGroupIDBase[sGroupIDBase.length - 1] !== "/" ? sGroupIDBase + "/" : sGroupIDBase;
			if (this.bHasTreeAnnotations) {
				// Forward slashes in Group IDs are used to calculate the level of a node.
				// However, the strings used to calculate a nodes Group ID may already contain
				//  forward slashes. These slashes need to be removed to ensure correct level calculation later on.
				// Currently, we encode them. (Beware: the property value can be an integer)
				sEncodedValue = (oNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]) + "").replace(/\//g, "%2F");
				sGroupIDSuffix = sEncodedValue + "/";
			} else {
				//odata navigation properties
				sGroupIDSuffix = oNode.context.sPath.substring(1) + "/";
			}
		} else {
			//case 2: node sits on root level
			if (this.bHasTreeAnnotations) {
				sGroupIDBase = "/";
				// See comment at replacement above
				sEncodedValue = (oNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]) + "").replace(/\//g, "%2F");
				sGroupIDSuffix = sEncodedValue + "/";
			} else {
				//odata nav properties case
				sGroupIDBase = "/";
				sGroupIDSuffix = oNode.context.sPath[0] === "/" ? oNode.context.sPath.substring(1) : oNode.context.sPath;
			}
		}

		var sGroupID = sGroupIDBase + sGroupIDSuffix;

		return sGroupID;
	};

	/**
	 * Resets all fields, which are used by the TreeBindingAdapter.
	 * @private
	 */
	ODataTreeBindingAdapter.prototype.resetData = function(oContext, mParameters) {
		var vReturn = ODataTreeBinding.prototype.resetData.call(this, oContext, mParameters);

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
	 * Returns a tree state handle.
	 * The tree state handle can be used in to restore the tree state for a v2 ODataTreeBinding running in OperationMode.Client.
	 * Please see the constructor documentation of sap.ui.model.odata.v2.ODataTreeBinding for the API documentation of the "treeState" constructor parameter.
	 *
	 * @name sap.ui.model.odata.ODataTreeBindingAdapter#getCurrentTreeState
	 * @public
	 */

	return ODataTreeBindingAdapter;

}, /* bExport= */ true);
