import _Helper from "./_Helper";
import _MetadataConverter from "./_MetadataConverter";
import Log from "sap/base/Log";
var sClassName = "sap.ui.model.odata.v4.lib._V2MetadataConverter", rHttpMethods = /^(?:DELETE|GET|MERGE|PATCH|POST|PUT)$/, sEdmxNamespace = "http://schemas.microsoft.com/ado/2007/06/edmx", sMicrosoftNamespace = "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata", sSapNamespace = "http://www.sap.com/Protocols/SAPData", mV2toV4 = {
    "creatable": {
        "property": "Insertable",
        "term": "@Org.OData.Capabilities.V1.InsertRestrictions"
    },
    "deletable": {
        "property": "Deletable",
        "term": "@Org.OData.Capabilities.V1.DeleteRestrictions"
    },
    "deletable-path": {
        "property": "Deletable",
        "term": "@Org.OData.Capabilities.V1.DeleteRestrictions"
    },
    "field-control": {
        "term": "@com.sap.vocabularies.Common.v1.FieldControl"
    },
    "heading": {
        "term": "@com.sap.vocabularies.Common.v1.Heading"
    },
    "label": {
        "term": "@com.sap.vocabularies.Common.v1.Label"
    },
    "precision": {
        "term": "@Org.OData.Measures.V1.Scale"
    },
    "quickinfo": {
        "term": "@com.sap.vocabularies.Common.v1.QuickInfo"
    },
    "requires-filter": {
        "property": "RequiresFilter",
        "term": "@Org.OData.Capabilities.V1.FilterRestrictions"
    },
    "searchable": {
        "property": "Searchable",
        "term": "@Org.OData.Capabilities.V1.SearchRestrictions"
    },
    "text": {
        "term": "@com.sap.vocabularies.Common.v1.Text"
    },
    "topable": {
        "term": "@Org.OData.Capabilities.V1.TopSupported"
    },
    "updatable": {
        "property": "Updatable",
        "term": "@Org.OData.Capabilities.V1.UpdateRestrictions"
    },
    "updatable-path": {
        "property": "Updatable",
        "term": "@Org.OData.Capabilities.V1.UpdateRestrictions"
    }
}, mV2toV4ComplexSemantics = {
    "bday": {
        TermName: "Contact"
    },
    "city": {
        Path: "adr",
        TermName: "Contact",
        V4Attribute: "locality"
    },
    "country": {
        Path: "adr",
        TermName: "Contact"
    },
    "email": {
        Path: "address",
        TermName: "Contact",
        V4Attribute: "uri",
        typeMapping: {
            "home": "home",
            "pref": "preferred",
            "work": "work"
        },
        v4EnumType: "com.sap.vocabularies.Communication.v1.ContactInformationType",
        v4PropertyAnnotation: "@com.sap.vocabularies.Communication.v1.IsEmailAddress"
    },
    "familyname": {
        Path: "n",
        TermName: "Contact",
        V4Attribute: "surname"
    },
    "givenname": {
        Path: "n",
        TermName: "Contact",
        V4Attribute: "given"
    },
    "honorific": {
        Path: "n",
        TermName: "Contact",
        V4Attribute: "prefix"
    },
    "middlename": {
        Path: "n",
        TermName: "Contact",
        V4Attribute: "additional"
    },
    "name": {
        TermName: "Contact",
        V4Attribute: "fn"
    },
    "nickname": {
        TermName: "Contact"
    },
    "note": {
        TermName: "Contact"
    },
    "org": {
        TermName: "Contact"
    },
    "org-role": {
        TermName: "Contact",
        V4Attribute: "role"
    },
    "org-unit": {
        TermName: "Contact",
        V4Attribute: "orgunit"
    },
    "photo": {
        TermName: "Contact"
    },
    "pobox": {
        Path: "adr",
        TermName: "Contact"
    },
    "region": {
        Path: "adr",
        TermName: "Contact"
    },
    "street": {
        Path: "adr",
        TermName: "Contact"
    },
    "suffix": {
        Path: "n",
        TermName: "Contact"
    },
    "tel": {
        Path: "tel",
        TermName: "Contact",
        V4Attribute: "uri",
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
        v4PropertyAnnotation: "@com.sap.vocabularies.Communication.v1.IsPhoneNumber"
    },
    "title": {
        TermName: "Contact"
    },
    "zip": {
        Path: "adr",
        TermName: "Contact",
        V4Attribute: "code"
    },
    "class": {
        TermName: "Event"
    },
    "dtend": {
        TermName: "Event"
    },
    "dtstart": {
        TermName: "Event"
    },
    "duration": {
        TermName: "Event"
    },
    "fbtype": {
        TermName: "Event"
    },
    "location": {
        TermName: "Event"
    },
    "status": {
        TermName: "Event"
    },
    "transp": {
        TermName: "Event"
    },
    "wholeday": {
        TermName: "Event"
    },
    "body": {
        TermName: "Message"
    },
    "from": {
        TermName: "Message"
    },
    "received": {
        TermName: "Message"
    },
    "sender": {
        TermName: "Message"
    },
    "subject": {
        TermName: "Message"
    },
    "completed": {
        TermName: "Task"
    },
    "due": {
        TermName: "Task"
    },
    "percent-complete": {
        TermName: "Task",
        V4Attribute: "percentcomplete"
    },
    "priority": {
        TermName: "Task"
    }
}, mV2toV4SimpleSemantics = {
    "fiscalyear": "@com.sap.vocabularies.Common.v1.IsFiscalYear",
    "fiscalyearperiod": "@com.sap.vocabularies.Common.v1.IsFiscalYearPeriod",
    "year": "@com.sap.vocabularies.Common.v1.IsCalendarYear",
    "yearmonth": "@com.sap.vocabularies.Common.v1.IsCalendarYearMonth",
    "yearmonthday": "@com.sap.vocabularies.Common.v1.IsCalendarDate",
    "yearquarter": "@com.sap.vocabularies.Common.v1.IsCalendarYearQuarter",
    "yearweek": "@com.sap.vocabularies.Common.v1.IsCalendarYearWeek",
    "url": "@Org.OData.Core.V1.IsURL"
};
function Annotatable(oConverter, sTarget) {
    var oParent = oConverter.oAnnotatable;
    if (oParent) {
        sTarget = _Helper.buildPath(oParent.sPath, sTarget);
    }
    this.oConverter = oConverter;
    this.sPath = sTarget;
    this.oParent = oParent;
    this.mSapAttributes = oConverter.mSapAttributes;
    this.mAnnotationsForTarget = null;
}
Annotatable.prototype.annotate = function (sTerm, vValue) {
    this.getTarget()[sTerm] = vValue;
};
Annotatable.prototype.consume = function (sName) {
    return this.oConverter.consumeSapAnnotation(sName);
};
Annotatable.prototype.convert = function (sV2Name, vValue) {
    var oAnnotation, mAnnotationInfo;
    if (vValue === undefined || vValue === "") {
        return;
    }
    mAnnotationInfo = mV2toV4[sV2Name];
    if (mAnnotationInfo.property) {
        oAnnotation = this.getOrCreateAnnotationRecord(mAnnotationInfo.term);
        oAnnotation[mAnnotationInfo.property] = vValue;
    }
    else {
        this.annotate(mAnnotationInfo.term, vValue);
    }
};
Annotatable.prototype.getOrCreateAnnotationRecord = function (sTerm) {
    return this.oConverter.getOrCreateObject(this.getTarget(), sTerm);
};
Annotatable.prototype.getTarget = function () {
    if (!this.mAnnotationsForTarget) {
        this.mAnnotationsForTarget = this.oConverter.convertedV2Annotations[this.sPath] = {};
    }
    return this.mAnnotationsForTarget;
};
Annotatable.prototype.peek = function (sName) {
    return this.oConverter.mSapAnnotations[sName];
};
function _V2MetadataConverter() {
    this.association = null;
    this.associations = {};
    this.associationSet = null;
    this.associationSets = [];
    this.aBoundOperations = [];
    this.constraintRole = null;
    this.convertedV2Annotations = {};
    this.defaultEntityContainer = null;
    this.mEntityContainersOfSchema = {};
    this.mEntityType2EntitySetAnnotation = {};
    this.mProperty2Semantics = {};
    this.sPropertyName = null;
    this.navigationProperties = [];
    this.mSapAnnotations = {};
    this.sTypeName = null;
    this.mProperty2Unit = {};
    _MetadataConverter.call(this);
}
_V2MetadataConverter.prototype = Object.create(_MetadataConverter.prototype);
_V2MetadataConverter.prototype.collectSapAnnotations = function (oElement) {
    var oAttribute, oAttributeList = oElement.attributes, i, n;
    this.mSapAnnotations = {};
    for (i = 0, n = oAttributeList.length; i < n; i += 1) {
        oAttribute = oAttributeList.item(i);
        if (oAttribute.namespaceURI === sSapNamespace && oAttribute.localName !== "content-version") {
            this.mSapAnnotations[oAttribute.localName] = oAttribute.value;
        }
    }
};
_V2MetadataConverter.prototype.consumeSapAnnotation = function (sName) {
    var sValue = this.mSapAnnotations[sName];
    delete this.mSapAnnotations[sName];
    return sValue;
};
_V2MetadataConverter.prototype.convertEntitySetAnnotation = function (oAnnotatable, sName) {
    var sConflictingV2Annotation, sValue;
    switch (sName) {
        case "creatable":
        case "deletable":
        case "updatable":
            if (oAnnotatable.peek(sName) === "false") {
                oAnnotatable.convert(sName, false);
            }
            break;
        case "deletable-path":
        case "updatable-path":
            sConflictingV2Annotation = sName.slice(0, 9);
            sValue = oAnnotatable.consume(sName);
            if (oAnnotatable.peek(sConflictingV2Annotation)) {
                oAnnotatable.convert(sName, false);
                Log.warning("Inconsistent metadata in '" + this.url + "'", "Use either 'sap:" + sConflictingV2Annotation + "' or 'sap:" + sConflictingV2Annotation + "-path'" + " at entity set '" + oAnnotatable.sPath + "'", sClassName);
            }
            else {
                oAnnotatable.convert(sName, {
                    $Path: sValue
                });
            }
            break;
        case "label":
            this.convertLabel(oAnnotatable);
            break;
        case "pageable":
            sValue = oAnnotatable.consume(sName);
            if (sValue === "false") {
                oAnnotatable.annotate("@Org.OData.Capabilities.V1.SkipSupported", false);
                oAnnotatable.annotate("@Org.OData.Capabilities.V1.TopSupported", false);
            }
            break;
        case "requires-filter":
            sValue = oAnnotatable.consume(sName);
            if (sValue === "true") {
                oAnnotatable.convert(sName, true);
            }
            break;
        case "topable":
            sValue = oAnnotatable.consume(sName);
            if (sValue === "false") {
                oAnnotatable.convert(sName, false);
            }
            break;
        default:
    }
};
_V2MetadataConverter.prototype.convertLabel = function (oAnnotatable) {
    oAnnotatable.convert("label", oAnnotatable.consume("label"));
};
_V2MetadataConverter.prototype.convertPropertyAnnotation = function (oAnnotatable, sName) {
    var sValue;
    switch (sName) {
        case "heading":
        case "label":
        case "quickinfo":
            oAnnotatable.convert(sName, oAnnotatable.consume(sName));
            break;
        case "field-control":
        case "precision":
        case "text":
            oAnnotatable.convert(sName, {
                $Path: oAnnotatable.consume(sName)
            });
            break;
        case "aggregation-role":
            sValue = oAnnotatable.consume(sName);
            if (sValue === "dimension") {
                oAnnotatable.annotate("@com.sap.vocabularies.Analytics.v1.Dimension", true);
            }
            else if (sValue === "measure") {
                oAnnotatable.annotate("@com.sap.vocabularies.Analytics.v1.Measure", true);
            }
            break;
        case "display-format":
            sValue = oAnnotatable.consume(sName);
            if (sValue === "NonNegative") {
                oAnnotatable.annotate("@com.sap.vocabularies.Common.v1.IsDigitSequence", true);
            }
            else if (sValue === "UpperCase") {
                oAnnotatable.annotate("@com.sap.vocabularies.Common.v1.IsUpperCase", true);
            }
            break;
        case "semantics":
            this.convertPropertySemanticsAnnotation(oAnnotatable);
            break;
        case "unit":
            this.mProperty2Unit[oAnnotatable.sPath] = oAnnotatable.consume("unit");
            break;
        case "visible":
            sValue = oAnnotatable.consume(sName);
            if (sValue === "false") {
                oAnnotatable.annotate("@com.sap.vocabularies.UI.v1.Hidden", true);
                oAnnotatable.annotate("@com.sap.vocabularies.Common.v1.FieldControl", {
                    $EnumMember: "com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
                });
            }
            break;
        default:
    }
};
_V2MetadataConverter.prototype.convertPropertySemanticsAnnotation = function (oAnnotatable) {
    var oAnnotations, sEnum, oPath, aResult, oSemantics, aValue = oAnnotatable.peek("semantics").split(";"), sValue = aValue[0], oV2toV4ComplexSemantic = mV2toV4ComplexSemantics[sValue];
    if (sValue === "unit-of-measure" || sValue === "currency-code") {
        this.mProperty2Semantics[oAnnotatable.sPath] = oAnnotatable.consume("semantics");
    }
    else if (mV2toV4SimpleSemantics[sValue]) {
        oAnnotatable.annotate(mV2toV4SimpleSemantics[sValue], true);
        oAnnotatable.consume("semantics");
    }
    else if (oV2toV4ComplexSemantic) {
        oPath = {
            "$Path": this.sPropertyName
        };
        oAnnotations = oAnnotatable.oParent.getOrCreateAnnotationRecord("@com.sap.vocabularies.Communication.v1." + oV2toV4ComplexSemantic.TermName);
        if (oV2toV4ComplexSemantic.Path) {
            oSemantics = this.getOrCreateObject(oAnnotations, oV2toV4ComplexSemantic.Path);
            oSemantics[oV2toV4ComplexSemantic.V4Attribute || sValue] = oPath;
            if (oV2toV4ComplexSemantic.v4PropertyAnnotation) {
                oAnnotatable.annotate(oV2toV4ComplexSemantic.v4PropertyAnnotation, true);
                if (aValue[1]) {
                    aResult = [];
                    sEnum = aValue[1].split("=")[1];
                    sEnum.split(",").forEach(function (sType) {
                        var sTargetType = oV2toV4ComplexSemantic.typeMapping[sType];
                        if (sTargetType) {
                            aResult.push(oV2toV4ComplexSemantic.v4EnumType + "/" + sTargetType);
                        }
                        else {
                            Log.warning("Unsupported semantic type: " + sType, undefined, sClassName);
                        }
                    });
                    if (aResult.length > 0) {
                        oSemantics.type = { "EnumMember": aResult.join(" ") };
                    }
                }
                oAnnotations[oV2toV4ComplexSemantic.Path] = [oSemantics];
            }
            else {
                oAnnotations[oV2toV4ComplexSemantic.Path] = oSemantics;
            }
        }
        else {
            oAnnotations[oV2toV4ComplexSemantic.V4Attribute || sValue] = oPath;
        }
        oAnnotatable.consume("semantics");
    }
};
_V2MetadataConverter.prototype.finalize = function () {
    this.result.$Version = "4.0";
    this.setDefaultEntityContainer();
    this.updateNavigationPropertiesAndCreateBindings();
    this.processBoundOperations();
    this.processUnitConversion();
};
_V2MetadataConverter.prototype.mergeAnnotations = function (mConvertedV2Annotations, mV4Annotations) {
    var sAnnotatablePath;
    for (sAnnotatablePath in mConvertedV2Annotations) {
        if (sAnnotatablePath in mV4Annotations) {
            mV4Annotations[sAnnotatablePath] = Object.assign(mConvertedV2Annotations[sAnnotatablePath], mV4Annotations[sAnnotatablePath]);
        }
        else {
            mV4Annotations[sAnnotatablePath] = mConvertedV2Annotations[sAnnotatablePath];
        }
    }
};
_V2MetadataConverter.prototype.postProcessSchema = function (_oElement, _aResult) {
    var mAnnotations, oEntityContainer, sEntityContainerName, oEntitySet, sEntitySetName, sTarget;
    for (sEntityContainerName in this.mEntityContainersOfSchema) {
        oEntityContainer = this.mEntityContainersOfSchema[sEntityContainerName];
        for (sEntitySetName in oEntityContainer) {
            oEntitySet = oEntityContainer[sEntitySetName];
            if (oEntitySet.$kind !== "EntitySet") {
                continue;
            }
            sTarget = sEntityContainerName + "/" + sEntitySetName;
            mAnnotations = _Helper.merge(this.convertedV2Annotations[sTarget] || {}, this.mEntityType2EntitySetAnnotation[oEntitySet.$Type]);
            if (Object.keys(mAnnotations).length) {
                this.convertedV2Annotations[sTarget] = mAnnotations;
            }
        }
    }
    if (this.schema.$Annotations) {
        this.mergeAnnotations(this.convertedV2Annotations, this.schema.$Annotations);
    }
    else if (Object.keys(this.convertedV2Annotations).length > 0) {
        this.schema.$Annotations = this.convertedV2Annotations;
    }
    this.convertedV2Annotations = {};
    this.mEntityContainersOfSchema = {};
};
_V2MetadataConverter.prototype.processAssociation = function (oElement) {
    var sName = this.namespace + oElement.getAttribute("Name");
    this.associations[sName] = this.association = {
        referentialConstraint: null,
        roles: {}
    };
};
_V2MetadataConverter.prototype.processAssociationEnd = function (oElement) {
    var sName = oElement.getAttribute("Role");
    this.association.roles[sName] = {
        multiplicity: oElement.getAttribute("Multiplicity"),
        propertyName: undefined,
        typeName: this.resolveAlias(oElement.getAttribute("Type"))
    };
};
_V2MetadataConverter.prototype.processAssociationSet = function (oElement) {
    var oAssociationSet = {
        associationName: this.resolveAlias(oElement.getAttribute("Association")),
        ends: [],
        entityContainer: this.entityContainer
    };
    this.associationSet = oAssociationSet;
    this.associationSets.push(oAssociationSet);
    this.consumeSapAnnotation("creatable");
    this.consumeSapAnnotation("deletable");
    this.consumeSapAnnotation("updatable");
};
_V2MetadataConverter.prototype.processAssociationSetEnd = function (oElement) {
    this.associationSet.ends.push({
        entitySetName: oElement.getAttribute("EntitySet"),
        roleName: oElement.getAttribute("Role")
    });
};
_V2MetadataConverter.prototype.processComplexType = function (oElement) {
    this.processType(oElement, { "$kind": "ComplexType" });
};
_V2MetadataConverter.prototype.processDataServices = function (oElement) {
    if (oElement.getAttributeNS(sMicrosoftNamespace, "DataServiceVersion") !== "2.0") {
        throw new Error(this.url + ": expected DataServiceVersion=\"2.0\": " + serializeSingleElement(oElement));
    }
};
_V2MetadataConverter.prototype.processDependent = function (oElement) {
    var oConstraint = this.association.referentialConstraint;
    this.constraintRole = oConstraint.dependent = {
        roleName: oElement.getAttribute("Role")
    };
};
_V2MetadataConverter.prototype.processElement = function (oElement, fnProcessor) {
    this.collectSapAnnotations(oElement);
    if (fnProcessor) {
        fnProcessor.call(this, oElement);
    }
    this.warnUnsupportedSapAnnotations(oElement);
};
_V2MetadataConverter.prototype.processEntityContainer = function (oElement) {
    var sQualifiedName = this.namespace + oElement.getAttribute("Name");
    this.mEntityContainersOfSchema[sQualifiedName] = this.entityContainer = { "$kind": "EntityContainer" };
    this.addToResult(sQualifiedName, this.entityContainer);
    if (oElement.getAttributeNS(sMicrosoftNamespace, "IsDefaultEntityContainer") === "true") {
        this.defaultEntityContainer = sQualifiedName;
    }
    this.v2annotatable(sQualifiedName);
};
_V2MetadataConverter.prototype.processEntitySet = function (oElement) {
    var oAnnotatable, sName = oElement.getAttribute("Name");
    this.entityContainer[sName] = this.entitySet = {
        $kind: "EntitySet",
        $Type: this.resolveAlias(oElement.getAttribute("EntityType"))
    };
    oAnnotatable = this.v2annotatable(sName, this.convertEntitySetAnnotation);
    oAnnotatable.consume("creatable");
    oAnnotatable.consume("deletable");
    oAnnotatable.consume("updatable");
    if (oAnnotatable.consume("searchable") !== "true") {
        oAnnotatable.convert("searchable", false);
    }
};
_V2MetadataConverter.prototype.processEntityType = function (oElement) {
    var oType = {
        $kind: "EntityType"
    }, that = this;
    this.processType(oElement, oType);
    this.processAttributes(oElement, oType, {
        "Abstract": this.setIfTrue,
        "BaseType": function (sType) {
            return sType ? that.resolveAlias(sType) : undefined;
        }
    });
    this.convertLabel(this.oAnnotatable);
};
_V2MetadataConverter.prototype.processEntityTypeKeyPropertyRef = function (oElement) {
    var sName = oElement.getAttribute("Name");
    this.getOrCreateArray(this.type, "$Key").push(sName);
};
_V2MetadataConverter.prototype.processFacetAttributes = function (oElement, oResult) {
    var that = this;
    this.processAttributes(oElement, oResult, {
        "DefaultValue": this.setValue,
        "MaxLength": function (sValue) {
            return sValue === "Max" ? undefined : that.setNumber(sValue);
        },
        "Nullable": this.setIfFalse,
        "Precision": this.setNumber,
        "Scale": this.setNumber,
        "Unicode": this.setIfFalse
    });
    if (oElement.getAttribute("FixedLength") === "false") {
        oResult.$Scale = "variable";
    }
};
_V2MetadataConverter.prototype.processFunctionImport = function (oElement) {
    var sAnnotationActionFor, sHttpMethod = oElement.getAttributeNS(sMicrosoftNamespace, "HttpMethod"), sKind = sHttpMethod !== "GET" ? "Action" : "Function", sLabel, sName = oElement.getAttribute("Name"), oOperation = {
        $kind: sKind
    }, oOperationImport = {
        $kind: sKind + "Import"
    }, sQualifiedName = this.namespace + sName, sReturnType = oElement.getAttribute("ReturnType"), oReturnType;
    oOperationImport["$" + sKind] = sQualifiedName;
    this.processAttributes(oElement, oOperationImport, {
        "EntitySet": this.setValue
    });
    if (sReturnType) {
        oOperation.$ReturnType = oReturnType = {};
        this.processTypedCollection(sReturnType, oReturnType);
    }
    if (!rHttpMethods.test(sHttpMethod)) {
        Log.warning("Unsupported HttpMethod at FunctionImport '" + sName + "', removing this FunctionImport", undefined, sClassName);
        this.consumeSapAnnotation("action-for");
        this.consumeSapAnnotation("applicable-path");
    }
    else {
        if (sHttpMethod !== "GET" && sHttpMethod !== "POST") {
            oOperation.$v2HttpMethod = sHttpMethod;
        }
        this.addToResult(sQualifiedName, [oOperation]);
        sAnnotationActionFor = this.consumeSapAnnotation("action-for");
        if (sAnnotationActionFor) {
            oOperation.$IsBound = true;
            oOperation.$Parameter = [{
                    "$Name": null,
                    "$Nullable": false,
                    "$Type": this.resolveAlias(sAnnotationActionFor)
                }];
            this.aBoundOperations.push(oOperation);
            this.consumeSapAnnotation("applicable-path");
            sLabel = this.consumeSapAnnotation("label");
            if (sLabel) {
                oOperation[mV2toV4["label"].term] = sLabel;
            }
        }
        else {
            this.entityContainer[sName] = oOperationImport;
            this.v2annotatable(sName);
            this.convertLabel(this.oAnnotatable);
        }
    }
    this.oOperation = oOperation;
};
_V2MetadataConverter.prototype.processParameter = function (oElement) {
    var sLabel, oOperation = this.oOperation, oParameter = {
        $Name: oElement.getAttribute("Name")
    };
    this.processFacetAttributes(oElement, oParameter);
    this.processTypedCollection(oElement.getAttribute("Type"), oParameter);
    this.getOrCreateArray(oOperation, "$Parameter").push(oParameter);
    sLabel = this.consumeSapAnnotation("label");
    if (sLabel) {
        oParameter[mV2toV4["label"].term] = sLabel;
    }
};
_V2MetadataConverter.prototype.processPrincipal = function (oElement) {
    var oConstraint = this.association.referentialConstraint;
    this.constraintRole = oConstraint.principal = {
        roleName: oElement.getAttribute("Role")
    };
};
_V2MetadataConverter.prototype.processReferentialConstraint = function (_oElement) {
    this.association.referentialConstraint = {};
};
_V2MetadataConverter.prototype.processReferentialConstraintPropertyRef = function (oElement) {
    this.constraintRole.propertyRef = oElement.getAttribute("Name");
};
_V2MetadataConverter.prototype.processSchema = function (oElement) {
    var sSchemaVersion = this.consumeSapAnnotation("schema-version");
    this.namespace = oElement.getAttribute("Namespace") + ".";
    this.schema = { "$kind": "Schema" };
    this.addToResult(this.namespace, this.schema);
    if (sSchemaVersion) {
        this.schema["@Org.Odata.Core.V1.SchemaVersion"] = sSchemaVersion;
    }
};
_V2MetadataConverter.prototype.processType = function (oElement, oType) {
    var sQualifiedName = this.namespace + oElement.getAttribute("Name");
    this.sTypeName = sQualifiedName;
    this.type = oType;
    this.addToResult(sQualifiedName, oType);
    this.v2annotatable(sQualifiedName);
};
_V2MetadataConverter.prototype.processTypedCollection = function (sType, oProperty) {
    var aMatches = this.rCollection.exec(sType);
    if (aMatches) {
        oProperty.$isCollection = true;
        sType = aMatches[1];
    }
    if (!sType.includes(".")) {
        sType = "Edm." + sType;
    }
    switch (sType) {
        case "Edm.DateTime":
            oProperty.$v2Type = sType;
            if (this.mSapAnnotations["display-format"] === "Date") {
                sType = "Edm.Date";
                delete oProperty.$Precision;
            }
            else {
                sType = "Edm.DateTimeOffset";
            }
            break;
        case "Edm.Float":
            oProperty.$v2Type = sType;
            sType = "Edm.Single";
            break;
        case "Edm.Time":
            oProperty.$v2Type = sType;
            sType = "Edm.TimeOfDay";
            break;
        default: sType = this.resolveAlias(sType);
    }
    oProperty.$Type = sType;
};
_V2MetadataConverter.prototype.processTypeNavigationProperty = function (oElement) {
    var sCreatable = this.consumeSapAnnotation("creatable"), sCreatablePath = this.consumeSapAnnotation("creatable-path"), sFilterable = this.consumeSapAnnotation("filterable"), oFilterablePath, vHere, sName = oElement.getAttribute("Name"), oNavigationPropertyPath, oProperty = {
        $kind: "NavigationProperty"
    }, that = this;
    function pushPropertyPath(sTerm, sProperty, oAnnotation) {
        vHere = that.getOrCreateObject(that.mEntityType2EntitySetAnnotation, that.sTypeName);
        vHere = that.getOrCreateObject(vHere, sTerm);
        vHere = that.getOrCreateArray(vHere, sProperty);
        vHere.push(oAnnotation);
    }
    this.type[sName] = oProperty;
    this.navigationProperties.push({
        associationName: this.resolveAlias(oElement.getAttribute("Relationship")),
        fromRoleName: oElement.getAttribute("FromRole"),
        property: oProperty,
        propertyName: sName,
        toRoleName: oElement.getAttribute("ToRole")
    });
    this.v2annotatable(sName);
    if (sCreatable) {
        oNavigationPropertyPath = { "$NavigationPropertyPath": sName };
        if (sCreatablePath) {
            Log.warning("Inconsistent metadata in '" + this.url + "'", "Use either 'sap:creatable' or 'sap:creatable-path' at navigation property '" + this.oAnnotatable.sPath + "'", sClassName);
        }
        else if (sCreatable === "true") {
            oNavigationPropertyPath = null;
        }
    }
    else if (sCreatablePath) {
        oNavigationPropertyPath = {
            "$If": [{
                    "$Not": { "$Path": sCreatablePath }
                }, {
                    "$NavigationPropertyPath": sName
                }]
        };
    }
    if (oNavigationPropertyPath) {
        pushPropertyPath("@Org.OData.Capabilities.V1.InsertRestrictions", "NonInsertableNavigationProperties", oNavigationPropertyPath);
    }
    if (sFilterable === "false") {
        oFilterablePath = {
            "NavigationProperty": {
                "$NavigationPropertyPath": sName
            },
            "FilterRestrictions": {
                "Filterable": false
            }
        };
        pushPropertyPath("@Org.OData.Capabilities.V1.NavigationRestrictions", "RestrictedProperties", oFilterablePath);
    }
};
_V2MetadataConverter.prototype.processTypeProperty = function (oElement) {
    var oAnnotatable, sEnumMember, sFilterRestriction, vHere, sName = oElement.getAttribute("Name"), oProperty = {
        "$kind": "Property"
    }, that = this;
    function pushPropertyPath(sTerm, sProperty, sAnnotation) {
        if (that.type.$kind === "EntityType") {
            vHere = that.getOrCreateObject(that.mEntityType2EntitySetAnnotation, that.sTypeName);
            vHere = that.getOrCreateObject(vHere, sTerm);
            vHere = that.getOrCreateArray(vHere, sProperty);
            vHere.push({ "$PropertyPath": sName });
        }
        else {
            Log.warning("Unsupported SAP annotation at a complex type in '" + that.url + "'", "sap:" + sAnnotation + " at property '" + oAnnotatable.sPath + "'", sClassName);
        }
    }
    this.sPropertyName = sName;
    this.type[sName] = oProperty;
    this.processFacetAttributes(oElement, oProperty);
    this.processTypedCollection(oElement.getAttribute("Type"), oProperty);
    oAnnotatable = this.v2annotatable(sName, this.convertPropertyAnnotation);
    if (oAnnotatable.consume("updatable") === "false") {
        if (oAnnotatable.consume("creatable") === "false") {
            oAnnotatable.annotate("@Org.OData.Core.V1.Computed", true);
        }
        else {
            oAnnotatable.annotate("@Org.OData.Core.V1.Immutable", true);
        }
    }
    if (oAnnotatable.consume("filterable") === "false") {
        pushPropertyPath("@Org.OData.Capabilities.V1.FilterRestrictions", "NonFilterableProperties", "filterable");
    }
    sFilterRestriction = oAnnotatable.consume("filter-restriction");
    if (sFilterRestriction) {
        switch (sFilterRestriction) {
            case "interval":
                sEnumMember = "SingleInterval";
                break;
            case "multi-value":
                sEnumMember = "MultiValue";
                break;
            case "single-value":
                sEnumMember = "SingleValue";
                break;
            default: Log.warning("Inconsistent metadata in '" + this.url + "'", "Unsupported sap:filter-restriction=\"" + sFilterRestriction + "\" at property '" + oAnnotatable.sPath + "'", sClassName);
        }
        if (sEnumMember) {
            if (this.type.$kind === "EntityType") {
                vHere = this.getOrCreateObject(this.mEntityType2EntitySetAnnotation, this.sTypeName);
                vHere = this.getOrCreateArray(vHere, "@com.sap.vocabularies.Common.v1.FilterExpressionRestrictions");
                vHere.push({
                    "AllowedExpressions": {
                        "EnumMember": "com.sap.vocabularies.Common.v1.FilterExpressionType/" + sEnumMember
                    },
                    "Property": { "$PropertyPath": sName }
                });
            }
            else {
                Log.warning("Unsupported SAP annotation at a complex type in '" + this.url + "'", "sap:filter-restriction at property '" + oAnnotatable.sPath + "'", sClassName);
            }
        }
    }
    if (oAnnotatable.consume("required-in-filter") === "true") {
        pushPropertyPath("@Org.OData.Capabilities.V1.FilterRestrictions", "RequiredProperties", "required-in-filter");
    }
    if (oAnnotatable.consume("sortable") === "false") {
        pushPropertyPath("@Org.OData.Capabilities.V1.SortRestrictions", "NonSortableProperties", "sortable");
    }
};
_V2MetadataConverter.prototype.processBoundOperations = function () {
    var that = this;
    this.aBoundOperations.forEach(function (oOperation) {
        var oEntityType = that.result[oOperation.$Parameter[0].$Type];
        oEntityType.$Key.forEach(function (sKeyName) {
            oOperation.$Parameter.some(function (oParameter, i) {
                if (oParameter.$Name === sKeyName) {
                    oOperation.$Parameter.splice(i, 1);
                    return true;
                }
            });
        });
    });
};
_V2MetadataConverter.prototype.processUnitConversion = function () {
    var that = this;
    Object.keys(this.mProperty2Unit).forEach(function (sPropertyPath) {
        var vHere, oType, sTypeName = sPropertyPath.split("/")[0], sUnitAnnotation, sUnitPath = that.mProperty2Unit[sPropertyPath], aUnitPathSegments = sUnitPath.split("/"), oUnitProperty, sUnitSemantics, i, n = aUnitPathSegments.length;
        for (i = 0; i < n; i += 1) {
            oType = that.result[sTypeName];
            oUnitProperty = oType[aUnitPathSegments[i]];
            if (!oUnitProperty) {
                Log.warning("Path '" + sUnitPath + "' for sap:unit cannot be resolved", sPropertyPath, sClassName);
                return;
            }
            if (i < n - 1) {
                sTypeName = oUnitProperty.$Type;
            }
        }
        sUnitSemantics = that.mProperty2Semantics[sTypeName + "/" + aUnitPathSegments[n - 1]];
        if (!sUnitSemantics) {
            Log.warning("Unsupported sap:semantics at sap:unit='" + sUnitPath + "'; expected 'currency-code' or 'unit-of-measure'", sPropertyPath, sClassName);
            return;
        }
        sUnitAnnotation = sUnitSemantics === "currency-code" ? "ISOCurrency" : "Unit";
        sUnitAnnotation = "@Org.OData.Measures.V1." + sUnitAnnotation;
        vHere = that.getOrCreateObject(that.result[_Helper.namespace(sPropertyPath) + "."], "$Annotations");
        vHere = that.getOrCreateObject(vHere, sPropertyPath);
        if (!(sUnitAnnotation in vHere)) {
            vHere[sUnitAnnotation] = { "$Path": sUnitPath };
        }
    });
};
function serializeSingleElement(oElement) {
    var oAttribute, oAttributesList = oElement.attributes, sText = "<" + oElement.nodeName, i, n;
    for (i = 0, n = oAttributesList.length; i < n; i += 1) {
        oAttribute = oAttributesList.item(i);
        sText += " " + oAttribute.name + "=\"" + oAttribute.value + "\"";
    }
    return sText + (oElement.childNodes.length ? ">" : "/>");
}
_V2MetadataConverter.prototype.setDefaultEntityContainer = function () {
    var sDefaultEntityContainer = this.defaultEntityContainer, aEntityContainers, oResult = this.result;
    if (sDefaultEntityContainer) {
        oResult.$EntityContainer = sDefaultEntityContainer;
    }
    else {
        aEntityContainers = Object.keys(oResult).filter(function (sQualifiedName) {
            return oResult[sQualifiedName].$kind === "EntityContainer";
        });
        if (aEntityContainers.length === 1) {
            oResult.$EntityContainer = aEntityContainers[0];
        }
    }
};
_V2MetadataConverter.prototype.updateNavigationPropertiesAndCreateBindings = function () {
    var that = this;
    this.navigationProperties.forEach(function (oNavigationPropertyData) {
        var oAssociation = that.associations[oNavigationPropertyData.associationName], oConstraint = oAssociation.referentialConstraint, oNavigationProperty = oNavigationPropertyData.property, oToRole = oAssociation.roles[oNavigationPropertyData.toRoleName];
        oNavigationProperty.$Type = oToRole.typeName;
        oToRole.propertyName = oNavigationPropertyData.propertyName;
        if (oToRole.multiplicity === "1") {
            oNavigationProperty.$Nullable = false;
        }
        if (oToRole.multiplicity === "*") {
            oNavigationProperty.$isCollection = true;
        }
        if (oConstraint && oConstraint.principal.roleName === oNavigationPropertyData.toRoleName) {
            oNavigationProperty.$ReferentialConstraint = {};
            oNavigationProperty.$ReferentialConstraint[oConstraint.dependent.propertyRef] = oConstraint.principal.propertyRef;
        }
    });
    this.associationSets.forEach(function (oAssociationSet) {
        var oAssociation = that.associations[oAssociationSet.associationName], oEntityContainer = oAssociationSet.entityContainer;
        function createNavigationPropertyBinding(oAssociationSetFrom, oAssociationSetTo) {
            var oEntitySet = oEntityContainer[oAssociationSetFrom.entitySetName], oToRole = oAssociation.roles[oAssociationSetTo.roleName];
            if (oToRole.propertyName) {
                oEntitySet.$NavigationPropertyBinding = oEntitySet.$NavigationPropertyBinding || {};
                oEntitySet.$NavigationPropertyBinding[oToRole.propertyName] = oAssociationSetTo.entitySetName;
            }
        }
        createNavigationPropertyBinding(oAssociationSet.ends[0], oAssociationSet.ends[1]);
        createNavigationPropertyBinding(oAssociationSet.ends[1], oAssociationSet.ends[0]);
    });
};
_V2MetadataConverter.prototype.v2annotatable = function (sName, fnProcessV2Annotatable) {
    var oAnnotatable = new Annotatable(this, sName);
    this.oAnnotatable = oAnnotatable;
    if (fnProcessV2Annotatable) {
        fnProcessV2Annotatable = fnProcessV2Annotatable.bind(this);
        Object.keys(this.mSapAnnotations).forEach(function (sName) {
            fnProcessV2Annotatable(oAnnotatable, sName);
        });
    }
    return oAnnotatable;
};
_V2MetadataConverter.prototype.warnUnsupportedSapAnnotations = function (oElement) {
    Object.keys(this.mSapAnnotations).forEach(function (sName) {
        Log.warning("Unsupported annotation 'sap:" + sName + "'", serializeSingleElement(oElement), sClassName);
    });
};
(function ($$) {
    var oStructuredTypeConfig;
    $$.sRootNamespace = sEdmxNamespace;
    $$.oAliasConfig = {
        "Reference": {
            __xmlns: _MetadataConverter.sEdmxNamespace,
            "Include": {
                __processor: $$.processAlias
            }
        },
        "DataServices": {
            "Schema": {
                __processor: $$.processAlias
            }
        }
    };
    oStructuredTypeConfig = {
        "NavigationProperty": {
            __processor: $$.processTypeNavigationProperty
        },
        "Property": {
            __processor: $$.processTypeProperty
        }
    };
    $$.oFullConfig = {
        __include: [$$.oReferenceInclude],
        "DataServices": {
            __processor: $$.processDataServices,
            "Schema": {
                __postProcessor: $$.postProcessSchema,
                __processor: $$.processSchema,
                __include: [$$.oAnnotationsConfig],
                "Association": {
                    __processor: $$.processAssociation,
                    "End": {
                        __processor: $$.processAssociationEnd
                    },
                    "ReferentialConstraint": {
                        __processor: $$.processReferentialConstraint,
                        "Dependent": {
                            __processor: $$.processDependent,
                            "PropertyRef": {
                                __processor: $$.processReferentialConstraintPropertyRef
                            }
                        },
                        "Principal": {
                            __processor: $$.processPrincipal,
                            "PropertyRef": {
                                __processor: $$.processReferentialConstraintPropertyRef
                            }
                        }
                    }
                },
                "ComplexType": {
                    __processor: $$.processComplexType,
                    __include: [oStructuredTypeConfig]
                },
                "EntityContainer": {
                    __processor: $$.processEntityContainer,
                    "AssociationSet": {
                        __processor: $$.processAssociationSet,
                        "End": {
                            __processor: $$.processAssociationSetEnd
                        }
                    },
                    "EntitySet": {
                        __processor: $$.processEntitySet
                    },
                    "FunctionImport": {
                        __processor: $$.processFunctionImport,
                        "Parameter": {
                            __processor: $$.processParameter
                        }
                    }
                },
                "EntityType": {
                    __processor: $$.processEntityType,
                    __include: [oStructuredTypeConfig],
                    "Key": {
                        "PropertyRef": {
                            __processor: $$.processEntityTypeKeyPropertyRef
                        }
                    }
                }
            }
        }
    };
})(_V2MetadataConverter.prototype);