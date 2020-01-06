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
				return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("LAYOUT_CONTROL_NAME");
			},
			plural : function(){
				return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("LAYOUT_CONTROL__PLURAL");
			}
		},
		aggregations : {
			sections : {
				domRef : function(oElement) {
					return oElement.$("sectionsContainer").get(0);
				},
				childNames : {
					singular : function(){
						return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME");
					},
					plural : function(){
						return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
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
			_anchorBar : {
				ignore: false,
				domRef : function(oElement) {
					return oElement.getAggregation("_anchorBar").getDomRef();
				},
				propagateRelevantContainer: true,
				propagateMetadata : function(oElement) {
					if (oElement.isA("sap.uxap.AnchorBar")) {
						return {
							aggregations : {
								content : {
									childNames : {
										singular : function(){
											return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME");
										},
										plural : function(){
											return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
										}
									},
									actions : {
										move : {
											changeType : "moveControls"
										}
									}
								}
							}
						};
					}
				}
			},
			headerContent : {
				domRef : function(oElement) {
					return oElement._getHeaderContent() ? oElement._getHeaderContent().getDomRef() : null;
				},
				actions : {
					move : function(oElement){
						if (!oElement || oElement.getMetadata().getName() !== 'sap.uxap.ObjectPageSection'){
							return "moveControls";
						}
					}
				}
			},
			footer: {
				propagateMetadata: function (oElement) {
					if (oElement.isA("sap.m.IBar")) {
						return {
							isVisible: function(oElement) {
								return oElement.getParent().isA("sap.uxap.ObjectPageLayout")
									&& oElement.getParent().getShowFooter();
							}
						};
					}
				}
			}
		},
		scrollContainers : [{
			domRef : "> .sapUxAPObjectPageWrapper",
			aggregations : function(oElement) {
				if ((!oElement._hasDynamicTitle() && oElement.getAlwaysShowContentHeader()) ||
					(oElement._hasDynamicTitle() && (oElement.getPreserveHeaderStateOnScroll() ||
													 oElement._bPinned))) {
					return ["sections"];
				} else {
					return ["sections", "headerContent"];
				}
			}
		}, {
			domRef : function(oElement) {
				return oElement.$("vertSB-sb").get(0);
			}
		}],
		templates: {
			create: "sap/uxap/designtime/ObjectPageLayout.create.fragment.xml"
		}
	};

});