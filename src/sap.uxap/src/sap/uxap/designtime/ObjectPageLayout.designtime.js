/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageLayout control
sap.ui.define([
	"sap/uxap/library",
	"sap/ui/core/Core"
],
function(
	library,
	Core
) {
	"use strict";

	function getSectionForAnchorBarButton (oAnchorButton) {
		var sSectionId = oAnchorButton.data("sectionId");
		return Core.byId(sSectionId);
	}

	function isHeaderInTitleArea(oPage) {
		return oPage._shouldPreserveHeaderInTitleArea() || isHeaderTemporarilyInTitleArea(oPage);
	}

	function isHeaderTemporarilyInTitleArea(oPage) {
		return oPage._bHeaderExpanded && oPage._bStickyAnchorBar;
	}

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
					move : "moveControls",
					addIFrame: {
						changeType: "addIFrame"
					}
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
					if (oElement.getAggregation("_anchorBar")) {
						return oElement.getAggregation("_anchorBar").getDomRef();
					}
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
										move : function(oElement){
											if (oElement.isA("sap.m.Button") || oElement.isA("sap.m.MenuButton")) {
												return "moveControls";
											}
										}
									}
								}
							}
						};
					} else if (oElement.isA("sap.m.Button") || oElement.isA("sap.m.MenuButton")) {
						// getResponsibleElement() replaces with the responsible element, which is then asked for:
						// the action in the context menu and the handler
						return {
							actions: {
								getResponsibleElement: getSectionForAnchorBarButton,
								actionsFromResponsibleElement: ["remove", "rename", "reveal", "addIFrame"],
								combine: null,
								split: null
							}
						};
					} else {
						//other internal controls will be disabled
						return {
							actions: "not-adaptable" //overwrites all actions for all other controls and
													 //no property changes or other technical changes are possible (not editable/selectable)
						};
					}
				}
			},
			headerContent : {
				domRef : function(oElement) {
					return oElement._getHeaderContent() ? oElement._getHeaderContent().getDomRef() : null;
				},
				childNames : {
					singular : function(){
						return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("HEADER_CONTROL_NAME");
					}
				},
				actions : {
					move : function(oElement){
						if (oElement && oElement.getParent() && (oElement.getParent().isA(["sap.uxap.ObjectPageHeaderContent", "sap.uxap.ObjectPageDynamicHeaderContent"]))){
							//only allow move inside the header
							return "moveControls";
						}
					},
					addIFrame: {
						changeType: "addIFrame"
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
				if (isHeaderInTitleArea(oElement)) {
					return ["sections"];
				} else if (oElement._bStickyAnchorBar){
					return ["sections", "headerContent"];
				} else {
					return ["sections", "anchorBar", "headerContent"];
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
