/*!
 * ${copyright}
 */

/**
 * This class is used in connection with FragmentControl
 *
 * CAUTION: naming, location and APIs of this entity will possibly change and should
 * therefore be considered experimental
 *
 * @private
 *
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', 'sap/ui/core/Control', 'sap/ui/core/Element'], function(jQuery, ManagedObject, Control, Element) {
    "use strict";

    var aControlledMethods = ["getParent", "setParent", "_getPropertiesToPropagate", "destroy"];

    /**
     * see e.g. LabelEnablement
     *
     * @private
     */
    function lazyInstanceof(o, sModule) {
        var FNClass = sap.ui.require(sModule);
        return typeof FNClass === 'function' && (o instanceof FNClass);
    }

    /**
     * Unregisters the special methods needed to proxy forwarding from the given element
     * @param oForwardedControl {sap.ui.core.Element} the forwarded instance to unregister
     *
     * @private
     */
    function unregisterForwardedElement(oForwardedControl) {
        if (oForwardedControl._mProxyMethods) {
            aControlledMethods.map(function(sMethod) {
                oForwardedControl[sMethod] = oForwardedControl._mProxyMethods[sMethod];
            });
            delete oForwardedControl._mProxyMethods;
        }
    }

    /**
     * Registers methods to forward a given control from a control root object to its current parent
     *
     * @param {sap.ui.core.Control} oRootControl the original parent of the control
     * @param {sap.ui.core.Control} oCurrentParent the current parent, where the forwarded element was added
     * @param {sap.ui.core.Control} oForwardedControl the forwarded control instance
     *
     * @private
     */
    function registerForwardedElement(oRootControl, oCurrentParent, oForwardedControl) {

        //store the original local methods
        if (!oForwardedControl._mProxyMethods) {
            oForwardedControl._mProxyMethods = {};
            aControlledMethods.map(function(sMethod) {
                oForwardedControl._mProxyMethods[sMethod] = oForwardedControl[sMethod];
            });
        }

        //overwriting the getParent to return the actual rendering parent
        //eventing will use this parent to bubble the event
        oForwardedControl.getParent = function() {
            return oCurrentParent;
        };

        //overwriting the setParent to remove the special handling
        oForwardedControl.setParent = function() {
            //removing special handling for Parent and APIParent and _propagation of controls
            unregisterForwardedElement(this);
            //call the reseted setParent
            return this.setParent.apply(this, arguments);
        };

        //special handling for destroy as managed object overwrites setParent of the original, reset all
        oForwardedControl.destroy = function() {
            unregisterForwardedElement(this);
            //call the reseted destroy
            this.destroy.apply(this, arguments);
        };

        //overwriting _getPropertiesToPropagate to return the model contect of the APIParent
        oForwardedControl._getPropertiesToPropagate = function() {
            //proxy should only propagate the models of its parent fragment control
            if (lazyInstanceof(oRootControl, "sap.ui.core.FragmentControl")) {
                return oRootControl._getPropertiesToPropagate();
            }
            return this.getParent()._getPropertiesToPropagate();
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
        //this is the managed object
        var oParent = this.getParent();
        if (oParent) {
            var sName = this.sParentAggregationName,
                oBinding = oParent.getBinding(sName),
                oAggregation = oParent.getMetadata().getAggregation(sName);
            if (!oAggregation || !oAggregation.multiple) {
                throw new Error("Cannot use FragmentControl proxy with single aggregations (=" + sName + " in parent " + oParent +  ") on lists");
            }
            if (oBinding) {
                //overwriting the getter for the aggregation of the parent instance to return the
                //instances from the corresponding fragement control aggregation
                //as the list binding uses filter and sort, the binding contexts are used here
                if (!oParent[oAggregation._sGetter].fnOriginalGetter) {
                    var fnOriginalGetter = oParent[oAggregation._sGetter];
                    oParent[oAggregation._sGetter] = function() {
                        var aResult = [];
                        if (oBinding) {
                            var aContexts = oBinding.getContexts();
                            for (var i = 0; i < aContexts.length; i++) {
                                var oObject = aContexts[i].getProperty();
                                registerForwardedElement(oBinding.getModel().getRootObject(), this, oObject);
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
     * FragmentProxy implementation that handles 0..1 and 0..n aggregation bindings in FragmentControls
     * Example:
     *   &lt;core:FragmentProxy ref="{$this>aggregatedText}" /&gt;
     *   &lt;my:List items="{$this>aggregatedItems}"&gt;
     *      &lt;core:FragmentProxy type="sap.ui.core.Item" /&gt;
     *   &lt;/my:List&gt;
     *
     * @author SAP SE
     * @version ${version}
     * @since 1.48.0
     * @alias sap.ui.core.FragmentProxy
     * @experimental
     * @private
     */
    var FragmentProxy = ManagedObject.extend("sap.ui.core.FragmentProxy", /* @lends sap.ui.core.FragmentProxy.prototype */ {
        constructor: function(sId, mSettings) {
            if (!mSettings) {
                mSettings = sId;
                sId = ManagedObject.getMetadata().uid();
            }
            if (mSettings.ref) {
                return new SingleFragmentProxy(sId, {
                    ref: mSettings.ref
                });
            } else {
                if (!mSettings.type) {
                    mSettings.type = "sap.ui.core.Control";
                }
                //find out the right type for the lists aggregation

                //
                // Notice: this only works if already loaded !
                //
                var FragmentProxyClass = sap.ui.require(jQuery.sap.getResourceName(mSettings.type, ""));
                if (!FragmentProxyClass) {
                    jQuery.sap.log.debug("The given proxy type " + mSettings.type + " is unknown. Using control instead.");
                    mSettings.type = "sap.ui.core.Control";
                    FragmentProxyClass = Control;
                }
                var oInstance = new (FragmentProxyClass)();
                if (!(oInstance instanceof Element)) {
                    jQuery.sap.log.error("The given type " + mSettings.type + " needs to derive from sap.ui.core.Element");
                    return null;
                }
                //This instance is used as an initial template to ensure the XMLTemplateProcessor creates the right template
                //The template is cloned once and added to the parent. After this has happened the model context change handler
                //chips in and overwrites the getter of the parents aggregation.
                //Currently there is no hook where the instance is set as a bindingInfo.template therefore it is not yet
                //possible to get a better implementation.
                //overwriting clone and return the outer instance is not possible as the clone has no parent information and the list binding context
                //is set separately after the instance is created.
                //TODO: detach the event from the instance, when?
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
     * Single FragmentProxy implementation that handles 0..1 aggregation bindings in FragmentControls
     * Example:
     *   &lt;core:FragmentProxy ref="{$this>aggregatedText}"&gt;&lt;/core:FragmentProxy&gt;
     * @private
     */
    var SingleFragmentProxy = Control.extend("sap.ui.core.SingleFragmentProxy", /* @lends sap.ui.core.SingleFragmentProxy.prototype */ {
        metadata: {
            aggregations: {
                ref: {
                    type: "sap.ui.core.Control",
                    multiple: true, // multiple so that we have eventing (no binding possible when multiple: false)
                    _doesNotRequireFactory: true
                }
            }

        },
        renderer: function(oRm, oControl) {
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
    SingleFragmentProxy.prototype.updateRef = function() {
        var oBinding = this.getBinding("ref");
        if (oBinding) {
            //get the original control from the binding
            // notice that oBinding.getModel() is a ManagedObjectModel
            var oContent = oBinding.getModel().getProperty(oBinding.getPath(), oBinding.getContext());
            if (Array.isArray(oContent)) {
                jQuery.sap.log.warning("Cannot add FragmentControl proxy with multiple aggregations");
                return;
            }
            if (oContent && !oContent._bIsBeingDestroyed) {
                registerForwardedElement(oBinding.getModel().getRootObject(), this.getParent(), oContent);
                if (oContent.getParent()) {
                    //single aggregation proxies need to invalidate the parent
                    oContent.getParent().invalidate();
                }
            }
            this._oContent = oContent;
        }
    };

    return FragmentProxy;

});
