/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.testlib.TestButton
jQuery.sap.declare("sap.ui.testlib.TestButtonRenderer");

/**
 * @class
 * @author SAP - TD Core UI&AM UI Infra
 * @version 0.21.0-SNAPSHOT
 * @static
 */
sap.ui.testlib.TestButtonRenderer = {
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that can be used for writing to the render output buffer.
 * @param {sap.ui.core.Control} oButton An object representation of the control that should be rendered.
 */
sap.ui.testlib.TestButtonRenderer.render = function(oRenderManager, oButton) {
	var rm = oRenderManager;

	// return immediately if control is invisible
	if (!oButton.getVisible()) {
		return;
	}

	rm.addClass("sapUiTstBtn");

	// button is rendered as a "<button>" element
	rm.write("<button type=\"button\""); // otherwise this turns into a submit button in IE8
	rm.writeControlData(oButton);
	if(oButton.getTooltip_AsString()) {
		rm.writeAttributeEscaped("title", oButton.getTooltip_AsString());
	}

	//ARIA
	rm.writeAccessibilityState(oButton);
	rm.writeAttribute('role', 'button');

	if (!oButton.getEnabled()) {
		rm.write(" tabIndex=\"-1\"");
		rm.addClass("sapUiTstBtnDsbl");
	} else {
		rm.write(" tabIndex=\"0\"");
		rm.addClass("sapUiTstBtnStd");
	}
	rm.writeClasses();
	rm.write(">");

	// write the button label
	if (oButton.getText()) {
		rm.writeEscaped(oButton.getText());
	}

	// close button
	rm.write("</button>");
};
