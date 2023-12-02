/*
 * !${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element"
], (Element) => {
	"use strict";

	/**
	 * Constructor for a new SelectionDetailsActions.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @class The <code>SelectionDetailsActions</code> is used to provide additional functionality to the Details popover.
	 *
	 * @public
	 * @since 1.88
	 * @alias sap.ui.mdc.chart.SelectionDetailsActions
	 */
	const SelectionDetailsActions = Element.extend("sap.ui.mdc.chart.SelectionDetailsActions", {

		metadata: {
			library: "sap.ui.mdc",
			aggregations: {
				/**
				 * Action <code>item</code> shown in the Items area of the details popover.
				 */
				detailsItemActions: {
					type: "sap.ui.core.Item",
					multiple: true
				},
				/**
				 * Action <code>item</code> shown in the Details area of the details.
				 */
				detailsActions: {
					type: "sap.ui.core.Item",
					multiple: true
				},
				/**
				 * Action <code>item</code> shown in the Groups area of the details.
				 */
				actionGroups: {
					type: "sap.ui.core.Item",
					multiple: true
				}
			}
		}
	});

	return SelectionDetailsActions;
});