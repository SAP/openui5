/*!
 * ${copyright}
 */

// Provides control sap.m.P13nPanel.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'], function(jQuery, library, Control) {
	"use strict";

	/**
	 * Constructor for a new P13nPanel.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * 
	 * @class tbd
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 * 
	 * @constructor
	 * @public
	 * @alias sap.m.P13nPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nPanel = Control.extend("sap.m.P13nPanel", /** @lends sap.m.P13nPanel.prototype */
	{
		metadata : {
			library : "sap.m",
			properties : {
				/**
				 * Title text appears in the panel
				 */
				title : {
					type : "string",
					group : "Appearance",
					defaultValue : null
				},

				/**
				 * tbd
				 */
				type : {
					type : "sap.m.P13nPanelType",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * makes the vertical Scrolling on the P13nDialog enabled when the panel is shown
				 */
				verticalScrolling : {
					type : "boolean",
					group : "Misc",
					defaultValue : true
				}
			},
			defaultAggregation : "items",
			aggregations : {

				/**
				 * tbd
				 */
				items : {
					type : "sap.m.P13nItem",
					multiple : true,
					singularName : "item",
					bindable : "bindable"
				}
			}
		}
	});

	/**
	 * This method can be overwritten by subclass in order to prevent navigation to another panel. This could be the case
	 * if some content on the panel is considered 'invalid'.
	 * 
	 * @returns {boolean} true if it is allowed to navigate away from this panel, false if it is not allowed
	 * @public
	 */
	P13nPanel.prototype.onBeforeNavigation = function() {
		return true;
	};

	/**
	 * This method can be overwritten by subclass in order to cleanup after navigation, e.g. to remove invalid content on
	 * the panel.
	 * 
	 * @public
	 */
	P13nPanel.prototype.onAfterNavigation = function() {
		return;
	};

	return P13nPanel;

}, /* bExport= */true);
