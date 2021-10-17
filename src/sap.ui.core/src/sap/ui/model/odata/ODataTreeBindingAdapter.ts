import TreeBinding from "sap/ui/model/TreeBinding";
import ODataTreeBinding from "./v2/ODataTreeBinding";
import TreeBindingAdapter from "sap/ui/model/TreeBindingAdapter";
import TreeAutoExpandMode from "sap/ui/model/TreeAutoExpandMode";
import ChangeReason from "sap/ui/model/ChangeReason";
import OperationMode from "./OperationMode";
import assert from "sap/base/assert";
import Filter from "sap/ui/model/Filter";
import ODataUtils from "sap/ui/model/odata/ODataUtils";
var ODataTreeBindingAdapter = function () {
    if (!(this instanceof TreeBinding) || this._bIsAdapted) {
        return;
    }
    TreeBindingAdapter.apply(this);
    for (var fn in ODataTreeBindingAdapter.prototype) {
        if (ODataTreeBindingAdapter.prototype.hasOwnProperty(fn)) {
            this[fn] = ODataTreeBindingAdapter.prototype[fn];
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
    if (this.mParameters.treeState && this.sOperationMode == OperationMode.Client) {
        this.setTreeState(this.mParameters.treeState);
    }
};
ODataTreeBindingAdapter.prototype.nodeHasChildren = function (oNode) {
    assert(oNode, "ODataTreeBindingAdapter.nodeHasChildren: No node given!");
    if (!oNode) {
        return false;
    }
    else if (oNode.isArtificial) {
        return true;
    }
    else {
        return ODataTreeBinding.prototype.hasChildren.call(this, oNode.context);
    }
};
ODataTreeBindingAdapter.prototype._calculateGroupID = function (oNode) {
    var sGroupIDBase = "";
    var sGroupIDSuffix = "";
    var sEncodedValue;
    if (oNode.context === null) {
        return "/";
    }
    if (oNode.parent) {
        sGroupIDBase = oNode.parent.groupID;
        sGroupIDBase = sGroupIDBase[sGroupIDBase.length - 1] !== "/" ? sGroupIDBase + "/" : sGroupIDBase;
        if (this.bHasTreeAnnotations) {
            sEncodedValue = (oNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]) + "").replace(/\//g, "%2F");
            sGroupIDSuffix = sEncodedValue + "/";
        }
        else {
            sGroupIDSuffix = oNode.context.sPath.substring(1) + "/";
        }
    }
    else {
        if (this.bHasTreeAnnotations) {
            sGroupIDBase = "/";
            sEncodedValue = (oNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]) + "").replace(/\//g, "%2F");
            sGroupIDSuffix = sEncodedValue + "/";
        }
        else {
            sGroupIDBase = "/";
            sGroupIDSuffix = oNode.context.sPath[0] === "/" ? oNode.context.sPath.substring(1) : oNode.context.sPath;
        }
    }
    var sGroupID = sGroupIDBase + sGroupIDSuffix;
    return sGroupID;
};
ODataTreeBindingAdapter.prototype.resetData = function (oContext, mParameters) {
    var vReturn = ODataTreeBinding.prototype.resetData.call(this, oContext, mParameters);
    this._aRowIndexMap = [];
    this._oRootNode = undefined;
    this._iPageSize = 0;
    this._iThreshold = 0;
    if (!mParameters || mParameters.reason !== ChangeReason.Sort) {
        this.clearSelection();
        this._createTreeState(true);
    }
    return vReturn;
};
ODataTreeBindingAdapter.prototype.expandNodeToLevel = function (iIndex, iLevel, bSuppressChange) {
    var that = this;
    if (this.sOperationMode !== "Server") {
        return Promise.reject(new Error("expandNodeToLevel() does not support binding operation modes other than OperationMode.Server"));
    }
    var oNode = this.findNode(iIndex), aParams = [], sApplicationFilters = "";
    if (this.sOperationMode == "Server" || this.bUseServersideApplicationFilters) {
        sApplicationFilters = this.getFilterParams();
    }
    var sNodeIdForFilter = oNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]);
    var oEntityType = this._getEntityType();
    var sNodeFilterParameter = ODataUtils._createFilterParams(new Filter(this.oTreeProperties["hierarchy-node-for"], "EQ", sNodeIdForFilter), this.oModel.oMetadata, oEntityType);
    var sLevelFilter = this._getLevelFilterParams("LE", iLevel);
    aParams.push("$filter=" + sNodeFilterParameter + "%20and%20" + sLevelFilter + (sApplicationFilters ? "%20and%20" + sApplicationFilters : ""));
    if (this.sCustomParams) {
        aParams.push(this.sCustomParams);
    }
    return this._loadSubTree(oNode, aParams).then(function (oData) {
        var aEntries = oData.results.filter(function (oEntry) {
            return oEntry[that.oTreeProperties["hierarchy-level-for"]] < iLevel;
        });
        this._expandSubTree(oNode, aEntries);
        if (!bSuppressChange) {
            this._fireChange({ reason: ChangeReason.Expand });
        }
    }.bind(this));
};
ODataTreeBindingAdapter.prototype._expandSubTree = function (oParentNode, aData) {
    this._updateTreeState({ groupID: oParentNode.groupID, expanded: true });
    var sParentNodeID, sParentGroupID, sNodeId, mParentGroupIDs = {}, i;
    sNodeId = oParentNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]);
    mParentGroupIDs[sNodeId] = oParentNode.groupID;
    for (i = 1; i < aData.length; i++) {
        var sId, sKey, sGroupID, oEntry, oContext;
        oEntry = aData[i];
        sId = oEntry[this.oTreeProperties["hierarchy-node-for"]];
        sParentNodeID = oEntry[this.oTreeProperties["hierarchy-parent-node-for"]];
        if (oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "leaf") {
            continue;
        }
        sKey = this.oModel._getKey(oEntry);
        oContext = this.oModel.getContext("/" + sKey);
        sParentGroupID = mParentGroupIDs[sParentNodeID];
        sGroupID = this._calculateGroupID({
            parent: {
                groupID: sParentGroupID
            },
            context: oContext
        });
        mParentGroupIDs[sId] = sGroupID;
        this._updateTreeState({
            groupID: sGroupID,
            expanded: true
        });
    }
};
ODataTreeBindingAdapter.prototype.getLength = function () {
    if ((!this._oRootNode || !this._oRootNode.magnitude) && this.oFinalLengths[null]) {
        return this.oLengths[null];
    }
    return TreeBindingAdapter.prototype.getLength.apply(this);
};