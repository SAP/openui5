/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageHeaderLayoutData.
sap.ui.define(["sap/ui/core/LayoutData", "./library"], function (LayoutData, library) {
	"use strict";

	/**
	 * Constructor for a new ObjectPageHeaderLayoutData.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This is a LayoutData Element that can be added to a control if this control is used within an ObjectPage headerContent aggregation
	 * @extends sap.ui.core.LayoutData
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @since 1.26
	 * @alias sap.uxap.ObjectPageHeaderLayoutData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectPageHeaderLayoutData = LayoutData.extend("sap.uxap.ObjectPageHeaderLayoutData", /** @lends sap.uxap.ObjectPageHeaderLayoutData.prototype */ {
		metadata: {

			library: "sap.uxap",
			properties: {

				/**
				 * If this property is set the control will be visible (or not) in a small sized layout.
				 */
				visibleS: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * If this property is set the control will be visible (or not) in a medium sized layout.
				 */
				visibleM: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * If this property is set the control will be visible (or not) in a large sized layout.
				 */
				visibleL: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * If this property is set the control will display a separator before it.
				 */
				showSeparatorBefore: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * If this property is set the control will display a separator after it.
				 */
				showSeparatorAfter: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * If this property is set the control will take the provided size.
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: 'auto'}
			}
		}
	});

	/*!
	 * ${copyright}
	 */

	return ObjectPageHeaderLayoutData;

});
