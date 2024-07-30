/*!
 * ${copyright}
 */

// Provides control sap.m.Popover.
sap.ui.define([
	'./Bar',
	'./InstanceManager',
	'./library',
	'./Title',
	"sap/base/i18n/Localization",
	'sap/ui/dom/isElementCovered',
	'sap/ui/core/Control',
	'sap/ui/core/Popup',
	'sap/ui/core/delegate/ScrollEnablement',
	'sap/ui/core/theming/Parameters',
	'sap/ui/Device',
	"sap/ui/core/util/ResponsivePaddingsEnablement",
	'sap/ui/core/library',
	'sap/ui/core/Element',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/StaticArea',
	'./PopoverRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/getScrollbarSize",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	// jQuery Plugin "firstFocusableDomRef", "lastFocusableDomRef"
	"sap/ui/dom/jquery/Focusable",
	// jQuery Plugin "rect"
	"sap/ui/dom/jquery/rect"
],
	function(
		Bar,
		InstanceManager,
		library,
		Title,
		Localization,
		isElementCovered,
		Control,
		Popup,
		ScrollEnablement,
		Parameters,
		Device,
		ResponsivePaddingsEnablement,
		coreLibrary,
		Element,
		ResizeHandler,
		StaticArea,
		PopoverRenderer,
		containsOrEquals,
		jQuery,
		getScrollbarSize,
		KeyCodes,
		Log
	) {
		"use strict";

		// shortcut for sap.m.PopupHelper
		var PopupHelper = library.PopupHelper;

		// shortcut for sap.ui.core.OpenState
		var OpenState = coreLibrary.OpenState;

		// shortcut for sap.m.PlacementType
		var PlacementType = library.PlacementType;

		// shortcut for sap.m.TitleAlignment
		var TitleAlignment = library.TitleAlignment;

		var arrowOffset = Parameters.get({
			name: "_sap_m_Popover_ArrowOffset",
			callback: function(sValue) {
				arrowOffset = parseFloat(sValue);
			}
		});

		/**
		* Constructor for a new Popover.
		*
		* @param {string} [sId] ID for the new control, generated automatically if no ID is given
		* @param {object} [mSettings] Initial settings for the new control
		*
		* @class
		* Displays additional information for an object in a compact way.
		*
		* <h3>Overview</h3>
		* The popover displays additional information for an object in a compact way and without leaving the page. The popover can contain various UI elements such as fields, tables, images, and charts. It can also include actions in the footer.
		* <h3>Structure</h3>
		* The popover has three main areas:
		* <ul>
		* <li>Header (optional) - with a back button and a title</li>
		* <li>Content - holds all the controls</li>
		* <li>Footer (optional) - with additional action buttons</li>
		* </ul>
		* <h4>Guidelines</h4>
		* <ul>
		* <li>Do not overlap popovers.</li>
		* <li>You can determine the {@link sap.m.PlacementType placement} of the popover relative to the control that opens it.</li>
		* <li>Ensure that the content has a basic design and shows only the most important information.</li>
		* </ul>
		* <h3>Usage</h3>
		* <h4>When to use:</h4>
		* <ul>
		* <li>You need to define your own structure of controls within the popover.</li>
		* </ul>
		* <h4>When not to use:</h4>
		* <ul>
		* <li>The {@link sap.m.QuickView QuickView} is more appropriate for your use case.</li>
		* </ul>
		* <h3>Responsive Behavior</h3>
		* The popover is closed when the user clicks or taps outside the popover or selects an action within the popover, which calls the popover's <code>close()</code> method. You can prevent this with the <code>modal</code> property.
		* The popover can be resized when the <code>resizable</code> property is enabled.
		*
		* When using the sap.m.Popover in Sap Quartz theme, the breakpoints and layout paddings could be determined by the container's width. To enable this concept and add responsive paddings to an element of the Popover control, you may add the following classes depending on your use case: <code>sapUiResponsivePadding--header</code>, <code>sapUiResponsivePadding--subHeader</code>, <code>sapUiResponsivePadding--content</code>, <code>sapUiResponsivePadding--footer</code>.
		* <ul>
		* <li>{@link sap.m.Popover} is <u>not</u> responsive on mobile devices - it will always be rendered as a popover and you have to take care of its size and position.</li>
		* <li>{@link sap.m.ResponsivePopover} is adaptive and responsive. It renders as a dialog with a close button in the header on phones, and as a popover on tablets.</li>
		* </ul>
		*
		* @extends sap.ui.core.Control
		* @implements sap.ui.core.PopupInterface
		* @author SAP SE
		* @version ${version}
		*
		* @public
		* @alias sap.m.Popover
		* @see {@link fiori:https://experience.sap.com/fiori-design-web/popover/ Popover}
		*/
		var Popover = Control.extend("sap.m.Popover", /** @lends sap.m.Popover.prototype */ {
			metadata: {

				interfaces: [
					"sap.ui.core.PopupInterface"
				],
				library: "sap.m",
				properties: {
					/**
					 * This is the information about on which side will the popover be placed at. Possible values are sap.m.PlacementType.Left, sap.m.PlacementType.Right, sap.m.PlacementType.Top, sap.m.PlacementType.Bottom, sap.m.PlacementType.Horizontal, sap.m.PlacementType.HorizontalPreferredLeft, sap.m.PlacementType.HorizontalPreferredRight, sap.m.PlacementType.Vertical, sap.m.PlacementType.VerticalPreferredTop, sap.m.PlacementType.VerticalPreferredBottom, sap.m.PlacementType.Auto. The default value is sap.m.PlacementType.Right. Setting this property while popover is open won't cause any rerendering of the popover, but it will take effect when it's opened again.
					 */
					placement: {
						type: "sap.m.PlacementType",
						group: "Behavior",
						defaultValue: PlacementType.Right
					},

					/**
					 * If a header should be shown at the top of the popover.
					 * *Note:* The heading level of the popover is H1. Headings in the popover content should start with H2 heading level.
					 */
					showHeader: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * Title text appears in the header. This property will be ignored when <code>showHeader</code> is set to <code>false</code>.
					 * If you want to show a header in the <code>sap.m.Popover</code>, don't forget to set the {@link #setShowHeader showHeader} property to <code>true</code>.
					 */
					title: {type: "string", group: "Appearance", defaultValue: null},

					/**
					 * If the popover will not be closed when tapping outside the popover. It also blocks any interaction with the background. The default value is false.
					 */
					modal: {type: "boolean", group: "Behavior", defaultValue: false},

					/**
					 * The offset for the popover placement in the x axis. It's with unit pixel.
					 */
					offsetX: {type: "int", group: "Appearance", defaultValue: 0},

					/**
					 * The offset for the popover placement in the y axis. It's with unit pixel.
					 */
					offsetY: {type: "int", group: "Appearance", defaultValue: 0},

					/**
					 * Whether Popover arrow should be visible
					 * @since 1.31
					 */
					showArrow: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * Set the width of the content area inside Popover. When controls which adapt their size to the parent control are added directly into Popover, for example sap.m.Page control, a size needs to be specified to the content area of the Popover. Otherwise, Popover control isn't able to display the content in the right way. This values isn't necessary for controls added to Popover directly which can decide their size by themselves, for exmaple sap.m.List, sap.m.Image etc., only needed for controls that adapt their size to the parent control.
					 * @since 1.9.0
					 */
					contentWidth: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null},

					/**
					 * Sets the minimum width of the content area inside popover.
					 * @since 1.36
					 */
					contentMinWidth: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "" },

					/**
					 * Set the height of the content area inside Popover. When controls which adapt their size to the parent control are added directly into Popover, for example sap.m.Page control, a size needs to be specified to the content area of the Popover. Otherwise, Popover control isn't able to display the content in the right way. This values isn't necessary for controls added to Popover directly which can decide their size by themselves, for exmaple sap.m.List, sap.m.Image etc., only needed for controls that adapt their size to the parent control.
					 * @since 1.9.0
					 */
					contentHeight: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null},

					/**
					 * This property indicates if user can scroll vertically inside popover when the content is bigger than the content area. However, when scrollable control (sap.m.ScrollContainer, sap.m.Page) is in the popover, this property needs to be set to false to disable the scrolling in popover in order to make the scrolling in the child control work properly.
					 * Popover detects if there's sap.m.NavContainer, sap.m.Page, or sap.m.ScrollContainer as direct child added to Popover. If there is, Popover will turn off scrolling by setting this property to false automatically ignoring the existing value of this property.
					 * @since 1.15.0
					 */
					verticalScrolling: {type: "boolean", group: "Misc", defaultValue: true},

					/**
					 * This property indicates if user can scroll horizontally inside popover when the content is bigger than the content area. However, when scrollable control (sap.m.ScrollContainer, sap.m.Page) is in the popover, this property needs to be set to false to disable the scrolling in popover in order to make the scrolling in the child control work properly.
					 * Popover detects if there's sap.m.NavContainer, sap.m.Page, or sap.m.ScrollContainer as direct child added to Popover. If there is, Popover will turn off scrolling by setting this property to false automatically ignoring the existing value of this property.
					 * @since 1.15.0
					 */
					horizontalScrolling: {type: "boolean", group: "Misc", defaultValue: true},

					/**
					 * Whether resize option is enabled.
					 * NOTE: This property is effective only on Desktop
					 * @since 1.36.4
					 */
					resizable: {type: "boolean", group: "Dimension", defaultValue: false},

					/**
					 * Specifies the aria-modal of the Popover.
					 * @since 1.70
					 * @private
					 */
					ariaModal: {type: "boolean", group: "Misc", defaultValue: true, visibility: "hidden"},

					/**
					 * Specifies the Title alignment (theme specific).
					 * If set to <code>TitleAlignment.Auto</code>, the Title will be aligned as it is set in the theme (if not set, the default value is <code>center</code>);
					 * Other possible values are <code>TitleAlignment.Start</code> (left or right depending on LTR/RTL), and <code>TitleAlignment.Center</code> (centered)
					 * @since 1.72
					 * @public
					 */
					titleAlignment : {type : "sap.m.TitleAlignment", group : "Misc", defaultValue : TitleAlignment.Auto},

					/**
					 * Specifies if the Popover should be set ARIA role 'application'.
					 * This property does not respect the avoidAriaApplicationRole core configuration, because it is expected to be used explicitly when role application is required for a specific Popover instance, no matter if the application role is present on the html body.
					 *
					 * <b>Note:</b> If this property should become public in the future, the property will have to be set on a level that will encapsulate the header and the footer of the popover as well.
					 * @since 1.77
					 * @private
					 */
					ariaRoleApplication: {type: "boolean", group: "Misc", defaultValue: false, visibility: "hidden"}
				},
				defaultAggregation: "content",
				aggregations: {

					/**
					 * The content inside the popover.
					 */
					content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},

					/**
					 * Any control that needed to be displayed in the header area. When this is set, the showHeader property is ignored, and only this customHeader is shown on the top of popover.
					 */
					customHeader: {type: "sap.ui.core.Control", multiple: false},

					/**
					 * When subHeader is assigned to Popover, it's rendered directly after the main header if there is, or at the beginning of Popover when there's no main header. SubHeader is out of the content area and won't be scrolled when content's size is bigger than the content area's size.
					 * @since 1.15.1
					 */
					subHeader: {type: "sap.ui.core.Control", multiple: false},

					/**
					 * This is optional footer which is shown on the bottom of the popover.
					 */
					footer: {type: "sap.ui.core.Control", multiple: false},

					/**
					 * This is the hidden aggregation for managing the internally created header.
					 */
					_internalHeader: {type: "sap.m.Bar", multiple: false, visibility: "hidden"},

					/**
					 * BeginButton is shown at the left side (right side in RTL mode) inside the header. When showHeader is set to false, the property is ignored.
					 * @since 1.15.1
					 */
					beginButton: {type: "sap.ui.core.Control", multiple: false},

					/**
					 * EndButton is always shown at the right side (left side in RTL mode) inside the header. When showHeader is set to false, the property is ignored.
					 * @since 1.15.1
					 */
					endButton: {type: "sap.ui.core.Control", multiple: false}
				},
				associations: {
					/**
					 * Focus on the popover is set in the sequence of <code>beginButton</code> and <code>endButton</code>, when available. But if a control other than these two buttons needs to get the focus, set the <code>initialFocus</code> with the control which should be focused on.
					 * @since 1.15.0
					 */
					initialFocus: {type: "sap.ui.core.Control", multiple: false},

					/**
					 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
					 */
					ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"},

					/**
					 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
					 */
					ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"}
				},
				events: {

					/**
					 * This event will be fired after the popover is opened.
					 */
					afterOpen: {
						parameters: {

							/**
							 * This refers to the control which opens the popover.
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * This event will be fired after the popover is closed.
					 */
					afterClose: {
						parameters: {

							/**
							 * This refers to the control which opens the popover.
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * This event will be fired before the popover is opened.
					 */
					beforeOpen: {
						parameters: {

							/**
							 * This refers to the control which opens the popover.
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * This event will be fired before the popover is closed.
					 */
					beforeClose: {
						parameters: {

							/**
							 * This refers to the control which opens the popover.
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					}
				},
				designtime: "sap/m/designtime/Popover.designtime"
			},

			renderer: PopoverRenderer
		});


		/* =========================================================== */
		/*                   begin: lifecycle methods                  */
		/* =========================================================== */
		Popover._bIOS7 = Device.os.ios && Device.os.version >= 7 && Device.os.version < 8 && Device.browser.name === "sf";

		ResponsivePaddingsEnablement.call(Popover.prototype, {
			header: {suffix: "intHeader"},
			subHeader: {selector: ".sapMPopoverSubHeader .sapMIBar"},
			content: {suffix: "cont"},
			footer: {selector: ".sapMPopoverFooter .sapMIBar"}
		});

		/**
		 * Initializes the popover control.
		 *
		 * @private
		 */
		Popover.prototype.init = function () {

			this._marginTopInit = false;
			// The following 4 values are the margins which are used to avoid making the popover very near to the border of the screen
			this._marginTop = 48; //This is the default value, and dynamic calculation will be done in afterRendering

			this._marginLeft = 10;
			this._marginRight = 10;
			this._marginBottom = 10;

			// By design Popover's min sizes are:
			// min-width: 6.25rem;
			// min-height: 2rem;
			// This property is used to limit the resizing
			this._minDimensions = {
				width: 100,
				height: 32
			};

			this._initialWindowDimensions = {};

			this.oPopup = new Popup();
			this.oPopup.setShadow(true);
			this.oPopup.setAutoClose(true);
			this.oPopup.setAnimations(jQuery.proxy(this._openAnimation, this), jQuery.proxy(this._closeAnimation, this));

			// This is data used to position the popover depending on the placement property
			this._placements = [PlacementType.Top, PlacementType.Right, PlacementType.Bottom, PlacementType.Left,
				PlacementType.Vertical, PlacementType.Horizontal, PlacementType.Auto,
				PlacementType.VerticalPreferedTop, PlacementType.VerticalPreferedBottom,
				PlacementType.HorizontalPreferedLeft, PlacementType.HorizontalPreferedRight,
				PlacementType.VerticalPreferredTop, PlacementType.VerticalPreferredBottom,
				PlacementType.HorizontalPreferredLeft, PlacementType.HorizontalPreferredRight,
				PlacementType.PreferredRightOrFlip, PlacementType.PreferredLeftOrFlip,
				PlacementType.PreferredTopOrFlip, PlacementType.PreferredBottomOrFlip];

			this._myPositions = ["center bottom", "begin center", "center top", "end center"];
			this._atPositions = ["center top", "end center", "center bottom", "begin center"];
			this._offsets = ["0 -18", "18 0", "0 18", "-18 0"];

			this._arrowOffset = 18;

			this._followOfTolerance = 32;

			// used to judge if enableScrolling needs to be disabled
			this._scrollContentList = ["sap.m.NavContainer", "sap.m.Page", "sap.m.ScrollContainer"];

			// Make this.oPopup call this._adjustPositionAndArrow each time after its position is changed
			this._fnAdjustPositionAndArrow = jQuery.proxy(this._adjustPositionAndArrow, this);

			// The orientationchange event listener
			this._fnOrientationChange = jQuery.proxy(this._onOrientationChange, this);

			// The handler to close popover when the size or position of the open by control changes
			this._fnFollowOf = jQuery.proxy(function (mInfo) {
				var oLastRect = mInfo.lastOfRect,
					oRect = mInfo.currentOfRect;

				if (Device.system.desktop &&
					this.oPopup.isTopmost() &&
					!this.getModal() &&
					isElementCovered(this._getOpenByDomRef(), this.getDomRef())) {
					this.close();
					return;
				}

				// When runs on mobile device, Popover always follows the open by control.
				// When runs on the other platforms, Popover is repositioned if the position change of openBy is smaller than the tolerance, otherwise popover is closed.
				if (!Device.system.desktop
					|| (Math.abs(oLastRect.top - oRect.top) <= this._followOfTolerance && Math.abs(oLastRect.left - oRect.left) <= this._followOfTolerance)
					|| (Math.abs(oLastRect.top + oLastRect.height - oRect.top - oRect.height) <= this._followOfTolerance && Math.abs(oLastRect.left + oLastRect.width - oRect.left - oRect.width) <= this._followOfTolerance)) {
					this.oPopup._applyPosition(this.oPopup._oLastPosition, true);
				} else {
					this.close();
				}
			}, this);

			//CSN 0001875244 2013: on desktop explicitly close popover if position of triggering
			//element is moved. Make use of popup's 'followOf' feature. This ensures that popover is
			//closed when a containing scroll container is scrolled, be it via scrollbar or using the
			//mousewheel.
			this.setFollowOf(true);

			this._initResponsivePaddingsEnablement();

			this._oRestoreFocusDelegate = {
				onBeforeRendering: function () {
					var oActiveControl = Element.closestTo(document.activeElement);
					this._sFocusControlId = oActiveControl && oActiveControl.getId();
				},
				onAfterRendering: function () {
					if (this._sFocusControlId && !containsOrEquals(this.getDomRef(), document.activeElement)) {
						Element.getElementById(this._sFocusControlId).focus();
					}
				}
			};

			var that = this;
			this.oPopup._applyPosition = function (oPosition, bFromResize) {
				var eOpenState = this.getOpenState(),
					oOf;
				// avoid calling on being closed or closed instances
				if (eOpenState === OpenState.CLOSING || eOpenState === OpenState.CLOSED) {
					return;
				}

				if (bFromResize) {
					// Save the current scroll position only when this method is called from resize handler
					// otherwise it messes the initial scrolling setting of scrollenablement in RTL mode
					that._storeScrollPosition();
				}
				that._clearCSSStyles();

				//calculate the best placement of the popover if placementType is horizontal,  vertical or auto
				var iPlacePos = that._placements.indexOf(that.getPlacement());
				if (iPlacePos > 3 && !that._bPosCalced) {
					that._calcPlacement();
					return;
				}

				that._bPosCalced = false;

				// update the "of" property on oPosition because parent can be already rerendered
				if (that._oOpenBy instanceof Element) {
					oPosition.of = that._getOpenByDomRef();
				}

				// if the openBy dom reference is null there's no need to continue the reposition the popover
				if (!oPosition.of) {
					Log.warning("sap.m.Popover: in function applyPosition, the openBy element doesn't have any DOM output. " + that);
					return;
				}

				// if the openBy dom reference is already detached from the document, try to get the dom reference with the same id from dom tree again
				if (!containsOrEquals(document.documentElement, oPosition.of) && oPosition.of.id) {
					oOf = jQuery(document.getElementById(oPosition.of.id));
					if (oOf) {
						oPosition.of = oOf;
					} else {
						Log.warning("sap.m.Popover: in function applyPosition, the openBy element's DOM is already detached from DOM tree and can't be found again by the same id. " + that);
						return;
					}
				}

				var oRect = jQuery(oPosition.of).rect();
				var $popoverWithinArea = jQuery(that.getWithinAreaDomRef());
				// if openBy Dom element is complete out of viewport after resize event, close the popover. But close it only if virtualkeyboard is not opened.
				if (bFromResize
					&& $popoverWithinArea.height() == that._initialWindowDimensions.height
					&& (oRect.top + oRect.height <= 0 || oRect.top >= $popoverWithinArea.height() || oRect.left + oRect.width <= 0 || oRect.left >= $popoverWithinArea.width())) {
					that.close();
					return;
				}

				var oScrollDomRef = that.getDomRef("scroll");

				// some mobile browser changes the scrollLeft of window after firing resize event
				// which caused the popover to be positioned at the wrong place.
				if (!Device.system.desktop) {
					jQuery(window).scrollLeft(0);
				}

				//deregister the content resize handler before repositioning
				that._deregisterContentResizeHandler();
				Popup.prototype._applyPosition.call(this, oPosition);
				that._fnAdjustPositionAndArrow();
				that._restoreScrollPosition();

				//register the content resize handler
				that._registerContentResizeHandler(oScrollDomRef);
			};

			// when popup's close method is called by autoclose handler, the beforeClose event also needs to be fired.
			// popup's close method has been inherited here in order to fire the beforeClose event for calling close on
			// autoclose.
			this.oPopup.close = function (bBeforeCloseFired) {
				var bBooleanParam = typeof bBeforeCloseFired === "boolean";
				var eOpenState = this.getOpenState();
				var bIsOpenerExisting = that._oOpenBy && that._oOpenBy.getDomRef && !!that._oOpenBy.getDomRef();

				/* Only when the given parameter is "true", the beforeClose event isn't fired here.
				Because it's already fired in the sap.m.Popover.prototype.close function.

				The event also should not be fired if the focus is still inside the Popup (with one exception described in the paragraph below).
				This could occur when the autoclose mechanism is fired by the child Popup and is called throught the EventBus.

				However, we want to fire the event if the focus is still in the Popup, but the Popover opener doesn't exist anymore.
				There are cases when the popover should be closed from a control (like a Closе button) inside of it, but a moment earlier
				its opener gets hidden by other aside logic - this is causing the auto close to be fired first and this auto-close function
				being called before the 'close' function handling the closing from the button press. See BCP: 2080253679.

				When Popup's destroy method is called without even being opened there should not be onBeforeClose event.
				When the Popover/Popoup is already closed or is closing, this should not be triggered. */
				if (bBeforeCloseFired !== true && (this.touchEnabled || !(this._isFocusInsidePopup() && bIsOpenerExisting))
					&& this.isOpen() && !(eOpenState === OpenState.CLOSED || eOpenState === OpenState.CLOSING)) {

					that.fireBeforeClose({openBy: that._oOpenBy});
				}

				that._deregisterContentResizeHandler();

				if (this._sTimeoutId && arguments.length > 1) {
					clearTimeout(this._sTimeoutId);
					this._sTimeoutId = null;
					var sAutoclose = arguments[1];

					if (typeof sAutoclose == "string" && sAutoclose == "autocloseBlur" && this._isFocusInsidePopup()) {
						return;
					}
				}

				Popup.prototype.close.apply(this, bBooleanParam ? [] : arguments);
				that.removeDelegate(that._oRestoreFocusDelegate);
			};
		};

		/**
		 * Gets the area to which the Popover is restricted.
		 *
		 * @returns {HTMLElement|Window}
		 * @private
		 */
		Popover.prototype.getWithinAreaDomRef = function () {
			return Popup.getWithinAreaDomRef();
		};

		/**
		 * Required adaptations before rendering of the Popover.
		 *
		 * @private
		 */
		Popover.prototype.onBeforeRendering = function () {
			var oNavContent, oPageContent, $popoverWithinArea,
				bHorScrolling = this.getHorizontalScrolling(),
				bVerScrolling = this.getVerticalScrolling(),
				bHorScrollingNotApplied = !bHorScrolling || this.isPropertyInitial("horizontalScrolling"),
				bVerScrollingNotApplied = !bVerScrolling || this.isPropertyInitial("verticalScrolling"),
				oHeader = this.getCustomHeader() || this._internalHeader;

			if (this.hasStyleClass("sapUiPopupWithPadding")) {
				Log.warning("Usage of CSS class 'sapUiPopupWithPadding' is deprecated. Use 'sapUiContentPadding' instead", null, "sap.m.Popover");
			}

			if (!this._initialWindowDimensions.width || !this._initialWindowDimensions.height) {
				$popoverWithinArea = jQuery(this.getWithinAreaDomRef());
				this._initialWindowDimensions = {
					width: $popoverWithinArea.width(),
					height: $popoverWithinArea.height()
				};
			}

			this._hasSingleScrollableContent();

			if (!bHorScrolling && !bVerScrolling) {
				//  If both properties are false - we do not need scroll enablement for sure
				this._forceDisableScrolling = true;
			} else if (bHorScrollingNotApplied && bVerScrollingNotApplied && this._singleScrollableContent) {
				// When scrolling isn't set manually and content has scrolling, disable scrolling automatically
				this._forceDisableScrolling = true;
				Log.info("VerticalScrolling and horizontalScrolling in sap.m.Popover with ID " + this.getId() + " has been disabled because there's scrollable content inside");
			} else {
				this._forceDisableScrolling = false;
			}

			if (!this._forceDisableScrolling) {
				if (!this._oScroller) {
					this._oScroller = new ScrollEnablement(this, this.getId() + "-scroll", {
						horizontal: bHorScrolling,
						vertical: bVerScrolling
					});
				} else {
					this._oScroller.setHorizontal(bHorScrolling);
					this._oScroller.setVertical(bVerScrolling);
				}
			}

			if (this._bContentChanged) {
				this._bContentChanged = false;
				oNavContent = this._getSingleNavContent();
				oPageContent = this._getSinglePageContent();
				if (oNavContent && !this.getModal() && !Device.system.phone) {
					//gain the focus back to popover in order to prevent the autoclose of the popover
					oNavContent.attachEvent("afterNavigate", function (oEvent) {
						var oDomRef = this.getDomRef();
						if (oDomRef) {
							var oFocusableElement = this.$().firstFocusableDomRef() || oDomRef;
							oFocusableElement.focus();
						}
					}, this);
				}
				if (oNavContent || oPageContent) {
					oPageContent = oPageContent || oNavContent.getCurrentPage();
					if (oPageContent && oPageContent._getAnyHeader) {
						this.addStyleClass("sapMPopoverWithHeaderCont");
					}

					if (oNavContent) {
						oNavContent.attachEvent("navigate", function (oEvent) {
							var oPage = oEvent.getParameter("to");
							if (oPage instanceof Control && oPage.isA("sap.m.Page")) {
								this.$().toggleClass("sapMPopoverWithHeaderCont", !!oPage._getAnyHeader());
							}
						}, this);
					}
				}
			}

			this._setHeaderTitle();

			if (!Device.system.desktop) {
				this.setResizable(false);
			}

			// title alignment
			if (oHeader && oHeader.setTitleAlignment) {
				oHeader.setTitleAlignment(this.getTitleAlignment());
			}

		};

		/**
		 * Required adaptations after rendering of the Popover.
		 *
		 * @private
		 */
		Popover.prototype.onAfterRendering = function () {
			var $openedBy, $page, $header;

			//calculate the height of the header in the current page
			//only for the first time calling after rendering
			if (!this._marginTopInit && this.getShowArrow()) {
				this._marginTop = 2;
				if (this._oOpenBy) {
					$openedBy = jQuery(this._getOpenByDomRef());
					//first check if the openedBy isn't inside a header
					if (!($openedBy.closest("header.sapMIBar").length > 0)) {
						$page = $openedBy.closest(".sapMPage");
						if ($page.length > 0) {
							$header = $page.children("header.sapMIBar");
							if ($header.length > 0) {
								this._marginTop += $header.outerHeight();
							}
						}
					}
					this._marginTopInit = true;
				}
			}

			this._repositionOffset();
		};

		/**
		 * Destroys all related objects to the Popover.
		 *
		 * @private
		 */
		Popover.prototype.exit = function () {
			this._deregisterContentResizeHandler();

			Device.resize.detachHandler(this._fnOrientationChange);

			InstanceManager.removePopoverInstance(this);

			this.removeDelegate(this._oRestoreFocusDelegate);
			this._oRestoreFocusDelegate = null;

			if (this.oPopup) {
				this.oPopup.detachClosed(this._handleClosed, this);
				this.oPopup.destroy();
				this.oPopup = null;
			}

			if (this._oScroller) {
				this._oScroller.destroy();
				this._oScroller = null;
			}

			if (this._internalHeader) {
				this._internalHeader.destroy();
				this._internalHeader = null;
			}

			if (this._headerTitle) {
				this._headerTitle.destroy();
				this._headerTitle = null;
			}
		};
		/* =========================================================== */
		/*                   end: lifecycle methods                    */
		/* =========================================================== */


		/* =========================================================== */
		/*                   begin: API method                         */
		/* =========================================================== */
		/**
		 * Opens the Popover and sets the Popover position according to the {@link #getPlacement() placement} property around the <code>oControl</code> parameter.
		 *
		 * @param {sap.ui.core.Control|HTMLElement} oControl This is the control to which the Popover will be placed. It can be not only a UI5 control, but also an existing DOM reference. The side of the placement depends on the placement property set in the Popover.
		 * @param {boolean} [bSkipInstanceManager=false] Indicates whether popover should be managed by InstanceManager or not.
		 * @returns {this} Reference to the control instance for chaining
		 * @public
		 */
		Popover.prototype.openBy = function (oControl, bSkipInstanceManager) {
			// If already opened with the needed content then return
			var oPopup = this.oPopup,
				ePopupState = this.oPopup.getOpenState(),
			// The control that needs to be focused after popover is open is calculated in following sequence:
			// initialFocus, beginButton, endButton, and popover itself.
			// focus has to be inside/on popover otherwise autoclose() will not work
				sFocusId = this._getInitialFocusId(),
				oParentDomRef, iPlacePos, bForceCompactArrowOffset, aCompactParents;

			oParentDomRef = (oControl.getDomRef && oControl.getDomRef()) || oControl;
			aCompactParents = jQuery(oParentDomRef).closest(".sapUiSizeCompact");

			// A theme can force the usage of compact arrow offset in all content density modes, by setting sapMPopoverForceCompactArrowOffset variable.
			// This is needed when a theme defines only a compact arrow for all modes.
			bForceCompactArrowOffset = Parameters.get({
					name: "_sap_m_Popover_ForceCompactArrowOffset"
			}) || "true"; // ensure a default value is added in case the parameter is not loaded

			arrowOffset = Parameters.get({
				name: "_sap_m_Popover_ArrowOffset",
				callback: function(sValue) {
					arrowOffset = parseFloat(sValue);
				}
			}) || 8;

			// cast the string value to boolean
			bForceCompactArrowOffset = bForceCompactArrowOffset === "true";

			// Determines if the Popover will be rendered in a compact mode
			this._bSizeCompact = library._bSizeCompact || !!aCompactParents.length || this.hasStyleClass("sapUiSizeCompact");
			this._bUseCompactArrow = this._bSizeCompact || bForceCompactArrowOffset;

			this._adaptPositionParams();

			if (ePopupState === OpenState.OPEN || ePopupState === OpenState.OPENING) {
				if (this._oOpenBy === oControl) {
					//if the popover is open, and is opening by the same control again, just return
					return this;
				} else {
					//if the popover is open, and is opening by another control, then first close it and open later.
					var afterClosed = function () {
						oPopup.detachClosed(afterClosed, this);
						this.openBy(oControl);
					};
					oPopup.attachClosed(afterClosed, this);

					// the focus should not be restored to the control that previously opened the popover,
					// because the focus info of the new control opening it is getting lost: BCP2170040819
					this._oPreviousFocus = null;
					this.close();
					return this;
				}
			}

			if (!oControl) {
				return this;
			}

			//bind the resize event to window
			//CSN 2012 4216945
			//binding should be registered here (very early) because when keyboard in android closes at the same time, resize event needs to be reacted in order to
			//reposition the popover after the keyboard fully closes.
			if (Device.support.touch) {
				Device.resize.attachHandler(this._fnOrientationChange);
			}

			if (!this._oOpenBy || oControl !== this._oOpenBy) {
				this._oOpenBy = oControl;
			}

			this.fireBeforeOpen({openBy: this._oOpenBy});

			oPopup.attachOpened(this._handleOpened, this);
			oPopup.attachClosed(this._handleClosed, this);
			oPopup.setInitialFocusId(sFocusId);
			// Open popup
			iPlacePos = this._placements.indexOf(this.getPlacement());
			if (iPlacePos > -1) {
				oParentDomRef = this._getOpenByDomRef();
				if (!oParentDomRef) {
					Log.error("sap.m.Popover id = " + this.getId() + ": is opened by a control which isn't rendered yet.");
					return this;
				}

				// Set the oControl as autoclosearea regardless what the
				// oParentDomRef is because clicking on the openBy control again
				// should keep the popover open.
				oPopup.setExtraContent([oControl]);

				oPopup.setContent(this);

				//if position has to be calculated wait until it is calculated with setting the position
				if (iPlacePos <= 3) {
					oPopup.setPosition(this._myPositions[iPlacePos], this._atPositions[iPlacePos], oParentDomRef, this._calcOffset(this._offsets[iPlacePos]), "fit");
				} else {
					oPopup._oPosition.of = oParentDomRef;
				}

				var that = this;
				var fCheckAndOpen = function () {
					if (oPopup.bIsDestroyed) {
						return;
					}

					if (oPopup.getOpenState() === OpenState.CLOSING) {
						if (that._sOpenTimeout) {
							clearTimeout(that._sOpenTimeout);
							that._sOpenTimeout = null;
						}
						that._sOpenTimeout = setTimeout(fCheckAndOpen, 150);
					} else {
						// Save current focused element to restore the focus after closing the dialog
						that._oPreviousFocus = Popup.getCurrentFocusInfo();
						oPopup.open();
						// delegate must be added after calling open on popup because popup should position the content first and then focus can be reset
						that.addDelegate(that._oRestoreFocusDelegate, that);
						//if popover shouldn't be managed by Instance Manager
						//e.g. SplitContainer in PopoverMode, the popover which contains the master area should be managed by the SplitContainer control
						if (!bSkipInstanceManager) {
							InstanceManager.addPopoverInstance(that);
						}
					}
				};
				fCheckAndOpen();
			} else {
				Log.error(this.getPlacement() + "is not a valid value! It can only be top, right, bottom or left");
			}
			return this;
		};

		/**
		 * Closes the popover when it's already opened.
		 *
		 * @return {this} Reference to the control instance for chaining
		 * @public
		 */
		Popover.prototype.close = function () {
			var eOpenState = this.oPopup.getOpenState(),
				bSameFocusElement, oActiveElement;

			if (eOpenState === OpenState.CLOSED || eOpenState === OpenState.CLOSING) {
				return this;
			}

			this.fireBeforeClose({openBy: this._oOpenBy});

			// beforeCloseEvent is already fired here, the parameter true needs to be passed into the popup's close method.
			this.oPopup.close(true);

			if (this._oPreviousFocus) {
				oActiveElement = document.activeElement || {};
				// if the current focused control/element is the same as the focused control/element before popover is open, no need to restore focus.
				bSameFocusElement = (this._oPreviousFocus.sFocusId === Element.getActiveElement()?.getId()) ||
					(this._oPreviousFocus.sFocusId === oActiveElement.id);

				// restore previous focus, if the current control isn't the same control as
				if (!bSameFocusElement) {
					Popup.applyFocusInfo(this._oPreviousFocus);
					this._oPreviousFocus = null;
				}
			}

			return this;
		};


		/**
		 * The method checks if the Popover is open. It returns true when the Popover is currently open (this includes opening and closing animations), otherwise it returns false.
		 *
		 * @return {boolean} whether the Popover is currently opened
		 * @public
		 * @since 1.9.1
		 */
		Popover.prototype.isOpen = function () {
			return this.oPopup && this.oPopup.isOpen();
		};

		/**
		 * The followOf feature closes the Popover when the position of the control that opened the Popover changes by at least  32 pixels (on desktop browsers). This may lead to unwanted closing of the Popover.
		 *
		 * This function is for enabling/disabling the followOf feature.
		 *
		 * @param {boolean} bValue Enables the followOf feature
		 * @return {this} Reference to the control instance for chaining
		 * @protected
		 * @since 1.16.8
		 */
		Popover.prototype.setFollowOf = function (bValue) {
			if (bValue) {
				this.oPopup.setFollowOf(this._fnFollowOf);
			} else {
				this.oPopup.setFollowOf(false);
			}
			return this;
		};

		/**
		 * Setter for property <code>bounce</code>.
		 *
		 * Default value is empty
		 *
		 * @param {boolean} bBounce New value for property <code>bounce</code>
		 * @return {this} Reference to the control instance for chaining
		 * @protected
		 * @name sap.m.Popover#setBounce
		 * @function
		 */

		/* =========================================================== */
		/*                     end: API method                         */
		/* =========================================================== */


		/* =========================================================== */
		/*                      begin: event handlers                  */
		/* =========================================================== */
		Popover.prototype._clearCSSStyles = function () {
			if (!this.getDomRef()) {
				return;
			}

			var oStyle = this.getDomRef().style,
				$content = this.$("cont"),
				$scrollArea = $content.children(".sapMPopoverScroll"),
				oContentStyle = $content[0].style,
				oScrollAreaStyle = $scrollArea[0].style,
				sContentWidth = this.getContentWidth(),
				sContentHeight = this.getContentHeight(),
				$arrow = this.$("arrow"),
				iWindowWidth,
				iWindowHeight,
				$popoverWithinArea = jQuery(this.getWithinAreaDomRef());

			if (sContentWidth.indexOf("%") > 0) {
				iWindowWidth = $popoverWithinArea.width();
				sContentWidth = PopupHelper.calcPercentageSize(sContentWidth, iWindowWidth);
			}

			if (sContentHeight.indexOf("%") > 0) {
				iWindowHeight = $popoverWithinArea.height();
				sContentHeight = PopupHelper.calcPercentageSize(sContentHeight, iWindowHeight);
			}

			oContentStyle.width = sContentWidth || "";
			oContentStyle.height = sContentHeight || "";
			oContentStyle.maxWidth = "";
			oContentStyle.maxHeight = "";

			oStyle.left = "";
			oStyle.right = "";
			oStyle.top = "";
			oStyle.bottom = "";
			oStyle.width = "";
			oStyle.height = "";
			oStyle.overflow = "";

			oScrollAreaStyle.width = "";
			oScrollAreaStyle.display = "";

			// clear arrow styles
			$arrow.removeClass("sapMPopoverArrRight sapMPopoverArrLeft sapMPopoverArrDown sapMPopoverArrUp sapMPopoverCrossArr sapMPopoverFooterAlignArr sapMPopoverHeaderAlignArr sapContrast sapContrastPlus");
			$arrow.css({
				left: "",
				top: ""
			});
		};

		Popover.prototype._onOrientationChange = function () {
			var ePopupState = (this.oPopup && this.oPopup.getOpenState()) || {};
			if (ePopupState !== OpenState.OPEN && ePopupState !== OpenState.OPENING) {
				return;
			}

			this.oPopup._applyPosition(this.oPopup._oLastPosition, true);
			this._includeScrollWidth();
		};

		/**
		 * Adjusts the content width based on how the browser handles layouting and scrollbar inclusion
		 *
		 * @private
		 */
		Popover.prototype._includeScrollWidth = function () {
			var sContentWidth = this.getContentWidth(),
				$popover = this.$(),
				iMaxWidth = Math.floor(window.innerWidth * 0.9), //90% of the max screen size
				$popoverContent = this.$('cont');

			if (!$popoverContent[0]) {
				return;
			}

			// Browsers except chrome do not increase the width of the container to include scrollbar
			if (Device.system.desktop && !Device.browser.chrome) {
				var bHasVerticalScrollbar = $popoverContent[0].clientHeight < $popoverContent[0].scrollHeight;

				if (bHasVerticalScrollbar &&					// - there is a vertical scroll
					(!sContentWidth || sContentWidth === 'auto') &&	// - when the developer hasn't set it explicitly
					$popoverContent.width() < iMaxWidth) {		// - if the popover hasn't reached a threshold size

					$popover.addClass("sapMPopoverVerticalScrollIncluded");
				} else {
					$popover.removeClass("sapMPopoverVerticalScrollIncluded");
				}
			}
		};

		/**
		 * Register the listener to close the Popover when user taps outside both of the Popover and the control that opens the Popover.
		 *
		 * @private
		 */
		Popover.prototype._handleOpened = function () {
			var that = this;
			this.oPopup.detachOpened(this._handleOpened, this);

			//	recalculate the arrow position when the size of the popover changes.
			if (!Device.support.touch) {
				setTimeout(function () {
					!that.bIsDestroyed && Device.resize.attachHandler(that._fnOrientationChange);
				}, 0);
			}

			// Set focus to the first visible focusable element
			var sFocusId = this._getInitialFocusId(),
			oControl = Element.getElementById(sFocusId),
			oDomById = (sFocusId ? window.document.getElementById(sFocusId) : null);
			if (oControl && oControl.getFocusDomRef()){
				oControl.getFocusDomRef().focus();
			} else if (!oControl && oDomById){
				oDomById.focus();
			}
			this.fireAfterOpen({openBy: this._oOpenBy});
		};

		Popover.prototype._handleClosed = function () {
			this.oPopup.detachClosed(this._handleClosed, this);

			Device.resize.detachHandler(this._fnOrientationChange);

			InstanceManager.removePopoverInstance(this);

			// If the popover is closed, the focused element has to be blurred on mobile device to close the on
			// screen keyboard when the element isn't visible
			if (!this.oPopup._bModal && !Device.system.desktop && document.activeElement && !jQuery(document.activeElement).is(":visible")) {
				 document.activeElement.blur();
			}

			this.fireAfterClose({openBy: this._oOpenBy});
		};

		/**
		 * Event handler for the focusin event.
		 * If it occurs on the focus handler elements at the beginning of the dialog, the focus is set to the end, and vice versa.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		Popover.prototype.onfocusin = function (oEvent) {
			var oSourceDomRef = oEvent.target,
				$this = this.$(),
				sFirstFeId = this.getId() + "-firstfe",
				sMiddleFeId = this.getId() + "-middlefe",
				sLastFeId = this.getId() + "-lastfe";

			//If the invisible FIRST focusable element (suffix '-firstfe') has got focus, move focus to the last focusable element inside
			if (oSourceDomRef.id === sFirstFeId) {
				// Search for anything focusable from bottom to top
				var oLastFocusableDomref = $this.lastFocusableDomRef();
				if (oLastFocusableDomref){
					oLastFocusableDomref.focus();
				} else {
					//force the focus to stay in the popover when the content is not focusable.
					document.getElementById(sMiddleFeId).focus();
				}
			} else if (oSourceDomRef.id === sLastFeId) {
				// Search for anything focusable from top to bottom
				var oFirstFocusableDomref = $this.firstFocusableDomRef();
				if (oFirstFocusableDomref){
					oFirstFocusableDomref.focus();
				} else {
					//force the focus to stay in the popover when the content is not focusable.
					document.getElementById(sMiddleFeId).focus();
				}
			}
		};

		/**
		 * Event handler for the keyup event.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		Popover.prototype.onkeydown = function (oEvent) {
			var oKC = KeyCodes,
				iKC = oEvent.which || oEvent.keyCode,
				bAlt = oEvent.altKey;

			this._isSpacePressed = this._isSpacePressed || oKC.SPACE === iKC;

			// Popover should be closed when ESCAPE key or ATL+F4 is pressed
			if ((!this._isSpacePressed && iKC === oKC.ESCAPE) ||
				(bAlt && iKC === oKC.F4)) {
				// if inner control has already handled the event, dialog doesn't process the event anymore
				if (oEvent.originalEvent && oEvent.originalEvent._sapui_handledByControl) {
					return;
				}
				this.close();

				//event should not trigger any further actions
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		};

		/**
		 * Event handler for the onkeydown event.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		Popover.prototype.onkeyup = function (oEvent) {
			var oKC = KeyCodes,
				iKC = oEvent.which || oEvent.keyCode;

			if (oKC.SPACE === iKC) {
				this._isSpacePressed = false;
			}
		};

		/**
		 * Takes care of resizing the popover
		 * @param {jQuery.Event} oEvent The event object
		 */
		Popover.prototype.onmousedown = function (oEvent) {
			var bRTL = Localization.getRTL();
			if (!oEvent.target.classList || !oEvent.target.classList.contains("sapMPopoverResizeHandle")) {
				return;
			}

			var $d = jQuery(document);
			var $popover = this.$();
			var that = this;
			$popover.addClass('sapMPopoverResizing');

			oEvent.preventDefault();
			oEvent.stopPropagation();

			var initial = {
				x: oEvent.pageX,
				y: oEvent.pageY,

				width: $popover.width(),
				height: $popover.height()
			};

			$d.on("mousemove.sapMPopover", function (e) {
				var width, height;

				if (bRTL) {
					width = initial.width + initial.x - e.pageX;
					height = initial.height + (initial.y - e.pageY);
				} else {
					width = initial.width + e.pageX - initial.x;
					height = initial.height + (initial.y - e.pageY);
				}

				that.setContentWidth(Math.max(width, that._minDimensions.width) + 'px');
				that.setContentHeight(Math.max(height, that._minDimensions.height) + 'px');
			});

			$d.on("mouseup.sapMPopover", function () {
				$popover.removeClass("sapMPopoverResizing");
				$d.off("mouseup.sapMPopover, mousemove.sapMPopover");
			});
		};

		/* =========================================================== */
		/*                      end: event handlers                  */
		/* =========================================================== */


		/* =========================================================== */
		/*                      begin: internal methods                  */
		/* =========================================================== */
		/**
		 * This method detects if there's an sap.m.NavContainer instance added as a single child into Popover's content aggregation or through one or more sap.ui.mvc.View controls.
		 * If there is, sapMPopoverNav style class will be added to the root node of the control in order to apply some special css styles to the inner dom nodes.
		 * @returns {boolean} True is there is a single NavContainer within the Popover's content
		 */
		Popover.prototype._hasSingleNavContent = function () {
			return !!this._getSingleNavContent();
		};

		Popover.prototype._getSingleNavContent = function () {
			var aContent = this._getAllContent();

			while (aContent.length === 1 && aContent[0] instanceof Control && aContent[0].isA("sap.ui.core.mvc.View")) {
				aContent = aContent[0].getContent();
			}

			if (aContent.length === 1 && aContent[0] instanceof Control && aContent[0].isA("sap.m.NavContainer")) {
				return aContent[0];
			} else {
				return null;
			}
		};

		Popover.prototype._getSinglePageContent = function () {
			var aContent = this._getAllContent();

			while (aContent.length === 1 && aContent[0] instanceof Control && aContent[0].isA("sap.ui.core.mvc.View")) {
				aContent = aContent[0].getContent();
			}

			if (aContent.length === 1 && aContent[0] instanceof Control && aContent[0].isA("sap.m.Page")) {
				return aContent[0];
			} else {
				return null;
			}
		};

		/**
		 * This method detects if there's an sap.m.Page instance added as a single child into popover's content aggregation or through one or more sap.ui.mvc.View controls.
		 * If there is, sapMPopoverPage style class will be added to the root node of the control in order to apply some special css styles to the inner dom nodes.
		 *
		 * @returns {boolean} True is there is a Page within the Popover's content
		 */
		Popover.prototype._hasSinglePageContent = function () {
			var aContent = this._getAllContent();

			while (aContent.length === 1 && aContent[0] instanceof Control && aContent[0].isA("sap.ui.core.mvc.View")) {
				aContent = aContent[0].getContent();
			}

			if (aContent.length === 1 && aContent[0] instanceof Control && aContent[0].isA("sap.m.Page")) {
				return true;
			} else {
				return false;
			}
		};

		/**
		 * If a scrollable control (sap.m.NavContainer, sap.m.ScrollContainer, sap.m.Page) is added to popover's content aggregation as a single child or through one or more sap.ui.mvc.View instances,
		 * the scrolling inside popover will be disabled in order to avoid wrapped scrolling areas.
		 *
		 * If more than one scrollable control is added to popover, the scrolling needs to be disabled manually.
		 *
		 * @returns {boolean} True if there is a scrollable element within the Popover's content
		 */
		Popover.prototype._hasSingleScrollableContent = function () {
			var aContent = this._getAllContent();
			while (aContent.length === 1 && aContent[0] instanceof Control && aContent[0].isA("sap.ui.core.mvc.View")) {
				aContent = aContent[0].getContent();
			}

			if (aContent.length === 1 && aContent[0] instanceof Control && aContent[0].isA(this._scrollContentList)) {
				this._singleScrollableContent = true;
			} else {
				this._singleScrollableContent = false;
			}
		};

		/**
		 * Returns the offsetX value by negating the value when in RTL mode.
		 *
		 * @returns {number} OffsetX The offset value
		 * @private
		 */
		Popover.prototype._getOffsetX = function () {
			var oFlipPlacement = this.getPlacement(),
				iFlipOffset = 0;

			if (this._bHorizontalFlip) {
				var oParent = this._getOpenByDomRef();
				var bHasParent = oParent !== undefined;
				var iParentWidth = bHasParent ? oParent.getBoundingClientRect().width : 0;
				iFlipOffset = oFlipPlacement === PlacementType.PreferredRightOrFlip ? Math.abs(iParentWidth) : -Math.abs(iParentWidth);
			}

			var bRtl = Localization.getRTL();
			var iOffsetX = iFlipOffset * (bRtl ? -1 : 1) + this.getOffsetX() * (bRtl ? -1 : 1);
			return iOffsetX;
		};

		/**
		 * This is only a wrapper of getOffsetY for possible future usage.
		 *
		 * @returns {number} OffsetY
		 * @private
		 */
		Popover.prototype._getOffsetY = function () {
			var oFlipPlacement = this.getPlacement(),
				iFlipOffset = 0;

			if (this._bVerticalFlip) {
				var oParent = this._getOpenByDomRef();
				var bHasParent = oParent !== undefined;
				var iParentHeight = bHasParent ? oParent.getBoundingClientRect().height : 0;
				iFlipOffset = oFlipPlacement === "PreferredTopOrFlip" ? -Math.abs(iParentHeight) : Math.abs(iParentHeight);
			}
			return iFlipOffset + this.getOffsetY();
		};

		Popover.prototype._calcOffset = function (sOffset) {
			var iOffsetX = this._getOffsetX(),
				iOffsetY = this._getOffsetY();

			var aParts = sOffset.split(" ");
			return (parseInt(aParts[0]) + iOffsetX) + " " + (parseInt(aParts[1]) + iOffsetY);
		};

		Popover.prototype._calcPlacement = function () {
			var oPlacement = this.getPlacement();
			var oParentDomRef = this._getOpenByDomRef();

			//calculate the position of the popover
			switch (oPlacement) {
			case PlacementType.Auto:
				this._calcAuto();
				break;
			case PlacementType.Vertical:
			case PlacementType.VerticalPreferredTop:
			case PlacementType.VerticalPreferredBottom:
			case PlacementType.PreferredTopOrFlip:
			case PlacementType.PreferredBottomOrFlip:
				this._calcVertical();
				break;
			case PlacementType.Horizontal:
			case PlacementType.HorizontalPreferredLeft:
			case PlacementType.HorizontalPreferredRight:
			case PlacementType.PreferredRightOrFlip:
			case PlacementType.PreferredLeftOrFlip:
				this._calcHorizontal();
				break;
			}
			//set flag to avoid calling _applyPosition
			this._bPosCalced = true;

			//set position of popover to calculated position
			var iPlacePos = this._placements.indexOf(this._oCalcedPos);
			this.oPopup.setPosition(this._myPositions[iPlacePos], this._atPositions[iPlacePos], oParentDomRef, this._calcOffset(this._offsets[iPlacePos]), "fit");
		};

		Popover.prototype._getDocHeight = function () {
			var body = document.body,
				html = document.documentElement,
				oWithinArea = this.getWithinAreaDomRef(),
				oOffset = (oWithinArea !== window) ? jQuery(oWithinArea).offset() : {top: 0};

			return oOffset.top + Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.offsetHeight);
		};

		Popover.prototype._calcVertical = function () {
			var $parent = jQuery(this._getOpenByDomRef());
			var bHasParent = $parent[0] !== undefined;
			var bPreferredPlacementTop = this.getPlacement() === PlacementType.VerticalPreferredTop;
			var bPreferredPlacementBottom = this.getPlacement() === PlacementType.VerticalPreferredBottom;
			var bPreferredTopOrFlip = this.getPlacement() === PlacementType.PreferredTopOrFlip;
			var bPreferredBottomOrFlip = this.getPlacement() === PlacementType.PreferredBottomOrFlip;
			var iParentTop = bHasParent ? $parent[0].getBoundingClientRect().top : 0;
			var iParentHeight = bHasParent ? $parent[0].getBoundingClientRect().height : 0;
			var iOffsetY = this._getOffsetY();
			var iTopSpace = iParentTop - this._marginTop + iOffsetY;
			var iPopoverHeight = this.$().outerHeight();
			var iBottomSpace = this._getDocHeight() - ($parent.offset().top + iParentHeight + this._marginBottom + iOffsetY);

			if (bPreferredPlacementTop && iTopSpace > iPopoverHeight + this._arrowOffset) {
					this._bVerticalFlip = false;
					this._oCalcedPos = PlacementType.Top;
			} else if (bPreferredTopOrFlip) {
				if (iTopSpace > iPopoverHeight + this._arrowOffset) {
					this._bVerticalFlip = false;
					this._oCalcedPos = PlacementType.Top;
				} else {
					this._bVerticalFlip = true;
					this._oCalcedPos = PlacementType.Bottom;
				}
			} else if (bPreferredPlacementBottom && iBottomSpace > iPopoverHeight + this._arrowOffset) {
				this._oCalcedPos = PlacementType.Bottom;
				this._bVerticalFlip = false;
			} else if (bPreferredBottomOrFlip) {
				if (iBottomSpace > iPopoverHeight + this._arrowOffset) {
					this._bVerticalFlip = false;
					this._oCalcedPos = PlacementType.Bottom;
				} else {
					this._bVerticalFlip = true;
					this._oCalcedPos = PlacementType.Top;
				}
			} else if (iTopSpace > iBottomSpace) {
				this._oCalcedPos = PlacementType.Top;
			} else {
				this._oCalcedPos = PlacementType.Bottom;
			}
		};

		Popover.prototype._calcHorizontal = function () {
			var $parent = jQuery(this._getOpenByDomRef());
			var bHasParent = $parent[0] !== undefined;
			var bPreferredPlacementLeft = this.getPlacement() === PlacementType.HorizontalPreferredLeft;
			var bPreferredPlacementRight = this.getPlacement() === PlacementType.HorizontalPreferredRight;
			var iParentLeft = bHasParent ? $parent[0].getBoundingClientRect().left : 0;
			var iParentWidth = bHasParent ? $parent[0].getBoundingClientRect().width : 0;
			var iOffsetX = this._getOffsetX();
			var iLeftSpace = iParentLeft - this._marginLeft + iOffsetX;
			var iParentRight = iParentLeft + iParentWidth;
			var $popoverWithinArea = jQuery(this.getWithinAreaDomRef());
			var iRightSpace = $popoverWithinArea.width() - iParentRight - this._marginRight - iOffsetX;
			var iPopoverWidth = this.$().outerWidth();
			var bPreferredLeftOrFlip = this.getPlacement() === PlacementType.PreferredLeftOrFlip;
			var bPreferredRightOrFlip = this.getPlacement() === PlacementType.PreferredRightOrFlip;
			var bRtl = Localization.getRTL();

			if (bPreferredPlacementLeft && iLeftSpace > iPopoverWidth + this._arrowOffset) {
					this._bHorizontalFlip = false;
					this._oCalcedPos = bRtl ? PlacementType.Right : PlacementType.Left;
			} else if (bPreferredLeftOrFlip) {
				if (iLeftSpace > iPopoverWidth + this._arrowOffset) {
					this._bHorizontalFlip = false;
					this._oCalcedPos = bRtl ? PlacementType.Right : PlacementType.Left;
				} else {
					this._bHorizontalFlip = true;
					this._oCalcedPos = bRtl ? PlacementType.Left : PlacementType.Right;
				}
			} else if (bPreferredPlacementRight && iRightSpace > iPopoverWidth + this._arrowOffset) {
					this._bHorizontalFlip = false;
					this._oCalcedPos = bRtl ? PlacementType.Left : PlacementType.Right;
			} else if (bPreferredRightOrFlip) {
				if (iRightSpace > iPopoverWidth + this._arrowOffset) {
					this._bHorizontalFlip = false;
					this._oCalcedPos = bRtl ? PlacementType.Left : PlacementType.Right;
				} else {
					this._bHorizontalFlip = true;
					this._oCalcedPos = bRtl ? PlacementType.Right : PlacementType.Left;
				}
			} else if (iLeftSpace > iRightSpace) {
				this._oCalcedPos = bRtl ? PlacementType.Right : PlacementType.Left;
			} else {
				this._oCalcedPos = bRtl ? PlacementType.Left : PlacementType.Right;
			}
		};

		Popover.prototype._calcAuto = function () {
			var $popoverWithinArea = jQuery(this.getWithinAreaDomRef());
			//calculate which position is the best
			if ($popoverWithinArea.width() > $popoverWithinArea.height()) {
				//in "landscape" mode horizontal is preferred, therefore it is checked first
				if (this._checkHorizontal()) {
					this._calcHorizontal();
				} else if (this._checkVertical()) {
					this._calcVertical();
				} else {
					this._calcBestPos();
				}
			} else if (this._checkVertical()) {
					this._calcVertical();
				} else if (this._checkHorizontal()) {
					this._calcHorizontal();
				} else {
					this._calcBestPos();
				}

		};

		Popover.prototype._checkHorizontal = function () {
			//check if there is enough space
			var $parent = jQuery(this._getOpenByDomRef());
			var bHasParent = $parent[0] !== undefined;
			var iParentLeft = bHasParent ? $parent[0].getBoundingClientRect().left : 0;
			var iParentWidth = bHasParent ? $parent[0].getBoundingClientRect().width : 0;
			var iOffsetX = this._getOffsetX();
			var iLeftSpace = iParentLeft - this._marginLeft + iOffsetX;
			var iParentRight = iParentLeft + iParentWidth;
			var $popoverWithinArea = jQuery(this.getWithinAreaDomRef());
			var iRightSpace = $popoverWithinArea.width() - iParentRight - this._marginRight - iOffsetX;

			var $this = this.$();
			var iWidth = $this.outerWidth() + this._arrowOffset;

			if ((iWidth <= iLeftSpace) || (iWidth <= iRightSpace)) {
				return true;
			}
		};

		Popover.prototype._checkVertical = function () {
			//check if there is enough space
			var $parent = jQuery(this._getOpenByDomRef());
			var bHasParent = $parent[0] !== undefined;
			var iParentTop = bHasParent ? $parent[0].getBoundingClientRect().top : 0;
			var iParentHeight = bHasParent ? $parent[0].getBoundingClientRect().height : 0;
			var iOffsetY = this._getOffsetY();
			var iTopSpace = iParentTop - this._marginTop + iOffsetY;
			var iBottomSpace = this._getDocHeight() - $parent.offset().top - iParentHeight - this._marginBottom - iOffsetY;

			var $this = this.$();
			var iHeight = $this.outerHeight() + this._arrowOffset;

			if ((iHeight <= iTopSpace) || (iHeight <= iBottomSpace)) {
				return true;
			}
		};

		Popover.prototype._calcBestPos = function () {
			// if all positions are not big enough, we calculate which position covers the most of the popover
			var $this = this.$();
			var iHeight = $this.outerHeight();
			var iWidth = $this.outerWidth();
			var bRtl = Localization.getRTL();

			var $parent = jQuery(this._getOpenByDomRef());
			var bHasParent = $parent[0] !== undefined;
			var iParentLeft = bHasParent ? $parent[0].getBoundingClientRect().left : 0;
			var iParentTop = bHasParent ? $parent[0].getBoundingClientRect().top : 0;
			var iParentWidth = bHasParent ? $parent[0].getBoundingClientRect().width : 0;
			var iParentHeight = bHasParent ? $parent[0].getBoundingClientRect().height : 0;
			var iOffsetX = this._getOffsetX();
			var iOffsetY = this._getOffsetY();
			var iTopSpace = iParentTop - this._marginTop + iOffsetY;
			var iBottomSpace = this._getDocHeight() - $parent.offset().top - iParentHeight - this._marginBottom - iOffsetY;
			var iLeftSpace = iParentLeft - this._marginLeft + iOffsetX;
			var iParentRight = iParentLeft + iParentWidth;
			var $popoverWithinArea = jQuery(this.getWithinAreaDomRef());
			var iRightSpace = $popoverWithinArea.width() - iParentRight - this._marginRight - iOffsetX;

			//calculation for every possible position how many percent of the popover can be covered
			var fPopoverSize = iHeight * iWidth;
			var fAvailableHeight;
			var fAvaliableWidth;

			if (($popoverWithinArea.height() - this._marginTop - this._marginBottom) >= iHeight) {
				fAvailableHeight = iHeight;
			} else {
				fAvailableHeight = $popoverWithinArea.height() - this._marginTop - this._marginBottom;
			}

			if (($popoverWithinArea.width() - this._marginLeft - this._marginRight) >= iWidth) {
				fAvaliableWidth = iWidth;
			} else {
				fAvaliableWidth = $popoverWithinArea.width() - this._marginLeft - this._marginRight;
			}

			var fLeftCoverage = (fAvailableHeight * (iLeftSpace)) / fPopoverSize;
			var fRightCoverage = (fAvailableHeight * (iRightSpace)) / fPopoverSize;
			var fTopCoverage = (fAvaliableWidth * (iTopSpace)) / fPopoverSize;
			var fBottomCoverage = (fAvaliableWidth * (iBottomSpace)) / fPopoverSize;

			//choosing of the position with the biggest coverage and setting of the associated position
			var fMaxCoverageHorizontal = Math.max(fLeftCoverage, fRightCoverage);
			var fMaxCoverageVertical = Math.max(fTopCoverage, fBottomCoverage);

			if (fMaxCoverageHorizontal > fMaxCoverageVertical) {
				if (fMaxCoverageHorizontal === fLeftCoverage) {
					this._oCalcedPos = bRtl ? PlacementType.Right : PlacementType.Left;
				} else if (fMaxCoverageHorizontal === fRightCoverage) {
					this._oCalcedPos = bRtl ? PlacementType.Left : PlacementType.Right;
				}
			} else if (fMaxCoverageVertical > fMaxCoverageHorizontal) {
				if (fMaxCoverageVertical === fTopCoverage) {
					this._oCalcedPos = PlacementType.Top;
				} else if (fMaxCoverageVertical === fBottomCoverage) {
					this._oCalcedPos = PlacementType.Bottom;
				}
			} else if (fMaxCoverageVertical === fMaxCoverageHorizontal) {
				if ($popoverWithinArea.height() > $popoverWithinArea.width()) {
					// in portrait vertical is preferred
					if (fMaxCoverageVertical === fTopCoverage) {
						this._oCalcedPos = PlacementType.Top;
					} else if (fMaxCoverageVertical === fBottomCoverage) {
						this._oCalcedPos = PlacementType.Bottom;
					}
				} else {
					// in landscape horizontal is preferred
					if (fMaxCoverageHorizontal === fLeftCoverage) {
						this._oCalcedPos = bRtl ? PlacementType.Right : PlacementType.Left;
					} else if (fMaxCoverageHorizontal === fRightCoverage) {
						this._oCalcedPos = bRtl ? PlacementType.Left : PlacementType.Right;
					}
				}
			}
		};

		/**
		 * Calculate outerWidth of the element; used as hook for SVG elements
		 * @param {HTMLElement} oElement An Element for which outerWidth will be calculated
		 * @param {boolean} [bIncludeMargin=false] Determines if the margins should be included in the calculated outerWidth
		 * @returns {number} The outer width of the element
		 * @protected
		 */
		Popover.outerWidth = function (oElement, bIncludeMargin) {
			if (typeof window.SVGElement !== "undefined" && oElement instanceof window.SVGElement) {
				return oElement.getBoundingClientRect().width;
			}

			return jQuery(oElement).outerWidth(!!bIncludeMargin);
		};

		/**
		 * Calculate outerHeight of the element; used as hook for SVG elements
		 * @param {HTMLElement} oElement An Element for which outerHeight will be calculated.
		 * @param {boolean} [bIncludeMargin=false] Determines if the margins should be included in the calculated outerHeight
		 * @returns {number} The outer height of the element
		 * @protected
		 */
		Popover.outerHeight = function (oElement, bIncludeMargin) {
			if (typeof window.SVGElement !== "undefined" && oElement instanceof window.SVGElement) {
				return oElement.getBoundingClientRect().height;
			}
			return jQuery(oElement).outerHeight(!!bIncludeMargin);
		};

		Popover.prototype._getPositionParams = function ($popover, $arrow, $content, $scrollArea) {
			var oComputedStyle = window.getComputedStyle($popover[0]),
				oContentComputedStyle = window.getComputedStyle($content[0]),
				$window = jQuery(window),
				fScrollWidth = this.getDomRef().clientHeight !== this.getDomRef().scrollHeight ? getScrollbarSize().width : 0,
				$popoverWithinArea = jQuery(this.getWithinAreaDomRef()),
				oWithinOffset = ($popoverWithinArea[0] !== window) ? $popoverWithinArea.offset() : {top: 0, left: 0},
				oPosParams = {};

			oPosParams._$popover = $popover;
			oPosParams._$parent = jQuery(this._getOpenByDomRef());
			oPosParams._$arrow = $arrow;
			oPosParams._$content = $content;
			oPosParams._$scrollArea = $scrollArea;

			oPosParams._$header = $popover.children(".sapMPopoverHeader");
			oPosParams._$subHeader = $popover.children(".sapMPopoverSubHeader");

			oPosParams._$footer = $popover.children(".sapMPopoverFooter");

			// Window dimensions
			oPosParams._fWindowTop = $window.scrollTop();
			oPosParams._fWindowRight = $window.width();
			oPosParams._fWindowBottom = (Popover._bIOS7 && Device.orientation.landscape && window.innerHeight) ? window.innerHeight : $window.height();
			oPosParams._fWindowLeft = $window.scrollLeft();
			oPosParams._fWindowWidth = window.innerWidth;
			oPosParams._fWindowHeight = window.innerHeight;

			oPosParams._fWithinAreaWidth = Math.min($popoverWithinArea.outerWidth(), oPosParams._fWindowWidth);
			oPosParams._fWithinAreaHeight = Math.min($popoverWithinArea.outerHeight(), oPosParams._fWindowHeight);

			oPosParams._fDocumentWidth = oPosParams._fWindowLeft + oPosParams._fWindowRight;
			oPosParams._fDocumentHeight = oPosParams._fWindowTop + oPosParams._fWindowBottom;

			oPosParams._fArrowHeight = $arrow.outerHeight(true);
			oPosParams._fPopoverWidth = Popover.outerWidth($popover[0]);
			oPosParams._fPopoverInnerWidth = oPosParams._$scrollArea ? (oPosParams._$scrollArea.width() + fScrollWidth) : 0;
			oPosParams._fPopoverHeight = Popover.outerHeight($popover[0]);
			oPosParams._fHeaderHeight = oPosParams._$header.length > 0 ? oPosParams._$header.outerHeight(true) : 0;
			oPosParams._fSubHeaderHeight = oPosParams._$subHeader.length > 0 ? oPosParams._$subHeader.outerHeight(true) : 0;
			oPosParams._fFooterHeight = oPosParams._$footer.length > 0 ? oPosParams._$footer.outerHeight(true) : 0;

			oPosParams._fPopoverOffset = $popover.offset();
			oPosParams._fPopoverOffsetX = this._getOffsetX();
			oPosParams._fPopoverOffsetY = this._getOffsetY();

			oPosParams._fPopoverMarginTop = oPosParams._fWindowTop + this._marginTop + oWithinOffset.top;
			oPosParams._fPopoverMarginLeft = oPosParams._fWindowLeft + this._marginLeft + oWithinOffset.left;
			oPosParams._fPopoverMarginRight = oPosParams._fWindowWidth - oWithinOffset.left - oPosParams._fWithinAreaWidth + this._marginRight;
			oPosParams._fPopoverMarginBottom = oPosParams._fWindowHeight - oWithinOffset.top - oPosParams._fWithinAreaHeight + this._marginBottom;

			oPosParams._fPopoverBorderTop = parseFloat(oComputedStyle.borderTopWidth);
			oPosParams._fPopoverBorderRight = parseFloat(oComputedStyle.borderRightWidth);
			oPosParams._fPopoverBorderBottom = parseFloat(oComputedStyle.borderBottomWidth);
			oPosParams._fPopoverBorderLeft = parseFloat(oComputedStyle.borderLeftWidth);

			oPosParams._fContentMarginTop = parseFloat(oContentComputedStyle.marginTop);
			oPosParams._fContentMarginBottom = parseFloat(oContentComputedStyle.marginBottom);

			return oPosParams;
		};

		/**
		 * Recalculate the margin offsets so the Popover will never cover the control that opens it.
		 *
		 * @param {sap.m.PlacementType} sCalculatedPlacement Calculated placement of the Popover
		 * @param {object} oPosParams used to calculate actual values for the screen margins, so the Popover will never cover the Opener control or goes outside of the viewport
		 * @private
		 */
		Popover.prototype._recalculateMargins = function (sCalculatedPlacement, oPosParams) {
			var fNewCalc;
			var bRtl = Localization.getRTL();

			//make the popover never cover the control or dom node that opens the popover
			switch (sCalculatedPlacement) {
				case PlacementType.Left:
					if (bRtl) {
						oPosParams._fPopoverMarginLeft = oPosParams._$parent.offset().left + Popover.outerWidth(oPosParams._$parent[0], false) + this._arrowOffset - oPosParams._fPopoverOffsetX;
					} else {
						oPosParams._fPopoverMarginRight = oPosParams._fWindowWidth - oPosParams._$parent.offset().left + this._arrowOffset - oPosParams._fPopoverOffsetX;
					}
					break;
				case PlacementType.Right:
					if (bRtl) {
						oPosParams._fPopoverMarginRight = oPosParams._fWindowWidth - Popover.outerWidth(oPosParams._$parent[0], false) - oPosParams._$parent.offset().left + this._arrowOffset;
					} else {
						oPosParams._fPopoverMarginLeft = oPosParams._$parent.offset().left + Popover.outerWidth(oPosParams._$parent[0], false) + this._arrowOffset + oPosParams._fPopoverOffsetX;
					}
					break;
				case PlacementType.Top:
					fNewCalc = oPosParams._fWindowHeight - oPosParams._$parent.offset().top + this._arrowOffset - oPosParams._fPopoverOffsetY;
					oPosParams._fPopoverMarginBottom = fNewCalc > oPosParams._fPopoverMarginBottom ? fNewCalc : oPosParams._fPopoverMarginBottom;
					break;
				case PlacementType.Bottom:
					oPosParams._fPopoverMarginTop = oPosParams._$parent.offset().top + Popover.outerHeight(oPosParams._$parent[0], false) + this._arrowOffset + oPosParams._fPopoverOffsetY;
					break;
			}

			return oPosParams;
		};

		/**
		 * Gets the styles for positioning the Popover.
		 *
		 * @param {object} oPosParams used to calculate actual values for the Popover's top, left, right and bottom properties
		 * @returns {object} Values for positioning the Popover
		 * @private
		 */
		Popover.prototype._getPopoverPositionCss = function (oPosParams) {
			var iLeft,
				iRight,
				iTop,
				iBottom,
				iPosToRightBorder = oPosParams._fDocumentWidth - oPosParams._fPopoverOffset.left - oPosParams._fPopoverWidth,
				iPosToBottomBorder = oPosParams._fDocumentHeight - oPosParams._fPopoverOffset.top - oPosParams._fPopoverHeight,
				bExceedHorizontal = (oPosParams._fDocumentWidth - oPosParams._fPopoverMarginRight - oPosParams._fPopoverMarginLeft) < oPosParams._fPopoverWidth,
				bExceedVertical = (oPosParams._fDocumentHeight - oPosParams._fPopoverMarginTop - oPosParams._fPopoverMarginBottom) < oPosParams._fPopoverHeight,
				bOverLeft = oPosParams._fPopoverOffset.left < oPosParams._fPopoverMarginLeft,
				//Include Scrollbar's width in these calculations
				fScrollbarSize = this.getVerticalScrolling() && (oPosParams._fPopoverWidth !== oPosParams._fPopoverInnerWidth) ?
					getScrollbarSize().width : 0,
				bOverRight = iPosToRightBorder < (oPosParams._fPopoverMarginRight + fScrollbarSize),
				bOverTop = oPosParams._fPopoverOffset.top < oPosParams._fPopoverMarginTop,
				bOverBottom = iPosToBottomBorder < oPosParams._fPopoverMarginBottom,
				bRtl = Localization.getRTL();

			if (bExceedHorizontal) {
				iLeft = oPosParams._fPopoverMarginLeft;
				iRight = oPosParams._fPopoverMarginRight;
			} else if (bOverLeft) {
					iLeft = oPosParams._fPopoverMarginLeft;
					if (bRtl) {
						// when only one side of the popover goes beyond the defined border make sure that
						// only one from the iLeft and iRight is set because Popover has a fixed size and
						// can't react to content size change when both are set
						iRight = "";
					}
				} else if (bOverRight) {
					iRight = oPosParams._fPopoverMarginRight;
					// when only one side of the popover goes beyond the defined border make sure that
					// only one from the iLeft and iRight is set because Popover has a fixed size and
					// can't react to content size change when both are set
					iLeft = "";
				}

			if (bExceedVertical) {
				iTop = oPosParams._fPopoverMarginTop;
				iBottom = oPosParams._fPopoverMarginBottom;
			} else if (bOverTop) {
				iTop = oPosParams._fPopoverMarginTop;
			} else if (bOverBottom) {
				iBottom = oPosParams._fPopoverMarginBottom;
				// when only one side of the popover goes beyond the defined border make sure that
				// only one from the iLeft and iRight is set because Popover has a fixed size and
				// can't react to content size change when both are set
				iTop = "";
			}

			var mPosition = {
				top: iTop,
				bottom: iBottom - oPosParams._fWindowTop,
				left: iLeft,
				right: typeof iRight === "number" ? iRight - oPosParams._fWindowLeft : iRight
			};

			return mPosition;
		};

		/**
		 * Gets styles for the content area.
		 *
		 * @param {object} oPosParams used to calculate the content dimension (width, height, max-height) values
		 * @returns {object} Calculated styles for content area
		 * @private
		 */
		Popover.prototype._getContentDimensionsCss = function (oPosParams) {
			var oCSS = {},
				iActualContentHeight = oPosParams._$content[0].getBoundingClientRect().height,
				iMaxContentWidth = this._getMaxContentWidth(oPosParams),
				iMaxContentHeight = this._getMaxContentHeight(oPosParams);

				//make sure iMaxContentHeight is NEVER less than 0
			iMaxContentHeight = Math.max(iMaxContentHeight, 0);

			oCSS["max-width"] = iMaxContentWidth + "px";
			// When Popover can fit into the current screen size, don't set the height on the content div.
			// This can fix the flashing scroll bar problem when content size gets bigger after it's opened.
			// When position: absolute is used on the scroller div, the height has to be kept otherwise content div has 0 height.
			if (this.getContentHeight() || (iActualContentHeight > iMaxContentHeight)) {
				oCSS["height"] = Math.min(iMaxContentHeight, iActualContentHeight) + "px";
			} else {
				oCSS["height"] = "";
				oCSS["max-height"] = iMaxContentHeight + "px";
			}

			return oCSS;
		};

		/**
		 * Gets max content width.
		 *
		 * @param {object} oPosParams Parameters used from the method to calculate the right values
		 * @returns {number} Calculated max content width
		 * @private
		 */
		Popover.prototype._getMaxContentWidth = function (oPosParams) {
			var fPopoverInnerElementsSpacing = oPosParams._fPopoverBorderLeft + oPosParams._fPopoverBorderRight;

			return oPosParams._fDocumentWidth - oPosParams._fPopoverMarginLeft -
				oPosParams._fPopoverMarginRight - fPopoverInnerElementsSpacing;
		};

		/**
		 * Gets max content height.
		 *
		 * @param {object} oPosParams Parameters used from the method to calculate the right values
		 * @returns {number} Calculated max content height
		 * @private
		 */
		Popover.prototype._getMaxContentHeight = function (oPosParams) {
			var fPopoverInnerElementsHeight = oPosParams._fHeaderHeight + oPosParams._fSubHeaderHeight +
				oPosParams._fFooterHeight + oPosParams._fContentMarginTop + oPosParams._fContentMarginBottom +
				oPosParams._fPopoverBorderTop + oPosParams._fPopoverBorderBottom;

			return oPosParams._fDocumentHeight - oPosParams._fPopoverMarginTop -
				oPosParams._fPopoverMarginBottom - fPopoverInnerElementsHeight;
		};

		/**
		 * Determines whether the horizontal scrollbar is needed.
		 *
		 * @param {object} oPosParams Parameters used from the method to calculate the right values.
		 *
		 * @returns {boolean} Whether the horizontal scrollbar is needed.
		 * @private
		 */
		Popover.prototype._isHorizontalScrollbarNeeded = function (oPosParams) {

			// disable the horizontal scrolling when content inside can fit the container
			return this.getHorizontalScrolling() && (oPosParams._$scrollArea.outerWidth(true) <= oPosParams._$content.width());
		};

		/**
		 * Gets arrow offset styles.
		 *
		 * @param {sap.m.PlacementType} sCalculatedPlacement Calculated placement of the Popover
		 * @param {object} oPosParams Parameters used from the method to calculate the right values
		 *
		 * @returns {object} Correct position type and value
		 * @private
		 */
		Popover.prototype._getArrowOffsetCss = function (sCalculatedPlacement, oPosParams) {
			var iPosArrow,
				bRtl = Localization.getRTL();

			// Recalculate Popover width and height because they can be changed after position adjustments
			oPosParams._fPopoverWidth = oPosParams._$popover.outerWidth();
			oPosParams._fPopoverHeight = oPosParams._$popover.outerHeight();

			// Set arrow offset
			if (sCalculatedPlacement === PlacementType.Left || sCalculatedPlacement === PlacementType.Right) {
				iPosArrow = oPosParams._$parent.offset().top - oPosParams._$popover.offset().top - oPosParams._fPopoverBorderTop + oPosParams._fPopoverOffsetY + 0.5 * (Popover.outerHeight(oPosParams._$parent[0], false) - oPosParams._$arrow.outerHeight(false));
				iPosArrow = Math.max(iPosArrow, arrowOffset);
				iPosArrow = Math.min(iPosArrow, oPosParams._fPopoverHeight - arrowOffset - oPosParams._$arrow.outerHeight());
				return {"top": iPosArrow};
			} else if (sCalculatedPlacement === PlacementType.Top || sCalculatedPlacement === PlacementType.Bottom) {
				if (bRtl) {
					iPosArrow = oPosParams._$popover.offset().left + Popover.outerWidth(oPosParams._$popover[0], false) - (oPosParams._$parent.offset().left + Popover.outerWidth(oPosParams._$parent[0], false)) + oPosParams._fPopoverBorderRight + oPosParams._fPopoverOffsetX + 0.5 * (Popover.outerWidth(oPosParams._$parent[0], false) - oPosParams._$arrow.outerWidth(false));
					iPosArrow = Math.max(iPosArrow, arrowOffset);
					iPosArrow = Math.min(iPosArrow, oPosParams._fPopoverWidth - arrowOffset - oPosParams._$arrow.outerWidth(false));
					return {"right": iPosArrow};
				} else {
					iPosArrow = oPosParams._$parent.offset().left - oPosParams._$popover.offset().left - oPosParams._fPopoverBorderLeft + oPosParams._fPopoverOffsetX + 0.5 * (Popover.outerWidth(oPosParams._$parent[0], false) - oPosParams._$arrow.outerWidth(false));
					iPosArrow = Math.max(iPosArrow, arrowOffset);
					iPosArrow = Math.min(iPosArrow, oPosParams._fPopoverWidth - arrowOffset - oPosParams._$arrow.outerWidth(false));
					return {"left": iPosArrow};
				}
			}
		};

		/**
		 * Gets the CSS class for positioning the arrow.
		 *
		 * @param {sap.m.PlacementType} sCalculatedPlacement Calculated placement of the Popover
		 *
		 * @returns {string} CSS class for positioning the arrow
		 * @private
		 */
		Popover.prototype._getArrowPositionCssClass = function (sCalculatedPlacement) {
			switch (sCalculatedPlacement) {
				case PlacementType.Left:
					return "sapMPopoverArrRight";

				case PlacementType.Right:
					return "sapMPopoverArrLeft";

				case PlacementType.Top:
					return "sapMPopoverArrDown";

				case PlacementType.Bottom:
					return "sapMPopoverArrUp";
			}
		};

		/**
		 * Gets the CSS class for arrow if it crosses header or footer.
		 *
		 * @param {object} oPosParams Parameters used from the method to calculate the right values
		 *
		 * @returns {string|undefined} Correct CSS class or <code>undefined</code> if the Arrow does not cross Header or Footer
		 * @private
		 */
		Popover.prototype._getArrowStyleCssClass = function (oPosParams) {
			//cross header or cross footer detection
			var oArrowPos = oPosParams._$arrow.position(),
				oFooterPos = oPosParams._$footer.position(),
				oNavContent = this._getSingleNavContent(),
				oPageContent = this._getSinglePageContent(),
				iPageHeaderHeight = 0;

			if (oNavContent || oPageContent) {
				oPageContent = oPageContent || oNavContent.getCurrentPage();

				if (oPageContent) {
					iPageHeaderHeight = oPageContent._getAnyHeader().$().outerHeight();
				}
			}

			if ((oArrowPos.top + oPosParams._fArrowHeight) < (oPosParams._fHeaderHeight + oPosParams._fSubHeaderHeight) || ((oArrowPos.top + oPosParams._fArrowHeight) < iPageHeaderHeight)) {
				return "sapMPopoverHeaderAlignArr";
			} else if ((oArrowPos.top < (oPosParams._fHeaderHeight + oPosParams._fSubHeaderHeight)) || (oArrowPos.top < iPageHeaderHeight) || (oPosParams._$footer.length && ((oArrowPos.top + oPosParams._fArrowHeight) > oFooterPos.top) && (oArrowPos.top < oFooterPos.top))) {
				return "sapMPopoverCrossArr";
			} else if (oPosParams._$footer.length && (oArrowPos.top > oFooterPos.top)) {
				return "sapMPopoverFooterAlignArr";
			}
		};

		/**
		 * Gets the calculated placement of the Popover.
		 *
		 * @returns {sap.m.PlacementType} The placement of the popover
		 * @private
		 */
		Popover.prototype._getCalculatedPlacement = function () {
			return this._oCalcedPos || this.getPlacement();
		};

		/**
		 * Rearrange the arrow and the popover position.
		 *
		 * @private
		 */
		Popover.prototype._adjustPositionAndArrow = function () {
			var ePopupState = this.oPopup.getOpenState();
			if (!(ePopupState === OpenState.OPEN || ePopupState === OpenState.OPENING)) {
				return;
			}

			this._beforeAdjustPositionAndArrowHook();

			var $popover = this.$(),
				$arrow = this.$("arrow"),
				$content = this.$("cont"),
				$scrollArea = this.$("scroll"),
				sCalculatedPlacement = this._getCalculatedPlacement(),
				oPosParams = this._getPositionParams($popover, $arrow, $content, $scrollArea);

			oPosParams = this._recalculateMargins(sCalculatedPlacement, oPosParams);

			var oPopoverPosition = this._getPopoverPositionCss(oPosParams),
				oContentSize = this._getContentDimensionsCss(oPosParams),
				bHorizontalScrollbarNeeded = this._isHorizontalScrollbarNeeded(oPosParams);

			// Reposition popover
			$popover.css(oPopoverPosition);

			// Resize popover content, if necessary
			$content.css(oContentSize);

			// Enable the scrollbar, if necessary
			if (bHorizontalScrollbarNeeded) {
				$scrollArea.css("display", "block");
			}

			if (this.getShowArrow()) {
				// Set the arrow next to the opener
				var iArrowOffset = this._getArrowOffsetCss(sCalculatedPlacement, oPosParams),
					sArrowPositionClass = this._getArrowPositionCssClass(sCalculatedPlacement),
					sArrowStyleClass, bUseContrastContainer;

				// Remove old position of the arrow and add the new one
				$arrow.removeAttr("style");
				$arrow.css(iArrowOffset);

				// Add position class to the arrow
				$arrow.addClass(sArrowPositionClass);

				// Use contrast container if the arrow is placed down and the footer exists.
				if (sCalculatedPlacement === PlacementType.Top && oPosParams._$footer && oPosParams._$footer.length) {
					bUseContrastContainer = true;
				}

				// Style the arrow according to the header/footer/content if it is to the left or right
				if (sCalculatedPlacement === PlacementType.Left || sCalculatedPlacement === PlacementType.Right) {
					sArrowStyleClass = this._getArrowStyleCssClass(oPosParams);

					if (sArrowStyleClass) {
						$arrow.addClass(sArrowStyleClass);

						// Use contrast container if there is a footer and the arrow is around it.
						if (sArrowStyleClass === "sapMPopoverFooterAlignArr") {
							bUseContrastContainer = true;
						}
					}
				}

				// Add the contrast container classes when a contrast container should be used.
				if (bUseContrastContainer) {
					$arrow.addClass("sapContrast sapContrastPlus");
				}

				// Prevent the popover from hiding the arrow
				$popover.css("overflow", "visible");
			}

			this._afterAdjustPositionAndArrowHook();
		};

		/**
		 * Adapt position and offsets variables if the Popover is used without arrow.
		 *
		 * @private
		 */
		Popover.prototype._adaptPositionParams = function () {
			if (this.getShowArrow()) {
				this._marginLeft = 10;
				this._marginRight = 10;
				this._marginBottom = 10;

				this._arrowOffset = 18;
				this._offsets = ["0 -18", "18 0", "0 18", "-18 0"];

				if (this._bUseCompactArrow) {
					this._arrowOffset = 9;
					this._offsets = ["0 -9", "9 0", "0 9", "-9 0"];
				}

				this._myPositions = ["center bottom", "begin center", "center top", "end center"];
				this._atPositions = ["center top", "end center", "center bottom", "begin center"];
			} else {
				this._marginTop = 0;
				this._marginLeft = 0;
				this._marginRight = 0;
				this._marginBottom = 0;

				this._arrowOffset = 0;
				this._offsets = ["0 0", "0 0", "0 0", "0 0"];

				this._myPositions = ["begin bottom", "begin center", "begin top", "end center"];
				this._atPositions = ["begin top", "end center", "begin bottom", "begin center"];
			}
		};

		/**
		 * Hook called after adjusment of the Popover position.
		 *
		 * @protected
		 */
		Popover.prototype._afterAdjustPositionAndArrowHook = function () {
		};

		/**
		 * Hook called before adjusment of the Popover position.
		 *
		 * @protected
		 */
		Popover.prototype._beforeAdjustPositionAndArrowHook = function () {
		};

		/**
		 * Determine if the <code>oDomNode</code> is inside the Popover or inside the control that opens the Popover.
		 * @returns {boolean} Whether the DOM node is inside the popover or its opening control
		 * @private
		 */
		Popover.prototype._isPopupElement = function (oDOMNode) {
			var oParentDomRef = this._getOpenByDomRef();
			return !!(jQuery(oDOMNode).closest(StaticArea.getDomRef()).length) || !!(jQuery(oDOMNode).closest(oParentDomRef).length);
		};

		/**
		 * If customHeader is set, this will return the customHeaer. Otherwise it creates a header and put the
		 * title and buttons if needed inside, and finally return this newly create header.
		 * @returns {sap.ui.core.Control|sap.m.Bar} The created header
		 * @protected
		 */
		Popover.prototype._getAnyHeader = function () {
			if (this.getCustomHeader()) {
				return this.getCustomHeader();
			} else if (this.getShowHeader()) {
				this._createInternalHeader();
				return this._internalHeader;
			}
		};

		Popover.prototype._createInternalHeader = function () {
			if (!this._internalHeader) {
				var that = this;
				this._internalHeader = new Bar(this.getId() + "-intHeader", {
					titleAlignment: this.getTitleAlignment()
				});
				this.setAggregation("_internalHeader", this._internalHeader);
				this._internalHeader.addEventDelegate({
					onAfterRendering: function () {
						that._restoreFocus();
					}
				});
				return true;
			} else {
				return false;
			}
		};

		Popover.prototype._animation = function (fnAnimationCb, $Ref) {
			var vTimeout = null;
			var fnTransitionEnd = function () {
				$Ref.off("webkitTransitionEnd transitionend");
				clearTimeout(vTimeout);

				setTimeout(function () {
					fnAnimationCb();
				});
			};

			$Ref.on("webkitTransitionEnd transitionend", fnTransitionEnd);

			vTimeout = setTimeout(fnTransitionEnd, this._getAnimationDuration());
		};


		/**
		 * Returns the duration for the Popover's closing animation.
		 *
		 * @private
		 * @ui5-restricted sap.ui.dt.plugin.MiniMenu
		 */
		Popover.prototype._getAnimationDuration = function () {
			return 300;
		};

		Popover.prototype._openAnimation = function ($Ref, iRealDuration, fnOpened) {
			var that = this;

			setTimeout(function () {
				$Ref.css("display", "block");
				that._includeScrollWidth();
				that._animation(function () {
					if (!that.oPopup || that.oPopup.getOpenState() !== OpenState.OPENING) {
						return;
					}
					fnOpened();
				}, $Ref);
			}, Device.browser.firefox ? 50 : 0);
		};

		Popover.prototype._closeAnimation = function ($Ref, iRealDuration, fnClosed) {
			$Ref.addClass("sapMPopoverTransparent");
			this._animation(function () {
				fnClosed();
				$Ref.removeClass("sapMPopoverTransparent");
			}, $Ref);
		};

		Popover.prototype._getInitialFocusId = function () {
			return this.getInitialFocus()
				|| this._getFirstVisibleButtonId()
				|| this._getFirstFocusableContentElementId()
				|| this.getId();
		};

		Popover.prototype._getFirstVisibleButtonId = function () {
			var oBeginButton = this.getBeginButton(),
				oEndButton = this.getEndButton(),
				sButtonId = "";

			if (oBeginButton && oBeginButton.getVisible() && oBeginButton.getEnabled()) {
				sButtonId = oBeginButton.getId();
			} else if (oEndButton && oEndButton.getVisible() && oEndButton.getEnabled()) {
				sButtonId = oEndButton.getId();
			}

			return sButtonId;
		};

		Popover.prototype._getFirstFocusableContentElementId = function () {
			var sResult = "";
			var $popoverContent = this.$("cont");
			var oFirstFocusableDomRef = $popoverContent.firstFocusableDomRef();

			if (oFirstFocusableDomRef) {
				sResult = oFirstFocusableDomRef.id;
			}
			return sResult;
		};

		Popover.prototype._restoreFocus = function () {
			if (this.isOpen()) {
				//restore the focus after rendering when popover is already open
				var sFocusId = this._getInitialFocusId(),
				oControl = Element.getElementById(sFocusId),
				oDomById = (sFocusId ? window.document.getElementById(sFocusId) : null);
				if (oControl && oControl.getFocusDomRef()){
					oControl.getFocusDomRef().focus();
				} else if (!oControl && oDomById){
					oDomById.focus();
				}
			}
		};

		Popover.prototype._registerContentResizeHandler = function(oScrollDomRef) {
			if (!this._sResizeListenerId) {
				this._sResizeListenerId = ResizeHandler.register(oScrollDomRef || this.getDomRef("scroll"), this._fnOrientationChange);
			}
		};

		Popover.prototype._deregisterContentResizeHandler = function () {
			if (this._sResizeListenerId) {
				ResizeHandler.deregister(this._sResizeListenerId);
				this._sResizeListenerId = null;
			}
		};

		Popover.prototype._storeScrollPosition = function () {
			var $content = this.$("cont");
			if ($content.length > 0) {
				this._oScrollPosDesktop = {x: $content.scrollLeft(), y: $content.scrollTop()};
			}
		};

		Popover.prototype._restoreScrollPosition = function () {
			if (!this._oScrollPosDesktop) {
				return;
			}

			var $content = this.$("cont");

			if ($content.length > 0) {
				$content.scrollLeft(this._oScrollPosDesktop.x).
					scrollTop(this._oScrollPosDesktop.y);

				this._oScrollPosDesktop = null;
			}
		};

		Popover.prototype._repositionOffset = function () {
			var ePopupState = this.oPopup.getOpenState(),
				oLastPosition, iPlacePos;

			//if popup isn't open, just return
			if (!(ePopupState === OpenState.OPEN)) {
				return this;
			}

			//popup is open
			oLastPosition = this.oPopup._oLastPosition;
			iPlacePos = this._placements.indexOf(this.getPlacement());

			if (iPlacePos === -1) {
				return this;
			}

			if (iPlacePos < 4) {
				oLastPosition.offset = this._calcOffset(this._offsets[iPlacePos]);
				this.oPopup._applyPosition(oLastPosition);
			} else {
				this._calcPlacement();
			}

			return this;
		};

		Popover.prototype._getOpenByDomRef = function () {
			if (!this._oOpenBy) {
				return null;
			}

			// attach popup to:
			// - the given DOM element or
			// - the specified anchor DOM reference provided by function getPopupAnchorDomRef
			// - focusDomRef when getPopupAnchorDomRef isn't implemented
			if (this._oOpenBy instanceof Element) {
				return (this._oOpenBy.getPopupAnchorDomRef && this._oOpenBy.getPopupAnchorDomRef()) || this._oOpenBy.getFocusDomRef();
			} else {
				return this._oOpenBy;
			}
		};

		/**
		 * Provides the accessibility options of the control.
		 *
		 * @private
		 */
		Popover.prototype._getAccessibilityOptions = function() {
			var aAriaLabels,
				mAccOptions = {},
				oHeader = this._getAnyHeader(),
				oCustomHeader = this.getCustomHeader();

			mAccOptions.role = "dialog";
			mAccOptions.modal = this.getProperty("ariaModal");

			if (!this.getShowHeader() || !oHeader || !oHeader.getVisible()) {
				return mAccOptions;
			}

			var oHeaderId = oCustomHeader ? oCustomHeader.getId() : this.getHeaderTitle().getId();

			// If we have a header/title, we add a reference to it in the beginning of the aria-labelledby attribute
			aAriaLabels = Array.prototype.concat(oHeaderId, this.getAssociation("ariaLabelledBy", []));
			mAccOptions.labelledby = aAriaLabels.join(' ');

			return mAccOptions;
		};

		/**
		 * The setter of the header title property.
		 * @private
		 */
		Popover.prototype._setHeaderTitle = function () {
			if (!this._headerTitle) {
				this._headerTitle = new Title(this.getId() + "-title", {
					text: this.getTitle(),
					level: "H1"
				});

				this._createInternalHeader();
				this._internalHeader.addContentMiddle(this._headerTitle);

				return;
			}

			if (this._headerTitle.getText() !== this.getTitle()) {
				this._headerTitle.setText(this.getTitle());
			}
		};

		/**
		 * The getter of the header title property.
		 *
		 * @returns {sap.m.Title} The title of the popover.
		 * @private
		 */
		Popover.prototype.getHeaderTitle = function () {
			return this._headerTitle;
		};

		/**
		 * Getter for property <code>bounce</code>.
		 *
		 * Default value is empty
		 *
		 * @returns {boolean} the value of property <code>bounce</code>
		 * @private
		 * @name sap.m.Popover#getBounce
		 * @function
		 */

		/* =========================================================== */
		/*                      end: internal methods                  */
		/* =========================================================== */


		/* ==================================================== */
		/*                      begin: Setters                  */
		/* ==================================================== */
		/**
		 * Set the placement of the Popover.
		 *
		 * @param {sap.m.PlacementType} sPlacement The position of the Popover
		 * @returns {this} Reference to the control instance for chaining
		 * @public
		 */
		Popover.prototype.setPlacement = function (sPlacement) {
			this.setProperty("placement", sPlacement, true);
			this._bVerticalFlip = false;
			this._bHorizontalFlip = false;
			var iPlacePos = this._placements.indexOf(sPlacement);
			if (iPlacePos <= 3) {
				// this variable is internal used for the placement of the popover
				this._oCalcedPos = sPlacement;
			}
			return this;
		};

		Popover.prototype.setBeginButton = function (oButton) {
			var oOldBeginButton = this.getBeginButton();

			if (oOldBeginButton === oButton) {
				return this;
			}

			this._createInternalHeader();

			//this is used in the getAggregation method
			this._beginButton = oButton;

			if (oButton) {
				if (oOldBeginButton) {
					this._internalHeader.removeAggregation("contentLeft", oOldBeginButton, true);
				}
				this._internalHeader.addAggregation("contentLeft", oButton);
			} else {
				this._internalHeader.removeContentLeft(oOldBeginButton);
			}

			return this;
		};

		Popover.prototype.setEndButton = function (oButton) {
			var oOldEndButton = this.getEndButton();

			if (oOldEndButton === oButton) {
				return this;
			}

			this._createInternalHeader();

			// this is used in the getAggregation method
			this._endButton = oButton;

			this._internalHeader.removeContentRight(oOldEndButton);

			if (oButton) {
				this._internalHeader.addContentRight(oButton);
			}

			return this;
		};

		/**
		 * Setter for property <code>modal</code>.
		 * This overwrites the default setter of the property <code>modal</code> to avoid rerendering the whole popover control.
		 *
		 * Default value is <code>false</code>
		 *
		 * @param {boolean} bModal New value for property <code>modal</code>.
		 * @param {string} [sModalCSSClass] A CSS class (or space-separated list of classes) that should be added to the block layer.
		 * @return {this} Reference to the control instance for chaining
		 * @public
		 */
		Popover.prototype.setModal = function (bModal, sModalCSSClass) {
			if (bModal === this.getModal()) {
				return this;
			}

			this.oPopup.setModal(bModal, ("sapMPopoverBLayer " + (sModalCSSClass || "")).trim());

			// suppress re-rendering
			this.setProperty("modal", bModal, true);

			return this;
		};

		Popover.prototype._setAriaModal = function (bValue) {
			return this.setProperty("ariaModal", bValue);
		};

		/**
		 * Returns the sap.ui.core.delegate.ScrollEnablement delegate which is used with this control.
		 * @returns {sap.ui.core.delegate.ScrollEnablement} The scroll delegate
		 * @private
		 */
		Popover.prototype.getScrollDelegate = function () {
			return this._oScroller;
		};

		/**
		 * Setter for property <code>ariaRoleApplication</code>.
		 * Default value is <code>false</code>
		 *
		 * @param {boolean} bValue New value for property <code>ariaRoleApplication</code>.
		 * @return {this} Reference to the control instance for chaining
		 * @private
		 */
		Popover.prototype._setAriaRoleApplication = function (bValue) {
			return this.setProperty("ariaRoleApplication", bValue);
		};

		/* ==================================================== */
		/*                      end: Setters                  */
		/* ==================================================== */


		// beginButton and endButton are managed inside the internal header therefore the following three functions need to be overwritten.
		// beginButton and endButton are singular aggregation, overwritting those three functions are enough.
		Popover.prototype.setAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
			if (sAggregationName === "beginButton" || sAggregationName === "endButton") {
				var sFunctionName = "set" + sAggregationName.charAt(0).toUpperCase() + sAggregationName.slice(1);
				return this[sFunctionName](oObject);
			} else {
				return Control.prototype.setAggregation.apply(this, arguments);
			}
		};

		Popover.prototype.getAggregation = function (sAggregationName, oDefaultForCreation) {
			if (sAggregationName === "beginButton" || sAggregationName === "endButton") {
				var sButton = this["_" + sAggregationName];
				return sButton || oDefaultForCreation || null;
			} else {
				return Control.prototype.getAggregation.apply(this, arguments);
			}
		};

		Popover.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
			var oActiveControl = Element.closestTo(document.activeElement);
			if (sAggregationName === "beginButton" || sAggregationName === "endButton") {
				var sButton = this["_" + sAggregationName];
				if (sButton) {
					sButton.destroy();
					this["_" + sAggregationName] = null;
				}
			} else {
				Control.prototype.destroyAggregation.apply(this, arguments);
			}
			oActiveControl && oActiveControl.getDomRef() ? oActiveControl.focus() : this.focus();
			return this;
		};

		Popover.prototype.invalidate = function (oOrigin) {
			if (this.oPopup && this.isOpen() && this.oPopup.getOpenState() !== OpenState.CLOSING) {
				Control.prototype.invalidate.apply(this, arguments);
			}
			return this;
		};

		Popover.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
			if (sAggregationName === "content") {
				this._bContentChanged = true;
			}
			Control.prototype.addAggregation.apply(this, arguments);
		};

		/**
		 * A hook for controls that extend popover to determine how the controls array is formed
		 * @returns {sap.ui.core.Control[]} Control instance for method chaining
		 * @private
		 */
		Popover.prototype._getAllContent = function () {
			return this.getContent();
		};

		/**
		 * Popup controls should not propagate contextual width
		 * @private
		 */
		Popover.prototype._applyContextualSettings = function () {
			Control.prototype._applyContextualSettings.call(this);
		};

		return Popover;
	});