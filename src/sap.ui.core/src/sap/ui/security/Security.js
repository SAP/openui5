/*!
 * copyright
 */

sap.ui.define([
	"sap/base/config"
], function(
	BaseConfig
) {
	"use strict";

	const oWritableConfig = BaseConfig.getWritableInstance();

	/**
	 * Helper function for getting the config option 'allowListService'
	 * For legacy reasons configuration option provided via the global window object
	 * are treated different compared to the option provided using bootstrap or meta
	 * tag. Configuration options provided via globalThis/window object are always
	 * prefixed with 'sapUi' therefore first check for param starting with 'sapUi'.
	 * In case there is no param found check for param prefixed only with 'sap'.
	 * @private
	 * @since 1.120.0
	 * @return {Object} An object containing the value of configuration
	 * parameter allowListService and a flag whether the parameter is derived
	 * from global provider or not.
	 */
	const getAllowlistService = () => {
		let bGlobalProvider = true;
		let sAllowlistService = oWritableConfig.get({
			name: "sapUiAllowlistService",
			type: oWritableConfig.Type.String,
			defaultValue: oWritableConfig.get({
				name: "sapUiWhitelistService",
				type: oWritableConfig.Type.String,
				defaultValue: undefined
			})
		});
		if (!sAllowlistService) {
			sAllowlistService = oWritableConfig.get({
				name: "sapAllowlistService",
				type: oWritableConfig.Type.String,
				defaultValue: oWritableConfig.get({
					name: "sapWhitelistService",
					type: oWritableConfig.Type.String
				})
			});
			bGlobalProvider = false;
		}
		return {
			allowlistService: sAllowlistService,
			globalProvider: bGlobalProvider
		};
	};
	/**
	 * Provides security related API
	 *
	 * @alias module:sap/ui/security/Security
	 * @namespace
	 * @public
	 * @since 1.120.0
	 */
	const Security = {
		/**
		 * URL of the allowlist service.
		 *
		 * @return {string} allowlist service URL
		 * @public
		 * @since 1.120.0
		*/
		getAllowlistService: () => getAllowlistService().allowlistService,

		/**
		 * frameOptions mode (allow/deny/trusted).
		 *
		 * @return {string} frameOptions mode
		 * @public
		 * @since 1.120.0
		 */
		getFrameOptions() {
			var sFrameOptions = oWritableConfig.get({
				name: "sapUiFrameOptions",
				type: oWritableConfig.Type.String,
				defaultValue: "default"
			});

			if (sFrameOptions === "default") {
				const oAllowlistService = getAllowlistService();
				sFrameOptions = oAllowlistService.allowlistService && !oAllowlistService.globalProvider ? "trusted" : "allow";
			}
			return sFrameOptions;
		},

		/**
		 * Returns the security token handlers of an OData V4 model.
		 *
		 * @returns {Array<function(sap.ui.core.URI):Promise>} the security token handlers (an empty array if there are none)
		 * @public
		 * @since 1.120.0
		 * @see #setSecurityTokenHandlers
		 */
		getSecurityTokenHandlers() {
			return oWritableConfig.get({
				name: "sapUiSecurityTokenHandlers",
				type: oWritableConfig.Type.FunctionArray
			});
		},

		/**
		 * Sets the security token handlers for an OData V4 model. See chapter
		 * {@link topic:9613f1f2d88747cab21896f7216afdac/section_STH Security Token Handling}.
		 *
		 * @param {Array<function(sap.ui.core.URI):Promise>} aSecurityTokenHandlers - The security token handlers
		 * @public
		 * @since 1.120.0
		 * @see #getSecurityTokenHandlers
		 */
		setSecurityTokenHandlers(aSecurityTokenHandlers) {
			aSecurityTokenHandlers.forEach(function (fnSecurityTokenHandler) {
				if (typeof fnSecurityTokenHandler !== "function") {
					throw new Error("Not a function: " + fnSecurityTokenHandler);
				}
			});
			oWritableConfig.set("sapUiSecurityTokenHandlers", aSecurityTokenHandlers.slice());
		}
	};

	return Security;
});