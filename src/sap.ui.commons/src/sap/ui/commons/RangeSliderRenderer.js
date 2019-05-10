/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.RangeSlider
sap.ui.define(['./SliderRenderer', 'sap/ui/core/Renderer'],
	function(SliderRenderer, Renderer) {
	"use strict";


	/**
	 * RangeSlider renderer.
	 * @namespace
	 */
	var RangeSliderRenderer = Renderer.extend(SliderRenderer);

	/**
	 * Renders the Grip for the slider control, using the provided {@link sap.ui.core.RenderManager}.
	 * Each slider is handeled as individual single sliders for aria.
	 * Min and max values are adjusted when sliders are moved.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.commons.RangeSlider} oSlider An object representation of the control that should be rendered.
	 */
	RangeSliderRenderer.renderGrip = function(rm, oSlider){
		//Left Grip
		rm.write('<div');

		// Icon for grip
		rm.writeAttribute('id', oSlider.getId() + '-grip');
		if (oSlider.getEnabled()) {
			rm.writeAttribute('tabindex', '0');
		} else {
			rm.writeAttribute('tabindex', '-1');
		}
		rm.writeAttribute('class', 'sapUiSliGrip');
		rm.writeAttribute('title', oSlider.getValue());

		// ARIA
		rm.writeAccessibilityState(oSlider, {
			role: 'slider',
			controls: oSlider.getId() + '-grip2',
			orientation: 'horizontal',
			valuemin: oSlider.getMin(),
			valuemax: oSlider.getValue2(),
			live: 'assertive',
			disabled: !oSlider.getEditable() || !oSlider.getEnabled(),
			describedby: oSlider.getTooltip_AsString() ? (oSlider.getId() + '-Descr ' + oSlider.getAriaDescribedBy().join(" ")) : undefined
		});

		rm.write('>&#9650;</div>'); // Symbol for HCB Theme (Must be hidden in other themes)

		//Right Grip
		rm.write('<div');

		// Icon for grip
		rm.writeAttribute('id', oSlider.getId() + '-grip2');
		if (oSlider.getEnabled()) {
			rm.writeAttribute('tabindex', '0');
		} else {
			rm.writeAttribute('tabindex', '-1');
		}
		rm.writeAttribute('class', 'sapUiSliGrip');
		rm.writeAttribute('title', oSlider.getValue2());

		var sOriantation = 'horizontal';
		if (oSlider.getVertical()) {
			sOriantation = 'vertical';
		}

		// ARIA
		rm.writeAccessibilityState(oSlider, {
			role: 'slider',
			controls: oSlider.getId() + '-grip',
			orientation: sOriantation,
			valuemin: oSlider.getValue(),
			valuemax: oSlider.getMax(),
			disabled: !oSlider.getEditable() || !oSlider.getEnabled(),
			describedby: oSlider.getTooltip_AsString() ? (oSlider.getId() + '-Descr ' + oSlider.getAriaDescribedBy().join(" ")) : undefined
		});

		rm.write('>&#9650;</div>'); // Symbol for HCB Theme (Must be hidden in other themes)

	};

	/**
	 * Adds extra code to the control (i.e. in subclasses), using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.commons.RangeSlider} oSlider An object representation of the control that should be rendered.
	 */
	RangeSliderRenderer.controlAdditionalCode = function(rm, oSlider){
		rm.addClass('sapUiRSli');
	};

	return RangeSliderRenderer;

}, /* bExport= */ true);
