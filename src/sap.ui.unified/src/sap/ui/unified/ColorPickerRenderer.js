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
	var ColorPickerRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ColorPickerRenderer.render = function(oRm, oControl){
		var sDisplayMode = oControl.getDisplayMode(),
			bResponsive = oControl.bResponsive;

		oRm.openStart("div", oControl);
		if (bResponsive) {
			oRm.class("sapUiColorPicker-ColorPickerMatrix");
			oRm.class("sapUiColorPicker-" + sDisplayMode);
			oRm.class("sapUnifiedColorPicker");
			if (oControl._bHSLMode) {
				oRm.class("sapUiColorPickerHSL");
			}
		}
		if (Device.system.phone) {
			oRm.class("sapUiCPPhone");
		}
		oRm.openEnd();

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

		oRm.close("div");
	};

	ColorPickerRenderer.renderDefaultColorPicker = function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_oCPBox"));
		if (Device.system.phone) { //mobile
			oRm.openStart("div");
			oRm.class("sapUiCPPhoneContent");
			oRm.openEnd();
			oRm.openStart("div");
			oRm.class("sapUiCPSlidersPhone");
			oRm.openEnd();
			oRm.renderControl(oControl.getAggregation("_oSlider"));
			oRm.renderControl(oControl.getAggregation("_oAlphaSlider"));
			oRm.close("div");
			this.renderMobileSwatches(oRm, oControl);
			oRm.close("div");
		} else { //desktop or tablet
			oRm.renderControl(oControl.getAggregation("_oSlider"));
			oRm.renderControl(oControl.getAggregation("_oAlphaSlider"));
			this.renderDesktopSwatchesAndHexFields(oRm, oControl);
		}

		oRm.openStart("div");
		oRm.class("sapUiCPDefaultWrapper");
		oRm.openEnd();
		if (Device.system.phone) {
			oRm.renderControl(oControl.getAggregation("_oHexField"));
			oRm.openStart("div");
			oRm.class("sapUiCPHexText");
			oRm.openEnd();
			oRm.text("Hex");
			oRm.close("div");
		}
		oRm.openStart("div");
		oRm.class("sapUiCPDefaultRGB");
		oRm.openEnd();
		oRm.renderControl(oControl.getAggregation("_oRedField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oGreenField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oBlueField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oAlphaField"));
		oRm.close("div");

		//render the input fields for HSL/V + A and don't display them when initial rendered
		oRm.openStart("div");
		oRm.class("sapUiCPDefaultHSLV");
		oRm.openEnd();
		oRm.renderControl(oControl.getAggregation("_oHueField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oSatField"));
		oRm.openStart("div");
		oRm.class("sapUiCPPercentSymbol");
		oRm.openEnd();
		oRm.text("%");
		oRm.close("div");
		oRm.renderControl(oControl.getAggregation("_oLitField"));
		oRm.renderControl(oControl.getAggregation("_oValField"));
		if (oControl.getMode() === "HSL") {
			oRm.openStart("div");
			oRm.class("sapUiCPPercentSymbol");
			oRm.openEnd();
			oRm.text("%");
			oRm.close("div");
		} else {
			//Val doesn't have to have '%' symbol so just render an empty div
			this.renderEmptyDiv(oRm);
		}

		oRm.renderControl(oControl.getAggregation("_oAlphaField2"));
		oRm.close("div");

		oRm.renderControl(oControl.getAggregation("_oButton"));
		this.renderRGBLabel(oRm, oControl);
		this.renderHSLVLabel(oRm, oControl);
		oRm.close("div");

	};

	ColorPickerRenderer.renderLargeColorPicker = function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_oCPBox"));
		oRm.renderControl(oControl.getAggregation("_oSlider"));
		oRm.renderControl(oControl.getAggregation("_oAlphaSlider"));
		this.renderDesktopSwatchesAndHexFields(oRm, oControl);

		oRm.openStart("div");
		oRm.class("sapUiCPRGBA");
		oRm.openEnd();
		oRm.renderControl(oControl.oRbRGB);
		oRm.renderControl(oControl.getAggregation("_oRedField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oGreenField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oBlueField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oAlphaField"));
		oRm.close("div");
		this.renderRGBLabel(oRm, oControl);
		oRm.openStart("div");
		oRm.class("sapUiCPHSLV");
		oRm.openEnd();
		oRm.renderControl(oControl.oRbHSLV);
		oRm.renderControl(oControl.getAggregation("_oHueField"));
		this.renderEmptyDiv(oRm);
		oRm.renderControl(oControl.getAggregation("_oSatField"));
		oRm.openStart("div");
		oRm.class("sapUiCPPercentSymbol");
		oRm.openEnd();
		oRm.text("%");
		oRm.close("div");
		oControl.getMode() === "HSL" ?  this.renderLFirst(oRm, oControl) : this.renderVFirst(oRm, oControl);
		oRm.close("div");
		this.renderHSLVLabel(oRm, oControl);
	};

	ColorPickerRenderer.renderSimplifiedColorPicker = function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_oCPBox"));
		if (Device.system.phone) {
			oRm.openStart("div");
			oRm.class("sapUiCPPhoneContent");
			oRm.openEnd();
			oRm.openStart("div");
			oRm.class("sapUiCPSlidersPhone");
			oRm.openEnd();
			oRm.renderControl(oControl.getAggregation("_oSlider"));
			oRm.close("div");
			oRm.renderControl(oControl.getAggregation("_oHexField"));
			this.renderMobileSwatches(oRm, oControl);
			oRm.openStart("div");
			oRm.class("sapUiCPHexWrapper");
			oRm.openEnd();
			oRm.openStart("div");
			oRm.class("sapUiCPHexText");
			oRm.openEnd();
			oRm.text("Hex");
			oRm.close("div");
			oRm.close("div");
			oRm.close("div");
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
		oRm.openStart("div");
		oRm.class("sapUiCPComparisonWrapper");
		oRm.openEnd();
		oRm.openStart("div", oControl.getId() + "-ocBox");
		oRm.class("sapUiColorPicker-ColorPickerOldColor");
		oRm.openEnd();
		oRm.close("div");
		oRm.openStart("div", oControl.getId() + "-ncBox");
		oRm.class("sapUiColorPicker-ColorPickerNewColor");
		oRm.openEnd();
		oRm.close("div");
		oRm.close("div");
		oRm.openStart("div");
		oRm.class("sapUiCPHexWrapper");
		oRm.openEnd();
		oRm.openStart("span");
		oRm.class("sapUiCPHexText");
		oRm.openEnd();
		oRm.text("Hex");
		oRm.close("span");
		oRm.close("div");
		oRm.renderControl(oControl.getAggregation("_oHexField"));

	};

	/**
	 * Renders the ColorPicker's swatches when mobile for both Default & Simplified display mode.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ColorPickerRenderer.renderMobileSwatches = function(oRm, oControl) {
		oRm.openStart("div");
		oRm.class("sapUiCPComparisonWrapper");
		oRm.class("sapUiCPComparisonWrapperPhone");
		oRm.openEnd();
		oRm.openStart("div", oControl.getId() + "-ocBox");
		oRm.class("sapUiColorPicker-ColorPickerOldColor");
		oRm.openEnd();
		oRm.close("div");
		oRm.openStart("div", oControl.getId() + "-ncBox");
		oRm.class("sapUiColorPicker-ColorPickerNewColor");
		oRm.openEnd();
		oRm.close("div");
		oRm.close("div");
	};

	//Renders Lit first and sets visibility hidden to Val because of flex rendering reasons.
	ColorPickerRenderer.renderLFirst = function(oRm, oControl) {
		oRm.renderControl(oControl.getAggregation("_oLitField"));
		oRm.openStart("div");
		oRm.class("sapUiCPPercentSymbol");
		oRm.openEnd();
		oRm.text("%");
		oRm.close("div");
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
		oRm.openStart("div");
		oRm.class("sapUiCPEmptyDiv");
		oRm.openEnd();
		oRm.close("div");
	};

	//Renders 'RGB' text.
	ColorPickerRenderer.renderRGBLabel = function(oRm, oControl) {
		oRm.openStart("div");
		oRm.class("sapUiCPRGBText");
		oRm.openEnd();
		oRm.openStart("span");
		oRm.class("sapUiCPText");
		oRm.openEnd();
		oRm.text("R");
		oRm.close("span");
		this.renderEmptyDiv(oRm);
		oRm.openStart("span");
		oRm.class("sapUiCPText");
		oRm.openEnd();
		oRm.text("G");
		oRm.close("span");
		this.renderEmptyDiv(oRm);
		oRm.openStart("span");
		oRm.class("sapUiCPText");
		oRm.openEnd();
		oRm.text("B");
		oRm.close("span");
		this.renderEmptyDiv(oRm);
		if (oControl.getDisplayMode() === "Default") {
			oRm.openStart("span");
			oRm.class("sapUiCPText");
			oRm.openEnd();
			oRm.text("A");
			oRm.close("span");
		} else {
			oRm.openStart("span");
			oRm.class("sapUiCPText");
			oRm.openEnd();
			oRm.close("span");
		}
		oRm.close("div");
	};

	//Renders HSL/V text.
	ColorPickerRenderer.renderHSLVLabel = function(oRm, oControl) {
		oRm.openStart("div");
		oRm.class("sapUiCPHSLVText");
		oRm.openEnd();
		oRm.openStart("span");
		oRm.class("sapUiCPText");
		oRm.openEnd();
		oRm.text("H");
		oRm.close("span");
		this.renderEmptyDiv(oRm);
		oRm.openStart("span");
		oRm.class("sapUiCPText");
		oRm.openEnd();
		oRm.text("S");
		oRm.close("span");
		this.renderEmptyDiv(oRm);
		if (oControl.getMode() === "HSL") {
			oRm.openStart("span");
			oRm.class("sapUiCPText");
			oRm.openEnd();
			oRm.text("L");
			oRm.close("span");
		} else {
			oRm.openStart("span");
			oRm.class("sapUiCPText");
			oRm.openEnd();
			oRm.text("V");
			oRm.close("span");
		}
		this.renderEmptyDiv(oRm);
		oRm.openStart("span");
		oRm.class("sapUiCPText");
		oRm.openEnd();
		oRm.text("A");
		oRm.close("span");
		oRm.close("div");
	};

	return ColorPickerRenderer;

}, /* bExport= */ true);
