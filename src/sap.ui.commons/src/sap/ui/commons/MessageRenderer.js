/*!
 * ${copyright}
 */

//Provides default renderer for control sap.ui.commons.Message
sap.ui.define(['./Link'],
	function(Link) {
	"use strict";


	/**
	 * Message renderer.
	 * @namespace
	 */
	var MessageRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * A "Message" renders with:
	 *  - An icon,
	 *  - Possibly with a "Details" pointer to point to its longText
	 *  - A shortText
	 * It is up to its host (Toast, List, ... ) to hide or not the different parts.
	 * For example, it is for the Toast to decide if icons are to be shown or not! Decision can be theme-dependent!
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	MessageRenderer.render = function(rm, oControl){
		// Opening the outer container:
		// tabindex="0": Message must be focusable for accessibility?!?
		rm.write('<div class="sapUiMsg" tabindex="0"');
		rm.writeControlData(oControl);
		rm.write('>');

		// Message icon:
		rm.write('<div class="sapUiMsgIcon sapUiMsgIcon' + oControl.getType() + '"></div>');

		// Possible "Details" pointer, with its trailing "-" separator:
		if ( typeof oControl.fnCallBack === "function" ) {
			rm.write('<span class="sapUiMsgLnk">');
			// Rendering a "short" Link pointing to the "long" Details:
			if (!oControl.oLink) {
				oControl.oLink = new Link();
				var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");
				oControl.oLink.setText(rb.getText("MSGLIST_DETAILS"));
				oControl.oLink.attachPress(function() {oControl.openDetails();});
			}
			rm.renderControl(oControl.oLink);
			rm.write(' - </span>');
		}

		// ShortText:
		rm.write('<span class="sapUiMsgTxt">');
		rm.writeEscaped(oControl.getText());
		rm.write('</span>');

		// Closing the outer container:
		rm.write('</div>');
	};

	return MessageRenderer;

}, /* bExport= */ true);
