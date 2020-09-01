/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Switch.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./thirdparty/ui5-wc-bundles/Switch"
], function(WebComponent, WC) {
	"use strict";

	/**
	 * Constructor for a new <code>Switch</code>.
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
	 * @alias sap.ui.webcomponents.Switch
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Switch = WebComponent.extend("sap.ui.webcomponents.Switch", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-switch",
			properties: {

				/**
				 * Defines if the <code>ui5-switch</code> is checked.
				 * <br><br>
				 * <b>Note:</b> The property can be changed with user interaction,
				 * either by cliking/tapping on the <code>ui5-switch</code>, or by
				 * pressing the <code>Enter</code> or <code>Space</code> key.
				 *
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				checked: {
					type: "boolean",
					updateOnEvent: "change"
				},

				/**
				 * Defines whether the <code>ui5-switch</code> is disabled.
				 * <br><br>
				 * <b>Note:</b> A disabled <code>ui5-switch</code> is noninteractive.
				 *
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				disabled: {
					type: "boolean"
				},

				/**
				 * Defines the text of the <code>ui5-switch</code> when switched on.
				 *
				 * <br><br>
				 * <b>Note:</b> We recommend using short texts, up to 3 letters (larger texts would be cut off).
				 * @type {string}
				 * @defaultvalue ""
				 * @public
				 */
				textOn: {
					type: "string"
				},

				/**
				 * Defines the text of the <code>ui5-switch</code> when switched off.
				 * <br><br>
				 * <b>Note:</b> We recommend using short texts, up to 3 letters (larger texts would be cut off).
				 * @type {string}
				 * @defaultvalue ""
				 * @public
				 */
				textOff: {
					type: "string"
				},

				/**
				 * Defines the <code>ui5-switch</code> type.
				 * <br><br>
				 * <b>Note:</b> If <code>graphical</code> type is set,
				 * positive and negative icons will replace the <code>textOn</code> and <code>textOff</code>.
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				graphical: {
					type: "boolean"
				},
			},
			events: {
				change: {}
			}
		}
	});

	return Switch;
});
