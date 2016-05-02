/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.AssociativeSplitter.
sap.ui.define(['./Splitter', './SplitterRenderer'],
	function (Splitter, SplitterRenderer) {
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
			if (content[i] == id) {
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

	AssociativeSplitter.prototype.ondblclick = function (oEvent) {
		// For some reason dblclick returns the whole Splitter not only the clicked splitbar
		var sId = this.getId();
		if (!this._oLastDOMclicked || this._oLastDOMclicked.id.indexOf(sId + "-splitbar") != 0) {
			// The clicked element was not one of my splitter bars
			return;
		}

		var iBar = parseInt(this._oLastDOMclicked.id.substr((sId + "-splitbar-").length), 10);
		var oContentArea = this._getContentAreas()[iBar];

		if (oContentArea._sOldLayoutData && oContentArea._sOldLayoutData !== "0px") {
			oContentArea.setLayoutData(new sap.ui.layout.SplitterLayoutData({ size: oContentArea._sOldLayoutData }));
			oContentArea._sOldLayoutData = undefined;
		} else {
			oContentArea._sOldLayoutData = oContentArea.getLayoutData().getSize();
			oContentArea.setLayoutData(new sap.ui.layout.SplitterLayoutData({ size: "0px" }));
		}

		this._ensureAllSplittersCollapsed(iBar);
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
		if (!oJEv.target.id || oJEv.target.id.indexOf(sId + "-splitbar") != 0) {
			// The clicked element was not one of my splitter bars
			return;
		}

		this._ignoreTouch = true;
		this._onBarMoveStart(oJEv);
		this._oLastDOMclicked = oJEv.target;
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
		if (!oJEv.target.id || oJEv.target.id.indexOf(sId + "-splitbar") != 0) {
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

	AssociativeSplitter.prototype._ensureAllSplittersCollapsed = function (iBar) {
		var aAreas = this._getContentAreas();
		var bAllCollapsed = false;
		for (var i = 0; i < aAreas.length; i++) {
			var sSize = aAreas[i].getLayoutData().getSize().slice(0, -2);

			if (sSize == "0" || sSize == "au") {
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

}, /* bExport= */ false);