/*!
 * ${copyright}
 */

// Provides an abstract property binding.
sap.ui.define(['jquery.sap.global', './BindingMode', './ChangeReason', './PropertyBinding', './CompositeType', './DataState'],
	function(jQuery, BindingMode, ChangeReason, PropertyBinding, CompositeType, DataState) {
	"use strict";


	/**
	 * Constructor for CompositeBinding
	 *
	 * @class
	 * The CompositeBinding is used to bundle multiple property bindings which are be used to provide a single binding against
	 * these property bindings.
	 *
	 * @public
	 * @alias sap.ui.model.CompositeBinding
	 */
	
	var CompositeBinding = PropertyBinding.extend("sap.ui.model.CompositeBinding", /** @lends sap.ui.model.CompositeBinding.prototype */ {
	
		constructor : function (aBindings, bRawValues) {
			PropertyBinding.apply(this, [null,""]);
			this.aBindings = aBindings || [];
			this.aValues = null;
			this.bRawValues = bRawValues;
			this.bPreventUpdate = false;
			// bindings that needs ongoing checks for updates - resolved OneTime-bindings will get updated once via initialize()
			this.aUpdatableBindings = this.aBindings.filter(function (oBinding) {
				return oBinding.getBindingMode() !== BindingMode.OneTime || !oBinding.isResolved();
			});
		},
		metadata : {
			
		  publicMethods : [
				  "getBindings", "attachChange", "detachChange"
		  ]
		}
	
	});
	
	CompositeBinding.prototype.getPath = function() {
		jQuery.sap.assert(null, "Composite Binding has no path!");
		return null;
	};
	
	CompositeBinding.prototype.getModel = function() {
		jQuery.sap.assert(null, "Composite Binding has no model!");
		return null;
	};
	
	CompositeBinding.prototype.getContext = function() {
		jQuery.sap.assert(null, "Composite Binding has no context!");
		return null;
	};

	CompositeBinding.prototype.isResolved = function() {
		var bResolved = true;
		jQuery.each(this.aUpdatableBindings, function(i, oBinding) {
			if (!oBinding.isResolved()) {
				bResolved = false;
				return;
			}
		});
		return bResolved;
	};

	/**
	 * Sets the optional type and internal type for the binding. The type and internal type are used to do the parsing/formatting correctly.
	 * The internal type is the property type of the element which the value is formatted to.  
	 *
	 * @param {sap.ui.model.CompositeType} oType the type for the binding
	 * @param {String} sInternalType the internal type of the element property which this binding is bound against.
	 * 
	 * @public
	 */
	CompositeBinding.prototype.setType = function(oType, sInternalType) {
		if (oType && !(oType instanceof CompositeType)) {
			throw new Error("Only CompositeType can be used as type for composite bindings!");
		}
		PropertyBinding.prototype.setType.apply(this, arguments);
		
		// If a composite type is used, the type decides whether to use raw values or not
		if (this.oType) {
			this.bRawValues = this.oType.getUseRawValues();
		}
	};
	
	/**
	 * Sets the context for each property binding in this composite binding.
	 * 
	 * By setting the context, relative bindings can be resolved. In case they are in mode OneTime
	 * they are no longer updatable.
	 * 
	 * @param {object} oContext the new context for the bindings
	 * @param {object|undefined} [oModel] the model related to the context (in case the context is empty)
	 */
	CompositeBinding.prototype.setContext = function(oContext, oModel) {
		var bCheckUpdate = false,
			bDetachFromModel = !!oModel;

		for (var i = 0; i < this.aUpdatableBindings.length; ++i) {
			var oBinding = this.aUpdatableBindings[i];
			
			if (oBinding.updateRequired(oContext && oContext.getModel() || oModel)) {
				oBinding.setContext(oContext);
				bCheckUpdate = bCheckUpdate || oBinding.isRelative();

				// setting the context for an unresolved binding resolves it - OneTime bindings don't get further updates
				if (oBinding.getBindingMode() === BindingMode.OneTime && oBinding.isResolved()) {
					this.aUpdatableBindings.splice(i--, 1);
				} else {
					// current binding was affected and is no OneTime binding, therefore we cannot detach from model
					bDetachFromModel = false;
				}
			}
		}
		
		if (bDetachFromModel) {
			oModel.removeBinding(this);
		}
		
		if (bCheckUpdate) {
			this.checkUpdate();
		}
	};
	
	/**
	 * Sets the values. This will cause the setValue to be called for each nested binding, except
	 * for undefined values in the array.
	 *
	 * @param {array} aValues the values to set for this binding
	 *
	 * @public
	 */
	CompositeBinding.prototype.setValue = function(aValues) {
		var oValue;
		jQuery.each(this.aBindings, function(i, oBinding) {
			oValue = aValues[i];
			if (oValue !== undefined) {
				oBinding.setValue(oValue);
			}
		});
	};
	
	/**
	 * Returns the raw values of the property bindings in an array.
	 *
	 * @return {object} the values of the internal property bindings in an array
	 *
	 * @public
	 */
	CompositeBinding.prototype.getValue = function() {
		var aValues = [],
		oValue;
	
		jQuery.each(this.aBindings, function(i, oBinding) {
			oValue = oBinding.getValue();
			aValues.push(oValue);
		});
	
		return aValues;
	};

	/**
	 * Sets the external value of a composite binding. If no CompositeType is assigned to the binding, the default 
	 * implementation assumes a space separated list of values. This will cause the setValue to be called for each 
	 * nested binding, except for undefined values in the array.
	 *
	 * @param {object} oValue the value to set for this binding
	 *
	 * @public
	 */
	CompositeBinding.prototype.setExternalValue = function(oValue) {
		var aValues, aCurrentValues;
	
		// No twoway binding when using formatters
		if (this.fnFormatter) {
			jQuery.sap.log.warning("Tried to use twoway binding, but a formatter function is used");
			return;
		}
		if (this.oType) {
			if (this.oType.getParseWithValues()) {
				aCurrentValues = [];
				if (this.bRawValues) {
					aCurrentValues = this.getValue();
				} else {
					jQuery.each(this.aBindings, function(i, oBinding) {
						aCurrentValues.push(oBinding.getExternalValue());
					});
				}
			}
			aValues = this.oType.parseValue(oValue, this.sInternalType, aCurrentValues);
		} else {
			// default: multiple values are split by space character together if no formatter or type specified
			if (typeof oValue == "string") {
				aValues = oValue.split(" ");
			} else {
				aValues = [oValue];
			}
		}
		if (this.bRawValues) {
			this.setValue(aValues);
		} else {
			jQuery.each(this.aBindings, function(i, oBinding) {
				oValue = aValues[i];
				if (oValue !== undefined) {
					oBinding.setExternalValue(oValue);
				}
			});
		}
	};
	
	/**
	 * Returns the current external value of the bound target which is formatted via a type or formatter function. 
	 *
	 * @return {object} the current value of the bound target
	 *
	 *@throws sap.ui.model.FormatException
	 *
	 * @public
	 */
	CompositeBinding.prototype.getExternalValue = function() {
		var aValues = [];
		
		if (this.bRawValues) {
			aValues = this.getValue();
		} else {
			jQuery.each(this.aBindings, function(i, oBinding) {
				aValues.push(oBinding.getExternalValue());
			});
		}
		return this._toExternalValue(aValues);
	};
	
	CompositeBinding.prototype._toExternalValue = function(aValues) {
		var oValue;
		if (this.fnFormatter) {
			oValue = this.fnFormatter.apply(this, aValues);
		} else if (this.oType) {
			oValue = this.oType.formatValue(aValues, this.sInternalType);
		} else {
			if ( aValues.length > 1) {
				// default: multiple values are joined together as space separated list if no formatter or type specified
				oValue = aValues.join(" ");
			} else {
				oValue = aValues[0];
			}
		}
		
		return oValue;
	};
	
	
	/**
	 * Returns the property bindings contained in this composite binding.
	 *
	 * @return {array} the property bindings in this composite binding
	 *
	 * @public
	 */
	CompositeBinding.prototype.getBindings = function() {
		return this.aBindings;
	};
	
	//Eventing and related
	/**
	* Attach event-handler <code>fnFunction</code> to the '_change' event of this <code>sap.ui.model.Model</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	*/
	CompositeBinding.prototype.attachChange = function(fnFunction, oListener) {
		var that = this;
		if (!this.hasListeners("change")) {
			var aModels = [];
			jQuery.each(this.aUpdatableBindings, function(i, oBinding) {
				if (aModels.indexOf(oBinding.oModel) === -1) {
					oBinding.oModel.addBinding(that);
					aModels.push(oBinding.oModel);
				}
			});
		}
		this.attachEvent("change", fnFunction, oListener);

	};
	
	/**
	* Detach event-handler <code>fnFunction</code> from the '_change' event of this <code>sap.ui.model.Model</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	*/
	CompositeBinding.prototype.detachChange = function(fnFunction, oListener) {
		var that = this;
		this.detachEvent("change", fnFunction, oListener);
		if (!this.hasListeners("change")) {
			var aModels = [];
			// for detach we have to iterate over all bindings (not only updatable bindings) 
			jQuery.each(this.aBindings, function(i, oBinding) {
				if (aModels.indexOf(oBinding.oModel) === -1) {
					oBinding.oModel.removeBinding(that);
					aModels.push(oBinding.oModel);
				}
			});
		}
	};
	
	/**
	* Attach event-handler <code>fnFunction</code> to the 'messageChange' event of this <code>sap.ui.model.Model</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	*/
	CompositeBinding.prototype.attachDataStateChange = function(fnFunction, oListener) {
		var that = this;
		if (!this.hasListeners("DataStateChange")) {
			jQuery.each(this.aBindings, function(i, oBinding) {
				oBinding.attachDataStateChange(that.checkDataState, that);
			});
		}
		this.attachEvent("DataStateChange", fnFunction, oListener);
	};

	/**
	* Detach event-handler <code>fnFunction</code> from the 'messageChange' event of this <code>sap.ui.model.Model</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	*/
	CompositeBinding.prototype.detachDataStateChange = function(fnFunction, oListener) {
		var that = this;
		this.detachEvent("DataStateChange", fnFunction, oListener);
		if (!this.hasListeners("DataStateChange")) {
			jQuery.each(this.aBindings, function(i, oBinding) {
				oBinding.detachDataStateChange(that.checkDataState, that);
			});
		}
	};

	/**
	 * Determines if the property bindings in the composite binding should be updated by calling
	 * updateRequired on all property bindings with the specified model.
	 *
	 * @param {object} oModel The model instance to compare against
	 * @param {int|undefined} [iPartIndex] If set only part at provided index will be checked.
	 * @returns {boolean} true if this binding should be updated
	 * @protected
	 */
	CompositeBinding.prototype.updateRequired = function(oModel, iPartIndex) {
		if (iPartIndex !== undefined && iPartIndex !== null) {
			return this.aBindings[iPartIndex].updateRequired(oModel);
		}
		var bUpdateRequired = false;
		jQuery.each(this.aUpdatableBindings, function(i, oBinding) {
			if (oBinding.updateRequired(oModel)) {
				bUpdateRequired = true;
				return;
			}
		});
		return bUpdateRequired;
	};

	/**
	 * Initialize the binding. The message should be called when creating a binding.
	 * The default implementation calls checkUpdate(true).
	 * Prevent checkUpdate to be triggered while initializing nestend bindings, it is
	 * sufficient to call checkUpdate when all nested bindings are initialized.
	 *
	 * @protected
	 */
	CompositeBinding.prototype.initialize = function() {
		this.bPreventUpdate = true;
		jQuery.each(this.aBindings, function(i,oBinding) {
			oBinding.initialize();
		});
		this.bPreventUpdate = false;
		this.checkUpdate(true);
		return this;
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 * 
	 * @param {boolean} bForceupdate
	 * 
	 */
	CompositeBinding.prototype.checkUpdate = function(bForceupdate){
		if (this.bPreventUpdate) {
			return;
		}
		jQuery.each(this.aUpdatableBindings, function(i, oBinding) {
			oBinding.checkUpdate(bForceupdate);
		});
		var aValues = this.getValue();
		if (!jQuery.sap.equal(aValues, this.aValues) || bForceupdate) {// optimize for not firing the events when unneeded
			this.aValues = aValues;
			this._fireChange({reason: ChangeReason.Change});
		}
	};
	
	/**
	 * Checks whether an update of the data state of this binding is required.
	 * @private
	 */
	CompositeBinding.prototype._updateDataState = function() {
		var oDataState = PropertyBinding.prototype._updateDataState.call(this),
			aOriginalValues = [],
			aModelMessages = [],
			aControlMessages = [],
			that = this;
		jQuery.each(this.aBindings, function(i, oBinding) {
			var oInnerDataState = oBinding._updateDataState();
			if (that.bRawValues) {
				aOriginalValues.push(oInnerDataState.getOriginalValue());
			} else {
				aOriginalValues.push(oInnerDataState.getOriginalInternalValue());
			}
			if (oInnerDataState.getModelMessages()) {
				aModelMessages = aModelMessages.concat(oInnerDataState.getModelMessages());
			} 
			if (oInnerDataState.getControlMessages()) {
				aControlMessages = aControlMessages.concat();
			}
		});
		oDataState.setModelMessages(aModelMessages);
		oDataState.setControlMessages(aControlMessages);
		oDataState.setOriginalInternalValue(aOriginalValues);
		oDataState.setValue(this._toExternalValue(oDataState.getInternalValue()));
		oDataState.setOriginalValue(this._toExternalValue(aOriginalValues));
		return oDataState;
	};
	
	return CompositeBinding;

});
