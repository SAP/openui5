/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/ElementUtil",
	"sap/base/util/merge"
], function(
	OverlayRegistry,
	DtUtil,
	Overlay,
	ElementUtil,
	merge
) {
	"use strict";

	/**
	 * Provides necessary functionality to retrieve design time metadata properties.
	 * Takes into consideration control metadata properties, design time metadata properties, annotations, label and name.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.Property
	 * @author SAP SE
	 * @experimental Since 1.58
	 * @since 1.58
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	*/

	/**
	 * Object containing the detailed information about design time properties of the passed control.
	 *
	 * @typedef {object} sap.ui.rta.service.Property.PropertyObject
	 * @since 1.58
	 * @private
	 * @ui5-restricted
	 * @property {object} name - name object from dt-metadata
	 * @property {object} properties - properties object from dt-metadata and control metadata
	 * @property {object} annotations - annotations object from dt-metadata
	 * @property {string} [label] - label from getLabel property of dt-metadata
	 * @property {object} [links] - links from dt-metadata
	 */

	return function(oRta) {

		var oProperty = { };

		/**
		 * Returns properties, annotations, label and name
		 * from the passed control id's design time metadata and control metadata.
		 *
		 * @param {string} sControlId - id of the control
		 *
		 * @return {object} an object containing properties, annotations, label and name
		 * @private
		 */
		oProperty._getDesignTimeProperties = function (sControlId) {
			var oOverlay = OverlayRegistry.getOverlay(sControlId);
			// if overlay could not be found
			if (!oOverlay) {
				return DtUtil.createError("service.Property#get", "A valid control id was not passed", "sap.ui.rta");
			}
			var oElement = oOverlay.getElement();

			var mMetadataProperties = oElement.getMetadata().getAllProperties();

			var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
			// require deep cloning so that original dt-metadata is not modified
			var oDesignTimeMetadataData = merge({}, oDesignTimeMetadata.getData());
			var mDtProperties = oDesignTimeMetadataData.properties || {};
			var mDtAnnotations = oDesignTimeMetadataData.annotations || {};
			var vLabel = oDesignTimeMetadataData.getLabel;

			return Promise.all(
				[
					oProperty._getConsolidatedAnnotations(mDtAnnotations, oElement),
					oProperty._getConsolidatedProperties(mDtProperties || {}, mMetadataProperties, oElement),
					oProperty._getResolvedFunction(vLabel, oElement),
					oProperty._getResolvedLinks(oDesignTimeMetadataData.links, oElement)
				]
			)
				.then(function (aPromiseResults) {
					return Object.assign(
						{},
						aPromiseResults[0] && !jQuery.isEmptyObject(aPromiseResults[0]) && {annotations: aPromiseResults[0]},
						aPromiseResults[1] && {properties: aPromiseResults[1]},
						aPromiseResults[2] && {label: aPromiseResults[2]},
						oDesignTimeMetadataData.name && {name: oDesignTimeMetadata.getName(oElement)},
						!jQuery.isEmptyObject(aPromiseResults[3]) && {links: aPromiseResults[3]}
					);
				});
		};

		/**
		 * Calculates and returns properties
		 * from the passed dt-metadata and control metadata objects.
		 *
		 * @param {object} mDtObj - dt-metadata properties object
		 * @param {object} mMetadataObj - control metadata properties object
		 * @param {sap.ui.core.Element} oElement - element for which properties need to be calculated
		 *
		 * @return {object} promise resolving to an object containing all properties consolidated
		 * @private
		 */
		oProperty._getConsolidatedProperties = function (mDtObj, mMetadataObj, oElement) {
			var mFilteredMetadataObject = Object.keys(mMetadataObj)
				.reduce(function (mFiltered, sKey) {
					mFiltered[sKey] = {
						value: oElement.getProperty(sKey),
						virtual: false,
						type: mMetadataObj[sKey].type,
						name: mMetadataObj[sKey].name,
						ignore: false,
						group: mMetadataObj[sKey].group,
						deprecated: mMetadataObj[sKey].deprecated,
						defaultValue: mMetadataObj[sKey].defaultValue,
						visibility: mMetadataObj[sKey].visibility
					};
					var mBindingInfo = oProperty._getBindingInfo(sKey, oElement);
					Object.assign(
						mFiltered[sKey],
						mBindingInfo && {binding: mBindingInfo}
					);
					return mFiltered;
				}, {});

			return Promise.all(
				Object.keys(mDtObj)
					.map(function (sKey) {
						return oProperty._getResolvedFunction(mDtObj[sKey].ignore, oElement)
							.then(function (bIgnore) {

								if (typeof bIgnore !== "boolean" || typeof bIgnore === "undefined") {
									throw DtUtil.createError(
										"services.Property#get",
										"Invalid ignore property value found in designtime for element with id " + oElement.getId() + " .", "sap.ui.rta"
									);
								}

								// ensure ignore function is replaced by a boolean value
								if (bIgnore) {
									// check if ignore property is set to true - remove from metadata object, if present
									delete mFilteredMetadataObject[sKey];
								} else if (!mFilteredMetadataObject[sKey]) {
									//  if not available in control metadata
									if (mDtObj[sKey].virtual === true) {
										// virtual properties
										return oProperty._getEvaluatedVirtualProperty(mDtObj, sKey, oElement);
									} else {
										// dt-metadata properties
										var mEvaluatedProperty = {};
										mEvaluatedProperty[sKey] = {
											value: mDtObj[sKey],
											virtual: false,
											ignore: bIgnore
										};
										return mEvaluatedProperty;
									}
								}
								return {};
							});
					})
			)
				.then(function (aFilteredResults) {
					return aFilteredResults.reduce(function (mConsolidatedObject, oFilteredResult) {
						return Object.assign(mConsolidatedObject, oFilteredResult);
					}, mFilteredMetadataObject);
				});
		};

		/**
		 * Returns evaluated virtual property for direct consumption by the service
		 *
		 * @param {object} mDtObj - dt-metadata properties object
		 * @param {object} sPropertyName - virtual property name
		 * @param {sap.ui.core.Element} oElement - element for which the virtual property needs to be evaluated
		 *
		 * @return {Promise} promise resolving to the evaluated virtual property object
		 * @private
		 */
		oProperty._getEvaluatedVirtualProperty = function(mDtObj, sPropertyName, oElement) {
			var mEvaluatedProperty = {};
			// evaluate if virtual - not found in metadata object
			mEvaluatedProperty[sPropertyName] = {
				value: mDtObj[sPropertyName].get(oElement),
				virtual: true,
				type: mDtObj[sPropertyName].type,
				name: mDtObj[sPropertyName].name,
				group: mDtObj[sPropertyName].group,
				ignore: false
			};
			var mBindingInfo = oProperty._getBindingInfo(sPropertyName, oElement);

			// evaluate possibleValues
			return oProperty._getResolvedFunction(mDtObj[sPropertyName].possibleValues, oElement)
				.then(function(vPossibleValues) {

					Object.assign(
						mEvaluatedProperty[sPropertyName],
						mBindingInfo && {binding: mBindingInfo},
						vPossibleValues && {possibleValues: vPossibleValues},
						typeof mDtObj[sPropertyName].nullable === "boolean" && {nullable: mDtObj[sPropertyName].nullable} // nullable property
					);

					return mEvaluatedProperty;
				});
		};

		/**
		 * Calculates and returns annotations
		 * from the passed dt-metadata annotations object.
		 *
		 * @param {object} mDtObj - dt-metadata annotations object
		 * @param {sap.ui.core.Element} oElement - element for which properties need to be calculated
		 *
		 * @return {Promise} promise resolving to an object containing all annotations consolidated
		 * @private
		 */
		oProperty._getConsolidatedAnnotations = function (mDtObj, oElement) {
			return Promise.all(
				Object.keys(mDtObj)
					.map(function (sKey) {
						return oProperty._getResolvedFunction(mDtObj[sKey].ignore, oElement)
							.then(function (bIgnore) {
								var mFiltered = {};
								if (typeof bIgnore !== "boolean" && typeof bIgnore !== "undefined") {
									throw DtUtil.createError(
										"services.Property#get",
										"Invalid ignore property value found in designtime for element with id " + oElement.getId() + " .", "sap.ui.rta"
									);
							}
							// to ensure ignore function is replaced by a boolean value
							mDtObj[sKey].ignore = bIgnore;
							if (!bIgnore) {
								mFiltered[sKey] = Object.assign({}, mDtObj[sKey]);
								return oProperty._getResolvedLinks(mFiltered[sKey].links, oElement)
									.then(function (mLinks) {
										if (!jQuery.isEmptyObject(mLinks)) {
											mFiltered[sKey].links = mLinks;
										}
										return mFiltered;
									});
							}
						});
					})
			)
				.then(function (aFilteredResults) {
					return aFilteredResults.reduce(function (mConsolidatedObject, oFilteredResult) {
						return Object.assign(mConsolidatedObject, oFilteredResult);
					}, {});
				});
		};

		/**
		 * Resolves the 'links' object containing the format:
		 *    links: {
		 *       "link1": [{
		 *          href: "href-to-link1",
		 *          text: function () {
		 *             return "text to link 1";
		 *          }
		 *       }],
		 *       "link2" : [{
		 *          href: "href-to-link2",
		 *          text: "text to link 2"
		 *       }]
		 *    }
		 *
		 * @param {map} mLinks - links map
		 * @param {sap.ui.core.Element} oElement - element for which 'links' object is required to be resolved
		 *
		 * @return {Promise} promise resolving to links map
		 * @private
		 */
		oProperty._getResolvedLinks = function (mLinks, oElement){
			var aTextPromises = [];
			var mResolvedLinks = Object.assign({}, mLinks);

			Object.keys(mResolvedLinks).forEach(function (sLinkName) {
				if (Array.isArray(mResolvedLinks[sLinkName])) {
					mResolvedLinks[sLinkName].forEach(function (oLink) {

						aTextPromises.push(
							DtUtil.wrapIntoPromise(function () {
								if (typeof oLink.text === "function") {
									return oLink.text(oElement);
								}
							})(oLink)
								.then(function (sLinkText) {
									oLink.text = sLinkText ? sLinkText : oLink.text;
								})
						);

					});
				}
			});
			return Promise.all(aTextPromises)
				.then(function () {
					return mResolvedLinks;
				});
		};

		/**
		 * Gets binding information for the passed property and element.
		 *
		 * @param {string} sKey - property name
		 * @param {sap.ui.core.Element} oElement - element for which binding information is required
		 *
		 * @return {object} object containing the binding information
		 * @private
		 */
		oProperty._getBindingInfo = function (sKey, oElement) {
			var mPropertyBindingInfo = oElement.getBindingInfo(sKey);
			if (!mPropertyBindingInfo) {
				return;
			}

			return merge(
				{},
				// adding parts
				mPropertyBindingInfo.parts
				&& {
					parts: mPropertyBindingInfo.parts
				},
				// adding value
				mPropertyBindingInfo.binding
				&& {
					bindingValues: {
						values: mPropertyBindingInfo.binding.getValue()
					}
				},
				// adding original value
				mPropertyBindingInfo.binding
				&& mPropertyBindingInfo.binding.getOriginalValue
				&& {
					bindingValues: {
						originalValues: mPropertyBindingInfo.binding.getOriginalValue()
					}
				},
				// adding bindingString
				mPropertyBindingInfo.bindingString
				&& {
					bindingString: mPropertyBindingInfo.bindingString
				}
			);
		};

		/**
		 * Wraps the passed first argument in a promise and resolves it.
		 *
		 * @param {any}  vProperty - property which needs to be resolved (e.g. function, string)
		 * @param {sap.ui.core.Element} oElement - element for which property needs to be resolved
		 *
		 * @return {Promise} promise resolving to the property value
		 * @private
		 */
		oProperty._getResolvedFunction = function (vProperty, oElement) {
			return DtUtil.wrapIntoPromise(function () {
				return typeof vProperty === "function"
					? vProperty(oElement) // could return a promise
					: (vProperty || false);
			})(vProperty, oElement);
		};

		return {
			exports: {
				/**
				 * Returns an object containing design time properties for the passed control's id.
				 * Throws an error if the control id parameter is not a valid control with a stable id.
				 *
				 * Example:
				 *
				 * <pre>
				 *     {
				 *        "properties": {
				 *           "dtMetadataProperty2": {
				 *              "value": {
				 *                 "mockKey2": "dtMetadataProperty2"
				 *              },
				 *              "virtual": false,
				 *              "ignore": false
				 *              },
				 *           "virtualProperty1": {
				 *              "value": "Virtual property value 1",
				 *              "virtual": true,
				 *              "type": "Virtual property type",
				 *              "name": "Virtual Property Name 1",
				 *              "ignore": false,
				 *              "possibleValues": [
				 *                 "possibleValue1",
				 *                 "possibleValue2"
				 *              ]
				 *           },
				 *           "metadataProperty1": {
				 *              "value": "metadataPropertyValue1",
				 *              "virtual": false,
				 *              "type": "metadataPropertyType1",
				 *              "name": "metadataPropertyName1",
				 *              "ignore": false,
				 *              "binding": {
				 *                 "parts": [
				 *                 {
				 *                    "path": "path1",
				 *                    "model": "model1"
				 *                 },
				 *                 {
				 *                    "path": "path2",
				 *                    "model": "model2"
				 *                 }
				 *                 ],
				 *                 "bindingValues": {
				 *                    "values": "Binding Value",
				 *                    "originalValues": "Original Binding Value"
				 *                 },
				 *                 "bindingString": "bindingString"
				 *              }
				 *           }
				 *        },
				 *        "annotations": {
				 *           "annotation1": {
				 *              "namespace": "com.sap.mock.vocabularies",
				 *              "annotation": "annotation1",
				 *              "whiteList": {
				 *                 "properties": [
				 *                    "Property1",
				 *                    "Property2",
				 *                    "Property3"
				 *                 ]
				 *              },
				 *              "ignore": false,
				 *              "appliesTo": [
				 *                 "Page/Button"
				 *              ],
				 *              "links": {
				 *                 "developer": [
				 *                 {
				 *                    "href": "annotation1.html",
				 *                    "text": "Annotation 1 Text 1"
				 *                 },
				 *                 {
				 *                    "href": "annotation2.html",
				 *                    "text": "Annotation 1 Text 2"
				 *                 }
				 *                 ]
				 *              }
				 *           }
				 *        },
				 *        "name": {
				 *           "singular": "Singular Control Name",
				 *           "plural": "Plural Control Name"
				 *        },
				 *        "label": "dt-metadata label",
				 *        "links": {
				 *                 "developer": [
				 *                 {
				 *                    "href": "Links.html",
				 *                    "text": "Links Text 1"
				 *                 }
				 *                 ]
				 *         }
				 *     }
				 * </pre>
				 * @name sap.ui.rta.service.Property.get
				 * @param {string} sControlId - the id of the control to start with.
				 * @returns {sap.ui.rta.service.Property.PropertyObject} an object containing relevant property data for the passed control
				 * @function
				 * @public
				 */
				get: oProperty._getDesignTimeProperties.bind(oProperty)
			}
		};
	};
});