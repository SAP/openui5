/*!
 * ${copyright}
 */
/**
 *
 *
 * State Change Handler for the filter related data based on flexibility
 *
 * @internal
 * @private
 *
 */


sap.ui.define([], function () {
	"use strict";

	const FilterStateChangeHandler = {};

	FilterStateChangeHandler.createRevertData = function (oContent) {
		const oRevertData = { targetAggregation: oContent.targetAggregation };
		if (oContent.deleted) {
			oRevertData.inserted = oContent.deleted.map((oEntry) => {
				return {
					key: oEntry.key,
					index: oEntry.prevIndex,
					path: oEntry.prevPath,
					operator: oEntry.prevOperator,
					value: oEntry.prevValue
				};
			});
		}
		if (oContent.moved) {
			oRevertData.moved = oContent.moved.map((oEntry) => {
				return {
					key: oEntry.key,
					index: oEntry.prevIndex,
					prevIndex: oEntry.index,
					path: oEntry.prevPath,
					prevPath: oEntry.path,
					operator: oEntry.prevOperator,
					prevOperator: oEntry.operator,
					value: oEntry.prevValue,
					prevValue: oEntry.value
				};
			});
		}
		if (oContent.inserted) {
			oRevertData.deleted = oContent.inserted.map((oEntry) => {
				return {
					key: oEntry.key,
					prevIndex: oEntry.index,
					prevPath: oEntry.path,
					prevOperator: oEntry.operator,
					prevValue: oEntry.value
				};
			});
		}
		return oRevertData;
	};

	return FilterStateChangeHandler;
});
