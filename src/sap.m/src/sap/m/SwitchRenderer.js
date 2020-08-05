/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device", "sap/m/library"], function(Device, library) {
		"use strict";

		// shortcut for sap.m.SwitchType
		var SwitchType = library.SwitchType;

		/**
		 * Switch renderer.
		 * @namespace
		 */
		var SwitchRenderer = {
			apiVersion: 2
		};

		/**
		 * CSS class to be applied to the HTML root element of the Switch control.
		 *
		 * @type {string}
		 */
		SwitchRenderer.CSS_CLASS = "sapMSwt";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the Render-Output-Buffer.
		 * @param {sap.ui.core.Control} oSwitch An object representation of the control that should be rendered.
		 */
		SwitchRenderer.render = function(oRm, oSwitch) {
			var bState = oSwitch.getState(),
				sState = bState ? oSwitch._sOn : oSwitch._sOff,
				sTooltip = oSwitch.getTooltip_AsString(),
				bEnabled = oSwitch.getEnabled(),
				sName = oSwitch.getName(),
				bAccessibilityEnabled = sap.ui.getCore().getConfiguration().getAccessibility(),
				bAnimate = sap.ui.getCore().getConfiguration().getAnimation(),
				CSS_CLASS = SwitchRenderer.CSS_CLASS;

			oRm.openStart("div", oSwitch);
			oRm.class(CSS_CLASS + "Cont");

			if (!bEnabled) {
				oRm.class(CSS_CLASS + "ContDisabled");
			}

			if (bEnabled) {
				oRm.attr("tabindex", "0");
			}

			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}

			if (bAccessibilityEnabled) {
				this.writeAccessibilityState(oRm, oSwitch);
			}

			oRm.openEnd();
			oRm.openStart("div", oSwitch.getId() + "-switch");
			oRm.attr("aria-hidden", "true");
			oRm.class(CSS_CLASS);
			if (bAnimate) {
				oRm.class(CSS_CLASS + "Trans");
			}
			oRm.class(bState ? CSS_CLASS + "On" : CSS_CLASS + "Off");
			oRm.class(CSS_CLASS + oSwitch.getType());

			if (Device.system.desktop && bEnabled) {
				oRm.class(CSS_CLASS + "Hoverable");
			}

			if (!bEnabled) {
				oRm.class(CSS_CLASS + "Disabled");
			}

			if (oSwitch._sOn === " " && oSwitch._sOff === " ") {
				oRm.class(CSS_CLASS + "NoLabel");
			}

			oRm.openEnd();
			oRm.openStart("div", oSwitch.getId() + "-inner");
			oRm.class(CSS_CLASS + "Inner");
			oRm.openEnd();

			// text
			this.renderText(oRm, oSwitch);

			// handle
			this.renderHandle(oRm, oSwitch, sState);

			oRm.close("div");
			oRm.close("div");

			if (sName) {

				// checkbox
				this.renderCheckbox(oRm, oSwitch, sState);
			}

			if (bAccessibilityEnabled) {
				this.renderInvisibleElement(oRm, oSwitch, {
					id: oSwitch.getInvisibleElementId(),
					text: oSwitch.getInvisibleElementText(bState)
				});
			}

			oRm.close("div");
		};

		SwitchRenderer.renderText = function(oRm, oSwitch) {
			var CSS_CLASS = SwitchRenderer.CSS_CLASS,
				bDefaultType = oSwitch.getType() === SwitchType.Default;

			// on
			oRm.openStart("div", oSwitch.getId() + "-texton");
			oRm.class(CSS_CLASS + "Text");
			oRm.class(CSS_CLASS + "TextOn");
			oRm.openEnd();
			oRm.openStart("span");
			oRm.class(CSS_CLASS + "Label");
			oRm.class(CSS_CLASS + "LabelOn");
			oRm.openEnd();

			if (bDefaultType) {
				oRm.text(oSwitch._sOn);
			}

			oRm.close("span");
			oRm.close("div");

			// off
			oRm.openStart("div", oSwitch.getId() + "-textoff");
			oRm.class(CSS_CLASS + "Text");
			oRm.class(CSS_CLASS + "TextOff");
			oRm.openEnd();
			oRm.openStart("span");
			oRm.class(CSS_CLASS + "Label");
			oRm.class(CSS_CLASS + "LabelOff");
			oRm.openEnd();

			if (bDefaultType) {
				oRm.text(oSwitch._sOff);
			}

			oRm.close("span");
			oRm.close("div");
		};

		SwitchRenderer.renderHandle = function(oRm, oSwitch, sState) {
			var CSS_CLASS = SwitchRenderer.CSS_CLASS;

			oRm.openStart("div", oSwitch.getId() + "-handle");
			oRm.attr("data-sap-ui-swt", sState);
			oRm.class(CSS_CLASS + "Handle");
			oRm.openEnd();
			oRm.close("div");
		};

		SwitchRenderer.renderCheckbox = function(oRm, oSwitch, sState) {
			oRm.voidStart("input", oSwitch.getId() + "-input");
			oRm.attr("type", "checkbox");
			oRm.attr("name", oSwitch.getName());
			oRm.attr("value", sState);

			if (oSwitch.getState()) {
				oRm.attr("checked", "checked");
			}

			if (!oSwitch.getEnabled()) {
				oRm.attr("disabled", "disabled");
			}

			oRm.voidEnd();
		};

		/**
		 * Writes the accessibility state.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSwitch An object representation of the control that should be rendered.
		 */
		SwitchRenderer.writeAccessibilityState = function(oRm, oSwitch) {
			var mAriaLabelledby = oSwitch.getAriaLabelledBy(),
				mAccessibilityStates;

			if (mAriaLabelledby) {
				mAriaLabelledby = {
					value: oSwitch.getInvisibleElementId(),
					append: true
				};
			}

			mAccessibilityStates = {
				role: "switch",
				checked: oSwitch.getState(),
				labelledby: mAriaLabelledby
			};

			oRm.accessibilityState(oSwitch, mAccessibilityStates);
		};

		/**
		 * Writes an invisible span element with a text node that is referenced in the ariaLabelledBy
		 * associations for screen reader announcement.
		 *
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSwitch An object representation of the control that should be rendered.
		 * @param {object} mOptions
		 */
		SwitchRenderer.renderInvisibleElement = function(oRm, oSwitch, mOptions) {
			oRm.openStart("span", mOptions.id);
			oRm.attr("aria-hidden", "true");
			oRm.class("sapUiInvisibleText");
			oRm.openEnd();
			oRm.text(mOptions.text);
			oRm.close("span");
		};

		return SwitchRenderer;

	}, /* bExport= */ true);