/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides an abstract property binding.
sap.ui.define([
	"./Binding",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/ChangeReason",
	"sap/base/Log",
	"sap/base/assert",
	"./SimpleType", // convenience dependency for legacy code that uses global names
	"./DataState" // convenience dependency for legacy code that uses global names
],
	function(Binding, SyncPromise, ChangeReason, Log, assert) {
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
			// The formatter providing the external representation of this binding's value
			this.fnFormatter = undefined;
			// The internal type of this binding, cf. #setType and
			// sap.ui.base.ManagedObject.PropertyBindingInfo.targetType
			this.sInternalType = undefined;
			// The binding's sap.ui.model.BindingMode, cf. #setBindingMode and
			// sap.ui.base.ManagedObject.PropertyBindingInfo.mode
			this.sMode = undefined;
			// The binding's sap.ui.model.SimpleType, cf. #setType
			this.oType = undefined;
		},
		metadata : {
			"abstract" : true
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
	 * Sets the value for this binding. A model implementation should check if the current default
	 * binding mode permits setting the binding value, and if so, set the new value in the model,
	 * too.
	 *
	 * @function
	 * @name sap.ui.model.PropertyBinding.prototype.setValue
	 * @param {any} vValue the value to set for this binding
	 *
	 * @public
	 */

	/**
	 * Returns a value formatted using the given function.
	 *
	 * @param {function} fnFormat The function to format the value
	 * @returns {any} The formatted value
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
	 * @param {any} vValue
	 *   The value to set for this binding
	 * @param {function} fnParse
	 *   The function to parse the value
	 * @param {sap.ui.model.Context} [oUpdateContext]
	 *   If given the value will be set for this context instead of the binding's context
	 * @returns {Promise|undefined}
	 *   In case of a type that parses or validates asynchronously, a promise that resolves with <code>undefined</code>
	 *   if the value is set or rejects with an <code>sap.ui.model.ParseException</code>,
	 *   an <code>sap.ui.model.ValidateException</code>, or an error if the value cannot be set because there is no
	 *   entry in the model data for the context to be updated; otherwise <code>undefined</code>.
	 *
	 * @throws {sap.ui.model.ParseException}
	 *   If the value cannot be parsed
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is invalid
	 *
	 * @private
	 */
	PropertyBinding.prototype._setBoundValue = function(vValue, fnParse, oUpdateContext) {
		var oDataState = this.getDataState(),
			that = this;

		if (this.oType) {
			oUpdateContext ||= this.getContext();
			return SyncPromise.resolve(vValue).then(function(vValue) {
				return fnParse(vValue);
			}).then(function(vValue) {
				return SyncPromise.all([vValue, that.oType.validateValue(vValue)]);
			}).then(function([vValue]) {
				if (that.getContext() !== oUpdateContext) {
					oUpdateContext.setProperty(that.sPath, vValue, /*sGroupId*/ undefined, /*bRetry*/ true);
					return; // Only store the value for the update context
				}
				oDataState.setInvalidValue(undefined);
				that.setValue(vValue);
			}).catch(function(oException) {
				if (that.getContext() === oUpdateContext) {
					oDataState.setInvalidValue(vValue);
					that.checkDataState(); //data ui state is dirty inform the control
				}
				throw oException;
			}).unwrap();
		}
		if (oUpdateContext) {
			oUpdateContext.setProperty(this.sPath, vValue);
		} else {
			oDataState.setInvalidValue(undefined);
			this.setValue(vValue);
		}

		return undefined;
	};

	/**
	 * Convert raw to external representation.
	 *
	 * @param {any} vValue Raw value
	 * @return {any} External value
	 * @private
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

	/**
	 * Convert external to raw representation.
	 *
	 * @param {any} vValue External value
	 * @return {any} Raw value
	 * @private
	 */
	PropertyBinding.prototype._externalToRaw = function(vValue) {
		// formatter doesn't support two way binding
		if (this.oType) {
			vValue = this.oType.parseValue(vValue, this.sInternalType);
		}
		return vValue;
	};

	/**
	 * Convert raw to internal representation.
	 *
	 * @param {any} vValue Raw value
	 * @return {any} Internal value
	 * @private
	 */
	PropertyBinding.prototype._rawToInternal = function(vValue) {
		if (this.oType && vValue !== null && vValue !== undefined) {
			return this.oType.getModelFormat().parse(vValue);
		}
		return vValue;
	};

	/**
	 * Convert internal to raw representation
	 * @param {any} vValue Internal value
	 * @return {any} Raw value
	 * @private
	 */
	PropertyBinding.prototype._internalToRaw = function(vValue) {
		if (vValue !== null && vValue !== undefined) {
			return this.oType.getModelFormat().format(vValue);
		}
		return vValue;
	};

	/**
	 * Returns the current external value of the bound target which is formatted via a type or
	 * formatter function.
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
	 * Sets the value for this binding. The value is parsed and validated against its type and then
	 * set to the binding. A model implementation should check if the current default binding mode
	 * permits setting the binding value, and if so, set the new value in the model, too.
	 *
	 * @param {any} vValue
	 *   The value to set for this binding
	 * @returns {undefined|Promise}
	 *   A promise in case of asynchronous type parsing or validation
	 *
	 * @throws {sap.ui.model.ParseException}
	 *   If the value cannot be parsed
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is invalid
	 *
	 * @public
	 */
	PropertyBinding.prototype.setExternalValue = function(vValue) {
		return this._setExternalValue(vValue);
	};

	/**
	 * Sets the value for this binding. The value is parsed and validated against its type and then
	 * set to the binding. A model implementation should check if the current default binding mode
	 * permits setting the binding value, and if so, set the new value in the model, too.
	 *
	 * @param {any} vValue
	 *   The value to set for this binding
	 * @param {sap.ui.model.Context} [oUpdateContext]
	 *   If given the value will be set for this context instead of the binding's context
	 * @returns {undefined|Promise}
	 *   A promise in case of asynchronous type parsing or validation
	 *
	 * @throws {sap.ui.model.ParseException}
	 *   If the value cannot be parsed
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is invalid
	 *
	 * @private
	 */
	PropertyBinding.prototype._setExternalValue = function(vValue, oUpdateContext) {
		switch (this.sInternalType) {
			case "raw":
				return this._setRawValue(vValue, oUpdateContext);
			case "internal":
				return this._setInternalValue(vValue, oUpdateContext);
			default:
				if (this.fnFormatter) {
					Log.warning("Tried to use twoway binding, but a formatter function is used");
					return undefined;
				}
				return this._setBoundValue(vValue, this._externalToRaw.bind(this), oUpdateContext);
		}
	};

	/**
	 * Returns the related JavaScript primitive value of the bound target which is parsed by the
	 * {@link sap.ui.model.SimpleType#getModelFormat model format} of this binding's type. If this
	 * binding doesn't have a type, the original value which is stored in the model is returned.
	 *
	 * This method will be used when targetType is set to "internal" or when it's included in a
	 * {@link sap.ui.model.CompositeBinding CompositeBinding} and the CompositeBinding needs to have
	 * the related JavaScript primitive values for its type or formatter.
	 *
	 * @return {any}
	 *   The value which is parsed by the model format of the bound target, or the original value in
	 *   case of no type.
	 *
	 * @public
	 */
	PropertyBinding.prototype.getInternalValue = function() {
		return this._getBoundValue(this._rawToInternal.bind(this));
	};

	/**
	 * Sets the value for this binding with the related JavaScript primitive type. The value is
	 * formatted with the {@link sap.ui.model.SimpleType#getModelFormat model format} and validated
	 * against its type and then set to the model.
	 *
	 * @param {any} vValue
	 *   The value to set for this binding
	 * @returns {Promise|undefined}
	 *   A promise in case of asynchronous type validation
	 *
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is invalid
	 *
	 * @public
	 */
	PropertyBinding.prototype.setInternalValue = function(vValue) {
		return this._setInternalValue(vValue);
	};

	/**
	 * Sets the value for this binding with the related JavaScript primitive type. The value is
	 * formatted with the {@link sap.ui.model.SimpleType#getModelFormat model format} and validated
	 * against its type and then set to the model.
	 *
	 * @param {any} vValue
	 *   The value to set for this binding
	 * @param {sap.ui.model.Context} [oUpdateContext]
	 *   If given the value will be set for this context instead of the binding's context
	 * @returns {Promise|undefined}
	 *   A promise in case of asynchronous type validation
	 *
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is invalid
	 *
	 * @private
	 */
	PropertyBinding.prototype._setInternalValue = function(vValue, oUpdateContext) {
		return this._setBoundValue(vValue, this._internalToRaw.bind(this), oUpdateContext);
	};

	/**
	 * Returns the raw model value, as it exists in the model dataset.
	 *
	 * This method will be used when targetType of a binding is set to "raw" or when it's include
	 * in a {@link sap.ui.model.CompositeBinding CompositeBinding} and the CompositeBinding needs to
	 * have the related JavaScript primitive values for its type or formatter.
	 *
	 * @return {any}
	 *   The value which is parsed by the model format of the bound target, or the original value in
	 *   case of no type.
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
	 * @param {any} vValue
	 *   The value to set for this binding
	 * @returns {Promise|undefined}
	 *   A promise in case of asynchronous type validation
	 *
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is invalid
	 *
	 * @public
	 */
	PropertyBinding.prototype.setRawValue = function(vValue) {
		return this._setRawValue(vValue);
	};

	/**
	 * Sets the value for this binding with the raw model value. This setter will perform type
	 * validation, in case a type is defined on the binding.
	 *
	 * @param {any} vValue
	 *   The value to set for this binding
	 * @param {sap.ui.model.Context} [oUpdateContext]
	 *   If given the value will be set for this context instead of the binding's context
	 * @returns {Promise|undefined}
	 *   A promise in case of asynchronous type validation
	 *
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is invalid
	 *
	 * @private
	 */
	PropertyBinding.prototype._setRawValue = function(vValue, oUpdateContext) {
		return this._setBoundValue(vValue, (vValue) => vValue, oUpdateContext);
	};

	/**
	 * Sets the optional type and internal type for the binding. The type and internal type are used
	 * to do the parsing/formatting correctly. The internal type is the property type of the element
	 * which the value is formatted to.
	 *
	 * @param {sap.ui.model.Type} oType
	 *   The type for the binding
	 * @param {string} sInternalType
	 *   The internal type of the element property which this binding is bound against.
	 *
	 * @public
	 */
	PropertyBinding.prototype.setType = function(oType, sInternalType) {
		const oOldType = this.oType;
		this.oType = oType;
		this.sInternalType = sInternalType;
		if (this.fnTypeChangedCallback && oType && oOldType !== oType) {
			this.fnTypeChangedCallback();
			this._fireChange({reason: ChangeReason.Change});
		}
	};

	/**
	 *  Returns the type (if any) for the binding.
	 *  @returns {sap.ui.model.Type} The binding type
	 *  @public
	 */
	PropertyBinding.prototype.getType = function() {
		return this.oType;
	};

	/**
	 * Sets the optional formatter function for the binding.
	 *
	 * @param {function} fnFormatter The formatter function for the binding
	 *
	 * @public
	 */
	PropertyBinding.prototype.setFormatter = function(fnFormatter) {
		this.fnFormatter = fnFormatter;
	};

	/**
	 *  Returns the formatter function.
	 *  @returns {Function} The formatter function
	 *  @public
	 */
	PropertyBinding.prototype.getFormatter = function() {
		return this.fnFormatter;
	};

	/**
	 *  Returns the binding mode.
	 *  @returns {sap.ui.model.BindingMode} The binding mode
	 *  @public
	 */
	PropertyBinding.prototype.getBindingMode = function() {
		return this.sMode;
	};

	/**
	 * Sets the binding mode.
	 * @param {sap.ui.model.BindingMode} sBindingMode The binding mode
	 * @protected
	 */
	PropertyBinding.prototype.setBindingMode = function(sBindingMode) {
		this.sMode = sBindingMode;
	};

	/**
	 * Sets the callback which is called when the type of the binding is changed, if not supplied a
	 * former callback is deregistered.
	 *
	 * @param {function} [fnTypeChangedCallback]
	 *   The function to be called, if this binding's type changes
	 */
	PropertyBinding.prototype.registerTypeChanged = function (fnTypeChangedCallback) {
		this.fnTypeChangedCallback = fnTypeChangedCallback;
	};

	/**
	 * Resumes the binding update. Change events will be fired again.
	 *
	 * When the binding is resumed and the control value was changed in the meantime, the control
	 * value will be set to the current value from the model and a change event will be fired.
	 * @public
	 */
	PropertyBinding.prototype.resume = function() {
		this.bSuspended = false;
		this.checkUpdate(true);
	};

	return PropertyBinding;

});