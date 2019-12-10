/*!
 * ${copyright}
 */

// Provides control sap.m.MessagePopover.
sap.ui.define([
	"./ResponsivePopover",
	"./Button",
	"./Toolbar",
	"./Bar",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"./semantic/SemanticPage",
	"./Popover",
	"./MessageView",
	"sap/ui/Device",
	"./MessagePopoverRenderer",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
],
function(
	ResponsivePopover,
	Button,
	Toolbar,
	Bar,
	Control,
	IconPool,
	SemanticPage,
	Popover,
	MessageView,
	Device,
	MessagePopoverRenderer,
	Log,
	jQuery
) {
		"use strict";

		/**
		 * Constructor for a new MessagePopover.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * A <code>MessagePopover</code> is used to display a summarized list of different types of messages (error, warning, success, and information messages).
		 *
		 * <h3>Overview</h3>
	 	 *
		 * It provides a handy and systematized way to navigate and explore details for every message.
		 * It is adaptive and responsive.
		 * It renders as a dialog with a Close button in the header on phones, and as a popover on tablets and higher resolution devices.
		 * It also exposes an event {@link sap.m.MessagePopover#event:activeTitlePress}, which can be used for navigation from a message to the source of the issue.
		 * <h3>Notes:</h3>
		 * <ul>
		 * <li> If your application changes its model between two interactions with the <code>MessagePopover</code>, this could lead to outdated messages being shown.
		 * To avoid this, you need to call <code>navigateBack</code> when the model is updated.</li>
		 * <li> Messages can have descriptions preformatted with HTML markup. In this case, the <code>markupDescription</code> has to be set to <code>true</code>.</li>
		 * <li> If the message cannot be fully displayed or includes a long description, the <code>MessagePopover</code> provides navigation to the detailed description.</li>
		 * </ul>
		 * <h3>Structure</h3>
		 * The <code>MessagePopover</code> stores all messages in an aggregation of type {@link sap.m.MessageItem} named <code>items</code>.
		 *
		 * A set of properties determines how the items are rendered:
		 * <ul>
		 * <li> counter - An integer that is used to indicate the number of errors for each type. </li>
		 * <li> type - The type of message. </li>
		 * <li> title/subtitle - The title and subtitle of the message.</li>
		 * <li> description - The long text description of the message.</li>
		 * <li> activeTitle - Determines whether the title of the item is interactive.</li>
		 * </ul>
		 * <h3>Usage</h3>
		 * <h4>When to use:</h4>
		 * <ul>
		 * <li>When you want to make sure that all content is visible on any device.</li>
		 * <li>When you want a way to centrally manage messages and show them to the user without additional work for the developer.
		 * The <code>MessagePopover</code> is triggered from a messaging button in the footer toolbar. If an error has occurred at any validation point,
		 * the total number of messages should be incremented, but the user's work shouldn't be interrupted.
		 * Navigation between the message item and the source of the error can be created, if needed by the application.
		 * This can be done by setting the <code>activeTitle</code> property to <code>true</code> and providing a handler for the <code>activeTitlePress</code> event.
		 * In addition, you can achieve the same functionality inside a different container using the {@link sap.m.MessageView} control.</li>
		 * </ul>
		 * <h3>Responsive Behavior</h3>
		 * On mobile phones, the <code>MessagePopover</code> is automatically shown in full screen mode.<br>
		 * On desktop and tablet, the message popover opens in a popover.<br>
		 * On desktop the opened popover is resizable, if it is placed in a {@link sap.m.Toolbar}, {@link sap.m.Bar}, or used in {@link sap.m.semantic.SemanticPage}.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.28
		 * @alias sap.m.MessagePopover
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/message-popover/ Message Popover}
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var MessagePopover = Control.extend("sap.m.MessagePopover", /** @lends sap.m.MessagePopover.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Callback function for resolving a promise after description has been asynchronously loaded inside this function.
					 * You can use this function in order to validate the description before displaying it.
					 * @callback sap.m.MessagePopover~asyncDescriptionHandler
					 * @param {object} config A single parameter object
					 * @param {MessagePopoverItem} config.item Reference to respective MessagePopoverItem instance
					 * @param {object} config.promise Object grouping a promise's reject and resolve methods
					 * @param {function} config.promise.resolve Method to resolve promise
					 * @param {function} config.promise.reject Method to reject promise
					 */
					asyncDescriptionHandler: {type: "any", group: "Behavior", defaultValue: null},

					/**
					 * Callback function for resolving a promise after a link has been asynchronously validated inside this function.
					 * You can use this function in order to validate URLs before displaying them inside the description.
					 * @callback sap.m.MessagePopover~asyncURLHandler
					 * @param {object} config A single parameter object
					 * @param {string} config.url URL to validate
					 * @param {string|int} config.id ID of the validation job
					 * @param {object} config.promise Object grouping a promise's reject and resolve methods
					 * @param {function} config.promise.resolve Method to resolve promise
					 * @param {function} config.promise.reject Method to reject promise
					 */
					asyncURLHandler: {type: "any", group: "Behavior", defaultValue: null},

					/**
					 * Determines the position, where the control will appear on the screen.
					 * The default value is <code>sap.m.VerticalPlacementType.Vertical</code>. Setting this property while the control is open, will not cause any re-rendering and changing of the position. Changes will only be applied with the next interaction.
					 */
					placement: {type: "sap.m.VerticalPlacementType", group: "Behavior", defaultValue: "Vertical"},

					/**
					 * Sets the initial state of the control - expanded or collapsed. By default the control opens as expanded.
					 * Note: If there is only one message in the control, this state will be ignored and the details page of the message will be shown.
					 */
					initiallyExpanded: {type: "boolean", group: "Behavior", defaultValue: true},

					/**
					 * Defines whether the MessageItems are grouped or not.
					 */
					groupItems: { type: "boolean", group: "Behavior", defaultValue: false }
				},
				defaultAggregation: "items",
				aggregations: {
					/**
					 * A list with message items.
					 */
					items: {type: "sap.m.MessageItem", altTypes: ["sap.m.MessagePopoverItem"], multiple: true, singularName: "item"},

					/**
					 * Sets a custom header button.
					 */
					headerButton: {type: "sap.m.Button", multiple: false, forwarding: {idSuffix: "-messageView", aggregation: "headerButton"}}
				},
				events: {
					/**
					 * Event fired after the popover is opened.
					 */
					afterOpen: {
						parameters: {
							/**
							 * Refers to the control that opens the popover.
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * Event fired after the popover is closed.
					 */
					afterClose: {
						parameters: {
							/**
							 * Refers to the control that opens the popover.
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * Event fired before the popover is opened.
					 */
					beforeOpen: {
						parameters: {
							/**
							 * Refers to the control that opens the popover.
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * Event fired before the popover is closed.
					 */
					beforeClose: {
						parameters: {
							/**
							 * Refers to the control that opens the popover.
							 * See {@link sap.ui.core.MessageType} enum values for types.
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * Event fired when description is shown.
					 */
					itemSelect: {
						parameters: {
							/**
							 * Refers to the <code>MessagePopover</code> item that is being presented.
							 */
							item: {type: "sap.m.MessagePopoverItem"},
							/**
							 * Refers to the type of messages being shown.
							 */
							messageTypeFilter: {type: "sap.ui.core.MessageType"}

						}
					},

					/**
					 * Event fired when one of the lists is shown when (not) filtered  by type.
					 */
					listSelect: {
						parameters: {
							/**
							 * This parameter refers to the type of messages being shown.
							 */
							messageTypeFilter: {type: "sap.ui.core.MessageType"}
						}
					},

					/**
					 * Event fired when the long text description data from a remote URL is loaded.
					 */
					longtextLoaded: {},

					/**
					 * Event fired when a validation of a URL from long text description is ready.
					 */
					urlValidated: {},

					/**
					 * Event fired when an active title of a <code>MessageItem</code> is clicked.
					 * @since 1.58
					 */
					activeTitlePress: {
						parameters: {
							/**
							 * Refers to the message item that contains the activeTitle.
							 */
							item: { type: "sap.m.MessageItem" }
						}
					}
				}
			}
		});


		function capitalize(sName) {
			return sName.charAt(0).toUpperCase() + sName.slice(1);
		}

		var CSS_CLASS = "sapMMsgPopover",
			DEFAULT_CONTENT_HEIGHT = "320px",
			DEFAULT_CONTENT_WIDTH = "440px",
			ICONS = {
				back: IconPool.getIconURI("nav-back"),
				close: IconPool.getIconURI("decline"),
				information: IconPool.getIconURI("message-information"),
				warning: IconPool.getIconURI("message-warning"),
				error: IconPool.getIconURI("message-error"),
				success: IconPool.getIconURI("message-success")
			},
			// Property names array
			ASYNC_HANDLER_NAMES = ["asyncDescriptionHandler", "asyncURLHandler"],
			// Private class variable used for static method below that sets default async handlers
			DEFAULT_ASYNC_HANDLERS = {
				asyncDescriptionHandler: function (config) {
					var sLongTextUrl = config.item.getLongtextUrl();
					if (sLongTextUrl) {
						jQuery.ajax({
							type: "GET",
							url: sLongTextUrl,
							success: function (data) {
								config.item.setDescription(data);
								config.promise.resolve();
							},
							error: function() {
								var sError = "A request has failed for long text data. URL: " + sLongTextUrl;
								Log.error(sError);
								config.promise.reject(sError);
							}
						});
					}
				}
			};

		/**
		 * Setter for default description and URL validation callbacks across all instances of MessagePopover
		 * @static
		 * @protected
		 * @param {object} mDefaultHandlers An object setting default callbacks
		 * @param {function} mDefaultHandlers.asyncDescriptionHandler The description handler
		 * @param {function} mDefaultHandlers.asyncURLHandler The URL handler
		 */
		MessagePopover.setDefaultHandlers = function (mDefaultHandlers) {
			ASYNC_HANDLER_NAMES.forEach(function (sFuncName) {
				if (mDefaultHandlers.hasOwnProperty(sFuncName)) {
					DEFAULT_ASYNC_HANDLERS[sFuncName] = mDefaultHandlers[sFuncName];
				}
			});
		};

		/*
		 * =========================================
		 * Lifecycle methods
		 * =========================================
		 */

		/**
		 * Initializes the control
		 *
		 * @override
		 * @private
		 */
		MessagePopover.prototype.init = function () {
			var that = this;
			var oPopupControl;
			this._oOpenByControl = null;

			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			this._oMessageView = this._initMessageView();

			this._oMessageView.addEventDelegate({
				onBeforeRendering: function () {
					var bSegmentedButtonVisibleInMV = that._oMessageView._oSegmentedButton.getVisible(),
						bShowHeader = !that.getInitiallyExpanded() || bSegmentedButtonVisibleInMV;

					that._oMessageView._oSegmentedButton.setVisible(bShowHeader);
					that._oMessageView._listPage.setShowHeader(true);
				}
			});

			// insert the close buttons in both list and details pages as the MessageView
			// doesn't know it is being created in Popover
			this._insertCloseBtn(this._oMessageView._oListHeader);
			this._insertCloseBtn(this._oMessageView._oDetailsHeader);

			this._oMessageView._oSegmentedButton.attachEvent("select", this._onSegButtonSelect, this);

			this._oPopover = new ResponsivePopover(this.getId() + "-messagePopover", {
				showHeader: false,
				contentWidth: DEFAULT_CONTENT_WIDTH,
				contentHeight: DEFAULT_CONTENT_HEIGHT,
				placement: this.getPlacement(),
				showCloseButton: false,
				verticalScrolling: false,
				horizontalScrolling: false,
				modal: false,
				afterOpen: function (oEvent) {
					that.fireAfterOpen({openBy: oEvent.getParameter("openBy")});
				},
				afterClose: function (oEvent) {
					that._oMessageView._navContainer.backToTop();
					that.fireAfterClose({openBy: oEvent.getParameter("openBy")});
				},
				beforeOpen: function (oEvent) {
					that.fireBeforeOpen({openBy: oEvent.getParameter("openBy")});
				},
				beforeClose: function (oEvent) {
					that.fireBeforeClose({openBy: oEvent.getParameter("openBy")});
				}
			}).addStyleClass(CSS_CLASS);

			this._oPopover._setAriaModal(false);
			this._oPopover.addContent(this._oMessageView);
			this._oPopover.addAssociation("ariaLabelledBy", this.getId() + "-messageView-HeadingDescr", true);

			oPopupControl = this._oPopover.getAggregation("_popup");
			oPopupControl.oPopup.setAutoClose(false);
			oPopupControl.addEventDelegate({
				onBeforeRendering: this.onBeforeRenderingPopover,
				onAfterRendering: this.onAfterRenderingPopover
			}, this);

			if (Device.system.phone) {
				this._oPopover.setBeginButton(new Button({
					text: this._oResourceBundle.getText("MESSAGEPOPOVER_CLOSE"),
					press: this.close.bind(this)
				}));
			}

			// Check for default async handlers and set them appropriately
			ASYNC_HANDLER_NAMES.forEach(function (sFuncName) {
				if (DEFAULT_ASYNC_HANDLERS.hasOwnProperty(sFuncName)) {
					this['set' + capitalize(sFuncName)](DEFAULT_ASYNC_HANDLERS[sFuncName]);
				}
			}, this);
		};

		MessagePopover.prototype.onBeforeRendering = function () {
			if (this.getDependents().indexOf(this._oPopover) === -1) {
				this.addDependent(this._oPopover);
			}
			this._oPopover.setPlacement(this.getPlacement());
		};

		/**
		 * Required adaptations before rendering MessagePopover
		 *
		 * @private
		 */
		MessagePopover.prototype.onBeforeRenderingPopover = function () {
			// If there is no item's binding given - it should happen automatically in the MessageView
			// However for backwards compatibility we need to have the same binding on the MessagePopover
			// TODO: Decide what to do in this case
			/*if (!this.getBinding("items") && this._oMessageView.getBinding("items")) {
				this.bindAggregation("items", this._oMessageView.getBindingInfo("items"));
			}*/

			// Update MV only if 'items' aggregation is changed
			if (this._bItemsChanged) {
				var items = this.getItems();
				var that = this;

				this._oMessageView.destroyItems();

				items.forEach(function (item) {
					// we need to know if the MessagePopover's item was changed so to
					// update the MessageView's items as well
					item._updateProperties(function () {
						that._bItemsChanged = true;
					});

					// we need to clone the item along with its bindings and aggregations
					this._oMessageView.addItem(item.clone("", "", {
						cloneChildren: true,
						cloneBinding: true
					}));
				}, this);

				this._bItemsChanged = false;
			}

			this._setInitialFocus();

			// If for some reason the control that opened the popover
			// is destroyed or no longer visible in the DOM
			// we should close the popover as its position cannot be determined anymore
			if (this._oOpenByControl && !this._oOpenByControl.getVisible()) {
				this._oPopover.close();
			}

			this._syncMessageView();
		};

		/**
		 * Required adaptations after rendering MessagePopover
		 *
		 * @private
		 */
		MessagePopover.prototype.onAfterRenderingPopover = function () {
			// Because we remove the items from the MessageView and fill it in with new items
			// every time something is changed - we need to update the id of the element which
			// will receive the focus given by the Popover control.
			// First we need to check if such id is stored in the MessagePopover -> ResponsivePopover -> Popover control
			if (this._oPopover._oControl._sFocusControlId) {
				// then we remove any stored item id because it no longer exists after the re-rendering.
				this._oPopover._oControl._sFocusControlId = null;
			}
		};

		/**
		 * Called when the control is destroyed
		 *
		 * @private
		 */
		MessagePopover.prototype.exit = function () {
			this._oResourceBundle = null;
			this._oOpenByControl = null;

			if (this._oMessageView) {
				this._oMessageView.destroy();
				this._oMessageView = null;
			}

			// Destroys ResponsivePopover control that is used by MessagePopover
			// This will walk through all aggregations in the Popover and destroy them (in our case this is NavContainer)
			// Next this will walk through all aggregations in the NavContainer, etc.
			if (this._oPopover) {
				this._oPopover.destroy();
				this._oPopover = null;
			}
		};

		/**
		 * Opens the MessagePopover
		 *
		 * @param {sap.ui.core.Control} oControl Control which opens the MessagePopover
		 * @returns {sap.m.MessagePopover} Reference to the 'this' for chaining purposes
		 * @public
		 * @ui5-metamodel
		 */
		MessagePopover.prototype.openBy = function (oControl) {
			var oResponsivePopoverControl = this._oPopover.getAggregation("_popup"),
				oParent = oControl.getParent();

			this._oOpenByControl = oControl;

			// If MessagePopover is opened from an instance of sap.m.Toolbar and is instance of sap.m.Popover remove the Arrow
			if (oResponsivePopoverControl instanceof Popover) {
				if ((oParent instanceof Toolbar || oParent instanceof Bar || oParent instanceof SemanticPage)) {
					oResponsivePopoverControl._minDimensions = {
						width: 400,
						height: 128
					};
					oResponsivePopoverControl.setShowArrow(false);
					oResponsivePopoverControl.setResizable(true);
				} else {
					oResponsivePopoverControl.setShowArrow(true);
				}
			}

			if (this._oPopover) {
				this._restoreExpansionDefaults();

				this._oPopover.openBy(oControl);
			}

			return this;
		};

		/**
		 * Closes the MessagePopover
		 *
		 * @returns {sap.m.MessagePopover} Reference to the 'this' for chaining purposes
		 * @public
		 */
		MessagePopover.prototype.close = function () {
			if (this._oPopover) {
				this._oPopover.close();
			}

			return this;
		};

		/**
		 * The method checks if the MessagePopover is open. It returns true when the MessagePopover is currently open
		 * (this includes opening and closing animations), otherwise it returns false
		 *
		 * @public
		 * @returns {boolean} Whether the MessagePopover is open
		 */
		MessagePopover.prototype.isOpen = function () {
			return this._oPopover.isOpen();
		};

		/**
		 * This method toggles between open and closed state of the MessagePopover instance.
		 * oControl parameter is mandatory in the same way as in 'openBy' method
		 *
		 * @param {sap.ui.core.Control} oControl Control which opens the MessagePopover
		 * @returns {sap.m.MessagePopover} Reference to the 'this' for chaining purposes
		 * @public
		 */
		MessagePopover.prototype.toggle = function (oControl) {
			if (this.isOpen()) {
				this.close();
			} else {
				this.openBy(oControl);
			}

			return this;
		};

		MessagePopover.prototype.getDomRef = function (sSuffix) {
			return this._oPopover && this._oPopover.getAggregation("_popup").getDomRef(sSuffix);
		};

		/*
		 * =========================================
		 * Internal methods
		 * =========================================
		 */

		/**
		 * Creates new internal MessageView control
		 *
		 * @returns {sap.m.MessageView} The newly instantiated message view control
		 * @private
		 */
		MessagePopover.prototype._initMessageView = function () {
			var that = this,
				oMessageView;

			oMessageView = new MessageView(this.getId() + "-messageView", {
				activeTitlePress: function (oEvent) {
					//close the Popover on mobile before navigating because it is on fullscreen
					if (Device.system.phone) {
						that.close();
					}
					that.fireActiveTitlePress({ item: oEvent.getParameter("item")});
				},
				listSelect: function(oEvent) {
					that.fireListSelect({messageTypeFilter: oEvent.getParameter('messageTypeFilter')});
				},
				itemSelect: function(oEvent) {
					that.fireItemSelect({
						messageTypeFilter: oEvent.getParameter('messageTypeFilter'),
						item: oEvent.getParameter('item')
					});
				},
				longtextLoaded: function() {
					that.fireLongtextLoaded();
				},
				urlValidated: function() {
					that.fireUrlValidated();
				}
			});

			// The MessagePopover wraps entirely the MessageView, therefore these checks should be done
			// from the perspective of MessagePopover instead of MessageView
			oMessageView._makeAutomaticBinding = function () {
				var aItems = that.getItems();

				if (!that.getBindingInfo("items") && !aItems.length) {
					this._bindToMessageModel(); // MessageView's scope
				}
			};

			return oMessageView;
		};

		MessagePopover.prototype._onSegButtonSelect = function () {
			// expanding the message popover if it is still collapsed
			if (this.isOpen() && !this.getInitiallyExpanded() && this._oPopover.hasStyleClass(CSS_CLASS + "-init")) {
				this._expandMsgPopover();
			}
		};

		/**
		 * Restores the state defined by the initiallyExpanded property of the MessagePopover
		 * @private
		 */
		MessagePopover.prototype._restoreExpansionDefaults = function () {
			if (!this.getInitiallyExpanded() && this.getItems().length != 1) {
				this._collapseMsgPopover();
				this._oMessageView._oSegmentedButton.setSelectedButton("none");
			} else {
				this._expandMsgPopover();
			}
		};

		/**
		 * Expands the MessagePopover so that the width and height are with their default values
		 * @private
		 */
		MessagePopover.prototype._expandMsgPopover = function () {
			var sDomHeight,
				sHeight = DEFAULT_CONTENT_HEIGHT,
				sDomHeight = this._oPopover.$("cont").css("height");

			if (this.getInitiallyExpanded() && sDomHeight !== "0px") {
				sHeight = parseFloat(sDomHeight) ? sDomHeight : sHeight;
			}

			this._oPopover
				.setContentHeight(sHeight)
				.removeStyleClass(CSS_CLASS + "-init");
		};

		/**
		 * Sets the height of the MessagePopover to auto so that only the header with
		 * the SegmentedButton is visible
		 * @private
		 */
		MessagePopover.prototype._collapseMsgPopover = function () {
			this._oPopover
				.addStyleClass(CSS_CLASS + "-init")
				.setContentHeight("auto");
		};

		/**
		 * Inserts Close button in the provided location
		 *
		 * @param {sap.ui.core.Control} oInsertCloseBtnHere The object in which we want to insert the control
		 * @private
		 */
		MessagePopover.prototype._insertCloseBtn = function (oInsertCloseBtnHere) {
			var sCloseBtnDescr = this._oResourceBundle.getText("MESSAGEPOPOVER_CLOSE"),
				oCloseBtn = new Button({
				icon: ICONS["close"],
				visible: !Device.system.phone,
				tooltip: sCloseBtnDescr,
				press: this.close.bind(this)
			}).addStyleClass(CSS_CLASS + "CloseBtn");

			oInsertCloseBtnHere.insertContent(oCloseBtn, 3, true);
		};

		/**
		 * Sets initial focus of the control
		 *
		 * @private
		 */
		MessagePopover.prototype._setInitialFocus = function () {
			if (this._oMessageView._isListPage() && this.getInitiallyExpanded()) {
				// if the controls state is "InitiallyExpanded: true" and
				// if current page is the list page - set initial focus to the list.
				// otherwise use default functionality built-in the popover
				this._oPopover.setInitialFocus(this._oMessageView._oLists[this._sCurrentList || 'all']);
			}
		};

		MessagePopover.prototype._syncMessageView = function () {
			this._oMessageView.setProperty('asyncDescriptionHandler', this.getAsyncDescriptionHandler(), true);
			this._oMessageView.setProperty('asyncURLHandler', this.getAsyncURLHandler(), true);
			this._oMessageView.setProperty("groupItems", this.getGroupItems(), false);
		};

		/*
		 * =========================================
		 * MessagePopover async handlers
		 * proxy methods
		 * =========================================
		 */

		MessagePopover.prototype.setModel = function(oModel, sName) {
			/* When a model is set to the MessagePopover it is propagated to all its aggregation
				Unfortunately the MessageView is not an aggregation of the MessagePopover (due to some rendering issues)
				Furthermore the MessageView is actually child of a ResponsivePopover
				Therefore once the developer set a model to the MessagePopover we need to forward it to the internal MessageView */
			this._oMessageView.setModel(oModel, sName);

			return Control.prototype.setModel.apply(this, arguments);
		};

		/**
		 * Navigates back to the list page.
		 *
		 * @public
		 */
		MessagePopover.prototype.navigateBack = function () {
			// MessagePopover is just a proxy to the MessageView
			this._oMessageView.navigateBack();
		};

		["invalidate", "addStyleClass", "removeStyleClass", "toggleStyleClass", "hasStyleClass", "getBusyIndicatorDelay",
			"setBusyIndicatorDelay", "getVisible", "setVisible", "getBusy", "setBusy"].forEach(function(sName){
			MessagePopover.prototype[sName] = function() {
				if (this._oPopover && this._oPopover[sName]) {
					var oPopover = this._oPopover;
					var res = oPopover[sName].apply(oPopover, arguments);
					return res === oPopover ? this : res;
				}
			};
		});

		// The following inherited methods of this control are extended because this control uses ResponsivePopover for rendering
		["setModel", "bindAggregation", "setAggregation", "insertAggregation", "addAggregation",
			"removeAggregation", "removeAllAggregation", "destroyAggregation"].forEach(function (sFuncName) {
				// First, they are saved for later reference
				MessagePopover.prototype["_" + sFuncName + "Old"] = MessagePopover.prototype[sFuncName];

				// Once they are called
				MessagePopover.prototype[sFuncName] = function () {
					// We immediately call the saved method first
					var result = MessagePopover.prototype["_" + sFuncName + "Old"].apply(this, arguments);

					// Then there is additional logic

					// Mark items aggregation as changed and invalidate popover to trigger rendering
					// See 'MessagePopover.prototype.onBeforeRenderingPopover'
					this._bItemsChanged = true;

					// If Popover dependency has already been instantiated ...
					if (this._oPopover) {
						// ... invalidate it
						this._oPopover.invalidate();
					}

					// If the called method is 'removeAggregation' or 'removeAllAggregation' ...
					if (["removeAggregation", "removeAllAggregation"].indexOf(sFuncName) !== -1) {
						// ... return the result of the operation
						return result;
					}

					return this;
				};
			});

		return MessagePopover;

	});