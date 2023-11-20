/*!
 * ${copyright}
 */


/**
 *
 *
 * Configuration handler for columns state
 *
 * @internal
 * @private
 *
 */

sap.ui.define(["sap/m/upload/p13n/handlers/BaseConfigHandler"], function (BaseConfigHandler) {
	"use strict";

	const ColumnConfigHandler = BaseConfigHandler.extend("sap.m.upload.p13n.handlers.ColumnConfigHandler", {});

	const EVENT_NAME = "uploadSetTableColumnsStateChange";

	ColumnConfigHandler.getEventName = function () {
		return EVENT_NAME;
	};

	ColumnConfigHandler.prototype.modifyState = function (oPayload, oExistingConfig) {
		const oContent = oPayload.content,
				sAggregation = oContent.targetAggregation,
				oConfig = oExistingConfig || {};

			oConfig.aggregations ??= {};
			oConfig.aggregations[sAggregation] ??= {};

			if (oContent.deleted) {
				oContent.deleted.forEach((oEntry) => {
					oConfig.aggregations[sAggregation][oEntry.key] = { prevIndex: oEntry.prevIndex, visible: false };
				});
			}
			if (oContent.moved) {
				oContent.moved.forEach((oEntry) => {
					oConfig.aggregations[sAggregation][oEntry.key] = { index: oEntry.index, visible: true };
				});
			}
			if (oContent.inserted) {
				oContent.inserted.forEach((oEntry) => {
					oConfig.aggregations[sAggregation][oEntry.key] = { index: oEntry.index, visible: true };
				});
			}

			return oConfig;
	};

	return ColumnConfigHandler;
});
