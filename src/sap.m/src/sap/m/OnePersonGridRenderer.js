/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/date/UniversalDate', 'sap/ui/core/InvisibleText', 'sap/ui/unified/library'],
	function (UniversalDate, InvisibleText, unifiedLibrary) {
		"use strict";

		// shortcut for sap.ui.unified.CalendarDayType
		var CalendarDayType = unifiedLibrary.CalendarDayType;

		// shortcut for sap.ui.unified.CalendarAppointmentVisualization
		var CalendarAppointmentVisualization = unifiedLibrary.CalendarAppointmentVisualization;

		/**
		 * OnePersonGrid renderer.
		 * @namespace
		 */
		var OnePersonGridRenderer = {};


		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		OnePersonGridRenderer.render = function (oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapMOnePersonGrid");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_columnHeaders"));
			oRm.write("<div");
			oRm.addClass("sapMOnePersonGridContent");
			oRm.writeClasses();
			oRm.write(">");
			this.renderRowHeaders(oRm, oControl);
			this.renderColumns(oRm, oControl);
			this.renderNowMarker(oRm, oControl);
			oRm.write("</div>"); // END .sapMOnePersonGridContent
			oRm.write("</div>"); // END .sapMOnePersonGrid
		};

		OnePersonGridRenderer.renderRowHeaders = function (oRm, oControl) {
			var iStartHour = oControl._getVisibleStartHour(),
				iEndHour = oControl._getVisibleEndHour();

			oRm.write("<div");
			oRm.addClass("sapMOnePersonRowHeaders");
			oRm.writeClasses();
			oRm.write(">");

			for (var i = iStartHour; i <= iEndHour + 1; i++) {
				if (i > 24) {
					break;
				}

				oRm.write("<span");
				oRm.addClass("sapMOnePersonRowHeader");
				oRm.addClass("sapMOnePersonRowHeader" + i);

				if (oControl._shouldHideRowHeader(i)) {
					oRm.addClass("sapMOnePersonRowHeaderHidden");
				}

				oRm.writeClasses();
				oRm.write(">");
				oRm.write(i);
				oRm.write("</span>"); // END .sapMOnePersonRowHeader
			}

			oRm.write("</div>"); // END .sapMOnePersonRowHeaders
		};

		OnePersonGridRenderer.renderColumns = function (oRm, oControl) {
			var iColumns = oControl._getColumns(),
				oStartDate = oControl.getStartDate(),
				oAppointmentsToRender = oControl._getAppointmentsToRender();

			oRm.write("<div");
			oRm.addClass("sapMOnePersonColumns");
			oRm.writeClasses();
			oRm.write(">");

			for (var i = 0; i < iColumns; i++) {
				var oColumnDate = new UniversalDate(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + i),
					sDate = oControl._formatDayAsString(oColumnDate);

				oRm.write("<div");
				oRm.writeAttribute("data-sap-day", sDate);
				oRm.addClass("sapMOnePersonColumn");
				oRm.addClass("sapUiCalendarRowVisFilled"); // TODO: make appointments CSS more generic
				oRm.writeClasses();
				oRm.write(">");
				this.renderRows(oRm, oControl);
				this.renderAppointments(oRm, oControl, oAppointmentsToRender[sDate]);
				oRm.write("</div>"); // END .sapMOnePersonColumn
			}

			oRm.write("</div>"); // END .sapMOnePersonColumns
		};

		OnePersonGridRenderer.renderRows = function (oRm, oControl) {
			var iStartHour = oControl._getVisibleStartHour(),
				iEndHour = oControl._getVisibleEndHour();

			for (var i = iStartHour; i <= iEndHour; i++) {
				oRm.write("<div");
				oRm.addClass("sapMOnePersonRow");

				if (!oControl._isWorkingHour(i)) {
					oRm.addClass("sapMOnePersonNonWorkingRow");
				}
				oRm.writeAttribute("data-sap-hour", i);

				oRm.writeClasses();
				oRm.write(">");
				oRm.write("</div>"); // END .sapMOnePersonRow
			}
		};

		OnePersonGridRenderer.renderAppointments = function (oRm, oControl, oAppointmentsByDate) {
			var that = this;

			if (oAppointmentsByDate) {
				oRm.write("<div");
				oRm.addClass("sapMOnePersonAppointments");
				oRm.writeClasses();
				oRm.write(">");
				oAppointmentsByDate.oAppointmentsList.getIterator().forEach(function (oAppointmentNode) {
					var iMaxLevel = oAppointmentsByDate.iMaxLevel,
						iLevel = oAppointmentNode.level,
						iWidth = oAppointmentNode.width,
						oAppointment = oAppointmentNode.getData();

					that.renderAppointment(oRm, oControl, iMaxLevel, iLevel, iWidth, oAppointment);
				});
				oRm.write("</div>");
			}
		};

		OnePersonGridRenderer.renderAppointment = function(oRm, oControl, iMaxLevel, iAppointmentLevel, iAppointmentWidth, oAppointment) {
			var iRowHeight = oControl._getRowHeight(),
				oAppStartDate = oAppointment.getStartDate(),
				oAppEndDate = oAppointment.getEndDate(),
				sTooltip = oAppointment.getTooltip_AsString(),
				sType = oAppointment.getType(),
				sColor = oAppointment.getColor(),
				sTitle = oAppointment.getTitle(),
				sText = oAppointment.getText(),
				sIcon = oAppointment.getIcon(),
				sId = oAppointment.getId(),
				mAccProps = {labelledby: {value: InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT") + " " + sId + "-Descr", append: true}},
				aAriaLabels = oControl.getAriaLabelledBy();

			if (aAriaLabels.length > 0) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + aAriaLabels.join(" ");
			}

			if (sTitle) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Title";
			}

			if (sText) {
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Text";
			}

			oRm.write("<div");
			oRm.writeElementData(oAppointment);
			oRm.addClass("sapUiCalendarApp");

			if (oAppointment.getSelected()) {
				oRm.addClass("sapUiCalendarAppSel");
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED");
			}

			if (oAppointment.getTentative()) {
				oRm.addClass("sapUiCalendarAppTent");
				mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_TENTATIVE");
			}

			if (!sText) {
				oRm.addClass("sapUiCalendarAppTitleOnly");
			}

			if (sIcon) {
				oRm.addClass("sapUiCalendarAppWithIcon");
			}

			// if (!bRelativePos) {
			// 	// write position
			// 	if (oRow._bRTL) {
			// 		oRm.addStyle("right", oAppointmentInfo.begin + "%");
			// 		oRm.addStyle("left", oAppointmentInfo.end + "%");
			// 	} else {
			// 		oRm.addStyle("left", oAppointmentInfo.begin + "%");
			// 		oRm.addStyle("right", oAppointmentInfo.end + "%");
			// 	}
			// }

			oRm.writeAttribute("data-sap-level", iAppointmentLevel);
			oRm.writeAttribute("data-sap-width", iAppointmentWidth);

			// This makes the appointment focusable
			// if (oRow._sFocusedAppointmentId == sId) {
			// 	oRm.writeAttribute("tabindex", "0");
			// } else {
			// 	oRm.writeAttribute("tabindex", "-1");
			// }

			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			if (!sColor && sType && sType != CalendarDayType.None) {
				oRm.addClass("sapUiCalendarApp" + sType);
			}

			// if (sColor) {
			// 	if (oRow._bRTL) {
			// 		oRm.addStyle("border-right-color", sColor);
			// 	} else {
			// 		oRm.addStyle("border-left-color", sColor);
			// 	}
			// }

			oRm.writeAccessibilityState(oAppointment, mAccProps);

			var iAppTop = oControl._calculateTopPosition(oAppStartDate);
			var iAppBottom = oControl._calculateTopPosition(oAppEndDate);

			var iChunkWidth = 100 / (iMaxLevel + 1);

			oRm.addStyle("top", iAppTop + "px");
			oRm.addStyle("height", Math.max(iRowHeight, iAppBottom - iAppTop) + "px");
			oRm.addStyle(sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left", iChunkWidth * iAppointmentLevel + "%");
			oRm.addStyle("width", iChunkWidth * iAppointmentWidth + "%"); // TODO: take into account the levels

			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">"); // div element

			// extra content DIV to make some styling possible
			oRm.write("<div");
			oRm.addClass("sapUiCalendarAppCont");

			if (sColor && oControl.getAppointmentsVisualization() === CalendarAppointmentVisualization.Filled) {
				oRm.addStyle("background-color", oAppointment._getCSSColorForBackground(sColor));
				oRm.writeStyles();
			}

			oRm.writeClasses();
			oRm.write(">"); // div element

			if (sIcon) {
				var aClasses = ["sapUiCalendarAppIcon"];
				var mAttributes = {};

				mAttributes["id"] = sId + "-Icon";
				mAttributes["title"] = null;
				oRm.writeIcon(sIcon, aClasses, mAttributes);
			}

			if (sTitle) {
				oRm.write("<span");
				oRm.writeAttribute("id", sId + "-Title");
				oRm.addClass("sapUiCalendarAppTitle");
				oRm.writeClasses();
				oRm.write(">"); // span element
				oRm.writeEscaped(sTitle, true);
				oRm.write("</span>");
			}

			if (sText) {
				oRm.write("<span");
				oRm.writeAttribute("id", sId + "-Text");
				oRm.addClass("sapUiCalendarAppText");
				oRm.writeClasses();
				oRm.write(">"); // span element
				oRm.writeEscaped(sText, true);
				oRm.write("</span>");
			}

			// ARIA information about start and end
			// var sAriaText = oRow._oRb.getText("CALENDAR_START_TIME") + ": " + oRow._oFormatAria.format(oAppointment.getStartDate());
			// sAriaText = sAriaText + "; " + oRow._oRb.getText("CALENDAR_END_TIME") + ": " + oRow._oFormatAria.format(oAppointment.getEndDate());
			// if (sTooltip) {
			// 	sAriaText = sAriaText + "; " + sTooltip;
			// }

			// if (sType && sType != CalendarDayType.None) {
			//
			// 	sAriaText = sAriaText + "; " + this.getAriaTextForType(sType, aTypes);
			// }

			// oRm.write("<span id=\"" + sId + "-Descr\" class=\"sapUiInvisibleText\">" + sAriaText + "</span>");

			oRm.write("</div>");

			// this.renderResizeHandle(oRm, oRow, oAppointment);

			oRm.write("</div>");
		};

		OnePersonGridRenderer.renderNowMarker = function (oRm, oControl) {
			var oDate = oControl._getUniversalCurrentDate();

			oRm.write("<span");
			oRm.writeAttribute("id", oControl.getId() + "-nowMarker");
			oRm.addStyle("top", oControl._calculateTopPosition(oDate) + "px");
			oRm.addClass("sapMOnePersonNowMarker");

			if (oControl._isOutsideVisibleHours(oDate.getHours())) {
				oRm.addClass("sapMOnePersonNowMarkerHidden");
			}

			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			oRm.write(oControl._formatTimeAsString(oDate));
			oRm.write("</span>"); // END .sapMOnePersonNowMarker
		};

		return OnePersonGridRenderer;

	}, true /* bExport */);
