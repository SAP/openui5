import _Helper from "./_Helper";
import _Parser from "./_Parser";
import Filter from "sap/ui/model/Filter";
var mAggregationType = {
    aggregate: {
        "*": {
            grandTotal: "boolean",
            max: "boolean",
            min: "boolean",
            name: "string",
            subtotals: "boolean",
            unit: "string",
            "with": "string"
        }
    },
    "grandTotal like 1.84": "boolean",
    grandTotalAtBottomOnly: "boolean",
    group: {
        "*": {
            additionally: ["string"]
        }
    },
    groupLevels: ["string"],
    search: "string",
    subtotalsAtBottomOnly: "boolean"
}, rComma = /,|%2C|%2c/, rOrderbyItem = new RegExp("^(" + _Parser.sODataIdentifier + "(?:/" + _Parser.sODataIdentifier + ")*" + ")(?:" + _Parser.sWhitespace + "+(?:asc|desc))?$"), _AggregationHelper;
function aggregate(oAggregation, aGroupBy, aAggregate, bGrandTotalLike184, sAlias, i, aAliases) {
    var oDetails = oAggregation.aggregate[sAlias], sAggregate = oDetails.name || sAlias, sUnit = oDetails.unit, sWith = oDetails.with;
    if (bGrandTotalLike184) {
        if (sWith === "average" || sWith === "countdistinct") {
            throw new Error("Cannot aggregate totals with '" + sWith + "'");
        }
        sAggregate = sAlias;
        sAlias = "UI5grand__" + sAlias;
    }
    if (sWith) {
        sAggregate += " with " + sWith + " as " + sAlias;
    }
    else if (oDetails.name) {
        sAggregate += " as " + sAlias;
    }
    aAggregate.push(sAggregate);
    if (sUnit && aAggregate.indexOf(sUnit) < 0 && aAliases.indexOf(sUnit, i + 1) < 0 && aGroupBy.indexOf(sUnit) < 0) {
        aAggregate.push(sUnit);
    }
}
function skipTop(mQueryOptions) {
    var aTransformations = [];
    if (mQueryOptions.$skip) {
        aTransformations.push("skip(" + mQueryOptions.$skip + ")");
    }
    delete mQueryOptions.$skip;
    if (mQueryOptions.$top < Infinity) {
        aTransformations.push("top(" + mQueryOptions.$top + ")");
    }
    delete mQueryOptions.$top;
    return aTransformations.join("/");
}
_AggregationHelper = {
    buildApply: function (oAggregation, mQueryOptions, iLevel, bFollowUp, mAlias2MeasureAndMethod) {
        var aAliases, sApply = "", aGrandTotalAggregate = [], bGrandTotalLike184 = oAggregation["grandTotal like 1.84"], aGroupBy, bIsLeafLevel, sLeaves, aMinMaxAggregate = [], sSkipTop, aSubtotalsAggregate = [];
        function processMinOrMax(sName, sMinOrMax) {
            var sAlias, oDetails = oAggregation.aggregate[sName];
            if (oDetails[sMinOrMax]) {
                sAlias = "UI5" + sMinOrMax + "__" + sName;
                aMinMaxAggregate.push(sName + " with " + sMinOrMax + " as " + sAlias);
                if (mAlias2MeasureAndMethod) {
                    mAlias2MeasureAndMethod[sAlias] = {
                        measure: sName,
                        method: sMinOrMax
                    };
                }
            }
        }
        mQueryOptions = Object.assign({}, mQueryOptions);
        _AggregationHelper.checkTypeof(oAggregation, mAggregationType, "$$aggregation");
        oAggregation.groupLevels = oAggregation.groupLevels || [];
        bIsLeafLevel = !iLevel || iLevel > oAggregation.groupLevels.length;
        oAggregation.group = oAggregation.group || {};
        oAggregation.groupLevels.forEach(function (sGroup) {
            oAggregation.group[sGroup] = oAggregation.group[sGroup] || {};
        });
        aGroupBy = bIsLeafLevel ? Object.keys(oAggregation.group).sort().filter(function (sGroup) {
            return oAggregation.groupLevels.indexOf(sGroup) < 0;
        }) : [oAggregation.groupLevels[iLevel - 1]];
        if (!iLevel) {
            aGroupBy = oAggregation.groupLevels.concat(aGroupBy);
        }
        oAggregation.aggregate = oAggregation.aggregate || {};
        aAliases = Object.keys(oAggregation.aggregate).sort();
        if (iLevel === 1 && !bFollowUp) {
            aAliases.filter(function (sAlias) {
                return oAggregation.aggregate[sAlias].grandTotal;
            }).forEach(aggregate.bind(null, oAggregation, [], aGrandTotalAggregate, bGrandTotalLike184));
        }
        if (!bFollowUp) {
            aAliases.forEach(function (sAlias) {
                processMinOrMax(sAlias, "min");
                processMinOrMax(sAlias, "max");
            });
        }
        aAliases.filter(function (sAlias) {
            return bIsLeafLevel || oAggregation.aggregate[sAlias].subtotals;
        }).forEach(aggregate.bind(null, oAggregation, aGroupBy, aSubtotalsAggregate, false));
        if (aSubtotalsAggregate.length) {
            sApply = "aggregate(" + aSubtotalsAggregate.join(",") + ")";
        }
        if (aGroupBy.length) {
            aGroupBy.forEach(function (sGroup) {
                var aAdditionally = oAggregation.group[sGroup].additionally;
                if (aAdditionally) {
                    aGroupBy.push.apply(aGroupBy, aAdditionally);
                }
            });
            sApply = "groupby((" + aGroupBy.join(",") + (sApply ? ")," + sApply + ")" : "))");
        }
        if (bFollowUp) {
            delete mQueryOptions.$count;
        }
        else if (mQueryOptions.$count) {
            aMinMaxAggregate.push("$count as UI5__count");
            delete mQueryOptions.$count;
        }
        if (mQueryOptions.$filter) {
            sApply += "/filter(" + mQueryOptions.$filter + ")";
            delete mQueryOptions.$filter;
        }
        if (mQueryOptions.$orderby) {
            sApply += "/orderby(" + mQueryOptions.$orderby + ")";
            delete mQueryOptions.$orderby;
        }
        sSkipTop = skipTop(mQueryOptions);
        if (bGrandTotalLike184 && aGrandTotalAggregate.length) {
            if (oAggregation.groupLevels.length) {
                throw new Error("Cannot combine visual grouping with grand total");
            }
            sApply += "/concat(aggregate(" + aGrandTotalAggregate.join(",") + "),aggregate(" + aMinMaxAggregate.join(",") + ")," + (sSkipTop || "identity") + ")";
        }
        else {
            if (aMinMaxAggregate.length) {
                sApply += "/concat(aggregate(" + aMinMaxAggregate.join(",") + ")," + (sSkipTop || "identity") + ")";
            }
            else if (sSkipTop) {
                sApply += "/" + sSkipTop;
            }
            if (iLevel === 1 && mQueryOptions.$$leaves && !bFollowUp) {
                sLeaves = "groupby((" + Object.keys(oAggregation.group).sort().join(",") + "))/aggregate($count as UI5__leaves)";
            }
            delete mQueryOptions.$$leaves;
            if (aGrandTotalAggregate.length) {
                sApply = "concat(" + (sLeaves ? sLeaves + "," : "") + "aggregate(" + aGrandTotalAggregate.join(",") + ")," + sApply + ")";
            }
            else if (sLeaves) {
                sApply = "concat(" + sLeaves + "," + sApply + ")";
            }
        }
        if (oAggregation.search) {
            sApply = "search(" + oAggregation.search + ")/" + sApply;
        }
        if (mQueryOptions.$$filterBeforeAggregate) {
            sApply = "filter(" + mQueryOptions.$$filterBeforeAggregate + ")/" + sApply;
            delete mQueryOptions.$$filterBeforeAggregate;
        }
        if (sApply) {
            mQueryOptions.$apply = sApply;
        }
        return mQueryOptions;
    },
    checkTypeof: function (vValue, vType, sPath) {
        if (Array.isArray(vType)) {
            if (!Array.isArray(vValue)) {
                throw new Error("Not an array value for '" + sPath + "'");
            }
            vValue.forEach(function (vElement, i) {
                _AggregationHelper.checkTypeof(vElement, vType[0], sPath + "/" + i);
            });
        }
        else if (typeof vType === "object") {
            var bIsMap = "*" in vType;
            if (typeof vValue !== "object" || !vValue || Array.isArray(vValue)) {
                throw new Error("Not an object value for '" + sPath + "'");
            }
            Object.keys(vValue).forEach(function (sKey) {
                if (!bIsMap && !(sKey in vType)) {
                    throw new Error("Unsupported property: '" + sPath + "/" + sKey + "'");
                }
                _AggregationHelper.checkTypeof(vValue[sKey], vType[bIsMap ? "*" : sKey], sPath + "/" + sKey);
            });
        }
        else if (typeof vValue !== vType) {
            throw new Error("Not a " + vType + " value for '" + sPath + "'");
        }
    },
    createPlaceholder: function (iLevel, iIndex, oParentCache) {
        var oPlaceholder = { "@$ui5.node.level": iLevel };
        _Helper.setPrivateAnnotation(oPlaceholder, "index", iIndex);
        _Helper.setPrivateAnnotation(oPlaceholder, "parent", oParentCache);
        return oPlaceholder;
    },
    extractSubtotals: function (oAggregation, oGroupNode, oCollapsed, oExpanded) {
        var iLevel = oGroupNode["@$ui5.node.level"];
        Object.keys(oAggregation.aggregate).forEach(function (sAlias) {
            var oDetails = oAggregation.aggregate[sAlias], iIndex, sUnit = oDetails.unit;
            if (!oDetails.subtotals) {
                return;
            }
            oCollapsed[sAlias] = oGroupNode[sAlias];
            if (oExpanded) {
                oExpanded[sAlias] = null;
            }
            if (sUnit) {
                oCollapsed[sUnit] = oGroupNode[sUnit];
                if (oExpanded) {
                    iIndex = oAggregation.groupLevels.indexOf(sUnit);
                    if (iIndex < 0 || iIndex >= iLevel) {
                        oExpanded[sUnit] = null;
                    }
                }
            }
        });
    },
    filterOrderby: function (mQueryOptions, oAggregation, iLevel) {
        var sFilteredOrderby = _AggregationHelper.getFilteredOrderby(mQueryOptions.$orderby, oAggregation, iLevel);
        mQueryOptions = Object.assign({}, mQueryOptions);
        if (sFilteredOrderby) {
            mQueryOptions.$orderby = sFilteredOrderby;
        }
        else {
            delete mQueryOptions.$orderby;
        }
        return mQueryOptions;
    },
    getAllProperties: function (oAggregation) {
        var aAggregates = Object.keys(oAggregation.aggregate), aGroups = Object.keys(oAggregation.group), aAllProperties = aAggregates.concat(aGroups);
        aAggregates.forEach(function (sAlias) {
            var sUnit = oAggregation.aggregate[sAlias].unit;
            if (sUnit) {
                aAllProperties.push(sUnit);
            }
        });
        aGroups.forEach(function (sGroup) {
            var aAdditionally = oAggregation.group[sGroup].additionally;
            if (aAdditionally) {
                aAdditionally.forEach(function (sAdditionally) {
                    aAllProperties.push(sAdditionally.includes("/") ? sAdditionally.split("/") : sAdditionally);
                });
            }
        });
        return aAllProperties;
    },
    getFilteredOrderby: function (sOrderby, oAggregation, iLevel) {
        var bIsLeaf = !iLevel || iLevel > oAggregation.groupLevels.length;
        function isUnitForSubtotals(sName) {
            return Object.keys(oAggregation.aggregate).some(function (sAlias) {
                var oDetails = oAggregation.aggregate[sAlias];
                return oDetails.subtotals && sName === oDetails.unit;
            });
        }
        function isUsedAtLeaf(sName) {
            if (sName in oAggregation.group && (!iLevel || oAggregation.groupLevels.indexOf(sName) < 0)) {
                return true;
            }
            return Object.keys(oAggregation.aggregate).some(function (sAlias) {
                return sName === oAggregation.aggregate[sAlias].unit;
            }) || Object.keys(oAggregation.group).some(function (sGroup) {
                return (!iLevel || oAggregation.groupLevels.indexOf(sGroup) < 0) && isUsedFor(sName, sGroup);
            });
        }
        function isUsedFor(sName, sGroup) {
            return sName === sGroup || oAggregation.group[sGroup].additionally && oAggregation.group[sGroup].additionally.indexOf(sName) >= 0;
        }
        if (sOrderby) {
            return sOrderby.split(rComma).filter(function (sOrderbyItem) {
                var aMatches = rOrderbyItem.exec(sOrderbyItem), sName;
                if (aMatches) {
                    sName = aMatches[1];
                    return sName in oAggregation.aggregate && (bIsLeaf || oAggregation.aggregate[sName].subtotals) || bIsLeaf && isUsedAtLeaf(sName) || !bIsLeaf && (isUsedFor(sName, oAggregation.groupLevels[iLevel - 1]) || isUnitForSubtotals(sName));
                }
                return true;
            }).join(",");
        }
    },
    getOrCreateExpandedObject: function (oAggregation, oGroupNode) {
        var oCollapsed, oExpanded = _Helper.getPrivateAnnotation(oGroupNode, "expanded");
        if (!oExpanded) {
            oCollapsed = { "@$ui5.node.isExpanded": false };
            _Helper.setPrivateAnnotation(oGroupNode, "collapsed", oCollapsed);
            oExpanded = { "@$ui5.node.isExpanded": true };
            _Helper.setPrivateAnnotation(oGroupNode, "expanded", oExpanded);
            if (oAggregation.subtotalsAtBottomOnly !== undefined) {
                _AggregationHelper.extractSubtotals(oAggregation, oGroupNode, oCollapsed, oAggregation.subtotalsAtBottomOnly ? oExpanded : null);
            }
        }
        return oExpanded;
    },
    hasGrandTotal: function (mAggregate) {
        return Object.keys(mAggregate).some(function (sAlias) {
            return mAggregate[sAlias].grandTotal;
        });
    },
    hasMinOrMax: function (mAggregate) {
        return Object.keys(mAggregate).some(function (sAlias) {
            var oDetails = mAggregate[sAlias];
            return oDetails.min || oDetails.max;
        });
    },
    isAffected: function (oAggregation, aFilters, aSideEffectPaths) {
        function affects(sSideEffectPath, sPropertyPath) {
            if (sSideEffectPath.endsWith("/*")) {
                sSideEffectPath = sSideEffectPath.slice(0, -2);
            }
            return _Helper.hasPathPrefix(sPropertyPath, sSideEffectPath) || _Helper.hasPathPrefix(sSideEffectPath, sPropertyPath);
        }
        function hasAffectedFilter(sSideEffectPath, aFilters0) {
            return aFilters0.some(function (oFilter) {
                return oFilter.aFilters ? hasAffectedFilter(sSideEffectPath, oFilter.aFilters) : affects(sSideEffectPath, oFilter.sPath);
            });
        }
        return aSideEffectPaths.some(function (sSideEffectPath) {
            var fnAffects = affects.bind(null, sSideEffectPath);
            return sSideEffectPath === "" || sSideEffectPath === "*" || Object.keys(oAggregation.aggregate).some(function (sAlias) {
                var oDetails = oAggregation.aggregate[sAlias];
                return affects(sSideEffectPath, oDetails.name || sAlias);
            }) || Object.keys(oAggregation.group).some(fnAffects) || oAggregation.groupLevels.some(fnAffects) || hasAffectedFilter(sSideEffectPath, aFilters);
        });
    },
    removeUI5grand__: function (oGrandTotal) {
        Object.keys(oGrandTotal).forEach(function (sKey) {
            if (sKey.startsWith("UI5grand__")) {
                oGrandTotal[sKey.slice(10)] = oGrandTotal[sKey];
                delete oGrandTotal[sKey];
            }
        });
    },
    setAnnotations: function (oElement, bIsExpanded, bIsTotal, iLevel, aAllProperties) {
        oElement["@$ui5.node.isExpanded"] = bIsExpanded;
        oElement["@$ui5.node.isTotal"] = bIsTotal;
        oElement["@$ui5.node.level"] = iLevel;
        if (aAllProperties) {
            aAllProperties.forEach(function (vProperty) {
                if (Array.isArray(vProperty)) {
                    _Helper.createMissing(oElement, vProperty);
                }
                else if (!(vProperty in oElement)) {
                    oElement[vProperty] = null;
                }
            });
        }
    },
    splitFilter: function (oFilter, oAggregation) {
        var aFiltersAfterAggregate = [], aFiltersBeforeAggregate = [];
        function isAfter(oFilter) {
            return oFilter.aFilters ? oFilter.aFilters.some(isAfter) : oFilter.sPath in oAggregation.aggregate;
        }
        function split(oFilter) {
            if (oFilter.aFilters && oFilter.bAnd) {
                oFilter.aFilters.forEach(split);
            }
            else {
                (isAfter(oFilter) ? aFiltersAfterAggregate : aFiltersBeforeAggregate).push(oFilter);
            }
        }
        function wrap(aFilters) {
            return aFilters.length > 1 ? new Filter(aFilters, true) : aFilters[0];
        }
        if (!oAggregation || !oAggregation.aggregate) {
            return [oFilter];
        }
        split(oFilter);
        return [wrap(aFiltersAfterAggregate), wrap(aFiltersBeforeAggregate)];
    }
};