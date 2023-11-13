/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.f.DynamicPageTitle control
sap.ui.define([],
	function () {
		"use strict";

		return {
			aggregations: {
				heading: {
					domRef: ":sap-domref .sapFDynamicPageTitleMainHeadingInner",
					ignore: function (oElement) {
						return !oElement.getHeading();
					}
				},
				expandedHeading: {
					domRef: function (oElement) {
						return oElement.getDomRef("expand-heading-wrapper");
					},
					ignore: function (oElement) {
						return oElement.getHeading() || !oElement.getExpandedHeading();
					}
				},
				snappedHeading: {
					domRef: function (oElement) {
						return oElement.getDomRef("snapped-heading-wrapper");
					},
					ignore: function (oElement) {
						return oElement.getHeading() || !oElement.getSnappedHeading();
					}
				},
				actions: {
					domRef: ":sap-domref .sapFDynamicPageTitleMainActions",
					actions: {
						split: {
							changeType: "splitMenuButton"
						},
						combine: {
							changeType: "combineButtons"
						},
						move: {
							changeType: "moveActions"
						}
					}
				},
				content: {
					domRef: ":sap-domref .sapFDynamicPageTitleMainContent",
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				},
				snappedContent: {
					domRef: function (oElement) {
						return oElement.getDomRef("snapped-wrapper");
					},
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				},
				expandedContent: {
					domRef: function (oElement) {
						return oElement.getDomRef("expand-wrapper");
					},
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				},
				snappedTitleOnMobile: {
					ignore: true
				},
				navigationActions: {
					ignore: true
				},
				breadcrumbs: {
					ignore: true
				}
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			name: {
				singular: "DYNAMIC_PAGE_TITLE_NAME",
				plural: "DYNAMIC_PAGE_TITLE_NAME_PLURAL"
			}
		};

	});