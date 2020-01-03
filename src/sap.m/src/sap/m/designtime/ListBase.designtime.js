/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.ListBase control
sap.ui.define([],
	function() {
		"use strict";

		return {
			name: {
				singular: "LIST_BASE_NAME",
				plural: "LIST_BASE_NAME_PLURAL"
			},
			palette: {
				group: "LIST",
				icons: {
					svg: "sap/m/designtime/ListBase.icon.svg"
				}
			},
			aggregations: {
				items: {
					domRef: ":sap-domref > .sapMListUl:not(.sapMGrowingList)",
					actions: {
						move: "moveControls"
					}
				},
				swipeContent: {
					domRef: ":sap-domref > .sapMListSwp",
					ignore: true
				},
				headerToolbar: {
					domRef: ":sap-domref > .sapMListHdrTBar"
				},
				infoToolbar: {
					domRef: ":sap-domref .sapMListInfoTBar"
				},
				contextMenu: {
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
			}
		};

	});