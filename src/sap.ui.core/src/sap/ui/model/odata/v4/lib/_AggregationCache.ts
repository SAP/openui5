import _AggregationHelper from "./_AggregationHelper";
import _Cache from "./_Cache";
import _ConcatHelper from "./_ConcatHelper";
import _GroupLock from "./_GroupLock";
import _Helper from "./_Helper";
import _MinMaxHelper from "./_MinMaxHelper";
import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
function _AggregationCache(oRequestor, sResourcePath, oAggregation, mQueryOptions, bHasGrandTotal) {
    var fnCount = function () { }, fnLeaves = null, that = this;
    _Cache.call(this, oRequestor, sResourcePath, mQueryOptions, true);
    this.oAggregation = oAggregation;
    this.sDownloadUrl = _Cache.prototype.getDownloadUrl.call(this, "");
    this.aElements = [];
    this.aElements.$byPredicate = {};
    this.aElements.$count = undefined;
    this.aElements.$created = 0;
    this.oLeavesPromise = undefined;
    if (mQueryOptions.$count && oAggregation.groupLevels.length) {
        mQueryOptions.$$leaves = true;
        this.oLeavesPromise = new SyncPromise(function (resolve) {
            fnLeaves = function (oLeaves) {
                resolve(parseInt(oLeaves.UI5__leaves));
            };
        });
    }
    this.oFirstLevel = this.createGroupLevelCache(null, bHasGrandTotal || !!fnLeaves);
    this.oGrandTotalPromise = undefined;
    if (bHasGrandTotal) {
        this.oGrandTotalPromise = new SyncPromise(function (resolve) {
            _ConcatHelper.enhanceCache(that.oFirstLevel, oAggregation, [fnLeaves, function (oGrandTotal) {
                    var oGrandTotalCopy;
                    if (oAggregation["grandTotal like 1.84"]) {
                        _AggregationHelper.removeUI5grand__(oGrandTotal);
                    }
                    _AggregationHelper.setAnnotations(oGrandTotal, true, true, 0, _AggregationHelper.getAllProperties(oAggregation));
                    if (oAggregation.grandTotalAtBottomOnly === false) {
                        oGrandTotalCopy = Object.assign({}, oGrandTotal, {
                            "@$ui5.node.isExpanded": undefined
                        });
                        _Helper.setPrivateAnnotation(oGrandTotal, "copy", oGrandTotalCopy);
                        _Helper.setPrivateAnnotation(oGrandTotalCopy, "predicate", "($isTotal=true)");
                    }
                    _Helper.setPrivateAnnotation(oGrandTotal, "predicate", "()");
                    resolve(oGrandTotal);
                }, fnCount]);
        });
    }
    else if (fnLeaves) {
        _ConcatHelper.enhanceCache(that.oFirstLevel, oAggregation, [fnLeaves, fnCount]);
    }
}
_AggregationCache.prototype = Object.create(_Cache.prototype);
_AggregationCache.prototype.addElements = function (vReadElements, iOffset, oCache, iStart) {
    var aElements = this.aElements;
    function addElement(oElement, i) {
        var oOldElement = aElements[iOffset + i], oParent, sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
        if (oOldElement) {
            if (oOldElement === oElement) {
                return;
            }
            oParent = _Helper.getPrivateAnnotation(oOldElement, "parent");
            if (!oParent) {
                throw new Error("Unexpected element");
            }
            if (oParent !== oCache || _Helper.getPrivateAnnotation(oOldElement, "index") !== iStart + i) {
                throw new Error("Wrong placeholder");
            }
        }
        else if (iOffset + i >= aElements.length) {
            throw new Error("Array index out of bounds: " + (iOffset + i));
        }
        if (sPredicate in aElements.$byPredicate && aElements.$byPredicate[sPredicate] !== oElement) {
            throw new Error("Duplicate predicate: " + sPredicate);
        }
        aElements[iOffset + i] = oElement;
        aElements.$byPredicate[sPredicate] = oElement;
    }
    if (iOffset < 0) {
        throw new Error("Illegal offset: " + iOffset);
    }
    if (Array.isArray(vReadElements)) {
        vReadElements.forEach(addElement);
    }
    else {
        addElement(vReadElements, 0);
    }
};
_AggregationCache.prototype.collapse = function (sGroupNodePath) {
    var oCollapsed, iCount = 0, aElements = this.aElements, oGroupNode = this.fetchValue(_GroupLock.$cached, sGroupNodePath).getResult(), iGroupNodeLevel = oGroupNode["@$ui5.node.level"], iIndex = aElements.indexOf(oGroupNode), i = iIndex + 1;
    function collapse(j) {
        delete aElements.$byPredicate[_Helper.getPrivateAnnotation(aElements[j], "predicate")];
        iCount += 1;
    }
    oCollapsed = _Helper.getPrivateAnnotation(oGroupNode, "collapsed");
    _Helper.updateAll(this.mChangeListeners, sGroupNodePath, oGroupNode, oCollapsed);
    while (i < aElements.length && aElements[i]["@$ui5.node.level"] > iGroupNodeLevel) {
        collapse(i);
        i += 1;
    }
    if (this.oAggregation.subtotalsAtBottomOnly !== undefined && Object.keys(oCollapsed).length > 1) {
        collapse(i);
    }
    _Helper.setPrivateAnnotation(oGroupNode, "spliced", aElements.splice(iIndex + 1, iCount));
    aElements.$count -= iCount;
    _Helper.updateAll(this.mChangeListeners, sGroupNodePath, oGroupNode, { "@$ui5.node.groupLevelCount": undefined });
    return iCount;
};
_AggregationCache.prototype.createGroupLevelCache = function (oGroupNode, bHasConcatHelper) {
    var oAggregation = this.oAggregation, aAllProperties = _AggregationHelper.getAllProperties(oAggregation), oCache, aGroupBy, bLeaf, iLevel, mQueryOptions, bTotal;
    iLevel = oGroupNode ? oGroupNode["@$ui5.node.level"] + 1 : 1;
    bLeaf = iLevel > oAggregation.groupLevels.length;
    aGroupBy = bLeaf ? oAggregation.groupLevels.concat(Object.keys(oAggregation.group).sort()) : oAggregation.groupLevels.slice(0, iLevel);
    mQueryOptions = _AggregationHelper.filterOrderby(this.mQueryOptions, oAggregation, iLevel);
    bTotal = !bLeaf && Object.keys(oAggregation.aggregate).some(function (sAlias) {
        return oAggregation.aggregate[sAlias].subtotals;
    });
    if (oGroupNode) {
        mQueryOptions.$$filterBeforeAggregate = _Helper.getPrivateAnnotation(oGroupNode, "filter") + (mQueryOptions.$$filterBeforeAggregate ? " and (" + mQueryOptions.$$filterBeforeAggregate + ")" : "");
    }
    if (!bHasConcatHelper) {
        delete mQueryOptions.$count;
        mQueryOptions = _AggregationHelper.buildApply(oAggregation, mQueryOptions, iLevel);
    }
    mQueryOptions.$count = true;
    oCache = _Cache.create(this.oRequestor, this.sResourcePath, mQueryOptions, true);
    oCache.calculateKeyPredicate = _AggregationCache.calculateKeyPredicate.bind(null, oGroupNode, aGroupBy, aAllProperties, bLeaf, bTotal);
    return oCache;
};
_AggregationCache.prototype.expand = function (oGroupLock, vGroupNodeOrPath) {
    var oCache, iCount, aElements = this.aElements, oGroupNode = typeof vGroupNodeOrPath === "string" ? this.fetchValue(_GroupLock.$cached, vGroupNodeOrPath).getResult() : vGroupNodeOrPath, iIndex, aSpliced = _Helper.getPrivateAnnotation(oGroupNode, "spliced"), that = this;
    if (vGroupNodeOrPath !== oGroupNode) {
        _Helper.updateAll(this.mChangeListeners, vGroupNodeOrPath, oGroupNode, _AggregationHelper.getOrCreateExpandedObject(this.oAggregation, oGroupNode));
    }
    if (aSpliced) {
        _Helper.deletePrivateAnnotation(oGroupNode, "spliced");
        iIndex = aElements.indexOf(oGroupNode) + 1;
        this.aElements = aElements.concat(aSpliced, aElements.splice(iIndex));
        this.aElements.$byPredicate = aElements.$byPredicate;
        iCount = aSpliced.length;
        this.aElements.$count = aElements.$count + iCount;
        aSpliced.forEach(function (oElement) {
            var sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
            if (sPredicate) {
                that.aElements.$byPredicate[sPredicate] = oElement;
                if (_Helper.getPrivateAnnotation(oElement, "expanding")) {
                    _Helper.deletePrivateAnnotation(oElement, "expanding");
                    iCount += that.expand(_GroupLock.$cached, oElement).getResult();
                }
            }
        });
        _Helper.updateAll(that.mChangeListeners, vGroupNodeOrPath, oGroupNode, { "@$ui5.node.groupLevelCount": _Helper.getPrivateAnnotation(oGroupNode, "groupLevelCount") });
        return SyncPromise.resolve(iCount);
    }
    oCache = _Helper.getPrivateAnnotation(oGroupNode, "cache");
    if (!oCache) {
        oCache = this.createGroupLevelCache(oGroupNode);
        _Helper.setPrivateAnnotation(oGroupNode, "cache", oCache);
    }
    return oCache.read(0, this.iReadLength, 0, oGroupLock).then(function (oResult) {
        var iIndex = that.aElements.indexOf(oGroupNode) + 1, iLevel = oGroupNode["@$ui5.node.level"], oSubtotals = _Helper.getPrivateAnnotation(oGroupNode, "collapsed"), bSubtotalsAtBottom = that.oAggregation.subtotalsAtBottomOnly !== undefined && Object.keys(oSubtotals).length > 1, i;
        if (!oGroupNode["@$ui5.node.isExpanded"]) {
            _Helper.deletePrivateAnnotation(oGroupNode, "spliced");
            return 0;
        }
        if (!iIndex) {
            _Helper.setPrivateAnnotation(oGroupNode, "expanding", true);
            return 0;
        }
        iCount = oResult.value.$count;
        _Helper.setPrivateAnnotation(oGroupNode, "groupLevelCount", iCount);
        _Helper.updateAll(that.mChangeListeners, vGroupNodeOrPath, oGroupNode, { "@$ui5.node.groupLevelCount": iCount });
        if (bSubtotalsAtBottom) {
            iCount += 1;
        }
        if (iIndex === that.aElements.length) {
            that.aElements.length += iCount;
        }
        else {
            for (i = that.aElements.length - 1; i >= iIndex; i -= 1) {
                that.aElements[i + iCount] = that.aElements[i];
                delete that.aElements[i];
            }
        }
        that.addElements(oResult.value, iIndex, oCache, 0);
        for (i = iIndex + oResult.value.length; i < iIndex + oResult.value.$count; i += 1) {
            that.aElements[i] = _AggregationHelper.createPlaceholder(iLevel + 1, i - iIndex, oCache);
        }
        if (bSubtotalsAtBottom) {
            oSubtotals = Object.assign({}, oSubtotals);
            _AggregationHelper.setAnnotations(oSubtotals, undefined, true, iLevel, _AggregationHelper.getAllProperties(that.oAggregation));
            _Helper.setPrivateAnnotation(oSubtotals, "predicate", _Helper.getPrivateAnnotation(oGroupNode, "predicate").slice(0, -1) + ",$isTotal=true)");
            that.addElements(oSubtotals, iIndex + iCount - 1);
        }
        that.aElements.$count += iCount;
        return iCount;
    }, function (oError) {
        _Helper.updateAll(that.mChangeListeners, vGroupNodeOrPath, oGroupNode, _Helper.getPrivateAnnotation(oGroupNode, "collapsed"));
        throw oError;
    });
};
_AggregationCache.prototype.fetchValue = function (oGroupLock, sPath, fnDataRequested, oListener) {
    if (sPath === "$count") {
        if (this.oLeavesPromise) {
            return this.oLeavesPromise;
        }
        if (this.oAggregation.groupLevels.length) {
            Log.error("Failed to drill-down into $count, invalid segment: $count", this.toString(), "sap.ui.model.odata.v4.lib._Cache");
            return SyncPromise.resolve();
        }
        return this.oFirstLevel.fetchValue(oGroupLock, sPath, fnDataRequested, oListener);
    }
    this.registerChange(sPath, oListener);
    return this.drillDown(this.aElements, sPath, oGroupLock);
};
_AggregationCache.prototype.getDownloadQueryOptions = function (mQueryOptions) {
    return _AggregationHelper.buildApply(this.oAggregation, _AggregationHelper.filterOrderby(mQueryOptions, this.oAggregation), 0, true);
};
_AggregationCache.prototype.getDownloadUrl = function (_sPath, _mCustomQueryOptions) {
    return this.sDownloadUrl;
};
_AggregationCache.prototype.read = function (iIndex, iLength, iPrefetchLength, oGroupLock, fnDataRequested) {
    var oCurrentParent, iFirstLevelIndex = iIndex, iFirstLevelLength = iLength, oGapParent, iGapStart, bHasGrandTotal = !!this.oGrandTotalPromise, bHasGrandTotalAtTop = bHasGrandTotal && this.oAggregation.grandTotalAtBottomOnly !== true, aReadPromises = [], i, n, that = this;
    function readGap(iGapStart, iGapEnd) {
        var oCache = oGapParent, mQueryOptions = oGapParent.getQueryOptions(), iStart = _Helper.getPrivateAnnotation(that.aElements[iGapStart], "index"), oStartElement = that.aElements[iGapStart];
        if (mQueryOptions.$count) {
            delete mQueryOptions.$count;
            oGapParent.setQueryOptions(mQueryOptions, true);
        }
        aReadPromises.push(oGapParent.read(iStart, iGapEnd - iGapStart, 0, oGroupLock.getUnlockedCopy(), fnDataRequested).then(function (oResult) {
            var bGapHasMoved = false, oError;
            if (oStartElement !== that.aElements[iGapStart] && oResult.value[0] !== that.aElements[iGapStart]) {
                bGapHasMoved = true;
                iGapStart = that.aElements.indexOf(oStartElement);
                if (iGapStart < 0) {
                    iGapStart = that.aElements.indexOf(oResult.value[0]);
                    if (iGapStart < 0) {
                        oError = new Error("Collapse before read has finished");
                        oError.canceled = true;
                        throw oError;
                    }
                }
            }
            that.addElements(oResult.value, iGapStart, oCache, iStart);
            if (bGapHasMoved) {
                oError = new Error("Collapse or expand before read has finished");
                oError.canceled = true;
                throw oError;
            }
        }));
    }
    if (bHasGrandTotalAtTop && !iIndex && iLength === 1) {
        if (iPrefetchLength !== 0) {
            throw new Error("Unsupported prefetch length: " + iPrefetchLength);
        }
        oGroupLock.unlock();
        return this.oGrandTotalPromise.then(function (oGrandTotal) {
            return { value: [oGrandTotal] };
        });
    }
    else if (this.aElements.$count === undefined) {
        this.iReadLength = iLength + iPrefetchLength;
        if (bHasGrandTotalAtTop) {
            if (iFirstLevelIndex) {
                iFirstLevelIndex -= 1;
            }
            else {
                iFirstLevelLength -= 1;
            }
        }
        aReadPromises.push(this.oFirstLevel.read(iFirstLevelIndex, iFirstLevelLength, iPrefetchLength, oGroupLock, fnDataRequested).then(function (oResult) {
            var oGrandTotal, oGrandTotalCopy, iOffset = 0, j;
            that.aElements.length = that.aElements.$count = oResult.value.$count;
            if (bHasGrandTotal) {
                that.aElements.$count += 1;
                that.aElements.length += 1;
                oGrandTotal = that.oGrandTotalPromise.getResult();
                switch (that.oAggregation.grandTotalAtBottomOnly) {
                    case false:
                        iOffset = 1;
                        that.aElements.$count += 1;
                        that.aElements.length += 1;
                        that.addElements(oGrandTotal, 0);
                        oGrandTotalCopy = _Helper.getPrivateAnnotation(oGrandTotal, "copy");
                        that.addElements(oGrandTotalCopy, that.aElements.length - 1);
                        break;
                    case true:
                        that.addElements(oGrandTotal, that.aElements.length - 1);
                        break;
                    default:
                        iOffset = 1;
                        that.addElements(oGrandTotal, 0);
                }
            }
            that.addElements(oResult.value, iFirstLevelIndex + iOffset, that.oFirstLevel, iFirstLevelIndex);
            for (j = 0; j < that.aElements.$count; j += 1) {
                if (!that.aElements[j]) {
                    that.aElements[j] = _AggregationHelper.createPlaceholder(1, j - iOffset, that.oFirstLevel);
                }
            }
        }));
    }
    else {
        for (i = iIndex, n = Math.min(iIndex + iLength, this.aElements.length); i < n; i += 1) {
            oCurrentParent = _Helper.getPrivateAnnotation(this.aElements[i], "parent");
            if (oCurrentParent !== oGapParent) {
                if (iGapStart) {
                    readGap(iGapStart, i);
                    oGapParent = iGapStart = undefined;
                }
                if (oCurrentParent) {
                    iGapStart = i;
                    oGapParent = oCurrentParent;
                }
            }
        }
        if (iGapStart) {
            readGap(iGapStart, i);
        }
        oGroupLock.unlock();
    }
    return SyncPromise.all(aReadPromises).then(function () {
        var aElements = that.aElements.slice(iIndex, iIndex + iLength);
        aElements.$count = that.aElements.$count;
        return { value: aElements };
    });
};
_AggregationCache.prototype.refreshKeptElements = function () { };
_AggregationCache.prototype.toString = function () {
    return this.sDownloadUrl;
};
_AggregationCache.calculateKeyPredicate = function (oGroupNode, aGroupBy, aAllProperties, bLeaf, bTotal, oElement, mTypeForMetaPath, sMetaPath) {
    var sPredicate;
    if (!(sMetaPath in mTypeForMetaPath)) {
        return undefined;
    }
    if (oGroupNode) {
        aAllProperties.forEach(function (vProperty) {
            if (Array.isArray(vProperty)) {
                _Helper.inheritPathValue(vProperty, oGroupNode, oElement);
            }
            else if (!(vProperty in oElement)) {
                oElement[vProperty] = oGroupNode[vProperty];
            }
        });
    }
    sPredicate = bLeaf && _Helper.getKeyPredicate(oElement, sMetaPath, mTypeForMetaPath) || _Helper.getKeyPredicate(oElement, sMetaPath, mTypeForMetaPath, aGroupBy, true);
    _Helper.setPrivateAnnotation(oElement, "predicate", sPredicate);
    if (!bLeaf) {
        _Helper.setPrivateAnnotation(oElement, "filter", _Helper.getKeyFilter(oElement, sMetaPath, mTypeForMetaPath, aGroupBy));
    }
    _AggregationHelper.setAnnotations(oElement, bLeaf ? undefined : false, bTotal, oGroupNode ? oGroupNode["@$ui5.node.level"] + 1 : 1, oGroupNode ? null : aAllProperties);
    return sPredicate;
};
_AggregationCache.create = function (oRequestor, sResourcePath, sDeepResourcePath, oAggregation, mQueryOptions, bSortExpandSelect, bSharedRequest) {
    var bHasGrandTotal, bHasGroupLevels, bHasMinOrMax;
    if (oAggregation) {
        bHasGrandTotal = _AggregationHelper.hasGrandTotal(oAggregation.aggregate);
        bHasGroupLevels = !!oAggregation.groupLevels.length;
        bHasMinOrMax = _AggregationHelper.hasMinOrMax(oAggregation.aggregate);
        if (mQueryOptions.$filter && (bHasGrandTotal && !oAggregation["grandTotal like 1.84"] || bHasGroupLevels)) {
            throw new Error("Unsupported system query option: $filter");
        }
        if (mQueryOptions.$search && (bHasGrandTotal || bHasGroupLevels)) {
            throw new Error("Unsupported system query option: $search");
        }
        if (bHasMinOrMax) {
            if (bHasGrandTotal) {
                throw new Error("Unsupported grand totals together with min/max");
            }
            if (bHasGroupLevels) {
                throw new Error("Unsupported group levels together with min/max");
            }
        }
        if (bHasGrandTotal || bHasGroupLevels || bHasMinOrMax) {
            if ("$expand" in mQueryOptions) {
                throw new Error("Unsupported system query option: $expand");
            }
            if ("$select" in mQueryOptions) {
                throw new Error("Unsupported system query option: $select");
            }
            return bHasMinOrMax ? _MinMaxHelper.createCache(oRequestor, sResourcePath, oAggregation, mQueryOptions) : new _AggregationCache(oRequestor, sResourcePath, oAggregation, mQueryOptions, bHasGrandTotal);
        }
    }
    if (mQueryOptions.$$filterBeforeAggregate) {
        mQueryOptions.$apply = "filter(" + mQueryOptions.$$filterBeforeAggregate + ")/" + mQueryOptions.$apply;
        delete mQueryOptions.$$filterBeforeAggregate;
    }
    return _Cache.create(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, sDeepResourcePath, bSharedRequest);
};