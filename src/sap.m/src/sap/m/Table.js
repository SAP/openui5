/*!
 * ${copyright}
 */

// Provides control sap.m.Table.
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/Device",
	"./library",
	"./ListBase",
	"./ListItemBase",
	"./CheckBox",
	"./TableRenderer"
],
	function(jQuery, Device, library, ListBase, ListItemBase, CheckBox, TableRenderer) {
	"use strict";


	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = library.ListKeyboardMode;

	// shortcut for sap.m.ListGrowingDirection
	var ListGrowingDirection = library.ListGrowingDirection;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	// shortcut for sap.m.PopinLayout
	var PopinLayout = library.PopinLayout;

	// shortcut for sap.m.Sticky
	var Sticky = library.Sticky;


	/**
	 * Constructor for a new Table.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * <code>sap.m.Table</code> control provides a set of sophisticated and convenience functions for responsive table design.
	 * To render the <code>sap.m.Table</code> properly, the order of the <code>columns</code> aggregation should match with the order of the items <code>cells</code> aggregation. Also <code>sap.m.Table</code> requires at least one visible <code>sap.m.Column</code> in <code>columns</code> aggregation.
	 * For mobile devices, the recommended limit of table rows is 100 (based on 4 columns) to assure proper performance. To improve initial rendering on large tables, use the <code>growing</code> feature.
	 *
	 * See section "{@link topic:5eb6f63e0cc547d0bdc934d3652fdc9b Creating Tables}" and "{@link topic:38855e06486f4910bfa6f4485f7c2bac Configuring Responsive Behavior of a Table}"
	 * in the documentation for an introduction to <code>sap.m.Table</code> control.
	 *
	 *
	 * @extends sap.m.ListBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.Table
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Table = ListBase.extend("sap.m.Table", /** @lends sap.m.Table.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Sets the background style of the table. Depending on the theme, you can change the state of the background from <code>Solid</code> to <code>Translucent</code> or to <code>Transparent</code>.
			 */
			backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Translucent},

			/**
			 * Defines the algorithm to be used to layout the table cells, rows, and columns.
			 * By default, a table is rendered with fixed layout algorithm. This means the horizontal layout only depends on the table's width and the width of the columns, not the contents of the cells. Cells in subsequent rows do not affect column widths. This allows a browser to layout the table faster than the auto table layout since the browser can begin to display the table once the first row has been analyzed.
			 *
			 * When this property is set to <code>false</code>, <code>sap.m.Table</code> is rendered with auto layout algorithm. This means, the width of the table and its cells depends on the contents of the cells. The column width is set by the widest unbreakable content inside the cells. This can make the rendering slow, since the browser needs to read through all the content in the table before determining the final layout.
			 * <b>Note:</b> Since <code>sap.m.Table</code> does not have its own scrollbars, setting <code>fixedLayout</code> to false can force the table to overflow, which may cause visual problems. It is suggested to use this property when a table has a few columns in wide screens or within the horizontal scroll container (e.g <code>sap.m.Dialog</code>) to handle overflow.
			 * In auto layout mode the <code>width</code> property of <code>sap.m.Column</code> is taken into account as a minimum width.
			 * @since 1.22
			 */
			fixedLayout : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Setting this property to <code>true</code> will show an overlay on top of the table content and prevents the user interaction with it.
			 * @since 1.22.1
			 */
			showOverlay : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Enables alternating table row colors.
			 * <b>Note:</b> This property can only be used with the Belize and Belize Deep themes.
			 * Alternate row coloring is not available for the High Contrast Black/White themes.
			 * @since 1.52
			 */
			alternateRowColors : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Defines the layout in which the table pop-in rows are rendered.
			 * <b>Note:</b> The <code>demandPopin</code> and <code>minScreenWidth</code> properties of the <code>Column</code> control must be configured appropriately.
			 * @since 1.52
			 */
			popinLayout : {type : "sap.m.PopinLayout", group : "Appearance", defaultValue : PopinLayout.Block},

			/**
			 * Defines the section of the <code>sap.m.Table</code> control that remains fixed at the top of the page during vertical scrolling as long as the table is in the viewport.
			 *
			 * <b>Note:</b> There is limited browser support, hence the API is in experimental state.
			 * Browsers that currently support this feature are Chrome (desktop and mobile), Safari (desktop and mobile) and Edge 41.
			 *
			 * There are also some known issues with respect to the scrolling behavior. A few are given below:
			 *
			 * If the table is placed in certain layout containers, for example, the <code>sap.ui.layout.Grid</code> control,
			 * the column headers are not fixed at the top of the viewport. Similar behavior is also observed with the <code>sap.m.ObjectPage</code> control.
			 *
			 * This API should not be used in a productive environment.
			 *
			 * @experimental As of 1.54
			 * @since 1.54
			 */
			sticky : {type : "sap.m.Sticky", group : "Appearance", defaultValue : Sticky.None}
		},
		aggregations : {

			/**
			 * Defines the columns of the table.
			 */
			columns : {type : "sap.m.Column", multiple : true, singularName : "column"}
		},
		events : {
			/**
			 * Fired when the context menu is opened.
			 * When the context menu is opened, the binding context of the item is set to the given <code>contextMenu</code>.
			 * @since 1.54
			 */
			beforeOpenContextMenu : {
				allowPreventDefault : true,
				parameters : {
					/**
					 * Item in which the context menu was opened.
					 */
					listItem : {type : "sap.m.ColumnListItem"},
					/**
					 * Column in which the context menu was opened.
					 * <b>Note:</b> This parameter might be undefined for the items that are not part of a column definition.
					 */
					column : {type : "sap.m.Column"}
				}
			}
		},
		designtime: "sap/m/designtime/Table.designtime"
	}});

	// class name for the navigation items
	Table.prototype.sNavItemClass = "sapMListTblRow";

	Table.prototype.init = function() {
		this._iItemNeedsColumn = 0;
		ListBase.prototype.init.call(this);
	};

	Table.prototype.onBeforeRendering = function() {
		ListBase.prototype.onBeforeRendering.call(this);
		this._ensureColumnsMedia();
		this._notifyColumns("ItemsRemoved");
	};

	Table.prototype._ensureColumnsMedia = function() {
		this.getColumns().forEach(function (oColumn) {
			if (oColumn._bShouldAddMedia) {
				oColumn._addMedia();
			}
		});
	};

	Table.prototype.onAfterRendering = function() {
		ListBase.prototype.onAfterRendering.call(this);
		this.updateSelectAllCheckbox();
		this._renderOverlay();
	};

	Table.prototype._renderOverlay = function() {
		var $this = this.$(),
			$overlay = $this.find(".sapMTableOverlay"),
			bShowOverlay = this.getShowOverlay();
		if (bShowOverlay && $overlay.length === 0) {
			$overlay = jQuery("<div>").addClass("sapUiOverlay sapMTableOverlay").css("z-index", "1");
			$this.append($overlay);
		} else if (!bShowOverlay) {
			$overlay.remove();
		}
	};

	Table.prototype.setShowOverlay = function(bShow) {
		this.setProperty("showOverlay", bShow, true);
		this._renderOverlay();
		return this;
	};

	Table.prototype.exit = function () {
		ListBase.prototype.exit.call(this);
		if (this._selectAllCheckBox) {
			this._selectAllCheckBox.destroy();
			this._selectAllCheckBox = null;
		}
	};

	Table.prototype.destroyItems = function() {
		this._notifyColumns("ItemsRemoved");
		return ListBase.prototype.destroyItems.apply(this, arguments);
	};

	Table.prototype.removeAllItems = function() {
		this._notifyColumns("ItemsRemoved");
		return ListBase.prototype.removeAllItems.apply(this, arguments);
	};

	Table.prototype.removeSelections = function() {
		ListBase.prototype.removeSelections.apply(this, arguments);
		this.updateSelectAllCheckbox();
		return this;
	};

	Table.prototype.selectAll = function () {
		ListBase.prototype.selectAll.apply(this, arguments);
		this.updateSelectAllCheckbox();
		return this;
	};

	/**
	 * Getter for aggregation columns.
	 *
	 * @param {Boolean} [bSort] set true to get the columns in an order that respects personalization settings
	 * @returns {sap.m.Column[]} columns of the Table
	 * @public
	 */
	Table.prototype.getColumns = function(bSort) {
		var aColumns = this.getAggregation("columns", []);
		if (bSort) {
			aColumns.sort(function(c1, c2) {
				return c1.getOrder() - c2.getOrder();
			});
		}
		return aColumns;
	};

	/*
	 * This hook method is called if growing feature is enabled and after new page loaded
	 * @overwrite
	 */
	Table.prototype.onAfterPageLoaded = function() {
		this.updateSelectAllCheckbox();
		if (this.getAlternateRowColors()) {
			var $tblBody = this.$("tblBody").removeClass();
			$tblBody.addClass(this._getAlternateRowColorsClass());
		}
		ListBase.prototype.onAfterPageLoaded.apply(this, arguments);
	};

	/*
	 * This hook method is called from renderer to determine whether items should render or not
	 * @overwrite
	 */
	Table.prototype.shouldRenderItems = function() {
		var bHasVisibleColumns = this.getColumns().some(function(oColumn) {
			return oColumn.getVisible();
		});

		if (!bHasVisibleColumns) {
			jQuery.sap.log.warning("No visible columns found in " + this);
		}

		return bHasVisibleColumns;
	};

	// this gets called when item type column requirement is changed
	Table.prototype.onItemTypeColumnChange = function(oItem, bNeedsTypeColumn) {
		this._iItemNeedsColumn += (bNeedsTypeColumn ? 1 : -1);

		// update type column visibility
		if (this._iItemNeedsColumn == 1 && bNeedsTypeColumn) {
			this._setTypeColumnVisibility(true);
		} else if (this._iItemNeedsColumn == 0) {
			this._setTypeColumnVisibility(false);
		}
	};

	// this gets called when selected property of the item is changed
	Table.prototype.onItemSelectedChange = function(oItem, bSelect) {
		ListBase.prototype.onItemSelectedChange.apply(this, arguments);
		jQuery.sap.delayedCall(0, this, function() {
			this.updateSelectAllCheckbox();
		});
	};

	/*
	 * Returns the <table> DOM reference
	 * @protected
	 */
	Table.prototype.getTableDomRef = function() {
		return this.getDomRef("listUl");
	};

	/*
	 * Returns items container DOM reference
	 * @overwrite
	 */
	Table.prototype.getItemsContainerDomRef = function() {
		return this.getDomRef("tblBody");
	};

	/*
	 * Sets DOM References for keyboard navigation
	 * @overwrite
	 */
	Table.prototype.setNavigationItems = function(oItemNavigation) {
		var $Header = this.$("tblHeader");
		var $Footer = this.$("tblFooter");
		var $Rows = this.$("tblBody").children(".sapMLIB");

		var aItemDomRefs = $Header.add($Rows).add($Footer).get();
		oItemNavigation.setItemDomRefs(aItemDomRefs);

		// header and footer are in the item navigation but
		// initial focus should be at the first item row
		if (oItemNavigation.getFocusedIndex() == -1) {
			if (this.getGrowing() && this.getGrowingDirection() == ListGrowingDirection.Upwards) {
				oItemNavigation.setFocusedIndex(aItemDomRefs.length - 1);
			} else {
				oItemNavigation.setFocusedIndex($Header[0] ? 1 : 0);
			}
		}
	};

	/*
	 * Determines for growing feature to handle all data from scratch
	 * if column merging and growing feature are active at the same time
	 * it is complicated to remerge or demerge columns when we
	 * insert or delete items from the table with growing diff logic
	 *
	 * @protected
	 */
	Table.prototype.checkGrowingFromScratch = function() {
		// no merging for popin case
		if (this.hasPopin()) {
			return false;
		}

		// check visibility and merge feature of columns
		return this.getColumns().some(function(oColumn) {
			return oColumn.getVisible() && oColumn.getMergeDuplicates();
		});
	};

	/*
	 * This method is called asynchronously if resize event comes from column
	 * @protected
	 */
	Table.prototype.onColumnResize = function(oColumn) {
		// if list did not have pop-in and will not have pop-in
		// then we do not need re-render, we can just change display of column
		if (!this.hasPopin() && !this._mutex) {
			var hasPopin = this.getColumns().some(function(col) {
				return col.isPopin();
			});

			if (!hasPopin) {
				oColumn.setDisplayViaMedia(this.getTableDomRef());
				return;
			}
		}

		this._dirty = this._getMediaContainerWidth() || window.innerWidth;
		if (!this._mutex) {
			var clean = this._getMediaContainerWidth() || window.innerWidth;
			this._mutex = true;
			this.rerender();

			// do not re-render if resize event comes so frequently
			jQuery.sap.delayedCall(200, this, function() {
				// but check if any event come during the wait-time
				if (this._dirty != clean) {
					this._dirty = 0;
					this.rerender();
				}
				this._mutex = false;
			});
		}
	};

	/*
	 * This method is called from Column control when column visibility is changed via CSS media query
	 *
	 * @param {boolean} bColVisible whether column is now visible or not
	 * @protected
	 */
	Table.prototype.setTableHeaderVisibility = function(bColVisible) {
		if (!this.getDomRef()) {
			return;
		}

		// find first visible column
		var $headRow = this.$("tblHeader"),
			bHeaderVisible = !$headRow.hasClass("sapMListTblHeaderNone"),
			aVisibleColumns = $headRow.find(".sapMListTblCell:visible"),
			$firstVisibleCol = aVisibleColumns.eq(0);

		// check if only one column is visible
		if (aVisibleColumns.length == 1) {
			$firstVisibleCol.width("");	// cover the space
		} else {
			// set original width of columns
			aVisibleColumns.each(function() {
				this.style.width = this.getAttribute("data-sap-width") || "";
			});
		}

		// update the visible column count and colspan
		// highlight and navigation columns are getting rendered always
		this._colCount = aVisibleColumns.length + 2 + !!sap.m.ListBaseRenderer.ModeOrder[this.getMode()];
		this.$("tblBody").find(".sapMGHLICell").attr("colspan", this.getColSpan());
		this.$("nodata-text").attr("colspan", this.getColCount());

		// force IE to repaint in fixed layout mode
		if (this.getFixedLayout()) {
			this._forceStyleChange();
		}

		// remove or show column header row(thead) according to column visibility value
		if (!bColVisible && bHeaderVisible) {
			$headRow[0].className = "sapMListTblRow sapMListTblHeader";
			this._headerHidden = false;
		} else if (bColVisible && !bHeaderVisible && !aVisibleColumns.length) {
			$headRow[0].className = "sapMListTblHeaderNone";
			this._headerHidden = true;
		}
	};

	// force IE to repaint
	Table.prototype._forceStyleChange = function() {
		if (Device.browser.msie) {
			var oTableStyle = this.getTableDomRef().style;
			oTableStyle.listStyleType = "circle";
			window.setTimeout(function() { oTableStyle.listStyleType = "none"; }, 0);
		}
	};

	// updates the type column visibility and sets the aria flag
	Table.prototype._setTypeColumnVisibility = function(bVisible) {
		jQuery(this.getTableDomRef()).toggleClass("sapMListTblHasNav", bVisible);
	};

	// notify all columns with given action and param
	Table.prototype._notifyColumns = function(sAction, vParam1, vParam2) {
		this.getColumns().forEach(function(oColumn) {
			oColumn["on" + sAction](vParam1, vParam2);
		});
	};

	/**
	 * This method takes care of the select all checkbox for table lists. It
	 * will automatically be created on demand and returned when needed
	 *
	 * @private
	 * @return {sap.m.CheckBox} reference to the internal select all checkbox
	 */
	Table.prototype._getSelectAllCheckbox = function() {
		return this._selectAllCheckBox || (this._selectAllCheckBox = new CheckBox({
			id: this.getId("sa"),
			activeHandling: false
		}).addStyleClass("sapMLIBSelectM").setParent(this, null, true).attachSelect(function () {
			if (this._selectAllCheckBox.getSelected()) {
				this.selectAll(true);
			} else {
				this.removeSelections(false, true);
			}
		}, this).setTabIndex(-1));
	};

	/*
	 * Internal public function to update the selectAll checkbox
	 * according to the current selection on the list items.
	 *
	 * @protected
	 */
	Table.prototype.updateSelectAllCheckbox = function () {
		// checks if the list is in multi select mode and has selectAll checkbox
		if (this._selectAllCheckBox && this.getMode() === "MultiSelect") {
			var aItems = this.getItems(),
				iSelectedItemCount = this.getSelectedItems().length,
				iSelectableItemCount = aItems.filter(function(oItem) {
					return oItem.isSelectable();
				}).length;

			// set state of the checkbox by comparing item length and selected item length
			this._selectAllCheckBox.setSelected(aItems.length > 0 && iSelectedItemCount == iSelectableItemCount);
		}
	};

	/**
	 * This method is a hook for the RenderManager that gets called
	 * during the rendering of child Controls. It allows to add,
	 * remove and update existing accessibility attributes (ARIA) of
	 * those controls.
	 *
	 * @param {sap.ui.core.Control} oElement - The Control that gets rendered by the RenderManager
	 * @param {Object} mAriaProps - The mapping of "aria-" prefixed attributes
	 * @protected
	 */
	Table.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {
		if (oElement == this._selectAllCheckBox) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			mAriaProps.label = oBundle.getText("TABLE_CHECKBOX_SELECT_ALL");
		}
	};

	/*
	 * Returns colspan for all columns except navigation
	 * Because we render navigation always even it is empty
	 * @protected
	 */
	Table.prototype.getColSpan = function() {
		return (this._colCount || 1 ) - 1;
	};

	/*
	 * Returns the number of total columns
	 * @protected
	 */
	Table.prototype.getColCount = function() {
		return (this._colCount || 0);
	};

	/*
	 * Returns whether or not the table is in pop-in mode
	 * @protected
	 */
	Table.prototype.hasPopin = function() {
		return !!this._hasPopin;
	};

	/*
	 * Returns whether given event is initialized within header row or not
	 * @protected
	 */
	Table.prototype.isHeaderRowEvent = function(oEvent) {
		var $Header = this.$("tblHeader");
		return !!jQuery(oEvent.target).closest($Header, this.getTableDomRef()).length;
	};

	/*
	 * Returns whether give event is initialized within footer row or not
	 * @protected
	 */
	Table.prototype.isFooterRowEvent = function(oEvent) {
		var $Footer = this.$("tblFooter");
		return !!jQuery(oEvent.target).closest($Footer, this.getTableDomRef()).length;
	};

	// returns accessibility role
	Table.prototype.getAccessibilityType = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_TABLE");
	};

	// custom footer text announcement is only for tables
	Table.prototype.getAccessibilityDescription = function() {
		return ListBase.prototype.getAccessibilityDescription.call(this) + " " + this.getFooterText();
	};

	Table.prototype._setHeaderAnnouncement = function() {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			sAnnouncement = oBundle.getText("ACC_CTR_TYPE_HEADER_ROW") + " ";

		if (this.isAllSelectableSelected()) {
			sAnnouncement += oBundle.getText("LIST_ALL_SELECTED");
		}

		this.getColumns(true).forEach(function(oColumn, i) {
			// only set the header announcement for visible columns
			if (!oColumn.getVisible()) {
				return;
			}

			var oHeader = oColumn.getHeader();
			if (oHeader && oHeader.getVisible()) {
				sAnnouncement += ListItemBase.getAccessibilityText(oHeader) + " ";
			}
		});

		this.updateInvisibleText(sAnnouncement);
	};

	Table.prototype._setFooterAnnouncement = function() {
		var sAnnouncement = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_FOOTER_ROW") + " ";
		this.getColumns(true).forEach(function(oColumn, i) {
			// only set the footer announcement for visible columns
			if (!oColumn.getVisible()) {
				return;
			}

			var oFooter = oColumn.getFooter();
			if (oFooter && oFooter.getVisible()) {
				// announce header as well
				var oHeader = oColumn.getHeader();
				if (oHeader && oHeader.getVisible()) {
					sAnnouncement += ListItemBase.getAccessibilityText(oHeader) + " ";
				}

				sAnnouncement += ListItemBase.getAccessibilityText(oFooter) + " ";
			}
		});

		this.updateInvisibleText(sAnnouncement);
	};

	// keyboard handling
	Table.prototype.onsapspace = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		// toggle select all header checkbox and fire its event
		if (this._selectAllCheckBox && oEvent.target === this.getDomRef("tblHeader")) {
			this._selectAllCheckBox.setSelected(!this._selectAllCheckBox.getSelected()).fireSelect();
			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};

	// Handle tab key
	Table.prototype.onsaptabnext = function(oEvent) {
		if (oEvent.isMarked() || this.getKeyboardMode() == ListKeyboardMode.Edit) {
			return;
		}

		var $Row = jQuery();
		if (oEvent.target.id == this.getId("nodata")) {
			$Row = this.$("nodata");
		} else if (this.isHeaderRowEvent(oEvent)) {
			$Row = this.$("tblHeader");
		} else if (this.isFooterRowEvent(oEvent)) {
			$Row = this.$("tblFooter");
		}

		var oLastTabbableDomRef = $Row.find(":sapTabbable").get(-1) || $Row[0];
		if (oEvent.target === oLastTabbableDomRef) {
			this.forwardTab(true);
			oEvent.setMarked();
		}
	};

	// Handle shift-tab key
	Table.prototype.onsaptabprevious = function(oEvent) {
		if (oEvent.isMarked() || this.getKeyboardMode() == ListKeyboardMode.Edit) {
			return;
		}

		var sTargetId = oEvent.target.id;
		if (sTargetId == this.getId("nodata") ||
			sTargetId == this.getId("tblHeader") ||
			sTargetId == this.getId("tblFooter")) {
			this.forwardTab(false);
		} else if (sTargetId == this.getId("trigger")) {
			this.focusPrevious();
			oEvent.preventDefault();
		}
	};

	// check for css sticky support in browsers
	Table.getStickyTableSupport = function() {
		var oBrowser = Device.browser;
		if (oBrowser.safari || (oBrowser.firefox && oBrowser.version >= 59)) {
			return "TR";
		}

		if (oBrowser.chrome || (oBrowser.edge && oBrowser.version >= 16)) {
			return "TH";
		}

		return "";
	};

	// returns the class to be added to sticky table for <tr> or <th> elements
	Table.prototype.getStickyStyleClass = function() {
		var sStickySupport = Table.getStickyTableSupport();
		if (!sStickySupport || this.getSticky() === Sticky.None) {
			return;
		}

		return "sapMTableStickyColHdr" + sStickySupport;
	};

	Table.prototype.onfocusin = function(oEvent) {
		var oTarget = oEvent.target;
		if (oTarget.id === this.getId("tblHeader")) {
			this._setHeaderAnnouncement();
		} else if (oTarget.id === this.getId("tblFooter")) {
			this._setFooterAnnouncement();
		}

		if (this._bThemeChanged) {
			// force IE to repaint if theme changed
			this._bThemeChanged = false;
			this._forceStyleChange();
		}

		ListBase.prototype.onfocusin.call(this, oEvent);
	};

	// gets the sticky header position and scrolls the page so that the item is completely visible when focused
	Table.prototype._handleStickyHeaderItemFocus = function(oItem) {
		var oScrollDelegate = library.getScrollDelegate(this);
		if (!oScrollDelegate) {
			return;
		}

		var oTblHeader = this.getDomRef("tblHeader"),
			oTheadRect = oTblHeader.parentElement.getBoundingClientRect(),
			oTHRect = oTblHeader.firstChild.getBoundingClientRect();

		if (oTheadRect.top != oTHRect.top) {
			var oItemDomRef = oItem.getDomRef(),
				oItemRect = oItemDomRef.getBoundingClientRect();
			if (oTHRect.bottom > oItemRect.top) {
				window.requestAnimationFrame(function () {
					oScrollDelegate.scrollToElement(oItemDomRef, 0, [0, -oTHRect.height]);
				});
			}
		}
	};

	// function gets called when the focus is on the item or its content
	Table.prototype.onItemFocusIn = function(oItem, oFocusedControl) {
		if (this.getStickyStyleClass()) {
			this._handleStickyHeaderItemFocus(oItem);
		}

		ListBase.prototype.onItemFocusIn.apply(this, arguments);
	};

	// event listener for theme changed
	Table.prototype.onThemeChanged = function() {
		this._bThemeChanged = true;
	};

	// returns the class that should be added to tbody element
	Table.prototype._getAlternateRowColorsClass = function() {
		if (this.isGrouped()) {
			return "sapMListTblAlternateRowColorsGrouped";
		}

		if (this.hasPopin()) {
			return "sapMListTblAlternateRowColorsPopin";
		}

		return "sapMListTblAlternateRowColors";
	};

	return Table;

});
