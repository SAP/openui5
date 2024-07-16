/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/base/util/isPlainObject",
	"sap/base/util/restricted/_uniqWith",
	"sap/base/util/deepEqual"
], function(
	ElementUtil,
	OverlayRegistry,
	isPlainObject,
	_uniqWith,
	deepEqual
) {
	"use strict";

	var BindingsExtractor = {};

	/**
	 * Get all relevant binding paths and binding context paths for the element (from all properties)
	 *
	 * @param {sap.ui.core.Control} oElement - Starting point of the search
	 * @param {sap.ui.model.Model} oModel - Model for filtering irrelevant binding paths
	 * @param {sap.ui.core.Control} [oRelevantContainerElement] - if this element is given then only bindings from element related to the relevant container are considered
	 * @param {number} iDepth - If provided only bindings from children up to the given depth are considered
	 * @returns {{bindingPaths: Array, bindingContextPaths: Array}} - returns with all relevant bindingPaths and all bindingContextPaths for all properties of the element
	 *
	 * @private
	 */
	BindingsExtractor.collectBindingPaths = function(oElement, oModel, oRelevantContainerElement, iDepth) {
		var mBindingsCollection = {
			bindingPaths: [],
			bindingContextPaths: []
		};
		var sAggregationName = oElement.sParentAggregationName;
		var oParent = oElement.getParent();
		var aBindings = BindingsExtractor.getBindings({
			element: oElement,
			model: oModel,
			relevantContainerElement: oRelevantContainerElement,
			parent: oParent,
			depth: iDepth
		});

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
						var oTemplateElement = ElementUtil.getAggregation(
							oTemplate, sTemplateDefaultAggregationName
						)[iPositionOfInvisibleElement];
						aBindings = aBindings.concat(BindingsExtractor.getBindings({
							model: oModel,
							element: oTemplateElement,
							template: true,
							relevantContainerElement: oRelevantContainerElement,
							parent: oParent,
							depth: iDepth
						}));
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
				var sCurrentPath = aBindings[i].parts[0] && aBindings[i].parts[0].path;
				// Sometimes the binding does not contain a path
				if (sCurrentPath && mBindingsCollection.bindingPaths.indexOf(sCurrentPath) === -1) {
					mBindingsCollection.bindingPaths.push(sCurrentPath);
				}
			}
		}
		return mBindingsCollection;
	};

	function isElementRelatedToRelevantContainer(oElement, oRelevantContainerElement) {
		if (oRelevantContainerElement && oElement !== oRelevantContainerElement) {
			var oOverlay = OverlayRegistry.getOverlay(oElement);
			var oRelevantContainer = oOverlay && (oOverlay.getRelevantContainer() || oOverlay.getElement());
			return oRelevantContainer ? oRelevantContainer.getId() === oRelevantContainerElement.getId() : true;
		}
		return true;
	}

	/**
	 * Gets bindings for the whole hierarchy of children for a specified Element
	 * and filters out bindings which are not relevant (based on the given model)
	 *
	 * @param {object} mPropertyBag - PropertyBag
	 * @param {sap.ui.core.Control} mPropertyBag.element - Starting point of the search
	 * @param {sap.ui.model.Model} [mPropertyBag.model] - Model for filtering irrelevant binding paths
	 * @param {boolean} [mPropertyBag.template] - Whether we should consider provided element as a template or part of a template
	 * @param {string} [mPropertyBag.aggregationName] - if aggregation name is given then only for this aggregation bindings are returned, if not then all aggregations are considered
	 * @param {sap.ui.core.Control} [mPropertyBag.relevantContainerElement] - if this element is given then only bindings from element related to the relevant container are considered
	 * @param {sap.ui.core.Control} [mPropertyBag.parent] - parent of the element being evaluated; if the element is a template, the parent is the control hosting the template
	 * @returns {Array} - returns array with all relevant bindings for all properties of the element
	 *
	 * @private
	 */
	BindingsExtractor.getBindings = function(mPropertyBag) {
		var oElement = mPropertyBag.element;
		var oModel = mPropertyBag.model;
		var oParent = mPropertyBag.parent;
		var sAggregationName = mPropertyBag.aggregationName;
		var oRelevantContainerElement = mPropertyBag.relevantContainerElement;
		var aBindings = [];
		if (isElementRelatedToRelevantContainer(oElement, oRelevantContainerElement)) {
			aBindings = (
				mPropertyBag.template
					? getBindingsFromTemplateProperties(oElement, oParent, oModel)
					: BindingsExtractor.getBindingsFromProperties(oElement, oModel)
			);
		}
		var aAggregationNames = sAggregationName ? [sAggregationName] : Object.keys(oElement.getMetadata().getAllAggregations());

		if (!Number.isInteger(mPropertyBag.depth) || mPropertyBag.depth > 0) {
			aAggregationNames.forEach(function(sAggregationNameInLoop) {
				aBindings = aBindings.concat(getBindingsForAggregation(
					oElement,
					oModel,
					mPropertyBag.template,
					sAggregationNameInLoop,
					oRelevantContainerElement,
					mPropertyBag.depth && mPropertyBag.depth - 1
				));
			});
		}

		// Remove duplicates
		return _uniqWith(aBindings, deepEqual);
	};

	function getBindingsForAggregation(oElement, oModel, bTemplate, sAggregationName, oRelevantContainerElement, iDepth) {
		var aBindings = [];
		var aElements = [];
		var oTemplate;
		var bIsInTemplate = bTemplate;
		var oElementModel = oElement.getModel();

		var oBinding = oElement.getBindingInfo(sAggregationName);
		oTemplate = oBinding && oBinding.template;

		// If a template is found for a different model, we don't look inside the template
		// e.g. a Select control whose entries are defined in an own JSON model
		if (oTemplate && oElementModel && oElementModel !== oModel) {
			return [];
		}

		// If a template is bound to the current element on the given model,
		// we continue the evaluation on the template (as it has no direct parent)
		if (oTemplate) {
			bIsInTemplate = true;
			aElements = [oTemplate];
		} else {
			aElements = ElementUtil.getAggregation(oElement, sAggregationName);
		}

		// Getting children of the current aggregation and iterating through all of them
		aElements.forEach(function(oChildElement) {
			if (oChildElement.getMetadata) {
				if (isElementRelatedToRelevantContainer(oElement, oRelevantContainerElement)) {
					// Fetching bindings from Element and all children of Element
					aBindings = aBindings.concat(bIsInTemplate
						? getBindingsFromTemplateProperties(oChildElement, oElement, oModel)
						: BindingsExtractor.getBindingsFromProperties(oChildElement, oModel));
				}
				aBindings = aBindings.concat(
					BindingsExtractor.getBindings({
						element: oChildElement,
						model: oModel,
						template: bIsInTemplate,
						relevantContainerElement: oRelevantContainerElement,
						parent: oElement,
						depth: iDepth
					})
				);
			}
		});

		return aBindings;
	}

	/**
	 * Fetches all bindings for a specified binding model, filtering out the irrelevant ones
	 *
	 * @param {sap.ui.model.PropertyBinding} oBinding - Binding model to get paths from
	 * @param {sap.ui.model.odata.XX.ODataModel} oParentDefaultModel - Data model (XX = '', v2, v4...)
	 *
	 * @returns {Array} - Returns a flattened array of found bindings
	 *
	 * @private
	 */
	BindingsExtractor.filterAndFlattenBindings = function(oBinding, oParentDefaultModel) {
		var aBindings = [];
		var sModelName = oBinding.getMetadata().getName();

		if (sModelName === "sap.ui.model.CompositeBinding") {
			oBinding.getBindings().forEach(function(oBinding) {
				aBindings = aBindings.concat(BindingsExtractor.filterAndFlattenBindings(oBinding, oParentDefaultModel));
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
			&& typeof oBinding.getPath === "function"
			&& oBinding.getPath()
		) {
			aBindings.push(oBinding);
		}

		return aBindings;
	};

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
		aParts.forEach(function(mPart) {
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
	 * @param {sap.ui.model.Model} oModel - model to filter irrelevant bindings
	 *
	 * @return {Array} - returns found bindings
	 *
	 * @private
	 */
	BindingsExtractor.getBindingsFromProperties = function(oElement, oModel) {
		var aPropertiesKeys = Object.keys(oElement.getMetadata().getAllProperties());

		return aPropertiesKeys
		// filter properties which are not bound
		.filter(oElement.getBinding.bind(oElement))
		.reduce(function(aBindings, sPropertyName) {
			return aBindings.concat(
				BindingsExtractor.filterAndFlattenBindings(
					oElement.getBinding(sPropertyName),
					oModel
				)
			);
		}, []);
	};

	/**
	 * Retrieving all bindings from all available properties for a template
	 *
	 * @param {sap.ui.core.Control} oTemplate - template being evaluated
	 * @param {sap.ui.core.Control} oTemplateParent - template "parent"; control to which it is bound
	 * @param {sap.ui.model.Modell} oModel - relevant model, usually the parent default model
	 *
	 * @return {Array} - returns found bindings
	 * @private
	 */
	function getBindingsFromTemplateProperties(oTemplate, oTemplateParent, oModel) {
		var aPropertiesKeys = Object.keys(oTemplate.getMetadata().getAllProperties());
		var bIsSameModel;

		return aPropertiesKeys
		.filter(function(sPropertyName) {
			var mBindingInfo = oTemplate.mBindingInfos[sPropertyName];
			var sModelName = mBindingInfo && mBindingInfo.parts[0] && mBindingInfo.parts[0].model;
			bIsSameModel = oModel === oTemplateParent.getModel(sModelName);
			if (!sModelName) {
				var oParentDefaultModel = oTemplateParent.getDefaultModel ? oTemplateParent.getDefaultModel() : null;
				var oTemplateDefaultModel = oTemplate.getDefaultModel ? oTemplate.getDefaultModel() : null;
				bIsSameModel = oParentDefaultModel === oTemplateDefaultModel;
			} else {
				bIsSameModel = oModel === oTemplateParent.getModel(sModelName);
			}
			return mBindingInfo && bIsSameModel;
		})
		.reduce(function(aBindings, sPropertyName) {
			return aBindings.concat(
				flattenBindingsFromTemplate(
					oTemplate.mBindingInfos[sPropertyName]
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
	BindingsExtractor.getBindingContextPath = function(oElement) {
		if (oElement.getBindingContext() && oElement.getBindingContext().getPath) {
			return oElement.getBindingContext().getPath();
		}
		return undefined;
	};

	return BindingsExtractor;
});