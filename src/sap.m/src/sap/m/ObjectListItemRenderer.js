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
		ObjectListItemRenderer.apiVersion = 2;

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

			rm.openStart("div"); // Start attribute row container
			rm.class("sapMObjLAttrRow");
			rm.openEnd();

			if (oAttribute && !oAttribute._isEmpty()) {
				rm.openStart("div");
				rm.class("sapMObjLAttrDiv");

				// Add padding to push attribute text down since it will be raised up due
				// to markers height
				if (oStatus && (!oStatus._isEmpty())) {
					if (oStatus instanceof Array) {
						rm.class("sapMObjAttrWithMarker");
					}
				}

				if (!oStatus || oStatus._isEmpty()) {
					rm.style("width", "100%");
				}
				rm.openEnd();
				rm.renderControl(oAttribute);
				rm.close("div");
			}

			if (oStatus && !oStatus._isEmpty()) {
				rm.openStart("div");
				rm.class("sapMObjLStatusDiv");

				// Object marker icons (flag, favorite) are passed as an array
				if (oStatus instanceof Array && oStatus.length > 0) {
					rm.class("sapMObjStatusMarker");
				}

				if (!oAttribute || oAttribute._isEmpty()) {
					rm.style("width", "100%");
				}
				rm.openEnd();
				if (oStatus instanceof Array) {
					while (oStatus.length > 0) {
						rm.renderControl(oStatus.shift());
					}
				} else {
					rm.renderControl(oStatus);
				}
				rm.close("div");
			}

			rm.close("div"); // Start attribute row container
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
			rm.class("sapMObjLItem");
			rm.class("sapMObjLListModeDiv");
		};

		ObjectListItemRenderer.renderLIContent = function(rm, oLI) {
			var oObjectNumberAggregation = oLI.getAggregation("_objectNumber"),
				sTitleDir = oLI.getTitleTextDirection(),
				sIntroDir = oLI.getIntroTextDirection();

			// Introductory text at the top of the item, like "On behalf of Julie..."
			if (oLI.getIntro()) {
				rm.openStart("div", oLI.getId() + "-intro");
				rm.class("sapMObjLIntro");
				rm.openEnd();
				rm.openStart("span");
				//sets the dir attribute to "rtl" or "ltr" if a direction
				//for the intro text is provided explicitly
				if (sIntroDir !== TextDirection.Inherit) {
					rm.attr("dir", sIntroDir.toLowerCase());
				}
				rm.openEnd();
				rm.text(oLI.getIntro());
				rm.close("span");
				rm.close("div");
			}


			// Container for fields placed on the top half of the item, below the intro. This
			// includes title, number, and number units.
			rm.openStart("div"); // Start Top row container
			rm.class("sapMObjLTopRow");

			rm.openEnd();

			if (!!oLI.getIcon()) {
				rm.openStart("div");
				rm.class("sapMObjLIconDiv");

				rm.openEnd();
				rm.renderControl(oLI._getImageControl());
				rm.close("div");
			}

			// Container for a number and a units qualifier.
			rm.openStart("div"); // Start Number/units container
			rm.class("sapMObjLNumberDiv");

			rm.openEnd();

			if (oObjectNumberAggregation && oObjectNumberAggregation.getNumber()) {
				oObjectNumberAggregation.setTextDirection(oLI.getNumberTextDirection());
				rm.renderControl(oObjectNumberAggregation);
			}

			rm.close("div"); // End Number/units container

			// Title container displayed to the left of the number and number units container.
			rm.openStart("div"); // Start Title container
			rm.style("display", "-webkit-box");
			rm.style("overflow", "hidden");
			rm.openEnd();
			var oTitleText = oLI._getTitleText();
			if (oTitleText) {
				//sets the text direction of the title,
				//by delegating the RTL support to sap.m.Text
				oTitleText.setTextDirection(sTitleDir);
				oTitleText.setText(oLI.getTitle());
				oTitleText.addStyleClass("sapMObjLTitle");
				rm.renderControl(oTitleText);
			}

			rm.close("div"); // End Title container

			rm.close("div"); // End Top row container

			rm.openStart("div");
			rm.style("clear", "both;");
			rm.openEnd();
			rm.close("div");

			// Bottom row container.
			if (oLI._hasBottomContent()) {
				rm.openStart("div"); // Start Bottom row container
				rm.class("sapMObjLBottomRow");
				rm.openEnd();

				var aAttribs = oLI._getVisibleAttributes();
				var statuses = [];
				var markers = oLI._getVisibleMarkers();

				markers._isEmpty = function() {
					return !(markers.length);
				};

				if (!markers._isEmpty()) {// add markers only if the array is not empty, otherwise it brakes the layout BCP: 1670363254
					statuses.push(markers);
				}

				statuses.push(oLI.getFirstStatus());
				statuses.push(oLI.getSecondStatus());

				while (aAttribs.length > 0) {
					this.renderAttributeStatus(rm, oLI, aAttribs.shift(), statuses.shift());
				}

				while (statuses.length > 0) {
					this.renderAttributeStatus(rm, oLI, null, statuses.shift());
				}

				rm.close("div"); // End Bottom row container
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
