/*
* ! {copyright}
*/
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(merge, JsControlTreeModifier) {
	"use strict";

	var xConfigAPI = {};

	/**
	 * Enhances the xConfig object for a given mdc control instance.
	 *
	 * @param {sap.ui.core.Element} oControl The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @param {object} oModificationPayload.name The affected property name
	 * @param {object} oModificationPayload.controlMeta Object describing which config is affected
	 * @param {object} oModificationPayload.controlMeta.aggregation The affected aggregation name (such as <code>columns</code> or <code>filterItems</code>)
	 * @param {object} oModificationPayload.controlMeta.property The affected property name (such as <code>width</code> or <code>lable</code>)
	 * @param {object} oModificationPayload.value The value that should be written in nthe xConfig
	 * @param {object} [oModificationPayload.propertyBag] Optional propertybag for different modification handler derivations
	 *
	 * @returns {Promise<object>} Promise resolving to the adapted xConfig object
	 */
	xConfigAPI.enhanceConfig = function(oControl, oModificationPayload) {
		var mPropertyBag = oModificationPayload.propertyBag;
		var oModifier = mPropertyBag ? mPropertyBag.modifier : JsControlTreeModifier;
		var oControlMetadata;
		var oXConfig;

		return oModifier.getControlMetadata(oControl)
			.then(function(oRetrievedControlMetadata) {
				oControlMetadata = oRetrievedControlMetadata;
				oModificationPayload.controlMetadata = oControlMetadata;
				return oModifier.getAggregation(oControl, "customData");
			})
			.then(function(aCustomData) {

				return Promise.all(aCustomData.map(function(oCustomData){
					return oModifier.getProperty(oCustomData, "key");
				})).then(function(aCustomDataKeys){
					return aCustomData.reduce(function(oResult, mCustomData, iIndex){
						return aCustomDataKeys[iIndex] === "xConfig" ? mCustomData : oResult;
					}, undefined);
				});
			})
			.then(function(oRetrievedXConfig) {
				oXConfig = oRetrievedXConfig;
				if (oXConfig) {
					return oModifier.getProperty(oXConfig, "value")
					.then(function(sConfig){
						return merge({}, JSON.parse(sConfig.replace(/\\/g, '')));
					});
				}
				return {
					aggregations: {}
				};
			})
			.then(function(oExistingConfig) {

				var oConfig = xConfigAPI.createConfigObject(oControl, oModificationPayload, oExistingConfig);

				var oAppComponent = mPropertyBag ? mPropertyBag.appComponent : undefined;

				var pDelete = Promise.resolve();
				if (oXConfig && oControl.isA) {
					pDelete = oModifier.removeAggregation(oControl, "customData", oXConfig)
					.then(function(){
						return oModifier.destroy(oXConfig);
					});
				}

				return pDelete.then(function(){
					return oModifier.createAndAddCustomData(oControl, "xConfig", JSON.stringify(oConfig), oAppComponent)
					.then(function(){
						return merge({}, oConfig);
					});
				});
			});
	};

	/**
	 * Returns a copy of the xConfig object
	 *
	 * @param {sap.ui.core.Element} oControl The according element which should be checked
	 * @param {object} [oModificationPayload] An object providing a modification handler specific payload
	 * @param {object} [oModificationPayload.propertyBag] Optional propertybag for different modification handler derivations
	 *
	 * @returns {Promise<object>|object} A promise resolving to the adapted xConfig object or the object directly
	 */
	xConfigAPI.readConfig = function(oControl, oModificationPayload) {
		var oConfig, oAggregationConfig;

		if (oModificationPayload) {
			var oModifier = oModificationPayload.propertyBag ? oModificationPayload.propertyBag.modifier : JsControlTreeModifier;
			return oModifier.getAggregation(oControl, "customData")
				.then(function(aCustomData) {
					return Promise.all(aCustomData.map(function(oCustomData){
						return oModifier.getProperty(oCustomData, "key");
					})).then(function(aCustomDataKeys){
						return aCustomData.reduce(function(oResult, mCustomData, iIndex){
							return aCustomDataKeys[iIndex] === "xConfig" ? mCustomData : oResult;
						}, undefined);
					});
				})
				.then(function(oAggregationConfig) {
					if (oAggregationConfig) {
						return oModifier.getProperty(oAggregationConfig, "value")
							.then(function(sValue) {
								return merge({}, JSON.parse(sValue.replace(/\\/g, '')));
							});
					}
					return null;
				});
		}

		// These functions are used instead of the modifier to avoid that the
		// entire call stack is changed to async when it's not needed
		var fnGetAggregationSync = function(oParent, sAggregationName) {
			var fnFindAggregation = function(oControl, sAggregationName) {
				if (oControl) {
					if (oControl.getMetadata) {
						var oMetadata = oControl.getMetadata();
						var oAggregations = oMetadata.getAllAggregations();
						if (oAggregations) {
							return oAggregations[sAggregationName];
						}
					}
				}
				return undefined;
			};

			var oAggregation = fnFindAggregation(oParent, sAggregationName);
			if (oAggregation) {
				return oParent[oAggregation._sGetter]();
			}
			return undefined;
		};

		var fnGetPropertySync = function(oControl, sPropertyName) {
			var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
			if (oMetadata) {
				var sPropertyGetter = oMetadata._sGetter;
				return oControl[sPropertyGetter]();
			}
			return undefined;
		};

		oAggregationConfig = fnGetAggregationSync(oControl, "customData").find(function(oCustomData){
			return fnGetPropertySync(oCustomData, "key") == "xConfig";
		});
		oConfig = oAggregationConfig ? merge({}, JSON.parse(fnGetPropertySync(oAggregationConfig, "value").replace(/\\/g, ''))) : null;
		return oConfig;
	};

	/**
	 * Enhances the xConfig object for a given mdc control instance.
	 *
	 * @param {sap.ui.core.Element} oControl The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @param {object} oModificationPayload.name The affected property name
	 * @param {object} oModificationPayload.controlMeta Object describing which config is affected
	 * @param {object} oModificationPayload.controlMeta.aggregation The affected aggregation name (such as <code>columns</code> or <code>filterItems</code>)
	 * @param {object} oModificationPayload.controlMeta.property The affected property name (such as <code>width</code> or <code>lable</code>)
	 * @param {object} oModificationPayload.value The value that should be written in nthe xConfig
	 * @param {object} [oExistingConfig] Already existing config to be enhanced by the payload
	 *
	 * @returns {object} The adapted xConfig object
	 */
	xConfigAPI.createConfigObject = function(oControl, oModificationPayload, oExistingConfig) {

		var sPropertyInfoKey = oModificationPayload.name;
		var mControlMeta = oModificationPayload.controlMeta;

		var sAffectedProperty = mControlMeta.property;

		var vValue = oModificationPayload.value;
		var oControlMetadata = oModificationPayload.controlMetadata || oControl.getMetadata();
		var sAffectedAggregation = mControlMeta.aggregation;
		var sAggregationName = sAffectedAggregation ? sAffectedAggregation : oControlMetadata.getDefaultAggregation().name;
		var oConfig = oExistingConfig || {
			aggregations: {}
		};

		if (!oConfig.aggregations.hasOwnProperty(sAggregationName)) {
			if (oControlMetadata.hasAggregation(sAggregationName)) {
				oConfig.aggregations[sAggregationName] = {};
			} else {
				throw new Error("The aggregation " + sAggregationName + " does not exist for" + oControl);
			}
		}

		if (!oConfig.aggregations.hasOwnProperty(sPropertyInfoKey)) {
			oConfig.aggregations[sAggregationName][sPropertyInfoKey] = {};
		}

		if (vValue !== null) {
			oConfig.aggregations[sAggregationName][sPropertyInfoKey][sAffectedProperty] = vValue;
		} else {
			delete oConfig.aggregations[sAggregationName][sPropertyInfoKey][sAffectedProperty];

			//Delete empty property name object
			if (Object.keys(oConfig.aggregations[sAggregationName][sPropertyInfoKey]).length === 0) {
				delete oConfig.aggregations[sAggregationName][sPropertyInfoKey];

				//Delete empty aggregation name object
				if (Object.keys(oConfig.aggregations[sAggregationName]).length === 0) {
					delete oConfig.aggregations[sAggregationName];
				}
			}
		}

		return oConfig;
	};

	return xConfigAPI;

});
