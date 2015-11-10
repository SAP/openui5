/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Requestor
sap.ui.define([], function() {
	"use strict";

	function Requestor(sServiceUrl) {
		this.sServiceUrl = sServiceUrl;
	}

	Requestor.prototype.request = function(sMethod, sRelativeUrl) {
		return Promise.resolve(
			jQuery.ajax(this.sServiceUrl + sRelativeUrl, {method : sMethod})
		);
	};

	return Requestor;
}, /* bExport= */false);
