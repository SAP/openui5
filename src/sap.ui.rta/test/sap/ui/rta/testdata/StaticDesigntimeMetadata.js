sap.ui.define(["sap/ui/core/Core", "sap/ui/core/Lib"], function(oCore, Lib) {
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
				rename(oPage) {
					// When a custom header is added the title is not visualized and we do not need a rename action.
					if (oPage.getCustomHeader()) {
						return undefined;
					}

					return {
						changeType: "rename",
						domRef(oControl) {
							return oControl.getDomRef().querySelector("[id*='title-inner']");
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
					domRef(oControl) {
						return oControl.getDomRef().querySelector(".sapMBtnContent");
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
					changeType: "hideControl",
					isEnabled(oElement) {
						var oSection = oElement.getParent();
						var aVisibleSubSections;

						if (oSection) {
							aVisibleSubSections = oSection.getSubSections().filter(function(oSubSection) {
								return oSubSection.getVisible();
							});

							return aVisibleSubSections.length > 1;
						}

						return false;
					}
				},
				reveal: {
					changeType: "unhideControl"
				},
				rename() {
					return {
						changeType: "rename",
						domRef: ".sapUxAPObjectPageSubSectionHeaderTitle",
						isEnabled(oElement) {
							return oElement.getDomRef().querySelector("[id*='headerTitle']") !== null;
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
				singular() {
					return Lib.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME");
				},
				plural() {
					return Lib.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
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
				rename() {
					return {
						changeType: "rename",
						domRef: ".sapUxAPObjectPageSectionTitle",
						isEnabled(oElement) {
							return oElement._getInternalTitleVisible();
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
				singular() {
					return Lib.getResourceBundleFor("sap.uxap").getText("LAYOUT_CONTROL_NAME");
				},
				plural() {
					return Lib.getResourceBundleFor("sap.uxap").getText("LAYOUT_CONTROL_NAME_PLURAL");
				}
			},
			aggregations: {
				sections: {
					domRef(oElement) {
						return oElement.getDomRef().querySelector("[id*='sectionsContainer']");
					},
					childNames: {
						singular() {
							return Lib.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME");
						},
						plural() {
							return Lib.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
						}
					},
					actions: {
						move: "moveControls"
					},
					beforeMove(ObjectPageLayout) {
						if (ObjectPageLayout) {
							ObjectPageLayout._suppressScroll();
						}
					},
					afterMove(ObjectPageLayout) {
						if (ObjectPageLayout) {
							ObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
								ObjectPageLayout._resumeScroll(false);
							});
						}
					}
				},
				headerContent: {
					domRef(oElement) {
						return oElement.getDomRef().querySelector("[id*='headerContent']");
					},
					actions: {
						move(oElement) {
							if (!oElement || oElement.getMetadata().getName() !== "sap.uxap.ObjectPageSection") {
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
				domRef(oElement) {
					return oElement.getDomRef().querySelector("[id*='vertSB-sb']");
				}
			}],
			templates: {
				create: "sap/uxap/designtime/ObjectPageLayout.create.fragment.xml"
			}
		};
	};

	return StaticDesigntimeMatadata;
});