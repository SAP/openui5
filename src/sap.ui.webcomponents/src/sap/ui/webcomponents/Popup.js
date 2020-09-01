/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Popup.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent"
], function(WebComponent) {
	"use strict";

	/**
	 * Constructor for a new <code>Popup</code>.
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
	 * @alias sap.ui.webcomponents.Popup
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Popup = WebComponent.extend("sap.ui.webcomponents.Popup", {
		metadata: {
			abstract: true,
			library: "sap.ui.webcomponents",
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
				}
			},
			aggregations: {

				content : {type : "sap.ui.core.Control", multiple : true, bindable : "bindable"},

				header : {type : "sap.ui.core.Control", multiple : false, slot : "header"},

				footer : {type : "sap.ui.core.Control", multiple : false, slot : "footer"},
			},
			events: {
				"beforeOpen": {},
				"afterOpen": {},
				"beforeClose": {},
				"afterClose": {}
			}
		}
	});

	return Popup;
});
