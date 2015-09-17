/*!
 * ${copyright}
 */

// Provides a simple search feature
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	var ObjectSearch = {
	
		getEntityPath : function (oData, sId) {
			if (!oData.entities) {
				return null;
			}
			var oResult = null;
			jQuery.each(oData.entities, function (i, oEnt) {
				if (oEnt.id === sId) {
					oResult = "/entities/" + i + "/";
					return false;
				}
			});
			return oResult;
		}
	};

	return ObjectSearch;

}, /* bExport= */ true);
