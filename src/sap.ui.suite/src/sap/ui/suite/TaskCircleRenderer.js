/*!
 * ${copyright}
 */

// provides default renderer for sap.ui.suite.TaskCircle
sap.ui.define(['sap/ui/core/Core', './library', "sap/ui/core/Configuration"],
	function(Core, library, Configuration) {
	"use strict";


	// shortcut
	var TaskCircleColor = library.TaskCircleColor;

	/**
	 * TaskCircle renderer.
	 * @namespace
	 */
	var TaskCircleRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.suite.TaskCircle} oControl an object representation of the control that should be rendered
	 */
	TaskCircleRenderer.render = function(rm, oControl){
		// calculate pixel size
		var minvalue = oControl.getMinValue();
		var maxvalue = oControl.getMaxValue();
		var value = oControl.getValue();
		if (minvalue < 0) {
			minvalue = 0;
		}
		if (maxvalue < 0) {
			maxvalue = 1;
		}
		if (value < 0) {
			value = 0;
		}
		var valuestring = value.toString();
		var color = oControl.getColor();
		var style = 'sapUiTaskCircleColorGray';

		switch (color) {
			case TaskCircleColor.Red:
				style = 'sapUiTaskCircleColorRed';
				break;
			case TaskCircleColor.Yellow:
				style = 'sapUiTaskCircleColorYellow';
				break;
			case TaskCircleColor.Green:
				style = 'sapUiTaskCircleColorGreen';
				break;
			case TaskCircleColor.Gray:
				style = 'sapUiTaskCircleColorGray';
				break;
			default:
				break;
		}
		if (value < minvalue) {
			minvalue = value;
		}
		if (value > maxvalue) {
			maxvalue = value;
		}

		var psmall = 24;
		if (minvalue > 10) {
			psmall = 32;
		}
		if (minvalue > 100) {
			psmall = 46;
		}
		var plarge = 62;

		var circlesize = parseInt(Math.sqrt((value - minvalue) / (maxvalue - minvalue) * (plarge * plarge - psmall * psmall) + psmall * psmall));

		var digits = (value + '').length;
		var fontsize = circlesize * 0.55;
		if (digits > 1) {
		   fontsize = circlesize / digits;
		}

		// write the HTML into the render manager
		rm.openStart("div", oControl);
		rm.attr('tabindex', '0');

		if (oControl.getTooltip_AsString()) {
			rm.attr("title", oControl.getTooltip_AsString());
		} else {
			rm.attr("title", valuestring);
		}

		//ARIA
		if ( Configuration.getAccessibility()) {
			rm.attr('role', 'progressbar');
			rm.accessibilityState(oControl, {valuemin: minvalue});
			rm.accessibilityState(oControl, {valuemax: maxvalue});
			rm.accessibilityState(oControl, {valuenow: value});
		}

		rm.attr("class","sapUiTaskCircle " + style);

		rm.style("width", circlesize + "px");
		rm.style("height", circlesize + "px");
		rm.style("line-height", circlesize + "px");
		rm.style("font-size", parseInt(fontsize) + "px");
		rm.style("border-radius", circlesize + "px");
		rm.style("-moz-border-radius", circlesize + "px");
		rm.openEnd();
		rm.text(value);
		rm.close("div");
	};


	return TaskCircleRenderer;

}, /* bExport= */ true);