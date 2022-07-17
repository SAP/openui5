/*!
 * ${copyright}
 */

sap.ui.define([
	"../../TableDelegateUtils",
	"sap/ui/mdc/odata/v4/TableDelegate",
	"delegates/odata/v4/FilterBarDelegate",
	"sap/ui/mdc/odata/v4/ODataMetaModelUtil",
	"sap/ui/mdc/odata/v4/TypeUtil",
	"sap/ui/mdc/odata/v4/util/DelegateUtil",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/unified/Currency",
	"sap/ui/model/Filter",
	"sap/ui/core/Core",
	"sap/base/Log"
], function(
	TableDelegateUtils,
	TableDelegate,
	FilterBarDelegate,
	ODataMetaModelUtil,
	TypeUtil,
	DelegateUtil,
	FilterUtil,
	Currency,
	Filter,
	Core,
	Log
) {
	"use strict";

	/**
	 * Test delegate for OData V4.
	 */
	var TestTableDelegate = Object.assign({}, TableDelegate);

	TestTableDelegate.addItem = function(sPropertyName, oTable, mPropertyBag) {
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
			oBindingInfo.filters = new Filter(aFilters, true);
		}

		addSearchParameter(oTable, oBindingInfo);
	};

	function createInnerFilters(oTable) {
		var bFilterEnabled = oTable.isFilteringEnabled();
		var aFilters = [];

		if (bFilterEnabled) {
			var aTableProperties = oTable.getPropertyHelper().getProperties();
			var oInnerFilterInfo = FilterUtil.getFilterInfo(TestTableDelegate.getTypeUtil(), oTable.getConditions(), aTableProperties);

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
			var oOuterFilterInfo = FilterUtil.getFilterInfo(TestTableDelegate.getTypeUtil(), mConditions, aPropertiesMetadata, aParameterNames);

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

			for (var sKey in oEntityType) {
				var oDataObject = oEntityType[sKey];

				if (oDataObject && oDataObject.$kind === "Property") {
					if (oDataObject.$isCollection) {
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

					var oPropertyInfo = {
						name: sKey,
						path: sKey,
						label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
						sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
						filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
						typeConfig: TypeUtil.getTypeConfig(oDataObject.$Type, null, mConstraints),
						maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
						groupable: oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"] || false,
						unit: oUnitAnnotation && !bUnitIsFromNavigationProperty ? oUnitAnnotation.$Path : undefined,
						text: oTextAnnotation && bTextIsFromNavigationProperty ? oTextAnnotation.$Path : undefined,
						key: oEntityType.$Key.indexOf(sKey) > -1,
						caseSensitive : !bIsUpperCase
					};

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

	TestTableDelegate.fetchPropertyExtensions = function(oTable, aPropertyInfos) {
		var mExtensions = {};
		var oModel = TableDelegateUtils.getModel(oTable);
		var oMetadataInfo = TableDelegateUtils.getMetadataInfo(oTable);
		var sEntitySetPath = "/" + oMetadataInfo.collectionName;
		var oMetaModel = oModel.getMetaModel();

		return Promise.all([
			oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "/@")
		]).then(function(aResults) {
			var mEntitySet = aResults[0];
			var mAnnotations = aResults[1];
			var mAllCustomAggregates = ODataMetaModelUtil.getAllCustomAggregates(mAnnotations);

			// process the Qualifier of the CustomAggregate annotation if it matches the property name in the EntityType
			for (var sKey in mAllCustomAggregates) {
				if (sKey in mEntitySet) {
					mExtensions[sKey] = {
						defaultAggregate: {}
					};

					if ("contextDefiningProperties" in mAllCustomAggregates[sKey]) {
						var aContextDefiningProperties = mAllCustomAggregates[sKey].contextDefiningProperties;
						var aContextDefiningPropertiesPaths = [];

						for (var i = 0; i < aContextDefiningProperties.length; i++) {
							aContextDefiningPropertiesPaths.push(aContextDefiningProperties[i].$PropertyPath);
						}

						mExtensions[sKey].defaultAggregate.contextDefiningProperties = aContextDefiningPropertiesPaths;
					}
				}
			}

			return mExtensions;
		});
	};

	TestTableDelegate.getFilterDelegate = function() {
		return FilterBarDelegate;
	};

	TestTableDelegate.getTypeUtil = function(oPayload) {
		return TypeUtil;
	};

	return TestTableDelegate;
});