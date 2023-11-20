/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.m.ListBase control
sap.ui.define([],
	function() {
		"use strict";

		function isParentListBaseInstanceAndBound(oElement) {
			var oParent = oElement;
			while (oParent) {
				if (oParent.isA("sap.m.ListBase")) {
					var oBinding = oParent.getBinding("items");
					if (oBinding) {
						return true;
					}
					return false;
				}
				oParent = oParent.getParent();
			}
			return false;
		}

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
						if (isParentListBaseInstanceAndBound(oElement)) {
							return {
								// prevent remove & rename actions on "items" aggregation and its inner controls when binding exists
								actions: {
									remove: null,
									rename: null
								}
							};
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
				},
				noData: {
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