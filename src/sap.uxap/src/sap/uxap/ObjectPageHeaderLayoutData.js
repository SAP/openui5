/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageHeaderLayoutData.
sap.ui.define(["sap/ui/core/LayoutData", "./library"], function (LayoutData, library) {
	"use strict";

	/**
	 * Constructor for a new <code>ObjectPageHeaderLayoutData</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A {@link sap.ui.core.LayoutData} element that can be added to controls used in the
	 * <code>headerContent</code> aggregation of the <code>ObjectPageLayout</code>.
	 *
	 * <b>Note:</b> This element is only taken into account when the <code>sap.uxap.ObjectPageLayout</code> control is used together with
	 * <code>sap.uxap.ObjectPageHeader</code> as value of <code>headerTitle</code>.
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
