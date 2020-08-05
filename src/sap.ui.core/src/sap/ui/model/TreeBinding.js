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
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]}
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
			this.oCombinedFilter = null;

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
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:_filter _filter} event of this
	 * <code>sap.ui.model.TreeBinding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified,
	 * otherwise it will be bound to this <code>sap.ui.model.TreeBinding</code> itself.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with,
	 *            defaults to this <code>TreeBinding</code> itself
	 * @protected
	 * @deprecated As of version 1.11, use the <code>change</code> event. It now contains a parameter
	 *             <code>(reason : "filter")</code> when a filter event is fired.
	 */
	TreeBinding.prototype.attachFilter = function(fnFunction, oListener) {
		this.attachEvent("_filter", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:_filter _filter} event of this
	 * <code>sap.ui.model.TreeBinding</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @protected
	 * @deprecated As of version 1.11, use the <code>change</code> event.
	 */
	TreeBinding.prototype.detachFilter = function(fnFunction, oListener) {
		this.detachEvent("_filter", fnFunction, oListener);
	};

	/**
	 * Fires event {@link #event:_filter _filter} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @private
	 * @deprecated As of version 1.11, use the <code>change</code> event. It now contains a parameter
	 *             <code>(reason : "filter")</code> when a filter event is fired.
	 */
	TreeBinding.prototype._fireFilter = function(oParameters) {
		this.fireEvent("_filter", oParameters);
	};

	/**
	 * Return the filter information as an AST. The default implementation checks for this.oCombinedFilter,
	 * models not using this member may override the method.
	 * Consumers must not rely on the origin information to be available, future filter implementations will
	 * not provide this information.
	 *
	 * @param {boolean} bIncludeOrigin include information about the filter objects the tree has been created from
	 * @returns {object} The AST of the filter tree
	 * @private
	 * @ui5-restricted sap.ui.table, sap.ui.export
	 */
	TreeBinding.prototype.getFilterInfo = function(bIncludeOrigin) {
		if (this.oCombinedFilter) {
			return this.oCombinedFilter.getAST(bIncludeOrigin);
		}
		return null;
	};
	return TreeBinding;

});
