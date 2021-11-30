/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/util/isPlainObject",
	"sap/base/util/merge",
	"sap/ui/model/json/JSONModel"
], function (
	BaseObject,
	isPlainObject,
	merge,
	JSONModel
) {
	"use strict";

	var rPattern = /\{\{csrfTokens.([^\}]+)/;
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
	 * @param {sap.ui.integration.Host} oHost The Host which will be used for resolve CSRF tokens.
	 * @param {object} oConfiguration The CSRF configuration from the manifest.
	 * @private
	 * @ui5-restricted
	 * @alias sap.ui.integration.util.CsrfTokenHandler
	 */
	var CsrfTokenHandler = BaseObject.extend("sap.ui.integration.util.CsrfTokenHandler", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (mSettings) {
			BaseObject.call(this);

			mSettings = mSettings || {};

			this._oHost = mSettings.host;
			this._oConfiguration = mSettings.configuration;
		}
	});

	/**
	 * Map of all Promises which resolve to CSRF tokens. Keyed by the unique URL of each CSRF request. Shared by all cards.
	 *
	 * @static
	 * @private
	 */
	CsrfTokenHandler._mTokens = new Map();

	/**
	 * Resolves CSRF placeholders to actual values within a data configuration object.
	 *
	 * @public
	 * @param {object} oDataConfig Data configuration object
	 * @returns {Promise} A promise which resolves with the data configuration object containing resolved CSRF token values
	 */
	CsrfTokenHandler.prototype.resolveToken = function (oDataConfig) {
		var oCsrfTokenContext,
			oCsrfTokenConfig;

		// clone the data configuration,
		// so we won't change the original settings
		oDataConfig = merge({}, oDataConfig);

		oCsrfTokenContext = this._findCsrfPlaceholder(oDataConfig);

		if (!oCsrfTokenContext) {
			return Promise.resolve(oDataConfig);
		}

		oCsrfTokenConfig = this._getCsrfConfig(oCsrfTokenContext.tokenName);

		if (this._oHost) {
			return this._oHost.getCsrfToken(oCsrfTokenConfig)
				.then(function (sTokenValue) {
					if (!sTokenValue) {
						return this._resolveTokenByUrl(oDataConfig, oCsrfTokenContext);
					}

					this._replaceCsrfPlaceholder(oCsrfTokenContext, sTokenValue);
					return oDataConfig;
				}.bind(this))
				.catch(function (sError) {
					return Promise.reject(sError);
				});
		}

		return this._resolveTokenByUrl(oDataConfig, oCsrfTokenContext);
	};

	CsrfTokenHandler.prototype._resolveTokenByUrl = function (oDataConfig, oCsrfTokenContext) {
		var sCsrfTokenName = oCsrfTokenContext.tokenName,
			sCsrfUrl = this._getCsrfConfig(sCsrfTokenName).data.request.url;

		if (CsrfTokenHandler._mTokens.has(sCsrfUrl)) {
			return CsrfTokenHandler._mTokens.get(sCsrfUrl).then(function (sTokenValue) {
				this._replaceCsrfPlaceholder(oCsrfTokenContext, sTokenValue);
				return oDataConfig;
			}.bind(this));
		}

		if (sCsrfTokenName) {
			return this._requestToken(oDataConfig, oCsrfTokenContext);
		}

		return Promise.resolve(oDataConfig);
	};

	/**
	 * Saves a reference to the DataProviderFactory to create own data requests.
	 * Those CSRF placeholders may contain destinations placeholders which need to be resolved prior to making the request.
	 *
	 * @public
	 * @param {sap.ui.integration.util.DataProviderFactory} oDataProviderFactory the factory
	 */
	CsrfTokenHandler.prototype.setDataProviderFactory = function (oDataProviderFactory) {
		this._oDataProviderFactory = oDataProviderFactory;
	};

	/**
	 * Sets the host which is used to resolve tokens.
	 * @param {sap.ui.integration.Host} oHost The host.
	 */
	CsrfTokenHandler.prototype.setHost = function (oHost) {
		this._oHost = oHost;
	};

	/**
	 * Checks if a response contains an expired CSRF Token.
	 * @param {object} jqXHR The request.
	 */
	CsrfTokenHandler.prototype.isExpiredToken = function (jqXHR) {
		if (!jqXHR) {
			return false;
		}

		var sXCSRFHeader = jqXHR.getResponseHeader(TOKEN_DEFAULT_HEADER);
		return sXCSRFHeader && sXCSRFHeader.toLowerCase() === "required" && jqXHR.status === 403;
	};

	/**
	 * Executes a CSRF token request based on the data configuration object which contains a CSRF placeholder in its headers property.
	 *
	 * @private
	 * @param {object} oDataConfig Data configuration object
	 * @returns {Promise} Promise which resolves with the CSRF token
	 */
	CsrfTokenHandler.prototype._requestToken = function (oDataConfig, oCsrfTokenContext) {
		var sCsrfTokenName = oCsrfTokenContext.tokenName,
			oCsrfTokenConfig = this._getCsrfConfig(sCsrfTokenName);

		if (!sCsrfTokenName || !oCsrfTokenConfig) {
			return Promise.reject("CSRF definition is incorrect");
		}

		var pTokenValuePromise = new Promise(function (resolve, reject) {
			var oCsrfTokenDataProvider = this._oDataProviderFactory.create(oCsrfTokenConfig.data);
			oCsrfTokenDataProvider.getData().then(function (oData) {
				var sTokenValue,
					oModel;

				if (oCsrfTokenConfig.data.path) {
					oModel = new JSONModel(oData);
					sTokenValue = oModel.getProperty(oCsrfTokenConfig.data.path);
					oModel.destroy();
				} else {
					sTokenValue = oCsrfTokenDataProvider.getLastJQXHR().getResponseHeader(TOKEN_DEFAULT_HEADER);
				}

				resolve(sTokenValue);
			}).catch(function () {
				reject("CSRF token cannot be resolved");
			});
		}.bind(this));

		this._registerToken(oCsrfTokenConfig, pTokenValuePromise);

		return pTokenValuePromise.then(function (sTokenValue) {
			this._replaceCsrfPlaceholder(oCsrfTokenContext, sTokenValue);
			return oDataConfig;
		}.bind(this));
	};

	/**
	 * Deletes a token based on a data configuration object which contains a CSRF placeholder in its headers property.
	 *
	 * @public
	 * @param {object} oDataConfig Data configuration object
	 */
	CsrfTokenHandler.prototype.resetTokenByRequest = function (oDataConfig) {
		var oCsrfTokenContext = this._findCsrfPlaceholder(oDataConfig);
		if (!oCsrfTokenContext) {
			return;
		}

		this._deleteRegisteredToken(this._getCsrfConfig(oCsrfTokenContext.tokenName));
	};

	/**
	 * Returns the CSRF configuration object based on its name from the card configuration.
	 *
	 * @private
	 * @param {string} sCsrfTokenName The name of the CSRF object.
	 * @returns {object} The CSRF configuration object.
	 */
	CsrfTokenHandler.prototype._getCsrfConfig = function (sCsrfTokenName) {
		return this._oConfiguration[sCsrfTokenName];
	};

	CsrfTokenHandler.prototype._replaceCsrfPlaceholder = function (oCsrfTokenContext, sTokenValue) {
		var sPlaceholder = oCsrfTokenContext.object[oCsrfTokenContext.key];

		oCsrfTokenContext.object[oCsrfTokenContext.key] = sPlaceholder.replace("{{csrfTokens." + oCsrfTokenContext.tokenName + "}}", sTokenValue);
	};

	CsrfTokenHandler.prototype._findCsrfPlaceholder = function (oConfig) {
		var vValue,
			sKey,
			sTokenName;

		for (sKey in oConfig) {
			vValue = oConfig[sKey];

			if (typeof vValue === "string") {
				sTokenName = this._getCsrfTokenName(vValue);

				if (sTokenName) {
					return {
						object: oConfig,
						key: sKey,
						tokenName: sTokenName
					};
				}
			}

			if (isPlainObject(vValue)) {
				vValue = this._findCsrfPlaceholder(vValue);

				if (vValue) {
					return vValue;
				}
			}
		}

		return null;
	};

	/**
	 * Returns the name from the CSRF placeholder.
	 * For input of <code>{{csrfTokens.token1}}</code>, it will return <code>"token1"</code>
	 *
	 * @private
	 * @param {string} sString the CSRF placeholder
	 * @returns {string} The name of the placeholder or empty string
	 */
	CsrfTokenHandler.prototype._getCsrfTokenName = function (sString) {
		var aMatches = sString.match(rPattern);
		if (!aMatches) {
			return "";
		}

		return aMatches[1];
	};

	CsrfTokenHandler.prototype._registerToken = function (mCSRFTokenConfig, pTokenValuePromise) {
		CsrfTokenHandler._mTokens.set(mCSRFTokenConfig.data.request.url, pTokenValuePromise);

		if (this._oHost) {
			this._oHost.csrfTokenFetched(mCSRFTokenConfig, pTokenValuePromise);
		}
	};

	CsrfTokenHandler.prototype._deleteRegisteredToken = function (mCSRFTokenConfig) {
		CsrfTokenHandler._mTokens.delete(mCSRFTokenConfig.data.request.url);

		if (this._oHost) {
			this._oHost.csrfTokenExpired(mCSRFTokenConfig);
		}
	};

	return CsrfTokenHandler;
});
