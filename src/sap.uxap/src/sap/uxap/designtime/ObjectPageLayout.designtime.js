/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageLayout control
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/uxap/library"
],
function(
	Element,
	Library,
	library
) {
	"use strict";

	function getSectionForAnchorBarButton (oAnchorButton) {
		if (oAnchorButton) {
			var sSectionId = oAnchorButton.getKey();
			return Element.getElementById(sSectionId);
		}
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
				return Library.getResourceBundleFor("sap.uxap").getText("LAYOUT_CONTROL_NAME");
			},
			plural : function(){
				return Library.getResourceBundleFor("sap.uxap").getText("LAYOUT_CONTROL_NAME_PLURAL");
			}
		},
		aggregations : {
			sections : {
				domRef : function(oElement) {
					return oElement.$("sectionsContainer").get(0);
				},
				childNames : {
					singular : function(){
						return Library.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME");
					},
					plural : function(){
						return Library.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
					}
				},
				actions : {
					move : "moveControls",
					addIFrame: {
						changeType: "addIFrame",
						text: Library.getResourceBundleFor("sap.uxap").getText("ADD_IFRAME_AS_SECTION"),
						getCreatedContainerId : function(sNewControlID) {
							var oObjectPageSection = Element.getElementById(sNewControlID);
							var oObjectPageLayout = oObjectPageSection.getParent();
							var oAnchorBar = oObjectPageLayout.getAggregation("_anchorBar");
							var oSectionButton;
							if (oAnchorBar) {
								oSectionButton = oAnchorBar.getItems().filter(function (oButton) {
									return oButton.getKey() === sNewControlID;
								})[0];
							}
							if (oSectionButton) {
								return oSectionButton.getId();
							}
							return sNewControlID;
						}
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
					if (oElement.isA("sap.m.IconTabHeader")) {
						return {
							aggregations : {
								items : {
									childNames : {
										singular : function(){
											return Library.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME");
										},
										plural : function(){
											return Library.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
										}
									},
									actions : {
										move : function(oElement){
											if (oElement.isA("sap.m.IconTabFilter")) {
												return "moveControls";
											}
										}
									}
								}
							}
						};
					} else if (oElement.isA("sap.m.IconTabFilter")) {
						// getResponsibleElement() replaces with the responsible element, which is then asked for:
						// the action in the context menu and the handler
						return {
							actions: {
								getResponsibleElement: getSectionForAnchorBarButton,
								actionsFromResponsibleElement: ["remove", "rename", "reveal", "addIFrame", "settings"],
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
					return oElement._getHeaderContentDomRef();
				},
				childNames : {
					singular : function(){
						return Library.getResourceBundleFor("sap.uxap").getText("HEADER_CONTROL_NAME");
					}
				},
				actions : {
					move : function(oElement){
						var oParent = oElement && oElement.getParent();
						if (oParent && oParent.isA("sap.uxap.ObjectPageLayout")
							&& oParent.indexOfHeaderContent(oElement) > -1){
							//only allow move inside the header
							return "moveControls";
						}
					},
					addIFrame: {
						text: Library.getResourceBundleFor("sap.uxap").getText("ADD_IFRAME_IN_HEADER"),
						changeType: "addIFrame"
					},
					remove : {
						removeLastElement: true
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
			aggregations : function(oElement, fnUpdateFunction) {
				oElement.attachEventOnce("_snapChange", function() {
					fnUpdateFunction({
						index: 0
					});
				});

				if (isHeaderInTitleArea(oElement)) {
					return ["sections"];
				} else if (oElement._bStickyAnchorBar){
					return ["sections", "headerContent"];
				} else {
					return ["sections", "_anchorBar", "headerContent"];
				}
			}
		}],
		templates: {
			create: "sap/uxap/designtime/ObjectPageLayout.create.fragment.xml"
		}
	};

});