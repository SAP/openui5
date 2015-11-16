/*!
 * ${copyright}
 */

// Provides an abstract property binding.
sap.ui.define(['jquery.sap.global', './BindingMode', './ChangeReason', './PropertyBinding', './CompositeType', './CompositeDataState'],
	function(jQuery, BindingMode, ChangeReason, PropertyBinding, CompositeType, CompositeDataState) {
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
	 * @extends sap.ui.model.PropertyBinding
	 */
	
	var CompositeBinding = PropertyBinding.extend("sap.ui.model.CompositeBinding", /** @lends sap.ui.model.CompositeBinding.prototype */ {
	
		constructor : function (aBindings, bRawValues) {
			PropertyBinding.apply(this, [null,""]);
			this.aBindings = aBindings;
			this.aValues = null;
			this.bRawValues = bRawValues;
			this.bPreventUpdate = false;
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
		var bResolved = false;
		jQuery.each(this.aBindings, function(i, oBinding) {
			bResolved = oBinding.isResolved();
			if (!bResolved) {
				return false;
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
	 * sets the context for each property binding in this composite binding
	 * @param {object} oContext the new context for the bindings
	 */
	CompositeBinding.prototype.setContext = function(oContext) {
		jQuery.each(this.aBindings, function(i, oBinding){
			// null context could also be set
			if (!oContext || oBinding.updateRequired(oContext.getModel())) {
				oBinding.setContext(oContext);
			}
		});
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
			try {
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
				this.oType.validateValue(aValues);
			} catch (oException) {
				this.vInvalidValue = oValue;
				this.checkDataState(); //data ui state is dirty inform the control
				throw oException;
			}
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

		this.vInvalidValue = null;
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
	
	/**
	 * Returns the current external value of the given value which is formatted via a type or formatter function. 
	 *
	 * @param {any[]} aValues - An array of values that are formatted to one value
	 * @returns {any} the current value of the bound target
	 * @throws sap.ui.model.FormatException
	 * @private
	 */
	CompositeBinding.prototype._toExternalValue = function(aValues) {
		var oValue;
		if (this.fnFormatter) {
			oValue = this.fnFormatter.apply(this, aValues);
		} else if (this.oType) {
			oValue = this.oType.formatValue(aValues, this.sInternalType);
		} else if (aValues.length > 1) {
			// default: multiple values are joined together as space separated list if no formatter or type specified
			oValue = aValues.join(" ");
		} else {
			oValue = aValues[0];
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
	
	
	/**
	 * {@see sap.ui.model.Binding#hasValidation}
	 *
	 * @returns {boolean} Returns true if the binding throws a validation exception when an invalid value is set on it.
	 * @private
	 */
	CompositeBinding.prototype.hasValidation = function() {
		if (this.getType()) {
			// If the CompositeBinding has a type of its own, it always validates
			return true;
		}

		// If the one of the inner bindings has a type of its own the CompositeBinding validates
		var aBindings = this.getBindings();
		for (var i = 0; i < aBindings.length; ++i) {
			if (aBindings[i].hasValidation()) {
				return true;
			}
		}
		
		return false;
	};
		
	
	//Eventing and related
	/**
	* Attach event-handler <code>fnFunction</code> to the '_change' event of this <code>sap.ui.model.CompositeBinding</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	*/
	CompositeBinding.prototype.attachChange = function(fnFunction, oListener) {
		var that = this;
		this.fChangeHandler = function(oEvent) {
			var oBinding = oEvent.getSource();
			if (oBinding.getBindingMode() == BindingMode.OneTime) {
				oBinding.detachChange(that.fChangeHandler);
			}
			/*bForceUpdate true gets lost (e.g. checkupdate(true) on model); But if a embedded binding fires a change we could
			 * call checkupdate(true) so we handle both cases: a value change of the binding and a checkupdate(true)
			 */
			that.checkUpdate(true);
		};
		this.attachEvent("change", fnFunction, oListener);
		if (this.aBindings) {
			jQuery.each(this.aBindings, function(i,oBinding) {
				oBinding.attachChange(that.fChangeHandler);
			});
		}
	};
	
	/**
	* Detach event-handler <code>fnFunction</code> from the '_change' event of this <code>sap.ui.model.CompositeBinding</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	*/
	CompositeBinding.prototype.detachChange = function(fnFunction, oListener) {
		var that = this;
		this.detachEvent("change", fnFunction, oListener);
		if (this.aBindings) {
			jQuery.each(this.aBindings, function(i,oBinding) {
				oBinding.detachChange(that.fChangeHandler);
			});
		}
	};
	
	/**
	* Attach event-handler <code>fnFunction</code> to the 'DataStateChange' event of this <code>sap.ui.model.CompositeBinding</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	*/
	CompositeBinding.prototype.attachDataStateChange = function(fnFunction, oListener) {
		var that = this;
		this.fDataStateChangeHandler = function(oEvent) {
			var oBinding = oEvent.getSource();
			if (oBinding.getBindingMode() == BindingMode.OneTime) {
				oBinding.detachDataStateChange(that.fChangeHandler);
			}
			
			that.checkDataState();
		};
		this.attachEvent("DataStateChange", fnFunction, oListener);
		if (this.aBindings) {
			jQuery.each(this.aBindings, function(i,oBinding) {
				oBinding.attachEvent("DataStateChange", that.fDataStateChangeHandler);
			});
		}
	};

	/**
	* Detach event-handler <code>fnFunction</code> from the 'DataStateChange' event of this <code>sap.ui.model.CompositeBinding</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	*/
	CompositeBinding.prototype.detachDataStateChange = function(fnFunction, oListener) {
		var that = this;
		this.detachEvent("DataStateChange", fnFunction, oListener);
		if (this.aBindings) {
			jQuery.each(this.aBindings, function(i,oBinding) {
				oBinding.detachEvent("DataStateChange", that.fDataStateChangeHandler);
			});
		}
	};
	
	/**
	 * Attach event-handler <code>fnFunction</code> to the 'AggregatedDataStateChange' event of this 
	 * <code>sap.ui.model.CompositeBinding</code>. The CombinedDataStateChange event is fired asynchronously, meaning
	 * that the datastate object given as parameter of the event contains all changes that were applied to the datastate
	 * in the running thread. 
	 *
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 */
	CompositeBinding.prototype.attachAggregatedDataStateChange = function(fnFunction, oListener) {
		var that = this;
		
		if (!this.fDataStateChangeHandler) {
			this.fDataStateChangeHandler = function(oEvent) {
				var oBinding = oEvent.getSource();
				if (oBinding.getBindingMode() == BindingMode.OneTime) {
					oBinding.detachDataStateChange(that.fChangeHandler);
				}
				
				that.checkDataState();
			};
		}
		
		this.attachEvent("AggregatedDataStateChange", fnFunction, oListener);
		if (this.aBindings) {
			jQuery.each(this.aBindings, function(i,oBinding) {
				oBinding.attachEvent("DataStateChange", that.fDataStateChangeHandler);
			});
		}
	};

	/**
	* Detach event-handler <code>fnFunction</code> from the 'AggregatedDataStateChange' event of this <code>sap.ui.model.CompositeBinding</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	*/
	CompositeBinding.prototype.detachAggregatedDataStateChange = function(fnFunction, oListener) {
		var that = this;
		this.detachEvent("AggregatedDataStateChange", fnFunction, oListener);
		if (this.aBindings) {
			jQuery.each(this.aBindings, function(i,oBinding) {
				oBinding.detachEvent("DataStateChange", that.fDataStateChangeHandler);
			});
		}
	};
	
	
	/**
	 * Determines if the property bindings in the composite binding should be updated by calling updateRequired on all property bindings with the specified model.
	 * @param {object} oModel The model instance to compare against
	 * @returns {boolean} true if this binding should be updated
	 * @protected
	 */
	CompositeBinding.prototype.updateRequired = function(oModel) {
		var bUpdateRequired = false;
		jQuery.each(this.aBindings, function(i, oBinding){
			bUpdateRequired = bUpdateRequired || oBinding.updateRequired(oModel);
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
		if (this.aBindings) {
			jQuery.each(this.aBindings, function(i,oBinding) {
				oBinding.initialize();
			});
		}
		this.bPreventUpdate = false;
		this.checkUpdate(true);
		return this;
	};


	/**
	 * Returns the data state for this binding
	 * @return {sap.ui.model.CompositeDataState} the data state
	 */
	CompositeBinding.prototype.getDataState = function() {
		if (!this.oDataState) {
			this.oDataState = new CompositeDataState(this.aBindings.map(function(oBinding) { 
				return oBinding.getDataState();
			}));
		}
		return this.oDataState;
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
		var aValues = this.getValue();
		if (!jQuery.sap.equal(aValues, this.aValues) || bForceupdate) {// optimize for not firing the events when unneeded
			this.aValues = aValues;
			this._fireChange({reason: ChangeReason.Change});
		}
	};
	
	CompositeBinding.prototype._updateDataState = function() {
		var oDataState = PropertyBinding.prototype._updateDataState.apply(this, arguments);

		var mChanges = oDataState.getChanges();
		
		for (var sKey in mChanges) {
			switch (sKey) {
				case "value":
					oDataState.setValue(this._toExternalValue(mChanges[sKey]));
					break;

				case "originalValue":
					oDataState.setOriginalValue(this._toExternalValue(mChanges[sKey]));
					break;
						
				case "invalidValue":
				case "controlMessages":
				case "modelMessages":
				case "messages":
				case "dirty":
					// Ignore!!
					break;
					
				default:
					oDataState.setProperty(sKey, mChanges[sKey]);
					break;
			}
		}

		if (this.vInvalidValue) {
			oDataState.setInvalidValue(this.vInvalidValue);
		} else {
			var aInvalidValues = oDataState.getInternalProperty("invalidValue");
			if (aInvalidValues && containsValues(aInvalidValues)) {
				oDataState.setInvalidValue(this._toExternalValue(aInvalidValues));
			} else {
				oDataState.setInvalidValue(null);
			}
		}

		return oDataState;
	};
	
	
	/**
	 * Returns false if the given value is null, invalid or an array consisting entirely of null values
	 *
	 * @param {any} vValue - A value or an array of values
	 * @returns {boolean} Whether there were any non-falsy values in the given argument
	 * @private
	 */
	function containsValues(vValue) {
		if (Array.isArray(vValue)) {
			for (var i = 0; i < vValue.length; i++) {
				if (vValue[i] !== null && vValue[i] !== undefined) {
					return true;
				}
			}
			return false;
		} else {
			return !!vValue;
		}
		
	}
	
	
	return CompositeBinding;

});
