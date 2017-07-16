/*!
 * ${copyright}
 */

// Provides control sap.m.Dialog.
sap.ui.define(['jquery.sap.global', './Bar', './InstanceManager', './AssociativeOverflowToolbar', './ToolbarSpacer',
	'./library', 'sap/ui/core/Control', 'sap/ui/core/IconPool', 'sap/ui/core/Popup', 'sap/ui/core/delegate/ScrollEnablement',
	'sap/ui/core/theming/Parameters', 'sap/ui/core/RenderManager', 'sap/ui/core/InvisibleText', 'sap/ui/core/ResizeHandler','sap/ui/Device', 'sap/ui/base/ManagedObject'],
	function (jQuery, Bar, InstanceManager, AssociativeOverflowToolbar, ToolbarSpacer, library, Control, IconPool,
			  Popup, ScrollEnablement, Parameters, RenderManager, InvisibleText, ResizeHandler, Device, ManagedObject) {
		"use strict";


		var ValueState = sap.ui.core.ValueState;

		/**
		* Constructor for a new Dialog.
		*
		* @param {string} [sId] ID for the new control, generated automatically if no ID is given
		* @param {object} [mSettings] Initial settings for the new control
		*
		* @class
		* A popup that interrupts the current processing and prompts the user for an action or an input, in a modal mode.
		* <h3>Overview</h3>
		* The Dialog control is used to prompt the user for an action or a confirmation. It interrupts the current app processing as it is the only focused UI element and the main screen is dimmed/blocked.
		* The content of the dialog is fully customizable.
		* <h3>Structure</h3>
		* A dialog consists of a title, optional subtitle, content area and a footer for action buttons.
		* The dialog is usually displayed at the center of the screen. Its size and position can be changed by the user.
		* To enable this, you need to set the properties <code>resizable</code> and <code>draggable</code> accordingly.
		*
		* There are other specialized types of dialogs:
		* <ul>
		* <li>{@link sap.m.P13nDialog Personalization dialog} - used for personalizing sorting, filtering and grouping in tables</li>
		* <li>{@link sap.m.SelectDialog Select dialog} - used to select one or more items from a comprehensive list</li>
		* <li>{@link sap.m.TableSelectDialog Table select dialog} - used to  make a selection from a comprehensive table containing multiple attributes or values</li>
		* <li>{@link sap.ui.comp.valuehelpdialog.ValueHelpDialog Value help dialog} - used to help the user find and select single and multiple values</li>
		* <li>{@link sap.m.ViewSettingsDialog View settings dialog}  - used to sort, filter, or group data within a (master) list or a table</li>
		* <li>{@link sap.m.BusyDialog Busy dialog} - used to block the screen and inform the user about an ongoing operation</li>
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
		* <li>If the <code>stretch</code> property is set to true, the dialog displays on full screen.</li>
		* <li>If the <code>contentWidth</code> and/or <code>contentHeight</code> properties are set, the dialog will try to fill those sizes.</li>
		* <li>If there is no specific sizing, the dialog will try to adjust its size to its content.</li>
		* </ul>
		* <h4>Smartphones</h4>
		* If the dialog has one or two actions they will cover the entire footer. If there are more actions, they will overflow.
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
					 * Icon displayed in the dialog's header. This icon is invisible on the iOS platform and it's density aware. You can use the density convention (@2, @1.5, etc.) to provide higher resolution image for higher density screen.
					 */
					icon: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: null},

					/**
					 * Title text appears in the dialog header.
					 */
					title: {type: "string", group: "Appearance", defaultValue: null},

					/**
					 * Determines whether the header is shown inside the dialog. If this property is set to true, the text and icon property are ignored. This property has a default value true.
					 * @since 1.15.1
					 */
					showHeader: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * The type of the dialog. In some themes, the type "message" will limit the dialog's width within 480px on tablet and desktop.
					 */
					type: {type: "sap.m.DialogType", group: "Appearance", defaultValue: sap.m.DialogType.Standard},

					/**
					 * The state affects the icon and the title color. If other than "None" is set, a predefined icon will be added to the dialog. Setting icon property will overwrite the predefined icon. The default value is "None" which doesn't add any icon to the Dialog control. This property is by now only supported by blue crystal theme.
					 * @since 1.11.2
					 */
					state: {type: "sap.ui.core.ValueState", group: "Appearance", defaultValue: ValueState.None},

					/**
					 * Determines whether the dialog will displayed on full screen on a phone.
					 * @since 1.11.2
					 * @deprecated Since version 1.13.1.
					 * Please use the new stretch property instead. This enables a stretched dialog even on tablet and desktop. If you want to achieve the same effect as stretchOnPhone, please set the stretch with jQuery.device.is.phone, then dialog is only stretched when runs on phone.
					 */
					stretchOnPhone: {type: "boolean", group: "Appearance", defaultValue: false, deprecated: true},

					/**
					 * Determines  if the dialog will be stretched to full screen. This property is only applicable to standard dialog and message type dialog ignores this property.
					 * @since 1.13.1
					 */
					stretch: {type: "boolean", group: "Appearance", defaultValue: false},

					/**
					 * Preferred width of content in Dialog. This property affects the width of dialog on phone in landscape mode, tablet or desktop, because the dialog has a fixed width on phone in portrait mode. If the preferred width is less than the minimum width of dilaog or more than the available width of the screen, it will be overwritten by the min or max value. The current mininum value of dialog width on tablet is 400px.
					 * @since 1.12.1
					 */
					contentWidth: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null},

					/**
					 * Preferred height of content in Dialog. If the preferred height is bigger than the available space on screen, it will be overwritten by the maximum available height on screen in order to make sure that dialog isn't cut off.
					 * @since 1.12.1
					 */
					contentHeight: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null},

					/**
					 * Indicates if user can scroll horizontally inside dialog when the content is bigger than the content area.
					 * Dialog detects if there's sap.m.NavContainer, sap.m.Page, sap.m.ScrollContainer or sap.m.SplitContainer as direct child added to dialog. If there is, dialog will turn off scrolling by setting this property to false automatically ignoring the existing value of this property.
					 * @since 1.15.1
					 */
					horizontalScrolling: {type: "boolean", group: "Behavior", defaultValue: true},

					/**
					 * Indicates if user can scroll vertically inside dialog when the content is bigger than the content area.
					 * Dialog detects if there's sap.m.NavContainer, sap.m.Page, sap.m.ScrollContainer or sap.m.SplitContainer as direct child added to dialog. If there is, dialog will turn off scrolling by setting this property to false automatically ignoring the existing value of this property.
					 * @since 1.15.1
					 */
					verticalScrolling: {type: "boolean", group: "Behavior", defaultValue: true},

					/**
					 * Indicates whether the dialog is resizable. the dialog is resizable. If this property is set to true, the dialog will have a resize handler in it's bottom right corner. This property has a default value false. The Dialog can be resizable only in desktop mode.
					 * @since 1.30
					 */
					resizable: {type: "boolean", group: "Behavior", defaultValue: false},

					/**
					 * Indicates whether the dialog is draggable. If this property is set to true, the dialog will be draggable by it's header. This property has a default value false. The Dialog can be draggable only in desktop mode.
					 * @since 1.30
					 */
					draggable: {type: "boolean", group: "Behavior", defaultValue: false},

					/**
					 * This property expects a function with one parameter of type <code>Promise</code>. In the function you should call either <code>resolve()</code> or <code>reject()</code> on the <code>Promise</code> object.<br/>
					 * The function allows you to define custom behaviour which will be executed when the ESCAPE key is pressed. By default when the ESCAPE key is pressed the Dialog is immediately closed.
					 * @since 1.44
					 */
					escapeHandler : {type: "any", group: "Behavior", defaultValue: null}
				},
				defaultAggregation: "content",
				aggregations: {

					/**
					 * The content inside the dialog.<br/><b>Note:</b> When the content of the <code>Dialog</code> is comprised of controls that use <code>position: absolute</code>, such as <code>SplitContainer</code>, the dialog has to have either <code>stretch: true</code> or <code>contentHeight</code> set.
					 */
					content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},

					/**
					 * When subHeader is assigned to Dialog, it's rendered directly after the main header in Dialog. SubHeader is out of the content area and won't be scrolled when content's size is bigger than the content area's size.
					 * @since 1.12.2
					 */
					subHeader: {type: "sap.m.IBar", multiple: false},

					/**
					 * CustomHeader is only supported in some themes. When it's set, the icon, title and showHeader are properties ignored. Only the customHeader is shown as the header of the dialog.
					 * @since 1.15.1
					 */
					customHeader: {type: "sap.m.IBar", multiple: false},

					/**
					 * The button which is rendered to the left side (right side in RTL mode) of the endButton in the footer area inside the dialog. From UI5 version 1.21.1, there's a new aggregation "buttons" created with which more than 2 buttons can be added to the footer area of dialog. If the new "buttons" aggregation is set, any change made to this aggregation has no effect anymore. When runs on the phone, this button (and the endButton together when set) is (are) rendered at the center of the footer area. When runs on the other platforms, this button (and the endButton together when set) is (are) rendered at the right side (left side in RTL mode) of the footer area.
					 * @since 1.15.1
					 */
					beginButton: {type: "sap.m.Button", multiple: false},

					/**
					 * The button which is rendered to the right side (left side in RTL mode) of the beginButton in the footer area inside the dialog. From UI5 version 1.21.1, there's a new aggregation "buttons" created with which more than 2 buttons can be added to the footer area of dialog. If the new "buttons" aggregation is set, any change made to this aggregation has no effect anymore. When runs on the phone, this button (and the beginButton together when set) is (are) rendered at the center of the footer area. When runs on the other platforms, this button (and the beginButton together when set) is (are) rendered at the right side (left side in RTL mode) of the footer area.
					 * @since 1.15.1
					 */
					endButton: {type: "sap.m.Button", multiple: false},

					/**
					 * Buttons can be added to the footer area of dialog through this aggregation. When this aggregation is set, any change to beginButton and endButton has no effect anymore. Buttons which are inside this aggregation are aligned at the right side (left side in RTL mode) of the footer instead of in the middle of the footer.
					 * @since 1.21.1
					 */
					buttons: {type: "sap.m.Button", multiple: true, singularName: "button"},

					/**
					 * The hidden aggregation for internal maintained header.
					 */
					_header: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

					/**
					 * The hidden aggregation for internal maintained title control.
					 */
					_title: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

					/**
					 * The hidden aggregation for internal maintained icon control.
					 */
					_icon: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

					/**
					 * The hidden aggregation for internal maintained toolbar instance
					 */
					_toolbar: {type: "sap.m.OverflowToolbar", multiple: false, visibility: "hidden"},

					/**
					 * The hidden aggregation for the Dialog state
					 */
					_valueState: {type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden"}
				},
				associations: {

					/**
					 * LeftButton is shown at the left edge of the bar in iOS, and at the right side of the bar for the other platforms. Please set this to null if you want to remove the left button from the bar. And the button is only removed from the bar, not destroyed. When showHeader is set to false, this property will be ignored. Setting leftButton will also set the beginButton internally.
					 * @deprecated Since version 1.15.1.
					 *
					 * LeftButton has been deprecated since 1.15.1. Please use the beginButton instead which is more RTL friendly.
					 */
					leftButton: {type: "sap.m.Button", multiple: false, deprecated: true},

					/**
					 * RightButton is always shown at the right edge of the bar. Please set this to null if you want to remove the right button from the bar. And the button is only removed from the bar, not destroyed. When showHeader is set to false, this property will be ignored. Setting rightButton will also set the endButton internally.
					 * @deprecated Since version 1.15.1.
					 *
					 * RightButton has been deprecated since 1.15.1. Please use the endButton instead which is more RTL friendly.
					 */
					rightButton: {type: "sap.m.Button", multiple: false, deprecated: true},

					/**
					 * Focus is set to the dialog in the sequence of leftButton and rightButton when available. But if some other control needs to get the focus other than one of those two buttons, set the initialFocus with the control which should be focused on. Setting initialFocus to input controls doesn't open the on screen keyboard on mobile device, this is due to the browser limitation that the on screen keyboard can't be opened with javascript code. The opening of on screen keyboard must be triggered by real user action.
					 * @since 1.15.0
					 */
					initialFocus: {type: "sap.ui.core.Control", multiple: false},

					/**
					 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
					 */
					ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

					/**
					 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
					 */
					ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
				},
				events: {

					/**
					 * This event will be fired before the dialog is opened.
					 */
					beforeOpen: {},

					/**
					 * This event will be fired after the dialog is opened.
					 */
					afterOpen: {},

					/**
					 * This event will be fired before the dialog is closed.
					 */
					beforeClose: {
						parameters: {

							/**
							 * This indicates the trigger of closing the dialog. If dialog is closed by either leftButton or rightButton, the button that closes the dialog is set to this parameter. Otherwise this parameter is set to null.
							 * @since 1.9.2
							 */
							origin: {type: "sap.m.Button"}
						}
					},

					/**
					 * This event will be fired after the dialog is closed.
					 */
					afterClose: {
						parameters: {

							/**
							 * This indicates the trigger of closing the dialog. If dialog is closed by either leftButton or rightButton, the button that closes the dialog is set to this parameter. Otherwise this parameter is set to null.
							 * @since 1.9.2
							 */
							origin: {type: "sap.m.Button"}
						}
					}
				},
				designTime : true
			}
		});

		Dialog._bPaddingByDefault = (sap.ui.getCore().getConfiguration().getCompatibilityVersion("sapMDialogWithPadding").compareTo("1.16") < 0);

		Dialog._mStateClasses = {};
		Dialog._mStateClasses[ValueState.None] = "";
		Dialog._mStateClasses[ValueState.Success] = "sapMDialogSuccess";
		Dialog._mStateClasses[ValueState.Warning] = "sapMDialogWarning";
		Dialog._mStateClasses[ValueState.Error] = "sapMDialogError";

		Dialog._mIcons = {};
		Dialog._mIcons[ValueState.Success] = IconPool.getIconURI("message-success");
		Dialog._mIcons[ValueState.Warning] = IconPool.getIconURI("message-warning");
		Dialog._mIcons[ValueState.Error] = IconPool.getIconURI("message-error");

		/* =========================================================== */
		/*                  begin: Lifecycle functions                 */
		/* =========================================================== */
		Dialog.prototype.init = function () {
			var that = this;
			this._externalIcon = undefined;
			this._oManuallySetSize = null;
			this._oManuallySetPosition = null;
			this._bRTL = sap.ui.getCore().getConfiguration().getRTL();

			// used to judge if enableScrolling needs to be disabled
			this._scrollContentList = ["NavContainer", "Page", "ScrollContainer", "SplitContainer", "MultiInput"];

			this.oPopup = new Popup();
			this.oPopup.setShadow(true);
			this.oPopup.setNavigationMode("SCOPE");
			if (jQuery.device.is.iphone && !this._bMessageType) {
				this.oPopup.setModal(true, "sapMDialogTransparentBlk");
			} else {
				this.oPopup.setModal(true, "sapMDialogBlockLayerInit");
			}

			this.oPopup.setAnimations(jQuery.proxy(this._openAnimation, this), jQuery.proxy(this._closeAnimation, this));

			/**
			 *
			 * @param {Object} oPosition A new position to move the Dialog to.
			 * @param {boolean} bFromResize Is the function called from resize event.
			 * @private
			 */
			this.oPopup._applyPosition = function (oPosition, bFromResize) {
				that._setDimensions();
				that._adjustScrollingPane();

				//set to hard 50% or the values set from a drag or resize
				oPosition.at = {};

				if (that._oManuallySetPosition) {
					oPosition.at.left = that._oManuallySetPosition.x;
					oPosition.at.top = that._oManuallySetPosition.y;
				} else {
					// the top and left position need to be calculated with the
					// window scroll position
					oPosition.at.top = 'calc(50% + ' + (window.scrollY === undefined ? window.pageYOffset : window.scrollY) + 'px)';

					if (that._bRTL) {
						oPosition.at.left = 'auto'; // RTL mode adds right 50% so we have to remove left 50%
					} else {
						oPosition.at.left = 'calc(50% + ' + (window.scrollX === undefined ? window.pageXOffset : window.scrollX) + 'px)';
					}
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
		};

		Dialog.prototype.onBeforeRendering = function () {
			//if content has scrolling, disable scrolling automatically
			if (this._hasSingleScrollableContent()) {
				this.setProperty("verticalScrolling", false);
				this.setProperty("horizontalScrolling", false);
				jQuery.sap.log.info("VerticalScrolling and horizontalScrolling in sap.m.Dialog with ID " + this.getId() + " has been disabled because there's scrollable content inside");
			} else if (!this._oScroller) {
				this._oScroller = new ScrollEnablement(this, this.getId() + "-scroll", {
					horizontal: this.getHorizontalScrolling(), // will be disabled in adjustScrollingPane if content can fit in
					vertical: this.getVerticalScrolling()
				});
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

			if (this.getType() === sap.m.DialogType.Message ||
				(Device.system.phone && !this.getStretch())) {
				this.$("footer").removeClass("sapContrast sapContrastPlus");
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
				case sap.ui.core.OpenState.OPEN:
				case sap.ui.core.OpenState.OPENING:
					return this;
				case sap.ui.core.OpenState.CLOSING:
					this._bOpenAfterClose = true;
					break;
				default:
			}

			//reset the close trigger
			this._oCloseTrigger = null;

			this.fireBeforeOpen();
			oPopup.attachOpened(this._handleOpened, this);

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
			if (!(eOpenState === sap.ui.core.OpenState.CLOSED || eOpenState === sap.ui.core.OpenState.CLOSING)) {
				sap.m.closeKeyboard();
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
		 * The method checks if the Dialog is open. It returns true when the Dialog is currently open (this includes opening and closing animations), otherwise it returns false.
		 *
		 * @returns boolean
		 * @public
		 * @since 1.9.1
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		Dialog.prototype.isOpen = function () {
			return this.oPopup && this.oPopup.isOpen();
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
		 * Event handler for the focusin event.
		 * If it occurs on the focus handler elements at the beginning of the dialog, the focus is set to the end, and vice versa.
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
					jQuery.sap.focus(oLastFocusableDomRef);
				}
			} else if (oSourceDomRef.id === this.getId() + "-lastfe") {
				//Check if the invisible LAST focusable element (suffix '-lastfe') has gained focus
				//First check if header content is available
				var oFirstFocusableDomRef = (this._getAnyHeader() && this._getAnyHeader().$().firstFocusableDomRef()) || (this.getSubHeader() && this.getSubHeader().$().firstFocusableDomRef()) || this.$("cont").firstFocusableDomRef() || this.$("footer").firstFocusableDomRef();
				if (oFirstFocusableDomRef) {
					jQuery.sap.focus(oFirstFocusableDomRef);
				}
			}
		};

		/**
		 * Makes sure app developer will always have access to the last created promise
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
		 * If it occurs and the developer hasn't defined the escapeHandler property, the Dialog is immediately closed.
		 * Else the escapeHandler is executed and the developer may prevent the closing of the Dialog.
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		Dialog.prototype.onsapescape = function(oEvent) {
			var oEscapeHandler = this.getEscapeHandler(),
				oPromiseArgument = {},
				that = this;

			if (oEvent.originalEvent && oEvent.originalEvent._sapui_handledByControl) {
				return;
			}

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
						jQuery.sap.log.info("Disallow dialog closing");
					});
			} else {

				this.close();
			}

			//event should not trigger any further actions
			oEvent.stopPropagation();
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
		 * @param fnOpened
		 * @private
		 */
		Dialog.prototype._openAnimation = function ($Ref, iRealDuration, fnOpened) {
			$Ref.addClass("sapMDialogOpen");

			$Ref.css("display", "block");
			setTimeout(fnOpened, 300); // the time should be longer the longest transition in the CSS (200ms), because of focusing and transition relate issues especially in IE where 200ms transition sometimes seems to last a little longer
		};

		/**
		 *
		 * @param {Object} $Ref
		 * @param {number} iRealDuration
		 * @param fnClose
		 * @private
		 */
		Dialog.prototype._closeAnimation = function ($Ref, iRealDuration, fnClose) {
			$Ref.removeClass("sapMDialogOpen");

			setTimeout(fnClose, 300);
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._setDimensions = function () {
			var $this = this.$(),
				bStretch = this.getStretch(),
				bStretchOnPhone = this.getStretchOnPhone() && Device.system.phone,
				bMessageType = this._bMessageType,
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
				this._applyCustomTranslate();
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
				dialogClientWidth = $dialogContent[0].clientWidth,
				dialogContentScrollTop,
				sContentHeight = this.getContentHeight(),
				sContentWidth = this.getContentWidth(),
				iDialogHeight,
				maxDialogWidth =  Math.floor(window.innerWidth * 0.9), //90% of the max screen size
				BORDER_THICKNESS = 2, // solves Scrollbar issue in IE when Table is in Dialog
				oBrowser = sap.ui.Device.browser;

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

				//set the newly calculated size by getting it from the browser rendered layout - by the max-height
				iDialogHeight = parseFloat($dialog.height()) + BORDER_THICKNESS;
				$dialogContent.height(Math.round( iDialogHeight));

				$dialogContent.scrollTop(dialogContentScrollTop);
			}

			// IE and EDGE have specific container behavior (e.g. div with 500px width is about 15px smaller when it has vertical scrollbar
			if ((oBrowser.internet_explorer || oBrowser.edge) &&		// apply width only:
				(!sContentWidth || sContentWidth == 'auto') &&			// - when the developer hasn't set it explicitly
				!this.getStretch() && 									// - when the dialog is not stretched
				dialogClientWidth <  $dialogContent[0].scrollWidth &&	// - if dialog width is smaller than scroll width
				$dialogContent.width() < maxDialogWidth) {				// - if the dialog can't grow anymore
				var iVerticalScrollBarWidth = $dialogContent.width() - dialogClientWidth;
				$dialogContent.css({
					width: Math.min($dialogContent.width() + iVerticalScrollBarWidth, maxDialogWidth) + "px"
				});
			}

			if (!this.getStretch() && !this._oManuallySetSize && !this._bDisableRepositioning) {
				this._applyCustomTranslate();
			}

			if (Device.browser.chrome) {
				// Force repaint of footer to workaround Chrome issue -> 1670422577
				var $Footer = this.$("footer");
				$Footer.css("height", "auto");
				setTimeout(function(){
					$Footer.css("height", "");
				}, 10);
			}
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._applyCustomTranslate = function() {
			var $dialog = this.$(),
				sTranslateX,
				sTranslateY,
				iDialogWidth = $dialog.innerWidth(),
				iDialogHeight = $dialog.innerHeight();

			if (Device.system.desktop && (iDialogWidth % 2 !== 0 || iDialogHeight % 2 !== 0)) {
				if (!this._bRTL) {
					sTranslateX = '-' + Math.floor(iDialogWidth / 2) + "px";
				} else {
					sTranslateX = Math.floor(iDialogWidth / 2) + "px";
				}

				sTranslateY = '-' + Math.floor(iDialogHeight / 2) + "px";
				$dialog.css('transform', 'translate(' + sTranslateX + ',' + sTranslateY + ') scale(1)');
			} else {
				$dialog.css('transform', '');
			}
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._createHeader = function () {
			if (!this._header) {
				// set parent of header to detect changes on title
				this._header = new Bar(this.getId() + "-header").addStyleClass("sapMDialogTitle");
				this.setAggregation("_header", this._header, false);
			}
		};

		/**
		 * If a scrollable control (sap.m.NavContainer, sap.m.ScrollContainer, sap.m.Page, sap.m.SplitContainer) is added to dialog's content aggregation as a single child or through one or more sap.ui.mvc.View instances,
		 * the scrolling inside dialog will be disabled in order to avoid wrapped scrolling areas.
		 *
		 * If more than one scrollable control is added to dialog, the scrolling needs to be disabled manually.
		 * @private
		 */
		Dialog.prototype._hasSingleScrollableContent = function () {
			var aContent = this.getContent(), i;

			while (aContent.length === 1 && aContent[0] instanceof sap.ui.core.mvc.View) {
				aContent = aContent[0].getContent();
			}

			if (aContent.length === 1) {
				for (i = 0; i < this._scrollContentList.length; i++) {
					if (aContent[0] instanceof sap.m[this._scrollContentList[i]]) {
						return true;
					}
				}
			}

			return false;
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._initBlockLayerAnimation = function () {
			this.oPopup._hideBlockLayer = function () {
				var $blockLayer = jQuery("#sap-ui-blocklayer-popup");
				$blockLayer.removeClass("sapMDialogTransparentBlk");
				Popup.prototype._hideBlockLayer.call(this);
			};
		};

		/**
		 *
		 * @private
		 */
		Dialog.prototype._clearBlockLayerAnimation = function () {
			if (jQuery.device.is.iphone && !this._bMessageType) {
				delete this.oPopup._showBlockLayer;
				this.oPopup._hideBlockLayer = function () {
					var $blockLayer = jQuery("#sap-ui-blocklayer-popup");
					$blockLayer.removeClass("sapMDialogTransparentBlk");
					Popup.prototype._hideBlockLayer.call(this);
				};
			}
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

		// The control that needs to be focused after dialog is open is calculated in following sequence:
		// initialFocus, first focusable element in content area, beginButton, endButton
		// dialog is always modal so the focus doen't need to be on the dialog when there's
		// no initialFocus, beginButton and endButton available, but to keep the consistency,
		// the focus will in the end fall back to dialog itself.
		/**
		 *
		 * @private
		 */
		Dialog.prototype._setInitialFocus = function () {
			var sFocusId = this._getFocusId();
			var oControl = sap.ui.getCore().byId(sFocusId);
			var oFocusDomRef;

			if (oControl) {
				//if someone tries to focus an existing but not visible control, focus the Dialog itself.
				if (oControl.getVisible && !oControl.getVisible()) {
					this.focus();
					return;
				}

				oFocusDomRef = oControl.getFocusDomRef();
			}

			oFocusDomRef = oFocusDomRef || jQuery.sap.domById(sFocusId);

			// if focus dom ref is not found
			if (!oFocusDomRef) {
				this.setInitialFocus(""); // clear the saved initial focus
				oFocusDomRef = sap.ui.getCore().byId(this._getFocusId()); // recalculate the element on focus
			}

			//if there is no set initial focus, set the default one to the initialFocus association
			if (!this.getInitialFocus()) {
				this.setAssociation('initialFocus', oFocusDomRef ? oFocusDomRef.id : this.getId(), true);
			}

			// Setting focus to DOM Element which can open the on screen keyboard on mobile device doesn't work
			// consistently across devices. Therefore setting focus to those elements are disabled on mobile devices
			// and the keyboard should be opened by the User explicitly
			if (Device.system.desktop || (oFocusDomRef && !/input|textarea|select/i.test(oFocusDomRef.tagName))) {
				jQuery.sap.focus(oFocusDomRef);
			} else {
				// Set the focus to the popup itself in order to keep the tab chain
				this.focus();
			}
		};

		/**
		 * Returns the sap.ui.core.ScrollEnablement delegate which is used with this control.
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
		 * Returns the custom header instance when the customHeader aggregation is set. Otherwise it returns the internal managed
		 * header instance. This method can be called within composite controls which use sap.m.Dialog inside.
		 *
		 * @protected
		 */
		Dialog.prototype._getAnyHeader = function () {
			var oCustomHeader = this.getCustomHeader();

			if (oCustomHeader) {
				return oCustomHeader;
			} else {
				var bShowHeader = this.getShowHeader();

				// if showHeader is set to false and not for standard dialog in iOS in theme sap_mvi, no header.
				if (!bShowHeader) {
					return null;
				}

				this._createHeader();
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
			//This can be removed and the layout change to flex when the support for IE9 is dropped
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
				this._oToolbar = new AssociativeOverflowToolbar(this.getId() + "-footer").addStyleClass("sapMTBNoBorders").applyTagAndContextClassFor("footer");
				this._oToolbar._isControlsInfoCached = function () {
					return false;
				};

				this.setAggregation("_toolbar", this._oToolbar);
			}

			return this._oToolbar;
		};

		/**
		 * Returns the sap.ui.core.ValueState state according to the language settings
		 * @param {sap.ui.core.ValueState|string} sValueState The dialog's value state
		 * @returns {string} The translated text
		 * @private
		 */
		Dialog.prototype.getValueStateString = function (sValueState) {
			var rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			switch (sValueState) {
				case (sap.ui.core.ValueState.Success):
					return rb.getText("LIST_ITEM_STATE_SUCCESS");
				case (sap.ui.core.ValueState.Warning):
					return rb.getText("LIST_ITEM_STATE_WARNING");
				case (sap.ui.core.ValueState.Error):
					return rb.getText("LIST_ITEM_STATE_ERROR");
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

		//Manage "sapMDialogWithSubHeader" class depending on the visibility of the subHeader
		//This is because the dialog has content height and width and the box-sizing have to be content-box in
		//order to not recalculate the size with js
		Dialog.prototype.setSubHeader = function (oControl) {
			this.setAggregation("subHeader", oControl);

			if (oControl) {
				oControl.setVisible = function (isVisible) {
					this.$().toggleClass('sapMDialogWithSubHeader', isVisible);
					oControl.setProperty("visible", isVisible);
				}.bind(this);
			}

			return oControl;
		};

		//The public setters and getters should not be documented via JSDoc because they will appear in the explored app

		Dialog.prototype.setLeftButton = function (vButton) {
			if (!(vButton instanceof sap.m.Button)) {
				vButton = sap.ui.getCore().byId(vButton);
			}

			//setting leftButton will also set the beginButton with the same button instance.
			//as this instance is aggregated by the beginButton, the hidden aggregation isn't needed.
			this.setBeginButton(vButton);
			return this.setAssociation("leftButton", vButton);
		};

		Dialog.prototype.setRightButton = function (vButton) {
			if (!(vButton instanceof sap.m.Button)) {
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

		//get buttons should return the buttons, beginButton and endButton aggregations
		Dialog.prototype.getAggregation = function (sAggregationName, oDefaultForCreation, bPassBy) {
			var originalResponse = Control.prototype.getAggregation.apply(this, Array.prototype.slice.call(arguments, 0, 2));

			//if no buttons are set returns the begin and end buttons
			if (sAggregationName === 'buttons' && originalResponse.length === 0) {
				this.getBeginButton() && originalResponse.push(this.getBeginButton());
				this.getEndButton() && originalResponse.push(this.getEndButton());
			}

			return originalResponse;
		};

		Dialog.prototype.getAriaLabelledBy = function() {
			var header = this._getAnyHeader(),
				// Due to a bug in getAssociation in ManagedObject slice the Array
				// Remove slice when the bug is fixed.
				labels = this.getAssociation("ariaLabelledBy", []).slice();

			var subHeader = this.getSubHeader();
			if (subHeader) {
				labels.unshift(subHeader.getId());
			}

			if (header) {
				labels.unshift(header.getId());
			}

			return labels;
		};

		Dialog.prototype.setTitle = function (sTitle) {
			this.setProperty("title", sTitle, true);

			if (this._headerTitle) {
				this._headerTitle.setText(sTitle);
			} else {
				this._headerTitle = new sap.m.Title(this.getId() + "-title", {
					text: sTitle,
					level: "H1"
				}).addStyleClass("sapMDialogTitle");

				this._createHeader();
				this._header.addContentMiddle(this._headerTitle);
			}
			return this;
		};

		Dialog.prototype.setCustomHeader = function (oCustomHeader) {
			if (oCustomHeader) {
				oCustomHeader.addStyleClass("sapMDialogTitle");
			}
			this.setAggregation("customHeader", oCustomHeader);
		};

		Dialog.prototype.setState = function (sState) {
			var mFlags = {},
				$this = this.$(),
				sName;
			mFlags[sState] = true;

			this.setProperty("state", sState, true);

			for (sName in Dialog._mStateClasses) {
				$this.toggleClass(Dialog._mStateClasses[sName], !!mFlags[sName]);
			}
			this.setIcon(Dialog._mIcons[sState], true);
			return this;
		};

		Dialog.prototype.setIcon = function (sIcon, bInternal) {
			if (!bInternal) {
				this._externalIcon = sIcon;
			} else {
				if (this._externalIcon) {
					sIcon = this._externalIcon;
				}
			}

			if (sIcon) {
				if (sIcon !== this.getIcon()) {
					if (this._iconImage) {
						this._iconImage.setSrc(sIcon);
					} else {
						this._iconImage = IconPool.createControlByURI({
							id: this.getId() + "-icon",
							src: sIcon,
							useIconTooltip: false
						}, sap.m.Image).addStyleClass("sapMDialogIcon");

						this._createHeader();
						this._header.insertAggregation("contentMiddle", this._iconImage, 0);
					}
				}
			} else {
				var sDialogState = this.getState();
				if (!bInternal && sDialogState !== ValueState.None) {
					if (this._iconImage) {
						this._iconImage.setSrc(Dialog._mIcons[sDialogState]);
					}
				} else {
					if (this._iconImage) {
						this._iconImage.destroy();
						this._iconImage = null;
					}
				}
			}

			this.setProperty("icon", sIcon, true);
			return this;
		};

		Dialog.prototype.setType = function (sType) {
			var sOldType = this.getType();
			if (sOldType === sType) {
				return this;
			}
			this._bMessageType = (sType === sap.m.DialogType.Message);
			return this.setProperty("type", sType, false);
		};

		Dialog.prototype.setStretch = function (bStretch) {
			this._bStretchSet = true;
			return this.setProperty("stretch", bStretch);
		};

		Dialog.prototype.setStretchOnPhone = function (bStretchOnPhone) {
			if (this._bStretchSet) {
				jQuery.sap.log.warning("sap.m.Dialog: stretchOnPhone property is deprecated. Setting stretchOnPhone property is ignored when there's already stretch property set.");
				return this;
			}
			this.setProperty("stretchOnPhone", bStretchOnPhone);
			return this.setProperty("stretch", bStretchOnPhone && Device.system.phone);
		};

		Dialog.prototype.setVerticalScrolling = function (bValue) {
			var bOldValue = this.getVerticalScrolling(),
				bHasSingleScrollableContent = this._hasSingleScrollableContent();

			if (bHasSingleScrollableContent) {
				jQuery.sap.log.warning("sap.m.Dialog: property verticalScrolling automatically reset to false. See documentation.");
				bValue = false;
			}

			if (bOldValue === bValue) {
				return this;
			}

			this.$().toggleClass("sapMDialogVerScrollDisabled", !bValue);
			this.setProperty("verticalScrolling", bValue);

			if (this._oScroller) {
				this._oScroller.setVertical(bValue);
			}

			return this;
		};

		Dialog.prototype.setHorizontalScrolling = function (bValue) {
			var bOldValue = this.getHorizontalScrolling(),
				bHasSingleScrollableContent = this._hasSingleScrollableContent();

			if (bHasSingleScrollableContent) {
				jQuery.sap.log.warning("sap.m.Dialog: property horizontalScrolling automatically reset to false. See documentation.");
				bValue = false;
			}

			if (bOldValue === bValue) {
				return this;
			}

			this.$().toggleClass("sapMDialogHorScrollDisabled", !bValue);
			this.setProperty("horizontalScrolling", bValue);

			if (this._oScroller) {
				this._oScroller.setHorizontal(bValue);
			}

			return this;
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
					this._bDisableRepositioning = false;
					this._oManuallySetPosition = null;
					this._oManuallySetSize = null;

					//call the reposition
					this.oPopup && this.oPopup._applyPosition(this.oPopup._oLastPosition, true);
					this._$dialog.removeClass('sapMDialogTouched');
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
				var fnMouseMoveHandler = function (action) {
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

				if ((isHeaderClicked(e.target) && this.getDraggable()) || bResize) {
					that._bDisableRepositioning = true;

					that._$dialog.addClass('sapDialogDisableTransition');
					//remove the transform translate
					that._$dialog.addClass('sapMDialogTouched');

					that._oManuallySetPosition = {
						x: initial.position.x,
						y: initial.position.y
					};

					//set the new position of the dialog on mouse down when the transform is disabled by the class
					that._$dialog.css({
						left: Math.min(Math.max(0, that._oManuallySetPosition.x), windowWidth - initial.width),
						top: Math.min(Math.max(0, that._oManuallySetPosition.y), windowHeight - initial.height),
						transform: ""
					});
				}

				if (isHeaderClicked(e.target) && this.getDraggable()) {
					$w.on("mousemove", function (event) {
						fnMouseMoveHandler(function () {
							that._bDisableRepositioning = true;

							that._oManuallySetPosition = {
								x: event.pageX - e.pageX + initial.position.x, // deltaX + initial dialog position
								y: event.pageY - e.pageY + initial.position.y // deltaY + initial dialog position
							};

							//move the dialog
							that._$dialog.css({
								left: Math.min(Math.max(0, that._oManuallySetPosition.x), windowWidth - initial.width),
								top: Math.min(Math.max(0, that._oManuallySetPosition.y), windowHeight - initial.outerHeight),
								transform: ""
							});
						});
					});
				} else if (bResize) {

					that._$dialog.addClass('sapMDialogResizing');

					var styles = {};
					var minWidth = parseInt(that._$dialog.css('min-width'), 10);
					var maxLeftOffset = initial.x + initial.width - minWidth;

					var handleOffsetX = $target.width() - e.offsetX;
					var handleOffsetY = $target.height() - e.offsetY;

					$w.on("mousemove", function (event) {
						fnMouseMoveHandler(function () {
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
								styles.transform = "";
								that._oManuallySetSize.width = initial.width + initial.x - Math.max(event.pageX, 0);
							}

							styles.width = that._oManuallySetSize.width;
							styles.height = that._oManuallySetSize.height;

							that._$dialog.css(styles);
						});
					});
				} else {
					return;
				}

				$w.on("mouseup", function () {
					var $dialog = that.$(),
						$dialogContent = that.$('cont'),
						dialogHeight,
						dialogBordersHeight;

					$w.off("mouseup mousemove");

					if (bResize) {
						that._$dialog.removeClass('sapMDialogResizing');

						// Take the height from the styles attribute of the DOM element not from the calculated height.
						// max-height is taken into account if we use calculated height and a wrong value is set for the dialog content's height.
						// If no value is set for the height style fall back to calculated height.
						// * Calculated height is the value taken by $dialog.height().
						dialogHeight = parseInt($dialog[0].style.height, 10) || parseInt($dialog.height(), 10);
						dialogBordersHeight = parseInt($dialog.css("border-top-width"), 10) + parseInt($dialog.css("border-bottom-width"), 10);
						$dialogContent.height(dialogHeight + dialogBordersHeight);
					}
				});

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

		return Dialog;

	}, /* bExport= */ true);
