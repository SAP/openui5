import _Helper from "./_Helper";
import Log from "sap/base/Log";
import Measurement from "sap/ui/performance/Measurement";
var sClassName = "sap.ui.model.odata.v4.lib._MetadataConverter";
function _MetadataConverter() {
    this.aliases = {};
    this.oAnnotatable = null;
    this.entityContainer = null;
    this.entitySet = null;
    this.namespace = null;
    this.oOperation = null;
    this.reference = null;
    this.schema = null;
    this.type = null;
    this.result = null;
    this.url = null;
    this.xmlns = null;
}
_MetadataConverter.prototype.rCollection = /^Collection\((.*)\)$/;
_MetadataConverter.prototype.sEdmNamespace = "http://docs.oasis-open.org/odata/ns/edm";
_MetadataConverter.prototype.sEdmxNamespace = "http://docs.oasis-open.org/odata/ns/edmx";
_MetadataConverter.prototype.addToResult = function (sQualifiedName, vValue) {
    if (sQualifiedName in this.result) {
        Log.warning("Duplicate qualified name " + sQualifiedName, undefined, sClassName);
    }
    this.result[sQualifiedName] = vValue;
};
_MetadataConverter.prototype.annotatable = function (vTarget, sPrefix, sQualifier) {
    var oAnnotatable, oAnnotations, sPath;
    if (typeof vTarget === "string") {
        oAnnotatable = this.oAnnotatable;
        if (oAnnotatable) {
            vTarget = _Helper.buildPath(oAnnotatable.path, vTarget);
        }
        sPath = vTarget;
        oAnnotations = this.schema.$Annotations;
        if (oAnnotations && oAnnotations[vTarget]) {
            vTarget = oAnnotations[vTarget];
        }
    }
    this.oAnnotatable = {
        parent: this.oAnnotatable,
        path: sPath,
        prefix: sPrefix || "",
        qualifiedName: undefined,
        qualifier: sQualifier,
        target: vTarget
    };
};
_MetadataConverter.prototype.convertXMLMetadata = function (oDocument, sUrl) {
    var oElement;
    Measurement.average("convertXMLMetadata", "", "sap.ui.model.odata.v4.lib._V4MetadataConverter");
    oElement = oDocument.documentElement;
    if (oElement.localName !== "Edmx" || oElement.namespaceURI !== this.sRootNamespace) {
        throw new Error(sUrl + ": expected <Edmx> in namespace '" + this.sRootNamespace + "'");
    }
    this.result = {};
    this.url = sUrl;
    this.traverse(oElement, this.oAliasConfig);
    this.traverse(oElement, this.oFullConfig, true);
    this.finalize();
    Measurement.end("convertXMLMetadata");
    return this.result;
};
_MetadataConverter.prototype.getAnnotationValue = function (sType, sValue) {
    var vValue, aValues, i;
    switch (sType) {
        case "AnnotationPath":
        case "NavigationPropertyPath":
        case "Path":
        case "PropertyPath": sValue = this.resolveAliasInPath(sValue);
        case "Binary":
        case "Date":
        case "DateTimeOffset":
        case "Decimal":
        case "Duration":
        case "Guid":
        case "TimeOfDay":
        case "UrlRef":
            vValue = {};
            vValue["$" + sType] = sValue;
            return vValue;
        case "Bool": return sValue === "true";
        case "EnumMember":
            aValues = sValue.trim().replace(/ +/g, " ").split(" ");
            for (i = 0; i < aValues.length; i += 1) {
                aValues[i] = this.resolveAliasInPath(aValues[i]);
            }
            return { $EnumMember: aValues.join(" ") };
        case "Float":
            if (sValue === "NaN" || sValue === "INF" || sValue === "-INF") {
                return { $Float: sValue };
            }
            return parseFloat(sValue);
        case "Int":
            vValue = parseInt(sValue);
            return _Helper.isSafeInteger(vValue) ? vValue : { $Int: sValue };
        case "String": return sValue;
        default: return undefined;
    }
};
_MetadataConverter.prototype.getInlineAnnotationValue = function (oElement) {
    var oAttribute, oAttributeList = oElement.attributes, vValue, i;
    for (i = oAttributeList.length - 1; i >= 0; i -= 1) {
        oAttribute = oAttributeList.item(i);
        vValue = this.getAnnotationValue(oAttribute.name, oAttribute.value);
        if (vValue !== undefined) {
            return vValue;
        }
    }
    return true;
};
_MetadataConverter.prototype.getOrCreateArray = function (oParent, sProperty) {
    var oResult = oParent[sProperty];
    if (!oResult) {
        oResult = oParent[sProperty] = [];
    }
    return oResult;
};
_MetadataConverter.prototype.getOrCreateObject = function (oParent, sProperty) {
    var oResult = oParent[sProperty];
    if (!oResult) {
        oResult = oParent[sProperty] = {};
    }
    return oResult;
};
_MetadataConverter.prototype.postProcessAnnotation = function (oElement, aResult) {
    var oAnnotatable = this.oAnnotatable.parent;
    oAnnotatable.target[oAnnotatable.qualifiedName] = aResult.length ? aResult[0] : this.getInlineAnnotationValue(oElement);
};
_MetadataConverter.prototype.postProcessApply = function (oElement, aResult) {
    var oResult = this.oAnnotatable.target;
    oResult.$Apply = aResult;
    oResult.$Function = this.resolveAlias(oElement.getAttribute("Function"));
    return oResult;
};
_MetadataConverter.prototype.postProcessCastOrIsOf = function (oElement, aResult) {
    var sName = oElement.localName, oResult = this.oAnnotatable.target;
    oResult["$" + sName] = aResult[0];
    this.processTypedCollection(oElement.getAttribute("Type"), oResult);
    this.processFacetAttributes(oElement, oResult);
    return oResult;
};
_MetadataConverter.prototype.postProcessCollection = function (_oElement, aResult) {
    return aResult;
};
_MetadataConverter.prototype.postProcessLabeledElement = function (oElement, aResult) {
    var oResult = this.oAnnotatable.target;
    oResult.$LabeledElement = aResult.length ? aResult[0] : this.getInlineAnnotationValue(oElement);
    oResult.$Name = oElement.getAttribute("Name");
    return oResult;
};
_MetadataConverter.prototype.postProcessLabeledElementReference = function (oElement, _aResult) {
    return {
        "$LabeledElementReference": this.resolveAlias(oElement.textContent)
    };
};
_MetadataConverter.prototype.postProcessLeaf = function (oElement, _aResult) {
    return this.getAnnotationValue(oElement.localName, oElement.textContent);
};
_MetadataConverter.prototype.postProcessNot = function (_oElement, aResult) {
    var oResult = this.oAnnotatable.target;
    oResult.$Not = aResult[0];
    return oResult;
};
_MetadataConverter.prototype.postProcessNull = function (_oElement, _aResult) {
    var oAnnotatable = this.oAnnotatable, vResult = null;
    if (oAnnotatable.qualifiedName) {
        vResult = oAnnotatable.target;
        vResult.$Null = null;
    }
    return vResult;
};
_MetadataConverter.prototype.postProcessOperation = function (oElement, aResult) {
    var oResult = this.oAnnotatable.target;
    oResult["$" + oElement.localName] = aResult;
    return oResult;
};
_MetadataConverter.prototype.postProcessPropertyValue = function (oElement, aResult) {
    return {
        property: oElement.getAttribute("Property"),
        value: aResult.length ? aResult[0] : this.getInlineAnnotationValue(oElement)
    };
};
_MetadataConverter.prototype.postProcessRecord = function (oElement, aResult) {
    var oPropertyValue, oResult = this.oAnnotatable.target, oType = oElement.getAttribute("Type"), i;
    if (oType) {
        oResult.$Type = this.resolveAlias(oType);
    }
    for (i = 0; i < aResult.length; i += 1) {
        oPropertyValue = aResult[i];
        oResult[oPropertyValue.property] = oPropertyValue.value;
    }
    return oResult;
};
_MetadataConverter.prototype.postProcessUrlRef = function (_oElement, aResult) {
    return { $UrlRef: aResult[0] };
};
_MetadataConverter.prototype.processAlias = function (oElement) {
    var sAlias = oElement.getAttribute("Alias");
    if (sAlias) {
        this.aliases[sAlias] = oElement.getAttribute("Namespace") + ".";
    }
};
_MetadataConverter.prototype.processAnnotatableExpression = function (_oElement) {
    this.annotatable({});
};
_MetadataConverter.prototype.processAnnotation = function (oElement) {
    var oAnnotatable = this.oAnnotatable, oAnnotations, sQualifiedName = oAnnotatable.prefix + "@" + this.resolveAlias(oElement.getAttribute("Term")), sQualifier = oAnnotatable.qualifier || oElement.getAttribute("Qualifier");
    if (sQualifier) {
        sQualifiedName += "#" + sQualifier;
    }
    if (typeof oAnnotatable.target === "string") {
        oAnnotations = this.getOrCreateObject(this.schema, "$Annotations");
        oAnnotatable.target = oAnnotations[oAnnotatable.target] = {};
    }
    oAnnotatable.qualifiedName = sQualifiedName;
    oAnnotatable.target[sQualifiedName] = true;
    this.annotatable(oAnnotatable.target, sQualifiedName);
};
_MetadataConverter.prototype.processAnnotations = function (oElement) {
    this.annotatable(this.resolveAliasInPath(oElement.getAttribute("Target"), true), undefined, oElement.getAttribute("Qualifier"));
};
_MetadataConverter.prototype.processAttributes = function (oElement, oTarget, oConfig) {
    var sProperty;
    for (sProperty in oConfig) {
        var sValue = oConfig[sProperty](oElement.getAttribute(sProperty));
        if (sValue !== undefined && sValue !== null) {
            oTarget["$" + sProperty] = sValue;
        }
    }
};
_MetadataConverter.prototype.processInclude = function (oElement) {
    var oInclude = this.getOrCreateArray(this.reference, "$Include");
    oInclude.push(oElement.getAttribute("Namespace") + ".");
};
_MetadataConverter.prototype.processIncludeAnnotations = function (oElement) {
    var oReference = this.reference, oIncludeAnnotation = {
        "$TermNamespace": oElement.getAttribute("TermNamespace") + "."
    }, aIncludeAnnotations = this.getOrCreateArray(oReference, "$IncludeAnnotations");
    this.processAttributes(oElement, oIncludeAnnotation, {
        "TargetNamespace": function setValue(sValue) {
            return sValue ? sValue + "." : sValue;
        },
        "Qualifier": this.setValue
    });
    aIncludeAnnotations.push(oIncludeAnnotation);
};
_MetadataConverter.prototype.processPropertyValue = function (oElement) {
    this.annotatable(this.oAnnotatable.target, oElement.getAttribute("Property"));
};
_MetadataConverter.prototype.processReference = function (oElement) {
    var oReference = this.getOrCreateObject(this.result, "$Reference");
    this.reference = oReference[oElement.getAttribute("Uri")] = {};
    this.annotatable(this.reference);
};
_MetadataConverter.prototype.resolveAlias = function (sName) {
    var iDot = sName ? sName.indexOf(".") : -1, sNamespace;
    if (iDot >= 0 && !sName.includes(".", iDot + 1)) {
        sNamespace = this.aliases[sName.slice(0, iDot)];
        if (sNamespace) {
            return sNamespace + sName.slice(iDot + 1);
        }
    }
    return sName;
};
_MetadataConverter.prototype.resolveAliasInParentheses = function (bHandleParentheses, sSegment) {
    var iParentheses = bHandleParentheses ? sSegment.indexOf("(") : -1;
    if (iParentheses >= 0) {
        return this.resolveAlias(sSegment.slice(0, iParentheses)) + "(" + sSegment.slice(iParentheses + 1, -1).split(",").map(this.resolveAliasInParentheses.bind(this, bHandleParentheses)).join(",") + ")";
    }
    return this.resolveAlias(sSegment);
};
_MetadataConverter.prototype.resolveAliasInPath = function (sPath, bHandleParentheses) {
    var iAt, sTerm = "";
    if (!sPath.includes(".")) {
        return sPath;
    }
    iAt = sPath.indexOf("@");
    if (iAt >= 0) {
        sTerm = "@" + this.resolveAlias(sPath.slice(iAt + 1));
        sPath = sPath.slice(0, iAt);
    }
    return sPath.split("/").map(this.resolveAliasInParentheses.bind(this, bHandleParentheses)).join("/") + sTerm;
};
_MetadataConverter.prototype.setIfFalse = function (sValue) {
    return sValue === "false" ? false : undefined;
};
_MetadataConverter.prototype.setIfTrue = function (sValue) {
    return sValue === "true" ? true : undefined;
};
_MetadataConverter.prototype.setNumber = function (sValue) {
    return sValue ? parseInt(sValue) : undefined;
};
_MetadataConverter.prototype.setValue = function (sValue) {
    return sValue;
};
_MetadataConverter.prototype.traverse = function (oElement, oConfig, bUseProcessElementHook) {
    var oAnnotatable = this.oAnnotatable, oChildConfig, oChildList = oElement.childNodes, oChildNode, vChildResult, aIncludes, sName, sPreviousNamespace = this.xmlns, vResult, aResult = [], sXmlNamespace = oConfig.__xmlns || this.xmlns, i, j;
    if (sXmlNamespace && sXmlNamespace !== oElement.namespaceURI) {
        return undefined;
    }
    this.xmlns = sXmlNamespace;
    if (bUseProcessElementHook) {
        this.processElement(oElement, oConfig.__processor);
    }
    else if (oConfig.__processor) {
        oConfig.__processor.call(this, oElement);
    }
    for (i = 0; i < oChildList.length; i += 1) {
        oChildNode = oChildList.item(i);
        if (oChildNode.nodeType === 1) {
            sName = oChildNode.localName;
            oChildConfig = oConfig[sName];
            if (!oChildConfig && oConfig.__include) {
                aIncludes = oConfig.__include;
                for (j = 0; j < aIncludes.length; j += 1) {
                    oChildConfig = aIncludes[j][sName];
                    if (oChildConfig) {
                        break;
                    }
                }
            }
            if (oChildConfig) {
                vChildResult = this.traverse(oChildNode, oChildConfig, bUseProcessElementHook);
                if (vChildResult !== undefined && oConfig.__postProcessor) {
                    aResult.push(vChildResult);
                }
            }
        }
    }
    if (oConfig.__postProcessor) {
        vResult = oConfig.__postProcessor.call(this, oElement, aResult);
    }
    this.oAnnotatable = oAnnotatable;
    this.xmlns = sPreviousNamespace;
    return vResult;
};
(function ($$) {
    var aAnnotatableExpressionInclude, oAnnotationExpressionConfig, oAnnotationLeafConfig, aExpressionInclude, oOperatorConfig;
    oAnnotationLeafConfig = {
        "AnnotationPath": { __postProcessor: $$.postProcessLeaf },
        "Binary": { __postProcessor: $$.postProcessLeaf },
        "Bool": { __postProcessor: $$.postProcessLeaf },
        "Date": { __postProcessor: $$.postProcessLeaf },
        "DateTimeOffset": { __postProcessor: $$.postProcessLeaf },
        "Decimal": { __postProcessor: $$.postProcessLeaf },
        "Duration": { __postProcessor: $$.postProcessLeaf },
        "EnumMember": { __postProcessor: $$.postProcessLeaf },
        "Float": { __postProcessor: $$.postProcessLeaf },
        "Guid": { __postProcessor: $$.postProcessLeaf },
        "Int": { __postProcessor: $$.postProcessLeaf },
        "LabeledElementReference": { __postProcessor: $$.postProcessLabeledElementReference },
        "NavigationPropertyPath": { __postProcessor: $$.postProcessLeaf },
        "Path": { __postProcessor: $$.postProcessLeaf },
        "PropertyPath": { __postProcessor: $$.postProcessLeaf },
        "String": { __postProcessor: $$.postProcessLeaf },
        "TimeOfDay": { __postProcessor: $$.postProcessLeaf }
    };
    aExpressionInclude = [oAnnotationLeafConfig];
    $$.oAnnotationConfig = {
        "Annotation": {
            __xmlns: $$.sEdmNamespace,
            __processor: $$.processAnnotation,
            __postProcessor: $$.postProcessAnnotation,
            __include: aExpressionInclude
        }
    };
    aAnnotatableExpressionInclude = [oAnnotationLeafConfig, $$.oAnnotationConfig];
    oOperatorConfig = {
        __processor: $$.processAnnotatableExpression,
        __postProcessor: $$.postProcessOperation,
        __include: aAnnotatableExpressionInclude
    };
    oAnnotationExpressionConfig = {
        "And": oOperatorConfig,
        "Apply": {
            __processor: $$.processAnnotatableExpression,
            __postProcessor: $$.postProcessApply,
            __include: aAnnotatableExpressionInclude
        },
        "Cast": {
            __processor: $$.processAnnotatableExpression,
            __postProcessor: $$.postProcessCastOrIsOf,
            __include: aAnnotatableExpressionInclude
        },
        "Collection": {
            __postProcessor: $$.postProcessCollection,
            __include: aExpressionInclude
        },
        "Eq": oOperatorConfig,
        "Ge": oOperatorConfig,
        "Gt": oOperatorConfig,
        "If": oOperatorConfig,
        "IsOf": {
            __processor: $$.processAnnotatableExpression,
            __postProcessor: $$.postProcessCastOrIsOf,
            __include: aAnnotatableExpressionInclude
        },
        "LabeledElement": {
            __processor: $$.processAnnotatableExpression,
            __postProcessor: $$.postProcessLabeledElement,
            __include: aAnnotatableExpressionInclude
        },
        "Le": oOperatorConfig,
        "Lt": oOperatorConfig,
        "Ne": oOperatorConfig,
        "Null": {
            __processor: $$.processAnnotatableExpression,
            __postProcessor: $$.postProcessNull,
            __include: [$$.oAnnotationConfig]
        },
        "Not": {
            __processor: $$.processAnnotatableExpression,
            __postProcessor: $$.postProcessNot,
            __include: aAnnotatableExpressionInclude
        },
        "Or": oOperatorConfig,
        "Record": {
            __processor: $$.processAnnotatableExpression,
            __postProcessor: $$.postProcessRecord,
            __include: [$$.oAnnotationConfig],
            "PropertyValue": {
                __processor: $$.processPropertyValue,
                __postProcessor: $$.postProcessPropertyValue,
                __include: aAnnotatableExpressionInclude
            }
        },
        "UrlRef": {
            __postProcessor: $$.postProcessUrlRef,
            __include: aExpressionInclude
        }
    };
    $$.oAnnotationsConfig = {
        "Annotations": {
            __processor: $$.processAnnotations,
            __include: [$$.oAnnotationConfig]
        }
    };
    aExpressionInclude.push(oAnnotationExpressionConfig);
    aAnnotatableExpressionInclude.push(oAnnotationExpressionConfig);
    $$.oAnnotationConfig.Annotation.Annotation = $$.oAnnotationConfig.Annotation;
    $$.oReferenceInclude = {
        "Reference": {
            __xmlns: $$.sEdmxNamespace,
            __processor: $$.processReference,
            __include: [$$.oAnnotationConfig],
            "Include": {
                __processor: $$.processInclude
            },
            "IncludeAnnotations": {
                __processor: $$.processIncludeAnnotations
            }
        }
    };
})(_MetadataConverter.prototype);