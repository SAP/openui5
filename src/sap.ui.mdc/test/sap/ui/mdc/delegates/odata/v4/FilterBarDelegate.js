/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	'delegates/odata/v4/ODataMetaModelUtil',
	"sap/ui/core/Element",
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/ui/mdc/enums/OperatorName',
	"sap/ui/fl/Utils",
	"sap/ui/mdc/FilterBarDelegate",
	'sap/base/util/merge',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	'sap/ui/mdc/util/IdentifierUtil',
	'sap/ui/core/util/reflection/JsControlTreeModifier',
	'sap/base/Log',
	'sap/ui/mdc/odata/v4/TypeMap',
	'delegates/util/DelegateCache'
], function(ODataMetaModelUtil, Element, FieldDisplay, OperatorName, FlUtils, FilterBarDelegate, merge, FilterOperatorUtil, ModelOperator, Filter, IdentifierUtil, JsControlTreeModifier, Log, ODataV4TypeMap, DelegateCache) {
	"use strict";

	var ODataFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	var storeTemplatingSettings = function (oControl, aProperties) {
		let oSettings;
		aProperties.forEach(function (oProp) {
			["display", "fieldHelp", "valueHelp"].forEach((sKey) => {
				if (oProp[sKey]) {
					oSettings = oSettings || {};
					oSettings[oProp.name] = {[sKey === "fieldHelp" ? "valueHelp" : sKey]: oProp[sKey]};
					delete oProp[sKey];
				}
			});
		});

		if (oSettings) {
			DelegateCache.add(oControl.originalNode || oControl, oSettings);
		}
	};

	ODataFilterBarDelegate.getTypeMap = function (oPayload) {
		return ODataV4TypeMap;
	};

	// TO DO
	var mDefaultTypeForEdmType = {
		"Edm.Boolean": "Bool",
		"Edm.Byte": "Int",
		"Edm.DateTime": "Date",
		"Edm.DateTimeOffset": "DateTimeOffset",
		"Edm.Decimal": "Decimal",
		"Edm.Double": "Float",
		"Edm.Float": "Float",
		"Edm.Guid": "Guid",
		"Edm.Int16": "Int",
		"Edm.Int32": "Int",
		"Edm.Int64": "Int",
		"Edm.SByte": "Int",
		"Edm.Single": "Float",
		"Edm.String": "String",
		"Edm.Time": "TimeOfDay"
	};

	var InstanceCache = new Map();

	ODataFilterBarDelegate._fetchPropertiesByMetadata = function(oControl, mPropertyBag) {

		var oDelegate, sModelName, sCollectionName, oModel, sFilterBarId;

		return Promise.resolve()
			.then(function() {
				if (mPropertyBag) {
					var oModifier = mPropertyBag.modifier;

					return Promise.resolve()
						.then(oModifier.getProperty.bind(oModifier, oControl, "delegate"))
						.then(function(oDelegate) {
							sModelName =  oDelegate.payload.modelName === null ? undefined : oDelegate.payload.modelName;
							sCollectionName = oDelegate.payload.collectionName;
							oModel = mPropertyBag.appComponent.getModel(sModelName);
						});
				}
				oDelegate = oControl.getProperty("delegate");
				sModelName =  oDelegate.payload.modelName === null ? undefined : oDelegate.payload.modelName;
				sCollectionName = oDelegate.payload.collectionName;
				oModel = oControl.getModel(sModelName);
			})
			.then(function() {
				sFilterBarId = oControl.getId ? oControl.getId() :  oControl.id;

				var oObj = {
						getDelegate: function() {
							return {
								payload : {
									modelName : sModelName,
									collectionName: sCollectionName
								}
							};
						},

						getModel : function (s) {
							return oModel;
						},

						getId : function() {
							return sFilterBarId;
						},
						originalNode: oControl
				};

				return mPropertyBag && !oControl.getId ? this.fetchProperties(oObj) : oControl.finalizePropertyHelper().then(function(oHelper){
					var aProperties = oHelper.getProperties();
					storeTemplatingSettings(oControl, aProperties);
					return aProperties;
				});
			}.bind(this));
	};

	ODataFilterBarDelegate._ensureSingleRangeEQOperators = function() {
		var oOperator;
		if (!FilterOperatorUtil.getOperator("SINGLE_RANGE_EQ")) {
			oOperator = merge({}, FilterOperatorUtil.getOperator(OperatorName.EQ));
			oOperator.name = "SINGLE_RANGE_EQ";
			oOperator.getModelFilter = function(oCondition, sFieldPath) {
				return new Filter({ filters: [new Filter(sFieldPath, ModelOperator.GE, oCondition.values[0]),
											  new Filter(sFieldPath, ModelOperator.LE, oCondition.values[0])],
										and: true});
			};

			FilterOperatorUtil.addOperator(oOperator);
		}

		if (!FilterOperatorUtil.getOperator("SINGLE_RANGE_EQ")) {
			oOperator = merge({}, FilterOperatorUtil.getOperator(OperatorName.EQ));
			oOperator.name = "SINGLE_RANGE_EQ";
			oOperator.getModelFilter = function(oCondition, sFieldPath) {
				return new Filter({ filters: [new Filter(sFieldPath, ModelOperator.GE, oCondition.values[0]),
											  new Filter(sFieldPath, ModelOperator.LE, oCondition.values[0])],
										and: true});
			};

			FilterOperatorUtil.addOperator(oOperator);
		}
	};

	ODataFilterBarDelegate._ensureMultiRangeBTEXOperator = function() {
		if (!FilterOperatorUtil.getOperator("MULTI_RANGE_BTEX")) {
			var oOperator = merge({}, FilterOperatorUtil.getOperator(OperatorName.BT));
			oOperator.name = "MULTI_RANGE_BTEX";
			oOperator.getModelFilter = function(oCondition, sFieldPath) {
				return new Filter({ filters:[new Filter(sFieldPath, ModelOperator.GT, oCondition.values[0]),
											 new Filter(sFieldPath, ModelOperator.LT, oCondition.values[1])],
										and: true});
			};

			FilterOperatorUtil.addOperator(oOperator);
		}
	};

	ODataFilterBarDelegate._getFilterOperators = function(sFilterExpression) {
		var sOperators = null, aOperators = null;

		switch (sFilterExpression) {
			case "SingleValue":
			case "MultiValue": sOperators = "EQ"; break;

			case "SingleRange": sOperators = "SINGLE_RANGE_EQ,SINGLE_RANGE_EQ,LE,GE"; this._ensureSingleRangeEQOperators(); break;
			case "MultiRange":  sOperators = "EQ,LE,LT,GE,GT,BT,MULTI_RANGE_BTEX"; this._ensureMultiRangeBTEXOperator(); break;

			case "SearchExpression":             sOperators = "StartsWith,EndsWith,Contains"; break;
			case "MultiRangeOrSearchExpression": sOperators = "StartsWith,EndsWith,Contains,EQ,LE,LT,GE,GT,BT,MULTI_RANGE_BTEX"; this._ensureMultiRangeBTEXOperator(); break;
			default: break;
		}

		if (sOperators) {
			aOperators = sOperators.split(',');
		}

		return aOperators;
	};

	ODataFilterBarDelegate._createFilterField = function(oProperty, oFilterBar, mPropertyBag) {
		var oModifier = mPropertyBag ? mPropertyBag.modifier : JsControlTreeModifier;
		var oAppComponent = mPropertyBag ? mPropertyBag.appComponent : FlUtils.getAppComponentForControl(oFilterBar);
		var oView = (mPropertyBag && mPropertyBag.view ) ? mPropertyBag.view : FlUtils.getViewForControl(oFilterBar);
		var sViewId = mPropertyBag ? mPropertyBag.viewId : null;
		var sName = oProperty.name;
		var oSelector = {};

		if (oFilterBar.getId) {
			oSelector.id = oFilterBar.getId();
		} else {
			oSelector.id = oFilterBar.id;
		}

		var sSelectorId = oModifier.getControlIdBySelector(oSelector, oAppComponent);

		var sId = sSelectorId +  "--filter--" + IdentifierUtil.replace(sName);

		var oExistingFilterField = Element.getElementById(sId);

		if (oExistingFilterField) {
			return Promise.resolve(oExistingFilterField);
		}

		const {operators, ...oConstructorSettings} = DelegateCache.merge({
			//dataType: oProperty.dataType,
			//conditions: "{$filters>/conditions/" + sName + '}',
			propertyKey: sName,
			//required: oProperty.required,
			//label: oProperty.label || oProperty.name,
			//maxConditions: oProperty.maxConditions,
			delegate: {name: "delegates/odata/v4/FieldBaseDelegate", payload: {}}
		}, DelegateCache.get(oFilterBar, oProperty.name, "$Filters"));

		return Promise.resolve()
			.then(oModifier.createControl.bind(oModifier, "sap.ui.mdc.FilterField", oAppComponent, oView, sId, oConstructorSettings)).then(function(oFilterField) {
				if (oProperty.fieldHelp) {

					var sFieldHelp = oProperty.fieldHelp;
					if (!sViewId) { // viewId is only set during xmlTree processing
						sFieldHelp = oView.createId(oProperty.fieldHelp);
					} else {
						sFieldHelp = sViewId + "--" + oProperty.fieldHelp;
					}
					oModifier.setAssociation(oFilterField, "valueHelp", sFieldHelp);
				}

				if (operators) {
					if (oFilterBar.getId) {
						oModifier.setProperty(oFilterField, "operators", operators);
					} else {
						oModifier.setProperty(oFilterField, "operators", operators.join(','));
					}
				}

				if (oProperty.tooltip) {
					oModifier.setProperty(oFilterField, "tooltip", oProperty.tooltip);
				}

				if (oProperty.constraints) {
					oModifier.setProperty(oFilterField, "dataTypeConstraints", oProperty.constraints);
				}

				if (oProperty.formatOptions) {
					oModifier.setProperty(oFilterField, "dataTypeFormatOptions", oProperty.formatOptions);
				}

				return oFilterField;
			});
	};

	ODataFilterBarDelegate._createFilter = function(sPropertyName, oFilterBar, mPropertyBag) {
		return this._fetchPropertiesByMetadata(oFilterBar, mPropertyBag).then(function(aProperties) {
			var oPropertyInfo = aProperties.find(function(oProperty) {
				return (IdentifierUtil.getPropertyKey(oProperty) === sPropertyName);
			});
			if (!oPropertyInfo) {
				return null;
			}
			return Promise.resolve(this._createFilterField(oPropertyInfo, oFilterBar, mPropertyBag));
		}.bind(this));
	};

	ODataFilterBarDelegate.addItem = function(oFilterBar, sPropertyName, mPropertyBag) {
		return Promise.resolve(this._createFilter(sPropertyName, oFilterBar, mPropertyBag));
	};


	ODataFilterBarDelegate._getInstanceCacheEntry = function(oControl, sKey) {
		var sId = oControl.getId && oControl.getId() || oControl.id;
		var oCacheEntry = InstanceCache.get(sId);
		return oCacheEntry && oCacheEntry[sKey];
	};
	ODataFilterBarDelegate._setInstanceCacheEntry = function(oControl, sKey, oValue) {
		var sId = oControl.getId && oControl.getId() || oControl.id;
		var oCacheEntry = InstanceCache.get(sId) || {};
		oCacheEntry[sKey] = oValue;
		InstanceCache.set(sId, oCacheEntry);
	};

	ODataFilterBarDelegate._addPropertyInfoEntry = function(oControl, sPropertyName, aPropertyInfo, aFetchedProperties, oModifier) {

		if (aFetchedProperties) {
			var nIdx = aFetchedProperties.findIndex(function(oEntry) {
				return oEntry.name === sPropertyName;
			});

			if (nIdx >= 0) {
				aPropertyInfo.push({
					name: sPropertyName,
					dataType: aFetchedProperties[nIdx].dataType,
					maxConditions: aFetchedProperties[nIdx].maxConditions,
					constraints: aFetchedProperties[nIdx].constraints,
					formatOptions: aFetchedProperties[nIdx].formatOptions,
					required: aFetchedProperties[nIdx].required,
					caseSensitive: aFetchedProperties[nIdx].caseSensitive,
					label: aFetchedProperties[nIdx].label,
					hiddenFilter: aFetchedProperties[nIdx].hiddenFilter
				});
				oModifier.setProperty(oControl, "propertyInfo", aPropertyInfo);
			} else {
				Log.error("ConditionFlex-ChangeHandler: no type info for property '" + sPropertyName + "'");
			}
		}
	};


	ODataFilterBarDelegate._updatePropertyInfo = function(sPropertyName, oFilterBar, mPropertyBag) {

		if (oFilterBar.isA && oFilterBar.isA("sap.ui.mdc.FilterBar")) {
			return Promise.resolve();
		}

		var oModifier = mPropertyBag.modifier;

		return oModifier.getProperty(oFilterBar, "propertyInfo")
		.then(function(aPropertyInfo) {
			if (!aPropertyInfo) {
				return Promise.resolve();
			}
			var nIdx = aPropertyInfo.findIndex(function(oEntry) {
				return oEntry.name === sPropertyName;
			});

			if (nIdx < 0) {

				var aFetchedProperties = ODataFilterBarDelegate._getInstanceCacheEntry(oFilterBar, "fetchedProperties");
				if (aFetchedProperties) {
					ODataFilterBarDelegate._addPropertyInfoEntry(oFilterBar, sPropertyName, aPropertyInfo, aFetchedProperties, oModifier);
				} else {
					//fetch
					return ODataFilterBarDelegate.fetchProperties(oFilterBar, mPropertyBag)
					.then(function(aProperties) {
						ODataFilterBarDelegate._setInstanceCacheEntry(oFilterBar, "fetchedProperties", aProperties);
						ODataFilterBarDelegate._addPropertyInfoEntry(oFilterBar, sPropertyName, aPropertyInfo, aProperties, oModifier);
					});
				}
			}
		});
	};


	/**
	 * This methods is called during the appliance of the add condition change.
	 * This intention is to update the propertyInfo property.
	 *
	 * @param {sap.ui.mdc.FilterBar} oFilterBar - the instance of filter bar
	 * @param {string} sPropertyName The name of a property.
	 * @param {Object} mPropertyBag Instance of property bag from Flex change API
	 * @returns {Promise} Promise that resolves once the properyInfo property was updated
	 */
	ODataFilterBarDelegate.addCondition = function(oFilterBar, sPropertyName, mPropertyBag) {
		return ODataFilterBarDelegate._updatePropertyInfo(sPropertyName, oFilterBar, mPropertyBag);
	};

	/**
	 * This methods is called during the appliance of the remove condition change.
	 * This intention is to update the propertyInfo property.
	 *
	 * @param {sap.ui.mdc.FilterBar} oFilterBar - the instance of filter bar
	 * @param {string} sPropertyName The name of a property.
	 * @param {Object} mPropertyBag Instance of property bag from Flex change API
	 * @returns {Promise} Promise that resolves once the properyInfo property was updated
	 */
	ODataFilterBarDelegate.removeCondition = function(oFilterBar, sPropertyName, mPropertyBag) {
		return ODataFilterBarDelegate._updatePropertyInfo(sPropertyName, oFilterBar, mPropertyBag);
	};


	/**
	 * Can be used to trigger any necessary follow-up steps on removal of filter items. The returned boolean value inside the Promise can be used to
	 * prevent default follow-up behaviour of Flex.
	 *
	 * @param {sap.ui.mdc.FilterBar} oFilterBar - the instance of filter bar
	 * @param {sap.ui.mdc.FilterField} oFilterField The mdc.FilterField that was removed
	 * @param {Object} mPropertyBag Instance of property bag from Flex change API
	 * @returns {Promise} Promise that resolves with true/false to allow/prevent default behavour of the change
	 */
	ODataFilterBarDelegate.removeItem =  function(oFilterBar, oFilterField, mPropertyBag) {
		// return true within the Promise for default behaviour
		return Promise.resolve(true);
	};

	ODataFilterBarDelegate._getFieldGroupsByFilterFacetsAnnotation = function (oMetaModel, sEntitySet) {

	};

	ODataFilterBarDelegate._getNavigationPropertyForParameter = function(oEntityType) {
		var oObj;
		for (var sKey in oEntityType) {
			oObj = oEntityType[sKey];
			if (oObj) {
				if (oObj.$kind === "NavigationProperty") {
					return sKey;
				}
			}
		}

		return null;
	};

	ODataFilterBarDelegate._fetchPropertyInfo = function (oMetaModel, sEntitySetPath, sNavigationPropertyName, oObj, sKey) {
		var oEntitySetTextArrangementAnnotation = oMetaModel.getObject(sEntitySetPath + "/" + "@com.sap.vocabularies.UI.v1.TextArrangement");

		var bHiddenFilter = false;
		if (oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.UI.v1.HiddenFilter")) {
			bHiddenFilter = true;
		}

		var bIsDigitalSequence = false;
		if (oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.IsDigitSequence")) {
			bIsDigitalSequence = true;
		}

		var oFilterDefaultValue = null;
		var oFilterDefaultValueAnnotation = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.FilterDefaultValue");
		if (oFilterDefaultValueAnnotation) {
			var sValue = oFilterDefaultValueAnnotation["$" + mDefaultTypeForEdmType[oObj.$Type]];
			switch (oObj.$Type) {
				case "Edm.DateTimeOffset": oFilterDefaultValue = sValue; break;
				default: oFilterDefaultValue = sValue;
			}
		}

		var bIsUpperCase = false;
		if (oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.IsUpperCase")) {
			bIsUpperCase = true;
		}

		var sLabel = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.Label") || sKey;
		var sTooltip = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.QuickInfo") || null;

		var oConstraints = {};
		if (oObj.$MaxLength || oObj.$Precision || oObj.$Scale || bIsDigitalSequence) {
			if (oObj.$MaxLength) {
				oConstraints.maxLength = oObj.$MaxLength;
			}
			if (oObj.$Precision) {
				oConstraints.precision = oObj.$Precision;
			}
			if (oObj.$Scale) {
				oConstraints.scale = oObj.$Scale;
			}
			if (bIsDigitalSequence) {
				oConstraints.isDigitSequence = bIsDigitalSequence;
			}
		} else {
			oConstraints = null;
		}

		var sDisplay, oTextAnnotation = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.Text");
		if (oTextAnnotation) {
			var oTextArrangementAnnotation = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement") || oEntitySetTextArrangementAnnotation;
			if (oTextArrangementAnnotation) {
				if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
					sDisplay = FieldDisplay.Description;
				} else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
					sDisplay = FieldDisplay.ValueDescription;
				} else {
					sDisplay = FieldDisplay.DescriptionValue;
				}
			} else {
				sDisplay = FieldDisplay.DescriptionValue;
			}
		}

		var oProperty = {
				name: sKey,
				label: sLabel,
				tooltip: sTooltip,
				hiddenFilter: bHiddenFilter,
				caseSensitive: !bIsUpperCase
		};

		if (sDisplay) {
			oProperty.display = sDisplay;
		}

		// if (oObj.$Type === "Edm.DateTimeOffset") {
		// 	if (!oConstraints) {
		// 		oConstraints = {};
		// 	}

		// 	oConstraints.V4 = true;
		// }

		if (oConstraints) {
			oProperty.constraints = oConstraints;
		}

		if (oFilterDefaultValue) {
			oProperty.defaultFilterConditions = [{ fieldPath: sKey, operator: OperatorName.EQ, values: [oFilterDefaultValue] }];
		}

		//Currently the FilterBar will use 'name' as key for the identification between existing
		//FilterFields - currently there is no connection such as 'dataProperties' between existing Fields
		//and PropertyInfo, the usage of a complex 'name' (e.g. containing '/') might be reconsidered.
		oProperty.name = sNavigationPropertyName ? sNavigationPropertyName + "/" + sKey : sKey;

		oProperty.dataType = oObj.$Type;

		return oProperty;
	};

	ODataFilterBarDelegate._fetchEntitySet = function (oMetaModel, sEntitySetPath, aVisitedEntityTypes, sNavigationPropertyName, oParameterInfo) {
		return Promise.all([oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "@")]).then(function(aResults) {
			var oEntityType = aResults[0];
			var mEntitySetAnnotations = aResults[1] || {};

			if (!oEntityType) {
				return Promise.resolve([]);
			}

			var oObj,
			oPropertyInfo,
			aFetchedProperties = [],
			aPropertyListPromises = [],
			aNonFilterableProps = [],
			aRequiredProps = [],
			aSelectionFields = [],
			mAllowedExpressions = {},
			mNavigationProperties = {},
			bIsParameterType = false;

			var oEntitySet = oMetaModel.getObject(sEntitySetPath);
			if (oEntitySet && oEntitySet.$NavigationPropertyBinding) {
				mNavigationProperties = oEntitySet.$NavigationPropertyBinding;
			}

			// find filter restrictions
			var oAnnotation = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
			if (oAnnotation) {
				if (oAnnotation.NonFilterableProperties) {
					aNonFilterableProps = oAnnotation.NonFilterableProperties.map(function(oProperty) {
						return oProperty.$PropertyPath;
					});
				}

				if (oAnnotation.RequiredProperties) {
					aRequiredProps = oAnnotation.RequiredProperties.map(function(oProperty) {
						return oProperty.$PropertyPath;
					});
				}

				if (oAnnotation.FilterExpressionRestrictions) {
					oAnnotation.FilterExpressionRestrictions.forEach(function(oProperty) {
						//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
						mAllowedExpressions[oProperty.Property.$PropertyPath] = oProperty.AllowedExpressions;
					});
				}
			}

			// find selection fields
			oAnnotation = oMetaModel.getObject(sEntitySetPath + "/" + "@com.sap.vocabularies.UI.v1.SelectionFields");
			if (oAnnotation) {
				aSelectionFields = oAnnotation.map(function(oProperty) {
					return oProperty.$PropertyPath;
				});
			}

			var sEntityName = oMetaModel.getObject(sEntitySetPath + "/@sapui.name");
			var sGroup = sEntityName;
			var sGroupLabel = oMetaModel.getObject(sEntitySetPath + "@com.sap.vocabularies.Common.v1.Label");
			if (!sGroupLabel ) {
				sGroupLabel = sGroup.split(".")[1];
			}

			aVisitedEntityTypes.push(sEntityName);

			oAnnotation = oMetaModel.getObject(sEntitySetPath + "/" + "@com.sap.vocabularies.Common.v1.ResultContext");
			if (oAnnotation) {
				bIsParameterType = true;
				oParameterInfo.parameterNavigationName = ODataFilterBarDelegate._getNavigationPropertyForParameter(oEntityType);
			}

			if (!sNavigationPropertyName) {
				var aSplitEntityType = sEntityName.split('.');
				oParameterInfo.parameterEntityType = aSplitEntityType[aSplitEntityType.length - 1];
			}

			for (var sKey in oEntityType) {
				oObj = oEntityType[sKey];
				if (oObj) {
					if (bIsParameterType && (sKey === "$Key")) {
						oParameterInfo.parameters = merge([], oObj);
					} else if (oObj.$kind === "Property") {

						// skip non-filterable property
						if (aNonFilterableProps.indexOf(sKey) >= 0) {
							continue;
						}
						if (oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.UI.v1.Hidden")) {
							continue;
						}

						// ignore (as for now) all complex properties
						// not clear if they might be nesting (complex in complex)
						// not clear how they are represented in non-filterable annotation
						// etc.
						if (oObj.$isCollection) {
							Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
							continue;
						}

						oPropertyInfo = ODataFilterBarDelegate._fetchPropertyInfo(oMetaModel, sEntitySetPath, sNavigationPropertyName, oObj, sKey, oParameterInfo);
						if (oPropertyInfo) {
							oPropertyInfo.group = sGroup;
							oPropertyInfo.groupLabel = sGroupLabel;

							oPropertyInfo.required = aRequiredProps.indexOf(sKey) >= 0;
							oPropertyInfo.visible = aSelectionFields.indexOf(sKey) >= 0;
							if (mAllowedExpressions[sKey]) {
								var aOperators =  ODataFilterBarDelegate._getFilterOperators(mAllowedExpressions[sKey]);
								if (aOperators) {
									//oPropertyInfo.filterOperators = aOperators;
								}
							}
							oPropertyInfo.maxConditions = ODataMetaModelUtil.isMultiValueFilterExpression(mAllowedExpressions[sKey]) ? -1 : 1;

							if (bIsParameterType && oParameterInfo && (oParameterInfo.parameters.indexOf(sKey) > -1)) {
								oPropertyInfo.path = null;
								oPropertyInfo.name = sKey;
								oPropertyInfo.required = true;
								oParameterInfo.parameterTypes[sKey] = oObj.$Type;
								aFetchedProperties.push(oPropertyInfo);
							} else if (!bIsParameterType) {
								aFetchedProperties.push(oPropertyInfo);
							}
						}

					} else if (!bIsParameterType && (oObj.$kind === "NavigationProperty") && (!oObj.$isCollection)) {
						var sNavigationPropertySet = mNavigationProperties[sKey];
						if (sNavigationPropertySet && (aVisitedEntityTypes.indexOf(oObj.$Type) === -1)) {
							aPropertyListPromises.push(ODataFilterBarDelegate._fetchEntitySet(oMetaModel, '/' + sNavigationPropertySet, aVisitedEntityTypes, sKey, oParameterInfo));
						}
					}
				}
			}
			return Promise.all(aPropertyListPromises).then(function(aAProperties) {
				aAProperties.forEach(function(aProperties) {
					aFetchedProperties = aFetchedProperties.concat(aProperties);
				});
				return aFetchedProperties;
			});
		});
	};


	ODataFilterBarDelegate._waitForMetaModel = function (oFilterBar, sPassedModelName) {

		return new Promise(function(resolve, reject) {

			var resolveMetaModel = function () {
				var sModelName = sPassedModelName === null ? undefined : sPassedModelName;
				var oModel = oFilterBar.getModel(sModelName);
				if (oModel) {
					resolve(oModel);
				}
				return oModel;
			};

			var handleContextChange = function () {
				if (resolveMetaModel()) {
					oFilterBar.detachModelContextChange(handleContextChange);
				}
			};

			if (!resolveMetaModel()) {
				if (!oFilterBar.attachModelContextChange) {
					reject();
					return;
				}
				oFilterBar.attachModelContextChange(handleContextChange);
			}
		});
	};

	/**
	 * Fetches the relevant metadata for a given payload and returns property info array.
	 * @param {object} oFilterBar - the instance of filter bar
	 * @returns {Promise} once resolved an array of property info is returned
	 */
	ODataFilterBarDelegate.fetchProperties = function (oFilterBar, mPropertyBag) {

		if (!(oFilterBar.isA && oFilterBar.isA("sap.ui.mdc.FilterBar")) && mPropertyBag) {
			return ODataFilterBarDelegate._fetchPropertiesByMetadata(oFilterBar, mPropertyBag);
		}

		var sModelName = oFilterBar.getDelegate().payload.modelName;
		var sEntitySet = oFilterBar.getDelegate().payload.collectionName;

		return new Promise(function (resolve, reject) {

				var oMetaModel;

				var oCachedEntitySet = ODataFilterBarDelegate._getInstanceCacheEntry(oFilterBar, "fetchedProperties");
				if (oCachedEntitySet) {
					storeTemplatingSettings(oFilterBar, oCachedEntitySet);
					resolve(oCachedEntitySet);
					return;
				}

				this._waitForMetaModel(oFilterBar, sModelName).then(function(oModel) {
					if (!oModel || !sEntitySet) {
						reject("model or entity set name not available");
						return;
					}

					oMetaModel = oModel.getMetaModel();
					if (!oMetaModel) {
						reject("metadata model not available");
					} else {
						var aVisitedEntityTypes = [];
						var oParamInfo = {
							parameterNavigationName: null,
							parameters: [],
							parameterTypes: {}
						};
						ODataFilterBarDelegate._fetchEntitySet(oMetaModel, '/' + sEntitySet, aVisitedEntityTypes, null, oParamInfo).then(function(aProperties) {

							if (oParamInfo.parameterNavigationName && (oParamInfo.parameters.length > 0)) {
								ODataFilterBarDelegate._setInstanceCacheEntry(oFilterBar, sEntitySet + "-Parameters", oParamInfo);

								//parameters are initially at the top of the result
								aProperties.sort(function(p1, p2) {
									var p1Key = p1.path || p1.name;
									var p2Key = p2.path || p2.name;
									if ((!(oParamInfo.parameters.indexOf(p1Key) > -1) && !(oParamInfo.parameters.indexOf(p2Key) > -1)) ||
										( (oParamInfo.parameters.indexOf(p1Key) > -1) &&  (oParamInfo.parameters.indexOf(p2Key) > -1))     ) {
										return 0;
									}
									if ((oParamInfo.parameters.indexOf(p1Key) > -1) && !(oParamInfo.parameters.indexOf(p2Key) > -1)) {
										return -1;
									}
									if (!(oParamInfo.parameters.indexOf(p1Key) > -1) && (oParamInfo.parameters.indexOf(p2Key) > -1)) {
										return 1;
									}
								});
							}

							var mProperties = aProperties.reduce(function(mMap, oProp){
								mMap[oProp.name] = oProp;
								return mMap;
							}, {});

							aProperties = Object.keys(mProperties).map(function(sName) {
								return mProperties[sName];
							});

							ODataFilterBarDelegate._setInstanceCacheEntry(oFilterBar, "fetchedProperties", aProperties);
							storeTemplatingSettings(oFilterBar, aProperties);
							resolve(aProperties);
						});
					}
				}, function() {
					reject("model not obtained");
				});

		}.bind(this));
	};

	ODataFilterBarDelegate.cleanup = function (oFilterBar) {
		InstanceCache.delete(oFilterBar.getId());
	};

	return ODataFilterBarDelegate;
});
