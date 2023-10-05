/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageSection control
sap.ui.define(["sap/uxap/library", "sap/ui/core/Lib"],
	function(library, Lib) {
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
				return Lib.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME");
			},
			plural : function(){
				return Lib.getResourceBundleFor("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
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
				getLabel: fnGetLabel
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
