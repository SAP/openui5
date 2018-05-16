/*!
 * ${copyright}
 */

// Provides an abstract property binding.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/DataType', './BindingMode', './ChangeReason', './PropertyBinding', './CompositeType', './CompositeDataState'],
	function(jQuery, DataType, BindingMode, ChangeReason, PropertyBinding, CompositeType, CompositeDataState) {
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

		constructor : function (aBindings, bRawValues, bInternalValues) {
			PropertyBinding.apply(this, [null,""]);
			this.aBindings = aBindings;
			this.aValues = null;
			this.bRawValues = bRawValues;
			this.bPreventUpdate = false;
			this.bInternalValues = bInternalValues;
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
	 * @param {string} sInternalType the internal type of the element property which this binding is bound against.
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
			this.bInternalValues = this.oType.getUseInternalValues();

			if (this.bRawValues && this.bInternalValues) {
				throw new Error(this.oType + " has both 'bUseRawValues' & 'bUseInternalValues' set to true. Only one of them is allowed to be true");
			}
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
		if (this.bSuspended) {
			return;
		}
		jQuery.each(this.aBindings, function(i, oBinding) {
			oValue = aValues[i];
			if (oValue !== undefined) {
				oBinding.setValue(oValue);
			}
		});

		this.getDataState().setValue(this.getValue());
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

	CompositeBinding.prototype.getOriginalValue = function() {
		var aValues = [],
		oValue;

		jQuery.each(this.aBindings, function(i, oBinding) {
			oValue = oBinding.getDataState().getOriginalValue();
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
		var aValues, aCurrentValues,
			oInternalType = this.sInternalType && DataType.getType(this.sInternalType),
			that = this;

		// No twoway binding when using formatters
		if (this.fnFormatter) {
			jQuery.sap.log.warning("Tried to use twoway binding, but a formatter function is used");
			return;
		}

		var oDataState = this.getDataState();

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
				oDataState.setInvalidValue(oValue);
				this.checkDataState(); //data ui state is dirty inform the control
				throw oException;
			}
		} else if (Array.isArray(oValue) && oInternalType instanceof DataType && oInternalType.isArrayType()) {
			aValues = oValue;
		} else if (typeof oValue == "string") {
			// default: multiple values are split by space character together if no formatter or type specified
			aValues = oValue.split(" ");
		} else {
			aValues = [oValue];
		}

		if (this.bRawValues) {
			// When using raw values, also call validators of nested bindings
			try {
				this.aBindings.forEach(function(oBinding, i) {
					if (oBinding.oType) {
						oBinding.oType.validateValue(aValues[i]);
					}
				});
			} catch (oException) {
				oDataState.setInvalidValue(oValue);
				this.checkDataState(); //data ui state is dirty inform the control
				throw oException;
			}
			this.setValue(aValues);
		} else {
			jQuery.each(this.aBindings, function(i, oBinding) {
				oValue = aValues[i];
				if (oValue !== undefined) {
					if (that.bInternalValues) {
						oBinding.setInternalValue(oValue);
					} else {
						oBinding.setExternalValue(oValue);
					}
				}
			});
		}

		oDataState.setValue(this.getValue());
		oDataState.setInvalidValue(undefined);
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
			this.aBindings.forEach(function(oBinding) {
				aValues.push(this.bInternalValues ? oBinding.getInternalValue() : oBinding.getExternalValue());
			}.bind(this));
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
		var oValue,
			oInternalType = this.sInternalType && DataType.getType(this.sInternalType);
		if (this.fnFormatter) {
			oValue = this.fnFormatter.apply(this, aValues);
		} else if (this.oType) {
			oValue = this.oType.formatValue(aValues, this.sInternalType);
		} else if (oInternalType instanceof DataType && oInternalType.isArrayType()) {
			oValue = aValues;
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
			if (that.bSuspended) {
				return;
			}
			var oBinding = oEvent.getSource();
			if (oBinding.getBindingMode() == BindingMode.OneTime) {
				oBinding.detachChange(that.fChangeHandler);
			}
			/*bForceUpdate true gets lost (e.g. checkUpdate(true) on model); But if an embedded binding fires a change we could
			 * call checkUpdate(true) so we handle both cases: a value change of the binding and a checkUpdate(true)
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
	 * <code>sap.ui.model.CompositeBinding</code>. The AggregatedDataStateChange event is fired asynchronously, meaning
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
		if (!this.bSuspended) {
			this.checkUpdate(true);
		}
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
	 * Suspends the binding update. No change events will be fired.
	 *
	 * A refresh call with bForceUpdate set to true will also update the binding and fire a change in suspended mode.
	 * Special operations on bindings, which require updates to work properly (as paging or filtering in list bindings)
	 * will also update and cause a change event although the binding is suspended.
	 * @public
	 */
	CompositeBinding.prototype.suspend = function() {
		this.bSuspended = true;
		jQuery.each(this.aBindings, function(i, oBinding) {
			oBinding.suspend();
		});
	};

	/**
	 * Suspends the binding update. No change events will be fired.
	 *
	 * A refresh call with bForceUpdate set to true will also update the binding and fire a change in suspended mode.
	 * Special operations on bindings, which require updates to work properly (as paging or filtering in list bindings)
	 * will also update and cause a change event although the binding is suspended.
	 * @public
	 */
	CompositeBinding.prototype.resume = function() {
		jQuery.each(this.aBindings, function(i, oBinding) {
			oBinding.resume();
		});
		this.bSuspended = false;
		this.checkUpdate(true);
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} bForceupdate
	 *
	 */
	CompositeBinding.prototype.checkUpdate = function(bForceUpdate){
		var bChanged = false;
		if (this.bPreventUpdate || (this.bSuspended && !bForceUpdate)) {
			return;
		}
		var oDataState = this.getDataState();
		var aOriginalValues = this.getOriginalValue();
		if (bForceUpdate || !jQuery.sap.equal(aOriginalValues, this.aOriginalValues)) {
			this.aOriginalValues = aOriginalValues;
			oDataState.setOriginalValue(aOriginalValues);
			bChanged = true;
		}
		var aValues = this.getValue();
		if (!jQuery.sap.equal(aValues, this.aValues) || bForceUpdate) {// optimize for not firing the events when unneeded
			this.aValues = aValues;
			oDataState.setValue(aValues);
			this._fireChange({reason: ChangeReason.Change});
			bChanged = true;
		}
		if (bChanged) {
			this.checkDataState();
		}
	};

	return CompositeBinding;

});
