/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/odata/v4/vizChart/ChartDelegate",
    "sap/ui/mdc/odata/v4/ODataMetaModelUtil",
    "sap/ui/mdc/library",
    "./Books.FB.delegate",
    "sap/ui/mdc/enum/FieldDisplay"
], function(ChartDelegate, ODataMetaModelUtil, MDCLib, BooksFBDelegate, FieldDisplay) {
    "use strict";

    var SampleChartDelegate = Object.assign({}, ChartDelegate);

    SampleChartDelegate._createPropertyInfos = function (oMDCChart, oModel) {
        var oMetadataInfo = oMDCChart.getDelegate().payload;
        var aProperties = [];
        var sEntitySetPath = "/" + oMetadataInfo.collectionName;
        var oMetaModel = oModel.getMetaModel();

        return Promise.all([
            oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "@")
        ]).then(function (aResults) {
            var oEntityType = aResults[0], mEntitySetAnnotations = aResults[1];
            var oSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
            var oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(oSortRestrictions);
            var oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
            var oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);

            for (var sKey in oEntityType) {
                var oObj = oEntityType[sKey];

                if (oObj && oObj.$kind === "Property") {
                    // ignore (as for now) all complex properties
                    // not clear if they might be nesting (complex in complex)
                    // not clear how they are represented in non-filterable annotation
                    // etc.
                    if (oObj.$isCollection) {
                        //Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
                        continue;
                    }

                    var oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");

                    //TODO: Check what we want to do with properties neither aggregatable nor groupable
                    //Right now: skip them, since we can't create a chart from it
                    if (!oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"] && !oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"]) {
                        continue;
                    }

                    if (oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"]){
                        aProperties = aProperties.concat(this._createPropertyInfosForAggregatable(sKey, oPropertyAnnotations, oObj, oFilterRestrictionsInfo, oSortRestrictionsInfo));
                    }

                    if (oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"]) {

                        var sTextProperty = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] ? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path  : null;

                        if (sTextProperty && sTextProperty.indexOf("/") > -1) {
                            sTextProperty = null; //Expand is not supported
                        }

                        aProperties.push({
                            name: sKey,
                            propertyPath: sKey,
                            label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
                            sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
                            filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
                            groupable: true,
                            aggregatable: false,
                            maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
                            sortKey: sKey,
                            typeConfig: this.getTypeUtil().getTypeConfig(oObj.$Type, null, {}),
                            kind:  "Groupable", //TODO: Rename in type; Only needed for P13n Item Panel
                            availableRoles: this._getLayoutOptionsForType("groupable"), //for p13n
                            role: MDCLib.ChartItemRoleType.category, //standard, normally this should be interpreted from UI.Chart annotation
                            textProperty:  sTextProperty
                        });
                    }
                }
            }
            return aProperties;
        }.bind(this));

    };

    var getFullId = function(oControl, sVHId) {
		var oView = oControl.getParent();
		while (!oView.isA("sap.ui.core.mvc.View")) {
			oView = oView.getParent();
		}
		return oView.getId() + "--" + sVHId;
	};

    SampleChartDelegate.getFilterDelegate = function() {
		return {
			addItem: function(sPropertyName, oTable) {
				return BooksFBDelegate.addItem(sPropertyName, oTable)
				.then(function(oFilterField) {

					var oProp = oTable.getPropertyHelper().getProperty(sPropertyName);

					var oConstraints = oProp.typeConfig.typeInstance.getConstraints();
					var oFormatOptions = oProp.typeConfig.typeInstance.getFormatOptions();

					oFilterField.setDataTypeConstraints(oConstraints);
					oFilterField.setDataTypeFormatOptions(oFormatOptions);

					if (sPropertyName === "author_ID") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH1"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "title") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH4"));
					} else if (sPropertyName === "published") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHPublished"));
						oFilterField.setOperators(["EQ", "GT", "LT", "BT", "MEDIEVAL", "RENAISSANCE", "MODERN", "LASTYEAR"]);
					} else if (sPropertyName === "language_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHLanguage"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "stock") {
						oFilterField.setMaxConditions(1);
						oFilterField.setOperators(["BT"]);
					} else if (sPropertyName === "classification_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHClassification"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "genre_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHGenre"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "subgenre_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHSubGenre"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "detailgenre_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FHDetailGenre"));
						oFilterField.setDisplay(FieldDisplay.Description);
					} else if (sPropertyName === "currency_code") {
						oFilterField.setFieldHelp(getFullId(oTable, "FH-Currency"));
						oFilterField.setDisplay(FieldDisplay.Value);
						oFilterField.setMaxConditions(1);
						oFilterField.setOperators(["EQ"]);
					}
					return oFilterField;
				});
			}
		};
	};

    return SampleChartDelegate;
}, /* bExport= */ true);
