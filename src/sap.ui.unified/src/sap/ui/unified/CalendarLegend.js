/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.CalendarLegend.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', './library'],
	function(jQuery, Control, library) {
	"use strict";


	
	/**
	 * Constructor for a new CalendarLegend.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A legend for the Calendar Control. Displays special dates colors with their corresponding description. The aggregation specialDates can be set herefor.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.unified.CalendarLegend
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CalendarLegend = Control.extend("sap.ui.unified.CalendarLegend", /** @lends sap.ui.unified.CalendarLegend.prototype */ { metadata : {
	
		library : "sap.ui.unified",
		properties : {
	
			/**
			 * Width of the columns created in which the items are arranged.
			 */
			columnWidth : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : '120px'}
		},
		aggregations : {
	
			/**
			 * Items to be displayed.
			 */
			items : {type : "sap.ui.unified.CalendarLegendItem", multiple : true, singularName : "item"}
		}
	}});
	
	// IE9 workaround for responsive layout of legend items
	CalendarLegend.prototype.onAfterRendering = function() {
		if (sap.ui.Device.browser.msie) {
			if (sap.ui.Device.browser.version < 10) {
				jQuery(".sapUiUnifiedLegendItem").css("width", this.getColumnWidth() + 4 + "px").css("display", "inline-block");
			}
		}
	};
	

	return CalendarLegend;

}, /* bExport= */ true);
