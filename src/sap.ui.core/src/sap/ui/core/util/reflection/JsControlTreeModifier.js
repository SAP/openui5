// valid-jsdoc disabled because this check is validating just the params and return statement and those are all inherited from BaseTreeModifier.

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/ui/base/BindingParser",
	"sap/ui/core/util/reflection/BaseTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/util/XMLHelper"
], function(
	merge,
	ObjectPath,
	BindingParser,
	BaseTreeModifier,
	XmlTreeModifier,
	Element,
	Fragment,
	XMLHelper
) {

	"use strict";

	function requireClass(sClassName) {
		return new Promise(function(fnResolve, fnReject) {
			sap.ui.require([sClassName],
				function(oClassObject) { fnResolve(oClassObject); },
				function() {
					fnReject(new Error("Required control '" + sClassName
						+ "' couldn't be created asynchronously"));
				}
			);
		});
	}

	/**
	 * Static utility class to access ManagedObjects in a harmonized way with XMLNodes.
	 *
	 * @namespace sap.ui.core.util.reflection.JsControlTreeModifier
	 * @extends sap.ui.core.util.reflection.BaseTreeModifier
	 * @private
	 * @ui5-restricted
	 * @since 1.56.0
	 */
	const JsControlTreeModifier = /** @lends sap.ui.core.util.reflection.JsControlTreeModifier */ {
		targets: "jsControlTree",

		/**
		 * @inheritDoc
		 */
		setVisible: function(oControl, bVisible) {
			if (oControl.setVisible) {
				this.unbindProperty(oControl, "visible");
				oControl.setVisible(bVisible);
			} else {
				throw new Error("Provided control instance has no setVisible method");
			}
		},

		/**
		 * @inheritDoc
		 */
		getVisible: function(oControl) {
			if (oControl.getVisible) {
				return Promise.resolve(oControl.getVisible());
			} else {
				return Promise.reject(new Error("Provided control instance has no getVisible method"));
			}
		},

		/**
		 * @inheritDoc
		 */
		setStashed: async function(oControl, bStashed) {
			bStashed = !!bStashed;
			if (oControl.unstash) {
				// check if the control is stashed and should be unstashed
				if (oControl.isStashed() === true && bStashed === false) {
					oControl = await oControl.unstash(true);
				}

				// ensure original control's visible property is set
				if (oControl.setVisible) {
					this.setVisible(oControl, !bStashed);
				}

				return oControl;
			} else {
				throw new Error("Provided control instance has no unstash method");
			}
		},

		/**
		 * @inheritDoc
		 */
		getStashed: async function(oControl) {
			if (oControl.isStashed) {
				if (oControl.isStashed()) {
					return true;
				}
				const bIsVisible = await this.getVisible(oControl);
				return !bIsVisible;
			}
			throw new Error("Provided control instance has no isStashed method");
		},

		/**
		 * @inheritDoc
		 */
		bindProperty: function(oControl, sPropertyName, vBindingInfos) {
			oControl.bindProperty(sPropertyName, vBindingInfos);
		},

		/**
		 * @inheritDoc
		 */
		unbindProperty: function(oControl, sPropertyName) {
			if (oControl) {
				oControl.unbindProperty(sPropertyName, /*bSuppressReset = */true);
			}
		},

		/**
		 * @inheritDoc
		 */
		setProperty: function(oControl, sPropertyName, vPropertyValue) {
			const oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
			let oBindingParserResult;
			let bError;

			this.unbindProperty(oControl, sPropertyName);

			try {
				oBindingParserResult = BindingParser.complexParser(vPropertyValue, undefined, true);
			} catch (error) {
				bError = true;
			}

			//For compatibility with XMLTreeModifier the value should be serializable
			if (oMetadata) {
				if (this._isSerializable(vPropertyValue)) {
					if (oBindingParserResult && typeof oBindingParserResult === "object" || bError) {
						vPropertyValue = this._escapeCurlyBracketsInString(vPropertyValue);
					}
					const sPropertySetter = oMetadata._sMutator;
					oControl[sPropertySetter](vPropertyValue);
				} else {
					throw new TypeError("Value cannot be stringified", "sap.ui.core.util.reflection.JsControlTreeModifier");
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		getProperty: function(oControl, sPropertyName) {
			const oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
			let oProperty;
			if (oMetadata) {
				const sPropertyGetter = oMetadata._sGetter;
				oProperty = oControl[sPropertyGetter]();
			}
			return Promise.resolve(oProperty);
		},

		/**
		 * @inheritDoc
		 */
		isPropertyInitial: function(oControl, sPropertyName) {
			return oControl.isPropertyInitial(sPropertyName);
		},

		/**
		 * @inheritDoc
		 */
		setPropertyBinding: function(oControl, sPropertyName, oPropertyBinding) {
			this.unbindProperty(oControl, sPropertyName);
			const mSettings = {};
			mSettings[sPropertyName] = oPropertyBinding;
			return oControl.applySettings(mSettings);
		},

		/**
		 * @inheritDoc
		 */
		getPropertyBinding: function(oControl, sPropertyName) {
			return oControl.getBindingInfo(sPropertyName);
		},

		/**
		 * @inheritDoc
		 */
		createAndAddCustomData: async function(oControl, sCustomDataKey, sValue, oAppComponent) {
			const oCustomData = await this.createControl("sap.ui.core.CustomData", oAppComponent);
			this.setProperty(oCustomData, "key", sCustomDataKey);
			this.setProperty(oCustomData, "value", sValue);
			return this.insertAggregation(oControl, "customData", oCustomData, 0);
		},

		/**
		 * @inheritDoc
		 */
		getCustomDataInfo: function(oControl, sCustomDataKey) {
			let oCustomData;
			if (oControl.getCustomData) {
				oControl.getCustomData().some(function(oCurrentCustomData) {
					if (oCurrentCustomData.getKey() === sCustomDataKey) {
						oCustomData = oCurrentCustomData;
						return true;
					}
					return false;
				});
			}
			if (oCustomData) {
				return {
					customData: oCustomData,
					customDataValue: oCustomData.getValue()
				};
			} else {
				return {};
			}
		},

		/**
		 * @inheritDoc
		 */
		createControl: async function(sClassName, oAppComponent, oView, oSelector, mSettings) {
			sClassName = sClassName.replace(/\./g,"/");
			if (this.bySelector(oSelector, oAppComponent)) {
				const sErrorMessage = "Can't create a control with duplicated ID " + (oSelector.id || oSelector);
				return Promise.reject(sErrorMessage);
			}

			const ClassObject = sap.ui.require(sClassName) || await requireClass(sClassName);
			const sId = this.getControlIdBySelector(oSelector, oAppComponent);
			return new ClassObject(sId, mSettings);
		},

		/**
		 * @inheritDoc
		 */
		applySettings: function(oControl, mSettings) {
			return Promise.resolve(oControl.applySettings(mSettings));
		},

		/**
		 * @inheritDoc
		 */
		_byId: function(sId) {
			return Element.getElementById(sId);
		},

		/**
		 * @inheritDoc
		 */
		getId: function(oControl) {
			return oControl.getId();
		},

		/**
		 * @inheritDoc
		 */
		getParent: function(oControl) {
			return oControl.getParent?.();
		},

		/**
		 * @inheritDoc
		 */
		getControlMetadata: function(oControl) {
			return Promise.resolve(oControl?.getMetadata());
		},

		/**
		 * @inheritDoc
		 */
		getControlType: function(oControl) {
			return oControl?.getMetadata().getName();
		},

		/**
		 * @inheritDoc
		 */
		setAssociation: function(vParent, sName, sId) {
			const oMetadata = vParent.getMetadata().getAssociation(sName);
			oMetadata.set(vParent, sId);
		},

		/**
		 * @inheritDoc
		 */
		getAssociation: function(vParent, sName) {
			const oMetadata = vParent.getMetadata().getAssociation(sName);
			return oMetadata.get(vParent);
		},

		/**
		 * @inheritDoc
		 */
		getAllAggregations: function(oParent) {
			return Promise.resolve(oParent.getMetadata().getAllAggregations());
		},

		/**
		 * @inheritDoc
		 */
		getAggregation: async function(oParent, sName) {
			const oAggregation = await this.findAggregation(oParent, sName);
			if (oAggregation) {
				return oParent[oAggregation._sGetter]();
			}
			return undefined;
		},

		/**
		 * @inheritDoc
		 */
		insertAggregation: async function(oParent, sName, oObject, iIndex) {
			//special handling without invalidation for customData
			if (sName === "customData") {
				oParent.insertAggregation(sName, oObject, iIndex, /*bSuppressInvalidate=*/true);
				return;
			}
			const oAggregation = await this.findAggregation(oParent, sName);
			if (oAggregation) {
				if (oAggregation.multiple) {
					const iInsertIndex = iIndex || 0;
					oParent[oAggregation._sInsertMutator](oObject, iInsertIndex);
				} else {
					oParent[oAggregation._sMutator](oObject);
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		removeAggregation: async function(oParent, sName, oObject) {
			//special handling without invalidation for customData
			if (sName === "customData") {
				oParent.removeAggregation(sName, oObject, /*bSuppressInvalidate=*/true);
				return;
			}
			const oAggregation = await this.findAggregation(oParent, sName);
			if (oAggregation) {
				oParent[oAggregation._sRemoveMutator](oObject);
			}
		},

		/**
		 * @inheritDoc
		 */
		moveAggregation: async function(oSourceParent, sSourceAggregationName, oTargetParent, sTargetAggregationName, oObject, iIndex) {
			let oSourceAggregation;
			let oTargetAggregation;

			// customData aggregations are always multiple and use the standard "removeAggregation" mutator
			if (sSourceAggregationName === "customData") {
				oSourceParent.removeAggregation(sSourceAggregationName, oObject, /*bSuppressInvalidate=*/true);
			} else {
				oSourceAggregation = await this.findAggregation(oSourceParent, sSourceAggregationName);
			}
			if (sTargetAggregationName === "customData") {
				oTargetParent.insertAggregation(sTargetAggregationName, oObject, iIndex, /*bSuppressInvalidate=*/true);
			} else {
				oTargetAggregation = await this.findAggregation(oTargetParent, sTargetAggregationName);
			}

			if (oSourceAggregation && oTargetAggregation) {
				oSourceParent[oSourceAggregation._sRemoveMutator](oObject);
				if (oTargetAggregation.multiple) {
					oTargetParent[oTargetAggregation._sInsertMutator](oObject, iIndex);
				} else {
					oTargetParent[oTargetAggregation._sMutator](oObject);
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		replaceAllAggregation: async function(oControl, sAggregationName, aNewControls) {
			const oAggregation = await this.findAggregation(oControl, sAggregationName);
			oControl[oAggregation._sRemoveAllMutator]();
			aNewControls.forEach((oNewControl, iIndex) => {
				oControl[oAggregation._sInsertMutator](oNewControl, iIndex);
			});
		},

		/**
		 * @inheritDoc
		 */
		removeAllAggregation: async function(oControl, sName) {
			//special handling without invalidation for customData
			if (sName === "customData") {
				oControl.removeAllAggregation(sName, /*bSuppressInvalidate=*/true);
			} else {
				const oAggregation = await this.findAggregation(oControl, sName);
				if (oAggregation) {
					oControl[oAggregation._sRemoveAllMutator]();
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		getBindingTemplate: function(oControl, sAggregationName) {
			const oBinding = oControl.getBindingInfo(sAggregationName);
			return Promise.resolve(oBinding?.template);
		},

		/**
		 * @inheritDoc
		 */
		updateAggregation: async function(oControl, sAggregationName) {
			const oAggregation = await this.findAggregation(oControl, sAggregationName);
			if (oAggregation && oControl.getBinding(sAggregationName)) {
				oControl[oAggregation._sDestructor]();
				oControl.updateAggregation(sAggregationName);
			}
		},

		/**
		 * @inheritDoc
		 */
		findIndexInParentAggregation: async function(oControl) {
			const oParent = this.getParent(oControl);

			if (!oParent) {
				return -1;
			}

			const sParentAggregationName = await this.getParentAggregationName(oControl);
			// we need all controls in the aggregation
			const aControlsInAggregation = await this.getAggregation(oParent, sParentAggregationName);
			// if aControls is an array:
			if (Array.isArray(aControlsInAggregation)) {
				// then the aggregation is multiple and we can find the index of oControl in the array
				return aControlsInAggregation.indexOf(oControl);
			} else {
				// if aControlsInAggregation is not an array, then the aggregation is
				// of type 0..1 and aControlsInAggregation is the oControl provided
				// to the function initially, so its index is 0
				return 0;
			}
		},

		/**
		 * @inheritDoc
		 */
		getParentAggregationName: function(oControl) {
			return Promise.resolve(oControl.sParentAggregationName);
		},

		/**
		 * @inheritDoc
		 */
		findAggregation: function(oControl, sAggregationName) {
			if (oControl?.getMetadata) {
				const oMetadata = oControl.getMetadata();
				const oAggregations = oMetadata.getAllAggregations();
				return Promise.resolve(oAggregations[sAggregationName]);
			}
			return Promise.resolve(undefined);
		},

		/**
		 * @inheritDoc
		 */
		validateType: async function(oControl, oAggregationMetadata, oParent, sFragment) {
			const sTypeOrInterface = oAggregationMetadata.type;

			const oAggregation = await this.getAggregation(oParent, oAggregationMetadata.name);
			// if aggregation is not multiple and already has element inside, then it is not valid for element
			if (oAggregationMetadata.multiple === false && oAggregation && oAggregation.length > 0) {
				return false;
			}
			return oControl.isA(sTypeOrInterface);
		},

		/**
		 * @inheritDoc
		 */
		instantiateFragment: async function(sFragment, sNamespace, oView) {
			const oInputFragment = XMLHelper.parse(sFragment);
			const oFragment = await this._checkAndPrefixIdsInFragment(oInputFragment, sNamespace);
			const vNewControls = await Fragment.load({
				definition: oFragment,
				sId: oView && oView.getId(),
				controller: oView.getController()
			});
			if (vNewControls && !Array.isArray(vNewControls)) {
				return [vNewControls];
			}
			return vNewControls || [];
		},

		/**
		 * @inheritDoc
		 */
		templateControlFragment: async function(sFragmentName, mPreprocessorSettings, oView) {
			const oFragment = await BaseTreeModifier._templateFragment(
				sFragmentName,
				mPreprocessorSettings
			);
			const oController = oView?.getController();
			return Fragment.load({
				definition: oFragment,
				controller: oController
			});
		},

		/**
		 * @inheritDoc
		 */
		destroy: function(oControl, bSuppressInvalidate) {
			oControl.destroy(bSuppressInvalidate);
		},

		_getFlexCustomData: function(oControl, sType) {
			const oCustomData = typeof oControl === "object"
				&& typeof oControl.data === "function"
				&& oControl.data("sap-ui-custom-settings");
			return ObjectPath.get(["sap.ui.fl", sType], oCustomData);
		},

		/**
		 * @inheritDoc
		 */
		bindAggregation: function(oControl, sAggregationName, oBindingInfo) {
			return Promise.resolve(oControl.bindAggregation(sAggregationName, oBindingInfo));
		},

		/**
		 * @inheritDoc
		 */
		unbindAggregation: function(oControl, sAggregationName) {
			// bSuppressReset is not supported
			return Promise.resolve(oControl.unbindAggregation(sAggregationName));
		},

		/**
		 * @inheritDoc
		 */
		getExtensionPointInfo: async function(sExtensionPointName, oView) {
			const oViewNode = (oView._xContent) ? oView._xContent : oView;
			const oExtensionPointInfo = await XmlTreeModifier.getExtensionPointInfo(sExtensionPointName, oViewNode);
			if (oExtensionPointInfo) {
				// decrease the index by 1 to get the index of the extension point itself for js-case
				oExtensionPointInfo.index--;
				oExtensionPointInfo.parent = oExtensionPointInfo.parent && this._byId(oView.createId(oExtensionPointInfo.parent.getAttribute("id")));
				oExtensionPointInfo.defaultContent = oExtensionPointInfo.defaultContent
				.map((oNode) => {
					const sId = oView.createId(oNode.getAttribute("id"));
					return this._byId(sId);
				})
				.filter((oControl) => {
					return !!oControl;
				});
			}
			return oExtensionPointInfo;
		}
	};

	return merge(
		{} /* target object, to avoid changing of original modifier */,
		BaseTreeModifier,
		JsControlTreeModifier
	);
},
/* bExport= */true);
