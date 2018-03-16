/*
 * ! ${copyright}
 */
sap.ui.define(['sap/ui/core/Control', 'sap/ui/core/Icon', './ColumnHeaderRenderer'], function(Control, Icon, ColumnHeaderRenderer) {
	"use strict";

	/**
	 * Constructor for the control.
	 * @param {string} [sId] id for the new control.
	 * @param {string} [mSettings] initial settings for the new control.
	 *
	 * @class
	 * The <code>ColumnHeader</code> control provides the capabilities to perform sorting, filter and grouping on a table column.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @since 1.52
	 * @private
	 * @alias sap.m.ColumnHeader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnHeader = Control.extend("sap.m.ColumnHeader", /** @lends sap.m.ColumnHeader.prototype */
	{
		library: "sap.m",
		metadata: {
			properties: {
				/**
				 * Defines title for the <code>ColumnHeader</code> control.
				 */
				text: {
					type: "string",
					defaultValue: null
				},

				/**
				 * This property can be used to predefine sorting
				 */
				sorted: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the sort order (Ascending/Descending).
				 */
				sortOrder: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Defines whether filters are applied.
				 */
				filtered: {
					type: "boolean",
					defaultValue: false
				}
			},
			defaultAggregations: "viewSettingsPopover",
			aggregations: {
				/**
				 * <code>ViewSettingsPopover</code> control to be displayed with the <code>ColumnHeader</code> control.
				 */
				viewSettingsPopover: {
					type: "sap.m.ViewSettingsPopover",
					multiple: false
				},

				_sortIcon: {
					type: "sap.ui.core.Icon",
					multiple: false,
					visibility: "hidden"
				},

				_filterIcon: {
					type: "sap.ui.core.Icon",
					multiple: false,
					visibility: "hidden"
				}
			}
		}
	});

	/**
	 * Sets the <code>ViewSettingsAggregation</code> aggregation for the <code>ColumnHeader</code> control.
	 * @private
	 */
	ColumnHeader.prototype.setViewSettingsPopover = function(oViewSettingsPopover) {
		// the property should be made Public when the control is made public
		this.setAggregation("viewSettingsPopover", oViewSettingsPopover, true);
		this._attachViewSettingsPopoverEvents();
		return this;
	};

	/**
	 * Sets the sort order as well as sets the required sort icon.
	 */
	ColumnHeader.prototype.setSortOrder = function(sSortOrder) {
		// the property should be made Public when the control is made public
		this.setProperty("sortOrder", sSortOrder);

		var sIconUrl = sSortOrder === "Ascending" ? "sap-icon://sort-ascending" : "sap-icon://sort-descending";
		var oSortIcon = this.getAggregation("_sortIcon");
		if (!oSortIcon) {
			this.setAggregation("_sortIcon", new Icon({
				src: sIconUrl,
				visible: this.getSorted()
			}));
		} else {
			oSortIcon.setSrc(sIconUrl);
		}

		return this;
	};

	/**
	 * Defines if sorting is applied and sets the sort icon on the <code>ColumnHeader</code> control.
	 */
	ColumnHeader.prototype.setSorted = function(bSorted) {
		this.setProperty("sorted", bSorted);
		var oSortIcon = this.getAggregation("_sortIcon");

		if (!bSorted && !oSortIcon) {
			return this;
		}

		if (bSorted) {
			if (!oSortIcon) {
				this.setAggregation("_sortIcon", new Icon({
					src: this.getSortOrder() === "Ascending" ? "sap-icon://sort-ascending" : "sap-icon://sort-descending"
				}));
			} else {
				oSortIcon.setVisible(true);
			}
		} else {
			oSortIcon.setVisible(false);
		}

		return this;
	};

	/**
	 * Defines if filtering is applied and sets the filter icon on the <code>ColumnHeader</code> control.
	 */
	ColumnHeader.prototype.setFiltered = function(bFiltered) {
		// the property should be made Public when the control is made public
		this.setProperty("filtered", bFiltered);
		var oFilterIcon = this.getAggregation("_filterIcon");

		if (!bFiltered && !oFilterIcon) {
			return this;
		}

		if (bFiltered) {
			if (!oFilterIcon) {
				this.setAggregation("_filterIcon", new Icon({
					src: "sap-icon://filter"
				}));
			} else {
				oFilterIcon.setVisible(true);
			}
		} else {
			oFilterIcon.setVisible(false);
		}

		return this;
	};

	/**
	 * Sets the adapter for the <code>ColumnHeader</code> control.
	 * @param {object} oAdapter table adapter.
	 * @private
	 */
	ColumnHeader.prototype.setTableAdapter = function(oAdapter) {
		this._oAdapter = oAdapter;
	};

	/**
	 * Get the column adapter based on the adapter type.
	 * Currently defaulted to ResponsiveTableAdapter.
	 *
	 * @returns {oAdapter} adapter to be used.
	 * @private
	 */
	ColumnHeader.prototype.getTableAdapter = function() {
		return this._oAdapter || {
			interactive: true,
			rowAggregation: "items"
		};
	};

	/**
	 * Click event for opening the <code>ViewSettingsPopover</code> control.
	 * @param {object} oEvent Triggers the opening of the <code>ViewSettingsPopover</code> control.
	 * @private
	 */
	ColumnHeader.prototype.onclick = function(oEvent) {
		if (this._isInteractive()) {
			this._openColumnActions();
		}
	};

	ColumnHeader.prototype.onsapselect = ColumnHeader.prototype.onclick;

	/**
	 * Handler for opening the ViewSettingsPopover.
	 * @private
	 */
	ColumnHeader.prototype._openColumnActions = function() {
		var oViewSettingsPopover = this.getViewSettingsPopover();
		if (oViewSettingsPopover != null) {
			var $this = this.$();
			oViewSettingsPopover.openBy(this);
			// overwrite the popover position to open over the Column
			oViewSettingsPopover._getPopover(this).setOffsetY(-$this.outerHeight());
		}
	};

	/**
	 * This function is used to attach events of the <code>ViewSettingsPopover</code> control.
	 * @private
	 */
	ColumnHeader.prototype._attachViewSettingsPopoverEvents = function() {
		var oViewSettingsPopover = this.getViewSettingsPopover();
		if (oViewSettingsPopover) {
			this._detachViewSettingsPopoverEvents(oViewSettingsPopover);
			oViewSettingsPopover.attachSortSelected(this.onSortSelected, this);
			oViewSettingsPopover.attachFilterSelected(this.onFilterSelected, this);
		}
	};

	/**
	 * This function is used to detach events of the <code>ViewSettingsPopover</code> control.
	 * @param {object} oViewSettingsPopover ViewSettingsPopover.
	 * @private
	 */
	ColumnHeader.prototype._detachViewSettingsPopoverEvents = function(oViewSettingsPopover) {
		oViewSettingsPopover.detachSortSelected(this.onSortSelected, this);
		oViewSettingsPopover.detachFilterSelected(this.onFilterSelected, this);
	};

	/**
	 * Sort functionality.
	 * @private
	 */
	ColumnHeader.prototype.onSortSelected = function() {
		// TBD: viewSettingsPopover do not provide parameters for getting the sort order
		// should be discussed with viewSettingsPopover colleagues.
		if (!this.getSorted()) {
			this.setSorted(true);
		}

		if (this.getSortOrder() === "" || this.getSortOrder() === "Descending") {
			this.setSortOrder("Ascending");
		} else {
			this.setSortOrder("Descending");
		}
	};

	/**
	 * Filter functionality.
	 * @private
	 */
	ColumnHeader.prototype.onFilterSelected = function() {
		// TBD: ViewSettingsPopover does not provide event for clearing the Filters
		// this is also needed so that the application can react on it and clear the filtering on the table
		// should be discussed with ViewSettingsPopover colleagues
		this.setFiltered(true);
	};

	ColumnHeader.prototype.getAccessibilityInfo = function() {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			sAnnouncement = this.getText() + " ";

		if (this._isInteractive()) {
			if (this.getSortOrder()) {
				sAnnouncement += oBundle.getText("COLUMNHEADER_SORTED") + " ";
				sAnnouncement += (this.getSortOrder() === "Ascending" ? oBundle.getText("COLUMNHEADER_SORTED_ASCENDING") : oBundle.getText("COLUMNHEADER_SORTED_DESCENDING")) + " ";
			}

			if (this.getFiltered()) {
				sAnnouncement += oBundle.getText("COLUMNHEADER_FILTERED") + " ";
			}

			sAnnouncement += oBundle.getText("COLUMNHEADER_ACCESS_COLUMN_ACTIONS");

			return {
				role: "button",
				focusable: true,
				description: sAnnouncement
			};
		}

		return {
			focusable: false,
			description: sAnnouncement
		};
	};

	ColumnHeader.prototype._isInteractive = function() {
		return this.getTableAdapter().interactive && !!this.getViewSettingsPopover();
	};

	ColumnHeader.prototype.exit = function() {
		this._oAdapter = null;
	};

	return ColumnHeader;
});