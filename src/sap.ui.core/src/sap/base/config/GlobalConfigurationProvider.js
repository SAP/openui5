
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/config/camelize"
], (camelize) => {
	"use strict";

	let oConfig;
	const oWriteableConfig = Object.create(null);
	const rAlias = /^(sapUiXx|sapUi|sap)((?:[A-Z0-9][a-z]*)+)$/; //for getter
	const mFrozenProperties = Object.create(null);
	let bFrozen = false;
	let Configuration;

	function createConfig() {
		oConfig = Object.create(null);
		globalThis["sap-ui-config"] ??= {};
		let mOriginalGlobalParams = {};
		const oGlobalConfig = globalThis["sap-ui-config"];
		if (typeof oGlobalConfig === "object")  {
			for (const sKey in oGlobalConfig) {
				const sNormalizedKey = camelize("sapUi-" + sKey);
				const vFrozenValue = mFrozenProperties[sNormalizedKey];
				if (!sNormalizedKey) {
					sap.ui.loader._.logger.error("Invalid configuration option '" + sKey + "' in global['sap-ui-config']!");
				} else if (Object.hasOwn(oConfig, sNormalizedKey)) {
					sap.ui.loader._.logger.error("Configuration option '" + sKey + "' was already set by '" + mOriginalGlobalParams[sNormalizedKey] + "' and will be ignored!");
				} else if (Object.hasOwn(mFrozenProperties, sNormalizedKey) && oGlobalConfig[sKey] !== vFrozenValue) {
					oConfig[sNormalizedKey] = vFrozenValue;
					sap.ui.loader._.logger.error("Configuration option '" + sNormalizedKey + "' was frozen and cannot be changed to " + oGlobalConfig[sKey] + "!");
				} else {
					oConfig[sNormalizedKey] = oGlobalConfig[sKey];
					mOriginalGlobalParams[sNormalizedKey] = sKey;
				}
			}
		}
		mOriginalGlobalParams = undefined;
	}
	function freeze() {
		if (!bFrozen) {
			createConfig();
			Configuration._.invalidate();
			bFrozen = true;
		}
	}

	function get(sKey, bFreeze) {
		if (Object.hasOwn(mFrozenProperties,sKey)) {
			return mFrozenProperties[sKey];
		}
		let vValue = oWriteableConfig[sKey] || oConfig[sKey];
		if (!Object.hasOwn(oConfig, sKey) && !Object.hasOwn(oWriteableConfig, sKey)) {
			const vMatch = sKey.match(rAlias);
			const sLowerCaseAlias = vMatch ? vMatch[1] + vMatch[2][0] + vMatch[2].slice(1).toLowerCase() : undefined;
			if (sLowerCaseAlias) {
				vValue = oWriteableConfig[sLowerCaseAlias] || oConfig[sLowerCaseAlias];
			}
		}
		if (bFreeze) {
			mFrozenProperties[sKey] = vValue;
		}
		return vValue;
	}

	function set(sKey, vValue) {
		if (Object.hasOwn(mFrozenProperties, sKey) || bFrozen) {
			sap.ui.loader._.logger.error("Configuration option '" + sKey + "' was frozen and cannot be changed to " + vValue + "!");
		} else {
			oWriteableConfig[sKey] = vValue;
		}
	}

    function setConfiguration(Config) {
        Configuration = Config;
    }

	const GlobalConfigurationProvider = {
		get: get,
		set: set,
		freeze: freeze,
        setConfiguration: setConfiguration
	};

	createConfig();

	return GlobalConfigurationProvider;
});