/*!
 * ${copyright}
 */

/**
 *
 *
 * Config handler for Grouping state
 *
 * @internal
 * @private
 *
 */


sap.ui.define(["sap/m/upload/p13n/handlers/BaseConfigHandler"], function (BaseConfigHandler) {
	"use strict";

	const GroupConfigHandler = BaseConfigHandler.extend("sap.m.upload.p13n.handlers.GroupConfigHandler", {});

	const EVENT_NAME = "uploadSetTableGroupStateChange";

	GroupConfigHandler.getEventName = function () {
		return EVENT_NAME;
	};

	GroupConfigHandler.prototype.modifyState = function (oPayload, oExistingConfig) {
		const oContent = oPayload.content,
			sAggregation = oContent.targetAggregation,
			oConfig = oExistingConfig || {};

		oConfig.properties ??= {};
		oConfig.properties[sAggregation] ??= {};

		if (oContent.deleted) {
			oContent.deleted.forEach((oEntry) => {
				oConfig.properties[sAggregation][oEntry.key] = { key: oEntry.key, prevIndex: oEntry.prevIndex, grouped: false };
			});
		}
		if (oContent.moved) {
			oContent.moved.forEach((oEntry) => {
				oConfig.properties[sAggregation][oEntry.key] = { key: oEntry.key, index: oEntry.index, grouped: true };
			});
		}
		if (oContent.inserted) {
			oContent.inserted.forEach((oEntry) => {
				oConfig.properties[sAggregation][oEntry.key] = { key: oEntry.key, index: oEntry.index, grouped: true };
			});
		}

		return oConfig;
	};

	return GroupConfigHandler;
});
