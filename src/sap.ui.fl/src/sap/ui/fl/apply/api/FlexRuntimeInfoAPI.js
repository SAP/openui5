/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/api/InitialFlexAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/VersionInfo"
], function(
	Log,
	JsControlTreeModifier,
	VariantUtils,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	FlexConfiguration,
	FlexInfoSession,
	InitialFlexAPI,
	Settings,
	Layer,
	Utils,
	VersionInfo
) {
	"use strict";

	/**
	 * Provides an API to get specific information about the <code>sap.ui.fl</code> runtime.
	 *
	 * @namespace sap.ui.fl.apply.api.FlexRuntimeInfoAPI
	 * @since 1.67
	 * @private
	 * @ui5-restricted UI5 controls, sap.ovp, tests
	 */
	var FlexRuntimeInfoAPI = /** @lends sap.ui.fl.apply.api.FlexRuntimeInfoAPI */{
		/**
		 * Checks if personalization changes exist for controls.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector[]} mPropertyBag.selectors - An array of {@link sap.ui.fl.Selector}s for which personalization should exist
		 * @param {array} [mPropertyBag.changeTypes] - Additional filter for types of changes that should have existing personalization
		 *
		 * @returns {Promise<boolean>} Promise resolving to a boolean that indicates if personalization changes exist
		 *
		 * @private
		 * @ui5-restricted
		 */
		isPersonalized(mPropertyBag) {
			function logAndReject(sMessage) {
				Log.error(sMessage);
				return Promise.reject(sMessage);
			}

			function filterByLayer(oChange) {
				return oChange.getLayer() === Layer.USER;
			}

			function filterByValidFileType(oChange) {
				return oChange.getFileType() === "change";
			}

			function filterBySelectors(oAppComponent, aControls, oChange) {
				var aIdsOfPassedControls = aControls.map(function(oControl) {
					return oControl.id || oControl.getId();
				});
				var oSelector = oChange.getSelector();
				var sControlId = JsControlTreeModifier.getControlIdBySelector(oSelector, oAppComponent);
				return aIdsOfPassedControls.includes(sControlId);
			}

			function filterByChangeType(aChangeTypes, oChange) {
				return (Array.isArray(aChangeTypes) && aChangeTypes.length > 0)
					? aChangeTypes.includes(oChange.getChangeType())
					: true;
			}

			if (!mPropertyBag.selectors || mPropertyBag.selectors.length === 0) {
				return logAndReject("At least one control ID has to be provided as a parameter");
			}

			var oAppComponent = mPropertyBag.selectors[0].appComponent || Utils.getAppComponentForControl(mPropertyBag.selectors[0]);
			if (!oAppComponent) {
				return logAndReject("App Component could not be determined");
			}

			const sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
			const aFlexObjects = FlexState.getFlexObjectsDataSelector().get({reference: sFlexReference})
			.filter(filterByValidFileType)
			.filter(filterByLayer)
			.filter(filterBySelectors.bind(this, oAppComponent, mPropertyBag.selectors))
			.filter(filterByChangeType.bind(this, mPropertyBag.changeTypes));

			return Promise.resolve(aFlexObjects.length > 0);
		},

		/**
		 * Resolves with a promise after all the changes for all controls that are passed have been processed.
		 * You can either pass a single control, multiple controls or an array with objects that may contain additional configuration.
		 * Only use one of the possible parameters.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.element - Control whose changes are being waited for, the control has to exist
		 * @param {sap.ui.fl.Selector[]} mPropertyBag.selectors - An array of {@link sap.ui.fl.Selector}s, whose changes are being waited for, the controls have to exist
		 * @param {object[]} mPropertyBag.complexSelectors - An array containing an object with {@link sap.ui.fl.Selector} and further configuration
		 * @param {sap.ui.fl.Selector} mPropertyBag.complexSelectors.selector - A {@link sap.ui.fl.Selector}
		 * @param {string[]} [mPropertyBag.complexSelectors.changeTypes] - An array containing the change types that will be considered. If empty no filtering will be done
		 * @returns {Promise} Resolves when all changes on the control(s) are processed
		 *
		 * @private
		 * @ui5-restricted
		 */
		waitForChanges(mPropertyBag) {
			let aComplexSelectors;
			if (mPropertyBag.element) {
				aComplexSelectors = [{
					selector: mPropertyBag.element
				}];
			} else if (mPropertyBag.selectors) {
				aComplexSelectors = mPropertyBag.selectors.map(function(oSelector) {
					return {
						selector: oSelector
					};
				});
			} else if (mPropertyBag.complexSelectors) {
				aComplexSelectors = mPropertyBag.complexSelectors;
			}
			return FlexObjectState.waitForFlexObjectsToBeApplied(aComplexSelectors);
		},

		/**
		 * Checks if the flexibility features are supported for a given control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Control to be checked
		 * @returns {boolean} <code>true</code> if flexibility features are supported
		 *
		 * @private
		 * @ui5-restricted
		 */
		isFlexSupported(mPropertyBag) {
			return !!Utils.getAppComponentForControl(mPropertyBag.element);
		},

		/**
		 * Determines if an encompassing variant management control is available.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element which should be tested for an encompassing variant management control
		 * @returns {boolean} <code>true</code> if a variant management control encompasses the given control
		 *
		 * @private
		 * @ui5-restricted
		 */
		hasVariantManagement(mPropertyBag) {
			return VariantUtils.belongsToVariantManagement(mPropertyBag.element);
		},

		/**
		 * Returns the reference that is used for flexibility
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.base.ManagedObject} mPropertyBag.element - Element or component instance
		 * @returns {string} Flex reference
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getFlexReference(mPropertyBag) {
			return ManifestUtils.getFlexReferenceForControl(mPropertyBag.element);
		},

		/**
		 * Returns the configured Flexibility Services
		 * @returns {object[]} Flexibility services configuration
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		getConfiguredFlexServices() {
			return FlexConfiguration.getFlexibilityServices();
		},

		/**
		 * Returns the version that is used for Flexibility Services
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Reference of the application
		 * @returns {string} Version of Flexibility Services
		 *
		 * @private
		 * @ui5-restricted sap.ushell
		 */
		getFlexVersion(mPropertyBag) {
			return InitialFlexAPI.getFlexVersion(mPropertyBag);
		},

		/**
		 * Returns the context-based adaptation ID for the given property bag.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Reference of the application
		 * @returns {string|undefined} The adaptation ID if found, otherwise undefined.
		 */
		getContextBasedAdaptationId(mPropertyBag) {
			return FlexInfoSession.getByReference(mPropertyBag.reference)?.adaptationId;
		},

		/**
		 * Returns the title of the context-based adaptation for a given reference.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.reference - Reference of the application
		 * @returns {string|undefined} The title of the context-based adaptation, or undefined if not found.
		 */
		getContextBasedAdaptationTitle(mPropertyBag) {
			return FlexInfoSession.getByReference(mPropertyBag.reference)?.adaptationTitle;
		},

		/**
		 * Returns the information needed for the rta feedback dialog
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.base.ManagedObject} mPropertyBag.rootControl - root control of the app
		 * @returns {object[]} Flexibility services configuration
		 *
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		async getFeedbackInformation(mPropertyBag) {
			const sConnector = this.getConfiguredFlexServices()[0].connector;
			const oManifest = Utils.getAppDescriptor(mPropertyBag.rootControl);
			const oVersion = await VersionInfo.load();
			const sAppId = ManifestUtils.getAppIdFromManifest(oManifest);
			const sAppVersion = ManifestUtils.getAppVersionFromManifest(oManifest);
			return {
				appId: sAppId,
				appVersion: sAppVersion,
				connector: sConnector,
				version: oVersion.version
			};
		},

		/**
		 * Checks if the Settings are available and if so returns if the system is a customer system
		 *
		 * @returns {boolean} A boolean that indicates if the system is a customer system
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		isCustomerSystem() {
			return Settings.getInstanceOrUndef()?.isCustomerSystem();
		},

		/**
		 * Checks if the Settings are available and if so returns if the system is an ATO enabled system
		 *
		 * @returns {boolean} A boolean that indicates if the system is an ATO enabled system
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		isAtoEnabled() {
			return Settings.getInstanceOrUndef()?.isAtoEnabled();
		},

		/**
		 * Checks if the Settings are available and if so returns the system information
		 *
		 * @returns {string} System ID of the connected back end or undefined (when property <code>system</code> does not exist in the flex settings file)
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		getSystem() {
			return Settings.getInstanceOrUndef()?.getSystem();
		},

		/**
		 * Returns the user id of the current user.
		 *
		 * @returns {string} returns the user id
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		getUserId() {
			return Settings.getInstanceOrUndef()?.getUserId();
		}
	};

	return FlexRuntimeInfoAPI;
});
