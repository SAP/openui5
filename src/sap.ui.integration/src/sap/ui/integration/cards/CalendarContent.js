/*!
 * ${copyright}
 */
sap.ui.define([
	"./CalendarContentRenderer",
	"sap/ui/core/ResizeHandler",
	"sap/ui/integration/library",
	"sap/ui/integration/cards/BaseContent",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/f/cards/loading/CalendarPlaceholder",
	"sap/f/CalendarAppointmentInCard",
	"sap/f/CalendarInCard",
	"sap/f/PlanningCalendarInCardLegend",
	"sap/m/library",
	"sap/m/Button",
	"sap/m/FlexBox",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/unified/calendar/CalendarUtils",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/unified/CalendarLegendItem",
	"sap/ui/core/date/UI5Date",
	"sap/ui/unified/DateRange",
	"sap/ui/core/Core"
],
	function(CalendarContentRenderer, ResizeHandler, library, BaseContent, BindingHelper, BindingResolver, CalendarPlaceholder, CalendarAppointmentInCard, CalendarInCard, PlanningCalendarInCardLegend, mLibrary, Button, FlexBox, DateFormat, Locale, LocaleData, Filter, FilterOperator, CalendarDate, CalendarUtils, DateTypeRange, UniversalDate, CalendarLegendItem, UI5Date, DateRange, Core) {
		"use strict";

		var ActionArea = library.CardActionArea;

		/**
		 * Constructor for a new <code>CalendarContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * <b>Note:</b> It is recommended to use the <code>CalendarContent</code> with a min-width set to 18rem. This
		 * setting will make sure that the calendar is displayed properly and that the user has enough space to interact
		 * with the card.
		 *
		 * @extends sap.ui.integration.cards.BaseContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.74
		 * @alias sap.ui.integration.cards.CalendarContent
		 */
		var CalendarContent = BaseContent.extend("sap.ui.integration.cards.CalendarContent", {
			renderer: CalendarContentRenderer,
			metadata: {
				library: "sap.ui.integration",
				properties: {
					/**
					 * Defines the number of visible appointments.
					 */
					visibleAppointmentsCount : { type : "int", group : "Data", defaultValue: 2 },

					/**
					 * Defines the text that is displayed when no {@link sap.f.CalendarAppointmentInCard CalendarAppointmentInCard} are assigned.
					 */
					noAppointmentsText : {type : "string", group : "Misc", defaultValue : null}
				},
				aggregations: {
					/**
					 * Defines the appointments in the control.
					 */
					appointments: { type: "sap.f.CalendarAppointmentInCard", multiple: true, singularName: "appointment" }
				}
			}
		});

		/**
		 * Changes the calendar view to the specified month.
		 *
		 * @ui5-restricted
		 * @private
		 * @param {int} iMonth The selected month, which month the calendar should display.
		 */

		CalendarContent.prototype.changeMonth = function (iMonth) {
			var oCal = this._oCalendar,
				oSelectedDate = this._oCalendar.getSelectedDates()[0],
				iSelectedYear,
				oDateToFocus;

				iSelectedYear = oSelectedDate.getStartDate().getFullYear();
				oDateToFocus = new Date(iSelectedYear, iMonth, 1);

			oCal.focusDate(oDateToFocus);
			this.invalidate();
			// This stateChange is needed when data (such as appointments or special dates) needs to be updated without having a delay like fetching data.
			this.getCardInstance().scheduleFireStateChanged();
		};

		/**
		 * Changes the calendar date to the passed date.
		 *
		 * @ui5-restricted
		 * @private
		 * @param {Date} oDate The selected date, the month and year of which the calendar should display.
		 */
		CalendarContent.prototype.changeDate = function (oDate) {
			var oCardActions = this.getActions(),
				oDateRange = new DateRange(),
				oCal = this._oCalendar;

			oDateRange.setStartDate(oDate);
			oCal.destroySelectedDates();
			oCal.addAggregation('selectedDates', oDateRange);
			this._oFocusedDate = oCal.getSelectedDates()[0] ? oCal.getSelectedDates()[0] : null;

			this.changeMonth(oDate.getMonth());

			oCardActions.fireAction(this, "DateChange", {
				"selectedDate": oDate
			});
		};

		/**
		 * Creates the internal structure of the card.
		 * @private
		 */
		CalendarContent.prototype._createCardContent = function () {
			this._oCalendar = new CalendarInCard(this.getId() + "-navigation", {
				startDateChange: function (oEvent) {
					var oFocusedDate = oEvent.getSource()._getFocusedDate().toLocalJSDate();

					this._handleStartDateChange(oFocusedDate);
				}.bind(this),
				select: function (oEvent) {
					var oSelectedDate = oEvent.getSource().getSelectedDates()[0].getStartDate();

					this._setParameters(oEvent, oEvent.getParameter("startDate"));
					this._refreshVisibleAppointments(oSelectedDate);
					this.invalidate();

					this._handleSelect(oSelectedDate);
				}.bind(this)
			});
			this._oLegend = new PlanningCalendarInCardLegend(this.getId() + "-legend", {
				columnWidth: "7.5rem",
				standardItems: []
			});
			this._oCalendar.setLegend(this._oLegend);
			this._oContent = new FlexBox(this.getId() + "-wrapper", {
				items: [this._oCalendar, this._oLegend]
			});

			this.setAggregation("_content", this._oContent);

			this._oFormatAria = DateFormat.getDateTimeInstance({
				pattern: "EEEE dd/MM/YYYY 'at' " + _getLocaleData.call(this).getTimePattern("medium")
			});
		};

		CalendarContent.prototype.init = function () {
			this._aVisibleAppointments = [];

			BaseContent.prototype.init.apply(this, arguments);
			this._createCardContent();
		};

		CalendarContent.prototype.exit = function () {
			if (this._sTwoColumnsResizeListener) {
				ResizeHandler.deregister(this._sTwoColumnsResizeListener);
				this._sTwoColumnsResizeListener = undefined;
			}
			BaseContent.prototype.exit.apply(this, arguments);

			if (this._oAppointmentTemplate) {
				this._oAppointmentTemplate.destroy();
				this._oAppointmentTemplate = null;
			}

			if (this._oSpecialDateTemplate) {
				this._oSpecialDateTemplate.destroy();
				this._oSpecialDateTemplate = null;
			}

			if (this._oCalendarLegendItemTemplate) {
				this._oCalendarLegendItemTemplate.destroy();
				this._oCalendarLegendItemTemplate = null;
			}

			if (this._oAppointmentLegendItemTemplate) {
				this._oAppointmentLegendItemTemplate.destroy();
				this._oAppointmentLegendItemTemplate = null;
			}

			if (this._bDataInitiallyLoaded) {
				this._bDataInitiallyLoaded = null;
			}
		};

		CalendarContent.prototype.onDataChanged = function () {
			var oSelectedDate = this._oCalendar.getSelectedDates()[0] && this._oCalendar.getSelectedDates()[0].getStartDate();

			if (!oSelectedDate) {
				return;
			}

			if (!this._bDataInitiallyLoaded) {
				this._handleSelect(oSelectedDate);
				this._handleStartDateChange(oSelectedDate);
				this._bDataInitiallyLoaded = true;
			}

			this._setParameters();
			this._refreshVisibleAppointments(oSelectedDate);
			this.invalidate();
		};

		CalendarContent.prototype.onBeforeRendering = function () {
			BaseContent.prototype.onBeforeRendering.apply(this, arguments);

			var oInitiallySelectedDate = this._oCalendar.getSelectedDates().length ? this._oCalendar.getSelectedDates()[0].getStartDate() : this._oCalendar.getStartDate();

			this._setParameters();
			this._refreshVisibleAppointments(oInitiallySelectedDate);

			this.getModel("parameters").setProperty("/visibleItems", this._iVisibleItems);
			this.getModel("parameters").setProperty("/allItems", this._iAllItems);
		};

		CalendarContent.prototype.onAfterRendering = function () {
			BaseContent.prototype.onAfterRendering.call(this, arguments);
			if (!this._sTwoColumnsResizeListener) {
				this._sTwoColumnsResizeListener = ResizeHandler.register(this, this.resizeHandler);
				this.resizeHandler({
					control: this,
					target: this.getDomRef()
				});
			}
		};

		CalendarContent.prototype.resizeHandler = function (oEvent) {
			oEvent.control.toggleStyleClass("sapMPCInCardTwoColumns", oEvent.target.getBoundingClientRect().width > 576);
		};

		/**
		 * @override
		 */
		CalendarContent.prototype.createLoadingPlaceholder = function (oConfiguration) {
			var oCard = this.getCardInstance(),
				iContentMinItems = oCard.getContentMinItems(oConfiguration);

			return new CalendarPlaceholder({
				minItems: iContentMinItems !== null ? iContentMinItems : 2,
				maxLegendItems: oConfiguration.maxLegendItems ? parseInt(oConfiguration.maxLegendItems) : 2,
				item: oConfiguration.item ? oConfiguration.item.template : {},
				legendItem: oConfiguration.legendItem ? oConfiguration.legendItem.template : {}
			});
		};

		/**
		 * @override
		 */
		CalendarContent.prototype.applyConfiguration = function () {
			var oConfiguration = this.getParsedConfiguration();

			//workaround until actions refactor
			this.fireEvent("_actionContentReady"); // todo

			if (!oConfiguration) {
				return;
			}

			if (oConfiguration.item) {
				this._addItem(oConfiguration.item);
			}

			if (oConfiguration.specialDate) {
				this._addSpecialDate(oConfiguration.specialDate);
			}

			if (oConfiguration.legendItem) {
				this._addLegendItem(oConfiguration.legendItem);
			}

			if (oConfiguration.date) {
				this._addDate(oConfiguration.date);
			}

			if (oConfiguration.maxItems) {
				this._addMaxItems(oConfiguration.maxItems);
			}

			if (oConfiguration.maxLegendItems) {
				this._addMaxLegendItems(oConfiguration.maxLegendItems);
			}

			if (oConfiguration.noItemsText) {
				this._addNoItemsText(oConfiguration.noItemsText);
			}

			if (oConfiguration.moreItems && oConfiguration.moreItems.actions) {
				this._oActions.attach({
					area: ActionArea.Content,
					actions: oConfiguration.moreItems.actions,
					control: this._getMoreButton()
				});
			}
		};

		CalendarContent.prototype._getStaticConfigurationLegendItems = function (aLegendItems, aLegendAppointmentItems, oConfiguration, oLegend) {
			var aResolvedLegendItems = [];
			aLegendItems.forEach(function (oItem, i) {
				var aTemplateKeys = Object.keys(oConfiguration.legendItem.template),
					singleAssembledItem = {};

				aTemplateKeys.forEach(function(sKey) {
					var oBindingInfo = BindingHelper.prependRelativePaths(oConfiguration.legendItem.template[sKey], oLegend.getBindingPath("items") + "/" + i);

					singleAssembledItem[sKey] = BindingResolver.resolveValue(oBindingInfo, this);
				}.bind(this));
				aResolvedLegendItems.push(singleAssembledItem);
			}.bind(this));

			aLegendAppointmentItems.forEach(function (oItem, i) {
				var aTemplateKeys  = Object.keys(oConfiguration.legendItem.template),
					singleAssembledItem = {};

				aTemplateKeys.forEach(function(sKey) {
					var oBindingInfo = BindingHelper.prependRelativePaths(oConfiguration.legendItem.template[sKey], oLegend.getBindingPath("items") + "/" + i);

					singleAssembledItem[sKey] = BindingResolver.resolveValue(oBindingInfo, this);
				}.bind(this));
				aResolvedLegendItems.push(singleAssembledItem);
			}.bind(this));

			return aResolvedLegendItems;
		};

		CalendarContent.prototype._getStaticConfigurationSpecialDates = function (aSpecialDates, oConfiguration) {
			var aResolvedSpecialDates = [];
			aSpecialDates.forEach(function (oItem, i) {
				var oCal = this._oCalendar,
					oStartDate = oItem.getStartDate(),
					oEndDate = oItem.getEndDate(),
					oViewedMonth = oCal._getMonthPicker().getMonth() ?
						oCal._getMonthPicker().getMonth() :
						oCal._getFocusedDate().getMonth(),
					oViewedYear = Number(oCal._getYearString()),
					bStartsWithinMonth = oStartDate.getMonth() === oViewedMonth,
					bEndsWithinMonth = oEndDate ? oEndDate.getMonth() === oViewedMonth : false,
					bStartsWithinYear = oStartDate.getFullYear() === oViewedYear,
					bEndsWithinYear = oItem.getEndDate() ?
						oItem.getEndDate().getFullYear() === oViewedYear :
						bStartsWithinYear,
					bIncludeSpecialDate = (bStartsWithinMonth || bEndsWithinMonth) && (bStartsWithinYear || bEndsWithinYear),
					aTemplateKeys,
					oResolvedDate;

				if (bIncludeSpecialDate) {
					aTemplateKeys = Object.keys(oConfiguration.specialDate.template);
					var oBindingInfo = {};

					aTemplateKeys.forEach(function(sKey) {
						oBindingInfo[sKey] = BindingHelper.prependRelativePaths(oConfiguration.specialDate.template[sKey], this._oCalendar.getBindingPath("specialDates") + "/" + i);
					}.bind(this));

					oResolvedDate = BindingResolver.resolveValue(oBindingInfo, this);
					oResolvedDate.startDate = new Date(oResolvedDate.startDate).toISOString();
					if (oResolvedDate.endDate) {
						oResolvedDate.endDate = new Date(oResolvedDate.endDate).toISOString();
					}

					aResolvedSpecialDates.push(oResolvedDate);
				}
			}.bind(this));
			return aResolvedSpecialDates;
		};

		CalendarContent.prototype._getStaticConfigurationAppointments = function (aAppointments, oSelectedJSStartDate, oSelectedDateEnd, oConfiguration) {
			var aResolvedItems = [],
				bMoreItems = false;

			aAppointments.forEach(function (oItem, i) {
				var oStartDate = oItem.getStartDate(),
					oEndDate = oItem.getEndDate(),
					aTemplateKeys,
					singleAssembledItem,
					bAppInDay = oStartDate >= oSelectedJSStartDate && oStartDate <= oSelectedDateEnd,
					bAppEndsInDay = oEndDate >= oSelectedJSStartDate && oEndDate <= oSelectedDateEnd,
					bDayInApp = oStartDate <= oSelectedJSStartDate &&  oEndDate > oSelectedDateEnd,
					bIncludeAppointment = bAppInDay || bAppEndsInDay || bDayInApp;

				if (bIncludeAppointment) {
					aTemplateKeys = Object.keys(oConfiguration.item.template);
					singleAssembledItem = {};

					aTemplateKeys.forEach(function(sKey) {
						var oBindingInfo = BindingHelper.prependRelativePaths(oConfiguration.item.template[sKey], this.getBindingPath("appointments") + "/" + i);

						singleAssembledItem[sKey] = BindingResolver.resolveValue(oBindingInfo, this);
					}.bind(this));
					singleAssembledItem.startDate = new Date(singleAssembledItem.startDate).toISOString();
					if (singleAssembledItem.endDate) {
						singleAssembledItem.endDate = new Date(singleAssembledItem.endDate).toISOString();
					}
					aResolvedItems.push(singleAssembledItem);
					if (aResolvedItems.length > oConfiguration.maxItems) {
						bMoreItems = true;
					}
				}
			}.bind(this));

			return {
				resolvedItems: aResolvedItems,
				moreItems: bMoreItems
			};
		};

		/**
		 * @override
		 */
		 CalendarContent.prototype.getStaticConfiguration = function () {
			var oConfiguration = this.getParsedConfiguration(),
				aAppointments = this.getAppointments(),
				aSpecialDates = this._oCalendar.getSpecialDates(),
				sLegendId = this._oCalendar.getLegend(),
				oLegend = Core.byId(sLegendId),
				aLegendItems = oLegend.getItems(),
				aLegendAppointmentItems = oLegend.getAppointmentItems(),
				oFocusedDate = this._oCalendar.getSelectedDates()[0] ?
					this._oCalendar.getSelectedDates()[0].getStartDate() :
					null,
				iMillisecondsInDay = 86400000,
				oSelectededDate = this._oCalendar.getSelectedDates()[0] ? this._oCalendar.getSelectedDates()[0] : null,
				oSelectedDateEnd = oSelectededDate.getStartDate ? oSelectededDate.getStartDate().getTime() + iMillisecondsInDay : null,
				oSelectedJSStartDate = oSelectededDate.getStartDate(),
				iMaxItems = oConfiguration.maxItems,
				iMaxLegendItems = oConfiguration.maxLegendItems,
				sNoItemsText = oConfiguration.noItemsText,
				bMoreItems = false,
				oStaticConfiguration = {},
				aResolvedAndMoreItems,
				aResolvedSpecialDates,
				aResolvedLegendItems,
				aResolvedItems,
				sFocusedDateISO;

			sFocusedDateISO = oFocusedDate ? oFocusedDate.toISOString() : null;
			sFocusedDateISO = sFocusedDateISO ? sFocusedDateISO : oConfiguration.date;

			aResolvedAndMoreItems = this._getStaticConfigurationAppointments(aAppointments, oSelectedJSStartDate, oSelectedDateEnd, oConfiguration);
			aResolvedItems = aResolvedAndMoreItems.resolvedItems;
			bMoreItems = aResolvedAndMoreItems.moreItems;

			aResolvedSpecialDates = this._getStaticConfigurationSpecialDates(aSpecialDates, oConfiguration);

			aResolvedLegendItems = this._getStaticConfigurationLegendItems(aLegendItems, aLegendAppointmentItems, oConfiguration, oLegend);

			oStaticConfiguration.items = aResolvedItems;
			oStaticConfiguration.specialDates = aResolvedSpecialDates;
			oStaticConfiguration.legendItems = aResolvedLegendItems;
			oStaticConfiguration.date = sFocusedDateISO;
			oStaticConfiguration.maxItems = iMaxItems;
			oStaticConfiguration.maxLegendItems = iMaxLegendItems;
			oStaticConfiguration.noItemsText = sNoItemsText;
			if (bMoreItems) {
				oStaticConfiguration.moreItems = BindingResolver.resolveValue(oConfiguration.moreItems, this);
			}

			return oStaticConfiguration;
		};

		/**
		 * Sets values in the parameters' model to be used as a counter in the header part ot the card.
		 *
		 * @public
		 * @param {Object} oEvent the passed object from the event.
		 * @param {Object} oDate a date, against which the parameters are set.
		 */
		CalendarContent.prototype._setParameters = function (oEvent, oDate) {
			var oCurrentDate,
				iStartOfDay,
				iEndOfDay,
				aBoundAppointments,
				aAppointmentsCurrentDay;

			if (oDate) {
				oCurrentDate = oDate;
			} else if (this._oCalendar.getSelectedDates().length) {
				oCurrentDate = this._oCalendar.getSelectedDates()[0].getStartDate();
			} else {
				oCurrentDate = this._oCalendar.getStartDate();
			}

			iStartOfDay = UI5Date.getInstance(oCurrentDate.getFullYear(), oCurrentDate.getMonth(), oCurrentDate.getDate()).getTime();
			iEndOfDay = UI5Date.getInstance(oCurrentDate.getFullYear(), oCurrentDate.getMonth(), oCurrentDate.getDate() + 1).getTime();

			aBoundAppointments = this.getAppointments();
			if (aBoundAppointments) {
				aAppointmentsCurrentDay	= aBoundAppointments.filter(function (oApp) {
					var iStart = oApp.getStartDate().getTime(),
						iEnd = oApp.getEndDate().getTime();
					if ((iStart >=  iStartOfDay && iStart < iEndOfDay) ||
						(iEnd > iStartOfDay && iEnd <= iEndOfDay) ||
						(iStart < iStartOfDay && iEnd > iEndOfDay)) {
						return oApp;
					}
				});
			} else {
				aAppointmentsCurrentDay = [];
			}

			this._iAllItems = aAppointmentsCurrentDay.length;
			this._iMaxItems = this.getVisibleAppointmentsCount();
			this._iVisibleItems = Math.min(this._iMaxItems, this._iAllItems);

			if (this.getModel("parameters")) {
				this.getModel("parameters").setProperty("/visibleItems", this._iVisibleItems);
				this.getModel("parameters").setProperty("/allItems", this._iAllItems);
			}
		};

		/**
		 * Calculates which appointments to be shown.
		 *
		 * @private
		 * @param {object} oSelectedDate The date, for which the appointments are shown.
		 */
		CalendarContent.prototype._refreshVisibleAppointments = function(oSelectedDate) {
			this._aVisibleAppointments = this._calculateVisibleAppointments(this.getAppointments(), oSelectedDate);
		};

		/**
		 * Calculates which appointments to be shown.
		 *
		 * @private
		 * @param {array} aItems The appointments structure, which will be filtered.
		 * @param {array} oSelectedDate The date, for which the appointments are shown.
		 * @returns {array} the filtered items
		 */
		CalendarContent.prototype._calculateVisibleAppointments = function (aItems, oSelectedDate) {
			var fnIsVisiblePredicate = this._isAppointmentInSelectedDate(oSelectedDate);
			var fnTodayFilter = function(oApp, iIndex) {
				var oEndDate = oApp.getEndDate(),
					oNow = UI5Date.getInstance();

				// today
				if (oSelectedDate.getDate() === oNow.getDate()
					&& oSelectedDate.getMonth() === oNow.getMonth()
					&& oSelectedDate.getFullYear() === oNow.getFullYear()) {
					return this._iAllItems - iIndex < this._iVisibleItems
						|| oEndDate.getTime() > oNow.getTime();
				}

				// not today
				return true;
			};

			var aResult = aItems
				.filter(fnIsVisiblePredicate, this)
				.sort(this._sortByStartHourCB)
				.filter(fnTodayFilter, this)
				.slice(0, this._iVisibleItems);

			return aResult;
		};

		/**
		 * Sorts the shown appointments.
		 *
		 * @private
		 * @param {sap.f.CalendarAppointmentInCard} oApp1 The first item to be compared.
		 * @param {sap.f.CalendarAppointmentInCard} oApp2 The second item to be compared.
		 * @returns {boolean} if the first item is before the second one
		 */
		CalendarContent.prototype._sortByStartHourCB = function (oApp1, oApp2) {
			return oApp1.getStartDate().getTime() - oApp2.getStartDate().getTime() ||
				oApp2.getEndDate().getTime() - oApp1.getEndDate().getTime();
		};

		/**
		 * Calculates if the appointment is in the selected date from the calendar.
		 *
		 * @private
		 * @param {object} oSelectedDate The selected date, for which the appointments are shown.
		 * @returns {function} which does the calculation
		 */
		CalendarContent.prototype._isAppointmentInSelectedDate = function (oSelectedDate) {
			return function (oAppointment) {
				var iAppStartTime = oAppointment.getStartDate().getTime(),
					iAppEndTime = oAppointment.getEndDate().getTime(),
					iSelectedStartTime = oSelectedDate.getTime(),
					oSelectedEnd = UniversalDate.getInstance(UI5Date.getInstance(oSelectedDate.getTime())),
					iSelectedEndTime,
					bBiggerThanVisibleHours,
					bStartHourBetweenStartAndEnd,
					bEndHourBetweenStartAndEnd;

				oSelectedEnd.setDate(oSelectedEnd.getDate() + 1);
				iSelectedEndTime = oSelectedEnd.getTime() - 1000;

				bBiggerThanVisibleHours = iAppStartTime < iSelectedStartTime && iAppEndTime > iSelectedEndTime;
				bStartHourBetweenStartAndEnd = iAppStartTime >= iSelectedStartTime && iAppStartTime < iSelectedEndTime;
				bEndHourBetweenStartAndEnd = iAppEndTime > iSelectedStartTime && iAppEndTime <= iSelectedEndTime;

				return bBiggerThanVisibleHours || bStartHourBetweenStartAndEnd || bEndHourBetweenStartAndEnd;
			};
		};

		/**
		 * Holds the structure with the visible appointments
		 *
		 * @private
		 * @returns {array} with the visible appointments
		 */
		CalendarContent.prototype._getVisibleAppointments = function() {
			return this._aVisibleAppointments;
		};

		/**
		 * Formats a given date to a JS date object.
		 *
		 * @public
		 * @param {int} sTime the value to be formatted.
		 * @returns {object} a JS date object.
		 */
		CalendarContent.prototype.formatDate = function (sTime) {
			var oDate = DateFormat.getDateTimeInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"}).parse(sTime);
			if (!oDate) {
				oDate = DateFormat.getInstance({pattern: "yyyy-MM-dd"}).parse(sTime);
			}
			return oDate;
		};

		/**
		 * Binds/Sets properties to the inner appointments templates based on the configuration object item
		 * template which is already parsed.
		 *
		 * @private
		 * @param {Object} mItem The item template of the configuration object.
		 */
		CalendarContent.prototype._addItem = function (mItem) {
			var mAppointmentSettings = {
					title: mItem.template.title,
					text: mItem.template.text,
					type: mItem.template.type
				},
				oAppointmentBindingInfo;
			if (mItem.template.startDate) {
				mAppointmentSettings.startDate = BindingHelper.formattedProperty(mItem.template.startDate, this.formatDate);
			}
			if (mItem.template.endDate) {
				mAppointmentSettings.endDate = BindingHelper.formattedProperty(mItem.template.endDate, this.formatDate);
			}
			if (mItem.template.icon && mItem.template.icon.src) {
				mAppointmentSettings.icon = BindingHelper.formattedProperty(mItem.template.icon.src, function (sValue) {
					return this._oIconFormatter.formatSrc(sValue);
				}.bind(this));
			}
			this._oAppointmentTemplate = new CalendarAppointmentInCard(mAppointmentSettings);
			var oCardActions = this.getActions();
			oCardActions.attach({
				area: ActionArea.ContentItem,
				actions: mItem.template.actions,
				control: this,
				actionControl: this._oAppointmentTemplate,
				enabledPropertyName: "clickable",
				enabledPropertyValue: true,
				disabledPropertyValue: false
			});
			oAppointmentBindingInfo = {
				path: mItem.path,
				template: this._oAppointmentTemplate
			};
			this._bindAggregationToControl("appointments", this, oAppointmentBindingInfo);
		};

		/**
		 * Binds/Sets properties to the inner specialDate template based on the configuration object specialDate template
		 * which is already parsed.
		 *
		 * @private
		 * @param {Object} mSpecialDate The specialDate template of the configuration object.
		 */
		CalendarContent.prototype._addSpecialDate = function (mSpecialDate) {
			var mSettings = mSpecialDate.template,
				oBindingInfo;
			if (mSettings.startDate) {
				mSettings.startDate = BindingHelper.formattedProperty(mSettings.startDate, this.formatDate);
			}
			if (mSettings.endDate) {
				mSettings.endDate = BindingHelper.formattedProperty(mSettings.endDate, this.formatDate);
			}
			this._oSpecialDateTemplate = new DateTypeRange(mSettings);
			oBindingInfo = {
				path: mSpecialDate.path,
				template: this._oSpecialDateTemplate
			};
			this._bindAggregationToControl("specialDates", this._oCalendar, oBindingInfo);
		};


		/**
		 * Binds/Sets properties to the inner calendarItem and appointmentItem templates based on the configuration object
		 * legendItem template which is already parsed.
		 *
		 * @private
		 * @param {Object} mLegendItem The legendItem template of the configuration object.
		 */
		CalendarContent.prototype._addLegendItem = function (mLegendItem) {
			var mCalendarSettings = {
					text: mLegendItem.template.text,
					type: mLegendItem.template.type
				},
				mAppointmentSettings = {
					text: mLegendItem.template.text,
					type: mLegendItem.template.type
				},
				oCalendarBindingInfo,
				oAppointmentBindingInfo;

			this._oCalendarLegendItemTemplate = new CalendarLegendItem(mCalendarSettings);
			oCalendarBindingInfo = {
				path: mLegendItem.path,
				template: this._oCalendarLegendItemTemplate,
				filters: new Filter({
					path: "category",
					operator: FilterOperator.Contains,
					value1: "calendar"
				})
			};
			this._bindAggregationToControl("items", this._oLegend, oCalendarBindingInfo);

			this._oAppointmentLegendItemTemplate = new CalendarLegendItem(mAppointmentSettings);
			oAppointmentBindingInfo = {
				path: mLegendItem.path,
				template: this._oAppointmentLegendItemTemplate,
				filters: new Filter({
					path: "category",
					operator: FilterOperator.Contains,
					value1: "appointment"
				})
			};
			this._bindAggregationToControl("appointmentItems", this._oLegend, oAppointmentBindingInfo);
		};

		/**
		 * Binds/Sets value to the inner startDate template based on the configuration object date template which is already parsed.
		 *
		 * @private
		 * @param {Object} sTime The date template of the configuration object.
		 */
		CalendarContent.prototype._addDate = function (sTime) {
			if (BindingHelper.isBindingInfo(sTime)) {
				if (!sTime) {
					return;
				}
				var oDR = new DateTypeRange();
				oDR.bindProperty("startDate", BindingHelper.formattedProperty(sTime, this.formatDate));
				this._oCalendar.addSelectedDate(oDR);
			} else {
				this._oCalendar.addSelectedDate(new DateTypeRange({startDate: this.formatDate(sTime)}));

				var oFocusedDate = this.formatDate(sTime);

				this._handleSelect(oFocusedDate);
				this._handleStartDateChange(oFocusedDate);
				this._bDataInitiallyLoaded = true;
			}
		};

		/**
		 * Binds/Sets value to the inner visibleAppointmentsCount template based on the configuration object maxItems template which is already parsed.
		 *
		 * @private
		 * @param {Object} mMaxItems The mMaxItems template of the configuration object.
		 */
		CalendarContent.prototype._addMaxItems = function (mMaxItems) {
			if (BindingHelper.isBindingInfo(mMaxItems)) {
				mMaxItems && this.bindProperty("visibleAppointmentsCount", mMaxItems);
			} else {
				this.setVisibleAppointmentsCount(mMaxItems);
			}
		};

		/**
		 * Binds/Sets value to the inner visibleLegendItemsCount template based on the configuration object maxLegendItems template which is already parsed.
		 *
		 * @private
		 * @param {Object} mMaxLegendItems The maxLegendItems template of the configuration object.
		 */
		CalendarContent.prototype._addMaxLegendItems = function (mMaxLegendItems) {
			if (BindingHelper.isBindingInfo(mMaxLegendItems)) {
				mMaxLegendItems && this._oLegend.bindProperty("visibleLegendItemsCount", mMaxLegendItems);
			} else {
				this._oLegend.setVisibleLegendItemsCount(mMaxLegendItems);
			}
		};

		/**
		 * Binds/Sets value to the inner noAppointmentsText template based on the configuration object noItemsText template which is already parsed.
		 *
		 * @private
		 * @param {Object} mNoItemsText The noItemsText template of the configuration object.
		 */
		CalendarContent.prototype._addNoItemsText = function (mNoItemsText) {
			if (BindingHelper.isBindingInfo(mNoItemsText)) {
				mNoItemsText && this.bindProperty("noAppointmentsText", mNoItemsText);
			} else {
				this.setNoAppointmentsText(mNoItemsText);
			}
		};

		/**
		 * Makes or returns the object, showing that some appointments are hidden.
		 * @returns {sap.m.Button} the object
		 */
		CalendarContent.prototype._getMoreButton = function () {
			if (!this._oMoreAppsButton) {
				this._oMoreAppsButton = new Button({ text: "More" });
			}
			return this._oMoreAppsButton;
		};

		/**
		 * Calculates whether the More button is needed.
		 * @returns {boolean} <code>true</code> if so
		 */
		CalendarContent.prototype._bNeedForMoreButton = function () {
			return this._iAllItems > this.getVisibleAppointmentsCount();
		};

		// When today is the selected date, it returns the current appointment,
		// if there is one, otherwise returns undefined.
		// priority for the later started.
		CalendarContent.prototype._getCurrentAppointment = function() {
			var aAppointments = this._getVisibleAppointments(),
				oNow = UI5Date.getInstance(),
				oApp,
				iStart,
				iEnd,
				i,
				oSelectedDate = this._oCalendar.getSelectedDates().length
					? this._oCalendar.getSelectedDates()[0].getStartDate()
					: this._oCalendar.getStartDate();

			if (oSelectedDate.getDate() === oNow.getDate()
				&& oSelectedDate.getMonth() === oNow.getMonth()
				&& oSelectedDate.getFullYear() === oNow.getFullYear()) {
				for (i = aAppointments.length - 1; i >= 0; i--) {
					oApp = aAppointments[i];
					iStart = oApp.getStartDate().getTime();
					iEnd = oApp.getEndDate().getTime();

					if (oNow.getTime() > iStart && oNow.getTime() < iEnd) {
						return oApp;
					}
				}
			}
		};

		/**
		 * Fires an action indicating that a new month is displayed in the card.
		 * @param {Date} oFocusedDate The focused date in the new month
		 */
		CalendarContent.prototype._handleStartDateChange = function (oFocusedDate) {
			var oCardActions = this.getActions(),
				oCalFocusedDate = CalendarDate.fromLocalJSDate(oFocusedDate),
				oCalFirstRenderedDate = CalendarUtils._getFirstDateOfWeek(CalendarUtils._getFirstDateOfMonth(oCalFocusedDate)),
				oCalLastDateInMonth = new CalendarDate(oFocusedDate.getFullYear(), oFocusedDate.getMonth() + 1, 1),
				oCalLastRenderedDate;

			oCalLastDateInMonth.setDate(oCalLastDateInMonth.getDate() - 1); // move a day backwards
			oCalLastRenderedDate = CalendarUtils._getFirstDateOfWeek(oCalLastDateInMonth);
			oCalLastRenderedDate.setDate(oCalLastRenderedDate.getDate() + 6); // move to the end of the week

			oCardActions.fireAction(this, "MonthChange", {
				"firstDate": oCalFirstRenderedDate.toLocalJSDate(),
				"lastDate": oCalLastRenderedDate.toLocalJSDate()
			});
		};

		/**
		 * Fires an action indicating that a new date is selected in the card.
		 * @param {Date} oSelectedDate The new selected date in the month
		 */
		CalendarContent.prototype._handleSelect = function (oSelectedDate) {
			var oCardActions = this.getActions();

			oCardActions.fireAction(this, "DateChange", {
				"selectedDate": oSelectedDate
			});
		};

		function _getLocaleData() {

			if (!this._oLocaleData) {
				var sLocale = _getLocale.call(this);
				var oLocale = new Locale(sLocale);
				this._oLocaleData = LocaleData.getInstance(oLocale);
			}

			return this._oLocaleData;

		}

		function _getLocale() {

			if (!this._sLocale) {
				this._sLocale = undefined/*Configuration*/.getFormatSettings().getFormatLocale().toString();
			}

			return this._sLocale;

		}

		return CalendarContent;
	}
);
