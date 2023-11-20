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
			var MessagePageRenderer = {
				apiVersion: 2
			};

			/**
			 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
			 *
			 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
			 * @param {sap.m.MessagePage} oMessagePage an object representation of the control that should be rendered
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
				oRm.openStart("div", oMessagePage);
				oRm.attr("aria-roledescription", oMessagePage._sAriaRoleDescription);
				oRm.class("sapMMessagePage");

				if (oMessagePage.getTextDirection() !== TextDirection.Inherit) {
					oRm.attr("dir", oMessagePage.getTextDirection().toLowerCase());
				}

				oRm.openEnd();
			};

			MessagePageRenderer.renderHeader = function(oRm, oMessagePage) {
				if (oMessagePage.getShowHeader()) {
					oRm.renderControl(oMessagePage.getAggregation("_internalHeader"));
				}
			};

			MessagePageRenderer.startInnerDivs = function(oRm) {
				oRm.openStart("div");
				oRm.class("sapMMessagePageInner");
				oRm.openEnd();

				oRm.openStart("div");
				oRm.class("sapMMessagePageContentWrapper");
				oRm.openEnd();
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
					oRm.openStart("div");
					oRm.class("sapMMessagePageButtonsWrapper");
					oRm.openEnd();

					for (var i = 0; i < aButtons.length; i++) {
						oRm.renderControl(aButtons[i]);
					}

					oRm.close("div");
				}
			};

			MessagePageRenderer.endInnerDivs = function(oRm) {
				oRm.close("div");
				oRm.close("div");
			};

			MessagePageRenderer.endOpeningDiv = function(oRm) {
				oRm.close("div");
			};

			return MessagePageRenderer;

		}, /* bExport= */ true);
