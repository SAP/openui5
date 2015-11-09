/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Cache
sap.ui.define([], function() {
	"use strict";

	function Cache(oRequestor, sRelativeUrl) {
		this.oRequestor = oRequestor;
		this.sRelativeUrl = sRelativeUrl;
	}

	Cache.prototype.read = function () {
		return this.oRequestor.request("GET", this.sRelativeUrl);
	};

	return Cache;
}, /* bExport= */false);
