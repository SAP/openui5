/*!
 * ${copyright}
 */
/*eslint-disable max-len */
sap.ui.define([
	"sap/base/util/deepEqual",
	"sap/base/util/each",
	"sap/ui/base/Object",
	"sap/ui/core/message/Message"
], function(deepEqual, each, BaseObject, Message) {
	"use strict";

	/**
	 * @class
	 * Holds the status data of a binding.
	 * To react to changes of this status data, a control must implement the
	 * <code>refreshDataState</code> method, which is called with the name of the bound control
	 * property and the data state object as parameters.
	 * With the {@link #getChanges} method, the control can determine the changed properties
	 * and their old and new values.
	 * <pre>
	 *     // sample implementation to handle message changes
	 *     myControl.prototype.refreshDataState = function (sPropertyName, oDataState) {
	 *        oDataState.getMessages().forEach(function (oMessage) {
	 *            console.log(oMessage.getMessage());
	 *        }
	 *     }
	 *
	 *     // sample implementation to handle laundering state
	 *     myControl.prototype.refreshDataState = function (sPropertyName, oDataState) {
	 *        this.setBusy(oDataState.isLaundering());
	 *     }
	 *
	 *     // sample implementation to handle dirty state
	 *     myControl.prototype.refreshDataState = function (sPropertyName, oDataState) {
	 *        if (oDataState.isDirty()) {
	 *           console.log("Property " + sPropertyName + " of control " + this.getId()
	 *               + " is dirty");
	 *        }
	 *     }
	 * </pre>
	 *
	 * With the {@link #getProperty} method, the control can read a property of the data state.
	 * The properties are
	 * <ul>
	 *     <li><code>controlMessages</code> The {@link sap.ui.core.message.Message messages}
	 *         created from type validation or parse errors on user input for a property binding
	 *     <li><code>dirty</code> Whether the value was not yet confirmed by the server; use
	 *         {@link #isDirty} to read this property
	 *     <li><code>invalidValue</code> The control value that was rejected by type parsing or
	 *         validation on user input for a property binding
	 *     <li><code>laundering</code> Whether the value has been sent to the server but is not yet
	 *         confirmed
	 *     <li><code>messages</code> All messages of the data state
	 *     <li><code>modelMessages</code> The {@link sap.ui.core.message.Message messages}
	 *         available for the binding in its {@link sap.ui.model.Binding#getModel model}
	 *     <li><code>originalValue</code> The <em>original</em> value of a property binding in
	 *         {@link sap.ui.model.PropertyBinding#getExternalValue external representation}
	 *     <li><code>value</code> The value of a property binding in
	 *         {@link sap.ui.model.PropertyBinding#getExternalValue external representation}
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
		constructor : function () {
			this.mProperties = DataState.getInitialProperties();
			this.mChangedProperties = DataState.getInitialProperties();
			// parent data state is set by the CompositeDataState if this data state is part of a composite data state
			// this.oParentDataState = undefined;
		}
	});

	/**
	 * Sets the parent data state. If a parent data state is set, it is used to check whether the associated control is
	 * dirty.
	 * @param {sap.ui.model.DataState} oParentDataState The parent data state
	 *
	 * @private
	 * @see sap.ui.model.DataState#isControlDirty
	 */
	DataState.prototype.setParent = function(oParentDataState) {
		this.oParentDataState = oParentDataState;
	};

	/**
	 * Updates the given property with the given value.
	 *
	 * @param {string} sProperty - The property name
	 * @param {any} vValue - The new value
	 * @returns {this} <code>this</code> to allow method chaining
	 * @private
	 */
	DataState.prototype.setProperty = function(sProperty, vValue) {
		this.mChangedProperties[sProperty] = vValue;
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
	 * Returns an array of all model and control messages, regardless of whether they are old or
	 * new.
	 *
	 * @returns {sap.ui.core.message.Message[]} The array of all messages
	 *
	 * @public
	 * @since 1.98.0
	 */
	DataState.prototype.getAllMessages = function () {
	   var oResultSet = new Set();

	   this.getMessages().forEach(oResultSet.add.bind(oResultSet));
	   this._getOldMessages().forEach(oResultSet.add.bind(oResultSet));

	   return Array.from(oResultSet);
   };

	/**
	 * Returns the array of this data state's current messages combining the model and control
	 * messages. The array is sorted descendingly by message severity.
	 *
	 * @returns {sap.ui.core.message.Message[]} The sorted array of all messages
	 *
	 * @public
	 */
	DataState.prototype.getMessages = function () {
		return DataState.getMessagesForProperties(this.mChangedProperties);
	};

	/**
	 * Returns the array of this data state's old messages combining the model and control messages.
	 * The array is sorted descendingly by message severity.
	 *
	 * @returns {sap.ui.core.message.Message[]} The sorted array of all old messages
	 * @private
	 */
	DataState.prototype._getOldMessages = function() {
		return DataState.getMessagesForProperties(this.mProperties);
	};

	/**
	 * Returns the array of the messages in the given object combining the model and control
	 * messages. The array is sorted descendingly by message severity.
	 *
	 * @param {object} mProperties
	 *   Object with properties <code>controlMessages</code> and <code>modelMessages</code> which
	 *   are both arrays of <code>sap.ui.core.message.Message</code> objects
	 * @returns {sap.ui.core.message.Message[]} The sorted array of messages
	 * @private
	 */
	DataState.getMessagesForProperties = function (mProperties) {
		var aMessages = [],
			aControlMessages = mProperties.controlMessages,
			aModelMessages = mProperties.modelMessages;

		if (aModelMessages.length || aControlMessages.length) {
			aMessages = aMessages.concat(aControlMessages || [], aModelMessages || []);
			aMessages.sort(Message.compare);
		}
		return aMessages;
	};

	/**
	 * Sets an array of model state messages.
	 *
	 * @param {sap.ui.core.message.Message[]} [aMessages=[]] The model messages for this data state.
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	DataState.prototype.setModelMessages = function(aMessages) {
		this.mChangedProperties["modelMessages"] = aMessages || [];
		return this;
	};

	/**
	 * Returns the array of this data state's current model messages.
	 *
	 * @returns {sap.ui.core.message.Message[]} The array of messages of the model
	 *
	 * @public
	 */
	DataState.prototype.getModelMessages = function() {
		return this.getProperty("modelMessages");
	};

	/**
	 * Sets an array of control state messages.
	 *
	 * @param {sap.ui.core.message.Message[]} aMessages - The control messages
	 * @return {this} <code>this</code> to allow method chaining
	 * @protected
	 */
	DataState.prototype.setControlMessages = function(aMessages) {
		this.mChangedProperties["controlMessages"] = aMessages || [];
		return this;
	};

	/**
	 * Returns the array of this data state's current control messages.
	 *
	 * @returns {sap.ui.core.message.Message[]} The array of control messages
	 *
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
	 * Returns whether the data state is dirty in the UI control. A data state is dirty in the UI control if an entered
	 * value did not pass the type validation. If the data state is used by a composite data state, it is also checked
	 * whether the composite data state is dirty in the UI control.
	 *
	 * @returns {boolean} Whether the data state is dirty in the UI control
	 * @public
	 */
	DataState.prototype.isControlDirty = function () {
		return this.oParentDataState
			? this.oParentDataState.isControlDirty()
			: this.isControlDirtyInternal();
	};

	/**
	 * Returns whether the data state is dirty in the UI control. If the data state is used by a composite data state,
	 * the composite data state is not considered.
	 *
	 * @returns {boolean} Whether this data state is dirty in the UI control
	 * @private
	 */
	DataState.prototype.isControlDirtyInternal = function () {
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
	 * @returns {this} <code>this</code> to allow method chaining
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
	 * @returns {this} <code>this</code> to allow method chaining
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
	 * @returns {any|undefined} The value that was rejected or <code>undefined</code>
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
	 * @returns {this} <code>this</code> to allow method chaining
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
	 * @returns {this} <code>this</code> to allow method chaining
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

	/**
	 * Returns an object containing the data state properties with their initial value; each call
	 * to this method creates a new object.
	 *
	 * @returns {object} An object with the initial data state properties
	 * @private
	 */
	DataState.getInitialProperties = function () {
		return {
			controlMessages : [],
			dirty : false,
			internalValue : undefined,
			invalidValue : undefined,
			laundering : false,
			messages : [],
			modelMessages : [],
			originalInternalValue : undefined,
			originalValue : undefined,
			value : undefined
		};
	};

	/**
	 * Resets the data state properties to their initial value.
	 *
	 * @private
	 */
	DataState.prototype.reset = function () {
		this.mChangedProperties = DataState.getInitialProperties();
	};

	return DataState;
});