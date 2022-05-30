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
	'sap/m/Image',
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
	Image,
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
		WrappingType = library.WrappingType,
		URLHelper = library.URLHelper;

	var DEVICE_SET = "GenericTileDeviceSet";
	var keyPressed = {};

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
				size: {type: "sap.m.Size", group: "Misc", defaultValue: Size.Auto, deprecated: true},
				/**
				 * The FrameType: OneByOne, TwoByOne, OneByHalf, or TwoByHalf. Default set to OneByOne if property is not defined or set to Auto by the app.
				 */
				frameType: {type: "sap.m.FrameType", group: "Misc", defaultValue: FrameType.OneByOne},
				/**
				 * Backend system context information
				 * @private
				 * @since 1.92.0
				 * @experimental Since 1.92
				 */
				systemInfo: {type:"string",  group: "Misc", defaultValue:null},
				/**
				 * Application information such as ID/Shortcut
				 * @private
				 * @since 1.92.0
				 * @experimental Since 1.92
				 */
				appShortcut: {type:"string",  group: "Misc", defaultValue:null},
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
				 * Additional description for aria-role.
				 * @since 1.83
				 */
				ariaRole: {type: "string", group: "Accessibility", defaultValue: null},
				/**
				 * Additional description for aria-roledescription.
				 * @since 1.83
				 */
				ariaRoleDescription: {type: "string", group: "Accessibility", defaultValue: null},
				/**
				 * Renders the given link as root element and therefore enables the open in new tab / window functionality
				 * @since 1.76
				 */
				url: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},
				/**
				 * Renders the given link as a button, enabling the option of opening the link in new tab/window functionality.
				 * Works only in ArticleMode.
				 * @experimental since 1.96
				 */
				enableNavigationButton: {type: "boolean", group: "Misc", defaultValue: false},
				/**
				 * Disables press event for the tile control.
				 * @experimental since 1.96
				 */
				 pressEnabled: {type: "boolean", group: "Misc", defaultValue: true},
				 /**
				 * Text for navigate action button. Default Value is "Read More".
				 * Works only in ArticleMode.
				 * @experimental since 1.96
				 */
				navigationButtonText: {type: "string", group: "Misc", defaultValue: null},
				/**
				 * Defines the type of text wrapping to be used (hyphenated or normal).
				 * @since 1.60
				 */
				wrappingType: {type: "sap.m.WrappingType", group: "Appearance", defaultValue: WrappingType.Normal},
				/**
				 * Width of the control.
				 * @since 1.72
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Appearance"},
				/**
				 * Tooltip text which is added at the tooltip generated by the control.
				 * @since 1.82
				 */
				additionalTooltip: {type: "string", group: "Accessibility", defaultValue: null},
				/**
				 * Icon of the GenericTile. Only applicable for IconMode.
				 * @since 1.96
				 * @experimental Since 1.96
				*/
				tileIcon: {type: "sap.ui.core.URI", multiple: false},
				/**
				 * Background color of the GenericTile. Only applicable for IconMode.
				 * @since 1.96
				 * @experimental Since 1.96
				*/
				backgroundColor: {type: "sap.ui.core.CSSColor", group: "Appearance"},
				/**
				 * The semantic color of the value.
				 * @experimental
				 * @since 1.95
				 */
				valueColor: {type: "sap.m.ValueColor", group: "Appearance", defaultValue: "None"},
				/**
				 * The load state of the tileIcon.
				 * @experimental
				 */
				iconLoaded: {type: "boolean", group: "Misc", defaultValue: true}
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
				icon: {type: "sap.ui.core.Control", multiple: false, deprecated: true},
				/**
				 * Action buttons added in ActionMode.
				 * @experimental since 1.96
				 */
				actionButtons: {type: "sap.m.Button", multiple: true, bindable: "bindable"},
				/**
				 * The hidden aggregation for the title.
				 */
				_titleText: {type: "sap.m.Text", multiple: false, visibility: "hidden"},
				/**
				 * The hidden aggregation for the message in the failed state.
				 */
				_failedMessageText: {type: "sap.m.Text", multiple: false, visibility: "hidden"},
				/**
				 * The hidden aggregation for the Tile Icon Works only in IconMode.
				 * @experimental since 1.96
				 * @private
				 */
				_tileIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				 /**
				 * The hidden aggregation for the Tile Icon Image. Works only in IconMode.
				 * @experimental since 1.96
				 * @private
				 */
				_tileIconImage: {type: "sap.m.Image", multiple: false, visibility: "hidden"}
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
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				if (oControl.getMode() === GenericTileMode.LineMode) {
					LineModeRenderer.render(oRm, oControl);
				} else {
					GenericTileRenderer.render(oRm, oControl);
				}
			}
		}
	});

	GenericTile._Action = {
		Press: "Press",
		Remove: "Remove",
		More: "More"
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


		this._oAppShortcut = new Text(this.getId() + "-appShortcut");
		this._oAppShortcut.cacheLineHeight = false;
		this.addDependent(this._oAppShortcut);

		this._oSystemInfo = new Text(this.getId() + "-systemInfo");
		this._oSystemInfo.cacheLineHeight = false;
		this.addDependent(this._oSystemInfo);

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

		//Navigate Action Button in Article Mode
		this._oNavigateAction = new Button(this.getId() + "-navigateAction");
		this._oNavigateAction._bExcludeFromTabChain = true;
		this.addDependent(this._oNavigateAction);
	};

	GenericTile.prototype.setWrappingType = function (sWrappingType) {
		this.setProperty("wrappingType", sWrappingType, true);
		this._oTitle.setWrappingType(sWrappingType);
		this._oFailedText.setWrappingType(sWrappingType);
		this._oSubTitle.setWrappingType(sWrappingType);
		this._oAppShortcut.setWrappingType(sWrappingType);
		this._oSystemInfo.setWrappingType(sWrappingType);
		return this;
	};

	GenericTile.prototype.setSubheader = function (sSubheader) {
		this.setProperty("subheader", sSubheader);
		this._oSubTitle.setText(sSubheader);
		return this;
	};

	GenericTile.prototype.setAppShortcut = function (sAppShortcut) {
		this.setProperty("appShortcut", sAppShortcut);
		this._oAppShortcut.setText(sAppShortcut);
		return this;
	};

	GenericTile.prototype.setSystemInfo = function (sSystemInfo) {
		this.setProperty("systemInfo", sSystemInfo);
		this._oSystemInfo.setText(sSystemInfo);
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
		if (!this.getState || this.getState() !== LoadState.Disabled) {
			if (this.isA("sap.m.GenericTile") && this._isIconMode() && this.getFrameType() === FrameType.TwoByHalf){
				// Acts Like an actual Button in Icon mode for TwoByHalf Tile
				this._oMoreIcon = this._oMoreIcon || new Button({
					id: this.getId() + "-action-more",
					icon: "sap-icon://overflow",
					type: "Transparent"
				}).addStyleClass("sapMPointer").addStyleClass(sTileClass + "MoreIcon");
				this._oMoreIcon.ontouchstart = function() {
					this.removeFocus();
				}.bind(this);
			} else {
				this._oMoreIcon = this._oMoreIcon || new Button({
					id: this.getId() + "-action-more",
					icon: "sap-icon://overflow",
					type: "Unstyled"
				}).addStyleClass("sapMPointer").addStyleClass(sTileClass + "MoreIcon");
				this._oMoreIcon._bExcludeFromTabChain = true;
			}
			this._oRemoveButton = this._oRemoveButton || new Button({
				id: this.getId() + "-action-remove",
				icon: "sap-icon://decline",
				tooltip: this._oRb.getText("GENERICTILE_REMOVEBUTTON_TEXT")
			}).addStyleClass("sapUiSizeCompact").addStyleClass(sTileClass + "RemoveButton");

			this._oRemoveButton._bExcludeFromTabChain = true;

			switch (this.getScope()) {
				case GenericTileScope.Actions:
					this._oMoreIcon.setVisible(true);
					this._oRemoveButton.setVisible(true);
					break;
				case GenericTileScope.ActionMore:
					this._oMoreIcon.setVisible(true);
					this._oRemoveButton.setVisible(false);
					break;
				case GenericTileScope.ActionRemove:
					this._oRemoveButton.setVisible(true);
					this._oMoreIcon.setVisible(false);
					break;
				default:
				// do nothing
			}
		}
	};

	/**
	Adding the  Classes for Action More Button in IconMode
	@private
	*/
	GenericTile.prototype._addClassesForButton = function() {
		this._oMoreIcon.getDomRef().classList.add("sapMBtn");
		this._oMoreIcon.getDomRef("inner").classList.add("sapMBtnInner");
		this._oMoreIcon.getDomRef("inner").classList.add("sapMBtnTransparent");
	};

	/**
	Focus would not be visible while clicking on the tile
	@private
	*/
	GenericTile.prototype.removeFocus = function() {
		this.getDomRef().classList.add("sapMGTActionButtonPress");
		this._oMoreIcon._activeButton();
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
		if (this._oNavigateAction) {
			this._oNavigateAction.destroy();
		}
	};

	GenericTile.prototype.onBeforeRendering = function () {
		var bSubheader = !!this.getSubheader();
		if (this.getMode() === GenericTileMode.HeaderMode || this.getMode() === GenericTileMode.IconMode) {
			this._applyHeaderMode(bSubheader);
		} else {
			this._applyContentMode(bSubheader);
		}
		var iTiles = this.getTileContent().length;
		for (var i = 0; i < iTiles; i++) {
			this.getTileContent()[i].setProperty("disabled", this.getState() === LoadState.Disabled, true);
		}

		this._initScopeContent("sapMGT");
		this._generateFailedText();

		this.$().off("mouseenter");
		this.$().off("mouseleave");

		if (this._sParentResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sParentResizeListenerId = null;
		}

		//sets the extra width of 0.5rem when the grid container has 1rem gap for the TwoByxxxx tiles
		if (this.getParent() && this.getParent().isA("sap.f.GridContainer")){
			this._applyExtraWidth();
		}

		Device.media.detachHandler(this._handleMediaChange, this, DEVICE_SET);

		if (this._$RootNode) {
			this._$RootNode.off(this._getAnimationEvents());
		}

		if (this.getFrameType() === FrameType.Auto) {
			this.setProperty("frameType", FrameType.OneByOne, true);
		}
		//sets the maxlines for the appshortcut and systeminfo in different tile sizes
		if (this.getMode() !== GenericTileMode.LineMode && (this.getAppShortcut() || this.getSystemInfo())) {
			this._setMaxLines();
		}
		//Set Navigate Action Button Text - Only in Article Mode
		if (this._isNavigateActionEnabled()) {
			var sButtonText = this.getNavigationButtonText() ? this.getNavigationButtonText() : this._oRb.getText("ACTION_READ_MORE");
			this._oNavigateAction.setText(sButtonText);
			this._oNavigateAction.detachPress(this._navigateEventHandler, this);
		}
	};

	GenericTile.prototype.onAfterRendering = function () {
		this._setupResizeClassHandler();

		// attaches handler this._updateAriaAndTitle to the event mouseenter and removes attributes ARIA-label and title of all content elements
		this.$().on("mouseenter", this._updateAriaAndTitle.bind(this));

		// attaches handler this._removeTooltipFromControl to the event mouseleave and removes control's own tooltips (Truncated header text and MicroChart tooltip).
		this.$().on("mouseleave", this._removeTooltipFromControl.bind(this));

		var sMode = this.getMode();
		var bScreenLarge = this._isScreenLarge();
		if (sMode === GenericTileMode.LineMode) {
			var $Parent = this.$().parent();
			if (bScreenLarge) {
				this._updateHoverStyle(true); //force update

				if (this.getParent() instanceof Control) {
					this._sParentResizeListenerId = ResizeHandler.register(this.getParent(), this._handleResize.bind(this));
				} else {
					this._sParentResizeListenerId = ResizeHandler.register($Parent, this._handleResize.bind(this));
				}
			}
		}
		// triggers update of all adjacent GenericTile LineMode siblings
		// this is needed for their visual update if this tile's properties change causing it to expand or shrink
		if (sMode === GenericTileMode.LineMode && this._bUpdateLineTileSiblings) {
			this._updateLineTileSiblings();
			this._bUpdateLineTileSiblings = false;
		}

		if (sMode === GenericTileMode.LineMode) {
			// attach handler in order to check the device type based on width and invalidate on change
			Device.media.attachHandler(this._handleMediaChange, this, DEVICE_SET);
		}

		//Attach press event handler to Navigate Action Button
		if (this._isNavigateActionEnabled()) {
			this._oNavigateAction.attachPress(this._navigateEventHandler, this);
		}

		//Removes hovering and focusable properties from the action more button in non icon mode tiles
		if (this._oMoreIcon && this._oMoreIcon.getDomRef() && !this._isIconMode()){
			this._oMoreIcon.getDomRef().firstChild.classList.remove("sapMBtnHoverable");
			this._oMoreIcon.getDomRef().firstChild.classList.remove("sapMFocusable");
		}

		//Adds the classes for the action-more buton in IconMode for TwoByHalf Tile
		if (this._isIconMode() && this.getFrameType() === FrameType.TwoByHalf && this._oMoreIcon.getDomRef()){
			this._addClassesForButton();
		}

		//Adds Extra height to the TileContent when GenericTile is in ActionMode
		if (this.getFrameType()  === FrameType.TwoByOne && this.getMode() === GenericTileMode.ActionMode && this.getState() === LoadState.Loaded) {
			this._applyExtraHeight();
		}

		this.onDragComplete();
	};
	/**
	 * Increases the height of the TileContent when the header-text has one line
	 * @private
	 */
	GenericTile.prototype._applyExtraHeight = function(){
		var iHeight = this.getDomRef("hdr-text").offsetHeight,
			iLineHeight = parseInt(getComputedStyle(this.getDomRef("title")).lineHeight.slice(0,2)),
			iHeaderLines = Math.ceil(iHeight / iLineHeight);
		if (iHeaderLines === 1 && !this.getHeaderImage()) {
			this.getDomRef("content").classList.add("sapMGTFtrMarginTop");
		} else {
			this.getDomRef("content").classList.remove("sapMGTFtrMarginTop");
		}
	};

	GenericTile.prototype._setMaxLines = function() {
		var sFrameType = this.getFrameType(),
			iLines = sFrameType === FrameType.OneByOne || sFrameType === FrameType.TwoByHalf ? 1 : 2;

		//Default maxLines
		this._oAppShortcut.setProperty("maxLines", iLines, true);
		this._oSystemInfo.setProperty("maxLines", iLines, true);

		if (this.getFrameType() === FrameType.TwoByHalf) {
			var bAppShortcutMore = this.getAppShortcut().length > 11,
				bSystemInfoMore = this.getSystemInfo().length > 11;

			// Line break to happen after 11 characters, App Shortcut to have more priority in display
			if ((bAppShortcutMore && bSystemInfoMore) || bAppShortcutMore) {
				this._oAppShortcut.setProperty("maxLines", 2, true);
			} else if (bSystemInfoMore) {
				this._oSystemInfo.setProperty("maxLines", 2, true);
			}
		}
	};
	/**
	 * Update Hover Overlay, Generic tile to remove Active Press state of generic Tile.
	 * @private
	 */
	GenericTile.prototype.onDragComplete = function () {
		//Check if "sapMGTPressActive" is present on Generic Tile after it has been Dragged, if Yes clear the class to remove the Press state of Generic tile.
		if (this.hasStyleClass("sapMGTPressActive")) {
			this.removeStyleClass("sapMGTPressActive");
			if (this.$("hover-overlay").length > 0) {
				this.$("hover-overlay").removeClass("sapMGTPressActive");
			}
			if (this.getMode() === GenericTileMode.LineMode) {
				this.removeStyleClass("sapMGTLineModePress");
			}
		}
	};

	/**
	 * Updates the tile's hover style in LineMode if the parent control is resized.
	 * This is needed for correct hover style and line-break calculations.
	 *
	 * @private
	 */
	GenericTile.prototype._handleResize = function () {
		if (this.getMode() === GenericTileMode.LineMode && this._isScreenLarge() && this.getParent()) {
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

		jQuery(window).on("resize", fnCheckMedia);
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
			$LineBreak = jQuery("<span><br></span>"),
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
	 * @returns {boolean} True if the data has changed, false if no changes have been detected by deepEqual
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
		return [{
			offset: {
				x: oPosition.left,
				y: oPosition.top
			},
			width: this.$().outerWidth(),
			height: this.$().height()
		}];
	};

	/**
	 * Updates the hover style of all siblings that are tiles in LineMode.
	 *
	 * @private
	 */
	GenericTile.prototype._updateLineTileSiblings = function () {
		var oParent = this.getParent();
		if (this.getMode() === GenericTileMode.LineMode && this._isScreenLarge() && oParent) {
			var i = oParent.indexOfAggregation(this.sParentAggregationName, this);
			var aSiblings = oParent.getAggregation(this.sParentAggregationName).splice(i + 1);

			for (i = 0; i < aSiblings.length; i++) {
				var oSibling = aSiblings[i];
				if (oSibling instanceof GenericTile && oSibling.getMode() === GenericTileMode.LineMode) {
					oSibling._updateHoverStyle();
				}
			}
		}
	};

	/* --- Event Handling --- */
	GenericTile.prototype.ontouchstart = function (event) {
		if (event && event.target.id.indexOf("-action-more") === -1 && this.getDomRef()) {
			this.getDomRef().classList.remove("sapMGTActionButtonPress"); // Sets focus on the tile when clicked other than the action-More Button in Icon mode
		}
		this.addStyleClass("sapMGTPressActive");
		if (this.$("hover-overlay").length > 0) {
			this.$("hover-overlay").addClass("sapMGTPressActive");
		}
		if (this.getMode() === GenericTileMode.LineMode) {
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
		if (this.getMode() === GenericTileMode.LineMode) {
			this.removeStyleClass("sapMGTLineModePress");
		}
	};

	GenericTile.prototype.ontap = function (event) {
		if (!_isInnerTileButtonPressed(event, this)) {
			var oParams;

			if (this._bTilePress && this.getState() !== LoadState.Disabled) {
				this.$().trigger("focus");
				oParams = this._getEventParams(event);
				if (!(this.isInActionRemoveScope() && oParams.action === GenericTile._Action.Press)) {
					this.firePress(oParams);
				}
				event.preventDefault();
			}
		}
	};

	var preventPress = false;
	GenericTile.prototype.onkeydown = function (event) {
		if (!_isInnerTileButtonPressed(event, this)) {
			preventPress = (event.keyCode === 16 || event.keyCode === 27) ? true : false;
			var currentKey = keyPressed[event.keyCode];
			if (!currentKey) {
				keyPressed[event.keyCode] = true;
				if (keyPressed[32] || keyPressed[13]) {
					event.preventDefault();
				}
			}
			if (PseudoEvents.events.sapselect.fnCheck(event) && this.getState() !== LoadState.Disabled) {
				this.addStyleClass("sapMGTPressActive");
				if (this.$("hover-overlay").length > 0) {
					this.$("hover-overlay").addClass("sapMGTPressActive");
				}
				event.preventDefault();
			}
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
		if (!_isInnerTileButtonPressed(event, this)) {
			var currentKey = keyPressed[event.keyCode];    //disable navigation to other tiles when one tile is selected
			if (currentKey) {
				delete keyPressed[event.keyCode];
			}
			var oParams,
				bFirePress = false,
				sScope = this.getScope(),
				bActionsScope = sScope === GenericTileScope.Actions || sScope === GenericTileScope.ActionRemove;

			if (bActionsScope && (PseudoEvents.events.sapdelete.fnCheck(event) || PseudoEvents.events.sapbackspace.fnCheck(event))) {
				oParams = {
					scope: sScope,
					action: GenericTile._Action.Remove,
					domRef: this._oRemoveButton.getPopupAnchorDomRef()
				};
				bFirePress = true;
			}
			if (keyPressed[16] && event.keyCode !== 16 && this.getState() !== LoadState.Disabled) {
				preventPress === false;
			}
			if ((PseudoEvents.events.sapselect.fnCheck(event) || preventPress) && this.getState() !== LoadState.Disabled) {
				this.removeStyleClass("sapMGTPressActive");
				if (this.$("hover-overlay").length > 0) {
					this.$("hover-overlay").removeClass("sapMGTPressActive");
				}
				oParams = this._getEventParams(event);
				bFirePress = true;

			}

			if (!preventPress && bFirePress) {
				this.firePress(oParams);
				event.preventDefault();
			}

			this._updateAriaLabel();  // To update the Aria Label for Generic Tile on change.
		}
	};

	/* --- Getters and Setters --- */

	GenericTile.prototype.setProperty = function (sPropertyName) {
		Control.prototype.setProperty.apply(this, arguments);

		//If properties in GenericTile.LINEMODE_SIBLING_PROPERTIES are being changed, update all sibling controls that are GenericTiles in LineMode
		if (this.getMode() === GenericTileMode.LineMode && GenericTile.LINEMODE_SIBLING_PROPERTIES.indexOf(sPropertyName) !== -1) {
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
				}, Image);

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

		var frameType = this.getFrameType();
		if (this._isIconMode()) {
			if (bSubheader) {
				this._oTitle.setProperty("maxLines", 1, true);
			} else {
				this._oTitle.setProperty("maxLines", 2, true);
			}
        } else if (frameType === FrameType.TwoByOne && this.getMode() === GenericTileMode.ActionMode) {
			this._oTitle.setProperty("maxLines", 2, true);
		} else if (frameType === FrameType.OneByHalf || frameType === FrameType.TwoByHalf) {
			this._oTitle.setProperty("maxLines", 2, true);
		} else {
			if (bSubheader) {
				this._oTitle.setProperty("maxLines", 4, true);
			} else {
				this._oTitle.setProperty("maxLines", 5, true);
			}
		}
		this._changeTileContentContentVisibility(false);
	};

	/**
	 * Sets the ContentMode for GenericTile
	 *
	 * @param {boolean} bSubheader Indicates the existence of subheader
	 */
	GenericTile.prototype._applyContentMode = function (bSubheader) {
		// If the FrameType is OneByOne or TwoByOne and the subheader is available, the header can have a maximum of 2 lines and the subheader can have only 1 line.
		// If the FrameType is OneByOne or TwoByOne and the subheader is unavailable, the header can have a maximum of 3 lines.
		// If the FrameType is OneByHalf or TwoByHalf and the content is available, the header can have a maximum of 1 line.
		// If the FrameType is OneByHalf or TwoByHalf and the content is unavailable, the header can have a maximum of 2 lines.

		var frameType = this.getFrameType();
		var aTileContent = this.getTileContent();
		var bIsImageContent = false;

		if (frameType === FrameType.TwoByHalf || frameType === FrameType.OneByHalf) {
			if (aTileContent.length) {
				for (var i = 0; i < aTileContent.length; i++) {
					var aTileCnt = aTileContent[i].getAggregation('content');
					if (aTileCnt !== null) {
						if ((frameType === FrameType.OneByHalf && aTileCnt.getMetadata().getName() === "sap.m.ImageContent")) {
							bIsImageContent = true;
							this._oTitle.setProperty("maxLines", 2, true);
							break;
						} else {
							this._oTitle.setProperty("maxLines", 1, true);
							break;
						}
					}
					this._oTitle.setProperty("maxLines", 2, true);
				}
			} else {
				this._oTitle.setProperty("maxLines", 2, true);
			}
		} else if (frameType === FrameType.TwoByOne && this.getMode() === GenericTileMode.ActionMode) {
			if (bSubheader) {
				this._oTitle.setProperty("maxLines", 1, true);
			} else {
				this._oTitle.setProperty("maxLines", 2, true);
			}
		} else if (bSubheader) {
			this._oTitle.setProperty("maxLines", 2, true);
		} else {
			this._oTitle.setProperty("maxLines", 3, true);
		}

		this._changeTileContentContentVisibility(true, frameType, bIsImageContent);
	};

	/**
	 * Changes the visibility of the TileContent's content
	 *
	 * @param {boolean} visible Determines if the content should be made visible or not
	 * @private
	 */
	GenericTile.prototype._changeTileContentContentVisibility = function (visible, frameType, bIsImageContent) {
		var aTileContent;

		aTileContent = this.getTileContent();
		for (var i = 0; i < aTileContent.length; i++) {
			//Hide ImageContent for FrameType OneByHalf
			if ( frameType == FrameType.OneByHalf && bIsImageContent ) {
				aTileContent[i].setRenderContent(false);
			} else {
				aTileContent[i].setRenderContent(visible);
			}
		}
	};

	/**
	 * Gets the header, subheader and image description text of GenericTile
	 *
	 * @private
	 * @returns {string} The text
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
	 * @returns {string} The text
	 */
	GenericTile.prototype._getContentAriaAndTooltipText = function () {
		var sText = "";
		var bIsFirst = true;
		var aContent = this.getTileContent();
		var sAdditionalTooltip = this.getAdditionalTooltip();

		if (!this._isInActionScope() && (this.getMode() === GenericTileMode.ContentMode || this.getMode() === GenericTileMode.ArticleMode)) {
			for (var i = 0; i < aContent.length; i++) {
				if (typeof aContent[i]._getAriaAndTooltipText === "function") {
					sText += (bIsFirst ? "" : "\n") + aContent[i]._getAriaAndTooltipText();
				} else if (aContent[i].getTooltip_AsString()) {
					sText += (bIsFirst ? "" : "\n") + aContent[i].getTooltip_AsString();
				}
				bIsFirst = false;
			}
		}

		if (sAdditionalTooltip) {
			sText += (bIsFirst ? "" : "\n") + sAdditionalTooltip;
		}

		return sText;
	};

	/**
	 * Returns a text for the ARIA label as combination of header and content texts
	 * when the tooltip is empty
	 * @private
	 * @returns {string} The ARIA label text
	 */
	GenericTile.prototype._getAriaAndTooltipText = function () {
		var sAriaText = (this.getTooltip_AsString() && !this._isTooltipSuppressed())
			? this.getTooltip_AsString()
			: (this._getHeaderAriaAndTooltipText() + "\n" + this._getContentAriaAndTooltipText());
		switch (this.getState()) {
			case LoadState.Disabled:
				return "";
			case LoadState.Loading:
				return sAriaText + "\n" + this._sLoading;
			case LoadState.Failed:
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
	 * @returns {string} Text for ARIA label.
	 */
	GenericTile.prototype._getAriaText = function () {
		var sAriaText = this.getTooltip_Text();
		var sAriaLabel = this.getAriaLabel();
		if (!sAriaText || this._isTooltipSuppressed()) {
			sAriaText = this._getAriaAndTooltipText(); // ARIA label set by the control
		}
		if (this._isInActionScope()) {
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
	 * @returns {string} Text for tooltip or null.
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
		var bActions = this._isInActionScope() || this._bShowActionsView === true;
		var frameType = this.getFrameType();
		var aTileCnt = tileContent.getAggregation('content');

		if (this._isIconMode()) { //Skip footer creation for IconMode
			tileContent.setRenderFooter(false);
		} else if (sState === LoadState.Failed || bActions && sState !== LoadState.Disabled) {
			tileContent.setRenderFooter(false);
		} else if (frameType === FrameType.TwoByHalf && (aTileCnt !== null || this.getSubheader())) {
			tileContent.setRenderFooter(false);
		} else if (frameType === FrameType.OneByHalf && ((aTileCnt !== null && aTileCnt.getMetadata().getName() !== "sap.m.ImageContent") || this.getSubheader())) {
			tileContent.setRenderFooter(false);
		} else {
			tileContent.setRenderFooter(true);
			return true;
		}
	};

	/**
	 * Shows if the scope is set to any action mode
	 *
	 * @return {boolean} True if the scope is set to an action scope, else false
	 * @private
	 */
	GenericTile.prototype._isInActionScope = function ()  {
		return this.getScope() === GenericTileScope.Actions
			|| this.getScope() === GenericTileScope.ActionMore
			|| this.getScope() === GenericTileScope.ActionRemove;
	};

	/**
	 * Shows if the scope is set to the remove action
	 *
	 * @return {boolean} True if the scope is set to the remove action
	 */
	GenericTile.prototype.isInActionRemoveScope = function () {
		return this.getScope() === GenericTileScope.ActionRemove;
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
		if (this.getMode() === GenericTileMode.LineMode) {
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
		if (this.getMode() === GenericTileMode.LineMode) {
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
		var sTooltip = this._getAriaAndTooltipText();

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
		if (this._isInActionScope()) {
			$Tile.find('*:not(.sapMGTRemoveButton)').removeAttr("aria-label").removeAttr("title").off("mouseenter");
		} else {
			$Tile.find('*').removeAttr("aria-label").removeAttr("title").off("mouseenter");
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

		if ((sScope === GenericTileScope.Actions || GenericTileScope.ActionRemove) && oEvent.target.id.indexOf("-action-remove") > -1) {//tap on icon remove in Actions scope
			sAction = GenericTile._Action.Remove;
			oDomRef = this._oRemoveButton.getPopupAnchorDomRef();
		} else if ((sScope === GenericTileScope.Actions || sScope === GenericTileScope.ActionMore) && this._isIconMode && this._isIconMode() && oEvent.target.id.indexOf("-action-more") > -1) {
			sAction = GenericTile._Action.More;
			oDomRef = this._oMoreIcon.getDomRef();
		} else if (sScope === GenericTileScope.Actions || sScope === GenericTileScope.ActionMore) {
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
		this.setProperty("pressEnabled", value);
		return this;
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

	/**
	 * Set and return aggregation of Icon to be rendered in IconMode
	 * @param {*} oIcon Icon to be displayed on the GenericTile.
	 * @returns {string} Returns the icon hidden aggregation
	 * @private
	 */
	 GenericTile.prototype._generateIconAggregation = function (oIcon) {
		var sAggregation = "";
		this._oIcon = IconPool.createControlByURI({
			size: this.getFrameType() === FrameType.OneByOne ? "2rem" : "1.25rem",
			useIconTooltip: false,
			src: oIcon
		});
		if (!this._oIcon){
			this._oIcon = IconPool.createControlByURI({
				height: this.getFrameType() === FrameType.OneByOne ? "2rem" : "1.25rem",
				width: this.getFrameType() === FrameType.OneByOne ? "2rem" : "1.25rem",
				useIconTooltip: false,
				src: oIcon
			}, Image).addStyleClass("sapMPointer").addStyleClass("sapMGTTileIcon");
		}
		this._oIcon.addStyleClass("sapMPointer").addStyleClass("sapMGTTileIcon");

		//Add Icon or Image as hidden Aggregation
		if (this._oIcon instanceof Image) {
			sAggregation = "_tileIconImage";
		} else if (this._oIcon instanceof Icon) {
			sAggregation = "_tileIcon";
		}

		if (sAggregation) {
			this.setAggregation(sAggregation, this._oIcon);
		}

		return sAggregation;
	};

	/**
	 * Returns true if Current Tile is in IconMode, FrameType is OneByOne or TwoByHalf, backgroundColor, TileIcon Properties are set.
	 */
	GenericTile.prototype._isIconMode = function () {
		if (this.getMode() === GenericTileMode.IconMode
			&& (this.getFrameType() === FrameType.OneByOne || this.getFrameType() === FrameType.TwoByHalf)){
				if (this.getTileIcon() && this.getBackgroundColor()) {
					return true;
				} else {
					if (!this.getIconLoaded()) {
						return true;
					} else {
						return false;
					}
				}
		} else {
			return false;
		}
	};

	/**
	 * Checks if Navigate Action Button should be used in Article Mode
	 * @returns {boolean} - true if Navigate Action Button is enabled
	 * @private
	 */
GenericTile.prototype._isNavigateActionEnabled = function() {
		return this.getMode() === GenericTileMode.ArticleMode && this.getUrl() && this.getEnableNavigationButton();
	};

	/**
	 * An extra width of 0.5rem would be applied when the gap is 1rem(16px) in the grid container for the TwoByOne and TwoByHalf tiles
	 * @private
	 */
	GenericTile.prototype._applyExtraWidth = function() {
		var	sGap = this.getParent().getActiveLayoutSettings().getGap(),
			bisLargeTile = this.getFrameType() === FrameType.TwoByHalf || this.getFrameType() === FrameType.TwoByOne,
			bisGap16px = sGap === "16px" || sGap === "1rem";
		if (bisGap16px && bisLargeTile){
			this.addStyleClass("sapMGTWidthForGridContainer");
		} else if (!bisGap16px && this.hasStyleClass("sapMGTWidthForGridContainer")){
			this.removeStyleClass("sapMGTWidthForGridContainer");
		}
	};
	/**
	 * Returns true if the GenericTile is in ActionMode and frameType is TwoByOne.
	 * @returns {boolean} - true if the GenericTile is in ActionMode
	 */
	GenericTile.prototype._isActionMode = function () {
		return this.getFrameType() === FrameType.TwoByOne && this.getMode() === GenericTileMode.ActionMode && this.getActionButtons().length;
	};

	/**
	 * Returns Navigate Action Button
	 * @returns {object} Button Object
	 * @private
	*/
	GenericTile.prototype._getNavigateAction = function() {
		return this._oNavigateAction;
	};

	/**
	 * Event Handler for Navigate Action Button in Article Mode
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @private
	 */
	GenericTile.prototype._navigateEventHandler = function (oEvent) {
		oEvent.preventDefault();
		var sURL = oEvent.getSource().getParent().getUrl();
		URLHelper.redirect(sURL, true);
	};

	/**
	 * Checks if any of the inner buttons in the Tile are focused or clicked
	 * @param {object} event - jQuery event object
	 * @param {object} oTile - tile object
	 * @returns {boolean} - returns true if any of the inner buttons are focused or clicked
	 * @private
	 */
	function _isInnerTileButtonPressed(event, oTile) {
		var bIsActionButtonPressed = false,
		bIsNavigateActionPressed = false;

		if (oTile._isActionMode()) {
			var oActionsContainerNode = document.querySelector("#" + oTile.getId() + "-actionButtons");
			bIsActionButtonPressed = oActionsContainerNode && oActionsContainerNode !== event.target &&  oActionsContainerNode.contains(event.target);
		}

		if (oTile._isNavigateActionEnabled()) {
			var oNavigateActionContainerNode = document.querySelector("#" + oTile.getId() + "-navigateActionContainer");
			bIsNavigateActionPressed = oNavigateActionContainerNode && oNavigateActionContainerNode !== event.target &&  oNavigateActionContainerNode.contains(event.target);
		}
		return bIsActionButtonPressed || bIsNavigateActionPressed;
	}

	return GenericTile;
});
