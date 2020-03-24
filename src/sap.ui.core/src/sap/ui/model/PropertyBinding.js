/*!
 * ${copyright}
 */

// Provides an abstract property binding.
sap.ui.define([
	'./Binding',
	'./SimpleType',
	'./DataState',
	"sap/ui/base/SyncPromise",
	"sap/base/Log",
	"sap/base/assert"
],
	function(Binding, SimpleType, DataState, SyncPromise, Log, assert) {
	"use strict";

	/**
	 * Constructor for PropertyBinding
	 *
	 * @abstract
	 * @class
	 * The PropertyBinding is used to access single data values in the data model.
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {object} [mParameters]
	 *
	 * @public
	 * @alias sap.ui.model.PropertyBinding
	 * @extends sap.ui.model.Binding
	 */

	var PropertyBinding = Binding.extend("sap.ui.model.PropertyBinding", /** @lends sap.ui.model.PropertyBinding.prototype */ {

		constructor : function (oModel, sPath, oContext, mParameters) {
			Binding.apply(this, arguments);
		},
		metadata : {
			"abstract" : true,

		  publicMethods : [
			  "getValue", "setValue", "setType", "getType", "setFormatter", "getFormatter", "getExternalValue", "setExternalValue", "getBindingMode"
		  ]
		}

	});

	// the 'abstract methods' to be implemented by child classes
	/**
	 * Returns the current value of the bound target
	 *
	 * @function
	 * @name sap.ui.model.PropertyBinding.prototype.getValue
	 * @return {any} the current value of the bound target
	 *
	 * @public
	 */

	/**
	 * Sets the value for this binding. A model implementation should check if the current default binding mode permits
	 * setting the binding value and if so set the new value also in the model.
	 *
	 * @function
	 * @name sap.ui.model.PropertyBinding.prototype.setValue
	 * @param {any} vValue the value to set for this binding
	 *
	 * @public
	 */

	/**
	 * Returns a value, after it has formatted using the given function
	 *
	 * @param {function} fnFormat the function to format the value
	 *
	 * @private
	 */
	PropertyBinding.prototype._getBoundValue = function(fnFormat) {
		var vValue = this.getValue();
		return fnFormat(vValue);
	};

	/**
	 * Sets a value, after it has been parsed and validated using the given function
	 *
	 * @param {any} vValue the value to set for this binding
	 * @param {function} fnParse the function to parse the value
	 *
	 * @throws sap.ui.model.ParseException
	 * @throws sap.ui.model.ValidateException
	 *
	 * @private
	 */
	PropertyBinding.prototype._setBoundValue = function(vValue, fnParse) {
		var oDataState = this.getDataState(),
			that = this;

		if (this.oType) {
			return SyncPromise.resolve(vValue).then(function(vValue) {
				return fnParse(vValue);
			}).then(function(vValue) {
				return SyncPromise.all([vValue, that.oType.validateValue(vValue)]);
			}).then(function(aResult) {
				return aResult[0];
			}).then(function(vValue) {
				oDataState.setInvalidValue(undefined);
				that.setValue(vValue);
			}).catch(function(oException) {
				oDataState.setInvalidValue(vValue);
				that.checkDataState(); //data ui state is dirty inform the control
				throw oException;
			}).unwrap();
		} else {
			oDataState.setInvalidValue(undefined);
			that.setValue(vValue);
		}
	};

	/** Convert raw to external representation
	 *  @param vValue raw value
	 * 	@return external value
	 * 	@private
	 */
	PropertyBinding.prototype._rawToExternal = function(vValue) {
		if (this.oType) {
			vValue = this.oType.formatValue(vValue, this.sInternalType);
		}
		if (this.fnFormatter) {
			vValue = this.fnFormatter(vValue);
		}
		return vValue;
	};

	/** Convert external to raw representation
	 *  @param vValue external value
	 * 	@return raw value
	 * 	@private
	 */
	PropertyBinding.prototype._externalToRaw = function(vValue) {
		// formatter doesn't support two way binding
		if (this.oType) {
			vValue = this.oType.parseValue(vValue, this.sInternalType);
		}
		return vValue;
	};

	/** Convert raw to internal representation
	 *  @param vValue raw value
	 * 	@return internal value
	 * 	@private
	 */
	PropertyBinding.prototype._rawToInternal = function(vValue) {
		var oFormat;
		if (this.oType && vValue !== null && vValue !== undefined) {
			oFormat = this.oType.getModelFormat();
			assert(oFormat && typeof oFormat.parse === "function", "The input format of " + this.oType + " should be an object with the 'parse' method");
			vValue = oFormat.parse(vValue);
		}
		return vValue;
	};

	/** Convert internal to raw representation
	 *  @param vValue internal value
	 * 	@return raw value
	 * 	@private
	 */
	PropertyBinding.prototype._internalToRaw = function(vValue) {
		var oFormat;
		if (vValue !== null && vValue !== undefined) {
			oFormat = this.oType.getModelFormat();
			assert(oFormat && typeof oFormat.format === "function", "The model format of " + this.oType + " should be an object with the 'format' method");
			vValue = oFormat.format(vValue);
		}
		return vValue;
	};

	/**
	 * Returns the current external value of the bound target which is formatted via a type or formatter function.
	 *
	 * @throws sap.ui.model.FormatException
	 *
	 * @return {any} the current value of the bound target
	 *
	 * @public
	 */
	PropertyBinding.prototype.getExternalValue = function() {
		switch (this.sInternalType) {
			case "raw":
				return this.getRawValue();
			case "internal":
				return this.getInternalValue();
			default:
				return this._getBoundValue(this._rawToExternal.bind(this));
		}
	};

	/**
	 * Sets the value for this binding. The value is parsed and validated against its type and then set to the binding.
	 * A model implementation should check if the current default binding mode permits
	 * setting the binding value and if so set the new value also in the model.
	 *
	 * @param {any} vValue the value to set for this binding
	 * @return {undefined|Promise} a Promise in case asynchronous parsing/validation is done
	 * @throws sap.ui.model.ParseException
	 * @throws sap.ui.model.ValidateException
	 *
	 * @public
	 */
	PropertyBinding.prototype.setExternalValue = function(vValue) {
		switch (this.sInternalType) {
			case "raw":
				return this.setRawValue(vValue);
			case "internal":
				return this.setInternalValue(vValue);
			default:
				if (this.fnFormatter) {
					Log.warning("Tried to use twoway binding, but a formatter function is used");
					return;
				}
				return this._setBoundValue(vValue, this._externalToRaw.bind(this));
		}
	};

	/**
	 * Returns the related JavaScript primitive value of the bound target which is parsed by the {@link sap.ui.model.SimpleType#getModelFormat model format} of this binding's type.
	 * If this binding doesn't have a type, the original value which is stored in the model is returned.
	 *
	 * This method will be used when targetType if set to "internal" or it's included in a {@link sap.ui.model.CompositeBinding CompositeBinding} and the CompositeBinding needs to have the related
	 * JavaScript primitive values for its type or formatter.
	 *
	 * @return {any} the value which is parsed by the model format of the bound target or the original value in case of no type.
	 *
	 * @public
	 */
	PropertyBinding.prototype.getInternalValue = function() {
		return this._getBoundValue(this._rawToInternal.bind(this));
	};

	/**
	 * Sets the value for this binding with the related JavaScript primitive type. The value is formatted with the {@link sap.ui.model.SimpleType#getModelFormat model format} and validated against its type and then set to the model.
	 *
	 * @param {any} vValue the value to set for this binding
	 *
	 * @throws sap.ui.model.ValidateException
	 *
	 * @public
	 */
	PropertyBinding.prototype.setInternalValue = function(vValue) {
		return this._setBoundValue(vValue, this._internalToRaw.bind(this));
	};

	/**
	 * Returns the raw model value, as it exists in the model dataset
	 *
	 * This method will be used when targetType of a binding is set to "raw" or it's included in a {@link sap.ui.model.CompositeBinding CompositeBinding} and the CompositeBinding needs to have the related
	 * JavaScript primitive values for its type or formatter.
	 *
	 * @return {any} the value which is parsed by the model format of the bound target or the original value in case of no type.
	 *
	 * @public
	 */
	PropertyBinding.prototype.getRawValue = function() {
		return this._getBoundValue(function(vValue) {
			return vValue;
		});
	};

	/**
	 * Sets the value for this binding with the raw model value. This setter will perform type
	 * validation, in case a type is defined on the binding.
	 *
	 * @param {any} vValue the value to set for this binding
	 *
	 * @throws sap.ui.model.ValidateException
	 *
	 * @public
	 */
	PropertyBinding.prototype.setRawValue = function(vValue) {
		return this._setBoundValue(vValue, function(vValue) {
			return vValue;
		});
	};

	/**
	 * Sets the optional type and internal type for the binding. The type and internal type are used to do the parsing/formatting correctly.
	 * The internal type is the property type of the element which the value is formatted to.
	 *
	 * @param {sap.ui.model.Type} oType the type for the binding
	 * @param {string} sInternalType the internal type of the element property which this binding is bound against.
	 *
	 * @public
	 */
	PropertyBinding.prototype.setType = function(oType, sInternalType) {
		this.oType = oType;
		this.sInternalType = sInternalType;
	};

	/**
	 *  Returns the type if any for the binding.
	 *  @returns {sap.ui.model.Type} the binding type
	 *  @public
	 */
	PropertyBinding.prototype.getType = function() {
		return this.oType;
	};

	/**
	 * Sets the optional formatter function for the binding.

	 * @param {function} fnFormatter the formatter function for the binding
	 *
	 * @public
	 */
	PropertyBinding.prototype.setFormatter = function(fnFormatter) {
		this.fnFormatter = fnFormatter;
	};

	/**
	 *  Returns the formatter function
	 *  @returns {Function} the formatter function
	 *  @public
	 */
	PropertyBinding.prototype.getFormatter = function() {
		return this.fnFormatter;
	};

	/**
	 *  Returns the binding mode
	 *  @returns {sap.ui.model.BindingMode} the binding mode
	 *  @public
	 */
	PropertyBinding.prototype.getBindingMode = function() {
		return this.sMode;
	};

	/**
	 * Sets the binding mode
	 * @param {sap.ui.model.BindingMode} sBindingMode the binding mode
	 * @protected
	 */
	PropertyBinding.prototype.setBindingMode = function(sBindingMode) {
		this.sMode = sBindingMode;
	};

	/**
	 * Resumes the binding update. Change events will be fired again.
	 *
	 * When the binding is resumed and the control value was changed in the meantime, the control value will be set to the
	 * current value from the model and a change event will be fired.
	 * @public
	 */
	PropertyBinding.prototype.resume = function() {
		this.bSuspended = false;
		this.checkUpdate(true);
	};

	return PropertyBinding;

});