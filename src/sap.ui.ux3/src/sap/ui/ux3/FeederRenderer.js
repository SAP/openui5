/*!
 * ${copyright}
 */

// Provides default renderer for the sap.ui.ux3.Feeder
sap.ui.define([
    "./library",
    "sap/ui/core/theming/Parameters",
    "sap/base/security/encodeXML"
],
	function(library, Parameters, encodeXML) {
	"use strict";


	// shortcut for sap.ui.ux3.FeederType
	var FeederType = library.FeederType;


	/**
	 * Feeder renderer.
	 * @namespace
	 */
	var FeederRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oFeeder an object representation of the control that should be rendered
	 */
	FeederRenderer.render = function(rm, oFeeder){
		// write the HTML into the render manager
	    rm.write('<div');
	    rm.writeControlData(oFeeder);
		rm.addClass('sapUiFeeder');

		switch (oFeeder.getType()) {
		case FeederType.Medium:
			rm.addClass('sapUiFeederMedium');
		break;
		case FeederType.Comment:
			rm.addClass('sapUiFeederComment');
		break;
		default: // large feeder is default
			rm.addClass('sapUiFeederLarge');
		break;
		}

		rm.writeClasses();
	    rm.write('>');

	    // thumbnail
		rm.write('<img id=' + oFeeder.getId() + '-thumb');
		var sThumbnail = oFeeder.getThumbnailSrc();
		if (!sThumbnail) {
			sThumbnail = Parameters._getThemeImage("_sap_ui_ux3_Feeder_PersonPlaceholder");
		}
		rm.writeAttributeEscaped('src', sThumbnail);

		rm.writeClasses();
		rm.write('>');

		// input area as editable DIV because of dynamic content
	    rm.write('<div id=' + oFeeder.getId() + '-input contenteditable="true" class="sapUiFeederInput" >');

	    // text
	    if (oFeeder.getText() == '') {
			rm.write(this.getEmptyTextInfo( oFeeder ));
	    } else {
			rm.writeEscaped(oFeeder.getText(), true);
	    }

	    rm.write('</div>');

	    //send button
	    oFeeder.initSendButton();
	    rm.renderControl(oFeeder.oSendButton);

	    rm.write('</div>');
	};

	FeederRenderer.getEmptyTextInfo = function( oFeeder ){
		return "<span class='sapUiFeederEmptyText'>" + encodeXML(oFeeder.getPlaceholderText() || oFeeder.rb.getText("FEED_EMPTY_FEEDER")) + "</span>";
	};


	return FeederRenderer;

}, /* bExport= */ true);
