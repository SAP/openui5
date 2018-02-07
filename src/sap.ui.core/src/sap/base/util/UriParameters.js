/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	//TODO-evo: check if we should polyfill URL() and URLSearchParams insted....

	/**
	 * @interface Encapsulates all URI parameters of a given URL.
	 *
	 * Use {@link getUriParameters} to create an instance of sab.base.util.UriParameters.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @exports sap/base/util/UriParameters
	 * @param {string} sUri URL with parameters
	 * @private
	 */
	var UriParameters = function(sUri) {
		this.mParams = {};
		var sQueryString = sUri || "";
		if ( sQueryString.indexOf('#') >= 0 ) {
			sQueryString = sQueryString.slice(0, sQueryString.indexOf('#'));
		}
		if (sQueryString.indexOf("?") >= 0) {
			sQueryString = sQueryString.slice(sQueryString.indexOf("?") + 1);
			var aParameters = sQueryString.split("&"),
				mParameters = {},
				aParameter,
				sName,
				sValue;
			for (var i = 0; i < aParameters.length; i++) {
				aParameter = aParameters[i].split("=");
				sName = decodeURIComponent(aParameter[0]);
				sValue = aParameter.length > 1 ? decodeURIComponent(aParameter[1].replace(/\+/g,' ')) : "";
				if (sName) {
					if (!Object.prototype.hasOwnProperty.call(mParameters, sName)) {
						mParameters[sName] = [];
					}
					mParameters[sName].push(sValue);
				}
			}
			this.mParams = mParameters;
		}
	};

	UriParameters.prototype = {};

	/**
	 * Returns the value(s) of the URI parameter with the given name sName.
	 *
	 * If the boolean parameter bAll is <code>true</code>, an array of string values of all
	 * occurrences of the URI parameter with the given name is returned. This array is empty
	 * if the URI parameter is not contained in the windows URL.
	 *
	 * If the boolean parameter bAll is <code>false</code> or is not specified, the value of the first
	 * occurrence of the URI parameter with the given name is returned. Might be <code>null</code>
	 * if the URI parameter is not contained in the windows URL.
	 *
	 * @param {string} sName The name of the URI parameter.
	 * @param {boolean} [bAll=false] Optional, specifies whether all or only the first parameter value should be returned.
	 * @return {string|array} The value(s) of the URI parameter with the given name
	 * @SecSource {return|XSS} Return value contains URL parameters
	 * @function
	 * @name sap.base.util.UriParameters.prototype.get
	 */
	UriParameters.prototype.get = function(sName, bAll) {
		var aValues = Object.prototype.hasOwnProperty.call(this.mParams, sName) ? this.mParams[sName] : [];
		return bAll === true ? aValues : (aValues[0] || null);
	};

	return UriParameters;
});
