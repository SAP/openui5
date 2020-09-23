/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Button.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./library",
	"sap/ui/core/library",
	"./thirdparty/ui5-wc-bundles/Button"
], function(WebComponent, library, coreLibrary) {
	"use strict";

	var ButtonDesign = library.ButtonDesign;
	var TextDirection = coreLibrary.TextDirection;

	/**
	 * Constructor for a new <code>Button</code>.
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
	 * @alias sap.ui.webcomponents.Button
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Button = WebComponent.extend("sap.ui.webcomponents.Button", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-button",
			properties: {

				text: {
					type: "string",
					mapping: "textContent"
				},

				design: {
					type: "sap.ui.webcomponents.ButtonDesign",
					defaultValue: ButtonDesign.Default
				},

				disabled: {
					type: "boolean"
				},

				icon: {
					type: "string"
				},

				iconEnd: {
					type: "boolean"
				},

				iconSize: {
					type: "string",
					defaultValue: undefined
				},

				submits: {
					type: "boolean"
				},

				width : {
					type : "sap.ui.core.CSSSize",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				textDirection : {
					type : "sap.ui.core.TextDirection",
					group : "Appearance",
					defaultValue : TextDirection.Inherit,
					mapping: {
						type: "attribute",
						to: "dir",
						formatter: "_mapTextDirection" // TODO explore having functions here (ref)
					}
				}
			},
			events: {
				click: {}
			}
		}
	});

	/**
	 * Maps the "textDirection" property to the "dir" attribute
	 * @param sTextDirection
	 * @returns {*}
	 * @private
	 */
	Button.prototype._mapTextDirection = function(sTextDirection) {
		if (sTextDirection === TextDirection.Inherit) {
			return null;
		}

		return sTextDirection.toLowerCase();
	};

	return Button;
});
