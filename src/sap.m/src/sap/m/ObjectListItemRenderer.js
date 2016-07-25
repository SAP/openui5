/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './ListItemBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListItemBaseRenderer, Renderer) {
		"use strict";


		/**
		 * ObjectListItem renderer.
		 * @namespace
		 */
		var ObjectListItemRenderer = Renderer.extend(ListItemBaseRenderer);

		/**
		 * Renders the HTML for single line of Attribute and Status.
		 *
		 * @param {sap.ui.core.RenderManager}
		 *            rm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.ObjectListItem}
		 *            oLI An object to be rendered
		 * @param {sap.m.ObjectAttribute}
		 *            oAttribute An attribute to be rendered
		 * @param {sap.m.ObjectStatus}
		 *            oStatus A status to be rendered
		 */
		ObjectListItemRenderer.renderAttributeStatus = function(rm, oLI, oAttribute, oStatus) {

			if (!oAttribute && !oStatus || (oAttribute && oAttribute._isEmpty() && oStatus && oStatus._isEmpty())) {
				return; // nothing to render
			}

			rm.write("<div"); // Start attribute row container
			rm.addClass("sapMObjLAttrRow");
			rm.writeClasses();
			rm.write(">");

			if (oAttribute && !oAttribute._isEmpty()) {
				rm.write("<div");
				rm.addClass("sapMObjLAttrDiv");

				// Add padding to push attribute text down since it will be raised up due
				// to markers height
				if (oStatus && (!oStatus._isEmpty())) {
					if (oStatus instanceof Array) {
						rm.addClass("sapMObjAttrWithMarker");
					}
				}

				rm.writeClasses();

				if (!oStatus || oStatus._isEmpty()) {
					rm.addStyle("width", "100%");
					rm.writeStyles();
				}
				rm.write(">");
				rm.renderControl(oAttribute);
				rm.write("</div>");
			}

			if (oStatus && !oStatus._isEmpty()) {
				rm.write("<div");
				rm.addClass("sapMObjLStatusDiv");

				// Object marker icons (flag, favorite) are passed as an array
				if (oStatus instanceof Array && oStatus.length > 0) {
					rm.addClass("sapMObjStatusMarker");
				}
				rm.writeClasses();
				if (!oAttribute || oAttribute._isEmpty()) {
					rm.addStyle("width", "100%");
					rm.writeStyles();
				}
				rm.write(">");
				if (oStatus instanceof Array) {
					while (oStatus.length > 0) {
						rm.renderControl(oStatus.shift());
					}
				} else {
					rm.renderControl(oStatus);
				}
				rm.write("</div>");
			}

			rm.write("</div>"); // Start attribute row container
		};

		/**
		 * Renders the HTML for the given control, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager}
		 *          oRenderManager The RenderManager that can be used for writing to the
		 *          Render-Output-Buffer
		 * @param {sap.ui.core.Control}
		 *          oControl An object representation of the control that should be
		 *          rendered
		 */
		ObjectListItemRenderer.renderLIAttributes = function(rm, oLI) {
			rm.addClass("sapMObjLItem");
			rm.addClass("sapMObjLListModeDiv");
		};

		ObjectListItemRenderer.renderLIContent = function(rm, oLI) {
			var sTitleDir = oLI.getTitleTextDirection(),
				sIntroDir = oLI.getIntroTextDirection(),
				sNumberDir = oLI.getNumberTextDirection();

			// Introductory text at the top of the item, like "On behalf of Julie..."
			if (oLI.getIntro()) {
				rm.write("<div");
				rm.addClass("sapMObjLIntro");
				rm.writeClasses();
				rm.writeAttribute("id", oLI.getId() + "-intro");
				rm.write(">");
				rm.write("<span");
				//sets the dir attribute to "rtl" or "ltr" if a direction
				//for the intro text is provided explicitly
				if (sIntroDir !== sap.ui.core.TextDirection.Inherit) {
					rm.writeAttribute("dir", sIntroDir.toLowerCase());
				}
				rm.write(">");
				rm.writeEscaped(oLI.getIntro());
				rm.write("</span>");
				rm.write("</div>");
			}


			// Container for fields placed on the top half of the item, below the intro. This
			// includes title, number, and number units.
			rm.write("<div"); // Start Top row container
			rm.addClass("sapMObjLTopRow");
			rm.writeClasses();
			rm.write(">");

			if (!!oLI.getIcon()) {
				rm.write("<div");
				rm.addClass("sapMObjLIconDiv");
				rm.writeClasses();
				rm.write(">");
				rm.renderControl(oLI._getImageControl());
				rm.write("</div>");
			}

			// Container for a number and a units qualifier.
			rm.write("<div"); // Start Number/units container
			rm.addClass("sapMObjLNumberDiv");
			rm.writeClasses();
			rm.write(">");

			if (oLI.getNumber()) {
				rm.write("<div");
				rm.writeAttribute("id", oLI.getId() + "-number");
				rm.addClass("sapMObjLNumber");
				rm.addClass("sapMObjLNumberState" + oLI.getNumberState());
				rm.writeClasses();
				//sets the dir attribute to "rtl" or "ltr" if a direction
				//for the number text is provided explicitly
				if (sNumberDir !== sap.ui.core.TextDirection.Inherit) {
					rm.writeAttribute("dir", sNumberDir.toLowerCase());
				}
				rm.write(">");
				rm.writeEscaped(oLI.getNumber());
				rm.write("</div>");

				if (oLI.getNumberUnit()) {
					rm.write("<div");
					rm.writeAttribute("id", oLI.getId() + "-numberUnit");
					rm.addClass("sapMObjLNumberUnit");
					rm.addClass("sapMObjLNumberState" + oLI.getNumberState());
					rm.writeClasses();
					rm.write(">");
					rm.writeEscaped(oLI.getNumberUnit());
					rm.write("</div>");
				}
			}

			rm.write("</div>"); // End Number/units container

			// Title container displayed to the left of the number and number units container.
			rm.write("<div"); // Start Title container
			rm.addStyle("display","-webkit-box");
			rm.addStyle("overflow","hidden");
			rm.writeStyles();
			rm.write(">");
			var oTitleText = oLI._getTitleText();
			if (oTitleText) {
				//sets the text direction of the title,
				//by delegating the RTL support to sap.m.Text
				oTitleText.setTextDirection(sTitleDir);
				oTitleText.setText(oLI.getTitle());
				oTitleText.addStyleClass("sapMObjLTitle");
				rm.renderControl(oTitleText);
			}

			rm.write("</div>"); // End Title container

			rm.write("</div>"); // End Top row container

			if (!(sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 10)) {
				rm.write("<div style=\"clear: both;\"></div>");
			}

			// Bottom row container.
			if (oLI._hasBottomContent()) {
				rm.write("<div"); // Start Bottom row container
				rm.addClass("sapMObjLBottomRow");
				rm.writeClasses();
				rm.write(">");

				var aAttribs = oLI._getVisibleAttributes();
				var statuses = [];
				var markers = oLI._getVisibleMarkers();

				markers._isEmpty = function() {
					return !(markers.length);
				};

				statuses.push(markers);
				statuses.push(oLI.getFirstStatus());
				statuses.push(oLI.getSecondStatus());

				while (aAttribs.length > 0) {
					this.renderAttributeStatus(rm, oLI, aAttribs.shift(), statuses.shift());
				}

				while (statuses.length > 0) {
					this.renderAttributeStatus(rm, oLI, null, statuses.shift());
				}

				rm.write("</div>"); // End Bottom row container
			}
		};

		/**
		 * Gets ObjectListItem`s inner nodes IDs, later used in aria labelledby attribute.
		 *
		 * @param {sap.m.ObjectListItem}
		 *			oLI An object representation of the control
		 * @returns {String} ObjectListItem`s inner nodes IDs
		 */
		ObjectListItemRenderer.getAriaLabelledBy = function(oLI) {
			var aLabelledByIds = [];

			if (oLI.getIntro()) {
				aLabelledByIds.push(oLI.getId() + "-intro");
			}

			if (oLI.getTitle()) {
				aLabelledByIds.push(oLI.getId() + "-titleText");
			}

			if (oLI.getNumber()) {
				aLabelledByIds.push(oLI.getId() + "-number");
			}

			if (oLI.getNumberUnit()) {
				aLabelledByIds.push(oLI.getId() + "-numberUnit");
			}

			if (oLI.getAttributes()) {
				oLI.getAttributes().forEach(function(attribute) {
					aLabelledByIds.push(attribute.getId());
				});
			}

			if (oLI.getFirstStatus()) {
				aLabelledByIds.push(oLI.getFirstStatus().getId());
			}

			if (oLI.getSecondStatus()) {
				aLabelledByIds.push(oLI.getSecondStatus().getId());
			}

			if (oLI.getMarkers()) {
				oLI.getMarkers().forEach(function(marker) {
					aLabelledByIds.push(marker.getId() + "-text");
				});
			}

			return aLabelledByIds.join(" ");
		};

		return ObjectListItemRenderer;

	}, /* bExport= */ true);
