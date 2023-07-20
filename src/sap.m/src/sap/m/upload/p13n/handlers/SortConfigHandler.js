/*!
 * ${copyright}
 */

/**
 *
 *
 * Configuration handler for sorting state based on flex layer
 *
 * @internal
 * @private
 * @experimental
 */


sap.ui.define(["sap/m/upload/p13n/handlers/BaseConfigHandler"], function (BaseConfigHandler) {
	"use strict";

	const SortConfigHandler = BaseConfigHandler.extend("sap.m.upload.p13n.handlers.SortConfigHandler", {});

	const EVENT_NAME = "uploadSetTableSortStateChange";

	SortConfigHandler.getEventName = function () {
		return EVENT_NAME;
	};

	SortConfigHandler.prototype.modifyState = function (oPayload, oExistingConfig) {
		const oContent = oPayload.content,
				sAggregation = oContent.targetAggregation,
				oConfig = oExistingConfig || {};

			oConfig.properties ??= {};
			oConfig.properties[sAggregation] ??= {};

			if (oContent.deleted) {
				oContent.deleted.forEach((oEntry) => {
					oConfig.properties[sAggregation][oEntry.key] = { key: oEntry.key, prevIndex: oEntry.prevIndex, prevDescending: oEntry.prevDescending, sorted: false };
				});
			}
			if (oContent.moved) {
				oContent.moved.forEach((oEntry) => {
					oConfig.properties[sAggregation][oEntry.key] = { key: oEntry.key, index: oEntry.index, descending: oEntry.descending, sorted: true };
				});
			}
			if (oContent.inserted) {
				oContent.inserted.forEach((oEntry) => {
					oConfig.properties[sAggregation][oEntry.key] = { key: oEntry.key, index: oEntry.index, descending: oEntry.descending, sorted: true };
				});
			}

			return oConfig;
	};

	return SortConfigHandler;
});
