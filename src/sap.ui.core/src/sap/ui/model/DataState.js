/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/util/each", '../base/Object', "sap/base/util/deepEqual"], function(each, BaseObject, deepEqual) {
	"use strict";

	/**
	 * @class
	 * Provides and updates the status data of a binding.
	 * Depending on the model's state and control's state changes, the data state is used to propagate changes to a control.
	 * The control can react to these changes by implementing the <code>refreshDataState</code> method for the control.
	 * Here, the data state object is passed as second parameter.
	 *
	 * Using the {@link #getChanges} method, the control can determine the changed properties and their old and new values.
	 * <pre>
	 *     //sample implementation to handle message changes
	 *     myControl.prototype.refreshDataState = function(oDataState) {
	 *        var aMessages = oDataState.getChanges().messages;
	 *        if (aMessages) {
	 *            for (var i = 0; i &lt; aMessages.length; i++) {
	 *                console.log(aMessages.message);
	 *            }
	 *        }
	 *     }
	 *
	 *     //sample implementation to handle laundering state
	 *     myControl.prototype.refreshDataState = function(oDataState) {
	 *        var bLaundering = oDataState.getChanges().laundering || false;
	 *        this.setBusy(bLaundering);
	 *     }
	 *
	 *     //sample implementation to handle dirty state
	 *     myControl.prototype.refreshDataState = function(oDataState) {
	 *        if (oDataState.isDirty()) console.log("Control " + this.getId() + " is now dirty");
	 *     }
	 * </pre>
	 *
	 * Using the {@link #getProperty} method, the control can read the properties of the data state. The properties are
	 * <ul>
	 *     <li><code>value</code> The value formatted by the formatter of the binding
	 *     <li><code>originalValue</code> The original value of the model formatted by the formatter of the binding
	 *     <li><code>invalidValue</code> The control value that was tried to be applied to the model but was rejected by a type validation
	 *     <li><code>modelMessages</code> The messages that were applied to the binding by the <code>sap.ui.model.MessageModel</code>
	 *     <li><code>controlMessages</code> The messages that were applied due to type validation errors
	 *     <li><code>messages</code> All messages of the data state
	 *      <li><code>dirty</code> true if the value was not yet confirmed by the server
	 * </ul>
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.model.DataState
	 */
	var DataState = BaseObject.extend("sap.ui.model.DataState", /** @lends sap.ui.model.DataState.prototype */ {
		metadata : {},
		constructor : function() {
			this.mProperties = {
				modelMessages : [],
				controlMessages: [],
				laundering: false,
				originalValue : undefined,
				originalInternalValue: undefined,
				value : undefined,
				invalidValue: undefined,
				internalValue: undefined,
				dirty: false,
				messages: []

			};
			//the resolved path of the binding to check for binding context changes
			this.mChangedProperties = Object.assign({},this.mProperties);
		}
	});


	/**
	 * Sort messages by type 'Error', 'Warning', 'Success', 'Info'.
	 *
	 * @param {sap.ui.core.message.Message[]} aMessages - Array of messages
	 * @private
	 */
	DataState.prototype._sortMessages = function(aMessages) {
		var mSortOrder = {'Error': 0,'Warning':1,'Success':2,'Info':3};
		aMessages.sort(function(a, b){
			return mSortOrder[a.type] - mSortOrder[b.type];
		});
	};

	/**
	 * Updates the given property with the given value.
	 *
	 * @param {string} sProperty - The property name
	 * @param {any} vValue - The new value
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @private
	 */
	DataState.prototype.setProperty = function(sProperty, vValue) {
		this.mChangedProperties[sProperty] = vValue;
		return this;
	};

	/**
	 * @deprecated Likely unused method
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @private
	 */
	DataState.prototype.calculateChanges = function() {
		for (var sProperty in this.mChangedProperties) {
			var vChangedValue = this.mChangedProperties[sProperty].value;

			if (!deepEqual(this.mProperties[sProperty], vChangedValue)) {
				if (Array.isArray(vChangedValue)) {
					vChangedValue = vChangedValue.slice(0);
				}
				this.mProperties[sProperty] = vChangedValue;
			}
		}

		return this;
	};

	/**
	 * Returns the current value of the property
	 *
	 * @param {string} sProperty - The name of the property
	 * @returns {any} The value of the property
	 * @private
	 */
	DataState.prototype.getProperty = function(sProperty) {
		return this.mChangedProperties[sProperty];
	};

	/**
	 * Returns the array of all state messages combining the model and control messages.
	 *
	 * @returns {sap.ui.core.Message[]} The array of all messages
	 * @public
	 */
	DataState.prototype.getMessages = function() {
		var aMessages = [],
			aControlMessages = this.mChangedProperties['controlMessages'],
			aModelMessages = this.mChangedProperties['modelMessages'];

		if (aModelMessages || aControlMessages) {
			aMessages = aMessages.concat(aModelMessages ? aModelMessages : [],
				aControlMessages ? aControlMessages : []);
			this._sortMessages(aMessages);
		}
		return aMessages;
	};

	/**
	 * Returns the array of all old state messages combining the model and control messages.
	 *
	 * @returns {sap.ui.core.Message[]} The array of all old messages
	 * @private
	 */
	DataState.prototype._getOldMessages = function() {
		var aMessages = [],
			aControlMessages = this.mProperties['controlMessages'],
			aModelMessages = this.mProperties['modelMessages'];

		if (aModelMessages || aControlMessages) {
			aMessages = aMessages.concat(aModelMessages ? aModelMessages : [],
				aControlMessages ? aControlMessages : []);
			this._sortMessages(aMessages);
		}
		return aMessages;
	};

	/**
	 * Sets an array of model state messages.
	 *
	 * @param {sap.ui.core.Message[]} aMessages - The model messages for this data state.
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @public
	 */
	DataState.prototype.setModelMessages = function(aMessages) {
		this.mChangedProperties["modelMessages"] = aMessages || [];
		return this;
	};

	/**
	 * Returns the array of state messages of the model or undefined.
	 *
	 * @returns {sap.ui.core.Message[]} The array of messages of the model
	 * @public
	 */
	DataState.prototype.getModelMessages = function() {
		return this.getProperty("modelMessages");
	};

	/**
	 * Sets an array of control state messages.
	 *
	 * @param {sap.ui.core.Message[]} aMessages - The control messages
	 * @return {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @protected
	 */
	DataState.prototype.setControlMessages = function(aMessages) {
		this.mChangedProperties["controlMessages"] = aMessages || [];
		return this;
	};

	/**
	 * Returns the array of state messages of the control.
	 *
	 * @return {sap.ui.core.Message[]} The array of control messages
	 * @public
	 */
	DataState.prototype.getControlMessages = function() {
		return this.getProperty("controlMessages");
	};


	/**
	 * Returns whether the data state is dirty.
	 * A data state is dirty if the value was changed but is not yet confirmed by a server or the
	 * entered value did not yet pass the type validation.
	 *
	 * @returns {boolean} Whether the data state is dirty
	 * @public
	 */
	DataState.prototype.isDirty = function() {
		var vValue = this.mChangedProperties["value"],
			vOriginalValue = this.mChangedProperties["originalValue"];

		return this.isControlDirty() || !deepEqual(vValue, vOriginalValue);
	};

	/**
	 * Returns whether the data state is dirty in the UI control.
	 * A data state is dirty in the UI control if the entered value did not yet pass the type validation.
	 *
	 * @returns {boolean} Whether the the data state is dirty
	 * @public
	 */
	DataState.prototype.isControlDirty = function() {
		return this.mChangedProperties["invalidValue"] !== undefined;
	};

	/**
	 * Returns whether the data state is in laundering.
	 * If data is sent to the server, the data state becomes laundering until the
	 * data was accepted or rejected.
	 *
	 * @returns {boolean} Whether the data state is laundering
	 * @public
	 */
	 DataState.prototype.isLaundering = function() {
		return this.mChangedProperties["laundering"];
	};

	/**
	 * Sets the laundering state of the data state.
	 *
	 * @param {boolean} bLaundering Whether the state is laundering
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @protected
	 */
	DataState.prototype.setLaundering = function(bLaundering) {
		this.mChangedProperties["laundering"] = bLaundering;
		return this;
	};

	/**
	 * Returns the formatted value of the data state.
	 *
	 * @returns {any} The value of the data.
	 * @public
	 */
	DataState.prototype.getValue = function() {
		return this.getProperty("value");
	};

	/**
	 * Sets the formatted value of the data state,
	 *
	 * @param {any} vValue the value
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @protected
	 */
	DataState.prototype.setValue = function(vValue) {
		this.mChangedProperties["value"] = vValue;
		return this;
	};

	/**
	 * Returns the dirty value of a binding that was rejected by a type validation so that
	 * it could not be applied to the model. If the
	 * value was not rejected it returns <code>undefined</code>. In this case the current
	 * model value can be accessed using the {@link #getValue} method.
	 *
	 * @returns {any} The value that was rejected or <code>undefined</code>
	 * @public
	 */
	DataState.prototype.getInvalidValue = function() {
		return this.getProperty("invalidValue");
	};

	/**
	 * Sets the dirty value that was rejected by the type validation.
	 *
	 * @param {any} vInvalidValue The value that was rejected by the type validation or
	 *   <code>undefined</code> if the value was valid
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @protected
	 */
	DataState.prototype.setInvalidValue = function(vInvalidValue) {
		this.mChangedProperties["invalidValue"] = vInvalidValue;
		return this;
	};

	/**
	 * Returns the formatted original value of the data.
	 * The original value is the last confirmed value.
	 *
	 * @returns {any} The original confirmed value of the server
	 * @public
	 */
	DataState.prototype.getOriginalValue = function() {
		return this.getProperty("originalValue");
	};

	/**
	 * Sets the formatted original value of the data.
	 *
	 * @param {boolean} vOriginalValue The original value
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @protected
	 */
	DataState.prototype.setOriginalValue = function(vOriginalValue) {
		this.mChangedProperties["originalValue"] = vOriginalValue;
		return this;
	};

	/**
	 * Returns whether the data state is changed, or resets the data state in case the parameter
	 * <code>bNewState</code> is false; reset data state means that the data state properties
	 * are replaced with the changed properties.
	 * As long as there was no call to this method with <code>bNewState</code> set to false, the
	 * data state is dirty, and the corresponding binding will fire data state change events.
	 *
	 * @param {boolean} [bNewState] Whether the data state is to be reset
	 * @returns {boolean} Whether the data state was changed
	 * @protected
	 */
	DataState.prototype.changed = function(bNewState) {
		if (bNewState === false) {
			//clear the changed properties as changed was reset;
			this.mProperties = Object.assign({},this.mChangedProperties);
		}
		return !deepEqual(this.mChangedProperties,this.mProperties);
	};

	/**
	 * Returns the changes of the data state in a map that the control can use in the
	 * <code>refreshDataState</code> method.
	 * The changed property's name is the key in the map. Each element in the map contains an object
	 * with the properties <code>oldValue</code> with the old property value and <code>value</code>
	 * with the new value of the property. The map only contains the changed properties.
	 *
	 * @returns {object} The changed properties of the data state
	 * @public
	 */
	DataState.prototype.getChanges = function() {
		var mChanges = {},
			aMessages,
			aOldMessages;

		each(this.mChangedProperties,function(sProperty, vValue) {
			if (!deepEqual(this.mChangedProperties[sProperty],this.mProperties[sProperty])) {
				mChanges[sProperty] = {};
				mChanges[sProperty].value = this.mChangedProperties[sProperty];
				mChanges[sProperty].oldValue = this.mProperties[sProperty];
			}
		}.bind(this));

		aMessages = this.getMessages();
		aOldMessages = this._getOldMessages();
		if (aMessages.length > 0 || aOldMessages.length > 0) {
			mChanges["messages"] = {};
			mChanges["messages"].oldValue = aOldMessages;
			mChanges["messages"].value = aMessages;
		}

		return mChanges;
	};

	return DataState;
});