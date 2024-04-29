/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.vh.CollectiveSearchSelect.
sap.ui.define([
	"sap/ui/mdc/valuehelp/CollectiveSearchSelect",
	"sap/m/VariantManagement"
], (ValueHelpCollectiveSearchSelect, VariantManagement) => {
	"use strict";
	/**
	 * Constructor for a new <code>CollectiveSearchSelect</code>.
	 * @param {string} [sId] - ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new control
	 * @class Can be used to manage the <code>CollectiveSearchSelect</code> control search items.
	 * @extends sap.m.VariantManagement
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.87
	 * @alias sap.ui.mdc.filterbar.vh.CollectiveSearchSelect
	 * @deprecated since 1.124.0 - Please use the <code>sap.ui.mdc.valuehelp.CollectiveSearchSelect</code> control instead.
	 */
	const CollectiveSearchSelect = ValueHelpCollectiveSearchSelect.extend("sap.ui.mdc.filterbar.vh.CollectiveSearchSelect", /** @lends sap.ui.mdc.valuehelp.CollectiveSearchSelect.prototype */ {
		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * @param {sap.ui.core.RenderManager} oRm - <code>RenderManager</code> that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl - Object representation of the control that is rendered
		 */
		renderer: {
			renderer: function(oRm, oControl) {
				VariantManagement.getMetadata().getRenderer().render(oRm, oControl);
			}
		}
	});

	return CollectiveSearchSelect;
});