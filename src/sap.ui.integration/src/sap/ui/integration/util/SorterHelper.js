/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/model/Sorter"
], function (
	BindingResolver,
	Sorter
) {
	"use strict";

	/**
	 * Utility class helping with sap.ui.model.Sorter control.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.integration.util.SorterHelper
	 */
	const SorterHelper = { };

	/**
	 * Define the sorting of a group.
	 * @param {object} oGroup The group which will be sorted
	 * @returns {sap.ui.model.Sorter}  Sorter for a list bindings.
	 */
	SorterHelper.getGroupSorter = function (oGroup) {
		var bDescendingOrder = false;
		if (oGroup.order.dir && oGroup.order.dir === "DESC") {
			bDescendingOrder = true;
		}
		var oSorter = new Sorter(oGroup.order.path, bDescendingOrder, function (oContext) {
			return BindingResolver.resolveValue(oGroup.title, oContext.getModel(), oContext.getPath());
		});

		return oSorter;
	};

	return SorterHelper;
});