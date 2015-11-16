/*!
 * ${copyright}
 */

sap.ui.define([ 'jquery.sap.global', './DataState' ], function(jQuery, DataState) {
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
	 *            for (var i=0;i<aMessages.length;i++) {
	 *                console.log(aMessages.message);
	 *            }
	 *        }
	 *        
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
	 * @constructor
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
			this.mProperties.invalidValue = null;
			this.mProperties.internalValue = [];
			
			this.aDataStates = aDataStates;
		}
	});
	
	/**
	 * Returns true if there invalid values set on at least one of the inner datastates
	 *
	 * @private
	 */
	CompositeDataState.prototype._hasInnerInvalidValues = function() {
		return this.aDataStates.reduce(function(bIsInvalid, oDataState) {
			if (oDataState.getInvalidValue() !== null) {
				return true;
			} else {
				return bIsInvalid;
			}
		}, false);
	};
	
	/**
	 * Returns an array of the properties set on the inner datastates
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
	 * Returns the current value of the property
	 * 
	 * @param {string} the name of the property
	 * @returns {any} the vaue of the property
	 * @private
	 */
	CompositeDataState.prototype.getProperty = function(sProperty) {
		var vValue = DataState.prototype.getProperty.apply(this, arguments);
		var aInnerValues = this.getInternalProperty(sProperty);
		
		var vReturnValue;
		switch (sProperty) {
			case "messages":
			case "modelMessages":
			case "controlMessages":
				vReturnValue = vValue;
				for (var i = 0; i < aInnerValues.length; ++i) {
					vReturnValue = vReturnValue.concat(aInnerValues[i]);
				}
				break;
				
			default:
				vReturnValue = vValue;
		}
		
		return vReturnValue;
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
	CompositeDataState.prototype.changed = function(bNewState) {
		if (bNewState === false) {
			//clear the changed properties as changed was reset;
			this.mChangedProperties = {};
		}
		
		return this.aDataStates.reduce(function(bLastChanged, oDataState) {
			if (bLastChanged) {
				return true;
			} else {
				return oDataState.changed();
			}
		}, !jQuery.isEmptyObject(this.mChangedProperties));
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
	CompositeDataState.prototype.getChanges = function() {
		var mChangedProperties = {};
		
		var i, sKey, mChanges;

		var aInnerChanges = [];
		for (i = 0; i < this.aDataStates.length; ++i) {
			this.aDataStates[i].calculateChanges();
			mChanges = this.aDataStates[i].getChanges();
			this.aDataStates[i].changed(false);
			
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
		
		return mAllChanges;
	};

	return CompositeDataState;
});
