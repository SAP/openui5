/*!
 * ${copyright}
 */

sap.ui.define([ 'jquery.sap.global', '../base/Object' ], function(jQuery, BaseObject) {
	"use strict";

	/**
	 * @class
	 * Provides and update the status data of a binding.
	 * Depending on the models state and controls state changes, the data state is used to propagated changes to a control.
	 * The control can react on these changes by implementing the <code>refreshDataState</code> method for the control.
	 * Here the the data state object is passed as a parameter.
	 *
	 * Using the {@link #getChanges getChanges} method the control can determine the changed properties and their old and new value.
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
	 * Using the {@link #getProperty getProperty} method the control can read the properties of the data state. The properties are
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
	 * @constructor
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
				originalValue : null,
				originalInternalValue: null,
				value : null,
				invalidValue: null,
				internalValue: null,
				dirty: false
			};
			//the resolved path of the binding to check for binding context changes
			this.mChangedProperties = {};
		}
	});


	/**
	 * sort messages by type 'Error', 'Warning', 'Success', 'Info'
	 *
	 * @param {array} aMessages Array of Messages: {'target':[array of Messages]}
	 * @private
	 */
	DataState.prototype._sortMessages = function(aMessages) {
		var mSortOrder = {'Error': 0,'Warning':1,'Success':2,'Info':3};
		aMessages.sort(function(a, b){
			return mSortOrder[a.type] - mSortOrder[b.type];
		});
	};

	/**
	 * Updates the given property variable
	 *
	 * @param {string} sProperty the member variable
	 * @param {any} vValue the new value;
	 * @private
	 */
	DataState.prototype.setProperty = function(sProperty, vValue) {
		if (sProperty === "modelMessages" || sProperty === "controlMessages") {
			vValue = vValue || [];
		}

		vValue = vValue === undefined ? null : vValue;

		if (jQuery.sap.equal(this.mProperties[sProperty], vValue)) {
			delete this.mChangedProperties[sProperty];
		} else {
			if (!this.mChangedProperties[sProperty]) {
				this.mChangedProperties[sProperty] = {};
			}

			this.mChangedProperties[sProperty] = {
				oldValue : jQuery.isArray(this.mProperties[sProperty]) ? this.mProperties[sProperty].slice(0) : this.mProperties[sProperty],
				value: vValue
			};
		}

		if (sProperty === "modelMessages" || sProperty === "controlMessages") {
			var aOldMessages = [].concat(this.mProperties["modelMessages"], this.mProperties["controlMessages"]);
			this._sortMessages(aOldMessages);
			this.mChangedProperties["messages"] = {
				oldValue : aOldMessages,
				value: this.getMessages().slice(0)
			};

			if (this.mChangedProperties["messages"].oldValue.length === 0 && this.mChangedProperties["messages"].value.length === 0) {
				delete this.mChangedProperties["messages"];
			}
		}

		if (this.isDirty() !== this.mProperties["dirty"]) {
			this.mChangedProperties.dirty = {
				oldValue: !this.isDirty(),
				value: this.isDirty()
			};
		} else {
			delete this.mChangedProperties.dirty;
		}

		return this;
	};

	DataState.prototype.calculateChanges = function() {
		for (var sProperty in this.mChangedProperties) {
			var vChangedValue = this.mChangedProperties[sProperty].value;

			if (!jQuery.sap.equal(this.mProperties[sProperty], vChangedValue)) {
				if (jQuery.isArray(vChangedValue)) {
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
	 * @param {string} the name of the property
	 * @returns {any} the vaue of the property
	 * @private
	 */
	DataState.prototype.getProperty = function(sProperty) {
		var vReturnValue;
		var vControlDirty;

		var fnGetCurrentValue = function(sName) {
			return ((this.mChangedProperties[sName] && "value" in this.mChangedProperties[sName]) ? this.mChangedProperties[sName].value : this.mProperties[sName]);
		}.bind(this);

		switch (sProperty) {
			case 'messages':
				var aMessages = [],
					aControlMessages = fnGetCurrentValue('controlMessages'),
					aModelMessages = fnGetCurrentValue('modelMessages');

				if (aModelMessages || aControlMessages) {
					aMessages = aMessages.concat(aModelMessages ? aModelMessages : [], aControlMessages ? aControlMessages : []);
					this._sortMessages(aMessages);
				}
				vReturnValue = aMessages; //combine all messages
				break;
			case 'controlDirty':
				vControlDirty = !!(this.mChangedProperties.invalidValue && this.mChangedProperties.invalidValue.value);
				vReturnValue = vControlDirty;
				break;
			case 'dirty':
				var vValue = this.mChangedProperties && this.mChangedProperties.value && ("value" in this.mChangedProperties.value) ? this.mChangedProperties.value.value : this.mProperties.value;
				var vOriginalValue = this.mChangedProperties && this.mChangedProperties.originalValue && ("value" in this.mChangedProperties.originalValue) ? this.mChangedProperties.originalValue.value : this.mProperties.originalValue;
				vControlDirty = !!(this.mChangedProperties.invalidValue && this.mChangedProperties.invalidValue.value);
				vReturnValue = vControlDirty || !jQuery.sap.equal(vValue, vOriginalValue);
				break;
			default:
				vReturnValue = fnGetCurrentValue(sProperty);
		}
		return vReturnValue;
	};

	/**
	 * Returns the array of all state messages or null.
	 * This combines the model and control messages.
	 *
	 * @returns {sap.ui.core.Message[]} the array of all messages or null if no {link:sap.ui.core.messages.ModelManager ModelManager} is used.
	 * @public
	 */
	DataState.prototype.getMessages = function() {
		return this.getProperty("messages");
	};

	/**
	 * Sets an array of model state messages.
	 *
	 * @param {array} the model messages for this data state.
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @public
	 */
	DataState.prototype.setModelMessages = function(aMessages) {
		return this.setProperty("modelMessages", aMessages);
	};

	/**
	 * Returns the array of state messages of the model or undefined
	 *
	 * @returns {sap.ui.core.Message[]} the array of messages of the model or null if no {link:sap.ui.core.messages.ModelManager ModelManager} is used.
	 * @public
	 */
	DataState.prototype.getModelMessages = function() {
		return this.getProperty("modelMessages");
	};

	/**
	 * Sets an array of control state messages.
	 *
	 * @param {sap.ui.core.Message[]} the control messages
	 * @return {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @protected
	 */
	DataState.prototype.setControlMessages = function(aMessages) {
		return this.setProperty("controlMessages", aMessages);
	};

	/**
	 * Returns the array of state messages of the control or undefined.
	 *
	 * @return {sap.ui.core.Message[]} the array of messages of the control or null if no {link:sap.ui.core.messages.ModelManager ModelManager} is used.
	 * @public
	 */
	DataState.prototype.getControlMessages = function() {
		return this.getProperty("controlMessages");
	};


	/**
	 * Returns whether the data state is dirty.
	 * A data state is dirty if the value was changed
	 * but is not yet confirmed by a server or the entered value did not yet pass the type validation.
	 *
	 * @returns {boolean} true if the data state is dirty
	 * @public
	 */
	DataState.prototype.isDirty = function() {
		return this.getProperty("dirty");
	};

	/**
	 * Returns whether the data state is dirty in the UI control.
	 * A data state is dirty in the UI control if the entered value did not yet pass the type validation.
	 *
	 * @returns {boolean} true if the data state is dirty
	 * @public
	 */
	DataState.prototype.isControlDirty = function() {
		return this.getProperty("controlDirty");
	};


	/**
	 * Returns whether the data state is in laundering.
	 * If data is send to the server the data state becomes laundering until the
	 * data was accepted or rejected.
	 *
	 * @returns {boolean} true if the data is laundering
	 * @public
	 */
	 DataState.prototype.isLaundering = function() {
		return this.getProperty("laundering");
	};

	/**
	 * Sets the laundering state of the data state.
	 *
	 * @param {boolean} bLaundering true if the state is laundering
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @protected
	 */
	DataState.prototype.setLaundering = function(bLaundering) {
		return this.setProperty("laundering",bLaundering);
	};

	/**
	 * Returns the formatted value of the data state.
	 *
	 * @returns {any} The value of the data.
	 * @public
	 */
	DataState.prototype.getValue = function(vValue) {
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
		return this.setProperty("value", vValue);
	};

	/**
	 * Returns the dirty value of a binding that was rejected by a type validation.
	 * This value was of an incorrect type and could not be applied to the model. If the
	 * value was not rejected it will return null. In this case the current
	 * model value can be accessed using the <code>getValue</code> method.
	 *
	 * @returns {any} the value that was rejected or null
	 * @public
	 */
	DataState.prototype.getInvalidValue = function() {
		return this.getProperty("invalidValue");
	};

	/**
	 * Sets the dirty value that was rejected by the type validation.
	 *
	 * @param {any} vInvalidValue the value that was rejected by the type validation or null if the value was valid
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @protected
	 */
	DataState.prototype.setInvalidValue = function(vInvalidValue) {
		return this.setProperty("invalidValue",vInvalidValue);
	};

	/**
	 * Returns the formatted original value of the data.
	 * The original value is the last confirmed value.
	 *
	 * @returns {any} the original confirmed value of the server
	 * @public
	 */
	DataState.prototype.getOriginalValue = function() {
		return this.getProperty("originalValue");
	};

	/**
	 * Sets the formatted original value of the data.
	 *
	 * @param {boolean} vOriginalValue the original value
	 * @returns {sap.ui.model.DataState} <code>this</code> to allow method chaining
	 * @protected
	 */
	DataState.prototype.setOriginalValue = function(vOriginalValue) {
		return this.setProperty("originalValue",vOriginalValue);
	};

	/**
	 * Returns or sets whether the data state is changed.
	 * As long as changed was not set to false the data state is dirty
	 * and the corresponding binding will fire data state change events.
	 *
	 * @param {boolean} [bNewState] the optional new state
	 * @returns {boolean} whether the data state was changed.
	 * @protected
	 */
	DataState.prototype.changed = function(bNewState) {
		if (bNewState === false) {
			//clear the changed properties as changed was reset;
			this.mChangedProperties = {};
		}
		return !jQuery.isEmptyObject(this.mChangedProperties);
	};

	/**
	 * Returns the changes of the data state in a map that the control can use in the
	 * <code>refreshDataState</code> method.
	 * The changed property's name is the key in the map. Each element in the map contains an object of below structure.
	 * <pre>
	 *    {
	 *        oldValue : The old value of the property,
	 *        value    : The new value of the property
	 *    }
	 * </pre>
	 * The map only contains the changed properties.
	 *
	 * @returns {map} the changed of the data state
	 * @public
	 */
	DataState.prototype.getChanges = function() {
		return this.mChangedProperties;
	};

	return DataState;
});
