/*!
 * ${copyright}
 */

// Provides control sap.m.SelectionDetailsItemField.
sap.ui.define(["jquery.sap.global", "sap/ui/core/Element"],
	function(jQuery, Element) {
	"use strict";

	/**
	 * Constructor for a new SelectionDetailsItemField.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This Element provides a means to fill an {@link sap.m.SelectionDetailsItem} with content.
	 * It is used for a form-like display of a label followed by a value with an optional unit.
	 * If the unit is used, the value is displayed bold.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.SelectionDetailsItemField
	 * @experimental Since 1.48 This control is still under development and might change at any point in time.
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionDetailsItemField = Element.extend("sap.m.SelectionDetailsItemField", /** @lends sap.m.SelectionDetailsItemField.prototype */ {
		metadata : {
			library : "sap.m",
			properties : {
				/**
				 * Determines whether or not a navigation event is triggered on press.
				 */
				label: { type: "string", group: "Data" },

				/**
				 * The value of the field.
				 */
				value: { type: "string", group: "Data" },

				/**
				 * The display value of the field. If this property is set, it overrides the value property and is displayed as is.
				 */
				displayValue: { type: "string", defaultValue: null, group: "Data" },

				/**
				 * The unit of the given value. If this unit is given, the field is displayed bold.
				 */
				unit: { type: "string", defaultValue: null, group: "Data" }
			}
		}
	});

	return SelectionDetailsItemField;

});
