import assert from "sap/base/assert";
import Log from "sap/base/Log";
import extend from "sap/base/util/extend";
import isEmptyObject from "sap/base/util/isEmptyObject";
import uid from "sap/base/util/uid";
import ChangeReason from "sap/ui/model/ChangeReason";
import Filter from "sap/ui/model/Filter";
import TreeBinding from "sap/ui/model/TreeBinding";
import TreeBindingUtils from "sap/ui/model/TreeBindingUtils";
import ODataTreeBinding from "sap/ui/model/odata/v2/ODataTreeBinding";
var ODataTreeBindingFlat = function () {
    if (!(this instanceof TreeBinding) || this._bIsAdapted) {
        return;
    }
    for (var fn in ODataTreeBindingFlat.prototype) {
        if (ODataTreeBindingFlat.prototype.hasOwnProperty(fn)) {
            this[fn] = ODataTreeBindingFlat.prototype[fn];
        }
    }
    this.mParameters = this.mParameters || {};
    this._iPageSize = 0;
    this._aNodes = this._aNodes || [];
    this._aNodeCache = [];
    this._aCollapsed = this._aCollapsed || [];
    this._aExpanded = this._aExpanded || [];
    this._aRemoved = [];
    this._aAdded = [];
    this._aNodeChanges = [];
    this._aAllChangedNodes = [];
    this._mSubtreeHandles = {};
    this._iLowestServerLevel = null;
    this._aExpandedAfterSelectAll = this._aExpandedAfterSelectAll || [];
    this._mSelected = this._mSelected || {};
    this._mDeselected = this._mDeselected || {};
    this._bSelectAll = false;
    this._iLengthDelta = 0;
    if (this.mParameters.collapseRecursive === undefined) {
        this.bCollapseRecursive = true;
    }
    else {
        this.bCollapseRecursive = !!this.mParameters.collapseRecursive;
    }
    this._bIsAdapted = true;
    this._bReadOnly = true;
    this._aPendingRequests = [];
    this._aPendingChildrenRequests = [];
    this._aPendingSubtreeRequests = [];
};
ODataTreeBindingFlat.prototype.setNumberOfExpandedLevels = function (iLevels) {
    this.resetData();
    ODataTreeBinding.prototype.setNumberOfExpandedLevels.apply(this, arguments);
};
ODataTreeBindingFlat.prototype.getContexts = function (iStartIndex, iLength, iThreshold) {
    return this._getContextsOrNodes(false, iStartIndex, iLength, iThreshold);
};
ODataTreeBindingFlat.prototype._getContextsOrNodes = function (bReturnNodes, iStartIndex, iLength, iThreshold) {
    if (!this.isResolved() || this.isInitial()) {
        return [];
    }
    iStartIndex = iStartIndex || 0;
    iLength = iLength || this.oModel.iSizeLimit;
    iThreshold = iThreshold || 0;
    this._iPageSize = iLength;
    this._iThreshold = iThreshold;
    if (this._aNodes.length == 0 && !this.isLengthFinal()) {
        this._loadData(iStartIndex, iLength, iThreshold);
    }
    var aResultContexts = [];
    var aNodes = this._retrieveNodeSection(iStartIndex, iLength);
    this._aNodeCache = [];
    var iSkip;
    var iTop = 0;
    var iLastServerIndex = 0;
    var mGaps = {};
    for (var i = 0; i < aNodes.length; i++) {
        var oNode = aNodes[i];
        this._aNodeCache[iStartIndex + i] = oNode && oNode.context ? oNode : undefined;
        aResultContexts.push(oNode.context);
        if (!oNode.context) {
            if (oNode.serverIndex != undefined) {
                if (iSkip == undefined) {
                    iSkip = oNode.serverIndex;
                }
                iLastServerIndex = oNode.serverIndex;
            }
            else if (oNode.positionInParent != undefined) {
                var oParent = oNode.parent;
                mGaps[oParent.key] = mGaps[oParent.key] || [];
                mGaps[oParent.key].push(oNode);
            }
        }
    }
    iTop = 1 + Math.max(iLastServerIndex - (iSkip || 0), 0);
    if (iSkip != undefined && iTop) {
        this._loadData(iSkip, iTop, iThreshold);
    }
    for (var sMissingKey in mGaps) {
        var oRequestParameters = this._calculateRequestParameters(mGaps[sMissingKey]);
        this._loadChildren(mGaps[sMissingKey][0].parent, oRequestParameters.skip, oRequestParameters.top);
    }
    if (bReturnNodes) {
        return aNodes;
    }
    else {
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
ODataTreeBindingFlat.prototype._retrieveNodeSection = function (iStartIndex, iLength) {
    return this._bReadOnly ? this._indexRetrieveNodeSection(iStartIndex, iLength) : this._mapRetrieveNodeSection(iStartIndex, iLength);
};
ODataTreeBindingFlat.prototype._mapRetrieveNodeSection = function (iStartIndex, iLength) {
    var iNodeCounter = -1;
    var aNodes = [];
    this._map(function (oNode, oRecursionBreaker, sIndexType, iIndex, oParent) {
        iNodeCounter++;
        if (iNodeCounter >= iStartIndex) {
            if (!oNode) {
                if (sIndexType == "serverIndex") {
                    oNode = {
                        serverIndex: iIndex
                    };
                }
                else if (sIndexType == "positionInParent") {
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
    var i, aNodes = [], oNodeInfo, oNode;
    for (i = iStartIndex; i < iStartIndex + iLength; i++) {
        oNodeInfo = this.getNodeInfoByRowIndex(i);
        if (oNodeInfo.index !== undefined && oNodeInfo.index < this._aNodes.length) {
            oNode = this._aNodes[oNodeInfo.index];
            if (!oNode) {
                oNode = {
                    serverIndex: oNodeInfo.index
                };
            }
        }
        else if (oNodeInfo.parent) {
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
ODataTreeBindingFlat.prototype.getNodes = function (iStartIndex, iLength, iThreshold) {
    return this._getContextsOrNodes(true, iStartIndex, iLength, iThreshold);
};
ODataTreeBindingFlat.prototype._map = function (fnMap) {
    var oRecursionBreaker = { broken: false };
    var fnCheckNodeForAddedSubtrees = function (oNode) {
        if (oNode.addedSubtrees.length > 0 && !oNode.nodeState.collapsed) {
            for (var j = 0; j < oNode.addedSubtrees.length; j++) {
                var oSubtreeHandle = oNode.addedSubtrees[j];
                fnTraverseAddedSubtree(oNode, oSubtreeHandle);
                if (oRecursionBreaker.broken) {
                    return;
                }
            }
        }
    };
    var fnTraverseAddedSubtree = function (oNode, oSubtreeHandle) {
        var oSubtree = oSubtreeHandle._getSubtree();
        if (oSubtreeHandle) {
            if (Array.isArray(oSubtree)) {
                if (oSubtreeHandle._oSubtreeRoot) {
                    fnTraverseFlatSubtree(oSubtree, oSubtreeHandle._oSubtreeRoot.serverIndex, oSubtreeHandle._oSubtreeRoot, oSubtreeHandle._oSubtreeRoot.originalLevel || 0, oNode.level + 1);
                }
                else {
                    fnTraverseFlatSubtree(oSubtree, null, null, 0, oNode.level + 1);
                }
            }
            else {
                oSubtreeHandle._oSubtreeRoot.level = oNode.level + 1;
                fnTraverseDeepSubtree(oSubtreeHandle._oSubtreeRoot, false, oSubtreeHandle._oNewParentNode, -1, oSubtreeHandle._oSubtreeRoot);
            }
        }
    };
    var fnTraverseDeepSubtree = function (oNode, bIgnore, oParent, iPositionInParent, oIgnoreRemoveForNode) {
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
        if (oNode && oNode.children && oNode.nodeState.expanded) {
            for (var i = 0; i < oNode.children.length; i++) {
                var oChildNode = oNode.children[i];
                if (oChildNode && !oChildNode.nodeState.removed && !oChildNode.nodeState.reinserted) {
                    oChildNode.level = oNode.level + 1;
                }
                if (oChildNode && !oChildNode.nodeState.removed) {
                    fnTraverseDeepSubtree(oChildNode, false, oNode, i, oIgnoreRemoveForNode);
                }
                else if (!oChildNode) {
                    fnMap(oChildNode, oRecursionBreaker, "positionInParent", i, oNode);
                }
                if (oRecursionBreaker.broken) {
                    return;
                }
            }
        }
    };
    var fnTraverseFlatSubtree = function (aFlatTree, iServerIndexOffset, oIgnoreRemoveForNode, iSubtreeBaseLevel, iNewParentBaseLevel) {
        for (var i = 0; i < aFlatTree.length; i++) {
            var oNode = aFlatTree[i];
            if (oNode && oNode.nodeState && oNode.nodeState.removed && oNode != oIgnoreRemoveForNode) {
                if (!oNode.initiallyCollapsed) {
                    i += oNode.magnitude;
                }
                continue;
            }
            if (oNode && iSubtreeBaseLevel >= 0 && iNewParentBaseLevel >= 0) {
                oNode.level = oNode.originalLevel || 0;
                var iLevelDifNormalized = (oNode.level - iSubtreeBaseLevel) || 0;
                oNode.level = iNewParentBaseLevel + iLevelDifNormalized || 0;
            }
            if (iServerIndexOffset === null) {
                fnMap(oNode, oRecursionBreaker, "newNode");
            }
            else {
                fnMap(oNode, oRecursionBreaker, "serverIndex", iServerIndexOffset + i);
            }
            if (oRecursionBreaker.broken) {
                return;
            }
            if (oNode && oNode.nodeState) {
                if (!oNode.initiallyCollapsed && oNode.nodeState.collapsed) {
                    i += oNode.magnitude;
                }
                else {
                    if (oNode.initiallyCollapsed && oNode.nodeState.expanded) {
                        fnTraverseDeepSubtree(oNode, true);
                        if (oRecursionBreaker.broken) {
                            return;
                        }
                    }
                    else if (!oNode.initiallyCollapsed && oNode.nodeState.expanded) {
                        fnCheckNodeForAddedSubtrees(oNode);
                    }
                }
            }
            if (oRecursionBreaker.broken) {
                return;
            }
        }
    };
    fnTraverseFlatSubtree(this._aNodes, 0, null);
};
ODataTreeBindingFlat.prototype._loadData = function (iSkip, iTop, iThreshold) {
    var that = this;
    if (!this.bSkipDataEvents) {
        this.fireDataRequested();
    }
    this.bSkipDataEvents = false;
    return this._requestServerIndexNodes(iSkip, iTop, iThreshold).then(function (oResponseData) {
        that._addServerIndexNodes(oResponseData.oData, oResponseData.iSkip);
        that._fireChange({ reason: ChangeReason.Change });
        that.fireDataReceived({ data: oResponseData.oData });
    }, function (oError) {
        var bAborted = oError.statusCode === 0;
        if (!bAborted) {
            that._aNodes = [];
            that._bLengthFinal = true;
            that._fireChange({ reason: ChangeReason.Change });
            that.fireDataReceived();
        }
    });
};
ODataTreeBindingFlat.prototype._restoreServerIndexNodes = function (iSkip, iTop, bInlineCount) {
    var that = this;
    return this._requestServerIndexNodes(iSkip, iTop, 0, bInlineCount).then(function (oResponseData) {
        that._addServerIndexNodes(oResponseData.oData, oResponseData.iSkip);
        return oResponseData;
    });
};
ODataTreeBindingFlat.prototype._addServerIndexNodes = function (oData, iSkip) {
    var oEntry, sKey, iIndex, i, fnTest = function (oNode, index) {
        if (!oNode.isDeepOne && !oNode.initiallyCollapsed && oNode.serverIndex < iIndex && oNode.serverIndex + oNode.magnitude >= iIndex) {
            return true;
        }
    };
    if (!this._bLengthFinal) {
        var iCount = oData.__count ? parseInt(oData.__count) : 0;
        this._aNodes[iCount - 1] = undefined;
        this._bLengthFinal = true;
    }
    if (oData.results && oData.results.length > 0) {
        for (i = 0; i < oData.results.length; i++) {
            oEntry = oData.results[i];
            sKey = this.oModel.getKey(oEntry);
            iIndex = iSkip + i;
            var iMagnitude = oEntry[this.oTreeProperties["hierarchy-node-descendant-count-for"]];
            if (iMagnitude < 0) {
                iMagnitude = 0;
                Log.error("The entry data with key '" + sKey + "' under binding path '" + this.getPath() + "' has a negative 'hierarchy-node-descendant-count-for' which isn't allowed.");
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
                addedSubtrees: [],
                serverIndex: iIndex,
                parent: null,
                isDeepOne: false
            };
            if (this._iLowestServerLevel === null) {
                this._iLowestServerLevel = oNode.level;
            }
            else {
                this._iLowestServerLevel = Math.min(this._iLowestServerLevel, oNode.level);
            }
            if (this._bSelectAll) {
                if (!this._aExpandedAfterSelectAll.some(fnTest)) {
                    this.setNodeSelection(oNode, true);
                }
            }
        }
    }
};
ODataTreeBindingFlat.prototype._requestServerIndexNodes = function (iSkip, iTop, iThreshold, bInlineCount) {
    return new Promise(function (resolve, reject) {
        var oRequest = {
            iSkip: iSkip,
            iTop: iTop + (iThreshold || 0),
            iThreshold: iThreshold
        };
        this._aPendingRequests.sort(function (a, b) {
            return a.iSkip - b.iSkip;
        });
        for (var i = 0; i < this._aPendingRequests.length; i++) {
            if (TreeBindingUtils._determineRequestDelta(oRequest, this._aPendingRequests[i]) === false) {
                return;
            }
        }
        iSkip = oRequest.iSkip;
        iTop = oRequest.iTop;
        function _handleSuccess(oData) {
            var idx = this._aPendingRequests.indexOf(oRequest);
            this._aPendingRequests.splice(idx, 1);
            resolve({
                oData: oData,
                iSkip: iSkip,
                iTop: iTop
            });
        }
        function _handleError(oError) {
            var idx = this._aPendingRequests.indexOf(oRequest);
            this._aPendingRequests.splice(idx, 1);
            reject(oError);
        }
        var aUrlParameters = ["$skip=" + iSkip, "$top=" + iTop];
        if (!this._bLengthFinal || bInlineCount) {
            aUrlParameters.push("$inlinecount=allpages");
        }
        if (this.sCustomParams) {
            aUrlParameters.push(this.sCustomParams);
        }
        var oLevelFilter = new Filter(this.oTreeProperties["hierarchy-level-for"], "LE", this.getNumberOfExpandedLevels());
        var aFilters = [oLevelFilter];
        if (this.aApplicationFilters) {
            aFilters = aFilters.concat(this.aApplicationFilters);
        }
        var sAbsolutePath = this.getResolvedPath();
        if (sAbsolutePath) {
            oRequest.oRequestHandle = this.oModel.read(sAbsolutePath, {
                urlParameters: aUrlParameters,
                filters: [new Filter({
                        filters: aFilters,
                        and: true
                    })],
                sorters: this.aSorters || [],
                success: _handleSuccess.bind(this),
                error: _handleError.bind(this),
                groupId: this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId
            });
            this._aPendingRequests.push(oRequest);
        }
    }.bind(this));
};
ODataTreeBindingFlat.prototype._propagateMagnitudeChange = function (oParent, iDelta) {
    while (oParent != null && (oParent.initiallyCollapsed || oParent.isDeepOne)) {
        oParent.magnitude += iDelta;
        if (!oParent.nodeState.expanded) {
            return;
        }
        oParent = oParent.parent;
    }
};
ODataTreeBindingFlat.prototype._getInitialMagnitude = function (oNode) {
    var iDelta = 0, oChild;
    if (oNode.isDeepOne) {
        return 0;
    }
    if (oNode.children) {
        for (var i = 0; i < oNode.children.length; i++) {
            oChild = oNode.children[i];
            iDelta += oChild.magnitude + 1;
        }
    }
    return oNode.magnitude - iDelta;
};
ODataTreeBindingFlat.prototype._loadChildren = function (oParentNode, iSkip, iTop) {
    var that = this;
    if (!this.bSkipDataEvents) {
        this.fireDataRequested();
    }
    this.bSkipDataEvents = false;
    this._requestChildren(oParentNode, iSkip, iTop).then(function (oResponseData) {
        that._addChildNodes(oResponseData.oData, oParentNode, oResponseData.iSkip);
        that._fireChange({ reason: ChangeReason.Change });
        that.fireDataReceived({ data: oResponseData.oData });
    }, function (oError) {
        var bAborted = oError.statusCode === 0;
        if (!bAborted) {
            if (oParentNode.childCount === undefined) {
                oParentNode.children = [];
                oParentNode.childCount = 0;
                that._fireChange({ reason: ChangeReason.Change });
            }
            that.fireDataReceived();
        }
    });
};
ODataTreeBindingFlat.prototype._restoreChildren = function (oParentNode, iSkip, iTop) {
    var that = this, sParentId = oParentNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]);
    return this._requestChildren(oParentNode, iSkip, iTop, true).then(function (oResponseData) {
        var oNewParentNode;
        that._map(function (oNode, oRecursionBreaker) {
            if (oNode && oNode.context.getProperty(that.oTreeProperties["hierarchy-node-for"]) === sParentId) {
                oNewParentNode = oNode;
                oRecursionBreaker.broken = true;
            }
        });
        if (oNewParentNode) {
            that._addChildNodes(oResponseData.oData, oNewParentNode, oResponseData.iSkip);
            that.expand(oNewParentNode, true);
        }
        return oResponseData;
    });
};
ODataTreeBindingFlat.prototype._addChildNodes = function (oData, oParentNode, iSkip) {
    if (oParentNode.childCount == undefined && oData && oData.__count) {
        var iCount = oData.__count ? parseInt(oData.__count) : 0;
        oParentNode.childCount = iCount;
        oParentNode.children[iCount - 1] = undefined;
        if (oParentNode.nodeState.expanded) {
            this._propagateMagnitudeChange(oParentNode, iCount);
        }
        else {
            oParentNode.magnitude = iCount;
        }
        this._cleanTreeStateMaps();
    }
    if (oData.results && oData.results.length > 0) {
        for (var i = 0; i < oData.results.length; i++) {
            var oEntry = oData.results[i];
            this._createChildNode(oEntry, oParentNode, iSkip + i);
        }
    }
};
ODataTreeBindingFlat.prototype._createChildNode = function (oEntry, oParentNode, iPositionInParent) {
    var sKey = this.oModel.getKey(oEntry);
    var iContainingServerIndex;
    if (oParentNode.containingServerIndex !== undefined) {
        iContainingServerIndex = oParentNode.containingServerIndex;
    }
    else {
        iContainingServerIndex = oParentNode.serverIndex;
    }
    var oNode = oParentNode.children[iPositionInParent] = oParentNode.children[iPositionInParent] || {
        key: sKey,
        context: this.oModel.getContext("/" + sKey),
        magnitude: 0,
        level: oParentNode.level + 1,
        originalLevel: oParentNode.level + 1,
        initiallyCollapsed: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "collapsed",
        nodeState: {
            isLeaf: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "leaf",
            expanded: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "expanded",
            collapsed: oEntry[this.oTreeProperties["hierarchy-drill-state-for"]] === "collapsed",
            selected: this._mSelected[sKey] ? this._mSelected[sKey].nodeState.selected : false
        },
        positionInParent: iPositionInParent,
        children: [],
        addedSubtrees: [],
        parent: oParentNode,
        originalParent: oParentNode,
        isDeepOne: true,
        containingServerIndex: iContainingServerIndex
    };
    if (this._bSelectAll && this._aExpandedAfterSelectAll.indexOf(oParentNode) === -1) {
        this.setNodeSelection(oNode, true);
    }
    return oNode;
};
ODataTreeBindingFlat.prototype._requestChildren = function (oParentNode, iSkip, iTop, bInlineCount) {
    return new Promise(function (resolve, reject) {
        var oRequest = {
            sParent: oParentNode.key,
            iSkip: iSkip,
            iTop: iTop
        };
        this._aPendingChildrenRequests.sort(function (a, b) {
            return a.iSkip - b.iSkip;
        });
        for (var i = 0; i < this._aPendingChildrenRequests.length; i++) {
            var oPendingRequest = this._aPendingChildrenRequests[i];
            if (oPendingRequest.sParent === oRequest.sParent) {
                if (TreeBindingUtils._determineRequestDelta(oRequest, oPendingRequest) === false) {
                    return;
                }
            }
        }
        iSkip = oRequest.iSkip;
        iTop = oRequest.iTop;
        function _handleSuccess(oData) {
            var idx = this._aPendingChildrenRequests.indexOf(oRequest);
            this._aPendingChildrenRequests.splice(idx, 1);
            resolve({
                oData: oData,
                iSkip: iSkip,
                iTop: iTop
            });
        }
        function _handleError(oError) {
            var idx = this._aPendingChildrenRequests.indexOf(oRequest);
            this._aPendingChildrenRequests.splice(idx, 1);
            reject(oError);
        }
        var aUrlParameters = ["$skip=" + iSkip, "$top=" + iTop];
        if (oParentNode.childCount == undefined || bInlineCount) {
            aUrlParameters.push("$inlinecount=allpages");
        }
        if (this.sCustomParams) {
            aUrlParameters.push(this.sCustomParams);
        }
        var oLevelFilter = new Filter(this.oTreeProperties["hierarchy-parent-node-for"], "EQ", oParentNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]));
        var aFilters = [oLevelFilter];
        if (this.aApplicationFilters) {
            aFilters = aFilters.concat(this.aApplicationFilters);
        }
        var sAbsolutePath = this.getResolvedPath();
        if (sAbsolutePath) {
            oRequest.oRequestHandle = this.oModel.read(sAbsolutePath, {
                urlParameters: aUrlParameters,
                filters: [new Filter({
                        filters: aFilters,
                        and: true
                    })],
                sorters: this.aSorters || [],
                success: _handleSuccess.bind(this),
                error: _handleError.bind(this),
                groupId: this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId
            });
            this._aPendingChildrenRequests.push(oRequest);
        }
    }.bind(this));
};
ODataTreeBindingFlat.prototype._loadSubTree = function (oParentNode, iLevel) {
    var that = this;
    var missingSectionsLoaded;
    if (oParentNode.serverIndex !== undefined && !oParentNode.initiallyCollapsed) {
        var aMissingSections = [];
        var oSection;
        var iSubTreeStart = oParentNode.serverIndex + 1;
        var iSubTreeEnd = iSubTreeStart + oParentNode.magnitude;
        for (var i = iSubTreeStart; i < iSubTreeEnd; i++) {
            if (this._aNodes[i] === undefined) {
                if (!oSection) {
                    oSection = {
                        iSkip: i,
                        iTop: 1
                    };
                    aMissingSections.push(oSection);
                }
                else {
                    oSection.iTop++;
                }
            }
            else {
                oSection = null;
            }
        }
        if (aMissingSections.length) {
            missingSectionsLoaded = Promise.all(aMissingSections.map(function (oMissingSection) {
                return that._loadData(oMissingSection.iSkip, oMissingSection.iTop);
            }));
        }
    }
    if (!missingSectionsLoaded) {
        missingSectionsLoaded = Promise.resolve();
    }
    return missingSectionsLoaded.then(function () {
        if (!that.bSkipDataEvents) {
            that.fireDataRequested();
        }
        that.bSkipDataEvents = false;
        return that._requestSubTree(oParentNode, iLevel).then(function (oResponseData) {
            that._addSubTree(oResponseData.oData, oParentNode);
            that.fireDataReceived({ data: oResponseData.oData });
        }, function (oError) {
            Log.warning("ODataTreeBindingFlat: Error during subtree request", oError.message);
            var bAborted = oError.statusCode === 0;
            if (!bAborted) {
                that.fireDataReceived();
            }
        });
    });
};
ODataTreeBindingFlat.prototype._addSubTree = function (oData, oSubTreeRootNode) {
    if (oData.results && oData.results.length > 0) {
        var sNodeId, sParentNodeId, oEntry, oNode, oParentNode, aAlreadyLoadedNodes = [], mParentNodes = {}, i, j, k;
        if (oSubTreeRootNode.serverIndex !== undefined && !oSubTreeRootNode.initiallyCollapsed) {
            aAlreadyLoadedNodes = this._aNodes.slice(oSubTreeRootNode.serverIndex, oSubTreeRootNode.serverIndex + oSubTreeRootNode.magnitude + 1);
        }
        else {
            aAlreadyLoadedNodes.push(oSubTreeRootNode);
        }
        for (j = aAlreadyLoadedNodes.length - 1; j >= 0; j--) {
            oNode = aAlreadyLoadedNodes[j];
            if (oNode.nodeState.isLeaf) {
                continue;
            }
            if (oNode.initiallyCollapsed || oNode.isDeepOne) {
                oNode.childCount = undefined;
                if (oNode.magnitude && oNode.nodeState.expanded) {
                    this._propagateMagnitudeChange(oNode.parent, -oNode.magnitude);
                }
                oNode.magnitude = 0;
            }
            mParentNodes[oNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"])] = oNode;
        }
        for (i = 0; i < oData.results.length; i++) {
            oEntry = oData.results[i];
            sNodeId = oEntry[this.oTreeProperties["hierarchy-node-for"]];
            if (mParentNodes[sNodeId]) {
                continue;
            }
            sParentNodeId = oEntry[this.oTreeProperties["hierarchy-parent-node-for"]];
            oParentNode = mParentNodes[sParentNodeId];
            if (oParentNode.childCount === undefined) {
                oParentNode.childCount = 0;
            }
            oNode = oParentNode.children[oParentNode.childCount];
            if (oNode) {
                aAlreadyLoadedNodes.push(oNode);
                if (oNode.childCount) {
                    oNode.childCount = undefined;
                    if (oNode.initiallyCollapsed || oNode.isDeepOne) {
                        oNode.magnitude = 0;
                    }
                }
            }
            else {
                oNode = this._createChildNode(oEntry, oParentNode, oParentNode.childCount);
                if (oNode.nodeState.expanded) {
                    this._aExpanded.push(oNode);
                    this._sortNodes(this._aExpanded);
                }
            }
            oParentNode.childCount++;
            if (oParentNode.nodeState.expanded) {
                this._propagateMagnitudeChange(oParentNode, 1);
            }
            else {
                oParentNode.magnitude++;
            }
            if (!oNode.nodeState.isLeaf) {
                mParentNodes[sNodeId] = oNode;
            }
        }
        for (k = aAlreadyLoadedNodes.length - 1; k >= 0; k--) {
            oNode = aAlreadyLoadedNodes[k];
            if (!oNode.nodeState.expanded && !oNode.nodeState.isLeaf) {
                this.expand(oNode, true);
            }
        }
    }
};
ODataTreeBindingFlat.prototype._requestSubTree = function (oParentNode, iLevel) {
    return new Promise(function (resolve, reject) {
        var oRequest = {
            sParent: oParentNode.key,
            iLevel: iLevel
        };
        for (var i = 0; i < this._aPendingSubtreeRequests.length; i++) {
            var oPendingRequest = this._aPendingSubtreeRequests[i];
            if (oPendingRequest.sParent === oRequest.sParent && oPendingRequest.iLevel === oRequest.iLevel) {
                return;
            }
        }
        function _handleSuccess(oData) {
            var idx = this._aPendingSubtreeRequests.indexOf(oRequest);
            this._aPendingSubtreeRequests.splice(idx, 1);
            resolve({
                oData: oData,
                sParent: oRequest.sParent,
                iLevel: oRequest.iLevel
            });
        }
        function _handleError(oError) {
            var idx = this._aPendingSubtreeRequests.indexOf(oRequest);
            this._aPendingSubtreeRequests.splice(idx, 1);
            reject(oError);
        }
        var aUrlParameters = [];
        if (this.sCustomParams) {
            aUrlParameters.push(this.sCustomParams);
        }
        var oNodeFilter = new Filter(this.oTreeProperties["hierarchy-node-for"], "EQ", oParentNode.context.getProperty(this.oTreeProperties["hierarchy-node-for"]));
        var oLevelFilter = new Filter(this.oTreeProperties["hierarchy-level-for"], "LE", iLevel);
        var aFilters = [oNodeFilter, oLevelFilter];
        if (this.aApplicationFilters) {
            aFilters = aFilters.concat(this.aApplicationFilters);
        }
        var sAbsolutePath = this.getResolvedPath();
        if (sAbsolutePath) {
            oRequest.oRequestHandle = this.oModel.read(sAbsolutePath, {
                urlParameters: aUrlParameters,
                filters: [new Filter({
                        filters: aFilters,
                        and: true
                    })],
                sorters: this.aSorters || [],
                success: _handleSuccess.bind(this),
                error: _handleError.bind(this),
                groupId: this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId
            });
            this._aPendingSubtreeRequests.push(oRequest);
        }
    }.bind(this));
};
ODataTreeBindingFlat.prototype.findNode = function (iRowIndex) {
    return this._bReadOnly ? this._indexFindNode(iRowIndex) : this._mapFindNode(iRowIndex);
};
ODataTreeBindingFlat.prototype._mapFindNode = function (iRowIndex) {
    if (this.isInitial()) {
        return;
    }
    var oFoundNode = this._aNodeCache[iRowIndex];
    if (oFoundNode) {
        return oFoundNode;
    }
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
    var oNode = this._aNodeCache[iRowIndex];
    if (oNode) {
        return oNode;
    }
    var oNodeInfo = this.getNodeInfoByRowIndex(iRowIndex), oNode;
    if (oNodeInfo.parent) {
        oNode = oNodeInfo.parent.children[oNodeInfo.childIndex];
    }
    else {
        oNode = this._aNodes[oNodeInfo.index];
    }
    this._aNodeCache[iRowIndex] = oNode;
    return oNode;
};
ODataTreeBindingFlat.prototype.toggleIndex = function (iRowIndex) {
    var oToggledNode = this.findNode(iRowIndex);
    assert(oToggledNode != undefined, "toggleIndex(" + iRowIndex + "): Node not found!");
    if (oToggledNode) {
        if (oToggledNode.nodeState.expanded) {
            this.collapse(oToggledNode);
        }
        else {
            this.expand(oToggledNode);
        }
    }
};
ODataTreeBindingFlat.prototype.expand = function (vRowIndex, bSuppressChange) {
    var oToggledNode = vRowIndex;
    if (typeof vRowIndex !== "object") {
        oToggledNode = this.findNode(vRowIndex);
        assert(oToggledNode != undefined, "expand(" + vRowIndex + "): Node not found!");
    }
    if (oToggledNode.nodeState.expanded) {
        return;
    }
    oToggledNode.nodeState.expanded = true;
    oToggledNode.nodeState.collapsed = false;
    var iTreeStateFound = this._aCollapsed.indexOf(oToggledNode);
    if (iTreeStateFound != -1) {
        this._aCollapsed.splice(iTreeStateFound, 1);
    }
    this._aExpanded.push(oToggledNode);
    this._sortNodes(this._aExpanded);
    if (oToggledNode.serverIndex !== undefined) {
        this._aNodeChanges[oToggledNode.serverIndex] = true;
    }
    if (this._bSelectAll) {
        this._aExpandedAfterSelectAll.push(oToggledNode);
    }
    if (oToggledNode.initiallyCollapsed && oToggledNode.childCount == undefined) {
        this._loadChildren(oToggledNode, 0, this._iPageSize + this._iThreshold);
    }
    else {
        this._propagateMagnitudeChange(oToggledNode.parent, oToggledNode.magnitude);
    }
    this._cleanTreeStateMaps();
    this._aNodeCache = [];
    if (!bSuppressChange) {
        this._fireChange({ reason: ChangeReason.Expand });
    }
};
ODataTreeBindingFlat.prototype.expandToLevel = function (iLevel) {
    this.setNumberOfExpandedLevels(iLevel);
};
ODataTreeBindingFlat.prototype.expandNodeToLevel = function (iIndex, iLevel, bSuppressChange) {
    if (!this._bReadOnly) {
        return Promise.reject(new Error("ODataTreeBindingFlat: expandNodeToLevel is not supported while there are pending changes in the hierarchy"));
    }
    var oSubTreeRootNode = this.findNode(iIndex);
    return this._loadSubTree(oSubTreeRootNode, iLevel).then(function () {
        if (!bSuppressChange) {
            this._fireChange({ reason: ChangeReason.Expand });
        }
    }.bind(this));
};
ODataTreeBindingFlat.prototype.collapse = function (vRowIndex, bSuppressChange) {
    var oToggledNode = vRowIndex;
    if (typeof vRowIndex !== "object") {
        oToggledNode = this.findNode(vRowIndex);
        assert(oToggledNode != undefined, "expand(" + vRowIndex + "): Node not found!");
    }
    if (oToggledNode.nodeState.collapsed) {
        return;
    }
    oToggledNode.nodeState.expanded = false;
    oToggledNode.nodeState.collapsed = true;
    var iTreeStateFound = this._aExpanded.indexOf(oToggledNode);
    if (iTreeStateFound != -1) {
        this._aExpanded.splice(iTreeStateFound, 1);
    }
    if (this._bSelectAll) {
        iTreeStateFound = this._aExpandedAfterSelectAll.indexOf(oToggledNode);
        if (iTreeStateFound !== -1) {
            this._aExpandedAfterSelectAll.splice(iTreeStateFound, 1);
        }
    }
    this._aCollapsed.push(oToggledNode);
    this._sortNodes(this._aCollapsed);
    if (oToggledNode.isDeepOne) {
        this._propagateMagnitudeChange(oToggledNode.parent, oToggledNode.magnitude * -1);
    }
    if (oToggledNode.serverIndex !== undefined) {
        this._aNodeChanges[oToggledNode.serverIndex] = true;
    }
    this._cleanUpSelection();
    this._cleanTreeStateMaps();
    this._aNodeCache = [];
    if (!bSuppressChange) {
        this._fireChange({ reason: ChangeReason.Collapse });
    }
};
ODataTreeBindingFlat.prototype.collapseToLevel = function (iLevel) {
    var iOldLeadIndex = -1, aChangedIndices = [], iRowIndex;
    if (this.bCollapseRecursive) {
        for (var sKey in this._mSelected) {
            var oSelectedNode = this._mSelected[sKey];
            if (oSelectedNode.level > iLevel) {
                iRowIndex = this.getRowIndexByNode(oSelectedNode);
                aChangedIndices.push(iRowIndex);
                if (this._sLeadSelectionKey == sKey) {
                    iOldLeadIndex = iRowIndex;
                }
                this.setNodeSelection(oSelectedNode, false);
            }
        }
    }
    this.setNumberOfExpandedLevels(iLevel);
    if (this.bCollapseRecursive && aChangedIndices.length) {
        this._publishSelectionChanges({
            rowIndices: aChangedIndices,
            oldIndex: iOldLeadIndex,
            leadIndex: -1
        });
    }
};
ODataTreeBindingFlat.prototype._getInvisibleSelectedNodes = function () {
    var aAffectedNodes = [];
    var bIsVisible = true;
    var fnCheckVisible = function (oNode, oBreaker) {
        if (oNode.nodeState.collapsed || (oNode.nodeState.removed && !oNode.nodeState.reinserted)) {
            bIsVisible = false;
            oBreaker.broken = true;
        }
    };
    for (var sKey in this._mSelected) {
        var oSelectedNode = this._mSelected[sKey];
        bIsVisible = true;
        this._up(oSelectedNode, fnCheckVisible, false);
        if (!bIsVisible) {
            aAffectedNodes.push(oSelectedNode);
        }
    }
    return aAffectedNodes;
};
ODataTreeBindingFlat.prototype._cleanUpSelection = function (bForceDeselect) {
    var aInvisibleNodes = this._getInvisibleSelectedNodes();
    aInvisibleNodes.forEach(function (oSelectedNode) {
        if (oSelectedNode.key == this._sLeadSelectionKey) {
            this._sLeadSelectionKey = null;
        }
        if (this.bCollapseRecursive || bForceDeselect) {
            this.setNodeSelection(oSelectedNode, false);
        }
    }.bind(this));
    if ((this.bCollapseRecursive || bForceDeselect) && aInvisibleNodes.length) {
        this._publishSelectionChanges({
            rowIndices: [],
            indexChangesCouldNotBeDetermined: true
        });
    }
};
ODataTreeBindingFlat.prototype._isInSubtree = function (oAncestor, oChild) {
    var bIsInSubtree = false;
    var fnCheckAncestor = function (oNode, oBreaker) {
        if (oNode == oAncestor) {
            oBreaker.broken = true;
            bIsInSubtree = true;
        }
    };
    this._up(oChild, fnCheckAncestor, false);
    return bIsInSubtree;
};
ODataTreeBindingFlat.prototype._up = function (oNode, fnUp, bOldParent) {
    var oRecursionBreaker = { broken: false };
    var oParent = this._getParent(oNode, bOldParent);
    if (oParent) {
        this._structuralUp(oParent, fnUp, oRecursionBreaker, bOldParent);
    }
    else {
        this._flatUp(oNode, fnUp, oRecursionBreaker, true);
    }
};
ODataTreeBindingFlat.prototype._structuralUp = function (oNode, fnUp, oBreaker, bOldParent) {
    var oParent = oNode;
    do {
        fnUp(oParent, oBreaker);
        if (oBreaker.broken) {
            return;
        }
        oNode = oParent;
        oParent = this._getParent(oParent);
    } while (oParent);
    this._flatUp(oNode, fnUp, oBreaker);
};
ODataTreeBindingFlat.prototype._flatUp = function (oNode, fnUp, oBreaker, bInitial) {
    var iServerIndex = oNode.serverIndex, i = bInitial ? iServerIndex - 1 : iServerIndex, oChangedNode, oParent;
    for (; i >= 0; i--) {
        if (this._aNodeChanges[i]) {
            oChangedNode = this._aNodes[i];
            if (oChangedNode.initiallyCollapsed) {
                continue;
            }
            if (oChangedNode.serverIndex + oChangedNode.magnitude >= iServerIndex) {
                fnUp(oChangedNode, oBreaker);
                if (oBreaker.broken) {
                    return;
                }
                oParent = this._getParent(oChangedNode);
                if (oParent) {
                    this._structuralUp(oParent, fnUp, oBreaker);
                    return;
                }
            }
            else {
                continue;
            }
        }
    }
};
ODataTreeBindingFlat.prototype._getParent = function (oNode, bOldParent) {
    return bOldParent ? oNode.originalParent : oNode.parent;
};
ODataTreeBindingFlat.prototype._cleanTreeStateMaps = function () {
    this._iLengthDelta = this._bReadOnly ? this._indexCleanTreeStateMaps() : this._mapCleanTreeStateMaps();
};
ODataTreeBindingFlat.prototype._indexCleanTreeStateMaps = function () {
    return this._calcIndexDelta(this._aNodes.length);
};
ODataTreeBindingFlat.prototype._mapCleanTreeStateMaps = function () {
    var aAllChangedNodes = this._aCollapsed.concat(this._aRemoved).concat(this._aExpanded).concat(this._aAdded), bVisible = true, bVisibleNewParent, iDelta = 0, fnCheckVisible = function (oNode, oBreaker) {
        if (oNode.nodeState.collapsed || (oNode.nodeState.removed && !oNode.nodeState.reinserted)) {
            bVisible = false;
            oBreaker.broken = true;
        }
    }, mSeenNodes = {};
    var aCheckMatrix = [[0, 1], [-1, 0]];
    aAllChangedNodes.forEach(function (oNode) {
        if (mSeenNodes[oNode.key]) {
            return;
        }
        else {
            mSeenNodes[oNode.key] = true;
        }
        if (oNode.nodeState.added) {
            if (!oNode.nodeState.removed || oNode.nodeState.reinserted) {
                bVisible = true;
                this._up(oNode, fnCheckVisible, false);
                if (bVisible) {
                    iDelta++;
                }
            }
        }
        else {
            if (oNode.nodeState.collapsed || oNode.nodeState.expanded || oNode.nodeState.removed) {
                bVisible = true;
                this._up(oNode, fnCheckVisible, false);
                if (bVisible) {
                    if (oNode.nodeState.removed && !oNode.nodeState.reinserted) {
                        if (oNode.isDeepOne || oNode.initiallyCollapsed) {
                            iDelta -= 1;
                        }
                        else {
                            iDelta -= (oNode.magnitude + 1);
                        }
                    }
                    else {
                        if (oNode.nodeState.collapsed && oNode.serverIndex !== undefined && !oNode.initiallyCollapsed) {
                            iDelta -= oNode.magnitude;
                        }
                        if (oNode.nodeState.expanded && (oNode.isDeepOne || oNode.initiallyCollapsed)) {
                            iDelta += oNode.children.length;
                        }
                    }
                }
                if (oNode.nodeState.reinserted) {
                    bVisibleNewParent = bVisible;
                    bVisible = true;
                    this._up(oNode, fnCheckVisible, true);
                    var iVisibilityFactor = (aCheckMatrix[bVisible | 0][bVisibleNewParent | 0]);
                    if (iVisibilityFactor) {
                        if (oNode.isDeepOne) {
                            iDelta += iVisibilityFactor * 1;
                        }
                        else {
                            if (oNode.initiallyCollapsed) {
                                iDelta += iVisibilityFactor;
                            }
                            else {
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
ODataTreeBindingFlat.prototype.isLengthFinal = function () {
    return this._bLengthFinal;
};
ODataTreeBindingFlat.prototype.getLength = function () {
    return this._aNodes.length + this._iLengthDelta;
};
ODataTreeBindingFlat.prototype.getContextByIndex = function (iRowIndex) {
    if (this.isInitial()) {
        return;
    }
    var oNode = this.findNode(iRowIndex);
    return oNode && oNode.context;
};
ODataTreeBindingFlat.prototype.getNodeByIndex = function (iRowIndex) {
    if (this.isInitial()) {
        return;
    }
    var oNode = this.findNode(iRowIndex);
    return oNode;
};
ODataTreeBindingFlat.prototype.isExpanded = function (iRowIndex) {
    var oNode = this.findNode(iRowIndex);
    return oNode && oNode.nodeState.expanded;
};
ODataTreeBindingFlat.prototype.hasChildren = function (oContext) {
    if (!oContext) {
        return false;
    }
    var oNodeInfo = this._findNodeByContext(oContext);
    var oNode = oNodeInfo && oNodeInfo.node;
    return !(oNode && oNode.nodeState.isLeaf);
};
ODataTreeBindingFlat.prototype.nodeHasChildren = function (oNode) {
    return !(oNode && oNode.nodeState.isLeaf);
};
ODataTreeBindingFlat.prototype._hasChangedEntity = function (mChangedEntities) {
    var bChangeDetected = false;
    this._map(function (oNode, oRecursionBreaker) {
        if (oNode.key in mChangedEntities) {
            bChangeDetected = true;
            oRecursionBreaker.broken = true;
        }
    });
    return bChangeDetected;
};
ODataTreeBindingFlat.prototype.setNodeSelection = function (oNode, bIsSelected) {
    assert(oNode, "Node must be defined!");
    oNode.nodeState.selected = bIsSelected;
    if (bIsSelected) {
        delete this._mDeselected[oNode.key];
        this._mSelected[oNode.key] = oNode;
    }
    else {
        delete this._mSelected[oNode.key];
        this._mDeselected[oNode.key] = oNode;
        if (oNode.key === this._sLeadSelectionKey) {
            this._sLeadSelectionKey = null;
        }
    }
};
ODataTreeBindingFlat.prototype.isIndexSelected = function (iRowIndex) {
    var oNode = this.findNode(iRowIndex);
    return oNode && oNode.nodeState ? oNode.nodeState.selected : false;
};
ODataTreeBindingFlat.prototype.isIndexSelectable = function (iRowIndex) {
    var oNode = this.findNode(iRowIndex);
    return !!oNode;
};
ODataTreeBindingFlat.prototype._clearSelection = function () {
    return this._bReadOnly ? this._indexClearSelection() : this._mapClearSelection();
};
ODataTreeBindingFlat.prototype._indexClearSelection = function () {
    var iOldLeadIndex = -1, aChangedIndices = [], sSelectedKey, oNode, iRowIndex;
    this._bSelectAll = false;
    this._aExpandedAfterSelectAll = [];
    for (sSelectedKey in this._mSelected) {
        oNode = this._mSelected[sSelectedKey];
        this.setNodeSelection(oNode, false);
        iRowIndex = this.getRowIndexByNode(oNode);
        aChangedIndices.push(iRowIndex);
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
    for (var sKey in this._mSelected) {
        if (sKey) {
            iMaxNumberOfSelectedNodes++;
        }
    }
    this._map(function (oNode, oRecursionBreaker, sIndexType, iIndex, oParent) {
        iNodeCounter++;
        if (oNode && oNode.nodeState.selected) {
            this.setNodeSelection(oNode, false);
            aChangedIndices.push(iNodeCounter);
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
ODataTreeBindingFlat.prototype.setSelectedIndex = function (iRowIndex) {
    var oNode = this.findNode(iRowIndex);
    if (oNode) {
        var oChanges = this._clearSelection();
        var iChangedIndex = oChanges.rowIndices.indexOf(iRowIndex);
        if (iChangedIndex >= 0) {
            oChanges.rowIndices.splice(iChangedIndex, 1);
        }
        else {
            oChanges.rowIndices.push(iRowIndex);
        }
        oChanges.leadKey = oNode.key;
        oChanges.leadIndex = iRowIndex;
        this.setNodeSelection(oNode, true);
        this._publishSelectionChanges(oChanges);
    }
    else {
        Log.warning("ODataTreeBindingFlat: The selection of index '" + iRowIndex + "' was ignored. Please make sure to only select rows, for which data has been fetched to the client.");
    }
};
ODataTreeBindingFlat.prototype.getSelectedIndex = function () {
    return this._bReadOnly ? this._indexGetSelectedIndex() : this._mapGetSelectedIndex();
};
ODataTreeBindingFlat.prototype._indexGetSelectedIndex = function () {
    if (!this._sLeadSelectionKey || isEmptyObject(this._mSelected)) {
        return -1;
    }
    var oSelectedNode = this._mSelected[this._sLeadSelectionKey];
    if (oSelectedNode) {
        return this.getRowIndexByNode(oSelectedNode);
    }
    else {
        return -1;
    }
};
ODataTreeBindingFlat.prototype._mapGetSelectedIndex = function () {
    if (!this._sLeadSelectionKey || isEmptyObject(this._mSelected)) {
        return -1;
    }
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
ODataTreeBindingFlat.prototype.getSelectedIndices = function () {
    return this._bReadOnly ? this._indexGetSelectedIndices() : this._mapGetSelectedIndices();
};
ODataTreeBindingFlat.prototype._indexGetSelectedIndices = function () {
    var aNodesInfo = this._getSelectedNodesInfo();
    return aNodesInfo.map(function (oNodeInfo) {
        return oNodeInfo.rowIndex;
    });
};
ODataTreeBindingFlat.prototype._mapGetSelectedIndices = function () {
    var aResultIndices = [];
    if (isEmptyObject(this._mSelected)) {
        return aResultIndices;
    }
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
ODataTreeBindingFlat.prototype.getSelectedNodesCount = function () {
    var iSelectedNodes;
    if (this._bSelectAll) {
        if (this._bReadOnly) {
            var aRelevantExpandedAfterSelectAllNodes = [], iNumberOfVisibleDeselectedNodes = 0, sKey;
            this._aExpandedAfterSelectAll.sort(function (a, b) {
                var iA = this._getRelatedServerIndex(a);
                var iB = this._getRelatedServerIndex(b);
                assert(iA != undefined, "getSelectedNodesCount: (containing) Server-Index not found for node 'a'");
                assert(iB != undefined, "getSelectedNodesCount: (containing) Server-Index not found node 'b'");
                if (iA == iB && a.isDeepOne && b.isDeepOne) {
                    return a.originalLevel - b.originalLevel;
                }
                return iA - iB;
            }.bind(this));
            var iLastExpandedIndex = -1, oNode, iNodeIdx, i;
            for (i = 0; i < this._aExpandedAfterSelectAll.length; i++) {
                oNode = this._aExpandedAfterSelectAll[i];
                iNodeIdx = this._getRelatedServerIndex(oNode);
                if (iNodeIdx <= iLastExpandedIndex && !oNode.initiallyCollapsed) {
                    continue;
                }
                if (oNode.initiallyCollapsed) {
                    iLastExpandedIndex = iNodeIdx;
                }
                else {
                    iLastExpandedIndex = iNodeIdx + oNode.magnitude;
                }
                aRelevantExpandedAfterSelectAllNodes.push(oNode);
                iNumberOfVisibleDeselectedNodes += oNode.magnitude;
            }
            var checkContainedInExpandedNode = function (oNode, oBreaker) {
                if (aRelevantExpandedAfterSelectAllNodes.indexOf(oNode) !== -1) {
                    iNumberOfVisibleDeselectedNodes--;
                    oBreaker.broken = true;
                }
            };
            for (sKey in this._mSelected) {
                this._up(this._mSelected[sKey], checkContainedInExpandedNode, true);
            }
            var bIsVisible;
            var checkVisibleDeselectedAndNotAlreadyCountedNode = function (oNode, oBreaker) {
                if (oNode.nodeState.collapsed || (oNode.nodeState.removed && !oNode.nodeState.reinserted) || aRelevantExpandedAfterSelectAllNodes.indexOf(oNode) !== -1) {
                    bIsVisible = false;
                    oBreaker.broken = true;
                }
            };
            for (sKey in this._mDeselected) {
                bIsVisible = true;
                this._up(this._mDeselected[sKey], checkVisibleDeselectedAndNotAlreadyCountedNode, true);
                if (bIsVisible) {
                    iNumberOfVisibleDeselectedNodes++;
                }
            }
            iSelectedNodes = this.getLength() - iNumberOfVisibleDeselectedNodes;
        }
        else {
            iSelectedNodes = 0;
            this._map(function (oNode, oRecursionBreaker, sIndexType, iIndex, oParent) {
                var oParentNode;
                if (oNode) {
                    if (oNode.nodeState.selected) {
                        iSelectedNodes++;
                    }
                }
                else if (oNode === undefined && sIndexType === "serverIndex") {
                    var bIsSelected = true;
                    for (var i = iIndex - 1; i >= 0; i--) {
                        if (this._aNodeChanges[i]) {
                            oParentNode = this._aNodes[i];
                            if (oParentNode.serverIndex + oParentNode.magnitude >= iIndex && this._aExpandedAfterSelectAll.indexOf(oParentNode) !== -1) {
                                bIsSelected = false;
                                break;
                            }
                        }
                    }
                    if (bIsSelected) {
                        iSelectedNodes++;
                    }
                }
            }.bind(this));
        }
    }
    else {
        var aInvisibleNodes = this._getInvisibleSelectedNodes();
        iSelectedNodes = Math.max(Object.keys(this._mSelected).length - aInvisibleNodes.length, 0);
    }
    return iSelectedNodes;
};
ODataTreeBindingFlat.prototype.getSelectedContexts = function () {
    return this._bReadOnly ? this._indexGetSelectedContexts() : this._mapGetSelectedContexts();
};
ODataTreeBindingFlat.prototype._indexGetSelectedContexts = function () {
    var aNodesInfo = this._getSelectedNodesInfo();
    return aNodesInfo.map(function (oNodeInfo) {
        return oNodeInfo.node.context;
    });
};
ODataTreeBindingFlat.prototype._mapGetSelectedContexts = function () {
    var aResultContexts = [];
    if (isEmptyObject(this._mSelected)) {
        return aResultContexts;
    }
    var fnMatchFunction = function (oNode) {
        if (oNode) {
            if (oNode.nodeState.selected && !oNode.isArtificial) {
                aResultContexts.push(oNode.context);
            }
        }
    };
    this._map(fnMatchFunction);
    return aResultContexts;
};
ODataTreeBindingFlat.prototype.setSelectionInterval = function (iFromIndex, iToIndex) {
    var mClearParams = this._clearSelection();
    var mSetParams = this._setSelectionInterval(iFromIndex, iToIndex, true);
    var mIndicesFound = {};
    var aRowIndices = [];
    var iIndex;
    for (var i = 0; i < mClearParams.rowIndices.length; i++) {
        iIndex = mClearParams.rowIndices[i];
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
        leadKey: mSetParams.leadKey
    });
};
ODataTreeBindingFlat.prototype._setSelectionInterval = function (iFromIndex, iToIndex, bSelectionValue) {
    return this._bReadOnly ? this._indexSetSelectionInterval(iFromIndex, iToIndex, bSelectionValue) : this._mapSetSelectionInterval(iFromIndex, iToIndex, bSelectionValue);
};
ODataTreeBindingFlat.prototype._indexSetSelectionInterval = function (iFromIndex, iToIndex, bSelectionValue) {
    var iNewFromIndex = Math.min(iFromIndex, iToIndex), iNewToIndex = Math.max(iFromIndex, iToIndex), aNewlySelectedNodes = [], aChangedIndices = [], iOldLeadIndex, oNode, i, mParams;
    bSelectionValue = !!bSelectionValue;
    for (i = iNewFromIndex; i <= iNewToIndex; i++) {
        oNode = this.findNode(i);
        if (oNode) {
            if (oNode.nodeState.selected !== bSelectionValue) {
                aChangedIndices.push(i);
            }
            if (oNode.key === this._sLeadSelectionKey) {
                iOldLeadIndex = i;
            }
            this.setNodeSelection(oNode, bSelectionValue);
            aNewlySelectedNodes.push(oNode);
        }
    }
    mParams = {
        rowIndices: aChangedIndices,
        oldIndex: iOldLeadIndex,
        leadIndex: iOldLeadIndex && !bSelectionValue ? -1 : undefined
    };
    if (aNewlySelectedNodes.length > 0 && bSelectionValue) {
        mParams.leadKey = aNewlySelectedNodes[aNewlySelectedNodes.length - 1].key;
        mParams.leadIndex = iNewToIndex;
    }
    return mParams;
};
ODataTreeBindingFlat.prototype._mapSetSelectionInterval = function (iFromIndex, iToIndex, bSelectionValue) {
    var iNewFromIndex = Math.min(iFromIndex, iToIndex);
    var iNewToIndex = Math.max(iFromIndex, iToIndex);
    var aNewlySelectedNodes = [];
    var aChangedIndices = [];
    var iNumberOfNodesToSelect = Math.abs(iNewToIndex - iNewFromIndex) + 1;
    var iOldLeadIndex;
    var iNodeCounter = -1;
    var fnMapFunction = function (oNode, oRecursionBreaker, sIndexType, iIndex, oParent) {
        iNodeCounter++;
        if (oNode) {
            if (iNodeCounter >= iNewFromIndex && iNodeCounter <= iNewToIndex) {
                if (oNode.nodeState.selected !== !!bSelectionValue) {
                    aChangedIndices.push(iNodeCounter);
                }
                if (oNode.key === this._sLeadSelectionKey) {
                    iOldLeadIndex = iNodeCounter;
                }
                this.setNodeSelection(oNode, !!bSelectionValue);
                aNewlySelectedNodes.push(oNode);
                if (aNewlySelectedNodes.length === iNumberOfNodesToSelect) {
                    oRecursionBreaker.broken = true;
                }
            }
        }
    }.bind(this);
    this._map(fnMapFunction);
    var mParams = {
        rowIndices: aChangedIndices,
        oldIndex: iOldLeadIndex,
        leadIndex: iOldLeadIndex && !bSelectionValue ? -1 : undefined
    };
    if (aNewlySelectedNodes.length > 0 && bSelectionValue) {
        var oLeadSelectionNode = aNewlySelectedNodes[aNewlySelectedNodes.length - 1];
        mParams.leadKey = oLeadSelectionNode.key;
        mParams.leadIndex = iNewToIndex;
    }
    return mParams;
};
ODataTreeBindingFlat.prototype.addSelectionInterval = function (iFromIndex, iToIndex) {
    var mParams = this._setSelectionInterval(iFromIndex, iToIndex, true);
    this._publishSelectionChanges(mParams);
};
ODataTreeBindingFlat.prototype.removeSelectionInterval = function (iFromIndex, iToIndex) {
    var mParams = this._setSelectionInterval(iFromIndex, iToIndex, false);
    this._publishSelectionChanges(mParams);
};
ODataTreeBindingFlat.prototype.selectAll = function () {
    this._bReadOnly ? this._indexSelectAll() : this._mapSelectAll();
};
ODataTreeBindingFlat.prototype._indexSelectAll = function () {
    this._bSelectAll = true;
    this._aExpandedAfterSelectAll = [];
    var mParams = {
        rowIndices: [],
        oldIndex: -1,
        selectAll: true
    };
    var iLength = this.getLength(), i, oNode;
    for (i = 0; i < iLength; i++) {
        oNode = this.findNode(i);
        if (oNode && !oNode.isArtificial) {
            if (oNode.key === this._sLeadSelectionKey) {
                mParams.oldIndex = i;
            }
            if (!oNode.nodeState.selected) {
                mParams.rowIndices.push(i);
            }
            this.setNodeSelection(oNode, true);
            mParams.leadKey = oNode.key;
            mParams.leadIndex = i;
        }
    }
    this._publishSelectionChanges(mParams);
};
ODataTreeBindingFlat.prototype._mapSelectAll = function () {
    this._bSelectAll = true;
    this._aExpandedAfterSelectAll = [];
    var mParams = {
        rowIndices: [],
        oldIndex: -1,
        selectAll: true
    };
    var iNodeCounter = -1;
    this._map(function (oNode) {
        if (!oNode || !oNode.isArtificial) {
            iNodeCounter++;
        }
        if (oNode) {
            if (oNode.key === this._sLeadSelectionKey) {
                mParams.oldIndex = iNodeCounter;
            }
            if (oNode) {
                if (!oNode.isArtificial && !oNode.nodeState.selected) {
                    mParams.rowIndices.push(iNodeCounter);
                }
                this.setNodeSelection(oNode, true);
                mParams.leadKey = oNode.key;
                mParams.leadIndex = iNodeCounter;
            }
        }
    }.bind(this));
    this._publishSelectionChanges(mParams);
};
ODataTreeBindingFlat.prototype.clearSelection = function (bSuppresSelectionChangeEvent) {
    var oChanges = this._clearSelection();
    if (!bSuppresSelectionChangeEvent) {
        this._publishSelectionChanges(oChanges);
    }
};
ODataTreeBindingFlat.prototype._publishSelectionChanges = function (mParams) {
    mParams.oldIndex = mParams.oldIndex || this.getSelectedIndex();
    mParams.rowIndices.sort(function (a, b) {
        return a - b;
    });
    if (mParams.leadIndex >= 0 && mParams.leadKey) {
        this._sLeadSelectionKey = mParams.leadKey;
    }
    else if (mParams.leadIndex === -1) {
        this._sLeadSelectionKey = undefined;
    }
    else {
        mParams.leadIndex = mParams.oldIndex;
    }
    if (mParams.rowIndices.length > 0 || (mParams.leadIndex != undefined && mParams.leadIndex !== -1) || mParams.indexChangesCouldNotBeDetermined) {
        this.fireSelectionChanged(mParams);
    }
};
ODataTreeBindingFlat.prototype.setCollapseRecursive = function (bCollapseRecursive) {
    this.bCollapseRecursive = !!bCollapseRecursive;
};
ODataTreeBindingFlat.prototype.resetData = function () {
    ODataTreeBinding.prototype.resetData.apply(this, arguments);
    this._aNodes = [];
    this._aNodeCache = [];
    this._aCollapsed = [];
    this._aExpanded = [];
    this._aExpandedAfterSelectAll = [];
    this._mSelected = {};
    this._mDeselected = {};
    this._aAdded = [];
    this._aRemoved = [];
    this._aNodeChanges = [];
    this._aAllChangedNodes = [];
    this._bLengthFinal = false;
    this._iLowestServerLevel = null;
    this._bSelectAll = false;
    this._bReadOnly = true;
    this._iLengthDelta = 0;
};
ODataTreeBindingFlat.prototype._findNodeByContext = function (oContext) {
    for (var sIndex in this._aNodeCache) {
        if (this._aNodeCache[sIndex] && this._aNodeCache[sIndex].context == oContext) {
            return {
                node: this._aNodeCache[sIndex],
                index: parseInt(sIndex)
            };
        }
    }
    var iNodeCounter = -1;
    var oNodeForContext;
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
ODataTreeBindingFlat.prototype._getCorrectChangeGroup = function (sKey) {
    if (!sKey) {
        sKey = this.getResolvedPath();
    }
    return this.oModel._resolveGroup(sKey).groupId;
};
ODataTreeBindingFlat.prototype.createEntry = function (mParameters) {
    var sAbsolutePath = this.getResolvedPath();
    var oNewEntry;
    if (sAbsolutePath) {
        mParameters = mParameters || {};
        mParameters.groupId = this._getCorrectChangeGroup(sAbsolutePath);
        mParameters.refreshAfterChange = false;
        oNewEntry = this.oModel.createEntry(sAbsolutePath, mParameters);
    }
    else {
        Log.warning("ODataTreeBindingFlat: createEntry failed, as the binding path could not be resolved.");
    }
    return oNewEntry;
};
ODataTreeBindingFlat.prototype.submitChanges = function (mParameters) {
    mParameters = mParameters || {};
    var sAbsolutePath = this.getResolvedPath(), oOptimizedChanges = this._optimizeChanges();
    if (!sAbsolutePath) {
        Log.warning("ODataTreeBindingFlat: submitChanges failed, because the binding-path could not be resolved.");
        return;
    }
    mParameters.groupId = this._getCorrectChangeGroup(sAbsolutePath);
    var fnOrgSuccess = mParameters.success || function () { };
    var fnOrgError = mParameters.error || function () { };
    var bRestoreRequestFailed = false;
    mParameters.success = function (oData) {
        fnOrgSuccess(oData);
        var bSomethingFailed = false;
        if (oData.__batchResponses && oData.__batchResponses[0] && oData.__batchResponses[0].__changeResponses && oData.__batchResponses[0].__changeResponses.length > 0) {
            var aChangeResponses = oData.__batchResponses[0].__changeResponses;
            for (var i = 0; i < aChangeResponses.length; i++) {
                var oResponse = aChangeResponses[i];
                var iStatusCode = parseInt(oResponse.statusCode);
                if (iStatusCode < 200 || iStatusCode > 299) {
                    bSomethingFailed = true;
                    break;
                }
            }
            if (bSomethingFailed) {
            }
            else if (this._bRestoreTreeStateAfterChange && !bRestoreRequestFailed && (!this.aApplicationFilters || this.aApplicationFilters.length === 0)) {
                this._restoreTreeState(oOptimizedChanges).catch(function (err) {
                    Log.error("ODataTreeBindingFlat - " + err.message, err.stack);
                    this._refresh(true);
                }.bind(this));
            }
            else {
                this._refresh(true);
            }
        }
        else {
            Log.warning("ODataTreeBindingFlat.submitChanges - success: Batch-request response does not contain change response.");
        }
    }.bind(this);
    mParameters.error = function (oEvent) {
        fnOrgError(oEvent);
    };
    this._generateSubmitData(oOptimizedChanges, function (err) {
        Log.error("ODataTreeBindingFlat - Tree state restoration request failed. " + err.message, err.stack);
        bRestoreRequestFailed = true;
    });
    this.oModel.submitChanges(mParameters);
};
ODataTreeBindingFlat.prototype._generateSubmitData = function (oOptimizedChanges, restoreRequestErrorHandler) {
    var aRemoved = oOptimizedChanges.removed, aCreationCancelled = oOptimizedChanges.creationCancelled, aAdded = oOptimizedChanges.added, aMoved = oOptimizedChanges.moved, that = this;
    function setParent(oNode) {
        assert(oNode.context, "Node does not have a context.");
        var sParentNodeID = oNode.parent.context.getProperty(that.oTreeProperties["hierarchy-node-for"]);
        that.oModel.setProperty(that.oTreeProperties["hierarchy-parent-node-for"], sParentNodeID, oNode.context);
    }
    var mRestoreRequestParameters = {
        groupId: this._getCorrectChangeGroup(),
        error: restoreRequestErrorHandler
    };
    aAdded.forEach(setParent);
    aMoved.forEach(function (oNode) {
        setParent(oNode);
        if (this._bRestoreTreeStateAfterChange && (!this.aApplicationFilters || this.aApplicationFilters.length === 0)) {
            this._generatePreorderPositionRequest(oNode, mRestoreRequestParameters);
            this._generateSiblingsPositionRequest(oNode, mRestoreRequestParameters);
        }
    }.bind(this));
    aRemoved.forEach(function (oNode) {
        this._generateDeleteRequest(oNode);
        Log.debug("ODataTreeBindingFlat: DELETE " + oNode.key);
    }.bind(this));
    aCreationCancelled.forEach(function (oNode) {
        this._generateDeleteRequest(oNode);
    }.bind(this));
};
ODataTreeBindingFlat.prototype._generatePreorderPositionRequest = function (oNode, mParameters) {
    var sGroupId, sKeyProperty, sKeySelect, mUrlParameters, successHandler, errorHandler, aFilters = [], aSorters = this.aSorters || [], i;
    if (mParameters) {
        sGroupId = mParameters.groupId || this.sGroupId;
        successHandler = mParameters.success;
        errorHandler = mParameters.error;
    }
    if (this.aApplicationFilters) {
        aFilters = aFilters.concat(this.aApplicationFilters);
    }
    for (i = this._aTreeKeyProperties.length - 1; i >= 0; i--) {
        sKeyProperty = this._aTreeKeyProperties[i];
        if (!sKeySelect) {
            sKeySelect = sKeyProperty;
        }
        else {
            sKeySelect += "," + sKeyProperty;
        }
        aFilters.push(new Filter(sKeyProperty, "EQ", oNode.context.getProperty(sKeyProperty)));
    }
    aFilters.push(new Filter(this.oTreeProperties["hierarchy-level-for"], "LE", this.getNumberOfExpandedLevels()));
    mUrlParameters = extend({}, this.mParameters);
    mUrlParameters.select = sKeySelect + "," + this.oTreeProperties["hierarchy-node-for"] + "," + this.oTreeProperties["hierarchy-node-descendant-count-for"] + "," + this.oTreeProperties["hierarchy-drill-state-for"] + "," + this.oTreeProperties["hierarchy-preorder-rank-for"];
    var sAbsolutePath = this.getResolvedPath();
    if (sAbsolutePath) {
        this.oModel.read(sAbsolutePath, {
            urlParameters: this.oModel.createCustomParams(mUrlParameters),
            filters: [new Filter({
                    filters: aFilters,
                    and: true
                })],
            sorters: aSorters,
            groupId: sGroupId,
            success: successHandler,
            error: errorHandler
        });
    }
};
ODataTreeBindingFlat.prototype._generateSiblingsPositionRequest = function (oNode, mParameters) {
    var sGroupId, mUrlParameters, successHandler, errorHandler;
    if (mParameters) {
        sGroupId = mParameters.groupId || this.sGroupId;
        successHandler = mParameters.success;
        errorHandler = mParameters.error;
    }
    mUrlParameters = extend({}, this.mParameters);
    mUrlParameters.select = this.oTreeProperties["hierarchy-sibling-rank-for"];
    this.oModel.read(oNode.context.getPath(), {
        urlParameters: this.oModel.createCustomParams(mUrlParameters),
        groupId: sGroupId,
        success: successHandler,
        error: errorHandler
    });
};
ODataTreeBindingFlat.prototype._nodeIsOnTopLevel = function (oNode) {
    if (oNode && oNode.serverIndex >= 0) {
        var bParentIsNull = oNode.parent == null;
        if (bParentIsNull) {
            if (oNode.originalLevel == this._iLowestServerLevel) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    else {
        Log.warning("ODataTreeBindingFlat.nodeIsOnTopLevel: Node is not defined or not a server-indexed node.");
    }
};
ODataTreeBindingFlat.prototype._generateDeleteRequest = function (oNode) {
    var oContext = oNode.context;
    if (oNode.nodeState.added) {
        this.oModel.deleteCreatedEntry(oContext);
    }
    else {
        var oDeleteRequestHandle = this.oModel.remove(oContext.getPath(), {
            groupId: this._getCorrectChangeGroup(),
            refreshAfterChange: false
        });
        return oDeleteRequestHandle;
    }
};
ODataTreeBindingFlat.prototype._filterChangeForServerSections = function (oOptimizedChanges) {
    var oChanges = {};
    oChanges.removed = oOptimizedChanges.removed.filter(function (oRemovedNode) {
        return !oRemovedNode.isDeepOne;
    });
    oChanges.added = oOptimizedChanges.added.filter(function (oAddedNode) {
        return !oAddedNode.isDeepOne;
    });
    oOptimizedChanges.moved.forEach(function (oMovedNode) {
        if (!oMovedNode.newIsDeepOne) {
            oChanges.added.push(oMovedNode);
        }
        if (!oMovedNode.isDeepOne) {
            oChanges.removed.push(oMovedNode);
        }
    });
    return oChanges;
};
ODataTreeBindingFlat.prototype._filterChangesForDeepSections = function (oOptimizedChanges) {
    var mChanges = {};
    oOptimizedChanges.removed.forEach(function (oRemovedNode) {
        var oParent;
        if (oRemovedNode.isDeepOne) {
            oParent = oRemovedNode.parent;
            if (!mChanges[oParent.key]) {
                mChanges[oParent.key] = {
                    added: [],
                    removed: []
                };
            }
            mChanges[oParent.key].removed.push(oRemovedNode);
        }
    });
    oOptimizedChanges.added.forEach(function (oAddedNode) {
        var oParent;
        if (oAddedNode.isDeepOne) {
            oParent = oAddedNode.parent;
            if (!mChanges[oParent.key]) {
                mChanges[oParent.key] = {
                    added: [],
                    removed: []
                };
            }
            mChanges[oParent.key].added.push(oAddedNode);
        }
    });
    oOptimizedChanges.moved.forEach(function (oMovedNode) {
        var oParent;
        if (oMovedNode.newIsDeepOne) {
            oParent = oMovedNode.parent;
            if (!mChanges[oParent.key]) {
                mChanges[oParent.key] = {
                    added: [],
                    removed: []
                };
            }
            mChanges[oParent.key].added.push(oMovedNode);
        }
        if (oMovedNode.isDeepOne) {
            oParent = oMovedNode.originalParent;
            if (!mChanges[oParent.key]) {
                mChanges[oParent.key] = {
                    added: [],
                    removed: []
                };
            }
            mChanges[oParent.key].removed.push(oMovedNode);
        }
    });
    return mChanges;
};
ODataTreeBindingFlat.prototype._optimizeOptimizedChanges = function (oOptimizedChanges) {
    var aAddedNodes, that = this;
    aAddedNodes = oOptimizedChanges.added.slice();
    aAddedNodes.sort(function (a, b) {
        var aIsDeep = a.newIsDeepOne !== undefined ? a.newIsDeepOne : a.isDeepOne, bIsDeep = b.newIsDeepOne !== undefined ? b.newIsDeepOne : b.isDeepOne;
        if (aIsDeep && bIsDeep) {
            return 0;
        }
        if (aIsDeep) {
            return 1;
        }
        if (bIsDeep) {
            return -1;
        }
        return a.context.getProperty(that.oTreeProperties["hierarchy-preorder-rank-for"]) - b.context.getProperty(that.oTreeProperties["hierarchy-preorder-rank-for"]);
    });
    var iContainingIndex = -1;
    aAddedNodes = aAddedNodes.filter(function (oNode, idx) {
        if (oNode.newIsDeepOne !== undefined ? oNode.newIsDeepOne : oNode.isDeepOne) {
            return true;
        }
        if (idx <= iContainingIndex) {
            return false;
        }
        var iMagnitude = oNode.context.getProperty(that.oTreeProperties["hierarchy-node-descendant-count-for"]);
        if (iMagnitude) {
            iContainingIndex = idx + iMagnitude;
        }
        return true;
    });
    return {
        added: aAddedNodes,
        removed: oOptimizedChanges.removed,
        moved: oOptimizedChanges.moved
    };
};
ODataTreeBindingFlat.prototype._updateNodeInfoAfterSave = function (oNode) {
    var bIsDeepOne = oNode.context.getProperty(this.oTreeProperties["hierarchy-preorder-rank-for"]) === undefined;
    if (oNode.isDeepOne === undefined) {
        oNode.isDeepOne = bIsDeepOne;
    }
    else {
        oNode.newIsDeepOne = bIsDeepOne;
    }
    var bInitiallyCollapsed = oNode.context.getProperty(this.oTreeProperties["hierarchy-drill-state-for"]) === "collapsed";
    if (oNode.initiallyCollapsed === undefined) {
        oNode.initiallyCollapsed = bInitiallyCollapsed;
    }
    else {
        oNode.newInitiallyCollapsed = bInitiallyCollapsed;
    }
};
ODataTreeBindingFlat.prototype._requestExtraInfoForAddedNodes = function (aAdded) {
    var aPromises = [], that = this;
    aAdded.forEach(function (oNode) {
        var p = new Promise(function (resolve, reject) {
            that._generatePreorderPositionRequest(oNode, {
                success: resolve,
                error: reject
            });
        });
        aPromises.push(p);
    });
    aPromises = aPromises.map(function (pPromise) {
        return pPromise.then(function (aResponseData) {
            return {
                responseData: aResponseData
            };
        }, function (oError) {
            return {
                error: oError
            };
        });
    });
    return Promise.all(aPromises).then(function (aData) {
        var iAborted = 0;
        aData.forEach(function (oData) {
            if (oData.error) {
                if (oData.error.statusCode === 0) {
                    iAborted++;
                }
                else {
                    throw new Error("Tree state restoration request failed. Complete or partial tree state might get lost. Error: " + (oData.error.message.value || oData.error.message));
                }
            }
        });
        return iAborted === 0;
    });
};
ODataTreeBindingFlat.prototype._restoreTreeState = function (oOptimizedChanges) {
    var that = this;
    this._abortPendingRequest();
    oOptimizedChanges = oOptimizedChanges || {
        creationCancelled: [],
        added: [],
        removed: [],
        moved: []
    };
    if (!this.bSkipDataEvents) {
        this.fireDataRequested();
    }
    this.bSkipDataEvents = false;
    return this._requestExtraInfoForAddedNodes(oOptimizedChanges.added).then(function (bNoAbort) {
        if (bNoAbort) {
            return that._executeRestoreTreeState(oOptimizedChanges).then(function (aData) {
                if (aData) {
                    that._fireChange({ reason: ChangeReason.Change });
                    that.fireDataReceived({ data: aData });
                    return aData;
                }
            });
        }
    });
};
ODataTreeBindingFlat.prototype._executeRestoreTreeState = function (oOptimizedChanges) {
    var iCollapsedNodesCount, oSection, aSections, oDeepNodeSection, oChildSection, mCollapsedKeys, aPromises, i, j, k, l, oChanges, mDeepChanges, that = this;
    oOptimizedChanges.added.forEach(this._updateNodeInfoAfterSave.bind(this));
    oOptimizedChanges.moved.forEach(this._updateNodeInfoAfterSave.bind(this));
    aPromises = [];
    aSections = this._collectServerSections(this._aNodes);
    oOptimizedChanges = this._optimizeOptimizedChanges(oOptimizedChanges);
    oChanges = this._filterChangeForServerSections(oOptimizedChanges);
    this._adaptSections(aSections, oChanges);
    for (i = 0; i < aSections.length; i++) {
        oSection = aSections[i];
        aPromises.push(this._restoreServerIndexNodes(oSection.iSkip, oSection.iTop, i === 0));
    }
    var aDeepNodeSections = this._collectDeepNodes();
    mDeepChanges = this._filterChangesForDeepSections(oOptimizedChanges);
    for (j = 0; j < aDeepNodeSections.length; j++) {
        oDeepNodeSection = aDeepNodeSections[j];
        if (mDeepChanges) {
            oChanges = mDeepChanges[oDeepNodeSection.oParentNode.key];
            if (oChanges) {
                this._adaptSections(oDeepNodeSection.aChildSections, oChanges, {
                    indexName: "positionInParent",
                    ignoreMagnitude: true
                });
            }
        }
        for (k = 0; k < oDeepNodeSection.aChildSections.length; k++) {
            oChildSection = oDeepNodeSection.aChildSections[k];
            aPromises.push(this._restoreChildren(oDeepNodeSection.oParentNode, oChildSection.iSkip, oChildSection.iTop));
        }
    }
    mCollapsedKeys = {};
    for (l = 0; l < this._aCollapsed.length; l++) {
        mCollapsedKeys[this._aCollapsed[l].key] = true;
    }
    iCollapsedNodesCount = this._aCollapsed.length;
    this.resetData(true);
    function restoreCollapseState() {
        if (iCollapsedNodesCount > 0) {
            that._map(function (oNode, oRecursionBreaker) {
                if (oNode && mCollapsedKeys[oNode.key]) {
                    that.collapse(oNode, true);
                    iCollapsedNodesCount--;
                    if (iCollapsedNodesCount === 0) {
                        oRecursionBreaker.broken = true;
                    }
                }
            });
        }
    }
    aPromises = aPromises.map(function (pPromise) {
        return pPromise.then(function (aResponseData) {
            return {
                responseData: aResponseData
            };
        }, function (oError) {
            return {
                error: oError
            };
        });
    });
    return Promise.all(aPromises).then(function (aData) {
        var iAborted = 0;
        aData.forEach(function (oData) {
            if (oData.error) {
                if (oData.error.statusCode === 0) {
                    iAborted++;
                }
                else {
                    throw new Error("Tree state restoration request failed. Complete or partial tree state might get lost. Error: " + (oData.error.message.value || oData.error.message));
                }
            }
        });
        if (iAborted < aData.length) {
            restoreCollapseState();
            return aData;
        }
    });
};
ODataTreeBindingFlat.prototype._collectServerSections = function (aNodes) {
    var aSections = [];
    var oSection;
    for (var i = 0; i < aNodes.length; i++) {
        if (aNodes[i] !== undefined) {
            if (!oSection) {
                oSection = {
                    iSkip: i,
                    iTop: 1
                };
                aSections.push(oSection);
            }
            else {
                oSection.iTop++;
            }
        }
        else {
            oSection = null;
        }
    }
    return aSections;
};
ODataTreeBindingFlat.prototype._adaptSections = function (aSections, oChanges, oConfig) {
    var aRemoved = oChanges.removed || [], aAdded = oChanges.added || [], sIndexName = (oConfig && oConfig.indexName) || "serverIndex", oNode, oSection, oAdded, iRestLength, iRemovedLength, iRemovedNodeCount = 0, iMagnitude, iPosition, iPendingRemoveEnd, iNextPendingRemoveEnd, iPendingRemoveLength, iAddedLength, iNextDelta, iCurrentDelta = 0, iTopDelta, sPositionAnnot, aAddedIndices = [];
    for (var l = aAdded.length - 1; l >= 0; l--) {
        oNode = aAdded[l];
        if (oNode.newIsDeepOne !== undefined ? oNode.newIsDeepOne : oNode.isDeepOne) {
            sPositionAnnot = this.oTreeProperties["hierarchy-sibling-rank-for"];
        }
        else {
            sPositionAnnot = this.oTreeProperties["hierarchy-preorder-rank-for"];
            if (oNode.newInitiallyCollapsed !== undefined ? !oNode.newInitiallyCollapsed : !oNode.initiallyCollapsed) {
                iMagnitude = oNode.context.getProperty(this.oTreeProperties["hierarchy-node-descendant-count-for"]);
            }
        }
        iPosition = oNode.context.getProperty(sPositionAnnot);
        if (iPosition === undefined) {
            Log.warning("ODataTreeBindingFlat", "Missing " + sPositionAnnot + " value for node " + oNode.key);
            break;
        }
        aAddedIndices.push({
            position: iPosition,
            magnitude: iMagnitude || 0,
            assignedToSection: false
        });
    }
    for (var i = 0; i < aSections.length; i++) {
        oSection = aSections[i];
        iNextDelta = iCurrentDelta;
        iPendingRemoveEnd = iNextPendingRemoveEnd;
        iNextPendingRemoveEnd = 0;
        iTopDelta = 0;
        for (var j = aRemoved.length - 1; j >= 0; j--) {
            oNode = aRemoved[j];
            iPosition = oNode[sIndexName];
            if (iPosition >= oSection.iSkip && iPosition <= oSection.iSkip + oSection.iTop) {
                if (sIndexName === "serverIndex") {
                    iRemovedNodeCount++;
                }
                iMagnitude = (oConfig && oConfig.ignoreMagnitude) ? 0 : this._getInitialMagnitude(oNode);
                iRemovedLength = (1 + iMagnitude);
                iRestLength = (oSection.iSkip + oSection.iTop) - iPosition - iRemovedLength;
                if (iRestLength > 0) {
                    iTopDelta -= iRemovedLength;
                }
                else {
                    iTopDelta -= (oSection.iSkip + oSection.iTop) - iPosition;
                    if (iRestLength < 0) {
                        iNextPendingRemoveEnd = iPosition + iRemovedLength;
                    }
                }
                iNextDelta -= iRemovedLength;
            }
        }
        if (oSection.iSkip <= iPendingRemoveEnd) {
            iPendingRemoveLength = oSection.iSkip - iPendingRemoveEnd;
            iTopDelta += iPendingRemoveLength;
            if (oSection.iTop + iTopDelta < 0) {
                iNextPendingRemoveEnd = iPendingRemoveEnd;
            }
        }
        oSection.iSkip += iCurrentDelta;
        oSection.iTop += iTopDelta;
        if (oSection.iTop > 0) {
            iCurrentDelta = 0;
            iTopDelta = 0;
            for (var k = 0; k < aAddedIndices.length; k++) {
                oAdded = aAddedIndices[k];
                iPosition = oAdded.position;
                iAddedLength = (oConfig && oConfig.ignoreMagnitude) ? 1 : oAdded.magnitude + 1;
                if (iPosition >= oSection.iSkip && iPosition <= oSection.iSkip + oSection.iTop) {
                    iTopDelta += iAddedLength;
                    aAddedIndices[k].assignedToSection = true;
                }
                else if (iPosition < oSection.iSkip) {
                    iCurrentDelta += iAddedLength;
                }
            }
            oSection.iSkip += iCurrentDelta;
            oSection.iTop += iTopDelta;
            oSection.iTop += iRemovedNodeCount;
        }
        if (oSection.iTop <= 0) {
            aSections.splice(i, 1);
            i--;
        }
        iCurrentDelta = iNextDelta;
    }
    for (var m = 0; m < aAddedIndices.length; m++) {
        oAdded = aAddedIndices[m];
        iAddedLength = (oConfig && oConfig.ignoreMagnitude) ? 1 : oAdded.magnitude + 1;
        if (!oAdded.assignedToSection) {
            aSections.push({
                iSkip: oAdded.position,
                iTop: iAddedLength
            });
        }
    }
    aSections.sort(function (a, b) {
        return a.iSkip - b.iSkip;
    });
    for (var n = 0; n < aSections.length; n++) {
        if (n + 1 < aSections.length) {
            oSection = aSections[n];
            var oNextSection = aSections[n + 1];
            if (oSection.iSkip + oSection.iTop === oNextSection.iSkip) {
                oSection.iTop += oNextSection.iTop;
                aSections.splice(n + 1, 1);
                n--;
            }
        }
    }
};
ODataTreeBindingFlat.prototype._optimizeChanges = function () {
    var aRemoved = [], aCreationCancelled = [], aAdded = [], aMoved = [];
    var bIsRemovedInParent = false;
    var fnCheckRemoved = function (oNode, oBreaker) {
        if (oNode.nodeState.removed && !oNode.nodeState.reinserted) {
            bIsRemovedInParent = true;
            oBreaker.broken = true;
        }
    };
    var aPotentiallyRemovedNodes = [];
    var fnTrackRemovedNodes = function (oNode) {
        if ((oNode.isDeepOne || oNode.serverIndex >= 0) && aPotentiallyRemovedNodes.indexOf(oNode) == -1) {
            aPotentiallyRemovedNodes.push(oNode);
        }
        if (oNode.nodeState.added) {
            aCreationCancelled.push(oNode);
        }
    };
    this._aAllChangedNodes.forEach(function (oNode) {
        bIsRemovedInParent = false;
        this._up(oNode, fnCheckRemoved, false);
        if (bIsRemovedInParent) {
            fnTrackRemovedNodes(oNode);
        }
        else {
            if (oNode.nodeState.removed && !oNode.nodeState.reinserted) {
                fnTrackRemovedNodes(oNode);
            }
            else if (oNode.nodeState.added) {
                aAdded.push(oNode);
            }
            else {
                aMoved.push(oNode);
            }
        }
    }.bind(this));
    aPotentiallyRemovedNodes.sort(function (a, b) {
        var iA = this._getRelatedServerIndex(a);
        var iB = this._getRelatedServerIndex(b);
        assert(iA != undefined, "_generateSubmitData: (containing) Server-Index not found for node 'a'");
        assert(iB != undefined, "_generateSubmitData: (containing) Server-Index not found node 'b'");
        if (iA == iB && a.isDeepOne && b.isDeepOne) {
            if (a.parent === b.parent) {
                return a.positionInParent - b.positionInParent;
            }
            else {
                return a.originalLevel - b.originalLevel;
            }
        }
        return iA - iB;
    }.bind(this));
    var fnNodeIsDeletedInOldParent = function (oDeletedNode) {
        var bIsDeleted = false;
        this._up(oDeletedNode, function (oParentNode, oBreak) {
            if (oParentNode.nodeState.removed && !oParentNode.nodeState.reinserted) {
                bIsDeleted = true;
                oBreak.broken = true;
            }
        }, true);
        return bIsDeleted;
    }.bind(this);
    for (var i = 0; i < aPotentiallyRemovedNodes.length; i++) {
        var oDeletedNode = aPotentiallyRemovedNodes[i];
        if (!fnNodeIsDeletedInOldParent(oDeletedNode)) {
            aRemoved.push(oDeletedNode);
        }
    }
    return {
        removed: aRemoved,
        creationCancelled: aCreationCancelled,
        added: aAdded,
        moved: aMoved
    };
};
ODataTreeBindingFlat.prototype._collectDeepNodes = function () {
    var aDeepNodes = [], that = this;
    this._map(function (oNode) {
        if (oNode && oNode.nodeState.expanded && ((oNode.initiallyCollapsed || oNode.isDeepOne))) {
            aDeepNodes.push({
                oParentNode: oNode,
                aChildSections: that._collectServerSections(oNode.children)
            });
        }
    });
    return aDeepNodes;
};
ODataTreeBindingFlat.prototype._trackChangedNode = function (oNode) {
    if (this._aAllChangedNodes.indexOf(oNode) == -1) {
        this._aAllChangedNodes.push(oNode);
    }
};
ODataTreeBindingFlat.prototype.addContexts = function (oParentContext, vContextHandles) {
    var oNodeInfo = this._findNodeByContext(oParentContext), oNewParentNode = oNodeInfo.node, oModel = this.getModel(), oNewHandle, oContext;
    assert(oParentContext && vContextHandles, "ODataTreeBinding.addContexts() was called with incomplete arguments!");
    if (oNewParentNode) {
        this._bReadOnly = false;
        if (oNewParentNode.nodeState && oNewParentNode.nodeState.isLeaf) {
            oNewParentNode.nodeState.isLeaf = false;
            oNewParentNode.nodeState.collapsed = true;
        }
        if (!Array.isArray(vContextHandles)) {
            if (vContextHandles instanceof sap.ui.model.Context) {
                vContextHandles = [vContextHandles];
            }
            else {
                Log.warning("ODataTreeBinding.addContexts(): The child node argument is not of type sap.ui.model.Context.");
            }
        }
        var fnBuildGetSubtree = function (oFreshNode) {
            return function () {
                return [oFreshNode];
            };
        };
        vContextHandles = vContextHandles.slice();
        vContextHandles.reverse();
        for (var j = 0; j < vContextHandles.length; j++) {
            var oContext = vContextHandles[j];
            if (!oContext || !(oContext instanceof sap.ui.model.Context)) {
                Log.warning("ODataTreeBindingFlat.addContexts(): no valid child context given!");
                return;
            }
            var oNewHandle = this._mSubtreeHandles[oContext.getPath()];
            this._ensureHierarchyNodeIDForContext(oContext);
            if (oNewHandle && oNewHandle._isRemovedSubtree) {
                Log.info("ODataTreeBindingFlat.addContexts(): Existing context added '" + oContext.getPath() + "'");
                oNewHandle._oNewParentNode = oNewParentNode;
                oNewHandle._oSubtreeRoot.nodeState.reinserted = true;
                oNewHandle._oSubtreeRoot.originalParent = oNewHandle._oSubtreeRoot.originalParent || oNewHandle._oSubtreeRoot.parent;
                oNewHandle._oSubtreeRoot.parent = oNewParentNode;
                oNewHandle._oSubtreeRoot.containingSubtreeHandle = oNewHandle;
                oContext = oNewHandle.getContext();
                this._trackChangedNode(oNewHandle._oSubtreeRoot);
                this._mSubtreeHandles[oContext.getPath()];
            }
            else {
                Log.info("ODataTreeBindingFlat.addContexts(): Newly created context added.");
                this._ensureHierarchyNodeIDForContext(oContext);
                var oFreshNode = {
                    context: oContext,
                    key: oModel.getKey(oContext),
                    parent: oNewParentNode,
                    nodeState: {
                        isLeaf: true,
                        collapsed: false,
                        expanded: false,
                        selected: false,
                        added: true
                    },
                    addedSubtrees: [],
                    children: [],
                    magnitude: 0
                };
                this._trackChangedNode(oFreshNode);
                this._aAdded.push(oFreshNode);
                oNewHandle = {
                    _getSubtree: fnBuildGetSubtree(oFreshNode),
                    _oSubtreeRoot: null,
                    _oNewParentNode: oNewParentNode
                };
            }
            oNewHandle._iContainingServerIndex = oNewParentNode.serverIndex || oNewParentNode.containingServerIndex;
            oNewParentNode.addedSubtrees.unshift(oNewHandle);
            if (oNewParentNode.serverIndex !== undefined) {
                this._aNodeChanges[oNewParentNode.serverIndex] = true;
            }
        }
        this._aNodeCache = [];
        this._cleanTreeStateMaps();
        this._fireChange({ reason: ChangeReason.Add });
    }
    else {
        Log.warning("The given parent context could not be found in the tree. No new sub-nodes were added!");
    }
};
ODataTreeBindingFlat.prototype._ensureHierarchyNodeIDForContext = function (oContext) {
    if (oContext) {
        var sNewlyGeneratedID = oContext.getProperty(this.oTreeProperties["hierarchy-node-for"]);
        if (oContext.isTransient() && !sNewlyGeneratedID) {
            this.oModel.setProperty(this.oTreeProperties["hierarchy-node-for"], uid(), oContext);
        }
    }
};
ODataTreeBindingFlat.prototype.removeContext = function (oContext) {
    var that = this;
    var oNodeInfo = this._findNodeByContext(oContext);
    var oNodeForContext = oNodeInfo.node;
    var iIndex = oNodeInfo.index;
    if (oNodeForContext) {
        this._bReadOnly = false;
        oNodeForContext.nodeState.removed = true;
        this._aRemoved.push(oNodeForContext);
        this._trackChangedNode(oNodeForContext);
        if (oNodeForContext.serverIndex !== undefined) {
            this._aNodeChanges[oNodeForContext.serverIndex] = true;
        }
        if (oNodeForContext.containingSubtreeHandle && oNodeForContext.parent != null) {
            var iNewParentIndex = oNodeForContext.parent.addedSubtrees.indexOf(oNodeForContext.containingSubtreeHandle);
            if (iNewParentIndex != -1) {
                oNodeForContext.parent.addedSubtrees.splice(iNewParentIndex, 1);
                oNodeForContext.nodeState.reinserted = false;
                oNodeForContext.parent = null;
            }
        }
        this._aNodeCache = [];
        this.setNodeSelection(oNodeForContext, false);
        this._cleanUpSelection(true);
        this._cleanTreeStateMaps();
        this._fireChange({ reason: ChangeReason.Remove });
        this._mSubtreeHandles[oContext.getPath()] = {
            _removedFromVisualIndex: iIndex,
            _isRemovedSubtree: true,
            _oSubtreeRoot: oNodeForContext,
            _getSubtree: function () {
                if (oNodeForContext.serverIndex != undefined && !oNodeForContext.initiallyCollapsed) {
                    return that._aNodes.slice(oNodeForContext.serverIndex, oNodeForContext.serverIndex + oNodeForContext.magnitude + 1);
                }
                else {
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
                this._aNodeCache = [];
                that._cleanTreeStateMaps();
                that._fireChange({ reason: ChangeReason.Add });
            }
        };
        return oContext;
    }
    else {
        Log.warning("ODataTreeBinding.removeContexts(): The given context is not part of the tree. Was it removed already?");
    }
};
ODataTreeBindingFlat.prototype._getRelatedServerIndex = function (oNode) {
    if (oNode.serverIndex === undefined) {
        return oNode.containingServerIndex;
    }
    else {
        return oNode.serverIndex;
    }
};
ODataTreeBindingFlat.prototype.getNodeInfoByRowIndex = function (iRowIndex) {
    var iCPointer = 0, iEPointer = 0, oNode, bTypeCollapse, iValidCollapseIndex = -1;
    while (iCPointer < this._aCollapsed.length || iEPointer < this._aExpanded.length) {
        if (this._aCollapsed[iCPointer] && this._aExpanded[iEPointer]) {
            if (this._getRelatedServerIndex(this._aCollapsed[iCPointer]) > this._getRelatedServerIndex(this._aExpanded[iEPointer])) {
                oNode = this._aExpanded[iEPointer];
                iEPointer++;
                bTypeCollapse = false;
            }
            else {
                oNode = this._aCollapsed[iCPointer];
                iCPointer++;
                bTypeCollapse = true;
            }
        }
        else if (this._aCollapsed[iCPointer]) {
            oNode = this._aCollapsed[iCPointer];
            iCPointer++;
            bTypeCollapse = true;
        }
        else {
            oNode = this._aExpanded[iEPointer];
            iEPointer++;
            bTypeCollapse = false;
        }
        if (iRowIndex <= this._getRelatedServerIndex(oNode)) {
            break;
        }
        if (bTypeCollapse) {
            if (!oNode.isDeepOne && !oNode.initiallyCollapsed && oNode.serverIndex > iValidCollapseIndex) {
                iRowIndex += oNode.magnitude;
                iValidCollapseIndex = oNode.serverIndex + oNode.magnitude;
            }
        }
        else {
            if (oNode.serverIndex > iValidCollapseIndex) {
                if (!oNode.isDeepOne && oNode.initiallyCollapsed) {
                    iRowIndex -= oNode.magnitude;
                }
                if (iRowIndex <= oNode.serverIndex) {
                    return this._calcDirectIndex(oNode, iRowIndex + oNode.magnitude - oNode.serverIndex - 1);
                }
            }
        }
    }
    return {
        index: iRowIndex
    };
};
ODataTreeBindingFlat.prototype._calcDirectIndex = function (oNode, index) {
    var i, iMagnitude, oChild;
    for (i = 0; i < oNode.children.length; i++) {
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
        }
        else {
            index -= iMagnitude;
        }
    }
};
ODataTreeBindingFlat.prototype.getRowIndexByNode = function (oNode) {
    var iDelta = 0;
    var oChildNode;
    var i;
    if (oNode.isDeepOne) {
        while (oNode.parent) {
            iDelta += oNode.positionInParent + 1;
            for (i = 0; i < oNode.positionInParent; i++) {
                oChildNode = oNode.parent.children[i];
                if (oChildNode && oChildNode.nodeState.expanded) {
                    iDelta += oChildNode.magnitude;
                }
            }
            oNode = oNode.parent;
        }
    }
    return this._calcIndexDelta(oNode.serverIndex) + oNode.serverIndex + iDelta;
};
ODataTreeBindingFlat.prototype._getSelectedNodesInfo = function () {
    var aNodesInfo = [];
    if (isEmptyObject(this._mSelected)) {
        return aNodesInfo;
    }
    var bIsVisible = true;
    var fnCheckVisible = function (oNode, oBreaker) {
        if (oNode.nodeState.collapsed || (oNode.nodeState.removed && !oNode.nodeState.reinserted)) {
            bIsVisible = false;
            oBreaker.broken = true;
        }
    };
    for (var sKey in this._mSelected) {
        var oSelectedNode = this._mSelected[sKey];
        bIsVisible = true;
        this._up(oSelectedNode, fnCheckVisible, false);
        if (bIsVisible) {
            aNodesInfo.push({
                node: oSelectedNode,
                rowIndex: this.getRowIndexByNode(oSelectedNode)
            });
        }
    }
    aNodesInfo.sort(function (oNodeInfo1, oNodeInfo2) {
        return oNodeInfo1.rowIndex - oNodeInfo2.rowIndex;
    });
    return aNodesInfo;
};
ODataTreeBindingFlat.prototype._calcIndexDelta = function (iEndServerIndex) {
    var mCollapsedServerIndices = {};
    this._aCollapsed.forEach(function (oNode) {
        if (oNode.serverIndex >= 0 && oNode.serverIndex < iEndServerIndex && !oNode.isDeepOne && !oNode.initiallyCollapsed) {
            mCollapsedServerIndices[oNode.serverIndex] = oNode.magnitude;
        }
    });
    var iLastCollapsedIndex = 0;
    var iCollapsedDelta = 0;
    for (var i = 0; i < this._aCollapsed.length; i++) {
        var oCollapsedNode = this._aCollapsed[i];
        if (this._getRelatedServerIndex(oCollapsedNode) >= iEndServerIndex) {
            break;
        }
        if (!oCollapsedNode.isDeepOne) {
            if (oCollapsedNode.serverIndex >= iLastCollapsedIndex && !oCollapsedNode.initiallyCollapsed) {
                iCollapsedDelta -= oCollapsedNode.magnitude;
                iLastCollapsedIndex = oCollapsedNode.serverIndex + oCollapsedNode.magnitude;
            }
            else {
            }
        }
        else {
        }
    }
    var iExpandedDelta = 0;
    var fnInCollapsedRange = function (oNode) {
        var bIgnore = false;
        var iContainingIndexToCheck = oNode.serverIndex || oNode.containingServerIndex;
        for (var j in mCollapsedServerIndices) {
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
        if (oExpandedNode.isDeepOne) {
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
            if (!bYep && !bIgnore) {
                iExpandedDelta += oExpandedNode.children.length;
            }
        }
        else if (oExpandedNode.initiallyCollapsed) {
            var bIgnore = fnInCollapsedRange(oExpandedNode);
            if (!bIgnore) {
                iExpandedDelta += oExpandedNode.children.length;
            }
        }
    }
    return iExpandedDelta + iCollapsedDelta;
};
ODataTreeBindingFlat.prototype._sortNodes = function (aNodes) {
    var fnSort = function (a, b) {
        var iA = this._getRelatedServerIndex(a);
        var iB = this._getRelatedServerIndex(b);
        return iA - iB;
    }.bind(this);
    aNodes.sort(fnSort);
};
ODataTreeBindingFlat.prototype._abortPendingRequest = function () {
    if (this._aPendingRequests.length || this._aPendingChildrenRequests.length) {
        this.bSkipDataEvents = true;
        var i, j;
        for (i = this._aPendingRequests.length - 1; i >= 0; i--) {
            this._aPendingRequests[i].oRequestHandle.abort();
        }
        this._aPendingRequests = [];
        for (j = this._aPendingChildrenRequests.length - 1; j >= 0; j--) {
            this._aPendingChildrenRequests[j].oRequestHandle.abort();
        }
        this._aPendingChildrenRequests = [];
    }
};
ODataTreeBindingFlat.prototype.attachSelectionChanged = function (oData, fnFunction, oListener) {
    this.attachEvent("selectionChanged", oData, fnFunction, oListener);
    return this;
};
ODataTreeBindingFlat.prototype.detachSelectionChanged = function (fnFunction, oListener) {
    this.detachEvent("selectionChanged", fnFunction, oListener);
    return this;
};
ODataTreeBindingFlat.prototype.fireSelectionChanged = function (oParameters) {
    this.fireEvent("selectionChanged", oParameters);
    return this;
};
ODataTreeBindingFlat.prototype.getRootContexts = function () { };
ODataTreeBindingFlat.prototype.getNodeContexts = function () { };