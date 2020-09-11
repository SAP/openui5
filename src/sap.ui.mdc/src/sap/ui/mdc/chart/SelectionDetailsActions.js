/*
 * !${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element"
], function(Element) {
	"use strict";

	// The aggregation to feed details actions for dapaoint selection in the mdc chart
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
}, true);
