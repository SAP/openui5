/*!
 * ${copyright}
 */

sap.ui.define(['./ListItemBaseRenderer', 'sap/ui/core/Renderer', 'sap/ui/core/library', 'sap/ui/Device'],
	function(ListItemBaseRenderer, Renderer, coreLibrary, Device) {
		"use strict";


		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;


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
		 * @param {sap.m.ObjectAttribute[]}
		 *            aAttributes Attributes to be rendered
		 * @param {sap.m.ObjectStatus[]}
		 *            aStatuses Statuses to be rendered
		 */
		ObjectListItemRenderer.renderAttributesStatuses = function(rm, oLI, aAttributes, aStatuses) {
			var i;
			rm.write("<div"); // Start attribute row container
			rm.addClass("sapMObjLAttrRow");
			rm.writeClasses();
			rm.write(">");

			rm.write("<div"); // Start render attribute
			rm.addClass("sapMObjLAttrDiv");
			rm.writeClasses();
			rm.write(">");
			for (i = 0; i < aAttributes.length; i++) {
				rm.renderControl(aAttributes[i]);
			}
			rm.write("</div>"); // End render attribute

			rm.write("<div"); // Start render status
			rm.addClass("sapMObjLStatusDiv");
			rm.writeClasses();
			rm.write(">");
			for (i = 0; i < aStatuses.length; i++) {
				if (aStatuses[i] instanceof Array) {
					while (aStatuses[i].length > 0) {
						rm.renderControl(aStatuses[i].shift());
					}
				} else {
					rm.renderControl(aStatuses[i]);
				}
			}
			rm.write("</div>"); // End render status

			rm.write("</div>"); // End attribute row container
		};

		/**
		 * Renders the HTML for the given control, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the
		 *          Render-Output-Buffer
		 * @param {sap.ui.core.Control} oLI An object representation of the control that should be
		 *          rendered
		 */
		ObjectListItemRenderer.renderLIAttributes = function(rm, oLI) {
			rm.addClass("sapMObjLItem");
			rm.addClass("sapMObjLListModeDiv");
		};

		ObjectListItemRenderer.renderLIContent = function(rm, oLI) {
			var oObjectNumberAggregation = oLI.getAggregation("_objectNumber"),
				sTitleDir = oLI.getTitleTextDirection(),
				sIntroDir = oLI.getIntroTextDirection();

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
				if (sIntroDir !== TextDirection.Inherit) {
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

			if (oObjectNumberAggregation && oObjectNumberAggregation.getNumber()) {
				oObjectNumberAggregation.setTextDirection(oLI.getNumberTextDirection());
				rm.renderControl(oObjectNumberAggregation);
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

			rm.write("<div style=\"clear: both;\"></div>");

			// Bottom row container.
			if (oLI._hasBottomContent()) {
				rm.write("<div"); // Start Bottom row container
				rm.addClass("sapMObjLBottomRow");
				rm.writeClasses();
				rm.write(">");

				var aAttribs = oLI.getAttributes();
				var statuses = [];
				var markers = oLI.getMarkers();

				markers._isEmpty = function() {
					return !(markers.length);
				};

				if (!markers._isEmpty()) {// add markers only if the array is not empty, otherwise it brakes the layout BCP: 1670363254
					statuses.push(markers);
				}

				oLI.getFirstStatus() && statuses.push(oLI.getFirstStatus());
				oLI.getSecondStatus() && statuses.push(oLI.getSecondStatus());

				this.renderAttributesStatuses(rm, oLI, aAttribs, statuses);

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
			var aLabelledByIds = [],
				oFirstStatus = oLI.getFirstStatus(),
				oSecondStatus = oLI.getSecondStatus();

			if (oLI.getIntro()) {
				aLabelledByIds.push(oLI.getId() + "-intro");
			}

			if (oLI.getTitle()) {
				aLabelledByIds.push(oLI.getId() + "-titleText");
			}

			if (oLI.getNumber()) {
				aLabelledByIds.push(oLI.getId() + "-ObjectNumber");
			}

			if (oLI.getAttributes()) {
				oLI.getAttributes().forEach(function(attribute) {
					if (!attribute._isEmpty()) {
						aLabelledByIds.push(attribute.getId());
					}
				});
			}

			if (oFirstStatus && !oFirstStatus._isEmpty()) {
				aLabelledByIds.push(oFirstStatus.getId());
			}

			if (oSecondStatus && !oSecondStatus._isEmpty()) {
				aLabelledByIds.push(oSecondStatus.getId());
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
