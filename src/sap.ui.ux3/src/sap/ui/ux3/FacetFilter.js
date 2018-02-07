/*!
 * ${copyright}
 */

// Provides control sap.ui.ux3.FacetFilter.
sap.ui.define([
    'jquery.sap.global',
    'sap/ui/core/Control',
    './library',
    "./FacetFilterRenderer"
],
	function(jQuery, Control, library, FacetFilterRenderer) {
	"use strict";



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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FacetFilter = Control.extend("sap.ui.ux3.FacetFilter", /** @lends sap.ui.ux3.FacetFilter.prototype */ { metadata : {

		library : "sap.ui.ux3",
		properties : {
			/**
			 * If the value is "Auto" - the Facet Filter takes the whole available height. If "Fixed" , then the default number of Facet Filter Items (5) is visible.
			 */
			visibleItemCountMode : {type : "sap.ui.ux3.VisibleItemCountMode", group : "Appearance", defaultValue : sap.ui.ux3.VisibleItemCountMode.Fixed}
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

}, /* bExport= */ true);
