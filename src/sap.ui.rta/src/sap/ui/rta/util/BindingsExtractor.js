/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/dt/ElementUtil',
	'sap/ui/rta/Utils'
],
function(
	ElementUtil,
	RtaUtils
) {
	"use strict";

	/**
	 * Gets bindings for the whole hierarchy of children for a specified Element
	 * and filters out bindings which are not relevant (based on the parent model)
	 *
	 * @param {sap.ui.core.Control} oElement - Starting point of the search
	 * @param {sap.ui.model.Model} oParentDefaultModel - Model for filtering irrelevant binding paths
	 * @param {boolean} bTemplate - Whether we should consider provided element as a template
	 *
	 * @returns {Array} - returns array with all relevant bindings for all properties of the element
	 *
	 * @private
	 */
	function getBindings(oElement, oParentDefaultModel, bTemplate) {
		var aBindings = (
			bTemplate
			? getBindingsFromTemplateProperties(oElement)
			: getBindingsFromProperties(oElement, oParentDefaultModel)
		);

		// Iterate through all aggregations
		for (var sAggregationName in oElement.getMetadata().getAllAggregations()) {
			// Getting children of the current aggregation and iterating through all of them
			var oBinding = oElement.getBindingInfo(sAggregationName);
			var oTemplate = oBinding && oBinding.template;
			var aElements = oTemplate ? [oTemplate] : ElementUtil.getAggregation(oElement, sAggregationName);

			aElements.forEach(function (oChildElement) { // eslint-disable-line no-loop-func
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
		}

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

	return {
		getBindings: getBindings,
		flattenBindings: flattenBindings,
		getBindingsFromProperties: getBindingsFromProperties
	};
}, true);
