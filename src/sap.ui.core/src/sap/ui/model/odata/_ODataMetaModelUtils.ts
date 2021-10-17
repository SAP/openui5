import _AnnotationHelperBasics from "./_AnnotationHelperBasics";
import Log from "sap/base/Log";
import deepExtend from "sap/base/util/deepExtend";
import extend from "sap/base/util/extend";
var oBoolFalse = { "Bool": "false" }, oBoolTrue = { "Bool": "true" }, mDatePartSemantics2CommonTerm = {
    "fiscalyear": "IsFiscalYear",
    "fiscalyearperiod": "IsFiscalYearPeriod",
    "year": "IsCalendarYear",
    "yearmonth": "IsCalendarYearMonth",
    "yearmonthday": "IsCalendarDate",
    "yearquarter": "IsCalendarYearQuarter",
    "yearweek": "IsCalendarYearWeek"
}, mFilterRestrictions = {
    "interval": "SingleInterval",
    "multi-value": "MultiValue",
    "single-value": "SingleValue"
}, sLoggingModule = "sap.ui.model.odata.ODataMetaModel", mSemanticsToV4AnnotationPath = {
    "bday": "Contact",
    "city": "Contact/adr",
    "country": "Contact/adr",
    "email": "Contact/email",
    "familyname": "Contact/n",
    "givenname": "Contact/n",
    "honorific": "Contact/n",
    "middlename": "Contact/n",
    "name": "Contact",
    "nickname": "Contact",
    "note": "Contact",
    "org": "Contact",
    "org-role": "Contact",
    "org-unit": "Contact",
    "photo": "Contact",
    "pobox": "Contact/adr",
    "region": "Contact/adr",
    "street": "Contact/adr",
    "suffix": "Contact/n",
    "tel": "Contact/tel",
    "title": "Contact",
    "zip": "Contact/adr",
    "class": "Event",
    "dtend": "Event",
    "dtstart": "Event",
    "duration": "Event",
    "fbtype": "Event",
    "location": "Event",
    "status": "Event",
    "transp": "Event",
    "wholeday": "Event",
    "body": "Message",
    "from": "Message",
    "received": "Message",
    "sender": "Message",
    "subject": "Message",
    "completed": "Task",
    "due": "Task",
    "percent-complete": "Task",
    "priority": "Task"
}, rSemanticsWithTypes = /(\w+)(?:;type=([\w,]+))?/, mV2SemanticsToV4TypeInfo = {
    "email": {
        typeMapping: {
            "home": "home",
            "pref": "preferred",
            "work": "work"
        },
        v4EnumType: "com.sap.vocabularies.Communication.v1.ContactInformationType",
        v4PropertyAnnotation: "com.sap.vocabularies.Communication.v1.IsEmailAddress"
    },
    "tel": {
        typeMapping: {
            "cell": "cell",
            "fax": "fax",
            "home": "home",
            "pref": "preferred",
            "video": "video",
            "voice": "voice",
            "work": "work"
        },
        v4EnumType: "com.sap.vocabularies.Communication.v1.PhoneType",
        v4PropertyAnnotation: "com.sap.vocabularies.Communication.v1.IsPhoneNumber"
    }
}, mV2ToV4 = {
    creatable: {
        "Org.OData.Capabilities.V1.InsertRestrictions": { "Insertable": oBoolFalse }
    },
    pageable: {
        "Org.OData.Capabilities.V1.SkipSupported": oBoolFalse,
        "Org.OData.Capabilities.V1.TopSupported": oBoolFalse
    },
    "requires-filter": {
        "Org.OData.Capabilities.V1.FilterRestrictions": { "RequiresFilter": oBoolTrue }
    },
    topable: {
        "Org.OData.Capabilities.V1.TopSupported": oBoolFalse
    }
}, mV2ToV4Attribute = {
    "city": "locality",
    "email": "address",
    "familyname": "surname",
    "givenname": "given",
    "honorific": "prefix",
    "middlename": "additional",
    "name": "fn",
    "org-role": "role",
    "org-unit": "orgunit",
    "percent-complete": "percentcomplete",
    "tel": "uri",
    "zip": "code"
}, mV2ToV4PropertyCollection = {
    "sap:filterable": ["Org.OData.Capabilities.V1.FilterRestrictions", "NonFilterableProperties"],
    "sap:required-in-filter": ["Org.OData.Capabilities.V1.FilterRestrictions", "RequiredProperties"],
    "sap:sortable": ["Org.OData.Capabilities.V1.SortRestrictions", "NonSortableProperties"]
}, rValueList = /^com\.sap\.vocabularies\.Common\.v1\.ValueList(#.*)?$/, iWARNING = Log.Level.WARNING, Utils;
Utils = {
    addEntitySetAnnotation: function (o, oExtension, sTypeClass, sNonDefaultValue, bDeepCopy) {
        if (sTypeClass === "EntitySet" && oExtension.value === sNonDefaultValue) {
            if (bDeepCopy) {
                deepExtend(o, mV2ToV4[oExtension.name]);
            }
            else {
                extend(o, mV2ToV4[oExtension.name]);
            }
        }
    },
    addFilterRestriction: function (oProperty, oEntitySet) {
        var aFilterRestrictions, sFilterRestrictionValue = mFilterRestrictions[oProperty["sap:filter-restriction"]];
        if (!sFilterRestrictionValue) {
            if (Log.isLoggable(iWARNING, sLoggingModule)) {
                Log.warning("Unsupported sap:filter-restriction: " + oProperty["sap:filter-restriction"], oEntitySet.entityType + "." + oProperty.name, sLoggingModule);
            }
            return;
        }
        aFilterRestrictions = oEntitySet["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"] || [];
        aFilterRestrictions.push({
            "Property": { "PropertyPath": oProperty.name },
            "AllowedExpressions": {
                "EnumMember": "com.sap.vocabularies.Common.v1.FilterExpressionType/" + sFilterRestrictionValue
            }
        });
        oEntitySet["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"] = aFilterRestrictions;
    },
    addNavigationFilterRestriction: function (oNavigationProperty, oEntitySet) {
        var oNavigationRestrictions = oEntitySet["Org.OData.Capabilities.V1.NavigationRestrictions"] || {};
        oNavigationRestrictions.RestrictedProperties = oNavigationRestrictions.RestrictedProperties || [];
        oNavigationRestrictions.RestrictedProperties.push({
            "FilterRestrictions": {
                "Filterable": oBoolFalse
            },
            "NavigationProperty": {
                "NavigationPropertyPath": oNavigationProperty.name
            }
        });
        oEntitySet["Org.OData.Capabilities.V1.NavigationRestrictions"] = oNavigationRestrictions;
    },
    addPropertyToAnnotation: function (sV2AnnotationName, oEntitySet, oProperty) {
        var aNames = mV2ToV4PropertyCollection[sV2AnnotationName], sTerm = aNames[0], sCollection = aNames[1], oAnnotation = oEntitySet[sTerm] || {}, aCollection = oAnnotation[sCollection] || [];
        aCollection.push({ "PropertyPath": oProperty.name });
        oAnnotation[sCollection] = aCollection;
        oEntitySet[sTerm] = oAnnotation;
    },
    addSapSemantics: function (oType) {
        if (oType.property) {
            oType.property.forEach(function (oProperty) {
                var aAnnotationParts, bIsCollection, aMatches, sSubStructure, vTmp, sV2Semantics = oProperty["sap:semantics"], sV4Annotation, sV4AnnotationPath, oV4Annotation, oV4TypeInfo, sV4TypeList;
                if (!sV2Semantics) {
                    return;
                }
                if (sV2Semantics === "url") {
                    oProperty["Org.OData.Core.V1.IsURL"] = oBoolTrue;
                    return;
                }
                if (sV2Semantics in mDatePartSemantics2CommonTerm) {
                    sV4Annotation = "com.sap.vocabularies.Common.v1." + mDatePartSemantics2CommonTerm[sV2Semantics];
                    oProperty[sV4Annotation] = oBoolTrue;
                    return;
                }
                aMatches = rSemanticsWithTypes.exec(sV2Semantics);
                if (!aMatches) {
                    if (Log.isLoggable(iWARNING, sLoggingModule)) {
                        Log.warning("Unsupported sap:semantics: " + sV2Semantics, oType.name + "." + oProperty.name, sLoggingModule);
                    }
                    return;
                }
                if (aMatches[2]) {
                    sV2Semantics = aMatches[1];
                    sV4TypeList = Utils.getV4TypesForV2Semantics(sV2Semantics, aMatches[2], oProperty, oType);
                }
                oV4TypeInfo = mV2SemanticsToV4TypeInfo[sV2Semantics];
                bIsCollection = sV2Semantics === "tel" || sV2Semantics === "email";
                sV4AnnotationPath = mSemanticsToV4AnnotationPath[sV2Semantics];
                if (sV4AnnotationPath) {
                    aAnnotationParts = sV4AnnotationPath.split("/");
                    sV4Annotation = "com.sap.vocabularies.Communication.v1." + aAnnotationParts[0];
                    oType[sV4Annotation] = oType[sV4Annotation] || {};
                    oV4Annotation = oType[sV4Annotation];
                    sSubStructure = aAnnotationParts[1];
                    if (sSubStructure) {
                        oV4Annotation[sSubStructure] = oV4Annotation[sSubStructure] || (bIsCollection ? [] : {});
                        if (bIsCollection) {
                            vTmp = {};
                            oV4Annotation[sSubStructure].push(vTmp);
                            oV4Annotation = vTmp;
                        }
                        else {
                            oV4Annotation = oV4Annotation[sSubStructure];
                        }
                    }
                    oV4Annotation[mV2ToV4Attribute[sV2Semantics] || sV2Semantics] = { "Path": oProperty.name };
                    if (sV4TypeList) {
                        oV4Annotation.type = { "EnumMember": sV4TypeList };
                    }
                }
                if (oV4TypeInfo) {
                    oProperty[oV4TypeInfo.v4PropertyAnnotation] = oProperty[oV4TypeInfo.v4PropertyAnnotation] || oBoolTrue;
                }
            });
        }
    },
    addUnitAnnotations: function (aSchemas, oMetaModel) {
        function processTypes(aTypes) {
            (aTypes || []).forEach(function (oType) {
                (oType.property || []).forEach(function (oProperty) {
                    var sAnnotationName, oInterface, sSemantics, oTarget, oUnitPath, sUnitPath = oProperty["sap:unit"], oUnitProperty;
                    if (sUnitPath) {
                        oInterface = {
                            getModel: function () {
                                return oMetaModel;
                            },
                            getPath: function () {
                                return oType.$path;
                            }
                        };
                        oUnitPath = { "Path": sUnitPath };
                        oTarget = _AnnotationHelperBasics.followPath(oInterface, oUnitPath);
                        if (oTarget && oTarget.resolvedPath) {
                            oUnitProperty = oMetaModel.getProperty(oTarget.resolvedPath);
                            sSemantics = oUnitProperty["sap:semantics"];
                            if (sSemantics === "unit-of-measure") {
                                sAnnotationName = "Org.OData.Measures.V1.Unit";
                            }
                            else if (sSemantics === "currency-code") {
                                sAnnotationName = "Org.OData.Measures.V1.ISOCurrency";
                            }
                            else if (Log.isLoggable(iWARNING, sLoggingModule)) {
                                Log.warning("Unsupported sap:semantics='" + sSemantics + "' at sap:unit='" + sUnitPath + "'; " + "expected 'currency-code' or 'unit-of-measure'", oType.namespace + "." + oType.name + "/" + oProperty.name, sLoggingModule);
                            }
                            if (sAnnotationName && !(sAnnotationName in oProperty)) {
                                oProperty[sAnnotationName] = oUnitPath;
                            }
                        }
                        else if (Log.isLoggable(iWARNING, sLoggingModule)) {
                            Log.warning("Path '" + sUnitPath + "' for sap:unit cannot be resolved", oType.namespace + "." + oType.name + "/" + oProperty.name, sLoggingModule);
                        }
                    }
                });
            });
        }
        aSchemas.forEach(function (oSchema) {
            processTypes(oSchema.complexType);
            processTypes(oSchema.entityType);
        });
    },
    addV4Annotation: function (o, oExtension, sTypeClass) {
        switch (oExtension.name) {
            case "aggregation-role":
                if (oExtension.value === "dimension") {
                    o["com.sap.vocabularies.Analytics.v1.Dimension"] = oBoolTrue;
                }
                else if (oExtension.value === "measure") {
                    o["com.sap.vocabularies.Analytics.v1.Measure"] = oBoolTrue;
                }
                break;
            case "display-format":
                if (oExtension.value === "NonNegative") {
                    o["com.sap.vocabularies.Common.v1.IsDigitSequence"] = oBoolTrue;
                }
                else if (oExtension.value === "UpperCase") {
                    o["com.sap.vocabularies.Common.v1.IsUpperCase"] = oBoolTrue;
                }
                break;
            case "pageable":
            case "topable":
                Utils.addEntitySetAnnotation(o, oExtension, sTypeClass, "false", false);
                break;
            case "creatable":
                Utils.addEntitySetAnnotation(o, oExtension, sTypeClass, "false", true);
                break;
            case "deletable":
            case "deletable-path":
                Utils.handleXableAndXablePath(o, oExtension, sTypeClass, "Org.OData.Capabilities.V1.DeleteRestrictions", "Deletable");
                break;
            case "updatable":
            case "updatable-path":
                Utils.handleXableAndXablePath(o, oExtension, sTypeClass, "Org.OData.Capabilities.V1.UpdateRestrictions", "Updatable");
                break;
            case "requires-filter":
                Utils.addEntitySetAnnotation(o, oExtension, sTypeClass, "true", true);
                break;
            case "field-control":
                o["com.sap.vocabularies.Common.v1.FieldControl"] = { "Path": oExtension.value };
                break;
            case "heading":
                o["com.sap.vocabularies.Common.v1.Heading"] = { "String": oExtension.value };
                break;
            case "label":
                o["com.sap.vocabularies.Common.v1.Label"] = { "String": oExtension.value };
                break;
            case "precision":
                o["Org.OData.Measures.V1.Scale"] = { "Path": oExtension.value };
                break;
            case "quickinfo":
                o["com.sap.vocabularies.Common.v1.QuickInfo"] = { "String": oExtension.value };
                break;
            case "text":
                o["com.sap.vocabularies.Common.v1.Text"] = { "Path": oExtension.value };
                break;
            case "visible":
                if (oExtension.value === "false") {
                    o["com.sap.vocabularies.Common.v1.FieldControl"] = {
                        "EnumMember": "com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
                    };
                    o["com.sap.vocabularies.UI.v1.Hidden"] = oBoolTrue;
                }
                break;
            default:
        }
    },
    calculateEntitySetAnnotations: function (oEntitySet, oEntityType) {
        if (oEntityType.property) {
            oEntityType.property.forEach(function (oProperty) {
                if (oProperty["sap:filterable"] === "false") {
                    Utils.addPropertyToAnnotation("sap:filterable", oEntitySet, oProperty);
                }
                if (oProperty["sap:required-in-filter"] === "true") {
                    Utils.addPropertyToAnnotation("sap:required-in-filter", oEntitySet, oProperty);
                }
                if (oProperty["sap:sortable"] === "false") {
                    Utils.addPropertyToAnnotation("sap:sortable", oEntitySet, oProperty);
                }
                if (oProperty["sap:filter-restriction"]) {
                    Utils.addFilterRestriction(oProperty, oEntitySet);
                }
            });
        }
        if (oEntityType.navigationProperty) {
            oEntityType.navigationProperty.forEach(function (oNavigationProperty) {
                if (oNavigationProperty["sap:filterable"] === "false") {
                    Utils.addNavigationFilterRestriction(oNavigationProperty, oEntitySet);
                    Utils.addPropertyToAnnotation("sap:filterable", oEntitySet, oNavigationProperty);
                }
                Utils.handleCreatableNavigationProperty(oEntitySet, oNavigationProperty);
            });
        }
    },
    findIndex: function (aArray, vExpectedPropertyValue, sPropertyName) {
        var i, n;
        sPropertyName = sPropertyName || "name";
        if (aArray) {
            for (i = 0, n = aArray.length; i < n; i += 1) {
                if (aArray[i][sPropertyName] === vExpectedPropertyValue) {
                    return i;
                }
            }
        }
        return -1;
    },
    findObject: function (aArray, vExpectedPropertyValue, sPropertyName) {
        var iIndex = Utils.findIndex(aArray, vExpectedPropertyValue, sPropertyName);
        return iIndex < 0 ? null : aArray[iIndex];
    },
    getChildAnnotations: function (oAnnotations, sQualifiedName, bInContainer) {
        var o = bInContainer ? oAnnotations.EntityContainer : oAnnotations.propertyAnnotations;
        return o && o[sQualifiedName] || {};
    },
    getFromContainer: function (oEntityContainer, sArrayName, sName, bAsPath) {
        var k, vResult = bAsPath ? undefined : null;
        if (oEntityContainer) {
            k = Utils.findIndex(oEntityContainer[sArrayName], sName);
            if (k >= 0) {
                vResult = bAsPath ? oEntityContainer.$path + "/" + sArrayName + "/" + k : oEntityContainer[sArrayName][k];
            }
        }
        return vResult;
    },
    getObject: function (vModel, sArrayName, sQualifiedName, bAsPath) {
        var aArray, vResult = bAsPath ? undefined : null, oSchema, iSeparatorPos, sNamespace, sName;
        sQualifiedName = sQualifiedName || "";
        iSeparatorPos = sQualifiedName.lastIndexOf(".");
        sNamespace = sQualifiedName.slice(0, iSeparatorPos);
        sName = sQualifiedName.slice(iSeparatorPos + 1);
        oSchema = Utils.getSchema(vModel, sNamespace);
        if (oSchema) {
            aArray = oSchema[sArrayName];
            if (aArray) {
                aArray.forEach(function (oThing) {
                    if (oThing.name === sName) {
                        vResult = bAsPath ? oThing.$path : oThing;
                        return false;
                    }
                });
            }
        }
        return vResult;
    },
    getSchema: function (vModel, sNamespace) {
        var oSchema = null, aSchemas = Array.isArray(vModel) ? vModel : vModel.getObject("/dataServices/schema");
        if (aSchemas) {
            aSchemas.forEach(function (o) {
                if (o.namespace === sNamespace) {
                    oSchema = o;
                    return false;
                }
            });
        }
        return oSchema;
    },
    getV4TypesForV2Semantics: function (sSemantics, sTypesList, oProperty, oType) {
        var aResult = [], oV4TypeInfo = mV2SemanticsToV4TypeInfo[sSemantics];
        if (oV4TypeInfo) {
            sTypesList.split(",").forEach(function (sType) {
                var sTargetType = oV4TypeInfo.typeMapping[sType];
                if (sTargetType) {
                    aResult.push(oV4TypeInfo.v4EnumType + "/" + sTargetType);
                }
                else if (Log.isLoggable(iWARNING, sLoggingModule)) {
                    Log.warning("Unsupported type for sap:semantics: " + sType, oType.name + "." + oProperty.name, sLoggingModule);
                }
            });
        }
        return aResult.join(" ");
    },
    getValueLists: function (oProperty) {
        var aMatches, sName, sQualifier, mValueLists = {};
        for (sName in oProperty) {
            aMatches = rValueList.exec(sName);
            if (aMatches) {
                sQualifier = (aMatches[1] || "").slice(1);
                mValueLists[sQualifier] = oProperty[sName];
            }
        }
        return mValueLists;
    },
    handleCreatableNavigationProperty: function (oEntitySet, oNavigationProperty) {
        var sCreatable = oNavigationProperty["sap:creatable"], sCreatablePath = oNavigationProperty["sap:creatable-path"], oInsertRestrictions, oNonInsertable = { "NavigationPropertyPath": oNavigationProperty.name }, aNonInsertableNavigationProperties;
        if (sCreatable && sCreatablePath) {
            Log.warning("Inconsistent service", "Use either 'sap:creatable' or 'sap:creatable-path' at navigation property " + "'" + oEntitySet.entityType + "/" + oNavigationProperty.name + "'", sLoggingModule);
            sCreatable = "false";
            sCreatablePath = undefined;
        }
        if (sCreatable === "false" || sCreatablePath) {
            oInsertRestrictions = oEntitySet["Org.OData.Capabilities.V1.InsertRestrictions"] = oEntitySet["Org.OData.Capabilities.V1.InsertRestrictions"] || {};
            aNonInsertableNavigationProperties = oInsertRestrictions["NonInsertableNavigationProperties"] = oInsertRestrictions["NonInsertableNavigationProperties"] || [];
            if (sCreatablePath) {
                oNonInsertable = {
                    "If": [{
                            "Not": {
                                "Path": sCreatablePath
                            }
                        }, oNonInsertable]
                };
            }
            aNonInsertableNavigationProperties.push(oNonInsertable);
        }
    },
    handleXableAndXablePath: function (o, oExtension, sTypeClass, sTerm, sProperty) {
        var sV2Annotation = sProperty.toLowerCase(), oValue;
        if (sTypeClass !== "EntitySet") {
            return;
        }
        if (o["sap:" + sV2Annotation] && o["sap:" + sV2Annotation + "-path"]) {
            Log.warning("Inconsistent service", "Use either 'sap:" + sV2Annotation + "' or 'sap:" + sV2Annotation + "-path'" + " at entity set '" + o.name + "'", sLoggingModule);
            oValue = oBoolFalse;
        }
        else if (sV2Annotation !== oExtension.name) {
            oValue = { "Path": oExtension.value };
        }
        else if (oExtension.value === "false") {
            oValue = oBoolFalse;
        }
        if (oValue) {
            o[sTerm] = o[sTerm] || {};
            o[sTerm][sProperty] = oValue;
        }
    },
    liftSAPData: function (o, sTypeClass) {
        if (!o.extensions) {
            return;
        }
        o.extensions.forEach(function (oExtension) {
            if (oExtension.namespace === "http://www.sap.com/Protocols/SAPData") {
                o["sap:" + oExtension.name] = oExtension.value;
                Utils.addV4Annotation(o, oExtension, sTypeClass);
            }
        });
        switch (sTypeClass) {
            case "Property":
                if (o["sap:updatable"] === "false") {
                    if (o["sap:creatable"] === "false") {
                        o["Org.OData.Core.V1.Computed"] = oBoolTrue;
                    }
                    else {
                        o["Org.OData.Core.V1.Immutable"] = oBoolTrue;
                    }
                }
                break;
            case "EntitySet":
                if (o["sap:searchable"] !== "true") {
                    o["Org.OData.Capabilities.V1.SearchRestrictions"] = { "Searchable": oBoolFalse };
                }
                break;
            default:
        }
    },
    merge: function (oAnnotations, oData, oMetaModel) {
        var aSchemas = oData.dataServices.schema;
        if (!aSchemas) {
            return;
        }
        aSchemas.forEach(function (oSchema, i) {
            var sSchemaVersion;
            delete oSchema.annotations;
            Utils.liftSAPData(oSchema);
            oSchema.$path = "/dataServices/schema/" + i;
            sSchemaVersion = oSchema["sap:schema-version"];
            if (sSchemaVersion) {
                oSchema["Org.Odata.Core.V1.SchemaVersion"] = {
                    String: sSchemaVersion
                };
            }
            extend(oSchema, oAnnotations[oSchema.namespace]);
            Utils.visitParents(oSchema, oAnnotations, "association", function (oAssociation, mChildAnnotations) {
                Utils.visitChildren(oAssociation.end, mChildAnnotations);
            });
            Utils.visitParents(oSchema, oAnnotations, "complexType", function (oComplexType, mChildAnnotations) {
                Utils.visitChildren(oComplexType.property, mChildAnnotations, "Property");
                Utils.addSapSemantics(oComplexType);
            });
            Utils.visitParents(oSchema, oAnnotations, "entityType", Utils.visitEntityType);
        });
        aSchemas.forEach(function (oSchema) {
            Utils.visitParents(oSchema, oAnnotations, "entityContainer", function (oEntityContainer, mChildAnnotations) {
                Utils.visitChildren(oEntityContainer.associationSet, mChildAnnotations);
                Utils.visitChildren(oEntityContainer.entitySet, mChildAnnotations, "EntitySet", aSchemas);
                Utils.visitChildren(oEntityContainer.functionImport, mChildAnnotations, "", null, Utils.visitParameters.bind(this, oAnnotations, oSchema, oEntityContainer));
            });
        });
        Utils.addUnitAnnotations(aSchemas, oMetaModel);
    },
    visitChildren: function (aChildren, mChildAnnotations, sTypeClass, aSchemas, fnCallback, iStartIndex) {
        if (!aChildren) {
            return;
        }
        if (iStartIndex) {
            aChildren = aChildren.slice(iStartIndex);
        }
        aChildren.forEach(function (oChild) {
            Utils.liftSAPData(oChild, sTypeClass);
        });
        aChildren.forEach(function (oChild) {
            var oEntityType;
            if (sTypeClass === "EntitySet") {
                oEntityType = Utils.getObject(aSchemas, "entityType", oChild.entityType);
                Utils.calculateEntitySetAnnotations(oChild, oEntityType);
            }
            if (fnCallback) {
                fnCallback(oChild);
            }
            extend(oChild, mChildAnnotations[oChild.name || oChild.role]);
        });
    },
    visitEntityType: function (oEntityType, mChildAnnotations) {
        Utils.visitChildren(oEntityType.property, mChildAnnotations, "Property");
        Utils.visitChildren(oEntityType.navigationProperty, mChildAnnotations);
        Utils.addSapSemantics(oEntityType);
    },
    visitParameters: function (oAnnotations, oSchema, oEntityContainer, oFunctionImport) {
        var mAnnotations;
        if (!oFunctionImport.parameter) {
            return;
        }
        mAnnotations = Utils.getChildAnnotations(oAnnotations, oSchema.namespace + "." + oEntityContainer.name, true);
        oFunctionImport.parameter.forEach(function (oParam) {
            Utils.liftSAPData(oParam);
            extend(oParam, mAnnotations[oFunctionImport.name + "/" + oParam.name]);
        });
    },
    visitParents: function (oSchema, oAnnotations, sArrayName, fnCallback, iIndex) {
        var aParents = oSchema[sArrayName];
        function visitParent(oParent, j) {
            var sQualifiedName = oSchema.namespace + "." + oParent.name, mChildAnnotations = Utils.getChildAnnotations(oAnnotations, sQualifiedName, sArrayName === "entityContainer");
            Utils.liftSAPData(oParent);
            oParent.namespace = oSchema.namespace;
            oParent.$path = oSchema.$path + "/" + sArrayName + "/" + j;
            fnCallback(oParent, mChildAnnotations);
            extend(oParent, oAnnotations[sQualifiedName]);
        }
        if (!aParents) {
            return;
        }
        if (iIndex !== undefined) {
            visitParent(aParents[iIndex], iIndex);
        }
        else {
            aParents.forEach(visitParent);
        }
    }
};