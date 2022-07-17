/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/odata/v4/vizChart/ChartDelegate",
    "sap/ui/mdc/odata/v4/ODataMetaModelUtil",
    "sap/ui/mdc/library",
    "./Books.FB.delegate",
	"./GridTable.delegate",
    "sap/ui/mdc/enum/FieldDisplay",
    "sap/base/Log",
	"sap/ui/core/Core"
], function(ChartDelegate, ODataMetaModelUtil, MDCLib, BooksFBDelegate, GridTableDelegate, FieldDisplay, Log, Core) {
    "use strict";

    var SampleChartDelegate = Object.assign({}, ChartDelegate);
    //Store the fetched properties during pre-processing in here
    var aCachedProps;

    SampleChartDelegate.addItem = function(sDataPropertyName, oMDCChart, mPropertyBag, sRole){
        //Pre-Processing -> Cache the needed propertyInfos
        if (mPropertyBag.modifier.targets === "xmlTree") {
			return this.checkPropertyInfo(sDataPropertyName, oMDCChart, mPropertyBag).then(function(){

					return this.fetchProperties(oMDCChart, mPropertyBag).then(function(aFetchedProps){
						if (aFetchedProps) {
							var oMDCItem = this.getMDCItemPrePos(sDataPropertyName, oMDCChart, sRole, aFetchedProps, mPropertyBag);
							return oMDCItem;
						}

						return ChartDelegate.addItem.call(this, sDataPropertyName, oMDCChart, mPropertyBag, sRole);
					}.bind(this));
			}.bind(this));

		}

        return ChartDelegate.addItem.call(this, sDataPropertyName, oMDCChart, mPropertyBag, sRole);
    };

    var fnGetFetchedPropertiesObject = function() {
		return aCachedProps;
	};
	var fnSetFetchedPropertiesObject = function(aProperties) {
		aCachedProps = aProperties;
	};

	var fnAddPropertyInfoEntry = function(oControl, sPropertyName, aPropertyInfo, aFetchedProperties, oModifier) {

		if (aFetchedProperties) {
			var nIdx = aFetchedProperties.findIndex(function(oEntry) {
				return oEntry.name === sPropertyName;
			});

			if (nIdx >= 0) {
				aPropertyInfo.push(aFetchedProperties[nIdx]);
				oModifier.setProperty(oControl, "propertyInfo", aPropertyInfo);
			} else {
				Log.error("ChartItemFlex-ChangeHandler: no property info for '" + sPropertyName + "'");
			}
		}
	};

	SampleChartDelegate.getMDCItemPrePos = function(sPropertyName, oMDCChart, sRole, aProps, mPropertyBag){
		var oModifier = mPropertyBag.modifier;
		var oPropertyInfo = aProps.find(function(oEntry) {
			return oEntry.name === sPropertyName;
		});

		if (!oPropertyInfo) {
			return null;
		}

		return oModifier.getProperty(oMDCChart, "id").then(function(sId){
			if (oPropertyInfo.groupable) {

				return oModifier.createControl("sap.ui.mdc.chart.Item", mPropertyBag.appComponent, mPropertyBag.view, sId + "--GroupableItem--" + sPropertyName,{
					name: oPropertyInfo.name,
                    label: oPropertyInfo.label,
                    type: "groupable",
                    role: sRole ? sRole : "category"
				});
            }

            if (oPropertyInfo.aggregatable) {

				return oModifier.createControl("sap.ui.mdc.chart.Item", mPropertyBag.appComponent, mPropertyBag.view, sId + "--AggregatableItem--" + sPropertyName,{
					name: oPropertyInfo.name,
                    label: oPropertyInfo.label,
                    type: "aggregatable",
                    role: sRole ? sRole : "axis1"
				});
            }

            return null;
		});

	};

	SampleChartDelegate.checkPropertyInfo = function(sPropertyName, oControl, mPropertyBag){
		var oModifier = mPropertyBag.modifier;
		return oModifier.getProperty(oControl, "propertyInfo")
		.then(function(aPropertyInfo) {
			var nIdx = aPropertyInfo.findIndex(function(oEntry) {
				return oEntry.name === sPropertyName;
			});

			if (nIdx < 0) {

				var aFetchedProperties = fnGetFetchedPropertiesObject();
				if (aFetchedProperties) {
					fnAddPropertyInfoEntry(oControl, sPropertyName, aPropertyInfo, aFetchedProperties, oModifier);
				} else {
                    return this.fetchProperties(oControl, mPropertyBag)
                    .then(function(aProperties) {
                        fnSetFetchedPropertiesObject(aProperties);
                        fnAddPropertyInfoEntry(oControl, sPropertyName, aPropertyInfo, aProperties, oModifier);
                    });
				}
			}
		}.bind(this));
	};

	/**
     * Override for pre-processing case
     */
	SampleChartDelegate.fetchProperties = function (oMDCChart, mPropertyBag) {

		//Custom handling for fetchProperties during pre-processing
		if (mPropertyBag && mPropertyBag.modifier.targets === "xmlTree") {
			var oModifier = mPropertyBag.modifier;

			return oModifier.getProperty(oMDCChart, "delegate")
					.then(function(oDelegate){
						var sModelName =  oDelegate.payload.modelName === null ? undefined : oDelegate.payload.model;
						var oModel = mPropertyBag.appComponent.getModel(sModelName);

						return this._createPropertyInfos(oDelegate.payload, oModel);
					}.bind(this));
		}

		return ChartDelegate.fetchProperties.call(this, oMDCChart);
	};

    SampleChartDelegate._createPropertyInfos = function (oDelegatePayload, oModel) {
        //var oMetadataInfo = oMDCChart.getDelegate().payload;
        var aProperties = [];
        var sEntitySetPath = "/" + oDelegatePayload.collectionName;
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
                            //typeConfig: this.getTypeUtil().getTypeConfig(oObj.$Type, null, {}),
                            dataType: oObj.$Type,
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
			},
			addCondition: function(sPropertyName, oChart, mPropertyBag) {
				return BooksFBDelegate.addCondition(sPropertyName, oChart, mPropertyBag);
			},
			removeCondition: function(sPropertyName, oChart, mPropertyBag) {
				return BooksFBDelegate.removeCondition(sPropertyName, oChart, mPropertyBag);
			}
		};
	};

	SampleChartDelegate.updateBindingInfo = function(oChart, oBindingInfo) {
		ChartDelegate.updateBindingInfo.apply(this, arguments);

		var oFilterBar = Core.byId(oChart.getFilter());

		if (oFilterBar) {
			GridTableDelegate._updateSearch(oBindingInfo, oFilterBar);

			if (oBindingInfo.filters) { // adjust already created filters as it may come from FilterBar or from Table-Filtering
				GridTableDelegate._updateDateTimeFilter(oBindingInfo, oFilterBar.getPropertyHelper().getProperties());
			}
		}

	};

    return SampleChartDelegate;
}, /* bExport= */ true);
