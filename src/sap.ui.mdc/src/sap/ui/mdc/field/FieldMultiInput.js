/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/MultiInput',
	'sap/ui/mdc/field/FieldMultiInputRenderer'
	], function(
		MultiInput,
		FieldMultiInputRenderer
	) {
	"use strict";

	/**
	 * Constructor for a new <code>FieldMultiInput</code>.
	 *
	 * The <code>FieldMultiInput</code> control enhances the {@link sap.m.MultiInput MultiInput} control to add ARIA attributes
	 * and other {@link sap.ui.mdc.field.FieldBase FieldBase}-specific logic.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The <code>FieldMultiInput</code> control is used to render a multi-input field inside a control based on {@link sap.ui.mdc.field.FieldBase FieldBase}.
	 * @extends sap.m.MultiInput
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.81.0
	 * @alias sap.ui.mdc.field.FieldMultiInput
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldMultiInput = MultiInput.extend("sap.ui.mdc.field.FieldMultiInput", /** @lends sap.ui.mdc.field.FieldMultiInput.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Sets the ARIA attributes added to the <code>MultiInput</code> control.
				 *
				 * The object contains ARIA attributes in an <code>aria</code> node.
				 * Additional attributes, such as <code>role</code>, <code>autocomplete</code> or <code>valueHelpEnabled</code>, are added on root level.
				 */
				ariaAttributes: {
					type: "object",
					defaultValue: {},
					byValue: true
				}
			}
		},
		renderer: FieldMultiInputRenderer
	});

	return FieldMultiInput;

});
