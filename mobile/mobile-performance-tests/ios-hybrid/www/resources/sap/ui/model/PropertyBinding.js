/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides an abstract property binding.
jQuery.sap.declare("sap.ui.model.PropertyBinding");
jQuery.sap.require("sap.ui.model.Binding");
jQuery.sap.require("sap.ui.model.SimpleType");

/**
 * Constructor for PropertyBinding
 *
 * @class
 * The PropertyBinding is used to access single data values in the data model.
 *
 * @param {sap.ui.model.Model} oModel
 * @param {String} sPath
 * @param {Object} oContext
 * @abstract
 * @public
 * @name sap.ui.model.PropertyBinding
 */

sap.ui.model.Binding.extend("sap.ui.model.PropertyBinding", /** @lends sap.ui.model.PropertyBinding */ {

	constructor : function (oModel, sPath, oContext, mParameters) {
		sap.ui.model.Binding.apply(this, arguments);
		this.oType;
		this.fnFormatter;
		this.sInternalType;
	},
	metadata : {
		"abstract" : true,
		
	  publicMethods : [
		  "getValue", "setValue", "setType", "getType", "setFormatter", "getFormatter", "getExternalValue", "setExternalValue"
	  ]
	}

});

/**
 * Creates a new subclass of class sap.ui.model.PropertyBinding with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code> 
 * see {@link sap.ui.base.Object.extend Object.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ui.model.PropertyBinding.extend
 * @function
 */

// the 'abstract methods' to be implemented by child classes
/**
 * Returns the current value of the bound target
 *
 * @function
 * @name sap.ui.model.PropertyBinding.prototype.getValue
 * @return {object} the current value of the bound target
 *
 * @public
 */

/**
 * Sets the value for this binding. A model implementation should check if the current default binding mode permits
 * setting the binding value and if so set the new value also in the model.
 *
 * @function
 * @name sap.ui.model.PropertyBinding.prototype.setValue
 * @param {object} oValue the value to set for this binding
 *
 * @public
 */

/**
 * Returns the current external value of the bound target which is formatted via a type or formatter function. 
 *
 * @return {object} the current value of the bound target
 *
 * @public
 */
sap.ui.model.PropertyBinding.prototype.getExternalValue = function() {	
	var oValue = this.getValue();
	if (this.oType) {
		oValue = this.oType.formatValue(oValue, this.sInternalType);
	}
	if (this.fnFormatter) {
		oValue = this.fnFormatter(oValue);
	}
	return oValue;
};


/**
 * Sets the value for this binding. The value is parsed and validated against its type and then set to the binding.
 * A model implementation should check if the current default binding mode permits
 * setting the binding value and if so set the new value also in the model.
 *
 * @param {object} oValue the value to set for this binding
 * 
 * @throws sap.ui.model.ParseException
 * @throws sap.ui.model.ValidateException
 *
 * @public
 */
sap.ui.model.PropertyBinding.prototype.setExternalValue = function(oValue) {
	// formatter doesn't support two way binding
	if (this.fnFormatter) {
		return;
	}
	if (this.oType) {
		oValue = this.oType.parseValue(oValue, this.sInternalType);
		this.oType.validateValue(oValue);
	}
	// if no type specified set value directly
	this.setValue(oValue);
};

/**
 * Sets the optional type and internal type for the binding. The type and internal type are used to do the parsing/formatting correctly.

 * @param {object} oType the sap.ui.model.Type for the binding
 * @param {String} sInternalType the internal type of the element property which this binding is bound against.
 * 
 * @public
 */
sap.ui.model.PropertyBinding.prototype.setType = function(oType, sInternalType) {
	this.oType = oType;
	this.sInternalType = sInternalType;
};

/**
 *  Returns the type if any for the binding.
 *  @returns the binding type
 *  @public
 */
sap.ui.model.PropertyBinding.prototype.getType = function() {
	return this.oType;
};

/**
 * Sets the optional type for the binding.

 * @param {object} oType the sap.ui.model.Type for the binding
 * 
 * @public
 */
sap.ui.model.PropertyBinding.prototype.setFormatter = function(fnFormatter) {
	this.fnFormatter = fnFormatter;
};

/**
 *  Returns the type if any for the binding
 *  @returns the binding type
 *  @public
 */
sap.ui.model.PropertyBinding.prototype.getFormatter = function() {
	return this.fnFormatter;
};
