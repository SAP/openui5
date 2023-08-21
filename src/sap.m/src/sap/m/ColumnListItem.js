/*!
 * ${copyright}
 */

// Provides control sap.m.ColumnListItem.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/library",
	"./library",
	"./ListItemBase",
	"./ColumnListItemRenderer",
	"sap/ui/thirdparty/jquery",
	// jQuery custom selectors ":sapFocusable", ":sapTabbable"
	"sap/ui/dom/jquery/Selectors"
],
	function(Element, coreLibrary, library, ListItemBase, ColumnListItemRenderer, jQuery) {
	"use strict";


	// shortcut for sap.m.ListType
	var ListItemType = library.ListType;

	// shortcut for sap.ui.core.VerticalAlign
	var VerticalAlign = coreLibrary.VerticalAlign;


	/**
	 * Constructor for a new ColumnListItem.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * <code>sap.m.ColumnListItem</code> can be used with the <code>cells</code> aggregation to create rows for the <code>sap.m.Table</code> control.
	 * The <code>columns</code> aggregation of the <code>sap.m.Table</code> should match with the cells aggregation.
	 *
	 * <b>Note:</b> This control should only be used within the <code>sap.m.Table</code> control.
	 * The inherited <code>counter</code> property of <code>sap.m.ListItemBase</code> is not supported.
	 *
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.ColumnListItem
	 */
	var ColumnListItem = ListItemBase.extend("sap.m.ColumnListItem", /** @lends sap.m.ColumnListItem.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Sets the vertical alignment of all the cells within the table row (including selection and navigation).
				 * <b>Note:</b> <code>vAlign</code> property of <code>sap.m.Column</code> overrides the property for cell vertical alignment if both are set.
				 * @since 1.20
				 */
				vAlign : {type : "sap.ui.core.VerticalAlign", group : "Appearance", defaultValue : VerticalAlign.Inherit}
			},
			defaultAggregation : "cells",
			aggregations : {

				/**
				 * Every <code>control</code> inside the <code>cells</code> aggregation defines one cell of the row.
				 * <b>Note:</b> The order of the <code>cells</code> aggregation must match the order of the <code>columns</code> aggregation of <code>sap.m.Table</code>.
				 */
				cells : {type : "sap.ui.core.Control", multiple : true, singularName : "cell", bindable : "bindable"}
			}
		},

		renderer: ColumnListItemRenderer
	});

	/**
	 * TablePopin element that handles own events.
	 */
	var TablePopin = Element.extend("sap.m.TablePopin", {
		ontap: function(oEvent) {
			// prevent the tap event if selection is done within the popin control and mark the event
			if (oEvent.isMarked() || ListItemBase.detectTextSelection(this.getDomRef())) {
				return oEvent.stopImmediatePropagation(true);
			}
			if (oEvent.srcControl === this || !jQuery(oEvent.target).is(":sapFocusable")) {
				this.getParent().focus();
			}
		}
	});

	// defines tag name
	ColumnListItem.prototype.TagName = "tr";

	ColumnListItem.prototype.init = function() {
		ListItemBase.prototype.init.call(this);
		this._bNeedsTypeColumn = false;
		this._aClonedHeaders = [];
	};

	ColumnListItem.prototype.onBeforeRendering = function() {
		ListItemBase.prototype.onBeforeRendering.call(this);
		this.aAriaOwns = [];
		if (this._oPopin && this._oDomRef) {
			this.$Popin().off();
		}
	};

	ColumnListItem.prototype.onAfterRendering = function() {
		if (this._oPopin) {
			this.$().attr("aria-owns", this.aAriaOwns.join(" "));
			this.isActionable(true) && this.$Popin().on("mouseenter mouseleave", function(oEvent) {
				this.previousSibling.classList.toggle("sapMPopinHovered", oEvent.type == "mouseenter");
			});
		}

		ListItemBase.prototype.onAfterRendering.call(this);
		this._checkTypeColumn();
	};

	ColumnListItem.prototype.exit = function() {
		ListItemBase.prototype.exit.call(this);
		this._checkTypeColumn(false);
		this._destroyClonedHeaders();

		if (this._oPopin) {
			this._oPopin.destroy(true);
			this._oPopin = null;
		}
	};

	// remove pop-in from DOM when setVisible false is called
	ColumnListItem.prototype.setVisible = function(bVisible) {
		ListItemBase.prototype.setVisible.call(this, bVisible);
		if (!bVisible && this.hasPopin()) {
			this.removePopin();
		}

		return this;
	};

	// returns responsible table control for the item
	ColumnListItem.prototype.getTable = function() {
		var oParent = this.getParent();
		if (oParent && oParent.isA("sap.m.Table")) {
			return oParent;
		}
	};

	/**
	 * Returns the pop-in element.
	 *
	 * @protected
	 * @since 1.30.9
	 */
	ColumnListItem.prototype.getPopin = function() {
		if (!this._oPopin) {
			this._oPopin = new TablePopin({
				id: this.getId() + "-sub"
			}).addDelegate({
				// handle the events of pop-in
				ontouchstart: this.ontouchstart,
				ontouchmove: this.ontouchmove,
				ontap: this.ontap,
				ontouchend: this.ontouchend,
				ontouchcancel: this.ontouchcancel,
				onsapup: this.onsapup,
				onsapdown: this.onsapdown,
				oncontextmenu: this.oncontextmenu,
				onkeydown: this.onkeydown
			}, this).setParent(this, null, true);
		}

		return this._oPopin;
	};

	/**
	 * Returns pop-in DOMRef as a jQuery Object
	 *
	 * @protected
	 * @since 1.26
	 */
	ColumnListItem.prototype.$Popin = function() {
		return this.$("sub");
	};

	/**
	 * Determines whether control has pop-in or not.
	 * @protected
	 */
	ColumnListItem.prototype.hasPopin = function() {
		return this._oPopin;
	};

	/**
	 * Pemove pop-in from DOM
	 * @protected
	 */
	ColumnListItem.prototype.removePopin = function() {
		this._oPopin && this.$Popin().remove();
	};

	/**
	 * Returns the tabbable DOM elements as a jQuery collection
	 * When popin is available this separated dom should also be included
	 *
	 * @returns {jQuery} jQuery object
	 * @protected
	 * @since 1.26
	 */
	ColumnListItem.prototype.getTabbables = function() {
		return this.$().add(this.$Popin()).find(":sapTabbable");
	};

	/**
	 * Calculates and returns the bounding client rectangle
	 * of the drop area taking the popin area into account.
	 * @private
	 */
	ColumnListItem.prototype.getDropAreaRect = function() {
		var oPopin = null;
		var oDomRef = this.getDomRef();
		var mDropRect = oDomRef.getBoundingClientRect().toJSON();
		if (this._oPopin && (oPopin = this.getDomRef("sub"))) {
			var mPopinRect = oPopin.getBoundingClientRect();
			mDropRect.bottom = mPopinRect.bottom;
			mDropRect.height += mPopinRect.height;
		}

		return mDropRect;
	};

	ColumnListItem.prototype.getAccessibilityType = function(oBundle) {
		return oBundle.getText("ACC_CTR_TYPE_ROW");
	};

	ColumnListItem.prototype.getContentAnnouncement = function(oBundle) {
		var oTable = this.getTable();
		if (!oTable) {
			return;
		}

		var aOutput = [],
			aCells = this.getCells(),
			aColumns = oTable.getRenderedColumns();

		aColumns.forEach(function(oColumn) {
			var oCell = aCells[oColumn.getInitialOrder()];
			if (!oCell) {
				return;
			}

			var oHeader = oColumn.getHeader();
			if (oHeader && oHeader.getVisible()) {
				aOutput.push(ListItemBase.getAccessibilityText(oHeader) + " " + ListItemBase.getAccessibilityText(oCell, true));
			} else {
				aOutput.push(ListItemBase.getAccessibilityText(oCell, true));
			}
		});

		return aOutput.filter(Boolean).join(" . ").trim();
	};

	// update the aria-selected for the cells
	ColumnListItem.prototype.updateSelectedDOM = function(bSelected, $This) {
		ListItemBase.prototype.updateSelectedDOM.apply(this, arguments);

		$This.find(".sapMTblCellFocusable").attr("aria-selected", bSelected);
		if (this.hasPopin()) {
			this.$("subcont").attr("aria-selected", bSelected);
		}
	};

	ColumnListItem.prototype.onfocusin = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		if (oEvent.srcControl === this) {
			this.$().children(".sapMListTblCellDup").find(":sapTabbable").attr("tabindex", -1);
		}

		ListItemBase.prototype.onfocusin.apply(this, arguments);
	};

	ColumnListItem.prototype.onsapenter = ColumnListItem.prototype.onsapspace = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		var sTargetId = oEvent.target.id;
		var sEventHandler = "on" + oEvent.type;
		if (sTargetId == this.getId() + "-ModeCell") {
			oEvent.target = this.getDomRef();
			sEventHandler = this.getMode() == "Delete" ? "onsapdelete" : "onsapspace";
		} else if (sTargetId == this.getId() + "-TypeCell") {
			oEvent.target = this.getDomRef();
			if (this.getType() == "Navigation") {
				sEventHandler = "onsapenter";
			} else {
				oEvent.code = "KeyE";
				oEvent.ctrlKey = true;
				sEventHandler = "onkeydown";
			}
		}

		ListItemBase.prototype[sEventHandler].call(this, oEvent);
	};

	ColumnListItem.prototype.setType = function(sType) {
		ListItemBase.prototype.setType.call(this, sType);
		this._checkTypeColumn();
		return this;
	};

	ColumnListItem.prototype.setParent = function() {
		ListItemBase.prototype.setParent.apply(this, arguments);
		this._checkTypeColumn();
		return this;
	};

	// informs the table when item's type column requirement is changed
	ColumnListItem.prototype._checkTypeColumn = function(bNeedsTypeColumn) {
		if (!this.getParent()) {
			return;
		}
		if (bNeedsTypeColumn == undefined) {
			bNeedsTypeColumn = this._needsTypeColumn();
		}
		if (this._bNeedsTypeColumn != bNeedsTypeColumn) {
			this._bNeedsTypeColumn = bNeedsTypeColumn;
			this.informList("TypeColumnChange", bNeedsTypeColumn);
		}
	};

	// determines whether type column for this item is necessary or not
	ColumnListItem.prototype._needsTypeColumn = function() {
		var sType = this.getType();

		return this.getVisible() && (
			sType == ListItemType.Detail ||
			sType == ListItemType.Navigation ||
			sType == ListItemType.DetailAndActive
		);
	};

	// Adds cloned header to the local collection
	ColumnListItem.prototype._addClonedHeader = function(oHeader) {
		return this._aClonedHeaders.push(oHeader);
	};

	// Destroys cloned headers that are generated for popin
	ColumnListItem.prototype._destroyClonedHeaders = function() {
		if (this._aClonedHeaders.length) {
			this._aClonedHeaders.forEach(function(oClone) {
				oClone.destroy("KeepDom");
			});
			this._aClonedHeaders = [];
		}
	};

	// active feedback for pop-in
	ColumnListItem.prototype._activeHandlingInheritor = function() {
		this._toggleActiveClass(true);
	};

	// inactive feedback for pop-in
	ColumnListItem.prototype._inactiveHandlingInheritor = function() {
		this._toggleActiveClass(false);
	};

	// toggles the active class of the pop-in.
	ColumnListItem.prototype._toggleActiveClass = function(bSwitch) {
		if (this.hasPopin()) {
			this.$Popin().toggleClass("sapMLIBActive", bSwitch);
		}
	};

	return ColumnListItem;

});