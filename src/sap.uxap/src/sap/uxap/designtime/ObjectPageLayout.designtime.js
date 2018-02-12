/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageLayout control
sap.ui.define(["sap/uxap/library"],
	function(library) {
	"use strict";

	return {
		name : {
			singular : function(){
				return library.i18nModel.getResourceBundle().getText("LAYOUT_CONTROL_NAME");
			},
			plural : function(){
				return library.i18nModel.getResourceBundle().getText("LAYOUT_CONTROL__PLURAL");
			}
		},
		aggregations : {
			sections : {
				domRef : function(oElement) {
					return oElement.$("sectionsContainer").get(0);
				},
				childNames : {
					singular : function(){
						return library.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME");
					},
					plural : function(){
						return library.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME_PLURAL");
					}
				},
				actions : {
					move : "moveControls"
				},
				beforeMove : function (ObjectPageLayout) {
					if (ObjectPageLayout){
						ObjectPageLayout._suppressScroll();
					}
				},
				afterMove : function (ObjectPageLayout) {
					if (ObjectPageLayout){
						ObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
							ObjectPageLayout._resumeScroll(false);
						});
					}
				}
			},
			headerContent : {
				domRef : function(oElement) {
					return oElement.$("headerContent").get(0);
				},
				actions : {
					move : function(oElement){
						if (!oElement || oElement.getMetadata().getName() !== 'sap.uxap.ObjectPageSection'){
							return "moveControls";
						}
					}
				}
			}
		},
		scrollContainers : [{
			domRef : "> .sapUxAPObjectPageWrapper",
			aggregations : ["sections", "headerContent"]
		}, {
			domRef : function(oElement) {
				return oElement.$("vertSB-sb").get(0);
			}
		}],
		templates: {
			create: "sap/uxap/designtime/ObjectPageLayout.create.fragment.xml"
		}
	};

}, /* bExport= */ false);
