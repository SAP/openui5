/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/Utils"
], function(
	Log,
	ManagedObject,
	Storage,
	Utils
) {
	"use strict";

	let oSettingsInstance;
	let oLoadSettingsPromise;

	async function retrieveUserId() {
		const oUShellContainer = Utils.getUshellContainer();
		if (oUShellContainer) {
			try {
				const oUserInfoService = await Utils.getUShellService("UserInfo");
				return oUserInfoService.getUser()?.getId();
			} catch (oError) {
				Log.error(`Error getting service from Unified Shell: ${oError.message}`);
			}
		}
		return Promise.resolve("");
	}

	/**
	 * Holds all the system settings
	 *
	 * @class Settings class
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.fl.initial._internal.Settings
	 * @since 1.137
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	const Settings = ManagedObject.extend("sap.ui.fl.initial._internal.Settings", {
		metadata: {
			library: "sap.ui.fl",
			properties: {
				client: { type: "string" },
				hasPersoConnector: { type: "boolean", defaultValue: false },
				isAnnotationChangeEnabled: { type: "boolean", defaultValue: false },
				isAppVariantSaveAsEnabled: { type: "boolean", defaultValue: false },
				isAtoEnabled: { type: "boolean", defaultValue: false },
				isCondensingEnabled: { type: "boolean", defaultValue: false },
				isContextBasedAdaptationEnabled: { type: "boolean", defaultValue: false },
				isContextSharingEnabled: { type: "boolean", defaultValue: true },
				isKeyUser: { type: "boolean", defaultValue: false },
				isKeyUserTranslationEnabled: { type: "boolean", defaultValue: false },
				isLocalResetEnabled: { type: "boolean", defaultValue: false },
				isProductiveSystem: { type: "boolean", defaultValue: true },
				isPublicFlVariantEnabled: { type: "boolean", defaultValue: false },
				isPublicLayerAvailable: { type: "boolean", defaultValue: false },
				isPublishAvailable: { type: "boolean", defaultValue: false },
				isSeenFeaturesAvailable: { type: "boolean", defaultValue: false },
				isVariantAdaptationEnabled: { type: "boolean", defaultValue: false },
				isVariantAuthorNameAvailable: { type: "boolean", defaultValue: false },
				isVariantPersonalizationEnabled: { type: "boolean", defaultValue: true },
				isVariantSharingEnabled: { type: "boolean", defaultValue: false },
				system: { type: "string" },
				systemType: { type: "string" },
				userId: { type: "string" },
				versioning: { type: "object", defaultValue: {} }
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			ManagedObject.apply(this, aArgs);

			const oUriParameters = new URLSearchParams(window.location.search);
			if (oUriParameters.has("sap-ui-xx-rta-adaptations")) {
				this.setProperty("isContextBasedAdaptationEnabled", oUriParameters.get("sap-ui-xx-rta-adaptations") === "true");
			}
		}
	});

	function loadSettings() {
		oLoadSettingsPromise = Storage.loadFeatures().then(async function(oLoadedSettings) {
			const oSettingsProperties = Object.assign({}, oLoadedSettings);
			if (oSettingsProperties.logonUser) {
				oSettingsProperties.userId = oSettingsProperties.logonUser;
				delete oSettingsProperties.logonUser;
			} else {
				oSettingsProperties.userId = await retrieveUserId();
			}

			// to keep the properties to a minimum, delete no longer used properties
			delete oSettingsProperties.isZeroDowntimeUpgradeRunning;
			delete oSettingsProperties.isAtoAvailable;

			// The following line is used by the Flex Support Tool to set breakpoints - please adjust the tool if you change it!
			oSettingsInstance = new Settings(oSettingsProperties);
			return oSettingsInstance;
		});
		return oLoadSettingsPromise;
	}

	/**
	 * Resolves with the settings instance. If the settings were not yet loaded, it loads them first.
	 * @returns {Promise<Settings>} Resolves with the settings instance
	 */
	Settings.getInstance = async function() {
		if (!oSettingsInstance) {
			if (oLoadSettingsPromise) {
				await oLoadSettingsPromise;
			} else {
				await loadSettings();
			}
		}
		return oSettingsInstance;
	};

	/**
	 * If the settings instance is already loaded, it returns it. If not, it returns undefined.
	 * @returns {Settings|undefined} Returns the settings instance or undefined if it is not yet loaded
	 */
	Settings.getInstanceOrUndef = function() {
		return oSettingsInstance;
	};

	// This function is used in the test only
	Settings.clearInstance = function() {
		oSettingsInstance = undefined;
		oLoadSettingsPromise = undefined;
	};

	return Settings;
});
