/*!
 * ${copyright}
 */

// Provides control sap.m.SelectionDetailsItemLine.
sap.ui.define(["jquery.sap.global", "sap/ui/core/Element", 'sap/ui/base/Interface'],
	function(jQuery, Element, Interface) {
	"use strict";

	/**
	 * Constructor for a new SelectionDetailsItemLine.
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
	 * @private
	 * @alias sap.m.SelectionDetailsItemLine
	 * @experimental Since 1.48 This control is still under development and might change at any point in time.
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionDetailsItemLine = Element.extend("sap.m.SelectionDetailsItemLine", /** @lends sap.m.SelectionDetailsItemLine.prototype */ {
		metadata : {
			library : "sap.m",
			properties : {
				/**
				 * The label that is shown as the first part of the line.
				 * It may contain the name of the currently selected dimension or measure.
				 */
				label: { type: "string", group: "Data" },

				/**
				 * The value of the line, for example the value of the currently selected measure.
				 */
				value: { type: "string", group: "Data" },

				/**
				 * The display value of the line. If this property is set, it overrides the value property and is displayed as is.
				 */
				displayValue: { type: "string", defaultValue: null, group: "Data" },

				/**
				 * The unit of the given value. If this unit is given, the line is displayed bold.
				 */
				unit: { type: "string", defaultValue: null, group: "Data" }

			}
		}
	});

	/**
	 * Returns the public facade of the SelectionDetailsItemLine for non inner framework usages.
	 * @returns {sap.ui.base.Interface} the reduced facade for outer framework usages.
	 * @protected
	 */
	SelectionDetailsItemLine.prototype._aFacadeMethods = ["setLabel"];
	SelectionDetailsItemLine.prototype.getFacade = function() {
		var oFacade = new Interface(this, SelectionDetailsItemLine.prototype._aFacadeMethods);
		this.getFacade = jQuery.sap.getter(oFacade);
		return oFacade;
	};

	return SelectionDetailsItemLine;
});
