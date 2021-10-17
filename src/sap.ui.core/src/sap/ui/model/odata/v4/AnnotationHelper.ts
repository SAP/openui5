import Expression from "./_AnnotationHelperExpression";
var rBadChars = /[\\{}:]/, rCount = /\/\$count$/, rPaths = /\$(?:(?:Annotation)|(?:(?:Navigation)?Property))?Path/, rSplitPathSegment = /^(.+?\/(\$(?:Annotation)?Path))(\/?)(.*)$/, rUnsupportedPathSegments = /\$(?:Navigation)?PropertyPath/, AnnotationHelper = {
    format: function (vRawValue, oDetails) {
        var aMatches, oModel = oDetails.context.getModel(), sPath = oDetails.context.getPath();
        function getExpression(sPrefix) {
            if (sPath.endsWith("/")) {
                sPath = sPath.slice(0, -1);
            }
            return Expression.getExpression({
                asExpression: false,
                complexBinding: true,
                formatOptions: oDetails.arguments && oDetails.arguments[1],
                ignoreAsPrefix: oDetails.overload && oDetails.overload.$IsBound && !sPath.includes("/$Parameter/") ? oDetails.overload.$Parameter[0].$Name + "/" : "",
                model: oModel,
                parameters: oDetails.arguments && oDetails.arguments[0],
                path: sPath,
                prefix: sPrefix,
                value: vRawValue,
                $$valueAsPromise: true
            });
        }
        if (sPath.endsWith("/$Path")) {
            sPath = sPath.slice(0, -6);
            vRawValue = { $Path: vRawValue };
        }
        else if (sPath.endsWith("/$PropertyPath")) {
            sPath = sPath.slice(0, -14);
            vRawValue = { $PropertyPath: vRawValue };
        }
        aMatches = rUnsupportedPathSegments.exec(sPath);
        if (aMatches) {
            throw new Error("Unsupported path segment " + aMatches[0] + " in " + sPath);
        }
        aMatches = rSplitPathSegment.exec(sPath);
        if (aMatches && sPath.length > aMatches[1].length) {
            if (rSplitPathSegment.test(aMatches[4])) {
                throw new Error("Only one $Path or $AnnotationPath segment is supported: " + sPath);
            }
            return oModel.fetchObject(aMatches[1]).then(function (sPathValue) {
                var bIsAnnotationPath = aMatches[2] === "$AnnotationPath", sPrefix = bIsAnnotationPath ? sPathValue.split("@")[0] : sPathValue, i;
                if (!bIsAnnotationPath && aMatches[3]) {
                    sPrefix = sPrefix + "/";
                }
                else if (!sPrefix.endsWith("/")) {
                    i = sPrefix.lastIndexOf("/");
                    sPrefix = i < 0 ? "" : sPrefix.slice(0, i + 1);
                }
                return getExpression(sPrefix);
            });
        }
        return getExpression("");
    },
    getNavigationBinding: function (sPath) {
        sPath = AnnotationHelper.getNavigationPath(sPath);
        if (rBadChars.test(sPath)) {
            throw new Error("Invalid OData identifier: " + sPath);
        }
        return sPath ? "{" + sPath + "}" : sPath;
    },
    getNavigationPath: function (sPath) {
        var iIndexOfAt;
        if (!sPath || sPath[0] === "@") {
            return "";
        }
        if (rCount.test(sPath)) {
            return sPath.slice(0, -7);
        }
        iIndexOfAt = sPath.indexOf("@");
        if (iIndexOfAt > -1) {
            sPath = sPath.slice(0, iIndexOfAt);
        }
        if (sPath[sPath.length - 1] === "/") {
            sPath = sPath.slice(0, -1);
        }
        if (sPath.includes(".")) {
            sPath = sPath.split("/").filter(function (sSegment) {
                return !sSegment.includes(".");
            }).join("/");
        }
        return sPath;
    },
    getValueListType: function (vRawValue, oDetails) {
        var sPath = typeof vRawValue === "string" ? "/" + oDetails.schemaChildName + "/" + vRawValue : oDetails.context.getPath();
        return oDetails.$$valueAsPromise ? oDetails.context.getModel().fetchValueListType(sPath).unwrap() : oDetails.context.getModel().getValueListType(sPath);
    },
    isMultiple: function (sPath, oDetails) {
        var iIndexOfAt;
        function isTrue(vValue) {
            return vValue === true;
        }
        if (!sPath || sPath[0] === "@") {
            return false;
        }
        if (rCount.test(sPath)) {
            return true;
        }
        iIndexOfAt = sPath.indexOf("@");
        if (iIndexOfAt > -1) {
            sPath = sPath.slice(0, iIndexOfAt);
        }
        if (sPath[sPath.length - 1] !== "/") {
            sPath += "/";
        }
        sPath = "/" + oDetails.schemaChildName + "/" + sPath + "$isCollection";
        return oDetails.$$valueAsPromise ? oDetails.context.getModel().fetchObject(sPath).then(isTrue).unwrap() : oDetails.context.getObject(sPath) === true;
    },
    label: function (vRawValue, oDetails) {
        var oNewContext;
        if (vRawValue.Label) {
            return AnnotationHelper.value(vRawValue.Label, {
                context: oDetails.context.getModel().createBindingContext("Label", oDetails.context)
            });
        }
        if (vRawValue.Value && vRawValue.Value.$Path) {
            oNewContext = oDetails.context.getModel().createBindingContext("Value/$Path@com.sap.vocabularies.Common.v1.Label", oDetails.context);
            if (oDetails.$$valueAsPromise) {
                return oNewContext.getModel().fetchObject("", oNewContext).then(function (oRawValue0) {
                    return AnnotationHelper.value(oRawValue0, {
                        context: oNewContext
                    });
                }).unwrap();
            }
            return AnnotationHelper.value(oNewContext.getObject(""), {
                context: oNewContext
            });
        }
    },
    resolve$Path: function (oContext) {
        var iEndOfPath, iIndexOfAt, iIndexOfPath, iLastIndexOfSlash, aMatches, sPath = oContext.getPath(), sPrefix, vValue;
        for (;;) {
            aMatches = sPath.match(rPaths);
            if (!aMatches) {
                return sPath;
            }
            iIndexOfPath = aMatches.index;
            iEndOfPath = iIndexOfPath + aMatches[0].length;
            sPrefix = sPath.slice(0, iEndOfPath);
            vValue = oContext.getModel().getObject(sPrefix);
            if (typeof vValue !== "string") {
                throw new Error("Cannot resolve " + sPrefix + " due to unexpected value " + vValue);
            }
            sPrefix = sPath.slice(0, iIndexOfPath);
            iIndexOfAt = sPrefix.indexOf("@");
            iLastIndexOfSlash = sPrefix.lastIndexOf("/", iIndexOfAt);
            if (iLastIndexOfSlash === 0) {
                sPrefix = sPrefix.slice(0, iIndexOfAt);
                if (iIndexOfAt > 1 && vValue) {
                    sPrefix += "/";
                }
            }
            else {
                sPrefix = sPrefix.slice(0, iLastIndexOfSlash + 1);
            }
            sPath = sPrefix + vValue + sPath.slice(iEndOfPath);
        }
    },
    value: function (vRawValue, oDetails) {
        var sPath = oDetails.context.getPath();
        if (sPath.endsWith("/")) {
            sPath = sPath.slice(0, -1);
        }
        else if (sPath.endsWith("/$Path")) {
            sPath = sPath.slice(0, -6);
            vRawValue = { $Path: vRawValue };
        }
        else if (sPath.endsWith("/$PropertyPath")) {
            sPath = sPath.slice(0, -14);
            vRawValue = { $PropertyPath: vRawValue };
        }
        return Expression.getExpression({
            asExpression: false,
            complexBinding: false,
            ignoreAsPrefix: oDetails.overload && oDetails.overload.$IsBound && !sPath.includes("/$Parameter/") ? oDetails.overload.$Parameter[0].$Name + "/" : "",
            model: oDetails.context.getModel(),
            parameters: oDetails.arguments && oDetails.arguments[0],
            path: sPath,
            prefix: "",
            value: vRawValue,
            $$valueAsPromise: oDetails.$$valueAsPromise
        });
    }
};