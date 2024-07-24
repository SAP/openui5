/*!
 * ${copyright}
 */
sap.ui.define([
	"delegates/odata/v4/vizChart/ChartDelegate",
	"delegates/odata/v4/ODataMetaModelUtil",
	"./Books.FB.delegate",
	"./GridTable.delegate",
	"sap/ui/core/Element",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/OperatorName",
	"sap/base/Log",
	"sap/ui/mdc/enums/ChartItemRoleType",
	"delegates/util/DelegateCache",
	"sap/ui/mdc/Link"
], function(
	ChartDelegate,
	ODataMetaModelUtil,
	BooksFBDelegate,
	GridTableDelegate,
	Element,
	FieldDisplay,
	OperatorName,
	Log,
	ChartItemRoleType,
	DelegateCache,
	Link) {
	"use strict";

	var SampleChartDelegate = Object.assign({}, ChartDelegate);
	//Store the fetched properties during pre-processing in here
	var aCachedProps;

	SampleChartDelegate.addItem = function(oChart, sPropertyKey, mPropertyBag, sRole) {
		//Pre-Processing -> Cache the needed propertyInfos
		if (mPropertyBag.modifier.targets === "xmlTree") {
			return this.checkPropertyInfo(sPropertyKey, oChart, mPropertyBag).then(function() {

				return this.fetchProperties(oChart, mPropertyBag).then(function(aFetchedProps) {
					if (aFetchedProps) {
						var oMDCItem = this.getMDCItemPrePos(sPropertyKey, oChart, sRole, aFetchedProps, mPropertyBag);
						return oMDCItem;
					}

					return ChartDelegate.addItem.call(this, oChart, sPropertyKey, mPropertyBag, sRole);
				}.bind(this));
			}.bind(this));

		}

		return ChartDelegate.addItem.call(this, oChart, sPropertyKey, mPropertyBag, sRole);
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

	SampleChartDelegate.getMDCItemPrePos = function(sPropertyName, oChart, sRole, aProps, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oPropertyInfo = aProps.find(function(oEntry) {
			return oEntry.name === sPropertyName;
		});

		if (!oPropertyInfo) {
			return null;
		}

		return oModifier.getProperty(oChart, "id").then(function(sId) {
			if (oPropertyInfo.groupable) {

				return oModifier.createControl("sap.ui.mdc.chart.Item", mPropertyBag.appComponent, mPropertyBag.view, sId + "--GroupableItem--" + sPropertyName, {
					propertyKey: oPropertyInfo.name,
					label: oPropertyInfo.label,
					type: "groupable",
					role: sRole ? sRole : "category"
				});
			}

			if (oPropertyInfo.aggregatable) {

				return oModifier.createControl("sap.ui.mdc.chart.Item", mPropertyBag.appComponent, mPropertyBag.view, sId + "--AggregatableItem--" + sPropertyName, {
					propertyKey: oPropertyInfo.name,
					label: oPropertyInfo.label,
					type: "aggregatable",
					role: sRole ? sRole : "axis1"
				});
			}

			return null;
		});

	};

	SampleChartDelegate.checkPropertyInfo = function(sPropertyName, oControl, mPropertyBag) {
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
	SampleChartDelegate.fetchProperties = function(oChart, mPropertyBag) {

		//Custom handling for fetchProperties during pre-processing
		if (mPropertyBag && mPropertyBag.modifier.targets === "xmlTree") {
			var oModifier = mPropertyBag.modifier;

			return oModifier.getProperty(oChart, "delegate")
				.then(function(oDelegate) {
					var sModelName = oDelegate.payload.modelName === null ? undefined : oDelegate.payload.model;
					var oModel = mPropertyBag.appComponent.getModel(sModelName);

					return this._createPropertyInfos(oChart, oModel);
				}.bind(this));
		}

		return ChartDelegate.fetchProperties.call(this, oChart);
	};

	SampleChartDelegate._createPropertyInfos = function(oChart, oModel) {
		var oDelegatePayload = oChart.getDelegate().payload;
		var aProperties = [];
		var sEntitySetPath = "/" + oDelegatePayload.collectionName;
		var oMetaModel = oModel.getMetaModel();

		return Promise.all([
			oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "@")
		]).then(function(aResults) {
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

					if (sKey === "modifiedAt" || sKey === "createdAt" || sKey === "currency_code") {
						oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"] = true;
					}

					let vConstraints = null;
					if (oObj.$Precision > 0) {
						vConstraints = {precision: oObj.$Precision};
					}

					//TODO: Check what we want to do with properties neither aggregatable nor groupable
					//Right now: skip them, since we can't create a chart from it
					if (!oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"] && !oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"]) {
						continue;
					}

					if (oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"]) {
						aProperties = aProperties.concat(this._createPropertyInfosForAggregatable(sKey, oPropertyAnnotations, oObj, oFilterRestrictionsInfo, oSortRestrictionsInfo));
					}

					if (oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"]) {

						var sTextProperty = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] ? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path : null;

						if (sTextProperty && sTextProperty.indexOf("/") > -1) {
							sTextProperty = null; //Expand is not supported
						}

						// let sSortKey = sKey;
						// if (oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]?.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" && sTextProperty) {
						// 	sSortKey = sTextProperty;
						// }

						aProperties.push({
							name: sKey,
							path: sKey,
							label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
							sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
							// sortKey: sSortKey,
							filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
							groupable: true,
							aggregatable: false,
							maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo[sKey]?.allowedExpressions) ? -1 : 1,
							// visible: sKey !== "modifiedAt", via visible a dimension can be removed from the settings dialog.
							constraints: vConstraints,
							dataType: oObj.$Type,
							role: ChartItemRoleType.category, //standard, normally this should be interpreted from UI.Chart annotation
							textProperty: sTextProperty,
							textFormatter: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] || null
						});

					}
				}
			}

			DelegateCache.add(oChart, {
				"ID": { dataTypeFormatOptions: { groupingEnabled: false } },
				"author_ID": { dataTypeFormatOptions: { groupingEnabled: false }, valueHelp: "FH1", display: FieldDisplay.Description },
				"title": { valueHelp: "FH4" },
				"published": { valueHelp: "FHPublished", operators: [OperatorName.EQ, OperatorName.GT, OperatorName.LT, OperatorName.BT, "MEDIEVAL", "RENAISSANCE", "MODERN", OperatorName.LASTYEAR] },
				"language_code": { dataTypeConstraints: { nullable: false, maxLength: 3 }, valueHelp: "FHLanguage", maxConditions: 1, display: FieldDisplay.Description },
				"stock": { maxConditions: 1, operators: [OperatorName.BT] },
				"classification_code": { valueHelp: "FHClassification", display: FieldDisplay.Description },
				"genre_code": { valueHelp: "FHGenre", display: FieldDisplay.Description },
				"subgenre_code": { valueHelp: "FHSubGenre", display: FieldDisplay.Description },
				"detailgenre_code": { valueHelp: "FHDetailGenre", display: FieldDisplay.Description },
				"currency_code": { valueHelp: "FH-Currency", display: FieldDisplay.Value, maxConditions: 1, operators: [OperatorName.EQ] },
				"createdAt": { maxConditions: 1, operators: ["MYDATE", "MYDATERANGE", OperatorName.EQ, OperatorName.GE, OperatorName.LE, OperatorName.BT, OperatorName.LT, OperatorName.TODAY, OperatorName.YESTERDAY, OperatorName.TOMORROW, OperatorName.LASTDAYS, "MYNEXTDAYS", OperatorName.THISWEEK, OperatorName.THISMONTH, OperatorName.THISQUARTER, OperatorName.THISYEAR, OperatorName.NEXTHOURS, OperatorName.NEXTMINUTES, OperatorName.LASTHOURS] }
			}, "$Filters");

			return aProperties;
		}.bind(this));

	};

	SampleChartDelegate.getFilterDelegate = function() {
		return {
			addItem: BooksFBDelegate.addItem.bind(BooksFBDelegate),
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

		var oFilterBar = Element.getElementById(oChart.getFilter());

		if (oFilterBar) {
			GridTableDelegate._updateSearch(oBindingInfo, oFilterBar);

			if (oBindingInfo.filters) { // adjust already created filters as it may come from FilterBar or from Table-Filtering
				GridTableDelegate._updateDateTimeFilter(oBindingInfo, oFilterBar.getPropertyHelper().getProperties());
			}
		}

	};

	SampleChartDelegate.formatText = function(vValue, sDesc) {
		const sValue = this.typeConfig?.typeInstance?.formatValue(vValue, "string") || vValue;

		if (sDesc) {
			const oTextArrangementAnnotation = this.textFormatter;
			if (
				!oTextArrangementAnnotation ||
				oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst"
			) {
				return `${sDesc} (${sValue})`;
			} else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
				return `${sValue} (${sDesc})`;
			} else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
				return sDesc;
			}
		}
		return sDesc ? sDesc : sValue;
	};

	SampleChartDelegate.fetchFieldInfos = (oChart, oSelectionDetails, oBindingContext) => {
		const oAuthorLink = new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
				payload: {
					semanticObjects: ["FakeFlpSemanticObject_author"]
				}
			},
			sourceControl: oSelectionDetails
		});
		oAuthorLink.setBindingContext(oBindingContext);
		oSelectionDetails.addDependent(oAuthorLink);

		const oBookLink = new Link({
			delegate: {
				name: "sap/ui/mdc/ushell/LinkDelegate",
				payload: {
					semanticObjects: ["FakeFlpSemanticObject_book"]
				}
			},
			sourceControl: oSelectionDetails
		});
		oBookLink.setBindingContext(oBindingContext);
		oSelectionDetails.addDependent(oBookLink);

		return Promise.resolve({
			"Author": oAuthorLink,
			"Book": oBookLink
		});
	};

	SampleChartDelegate.determineEnableNavForDetailsItem = (oChart, mData, oContext) => {
		return SampleChartDelegate._determineSemanticObjectsforDetailsPopover(oChart, mData, oContext).length > 0;
	};

	SampleChartDelegate._determineSemanticObjectsforDetailsPopover = function(oChart, mData, oContext) {
		const mSemanticObjects = oChart.getDelegate().payload.semanticObjects;
		const aSemanticObjects = [];

		if (mSemanticObjects) {
			Object.keys(mData).forEach((sKey) => {
				if (mSemanticObjects[sKey]) {
					mSemanticObjects[sKey].forEach((sSemanticObject) => {
						if (!aSemanticObjects.some((sSemanticObjectInArray) => sSemanticObject === sSemanticObjectInArray)) {
							aSemanticObjects.push(sSemanticObject);
						}
					});
				}
			});
		}

		return aSemanticObjects;
	};

	return SampleChartDelegate;
});
