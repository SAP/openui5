/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.ODataTreeBindingFlat
sap.ui.define(['jquery.sap.global', 'sap/ui/model/TreeBinding', 'sap/ui/model/odata/v2/ODataTreeBinding', 'sap/ui/model/ChangeReason', 'sap/ui/model/TreeBindingUtils'],
	function(jQuery, TreeBinding, ODataTreeBinding, ChangeReason, TreeBindingUtils) {
	"use strict";

	/**
	 * Adapter for TreeBindings to add the ListBinding functionality and use the
	 * tree structure in list based controls.
	 *
	 * @alias sap.ui.model.odata.ODataTreeBindingFlat
	 * @function
	 * @experimental This module is only for experimental and internal use!
	 * @protected
	 */
	var ODataTreeBindingFlat = function() {

		// ensure only TreeBindings are enhanced which have not been enhanced yet
		if (!(this instanceof TreeBinding) || this._bIsAdapted) {
			return;
		}

		// apply the methods of the adapters prototype to the TreeBinding instance
		for (var fn in ODataTreeBindingFlat.prototype) {
			if (ODataTreeBindingFlat.prototype.hasOwnProperty(fn)) {
				this[fn] = ODataTreeBindingFlat.prototype[fn];
			}
		}

		// make sure we have a parameter object
		this.mParameters = this.mParameters || {};

		// keep track of the page-size for expand requests
		this._iPageSize = 0;

		// flat data structure to store the tree nodes depth-first ordered
		this._aNodes = this._aNodes || [];

		// the node cache for the last requested nodes (via getContexts)
		this._aNodeCache = [];

		// the tree states
		this._aCollapsed = this._aCollapsed || [];
		this._aExpanded = this._aExpanded || [];
		this._aRemoved = [];
		this._aAdded = [];
		this._aNodeChanges = [];

		// selection state
		this._aExpandedAfterSelectAll = this._aExpandedAfterSelectAll || [];
		this._mSelected = this._mSelected || {};
		this._bSelectAll = false;

		// the delta variable for calculating the correct binding-length (used e.g. for sizing the scrollbar)
		this._iLengthDelta = 0;

		// initialize the contexts
		this._aRowIndexMap = [];

		//default value for collapse recursive
		if (this.mParameters.collapseRecursive === undefined) {
			this.bCollapseRecursive = true;
		} else {
			this.bCollapseRecursive = !!this.mParameters.collapseRecursive;
		}

		this._bIsAdapted = true;

		this._bReadOnly = true;
	};

	/**
	 * Sets the number of expanded levels.
	 */
	ODataTreeBindingFlat.prototype.setNumberOfExpandedLevels = function(iLevels) {
		this.resetData();
		ODataTreeBinding.prototype.setNumberOfExpandedLevels.apply(this, arguments);
	};

	/**
	 * Retrieves the requested page.
	 * API used by the controls.
	 */
	ODataTreeBindingFlat.prototype.getContexts = function (iStartIndex, iLength, iThreshold, bReturnNodes) {
		if (this.isInitial()) {
			return [];
		}

		// make sure the input parameters are not undefined
		iStartIndex = iStartIndex || 0;
		iLength = iLength || this.oModel.sizeLimit;
		iThreshold = iThreshold || 0;

		this._iPageSize = iLength;
		this._iThreshold = iThreshold;

		// shortcut for initial load
		if (this._aNodes.length == 0 && !this.isLengthFinal()) {
			this._loadData(iStartIndex, iLength + iThreshold);
		}

		// cut out the requested section from the tree
		var aResultContexts = [];
		var aNodes = this._retrieveNodeSection(iStartIndex, iLength);

		// clear node cache
		this._aNodeCache = [];

		// calculate $skip and $top values
		var iSkip;
		var iTop = 0;
		var iLastServerIndex = 0;

		// potentially missing entries for each parent deeper than the # of expanded levels
		var mGaps = {};

		for (var i = 0; i < aNodes.length; i++) {
			var oNode = aNodes[i];

			// cache node for more efficient access on the currently visible nodes in the TreeTable
			// only cache nodes which are real contexts
			this._aNodeCache[iStartIndex + i] = oNode && oNode.context ? oNode : undefined;

			aResultContexts.push(oNode.context);

			if (!oNode.context) {
				if (oNode.serverIndex) {
					if (iSkip == undefined) {
						iSkip = oNode.serverIndex;
					}
					iLastServerIndex = oNode.serverIndex;
				} else if (oNode.positionInParent != undefined) { //0 is a valid index here
					var oParent = oNode.parent;
					mGaps[oParent.key] = mGaps[oParent.key] || [];
					mGaps[oParent.key].push(oNode);
				}
			}
		}

		// $top needs to be at minimum 1
		iTop = 1 + Math.max(iLastServerIndex - (iSkip || 0), 0);

		//if something is missing on the server indexed nodes -> request it
		if (iSkip != undefined && iTop) {
			this._loadData(iSkip, iTop + iThreshold);
		}

		//check if we are missing some manually expanded nodes
		for (var sMissingKey in mGaps) {
			var oRequestParameters = this._calculateRequestParameters(mGaps[sMissingKey]);
			this._loadChildren(mGaps[sMissingKey][0].parent, oRequestParameters.skip, oRequestParameters.top);
		}

		// either return nodes or contexts
		if (bReturnNodes) {
			return aNodes;
		} else {
			return aResultContexts;
		}
	};

	ODataTreeBindingFlat.prototype._calculateRequestParameters = function (aMissing) {
		var oParent = aMissing[0].parent;
		var iMissingSkip = aMissing[0].positionInParent;
		var iMissingLength = Math.min(iMissingSkip + Math.max(this._iThreshold, aMissing.length), oParent.children.length);

		for (var i = iMissingSkip; i < iMissingLength; i++) {
			var oChild = oParent.children[i];
			if (oChild) {
				break;
			}
		}

		return {
			skip: iMissingSkip,
			top: i - iMissingSkip
		};
	};

	/**
	 * Cuts out a piece from the tree.
	 * @private
	 */
	ODataTreeBindingFlat.prototype._retrieveNodeSection = function (iStartIndex, iLength) {
		return this._bReadOnly ? this._indexRetrieveNodeSection(iStartIndex, iLength) : this._mapRetrieveNodeSection(iStartIndex, iLength);
	};

	ODataTreeBindingFlat.prototype._mapRetrieveNodeSection = function (iStartIndex, iLength) {
		var iNodeCounter = -1;
		var aNodes =  [];
		this._map(function (oNode, oRecursionBreaker, sIndexType, iIndex, oParent) {
			iNodeCounter++;
			if (iNodeCounter >= iStartIndex) {
				// if we have a missing node and it is a server-indexed node -> introduce a gap object
				if (!oNode) {
					if (sIndexType == "serverIndex") {
						oNode = {
							serverIndex: iIndex
						};
					} else if (sIndexType == "positionInParent") {
						oNode = {
							positionInParent: iIndex,
							parent: oParent
						};
					}
				}
				aNodes.push(oNode);
			}
			if (aNodes.length >= iLength) {
				oRecursionBreaker.broken = true;
			}
		});
		return aNodes;
	};

	ODataTreeBindingFlat.prototype._indexRetrieveNodeSection = function (iStartIndex, iLength) {
		var i, aNodes =  [], oNodeInfo, oNode;

		for (i = iStartIndex ; i < iStartIndex + iLength ; i++) {
			oNodeInfo = this.getNodeInfoByRowIndex(i);
			if (oNodeInfo.index !== undefined && oNodeInfo.index < this._aNodes.length) {
				oNode = this._aNodes[oNodeInfo.index];
				if (!oNode) {
					oNode = {
						serverIndex: oNodeInfo.index
					};
				}
			} else if (oNodeInfo.parent) {
				oNode = oNodeInfo.parent.children[oNodeInfo.childIndex];
				if (!oNode) {
					oNode = {
						parent: oNodeInfo.parent,
						positionInParent: oNodeInfo.childIndex
					};
				}
			}

			if (oNode) {
				aNodes.push(oNode);
				oNode = null;
			}
		}
		return aNodes;
	};

	/**
	 * Retrieves the requested section of the nodes.
	 * Also requests the data if necessary.
	 * @protected
	 */
	ODataTreeBindingFlat.prototype.getNodes = function (iStartIndex, iLength, iThreshold) {
		var vNodes = this.getContexts(iStartIndex, iLength, iThreshold, true);
		return vNodes;
	};



	/**
	 * Applies the given function to all tree nodes
	 * @param {function} fnMap the map function which will be called for all nodes.
	 * @private
	 */
	ODataTreeBindingFlat.prototype._map = function (fnMap) {
		var oRecursionBreaker = {broken: false};

		/**
		 * Helper function to iterate all added subtrees of a node.
		 */
		var fnCheckNodeForAddedSubtrees = function (oNode) {
			// if there are subnodes added to the current node -> traverse them first (added nodes are at the top, before any children)
			if (oNode.addedSubtrees.length > 0 && !oNode.nodeState.collapsed) {
				// an added subtree can be either a deep or a flat tree (depending on the addContexts) call
				for (var j = 0; j < oNode.addedSubtrees.length; j++) {
					var oSubtreeHandle = oNode.addedSubtrees[j];
					fnTraverseAddedSubtree(oNode, oSubtreeHandle);
					if (oRecursionBreaker.broken) {
						return;
					}
				}
			}
		};

		/**
		 * Traverses an re-inserted or newly added subtree.
		 * This can be a combination of flat and deep trees.
		 *
		 * Decides if the traversal has to branche over to a flat or a deep part of the tree.
		 *
		 * @param {object} oNode the parent node
		 * @param {object} the subtree handle, inside there is either a deep or a flat tree stored
		 */
		var fnTraverseAddedSubtree = function (oNode, oSubtreeHandle) {
			var oSubtree = oSubtreeHandle._getSubtree();

			if (oSubtreeHandle) {
				// subtree is flat
				if (jQuery.isArray(oSubtree)) {
					if (oSubtreeHandle._oSubtreeRoot) {
						// jump to a certain position in the flat structure and map the nodes
						fnTraverseFlatSubtree(oSubtree, oSubtreeHandle._oSubtreeRoot.serverIndex, oSubtreeHandle._oSubtreeRoot, oSubtreeHandle._oSubtreeRoot.originalLevel || 0, oNode.level + 1);
					} else {
						// newly added nodes
						fnTraverseFlatSubtree(oSubtree, null, null, 0, oNode.level + 1);
					}

				} else {
					// subtree is deep
					oSubtreeHandle._oSubtreeRoot.level = oNode.level + 1;
					fnTraverseDeepSubtree(oSubtreeHandle._oSubtreeRoot, false, oSubtreeHandle._oNewParentNode, -1, oSubtreeHandle._oSubtreeRoot);
				}
			}
		};

		/**
		 * Recursive Tree Traversal
		 * @param {object} oNode the current node
		 * @param {boolean} bIgnore a flag to indicate if the node should be mapped
		 * @param {object} oParent the parent node of oNode
		 * @param {int} iPositionInParent the position of oNode in the children-array of oParent
		 */
		var fnTraverseDeepSubtree = function (oNode, bIgnore, oParent, iPositionInParent, oIgnoreRemoveForNode) {
			// ignore node if it was already mapped or is removed (except if it was reinserted, denoted by oIgnoreRemoveForNode)
			if (!bIgnore) {
				if (!oNode.nodeState.removed || oIgnoreRemoveForNode == oNode) {
					fnMap(oNode, oRecursionBreaker, "positionInParent", iPositionInParent, oParent);
					if (oRecursionBreaker.broken) {
						return;
					}
				}
			}
			fnCheckNodeForAddedSubtrees(oNode);
			if (oRecursionBreaker.broken) {
				return;
			}

			// if the node also has children AND is expanded, dig deeper
			if (oNode && oNode.children && oNode.nodeState.expanded) {
				for (var i = 0; i < oNode.children.length; i++) {
					var oChildNode = oNode.children[i];
					// Make sure that the level of all child nodes are adapted to the parent level,
					// this is necessary if the parent node was placed in a different leveled subtree.
					// Ignore removed nodes, which are not re-inserted.
					// Re-inserted deep nodes will be regarded in fnTraverseAddedSubtree.
					if (oChildNode && !oChildNode.nodeState.removed && !oChildNode.nodeState.reinserted) {
						oChildNode.level = oNode.level + 1;
					}
					// only dive deeper if we have a gap (entry which has to be loaded) or a defined node is NOT removed
					if (oChildNode && !oChildNode.nodeState.removed) {
						fnTraverseDeepSubtree(oChildNode, false, oNode, i, oIgnoreRemoveForNode);
					} else if (!oChildNode) {
						fnMap(oChildNode, oRecursionBreaker, "positionInParent", i, oNode);
					}
					if (oRecursionBreaker.broken) {
						return;
					}
				}
			}
		};

		/**
		 * Traverses a flat portion of the tree (or rather the given array).
		 */
		var fnTraverseFlatSubtree = function (aFlatTree, iServerIndexOffset, oIgnoreRemoveForNode, iSubtreeBaseLevel, iNewParentBaseLevel) {
			//count the nodes until we find the correct index
			for (var i = 0; i < aFlatTree.length; i++) {
				var oNode = aFlatTree[i];

				// If the node is removed -> ignore it
				// BEWARE:
				// If a removed range is reinserted again, we will deliver it instead of jumping over it.
				// This is denoted by the "oIgnoreRemoveForNode", this is a node which will be served but only if it was traversed by fnTraverseAddedSubtree
				if (oNode && oNode.nodeState && oNode.nodeState.removed && oNode != oIgnoreRemoveForNode) {
					// only jump over the magnitude range if the node was not initially collapsed/server-expanded
					if (!oNode.initiallyCollapsed) {
						i += oNode.magnitude;
					}
					continue;
				}

				// calculate level shift if necessary (added subtrees are differently indented than before removal)
				if (oNode && iSubtreeBaseLevel >= 0 && iNewParentBaseLevel >= 0) {
					oNode.level = oNode.originalLevel || 0;
					var iLevelDifNormalized = (oNode.level - iSubtreeBaseLevel) || 0;
					oNode.level = iNewParentBaseLevel + iLevelDifNormalized || 0;
				}

				if (iServerIndexOffset === null) {
					fnMap(oNode, oRecursionBreaker, "newNode");
				} else {
					// call map for the node itself, before traversing to any children/siblings
					// the server-index position is used to calculate the $skip/$top values for loading the missing entries
					fnMap(oNode, oRecursionBreaker, "serverIndex", iServerIndexOffset + i);
				}

				if (oRecursionBreaker.broken) {
					return;
				}

				// if we have a node, lets see if we have to dig deeper or jump over some entries
				if (oNode && oNode.nodeState) {
					// jump over collapsed nodes by the enclosing magnitude
					if (!oNode.initiallyCollapsed && oNode.nodeState.collapsed) {
						i += oNode.magnitude;
					} else {
						// look into expanded nodes deeper than the initial expand level
						if (oNode.initiallyCollapsed && oNode.nodeState.expanded) {
							// the node itself will be ignored, since its fnMap was already called
							fnTraverseDeepSubtree(oNode, true);
							if (oRecursionBreaker.broken) {
								return;
							}
						} else if (!oNode.initiallyCollapsed && oNode.nodeState.expanded) {
							// before going to the next flat node (children|sibling), we look at the added subtrees in between
							// this is only necessary for expanded server-indexed nodes
							fnCheckNodeForAddedSubtrees(oNode);
						}
					}
				}

				// break recursion after fnMap or traversal function calls
				if (oRecursionBreaker.broken) {
					return;
				}
			}
		};

		//kickstart the traversal from the original flat nodes array (no server-index offset -> 0)
		fnTraverseFlatSubtree(this._aNodes, 0, null);
	};

	/**
	 * Loads the data based on a level filter.
	 */
	ODataTreeBindingFlat.prototype._loadData = function (iSkip, iTop) {

		var sRequestKey = "level <= " + this.getNumberOfExpandedLevels() + "-" + iSkip + "-" + iTop;

		// if we already queued up a request for the respective page/parent --> do nothing
		// the handles will be aborted on filter/sort calls
		if (this.mRequestHandles[sRequestKey]) {
			return;
		}

		function _handleSuccess (oData) {
			var oEntry, sKey, iIndex, i,
				// the function is used to test whether one of its ascendant is expanded after the selectAll
				fnTest = function(oNode, index) {
					if (!oNode.isDeepOne && !oNode.initiallyCollapsed && oNode.serverIndex < iIndex && oNode.serverIndex + oNode.magnitude >= iIndex) {
						return true;
					}
				};

			delete this.mRequestHandles[sRequestKey];

			// $inlinecount is in oData.__count, the $count is just oData
			if (!this._bLengthFinal) {
				var iCount = oData.__count ? parseInt(oData.__count, 10) : 0;
				this._aNodes[iCount - 1] = undefined;
				this._bLengthFinal = true;
			}

			//merge data into flat array structure
			if (oData.results && oData.results.length > 0) {
				for (i = 0; i < oData.results.length; i++) {

					oEntry = oData.results[i];
					sKey = this.oModel.getKey(oEntry);
					iIndex = iSkip + i;

					var iMagnitude = oEntry[this.oTreeProperties["hierarchy-node-descendant-count-for"]];
					// check the magnitude attribute whether it's greater or equal than 0
					if (iMagnitude < 0) {
						iMagnitude = 0;
						jQuery.sap.log.error("The entry data with key '" + sKey + "' under binding path '" + this.getPath() + "' has a negative 'hierarchy-node-descendant-count-for' which isn't allowed.");
					}

					var oNode = this._aNodes[iIndex] = this._aNodes[iIndex] || {
						key: sKey,
						context: this.oModel.getContext("/" + sKey),
						magnitude: iMagnitude,
						level: oEntry[this.oTreeProperties["hierarchy-level-for"]],
						originalLevel: oEntry[this.oTreeProperties["hierarchy-level-for"]],
						initiallyCollapsed: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "collapsed",
						nodeState: {
							isLeaf: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "leaf",
							expanded: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "expanded",
							collapsed: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "collapsed",
							selected: this._mSelected[sKey] ? this._mSelected[sKey].nodeState.selected : false
						},
						children: [],
						// an array containing all added subtrees, may be new context nodes or nodes which were removed previously
						addedSubtrees: [],
						serverIndex: iIndex,
						// a server indexed node is not attributed with a parent, in contrast to the manually expanded nodes
						parent: null
					};

					if (this._bSelectAll) {
						if (!this._aExpandedAfterSelectAll.some(fnTest)) {
							this.setNodeSelection(oNode, true);
						}
					}

				}
			}

			//register datareceived call as  callAfterUpdate
			this.oModel.callAfterUpdate(function() {
				this.fireDataReceived({data: oData});
			}.bind(this));

			this._fireChange({reason: ChangeReason.Change});
		}

		function _handleError (oError) {
			delete this.mRequestHandles[sRequestKey];

			var bAborted = oError.statusCode == 0;
			if (!bAborted) {
				// reset data and trigger update
				this._aNodes = [];
				this._bLengthFinal = true;
				this._fireChange({reason: ChangeReason.Change});
			}
			this.fireDataReceived();
		}

		var aUrlParameters = ["$skip=" + iSkip, "$top=" + iTop];

		// request inlinecount only once
		if (!this._bLengthFinal) {
			aUrlParameters.push("$inlinecount=allpages");
		}

		// add custom parameters (including $selects)
		if (this.sCustomParams) {
			aUrlParameters.push(this.sCustomParams);
		}

		this.fireDataRequested();

		// TODO: Add additional filters to the read call, as soon as back-end implementations support it
		// Something like this: aFilters = [new sap.ui.model.Filter([hierarchyFilters].concat(this.aFilters))];
		this.mRequestHandles[sRequestKey] = this.oModel.read(this.getPath(), {
			urlParameters: aUrlParameters,
			filters: [new sap.ui.model.Filter(this.oTreeProperties["hierarchy-level-for"], "LE", this.getNumberOfExpandedLevels())],
			sorters: this.aSorters || [],
			success: _handleSuccess.bind(this),
			error: _handleError.bind(this),
			groupId: this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId
		});
	};




	/**
	 * Loads the data based on a parent node filter.
	 */
	ODataTreeBindingFlat.prototype._loadChildren = function (oParentNode, iSkip, iTop) {

		var sRequestKey = "" + oParentNode.key + "-" + iSkip + "-" + iTop;

		// if we already queued up a request for the respective page do nothing
		// the handles will be aborted on filter/sort calls
		if (this.mRequestHandles[sRequestKey]) {
			return;
		}

		/**
		 * Success: Importing the data to the binding's data structures
		 */
		function _handleSuccess (oData) {

			delete this.mRequestHandles[sRequestKey];

			// $inlinecount is in oData.__count
			// $count is just the 'oData' argument
			if (oParentNode.childCount == undefined && oData && oData.__count) {
				var iCount = oData.__count ? parseInt(oData.__count, 10) : 0;
				oParentNode.childCount = iCount;
				oParentNode.children[iCount - 1] = undefined;

				// propagate the magnitude along the parent chain, up to the top parent which is a
				// server indexed node (checked by oParent.parent == null)
				// first magnitude starting point is the no. of direct children/the childCount
				var oParent = oParentNode;
				while (oParent != null && (oParent.initiallyCollapsed || oParent.isDeepOne)) {
					oParent.magnitude += iCount;
					//up one level, ends at parent == null
					oParent = oParent.parent;
				}

				// once when we reload data and know the direct-child count,
				// we have to keep track of the expanded state for the newly loaded nodes, so the length delta can be calculated
				this.cleanTreeStateMaps();
			}

			//merge data into flat array structure
			if (oData.results && oData.results.length > 0) {
				for (var i = 0; i < oData.results.length; i++) {

					var oEntry = oData.results[i];
					var sKey = this.oModel.getKey(oEntry);

					var oNode = oParentNode.children[iSkip + i] = oParentNode.children[iSkip + i] || {
						key: sKey,
						context: this.oModel.getContext("/" + sKey),
						//sub-child nodes have a magnitude of 0 at their first loading time
						magnitude: 0,
						//level is either given by the back-end or simply 1 level deeper than the parent
						level: oParentNode.level + 1,
						originalLevel: oParentNode.level + 1,
						initiallyCollapsed: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "collapsed",
						//node state is also given by the back-end
						nodeState: {
							isLeaf: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "leaf",
							expanded: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "expanded",
							collapsed: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "collapsed",
							selected: this._mSelected[sKey] ? this._mSelected[sKey].nodeState.selected : false
						},
						positionInParent: iSkip + i,
						children: [],
						// an array containing all added subtrees, may be new context nodes or nodes which were removed previously
						addedSubtrees: [],
						// a reference on the parent node, will only be set for manually expanded nodes, server-indexed node have a parent of null
						parent: oParentNode,
						// marks a node as a manually expanded one
						isDeepOne: true,
						// the child nodes have the same containing server index as the parent node
						containingServerIndex: oParentNode.containingServerIndex || oParentNode.serverIndex
					};

					if (this._bSelectAll && this._aExpandedAfterSelectAll.indexOf(oParentNode) === -1) {
						this.setNodeSelection(oNode, true);
					}
				}
			}

			//register datareceived call as  callAfterUpdate
			this.oModel.callAfterUpdate(function() {
				this.fireDataReceived({data: oData});
			}.bind(this));

			this._fireChange({reason: ChangeReason.Change});
		}

		/**
		 * Error: clear the respective parent node and fire the necessary events.
		 */
		function _handleError (oError) {
			delete this.mRequestHandles[sRequestKey];
			var bAborted = oError.statusCode == 0;
			if (!bAborted) {
				// reset data and trigger update
				if (oParentNode.childCount == undefined) {
					oParentNode.children = [];
					oParentNode.childCount = 0;
					this._fireChange({reason: ChangeReason.Change});
				}
			}
			this.fireDataReceived();
		}

		var aUrlParameters = ["$skip=" + iSkip, "$top=" + iTop];

		// request inlinecount only once
		if (oParentNode.childCount == undefined) {
			aUrlParameters.push("$inlinecount=allpages");
		}

		// add custom parameters (including $selects)
		if (this.sCustomParams) {
			aUrlParameters.push(this.sCustomParams);
		}

		this.fireDataRequested();

		// TODO: Add additional filters to the read call, as soon as back-end implementations support it
		// Something like this: aFilters = [new sap.ui.model.Filter([hierarchyFilters].concat(this.aFilters))];
		this.mRequestHandles[sRequestKey] = this.oModel.read(this.getPath(), {
			urlParameters: aUrlParameters,
			filters: [new sap.ui.model.Filter(this.oTreeProperties["hierarchy-parent-node-for"], "EQ", oParentNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]))],
			sorters: this.aSorters || [],
			success: _handleSuccess.bind(this),
			error: _handleError.bind(this),
			groupId: this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId
		});

	};

	/**
	 * Finds the node object sitting at iRowIndex.
	 * Does not directly correlate to the nodes position in its containing array.
	 */
	ODataTreeBindingFlat.prototype.findNode = function (iRowIndex) {
		return this._bReadOnly ? this._indexFindNode(iRowIndex) : this._mapFindNode(iRowIndex);
	};

	ODataTreeBindingFlat.prototype._mapFindNode = function (iRowIndex) {
		if (this.isInitial()) {
			return;
		}

		// first make a cache lookup
		var oFoundNode = this._aNodeCache[iRowIndex];
		if (oFoundNode) {
			return oFoundNode;
		}

		// find the node for the given index
		var iNodeCounter = -1;
		this._map(function (oNode, oRecursionBreaker, sIndexType, iIndex, oParent) {
			iNodeCounter++;

			if (iNodeCounter === iRowIndex) {
				oFoundNode = oNode;
				oRecursionBreaker.broken = true;
			}
		});

		return oFoundNode;
	};

	ODataTreeBindingFlat.prototype._indexFindNode = function (iRowIndex) {
		if (this.isInitial()) {
			return;
		}

		// first make a cache lookup
		var oNode = this._aNodeCache[iRowIndex];
		if (oNode) {
			return oNode;
		}

		var oNodeInfo = this.getNodeInfoByRowIndex(iRowIndex),
			oNode;

		if (oNodeInfo.parent) {
			oNode = oNodeInfo.parent.children[oNodeInfo.childIndex];
		} else {
			oNode = this._aNodes[oNodeInfo.index];
		}

		this._aNodeCache[iRowIndex] = oNode;

		return oNode;
	};

	/**
	 * Toggles a row index between expanded and collapsed.
	 */
	ODataTreeBindingFlat.prototype.toggleIndex = function(iRowIndex) {

		var oToggledNode = this.findNode(iRowIndex);
		jQuery.sap.assert(oToggledNode != undefined, "toggleIndex(" + iRowIndex + "): Node not found!");

		if (oToggledNode) {
			if (oToggledNode.nodeState.expanded) {
				this.collapse(oToggledNode);
			} else {
				this.expand(oToggledNode);
			}
		}
	};

	/**
	 * Expands a node or index.
	 * @param vRowIndex either an index or a node instance
	 * @param bSuppressChange if set to true, no change event will be fired
	 */
	ODataTreeBindingFlat.prototype.expand = function (vRowIndex, bSuppressChange) {
		var oToggledNode = vRowIndex;
		if (typeof vRowIndex !== "object") {
			oToggledNode = this.findNode(vRowIndex);
			jQuery.sap.assert(oToggledNode != undefined, "expand(" + vRowIndex + "): Node not found!");
		}

		//expand
		oToggledNode.nodeState.expanded = true;
		oToggledNode.nodeState.collapsed = false;

		// remove old tree state from the collapsed array if necessary
		// they are mutual exclusive
		var iTreeStateFound = this._aCollapsed.indexOf(oToggledNode);
		if (iTreeStateFound != -1) {
			this._aCollapsed.splice(iTreeStateFound, 1);
		}

		this._aExpanded.push(oToggledNode);
		this._sortNodes(this._aExpanded);

		// keep track of server-indexed node changes
		if (oToggledNode.serverIndex !== undefined) {
			this._aNodeChanges[oToggledNode.serverIndex] = true;
		}

		if (this._bSelectAll) {
			this._aExpandedAfterSelectAll.push(oToggledNode);
		}

		//trigger loading of the node if it is deeper than our initial level expansion
		if (oToggledNode.initiallyCollapsed && oToggledNode.childCount == undefined) {
			this._loadChildren(oToggledNode, 0, this._iPageSize);
		}

		// clean the tree state
		// this is necessary to make sure that previously collapsed-nodes which are now not contained anymore
		// will be regarded for length delta calculation.
		this.cleanTreeStateMaps();

		//clear cache since, otherwise subsequent getContextByIndex calls will look up a wrong entry
		this._aNodeCache = [];

		if (!bSuppressChange) {
			this._fireChange({reason: ChangeReason.Expand});
		}
	};

	/**
	 * Sets the number of expanded levels to the given level.
	 * @param iLevel the number of expanded levels
	 */
	ODataTreeBindingFlat.prototype.expandToLevel = function (iLevel) {
		if (iLevel > this.getNumberOfExpandedLevels()) {
			this.setNumberOfExpandedLevels(iLevel);
		}
	};

	/**
	 * Collapses the given node or index.
	 * @param vRowIndex either an index or a node instance
	 * @param bSuppressChange if set to true, there will be no change event fired
	 */
	ODataTreeBindingFlat.prototype.collapse = function (vRowIndex, bSuppressChange) {
		var oToggledNode = vRowIndex;
		if (typeof vRowIndex !== "object") {
			oToggledNode = this.findNode(vRowIndex);
			jQuery.sap.assert(oToggledNode != undefined, "expand(" + vRowIndex + "): Node not found!");
		}
		//collapse
		oToggledNode.nodeState.expanded = false;
		oToggledNode.nodeState.collapsed = true;

		// remove old tree state
		var iTreeStateFound = this._aExpanded.indexOf(oToggledNode);
		if (iTreeStateFound != -1) {
			this._aExpanded.splice(iTreeStateFound, 1);
		}

		// remove it from the select all expanded array
		if (this._bSelectAll) {
			iTreeStateFound = this._aExpandedAfterSelectAll.indexOf(oToggledNode);
			if (iTreeStateFound !== -1) {
				this._aExpandedAfterSelectAll.splice(iTreeStateFound, 1);
			}
		}

		this._aCollapsed.push(oToggledNode);
		this._sortNodes(this._aCollapsed);

		// keep track of server-indexed node changes
		if (oToggledNode.serverIndex !== undefined) {
			this._aNodeChanges[oToggledNode.serverIndex] = true;
		}

		//remove selection if the nodes are collapsed recursively
		//TODO: reset selection should be done even when !bCollapseRecursive???
		//TODO: replace _isInSubtree with something correctly consider the tree modification
		if (this.bCollapseRecursive) {
			for (var sKey in this._mSelected) {
				var oSelectedNode = this._mSelected[sKey];
				if (this._isInSubtree(oToggledNode, oSelectedNode)) {
					this.setNodeSelection(oSelectedNode, false);
				}
			}
		}

		// clean the tree state
		// this is necessary to make sure that previously collapsed-nodes which are now not contained anymore
		// will be regarded for length delta calculation.
		this.cleanTreeStateMaps();

		//clear cache since, otherwise subsequent getContextByIndex calls will look up a wrong entry
		this._aNodeCache = [];

		if (!bSuppressChange) {
			this._fireChange({reason: ChangeReason.Collapse});
		}
	};

	/**
	 * Sets the number of expanded levels to the given level.
	 * Makes sure to adapt the selection accordingly.
	 * @param iLevel the number of expanded levels
	 */
	ODataTreeBindingFlat.prototype.collapseToLevel = function (iLevel) {
		if (iLevel < this.getNumberOfExpandedLevels()) {

			if (this.bCollapseRecursive) {
				// first remove selection up to the given level
				for (var sKey in this._mSelected) {
					var oSelectedNode = this._mSelected[sKey];
					if (oSelectedNode.level > iLevel) {
						this.setNodeSelection(oSelectedNode, false);
					}
				}
			}

			this.setNumberOfExpandedLevels(iLevel);
		}
	};

	/**
	 * Checks if oNode is contained in the subtree starting with oSubtreeRoot.
	 * //TODO: replace _isInSubtree with something correctly consider the tree modification
	 * @private
	 */
	ODataTreeBindingFlat.prototype._isInSubtree  = function (oSubtreeRoot, oNode) {
		// server-indexed nodes can never be contained inside a deep subtree
		if (oSubtreeRoot.isDeepOne && !oNode.isDeepOne) {
			return false;
		}

		var oParent = oNode;

		if (oNode.isDeepOne) {
			do {
				oParent = oParent.parent;
				if (oParent === oSubtreeRoot) {
					return true;
				}
			} while (oParent.parent);
		}

		if (!oSubtreeRoot.isDeepOne && !oSubtreeRoot.initiallyCollapsed) {
			return (oSubtreeRoot.serverIndex < oParent.serverIndex && oSubtreeRoot.serverIndex + oSubtreeRoot.magnitude >= oParent.serverIndex);
		}

		return false;
	};

	/**
	 * Backtracking up the tree hierarchy.
	 * fnUp is called for all nodes.
	 * @param oNode the start node of the upwards traversal
	 * @param fnUp callback for the backtracking
	 * @param bOldParent a flag to specify if the new or old/original parent should be used for traversal
	 * @private
	 */
	ODataTreeBindingFlat.prototype._up = function(oNode, fnUp, bOldParent) {
		var oRecursionBreaker = {broken: false};

		var oParent = this._getParent(oNode, bOldParent);

		if (oParent) {
			this.structrualUp(oParent, fnUp, oRecursionBreaker, bOldParent);
		} else {
			this.flatUp(oNode, fnUp, oRecursionBreaker, true /*initial call*/);
		}
	};

	/**
	 * Backtrack in a deep part of the tree.
	 * @param oNode
	 * @param fnUp
	 * @param oBreaker
	 * @param bOldParent
	 * @private
	 */
	ODataTreeBindingFlat.prototype.structrualUp = function(oNode, fnUp, oBreaker, bOldParent) {
		var oParent = oNode;

		do {
			fnUp(oParent, oBreaker);
			if (oBreaker.broken) {
				return;
			}
			oNode = oParent;
			oParent = this._getParent(oParent);
		} while (oParent);

		this.flatUp(oNode, fnUp, oBreaker);
	};

	/**
	 * Backtrack in a flat part of the tree
	 * @param oNode
	 * @param fnUp
	 * @param oBreaker
	 * @param bInitial
	 * @private
	 */
	ODataTreeBindingFlat.prototype.flatUp = function(oNode, fnUp, oBreaker, bInitial) {
		var iServerIndex = oNode.serverIndex,
			i = bInitial ? iServerIndex - 1 : iServerIndex,
			oChangedNode, oParent;

		for (; i >= 0 ; i--) {
			if (this._aNodeChanges[i]) {
				oChangedNode = this._aNodes[i];
				if (oChangedNode.initiallyCollapsed) {
					// Initially collapsed node isn't relevant for the containment range check
					continue;
				}

				if (oChangedNode.serverIndex + oChangedNode.magnitude >= iServerIndex) {
					fnUp(oChangedNode, oBreaker);
					if (oBreaker.broken) {
						return;
					}
					oParent = this._getParent(oChangedNode);
					if (oParent) {
						this.structrualUp(oParent, fnUp, oBreaker);
						return;
					}
				} else {
					// the changed node is either a sibling or a node in a different sub-tree
					// we have to continue upwards to see if another (higher-up) subtree contains oNode
					continue;
				}
			}
		}
	};

	/**
	 * Retrieves the parent node of a node.
	 * Either the current parent or the original one set by initial the back-end request.
	 * @param oNode
	 * @param bOldParent if set to true, the original parent will be returned.
	 * @returns
	 */
	ODataTreeBindingFlat.prototype._getParent = function(oNode, bOldParent) {
		return bOldParent ? oNode.originalParent : oNode.parent;
	};

	/**
	 * Makes sure that the collapsed and expanded maps/arrays are correctly sanitized,
	 * by sorting them accordingly and moving the correct nodes
	 * @param {object} oNode the node which will be removed from the respective maps
	 */
	ODataTreeBindingFlat.prototype.cleanTreeStateMaps = function () {
		this._iLengthDelta = this._bReadOnly ? this._indexCleanTreeStateMaps() : this._mapCleanTreeStateMaps();
	};

	ODataTreeBindingFlat.prototype._indexCleanTreeStateMaps = function () {
		return this._calcIndexDelta(this._aNodes.length);
	};

	ODataTreeBindingFlat.prototype._mapCleanTreeStateMaps = function () {
		var aAllChangedNodes = this._aCollapsed.concat(this._aRemoved).concat(this._aExpanded).concat(this._aAdded),
			// a flag to indicate if the currently processed node is visible
			// initially true for each node, but might be set to false via side-effect through fnCheckVisible.
			bVisible = true,
			bVisibleNewParent,
			iDelta = 0,
			fnCheckVisible = function(oNode, oBreaker) {
				if (oNode.nodeState.collapsed || (oNode.nodeState.removed && !oNode.nodeState.reinserted)) {
					bVisible = false;
					oBreaker.broken = true;
				}
			},
			mSeenNodes = {};

		/**
		 * Visibility Check Matrix:
		 * VO = Visible in Old Parent
		 * VN = Visible in New Parent
		 * Delta-Sign, the sign which is used to determine if the magnitude should be added, substracted OR ignored.
		 *
		 *  VO | VN | Delta-Sign
		 * ----|----|-----------
		 *   1 |  1 |      0
		 *   1 |  0 |     -1
		 *   0 |  1 |     +1
		 *   0 |  0 |      0
		 */
		var aCheckMatrix = [[0, 1], [-1, 0]];

		aAllChangedNodes.forEach(function(oNode) {

			// ignore duplicate entries, e.g. collapsed and removed/re-inserted
			if (mSeenNodes[oNode.key]) {
				return;
			} else {
				mSeenNodes[oNode.key] = true;
			}

			// if the node is newly added and still has a parent node
			if (oNode.nodeState.added) {
				if (!oNode.nodeState.removed || oNode.nodeState.reinserted) {
					bVisible = true;
					// check whether it's visible under the current parent
					// even when it's moved to a new parent, only the new parent needs to be considered because the newly added node doesn't
					// have any contribution to the magnitude of the old parent.
					this._up(oNode, fnCheckVisible, false /*current/new parent*/);

					if (bVisible) {
						iDelta++;
					}
				}
			} else {
				if (oNode.nodeState.collapsed || oNode.nodeState.expanded || oNode.nodeState.removed) {
					bVisible = true;
					this._up(oNode, fnCheckVisible, false /* current/new parent */);
					// if the node isn't hidden by one of its current ancestors
					if (bVisible) {
						// if the node is removed and not reinserted, its children and itself should be substracted
						if (oNode.nodeState.removed && !oNode.nodeState.reinserted) {
							// deep or initiallyCollapsed nodes only substract themselves.
							if (oNode.isDeepOne || oNode.initiallyCollapsed) {
								iDelta -= 1;
							} else {
								// server indexed nodes always subtract their magnitude
								iDelta -= (oNode.magnitude + 1);
							}
						} else {
							// if the node which is expanded after the initial loading is collapsed, its magnitude needs to be substracted.
							if (oNode.nodeState.collapsed && oNode.serverIndex !== undefined && !oNode.initiallyCollapsed) {
								iDelta -= oNode.magnitude;
							}
							// if the node which is manually expanded after the initial loading, its direct children length (not magnitude) needs to be added
							if (oNode.nodeState.expanded && (oNode.isDeepOne || oNode.initiallyCollapsed)) {
								iDelta += oNode.children.length;
							}
						}
					}
					if (oNode.nodeState.reinserted) {
						// if it's reinserted, check it's visibility between the new and old parent. Then decide how it influences the delta.
						bVisibleNewParent = bVisible;
						bVisible = true;
						this._up(oNode, fnCheckVisible, true /*old parent*/);
						var iVisibilityFactor = (aCheckMatrix[bVisible | 0][bVisibleNewParent | 0]);
						// iVisibilityFactor is either 0, 1 or -1.
						// 1 and -1 are the relevant factors here, otherwise the node is not visible
						if (!!iVisibilityFactor) {
							if (oNode.isDeepOne) {
								iDelta += iVisibilityFactor * 1;
							} else {
								// re-inserted visible nodes, which are initially collapsed only contribute to the length +1
								// they only count themselves, their children have already been added (if they were visible)
								if (oNode.initiallyCollapsed) {
									iDelta += iVisibilityFactor;
								} else {
									iDelta += iVisibilityFactor * (1 + oNode.magnitude);
								}
							}
						}
					}
				}
			}
		}.bind(this));

		return iDelta;
	};

	/**
	 * Returns if the count was received already and we know how many entries there will be in total.
	 */
	ODataTreeBindingFlat.prototype.isLengthFinal = function () {
		return this._bLengthFinal;
	};

	/**
	 * The length of the binding regards the expanded state of the tree.
	 * So the length is the direct length of the tables scrollbar.
	 */
	ODataTreeBindingFlat.prototype.getLength = function () {
		return this._aNodes.length + this._iLengthDelta;
	};

	/**
	 * Retrieves the context for a given index.
	 */
	ODataTreeBindingFlat.prototype.getContextByIndex = function (iRowIndex) {
		if (this.isInitial()) {
			return;
		}

		var oNode = this.findNode(iRowIndex);

		return oNode && oNode.context;
	};


	/**
	 * Checks if an index is expanded
	 */
	ODataTreeBindingFlat.prototype.isExpanded = function(iRowIndex) {
		var oNode = this.findNode(iRowIndex);
		return oNode && oNode.nodeState.expanded;
	};

	/**
	 * Returns if a node has children.
	 * This does not mean, the children have to be loaded or the node has to be expanded.
	 * If the node is a leaf it has not children, otherwise the function returns true.
	 */
	ODataTreeBindingFlat.prototype.hasChildren = function(oContext) {
		if (!oContext) {
			return false;
		}

		var sDrilldownState = oContext.getProperty(this.oTreeProperties["hierarchy-drill-state-for"]);
		return sDrilldownState !== "leaf";
	};

	//*************************************************
	//*               Selection-Handling              *
	//************************************************/

	/**
	 * Sets the selection state of the given node.
	 * @param {object} oNodeState the node state for which the selection should be changed
	 * @param {boolean} bIsSelected the selection state for the given node
	 */
	ODataTreeBindingFlat.prototype.setNodeSelection = function (oNode, bIsSelected) {

		jQuery.sap.assert(oNode, "Node must be defined!");

		oNode.nodeState.selected = bIsSelected;

		// toggles the selection state based on bIsSelected
		if (bIsSelected) {
			this._mSelected[oNode.key] = oNode;
		} else {
			delete this._mSelected[oNode.key];
			if (oNode.key === this._sLeadSelectionKey) {
				// if the lead selection node is deselected, clear the _sLeadSelectionKey
				this._sLeadSelectionKey = null;
			}
		}
	};

	/**
	 * Returns the selection state for the node at the given index.
	 * @param {int} iRowIndex the row index to check for selection state
	 */
	ODataTreeBindingFlat.prototype.isIndexSelected = function (iRowIndex) {
		var oNode = this.findNode(iRowIndex);
		return oNode && oNode.nodeState ? oNode.nodeState.selected : false;
	};

	/**
	 * Returns if the node at the given index is selectable.
	 * Always true for TreeTable controls, except the node is not defined.
	 * @param {int} iRowIndex the row index which should be checked for "selectability"
	 */
	ODataTreeBindingFlat.prototype.isIndexSelectable = function (iRowIndex) {
		var oNode = this.findNode(iRowIndex);
		return !!oNode;
	};

	/**
	 * Removes the selection from all nodes
	 * @private
	 */
	ODataTreeBindingFlat.prototype._clearSelection = function () {
		return this._bReadOnly ? this._indexClearSelection() : this._mapClearSelection();
	};

	ODataTreeBindingFlat.prototype._indexClearSelection = function () {
		var iOldLeadIndex = -1,
			aChangedIndices = [],
			sSelectedKey, oNode, iRowIndex;

		this._bSelectAll = false;
		this._aExpandedAfterSelectAll = [];

		for (sSelectedKey in this._mSelected) {
			oNode = this._mSelected[sSelectedKey];
			this.setNodeSelection(oNode, false);

			iRowIndex = this.getRowIndexByNode(oNode);
			aChangedIndices.push(iRowIndex);
			// find old lead selection index
			if (this._sLeadSelectionKey == sSelectedKey) {
				iOldLeadIndex = iRowIndex;
			}
		}

		return {
			rowIndices: aChangedIndices,
			oldIndex: iOldLeadIndex,
			leadIndex: -1
		};
	};

	ODataTreeBindingFlat.prototype._mapClearSelection = function () {
		var iNodeCounter = -1;
		var iOldLeadIndex = -1;
		var iMaxNumberOfSelectedNodes = 0;

		var aChangedIndices = [];

		this._bSelectAll = false;
		this._aExpandedAfterSelectAll = [];

		// Optimisation: find out how many nodes we have to check for deselection
		for (var sKey in this._mSelected) {
			if (sKey) {
				iMaxNumberOfSelectedNodes++;
			}
		}

		// collect all selected nodes and switch them to deselected
		this._map(function (oNode, oRecursionBreaker, sIndexType, iIndex, oParent) {
			iNodeCounter++;
			if (oNode && oNode.nodeState.selected) {
				this.setNodeSelection(oNode, false);
				aChangedIndices.push(iNodeCounter);
				//find old lead selection index
				if (this._sLeadSelectionKey == oNode.key) {
					iOldLeadIndex = iNodeCounter;
				}

				if (aChangedIndices.length == iMaxNumberOfSelectedNodes) {
					oRecursionBreaker.broken = true;
				}
			}
		}.bind(this));

		return {
			rowIndices: aChangedIndices,
			oldIndex: iOldLeadIndex,
			leadIndex: -1
		};
	};

	/**
	 * Marks a single TreeTable node sitting on iRowIndex as selected.
	 * Also sets the lead selection index to this node.
	 * @param {int} iRowIndex the absolute row index which should be selected
	 */
	ODataTreeBindingFlat.prototype.setSelectedIndex = function (iRowIndex) {
		var oNode = this.findNode(iRowIndex);

		if (oNode) {
			// clear and fetch the changes on the selection
			var oChanges = this._clearSelection();

			// if the selected row index was already selected before -> remove it from the changed Indices from the clearSection() call
			var iChangedIndex = oChanges.rowIndices.indexOf(iRowIndex);
			if (iChangedIndex >= 0) {
				oChanges.rowIndices.splice(iChangedIndex, 1);
			} else {
				// the newly selcted index is missing and also has to be propagated via the event params
				oChanges.rowIndices.push(iRowIndex);
			}

			//set the new lead index
			oChanges.leadKey = oNode.key;
			oChanges.leadIndex = iRowIndex;

			this.setNodeSelection(oNode, true);

			this._publishSelectionChanges(oChanges);
		} else {
			jQuery.sap.log.warning("ODataTreeBindingFlat: The selection of index '" + iRowIndex + "' was ignored. Please make sure to only select rows, for which data has been fetched to the client.");
		}
	};

	/**
	 * Retrieves the "Lead-Selection-Index"
	 * Normally this is the last selected node/table row.
	 * @return {int} returns the lead selection index or -1 if none is set
	 */
	ODataTreeBindingFlat.prototype.getSelectedIndex = function () {
		return this._bReadOnly ? this._indexGetSelectedIndex() : this._mapGetSelectedIndex();
	};

	ODataTreeBindingFlat.prototype._indexGetSelectedIndex = function () {
		//if we have no nodes selected, the lead selection index is -1
		if (!this._sLeadSelectionKey || jQuery.isEmptyObject(this._mSelected)) {
			return -1;
		}

		var oSelectedNode = this._mSelected[this._sLeadSelectionKey];

		if (oSelectedNode) {
			return this.getRowIndexByNode(oSelectedNode);
		} else {
			return -1;
		}
	};

	ODataTreeBindingFlat.prototype._mapGetSelectedIndex = function () {
		//if we have no nodes selected, the lead selection index is -1
		if (!this._sLeadSelectionKey || jQuery.isEmptyObject(this._mSelected)) {
			return -1;
		}

		// find the index of the current lead-selection node
		var iNodeCounter = -1;
		this._map(function (oNode, oRecursionBreaker) {
			iNodeCounter++;
			if (oNode) {
				if (oNode.key === this._sLeadSelectionKey) {
					oRecursionBreaker.broken = true;
				}
			}
		}.bind(this));

		return iNodeCounter;
	};

	/**
	 * Returns an array with all selected row indices.
	 * Only absolute row indices for nodes known to the client will can be retrieved this way
	 * @return {int[]} an array with all selected indices
	 */
	ODataTreeBindingFlat.prototype.getSelectedIndices = function () {
		return this._bReadOnly ? this._indexGetSelectedIndices() : this._mapGetSelectedIndices();
	};

	ODataTreeBindingFlat.prototype._indexGetSelectedIndices = function () {
		var aNodesInfo = this._getSelectedNodesInfo();

		return aNodesInfo.map(function(oNodeInfo) {
			return oNodeInfo.rowIndex;
		});
	};

	ODataTreeBindingFlat.prototype._mapGetSelectedIndices = function () {
		var aResultIndices = [];

		//if we have no nodes selected, the selection indices are empty
		if (jQuery.isEmptyObject(this._mSelected)) {
			return aResultIndices;
		}

		// collect the indices of all selected nodes
		var iNodeCounter = -1;
		this._map(function (oNode) {
			iNodeCounter++;
			if (oNode) {
				if (oNode.nodeState && oNode.nodeState.selected) {
					aResultIndices.push(iNodeCounter);
				}
			}
		});

		return aResultIndices;
	};

	/**
	 * Returns the number of selected nodes.
	 * @private
	 * @returns {int} number of selected nodes.
	 */
	ODataTreeBindingFlat.prototype.getSelectedNodesCount = function () {
		return Object.keys(this._mSelected).length;
	};

	/**
	 * Returns an array containing all selected contexts, ordered by their appearance in the tree.
	 * @return {sap.ui.model.Context[]} an array containing the binding contexts for all selected nodes
	 */
	ODataTreeBindingFlat.prototype.getSelectedContexts = function () {
		return this._bReadOnly ? this._indexGetSelectedContexts() : this._mapGetSelectedContexts();
	};

	ODataTreeBindingFlat.prototype._indexGetSelectedContexts = function () {
		var aNodesInfo = this._getSelectedNodesInfo();

		return aNodesInfo.map(function(oNodeInfo) {
			return oNodeInfo.node.context;
		});
	};

	/**
	 * Returns an array containing all selected contexts, ordered by their appearance in the tree.
	 * @return {sap.ui.model.Context[]} an array containing the binding contexts for all selected nodes
	 */
	ODataTreeBindingFlat.prototype._mapGetSelectedContexts = function () {
		var aResultContexts = [];

		//if we have no nodes selected, the selection indices are empty
		if (jQuery.isEmptyObject(this._mSelected)) {
			return aResultContexts;
		}

		// collect the indices of all selected nodes
		var fnMatchFunction = function (oNode) {
			if (oNode) {
				if (oNode.nodeState.selected && !oNode.isArtificial) {
					aResultContexts.push(oNode.context);
				}
			}
		};

		this._map(this._oRootNode, fnMatchFunction);

		return aResultContexts;
	};

	/**
	 * Sets the selection to the range from iFromIndex to iToIndex (including boundaries).
	 * e.g. setSelectionInterval(1,3) marks the rows 1,2 and 3.
	 * All currently selected rows will be deselected in the process.
	 * A selectionChanged event is fired
	 */
	ODataTreeBindingFlat.prototype.setSelectionInterval = function (iFromIndex, iToIndex) {
		// clears the selection but suppresses the selection change event
		var mClearParams = this._clearSelection();
		// the addSelectionInterval function takes care of the selection change event
		var mSetParams = this._setSelectionInterval(iFromIndex, iToIndex, true);

		var mIndicesFound = {};
		var aRowIndices = [];
		var iIndex;

		// flag all cleared indices as changed
		for (var i = 0; i < mClearParams.rowIndices.length; i++) {
			iIndex = mClearParams.rowIndices[i];
			mIndicesFound[iIndex] = true;
		}

		// now merge the changed indices after clearing with the newly selected
		// duplicate indices mean, that the index was previously selected and is now still selected -> remove it from the changes
		for (i = 0; i < mSetParams.rowIndices.length; i++) {
			iIndex = mSetParams.rowIndices[i];
			if (mIndicesFound[iIndex]) {
				delete mIndicesFound[iIndex];
			} else {
				mIndicesFound[iIndex] = true;
			}
		}
		// transform the changed index MAP into a real array of indices
		for (iIndex in mIndicesFound) {
			if (mIndicesFound[iIndex]) {
				aRowIndices.push(parseInt(iIndex, 10));
			}
		}

		//and fire the event
		this._publishSelectionChanges({
			rowIndices: aRowIndices,
			oldIndex: mClearParams.oldIndex,
			leadIndex: mSetParams.leadIndex,
			leadKey: mSetParams.leadKey
		});
	};

	/**
	 * Sets the value inside the given range to the value given with 'bSelectionValue'
	 * @private
	 * @param {int} iFromIndex the starting index of the selection range
	 * @param {int} iToIndex the end index of the selection range
	 * @param {boolean} bSelectionValue the selection state which should be applied to all indices between 'from' and 'to' index
	 */
	ODataTreeBindingFlat.prototype._setSelectionInterval = function (iFromIndex, iToIndex, bSelectionValue) {
		return this._bReadOnly ? this._indexSetSelectionInterval(iFromIndex, iToIndex, bSelectionValue) : this._mapSetSelectionInterval(iFromIndex, iToIndex, bSelectionValue);
	};

	ODataTreeBindingFlat.prototype._indexSetSelectionInterval = function (iFromIndex, iToIndex, bSelectionValue) {
		//make sure the "From" Index is always lower than the "To" Index
		var iNewFromIndex = Math.min(iFromIndex, iToIndex),
			iNewToIndex = Math.max(iFromIndex, iToIndex),
			aNewlySelectedNodes = [],
			aChangedIndices = [],
			// the old lead index, might be undefined -> publishSelectionChanges() will set it to -1
			iOldLeadIndex,
			oNode, i, mParams;

		bSelectionValue = !!bSelectionValue;

		for (i = iNewFromIndex ; i <= iNewToIndex ; i++) {
			oNode = this.findNode(i);

			if (oNode) {
				// fetch the node index if its selection state changes
				if (oNode.nodeState.selected !== bSelectionValue) {
					aChangedIndices.push(i);
				}

				// remember the old lead selection index if we encounter it
				// (might not happen if the lead selection is outside the newly set range)
				if (oNode.key === this._sLeadSelectionKey) {
					iOldLeadIndex = i;
				}

				// select/deselect node, but suppress the selection change event
				this.setNodeSelection(oNode, bSelectionValue);
				aNewlySelectedNodes.push(oNode);
			}
		}

		mParams = {
			rowIndices: aChangedIndices,
			oldIndex: iOldLeadIndex,
			// if we found a lead index during tree traversal and we deselected it -> the new lead selection index is -1
			leadIndex: iOldLeadIndex && !bSelectionValue ? -1 : undefined
		};

		// set new lead selection node if necessary
		if (aNewlySelectedNodes.length > 0 && bSelectionValue) {
			mParams.leadKey = aNewlySelectedNodes[aNewlySelectedNodes.length - 1].key;
			mParams.leadIndex = iNewToIndex;
		}

		return mParams;
	};

	ODataTreeBindingFlat.prototype._mapSetSelectionInterval = function (iFromIndex, iToIndex, bSelectionValue) {
		//make sure the "From" Index is always lower than the "To" Index
		var iNewFromIndex = Math.min(iFromIndex, iToIndex);
		var iNewToIndex = Math.max(iFromIndex, iToIndex);

		//find out how many nodes should be selected, this is a termination condition for the match function
		var aNewlySelectedNodes = [];
		var aChangedIndices = [];
		var iNumberOfNodesToSelect = Math.abs(iNewToIndex - iNewFromIndex) + 1; //+1 because the boundary indices are included

		// the old lead index, might be undefined -> publishSelectionChanges() will set it to -1
		var iOldLeadIndex;

		// loop through all nodes and select them if necessary
		var iNodeCounter = -1;
		var fnMapFunction = function (oNode, oRecursionBreaker, sIndexType, iIndex, oParent) {

			// do not count the artificial root node
			if (!oNode) {
				iNodeCounter++;
			}

			if (oNode) {
				//if the node is inside the range -> select it
				if (iNodeCounter >= iNewFromIndex && iNodeCounter <= iNewToIndex) {

					if (oNode) {
						// fetch the node index if its selection state changes
						if (oNode.nodeState.selected !== !!bSelectionValue) {
							aChangedIndices.push(iNodeCounter);
						}

						// remember the old lead selection index if we encounter it
						// (might not happen if the lead selection is outside the newly set range)
						if (oNode.key === this._sLeadSelectionKey) {
							iOldLeadIndex = iNodeCounter;
						}

						// select/deselect node, but suppress the selection change event
						this.setNodeSelection(oNode, !!bSelectionValue);
						aNewlySelectedNodes.push(oNode);

						if (aNewlySelectedNodes.length === iNumberOfNodesToSelect) {
							oRecursionBreaker.broken = true;
						}
					}
				}
			}

		}.bind(this);

		this._map(fnMapFunction);

		var mParams = {
			rowIndices: aChangedIndices,
			oldIndex: iOldLeadIndex,
			//if we found a lead index during tree traversal and we deselected it -> the new lead selection index is -1
			leadIndex: iOldLeadIndex && !bSelectionValue ? -1 : undefined
		};

		// set new lead selection node if necessary
		if (aNewlySelectedNodes.length > 0 && bSelectionValue){
			var oLeadSelectionNode = aNewlySelectedNodes[aNewlySelectedNodes.length - 1];
			mParams.leadKey = oLeadSelectionNode.key;
			mParams.leadIndex = iNewToIndex;
		}

		return mParams;
	};

	/**
	 * Marks a range of tree nodes as selected/deselected, starting with iFromIndex going to iToIndex.
	 * The TreeNodes are referenced via their absolute row index.
	 * Please be aware, that the absolute row index only applies to the the tree which is visualized by the TreeTable.
	 * Invisible nodes (collapsed child nodes) will not be regarded.
	 */
	ODataTreeBindingFlat.prototype.addSelectionInterval = function (iFromIndex, iToIndex) {
		var mParams = this._setSelectionInterval(iFromIndex, iToIndex, true);
		this._publishSelectionChanges(mParams);
	};

	/**
	 * Removes the selections inside the given range (including boundaries)
	 */
	ODataTreeBindingFlat.prototype.removeSelectionInterval = function (iFromIndex, iToIndex) {
		var mParams = this._setSelectionInterval(iFromIndex, iToIndex, false);
		this._publishSelectionChanges(mParams);
	};

	/**
	 * Selects all avaliable nodes
	 */
	ODataTreeBindingFlat.prototype.selectAll = function () {
		this._bReadOnly ? this._indexSelectAll() : this._mapSelectAll();
	};

	ODataTreeBindingFlat.prototype._indexSelectAll = function () {
		// mark the tree as in selectAll mode
		this._bSelectAll = true;
		this._aExpandedAfterSelectAll = [];

		var mParams = {
			rowIndices: [],
			oldIndex: -1,
			selectAll: true
		};

		var iLength = this.getLength(),
			i, oNode;

		for (i = 0 ; i < iLength; i++) {
			oNode = this.findNode(i);
			if (oNode && !oNode.isArtificial) {
				//if we find the old lead selection index -> keep it, safes some performance later on
				if (oNode.key === this._sLeadSelectionKey) {
					mParams.oldIndex = i;
				}

				//if a node is NOT selected (and is not our artificial root node...)
				if (!oNode.nodeState.selected) {
					mParams.rowIndices.push(i);
				}
				this.setNodeSelection(oNode, true);

				// keep track of the last selected node -> this will be the new lead index
				mParams.leadKey = oNode.key;
				mParams.leadIndex = i;
			}
		}

		this._publishSelectionChanges(mParams);
	};

	ODataTreeBindingFlat.prototype._mapSelectAll = function () {
		// mark the tree as in selectAll mode
		this._bSelectAll = true;
		this._aExpandedAfterSelectAll = [];

		var mParams = {
			rowIndices: [],
			oldIndex: -1,
			selectAll: true
		};

		// recursion variables
		var iNodeCounter = -1;

		this._map(function (oNode) {

			if (!oNode || !oNode.isArtificial) {
				iNodeCounter++;
			}

			if (oNode) {

				//if we find the old lead selection index -> keep it, safes some performance later on
				if (oNode.key === this._sLeadSelectionKey) {
					mParams.oldIndex = iNodeCounter;
				}

				if (oNode) {
					//if a node is NOT selected (and is not our artificial root node...)
					if (!oNode.isArtificial && !oNode.nodeState.selected) {
						mParams.rowIndices.push(iNodeCounter);
					}
					this.setNodeSelection(oNode, true);

					// keep track of the last selected node -> this will be the new lead index
					mParams.leadKey = oNode.key;
					mParams.leadIndex = iNodeCounter;
				}
			}
		}.bind(this));

		this._publishSelectionChanges(mParams);
	};

	/**
	 * Removes the complete selection.
	 * @param {boolean} bSuppressSelectionChangeEvent if this is set to true, no selectionChange event will be fired
	 */
	ODataTreeBindingFlat.prototype.clearSelection = function (bSuppresSelectionChangeEvent) {
		var oChanges = this._clearSelection();

		// check if the selection change event should be suppressed
		if (!bSuppresSelectionChangeEvent) {
			this._publishSelectionChanges(oChanges);
		}
	};

	/**
	 * Fires a "selectionChanged" event with the given parameters.
	 * Also performs a sanity check on the parameters.
	 */
	ODataTreeBindingFlat.prototype._publishSelectionChanges = function (mParams) {

		// retrieve the current (old) lead selection and add it to the changed row indices if necessary
		mParams.oldIndex = mParams.oldIndex || this.getSelectedIndex();

		//sort row indices ascending
		mParams.rowIndices.sort(function(a, b) {
			return a - b;
		});

		//set the lead selection index
		if (mParams.leadIndex >= 0 && mParams.leadKey) {
			//keep track of a newly set lead index
			this._sLeadSelectionKey = mParams.leadKey;
		} else if (mParams.leadIndex === -1){
			// explicitly remove the lead index
			this._sLeadSelectionKey = undefined;
		} else {
			//nothing changed, lead and old index are the same
			mParams.leadIndex = mParams.oldIndex;
		}

		//only fire event if the selection actually changed somehow
		if (mParams.rowIndices.length > 0 || (mParams.leadIndex != undefined && mParams.leadIndex !== -1)) {
			this.fireSelectionChanged(mParams);
		}
	};

	/**
	 * Sets the node hierarchy to collapse recursive. When set to true, all child nodes will get collapsed as well.
	 * @param {boolean} bCollapseRecursive
	 */
	ODataTreeBindingFlat.prototype.setCollapseRecursive = function (bCollapseRecursive) {
		this.bCollapseRecursive = !!bCollapseRecursive;
	};

	/**
	 * Reset the bindings internal data structures.
	 */
	ODataTreeBindingFlat.prototype.resetData = function () {
		ODataTreeBinding.prototype.resetData.apply(this, arguments);

		this._aNodes = [];

		this._aCollapsed = [];
		this._aExpanded = [];
		this._aExpandedAfterSelectAll = [];
		this._aRowIndexMap = [];

		this._aRemoved = [];

		this._aNodeChanges = [];

		this._bLengthFinal = false;

		this._bSelectAll = false;

		// the delta variable for calculating the correct binding-length (used e.g. for sizing the scrollbar)
		this._iLengthDelta = 0;
	};

	/**
	 * Finds a node for the given context object.
	 */
	ODataTreeBindingFlat.prototype._findNodeByContext = function (oContext) {
		var iNodeCounter = -1;
		var oNodeForContext;

		// find the node for the given context
		// TODO: Make a nodes cache look-up first
		this._map(function (oNode, oRecursionBreaker, sIndexType, iIndex, oParent) {
			iNodeCounter++;
			if (oNode) {
				if (oNode.context === oContext) {
					oNodeForContext = oNode;
					oRecursionBreaker.broken = true;
				}
			}
		});

		return {
			node: oNodeForContext,
			index: iNodeCounter
		};
	};

	/**
	 * @see sap.ui.model.odata.v2.ODataTreebinding#addContexts
	 */
	ODataTreeBindingFlat.prototype.addContexts = function (oParentContext, vContextHandles) {
		var oNodeInfo = this._findNodeByContext(oParentContext),
			oNewParentNode = oNodeInfo.node,
			oModel = this.getModel(),
			bIsSubtreeHandle,
			oNewHandle,
			oContext;

		jQuery.sap.assert(oParentContext && vContextHandles, "ODataTreeBinding.addContexts was called with incomplete arguments!");

		if (oNewParentNode) {
			this._bReadOnly = false;

			if (oNewParentNode.nodeState && oNewParentNode.nodeState.isLeaf) {
				// if a node is marked as a leaf, the node should be marked as collapsed after getting a child.
				oNewParentNode.nodeState.isLeaf = false;
				oNewParentNode.nodeState.collapsed = true;
				oModel.setProperty(this.oTreeProperties["hierarchy-drill-state-for"], "collapsed", oParentContext);
			}

			bIsSubtreeHandle = !!vContextHandles._isRemovedSubtree;
			oNewHandle = vContextHandles;

			// handle is a subtree and not a flat array of new child contexts
			if (bIsSubtreeHandle) {
				// set the parent node for the newly inserted sub-tree to match the new parent
				oNewHandle._oNewParentNode = oNewParentNode;

				// mark the node as reinserted if it was previously removed
				oNewHandle._oSubtreeRoot.nodeState.reinserted = true;

				// keep track of the new and the original parent of a reinserted node
				oNewHandle._oSubtreeRoot.originalParent = oNewHandle._oSubtreeRoot.originalParent || oNewHandle._oSubtreeRoot.parent;
				oNewHandle._oSubtreeRoot.parent = oNewParentNode;

				// cyclic reference from the subtreeRoot to the subtreeHandle
				// --> used for removing the subtreeHandle from the addedSubtree collection of the new parent node (in #removeContexts())
				oNewHandle._oSubtreeRoot.containingSubtreeHandle = oNewHandle;

			} else {
				// vContextHandles is an array, so we do not have any nodes yet
				if (vContextHandles.length > 0) {

					// transform the new contexts into nodes
					for (var i = 0; i < vContextHandles.length; i++) {
						oContext = vContextHandles[i];
						vContextHandles[i] = {
							context: oContext,
							key: oModel.getKey(oContext),
							parent: oNewParentNode,
							nodeState: {
								isLeaf: true, // by default is the context is a leaf
								collapsed: false,
								expanded: false,
								selected: false,
								added: true // mark the node as newly added
							},
							addedSubtrees: [],
							children: [],
							magnitude: 0
							// the level information will be maintained during the tree traversing
						};
						this._aAdded.push(vContextHandles[i]);
					}

					// push the newly added subtree to the parent node
					oNewHandle = {
						_getSubtree: function () {
							return vContextHandles;
						},
						_oSubtreeRoot: null, // no subtree root if the contexts are newly inserted
						_oNewParentNode: oNewParentNode
					};
				} else {
					jQuery.sap.log.warning("ODataTreeBinding.addContexts() was called with an empty array.");
					return;
				}
			}

			// update containing-server index for the newly added subtree
			// TODO: Check if this information can be used productively, right now it's only used for debugging
			oNewHandle._iContainingServerIndex = oNewParentNode.serverIndex || oNewParentNode.containingServerIndex;

			oNewParentNode.addedSubtrees.unshift(oNewHandle);

			// keep track of server-indexed node changes
			if (oNewParentNode.serverIndex !== undefined) {
				this._aNodeChanges[oNewParentNode.serverIndex] = true;
			}

			// clear cache to make sure findNode etc. don't deliver wrong nodes (index is shifted due to adding)
			this._aNodeCache = [];

			this.cleanTreeStateMaps();

			this._fireChange({reason: ChangeReason.Add});
		} else {
			jQuery.sap.log.warning("The given parent context could not be found in the tree. No new sub-nodes were added!");
		}
	};

	/**
	 * @see sap.ui.model.odata.v2.ODataTreebinding#removeContext
	 */
	ODataTreeBindingFlat.prototype.removeContext = function (oContext) {
		var that = this;

		var oNodeInfo = this._findNodeByContext(oContext);
		var oNodeForContext = oNodeInfo.node;
		var iIndex = oNodeInfo.index;

		if (oNodeForContext) {
			this._bReadOnly = false;

			// mark the node as removed so the _map function will not regard it anymore
			oNodeForContext.nodeState.removed = true;

			// remove selection for removed context
			// TODO: Do this for the whole subtree
			this.setNodeSelection(oNodeForContext, false);

			this._aRemoved.push(oNodeForContext);

			// keep track of server-indexed node changes
			if (oNodeForContext.serverIndex !== undefined) {
				this._aNodeChanges[oNodeForContext.serverIndex] = true;
			}

			// node is the root of a removed/re-inserted subtree (handle)
			// remove node from its new parent's addSubtrees collection (otherwise the node will still be rendered)
			if (oNodeForContext.containingSubtreeHandle && oNodeForContext.parent != null) {
				var iNewParentIndex = oNodeForContext.parent.addedSubtrees.indexOf(oNodeForContext.containingSubtreeHandle);
				if (iNewParentIndex != -1) {
					oNodeForContext.parent.addedSubtrees.splice(iNewParentIndex, 1);
					oNodeForContext.nodeState.reinserted = false;
					//TODO: Is reseting the parent a correct way to remove the node/subtree from the whole tree?
					oNodeForContext.parent = null;
				}
			}

			// clear cache to make sure findNode etc. don't deliver wrong nodes (index is shifted due to adding)
			this._aNodeCache = [];
			this.cleanTreeStateMaps();

			this._fireChange({reason: ChangeReason.Remove});

			// Subtree Handle API
			return {
				_removedFromVisualIndex: iIndex,
				_isRemovedSubtree: true,
				_oSubtreeRoot: oNodeForContext,
				_getSubtree: function () {
					if (oNodeForContext.serverIndex != undefined && !oNodeForContext.initiallyCollapsed) {
						//returns the nodes flat starting from the parent to the last one inside the magnitude range
						return that._aNodes.slice(oNodeForContext.serverIndex, oNodeForContext.serverIndex + oNodeForContext.magnitude + 1);
					} else {
						// the node was initially collapsed or has no server-index (the deep ones)
						return oNodeForContext;
					}
				},
				getContext: function () {
					return oContext;
				},
				_restore: function () {
					oNodeForContext.nodeState.removed = false;
					var iNodeStateFound = that._aRemoved.indexOf(oNodeForContext);
					if (iNodeStateFound != -1) {
						that._aRemoved.splice(iNodeStateFound, 1);
					}
					// clear cache to make sure findNode etc. don't deliver wrong nodes (index is shifted due to adding)
					this._aNodeCache = [];
					that.cleanTreeStateMaps();
					that._fireChange({reason: ChangeReason.Add});
				}
			};
		} else {
			jQuery.sap.log.warning("ODataTreeBinding.removeContexts(): The given context is not part of the tree. Was it removed already?");
		}
	};

	//*********************************************
	//      Functions for index calculation       *
	//*********************************************

	ODataTreeBindingFlat.prototype._getRelatedServerIndex = function(oNode) {
		if (oNode.serverIndex === undefined) {
			return oNode.containingServerIndex;
		} else {
			return oNode.serverIndex;
		}
	};

	ODataTreeBindingFlat.prototype.getNodeInfoByRowIndex = function(iRowIndex) {
		var iCPointer = 0, iEPointer = 0, oNode, bTypeCollapse, iValidCollapseIndex = -1;

		while (iCPointer < this._aCollapsed.length || iEPointer < this._aExpanded.length) {
			if (this._aCollapsed[iCPointer] && this._aExpanded[iEPointer]) {
				if (this._getRelatedServerIndex(this._aCollapsed[iCPointer]) > this._getRelatedServerIndex(this._aExpanded[iEPointer])) {
					oNode = this._aExpanded[iEPointer];
					iEPointer++;
					bTypeCollapse = false;
				} else {
					oNode = this._aCollapsed[iCPointer];
					iCPointer++;
					bTypeCollapse = true;
				}
			} else if (this._aCollapsed[iCPointer]) {
				oNode = this._aCollapsed[iCPointer];
				iCPointer++;
				bTypeCollapse = true;
			} else {
				oNode = this._aExpanded[iEPointer];
				iEPointer++;
				bTypeCollapse = false;
			}

			if (iRowIndex <= this._getRelatedServerIndex(oNode)) {
				// the following collapsed and expanded nodes don't affect the node info
				break;
			}

			if (bTypeCollapse) {
				// collapse
				if (!oNode.isDeepOne && !oNode.initiallyCollapsed && oNode.serverIndex > iValidCollapseIndex) {
					iRowIndex += oNode.magnitude;
					iValidCollapseIndex = oNode.serverIndex + oNode.magnitude;
				}
			} else {
				// expand
				if (oNode.serverIndex > iValidCollapseIndex) {
					// only the expanded node on the defined expand level matters the index
					if (!oNode.isDeepOne && oNode.initiallyCollapsed) {
						iRowIndex -= oNode.magnitude;
					}

					if (iRowIndex <= oNode.serverIndex) {
						// the searched node is under the current node
						return this._calcDirectIndex(oNode, iRowIndex + oNode.magnitude - oNode.serverIndex - 1);
					}
				}
			}
		}

		return {
			index: iRowIndex
		};
	};


	/**
	 * This method calculates the DIRECT parent and the child index of a node's nth descendant.
	 */
	ODataTreeBindingFlat.prototype._calcDirectIndex = function (oNode, index) {
		var i, iMagnitude, oChild;
		for (i = 0 ; i < oNode.children.length ; i++) {
			oChild = oNode.children[i];

			if (index === 0) {
				return {
					parent: oNode,
					childIndex: i
				};
			}

			iMagnitude = oChild ? oChild.magnitude : 0;
			index--;

			if (!oChild || oChild.nodeState.collapsed) {
				continue;
			}

			if (index < iMagnitude) {
				return this._calcDirectIndex(oChild, index);
			} else {
				index -= iMagnitude;
			}
		}
	};

	ODataTreeBindingFlat.prototype.getRowIndexByNode = function (oNode) {
		var iDelta = 0;

		if (oNode.isDeepOne) {
			while (oNode.parent) {
				iDelta += oNode.positionInParent + 1;
				oNode = oNode.parent;
			}
		}

		return this._calcIndexDelta(oNode.serverIndex) + oNode.serverIndex + iDelta;
	};

	ODataTreeBindingFlat.prototype._getSelectedNodesInfo = function () {
		var aNodesInfo = [],
			sSelectedKey, oNode;

		//if we have no nodes selected, the selection info are empty
		if (jQuery.isEmptyObject(this._mSelected)) {
			return aNodesInfo;
		}

		for (sSelectedKey in this._mSelected) {
			oNode = this._mSelected[sSelectedKey];
			aNodesInfo.push({
				node: oNode,
				rowIndex: this.getRowIndexByNode(oNode)
			});
		}

		aNodesInfo.sort(function(oNodeInfo1, oNodeInfo2) {
			return oNodeInfo1.rowIndex - oNodeInfo2.rowIndex;
		});

		return aNodesInfo;
	};

	/**
	 * Calculate the index delta till a given server-index.
	 * Expanded nodes results in positive delta and collapsed note results in negative one.
	 *
	 * A collapsed node contributes to the delta when it meets the following conditions:
	 *  1. it's not a manually expanded node.
	 *  2. it's not contained in the range of another collapsed node
	 *
	 * A expanded node contributes to the delta when it meets the following conditions:
	 *  1. it's not expanded with the initial call which means it's either initially collapsed or manually loaded
	 *  2. none of its ancestor it's collapsed.
	 */
	ODataTreeBindingFlat.prototype._calcIndexDelta = function (iEndServerIndex) {
		// collect all collapsed server indices and magnitude as a look-up table
		// serverIndex + magnitude form a range for which we can check if there is a containment situation
		var mCollapsedServerIndices = {};
		this._aCollapsed.forEach(function (oNode) {
			// only regard nodes with a server-index and not initially collapsed
			if (oNode.serverIndex >= 0 && oNode.serverIndex < iEndServerIndex && !oNode.isDeepOne && !oNode.initiallyCollapsed) {
				mCollapsedServerIndices[oNode.serverIndex] = oNode.magnitude;
			}
		});

		// collapsed delta
		var iLastCollapsedIndex = 0;
		var iCollapsedDelta = 0;

		for (var i = 0; i < this._aCollapsed.length; i++) {
			var oCollapsedNode = this._aCollapsed[i];

			if (this._getRelatedServerIndex(oCollapsedNode) >= iEndServerIndex) {
				break;
			}

			if (!oCollapsedNode.isDeepOne) {
				// if the collapsed node is not inside the last collapsed magnitude range, collapse it also
				if (oCollapsedNode.serverIndex >= iLastCollapsedIndex && !oCollapsedNode.initiallyCollapsed) {
					iCollapsedDelta -= oCollapsedNode.magnitude;
					iLastCollapsedIndex = oCollapsedNode.serverIndex + oCollapsedNode.magnitude;
				} else {
					//ignore the node since it is contained in another one
				}
			} else {
				// collapsed manually expanded nodes are ignored for collapse delta, since it is only applicable to the server provided magnitude
			}
		}

		// expanded delta
		var iExpandedDelta = 0;

		var fnInCollapsedRange = function (oNode) {
			var bIgnore = false;
			var iContainingIndexToCheck = oNode.serverIndex || oNode.containingServerIndex;
			for (var j in mCollapsedServerIndices) {
				// if the expanded node is inside a collapsed range -> ignore it
				if (iContainingIndexToCheck > j && iContainingIndexToCheck < j + mCollapsedServerIndices[j]) {
					bIgnore = true;
					break;
				}
			}
			return bIgnore;
		};

		for (i = 0; i < this._aExpanded.length; i++) {
			var oExpandedNode = this._aExpanded[i];

			if (this._getRelatedServerIndex(oExpandedNode) >= iEndServerIndex) {
				break;
			}

			// regard the real deep ones for the expanded delta
			if (oExpandedNode.isDeepOne) {
				// simply check if one of its parents is collapsed :)
				var oParent = oExpandedNode.parent;
				var bYep = false;
				while (oParent) {
					if (oParent.nodeState.collapsed) {
						bYep = true;
						break;
					}
					oParent = oParent.parent;
				}

				var bIgnore = fnInCollapsedRange(oExpandedNode);

				// if not then regard the children for the expanded delta
				if (!bYep && !bIgnore) {
					iExpandedDelta += oExpandedNode.children.length;
				}

			} else if (oExpandedNode.initiallyCollapsed) {
				// see if the node on the last auto-expand level is contained in a sub-tree of a collapsed server-indexed node
				var bIgnore = fnInCollapsedRange(oExpandedNode);
				if (!bIgnore) {
					// still we have to check for a
					iExpandedDelta += oExpandedNode.children.length;
				}
			}
		}

		return iExpandedDelta + iCollapsedDelta;
	};

	ODataTreeBindingFlat.prototype._sortNodes = function(aNodes) {
		var fnSort = function (a, b) {
			var iA = a.serverIndex;
			iA = iA == undefined ? a.containingServerIndex : iA;
			var iB = b.serverIndex;
			iB = iB == undefined ? b.containingServerIndex : iB;

			return iA - iB;
		};

		aNodes.sort(fnSort);
	};

	//*********************************************
	//                   Events                   *
	//*********************************************

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'selectionChanged' event of this <code>sap.ui.model.SelectionModel</code>.<br/>
	 * Event is fired if the selection of tree nodes is changed in any way.
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, this Model is used.
	 *
	 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataTreeBindingFlat.prototype.attachSelectionChanged = function(oData, fnFunction, oListener) {
		this.attachEvent("selectionChanged", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'selectionChanged' event of this <code>sap.ui.model.SelectionModel</code>.<br/>
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataTreeBindingFlat.prototype.detachSelectionChanged = function(fnFunction, oListener) {
		this.detachEvent("selectionChanged", fnFunction, oListener);
		return this;
	};

	/**
	 * Fire event 'selectionChanged' to attached listeners.
	 *
	 * Expects following event parameters:
	 * <ul>
	 * <li>'leadIndex' of type <code>int</code> Lead selection index.</li>
	 * <li>'rowIndices' of type <code>int[]</code> Other selected indices (if available)</li>
	 * </ul>
	 *
	 * @param {object} mArguments the arguments to pass along with the event.
	 * @param {int} mArguments.leadIndex Lead selection index
	 * @param {int[]} [mArguments.rowIndices] Other selected indices (if available)
	 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataTreeBindingFlat.prototype.fireSelectionChanged = function(mArguments) {
		this.fireEvent("selectionChanged", mArguments);
		return this;
	};

	/**
	 * Stub for the TreeBinding API -> not used for Auto-Expand paging in the TreeTable.
	 * Implementation see ODataTreeBinding (v2).
	 */
	ODataTreeBindingFlat.prototype.getRootContexts = function () {};
	ODataTreeBindingFlat.prototype.getNodeContexts = function () {};

	return ODataTreeBindingFlat;

}, /* bExport= */ true);
