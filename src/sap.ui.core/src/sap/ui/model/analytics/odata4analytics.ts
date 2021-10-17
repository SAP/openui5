import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Sorter from "sap/ui/model/Sorter";
import AnalyticalVersionInfo from "./AnalyticalVersionInfo";
import encodeURL from "sap/base/security/encodeURL";
var odata4analytics = odata4analytics || {}, rOnlyDigits = /^\d+$/;
odata4analytics.constants = {};
odata4analytics.constants["SAP_NAMESPACE"] = "http://www.sap.com/Protocols/SAPData";
odata4analytics.constants["VERSION"] = "0.7";
odata4analytics.helper = {
    deepEqual: function (aOldColumns, aNewColumns, fnFormatterChanged) {
        var oNewColumn, oOldColumn, iResult = 0, i, n;
        if (!aOldColumns || aOldColumns.length !== aNewColumns.length) {
            return 2;
        }
        if (aOldColumns !== aNewColumns) {
            for (i = 0, n = aOldColumns.length; i < n; i += 1) {
                oOldColumn = aOldColumns[i];
                oNewColumn = aNewColumns[i];
                if (oOldColumn.grouped !== oNewColumn.grouped || oOldColumn.inResult !== oNewColumn.inResult || oOldColumn.level !== oNewColumn.level || oOldColumn.name !== oNewColumn.name || oOldColumn.total !== oNewColumn.total || oOldColumn.visible !== oNewColumn.visible) {
                    return 2;
                }
                if (oOldColumn.formatter !== oNewColumn.formatter) {
                    iResult = 1;
                    if (fnFormatterChanged) {
                        fnFormatterChanged(oNewColumn);
                    }
                }
            }
        }
        return iResult;
    },
    tokenizeNametoLabelText: function (sName) {
        var sLabel = "";
        sLabel = sName.replace(/^P_(.*)/, "$1");
        sLabel = sLabel.replace(/([^A-Z0-9_]+)([A-Z0-9_])/g, "$1 $2");
        sLabel = sLabel.replace(/([A-Z0-9_]{2,})([A-Z0-9_])([^A-Z0-9_]+)/g, "$1 $2$3");
        sLabel = sLabel.replace(/(.*) _E$/, "$1");
        sLabel = sLabel.replace(/(.*) _(.*)/g, "$1 $2");
        return sLabel;
    }
};
odata4analytics.Model = function (oModelReference, mParameter) {
    this._init(oModelReference, mParameter);
};
odata4analytics.Model.ReferenceByURI = function (sURI) {
    return {
        sServiceURI: sURI
    };
};
odata4analytics.Model.ReferenceByModel = function (oModel) {
    return {
        oModel: oModel
    };
};
odata4analytics.Model.ReferenceWithWorkaround = function (oModel, aWorkaroundID) {
    return {
        oModelReference: oModel,
        aWorkaroundID: aWorkaroundID
    };
};
odata4analytics.Model.prototype = {
    _init: function (oModelReference, mParameter) {
        var ODataModelClass, that = this;
        if (typeof mParameter == "string") {
            throw "Deprecated second argument: Adjust your invocation by passing an object with a property sAnnotationJSONDoc as a second argument instead";
        }
        this._mParameter = mParameter;
        this._oActivatedWorkarounds = {};
        if (oModelReference && oModelReference.aWorkaroundID) {
            for (var i = -1, sID; (sID = oModelReference.aWorkaroundID[++i]) !== undefined;) {
                this._oActivatedWorkarounds[sID] = true;
            }
            oModelReference = oModelReference.oModelReference;
        }
        if (!oModelReference || (!oModelReference.sServiceURI && !oModelReference.oModel)) {
            throw "Usage with oModelReference being an instance of Model.ReferenceByURI or Model.ReferenceByModel";
        }
        if (oModelReference.oModel) {
            this._oModel = oModelReference.oModel;
            this._iVersion = AnalyticalVersionInfo.getVersion(this._oModel);
            checkForMetadata();
        }
        else if (mParameter && mParameter.modelVersion === AnalyticalVersionInfo.V2) {
            ODataModelClass = sap.ui.require("sap/ui/model/odata/v2/ODataModel") || sap.ui.requireSync("sap/ui/model/odata/v2/ODataModel");
            this._oModel = new ODataModelClass(oModelReference.sServiceURI);
            this._iVersion = AnalyticalVersionInfo.V2;
            checkForMetadata();
        }
        else {
            ODataModelClass = sap.ui.require("sap/ui/model/odata/ODataModel") || sap.ui.requireSync("sap/ui/model/odata/ODataModel");
            this._oModel = new ODataModelClass(oModelReference.sServiceURI);
            this._iVersion = AnalyticalVersionInfo.V1;
            checkForMetadata();
        }
        if (this._oModel.getServiceMetadata() && this._oModel.getServiceMetadata().dataServices == undefined) {
            throw "Model could not be loaded";
        }
        function checkForMetadata() {
            if (!that._oModel.getServiceMetadata()) {
                that._oModel.attachMetadataLoaded(processMetadata);
            }
            else {
                processMetadata();
            }
        }
        function processMetadata() {
            if (that.bIsInitialized) {
                return;
            }
            that.bIsInitialized = true;
            if (mParameter && mParameter.sAnnotationJSONDoc) {
                that.mergeV2Annotations(mParameter.sAnnotationJSONDoc);
            }
            that._interpreteMetadata(that._oModel.getServiceMetadata().dataServices);
        }
    },
    _interpreteMetadata: function (oMetadata) {
        this._oQueryResultSet = {};
        this._oParameterizationSet = {};
        this._oEntityTypeSet = {};
        this._oEntitySetSet = {};
        this._oEntityTypeNameToEntitySetMap = {};
        var oSchema = this._oModel.getServiceMetadata().dataServices.schema[0];
        for (var j = -1, oContainer; (oContainer = oSchema.entityContainer[++j]) !== undefined;) {
            if (oContainer.isDefaultEntityContainer == "true") {
                this._oDefaultEntityContainer = oContainer;
                break;
            }
        }
        var aEntityType = oSchema.entityType;
        var aQueryResultEntityTypes = [], aParameterEntityTypes = [], aUnsortedEntityTypes = [];
        for (var k = -1, oType; (oType = aEntityType[++k]) !== undefined;) {
            var bProcessed = false;
            if (oType.extensions != undefined) {
                for (var l = -1, oExtension; (oExtension = oType.extensions[++l]) !== undefined;) {
                    if (oExtension.namespace == odata4analytics.constants.SAP_NAMESPACE && oExtension.name == "semantics") {
                        bProcessed = true;
                        switch (oExtension.value) {
                            case "aggregate":
                                aQueryResultEntityTypes.push(oType);
                                break;
                            case "parameters":
                                aParameterEntityTypes.push(oType);
                                break;
                            default: aUnsortedEntityTypes.push(oType);
                        }
                    }
                    if (bProcessed) {
                        continue;
                    }
                }
                if (!bProcessed) {
                    aUnsortedEntityTypes.push(oType);
                }
            }
            else {
                aUnsortedEntityTypes.push(oType);
            }
        }
        for (var m = -1, oType2; (oType2 = aUnsortedEntityTypes[++m]) !== undefined;) {
            var oEntityType = new odata4analytics.EntityType(this._oModel.getServiceMetadata(), oSchema, oType2);
            this._oEntityTypeSet[oEntityType.getQName()] = oEntityType;
            var aEntitySet = this._getEntitySetsOfType(oSchema, oEntityType.getQName());
            if (aEntitySet.length == 0) {
                throw "Invalid consumption model: No entity set for entity type " + oEntityType.getQName() + " found";
            }
            if (aEntitySet.length > 1) {
                throw "Unsupported consumption model: More than one entity set for entity type " + oEntityType.getQName() + " found";
            }
            var oEntitySet = new odata4analytics.EntitySet(this._oModel.getServiceMetadata(), oSchema, aEntitySet[0][0], aEntitySet[0][1], oEntityType);
            this._oEntitySetSet[oEntitySet.getQName()] = oEntitySet;
            this._oEntityTypeNameToEntitySetMap[oEntityType.getQName()] = oEntitySet;
        }
        var oParameterizationEntityTypeSet = {};
        for (var n = -1, oType3; (oType3 = aParameterEntityTypes[++n]) !== undefined;) {
            var oEntityType2 = new odata4analytics.EntityType(this._oModel.getServiceMetadata(), oSchema, oType3);
            this._oEntityTypeSet[oEntityType2.getQName()] = oEntityType2;
            var aEntitySet2 = this._getEntitySetsOfType(oSchema, oEntityType2.getQName());
            if (aEntitySet2.length == 0) {
                throw "Invalid consumption model: No entity set for parameter entity type " + oEntityType2.getQName() + " found";
            }
            if (aEntitySet2.length > 1) {
                throw "Unsupported consumption model: More than one entity set for parameter entity type " + oEntityType2.getQName() + " found";
            }
            var oEntitySet2 = new odata4analytics.EntitySet(this._oModel.getServiceMetadata(), oSchema, aEntitySet2[0][0], aEntitySet2[0][1], oEntityType2);
            this._oEntitySetSet[oEntitySet2.getQName()] = oEntitySet2;
            this._oEntityTypeNameToEntitySetMap[oEntityType2.getQName()] = oEntitySet2;
            var oParameterization = new odata4analytics.Parameterization(oEntityType2, oEntitySet2);
            this._oParameterizationSet[oParameterization.getName()] = oParameterization;
            oParameterizationEntityTypeSet[oEntityType2.getQName()] = oParameterization;
            var sParameterizationEntityTypeQTypeName = oEntityType2.getQName();
            if (oSchema.association != undefined) {
                for (var p = -1, oAssoc; (oAssoc = oSchema.association[++p]) !== undefined;) {
                    if (oAssoc.referentialConstraint == undefined) {
                        continue;
                    }
                    var sParameterValueHelpEntityTypeQTypeName = null;
                    if (oAssoc.end[0].type == sParameterizationEntityTypeQTypeName && oAssoc.end[0].multiplicity == "*" && oAssoc.end[1].multiplicity == "1") {
                        sParameterValueHelpEntityTypeQTypeName = oAssoc.end[1].type;
                    }
                    else if (oAssoc.end[1].type == sParameterizationEntityTypeQTypeName && oAssoc.end[1].multiplicity == "*" && oAssoc.end[0].multiplicity == "1") {
                        sParameterValueHelpEntityTypeQTypeName = oAssoc.end[0].type;
                    }
                    if (!sParameterValueHelpEntityTypeQTypeName) {
                        continue;
                    }
                    if (oAssoc.referentialConstraint.dependent.propertyRef.length != 1) {
                        continue;
                    }
                    var oParameter = oParameterization.findParameterByName(oAssoc.referentialConstraint.dependent.propertyRef[0].name);
                    if (oParameter == null) {
                        continue;
                    }
                    var oValueListEntityType = this._oEntityTypeSet[sParameterValueHelpEntityTypeQTypeName];
                    var oValueListEntitySet = this._oEntityTypeNameToEntitySetMap[sParameterValueHelpEntityTypeQTypeName];
                    oParameter.setValueSetEntity(oValueListEntityType, oValueListEntitySet);
                }
            }
        }
        for (var r = -1, oType4; (oType4 = aQueryResultEntityTypes[++r]) !== undefined;) {
            var oEntityType3 = new odata4analytics.EntityType(this._oModel.getServiceMetadata(), oSchema, oType4);
            this._oEntityTypeSet[oEntityType3.getQName()] = oEntityType3;
            var sQueryResultEntityTypeQTypeName = oEntityType3.getQName();
            var oParameterization3 = null;
            var oAssocFromParamsToResult = null;
            if (oSchema.association != undefined) {
                for (var s = -1, oAssoc2; (oAssoc2 = oSchema.association[++s]) !== undefined;) {
                    var sParameterEntityTypeQTypeName = null;
                    if (oAssoc2.end[0].type == sQueryResultEntityTypeQTypeName) {
                        sParameterEntityTypeQTypeName = oAssoc2.end[1].type;
                    }
                    else if (oAssoc2.end[1].type == sQueryResultEntityTypeQTypeName) {
                        sParameterEntityTypeQTypeName = oAssoc2.end[0].type;
                    }
                    else {
                        continue;
                    }
                    var oMatchingParameterization = null;
                    oMatchingParameterization = oParameterizationEntityTypeSet[sParameterEntityTypeQTypeName];
                    if (oMatchingParameterization != null) {
                        if (oParameterization3 != null) {
                            throw "Unable to handle multiple parameter entity types of query entity " + oEntityType3.name;
                        }
                        else {
                            oParameterization3 = oMatchingParameterization;
                            oAssocFromParamsToResult = oAssoc2;
                        }
                    }
                }
            }
            var aEntitySet3 = this._getEntitySetsOfType(oSchema, oEntityType3.getQName());
            if (aEntitySet3.length != 1) {
                throw "Invalid consumption model: There must be exactly one entity set for an entity type annotated with aggregating semantics";
            }
            var oEntitySet3 = new odata4analytics.EntitySet(this._oModel.getServiceMetadata(), oSchema, aEntitySet3[0][0], aEntitySet3[0][1], oEntityType3);
            this._oEntitySetSet[oEntitySet3.getQName()] = oEntitySet3;
            this._oEntityTypeNameToEntitySetMap[oEntityType3.getQName()] = oEntitySet3;
            var oQueryResult = new odata4analytics.QueryResult(this, oEntityType3, oEntitySet3, oParameterization3);
            this._oQueryResultSet[oQueryResult.getName()] = oQueryResult;
            if (oParameterization3) {
                oParameterization3.setTargetQueryResult(oQueryResult, oAssocFromParamsToResult);
            }
            if (oSchema.association != undefined) {
                for (var t = -1, oAssoc3; (oAssoc3 = oSchema.association[++t]) !== undefined;) {
                    if (oAssoc3.referentialConstraint == undefined) {
                        continue;
                    }
                    var sDimensionValueHelpEntityTypeQTypeName = null;
                    if (oAssoc3.end[0].type == sQueryResultEntityTypeQTypeName && oAssoc3.end[0].multiplicity == "*" && oAssoc3.end[1].multiplicity == "1") {
                        sDimensionValueHelpEntityTypeQTypeName = oAssoc3.end[1].type;
                    }
                    else if (oAssoc3.end[1].type == sQueryResultEntityTypeQTypeName && oAssoc3.end[1].multiplicity == "*" && oAssoc3.end[0].multiplicity == "1") {
                        sDimensionValueHelpEntityTypeQTypeName = oAssoc3.end[0].type;
                    }
                    if (!sDimensionValueHelpEntityTypeQTypeName) {
                        continue;
                    }
                    if (oAssoc3.referentialConstraint.dependent.propertyRef.length != 1) {
                        continue;
                    }
                    var oDimension = oQueryResult.findDimensionByName(oAssoc3.referentialConstraint.dependent.propertyRef[0].name);
                    if (oDimension == null) {
                        continue;
                    }
                    var oDimensionMembersEntitySet = this._oEntityTypeNameToEntitySetMap[sDimensionValueHelpEntityTypeQTypeName];
                    oDimension.setMembersEntitySet(oDimensionMembersEntitySet);
                }
            }
        }
    },
    oUI5ODataModelAnnotatableObject: {
        objectName: "schema",
        keyPropName: "namespace",
        extensions: true,
        aSubObject: [{
                objectName: "entityType",
                keyPropName: "name",
                extensions: true,
                aSubObject: [{
                        objectName: "property",
                        keyPropName: "name",
                        aSubObject: [],
                        extensions: true
                    }]
            }, {
                objectName: "entityContainer",
                keyPropName: "name",
                extensions: false,
                aSubObject: [{
                        objectName: "entitySet",
                        keyPropName: "name",
                        extensions: true,
                        aSubObject: []
                    }]
            }]
    },
    mergeV2Annotations: function (sAnnotationJSONDoc) {
        var oAnnotation = null;
        try {
            oAnnotation = JSON.parse(sAnnotationJSONDoc);
        }
        catch (exception) {
            return;
        }
        var oMetadata;
        try {
            oMetadata = this._oModel.getServiceMetadata().dataServices;
        }
        catch (exception) {
            return;
        }
        for (var propName in oAnnotation) {
            if (!(this.oUI5ODataModelAnnotatableObject.objectName == propName)) {
                continue;
            }
            if (!(oAnnotation[propName] instanceof Array)) {
                continue;
            }
            this.mergeV2AnnotationLevel(oMetadata[this.oUI5ODataModelAnnotatableObject.objectName], oAnnotation[this.oUI5ODataModelAnnotatableObject.objectName], this.oUI5ODataModelAnnotatableObject);
            break;
        }
        return;
    },
    mergeV2AnnotationLevel: function (aMetadata, aAnnotation, oUI5ODataModelAnnotatableObject) {
        for (var i = -1, oAnnotation; (oAnnotation = aAnnotation[++i]) !== undefined;) {
            for (var j = -1, oMetadata; (oMetadata = aMetadata[++j]) !== undefined;) {
                if (!(oAnnotation[oUI5ODataModelAnnotatableObject.keyPropName] == oMetadata[oUI5ODataModelAnnotatableObject.keyPropName])) {
                    continue;
                }
                if (oAnnotation["extensions"] != undefined) {
                    if (oMetadata["extensions"] == undefined) {
                        oMetadata["extensions"] = [];
                    }
                    for (var l = -1, oAnnotationExtension; (oAnnotationExtension = oAnnotation["extensions"][++l]) !== undefined;) {
                        var bFound = false;
                        for (var m = -1, oMetadataExtension; (oMetadataExtension = oMetadata["extensions"][++m]) !== undefined;) {
                            if (oAnnotationExtension.name == oMetadataExtension.name && oAnnotationExtension.namespace == oMetadataExtension.namespace) {
                                oMetadataExtension.value = oAnnotationExtension.value;
                                bFound = true;
                                break;
                            }
                        }
                        if (!bFound) {
                            oMetadata["extensions"].push(oAnnotationExtension);
                        }
                    }
                }
                for (var k = -1, oUI5ODataModelAnnotatableSubObject; (oUI5ODataModelAnnotatableSubObject = oUI5ODataModelAnnotatableObject.aSubObject[++k]) !== undefined;) {
                    for (var propName in oAnnotation) {
                        if (!(oUI5ODataModelAnnotatableSubObject.objectName == propName)) {
                            continue;
                        }
                        if (!(oAnnotation[oUI5ODataModelAnnotatableSubObject.objectName] instanceof Array)) {
                            continue;
                        }
                        if ((oMetadata[oUI5ODataModelAnnotatableSubObject.objectName] == undefined) || (!(oMetadata[oUI5ODataModelAnnotatableSubObject.objectName] instanceof Array))) {
                            continue;
                        }
                        this.mergeV2AnnotationLevel(oMetadata[oUI5ODataModelAnnotatableSubObject.objectName], oAnnotation[oUI5ODataModelAnnotatableSubObject.objectName], oUI5ODataModelAnnotatableSubObject);
                        break;
                    }
                }
            }
        }
        return;
    },
    findQueryResultByName: function (sName) {
        var oQueryResult = this._oQueryResultSet[sName];
        if (!oQueryResult && this._oDefaultEntityContainer) {
            var sQName = this._oDefaultEntityContainer.name + "." + sName;
            oQueryResult = this._oQueryResultSet[sQName];
        }
        return oQueryResult;
    },
    getAllQueryResultNames: function () {
        if (this._aQueryResultNames) {
            return this._aQueryResultNames;
        }
        this._aQueryResultNames = new Array(0);
        for (var sName in this._oQueryResultSet) {
            this._aQueryResultNames.push(this._oQueryResultSet[sName].getName());
        }
        return this._aQueryResultNames;
    },
    getAllQueryResults: function () {
        return this._oQueryResultSet;
    },
    getODataModel: function () {
        return this._oModel;
    },
    _getEntitySetsOfType: function (oSchema, sQTypeName) {
        var aEntitySet = [];
        for (var i = -1, oEntityContainer; (oEntityContainer = oSchema.entityContainer[++i]) !== undefined;) {
            for (var j = -1, oEntitySet; (oEntitySet = oEntityContainer.entitySet[++j]) !== undefined;) {
                if (oEntitySet.entityType == sQTypeName) {
                    aEntitySet.push([oEntityContainer, oEntitySet]);
                }
            }
        }
        return aEntitySet;
    },
    _mParameter: null,
    _oModel: null,
    _oDefaultEntityContainer: null,
    _aQueryResultNames: null,
    _oQueryResultSet: null,
    _oParameterizationSet: null,
    _oEntityTypeSet: null,
    _oEntitySetSet: null,
    _oEntityTypeNameToEntitySetMap: null,
    _oActivatedWorkarounds: null
};
odata4analytics.QueryResult = function (oModel, oEntityType, oEntitySet, oParameterization) {
    this._init(oModel, oEntityType, oEntitySet, oParameterization);
};
odata4analytics.QueryResult.prototype = {
    _init: function (oModel, oEntityType, oEntitySet, oParameterization, oAssocFromParamsToResult) {
        this._oModel = oModel;
        this._oEntityType = oEntityType;
        this._oEntitySet = oEntitySet;
        this._oParameterization = oParameterization;
        this._oDimensionSet = {};
        this._oMeasureSet = {};
        var aProperty = oEntityType.getTypeDescription().property;
        var oAttributeForPropertySet = {};
        for (var i = -1, oProperty; (oProperty = aProperty[++i]) !== undefined;) {
            if (oProperty.extensions == undefined) {
                continue;
            }
            for (var j = -1, oExtension; (oExtension = oProperty.extensions[++j]) !== undefined;) {
                if (!oExtension.namespace == odata4analytics.constants.SAP_NAMESPACE) {
                    continue;
                }
                switch (oExtension.name) {
                    case "aggregation-role":
                        switch (oExtension.value) {
                            case "dimension": {
                                var oDimension = new odata4analytics.Dimension(this, oProperty);
                                this._oDimensionSet[oDimension.getName()] = oDimension;
                                break;
                            }
                            case "measure": {
                                var oMeasure = new odata4analytics.Measure(this, oProperty);
                                this._oMeasureSet[oMeasure.getName()] = oMeasure;
                                break;
                            }
                            case "totaled-properties-list":
                                this._oTotaledPropertyListProperty = oProperty;
                                break;
                            default:
                        }
                        break;
                    case "attribute-for": {
                        var oDimensionAttribute = new odata4analytics.DimensionAttribute(this, oProperty);
                        var oKeyProperty = oDimensionAttribute.getKeyProperty();
                        oAttributeForPropertySet[oKeyProperty.name] = oDimensionAttribute;
                        break;
                    }
                    default:
                }
            }
        }
        for (var sDimensionAttributeName in oAttributeForPropertySet) {
            var oDimensionAttribute2 = oAttributeForPropertySet[sDimensionAttributeName];
            oDimensionAttribute2.getDimension().addAttribute(oDimensionAttribute2);
        }
        if (oModel._oActivatedWorkarounds.IdentifyTextPropertiesByName) {
            var aMatchedTextPropertyName = [];
            for (var oDimName in this._oDimensionSet) {
                var oDimension2 = this._oDimensionSet[oDimName];
                if (!oDimension2.getTextProperty()) {
                    var oTextProperty = null;
                    oTextProperty = oEntityType.findPropertyByName(oDimName + "Name");
                    if (!oTextProperty) {
                        oTextProperty = oEntityType.findPropertyByName(oDimName + "Text");
                    }
                    if (!oTextProperty) {
                        oTextProperty = oEntityType.findPropertyByName(oDimName + "Desc");
                    }
                    if (!oTextProperty) {
                        oTextProperty = oEntityType.findPropertyByName(oDimName + "Description");
                    }
                    if (oTextProperty) {
                        oDimension2.setTextProperty(oTextProperty);
                        aMatchedTextPropertyName.push(oTextProperty.name);
                    }
                }
            }
            for (var t = -1, sPropertyName; (sPropertyName = aMatchedTextPropertyName[++t]) !== undefined;) {
                delete this._oDimensionSet[sPropertyName];
            }
        }
    },
    getName: function () {
        return this.getEntitySet().getQName();
    },
    getParameterization: function () {
        return this._oParameterization;
    },
    getAllDimensionNames: function () {
        if (this._aDimensionNames) {
            return this._aDimensionNames;
        }
        this._aDimensionNames = [];
        for (var sName in this._oDimensionSet) {
            this._aDimensionNames.push(this._oDimensionSet[sName].getName());
        }
        return this._aDimensionNames;
    },
    getAllDimensions: function () {
        return this._oDimensionSet;
    },
    getAllMeasureNames: function () {
        if (this._aMeasureNames) {
            return this._aMeasureNames;
        }
        this._aMeasureNames = [];
        for (var sName in this._oMeasureSet) {
            this._aMeasureNames.push(this._oMeasureSet[sName].getName());
        }
        return this._aMeasureNames;
    },
    getAllMeasures: function () {
        return this._oMeasureSet;
    },
    findDimensionByName: function (sName) {
        return this._oDimensionSet[sName];
    },
    findDimensionByPropertyName: function (sName) {
        if (this._oDimensionSet[sName]) {
            return this._oDimensionSet[sName];
        }
        for (var sDimensionName in this._oDimensionSet) {
            var oDimension = this._oDimensionSet[sDimensionName];
            var oTextProperty = oDimension.getTextProperty();
            if (oTextProperty && oTextProperty.name == sName) {
                return oDimension;
            }
            if (oDimension.findAttributeByName(sName)) {
                return oDimension;
            }
        }
        return null;
    },
    getTotaledPropertiesListProperty: function () {
        return this._oTotaledPropertyListProperty;
    },
    findMeasureByName: function (sName) {
        return this._oMeasureSet[sName];
    },
    findMeasureByPropertyName: function (sName) {
        if (this._oMeasureSet[sName]) {
            return this._oMeasureSet[sName];
        }
        for (var sMeasureName in this._oMeasureSet) {
            var oMeasure = this._oMeasureSet[sMeasureName];
            var oFormattedValueProperty = oMeasure.getFormattedValueProperty();
            if (oFormattedValueProperty && oFormattedValueProperty.name == sName) {
                return oMeasure;
            }
        }
        return null;
    },
    getModel: function () {
        return this._oModel;
    },
    getEntityType: function () {
        return this._oEntityType;
    },
    getEntitySet: function () {
        return this._oEntitySet;
    },
    _oModel: null,
    _oEntityType: null,
    _oEntitySet: null,
    _oParameterization: null,
    _aDimensionNames: null,
    _oDimensionSet: null,
    _aMeasureNames: null,
    _oMeasureSet: null,
    _oTotaledPropertyListProperty: null
};
odata4analytics.Parameterization = function (oEntityType, oEntitySet) {
    this._init(oEntityType, oEntitySet);
};
odata4analytics.Parameterization.prototype = {
    _init: function (oEntityType, oEntitySet) {
        this._oEntityType = oEntityType;
        this._oEntitySet = oEntitySet;
        this._oParameterSet = {};
        var aProperty = oEntityType.getTypeDescription().property;
        for (var i = -1, oProperty; (oProperty = aProperty[++i]) !== undefined;) {
            if (oProperty.extensions == undefined) {
                continue;
            }
            for (var j = -1, oExtension; (oExtension = oProperty.extensions[++j]) !== undefined;) {
                if (!oExtension.namespace == odata4analytics.constants.SAP_NAMESPACE) {
                    continue;
                }
                switch (oExtension.name) {
                    case "parameter": {
                        var oParameter = new odata4analytics.Parameter(this, oProperty);
                        this._oParameterSet[oParameter.getName()] = oParameter;
                        break;
                    }
                    default:
                }
            }
        }
    },
    setTargetQueryResult: function (oQueryResult, oAssociation) {
        this._oQueryResult = oQueryResult;
        var sQAssocName = this._oEntityType.getSchema().namespace + "." + oAssociation.name;
        var aNavProp = this._oEntityType.getTypeDescription().navigationProperty;
        if (!aNavProp) {
            throw "Invalid consumption model: Parameters entity type lacks navigation property for association to query result entity type";
        }
        for (var i = -1, oNavProp; (oNavProp = aNavProp[++i]) !== undefined;) {
            if (oNavProp.relationship == sQAssocName) {
                this._oNavPropToQueryResult = oNavProp.name;
            }
        }
        if (!this._oNavPropToQueryResult) {
            throw "Invalid consumption model: Parameters entity type lacks navigation property for association to query result entity type";
        }
    },
    getTargetQueryResult: function () {
        if (!this._oQueryResult) {
            throw "No target query result set";
        }
        return this._oQueryResult;
    },
    getName: function () {
        return this.getEntitySet().getQName();
    },
    getAllParameterNames: function () {
        if (this._aParameterNames) {
            return this._aParameterNames;
        }
        this._aParameterNames = [];
        for (var sName in this._oParameterSet) {
            this._aParameterNames.push(this._oParameterSet[sName].getName());
        }
        return this._aParameterNames;
    },
    getAllParameters: function () {
        return this._oParameterSet;
    },
    findParameterByName: function (sName) {
        return this._oParameterSet[sName];
    },
    getNavigationPropertyToQueryResult: function () {
        return this._oNavPropToQueryResult;
    },
    getEntityType: function () {
        return this._oEntityType;
    },
    getEntitySet: function () {
        return this._oEntitySet;
    },
    _oEntityType: null,
    _oEntitySet: null,
    _oQueryResult: null,
    _oNavPropToQueryResult: null,
    _aParameterNames: null,
    _oParameterSet: null
};
odata4analytics.Parameter = function (oParameterization, oProperty) {
    this._init(oParameterization, oProperty);
};
odata4analytics.Parameter.prototype = {
    _init: function (oParameterization, oProperty) {
        this._oParameterization = oParameterization;
        this._oProperty = oProperty;
        var oEntityType = oParameterization.getEntityType();
        if (oProperty.extensions != undefined) {
            for (var i = -1, oExtension; (oExtension = oProperty.extensions[++i]) !== undefined;) {
                if (!oExtension.namespace == odata4analytics.constants.SAP_NAMESPACE) {
                    continue;
                }
                switch (oExtension.name) {
                    case "parameter":
                        switch (oExtension.value) {
                            case "mandatory":
                                this._bRequired = true;
                                break;
                            case "optional":
                                this._bRequired = false;
                                break;
                            default: throw "Invalid annotation value for parameter property";
                        }
                        break;
                    case "label":
                        this._sLabelText = oExtension.value;
                        break;
                    case "text":
                        this._oTextProperty = oEntityType.findPropertyByName(oExtension.value);
                        break;
                    case "upper-boundary":
                        this._bIntervalBoundaryParameter = true;
                        this._oUpperIntervalBoundaryParameterProperty = oEntityType.findPropertyByName(oExtension.value);
                        break;
                    case "lower-boundary":
                        this._bIntervalBoundaryParameter = true;
                        this._oLowerIntervalBoundaryParameterProperty = oEntityType.findPropertyByName(oExtension.value);
                        break;
                    default:
                }
            }
        }
        if (!this._sLabelText) {
            this._sLabelText = "";
        }
    },
    setValueSetEntity: function (oEntityType, oEntitySet) {
        this._oValueSetEntityType = oEntityType;
        this._oValueSetEntitySet = oEntitySet;
    },
    getTextProperty: function () {
        return this._oTextProperty;
    },
    getLabelText: function () {
        if (!this._sLabelText && this._oParameterization._oQueryResult._oModel._oActivatedWorkarounds.CreateLabelsFromTechnicalNames) {
            this._sLabelText = odata4analytics.helper.tokenizeNametoLabelText(this.getName());
        }
        return this._sLabelText;
    },
    isOptional: function () {
        return (!this._bRequired);
    },
    isIntervalBoundary: function () {
        return this._bIntervalBoundaryParameter;
    },
    isLowerIntervalBoundary: function () {
        return (this._oUpperIntervalBoundaryParameterProperty ? true : false);
    },
    getPeerIntervalBoundaryParameter: function () {
        var sPeerParamPropName = null;
        if (this._oLowerIntervalBoundaryParameterProperty) {
            sPeerParamPropName = this._oLowerIntervalBoundaryParameterProperty.name;
        }
        else {
            sPeerParamPropName = this._oUpperIntervalBoundaryParameterProperty.name;
        }
        if (!sPeerParamPropName) {
            throw "Parameter is not an interval boundary";
        }
        return this._oParameterization.findParameterByName(sPeerParamPropName);
    },
    isValueSetAvailable: function () {
        return (this._oValueSetEntityType ? true : false);
    },
    getName: function () {
        return this._oProperty.name;
    },
    getProperty: function () {
        return this._oProperty;
    },
    getContainingParameterization: function () {
        return this._oParameterization;
    },
    getURIToValueEntitySet: function (sServiceRootURI) {
        var sURI = null;
        sURI = (sServiceRootURI ? sServiceRootURI : "") + "/" + this._oValueSetEntitySet.getQName();
        return sURI;
    },
    _oParameterization: null,
    _oProperty: null,
    _sLabelText: null,
    _oTextProperty: null,
    _bRequired: false,
    _bIntervalBoundaryParameter: false,
    _oLowerIntervalBoundaryParameterProperty: null,
    _oUpperIntervalBoundaryParameterProperty: null,
    _oValueSetEntityType: null,
    _oValueSetEntitySet: null
};
odata4analytics.Dimension = function (oQueryResult, oProperty) {
    this._init(oQueryResult, oProperty);
};
odata4analytics.Dimension.prototype = {
    _init: function (oQueryResult, oProperty) {
        this._oQueryResult = oQueryResult;
        this._oProperty = oProperty;
        this._oAttributeSet = {};
    },
    setMembersEntitySet: function (oEntitySet) {
        this._oMembersEntitySet = oEntitySet;
    },
    getName: function () {
        return this._oProperty.name;
    },
    getKeyProperty: function () {
        return this._oProperty;
    },
    getTextProperty: function () {
        if (!this._oTextProperty) {
            this._oTextProperty = this._oQueryResult.getEntityType().getTextPropertyOfProperty(this.getName());
        }
        return this._oTextProperty;
    },
    setTextProperty: function (oTextProperty) {
        this._oTextProperty = oTextProperty;
    },
    getLabelText: function () {
        if (!this._sLabelText) {
            this._sLabelText = this._oQueryResult.getEntityType().getLabelOfProperty(this.getName());
        }
        if (!this._sLabelText && this._oQueryResult._oModel._oActivatedWorkarounds.CreateLabelsFromTechnicalNames) {
            this._sLabelText = odata4analytics.helper.tokenizeNametoLabelText(this.getName());
        }
        return (this._sLabelText == null ? "" : this._sLabelText);
    },
    getSuperOrdinateDimension: function () {
        if (!this._sSuperOrdinateDimension) {
            var oSuperOrdProperty = this._oQueryResult.getEntityType().getSuperOrdinatePropertyOfProperty(this.getName());
            if (oSuperOrdProperty) {
                this._sSuperOrdinateDimension = this._oQueryResult.findDimensionByName(oSuperOrdProperty.name);
            }
        }
        return this._sSuperOrdinateDimension;
    },
    getHierarchy: function () {
        if (!this._oHierarchy) {
            this._oHierarchy = this._oQueryResult.getEntityType().getHierarchy(this._oProperty.name);
        }
        return this._oHierarchy;
    },
    getAllAttributeNames: function () {
        if (this._aAttributeNames) {
            return this._aAttributeNames;
        }
        this._aAttributeNames = [];
        for (var sName in this._oAttributeSet) {
            this._aAttributeNames.push(this._oAttributeSet[sName].getName());
        }
        return this._aAttributeNames;
    },
    getAllAttributes: function () {
        return this._oAttributeSet;
    },
    findAttributeByName: function (sName) {
        return this._oAttributeSet[sName];
    },
    addAttribute: function (oDimensionAttribute) {
        this._oAttributeSet[oDimensionAttribute.getName()] = oDimensionAttribute;
    },
    getContainingQueryResult: function () {
        return this._oQueryResult;
    },
    hasMasterData: function () {
        return this._oMembersEntitySet != null ? true : false;
    },
    getMasterDataEntitySet: function () {
        return this._oMembersEntitySet;
    },
    _oQueryResult: null,
    _oProperty: null,
    _oTextProperty: null,
    _sLabelText: null,
    _sSuperOrdinateDimension: null,
    _aAttributeNames: null,
    _oAttributeSet: null,
    _oMembersEntitySet: null,
    _oHierarchy: null
};
odata4analytics.DimensionAttribute = function (oQueryResult, oProperty) {
    this._init(oQueryResult, oProperty);
};
odata4analytics.DimensionAttribute.prototype = {
    _init: function (oQueryResult, oProperty) {
        this._oQueryResult = oQueryResult;
        this._oProperty = oProperty;
        if (oProperty.extensions != undefined) {
            for (var i = -1, oExtension; (oExtension = oProperty.extensions[++i]) !== undefined;) {
                if (!oExtension.namespace == odata4analytics.constants.SAP_NAMESPACE) {
                    continue;
                }
                switch (oExtension.name) {
                    case "attribute-for":
                        this._sDimensionName = oExtension.value;
                        break;
                    case "label":
                        this._sLabelText = oExtension.value;
                        break;
                    case "text":
                        this._oTextProperty = oQueryResult.getEntityType().findPropertyByName(oExtension.value);
                        break;
                    default:
                }
            }
        }
    },
    getName: function () {
        return this._oProperty.name;
    },
    getKeyProperty: function () {
        return this._oProperty;
    },
    getTextProperty: function () {
        return this._oTextProperty;
    },
    getLabelText: function () {
        if (!this._sLabelText && this._oQueryResult._oModel._oActivatedWorkarounds.CreateLabelsFromTechnicalNames) {
            this._sLabelText = odata4analytics.helper.tokenizeNametoLabelText(this.getName());
        }
        return this._sLabelText;
    },
    getDimension: function () {
        return this._oQueryResult.findDimensionByName(this._sDimensionName);
    },
    _oQueryResult: null,
    _oProperty: null,
    _oTextProperty: null,
    _sLabelText: null,
    _sDimensionName: null
};
odata4analytics.Measure = function (oQueryResult, oProperty) {
    this._init(oQueryResult, oProperty);
};
odata4analytics.Measure.prototype = {
    _init: function (oQueryResult, oProperty) {
        this._oQueryResult = oQueryResult;
        this._oProperty = oProperty;
        if (oProperty.extensions != undefined) {
            for (var i = -1, oExtension; (oExtension = oProperty.extensions[++i]) !== undefined;) {
                if (!oExtension.namespace == odata4analytics.constants.SAP_NAMESPACE) {
                    continue;
                }
                switch (oExtension.name) {
                    case "label":
                        this._sLabelText = oExtension.value;
                        break;
                    case "text":
                        this._oTextProperty = oQueryResult.getEntityType().findPropertyByName(oExtension.value);
                        break;
                    case "unit":
                        this._oUnitProperty = oQueryResult.getEntityType().findPropertyByName(oExtension.value);
                        break;
                    default:
                }
            }
        }
        if (!this._sLabelText) {
            this._sLabelText = "";
        }
    },
    getName: function () {
        return this._oProperty.name;
    },
    getRawValueProperty: function () {
        return this._oProperty;
    },
    getFormattedValueProperty: function () {
        return this._oTextProperty;
    },
    getUnitProperty: function () {
        return this._oUnitProperty;
    },
    getLabelText: function () {
        if (!this._sLabelText && this._oQueryResult._oModel._oActivatedWorkarounds.CreateLabelsFromTechnicalNames) {
            this._sLabelText = odata4analytics.helper.tokenizeNametoLabelText(this.getName());
        }
        return this._sLabelText;
    },
    isUpdatable: function () {
        if (this._bIsUpdatable != null) {
            return this._bIsUpdatable;
        }
        var oUpdatablePropertyNameSet = this._oQueryResult.getEntitySet().getUpdatablePropertyNameSet();
        return (oUpdatablePropertyNameSet[this.getName()] != undefined);
    },
    _oQueryResult: null,
    _oProperty: null,
    _oTextProperty: null,
    _sLabelText: null,
    _oUnitProperty: null,
    _bIsUpdatable: null
};
odata4analytics.EntitySet = function (oModel, oSchema, oContainer, oEntitySet, oEntityType) {
    this._init(oModel, oSchema, oContainer, oEntitySet, oEntityType);
};
odata4analytics.EntitySet.prototype = {
    _init: function (oModel, oSchema, oContainer, oEntitySet, oEntityType) {
        this._oEntityType = oEntityType;
        this._oEntitySet = oEntitySet;
        this._oContainer = oContainer;
        this._oSchema = oSchema;
        this._oModel = oModel;
        if (oSchema.entityContainer.length > 1) {
            this._sQName = oContainer.name + "." + oEntitySet.name;
        }
        else {
            this._sQName = oEntitySet.name;
        }
    },
    getQName: function () {
        return this._sQName;
    },
    getSetDescription: function () {
        return this._oEntitySet;
    },
    getEntityType: function () {
        return this._oEntityType;
    },
    getSchema: function () {
        return this._oSchema;
    },
    getModel: function () {
        return this._oModel;
    },
    getUpdatablePropertyNameSet: function () {
        if (this._oUpdatablePropertyNames) {
            return this._oUpdatablePropertyNames;
        }
        this._oUpdatablePropertyNames = {};
        var bSetIsUpdatable = true;
        if (this._oEntitySet.extensions != undefined) {
            for (var j = -1, oExtension; (oExtension = this._oEntitySet.extensions[++j]) !== undefined;) {
                if (oExtension.namespace == odata4analytics.constants.SAP_NAMESPACE && oExtension.name == "updatable") {
                    if (oExtension.value == "false") {
                        bSetIsUpdatable = false;
                        break;
                    }
                }
            }
        }
        if (!bSetIsUpdatable) {
            return this._oUpdatablePropertyNames;
        }
        var aProperty = this._oEntityType.getTypeDescription().property;
        for (var i = -1, oProperty; (oProperty = aProperty[++i]) !== undefined;) {
            var bPropertyIsUpdatable = true;
            if (oProperty.extensions == undefined) {
                continue;
            }
            for (var k = -1, oExtension2; (oExtension2 = oProperty.extensions[++k]) !== undefined;) {
                if (oExtension2.namespace != odata4analytics.constants.SAP_NAMESPACE) {
                    continue;
                }
                if (oExtension2.name == "updatable") {
                    if (oExtension2.value == "false") {
                        bPropertyIsUpdatable = false;
                        break;
                    }
                }
            }
            if (bPropertyIsUpdatable) {
                this._oUpdatablePropertyNames[oProperty.name] = true;
            }
        }
        return this._oUpdatablePropertyNames;
    },
    _oEntityType: null,
    _oEntitySet: null,
    _oContainer: null,
    _oSchema: null,
    _oModel: null,
    _sQName: null,
    _oUpdatablePropertyNames: null
};
odata4analytics.EntityType = function (oModel, oSchema, oEntityType) {
    this._init(oModel, oSchema, oEntityType);
};
odata4analytics.EntityType.propertyFilterRestriction = {
    SINGLE_VALUE: "single-value",
    MULTI_VALUE: "multi-value",
    INTERVAL: "interval"
};
odata4analytics.EntityType.prototype = {
    _init: function (oModel, oSchema, oEntityType) {
        this._oEntityType = oEntityType;
        this._oSchema = oSchema;
        this._oModel = oModel;
        this._aKeyProperties = [];
        this._oPropertySet = {};
        this._aFilterablePropertyNames = [];
        this._aSortablePropertyNames = [];
        this._aRequiredFilterPropertyNames = [];
        this._oPropertyFilterRestrictionSet = {};
        this._oPropertyHeadingsSet = {};
        this._oPropertyQuickInfosSet = {};
        this._sQName = oSchema.namespace + "." + oEntityType.name;
        var oRecursiveHierarchies = {};
        function getOrCreateHierarchy(sKey) {
            var oResult = oRecursiveHierarchies[sKey];
            if (!oResult) {
                oResult = oRecursiveHierarchies[sKey] = {};
            }
            return oResult;
        }
        for (var i = -1, oPropertyRef; (oPropertyRef = oEntityType.key.propertyRef[++i]) !== undefined;) {
            this._aKeyProperties.push(oPropertyRef.name);
        }
        for (var k = -1, oProperty; (oProperty = oEntityType.property[++k]) !== undefined;) {
            this._oPropertySet[oProperty.name] = oProperty;
            this._aFilterablePropertyNames.push(oProperty.name);
            this._aSortablePropertyNames.push(oProperty.name);
            if (oProperty.extensions == undefined) {
                continue;
            }
            for (var j = -1, oExtension; (oExtension = oProperty.extensions[++j]) !== undefined;) {
                if (oExtension.namespace !== odata4analytics.constants.SAP_NAMESPACE) {
                    continue;
                }
                switch (oExtension.name) {
                    case "filterable":
                        if (oExtension.value == "false") {
                            this._aFilterablePropertyNames.pop(oProperty.name);
                        }
                        break;
                    case "sortable":
                        if (oExtension.value == "false") {
                            this._aSortablePropertyNames.pop(oProperty.name);
                        }
                        break;
                    case "required-in-filter":
                        if (oExtension.value == "true") {
                            this._aRequiredFilterPropertyNames.push(oProperty.name);
                        }
                        break;
                    case "filter-restriction":
                        if (oExtension.value == odata4analytics.EntityType.propertyFilterRestriction.SINGLE_VALUE || oExtension.value == odata4analytics.EntityType.propertyFilterRestriction.MULTI_VALUE || oExtension.value == odata4analytics.EntityType.propertyFilterRestriction.INTERVAL) {
                            this._oPropertyFilterRestrictionSet[oProperty.name] = oExtension.value;
                        }
                        break;
                    case "hierarchy-node-external-key-for":
                        getOrCreateHierarchy(oExtension.value).externalKeyProperty = oProperty;
                        break;
                    case "hierarchy-node-for":
                        getOrCreateHierarchy(oProperty.name).dimensionName = oExtension.value;
                        break;
                    case "hierarchy-parent-node-for":
                    case "hierarchy-parent-nod":
                        getOrCreateHierarchy(oExtension.value).parentNodeIDProperty = oProperty;
                        break;
                    case "hierarchy-level-for":
                        getOrCreateHierarchy(oExtension.value).levelProperty = oProperty;
                        break;
                    case "hierarchy-drill-state-for":
                    case "hierarchy-drill-stat":
                        getOrCreateHierarchy(oExtension.value).drillStateProperty = oProperty;
                        break;
                    default:
                }
            }
        }
        this._oRecursiveHierarchySet = {};
        for (var hierNodeIDPropertyName in oRecursiveHierarchies) {
            var oHierarchy = oRecursiveHierarchies[hierNodeIDPropertyName];
            var oHierarchyNodeIDProperty = this._oPropertySet[hierNodeIDPropertyName];
            var oDimensionProperty = this._oPropertySet[oHierarchy.dimensionName];
            if (oDimensionProperty == null) {
                oDimensionProperty = oHierarchyNodeIDProperty;
            }
            this._oRecursiveHierarchySet[oDimensionProperty.name] = new odata4analytics.RecursiveHierarchy(oEntityType, oHierarchyNodeIDProperty, oHierarchy.parentNodeIDProperty, oHierarchy.levelProperty, oDimensionProperty, oHierarchy.externalKeyProperty);
        }
    },
    getProperties: function () {
        return this._oPropertySet;
    },
    findPropertyByName: function (sPropertyName) {
        return this._oPropertySet[sPropertyName];
    },
    getKeyProperties: function () {
        return this._aKeyProperties;
    },
    getLabelOfProperty: function (sPropertyName) {
        var oProperty = this._oPropertySet[sPropertyName];
        if (oProperty == null) {
            throw "no such property with name " + sPropertyName;
        }
        if (oProperty.extensions != undefined) {
            for (var i = -1, oExtension; (oExtension = oProperty.extensions[++i]) !== undefined;) {
                if (!oExtension.namespace == odata4analytics.constants.SAP_NAMESPACE) {
                    continue;
                }
                if (oExtension.name == "label") {
                    return oExtension.value;
                }
            }
        }
        return null;
    },
    getHeadingOfProperty: function (sPropertyName) {
        var oProperty = this._oPropertySet[sPropertyName];
        if (oProperty == null) {
            throw "no such property with name " + sPropertyName;
        }
        var sPropertyLabel = null;
        if (oProperty.extensions != undefined) {
            for (var i = -1, oExtension; (oExtension = oProperty.extensions[++i]) !== undefined;) {
                if (!oExtension.namespace == odata4analytics.constants.SAP_NAMESPACE) {
                    continue;
                }
                if (oExtension.name == "heading") {
                    return oExtension.value;
                }
                if (oExtension.name == "label") {
                    sPropertyLabel = oExtension.value;
                }
            }
        }
        return sPropertyLabel;
    },
    getQuickInfoOfProperty: function (sPropertyName) {
        var oProperty = this._oPropertySet[sPropertyName];
        if (oProperty == null) {
            throw "no such property with name " + sPropertyName;
        }
        var sPropertyLabel = null;
        if (oProperty.extensions != undefined) {
            for (var i = -1, oExtension; (oExtension = oProperty.extensions[++i]) !== undefined;) {
                if (!oExtension.namespace == odata4analytics.constants.SAP_NAMESPACE) {
                    continue;
                }
                if (oExtension.name == "quickinfo") {
                    return oExtension.value;
                }
                if (oExtension.name == "label") {
                    sPropertyLabel = oExtension.value;
                }
            }
        }
        return sPropertyLabel;
    },
    getTextPropertyOfProperty: function (sPropertyName) {
        var oProperty = this._oPropertySet[sPropertyName];
        if (oProperty == null) {
            throw "no such property with name " + sPropertyName;
        }
        if (oProperty.extensions != undefined) {
            for (var i = -1, oExtension; (oExtension = oProperty.extensions[++i]) !== undefined;) {
                if (oExtension.name == "text") {
                    return this.findPropertyByName(oExtension.value);
                }
            }
        }
        return null;
    },
    getSuperOrdinatePropertyOfProperty: function (sPropertyName) {
        var oProperty = this._oPropertySet[sPropertyName];
        if (oProperty == null) {
            throw "no such property with name " + sPropertyName;
        }
        if (oProperty.extensions != undefined) {
            for (var i = -1, oExtension; (oExtension = oProperty.extensions[++i]) !== undefined;) {
                if (oExtension.name == "super-ordinate") {
                    return this.findPropertyByName(oExtension.value);
                }
            }
        }
        return null;
    },
    getFilterablePropertyNames: function () {
        return this._aFilterablePropertyNames;
    },
    getSortablePropertyNames: function () {
        return this._aSortablePropertyNames;
    },
    getRequiredFilterPropertyNames: function () {
        return this._aRequiredFilterPropertyNames;
    },
    getPropertiesWithFilterRestrictions: function () {
        return this._oPropertyFilterRestrictionSet;
    },
    getAllHierarchyPropertyNames: function () {
        if (this._aHierarchyPropertyNames) {
            return this._aHierarchyPropertyNames;
        }
        this._aHierarchyPropertyNames = [];
        for (var sName in this._oRecursiveHierarchySet) {
            this._aHierarchyPropertyNames.push(this._oRecursiveHierarchySet[sName].getNodeValueProperty().name);
        }
        return this._aHierarchyPropertyNames;
    },
    getHierarchy: function (sName) {
        if (this._oRecursiveHierarchySet[sName] == undefined) {
            return null;
        }
        return this._oRecursiveHierarchySet[sName];
    },
    getQName: function () {
        return this._sQName;
    },
    getTypeDescription: function () {
        return this._oEntityType;
    },
    getSchema: function () {
        return this._oSchema;
    },
    getModel: function () {
        return this._oModel;
    },
    _oEntityType: null,
    _oSchema: null,
    _oModel: null,
    _sQName: null,
    _aKeyProperties: null,
    _oPropertySet: null,
    _aFilterablePropertyNames: null,
    _aRequiredFilterPropertyNames: null,
    _oPropertyFilterRestrictionSet: null,
    _aHierarchyPropertyNames: null,
    _oRecursiveHierarchySet: null
};
odata4analytics.RecursiveHierarchy = function (oEntityType, oNodeIDProperty, oParentNodeIDProperty, oNodeLevelProperty, oNodeValueProperty, oNodeExternalKeyProperty) {
    this._init(oEntityType, oNodeIDProperty, oParentNodeIDProperty, oNodeLevelProperty, oNodeValueProperty, oNodeExternalKeyProperty);
};
odata4analytics.RecursiveHierarchy.prototype = {
    _init: function (oEntityType, oNodeIDProperty, oParentNodeIDProperty, oNodeLevelProperty, oNodeValueProperty, oNodeExternalKeyProperty) {
        this._oEntityType = oEntityType;
        this._oNodeIDProperty = oNodeIDProperty;
        this._oParentNodeIDProperty = oParentNodeIDProperty;
        this._oNodeLevelProperty = oNodeLevelProperty;
        this._oNodeValueProperty = oNodeValueProperty;
        this._oNodeExternalKeyProperty = oNodeExternalKeyProperty;
    },
    isRecursiveHierarchy: function () {
        return true;
    },
    isLeveledHierarchy: function () {
        return false;
    },
    getNodeExternalKeyProperty: function () {
        return this._oNodeExternalKeyProperty;
    },
    getNodeIDProperty: function () {
        return this._oNodeIDProperty;
    },
    getParentNodeIDProperty: function () {
        return this._oParentNodeIDProperty;
    },
    getNodeLevelProperty: function () {
        return this._oNodeLevelProperty;
    },
    getNodeValueProperty: function () {
        return this._oNodeValueProperty;
    },
    _oEntityType: null,
    _oNodeIDProperty: null,
    _oParentNodeIDProperty: null,
    _oNodeLevelProperty: null,
    _oNodeValueProperty: null,
    _oNodeExternalKeyProperty: null
};
odata4analytics.FilterExpression = function (oModel, oSchema, oEntityType) {
    this._init(oModel, oSchema, oEntityType);
};
odata4analytics.FilterExpression.prototype = {
    _init: function (oModel, oSchema, oEntityType) {
        this._oEntityType = oEntityType;
        this._oSchema = oSchema;
        this._oModel = oModel;
        this._aConditionUI5Filter = [];
        this._aUI5FilterArray = [];
    },
    _renderPropertyFilterValue: function (sFilterValue, sPropertyEDMTypeName) {
        if (sPropertyEDMTypeName === "Edm.Time" && rOnlyDigits.test(sFilterValue)) {
            sFilterValue = { ms: parseInt(sFilterValue), __edmType: "Edm.Time" };
        }
        return encodeURL(this._oModel.getODataModel().formatValue(sFilterValue, sPropertyEDMTypeName));
    },
    clear: function () {
        this._aConditionUI5Filter = [];
        this._aUI5FilterArray = [];
    },
    _addCondition: function (sProperty, sOperator, oValue1, oValue2) {
        for (var i = -1, oUI5Filter; (oUI5Filter = this._aConditionUI5Filter[++i]) !== undefined;) {
            if (oUI5Filter.sPath == sProperty && oUI5Filter.sOperator == sOperator && oUI5Filter.oValue1 == oValue1 && oUI5Filter.oValue2 == oValue2) {
                return;
            }
        }
        this._aConditionUI5Filter.push(new Filter(sProperty, sOperator, oValue1, oValue2));
    },
    _addUI5FilterArray: function (aUI5Filter) {
        this._aUI5FilterArray.push(aUI5Filter);
    },
    addCondition: function (sPropertyName, sOperator, oValue, oValue2) {
        var oProperty = this._oEntityType.findPropertyByName(sPropertyName);
        if (oProperty == null) {
            throw "Cannot add filter condition for unknown property name " + sPropertyName;
        }
        var aFilterablePropertyNames = this._oEntityType.getFilterablePropertyNames();
        if (((aFilterablePropertyNames ? Array.prototype.indexOf.call(aFilterablePropertyNames, sPropertyName) : -1)) === -1) {
            throw "Cannot add filter condition for not filterable property name " + sPropertyName;
        }
        this._addCondition(sPropertyName, sOperator, oValue, oValue2);
        return this;
    },
    removeConditions: function (sPropertyName) {
        var oProperty = this._oEntityType.findPropertyByName(sPropertyName);
        if (oProperty == null) {
            throw "Cannot remove filter conditions for unknown property name " + sPropertyName;
        }
        for (var i = 0; i < this._aConditionUI5Filter.length; i++) {
            var oUI5Filter = this._aConditionUI5Filter[i];
            if (oUI5Filter.sPath == sPropertyName) {
                this._aConditionUI5Filter.splice(i--, 1);
            }
        }
        return this;
    },
    addSetCondition: function (sPropertyName, aValues) {
        var oProperty = this._oEntityType.findPropertyByName(sPropertyName);
        if (oProperty == null) {
            throw "Cannot add filter condition for unknown property name " + sPropertyName;
        }
        var aFilterablePropertyNames = this._oEntityType.getFilterablePropertyNames();
        if (((aFilterablePropertyNames ? Array.prototype.indexOf.call(aFilterablePropertyNames, sPropertyName) : -1)) === -1) {
            throw "Cannot add filter condition for not filterable property name " + sPropertyName;
        }
        for (var i = -1, oValue; (oValue = aValues[++i]) !== undefined;) {
            this._addCondition(sPropertyName, FilterOperator.EQ, oValue);
        }
        return this;
    },
    addUI5FilterConditions: function (aUI5Filter) {
        if (!Array.isArray(aUI5Filter)) {
            throw "Argument is not an array";
        }
        if (aUI5Filter.length == 0) {
            return this;
        }
        var bHasMultiFilter = false;
        for (var i = 0; i < aUI5Filter.length; i++) {
            if (aUI5Filter[i].aFilters != undefined) {
                bHasMultiFilter = true;
                break;
            }
        }
        if (bHasMultiFilter) {
            this._addUI5FilterArray(aUI5Filter);
        }
        else {
            for (var j = 0; j < aUI5Filter.length; j++) {
                this.addCondition(aUI5Filter[j].sPath, aUI5Filter[j].sOperator, aUI5Filter[j].oValue1, aUI5Filter[j].oValue2);
            }
        }
        return this;
    },
    getExpressionAsUI5FilterArray: function () {
        var aFilterObjects = this._aConditionUI5Filter.concat([]);
        for (var i = -1, aFilter; (aFilter = this._aUI5FilterArray[++i]) !== undefined;) {
            for (var j = -1, oFilter; (oFilter = aFilter[++j]) !== undefined;) {
                aFilterObjects.push(oFilter);
            }
        }
        return aFilterObjects;
    },
    getPropertiesReferencedByUI5FilterArray: function (aUI5Filter, oReferencedProperties) {
        for (var i = -1, oUI5Filter; (oUI5Filter = aUI5Filter[++i]) !== undefined;) {
            if (oUI5Filter.aFilters != undefined) {
                this.getPropertiesReferencedByUI5FilterArray(oUI5Filter.aFilters, oReferencedProperties);
            }
            else {
                if (oReferencedProperties[oUI5Filter.sPath] == undefined) {
                    oReferencedProperties[oUI5Filter.sPath] = [];
                }
                oReferencedProperties[oUI5Filter.sPath].push(oUI5Filter);
            }
        }
    },
    getReferencedProperties: function () {
        var oReferencedProperties = {};
        for (var i = -1, oUI5Filter; (oUI5Filter = this._aConditionUI5Filter[++i]) !== undefined;) {
            if (oReferencedProperties[oUI5Filter.sPath] == undefined) {
                oReferencedProperties[oUI5Filter.sPath] = [];
            }
            oReferencedProperties[oUI5Filter.sPath].push(oUI5Filter);
        }
        for (var j = -1, aUI5Filter; (aUI5Filter = this._aUI5FilterArray[++j]) !== undefined;) {
            this.getPropertiesReferencedByUI5FilterArray(aUI5Filter, oReferencedProperties);
        }
        return oReferencedProperties;
    },
    renderUI5Filter: function (oUI5Filter) {
        var sFilterExpression = null, oProperty = this._oEntityType.findPropertyByName(oUI5Filter.sPath);
        if (oProperty == null) {
            throw "Cannot add filter condition for unknown property name " + oUI5Filter.sPath;
        }
        switch (oUI5Filter.sOperator) {
            case FilterOperator.BT:
                sFilterExpression = "(" + oUI5Filter.sPath + " ge " + this._renderPropertyFilterValue(oUI5Filter.oValue1, oProperty.type) + " and " + oUI5Filter.sPath + " le " + this._renderPropertyFilterValue(oUI5Filter.oValue2, oProperty.type) + ")";
                break;
            case FilterOperator.NB:
                sFilterExpression = "(" + oUI5Filter.sPath + " lt " + this._renderPropertyFilterValue(oUI5Filter.oValue1, oProperty.type) + " or " + oUI5Filter.sPath + " gt " + this._renderPropertyFilterValue(oUI5Filter.oValue2, oProperty.type) + ")";
                break;
            case FilterOperator.Contains:
            case FilterOperator.NotContains:
                sFilterExpression = (oUI5Filter.sOperator[0] === "N" ? "not " : "") + "substringof(" + this._renderPropertyFilterValue(oUI5Filter.oValue1, "Edm.String") + "," + oUI5Filter.sPath + ")";
                break;
            case FilterOperator.StartsWith:
            case FilterOperator.EndsWith:
            case FilterOperator.NotStartsWith:
            case FilterOperator.NotEndsWith:
                sFilterExpression = oUI5Filter.sOperator.toLowerCase().replace("not", "not ") + "(" + oUI5Filter.sPath + "," + this._renderPropertyFilterValue(oUI5Filter.oValue1, "Edm.String") + ")";
                break;
            default: sFilterExpression = oUI5Filter.sPath + " " + oUI5Filter.sOperator.toLowerCase() + " " + this._renderPropertyFilterValue(oUI5Filter.oValue1, oProperty.type);
        }
        return sFilterExpression;
    },
    renderUI5MultiFilter: function (oUI5MultiFilter) {
        var aUI5MultiFilter = [];
        var sOptionString = "";
        var sLogicalMultiOperator = oUI5MultiFilter.bAnd == true ? " and " : " or ";
        for (var i = -1, oUI5Filter; (oUI5Filter = oUI5MultiFilter.aFilters[++i]) !== undefined;) {
            if (oUI5Filter.aFilters != undefined) {
                aUI5MultiFilter.push(oUI5Filter);
                continue;
            }
            sOptionString += (sOptionString == "" ? "" : sLogicalMultiOperator) + "(" + this.renderUI5Filter(oUI5Filter) + ")";
        }
        if (aUI5MultiFilter.length > 0) {
            for (var j = -1, oMultiFilter; (oMultiFilter = aUI5MultiFilter[++j]) !== undefined;) {
                sOptionString += (sOptionString == "" ? "" : sLogicalMultiOperator) + "(" + this.renderUI5MultiFilter(oMultiFilter) + ")";
            }
        }
        return sOptionString;
    },
    renderUI5FilterArray: function (aUI5Filter) {
        if (aUI5Filter.length == 0) {
            return "";
        }
        var sOptionString = "";
        aUI5Filter.sort(function (a, b) {
            if (a.sPath == b.sPath) {
                return 0;
            }
            if (a.sPath > b.sPath) {
                return 1;
            }
            else {
                return -1;
            }
        });
        var sPropertyName = aUI5Filter[0].sPath;
        var sSubExpression = "";
        var aNEFilter = [], aUI5MultiFilter = [];
        for (var i = -1, oUI5Filter; (oUI5Filter = aUI5Filter[++i]) !== undefined;) {
            if (oUI5Filter.aFilters != undefined) {
                aUI5MultiFilter.push(oUI5Filter);
                continue;
            }
            if (sPropertyName != oUI5Filter.sPath) {
                if (sSubExpression != "") {
                    sOptionString += (sOptionString == "" ? "" : " and ") + "(" + sSubExpression + ")";
                }
                sSubExpression = "";
                if (aNEFilter.length > 0) {
                    for (var j = -1, oNEFilter; (oNEFilter = aNEFilter[++j]) !== undefined;) {
                        sSubExpression += (sSubExpression == "" ? "" : " and ") + this.renderUI5Filter(oNEFilter);
                    }
                    sOptionString += (sOptionString == "" ? "" : " and ") + "(" + sSubExpression + ")";
                    sSubExpression = "";
                }
                sPropertyName = oUI5Filter.sPath;
                aNEFilter = [];
            }
            if (oUI5Filter.sOperator == FilterOperator.NE) {
                aNEFilter.push(oUI5Filter);
                continue;
            }
            sSubExpression += (sSubExpression == "" ? "" : " or ") + this.renderUI5Filter(oUI5Filter);
        }
        if (sSubExpression != "") {
            sOptionString += (sOptionString == "" ? "" : " and ") + "(" + sSubExpression + ")";
        }
        if (aNEFilter.length > 0) {
            sSubExpression = "";
            for (var k = -1, oNEFilter2; (oNEFilter2 = aNEFilter[++k]) !== undefined;) {
                sSubExpression += (sSubExpression == "" ? "" : " and ") + this.renderUI5Filter(oNEFilter2);
            }
            sOptionString += (sOptionString == "" ? "" : " and ") + "(" + sSubExpression + ")";
        }
        if (aUI5MultiFilter.length > 0) {
            for (var l = -1, oMultiFilter; (oMultiFilter = aUI5MultiFilter[++l]) !== undefined;) {
                sOptionString += (sOptionString == "" ? "" : " and ") + "(" + this.renderUI5MultiFilter(oMultiFilter) + ")";
            }
        }
        return sOptionString;
    },
    getURIFilterOptionValue: function () {
        var sOptionString = this.renderUI5FilterArray(this._aConditionUI5Filter);
        for (var i = -1, aUI5Filter; (aUI5Filter = this._aUI5FilterArray[++i]) !== undefined;) {
            sOptionString += (sOptionString == "" ? "" : " and ") + "(" + this.renderUI5FilterArray(aUI5Filter) + ")";
        }
        return sOptionString;
    },
    checkValidity: function () {
        var aRequiredFilterPropertyNames = this._oEntityType.getRequiredFilterPropertyNames();
        var oPropertiesInFilterExpression = this.getReferencedProperties();
        for (var i = -1, sPropertyName; (sPropertyName = aRequiredFilterPropertyNames[++i]) !== undefined;) {
            if (oPropertiesInFilterExpression[sPropertyName] == undefined) {
                throw "filter expression does not contain required property " + sPropertyName;
            }
        }
        var oPropertyFilterRestrictionSet = this._oEntityType.getPropertiesWithFilterRestrictions();
        for (var sPropertyName2 in oPropertyFilterRestrictionSet) {
            var sFilterRestriction = oPropertyFilterRestrictionSet[sPropertyName2];
            if (sFilterRestriction == odata4analytics.EntityType.propertyFilterRestriction.SINGLE_VALUE) {
                if (oPropertiesInFilterExpression[sPropertyName2] != undefined) {
                    if (oPropertiesInFilterExpression[sPropertyName2].length > 1) {
                        var vTheOnlyValue = oPropertiesInFilterExpression[sPropertyName2][0].oValue1;
                        for (var j = 0; j < oPropertiesInFilterExpression[sPropertyName2].length; j++) {
                            if (oPropertiesInFilterExpression[sPropertyName2][j].oValue1 != vTheOnlyValue || oPropertiesInFilterExpression[sPropertyName2][j].sOperator != FilterOperator.EQ) {
                                throw "filter expression may use " + sPropertyName2 + " only with a single EQ condition";
                            }
                        }
                    }
                }
            }
        }
        return true;
    },
    getEntityType: function () {
        return this._oEntityType;
    },
    getSchema: function () {
        return this._oSchema;
    },
    getModel: function () {
        return this._oModel;
    },
    _oEntityType: null,
    _oSchema: null,
    _oModel: null,
    _aFilterCondition: null
};
odata4analytics.SortOrder = {
    Ascending: "asc",
    Descending: "desc"
};
odata4analytics.SortExpression = function (oModel, oSchema, oEntityType) {
    this._init(oModel, oSchema, oEntityType);
};
odata4analytics.SortExpression.prototype = {
    _init: function (oModel, oSchema, oEntityType) {
        this._oEntityType = oEntityType;
        this._oSchema = oSchema;
        this._oModel = oModel;
        this._aSortCondition = [];
    },
    _containsSorter: function (sPropertyName) {
        var oResult = null;
        for (var i = -1, oCurrentSorter; (oCurrentSorter = this._aSortCondition[++i]) !== undefined;) {
            if (oCurrentSorter.property.name === sPropertyName) {
                oResult = {
                    sorter: oCurrentSorter,
                    index: i
                };
                break;
            }
        }
        return oResult;
    },
    _removeFromArray: function (array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
    },
    clear: function () {
        this._aSortCondition = [];
    },
    addSorter: function (sPropertyName, sSortOrder) {
        var oProperty = this._oEntityType.findPropertyByName(sPropertyName);
        if (oProperty == null) {
            throw "Cannot add sort condition for unknown property name " + sPropertyName;
        }
        var oExistingSorterEntry = this._containsSorter(sPropertyName);
        if (oExistingSorterEntry != null) {
            oExistingSorterEntry.sorter.order = sSortOrder;
            return this;
        }
        var aSortablePropertyNames = this._oEntityType.getSortablePropertyNames();
        if (((aSortablePropertyNames ? Array.prototype.indexOf.call(aSortablePropertyNames, sPropertyName) : -1)) === -1) {
            throw "Cannot add sort condition for not sortable property name " + sPropertyName;
        }
        this._aSortCondition.push({
            property: oProperty,
            order: sSortOrder
        });
        return this;
    },
    removeSorter: function (sPropertyName) {
        if (!sPropertyName) {
            return;
        }
        var oSorter = this._containsSorter(sPropertyName);
        if (oSorter) {
            this._removeFromArray(this._aSortCondition, oSorter.index);
        }
    },
    getExpressionsAsUI5SorterArray: function () {
        var aSorterObjects = [];
        for (var i = -1, oCondition; (oCondition = this._aSortCondition[++i]) !== undefined;) {
            aSorterObjects.push(new Sorter(oCondition.property.name, oCondition.order == odata4analytics.SortOrder.Descending));
        }
        return aSorterObjects;
    },
    getExpressionAsUI5Sorter: function () {
        var aSortArray = this.getExpressionsAsUI5SorterArray();
        if (aSortArray.length == 0) {
            return null;
        }
        else {
            return aSortArray[0];
        }
    },
    getURIOrderByOptionValue: function (oSelectedPropertyNames) {
        if (this._aSortCondition.length == 0) {
            return "";
        }
        var sOrderByOptionString = "";
        for (var i = -1, oCondition; (oCondition = this._aSortCondition[++i]) !== undefined;) {
            if (!oSelectedPropertyNames[oCondition.property.name]) {
                continue;
            }
            sOrderByOptionString += (sOrderByOptionString == "" ? "" : ",") + oCondition.property.name + " " + oCondition.order;
        }
        return sOrderByOptionString;
    },
    getEntityType: function () {
        return this._oEntityType;
    },
    getSchema: function () {
        return this._oSchema;
    },
    getModel: function () {
        return this._oModel;
    },
    _oEntityType: null,
    _oSchema: null,
    _oModel: null,
    _aSortCondition: null
};
odata4analytics.ParameterizationRequest = function (oParameterization) {
    this._init(oParameterization);
};
odata4analytics.ParameterizationRequest.prototype = {
    _init: function (oParameterization) {
        if (!oParameterization) {
            throw "No parameterization given";
        }
        this._oParameterization = oParameterization;
        this._oParameterValueAssignment = [];
    },
    _renderParameterKeyValue: function (sKeyValue, sPropertyEDMTypeName) {
        return encodeURL(this._oParameterization.getTargetQueryResult().getModel().getODataModel().formatValue(sKeyValue, sPropertyEDMTypeName));
    },
    getParameterization: function () {
        return this._oParameterization;
    },
    setParameterValue: function (sParameterName, sValue, sToValue) {
        var oParameter = this._oParameterization.findParameterByName(sParameterName);
        if (!oParameter) {
            throw "Invalid parameter name " + sParameterName;
        }
        if (sToValue != null) {
            if (!oParameter.isIntervalBoundary()) {
                throw "Range value cannot be applied to parameter " + sParameterName + " accepting only single values";
            }
            if (!oParameter.isLowerIntervalBoundary()) {
                throw "Range value given, but parameter " + sParameterName + " does not hold the lower boundary";
            }
        }
        if (!oParameter.isIntervalBoundary()) {
            if (sValue == null) {
                delete this._oParameterValueAssignment[sParameterName];
            }
            else {
                this._oParameterValueAssignment[sParameterName] = sValue;
            }
        }
        else {
            if (sValue == null && sToValue != null) {
                throw "Parameter " + sParameterName + ": An upper boundary cannot be given without the lower boundary";
            }
            if (sValue == null) {
                delete this._oParameterValueAssignment[sParameterName];
                sToValue = null;
            }
            else {
                this._oParameterValueAssignment[sParameterName] = sValue;
            }
            var oUpperBoundaryParameter = oParameter.getPeerIntervalBoundaryParameter();
            if (sToValue == null) {
                sToValue = sValue;
            }
            if (sValue == null) {
                delete this._oParameterValueAssignment[oUpperBoundaryParameter.getName()];
            }
            else {
                this._oParameterValueAssignment[oUpperBoundaryParameter.getName()] = sToValue;
            }
        }
        return;
    },
    getURIToParameterizationEntitySet: function (sServiceRootURI) {
        return (sServiceRootURI ? sServiceRootURI : "") + "/" + this._oParameterization.getEntitySet().getQName();
    },
    getURIToParameterizationEntry: function (sServiceRootURI) {
        var oDefinedParameters = this._oParameterization.getAllParameters();
        for (var sDefinedParameterName in oDefinedParameters) {
            if (this._oParameterValueAssignment[sDefinedParameterName] == undefined) {
                throw "Parameter " + sDefinedParameterName + " has no value assigned";
            }
        }
        var sKeyIdentification = "", bFirst = true;
        for (var sParameterName in this._oParameterValueAssignment) {
            sKeyIdentification += (bFirst ? "" : ",") + sParameterName + "=" + this._renderParameterKeyValue(this._oParameterValueAssignment[sParameterName], oDefinedParameters[sParameterName].getProperty().type);
            bFirst = false;
        }
        return (sServiceRootURI ? sServiceRootURI : "") + "/" + this._oParameterization.getEntitySet().getQName() + "(" + sKeyIdentification + ")";
    },
    _oParameterization: null,
    _oParameterValueAssignment: null
};
odata4analytics.QueryResultRequest = function (oQueryResult, oParameterizationRequest) {
    this._init(oQueryResult, oParameterizationRequest);
};
odata4analytics.QueryResultRequest.prototype = {
    _init: function (oQueryResult, oParameterizationRequest) {
        this._oQueryResult = oQueryResult;
        this._oParameterizationRequest = oParameterizationRequest;
        this._oAggregationLevel = {};
        this._oDimensionHierarchies = {};
        this._oMeasures = {};
        this._bIncludeEntityKey = false;
        this._oFilterExpression = null;
        this._oSortExpression = null;
        this._oSelectedPropertyNames = null;
    },
    addRecursiveHierarchy: function (sHierarchyDimensionName, bIncludeExternalKey, bIncludeText) {
        var oDimension;
        if (!sHierarchyDimensionName) {
            return;
        }
        oDimension = this._oQueryResult.findDimensionByName(sHierarchyDimensionName);
        if (!oDimension) {
            throw new Error("'" + sHierarchyDimensionName + "' is not a dimension property");
        }
        if (!oDimension.getHierarchy()) {
            throw new Error("Dimension '" + sHierarchyDimensionName + "' does not have a hierarchy");
        }
        this._oSelectedPropertyNames = null;
        this._oDimensionHierarchies[sHierarchyDimensionName] = {
            externalKey: bIncludeExternalKey,
            id: true,
            text: bIncludeText
        };
    },
    setParameterizationRequest: function (oParameterizationRequest) {
        this._oParameterizationRequest = oParameterizationRequest;
    },
    setResourcePath: function (sResourcePath) {
        this._sResourcePath = sResourcePath;
        if (this._sResourcePath.indexOf("/") != 0) {
            throw "Missing leading / (slash) for resource path";
        }
        if (this._oQueryResult.getParameterization()) {
            var iLastPathSep = sResourcePath.lastIndexOf("/");
            if (iLastPathSep == -1) {
                throw "Missing navigation from parameter entity set to query result in resource path";
            }
            var sNavPropName = sResourcePath.substring(iLastPathSep + 1);
            if (sNavPropName != this._oQueryResult.getParameterization().getNavigationPropertyToQueryResult()) {
                throw "Invalid navigation property from parameter entity set to query result in resource path";
            }
        }
    },
    getParameterizationRequest: function () {
        return this._oParameterizationRequest;
    },
    getQueryResult: function () {
        return this._oQueryResult;
    },
    setAggregationLevel: function (aDimensionName) {
        this._oAggregationLevel = {};
        if (!aDimensionName) {
            aDimensionName = this._oQueryResult.getAllDimensionNames();
        }
        this.addToAggregationLevel(aDimensionName);
        this._oSelectedPropertyNames = null;
    },
    addToAggregationLevel: function (aDimensionName) {
        if (!aDimensionName) {
            return;
        }
        this._oSelectedPropertyNames = null;
        for (var i = -1, sDimName; (sDimName = aDimensionName[++i]) !== undefined;) {
            if (!this._oQueryResult.findDimensionByName(sDimName)) {
                throw sDimName + " is not a valid dimension name";
            }
            this._oAggregationLevel[sDimName] = {
                key: true,
                text: false,
                attributes: null
            };
        }
    },
    removeFromAggregationLevel: function (aDimensionName) {
        if (!aDimensionName) {
            return;
        }
        this._oSelectedPropertyNames = null;
        for (var i = -1, sDimName; (sDimName = aDimensionName[++i]) !== undefined;) {
            if (!this._oQueryResult.findDimensionByName(sDimName)) {
                throw sDimName + " is not a valid dimension name";
            }
            if (this._oAggregationLevel[sDimName] != undefined) {
                delete this._oAggregationLevel[sDimName];
                this.getSortExpression().removeSorter(sDimName);
            }
        }
    },
    getAggregationLevel: function () {
        var aDimName = [];
        for (var sDimName in this._oAggregationLevel) {
            aDimName.push(sDimName);
        }
        return aDimName;
    },
    getAggregationLevelDetails: function (sDimensionName) {
        if (this._oAggregationLevel[sDimensionName] == undefined) {
            throw "Aggregation level does not include dimension " + sDimensionName;
        }
        return this._oAggregationLevel[sDimensionName];
    },
    setMeasures: function (aMeasureName) {
        if (!aMeasureName) {
            aMeasureName = this._oQueryResult.getAllMeasureNames();
        }
        this._oSelectedPropertyNames = null;
        this._oMeasures = {};
        for (var i = -1, sMeasName; (sMeasName = aMeasureName[++i]) !== undefined;) {
            if (!this._oQueryResult.findMeasureByName(sMeasName)) {
                throw sMeasName + " is not a valid measure name";
            }
            this._oMeasures[sMeasName] = {
                value: true,
                text: false,
                unit: false
            };
        }
    },
    getMeasureNames: function () {
        var aMeasName = [];
        for (var sMeasName in this._oMeasures) {
            aMeasName.push(sMeasName);
        }
        return aMeasName;
    },
    includeDimensionKeyTextAttributes: function (sDimensionName, bIncludeKey, bIncludeText, aAttributeName) {
        this._oSelectedPropertyNames = null;
        var aDimName = [];
        if (sDimensionName) {
            if (this._oAggregationLevel[sDimensionName] == undefined) {
                throw sDimensionName + " is not included in the aggregation level";
            }
            aDimName.push(sDimensionName);
        }
        else {
            for (var sName in this._oAggregationLevel) {
                aDimName.push(sName);
            }
            aAttributeName = null;
        }
        for (var i = -1, sDimName; (sDimName = aDimName[++i]) !== undefined;) {
            if (bIncludeKey != null) {
                this._oAggregationLevel[sDimName].key = bIncludeKey;
            }
            if (bIncludeText != null) {
                this._oAggregationLevel[sDimName].text = bIncludeText;
            }
            if (aAttributeName != null) {
                this._oAggregationLevel[sDimName].attributes = aAttributeName;
            }
        }
    },
    includeMeasureRawFormattedValueUnit: function (sMeasureName, bIncludeRawValue, bIncludeFormattedValue, bIncludeUnit) {
        this._oSelectedPropertyNames = null;
        var aMeasName = [];
        if (sMeasureName) {
            if (this._oMeasures[sMeasureName] == undefined) {
                throw sMeasureName + " is not part of the query result";
            }
            aMeasName.push(sMeasureName);
        }
        else {
            for (var sName in this._oMeasures) {
                aMeasName.push(sName);
            }
        }
        for (var i = -1, sMeasName; (sMeasName = aMeasName[++i]) !== undefined;) {
            if (bIncludeRawValue != null) {
                this._oMeasures[sMeasName].value = bIncludeRawValue;
            }
            if (bIncludeFormattedValue != null) {
                this._oMeasures[sMeasName].text = bIncludeFormattedValue;
            }
            if (bIncludeUnit != null) {
                this._oMeasures[sMeasName].unit = bIncludeUnit;
            }
        }
    },
    getFilterExpression: function () {
        if (this._oFilterExpression == null) {
            var oEntityType = this._oQueryResult.getEntityType();
            this._oFilterExpression = new odata4analytics.FilterExpression(this._oQueryResult.getModel(), oEntityType.getSchema(), oEntityType);
        }
        return this._oFilterExpression;
    },
    setFilterExpression: function (oFilter) {
        this._oFilterExpression = oFilter;
    },
    getSortExpression: function () {
        if (this._oSortExpression == null) {
            var oEntityType = this._oQueryResult.getEntityType();
            this._oSortExpression = new odata4analytics.SortExpression(oEntityType.getModel(), oEntityType.getSchema(), oEntityType);
        }
        return this._oSortExpression;
    },
    setSortExpression: function (oSorter) {
        this._oSortExpression = oSorter;
    },
    setRequestOptions: function (bIncludeEntityKey, bIncludeCount, bReturnNoEntities) {
        if (bIncludeEntityKey != null) {
            this._bIncludeEntityKey = bIncludeEntityKey;
        }
        if (bIncludeCount != null) {
            this._bIncludeCount = bIncludeCount;
        }
        if (bReturnNoEntities != null) {
            this._bReturnNoEntities = bReturnNoEntities;
        }
    },
    setResultPageBoundaries: function (start, end) {
        if (start != null && typeof start !== "number") {
            throw "Start value must be null or numeric";
        }
        if (end !== null && typeof end !== "number") {
            throw "End value must be null or numeric";
        }
        if (start == null) {
            start = 1;
        }
        if (start < 1 || start > (end == null ? start : end)) {
            throw "Invalid values for requested page boundaries";
        }
        this._iSkipRequestOption = (start > 1) ? start - 1 : null;
        this._iTopRequestOption = (end != null) ? (end - start + 1) : null;
    },
    getResultPageBoundaries: function () {
        var iEnd = null;
        if (this._iTopRequestOption != null) {
            if (this._iSkipRequestOption == null) {
                iEnd = 1;
            }
            else {
                iEnd = this._iSkipRequestOption + this._iTopRequestOption;
            }
        }
        return {
            start: (this._iSkipRequestOption == null) ? 1 : this._iSkipRequestOption,
            end: iEnd
        };
    },
    getURIToQueryResultEntitySet: function (sServiceRootURI) {
        var sURI = null;
        if (this._sResourcePath != null) {
            sURI = (sServiceRootURI ? sServiceRootURI : "") + this._sResourcePath;
        }
        else if (this._oQueryResult.getParameterization()) {
            if (!this._oParameterizationRequest) {
                throw "Missing parameterization request";
            }
            else {
                sURI = this._oParameterizationRequest.getURIToParameterizationEntry(sServiceRootURI) + "/" + this._oQueryResult.getParameterization().getNavigationPropertyToQueryResult();
            }
        }
        else {
            sURI = (sServiceRootURI ? sServiceRootURI : "") + "/" + this._oQueryResult.getEntitySet().getQName();
        }
        return sURI;
    },
    getURIOrderByOptionValue: function () {
        var aAllMeasureNames, oCondition, sOrderByOptionString = null, aSortConditions = this._oSortExpression ? this._oSortExpression._aSortCondition : [], i, n = aSortConditions.length;
        if (n) {
            aAllMeasureNames = this._oQueryResult.getAllMeasureNames();
            for (i = 0; i < n; i += 1) {
                oCondition = aSortConditions[i];
                if (!this._oSelectedPropertyNames[oCondition.property.name] && aAllMeasureNames.indexOf(oCondition.property.name) < 0) {
                    continue;
                }
                sOrderByOptionString = (sOrderByOptionString ? sOrderByOptionString + "," : "") + oCondition.property.name + " " + oCondition.order;
            }
        }
        return sOrderByOptionString;
    },
    getURIQueryOptionValue: function (sQueryOptionName) {
        var sName, sQueryOptionValue = null, sSelectOption, that = this;
        function addSelect(vProperty) {
            var sPropertyName;
            if (!vProperty) {
                return;
            }
            sPropertyName = typeof vProperty === "string" ? vProperty : vProperty.name;
            if (!that._oSelectedPropertyNames[sPropertyName]) {
                sSelectOption += (sSelectOption == "" ? "" : ",") + sPropertyName;
                that._oSelectedPropertyNames[sPropertyName] = true;
            }
        }
        switch (sQueryOptionName) {
            case "$select": {
                sSelectOption = "";
                this._oSelectedPropertyNames = {};
                for (sName in this._oAggregationLevel) {
                    var oDim = this._oQueryResult.findDimensionByName(sName);
                    var oDimSelect = this._oAggregationLevel[sName];
                    if (oDimSelect.key == true) {
                        addSelect(oDim.getKeyProperty());
                    }
                    if (oDimSelect.text == true) {
                        addSelect(oDim.getTextProperty());
                    }
                    if (oDimSelect.attributes) {
                        for (var i = -1, sAttrName; (sAttrName = oDimSelect.attributes[++i]) !== undefined;) {
                            addSelect(oDim.findAttributeByName(sAttrName).getName());
                        }
                    }
                }
                for (sName in this._oMeasures) {
                    var oMeas = this._oQueryResult.findMeasureByName(sName);
                    var oMeasSelect = this._oMeasures[sName];
                    if (oMeasSelect.value == true) {
                        addSelect(oMeas.getRawValueProperty());
                    }
                    if (oMeasSelect.text == true) {
                        addSelect(oMeas.getFormattedValueProperty());
                    }
                    if (oMeasSelect.unit == true) {
                        addSelect(oMeas.getUnitProperty());
                    }
                }
                for (sName in this._oDimensionHierarchies) {
                    var oHier = this._oQueryResult.findDimensionByName(sName).getHierarchy();
                    var oHierSelect = this._oDimensionHierarchies[sName];
                    if (oHierSelect.id) {
                        addSelect(oHier.getNodeIDProperty());
                    }
                    if (oHierSelect.externalKey) {
                        addSelect(oHier.getNodeExternalKeyProperty());
                    }
                    if (oHierSelect.text) {
                        addSelect(this._oQueryResult.getEntityType().getTextPropertyOfProperty(oHier.getNodeIDProperty().name));
                    }
                }
                if (this._bIncludeEntityKey) {
                    var aKeyPropRef = this._oQueryResult.getEntityType().getTypeDescription().key.propertyRef;
                    for (var j = -1, oKeyProp; (oKeyProp = aKeyPropRef[++j]) !== undefined;) {
                        sSelectOption += (sSelectOption == "" ? "" : ",") + oKeyProp.name;
                    }
                }
                sQueryOptionValue = (sSelectOption ? sSelectOption : null);
                break;
            }
            case "$filter": {
                var sFilterOption = null;
                if (this._oFilterExpression) {
                    sFilterOption = this._oFilterExpression.getURIFilterOptionValue();
                }
                sQueryOptionValue = (sFilterOption ? sFilterOption : null);
                break;
            }
            case "$orderby": {
                sQueryOptionValue = this.getURIOrderByOptionValue();
                break;
            }
            case "$top": {
                sQueryOptionValue = null;
                if (this._bReturnNoEntities) {
                    sQueryOptionValue = 0;
                }
                else if (this._iTopRequestOption !== null) {
                    sQueryOptionValue = this._iTopRequestOption;
                }
                break;
            }
            case "$skip": {
                sQueryOptionValue = null;
                if (!this._bReturnNoEntities) {
                    sQueryOptionValue = this._iSkipRequestOption;
                }
                break;
            }
            case "$inlinecount": {
                sQueryOptionValue = (this._bIncludeCount == true ? "allpages" : null);
                break;
            }
            default: break;
        }
        return sQueryOptionValue;
    },
    getURIToQueryResultEntries: function (sServiceRootURI, sResourcePath) {
        if (!sResourcePath) {
            sResourcePath = this.getURIToQueryResultEntitySet(sServiceRootURI);
        }
        this.getFilterExpression().checkValidity();
        var sSelectOption = this.getURIQueryOptionValue("$select");
        var sFilterOption = this.getURIQueryOptionValue("$filter");
        var sSortOption = this.getURIQueryOptionValue("$orderby");
        var sTopOption = this.getURIQueryOptionValue("$top");
        var sSkipOption = this.getURIQueryOptionValue("$skip");
        var sInlineCountOption = this.getURIQueryOptionValue("$inlinecount");
        var sURI = sResourcePath;
        var bQuestionmark = false;
        if (sSelectOption !== null) {
            sURI += "?$select=" + sSelectOption;
            bQuestionmark = true;
        }
        if (this._oFilterExpression && sFilterOption !== null) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$filter=" + sFilterOption;
        }
        if (this._oSortExpression && sSortOption !== null) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$orderby=" + sSortOption;
        }
        if ((this._iTopRequestOption || this._bReturnNoEntities) && sTopOption !== null) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$top=" + sTopOption;
        }
        if (this._iSkipRequestOption && sSkipOption !== null) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$skip=" + sSkipOption;
        }
        if (this._bIncludeCount && sInlineCountOption !== null) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$inlinecount=" + sInlineCountOption;
        }
        return sURI;
    },
    _oQueryResult: null,
    _oParameterizationRequest: null,
    _sResourcePath: null,
    _oAggregationLevel: null,
    _oDimensionHierarchies: null,
    _oMeasures: null,
    _bIncludeEntityKey: null,
    _bIncludeCount: null,
    _bReturnNoEntities: null,
    _oFilterExpression: null,
    _oSortExpression: null,
    _iSkipRequestOption: null,
    _iTopRequestOption: null
};
odata4analytics.ParameterValueSetRequest = function (oParameter) {
    this._init(oParameter);
};
odata4analytics.ParameterValueSetRequest.prototype = {
    _init: function (oParameter) {
        this._oParameter = oParameter;
        this._oValueSetResult = {};
        this._oFilterExpression = null;
        this._oSortExpression = null;
    },
    includeParameterText: function (bIncludeText) {
        if (bIncludeText != null) {
            this._oValueSetResult.text = bIncludeText;
        }
    },
    getFilterExpression: function () {
        if (this._oFilterExpression == null) {
            var oEntityType = this._oParameter.getContainingParameterization().getEntityType();
            var oModel = this._oParameter.getContainingParameterization().getTargetQueryResult().getModel();
            this._oFilterExpression = new odata4analytics.FilterExpression(oModel, oEntityType.getSchema(), oEntityType);
        }
        return this._oFilterExpression;
    },
    setFilterExpression: function (oFilter) {
        this._oFilterExpression = oFilter;
    },
    getSortExpression: function () {
        if (this._oSortExpression == null) {
            var oEntityType = this._oParameter.getContainingParameterization().getEntityType();
            this._oSortExpression = new odata4analytics.SortExpression(oEntityType.getModel(), oEntityType.getSchema(), oEntityType);
        }
        return this._oSortExpression;
    },
    setSortExpression: function (oSorter) {
        this._oSortExpression = oSorter;
    },
    getURIQueryOptionValue: function (sQueryOptionName) {
        var sQueryOptionValue = null;
        switch (sQueryOptionName) {
            case "$select": {
                var sSelectOption = "";
                sSelectOption += (sSelectOption == "" ? "" : ",") + this._oParameter.getProperty().name;
                if (this._oValueSetResult.text == true && this._oParameter.getTextProperty()) {
                    sSelectOption += (sSelectOption == "" ? "" : ",") + this._oParameter.getTextProperty().name;
                }
                sQueryOptionValue = (sSelectOption ? sSelectOption : null);
                break;
            }
            case "$filter": {
                var sFilterOption = null;
                if (this._oFilterExpression) {
                    sFilterOption = this._oFilterExpression.getURIFilterOptionValue();
                }
                sQueryOptionValue = (sFilterOption ? sFilterOption : null);
                break;
            }
            case "$orderby": {
                var sSortOption = null;
                if (this._oSortExpression) {
                    sSortOption = this._oSortExpression.getURIOrderByOptionValue();
                }
                sQueryOptionValue = (sSortOption ? sSortOption : null);
                break;
            }
            default: break;
        }
        return sQueryOptionValue;
    },
    getURIToParameterValueSetEntries: function (sServiceRootURI) {
        var sResourcePath = null;
        sResourcePath = (sServiceRootURI ? sServiceRootURI : "") + "/" + this._oParameter.getContainingParameterization().getEntitySet().getQName();
        this.getFilterExpression().checkValidity();
        var sSelectOption = this.getURIQueryOptionValue("$select");
        var sFilterOption = this.getURIQueryOptionValue("$filter");
        var sSortOption = this.getURIQueryOptionValue("$orderby");
        var sURI = sResourcePath;
        var bQuestionmark = false;
        if (sSelectOption) {
            sURI += "?$select=" + sSelectOption;
            bQuestionmark = true;
        }
        if (this._oFilterExpression && sFilterOption) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$filter=" + sFilterOption;
        }
        if (this._oSortExpression && sSortOption) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$orderby=" + sSortOption;
        }
        return sURI;
    },
    _oParameter: null,
    _oFilterExpression: null,
    _oSortExpression: null,
    _oValueSetResult: null
};
odata4analytics.DimensionMemberSetRequest = function (oDimension, oParameterizationRequest, bUseMasterData) {
    this._init(oDimension, oParameterizationRequest, bUseMasterData);
};
odata4analytics.DimensionMemberSetRequest.prototype = {
    _init: function (oDimension, oParameterizationRequest, bUseMasterData) {
        this._oDimension = oDimension;
        this._oParameterizationRequest = oParameterizationRequest;
        this._bUseMasterData = bUseMasterData;
        this._oValueSetResult = {};
        this._oFilterExpression = null;
        this._oSortExpression = null;
        if (this._oParameterizationRequest != null && this._bUseMasterData == true) {
            throw "Parameterized master data entity sets are not yet implemented";
        }
        if (this._bUseMasterData) {
            this._oEntitySet = this._oDimension.getMasterDataEntitySet();
        }
        else {
            this._oEntitySet = this._oDimension.getContainingQueryResult().getEntitySet();
            if (this._oDimension.getContainingQueryResult().getParameterization() && !this._oParameterizationRequest) {
                throw "Missing parameterization request";
            }
        }
    },
    setParameterizationRequest: function (oParameterizationRequest) {
        this._oParameterizationRequest = oParameterizationRequest;
    },
    includeDimensionTextAttributes: function (bIncludeText, bIncludeAttributes) {
        this._oValueSetResult.text = {
            text: false,
            attributes: false
        };
        if (bIncludeText == true) {
            this._oValueSetResult.text = true;
        }
        if (bIncludeAttributes == true) {
            this._oValueSetResult.attributes = true;
        }
    },
    getFilterExpression: function () {
        if (this._oFilterExpression == null) {
            var oEntityType = this._oEntitySet.getEntityType();
            var oModel = this._oDimension.getContainingQueryResult().getModel();
            this._oFilterExpression = new odata4analytics.FilterExpression(oModel, oEntityType.getSchema(), oEntityType);
        }
        return this._oFilterExpression;
    },
    setFilterExpression: function (oFilter) {
        this._oFilterExpression = oFilter;
    },
    getSortExpression: function () {
        if (this._oSortExpression == null) {
            this._oSortExpression = new odata4analytics.SortExpression(this._oEntityType.getModel(), this._oEntityType.getSchema(), this._oEntityType);
        }
        return this._oSortExpression;
    },
    setSortExpression: function (oSorter) {
        this._oSortExpression = oSorter;
    },
    setRequestOptions: function (bIncludeCount) {
        if (bIncludeCount != null) {
            this._bIncludeCount = bIncludeCount;
        }
    },
    setResultPageBoundaries: function (start, end) {
        if (start != null && typeof start !== "number") {
            throw "Start value must be null or numeric";
        }
        if (end !== null && typeof end !== "number") {
            throw "End value must be null or numeric";
        }
        if (start == null) {
            start = 1;
        }
        if (start < 1 || start > (end == null ? start : end)) {
            throw "Invalid values for requested page boundaries";
        }
        this._iSkipRequestOption = (start > 1) ? start - 1 : null;
        this._iTopRequestOption = (end != null) ? (end - start + 1) : null;
    },
    getResultPageBoundaries: function () {
        var iEnd = null;
        if (this._iTopRequestOption != null) {
            if (this._iSkipRequestOption == null) {
                iEnd = 1;
            }
            else {
                iEnd = this._iSkipRequestOption + this._iTopRequestOption;
            }
        }
        return {
            start: (this._iSkipRequestOption == null) ? 1 : this._iSkipRequestOption,
            end: iEnd
        };
    },
    getURIQueryOptionValue: function (sQueryOptionName) {
        var sQueryOptionValue = null;
        switch (sQueryOptionName) {
            case "$select": {
                var sSelectOption = "";
                var oEntityType = this._oEntitySet.getEntityType();
                var aKeyPropName = oEntityType.getKeyProperties();
                var aKeyTextPropName = [];
                if (this._bUseMasterData) {
                    for (var i = -1, sKeyPropName; (sKeyPropName = aKeyPropName[++i]) !== undefined;) {
                        sSelectOption += (sSelectOption == "" ? "" : ",") + sKeyPropName;
                        var oKeyTextProperty = oEntityType.getTextPropertyOfProperty(sKeyPropName);
                        if (oKeyTextProperty) {
                            if (this._oValueSetResult.text == true) {
                                sSelectOption += "," + oKeyTextProperty.name;
                            }
                            aKeyTextPropName.push(oKeyTextProperty.name);
                        }
                    }
                }
                else {
                    sSelectOption += (sSelectOption == "" ? "" : ",") + this._oDimension.getKeyProperty().name;
                    if (this._oValueSetResult.text == true && this._oDimension.getTextProperty()) {
                        sSelectOption += (sSelectOption == "" ? "" : ",") + this._oDimension.getTextProperty().name;
                    }
                }
                if (this._oValueSetResult.attributes) {
                    if (this._bUseMasterData) {
                        var oAllPropertiesSet = oEntityType.getProperties();
                        for (var sPropName in oAllPropertiesSet) {
                            var bIsKeyOrKeyText = false;
                            for (var j = -1, sKeyPropName2; (sKeyPropName2 = aKeyPropName[++j]) !== undefined;) {
                                if (sPropName == sKeyPropName2) {
                                    bIsKeyOrKeyText = true;
                                    break;
                                }
                            }
                            if (bIsKeyOrKeyText) {
                                continue;
                            }
                            for (var k = -1, sKeyTextPropName; (sKeyTextPropName = aKeyTextPropName[++k]) !== undefined;) {
                                if (sPropName == sKeyTextPropName) {
                                    bIsKeyOrKeyText = true;
                                    break;
                                }
                            }
                            if (!bIsKeyOrKeyText) {
                                sSelectOption += "," + sPropName;
                            }
                        }
                    }
                    else {
                        var aAttributeName = this._oDimension.getAllAttributeNames();
                        for (var l = -1, sAttrName; (sAttrName = aAttributeName[++l]) !== undefined;) {
                            sSelectOption += (sSelectOption == "" ? "" : ",") + this._oDimension.findAttributeByName(sAttrName).getName();
                        }
                    }
                }
                sQueryOptionValue = (sSelectOption ? sSelectOption : null);
                break;
            }
            case "$filter": {
                var sFilterOption = null;
                if (this._oFilterExpression) {
                    sFilterOption = this._oFilterExpression.getURIFilterOptionValue();
                }
                sQueryOptionValue = (sFilterOption ? sFilterOption : null);
                break;
            }
            case "$orderby": {
                var sSortOption = null;
                if (this._oSortExpression) {
                    sSortOption = this._oSortExpression.getURIOrderByOptionValue();
                }
                sQueryOptionValue = (sSortOption ? sSortOption : null);
                break;
            }
            case "$top": {
                if (this._iTopRequestOption !== null) {
                    sQueryOptionValue = this._iTopRequestOption;
                }
                break;
            }
            case "$skip": {
                sQueryOptionValue = this._iSkipRequestOption;
                break;
            }
            case "$inlinecount": {
                sQueryOptionValue = (this._bIncludeCount == true ? "allpages" : null);
                break;
            }
            default: break;
        }
        return sQueryOptionValue;
    },
    getURIToDimensionMemberEntitySet: function (sServiceRootURI) {
        var sResourcePath = null;
        if (!this._bUseMasterData && this._oParameterizationRequest) {
            sResourcePath = this._oParameterizationRequest.getURIToParameterizationEntry(sServiceRootURI) + "/" + this._oDimension.getContainingQueryResult().getParameterization().getNavigationPropertyToQueryResult();
        }
        else {
            sResourcePath = (sServiceRootURI ? sServiceRootURI : "") + "/" + this._oEntitySet.getQName();
        }
        return sResourcePath;
    },
    getURIToDimensionMemberEntries: function (sServiceRootURI) {
        var sResourcePath = this.getURIToDimensionMemberEntitySet(sServiceRootURI);
        this.getFilterExpression().checkValidity();
        var sSelectOption = this.getURIQueryOptionValue("$select");
        var sFilterOption = this.getURIQueryOptionValue("$filter");
        var sSortOption = this.getURIQueryOptionValue("$orderby");
        var sTopOption = this.getURIQueryOptionValue("$top");
        var sSkipOption = this.getURIQueryOptionValue("$skip");
        var sInlineCountOption = this.getURIQueryOptionValue("$inlinecount");
        var sURI = sResourcePath;
        var bQuestionmark = false;
        if (sSelectOption) {
            sURI += "?$select=" + sSelectOption;
            bQuestionmark = true;
        }
        if (this._oFilterExpression && sFilterOption) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$filter=" + sFilterOption;
        }
        if (this._oSortExpression && sSortOption) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$orderby=" + sSortOption;
        }
        if (this._iTopRequestOption && sTopOption) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$top=" + sTopOption;
        }
        if (this._iSkipRequestOption && sSkipOption) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$skip=" + sSkipOption;
        }
        if (this._bIncludeCount && sInlineCountOption) {
            if (!bQuestionmark) {
                sURI += "?";
                bQuestionmark = true;
            }
            else {
                sURI += "&";
            }
            sURI += "$inlinecount=" + sInlineCountOption;
        }
        return sURI;
    },
    _oDimension: null,
    _oParameterizationRequest: null,
    _oEntitySet: null,
    _bUseMasterData: false,
    _oFilterExpression: null,
    _oSortExpression: null,
    _oValueSetResult: null,
    _bIncludeCount: null,
    _iSkipRequestOption: 0,
    _iTopRequestOption: null
};