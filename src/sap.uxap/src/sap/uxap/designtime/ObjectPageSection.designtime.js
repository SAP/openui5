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

					// If there is only one SubSection, its name is shown in the AnchorBar,
					// instead of the name of the Section.
					if (aSubSection.length === 1) {
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
					}
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

}, /* bExport= */ false);
