/*!
 * ${copyright}
 */

// Provides control sap.ui.fl.util.IFrame
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"./getContainerUserInfo",
	"sap/base/util/extend",
	"sap/base/security/URLListValidator",
	"sap/base/Log",
	"sap/ui/fl/util/resolveBinding",
	"./IFrameRenderer" // implicitly used by the control => added here to avoid a synchronous request
], function(
	Control,
	JSONModel,
	getContainerUserInfo,
	extend,
	URLListValidator,
	Log,
	resolveBinding
) {
	"use strict";

	function unbind (vValue) {
		if (vValue.parts && vValue.formatter) {
			return vValue.formatter.apply(null, vValue.parts.map(function (oPart) {
				if (oPart.model) {
					return "{" + oPart.model + ">" + oPart.path + "}";
				}
				return "{" + oPart.path + "}";
			}));
		}
		return vValue;
	}

	/**
	 * Constructor for a new <code>IFrame</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Enables integration of external applications using IFrames.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.fl.util.IFrame
	 */
	var IFrame = Control.extend("sap.ui.fl.util.IFrame", /** @lends sap.ui.fl.util.IFrame.prototype */ {

		metadata: {
			library: "sap.ui.fl",

			properties: {
				/**
				 * Determines the URL of the content.
				 */
				url: {type: "sap.ui.core.URI", group: "Misc", defaultValue: "" },

				/**
				 * Defines the <code>IFrame</code> width.
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: "100%"},

				/**
				 * Defines the <code>IFrame</code> height.
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: "100%"},

				/**
				 * Defines the title of the item.
				 */
				title: {type: "string", group: "Misc", defaultValue: undefined},

				/**
				 * Backup of the initial settings for the dialogs
				 *
				 * @ui5-restricted sap.ui.fl
				 */
				_settings: {type: "object", group: "Data", defaultValue: null}
			},

			designtime: "sap/ui/fl/designtime/util/IFrame.designtime"
		},

		init: function () {
			if (Control.prototype.init) {
				Control.prototype.init.apply(this, arguments);
			}
			this._oInitializePromise = getContainerUserInfo()
				.then(function(oUserInfo) {
					this._oUserModel = new JSONModel(oUserInfo);
					this.setModel(this._oUserModel, "$user");
				}.bind(this));
		},

		waitForInit: function () {
			return this._oInitializePromise ? this._oInitializePromise : Promise.reject();
		},

		setUrl: function(sUrl) {
			// Could contain special characters from bindings that need to be encoded
			// Make sure that it was not encoded before
			var bDecodingFailed;
			sUrl = this.unEscapeBrackets(sUrl);
			try {
				var sEncodedUrl = this.encodeUrl(sUrl, this).encodedUrl;
			} catch (oError) {
				bDecodingFailed = true;
			}
			if (!bDecodingFailed && IFrame.isValidUrl(sEncodedUrl)) {
				this.setProperty("url", sEncodedUrl);
			} else {
				Log.error("Provided URL is not valid as an IFrame source");
			}
			return this;
		},

		applySettings: function (mSettings) {
			Control.prototype.applySettings.apply(this, arguments);
			if (mSettings) {
				var mMergedSettings = this.getProperty("_settings") || {};
				if (mSettings._settings) {
					extend(mMergedSettings, mSettings._settings);
				} else {
					Object.keys(mSettings)
						.filter(function (sPropertyName) {
							return !!mSettings[sPropertyName];
						})
						.forEach(function (sPropertyName) {
							mMergedSettings[sPropertyName] = unbind(mSettings[sPropertyName]);
						});
				}
				this.setProperty("_settings", mMergedSettings);
			}
		},

		exit: function () {
			if (this._oUserModel) {
				this._oUserModel.destroy();
				delete this._oUserModel;
			}
		},

		unEscapeBrackets: function(sUrl) {
			sUrl = sUrl.replace(/\\{/g, "{");
			sUrl = sUrl.replace(/\\}/g, "}");
			return sUrl;
		},

		encodeUrl: function(sUrl, oBindingReferenceElement) {
			var nStatusCode = IFrame.statusCodes.NONE;

			// Bindings are the content from the outer brackets
			// e.g. https://example.com/{Potato{Test}}/{Foo} => ["{Potato{Test}}", "{Foo}"]
			function checkAndGetBindingsFromUrl(sUrl) {
				var aExtractedBindings = [];
				var nNestingLevel = 0;
				var sParameterStart = 0;
				for (var i = 0; i < sUrl.length; i++) {
					var sChar = sUrl.charAt(i);
					if (sChar === "{") {
						if (nNestingLevel === 0) {
							sParameterStart = i;
						}
						nNestingLevel++;
					}
					if (sChar === "}") {
						nNestingLevel--;
						if (nNestingLevel === 0) {
							aExtractedBindings.push(sUrl.substring(sParameterStart, i + 1));
						}
					}
				}

				if (nNestingLevel !== 0) {
					nStatusCode = IFrame.statusCodes.UNEVEN_BRACKETS;
				}
				return aExtractedBindings;
			}

			/**
			 * checks if the url has encoded characters and encodes the url without the bindings
			 * https://example.com?%{binding} [something] => https://example.com?%25{binding}%20%5Bsomething%5D
			 * https://example.com?{binding}%20%5Dsometing] => https://example.com?{binding}%20%5Bsomething%5D
			 * https://example.com?%{binding}%20[someting] => shows Error message
			 * the url is partially encoded and can't be decoded because of the single % sign
			*/
			function encodeUrlWithoutBindings(sRawUrl, aBindings) {
				var sDecodedUrl;
				try {
					sDecodedUrl = decodeURI(sRawUrl);
				} catch (oError) {
					sDecodedUrl = sRawUrl;
					var aUndecodableCharacters = sRawUrl.match(/\%.{2}/g);
					if (aUndecodableCharacters) {
						var bHasEncodedCharacters = aUndecodableCharacters.some(function(char) {
							try {
								decodeURIComponent(char);
								return true;
							} catch (error) {
								return false;
							}
						});

						if (bHasEncodedCharacters) {
							nStatusCode = IFrame.statusCodes.DECODING_ERROR;
							return undefined;
						}
					}
				}

				aBindings.forEach(function(sBinding, nIndex) {
					sDecodedUrl = sDecodedUrl.replace(sBinding, "_PLACEHOLDER_" + String(nIndex) + "_PLACEHOLDER_");
				});

				var sEncodedUrl = encodeURI(sDecodedUrl);

				aBindings.forEach(function(sBinding, nIndex) {
					sEncodedUrl = sEncodedUrl.replace("_PLACEHOLDER_" + String(nIndex) + "_PLACEHOLDER_", aBindings[nIndex]);
				});

				return sEncodedUrl;
			}

			// encodes the binding parts in the given url if they can be resolved by the binding parser
			// e.g https://example.com/{=${Bar}}/{Foo}/{{{Unresolvable}}} => https://example.com/ResolvedBar/ResolvedFoo/{{{Unresolvable}}}
			function resolveAndEncodeUrlParameters(sUrl, aParameters) {
				var sEncodedUrl = sUrl;
				aParameters.forEach(function(sParameter) {
					var sResolvedBinding;
					try {
						sResolvedBinding = resolveBinding(sParameter, oBindingReferenceElement);
					} catch (oError) {
						sResolvedBinding = sParameter;
						nStatusCode = IFrame.statusCodes.UNRESOLVED_JSON;
					}
					if (sResolvedBinding === undefined) {
						nStatusCode = IFrame.statusCodes.UNRESOLVED_JSON;
					}
					sEncodedUrl = sEncodedUrl.replace(
						sParameter,
						sParameter === sResolvedBinding
							? sParameter
							: encodeURIComponent(sResolvedBinding)
					);
				});

				return sEncodedUrl;
			}

			if (sUrl.trim() === "") {
				return { encodedUrl: sUrl, statusCode: IFrame.statusCodes.INVALID };
			}

			var aBindings = checkAndGetBindingsFromUrl.call(this, sUrl);
			if (nStatusCode > 0) {
				return { encodedUrl: sUrl, statusCode: nStatusCode };
			}

			var sEncodedUrl = encodeUrlWithoutBindings.call(this, sUrl, aBindings);
			if (nStatusCode > 0) {
				return { encodedUrl: sUrl, statusCode: nStatusCode };
			}

			sEncodedUrl = resolveAndEncodeUrlParameters.call(this, sEncodedUrl, aBindings);

			if (!IFrame.isValidUrl(encodeURI(sEncodedUrl))) {
				return { encodedUrl: sUrl, statusCode: IFrame.statusCodes.INVALID };
			}

			return { encodedUrl: sEncodedUrl, statusCode: nStatusCode };
		}

	});

	IFrame.statusCodes = {
		NONE: 0,
		UNRESOLVED_JSON: 1,
		DECODING_ERROR: 2,
		UNEVEN_BRACKETS: 3,
		INVALID: 4
	};

	IFrame.isValidUrl = function(sUrl) {
		// Make sure that pseudo protocols are not allowed as IFrame src
		return (
			!URLListValidator.entries().some(function(oValidatorEntry) {
				return /javascript/i.test(oValidatorEntry.protocol);
			})
			&& URLListValidator.validate(sUrl)
		);
	};

	return IFrame;
});
