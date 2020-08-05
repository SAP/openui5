sap.ui.define([
], function(
) {
	"use strict";

	function _isFormRelatedElement(mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oElement = mPropertyBag.element;
		return oModifier.getControlType(oElement).indexOf(".form.") !== -1;
	}

	/**
	 * Is field using a complex type
	 *
	 * @param {Object} mProperty - property from entityType
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
	function _checkForAbsoluteAggregationBinding(oElement, sAggregationName) {
		if (!oElement) {
			return false;
		}
		var mBindingInfo = oElement.getBindingInfo(sAggregationName);
		var sPath = mBindingInfo && mBindingInfo.path;
		if (!sPath) {
			return false;
		}
		if (sPath.indexOf(">") > -1) {
			sPath = sPath.split(">").pop();
		}
		return sPath.indexOf("/") === 0;
	}
	function _getDefaultModelBindingData(oElement, bAbsoluteAggregationBinding, sAggregationName) {
		var vBinding;
		if (bAbsoluteAggregationBinding) {
			vBinding = oElement.getBindingInfo(sAggregationName);
			//check to be default model binding otherwise return undefined
			if (typeof vBinding.model === "string" && vBinding.model !== "") {
				vBinding = undefined;
			}
		} else {
			//here we explicitly request the default models binding context
			vBinding = oElement.getBindingContext();
		}
		return vBinding;
	}

	function _enrichProperty(mProperty, mODataEntity, oElement, sAggregationName) {
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
						var iFieldControlValue = oElement.getBindingContext().getProperty(sFieldControlPath);
						mProp.unsupported = iFieldControlValue === 0;
					}
				}
			}
		}
		return mProp;
	}

	function _convertMetadataToDelegateFormat (mODataEntity, oMetaModel, oElement, sAggregationName) {
		var aProperties = mODataEntity.property.map(function(mProperty) {
			var mProp = _enrichProperty(mProperty, mODataEntity, oElement, sAggregationName);
			if (_isComplexType(mProperty)) {
				var mComplexType = oMetaModel.getODataComplexType(mProperty.type);
				if (mComplexType) {
					//deep properties, could get multiple-level deep
					mProp.properties = mComplexType.property.map(function(mComplexProperty) {
						var mInnerProp = _enrichProperty(mComplexProperty, mODataEntity, oElement, sAggregationName);
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
	function _getBindingPath(oElement, sAggregationName, mPayload) {
		if (mPayload.path) {
			return mPayload.path;
		}
		var bAbsoluteAggregationBinding = _checkForAbsoluteAggregationBinding(oElement, sAggregationName);
		var vBinding = _getDefaultModelBindingData(oElement, bAbsoluteAggregationBinding, sAggregationName);
		if (vBinding) {
			return bAbsoluteAggregationBinding ? vBinding.path : vBinding.getPath();
		}
	}
	function _loadODataMetaModel(oElement, mPayload) {
		return Promise.resolve()
			.then(function() {
				var oModel = oElement.getModel(mPayload.modelName);
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

	function _getODataPropertiesOfModel(oElement, sAggregationName, mPayload) {
		return _loadODataMetaModel(oElement, mPayload)
			.then(function(oMetaModel) {
				var aProperties = [];
				if (oMetaModel) {
					var sBindingContextPath = _getBindingPath(oElement, sAggregationName, mPayload);
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
			});
	}

	var ASYNC = true;

	var Delegate = {
		/**
		/*
		* @param {object} mPropertyBag - Object with parameters as properties
		* @param {object} mPropertyBag.payload - Payload parameter attached to the delegate, empty object if no payload was assigned
		* @param {string} mPropertyBag.element - Element instance the delegate is attached to
		* @param {string} mPropertyBag.aggregationName - Name of the aggregation the delegate should provide additional elements
		* @returns {Promise<sap.ui.fl.delegate.PropertyInfo>} Metadata in a deep structure of nodes and properties
		*/
		getPropertyInfo: function(mPropertyBag) {
			return _getODataPropertiesOfModel(mPropertyBag.element, mPropertyBag.aggregationName, mPropertyBag.payload);
		},

		createLabel: function(mPropertyBag) {
			return mPropertyBag.modifier.createControl("sap.ui.comp.smartfield.SmartLabel",
				mPropertyBag.appComponent,
				mPropertyBag.view,
				mPropertyBag.labelFor + "-label",
				{ labelFor: mPropertyBag.labelFor, text: mPropertyBag.bindingPath },
				ASYNC
			);
		},
		createControlForProperty: function(mPropertyBag) {
			//see SmartField.flexibility.js fnCreateFieldWithLabel function
			var oModifier = mPropertyBag.modifier;
			return oModifier.createControl("sap.ui.comp.smartfield.SmartField",
				mPropertyBag.appComponent,
				mPropertyBag.view,
				mPropertyBag.fieldSelector,
				{value : "{" + mPropertyBag.bindingPath + "}"},
				ASYNC
			).then(function(oSmartField) {
				return {
					control : oSmartField
				};
			});
		},

		createLayout: function(mPropertyBag) {
			var oModifier = mPropertyBag.modifier;
			if (_isFormRelatedElement(mPropertyBag)) {
				//Don't provide form handling
				return Promise.resolve();
			}
			//TODO validate with object page header/VBox/HBox
			return oModifier.createControl("sap.m.VBox",
				mPropertyBag.appComponent,
				mPropertyBag.view,
				mPropertyBag.fieldSelector,
				{},
				/*async*/true
			).then(function(oVBox) {
				var mFieldPropertyBag = Object.assign({}, mPropertyBag);
				var mSmartFieldSelector = Object.assign({}, mPropertyBag.fieldSelector);
				mSmartFieldSelector.id = mSmartFieldSelector.id + "-field";
				mFieldPropertyBag.fieldSelector = mSmartFieldSelector;
				return Delegate.createControlForProperty(mFieldPropertyBag).then(function(mField) {
					//labelFor prop
					var sNewFieldId = oModifier.getId(mField.control);
					mFieldPropertyBag.labelFor = sNewFieldId;
					return Delegate.createLabel(mFieldPropertyBag).then(function(oLabel) {
						//harmonize return values for mediator create function and delegate:
						return {
							label : oLabel,
							control : mField.control,
							valueHelp : mField.valueHelp
						};
					});
				}).then(function(mInnerControls) {
					//do some custom placement here
					oModifier.insertAggregation(oVBox, "items", mInnerControls.label, 0, mPropertyBag.view);
					oModifier.insertAggregation(oVBox, "items", mInnerControls.control, 1, mPropertyBag.view);
					return {
						control : oVBox, //modifier created container containing already the label and control
										//as it is needed for the current control type or position in the app (can be derived from payload)
										//control type of relevant container (e.g. Form, ObjectPageLayout, Table)
										//aggregation name of control insertion is given to support
						valueHelp : mInnerControls.valueHelp
							//if available it has to be added to the relevant containers dependents aggregation otherwise it is expected for not being needed or included in the control
					};
				});
			});
		}
	};
	return Delegate;
});
