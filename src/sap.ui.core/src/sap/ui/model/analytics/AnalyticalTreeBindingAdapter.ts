import AnalyticalBinding from "./AnalyticalBinding";
import assert from "sap/base/assert";
import Log from "sap/base/Log";
import each from "sap/base/util/each";
import ChangeReason from "sap/ui/model/ChangeReason";
import TreeAutoExpandMode from "sap/ui/model/TreeAutoExpandMode";
import TreeBinding from "sap/ui/model/TreeBinding";
import TreeBindingAdapter from "sap/ui/model/TreeBindingAdapter";
import ODataTreeBindingAdapter from "sap/ui/model/odata/ODataTreeBindingAdapter";
var AnalyticalTreeBindingAdapter = function () {
    if (!(this instanceof TreeBinding) || this._bIsAdapted) {
        return;
    }
    ODataTreeBindingAdapter.apply(this);
    for (var fn in AnalyticalTreeBindingAdapter.prototype) {
        if (AnalyticalTreeBindingAdapter.prototype.hasOwnProperty(fn)) {
            this[fn] = AnalyticalTreeBindingAdapter.prototype[fn];
        }
    }
    this.setAutoExpandMode(this.mParameters.autoExpandMode || TreeAutoExpandMode.Bundled);
}, sClassName = "sap.ui.model.analytics.AnalyticalTreeBindingAdapter";
AnalyticalTreeBindingAdapter.prototype.getGrandTotalContext = function () {
    if (this._oRootNode) {
        return this._oRootNode.context;
    }
};
AnalyticalTreeBindingAdapter.prototype.getGrandTotalNode = function () {
    if (this._oRootNode) {
        return this._oRootNode;
    }
};
AnalyticalTreeBindingAdapter.prototype.getGrandTotalContextInfo = function () {
    return this._oRootNode;
};
AnalyticalTreeBindingAdapter.prototype.getLength = function () {
    if (!this._oRootNode) {
        return 0;
    }
    if (this._oRootNode && this._oWatermark && this._isRunningInAutoExpand(TreeAutoExpandMode.Bundled)) {
        if (this._oWatermark.groupID === this._oRootNode.groupID) {
            return this._oRootNode.magnitude + this._oRootNode.numberOfTotals;
        }
        return this._oWatermark.absoluteNodeIndex + this._oRootNode.numberOfTotals + 1;
    }
    return this._oRootNode.magnitude + this._oRootNode.numberOfTotals;
};
AnalyticalTreeBindingAdapter.prototype.getContextByIndex = function (iIndex) {
    if (this._oRootNode && iIndex === (this.getLength() - 1) && this.providesGrandTotal() && this.hasTotaledMeasures()) {
        return this._oRootNode.context;
    }
    var oNode = this.findNode(iIndex);
    if (!oNode || !oNode.context) {
        oNode = { context: this.getContexts(iIndex, 1, 0)[0] };
    }
    return oNode ? oNode.context : undefined;
};
AnalyticalTreeBindingAdapter.prototype.getNodeByIndex = function (iIndex) {
    if (iIndex === (this.getLength() - 1) && this.providesGrandTotal() && this.hasTotaledMeasures()) {
        return this._oRootNode;
    }
    if (iIndex >= this.getLength()) {
        return undefined;
    }
    return this.findNode(iIndex);
};
AnalyticalTreeBindingAdapter.prototype._isNodeSelectable = function (oNode) {
    if (!oNode) {
        return false;
    }
    return oNode.isLeaf && !oNode.isArtificial;
};
AnalyticalTreeBindingAdapter.prototype._getContextsOrNodes = function (bReturnNodes, iStartIndex, iLength, iThreshold) {
    if (!this.isResolved()) {
        return [];
    }
    if (!iLength) {
        iLength = this.oModel.iSizeLimit;
    }
    if (!iThreshold) {
        iThreshold = 0;
    }
    this._iPageSize = iLength;
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
        if (this._isRunningInAutoExpand(TreeAutoExpandMode.Bundled) && this._oWatermark) {
            if (oNode.groupID === this._oWatermark.groupID || (this._oWatermark.groupID === this._oRootNode.groupID && (iStartIndex + i + 1) == this.getLength() - 1)) {
                this._autoExpandPaging();
            }
        }
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
            that._loadChildContexts(oNode, { absoluteNodeIndex: oNode.absoluteNodeIndex });
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
AnalyticalTreeBindingAdapter.prototype._autoExpandPaging = function () {
    assert(this._oWatermark, "No watermark was set!");
    assert(this._isRunningInAutoExpand(TreeAutoExpandMode.Bundled), "Optimised AutoExpand Paging can only be used with TreeAutoExpandMode.Bundled!");
    var aChildContexts = this.getNodeContexts(this._oWatermark.context, {
        startIndex: this._oWatermark.startIndex,
        length: this._iPageSize,
        threshold: this._iThreshold,
        level: this._oWatermark.level,
        numberOfExpandedLevels: this._oWatermark.autoExpand
    });
    return aChildContexts;
};
AnalyticalTreeBindingAdapter.prototype._afterMatchHook = function (oNode, aResults, iMaxNumberOfMatches, fnMatchFunction, iPositionInParent, oParentNode) {
    if (oNode.sumNode && oNode !== this._oRootNode) {
        if (aResults.length === iMaxNumberOfMatches) {
            return true;
        }
        var bNodeMatches = fnMatchFunction.call(this, oNode.sumNode, oNode.sumNode.positionInParent, oParentNode);
        if (bNodeMatches) {
            aResults.push(oNode.sumNode);
        }
    }
};
AnalyticalTreeBindingAdapter.prototype._afterMapHook = function (oNode, fnMapFunction) {
    if (oNode.sumNode && oNode !== this._oRootNode) {
        fnMapFunction.call(this, oNode.sumNode);
    }
};
AnalyticalTreeBindingAdapter.prototype._createSumNode = function (oNode) {
    var sumNode;
    if (this.bProvideGrandTotals && !this.mParameters.sumOnTop && this.hasTotaledMeasures() && oNode.children.length > 1) {
        sumNode = this._createNode({
            parent: oNode.parent,
            positionInParent: oNode.children.length,
            context: oNode.context,
            level: oNode.level
        });
        sumNode.nodeState = this._createNodeState({ groupID: sumNode.groupID, sum: true, expanded: false });
    }
    return sumNode;
};
AnalyticalTreeBindingAdapter.prototype._buildTree = function (iStartIndex, iLength) {
    this._oRootNode = undefined;
    this._oWatermark = undefined;
    var iNumberOfExpandedLevels = this.mParameters && this.getNumberOfExpandedLevels();
    var aRootContext = this.getRootContexts({
        startIndex: 0,
        length: this._iPageSize,
        threshold: this._iThreshold,
        numberOfExpandedLevels: this._autoExpandMode === TreeAutoExpandMode.Bundled ? iNumberOfExpandedLevels : undefined
    });
    var oRootContext;
    if (aRootContext == null) {
        Log.warning("AnalyticalTreeBindingAdapter: No Dimensions given. An artificial rootContext has be created. Please check your Table/Service definition for dimension columns!");
    }
    else {
        oRootContext = aRootContext[0];
    }
    if (!oRootContext) {
        return;
    }
    var oRootNodeState = this._getNodeState("/");
    if (!oRootNodeState) {
        oRootNodeState = this._updateTreeState({ groupID: "/", expanded: true, sum: true });
        this._updateNodeSections("/", {
            startIndex: 0,
            length: iLength
        });
    }
    this._oRootNode = this._createNode({
        context: oRootContext,
        parent: null,
        level: 0,
        nodeState: oRootNodeState,
        isLeaf: false,
        autoExpand: iNumberOfExpandedLevels,
        absoluteNodeIndex: -1
    });
    this._oRootNode.isArtificial = true;
    this._loadChildContexts(this._oRootNode, { absoluteNodeIndex: -1 });
};
AnalyticalTreeBindingAdapter.prototype._loadChildContexts = function (oNode, oRecursionDetails) {
    var oNodeState = oNode.nodeState;
    var iMaxGroupSize = this.getGroupSize(oNode.context, oNode.level);
    if (iMaxGroupSize >= 0) {
        if (!oNode.children[iMaxGroupSize - 1]) {
            oNode.children[iMaxGroupSize - 1] = undefined;
        }
        if (oNode.level === this.aAggregationLevel.length) {
            oNodeState.leafCount = iMaxGroupSize;
        }
        oNode.sumNode = this._createSumNode(oNode);
    }
    for (var i = 0; i < oNodeState.sections.length; i++) {
        var oCurrentSection = oNodeState.sections[i];
        if (oCurrentSection.startIndex > oNode.children.length) {
            continue;
        }
        var iRequestedLength;
        if (iMaxGroupSize === -1) {
            iRequestedLength = oCurrentSection.length;
        }
        else {
            iRequestedLength = Math.min(oCurrentSection.length, iMaxGroupSize - oCurrentSection.startIndex);
        }
        var bSupressRequest = false;
        if (oNode.autoExpand >= 0 && this._isRunningInAutoExpand(TreeAutoExpandMode.Bundled)) {
            bSupressRequest = true;
            iRequestedLength = Math.max(0, iMaxGroupSize);
        }
        var aChildContexts = this.getNodeContexts(oNode.context, {
            startIndex: oCurrentSection.startIndex,
            length: iRequestedLength,
            threshold: bSupressRequest ? 0 : this._iThreshold,
            level: oNode.level,
            supressRequest: bSupressRequest
        });
        for (var j = 0; j < aChildContexts.length; j++) {
            var oChildContext = aChildContexts[j];
            var iChildIndex = j + oCurrentSection.startIndex;
            var oChildNode = oNode.children[iChildIndex];
            var oUpdatedNodeData = {
                context: aChildContexts[j],
                parent: oNode,
                level: oNode.level + 1,
                positionInParent: iChildIndex,
                autoExpand: Math.max(oNode.autoExpand - 1, -1),
                absoluteNodeIndex: (++oRecursionDetails.absoluteNodeIndex)
            };
            if (oChildNode) {
                oChildNode.context = oUpdatedNodeData.context;
                oChildNode.parent = oUpdatedNodeData.parent;
                oChildNode.level = oUpdatedNodeData.level;
                oChildNode.positionInParent = oUpdatedNodeData.positionInParent;
                oChildNode.magnitude = 0;
                oChildNode.numberOfTotals = 0;
                oChildNode.totalNumberOfLeafs = 0;
                oChildNode.autoExpand = oUpdatedNodeData.autoExpand;
                oChildNode.absoluteNodeIndex = oUpdatedNodeData.absoluteNodeIndex;
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
            if (oChildNode.parent.nodeState.selectAllMode && !this._mTreeState.deselected[oChildNode.groupID] && oChildNode.isLeaf) {
                this.setNodeSelection(oChildNode.nodeState, true);
            }
            if ((oChildNode.autoExpand >= 0 || oChildNode.nodeState.expanded) && this.isGrouped()) {
                if (!this._mTreeState.collapsed[oChildNode.groupID]) {
                    if (oChildNode.autoExpand >= 0 && oChildNode.parent.nodeState.selectAllMode && !this._mTreeState.deselected[oChildNode.groupID]) {
                        if (oChildNode.nodeState.selectAllMode === undefined) {
                            oChildNode.nodeState.selectAllMode = true;
                        }
                    }
                    this._updateTreeState({ groupID: oChildNode.nodeState.groupID, fallbackNodeState: oChildNode.nodeState, expanded: true });
                    this._loadChildContexts(oChildNode, oRecursionDetails);
                }
                oNode.magnitude += oChildNode.magnitude;
                oNode.numberOfTotals += oChildNode.numberOfTotals;
                oNode.numberOfLeafs += oChildNode.numberOfLeafs;
            }
            if (oChildNode && oChildNode.isLeaf) {
                oNode.totalNumberOfLeafs = iMaxGroupSize;
            }
            else {
                oNode.totalNumberOfLeafs += oChildNode.totalNumberOfLeafs;
            }
        }
    }
    iMaxGroupSize = this._isRunningInAutoExpand(TreeAutoExpandMode.Bundled) ? oNode.children.length : iMaxGroupSize;
    oNode.magnitude += Math.max(iMaxGroupSize || 0, 0);
    if (!iMaxGroupSize && !this._isRunningInAutoExpand(TreeAutoExpandMode.Bundled)) {
        Log.warning("AnalyticalTreeBindingAdapter: iMaxGroupSize(" + iMaxGroupSize + ") is undefined for node '" + oNode.groupID + "'!");
    }
    if (oNode.sumNode || (oNode === this._oRootNode && this.providesGrandTotal() && this.hasTotaledMeasures())) {
        oNode.numberOfTotals += 1;
    }
    if (this._isRunningInAutoExpand(TreeAutoExpandMode.Bundled) && oNode.autoExpand != -1) {
        if (!this._oWatermark && !oNode.isLeaf && !this.mFinalLength[oNode.groupID]) {
            this._oWatermark = {
                groupID: oNode.groupID,
                context: oNode.context,
                absoluteNodeIndex: oNode.absoluteNodeIndex,
                startIndex: oNode.children.length,
                level: oNode.level,
                autoExpand: oNode.autoExpand
            };
        }
    }
};
AnalyticalTreeBindingAdapter.prototype._calculateGroupID = function (oNode) {
    var sGroupID;
    var iMaxLevel = this.aAggregationLevel.length;
    if (!this.isGrouped() && oNode && oNode.positionInParent) {
        sGroupID = "/" + oNode.positionInParent + "/";
    }
    else {
        if (oNode.level > iMaxLevel) {
            sGroupID = this._getGroupIdFromContext(oNode.context, iMaxLevel);
            assert(oNode.positionInParent != undefined, "If the node level is greater than the number of grouped columns, the position of the node to its parent must be defined!");
            sGroupID += oNode.positionInParent + "/";
        }
        else {
            sGroupID = this._getGroupIdFromContext(oNode.context, oNode.level);
        }
    }
    return sGroupID;
};
AnalyticalTreeBindingAdapter.prototype.collapse = function (vParam) {
    var oNodeStateForCollapsingNode, oNode;
    if (typeof vParam === "object") {
        oNodeStateForCollapsingNode = vParam;
    }
    else if (typeof vParam === "number") {
        oNode = this.findNode(vParam);
        assert(oNode && oNode.nodeState, "AnalyticalTreeBindingAdapter.collapse(" + vParam + "): No node found!");
        if (!oNode) {
            return;
        }
        oNodeStateForCollapsingNode = oNode.nodeState;
    }
    this._updateTreeState({ groupID: oNodeStateForCollapsingNode.groupID, expanded: false });
    oNodeStateForCollapsingNode.selectAllMode = false;
    var bAutoExpandRequestTriggered = false;
    if (this.bCollapseRecursive || this._isRunningInAutoExpand(TreeAutoExpandMode.Bundled)) {
        var sGroupIDforCollapsingNode = oNodeStateForCollapsingNode.groupID;
        if (this._isRunningInAutoExpand(TreeAutoExpandMode.Bundled) && this._oWatermark && (typeof sGroupIDforCollapsingNode == "string" && sGroupIDforCollapsingNode.length > 0 && this._oWatermark.groupID.startsWith(sGroupIDforCollapsingNode))) {
            if (oNode && oNode.parent) {
                this._oWatermark = {
                    groupID: oNode.parent.groupID,
                    context: oNode.parent.context,
                    absoluteNodeIndex: oNode.parent.absoluteNodeIndex,
                    startIndex: oNode.positionInParent + 1,
                    level: oNode.parent.level,
                    autoExpand: oNode.parent.autoExpand
                };
            }
            this._autoExpandPaging();
            bAutoExpandRequestTriggered = true;
        }
        var that = this;
        each(this._mTreeState.expanded, function (sGroupID, oNodeState) {
            if (typeof sGroupIDforCollapsingNode == "string" && sGroupIDforCollapsingNode.length > 0 && sGroupID.startsWith(sGroupIDforCollapsingNode)) {
                that._updateTreeState({ groupID: sGroupID, expanded: false });
            }
        });
        var aDeselectedNodeIds = [];
        each(this._mTreeState.selected, function (sGroupID, oNodeState) {
            if (typeof sGroupIDforCollapsingNode == "string" && sGroupIDforCollapsingNode.length > 0 && sGroupID.startsWith(sGroupIDforCollapsingNode)) {
                oNodeState.selectAllMode = false;
                that.setNodeSelection(oNodeState, false);
                aDeselectedNodeIds.push(sGroupID);
            }
        });
        if (aDeselectedNodeIds.length) {
            var selectionChangeParams = {
                rowIndices: []
            };
            var iNodeCounter = 0;
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
    if (!bAutoExpandRequestTriggered) {
        this._fireChange({ reason: ChangeReason.Collapse });
    }
};
AnalyticalTreeBindingAdapter.prototype.collapseToLevel = function (iLevel) {
    this.setNumberOfExpandedLevels(iLevel, true);
    TreeBindingAdapter.prototype.collapseToLevel.call(this, iLevel);
};
AnalyticalTreeBindingAdapter.prototype.nodeHasChildren = function (oNode) {
    assert(oNode, "AnalyticalTreeBindingAdapter.nodeHasChildren: No node given!");
    if (!oNode || !oNode.parent || oNode.nodeState.sum) {
        return false;
    }
    else if (oNode.isArtificial) {
        return true;
    }
    else {
        return AnalyticalBinding.prototype.hasChildren.call(this, oNode.context, { level: oNode.level });
    }
};
AnalyticalTreeBindingAdapter.prototype.resetData = function (oContext, mParameters) {
    var vReturn = AnalyticalBinding.prototype.resetData.call(this, oContext, mParameters);
    this._aRowIndexMap = [];
    this._oRootNode = undefined;
    this._oWatermark = undefined;
    this._iPageSize = 0;
    this._iThreshold = 0;
    if (!mParameters || mParameters.reason !== ChangeReason.Sort) {
        this.clearSelection();
        this._createTreeState(true);
    }
    return vReturn;
};
AnalyticalTreeBindingAdapter.prototype.hasTotaledMeasures = function () {
    var bHasMeasures = false;
    each(this.getMeasureDetails() || [], function (iIndex, oMeasure) {
        if (oMeasure.analyticalInfo.total) {
            bHasMeasures = true;
            return false;
        }
    });
    return bHasMeasures;
};
AnalyticalTreeBindingAdapter.prototype.isGrouped = function () {
    return (this.aAggregationLevel.length > 0);
};
AnalyticalTreeBindingAdapter.prototype._isRunningInAutoExpand = function (sAutoExpandMode) {
    if (this.getNumberOfExpandedLevels() > 0 && this._autoExpandMode === sAutoExpandMode) {
        return true;
    }
    else {
        return false;
    }
};
AnalyticalTreeBindingAdapter.prototype.setNumberOfExpandedLevels = function (iLevels, bSupressResetData) {
    var iNumberOfAggregationLevels;
    iLevels = iLevels || 0;
    if (iLevels < 0) {
        Log.warning("Number of expanded levels was set to 0. Negative values are prohibited", this, sClassName);
        iLevels = 0;
    }
    iNumberOfAggregationLevels = this.aAggregationLevel.length;
    if (iLevels > iNumberOfAggregationLevels) {
        Log.warning("Number of expanded levels was reduced from " + iLevels + " to " + iNumberOfAggregationLevels + " which is the number of grouped dimensions", this, sClassName);
        iLevels = iNumberOfAggregationLevels;
    }
    if (!bSupressResetData) {
        this.resetData();
    }
    this.mParameters.numberOfExpandedLevels = iLevels;
};
AnalyticalTreeBindingAdapter.prototype.getNumberOfExpandedLevels = function () {
    return this.mParameters.numberOfExpandedLevels;
};
AnalyticalTreeBindingAdapter.prototype._getSelectableNodesCount = function (oNode) {
    if (oNode) {
        return oNode.totalNumberOfLeafs;
    }
    else {
        return 0;
    }
};