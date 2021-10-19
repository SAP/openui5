/*
 * !${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element"
], function(Element) {
	"use strict";

	/**
 	 * The aggregation to feed details actions for dapaoint selection in the mdc chart
	 *
	 * @param {string} [sId] Optional ID for the new element; generated automatically if no non-empty ID is given
	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] Object with initial settings for the new control
	 *
	 * @class The aggregation to feed details actions for dapaoint selection in the mdc chart
	 *
	 * @extends sap.ui.mdc.Element
	 * @abstract
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.chart.SelectionDetailsActions
	 *
	 * @private
	 * @since 1.61
	 * @experimental As of version 1.61
	 * @ui5-restricted sap.ui.mdc
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
}, true);
