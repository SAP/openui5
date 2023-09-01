// valid-jsdoc disabled because this check is validating just the params and return statement and those are all inherited from BaseTreeModifier.
/* eslint-disable valid-jsdoc */
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/BindingParser",
	"./BaseTreeModifier",
	"./XmlTreeModifier",
	"sap/base/util/ObjectPath",
	"sap/ui/util/XMLHelper",
	"sap/base/util/merge",
	"sap/ui/core/Fragment"
], function (
	BindingParser,
	BaseTreeModifier,
	XmlTreeModifier,
	ObjectPath,
	XMLHelper,
	merge,
	Fragment
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
				return Promise.resolve(oControl.getVisible());
			} else {
				return Promise.reject(new Error("Provided control instance has no getVisible method"));
			}
		},

		/**
		 * @inheritDoc
		 */
		setStashed: function (oControl, bStashed) {
			bStashed = !!bStashed;
			if (oControl.unstash) {
				// check if the control is stashed and should be unstashed
				if (oControl.isStashed() === true && bStashed === false) {
					oControl = oControl.unstash();
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
		getStashed: function (oControl) {
			if (oControl.isStashed) {
				if (oControl.isStashed()) {
					return Promise.resolve(true);
				}
				return this.getVisible(oControl)
					.then(function (bIsVisible) {
						return !bIsVisible;
					});
			}
			return Promise.reject(new Error("Provided control instance has no isStashed method"));
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
			var oBindingParserResult;
			var bError;

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
			var oProperty;
			if (oMetadata) {
				var sPropertyGetter = oMetadata._sGetter;
				oProperty = oControl[sPropertyGetter]();
			}
			return Promise.resolve(oProperty);
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
			return oControl.applySettings(mSettings);
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
		createAndAddCustomData: function(oControl, sCustomDataKey, sValue, oAppComponent) {
			return this.createControl("sap.ui.core.CustomData", oAppComponent)
				.then(function (oCustomData) {
					this.setProperty(oCustomData, "key", sCustomDataKey);
					this.setProperty(oCustomData, "value", sValue);
					return this.insertAggregation(oControl, "customData", oCustomData, 0);
				}.bind(this));
		},

		/**
		 * @inheritDoc
		 */
		getCustomDataInfo: function(oControl, sCustomDataKey) {
			var oCustomData;
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
		createControl: function (sClassName, oAppComponent, oView, oSelector, mSettings) {
			sClassName = sClassName.replace(/\./g,"/");
			if (this.bySelector(oSelector, oAppComponent)) {
				var sErrorMessage = "Can't create a control with duplicated ID " + (oSelector.id || oSelector);
				return Promise.reject(sErrorMessage);
			}

			var oPromise;
			var oClassObject = sap.ui.require(sClassName);
			if (oClassObject) {
				oPromise = Promise.resolve(oClassObject);
			} else {
				oPromise = new Promise(function(fnResolve, fnReject) {
					sap.ui.require([sClassName],
						function(oClassObject) { fnResolve(oClassObject); },
						function() {
							fnReject(new Error("Required control '" + sClassName
								+ "' couldn't be created asynchronously"));
						}
					);
				});
			}

			return oPromise
				.then(function(ClassObject) {
					var sId = this.getControlIdBySelector(oSelector, oAppComponent);
					return new ClassObject(sId, mSettings);
				}.bind(this));
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
			return Promise.resolve(oControl && oControl.getMetadata());
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
			return Promise.resolve(oParent.getMetadata().getAllAggregations());
		},

		/**
		 * @inheritDoc
		 */
		getAggregation: function (oParent, sName) {
			return this.findAggregation(oParent, sName)
				.then(function (oAggregation) {
					if (oAggregation) {
						return oParent[oAggregation._sGetter]();
					}
					return undefined;
				});
		},

		/**
		 * @inheritDoc
		 */
		insertAggregation: async function (oParent, sName, oObject, iIndex) {
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
		removeAggregation: async function (oParent, sName, oObject) {
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
		removeAllAggregation: function (oControl, sName) {
			//special handling without invalidation for customData
			if (sName === "customData") {
				oControl.removeAllAggregation(sName, /*bSuppressInvalidate=*/true);
				return Promise.resolve();
			}
			return this.findAggregation(oControl, sName)
				.then(function (oAggregation) {
					if (oAggregation) {
						oControl[oAggregation._sRemoveAllMutator]();
					}
				});
		},

		/**
		 * @inheritDoc
		 */
		getBindingTemplate: function (oControl, sAggregationName) {
			var oBinding = oControl.getBindingInfo(sAggregationName);
			return Promise.resolve(oBinding && oBinding.template);
		},

		/**
		 * @inheritDoc
		 */
		updateAggregation: function (oControl, sAggregationName) {
			return this.findAggregation(oControl, sAggregationName)
				.then(function (oAggregation) {
					if (oAggregation && oControl.getBinding(sAggregationName)) {
						oControl[oAggregation._sDestructor]();
						oControl.updateAggregation(sAggregationName);
					}
				});
		},

		/**
		 * @inheritDoc
		 */
		findIndexInParentAggregation: function(oControl) {
			var oParent = this.getParent(oControl);

			if (!oParent) {
				return Promise.resolve(-1);
			}

			return this.getParentAggregationName(oControl)
				.then(function (sParentAggregationName) {
					// we need all controls in the aggregation
					return this.getAggregation(oParent, sParentAggregationName);
				}.bind(this))
				.then(function (aControlsInAggregation) {
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
				});
		},

		/**
		 * @inheritDoc
		 */
		getParentAggregationName: function (oControl) {
			return Promise.resolve(oControl.sParentAggregationName);
		},

		/**
		 * @inheritDoc
		 */
		findAggregation: function(oControl, sAggregationName) {
			return new Promise(function (resolve, reject) {
				if (oControl) {
					if (oControl.getMetadata) {
						var oMetadata = oControl.getMetadata();
						var oAggregations = oMetadata.getAllAggregations();
						if (oAggregations) {
							resolve(oAggregations[sAggregationName]);
							return;
						}
					}
				}
				resolve();
			});
		},

		/**
		 * @inheritDoc
		 */
		validateType: function(oControl, oAggregationMetadata, oParent, sFragment) {
			var sTypeOrInterface = oAggregationMetadata.type;

			return this.getAggregation(oParent, oAggregationMetadata.name)
				.then(function (oAggregation) {
					// if aggregation is not multiple and already has element inside, then it is not valid for element
					if (oAggregationMetadata.multiple === false && oAggregation && oAggregation.length > 0) {
						return false;
					}
					return oControl.isA(sTypeOrInterface);
				});
		},

		/**
		 * @inheritDoc
		 */
		instantiateFragment: function(sFragment, sNamespace, oView) {
			var oFragment = XMLHelper.parse(sFragment);

			return this._checkAndPrefixIdsInFragment(oFragment, sNamespace)
				.then(function (oFragment) {
					return Fragment.load({
						definition: oFragment,
						sId: oView && oView.getId(),
						controller: oView.getController()
					});
				}).then(function(vNewControls) {
					if (vNewControls && !Array.isArray(vNewControls)) {
						vNewControls = [vNewControls];
					}
					return vNewControls || [];
				});
		},

		/**
		 * @inheritDoc
		 */
		templateControlFragment: function(sFragmentName, mPreprocessorSettings, oView) {
			return BaseTreeModifier._templateFragment(
				sFragmentName,
				mPreprocessorSettings
			).then(function(oFragment) {
				var oController = (oView && oView.getController()) || undefined;
				return Fragment.load({
					definition: oFragment,
					controller: oController
				});
			});
		},

		/**
		 * @inheritDoc
		 */
		destroy: function(oControl, bSuppressInvalidate) {
			oControl.destroy(bSuppressInvalidate);
		},

		_getFlexCustomData: function(oControl, sType) {
			var oCustomData = typeof oControl === "object"
				&& typeof oControl.data === "function"
				&& oControl.data("sap-ui-custom-settings");
			return ObjectPath.get(["sap.ui.fl", sType], oCustomData);
		},

		/**
		 * @inheritDoc
		 */
		attachEvent: function (oObject, sEventName, sFunctionPath, vData) {
			return new Promise(function (fnResolve, fnReject) {
				var fnCallback = ObjectPath.get(sFunctionPath);
				if (typeof fnCallback !== "function") {
					fnReject(new Error("Can't attach event because the event handler function is not found or not a function."));
				}
				fnResolve(oObject.attachEvent(sEventName, vData, fnCallback));
			});
		},

		/**
		 * @inheritDoc
		 */
		detachEvent: function (oObject, sEventName, sFunctionPath) {
			return new Promise(function (fnResolve, fnReject) {
				var fnCallback = ObjectPath.get(sFunctionPath);
				if (typeof fnCallback !== "function") {
					fnReject(new Error("Can't attach event because the event handler function is not found or not a function."));
				}
				// EventProvider.detachEvent doesn't accept vData parameter, therefore it might lead
				// to a situation when an incorrect event listener is detached.
				fnResolve(oObject.detachEvent(sEventName, fnCallback));
			});
		},

		/**
		 * @inheritDoc
		 */
		bindAggregation: function (oControl, sAggregationName, oBindingInfo) {
			return Promise.resolve(oControl.bindAggregation(sAggregationName, oBindingInfo));
		},

		/**
		 * @inheritDoc
		 */
		unbindAggregation: function (oControl, sAggregationName) {
			// bSuppressReset is not supported
			return Promise.resolve(oControl.unbindAggregation(sAggregationName));
		},

		/**
		 * @inheritDoc
		 */
		getExtensionPointInfo: function(sExtensionPointName, oView) {
			var oViewNode = (oView._xContent) ? oView._xContent : oView;
			return XmlTreeModifier.getExtensionPointInfo(sExtensionPointName, oViewNode)
				.then(function (oExtensionPointInfo) {
					if (oExtensionPointInfo) {
						// decrease the index by 1 to get the index of the extension point itself for js-case
						oExtensionPointInfo.index--;
						oExtensionPointInfo.parent = oExtensionPointInfo.parent && this._byId(oView.createId(oExtensionPointInfo.parent.getAttribute("id")));
						oExtensionPointInfo.defaultContent = oExtensionPointInfo.defaultContent
							.map(function (oNode) {
								var sId = oView.createId(oNode.getAttribute("id"));
								return this._byId(sId);
							}.bind(this))
							.filter(function (oControl) {
								return !!oControl;
							});
					}
					return oExtensionPointInfo;
				}.bind(this));
		}
	};

	return merge(
		{} /* target object, to avoid changing of original modifier */,
		BaseTreeModifier,
		JsControlTreeModifier
	);
},
/* bExport= */true);
