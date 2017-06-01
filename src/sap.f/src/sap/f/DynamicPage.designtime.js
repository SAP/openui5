/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.f.DynamicPage control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations : {
			content : {
				domRef :  function(oElement) {
					return oElement.$("contentWrapper").get(0);
				}
			},
			vScroll : {
				ignore: false,
				domRef : function(oElement) {
					return oElement.$("vertSB-sb").get(0);
				}
			}
		}

	};

}, /* bExport= */ false);
