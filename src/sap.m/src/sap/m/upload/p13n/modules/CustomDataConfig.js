/*!
 * ${copyright}
 */


/**
 * Handles custom data for UploadSetWithTable control based on the flexibility provided data
 *
 * @private
 *
 */


sap.ui.define(
	[
		"sap/base/util/merge",
		"sap/ui/core/util/reflection/JsControlTreeModifier",
		"sap/m/upload/p13n/handlers/ColumnConfigHandler",
		"sap/m/upload/p13n/handlers/SortConfigHandler",
		"sap/m/upload/p13n/handlers/GroupConfigHandler",
		"sap/m/upload/p13n/handlers/FilterConfigHandler"
	],
	function (merge, JsControlTreeModifier, ColumnConfigHandler, SortConfigHandler, GroupConfigHandler, FilterConfigHandler) {
		"use strict";

		const CUSTOM_DATA_P13N_KEY = "p13nManagerData";

		const EVENT_HANDLERS = {
			[ColumnConfigHandler.getEventName()]: new ColumnConfigHandler(),
			[SortConfigHandler.getEventName()]: new SortConfigHandler(),
			[GroupConfigHandler.getEventName()]: new GroupConfigHandler(),
			[FilterConfigHandler.getEventName()]: new FilterConfigHandler()
		};

		const CustomDataConfig = {};

		CustomDataConfig.read = function (oControl) {
			if (!oControl || typeof oControl.getCustomData !== "function") {
				return undefined;
			}
			const aCustomData = oControl.getCustomData().filter((oEntry) => oEntry.getKey() === CUSTOM_DATA_P13N_KEY);
			return aCustomData.length ? merge({}, JSON.parse(aCustomData[0].getValue().replaceAll(/\\/g, ""))) : undefined;
		};

		CustomDataConfig.update = async function (oControl, oPayload) {
			const mPropertyBag = oPayload.propertyBag,
				oModifier = mPropertyBag.modifier ? mPropertyBag.modifier : JsControlTreeModifier;

			const oRawConfig = await CustomDataConfig.getRawConfig(oControl, oModifier, oPayload);
			let oExistingConfig = {};
			let oConfig = {};
			if (oRawConfig) {
				oExistingConfig = await oModifier
					.getProperty(oRawConfig, "value")
					.then((sConfig) => merge({}, JSON.parse(sConfig.replace(/\\/g, ""))));
			}

			if (EVENT_HANDLERS[oPayload.changeType]) {
				oConfig = EVENT_HANDLERS[oPayload.changeType].modifyState(oPayload, oExistingConfig);
			}

			let pDelete = Promise.resolve();
			if (oRawConfig && oControl.isA) {
				pDelete = oModifier.removeAggregation(oControl, "customData", oRawConfig).then(function () {
					return oModifier.destroy(oRawConfig);
				});
			}
			const oAppComponent = mPropertyBag ? mPropertyBag.appComponent : undefined;
			return pDelete.then(() => {
				return oModifier
					.createAndAddCustomData(oControl, CUSTOM_DATA_P13N_KEY, JSON.stringify(oConfig), oAppComponent)
					.then(function () {
						return merge({}, oConfig);
					});
			});
		};

		CustomDataConfig.getRawConfig = function (oControl, oModifier, oPayload) {
			return oModifier
				.getControlMetadata(oControl)
				.then((oControlMetadata) => {
					oPayload.controlMetadata = oControlMetadata;
					return oModifier.getAggregation(oControl, "customData");
				})
				.then((aCustomData) => {
					return Promise.all(
						aCustomData.map((oCustomDataEntry) => oModifier.getProperty(oCustomDataEntry, "key"))
					).then((aCustomDataKeys) =>
						aCustomData.reduce((oResult, mCustomData, iIndex) => {
							return aCustomDataKeys[iIndex] === CUSTOM_DATA_P13N_KEY ? mCustomData : oResult;
						}, undefined)
					);
				});
		};

		return CustomDataConfig;
	}
);
