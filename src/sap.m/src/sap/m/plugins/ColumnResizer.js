/*!
 * ${copyright}
 */

sap.ui.define([
	"./PluginBase",
	"sap/ui/core/Core",
	"sap/ui/core/InvisibleText",
	"sap/ui/Device",
	"sap/m/ColumnPopoverActionItem",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/Button",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/control", // jQuery Plugin "control"
	"sap/ui/dom/jquery/Aria" // jQuery Plugin "aria"
], function(PluginBase,
	Core,
	InvisibleText,
	Device,
	ColumnPopoverActionItem,
	QuickAction,
	Button,
	jQuery
) {
	"use strict";

	/**
	 * Constructor for a new ColumnResizer plugin.
	 *
	 * @param {string} [sId] ID for the new <code>ColumnResizer</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the <code>ColumnResizer</code>
	 *
	 * @class
	 * Enables column resizing for the <code>sap.m.Table</code>.
	 * This plugin can be added to the control via its <code>dependents</code> aggregation
	 * and there must only be 1 instance of the plugin per control.
	 *
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.91
	 * @alias sap.m.plugins.ColumnResizer
	 */
	var ColumnResizer = PluginBase.extend("sap.m.plugins.ColumnResizer", /** @lends sap.m.plugins.ColumnResizer.prototype */ { metadata: {
		library: "sap.m",
		properties: {
		},
		events: {
			/**
			 * This event is fired when the column is resized.
			 */
			columnResize: {
				allowPreventDefault : true,
				parameters: {
					/**
					 * The column being resized.
					 */
					column: {type: "sap.ui.core.Element"},

					/**
					 * The new width of the column.
					 */
					width : {type : "sap.ui.core.CSSSize"}
				}
			}
		}
	}});


	var oSession = {};
	var bResizing = false;
	var CSS_CLASS = "sapMPluginsColumnResizer";
	var bRTL = Core.getConfiguration().getRTL();
	var sBeginDirection = bRTL ? "right" : "left";
	var sEndDirection = bRTL ? "left" : "right";
	var iDirectionFactor = bRTL ? -1 : 1;

	ColumnResizer.getPlugin = PluginBase.getPlugin;

	ColumnResizer.prototype.init = function() {
		this._iHoveredColumnIndex = -1;
		this._aPositions = [];
		this._oHandle = null;
	};

	ColumnResizer.prototype.onActivate = function(oControl) {
		oControl.addEventDelegate(this, this);
		if (oControl.isActive()) {
			this.onAfterRendering();
		}
	};

	ColumnResizer.prototype.onDeactivate = function(oControl) {
		oControl.removeEventDelegate(this, this);
		this.onBeforeRendering();
		this._oHandle = null;
	};

	ColumnResizer.prototype.onBeforeRendering = function() {
		if (this._$Container) {
			this._$Container.removeClass(CSS_CLASS + "Container").off("." + CSS_CLASS);
			this._$Container.find(this.getConfig("resizable")).removeClass(CSS_CLASS + "Resizable");
			this._updateAriaDescribedBy("remove");
		}
	};

	ColumnResizer.prototype.onAfterRendering = function() {
		this._$Container = this.getControl().$(this.getConfig("container"));
		Device.system.desktop && this._$Container.on("mousemove." + CSS_CLASS, this._onmousemove.bind(this));
		this._$Container.addClass(CSS_CLASS + "Container").on("mouseleave." + CSS_CLASS, this._onmouseleave.bind(this));
		this._aResizables = this._$Container.find(this.getConfig("resizable")).addClass(CSS_CLASS + "Resizable").get();
		this._updateAriaDescribedBy("add");
		this._invalidatePositions();
	};

	/**
	 * Adds / removes the aria-describedby attribute from the resizable control DOM.
	 * @param {string} sAction function prefix
	 * @private
	 */
	ColumnResizer.prototype._updateAriaDescribedBy = function(sAction) {
		this._aResizables.forEach(function(oResizable) {
			var oResizableControl = jQuery(oResizable).control(0, true);
			var oFocusDomRef = oResizableControl && oResizableControl.getFocusDomRef();
			jQuery(oFocusDomRef)[sAction + "AriaDescribedBy"](InvisibleText.getStaticId("sap.m", "COLUMNRESIZER_RESIZABLE"));
		});
	};

	ColumnResizer.prototype.ontouchstart = function(oEvent) {
		if (this.getConfig("allowTouchResizing") && jQuery(oEvent.target).closest(this._aResizables)[0]) {
			this._onmousemove(oEvent);
		} else if (this._iHoveredColumnIndex == -1 && this._oHandle && this._oHandle.style[sBeginDirection]) {
			this._onmousemove(oEvent);

			if (this._iHoveredColumnIndex == -1) {
				this._oHandle.style[sBeginDirection] = "";
				this._oAlternateHandle.style[sBeginDirection] = "";
			}
		}

		bResizing = (this._iHoveredColumnIndex > -1);
		if (!bResizing) {
			return;
		}

		this._startResizeSession(this._iHoveredColumnIndex);
		oSession.iTouchStartX = oEvent.targetTouches[0].clientX;
		oSession.fHandleX = parseFloat(this._oHandle.style[sBeginDirection]);

		this._$Container.addClass(CSS_CLASS + "Resizing");
		jQuery(document).on("touchend." + CSS_CLASS + " mouseup." + CSS_CLASS, this._ontouchend.bind(this));
	};

	ColumnResizer.prototype.ontouchmove = function(oEvent) {
		if (!bResizing) {
			return;
		}

		this._setSessionDistanceX((oEvent.targetTouches[0].clientX - oSession.iTouchStartX));
		this._oHandle.style[sBeginDirection] = oSession.fHandleX + oSession.iDistanceX + "px";
	};

	ColumnResizer.prototype._onmousemove = function(oEvent) {
		if (bResizing) {
			return;
		}

		this._setPositions();

		var iClientX = oEvent.targetTouches ? oEvent.targetTouches[0].clientX : oEvent.clientX;
		var iHoveredColumnIndex = this._getHoveredColumnIndex(iClientX);

		this._displayHandle(iHoveredColumnIndex);
	};

	ColumnResizer.prototype._onmouseleave = function() {
		this._invalidatePositions();
		this.onsapescape();
	};

	ColumnResizer.prototype._ontouchend = function() {
		this._setColumnWidth();
		this._cancelResizing(true);
	};

	ColumnResizer.prototype.onsapescape = function() {
		if (bResizing) {
			this._cancelResizing();
		}
	};

	ColumnResizer.prototype.onsaprightmodifiers = function(oEvent) {
		this._onLeftRightModifiersKeyDown(oEvent, 16);
	};

	ColumnResizer.prototype.onsapleftmodifiers = function(oEvent) {
		this._onLeftRightModifiersKeyDown(oEvent, -16);
	};

	ColumnResizer.prototype.ondblclick = function(oEvent) {
		var iClientX = oEvent.clientX,
			iHoveredColumnIndex = this._getHoveredColumnIndex(iClientX);

		if (iHoveredColumnIndex == -1) {
			return;
		}

		this._startResizeSession(iHoveredColumnIndex);
		this._setSessionDistanceX(this._calculateAutoColumnDistanceX());
		this._setColumnWidth();
		this._endResizeSession();
	};

	/**
	 * Returns the hovered column index. If column index is found the returns the index else returns -1.
	 * @param {int} iClientX clientX from the mouse/touch event
	 * @returns {int} hovered column index
	 * @private
	 */
	ColumnResizer.prototype._getHoveredColumnIndex = function(iClientX) {
		return this._aPositions.findIndex(function(fPosition) {
			return Math.abs(fPosition - iClientX) <= (this._oAlternateHandle || ColumnResizer._isInTouchMode() ? 20 : 3);
		}, this);
	};

	/**
	 * Returns the horizontal distance by which a column's width should be increased or decreased.
	 * This gets called when columns must be automatically resized on the double click mouse.
	 * @returns {int} horizontal distance
	 * @private
	 */
	ColumnResizer.prototype._calculateAutoColumnDistanceX = function() {
		var $Cells = this.getConfig("columnRelatedCells", this._$Container, oSession.oCurrentColumn.getId());

		if (!$Cells || !$Cells.length) {
			return;
		}

		var $HiddenArea = jQuery("<div></div>").addClass(CSS_CLASS + "SizeDetector").addClass(this.getConfig("cellPaddingStyleClass"));
		var $ClonedCells = $Cells.children().clone().removeAttr("id");
		this.getConfig("additionalColumnWidth", $Cells, $ClonedCells);
		this._$Container.append($HiddenArea);
		var iWidth = Math.round($HiddenArea.append($ClonedCells)[0].getBoundingClientRect().width);
		var iDistanceX = iWidth - oSession.fCurrentColumnWidth;
		$HiddenArea.remove();

		return iDistanceX;
	};

	ColumnResizer.prototype._invalidatePositions = function() {
		window.setTimeout(function() {
			this._bPositionsInvalid = true;
		}.bind(this));
	};

	/**
	 * Displays the resize handle on the column which is hovered
	 * @param {int} iColumnIndex column index
	 * @param {boolean} bMobileHandle indicates whether the alternate handle is visible
	 * @private
	 */
	ColumnResizer.prototype._displayHandle = function(iColumnIndex, bMobileHandle) {
		if (this._iHoveredColumnIndex == iColumnIndex) {
			return;
		}

		if (!this._oHandle) {
			this._oHandle = document.createElement("div");
			this._oHandle.className = CSS_CLASS + "Handle";
			this._oHandle.onmouseleave = function() { this.style[sBeginDirection] = ""; };

			if (bMobileHandle || ColumnResizer._isInTouchMode()) {
				var oCircle = document.createElement("div");
				oCircle.className = CSS_CLASS + "HandleCircle";
				oCircle.style.top = this._aResizables[iColumnIndex].offsetHeight - 8 + "px";
				this._oHandle.appendChild(oCircle);

				this._oAlternateHandle = this._oHandle.cloneNode(true);
			}
		}

		if (this._$Container[0] !== this._oHandle.parentNode) {
			this._$Container.append(this._oHandle);

			if (bMobileHandle) {
				this._$Container.append(this._oAlternateHandle);
			}
		}

		this._oHandle.style[sBeginDirection] = (iColumnIndex > -1) ? (this._aPositions[iColumnIndex] - this._fContainerX) * iDirectionFactor + "px" : "";

		if (bMobileHandle) {
			this._oAlternateHandle.style[sBeginDirection] = (--iColumnIndex > -1) ? (this._aPositions[iColumnIndex] - this._fContainerX) * iDirectionFactor + "px" : "";
		} else {
			if (this._oAlternateHandle) {
				this._oAlternateHandle.style[sBeginDirection] = "";
			}

			this._iHoveredColumnIndex = iColumnIndex;
		}
	};

	/**
	 * Cancels the resizing session and restores the DOM.
	 * @param {boolean} bDelayHideHandle whether there should be a delay in hiding the resize handle
	 * @private
	 */
	ColumnResizer.prototype._cancelResizing = function(bDelayHideHandle) {
		this._$Container.removeClass(CSS_CLASS + "Resizing");

		if (oSession.iDistanceX || !bDelayHideHandle) {
			this._oHandle.style[sBeginDirection] = "";
		} else {
			// delay hiding the handle so that in case of double-click mouse event,
			// the resize handle does not disappear in the initial mousedown and mouseup event
			// this will also prevent column press event to trigger
			setTimeout(function() {
				this._oHandle.style[sBeginDirection] = "";
			}.bind(this), 300);
		}

		this._iHoveredColumnIndex = -1;

		jQuery(document).off("." + CSS_CLASS);
		this._endResizeSession();
		bResizing = false;
	};

	ColumnResizer.prototype._getColumnMinWidth = function(oColumn) {
		return oColumn ? 48 : 0;
	};

	/**
	 * This function collects all the necessary information for starting a resize session.
	 * A resize session contains the below information:
	 * - Current column and its width.
	 * - Next column and its width (if available).
	 * - Maximum increase and decrease resize value.
	 * - Existance of dummy column.
	 * @param {int} iIndex column index
	 * @private
	 */
	ColumnResizer.prototype._startResizeSession = function(iIndex) {
		oSession.$CurrentColumn = jQuery(this._aResizables[iIndex]);
		oSession.oCurrentColumn = oSession.$CurrentColumn.control(0, true);
		oSession.fCurrentColumnWidth = oSession.$CurrentColumn.width();
		oSession.iMaxDecrease = this._getColumnMinWidth(oSession.oCurrentColumn) - oSession.fCurrentColumnWidth;
		oSession.iEmptySpace = this.getConfig("emptySpace", this.getControl());

		if (oSession.iEmptySpace != -1) {
			oSession.$NextColumn = jQuery(this._aResizables[iIndex + 1]);
			oSession.oNextColumn = oSession.$NextColumn.control(0, true);
			oSession.fNextColumnWidth = oSession.$NextColumn.width() || 0;
			oSession.iMaxIncrease = oSession.iEmptySpace + oSession.fNextColumnWidth - this._getColumnMinWidth(oSession.oNextColumn);
		} else {
			oSession.iMaxIncrease = window.innerWidth;
		}
	};

	/**
	 * Sets the horizontal resize distance to the session by which the column was increased or decreased.
	 * @param {int} iDistanceX horizontal resize distance
	 * @private
	 */
	ColumnResizer.prototype._setSessionDistanceX = function(iDistanceX) {
		oSession.iDistanceX = ((iDistanceX > 0) ? Math.min(iDistanceX, oSession.iMaxIncrease) : Math.max(iDistanceX, oSession.iMaxDecrease)) * iDirectionFactor;
	};

	/**
	 * Sets the column widths if the default action of the <code>columnResize</code> event is not prevented.
	 * @private
	 */
	ColumnResizer.prototype._setColumnWidth = function() {
		if (!oSession.iDistanceX) {
			return;
		}

		var sWidth = oSession.fCurrentColumnWidth + oSession.iDistanceX + "px";
		if (!this._fireColumnResize(oSession.oCurrentColumn, sWidth)) {
			return;
		}

		oSession.oCurrentColumn.setWidth(sWidth);

		if (oSession.oNextColumn && (oSession.iEmptySpace < 3 || oSession.iDistanceX > oSession.iEmptySpace)) {
			sWidth = oSession.fNextColumnWidth - oSession.iDistanceX + oSession.iEmptySpace + "px";
			if (this._fireColumnResize(oSession.oNextColumn, sWidth)) {
				oSession.oNextColumn.setWidth(sWidth);
			}
		}

		// when any column is resized, then make all visible columns have fixed width
		this.getConfig("fixAutoWidthColumns") && this._aResizables.forEach(function(oResizable) {
			var $Resizable = jQuery(oResizable),
				oColumn = $Resizable.control(0, true),
				sWidth = oColumn.getWidth();

			if (sWidth && sWidth.toLowerCase() != "auto") {
				return;
			}

			sWidth = $Resizable.css("width");
			if (sWidth && this._fireColumnResize(oColumn, sWidth)) {
				oColumn.setWidth(sWidth);
			}
		}, this);
	};

	/**
	 * Fires the column resize event with the relevant parameters.
	 * @param {sap.m.Column|sap.ui.table.Column} oColumn column instance
	 * @param {sap.ui.core.CSSSize} sWidth column width
	 * @private
	 * @return {boolean} prevent defualt
	 */
	ColumnResizer.prototype._fireColumnResize = function(oColumn, sWidth) {
		return this.fireColumnResize({
			column: oColumn,
			width: sWidth
		});
	};

	/**
	 * This function is called when column resizing is trigger via keyboard events <code>onsapleftmodifiers</code> & <code>onsaprightmodifiers</code>.
	 * @param {object} oEvent keyboard event
	 * @param {int} iDistanceX resize distance
	 * @private
	 */
	ColumnResizer.prototype._onLeftRightModifiersKeyDown = function(oEvent, iDistanceX) {
		// prevent column resize when there is text selection in the column header
		if (!oEvent.shiftKey || oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey || ColumnResizer.detectTextSelection(oEvent.target)) {
			return;
		}

		var oResizable = jQuery(oEvent.target).closest(this._aResizables)[0],
			iIndex = this._aResizables.indexOf(oResizable);

		if (iIndex === -1) {
			return;
		}

		this._startResizeSession(iIndex);
		this._setSessionDistanceX(iDistanceX);
		this._setColumnWidth();
		this._endResizeSession();
	};

	ColumnResizer.detectTextSelection = function(oDomRef) {
		var oSelection = window.getSelection(),
			sTextSelection = oSelection.toString().replace("/n", "");

		return sTextSelection && jQuery.contains(oDomRef, oSelection.focusNode);
	};

	/**
	 * Ends and cleans up the resize session.
	 * @private
	 */
	ColumnResizer.prototype._endResizeSession = function() {
		oSession = {};
	};

	/**
	 * Sets the container and handle positions. If positions are invalid then calculates first.
	 * @returns {Array} hoverable positions
	 * @private
	 */
	ColumnResizer.prototype._setPositions = function() {
		if (!this._bPositionsInvalid) {
			return this._aPositions;
		}

		this._bPositionsInvalid = false;
		this._fContainerX = this._$Container[0].getBoundingClientRect()[sBeginDirection];
		this._aPositions = this._aResizables.map(function(oResizable, iIndex, aPositions) {
			return oResizable.getBoundingClientRect()[sEndDirection] - (++iIndex == aPositions.length ? 1.25 * iDirectionFactor : 0);
		}, this);
	};

	/**
	 * Displays the resize handle for the provided column <code>DOM</code> reference.
	 * @param {HTMLElement} oDomRef column DOM reference
	 * @protected
	 */
	ColumnResizer.prototype.startResizing = function(oDomRef) {
		var iColumnIndex = this._aResizables.indexOf(oDomRef);
		this._setPositions();
		this._displayHandle(iColumnIndex, true);
	};

	/**
	 * Returns resizer quick action instance which on press calls the <code>startResizing</code> method.
	 * @param {sap.m.Column} oColumn Column instance
	 * @param {sap.m.table.columnmenu.Menu} oColumnMenu The column menu instance
	 * @returns {sap.m.table.columnmenu.QuickAction | undefined} column resize quick action
	 * @ui5-restricted
	 * @private
	 */
	ColumnResizer.prototype.getColumnResizeQuickAction = function(oColumn, oColumnMenu) {
		if (!oColumn || !ColumnResizer._isInTouchMode()) {
			return;
		}

		return new QuickAction({
			label: Core.getLibraryResourceBundle("sap.m").getText("table.COLUMN_MENU_RESIZE"),
			content: new Button({
				icon: "sap-icon://resize-horizontal",
				press: function() {
					oColumnMenu.close();
					this.startResizing(oColumn.getDomRef());
				}.bind(this)
			})
		});
	};

	/**
	 * Returns resizer button instance which on press calls the <code>startResizing</code> method.
	 * @param {sap.m.Column} oColumn Column instance
	 * @returns {sap.m.ColumnPopoverActionItem | undefined} column resize action item
	 * @ui5-restricted
	 * @private
	 */
	ColumnResizer.prototype.getColumnResizeButton = function(oColumn) {
		if (!oColumn || !ColumnResizer._isInTouchMode()) {
			return;
		}

		return new ColumnPopoverActionItem({
			text: Core.getLibraryResourceBundle("sap.m").getText("COLUMNRESIZER_RESIZE_BUTTON"),
			icon: "sap-icon://resize-horizontal",
			press: this.startResizing.bind(this, oColumn.getDomRef())
		});
	};

	ColumnResizer._isInTouchMode = function() {
		return window.matchMedia("(hover:none)").matches;
	};

	/**
	 * Plugin-specific control configurations.
	 */
	PluginBase.setConfigs({
		"sap.m.Table": {
			container: "listUl",
			resizable: ".sapMListTblHeaderCell:not([aria-hidden=true])",
			focusable: ".sapMColumnHeaderFocusable",
			cellPaddingStyleClass: "sapMListTblCell",
			fixAutoWidthColumns: true,
			onActivate: function(oTable) {
				this._vOrigFixedLayout = oTable.getFixedLayout();

				if (!oTable.bActiveHeaders) {
					oTable.bFocusableHeaders = true;
					this.allowTouchResizing = ColumnResizer._isInTouchMode();
				}

				oTable.setFixedLayout("Strict");
			},
			onDeactivate: function(oTable) {
				oTable.bFocusableHeaders = false;
				oTable.setFixedLayout(this._vOrigFixedLayout);

				// rerendering of the table is required if _vOrigFixedLayout == "Strict", since the focusable DOM must be removed
				if (this._vOrigFixedLayout == "Strict") {
					oTable.rerender();
				}

				delete this._vOrigFixedLayout;
				delete this.allowTouchResizing;
			},
			emptySpace: function(oTable) {
				var oDummyCell = oTable.getDomRef("tblHeadDummyCell");
				return oDummyCell ? oDummyCell.clientWidth : 0;
			},
			columnRelatedCells: function($oContainer, sColumnId) {
				return $oContainer.find(".sapMListTblCell[data-sap-ui-column='" + sColumnId + "']");
			},
			additionalColumnWidth: function($Cells, $ClonedCellsChildren) {
				// first element in the $Cells is the <th> element
				var oTH = $Cells[0];

				if (!oTH.hasAttribute("aria-sort") || oTH.getAttribute("aria-sort") === 'none') {
					return;
				}

				var oColumnHeaderDIV = $ClonedCellsChildren[0];
				var oColumnComputedStyle = window.getComputedStyle(oTH.firstChild, ":after");
				// add margin-left to the cloned column header <div> which is the width of the pseudo element containing the sort-indicator
				oColumnHeaderDIV.style.marginLeft = Math.round(parseInt(oColumnComputedStyle.getPropertyValue("width"))) + "px";
			}
		}
	}, ColumnResizer);

	return ColumnResizer;

});