/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.f.DynamicPage control
sap.ui.define([],
	function() {
	"use strict";

	return {
		aggregations : {
			title : {
				domRef : ":sap-domref .sapFDynamicPageTitle"
			},
			header : {
				domRef : ":sap-domref .sapFDynamicPageHeader"
			},
			content : {
				domRef :  ":sap-domref .sapFDynamicPageContent"
			},
			footer : {
				domRef : ":sap-domref .sapFDynamicPageActualFooterControl"
			},
			landmarkInfo: {
				ignore: true
			}
		},
		scrollContainers : [{
				domRef : "> .sapFDynamicPageContentWrapper",
				aggregations : function(oElement) {
					if (oElement._bHeaderInTitleArea || oElement._bPinned || oElement.getPreserveHeaderStateOnScroll()) {
						return ["content"];
					} else {
						return ["header", "content"];
					}
				}
			},
			{
				domRef : function(oElement) {
					return oElement.$("vertSB-sb").get(0);
				}
			}],
		templates: {
			create: "sap/f/designtime/DynamicPage.create.fragment.xml"
		}
	};

});
