/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.BusyIndicator.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./library",
	"./thirdparty/ui5-wc-bundles/BusyIndicator"
], function(WebComponent, library, WC) {
	"use strict";

	var BusyIndicatorSize = library.BusyIndicatorSize;

	/**
	 * Constructor for a new <code>BusyIndicator</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.BusyIndicator
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BusyIndicator = WebComponent.extend("sap.ui.webcomponents.BusyIndicator", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-busyindicator",
			properties: {

				width : {
					type : "sap.ui.core.CSSSize",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				display: {
					type: "string",
					defaultValue: null,
					mapping: "style"
				},

				/**
				 * Defines text to be displayed below the busy indicator. It can be used to inform the user of the current operation.
				 * @type {String}
				 * @public
				 * @defaultvalue ""
				 * @since 1.0.0-rc.7
				 */
				text: {
					type: "string"
				},

				/**
				 * Defines the size of the <code>ui5-busyindicator</code>.
				 * <br><br>
				 * <b>Note:</b> Available options are "Small", "Medium", and "Large".
				 *
				 * @type {BusyIndicatorSize}
				 * @defaultvalue "Medium"
				 * @public
				 */
				size: {
					type: "sap.ui.webcomponents.BusyIndicatorSize",
					defaultValue: BusyIndicatorSize.Medium,
				},

				/**
				 * Defines if the busy indicator is visible on the screen. By default it is not.
				 *
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				active: {
					type: "boolean"
				},
			},
			defaultAggregation: "content",
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		}
	});

	return BusyIndicator;
});
