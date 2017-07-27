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
					domRef: ":sap-domref .sapFDynamicPageTitleLeftHeading"
				},
				actions: {
					domRef: function (oElement) {
						return oElement.$("overflowToolbar").get(0);
					},
					actions: {
						split: {
							changeType: "splitMenuButton"
						},
						combine: {
							changeType: "combineButtons"
						}
					}
				},
				content: {
					domRef: ":sap-domref .sapFDynamicPageTitleContent",
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