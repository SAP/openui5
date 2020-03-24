/*!

 * ${copyright}
 */

// Provides an abstraction for list bindings
sap.ui.define(['./Binding', './Filter', './Sorter', 'sap/base/util/array/diff'],
	function(Binding, Filter, Sorter, diff) {
	"use strict";


	/**
	 * Constructor for ListBinding.
	 *
	 * @abstract
	 * @class
	 * ListBinding is a specific binding for lists in the model, which can be used
	 * to populate Tables or ItemLists.
	 *
	 * @param {sap.ui.model.Model} oModel Model instance that this binding belongs to
	 * @param {string} sPath Binding path for this binding;
	 *   a relative path will be resolved relative to a given context
	 * @param {sap.ui.model.Context} oContext Context to be used to resolve a relative path
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters] Initial sort order (can be either a sorter or an array of sorters)
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters] Predefined filter/s (can be either a filter or an array of filters)
	 * @param {object} [mParameters] Additional, implementation-specific parameters that should be used
	 *   by the new list binding; this base class doesn't define any parameters, check the API reference
	 *   for the concrete model implementations to learn about their supported parameters (if any)
	 *
	 * @public
	 * @alias sap.ui.model.ListBinding
	 * @extends sap.ui.model.Binding
	 */
	var ListBinding = Binding.extend("sap.ui.model.ListBinding", /** @lends sap.ui.model.ListBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, aSorters, aFilters, mParameters){
			Binding.call(this, oModel, sPath, oContext, mParameters);

			this.aSorters = makeArray(aSorters, Sorter);
			this.aFilters = [];
			this.aApplicationFilters = makeArray(aFilters, Filter);
			this.oCombinedFilter = null;
			this.bUseExtendedChangeDetection = false;
			this.bDetectUpdates = true;
		},

		metadata : {
			"abstract" : true,

			publicMethods : [
				// methods
				"getContexts", "getCurrentContexts", "sort", "attachSort", "detachSort", "filter", "attachFilter", "detachFilter", "getDistinctValues", "isGrouped", "getLength", "isLengthFinal"
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
	 * Returns an array of binding contexts for the bound target list.
	 *
	 * <h4>Extended Change Detection</h4>
	 * If extended change detection is enabled using {@link sap.ui.model.ListBinding.prototype.enableExtendedChangeDetection},
	 * the context array may carry an additional property named <code>diff</code>, which contains an array of actual changes
	 * on the context array compared to the last call of <code>getContexts()</code>.
	 * In case no <code>diff</code> property is available on the context array, the list is completely different and needs to
	 * be recreated. In case the <code>diff</code> property contains an empty array, there have been no changes on the list.
	 *
	 * Sample diff array:
	 * <code>[{index: 1, type: "delete"}, {index: 4, type: "insert}]</code>
	 *
	 * <strong>Note:</strong>The public usage of this method is deprecated, as calls from outside of controls will lead
	 * to unexpected side effects. To avoid these side effect, use {@link sap.ui.model.ListBinding.prototype.getCurrentContexts}
	 * instead.
	 *
	 * @function
	 * @name sap.ui.model.ListBinding.prototype.getContexts
	 * @param {int} [iStartIndex=0] the startIndex where to start the retrieval of contexts
	 * @param {int} [iLength=length of the list] determines how many contexts to retrieve beginning from the start index.
	 * @return {sap.ui.model.Context[]} the array of contexts for each row of the bound list
	 *
	 * @protected
	 */

	/**
	 * Applies a new set of filters to the list represented by this binding.
	 *
	 * Depending on the nature of the model (client or server), the operation might be
	 * executed locally or on a server and it might execute asynchronously.
	 *
	 * <h4>Application and Control Filters</h4>
	 * Each list binding maintains two separate lists of filters, one for filters defined by the
	 * control that owns the binding and another list for filters that an application can define
	 * in addition. When executing the filter operation, both sets of filters are combined.
	 *
	 * By using the second parameter <code>sFilterType</code> of method <code>filter</code>,
	 * the caller can control which set of filters is modified. If no type is given, then the
	 * behavior depends on the model implementation and should be documented in the API reference
	 * for that model.
	 *
	 * <h4>Auto-Grouping of Filters</h4>
	 * Filters are first grouped according to their binding path.
	 * All filters belonging to the same group are ORed and after that the
	 * results of all groups are ANDed.
	 * Usually this means, all filters applied to a single table column
	 * are ORed, while filters on different table columns are ANDed.
	 * Please either use the automatic grouping of filters (where applicable) or use explicit
	 * AND/OR filters, a mixture of both is not supported.
	 *
	 * @param {sap.ui.model.Filter[]} aFilters Array of filter objects
	 * @param {sap.ui.model.FilterType} [sFilterType=undefined] Type of the filter which should
	 *  be adjusted; if no type is given, the behavior depends on the model implementation
	 * @return {sap.ui.model.ListBinding} returns <code>this</code> to facilitate method chaining
	 *
	 * @function
	 * @name sap.ui.model.ListBinding.prototype.filter
	 * @public
	 */

	/**
	 * Sorts the list according to the sorter object.
	 *
	 * Instead of a single sorter also an array of sorters can be passed to the sort method. In this case they
	 * are processed in the sequence in which they are contained in the array.
	 *
	 * <h4>Grouping</h4>
	 * Sorting and grouping are closely related, in case a list should be grouped, it must be sorted by the
	 * property to group with. Grouping is enabled by setting the <code>group</code> property on the sorter object. If it is
	 * enabled, you can get the current group of an item using {@link sap.ui.model.ListBinding.prototype.getGroup}.
	 * In case multiple sorters are provided, grouping can only be done on the first sorter, nested grouping is
	 * not supported.
	 *
	 * @function
	 * @name sap.ui.model.ListBinding.prototype.sort
	 * @param {sap.ui.model.Sorter|Array} aSorters the Sorter object or an array of sorters which defines the sort order
	 * @return {sap.ui.model.ListBinding} returns <code>this</code> to facilitate method chaining
	 * @public
	 */

	/**
	 * Returns an array of currently used binding contexts of the bound control.
	 *
	 * This method does not trigger any data requests from the backend or delta calculation, but just returns the context
	 * array as last requested by the control. This can be used by the application to get access to the data currently
	 * displayed by a list control.
	 *
	 * @return {sap.ui.model.Context[]} the array of contexts for each row of the bound list
	 * @since 1.28
	 * @public
	 */
	ListBinding.prototype.getCurrentContexts = function() {
		return this.getContexts();
	};

	/**
	 * Returns the number of entries in the list.
	 *
	 * This might be an estimated or preliminary length, in case the full length is not known yet, see method
	 * {@link #isLengthFinal}.
	 *
	 * @return {int} returns the number of entries in the list
	 * @since 1.24
	 * @public
	 */
	ListBinding.prototype.getLength = function() {
		return 0;
	};

	/**
	 * Returns whether the length which can be retrieved using getLength() is a known, final length,
	 * or a preliminary or estimated length which may change if further data is requested.
	 *
	 * @returns {boolean} Whether the length is final
	 * @since 1.24
	 * @public
	 */
	ListBinding.prototype.isLengthFinal = function() {
		return true;
	};

	// base methods, may be overridden by child classes
	/**
	 * Returns list of distinct values for the given relative binding path.
	 *
	 * @param {string} sPath Relative binding path
	 * @returns {Array} Array of distinct values.
	 *
	 * @public
	 */
	ListBinding.prototype.getDistinctValues = function(sPath) {
		return null;
	};

	//Eventing and related
	/**
	 * The <code>sort</code> event is fired when the list binding is sorted.
	 *
	 * @name sap.ui.model.ListBinding#sort
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @public
	 * @deprecated As of version 1.11, use the <code>change</code> event. It now contains
	 *             a parameter <code>(reason : "sort")</code> when a sorter event is fired.
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:sort sort} event of this
	 * <code>sap.ui.model.ListBinding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.ListBinding</code> itself.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with,
	 *            defaults to this <code>ListBinding</code> itself
	 * @protected
	 * @deprecated As of version 1.11, use the <code>change</code> event. It now contains
	 *             a parameter <code>(reason : "sort")</code> when a sorter event is fired.
	 */
	ListBinding.prototype.attachSort = function(fnFunction, oListener) {
		this.attachEvent("sort", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:sort sort} event of this
	 * <code>sap.ui.model.ListBinding</code>.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @protected
	 * @deprecated As of version 1.11, use the <code>change</code> event.
	 */
	ListBinding.prototype.detachSort = function(fnFunction, oListener) {
		this.detachEvent("sort", fnFunction, oListener);
	};

	/**
	 * Fires event {@link #event:sort sort} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event.
	 * @private
	 * @deprecated As of version 1.11, use the <code>change</code> event. It now contains
	 *             a parameter <code>(reason : "sort")</code> when a sorter event is fired.
	 */
	ListBinding.prototype._fireSort = function(oParameters) {
		this.fireEvent("sort", oParameters);
	};

	/**
	 * The <code>filter</code> event is fired when the list binding is filtered.
	 *
	 * @name sap.ui.model.ListBinding#filter
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @public
	 * @deprecated As of version 1.11, use the <code>change</code> event. It now contains a parameter
	 *             <code>(reason : "filter")</code> when a filter event is fired.
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:filter filter} event of this
	 * <code>sap.ui.model.ListBinding</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.ListBinding</code> itself.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with,
	 *            defaults to this <code>ListBinding</code> itself
	 * @protected
	 * @deprecated As of version 1.11, use the <code>change</code> event. It now contains a parameter
	 *             <code>(reason : "filter")</code> when a filter event is fired.
	 */
	ListBinding.prototype.attachFilter = function(fnFunction, oListener) {
		this.attachEvent("filter", fnFunction, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:filter filter} event of this
	 * <code>sap.ui.model.ListBinding</code>.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] on which the given function had to be called
	 * @protected
	 * @deprecated As of version 1.11, use the <code>change</code> event.
	 */
	ListBinding.prototype.detachFilter = function(fnFunction, oListener) {
		this.detachEvent("filter", fnFunction, oListener);
	};

	/**
	 * Fires event {@link #event:filter filter} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event.
	 * @private
	 * @deprecated As of version 1.11, use the <code>change</code> event. It now contains a parameter
	 *             <code>(reason : "filter")</code> when a filter event is fired.
	 */
	ListBinding.prototype._fireFilter = function(oParameters) {
		this.fireEvent("filter", oParameters);
	};

	/**
	 * Indicates whether grouping is enabled for the binding.
	 * Grouping is enabled for a list binding, if at least one sorter exists on the binding and the first sorter
	 * is a grouping sorter.
	 * @public
	 * @returns {boolean} Whether grouping is enabled
	 */
	ListBinding.prototype.isGrouped = function() {
		return !!(this.aSorters && this.aSorters[0] && this.aSorters[0].fnGroup);
	};

	/**
	 * Gets the group for the given context.
	 * Must only be called if <code>isGrouped()</code> returns that grouping is enabled for this binding.
	 * The grouping will be performed using the first sorter (in case multiple sorters are defined).
	 * @param {sap.ui.model.Context} oContext The binding context
	 * @public
	 * @returns {object} The group object containing a key property and optional custom properties
	 * @see sap.ui.model.Sorter#getGroup
	 */
	ListBinding.prototype.getGroup = function(oContext) {
		return this.aSorters[0].getGroup(oContext);
	};

	/**
	 * Calculates delta of specified old data array and new data array.
	 *
	 * For more information, see {@link module:sap/base/util/array/diff}.
	 *
	 * @param {Array} aOld Old data array
	 * @param {Array} aNew New data array
	 * @returns {Array.<{type:string,index:int}>} List of update operations
	 * @protected
	 */
	ListBinding.prototype.diffData = function(aOld, aNew) {
		return diff(aOld, aNew, this.oExtendedChangeDetectionConfig);
	};

	/**
	 * Enable extended change detection.
	 * When extended change detection is enabled, the list binding provides detailed information about changes, for example
	 * which entries have been removed or inserted. This can be utilized by a control for fine-grained update of its elements.
	 * Please see {@link sap.ui.model.ListBinding.prototype.getContexts} for more information.
	 *
	 * For models that do not have a unique key on each entry by default, a key property or function can be set which is used to
	 * identify entries.
	 *
	 * @param {boolean} bDetectUpdates Whether changes within the same entity should cause a delete and insert command
	 * @param {function|string} vKey The path of the property containing the key or a function getting the context as only parameter to calculate a key to identify an entry
	 * @protected
	 */
	ListBinding.prototype.enableExtendedChangeDetection = function(bDetectUpdates, vKey, oExtendedChangeDetectionConfig /* restricted */) {
		this.bUseExtendedChangeDetection = true;
		this.bDetectUpdates = bDetectUpdates;
		this.oExtendedChangeDetectionConfig = oExtendedChangeDetectionConfig;
		if (typeof vKey === "string") {
			this.getEntryKey = function(oContext) {
				return oContext.getProperty(vKey);
			};
		} else if (typeof vKey === "function") {
			this.getEntryKey = vKey;
		}
		if (this.update) {
			this.update();
		}
	};

	/**
	 * Return the data used for the extended change detection. Dependent on the configuration this can either be a
	 * serialization of the complete data, or just a unique key identifying the entry. If grouping is enabled, the
	 * grouping key will also be included, to detect grouping changes.
	 *
	 * @param {sap.ui.model.Context} oContext the context object
	 * @returns {string} A string which is used for diff comparison
	 */
	ListBinding.prototype.getContextData = function(oContext) {
		var sContextData;
		if (this.getEntryKey && !this.bDetectUpdates) {
			sContextData = this.getEntryKey(oContext);
			if (this.isGrouped()) {
				sContextData += "-" + this.getGroup(oContext).key;
			}
		} else {
			sContextData = this.getEntryData(oContext);
		}
		return sContextData;
	};

	/**
	 * Return the entry data serialized as a string. The default implementation assumes a JS object and uses
	 * JSON.stringify to serialize it, subclasses may override as needed.
	 *
	 * @param {sap.ui.model.Context} oContext the context object
	 * @returns {string} The serialized object data
	 */
	ListBinding.prototype.getEntryData = function(oContext) {
		return JSON.stringify(oContext.getObject());
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
	ListBinding.prototype.getFilterInfo = function(bIncludeOrigin) {
		if (this.oCombinedFilter) {
			return this.oCombinedFilter.getAST(bIncludeOrigin);
		}
		return null;
	};

	return ListBinding;
});
