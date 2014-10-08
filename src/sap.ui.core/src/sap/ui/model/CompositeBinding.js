/*!
 * ${copyright}
 */

// Provides an abstract property binding.
sap.ui.define(['jquery.sap.global', './PropertyBinding', './SimpleType'],
	function(jQuery, PropertyBinding, SimpleType) {
	"use strict";


	/**
	 * Constructor for CompositeBinding
	 *
	 * @class
	 * The CompositeBinding is used to bundle multiple property bindings which are be used to provide a single binding against
	 * these property bindings. Note: Only One Way binding is supported. So setValue and setExternalValue throw exceptions.
	 *
	 * @public
	 * @name sap.ui.model.CompositeBinding
	 */
	
	var CompositeBinding = PropertyBinding.extend("sap.ui.model.CompositeBinding", /** @lends sap.ui.model.CompositeBinding.prototype */ {
	
		constructor : function (aBindings, bRawValues) {
			PropertyBinding.apply(this, [null,""]);
			this.aBindings = aBindings;
			this.bRawValues = bRawValues;
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
	
	CompositeBinding.prototype.getType = function() {
		jQuery.sap.assert(null, "Composite Binding type is not supported!");
		return null;
	};
	
	/**
	 * sets the context for each property binding in this composite binding
	 * @param {object} oContext the new context for the bindings
	 * @name sap.ui.model.CompositeBinding#setContext
	 * @function
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
	 * Not supported for CompositeBinding as a composite binding contains an array of property bindings. 
	 * An exception will be thrown. 
	 *
	 * @param {object} oValue the value to set for this binding
	 * 
	 * @throws sap.ui.base.Exception
	 *
	 * @public
	 * @name sap.ui.model.CompositeBinding#setValue
	 * @function
	 */
	CompositeBinding.prototype.setValue = function(oValue) {
		throw new sap.ui.base.Exception("Composite Binding does not support setValue because it contains multiple property bindings!");
	};
	
	/**
	 * Returns the raw values of the property bindings in an array.
	 *
	 * @return {object} the values of the internal property bindings in an array
	 *
	 * @public
	 * @name sap.ui.model.CompositeBinding#getValue
	 * @function
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
	 * Returns the current external value of the bound target which is formatted via a type or formatter function. 
	 *
	 * @return {object} the current value of the bound target
	 *
	 *@throws sap.ui.model.FormatException
	 *
	 * @public
	 * @name sap.ui.model.CompositeBinding#getExternalValue
	 * @function
	 */
	CompositeBinding.prototype.getExternalValue = function() {
		var aValues = [],
			oValue;
		if (this.bRawValues) {
			// type of property bindings is ignored here because we call getValue().
			aValues = this.getValue();
		} else {
			// composite type is ignored here and the property binding types are used in getExternalValue()
			jQuery.each(this.aBindings, function(i, oBinding) {
				oValue = oBinding.getExternalValue();
				aValues.push(oValue);
			});
		}
		
		if (this.fnFormatter) {
			oValue = this.fnFormatter.apply(this, aValues);
		} else {
			if ( aValues.length > 1) {
				// default: multiple values are joined together if no formatter specified
				oValue = aValues.join(" ");
			} else {
				oValue = aValues[0];
			}
		}
		
		return oValue;
	};
	
	
	/**
	 * Not supported for CompositeBinding as a composite binding contains an array of property bindings. 
	 * An exception will be thrown. 
	 *
	 * @param {object} oValue the value to set for this binding
	 * 
	 * @throws sap.ui.base.Exception
	 *
	 * @public
	 * @name sap.ui.model.CompositeBinding#setExternalValue
	 * @function
	 */
	CompositeBinding.prototype.setExternalValue = function(oValue) {
		throw new sap.ui.base.Exception("Composite Binding does not support setExternalValue because it contains multiple property bindings!");
	};
	
	/**
	 * Returns the property bindings contained in this composite binding.
	 *
	 * @return {array} the property bindings in this composite binding
	 *
	 * @public
	 * @name sap.ui.model.CompositeBinding#getBindings
	 * @function
	 */
	CompositeBinding.prototype.getBindings = function() {
		return this.aBindings;
	};
	
	//Eventing and related
	/**
	* Attach event-handler <code>fnFunction</code> to the '_change' event of this <code>sap.ui.model.Model</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	* @name sap.ui.model.CompositeBinding#attachChange
	* @function
	*/
	CompositeBinding.prototype.attachChange = function(fnFunction, oListener) {
		this.attachEvent("change", fnFunction, oListener);
		if (this.aBindings) {
			var that = this;
			jQuery.each(this.aBindings, function(i,oBinding) {
				oBinding.attachChange(that.checkUpdate, that);
			});
		}
	};
	
	/**
	* Detach event-handler <code>fnFunction</code> from the '_change' event of this <code>sap.ui.model.Model</code>.<br/>
	* @param {function} fnFunction The function to call, when the event occurs.
	* @param {object} [oListener] object on which to call the given function.
	* @protected
	* @name sap.ui.model.CompositeBinding#detachChange
	* @function
	*/
	CompositeBinding.prototype.detachChange = function(fnFunction, oListener) {
		this.detachEvent("change", fnFunction, oListener);
		if (this.aBindings) {
			var that = this;
			jQuery.each(this.aBindings, function(i,oBinding) {
				oBinding.detachChange(that.checkUpdate, that);
			});
		}
	};
	
	/**
	 * Determines if the property bindings in the composite binding should be updated by calling updateRequired on all property bindings with the specified model.
	 * @param {object} oModel The model instance to compare against
	 * @returns {boolean} true if this binding should be updated
	 * @protected
	 * @name sap.ui.model.CompositeBinding#updateRequired
	 * @function
	 */
	CompositeBinding.prototype.updateRequired = function(oModel) {
		var bUpdateRequired = false;
		jQuery.each(this.aBindings, function(i, oBinding){
			bUpdateRequired = bUpdateRequired || oBinding.updateRequired(oModel);
		});
		return bUpdateRequired;
	};
	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 * 
	 * @param {boolean} bForceupdate
	 * 
	 * @name sap.ui.model.CompositeBinding#checkUpdate
	 * @function
	 */
	CompositeBinding.prototype.checkUpdate = function(bForceupdate){
		var oValue = this.getExternalValue();
		if (!jQuery.sap.equal(oValue, this.oValue) || bForceupdate) {// optimize for not firing the events when unneeded
			this.oValue = oValue;
			this._fireChange({reason: sap.ui.model.ChangeReason.Change});
		}
	};

	return CompositeBinding;

}, /* bExport= */ true);
