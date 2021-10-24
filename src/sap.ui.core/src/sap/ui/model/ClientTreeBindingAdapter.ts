import TreeBinding from "sap/ui/model/TreeBinding";
import ClientTreeBinding from "sap/ui/model/ClientTreeBinding";
import TreeBindingAdapter from "./TreeBindingAdapter";
import ChangeReason from "sap/ui/model/ChangeReason";
import assert from "sap/base/assert";
import Log from "sap/base/Log";
export class ClientTreeBindingAdapter {
    setNumberOfExpandedLevels(iNumberOfExpandedLevels: any) {
        this._iNumberOfExpandedLevels = parseInt(iNumberOfExpandedLevels);
    }
    getNumberOfExpandedLevels(...args: any) {
        return this._iNumberOfExpandedLevels;
    }
    nodeHasChildren(oNode: any) {
        assert(oNode, "TreeBindingAdapter.nodeHasChildren: No node given!");
        if (!oNode) {
            return false;
        }
        else if (oNode.isArtificial) {
            return true;
        }
        else {
            return ClientTreeBinding.prototype.hasChildren.call(this, oNode.context);
        }
    }
    resetData(oContext: any, mParameters: any) {
        var vReturn = ClientTreeBinding.prototype.resetData.call(this, oContext, mParameters);
        this._aRowIndexMap = [];
        this._oRootNode = undefined;
        this._iPageSize = 0;
        this._iThreshold = 0;
        if (!mParameters || mParameters.reason !== ChangeReason.Sort) {
            this.clearSelection();
            this._createTreeState(true);
        }
        return vReturn;
    }
    private _calculateGroupID(oNode: any) {
        var sBindingPath = this.getPath();
        var sGroupId;
        if (oNode.context) {
            var sContextPath = oNode.context.getPath();
            if (sBindingPath != "/") {
                var aMatch = sContextPath.match(sBindingPath + "(.*)");
                if (aMatch != null && aMatch[1]) {
                    sGroupId = aMatch[1];
                }
                else {
                    Log.warning("CTBA: BindingPath/ContextPath matching problem!");
                }
            }
            if (!sGroupId) {
                sGroupId = sContextPath;
            }
            if (sGroupId.startsWith("/")) {
                sGroupId = sGroupId.substring(1, sGroupId.length);
            }
            var sParentGroupId;
            if (!oNode.parent) {
                sParentGroupId = this._calculateGroupID({
                    context: oNode.context._parentContext || null
                });
            }
            else {
                sParentGroupId = oNode.parent.groupID;
            }
            sGroupId = sParentGroupId + sGroupId.replace(/\//g, "_") + "/";
        }
        else if (oNode.context === null) {
            sGroupId = "/";
        }
        return sGroupId;
    }
    expand(...args: any) {
        this._buildTree();
        TreeBindingAdapter.prototype.expand.apply(this, arguments);
    }
    collapse(...args: any) {
        this._buildTree();
        TreeBindingAdapter.prototype.collapse.apply(this, arguments);
    }
    private _buildTree(iStartIndex: any, iLength: any) {
        if (this._invalidTree) {
            iStartIndex = iStartIndex || 0;
            iLength = iLength || this.getRootContexts().length;
            this._invalidTree = false;
            this._aRowIndexMap = [];
            TreeBindingAdapter.prototype._buildTree.call(this, iStartIndex, iLength);
        }
    }
    findNode(vParam: any) {
        this._buildTree();
        return TreeBindingAdapter.prototype.findNode.apply(this, arguments);
    }
    setSelectedIndex(iRowIndex: any) {
        this._buildTree();
        TreeBindingAdapter.prototype.setSelectedIndex.apply(this, arguments);
    }
    setSelectionInterval(iFromIndex: any, iToIndex: any) {
        this._buildTree();
        TreeBindingAdapter.prototype.setSelectionInterval.apply(this, arguments);
    }
    addSelectionInterval(...args: any) {
        this._buildTree();
        TreeBindingAdapter.prototype.addSelectionInterval.apply(this, arguments);
    }
    removeSelectionInterval(...args: any) {
        this._buildTree();
        TreeBindingAdapter.prototype.removeSelectionInterval.apply(this, arguments);
    }
    clearSelection(...args: any) {
        this._buildTree();
        TreeBindingAdapter.prototype.clearSelection.apply(this, arguments);
    }
    selectAll(...args: any) {
        this._buildTree();
        TreeBindingAdapter.prototype.selectAll.apply(this, arguments);
    }
    private _calculateRequestLength(iMaxGroupSize: any, oSection: any) {
        return iMaxGroupSize;
    }
    getLength(...args: any) {
        this._buildTree();
        return TreeBindingAdapter.prototype.getLength.apply(this, arguments);
    }
    private _fireChange(...args: any) {
        this._invalidTree = true;
        this.constructor.prototype._fireChange.apply(this, arguments);
    }
    constructor(...args: any) {
        if (!(this instanceof TreeBinding) || this._bIsAdapted) {
            return;
        }
        TreeBindingAdapter.apply(this);
        for (var fn in ClientTreeBindingAdapter.prototype) {
            if (ClientTreeBindingAdapter.prototype.hasOwnProperty(fn)) {
                this[fn] = ClientTreeBindingAdapter.prototype[fn];
            }
        }
        this._invalidTree = true;
        this.setNumberOfExpandedLevels(this.mParameters.numberOfExpandedLevels || 0);
    }
}