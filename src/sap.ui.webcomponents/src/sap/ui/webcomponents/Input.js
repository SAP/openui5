/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Input.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"sap/ui/core/library",
	"./library",
	"./thirdparty/ui5-wc-bundles/Input"
], function(WebComponent, coreLibrary, library, WC) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var InputType = library.InputType;

	/**
	 * Constructor for a new <code>Input</code>.
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
	 * @alias sap.ui.webcomponents.Input
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Input = WebComponent.extend("sap.ui.webcomponents.Input", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-input",
			properties: {
				width : {
					type : "sap.ui.core.CSSSize",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				disabled: {
					type: "boolean"
				},

				highlight: {
					type: "boolean"
				},

				placeholder: {
					type: "string"
				},

				readonly: {
					type: "boolean"
				},

				required: {
					type: "boolean"
				},

				type: {
					type: "sap.ui.webcomponents.InputType",
					defaultValue: InputType.Text,
				},

				value: {
					type: "string",
					updateOnEvent: "change" // TODO: could be more than one
				},

				valueState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None,
					updateOnEvent: "change"
				},

				name: {
					type: "string"
				},

				showSuggestions: {
					type: "boolean"
				},

				maxlength: {
					type: "int"
				},

				valueStateMessage: {
					type: "string",
					mapping: {
						type: "slot",
						to: "div" // should be the alias, not the HTML element to slot to
					}
				}
			},
			aggregations: {
				suggestionItems: {
					type: "sap.ui.webcomponents.SuggestionItem",
					multiple: true
				},
				icon: {
					type: "sap.ui.core.Control",
					multiple: false,
					slot: "icon"
				}
			},
			events: {
				"change": {},
				"input": {},
				"submit": {},
				"suggestionItemSelect": {}
			}
		}
	});

	return Input;
});
