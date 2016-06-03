/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.ODataTreeBindingAutoExpand
sap.ui.define(['jquery.sap.global', 'sap/ui/model/TreeBinding', './v2/ODataTreeBinding', 'sap/ui/model/ChangeReason', 'sap/ui/model/TreeBindingUtils'],
	function(jQuery, TreeBinding, ODataTreeBinding, ChangeReason, TreeBindingUtils) {
	"use strict";

	/**
	 * Adapter for TreeBindings to add the ListBinding functionality and use the
	 * tree structure in list based controls.
	 *
	 * @alias sap.ui.model.odata.ODataTreeBindingAutoExpand
	 * @function
	 * @experimental This module is only for experimental and internal use!
	 * @protected
	 */
	var ODataTreeBindingAutoExpand = function() {

		// ensure only TreeBindings are enhanced which have not been enhanced yet
		if (!(this instanceof TreeBinding) || this._bIsAdapted) {
			return;
		}

		// apply the methods of the adapters prototype to the TreeBinding instance
		for (var fn in ODataTreeBindingAutoExpand.prototype) {
			if (ODataTreeBindingAutoExpand.prototype.hasOwnProperty(fn)) {
				this[fn] = ODataTreeBindingAutoExpand.prototype[fn];
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
		this._aExpandedAfterSelectAll = this._aExpandedAfterSelectAll || [];
		this._mSelected = this._mSelected || {};

		this._bSelectAll = false;

		// the delta variables for calculating the correct binding-length (used e.g. for sizing the scrollbar)
		this._iCollapsedDelta = 0;
		this._iExpandedDelta = 0;
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
	};

	/**
	 * Sets the number of expanded levels.
	 */
	ODataTreeBindingAutoExpand.prototype.setNumberOfExpandedLevels = function(iLevels) {
		this.resetData();
		ODataTreeBinding.prototype.setNumberOfExpandedLevels.apply(this, arguments);
	};

	/**
	 * Retrieves the requested page.
	 * API used by the controls.
	 */
	ODataTreeBindingAutoExpand.prototype.getContexts = function (iStartIndex, iLength, iThreshold, bReturnNodes) {
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
		iTop = 1 + Math.max(iLastServerIndex - iSkip, 0);

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

	ODataTreeBindingAutoExpand.prototype._calculateRequestParameters = function (aMissing) {
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
	ODataTreeBindingAutoExpand.prototype._retrieveNodeSection = function (iStartIndex, iLength) {
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

	/**
	 * Retrieves the requested section of the nodes.
	 * Also requests the data if necessary.
	 * @protected
	 */
	ODataTreeBindingAutoExpand.prototype.getNodes = function (iStartIndex, iLength, iThreshold) {
		var vNodes = this.getContexts(iStartIndex, iLength, iThreshold, true);
		return vNodes;
	};



	/**
	 * Applies the given function to all tree nodes
	 * @param {function} fnMap the map function which will be called for all nodes.
	 * @private
	 */
	ODataTreeBindingAutoExpand.prototype._map = function (fnMap) {
		var oRecursionBreaker = {broken: false};

		/**
		 * Recursive Tree Traversal
		 * @param {object} oNode the current node
		 * @param {boolean} bIgnore a flag to indicate if the node should be mapped
		 * @param {object} oParent the parent node of oNode
		 * @param {int} iPositionInParent the position of oNode in the children-array of oParent
		 */
		var fnDeeper = function (oNode, bIgnore, oParent, iPositionInParent) {
			if (!bIgnore) {
				fnMap(oNode, oRecursionBreaker, "positionInParent", iPositionInParent, oParent);
			}
			if (oRecursionBreaker.broken) {
				return;
			}
			// if the node also has children AND is expanded, dig deeper
			if (oNode && oNode.children && oNode.nodeState.expanded) {
				for (var i = 0; i < oNode.children.length; i++) {
					fnDeeper(oNode.children[i], false, oNode, i);
					if (oRecursionBreaker.broken) {
						return;
					}
				}
			}
		};

		//count the nodes until we find the correct index
		var iNodeIndex = -1;
		for (var i = 0; i < this._aNodes.length; i++) {
			iNodeIndex++;
			var oNode = this._aNodes[i];

			fnMap(oNode, oRecursionBreaker, "serverIndex", i);
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
						fnDeeper(oNode, true);
						if (oRecursionBreaker.broken) {
							return;
						}
					}
				}
			}
		}
	};

	/**
	 * Loads the data based on a level filter.
	 */
	ODataTreeBindingAutoExpand.prototype._loadData = function (iSkip, iTop) {

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
						initiallyCollapsed: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "collapsed",
						nodeState: {
							isLeaf: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "leaf",
							expanded: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "expanded",
							collapsed: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "collapsed",
							selected: this._mSelected[sKey] ? this._mSelected[sKey].nodeState.selected : false
						},
						children: [],
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

		// construct multi-filter for level filter and application filters
		var oLevelFilter = new sap.ui.model.Filter(this.oTreeProperties["hierarchy-level-for"], "LE", this.getNumberOfExpandedLevels());
		var aFilters = [oLevelFilter];
		if (this.aApplicationFilters) {
			aFilters = aFilters.concat(this.aApplicationFilters);
		}

		// TODO: Add additional filters to the read call, as soon as back-end implementations support it
		// Something like this: aFilters = [new sap.ui.model.Filter([hierarchyFilters].concat(this.aFilters))];
		this.mRequestHandles[sRequestKey] = this.oModel.read(this.getPath(), {
			urlParameters: aUrlParameters,
			filters: [new sap.ui.model.Filter({
				filters: aFilters,
				and: true
			})],
			sorters: this.aSorters || [],
			success: _handleSuccess.bind(this),
			error: _handleError.bind(this),
			groupId: this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId
		});
	};




	/**
	 * Loads the data based on a parent node filter.
	 */
	ODataTreeBindingAutoExpand.prototype._loadChildren = function (oParentNode, iSkip, iTop) {

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
				while (oParent != null) {
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
						level: oEntry[this.oTreeProperties["hierarchy-level-for"]] || oParentNode.level + 1,
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

		// construct multi-filter for level filter and application filters
		var oLevelFilter = new sap.ui.model.Filter(this.oTreeProperties["hierarchy-parent-node-for"], "EQ", oParentNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]));
		var aFilters = [oLevelFilter];
		if (this.aApplicationFilters) {
			aFilters = aFilters.concat(this.aApplicationFilters);
		}

		// TODO: Add additional filters to the read call, as soon as back-end implementations support it
		// Something like this: aFilters = [new sap.ui.model.Filter([hierarchyFilters].concat(this.aFilters))];
		this.mRequestHandles[sRequestKey] = this.oModel.read(this.getPath(), {
			urlParameters: aUrlParameters,
			filters: [new sap.ui.model.Filter({
				filters: aFilters,
				and: true
			})],
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
	ODataTreeBindingAutoExpand.prototype.findNode = function (iRowIndex, fnMatch) {
		if (this.isInitial()) {
			return;
		}

		// first make a cache lookup
		var oNode = this._aNodeCache[iRowIndex];
		if (oNode) {
			return oNode;
		}

		//node not in cache, so count the nodes until we find the correct index
		var iNodeIndex = -1;
		for (var i = 0; i < this._aNodes.length; i++) {
			iNodeIndex++;

			oNode = this._aNodes[i];

			//found the node in the flat array
			if (iNodeIndex == iRowIndex || (fnMatch && fnMatch(oNode))) {
				this._aNodeCache[iRowIndex] = oNode; // update cache, just in case
				return oNode;
			}

			// if we did not find the node on the server level, see if we have to regard its expansion state
			if (oNode) {
				// jump over collapsed nodes by the enclosing magnitude
				if (!oNode.initiallyCollapsed && oNode.nodeState.collapsed) {
					i += oNode.magnitude;
				} else {
					// look into expanded nodes deeper than the initial expand level

					if (oNode.initiallyCollapsed && oNode.nodeState.expanded) {
						var oRecursionParameters = {
							rowIndex: iRowIndex,
							nodeIndex: iNodeIndex,
							match: fnMatch
						};
						var oFound = this.findDeepNode(oNode, oRecursionParameters);

						// if the recursion in the nested hierarchy could not find the node, we advance the node-index
						// by the amount to
						if (!oFound) {
							iNodeIndex = oRecursionParameters.nodeIndex;
						} else {
							this._aNodeCache[iRowIndex] = oFound; // update cache
							return oFound;
						}
					}
				}
			}

		}
	};

	/**
	 * Retrieves a node deeper in the expanded hierarchy.
	 * Recursion details look like this:
	 * {
	 *    rowIndex: 210,
	 *    nodeIndex: 54,
	 *    match: function(){}
	 * }
	 */
	ODataTreeBindingAutoExpand.prototype.findDeepNode = function (oNode, oRecursionDetails) {

		if (oRecursionDetails.rowIndex == oRecursionDetails.nodeIndex) {
			return oNode;
		}

		if (oNode && oNode.children && oNode.nodeState.expanded) {
			for (var i = 0; i < oNode.children.length; i++) {
				oRecursionDetails.nodeIndex++;

				var oChildNode = oNode.children[i];

				// if the node index counter meets the requested index, we have found the node
				// alternatively if the match-function returns true for the given node, we also have found it
				if (oRecursionDetails.rowIndex == oRecursionDetails.nodeIndex || (oRecursionDetails.match && oRecursionDetails.match(oNode))) {
					return oChildNode;
				}

				var oFound;
				if (oChildNode && oChildNode.children.length > 0) {
					oFound = this.findDeepNode(oChildNode, oRecursionDetails);
				}

				if (oFound) {
					return oFound;
				}
			}
		}
	};

	/**
	 * Toggles a row index between expanded and collapsed.
	 */
	ODataTreeBindingAutoExpand.prototype.toggleIndex = function(iRowIndex) {

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
	ODataTreeBindingAutoExpand.prototype.expand = function (vRowIndex, bSuppressChange) {
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
	ODataTreeBindingAutoExpand.prototype.expandToLevel = function (iLevel) {
		if (iLevel > this.getNumberOfExpandedLevels()) {
			this.setNumberOfExpandedLevels(iLevel);
		}
	};

	/**
	 * Collapses the given node or index.
	 * @param vRowIndex either an index or a node instance
	 * @param bSuppressChange if set to true, there will be no change event fired
	 */
	ODataTreeBindingAutoExpand.prototype.collapse = function (vRowIndex, bSuppressChange) {
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

		//remove selection if the nodes are collapsed recursively
		//TODO: reset selection should be done even when !bCollapseRecursive???
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
	ODataTreeBindingAutoExpand.prototype.collapseToLevel = function (iLevel) {
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
	 */
	ODataTreeBindingAutoExpand.prototype._isInSubtree  = function (oSubtreeRoot, oNode) {
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
	 * Makes sure that the collapsed and expanded maps/arrays are correctly sanitized,
	 * by sorting them accordingly and moving the correct nodes
	 * @param {object} oNode the node which will be removed from the respective maps
	 */
	ODataTreeBindingAutoExpand.prototype.cleanTreeStateMaps = function () {

		var fnSort = function (a, b) {
			var iA = a.serverIndex;
			iA = iA == undefined ? a.containingServerIndex : iA;
			var iB = b.serverIndex;
			iB = iB == undefined ? b.containingServerIndex : iB;

			return iA - iB;
		};

		// sort the tree state maps by the (containing) server-index
		this._aCollapsed.sort(fnSort);
		this._aExpanded.sort(fnSort);

		// collect all collapsed server indices and magnitude as a look-up table
		// serverIndex + magnitude form a range for which we can check if there is a containment situation
		var mCollapsedServerIndices = {};
		this._aCollapsed.forEach(function (oNode) {
			// only regard nodes with a server-index and not initially collapsed
			if (oNode.serverIndex >= 0 && !oNode.isDeepOne && !oNode.initiallyCollapsed) {
				mCollapsedServerIndices[oNode.serverIndex] = oNode.magnitude;
			}
		});

		// collapsed delta
		var iLastCollapsedIndex = 0;
		this._iCollapsedDelta = 0;

		for (var i = 0; i < this._aCollapsed.length; i++) {
			var oCollapsedNode = this._aCollapsed[i];

			if (!oCollapsedNode.isDeepOne) {
				// if the collapsed node is not inside the last collapsed magnitude range, collapse it also
				if (oCollapsedNode.serverIndex >= iLastCollapsedIndex && !oCollapsedNode.initiallyCollapsed) {
					this._iCollapsedDelta -= oCollapsedNode.magnitude;
					iLastCollapsedIndex = oCollapsedNode.serverIndex + oCollapsedNode.magnitude;
				} else {
					//ignore the node since it is contained in another one
				}
			} else {
				// collapsed manually expanded nodes are ignored for collapse delta, since it is only applicable to the server provided magnitude
			}
		}

		// expanded delta
		this._iExpandedDelta = 0;

		var fnInCollapsedRange = function (oNode) {
			var bIgnore = false;
			var iContainingIndexToCheck = oNode.serverIndex || oNode.containingServerIndex;
			for (var j in mCollapsedServerIndices) {
				j = parseInt(j, 10);
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
					this._iExpandedDelta += oExpandedNode.children.length;
				}

			} else if (oExpandedNode.initiallyCollapsed) {
				// see if the node on the last auto-expand level is contained in a sub-tree of a collapsed server-indexed node
				var bIgnore = fnInCollapsedRange(oExpandedNode);
				if (!bIgnore) {
					// still we have to check for a
					this._iExpandedDelta += oExpandedNode.children.length;
				}
			}

		}

		this._iLengthDelta = this._iCollapsedDelta + this._iExpandedDelta;
	};

	/**
	 * Returns if the count was received already and we know how many entries there will be in total.
	 */
	ODataTreeBindingAutoExpand.prototype.isLengthFinal = function () {
		return this._bLengthFinal;
	};

	/**
	 * The length of the binding regards the expanded state of the tree.
	 * So the length is the direct length of the tables scrollbar.
	 */
	ODataTreeBindingAutoExpand.prototype.getLength = function () {
		return this._aNodes.length + this._iLengthDelta;
	};

	/**
	 * Retrieves the context for a given index.
	 */
	ODataTreeBindingAutoExpand.prototype.getContextByIndex = function (iRowIndex) {
		if (this.isInitial()) {
			return;
		}

		var oNode = this.findNode(iRowIndex);

		return oNode && oNode.context;
	};


	/**
	 * Checks if an index is expanded
	 */
	ODataTreeBindingAutoExpand.prototype.isExpanded = function(iRowIndex) {
		var oNode = this.findNode(iRowIndex);
		return oNode && oNode.nodeState.expanded;
	};

	/**
	 * Returns if a node has children.
	 * This does not mean, the children have to be loaded or the node has to be expanded.
	 * If the node is a leaf it has not children, otherwise the function returns true.
	 * @param oContext
	 * @returns if the given context has children
	 */
	ODataTreeBindingAutoExpand.prototype.hasChildren = function(oContext) {
		if (!oContext) {
			return false;
		}

		var sDrilldownState = oContext.getProperty(this.oTreeProperties["hierarchy-drill-state-for"]);
		return sDrilldownState !== "leaf";
	};

	/**
	 * Returns if a node has children.
	 * This does not mean, the children have to be loaded or the node has to be expanded.
	 * If the node is a leaf it has not children, otherwise the function returns true.
	 * @param oNode
	 * @returns if the given node has children
	 */
	ODataTreeBindingAutoExpand.prototype.nodeHasChildren = function(oNode) {
		if (oNode === undefined) {
			return false;
		} else if (oNode === null) {
			return true;
		} else {
			return this.hasChildren(oNode.context);
		}
	};

	//*************************************************
	//*               Selection-Handling              *
	//************************************************/

	/**
	 * Sets the selection state of the given node.
	 * @param {object} oNodeState the node state for which the selection should be changed
	 * @param {boolean} bIsSelected the selection state for the given node
	 */
	ODataTreeBindingAutoExpand.prototype.setNodeSelection = function (oNode, bIsSelected) {

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
	ODataTreeBindingAutoExpand.prototype.isIndexSelected = function (iRowIndex) {
		var oNode = this.findNode(iRowIndex);
		return oNode && oNode.nodeState ? oNode.nodeState.selected : false;
	};

	/**
	 * Returns if the node at the given index is selectable.
	 * Always true for TreeTable controls, except the node is not defined.
	 * @param {int} iRowIndex the row index which should be checked for "selectability"
	 */
	ODataTreeBindingAutoExpand.prototype.isIndexSelectable = function (iRowIndex) {
		var oNode = this.findNode(iRowIndex);
		return !!oNode;
	};

	/**
	 * Removes the selection from all nodes
	 * @private
	 */
	ODataTreeBindingAutoExpand.prototype._clearSelection = function () {
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
	ODataTreeBindingAutoExpand.prototype.setSelectedIndex = function (iRowIndex) {
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
			jQuery.sap.log.warning("ODataTreeBindingAutoExpand: The selection of index '" + iRowIndex + "' was ignored. Please make sure to only select rows, for which data has been fetched to the client.");
		}
	};

	/**
	 * Retrieves the "Lead-Selection-Index"
	 * Normally this is the last selected node/table row.
	 * @return {int} returns the lead selection index or -1 if none is set
	 */
	ODataTreeBindingAutoExpand.prototype.getSelectedIndex = function () {
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
	ODataTreeBindingAutoExpand.prototype.getSelectedIndices = function () {
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
	ODataTreeBindingAutoExpand.prototype.getSelectedNodesCount = function () {
		return Object.keys(this._mSelected).length;
	};

	/**
	 * Returns an array containing all selected contexts, ordered by their appearance in the tree.
	 * @return {sap.ui.model.Context[]} an array containing the binding contexts for all selected nodes
	 */
	ODataTreeBindingAutoExpand.prototype.getSelectedContexts = function () {
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
	ODataTreeBindingAutoExpand.prototype.setSelectionInterval = function (iFromIndex, iToIndex) {
		// clears the selection but suppresses the selection change event
		var mClearParams = this._clearSelection();
		// the addSelectionInterval function takes care of the selection change event
		var mSetParams = this._setSelectionInterval(iFromIndex, iToIndex, true);

		var mIndicesFound = {};
		var aRowIndices = [];

		// flag all cleared indices as changed
		for (var i = 0; i < mClearParams.rowIndices.length; i++) {
			var iIndex = mClearParams.rowIndices[i];
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
	ODataTreeBindingAutoExpand.prototype._setSelectionInterval = function (iFromIndex, iToIndex, bSelectionValue) {
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
			if (!oNode || !oNode.isArtificial) {
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
	ODataTreeBindingAutoExpand.prototype.addSelectionInterval = function (iFromIndex, iToIndex) {
		var mParams = this._setSelectionInterval(iFromIndex, iToIndex, true);
		this._publishSelectionChanges(mParams);
	};

	/**
	 * Removes the selections inside the given range (including boundaries)
	 */
	ODataTreeBindingAutoExpand.prototype.removeSelectionInterval = function (iFromIndex, iToIndex) {
		var mParams = this._setSelectionInterval(iFromIndex, iToIndex, false);
		this._publishSelectionChanges(mParams);
	};

	/**
	 * Selects all avaliable nodes
	 */
	ODataTreeBindingAutoExpand.prototype.selectAll = function () {
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
	ODataTreeBindingAutoExpand.prototype.clearSelection = function (bSuppresSelectionChangeEvent) {
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
	ODataTreeBindingAutoExpand.prototype._publishSelectionChanges = function (mParams) {

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
	ODataTreeBindingAutoExpand.prototype.setCollapseRecursive = function (bCollapseRecursive) {
		this.bCollapseRecursive = !!bCollapseRecursive;
	};

	/**
	 * Reset the bindings internal data structures.
	 */
	ODataTreeBindingAutoExpand.prototype.resetData = function () {
		ODataTreeBinding.prototype.resetData.apply(this, arguments);

		this._aNodes = [];

		this._aCollapsed = [];
		this._aExpanded = [];
		this._aExpandedAfterSelectAll = [];
		this._aRowIndexMap = [];

		this._bLengthFinal = false;

		this._bSelectAll = false;

		// the delta variables for calculating the correct binding-length (used e.g. for sizing the scrollbar)
		this._iCollapsedDelta = 0;
		this._iExpandedDelta = 0;
		this._iLengthDelta = 0;
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
	ODataTreeBindingAutoExpand.prototype.attachSelectionChanged = function(oData, fnFunction, oListener) {
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
	ODataTreeBindingAutoExpand.prototype.detachSelectionChanged = function(fnFunction, oListener) {
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
	ODataTreeBindingAutoExpand.prototype.fireSelectionChanged = function(mArguments) {
		this.fireEvent("selectionChanged", mArguments);
		return this;
	};

	/**
	 * Stub for the TreeBinding API -> not used for Auto-Expand paging in the TreeTable
	 */
	ODataTreeBindingAutoExpand.prototype.getRootContexts = function () {};
	ODataTreeBindingAutoExpand.prototype.getNodeContexts = function () {};

	return ODataTreeBindingAutoExpand;

}, /* bExport= */ true);
