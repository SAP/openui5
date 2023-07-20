/*!
 * ${copyright}
 */
/**
 *
 *
 * State Change Handler for the soritng related data based on flexibility
 *
 * @internal
 * @private
 *
 */

sap.ui.define([], function () {
	"use strict";

	const SortStateChangeHandler = {};

	SortStateChangeHandler.createRevertData = function (oContent) {
		const oRevertData = { targetAggregation: oContent.targetAggregation };
		if (oContent.deleted) {
			oRevertData.inserted = oContent.deleted.map((oEntry) => {
				return { key: oEntry.key, index: oEntry.prevIndex, descending: oEntry.prevDescending };
			});
		}
		if (oContent.moved) {
			oRevertData.moved = oContent.moved.map((oEntry) => {
				return {
					key: oEntry.key,
					index: oEntry.prevIndex,
					prevIndex: oEntry.index,
					descending: oEntry.prevDescending,
					prevDescending: oEntry.descending
				};
			});
		}
		if (oContent.inserted) {
			oRevertData.deleted = oContent.inserted.map((oEntry) => {
				return { key: oEntry.key, prevIndex: oEntry.index, prevDescending: oEntry.descending };
			});
		}
		return oRevertData;
	};

	return SortStateChangeHandler;
});
