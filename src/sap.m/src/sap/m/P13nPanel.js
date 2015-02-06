/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nPanel.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Control'
], function(jQuery, library, Control) {
	"use strict";

	/**
	 * Constructor for a new P13nPanel.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class tbd
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.26.0
	 * @alias sap.m.P13nPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nPanel = Control.extend("sap.m.P13nPanel", /** @lends sap.m.P13nPanel.prototype */
	{
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Title text appears in the panel
				 * @since 1.26.0
				 */
				title: {
					type: "string",
					group: "Appearance",
					defaultValue: null
				},

				/**
				 * Panel type for generic use
				 * @since 1.26.0
				 */
				type: {
					type: "sap.m.P13nPanelType",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * makes the vertical Scrolling on the P13nDialog enabled when the panel is shown
				 * @since 1.26.0
				 */
				verticalScrolling: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Aggregation of items
				 * @since 1.26.0
				 */
				items: {
					type: "sap.m.P13nItem",
					multiple: true,
					singularName: "item",
					bindable: "bindable"
				}
			},
			events: {
				/**
				 * Due to performance the data of the panel can be requested in lazy mode e.g. when the panel is displayed
				 * @since 1.28.0
				 */
				beforeNavigationTo: {}
			}
		}
	});

	/**
	 * This method can be overwritten by subclass in order to return a payload
	 * 
	 * @public
	 * @since 1.28.0
	 */
	P13nPanel.prototype.getOkPayload = function() {
		return {};
	};
	
	/**
	 * @public
	 * @since 1.28.0
	 */
	P13nPanel.prototype.beforeNavigationTo = function() {
		this.fireBeforeNavigationTo();
	};

	/**
	 * This method can be overwritten by subclass in order to prevent navigation to another panel. This could be the case if some content on the panel
	 * is considered 'invalid'.
	 * 
	 * @returns {boolean} true if it is allowed to navigate away from this panel, false if it is not allowed
	 * @public
	 * @since 1.28.0
	 */
	P13nPanel.prototype.onBeforeNavigationFrom = function() {
		return true;
	};

	/**
	 * This method can be overwritten by subclass in order to cleanup after navigation, e.g. to remove invalid content on the panel.
	 * 
	 * @public
	 * @since 1.28.0
	 */
	P13nPanel.prototype.onAfterNavigationFrom = function() {
		return;
	};

	return P13nPanel;

}, /* bExport= */true);
