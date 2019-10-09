/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.ColorPicker
sap.ui.define(['./ColorPickerDisplayMode', "sap/ui/Device"],
	function(ColorPickerDisplayMode, Device) {
	"use strict";


	/**
	 * ColorPicker renderer.
	 * @namespace
	 */
	var ColorPickerRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ColorPickerRenderer.render = function(oRm, oControl){
		var sDisplayMode = oControl.getDisplayMode(),
			bResponsive = oControl.bResponsive;

		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (bResponsive) {
			oRm.addClass("sapUiColorPicker-ColorPickerMatrix");
			oRm.addClass("sapUiColorPicker-" + sDisplayMode);
			oRm.addClass("sapUnifiedColorPicker");
			if (oControl._bHSLMode) {
				oRm.addClass("sapUiColorPickerHSL");
			}
		}
		if (Device.system.phone) {
			oRm.addClass("sapUiCPPhone");
		}
		oRm.writeClasses();
		oRm.write(">");

		if (!bResponsive) {
			//if it's not responsive, then it's commons.ColorPicker -> render the grid
			oRm.renderControl(oControl.getAggregation("_grid"));
		} else {
			//render unified.ColorPicker
			switch (sDisplayMode) {
				case ColorPickerDisplayMode.Default:
					this.renderDefaultColorPicker(oRm, oControl);
					break;
				case ColorPickerDisplayMode.Large:
					this.renderLargeColorPicker(oRm, oControl);
					break;
				case ColorPickerDisplayMode.Simplified:
					this.renderSimplifiedColorPicker(oRm, oControl);
			}
		}

		oRm.write("</div>");
	};

	ColorPickerRenderer.renderDefaultColorPicker = function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_oCPBox"));
		if (Device.system.phone) { //mobile
			oRm.write("<div class='sapUiCPPhoneContent'>");
			oRm.write("<div class='sapUiCPSlidersPhone'>");
			oRm.renderControl(oControl.getAggregation("_oSlider"));
			oRm.renderControl(oControl.getAggregation("_oAlphaSlider"));
			oRm.write("</div>");
			this.renderMobileSwatches(oRm, oControl);
			oRm.write("</div>");
		} else { //desktop or tablet
			oRm.renderControl(oControl.getAggregation("_oSlider"));
			oRm.renderControl(oControl.getAggregation("_oAlphaSlider"));
			this.renderDesktopSwatchesAndHexFields(oRm, oControl);
		}

		oRm.write("<div class='sapUiCPDefaultWrapper'>");
		if (Device.system.phone) {
			oRm.renderControl(oControl.getAggregation("_oHexField"));
			oRm.write("<div class='sapUiCPHexText'>Hex</div>");
		}
		oRm.write("<div class='sapUiCPDefaultRGB'>");
		oRm.renderControl(oControl.getAggregation("_oRedField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oGreenField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oBlueField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oAlphaField"));
		oRm.write("</div>");

		//render the input fields for HSL/V + A and don't display them when initial rendered
		oRm.write("<div class='sapUiCPDefaultHSLV'>");
		oRm.renderControl(oControl.getAggregation("_oHueField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oSatField"));
		oRm.write("<div class='sapUiCPPercentSymbol'>%</div>");
		oRm.renderControl(oControl.getAggregation("_oLitField"));
		oRm.renderControl(oControl.getAggregation("_oValField"));
		if (oControl.getMode() === "HSL") {
			oRm.write("<div class='sapUiCPPercentSymbol'>%</div>");
		} else {
			//Val doesn't have to have '%' symbol so just render an empty div
			this.renderEmptyDiv(oRm);
		}

		oRm.renderControl(oControl.getAggregation("_oAlphaField2"));
		oRm.write("</div>");

		oRm.renderControl(oControl.getAggregation("_oButton"));
		this.renderRGBLabel(oRm, oControl);
		this.renderHSLVLabel(oRm, oControl);
		oRm.write("</div>");

	};

	ColorPickerRenderer.renderLargeColorPicker = function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_oCPBox"));
		oRm.renderControl(oControl.getAggregation("_oSlider"));
		oRm.renderControl(oControl.getAggregation("_oAlphaSlider"));
		this.renderDesktopSwatchesAndHexFields(oRm, oControl);

		oRm.write("<div class='sapUiCPRGBA'>");
		oRm.renderControl(oControl.oRbRGB);
		oRm.renderControl(oControl.getAggregation("_oRedField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oGreenField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oBlueField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oAlphaField"));
		oRm.write("</div>");
		this.renderRGBLabel(oRm, oControl);
		oRm.write("<div class='sapUiCPHSLV'>");
		oRm.renderControl(oControl.oRbHSLV);
		oRm.renderControl(oControl.getAggregation("_oHueField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oSatField"));
		oRm.write("<div class='sapUiCPPercentSymbol'>%</div>");
		oControl.getMode() === "HSL" ?  this.renderLFirst(oRm, oControl) : this.renderVFirst(oRm, oControl);
		oRm.write("</div>");
		this.renderHSLVLabel(oRm, oControl);
	};

	ColorPickerRenderer.renderSimplifiedColorPicker = function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_oCPBox"));
		if (Device.system.phone) {
			oRm.write("<div class='sapUiCPPhoneContent'>");
			oRm.write("<div class='sapUiCPSlidersPhone'>");
			oRm.renderControl(oControl.getAggregation("_oSlider"));
			oRm.write("</div>");
			oRm.renderControl(oControl.getAggregation("_oHexField"));
			this.renderMobileSwatches(oRm, oControl);
			oRm.write("<div class='sapUiCPHexWrapper'>");
			oRm.write("<span class='sapUiCPHexText'>Hex</span>");
			oRm.write("</div>");
			oRm.write("</div>");
		} else {
			oRm.renderControl(oControl.getAggregation("_oSlider"));
			this.renderDesktopSwatchesAndHexFields(oRm, oControl);
		}
	};

	/**
	 * Renders the ColorPicker's swatches and hex field.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ColorPickerRenderer.renderDesktopSwatchesAndHexFields = function(oRm, oControl) {
		oRm.write("<div class='sapUiCPComparisonWrapper'>");
		oRm.write("<div id='" + oControl.getId() + "-ocBox' class='sapUiColorPicker-ColorPickerOldColor'></div>");
		oRm.write("<div id='" + oControl.getId() + "-ncBox' class='sapUiColorPicker-ColorPickerNewColor'></div>");
		oRm.write("</div>");
		oRm.write("<div class='sapUiCPHexWrapper'>");
		oRm.write("<span class='sapUiCPHexText'>Hex</span>");
		oRm.write("</div>");
		oRm.renderControl(oControl.getAggregation("_oHexField"));

	};

	/**
	 * Renders the ColorPicker's swatches when mobile for both Default & Simplified display mode.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ColorPickerRenderer.renderMobileSwatches = function(oRm, oControl) {
		oRm.write("<div class='sapUiCPComparisonWrapper sapUiCPComparisonWrapperPhone'>");
		oRm.write("<div id='" + oControl.getId() + "-ocBox' class='sapUiColorPicker-ColorPickerOldColor'></div>");
		oRm.write("<div id='" + oControl.getId() + "-ncBox' class='sapUiColorPicker-ColorPickerNewColor'></div>");
		oRm.write("</div >");
	};

	//Renders Lit first and sets visibility hidden to Val because of flex rendering reasons.
	ColorPickerRenderer.renderLFirst = function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_oLitField"));
		oRm.write("<div class='sapUiCPPercentSymbol'>%</div>");
		oRm.renderControl(oControl.getAggregation("_oValField"));
	};

	//Renders Val first and sets visibility hidden to Lit because of flex rendering reasons.
	ColorPickerRenderer.renderVFirst = function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_oValField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oLitField"));
	};

	//Renders empty div because of display flex rendering reasons.
	ColorPickerRenderer.renderEmptyDiv = function(oRm) {
		oRm.write("<div class='sapUiCPEmptyDiv'></div>");
	};

	//Renders 'RGB' text.
	ColorPickerRenderer.renderRGBLabel = function(oRm, oControl) {
		oRm.write("<div class='sapUiCPRGBText'>");
		oRm.write("<span class='sapUiCPText'>R</span>");
		this.renderEmptyDiv(oRm);
		oRm.write("<span class='sapUiCPText'>G</span>");
		this.renderEmptyDiv(oRm);
		oRm.write("<span class='sapUiCPText'>B</span>");
		this.renderEmptyDiv(oRm);
		if (oControl.getDisplayMode() === "Default") {
			oRm.write("<span class='sapUiCPText'>A</span>");
		} else {
			oRm.write("<span class='sapUiCPText'></span>");
		}
		oRm.write("</div>");
	};

	//Renders HSL/V text.
	ColorPickerRenderer.renderHSLVLabel = function(oRm, oControl) {
		oRm.write("<div class='sapUiCPHSLVText'>");
		oRm.write("<span class='sapUiCPText'>H</span>");
		this.renderEmptyDiv(oRm);
		oRm.write("<span class='sapUiCPText'>S</span>");
		this.renderEmptyDiv(oRm);
		oControl.getMode() === "HSL" ? oRm.write("<span class='sapUiCPText'>L</span>") : oRm.write("<span class='sapUiCPText'>V</span>");
		this.renderEmptyDiv(oRm);
		oRm.write("<span class='sapUiCPText'>A</span>");
		oRm.write("</div>");
	};

	return ColorPickerRenderer;

}, /* bExport= */ true);
