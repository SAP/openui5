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
	 *
	 * @returns {Array} - returns array with all relevant bindings for all properties of the element
	 *
	 * @private
	 */
	function getBindings(oElement, oParentDefaultModel) {
		var aBindings = [];

		// Iterate through all aggregations
		for (var sAggregationName in oElement.getMetadata().getAllAggregations()) {
			// Getting children of the current aggregation and iterating through all of them
			ElementUtil.getAggregation(oElement, sAggregationName).forEach(function (oChildElement) { // eslint-disable-line no-loop-func
				if (oChildElement.getMetadata) {
					// Fetching bindings from Element and all children of Element
					aBindings = aBindings.concat(
					    getBindingsFromProperties(oChildElement, oParentDefaultModel),
					    getBindings(oChildElement, oParentDefaultModel)
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
	 * @param {sap.ui.model.odata.ODataModel|sap.ui.model.odata.v2.ODataModel} oParentDefaultModel - Data model
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
	 * Retrieving all bindings from all available properties for a specified element
	 *
	 * @param {sap.ui.core.Control} oChildElement - element to get bindings from
	 * @param {sap.ui.model.Model} oParentDefaultModel - parent model to filter irrelevant bindings
	 *
	 * @return {Array} - returns found bindings
	 *
	 * @private
	 */
	function getBindingsFromProperties(oChildElement, oParentDefaultModel) {
		var aPropertiesKeys = Object.keys(oChildElement.getMetadata().getAllProperties());

		return aPropertiesKeys
		// filter properties which are not bound
			.filter(oChildElement.isBound.bind(oChildElement))
			.reduce(function (aBindings, sPropertyName) {
				return aBindings.concat(
					flattenBindings(
						oChildElement.getBinding(sPropertyName),
						oParentDefaultModel
					)
				);
			}, []);
	}

	return {
		getBindings: getBindings,
		flattenBindings : flattenBindings,
		getBindingsFromProperties: getBindingsFromProperties
	};
}, true);
