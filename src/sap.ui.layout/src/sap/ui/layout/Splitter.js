/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Control',
	'./library',
	'sap/ui/core/library',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/RenderManager',
	'./SplitterRenderer',
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/layout/SplitterLayoutData"
],
	function(
		Control,
		library,
		coreLibrary,
		ResizeHandler,
		RenderManager,
		SplitterRenderer,
		Log,
		jQuery,
		SplitterLayoutData
	) {
	"use strict";

	// shortcut for sap.ui.core.Orientation
	var Orientation = coreLibrary.Orientation;

	var iRemAsPixels = 16;

	/**
	 * Constructor for a new Splitter.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * <h3>Overview</h3>
	 * A layout that contains several content areas. The content that is added to the splitter should contain <code>layoutData</code> of type {@link sap.ui.layout.SplitterLayoutData SplitterLayoutData}
	 * which defines its size and size constraints. If such <code>layoutData</code> is not defined, it will be generated automatically.
	 *
	 * By adding or changing the <code>layoutData</code> to the controls that make up the content areas, the size can be changed programmatically.
	 * Additionally the content areas can be made non-resizable individually and a minimal size (in px) can be set.
	 *
	 * The orientation of the splitter can be set to horizontal (default) or vertical. All content areas of the splitter will be arranged in that way.
	 * In order to split vertically and horizontally at the same time, splitters need to be nested.
	 *
	 * The splitter bars are focusable to enable resizing of the content areas via keyboard.
	 * The size of the content areas can be manipulated when the splitter bar is focused and Shift-Left/Down/Right/Up are pressed.
	 * When Shift-Home/End are pressed, the content areas are resized to their minimum or maximum size (Note, that resizing one
	 * auto-size content area next to another auto-size content area, might lead to the effect that the former does not take its
	 * maximum size but only the maximum size before recalculating the auto-sizes).
	 *
	 * The splitter bars used for resizing the content areas by the user can be set to different widths (or heights in vertical mode)
	 * and the splitter will automatically resize the other content areas accordingly.
	 * In case the splitter bar is resized after the splitter has been rendered, a manual resize has to be triggered by invoking triggerResize() on the splitter.
	 *
	 * <h3>Responsive Behavior</h3>
	 * On touch-enabled devices the bars of the splitter can be moved by touching the grip.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22.0
	 * @alias sap.ui.layout.Splitter
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Splitter = Control.extend("sap.ui.layout.Splitter", /** @lends sap.ui.layout.Splitter.prototype */ {
		metadata: {
			library : "sap.ui.layout",
			properties : {

				/**
				 * Whether to split the contents horizontally (default) or vertically.
				 */
				orientation : {type : "sap.ui.core.Orientation", group : "Behavior", defaultValue : Orientation.Horizontal},

				/**
				 * The width of the control
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '100%'},

				/**
				 * The height of the control
				 */
				height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '100%'}
			},
			defaultAggregation : "contentAreas",
			aggregations : {

				/**
				 * The content areas to be split. The control will show n-1 splitter bars between n controls in this aggregation.
				 */
				contentAreas : {type : "sap.ui.core.Control", multiple : true, singularName : "contentArea"}
			},
			events : {

				/**
				 * Event is fired when contents are resized.
				 */
				resize : {
					parameters : {

						/**
						 * The ID of the splitter control. The splitter control can also be accessed by calling getSource() on the event.
						 */
						id : {type : "string"},

						/**
						 * An array of values representing the old (pixel-)sizes of the splitter contents
						 */
						oldSizes : {type : "int[]"},

						/**
						 * An array of values representing the new (pixel-)sizes of the splitter contents
						 */
						newSizes : {type : "int[]"}
					}
				}
			},
			designtime: "sap/ui/layout/designtime/Splitter.designtime"
		},
		renderer: SplitterRenderer
	});

	Splitter.prototype.init = function() {
		this._liveResize        = true;
		this._keyboardEnabled   = true;
		this._bHorizontal       = true;
		/** @type {Number[]} */
		this._calculatedSizes   = [];
		this._move              = {};

		this._resizeTimeout     = null;

		// Context bound method for easy (de-)registering at the ResizeHandler
		this._resizeCallback    = this._delayedResize.bind(this);
		this._resizeHandlerId   = null;
		// We need the information whether auto resize is enabled to temporarily disable it
		// during live resize and then set it back to the value before
		this._autoResize = true;
		this.enableAutoResize();

		// Bound versions for event handler registration
		this._boundBarMoveEnd   = this._onBarMoveEnd.bind(this);
		this._boundBarMove      = this._onBarMove.bind(this);

		// Switch resizing parameters based on orientation - this must be done to initialize the values
		this._initOrientationProperties();

		this._bRtl = sap.ui.getCore().getConfiguration().getRTL();

		// Create bound listener functions for keyboard event handling
		this._keyListeners = {
			increase     : this._onKeyboardResize.bind(this, "inc", 20),
			decrease     : this._onKeyboardResize.bind(this, "dec", 20),
			increaseMore : this._onKeyboardResize.bind(this, "incMore", 20),
			decreaseMore : this._onKeyboardResize.bind(this, "decMore", 20),
			max          : this._onKeyboardResize.bind(this, "max", 20),
			min          : this._onKeyboardResize.bind(this, "min", 20)
		};
		this._enableKeyboardListeners();
	};

	Splitter.prototype.exit = function() {
		this.disableAutoResize();
		delete this._resizeCallback;

		delete this._boundBarMoveEnd;
		delete this._boundBarMove;

		delete this._$SplitterOverlay;
		delete this._$SplitterOverlayBar;
	};

	Splitter.prototype.onBeforeRendering = function() {
		this._initOrientationProperties();
	};

	Splitter.prototype.onAfterRendering = function() {
		this._$SplitterOverlay = this.$("overlay");
		this._$SplitterOverlayBar = this.$("overlayBar");

		// Calculate and apply correct sizes to the Splitter contents
		this._resize();
	};

	////////////////////////////////////////// Public Methods //////////////////////////////////////////

	/**
	 * This method  triggers a resize on the Splitter - meaning it forces the Splitter to recalculate
	 * all sizes.
	 * This method should only be used in rare cases, for example when the CSS that defines the sizes
	 * of the splitter bars changes without triggering a rerendering of the splitter.
	 *
	 * @param {boolean} [forceDirectly=false] Do not delay the resize, trigger it right now.
	 * @public
	 */
	Splitter.prototype.triggerResize = function(forceDirectly) {
		if (forceDirectly) {
			this._resize();
		} else {
			this._delayedResize();
		}
	};

	/**
	 * Resets the size (width or height) of each of the content areas.
	 *
	 * @public
	 */
	Splitter.prototype.resetContentAreasSizes = function () {
		var aContentAreas = this._getContentAreas();
		for (var i = 0; i < aContentAreas.length; i++) {
			var oLD = aContentAreas[i].getLayoutData();
			var bHasMinSize = oLD.getMinSize() != 0;
			var sSize = bHasMinSize ? oLD.getMinSize() + "px" : "auto";
			oLD.setSize(sSize);
			this.$("content-" + i).css(this._sizeType, sSize);
		}
	};

	//////////////////////////////////////// "Protected" Methods ///////////////////////////////////////

	/**
	 * Returns the current actual content sizes as pixel value - these values can change with every
	 * resize.
	 *
	 * @returns {Number[]} Array of px values that correspond to the content area sizes
	 * @protected
	 * @deprecated As of version 1.21. This method is declared as protected in order to assess the need for this feature. It is declared as deprecated because the API might change in case the need for this is high enough to make it part of the official Splitter interface
	 */
	Splitter.prototype.getCalculatedSizes = function() {
		return this._calculatedSizes;
	};

	/**
	 * Enables the resize handler for this control, this leads to an automatic resize of
	 * the contents whenever the control changes its size. The resize handler is enabled
	 * in every control instance by default.
	 * For performance reasons this behavior can be disabled by calling disableAutoResize()
	 *
	 * @param {boolean} [bTemporarily=false] Only enables autoResize if it was previously disabled temporarily (used for live resize)
	 * @protected
	 * @deprecated As of version 1.21. This method is declared as protected in order to assess the need for this feature. It is declared as deprecated because the API might change in case the need for this is high enough to make it part of the official Splitter interface
	 */
	Splitter.prototype.enableAutoResize = function(bTemporarily) {
		// Do not enable autoResize if it was deactivated temporarily and wasn't enabled before
		if (bTemporarily && !this._autoResize) {
			return;
		}

		this._autoResize = true;

		var that = this;
		sap.ui.getCore().attachInit(function() {
			that._resizeHandlerId = ResizeHandler.register(that, that._resizeCallback);
		});

		this._delayedResize();
	};

	/**
	 * Disables the resize handler for this control, this leads to an automatic resize of
	 * the contents whenever the control changes its size. The resize handler is enabled
	 * in every control instance by default.
	 * For performance reasons this behavior can be disabled by calling disableAutoResize()
	 *
	 * @param {boolean} [bTemporarily=false] Only disable autoResize temporarily (used for live resize), so that the previous status can be restored afterwards
	 * @protected
	 * @deprecated As of version 1.21. This method is declared as protected in order to assess the need for this feature. It is declared as deprecated because the API might change in case the need for this is high enough to make it part of the official Splitter interface
	 */
	Splitter.prototype.disableAutoResize = function(bTemporarily) {
		ResizeHandler.deregister(this._resizeHandlerId);

		if (!bTemporarily) {
			this._autoResize = false;
		}
	};

	/**
	 * Enables recalculation and resize of the splitter contents while dragging the splitter bar.
	 * This means that the contents are resized several times per second when moving the splitter bar.
	 *
	 * @protected
	 * @deprecated As of version 1.21. This method is declared as protected in order to assess the need for this feature. It is declared as deprecated because the API might change in case the need for this is high enough to make it part of the official Splitter interface
	 */
	Splitter.prototype.enableLiveResize = function() {
		this._liveResize = true;
		this.removeStyleClass("sapUiLoSplitterAnimated");
	};

	/**
	 * Disables recalculation and resize of the splitter contents while dragging the splitter bar.
	 * This means that the contents are resized only once after moving the splitter bar.
	 *
	 * @protected
	 * @deprecated As of version 1.21. This method is declared as protected in order to assess the need for this feature. It is declared as deprecated because the API might change in case the need for this is high enough to make it part of the official Splitter interface
	 */
	Splitter.prototype.disableLiveResize = function() {
		this._liveResize = false;
		this.addStyleClass("sapUiLoSplitterAnimated");
	};

	/**
	 * Enables the resizing of the Splitter contents via keyboard. This makes the Splitter bars
	 * focusable elements.
	 *
	 * @protected
	 */
	Splitter.prototype.enableKeyboardSupport = function() {
		var $Bars = this.$().find(".sapUiLoSplitterBar");
		$Bars.attr("tabindex", "0");
		this._enableKeyboardListeners();
	};

	/**
	 * Disables the resizing of the Splitter contents via keyboard. This changes the Splitter bars
	 * to non-focusable elements.
	 *
	 * @protected
	 */
	Splitter.prototype.disableKeyboardSupport = function() {
		var $Bars = this.$().find(".sapUiLoSplitterBar");
		$Bars.attr("tabindex", "-1");
		this._disableKeyboardListeners();
	};

	////////////////////////////////////////// Events Handlers /////////////////////////////////////////

	/**
	 * When one or several of the child controls change their layoutData, the Splitter must
	 * recalculate the sizes of its content areas.
	 *
	 * @private
	 */
	Splitter.prototype.onLayoutDataChange = function() {
		this._delayedResize();
	};

	/**
	 * Starts the resize of splitter contents (when the bar is moved by touch)
	 *
	 * @param {jQuery.Event} oEvent The jQuery event
	 * @private
	 */
	Splitter.prototype.ontouchstart = function (oEvent) {
		if (this._ignoreTouch) {
			return;
		}

		var oTarget = this._getBar(oEvent.target);

		if (!oTarget) {
			return;
		}

		if (!oEvent.changedTouches || !oEvent.changedTouches[0]) {
			// No touch in event
			return;
		}

		this._ignoreMouse = true;
		this._onBarMoveStart(oEvent.changedTouches[0], oTarget, true);
	};

	/**
	 * Starts the resize of splitter contents (when the bar is moved by mouse)
	 *
	 * @param {jQuery.Event} oEvent The jQuery event
	 * @private
	 */
	Splitter.prototype.onmousedown = function (oEvent) {
		if (this._ignoreMouse) {
			return;
		}

		var oTarget = this._getBar(oEvent.target);

		if (!oTarget) {
			return;
		}

		this._ignoreTouch = true;
		this._onBarMoveStart(oEvent, oTarget);
		this._oLastDOMclicked = oTarget;
	};

	/**
	 * Starts a resize (for touch and click)
	 *
	 * @param {jQuery.Event|Touch} oEvent jQuery event or Touch object.
	 * @param {HTMLElement} oBar The bar which is being moved
	 * @param {boolean} [bTouch] Whether the first parameter is a touch event
	 * @private
	 */
	Splitter.prototype._onBarMoveStart = function (oEvent, oBar, bTouch) {
		var sId = this.getId();

		// Disable auto resize during bar move
		this.disableAutoResize(/* temporarily: */ true);

		var iPos = oEvent[this._moveCord];
		var iBar = parseInt(oBar.id.substr((sId + "-splitbar-").length));
		var $bar = jQuery(oBar);
		var mCalcSizes = this.getCalculatedSizes();
		var iBarSize = this._bHorizontal ? $bar.outerWidth() : $bar.outerHeight();
		var aContentAreas = this._getContentAreas();
		var oLd1   = aContentAreas[iBar].getLayoutData();
		var oLd2   = aContentAreas[iBar + 1].getLayoutData();

		if (!oLd1.getResizable() || !oLd2.getResizable()) {
			// One of the contentAreas is not resizable, do not resize
			// Also: disallow text-marking behavior when not moving bar
			_preventTextSelection(bTouch);
			return;
		}

		// Calculate relative starting position of the bar for virtual bar placement
		var iRelStart = 0 - iBarSize;
		for (var i = 0; i <= iBar; ++i) {
			iRelStart += mCalcSizes[i] + iBarSize;
		}

		this._move = {
			// Start coordinate
			start : iPos,
			// Relative starting position of the bar
			relStart : iRelStart,
			// The number of the bar that is moved
			barNum : iBar,
			// The splitter bar that is moved
			$bar : $bar,
			// The content sizes for fast resize bound calculation
			c1Size : mCalcSizes[iBar],
			c1MinSize : oLd1 ? parseInt(oLd1.getMinSize()) : 0,
			c2Size : mCalcSizes[iBar + 1],
			c2MinSize : oLd2 ? parseInt(oLd2.getMinSize()) : 0
		};

		// Event handlers use bound handler methods - see init()
		if (bTouch) {
			// this._ignoreMouse = true; // Ignore mouse-events until touch is done
			document.addEventListener("touchend",  this._boundBarMoveEnd);
			document.addEventListener("touchmove", this._boundBarMove);
		} else {
			document.addEventListener("mouseup",   this._boundBarMoveEnd);
			document.addEventListener("mousemove", this._boundBarMove);
		}

		this._$SplitterOverlay.css("display", "block"); // Show the overlay while moving
		this._$SplitterOverlayBar.css(this._sizeDirNot, "");
		this._move.$bar.css("visibility", "hidden"); // Hide the moved bar
		this._onBarMove(oEvent);
	};

	/**
	 * Handles moving of any bar (by touch or mouse)
	 *
	 * @param {jQuery.Event|MouseEvent|Touch|TouchEvent} oEvent The event object.
	 * @private
	 */
	Splitter.prototype._onBarMove = function(oEvent) {
		if (oEvent.preventDefault && !(oEvent.changedTouches)) {
			oEvent.preventDefault(); // Do not select text
		}

		var oConfig = oEvent;
		if (oEvent.changedTouches && oEvent.changedTouches[0]) {
			// Touch me baby!
			oConfig = oConfig.changedTouches[0];
		}

		var iPos = oConfig[this._moveCord];

		var iDelta = (iPos - this._move.start);
		//We should only switch direction of change in case it is left or right.
		//Otherwise the vertical splitter is moved opposite to the mouse movement
		if (this.getOrientation() == Orientation.Horizontal && this._bRtl) {
			iDelta = -iDelta;
		}

		var c1NewSize = this._move.c1Size + iDelta;
		var c2NewSize = this._move.c2Size - iDelta;


		var bInBounds = (
				c1NewSize >= 0
			 && c2NewSize >= 0
			 && c1NewSize >= this._move.c1MinSize
			 && c2NewSize >= this._move.c2MinSize
		);

		// Move virtual splitter bar
		if (bInBounds) {
			this._$SplitterOverlayBar.css(this._sizeDir, this._move.relStart + iDelta);

			if (this._liveResize) {
				var fMove = (this._move["start"] - oConfig[this._moveCord]);

				//We should only switch direction of change in case it is left or right.
				//Otherwise the vertical splitter is moved opposite to the mouse movement
				if (this.getOrientation() == Orientation.Horizontal && this._bRtl) {
					fMove = -fMove;
				}

				this._resizeContents(
					/* left content number:    */ this._move["barNum"],
					/* number of pixels:       */ -fMove,
					/* also change layoutData: */ false
				);
			}
		}

	};

	/**
	 * Ends the resize of splitter contents (when the bar is moved)
	 *
	 * @param {MouseEvent|TouchEvent} oEvent The native event
	 * @private
	 */
	Splitter.prototype._onBarMoveEnd = function(oEvent) {
		this._ignoreMouse = false;
		this._ignoreTouch = false;

		var oConfig = oEvent;
		if (oEvent.changedTouches && oEvent.changedTouches[0]) {
			// Touch me baby!
			oConfig = oConfig.changedTouches[0];
		}

		var iPos = oConfig[this._moveCord];

		var fMove = this._move["start"] - iPos;

		//We should only switch direction of change in case it is left or right.
		//Otherwise the vertical splitter is moved opposite to the mouse movement
		if (this.getOrientation() == Orientation.Horizontal && this._bRtl) {
			fMove = -fMove;
		}

		this._resizeContents(
			/* left content number:    */ this._move["barNum"],
			/* number of pixels:       */ -fMove,
			/* also change layoutData: */ true
		);

		this._move.$bar.css("visibility", ""); // Return the moved bar
		this._$SplitterOverlay.css("display", ""); // Remove resizing overlay

		// Uses bound handler methods - see init()
		document.removeEventListener("mouseup",   this._boundBarMoveEnd);
		document.removeEventListener("mousemove", this._boundBarMove);
		document.removeEventListener("touchend",  this._boundBarMoveEnd);
		document.removeEventListener("touchmove", this._boundBarMove);

		// Enable auto resize after bar move if it was enabled before
		this.enableAutoResize(/* temporarily: */ true);
		if (this._move.$bar){
			this._move.$bar.focus();
		}
	};

	/**
	 * Resizes the contents after a bar has been moved
	 *
	 * @param {Number} [iLeftContent] Number of the first (left) content that is resized
	 * @param {Number} [iPixels] Number of pixels to increase the first and decrease the second content
	 * @param {boolean} [bFinal] Whether this is the final position (sets the size in the layoutData of the
	 * content areas)
	 */
	Splitter.prototype._resizeContents = function(iLeftContent, iPixels, bFinal) {
		if (isNaN(iPixels)) {
			Log.warning("Splitter: Received invalid resizing values - resize aborted.");
			return;
		}

		var aContentAreas = this._getContentAreas();
		var oLd1   = aContentAreas[iLeftContent].getLayoutData();
		var oLd2   = aContentAreas[iLeftContent + 1].getLayoutData();

		var sSize1 = oLd1.getSize();
		var sSize2 = oLd2.getSize();

		var $Cnt1 = this.$("content-" + iLeftContent);
		var $Cnt2 = this.$("content-" + (iLeftContent + 1));

		var iNewSize1 = this._move.c1Size + iPixels;
		var iNewSize2 = this._move.c2Size - iPixels;
		var iMinSize1 = parseInt(oLd1.getMinSize());
		var iMinSize2 = parseInt(oLd2.getMinSize());

		// Adhere to size constraints
		var iDiff;
		if (iNewSize1 < iMinSize1) {
			iDiff = iMinSize1 - iNewSize1;
			iPixels += iDiff;
			iNewSize1 = iMinSize1;
			iNewSize2 -= iDiff;
		} else if (iNewSize2 < iMinSize2) {
			iDiff = iMinSize2 - iNewSize2;
			iPixels -= iDiff;
			iNewSize2 = iMinSize2;
			iNewSize1 -= iDiff;
		}

		if (bFinal) {
			// Resize finished, set layout data in content areas
			if (sSize1 === "auto" && sSize2 !== "auto") {
				// First pane has auto size - only change size of second pane
				oLd2.setSize(iNewSize2 + "px");
			} else if (sSize1 !== "auto" && sSize2 === "auto") {
				// Second pane has auto size - only change size of first pane
				oLd1.setSize(iNewSize1 + "px");
			} else {
				oLd1.setSize(iNewSize1 + "px");
				oLd2.setSize(iNewSize2 + "px");
			}
		} else {
			// Live-Resize, resize contents in Dom
			$Cnt1.css(this._sizeType, iNewSize1 + "px");
			$Cnt2.css(this._sizeType, iNewSize2 + "px");
		}
	};


	////////////////////////////////////////// Private Methods /////////////////////////////////////////

	/**
	 * Resizes as soon as the current stack is done. Can be used in cases where several resize-relevant
	 * actions are done in a loop to make sure only one resize calculation is done at the end.
	 *
	 * @param {Number} [iDelay=0] Number of milliseconds to wait before doing the resize
	 * @private
	 */
	Splitter.prototype._delayedResize = function(iDelay) {
		if (iDelay === undefined) {
			iDelay = 0;
		}

		// If we are not rendered, we do not need to resize since resizing is done after rendering
		if (this.getDomRef()) {
			clearTimeout(this._resizeTimeout);
			this._resizeTimeout = setTimeout(this._resize.bind(this), iDelay);
		}
	};

	/**
	 * Resizes the Splitter bars to fit the current content height. Must be done before and after content sizes have
	 * been calculated.
	 *
	 * @param {sap.ui.core.Control[]} aContentAreas - The content areas of the Splitter
	 * @returns {void}
	 * @private
	 */
	Splitter.prototype._resizeBars = function(aContentAreas) {
		var i, $Bar;
		// In case the Splitter has a relative height or width set (like "100%"), and the surrounding
		// container does not have a size set, the content of the Splitter defines the height/width,
		// in which case the size of the splitter bars is incorrect.
		var $this = this.$();
		// First remove the size from the splitter bar so it does not lead to growing the content
		for (i = 0; i < aContentAreas.length - 1; ++i) {
			$Bar = this.$("splitbar-" + i);
			$Bar.css(this._sizeTypeNot, "");
		}
		// Now measure the content and adapt the size of the Splitter bar
		for (i = 0; i < aContentAreas.length - 1; ++i) {
			$Bar = this.$("splitbar-" + i);
			var iSize = this._bHorizontal ? $this.height() : $this.width();
			$Bar.css(this._sizeType, "");
			$Bar.css(this._sizeTypeNot, iSize + "px");
		}
	};

	/**
	 * Recalculates the content sizes and manipulates the DOM accordingly.
	 *
	 * @private
	 */
	Splitter.prototype._resize = function() {
		var oDomRef = this.getDomRef();
		if (!oDomRef || RenderManager.getPreserveAreaRef().contains(oDomRef)) {
			// Do not attempt to resize the content areas in case we are in the preserved area
			return;
		}

		var i = 0, $Bar;
		var aContentAreas = this._getContentAreas();

		// Resize Splitter bars so that they do not influence the content sizes the wrong way
		this._resizeBars(aContentAreas);

		// Save calculated sizes to be able to tell whether a resize occurred
		var oldCalculatedSizes = this.getCalculatedSizes();
		this._recalculateSizes();
		var newCalculatedSizes = this.getCalculatedSizes();

		var bSizesValid = false;
		for (i = 0; i < newCalculatedSizes.length; ++i) {
			if (newCalculatedSizes[i] !== 0) {
				bSizesValid = true;
				break;
			}
		}
		if (!bSizesValid) {
			// TODO: What if all sizes are set to 0 on purpose...?
			this._delayedResize(100);
			return;
		}

		var bLastContentResizable = true;
		for (i = 0; i < aContentAreas.length; ++i) {
			var $Content = this.$("content-" + i);
			var oContent = aContentAreas[i];

			$Content.css(this._sizeType, newCalculatedSizes[i] + "px");
			$Content.css(this._sizeTypeNot, ""); // Remove other sizes.

			// Check whether bar should be movable
			var oLd = oContent.getLayoutData();
			var bContentResizable = oLd && oLd.getResizable();
			if (i > 0) {
				var bResizable = bContentResizable && bLastContentResizable;
				$Bar = this.$("splitbar-" + (i - 1));
				$Bar.toggleClass("sapUiLoSplitterNoResize", !bResizable);
				$Bar.attr("tabindex", bResizable && this._keyboardEnabled ? "0" : "-1");
			}
			bLastContentResizable = bContentResizable;
		}

		// Resize Splitter bars again so that the updated content sizes are calculated correctly
		this._resizeBars(aContentAreas);

		// In case something was resized, change sizes and fire resize event
		if (_sizeArraysDiffer(oldCalculatedSizes, newCalculatedSizes)) {
			this.fireResize({
				oldSizes : oldCalculatedSizes,
				newSizes : newCalculatedSizes
			});
		}
	};

	/**
	 * Calculates how much space is actually available inside the splitter to distribute the content
	 * areas in.
	 *
	 * @param {string[]} [aSizes] The list of size values from the LayoutData of the content areas
	 * @returns {Number} The available space in px
	 * @private
	 */
	Splitter.prototype._calculateAvailableContentSize = function(aSizes) {
		var i = 0;
		var $Splitter = this.$();
		var iFullSize      = this._bHorizontal ? $Splitter.innerWidth() : $Splitter.innerHeight();
		// Due to rounding errors when zoom is activated, we need 1px of error margin for every element
		// that is automatically sized...
		var iAutosizedAreas = 0;
		var bHasAutoSizedContent = false;
		for (i = 0; i < aSizes.length; ++i) {
			var sSize = aSizes[i];
			if (sSize.indexOf("%") > -1) {
				iAutosizedAreas++;
			}
			if (aSizes[i] == "auto") {
				bHasAutoSizedContent = true;
			}
		}
		iAutosizedAreas += bHasAutoSizedContent ? 1 : 0;

		// don't subtract from the full size when orientation is Vertical to prevent endless resizing
		if (this.getOrientation() === Orientation.Horizontal) {
			iFullSize -= iAutosizedAreas;
		}

		// Due to zoom rounding erros, we cannot assume that all SplitBars have the same sizes, even
		// though they have the same CSS size set.
		var iSplitters     = aSizes.length - 1;
		var iSplitBarsWidth = 0;
		for (i = 0; i < iSplitters; ++i) {
			iSplitBarsWidth += this._bHorizontal
				? this.$("splitbar-" + i).outerWidth()
				: this.$("splitbar-" + i).outerHeight();
		}

		return Math.max(0, iFullSize - iSplitBarsWidth);
	};

	/**
	 * Recalculates the content sizes in three steps:
	 *  1. Searches for all absolute values ("px") and deducts them from the available space.
	 *  2. Searches for all percent values and interprets them as % of the available space after step 1
	 *  3. Divides the rest of the space uniformly between all contents with "auto" size values
	 *
	 * @private
	 */
	Splitter.prototype._recalculateSizes = function() {
		var i, sSize, oLayoutData, iColSize, idx;

		// Read all content sizes from the layout data
		var aSizes = [];
		var aContentAreas = this._getContentAreas();
		for (i = 0; i < aContentAreas.length; ++i) {
			oLayoutData = aContentAreas[i].getLayoutData();
			sSize = oLayoutData ? oLayoutData.getSize() : "auto";

			aSizes.push(sSize);
		}

		this._calculatedSizes = [];

		var iAvailableSize = this._calculateAvailableContentSize(aSizes);

		var aAutosizeIdx = [];
		var aAutoMinsizeIdx = [];
		var aPercentsizeIdx = [];
		var iRest = iAvailableSize;

		// Remove fixed sizes from available size
		for (i = 0; i < aSizes.length; ++i) {
			sSize = aSizes[i];
			var iSize;

			if (sSize.indexOf("rem") > -1) {
				iSize = parseFloat(sSize) * iRemAsPixels;
				iRest -= iSize;
				this._calculatedSizes[i] = iSize;
			} else if (sSize.indexOf("px") > -1) {
				// Pixel based Value - deduct it from available size
				iSize = parseInt(sSize);
				iRest -= iSize;
				this._calculatedSizes[i] = iSize;
			} else if (sSize.indexOf("%") > -1) {
				aPercentsizeIdx.push(i);
			} else if (aSizes[i] == "auto") {
				oLayoutData = aContentAreas[i].getLayoutData();
				if (oLayoutData && parseInt(oLayoutData.getMinSize()) != 0) {
					aAutoMinsizeIdx.push(i);
				} else {
					aAutosizeIdx.push(i);
				}
			} else {
				Log.error("Illegal size value: " + aSizes[i]);
			}
		}

		var bWarnSize = false; // Warn about sizes being too big for the available space

		// If more than the available size if assigned to fixed width content, the rest will get no
		// space at all
		if (iRest < 0) { bWarnSize = true; iRest = 0; }

		// Now calculate % of the available space
		var iPercentSizes = aPercentsizeIdx.length;
		for (i = 0; i < iPercentSizes; ++i) {
			idx = aPercentsizeIdx[i];
			// Percent based Value - deduct it from available size
			iColSize = Math.floor((parseFloat(aSizes[idx]) / 100) * iAvailableSize);
			this._calculatedSizes[idx] = iColSize;
			iRest -= iColSize;
		}
		iAvailableSize = iRest;

		if (iAvailableSize < 0) { bWarnSize = true; iAvailableSize = 0; }

		// Calculate auto sizes
		iColSize = Math.floor(iAvailableSize / (aAutoMinsizeIdx.length + aAutosizeIdx.length), 0);

		// First calculate auto-sizes with a minSize constraint
		var iAutoMinSizes = aAutoMinsizeIdx.length;
		for (i = 0; i < iAutoMinSizes; ++i) {
			idx = aAutoMinsizeIdx[i];
			var iMinSize = parseInt(aContentAreas[idx].getLayoutData().getMinSize());
			if (iMinSize > iColSize) {
				this._calculatedSizes[idx] = iMinSize;
				iAvailableSize -= iMinSize;
			} else {
				this._calculatedSizes[idx] = iColSize;
				iAvailableSize -= iColSize;
			}
		}

		if (iAvailableSize < 0) { bWarnSize = true; iAvailableSize = 0; }

		// Now calculate "auto"-sizes
		iRest = iAvailableSize;
		var iAutoSizes = aAutosizeIdx.length;
		iColSize = Math.floor(iAvailableSize / iAutoSizes, 0);
		for (i = 0; i < iAutoSizes; ++i) {
			idx = aAutosizeIdx[i];
			this._calculatedSizes[idx] = iColSize;
			iRest -= iColSize;
	//			if (i == iAutoSizes - 1 && iRest != 0) {
	//				// In case of rounding errors, change the last auto-size column
	//				this._calculatedSizes[idx] += iRest;
	//			}
		}

		if (bWarnSize) {
			// TODO: Decide if the warning should be kept - might spam the console but on the other
			//       hand it might make analyzing of splitter bugs easier, since we can just ask
			//       developers if there was a [Splitter] output on the console if the splitter looks
			//       weird in their application.
			Log.info(
				"[Splitter] The set sizes and minimal sizes of the splitter contents are bigger " +
				"than the available space in the UI."
			);
		}
	};

	/**
	 * Stores the respective values that differ when resizing the splitter in horizontal vs. vertical mode
	 * @private
	 */
	Splitter.prototype._initOrientationProperties = function() {
		this._bHorizontal = this.getOrientation() === Orientation.Horizontal;
		if (this._bHorizontal) {
			this._sizeDirNot  = "top";
			this._sizeTypeNot = "height";
			this._sizeType    = "width";
			this._moveCord    = "pageX";

			if (this._bRtl) {
				this._sizeDir     = "right";
			} else {
				this._sizeDir     = "left";
			}
		} else {
			this._moveCord    = "pageY";
			this._sizeType    = "height";
			this._sizeTypeNot = "width";
			this._sizeDir     = "top";
			this._sizeDirNot  = "left";
		}
	};

	/**
	 * Handles events that are generated from the keyboard that should trigger a resize (on the
	 * Splitter bars).
	 *
	 * @param {string} [sType] The type of resize step ("inc", "dec", "max", "min")
	 * @param {int} [iStepSize] The step size for the keyboard event
	 * @param {jQuery.Event} [oEvent] The original keyboard event
	 */
	Splitter.prototype._onKeyboardResize = function(sType, iStepSize, oEvent) {
		var sBarId = this.getId() + "-splitbar-";
		if (!oEvent || !oEvent.target || !oEvent.target.id || oEvent.target.id.indexOf(sBarId) !== 0) {
			return;
		}

		var iBigStep  = 999999;

		var iBar = parseInt(oEvent.target.id.substr(sBarId.length));
		var mCalcSizes = this.getCalculatedSizes();
		// TODO: These two lines are incomprehensible magic - find better solution
		this._move.c1Size = mCalcSizes[iBar];
		this._move.c2Size = mCalcSizes[iBar + 1];

		var iStep = 0;
		switch (sType) {
			case "inc":
				iStep = iStepSize;
				break;

			case "incMore":
				iStep = iStepSize * 10;
				break;

			case "dec":
				iStep = 0 - iStepSize;
				break;

			case "decMore":
				iStep = 0 - iStepSize * 10;
				break;

			case "max":
				iStep = iBigStep;
				break;

			case "min":
				iStep = 0 - iBigStep;
				break;

			default:
				Log.warn("[Splitter] Invalid keyboard resize type");
				break;
		}

		this._resizeContents(iBar, iStep, true);
	};

	/**
	 * Connects the keyboard event listeners so resizing via keyboard will be possible
	 */
	Splitter.prototype._enableKeyboardListeners = function() {
		this.onsapright              = this._keyListeners.increase;
		this.onsapdown               = this._keyListeners.increase;
		this.onsapleft               = this._keyListeners.decrease;
		this.onsapup                 = this._keyListeners.decrease;
		this.onsappageup             = this._keyListeners.decreaseMore;
		this.onsappagedown           = this._keyListeners.increaseMore;
		this.onsapend                = this._keyListeners.max;
		this.onsaphome               = this._keyListeners.min;

		this._keyboardEnabled = true;
	};

	/**
	 * Disconnects the keyboard event listeners so resizing via keyboard will not be possible anymore
	 */
	Splitter.prototype._disableKeyboardListeners = function() {
		delete this.onsapincreasemodifiers;
		delete this.onsapdecreasemodifiers;
		delete this.onsapendmodifiers;
		delete this.onsaphomemodifiers;

		this._keyboardEnabled = false;
	};

	///////////////////////////////////////// Hidden Functions /////////////////////////////////////////

	/**
	 * Returns the bar for the given target. If there isn't such, null is returned
	 * @param {HTMLElement} oTarget The target
	 * @returns {HTMLElement|null} The found bar or null
	 */
	Splitter.prototype._getBar = function (oTarget) {
		var oBar = oTarget,
			sId = this.getId();

		if (oBar.classList.contains("sapUiLoSplitterBarGripIcon")) {
			oBar = oTarget.parentElement;
		}

		if (oBar.classList.contains("sapUiLoSplitterBarDecorationBefore")
			|| oBar.classList.contains("sapUiLoSplitterBarDecorationAfter")
			|| oBar.classList.contains("sapUiLoSplitterBarGrip")) {
				oBar = oBar.parentElement;
		}

		if (!oBar.id || oBar.id.indexOf(sId + "-splitbar") !== 0) {
			// The clicked element was not one of my splitter bars
			return null;
		}

		return oBar;
	};

	/**
	 * Compares two (simple, one-dimensional) arrays. If all values are the same, false is returned -
	 * If values differ or at least one of the values is no array, true is returned.
	 *
	 * @param {Number[]} [aSizes1] The array of numbers to compare against
	 * @param {Number[]} [aSizes2] The array of numbers that is compared to the first one
	 * @returns {boolean} True if the size-arrays differ, false otherwise
	 * @private
	 */
	function _sizeArraysDiffer(aSizes1, aSizes2) {
		if (aSizes1 === aSizes2) {
			// The same thing. No difference.
			return false;
		}

		if (!aSizes1 || !aSizes2 || aSizes1.length === undefined || aSizes2.length === undefined) {
			// At lease one of the two is not an array
			return true;
		}

		if (aSizes1.length != aSizes2.length) {
			return true;
		}

		for (var i = 0; i < aSizes1.length; ++i) {
			if (aSizes1[i] !== aSizes2[i]) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Prevents the selection of text while the mouse is moving when pressed
	 *
	 * @param {boolean} [bTouch] If set to true, touch events instead of mouse events are captured
	 */
	function _preventTextSelection(bTouch) {
		var fnPreventSelection = function(oEvent) {
			if (!bTouch) {
				oEvent.preventDefault();
			}
		};
		var fnAllowSelection = null;
		fnAllowSelection = function() {
			document.removeEventListener("touchend",  fnAllowSelection);
			document.removeEventListener("touchmove", fnPreventSelection);
			document.removeEventListener("mouseup",   fnAllowSelection);
			document.removeEventListener("mousemove", fnPreventSelection);
		};

		if (bTouch) {
			this._ignoreMouse = true; // Ignore mouse-events until touch is done
			document.addEventListener("touchend",  fnAllowSelection);
			document.addEventListener("touchmove", fnPreventSelection);
		} else {
			document.addEventListener("mouseup",   fnAllowSelection);
			document.addEventListener("mousemove", fnPreventSelection);
		}
	}

	/**
	 * Makes sure the LayoutData for the given control is set and compatible. In case nothing is set,
	 * a default sap.ui.layout.SplitterLayoutData is set on the Element
	 *
	 * @param {sap.ui.core.Element} oContent The Element for which the existence of LayoutData should be ensured
	 * @private
	 */
	Splitter.prototype._ensureLayoutData = function (oContent) {
		var oLd = oContent.getLayoutData();
		// Make sure LayoutData is set on the content
		// But this approach has the advantage that "compatible" LayoutData can be used.
		if (oLd && (!oLd.getResizable || !oLd.getSize || !oLd.getMinSize)) {
			Log.warning(
				"Content \"" + oContent.getId() + "\" for the Splitter contained wrong LayoutData. " +
				"The LayoutData has been replaced with default values."
			);
			oLd = null;
		}
		if (!oLd) {
			oContent.setLayoutData(new SplitterLayoutData());
		}
	};

	//////////////////////////////////////// Overridden Methods ////////////////////////////////////////

	Splitter.prototype.invalidate = function(oOrigin) {
		var bForce =
			// In case the content invalidates and bubbles up (for example an invisible button being
			// shown), we need to rerender
			(oOrigin && this.indexOfContentArea(oOrigin) != -1)

			// CustomData that needs to be updated in the DOM has been set on the splitter
			// TODO: Programatically write CustomData on this control to the DOM
		 || (oOrigin && oOrigin instanceof sap.ui.core.CustomData && oOrigin.getWriteToDom())

			// We do not know where the invalidate originated from. We will pretty much have to rerender
		 || (oOrigin === undefined);

		// Only really invalidate/rerender if needed
		if (bForce) {
			Control.prototype.invalidate.apply(this, arguments);
		}
	};

	Splitter.prototype.addContentArea = function(oContent) {
		this._ensureLayoutData(oContent);
		return this.addAggregation("contentAreas", oContent);
	};

	Splitter.prototype.insertContentArea = function(oContent, iIndex) {
		this._ensureLayoutData(oContent);
		return this.insertAggregation("contentAreas", oContent, iIndex);
	};

	Splitter.prototype._getContentAreas = function() {
		return this.getContentAreas();
	};

	return Splitter;
});