/*!
 * ${copyright}
 */

sap.ui.define(['./library'],
	function (library) {
		"use strict";

		/**
		 * AlignedFlowLayout renderer.
		 * @namespace
		 */
		var AlignedFlowLayoutRenderer = {};

		/**
		 * CSS class to be applied to the HTML root element of the control.
		 *
		 * @readonly
		 * @const {string}
		 */
		AlignedFlowLayoutRenderer.CSS_CLASS = "sapUiAFLayout";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		AlignedFlowLayoutRenderer.render = function (oRm, oControl) {
			var aContent = oControl.getContent();

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass(AlignedFlowLayoutRenderer.CSS_CLASS);

			if (aContent.length === 0) {
				oRm.addClass(AlignedFlowLayoutRenderer.CSS_CLASS + "NoContent");
			}

			oRm.writeClasses();
			oRm.write(">");

			this.renderItems(oRm, oControl, aContent);
			this.renderEndItem(oRm, oControl);
			this.renderSpacers(oRm, oControl);

			oRm.write("</div>");
		};

		/**
		 * Renders the items, using the provided {@link sap.ui.core.RenderManager}.
		 * Can be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 * @param {sap.ui.core.Control[]} [aContent=oControl.getContent()] The content to be rendered
		 */
		AlignedFlowLayoutRenderer.renderItems = function(oRm, oControl, aContent) {
			aContent = aContent || oControl.getContent();

			for (var i = 0; i < aContent.length; i++) {
				this.renderItem(oRm, oControl, aContent[i]);
			}
		};

		/**
		 * Renders an item, using the provided {@link sap.ui.core.RenderManager}.
		 * Can be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 * @param {sap.ui.core.Control} oContent The content to be rendered inside the item
		 */
		AlignedFlowLayoutRenderer.renderItem = function(oRm, oControl, oContent) {
			oRm.write("<div");
			oRm.addClass(AlignedFlowLayoutRenderer.CSS_CLASS + "Item");
			oRm.addStyle("flex-basis", oControl.getMinItemWidth());
			oRm.addStyle("max-width", oControl.getMaxItemWidth());
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			oRm.renderControl(oContent);
			oRm.write("</div>");
		};

		/**
		 * Renders the last item, using the provided {@link sap.ui.core.RenderManager}.
		 * Can be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 * @param {sap.ui.core.Control[]} [aEndContent=oControl.getEndContent()] The content to be rendered inside the last item
		 */
		AlignedFlowLayoutRenderer.renderEndItem = function(oRm, oControl, aEndContent) {
			aEndContent = aEndContent || oControl.getEndContent();

			if (aEndContent.length) {
				oRm.write("<div");
				oRm.writeAttribute("id", oControl.getId() + "-endItem");
				oRm.addClass(AlignedFlowLayoutRenderer.CSS_CLASS + "End");

				// if the end item is the only child, do not change the initial main size of a flex item
				if (oControl.getContent().length) {
					oRm.addStyle("flex-basis", oControl.getMinItemWidth());
				}

				oRm.addStyle("max-width", oControl.getMaxItemWidth());
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write(">");

				for (var i = 0; i < aEndContent.length; i++) {
					this.renderEndContent(oRm, oControl, aEndContent[i]);
				}

				oRm.write("</div>");
			}
		};

		/**
		 * Renders the content of the last item, using the provided {@link sap.ui.core.RenderManager}.
		 * Can be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 * @param {sap.ui.core.Control} oContent The content to be rendered inside the last item
		 */
		AlignedFlowLayoutRenderer.renderEndContent = function(oRm, oControl, oContent) {
			oRm.renderControl(oContent);
		};

		/**
		 * Renders the invisible items, using the provided {@link sap.ui.core.RenderManager}.
		 * Can be overwritten by subclasses.
		 *
		 * now do the trickful - some invisible elements...
		 * add elements to make sure the last row is "full" (has at least as many elements as the first row)
		 * - this ensures these items are not wider than the items above
		 * the highest number of elements are needed when there is just one visible element wrapped to the second row;
		 * first row has then one element less than there are children
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		AlignedFlowLayoutRenderer.renderSpacers = function(oRm, oControl) {
			var iSpacers = oControl.getNumberOfSpacers(),
				sMinItemWidth = oControl.getMinItemWidth(),
				sMaxItemWidth = oControl.getMaxItemWidth(),
				CSS_CLASS = AlignedFlowLayoutRenderer.CSS_CLASS;

			for (var i = 0; i < iSpacers; i++) {
				oRm.write("<div");

				if (i === (iSpacers - 1)) {
					oRm.writeAttribute("id", oControl.getId() + "-last");
				}

				oRm.addClass(CSS_CLASS + "Item");
				oRm.addClass(CSS_CLASS + "Spacer");
				oRm.addStyle("flex-basis", sMinItemWidth);
				oRm.addStyle("max-width", sMaxItemWidth);
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write("></div>");
			}
		};

		return AlignedFlowLayoutRenderer;
	}, /* bExport= */ true);
