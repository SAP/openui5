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
					propagateMetadata: function(oElement) {
						if (oElement.isA("sap.m.ListItemBase")) {
							var oParent = oElement.getParent();
							if (oParent && oParent.isA("sap.m.ListBase")) {
								var oBinding = oParent.getBinding("items");
								if (oBinding) {
									return {
										actions: null // when items aggregation is bound then changes the items via RTA should be prevented
									};
								}
							}
						}
					},
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