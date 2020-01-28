/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";

		/**
		 * TabContainer renderer.
		 * @namespace
		 */
		var TabContainerRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		TabContainerRenderer.render = function(oRm, oControl) {
			var oTabStrip = oControl._getTabStrip(),
				oSelectedItemContent = oControl._getSelectedItemContent();

			// start control wrapper
			oRm.openStart("div", oControl);
			oRm.class("sapMTabContainer");
			oRm.openEnd();

			if (oTabStrip) {
				oRm.renderControl(oTabStrip);
			}

			// render outer content
			oRm.openStart("div", oControl.getId() + "-containerContent");
			oRm.class("sapMTabContainerContent");
			if (oControl.getBackgroundDesign()) {
				oRm.class("sapMTabContainerContent" + oControl.getBackgroundDesign());
			}

			oRm.openEnd();

			// render inner content
			oRm.openStart("div", this.getContentDomId(oControl));
			oRm.class("sapMTabContainerInnerContent");
			oRm.accessibilityState(oControl, this.getTabContentAccAttributes(oControl));
			oRm.openEnd();

			// render the content
			if (oSelectedItemContent) {
				oSelectedItemContent.forEach(function(oContent) {
					oRm.renderControl(oContent);
				});
			}

			oRm.close("div");

			// end outer content
			oRm.close("div");

			// end control wrapper
			oRm.close("div");
		};

		/**
		 * Generates the accessibility attributes relevant for the content of the <code>TabStripContainer</code>.
		 *
		 * @param {sap.m.TabContainer} oControl The <code>TabStripContainer</code> for which accessibility properties to be generated
		 * @returns {Object} Accessibility attributes for the tab content
		 */
		TabContainerRenderer.getTabContentAccAttributes = function (oControl) {
			var sSelectedItemId = oControl.getSelectedItem(),
				oTabStripSelectedItem,
				mAccAttributes = { role: "tabpanel" };

			if (sSelectedItemId) {
				oTabStripSelectedItem = oControl._toTabStripItem(sSelectedItemId);
				if (oTabStripSelectedItem) {
					// use aria prefixes as those properties can be used outside RenderManager.writeAccessabilityState method
					mAccAttributes["aria-labelledby"] = oTabStripSelectedItem.getId();
				}
			}
			return mAccAttributes;
		};

		/**
		 * Returns the DOM ID of the content element.
		 *
		 * @param {sap.ui.core.Control} oControl The <code>TabContainer</code> for which the DOM ID is looking for
		 * @returns {string} The ID of the DOM element, corresponding to the tab content
		 */
		TabContainerRenderer.getContentDomId = function(oControl) {
			return oControl.getId() + "-content";
		};

		return TabContainerRenderer;

}, /* bExport= */ true);
