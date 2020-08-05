/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	'./ODataMetaModelUtil', 'sap/ui/mdc/enum/FieldDisplay', "sap/ui/fl/Utils", "sap/ui/mdc/FilterBarDelegate", 'sap/base/util/ObjectPath', 'sap/base/util/merge', 'sap/ui/mdc/odata/v4/BaseDelegate', 'sap/ui/mdc/condition/FilterOperatorUtil', "sap/ui/model/FilterOperator", "sap/ui/model/Filter", 'sap/ui/mdc/util/IdentifierUtil', 'sap/ui/core/util/reflection/JsControlTreeModifier'
	], function (ODataMetaModelUtil, FieldDisplay, FlUtils, FilterBarDelegate, ObjectPath, merge, BaseDelegate, FilterOperatorUtil, ModelOperator, Filter, IdentifierUtil, JsControlTreeModifier) {
	"use strict";

	/**
	 * Helper class for sap.ui.mdc.FilterBar.
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.odata.v4.FilterBarDelegate
	 */
	var ODataFilterBarDelegate = Object.assign({}, FilterBarDelegate, BaseDelegate);

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

	var mMainEntitySet = {};



	ODataFilterBarDelegate._fetchPropertiesByMetadata = function(oFilterBar, mPropertyBag) {

		var oDelegate, sModelName, sCollectionName, oModel, sFilterBarId;

		if (mPropertyBag) {
			var oModifier = mPropertyBag.modifier;

			oDelegate = oModifier.getProperty(oFilterBar, "delegate");
			sModelName =  oDelegate.payload.modelName === null ? undefined : oDelegate.payload.modelName;
			sCollectionName = oDelegate.payload.collectionName;
			oModel = mPropertyBag.appComponent.getModel(sModelName);
		} else {

			oDelegate = oFilterBar.getProperty("delegate");
			sModelName =  oDelegate.payload.modelName === null ? undefined : oDelegate.payload.modelName;
			sCollectionName = oDelegate.payload.collectionName;
			oModel = oFilterBar.getModel(sModelName);
		}

		sFilterBarId = oFilterBar.getId ? oFilterBar.getId() :  oFilterBar.id;

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
				}
		};

		return this.fetchProperties(oObj);
	};

	ODataFilterBarDelegate._ensureSingleRangeEQOperators = function() {
		var oOperator;
		if (!FilterOperatorUtil.getOperator("SINGLE_RANGE_EQ")) {
			oOperator = merge({}, FilterOperatorUtil.getOperator("EQ"));
			oOperator.name = "SINGLE_RANGE_EQ";
			oOperator.getModelFilter = function(oCondition, sFieldPath) {
				return new Filter({ filters: [new Filter(sFieldPath, ModelOperator.GE, oCondition.values[0]),
											  new Filter(sFieldPath, ModelOperator.LE, oCondition.values[0])],
										and: true});
			};

			FilterOperatorUtil.addOperator(oOperator);
		}

		if (!FilterOperatorUtil.getOperator("SINGLE_RANGE_EQ")) {
			oOperator = merge({}, FilterOperatorUtil.getOperator("EQ"));
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
			var oOperator = merge({}, FilterOperatorUtil.getOperator("BT"));
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
		var oView = mPropertyBag ? mPropertyBag.view : FlUtils.getViewForControl(oFilterBar);
		var sViewId = mPropertyBag ? mPropertyBag.viewId : null;
		var sName = oProperty.path || oProperty.name;
		var oSelector = {};

		if (oFilterBar.getId) {
			oSelector.id = oFilterBar.getId();
		} else {
			oSelector.id = oFilterBar.id;
		}
		var sSelectorId = oModifier.getControlIdBySelector(oSelector, oAppComponent);
		var sId = sSelectorId +  "--filter--" + IdentifierUtil.replace(sName);

		return oModifier.createControl("sap.ui.mdc.FilterField", oAppComponent, oView, sId, {
			dataType: oProperty.typeConfig.className,
			conditions: "{$filters>/conditions/" + sName + '}',
			required: oProperty.required,
			label: oProperty.label || oProperty.name,
			maxConditions: oProperty.maxConditions,
			delegate: {name: "sap/ui/mdc/odata/v4/FieldBaseDelegate", payload: {}}
		}, true).then(function(oFilterField) {
			if (oProperty.fieldHelp) {

				var sFieldHelp = oProperty.fieldHelp;
				if (!sViewId) { // viewId is only set during xmlTree processing
					sFieldHelp = oView.createId(oProperty.fieldHelp);
				} else {
					sFieldHelp = sViewId + "--" + oProperty.fieldHelp;
				}
				oModifier.setAssociation(oFilterField, "fieldHelp", sFieldHelp);
			}

			if (oProperty.filterOperators) {
				if (oFilterBar.getId) {
					oModifier.setProperty(oFilterField, "operators", oProperty.filterOperators);
				} else {
					oModifier.setProperty(oFilterField, "operators", oProperty.filterOperators.join(','));
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

			if (oProperty.display) {
				oModifier.setProperty(oFilterField, "display", oProperty.display);
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

	ODataFilterBarDelegate.beforeAddFilterFlex = function(sPropertyName, oFilterBar, mPropertyBag) {
		return Promise.resolve(this._createFilter(sPropertyName, oFilterBar, mPropertyBag));
	};

	/**
	 * Can be used to trigger any necessary follow-up steps on removal of filter items. The returned boolean value inside the Promise can be used to
	 * prevent default follow-up behaviour of Flex.
	 *
	 * @param {sap.ui.mdc.FilterField} oFilterField The mdc.FilterField that was removed
	 * @param {sap.ui.mdc.FilterBar} oFilterBar - the instance of filter bar
	 * @param {Object} mPropertyBag Instance of property bag from Flex change API
	 * @returns {Promise} Promise that resolves with true/false to allow/prevent default behavour of the change
	 */
	ODataFilterBarDelegate.afterRemoveFilterFlex =  function(oFilterField, oFilterBar, mPropertyBag) {
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
				hiddenFilter: bHiddenFilter
		};

		if (sDisplay) {
			oProperty.display = sDisplay;
		}

		if (oObj.$Type === "Edm.DateTimeOffset") {
			if (!oConstraints) {
				oConstraints = {};
			}

			oConstraints.V4 = true;
		}

		if (oConstraints) {
			oProperty.constraints = oConstraints;
		}

		//TODO: what should be considered for format options ???
		//oProperty.formatOptions = ;

		if (oFilterDefaultValue) {
			oProperty.defaultFilterConditions = [{ fieldPath: sKey, operator: "EQ", values: [oFilterDefaultValue] }];
		}

		//Currently the FilterBar will use 'name' as key for the identification between existing
		//FilterFields - currently there is no connection such as 'dataProperties' between existing Fields
		//and PropertyInfo, the usage of a complex 'name' (e.g. containing '/') might be reconsidered.
		oProperty.name = sNavigationPropertyName ? sNavigationPropertyName + "/" + sKey : sKey;

		oProperty.typeConfig = this.getTypeUtil().getTypeConfig(oObj.$Type, oProperty.formatOptions, oProperty.constraints);

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
				sGroupLabel = sGroup;
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
						oPropertyInfo = ODataFilterBarDelegate._fetchPropertyInfo(oMetaModel, sEntitySetPath, sNavigationPropertyName, oObj, sKey, oParameterInfo);
						if (oPropertyInfo) {
							oPropertyInfo.group = sGroup;
							oPropertyInfo.groupLabel = sGroupLabel;

							oPropertyInfo.required = aRequiredProps.indexOf(sKey) >= 0;
							oPropertyInfo.visible = aSelectionFields.indexOf(sKey) >= 0;
							if (mAllowedExpressions[sKey]) {
								var aOperators =  ODataFilterBarDelegate._getFilterOperators(mAllowedExpressions[sKey]);
								if (aOperators) {
									oPropertyInfo.filterOperators = aOperators;
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


	ODataFilterBarDelegate._setModel = function () {
		var sModelName = this.getPayload().modelName;
		sModelName = sModelName === null ? undefined : sModelName;
		var oModel = this.getModel(sModelName);
		if (oModel) {
			this.detachModelContextChange(ODataFilterBarDelegate._setModel, this);
			ODataFilterBarDelegate._fModelProvided(oModel);
		}
	};

	ODataFilterBarDelegate._waitForMetaModel = function (oFilterBar, sPassedModelName) {

		return new Promise(function(resolve, reject) {
			var sModelName = sPassedModelName === null ? undefined : sPassedModelName;

			var oModel = oFilterBar.getModel(sModelName);
			if (oModel) {
				resolve(oModel);
			}

			if (!oFilterBar.attachModelContextChange) {
				reject();
			}

			ODataFilterBarDelegate._fModelProvided = resolve;

			oFilterBar.attachModelContextChange(ODataFilterBarDelegate._setModel, oFilterBar);

		});
	};

	/**
	 * Fetches the relevant metadata for a given payload and returns property info array.
	 * @param {object} oFilterBar - the instance of filter bar
	 * @returns {Promise} once resolved an array of property info is returned
	 */
	ODataFilterBarDelegate.fetchProperties = function (oFilterBar) {

		var sModelName = oFilterBar.getDelegate().payload.modelName;
		var sEntitySet = oFilterBar.getDelegate().payload.collectionName;

		return new Promise(function (resolve, reject) {

				var oMetaModel;

				var sCachKey = oFilterBar.getId() + '->' + sEntitySet;
				if (mMainEntitySet[sCachKey]) {
					resolve(mMainEntitySet[sCachKey]);
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
								window[oFilterBar.getId() + '->' + sEntitySet + "-Parameters"] = oParamInfo;

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

							mMainEntitySet[sCachKey] = aProperties;
							resolve(aProperties);
						});
					}
				}, function() {
					reject("model not obtained");
				});

		}.bind(this));
	};


	ODataFilterBarDelegate.cleanup = function (oFilterBar) {
		var sFilterBarId = oFilterBar.getId() + "->";

		Object.keys(mMainEntitySet).forEach(function(sKey){
			if (sKey.indexOf(sFilterBarId) === 0) {

				delete window[sFilterBarId + sKey + "-Parameters"];
				delete mMainEntitySet[sKey];
			}
		});
	};


	return ODataFilterBarDelegate;
});
