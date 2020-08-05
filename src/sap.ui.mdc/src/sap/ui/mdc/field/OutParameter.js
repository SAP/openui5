/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/field/InParameter',
	'sap/ui/mdc/enum/OutParameterMode'
	], function(
			InParameter,
			OutParameterMode
	) {
	"use strict";

	/**
	 * Constructor for a new <code>OutParameter</code>.
	 *
	 * The <code>FieldValueHelp</code> element supports out parameters. The binding to the data is defined in this element.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Base type for <code>OutParameter</code> control.
	 * @extends sap.ui.mdc.field.InParameter
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @since 1.66.0
	 * @alias sap.ui.mdc.field.OutParameter
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var OutParameter = InParameter.extend("sap.ui.mdc.field.OutParameter", /** @lends sap.ui.mdc.field.OutParameter.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Fixed value which is set on the <code>OutParameter</code> element.
				 *
				 * <b>Note:</b> This property is only used if <code>helpPath</code> is not set.
				 */
				fixedValue: {
					type: "any",
					defaultValue: null
				},
				/**
				 * Update mode of the <code>OutParameter</code> element.
				 */
				mode: {
					type: "sap.ui.mdc.enum.OutParameterMode",
					defaultValue: OutParameterMode.Always
				}
			},
			defaultProperty: "value"
		}
	});

	return OutParameter;

});
