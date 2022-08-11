/*!
 * ${copyright}
 */

// Provides class sap.ui.unified.calendar.IndexPicker
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/unified/calendar/Header",
	"sap/ui/unified/calendar/IndexPickerRenderer",
	'sap/ui/core/delegate/ItemNavigation',
	"sap/ui/events/KeyCodes"
],
	function(
		Control,
		Header,
		IndexPickerRenderer,
		ItemNavigation,
		KeyCodes
	) {
	"use strict";

	/**
	 * Constructor for a new IndexPicker.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Renders a grid with items representing indexes.
	 * This control serves for picking an item from a grid with items which are relative periods in Plannig Calendar.
	 * This is used inside the sap.m.PlanningCalendar relative views. Not for stand alone usage.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.93.0
	 * @alias sap.ui.unified.calendar.IndexPicker
	 */
	var IndexPicker = Control.extend("sap.ui.unified.calendar.IndexPicker", {
		metadata: {
			library: "sap.ui.unified",
			properties: {
				/**
				 * The starting index of the index picker.
				 */
				startIndex: { type: "int", group: "Data", defaultValue: 0 },

				/**
				 * The selected index of the index picker.
				 */
				selectedIndex: { type: "int", group: "Data", defaultValue: 0},

				/**
				 * A function responsible for cells formatting.
				 */
				formatter: { type: "object", group: "Data" },

				/**
				 * An integer reflecting the rows count of the index picker.
				 */
				rows: { type: "int", group: "Data", defaultValue: 4 },
				/**
				 * An integer reflecting the columns count of the index picker.
				 */
				columns: { type: "int", group: "Data", defaultValue: 3 },
				/**
				 * An integer reflecting the size of the interval presented in index picker.
				 */
				periodSize: { type: "int", group: "Data", defaultValue: 1}
			},
			aggregations: {
				header: { type: "sap.ui.unified.calendar.Header", multiple: false }
			},
			events: {
				/**
				 * Index selection changed
				 */
				select: {},

				/**
				 * Index focus changed
				 */
				focus: {}
			}
		},
		renderer: IndexPickerRenderer
	});

	IndexPicker.prototype.init = function(){
		this._initializeHeader();
		this.iCurrentIndex = 0;
	};

	IndexPicker.prototype.onBeforeRendering = function () {
		this.getHeader().setEnabledPrevious(this.getStartIndex() > 0);
	};

	IndexPicker.prototype.onAfterRendering = function() {
		_initItemNavigation.call(this);
	};

	IndexPicker.prototype._initializeHeader = function() {
		var oHeader = new Header(this.getId() + "--Head", {
			visibleButton1: false,
			visibleButton2: false
		});

		oHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oHeader.attachEvent("pressNext", this._handleNext, this);

		this.setAggregation("header", oHeader);
	};

	IndexPicker.prototype._handlePrevious = function() {
		this.goToPreviousPage();
	};

	IndexPicker.prototype.goToPreviousPage = function() {
		var oNewStartIndex = this.getStartIndex() - this.getRows() * this.getColumns();
		oNewStartIndex = Math.max(0, oNewStartIndex);

		this.setStartIndex(oNewStartIndex);
	};

	IndexPicker.prototype._handleNext = function() {
		this.goToNextPage();
	};

	IndexPicker.prototype.goToNextPage = function() {
		var oNewStartIndex = this.getStartIndex() + this.getRows() * this.getColumns();

		this.setStartIndex(oNewStartIndex);
	};

	IndexPicker.prototype.onmouseup = function(oEvent) {
		var sIndex = oEvent.target.getAttribute("data-sap-ui-index");

		if (!sIndex) {
			return;
		}

		this._selectIndex(parseInt(sIndex));
	};

	IndexPicker.prototype.onkeydown = function(oEvent) {
		if (oEvent.keyCode === KeyCodes.ENTER) {

			var sIndex = oEvent.target.getAttribute("data-sap-ui-index");

			if (!sIndex) {
				return;
			}

			this._selectIndex(parseInt(sIndex));
		}
	};

	IndexPicker.prototype.onkeyup = function(oEvent) {
		if (oEvent.keyCode === KeyCodes.SPACE) {
			oEvent.preventDefault();

			var sIndex = oEvent.target.getAttribute("data-sap-ui-index");

			if (!sIndex) {
				return;
			}

			this._selectIndex(parseInt(sIndex));
		}
	};

	IndexPicker.prototype._selectIndex = function(iIndex) {
		this.setSelectedIndex(iIndex);
		this.iCurrentIndex = 0;

		this.fireSelect({ index: iIndex });
	};

	IndexPicker.prototype._getFormatter = function() {
		return this.getFormatter() || defaultFormatter;
	};

	function defaultFormatter(iIndex) {
		return (iIndex + 1).toString();
	}

	function _initItemNavigation(){

		var iIndex = 0,
			bSelectedPresent = false,
			oRootDomRef = this.getDomRef(),
			aDomRefs = oRootDomRef.querySelectorAll(".sapMIPItem"),
			iColumns = this.getColumns();

		for ( var i = 0; i < aDomRefs.length; i++) {
			if (aDomRefs[i].getAttribute("data-sap-ui-index") === this.getSelectedIndex()) {
				iIndex = i;
				bSelectedPresent = true;
				break;
			}
		}

		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, _handleAfterFocus, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, this._handleBorderReached, this);
			this.addDelegate(this._oItemNavigation);
			if (iColumns > 1) {
				this._oItemNavigation.setHomeEndColumnMode(true, true);
			}
			this._oItemNavigation.setDisabledModifiers({
				sapnext : ["alt"],
				sapprevious : ["alt"],
				saphome : ["alt"],
				sapend : ["alt"]
			});
			this._oItemNavigation.setCycling(false);
			this._oItemNavigation.setColumns(iColumns, true);
		}

		this._oItemNavigation.setRootDomRef(oRootDomRef);
		this._oItemNavigation.setItemDomRefs(aDomRefs);
		if (!bSelectedPresent){
			iIndex = this.iCurrentIndex % aDomRefs.length;
		}
		this._oItemNavigation.setFocusedIndex(iIndex);
		this._oItemNavigation.focusItem(iIndex);
		this._oItemNavigation.setPageSize(aDomRefs.length); // to make sure that pageup/down goes out of month

	}

	function _handleAfterFocus(oControlEvent){

		var iIndex = oControlEvent.getParameter("index");
		var oEvent = oControlEvent.getParameter("event");

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		var oFocusedIndex = oControlEvent.getParameter("index");

		var aDomRefs = this._oItemNavigation.getItemDomRefs();

		// find out what index was focused
		var oDomRef = aDomRefs[iIndex];

		this.iCurrentIndex = oFocusedIndex;

		oFocusedIndex = oDomRef.getAttribute("data-sap-ui-index");

		this.fireFocus({index: oFocusedIndex});
	}

	IndexPicker.prototype._handleBorderReached = function(oControlEvent){

		var oEvent = oControlEvent.getParameter("event");
		var oFocusedIndex = parseInt(oEvent.target.getAttribute("data-sap-ui-index"));
		var iIndexToFocus = oControlEvent.getParameter("index") ;

		if (oEvent.type) {
			switch (oEvent.type) {
			case "sapnext":
			case "sapnextmodifiers":
				if (oEvent.keyCode === KeyCodes.ARROW_DOWN) {
					oFocusedIndex += this.getColumns();
					iIndexToFocus += this.getColumns();
				} else {
					oFocusedIndex += 1;
					iIndexToFocus += 1;
				}

				this.goToNextPage();
				break;

			case "sapprevious":
			case "sappreviousmodifiers":
				if (oEvent.keyCode === KeyCodes.ARROW_UP) {
					oFocusedIndex -= this.getColumns();
					iIndexToFocus -= this.getColumns();
				} else {
					oFocusedIndex -= 1;
					iIndexToFocus -= 1;
				}

				this.goToPreviousPage();
				break;

			default:
				break;
			}

			var aDomRefs = this._oItemNavigation.getItemDomRefs();
			iIndexToFocus = Math.abs(aDomRefs.length - Math.abs(iIndexToFocus));
			this.iCurrentIndex = iIndexToFocus;
			this._oItemNavigation.focusItem(aDomRefs[iIndexToFocus]);
			this.fireFocus({index: oFocusedIndex});
		}

	};

	return IndexPicker;

});