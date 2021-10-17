import TreeBinding from "sap/ui/model/TreeBinding";
import TreeAutoExpandMode from "sap/ui/model/TreeAutoExpandMode";
import ChangeReason from "sap/ui/model/ChangeReason";
import TreeBindingUtils from "sap/ui/model/TreeBindingUtils";
import assert from "sap/base/assert";
import Log from "sap/base/Log";
import each from "sap/base/util/each";
import isEmptyObject from "sap/base/util/isEmptyObject";
var TreeBindingAdapter = function () {
    if (!(this instanceof TreeBinding) || this._bIsAdapted) {
        return;
    }
    for (var fn in TreeBindingAdapter.prototype) {
        if (TreeBindingAdapter.prototype.hasOwnProperty(fn)) {
            this[fn] = TreeBindingAdapter.prototype[fn];
        }
    }
    this.mParameters = this.mParameters || {};
    this._aRowIndexMap = [];
    this._iThreshold = 0;
    this._iPageSize = 0;
    this.setAutoExpandMode(this.mParameters.autoExpandMode || TreeAutoExpandMode.Sequential);
    if (this.mParameters.collapseRecursive === undefined) {
        this.bCollapseRecursive = true;
    }
    else {
        this.bCollapseRecursive = !!this.mParameters.collapseRecursive;
    }
    this._createTreeState();
    this._bIsAdapted = true;
};
TreeBindingAdapter.prototype.getCurrentTreeState = function () {
    var sDelimiter = ";";
    var mExpandedEntriesGroupIDs = {};
    for (var sGroupID in this._mTreeState.expanded) {
        mExpandedEntriesGroupIDs[sGroupID] = true;
    }
    var mCollapsedEntriesGroupIDs = {};
    for (var sGroupID in this._mTreeState.collapsed) {
        mCollapsedEntriesGroupIDs[sGroupID] = true;
    }
    var mSelectedEntriesGroupIDs = {};
    for (var sGroupID in this._mTreeState.selected) {
        mSelectedEntriesGroupIDs[sGroupID] = true;
    }
    return {
        _getExpandedList: function () {
            return Object.keys(mExpandedEntriesGroupIDs).join(sDelimiter);
        },
        _getCollapsedList: function () {
            return Object.keys(mCollapsedEntriesGroupIDs).join(sDelimiter);
        },
        _getSelectedList: function () {
            return Object.keys(mSelectedEntriesGroupIDs).join(sDelimiter);
        },
        _isExpanded: function (sGroupID) {
            return !!mExpandedEntriesGroupIDs[sGroupID];
        },
        _isCollapsed: function (sGroupID) {
            return !!mCollapsedEntriesGroupIDs[sGroupID];
        },
        _remove: function (sGroupID) {
            delete mExpandedEntriesGroupIDs[sGroupID];
            delete mCollapsedEntriesGroupIDs[sGroupID];
            delete mSelectedEntriesGroupIDs[sGroupID];
        }
    };
};
TreeBindingAdapter.prototype.setTreeState = function (oTreeState) {
    this._oInitialTreeState = oTreeState;
};
TreeBindingAdapter.prototype.setAutoExpandMode = function (sAutoExpandMode) {
    this._autoExpandMode = sAutoExpandMode;
};
TreeBindingAdapter.prototype.getLength = function () {
    if (!this._oRootNode) {
        return 0;
    }
    return this._oRootNode.magnitude;
};
TreeBindingAdapter.prototype.getContextByIndex = function (iIndex) {
    if (this.isInitial()) {
        return;
    }
    var oNode = this.findNode(iIndex);
    return oNode ? oNode.context : undefined;
};
TreeBindingAdapter.prototype.getNodeByIndex = function (iIndex) {
    if (this.isInitial()) {
        return;
    }
    if (iIndex >= this.getLength()) {
        return undefined;
    }
    return this.findNode(iIndex);
};
TreeBindingAdapter.prototype.findNode = function (vParam) {
    if (this.isInitial()) {
        return;
    }
    var sParameterType = typeof vParam;
    var oFoundNode;
    var aSearchResult = [];
    if (sParameterType === "number") {
        oFoundNode = this._aRowIndexMap[vParam];
        if (!oFoundNode) {
            var iIndexCounter = -1;
            this._match(this._oRootNode, aSearchResult, 1, function (oNodeToCheck) {
                if (iIndexCounter === vParam) {
                    return true;
                }
                iIndexCounter += 1;
            });
            oFoundNode = aSearchResult[0];
        }
    }
    return oFoundNode;
};
TreeBindingAdapter.prototype._createTreeState = function (bReset) {
    if (!this._mTreeState || bReset) {
        this._mTreeState = {
            expanded: {},
            collapsed: {},
            selected: {},
            deselected: {}
        };
    }
};
TreeBindingAdapter.prototype._updateTreeState = function (mParameters) {
    mParameters = mParameters || {};
    var oTargetStateObject = mParameters.expanded ? this._mTreeState.expanded : this._mTreeState.collapsed;
    var oSourceStateObject = mParameters.expanded ? this._mTreeState.collapsed : this._mTreeState.expanded;
    var oNodeStateInSource = this._getNodeState(mParameters.groupID);
    if (!oNodeStateInSource) {
        oNodeStateInSource = mParameters.fallbackNodeState || this._createNodeState({
            groupID: mParameters.groupID,
            expanded: mParameters.expanded,
            sum: mParameters.sum
        });
    }
    delete oSourceStateObject[mParameters.groupID];
    oTargetStateObject[mParameters.groupID] = oNodeStateInSource;
    oNodeStateInSource.expanded = mParameters.expanded;
    return oNodeStateInSource;
};
TreeBindingAdapter.prototype._createNodeState = function (mParameters) {
    if (!mParameters.groupID) {
        assert(false, "To create a node state a group ID is mandatory!");
        return;
    }
    var bInitiallyExpanded;
    var bInitiallyCollapsed;
    if (this._oInitialTreeState) {
        bInitiallyExpanded = this._oInitialTreeState._isExpanded(mParameters.groupID);
        bInitiallyCollapsed = this._oInitialTreeState._isCollapsed(mParameters.groupID);
        this._oInitialTreeState._remove(mParameters.groupID);
    }
    var bIsExpanded = mParameters.expanded || bInitiallyExpanded || false;
    var bIsSelected = mParameters.selected || false;
    var oNodeState = {
        groupID: mParameters.groupID,
        expanded: bIsExpanded,
        sections: mParameters.sections || [{ startIndex: 0, length: this._iPageSize }],
        sum: mParameters.sum || false,
        selected: bIsSelected
    };
    if (bInitiallyExpanded || bInitiallyCollapsed) {
        this._updateTreeState({ groupID: mParameters.groupID, fallbackNodeState: oNodeState, expanded: bInitiallyExpanded, collapsed: bInitiallyCollapsed });
    }
    return oNodeState;
};
TreeBindingAdapter.prototype._getNodeState = function (sGroupID) {
    var oExpanded = this._mTreeState.expanded[sGroupID];
    var oCollapsed = this._mTreeState.collapsed[sGroupID];
    var oSelected = this._mTreeState.selected[sGroupID];
    var oDeselected = this._mTreeState.deselected[sGroupID];
    return oExpanded || oCollapsed || oSelected || oDeselected;
};
TreeBindingAdapter.prototype._updateNodeSections = function (sGroupID, oNewSection) {
    var oNodeState = this._getNodeState(sGroupID);
    if (!oNodeState) {
        assert(false, "No Node State for Group ID '" + sGroupID + "' found!");
        return;
    }
    else if (!oNewSection) {
        assert(false, "No Section given!");
        return;
    }
    else if (oNewSection.length <= 0) {
        assert(false, "The length of the given section must be positive greater than 0.");
        return;
    }
    else if (oNewSection.startIndex < 0) {
        assert(false, "The sections start index must be greater/equal to 0.");
        return;
    }
    oNodeState.sections = TreeBindingUtils.mergeSections(oNodeState.sections, oNewSection);
    return oNodeState.sections;
};
TreeBindingAdapter.prototype._increaseSections = function () {
    var fnIncreaseSections = function (oNode) {
        if (!oNode) {
            return;
        }
        var iMaxGroupSize = this._getMaxGroupSize(oNode);
        var oNodeState = oNode.nodeState;
        if (iMaxGroupSize === undefined) {
            var aNewSections = [];
            for (var i = 0; i < oNodeState.sections.length; i++) {
                var oCurrentSection = oNodeState.sections[i];
                oCurrentSection.length = Math.max(oCurrentSection.length, this._iPageSize);
                aNewSections = TreeBindingUtils.mergeSections(aNewSections, oCurrentSection);
            }
            oNodeState.sections = aNewSections;
        }
    };
    this._map(this._oRootNode, fnIncreaseSections);
};
TreeBindingAdapter.prototype._getMaxGroupSize = function (oNode) {
    var iMaxGroupSize = 0;
    if (oNode.isArtificial) {
        var bIsList = this.oModel.isList(this.sPath, this.getContext());
        if (this.bDisplayRootNode && !bIsList && !this._bRootMissing) {
            iMaxGroupSize = 1;
        }
        else {
            iMaxGroupSize = this._getGroupSize(oNode) || 0;
        }
    }
    else {
        iMaxGroupSize = this.nodeHasChildren(oNode) ? this._getGroupSize(oNode) : 0;
    }
    return iMaxGroupSize;
};
TreeBindingAdapter.prototype.getContexts = function (iStartIndex, iLength, iThreshold) {
    return this._getContextsOrNodes(false, iStartIndex, iLength, iThreshold);
};
TreeBindingAdapter.prototype._getContextsOrNodes = function (bReturnNodes, iStartIndex, iLength, iThreshold) {
    if (!this.isResolved() || this.isInitial()) {
        return [];
    }
    if (!iLength) {
        iLength = this.oModel.iSizeLimit;
    }
    if (!iThreshold) {
        iThreshold = 0;
    }
    if (iLength > this._iPageSize) {
        this._iPageSize = iLength;
        this._increaseSections();
    }
    this._iThreshold = Math.max(this._iThreshold, iThreshold);
    this._aRowIndexMap = [];
    this._buildTree(iStartIndex, iLength);
    var aNodes = [];
    if (this._oRootNode) {
        aNodes = this._retrieveNodeSection(this._oRootNode, iStartIndex, iLength);
    }
    this._updateRowIndexMap(aNodes, iStartIndex);
    var aContexts = [];
    var mMissingSections;
    for (var i = 0; i < aNodes.length; i++) {
        var oNode = aNodes[i];
        if (!oNode.context) {
            mMissingSections = mMissingSections || {};
            var oParentNode = oNode.parent;
            mMissingSections[oParentNode.groupID] = oParentNode;
            this._updateNodeSections(oParentNode.groupID, { startIndex: oNode.positionInParent, length: 1 });
        }
        aContexts.push(oNode.context);
    }
    if (mMissingSections) {
        var that = this;
        each(mMissingSections, function (sGroupID, oNode) {
            oNode.magnitude = 0;
            oNode.numberOfTotals = 0;
            that._loadChildContexts(oNode);
        });
        aContexts = [];
        for (var j = 0; j < aNodes.length; j++) {
            var oNode = aNodes[j];
            aContexts.push(oNode.context);
        }
    }
    if (bReturnNodes) {
        return aNodes;
    }
    else {
        return aContexts;
    }
};
TreeBindingAdapter.prototype.getNodes = function (iStartIndex, iLength, iThreshold) {
    return this._getContextsOrNodes(true, iStartIndex, iLength, iThreshold);
};
TreeBindingAdapter.prototype._updateRowIndexMap = function (aNodes, iStartIndex) {
    this._aRowIndexMap = [];
    for (var i = 0; i < aNodes.length; i++) {
        this._aRowIndexMap[iStartIndex + i] = aNodes[i];
    }
};
TreeBindingAdapter.prototype._retrieveNodeSection = function (oNode, iStartIndex, iLength) {
    var iNodeCounter = -1;
    var aNodes = [];
    this._match(this._oRootNode, [], iLength, function (oNode, iPositionInParent, oParentNode) {
        if (!oNode || !oNode.isArtificial) {
            iNodeCounter++;
        }
        if (iNodeCounter >= iStartIndex && iNodeCounter < iStartIndex + iLength) {
            if (!oNode) {
                oNode = this._createNode({ parent: oParentNode, positionInParent: iPositionInParent });
                oParentNode.children[iPositionInParent] = oNode;
            }
            aNodes.push(oNode);
            return true;
        }
    });
    return aNodes;
};
TreeBindingAdapter.prototype._buildTree = function (iStartIndex, iLength) {
    this._oRootNode = undefined;
    var oRootContext = null;
    var sRootGroupID = this._calculateGroupID({ context: oRootContext, parent: null });
    var oRootNodeState = this._getNodeState(sRootGroupID);
    if (!oRootNodeState) {
        var oRootNodeState = this._createNodeState({
            groupID: sRootGroupID,
            sum: true,
            sections: [{
                    startIndex: iStartIndex,
                    length: iLength
                }]
        });
        this._updateTreeState({
            groupID: oRootNodeState.groupID,
            fallbackNodeState: oRootNodeState,
            expanded: true
        });
    }
    this._oRootNode = this._createNode({
        context: oRootContext,
        parent: null,
        level: this.bDisplayRootNode && !(oRootContext === null) ? 0 : -1,
        nodeState: oRootNodeState,
        isLeaf: false,
        autoExpand: this.getNumberOfExpandedLevels() + 1
    });
    this._oRootNode.isArtificial = true;
    if (this._mTreeState.expanded[this._oRootNode.groupID]) {
        this._loadChildContexts(this._oRootNode);
    }
};
TreeBindingAdapter.prototype._calculateRequestLength = function (iMaxGroupSize, oSection) {
    var iRequestedLength;
    if (!iMaxGroupSize) {
        iRequestedLength = oSection.length;
    }
    else {
        iRequestedLength = Math.max(Math.min(oSection.length, iMaxGroupSize - oSection.startIndex), 0);
    }
    return iRequestedLength;
};
TreeBindingAdapter.prototype._loadChildContexts = function (oNode) {
    var oNodeState = oNode.nodeState;
    var iMaxGroupSize = this._getMaxGroupSize(oNode);
    if (iMaxGroupSize > 0) {
        if (!oNode.children[iMaxGroupSize - 1]) {
            oNode.children[iMaxGroupSize - 1] = undefined;
        }
        oNodeState.leafCount = iMaxGroupSize;
    }
    if (this.bClientOperation) {
        oNodeState.sections = [{
                startIndex: 0,
                length: iMaxGroupSize
            }];
    }
    for (var i = 0; i < oNodeState.sections.length; i++) {
        var oCurrentSection = oNodeState.sections[i];
        var iRequestedLength = this._calculateRequestLength(iMaxGroupSize, oCurrentSection);
        if (oNode.autoExpand >= 0 && this._autoExpandMode === TreeAutoExpandMode.Bundled) {
            iRequestedLength = Math.max(0, iMaxGroupSize);
        }
        var aChildContexts;
        if (oNode.isArtificial) {
            aChildContexts = this.getRootContexts(oCurrentSection.startIndex, iRequestedLength, this._iThreshold);
        }
        else {
            aChildContexts = this.nodeHasChildren(oNode) ? this.getNodeContexts(oNode.context, oCurrentSection.startIndex, iRequestedLength, this._iThreshold) : [];
        }
        for (var j = 0; j < aChildContexts.length; j++) {
            var oChildContext = aChildContexts[j];
            if (!oChildContext) {
                continue;
            }
            var iChildIndex = j + oCurrentSection.startIndex;
            var oChildNode = oNode.children[iChildIndex];
            var oUpdatedNodeData = {
                context: aChildContexts[j],
                parent: oNode,
                level: oNode.level + 1,
                positionInParent: iChildIndex,
                autoExpand: Math.max(oNode.autoExpand - 1, -1)
            };
            if (oChildNode) {
                oChildNode.context = oUpdatedNodeData.context;
                oChildNode.parent = oUpdatedNodeData.parent;
                oChildNode.level = oUpdatedNodeData.level;
                oChildNode.positionInParent = oUpdatedNodeData.positionInParent;
                oChildNode.magnitude = 0;
                oChildNode.numberOfTotals = 0;
                oChildNode.autoExpand = oUpdatedNodeData.autoExpand;
                var sGroupIDForChild;
                if (oChildContext) {
                    sGroupIDForChild = this._calculateGroupID(oChildNode);
                }
                oChildNode.groupID = sGroupIDForChild;
            }
            else {
                oChildNode = this._createNode(oUpdatedNodeData);
            }
            oChildNode.nodeState = this._getNodeState(oChildNode.groupID);
            if (!oChildNode.nodeState) {
                oChildNode.nodeState = this._createNodeState({
                    groupID: oChildNode.groupID,
                    expanded: false
                });
            }
            oChildNode.nodeState.parentGroupID = oNode.groupID;
            oChildNode.isLeaf = !this.nodeHasChildren(oChildNode);
            oNode.children[iChildIndex] = oChildNode;
            if (oChildNode.isLeaf) {
                oNode.numberOfLeafs += 1;
            }
            if (oChildNode.parent.nodeState.selectAllMode && !this._mTreeState.deselected[oChildNode.groupID]) {
                this.setNodeSelection(oChildNode.nodeState, true);
            }
            if ((oChildNode.autoExpand > 0 || oChildNode.nodeState.expanded) && this.isGrouped()) {
                if (!this._mTreeState.collapsed[oChildNode.groupID] && !oChildNode.isLeaf) {
                    this._updateTreeState({ groupID: oChildNode.nodeState.groupID, fallbackNodeState: oChildNode.nodeState, expanded: true });
                    this._loadChildContexts(oChildNode);
                }
                oNode.magnitude += Math.max(oChildNode.magnitude || 0, 0);
                oNode.numberOfLeafs += oChildNode.numberOfLeafs;
            }
        }
    }
    oNode.magnitude += Math.max(iMaxGroupSize || 0, 0);
};
TreeBindingAdapter.prototype.isGrouped = function () {
    return true;
};
TreeBindingAdapter.prototype._calculateGroupID = function (oNode) {
    Log.error("TreeBindingAdapter#_calculateGroupID: Not implemented. Needs to be implemented in respective sub-classes.");
};
TreeBindingAdapter.prototype._createNode = function (mParameters) {
    mParameters = mParameters || {};
    var oContext = mParameters.context;
    var iLevel = mParameters.level || 0;
    var oNode = {
        context: oContext,
        level: iLevel,
        children: mParameters.children || [],
        parent: mParameters.parent,
        nodeState: mParameters.nodeState,
        isLeaf: mParameters.isLeaf || false,
        positionInParent: mParameters.positionInParent,
        magnitude: mParameters.magnitude || 0,
        numberOfTotals: mParameters.numberOfTotals || 0,
        numberOfLeafs: mParameters.numberOfLeafs || 0,
        autoExpand: mParameters.autoExpand || 0,
        absoluteNodeIndex: mParameters.absoluteNodeIndex || 0,
        totalNumberOfLeafs: 0
    };
    if (oContext !== undefined) {
        oNode.groupID = this._calculateGroupID(oNode);
    }
    return oNode;
};
TreeBindingAdapter.prototype.expand = function (iIndex, bSuppressChange) {
    var oNode = this.findNode(iIndex);
    if (!oNode) {
        assert(false, "No node found for index " + iIndex);
        return;
    }
    this._updateTreeState({ groupID: oNode.nodeState.groupID, fallbackNodeState: oNode.nodeState, expanded: true });
    if (!bSuppressChange) {
        this._fireChange({ reason: ChangeReason.Expand });
    }
};
TreeBindingAdapter.prototype.expandToLevel = function (iLevel) {
    this._mTreeState.collapsed = {};
    this.setNumberOfExpandedLevels(iLevel);
    this._fireChange({ reason: ChangeReason.Expand });
};
TreeBindingAdapter.prototype.isExpanded = function (iIndex) {
    var oNode = this.findNode(iIndex);
    return oNode && oNode.nodeState ? oNode.nodeState.expanded : false;
};
TreeBindingAdapter.prototype.collapse = function (vParam, bSuppressChange) {
    var oNodeStateForCollapsingNode;
    var that = this;
    if (typeof vParam === "object") {
        oNodeStateForCollapsingNode = vParam;
    }
    else if (typeof vParam === "number") {
        var oNode = this.findNode(vParam);
        if (!oNode) {
            assert(false, "No node found for index " + vParam);
            return;
        }
        oNodeStateForCollapsingNode = oNode.nodeState;
    }
    this._updateTreeState({ groupID: oNodeStateForCollapsingNode.groupID, fallbackNodeState: oNodeStateForCollapsingNode, expanded: false });
    oNodeStateForCollapsingNode.selectAllMode = false;
    if (this.bCollapseRecursive) {
        var sGroupIDforCollapsingNode = oNodeStateForCollapsingNode.groupID;
        each(this._mTreeState.expanded, function (sGroupID, oNodeState) {
            if (typeof sGroupIDforCollapsingNode == "string" && sGroupIDforCollapsingNode.length > 0 && sGroupID.startsWith(sGroupIDforCollapsingNode)) {
                that._updateTreeState({ groupID: sGroupID, expanded: false });
            }
        });
        var aDeselectedNodeIds = [];
        each(this._mTreeState.selected, function (sGroupID, oNodeState) {
            if (typeof sGroupIDforCollapsingNode == "string" && sGroupIDforCollapsingNode.length > 0 && sGroupID.startsWith(sGroupIDforCollapsingNode) && sGroupID !== sGroupIDforCollapsingNode) {
                oNodeState.selectAllMode = false;
                that.setNodeSelection(oNodeState, false);
                aDeselectedNodeIds.push(sGroupID);
            }
        });
        if (aDeselectedNodeIds.length) {
            var selectionChangeParams = {
                rowIndices: []
            };
            var iNodeCounter = -1;
            this._map(this._oRootNode, function (oNode) {
                if (!oNode || !oNode.isArtificial) {
                    iNodeCounter++;
                }
                if (oNode && aDeselectedNodeIds.indexOf(oNode.groupID) !== -1) {
                    if (oNode.groupID === this._sLeadSelectionGroupID) {
                        selectionChangeParams.oldIndex = iNodeCounter;
                        selectionChangeParams.leadIndex = -1;
                    }
                    selectionChangeParams.rowIndices.push(iNodeCounter);
                }
            });
            this._publishSelectionChanges(selectionChangeParams);
        }
    }
    if (!bSuppressChange) {
        this._fireChange({ reason: ChangeReason.Collapse });
    }
};
TreeBindingAdapter.prototype.collapseToLevel = function (iLevel) {
    if (!iLevel || iLevel < 0) {
        iLevel = 0;
    }
    var that = this;
    each(this._mTreeState.expanded, function (sGroupID, oNodeState) {
        var iNodeLevel = that._getGroupIdLevel(sGroupID) - 1;
        if (iNodeLevel === iLevel) {
            that.collapse(oNodeState, true);
        }
    });
    if (this.bCollapseRecursive) {
        this.setNumberOfExpandedLevels(iLevel);
    }
    this._fireChange({ reason: ChangeReason.Collapse });
};
TreeBindingAdapter.prototype._map = function (oNode, fnMapFunction) {
    fnMapFunction.call(this, oNode);
    if (!oNode) {
        return;
    }
    for (var i = 0; i < oNode.children.length; i++) {
        var oChildNode = oNode.children[i];
        this._map(oChildNode, fnMapFunction);
    }
    if (this._afterMapHook) {
        this._afterMapHook(oNode, fnMapFunction);
    }
};
TreeBindingAdapter.prototype._match = function (oNode, aResults, iMaxNumberOfMatches, fnMatchFunction, iPositionInParent, oParentNode) {
    if (aResults.length === iMaxNumberOfMatches) {
        return true;
    }
    var bNodeMatches = fnMatchFunction.call(this, oNode, iPositionInParent, oParentNode);
    if (bNodeMatches) {
        aResults.push(oNode);
    }
    if (!oNode) {
        return false;
    }
    for (var i = 0; i < oNode.children.length; i++) {
        var oChildNode = oNode.children[i];
        var bMaxNumberReached = this._match(oChildNode, aResults, iMaxNumberOfMatches, fnMatchFunction, i, oNode);
        if (bMaxNumberReached) {
            return true;
        }
    }
    return this._afterMatchHook ? this._afterMatchHook(oNode, aResults, iMaxNumberOfMatches, fnMatchFunction, iPositionInParent, oParentNode) : false;
};
TreeBindingAdapter.prototype.toggleIndex = function (iIndex) {
    var oNode = this.findNode(iIndex);
    if (!oNode) {
        assert(false, "There is no node at index " + iIndex + ".");
        return;
    }
    if (oNode.nodeState.expanded) {
        this.collapse(iIndex);
    }
    else {
        this.expand(iIndex);
    }
};
TreeBindingAdapter.prototype._getGroupIdLevel = function (sGroupID) {
    if (sGroupID == null) {
        Log.warning("assertion failed: no need to determine level of group ID = null");
        return -1;
    }
    return sGroupID.split("/").length - 2;
};
TreeBindingAdapter.prototype._getGroupSize = function (oNode) {
    return this.getChildCount(oNode.context);
};
TreeBindingAdapter.prototype.setNodeSelection = function (oNodeState, bIsSelected) {
    if (!oNodeState.groupID) {
        assert(false, "NodeState must have a group ID!");
        return;
    }
    oNodeState.selected = bIsSelected;
    if (bIsSelected) {
        this._mTreeState.selected[oNodeState.groupID] = oNodeState;
        delete this._mTreeState.deselected[oNodeState.groupID];
    }
    else {
        delete this._mTreeState.selected[oNodeState.groupID];
        this._mTreeState.deselected[oNodeState.groupID] = oNodeState;
    }
};
TreeBindingAdapter.prototype.isIndexSelected = function (iRowIndex) {
    var oNode = this.getNodeByIndex(iRowIndex);
    return oNode && oNode.nodeState ? oNode.nodeState.selected : false;
};
TreeBindingAdapter.prototype.isIndexSelectable = function (iRowIndex) {
    var oNode = this.getNodeByIndex(iRowIndex);
    return this._isNodeSelectable(oNode);
};
TreeBindingAdapter.prototype._isNodeSelectable = function (oNode) {
    return !!oNode && !oNode.isArtificial;
};
TreeBindingAdapter.prototype.setSelectedIndex = function (iRowIndex) {
    var oNode = this.findNode(iRowIndex);
    if (oNode && this._isNodeSelectable(oNode)) {
        var oChanges = this._clearSelection();
        var iChangedIndex = oChanges.rowIndices.indexOf(iRowIndex);
        if (iChangedIndex >= 0) {
            oChanges.rowIndices.splice(iChangedIndex, 1);
        }
        else {
            oChanges.rowIndices.push(iRowIndex);
        }
        oChanges.leadGroupID = oNode.groupID;
        oChanges.leadIndex = iRowIndex;
        this.setNodeSelection(oNode.nodeState, true);
        this._publishSelectionChanges(oChanges);
    }
    else {
        Log.warning("TreeBindingAdapter: The selection was ignored. Please make sure to only select rows, for which data has been fetched to the client. For AnalyticalTables, some rows might not be selectable at all.");
    }
};
TreeBindingAdapter.prototype.getSelectedIndex = function () {
    if (!this._sLeadSelectionGroupID || isEmptyObject(this._mTreeState.selected)) {
        return -1;
    }
    var iNodeCounter = -1;
    var nodeFound = false;
    var fnMatchFunction = function (oNode) {
        if (!oNode || !oNode.isArtificial) {
            iNodeCounter++;
        }
        if (oNode) {
            if (oNode.groupID === this._sLeadSelectionGroupID) {
                nodeFound = true;
                return true;
            }
        }
    };
    this._match(this._oRootNode, [], 1, fnMatchFunction);
    if (nodeFound) {
        return iNodeCounter;
    }
    return -1;
};
TreeBindingAdapter.prototype.getSelectedIndices = function () {
    var aResultIndices = [];
    var that = this;
    if (isEmptyObject(this._mTreeState.selected)) {
        return aResultIndices;
    }
    var iNumberOfNodesToSelect = Object.keys(this._mTreeState.selected).length;
    var iNodeCounter = -1;
    var fnMatchFunction = function (oNode) {
        if (!oNode || !oNode.isArtificial) {
            iNodeCounter++;
        }
        if (oNode) {
            if (oNode.nodeState && oNode.nodeState.selected && !oNode.isArtificial) {
                aResultIndices.push(iNodeCounter);
                that._aRowIndexMap[iNodeCounter] = oNode;
                return true;
            }
        }
    };
    this._match(this._oRootNode, [], iNumberOfNodesToSelect, fnMatchFunction);
    return aResultIndices;
};
TreeBindingAdapter.prototype.getSelectedNodesCount = function () {
    var iSelectedNodes;
    if (this._oRootNode && this._oRootNode.nodeState.selectAllMode) {
        var sGroupId, iVisibleDeselectedNodeCount, oParent, oGroupNodeState;
        var oContext, aVisibleGroupIds = [];
        if (this.filterInfo && this.oCombinedFilter) {
            for (var i = this.filterInfo.aFilteredContexts.length - 1; i >= 0; i--) {
                oContext = this.filterInfo.aFilteredContexts[i];
                aVisibleGroupIds.push(this._calculateGroupID({
                    context: oContext
                }));
            }
        }
        iVisibleDeselectedNodeCount = 0;
        for (sGroupId in this._mTreeState.expanded) {
            if (!this.oCombinedFilter || aVisibleGroupIds.indexOf(sGroupId) !== -1) {
                oGroupNodeState = this._mTreeState.expanded[sGroupId];
                if (!oGroupNodeState.selectAllMode && oGroupNodeState.leafCount !== undefined) {
                    iVisibleDeselectedNodeCount += oGroupNodeState.leafCount;
                }
            }
        }
        for (sGroupId in this._mTreeState.selected) {
            if (!this.oCombinedFilter || aVisibleGroupIds.indexOf(sGroupId) !== -1) {
                oGroupNodeState = this._mTreeState.selected[sGroupId];
                oParent = this._mTreeState.expanded[oGroupNodeState.parentGroupID];
                if (oParent && !oParent.selectAllMode) {
                    iVisibleDeselectedNodeCount--;
                }
            }
        }
        for (sGroupId in this._mTreeState.deselected) {
            if (!this.oCombinedFilter || aVisibleGroupIds.indexOf(sGroupId) !== -1) {
                oGroupNodeState = this._mTreeState.deselected[sGroupId];
                oParent = this._mTreeState.expanded[oGroupNodeState.parentGroupID];
                if (oParent && oParent.selectAllMode) {
                    iVisibleDeselectedNodeCount++;
                }
            }
        }
        iSelectedNodes = this._getSelectableNodesCount(this._oRootNode) - iVisibleDeselectedNodeCount;
    }
    else {
        iSelectedNodes = Object.keys(this._mTreeState.selected).length;
    }
    return iSelectedNodes;
};
TreeBindingAdapter.prototype._getSelectableNodesCount = function (oNode) {
    if (oNode) {
        return oNode.magnitude;
    }
    else {
        return 0;
    }
};
TreeBindingAdapter.prototype.getSelectedContexts = function () {
    var aResultContexts = [];
    var that = this;
    if (isEmptyObject(this._mTreeState.selected)) {
        return aResultContexts;
    }
    var iNumberOfNodesToSelect = Object.keys(this._mTreeState.selected).length;
    var iNodeCounter = -1;
    var fnMatchFunction = function (oNode) {
        if (!oNode || !oNode.isArtificial) {
            iNodeCounter++;
        }
        if (oNode) {
            if (oNode.nodeState && oNode.nodeState.selected && !oNode.isArtificial) {
                aResultContexts.push(oNode.context);
                that._aRowIndexMap[iNodeCounter] = oNode;
                return true;
            }
        }
    };
    this._match(this._oRootNode, [], iNumberOfNodesToSelect, fnMatchFunction);
    return aResultContexts;
};
TreeBindingAdapter.prototype.setSelectionInterval = function (iFromIndex, iToIndex) {
    var mClearParams = this._clearSelection();
    var mSetParams = this._setSelectionInterval(iFromIndex, iToIndex, true);
    var mIndicesFound = {};
    var aRowIndices = [];
    for (var i = 0; i < mClearParams.rowIndices.length; i++) {
        var iIndex = mClearParams.rowIndices[i];
        mIndicesFound[iIndex] = true;
    }
    for (i = 0; i < mSetParams.rowIndices.length; i++) {
        iIndex = mSetParams.rowIndices[i];
        if (mIndicesFound[iIndex]) {
            delete mIndicesFound[iIndex];
        }
        else {
            mIndicesFound[iIndex] = true;
        }
    }
    for (iIndex in mIndicesFound) {
        if (mIndicesFound[iIndex]) {
            aRowIndices.push(parseInt(iIndex));
        }
    }
    this._publishSelectionChanges({
        rowIndices: aRowIndices,
        oldIndex: mClearParams.oldIndex,
        leadIndex: mSetParams.leadIndex,
        leadGroupID: mSetParams.leadGroupID
    });
};
TreeBindingAdapter.prototype._setSelectionInterval = function (iFromIndex, iToIndex, bSelectionValue) {
    var iNewFromIndex = Math.min(iFromIndex, iToIndex);
    var iNewToIndex = Math.max(iFromIndex, iToIndex);
    var aNewlySelectedNodes = [];
    var aChangedIndices = [];
    var iNumberOfNodesToSelect = Math.abs(iNewToIndex - iNewFromIndex) + 1;
    var iOldLeadIndex;
    var iNodeCounter = -1;
    var fnMatchFunction = function (oNode) {
        if (!oNode || !oNode.isArtificial) {
            iNodeCounter++;
        }
        if (oNode) {
            if (iNodeCounter >= iNewFromIndex && iNodeCounter <= iNewToIndex) {
                if (this._isNodeSelectable(oNode)) {
                    if (oNode.nodeState.selected !== !!bSelectionValue) {
                        aChangedIndices.push(iNodeCounter);
                    }
                    if (oNode.groupID === this._sLeadSelectionGroupID) {
                        iOldLeadIndex = iNodeCounter;
                    }
                    this.setNodeSelection(oNode.nodeState, !!bSelectionValue);
                }
                return true;
            }
        }
    };
    this._match(this._oRootNode, aNewlySelectedNodes, iNumberOfNodesToSelect, fnMatchFunction);
    var mParams = {
        rowIndices: aChangedIndices,
        oldIndex: iOldLeadIndex,
        leadIndex: iOldLeadIndex && !bSelectionValue ? -1 : undefined
    };
    if (aNewlySelectedNodes.length > 0 && bSelectionValue) {
        var oLeadSelectionNode = aNewlySelectedNodes[aNewlySelectedNodes.length - 1];
        mParams.leadGroupID = oLeadSelectionNode.groupID;
        mParams.leadIndex = iNewToIndex;
    }
    return mParams;
};
TreeBindingAdapter.prototype.addSelectionInterval = function (iFromIndex, iToIndex) {
    var mParams = this._setSelectionInterval(iFromIndex, iToIndex, true);
    this._publishSelectionChanges(mParams);
};
TreeBindingAdapter.prototype.removeSelectionInterval = function (iFromIndex, iToIndex) {
    var mParams = this._setSelectionInterval(iFromIndex, iToIndex, false);
    this._publishSelectionChanges(mParams);
};
TreeBindingAdapter.prototype.selectAll = function () {
    this._mTreeState.deselected = {};
    var mParams = {
        rowIndices: [],
        oldIndex: -1,
        selectAll: true
    };
    var iNodeCounter = -1;
    this._map(this._oRootNode, function (oNode) {
        if (!oNode || !oNode.isArtificial) {
            iNodeCounter++;
        }
        if (oNode) {
            if (oNode.groupID === this._sLeadSelectionGroupID) {
                mParams.oldIndex = iNodeCounter;
            }
            if (this._isNodeSelectable(oNode)) {
                if (oNode.nodeState.selected !== true) {
                    mParams.rowIndices.push(iNodeCounter);
                }
                this.setNodeSelection(oNode.nodeState, true);
                mParams.leadGroupID = oNode.groupID;
                mParams.leadIndex = iNodeCounter;
            }
            if (oNode.nodeState.expanded) {
                oNode.nodeState.selectAllMode = true;
            }
        }
    });
    this._publishSelectionChanges(mParams);
};
TreeBindingAdapter.prototype._clearSelection = function () {
    var iNodeCounter = -1;
    var iOldLeadIndex = -1;
    var iMaxNumberOfMatches;
    var aChangedIndices = [];
    if (this._oRootNode && !this._oRootNode.nodeState.selectAllMode) {
        iMaxNumberOfMatches = 0;
        for (var sGroupID in this._mTreeState.selected) {
            if (sGroupID) {
                iMaxNumberOfMatches++;
            }
        }
    }
    var fnMatch = function (oNode) {
        if (!oNode || !oNode.isArtificial) {
            iNodeCounter++;
        }
        if (oNode) {
            oNode.nodeState.selectAllMode = false;
            if (this._mTreeState.selected[oNode.groupID]) {
                if (!oNode.isArtificial) {
                    aChangedIndices.push(iNodeCounter);
                }
                this.setNodeSelection(oNode.nodeState, false);
                if (oNode.groupID === this._sLeadSelectionGroupID) {
                    iOldLeadIndex = iNodeCounter;
                }
                return true;
            }
        }
    };
    this._match(this._oRootNode, [], iMaxNumberOfMatches, fnMatch);
    if (this._oRootNode && this._oRootNode.nodeState && this._oRootNode.isArtificial) {
        this._oRootNode.nodeState.selectAllMode = false;
    }
    return {
        rowIndices: aChangedIndices,
        oldIndex: iOldLeadIndex,
        leadIndex: -1
    };
};
TreeBindingAdapter.prototype.clearSelection = function (bSuppresSelectionChangeEvent) {
    var oChanges = this._clearSelection();
    if (!bSuppresSelectionChangeEvent) {
        this._publishSelectionChanges(oChanges);
    }
};
TreeBindingAdapter.prototype._publishSelectionChanges = function (mParams) {
    mParams.oldIndex = mParams.oldIndex || this.getSelectedIndex();
    mParams.rowIndices.sort(function (a, b) {
        return a - b;
    });
    if (mParams.leadIndex >= 0 && mParams.leadGroupID) {
        this._sLeadSelectionGroupID = mParams.leadGroupID;
    }
    else if (mParams.leadIndex === -1) {
        this._sLeadSelectionGroupID = undefined;
    }
    else {
        mParams.leadIndex = mParams.oldIndex;
    }
    if (mParams.rowIndices.length > 0 || (mParams.leadIndex != undefined && mParams.leadIndex !== -1)) {
        this.fireSelectionChanged(mParams);
    }
};
TreeBindingAdapter.prototype.setCollapseRecursive = function (bCollapseRecursive) {
    this.bCollapseRecursive = !!bCollapseRecursive;
};
TreeBindingAdapter.prototype.getCollapseRecursive = function () {
    return this.bCollapseRecursive;
};
TreeBindingAdapter.prototype.attachSelectionChanged = function (oData, fnFunction, oListener) {
    this.attachEvent("selectionChanged", oData, fnFunction, oListener);
    return this;
};
TreeBindingAdapter.prototype.detachSelectionChanged = function (fnFunction, oListener) {
    this.detachEvent("selectionChanged", fnFunction, oListener);
    return this;
};
TreeBindingAdapter.prototype.fireSelectionChanged = function (oParameters) {
    this.fireEvent("selectionChanged", oParameters);
    return this;
};