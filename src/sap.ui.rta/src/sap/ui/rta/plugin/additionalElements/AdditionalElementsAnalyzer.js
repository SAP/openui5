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

	function _getBindingContextPath(oElement, sAggregationName, sModelName) {
		var bAbsoluteAggregationBinding = _checkForAbsoluteAggregationBinding(oElement, sAggregationName, sModelName);
		var vBinding = _getModelBindingData(oElement, bAbsoluteAggregationBinding, sAggregationName, sModelName);
		if (vBinding) {
			return bAbsoluteAggregationBinding ? vBinding.path : vBinding.getPath();
		}
	}
	function _flattenProperties(aProperties) {
		var aFlattenedProperties = aProperties.reduce(function(aFlattened, oProperty) {
			if (Array.isArray(oProperty.properties)) {
				//currently only one level supported by our dialogs, etc. => TODO make deep types possible
				//Only take the leaves, but attach the parent property name/label to it
				aFlattened = aFlattened.concat(oProperty.properties.map(function(mInnerProp) {
					mInnerProp.parentPropertyName = oProperty.label || oProperty.name;
					return mInnerProp;
				}));
			} else {
				aFlattened.push(oProperty);
			}
			return aFlattened;
		}, []);

		return aFlattenedProperties;
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
		var mAddViaDelegate = mActions.addViaDelegate;
		var fnGetAllProperties;
		if (mAddViaDelegate) {
			fnGetAllProperties = _getAllPropertiesFromDelegate.bind(null, oElement, sAggregationName, mAddViaDelegate);
		} else {
			fnGetAllProperties = Promise.resolve.bind(Promise, []);
		}
		return fnGetAllProperties() //arguments bound before
			.then(function(aProperties) {
				return _checkForDuplicateProperties(aProperties);
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

	function _oPropertyToAdditionalElementInfo (oProperty) {
		return {
			selected : false,
			label : oProperty.label || oProperty.name,
			parentPropertyName: oProperty.parentPropertyName ? oProperty.parentPropertyName : "",
			duplicateName: oProperty.duplicateName ? oProperty.duplicateName : false,
			tooltip :  oProperty.tooltip || oProperty.label,
			originalLabel: "",
			//command relevant data
			type : "delegate",
			entityType : oProperty.entityType,
			name : oProperty.name,
			bindingPath : oProperty.bindingPath
		};
	}

	function _elementToAdditionalElementInfo (mData) {
		var oElement = mData.element;
		var mAction = mData.action;
		return {
			selected : false,
			label : oElement.__label || ElementUtil.getLabelForElement(oElement, mAction.getLabel),
			tooltip : oElement.__tooltip || ElementUtil.getLabelForElement(oElement, mAction.getLabel) || oElement.__bindingPath,
			parentPropertyName: oElement.__parentPropertyName ? oElement.__parentPropertyName : "",
			duplicateName: oElement.__duplicateName ? oElement.__duplicateName : false,
			originalLabel: oElement.__renamedLabel && oElement.__label !== oElement.__originalLabel ? oElement.__originalLabel : "",
			bindingPath: oElement.__bindingPath, //used for OPA tests and debugging
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
			var sRelevantContainerBindingContext = _getBindingContextPath(oElement, sAggregationName, sModelName);

			return ElementUtil
				.findAllSiblingsInContainer(oElement, oRelevantContainer)
				// We accept only siblings that are bound on the same model
				.filter(function (oSiblingElement) {
					return sRelevantContainerBindingContext === _getBindingContextPath(oSiblingElement, sAggregationName, sModelName);
				});
		}
		return [oElement];
	}

	function _checkForDuplicateProperties(aProperties) {
		aProperties.forEach(function(oModelProperty, index, aProperties) {
			if (oModelProperty["duplicateName"] !== true) {
				for (var j = index + 1; j < aProperties.length - 1; j++) {
					if (oModelProperty.label === aProperties[j].label) {
						oModelProperty["duplicateName"] = true;
						aProperties[j]["duplicateName"] = true;
					}
				}
			}
		});
		return aProperties;
	}

	//check for duplicate labels to later add the parent property name/label if available
	function _checkForDuplicateLabels(oInvisibleElement, aProperties) {
		return aProperties.some(function(oModelProperty) {
			return oModelProperty.label === oInvisibleElement.__label;
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

	function _getRepresentedBindingPathsFromBinding(oElement, mAction, sModelName, sAggregationName) {
		var oModel = oElement.getModel(sModelName);
		var aRelevantElements = _getRelevantElements(oElement, mAction.relevantContainer, sAggregationName, sModelName);
		var aBindingPaths = [];

		aRelevantElements.forEach(function(oElement) {
			aBindingPaths = aBindingPaths.concat(BindingsExtractor.getBindings(oElement, oModel)
				.map(_vBindingToPath)
			);
		});
		return aBindingPaths;
	}

	function _getRepresentedPropertiesFromDelegate(mAction, sAggregationName) {
		var mPropertyBag = {
			element: mAction.relevantContainer,
			aggregationName: sAggregationName,
			payload: mAction.delegateInfo.payload || {}
		};
		return mAction.delegateInfo.delegate.getRepresentedProperties(mPropertyBag);
	}

	function _getRepresentedBindingPathsFromDelegateOrBinding(oElement, mAction, sModelName, sAggregationName) {
		return _getRepresentedPropertiesFromDelegate(mAction, sAggregationName)
		.then(function(aRepresentedProperties) {
			if (aRepresentedProperties === undefined) {
				//delegate skipped taking over => evaluate binding
				return _getRepresentedBindingPathsFromBinding(oElement, mAction, sModelName, sAggregationName);
			}
			var aBindingPaths = [];
			aRepresentedProperties.forEach(function(oRepresentedProperty) {
				aBindingPaths = aBindingPaths.concat(oRepresentedProperty.bindingPaths);
			});
			return aBindingPaths;
		});
	}


	function _getRepresentedBindingPaths(oElement, mAction, sModelName, sAggregationName) {
		return Promise.resolve().then(function() {
			var bHasDelegateAndGetRepresentedProperties = !!ObjectPath.get("delegateInfo.delegate.getRepresentedProperties", mAction);

			if (bHasDelegateAndGetRepresentedProperties) {
				return _getRepresentedBindingPathsFromDelegateOrBinding(oElement, mAction, sModelName, sAggregationName);
			}
			return _getRepresentedBindingPathsFromBinding(oElement, mAction, sModelName, sAggregationName);
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
		oInvisibleElement.__originalLabel = mSomeItem.label;

		oInvisibleElement.__tooltip = mSomeItem.tooltip;

		//found element
		oInvisibleElement.__bindingPath = mSomeItem.name;

		// oInvisibleElement.__label has the current label retrieved before in the analysis
		if (oInvisibleElement.__label !== oInvisibleElement.__originalLabel) {
			oInvisibleElement.__renamedLabel = true;
		}
		if (mSomeItem.parentPropertyName) {
			oInvisibleElement.__parentPropertyName = mSomeItem.parentPropertyName;
		}
	}

	function _getRepresentedBindingPathsFromDelegateIfAvailable(mAction, sAggregationName) {
		var bHasDelegateAndGetRepresentedProperties = !!ObjectPath.get("delegateInfo.delegate.getRepresentedProperties", mAction);

		if (bHasDelegateAndGetRepresentedProperties) {
			return _getRepresentedPropertiesFromDelegate(mAction, sAggregationName);
		}
	}

	function _getRepresentedBindingPathsOfInvisibleElement(oInvisibleElement, aRepresentedProperties) {
		var oRepresentedProperty;
		aRepresentedProperties.some(function(oProperty) {
			if (oProperty.id === oInvisibleElement.getId()) {
				oRepresentedProperty = oProperty;
				return true; //skip processing
			}
		});
		return oRepresentedProperty.bindingPaths || [];
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
	 * @param {string[]} aBindingPaths - Map of all binding paths and binding context paths of the passed invisible element
	 *
	 * @return {boolean} - whether this field should be included
	 *
	 * @private
	 */
	function _checkAndEnhanceByModelProperty(oInvisibleElement, aProperties, aBindingPaths) {
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

	function _enhanceByMetadata(oElement, sAggregationName, oInvisibleElement, mActions, aRepresentedProperties, aProperties) {
		var mAddViaDelegate = mActions.addViaDelegate;
		var sModelName = _getModelName(mAddViaDelegate);
		var oModel = oElement.getModel(sModelName);
		var bIncludeElement = true;
		var aBindingPaths = [];

		if (mAddViaDelegate) {
			if (mAddViaDelegate && aRepresentedProperties) {
				aBindingPaths = _getRepresentedBindingPathsOfInvisibleElement(oInvisibleElement, aRepresentedProperties);

			// BCP: 1880498671
			} else if (_getBindingContextPath(oElement, sAggregationName, sModelName) === _getBindingContextPath(oInvisibleElement, sAggregationName, sModelName)) {
				//TODO fix with stashed type support
				aBindingPaths = BindingsExtractor.collectBindingPaths(oInvisibleElement, oModel).bindingPaths;
			} else if (BindingsExtractor.getBindings(oInvisibleElement, oModel).length > 0) {
				bIncludeElement = false;
			}

			if (bIncludeElement) {
				oInvisibleElement.__duplicateName = _checkForDuplicateLabels(oInvisibleElement, aProperties);

				bIncludeElement = _checkAndEnhanceByModelProperty(
					oInvisibleElement,
					aProperties,
					aBindingPaths);
			}
		}
		return bIncludeElement;
	}

	function _enhanceByCustomItems(oInvisibleElement, mActions, bIncludeElement, oElement) {
		var mCustom = mActions.addViaCustom;
		if (mCustom && bIncludeElement) {
			mCustom.items.forEach(function(oCustomItem) {
				_assignCustomItemIds(oElement.getParent().getId(), oCustomItem);
				if (oCustomItem.itemId === oInvisibleElement.getId()) {
					_enhanceInvisibleElement(oInvisibleElement, oCustomItem);
				}
			});
		}
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
			var mAddViaDelegate = mActions.addViaDelegate;

			var oDefaultAggregation = oElement.getMetadata().getAggregation();
			var sAggregationName = oDefaultAggregation ? oDefaultAggregation.name : mActions.aggregation;

			return Promise.all([
				_getAllPropertiesFromModels(oElement, sAggregationName, mActions),
				_getRepresentedBindingPathsFromDelegateIfAvailable(mAddViaDelegate, sAggregationName)
			])
				.then(function(args) {
					var aProperties = args[0];
					var aRepresentedProperties = args[1];
					var aAllElementData = [];
					var aInvisibleElements = mRevealData.elements || [];

					aInvisibleElements.forEach(function(mInvisibleElement) {
						var oInvisibleElement = mInvisibleElement.element;
						var mRevealAction = mInvisibleElement.action;

						oInvisibleElement.__label = ElementUtil.getLabelForElement(oInvisibleElement, mRevealAction.getLabel);

						var bIncludeElement = _enhanceByMetadata(oElement, sAggregationName, oInvisibleElement, mActions, aRepresentedProperties, aProperties);

						_enhanceByCustomItems(oInvisibleElement, mActions, bIncludeElement, oElement);

						if (bIncludeElement) {
							aAllElementData.push({
								element : oInvisibleElement,
								action : mRevealAction
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
		 * Retrieves available properties from the delegate
		 *
		 * @param {sap.ui.core.Element} oElement - Source element for which delegate we're looking for additional properties
		 * @param {object} mAction - Action descriptor for add via delegate action
		 *
		 * @return {Promise} - returns a Promise which resolves with a list of available to display delegate properties
		 */
		getUnrepresentedDelegateProperties: function (oElement, mAction) {
			var sModelName = _getModelName(mAction);
			var oDefaultAggregation = oElement.getMetadata().getAggregation();
			var sAggregationName = oDefaultAggregation ? oDefaultAggregation.name : mAction.action.aggregation;
			return Promise.all([
				_getAllPropertiesFromDelegate(oElement, sAggregationName, mAction),
				_getRepresentedBindingPaths(oElement, mAction, sModelName, sAggregationName)
			])
				.then(function(args) {
					var aAllProperties = args[0];
					var aRepresentedBindingPaths = args[1];

					var fnFilter = mAction.action.filter ? mAction.action.filter : function() {return true;};

					var aUnrepresentedProperties = _filterUnsupportedProperties(aAllProperties);
					aUnrepresentedProperties = aUnrepresentedProperties.filter(function(oModelProperty) {
						var bIsRepresented = false;
						if (aRepresentedBindingPaths) {
							bIsRepresented = aRepresentedBindingPaths.some(function(sBindingPath) {
								return sBindingPath === oModelProperty.bindingPath;
							});
						}
						return !bIsRepresented && fnFilter(mAction.relevantContainer, oModelProperty);
					});

					aUnrepresentedProperties = _checkForDuplicateProperties(aUnrepresentedProperties);

					return aUnrepresentedProperties;
				}).then(function(aUnrepresentedProperties) {
					return aUnrepresentedProperties.map(_oPropertyToAdditionalElementInfo);
				});
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
