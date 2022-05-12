/*
 * !${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element"
], function(Element) {
	"use strict";

	// The aggregation to feed details actions for datapoint selection in the mdc chart
	/**
     * Constructor for a new SelectionDetailsActions.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     * @extends sap.ui.core.Element
     * @author SAP SE
     * @class The SelectionDetailsActions are used to provide additional functionality to the Details popover.
     * @ui5-restricted sap.fe
     * @MDC_PUBLIC_CANDIDATE
     * @experimental
     * @since 1.88
     * @alias sap.ui.mdc.chart.SelectionDetailsActions
     */
	var SelectionDetailsActions = Element.extend("sap.ui.mdc.chart.SelectionDetailsActions", {

		metadata: {
			library: "sap.ui.mdc",
			aggregations: {
				detailsItemActions: {
					type: "sap.ui.core.Item",
					multiple: true
				},
				detailsActions: {
					type: "sap.ui.core.Item",
					multiple: true
				},
				actionGroups: {
					type: "sap.ui.core.Item",
					multiple: true
				}
			}
		}
	});

	return SelectionDetailsActions;
});
