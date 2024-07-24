/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	"sap/base/i18n/Localization",
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
	"sap/ui/core/Lib",
	'sap/ui/core/ResizeHandler',
	"sap/base/strings/camelize",
	"sap/base/util/deepEqual",
	"sap/ui/events/PseudoEvents",
	"sap/ui/core/theming/Parameters",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Core",
	"sap/ui/core/Theming",
	"./LinkTileContent"
], function(
	library,
	Localization,
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
	Library,
	ResizeHandler,
	camelize,
	deepEqual,
	PseudoEvents,
	Parameters,
	jQuery,
	coreLibrary,
	InvisibleText,
	Core,
	Theming,
	LinkTileContent
) {
	"use strict";
	var frameTypes = library.FrameType;
	var GenericTileScope = library.GenericTileScope,
		LoadState = library.LoadState,
		CSSColor = coreLibrary.CSSColor,
		FrameType = library.FrameType,
		GenericTileMode = library.GenericTileMode,
		TileSizeBehavior = library.TileSizeBehavior,
		WrappingType = library.WrappingType,
		URLHelper = library.URLHelper,
		DEFAULT_BG_COLOR;
		//Loading the default background color asynchronously if the given color is not initially loaded
		DEFAULT_BG_COLOR = Parameters.get({
			name: "sapLegendColor9",
			callback: function (params) {
				DEFAULT_BG_COLOR = params;
			}
		});

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
				 * The FrameType: OneByOne, TwoByOne, OneByHalf, or TwoByHalf. Default set to OneByOne if property is not defined or set to Auto by the app.
				 */
				frameType: {type: "sap.m.FrameType", group: "Misc", defaultValue: FrameType.OneByOne},

				/**
				 * Backend system context information
				 * @since 1.92.0
				 * @experimental Since 1.92
				 */
				systemInfo: {type:"string",  group: "Misc", defaultValue:null},

				/**
				 * Application information such as ID/Shortcut
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
				tileIcon: {type: "sap.ui.core.URI"},

				/**
				 * Background color of the GenericTile. Only applicable for IconMode.
				 * @since 1.96
				 * @experimental Since 1.96
				*/
				backgroundColor: {type: "string", group: "Appearance",defaultValue : DEFAULT_BG_COLOR},

				/**
				 * The semantic color of the value.
				 * @experimental Since 1.95
				 * @since 1.95
				 */
				valueColor: {type: "sap.m.ValueColor", group: "Appearance", defaultValue: "None"},

				/**
				 * The load state of the tileIcon.
				 * @experimental Since 1.103
				 * @since 1.103
				 */
				iconLoaded: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * The Tile rerenders on theme change.
				 * @experimental Since 1.106
				 * @since 1.106
				 */
				renderOnThemeChange: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Show Badge Information associated with a Tile. Limited to 3 characters.
				 * When enabled, the badge information is displayed inside a folder icon.
				 * Display limited only for tile in IconMode in TwoByHalf frameType.
				 * Characters currently trimmed to 3.
				 * @experimental Since 1.113
				 * @since 1.113
				 */
				tileBadge: { type: "string", group: "Misc", defaultValue: "" },

				/**
				 * Sets the offset for the Drop Area associated with a Generic Tile.
				 * The offset is applied uniformly to all the tile edges.
				 * @experimental Since 1.113
				 * @since 1.118
				 * @ui5-restricted Used by S/4 MyHome (ux.eng.s4producthomes1)
				 */
				dropAreaOffset: { type: "int", group: "Misc", defaultValue: 0 }
			},
			defaultAggregation: "tileContent",
			aggregations: {
				/**
				 * The content of the tile.
				 */
				tileContent: {type: "sap.m.TileContent", multiple: true, bindable: "bindable"},

				/**
				 * LinkTileContent is being added to the GenericTile, it is advised to use in TwoByOne frameType
				 * @since 1.120
				 */
				linkTileContents: {type: "sap.m.LinkTileContent", multiple: true, singularName: "linkTileContent", defaultClass: LinkTileContent},

				/**
				 * Action buttons added in ActionMode.
				 * @experimental since 1.96
				 */
				actionButtons: {type: "sap.m.Button", multiple: true, bindable: "bindable"},

				/**
				 *  A badge that is attached to the GenericTile.
				 * @experimental since 1.124
				 */
				badge: {type: "sap.m.TileInfo",multiple:false,bindable: "bindable"},

				/**
				 * The hidden aggregation for the title.
				 */
				_titleText: {type: "sap.m.Text", multiple: false, visibility: "hidden"},

				/**
				 * The hidden aggregation for the message in the failed state.
				 */
				_failedMessageText: {type: "sap.m.Text", multiple: false, visibility: "hidden"},

				/**
				 * The hidden aggregation that uses this id in aria-describedby attribute.
				 */
				_invisibleText: {type:"sap.ui.core.InvisibleText",multiple: false, visibility: "hidden"},

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
		this._oRb = Library.getResourceBundleFor("sap.m");

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

		this._oInvisibleText = new InvisibleText(this.getId() + "-ariaText");
		this.setAggregation("_invisibleText", this._oInvisibleText, true);

		this._oErrorIcon = new Icon(this.getId() + "-warn-icon", {
			src: "sap-icon://error",
			size: "1.375rem"
		});

		this._oBadgeIcon = new Icon(this.getId() + '-badgeIcon');
		this.addDependent(this._oBadgeIcon);

		this._oErrorIcon.addStyleClass("sapMGTFtrFldIcnMrk");
		 //If parameter is not available synchronously it will be available through callback

		var sErrorIconColor = Parameters.get({
			name: "sapNegativeTextColor",
			callback: function(sErrorIconColor) {
				this._oErrorIcon.setColor(sErrorIconColor);
			}.bind(this)
        });
        if (sErrorIconColor) {
            this._oErrorIcon.setColor(sErrorIconColor);
        }

		this._oBusy = new HTML(this.getId() + "-overlay");
		this._oBusy.setBusyIndicatorDelay(0);

		this._bTilePress = true;
		this._bThemeApplied = false;
		Core.ready(this._handleCoreInitialized.bind(this));

		//Navigate Action Button in Article Mode
		this._oNavigateAction = new Button(this.getId() + "-navigateAction");
		this._oNavigateAction._bExcludeFromTabChain = true;
		this.addDependent(this._oNavigateAction);
		jQuery(window).on("resize", this._setupResizeClassHandler.bind(this));
		this._oBadgeColors = {
			backgroundColor: DEFAULT_BG_COLOR
		};
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
		Theming.attachApplied(this._handleThemeApplied.bind(this));
	};

	/**
	 * The tile recalculates its title's max-height when line-height could be loaded from CSS.
	 *
	 * @private
	 */
	GenericTile.prototype._handleThemeApplied = function () {
		this._bThemeApplied = true;
		this._oTitle.clampHeight();
		Theming.detachApplied(this._handleThemeApplied.bind(this));
	};

	/**
	 * Re-render control on Theme change.
	 *
	 * @private
	 */
		GenericTile.prototype.onThemeChanged = function() {
		if (this.getDomRef() && this.getRenderOnThemeChange()) {
			this.invalidate();
		}
	};

	/**
	 * Creates the content specific for the given scope in order for it to be rendered, if it does not exist already.
	 *
	 * @param {string} sTileClass indicates the tile's CSS class name
	 * @private
	 */
	GenericTile.prototype._initScopeContent = function (sTileClass) {
		if (!this.getState || this.getState() !== LoadState.Disabled) {
			if (this._oMoreIcon) {
				//It destroys the existing button when the Tile is getting rendered more than once
				this._oMoreIcon.destroy();
				this._oMoreIcon = null;
			}
			if (this.isA("sap.m.GenericTile") && this._isIconModeOfTypeTwoByHalf()){
				// Acts Like an actual Button in Icon mode for TwoByHalf Tile
				this._oMoreIcon = this._oMoreIcon || new Button({
					id: this.getId() + "-action-more",
					icon: "sap-icon://overflow",
					type: "Transparent",
					tooltip :this._oRb.getText("GENERICTILE_MORE_ACTIONBUTTON_TEXT")
				}).addStyleClass("sapMPointer").addStyleClass(sTileClass + "MoreIcon").addStyleClass(sTileClass + "ActionMoreButton");
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

		if (this._sGenericTileResizeListenerId) {
			ResizeHandler.deregister(this._sGenericTileResizeListenerId);
			this._sGenericTileResizeListenerId = null;
		}

		Device.media.detachHandler(this._handleMediaChange, this, DEVICE_SET);

		if (this._$RootNode) {
			this._$RootNode.off(this._getAnimationEvents());
			this._$RootNode = null;
		}

		//stop any currently running queue
		this._clearAnimationUpdateQueue();

		this._oErrorIcon.destroy();
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
		jQuery(window).off("resize", this._setupResizeClassHandler);
	};

	GenericTile.prototype.onBeforeRendering = function () {
		var bSubheader = !!this.getSubheader();
		var oBadge = this.getBadge();
		if (this.getMode() === GenericTileMode.HeaderMode || this.getMode() === GenericTileMode.IconMode) {
			this._applyHeaderMode(bSubheader);
		} else {
			this._applyContentMode(bSubheader);
		}
		var iTiles = this.getTileContent().length;
		for (var i = 0; i < iTiles; i++) {
			this.getTileContent()[i].setDisabled(this.getState() === LoadState.Disabled);
		}

		this._initScopeContent("sapMGT");
		this._generateFailedText();

		this.$().off("mouseenter");
		this.$().off("mouseleave");

		if (this._sParentResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sParentResizeListenerId = null;
		}
		if (this._sGenericTileResizeListenerId) {
			ResizeHandler.deregister(this._sGenericTileResizeListenerId);
			this._sGenericTileResizeListenerId = null;
		}

		//Applies new dimensions for the GenericTile if it is inscribed inside a GridContainer
		var oGetParent = this.getParent();
		if (oGetParent && oGetParent.isA("sap.f.GridContainer")){
			this._applyNewDim();
		}

		Device.media.detachHandler(this._handleMediaChange, this, DEVICE_SET);

		if (this._$RootNode) {
			this._$RootNode.off(this._getAnimationEvents());
		}

		if (this.getFrameType() === FrameType.Auto) {
			this.setFrameType(FrameType.OneByOne);
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
		//Validates the color that is getting applied on icon mode tiles so that it changes by theme
		if (this._isIconMode()) {
			this._applyColors("backgroundColor",this.getBackgroundColor());
		}
		this._isLinkTileContentPresent = this.getLinkTileContents().length > 0;
		if (oBadge) {
			this._oBadgeIcon.setSrc(oBadge.getSrc());
		}
	};

	GenericTile.prototype.onAfterRendering = function () {
		this._setupResizeClassHandler();

		var sMode = this.getMode();
		var bScreenLarge = this._isScreenLarge();
		this._sGenericTileResizeListenerId = ResizeHandler.register(this, this._handleResizeOnTile.bind(this));
		this._handleResizeOnTile();
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
		if (this._isIconModeOfTypeTwoByHalf() && this._oMoreIcon.getDomRef()){
			this._addClassesForButton();
		}

		//Adds Extra height to the TileContent when GenericTile is in ActionMode
		if (this.getFrameType()  === FrameType.TwoByOne && (this.getMode() === GenericTileMode.ActionMode || this._isLinkTileContentPresent) && this.getState() === LoadState.Loaded && !this.isA("sap.m.ActionTile")) {
			this._applyExtraHeight();
		}

		//Sets the aria-describedby attribute and uses the _invisibleText id in it
		if (this.getTooltip() && this.getDomRef()) {
			this.getDomRef().setAttribute("aria-describedby",this.getAggregation("_invisibleText").getId());
		}
		this.onDragComplete();

		//Removes the focus on the GenericTile if the parent is SlideTile
		if (this.getDomRef() && this.getParent() && this.getParent().isA("sap.m.SlideTile")) {
			this.getDomRef().setAttribute("tabindex","-1");
		}

		//Adding the aria roles and events to the more button in the IconMode tile
		if (this._oMoreIcon && this._oMoreIcon.getDomRef() && (this._isIconModeOfTypeTwoByHalf())) {
			this._attachFocusHandlingOnMoreButton(this._oMoreIcon.getDomRef());
		}
	};

	/**
	 * Checks if a tile is in IconMode and TwoByHalf frameType
	 * @returns {boolean} indicates whether the tile is in IconMode and TwoByHalf frameType
	 * @private
	 */

	GenericTile.prototype._isIconModeOfTypeTwoByHalf = function() {
		return this._isIconMode() && this.getFrameType() === FrameType.TwoByHalf;
	};

	/**
	 * Attaching focus handlers to the more button to adhere to the ACC guidelines
	 * @param {HTMLElement} [oButton] The DOM reference of the more button
	 * @private
	 */
	GenericTile.prototype._attachFocusHandlingOnMoreButton = function(oButton){
		var aText = [this.getHeader(),this.getSubheader(),this._oRb.getText("GENERICTILE_MORE_ACTIONBUTTON_TEXT")];
		var aFilteredTexts = aText.filter(function(sText){
			return sText.trim() !== '';
		});
		oButton.removeAttribute("title");
		oButton.removeAttribute("aria-describedby");
		oButton.setAttribute("aria-label",aFilteredTexts.join(" "));
		//Removes the mouseenter event if its already present
		oButton.removeEventListener("mouseenter",this._setTooltipForMoreButton.bind(this,oButton));
		oButton.addEventListener("mouseenter",this._setTooltipForMoreButton.bind(this,oButton));
		//Removes the mouseleave event if its already present
		oButton.removeEventListener("mouseleave",this._removeTooltipForButton.bind(null,oButton));
		oButton.addEventListener("mouseleave",this._removeTooltipForButton.bind(null,oButton));
	};

	/**
	 * Sets tooltip for the more button
	 * @param {HTMLElement} oButton
	 * @private
	 */

	GenericTile.prototype._setTooltipForMoreButton = function(oButton) {
		oButton.setAttribute("title",this._oRb.getText("GENERICTILE_MORE_ACTIONBUTTON_TEXT"));
	};

	/**
	 * Removes tooltip for the more button
	 * @param {HTMLElement} oButton
	 * @private
	 */

	GenericTile.prototype._removeTooltipForButton = function(oButton) {
		oButton.removeAttribute("title");
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
		if (this._isLinkTileContentPresent) {
			this._adjustFocusOnLinkTiles(this.getDomRef().classList.contains("sapMTileSmallPhone"),iHeaderLines);
		}
	};

	GenericTile.prototype._adjustFocusOnLinkTiles = function(bIsSmall,iHeaderLines) {
		var iVisibleLinks = (bIsSmall) ? 5 : 6;
		iVisibleLinks = (iHeaderLines === 2) ? --iVisibleLinks : iVisibleLinks;
		var i;
		//This removes the focus from the hidden links while navigating from tab
		for (i = this.getLinkTileContents().length - 1; i > iVisibleLinks - 1; --i) {
			this.getLinkTileContents() [i]._getLink().getDomRef().setAttribute("tabindex",-1);
		}
		//The logic mentioned here is useful when a small tile is being changed to a normal tile. In this case, the focus is removed for a couple of links at the bottom. To restore this focus, the tabindex is set back to 0
		while ( i >= 0) {
			this.getLinkTileContents() [i]._getLink().getDomRef().setAttribute("tabindex",0);
			i--;
		}
	};

	/**
	 * It saves the color inside the _oBadgeColors object with the respective key
	 *
	 * @param {string} sKey The key to which the color is mapped
	 * @param {string} sColor The color that is being fetched, it can be any css color or parameter color
	 * @private
	 */
	GenericTile.prototype._applyColors = function(sKey,sColor) {
		if (CSSColor.isValid(sColor)) {
			this._oBadgeColors[sKey] = sColor;
		} else {
			//Fetching the color from the parameters asynchronously if its not loaded initially
			var sFetchedColor = Parameters.get({
				name: sColor,
				callback: function(sParamColor) {
					this._oBadgeColors[sKey] = sParamColor;
					this.invalidate();
				}.bind(this)
			});
			if (sFetchedColor) {
				this._oBadgeColors[sKey] = sFetchedColor;
			}
		}
	};

	GenericTile.prototype._setMaxLines = function() {
		var sFrameType = this.getFrameType(),
			iLines = sFrameType === FrameType.OneByOne || sFrameType === FrameType.TwoByHalf ? 1 : 2;

		//Default maxLines
		this._oAppShortcut.setMaxLines(iLines);
		this._oSystemInfo.setMaxLines(iLines);

		if (this.getFrameType() === FrameType.TwoByHalf) {
			var bAppShortcutMore = this.getAppShortcut().length > 11,
				bSystemInfoMore = this.getSystemInfo().length > 11;

			// Line break to happen after 11 characters, App Shortcut to have more priority in display
			if ((bAppShortcutMore && bSystemInfoMore) || bAppShortcutMore) {
				this._oAppShortcut.setMaxLines(2);
			} else if (bSystemInfoMore) {
				this._oSystemInfo.setMaxLines(2);
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
		if (this.getDomRef()) {
			// removes event listener handler this._updateAriaAndTitle and this._removeTooltipFromControl to the event mouseenter and mouseleave
			this.getDomRef().removeEventListener("mouseenter",this._updateAriaAndTitle.bind(this));
			this.getDomRef().removeEventListener("mouseleave",this._removeTooltipFromControl.bind(this));
			// attaches event listener handler this._updateAriaAndTitle and this._removeTooltipFromControl to the event mouseenter and mouseleave
			this.getDomRef().addEventListener("mouseenter",this._updateAriaAndTitle.bind(this));
			this.getDomRef().addEventListener("mouseleave",this._removeTooltipFromControl.bind(this));
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
	 *Resize handler on the GenericTile
	 *
	 * @private
	 */

	 GenericTile.prototype._handleResizeOnTile = function () {
		if (this._isIconMode() && this.getFrameType() === FrameType.OneByOne) {
				this._handleResizeOnIconTile();
		}
	};

	/**
	 *Adjusts the alignment inside the IconMode tiles when its width is getting changed
	 *
	 * @private
	 */

	GenericTile.prototype._handleResizeOnIconTile = function () {
		var oTitle = this._oTitle.getDomRef();
		var bIsTabletSize =  window.matchMedia("(max-width: 600px)").matches;
		var bIsMobileSize =  window.matchMedia("(max-width: 374px)").matches;
		if (oTitle) {
			var iHeight = parseInt(getComputedStyle(oTitle).height.slice(0,2));
			var iLineHeight = parseInt(getComputedStyle(oTitle).lineHeight.slice(0,2));
			var iNumLines = iHeight / iLineHeight;
			if (iNumLines === 1) {
				this.addStyleClass("sapMGTHeaderOneLine");
			} else {
				this.removeStyleClass("sapMGTHeaderOneLine");
			}
			if (!(bIsTabletSize || bIsMobileSize) && iNumLines === 3 && this._oSubTitle.getDomRef()) {
				this._oSubTitle.setMaxLines(1);
				this.addStyleClass("sapMGTHeaderThreeLine");
			} else {
				this.removeStyleClass("sapMGTHeaderThreeLine");
				this._oSubTitle.setMaxLines(2);
			}
		}
	};

	/**
	 * @private
	 */
	GenericTile.prototype._setupResizeClassHandler = function () {
			var oParent = this.getParent();
			if (oParent && oParent.isA("sap.f.GridContainer")) {
				this._applyNewDim();
			}
			if (this.getSizeBehavior() === TileSizeBehavior.Small || window.matchMedia("(max-width: 374px)").matches || this._isSmallStretchTile()) {
				this.$().addClass("sapMTileSmallPhone");
				if (this._isSmallStretchTile()) {
					this.addStyleClass("sapMGTStretch");
				}
			} else {
				this.$().removeClass("sapMTileSmallPhone");
				this.removeStyleClass("sapMGTStretch");
			}
			if (this.__isLinkTileContentPresent) {
				this._applyExtraHeight();
			}
	};

	/**
	 *Checks if the GenericTile has stretch frametype and the window size is below 600px
	 *
	 * @returns {boolean} True if the above mentioned condition is met
	 * @private
	 */

	GenericTile.prototype._isSmallStretchTile = function () {
		return this.getFrameType() === FrameType.Stretch && window.matchMedia("(max-width: 600px)").matches;
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
			bRTL = Localization.getRTL(),
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
		oLineBreakPosition = $LineBreak.position();

		var oStyleHelperPosition = oLineBreakPosition;
		if (!(Device.browser.mozilla) && oLineBreakPosition.left < oEndMarkerPosition.left) {
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

	GenericTile.prototype.ondragend = function() {
		this.onDragComplete();
	};

	GenericTile.prototype.ontap = function (event) {
		if (!_isInnerTileButtonPressed(event, this) && !this._isLinkPressed(event)) {
			var oParams;
			// The ActionMore button in IconMode tile would be fired irrespective of the pressEnabled property
			if ((this._bTilePress || this._isActionMoreButtonVisibleIconMode(event)) && this.getState() !== LoadState.Disabled) {
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
		if (!_isInnerTileButtonPressed(event, this) && !this._isLinkPressed(event)) {
			var bIsShiftKeyPressed = event.shiftKey;
			var bIsTabKeyPressed = event.key === "Tab";
			var bIsMoreButton = event.srcControl.getId() == this._oMoreIcon.getId();
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
			//Below logic is for the visibility of the more button inside the iconMode tile
			if (this._isIconModeOfTypeTwoByHalf() && bIsTabKeyPressed) {
				//Remove the visibility on the more button when user presses on "Shift Tab" or "Tab" on the more button
				//Make the more button visible when user clicks tab key on the tile
				//We don't have to take care of the scenario when the focus comes/goes off on the tile because its already taken care from the CSS side
				if (bIsMoreButton) {
					this._oMoreIcon.removeStyleClass("sapMGTVisible");
				} else if (!bIsMoreButton && !bIsShiftKeyPressed) {
					this._oMoreIcon.addStyleClass("sapMGTVisible");
				}
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
		if (!_isInnerTileButtonPressed(event, this) && !this._isLinkPressed(event)) {
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

			// The ActionMore button in IconMode tile would be fired irrespective of the pressEnabled property
			if ((!preventPress && bFirePress && (this._bTilePress || this._isActionMoreButtonVisibleIconMode(event)))) {
				this.firePress(oParams);
				event.preventDefault();
			}

			this._updateAriaLabel(); // To update the Aria Label for Generic Tile on change.
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

			//update Avatar source if icon frame is enabled
			if (this.isA("sap.m.ActionTile") && this.getProperty("enableIconFrame")) {
				var oIconFrame = this._getIconFrame();
				if (oIconFrame) {
					oIconFrame.setSrc(uri);
				}
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
			var iHeaderLines,iSubHeaderLines;
			iSubHeaderLines = (frameType === FrameType.TwoByHalf) ? 1 : 2;
			if (frameType === FrameType.OneByOne) {
				iHeaderLines = 4;
			} else if (frameType === FrameType.TwoByHalf) {
				iHeaderLines = (bSubheader) ? 1 : 2;
			}
			this._oTitle.setMaxLines(iHeaderLines);
			this._oSubTitle.setMaxLines(iSubHeaderLines);
		} else if (frameType === FrameType.TwoByOne && (this.getLinkTileContents() > 0 || this.getMode() === GenericTileMode.ActionMode)) {
			this._oTitle.setMaxLines(2);
		} else if (frameType === FrameType.OneByHalf || frameType === FrameType.TwoByHalf) {
			this._oTitle.setMaxLines(2);
		} else {
			if (bSubheader) {
				this._oTitle.setMaxLines(4);
			} else {
				this._oTitle.setMaxLines(5);
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
							this._oTitle.setMaxLines(2);
							break;
						} else {
							this._oTitle.setMaxLines(1);
							break;
						}
					}
					this._oTitle.setMaxLines(2);
				}
			} else {
				this._oTitle.setMaxLines(2);
			}
		} else if (frameType === FrameType.TwoByOne && (this.getLinkTileContents().length > 0 || this.getMode() === GenericTileMode.ActionMode)) {
			var bIsPriorityPresent = this.isA("sap.m.ActionTile") && this.getProperty("priority") && this.getProperty("priorityText");
			if (bSubheader && !bIsPriorityPresent) {
				this._oTitle.setMaxLines(1);
			} else {
				this._oTitle.setMaxLines(2);
			}
		} else if (bSubheader) {
			this._oTitle.setMaxLines(2);
		} else {
			this._oTitle.setMaxLines(3);
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

		if (this.isA("sap.m.ActionTile") && this.getProperty("priority") && this.getProperty("priorityText")) {
			sText += (bIsFirst ? "" : "\n") + this.getProperty("priorityText");
			bIsFirst = false;
		} else if (this.getSubheader()) {
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

		if (!this._isInActionScope() && (this.getMode() === GenericTileMode.ContentMode || this.getMode() === GenericTileMode.ArticleMode || this.getMode() === GenericTileMode.ActionMode)) {
			for (var i = 0; i < aContent.length; i++) {
				if (aContent[i].getVisible()){
					if (typeof aContent[i]._getAriaAndTooltipText === "function") {
						sText += (bIsFirst ? "" : "\n") + aContent[i]._getAriaAndTooltipText();
					} else if (aContent[i].getTooltip_AsString()) {
						sText += (bIsFirst ? "" : "\n") + aContent[i].getTooltip_AsString();
					}
					bIsFirst = false;
				}
			}
		}

		if (sAdditionalTooltip) {
			sText += (bIsFirst ? "" : "\n") + sAdditionalTooltip;
		}

		return sText;
	};

	/**
	 * Returns a text for the ARIA label as combination of header and content texts
	 * @private
	 * @returns {string} The ARIA label text
	 */
	GenericTile.prototype._getAriaAndTooltipText = function () {
		var sBadgeText = this.getBadge()?.getText();
		var sAriaText = ((sBadgeText) ? sBadgeText + " " + this._oRb.getText("GENERICTILE_BADGE_APP") + "\n" : "") + this._getHeaderAriaAndTooltipText() + "\n" + this._getContentAriaAndTooltipText();
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
	 *
	 * @private
	 * @param {boolean} bHideSizeAnnouncement if set to true it hides the size announcement of the tile while read by a screen reader
	 * @returns {string} Text for ARIA label.
	 */
	GenericTile.prototype._getAriaText = function (bHideSizeAnnouncement) {
		var sAriaText = this._getAriaAndTooltipText();
		var sAriaLabel = this.getAriaLabel();
		if (!sAriaText || this._isTooltipSuppressed()) {
			sAriaText = this._getAriaAndTooltipText(); // ARIA label set by the control
		}
		if (this._isInActionScope() && this.getScope() !== GenericTileScope.ActionMore) {
			sAriaText = this._oRb.getText("GENERICTILE_ACTIONS_ARIA_TEXT") + " " + sAriaText;
		}
		if (sAriaLabel) {
			sAriaText = sAriaLabel + " " + sAriaText;
		}
		if (!bHideSizeAnnouncement) {
			sAriaText = sAriaText.trim();
			if (this.getLinkTileContents().length > 0) {
				sAriaText += ("\n" + this._oRb.getText("GENERICTILE_LINK_TILE_CONTENT_DESCRIPTION"));
			} else {
				if (this.getFrameType() !== FrameType.Stretch) {
					sAriaText += ("\n" + this._getSizeDescription());
				}
			}
		}
		return sAriaText.trim();  // ARIA label set by the app, equal to tooltip
	};

	/**
	 * Returns the size description of a tile according to its frame type, that is announced by the screen reader
	 *
	 * @returns {string} Text for the size description
	 * @private
	 */
	 GenericTile.prototype._getSizeDescription = function () {
		var sText = "",
			frameType = this.getFrameType();
		if (this.getMode() === GenericTileMode.LineMode) {
			var bIsLink = this.getUrl() && !this._isInActionScope() && this.getState() !== LoadState.Disabled;
			var bHasPress = this.hasListeners("press");
			if (bIsLink || bHasPress) {
				sText = "GENERIC_TILE_LINK";
			} else {
				sText = "GENERIC_TILE_LINE_SIZE";
			}
		} else if (frameType === FrameType.OneByHalf) {
			sText = "GENERIC_TILE_FLAT_SIZE";
		} else if (frameType === FrameType.TwoByHalf) {
			sText = "GENERIC_TILE_FLAT_WIDE_SIZE";
		} else if (frameType === FrameType.TwoByOne) {
			sText = "GENERIC_TILE_WIDE_SIZE";
		} else if (frameType === FrameType.OneByOne) {
			sText = "GENERIC_TILE_ROLE_DESCRIPTION";
		}
		return this._oRb.getText(sText);
	};

	/**
	 * Returns text for tooltip or null.
	 * If the application provides a specific tooltip, the returned string is equal to the tooltip text.
	 * If the tooltip provided by the application is a string of only white spaces, the function returns null.
	 *
	 * @returns {string|null} Text for tooltip or null.
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

	GenericTile.prototype._isLinkPressed = function (oEvent)  {
		var sEventId = oEvent.target.id;
		var oLinkTileContent = this.getLinkTileContents().find(function(oLinkTileContent){
			return oLinkTileContent._getLink().getDomRef().id === sEventId;
		});

		//The below piece of code is written for the scenario if the link inside the TileAttribute has been clicked
		var bIsLinkClicked = false;
		this.getTileContent().forEach(function(oActionTileContent){
			if (oActionTileContent._isLinkPressed) {
				bIsLinkClicked = true;
				oActionTileContent._isLinkPressed = false;
			}
		});
		return !!oLinkTileContent || bIsLinkClicked;
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
	 * Returns true if the tile is in action scope,IconMode and in TwoByHalf frameType
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 * @return {boolean} true if the tile is in action scope,IconMode and in TwoByHalf frameType
	 * @private
	 */
	 GenericTile.prototype._isActionMoreButtonVisibleIconMode = function (oEvent)  {
		return (this.getScope() === GenericTileScope.ActionMore || this.getScope() === GenericTileScope.Actions) && this._isIconModeOfTypeTwoByHalf() && oEvent.target.id.indexOf("-action-more") > -1;
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
		this._oFailedText.setText(sFailedMsg);
		this._oFailedText.setTooltip(sFailedMsg);
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
			$Tile.find('*:not(.sapMGTRemoveButton,.sapMGTActionMoreButton)').removeAttr("aria-label").removeAttr("title").off("mouseenter");
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
		if (!this._oIcon) {
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
	 * Checks if Current Tile is in IconMode, FrameType is OneByOne or TwoByHalf, backgroundColor, TileIcon Properties are set.
	 * @returns {boolean} - indicates whether icon mode is supported or not.
	 */
	GenericTile.prototype._isIconMode = function () {
		var sMode = this.getMode(),
			sFrameType = this.getFrameType(),
			sTileIcon = this.getTileIcon(),
			sBackgroundColor = this.getBackgroundColor(),
			bIsIconLoaded = this.getIconLoaded();

		this._sTileBadge = sFrameType === FrameType.TwoByHalf && this.getTileBadge().trim().substring(0, 3);
		return sMode === GenericTileMode.IconMode &&
			(sFrameType === FrameType.OneByOne || sFrameType === FrameType.TwoByHalf) &&
			((sTileIcon && sBackgroundColor) || (this._sTileBadge && sBackgroundColor) || !bIsIconLoaded);
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
	 * Applies new dimensions for the GenericTile if it is inscribed inside a GridContainer
	 * @param {sap.f.GridContainer} oSlideTileParentContainer The GridContainer where SlideTile is inscribed
	 * @private
	 */
	GenericTile.prototype._applyNewDim = function(oSlideTileParentContainer) {
		var sGap = (oSlideTileParentContainer) ? oSlideTileParentContainer.getActiveLayoutSettings().getGap() : this.getParent().getActiveLayoutSettings().getGap();
		var bisGap16px = sGap === "16px" || sGap === "1rem";
		if (bisGap16px){
			this.addStyleClass("sapMGTGridContainerOneRemGap");
		} else if (!bisGap16px && this.hasStyleClass("sapMGTGridContainerOneRemGap")){
			this.removeStyleClass("sapMGTGridContainerOneRemGap");
		}
	};
	/**
	 * Returns true if the GenericTile is in ActionMode and frameType is TwoByOne.
	 * @returns {boolean} - true if the GenericTile is in ActionMode
	 */
	GenericTile.prototype._isActionMode = function () {
		return this.getFrameType() === FrameType.TwoByOne && this.getMode() === GenericTileMode.ActionMode;
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
	* Function to apply CSS class when the footer property of TileContent is applied later
	* @param {sap.m.TileContent} oTileContent The tileContent object
	* @private
	*/
	GenericTile.prototype._applyCssStyle = function(oTileContent) {
		var isFooterPresent = this._checkFooter(oTileContent, this) && (oTileContent.getFooter() ||  oTileContent.getUnit());
		var frameType = this.getFrameType();
		if (this.getSystemInfo() || this.getAppShortcut()) {
			if (isFooterPresent && frameType !== frameTypes.OneByHalf) {
			        this.getDomRef("content").classList.add("appInfoWithFooter");
			        this.getDomRef("content").classList.remove("appInfoWithoutFooter");
                        } else if (!isFooterPresent){
                                this.getDomRef("content").classList.add("appInfoWithoutFooter");
				this.getDomRef("content").classList.remove("appInfoWithFooter");
                       }
		}
	};

	/**
	 * Calculates and returns the bounding client rectangle
	 * of the drop area taking the offset property into account.
	 * @private
	 * @param {string} sDropLayout - current drop layout
	 * @returns {object} mDropRect - bounding rectangle information factoring in offset, if required
	 */
	GenericTile.prototype.getDropAreaRect = function(sDropLayout) {
		var mDropRect = this.getDomRef().getBoundingClientRect().toJSON();
		var iDropAreaOffset = this.getDropAreaOffset();

		if (sDropLayout === "Horizontal") {
			mDropRect.left -= iDropAreaOffset;
			mDropRect.right += iDropAreaOffset;
		} else {
			mDropRect.top -= iDropAreaOffset;
			mDropRect.bottom += iDropAreaOffset;
		}

		return mDropRect;
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

		if (oTile._isActionMode() && oTile.getActionButtons().length > 0) {
            var oActionsContainerNode = document.querySelector('[id="'  + oTile.getId() + "-actionButtons" + '"]');
            bIsActionButtonPressed = oActionsContainerNode && oActionsContainerNode !== event.target &&  oActionsContainerNode.contains(event.target);
        }

        if (oTile._isNavigateActionEnabled()) {
            var oNavigateActionContainerNode = document.querySelector('[id="'  + oTile.getId() + "-navigateActionContainer" + '"]');
            bIsNavigateActionPressed = oNavigateActionContainerNode && oNavigateActionContainerNode !== event.target &&  oNavigateActionContainerNode.contains(event.target);
        }
		return bIsActionButtonPressed || bIsNavigateActionPressed;
	}

	return GenericTile;
});
