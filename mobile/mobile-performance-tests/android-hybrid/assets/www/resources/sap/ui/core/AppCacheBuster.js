/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.require("sap.ui.core.Core");

/*
 * Provides the AppCacheBuster mechanism to load application files using a timestamp
 */
jQuery.sap.declare("sap.ui.core.AppCacheBuster", false);

(function() {

	// application cachebuster mechanism
	this.oConfiguration = sap.ui.getCore().getConfiguration();
	if (this.oConfiguration.getAppCacheBuster()) {
		var sUrl = "sap-ui-cachebuster-info.json?sap-ui-language=" + this.oConfiguration.getLanguage();
		
		// read the appCacheBuster index file
		var oResponse = jQuery.sap.sjax({url: sUrl, dataType: "json"});
		this.mIndex = oResponse && oResponse.data || {};
		var getAppCacheBusterIndex = function() {
			return this.mIndex;
		};

		// enhance the original ajax function with appCacheBuster functionality 
		var fnAjaxOrig = jQuery.ajax;
		jQuery.ajax = function ajax(url, options) {

			// modify the incoming url if found in the appCacheBuster file
			var mIndex = getAppCacheBusterIndex();
			if (mIndex) {
				var sUrl = url.url;
				// strip off the leading "./"
				if (sUrl && sUrl.slice(0, 2) === "./") {
					sUrl = sUrl.slice(2);
				}
				// fetch the timestamp out of the index
				var sTimeStamp = mIndex[sUrl];
				if (sTimeStamp) {
					url.url = "~" + sTimeStamp + "~/" + sUrl;
				}
			}

			// call the original ajax function
			return fnAjaxOrig.apply(this, arguments);

		};
	}

}());