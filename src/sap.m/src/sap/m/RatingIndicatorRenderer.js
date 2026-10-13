/*!
 * ${copyright}
 */
sap.ui.define(
	["sap/ui/core/IconPool", "sap/ui/Device", "sap/ui/core/Theming", "sap/ui/core/Lib"],
	function(IconPool, Device, Theming, Library) {
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

		// shortcut for library resource bundle
		var oResourceBundle = Library.getResourceBundleFor("sap.m");

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.RatingIndicator} oControl an object representation of the control that should be rendered
		 */
		RatingIndicatorRenderer.render = function(oRm, oControl) {
			var that = this;

			this.initSharedState(oControl);
			this.renderControlContainer(oRm, oControl, function() {
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
			oRm.style("font-size", this._iHeight + "px");
			oRm.style("line-height", ++this._iHeight + "px");


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

			if (!oControl.getIconSize()) {
				oRm.class("sapMRINoCustomIconSize");
			}

			oRm.class("sapMRI");

			if (oControl.getIconSize()) {
				oRm.class("sapUiRatingIndicator" + oControl._getIconSizeLabel(this._fIconSize));
			}

			if (oControl._isRequired()) {
				oRm.attr("aria-description", oResourceBundle.getText("ELEMENT_REQUIRED"));
			}

			this.writeTooltip(oRm, oControl);
			this.writeAccessibility(oRm, oControl);

			oRm.openEnd();

			innerRenderer();

			// render the invisible ARIA anchor for the enhanced tooltip
			if (oControl._oTooltipEnablement) {
				oControl._oTooltipEnablement.renderInvisibleTooltip(oRm);
			}

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

			// only render the native title when the enhanced tooltip is not used
			if (sTooltip && !oControl._oTooltipEnablement) {
				oRm.attr("title", sTooltip);
			}
		};

		RatingIndicatorRenderer.writeAccessibility = function(oRm, oControl) {
			var mAccProps = {
				role: "slider",
				orientation: "horizontal",
				valuemin: 0,
				disabled: !oControl.getEnabled() || oControl.getDisplayOnly(),
				roledescription: oResourceBundle.getText("RATING_INDICATOR_ARIA_ROLEDESCRIPTION"),
				required: null
			};

			// reference the invisible tooltip anchor so screen readers announce the tooltip text
			if (oControl._oTooltipEnablement) {
				var sTooltipAnchor = oControl._oTooltipEnablement.getInvisibleTooltipId();
				if (sTooltipAnchor) {
					mAccProps.describedby = { value: sTooltipAnchor, append: true };
				}
			}

			oRm.accessibilityState(oControl, mAccProps);
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
				this.renderIcon("SELECTED", oRm, oControl, i);
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
				this.renderIcon("UNSELECTED", oRm, oControl, i);
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
					this.renderIcon("HOVERED", oRm, oControl, i);
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

		RatingIndicatorRenderer.renderIcon = function(iconType, oRm, oControl, iValue) {
			var sIconURI = this.getIconURI(iconType, oControl, iValue),
				sSize = this._fIconSize + sIconSizeMeasure;

			if (iconType === "UNSELECTED" && !oControl.getEditable()) {
				iconType = "READONLY";
			}

			const aClasses = [this.getIconClass(iconType)];

			if (!IconPool.isIconURI(sIconURI)) {
				aClasses.push("sapMImg");
			}

			if (iValue >= Math.ceil(oControl.getValue())) {
				aClasses.push("sapMRIunratedIcon");
			}

			oRm.icon(sIconURI, aClasses, {}, {
				width: sSize,
				height: sSize,
				"line-height": sSize,
				"font-size": sSize
			});
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

		RatingIndicatorRenderer.getIconURI = function(sState, oControl, iValue) {
			var bIsHalfRatedIcon = isHalfRatedIcon(oControl, iValue);

			if (
				Theming
					.getTheme() === "sap_hcb"
			) {
				if (sState === "UNSELECTED" && (oControl.getEnabled() && !oControl.getDisplayOnly())) {
					return IconPool.getIconURI("unfavorite");
				}

				if (sState === "UNSELECTED" && bIsHalfRatedIcon) {
					return IconPool.getIconURI("unfavorite");
				}

				return IconPool.getIconURI("favorite");
			}

			switch (sState) {
				case "SELECTED":
					return oControl.getIconSelected() || IconPool.getIconURI("favorite");
				case "UNSELECTED":
					if (oControl.getEditable() && !oControl.getDisplayOnly() && oControl.getEnabled()) {
						return oControl.getIconUnselected() || IconPool.getIconURI("unfavorite");
					} else if (bIsHalfRatedIcon) {
						return oControl.getIconUnselected() || IconPool.getIconURI("unfavorite");
					} else {
						return oControl.getIconUnselected() || IconPool.getIconURI("favorite");
					}
				case "HOVERED":
					return oControl.getIconHovered() || IconPool.getIconURI("favorite");
				default:
					return IconPool.getIconURI("favorite");
			}
		};

		function isHalfRatedIcon(oControl, iValue) {
			if (typeof iValue !== "number") {
				return false;
			}
			var fValue = oControl._roundValueToVisualMode(oControl.getValue());
			return (fValue * 2) % 2 === 1 && iValue === Math.floor(fValue);
		}

		RatingIndicatorRenderer.getIconTag = function(sIconURI) {
			if (IconPool.isIconURI(sIconURI)) {
				return "span";
			}

			return "img";
		};

		return RatingIndicatorRenderer;
	}
);
