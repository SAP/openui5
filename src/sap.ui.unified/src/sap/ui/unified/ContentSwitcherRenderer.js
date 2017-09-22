/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/unified/library'],
	function(jQuery, library) {
	"use strict";


	// shortcut for sap.ui.unified.ContentSwitcherAnimation
	var ContentSwitcherAnimation = library.ContentSwitcherAnimation;


	/**
	 * AnimatedContentSwitcher renderer.
	 * @namespace
	 * @deprecated Since version 1.44.0.
	 */
	var ContentSwitcherRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ContentSwitcherRenderer.render = function(oRm, oControl){
		var sId            = oControl.getId();
		var sAnimation     = oControl.getAnimation();
		if (!sap.ui.getCore().getConfiguration().getAnimation()) {
			sAnimation = ContentSwitcherAnimation.None;
		}

		var iActiveContent = oControl.getActiveContent();

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUiUfdCSwitcher");
		oRm.addClass("sapUiUfdCSwitcherAnimation" + jQuery.sap.encodeHTML(sAnimation));
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<section id=\"" + sId + "-content1\" class=\"sapUiUfdCSwitcherContent sapUiUfdCSwitcherContent1" + (iActiveContent == 1 ? " sapUiUfdCSwitcherVisible" : "") + "\">");
		this.renderContent(oRm, oControl.getContent1());
		oRm.write("</section>");

		oRm.write("<section id=\"" + sId + "-content2\" class=\"sapUiUfdCSwitcherContent sapUiUfdCSwitcherContent2" + (iActiveContent == 2 ? " sapUiUfdCSwitcherVisible" : "") + "\">");
		this.renderContent(oRm, oControl.getContent2());
		oRm.write("</section>");

		oRm.write("</div>");
	};

	ContentSwitcherRenderer.renderContent = function(oRm, aContent) {
		for (var i = 0; i < aContent.length; ++i) {
			oRm.renderControl(aContent[i]);
		}
	};

	return ContentSwitcherRenderer;

}, /* bExport= */ true);
