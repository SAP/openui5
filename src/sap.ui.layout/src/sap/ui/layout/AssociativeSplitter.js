/*!
 * ${copyright}
 */

sap.ui.define([
	'./Splitter',
	'./SplitterRenderer',
	"sap/base/Log"
], function(Splitter, SplitterRenderer, Log) {
	"use strict";

	/**
	 * Constructor for a new AssociativeSplitter.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * AssociativeSplitter is a version of Splitter that uses an association in addition to the <code>contentAreas</code> aggregation.
	 * It is used to visualize controls aggregated in {@link sap.ui.layout.PaneContainer PaneContainer} panes.
	 *
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
				 * The same as <code>contentAreas</code>, but provided in the form of an association.
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

	AssociativeSplitter.prototype.addAssociatedContentArea = function (oContent) {
		this._ensureLayoutData(oContent);
		return this.addAssociation("associatedContentAreas", oContent);
	};

	/**
	 * Adds shift + arrows keyboard handling to the existing one
	 * @returns {void}
	 * @private
	 * @override
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

	/**
	 * @override
	 */
	AssociativeSplitter.prototype._getContentAreas = function () {
		var aAssociatedContentAreas = this.getAssociatedContentAreas() || [];
		var aContentAreas = this.getContentAreas();

		var aValidAssContentAreas = aAssociatedContentAreas.map(function (sId) {
			return sap.ui.getCore().byId(sId);
		}).filter(function (oContent) { return oContent; });

		return aContentAreas.concat(aValidAssContentAreas);
	};

	AssociativeSplitter.prototype.ondblclick = function (oEvent) {
		// For some reason dblclick returns the whole Splitter not only the clicked splitbar
		var sId = this.getId(),
			iBar, oContentArea;
		if (!(oEvent.target.contains(this._oLastDOMclicked) && (this._oLastDOMclicked.id.indexOf(sId + "-splitbar") > -1))) {
			// The clicked element was not one of my splitter bars
			return;
		}

		iBar = parseInt(this._oLastDOMclicked.id.substr((sId + "-splitbar-").length));
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

	// Overriding sap.ui.layout.Splitter's calculation functions in order to make it responsive

	/**
	 * @override
	 */
	AssociativeSplitter.prototype._resizeContents = function (iLeftContent, iPixels, bFinal) {
		var aContentAreas, oLd1, oLd2, sSize1,
			sSize2, $Cnt1, $Cnt2, iNewSize1, iNewSize2,
			iMinSize1, iMinSize2,
			sFinalSize1, sFinalSize2, iDiff,
			sMoveContentSize1 = parseFloat(this._move.c1Size).toFixed(5),
			sMoveContentSize2 = parseFloat(this._move.c2Size).toFixed(5),
			fMoveC1Size = parseFloat(sMoveContentSize1),
			fMoveC2Size = parseFloat(sMoveContentSize2);

		if (isNaN(iPixels)) {
			Log.warning("Splitter: Received invalid resizing values - resize aborted.");
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
		iMinSize1 = parseInt(oLd1.getMinSize());
		iMinSize2 = parseInt(oLd2.getMinSize());

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
			// in this case widths of the areas are % from the available content width (bars excluded)
			var iAvailableContentSize = this._calcAvailableContentSize();

			// Resize finished, set layout data in content areas
			if (sSize1 === "auto" && sSize2 !== "auto") {
				// First pane has auto size - only change size of second pane
				sFinalSize2 = this._pxToPercent(iNewSize2, iAvailableContentSize);
				oLd2.setSize(sFinalSize2);
				oLd2._markModified();
			} else if (sSize1 !== "auto" && sSize2 === "auto") {
				// Second pane has auto size - only change size of first pane
				sFinalSize1 = this._pxToPercent(iNewSize1, iAvailableContentSize);
				oLd1.setSize(sFinalSize1);
				oLd1._markModified();
			} else {
				sFinalSize1 = this._pxToPercent(iNewSize1, iAvailableContentSize);
				sFinalSize2 = this._pxToPercent(iNewSize2, iAvailableContentSize);

				oLd1.setSize(sFinalSize1);
				oLd2.setSize(sFinalSize2);
				oLd1._markModified();
				oLd2._markModified();
			}
		} else { // Live-Resize, resize contents in Dom
			// in this case widths of the areas are % from the total size (bars included)
			var iTotalSplitterSize = this._getTotalSize();

			sFinalSize1 = this._pxToPercent(iNewSize1, iTotalSplitterSize);
			sFinalSize2 = this._pxToPercent(iNewSize2, iTotalSplitterSize);

			$Cnt1.css(this._sizeType, sFinalSize1);
			$Cnt2.css(this._sizeType, sFinalSize2);
		}
	};

	/**
	 * Upon bar resizing AssociativeSplitter sets layoutData's size to %.
	 * This override is needed to check if such % would exceed the available space.
	 * If so, the size is reduced.
	 * @override
	 */
	AssociativeSplitter.prototype._calcPercentBasedSizes = function (aPercentSizeIdx, iRemainingSize) {
		var aContentAreas = this._getContentAreas(),
			iAvailableContentSize = this._calcAvailableContentSize();

		// single area sized with % - let it take the full size
		if (aPercentSizeIdx.length === 1 && aContentAreas.length === 1) {
			this._calculatedSizes[aPercentSizeIdx[0]] = iAvailableContentSize;
			iRemainingSize -= iAvailableContentSize;
		} else {
			iRemainingSize = Splitter.prototype._calcPercentBasedSizes.apply(this, arguments);
		}

		var iMinSizeOfAutoSizedAreas = aContentAreas
			.filter(function (oArea) {
				return oArea.getLayoutData().getSize() === "auto";
			})
			.reduce(function (iSum, oArea) {
				return iSum + oArea.getLayoutData().getMinSize();
			}, 0);

		// calculated % exceed the available space - shrink areas if possible
		if (iRemainingSize < iMinSizeOfAutoSizedAreas) {
			var iNeededSize = Math.abs(iRemainingSize - iMinSizeOfAutoSizedAreas);

			// shrink areas from right to left
			for (var i = aPercentSizeIdx.length - 1; i >= 0; i--) {
				var iIdx = aPercentSizeIdx[i],
					oArea = aContentAreas[iIdx],
					iCalculatedSize = this._calculatedSizes[iIdx],
					oLD = oArea.getLayoutData();

				if (oLD._isMarked()) {
					var iNewSize = iCalculatedSize - iNeededSize;

					if (iNewSize < oLD.getMinSize()) {
						iNewSize = oLD.getMinSize();
					}

					this._calculatedSizes[iIdx] = iNewSize;

					var iIncreasedSize = iCalculatedSize - iNewSize;
					iNeededSize -= iIncreasedSize;
					iRemainingSize += iIncreasedSize;
				}

				// already shrunk enough
				if (iNeededSize <= 0) {
					break;
				}
			}
		}

		return iRemainingSize;
	};

	AssociativeSplitter.prototype._pxToPercent = function (iPx, iFullSize) {
		return (iPx * 100) / iFullSize + "%";
	};

	/**
	 * @override
	 */
	AssociativeSplitter.prototype._logConstraintsViolated = function () {
		Log.warning(
			"The set sizes and minimal sizes of the splitter contents are bigger than the available space in the UI. " +
			"Consider enabling the pagination mechanism by setting the 'requiredParentWidth' property of the panes",
			null,
			"sap.ui.layout.ResponsiveSplitter"
		);
	};

	AssociativeSplitter.prototype.containsControl = function (sControlId) {
		var aContentAreas = this._getContentAreas(),
			oContentArea,
			i;

		for (i = 0; i < aContentAreas.length; i++) {

			oContentArea = aContentAreas[i];

			if (oContentArea.isA("sap.ui.layout.AssociativeSplitter")) {
				if (oContentArea.containsControl(sControlId)) {
					return true;
				}
			} else {
				if (oContentArea.getId() === sControlId) {
					return true;
				}
			}
		}
	};

	return AssociativeSplitter;
});