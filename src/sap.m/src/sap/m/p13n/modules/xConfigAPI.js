/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], (merge, JsControlTreeModifier) => {
	"use strict";

	/**
	 * @namespace
	 * @private
	 * @alias sap.m.p13n.modules.xConfigAPI
	 */
	const xConfigAPI = {};

	/**
	 * Enhances the xConfig object for a given mdc control instance.
	 *
	 * @param {sap.ui.core.Element} oControl The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @param {object} oModificationPayload.key The affected metadata property key
	 * @param {object} oModificationPayload.controlMeta Object describing which config is affected
	 * @param {object} oModificationPayload.controlMeta.aggregation The affected aggregation name (such as <code>columns</code> or <code>filterItems</code>)
	 * @param {object} oModificationPayload.property The affected property name (such as <code>width</code> or <code>lable</code>)
	 * @param {object} oModificationPayload.value The value that should be written in nthe xConfig
	 * @param {object} [oModificationPayload.propertyBag] Optional propertybag for different modification handler derivations
	 * @param {boolean} [oModificationPayload.markAsModified] Optional flag that triggers a state change event for the engine registration process
	 *
	 * @returns {Promise<object>} Promise resolving to the adapted xConfig object
	 */
	xConfigAPI.enhanceConfig = (oControl, oModificationPayload) => {
		const mPropertyBag = oModificationPayload.propertyBag;
		const oModifier = mPropertyBag ? mPropertyBag.modifier : JsControlTreeModifier;
		let oControlMetadata;
		let oXConfig;

		return oModifier.getControlMetadata(oControl)
			.then((oRetrievedControlMetadata) => {
				oControlMetadata = oRetrievedControlMetadata;
				oModificationPayload.controlMetadata = oControlMetadata;
				return oModifier.getAggregation(oControl, "customData");
			})
			.then((aCustomData) => {

				return Promise.all(aCustomData.map((oCustomData) => {
					return oModifier.getProperty(oCustomData, "key");
				})).then((aCustomDataKeys) => {
					return aCustomData.reduce((oResult, mCustomData, iIndex) => {
						return aCustomDataKeys[iIndex] === "xConfig" ? mCustomData : oResult;
					}, undefined);
				});
			})
			.then((oRetrievedXConfig) => {
				oXConfig = oRetrievedXConfig;
				if (oXConfig) {
					return oModifier.getProperty(oXConfig, "value")
						.then((sConfig) => {
							return merge({}, JSON.parse(sConfig.replace(/\\/g, '')));
						});
				}
				return {};
			})
			.then(async (oExistingConfig) => {

				let oConfig;
				if (oModificationPayload.controlMeta && oModificationPayload.controlMeta.aggregation) {
					await xConfigAPI.prepareAggregationConfig(oControl, oModificationPayload, oExistingConfig);
					oConfig = xConfigAPI.createAggregationConfig(oControl, oModificationPayload, oExistingConfig);
				} else {
					oConfig = xConfigAPI.createPropertyConfig(oControl, oModificationPayload, oExistingConfig);
				}

				if (oModificationPayload.markAsModified) {
					oConfig.modified = true;
				}

				const oAppComponent = mPropertyBag ? mPropertyBag.appComponent : undefined;

				let pDelete = Promise.resolve();
				if (oXConfig && oControl.isA) {
					pDelete = oModifier.removeAggregation(oControl, "customData", oXConfig)
						.then(() => {
							return oModifier.destroy(oXConfig);
						});
				}

				return pDelete.then(() => {
					return oModifier.createAndAddCustomData(oControl, "xConfig", JSON.stringify(oConfig), oAppComponent)
						.then(() => {
							return merge({}, oConfig);
						});
				});
			});
	};

	xConfigAPI.getCurrentItemState = async function(oControl, oModificationPayload, oConfig, sAggregationName) {
		const changeType = oModificationPayload?.changeType;
		if (!oModificationPayload.propertyBag || !changeType || changeType.indexOf("Item") === -1) {
			return;
		}
		const {modifier, appComponent} = oModificationPayload.propertyBag;
		const aTargetAggregationItems = await modifier.getAggregation(oControl, sAggregationName);
		const aAggregationItems = aTargetAggregationItems || [];
		const aCurrentState = [];
		if (oConfig && Object.keys(oConfig.aggregations[sAggregationName]).length > 0) {
			Object.entries(oConfig.aggregations[sAggregationName]).forEach(([sKey, oItem]) => {
				if (oItem.visible !== false) {
					aCurrentState.push({key: sKey, position: oItem.position});
				}
			});
			aCurrentState.sort((a,b) => a.position - b.position);
			aCurrentState.map((o) => delete o.position);
		} else {
			await aAggregationItems.reduce(async (pAccum, oItem, iIndex) => {
				const pCurrentAccum = await pAccum; //synchronize async loop
				const sId = appComponent ? appComponent.getRootControl()?.getLocalId(modifier.getId(oItem)) : modifier.getId(oItem);
				const vRelevant = await modifier.getProperty(oItem, "visible");
				if (vRelevant) {
					aCurrentState.push({key: sId});
				}
				return pCurrentAccum;
			}, Promise.resolve());
		}

		return aCurrentState;
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
	xConfigAPI.readConfig = (oControl, oModificationPayload) => {

		if (oModificationPayload) {
			const oModifier = oModificationPayload.propertyBag ? oModificationPayload.propertyBag.modifier : JsControlTreeModifier;
			return oModifier.getAggregation(oControl, "customData")
				.then((aCustomData) => {
					return Promise.all(aCustomData.map((oCustomData) => {
						return oModifier.getProperty(oCustomData, "key");
					})).then((aCustomDataKeys) => {
						return aCustomData.reduce((oResult, mCustomData, iIndex) => {
							return aCustomDataKeys[iIndex] === "xConfig" ? mCustomData : oResult;
						}, undefined);
					});
				})
				.then((oAggregationConfig) => {
					if (oAggregationConfig) {
						return oModifier.getProperty(oAggregationConfig, "value")
							.then((sValue) => {
								return merge({}, JSON.parse(sValue.replace(/\\/g, '')));
							});
					}
					return null;
				});
		}

		// These functions are used instead of the modifier to avoid that the
		// entire call stack is changed to async when it's not needed
		const fnGetAggregationSync = (oParent, sAggregationName) => {
			const fnFindAggregation = (oControl, sAggregationName) => {
				if (oControl) {
					if (oControl.getMetadata) {
						const oMetadata = oControl.getMetadata();
						const oAggregations = oMetadata.getAllAggregations();
						if (oAggregations) {
							return oAggregations[sAggregationName];
						}
					}
				}
				return undefined;
			};

			const oAggregation = fnFindAggregation(oParent, sAggregationName);
			if (oAggregation) {
				return oParent[oAggregation._sGetter]();
			}
			return undefined;
		};

		const fnGetPropertySync = (oControl, sPropertyName) => {
			const oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
			if (oMetadata) {
				const sPropertyGetter = oMetadata._sGetter;
				return oControl[sPropertyGetter]();
			}
			return undefined;
		};

		const oAggregationConfig = fnGetAggregationSync(oControl, "customData").find((oCustomData) => {
			return fnGetPropertySync(oCustomData, "key") == "xConfig";
		});
		const oConfig = oAggregationConfig ? merge({}, JSON.parse(fnGetPropertySync(oAggregationConfig, "value").replace(/\\/g, ''))) : null;
		return oConfig;
	};

	const updateIndex = function(oControl, oConfig, oModificationPayload) {
		const key = oModificationPayload.key || oModificationPayload.name;
		const mControlMeta = oModificationPayload.controlMeta;
		const vValue = oModificationPayload.value;
		const oControlMetadata = oModificationPayload.controlMetadata || oControl.getMetadata();
		const sAffectedAggregation = mControlMeta.aggregation;
		const sAggregationName = sAffectedAggregation ? sAffectedAggregation : oControlMetadata.getDefaultAggregation().name;
		const {currentState} = oModificationPayload;
		const newIndex = vValue.index;

		const {operation} = oModificationPayload;
		const updatedState = merge([], currentState);

		const operationActions = {
			add: (affectedKey, index) => {
				updatedState.splice(index, 0, {key: affectedKey});
			},
			remove: (affectedKey, index) => {
				const currentItemState = updatedState?.find((item) => item.key == affectedKey);
				const currentItemIndex = updatedState?.indexOf(currentItemState);
				if (currentItemIndex > -1) {
					updatedState.splice(currentItemIndex, 1);
				}
			},
			move: (affectedKey, index) => {
				const currentItemState = updatedState?.find((item) => item.key == affectedKey);
				const currentItemIndex = updatedState?.indexOf(currentItemState);
				if (currentItemIndex > -1) {
					const [movedItem] = updatedState.splice(currentItemIndex, 1);
					updatedState.splice(index, 0, movedItem);
				}
			}
		};

		if (currentState instanceof Array && operation && operationActions[operation] instanceof Function) {
			operationActions[operation](key, newIndex);
		}

		updatedState.forEach((item, index) => {
			//find the xConfig item with the same key as item.key
			const xConfigItem = oConfig.aggregations[sAggregationName]?.[item.key];
			if (xConfigItem && xConfigItem.hasOwnProperty("position")) {
				xConfigItem.position = index;
			} else if (!xConfigItem) {
				//find the index of the current item key in currentState
				const currentItemIndex = currentState?.findIndex((currentItem) => currentItem.key === item.key);

				if (index !== undefined && currentItemIndex !== index && index !== -1) {
					oConfig.aggregations[sAggregationName][item.key] = {
						position: index
					};
				}
			}
		});
	};

	xConfigAPI.prepareAggregationConfig = async (oControl, oModificationPayload, oExistingConfig) => {
		const mControlMeta = oModificationPayload.controlMeta;
		const oControlMetadata = oModificationPayload.controlMetadata || oControl.getMetadata();
		const sAffectedAggregation = mControlMeta.aggregation;
		const sAggregationName = sAffectedAggregation ? sAffectedAggregation : oControlMetadata.getDefaultAggregation().name;
		const oConfig = oExistingConfig || {};

		if (!oConfig.hasOwnProperty("aggregations")) {
			oConfig.aggregations = {};
		}

		if (!oConfig.aggregations.hasOwnProperty(sAggregationName)) {
			if (oControlMetadata.hasAggregation(sAggregationName)) {
				oConfig.aggregations[sAggregationName] = {};
				const currentState = await xConfigAPI.getCurrentItemState(oControl, oModificationPayload, oConfig, sAggregationName);
				currentState?.forEach((oItem) => {
					oConfig.aggregations[sAggregationName][oItem.key] = {position: oItem.position};
				});
			} else {
				throw new Error("The aggregation " + sAggregationName + " does not exist for" + oControl);
			}
		}

		oModificationPayload.currentState = oModificationPayload.currentState || await xConfigAPI.getCurrentItemState(oControl, oModificationPayload, oConfig, sAggregationName);
	};

	/**
	 * Enhances the xConfig object for a given mdc control instance.
	 *
	 * @param {sap.ui.core.Element} oControl The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @param {object} oModificationPayload.key The affected property name
	 * @param {object} oModificationPayload.controlMeta Object describing which config is affected
	 * @param {object} oModificationPayload.controlMeta.aggregation The affected aggregation name (such as <code>columns</code> or <code>filterItems</code>)
	 * @param {object} oModificationPayload.property The affected property name (such as <code>width</code> or <code>lable</code>)
	 * @param {object} oModificationPayload.value The value that should be written in nthe xConfig
	 * @param {object} [oExistingConfig] Already existing config to be enhanced by the payload
	 *
	 * @returns {object} The adapted xConfig object
	 */
	xConfigAPI.createAggregationConfig = (oControl, oModificationPayload, oExistingConfig) => {

		const sPropertyInfoKey = oModificationPayload.key || oModificationPayload.name;
		const mControlMeta = oModificationPayload.controlMeta;

		const sAffectedProperty = oModificationPayload.property;

		const vValue = oModificationPayload.value;
		const oControlMetadata = oModificationPayload.controlMetadata || oControl.getMetadata();
		const sAffectedAggregation = mControlMeta.aggregation;
		const sAggregationName = sAffectedAggregation ? sAffectedAggregation : oControlMetadata.getDefaultAggregation().name;
		const oConfig = oExistingConfig || {};

		if (!oConfig.hasOwnProperty("aggregations")) {
			oConfig.aggregations = {};
		}

		if (!oConfig.aggregations.hasOwnProperty(sAggregationName)) {
			if (oControlMetadata.hasAggregation(sAggregationName)) {
				oConfig.aggregations[sAggregationName] = {};
			} else {
				throw new Error("The aggregation " + sAggregationName + " does not exist for" + oControl);
			}
		}

		if (!oConfig.aggregations[sAggregationName].hasOwnProperty(sPropertyInfoKey)) {
			oConfig.aggregations[sAggregationName][sPropertyInfoKey] = {};
		}

		if (vValue !== null || (vValue && vValue.hasOwnProperty("value") && vValue.value !== null)) {
			switch (oModificationPayload.operation) {
				case "move":
					oConfig.aggregations[sAggregationName][sPropertyInfoKey][sAffectedProperty] = vValue.index;
					if (vValue.persistenceIdentifier) {
						oConfig.aggregations[sAggregationName][sPropertyInfoKey]["persistenceIdentifier"] = vValue.persistenceIdentifier;
					}
					updateIndex(oControl, oConfig, oModificationPayload);
					break;
				case "remove":
				case "add":
				default:
					//Note: consider aligning xConfig value handling between sap.m and sap.ui.mdc
					if (vValue.hasOwnProperty("value")) {
						oConfig.aggregations[sAggregationName][sPropertyInfoKey][sAffectedProperty] = vValue.value;
						if (vValue.index !== undefined) {
							oConfig.aggregations[sAggregationName][sPropertyInfoKey]["position"] = vValue.index;
						}
						if (vValue.persistenceIdentifier) {
							oConfig.aggregations[sAggregationName][sPropertyInfoKey]["persistenceIdentifier"] = vValue.persistenceIdentifier;
						}
					} else {
						oConfig.aggregations[sAggregationName][sPropertyInfoKey][sAffectedProperty] = vValue;
					}
					updateIndex(oControl, oConfig, oModificationPayload);
					break;
			}

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

	/**
	 * Enhances the xConfig object for a given mdc control instance.
	 *
	 * @param {sap.ui.core.Element} oControl The according element which should be checked
	 * @param {object} oModificationPayload An object providing a modification handler specific payload
	 * @param {object} oModificationPayload.key The affected property name
	 * @param {object} oModificationPayload.property Object describing which config is affected
	 * @param {object} oModificationPayload.value The value that should be written in nthe xConfig
	 * @param {object} [oExistingConfig] Already existing config to be enhanced by the payload
	 *
	 * @returns {object} The adapted xConfig object
	 */
	xConfigAPI.createPropertyConfig = (oControl, oModificationPayload, oExistingConfig) => {

		//var sDataKey = oModificationPayload.key;

		const vValue = oModificationPayload.value;
		//var oControlMetadata = oModificationPayload.controlMetadata || oControl.getMetadata();
		const sAffectedProperty = oModificationPayload.property;
		const oConfig = oExistingConfig || {};

		if (!oConfig.properties) {
			oConfig.properties = {};
		}

		if (!oConfig.properties.hasOwnProperty(sAffectedProperty)) {
			oConfig.properties[sAffectedProperty] = [];
		}

		const sOperation = oModificationPayload.operation;

		const oItem = oConfig.properties[sAffectedProperty].find((oEntry) => {
			return oEntry.key === oModificationPayload.key;
		});

		if (oItem && sOperation !== "add") {
			oConfig.properties[sAffectedProperty].splice(oConfig.properties[sAffectedProperty].indexOf(oItem), 1);
		}

		if (sOperation !== "remove") {
			oConfig.properties[sAffectedProperty].splice(oModificationPayload.value.index, 0, vValue);
		}

		return oConfig;
	};

	return xConfigAPI;

});