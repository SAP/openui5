/*!
 * ${copyright}
 */

sap.ui.define([
	"../../TableDelegateUtils",
	"sap/ui/mdc/odata/v4/TableDelegate",
	"delegates/odata/v4/FilterBarDelegate",
	"delegates/odata/v4/ODataMetaModelUtil",
	"delegates/odata/v4/util/DelegateUtil",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/unified/Currency",
	"sap/ui/model/Filter",
	"sap/ui/core/Core",
	"sap/base/Log",
	'sap/ui/mdc/odata/v4/TypeMap'

], function(
	TableDelegateUtils,
	TableDelegate,
	FilterBarDelegate,
	ODataMetaModelUtil,
	DelegateUtil,
	FilterUtil,
	Currency,
	Filter,
	Core,
	Log,
	ODataV4TypeMap
) {
	"use strict";

	/**
	 * Test delegate for OData V4.
	 */
	var TestTableDelegate = Object.assign({}, TableDelegate);

	TestTableDelegate.addItem = function(oTable, sPropertyName, mPropertyBag) {
		return TableDelegateUtils.createColumn(oTable, sPropertyName, function(oTable, oProperty) {
			if (oProperty.name.endsWith("_ComplexWithUnit")) {
				var aProperties = oProperty.getSimpleProperties();

				return new Currency({
					useSymbol: false,
					value: {
						path: aProperties[0].getPath()
					},
					currency: {
						path: aProperties[1].getPath()
					}
				});
			}
		}).then(function(oColumn) {
			if (sPropertyName.endsWith("_ComplexWithUnit")) {
				oColumn.setHAlign("Right");
				oColumn.setWidth("15rem");
			}

			return oColumn;
		});
	};

	TestTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		var oMetadataInfo = oTable.getPayload();
		oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || "/" + oMetadataInfo.collectionName;
		oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;

		//TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
		var oDataStateIndicator = oTable.getDataStateIndicator();
		if (!oDataStateIndicator || !oDataStateIndicator.isFiltering()) {
			var aFilters = createInnerFilters.call(this, oTable).concat(createOuterFilters.call(this, oTable));
			if (aFilters.length) {
				oBindingInfo.filters = new Filter(aFilters, true);
			}
		}

		addSearchParameter(oTable, oBindingInfo);
	};

	function createInnerFilters(oTable) {
		var bFilterEnabled = oTable.isFilteringEnabled();
		var aFilters = [];

		if (bFilterEnabled) {
			var aTableProperties = oTable.getPropertyHelper().getProperties();
			var oInnerFilterInfo = FilterUtil.getFilterInfo(TestTableDelegate.getTypeMap(), oTable.getConditions(), aTableProperties);

			if (oInnerFilterInfo.filters) {
				aFilters.push(oInnerFilterInfo.filters);
			}
		}

		return aFilters;
	}

	function createOuterFilters(oTable) {
		var oFilter = Core.byId(oTable.getFilter());
		var aFilters = [];

		if (!oFilter) {
			return aFilters;
		}

		var mConditions = oFilter.getConditions();

		if (mConditions) {
			var aPropertiesMetadata = oFilter.getPropertyInfoSet ? oFilter.getPropertyInfoSet() : null;
			var aParameterNames = DelegateUtil.getParameterNames(oFilter);
			var oOuterFilterInfo = FilterUtil.getFilterInfo(TestTableDelegate.getTypeMap(), mConditions, aPropertiesMetadata, aParameterNames);

			if (oOuterFilterInfo.filters) {
				aFilters.push(oOuterFilterInfo.filters);
			}
		}

		return aFilters;
	}

	function addSearchParameter(oTable, oBindingInfo) {
		var oFilter = Core.byId(oTable.getFilter());
		if (!oFilter) {
			return;
		}

		var mConditions = oFilter.getConditions();
		// get the basic search
		var sSearchText = oFilter.getSearch instanceof Function ? oFilter.getSearch() :  "";

		if (mConditions) {
			var sParameterPath = DelegateUtil.getParametersInfo(oFilter, mConditions);
			if (sParameterPath) {
				oBindingInfo.path = sParameterPath;
			}
		}

		oBindingInfo.parameters["$search"] = sSearchText || undefined;
	}

	TestTableDelegate.fetchProperties = function(oTable) {
		var oModel = TableDelegateUtils.getModel(oTable);

		if (!oModel) {
			return new Promise(function(resolve) {
				oTable.attachModelContextChange({
					resolver: resolve
				}, onModelContextChange, this);
			}.bind(this)).then(function(oModel) {
				return createPropertyInfos(oTable, oModel);
			});
		} else {
			return createPropertyInfos(oTable, oModel);
		}
	};

	function onModelContextChange(oEvent, oData) {
		var oTable = oEvent.getSource();
		var oModel = TableDelegateUtils.getModel(oTable);

		if (oModel) {
			oTable.detachModelContextChange(onModelContextChange);
			oData.resolver(oModel);
		}
	}

	function createPropertyInfos(oTable, oModel) {
		var oMetadataInfo = TableDelegateUtils.getMetadataInfo(oTable);
		var aProperties = [];
		var sEntitySetPath = "/" + oMetadataInfo.collectionName;
		var oMetaModel = oModel.getMetaModel();

		return Promise.all([
			oMetaModel.requestObject(sEntitySetPath + "/"),
			oMetaModel.requestObject(sEntitySetPath + "@")
		]).then(function(aResults) {
			var oEntityType = aResults[0];
			var mEntitySetAnnotations = aResults[1];
			var oSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
			var oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(oSortRestrictions);
			var oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
			var oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);
			var mAllCustomAggregates = ODataMetaModelUtil.getAllCustomAggregates(mEntitySetAnnotations);

			for (var sKey in oEntityType) {
				var oDataObject = oEntityType[sKey];

				if (oDataObject && oDataObject.$kind === "Property") {
					if (oDataObject.$isCollection || !oDataObject.$Type.startsWith('Edm')) {
						Log.warning("Complex property with type " + oDataObject.$Type + " has been ignored");
						continue;
					}

					var oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");
					var vUnitAnnotation = oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"] || oPropertyAnnotations["@Org.OData.Measures.V1.Unit"];
					var oUnitAnnotation = !vUnitAnnotation || typeof vUnitAnnotation === "string" ? undefined : vUnitAnnotation;
					var bUnitIsFromNavigationProperty = oUnitAnnotation != null && oUnitAnnotation.$Path.includes("/")[0];
					var oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
					var bTextIsFromNavigationProperty = oTextAnnotation != null && oTextAnnotation.$Path.includes("/")[0];
					var bIsUpperCase = !!oPropertyAnnotations["@com.sap.vocabularies.Common.v1.IsUpperCase"];
					var mConstraints = {
						isDigitSequence: !!oPropertyAnnotations["@com.sap.vocabularies.Common.v1.IsDigitSequence"]
					};
					if (oDataObject.$MaxLength > 0) {
						mConstraints.maxLength = oDataObject.$MaxLength;
					}
					if (oDataObject.$Precision > 0) {
						mConstraints.precision = oDataObject.$Precision;
					}
					if (oDataObject.$Scale > 0) {
						mConstraints.scale = oDataObject.$Scale;
					}

					var oType;
					try {
						oType = oDataObject.$Type; //, null, mConstraints);
					} catch (error) {
						Log.error(error);
					}

					var oPropertyInfo = {
						name: sKey,
						path: sKey,
						label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
						sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
						filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
						dataType: oType,
						constraints : mConstraints,
						maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
						groupable: oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"] || false,
						unit: oUnitAnnotation && !bUnitIsFromNavigationProperty ? oUnitAnnotation.$Path : undefined,
						text: oTextAnnotation && bTextIsFromNavigationProperty ? oTextAnnotation.$Path : undefined,
						key: oEntityType.$Key.indexOf(sKey) > -1,
						caseSensitive : !bIsUpperCase
					};

					// For simplicity, the property is declared aggregatable if there is a CustomAggregate whose Qualifier matches the property name.
					if (sKey in mAllCustomAggregates) {
						var aContextDefiningPropertiesPaths = [];

						if ("contextDefiningProperties" in mAllCustomAggregates[sKey]) {
							for (var i = 0; i < mAllCustomAggregates[sKey].contextDefiningProperties.length; i++) {
								aContextDefiningPropertiesPaths.push(mAllCustomAggregates[sKey].contextDefiningProperties[i].$PropertyPath);
							}
						}

						oPropertyInfo.aggregatable = true;
						oPropertyInfo.extension = {
							customAggregate: {
								contextDefiningProperties: aContextDefiningPropertiesPaths
							}
						};
					}

					aProperties.push(oPropertyInfo);

					if (oPropertyInfo.unit) {
						oPropertyInfo.visualSettings = {
							widthCalculation: {
								truncateLabel: false
							}
						};
						aProperties.push({
							name: sKey + "_" + oPropertyInfo.unit + "_ComplexWithUnit",
							label: oPropertyInfo.label + " + Unit",
							propertyInfos: [sKey, oPropertyInfo.unit],
							exportSettings: {
								type: "Currency",
								unitProperty: oPropertyInfo.unit,
								delimiter: true
							}
						});
					}

					if (oPropertyInfo.text) {
						aProperties.push({
							name: sKey + "_" + oPropertyInfo.text + "_ComplexWithText",
							label: oPropertyInfo.label + " + Text",
							propertyInfos: [sKey, oPropertyInfo.text],
							exportSettings: {
								template: "{0} ({1})"
							}
						});
					}
				}
			}

			return aProperties;
		});
	}

	TestTableDelegate.getFilterDelegate = function() {
		return FilterBarDelegate;
	};

	return TestTableDelegate;
});