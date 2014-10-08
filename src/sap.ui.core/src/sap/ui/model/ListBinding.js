/*!
 * ${copyright}
 */

// Provides an abstraction for list bindings
sap.ui.define(['jquery.sap.global', './Binding', './Filter', './Sorter'],
	function(jQuery, Binding, Filter, Sorter) {
	"use strict";


	/**
	 * Constructor for ListBinding
	 *
	 * @class
	 * The ListBinding is a specific binding for lists in the model, which can be used
	 * to populate Tables or ItemLists.
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {array} [aSorters] initial sort order (can be either a sorter or an array of sorters)
	 * @param {array} [aFilters] predefined filter/s (can be either a filter or an array of filters)
	 * @param {object} [mParameters]
	 * 
	 * @public
	 * @name sap.ui.model.ListBinding
	 */
	var ListBinding = Binding.extend("sap.ui.model.ListBinding", /** @lends sap.ui.model.ListBinding.prototype */ {
		
		constructor : function(oModel, sPath, oContext, aSorters, aFilters, mParameters){
			Binding.call(this, oModel, sPath, oContext, mParameters);
			
			this.aSorters = aSorters;
			if (!jQuery.isArray(this.aSorters) && this.aSorters instanceof Sorter) {
				this.aSorters = [this.aSorters];
			} else if (!jQuery.isArray(this.aSorters)) {
				this.aSorters = [];
			}
			this.aFilters = [];
			if (!jQuery.isArray(aFilters) && aFilters instanceof Filter) {
				aFilters = [aFilters];
			} else if (!jQuery.isArray(aFilters)) {
				aFilters = [];
			}
			this.aApplicationFilters = aFilters;
			this.bUseExtendedChangeDetection = false;
		},
		
		metadata : {
			"abstract" : true,
	
			publicMethods : [
				// methods
				"getContexts", "sort", "attachSort", "detachSort", "filter", "attachFilter", "detachFilter", "getDistinctValues", "isGrouped", "getLength", "isLengthFinal"
			]
		}
		
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.ListBinding with name <code>sClassName</code> 
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
	 * @name sap.ui.model.ListBinding.extend
	 * @function
	 */
	
	
	// the 'abstract methods' to be implemented by child classes
	/**
	 * Returns the current value of the bound target
	 *
	 * @function
	 * @name sap.ui.model.ListBinding.prototype.getContexts
	 * @return {sap.ui.model.Context[]} the array of contexts for each row of the bound list
	 *
	 * @public
	 */
	
	/**
	 * Filters the list according to the filter definitions
	 *
	 * @function
	 * @name sap.ui.model.ListBinding.prototype.filter
	 * @param {object[]} aFilters Array of filter objects
	 * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted, if it is not given, the standard behaviour applies
	 * @return {sap.ui.model.ListBinding} returns <code>this</code> to facilitate method chaining 
	 *
	 * @public
	 */
	
	/**
	 * Sorts the list according to the sorter object
	 *
	 * @function
	 * @name sap.ui.model.ListBinding.prototype.sort
	 * @param {sap.ui.model.Sorter|Array} aSorters the Sorter object or an array of sorters which defines the sort order
	 * @return {sap.ui.model.ListBinding} returns <code>this</code> to facilitate method chaining 
	 * @public
	 */
	
	/**
	 * Returns the number of entries in the list. This might be an estimated or preliminary length, in case
	 * the full length is not known yet, see method isLengthFinal().
	 *
	 * @function
	 * @name sap.ui.model.ListBinding.prototype.getLength
	 * @return {int} returns the number of entries in the list
	 * @since 1.24
	 * @public
	 */
	ListBinding.prototype.getLength = function() {
		return 0;
	};
	
	/**
	 * Returns whether the length which can be retrieved using getLength() is a known, final length,
	 * or an preliminary or estimated length which may change if further data is requested.  
	 *
	 * @function
	 * @name sap.ui.model.ListBinding.prototype.isLengthFinal
	 * @return {boolean} returns whether the length is final
	 * @since 1.24
	 * @public
	 */
	ListBinding.prototype.isLengthFinal = function() {
		return true;
	};
	
	// base methods, may be overridden by child classes
	/**
	 * Returns list of distinct values for the given relative binding path
	 *
	 * @param {string} sPath the relative binding path
	 * @return {Array} the array of distinct values.
	 *
	 * @public
	 * @name sap.ui.model.ListBinding#getDistinctValues
	 * @function
	 */
	ListBinding.prototype.getDistinctValues = function(sPath) {
		return null;
	};
	
	//Eventing and related
	/**
	 * Attach event-handler <code>fnFunction</code> to the 'sort' event of this <code>sap.ui.model.ListBinding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 * @deprecated use the change event. It now contains a parameter (reason : "sort") when a sorter event is fired.
	 * @name sap.ui.model.ListBinding#attachSort
	 * @function
	 */
	ListBinding.prototype.attachSort = function(fnFunction, oListener) {
		this.attachEvent("sort", fnFunction, oListener);
	};
	
	/**
	 * Detach event-handler <code>fnFunction</code> from the 'sort' event of this <code>sap.ui.model.ListBinding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 * @deprecated use the change event.
	 * @name sap.ui.model.ListBinding#detachSort
	 * @function
	 */
	ListBinding.prototype.detachSort = function(fnFunction, oListener) {
		this.detachEvent("sort", fnFunction, oListener);
	};
	
	/**
	 * Fire event _sort to attached listeners.
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @private
	 * @deprecated use the change event. It now contains a parameter (reason : "sort") when a sorter event is fired.
	 * @name sap.ui.model.ListBinding#_fireSort
	 * @function
	 */
	ListBinding.prototype._fireSort = function(mArguments) {
		this.fireEvent("sort", mArguments);
	};
	
	/**
	 * Attach event-handler <code>fnFunction</code> to the 'filter' event of this <code>sap.ui.model.ListBinding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 * @deprecated use the change event. It now contains a parameter (reason : "filter") when a filter event is fired.
	 * @name sap.ui.model.ListBinding#attachFilter
	 * @function
	 */
	ListBinding.prototype.attachFilter = function(fnFunction, oListener) {
		this.attachEvent("filter", fnFunction, oListener);
	};
	
	/**
	 * Detach event-handler <code>fnFunction</code> from the 'filter' event of this <code>sap.ui.model.ListBinding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 * @deprecated use the change event.
	 * @name sap.ui.model.ListBinding#detachFilter
	 * @function
	 */
	ListBinding.prototype.detachFilter = function(fnFunction, oListener) {
		this.detachEvent("filter", fnFunction, oListener);
	};
	
	/**
	 * Fire event _filter to attached listeners.
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @private
	 * @deprecated use the change event. It now contains a parameter (reason : "filter") when a filter event is fired.
	 * @name sap.ui.model.ListBinding#_fireFilter
	 * @function
	 */
	ListBinding.prototype._fireFilter = function(mArguments) {
		this.fireEvent("filter", mArguments);
	};
	
	/**
	 * Checks if grouping is enabled for the binding<br/>
	 * @public
	 * @name sap.ui.model.ListBinding#isGrouped
	 * @function
	 */
	ListBinding.prototype.isGrouped = function() {
		return this.aSorters.length > 0 && !!this.aSorters[0].fnGroup;
	};
	
	/**
	 * Enable extended change detection
	 * @private
	 * @name sap.ui.model.ListBinding#enableExtendedChangeDetection
	 * @function
	 */
	ListBinding.prototype.enableExtendedChangeDetection = function( ) {
		this.bUseExtendedChangeDetection  = true;
		if (this.update) {
			this.update();
		}
	};
	

	return ListBinding;

}, /* bExport= */ true);
