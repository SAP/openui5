/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the concept of a sorter for list bindings
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/base/Object"
], function(Log, Localization, BaseObject) {
	"use strict";

	/**
	 *
	 * Constructor for Sorter.
	 *
	 * @class
	 * Sorter for list bindings.
	 *
	 * Instances of this class define the sort order for a list binding.
	 *
	 * @param {string|object} vSorterInfo
	 *   The binding path used for sorting or the sorter info object; if a sorter info object is given, the other
	 *   constructor parameters are ignored
	 * @param {function} [vSorterInfo.comparator]
	 *   See <code>fnComparator</code> parameter
	 * @param {boolean} [vSorterInfo.descending=false]
	 *   See <code>bDescending</code> parameter
	 * @param {boolean|function} [vSorterInfo.group]
	 *   See <code>vGroup</code> parameter
	 * @param {string} [vSorterInfo.path]
	 *   The binding path for this sorter
	 * @param {boolean} [bDescending=false]
	 *   Whether the sort order is descending
	 * @param {boolean|function} [vGroup]
	 *   Configure grouping of the content, can either be <code>true</code> to enable grouping based on the raw model
	 *   property value, or a function which calculates the group value out of the context (e.g.
	 *   <code>oContext.getProperty("date").getYear()</code> for year grouping). The control needs to implement the
	 *   grouping behaviour. In case a function is provided it must either return a primitive type value as the group
	 *   key or an object containing a "key" property and additional properties needed for group visualization. This
	 *   object or the object with the primitive type return value as "key" property is passed to the
	 *   <code>groupHeaderFactory</code> function that has been specified to create the group header for the control
	 *   aggregation; see {@link sap.ui.base.ManagedObject#bindAggregation}.
	 *   <b>Note:</b> Grouping via <code>vGroup=true</code> is only possible (and only makes sense) for the primary
	 *   sort property. A more complicated grouping is possible by providing a grouping function. The sort order needs
	 *   to fit to the grouping also in this case. See also
	 *   {@link topic:ec79a5d5918f4f7f9cbc2150e66778cc Sorting, Grouping, and Filtering for List Binding}.
	 * @param {function} [fnComparator]
	 *   A custom comparator function, which is used for client-side sorting instead of the default comparator method;
	 *   information about parameters and expected return values of such a method can be found in the
	 *   {@link #.defaultComparator default comparator} documentation.
	 *   <b>Note:</b> Custom comparator functions are meant to be used on the client. Models that implement sorting in
	 *   the backend usually don't support custom comparator functions. Consult the documentation of the specific model
	 *   implementation.
	 * @public
	 * @alias sap.ui.model.Sorter
	 * @extends sap.ui.base.Object
	 */
	var Sorter = BaseObject.extend("sap.ui.model.Sorter", /** @lends sap.ui.model.Sorter.prototype */ {

		constructor : function(vSorterInfo, bDescending, vGroup, fnComparator) {
			let sPath = vSorterInfo;
			if (typeof vSorterInfo === "object") {
				sPath = vSorterInfo.path;
				bDescending = vSorterInfo.descending;
				vGroup = vSorterInfo.group;
				fnComparator = vSorterInfo.comparator;
			}
			this.sPath = sPath;

			// if a model separator is found in the path, extract model name
			var iSeparatorPos = this.sPath.indexOf(">");
			if (iSeparatorPos > 0) {
				// Model names are ignored, this must be kept for compatibility reasons. But using model names in the
				// sorter path make no technical sense as the binding cannot access any other models.
				Log.error("Model names are not allowed in sorter-paths: \"" + this.sPath + "\"");
				this.sPath = this.sPath.substr(iSeparatorPos + 1);
			}

			this.bDescending = bDescending;
			this.vGroup = vGroup;
			if (typeof vGroup == "boolean" && vGroup) {
				this.fnGroup = function(oContext) {
					return oContext.getProperty(this.sPath);
				};
			}
			if (typeof vGroup == "function") {
				this.fnGroup = vGroup;
			}
			this.fnCompare = fnComparator;
		},

		/**
		 * Returns a group object, at least containing a "key" property for group detection.
		 * May contain additional properties as provided by a custom group function.
		 *
		 * @param {sap.ui.model.Context} oContext the binding context
		 * @return {Object<string, any>} An object containing a key property and optional custom properties
		 * @public
		 */
		getGroup : function(oContext) {
			var oGroup = this.fnGroup(oContext);
			if (typeof oGroup === "string" || typeof oGroup === "number" || typeof oGroup === "boolean" || oGroup == null) {
				oGroup = {
					key: oGroup
				};
			}
			return oGroup;
		},

		/**
		 * Returns the group function of this Sorter. If grouping is not enabled on this Sorter, it will return
		 * undefined, if no explicit group function has been defined the default group function is returned.
		 * The returned function is bound to its Sorter, so it will group according to its own property path,
		 * even if it is used in the context of another Sorter.
		 *
		 * @return {function} The group function
		 * @public
		 */
		getGroupFunction : function() {
			return this.fnGroup && this.fnGroup.bind(this);
		},

		/**
		 * Returns the binding path for this sorter; see the path parameter of {@link sap.ui.model.Sorter#constructor}.
		 *
		 * @returns {string} The binding path
		 * @public
		 * @since 1.131.0
		 */
		getPath() {
			return this.sPath;
		},

		/**
		 * Whether to sort in descending order; see the descending parameter of {@link sap.ui.model.Sorter#constructor}.
		 *
		 * @returns {boolean} Whether to sort in descending order
		 * @public
		 * @since 1.131.0
		 */
		isDescending() {
			return this.bDescending;
		}

	});

	/**
	 * Compares two values
	 *
	 * This is the default comparator function used for clientside sorting, if no custom comparator is given in the
	 * constructor. It does compare just by using equal/less than/greater than with automatic type casting, except
	 * for null values, which are last in ascending order, and string values where localeCompare is used.
	 *
	 * The comparator method returns -1, 0 or 1, depending on the order of the two items and is
	 * suitable to be used as a comparator method for Array.sort.
	 *
	 * @param {any} a the first value to compare
	 * @param {any} b the second value to compare
	 * @returns {int} -1, 0 or 1 depending on the compare result
	 * @public
	 */
	Sorter.defaultComparator = function(a, b) {
		if (a == b) {
			return 0;
		}
		if (b == null) {
			return -1;
		}
		if (a == null) {
			return 1;
		}
		if (typeof a == "string" && typeof b == "string") {
			return a.localeCompare(b, Localization.getLanguageTag().toString());
		}
		if (a < b) {
			return -1;
		}
		if (a > b) {
			return 1;
		}
		return 0;
	};

	return Sorter;

});