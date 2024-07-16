/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageSection control
sap.ui.define(["sap/base/i18n/ResourceBundle", "sap/ui/core/Lib", "sap/uxap/library", "sap/ui/fl/designtime/util/editIFrame"],
	function(ResourceBundle, Library, library, editIFrame) {
	"use strict";

	function fnGetLabel(oObjectPageSection) {
		var sTitle = oObjectPageSection.getTitle();
		var aSubSection = oObjectPageSection.getSubSections();
		// If there is only one SubSection, its title is shown,
		// instead of the title of the Section (if it is available).
		if (aSubSection.length === 1 && aSubSection[0].getTitle().trim() !== "") {
			sTitle = aSubSection[0].getTitle();
		}
		return sTitle || oObjectPageSection.getId();
	}

	return {
		name : {
			singular : function(){
				return Library.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME");
			},
			plural : function(){
				return Library.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
			}
		},
		select: function(oObjectPageSection) {
			var oObjectPageLayout = oObjectPageSection.getParent();
			oObjectPageLayout.setSelectedSection(oObjectPageSection);
		},
		palette: {
			group: "CONTAINER",
			icons: {
				svg: "sap/uxap/designtime/ObjectPageSection.icon.svg"
			}
		},
		getLabel: fnGetLabel,
		actions : {
			remove : {
				changeType : "stashControl"
			},
			reveal : {
				changeType : "unstashControl",
				getLabel: fnGetLabel,
				depthOfRelevantBindings: 2
			},
			rename: function () {
				return {
					changeType: "rename",
					domRef: ".sapUxAPObjectPageSectionTitle",
					isEnabled: function (oElement) {
						return oElement._getInternalTitleVisible();
					},
					validators: [
						"noEmptyText"
				]
				};
			},
			settings(oElement) {
				const oSubSection = oElement.getSubSections()[0];
				const oBlock = oSubSection?.getBlocks?.()[0];
				if (oBlock?.getMetadata?.().getName() === "sap.ui.fl.util.IFrame") {
					return {
						icon: "sap-icon://write-new",
						name: () => {
							const oLibResourceBundle = ResourceBundle.create({
								bundleName: "sap.ui.fl.designtime.messagebundle"
							});
							return oLibResourceBundle.getText("CTX_EDIT_IFRAME");
						},
						isEnabled: true,
						handler: editIFrame.bind(this, oBlock)
					};
				}
				return undefined;
			}
		},
		aggregations: {
			subSections: {
				domRef : ":sap-domref .sapUxAPObjectPageSectionContainer",
				actions : {
					move: {
						changeType: "moveControls"
					}
				}
			}
		}
	};

});