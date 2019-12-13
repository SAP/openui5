/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseTreeModifier",
	"sap/base/util/ObjectPath",
	"sap/ui/util/XMLHelper",
	"sap/ui/core/Component",
	"sap/base/util/merge",
	"sap/ui/core/Fragment" // needed to have sap.ui.xmlfragment
], function (
	BaseTreeModifier,
	ObjectPath,
	XMLHelper,
	Component,
	merge
) {

	"use strict";
	/**
	 * Static utility class to access ManagedObjects in a harmonized way with XMLNodes.
	 *
	 * @namespace sap.ui.core.util.reflection.JsControlTreeModifier
	 * @extends sap.ui.core.util.reflection.BaseTreeModifier
	 * @private
	 * @ui5-restricted
	 * @since 1.56.0
	 */
	var JsControlTreeModifier = /** @lends sap.ui.core.util.reflection.JsControlTreeModifier */ {

		targets: "jsControlTree",

		/**
		 * @inheritDoc
		 */
		setVisible: function (oControl, bVisible) {
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
		getVisible: function (oControl) {
			if (oControl.getVisible) {
				return oControl.getVisible();
			} else {
				throw new Error("Provided control instance has no getVisible method");
			}
		},

		/**
		 * @inheritDoc
		 */
		setStashed: function (oControl, bStashed, oAppComponent) {
			bStashed = !!bStashed;
			if (oControl.setStashed) {
				var oUnstashedControl;

				// check if the control is stashed and should be unstashed
				if (oControl.getStashed() === true && bStashed === false) {
					oControl.setStashed(bStashed);

					// replace stashed control with original control
					// some change handlers (e.g. StashControl) do not pass the component
					if (oAppComponent instanceof Component) {
						oUnstashedControl = this.bySelector(
							this.getSelector(oControl, oAppComponent),  // returns a selector
							oAppComponent
						);
					}

				}

				// ensure original control's visible property is set
				// stashed controls do not have a setVisible()
				if ((oUnstashedControl || oControl)["setVisible"]) {
					this.setVisible(oUnstashedControl || oControl, !bStashed);
				}

				// can be undefined if app component is not passed or control is not found
				return oUnstashedControl;
			} else {
				throw new Error("Provided control instance has no setStashed method");
			}
		},

		/**
		 * @inheritDoc
		 */
		getStashed: function (oControl) {
			if (oControl.getStashed) {
				//check if it's a stashed control. If not, return the !visible property
				return typeof oControl.getStashed() !== "boolean" ? !this.getVisible(oControl) : oControl.getStashed();
			} else {
				throw new Error("Provided control instance has no getStashed method");
			}
		},

		/**
		 * @inheritDoc
		 */
		bindProperty: function (oControl, sPropertyName, vBindingInfos) {
			oControl.bindProperty(sPropertyName, vBindingInfos);
		},

		/**
		 * @inheritDoc
		 */
		unbindProperty: function (oControl, sPropertyName) {
			if (oControl) {
				oControl.unbindProperty(sPropertyName, /*bSuppressReset = */true);
			}
		},

		/**
		 * @inheritDoc
		 */
		setProperty: function (oControl, sPropertyName, vPropertyValue) {
			var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
			this.unbindProperty(oControl, sPropertyName);

			//For compatibility with XMLTreeModifier the value should be serializable
			if (oMetadata) {
				if (this._isSerializable(vPropertyValue)) {
					var sPropertySetter = oMetadata._sMutator;
					oControl[sPropertySetter](vPropertyValue);
				} else {
					throw new TypeError("Value cannot be stringified", "sap.ui.core.util.reflection.JsControlTreeModifier");
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		getProperty: function (oControl, sPropertyName) {
			var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
			if (oMetadata) {
				var sPropertyGetter = oMetadata._sGetter;
				return oControl[sPropertyGetter]();
			}
		},

		/**
		 * @inheritDoc
		 */
		isPropertyInitial: function (oControl, sPropertyName) {
			return oControl.isPropertyInitial(sPropertyName);
		},

		/**
		 * @inheritDoc
		 */
		setPropertyBinding: function (oControl, sPropertyName, oPropertyBinding) {
			this.unbindProperty(oControl, sPropertyName);
			var mSettings = {};
			mSettings[sPropertyName] = oPropertyBinding;
			oControl.applySettings(mSettings);
		},

		/**
		 * @inheritDoc
		 */
		getPropertyBinding: function (oControl, sPropertyName) {
			return oControl.getBindingInfo(sPropertyName);
		},

		/**
		 * @inheritDoc
		 */
		createControl: function (sClassName, oAppComponent, oView, oSelector, mSettings, bAsync) {
			var sErrorMessage;
			if (this.bySelector(oSelector, oAppComponent)) {
				sErrorMessage = "Can't create a control with duplicated ID " + oSelector;
				if (bAsync) {
					return Promise.reject(sErrorMessage);
				}
				throw new Error(sErrorMessage);
			}

			if (bAsync) {
				return new Promise(function(fnResolve, fnReject) {
					sap.ui.require([sClassName.replace(/\./g,"/")],
						function(ClassObject) {
							var sId = this.getControlIdBySelector(oSelector, oAppComponent);
							fnResolve(new ClassObject(sId, mSettings));
						}.bind(this),
						function() {
							fnReject(new Error("Required control '" + sClassName + "' couldn't be created asynchronously"));
						}
					);
				}.bind(this));
			}

			// in the synchronous case, object should already be preloaded
			var ClassObject = ObjectPath.get(sClassName);
			if (!ClassObject) {
				throw new Error("Can't create a control because the matching class object has not yet been loaded. Please preload the '" + sClassName + "' module");
			}
			var sId = this.getControlIdBySelector(oSelector, oAppComponent);
			return new ClassObject(sId, mSettings);
		},

		/**
		 * @inheritDoc
		 */
		applySettings: function(oControl, mSettings) {
			oControl.applySettings(mSettings);
		},

		/**
		 * @inheritDoc
		 */
		_byId: function (sId) {
			return sap.ui.getCore().byId(sId);
		},

		/**
		 * @inheritDoc
		 */
		getId: function (oControl) {
			return oControl.getId();
		},

		/**
		 * @inheritDoc
		 */
		getParent: function (oControl) {
			return oControl.getParent && oControl.getParent();
		},

		/**
		 * @inheritDoc
		 */
		getControlMetadata: function (oControl) {
			return oControl && oControl.getMetadata();
		},

		/**
		 * @inheritDoc
		 */
		getControlType: function (oControl) {
			return oControl && oControl.getMetadata().getName();
		},

		/**
		 * @inheritDoc
		 */
		setAssociation: function (vParent, sName, sId) {
			var oMetadata = vParent.getMetadata().getAssociation(sName);
			oMetadata.set(vParent, sId);
		},

		/**
		 * @inheritDoc
		 */
		getAssociation: function (vParent, sName) {
			var oMetadata = vParent.getMetadata().getAssociation(sName);
			return oMetadata.get(vParent);
		},

		/**
		 * @inheritDoc
		 */
		getAllAggregations: function (oParent) {
			return oParent.getMetadata().getAllAggregations();
		},

		/**
		 * @inheritDoc
		 */
		getAggregation: function (oParent, sName) {
			var oAggregation = this.findAggregation(oParent, sName);
			if (oAggregation) {
				return oParent[oAggregation._sGetter]();
			}
		},

		/**
		 * @inheritDoc
		 */
		insertAggregation: function (oParent, sName, oObject, iIndex) {
			//special handling without invalidation for customData
			if ( sName === "customData"){
				oParent.insertAggregation(sName, oObject, iIndex, /*bSuppressInvalidate=*/true);
			} else {
				var oAggregation = this.findAggregation(oParent, sName);
				if (oAggregation) {
					if (oAggregation.multiple) {
						var iInsertIndex = iIndex || 0;
						oParent[oAggregation._sInsertMutator](oObject, iInsertIndex);
					} else {
						oParent[oAggregation._sMutator](oObject);
					}
				}
			}

		},

		/**
		 * @inheritDoc
		 */
		removeAggregation: function (oControl, sName, oObject) {
			//special handling without invalidation for customData
			if ( sName === "customData"){
				oControl.removeAggregation(sName, oObject, /*bSuppressInvalidate=*/true);
			} else {
				var oAggregation = this.findAggregation(oControl, sName);
				if (oAggregation) {
					oControl[oAggregation._sRemoveMutator](oObject);
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		removeAllAggregation: function (oControl, sName) {
			//special handling without invalidation for customData
			if ( sName === "customData"){
				oControl.removeAllAggregation(sName, /*bSuppressInvalidate=*/true);
			} else {
				var oAggregation = this.findAggregation(oControl, sName);
				if (oAggregation) {
					oControl[oAggregation._sRemoveAllMutator]();
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		getBindingTemplate: function (oControl, sAggregationName) {
			var oBinding = oControl.getBindingInfo(sAggregationName);
			return oBinding && oBinding.template;
		},

		/**
		 * @inheritDoc
		 */
		updateAggregation: function (oControl, sAggregationName) {
			var oAggregation = this.findAggregation(oControl, sAggregationName);
			if (oAggregation) {
				oControl[oAggregation._sDestructor]();
				oControl.updateAggregation(sAggregationName);
			}
		},

		/**
		 * @inheritDoc
		 */
		findIndexInParentAggregation: function(oControl) {
			var oParent = this.getParent(oControl),
				aControlsInAggregation;

			if (!oParent) {
				return -1;
			}

			// we need all controls in the aggregation
			aControlsInAggregation = this.getAggregation(oParent, this.getParentAggregationName(oControl));

			// if aControls is an array:
			if (Array.isArray(aControlsInAggregation)) {
				// then the aggregtion is multiple and we can find the index of
				// oControl in the array
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
		getParentAggregationName: function (oControl) {
			return oControl.sParentAggregationName;
		},

		/**
		 * @inheritDoc
		 */
		findAggregation: function(oControl, sAggregationName) {
			if (oControl) {
				if (oControl.getMetadata) {
					var oMetadata = oControl.getMetadata();
					var oAggregations = oMetadata.getAllAggregations();
					if (oAggregations) {
						return oAggregations[sAggregationName];
					}
				}
			}
		},

		/**
		 * @inheritDoc
		 */
		validateType: function(oControl, oAggregationMetadata, oParent, sFragment) {
			var sTypeOrInterface = oAggregationMetadata.type;

			// if aggregation is not multiple and already has element inside, then it is not valid for element
			if (oAggregationMetadata.multiple === false && this.getAggregation(oParent, oAggregationMetadata.name) &&
					this.getAggregation(oParent, oAggregationMetadata.name).length > 0) {
				return false;
			}
			return this._isInstanceOf(oControl, sTypeOrInterface) || this._hasInterface(oControl, sTypeOrInterface);
		},

		/**
		 * @inheritDoc
		 */
		instantiateFragment: function(sFragment, sNamespace, oView) {
			var oFragment = XMLHelper.parse(sFragment);
			oFragment = this._checkAndPrefixIdsInFragment(oFragment, sNamespace);

			var aNewControls;
			var sId = oView && oView.getId();
			var oController = oView.getController();
			aNewControls = sap.ui.xmlfragment({
				fragmentContent: oFragment,
				sId:sId
			}, oController);

			if (!Array.isArray(aNewControls)) {
				aNewControls = [aNewControls];
			}
			return aNewControls;
		},

		/**
		 * @inheritDoc
		 */
		destroy: function(oControl) {
			oControl.destroy();
		},

		/**
		 * @inheritDoc
		 */
		getChangeHandlerModulePath: function(oControl) {
			if (typeof oControl === "object" && typeof oControl.data === "function"
					&& oControl.data("sap-ui-custom-settings") && oControl.data("sap-ui-custom-settings")["sap.ui.fl"]){
				return oControl.data("sap-ui-custom-settings")["sap.ui.fl"].flexibility;
			} else {
				return undefined;
			}
		},

		/**
		 * @inheritDoc
		 */
		attachEvent: function (oObject, sEventName, sFunctionPath, vData) {
			var fnCallback = ObjectPath.get(sFunctionPath);

			if (typeof fnCallback !== "function") {
				throw new Error("Can't attach event because the event handler function is not found or not a function.");
			}

			oObject.attachEvent(sEventName, vData, fnCallback);
		},

		/**
		 * @inheritDoc
		 */
		detachEvent: function (oObject, sEventName, sFunctionPath) {
			var fnCallback = ObjectPath.get(sFunctionPath);

			if (typeof fnCallback !== "function") {
				throw new Error("Can't attach event because the event handler function is not found or not a function.");
			}

			// EventProvider.detachEvent doesn't accept vData parameter, therefore it might lead
			// to a situation when an incorrect event listener is detached.
			oObject.detachEvent(sEventName, fnCallback);
		},

		/**
		 * @inheritDoc
		 */
		bindAggregation: function (oControl, sAggregationName, oBindingInfo) {
			oControl.bindAggregation(sAggregationName, oBindingInfo);
		},

		/**
		 * @inheritDoc
		 */
		unbindAggregation: function (oControl, sAggregationName) {
			// bSuppressReset is not supported
			oControl.unbindAggregation(sAggregationName);
		}
	};

	return merge(
		{} /* target object, to avoid changing of original modifier */,
		BaseTreeModifier,
		JsControlTreeModifier
	);
},
/* bExport= */true);
