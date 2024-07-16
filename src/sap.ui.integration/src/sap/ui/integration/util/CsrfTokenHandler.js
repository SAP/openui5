/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/util/isPlainObject",
	"sap/base/util/merge",
	"sap/ui/model/json/JSONModel",
	"../cards/data/CsrfToken"
], function (
	BaseObject,
	isPlainObject,
	merge,
	JSONModel,
	CsrfToken
) {
	"use strict";

	var rPattern = /\{\{csrfTokens.([^\}]+)\}\}/;
	var TOKEN_DEFAULT_HEADER = "X-CSRF-Token";

	/**
	 * Constructor for a new <code>CsrfTokenHandler</code>.
	 *
	 * @class
	 * Fetches and provides CSRF tokens for data requests.
	 * Tokens are shared between cards per user session.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @param {object} mSettings Token handler settings
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @alias sap.ui.integration.util.CsrfTokenHandler
	 */
	var CsrfTokenHandler = BaseObject.extend("sap.ui.integration.util.CsrfTokenHandler", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (mSettings) {
			BaseObject.call(this);

			mSettings = mSettings || {};

			this._mTokens = new Map();
			this._oModel = mSettings.model;
			/**
			 * @deprecated As of version 1.121.0
			 */
			this._oHost = mSettings.host;
			this._oConfiguration = mSettings.configuration;
			this._oDataProviderFactory = mSettings.dataProviderFactory;

			for (const [sTokenName, oTokenConfig] of Object.entries(mSettings.configuration)) {
				this._mTokens.set(sTokenName, new CsrfToken(sTokenName, oTokenConfig, this));
			}
		}
	});

	CsrfTokenHandler.prototype.getUsedToken = function (oDataConfig) {
		const sTokenName = this._findTokenName(oDataConfig);

		return this._mTokens.get(sTokenName);
	};

	CsrfTokenHandler.prototype.fetchValue = function (oTokenConfig) {
		// clone the data configuration,
		// so we won't change the original settings
		oTokenConfig = merge({}, oTokenConfig);

		return this._requestToken(oTokenConfig.data);
	};

	CsrfTokenHandler.prototype.onTokenFetched = function (sTokenName, sTokenValue) {
		this._setCsrfModelValue(sTokenName, sTokenValue);
	};

	/**
	 * Sets the host which is used to resolve tokens.
	 * @param {sap.ui.integration.Host} oHost The host.
	 * @deprecated As of version 1.121.0
	 */
	CsrfTokenHandler.prototype.setHost = function (oHost) {
		this._oHost = oHost;
	};

	/**
	 * @param {Response} oResponse The response.
	 * @returns {boolean} Whether the response contains an expired CSRF token
	 */
	CsrfTokenHandler.prototype.isExpiredToken = function (oResponse) {
		if (!oResponse) {
			return false;
		}

		var sXCSRFHeader = oResponse.headers.get(TOKEN_DEFAULT_HEADER);
		return sXCSRFHeader && sXCSRFHeader.toLowerCase() === "required" && oResponse.status === 403;
	};

	CsrfTokenHandler.prototype.replacePlaceholders = function (vData) {
		if (!vData) {
			return vData;
		}

		if (Array.isArray(vData)) {
			return vData.map((vValue) => {
				return this.replacePlaceholders(vValue);
			});
		}

		if (isPlainObject(vData)) {
			const oItemCopy = {};

			for (const sKey in vData) {
				oItemCopy[sKey] = this.replacePlaceholders(vData[sKey]);
			}

			return oItemCopy;
		}

		if (typeof vData === "string") {
			const oToken = this._mTokens.get(this._getTokenName(vData));

			if (oToken) {
				return vData.replace(rPattern, oToken.value);
			}
		}

		return vData;
	};

	/**
	 * Executes a CSRF token request
	 *
	 * @private
	 * @param {object} oTokenDataConfig Token data configuration
	 * @returns {Promise} Promise which resolves with the CSRF token
	 */
	CsrfTokenHandler.prototype._requestToken = function (oTokenDataConfig) {
		if (!oTokenDataConfig) {
			return Promise.reject("CSRF definition is incorrect");
		}

		const oTokenDataProvider = this._oDataProviderFactory.create(oTokenDataConfig);
		const pTokenValue = oTokenDataProvider.getData().then((oData) => {
			var sTokenValue,
				oModel;

			if (oTokenDataConfig.path) {
				oModel = new JSONModel(oData);
				sTokenValue = oModel.getProperty(oTokenDataConfig.path);
				oModel.destroy();
			} else {
				sTokenValue = oTokenDataProvider.getLastResponse().headers.get(TOKEN_DEFAULT_HEADER);
			}

			return sTokenValue;
		}).catch(function () {
			throw "CSRF token cannot be resolved";
		});

		return pTokenValue;
	};

	CsrfTokenHandler.prototype.markExpiredTokenByRequest = function (oDataConfig) {
		const sTokenName = this._findTokenName(oDataConfig);

		if (!sTokenName) {
			return;
		}

		this._mTokens.get(sTokenName).markExpired();
	};

	/**
	 * Returns the CSRF configuration object based on its name from the card configuration.
	 *
	 * @private
	 * @param {string} sCsrfTokenName The name of the CSRF object.
	 * @returns {object} The CSRF configuration object.
	 */
	CsrfTokenHandler.prototype._getTokenConfig = function (sCsrfTokenName) {
		return this._oConfiguration[sCsrfTokenName];
	};

	CsrfTokenHandler.prototype._setCsrfModelValue = function (sTokenName, sTokenValue) {
		this._oModel.setProperty(`/${sTokenName}`, {
			value: sTokenValue
		});
	};

	CsrfTokenHandler.prototype._findTokenName = function (oConfig) {
		var vValue,
			sKey,
			sTokenName;

		for (sKey in oConfig) {
			vValue = oConfig[sKey];

			if (typeof vValue === "string") {
				sTokenName = this._getTokenName(vValue);

				if (sTokenName) {
					return sTokenName;
				}
			}

			if (isPlainObject(vValue)) {
				vValue = this._findTokenName(vValue);

				if (vValue) {
					return vValue;
				}
			}
		}

		return null;
	};

	/**
	 * Returns the name from the CSRF placeholder.
	 * For input of <code>{csrfTokens>/token1}</code>, it will return <code>"token1"</code>
	 *
	 * @private
	 * @param {string} sString the CSRF placeholder
	 * @returns {string} The name of the placeholder or empty string
	 */
	CsrfTokenHandler.prototype._getTokenName = function (sString) {
		const rBinding = /\{csrfTokens\>\/([^\/]*).*}/;
		let aMatches = sString.match(rBinding);

		if (!aMatches) {
			aMatches = sString.match(rPattern);

			if (!aMatches) {
				return "";
			}
		}

		return aMatches[1];
	};

	return CsrfTokenHandler;
});
