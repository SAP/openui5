/*!
 * ${copyright}
 */
// Provides a pseudo control for index pages within the Demokit
sap.ui.define(['jquery.sap.global', './DemokitApp'],
	function(jQuery, DemokitApp) {
	"use strict";


	var IndexPage = function(sCategory) {
		var oDemokit = DemokitApp.getInstance(),
			iHierarchyLevel = 3,
			iCols;
		
		function suffix(s,n) {
			return s.split('/').slice(-n - 1).join('/');
		}
		
		this.oDemokit = oDemokit;
		this.sPathToRoot = suffix("../../../../../../../", iHierarchyLevel);
		this.sRootUrl = window.location.pathname.split('/').slice(-iHierarchyLevel - 1, -1).join('/') + '/';
		this.sColor = "Blue";
		this.oHexGroup = new sap.ui.demokit.HexagonButtonGroup({colspan: (iCols || 5)});
		if ( sCategory && oDemokit ) {
			var aPages = oDemokit.getPagesForCategory(sCategory);
			for (var i = 0;i < aPages.length; i++) {
				this.add(true, aPages[i].text, '', this.sPathToRoot + aPages[i].ico, undefined, aPages[i].ref);
			}
		}
	};
	
	IndexPage.prototype.add = function add(bEnabled, sControl, sTooltip, sIcon, sLibrary, sRef) {
	
		var that = this,
			oButton;
		
		if ( typeof bEnabled !== "boolean" ) {
			sRef = sLibrary;
			sLibrary = sIcon;
			sIcon = sTooltip;
			sTooltip = sControl;
			sControl = bEnabled;
			bEnabled = true;
		}
		
		sRef = sRef || this.sRootUrl + sControl + '.html';
		if ( !sLibrary ) {
			sLibrary = "sap.ui.commons";
		}
	
		if ( !sTooltip ) {
			if ( bEnabled ) {
				sTooltip = "A short tutorial that explains how to use the " + sControl + ". Click to start it.";
			} else {
				sTooltip = "Here you should find a tutorial for the " + sControl + ". Unfortunately we didn't write it in time. Please hover back soon ;-)";
			}
		}
	
		oButton = new sap.ui.demokit.HexagonButton({
			enabled: bEnabled,
			color: "Gray",//this.sColor,
			tooltip : new sap.ui.commons.RichTooltip({
				title : sControl, // TODO + " - " + sLibrary,
				imageSrc : sIcon || (bEnabled ? "" : this.sPathToRoot + "theme/img/Under-construction.png"),
				text : sTooltip
			}),
			press: function() {
				that.oDemokit.navigateTo(sRef);
			}
		});
		if ( sIcon ) {
			oButton.setIcon(sIcon);
		}
		this.oHexGroup.addButton(oButton);
	
		return this;
	};
	
	IndexPage.prototype.placeAt = function(sId) {
		this.oHexGroup.placeAt(sId);
		jQuery(function() {
			if ( jQuery("#vistaico-license").size() == 0 ) {
				jQuery("body").append('<div id="vistaico-license" class="license">Some icon(s) created by <a class="sapUiDemokitLink" href="http://VistaICO.com" target="_blank">VistaICO.com</a> and <a class="sapUiDemokitLink" href="http://www.iconarchive.com/artist/fatcow.html" target="_blank">Fatcow Web Hosting</a>,	used under Creative Commons 3.0 Attribution Unported license</div>');
			}
		});
	};
	

	return IndexPage;

}, /* bExport= */ true);
