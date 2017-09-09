/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.AssociativeSplitter.
sap.ui.define(['./Splitter', './SplitterRenderer', 'jquery.sap.global'],
	function(Splitter, SplitterRenderer, jQuery) {
	"use strict";

	/**
	 * Constructor for a new AssociativeSplitter.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * AssociativeSplitter is a version of Splitter that uses an association in addition to the aggregation
	 * @extends sap.ui.layout.Splitter
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.layout.AssociativeSplitter
	 */
	var AssociativeSplitter = Splitter.extend("sap.ui.layout.AssociativeSplitter", /** @lends sap.ui.layout.AssociativeSplitter.prototype */ {
		metadata : {
			associations : {
				/**
				 * The same as content, but provided in the form of an association
				 */
				associatedContentAreas: {type : "sap.ui.core.Control", multiple : true, singularName : "associatedContentArea"}
			}
		},
		renderer: SplitterRenderer
	});

	AssociativeSplitter.prototype.init = function () {
		Splitter.prototype.init.call(this);
		// We need to have different step size than the existing in the Splitter
		this._keyListeners = {
			increase     : this._onKeyboardResize.bind(this, "inc", 1),
			decrease     : this._onKeyboardResize.bind(this, "dec", 1),
			increaseMore : this._onKeyboardResize.bind(this, "incMore", 2),
			decreaseMore : this._onKeyboardResize.bind(this, "decMore", 2),
			max          : this._onKeyboardResize.bind(this, "max", 1),
			min          : this._onKeyboardResize.bind(this, "min", 1)
		};
		this._enableKeyboardListeners();
	};

	/**
	 * Adds shift + arrows keyboard handling to the existing one
	 * @returns {void}
	 * @private
	 */
	AssociativeSplitter.prototype._enableKeyboardListeners = function () {
		Splitter.prototype._enableKeyboardListeners.call(this);
		this.onsaprightmodifiers = this._keyListeners.increase;
		this.onsapleftmodifiers = this._keyListeners.decrease;
		this.onsapupmodifiers = this._keyListeners.decrease;
		this.onsapdownmodifiers = this._keyListeners.increase;
		this.onsapright = this._keyListeners.increaseMore;
		this.onsapdown = this._keyListeners.increaseMore;
		this.onsapleft = this._keyListeners.decreaseMore;
		this.onsapup = this._keyListeners.decreaseMore;
		this.onsapend = this._keyListeners.max;
		this.onsaphome = this._keyListeners.min;

		this._keyboardEnabled = true;
	};

	AssociativeSplitter.prototype.addAssociatedContentArea = function (oContent) {
		this._needsInvalidation = true;
		_ensureLayoutData(oContent);
		return this.addAssociation("associatedContentAreas", oContent);
	};

	AssociativeSplitter.prototype.indexOfAssociatedContentArea = function (area) {
		var contentAreas = this._getContentAreas();
		for (var i = 0; i < contentAreas.length; i++) {
			if (area == contentAreas[i]) {
				return i;
			}
		}
		return -1;
	};

	//TODO: Review this with caution, and check whether there will be any side effects
	AssociativeSplitter.prototype.insertAssociatedContentArea = function (oContent, iIndex) {
		var id = oContent.getId();
		this._needsInvalidation = true;
		_ensureLayoutData(oContent);
		var content = this.getAssociatedContentAreas();

		//Remove duplicate IDs
		for (var i = 0; i < content.length; i++) {
			if (content[i] === id) {
				content.splice(i,1);
			}
		}

		content.splice(iIndex, 0, id);
		this.setAssociation("associatedContentAreas", null);
		var that = this;

		content.forEach(function (id) {
			that.addAssociation("associatedContentAreas", id);
		});
	};

	AssociativeSplitter.prototype.removeAssociatedContentArea = function (area) {
		this.removeAssociation("associatedContentAreas", area);
	};

	AssociativeSplitter.prototype._getContentAreas = function () {
		var aAssociatedContentAreas = this.getAssociatedContentAreas() || [];
		var aContentAreas = this.getContentAreas();

		var aValidAssContentAreas = aAssociatedContentAreas.map(function (sId) {
			return sap.ui.getCore().byId(sId);
		}).filter(function (oContent) { return oContent; });

		return aContentAreas.concat(aValidAssContentAreas);
	};

	/**
	 * Starts the resize of splitter contents (when the bar is moved by mouse)
	 *
	 * @param {jQuery.Event} [oJEv] The jQuery event
	 * @private
	 */
	AssociativeSplitter.prototype.onmousedown = function (oJEv) {
		if (this._ignoreMouse) {
			return;
		}

		if (jQuery(oJEv.target).hasClass("sapUiLoSplitterBarIcon")) {
			oJEv.target = oJEv.target.parentElement;
		}

		var sId = this.getId();
		if (!oJEv.target.id || oJEv.target.id.indexOf(sId + "-splitbar") !== 0) {
			// The clicked element was not one of my splitter bars
			return;
		}

		this._ignoreTouch = true;
		this._onBarMoveStart(oJEv);
		this._oLastDOMclicked = oJEv.target;
	};

	AssociativeSplitter.prototype.ondblclick = function (oEvent) {
		// For some reason dblclick returns the whole Splitter not only the clicked splitbar
		var sId = this.getId(),
			iBar, oContentArea;
		if (!(oEvent.target.contains(this._oLastDOMclicked) && (this._oLastDOMclicked.id.indexOf(sId + "-splitbar") > -1))) {
			// The clicked element was not one of my splitter bars
			return;
		}

		iBar = parseInt(this._oLastDOMclicked.id.substr((sId + "-splitbar-").length), 10);
		oContentArea = this._getContentAreas()[iBar];
		oContentArea._currentPosition = this.getCalculatedSizes()[iBar];
		oContentArea._lastPosition = oContentArea._lastPosition || oContentArea._currentPosition;

		if (oContentArea._currentPosition === oContentArea._lastPosition) {
			this._resizeContents(iBar, (this.getCalculatedSizes()[iBar]) * -1, true);
		} else {
			this._resizeContents(iBar, oContentArea._lastPosition, true);
			oContentArea._lastPosition = null;
		}
	};

	/**
	 * Starts the resize of splitter contents (when the bar is moved by touch)
	 *
	 * @param {jQuery.Event} [oJEv] The jQuery event
	 * @private
	 */
	AssociativeSplitter.prototype.ontouchstart = function (oJEv) {
		if (this._ignoreTouch) {
			return;
		}

		if (jQuery(oJEv.target).hasClass("sapUiLoSplitterBarIcon")) {
			oJEv.target = oJEv.target.parentElement;
		}

		var sId = this.getId();
		if (!oJEv.target.id || oJEv.target.id.indexOf(sId + "-splitbar") !== 0) {
			// The clicked element was not one of my splitter bars
			return;
		}

		if (!oJEv.changedTouches || !oJEv.changedTouches[0]) {
			// No touch in event
			return;
		}

		this._ignoreMouse = true;
		this._onBarMoveStart(oJEv.changedTouches[0], true);
	};

	AssociativeSplitter.prototype._onBarMoveStart = function (oJEv, bTouch) {
		var sId = this.getId();

		// Disable auto resize during bar move
		this.disableAutoResize(/* temporarily: */ true);

		var iPos = oJEv[this._moveCord];
		var iSplitBar = parseInt(oJEv.target.id.substr((sId + "-splitbar-").length), 10);
		var iSplitBarCircle = parseInt(oJEv.target.parentElement.id.substr((sId + "-splitbar-").length), 10);
		var iBar = (iSplitBar + 1) ? iSplitBar : iSplitBarCircle;
		var $Bar = jQuery(oJEv.target);
		// on tablet in landscape mode the target is the bar's icon
		// calculations should be executed with the bar's size instead
		if ($Bar.attr("class") === "sapUiLoSplitterBarIcon") {
			$Bar = $Bar.parent();
		}
		var mCalcSizes = this.getCalculatedSizes();
		var iBarSize = this._bHorizontal ?  $Bar.innerWidth() : $Bar.innerHeight();

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
			bar : jQuery(oJEv.target),
			// The content sizes for fast resize bound calculation
			c1Size : mCalcSizes[iBar],
			c1MinSize : oLd1 ? parseInt(oLd1.getMinSize(), 10) : 0,
			c2Size : mCalcSizes[iBar + 1],
			c2MinSize : oLd2 ? parseInt(oLd2.getMinSize(), 10) : 0
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

		this._$SplitterOverlay.css("display", "block"); // Needed because it is set to none in renderer
		this._$SplitterOverlay.appendTo(this.getDomRef());
		this._$SplitterOverlayBar.css(this._sizeDirNot, "");
		this._move["bar"].css("visibility", "hidden");
		this._onBarMove(oJEv);
	};

	// Overriding sap.ui.layout.Splitter's calculation functions in order to make it responsive

	/**
	 * Resizes the contents after a bar has been moved
	 *
	 * @param {Number} [iLeftContent] Number of the first (left) content that is resized
	 * @param {Number} [iPixels] Number of pixels to increase the first and decrease the second content
	 * @param {boolean} [bFinal] Whether this is the final position (sets the size in the layoutData of the
	 * content areas)
	 */
	AssociativeSplitter.prototype._resizeContents = function (iLeftContent, iPixels, bFinal) {
		var aContentAreas, oLd1, oLd2, sSize1,
			sSize2, $Cnt1, $Cnt2, iNewSize1, iNewSize2,
			iMinSize1, iMinSize2, sOrientation, iSplitterSize,
			sFinalSize1, sFinalSize2, iDiff,
			sMoveContentSize1 = parseFloat(this._move.c1Size).toFixed(5),
			sMoveContentSize2 = parseFloat(this._move.c2Size).toFixed(5),
			fMoveC1Size = parseFloat(sMoveContentSize1),
			fMoveC2Size = parseFloat(sMoveContentSize2);

		if (isNaN(iPixels)) {
			jQuery.sap.log.warning("Splitter: Received invalid resizing values - resize aborted.");
			return;
		}

		aContentAreas = this._getContentAreas();
		oLd1 = aContentAreas[iLeftContent].getLayoutData();
		oLd2 = aContentAreas[iLeftContent + 1].getLayoutData();

		sSize1 = oLd1.getSize();
		sSize2 = oLd2.getSize();

		$Cnt1 = this.$("content-" + iLeftContent);
		$Cnt2 = this.$("content-" + (iLeftContent + 1));

		iNewSize1 = fMoveC1Size + iPixels;
		iNewSize2 = fMoveC2Size - iPixels;
		iMinSize1 = parseInt(oLd1.getMinSize(), 10);
		iMinSize2 = parseInt(oLd2.getMinSize(), 10);

		sOrientation = this.getOrientation();
		iSplitterSize = sOrientation === "Horizontal" ? this.$().width() : this.$().height();

		// Adhere to size constraints
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
				sFinalSize2 = this._pxToPercent(iNewSize2, iSplitterSize);
				oLd2.setSize(sFinalSize2);
			} else if (sSize1 !== "auto" && sSize2 === "auto") {
				// Second pane has auto size - only change size of first pane
				sFinalSize1 = this._pxToPercent(iNewSize1, iSplitterSize);
				oLd1.setSize(sFinalSize1);
			} else {
				sFinalSize1 = this._pxToPercent(iNewSize1, iSplitterSize);
				sFinalSize2 = this._pxToPercent(iNewSize2, iSplitterSize);


				oLd1.setSize(sFinalSize1);
				oLd2.setSize(sFinalSize2);
			}
		} else {
			// Live-Resize, resize contents in Dom
			sFinalSize1 = this._pxToPercent(iNewSize1, iSplitterSize);
			sFinalSize2 = this._pxToPercent(iNewSize2, iSplitterSize);

			$Cnt1.css(this._sizeType, sFinalSize1);
			$Cnt2.css(this._sizeType, sFinalSize2);
		}
	};

	AssociativeSplitter.prototype._pxToPercent = function (iPx, iFullSize) {
		return (iPx * 100) / iFullSize + "%";
	};

	/**
	 * Recalculates the content sizes in three steps:
	 *  1. Searches for all absolute values ("px") and deducts them from the available space.
	 *  2. Searches for all percent values and interprets them as % of the available space after step 1
	 *  3. Divides the rest of the space uniformly between all contents with "auto" size values
	 *
	 * @private
	 */
	AssociativeSplitter.prototype._recalculateSizes = function () {
		// TODO: (?) Use maxSize value from layoutData
		var i, sSize, oLayoutData, iColSize, idx, iSize;

		// Read all content sizes from the layout data
		var aSizes = [];
		var aContentAreas = this._getContentAreas();
		var sOrientation = this.getOrientation();
		var aAutosizeIdx = [];
		var aAutoMinsizeIdx = [];
		var aPercentsizeIdx = [];

		for (i = 0; i < aContentAreas.length; ++i) {
			oLayoutData = aContentAreas[i].getLayoutData();
			sSize = oLayoutData ? oLayoutData.getSize() : "auto";

			aSizes.push(sSize);
		}

		var iAvailableSize = this._calculateAvailableContentSize(aSizes) + 1;
		this._calculatedSizes = [];

		// Remove fixed sizes from available size
		for (i = 0; i < aSizes.length; ++i) {
			sSize = aSizes[i];

			if (sSize.indexOf("px") > -1) {
				// Pixel based Value - deduct it from available size
				iSize = parseInt(sSize, 10);
				iAvailableSize -= iSize;
				this._calculatedSizes[i] = iSize;
			} else if (sSize.indexOf("%") > -1) {
				aPercentsizeIdx.push(i);
			} else if (sSize === "auto") {
				oLayoutData = aContentAreas[i].getLayoutData();
				if (oLayoutData && parseInt(oLayoutData.getMinSize(), 10) !== 0) {
					aAutoMinsizeIdx.push(i);
				} else {
					aAutosizeIdx.push(i);
				}
			} else {
				jQuery.sap.log.error("Illegal size value: " + aSizes[i]);
			}
		}

		var bWarnSize = false; // Warn about sizes being too big for the available space

		// If more than the available size if assigned to fixed width content, the rest will get no
		// space at all
		if (iAvailableSize < 0) { bWarnSize = true; iAvailableSize = 0; }

		// Now calculate % of the available space
		var iRest = iAvailableSize;
		iAvailableSize = sOrientation === "Horizontal" ? this.$().width() : this.$().height();

		var iPercentSizes = aPercentsizeIdx.length;
		for (i = 0; i < iPercentSizes; ++i) {
			idx = aPercentsizeIdx[i];
			if (iPercentSizes === 1 && aContentAreas.length === 1) {
				iColSize = iAvailableSize;
			} else {
				// Percent based Value - deduct it from available size
				iColSize = parseFloat(aSizes[idx]) / 100 * iAvailableSize;
			}
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
			var iMinSize = parseInt(aContentAreas[idx].getLayoutData().getMinSize(), 10);
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
		}

		if (bWarnSize) {
			// TODO: Decide if the warning should be kept - might spam the console but on the other
			//       hand it might make analyzing of splitter bugs easier, since we can just ask
			//       developers if there was a [Splitter] output on the console if the splitter looks
			//       weird in their application.
			jQuery.sap.log.info(
				"[Splitter] The set sizes and minimal sizes of the splitter contents are bigger " +
				"than the available space in the UI."
			);
		}
		this._calculatedSizes = this._calculatedSizes;
	};

	AssociativeSplitter.prototype._ensureAllSplittersCollapsed = function (iBar) {
		var aAreas = this._getContentAreas();
		var bAllCollapsed = false;
		for (var i = 0; i < aAreas.length; i++) {
			var sSize = aAreas[i].getLayoutData().getSize().slice(0, -2);

			if (sSize === "0" || sSize === "au") {
				bAllCollapsed = true;
				continue;
			} else if (i === (aAreas.length - 1) && bAllCollapsed) {
				this._getContentAreas()[iBar + 1].setLayoutData(new sap.ui.layout.SplitterLayoutData({ size: "100%" }));
			}
		}
	};

	function _ensureLayoutData(oContent) {
		var oLd = oContent.getLayoutData();
		// Make sure LayoutData is set on the content
		// But this approach has the advantage that "compatible" LayoutData can be used.
		if (oLd && (!oLd.getResizable || !oLd.getSize || !oLd.getMinSize)) {
			jQuery.sap.log.warning(
				"Content \"" + oContent.getId() + "\" for the Splitter contained wrong LayoutData. " +
				"The LayoutData has been replaced with default values."
			);
			oLd = null;
		}
		if (!oLd) {
			oContent.setLayoutData(new sap.ui.layout.SplitterLayoutData());
		}
	}

	/**
	 * Prevents the selection of text while the mouse is moving when pressed
	 *
	 * @param {boolean} [bTouch] If set to true, touch events instead of mouse events are captured
	 */
	function _preventTextSelection(bTouch) {
		var fnPreventSelection = function (oEvent) {
			oEvent.preventDefault();
		};
		var fnAllowSelection = null;
		fnAllowSelection = function () {
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

	return AssociativeSplitter;

});