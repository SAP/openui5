/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/ElementUtil",
	"sap/base/util/isPlainObject",
	"sap/ui/thirdparty/jquery"
],
function(
	ElementUtil,
	isPlainObject,
	jQuery
) {
	"use strict";

	/**
	 * Get all relevant binding paths and binding context paths for the element (from all properties)
	 *
	 * @param {sap.ui.core.Control} oElement - Starting point of the search
	 * @param {sap.ui.model.Model} oModel - Model for filtering irrelevant binding paths
	 * @returns {{bindingPaths: Array, bindingContextPaths: Array}}} - returns with all relevant bindingPaths and all bindingContextPaths for all properties of the element
	 *
	 * @private
	 */
	function collectBindingPaths(oElement, oModel) {
		var mBindingsCollection = {
			bindingPaths: [],
			bindingContextPaths: []
		};
		var sAggregationName = oElement.sParentAggregationName;
		var oParent = oElement.getParent();
		var aBindings = getBindings(oElement, oModel);

		if (oParent) {
			var oDefaultAggregation = oParent.getMetadata().getAggregation();

			if (oDefaultAggregation) {
				var iPositionOfInvisibleElement = ElementUtil.getAggregation(oParent, sAggregationName).indexOf(oElement);
				var sParentDefaultAggregationName = oDefaultAggregation.name;
				var oBinding = oParent.getBindingInfo(sParentDefaultAggregationName);
				var oTemplate = oBinding && oBinding.template;

				if (oTemplate) {
					var oTemplateDefaultAggregation = oTemplate.getMetadata().getAggregation();

					if (oTemplateDefaultAggregation) {
						var sTemplateDefaultAggregationName = oTemplateDefaultAggregation.name;
						var oTemplateElement = ElementUtil.getAggregation(oTemplate, sTemplateDefaultAggregationName)[iPositionOfInvisibleElement];
						aBindings = aBindings.concat(getBindings(oTemplateElement, null, true));
					}
				}
			}
		}

		for (var i = 0, l = aBindings.length; i < l; i++) {
			if (aBindings[i].getPath) {
				var sBindingPath = aBindings[i].getPath();
				if (sBindingPath &&	mBindingsCollection.bindingPaths.indexOf(sBindingPath) === -1) {
					mBindingsCollection.bindingPaths.push(sBindingPath);
				}
			}
			if (aBindings[i].getContext && aBindings[i].getContext() && aBindings[i].getContext().getPath) {
				var sBindingContextPath = aBindings[i].getContext().getPath();
				if (sBindingContextPath && mBindingsCollection.bindingContextPaths.indexOf(sBindingContextPath) === -1) {
					mBindingsCollection.bindingContextPaths.push(sBindingContextPath);
				}
			}
			if (isPlainObject(aBindings[i])) {
				if (mBindingsCollection.bindingPaths.indexOf(aBindings[i].parts[0].path) === -1) {
					mBindingsCollection.bindingPaths.push(aBindings[i].parts[0].path);
				}
			}
		}
		return mBindingsCollection;
	}

	/**
	 * Gets bindings for the whole hierarchy of children for a specified Element
	 * and filters out bindings which are not relevant (based on the parent model)
	 *
	 * @param {sap.ui.core.Control} oElement - Starting point of the search
	 * @param {sap.ui.model.Model} oParentDefaultModel - Model for filtering irrelevant binding paths
	 * @param {boolean} [bTemplate] - Whether we should consider provided element as a template
	 * @param {string} [sAggregationName] - if aggregation name is given then only for this aggregation bindings are returned, if not then all aggregations are considered
	 * @returns {Array} - returns array with all relevant bindings for all properties of the element
	 *
	 * @private
	 */
	function getBindings(oElement, oParentDefaultModel, bTemplate, sAggregationName) {
		var aBindings = (
			bTemplate
			? getBindingsFromTemplateProperties(oElement)
			: getBindingsFromProperties(oElement, oParentDefaultModel)
		);
		var aAggregationNames = sAggregationName ? [sAggregationName] : Object.keys(oElement.getMetadata().getAllAggregations());

		aAggregationNames.forEach(function (sAggregationNameInLoop) {
			aBindings = aBindings.concat(getBindingsForAggregation(oElement, oParentDefaultModel, bTemplate, sAggregationNameInLoop));
		});

		return aBindings;
	}

	function getBindingsForAggregation(oElement, oParentDefaultModel, bTemplate, sAggregationName) {
		var aBindings = [];
		// Getting children of the current aggregation and iterating through all of them
		var oBinding = oElement.getBindingInfo(sAggregationName);
		var oTemplate = oBinding && oBinding.template;
		var aElements = oTemplate ? [oTemplate] : ElementUtil.getAggregation(oElement, sAggregationName);

		aElements.forEach(function (oChildElement) {
			if (oChildElement.getMetadata) {
				// Fetching bindings from Element and all children of Element
				aBindings = aBindings.concat(
					oTemplate || bTemplate
					? getBindingsFromTemplateProperties(oChildElement)
					: getBindingsFromProperties(oChildElement, oParentDefaultModel),
					getBindings(oChildElement, oParentDefaultModel, oTemplate || bTemplate)
				);
			}
		});

		return aBindings;
	}

	/**
	 * Fetches all bindings for a specified binding model
	 *
	 * @param {sap.ui.model.PropertyBinding} oBinding - Binding model to get paths from
	 * @param {sap.ui.model.odata.XX.ODataModel} oParentDefaultModel - Data model (XX = '', v2, v4...)
	 *
	 * @returns {Array} - Returns a flattened array of found bindings
	 *
	 * @private
	 */
	function flattenBindings(oBinding, oParentDefaultModel) {
		var aBindings = [];
		var sModelName = oBinding.getMetadata().getName();

		if (sModelName === "sap.ui.model.CompositeBinding") {
			oBinding.getBindings().forEach(function (oBinding) {
				aBindings = aBindings.concat(flattenBindings(oBinding, oParentDefaultModel));
			});
		} else if (
			(
				sModelName === "sap.ui.model.odata.ODataPropertyBinding"
				|| sModelName === "sap.ui.model.odata.v2.ODataPropertyBinding"
				|| sModelName === "sap.ui.model.odata.v4.ODataPropertyBinding"
				|| sModelName === "sap.ui.model.json.JSONPropertyBinding"
				|| sModelName === "sap.ui.model.json.XMLPropertyBinding"
				|| sModelName === "sap.ui.model.resource.ResourcePropertyBinding"
			)
			&& oBinding.getModel() === oParentDefaultModel
			&& oBinding.isRelative()
			&& jQuery.isFunction(oBinding.getPath)
			&& oBinding.getPath()
		) {
			aBindings.push(oBinding);
		}

		return aBindings;
	}

	/**
	 * Fetches all bindings from template
	 *
	 * @param {object} mBinding - map of bindings from Control (mBindingsInfo)
	 * @returns {Array} - Returns a flattened array of found bindings
	 * @private
	 */
	function flattenBindingsFromTemplate(mBinding) {
		var aBindings = [];
		var aParts = mBinding.parts;

		// TODO: check if we need to filter bindings by modelName, relative indicator ("/")
		aParts.forEach(function (mPart) {
			aBindings.push({
				parts: [mPart]
			});
		});

		return aBindings;
	}

	/**
	 * Retrieving all bindings from all available properties for a specified element
	 *
	 * @param {sap.ui.core.Control} oElement - element to get bindings from
	 * @param {sap.ui.model.Model} oParentDefaultModel - parent model to filter irrelevant bindings
	 *
	 * @return {Array} - returns found bindings
	 *
	 * @private
	 */
	function getBindingsFromProperties(oElement, oParentDefaultModel) {
		var aPropertiesKeys = Object.keys(oElement.getMetadata().getAllProperties());

		return aPropertiesKeys
			// filter properties which are not bound
			.filter(oElement.getBinding.bind(oElement))
			.reduce(function (aBindings, sPropertyName) {
				return aBindings.concat(
					flattenBindings(
						oElement.getBinding(sPropertyName),
						oParentDefaultModel
					)
				);
			}, []);
	}

	/**
	 * Retrieving all bindings from all available properties for a specified element of template
	 *
	 * @param {sap.ui.core.Control} oElement - element to get bindings from
	 * @return {Array} - returns found bindings
	 * @private
	 */
	function getBindingsFromTemplateProperties(oElement) {
		var aPropertiesKeys = Object.keys(oElement.getMetadata().getAllProperties());

		return aPropertiesKeys
			.filter(function (sPropertyName) {
				return sPropertyName in oElement.mBindingInfos;
			})
			.reduce(function (aBindings, sPropertyName) {
				return aBindings.concat(
					flattenBindingsFromTemplate(
						oElement.mBindingInfos[sPropertyName]
					)
				);
			}, []);
	}

	/**
	 * Retrieving context binding path from element
	 *
	 * @param {sap.ui.core.Control} oElement - element to get context binding paths from
	 * @return {boolean|string} - Returns the binding context path string from element. If not available <code>false</code> is returned.
	 * @private
	 */
	function getBindingContextPath(oElement) {
		if (oElement.getBindingContext() && oElement.getBindingContext().getPath) {
			return oElement.getBindingContext().getPath();
		}
		return undefined;
	}

	return {
		getBindings: getBindings,
		collectBindingPaths: collectBindingPaths,
		flattenBindings: flattenBindings,
		getBindingsFromProperties: getBindingsFromProperties,
		getBindingContextPath: getBindingContextPath
	};
}, true);