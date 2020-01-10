/*!
 * ${copyright}
 */

sap.ui.define(['./DataState', "sap/base/util/deepEqual", "sap/base/util/each"], function(DataState, deepEqual, each) {
	"use strict";

	/**
	 * @class
	 * Provides and update the status data of a binding.
	 * Depending on the models state and controls state changes, the data state is used to propagated changes to a control.
	 * The control can react on these changes by implementing the <code>refreshDataState</code> method for the control.
	 * Here the data state object is passed as a parameter.
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
	 * @extends sap.ui.model.DataState
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.model.CompositeDataState
	 */
	var CompositeDataState = DataState.extend("sap.ui.model.CompositeDataState", /** @lends sap.ui.model.CompositeDataState.prototype */ {
		metadata : {},
		constructor : function(aDataStates) {
			DataState.apply(this, arguments);
			this.mProperties.originalValue = [];
			this.mProperties.originalInternalValue = [];
			this.mProperties.value = [];
			this.mProperties.invalidValue = undefined;
			this.mProperties.internalValue = [];

			this.mChangedProperties = Object.assign({},this.mProperties);

			this.aDataStates = aDataStates;
		}
	});

	/**
	 * Returns true if there are invalid values set on at least one of the inner datastates.
	 *
	 * @returns {boolean} Whether one of the inner datastates has an invalid value
	 *
	 * @private
	 */
	CompositeDataState.prototype._hasInnerInvalidValues = function() {
		return this.aDataStates.reduce(function(bIsInvalid, oDataState) {
			if (oDataState.getInvalidValue() !== undefined) {
				return true;
			} else {
				return bIsInvalid;
			}
		}, false);
	};

	/**
	 * Returns an array of values for the given property in the inner datastates.
	 *
	 * @param {string} sProperty The property name
	 * @returns {any[]} The array of property values in the inner datastates
	 *
	 * @protected
	 */
	CompositeDataState.prototype.getInternalProperty = function(sProperty) {
		var vReturnValue;
		if (sProperty === "invalidValue" && this._hasInnerInvalidValues()) {
			vReturnValue = this.aDataStates.map(function(oDataState) {
				return oDataState.getProperty("invalidValue") || oDataState.getProperty("value");
			});

		} else {
			vReturnValue = this.aDataStates.map(function(oDataState) {
				return oDataState.getProperty(sProperty);
			});
		}

		return vReturnValue;
	};

	/**
	 * Returns the current value of the given property.
	 *
	 * @param {string} sProperty The name of the property
	 * @returns {any} The value of the property
	 * @private
	 */
	CompositeDataState.prototype.getProperty = function(sProperty) {
		var vValue = DataState.prototype.getProperty.apply(this, arguments);
		var aInnerValues = this.getInternalProperty(sProperty);

		var vReturnValue;
		switch (sProperty) {
			case "modelMessages":
			case "controlMessages":
				vReturnValue = vValue;
				for (var i = 0; i < aInnerValues.length; ++i) {
					vReturnValue = vReturnValue.concat(aInnerValues[i]);
				}
				break;

			default:
				vReturnValue = aInnerValues || vValue;
		}

		return vReturnValue;
	};

	/**
	 * Returns the array of state messages of the model or undefined.
	 *
	 * @returns {sap.ui.core.Message[]} The array of messages of the model
	 * @public
	 */
	CompositeDataState.prototype.getModelMessages = function() {
		return this.getProperty("modelMessages");
	};

	/**
	 * Returns the array of state messages of the control.
	 *
	 * @return {sap.ui.core.Message[]} The array of control messages
	 * @public
	 */
	CompositeDataState.prototype.getControlMessages = function() {
		return this.getProperty("controlMessages");
	};

	/**
	 * Returns the array of all state messages combining the model and control messages.
	 *
	 * @returns {sap.ui.core.Message[]} The array of all messages
	 * @public
	 */
	CompositeDataState.prototype.getMessages = function() {
		return this.aDataStates.reduce(function(aMessages, oDataState) {
			return aMessages.concat(oDataState.getMessages());
		}, DataState.prototype.getMessages.apply(this, arguments));
	};

	/**
	 * Check if an Array contains values
	 *
	 * @param {array} vValue Array for check
	 * @returns {boolean} bContains Containing inner values
	 * @private
	 */
	CompositeDataState.prototype.containsValues = function(vValue) {
		if (Array.isArray(vValue)) {
			for (var i = 0; i < vValue.length; i++) {
				if (vValue[i] !== undefined) {
					return true;
				}
			}
			return false;
		} else {
			return !!vValue;
		}
	};

	/**
	 * Returns whether the data state is dirty.
	 * A data state is dirty if the value was changed
	 * but is not yet confirmed by a server or the entered value did not yet pass the type validation.
	 *
	 * @returns {boolean} Whether the data state is dirty
	 * @public
	 */
	CompositeDataState.prototype.isDirty = function() {
		return this.aDataStates.reduce(function(bIsInvalid, oDataState) {
			if (oDataState.isDirty()) {
				return true;
			} else {
				return bIsInvalid;
			}
		}, DataState.prototype.isDirty.apply(this, arguments));
	};

	/**
	 * Returns whether the data state is dirty in the UI control.
	 * A data state is dirty in the UI control if the entered value did not yet pass the type validation.
	 *
	 * @returns {boolean} Whether the control data state is dirty
	 * @public
	 */
	CompositeDataState.prototype.isControlDirty = function() {
		return this.aDataStates.reduce(function(bIsInvalid, oDataState) {
			if (oDataState.isControlDirty()) {
				return true;
			} else {
				return bIsInvalid;
			}
		}, DataState.prototype.isControlDirty.apply(this, arguments));
	};

	/**
	 * Returns whether the data state is in laundering.
	 * If data is send to the server the data state becomes laundering until the
	 * data was accepted or rejected.
	 *
	 * @returns {boolean} Whether the data state is laundering
	 * @public
	 */
	CompositeDataState.prototype.isLaundering = function() {
		return this.aDataStates.reduce(function(bIsInvalid, oDataState) {
			if (oDataState.isLaundering()) {
				return true;
			} else {
				return bIsInvalid;
			}
		}, DataState.prototype.isLaundering.apply(this, arguments));
	};

	/**
	 * Returns the dirty value of a binding that was rejected by a type validation.
	 * This value was of an incorrect type and could not be applied to the model. If the
	 * value was not rejected it will return null. In this case the current
	 * model value can be accessed using the <code>getValue</code> method.
	 *
	 * @returns {any} The value that was rejected
	 * @public
	 */
	CompositeDataState.prototype.getInvalidValue = function() {
		var vValue = this.mChangedProperties["invalidValue"];
		var aInvalidValues = this.getInternalProperty("invalidValue");
		if (aInvalidValues && this.containsValues(aInvalidValues)) {
			vValue = aInvalidValues;
			this.setInvalidValue(aInvalidValues);
		}
		return vValue;
	};
	/**
	 * Returns or sets whether the data state is changed.
	 * As long as changed was not set to false the data state is dirty
	 * and the corresponding binding will fire data state change events.
	 *
	 * @param {boolean} [bNewState] the optional new state
	 * @returns {boolean} Whether the data state was changed.
	 * @protected
	 */
	CompositeDataState.prototype.changed = function(bNewState) {
		if (bNewState === false) {
			//clear the changed properties as changed was reset;
			this.mProperties = Object.assign({},this.mChangedProperties);

			this.aDataStates.forEach(function(oDataState) {
				oDataState.changed(false);
			});

		}

		return this.aDataStates.reduce(function(bLastChanged, oDataState) {
			if (bLastChanged) {
				return true;
			} else {
				return oDataState.changed();
			}
		}, !deepEqual(this.mProperties, this.mChangedProperties));
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
	 * @returns {Object<string,{oldValue:any,value:any}>} the changed of the data state
	 * @public
	 */
	CompositeDataState.prototype.getChanges = function() {
		var mChangedProperties = {};

		var i, sKey, mChanges;

		var aInnerChanges = [];
		for (i = 0; i < this.aDataStates.length; ++i) {
			mChanges = this.aDataStates[i].getChanges();

			for (sKey in mChanges) {
				mChangedProperties[sKey] = [];
			}
			aInnerChanges.push(mChanges);
		}

		var bHasInvalidValue = this._hasInnerInvalidValues();

		var mAllChanges = {};
		for (sKey in mChangedProperties) {
			for (i = 0; i < aInnerChanges.length; ++i) {
				mChanges = aInnerChanges[i][sKey];

				if (!mAllChanges[sKey]) {
					mAllChanges[sKey] = [];
				}
				if (mChanges) {
					// There were inner changes for this property, use change values
					mAllChanges[sKey].push(mChanges.value);
				} else {
					// There were no inner changes for this DataState, use current value for old and new values
					var vValue = this.aDataStates[i].getProperty(sKey);
					if (sKey === "invalidValue" && bHasInvalidValue && !vValue) {
						vValue = this.aDataStates[i].getProperty("value");
					}

					mAllChanges[sKey].push(vValue);
				}
			}
		}

		each(this.mChangedProperties,function(sProperty, vValue) {
			if (this.mChangedProperties[sProperty] &&
					!deepEqual(this.mChangedProperties[sProperty],this.mProperties[sProperty])) {
				mAllChanges[sProperty] = {};
				mAllChanges[sProperty].value = this.mChangedProperties[sProperty];
				mAllChanges[sProperty].oldValue = this.mProperties[sProperty];
			}
		}.bind(this));
		var aMessages = this.getMessages();
		var aOldMessages = this._getOldMessages();
		if (aMessages.length > 0 || aOldMessages.length > 0) {
			mAllChanges["messages"] = {};
			mAllChanges["messages"].oldValue = aOldMessages;
			mAllChanges["messages"].value = aMessages;
		}
		return mAllChanges;
	};

	return CompositeDataState;
});