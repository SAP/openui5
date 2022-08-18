/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/Object"], function(BaseObject) {
	"use strict";
	/**
	 * Is property of complex type.
	 *
	 * @param {object} mProperty Property from entity type
	 * @returns {boolean} `true` if property is of complex type
	 * @private
	 */
	function _isComplexType(mProperty) {
		if (mProperty && mProperty.$Type) {
			if (mProperty.$Type.toLowerCase().indexOf("edm") !== 0) {
				return true;
			}
		}
		return false;
	}
	/**
	 * Check if a given property path starts with a navigation property.
	 *
	 * @param {string} sPropertyPath Path of the property
	 * @param {object} aNavigationProperties The list of navigation properties of the entity type
	 * @returns {boolean} `true` if the property path starts with a navigation property
	 * @private
	 */
	function _startsWithNavigationProperty(sPropertyPath, aNavigationProperties) {
		return aNavigationProperties.some(function(sNavProp) {
			if (sPropertyPath.startsWith(sNavProp)) {
				return true;
			}
		});
	}
	/**
	 * Get delegate format for a given property.
	 *
	 * @param {string} sPropertyPath Path of the property
	 * @param {object} mElement Property in metadata format
	 * @param {object} mPropertyAnnotations Annotations for the property
	 * @param {string} sEntityType Entity type name
	 * @param {sap.ui.core.Control} oElement Control instance
	 * @param {string} sAggregationName Aggregation name for which the delegate should provide additional elements
	 * @param {Array} aNavigationProperties List of navigation properties for the entity type
	 * @returns {object} Property in delegate format
	 * @private
	 */
	function _enrichProperty(
		sPropertyPath,
		mElement,
		mPropertyAnnotations,
		sEntityType,
		oElement,
		sAggregationName,
		aNavigationProperties
	) {
		var mProp = {
			name: sPropertyPath,
			bindingPath: sPropertyPath,
			entityType: sEntityType
		};
		// get label information, either via DataFieldDefault annotation (if exists) or Label annotation
		var mDataFieldDefaultAnnotation = mPropertyAnnotations["@com.sap.vocabularies.UI.v1.DataFieldDefault"];
		var sLabel =
			(mDataFieldDefaultAnnotation && mDataFieldDefaultAnnotation.Label) ||
			mPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"];
		mProp.label = sLabel || "[LABEL_MISSING: " + sPropertyPath + "]";
		// evaluate Hidden annotation
		var mHiddenAnnotation = mPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
		mProp.hideFromReveal = mHiddenAnnotation;
		if (mHiddenAnnotation && mHiddenAnnotation.$Path) {
			mProp.hideFromReveal = oElement.getBindingContext().getProperty(mHiddenAnnotation.$Path);
		}
		// evaluate FieldControl annotation
		var mFieldControlAnnotation;
		if (!mProp.hideFromReveal) {
			mFieldControlAnnotation = mPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
			if (mFieldControlAnnotation) {
				mProp.hideFromReveal = mFieldControlAnnotation.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Hidden";
			}
		}
		// @runtime hidden by field control value = 0
		mFieldControlAnnotation = mPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
		var sFieldControlPath = mFieldControlAnnotation && mFieldControlAnnotation.Path;
		if (sFieldControlPath && !mProp.hideFromReveal) {
			// if the binding is a list binding, skip the check for field control
			var bListBinding = BaseObject.isA(oElement.getBinding(sAggregationName), "sap/ui/model/ListBinding");
			if (!bListBinding) {
				var iFieldControlValue = oElement.getBindingContext().getProperty(sFieldControlPath);
				mProp.hideFromReveal = iFieldControlValue === 0;
			}
		}
		// no support for DataFieldFor/WithAction and DataFieldFor/WithIntentBasedNavigation within DataFieldDefault annotation
		if (
			mDataFieldDefaultAnnotation &&
			(mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
				mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
				mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction" ||
				mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation")
		) {
			mProp.unsupported = true;
		}
		// no support for navigation properties and complex properties
		if (_startsWithNavigationProperty(sPropertyPath, aNavigationProperties) || _isComplexType(mElement)) {
			mProp.unsupported = true;
		}
		return mProp;
	}
	/**
	 * Convert metadata format to delegate format.
	 *
	 * @param {object} mODataEntityType EntityType in metadata format
	 * @param {string} sEntityType EntityType name
	 * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel The current ODataMetaModel
	 * @param {sap.ui.core.Control} oElement Control instance
	 * @param {string} sAggregationName Aggregation name for which the delegate should provide additional elements
	 * @returns {Array} A list of properties in delegate format
	 * @private
	 */
	function _convertMetadataToDelegateFormat(mODataEntityType, sEntityType, oMetaModel, oElement, sAggregationName) {
		var aProperties = [];
		var sElementName = "";
		var aNavigationProperties = [];
		var mElement;
		for (sElementName in mODataEntityType) {
			mElement = mODataEntityType[sElementName];
			if (mElement.$kind === "NavigationProperty") {
				aNavigationProperties.push(sElementName);
			}
		}
		for (sElementName in mODataEntityType) {
			mElement = mODataEntityType[sElementName];
			if (mElement.$kind === "Property") {
				var mPropAnnotations = oMetaModel.getObject("/" + sEntityType + "/" + sElementName + "@");
				var mProp = _enrichProperty(
					sElementName,
					mElement,
					mPropAnnotations,
					sEntityType,
					oElement,
					sAggregationName,
					aNavigationProperties
				);
				aProperties.push(mProp);
			}
		}
		return aProperties;
	}
	/**
	 * Get binding path either from payload (if available) or the element's binding context.
	 *
	 * @param {sap.ui.core.Control} oElement The control instance
	 * @param {object} mPayload The payload parameter attached to the delegate, empty object if no payload was assigned
	 * @returns {string} The binding path
	 * @private
	 */
	function _getBindingPath(oElement, mPayload) {
		if (mPayload.path) {
			return mPayload.path;
		}
		var vBinding = oElement.getBindingContext();
		if (vBinding) {
			return vBinding.getPath();
		}
	}
	/**
	 * Get all properties of the element's model.
	 *
	 * @param {sap.ui.core.Control} oElement The control instance
	 * @param {string} sAggregationName The aggregation name for which the delegate should provide additional elements
	 * @param {object} mPayload The payload parameter attached to the delegate, empty object if no payload was assigned
	 * @returns {Array} The list of properties in delegate format
	 * @private
	 */
	function _getODataPropertiesOfModel(oElement, sAggregationName, mPayload) {
		var oModel = oElement.getModel(mPayload.modelName);
		if (oModel) {
			if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
				var oMetaModel = oModel.getMetaModel();
				var sBindingContextPath = _getBindingPath(oElement, mPayload);
				if (sBindingContextPath) {
					var oMetaModelContext = oMetaModel.getMetaContext(sBindingContextPath);
					var oMetaModelContextObject = oMetaModelContext.getObject();
					var mODataEntityType = oMetaModelContext.getObject(oMetaModelContextObject.$Type);
					return _convertMetadataToDelegateFormat(
						mODataEntityType,
						oMetaModelContextObject.$Type,
						oMetaModel,
						oElement,
						sAggregationName
					);
				}
			}
		}
		return Promise.resolve([]);
	}
	var Delegate = {
		/**
		 * @param {object} mPropertyBag Object with parameters as properties
		 * @param {string} mPropertyBag.element Element instance the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName Name of the aggregation the delegate should provide additional elements
		 * @param {object} mPropertyBag.payload Payload parameter attached to the delegate, empty object if no payload was assigned
		 * @returns {Promise<sap.ui.fl.delegate.PropertyInfo[]>} Metadata in a deep structure of nodes and properties
		 */
		getPropertyInfo: function(mPropertyBag) {
			return Promise.resolve().then(function() {
				return _getODataPropertiesOfModel(mPropertyBag.element, mPropertyBag.aggregationName, mPropertyBag.payload);
			});
		}
	};
	return Delegate;
});
