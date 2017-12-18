/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.MessagePage
sap.ui.define(['sap/ui/core/library'],
		function(coreLibrary) {
			"use strict";


			var TextDirection = coreLibrary.TextDirection;
			/**
			 * MessagePage renderer.
			 * @namespace
			 */
			var MessagePageRenderer = {};

			/**
			 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
			 *
			 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
			 * @param {sap.ui.core.Control} oMessagePage an object representation of the control that should be rendered
			 * @returns {sap.m.MessagePageRenderer} this instance for chaining
			 */
			MessagePageRenderer.render = function(oRm, oMessagePage) {
				this.startOpeningDiv(oRm, oMessagePage);

				this.renderHeader(oRm, oMessagePage);

				this.startInnerDivs(oRm);
				this.renderContent(oRm, oMessagePage);
				this.endInnerDivs(oRm);

				this.endOpeningDiv(oRm);
			};

			MessagePageRenderer.startOpeningDiv = function(oRm, oMessagePage) {
				oRm.write("<div");
				oRm.writeControlData(oMessagePage);
				oRm.addClass("sapMMessagePage");
				oRm.writeClasses();

				if (oMessagePage.getTextDirection() != TextDirection.Inherit) {
					oRm.writeAttribute("dir", oMessagePage.getTextDirection().toLowerCase());
				}

				oRm.write(">");
			};

			MessagePageRenderer.renderHeader = function(oRm, oMessagePage) {
				if (oMessagePage.getShowHeader()) {
					oRm.renderControl(oMessagePage.getAggregation("_internalHeader"));
				}
			};

			MessagePageRenderer.startInnerDivs = function(oRm) {
				oRm.write("<div");
				oRm.addClass("sapMMessagePageInner");
				oRm.writeClasses();
				oRm.write(">");

				oRm.write("<div");
				oRm.addClass("sapMMessagePageContentWrapper");
				oRm.writeClasses();
				oRm.write(">");
			};

			MessagePageRenderer.renderContent = function(oRm, oMessagePage) {
				if (oMessagePage.getIcon()) {
					oRm.renderControl(oMessagePage._getIconControl());
				}

				oRm.renderControl(oMessagePage._getText().addStyleClass("sapMMessagePageMainText"));
				oRm.renderControl(oMessagePage._getDescription().addStyleClass("sapMMessagePageDescription"));

				this.renderButtons(oRm, oMessagePage);
			};

			MessagePageRenderer.renderButtons = function(oRm, oMessagePage) {
				var aButtons = oMessagePage.getButtons();

				if (aButtons.length > 0) {
					oRm.write("<div");
					oRm.addClass("sapMMessagePageButtonsWrapper");
					oRm.writeClasses();
					oRm.write(">");

					for (var i = 0; i < aButtons.length; i++) {
						oRm.renderControl(aButtons[i]);
					}

					oRm.write("</div>");
				}
			};

			MessagePageRenderer.endInnerDivs = function(oRm) {
				oRm.write("</div>");
				oRm.write("</div>");
			};

			MessagePageRenderer.endOpeningDiv = function(oRm) {
				oRm.write("</div>");
			};

			return MessagePageRenderer;

		}, /* bExport= */ true);
