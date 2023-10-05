/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseContentRenderer",
	"sap/ui/core/IconPool",
	"sap/ui/core/InvisibleText",
	"sap/ui/unified/library",
	"sap/ui/unified/CalendarLegendRenderer",
	"sap/ui/core/Lib"
],
	function(
		BaseContentRenderer,
		IconPool,
		InvisibleText,
		unifiedLibrary,
		CalendarLegendRenderer,
		Lib
	) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;

	/**
	 * CalendarContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var CalendarContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.CalendarContentRenderer", {
		apiVersion: 2
	});

	/**
	 * @override
	 */
	CalendarContentRenderer.renderContent = function(oRm, oCalendarContent) {
		var oRB = Lib.getResourceBundleFor("sap.ui.integration"),
			sId = oCalendarContent.getId();

		oRm.openStart("div", sId + "card-group");
		oRm.attr("role", "group");
		oRm.attr("aria-label", oRB.getText("CARDS_CALENDAR"));
		oRm.class("sapFCalCard");
		oRm.openEnd();

		oRm.openStart("div", sId + "card-layout");
		oRm.class("sapFCalCardLayout");
		oRm.openEnd();

		oRm.openStart("div", sId + "left-side");
		oRm.class("sapFCalCardLeftSide");
		oRm.openEnd();
		oRm.renderControl(oCalendarContent._oCalendar);

		oRm.openStart("div", sId + "card-legend");
		oRm.attr("aria-label", oRB.getText("CARDS_CALENDAR_LEGEND"));
		oRm.openEnd();
		oRm.renderControl(oCalendarContent._oLegend);
		oRm.close("div"); // card-legend

		oRm.openStart("div", "card-line-separator");
		oRm.class("sapFCalCardLineSeparator");
		oRm.openEnd();
		oRm.close("div");

		oRm.close("div"); // left-side

		oRm.openStart("div", sId + "right-side");
		oRm.class("sapFCalCardRightSide");
		oRm.openEnd();
		CalendarContentRenderer.renderAppointments(oRm, oCalendarContent);
		if (oCalendarContent._bNeedForMoreButton()) {
			oRm.renderControl(oCalendarContent._getMoreButton());
		}
		oRm.close("div"); // right-side

		oRm.close("div"); // card-layout

		oRm.close("div"); // card-group
	};

	CalendarContentRenderer.renderAppointments = function(oRm, oCalendarContent) {
		var aVisibleAppointments = oCalendarContent._getVisibleAppointments(),
			oCurrentAppointment = oCalendarContent._getCurrentAppointment(),
			oRB = Lib.getResourceBundleFor("sap.ui.integration");

		oRm.openStart("div", oCalendarContent.getId() + "appointments-list");
		oRm.attr("role", "list");
		oRm.attr("aria-label", oRB.getText("CARDS_CALENDAR_APPOINTMENTS"));
		oRm.class("sapFCalCardAppList");
		oRm.openEnd();

		if (!aVisibleAppointments.length) {
			oRm.openStart("div");
			oRm.class("sapFCalCardNoItemsText");
			oRm.openEnd();
			oRm.text(oCalendarContent.getNoAppointmentsText());
			oRm.close("div");
		}

		aVisibleAppointments.forEach(function(oAppointment) {
			CalendarContentRenderer.renderAppointment(
				oRm,
				oCalendarContent,
				oAppointment,
				oCurrentAppointment == oAppointment
			);
		});

		oRm.close("div"); // appointments-list
	};

	CalendarContentRenderer.renderAppointment = function(oRm, oCalendarContent, oAppointment, bIsCurrent) {
		var oSelectedDate = oCalendarContent._oCalendar.getSelectedDates()[0].getStartDate();

		oRm.openStart("div");
		oRm.attr("role", "listitem");
		oRm.class("sapUiCalendarAppContainer");
		if (bIsCurrent) {
			oRm.class("sapUiCalendarAppCurrent");
		}
		oRm.openEnd();
		oRm.openStart("div");
		oRm.class("sapUiCalendarAppContainerLeft");
		oRm.openEnd();
		oRm.openStart("div");
		oRm.class("sapUiCalendarAppStart");
		oRm.openEnd();
		oRm.text(oAppointment._getDateRangeIntersectionText(oSelectedDate).start);
		oRm.close("div");
		oRm.openStart("div");
		oRm.class("sapUiCalendarAppEnd");
		oRm.openEnd();
		oRm.text(oAppointment._getDateRangeIntersectionText(oSelectedDate).end);
		oRm.close("div");
		oRm.close("div");
		oRm.openStart("div");
		oRm.class("sapUiCalendarAppContainerRight");
		oRm.openEnd();

		this._renderAppointment(oRm, oCalendarContent, oAppointment, oSelectedDate);

		oRm.close("div");

		CalendarContentRenderer.renderAdditionalAriaLabel(oRm, oCalendarContent, oAppointment);

		oRm.close("div");
	};

	CalendarContentRenderer._renderAppointment = function(oRm, oCalendarContent, oAppointment, oSelectedDate) {
		var sId = oAppointment.getId();
		var sTitle = oAppointment.getTitle();
		var sText = oAppointment.getText();
		var sType = oAppointment.getType();
		var sIcon = oAppointment.getIcon();
		var bSingleLine = !sTitle || !sText;

		oRm.openStart("div", oAppointment);
		oRm.class("sapUiCalendarApp");
		if (oAppointment.getClickable()) {
			oRm.attr("tabindex", "0");
		} else {
			oRm.class("sapUiCalendarAppDisabled");
		}
		oRm.accessibilityState(oAppointment, CalendarContentRenderer.getAccProps(oAppointment));

		if (sType && sType != CalendarDayType.None) {
			oRm.class("sapUiCalendarApp" + sType);
		}

		// add a class used to center vertically
		// the single line text and the icon
		if (bSingleLine) {
			oRm.class("sapUiCalendarAppOneLine");
		}

		oRm.openEnd(); //div element

		// extra content DIV to make some styling possible
		oRm.openStart("div");
		oRm.class("sapUiCalendarAppCont");

		oRm.openEnd(); // div element

		if (sIcon) {
			var aClasses = ["sapUiCalendarAppIcon"];
			var mAttributes = {};

			mAttributes["id"] = sId + "-Icon";
			mAttributes["title"] = null;
			mAttributes["role"] = "img";
			oRm.icon(sIcon, aClasses, mAttributes);
		}

		oRm.openStart("div");
		oRm.class("sapUiCalendarAppTitleWrapper");
		oRm.openEnd();

		if (sTitle) {
			oRm.openStart("span", sId + "-Title");
			oRm.class("sapUiCalendarAppTitle");
			oRm.openEnd(); // span element
			oRm.text(sTitle);
			oRm.close("span");
		}

		if (sText) {
			oRm.openStart("span", sId + "-Text");
			oRm.class("sapUiCalendarAppText");
			oRm.openEnd(); // span element
			oRm.text(sText);
			oRm.close("span");
		}

		oRm.close("div");

		oRm.close("div");

		oRm.close("div");
	};

	// renders an invisible text containing info about the start
	// & end of the appointment. also for the type of the appointment
	// and how it links to the types in displayed calendar legend
	CalendarContentRenderer.renderAdditionalAriaLabel = function(oRm, oCalendarContent, oAppointment) {
		var oRb = Lib.getResourceBundleFor("sap.ui.unified"),
			oFormatAria = oCalendarContent._oFormatAria,
			sType = oAppointment.getType(),
			aLegendItems = oCalendarContent._oLegend ? oCalendarContent._oLegend.getAppointmentItems() : [];

		// ARIA information about start and end
		var sAriaText = oRb.getText("CALENDAR_START_TIME") + ": " + oFormatAria.format(oAppointment.getStartDate());
		sAriaText = sAriaText + "; " + oRb.getText("CALENDAR_END_TIME") + ": " + oFormatAria.format(oAppointment.getEndDate());

		if (sType && sType != CalendarDayType.None) {
			sAriaText = sAriaText + "; " + this.getAriaTextForType(sType, aLegendItems);
		}

		oRm.openStart("span", oAppointment.getId() + "-Descr");
		oRm.class("sapUiInvisibleText");
		oRm.openEnd();
		oRm.text(sAriaText);
		oRm.close("span");
	};

	CalendarContentRenderer.getAriaTextForType = function(sType, aLegendItems) {
		// as legend must not be rendered add text of type
		var sTypeLabelText,
			oStaticLabel,
			oItem, i;

		if (aLegendItems && aLegendItems.length) {
			for (var i = 0; i < aLegendItems.length; i++) {
				oItem = aLegendItems[i];
				if (oItem.getType() === sType) {
					sTypeLabelText = oItem.getText();
					break;
				}
			}
		}

		if (!sTypeLabelText) {
			//use static invisible labels - "Type 1", "Type 2"
			oStaticLabel = CalendarLegendRenderer.getTypeAriaText(sType);
			if (oStaticLabel) {
				sTypeLabelText = oStaticLabel.getText();
			}
		}
		return sTypeLabelText;
	};

	CalendarContentRenderer.getAccProps = function(oAppointment) {
		var sId = oAppointment.getId();
		var mAccProps = {
			labelledby: {
				value: InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT") + " " + sId + "-Descr",
				append: true
			},
			selected: null
		};

		if (oAppointment.getTitle()) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Title";
		}

		if (oAppointment.getText()) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Text";
		}

		if (oAppointment.getSelected()) {
			mAccProps["labelledby"].value = mAccProps["labelledby"].value + " "
				+ InvisibleText.getStaticId("sap.ui.unified", "APPOINTMENT_SELECTED");
		}

		return mAccProps;
	};

	return CalendarContentRenderer;
});
