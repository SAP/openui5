/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/util/isPlainObject",
	"sap/ui/model/json/JSONModel"
], function (
	BaseObject,
	isPlainObject,
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
		var sCsrfTokenName = this._findCsrfPlaceholder(oDataConfig),
			oCsrfConfig;

		if (!sCsrfTokenName) {
			return Promise.resolve(oDataConfig);
		}

		oCsrfConfig = this._getCsrfConfig(sCsrfTokenName);

		if (this._oHost) {
			return this._oHost.getCsrfToken(oCsrfConfig)
				.then(function (sTokenValue) {
					if (!sTokenValue) {
						return this._resolveTokenByUrl(oDataConfig);
					}

					this._replaceCsrfPlaceholder(oDataConfig, sTokenValue);
					return oDataConfig;
				}.bind(this))
				.catch(function (sError) {
					return Promise.reject(sError);
				});
		}

		return this._resolveTokenByUrl(oDataConfig);
	};

	CsrfTokenHandler.prototype._resolveTokenByUrl = function (oDataConfig) {
		var sCsrfTokenName = this._findCsrfPlaceholder(oDataConfig),
			sCsrfUrl = this._getCsrfConfig(sCsrfTokenName).data.request.url;

		if (CsrfTokenHandler._mTokens.has(sCsrfUrl)) {
			return CsrfTokenHandler._mTokens.get(sCsrfUrl).then(function (sTokenValue) {
				this._replaceCsrfPlaceholder(oDataConfig, sTokenValue);
				return oDataConfig;
			}.bind(this));
		}

		if (sCsrfTokenName) {
			return this._requestToken(oDataConfig);
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
	CsrfTokenHandler.prototype._requestToken = function (oDataConfig) {
		var sCsrfTokenName = this._findCsrfPlaceholder(oDataConfig),
			oCsrfConfig = this._getCsrfConfig(sCsrfTokenName);

		if (!sCsrfTokenName || !oCsrfConfig) {
			return Promise.reject("CSRF definition is incorrect");
		}

		var pTokenValuePromise = new Promise(function (resolve, reject) {
			var oCsrfTokenDataProvider = this._oDataProviderFactory.create(oCsrfConfig.data);
			oCsrfTokenDataProvider.getData().then(function (oData) {
				var sTokenValue,
					oModel;

				if (oCsrfConfig.data.path) {
					oModel = new JSONModel(oData);
					sTokenValue = oModel.getProperty(oCsrfConfig.data.path);
					oModel.destroy();
				} else {
					sTokenValue = oCsrfTokenDataProvider.getLastJQXHR().getResponseHeader(TOKEN_DEFAULT_HEADER);
				}

				resolve(sTokenValue);
			}).catch(function () {
				reject("CSRF token cannot be resolved");
			});
		}.bind(this));

		this._registerToken(oCsrfConfig, pTokenValuePromise);

		return pTokenValuePromise.then(function (sTokenValue) {
			this._replaceCsrfPlaceholder(oDataConfig, sTokenValue);
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
		var sCsrfTokenName = this._findCsrfPlaceholder(oDataConfig);
		if (!sCsrfTokenName) {
			return;
		}

		this._deleteRegisteredToken(this._getCsrfConfig(sCsrfTokenName));
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

	/**
	 * Searches a data configuration object's properties for the presence of a CSRF placeholder.
	 * Currently only works with placeholders used in the 'headers' property of the oDataConfig.
	 *
	 * @private
	 * @param {object} oDataConfig Data configuration object
	 * @returns {string} The name of the CSRF placeholder.
	 */
	CsrfTokenHandler.prototype._findCsrfPlaceholder = function (oDataConfig) {
		var sHeaderName = this._findCsrfInHeaders(oDataConfig);

		if (sHeaderName) {
			return this._getCsrfName(oDataConfig.headers[sHeaderName]);
		}

		return null;
	};

	/**
	 * Replaces the CSRF placeholder within a data configuration object with the resolved token.
	 * Currently only works when the token is used in the 'headers' property.
	 *
	 * @private
	 * @param {object} oDataConfig Data configuration object
	 * @param {string} sTokenValue The resolved token value
	 */
	CsrfTokenHandler.prototype._replaceCsrfPlaceholder = function (oDataConfig, sTokenValue) {
		oDataConfig.headers[TOKEN_DEFAULT_HEADER] = sTokenValue;
	};

	/**
	 * Checks if the data config headers contain a csrf definition.
	 *
	 * @private
	 * @param {object} oDataConfig Data configuration object
	 * @returns {string} sHeaderName the header which uses the csrf definition or an empty string if there is no such header.
	 */
	CsrfTokenHandler.prototype._findCsrfInHeaders = function (oDataConfig) {
		if (!oDataConfig || !oDataConfig.headers || !isPlainObject(oDataConfig.headers)) {
			return "";
		}

		for (var sKey in oDataConfig.headers) {
			if (typeof oDataConfig.headers[sKey] === "string" && this._hasCsrf(oDataConfig.headers[sKey])) {
				return sKey;
			}
		}

		return "";
	};

	/**
	 * Returns true if the given string contains a csrf placeholder.
	 *
	 * @private
	 * @param {string} sString The string to check.
	 * @returns {boolean} True if the string contains a csrf placeholder.
	 */
	CsrfTokenHandler.prototype._hasCsrf = function (sString) {
		return !!sString.match(rPattern);
	};

	/**
	 * Returns the name from the CSRF placeholder.
	 * For input of <code>{{csrfTokens.token1}}</code>, it will return <code>"token1"</code>
	 *
	 * @private
	 * @param {string} sString the CSRF placeholder
	 * @returns {string} The name of the placeholder or empty string
	 */
	CsrfTokenHandler.prototype._getCsrfName = function (sString) {
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
