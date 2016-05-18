/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./SliderRenderer"], function (Renderer, SliderRenderer) {
    "use strict";

    /**
     * RangeSlider renderer.
     * @namespace
     */
    var RangeSliderRenderer = Renderer.extend(SliderRenderer);

    RangeSliderRenderer.renderHandles = function (oRM, oControl) {
        this.renderHandle(oRM, oControl, {
            id: oControl.getId() + "-handle1",
            position: "start"
        });
        this.renderHandle(oRM, oControl, {
            id: oControl.getId() + "-handle2",
            position: "end"
        });

        // Render tooltips
        this.renderTooltips(oRM, oControl);
    };

    RangeSliderRenderer.renderTooltips = function (oRM, oControl) {
        // The tooltips container
        oRM.write("<div");
        oRM.writeAttribute("id", oControl.getId() + "-TooltipsContainer");
        oRM.addClass(SliderRenderer.CSS_CLASS + "TooltipContainer");
        oRM.addStyle("left","0%");
        oRM.addStyle("right","0%");
        oRM.addStyle("min-width", "0%");

        oRM.writeClasses();
        oRM.writeStyles();
        oRM.write(">");

        // The first tooltip
        oRM.write("<span");
        oRM.addClass(SliderRenderer.CSS_CLASS + "HandleTooltip");
        oRM.addStyle("width", oControl._iLongestRangeTextWidth + "px");
        oRM.writeAttribute("id", oControl.getId() + "-LeftTooltip");

        oRM.writeClasses();
        oRM.writeStyles();
        oRM.write(">");
        oRM.write("</span>");

        // The second tooltip
        oRM.write("<span");
        oRM.addClass(SliderRenderer.CSS_CLASS + "HandleTooltip");
        oRM.addStyle("width", oControl._iLongestRangeTextWidth + "px");
        oRM.writeAttribute("id", oControl.getId() + "-RightTooltip");

        oRM.writeClasses();
        oRM.writeStyles();
        oRM.write(">");
        oRM.write("</span>");

        oRM.write("</div>");
    };

    /**
     * Used to render each of the handles of the RangeSlider.
     *
     * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer.
     * @param {sap.ui.core.Control} oControl An object representation of the slider that should be rendered.
     * @param {object} mOptions Options used for specificity of the handles
     */
    RangeSliderRenderer.renderHandle = function (oRM, oControl, mOptions) {
        var bEnabled = oControl.getEnabled(),
            bRTL = sap.ui.getCore().getConfiguration().getRTL();

        oRM.write("<span");

        if (mOptions && (mOptions.id !== undefined)) {
            oRM.writeAttributeEscaped("id", mOptions.id);
        }
        if (mOptions && (mOptions.position !== undefined)) {
            oRM.writeAttribute("data-range-val", mOptions.position);
        }
        if (oControl.getShowHandleTooltip()) {
            this.writeHandleTooltip(oRM, oControl);
        }

        oRM.addClass(SliderRenderer.CSS_CLASS + "Handle");

        if (mOptions && (mOptions.id !== undefined) && mOptions.id === (oControl.getId() + "-handle1")) {
            oRM.addStyle(bRTL ? "right" : "left", oControl.getRange()[0]);
        }
        if (mOptions && (mOptions.id !== undefined) && mOptions.id === (oControl.getId() + "-handle2")) {
            oRM.addStyle(bRTL ? "right" : "left", oControl.getRange()[1]);
        }

        this.writeAccessibilityState(oRM, oControl);
        oRM.writeClasses();
        oRM.writeStyles();

        if (bEnabled) {
            oRM.writeAttribute("tabindex", "0");
        }
        oRM.write("></span>");
    };

    /**
     * Renders the lower range label under the left part of the RangeSlider control.
     *
     * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer.
     * @param {sap.ui.core.Control} oControl An object representation of the slider that should be rendered.
     */
    RangeSliderRenderer.renderStartLabel = function (oRM, oControl) {
        oRM.write("<div");
        oRM.addClass(SliderRenderer.CSS_CLASS + "Label");
        oRM.writeClasses();
        oRM.write(">");

        oRM.write(oControl.getMin());

        oRM.write("</div>");
    };

    /**
     * Renders the higher range label under the right part of the RangeSlider control.
     *
     * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer.
     * @param {sap.ui.core.Control} oControl An object representation of the slider that should be rendered.
     */
    RangeSliderRenderer.renderEndLabel = function (oRM, oControl) {
        oRM.write("<div");
        oRM.addClass(SliderRenderer.CSS_CLASS + "Label");
        oRM.writeClasses();
        oRM.write(">");

        oRM.write(oControl.getMax());

        oRM.write("</div>");
    };

    /**
     * Renders the label under the RangeSlider control.
     *
     * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer.
     * @param {sap.ui.core.Control} oControl An object representation of the slider that should be rendered.
     */
    RangeSliderRenderer.renderLabels = function (oRM, oControl) {
        oRM.write("<div");
        oRM.addClass();
        oRM.addClass(SliderRenderer.CSS_CLASS + "Labels");
        oRM.writeClasses();
        oRM.write(">");

        this.renderStartLabel(oRM, oControl);
        this.renderEndLabel(oRM, oControl);

        oRM.write("</div>");
    };

    return RangeSliderRenderer;
}, /* bExport= */ true);