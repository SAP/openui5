/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/m/Input',
	'sap/ui/mdc/field/FieldInputRenderer'
	], function(
		Input,
		FieldInputRenderer
	) {
	"use strict";

	/**
	 * Constructor for a new <code>FieldInput</code>.
	 *
	 * The <code>FieldInput</code> enhanced the <code>sap.m.Input</code> control to add aria attributes
	 * and other <code>sap.ui.mdc.field.FieldBase</code> specific logic.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Base type for <code>FieldInput</code> control.
	 * @extends sap.m.Input
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.81.0
	 * @alias sap.ui.mdc.field.FieldInput
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldInput = Input.extend("sap.ui.mdc.field.FieldInput", /** @lends sap.ui.mdc.field.FieldInput */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Sets the aria attributes added to the <code>Input</code> control.
				 *
				 * The object contains aria attribudes in a <code>aria</code> node,
				 * Additional attributes like <code>role</code> or <code>autocomplete</code> are on root level.
				 */
				ariaAttributes: {
					type: "object",
					defaultValue: {},
					byValue: true
				}
			}
		}
	});

	return FieldInput;

});
