import assert from "sap/base/assert";
import Log from "sap/base/Log";
import isEmptyObject from "sap/base/util/isEmptyObject";
export class AnnotationParser {
    static merge(mTargetAnnotations: any, mSourceAnnotations: any) {
        var sTarget, sTerm;
        var aSpecialCases = ["annotationsAtArrays", "propertyAnnotations", "EntityContainer", "annotationReferences"];
        for (sTarget in mSourceAnnotations) {
            if (aSpecialCases.indexOf(sTarget) !== -1) {
                continue;
            }
            AnnotationParser._mergeAnnotation(sTarget, mSourceAnnotations, mTargetAnnotations);
        }
        for (var i = 1; i < aSpecialCases.length; ++i) {
            var sSpecialCase = aSpecialCases[i];
            mTargetAnnotations[sSpecialCase] = mTargetAnnotations[sSpecialCase] || {};
            for (sTarget in mSourceAnnotations[sSpecialCase]) {
                for (sTerm in mSourceAnnotations[sSpecialCase][sTarget]) {
                    mTargetAnnotations[sSpecialCase][sTarget] = mTargetAnnotations[sSpecialCase][sTarget] || {};
                    AnnotationParser._mergeAnnotation(sTerm, mSourceAnnotations[sSpecialCase][sTarget], mTargetAnnotations[sSpecialCase][sTarget]);
                }
            }
        }
        if (mSourceAnnotations.annotationsAtArrays) {
            mTargetAnnotations.annotationsAtArrays = (mTargetAnnotations.annotationsAtArrays || []).concat(mSourceAnnotations.annotationsAtArrays);
        }
    }
    private static _mergeAnnotation(sName: any, mAnnotations: any, mTarget: any) {
        if (Array.isArray(mAnnotations[sName])) {
            mTarget[sName] = mAnnotations[sName].slice(0);
        }
        else {
            mTarget[sName] = mTarget[sName] || {};
            for (var sKey in mAnnotations[sName]) {
                mTarget[sName][sKey] = mAnnotations[sName][sKey];
            }
        }
    }
    static parse(oMetadata: any, oXMLDoc: any, sSourceUrl: any) {
        try {
            AnnotationParser._parserData = {};
            AnnotationParser._oXPath = AnnotationParser.getXPath();
            return AnnotationParser._parse(oMetadata, oXMLDoc, sSourceUrl);
        }
        finally {
            delete AnnotationParser._parserData;
            delete AnnotationParser._oXPath;
        }
    }
    private static _parse(oMetadata: any, oXMLDoc: any, sSourceUrl: any) {
        var mappingList = {}, schemaNodes, schemaNode, termNodes, oTerms, termNode, sTermType, annotationNodes, annotationNode, annotationTarget, annotationNamespace, annotation, propertyAnnotation, propertyAnnotationNodes, propertyAnnotationNode, sTermValue, targetAnnotation, expandNodes, expandNode, path, pathValues, expandNodesApplFunc, i, nodeIndex, annotationsAtArrays = [];
        AnnotationParser._parserData.metadataInstance = oMetadata;
        AnnotationParser._parserData.serviceMetadata = oMetadata.getServiceMetadata();
        AnnotationParser._parserData.xmlDocument = AnnotationParser._oXPath.setNameSpace(oXMLDoc);
        AnnotationParser._parserData.schema = {};
        AnnotationParser._parserData.aliases = {};
        AnnotationParser._parserData.url = sSourceUrl ? sSourceUrl : "metadata document";
        AnnotationParser._parserData.annotationsAtArrays = annotationsAtArrays;
        schemaNodes = AnnotationParser._oXPath.selectNodes("//d:Schema", AnnotationParser._parserData.xmlDocument);
        for (i = 0; i < schemaNodes.length; i += 1) {
            schemaNode = AnnotationParser._oXPath.nextNode(schemaNodes, i);
            AnnotationParser._parserData.schema.Alias = schemaNode.getAttribute("Alias");
            AnnotationParser._parserData.schema.Namespace = schemaNode.getAttribute("Namespace");
        }
        var oAnnotationReferences = {};
        var bFoundReferences = AnnotationParser._parseReferences(oAnnotationReferences);
        if (bFoundReferences) {
            mappingList.annotationReferences = oAnnotationReferences;
            mappingList.aliasDefinitions = AnnotationParser._parserData.aliases;
        }
        termNodes = AnnotationParser._oXPath.selectNodes("//d:Term", AnnotationParser._parserData.xmlDocument);
        if (termNodes.length > 0) {
            oTerms = {};
            for (nodeIndex = 0; nodeIndex < termNodes.length; nodeIndex += 1) {
                termNode = AnnotationParser._oXPath.nextNode(termNodes, nodeIndex);
                sTermType = AnnotationParser.replaceWithAlias(termNode.getAttribute("Type"));
                oTerms["@" + AnnotationParser._parserData.schema.Alias + "." + termNode.getAttribute("Name")] = sTermType;
            }
            mappingList.termDefinitions = oTerms;
        }
        AnnotationParser._parserData.metadataProperties = AnnotationParser.getAllPropertiesMetadata(AnnotationParser._parserData.serviceMetadata);
        if (AnnotationParser._parserData.metadataProperties.extensions) {
            mappingList.propertyExtensions = AnnotationParser._parserData.metadataProperties.extensions;
        }
        annotationNodes = AnnotationParser._oXPath.selectNodes("//d:Annotations ", AnnotationParser._parserData.xmlDocument);
        for (nodeIndex = 0; nodeIndex < annotationNodes.length; nodeIndex += 1) {
            annotationNode = AnnotationParser._oXPath.nextNode(annotationNodes, nodeIndex);
            if (annotationNode.hasChildNodes() === false) {
                continue;
            }
            annotationTarget = annotationNode.getAttribute("Target");
            annotationNamespace = annotationTarget.split(".")[0];
            if (annotationNamespace && AnnotationParser._parserData.aliases[annotationNamespace]) {
                annotationTarget = annotationTarget.replace(new RegExp(annotationNamespace, ""), AnnotationParser._parserData.aliases[annotationNamespace]);
            }
            annotation = annotationTarget;
            propertyAnnotation = null;
            var sContainerAnnotation = null;
            if (annotationTarget.indexOf("/") > 0) {
                annotation = annotationTarget.split("/")[0];
                var bSchemaExists = AnnotationParser._parserData.serviceMetadata.dataServices && AnnotationParser._parserData.serviceMetadata.dataServices.schema && AnnotationParser._parserData.serviceMetadata.dataServices.schema.length;
                if (bSchemaExists) {
                    for (var j = AnnotationParser._parserData.serviceMetadata.dataServices.schema.length - 1; j >= 0; j--) {
                        var oMetadataSchema = AnnotationParser._parserData.serviceMetadata.dataServices.schema[j];
                        if (oMetadataSchema.entityContainer) {
                            var aAnnotation = annotation.split(".");
                            for (var k = oMetadataSchema.entityContainer.length - 1; k >= 0; k--) {
                                if (oMetadataSchema.entityContainer[k].name === aAnnotation[aAnnotation.length - 1]) {
                                    sContainerAnnotation = annotationTarget.replace(annotation + "/", "");
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!sContainerAnnotation) {
                    propertyAnnotation = annotationTarget.replace(annotation + "/", "");
                }
            }
            if (propertyAnnotation) {
                if (!mappingList.propertyAnnotations) {
                    mappingList.propertyAnnotations = {};
                }
                if (!mappingList.propertyAnnotations[annotation]) {
                    mappingList.propertyAnnotations[annotation] = {};
                }
                if (!mappingList.propertyAnnotations[annotation][propertyAnnotation]) {
                    mappingList.propertyAnnotations[annotation][propertyAnnotation] = {};
                }
                propertyAnnotationNodes = AnnotationParser._oXPath.selectNodes("./d:Annotation", annotationNode);
                for (var nodeIndexValue = 0; nodeIndexValue < propertyAnnotationNodes.length; nodeIndexValue += 1) {
                    propertyAnnotationNode = AnnotationParser._oXPath.nextNode(propertyAnnotationNodes, nodeIndexValue);
                    sTermValue = AnnotationParser.replaceWithAlias(propertyAnnotationNode.getAttribute("Term"));
                    var sQualifierValue = getQualifier(propertyAnnotationNode);
                    if (sQualifierValue) {
                        sTermValue += "#" + sQualifierValue;
                    }
                    if (propertyAnnotationNode.hasChildNodes() === false) {
                        var o = {};
                        AnnotationParser.enrichFromPropertyValueAttributes(o, propertyAnnotationNode);
                        if (isEmptyObject(o)) {
                            o.Bool = "true";
                        }
                        mappingList.propertyAnnotations[annotation][propertyAnnotation][sTermValue] = o;
                    }
                    else {
                        mappingList.propertyAnnotations[annotation][propertyAnnotation][sTermValue] = AnnotationParser.getPropertyValue(propertyAnnotationNode);
                    }
                }
            }
            else {
                var mTarget;
                if (sContainerAnnotation) {
                    if (!mappingList["EntityContainer"]) {
                        mappingList["EntityContainer"] = {};
                    }
                    if (!mappingList["EntityContainer"][annotation]) {
                        mappingList["EntityContainer"][annotation] = {};
                    }
                    mTarget = mappingList["EntityContainer"][annotation];
                }
                else {
                    if (!mappingList[annotation]) {
                        mappingList[annotation] = {};
                    }
                    mTarget = mappingList[annotation];
                }
                targetAnnotation = annotation.replace(AnnotationParser._parserData.aliases[annotationNamespace], annotationNamespace);
                propertyAnnotationNodes = AnnotationParser._oXPath.selectNodes("./d:Annotation", annotationNode);
                for (var nodeIndexAnnotation = 0; nodeIndexAnnotation < propertyAnnotationNodes.length; nodeIndexAnnotation += 1) {
                    propertyAnnotationNode = AnnotationParser._oXPath.nextNode(propertyAnnotationNodes, nodeIndexAnnotation);
                    var oAnnotationTarget = mTarget;
                    if (sContainerAnnotation) {
                        if (!mTarget[sContainerAnnotation]) {
                            mTarget[sContainerAnnotation] = {};
                        }
                        oAnnotationTarget = mTarget[sContainerAnnotation];
                    }
                    AnnotationParser._parseAnnotation(annotation, propertyAnnotationNode, oAnnotationTarget);
                }
                expandNodes = AnnotationParser._oXPath.selectNodes("//d:Annotations[contains(@Target, '" + targetAnnotation + "')]//d:PropertyValue[contains(@Path, '/')]//@Path", AnnotationParser._parserData.xmlDocument);
                for (i = 0; i < expandNodes.length; i += 1) {
                    expandNode = AnnotationParser._oXPath.nextNode(expandNodes, i);
                    path = expandNode.value;
                    if (mappingList.propertyAnnotations) {
                        if (mappingList.propertyAnnotations[annotation]) {
                            if (mappingList.propertyAnnotations[annotation][path]) {
                                continue;
                            }
                        }
                    }
                    pathValues = path.split("/");
                    if (AnnotationParser.findNavProperty(annotation, pathValues[0])) {
                        if (!mappingList.expand) {
                            mappingList.expand = {};
                        }
                        if (!mappingList.expand[annotation]) {
                            mappingList.expand[annotation] = {};
                        }
                        mappingList.expand[annotation][pathValues[0]] = pathValues[0];
                    }
                }
                expandNodesApplFunc = AnnotationParser._oXPath.selectNodes("//d:Annotations[contains(@Target, '" + targetAnnotation + "')]//d:Path[contains(., '/')]", AnnotationParser._parserData.xmlDocument);
                for (i = 0; i < expandNodesApplFunc.length; i += 1) {
                    expandNode = AnnotationParser._oXPath.nextNode(expandNodesApplFunc, i);
                    path = AnnotationParser._oXPath.getNodeText(expandNode);
                    if (mappingList.propertyAnnotations && mappingList.propertyAnnotations[annotation] && mappingList.propertyAnnotations[annotation][path]) {
                        continue;
                    }
                    if (!mappingList.expand) {
                        mappingList.expand = {};
                    }
                    if (!mappingList.expand[annotation]) {
                        mappingList.expand[annotation] = {};
                    }
                    pathValues = path.split("/");
                    if (AnnotationParser.findNavProperty(annotation, pathValues[0])) {
                        if (!mappingList.expand) {
                            mappingList.expand = {};
                        }
                        if (!mappingList.expand[annotation]) {
                            mappingList.expand[annotation] = {};
                        }
                        mappingList.expand[annotation][pathValues[0]] = pathValues[0];
                    }
                }
            }
        }
        if (annotationsAtArrays.length) {
            mappingList.annotationsAtArrays = annotationsAtArrays.map(function (oAnnotationNode) {
                return AnnotationParser.backupAnnotationAtArray(oAnnotationNode, mappingList);
            });
        }
        return mappingList;
    }
    static backupAnnotationAtArray(oElement: any, mAnnotations: any) {
        var sQualifier, aSegments = [];
        function index() {
            return Array.prototype.filter.call(oElement.parentNode.childNodes, function (oNode) {
                return oNode.nodeType === 1;
            }).indexOf(oElement);
        }
        while (oElement.nodeName !== "Annotations") {
            switch (oElement.nodeName) {
                case "Annotation":
                    sQualifier = getQualifier(oElement);
                    aSegments.unshift(oElement.getAttribute("Term") + (sQualifier ? "#" + sQualifier : ""));
                    break;
                case "Collection": break;
                case "PropertyValue":
                    aSegments.unshift(oElement.getAttribute("Property"));
                    break;
                case "Record":
                    if (oElement.parentNode.nodeName === "Collection") {
                        aSegments.unshift(index());
                    }
                    break;
                default:
                    if (oElement.parentNode.nodeName === "Apply") {
                        aSegments.unshift("Value");
                        aSegments.unshift(index());
                        aSegments.unshift("Parameters");
                    }
                    else {
                        aSegments.unshift(oElement.nodeName);
                    }
                    break;
            }
            oElement = oElement.parentNode;
        }
        aSegments.unshift(oElement.getAttribute("Target"));
        aSegments = aSegments.map(function (vSegment) {
            return typeof vSegment === "string" ? AnnotationParser.replaceWithAlias(vSegment) : vSegment;
        });
        AnnotationParser.syncAnnotationsAtArrays(mAnnotations, aSegments, true);
        return aSegments;
    }
    static restoreAnnotationsAtArrays(mAnnotations: any) {
        if (mAnnotations.annotationsAtArrays) {
            mAnnotations.annotationsAtArrays.forEach(function (aSegments) {
                AnnotationParser.syncAnnotationsAtArrays(mAnnotations, aSegments);
            });
        }
    }
    static syncAnnotationsAtArrays(mAnnotations: any, aSegments: any, bWarn: any) {
        var i, n = aSegments.length - 2, sAnnotation = aSegments[n + 1], oParent = mAnnotations, sProperty = aSegments[n], sSiblingName = sProperty + "@" + sAnnotation;
        for (i = 0; i < n; i += 1) {
            oParent = oParent && oParent[aSegments[i]];
        }
        if (oParent && Array.isArray(oParent[sProperty])) {
            if (!(sSiblingName in oParent)) {
                oParent[sSiblingName] = oParent[sProperty][sAnnotation];
            }
            if (!(sAnnotation in oParent[sProperty])) {
                oParent[sProperty][sAnnotation] = oParent[sSiblingName];
            }
        }
        else if (bWarn) {
            Log.warning("Wrong path to annotation at array", aSegments, "sap.ui.model.odata.AnnotationParser");
        }
    }
    private static _parseAnnotation(sAnnotationTarget: any, oAnnotationNode: any, oAnnotationTarget: any) {
        var sQualifier = getQualifier(oAnnotationNode);
        var sTerm = AnnotationParser.replaceWithAlias(oAnnotationNode.getAttribute("Term"));
        if (sQualifier) {
            sTerm += "#" + sQualifier;
        }
        var vValue = AnnotationParser.getPropertyValue(oAnnotationNode, sAnnotationTarget);
        vValue = AnnotationParser.setEdmTypes(vValue, AnnotationParser._parserData.metadataProperties.types, sAnnotationTarget, AnnotationParser._parserData.schema);
        oAnnotationTarget[sTerm] = vValue;
        if (Array.isArray(oAnnotationTarget)) {
            AnnotationParser._parserData.annotationsAtArrays.push(oAnnotationNode);
        }
    }
    private static _parseReferences(mAnnotationReferences: any) {
        var bFound = false;
        var oNode, i;
        var xPath = AnnotationParser._oXPath;
        var sAliasSelector = "//edmx:Reference/edmx:Include[@Namespace and @Alias]";
        var oAliasNodes = xPath.selectNodes(sAliasSelector, AnnotationParser._parserData.xmlDocument);
        for (i = 0; i < oAliasNodes.length; ++i) {
            bFound = true;
            oNode = xPath.nextNode(oAliasNodes, i);
            AnnotationParser._parserData.aliases[oNode.getAttribute("Alias")] = oNode.getAttribute("Namespace");
        }
        AnnotationParser._parserData.aliasesByLength = Object.keys(AnnotationParser._parserData.aliases).sort(function (sAlias0, sAlias1) {
            return sAlias1.length - sAlias0.length;
        });
        var sReferenceSelector = "//edmx:Reference[@Uri]/edmx:IncludeAnnotations[@TermNamespace]";
        var oReferenceNodes = xPath.selectNodes(sReferenceSelector, AnnotationParser._parserData.xmlDocument);
        for (i = 0; i < oReferenceNodes.length; ++i) {
            bFound = true;
            oNode = xPath.nextNode(oReferenceNodes, i);
            var sTermNamespace = oNode.getAttribute("TermNamespace");
            var sTargetNamespace = oNode.getAttribute("TargetNamespace");
            var sReferenceUri = oNode.parentNode.getAttribute("Uri");
            if (sTargetNamespace) {
                if (!mAnnotationReferences[sTargetNamespace]) {
                    mAnnotationReferences[sTargetNamespace] = {};
                }
                mAnnotationReferences[sTargetNamespace][sTermNamespace] = sReferenceUri;
            }
            else {
                mAnnotationReferences[sTermNamespace] = sReferenceUri;
            }
        }
        return bFound;
    }
    static getAllPropertiesMetadata(oMetadata: any) {
        var oMetadataSchema = {}, oPropertyTypes = {}, oPropertyExtensions = {}, bPropertyExtensions = false, sNamespace, aEntityTypes, aComplexTypes, oEntityType = {}, oProperties = {}, oExtensions = {}, bExtensions = false, oProperty, oComplexTypeProp, sPropertyName, sType, oPropExtension, oReturn = {
            types: oPropertyTypes
        };
        if (!oMetadata.dataServices.schema) {
            return oReturn;
        }
        for (var i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
            oMetadataSchema = oMetadata.dataServices.schema[i];
            if (oMetadataSchema.entityType) {
                sNamespace = oMetadataSchema.namespace;
                aEntityTypes = oMetadataSchema.entityType;
                aComplexTypes = oMetadataSchema.complexType;
                for (var j = 0; j < aEntityTypes.length; j += 1) {
                    oEntityType = aEntityTypes[j];
                    oExtensions = {};
                    oProperties = {};
                    if (oEntityType.property) {
                        for (var k = 0; k < oEntityType.property.length; k += 1) {
                            oProperty = oEntityType.property[k];
                            if (oProperty.type.substring(0, sNamespace.length) === sNamespace) {
                                if (aComplexTypes) {
                                    for (var l = 0; l < aComplexTypes.length; l += 1) {
                                        if (aComplexTypes[l].name === oProperty.type.substring(sNamespace.length + 1)) {
                                            if (aComplexTypes[l].property) {
                                                for (var m = 0; m < aComplexTypes[l].property.length; m += 1) {
                                                    oComplexTypeProp = aComplexTypes[l].property[m];
                                                    oProperties[aComplexTypes[l].name + "/" + oComplexTypeProp.name] = oComplexTypeProp.type;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                sPropertyName = oProperty.name;
                                sType = oProperty.type;
                                if (oProperty.extensions) {
                                    for (var p = 0; p < oProperty.extensions.length; p += 1) {
                                        oPropExtension = oProperty.extensions[p];
                                        if ((oPropExtension.name === "display-format") && (oPropExtension.value === "Date")) {
                                            sType = "Edm.Date";
                                        }
                                        else {
                                            bExtensions = true;
                                            if (!oExtensions[sPropertyName]) {
                                                oExtensions[sPropertyName] = {};
                                            }
                                            if (oPropExtension.namespace && !oExtensions[sPropertyName][oPropExtension.namespace]) {
                                                oExtensions[sPropertyName][oPropExtension.namespace] = {};
                                            }
                                            oExtensions[sPropertyName][oPropExtension.namespace][oPropExtension.name] = oPropExtension.value;
                                        }
                                    }
                                }
                                oProperties[sPropertyName] = sType;
                            }
                        }
                    }
                    if (!oPropertyTypes[sNamespace + "." + oEntityType.name]) {
                        oPropertyTypes[sNamespace + "." + oEntityType.name] = {};
                    }
                    oPropertyTypes[sNamespace + "." + oEntityType.name] = oProperties;
                    if (bExtensions) {
                        if (!oPropertyExtensions[sNamespace + "." + oEntityType.name]) {
                            bPropertyExtensions = true;
                        }
                        oPropertyExtensions[sNamespace + "." + oEntityType.name] = {};
                        oPropertyExtensions[sNamespace + "." + oEntityType.name] = oExtensions;
                    }
                }
            }
        }
        if (bPropertyExtensions) {
            oReturn = {
                types: oPropertyTypes,
                extensions: oPropertyExtensions
            };
        }
        return oReturn;
    }
    static setEdmTypes(vPropertyValues: any, oProperties: any, sTarget: any, oSchema: any) {
        function setEdmType(vValueIndex) {
            var oPropertyValue, sEdmType = "";
            if (vPropertyValues[vValueIndex]) {
                oPropertyValue = vPropertyValues[vValueIndex];
                if (oPropertyValue.Value && oPropertyValue.Value.Path) {
                    sEdmType = AnnotationParser.getEdmType(oPropertyValue.Value.Path, oProperties, sTarget, oSchema);
                    if (sEdmType) {
                        vPropertyValues[vValueIndex].EdmType = sEdmType;
                    }
                }
                else if (oPropertyValue.Path) {
                    sEdmType = AnnotationParser.getEdmType(oPropertyValue.Path, oProperties, sTarget, oSchema);
                    if (sEdmType) {
                        vPropertyValues[vValueIndex].EdmType = sEdmType;
                    }
                }
                else if (oPropertyValue.Facets) {
                    vPropertyValues[vValueIndex].Facets = AnnotationParser.setEdmTypes(oPropertyValue.Facets, oProperties, sTarget, oSchema);
                }
                else if (oPropertyValue.Data) {
                    vPropertyValues[vValueIndex].Data = AnnotationParser.setEdmTypes(oPropertyValue.Data, oProperties, sTarget, oSchema);
                }
                else if (vValueIndex === "Data") {
                    vPropertyValues.Data = AnnotationParser.setEdmTypes(oPropertyValue, oProperties, sTarget, oSchema);
                }
                else if (oPropertyValue.Value && oPropertyValue.Value.Apply) {
                    vPropertyValues[vValueIndex].Value.Apply.Parameters = AnnotationParser.setEdmTypes(oPropertyValue.Value.Apply.Parameters, oProperties, sTarget, oSchema);
                }
                else if (oPropertyValue.Value && oPropertyValue.Type && (oPropertyValue.Type === "Path")) {
                    sEdmType = AnnotationParser.getEdmType(oPropertyValue.Value, oProperties, sTarget, oSchema);
                    if (sEdmType) {
                        vPropertyValues[vValueIndex].EdmType = sEdmType;
                    }
                }
            }
        }
        if (Array.isArray(vPropertyValues)) {
            for (var iValueIndex = 0; iValueIndex < vPropertyValues.length; iValueIndex += 1) {
                setEdmType(iValueIndex);
            }
        }
        else {
            for (var sValueIndex in vPropertyValues) {
                setEdmType(sValueIndex);
            }
        }
        return vPropertyValues;
    }
    static getEdmType(sPath: any, oProperties: any, sTarget: any, oSchema: any) {
        var iPos = sPath.indexOf("/");
        if (iPos > -1) {
            var sPropertyName = sPath.substr(0, iPos);
            var mNavProperty = AnnotationParser.findNavProperty(sTarget, sPropertyName);
            if (mNavProperty) {
                var mToEntityType = AnnotationParser._parserData.metadataInstance._getEntityTypeByNavPropertyObject(mNavProperty);
                if (mToEntityType) {
                    sTarget = mToEntityType.entityType;
                    sPath = sPath.substr(iPos + 1);
                }
            }
        }
        if ((sPath.charAt(0) === "@") && (sPath.indexOf(oSchema.Alias) === 1)) {
            sPath = sPath.slice(oSchema.Alias.length + 2);
        }
        if (sPath.indexOf("/") >= 0) {
            if (oProperties[sPath.slice(0, sPath.indexOf("/"))]) {
                sTarget = sPath.slice(0, sPath.indexOf("/"));
                sPath = sPath.slice(sPath.indexOf("/") + 1);
            }
        }
        return oProperties[sTarget] && oProperties[sTarget][sPath];
    }
    static enrichFromPropertyValueAttributes(mAttributes: any, oNode: any) {
        var mIgnoredAttributes = {
            "Property": true,
            "Qualifier": true,
            "Term": true,
            "xmlns": true
        };
        for (var i = 0; i < oNode.attributes.length; i += 1) {
            var sName = oNode.attributes[i].name;
            if (!mIgnoredAttributes[sName] && (sName.indexOf("xmlns:") !== 0)) {
                var sValue = oNode.attributes[i].value;
                if (sName === "EnumMember" && sValue.indexOf(" ") > -1) {
                    var aValues = sValue.split(" ");
                    mAttributes[sName] = aValues.map(AnnotationParser.replaceWithAlias).join(" ");
                }
                else {
                    mAttributes[sName] = AnnotationParser.replaceWithAlias(sValue);
                }
            }
        }
        return mAttributes;
    }
    private static _getRecordValues(oNodeList: any) {
        var aNodeValues = [];
        var xPath = AnnotationParser._oXPath;
        for (var i = 0; i < oNodeList.length; ++i) {
            var oNode = xPath.nextNode(oNodeList, i);
            var vNodeValue = AnnotationParser.getPropertyValues(oNode);
            var sType = oNode.getAttribute("Type");
            if (sType) {
                vNodeValue["RecordType"] = AnnotationParser.replaceWithAlias(sType);
            }
            aNodeValues.push(vNodeValue);
        }
        return aNodeValues;
    }
    private static _getTextValues(oNodeList: any) {
        var aNodeValues = [];
        var xPath = AnnotationParser._oXPath;
        for (var i = 0; i < oNodeList.length; i += 1) {
            var oNode = xPath.nextNode(oNodeList, i);
            var oValue = {};
            var sText = xPath.getNodeText(oNode);
            oValue[oNode.nodeName] = AnnotationParser._parserData.aliases ? AnnotationParser.replaceWithAlias(sText) : sText;
            aNodeValues.push(oValue);
        }
        return aNodeValues;
    }
    private static _getTextValue(oNode: any) {
        var xPath = AnnotationParser._oXPath;
        var sValue = "";
        if (oNode.nodeName in mAliasNodeIncludeList) {
            sValue = AnnotationParser.replaceWithAlias(xPath.getNodeText(oNode));
        }
        else {
            sValue = xPath.getNodeText(oNode);
        }
        if (oNode.nodeName !== "String") {
            sValue = sValue.trim();
        }
        return sValue;
    }
    static getPropertyValue(oDocumentNode: any, sAnnotationTarget: any) {
        var i;
        var xPath = AnnotationParser._oXPath;
        var vPropertyValue = oDocumentNode.nodeName === "Collection" ? [] : {};
        if (oDocumentNode.hasChildNodes()) {
            var oRecordNodeList = xPath.selectNodes("./d:Record", oDocumentNode);
            var aRecordValues = AnnotationParser._getRecordValues(oRecordNodeList);
            var oCollectionRecordNodeList = xPath.selectNodes("./d:Collection/d:Record | ./d:Collection/d:If/d:Record", oDocumentNode);
            var aCollectionRecordValues = AnnotationParser._getRecordValues(oCollectionRecordNodeList);
            var aPropertyValues = aRecordValues.concat(aCollectionRecordValues);
            if (aPropertyValues.length > 0) {
                if (oCollectionRecordNodeList.length === 0 && oRecordNodeList.length > 0) {
                    vPropertyValue = aPropertyValues[0];
                }
                else {
                    vPropertyValue = aPropertyValues;
                }
            }
            else {
                var oCollectionNodes = xPath.selectNodes("./d:Collection/d:AnnotationPath | ./d:Collection/d:NavigationPropertyPath | ./d:Collection/d:PropertyPath", oDocumentNode);
                if (oCollectionNodes.length > 0) {
                    vPropertyValue = AnnotationParser._getTextValues(oCollectionNodes);
                }
                else {
                    var oChildNodes = xPath.selectNodes("./d:*[not(local-name() = \"Annotation\")]", oDocumentNode);
                    if (oChildNodes.length > 0) {
                        for (i = 0; i < oChildNodes.length; i++) {
                            var oChildNode = xPath.nextNode(oChildNodes, i);
                            var vValue;
                            var sNodeName = oChildNode.nodeName;
                            var sParentName = oChildNode.parentNode.nodeName;
                            if (sNodeName === "Apply") {
                                vValue = AnnotationParser.getApplyFunctions(oChildNode);
                            }
                            else {
                                vValue = AnnotationParser.getPropertyValue(oChildNode);
                            }
                            if (mMultipleArgumentDynamicExpressions[sParentName]) {
                                if (!Array.isArray(vPropertyValue)) {
                                    vPropertyValue = [];
                                }
                                var mValue = {};
                                mValue[sNodeName] = vValue;
                                vPropertyValue.push(mValue);
                            }
                            else if (sNodeName === "Collection") {
                                vPropertyValue = vValue;
                            }
                            else {
                                if (vPropertyValue[sNodeName]) {
                                    Log.warning("Annotation contained multiple " + sNodeName + " values. Only the last " + "one will be stored: " + xPath.getPath(oChildNode));
                                }
                                vPropertyValue[sNodeName] = vValue;
                            }
                        }
                        AnnotationParser.enrichFromPropertyValueAttributes(vPropertyValue, oDocumentNode);
                    }
                    else if (oDocumentNode.nodeName in mTextNodeIncludeList) {
                        vPropertyValue = AnnotationParser._getTextValue(oDocumentNode);
                    }
                    else {
                        AnnotationParser.enrichFromPropertyValueAttributes(vPropertyValue, oDocumentNode);
                    }
                }
            }
            var oNestedAnnotations = xPath.selectNodes("./d:Annotation", oDocumentNode);
            if (oNestedAnnotations.length > 0) {
                for (i = 0; i < oNestedAnnotations.length; i++) {
                    var oNestedAnnotationNode = xPath.nextNode(oNestedAnnotations, i);
                    AnnotationParser._parseAnnotation(sAnnotationTarget, oNestedAnnotationNode, vPropertyValue);
                }
            }
        }
        else if (oDocumentNode.nodeName in mTextNodeIncludeList) {
            vPropertyValue = AnnotationParser._getTextValue(oDocumentNode);
        }
        else if (oDocumentNode.nodeName.toLowerCase() === "null") {
            vPropertyValue = null;
        }
        else {
            AnnotationParser.enrichFromPropertyValueAttributes(vPropertyValue, oDocumentNode);
        }
        return vPropertyValue;
    }
    static getPropertyValues(oParentElement: any) {
        var mProperties = {}, i;
        var xPath = AnnotationParser._oXPath;
        var oAnnotationNodes = xPath.selectNodes("./d:Annotation", oParentElement);
        var oPropertyValueNodes = xPath.selectNodes("./d:PropertyValue", oParentElement);
        function getAssertText(oParentElement, sWhat, sName) {
            var oAnnotationTarget, oAnnotationTerm = oParentElement;
            while (oAnnotationTerm.nodeName !== "Annotation") {
                oAnnotationTerm = oAnnotationTerm.parentNode;
            }
            oAnnotationTarget = oAnnotationTerm.parentNode;
            return (sWhat + " '" + sName + "' is defined twice; " + "Source = " + AnnotationParser._parserData.url + ", Annotation Target = " + oAnnotationTarget.getAttribute("Target") + ", Term = " + oAnnotationTerm.getAttribute("Term"));
        }
        if (oAnnotationNodes.length === 0 && oPropertyValueNodes.length === 0) {
            mProperties = AnnotationParser.getPropertyValue(oParentElement);
        }
        else {
            for (i = 0; i < oAnnotationNodes.length; i++) {
                var oAnnotationNode = xPath.nextNode(oAnnotationNodes, i);
                var sTerm = AnnotationParser.replaceWithAlias(oAnnotationNode.getAttribute("Term"));
                assert(!mProperties[sTerm], function () {
                    return getAssertText(oParentElement, "Annotation", sTerm);
                });
                mProperties[sTerm] = AnnotationParser.getPropertyValue(oAnnotationNode);
            }
            for (i = 0; i < oPropertyValueNodes.length; i++) {
                var oPropertyValueNode = xPath.nextNode(oPropertyValueNodes, i);
                var sPropertyName = oPropertyValueNode.getAttribute("Property");
                assert(!mProperties[sPropertyName], function () {
                    return getAssertText(oParentElement, "Property", sPropertyName);
                });
                mProperties[sPropertyName] = AnnotationParser.getPropertyValue(oPropertyValueNode);
                var oApplyNodes = xPath.selectNodes("./d:Apply", oPropertyValueNode);
                for (var n = 0; n < oApplyNodes.length; n += 1) {
                    var oApplyNode = xPath.nextNode(oApplyNodes, n);
                    mProperties[sPropertyName] = {};
                    mProperties[sPropertyName]["Apply"] = AnnotationParser.getApplyFunctions(oApplyNode);
                }
            }
        }
        return mProperties;
    }
    static getApplyFunctions(applyNode: any) {
        var xPath = AnnotationParser._oXPath;
        var mApply = {
            Name: applyNode.getAttribute("Function"),
            Parameters: []
        };
        var oParameterNodes = xPath.selectNodes("./d:*", applyNode);
        for (var i = 0; i < oParameterNodes.length; i += 1) {
            var oParameterNode = xPath.nextNode(oParameterNodes, i);
            var mParameter = {
                Type: oParameterNode.nodeName
            };
            if (oParameterNode.nodeName === "Apply") {
                mParameter.Value = AnnotationParser.getApplyFunctions(oParameterNode);
            }
            else if (oParameterNode.nodeName === "LabeledElement") {
                mParameter.Value = AnnotationParser.getPropertyValue(oParameterNode);
                mParameter.Name = mParameter.Value.Name;
                delete mParameter.Value.Name;
            }
            else if (mMultipleArgumentDynamicExpressions[oParameterNode.nodeName]) {
                mParameter.Value = AnnotationParser.getPropertyValue(oParameterNode);
            }
            else {
                mParameter.Value = xPath.getNodeText(oParameterNode);
            }
            mApply.Parameters.push(mParameter);
        }
        return mApply;
    }
    static findNavProperty(sEntityType: any, sPathValue: any) {
        var oMetadata = AnnotationParser._parserData.serviceMetadata;
        for (var i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
            var oMetadataSchema = oMetadata.dataServices.schema[i];
            if (oMetadataSchema.entityType) {
                var sNamespace = oMetadataSchema.namespace + ".";
                var aEntityTypes = oMetadataSchema.entityType;
                for (var k = aEntityTypes.length - 1; k >= 0; k -= 1) {
                    if (sNamespace + aEntityTypes[k].name === sEntityType && aEntityTypes[k].navigationProperty) {
                        for (var j = 0; j < aEntityTypes[k].navigationProperty.length; j += 1) {
                            if (aEntityTypes[k].navigationProperty[j].name === sPathValue) {
                                return aEntityTypes[k].navigationProperty[j];
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
    static replaceWithAlias(sValue: any) {
        AnnotationParser._parserData.aliasesByLength.some(function (sAlias) {
            if (sValue.includes(sAlias + ".") && !sValue.includes("." + sAlias + ".")) {
                sValue = sValue.replace(sAlias + ".", AnnotationParser._parserData.aliases[sAlias] + ".");
                return true;
            }
            return false;
        });
        return sValue;
    }
    static getXPath(...args: any) {
        var xPath = {};
        var mParserData = AnnotationParser._parserData;
        xPath = {
            setNameSpace: function (outNode) {
                return outNode;
            },
            nsResolver: function (prefix) {
                var ns = {
                    "edmx": "http://docs.oasis-open.org/odata/ns/edmx",
                    "d": "http://docs.oasis-open.org/odata/ns/edm"
                };
                return ns[prefix] || null;
            },
            selectNodes: function (sPath, inNode) {
                var xmlNodes = mParserData.xmlDocument.evaluate(sPath, inNode, this.nsResolver, 7, null);
                xmlNodes.length = xmlNodes.snapshotLength;
                return xmlNodes;
            },
            nextNode: function (node, item) {
                return node.snapshotItem(item);
            },
            getNodeText: function (node) {
                return node.textContent;
            }
        };
        xPath.getPath = function (oNode) {
            var sPath = "";
            var sId = "getAttribute" in oNode ? oNode.getAttribute("id") : "";
            var sTagName = oNode.tagName ? oNode.tagName : "";
            if (sId) {
                sPath = "id(\"" + sId + "\")";
            }
            else if (oNode instanceof Document) {
                sPath = "/";
            }
            else if (sTagName.toLowerCase() === "body") {
                sPath = sTagName;
            }
            else if (oNode.parentNode) {
                var iPos = 1;
                for (var i = 0; i < oNode.parentNode.childNodes.length; ++i) {
                    if (oNode.parentNode.childNodes[i] === oNode) {
                        sPath = xPath.getPath(oNode.parentNode) + "/" + sTagName + "[" + iPos + "]";
                        break;
                    }
                    else if (oNode.parentNode.childNodes[i].nodeType === 1 && oNode.parentNode.childNodes[i].tagName === sTagName) {
                        ++iPos;
                    }
                }
            }
            else {
                Log.error("Wrong Input node - cannot find XPath to it: " + sTagName);
            }
            return sPath;
        };
        return xPath;
    }
}
var mAliasNodeIncludeList = {
    EnumMember: true,
    Path: true,
    PropertyPath: true,
    NavigationPropertyPath: true,
    AnnotationPath: true
};
var mTextNodeIncludeList = {
    Binary: true,
    Bool: true,
    Date: true,
    DateTimeOffset: true,
    Decimal: true,
    Duration: true,
    Float: true,
    Guid: true,
    Int: true,
    String: true,
    TimeOfDay: true,
    LabelElementReference: true,
    EnumMember: true,
    Path: true,
    PropertyPath: true,
    NavigationPropertyPath: true,
    AnnotationPath: true
};
var mMultipleArgumentDynamicExpressions = {
    And: true,
    Or: true,
    Eq: true,
    Ne: true,
    Gt: true,
    Ge: true,
    Lt: true,
    Le: true,
    If: true,
    Collection: true
};
function getQualifier(oAnnotationNode) {
    return oAnnotationNode.getAttribute("Qualifier") || oAnnotationNode.parentNode.nodeName === "Annotations" && oAnnotationNode.parentNode.getAttribute("Qualifier");
}