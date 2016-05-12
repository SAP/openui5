/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		"use strict";

		/**
		 * Slider renderer.
		 * @namespace
		 */
		var SliderRenderer = {};

		/**
		 * CSS class to be applied to the HTML root element of the Slider control.
		 *
		 * @type {string}
		 */
		SliderRenderer.CSS_CLASS = "sapMSlider";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the slider that should be rendered.
		 */
		SliderRenderer.render = function(oRm, oSlider) {
			var bEnabled = oSlider.getEnabled(),
				sTooltip = oSlider.getTooltip_AsString(),
				CSS_CLASS = SliderRenderer.CSS_CLASS;

			oRm.write("<div");
			this.addClass(oRm, oSlider);

			if (!bEnabled) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}

			oRm.addStyle("width", oSlider.getWidth());
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeControlData(oSlider);

			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			oRm.write(">");
			oRm.write('<div');
			oRm.writeAttribute("id", oSlider.getId() + "-inner");
			this.addInnerClass(oRm, oSlider);

			if (!bEnabled) {
				oRm.addClass(CSS_CLASS + "InnerDisabled");
			}

			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			if (oSlider.getProgress()) {
				this.renderProgressIndicator(oRm, oSlider);
			}

			this.renderHandles(oRm, oSlider);
			oRm.write("</div>");

			this.renderLabels(oRm, oSlider);

			if (oSlider.getName()) {
				this.renderInput(oRm, oSlider);
			}

			oRm.write("</div>");
		};

		SliderRenderer.renderProgressIndicator = function(oRm, oSlider) {
			oRm.write("<div");
			oRm.writeAttribute("id", oSlider.getId() + "-progress");
			this.addProgressIndicatorClass(oRm, oSlider);
			oRm.addStyle("width", oSlider._sProgressValue);
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(' aria-hidden="true"></div>');
		};

		/**
		 * This hook method is reserved for derived classes to render more handles.
		 *
		 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the slider that should be rendered.
		 */
		SliderRenderer.renderHandles = function(oRm, oSlider) {
			this.renderHandle(oRm, oSlider,  {
				id: oSlider.getId() + "-handle"
			});
		};

		SliderRenderer.renderHandle = function(oRm, oSlider, mOptions) {
			var bEnabled = oSlider.getEnabled();

			oRm.write("<span");

			if (mOptions && (mOptions.id !== undefined)) {
				oRm.writeAttributeEscaped("id", mOptions.id);
			}

			if (oSlider.getShowHandleTooltip()) {
				this.writeHandleTooltip(oRm, oSlider);
			}

			this.addHandleClass(oRm, oSlider);
			oRm.addStyle(sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left", oSlider._sProgressValue);
			this.writeAccessibilityState(oRm, oSlider);
			oRm.writeClasses();
			oRm.writeStyles();

			if (bEnabled) {
				oRm.writeAttribute("tabindex", "0");
			}

			oRm.write("></span>");
		};

		/**
		 * Writes the handle tooltip.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 */
		SliderRenderer.writeHandleTooltip = function(oRm, oSlider) {
			oRm.writeAttribute("title", oSlider.toFixed(oSlider.getValue()));
		};

		SliderRenderer.renderInput = function(oRm, oSlider) {
			oRm.write('<input type="text"');
			oRm.writeAttribute("id", oSlider.getId() + "-input");
			oRm.addClass(SliderRenderer.CSS_CLASS + "Input");

			if (!oSlider.getEnabled()) {
				oRm.write("disabled");
			}

			oRm.writeClasses();
			oRm.writeAttributeEscaped("name", oSlider.getName());
			oRm.writeAttribute("value", oSlider.toFixed(oSlider.getValue()));
			oRm.write("/>");
		};

		/**
		 * Writes the accessibility state to the control.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 */
		SliderRenderer.writeAccessibilityState = function(oRm, oSlider) {
			oRm.writeAccessibilityState(oSlider, {
				role: "slider",
				orientation: "horizontal",
				valuemin: oSlider.toFixed(oSlider.getMin()),
				valuemax: oSlider.toFixed(oSlider.getMax()),
				valuenow: oSlider.toFixed(oSlider.getValue())
			});
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the HTML root element of the control.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.36
		 */
		SliderRenderer.addClass = function(oRm, oSlider) {
			oRm.addClass(SliderRenderer.CSS_CLASS);
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the inner element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.38
		 */
		SliderRenderer.addInnerClass = function(oRm, oSlider) {
			oRm.addClass(SliderRenderer.CSS_CLASS + "Inner");
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the progress indicator element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.38
		 */
		SliderRenderer.addProgressIndicatorClass = function(oRm, oSlider) {
			oRm.addClass(SliderRenderer.CSS_CLASS + "Progress");
		};

		/**
		 * This method is reserved for derived classes to add extra CSS classes to the handle element.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 * @since 1.38
		 */
		SliderRenderer.addHandleClass = function(oRm, oSlider) {
			oRm.addClass(SliderRenderer.CSS_CLASS + "Handle");
		};

		/**
		 * This hook method is reserved for derived classes to render the labels.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSlider An object representation of the control that should be rendered.
		 */
		SliderRenderer.renderLabels = function (oRm, oSlider) {};

		return SliderRenderer;

	}, /* bExport= */ true);