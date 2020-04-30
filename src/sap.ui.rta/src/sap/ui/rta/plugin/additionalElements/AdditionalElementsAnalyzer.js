/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dt/ElementUtil",
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/ui/rta/util/BindingsExtractor"
], function (
	jQuery,
	ElementUtil,
	Log,
	ObjectPath,
	BindingsExtractor
) {
	"use strict";

	function _enrichProperty(mProperty, mODataEntity, oElement, sAggregationName, sModelName) {
		var mProp = {
			name :  mProperty.name,
			bindingPath : mProperty.name,
			entityType : mODataEntity.name
		};
		var mLabelAnnotation = mProperty["com.sap.vocabularies.Common.v1.Label"];
		mProp.label = mLabelAnnotation && mLabelAnnotation.String;

		var mQuickInfoAnnotation = mProperty["com.sap.vocabularies.Common.v1.QuickInfo"];
		mProp.tooltip = mQuickInfoAnnotation && mQuickInfoAnnotation.String;

		//CDS UI.Hidden new way also for sap:visible = false
		var mHiddenAnnotation = mProperty["com.sap.vocabularies.UI.v1.Hidden"];
		mProp.unsupported = !!mHiddenAnnotation && mHiddenAnnotation.Bool === "true";

		var mFieldControlAnnotation;
		if (!mProp.unsupported) {
			// Old hidden annotation
			mFieldControlAnnotation = mProperty["com.sap.vocabularies.Common.v1.FieldControl"];
			if (mFieldControlAnnotation && mFieldControlAnnotation.EnumMember) {
				mProp.unsupported = mFieldControlAnnotation.EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Hidden";
			} else {
				//@runtime hidden by field control value = 0
				var sFieldControlPath = mFieldControlAnnotation && mFieldControlAnnotation.Path;
				if (sFieldControlPath) {
					// if the binding is a listbinding, we skip the check for field control
					var bListBinding = oElement.getBinding(sAggregationName) instanceof sap.ui.model.ListBinding;
					if (!bListBinding) {
						var iFieldControlValue = oElement.getBindingContext(sModelName).getProperty(sFieldControlPath);
						mProp.unsupported = iFieldControlValue === 0;
					}
				}
			}
		}
		return mProp;
	}

	/**
	 * Is field using a complex type
	 *
	 * @param {object} mProperty - property from entityType
	 * @returns {boolean} - Returns true if property is using a complex type
	 */
	function _isComplexType (mProperty) {
		if (mProperty && mProperty.type) {
			if (mProperty.type.toLowerCase().indexOf("edm") !== 0) {
				return true;
			}
		}
		return false;
	}

	function _checkForAbsoluteAggregationBinding(oElement, sAggregationName, sModelName) {
		if (!oElement) {
			return false;
		}
		var mBindingInfo = oElement.getBindingInfo(sAggregationName, sModelName);
		var sPath = mBindingInfo && mBindingInfo.path;
		if (!sPath) {
			return false;
		}
		if (sPath.indexOf(">") > -1) {
			sPath = sPath.split(">").pop();
		}
		return sPath.indexOf("/") === 0;
	}

	function _getModelBindingData(oElement, bAbsoluteAggregationBinding, sAggregationName, sModelName) {
		var vBinding;
		if (bAbsoluteAggregationBinding) {
			vBinding = oElement.getBindingInfo(sAggregationName, sModelName);
			//check to be model binding otherwise return undefined
			if (typeof vBinding.model === "string" && vBinding.model !== sModelName) {
				vBinding = undefined;
			}
		} else {
			//here we explicitly request the models binding context
			vBinding = oElement.getBindingContext(sModelName);
		}
		return vBinding;
	}

	function _getBindingPath(oElement, sAggregationName, sModelName) {
		var bAbsoluteAggregationBinding = _checkForAbsoluteAggregationBinding(oElement, sAggregationName, sModelName);
		var vBinding = _getModelBindingData(oElement, bAbsoluteAggregationBinding, sAggregationName, sModelName);
		if (vBinding) {
			return bAbsoluteAggregationBinding ? vBinding.path : vBinding.getPath();
		}
	}

	function _convertMetadataToDelegateFormat (mODataEntity, oMetaModel, oElement, sAggregationName, sModelName) {
		var aProperties = mODataEntity.property.map(function(mProperty) {
			var mProp = _enrichProperty(mProperty, mODataEntity, oElement, sAggregationName, sModelName);
			if (_isComplexType(mProperty)) {
				var mComplexType = oMetaModel.getODataComplexType(mProperty.type);
				if (mComplexType) {
					//deep properties
					mProp.properties = mComplexType.property.map(function(mComplexProperty) {
						var mInnerProp = _enrichProperty(mComplexProperty, mODataEntity, oElement, sAggregationName, sModelName);
						mInnerProp.bindingPath = mProperty.name + "/" + mComplexProperty.name;
						mInnerProp.referencedComplexPropertyName = mProp.label || mProp.name; //TODO find a more generic name here and in dialog
						return mInnerProp;
					});
				}
			}
			return mProp;
		});
		if (mODataEntity.navigationProperty) {
			var aNavigationProperties = mODataEntity.navigationProperty.map(function(mNavProp) {
				var sFullyQualifiedEntityName = (
					oMetaModel.getODataAssociationEnd(mODataEntity, mNavProp.name)
					&& oMetaModel.getODataAssociationEnd(mODataEntity, mNavProp.name).type
				);
				return {
					name : mNavProp.name,
					//no labels or tooltips for navigation properties
					entityType: sFullyQualifiedEntityName,
					bindingPath: mNavProp.name,
					unsupported: true //no support for navigation properties yet
					//can have properties (like complex types in future)
				};
			});
			aProperties = aProperties.concat(aNavigationProperties);
		}
		return aProperties;
	}

	function _flattenProperties(aProperties) {
		var aFlattenedProperties = aProperties.reduce(function(aFlattened, oProperty) {
			if (Array.isArray(oProperty.properties)) {
				//currently only one level supported by our dialogs, etc.
				//Only take the leaves
				aFlattened = aFlattened.concat(oProperty.properties);
			} else {
				aFlattened.push(oProperty);
			}
			return aFlattened;
		}, []);

		return aFlattenedProperties;
	}

	function _loadODataMetaModel(oElement) {
		return Promise.resolve()
			.then(function() {
				var oModel = oElement.getModel();
				if (oModel) {
					var sModelType = oModel.getMetadata().getName();
					if (sModelType === "sap.ui.model.odata.ODataModel" || sModelType === "sap.ui.model.odata.v2.ODataModel") {
						var oMetaModel = oModel.getMetaModel();
						return oMetaModel.loaded().then(function() {
							return oMetaModel;
						});
					}
				}
			});
	}
	function _getODataEntityFromMetaModel(oMetaModel, sBindingContextPath) {
		var oMetaModelContext = oMetaModel.getMetaContext(sBindingContextPath);
		return oMetaModelContext.getObject();
	}
	function _adjustODataEntityForListBindings(oElement, oMetaModel, mODataEntity) {
		var oDefaultAggregation = oElement.getMetadata().getAggregation();
		if (oDefaultAggregation) {
			var oBinding = oElement.getBindingInfo(oDefaultAggregation.name);
			var oTemplate = oBinding && oBinding.template;

			if (oTemplate) {
				var sPath = oElement.getBindingPath(oDefaultAggregation.name);
				var oODataAssociationEnd = oMetaModel.getODataAssociationEnd(mODataEntity, sPath);
				var sFullyQualifiedEntityName = oODataAssociationEnd && oODataAssociationEnd.type;
				if (sFullyQualifiedEntityName) {
					var oEntityType = oMetaModel.getODataEntityType(sFullyQualifiedEntityName);
					mODataEntity = oEntityType;
				}
			}
		}
		return mODataEntity;
	}

	/**
	 * Fetching all available properties of the Element's Model
	 * @param {sap.ui.core.Element} oElement - Element instance
	 * @param {string} sAggregationName - Aggregation name of the action
	 * @return {Promise} - Returns Promise with results in delegate format
	 * @private
	 */
	function _getODataPropertiesOfModel(oElement, sAggregationName) {
		return _loadODataMetaModel(oElement)
			.then(function(oMetaModel) {
				var aProperties = [];
				if (oMetaModel) {
					var sBindingContextPath = _getBindingPath(oElement, sAggregationName);
					if (sBindingContextPath) {
						var mODataEntity = _getODataEntityFromMetaModel(oMetaModel, sBindingContextPath);

						mODataEntity = _adjustODataEntityForListBindings(oElement, oMetaModel, mODataEntity);

						aProperties = _convertMetadataToDelegateFormat(
							mODataEntity,
							oMetaModel,
							oElement,
							sAggregationName);
					}
				}
				return aProperties;
			}).then(_flattenProperties);
	}

	function _getAllPropertiesFromDelegate(oElement, sAggregationName, mAction) {
		var mPropertyBag = {
			element: oElement,
			aggregationName: sAggregationName,
			payload: mAction.delegateInfo.payload || {}
		};
		return mAction.delegateInfo.delegate.getPropertyInfo(mPropertyBag)
			.then(_flattenProperties);
	}

	function _getAllPropertiesFromModels(oElement, sAggregationName, mActions) {
		var mAddODataProperty = mActions.addODataProperty;
		var mAddViaDelegate = mActions.addViaDelegate;
		var fnGetAllProperties;
		if (mAddViaDelegate) {
			fnGetAllProperties = _getAllPropertiesFromDelegate.bind(null, oElement, sAggregationName, mAddViaDelegate);
		} else if (mAddODataProperty) {
			fnGetAllProperties = _getODataPropertiesOfModel.bind(null, oElement, sAggregationName);
		} else {
			fnGetAllProperties = Promise.resolve.bind(Promise, []);
		}
		return fnGetAllProperties() //arguments bound before
			.then(function(aProperties) {
				return _checkForComplexDuplicates(aProperties);
			});
	}

	function _filterUnsupportedProperties(aProperties) {
		return aProperties.filter(function(mProperty) {
			//see _enrichProperty
			return !mProperty.unsupported;
		});
	}

	function _assignCustomItemIds(sParentId, oCustomItem) {
		oCustomItem.type = "custom";
		if (oCustomItem.id) {
			oCustomItem.itemId = sParentId + "-" + oCustomItem.id;
			oCustomItem.key = oCustomItem.itemId;
		}
		return oCustomItem;
	}

	function _oPropertyToAdditionalElementInfo (sType, oProperty) {
		return {
			selected : false,
			label : oProperty.label || oProperty.name,
			referencedComplexPropertyName: oProperty.referencedComplexPropertyName ? oProperty.referencedComplexPropertyName : "",
			duplicateComplexName: oProperty.duplicateComplexName ? oProperty.duplicateComplexName : false,
			tooltip :  oProperty.tooltip || oProperty.label,
			originalLabel: "",
			//command relevant data
			type : sType,
			entityType : oProperty.entityType,
			name : oProperty.name,
			bindingPath : oProperty.bindingPath
		};
	}

	function _elementToAdditionalElementInfo (mData) {
		var oElement = mData.element;
		var mAction = mData.action;
		var mBindingPathCollection = mData.bindingPathCollection;
		return {
			selected : false,
			label : oElement.label || ElementUtil.getLabelForElement(oElement, mAction.getLabel),
			tooltip : oElement.tooltip || ElementUtil.getLabelForElement(oElement, mAction.getLabel) || oElement.name,
			referencedComplexPropertyName: oElement.referencedComplexPropertyName ? oElement.referencedComplexPropertyName : "",
			duplicateComplexName: oElement.duplicateComplexName ? oElement.duplicateComplexName : false,
			bindingPaths: mBindingPathCollection.bindingPaths,
			originalLabel: oElement.renamedLabel && oElement.label !== oElement.originalLabel ? oElement.originalLabel : "",
			//command relevant data
			type : "invisible",
			elementId : oElement.getId()
		};
	}

	/**
	 * Retrieving sibling elements from its parent container which are bound to the same Model (important!)
	 *
	 * @param {sap.ui.core.Element} oElement - element for which we're looking for siblings
	 * @param {sap.ui.core.Element} oRelevantContainer - "parent" container of the oElement
	 * @param {string} sAggregationName - name of the aggregation of the action
	 * @param {string} sModelName - model name
	 *
	 * @return {sap.ui.core.Element[]} - returns an array with found siblings elements
	 *
	 * @private
	 */
	function _getRelevantElements(oElement, oRelevantContainer, sAggregationName, sModelName) {
		if (oRelevantContainer && oRelevantContainer !== oElement) {
			var sRelevantContainerBindingPath = _getBindingPath(oElement, sAggregationName, sModelName);

			return ElementUtil
				.findAllSiblingsInContainer(oElement, oRelevantContainer)
				// We accept only siblings that are bound on the same model
				.filter(function (oSiblingElement) {
					return sRelevantContainerBindingPath === _getBindingPath(oSiblingElement, sAggregationName, sModelName);
				});
		}
		return [oElement];
	}

	function _checkForComplexDuplicates(aProperties) {
		aProperties.forEach(function(oModelProperty, index, aProperties) {
			if (oModelProperty["duplicateComplexName"] !== true) {
				for (var j = index + 1; j < aProperties.length - 1; j++) {
					if (oModelProperty.label === aProperties[j].label) {
						oModelProperty["duplicateComplexName"] = true;
						aProperties[j]["duplicateComplexName"] = true;
					}
				}
			}
		});
		return aProperties;
	}

	//check for duplicate labels to later add the referenced complexTypeName if available
	function _checkForDuplicateLabels(oInvisibleElement, aProperties) {
		//TODO find a more generic name here and in dialog
		return aProperties.some(function(oModelProperty) {
			return oModelProperty.label === oInvisibleElement.label;
		});
	}

	/**
	 * Checks if array of paths is not empty
	 * @param {string[]} aBindingPaths - Array of collected binding paths
	 * @return {boolean} - true if it has binding(s)
	 * @private
	 */
	function _hasBindings(aBindingPaths) {
		return Array.isArray(aBindingPaths) && aBindingPaths.length > 0;
	}

	/**
	 * Looks for a model property for a set of bindings paths
	 *
	 * @param {string[]} aControlsBindingPaths - Array of collected binding paths
	 * @param {object[]} aProperties - Array of Fields
	 *
	 * @return {object|undefined} - returns first found Object with Field (Property) description, undefined if not found
	 *
	 * @private
	 */
	function _findModelProperty(aControlsBindingPaths, aProperties) {
		return aProperties.filter(function (oModelProperty) {
			return aControlsBindingPaths.some(function(sBindingPath) {
				//there might be some deeper binding paths available on controls,
				//than returned by the model evaluation (e.g. navigation property paths)
				//So we only check a properties are part of the controls bindings
				return sBindingPath.startsWith(oModelProperty.bindingPath);
			});
		}).pop();
	}

	function _vBindingToPath(vBinding) {
		return (
			jQuery.isPlainObject(vBinding)
			? vBinding.parts[0].path //TODO what about complex bindings with multiple paths, this was not covered so far?
			: !!vBinding.getPath && vBinding.getPath()
		);
	}

	function _getUnrepresentedProperties(oElement, mAction, sModelName, fnGetAllProperties, sType) {
		var oDefaultAggregation = oElement.getMetadata().getAggregation();
		var sAggregationName = oDefaultAggregation ? oDefaultAggregation.name : mAction.action.aggregation;
		return Promise.resolve()
			.then(function () {
				return fnGetAllProperties(oElement, sAggregationName, mAction);
			})
			.then(function(aAllProperties) {
				var oModel = oElement.getModel(sModelName);
				var aUnrepresentedProperties = _filterUnsupportedProperties(aAllProperties);
				var aRelevantElements = _getRelevantElements(oElement, mAction.relevantContainer, sAggregationName, sModelName);
				var aBindingPaths = [];

				aRelevantElements.forEach(function(oElement) {
					aBindingPaths = aBindingPaths.concat(BindingsExtractor.getBindings(oElement, oModel)
						.map(_vBindingToPath)
					);
				});

				var fnFilter = mAction.action.filter ? mAction.action.filter : function() {return true;};

				aUnrepresentedProperties = aUnrepresentedProperties.filter(function(oModelProperty) {
					var bHasBindingPath = false;
					if (aBindingPaths) {
						bHasBindingPath = aBindingPaths.some(function(sBindingPath) {
							return sBindingPath === oModelProperty.bindingPath;
						});
					}
					return !bHasBindingPath && fnFilter(mAction.relevantContainer, oModelProperty);
				});

				aUnrepresentedProperties = _checkForComplexDuplicates(aUnrepresentedProperties);

				return aUnrepresentedProperties;
			}).then(function(aUnrepresentedProperties) {
				return aUnrepresentedProperties.map(_oPropertyToAdditionalElementInfo.bind(null, sType));
			});
	}

	/**
	 * Enhance Invisible Element with extra data from model property or custom item
	 *
	 * @param {sap.ui.core.Element} oInvisibleElement - Invisible Element
	 * @param {object} mSomeItem - source of data enhancement process
	 *
	 * @private
	 */
	function _enhanceInvisibleElement(oInvisibleElement, mSomeItem) {
		oInvisibleElement.originalLabel = mSomeItem.label;

		oInvisibleElement.tooltip = mSomeItem.tooltip;

		oInvisibleElement.name = mSomeItem.name;

		// oInvisibleElement.label has the current label
		if (oInvisibleElement.label !== oInvisibleElement.originalLabel) {
			oInvisibleElement.renamedLabel = true;
		}
		if (mSomeItem.referencedComplexPropertyName) {
			oInvisibleElement.referencedComplexPropertyName = mSomeItem.referencedComplexPropertyName;
		}
	}

	/**
	 * Checks if this InvisibleProperty should be included in resulting list and adds information
	 * from models metadata to the InvisibleProperty if available
	 * if metadata is available and the element is not present in it, do not include it:
	 * Example use case: custom field which was hidden and then removed from system
	 * should not be available for reveal after the removal
	 *
	 * @param {sap.ui.core.Element} oInvisibleElement - Invisible Element
	 * @param {object[]} aProperties - Array of Fields
	 * @param {object} mBindingPaths - Map of all binding paths and binding context paths of the passed invisible element
	 *
	 * @return {boolean} - whether this field should be included
	 *
	 * @private
	 */
	function _checkAndEnhanceByModelProperty(oInvisibleElement, aProperties, mBindingPaths) {
		var aBindingPaths = mBindingPaths.bindingPaths;

		if (!_hasBindings(aBindingPaths)) {
			// include it if the field has no bindings (bindings can be added in runtime)
			return true;
		}

		var mModelProperty = _findModelProperty(aBindingPaths, aProperties);
		if (mModelProperty) {
			_enhanceInvisibleElement(oInvisibleElement, mModelProperty);
			return true;
		}
		return false;
	}

	function _getModelName(mAddViaDelegate) {
		//ManagedObject jsdoc tells to use undefined for default model, therefore it
		//is necessary to return undefined if modelName or whole delegateInfo is missing
		return ObjectPath.get("delegateInfo.payload.modelName", mAddViaDelegate);
	}

	// API: depending on the available actions for the aggregation call one or both of these methods
	var oAnalyzer = {
		/**
		 * Filters available invisible elements whether they could be shown or not
		 *
		 * @param {sap.ui.core.Element} oElement - Container Element where to start search for a invisible
		 * @param {object} mActions - Container with actions
		 *
		 * @return {Promise} - returns a Promise which resolves with a list of hidden controls are available to display
		 */
		enhanceInvisibleElements : function(oElement, mActions) {
			var mRevealData = mActions.reveal;
			var mAddODataProperty = mActions.addODataProperty;
			var mAddViaDelegate = mActions.addViaDelegate;
			var sModelName = _getModelName(mAddViaDelegate);
			var mCustom = mActions.addViaCustom;
			var oDefaultAggregation = oElement.getMetadata().getAggregation();
			var sAggregationName = oDefaultAggregation ? oDefaultAggregation.name : mActions.aggregation;
			var oModel = oElement.getModel(sModelName);
			return Promise.resolve()
				.then(function () {
					return _getAllPropertiesFromModels(oElement, sAggregationName, mActions);
				})
				.then(function(aProperties) {
					var aAllElementData = [];
					var aInvisibleElements = mRevealData.elements || [];

					aInvisibleElements.forEach(function(mInvisibleElement) {
						var oInvisibleElement = mInvisibleElement.element;
						var mAction = mInvisibleElement.action;
						var bIncludeElement = true;
						var mBindingPathCollection = {};
						oInvisibleElement.label = ElementUtil.getLabelForElement(oInvisibleElement, mAction.getLabel);

						// BCP: 1880498671
						if (mAddODataProperty || mAddViaDelegate) {
							if (_getBindingPath(oElement, sAggregationName, sModelName) === _getBindingPath(oInvisibleElement, sAggregationName, sModelName)) {
								//TODO fix with stashed type support
								mBindingPathCollection = BindingsExtractor.collectBindingPaths(oInvisibleElement, oModel);
								oInvisibleElement.duplicateComplexName = _checkForDuplicateLabels(oInvisibleElement, aProperties);

								bIncludeElement = _checkAndEnhanceByModelProperty(
									oInvisibleElement,
									aProperties,
									mBindingPathCollection);
							} else if (BindingsExtractor.getBindings(oInvisibleElement, oModel).length > 0) {
								bIncludeElement = false;
							}
						}

						if (mCustom && bIncludeElement) {
							mCustom.items.forEach(function(oCustomItem) {
								_assignCustomItemIds(oElement.getParent().getId(), oCustomItem);
								if (oCustomItem.itemId === oInvisibleElement.getId()) {
									_enhanceInvisibleElement(oInvisibleElement, oCustomItem);
								}
							});
						}

						if (bIncludeElement) {
							aAllElementData.push({
								element : oInvisibleElement,
								action : mAction,
								bindingPathCollection: mBindingPathCollection
							});
						}
					});
					return aAllElementData;
				})
				.then(function(aAllElementData) {
					return aAllElementData.map(_elementToAdditionalElementInfo);
				});
		},

		/**
		 * Retrieves available OData properties from the metadata
		 *
		 * @param {sap.ui.core.Element} oElement - Source element of which Model we're looking for additional properties
		 * @param {object} mAction - Action descriptor for add via odata property action
		 *
		 * @return {Promise} - returns a Promise which resolves with a list of available to display OData properties
		 */
		getUnboundODataProperties: function (oElement, mAction) {
			return _getUnrepresentedProperties(
				oElement,
				mAction,
				undefined,
				_getODataPropertiesOfModel,
				"odata"
			);
		},

		/**
		 * Retrieves available properties from the delegate
		 *
		 * @param {sap.ui.core.Element} oElement - Source element for which delegate we're looking for additional properties
		 * @param {object} mAction - Action descriptor for add via delegate action
		 *
		 * @return {Promise} - returns a Promise which resolves with a list of available to display delegate properties
		 */
		getUnrepresentedDelegateProperties: function (oElement, mAction) {
			var sModelName = _getModelName(mAction);
			return _getUnrepresentedProperties(
				oElement,
				mAction,
				sModelName,
				_getAllPropertiesFromDelegate,
				"delegate"
			);
		},

		getCustomAddItems: function(oElement, mAction) {
			return new Promise(function(fnResolve) {
				if (Array.isArray(mAction.items)) {
					// remove items already rendered
					fnResolve(
						mAction.items
							.map(_assignCustomItemIds.bind(null, oElement.getParent().getId()))
							.filter(function(oCustomItem) {
								if (!oCustomItem.id) {
									Log.error("CustomAdd item with label " + oCustomItem.label + " does not contain an 'id' property", "sap.ui.rta.plugin.AdditionalElementsAnalyzer#showAvailableElements");
									return false;
								}
								return !ElementUtil.getElementInstance(oCustomItem.itemId);
							})
					);
				} else {
					fnResolve();
				}
			});
		},

		getFilteredItemsList: function(aAnalyzerValues) {
			// promise index 0: invisible, 1: addViaOData/addViaDelegate, 2: custom
			var aInvisibleElements = aAnalyzerValues[0];
			var iCustomItemsIndex = 2;
			var aCustomItems = aAnalyzerValues[iCustomItemsIndex];
			if (aCustomItems) {
				var aInvisibleElementIds = aInvisibleElements.map(
					function (oInvisibleItem) {
						return oInvisibleItem.elementId;
					}
				);
				// filter for hidden custom items in the array
				aAnalyzerValues[iCustomItemsIndex] = aCustomItems
					.filter(function(oCustomItem) {
						return !oCustomItem.itemId || aInvisibleElementIds.indexOf(oCustomItem.itemId) === -1;
					});
			}
			return aAnalyzerValues
				.reduce(function (aAllElements, aAnalyzerValue) {
					return aAllElements.concat(aAnalyzerValue);
				}, []);
		}
	};
	return oAnalyzer;
});
