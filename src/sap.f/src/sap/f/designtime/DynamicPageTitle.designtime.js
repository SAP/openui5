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
					domRef: ":sap-domref .sapFDynamicPageTitleMainHeadingInner"
				},
				expandedHeading: {
					domRef: function (oElement) {
						return oElement.$("expand-heading-wrapper").get(0);
					},
					ignore: function () {
						return true;
					}
				},
				snappedHeading: {
					domRef: function (oElement) {
						return oElement.$("snapped-heading-wrapper").get(0);
					},
					ignore: function () {
						return true;
					}
				},
				actions: {
					domRef: ":sap-domref .sapFDynamicPageTitleActionsBar",
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
						return oElement.$("snapped-wrapper").get(0);
					},
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				},
				expandedContent: {
					domRef: function (oElement) {
						return oElement.$("expand-wrapper").get(0);
					},
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				},
				navigationActions: {
					domRef: ":sap-domref .sapFDynamicPageTitleActionsBar"
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

	}, /* bExport= */ false);