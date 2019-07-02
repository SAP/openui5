/*!
 * ${copyright}
 */
sap.ui.define(
	["sap/ui/core/IconPool", "sap/ui/Device"],
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
		var RatingIndicatorRenderer = {
				apiVersion: 2
			},
			sIconSizeMeasure = "px";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		RatingIndicatorRenderer.render = function(oRm, oControl) {
			var that = this;

			this.initSharedState(oControl);
			this.renderControlContainer(oRm, oControl, function() {
				that.renderAriaLabel(oRm, oControl);
				that.renderSelectedItems(oRm, oControl);
				that.renderUnselectedItems(oRm, oControl);
				that.renderHoverItems(oRm, oControl);
				that.renderSelectorDiv(oRm, oControl);
			});
		};

		RatingIndicatorRenderer.renderControlContainer = function(oRm, oControl, innerRenderer) {
			var bEnabled = oControl.getEnabled(),
				bEditable = oControl.getEditable(),
				bDisplayOnly = oControl.getDisplayOnly();

			oRm.openStart("div", oControl);

			oRm.style("width", this._iWidth + "px");
			oRm.style("height", this._iHeight + "px");
			if (bEnabled && !bDisplayOnly) {
				// Interactive
				oRm.attr("tabindex", "0");
				oRm.class("sapMPointer");
				if (!bEditable) {
					oRm.class("sapMRIReadOnly");
				}
			} else {
				// DisplayOnly or disabled
				oRm.attr("tabindex", "-1");
				bEnabled ? oRm.class("sapMRIDisplayOnly") : oRm.class("sapMRIDisabled");
			}
			oRm.class("sapMRI");
			oRm.class("sapUiRatingIndicator" + oControl._getIconSizeLabel(this._fIconSize));

			this.writeTooltip(oRm, oControl);
			this.writeAccessibility(oRm, oControl);

			oRm.openEnd();

			innerRenderer();

			oRm.close("div");
		};

		RatingIndicatorRenderer.initSharedState = function(oControl) {
			var fRatingValue = oControl._roundValueToVisualMode(oControl.getValue()),
				fIconSize = oControl._iPxIconSize,
				fIconPadding = oControl._iPxPaddingSize,
				iSelectedWidth = fRatingValue * fIconSize + (Math.round(fRatingValue) - 1) * fIconPadding;

			if (iSelectedWidth < 0) {
				//width should not be negative
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

		RatingIndicatorRenderer.writeTooltip = function(oRm, oControl) {
			var sTooltip = oControl.getTooltip_AsString();

			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}
		};

		RatingIndicatorRenderer.writeAccessibility = function(oRm, oControl) {
			oRm.accessibilityState(oControl, {
				role: "slider",
				orientation: "horizontal",
				valuemin: 0,
				readonly: null,
				disabled: !oControl.getEnabled() || oControl.getDisplayOnly(),
				labelledby: {
					value: this._sLabelID,
					append: true
				}
			});
		};

		RatingIndicatorRenderer.renderAriaLabel = function(oRm, oControl) {
			oRm.openStart("span", this._sLabelID).class("sapUiInvisibleText");
			oRm.attr("aria-hidden", "true");
			oRm.openEnd();
			oRm.text(oControl._oResourceBundle.getText("RATING_ARIA_NAME"));
			oRm.close("span");
		};

		RatingIndicatorRenderer.renderSelectedItems = function(oRm, oControl) {
			oRm.openStart("div", oControl.getId() + "-sel");
			oRm.class("sapMRISel");

			if (this._bUseGradient) {
				oRm.class("sapMRIGrd");
			}

			oRm.style("width", this._iSelectedWidth + sIconSizeMeasure);
			oRm.openEnd();

			for (var i = 0; i < this._iSymbolCount; i++) {
				this.renderIcon("SELECTED", oRm, oControl);
			}

			oRm.close("div");
		};

		RatingIndicatorRenderer.renderUnselectedItems = function(oRm, oControl) {
			// render unselected items div (container and relative child)
			oRm.openStart("div", oControl.getId() + "-unsel-wrapper");
			oRm.class("sapMRIUnselWrapper");
			oRm.style("width", this._iWidth - this._iSelectedWidth + sIconSizeMeasure);
			oRm.openEnd();

			oRm.openStart("div", oControl.getId() + "-unsel");
			oRm.class("sapMRIUnsel");

			if (this._bUseGradient && (oControl.getEnabled() || !oControl.getDisplayOnly())) {
				// see the specification for read only rating indicator
				oRm.class("sapMRIGrd");
			}
			oRm.openEnd();

			for (var i = 0; i < this._iSymbolCount; i++) {
				this.renderIcon("UNSELECTED", oRm, oControl);
			}

			oRm.close("div");
			oRm.close("div");
		};

		RatingIndicatorRenderer.renderHoverItems = function(oRm, oControl) {
			if (oControl.getEnabled() || !oControl.getDisplayOnly()) {
				oRm.openStart("div", oControl.getId() + "-hov");
				oRm.class("sapMRIHov");
				oRm.openEnd();

				for (var i = 0; i < this._iSymbolCount; i++) {
					this.renderIcon("HOVERED", oRm, oControl);
				}
				oRm.close("div");
			}
		};

		RatingIndicatorRenderer.renderSelectorDiv = function(oRm, oControl) {
			oRm.openStart("div", oControl.getId() + "-selector");
			oRm.class("sapMRISelector");
			oRm.openEnd();

			oRm.close("div");
		};

		RatingIndicatorRenderer.renderIcon = function(iconType, oRm, oControl) {
			var sIconURI = this.getIconURI(iconType, oControl),
				sTagName = this.getIconTag(sIconURI),
				bIsIconURI = IconPool.isIconURI(sIconURI),
				sSize = this._fIconSize + sIconSizeMeasure;

			if (sTagName === "img") {
				oRm.voidStart(sTagName);
			} else {
				oRm.openStart(sTagName);
			}

			if (iconType === "UNSELECTED" && !oControl.getEditable()) {
				iconType = "READONLY";
			}

			oRm.class("sapUiIcon");
			oRm.class(this.getIconClass(iconType));

			oRm.style("width", sSize);
			oRm.style("height", sSize);
			oRm.style("line-height", sSize);
			oRm.style("font-size", sSize);

			if (!bIsIconURI) {
				oRm.attr("src", sIconURI);
			}

			if (sTagName === "img") {
				oRm.voidEnd();
			} else {
				oRm.openEnd();

				if (bIsIconURI) {
					oRm.text(IconPool.getIconInfo(sIconURI).content);
				}
				oRm.close(sTagName);
			}
		};

		RatingIndicatorRenderer.getIconClass = function(iconType) {
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

		RatingIndicatorRenderer.getIconURI = function(sState, oControl) {
			if (
				sap.ui
					.getCore()
					.getConfiguration()
					.getTheme() === "sap_hcb"
			) {
				if (sState === "UNSELECTED" && (oControl.getEnabled() && !oControl.getDisplayOnly())) {
					return IconPool.getIconURI("unfavorite");
				}

				return IconPool.getIconURI("favorite");
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

		RatingIndicatorRenderer.getIconTag = function(sIconURI) {
			if (IconPool.isIconURI(sIconURI)) {
				return "span";
			}

			return "img";
		};

		return RatingIndicatorRenderer;
	},
	/* bExport= */ true
);
