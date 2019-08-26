/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/IconPool', 'sap/ui/Device'],
	function(IconPool, Device) {
	"use strict";


	/* =========================================================== */
	/*           temporary flags for jslint syntax check           */
	/* =========================================================== */
	/*jslint nomen: false */

	/**
	 * RatingIndicator renderer.
	 * @namespace
	 */
	var RatingIndicatorRenderer = {},
		sIconSizeMeasure = 'px';

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	RatingIndicatorRenderer.render = function (oRm, oControl) {
		var that = this;

		this.initSharedState(oControl);
		this.renderControlContainer(oRm, oControl,
			function () {
				that.renderAriaLabel(oRm, oControl);
				that.renderSelectedItems(oRm, oControl);
				that.renderUnselectedItems(oRm, oControl);
				that.renderHoverItems(oRm, oControl);
				that.renderSelectorDiv(oRm, oControl);
			}
		);
	};

    RatingIndicatorRenderer.renderControlContainer = function (oRm, oControl, innerRenderer) {
	    var bEnabled = oControl.getEnabled(),
		    bEditable = oControl.getEditable(),
		    bDisplayOnly = oControl.getDisplayOnly();
	    oRm.write("<div");

        oRm.writeControlData(oControl);
        oRm.addStyle("width", this._iWidth + "px");
        oRm.addStyle("height", this._iHeight + "px");
        if (bEnabled && !bDisplayOnly) {
            // Interactive
            oRm.writeAttribute("tabindex", "0");
            oRm.addClass("sapMPointer");
	        if (!bEditable) {
		        oRm.addClass("sapMRIReadOnly");
	        }
        } else {
            // DisplayOnly or disabled
            oRm.writeAttribute("tabindex", "-1");
            bEnabled ? oRm.addClass("sapMRIDisplayOnly") : oRm.addClass("sapMRIDisabled");
        }

	    oRm.addClass("sapMRI");
        oRm.addClass("sapUiRatingIndicator" + oControl._getIconSizeLabel(this._fIconSize));
        oRm.writeStyles();
        oRm.writeClasses();
        this.writeTooltip(oRm, oControl);
        this.writeAccessibility(oRm, oControl);

		oRm.write(">");

		innerRenderer();

		oRm.write("</div>");
	};

	RatingIndicatorRenderer.initSharedState = function (oControl) {
		var fRatingValue = oControl._roundValueToVisualMode(oControl.getValue()),
			fIconSize = oControl._iPxIconSize,
			fIconPadding = oControl._iPxPaddingSize,
			iSelectedWidth = fRatingValue * fIconSize + (Math.round(fRatingValue) - 1) * fIconPadding;

		if (iSelectedWidth < 0) { //width should not be negative
			iSelectedWidth = 0;
		}

		// gradients in combination with background-clip: text are not supported by ie, android < 4.2 or blackberry
		this._bUseGradient = Device.browser.chrome || Device.browser.safari;
		this._sLabelID = oControl.getId() + "-ariaLabel";
		this._iSymbolCount = oControl.getMaxValue();
		this._iWidth = this._iSymbolCount * (fIconSize + fIconPadding) - fIconPadding;
		this._iHeight = fIconSize;
		this._iSelectedWidth = iSelectedWidth;
		this._fIconSize = fIconSize;
	};

	RatingIndicatorRenderer.writeTooltip = function (oRm, oControl) {
		var sTooltip = oControl.getTooltip_AsString();

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
	};

	RatingIndicatorRenderer.writeAccessibility = function (oRm, oControl) {
		oRm.writeAccessibilityState(oControl, {
			"role": "slider",
			"orientation": "horizontal",
			"valuemin": 0,
			"readonly": null,
			"disabled": !oControl.getEnabled() || oControl.getDisplayOnly(),
			"labelledby": {
				value: this._sLabelID,
				append: true
			}
		});
	};

	RatingIndicatorRenderer.renderAriaLabel = function (oRm, oControl) {
		oRm.write("<span id='" + this._sLabelID + "' class='sapUiInvisibleText' aria-hidden='true'>" + oControl._oResourceBundle.getText("RATING_ARIA_NAME") + "</span>");
	};

	RatingIndicatorRenderer.renderSelectedItems = function (oRm, oControl) {
		oRm.write("<div class='sapMRISel");
		if (this._bUseGradient) {
			oRm.write(" sapMRIGrd");
		}
		oRm.write("'");
		oRm.writeAttribute("id", oControl.getId() + "-sel");
		oRm.writeAttribute("style", "width: " + this._iSelectedWidth + sIconSizeMeasure);
		oRm.write(">");

		for (var i = 0; i < this._iSymbolCount; i++) {
			this.renderIcon("SELECTED", oRm, oControl);
		}

		oRm.write("</div>");
	};

	RatingIndicatorRenderer.renderUnselectedItems = function (oRm, oControl) {
		// render unselected items div (container and relative child)
		oRm.write("<div class='sapMRIUnselWrapper'");
		oRm.writeAttribute("id", oControl.getId() + "-unsel-wrapper");
		oRm.writeAttribute("style", "width: " + (this._iWidth - this._iSelectedWidth) + sIconSizeMeasure);
		oRm.write(">");
		oRm.write("<div class='sapMRIUnsel");
		if (this._bUseGradient && (oControl.getEnabled() || !oControl.getDisplayOnly())) { // see the specification for read only rating indicator
			oRm.write(" sapMRIGrd");
		}
		oRm.write("' id='" + oControl.getId() + "-unsel'>");

		for (var i = 0; i < this._iSymbolCount; i++) {
			this.renderIcon("UNSELECTED", oRm, oControl);
		}

		oRm.write("</div>");
		oRm.write("</div>");
	};

	RatingIndicatorRenderer.renderHoverItems = function (oRm, oControl) {
		if (oControl.getEnabled() || !oControl.getDisplayOnly()) {
			oRm.write("<div class='sapMRIHov' id='" + oControl.getId() + "-hov'>");

			for (var i = 0; i < this._iSymbolCount; i++) {
				this.renderIcon("HOVERED", oRm, oControl);
			}
			oRm.write("</div>");
		}
	};

	RatingIndicatorRenderer.renderSelectorDiv = function (oRm, oControl) {
		oRm.write("<div class='sapMRISelector' id='" + oControl.getId() + "-selector'>");
		oRm.write("</div>");
	};

	RatingIndicatorRenderer.renderIcon = function (iconType, oRm, oControl) {
		var sIconURI = this.getIconURI(iconType, oControl),
			tag = this.getIconTag(sIconURI),
			bIsIconURI = IconPool.isIconURI(sIconURI),
			size = this._fIconSize + sIconSizeMeasure;

        oRm.write("<" + tag + " ");
	    if (iconType === "UNSELECTED" && !oControl.getEditable()) {
		    iconType = "READONLY";
	    }
        oRm.write("class='sapUiIcon " + this.getIconClass(iconType) + "' ");

		var style = "";
		style += "width:" + size + ";";
		style += "height:" + size + ";";
		style += "line-height:" + size + ";";
		style += "font-size:" + size + ";";

		oRm.writeAttribute("style", style);

		if (!bIsIconURI) {
			oRm.writeAttributeEscaped("src", sIconURI);
		}

		oRm.write(">");

		if (bIsIconURI) {
			oRm.writeEscaped(IconPool.getIconInfo(sIconURI).content);
		}

		oRm.write("</" + tag + ">");
	};

    RatingIndicatorRenderer.getIconClass = function (iconType) {
        switch (iconType) {
            case "SELECTED":
                return "sapMRIIconSel";
            case "UNSELECTED":
                return "sapMRIIconUnsel";
            case "HOVERED":
                return "sapMRIIconHov";
            case "READONLY":
                return "sapMRIIconReadOnly";
        }
    };

    RatingIndicatorRenderer.getIconURI = function (sState, oControl) {
	    if (sap.ui.getCore().getConfiguration().getTheme() === "sap_hcb") {
		    if (sState === "UNSELECTED" && (oControl.getEnabled() && !oControl.getDisplayOnly())) {
			    return IconPool.getIconURI("unfavorite");
		    }

			return IconPool.getIconURI('favorite');
		}

	    switch (sState) {
		    case "SELECTED":
			    return oControl.getIconSelected() || IconPool.getIconURI("favorite");
		    case "UNSELECTED":
				if (oControl.getEditable() && !oControl.getDisplayOnly()) {
				    return oControl.getIconUnselected() || IconPool.getIconURI("unfavorite");
			    } else {
				    return oControl.getIconUnselected() || IconPool.getIconURI("favorite");
			    }
			    break;
		    case "HOVERED":
			    return oControl.getIconHovered() || IconPool.getIconURI("favorite");
	    }
    };

	RatingIndicatorRenderer.getIconTag = function (sIconURI) {
		if (IconPool.isIconURI(sIconURI)) {
			return "span";
		}

		return "img";
	};

	return RatingIndicatorRenderer;

}, /* bExport= */ true);
