/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Locale",
	"sap/base/strings/formatMessage",
	'sap/base/util/isPlainObject',
	"sap/base/Log",
	"sap/ui/core/date/UI5Date",
	"sap/base/i18n/Localization",
	"sap/base/util/deepClone"
], function(
	Locale,
	formatMessage,
	isPlainObject,
	Log,
	UI5Date,
	Localization,
	deepClone
) {
	"use strict";

	/**
	 * Utility class helping with JSON strings and formatters.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.integration.util.Utils
	 */
	var Utils = { };

	/**
	 * Currently WZ language list does not match the one used by Card Editor
	 * Need to mapping the different languages
	 * key/value:  language_code_in_WZ/language_code_in_CE
	 * NOTES: skip the languages which does not match between Card Editor and UI5, eg: cy-GB/cy, nb-NO/no, sr-RS/sh
	 */
	Utils.languageMapping = {
		//"cy": "cy-GB",
		"da-DK": "da",
		"hi-IN": "hi",
		"hu-HU": "hu",
		"id-ID": "id",
		"ms-MY": "ms",
		"nl-NL": "nl",
		//"no-NO": "nb-NO",
		"pl-PL": "pl",
		"ro-RO": "ro",
		//"sh": "sr-RS",
		"th-TH": "th"
	};

	/**
	 * Get localization language
	 * @returns {string} language code
	 */
	Utils.getLocalizationLanguage = function() {
		var language = Localization.getLanguage().replaceAll('_', '-');
		return Utils.languageMapping[language] || language;
	};

	Utils.mapLanguagesInManifestChanges = function(oManifestChanges) {
		if (typeof oManifestChanges === "object") {
			oManifestChanges.forEach(function (oChange) {
				if (oChange.texts) {
					for (var [sLanguage, sMappingLanguage] of Object.entries(Utils.languageMapping)) {
						if (oChange.texts[sLanguage]) {
							var oTranslations = deepClone(oChange.texts[sLanguage], 500);
							delete oChange.texts[sLanguage];
							oTranslations = Object.assign(oTranslations, oChange.texts[sMappingLanguage]);
							oChange.texts[sMappingLanguage] = oTranslations;
						}
					}
				}
			});
		}
	};

	Utils._language = Utils.getLocalizationLanguage();

	/**
	 * Refresh language
	 */
	Utils.refreshLocalizationLanguage = function() {
		Utils._language = Utils.getLocalizationLanguage();
	};

	// listen to localizationChange event and update Utils._language
	Localization.attachChange(Utils.refreshLocalizationLanguage);

	/**
	 * Check if given string is a JSON.
	 * @param {string} sText The text to be tested.
	 * @returns {boolean} Whether the string is in a JSON format or not.
	 */
	Utils.isJson = function (sText) {
		if (typeof sText !== "string") {
			return false;
		}
		try {
			JSON.parse(sText);
			return true;
		} catch (error) {
			return false;
		}
	};


	/**
	 * Shifts formatter options and locale.
	 * @param {object} formatOptions The format options.
	 * @param {string} locale Custom locale
	 * @returns {object} Locale
	 */
	Utils.processFormatArguments = function (formatOptions, locale) {

		var oFormatOptions = isPlainObject(formatOptions) ? formatOptions : {},
			oLocale = typeof formatOptions === "string" ? new Locale(formatOptions) : (locale && new Locale(locale));

		return {
			formatOptions: oFormatOptions,
			locale: oLocale
		};
	};

	/**
	 * Parses the JSON Date string representation into a Date object.
	 * @param {string|int|Date} vDate String, timestamp or Date instance.
	 * @returns {string|int|Date} A Date object if the vDate matches one else the vDate itself
	 */
	Utils.parseJsonDateTime = function (vDate) {
		var JSON_DATE_TICKS = 1,
			JSON_DATE_SIGN = 2,
			JSON_DATE_MINUTES = 3;

		var rJSONDateFormat = /^\/Date\((-?\d+)(\+|-)?(\d+)?\)\/$/,
			aJSONDateParts;
		if (typeof vDate === "string") {
			aJSONDateParts = rJSONDateFormat.exec(vDate);
		}

		if (aJSONDateParts) {
			// 0 - complete results; 1 - ticks; 2 - sign; 3 - minutes
			var oResult = UI5Date.getInstance(parseInt(aJSONDateParts[JSON_DATE_TICKS]));
			if (aJSONDateParts[JSON_DATE_SIGN]) {
				var iMins = parseInt(aJSONDateParts[JSON_DATE_MINUTES]);
				if (aJSONDateParts[JSON_DATE_SIGN] === "-") {
					iMins = -iMins;
				}

				// The offset is reversed to get back the UTC date, which is
				// what the API will eventually have.
				var iCurrentMinutes = oResult.getUTCMinutes();
				oResult.setUTCMinutes(iCurrentMinutes - iMins);

			}
			if (isNaN(oResult.valueOf())) {
				Log.error("Invalid JSON Date format - " + vDate);
			} else {
				vDate = oResult;
			}
		}

		return vDate;
	};

	/**
	 * @const {int} The default timeout before a promise is rejected when Utils.timeoutPromise is used.
	 */
	Utils.DEFAULT_PROMISE_TIMEOUT = 5000;

	/**
	 * If the given promise does not resolve before the timeout, the promise is rejected and an error is logged.
	 * @param {Promise} pOriginalPromise The promise which will be encapsulated in a timeout.
	 * @param {int} [iTimeout=Utils.DEFAULT_PROMISE_TIMEOUT] The time in ms before timeout.
	 * @returns {Promise} Resolves or rejects when the given promise resolves or rejects. Additionally, if the timeout is reached - the promise is rejected.
	 */
	Utils.timeoutPromise = function (pOriginalPromise, iTimeout) {
		var pTimeoutPromise;

		if (iTimeout === undefined) {
			iTimeout = Utils.DEFAULT_PROMISE_TIMEOUT;
		}

		pTimeoutPromise = new Promise(function (resolve, reject) {
			setTimeout(function () {
				reject("The promise was not resolved after " + iTimeout + " ms so it timed out.");
			}, iTimeout);
		});

		return Promise.race([pOriginalPromise, pTimeoutPromise]);
	};

	Utils.hasFalsyValueAsString = function (sString) {
		return typeof sString == "string" && ["null", "false", "undefined", ""].indexOf(sString.trim()) > -1;
	};

	Utils.setNestedPropertyValue = function (oObject, sPath, vValue) {
		var aPaths = sPath.substring(1).split("/"),
			sPathSegment;

		for (var i = 0; i < aPaths.length - 1; i++) {
			sPathSegment = aPaths[i];

			// Prevent access to native properties
			oObject = oObject.hasOwnProperty(sPathSegment) ? oObject[sPathSegment] : undefined;

			// Only continue with lookup if the value is an object.
			// Accessing properties of other types is not allowed!
			if (oObject === null || typeof oObject !== "object") {
				break;
			}
		}

		oObject[aPaths[aPaths.length - 1]] = vValue;
	};

	Utils.getNestedPropertyValue = function (oObject, sPath) {
		var aPaths = sPath.substring(1).split("/"),
			sPathSegment;

		for (var i = 0; i < aPaths.length; i++) {
			sPathSegment = aPaths[i];

			// Prevent access to native properties
			oObject = oObject.hasOwnProperty(sPathSegment) ? oObject[sPathSegment] : undefined;

			// Only continue with lookup if the value is an object.
			// Accessing properties of other types is not allowed!
			if (oObject === null || typeof oObject !== "object") {
				break;
			}
		}

		return oObject;
	};

	/**
	 * @param {object|array} vData Object with 'undefined' values
	 * @returns {object|array} The same object will all 'undefined' values replaced with 'null'
	 */
	Utils.makeUndefinedValuesNull = function (vData) {
		if (Array.isArray(vData)) {
			return vData.map(function (vValue) {
				if (vValue === undefined) {
					return null;
				}

				if (typeof vValue === "object") {
					return Utils.makeUndefinedValuesNull(vValue);
				}

				return vValue;
			});
		}

		for (var sKey in vData) {
			if (vData.hasOwnProperty(sKey)) {
				if (vData[sKey] === undefined) {
					vData[sKey] = null;
				} else if (typeof vData[sKey] === "object") {
					vData[sKey] = Utils.makeUndefinedValuesNull(vData[sKey]);
				}
			}
		}

		return vData;
	};

	/**
	 * Generates v4 uuid (based on random numbers).
	 * @return {string} The generated v4 uuid
	 */
	Utils.generateUuidV4 = function () {
		var sUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (sPosition) {
			var iRandom = Math.random() * 16 | 0;
			if (sPosition === 'y') {
				iRandom = iRandom & 0x3 | 0x8;
			}
			return iRandom.toString(16);
		});
		return sUuid;
	};

	/**
	 * Creates binding info for the property statusText in a header if the provided configuration object is correct.
	 *
	 * @public
	 * @param {object} mFormat The formatting configuration.
	 * @returns {object} Binding info
	 */
	Utils.getStatusTextBindingInfo = function (mFormat) {
		var oBindingInfo;

		if (mFormat.parts && mFormat.translationKey && mFormat.parts.length === 2) {
			oBindingInfo = {
				parts: [
					mFormat.translationKey,
					mFormat.parts[0].toString(),
					mFormat.parts[1].toString()
				],
				formatter: function (sText, vParam1, vParam2) {
					var sParam1 = vParam1 || mFormat.parts[0];
					var sParam2 = vParam2 || mFormat.parts[1];

					if (Array.isArray(vParam1)) {
						sParam1 = vParam1.length;
					}
					if (Array.isArray(vParam2)) {
						sParam2 = vParam2.length;
					}

					var iParam1 = parseFloat(sParam1) || 0;
					var iParam2 = parseFloat(sParam2) || 0;

					return formatMessage(sText, [iParam1, iParam2]);
				}
			};
		}

		return oBindingInfo;
	};

	/**
	 * Starts a polling which executes the <code>fnRequest</code> function with a given interval.
	 * It will stop if the <code>fnRequest</code> returns <code>true</code> or the maximum time is reached.
	 * @public
	 * @param {function} fnRequest The function to repeat with each polling. This function can return <code>true</code> if the polling is done and must be stopped.
	 * @param {int} iInterval The time between each execution of the <code>fnRequest</code> in milliseconds.
	 * @param {int} iMaximum The maximum time to poll in milliseconds.
	 * @returns {object} An object with a stop function to stop the polling.
	 */
	Utils.polling = function (fnRequest, iInterval = 3000, iMaximum = 600000) {
		let iTotal = 0;
		let iTimeoutHandle;
		let bStopped = false;
		const fnPoll = async () => {
			if (iMaximum && iTotal >= iMaximum) {
				return;
			}

			const bDone = await fnRequest();

			if (bDone || bStopped) {
				return;
			}

			iTotal += iInterval;
			iTimeoutHandle = setTimeout(fnPoll, iInterval);
		};

		fnPoll();

		return {
			stop: () => {
				clearTimeout(iTimeoutHandle);
				bStopped = true;
			}
		};
	};

	return Utils;
});