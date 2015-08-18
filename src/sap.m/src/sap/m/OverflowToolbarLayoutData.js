/*!
 * ${copyright}
 */

// Provides control sap.m.OverflowToolbarLayoutData.
sap.ui.define(['sap/m/ToolbarLayoutData'],
	function(ToolbarLayoutData) {
	"use strict";

	/**
	 * Constructor for a new OverflowToolbarLayoutData.
	 *
	 * @param {string} [sId] id for the new element, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Holds layout data for the OverflowToolbar items.
	 * @extends sap.m.ToolbarLayoutData
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28
	 * @alias sap.m.OverflowToolbarLayoutData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var OverflowToolbarLayoutData = ToolbarLayoutData.extend("sap.m.OverflowToolbarLayoutData", /** @lends sap.m.OverflowToolbarLayoutData.prototype */ { metadata : {

		properties : {

			/**
			 * The OverflowToolbar item can or cannot move to the overflow area
			 *
			 * @deprecated Since version 1.32
			 */
			moveToOverflow : {type: "boolean", defaultValue: true, deprecated: true},

			/**
			 * The OverflowToolbar item can or cannot stay in the overflow area
			 *
			 * @deprecated Since version 1.32
			 */
			stayInOverflow : {type: "boolean", defaultValue: false, deprecated: true},

			/**
			 * Defines OverflowToolbar items priority, Available priorities ate NeverOverflow, High, Low, Disappear and AlwaysOverflow
			 *
			 * @public
			 * @since 1.32
			 */
			priority: {type: "sap.m.OverflowToolbarPriority", group: "Behavior", defaultValue: sap.m.OverflowToolbarPriority.High}
		}
	}});

	return OverflowToolbarLayoutData;

}, /* bExport= */ true);
