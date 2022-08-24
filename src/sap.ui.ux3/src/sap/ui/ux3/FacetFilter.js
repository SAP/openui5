/*!
 * ${copyright}
 */

// Provides control sap.ui.ux3.FacetFilter.
sap.ui.define([
    'sap/ui/core/Control',
    './library',
    './FacetFilterRenderer'
],
	function(Control, library, FacetFilterRenderer) {
    "use strict";



	// shortcut for sap.ui.ux3.VisibleItemCountMode
	var VisibleItemCountMode = library.VisibleItemCountMode;



	/**
	 * Constructor for a new FacetFilter.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * FacetFilter Control.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.38, replaced by {@link sap.m.FacetFilter}
	 * @alias sap.ui.ux3.FacetFilter
	 */
	var FacetFilter = Control.extend("sap.ui.ux3.FacetFilter", /** @lends sap.ui.ux3.FacetFilter.prototype */ { metadata : {

		deprecated: true,
		library : "sap.ui.ux3",
		properties : {
			/**
			 * If the value is "Auto" - the Facet Filter takes the whole available height. If "Fixed" , then the default number of Facet Filter Items (5) is visible.
			 */
			visibleItemCountMode : {type : "sap.ui.ux3.VisibleItemCountMode", group : "Appearance", defaultValue : VisibleItemCountMode.Fixed}
		},
		aggregations : {

			/**
			 * Facet Filter list represents the list of the filter values and the title of this list.
			 */
			lists : {type : "sap.ui.ux3.FacetFilterList", multiple : true, singularName : "list"}
		}
	}});

	FacetFilter.prototype.init = function() {
		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};


	return FacetFilter;

});
