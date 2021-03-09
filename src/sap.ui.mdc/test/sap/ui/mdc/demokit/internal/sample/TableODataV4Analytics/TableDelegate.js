/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/odata/v4/TableDelegate",
	"delegates/odata/v4/TableDelegate",
	"sap/ui/mdc/odata/v4/ODataMetaModelUtil",
	"sap/ui/mdc/odata/v4/TypeUtil",
	"sap/ui/mdc/table/Column",
	"sap/ui/unified/Currency",
	"sap/base/Log"
], function (
	TableDelegate,
	TestDelegate,
	ODataMetaModelUtil,
	TypeUtil,
	Column,
	Currency,
	Log
) {
	"use strict";

	/**
	 * Test delegate for OData V4 with analytical capabilities.
	 */
	var AnalyticsTableDelegate = Object.assign({}, TableDelegate, TestDelegate);
	AnalyticsTableDelegate.rebindTable = TableDelegate.rebindTable;
	AnalyticsTableDelegate.validateState = TableDelegate.validateState;


	function getMetadataInfo(oTable) {
		return oTable ? oTable.getDelegate().payload : undefined;
	}

	/**
	 * Fetches the relevant metadata for the table and returns property extensions map in a promise.
	 *
	 * @param {Object} oTable Instance of the mdc Table
	 * @param {object[]} aPropertyInfos The property infos received from <code>fetchProperties</code>
	 * @returns {Promise} property extensions promise
	 */
	AnalyticsTableDelegate.fetchPropertyExtensions = function(oTable, aPropertyInfos) {
		var mExtensions = {};
		var oModel = this._getModel(oTable);
		var oMetadataInfo = getMetadataInfo(oTable);
		var sEntitySetPath = "/" + oMetadataInfo.collectionName;
		var oMetaModel = oModel.getMetaModel();

		return Promise.all([
			oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "/@")
		]).then(function(aResults) {
			var mEntitySet = aResults[0],
				mAnnotations = aResults[1],
				mAllCustomAggregates = ODataMetaModelUtil.getAllCustomAggregates(mAnnotations);

			// process the Qualifier of the CustomAggregate annotation if it matches the property name in the EntityType
			for (var sKey in mAllCustomAggregates) {
				if (sKey in mEntitySet) {
					if ("contextDefiningProperties" in mAllCustomAggregates[sKey]) {
						var aContextDefiningProperties = mAllCustomAggregates[sKey].contextDefiningProperties,
							aContextDefiningPropertiesPaths = [];

						for (var i = 0; i < aContextDefiningProperties.length; i++) {
							aContextDefiningPropertiesPaths.push(aContextDefiningProperties[i].$PropertyPath);
						}

						mExtensions[sKey] = {
							defaultAggregate: {
								contextDefiningProperties: aContextDefiningPropertiesPaths
							}
						};
					} else {
						mExtensions[sKey] = {
							defaultAggregate: {}
						};
					}
				}
			}

			return mExtensions;
		});
	};

	AnalyticsTableDelegate._createColumnTemplate = function(oPropertyInfo, oTable) {
		var oProperty = oTable.getPropertyHelper().getProperty(oPropertyInfo.name);

		if (oProperty.isComplex()) {
			var aReferencedProperties = oProperty.getReferencedProperties();
			return Promise.resolve(new Currency({
				useSymbol: false,
				value: {
					path: aReferencedProperties[0].getPath()
				},
				currency: {
					path: aReferencedProperties[1].getPath()
				}
			}));
		}

		return TestDelegate._createColumnTemplate.apply(this, arguments);
	};

	AnalyticsTableDelegate._getColumnInfo = function(oPropertyInfo, oTable) {
		var oColumnInfo = TestDelegate._getColumnInfo.apply(this, arguments);

		if (oTable.getPropertyHelper().isComplex(oPropertyInfo.name)) {
			oColumnInfo.hAlign = "Right";
			oColumnInfo.width = "15rem";
		}

		return oColumnInfo;
	};

	AnalyticsTableDelegate._createPropertyInfos = function(oTable, oModel) {
		var oMetadataInfo = getMetadataInfo(oTable), aProperties = [], oPropertyInfo, oComplexPropertyInfo, oObj, oPropertyAnnotations;
		var sEntitySetPath = "/" + oMetadataInfo.collectionName;
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
				oObj = oEntityType[sKey];
				if (oObj && oObj.$kind === "Property") {

					if (oObj.$isCollection) {
						Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
						continue;
					}

					oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");
					var oUnitAnnotation = oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"] || oPropertyAnnotations["@Org.OData.Measures.V1.Unit"];
					oPropertyInfo = {
						name: sKey,
						path: sKey,
						label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
						sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
						filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
						typeConfig: TypeUtil.getTypeConfig(oObj.$Type),
						maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,

						// relevant for Analytics
						groupable: oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"] || false,
						unit: oUnitAnnotation ? oUnitAnnotation.$Path : undefined,
						key: oEntityType.$Key.indexOf(sKey) > -1
					};
					aProperties.push(oPropertyInfo);

					if (oPropertyInfo.unit) {
						oComplexPropertyInfo = {
							name: sKey + "_" + oPropertyInfo.unit,
							label: (oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey) + " Complex",
							propertyInfos: [sKey, oPropertyInfo.unit],
							exportSettings: {
								type: "Currency",
								unitProperty: oPropertyInfo.unit,
								delimiter: true
							}
						};

						aProperties.push(oComplexPropertyInfo);
					}
				}
			}

			return aProperties;
		});
	};

	return AnalyticsTableDelegate;
});