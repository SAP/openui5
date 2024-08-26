/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/restricted/_omit"
], function(
	OverlayRegistry,
	DtUtil,
	isEmptyObject,
	merge,
	_omit
) {
	"use strict";

	/**
	 * Provides necessary functionality to retrieve design time metadata properties.
	 * Takes into consideration control metadata properties, design time metadata properties, annotations, label and name.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.Property
	 * @author SAP SE
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
	 * @property {object} name - Name object from design time metadata
	 * @property {object} properties - Properties object from design time metadata and control metadata
	 * @property {object} annotations - Annotations object from design time metadata
	 * @property {string} [label] - Label from <code>getLabel</code> property of design time metadata
	 * @property {object} [links] - Links from design time metadata
	 */

	var _NOT_SERIALIZABLE = "[NOT SERIALIZABLE]";
	function isSerializable(vPrimitiveOrObject, vIndexOrKey, vParent) {
		// check for primitives: boolean, undefined, null, number, string, symbol
		if (Object(vPrimitiveOrObject) !== vPrimitiveOrObject) {
			return true;
		}
		if (typeof vPrimitiveOrObject === "function") { // function
			return false;
		}
		if (typeof vPrimitiveOrObject === "object") {
			if (Array.isArray(vPrimitiveOrObject)) { // array
				return vPrimitiveOrObject.every(isSerializable);
			} else if (vPrimitiveOrObject instanceof Map) { // map -> convert to object
				var oMapEquivalent = {};
				vPrimitiveOrObject.forEach(function(vValue, sKey) {
					oMapEquivalent[sKey] = vValue;
				});
				if (vParent) {
					vParent[vIndexOrKey] = oMapEquivalent;
				}
				vPrimitiveOrObject = oMapEquivalent;
			}
			return Object.keys(vPrimitiveOrObject).every(function(sKey) { // object
				return isSerializable(vPrimitiveOrObject[sKey], sKey, vPrimitiveOrObject);
			});
		}
		return false;
	}

	function validate(vPrimitiveOrObject) {
		return isSerializable(vPrimitiveOrObject) ? vPrimitiveOrObject : _NOT_SERIALIZABLE;
	}

	return function() {
		var oProperty = {};

		/**
		 * Returns properties, annotations, label and name
		 * from the passed control ID's design time metadata and control metadata.
		 *
		 * @param {string} sControlId - ID of the control
		 *
		 * @return {object} Object containing properties, annotations, label and name
		 * @private
		 */
		oProperty._getDesignTimeProperties = function(sControlId) {
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
			var vDtProperties = oDesignTimeMetadataData.properties || {};
			var mDtAnnotations = oDesignTimeMetadataData.annotations || {};
			var vLabel = oDesignTimeMetadataData.getLabel;

			return Promise.all(
				[
					oProperty._getConsolidatedAnnotations(mDtAnnotations, oElement),
					oProperty._getConsolidatedProperties(vDtProperties || {}, mMetadataProperties, oElement),
					oProperty._getResolvedFunction(vLabel, oElement),
					oProperty._getResolvedLinks(oDesignTimeMetadataData.links, oElement)
				]
			)
			.then(function(aPromiseResults) {
				return {
					...(aPromiseResults[0] && !isEmptyObject(aPromiseResults[0]) && {annotations: aPromiseResults[0]}),
					...(aPromiseResults[1] && {properties: aPromiseResults[1]}),
					...(aPromiseResults[2] && {label: validate(aPromiseResults[2])}),
					...(oDesignTimeMetadataData.name && {name: oDesignTimeMetadata.getName(oElement)}),
					...(!isEmptyObject(aPromiseResults[3]) && {links: aPromiseResults[3]})
				};
			});
		};

		/**
		 * Calculates and returns properties
		 * from the passed design time metadata and control metadata objects.
		 *
		 * @param {object|function} vDtProperties - Design time metadata properties
		 * @param {object} mMetadataObj - Control metadata properties object
		 * @param {sap.ui.core.Element} oElement - Element for which properties need to be calculated
		 *
		 * @return {object} Promise resolving to an object containing all properties consolidated
		 * @private
		 */
		oProperty._getConsolidatedProperties = function(vDtProperties, mMetadataObj, oElement) {
			var mFilteredMetadataObject = Object.keys(mMetadataObj)
			.reduce(function(mFiltered, sKey) {
				mFiltered[sKey] = {
					value: validate(oElement.getProperty(sKey)),
					virtual: false,
					type: mMetadataObj[sKey].type,
					name: mMetadataObj[sKey].name,
					ignore: false, // default value, might be overwritten below if required by designtime metadata
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

			return oProperty._getResolvedFunction(vDtProperties, oElement)
			.then(function(mDtObj) {
				return Promise.all(
					// for each property in the mDtObj.properties a promise is returned
					Object.keys(mDtObj)
					.map(function(sKey) {
						return oProperty._getResolvedFunction(mDtObj[sKey].ignore, oElement)
						.then(function(bIgnore) {
							if (typeof bIgnore !== "boolean") {
								throw DtUtil.createError(
									"services.Property#get",
									`Invalid ignore property value found in designtime for element with id ${oElement.getId()} .`, "sap.ui.rta"
								);
							}

							var mResult = {};

							// ensure ignore function is replaced by a boolean value
							if (!mFilteredMetadataObject[sKey]) {
								//  if not available in control metadata
								if (mDtObj[sKey].virtual === true) {
									// virtual properties
									mResult = oProperty._getEvaluatedVirtualProperty(mDtObj, sKey, oElement, bIgnore);
								} else {
									// dt-metadata properties
									mResult[sKey] = {
										value: validate(_omit(mDtObj[sKey], "ignore")),
										virtual: false,
										ignore: bIgnore
									};
								}
							} else {
								mResult[sKey] = {
									ignore: bIgnore
								};
							}

							return mResult;
						});
					})
				);
			})
			.then(function(aFilteredResults) {
				return aFilteredResults.reduce(function(mConsolidatedObject, oFilteredResult) {
					return merge(mConsolidatedObject, oFilteredResult);
				}, mFilteredMetadataObject);
			});
		};

		/**
		 * Returns evaluated virtual property for direct consumption by the service.
		 *
		 * @param {object} mDtObj - Design time metadata properties object
		 * @param {object} sPropertyName - Virtual property name
		 * @param {sap.ui.core.Element} oElement - Element for which the virtual property needs to be evaluated
		 * @param {boolean} bIgnore - Evaluated value of ignore property
		 *
		 * @return {Promise} Promise resolving to the evaluated virtual property object
		 * @private
		 */
		oProperty._getEvaluatedVirtualProperty = function(mDtObj, sPropertyName, oElement, bIgnore) {
			var mEvaluatedProperty = {};
			// evaluate if virtual - not found in metadata object
			mEvaluatedProperty[sPropertyName] = {
				value: validate(mDtObj[sPropertyName].get(oElement)),
				virtual: true,
				type: mDtObj[sPropertyName].type,
				name: mDtObj[sPropertyName].name,
				group: mDtObj[sPropertyName].group,
				ignore: bIgnore
			};
			var mBindingInfo = oProperty._getBindingInfo(sPropertyName, oElement);

			// evaluate possibleValues
			return oProperty._getResolvedFunction(mDtObj[sPropertyName].possibleValues, oElement)
			.then(function(vPossibleValues) {
				Object.assign(
					mEvaluatedProperty[sPropertyName],
					mBindingInfo && {binding: mBindingInfo},
					vPossibleValues && {possibleValues: validate(vPossibleValues)},
					typeof mDtObj[sPropertyName].nullable === "boolean" && {nullable: mDtObj[sPropertyName].nullable} // nullable property
				);

				return mEvaluatedProperty;
			});
		};

		/**
		 * Calculates and returns annotations
		 * from the passed design time metadata annotations object.
		 *
		 * @param {object} mDtObj - Design time metadata annotations object
		 * @param {sap.ui.core.Element} oElement - Element for which properties need to be calculated
		 *
		 * @return {Promise} Promise resolving to an object containing all annotations consolidated
		 * @private
		 */
		oProperty._getConsolidatedAnnotations = function(mDtObj, oElement) {
			return Promise.all(
				Object.keys(mDtObj)
				.map(function(sKey) {
					return oProperty._getResolvedFunction(mDtObj[sKey].ignore, oElement)
					.then(function(bIgnore) {
						var mFiltered = {};
						if (typeof bIgnore !== "boolean" && typeof bIgnore !== "undefined") {
							throw DtUtil.createError(
								"services.Property#get",
								`Invalid ignore property value found in designtime for element with id ${oElement.getId()} .`, "sap.ui.rta"
							);
						}
						// to ensure ignore function is replaced by a boolean value
						mDtObj[sKey].ignore = bIgnore;
						if (!bIgnore) {
							mFiltered[sKey] = { ...mDtObj[sKey] };
							return oProperty._getResolvedLinks(mFiltered[sKey].links, oElement)
							.then(function(mLinks) {
								if (!isEmptyObject(mLinks)) {
									mFiltered[sKey].links = mLinks;
								}
								return mFiltered;
							});
						}
					});
				})
			)
			.then(function(aFilteredResults) {
				return aFilteredResults.reduce(function(mConsolidatedObject, oFilteredResult) {
					return Object.assign(mConsolidatedObject, oFilteredResult);
				}, {});
			});
		};

		/**
		 * Resolves the <code>links</code> object containing the format:
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
		 * @param {map} mLinks - Links map
		 * @param {sap.ui.core.Element} oElement - Element for which <code>links</code> object is required to be resolved
		 *
		 * @return {Promise} Promise resolving to links map
		 * @private
		 */
		oProperty._getResolvedLinks = function(mLinks, oElement) {
			var aTextPromises = [];
			var mResolvedLinks = { ...mLinks };

			Object.keys(mResolvedLinks).forEach(function(sLinkName) {
				if (Array.isArray(mResolvedLinks[sLinkName])) {
					mResolvedLinks[sLinkName].forEach(function(oLink) {
						aTextPromises.push(
							DtUtil.wrapIntoPromise(function() {
								if (typeof oLink.text === "function") {
									return oLink.text(oElement);
								}
							})(oLink)
							.then(function(sLinkText) {
								oLink.text = validate(sLinkText || oLink.text);
							})
						);
					});
				}
			});
			return Promise.all(aTextPromises)
			.then(function() {
				return mResolvedLinks;
			});
		};

		/**
		 * Gets binding information for the passed property and element.
		 *
		 * @param {string} sKey - Property name
		 * @param {sap.ui.core.Element} oElement - Element for which binding information is required
		 *
		 * @return {object} Object containing the binding information
		 * @private
		 */
		oProperty._getBindingInfo = function(sKey, oElement) {
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
		 * @param {any}  vProperty - Property which needs to be resolved (e.g. <code>function</code>, <code>string</code>)
		 * @param {sap.ui.core.Element} oElement - Element for which the property needs to be resolved
		 *
		 * @return {Promise} Promise resolving to the property value
		 * @private
		 */
		oProperty._getResolvedFunction = function(vProperty, oElement) {
			return DtUtil.wrapIntoPromise(function() {
				return typeof vProperty === "function"
					? (vProperty(oElement) || false) // could return a promise
					: (vProperty || false);
			})(vProperty, oElement);
		};

		return {
			exports: {
				/**
				 * Returns an object containing design time properties for the passed control's ID.
				 * Throws an error if the control ID parameter is not a valid control with a stable ID.
				 *
				 * Example:
				 *
				 * <pre>
				 *	{
				 * 		"properties": {
				 * 			<...>,
				 * 			"virtualProperty1": {
				 * 				<...>
				 * 			},
				 * 			"metadataProperty1": {
				 * 				<...>
				 * 			}
				 * 		},
				 * 		"annotations": {
				 * 			"annotation1": {
				 *				<...>
				 * 			},
				 * 			<...>
				 * 		},
				 * 		"links": {
				 * 			<...>
				 * 		},
				 * 		<...>
				 * 	}
				 * </pre>
				 * @name sap.ui.rta.service.Property.get
				 * @param {string} sControlId - ID of the control to start with
				 * @returns {sap.ui.rta.service.Property.PropertyObject} Object containing relevant property data for the passed control
				 * @function
				 * @public
				 */
				get: oProperty._getDesignTimeProperties.bind(oProperty)
			}
		};
	};
});