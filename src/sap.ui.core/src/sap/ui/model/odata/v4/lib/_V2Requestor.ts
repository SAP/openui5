import _Helper from "./_Helper";
import _Parser from "./_Parser";
import CalendarType from "sap/ui/core/CalendarType";
import DateFormat from "sap/ui/core/format/DateFormat";
import ODataUtils from "sap/ui/model/odata/ODataUtils";
var rDate = /^\/Date\((-?\d+)\)\/$/, oDateFormatter, rDateTimeOffset = /^\/Date\((-?\d+)(?:([-+])(\d\d)(\d\d))?\)\/$/, oDateTimeOffsetFormatter, mPattern2Formatter = {}, rPlus = /\+/g, rSegmentWithPredicate = /^([^(]+)(\(.+\))$/, rSlash = /\//g, rTime = /^PT(?:(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(\.\d+)?S)?)$/i, oTimeFormatter;
function _V2Requestor() { }
_V2Requestor.prototype.mFinalHeaders = {
    "Content-Type": "application/json;charset=UTF-8"
};
_V2Requestor.prototype.mPredefinedPartHeaders = {
    "Accept": "application/json"
};
_V2Requestor.prototype.mPredefinedRequestHeaders = {
    "Accept": "application/json",
    "MaxDataServiceVersion": "2.0",
    "DataServiceVersion": "2.0",
    "X-CSRF-Token": "Fetch"
};
_V2Requestor.prototype.mReservedHeaders = {
    accept: true,
    "content-id": true,
    "content-transfer-encoding": true,
    "content-type": true,
    dataserviceversion: true,
    "if-match": true,
    "if-none-match": true,
    maxdataserviceversion: true,
    "sap-contextid": true,
    "x-http-method": true
};
_V2Requestor.prototype.convertBinary = function (sV2Value) {
    return sV2Value.replace(rPlus, "-").replace(rSlash, "_");
};
_V2Requestor.prototype.convertDate = function (sV2Value) {
    var oDate, aMatches = rDate.exec(sV2Value);
    if (!aMatches) {
        throw new Error("Not a valid Edm.DateTime value '" + sV2Value + "'");
    }
    oDate = new Date(parseInt(aMatches[1]));
    if (Number(aMatches[1] % (24 * 60 * 60 * 1000)) !== 0) {
        throw new Error("Cannot convert Edm.DateTime value '" + sV2Value + "' to Edm.Date because it contains a time of day");
    }
    return oDateFormatter.format(oDate);
};
_V2Requestor.prototype.convertDateTimeOffset = function (sV2Value, oPropertyMetadata) {
    var aMatches = rDateTimeOffset.exec(sV2Value), sOffset, iOffsetHours, iOffsetMinutes, iOffsetSign, sPattern = "yyyy-MM-dd'T'HH:mm:ss", iPrecision = oPropertyMetadata.$Precision, iTicks;
    if (!aMatches) {
        throw new Error("Not a valid Edm.DateTimeOffset value '" + sV2Value + "'");
    }
    iTicks = parseInt(aMatches[1]);
    iOffsetHours = parseInt(aMatches[3]);
    iOffsetMinutes = parseInt(aMatches[4]);
    if (!aMatches[2] || iOffsetHours === 0 && iOffsetMinutes === 0) {
        sOffset = "Z";
    }
    else {
        iOffsetSign = aMatches[2] === "-" ? -1 : 1;
        iTicks += iOffsetSign * (iOffsetHours * 60 * 60 * 1000 + iOffsetMinutes * 60 * 1000);
        sOffset = aMatches[2] + aMatches[3] + ":" + aMatches[4];
    }
    if (iPrecision > 0) {
        sPattern += "." + "".padEnd(iPrecision, "S");
    }
    if (!mPattern2Formatter[sPattern]) {
        mPattern2Formatter[sPattern] = DateFormat.getDateTimeInstance({
            calendarType: CalendarType.Gregorian,
            pattern: sPattern,
            UTC: true
        });
    }
    return mPattern2Formatter[sPattern].format(new Date(iTicks)) + sOffset;
};
_V2Requestor.prototype.convertDoubleSingle = function (sV2Value) {
    switch (sV2Value) {
        case "NaN":
        case "INF":
        case "-INF": return sV2Value;
        default: return parseFloat(sV2Value);
    }
};
_V2Requestor.prototype.convertFilter = function (sFilter, sMetaPath) {
    var oFilterTree = _Parser.parseFilter(sFilter), that = this;
    function convertLiteral(oLiteral, oOtherOperand) {
        var vModelValue, oTypeInfo = getType(oOtherOperand);
        if (oTypeInfo.$Type !== "Edm.String") {
            vModelValue = _Helper.parseLiteral(oLiteral.value, oTypeInfo.$Type, oTypeInfo.path);
            oLiteral.value = that.formatPropertyAsLiteral(vModelValue, oTypeInfo);
        }
    }
    function error(oNode, sMessage) {
        throw new Error("Cannot convert filter to V2, " + sMessage + " at " + oNode.at + ": " + sFilter);
    }
    function getType(oNode) {
        var oPropertyMetadata;
        if (oNode.type) {
            return {
                $Type: oNode.type
            };
        }
        if (oNode.id === "PATH") {
            oPropertyMetadata = that.oModelInterface.fetchMetadata(sMetaPath + "/" + oNode.value).getResult();
            if (!oPropertyMetadata) {
                throw new Error("Invalid filter path: " + oNode.value);
            }
            return {
                path: oNode.value,
                $Type: oPropertyMetadata.$Type,
                $v2Type: oPropertyMetadata.$v2Type
            };
        }
        return getType(oNode.parameters[0]);
    }
    function visitNode(oNode) {
        if (oNode) {
            if (oNode.id === "VALUE" && oNode.ambiguous) {
                error(oNode, "ambiguous type for the literal");
            }
            visitNode(oNode.left);
            visitNode(oNode.right);
            if (oNode.parameters) {
                if (oNode.value === "contains") {
                    oNode.value = "substringof";
                    oNode.parameters.push(oNode.parameters.shift());
                }
                oNode.parameters.forEach(visitNode);
            }
            if (oNode.left && oNode.right) {
                if (oNode.left.id === "VALUE") {
                    if (oNode.right.id === "VALUE") {
                        error(oNode, "saw literals on both sides of '" + oNode.id + "'");
                    }
                    convertLiteral(oNode.left, oNode.right);
                }
                else if (oNode.right.id === "VALUE") {
                    convertLiteral(oNode.right, oNode.left);
                }
            }
        }
    }
    visitNode(oFilterTree);
    return _Parser.buildFilterString(oFilterTree);
};
_V2Requestor.prototype.convertKeyPredicate = function (sV4KeyPredicate, sPath) {
    var oEntityType = this.fetchTypeForPath(_Helper.getMetaPath(sPath)).getResult(), mKeyToValue = _Parser.parseKeyPredicate(decodeURIComponent(sV4KeyPredicate)), that = this;
    function convertLiteral(sPropertyName, sValue) {
        var oPropertyMetadata = oEntityType[sPropertyName];
        if (oPropertyMetadata.$Type !== "Edm.String") {
            sValue = that.formatPropertyAsLiteral(_Helper.parseLiteral(sValue, oPropertyMetadata.$Type, sPath), oPropertyMetadata);
        }
        return encodeURIComponent(sValue);
    }
    if ("" in mKeyToValue) {
        return "(" + convertLiteral(oEntityType.$Key[0], mKeyToValue[""]) + ")";
    }
    return "(" + oEntityType.$Key.map(function (sPropertyName) {
        return encodeURIComponent(sPropertyName) + "=" + convertLiteral(sPropertyName, mKeyToValue[sPropertyName]);
    }).join(",") + ")";
};
_V2Requestor.prototype.convertResourcePath = function (sResourcePath) {
    var iIndex = sResourcePath.indexOf("?"), sQueryString = "", aSegments, iSubPathLength = -1, that = this;
    if (iIndex > 0) {
        sQueryString = sResourcePath.slice(iIndex);
        sResourcePath = sResourcePath.slice(0, iIndex);
    }
    aSegments = sResourcePath.split("/");
    return aSegments.map(function (sSegment) {
        var aMatches = rSegmentWithPredicate.exec(sSegment);
        iSubPathLength += sSegment.length + 1;
        if (aMatches) {
            sSegment = aMatches[1] + that.convertKeyPredicate(aMatches[2], "/" + sResourcePath.slice(0, iSubPathLength));
        }
        return sSegment;
    }).join("/") + sQueryString;
};
_V2Requestor.prototype.convertTimeOfDay = function (sV2Value) {
    var oDate, aMatches = rTime.exec(sV2Value), iTicks;
    if (!aMatches) {
        throw new Error("Not a valid Edm.Time value '" + sV2Value + "'");
    }
    iTicks = Date.UTC(1970, 0, 1, aMatches[1] || 0, aMatches[2] || 0, aMatches[3] || 0);
    oDate = new Date(iTicks);
    return oTimeFormatter.format(oDate) + (aMatches[4] || "");
};
_V2Requestor.prototype.convertNonPrimitive = function (oObject) {
    var sPropertyName, oType, sTypeName, vValue, that = this;
    if (Array.isArray(oObject.results)) {
        oObject.results.forEach(function (oItem) {
            that.convertNonPrimitive(oItem);
        });
        return oObject.results;
    }
    if (!oObject.__metadata || !oObject.__metadata.type) {
        throw new Error("Cannot convert structured value without type information in " + "__metadata.type: " + JSON.stringify(oObject));
    }
    sTypeName = oObject.__metadata.type;
    oType = that.getTypeForName(sTypeName);
    delete oObject.__metadata;
    for (sPropertyName in oObject) {
        vValue = oObject[sPropertyName];
        if (vValue === null) {
            continue;
        }
        if (typeof vValue === "object") {
            if (vValue.__deferred) {
                delete oObject[sPropertyName];
            }
            else {
                oObject[sPropertyName] = this.convertNonPrimitive(vValue);
            }
            continue;
        }
        oObject[sPropertyName] = this.convertPrimitive(vValue, oType[sPropertyName], sTypeName, sPropertyName);
    }
    return oObject;
};
_V2Requestor.prototype.convertPrimitive = function (vValue, oPropertyMetadata, sTypeName, sPropertyName) {
    switch (oPropertyMetadata && oPropertyMetadata.$Type) {
        case "Edm.Binary": return this.convertBinary(vValue);
        case "Edm.Date": return this.convertDate(vValue);
        case "Edm.DateTimeOffset": return this.convertDateTimeOffset(vValue, oPropertyMetadata);
        case "Edm.Boolean":
        case "Edm.Byte":
        case "Edm.Decimal":
        case "Edm.Guid":
        case "Edm.Int16":
        case "Edm.Int32":
        case "Edm.Int64":
        case "Edm.SByte":
        case "Edm.String": return vValue;
        case "Edm.Double":
        case "Edm.Single": return this.convertDoubleSingle(vValue);
        case "Edm.TimeOfDay": return this.convertTimeOfDay(vValue);
        default: throw new Error("Type '" + (oPropertyMetadata && oPropertyMetadata.$Type) + "' of property '" + sPropertyName + "' in type '" + sTypeName + "' is unknown; cannot convert value: " + vValue);
    }
};
_V2Requestor.prototype.doCheckVersionHeader = function (fnGetHeader, sResourcePath, _bVersionOptional) {
    var sDataServiceVersion = fnGetHeader("DataServiceVersion"), vODataVersion = !sDataServiceVersion && fnGetHeader("OData-Version");
    if (vODataVersion) {
        throw new Error("Expected 'DataServiceVersion' header with value '1.0' or '2.0' but " + "received 'OData-Version' header with value '" + vODataVersion + "' in response for " + this.sServiceUrl + sResourcePath);
    }
    if (!sDataServiceVersion) {
        return;
    }
    sDataServiceVersion = sDataServiceVersion.split(";")[0];
    if (sDataServiceVersion === "1.0" || sDataServiceVersion === "2.0") {
        return;
    }
    throw new Error("Expected 'DataServiceVersion' header with value '1.0' or '2.0' but " + "received value '" + sDataServiceVersion + "' in response for " + this.sServiceUrl + sResourcePath);
};
_V2Requestor.prototype.doConvertResponse = function (oResponsePayload, sMetaPath) {
    var oCandidate, bIsArray, aKeys, oPayload, oPropertyMetadata, that = this;
    oResponsePayload = oResponsePayload.d;
    bIsArray = Array.isArray(oResponsePayload.results);
    if (!bIsArray && !oResponsePayload.__metadata) {
        aKeys = Object.keys(oResponsePayload);
        oCandidate = oResponsePayload[aKeys[0]];
        if (aKeys.length === 1) {
            if (oCandidate === null) {
                return { value: null };
            }
            else if (typeof oCandidate !== "object") {
                return {
                    value: this.convertPrimitive(oCandidate, this.oModelInterface.fetchMetadata(sMetaPath).getResult(), sMetaPath, aKeys[0])
                };
            }
            else if (oCandidate.__metadata) {
                oResponsePayload = oCandidate;
            }
        }
    }
    if (bIsArray && !oResponsePayload.results.length) {
        oPayload = [];
    }
    else if (bIsArray && !oResponsePayload.results[0].__metadata) {
        oPropertyMetadata = this.oModelInterface.fetchMetadata(sMetaPath).getResult();
        oPayload = oResponsePayload.results.map(function (vValue) {
            return that.convertPrimitive(vValue, oPropertyMetadata, sMetaPath, "");
        });
    }
    else {
        oPayload = this.convertNonPrimitive(oResponsePayload);
    }
    if (bIsArray) {
        oPayload = { value: oPayload };
        if (oResponsePayload.__count) {
            oPayload["@odata.count"] = oResponsePayload.__count;
        }
        if (oResponsePayload.__next) {
            oPayload["@odata.nextLink"] = oResponsePayload.__next;
        }
    }
    return oPayload;
};
_V2Requestor.prototype.doConvertSystemQueryOptions = function (sMetaPath, mQueryOptions, fnResultHandler, bDropSystemQueryOptions, bSortExpandSelect) {
    var aSelects, mSelects = {}, that = this;
    function addSelects(vSelects, sExpandPath) {
        if (!Array.isArray(vSelects)) {
            vSelects = vSelects.split(",");
        }
        vSelects.forEach(function (sSelect) {
            var iIndex = sSelect.indexOf("/");
            if (iIndex >= 0 && !sSelect.includes(".")) {
                sSelect = sSelect.slice(0, iIndex);
            }
            mSelects[_Helper.buildPath(sExpandPath, sSelect)] = true;
        });
    }
    function convertExpand(aExpands, mExpandItem, sPathPrefix) {
        if (!mExpandItem || typeof mExpandItem !== "object") {
            throw new Error("$expand must be a valid object");
        }
        Object.keys(mExpandItem).forEach(function (sExpandPath) {
            var sAbsoluteExpandPath = _Helper.buildPath(sPathPrefix, sExpandPath), vExpandOptions = mExpandItem[sExpandPath];
            aExpands.push(sAbsoluteExpandPath);
            if (typeof vExpandOptions === "object") {
                Object.keys(vExpandOptions).forEach(function (sQueryOption) {
                    switch (sQueryOption) {
                        case "$expand":
                            convertExpand(aExpands, vExpandOptions.$expand, sAbsoluteExpandPath);
                            break;
                        case "$select":
                            addSelects(vExpandOptions.$select, sAbsoluteExpandPath);
                            break;
                        default: throw new Error("Unsupported query option in $expand: " + sQueryOption);
                    }
                });
            }
            if (!vExpandOptions.$select) {
                mSelects[sAbsoluteExpandPath + "/*"] = true;
            }
        });
        return aExpands;
    }
    Object.keys(mQueryOptions).forEach(function (sName) {
        var bIsSystemQueryOption = sName[0] === "$", vValue = mQueryOptions[sName];
        if (bDropSystemQueryOptions && bIsSystemQueryOption) {
            return;
        }
        switch (sName) {
            case "$count":
                sName = "$inlinecount";
                vValue = vValue ? "allpages" : "none";
                break;
            case "$expand":
                vValue = convertExpand([], vValue, "");
                vValue = (bSortExpandSelect ? vValue.sort() : vValue).join(",");
                break;
            case "$orderby":
            case "$search": break;
            case "$select":
                addSelects(vValue);
                return;
            case "$filter":
                vValue = that.convertFilter(vValue, sMetaPath);
                break;
            default: if (bIsSystemQueryOption) {
                throw new Error("Unsupported system query option: " + sName);
            }
        }
        fnResultHandler(sName, vValue);
    });
    aSelects = Object.keys(mSelects);
    if (aSelects.length > 0) {
        if (!mQueryOptions.$select) {
            aSelects.push("*");
        }
        fnResultHandler("$select", (bSortExpandSelect ? aSelects.sort() : aSelects).join(","));
    }
};
_V2Requestor.prototype.formatPropertyAsLiteral = function (vValue, oPropertyMetadata) {
    function parseAndCheck(oDateFormat, sValue) {
        var oDate = oDateFormat.parse(sValue);
        if (!oDate) {
            throw new Error("Not a valid " + oPropertyMetadata.$Type + " value: " + sValue);
        }
        return oDate;
    }
    if (vValue === null) {
        return "null";
    }
    switch (oPropertyMetadata.$Type) {
        case "Edm.Boolean":
        case "Edm.Byte":
        case "Edm.Decimal":
        case "Edm.Double":
        case "Edm.Guid":
        case "Edm.Int16":
        case "Edm.Int32":
        case "Edm.Int64":
        case "Edm.SByte":
        case "Edm.Single":
        case "Edm.String": break;
        case "Edm.Date":
            vValue = parseAndCheck(oDateFormatter, vValue);
            break;
        case "Edm.DateTimeOffset":
            vValue = parseAndCheck(oDateTimeOffsetFormatter, vValue);
            break;
        case "Edm.TimeOfDay":
            vValue = {
                __edmType: "Edm.Time",
                ms: parseAndCheck(oTimeFormatter, vValue).getTime()
            };
            break;
        default: throw new Error("Type '" + oPropertyMetadata.$Type + "' in the key predicate is not supported");
    }
    return ODataUtils.formatValue(vValue, oPropertyMetadata.$v2Type || oPropertyMetadata.$Type);
};
_V2Requestor.prototype.getPathAndAddQueryOptions = function (sPath, oOperationMetadata, mParameters, mQueryOptions, vEntity) {
    var sName, oTypeMetadata, that = this;
    sPath = sPath.slice(1, -5);
    if (oOperationMetadata.$IsBound) {
        sPath = sPath.slice(sPath.lastIndexOf(".") + 1);
        if (typeof vEntity === "function") {
            vEntity = vEntity();
        }
        oTypeMetadata = this.getTypeForName(oOperationMetadata.$Parameter[0].$Type);
        oTypeMetadata.$Key.forEach(function (sName) {
            mQueryOptions[sName] = that.formatPropertyAsLiteral(vEntity[sName], oTypeMetadata[sName]);
        });
    }
    if (oOperationMetadata.$Parameter) {
        oOperationMetadata.$Parameter.forEach(function (oParameter) {
            sName = oParameter.$Name;
            if (sName in mParameters) {
                if (oParameter.$isCollection) {
                    throw new Error("Unsupported collection-valued parameter: " + sName);
                }
                mQueryOptions[sName] = that.formatPropertyAsLiteral(mParameters[sName], oParameter);
                delete mParameters[sName];
            }
        });
    }
    for (sName in mParameters) {
        delete mParameters[sName];
    }
    if (oOperationMetadata.$v2HttpMethod) {
        mParameters["X-HTTP-Method"] = oOperationMetadata.$v2HttpMethod;
    }
    return sPath;
};
_V2Requestor.prototype.getTypeForName = function (sName) {
    var oType;
    this.mTypesByName = this.mTypesByName || {};
    oType = this.mTypesByName[sName];
    if (!oType) {
        oType = this.mTypesByName[sName] = this.oModelInterface.fetchMetadata("/" + sName).getResult();
    }
    return oType;
};
_V2Requestor.prototype.isActionBodyOptional = function () {
    return true;
};
_V2Requestor.prototype.isChangeSetOptional = function () {
    return false;
};
_V2Requestor.prototype.ready = function () {
    return this.oModelInterface.fetchEntityContainer().then(function () { });
};
function asV2Requestor(oRequestor) {
    Object.assign(oRequestor, _V2Requestor.prototype);
    oRequestor.oModelInterface.reportStateMessages = function () { };
    oRequestor.oModelInterface.reportTransitionMessages = function () { };
}
asV2Requestor._setDateTimeFormatter = function () {
    oDateFormatter = DateFormat.getDateInstance({
        calendarType: CalendarType.Gregorian,
        pattern: "yyyy-MM-dd",
        UTC: true
    });
    oDateTimeOffsetFormatter = DateFormat.getDateTimeInstance({
        calendarType: CalendarType.Gregorian,
        pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
    });
    oTimeFormatter = DateFormat.getTimeInstance({
        calendarType: CalendarType.Gregorian,
        pattern: "HH:mm:ss",
        UTC: true
    });
};
asV2Requestor._setDateTimeFormatter();