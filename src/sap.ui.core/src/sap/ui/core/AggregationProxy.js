/*!
 * ${copyright}
 */

/**
 * This class is used in connection with XMLComposites and other composite controls using the ManagedObjectModel to forward aggregated controls to inner controls
 *
 * CAUTION: naming, location and APIs of this entity will possibly change and should
 * therefore be considered experimental
 *
 * @private
 *
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/base/ManagedObject', 'sap/ui/core/Control', 'sap/ui/core/Element'
], function (jQuery, ManagedObject, Control, Element) {
	"use strict";

	var aControlledMethods = ["getParent", "setParent", "_getPropertiesToPropagate", "destroy"];

	/**
	 * Unregisters the special methods needed to proxy forwarding from the given element
	 * @param {sap.ui.core.Element} oForwardedControl the forwarded instance to unregister
	 *
	 * @private
	 */
	function unregisterForwardedElement(oForwardedControl) {
		if (oForwardedControl._mProxyMethods) {
			aControlledMethods.map(function (sMethod) {
				oForwardedControl[sMethod] = oForwardedControl._mProxyMethods[sMethod];
			});
			delete oForwardedControl._mProxyMethods;
		}
	}

	/**
	 * Registers methods to forward a given control from a control root object to its current parent
	 *
	 * @param {sap.ui.core.Control} oNewParent the new (and current) parent, where the forwarded element was added
	 * @param {sap.ui.core.Control} oForwardedControl the forwarded control instance
	 *
	 * @private
	 */
	function registerForwardedElement(oNewParent, oForwardedControl) {
		// store the original local methods
		if (!oForwardedControl._mProxyMethods) {
			oForwardedControl._mProxyMethods = {};
			aControlledMethods.map(function (sMethod) {
				oForwardedControl._mProxyMethods[sMethod] = oForwardedControl[sMethod];
			});
		}

		// overwriting the getParent to return the actual rendering parent
		// eventing will use this parent to bubble the event
		oForwardedControl.getParent = function () {
			return oNewParent;
		};

		// overwriting the setParent to remove the special handling
		oForwardedControl.setParent = function () {
			// removing special handling for Parent and APIParent and _propagation of controls
			unregisterForwardedElement(this);
			// call the reseted setParent
			return this.setParent.apply(this, arguments);
		};

		// special handling for destroy as managed object overwrites setParent of the original, reset all
		oForwardedControl.destroy = function () {
			unregisterForwardedElement(this);
			// call the reseted destroy
			this.destroy.apply(this, arguments);
		};

		// overwriting _getPropertiesToPropagate to filter out specifics from oNewParent
		oForwardedControl._getPropertiesToPropagate = function () {

			var oProps = ManagedObject.prototype._getPropertiesToPropagate.apply(this, arguments);

			// Since oNewParent is intrinsic to the XMLComposite we
			// do not wish to propagate anything which is exclusive
			// to oNewParent (e.g. its ManagedObjectModel).
			// Therefore, we now manipulate oProps

			// === models ===
			var oOwnModelsOfNewParent = oNewParent.oModels;
			var oModelsToPropagate = {};
			var oModels = oProps.oModels;
			for (var oModelName in oModels) {
				if (!oModels.hasOwnProperty(oModelName)) {
					continue;
				}
				if (!oOwnModelsOfNewParent[oModelName]) {
					oModelsToPropagate[oModelName] = oModels[oModelName];
				}
			}
			oProps.oModels = oModelsToPropagate;

			// === bindingContexts ===
			var oBindingContextsToPropagate = {};
			//var oBindingContexts = oProps.oBindingContexts;
			for (var oModelName in oModelsToPropagate) {
				oBindingContextsToPropagate[oModelName] = oProps.oBindingContexts[oModelName];
			}
			oProps.oBindingContexts = oBindingContextsToPropagate;

			// TODO: should we do anything to the aPropagationListeners ?

			return oProps;
		};
	}

	/**
	 * Handler for the updateModelContext event of a parent control that contains forwarded controls in
	 * one of its aggregations. The method overwrites the getter for the aggregation and returns the collected
	 * result of a appropriate list binding.
	 *
	 * @private
	 */
	function updateModelContext() {
		// this is the managed object
		var oParent = this.getParent();
		if (oParent) {
			var sName = this.sParentAggregationName,
				oBinding = oParent.getBinding(sName),
				oAggregation = oParent.getMetadata().getAggregation(sName);
			if (!oAggregation || !oAggregation.multiple) {
				throw new Error("Cannot use AggregationProxy with single aggregations (=" + sName + " in parent " + oParent + ") on lists");
			}
			if (oBinding) {
				// overwriting the getter for the aggregation of the parent instance to return the
				// instances from the corresponding composite control aggregation
				// as the list binding uses filter and sort, the binding contexts are used here
				if (!oParent[oAggregation._sGetter].fnOriginalGetter) {
					var fnOriginalGetter = oParent[oAggregation._sGetter];
					oParent[oAggregation._sGetter] = function () {
						var aResult = [];
						if (oBinding) {
							var aContexts = oBinding.getContexts();
							for (var i = 0; i < aContexts.length; i++) {
								var oObject = aContexts[i].getProperty();
								if (!oObject.hasBeenForwardedTo) {
									oObject.hasBeenForwardedTo = {};
								}
								// notice that we allow for forwarding of a child to several parents
								// - we assume that the control oObject was last forwarded to is the
								// 'final' parent
								if (!oObject.hasBeenForwardedTo[this.getId()]) {
									registerForwardedElement(this, oObject);
									oObject.hasBeenForwardedTo[this.getId()] = true;
								}
								aResult.push(oObject);
							}

							this.mAggregations[oAggregation.name] = aResult;
						}
						return fnOriginalGetter.apply(this, []);
					};
					oParent[oAggregation._sGetter].fnOriginalGetter = fnOriginalGetter;
				}
			}
		}
	}

	/**
	 * AggregationProxy implementation that handles 0..1 and 0..n aggregation bindings
	 * Example:
	 *   &lt;core:AggregationProxy ref="{$this>aggregatedText}" /&gt
	 *   &lt;my:List items="{$this>aggregatedItems}"&gt
	 *      &lt;core:AggregationProxy type="sap.ui.core.Item" /&gt
	 *   &lt;/my:List&gt
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.50.0
	 * @alias sap.ui.core.AggregationProxy
	 * @experimental
	 * @private
	 */
	var AggregationProxy = ManagedObject.extend("sap.ui.core.AggregationProxy",
		/* @lends sap.ui.core.AggregationProxy.prototype */
		{
			constructor: function (sId, mSettings) {
				if (!mSettings && sId && typeof sId === "object") {
					mSettings = sId;
					sId = ManagedObject.getMetadata().uid();
				}
				mSettings = mSettings || {};
				if (mSettings.ref) {
					return new SingleAggregationProxy(sId, { ref: mSettings.ref });
				} else {
					if (!mSettings.type) {
						mSettings.type = "sap.ui.core.Control";
					}
					// find out the right type for the lists aggregation

					//
					// Notice: this only works if already loaded !
					//
					var AggregationProxyClass = sap.ui.require(jQuery.sap.getResourceName(mSettings.type, ""));
					if (!AggregationProxyClass) {
						jQuery.sap.log.debug("The given proxy type " + mSettings.type + " is unknown. Using control instead.");
						mSettings.type = "sap.ui.core.Control";
						AggregationProxyClass = Control;
					}
					var oInstance = new (AggregationProxyClass)();
					if (!(oInstance instanceof Element)) {
						jQuery.sap.log.error("The given type " + mSettings.type + " needs to derive from sap.ui.core.Element");
						return null;
					}
					// This instance is used as an initial template to ensure the XMLTemplateProcessor creates the right template
					// The template is cloned once and added to the parent. After this has happened the model context change handler
					// chips in and overwrites the getter of the parents aggregation.
					// Currently there is no hook where the instance is set as a bindingInfo.template therefore it is not yet
					// possible to get a better implementation.
					// overwriting clone and return the outer instance is not possible as the clone has no parent information and the list binding context
					// is set separately after the instance is created.
					// TODO: detach the event from the instance, when?
					oInstance.attachModelContextChange(updateModelContext);
					return oInstance;
				}
			},
			metadata: {
				properties: {
					type: {
						type: "string"
					}
				},
				aggregations: {
					ref: {
						type: "sap.ui.core.Control",
						multiple: true,
						_doesNotRequireFactory: true
					}
				}
			}
		});

	/**
	 * Single AggregationProxy implementation that handles 0..1 aggregation bindings in XMLComposites and other composite controls using the ManagedObjectModel to forward aggregated controls to inner controls
	 * Example:
	 *   &lt;core:AggregationProxy ref="{$this>aggregatedText}"&gt;&lt;/core:AggregationProxy&gt
	 * @private
	 */
	var SingleAggregationProxy = Control.extend("sap.ui.core.SingleAggregationProxy",
		/* @lends sap.ui.core.SingleAggregationProxy.prototype */
		{
			metadata: {
				aggregations: {
					ref: {
						type: "sap.ui.core.Control",
						multiple: true, // multiple so that we have eventing (no binding possible when multiple: false)
						_doesNotRequireFactory: true
					}
				}

			},
			renderer: function (oRm, oControl) {
				var oContent = oControl._oContent;
				if (oContent && oContent.getParent() === oControl.getParent()) {
					oRm.renderControl(oContent);
				}
			}
		});

	/**
	 * Update content of the proxy.
	 * Notice that we must overwrite this method since _doesNotRequireFactory: true
	 *
	 * @private
	 */
	SingleAggregationProxy.prototype.updateRef = function () {
		var oBinding = this.getBinding("ref");
		if (oBinding) {
			// get the original control from the binding
			// notice that oBinding.getModel() is a ManagedObjectModel
			var oContent = oBinding.getModel().getProperty(oBinding.getPath(), oBinding.getContext());
			if (Array.isArray(oContent)) {
				jQuery.sap.log.warning("Cannot add AggregationProxy with multiple aggregations");
				return;
			}
			if (oContent && !oContent._bIsBeingDestroyed) {
				registerForwardedElement(this.getParent(), oContent);
				if (oContent.getParent()) {
					// single aggregation proxies need to invalidate the parent
					oContent.getParent().invalidate();
				}
			}
			this._oContent = oContent;
		}
	};

	return AggregationProxy;
});
