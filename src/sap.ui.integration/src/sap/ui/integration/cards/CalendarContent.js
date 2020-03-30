/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/integration/library",
		"sap/ui/integration/cards/BaseContent",
		"sap/f/cards/IconFormatter",
		"sap/ui/integration/util/BindingHelper",
		"sap/ui/integration/util/BindingResolver",
		"sap/f/PlanningCalendarInCard",
		"sap/f/PlanningCalendarInCardRow",
		"sap/f/PlanningCalendarInCardLegend",
		"sap/m/library",
		"sap/m/PlanningCalendar",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/unified/CalendarAppointment",
		"sap/ui/unified/DateTypeRange",
		"sap/ui/unified/CalendarLegendItem"
	],
	function (library, BaseContent, IconFormatter, BindingHelper, BindingResolver, PlanningCalendarInCard, PlanningCalendarInCardRow, PlanningCalendarInCardLegend, mLibrary, PlanningCalendar, Filter, FilterOperator, CalendarAppointment, DateTypeRange, CalendarLegendItem) {
		"use strict";

		var AreaType = library.AreaType,
			PlanningCalendarBuiltInView = mLibrary.PlanningCalendarBuiltInView;
		/**
		 * Constructor for a new <code>CalendarContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A control that is a wrapper of a <code>sap.f.PlanningCalendar</code> and allows its creation based on a
		 * configuration.
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
		 * @experimental Since 1.74.
		 * @alias sap.ui.integration.cards.CalendarContent
		 */
		var CalendarContent = BaseContent.extend("sap.ui.integration.cards.CalendarContent", {
			renderer: {}
		});

		/**
		 * Creates <code>sap.f.PlanningCalendarInCard</code>.
		 * @private
		 */
		CalendarContent.prototype._createCalendar = function () {
			this._oCalendar = new PlanningCalendarInCard(this.getId() + "-PC", {
				showWeekNumbers: true,
				builtInViews: [PlanningCalendarBuiltInView.OneMonth],
				rows: [
					new PlanningCalendarInCardRow(this.getId() + "-Row", {})
				],
				intervalSelect: function (oEvent) {
					this._setParameters(oEvent, oEvent.getParameter("startDate"));
				}.bind(this)
			});
			this.setAggregation("_content", this._oCalendar);
			this._oCalendar.attachEvent("_todayPressed", new Date(), this._setParameters);
		};

		CalendarContent.prototype.init = function () {
			BaseContent.prototype.init.apply(this, arguments);
			this._createCalendar();

			//workaround until actions refactor
			this.fireEvent("_actionContentReady"); // todo
		};

		CalendarContent.prototype.exit = function () {
			BaseContent.prototype.exit.apply(this, arguments);

			if (this._oAppointmentTemplate) {
				this._oAppointmentTemplate.destroy();
				this._oAppointmentTemplate = null;
			}

			if (this._oHeaderTemplate) {
				this._oHeaderTemplate.destroy();
				this._oHeaderTemplate = null;
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

			if (this._oActions) {
				this._oActions.destroy();
				this._oActions = null;
			}
		};

		CalendarContent.prototype.onDataChanged = function () {
			this._setParameters();
		};

		CalendarContent.prototype.onBeforeRendering = function () {
			this.getModel("parameters").setProperty("/visibleItems", this._iVisibleItems);
			this.getModel("parameters").setProperty("/allItems", this._iAllItems);
		};

		/**
		 * Setter for configuring a <code>sap.ui.integration.cards.CalendarContent</code>.
		 *
		 * @public
		 * @param {Object} oConfiguration Configuration object used to create the internal calendar.
		 * @returns {sap.ui.integration.cards.CalendarContent} Pointer to the control instance to allow method chaining.
		 */
		CalendarContent.prototype.setConfiguration = function (oConfiguration) {
			BaseContent.prototype.setConfiguration.apply(this, arguments);

			if (!oConfiguration) {
				return this;
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
				this._oActions.setAreaType(AreaType.Content);
				this._oActions.attach(oConfiguration.moreItems, this._oCalendar.getRows()[0]._getMoreButton());
			}

			return this;
		};

		/**
		 * Sets values in the parameters' model to be used as a counter in the header part ot the card.
		 *
		 * @public
		 * @param {Object} oEvent the passed object from the event.
		 * @param {Object} oDate a date, against which the parameters are set.
		 */
		CalendarContent.prototype._setParameters = function (oEvent, oDate) {
			var oCurrentDate = oDate ? oDate : this._oCalendar.getStartDate(),
				oStartOfDay = new Date(oCurrentDate.getFullYear(), oCurrentDate.getMonth(), oCurrentDate.getDate()),
				oEndOfDay = new Date(oCurrentDate.getFullYear(), oCurrentDate.getMonth(), oCurrentDate.getDate()),
				oConfiguration = this.getConfiguration && this.getConfiguration(),
				sItemPath = oConfiguration && oConfiguration.item && oConfiguration.item.path,
				sMaxItemsPath,
				iMaxItems,
				aAppointmentsCurrentDay,
				iVisibleAppointmentsAndBlockersForTheDay,
				iTotalAppointmentsAndBlockersForTheDay;

			oEndOfDay.setDate(oEndOfDay.getDate() + 1);
			aAppointmentsCurrentDay = sItemPath ? this.getModel().getProperty(sItemPath).filter(function (oApp) {
				var iStart = new Date(oApp.start).getTime(),
					iEnd = new Date(oApp.end).getTime();
				if ((iStart >= oStartOfDay.getTime() && iStart < oEndOfDay.getTime()) ||
					(iEnd >= oStartOfDay.getTime() && iEnd < oEndOfDay.getTime()) ||
					(iStart <= oStartOfDay.getTime() && iEnd > oEndOfDay.getTime())) {
					return oApp;
				}
			}) : [];

			if (oConfiguration && typeof oConfiguration.maxItems === "object") {
				sMaxItemsPath = oConfiguration && this.getConfiguration().maxItems && "/" + this.getConfiguration().maxItems.binding.getPath();
				iMaxItems = this.getModel().getProperty(sMaxItemsPath);
			} else {
				iMaxItems = oConfiguration && this.getConfiguration().maxItems;
			}

			iTotalAppointmentsAndBlockersForTheDay =  aAppointmentsCurrentDay.length;
			if (iTotalAppointmentsAndBlockersForTheDay < iMaxItems) {
				iVisibleAppointmentsAndBlockersForTheDay = iTotalAppointmentsAndBlockersForTheDay;
			} else {
				iVisibleAppointmentsAndBlockersForTheDay = iMaxItems;
			}

			this._iVisibleItems = iVisibleAppointmentsAndBlockersForTheDay;
			this._iAllItems = iTotalAppointmentsAndBlockersForTheDay;

			if (this.getModel("parameters")) {
				this.getModel("parameters").setProperty("/visibleItems", this._iVisibleItems);
				this.getModel("parameters").setProperty("/allItems", this._iAllItems);
			}
		};

		/**
		 * Formats a given date to a JS date object.
		 *
		 * @public
		 * @param {int} iTime the value to be formatted.
		 * @returns {object} a JS date object.
		 */
		CalendarContent.prototype.dateFormatter = function (iTime) {
			return new Date(iTime);
		};

		/**
		 * Binds/Sets properties to the inner appointments and blockers templates based on the configuration object item
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
				oAppointmentBindingInfo,
				mBlockerSettings = {
					title: mItem.template.title,
					text: mItem.template.text,
					type: mItem.template.type
				},
				oBlockerBindingInfo;
			if (mItem.template.startDate) {
				mAppointmentSettings.startDate = BindingHelper.formattedProperty(mItem.template.startDate, this.dateFormatter);
			}
			if (mItem.template.endDate) {
				mAppointmentSettings.endDate = BindingHelper.formattedProperty(mItem.template.endDate, this.dateFormatter);
			}
			if (mItem.template.icon && mItem.template.icon.src) {
				mAppointmentSettings.icon = BindingHelper.formattedProperty(mItem.template.icon.src, function (sValue) {
					return IconFormatter.formatSrc(sValue, this._sAppId);
				}.bind(this));
			}
			this._oAppointmentTemplate = new CalendarAppointment(mAppointmentSettings);
			oAppointmentBindingInfo = {
				path: mItem.path,
				template: this._oAppointmentTemplate,
				filters: new Filter({
					path: "visualization",
					operator: FilterOperator.Contains,
					value1: "appointment"
				})
			};
			this._bindAggregation("appointments", this._oCalendar.getRows()[0], oAppointmentBindingInfo);

			if (mItem.template.startDate) {
				mBlockerSettings.startDate = BindingHelper.formattedProperty(mItem.template.startDate, this.dateFormatter);
			}
			if (mItem.template.endDate) {
				mBlockerSettings.endDate = BindingHelper.formattedProperty(mItem.template.endDate, this.dateFormatter);
			}
			if (mItem.template.icon && mItem.template.icon.src) {
				mBlockerSettings.icon = BindingHelper.formattedProperty(mItem.template.icon.src, function (sValue) {
					return IconFormatter.formatSrc(sValue, this._sAppId);
				}.bind(this));
			}
			this._oHeaderTemplate = new CalendarAppointment(mBlockerSettings);
			oBlockerBindingInfo = {
				path: mItem.path,
				template: this._oHeaderTemplate,
				filters: new Filter({
					path: "visualization",
					operator: FilterOperator.Contains,
					value1: "blocker"
				})
			};
			this._bindAggregation("intervalHeaders", this._oCalendar.getRows()[0], oBlockerBindingInfo);
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
				mSettings.startDate = BindingHelper.formattedProperty(mSettings.startDate, this.dateFormatter);
			}
			if (mSettings.endDate) {
				mSettings.endDate = BindingHelper.formattedProperty(mSettings.endDate, this.dateFormatter);
			}
			this._oSpecialDateTemplate = new DateTypeRange(mSettings);
			oBindingInfo = {
				path: mSpecialDate.path,
				template: this._oSpecialDateTemplate
			};
			this._bindAggregation("specialDates", this._oCalendar, oBindingInfo);
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
			this._bindAggregation("items", this._oCalendar._getLegend(), oCalendarBindingInfo);

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
			this._bindAggregation("appointmentItems", this._oCalendar._getLegend(), oAppointmentBindingInfo);
		};

		/**
		 * Binds/Sets value to the inner startDate template based on the configuration object date template which is already parsed.
		 *
		 * @private
		 * @param {Object} mTime The date template of the configuration object.
		 */
		CalendarContent.prototype._addDate = function (mTime) {
			if (BindingResolver.isBindingInfo(mTime)) {
				mTime && this._oCalendar.bindProperty("startDate", BindingHelper.formattedProperty(mTime, this.dateFormatter));
			} else {
				this._oCalendar.setStartDate(this.dateFormatter(mTime));
			}
		};

		/**
		 * Binds/Sets value to the inner visibleAppointmentsCount template based on the configuration object maxItems template which is already parsed.
		 *
		 * @private
		 * @param {Object} mMaxItems The mMaxItems template of the configuration object.
		 */
		CalendarContent.prototype._addMaxItems = function (mMaxItems) {
			if (BindingResolver.isBindingInfo(mMaxItems)) {
				mMaxItems && this._oCalendar.getRows()[0].bindProperty("visibleAppointmentsCount", mMaxItems);
			} else {
				this._oCalendar.getRows()[0].setVisibleAppointmentsCount(mMaxItems);
			}
		};

		/**
		 * Binds/Sets value to the inner visibleLegendItemsCount template based on the configuration object maxLegendItems template which is already parsed.
		 *
		 * @private
		 * @param {Object} mMaxLegendItems The maxLegendItems template of the configuration object.
		 */
		CalendarContent.prototype._addMaxLegendItems = function (mMaxLegendItems) {
			if (BindingResolver.isBindingInfo(mMaxLegendItems)) {
				mMaxLegendItems && this._oCalendar._getLegend().bindProperty("visibleLegendItemsCount", mMaxLegendItems);
			} else {
				this._oCalendar._getLegend().setVisibleLegendItemsCount(mMaxLegendItems);
			}
		};

		/**
		 * Binds/Sets value to the inner noAppointmentsText template based on the configuration object noItemsText template which is already parsed.
		 *
		 * @private
		 * @param {Object} mNoItemsText The noItemsText template of the configuration object.
		 */
		CalendarContent.prototype._addNoItemsText = function (mNoItemsText) {
			if (BindingResolver.isBindingInfo(mNoItemsText)) {
				mNoItemsText && this._oCalendar.getRows()[0].bindProperty("noAppointmentsText", mNoItemsText);
			} else {
				this._oCalendar.getRows()[0].setNoAppointmentsText(mNoItemsText);
			}
		};

		return CalendarContent;
	}
);
