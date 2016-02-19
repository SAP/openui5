/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/m/SelectRenderer', 'sap/ui/core/ValueStateSupport', 'sap/m/TabStripSelect', 'sap/m/TabStripItem'],
	function(jQuery, Renderer, SelectRenderer, ValueStateSupport, TabStripSelect, TabStripItem) {
		"use strict";

		/**
		 * <code>TabStripSelect</code> renderer.
		 * @namespace
		 */
		var TabStripSelectRenderer = Renderer.extend(SelectRenderer);

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
		 * @param oSelect {sap.m.TabStripSelect} An object representation of the <code>TabStripSelect</code> control that should be rendered
		 */
		TabStripSelectRenderer.render = function(oRm, oSelect) {
			var	sTooltip = ValueStateSupport.enrichTooltip(oSelect, oSelect.getTooltip_AsString()),
			       bEnabled = oSelect.getEnabled(),
			       CSS_CLASS = SelectRenderer.CSS_CLASS;

			oRm.write("<button");

			oRm.addClass(TabStripSelect.CSS_CLASS);

			if (!oSelect.getVisible()) {
				oRm.addClass(TabStripSelect.CSS_CLASS_INVISIBLE);
			}
			this.addClass(oRm, oSelect);
			oRm.addClass(CSS_CLASS);



			oRm.addClass(CSS_CLASS + oSelect.getType());

			if (!bEnabled) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}


			oRm.addClass(CSS_CLASS + "WithArrow");
			oRm.addStyle("max-width", oSelect.getMaxWidth());
			oRm.writeControlData(oSelect);
			oRm.writeStyles();
			oRm.writeClasses();
			this.writeAccessibilityState(oRm, oSelect);

			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			// by specification we do not this to to be tabbable at all
			oRm.writeAttribute("tabindex", "-1");

			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapMSltInner");
			if (bEnabled && sap.ui.Device.system.desktop) {
				oRm.addClass(CSS_CLASS + "Hoverable");
			}
			oRm.writeClasses();
			oRm.write(">");


			if (sap.ui.Device.system.phone)  {
				this.renderLabel(oRm, oSelect);
				this.renderArrow(oRm, oSelect);
			} else {
				this.renderIcon(oRm, oSelect);
			}


			if (oSelect._isRequiredSelectElement()) {
				this.renderSelectElement(oRm, oSelect);
			}

			oRm.write("</div>");
			oRm.write("</button>");
		};

		/**
		 * Renders the label of the <code>TabStripSelect</code>, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.TabStripSelect} oTabStripSelect An object representation of the control that should be rendered
		 * @private
		 * @override
		 */
		TabStripSelectRenderer.renderLabel = function(oRm, oSelect) {
			var oSelectedItem = oSelect.getSelectedItem(),
			    sTextDir = oSelect.getTextDirection(),
			    sTextAlign = Renderer.getTextAlign(oSelect.getTextAlign(), sTextDir),
			    sStateClass = ' ';

			oRm.write("<label");
			oRm.writeAttribute("id", oSelect.getId() + "-label");
			oRm.writeAttribute("for", oSelect.getId());
			oRm.addClass(SelectRenderer.CSS_CLASS + "Label");

			if (sTextDir !== sap.ui.core.TextDirection.Inherit) {
				oRm.writeAttribute("dir", sTextDir.toLowerCase());
			}

			if (sTextAlign) {
				oRm.addStyle("text-align", sTextAlign);
			}

			oRm.writeStyles();
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(oSelectedItem ? oSelectedItem.getText() : "");
			if (!oSelectedItem.getProperty('modified')) {
				sStateClass += TabStripItem.CSS_CLASS_STATE_INVISIBLE;
			}
			oRm.write('</label>');
			oRm.write('<span style="position: absolute" class="sapMTabStripSelectListItemModified' + sStateClass + '">*</span>');
		};

		return TabStripSelectRenderer;

	}, /* bExport= */ true);
