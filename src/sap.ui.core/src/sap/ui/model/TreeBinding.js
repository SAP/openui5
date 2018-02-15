/*!
 * ${copyright}
 */

// Provides an abstraction for list bindings
sap.ui.define(['./Binding', './Filter', './Sorter'],
	function(Binding, Filter, Sorter) {
	"use strict";


	/**
	 * Constructor for TreeBinding.
	 *
	 * This constructor should only be called by subclasses or model implementations, not by application or control code.
	 * Such code should use {@link sap.ui.model.Model#bindTree Model#bindTree} on the corresponding model instead.
	 *
	 * @abstract
	 * @class
	 * The TreeBinding is a specific binding for trees in the model, which can be used
	 * to populate Trees.
	 *
	 * @param {sap.ui.model.Model}
	 *         oModel Model instance that this binding is created for and that it belongs to
	 * @param {string}
	 *         sPath Path pointing to the tree / array that should be bound
	 * @param {object}
	 *         [oContext=null] Context object for this binding (optional)
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]}
	 *         [aFilters=null] Predefined filter or an array of filters (optional)
	 * @param {string}
	 *         [mParameters=null] Additional model specific parameters (optional)
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter}
	 *         [aSorters=null] Predefined sorter or an array of sorters (optional)
	 * @public
	 * @alias sap.ui.model.TreeBinding
	 * @extends sap.ui.model.Binding
	 */
	var TreeBinding = Binding.extend("sap.ui.model.TreeBinding", /** @lends sap.ui.model.TreeBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, aFilters, mParameters, aSorters){
			Binding.call(this, oModel, sPath, oContext, mParameters);
			this.aFilters = [];

			this.aSorters = makeArray(aSorters, Sorter);
			this.aApplicationFilters = makeArray(aFilters, Filter);

			this.bDisplayRootNode = mParameters && mParameters.displayRootNode === true;
		},

		metadata : {
			"abstract" : true,
			publicMethods : [
				"getRootContexts", "getNodeContexts", "hasChildren", "filter"
			]
		}

	});

	function makeArray(a, FNClass) {
		if ( Array.isArray(a) ) {
			return a;
		}
		return a instanceof FNClass ? [a] : [];
	}

	// the 'abstract methods' to be implemented by child classes
	/**
	 * Returns the current value of the bound target
	 *
	 * @function
	 * @name sap.ui.model.TreeBinding.prototype.getRootContexts
	 * @param {int} iStartIndex the startIndex where to start the retrieval of contexts
	 * @param {int} iLength determines how many contexts to retrieve beginning from the start index.
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
	 * @param {int} iStartIndex the startIndex where to start the retrieval of contexts
	 * @param {int} iLength determines how many contexts to retrieve beginning from the start index.
	 * @return {Array} the array of child contexts for the given node
	 *
	 * @public
	 */

	/**
	 * Returns if the node has child nodes
	 *
	 * @function
	 * @name sap.ui.model.TreeBinding.prototype.hasChildren
	 * @param {Object} oContext the context element of the node
	 * @return {boolean} true if node has children
	 *
	 * @public
	 */

	/**
	 * Returns the number of child nodes of a specific context
	 *
	 * @param {Object} oContext the context element of the node
	 * @return {int} the number of children
	 *
	 * @public
	 */
	TreeBinding.prototype.getChildCount = function(oContext) {
		if (!oContext) {
			return this.getRootContexts().length;
		}
		return this.getNodeContexts(oContext).length;
	};

	/**
	 * Filters the tree according to the filter definitions.
	 *
	 * @function
	 * @name sap.ui.model.TreeBinding.prototype.filter
	 * @param {sap.ui.model.Filter[]} aFilters Array of sap.ui.model.Filter objects
	 * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted, if it is not given, the standard behaviour applies
	 *
	 * @public
	 */

	/**
	 * Sorts the tree according to the sorter definitions.
	 *
	 * @function
	 * @name sap.ui.model.TreeBinding.prototype.sort
	 * @param {sap.ui.model.Sorter[]} aSorters Array of sap.ui.model.Sorter objects
	 *
	 * @public
	 */

	/**
	 * Attach event-handler <code>fnFunction</code> to the '_filter' event of this <code>sap.ui.model.TreeBinding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 * @deprecated use the change event. It now contains a parameter (reason : "filter") when a filter event is fired.
	 */
	TreeBinding.prototype.attachFilter = function(fnFunction, oListener) {
		this.attachEvent("_filter", fnFunction, oListener);
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the '_filter' event of this <code>sap.ui.model.TreeBinding</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 * @deprecated use the change event.
	 */
	TreeBinding.prototype.detachFilter = function(fnFunction, oListener) {
		this.detachEvent("_filter", fnFunction, oListener);
	};

	/**
	 * Fire event _filter to attached listeners.
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @private
	 * @deprecated use the change event. It now contains a parameter (reason : "filter") when a filter event is fired.
	 */
	TreeBinding.prototype._fireFilter = function(mArguments) {
		this.fireEvent("_filter", mArguments);
	};


	return TreeBinding;

});
