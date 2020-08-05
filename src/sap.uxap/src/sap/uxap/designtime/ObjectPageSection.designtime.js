/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageSection control
sap.ui.define(["sap/uxap/library"],
	function(library) {
	"use strict";

	return {
		name : {
			singular : function(){
				return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME");
			},
			plural : function(){
				return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
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
		actions : {
			remove : {
				changeType : "stashControl"
			},
			reveal : {
				changeType : "unstashControl",
				getLabel: function(oControl) {
					var aSubSection = oControl.getSubSections();

					// If there is only one SubSection, its title is shown in the AnchorBar,
					// instead of the title of the Section (if it is available).
					if (aSubSection.length === 1 && aSubSection[0].getTitle().trim() !== "") {
						return aSubSection[0].getTitle();
					}

					return oControl.getTitle();
				}
			},
			rename: function () {
				return {
					changeType: "rename",
					domRef: ".sapUxAPObjectPageSectionTitle",
					isEnabled: function (oElement) {
						return oElement.$("title").get(0) != undefined;
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
