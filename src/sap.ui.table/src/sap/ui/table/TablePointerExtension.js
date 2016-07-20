/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TablePointerExtension.
sap.ui.define(['jquery.sap.global', './TableExtension', './TableUtils'],
	function(jQuery, TableExtension, TableUtils) {
	"use strict";

	/*
	 * Provides utility functions used this extension
	 */
	//var ExtensionHelper = {

	//};

	/*
	 * Provides drag&drop resize capabilities for visibleRowCountMode "Interactive".
	 */
	var InteractiveResizeHelper = {

		/*
		 * Initializes the drag&drop for resizing
		 */
		initInteractiveResizing: function(oTable, bTouch){
			var $Body = jQuery(document.body),
				$Splitter = oTable.$("sb"),
				$Document = jQuery(document),
				offset = $Splitter.offset(),
				height = $Splitter.height(),
				width = $Splitter.width();

			// Fix for IE text selection while dragging
			$Body.bind("selectstart", InteractiveResizeHelper.onSelectStartWhileInteractiveResizing);

			$Body.append(
				"<div id=\"" + oTable.getId() + "-ghost\" class=\"sapUiTableInteractiveResizerGhost\" style =\" height:" + height + "px; width:"
				+ width + "px; left:" + offset.left + "px; top:" + offset.top + "px\" ></div>");

			// Append overlay over splitter to enable correct functionality of moving the splitter
			$Splitter.append("<div id=\"" + oTable.getId() + "-rzoverlay\" style =\"left: 0px; right: 0px; bottom: 0px; top: 0px; position:absolute\" ></div>");

			$Document.bind((bTouch ? "touchend" : "mouseup") + ".sapUiTableInteractiveResize", InteractiveResizeHelper.exitInteractiveResizing.bind(oTable));
			$Document.bind((bTouch ? "touchmove" : "mousemove") + ".sapUiTableInteractiveResize", InteractiveResizeHelper.onMouseMoveWhileInteractiveResizing.bind(oTable));

			oTable._disableTextSelection();
		},

		/*
		 * Drops the previous dragged horizontal splitter bar and recalculates the amount of rows to be displayed.
		 */
		exitInteractiveResizing : function(oEvent) {
			var $Body = jQuery(document.body),
				$Document = jQuery(document),
				$This = this.$(),
				$Ghost = this.$("ghost"),
				iLocationY = InteractiveResizeHelper._getY(oEvent, this);

			var iNewHeight = iLocationY - $This.find(".sapUiTableCCnt").offset().top - $Ghost.height() - $This.find(".sapUiTableFtr").height();

			// TBD: Move this to the table code
			this._setRowContentHeight(iNewHeight);
			this._adjustRows(this._calculateRowsToDisplay(iNewHeight));

			$Ghost.remove();
			this.$("rzoverlay").remove();

			$Body.unbind("selectstart", InteractiveResizeHelper.onSelectStartWhileInteractiveResizing);
			$Document.unbind("touchend.sapUiTableInteractiveResize");
			$Document.unbind("touchmove.sapUiTableInteractiveResize");
			$Document.unbind("mouseup.sapUiTableInteractiveResize");
			$Document.unbind("mousemove.sapUiTableInteractiveResize");

			this._enableTextSelection();
		},

		/*
		 * Handler for the selectstart event triggered in IE to select the text. Avoid this during resize drag&drop.
		 */
		onSelectStartWhileInteractiveResizing : function(oEvent) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
			return false;
		},

		/*
		 * Handler for the move events while dragging the horizontal resize bar.
		 */
		onMouseMoveWhileInteractiveResizing : function(oEvent) {
			var iLocationY = InteractiveResizeHelper._getY(oEvent, this);
			var iMin = this.$().offset().top;
			if (iLocationY > iMin) {
				this.$("ghost").css("top", iLocationY + "px");
			}
		},

		/*
		 * Returns the Y position of the given mouse/touch event.
		 */
		_getY : function(oEvent, oTable) {
			return oTable._isTouchMode(oEvent) ? oEvent.targetTouches[0].pageY : oEvent.pageY;
		}

	};

	/*
	 * Event handling of touch and mouse events.
	 * "this" in the function context is the table instance.
	 */
	var ExtensionDelegate = {

		onmousedown : function(oEvent) {
			// check whether item navigation should be reapplied from scratch
			this._getKeyboardExtension().initItemNavigation();

			if (oEvent.button === 0 && oEvent.target === this.getDomRef("sb")) { // left mouse button + mousedown on interactive resize bar
				InteractiveResizeHelper.initInteractiveResizing(this, this._isTouchMode(oEvent));
			}
		}

	};

	/**
	 * Extension for sap.ui.table.Table which handles mouse and touch related things.
	 *
	 * @class Extension for sap.ui.table.Table which handles mouse and touch related things.
	 *
	 * @extends sap.ui.table.TableExtension
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TablePointerExtension
	 */
	var TablePointerExtension = TableExtension.extend("sap.ui.table.TablePointerExtension", /* @lends sap.ui.table.TablePointerExtension */ {

		/*
		 * @see TableExtension._init
		 */
		_init : function(oTable, sTableType, mSettings) {
			this._type = sTableType;
			this._delegate = ExtensionDelegate;

			// Register the delegate
			oTable.addEventDelegate(this._delegate, oTable);

			return "PointerExtension";
		},

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy : function() {
			// Deregister the delegates
			var oTable = this.getTable();
			if (oTable) {
				oTable.removeEventDelegate(this._delegate);
			}
			this._delegate = null;

			TableExtension.prototype.destroy.apply(this, arguments);
		}

	});

	return TablePointerExtension;

}, /* bExport= */ true);