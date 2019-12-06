/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Text', 'sap/ui/core/HTML', 'sap/ui/core/Icon', 'sap/ui/core/IconPool', 'sap/m/GenericTileRenderer', 'sap/m/GenericTileLineModeRenderer', 'sap/ui/Device', 'sap/ui/core/ResizeHandler' ],
	function(jQuery, library, Control, Text, HTML, Icon, IconPool, GenericTileRenderer, LineModeRenderer, Device, ResizeHandler) {
	"use strict";

	/**
	 * Constructor for a new sap.m.GenericTile control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class Displays the title, description, and a customizable main area.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.m.GenericTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GenericTile = Control.extend("sap.m.GenericTile", /** @lends sap.m.GenericTile.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {
				/**
				 * The mode of the GenericTile.
				 */
				"mode" : {type: "sap.m.GenericTileMode", group : "Appearance", defaultValue : sap.m.GenericTileMode.ContentMode},
				/**
				 * The header of the tile.
				 */
				"header" : {type : "string", group : "Appearance", defaultValue : null},
				/**
				 * The subheader of the tile.
				 */
				"subheader" : {type : "string", group : "Appearance", defaultValue : null},
				/**
				 * The message that appears when the control is in the Failed state.
				 */
				"failedText" : {type : "string", group : "Appearance", defaultValue : null},
				/**
				 * The size of the tile. If not set, then the default size is applied based on the device.
				 * @deprecated Since version 1.38.0. The GenericTile control has now a fixed size, depending on the used media (desktop, tablet or phone).
				 */
				"size" : {type : "sap.m.Size", group : "Misc", defaultValue : sap.m.Size.Auto},
				/**
				 * The frame type: 1x1 or 2x1.
				 */
				"frameType" : {type : "sap.m.FrameType", group : "Misc", defaultValue : sap.m.FrameType.OneByOne},
				/**
				 * The URI of the background image.
				 */
				"backgroundImage" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
				/**
				 * The image to be displayed as a graphical element within the header. This can be an image or an icon from the icon font.
				 */
				"headerImage" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
				/**
				 * The load status.
				 */
				"state" : {type : "sap.m.LoadState", group : "Misc", defaultValue : sap.m.LoadState.Loaded},
				/**
				 * Description of a header image that is used in the tooltip.
				 */
				"imageDescription" : {type : "string", group : "Misc", defaultValue : null},
				/**
				 * Width of the control.
				 * @since 1.44.50
				 */
				"width": {type: "sap.ui.core.CSSSize", group: "Appearance"}
			},
			aggregations : {
				/**
				 * The switchable view that depends on the tile type.
				 */
				"tileContent" : {type : "sap.m.TileContent", multiple : true, bindable : "bindable"},
				/**
				 * An icon or image to be displayed in the control.
				 * This aggregation is deprecated since version 1.36.0, to display an icon or image use sap.m.TileContent control instead.
				 * @deprecated Since version 1.36.0. This aggregation is deprecated, use sap.m.TileContent control to display an icon instead.
				 */
				"icon" : {type : "sap.ui.core.Control", multiple : false},
				/**
				 * The hidden aggregation for the title.
				 */
				"_titleText" : {type : "sap.m.Text", multiple : false, visibility : "hidden"},
				/**
				 * The hidden aggregation for the message in the failed state.
				 */
				"_failedMessageText" : {type : "sap.m.Text", multiple : false, visibility : "hidden"}
			},
			events : {
				/**
				 * The event is fired when the user chooses the tile.
				 */
				"press" : {}
			}
		},
		renderer : function (oRm, oControl) {
			if (oControl.getMode() === library.GenericTileMode.LineMode) {
				LineModeRenderer.render(oRm, oControl);
			} else {
				GenericTileRenderer.render(oRm, oControl);
			}
		}
	});

	/* --- Lifecycle Handling --- */

	GenericTile.prototype.init = function() {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		this._oTitle = new Text(this.getId() + "-title");
		this._oTitle.addStyleClass("sapMGTTitle");
		this._oTitle.cacheLineHeight = false;
		this.setAggregation("_titleText", this._oTitle, true);

		this._sFailedToLoad = this._rb.getText("INFOTILE_CANNOT_LOAD_TILE");
		this._sLoading = this._rb.getText("INFOTILE_LOADING");

		this._oFailedText = new Text(this.getId() + "-failed-txt", {
			maxLines : 2
		});
		this._oFailedText.cacheLineHeight = false;
		this._oFailedText.addStyleClass("sapMGTFailed");
		this.setAggregation("_failedMessageText", this._oFailedText, true);

		this._oWarningIcon = new Icon(this.getId() + "-warn-icon", {
			src : "sap-icon://notification",
			size : "1.375rem"
		});

		this._oWarningIcon.addStyleClass("sapMGTFtrFldIcnMrk");

		this._oBusy = new HTML(this.getId() + "-overlay");
		this._oBusy.setBusyIndicatorDelay(0);

		this._bThemeApplied = true;
		if (!sap.ui.getCore().isInitialized()) {
			this._bThemeApplied = false;
			sap.ui.getCore().attachInit(this._handleCoreInitialized.bind(this));
		} else {
			this._handleCoreInitialized();
		}
	};

	/**
	 * Handler for the core's init event. In order for the tile to adjust its rendering to the current theme,
	 * we attach a theme check in here when everything is properly initialized and loaded.
	 *
	 * @private
	 */
	GenericTile.prototype._handleCoreInitialized = function() {
		this._bThemeApplied = sap.ui.getCore().isThemeApplied();
		if (!this._bThemeApplied) {
			sap.ui.getCore().attachThemeChanged(this._handleThemeApplied, this);
		}
	};

	/**
	 * The tile recalculates its title's max-height when line-height could be loaded from CSS.
	 *
	 * @private
	 */
	GenericTile.prototype._handleThemeApplied = function() {
		this._bThemeApplied = true;
		this._oTitle.clampHeight();
		sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
	};

	GenericTile.prototype.onBeforeRendering = function() {
		var bSubheader = this.getSubheader() ? true : false;
		if (this.getMode() === library.GenericTileMode.HeaderMode) {
			this._applyHeaderMode(bSubheader);
		} else {
			this._applyContentMode(bSubheader);
		}
		var iTiles = this.getTileContent().length;
		for (var i = 0; i < iTiles; i++) {
			this.getTileContent()[i].setDisabled(this.getState() == sap.m.LoadState.Disabled);
		}

		this._generateFailedText();

		this.$().unbind("mouseenter", this._updateAriaAndTitle);
		this.$().unbind("mouseleave", this._removeTooltipFromControl);

		if (this._sParentResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sParentResizeListenerId = null;
		}

		if (this._$RootNode) {
			this._$RootNode.off(this._getAnimationEvents());
		}

		sap.ui.getCore().detachIntervalTimer(this._checkContentDensity, this);
	};

	GenericTile.prototype.onAfterRendering = function() {
		// attaches handler this._updateAriaAndTitle to the event mouseenter and removes attributes ARIA-label and title of all content elements
		this.$().bind("mouseenter", this._updateAriaAndTitle.bind(this));

		// attaches handler this._removeTooltipFromControl to the event mouseleave and removes control's own tooltips (Truncated header text and MicroChart tooltip).
		this.$().bind("mouseleave", this._removeTooltipFromControl.bind(this));

		this._bCompact = this._isCompact();
		var sMode = this.getMode();
		if (sMode === library.GenericTileMode.LineMode && this._bCompact) {
			// This class needs to be added in order to account for the paddings of the tile.
			// As this LineMode tile is rendered with display: inline, we cannot apply padding to each line separately, but only the
			// container can apply a padding for text containment. Thus, this class adds a preset padding-right to the tile's direct DOM parent.
			this.$().parent().addClass("sapMGTLineModeContainer");
			this._updateHoverStyle(true); //force update

			if (this.getParent() instanceof  Control) {
				this._sParentResizeListenerId = ResizeHandler.register(this.getParent(), this._handleResize.bind(this));
			} else {
				this._sParentResizeListenerId = ResizeHandler.register(this.$().parent(), this._handleResize.bind(this));
			}
		}

		// triggers update of all adjacent GenericTile LineMode siblings
		// this is needed for their visual update if this tile's properties change causing it to expand or shrink
		if (sMode === library.GenericTileMode.LineMode && this._bUpdateLineTileSiblings) {
			this._updateLineTileSiblings();
			this._bUpdateLineTileSiblings = false;
		}

		if (sMode === library.GenericTileMode.LineMode) {
			// attach an interval timer in order to check the control's density mode and invalidate on change
			sap.ui.getCore().attachIntervalTimer(this._checkContentDensity, this);
		}
	};

	/**
	 * Updates the tile's hover style in LineMode if the parent control is resized.
	 * This is needed for correct hover style and line-break calculations.
	 *
	 * @private
	 */
	GenericTile.prototype._handleResize = function() {
		if (this.getMode() === library.GenericTileMode.LineMode && this._isCompact() && this.getParent()) {
			this._queueAnimationEnd();
		}
	};

	/**
	 * Checks the current content density and invalidates the control if it changed in order to trigger a rerendering.
	 *
	 * @private
	 */
	GenericTile.prototype._checkContentDensity = function() {
		if (this.$().length > 0) {
			var bCompact = this.$().is(".sapUiSizeCompact") || this.$().closest(".sapUiSizeCompact").length > 0;
			if (bCompact !== this._bCompact) {
				this._bCompact = bCompact;
				sap.ui.getCore().detachIntervalTimer(this._checkContentDensity);
				this.invalidate();
			}
		}
	};

	/**
	 * Calculates all data that is necessary for displaying style helpers in LineMode (compact).
	 * These helpers are used in order to imitate a per-line box effect.
	 *
	 * @returns {object|null} An object containing general data about the style helpers and information about each
	 *                        single line or null if the tile is invisible or not in compact density.
	 * @private
	 */
	GenericTile.prototype._calculateStyleData = function() {
		this.$("lineBreak").remove();

		if (!this._isCompact() || !this.getDomRef() || this.$().is(":hidden")) {
			return null;
		}

		var $this = this.$(),
			$End = this.$("endMarker"),
			$Start =  this.$("startMarker");

		//due to animations or transitions, this function is called when no rendering has been done yet. So we have to check if the markers are available.
		if ($End.length === 0 || $Start.length === 0) {
			return null;
		}

		var iLines = this._getLineCount(),
			iBarOffsetX, iBarOffsetY,
			iBarPaddingTop = Math.ceil(LineModeRenderer._getCSSPixelValue(this, "margin-top")),
			iBarWidth,
			iAvailableWidth = this.$().parent().innerWidth(),
			iLineHeight = Math.ceil(LineModeRenderer._getCSSPixelValue(this, "min-height")), //line height
			iHeight = LineModeRenderer._getCSSPixelValue(this, "line-height"), //height including gap between lines
			bLineBreak = this.$().is(":not(:first-child)") && iLines > 1,
			$LineBreak = jQuery("<span><br /></span>"),
			i = 0,
			bRTL = sap.ui.getCore().getConfiguration().getRTL(),
			oEndMarkerPosition = $End.position();

		if (bLineBreak) { //tile does not fit in line without breaking --> add line-break before tile
			$LineBreak.attr("id", this.getId() + "-lineBreak");
			$this.prepend($LineBreak);

			iLines = this._getLineCount();
			oEndMarkerPosition = $End.position();
		}

		var oStyleData = {
			rtl: bRTL,
			lineBreak: bLineBreak,
			startOffset: $Start.offset(),
			endOffset: $End.offset(),
			availableWidth: iAvailableWidth,
			lines: []
		};

		var oLineBreakPosition;
		if (Device.browser.msie || Device.browser.edge) {
			//in IE, the line break's position cannot be determined by the container, but only by the br element
			oLineBreakPosition = $LineBreak.find("br").position();
		} else {
			oLineBreakPosition = $LineBreak.position();
		}

		var oStyleHelperPosition = oLineBreakPosition;
		if (!(Device.browser.mozilla || Device.browser.msie || Device.browser.edge) && oLineBreakPosition.left < oEndMarkerPosition.left) {
			//if the line break is positioned left of the end marker (RTL), the end marker's position
			//is used by the browser to determine the origin of the tile
			oStyleHelperPosition = oEndMarkerPosition;
		}

		oStyleData.positionLeft = bLineBreak ? oLineBreakPosition.left : $this.position().left;
		oStyleData.positionRight = bLineBreak ? $this.width() - oStyleHelperPosition.left : oStyleData.availableWidth - $this.position().left;
		if (!bLineBreak && iLines > 1) {
			oStyleData.positionRight = $Start.parent().innerWidth() - ($Start.position().left + $Start.width());
		}

		for (i; i < iLines; i++) {
			if (bLineBreak && i === 0) {
				continue;
			}

			//set bar width
			if (iLines === 1) { //first and only line
				iBarOffsetX = bRTL ? oStyleData.availableWidth - oStyleData.positionLeft : oStyleData.positionLeft;
				iBarWidth = $this.width();
			} else if (i === iLines - 1) { //last line
				iBarOffsetX = 0;
				iBarWidth = bRTL ? $this.width() - oEndMarkerPosition.left : oEndMarkerPosition.left;
			} else if (bLineBreak && i === 1) { //first line for wrapped tile
				iBarOffsetX = 0;
				iBarWidth = iAvailableWidth;
			} else {
				iBarOffsetX = 0;
				iBarWidth = iAvailableWidth;
			}
			iBarOffsetY = i * iHeight + iBarPaddingTop;

			oStyleData.lines.push({
				offset: {
					x: iBarOffsetX,
					y: iBarOffsetY
				},
				width: iBarWidth,
				height: iLineHeight
			});
		}
		return oStyleData;
	};

	/**
	 * Calculates all style and caches it if it has changed.
	 * @returns {boolean} True if the data has changed, false if no changes have been detected by jQuery.sap.equal
	 * @private
	 */
	GenericTile.prototype._getStyleData = function() {
		var oStyleData = this._calculateStyleData();

		if (!jQuery.sap.equal(this._oStyleData, oStyleData)) {
			delete this._oStyleData;

			//cache style data in order for it to be reused by other functions
			this._oStyleData = oStyleData;
			return true;
		}

		return false;
	};

	/**
	 * Generates the animation events with namespaces.
	 *
	 * @returns {string} A string containing the animation events with instance-specific namespaces
	 * @private
	 */
	GenericTile.prototype._getAnimationEvents = function() {
		return "transitionend.sapMGT$id animationend.sapMGT$id".replace(/\$id/g, jQuery.sap.camelCase(this.getId()));
	};

	/**
	 * Triggers and update of the hover style of the tile in compact LineMode.
	 * Also attaches the UIArea's transitionend and animationend events to an event handler in order for
	 * the tile's hover style to be updated after e.g. a sap.m.NavContainer causes the whole page to be flipped.
	 * This is done in order to avoid miscalculations.
	 *
	 * @param {boolean} forceUpdate If set to true, the tile's hover style is updated even if the data has not changed.
	 * @private
	 */
	GenericTile.prototype._updateHoverStyle = function(forceUpdate) {
		if (!this._getStyleData() && !forceUpdate) {
			return;
		}

		this._clearAnimationUpdateQueue();
		this._cHoverStyleUpdates = -1;
		this._oAnimationEndCallIds = {};
		if (this._oStyleData && this._oStyleData.lineBreak && this.getUIArea()) {
			this._$RootNode = jQuery(this.getUIArea().getRootNode());

			//attach browser event handlers to wait for transitions and animations to end
			this._$RootNode.on(this._getAnimationEvents(), this._queueAnimationEnd.bind(this));
		}

		this._queueAnimationEnd();
	};

	/**
	 * Handles every animationend or transitionend event and adds the new event to a queue, only the last element of which
	 * is to be executed in order to update the tile's hover style.
	 *
	 * @param {jQuery.Event} [oEvent] The animationend or transitionend event object
	 * @private
	 */
	GenericTile.prototype._queueAnimationEnd = function(oEvent) {
		if (oEvent) {
			var $Target = jQuery(oEvent.target);

			if ($Target.is(".sapMGT, .sapMGT *")) { //exclude other GenericTiles and all of their contents
				return false; //stop bubbling and prevent default behaviour
			}
		}

		//initialize helper variables
		if (typeof this._cHoverStyleUpdates !== "number") {
			this._cHoverStyleUpdates = -1;
		}
		if (!this._oAnimationEndCallIds) {
			this._oAnimationEndCallIds = {};
		}

		this._cHoverStyleUpdates++;

		var sCallId = jQuery.sap.delayedCall(10, this, this._handleAnimationEnd, [ this._cHoverStyleUpdates ]);
		this._oAnimationEndCallIds[this._cHoverStyleUpdates] = sCallId;
	};

	/**
	 * Executes the actual hover style update of the tile if the given queueIndex is the last item in the Mutex queue.
	 *
	 * @param {int} hoverStyleUpdateCount The action's index in the mutex queue
	 * @private
	 */
	GenericTile.prototype._handleAnimationEnd = function(hoverStyleUpdateCount) {
		delete this._oAnimationEndCallIds[hoverStyleUpdateCount]; //delayedCall is finished and its ID can be removed

		if (this._cHoverStyleUpdates === hoverStyleUpdateCount) {
			this._getStyleData();
			LineModeRenderer._updateHoverStyle.call(this);
		}
	};

	/**
	 * Clears all delayed calls which have been started by this control.
	 *
	 * @private
	 */
	GenericTile.prototype._clearAnimationUpdateQueue = function() {
		for (var k in this._oAnimationEndCallIds) {
			jQuery.sap.clearDelayedCall(this._oAnimationEndCallIds[k]);
			delete this._oAnimationEndCallIds[k];
		}
	};

	/**
	 * Calculates the number of lines in the compact line tile by simply dividing the tile's entire height by the
	 * tile's line height.
	 *
	 * @returns {number} The number of lines
	 * @private
	 */
	GenericTile.prototype._getLineCount = function() {
		var oClientRect = this.getDomRef().getBoundingClientRect(),
			cHeight = LineModeRenderer._getCSSPixelValue(this, "line-height"); //height including gap between lines

		return Math.round(oClientRect.height / cHeight);
	};

	/**
	 * Provides an interface to the tile's layout information consistent in all modes and content densities.
	 *
	 * @returns {object[]} An array containing all of the tile's bounding rectangles
	 * @experimental since 1.44.1 This method's implementation is subject to change
	 * @protected
	 */
	GenericTile.prototype.getBoundingRects = function() {
		var oPosition = this.$().position();
		if (this.getMode() === library.GenericTileMode.LineMode && this._isCompact()) {
			this._getStyleData();
			var aRects = [];

			for (var i = 0; i < this._oStyleData.lines.length; i++) {
				aRects[i] = this._oStyleData.lines[i];

				if (this._oStyleData.rtl) {
					aRects[i].offset.x = this._oStyleData.availableWidth - aRects[i].width; //turn x-coordinate back around
				}
				aRects[i].offset.y += oPosition.top; //add style helper top to make coordinate relative to tile, instead of style helper
			}
			return aRects;
		} else {
			return [ {
				offset: {
					x: oPosition.left,
					y: oPosition.top
				},
				width: this.$().width(),
				height: this.$().height()
			} ];
		}
	};

	/**
	 * Updates the hover style of all siblings that are tiles in LineMode.
	 *
	 * @private
	 */
	GenericTile.prototype._updateLineTileSiblings = function() {
		var oParent = this.getParent();
		if (this.getMode() === library.GenericTileMode.LineMode && this._isCompact() && oParent) {
			var i = oParent.indexOfAggregation(this.sParentAggregationName, this);
			var aSiblings = oParent.getAggregation(this.sParentAggregationName).splice(i + 1);

			for (i = 0; i < aSiblings.length; i++) {
				var oSibling = aSiblings[i];
				if (oSibling instanceof sap.m.GenericTile && oSibling.getMode() === library.GenericTileMode.LineMode) {
					oSibling._updateHoverStyle();
				}
			}
		}
	};

	GenericTile.prototype.exit = function() {
		if (this._sParentResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sParentResizeListenerId = null;
		}

		sap.ui.getCore().detachIntervalTimer(this._checkContentDensity, this);

		if (this._$RootNode) {
			this._$RootNode.off(this._getAnimationEvents());
			this._$RootNode = null;
		}

		//stop any currently running queue
		this._clearAnimationUpdateQueue();

		this._oWarningIcon.destroy();
		if (this._oImage) {
			this._oImage.destroy();
		}
		this._oBusy.destroy();
	};

	/* --- Event Handling --- */
	/**
	 * Handler for touchstart event
	 */
	GenericTile.prototype.ontouchstart = function() {
		if (this.$("hover-overlay").length > 0) {
			this.$("hover-overlay").addClass("sapMGTPressActive");
		}
		if (this.getMode() === library.GenericTileMode.LineMode) {
			this.addStyleClass("sapMGTLineModePress");
		}
		if (Device.browser.internet_explorer && this.getState() !== sap.m.LoadState.Disabled) {
			this.$().focus();
		}
	};

	/**
	 * Handler for touchcancel event
	 */
	GenericTile.prototype.ontouchcancel = function() {
		if (this.$("hover-overlay").length > 0) {
			this.$("hover-overlay").removeClass("sapMGTPressActive");
		}
	};

	/**
	 * Handler for touchend event
	 */
	GenericTile.prototype.ontouchend = function() {
		if (this.$("hover-overlay").length > 0) {
			this.$("hover-overlay").removeClass("sapMGTPressActive");
		}
		if (this.getMode() === library.GenericTileMode.LineMode) {
			this.removeStyleClass("sapMGTLineModePress");
		}
		if (Device.browser.internet_explorer && this.getState() !== sap.m.LoadState.Disabled) {
			this.$().focus();
		}
	};

	/**
	 * Handler for tap event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.ontap = function(oEvent) {
		if (this.getState() !== sap.m.LoadState.Disabled) {
			if (Device.browser.internet_explorer) {
				this.$().focus();
			}
			this.firePress();
			oEvent.preventDefault();
		}
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.onkeydown = function(oEvent) {
		if (jQuery.sap.PseudoEvents.sapselect.fnCheck(oEvent) && this.getState() !== sap.m.LoadState.Disabled) {
			if (this.$("hover-overlay").length > 0) {
				this.$("hover-overlay").addClass("sapMGTPressActive");
			}
			oEvent.preventDefault();
		}
	};

	/**
	 * Handler for keyup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.onkeyup = function(oEvent) {
		if (jQuery.sap.PseudoEvents.sapselect.fnCheck(oEvent) && this.getState() !== sap.m.LoadState.Disabled) {
			if (this.$("hover-overlay").length > 0) {
				this.$("hover-overlay").removeClass("sapMGTPressActive");
			}
			this.firePress();
			oEvent.preventDefault();
		}
	};

	/* --- Getters and Setters --- */

	GenericTile.prototype.setProperty = function(sPropertyName) {
		sap.ui.core.Control.prototype.setProperty.apply(this, arguments);

		//If these properties are being changed, update all sibling controls that are GenericTiles in LineMode
		var aLineModeProperties = [ "state", "subheader", "header" ];
		if (this.getMode() === library.GenericTileMode.LineMode && aLineModeProperties.indexOf(sPropertyName) !== -1) {
			this._bUpdateLineTileSiblings = true;
		}
		return this;
	};

	GenericTile.prototype.getHeader = function() {
		return this._oTitle.getText();
	};

	GenericTile.prototype.setHeader = function(title) {
		this._oTitle.setText(title);
		return this;
	};

	GenericTile.prototype.setHeaderImage = function(uri) {
		var bValueChanged = !jQuery.sap.equal(this.getHeaderImage(), uri);

		if (bValueChanged) {
			if (this._oImage) {
				this._oImage.destroy();
				this._oImage = undefined;
			}

			if (uri) {
				this._oImage = IconPool.createControlByURI({
					id : this.getId() + "-icon-image",
					src : uri
				}, sap.m.Image);

				this._oImage.addStyleClass("sapMGTHdrIconImage");
			}
		}
		return this.setProperty("headerImage", uri);
	};

	/**
	 * Sets the HeaderMode for GenericTile
	 *
	 * @param {boolean} bSubheader which indicates the existance of subheader
	 */
	GenericTile.prototype._applyHeaderMode = function(bSubheader) {
		// when subheader is available, the header can have maximal 4 lines and the subheader can have 1 line
		// when subheader is unavailable, the header can have maximal 5 lines
		if (bSubheader) {
			this._oTitle.setMaxLines(4);
		} else {
			this._oTitle.setMaxLines(5);
		}

		this._changeTileContentContentVisibility(false);
	};

	/**
	 * Sets the ContentMode for GenericTile
	 *
	 * @param {boolean} bSubheader Indicates the existence of subheader
	 */
	GenericTile.prototype._applyContentMode = function (bSubheader) {
		// when subheader is available, the header can have maximal 2 lines and the subheader can have 1 line
		// when subheader is unavailable, the header can have maximal 3 lines
		if (bSubheader) {
			this._oTitle.setMaxLines(2);
		} else {
			this._oTitle.setMaxLines(3);
		}

		this._changeTileContentContentVisibility(true);
	};

	/**
	 * Changes the visibility of the TileContent's content
	 *
	 * @param {boolean} visible Determines if the content should be made visible or not
	 * @private
	 */
	GenericTile.prototype._changeTileContentContentVisibility = function (visible) {
		var aTileContent;

		aTileContent = this.getTileContent();
		for (var i = 0; i < aTileContent.length; i++) {
			aTileContent[i].setRenderContent(visible);
		}
	};

	/**
	 * Gets the header, subheader and image description text of GenericTile
	 *
	 * @private
	 * @returns {String} The text
	 */
	GenericTile.prototype._getHeaderAriaAndTooltipText = function() {
		var sText = "";
		var bIsFirst = true;
		if (this.getHeader()) {
			sText += this.getHeader();
			bIsFirst = false;
		}

		if (this.getSubheader()) {
			sText += (bIsFirst ? "" : "\n") + this.getSubheader();
			bIsFirst = false;
		}

		if (this.getImageDescription()) {
			sText += (bIsFirst ? "" : "\n") + this.getImageDescription();
		}
		return sText;
	};

	/**
	 * Gets the ARIA label or tooltip text of the content in GenericTile
	 *
	 * @private
	 * @returns {String} The text
	 */
	GenericTile.prototype._getContentAriaAndTooltipText = function() {
		var sText = "";
		var bIsFirst = true;
		var aTiles = this.getTileContent();

		for (var i = 0; i < aTiles.length; i++) {
			if (jQuery.isFunction(aTiles[i]._getAriaAndTooltipText)) {
				sText += (bIsFirst ? "" : "\n") + aTiles[i]._getAriaAndTooltipText();
			} else if (aTiles[i].getTooltip_AsString()) {
				sText += (bIsFirst ? "" : "\n") + aTiles[i].getTooltip_AsString();
			}
			bIsFirst = false;
		}
		return sText;
	};

	/**
	 * Returns a text for the ARIA label as combination of header and content texts
	 * when the tooltip is empty
	 * @private
	 * @returns {String} The ARIA label text
	 */
	GenericTile.prototype._getAriaAndTooltipText = function() {
		var sAriaText = (this.getTooltip_AsString() && !this._isTooltipSuppressed()) ? this.getTooltip_AsString() : (this._getHeaderAriaAndTooltipText() + "\n" + this._getContentAriaAndTooltipText());
		switch (this.getState()) {
			case sap.m.LoadState.Disabled :
				return "";
			case sap.m.LoadState.Loading :
				return sAriaText + "\n" + this._sLoading;
			case sap.m.LoadState.Failed :
				return sAriaText + "\n" + this._oFailedText.getText();
			default :
				if (jQuery.trim(sAriaText).length === 0) { // If the string is empty or just whitespace, IE renders an empty tooltip (e.g. "" + "\n" + "")
					return "";
				} else {
					return sAriaText;
				}
		}
	};

	/**
	 * Returns text for ARIA label.
	 * If the the application provides a specific tooltip, the ARIA label is equal to the tooltip text.
	 * If the application doesn't provide a tooltip or the provided tooltip contains only white spaces,
	 * calls _getAriaAndTooltipText to get text.
	 *
	 * @private
	 * @returns {String} Text for ARIA label.
	 */
	GenericTile.prototype._getAriaText = function() {
		var sAriaText = this.getTooltip_Text();
		if (!sAriaText || this._isTooltipSuppressed()) {
			sAriaText = this._getAriaAndTooltipText(); // ARIA label set by the control
		}
		return sAriaText; // ARIA label set by the app, equal to tooltip
	};

	/**
	 * Returns text for tooltip or null.
	 * If the the application provides a specific tooltip, the returned string is equal to the tooltip text.
	 * If the tooltip provided by the application is a string of only white spaces, the function returns null.
	 *
	 * @returns {String} Text for tooltip or null.
	 * @private
	 */
	GenericTile.prototype._getTooltipText = function() {
		var sTooltip = this.getTooltip_Text(); // checks (typeof sTooltip === "string" || sTooltip instanceof String || sTooltip instanceof sap.ui.core.TooltipBase), returns text, null or undefined
		if (this._isTooltipSuppressed() === true) {
			sTooltip = null; // tooltip suppressed by the app
		}
		return sTooltip; // tooltip set by the app
	};

	/* --- Helpers --- */

	/**
	 * Shows or hides the footer of the TileContent control during rendering time
	 *
	 * @private
	 * @param {sap.m.TileContent} tileContent TileContent control of which the footer visibility is set
	 * @param {sap.m.GenericTile} control current GenericTile instance
	 */
	GenericTile.prototype._checkFooter = function(tileContent, control) {
		if (control.getProperty("state") === sap.m.LoadState.Failed) {
			tileContent.setRenderFooter(false);
		} else {
			tileContent.setRenderFooter(true);
		}
	};

	/**
	 * Generates text for failed state.
	 * To avoid multiple calls e.g. in every _getAriaAndTooltipText call, this is done in onBeforeRendering.
	 *
	 * @private
	 */
	GenericTile.prototype._generateFailedText = function() {
		var sCustomFailedMsg = this.getFailedText();
		var sFailedMsg = sCustomFailedMsg ? sCustomFailedMsg : this._sFailedToLoad;
		this._oFailedText.setText(sFailedMsg);
		this._oFailedText.setTooltip(sFailedMsg);
	};

	/**
	 * Returns true if the application suppressed the tooltip rendering, otherwise false.
	 *
	 * @private
	 * @returns {boolean} true if the application suppressed the tooltip rendering, otherwise false.
	 */
	GenericTile.prototype._isTooltipSuppressed = function() {
		var sTooltip = this.getTooltip_Text();
		if (sTooltip && sTooltip.length > 0 && jQuery.trim(sTooltip).length === 0) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Returns true if header text is truncated, otherwise false.
	 *
	 * @private
	 * @returns {boolean} true or false
	 */
	GenericTile.prototype._isHeaderTextTruncated = function() {
		var oDom, iMaxHeight;
		oDom = this.getAggregation("_titleText").getDomRef("inner");
		iMaxHeight = this.getAggregation("_titleText").getClampHeight(oDom);

		if (oDom && iMaxHeight < oDom.scrollHeight) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Returns true if subheader text is truncated, otherwise false.
	 *
	 * @private
	 * @returns {boolean} true or false
	 */
	GenericTile.prototype._isSubheaderTextTruncated = function() {
		var $SubheaderContainer = this.$("subHdr-text");
		if ($SubheaderContainer && $SubheaderContainer.length && $SubheaderContainer[0].offsetWidth < $SubheaderContainer[0].scrollWidth) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Sets tooltip for GenericTile when the content inside is MicroChart or the header text is truncated.
	 * The tooltip set by user will overwrite the tooltip from Control.
	 *
	 * @private
	 */
	GenericTile.prototype._setTooltipFromControl = function() {
		var oContent, sTooltip = "";
		var bIsFirst = true;
		var aTiles = this.getTileContent();

		// when header text is truncated, set header text as tooltip
		if (this._isHeaderTextTruncated()) {
			sTooltip = this._oTitle.getText();
			bIsFirst = false;
		}

		// when subheader text is truncated, set subheader text as tooltip
		if (this._isSubheaderTextTruncated()) {
			sTooltip += (bIsFirst ? "" : "\n") + this.getSubheader();
			bIsFirst = false;
		}

		// when MicroChart in GenericTile, set MicroChart tooltip as GenericTile tooltip
		for (var i = 0; i < aTiles.length; i++) {
			oContent = aTiles[i].getContent();
			if (oContent && oContent.getMetadata().getLibraryName() === "sap.suite.ui.microchart") {
				sTooltip += (bIsFirst ? "" : "\n") + oContent.getTooltip_AsString();
			}
			bIsFirst = false;
		}

		// when user does not set tooltip, apply the tooltip above
		if (sTooltip && !this._getTooltipText() && !this._isTooltipSuppressed()) {
			this.$().attr("title", sTooltip);
			this._bTooltipFromControl = true;
		}
	};

	/**
	 * Updates the attributes ARIA-label and title of the GenericTile. The updated attribute title is used for tooltip as well.
	 * The attributes ARIA-label and title of the descendants will be removed.
	 *
	 * @private
	 */
	GenericTile.prototype._updateAriaAndTitle = function () {
		var sAriaAndTitleText = this._getAriaAndTooltipText();
		var sAriaText = this._getAriaText();
		var $Tile = this.$();

		if ($Tile.attr("title") !== sAriaAndTitleText) {
			$Tile.attr("aria-label", sAriaText);
		}
		$Tile.find('*').removeAttr("aria-label").removeAttr("title").unbind("mouseenter");

		this._setTooltipFromControl();
	};

	/**
	 * When mouse leaves GenericTile, removes the GenericTile's own tooltip (truncated header text or MicroChart tooltip), do not remove the tooltip set by user.
	 * The reason is tooltip from control should not be displayed any more when the header text becomes short or MicroChart is not in GenericTile.
	 *
	 * @private
	 */
	GenericTile.prototype._removeTooltipFromControl = function() {
		if (this._bTooltipFromControl) {
			this.$().removeAttr("title");
			this._bTooltipFromControl = false;
		}
	};

	/**
	 * Checks whether the control has compact content density.
	 * @returns {boolean} Returns true if the control or its parents have the class sapUiSizeCompact, otherwise false.
	 * @private
	 */
	GenericTile.prototype._isCompact = function() {
		return GenericTile.__getContentDensity(this) === "sapUiSizeCompact";
	};

	/**
	 * Returns the content density style class which is relevant for the given control. First it tries to find the
	 * definition via the control API. While traversing the controls parents, it's tried to find the closest DOM
	 * reference. If that is found, the check will use the DOM reference to find the closest content density style class
	 * in the parent chain. This approach caters both use cases: content density defined at DOM and/or control level.
	 *
	 * If at the same level, several style classes are defined, this is the priority:
	 * sapUiSizeCompact, sapUiSizeCondensed, sapUiSizeCozy
	 *
	 * @param {sap.ui.table.Table} oControl Instance of the table
	 * @returns {String|undefined} name of the content density stlye class or undefined if none was found
	 * @private
	 * @static
	 */
	GenericTile.__getContentDensity = function(oControl) {
		var sContentDensity;
		var aContentDensityStyleClasses = ["sapUiSizeCompact", "sapUiSizeCondensed", "sapUiSizeCozy"];

		var fnGetContentDensity = function (sFnName, oObject) {
			if (!oObject[sFnName]) {
				return;
			}

			for (var i = 0; i < aContentDensityStyleClasses.length; i++) {
				if (oObject[sFnName](aContentDensityStyleClasses[i])) {
					return aContentDensityStyleClasses[i];
				}
			}
		};

		var $DomRef = oControl.$();
		if ($DomRef.length > 0) {
			// table was already rendered, check by DOM and return content density class
			sContentDensity = fnGetContentDensity("hasClass", $DomRef);
		} else {
			sContentDensity = fnGetContentDensity("hasStyleClass", oControl);
		}

		if (sContentDensity) {
			return sContentDensity;
		}

		// since the table was not yet rendered, traverse its parents:
		//   - to find a content density defined at control level
		//   - to find the first DOM reference and then check on DOM level
		var oParentDomRef = null;
		var oParent = oControl.getParent();
		// the table might not have a parent at all.
		if (oParent) {
			// try to get the DOM Ref of the parent. It might be required to traverse the complete parent
			// chain to find one parent which has DOM rendered, as it may happen that an element does not have
			// a corresponding DOM Ref
			do {
				// if the content density is defined at control level, we can return it, no matter the control was already
				// rendered. By the time it will be rendered, it will have that style class
				sContentDensity = fnGetContentDensity("hasStyleClass", oParent);
				if (sContentDensity) {
					return sContentDensity;
				}

				// if there was no style class set at control level, we try to find the DOM reference. Using that
				// DOM reference, we can easily check for the content density style class via the DOM. This allows us
				// to include e.g. the body tag as well.
				if (oParent.getDomRef) {
					// for Controls and elements
					oParentDomRef = oParent.getDomRef();
				} else if (oParent.getRootNode) {
					// for UIArea
					oParentDomRef = oParent.getRootNode();
				}

				if (!oParentDomRef && oParent.getParent) {
					oParent = oParent.getParent();
				} else {
					// make sure there is not endless loop if oParent has no getParent function
					oParent = null;
				}
			} while (oParent && !oParentDomRef);
		}

		// if we found a DOM reference, check for content density
		$DomRef = jQuery(oParentDomRef || document.body);
		sContentDensity = fnGetContentDensity("hasClass", $DomRef.closest("." + aContentDensityStyleClasses.join(",.")));

		return sContentDensity;
	};

	return GenericTile;
}, /* bExport= */ true);
