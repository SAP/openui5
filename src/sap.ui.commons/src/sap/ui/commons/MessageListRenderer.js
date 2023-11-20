/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.MessageList
sap.ui.define([],
	function() {
	"use strict";


	/**
	 * MessageList renderer.
	 * @namespace
	 */
	var MessageListRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	MessageListRenderer.render = function(rm, oControl){
		// Opening the outer container:
	  rm.write('<ul class="sapUiMsgList"');
	  rm.writeControlData(oControl);
	  rm.write(">");

		  // Rendering all supplied messages:
		  // Most recent messages were pushed in last, so looping in reversed order
		  // to display those first.
			for (var i = oControl.aMessages.length - 1; i >= 0; i--) {
			  rm.write('<li class="sapUiMsgListLi">');
			  rm.renderControl(oControl.aMessages[i]);
			  rm.write("</li>");
			} // end for

	  // Closing container:
	  rm.write("</ul>");
	};

	return MessageListRenderer;

}, /* bExport= */ true);
