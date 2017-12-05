/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Element"],
	function(Element) {
	"use strict";

	/**
	 * Constructor for a new SelectionDetailsItemLine.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * This Element provides a means to fill an {@link sap.m.SelectionDetailsItem} with content.
	 * It is used for a form-like display of a label followed by a value with an optional unit.
	 * If the unit is used, the value is displayed bold.
	 * <b><i>Note:</i></b>It is protected and should ony be used within the framework itself.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @protected
	 * @alias sap.m.SelectionDetailsItemLine
	 * @since 1.48.0
	 * @ui5-metamodel This element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionDetailsItemLine = Element.extend("sap.m.SelectionDetailsItemLine", /** @lends sap.m.SelectionDetailsItemLine.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * The label that is shown as the first part of the line.
				 * It may contain the name of the currently selected dimension or measure.
				 */
				label: { type: "string", group: "Data" },

				/**
				 * The value of the line, for example the value of the currently selected measure.
				 * Expected type is a string or a plain object, including date and time properties of type string.
				 */
				value: { type: "any", group: "Data" },

				/**
				 * The display value of the line. If this property is set, it overrides the value property and is displayed as is.
				 */
				displayValue: { type: "string", defaultValue: null, group: "Data" },

				/**
				 * The unit of the given value. If this unit is given, the line is displayed bold.
				 */
				unit: { type: "string", defaultValue: null, group: "Data" },

				/**
				 * A string to be rendered by the control as a line marker. This string must be a valid SVG definition.
				 * The only valid tags are: svg, path, line.
				 */
				lineMarker: {type: "string", defaultValue: null, group: "Data"}

			}
		}
	});

	/**
	 * Returns the value to be displayed in the line.
	 *
	 * @private
	 * @returns {string} The value text.
	 */
	SelectionDetailsItemLine.prototype._getValueToRender = function() {
		var sValue = "",
			oValue = this.getValue();
		if (jQuery.type(oValue) === "string") {
			sValue = oValue;
		} else if (jQuery.isPlainObject(oValue)) {
			if (oValue.day && oValue.day.length > 0) {
				sValue = oValue.day;
			}
			if (oValue.time && oValue.time.length > 0) {
				sValue = (sValue.length > 0) ? oValue.time + " " + sValue : oValue.time;
			}
		}
		return sValue;
	};

	return SelectionDetailsItemLine;
});
