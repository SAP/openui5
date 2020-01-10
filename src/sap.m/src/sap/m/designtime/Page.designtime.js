/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.Page control
sap.ui.define([],
	function () {
		"use strict";

		return {
			palette: {
				group: "CONTAINER",
				icons: {
					svg: "sap/m/designtime/Page.icon.svg"
				}
			},
			actions: {
				rename: function (oPage) {
					// When a custom header is added the title is not visualized and we do not need a rename action.
					if (oPage.getCustomHeader()) {
						return;
					}

					return {
						changeType: "rename",
						domRef: function (oControl) {
							return oControl.$("title-inner")[0];
						}
					};
				}
			},
			aggregations: {
				headerContent: {
					domRef: ":sap-domref > .sapMPageHeader .sapMBarRight",
					actions: {
						move: "moveControls"
					}
				},
				subHeader: {
					domRef: ":sap-domref > .sapMPageSubHeader"
				},
				customHeader: {
					domRef: ":sap-domref > .sapMPageHeader"
				},
				content: {
					domRef: ":sap-domref > section",
					actions: {
						move: "moveControls"
					}
				},
				footer: {
					domRef: ":sap-domref > .sapMPageFooter"
				},
				landmarkInfo: {
					ignore: true
				}
			},
			name: {
				singular: "PAGE_NAME",
				plural: "PAGE_NAME_PLURAL"
			},
			templates: {
				create: "sap/m/designtime/Page.create.fragment.xml"
			}
		};

	});