/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.f.semantic.SemanticPage control
sap.ui.define([],
	function() {
		"use strict";

		var fnShouldIgnoreSingleAggregation = function (oControl, sAggregationGetter) {
			return !(oControl &&
				oControl[sAggregationGetter] &&
				oControl[sAggregationGetter]() &&
				oControl[sAggregationGetter]().getDomRef());
		};

		var fnIgnoreTitleActionsAggregation = function (oControl, sAggregationGetter) {
			var $ControlDomRef;

			if (!oControl) {
				return true;
			}

			$ControlDomRef = oControl.$().find("sapFDynamicPageTitleActionsBar");
			return !!($ControlDomRef.length > 0 && oControl[sAggregationGetter]().length > 0);
		};

		return {
			aggregations : {
				titleHeading : {
					domRef : function (oControl) {
						return oControl.getTitleHeading().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getTitleHeading");
					}
				},
				titleSnappedHeading : {
					domRef : function (oControl) {
						return oControl.getTitleHeading().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getTitleSnappedHeading");
					}
				},
				titleExpandedHeading : {
					domRef : function (oControl) {
						return oControl.getTitleHeading().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getTitleExpandedHeading");
					}
				},
				titleSnappedOnMobile : {
					ignore : true
				},
				titleBreadcrumbs : {
					domRef : function (oControl) {
						return oControl.getTitleBreadcrumbs().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getTitleBreadcrumbs");
					}
				},
				titleSnappedContent : {
					domRef : ":sap-domref .sapFDynamicPageTitleMainSnapContentVisible",
					actions : {
						move : {
							changeType: "moveControls"
						}
					},
					ignore : function (oControl) {
						return !!(!oControl || oControl.getTitleSnappedContent().length === 0 || oControl.getHeaderExpanded());
					}
				},
				titleExpandedContent : {
					domRef : ":sap-domref .sapFDynamicPageTitleMainExpandContentVisible",
					actions : {
						move : {
							changeType: "moveControls"
						}
					},
					ignore : function (oControl) {
						return !!(!oControl || oControl.getTitleExpandedContent().length === 0 || !oControl.getHeaderExpanded());
					}
				},
				titleContent : {
					domRef : ":sap-domref .sapFDynamicPageTitleMain > .sapFDynamicPageTitleMainInner > .sapFDynamicPageTitleMainContent",
					actions: {
						move: {
							changeType: "moveControls"
						}
					},
					ignore : function (oControl) {
						return !!(!oControl || oControl.getTitleContent().length === 0);
					}
				},
				titleMainAction : {
					domRef : function (oControl) {
						return oControl.getTitleMainAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getTitleMainAction");
					}
				},
				editAction : {
					domRef : function (oControl) {
						return oControl.getEditAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getEditAction");
					}
				},
				addAction : {
					domRef : function (oControl) {
						return oControl.getAddAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getAddAction");
					}
				},
				deleteAction : {
					domRef : function (oControl) {
						return oControl.getDeleteAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getDeleteAction");
					}
				},
				copyAction : {
					domRef : function (oControl) {
						return oControl.getCopyAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getCopyAction");
					}
				},
				flagAction : {
					domRef : function (oControl) {
						return oControl.getFlagAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getFlagAction");
					}
				},
				favoriteAction : {
					domRef : function (oControl) {
						return oControl.getFavoriteAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getFavoriteAction");
					}
				},
				fullScreenAction : {
					domRef : function (oControl) {
						return oControl.getFullScreenAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getFullScreenAction");
					}
				},
				exitFullScreenAction : {
					domRef : function (oControl) {
						return oControl.getExitFullScreenAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getExitFullScreenAction");
					}
				},
				closeAction : {
					domRef : function (oControl) {
						return oControl.getCloseAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getCloseAction");
					}
				},
				titleCustomTextActions: {
					domRef : ":sap-domref .sapFDynamicPageTitleActionsBar",
					ignore : function (oControl) {
						return fnIgnoreTitleActionsAggregation(oControl, "getTitleCustomTextActions");
					}
				},
				titleCustomIconActions : {
					domRef : ":sap-domref .sapFDynamicPageTitleActionsBar",
					ignore : function (oControl) {
						return fnIgnoreTitleActionsAggregation(oControl, "getTitleCustomIconActions");
					}
				},
				headerContent : {
					domRef : ":sap-domref .sapFDynamicPageHeaderContent",
					actions : {
						move : {
							changeType: "moveControls"
						}
					},
					ignore : function (oControl) {
						return !(oControl && oControl.getHeaderContent().length > 0);
					}
				},
				content : {
					domRef : ":sap-domref .sapFDynamicPageContent",
					ignore : function (oControl) {
						return !(oControl && oControl.getContent());
					}
				},
				footerMainAction : {
					domRef : function (oControl) {
						return oControl.getFooterMainAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getFooterMainAction");
					}
				},
				messagesIndicator : {
					domRef : function (oControl) {
						return oControl.getMessagesIndicator().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getMessagesIndicator");
					}
				},
				draftIndicator : {
					domRef : function (oControl) {
						return oControl.getDraftIndicator().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getDraftIndicator");
					}
				},
				positiveAction : {
					domRef : function (oControl) {
						return oControl.getPositiveAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getPositiveAction");
					}
				},
				negativeAction : {
					domRef : function (oControl) {
						return oControl.getNegativeAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getNegativeAction");
					}
				},
				footerCustomActions : {
					domRef : ":sap-domref .sapFDynamicPageActualFooterControl",
					ignore : function (oControl) {
						return !(oControl &&
						oControl.getFooterCustomActions() &&
						oControl.getFooterCustomActions().length > 0);
					}
				},
				discussInJamAction : {
					domRef : function (oControl) {
						return oControl.getDiscussInJamAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getDiscussInJamAction");
					}
				},
				saveAsTileAction : {
					domRef : function (oControl) {
						return oControl.getSaveAsTileAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getSaveAsTileAction");
					}
				},
				shareInJamAction : {
					domRef : function (oControl) {
						return oControl.getShareInJamAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getShareInJamAction");
					}
				},
				sendMessageAction : {
					domRef : function (oControl) {
						return oControl.getSendMessageAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getSendMessageAction");
					}
				},
				sendEmailAction : {
					domRef : function (oControl) {
						return oControl.getSendEmailAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getSendEmailAction");
					}
				},
				printAction : {
					domRef : function (oControl) {
						return oControl.getPrintAction().getDomRef();
					},
					ignore : function (oControl) {
						return fnShouldIgnoreSingleAggregation(oControl, "getPrintAction");
					}
				},
				customShareActions : {
					domRef : function (oControl) {
						return oControl._getActionSheet().getDomRef();
					},
					ignore : function (oControl) {
						// in this case we can reuse the function here
						return fnShouldIgnoreSingleAggregation(oControl, "_getActionSheet");
					}
				},
				landmarkInfo: {
					ignore: true
				}
			},
			scrollContainers : [{
				domRef : ":sap-domref .sapFDynamicPageContentWrapper",
				aggregations : function(oElement) {
					if (oElement && oElement.getDomRef() &&
						(oElement.getDomRef().querySelector(".sapFDynamicPageHeaderPinned") ||
						oElement.getPreserveHeaderStateOnScroll())) {
						return ["content"];
					} else {
						return ["headerContent", "content"];
					}
				}
			},
			{
				domRef : function(oElement) {
					return oElement.$("vertSB-sb").get(0);
				}
			}],
			templates: {
				create: "sap/f/designtime/SemanticPage.create.fragment.xml"
			}
		};

	});