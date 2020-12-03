/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/odata/v4/TableDelegateDemo',
	'sap/ui/mdc/odata/v4/ODataMetaModelUtil',
	'sap/ui/mdc/odata/TypeUtil',
	'sap/ui/mdc/table/Column',
	'sap/ui/unified/Currency',
	'sap/base/Log'
], function (
	TableDelegate,
	ODataMetaModelUtil,
	TypeUtil,
	Column,
	Currency,
	Log
) {
	"use strict";

	/**
	 * Helper class for sap.ui.mdc.Table.
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.86
	 * @alias sap.ui.mdc.sample.AnalyticsTableDelegate
	*/
	var AnalyticsTableDelegate = Object.assign({}, TableDelegate);

	/**
	 * Fetches the relevant metadata for the table and returns property info array in a promise.
	 *
	 * @param {Object} oTable - instance of the mdc Table
	 * @returns {Promise} property info promise
	 */
	AnalyticsTableDelegate.fetchProperties = function(oTable) {
		var oModel = getModel(oTable);

		return new Promise(function(resolve) {
			if (!oModel) {
				oTable.attachModelContextChange({
					resolver: resolve
				}, onModelContextChange);
			} else {
				createPropertyInfos(oTable, oModel).then(resolve);
			}
		});
	};

	/**
	 * Fetches the relevant metadata for the table and returns property extensions map in a promise.
	 *
	 * @param {Object} oTable - instance of the mdc Table
	 * @returns {Promise} property extensions promise
	 */
	AnalyticsTableDelegate.fetchPropertyExtensions = function(oTable) {
		var oModel = getModel(oTable);

		return new Promise(function(resolve) {
			if (!oModel) {
				oTable.attachModelContextChange({
					resolver: resolve
				}, onModelContextChangeForExtensions);
			} else {
				createPropertyExtensions(oTable, oModel).then(resolve);
			}
		});
	};

	AnalyticsTableDelegate.addItem = function(sPropertyName, oTable, mPropertyBag) {
		var oPropertyHelper = oTable.getPropertyHelper();
		if (oPropertyHelper.isComplex(sPropertyName)) {
			return this._createComplexColumn(sPropertyName, oTable);
		}

		return TableDelegate.addItem.apply(this, arguments);
	};

	/**
	 * Creates <code>sap.ui.mdc.table.Column</code> control for the provided complex property.
	 *
	 * @param {String} sPropertyInfoName Complex property info name
	 * @param {sap.ui.mdc.Table} oTable Table instance
	 * @returns {sap.ui.mdc.table.Column} column instance along with its template
	 */
	AnalyticsTableDelegate._createComplexColumn = function(sPropertyInfoName, oTable) {
		return oTable.awaitPropertyHelper().then(function(oPropertyHelper) {
			var oPropertyInfo = oPropertyHelper.getProperty(sPropertyInfoName);

			if (!oPropertyInfo) {
				return null;
			}

			return this._createComplexColumnTemplate(oPropertyInfo).then(function(oTemplate) {
				var sPropertyName = oPropertyInfo.getName();
				var oColumnInfo = {
					header: oPropertyInfo.getLabel(),
					dataProperty: sPropertyName,
					template: oTemplate,
					hAlign: "Right",
					width: "15rem"
				};
				return new Column(oTable.getId() + "--" + sPropertyName, oColumnInfo);
			});
		}.bind(this));
	};

	/**
	 * Creates the cell template for then <code>sap.ui.mdc.table.Column</code> control template,
	 *
	 * @param {Object} oPropertyInfo PropertyInfo object
	 * @returns {Promise} <code>sap.ui.unified.Currency</code> control template
	 */
	AnalyticsTableDelegate._createComplexColumnTemplate = function(oPropertyInfo) {
		var aReferencedProperties = oPropertyInfo.getReferencedProperties();
		var oCurrency = new Currency({
			useSymbol: false,
			value: {
				path: aReferencedProperties[0].getPath()
			},
			currency: {
				path: aReferencedProperties[1].getPath()
			}
		});

		return Promise.resolve(oCurrency);
	};

	function getMetadataInfo(oTable) {
		return oTable ? oTable.getDelegate().payload : undefined;
	}

	function getModel(oTable) {
		var oMetadataInfo = getMetadataInfo(oTable);
		return oTable && oMetadataInfo ? oTable.getModel(oMetadataInfo.model) : undefined;
	}

	function onModelContextChange(oEvent, oData) {
		var oTable = oEvent.getSource();
		var oModel = getModel(oTable);
		if (oModel) {
			createPropertyInfos(oTable, oModel).then(oData.resolver);
			oTable.detachModelContextChange(onModelContextChange);
		}
	}

	function onModelContextChangeForExtensions(oEvent, oData) {
		var oTable = oEvent.getSource();
		var oModel = getModel(oTable);
		if (oModel) {
			createPropertyExtensions(oTable, oModel).then(oData.resolver);
			oTable.detachModelContextChange(onModelContextChangeForExtensions);
		}
	}

	function createPropertyInfos(oTable, oModel) {
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
						label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
						sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
						filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
						typeConfig: TypeUtil.getTypeConfig(oObj.$Type),
						fieldHelp: undefined,
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
	}

	function createPropertyExtensions(oTable, oModel) {
		var mExtensions = {},
			oMetadataInfo = getMetadataInfo(oTable),
			sEntitySetPath = "/" + oMetadataInfo.collectionName,
			oMetaModel = oModel.getMetaModel();

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
	}

	return AnalyticsTableDelegate;
});