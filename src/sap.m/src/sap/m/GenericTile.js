/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/m/Text',
	'sap/ui/core/HTML',
	'sap/ui/core/Icon',
	'sap/ui/core/IconPool',
	'sap/m/Button',
	'sap/m/GenericTileRenderer',
	'sap/m/GenericTileLineModeRenderer',
	'sap/ui/Device',
	'sap/ui/core/ResizeHandler',
	"sap/base/strings/camelize",
	"sap/base/util/deepEqual",
	"sap/ui/events/PseudoEvents",
	"sap/ui/thirdparty/jquery"
], function (
	library,
	Control,
	Text,
	HTML,
	Icon,
	IconPool,
	Button,
	GenericTileRenderer,
	LineModeRenderer,
	Device,
	ResizeHandler,
	camelize,
	deepEqual,
	PseudoEvents,
	jQuery
) {
	"use strict";

	var GenericTileScope = library.GenericTileScope,
		LoadState = library.LoadState,
		FrameType = library.FrameType,
		Size = library.Size,
		GenericTileMode = library.GenericTileMode,
		TileSizeBehavior = library.TileSizeBehavior,
		WrappingType = library.WrappingType;

	var DEVICE_SET = "GenericTileDeviceSet";

	/**
	 * Constructor for a new sap.m.GenericTile control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class Displays header, subheader, and a customizable main area in a tile format. Since 1.44, also an in-line format which contains only header and subheader is supported.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34.0
	 *
	 * @public
	 * @alias sap.m.GenericTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GenericTile = Control.extend("sap.m.GenericTile", /** @lends sap.m.GenericTile.prototype */ {
		metadata: {

			library: "sap.m",
			properties: {
				/**
				 * The mode of the GenericTile.
				 */
				mode: {type: "sap.m.GenericTileMode", group: "Appearance", defaultValue: GenericTileMode.ContentMode},
				/**
				 * The header of the tile.
				 */
				header: {type: "string", group: "Appearance", defaultValue: null},
				/**
				 * The subheader of the tile.
				 */
				subheader: {type: "string", group: "Appearance", defaultValue: null},
				/**
				 * The message that appears when the control is in the Failed state.
				 */
				failedText: {type: "string", group: "Appearance", defaultValue: null},
				/**
				 * The size of the tile. If not set, then the default size is applied based on the device.
				 * @deprecated Since version 1.38.0. The GenericTile control has now a fixed size, depending on the used media (desktop, tablet or phone).
				 */
				size: {type: "sap.m.Size", group: "Misc", defaultValue: Size.Auto},
				/**
				 * The frame type: OneByOne or TwoByOne. Set to OneByOne as default if no property is defined or set to Auto by the app.
				 */
				frameType: {type: "sap.m.FrameType", group: "Misc", defaultValue: FrameType.OneByOne},
				/**
				 * The URI of the background image.
				 */
				backgroundImage: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},
				/**
				 * The image to be displayed as a graphical element within the header. This can be an image or an icon from the icon font.
				 */
				headerImage: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},
				/**
				 * The load status.
				 */
				state: {type: "sap.m.LoadState", group: "Misc", defaultValue: LoadState.Loaded},
				/**
				 * Description of a header image that is used in the tooltip.
				 */
				imageDescription: {type: "string", group: "Accessibility", defaultValue: null},
				/**
				 * Changes the visualization in order to enable additional actions with the Generic Tile.
				 * @since 1.46.0
				 */
				scope: {type: "sap.m.GenericTileScope", group: "Misc", defaultValue: GenericTileScope.Display},
				/**
				 *  If set to <code>TileSizeBehavior.Small</code>, the tile size is the same as it would be on a small-screened phone (374px wide and lower),
				 *  regardless of the screen size of the actual device being used.
				 *  If set to <code>TileSizeBehavior.Responsive</code>, the tile size adapts to the size of the screen.
				 */
				sizeBehavior: {type: "sap.m.TileSizeBehavior", defaultValue: TileSizeBehavior.Responsive},
				/**
				 * Additional description for aria-label. The aria-label is rendered before the standard aria-label.
				 * @since 1.50.0
				 */
				ariaLabel: {type: "string", group: "Accessibility", defaultValue: null},
				/**
				 * Defines the type of text wrapping to be used (hyphenated or normal).
				 * @since 1.60
				 */
				wrappingType: {type: "sap.m.WrappingType", group: "Appearance", defaultValue: WrappingType.Normal},
				/**
				 * Width of the control.
				 * @since 1.72
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Appearance"}
			},
			defaultAggregation: "tileContent",
			aggregations: {
				/**
				 * The content of the tile.
				 */
				tileContent: {type: "sap.m.TileContent", multiple: true, bindable: "bindable"},
				/**
				 * An icon or image to be displayed in the control.
				 * This aggregation is deprecated since version 1.36.0, to display an icon or image use sap.m.ImageContent control instead.
				 * @deprecated since version 1.36.0. This aggregation is deprecated, use sap.m.ImageContent control to display an icon instead.
				 */
				icon: {type: "sap.ui.core.Control", multiple: false},
				/**
				 * The hidden aggregation for the title.
				 */
				_titleText: {type: "sap.m.Text", multiple: false, visibility: "hidden"},
				/**
				 * The hidden aggregation for the message in the failed state.
				 */
				_failedMessageText: {type: "sap.m.Text", multiple: false, visibility: "hidden"}
			},
			events: {
				/**
				 * The event is triggered when the user presses the tile.
				 */
				press: {
					parameters: {
						/**
						 * The current scope the GenericTile was in when the event occurred.
						 * @since 1.46.0
						 */
						scope: {type: "sap.m.GenericTileScope"},

						/**
						 * The action that was pressed on the tile. In the Actions scope, the available actions are Press and Remove.
						 * In Display scope, the parameter value is only Press.
						 * @since 1.46.0
						 */
						action: {type: "string"},

						/**
						 * The pressed DOM Element pointing to the GenericTile's DOM Element in Display scope.
						 * In Actions scope it points to the more icon, when the tile is pressed, or to the DOM Element of the remove button, when the remove button is pressed.
						 * @since 1.46.0
						 */
						domRef: {type: "any"}
					}
				}
			}
		},
		renderer: function (oRm, oControl) {
			if (oControl.getMode() === library.GenericTileMode.LineMode) {
				LineModeRenderer.render(oRm, oControl);
			} else {
				GenericTileRenderer.render(oRm, oControl);
			}
		}
	});

	GenericTile._Action = {
		Press: "Press",
		Remove: "Remove"
	};

	GenericTile.LINEMODE_SIBLING_PROPERTIES = ["state", "subheader", "header", "scope"];

	/* --- Lifecycle Handling --- */

	GenericTile.prototype.init = function () {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		// Defines custom screen range set: smaller than or equal to 449px defines 'small' and bigger than 449px defines 'large' screen
		if (!Device.media.hasRangeSet(DEVICE_SET)) {
			Device.media.initRangeSet(DEVICE_SET, [450], "px", ["small", "large"]);
		}

		this._oTitle = new Text(this.getId() + "-title");
		this._oTitle.addStyleClass("sapMGTTitle");
		this._oTitle.cacheLineHeight = false;
		this.setAggregation("_titleText", this._oTitle, true);

		this._oSubTitle = new Text(this.getId() + "-subTitle");
		this._oSubTitle.cacheLineHeight = false;
		this.addDependent(this._oSubTitle);

		this._sFailedToLoad = this._oRb.getText("INFOTILE_CANNOT_LOAD_TILE");
		this._sLoading = this._oRb.getText("INFOTILE_LOADING");

		this._oFailedText = new Text(this.getId() + "-failed-txt", {
			maxLines: 2
		});
		this._oFailedText.cacheLineHeight = false;
		this._oFailedText.addStyleClass("sapMGTFailed");
		this.setAggregation("_failedMessageText", this._oFailedText, true);

		this._oWarningIcon = new Icon(this.getId() + "-warn-icon", {
			src: "sap-icon://notification",
			size: "1.375rem"
		});

		this._oWarningIcon.addStyleClass("sapMGTFtrFldIcnMrk");

		this._oBusy = new HTML(this.getId() + "-overlay");
		this._oBusy.setBusyIndicatorDelay(0);

		this._bTilePress = true;

		this._bThemeApplied = true;
		if (!sap.ui.getCore().isInitialized()) {
			this._bThemeApplied = false;
			sap.ui.getCore().attachInit(this._handleCoreInitialized.bind(this));
		} else {
			this._handleCoreInitialized();
		}
	};

	GenericTile.prototype.setWrappingType = function (sWrappingType) {
		this.setProperty("wrappingType", sWrappingType, true);
		this._oTitle.setWrappingType(sWrappingType);
		this._oFailedText.setWrappingType(sWrappingType);
		this._oSubTitle.setWrappingType(sWrappingType);
		return this;
	};

	GenericTile.prototype.setSubheader = function (sSubheader) {
		this.setProperty("subheader", sSubheader);
		this._oSubTitle.setText(sSubheader);
		return this;
	};

	/**
	 * Handler for the core's init event. In order for the tile to adjust its rendering to the current theme,
	 * we attach a theme check in here when everything is properly initialized and loaded.
	 *
	 * @private
	 */
	GenericTile.prototype._handleCoreInitialized = function () {
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
	GenericTile.prototype._handleThemeApplied = function () {
		this._bThemeApplied = true;
		this._oTitle.clampHeight();
		sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
	};

	/**
	 * Creates the content specific for the given scope in order for it to be rendered, if it does not exist already.
	 *
	 * @param {string} sTileClass indicates the tile's CSS class name
	 * @private
	 */
	GenericTile.prototype._initScopeContent = function (sTileClass) {
		switch (this.getScope()) {
			case library.GenericTileScope.Actions:
				if (this.getState && this.getState() === library.LoadState.Disabled) {
					break;
				}
				this._oMoreIcon = this._oMoreIcon || IconPool.createControlByURI({
					id: this.getId() + "-action-more",
					size: "1rem",
					useIconTooltip: false,
					src: "sap-icon://overflow"
				}).addStyleClass("sapMPointer").addStyleClass(sTileClass + "MoreIcon");

				this._oRemoveButton = this._oRemoveButton || new Button({
					id: this.getId() + "-action-remove",
					icon: "sap-icon://decline",
					tooltip: this._oRb.getText("GENERICTILE_REMOVEBUTTON_TEXT")
				}).addStyleClass("sapUiSizeCompact").addStyleClass(sTileClass + "RemoveButton");

				this._oRemoveButton._bExcludeFromTabChain = true;
				break;
			default:
			// do nothing
		}
	};

	GenericTile.prototype._isSmall = function() {
		return this.getSizeBehavior() === TileSizeBehavior.Small || window.matchMedia("(max-width: 374px)").matches;
	};

	GenericTile.prototype.exit = function () {
		if (this._sParentResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sParentResizeListenerId = null;
		}

		Device.media.detachHandler(this._handleMediaChange, this, DEVICE_SET);

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

		if (this._oMoreIcon) {
			this._oMoreIcon.destroy();
		}
		if (this._oRemoveButton) {
			this._oRemoveButton.destroy();
		}
	};

	GenericTile.prototype.onBeforeRendering = function () {
		var bSubheader = !!this.getSubheader();
		if (this.getMode() === library.GenericTileMode.HeaderMode) {
			this._applyHeaderMode(bSubheader);
		} else {
			this._applyContentMode(bSubheader);
		}
		var iTiles = this.getTileContent().length;
		for (var i = 0; i < iTiles; i++) {
			this.getTileContent()[i].setProperty("disabled", this.getState() === library.LoadState.Disabled, true);
		}

		this._initScopeContent("sapMGT");
		this._generateFailedText();

		this.$().unbind("mouseenter");
		this.$().unbind("mouseleave");

		if (this._sParentResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sParentResizeListenerId = null;
		}

		Device.media.detachHandler(this._handleMediaChange, this, DEVICE_SET);

		if (this._$RootNode) {
			this._$RootNode.off(this._getAnimationEvents());
		}

		if (this.getFrameType() === library.FrameType.Auto) {
			this.setProperty("frameType", library.FrameType.OneByOne, true);
		}
	};

	GenericTile.prototype.onAfterRendering = function () {
		this._setupResizeClassHandler();

		// attaches handler this._updateAriaAndTitle to the event mouseenter and removes attributes ARIA-label and title of all content elements
		this.$().bind("mouseenter", this._updateAriaAndTitle.bind(this));

		// attaches handler this._removeTooltipFromControl to the event mouseleave and removes control's own tooltips (Truncated header text and MicroChart tooltip).
		this.$().bind("mouseleave", this._removeTooltipFromControl.bind(this));

		var sMode = this.getMode();
		var bScreenLarge = this._isScreenLarge();
		if (sMode === library.GenericTileMode.LineMode) {
			var $Parent = this.$().parent();
			if (bScreenLarge) {
				// This class needs to be added in order to account for the paddings of the tile.
				// As this LineMode tile is rendered with display: inline, we cannot apply padding to each line separately, but only the
				// container can apply a padding for text containment. Thus, this class adds a preset padding-right to the tile's direct DOM parent.
				$Parent.addClass("sapMGTLineModeContainer");

				$Parent.removeClass("sapMGTLineModeListContainer");
				$Parent.addClass("sapMGTLineModeFloatingContainer");

				this._updateHoverStyle(true); //force update

				if (this.getParent() instanceof Control) {
					this._sParentResizeListenerId = ResizeHandler.register(this.getParent(), this._handleResize.bind(this));
				} else {
					this._sParentResizeListenerId = ResizeHandler.register($Parent, this._handleResize.bind(this));
				}
			} else {
				$Parent.removeClass("sapMGTLineModeFloatingContainer");
				$Parent.addClass("sapMGTLineModeListContainer");
			}
		}

		// triggers update of all adjacent GenericTile LineMode siblings
		// this is needed for their visual update if this tile's properties change causing it to expand or shrink
		if (sMode === library.GenericTileMode.LineMode && this._bUpdateLineTileSiblings) {
			this._updateLineTileSiblings();
			this._bUpdateLineTileSiblings = false;
		}

		if (sMode === library.GenericTileMode.LineMode) {
			// attach handler in order to check the device type based on width and invalidate on change
			Device.media.attachHandler(this._handleMediaChange, this, DEVICE_SET);
		}
	};

	/**
	 * Updates the tile's hover style in LineMode if the parent control is resized.
	 * This is needed for correct hover style and line-break calculations.
	 *
	 * @private
	 */
	GenericTile.prototype._handleResize = function () {
		if (this.getMode() === library.GenericTileMode.LineMode && this._isScreenLarge() && this.getParent()) {
			this._queueAnimationEnd();
		}
	};

	/**
	 * @private
	 */
	GenericTile.prototype._setupResizeClassHandler = function () {
		var fnCheckMedia = function () {
			if (this.getSizeBehavior() === TileSizeBehavior.Small || window.matchMedia("(max-width: 374px)").matches) {
				this.$().addClass("sapMTileSmallPhone");
			} else {
				this.$().removeClass("sapMTileSmallPhone");
			}
		}.bind(this);

		jQuery(window).resize(fnCheckMedia);
		fnCheckMedia();
	};

	/**
	 * Looks for the class '.sapUiSizeCompact' on the control and its parents to determine whether to render cozy or compact density mode.
	 *
	 * @returns {boolean} True if class 'sapUiSizeCompact' was found, otherwise false.
	 * @private
	 */
	GenericTile.prototype._isCompact = function () {
		return jQuery("body").hasClass("sapUiSizeCompact") || this.$().is(".sapUiSizeCompact") || this.$().closest(".sapUiSizeCompact").length > 0;
	};

	/**
	 * Calculates all data that is necessary for displaying style helpers in LineMode (large screens - floated view).
	 * These helpers are used in order to imitate a per-line box effect.
	 *
	 * @returns {object|null} An object containing general data about the style helpers and information about each
	 *                        single line or null if the tile is invisible or not in compact density.
	 * @private
	 */
	GenericTile.prototype._calculateStyleData = function () {
		this.$("lineBreak").remove();

		if (!this._isScreenLarge() || !this.getDomRef() || this.$().is(":hidden")) {
			return null;
		}

		var $this = this.$(),
			$End = this.$("endMarker"),
			$Start = this.$("startMarker");

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
	GenericTile.prototype._getStyleData = function () {
		var oStyleData = this._calculateStyleData();

		if (!deepEqual(this._oStyleData, oStyleData)) {
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
	GenericTile.prototype._getAnimationEvents = function () {
		return "transitionend.sapMGT$id animationend.sapMGT$id".replace(/\$id/g, camelize(this.getId()));
	};

	/**
	 * Trigger and update the hover style of the tile in List View (small screens) in LineMode.
	 * Also attaches the UIArea's transitionend and animationend events to an event handler in order for
	 * the tile's hover style to be updated after e.g. an sap.m.NavContainer causes the whole page to be flipped.
	 * This is done in order to avoid miscalculations.
	 *
	 * @param {boolean} forceUpdate If set to true, the tile's hover style is updated even if the data has not changed.
	 * @private
	 */
	GenericTile.prototype._updateHoverStyle = function (forceUpdate) {
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
	 * @returns {boolean} true or false
	 * @private
	 */
	GenericTile.prototype._queueAnimationEnd = function (oEvent) {
		if (oEvent) {
			var $Target = jQuery(oEvent.target);

			if ($Target.is(".sapMGT, .sapMGT *")) { //exclude other GenericTiles and all of their contents
				return false; //stop bubbling and prevent default behavior
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
		this._oAnimationEndCallIds[this._cHoverStyleUpdates] = setTimeout(this._handleAnimationEnd.bind(this, this._cHoverStyleUpdates), 10);
	};

	/**
	 * Executes the actual hover style update of the tile if the given queueIndex is the last item in the Mutex queue.
	 *
	 * @param {int} hoverStyleUpdateCount The action's index in the mutex queue
	 * @private
	 */
	GenericTile.prototype._handleAnimationEnd = function (hoverStyleUpdateCount) {
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
	GenericTile.prototype._clearAnimationUpdateQueue = function () {
		for (var k in this._oAnimationEndCallIds) {
			clearTimeout(this._oAnimationEndCallIds[k]);
			delete this._oAnimationEndCallIds[k];
		}
	};

	/**
	 * Calculates the number of lines in the floated View line tile by simply dividing the tile's entire height by the
	 * tile's line height.
	 *
	 * @returns {number} The number of lines
	 * @private
	 */
	GenericTile.prototype._getLineCount = function () {
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
	GenericTile.prototype.getBoundingRects = function () {
		var oPosition = this.$().offset(); //get the tile's position relative to the document (for drag and drop)
		if (this.getMode() === library.GenericTileMode.LineMode && this._isScreenLarge()) {
			this._getStyleData();
			var aRects = [],
				$StyleHelper,
				oOffset;

			this.$().find(".sapMGTLineStyleHelper").each(function () {
				$StyleHelper = jQuery(this);
				oOffset = $StyleHelper.offset();

				aRects.push({
					offset: {
						x: oOffset.left,
						y: oOffset.top
					},
					width: $StyleHelper.width(),
					height: $StyleHelper.height()
				});
			});
			return aRects;
		} else {
			return [{
				offset: {
					x: oPosition.left,
					y: oPosition.top
				},
				width: this.$().width(),
				height: this.$().height()
			}];
		}
	};

	/**
	 * Updates the hover style of all siblings that are tiles in LineMode.
	 *
	 * @private
	 */
	GenericTile.prototype._updateLineTileSiblings = function () {
		var oParent = this.getParent();
		if (this.getMode() === library.GenericTileMode.LineMode && this._isScreenLarge() && oParent) {
			var i = oParent.indexOfAggregation(this.sParentAggregationName, this);
			var aSiblings = oParent.getAggregation(this.sParentAggregationName).splice(i + 1);

			for (i = 0; i < aSiblings.length; i++) {
				var oSibling = aSiblings[i];
				if (oSibling instanceof library.GenericTile && oSibling.getMode() === library.GenericTileMode.LineMode) {
					oSibling._updateHoverStyle();
				}
			}
		}
	};

	/* --- Event Handling --- */
	GenericTile.prototype.ontouchstart = function () {
		this.addStyleClass("sapMGTPressActive");
		if (this.$("hover-overlay").length > 0) {
			this.$("hover-overlay").addClass("sapMGTPressActive");
		}
		if (this.getMode() === library.GenericTileMode.LineMode) {
			this.addStyleClass("sapMGTLineModePress");
		}
	};

	GenericTile.prototype.ontouchcancel = function () {
		this.removeStyleClass("sapMGTPressActive");
		if (this.$("hover-overlay").length > 0) {
			this.$("hover-overlay").removeClass("sapMGTPressActive");
		}
	};

	GenericTile.prototype.ontouchend = function () {
		this.removeStyleClass("sapMGTPressActive");
		if (this.$("hover-overlay").length > 0) {
			this.$("hover-overlay").removeClass("sapMGTPressActive");
		}
		if (this.getMode() === library.GenericTileMode.LineMode) {
			this.removeStyleClass("sapMGTLineModePress");
		}
	};

	GenericTile.prototype.ontap = function (event) {
		var oParams;
		if (this._bTilePress && this.getState() !== library.LoadState.Disabled) {
			this.$().focus();
			oParams = this._getEventParams(event);
			this.firePress(oParams);
			event.preventDefault();
		}
	};

	GenericTile.prototype.onkeydown = function (event) {
		if (PseudoEvents.events.sapselect.fnCheck(event) && this.getState() !== library.LoadState.Disabled) {
			this.addStyleClass("sapMGTPressActive");
			if (this.$("hover-overlay").length > 0) {
				this.$("hover-overlay").addClass("sapMGTPressActive");
			}
			event.preventDefault();
		}
	};

	/*--- update Aria Label when Generic Tile change. Used while navigate using Tab Key and focus is on Generic Tile  ---*/

	GenericTile.prototype._updateAriaLabel = function () {

		var sAriaText = this._getAriaText(),
			$Tile = this.$(),
			bIsAriaUpd = false;
		if ($Tile.attr("aria-label") !== sAriaText) {
			$Tile.attr("aria-label", sAriaText);
			bIsAriaUpd = true;                  // Aria Label Updated
		}
		return bIsAriaUpd;
	};

	GenericTile.prototype.onkeyup = function (event) {
		var oParams,
			bFirePress = false,
			sScope = this.getScope(),
			bActionsScope = sScope === library.GenericTileScope.Actions;

		if (bActionsScope && (PseudoEvents.events.sapdelete.fnCheck(event) || PseudoEvents.events.sapbackspace.fnCheck(event))) {
			oParams = {
				scope: sScope,
				action: GenericTile._Action.Remove,
				domRef: this._oRemoveButton.getPopupAnchorDomRef()
			};
			bFirePress = true;
		}
		if (PseudoEvents.events.sapselect.fnCheck(event) && this.getState() !== library.LoadState.Disabled) {
			this.addStyleClass("sapMGTPressActive");
			if (this.$("hover-overlay").length > 0) {
				this.$("hover-overlay").removeClass("sapMGTPressActive");
			}
			oParams = this._getEventParams(event);
			bFirePress = true;
		}
		if (bFirePress) {
			this.firePress(oParams);
			event.preventDefault();
		}

		this._updateAriaLabel();  // To update the Aria Label for Generic Tile on change.
	};

	/* --- Getters and Setters --- */

	GenericTile.prototype.setProperty = function (sPropertyName) {
		Control.prototype.setProperty.apply(this, arguments);

		//If properties in GenericTile.LINEMODE_SIBLING_PROPERTIES are being changed, update all sibling controls that are GenericTiles in LineMode
		if (this.getMode() === library.GenericTileMode.LineMode && GenericTile.LINEMODE_SIBLING_PROPERTIES.indexOf(sPropertyName) !== -1) {
			this._bUpdateLineTileSiblings = true;
		}
		return this;
	};

	GenericTile.prototype.getHeader = function () {
		return this._oTitle.getText();
	};

	GenericTile.prototype.setHeader = function (title) {
		this.setProperty("header", title);
		this._oTitle.setText(title);
		return this;
	};

	GenericTile.prototype.setHeaderImage = function (uri) {
		var bValueChanged = !deepEqual(this.getHeaderImage(), uri);

		if (bValueChanged) {
			if (this._oImage) {
				this._oImage.destroy();
				this._oImage = undefined;
			}

			if (uri) {
				this._oImage = IconPool.createControlByURI({
					id: this.getId() + "-icon-image",
					src: uri
				}, library.Image);

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
	GenericTile.prototype._applyHeaderMode = function (bSubheader) {
		// when subheader is available, the header can have maximal 4 lines and the subheader can have 1 line
		// when subheader is unavailable, the header can have maximal 5 lines
		if (bSubheader) {
			this._oTitle.setProperty("maxLines", 4, true);
		} else {
			this._oTitle.setProperty("maxLines", 5, true);
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
			this._oTitle.setProperty("maxLines", 2, true);
		} else {
			this._oTitle.setProperty("maxLines", 3, true);
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
	GenericTile.prototype._getHeaderAriaAndTooltipText = function () {
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
	GenericTile.prototype._getContentAriaAndTooltipText = function () {
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
	GenericTile.prototype._getAriaAndTooltipText = function () {
		var sAriaText = (this.getTooltip_AsString() && !this._isTooltipSuppressed())
			? this.getTooltip_AsString()
			: (this._getHeaderAriaAndTooltipText() + "\n" + this._getContentAriaAndTooltipText());
		switch (this.getState()) {
			case library.LoadState.Disabled:
				return "";
			case library.LoadState.Loading:
				return sAriaText + "\n" + this._sLoading;
			case library.LoadState.Failed:
				return sAriaText + "\n" + this._oFailedText.getText();
			default :
				if (sAriaText.trim().length === 0) { // If the string is empty or just whitespace, IE renders an empty tooltip (e.g. "" + "\n" + "")
					return "";
				} else {
					return sAriaText;
				}
		}
	};

	/**
	 * Returns text for ARIA label.
	 * If the application provides a specific tooltip, the ARIA label is equal to the tooltip text.
	 * If the application doesn't provide a tooltip or the provided tooltip contains only white spaces,
	 * calls _getAriaAndTooltipText to get text.
	 *
	 * @private
	 * @returns {String} Text for ARIA label.
	 */
	GenericTile.prototype._getAriaText = function () {
		var sAriaText = this.getTooltip_Text();
		var sAriaLabel = this.getAriaLabel();
		if (!sAriaText || this._isTooltipSuppressed()) {
			sAriaText = this._getAriaAndTooltipText(); // ARIA label set by the control
		}
		if (this.getScope() === library.GenericTileScope.Actions) {
			sAriaText = this._oRb.getText("GENERICTILE_ACTIONS_ARIA_TEXT") + " " + sAriaText;
		}
		if (sAriaLabel) {
			sAriaText = sAriaLabel + " " + sAriaText;
		}
		return sAriaText; // ARIA label set by the app, equal to tooltip
	};

	/**
	 * Returns text for tooltip or null.
	 * If the application provides a specific tooltip, the returned string is equal to the tooltip text.
	 * If the tooltip provided by the application is a string of only white spaces, the function returns null.
	 *
	 * @returns {String} Text for tooltip or null.
	 * @private
	 */
	GenericTile.prototype._getTooltipText = function () {
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
	GenericTile.prototype._checkFooter = function (tileContent, control) {
		var sState = control.getState();
		var bActions = this.getScope() === library.GenericTileScope.Actions || this._bShowActionsView === true;
		if (sState === library.LoadState.Failed || bActions && sState !== library.LoadState.Disabled) {
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
	GenericTile.prototype._generateFailedText = function () {
		var sCustomFailedMsg = this.getFailedText();
		var sFailedMsg = sCustomFailedMsg ? sCustomFailedMsg : this._sFailedToLoad;
		this._oFailedText.setProperty("text", sFailedMsg, true);
		this._oFailedText.setAggregation("tooltip", sFailedMsg, true);
	};

	/**
	 * Returns true if the application suppressed the tooltip rendering, otherwise false.
	 *
	 * @private
	 * @returns {boolean} true if the application suppressed the tooltip rendering, otherwise false.
	 */
	GenericTile.prototype._isTooltipSuppressed = function () {
		var sTooltip = this.getTooltip_Text();
		if (sTooltip && sTooltip.length > 0 && sTooltip.trim().length === 0) {
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
	GenericTile.prototype._isHeaderTextTruncated = function () {
		var oDom, iMaxHeight, $Header, iWidth;
		if (this.getMode() === library.GenericTileMode.LineMode) {
			$Header = this.$("hdr-text");
			if ($Header.length > 0) {
				iWidth = Math.ceil($Header[0].getBoundingClientRect().width);
				return ($Header[0] && iWidth < $Header[0].scrollWidth);
			} else {
				return false;
			}
		} else {
			oDom = this.getAggregation("_titleText").getDomRef("inner");
			iMaxHeight = this.getAggregation("_titleText").getClampHeight(oDom);
			return (iMaxHeight < oDom.scrollHeight);
		}
	};

	/**
	 * Returns true if subheader text is truncated, otherwise false.
	 *
	 * @private
	 * @returns {boolean} true or false
	 */
	GenericTile.prototype._isSubheaderTextTruncated = function () {
		var $Subheader;
		if (this.getMode() === library.GenericTileMode.LineMode) {
			$Subheader = this.$("subHdr-text");
		} else {
			$Subheader = this.$("subTitle");
		}
		if ($Subheader.length > 0) {
			var iWidth = Math.ceil($Subheader[0].getBoundingClientRect().width);
			return ($Subheader[0] && iWidth < $Subheader[0].scrollWidth);
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
	GenericTile.prototype._setTooltipFromControl = function () {
		var sTooltip = "";
		var bIsFirst = true;
		var aTiles = this.getTileContent();

		if (this._oTitle.getText()) {
			sTooltip = this._oTitle.getText();
			bIsFirst = false;
		}

		if (this.getSubheader()) {
			sTooltip += (bIsFirst ? "" : "\n") + this.getSubheader();
			bIsFirst = false;
		}

		// not valid in actions scope and LineMode
		if (this.getScope() !== library.GenericTileScope.Actions && this.getMode() !== library.GenericTileMode.LineMode) {
			if (aTiles[0] && aTiles[0].getTooltip_AsString() && aTiles[0].getTooltip_AsString() !== "") {
				sTooltip += (bIsFirst ? "" : "\n") + aTiles[0].getTooltip_AsString();
				bIsFirst = false;
			}
			if (this.getFrameType() === "TwoByOne" && aTiles[1] && aTiles[1].getTooltip_AsString() && aTiles[1].getTooltip_AsString() !== "") {
				sTooltip += (bIsFirst ? "" : "\n") + aTiles[1].getTooltip_AsString();
			}
		}

		// when user does not set tooltip, apply the tooltip below
		if (sTooltip && !this._getTooltipText() && !this._isTooltipSuppressed()) {
			this.$().attr("title", sTooltip.trim());
			this._bTooltipFromControl = true;
		}
	};

	/**
	 * Updates the attributes ARIA-label and title of the GenericTile. The updated attribute title is used for tooltip as well.
	 * The attributes ARIA-label and title of the descendants will be removed (exception: ARIA-label and title attribute
	 * of "Remove" button are not removed in "Actions" scope).
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
		if (this.getScope() === library.GenericTileScope.Actions) {
			$Tile.find('*:not(.sapMGTRemoveButton)').removeAttr("aria-label").removeAttr("title").unbind("mouseenter");
		} else {
			$Tile.find('*').removeAttr("aria-label").removeAttr("title").unbind("mouseenter");
		}
		this._setTooltipFromControl();
	};

	/**
	 * When mouse leaves GenericTile, removes the GenericTile's own tooltip (truncated header text or MicroChart tooltip), do not remove the tooltip set by user.
	 * The reason is tooltip from control should not be displayed any more when the header text becomes short or MicroChart is not in GenericTile.
	 *
	 * @private
	 */
	GenericTile.prototype._removeTooltipFromControl = function () {
		if (this._bTooltipFromControl) {
			this.$().removeAttr("title");
			this._bTooltipFromControl = false;
		}
	};

	/**
	 * Checks whether the screen is large enough for floating list.
	 * @returns {boolean} Returns true if current screen is large enough to display complete floating list.
	 * @private
	 */
	GenericTile.prototype._isScreenLarge = function () {
		return this._getCurrentMediaContainerRange(DEVICE_SET).name === "large";
	};

	/**
	 * Determines the current action depending on the tile's scope.
	 * @param {sap.ui.base.Event} oEvent which was fired
	 * @returns {object} An object containing the tile's scope and the action which triggered the event
	 * @private
	 */
	GenericTile.prototype._getEventParams = function (oEvent) {
		var oParams,
			sAction = GenericTile._Action.Press,
			sScope = this.getScope(),
			oDomRef = this.getDomRef();

		if (sScope === library.GenericTileScope.Actions && oEvent.target.id.indexOf("-action-remove") > -1) {//tap on icon remove in Actions scope
			sAction = GenericTile._Action.Remove;
			oDomRef = this._oRemoveButton.getPopupAnchorDomRef();
		} else if (sScope === library.GenericTileScope.Actions) {
			oDomRef = this._oMoreIcon.getDomRef();
		}
		oParams = {
			scope: sScope,
			action: sAction,
			domRef: oDomRef
		};
		return oParams;
	};

	/**
	 * Performs needed style adjustments through invalidation of control if GenericTile is in LineMode.
	 * Triggered when changed from floating view (large screens) to list view (small screens) and vice versa.
	 * @private
	 */
	GenericTile.prototype._handleMediaChange = function () {
		// no need to check previous state as the event is only triggered on change
		this._bUpdateLineTileSiblings = true;
		this.invalidate();
	};

	/**
	 * Provides an interface to switch on or off the tile's press event. Used in SlideTile for Actions scope.
	 *
	 * @param {boolean} value If set to true, the press event of the tile is active.
	 * @protected
	 * @since 1.46
	 */
	GenericTile.prototype.setPressEnabled = function (value) {
		this._bTilePress = value;
	};

	/**
	 * Shows the actions scope view of GenericTile without changing the scope. Used in SlideTile for Actions scope.
	 *
	 * @param {boolean} value If set to true, actions view is showed.
	 * @protected
	 * @since 1.46
	 */
	GenericTile.prototype.showActionsView = function (value) {
		if (this._bShowActionsView !== value) {
			this._bShowActionsView = value;
			this.invalidate();
		}
	};

	return GenericTile;
});