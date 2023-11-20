/*!
 * ${copyright}
 */

/**
 *
 *
 * State Change Handler for the columns related data
 *
 * @internal
 * @private
 *
 */

sap.ui.define([], function () {
	"use strict";

	const ColumnsStateChangeHandler = {};

	ColumnsStateChangeHandler.createRevertData = function (oContent) {
		const oRevertData = { targetAggregation: oContent.targetAggregation };
		if (oContent.deleted) {
			oRevertData.inserted = oContent.deleted.map((oEntry) => {
				return { key: oEntry.key, index: oEntry.prevIndex };
			});
		}
		if (oContent.moved) {
			oRevertData.moved = oContent.moved.map((oEntry) => {
				return { key: oEntry.key, index: oEntry.prevIndex, prevIndex: oEntry.index };
			});
		}
		if (oContent.inserted) {
			oRevertData.deleted = oContent.inserted.map((oEntry) => {
				return { key: oEntry.key, prevIndex: oEntry.index };
			});
		}
		return oRevertData;
	};

	return ColumnsStateChangeHandler;
});
