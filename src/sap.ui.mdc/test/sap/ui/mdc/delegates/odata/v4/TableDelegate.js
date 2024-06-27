/*!
 * ${copyright}
 */

sap.ui.define([
	"../../TableDelegateUtils",
	"sap/ui/core/Element",
	"sap/ui/mdc/odata/v4/TableDelegate",
	"delegates/odata/v4/FilterBarDelegate",
	"delegates/odata/v4/ODataMetaModelUtil",
	"delegates/odata/v4/util/DelegateUtil",
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/unified/Currency",
	"sap/m/Text",
	"sap/ui/model/Filter",
	"sap/base/Log",
	'sap/ui/mdc/odata/v4/TypeMap',
	'../../util/PayloadSearchKeys'
], function(
	TableDelegateUtils,
	Element,
	TableDelegate,
	FilterBarDelegate,
	ODataMetaModelUtil,
	DelegateUtil,
	FilterUtil,
	Currency,
	Text,
	Filter,
	Log,
	ODataV4TypeMap,
	PayloadSearchKeys
) {
	"use strict";

	/**
	 * Test delegate for OData V4.
	 */
	var TestTableDelegate = Object.assign({}, TableDelegate);

	TestTableDelegate.addItem = function(oTable, sPropertyName, mPropertyBag) {
		return TableDelegateUtils.createColumn(oTable, sPropertyName, function(oTable, oProperty) {
			let aProperties;
			if (oProperty.name.endsWith("_ComplexWithUnit")) {
				aProperties = oProperty.getSimpleProperties();

				return new Currency({
					useSymbol: false,
					value: {
						path: aProperties[0].path
					},
					currency: {
						path: aProperties[1].path
					}
				});
			} else 	if (oProperty.name.endsWith("_ComplexWithText")) {
				aProperties = oProperty.getSimpleProperties();
				const sTemplate = oProperty.exportSettings.template;
				return new Text({
					text: {
						parts: [
							{path: aProperties[0].path},
							{path: aProperties[1].path}
						],
						formatter: function(sValue, sTextValue) {
							return sTemplate.replace(/\{0\}/g, sValue).replace(/\{1\}/g, sTextValue);
						}
					}
				});
			} else 	if (oProperty.text) { // just show value, as value & text is shown is special column
				return new Text({
					text: {path: oProperty.path}
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
			var aFilters = this.getFilters(oTable);
			if (aFilters.length) {
				oBindingInfo.filters = aFilters;
			}
		}

		if (PayloadSearchKeys.inUse(oTable)) {
			oBindingInfo.parameters["$search"] = undefined;
			return;
		}
		addSearchParameter(oTable, oBindingInfo);
	};

	TestTableDelegate.getFilters = function (oControl) {
		return PayloadSearchKeys.combineFilters([
			...TableDelegate.getFilters.apply(this, arguments),
			...PayloadSearchKeys.getFilters(oControl, Element.getElementById(oControl.getFilter())?.getSearch())
		], true);
	};

	function addSearchParameter(oTable, oBindingInfo) {
		var oFilter = Element.getElementById(oTable.getFilter());
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
					var bUnitIsFromNavigationProperty = oUnitAnnotation != null && oUnitAnnotation.$Path.includes("/");
					var oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
					var bTextIsFromNavigationProperty = oTextAnnotation != null && oTextAnnotation.$Path.includes("/");
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
						maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo[sKey]?.allowedExpressions) ? -1 : 1,
						groupable: oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"] || false,
						unit: !bUnitIsFromNavigationProperty && oUnitAnnotation?.$Path || "",
						text: bTextIsFromNavigationProperty && oTextAnnotation?.$Path || "",
						isKey: oEntityType.$Key.indexOf(sKey) > -1,
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
						const oTextArrangementAnnotation = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement");
						let sTemplate = "{0} ({1})";
						if (oTextArrangementAnnotation) {
							if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
								sTemplate = "{1}";
							} else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
								sTemplate = "{0} ({1})";
							} else {
								sTemplate = "{1} ({0})";
							}
						}

						aProperties.push({
							name: sKey /*+ "_" + oPropertyInfo.text*/ + "_ComplexWithText",
							label: oPropertyInfo.label + " + Text",
							propertyInfos: [sKey, oPropertyInfo.text],
							exportSettings: {
								template: sTemplate
							}
						});
						aProperties.push({ // dummy property for navigation
							name: oPropertyInfo.text,
							path: oPropertyInfo.text,
							label: oPropertyInfo.text,
							sortable: false,
							filterable: false,
							dataType: "Edm.String",
							visible: false,
							maxConditions: 1,
							groupable: false,
							caseSensitive : false
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