/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * BusyIndicator renderer.
	 * @namespace
	 */
	var BusyIndicatorRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	BusyIndicatorRenderer.render = function(oRm, oControl){
	
		var sSize = oControl.getSize();
		var iDesignClass = "";

		if (oControl.getDesign() == "auto") {
			iDesignClass = "sapMBusyIndicator";
		} else {
			iDesignClass = oControl.getDesign() == "dark" ? "sapMBusyIndicatorDark" : "sapMBusyIndicatorLight";
		}
	
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass(iDesignClass);
		oRm.writeClasses();
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		if (!oControl.getVisible()) {
			oRm.addStyle("visibility", "hidden");
			oRm.writeStyles();
		}

		oRm.writeAccessibilityState(oControl, {
			role : "progressbar",
			valuemin: "0", // required by the ARIA specification
			valuemax: "100" // required by the ARIA specification
			
		});
		oRm.write(">");
	
		if (oControl.getCustomIcon()) {
			oRm.renderControl(oControl._iconImage);
		} else if (oControl._bUseSvg) {
			this._renderSvg(oRm, oControl, sSize);
		} else {
			this._renderCanvas(oRm, oControl, sSize);
		}
	
		if (oControl.getText()) {
			oRm.renderControl(oControl._oLabel);
		}
	
		oRm.write("</div>");
	};
	
	// SVG based loading indicator
	BusyIndicatorRenderer._renderSvg = function(oRm, oControl, sSize){
		oRm.write('<svg');
		oRm.writeAttribute('id', oControl.getId() +  '-svg');
		oRm.writeAttribute('viewBox','0 0 100 100');
		oRm.writeAttribute('class','sapMBusySvg');
		if (sSize) {
			oRm.addStyle('width', sSize);
			oRm.addStyle('height', sSize);
			oRm.writeStyles();
		}
		oRm.write('><g transform = translate(50,50)>');
		oRm.write('<path d="M0,-36A36,36 0 1,0 36,0" stroke-width="20%" fill="none" class="sapMSpinSvg">');
		oRm.write('<animateTransform attributeName="transform" attributeType="XML" type="rotate" ');
		oRm.write('from="0" to="360" dur="1.1s" repeatCount="indefinite" />');
		oRm.write('</path></g></svg>');
	};
	
	// Canvas based loading indicator
	BusyIndicatorRenderer._renderCanvas = function(oRm, oControl, sSize){
		oRm.write('<canvas');
		oRm.writeAttribute("id", oControl.getId() +  "-canvas");
		oRm.writeAttribute("class","sapMSpinCanvas");
		oRm.writeAttribute("width","32"); // initially 2em * 16px
		oRm.writeAttribute("height","32");
		if (sSize) {
			oRm.addStyle('width', sSize);
			oRm.addStyle('height', sSize);
			oRm.writeStyles();
		}
		oRm.write('></canvas>');
	};
	

	return BusyIndicatorRenderer;

}, /* bExport= */ true);
