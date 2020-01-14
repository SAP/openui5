/*!
 * ${copyright}
 */

// Provides an abstract property binding.
sap.ui.define([
	'sap/ui/base/DataType',
	'./BindingMode',
	'./ChangeReason',
	'./PropertyBinding',
	'./CompositeType',
	'./CompositeDataState',
	"sap/ui/base/SyncPromise",
	"sap/base/util/deepEqual",
	"sap/base/assert",
	"sap/base/Log"
],
	function(
		DataType,
		BindingMode,
		ChangeReason,
		PropertyBinding,
		CompositeType,
		CompositeDataState,
		SyncPromise,
		deepEqual,
		assert,
		Log
	) {
	"use strict";


	/**
	 * Constructor for CompositeBinding.
	 *
	 * @class
	 * Combines multiple property bindings (called 'parts') into a single one.
	 *
	 * A <code>CompositeBinding</code> combines the values from all its binding parts (each an instance of
	 * <code>PropertyBinding</code>), either by calling a formatter function or by involving a
	 * {@link sap.ui.model.CompositeType composite type}. When a formatter function is used, then the
	 * composite binding is automatically limited to <code>OneWay</code> mode. When a type is used, the binding
	 * can also operate in <code>TwoWay</code> mode.
	 *
	 * Higher layers of the framework derive composite bindings from easy-to-write string representations
	 * (the following features require complex binding syntax, e.g. <code>data-sap-ui-bindingSyntax="complex"</code>):
	 *
	 * XML views, for example, convert attribute values with nested curly braces like
	 * <pre>
	 *   text="{fullname} &amp;lt;{email}&amp;gt;"
	 * </pre>
	 * into a composite binding with two parts (one property binding for property "fullname" and one for
	 * property "email") and with a generic formatter function that injects the values of the parts into
	 * the string literal "{0} &lt;{1}&gt;" accordingly.
	 *
	 * Similarly, {@link topic:daf6852a04b44d118963968a1239d2c0 expression bindings} are parsed and converted
	 * into composite bindings, too. The formatter function is created by the framework and executes the
	 * calculations as defined by the expression string, taking the values from the binding parts as input.
	 *
	 * <b>Note:</b> A nesting of composite bindings is currently not supported (albeit being helpful).
	 *
	 * @see {@link topic:a2fe8e763014477e87990ff50657a0d0}
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

	CompositeBinding.prototype.destroy = function() {
		PropertyBinding.prototype.destroy.apply(this);
		this.aBindings.forEach(function(oBinding) {
			oBinding.destroy();
		});
	};

	CompositeBinding.prototype.getPath = function() {
		assert(null, "Composite Binding has no path!");
		return null;
	};

	CompositeBinding.prototype.getModel = function() {
		assert(null, "Composite Binding has no model!");
		return null;
	};

	CompositeBinding.prototype.getContext = function() {
		assert(null, "Composite Binding has no context!");
		return null;
	};

	CompositeBinding.prototype.isResolved = function() {
		return this.aBindings.every(function(oBinding) {
			return oBinding.isResolved();
		});
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
		this.aBindings.forEach(function(oBinding) {
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
		if (this.bSuspended) {
			return;
		}
		this.aBindings.forEach(function(oBinding, i) {
			var oValue = aValues[i],
				sBindingMode = oBinding.getBindingMode();
			if (oValue !== undefined  && sBindingMode !== BindingMode.OneWay && sBindingMode !== BindingMode.OneTime) {
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
		return this.aBindings.map(function(oBinding) {
			return oBinding.getValue();
		});
	};

	CompositeBinding.prototype.getOriginalValue = function() {
		return this.aBindings.map(function(oBinding) {
			return oBinding.getDataState().getOriginalValue();
		});
	};

	/**
	 * Returns the current external value of the bound target which is formatted via a type or formatter function.
	 *
	 * @return {object} the current value of the bound target
	 *
	 * @throws {sap.ui.model.FormatException}
	 *
	 * @public
	 */
	CompositeBinding.prototype.getExternalValue = function() {
		var aValues = [],
			oInternalType,
			oValue;

		switch (this.sInternalType) {
			case "raw":
				return this.getRawValue();
			case "internal":
				return this.getInternalValue();
			default:
				oInternalType = this.sInternalType && DataType.getType(this.sInternalType);
				aValues = this.getCurrentValues();

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
		}
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
		var oInternalType, oDataState, vResult, pValues,
			that = this;

		if (this.sInternalType === "raw") {
			this.setRawValue(oValue);
			return;
		} else if (this.sInternalType === "internal") {
			this.setInternalValue(oValue);
			return;
		}

		oInternalType = this.sInternalType && DataType.getType(this.sInternalType);

		// No twoway binding when using formatters
		if (this.fnFormatter) {
			Log.warning("Tried to use twoway binding, but a formatter function is used");
			return;
		}

		oDataState = this.getDataState();

		if (this.oType) {
			pValues = SyncPromise.resolve().then(function() {
				var aCurrentValues;
				if (that.oType.getParseWithValues()) {
					aCurrentValues = that.getCurrentValues();
				}
				return that.oType.parseValue(oValue, that.sInternalType, aCurrentValues);
			}).then(function(aValues) {
				var aValidateValues = that.getValidateValues(aValues);
				return SyncPromise.all([aValues, that.oType.validateValue(aValidateValues)]);
			}).then(function(aResult) {
				return aResult[0];
			}).catch(function(oException) {
				oDataState.setInvalidValue(oValue);
				that.checkDataState(); //data ui state is dirty inform the control
				throw oException;
			});
		} else if (Array.isArray(oValue) && oInternalType instanceof DataType && oInternalType.isArrayType()) {
			pValues = SyncPromise.resolve(oValue);
		} else if (typeof oValue == "string") {
			// default: multiple values are split by space character together if no formatter or type specified
			pValues = SyncPromise.resolve(oValue.split(" "));
		} else {
			pValues = SyncPromise.resolve([oValue]);
		}

		vResult = pValues.then(function(aValues) {
			that.aBindings.forEach(function(oBinding, iIndex) {
				var sBindingMode = oBinding.getBindingMode();
				oValue = aValues[iIndex];
				// if a value is undefined skip the update of the nestend binding - this allows partial updates
				if (oValue !== undefined  && sBindingMode !== BindingMode.OneWay && sBindingMode !== BindingMode.OneTime) {
					if (that.bRawValues) {
						oBinding.setRawValue(oValue);
					} else if (that.bInternalValues) {
						oBinding.setInternalValue(oValue);
					} else {
						oBinding.setExternalValue(oValue);
					}
				}
			});
			oDataState.setValue(that.getValue());
			oDataState.setInvalidValue(undefined);
		});
		vResult.catch(function () {/*avoid "Uncaught (in promise)"*/});

		return vResult.unwrap();
	};

	/**
	 * Returns the current internal value of the bound target which is an array of the
	 * internal (JS native) values of nested bindings
	 *
	 * @return {array} the current values of the nested bindings
	 *
	 * @public
	 */
	CompositeBinding.prototype.getInternalValue = function() {
		return this.aBindings.map(function(oBinding) {
			return oBinding.getInternalValue();
		});
	};

	/**
	 * Sets the internal value of the bound target. Parameter must be an array of
	 * values matching the internal (JS native) types of nested bindings.
	 *
	 * @param {array} aValues the new values of the nested bindings
	 *
	 * @public
	 */
	CompositeBinding.prototype.setInternalValue = function(aValues) {
		var oDataState = this.getDataState(), pValues,
			that = this;

		if (this.oType) {
			pValues = SyncPromise.resolve(aValues).then(function(aValidateValues){
				if (!that.bInternalValues) {
					aValidateValues = that.aBindings.map(function(oBinding, i) {
						return oBinding._internalToRaw(aValidateValues[i]);
					});
					if (!that.bRawValues) {
						aValidateValues = that.aBindings.map(function(oBinding, i) {
							return oBinding._rawToExternal(aValidateValues[i]);
						});
					}
				}
				return that.oType.validateValue(aValidateValues);
			}).then(function() {
				return aValues;
			}).catch(function(oException) {
				oDataState.setInvalidValue(aValues);
				that.checkDataState(); //data ui state is dirty inform the control
				throw oException;
			});
		} else {
			pValues = SyncPromise.resolve(aValues);
		}

		return pValues.then(function() {
			that.aBindings.forEach(function(oBinding, iIndex) {
				var vValue = aValues[iIndex],
					sBindingMode = oBinding.getBindingMode();
				if (vValue !== undefined  && sBindingMode !== BindingMode.OneWay && sBindingMode !== BindingMode.OneTime) {
					oBinding.setInternalValue(vValue);
				}
			});
			oDataState.setValue(that.getValue());
			oDataState.setInvalidValue(undefined);
		}).unwrap();
	};

	/**
	 * Returns the current raw value of the bound target which is an array of the
	 * raw (model) values of nested bindings
	 *
	 * @return {array} the current values of the nested bindings
	 *
	 * @public
	 */
	CompositeBinding.prototype.getRawValue = function() {
		return this.aBindings.map(function(oBinding) {
			return oBinding.getRawValue();
		});
	};

	/**
	 * Sets the raw value of the bound target. Parameter must be an array of
	 * values matching the raw (model) types of nested bindings.
	 *
	 * @param {array} aValues the new values of the nested bindings
	 *
	 * @public
	 */
	CompositeBinding.prototype.setRawValue = function(aValues) {
		var oDataState = this.getDataState(), pValues,
			that = this;

		if (this.oType) {
			pValues = SyncPromise.resolve(aValues).then(function(aValidateValues){
				if (!that.bRawValues) {
					if (that.bInternalValues) {
						aValidateValues = that.aBindings.map(function(oBinding, i) {
							return oBinding._rawToInternal(aValidateValues[i]);
						});
					} else {
						aValidateValues = that.aBindings.map(function(oBinding, i) {
							return oBinding._rawToExternal(aValidateValues[i]);
						});
					}
				}
				return that.oType.validateValue(aValidateValues);
			}).then(function() {
				return aValues;
			}).catch(function(oException) {
				oDataState.setInvalidValue(aValues);
				that.checkDataState(); //data ui state is dirty inform the control
				throw oException;
			});
		} else {
			pValues = SyncPromise.resolve(aValues);
		}

		return pValues.then(function() {
			that.aBindings.forEach(function(oBinding, iIndex) {
				var vValue = aValues[iIndex],
					sBindingMode = oBinding.getBindingMode();
				if (vValue !== undefined && sBindingMode !== BindingMode.OneWay && sBindingMode !== BindingMode.OneTime) {
					oBinding.setRawValue(vValue);
				}
			});
			oDataState.setValue(that.getValue());
			oDataState.setInvalidValue(undefined);
		}).unwrap();
	};

	/**
	 * Returns an array with the current values as available in the bindings.
	 * Depending on the raw/internal value flags, this may return raw/internal values.
	 *
	 * @return {array} the values of all bindings
	 *
	 * @private
	 */
	CompositeBinding.prototype.getCurrentValues = function() {
		if (this.bRawValues) {
			return this.getRawValue();
		} else if (this.bInternalValues) {
			return this.getInternalValue();
		} else {
			return this.aBindings.map(function(oBinding) {
				return oBinding.getExternalValue();
			});
		}
	};

	/**
	 * Returns values to validate. In case the value array does contain undefined values
	 * they will be filled with actual data of nested bindings. This ensures the validate
	 * method always gets the full set of values to validate, even if partial updates are
	 * used.
	 *
	 * @return {array} Array of values used for validation
	 *
	 * @private
	 */
	CompositeBinding.prototype.getValidateValues = function(aValues) {
		var aCurrentValues, bPartialUpdate,
			aValidateValues = aValues;
		bPartialUpdate = this.aBindings.some(function(vPart, i) {
			return aValues[i] === undefined;
		});
		if (bPartialUpdate) {
			aCurrentValues = this.getCurrentValues();
			aValidateValues = aCurrentValues.map(function(vValue, i) {
				return aValues[i] === undefined ? vValue : aValues[i];
			});
		}
		return aValidateValues;
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
	 * Attaches event handler <code>fnFunction</code> to the <code>change</code> event of this
	 * <code>sap.ui.model.CompositeBinding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.CompositeBinding</code> itself.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] object on which to call the given function
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
			this.aBindings.forEach(function(oBinding) {
				oBinding.attachChange(that.fChangeHandler);
			});
		}
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the <code>change</code> event of this
	 * <code>sap.ui.model.CompositeBinding</code>.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] object on which to call the given function
	 * @protected
	 */
	CompositeBinding.prototype.detachChange = function(fnFunction, oListener) {
		var that = this;
		this.detachEvent("change", fnFunction, oListener);
		if (this.aBindings) {
			this.aBindings.forEach(function(oBinding) {
				oBinding.detachChange(that.fChangeHandler);
			});
		}
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the <code>DataStateChange</code> event of this
	 * <code>sap.ui.model.CompositeBinding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.CompositeBinding</code> itself.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] object on which to call the given function
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
			this.aBindings.forEach(function(oBinding) {
				oBinding.attachEvent("DataStateChange", that.fDataStateChangeHandler);
			});
		}
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the <code>DataStateChange</code> event of
	 * this <code>sap.ui.model.CompositeBinding</code>.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] object on which to call the given function
	 * @protected
	 */
	CompositeBinding.prototype.detachDataStateChange = function(fnFunction, oListener) {
		var that = this;
		this.detachEvent("DataStateChange", fnFunction, oListener);
		if (this.aBindings) {
			this.aBindings.forEach(function(oBinding) {
				oBinding.detachEvent("DataStateChange", that.fDataStateChangeHandler);
			});
		}
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the <code>AggregatedDataStateChange</code> event of this
	 * <code>sap.ui.model.CompositeBinding</code>.
	 *
	 * The <code>AggregatedDataStateChange</code> event is fired asynchronously, meaning that the <code>DataState</code>
	 * object given as parameter of the event contains all changes that were applied to the <code>DataState</code>
	 * in the running thread.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
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
			this.aBindings.forEach(function(oBinding) {
				oBinding.attachEvent("DataStateChange", that.fDataStateChangeHandler);
			});
		}
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the <code>AggregatedDataStateChange</code>
	 * event of this <code>sap.ui.model.CompositeBinding</code>.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] object on which to call the given function
	 * @protected
	 */
	CompositeBinding.prototype.detachAggregatedDataStateChange = function(fnFunction, oListener) {
		var that = this;
		this.detachEvent("AggregatedDataStateChange", fnFunction, oListener);
		if (this.aBindings) {
			this.aBindings.forEach(function(oBinding) {
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
		this.aBindings.forEach(function(oBinding) {
			bUpdateRequired = bUpdateRequired || oBinding.updateRequired(oModel);
		});
		return bUpdateRequired;
	};

	/**
	 * Initialize the binding. The method should be called when creating a binding.
	 * The default implementation calls checkUpdate(true).
	 * Prevent checkUpdate to be triggered while initializing nestend bindings, it is
	 * sufficient to call checkUpdate when all nested bindings are initialized.
	 *
	 * @protected
	 */
	CompositeBinding.prototype.initialize = function() {
		this.bPreventUpdate = true;
		if (this.aBindings) {
			this.aBindings.forEach(function(oBinding) {
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
		this.aBindings.forEach(function(oBinding) {
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
		this.aBindings.forEach(function(oBinding) {
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
		if (bForceUpdate || !deepEqual(aOriginalValues, this.aOriginalValues)) {
			this.aOriginalValues = aOriginalValues;
			oDataState.setOriginalValue(aOriginalValues);
			bChanged = true;
		}
		var aValues = this.getValue();
		if (!deepEqual(aValues, this.aValues) || bForceUpdate) {// optimize for not firing the events when unneeded
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