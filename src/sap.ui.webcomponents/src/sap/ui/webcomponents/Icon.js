/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Icon.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"sap/ui/core/library",
	"./thirdparty/ui5-wc-bundles/Icon"
], function(WebComponent, coreLibrary, WC) {
	"use strict";

	var IconLevel = coreLibrary.IconLevel;

	/**
	 * Constructor for a new <code>Icon</code>.
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
	 * @alias sap.ui.webcomponents.Icon
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Icon = WebComponent.extend("sap.ui.webcomponents.Icon", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-icon",
			properties: {

				width : {
					type : "sap.ui.core.CSSSize",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				height : {
					type : "sap.ui.core.CSSSize",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				color : {
					type : "string",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				backgroundColor : {
					type : "string",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				interactive: {
					type: "boolean"
				},

				name: {
					type: "string"
				},

				accessibleName: {
					type: "string"
				},

				showTooltip: {
					type: "boolean"
				}
			},
			events: {
				click: {}
			}
		}
	});

	return Icon;
});
