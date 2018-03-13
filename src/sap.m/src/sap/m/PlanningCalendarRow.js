/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.PlanningCalendarRow.
sap.ui.define(['jquery.sap.global',
		'sap/ui/core/Element',
		'sap/ui/core/Control',
		'./StandardListItem',
		'./StandardListItemRenderer',
		'sap/ui/core/Renderer',
		'./library',
		'sap/ui/unified/library',
		'sap/ui/unified/DateRange',
		'sap/ui/unified/CalendarRow',
		'sap/ui/unified/CalendarRowRenderer',
		'sap/m/ColumnListItem',
		'sap/m/ColumnListItemRenderer'],
	function (jQuery, Element, Control, StandardListItem, StandardListItemRenderer, Renderer, library, unifiedLibrary, DateRange,
			  CalendarRow, CalendarRowRenderer, ColumnListItem, ColumnListItemRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>PlanningCalendarRow</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Row in the @link sap.m.PlanningCalendar}.
	 *
	 * This element holds the data of one row in the @link sap.m.PlanningCalendar}. Once the header information (e.g. person information)
	 * is assigned, the appointments are assigned.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.PlanningCalendarRow
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PlanningCalendarRow = Element.extend("sap.m.PlanningCalendarRow", /** @lends sap.m.PlanningCalendarRow.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the title of the header (for example, the name of the person).
			 */
			title : {type : "string", group : "Data"},

			/**
			 * Defines the text of the header (for example, the department of the person).
			 */
			text : {type : "string", group : "Data"},

			/**
			 * Specifies the URI of an image or an icon registered in <code>sap.ui.core.IconPool</code>.
			 */
			icon : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 * Determines whether the provided weekdays are displayed as non-working days.
			 * Valid values inside the array are from 0 to 6 (other values are ignored).
			 * If not set, the weekend defined in the locale settings is displayed as non-working days.
			 *
			 * <b>Note:</b> The non-working days are visualized if the <code>intervalType</code>
			 * property of the {@link sap.m.PlanningCalendarView} is set to <code>Day</code>.
			 */
			nonWorkingDays : {type : "int[]", group : "Misc", defaultValue : null},

			/**
			 * Determines whether the provided hours are displayed as non-working hours.
			 * Valid values inside the array are from 0 to 23 (other values are ignored).
			 *
			 * <b>Note:</b> The non-working hours are visualized if <code>intervalType</code>
			 * property of the {@link sap.m.PlanningCalendarView} is set to <code>Hour</code>.
			 */
			nonWorkingHours : {type : "int[]", group : "Misc", defaultValue : null},

			/**
			 * Defines the selected state of the <code>PlanningCalendarRow</code>.
			 *
			 * <b>Note:</b> Binding the <code>selected</code> property in single selection modes may
			 * cause unwanted results if you have more than one selected row in your binding.
			 */
			selected : {type : "boolean", group : "Data", defaultValue : false},

			/**
			 * Defines the identifier of the row.
			 */
			key : {type : "string", group : "Data", defaultValue : null}

		},
		aggregations : {

			/**
			 * The appointments to be displayed in the row. Appointments that outside the visible time frame are not rendered.
			 *
			 * <b>Note:</b> For performance reasons, only appointments in the visible time range or nearby should be assigned.
			 */
			appointments : {type : "sap.ui.unified.CalendarAppointment", multiple : true, singularName : "appointment"},

			/**
			 * The appointments to be displayed at the top of the intervals (for example, for public holidays).
			 * Appointments outside the visible time frame are not rendered.
			 *
			 * Keep in mind that the <code>intervalHeaders</code> should always fill whole intervals. If they are shorter or longer
			 * than one interval, they are not displayed.
			 *
			 * <b>Note:</b> For performance reasons, only appointments in the visible time range or nearby should be assigned.
			 */
			intervalHeaders : {type : "sap.ui.unified.CalendarAppointment", multiple : true, singularName : "intervalHeader"},

			_nonWorkingDates : {type : "sap.ui.unified.DateRange", multiple : true, visibility : "hidden"}

		}
	}});

	/**
	 * Used to link the items (DateRange) in aggregation _nonWorkingDates to any PlanningCalendar specialDates of type NonWorking
	 * @private
	 */
	PlanningCalendarRow.PC_FOREIGN_KEY_NAME = "relatedToPCDateRange";

	/**
	 * Holds the name of the aggregation corresponding to non working dates
	 * @private
	 */
	PlanningCalendarRow.AGGR_NONWORKING_DATES_NAME = "_nonWorkingDates";

	// ************************************* PRIVATE CLASSES BEGIN *****************************************************
	var CalenderRowHeader = StandardListItem.extend("CalenderRowHeader", {

		metadata : {

			associations: {
				parentRow: { type: "sap.m.PlanningCalendarRow", multiple: false}
			}

		},

		setParentRow: function(sId) {

			this.setAssociation("parentRow", sId, true);

			if (!sId) {
				this._oRow = undefined;
			} else if (typeof sId == "string") {
				this._oRow = sap.ui.getCore().byId(sId);
			} else {
				this._oRow = sId;
			}

			return this;

		},

		renderer: Renderer.extend(StandardListItemRenderer)

	});

	/*global CalenderRowHeaderRenderer:true*/
	CalenderRowHeaderRenderer.openItemTag = function(oRm, oLI) {
		oRm.write("<div");
	};

	CalenderRowHeaderRenderer.closeItemTag = function(oRm, oLI) {
		oRm.write("</div>");
	};

	CalenderRowHeaderRenderer.renderTabIndex = function(oRm, oLI) {
	};

	/**
	 * A bridge between sap.m.PlanningCalendarRow and sap.m.Table item. Contains 2 cells:
	 * - so called "calendar row header" - used for employee names
	 * - so called "calendar row" - used to render the appointments corresponding to the before mentioned header
	 *
	 */
	var ColumnListItemInPlanningCalendar = ColumnListItem.extend("ColumnListItemInPlanningCalendar", {
		metadata: {
			associations : {
				planningCalendarRow : {type : "sap.m.PlanningCalendarRow", multiple : false, visibility : "hidden"}
			}
		},
		renderer: ColumnListItemRenderer
	});

	/**
	 * Takes care to ensure that the custom data given to the PlanningCalendarRow (sap.ui.core.Element) is used.
	 * @returns {*} the custom data
	 */
	ColumnListItemInPlanningCalendar.prototype.getCustomData = function() {
		return sap.ui.getCore().byId(this.getAssociation("planningCalendarRow")).getCustomData();
	};
	// ************************************* PRIVATE CLASSES END *******************************************

	PlanningCalendarRow.prototype.init = function(){

		var sId = this.getId();
		var oCalendarRowHeader = new CalenderRowHeader(sId + "-Head", {parentRow: this});
		var oCalendarRow = new CalendarRow(sId + "-CalRow", {
			checkResize: false,
			updateCurrentTime: false,
			ariaLabelledBy: sId + "-Head"
		});
		oCalendarRow._oPlanningCalendarRow = this;

		oCalendarRow.getAppointments = function() {

			if (this._oPlanningCalendarRow) {
				return this._oPlanningCalendarRow.getAppointments();
			}else {
				return [];
			}

		};

		oCalendarRow.getIntervalHeaders = function() {

			if (this._oPlanningCalendarRow) {
				return this._oPlanningCalendarRow.getIntervalHeaders();
			}else {
				return [];
			}

		};

		this._oColumnListItem = new ColumnListItemInPlanningCalendar(this.getId() + "-CLI", {
			cells: [ oCalendarRowHeader,
					 oCalendarRow],
			planningCalendarRow: this
		});

	};

	PlanningCalendarRow.prototype.exit = function(){

		if (this._oColumnListItem.getCells()[1]) {//destroy associated CalendarRow
			this._oColumnListItem.getCells()[1].destroy();
		}
		this._oColumnListItem.destroy();
		this._oColumnListItem = undefined;

	};

	PlanningCalendarRow.prototype.setTooltip = function(vTooltip){

		this.setAggregation("tooltip", vTooltip, true); // do not invalidate, only real rendered control must be invalidated
		this._oColumnListItem.getCells()[0].setTooltip(vTooltip);

		return this;

	};

	PlanningCalendarRow.prototype.setTitle = function(sTitle){

		this.setProperty("title", sTitle, true); // do not invalidate, only real rendered control must be invalidated
		this._oColumnListItem.getCells()[0].setTitle(sTitle);

		return this;

	};

	PlanningCalendarRow.prototype.setText = function(sText){

		this.setProperty("text", sText, true); // do not invalidate, only real rendered control must be invalidated
		this._oColumnListItem.getCells()[0].setDescription(sText);

		if (sText) {
			this._oColumnListItem.getCells()[1].addStyleClass("sapMPlanCalRowLarge");
		} else {
			this._oColumnListItem.getCells()[1].removeStyleClass("sapMPlanCalRowLarge");
		}

		return this;

	};

	PlanningCalendarRow.prototype.setIcon = function(sIcon){

		this.setProperty("icon", sIcon, true); // do not invalidate, only real rendered control must be invalidated
		this._oColumnListItem.getCells()[0].setIcon(sIcon);

		return this;

	};

	PlanningCalendarRow.prototype.setNonWorkingDays = function(aNonWorkingDays){

		this.setProperty("nonWorkingDays", aNonWorkingDays, true); // do not invalidate, only real rendered control must be invalidated
		this.getCalendarRow().setNonWorkingDays(aNonWorkingDays);

		return this;

	};

	PlanningCalendarRow.prototype.setNonWorkingHours = function(aNonWorkingHours){

		this.setProperty("nonWorkingHours", aNonWorkingHours, true); // do not invalidate, only real rendered control must be invalidated
		this.getCalendarRow().setNonWorkingHours(aNonWorkingHours);

		return this;

	};

	PlanningCalendarRow.prototype.invalidate = function(oOrigin) {

		if (!oOrigin || !(oOrigin instanceof sap.ui.unified.CalendarAppointment)) {
			Element.prototype.invalidate.apply(this, arguments);
		}else if (this._oColumnListItem) {
			// Appointment changed -> only invalidate internal CalendarRow (not if ColumnListItem is already destroyed)
			this.getCalendarRow().invalidate(oOrigin);
		}

	};

	// overwrite removing of appointments because invalidate don't get information about it
	PlanningCalendarRow.prototype.removeAppointment = function(vObject) {

		var oRemoved = this.removeAggregation("appointments", vObject, true);
		this.getCalendarRow().invalidate();
		return oRemoved;

	};

	PlanningCalendarRow.prototype.removeAllAppointments = function() {

		var aRemoved = this.removeAllAggregation("appointments", true);
		this.getCalendarRow().invalidate();
		return aRemoved;

	};

	PlanningCalendarRow.prototype.destroyAppointments = function() {

		var oDestroyed = this.destroyAggregation("appointments", true);
		this.getCalendarRow().invalidate();
		return oDestroyed;

	};

	PlanningCalendarRow.prototype.removeIntervalHeader = function(vObject) {

		var oRemoved = this.removeAggregation("intervalHeaders", vObject, true);
		this.getCalendarRow().invalidate();
		return oRemoved;

	};

	PlanningCalendarRow.prototype.removeAllIntervalHeaders = function() {

		var aRemoved = this.removeAllAggregation("intervalHeaders", true);
		this.getCalendarRow().invalidate();
		return aRemoved;

	};

	PlanningCalendarRow.prototype.destroyIntervalHeaders = function() {

		var oDestroyed = this.destroyAggregation("intervalHeaders", true);
		this.getCalendarRow().invalidate();
		return oDestroyed;

	};

	PlanningCalendarRow.prototype.setSelected = function(bSelected){

		this.setProperty("selected", bSelected, true);
		this._oColumnListItem.setSelected(bSelected);

		return this;

	};

	/**
	 * A <code>PlanningCalendarRow</code> is rendered inside a <code>sap.m.Table</code> as a <code>sap.m.ColumnListItem</code>.
	 *
	 * @returns {sap.m.ColumnListItem} <code>sap.m.ColumnListItem</code> that represents <code>PlanningCalendarRow</code> in the table.
	 * @private
	 */
	PlanningCalendarRow.prototype.getColumnListItem = function(){

		return this._oColumnListItem;

	};

	/**
	 * The <code>PlanningCalendarRow</code> appointments are rendered in a <ode>CalendarRow</code> control.
	 *
	 * @returns {sap.ui.uinified.CalendarRow} <code>sap.ui.uinified.CalendarRow</code> that renders <code>PlanningCalendarRow</code> appointments.
	 * @private
	 */
	PlanningCalendarRow.prototype.getCalendarRow = function(){
		if (!this._oColumnListItem) {
			return null;
		}
		return this._oColumnListItem.getCells()[1];

	};

	PlanningCalendarRow.prototype.applyFocusInfo = function (oFocusInfo) {

		// forward to CalendarRow
		this.getCalendarRow().applyFocusInfo(oFocusInfo);

		return this;

	};


	PlanningCalendarRow.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		if (CalendarRow.AGGR_NONWORKING_DATES_NAME === sAggregationName) {
			// forward to CalendarRow
			this.getCalendarRow().addAggregation(CalendarRow.AGGR_NONWORKING_DATES_NAME, this._buildCalendarRowDateRange(oObject),
				bSuppressInvalidate);
		}
		return Element.prototype.addAggregation.apply(this, arguments);
	};

	PlanningCalendarRow.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		if (PlanningCalendarRow.AGGR_NONWORKING_DATES_NAME === sAggregationName) {
			// forward to CalendarRow
			this.getCalendarRow().insertAggregation(CalendarRow.AGGR_NONWORKING_DATES_NAME, this._buildCalendarRowDateRange(oObject),
				iIndex, bSuppressInvalidate);
		 }

		return Element.prototype.insertAggregation.apply(this, arguments);
	 };

	PlanningCalendarRow.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		var aRemovableNonWorkingDate;

		if (PlanningCalendarRow.AGGR_NONWORKING_DATES_NAME === sAggregationName && this.getAggregation(PlanningCalendarRow.AGGR_NONWORKING_DATES_NAME)) {
			aRemovableNonWorkingDate = this.getCalendarRow().getAggregation(CalendarRow.AGGR_NONWORKING_DATES_NAME).filter(function(oNonWorkingDate) {
				return oNonWorkingDate.data(CalendarRow.PCROW_FOREIGN_KEY_NAME) === oObject.getId();
			});
			if (aRemovableNonWorkingDate.length) {
				jQuery.sap.assert(aRemovableNonWorkingDate.length == 1, "Inconsistency between PlanningCalendarRow " +
					"_nonWorkingDate instance and CalendarRow _nonWorkingDates instance. For PCRow instance " +
					"there are more than one(" + aRemovableNonWorkingDate.length + ") nonWorkingDates in CalendarRow ");
				this.getCalendarRow().removeAggregation("_nonWorkingDates", aRemovableNonWorkingDate[0]);
			}
		}
		return Element.prototype.removeAggregation.apply(this, arguments);
	};

	PlanningCalendarRow.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		if (PlanningCalendarRow.AGGR_NONWORKING_DATES_NAME === sAggregationName) {
			// forward to CalendarRow
			this.getCalendarRow().removeAllAggregation(CalendarRow.AGGR_NONWORKING_DATES_NAME, bSuppressInvalidate);
		}

		return Element.prototype.removeAllAggregation.apply(this, arguments);
	};

	PlanningCalendarRow.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
		if (PlanningCalendarRow.AGGR_NONWORKING_DATES_NAME === sAggregationName) {
			// forward to CalendarRow
			if (this.getCalendarRow()) {
				this.getCalendarRow().destroyAggregation(CalendarRow.AGGR_NONWORKING_DATES_NAME, bSuppressInvalidate);
			}
		}
		return Element.prototype.destroyAggregation.apply(this, arguments);
	};

	/**
	 * Clone from the passed DateRange and sets the foreign key to the source DateRange, that is used for cloning
	 * @param {sap.ui.unified.DateRange} oSource
	 * @returns {sap.ui.unified.DateRange}
	 * @private
	 */
	PlanningCalendarRow.prototype._buildCalendarRowDateRange = function (oSource) {
		var oRangeCopy = new DateRange();

		if (oSource.getStartDate()) {
			oRangeCopy.setStartDate(new Date(oSource.getStartDate().getTime()));
		}
		if (oSource.getEndDate()) {
			oRangeCopy.setEndDate(new Date(oSource.getEndDate().getTime()));
		}
		oRangeCopy.data(CalendarRow.PCROW_FOREIGN_KEY_NAME, oSource.getId());

		return oRangeCopy;
	};

	return PlanningCalendarRow;

}, /* bExport= */ true);
