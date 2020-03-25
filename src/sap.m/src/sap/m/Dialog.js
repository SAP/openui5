/*!
 * ${copyright}
 */

// Provides control sap.m.Dialog.
sap.ui.define([
	"./Bar",
	"./InstanceManager",
	"./AssociativeOverflowToolbar",
	"./ToolbarSpacer",
	"./Title",
	"./library",
	"./TitleAlignmentMixin",
	"sap/m/Image",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/core/Popup",
	"sap/ui/core/delegate/ScrollEnablement",
	"sap/ui/core/RenderManager",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/util/ResponsivePaddingsEnablement",
	"sap/ui/Device",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"./TitlePropagationSupport",
	"./DialogRenderer",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/core/Configuration",
	// jQuery Plugin "control"
	"sap/ui/dom/jquery/control",
	// jQuery Plugin "firstFocusableDomRef", "lastFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
],
function(
	Bar,
	InstanceManager,
	AssociativeOverflowToolbar,
	ToolbarSpacer,
	Title,
	library,
	TitleAlignmentMixin,
	Image,
	Control,
	IconPool,
	Popup,
	ScrollEnablement,
	RenderManager,
	InvisibleText,
	ResizeHandler,
	ResponsivePaddingsEnablement,
	Device,
	ManagedObject,
	coreLibrary,
	KeyCodes,
	TitlePropagationSupport,
	DialogRenderer,
	Log,
	jQuery,
	Core,
	Configuration
) {
		"use strict";

		// shortcut for sap.ui.core.OpenState
		var OpenState = coreLibrary.OpenState;

		// shortcut for sap.m.DialogType
		var DialogType = library.DialogType;

		// shortcut for sap.m.DialogType
		var DialogRoleType = library.DialogRoleType;

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState;

		// shortcut for sap.m.TitleAlignment
		var TitleAlignment = library.TitleAlignment;

		var sAnimationMode = Core.getConfiguration().getAnimationMode();
		var bUseAnimations = sAnimationMode !== Configuration.AnimationMode.none && sAnimationMode !== Configuration.AnimationMode.minimal;

		// the time should be longer the longest transition in the CSS (200ms),
		// because of focusing and transition relate issues especially in IE,
		// where 200ms transition sometimes seems to last a little longer
		var iAnimationDuration = bUseAnimations ? 300 : 10;

		// HTML container scrollbar width
		var iScrollbarWidth = 17;

		/**
		* Constructor for a new Dialog.
		*
		* @param {string} [sId] ID for the new control, generated automatically if no ID is given
		* @param {object} [mSettings] Initial settings for the new control
		*
		* @class
		* A popup that interrupts the current processing and prompts the user for an action or an input in a modal mode.
		* <h3>Overview</h3>
		* The Dialog control is used to prompt the user for an action or a confirmation. It interrupts the current app processing as it is the only focused UI element and the main screen is dimmed/blocked.
		* The content of the Dialog is fully customizable.
		* <h3>Structure</h3>
		* A Dialog consists of a title, optional subtitle, content area and a footer for action buttons.
		* The Dialog is usually displayed at the center of the screen. Its size and position can be changed by the user.
		* To enable this, you need to set the properties <code>resizable</code> and <code>draggable</code> accordingly.
		*
		* There are other specialized types of dialogs:
		* <ul>
		* <li>{@link sap.m.P13nDialog Personalization Dialog} - used for personalizing sorting, filtering and grouping in tables</li>
		* <li>{@link sap.m.SelectDialog Select Dialog} - used to select one or more items from a comprehensive list</li>
		* <li>{@link sap.m.TableSelectDialog Table Select Dialog} - used to  make a selection from a comprehensive table containing multiple attributes or values</li>
		* <li>{@link sap.ui.comp.valuehelpdialog.ValueHelpDialog Value Help Dialog} - used to help the user find and select single and multiple values</li>
		* <li>{@link sap.m.ViewSettingsDialog View Settings Dialog}  - used to sort, filter, or group data within a (master) list or a table</li>
		* <li>{@link sap.m.BusyDialog Busy Dialog} - used to block the screen and inform the user about an ongoing operation</li>
		* </ul>
		* <h3>Usage</h3>
		* <h4>When to use:</h4>
		* <ul>
		* <li>You want to display a system message.</li>
		* <li>You want to interrupt the user’s action.</li>
		* <li>You want to show a message with a short and a long description.</li>
		* </ul>
		* <h4>When not to use:</h4>
		* <ul>
		* <li>You just want to confirm a successful action.</li>
		* </ul>
		* <h3>Responsive Behavior</h3>
		* <ul>
		* <li>If the <code>stretch</code> property is set to <code>true</code>, the Dialog displays on full screen.</li>
		* <li>If the <code>contentWidth</code> and/or <code>contentHeight</code> properties are set, the Dialog will try to fill those sizes.</li>
		* <li>If there is no specific sizing, the Dialog will try to adjust its size to its content.</li>
		* </ul>
		* When using the <code>sap.m.Dialog</code> in SAP Quartz themes, the breakpoints and layout paddings could be determined by the Dialog's width. To enable this concept and add responsive paddings to an element of the Dialog control, you have to add the following classes depending on your use case: <code>sapUiResponsivePadding--header</code>, <code>sapUiResponsivePadding--subHeader</code>, <code>sapUiResponsivePadding--content</code>, <code>sapUiResponsivePadding--footer</code>.
		* <h4>Smartphones</h4>
		* If the Dialog has one or two actions, they will cover the entire footer. If there are more actions, they will overflow.
		* <h4>Tablets</h4>
		* The action buttons in the toolbar are <b>right-aligned</b>. Use <b>cozy</b> mode on tablet devices.
		* <h4>Desktop</h4>
		* The action buttons in the toolbar are <b>right-aligned</b>. Use <b>compact</b> mode on desktop.
		* @extends sap.ui.core.Control
		*
		* @implements sap.ui.core.PopupInterface
		* @author SAP SE
		* @version ${version}
		*
		* @constructor
		* @public
		* @alias sap.m.Dialog
		* @see {@link fiori:https://experience.sap.com/fiori-design-web/dialog/ Dialog}
		* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		*/
		var Dialog = Control.extend("sap.m.Dialog", /** @lends sap.m.Dialog.prototype */ {
			metadata: {
				interfaces: [
					"sap.ui.core.PopupInterface"
				],
				library: "sap.m",
				properties: {

					/**
					 * Icon displayed in the Dialog header. This <code>icon</code> is invisible on the iOS platform and it is density-aware. You can use the density convention (@2, @1.5, etc.) to provide higher resolution image for higher density screen.
					 */
					icon: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: null},

					/**
					 * Title text appears in the Dialog header.
					 */
					title: {type: "string", group: "Appearance", defaultValue: null},

					/**
					 * Determines whether the header is shown inside the Dialog. If this property is set to <code>true</code>, the <code>text</code> and <code>icon</code> properties are ignored. This property has a default value <code>true</code>.
					 * @since 1.15.1
					 */
					showHeader: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * The <code>type</code> of the Dialog. In some themes, the type Message will limit the Dialog width within 480px on tablet and desktop.
					 */
					type: {type: "sap.m.DialogType", group: "Appearance", defaultValue: DialogType.Standard},

					/**
					 * Affects the <code>icon</code> and the <code>title</code> color.
					 *
					 * If a value other than <code>None</code> is set, a predefined icon will be added to the Dialog.
					 * Setting the <code>icon</code> property will overwrite the predefined icon.
					 * @since 1.11.2
					 */
					state: {type: "sap.ui.core.ValueState", group: "Appearance", defaultValue: ValueState.None},

					/**
					 * Determines whether the Dialog will be displayed on full screen on a phone.
					 * @since 1.11.2
					 * @deprecated Since version 1.13.1.
					 * Please use the new stretch property instead. This enables a stretched Dialog even on tablet and desktop. If you want to achieve the same effect as <code>stretchOnPhone</code>, please set the stretch with jQuery.device.is.phone, then the Dialog is only stretched when it runs on a phone.
					 */
					stretchOnPhone: {type: "boolean", group: "Appearance", defaultValue: false, deprecated: true},

					/**
					 * Determines if the Dialog will be stretched to full screen on mobile. On desktop, the Dialog will be stretched to 93% of the viewport. This property is only applicable to a Standard Dialog. Message-type Dialog ignores it.
					 * @since 1.13.1
					 */
					stretch: {type: "boolean", group: "Appearance", defaultValue: false},

					/**
					 * Preferred width of the content in the Dialog. This property affects the width of the Dialog on a phone in landscape mode, a tablet or a desktop, because the Dialog has a fixed width on a phone in portrait mode. If the preferred width is less than the minimum width of the Dialog or more than the available width of the screen, it will be overwritten by the min or max value. The current mininum value of the Dialog width on tablet is 400px.
					 * @since 1.12.1
					 */
					contentWidth: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null},

					/**
					 * Preferred height of the content in the Dialog. If the preferred height is bigger than the available space on a screen, it will be overwritten by the maximum available height on a screen in order to make sure that the Dialog isn't cut off.
					 * @since 1.12.1
					 */
					contentHeight: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null},

					/**
					 * Indicates if the user can scroll horizontally inside the Dialog when the content is bigger than the content area.
					 * The Dialog detects if there's <code>sap.m.NavContainer</code>, <code>sap.m.Page</code>, <code>sap.m.ScrollContainer</code> or <code>sap.m.SplitContainer</code> as a direct child added to the Dialog. If there is, the Dialog will turn off <code>scrolling</code> by setting this property to <code>false</code>, automatically ignoring the existing value of the property.
					 * @since 1.15.1
					 */
					horizontalScrolling: {type: "boolean", group: "Behavior", defaultValue: true},

					/**
					 * Indicates if the user can scroll vertically inside the Dialog when the content is bigger than the content area.
					 * The Dialog detects if there's <code>sap.m.NavContainer</code>, <code>sap.m.Page</code>, <code>sap.m.ScrollContainer</code> or <code>sap.m.SplitContainer</code> as a direct child added to the Dialog. If there is, the Dialog will turn off <code>scrolling</code> by setting this property to <code>false</code>, automatically ignoring the existing value of this property.
					 * @since 1.15.1
					 */
					verticalScrolling: {type: "boolean", group: "Behavior", defaultValue: true},

					/**
					 * Indicates whether the Dialog is resizable. If this property is set to <code>true</code>, the Dialog will have a resize handler in its bottom right corner. This property has a default value <code>false</code>. The Dialog can be resizable only in desktop mode.
					 * @since 1.30
					 */
					resizable: {type: "boolean", group: "Behavior", defaultValue: false},

					/**
					 * Indicates whether the Dialog is draggable. If this property is set to <code>true</code>, the Dialog will be draggable by its header. This property has a default value <code>false</code>. The Dialog can be draggable only in desktop mode.
					 * @since 1.30
					 */
					draggable: {type: "boolean", group: "Behavior", defaultValue: false},

					/**
					 * This property expects a function with one parameter of type Promise. In the function, you should call either <code>resolve()</code> or <code>reject()</code> on the Promise object.<br/>
					 * The function allows you to define custom behavior which will be executed when the Escape key is pressed. By default, when the Escape key is pressed, the Dialog is immediately closed.
					 * @since 1.44
					 */
					escapeHandler : {type: "any", group: "Behavior", defaultValue: null},

					/**
					 * Specifies the ARIA role of the Dialog. If the state of the control is "Error" or "Warning" the role will be "AlertDialog" regardless of what is set.
					 * @since 1.65
					 * @private
					 */
					role: {type: "sap.m.DialogRoleType", group: "Data", defaultValue: DialogRoleType.Dialog, visibility: "hidden"},

					/**
					 * Indicates whether the Dialog will be closed automatically when a routing navigation occurs.
					 * @since 1.72
					 */
					closeOnNavigation: {type: "boolean", group: "Behavior", defaultValue: true},

					/**
					 * Specifies the Title alignment (theme specific).
					 * If set to <code>TitleAlignment.Auto</code>, the Title will be aligned as it is set in the theme (if not set, the default value is <code>center</code>);
					 * Other possible values are <code>TitleAlignment.Start</code> (left or right depending on LTR/RTL), and <code>TitleAlignment.Center</code> (centered)
					 * @since 1.72
					 * @public
					 */
					titleAlignment : {type : "sap.m.TitleAlignment", group : "Misc", defaultValue : TitleAlignment.Auto}
				},
				defaultAggregation: "content",
				aggregations: {

					/**
					 * The content inside the Dialog.<br/><b>Note:</b> When the content of the Dialog is comprised of controls that use <code>position: absolute</code>, such as <code>SplitContainer</code>, the Dialog has to have either <code>stretch: true</code> or <code>contentHeight</code> set.
					 */
					content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},

					/**
					 * When a <code>subHeader</code> is assigned to the Dialog, it's rendered directly after the main header in the Dialog. The <code>subHeader</code> is out of the content area and won't be scrolled when the content size is bigger than the content area size.
					 * @since 1.12.2
					 */
					subHeader: {type: "sap.m.IBar", multiple: false},

					/**
					 * When it is set, the <code>icon</code>, <code>title</code> and <code>showHeader</code> properties are ignored. Only the <code>customHeader</code> is shown as the header of the Dialog.
					 * @since 1.15.1
					 */
					customHeader: {type: "sap.m.IBar", multiple: false},

					/**
					 * The button which is rendered to the left side (right side in RTL mode) of the <code>endButton</code> in the footer area inside the Dialog. As of version 1.21.1, there's a new aggregation <code>buttons</code> created with which more than 2 buttons can be added to the footer area of the Dialog. If the new <code>buttons</code> aggregation is set, any change made to this aggregation has no effect anymore. When running on a phone, this <code>button</code> (and the <code>endButton</code> together when set) is (are) rendered at the center of the footer area. When running on other platforms, this <code>button</code> (and the <code>endButton</code> together when set) is (are) rendered at the right side (left side in RTL mode) of the footer area.
					 * @since 1.15.1
					 */
					beginButton: {type: "sap.m.Button", multiple: false},

					/**
					 * The button which is rendered to the right side (left side in RTL mode) of the <code>beginButton</code> in the footer area inside the Dialog. As of version 1.21.1, there's a new aggregation <code>buttons</code> created with which more than 2 buttons can be added to the footer area of Dialog. If the new <code>buttons</code> aggregation is set, any change made to this aggregation has no effect anymore. When running on a phone, this <code>button</code> (and the <code>beginButton</code> together when set) is (are) rendered at the center of the footer area. When running on other platforms, this <code>button</code> (and the <code>beginButton</code> together when set) is (are) rendered at the right side (left side in RTL mode) of the footer area.
					 * @since 1.15.1
					 */
					endButton: {type: "sap.m.Button", multiple: false},

					/**
					 * Buttons can be added to the footer area of the Dialog through this aggregation. When this aggregation is set, any change to the <code>beginButton</code> and <code>endButton</code> has no effect anymore. Buttons which are inside this aggregation are aligned at the right side (left side in RTL mode) of the footer instead of in the middle of the footer.
					 * @since 1.21.1
					 */
					buttons: {type: "sap.m.Button", multiple: true, singularName: "button"},

					/**
					 * The hidden aggregation for internal maintained <code>header</code>.
					 */
					_header: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

					/**
					 * The hidden aggregation for internal maintained <code>icon</code> control.
					 */
					_icon: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

					/**
					 * The hidden aggregation for internal maintained <code>toolbar</code> instance.
					 */
					_toolbar: {type: "sap.m.OverflowToolbar", multiple: false, visibility: "hidden"},

					/**
					 * The hidden aggregation for the Dialog state.
					 */
					_valueState: {type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden"}
				},
				associations: {

					/**
					 * <code>LeftButton</code> is shown at the left edge of the bar in iOS, and at the right side of the bar for the other platforms. Please set this to <code>null</code> if you want to remove the Left button from the bar. And the button is only removed from the bar, not destroyed. When <code>showHeader</code> is set to <code>false</code>, this property will be ignored. Setting <code>leftButton</code> will also set the <code>beginButton</code> internally.
					 * @deprecated Since version 1.15.1.
					 *
					 * <code>LeftButton</code> has been deprecated since 1.15.1. Please use the <code>beginButton</code> instead which is more RTL friendly.
					 */
					leftButton: {type: "sap.m.Button", multiple: false, deprecated: true},

					/**
					 * <code>RightButton</code> is always shown at the right edge of the bar. Please set this to null if you want to remove the Right button from the bar. And the button is only removed from the bar, not destroyed. When <code>showHeader</code> is set to false, this property will be ignored. Setting <code>rightButton</code> will also set the <code>endButton</code> internally.
					 * @deprecated Since version 1.15.1.
					 *
					 * <code>RightButton</code> has been deprecated since 1.15.1. Please use the <code>endButton</code> instead which is more RTL friendly.
					 */
					rightButton: {type: "sap.m.Button", multiple: false, deprecated: true},

					/**
					 * In the Dialog focus is set first on the <code>leftButton</code> and then on <code>rightButton</code>, when available. If another control needs to get the focus, set the <code>initialFocus</code> with the control which should be focused on. Setting <code>initialFocus</code> to input controls doesn't open the On-Screen keyboard on mobile device as, due to browser limitation, the On-Screen keyboard can't be opened with JavaScript code. The opening of On-Screen keyboard must be triggered by real user action.
					 * @since 1.15.0
					 */
					initialFocus: {type: "sap.ui.core.Control", multiple: false},

					/**
					 * Association to controls/IDs which describe this control (see WAI-ARIA attribute aria-describedby).
					 */
					ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

					/**
					 * Association to controls/IDs which label this control (see WAI-ARIA attribute aria-labelledby).
					 */
					ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
				},
				events: {

					/**
					 * This event will be fired before the Dialog is opened.
					 */
					beforeOpen: {},

					/**
					 * This event will be fired after the Dialog is opened.
					 */
					afterOpen: {},

					/**
					 * This event will be fired before the Dialog is closed.
					 */
					beforeClose: {
						parameters: {

							/**
							 * This indicates the trigger of closing the Dialog. If the Dialog is closed by either the <code>leftButton</code> or the <code>rightButton</code>, the button that closes the Dialog is set to this parameter. Otherwise, the parameter is set to <code>null</code>.
							 * @since 1.9.2
							 */
							origin: {type: "sap.m.Button"}
						}
					},

					/**
					 * This event will be fired after the Dialog is closed.
					 */
					afterClose: {
						parameters: {

							/**
							 * This indicates the trigger of closing the Dialog. If the Dialog is closed by either the <code>leftButton</code> or the <code>rightButton</code>, the button that closes the Dialog is set to this parameter. Otherwise, the parameter is set to <code>null</code>.
							 * @since 1.9.2
							 */
							origin: {type: "sap.m.Button"}
						}
					}
				},
				designtime: "sap/m/designtime/Dialog.designtime"
			}
		});

		ResponsivePaddingsEnablement.call(Dialog.prototype, {
			header: {suffix: "header"},
			subHeader: {selector: ".sapMDialogSubHeader .sapMIBar"},
			content: {selector: ".sapMDialogScrollCont"},
			footer: {suffix: "footer"}
		});

		// Add title propagation support
		TitlePropagationSupport.call(Dialog.prototype, "content", function () {
			return this._headerTitle ? this._headerTitle.getId() : false;
		});

		Dialog._bPaddingByDefault = (sap.ui.getCore().getConfiguration().getCompatibilityVersion("sapMDialogWithPadding").compareTo("1.16") < 0);

		Dialog._mIcons = {};
		Dialog._mIcons[ValueState.Success] = IconPool.getIconURI("message-success");
		Dialog._mIcons[ValueState.Warning] = IconPool.getIconURI("message-warning");
		Dialog._mIcons[ValueState.Error] = IconPool.getIconURI("message-error");
		Dialog._mIcons[ValueState.Information] = IconPool.getIconURI("hint");

		/* =========================================================== */
		/*                  begin: Lifecycle functions                 */
		/* =========================================================== */
		Dialog.prototype.init = function () {
			var that = this;
			this._oManuallySetSize = null;
			this._oManuallySetPosition = null;
			this._bRTL = sap.ui.getCore().getConfiguration().getRTL();

			// used to judge if enableScrolling needs to be disabled
			this._scrollContentList = ["sap.m.NavContainer", "sap.m.Page", "sap.m.ScrollContainer", "sap.m.SplitContainer", "sap.m.MultiInput", "sap.m.SimpleFixFlex"];

			this.oPopup = new Popup();
			this.oPopup.setShadow(true);
			this.oPopup.setNavigationMode("SCOPE");
			this.oPopup.setModal(true);
			this.oPopup.setAnimations(jQuery.proxy(this._openAnimation, this), jQuery.proxy(this._closeAnimation, this));

			/**
			 *
			 * @param {Object} oPosition A new position to move the Dialog to.
			 * @param {boolean} bFromResize The function called from the <code>resize</code> event.
			 * @private
			 */
			this.oPopup._applyPosition = function (oPosition, bFromResize) {

				that._setDimensions();
				that._adjustScrollingPane();

				if (that._oManuallySetPosition) {
					oPosition.at = {
						left: that._oManuallySetPosition.x,
						top: that._oManuallySetPosition.y
					};
				} else {
					oPosition.at = that._calcCenter();
				}

				//deregister the content resize handler before repositioning
				that._deregisterContentResizeHandler();
				Popup.prototype._applyPosition.call(this, oPosition);

				//register the content resize handler
				that._registerContentResizeHandler();
			};

			if (Dialog._bPaddingByDefault) {
				this.addStyleClass("sapUiPopupWithPadding");
			}

			this._initTitlePropagationSupport();

			this._initResponsivePaddingsEnablement();
		};

		Dialog.prototype.onBeforeRendering = function () {
			//if content has scrolling, disable scrolling automatically
			if (this._hasSingleScrollableContent()) {
				this.setVerticalScrolling(false);
				this.setHorizontalScrolling(false);

				Log.info("VerticalScrolling and horizontalScrolling in sap.m.Dialog with ID " + this.getId() + " has been disabled because there's scrollable content inside");

			} else if (!this._oScroller) {
				this._oScroller = new ScrollEnablement(this, this.getId() + "-scroll", {
					horizontal: this.getHorizontalScrolling(), // will be disabled in adjustScrollingPane if content can fit in
					vertical: this.getVerticalScrolling()
				});
			}

			if (this._oScroller) {
				this._oScroller.setVertical(this.getVerticalScrolling());
				this._oScroller.setHorizontal(this.getHorizontalScrolling());
			}

			this._createToolbarButtons();

			if (sap.ui.getCore().getConfiguration().getAccessibility() && this.getState() != ValueState.None) {
				var oValueState = new InvisibleText({text: this.getValueStateString(this.getState())});

				this.setAggregation("_valueState", oValueState);
				this.addAriaLabelledBy(oValueState.getId());
			}
		};

		Dialog.prototype.onAfterRendering = function () {
			this._$scrollPane = this.$("scroll");
			//this is not used in the control itself but is used in test and may me used from client's implementations
			this._$content = this.$("cont");
			this._$dialog = this.$();

			if (this.isOpen()) {
				//restore the focus after rendering when dialog is already open
				this._setInitialFocus();
			}
		};

		Dialog.prototype.exit = function () {
			InstanceManager.removeDialogInstance(this);
			this._deregisterContentResizeHandler();
			this._deregisterResizeHandler();

			if (this.oPopup) {
				this.oPopup.detachOpened(this._handleOpened, this);
				this.oPopup.detachClosed(this._handleClosed, this);
				this.oPopup.destroy();
				this.oPopup = null;
			}
			if (this._oScroller) {
				this._oScroller.destroy();
				this._oScroller = null;
			}

			if (this._header) {
				this._header.destroy();
				this._header = null;
			}

			if (this._headerTitle) {
				this._headerTitle.destroy();
				this._headerTitle = null;
			}

			if (this._iconImage) {
				this._iconImage.destroy();
				this._iconImage = null;
			}

			if (this._toolbarSpacer) {
				this._toolbarSpacer.destroy();
				this._toolbarSpacer = null;
			}
		};
		/* =========================================================== */
		/*                   end: Lifecycle functions                  */
		/* =========================================================== */

		/* =========================================================== */
		/*                    begin: public functions                  */
		/* =========================================================== */
		/**
		 * Open the dialog.
		 *
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		Dialog.prototype.open = function () {

			var oPopup = this.oPopup;
			// Set the initial focus to the dialog itself.
			// The initial focus should be set because otherwise the first focusable element will be focused.
			// This first element can be input or textarea which will trigger the keyboard to open (mobile device).
			// The focus will be change after the dialog is opened;
			oPopup.setInitialFocusId(this.getId());

			var oPopupOpenState = oPopup.getOpenState();

			switch (oPopupOpenState) {
				case OpenState.OPEN:
				case OpenState.OPENING:
					return this;
				case OpenState.CLOSING:
					this._bOpenAfterClose = true;
					break;
				default:
			}

			//reset the close trigger
			this._oCloseTrigger = null;

			this.fireBeforeOpen();
			oPopup.attachOpened(this._handleOpened, this);

			// reset scroll fix check
			this._iLastWidthAndHeightWithScroll = null;

			// Open popup
			oPopup.setContent(this);

			oPopup.open();

			this._registerResizeHandler();

			InstanceManager.addDialogInstance(this);

			return this;
		};


		/**
		 * Close the dialog.
		 *
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		Dialog.prototype.close = function () {
			this._bOpenAfterClose = false;

			this.$().removeClass('sapDialogDisableTransition');

			this._deregisterResizeHandler();

			var oPopup = this.oPopup;

			var eOpenState = this.oPopup.getOpenState();
			if (!(eOpenState === OpenState.CLOSED || eOpenState === OpenState.CLOSING)) {
				library.closeKeyboard();
				this.fireBeforeClose({origin: this._oCloseTrigger});
				oPopup.attachClosed(this._handleClosed, this);
				this._bDisableRepositioning = false;
				//reset the drag and/or resize
				this._oManuallySetPosition = null;
				this._oManuallySetSize = null;
				oPopup.close();
				this._deregisterContentResizeHandler();
			}
			return this;
		};

		/**
		 * The method checks if the Dialog is open. It returns <code>true</code> when the Dialog is currently open (this includes opening and closing animations), otherwise it returns <code>false</code>.
		 *
		 * @returns boolean
		 * @public
		 * @since 1.9.1
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		Dialog.prototype.isOpen = function () {
			return this.oPopup && this.oPopup.isOpen();
		};

		/**
		 * @inheritdoc
		 */
		Dialog.prototype.setIcon = function (sIcon) {
			this._bHasCustomIcon = true;
			return this.setProperty("icon", sIcon);
		};

		/**
		 * @inheritdoc
		 */
		Dialog.prototype.setState = function (sState) {
			var sDefaultIcon;

			this.setProperty("state", sState);

			if (this._bHasCustomIcon) {
				return this;
			}

			if (sState === ValueState.None) {
				sDefaultIcon = "";
			} else {
				sDefaultIcon = Dialog._mIcons[sState];
			}

			this.setProperty("icon", sDefaultIcon);
			return this;
		};

		/* =========================================================== */
		/*                     end: public functions                   */
		/* =========================================================== */

		/* =========================================================== */
		/*                      begin: event handlers                  */
		/* =========================================================== */
		/**
		 *
		 * @private
		 */
		Dialog.prototype._handleOpened = function () {
			this.oPopup.detachOpened(this._handleOpened, this);
			this._setInitialFocus();
			this.fireAfterOpen();
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._handleClosed = function () {
			// TODO: remove the following three lines after the popup open state problem is fixed
			if (!this.oPopup) {
				return;
			}

			this.oPopup.detachClosed(this._handleClosed, this);

			if (this.getDomRef()) {
				// Not removing the content DOM leads to the  problem that control DOM with the same ID exists in two places if
				// the control is added to a different aggregation without the dialog being destroyed. In this special case the
				// RichTextEditor (as an example) renders a textarea-element and afterwards tells the TinyMCE component which ID
				// to use for rendering; since there are two elements with the same ID at that point, it does not work.
				// As the Dialog can only contain other controls, we can safely discard the DOM - we cannot do this inside
				// the Popup, since it supports displaying arbitrary HTML content.
				RenderManager.preserveContent(this.getDomRef());
				this.$().remove();
			}

			InstanceManager.removeDialogInstance(this);
			this.fireAfterClose({origin: this._oCloseTrigger});

			if (this._bOpenAfterClose) {
				this._bOpenAfterClose = false;
				this.open();
			}
		};

		/**
		 * Event handler for the <code>focusin</code> event.
		 * If it occurs on the invisible element at the beginning of the Dialog, the focus is set on the last focusable element of the Dialog, and vice versa.
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		Dialog.prototype.onfocusin = function (oEvent) {
			var oSourceDomRef = oEvent.target;

			//Check if the invisible FIRST focusable element (suffix '-firstfe') has gained focus
			if (oSourceDomRef.id === this.getId() + "-firstfe") {
				//Check if buttons are available
				var oLastFocusableDomRef = this.$("footer").lastFocusableDomRef() || this.$("cont").lastFocusableDomRef() || (this.getSubHeader() && this.getSubHeader().$().firstFocusableDomRef()) || (this._getAnyHeader() && this._getAnyHeader().$().lastFocusableDomRef());
				if (oLastFocusableDomRef) {
					oLastFocusableDomRef.focus();
				}
			} else if (oSourceDomRef.id === this.getId() + "-lastfe") {
				//Check if the invisible LAST focusable element (suffix '-lastfe') has gained focus
				//First check if header content is available
				var oFirstFocusableDomRef = (this._getAnyHeader() && this._getAnyHeader().$().firstFocusableDomRef()) || (this.getSubHeader() && this.getSubHeader().$().firstFocusableDomRef()) || this.$("cont").firstFocusableDomRef() || this.$("footer").firstFocusableDomRef();
				if (oFirstFocusableDomRef) {
					oFirstFocusableDomRef.focus();
				}
			}
		};

		/**
		 * Makes sure the app developer will always have access to the last created Promise.
		 * @returns {{reject: reject, resolve: resolve}}
		 * @private
		 */
		Dialog.prototype._getPromiseWrapper = function () {
			var that = this;

			return {
				reject: function () {
					that.currentPromise.reject();
				},
				resolve: function () {
					that.currentPromise.resolve();
				}
			};
		};


		/**
		 * Event handler for the escape key pressed event.
		 * If it occurs and the developer hasn't defined the <code>escapeHandler</code> property, the Dialog is immediately closed.
		 * Otherwise, the <code>escapeHandler</code> is executed and the developer may prevent the closing of the Dialog.
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		Dialog.prototype.onsapescape = function(oEvent) {
			var oEscapeHandler = this.getEscapeHandler(),
				oPromiseArgument = {},
				that = this;

			if (this._isSpaceOrEnterPressed) {
				return;
			}

			if (oEvent.originalEvent && oEvent.originalEvent._sapui_handledByControl) {
				return;
			}

			this._oCloseTrigger = null;

			if (typeof oEscapeHandler === 'function') {
				// create a Promise to allow app developers to hook to the 'escape' event
				// and prevent the closing of the dialog by executing the escape handler function they defined
				new window.Promise(function (resolve, reject) {
					oPromiseArgument.resolve = resolve;
					oPromiseArgument.reject = reject;

					that.currentPromise = oPromiseArgument;

					oEscapeHandler(that._getPromiseWrapper());
				})
					.then(function (result) {
						that.close();
					})
					.catch(function () {
						Log.info("Disallow dialog closing");
					});
			} else {

				this.close();
			}

			//event should not trigger any further actions
			oEvent.stopPropagation();
		};

		/**
		 * Event handler for the onkeyup event.
		 * Register if SPACE or ENTER is released.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		Dialog.prototype.onkeyup = function (oEvent) {
			if (this._isSpaceOrEnter(oEvent)) {
				this._isSpaceOrEnterPressed = false;
			}
		};

		/**
		 * Event handler for the onkeydown event.
		 * Register if SPACE or ENTER is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		Dialog.prototype.onkeydown = function (oEvent) {
			if (this._isSpaceOrEnter(oEvent)) {
				this._isSpaceOrEnterPressed = true;
			}
		};

		/**
		 * Determines if the key from oEvent is SPACE or ENTER.
		 *
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 * @return {boolean} True if the key from the event is space or enter
		 */
		Dialog.prototype._isSpaceOrEnter = function (oEvent) {
			var iKeyCode = oEvent.which || oEvent.keyCode;

			return iKeyCode == KeyCodes.SPACE || iKeyCode == KeyCodes.ENTER;
		};


		/* =========================================================== */
		/*                      end: event handlers                  */
		/* =========================================================== */

		/* =========================================================== */
		/*                      begin: private functions               */
		/* =========================================================== */
		/**
		 *
		 * @param {Object} $Ref
		 * @param {number} iRealDuration
		 * @param {function} fnOpened
		 * @private
		 */
		Dialog.prototype._openAnimation = function ($Ref, iRealDuration, fnOpened) {
			$Ref.addClass("sapMDialogOpen");

			$Ref.css("display", "block");
			setTimeout(fnOpened, iAnimationDuration);
		};

		/**
		 *
		 * @param {Object} $Ref
		 * @param {number} iRealDuration
		 * @param {function} fnClose
		 * @private
		 */
		Dialog.prototype._closeAnimation = function ($Ref, iRealDuration, fnClose) {
			$Ref.removeClass("sapMDialogOpen");

			setTimeout(fnClose, iAnimationDuration);
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._setDimensions = function () {
			var $this = this.$(),
				bStretch = this.getStretch(),
				bStretchOnPhone = this.getStretchOnPhone() && Device.system.phone,
				bMessageType = this.getType() === DialogType.Message,
				oStyles = {};

			//the initial size is set in the renderer when the dom is created

			if (!bStretch) {
				//set the size to the content
				if (!this._oManuallySetSize) {
					oStyles.width = this.getContentWidth() || undefined;
					oStyles.height = this.getContentHeight() || undefined;
				} else {
					oStyles.width = this._oManuallySetSize.width;
					oStyles.height = this._oManuallySetSize.height;
				}
			}

			if (oStyles.width == 'auto') {
				oStyles.width = undefined;
			}

			if (oStyles.height == 'auto') {
				oStyles.height = undefined;
			}

			if ((bStretch && !bMessageType) || (bStretchOnPhone)) {
				this.$().addClass('sapMDialogStretched');
			}

			$this.css(oStyles);

			if (!bStretch && !this._oManuallySetSize && !this._bDisableRepositioning) {
				this._centerDialog();
			}

			//In Chrome when the dialog is stretched the footer is not rendered in the right position;
			if (window.navigator.userAgent.toLowerCase().indexOf("chrome") !== -1 && this.getStretch()) {
				//forcing repaint
				$this.find('> footer').css({bottom: '0.001px'});
			}
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._adjustScrollingPane = function () {
			if (this._oScroller) {
				this._oScroller.refresh();
			}
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._reposition = function () {
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._repositionAfterOpen = function () {
		};

		/**\
		 *
		 * @private
		 */
		Dialog.prototype._reapplyPosition = function () {
			this._adjustScrollingPane();
		};

		/**
		 *
		 *
		 * @private
		 */
		Dialog.prototype._onResize = function () {
			var $dialog = this.$(),
				$dialogContent = this.$('cont'),
				dialogContentScrollTop,
				sContentHeight = this.getContentHeight(),
				sContentWidth = this.getContentWidth(),
				iDialogHeight,
				maxDialogWidth =  Math.floor(window.innerWidth * 0.9), //90% of the max screen size
				BORDER_THICKNESS = 2, // solves Scrollbar issue in IE when Table is in Dialog// TODO remove after the end of support for Internet Explorer
				oBrowser = Device.browser,
				iTotalChildrenHeight = 0;

			//if height is set by manually resizing return;
			if (this._oManuallySetSize) {
				$dialogContent.css({
					width: 'auto'
				});
				return;
			}

			if (!sContentHeight || sContentHeight == 'auto') {
				// save current scroll position so that it can be restored after the resize
				dialogContentScrollTop = $dialogContent.scrollTop();

				//reset the height so the dialog can grow
				$dialogContent.css({
					height: 'auto'
				});

				$dialog.children().each(function() {
					iTotalChildrenHeight += jQuery(this).outerHeight(true);
				});
				if (this.getStretch() ||  iTotalChildrenHeight > $dialog.innerHeight()) {
					//set the newly calculated size by getting it from the browser rendered layout - by the max-height
					iDialogHeight = parseFloat($dialog.height()) + BORDER_THICKNESS;
					$dialogContent.height(Math.round( iDialogHeight));
				}

				$dialogContent.scrollTop(dialogContentScrollTop);
			}

			// Browsers except chrome do not increase the width of the container to include scrollbar (when width is auto). So we need to compensate
			if (Device.system.desktop && !oBrowser.chrome) {

				var iCurrentWidthAndHeight = $dialogContent.width() + "x" + $dialogContent.height(),
					bMinWidth = $dialog.css("min-width") !== $dialog.css("width");

				// Apply the fix only if width or height did actually change.
				// And when the width is not equal to the min-width.
				if (iCurrentWidthAndHeight !== this._iLastWidthAndHeightWithScroll && bMinWidth) {
					if (this._hasVerticalScrollbar() &&					// - there is a vertical scroll
						(!sContentWidth || sContentWidth == 'auto') &&	// - when the developer hasn't set it explicitly
						!this.getStretch() && 							// - when the dialog is not stretched
						$dialogContent.width() < maxDialogWidth) {		// - if the dialog can't grow anymore

						$dialog.addClass("sapMDialogVerticalScrollIncluded");
						$dialogContent.css({"padding-right" : iScrollbarWidth});
						this._iLastWidthAndHeightWithScroll = iCurrentWidthAndHeight;
					} else {
						$dialog.removeClass("sapMDialogVerticalScrollIncluded");
						$dialogContent.css({"padding-right" : ""});
						this._iLastWidthAndHeightWithScroll = null;
					}
				}
			}

			if (!this.getStretch() && !this._oManuallySetSize && !this._bDisableRepositioning) {
				this._centerDialog();
			}
		};

		/**
		 * Checks if the dialog has a vertical scrollbar.
		 * @private
		 * @return {boolean} True if there is a vertical scrollbar, false otherwise
		 */
		Dialog.prototype._hasVerticalScrollbar = function() {
			var $dialogContent = this.$('cont');

			if (Device.browser.msie) {
				// The scrollHeight property may return incorrect value in IE
				// so we do the check based on the width of the vertical scrollbar
				return $dialogContent[0].clientWidth < $dialogContent.outerWidth();
			}

			return $dialogContent[0].clientHeight < $dialogContent[0].scrollHeight;
		};

		/**
		 * Centers the dialog
		 *
		 * @private
		 */
		Dialog.prototype._centerDialog = function() {
			this.$().css(this._calcCenter());
		};

		/**
		 * Calculates "left" and "top" positions, so the dialog is centered.
		 *
		 * @private
		 */
		Dialog.prototype._calcCenter = function () {
			var windowWidth = window.innerWidth,
				windowHeight = window.innerHeight,
				$this = this.$(),
				dialogWidth = $this.outerWidth(),
				dialogHeight  = $this.outerHeight();

			return {
				left: Math.round((windowWidth - dialogWidth) / 2),
				top: Math.round((windowHeight - dialogHeight) / 2)
			};
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._createHeader = function () {
			if (!this._header) {
				// set parent of header to detect changes on title
				this._header = new Bar(this.getId() + "-header");
				this._header._setRootAccessibilityRole("heading");
				this._header._setRootAriaLevel("2");

				// call the method that registers this Bar for alignment
				this._setupBarTitleAlignment(this._header, this.getId() + "_header");
				this.setAggregation("_header", this._header);
			}
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._applyTitleToHeader = function () {
			var sTitle = this.getProperty("title");

			if (this._headerTitle) {
				this._headerTitle.setText(sTitle);
			} else {
				this._headerTitle = new Title(this.getId() + "-title", {
					text: sTitle,
					level: "H2"
				}).addStyleClass("sapMDialogTitle");

				this._header.addContentMiddle(this._headerTitle);
			}
		};

		/**
		 * If a scrollable control (<code>sap.m.NavContainer</code>, <code>sap.m.ScrollContainer</code>, <code>sap.m.Page</code>, <code>sap.m.SplitContainer</code>) is added to the Dialog content aggregation as a single child or through one or more <code>sap.ui.mvc.View</code> instances,
		 * the scrolling inside the Dialog will be disabled in order to avoid wrapped scrolling areas.
		 *
		 * If more than one scrollable control is added to the Dialog, the scrolling needs to be disabled manually.
		 * @private
		 */
		Dialog.prototype._hasSingleScrollableContent = function () {
			var aContent = this.getContent();

			while (aContent.length === 1 && aContent[0] instanceof Control && aContent[0].isA("sap.ui.core.mvc.View")) {
				aContent = aContent[0].getContent();
			}

			if (aContent.length === 1 && aContent[0] instanceof Control && aContent[0].isA(this._scrollContentList)) {
				return true;
			}

			return false;
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._getFocusId = function () {
			// Left or Right button can be visible false and therefore not rendered.
			// In such a case, focus should be set somewhere else.
			return this.getInitialFocus()
				|| this._getFirstFocusableContentSubHeader()
				|| this._getFirstFocusableContentElementId()
				|| this._getFirstVisibleButtonId()
				|| this.getId();
		};

		/**
		 *
		 * @returns {string}
		 * @private
		 */
		Dialog.prototype._getFirstVisibleButtonId = function () {
			var oBeginButton = this.getBeginButton(),
				oEndButton = this.getEndButton(),
				aButtons = this.getButtons(),
				sButtonId = "";

			if (oBeginButton && oBeginButton.getVisible()) {
				sButtonId = oBeginButton.getId();
			} else if (oEndButton && oEndButton.getVisible()) {
				sButtonId = oEndButton.getId();
			} else if (aButtons && aButtons.length > 0) {
				for (var i = 0; i < aButtons.length; i++) {
					if (aButtons[i].getVisible()) {
						sButtonId = aButtons[i].getId();
						break;
					}
				}
			}

			return sButtonId;
		};

		/**
		 *
		 * @returns {string}
		 * @private
		 */
		Dialog.prototype._getFirstFocusableContentSubHeader = function () {
			var $subHeader = this.$().find('.sapMDialogSubHeader');
			var sResult;

			var oFirstFocusableDomRef = $subHeader.firstFocusableDomRef();

			if (oFirstFocusableDomRef) {
				sResult = oFirstFocusableDomRef.id;
			}
			return sResult;
		};

		/**
		 *
		 * @returns {string}
		 * @private
		 */
		Dialog.prototype._getFirstFocusableContentElementId = function () {
			var sResult = "";
			var $dialogContent = this.$("cont");
			var oFirstFocusableDomRef = $dialogContent.firstFocusableDomRef();

			if (oFirstFocusableDomRef) {
				sResult = oFirstFocusableDomRef.id;
			}
			return sResult;
		};

		// The control that needs to be focused after the Dialog is open is calculated in the following sequence:
		// initialFocus, first focusable element in content area, beginButton, endButton
		// the Dialog is always modal so the focus doesn't need to be on the Dialog when there's
		// no initialFocus, beginButton and endButton available, but to keep the consistency,
		// the focus will in the end fall back on the Dialog itself.
		/**
		 *
		 * @private
		 */
		Dialog.prototype._setInitialFocus = function () {
			var sFocusId = this._getFocusId();
			var oControl = sap.ui.getCore().byId(sFocusId);
			var oFocusDomRef;

			if (oControl) {
				//if someone tries to focus on an existing but not visible control, focus the Dialog itself.
				if (oControl.getVisible && !oControl.getVisible()) {
					this.focus();
					return;
				}

				oFocusDomRef = oControl.getFocusDomRef();
			}

			oFocusDomRef = oFocusDomRef || ((sFocusId ? window.document.getElementById(sFocusId) : null));

			// if focus dom ref is not found
			if (!oFocusDomRef) {
				this.setInitialFocus(""); // clear the saved initial focus
				oFocusDomRef = sap.ui.getCore().byId(this._getFocusId()); // recalculate the element on focus
			}

			//if there is no set initial focus, set the default one to the initialFocus association
			if (!this.getInitialFocus()) {
				this.setAssociation('initialFocus', oFocusDomRef ? oFocusDomRef.id : this.getId(), true);
			}

			// Setting focus to DOM Element which can open the On-screen keyboard on mobile device doesn't work
			// consistently across devices. Therefore setting focus on these elements is disabled on mobile devices
			// and the keyboard should be opened by the user explicitly
			if (Device.system.desktop || (oFocusDomRef && !/input|textarea|select/i.test(oFocusDomRef.tagName))) {
				if (oFocusDomRef){
					oFocusDomRef.focus();
				}
			} else {
				// Set the focus on the popup itself in order to keep the tab chain
				this.focus();
			}
		};

		/**
		 * Returns the <code>sap.ui.core.ScrollEnablement</code> delegate which is used with this control.
		 *
		 * @private
		 */
		Dialog.prototype.getScrollDelegate = function () {
			return this._oScroller;
		};

		/**
		 *
		 * @param {string} sPos
		 * @returns {string}
		 * @private
		 */
		Dialog.prototype._composeAggreNameInHeader = function (sPos) {
			var sHeaderAggregationName;

			if (sPos === "Begin") {
				sHeaderAggregationName = "contentLeft";
			} else if (sPos === "End") {
				sHeaderAggregationName = "contentRight";
			} else {
				sHeaderAggregationName = "content" + sPos;
			}

			return sHeaderAggregationName;
		};

		/**
		 *
		 * @returns {boolean}
		 * @private
		 */
		Dialog.prototype._isToolbarEmpty = function () {
			// no ToolbarSpacer
			var filteredContent = this._oToolbar.getContent().filter(function (content) {
				return content.getMetadata().getName() !== 'sap.m.ToolbarSpacer';
			});

			return filteredContent.length === 0;
		};

		/**
		 *
		 * @param {Object} oButton
		 * @param {string} sPos
		 * @param {boolean} bSkipFlag
		 * @returns {Dialog}
		 * @private
		 */
		Dialog.prototype._setButton = function (oButton, sPos, bSkipFlag) {
			return this;
		};

		/**
		 *
		 * @param {string} sPos
		 * @private
		 */
		Dialog.prototype._getButton = function (sPos) {
			var sAggregationName = sPos.toLowerCase() + "Button",
				sButtonName = "_o" + this._firstLetterUpperCase(sPos) + "Button";

			if (Device.system.phone) {
				return this.getAggregation(sAggregationName, null, /*avoid infinite loop*/true);
			} else {
				return this[sButtonName];
			}
		};

		/**
		 *
		 * @param {string} sPos
		 * @private
		 */
		Dialog.prototype._getButtonFromHeader = function (sPos) {
			if (this._header) {
				var sHeaderAggregationName = this._composeAggreNameInHeader(this._firstLetterUpperCase(sPos)),
					aContent = this._header.getAggregation(sHeaderAggregationName);
				return aContent && aContent[0];
			} else {
				return null;
			}
		};

		/**
		 *
		 * @param {string} sValue
		 * @returns {string}
		 * @private
		 */
		Dialog.prototype._firstLetterUpperCase = function (sValue) {
			return sValue.charAt(0).toUpperCase() + sValue.slice(1);
		};


		/**
		 * Returns the custom header instance when the <code>customHeader</code> aggregation is set. Otherwise, it returns the internal managed
		 * header instance. This method can be called within composite controls which use <code>sap.m.Dialog</code> inside.
		 *
		 * @protected
		 */
		Dialog.prototype._getAnyHeader = function () {
			var oCustomHeader = this.getCustomHeader();

			if (oCustomHeader) {
				oCustomHeader._setRootAriaLevel("2");
				return oCustomHeader._setRootAccessibilityRole("heading");
			} else {
				var bShowHeader = this.getShowHeader();
				// if showHeader is set to false and not for standard dialog in iOS in theme sap_mvi, no header.
				if (!bShowHeader) {
					return null;
				}

				this._createHeader();
				this._applyTitleToHeader();
				this._applyIconToHeader();
				return this._header;
			}
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._deregisterResizeHandler = function () {
			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}

			Device.resize.detachHandler(this._onResize, this);
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._registerResizeHandler = function () {
			var _$srollSontent = this.$("scroll");

			//The content have to have explicit size so the scroll will work when the user's content is larger than the available space.
			//This can be removed and the layout change to flex when the support for IE9 is dropped// TODO remove after the end of support for Internet Explorer
			this._resizeListenerId = ResizeHandler.register(_$srollSontent.get(0), jQuery.proxy(this._onResize, this));
			Device.resize.attachHandler(this._onResize, this);

			//set the initial size of the content container so when a dialog with large content is open there will be a scroller
			this._onResize();
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._deregisterContentResizeHandler = function () {
			if (this._sContentResizeListenerId) {
				ResizeHandler.deregister(this._sContentResizeListenerId);
				this._sContentResizeListenerId = null;
			}
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._registerContentResizeHandler = function() {
			if (!this._sContentResizeListenerId) {
				this._sContentResizeListenerId = ResizeHandler.register(this.getDomRef("scrollCont"), jQuery.proxy(this._onResize, this));
			}

			//set the initial size of the content container so when a dialog with large content is open there will be a scroller
			this._onResize();
		};

		Dialog.prototype._attachHandler = function(oButton) {
			var that = this;

			if (!this._oButtonDelegate) {
				this._oButtonDelegate = {
					ontap: function(){
						that._oCloseTrigger = this;
					},
					//BCP: 1870320154
					onkeyup: function(){
						that._oCloseTrigger = this;
					},
					onkeydown: function(){
						that._oCloseTrigger = this;
					}
				};
			}

			if (oButton) {
				oButton.addDelegate(this._oButtonDelegate, true, oButton);
			}
		};

		Dialog.prototype._createToolbarButtons = function () {
			var toolbar = this._getToolbar();
			var buttons = this.getButtons();
			var beginButton = this.getBeginButton();
			var endButton = this.getEndButton(),
				that = this,
				aButtons = [beginButton, endButton];


			// remove handler if such exists
			aButtons.forEach(function(oBtn) {
				if (oBtn && that._oButtonDelegate) {
					oBtn.removeDelegate(that._oButtonDelegate);
				}
			});

			toolbar.removeAllContent();
			if (!("_toolbarSpacer" in this)) {
				this._toolbarSpacer = new ToolbarSpacer();
			}
			toolbar.addContent(this._toolbarSpacer);
			// attach handler which sets origin parameter only for begin and End buttons
			aButtons.forEach(function(oBtn) {
				that._attachHandler(oBtn);
			});

			//if there are buttons they should be in the toolbar and the begin and end buttons should not be used
			if (buttons && buttons.length) {
				buttons.forEach(function (button) {
					toolbar.addContent(button);
				});
			} else {
				if (beginButton) {
					toolbar.addContent(beginButton);
				}
				if (endButton) {
					toolbar.addContent(endButton);
				}
			}
		};

		/*
		 *
		 * @returns {*|sap.m.IBar|null}
		 * @private
		 */
		Dialog.prototype._getToolbar = function () {
			if (!this._oToolbar) {
				this._oToolbar = new AssociativeOverflowToolbar(this.getId() + "-footer").addStyleClass("sapMTBNoBorders");
				this._oToolbar.addDelegate({
					onAfterRendering: function () {
						if (this.getType() === DialogType.Message) {
							this.$("footer").removeClass("sapContrast sapContrastPlus");
						}
					}
				}, false, this);

				this.setAggregation("_toolbar", this._oToolbar);
			}

			return this._oToolbar;
		};

		/**
		 * Returns the <code>sap.ui.core.ValueState</code> state according to the language settings.
		 * @param {sap.ui.core.ValueState|string} sValueState The Dialog value state
		 * @returns {string} The translated text
		 * @private
		 */
		Dialog.prototype.getValueStateString = function (sValueState) {
			var rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			switch (sValueState) {
				case (ValueState.Success):
					return rb.getText("LIST_ITEM_STATE_SUCCESS");
				case (ValueState.Warning):
					return rb.getText("LIST_ITEM_STATE_WARNING");
				case (ValueState.Error):
					return rb.getText("LIST_ITEM_STATE_ERROR");
				case (ValueState.Information):
					return rb.getText("LIST_ITEM_STATE_INFORMATION");
				default:
					return "";
			}
		};

		/* =========================================================== */
		/*                      end: private functions                 */
		/* =========================================================== */

		/* =========================================================== */
		/*                         begin: setters                      */
		/* =========================================================== */

		// The public setters and getters should not be documented via JSDoc because they will appear in the documentation

		Dialog.prototype.setSubHeader = function (oControl) {
			this.setAggregation("subHeader", oControl);

			if (oControl) {
				oControl.setVisible = function (isVisible) {
					oControl.setProperty("visible", isVisible);
					this.invalidate();
				}.bind(this);
			}

			return this;
		};

		Dialog.prototype.setLeftButton = function (vButton) {
			if (typeof vButton === "string") {
				vButton = sap.ui.getCore().byId(vButton);
			}

			//setting leftButton will also set the beginButton with the same button instance.
			//as this instance is aggregated by the beginButton, the hidden aggregation isn't needed.
			this.setBeginButton(vButton);
			return this.setAssociation("leftButton", vButton);
		};

		Dialog.prototype.setRightButton = function (vButton) {
			if (typeof vButton === "string") {
				vButton = sap.ui.getCore().byId(vButton);
			}

			//setting rightButton will also set the endButton with the same button instance.
			//as this instance is aggregated by the endButton, the hidden aggregation isn't needed.
			this.setEndButton(vButton);
			return this.setAssociation("rightButton", vButton);
		};

		Dialog.prototype.getLeftButton = function () {
			var oBeginButton = this.getBeginButton();
			return oBeginButton ? oBeginButton.getId() : null;
		};

		Dialog.prototype.getRightButton = function () {
			var oEndButton = this.getEndButton();
			return oEndButton ? oEndButton.getId() : null;
		};

		Dialog.prototype.setBeginButton = function (oButton) {
			if (oButton && oButton.isA("sap.m.Button")) {
				oButton.addStyleClass("sapMDialogBeginButton");
			}

			return this.setAggregation("beginButton", oButton);
		};

		Dialog.prototype.setEndButton = function (oButton) {
			if (oButton && oButton.isA("sap.m.Button")) {
				oButton.addStyleClass("sapMDialogEndButton");
			}

			return this.setAggregation("endButton", oButton);
		};

		//get buttons should return the buttons, beginButton and endButton aggregations
		Dialog.prototype.getAggregation = function (sAggregationName, oDefaultForCreation, bPassBy) {
			var originalResponse = Control.prototype.getAggregation.apply(this, Array.prototype.slice.call(arguments, 0, 2));

			//if no buttons are set returns the begin and end buttons
			if (sAggregationName === 'buttons' && originalResponse && originalResponse.length === 0) {
				this.getBeginButton() && originalResponse.push(this.getBeginButton());
				this.getEndButton() && originalResponse.push(this.getEndButton());
			}

			return originalResponse;
		};

		Dialog.prototype.getAriaLabelledBy = function() {
			var oHeader = this._getAnyHeader(),
				// Due to a bug in getAssociation in ManagedObject slice the Array
				// Remove slice when the bug is fixed.
				aLabels = this.getAssociation("ariaLabelledBy", []).slice();

			var oSubHeader = this.getSubHeader();
			if (oSubHeader) {
				aLabels.unshift(oSubHeader.getId());
			}

			if (oHeader) {
				var aTitles = oHeader.findAggregatedObjects(true, function(oObject) {
					return oObject.isA("sap.m.Title");
				});

				// if there are titles in the header, add all of them to labels, else use the full header
				if (aTitles.length) {
					aLabels = aTitles.map(function (oTitle) {
						return oTitle.getId();
					}).concat(aLabels);
				} else {
					aLabels.unshift(oHeader.getId());
				}
			}

			return aLabels;
		};

		Dialog.prototype._applyIconToHeader = function () {
			var sIcon = this.getIcon();

			if (!sIcon) {
				if (this._iconImage) {
					this._iconImage.destroy();
					this._iconImage = null;
				}

				return;
			}

			if (!this._iconImage) {
				this._iconImage = IconPool.createControlByURI({
					id: this.getId() + "-icon",
					src: sIcon,
					useIconTooltip: false
				}, Image).addStyleClass("sapMDialogIcon");

				this._header.insertAggregation("contentMiddle", this._iconImage, 0);
			}

			this._iconImage.setSrc(sIcon);
		};

		Dialog.prototype.setInitialFocus = function (sInitialFocus) {
			// Skip the invalidation when sets the initial focus
			//
			// The initial focus takes effect after the next open of the dialog, when it's set
			// after the dialog is open, the current focus won't be changed
			// SelectDialog depends on this. If this has to be changed later, please make sure to
			// check the SelectDialog as well where setIntialFocus is called.
			return this.setAssociation("initialFocus", sInitialFocus, true);
		};
		/* =========================================================== */
		/*                           end: setters                      */
		/* =========================================================== */

		Dialog.prototype.forceInvalidate = Control.prototype.invalidate;

		// stop propagating the invalidate to static UIArea before dialog is opened.
		// otherwise the open animation can't be seen
		// dialog will be rendered directly to static ui area when the open method is called.
		Dialog.prototype.invalidate = function (oOrigin) {
			if (this.isOpen()) {
				this.forceInvalidate(oOrigin);
			}
		};

		/* =========================================================== */
		/*                     Resize & Drag logic                     */
		/* =========================================================== */
		/**
		 *
		 * @param {Object} eventTarget
		 * @returns {boolean}
		 */
		function isHeaderClicked(eventTarget) {
			var $target = jQuery(eventTarget);
			var oControl = $target.control(0);

			// target is inside the content section
			if ($target.parents('.sapMDialogSection').length) {
				return false;
			}

			if (!oControl || oControl.getMetadata().getInterfaces().indexOf("sap.m.IBar") > -1) {
				return true;
			}

			return $target.hasClass('sapMDialogTitle');
		}

		if (Device.system.desktop) {
			/**
			 *
			 * @param {Object} e
			 */
			Dialog.prototype.ondblclick = function (e) {
				if (isHeaderClicked(e.target)) {
					var $dialogContent = this.$('cont');
					this._bDisableRepositioning = false;
					this._oManuallySetPosition = null;
					this._oManuallySetSize = null;

					//call the reposition
					this.oPopup && this.oPopup._applyPosition(this.oPopup._oLastPosition, true);

					//BCP: 1880238929
					$dialogContent.css({
						height: '100%'
					});
				}
			};

			/**
			 *
			 * @param {Object} e
			 */
			Dialog.prototype.onmousedown = function (e) {
				if (e.which === 3) {
					return; // on right click don't reposition the dialog
				}
				if (this.getStretch() || (!this.getDraggable() && !this.getResizable())) {
					return;
				}

				var timeout;
				var that = this;
				var $w = jQuery(document);

				var $target = jQuery(e.target);
				var bResize = $target.hasClass('sapMDialogResizeHandler') && this.getResizable();
				var fnMouseMoveHandlerDelayed = function (action) {
					timeout = timeout ? clearTimeout(timeout) : setTimeout(function () {
						action();
					}, 0);
				};

				var windowWidth = window.innerWidth;
				var windowHeight = window.innerHeight;
				var initial = {
					x: e.pageX,
					y: e.pageY,
					width: that._$dialog.width(),
					height: that._$dialog.height(),
					outerHeight : that._$dialog.outerHeight(),
					offset: {
						//use e.originalEvent.layerX/Y for Firefox
						x: e.offsetX ? e.offsetX : e.originalEvent.layerX,
						y: e.offsetY ? e.offsetY : e.originalEvent.layerY
					},
					position: {
						x: that._$dialog.offset().left,
						y: that._$dialog.offset().top
					}
				};
				var mouseMoveHandler;

				function mouseUpHandler() {
					var $dialog = that.$(),
						$dialogContent = that.$('cont'),
						dialogHeight,
						dialogBordersHeight;

					$w.off("mouseup", mouseUpHandler);
					$w.off("mousemove", mouseMoveHandler);


					if (bResize) {
						that._$dialog.removeClass('sapMDialogResizing');

						// Take the height from the styles attribute of the DOM element not from the calculated height.
						// max-height is taken into account if we use calculated height and a wrong value is set for the dialog content's height.
						// If no value is set for the height style fall back to calculated height.
						// * Calculated height is the value taken by $dialog.height().
						dialogHeight = parseInt($dialog[0].style.height) || parseInt($dialog.height());
						dialogBordersHeight = parseInt($dialog.css("border-top-width")) + parseInt($dialog.css("border-bottom-width"));
						$dialogContent.height(dialogHeight + dialogBordersHeight);
					}
				}

				if ((isHeaderClicked(e.target) && this.getDraggable()) || bResize) {
					that._bDisableRepositioning = true;

					that._$dialog.addClass('sapDialogDisableTransition');

					that._oManuallySetPosition = {
						x: initial.position.x,
						y: initial.position.y
					};

					//set the new position of the dialog on mouse down when the transform is disabled by the class
					that._$dialog.css({
						left: Math.min(Math.max(0, that._oManuallySetPosition.x), windowWidth - initial.width),
						top: Math.min(Math.max(0, that._oManuallySetPosition.y), windowHeight - initial.height),
						width: initial.width
					});
				}

				if (isHeaderClicked(e.target) && this.getDraggable()) {
					mouseMoveHandler = function (event) {

						if (event.buttons === 0) {
							mouseUpHandler();
							return;
						}

						fnMouseMoveHandlerDelayed(function () {
							that._bDisableRepositioning = true;

							that._oManuallySetPosition = {
								x: event.pageX - e.pageX + initial.position.x, // deltaX + initial dialog position
								y: event.pageY - e.pageY + initial.position.y // deltaY + initial dialog position
							};

							//move the dialog
							that._$dialog.css({
								left: Math.min(Math.max(0, that._oManuallySetPosition.x), windowWidth - initial.width),
								top: Math.min(Math.max(0, that._oManuallySetPosition.y), windowHeight - initial.outerHeight)
							});
						});
					};

					$w.on("mousemove", mouseMoveHandler);
				} else if (bResize) {

					that._$dialog.addClass('sapMDialogResizing');

					var styles = {};
					var minWidth = parseInt(that._$dialog.css('min-width'));
					var maxLeftOffset = initial.x + initial.width - minWidth;

					var handleOffsetX = $target.width() - e.offsetX;
					var handleOffsetY = $target.height() - e.offsetY;

					mouseMoveHandler = function (event) {
						fnMouseMoveHandlerDelayed(function () {
							that._bDisableRepositioning = true;
							// BCP: 1680048166 remove inline set height and width so that the content resizes together with the mouse pointer
							that.$('cont').height('').width('');

							if (event.pageY + handleOffsetY > windowHeight) {
								event.pageY = windowHeight - handleOffsetY;
							}

							if (event.pageX + handleOffsetX > windowWidth) {
								event.pageX = windowWidth - handleOffsetX;
							}

							that._oManuallySetSize = {
								width: initial.width + event.pageX - initial.x,
								height: initial.height + event.pageY - initial.y
							};

							if (that._bRTL) {
								styles.left = Math.min(Math.max(event.pageX, 0), maxLeftOffset);
								that._oManuallySetSize.width = initial.width + initial.x - Math.max(event.pageX, 0);
							}

							styles.width = that._oManuallySetSize.width;
							styles.height = that._oManuallySetSize.height;

							that._$dialog.css(styles);
						});
					};

					$w.on("mousemove", mouseMoveHandler);
				} else {
					return;
				}

				$w.on("mouseup", mouseUpHandler);

				e.preventDefault();
				e.stopPropagation();
			};
		}

		/**
		 * Popup controls should not propagate contextual width
		 * @private
		 */
		Dialog.prototype._applyContextualSettings = function () {
			ManagedObject.prototype._applyContextualSettings.call(this, ManagedObject._defaultContextualSettings);
		};

		// enrich the control functionality with TitleAlignmentMixin
		TitleAlignmentMixin.mixInto(Dialog.prototype);

		return Dialog;
	});
