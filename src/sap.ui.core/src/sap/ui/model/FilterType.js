/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides enumeration sap.ui.model.FilterType
sap.ui.define(function() {
	"use strict";


	/**
	 * Enumeration of the possible filter types.
	 *
	 * Each {@link sap.ui.model.ListBinding list binding} maintains two separate lists of filters:
	 * one for filters defined by the control that owns the binding, and another list for filters that
	 * an application can define in addition. When executing the filter operation, both sets
	 * of filters are combined.
	 *
	 * See method {@link sap.ui.model.ListBinding#filter ListBinding#filter} on how to specify the
	 * filter type. When no filter type is given to that method, the behavior depends on the specific
	 * model implementation and should be documented in the API reference for that model.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.model.FilterType
	 */
	var FilterType = {
		/**
		 * Filters which are provided by the application.
		 * @public
		 */
		Application: "Application",

		/**
		 * Filters which are set by a control itself.
		 *
		 * Some controls implement filter capabilities as part of their behavior,
		 * e.g. table columns or facet filters. When such controls define filters
		 * for a binding, they should use filter type <code>Control</code> to keep
		 * their filters separated from filters that the application might define
		 * in addition.
		 *
		 * @public
		 */
		Control: "Control"
	};

	return FilterType;

}, /* bExport= */ true);
