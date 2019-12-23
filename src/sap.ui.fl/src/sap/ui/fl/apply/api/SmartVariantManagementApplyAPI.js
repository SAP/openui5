/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/DefaultVariant",
	"sap/ui/fl/StandardVariant",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/base/Log"
], function(
	FlexState,
	DefaultVariant,
	StandardVariant,
	ChangePersistenceFactory,
	Settings,
	Utils,
	LayerUtils,
	Log
) {
	"use strict";

	/**
	 * Provides an API to handle specific functionalities for the <code>sap.ui.comp</code> library.
	 *
	 * @namespace sap.ui.fl.apply.api.SmartVariantManagementApplyAPI
	 * @experimental
	 * @since 1.69.0
	 * @private
	 * @ui5-restricted sap.ui.comp
	 */
	var SmartVariantManagementApplyAPI = /** @lends sap.ui.fl.apply.api.SmartVariantManagementApplyAPI */{

		_PERSISTENCY_KEY: "persistencyKey",

		/**
		 * Calls the back end asynchronously and fetches all {@link sap.ui.fl.Change}s and variants pointing to this control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {Promise<Object<string,sap.ui.fl.Change>>} Map with key <code>changeId</code> and value instance of <code>sap.ui.fl.Change</code>
		 * @private
		 * @ui5-restricted
		 */
		loadChanges: function(mPropertyBag) {
			var oControl = mPropertyBag.control;
			var oAppDescriptor = Utils.getAppDescriptor(oControl);
			var sSiteId = Utils.getSiteId(oControl);
			var sStableId = this._getStableId(oControl);

			var mParameters = {
				appDescriptor: oAppDescriptor,
				siteId: sSiteId,
				includeVariants: true
			};

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oControl);

			// TODO clarify why in a test we come here without an initialized FlexState (1980546095)
			return FlexState.initialize({
				componentId: Utils.getAppComponentForControl(oControl).getId()
			})
			.then(function() {
				return oChangePersistence.getChangesForVariant(this._PERSISTENCY_KEY, sStableId, mParameters);
			}.bind(this));
		},

		/**
		 * Returns the {@link sap.ui.fl.Change} for the provided ID.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @param {string} mPropertyBag.id - ID of the change or variant
		 * @returns {sap.ui.fl.Change} Change or variant object
		 * @private
		 * @ui5-restricted
		 */
		getChangeById: function (mPropertyBag) {
			var oControl = mPropertyBag.control;
			var sId = mPropertyBag.id;
			if (!sId || !oControl) {
				Log.error("sId or oControl is not defined");
				return undefined;
			}
			var oChanges = this._getChangeMap(oControl);

			return oChanges[sId];
		},

		/**
		 * Checks whether sharing of variants is enabled.
		 *
		 * @private
		 * @ui5-restricted
		 * @returns {boolean} <code>true</code> if sharing of variants is enabled
		 */
		isVariantSharingEnabled: function() {
			return Settings.getInstance().then(function (oInstance) {
				return oInstance.isVariantSharingEnabled();
			});
		},

		/**
		 * Indicates if the current application is a variant of an existing one.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {boolean} <code>true</code> if it's an application variant
		 * @private
		 * @ui5-restricted
		 */
		isApplicationVariant: function(mPropertyBag) {
			var oControl = mPropertyBag.control;
			if (Utils.isApplicationVariant(oControl)) {
				return true;
			}

			var oComponent = Utils.getComponentForControl(oControl);

			// special case for SmartTemplating to reach the real appComponent
			if (oComponent && oComponent.getAppComponent) {
				oComponent = oComponent.getAppComponent();

				if (oComponent) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Indicates if the VENDOR layer is selected.
		 *
		 * @returns {boolean} <code>true</code> if VENDOR layer is enabled
		 * @private
		 * @ui5-restricted
		 */
		isVendorLayer: function() {
			return LayerUtils.isVendorLayer();
		},

		/**
		 * Indicates whether the variant downport scenario is enabled or not. This scenario is only enabled if the current layer is the VENDOR layer
		 * and the URL parameter hotfix is set to <code>true</code>.
		 *
		 * @returns {boolean} <code>true</code> if the variant downport scenario is enabled
		 * @private
		 * @ui5-restricted
		 */
		isVariantDownport: function() {
			return SmartVariantManagementApplyAPI.isVendorLayer() && Utils.isHotfixMode();
		},

		/**
		 * Retrieves the default variant for the current control synchronously. WARNING: The consumer has to make sure that the
		 * changes have already been retrieved with <code>getChanges</code>. It's recommended to use the async API <code>getDefaultVariantId</code>, which works regardless of any
		 * preconditions.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {String} ID of the default variant
		 * @private
		 * @ui5-restricted
		 */
		getDefaultVariantId: function(mPropertyBag) {
			var oChanges = this._getChangeMap(mPropertyBag.control);

			return DefaultVariant.getDefaultVariantId(oChanges);
		},

		/**
		 * Synchronously retrieves the <code>ExecuteOnSelect</code> for the standard variant for the current control. WARNING: The consumer has to make sure that the
		 * changes have already been retrieved with <code>getChanges</code>. It's recommended to use the async API <code>getExecuteOnSelect</code>, which works regardless of any
		 * preconditions.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} mPropertyBag.control - SAPUI5 Smart Variant Management control
		 * @returns {boolean} <code>ExecuteOnSelect</code> flag
		 * @private
		 * @ui5-restricted
		 */
		getExecuteOnSelect: function(mPropertyBag) {
			var oChanges = this._getChangeMap(mPropertyBag.control);

			return StandardVariant.getExecuteOnSelect(oChanges);
		},

		/**
		 * Determines the value of the stable ID property of the control.
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @returns {String | undefined} Stable ID, or empty string if stable ID determination failed
		 * @private
		 */
		_getStableId: function(oControl) {
			if (!oControl) {
				return undefined;
			}

			var sStableId;
			try {
				sStableId = oControl.getPersistencyKey();
			} catch (exception) {
				sStableId = "";
			}
			return sStableId;
		},

		/**
		 * Returns the SmartVariant <code>ChangeMap</code> from the Change Persistence.
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @returns {object} <code>persistencyKey</code> map and corresponding changes, or an empty object
		 * @private
		 */
		_getChangeMap: function(oControl) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oControl);
			var sStableId = SmartVariantManagementApplyAPI._getStableId(oControl);

			return oChangePersistence.getSmartVariantManagementChangeMap()[sStableId] || {};
		}
	};

	return SmartVariantManagementApplyAPI;
}, true);
