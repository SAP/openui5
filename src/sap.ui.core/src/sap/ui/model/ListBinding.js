/*!

 * ${copyright}
 */
/*eslint-disable max-len */
// Provides an abstraction for list bindings
sap.ui.define(['./Binding', './Filter', './FilterType', './Sorter', 'sap/base/util/array/diff'],
	function(Binding, Filter, FilterType, Sorter, diff) {
		"use strict";


		/**
		 * Constructor for ListBinding.
		 *
		 * @abstract
		 * @class
		 * ListBinding is a specific binding for lists in the model, which can be used to populate
		 * Tables or ItemLists.
		 *
		 * @param {sap.ui.model.Model} oModel
		 *   Model instance that this binding belongs to
		 * @param {string} sPath
		 *   Binding path for this binding; a relative path will be resolved relative to a given context
		 * @param {sap.ui.model.Context} oContext
		 *   Context to be used to resolve a relative path
		 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [aSorters=[]]
		 *   The sorters used initially; call {@link #sort} to replace them
		 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [aFilters=[]]
		 *   The filters to be used initially with type {@link sap.ui.model.FilterType.Application}; call {@link #filter} to
		 *   replace them
		 * @param {object} [mParameters]
		 *   Additional, implementation-specific parameters that should be used by the new list binding;
		 *   this base class doesn't define any parameters, check the API reference for the concrete
		 *   model implementations to learn about their supported parameters (if any)
		 * @throws {Error} If the {@link sap.ui.model.Filter.NONE} filter instance is contained in
		 *   <code>aFilters</code> together with other filters
		 *
		 * @public
		 * @alias sap.ui.model.ListBinding
		 * @extends sap.ui.model.Binding
		 */
		var ListBinding = Binding.extend("sap.ui.model.ListBinding", /** @lends sap.ui.model.ListBinding.prototype */ {

			constructor : function(oModel, sPath, oContext, aSorters, aFilters, mParameters){
				Binding.call(this, oModel, sPath, oContext, mParameters);

				// the binding's sorters
				this.aSorters = makeArray(aSorters, Sorter);
				// the binding's control filters
				this.aFilters = [];
				Filter.checkFilterNone(aFilters);
				// the binding's application filters
				this.aApplicationFilters = makeArray(aFilters, Filter);
				// the filter combined from control and application filters
				this.oCombinedFilter = null;
				// whether the binding uses extended change detection, cf. #getContexts
				this.bUseExtendedChangeDetection = false;
				// whether changes within an entity cause a delete and insert, cf. #enableExtendedChangeDetection
				this.bDetectUpdates = true;
				// the configuration for extended change detection, cf. #enableExtendedChangeDetection
				this.oExtendedChangeDetectionConfig = undefined;
			},

			metadata : {
				"abstract" : true
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
		 * Returns all current contexts of this list binding in no special order. Just like
		 * {@link #getCurrentContexts}, this method does not request any data from a back end and does
		 * not change the binding's state. In contrast to {@link #getCurrentContexts}, it does not only
		 * return those contexts that were last requested by a control, but all contexts that are
		 * currently available in the binding.
		 *
		 * @returns {sap.ui.model.Context[]}
		 *   All current contexts of this list binding, in no special order
		 *
		 * @function
		 * @name sap.ui.model.ListBinding.prototype.getAllCurrentContexts
		 * @public
		 * @since 1.97.0
		 */

		/**
		 * Returns an array of binding contexts for the bound target list.
		 *
		 * In case of extended change detection, the context array may have an additional
		 * <code>diff</code> property, see
		 * {@link topic:7cdff73f308b4b10bdf7d83b7aba72e7 documentation on extended change detection} for
		 * details.
		 *
		 * <strong>Note:</strong>The public usage of this method is deprecated, as calls from outside of
		 * controls will lead to unexpected side effects. To avoid this, use
		 * {@link sap.ui.model.ListBinding.prototype.getCurrentContexts} instead.
		 *
		 * @function
		 * @name sap.ui.model.ListBinding.prototype.getContexts
		 * @param {int} [iStartIndex=0]
		 *   The startIndex where to start the retrieval of contexts
		 * @param {int} [iLength=length of the list]
		 *   Determines how many contexts to retrieve beginning from the start index; default is the
		 *   whole list length up to the model's size limit; see {@link sap.ui.model.Model#setSizeLimit}
		 * @param {int} [iMaximumPrefetchSize]
		 *   The maximum number of contexts to read before and after the given range; with this,
		 *   controls can prefetch data that is likely to be needed soon, e.g. when scrolling down in a
		 *   table; this parameter is model-specific and not implemented by all models
		 * @param {boolean} [bKeepCurrent]
		 *   Whether this call keeps the result of {@link #getCurrentContexts} untouched; since 1.86.0.
		 *   This parameter is model-specific and not implemented by all models
		 * @return {sap.ui.model.Context[]}
		 *   The array of contexts for each row of the bound list
		 * @throws {Error}
		 *   If <code>bKeepCurrent</code> is set and extended change detection is enabled or
		 *   <code>iMaximumPrefetchSize</code> is set
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
		 * control that owns the binding, and another list for filters that an application can define in
		 * addition. When executing the filter operation, both sets of filters are combined.
		 *
		 * By using the <code>sFilterType</code> parameter of the <code>filter</code> method, the
		 * caller can control which set of filters is modified. If no type is given, then the
		 * behavior depends on the model implementation and should be documented in the API reference
		 * for that model.
		 *
		 * <h4>Auto-Grouping of Filters</h4>
		 * Filters are first grouped according to their binding path. All filters belonging to the same
		 * path are ORed, and after that the results of all paths are ANDed. Usually this means that all
		 * filters applied to the same property are ORed, while filters on different properties are
		 * ANDed.
		 * Please use either the automatic grouping of filters (where applicable) or explicit
		 * AND/OR filters, as a mixture of both is not supported.
		 *
		 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [aFilters=[]]
		 *   The filters to use; in case of type {@link sap.ui.model.FilterType.Application} this replaces the filters given
		 *   in {@link sap.ui.model.Model#bindList}; a falsy value is treated as an empty array and thus removes all filters
		 *   of the specified type
		 * @param {sap.ui.model.FilterType} [sFilterType]
		 *   The type of the filter to replace; if no type is given, the behavior depends on the model implementation
		 * @return {this}
		 *   Returns <code>this</code> to facilitate method chaining
		 *
		 * @function
		 * @name sap.ui.model.ListBinding.prototype.filter
		 * @public
		 */

		/**
		 * Sorts the list according to the sorter object.
		 *
		 * Instead of a single sorter also an array of sorters can be passed to the sort method. In this
		 * case they are processed in the sequence in which they are contained in the array.
		 *
		 * <h4>Grouping</h4>
		 * Sorting and grouping are closely related. In case a list should be grouped, it must be sorted
		 * by the property to group with. Grouping is enabled by setting the <code>group</code> property
		 * on the sorter object. If it is enabled, you can get the current group of an item using
		 * {@link sap.ui.model.ListBinding.prototype.getGroup}. In case multiple sorters are provided,
		 * grouping can only be done on the first sorter, nested grouping is not supported.
		 *
		 * @function
		 * @name sap.ui.model.ListBinding.prototype.sort
		 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [aSorters=[]]
		 *   The sorters to use; they replace the sorters given in {@link sap.ui.model.Model#bindList}; a falsy value is
		 *   treated as an empty array and thus removes all sorters
		 * @return {this}
		 *   Returns <code>this</code> to facilitate method chaining
		 * @public
		 */

		/**
		 * Checks whether keeping current contexts untouched is supported.
		 *
		 * @param {int} [iMaximumPrefetchSize]
		 *   The maximum number of contexts to read before and after the given range
		 * @throws {Error}
		 *   If extended change detection is enabled, or if <code>iMaximumPrefetchSize</code> is set
		 *
		 * @private
		 */
		ListBinding.prototype._checkKeepCurrentSupported = function (iMaximumPrefetchSize) {
			if (this.bUseExtendedChangeDetection) {
				throw new Error("Unsupported operation: " + this.getMetadata().getName()
					+ "#getContexts, must not use bKeepCurrent if extended change detection is"
					+ " enabled");
			}
			if (iMaximumPrefetchSize) {
				throw new Error("Unsupported operation: " + this.getMetadata().getName()
					+ "#getContexts, must not use both iMaximumPrefetchSize and bKeepCurrent");
			}
		};

		/**
		 * Returns the contexts of this list binding as last requested by the control and in the same
		 * order the control has received them.
		 *
		 * This method does not request any data from a back end and does not change the binding's
		 * state.
		 *
		 * @return {sap.ui.model.Context[]}
		 *   The contexts of this list binding as last requested by the control and in the same order
		 *   the control has received them
		 *
		 * @since 1.28
		 * @public
		 */
		ListBinding.prototype.getCurrentContexts = function() {
			return this.getContexts();
		};

		/**
		 * Returns the count of entries in the list, or <code>undefined</code> if it is unknown.
		 * The count is by default identical to the list length if it is final. Concrete subclasses may,
		 * however, override the method, for example:
		 * <ul>
		 *   <li> for server-side models where lists are not completely read by the client,
		 *   <li> for lists representing hierarchical data.
		 * </ul>
		 *
		 * @returns {number|undefined} The count of entries
		 * @public
		 * @see #getLength
		 * @see #isLengthFinal
		 * @since 1.93.0
		 */
		ListBinding.prototype.getCount = function() {
			return this.isLengthFinal() ? this.getLength() : undefined;
		};

		/**
		 * Returns the number of entries in the list.
		 *
		 * This might be an estimated or preliminary length, in case the full length is not known yet,
		 * see method {@link #isLengthFinal}.
		 *
		 * @return {int} Returns the number of entries in the list
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

		/**
		 * Indicates whether grouping is enabled for the binding.
		 * Grouping is enabled for a list binding if at least one sorter exists on the binding and the
		 * first sorter is a grouping sorter.
		 * @public
		 * @returns {boolean} Whether grouping is enabled
		 */
		ListBinding.prototype.isGrouped = function() {
			return !!(this.aSorters && this.aSorters[0] && this.aSorters[0].fnGroup);
		};

		/**
		 * Gets the group for the given context.
		 * Must only be called if <code>isGrouped()</code> returns that grouping is enabled for this
		 * binding. The grouping will be performed using the first sorter (in case multiple sorters are
		 * defined).
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
		 * When extended change detection is enabled, the list binding provides detailed information
		 * about changes, for example which entries have been removed or inserted. This can be utilized
		 * by a control for fine-grained update of its elements.
		 * Please see {@link sap.ui.model.ListBinding.prototype.getContexts} for more information.
		 *
		 * For models that do not have a unique key on each entry by default, a key property or function
		 * can be set which is used to identify entries.
		 *
		 * @param {boolean} bDetectUpdates
		 *   Whether changes within the same entity should cause a delete and insert command
		 * @param {function|string} vKey
		 *   The path of the property containing the key or a function getting the context as only
		 *   parameter to calculate a key to identify an entry
		 * @param {object} oExtendedChangeDetectionConfig
		 *   The configuration for the change detection
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
		 * Return the data used for the extended change detection. Dependent on the configuration this
		 * can either be a serialization of the complete data, or just a unique key identifying the
		 * entry. If grouping is enabled, the grouping key will also be included, to detect grouping
		 * changes.
		 *
		 * @param {sap.ui.model.Context} oContext The context object
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
		 * Return the entry data serialized as a string. The default implementation assumes a JS object
		 * and uses JSON.stringify to serialize it. Subclasses may override as needed.
		 *
		 * @param {sap.ui.model.Context} oContext The context object
		 * @returns {string} The serialized object data
		 */
		ListBinding.prototype.getEntryData = function(oContext) {
			return JSON.stringify(oContext.getObject());
		};


		/**
		 * Returns the filters set via the constructor or via {@link #filter} for the given
		 * {@link sap.ui.model.FilterType}.
		 *
		 * @param {sap.ui.model.FilterType} sFilterType
		 *   The FilterType
		 * @returns {sap.ui.model.Filter[]}
		 *   An array of filters for the given filter type.
		 * @throws {Error}
		 *   If no or an invalid filter type was given
		 * @public
		 * @since 1.96.0
		 */
		ListBinding.prototype.getFilters = function (sFilterType) {
			switch (sFilterType) {
				case FilterType.Application:
					return this.aApplicationFilters && this.aApplicationFilters.slice() || [];
				case FilterType.Control:
					return this.aFilters && this.aFilters.slice() || [];
				default:
					throw new Error("Invalid FilterType: " + sFilterType);
			}
		};

		/**
		 * Return the filter information as an AST. The default implementation checks for
		 * <code>this.oCombinedFilter</code>. Models not using this member may override the method.
		 * Consumers must not rely on the origin information to be available as future filter
		 * implementations will not provide this information.
		 *
		 * @param {boolean} bIncludeOrigin
		 *   Include information about the filter objects the tree has been created from
		 * @returns {object}
		 *   The AST of the filter tree
		 * @throws {Error} If this filter has no or an unknown operator
		 *
		 * @private
		 * @ui5-restricted sap.ui.table, sap.ui.export
		 */
		ListBinding.prototype.getFilterInfo = function(bIncludeOrigin) {
			if (this.oCombinedFilter) {
				return this.oCombinedFilter.getAST(bIncludeOrigin);
			}
			return null;
		};

		/**
		 * Requests a {@link sap.ui.model.Filter} object which can be used to filter the list binding by
		 * entries with model messages. With the filter callback, you can define if a message is
		 * considered when creating the filter for entries with messages.
		 *
		 * The resulting filter does not consider application or control filters specified for this list
		 * binding in its constructor or in its {@link #filter} method; add filters which you want to
		 * keep with the "and" conjunction to the resulting filter before calling {@link #filter}.
		 *
		 * The implementation of this method is optional for model-specific implementations of
		 * <code>sap.ui.model.ListBinding</code>. Check for existence of this function before calling
		 * it.
		 *
		 * @abstract
		 * @function
		 * @name sap.ui.model.ListBinding.prototype.requestFilterForMessages
		 * @param {function(sap.ui.core.message.Message):boolean} [fnFilter]
		 *   A callback function to filter only relevant messages. The callback returns whether the
		 *   given {@link sap.ui.core.message.Message} is considered. If no callback function is given,
		 *   all messages are considered.
		 * @returns {Promise<sap.ui.model.Filter|null>}
		 *   A Promise that resolves with a {@link sap.ui.model.Filter} representing the entries with
		 *   messages; it resolves with <code>null</code> if the binding is not resolved or if the
		 *   binding knows that there is no message for any entry
		 *
		 * @protected
		 * @since 1.77.0
		 */

		/**
		 * Returns the string key for the given model context, which is a unique representation of the context's data. This
		 * key is used in extended change detection to compute the difference between current and previous contexts
		 * retrieved via {@link sap.ui.model.ListBinding#getContexts}.
		 *
		 * The implementation of this method is optional for model-specific implementations of
		 * <code>sap.ui.model.ListBinding</code>.
		 *
		 * @abstract
		 * @function
		 * @name sap.ui.model.ListBinding.prototype.getEntryKey
		 * @param {sap.ui.model.Context} oContext
		 *   The context for which the key is to be computed
		 * @returns {string}
		 *   The key for the given context
		 *
		 * @protected
		 */

		/**
		 * Update the list and apply sorting and filtering. Called after creation of the list binding
		 * on enabling extended change detection, see {@link sap.ui.model.ListBinding#enableExtendedChangeDetection}.
		 *
		 * The implementation of this method is optional for model-specific implementations of
		 * <code>sap.ui.model.ListBinding</code>.
		 *
		 * @abstract
		 * @function
		 * @name sap.ui.model.ListBinding.prototype.update
		 *
		 * @protected
		 */

		return ListBinding;
	});
