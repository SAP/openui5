/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Label.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"sap/ui/core/LabelEnablement",
	"./thirdparty/Label"
], function(WebComponent, library, LabelEnablement) {
	"use strict";

	var WrappingType = library.WrappingType;

	/**
	 * Constructor for a new <code>Label</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Label</code> is a component used to represent a label for elements like input, textarea, select. <br>
	 * <br>
	 * The <code>for</code> property of the <code>sap.ui.webc.main.Label</code> must be the same as the id attribute of the related input element.<br>
	 * <br>
	 * Screen readers read out the label, when the user focuses the labelled control. <br>
	 * <br>
	 * The <code>sap.ui.webc.main.Label</code> appearance can be influenced by properties, such as <code>required</code> and <code>wrappingType</code>. The appearance of the Label can be configured in a limited way by using the design property. For a broader choice of designs, you can use custom styles.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Label
	 * @implements sap.ui.core.Label
	 */
	var Label = WebComponent.extend("sap.ui.webc.main.Label", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-label-ui5",
			interfaces: [
				"sap.ui.core.Label"
			],
			properties: {

				/**
				 * Defines whether an asterisk character is added to the component text. <br>
				 * <br>
				 * <b>Note:</b> Usually indicates that user input (bound with the <code>for</code> property) is required. In that case the <code>required</> property of the corresponding input should also be set.
				 */
				required: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether colon is added to the component text. <br>
				 * <br>
				 * <b>Note:</b> Usually used in forms.
				 */
				showColon: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the content of the control
				 */
				text: {
					type: "string",
					defaultValue: "",
					mapping: "textContent"
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines how the text of a component will be displayed when there is not enough space. <br>
				 * <b>Note:</b> for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
				 */
				wrappingType: {
					type: "sap.ui.webc.main.WrappingType",
					defaultValue: WrappingType.None
				}
			},
			associations: {

				/**
				 * Association to the labelled control.
				 * <br>
				 *
				 * By default, the label sets the for attribute to the ID of the labelled control. This can be changed by implementing the function getIdForLabel on the labelled control.
				 */
				labelFor: {
					type: "sap.ui.core.Control",
					multiple: false,
					mapping: {
						type: "property",
						to: "for"
					}
				}
			},
			designtime: "sap/ui/webc/main/designtime/Label.designtime"
		}
	});

	LabelEnablement.enrich(Label.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Label;
});
