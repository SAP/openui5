/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/model/ListBinding"], function(ListBinding) {
	"use strict";

	/**
	 * Checks if the property is using a complex type.
	 *
	 * @param {Object} mProperty - The property object from the entity type.
	 * @returns {boolean} - Returns true if the property is using a complex type, otherwise false.
	 */
	function isComplexType(mProperty) {
		return !!(mProperty && mProperty.type && mProperty.type.toLowerCase().indexOf("edm") !== 0);
	}

	/**
	 * Check for absolute aggregation binding.
	 *
	 * @param {Object} oElement - the element to check
	 * @param {string} sAggregationName - the name of the aggregation
	 * @return {boolean} whether the path starts with "/"
	 */
	function checkForAbsoluteAggregationBinding(oElement, sAggregationName) {
		if (!oElement) {
			return false;
		}
		const mBindingInfo = oElement.getBindingInfo(sAggregationName);
		const sPath = mBindingInfo && mBindingInfo.path;
		if (!sPath) {
			return false;
		}
		return sPath.indexOf("/") === 0;
	}

	/**
	 * Retrieves the default model binding data for the given element based on certain conditions.
	 *
	 * @param {Object} oElement - The element for which the binding data is retrieved.
	 * @param {boolean} bAbsoluteAggregationBinding - Flag indicating whether to use absolute aggregation binding.
	 * @param {string} sAggregationName - The name of the aggregation for which binding data is fetched.
	 * @return {Object|undefined} The binding data for the element or undefined if not found.
	 */
	function getDefaultModelBindingData(oElement, bAbsoluteAggregationBinding, sAggregationName) {
		let vBinding;
		if (bAbsoluteAggregationBinding) {
			vBinding = oElement.getBindingInfo(sAggregationName);
			// check to be default model binding otherwise return undefined
			if (typeof vBinding.model === "string" && vBinding.model !== "") {
				vBinding = undefined;
			}
		} else {
			// here we explicitly request the default models binding context
			vBinding = oElement.getBindingContext();
		}
		return vBinding;
	}

	/**
	 * Enriches a property with additional information such as label, tooltip, and visibility.
	 *
	 * @param {object} mProperty - The property object to be enriched
	 * @param {object} mODataEntity - The OData entity object containing metadata
	 * @param {object} oElement - The element to which the property belongs
	 * @param {string} sAggregationName - The name of the aggregation
	 * @return {object} The enriched property object
	 */
	function enrichProperty(mProperty, mODataEntity, oElement, sAggregationName) {
		const mProp = {
			name: mProperty.name,
			bindingPath: mProperty.name,
			entityType: mODataEntity.name
		};
		const mLabelAnnotation = mProperty["com.sap.vocabularies.Common.v1.Label"];
		mProp.label = mLabelAnnotation && mLabelAnnotation.String;

		const mQuickInfoAnnotation = mProperty["com.sap.vocabularies.Common.v1.QuickInfo"];
		mProp.tooltip = mQuickInfoAnnotation && mQuickInfoAnnotation.String;

		// CDS UI.Hidden new way also for sap:visible = false
		const mHiddenAnnotation = mProperty["com.sap.vocabularies.UI.v1.Hidden"];
		mProp.hideFromReveal = !!mHiddenAnnotation && mHiddenAnnotation.Bool === "true";

		if (!mProp.hideFromReveal) {
			// Old hidden annotation
			const mFieldControlAnnotation = mProperty["com.sap.vocabularies.Common.v1.FieldControl"];
			if (mFieldControlAnnotation && mFieldControlAnnotation.EnumMember) {
				mProp.hideFromReveal = mFieldControlAnnotation.EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Hidden";
			} else {
				// @runtime hidden by field control value = 0
				const sFieldControlPath = mFieldControlAnnotation && mFieldControlAnnotation.Path;
				if (sFieldControlPath) {
					// if the binding is a list binding, we skip the check for field control
					const bListBinding = oElement.getBinding(sAggregationName) instanceof ListBinding;
					if (!bListBinding) {
						const iFieldControlValue = oElement.getBindingContext().getProperty(sFieldControlPath);
						mProp.hideFromReveal = iFieldControlValue === 0;
					}
				}
			}
		}
		return mProp;
	}

	/**
	 * Converts metadata to delegate format.
	 *
	 * @param {object} mODataEntity - The OData entity metadata object
	 * @param {object} oMetaModel - The meta model object
	 * @param {object} oElement - The element object
	 * @param {string} sAggregationName - The name of the aggregation
	 * @return {array} The properties in delegate format
	 */
	function convertMetadataToDelegateFormat(mODataEntity, oMetaModel, oElement, sAggregationName) {
		const aFieldControlProperties = mODataEntity.property
		.map((mProperty) => mProperty["sap:field-control"])
		.filter(Boolean);

		const fnFilterFieldControlProperties = (mProperty) => !aFieldControlProperties.includes(mProperty.name);

		const aProperties = mODataEntity.property.map((mProperty) => {
			const mProp = enrichProperty(mProperty, mODataEntity, oElement, sAggregationName);
			if (isComplexType(mProperty)) {
				const mComplexType = oMetaModel.getODataComplexType(mProperty.type);
				if (mComplexType) {
					// deep properties, could get multiple-level deep
					mProp.properties = mComplexType.property
					.map((mComplexProperty) => {
						const mInnerProp = enrichProperty(mComplexProperty, mODataEntity, oElement, sAggregationName);
						mInnerProp.bindingPath = `${mProperty.name}/${mComplexProperty.name}`;
						mInnerProp.referencedComplexPropertyName = mProp.label || mProp.name;
						return mInnerProp;
					})
					.filter(fnFilterFieldControlProperties);
				}
			}
			return mProp;
		});

		if (mODataEntity.navigationProperty) {
			const aNavigationProperties = mODataEntity.navigationProperty.map((mNavProp) => {
				const sFullyQualifiedEntityName = oMetaModel.getODataAssociationEnd(mODataEntity, mNavProp.name)?.type;
				return {
					name: mNavProp.name,
					// no labels or tooltips for navigation properties
					entityType: sFullyQualifiedEntityName,
					bindingPath: mNavProp.name,
					unsupported: true // no support for navigation properties yet
					// can have properties (like complex types in future)
				};
			});
			aProperties.push(...aNavigationProperties);
		}

		return aProperties.filter(fnFilterFieldControlProperties);
	}

	/**
	 * Retrieves the binding path based on the provided element, aggregation name, and payload.
	 *
	 * @param {Object} oElement - the element to get the binding path for
	 * @param {string} sAggregationName - the name of the aggregation
	 * @param {Object} mPayload - the payload containing the path
	 * @return {string} the binding path
	 */
	function getBindingPath(oElement, sAggregationName, mPayload) {
		if (mPayload?.path) {
			return mPayload?.path;
		}
		return checkForAbsoluteAggregationBinding(oElement, sAggregationName)
			? getDefaultModelBindingData(oElement, true, sAggregationName).path
			: getDefaultModelBindingData(oElement, false, sAggregationName).getPath();
	}

	/**
	 * Load the OData meta model for the given element.
	 *
	 * @param {object} oElement - The element to load the meta model for
	 * @param {object} mPayload - The payload containing model information
	 * @return {Promise} A Promise that resolves with the OData meta model or null if not found
	 */
	async function loadODataMetaModel(oElement, mPayload) {
		const oModel = oElement.getModel(mPayload?.modelName);
		if (oModel && ["sap.ui.model.odata.ODataModel", "sap.ui.model.odata.v2.ODataModel"].includes(oModel.getMetadata().getName())) {
			const oMetaModel = oModel.getMetaModel();
			await oMetaModel.loaded();
			return oMetaModel;
		}
		return null;
	}

	/**
	 * Retrieve OData entity from meta model based on the binding context path.
	 *
	 * @param {object} oMetaModel - The meta model object
	 * @param {string} sBindingContextPath - The binding context path
	 * @returns {object} - The OData entity object
	 */
	function getODataEntityFromMetaModel(oMetaModel, sBindingContextPath) {
		const oMetaModelContext = oMetaModel.getMetaContext(sBindingContextPath);
		return oMetaModelContext.getObject();
	}

	/**
	 * Adjusts the OData entity for list bindings based on the default aggregation of the given element.
	 *
	 * @param {sap.ui.core.Element} oElement - The UI5 element for which the OData entity needs to be adjusted.
	 * @param {sap.ui.model.odata.ODataMetaModel} oMetaModel - The OData metamodel.
	 * @param {object} mODataEntity - The OData entity to be adjusted.
	 * @returns {object} The adjusted OData entity.
	 */
	function adjustODataEntityForListBindings(oElement, oMetaModel, mODataEntity) {
		const oDefaultAggregation = oElement.getMetadata().getAggregation();
		if (oDefaultAggregation) {
			const oBinding = oElement.getBindingInfo(oDefaultAggregation.name);
			const oTemplate = oBinding && oBinding.template;

			if (oTemplate) {
				const sPath = oElement.getBindingPath(oDefaultAggregation.name);
				const oODataAssociationEnd = oMetaModel.getODataAssociationEnd(mODataEntity, sPath);
				const sFullyQualifiedEntityName = oODataAssociationEnd && oODataAssociationEnd.type;
				if (sFullyQualifiedEntityName) {
					const oEntityType = oMetaModel.getODataEntityType(sFullyQualifiedEntityName);
					mODataEntity = oEntityType;
				}
			}
		}
		return mODataEntity;
	}

	/**
	 * Retrieve OData properties of a model based on the element, aggregation name, and payload.
	 *
	 * @param {Object} oElement - The element to retrieve OData properties from.
	 * @param {string} sAggregationName - The name of the aggregation.
	 * @param {Object} mPayload - The payload containing additional data.
	 * @return {Array} The array of OData properties of the model.
	 */
	async function getODataPropertiesOfModel(oElement, sAggregationName, mPayload) {
		const oMetaModel = await loadODataMetaModel(oElement, mPayload);
		let aProperties = [];
		if (oMetaModel) {
			const sBindingContextPath = getBindingPath(oElement, sAggregationName, mPayload);
			if (sBindingContextPath) {
				let mODataEntity = getODataEntityFromMetaModel(oMetaModel, sBindingContextPath);
				mODataEntity = adjustODataEntityForListBindings(oElement, oMetaModel, mODataEntity);
				aProperties = convertMetadataToDelegateFormat(
					mODataEntity,
					oMetaModel,
					oElement,
					sAggregationName);
			}
		}
		return aProperties;
	}
	/**
	 * Default read delegate for ODataV2 protocoll.
	 * @namespace sap.ui.fl.write._internal.delegate.ODataV2ReadDelegate
	 * @implements {sap.ui.fl.interfaces.Delegate}
	 * @experimental Since 1.123
	 * @since 1.123
	 * @private
	 */
	var ODataV2ReadDelegate = {}; /** @lends sap/ui/fl/write/_internal/delegates/oDataV2ReadDelegate */

	/**
	 *	@inheritdoc
	 */
	ODataV2ReadDelegate.getPropertyInfo = function(mPropertyBag) {
		return getODataPropertiesOfModel(mPropertyBag.element, mPropertyBag.aggregationName, mPropertyBag.payload);
	};

	return ODataV2ReadDelegate;
});