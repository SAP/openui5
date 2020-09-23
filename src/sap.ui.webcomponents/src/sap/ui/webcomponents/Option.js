/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Option.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./thirdparty/ui5-wc-bundles/Option"
], function(WebComponent) {
	"use strict";

	/**
	 * Constructor for a new <code>Option</code>.
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
	 * @alias sap.ui.webcomponents.Option
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Option = WebComponent.extend("sap.ui.webcomponents.Option", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-option",
			properties: {

				text: {
					type: "string",
					mapping: "textContent"
				},

				/**
				 * Defines the selected state of the <code>ui5-option</code>.
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				selected: {
					type: "boolean"
				},

				/**
				 * Defines the <code>icon</code> source URI.
				 * <br><br>
				 * <b>Note:</b>
				 * SAP-icons font provides numerous buil-in icons. To find all the available icons, see the
				 * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
				 *
				 * @type {string}
				 * @public
				 */
				icon: {
					type: "string",
					defaultValue: null,
				},

				/**
				 * Defines the value of the <code>ui5-select</code> inside an HTML Form element when this <code>ui5-option</code> is selected.
				 * For more information on HTML Form support, see the <code>name</code> property of <code>ui5-select</code>.
				 *
				 * @type {string}
				 * @public
				 */
				value: {
					type: "string"
				},
			}
		}
	});

	return Option;
});
