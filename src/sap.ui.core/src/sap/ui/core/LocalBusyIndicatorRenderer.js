/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @class LocalBusyIndicator renderer.
	 * @static
	 * @name sap.ui.core.LocalBusyIndicatorRenderer
	 */
	var LocalBusyIndicatorRenderer = {};
	
	(function() {
		/**
		 * Renders the HTML for the given control, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 * 
		 * @param {sap.ui.core.RenderManager}
		 *            oRm the RenderManager that can be used for writing to the
		 *            render output buffer
		 * @param {sap.ui.core.Control}
		 *            oControl an object representation of the control that should
		 *            be rendered
		 * @name sap.ui.core.LocalBusyIndicatorRenderer.render
		 * @function
		 */
		LocalBusyIndicatorRenderer.render = function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
	
			oRm.addClass("sapUiLocalBusyIndicator");
			oRm.writeClasses();
			oRm.write(">");
	
			fnRenderFlickerDivs(oRm, oControl);
	
			oRm.write("</div>");
		};
	
		var fnRenderFlickerDivs = function(oRm, oControl) {
			var sId = oControl.getId();
			var sIdAnimation = sId + "-animation";
			var aBoxEnum = [ "-leftBox", "-middleBox", "-rightBox" ];
	
			oRm.write('<div');
			oRm.writeAttribute('id', sIdAnimation);
			oRm.addClass("sapUiLocalBusyIndicatorAnimation");
			oRm.writeClasses();
			oRm.write(">");
	
			for ( var i = 0; i < aBoxEnum.length; i++) {
				oRm.write('<div');
				oRm.addClass("sapUiLocalBusyIndicatorBox");
				oRm.writeClasses();
				oRm.writeAttribute("id", sId + aBoxEnum[i]);
				oRm.write(">");
				oRm.write("</div>");
	
			}
	
			oRm.write("</div>");
		};
	}());

	return LocalBusyIndicatorRenderer;

}, /* bExport= */ true);
