/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides an abstraction for list bindings
jQuery.sap.declare("sap.ui.model.TreeBinding");
jQuery.sap.require("sap.ui.model.Binding");

/**
 * Constructor for TreeBinding
 *
 * @class
 * The TreeBinding is a specific binding for trees in the model, which can be used
 * to populate Trees.
 *
 * @param {sap.ui.model.Model} oModel
 * @param {string}
 *         sPath the path pointing to the tree / array that should be bound
 * @param {object}
 *         [oContext=null] the context object for this databinding (optional)
 * @param {array}
 *         [aFilters=null] predefined filter/s contained in an array (optional)
 * @param {object}
 *         [mParameters=null] additional model specific parameters (optional)
 * @abstract
 * @public
 */
sap.ui.model.TreeBinding = function(oModel, sPath, oContext, aFilters, mParameters){
	sap.ui.model.Binding.call(this, oModel, sPath, oContext, mParameters);
	this.aFilters = aFilters;
};

sap.ui.model.TreeBinding.prototype = jQuery.sap.newObject(sap.ui.model.Binding.prototype);

/*
 * Describe the sap.ui.model.TreeBinding.
 * Resulting metadata can be obtained via sap.ui.model.TreeBinding.getMetadata();
 */
sap.ui.base.Object.defineClass("sap.ui.model.TreeBinding", {

  // ---- object ----
  baseType : "sap.ui.model.Binding",
  publicMethods : [
	// methods
	"getRootContexts", "getNodeContexts", "filter"
  ]

});

// the 'abstract methods' to be implemented by child classes
/**
 * Returns the current value of the bound target
 *
 * @function
 * @name sap.ui.model.TreeBinding.prototype.getRootContexts
 * @return {Array} the array of child contexts for the root node
 *
 * @public
 */

/**
 * Returns the current value of the bound target
 *
 * @function
 * @name sap.ui.model.TreeBinding.prototype.getNodeContexts
 * @param {Object} oContext the context element of the node
 * @return {Array} the array of child contexts for the given node
 *
 * @public
 */

/**
 * Filters the tree according to the filter definitions.
 *
 * @function
 * @name sap.ui.model.TreeBinding.prototype.filter
 * @param {Array} aFilters Array of sap.ui.model.Filter objects
 *
 * @public
 */

/**
 * Attach event-handler <code>fnFunction</code> to the '_filter' event of this <code>sap.ui.model.TreeBinding</code>.<br/>
 * @param {function} fnFunction The function to call, when the event occurs.
 * @param {object} [oListener] object on which to call the given function.
 * @protected
 */
sap.ui.model.TreeBinding.prototype.attachFilter = function(fnFunction, oListener) {
	this.attachEvent("_filter", fnFunction, oListener);
};

/**
 * Detach event-handler <code>fnFunction</code> from the '_filter' event of this <code>sap.ui.model.TreeBinding</code>.<br/>
 * @param {function} fnFunction The function to call, when the event occurs.
 * @param {object} [oListener] object on which to call the given function.
 * @protected
 */
sap.ui.model.TreeBinding.prototype.detachFilter = function(fnFunction, oListener) {
	this.detachEvent("_filter", fnFunction, oListener);
};

/**
 * Fire event _filter to attached listeners.
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @private
 */
sap.ui.model.TreeBinding.prototype._fireFilter = function(mArguments) {
	this.fireEvent("_filter", mArguments);
};