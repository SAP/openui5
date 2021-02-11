sap.ui.define([], function() {
	"use strict";

	var StaticDesigntimeMatadata = {};

	/*
	 * Stub example
	 *	sandbox.stub(DesignTime.prototype, "getDesignTimeMetadataFor").withArgs(this.oLayout)
	 *	.returns(StaticDesigntimeMetadata.getVerticalLayoutDesigntimeMetadata());
	 */
	StaticDesigntimeMatadata.getPageDesigntimeMetadata = function() {
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
						return undefined;
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
	};

	StaticDesigntimeMatadata.getButtonDesigntimeMetadata = function() {
		return {
			palette: {
				group: "ACTION",
				icons: {
					svg: "sap/m/designtime/Button.icon.svg"
				}
			},
			actions: {
				combine: {
					changeType: "combineButtons",
					changeOnRelevantContainer: true,
					isEnabled: true
				},
				remove: {
					changeType: "hideControl"
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.$().find(".sapMBtnContent")[0];
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			},
			templates: {
				create: "sap/m/designtime/Button.create.fragment.xml"
			}
		};
	};

	StaticDesigntimeMatadata.getVerticalLayoutDesigntimeMetadata = function() {
		return {
			name: {
				singular: "VERTICAL_LAYOUT_CONTROL_NAME",
				plural: "VERTICAL_LAYOUT_NAME_PLURAL"
			},
			palette: {
				group: "LAYOUT",
				icons: {
					svg: "sap/ui/layout/designtime/VerticalLayout.icon.svg"
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
			aggregations: {
				content: {
					domRef: ":sap-domref",
					actions: {
						move: "moveControls"
					}
				}
			}
		};
	};

	StaticDesigntimeMatadata.getObjectPageSubSectionDesigntimeMetadata = function() {
		return {
			palette: {
				group: "CONTAINER",
				icons: {
					svg: "sap/uxap/designtime/ObjectPageSubSection.icon.svg"
				}
			},
			actions: {
				remove: {
					changeType: "hideControl"
				},
				reveal: {
					changeType: "unhideControl"
				},
				rename: function () {
					return {
						changeType: "rename",
						domRef: ".sapUxAPObjectPageSubSectionHeaderTitle",
						isEnabled: function (oElement) {
							return oElement.$("headerTitle").get(0) !== undefined;
						}
					};
				}
			},
			aggregations: {
				actions: {
					domRef: ":sap-domref .sapUxAPObjectPageSubSectionHeaderActions",
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				}
			}
		};
	};

	StaticDesigntimeMatadata.getObjectPageSectionDesigntimeMetadata = function() {
		return {
			name: {
				singular: function() {
					return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME");
				},
				plural: function() {
					return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
				}
			},
			palette: {
				group: "CONTAINER",
				icons: {
					svg: "sap/uxap/designtime/ObjectPageSection.icon.svg"
				}
			},
			actions: {
				remove: {
					changeType: "stashControl"
				},
				reveal: {
					changeType: "unstashControl"
				},
				rename: function () {
					return {
						changeType: "rename",
						domRef: ".sapUxAPObjectPageSectionTitle",
						isEnabled: function (oElement) {
							return oElement.$("title").get(0) !== undefined;
						}
					};
				}
			},
			aggregations: {
				subSections: {
					domRef: ":sap-domref .sapUxAPObjectPageSectionContainer",
					actions: {
						move: {
							changeType: "moveControls"
						}
					}
				}
			}
		};
	};

	StaticDesigntimeMatadata.getObjectPageLayoutDesigntimeMetadata = function() {
		return {
			name: {
				singular: function() {
					return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("LAYOUT_CONTROL_NAME");
				},
				plural: function() {
					return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("LAYOUT_CONTROL__PLURAL");
				}
			},
			aggregations: {
				sections: {
					domRef: function(oElement) {
						return oElement.$("sectionsContainer").get(0);
					},
					childNames: {
						singular: function() {
							return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME");
						},
						plural: function() {
							return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
						}
					},
					actions: {
						move: "moveControls"
					},
					beforeMove: function (ObjectPageLayout) {
						if (ObjectPageLayout) {
							ObjectPageLayout._suppressScroll();
						}
					},
					afterMove: function (ObjectPageLayout) {
						if (ObjectPageLayout) {
							ObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
								ObjectPageLayout._resumeScroll(false);
							});
						}
					}
				},
				headerContent: {
					domRef: function(oElement) {
						return oElement.$("headerContent").get(0);
					},
					actions: {
						move: function(oElement) {
							if (!oElement || oElement.getMetadata().getName() !== 'sap.uxap.ObjectPageSection') {
								return "moveControls";
							}
						}
					}
				}
			},
			scrollContainers: [{
				domRef: "> .sapUxAPObjectPageWrapper",
				aggregations: ["sections", "headerContent"]
			}, {
				domRef: function(oElement) {
					return oElement.$("vertSB-sb").get(0);
				}
			}],
			templates: {
				create: "sap/uxap/designtime/ObjectPageLayout.create.fragment.xml"
			}
		};
	};


	return StaticDesigntimeMatadata;
});