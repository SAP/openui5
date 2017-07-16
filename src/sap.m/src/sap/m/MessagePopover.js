/*!
 * ${copyright}
 */

// Provides control sap.m.MessagePopover.
sap.ui.define(["jquery.sap.global", "./ResponsivePopover", "./Button", "./Toolbar", "./ToolbarSpacer", "./Bar", "./List",
		"./StandardListItem", "./ListType" ,"./library", "sap/ui/core/Control", "./PlacementType", "sap/ui/core/IconPool",
		"sap/ui/core/HTML", "./Text", "sap/ui/core/Icon", "./SegmentedButton", "./Page", "./NavContainer",
		"./semantic/SemanticPage", "./Link" ,"./Popover", "./MessagePopoverItem", "./MessageView"],
	function (jQuery, ResponsivePopover, Button, Toolbar, ToolbarSpacer, Bar, List,
			  StandardListItem, ListType, library, Control, PlacementType, IconPool,
			  HTML, Text, Icon, SegmentedButton, Page, NavContainer, SemanticPage, Link, Popover, MessagePopoverItem,
			  MessageView) {
		"use strict";

		/**
		 * Constructor for a new MessagePopover.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A summarized list of different types of messages.
		 * <h3>Overview</h3>
		 * A message popover is used to display a summarized list of different types of messages (errors, warnings, success and information).
		 * It provides a handy and systemized way to navigate and explore details for every message.
		 * <h4>Notes:</h4>
		 * <ul>
		 * <li> Messages can have descriptions pre-formatted with HTML markup. In this case, the <code>markupDescription</code> has to be set to <code>true</code>.</li>
		 * <li> If the message cannot be fully displayed or includes a long description, the message popover provides navigation to the detailed description.</li>
		 * </ul>
		 * <h3>Structure</h3>
		 * The message popover stores all messages in an association of type {@link sap.m.MessagePopoverItem} named <code>items</code>.
		 *
		 * A set of properties determines how the items are rendered:
		 * <ul>
		 * <li> counter - An integer that is used to indicate the number of errors for each type </li>
		 * <li> type - The type of message </li>
		 * <li> title/subtitle - The title and subtitle of the message</li>
		 * <li> description - The long text description of the message</li>
		 * </ul>
		 * <h3>Usage</h3>
		 * With the message concept, MessagePopover provides a way to centrally manage messages and show them to the user without additional work for the developer.
		 * The message popover is triggered from a messaging button in the footer toolbar. If an error has occurred at any validation point,
		 * the total number of messages should be incremented, but the user's work shouldn't be interrupted.
		 * <h3>Responsive Behavior</h3>
		 * On mobile phones, the message popover is automatically shown in full screen mode.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.28
		 * @alias sap.m.MessagePopover
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var MessagePopover = Control.extend("sap.m.MessagePopover", /** @lends sap.m.MessagePopover.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Callback function for resolving a promise after description has been asynchronously loaded inside this function
					 * @callback sap.m.MessagePopover~asyncDescriptionHandler
					 * @param {object} config A single parameter object
					 * @param {MessagePopoverItem} config.item Reference to respective MessagePopoverItem instance
					 * @param {object} config.promise Object grouping a promise's reject and resolve methods
					 * @param {function} config.promise.resolve Method to resolve promise
					 * @param {function} config.promise.reject Method to reject promise
					 */
					asyncDescriptionHandler: {type: "any", group: "Behavior", defaultValue: null},

					/**
					 * Callback function for resolving a promise after a link has been asynchronously validated inside this function
					 * @callback sap.m.MessagePopover~asyncURLHandler
					 * @param {object} config A single parameter object
					 * @param {string} config.url URL to validate
					 * @param {string|Int} config.id ID of the validation job
					 * @param {object} config.promise Object grouping a promise's reject and resolve methods
					 * @param {function} config.promise.resolve Method to resolve promise
					 * @param {function} config.promise.reject Method to reject promise
					 */
					asyncURLHandler: {type: "any", group: "Behavior", defaultValue: null},

					/**
					 * Determines the position, where the control will appear on the screen. Possible values are: sap.m.VerticalPlacementType.Top, sap.m.VerticalPlacementType.Bottom and sap.m.VerticalPlacementType.Vertical.
					 * The default value is sap.m.VerticalPlacementType.Vertical. Setting this property while the control is open, will not cause any re-rendering and changing of the position. Changes will only be applied with the next interaction.
					 */
					placement: {type: "sap.m.VerticalPlacementType", group: "Behavior", defaultValue: "Vertical"},

					/**
					 * Sets the initial state of the control - expanded or collapsed. By default the control opens as expanded
					 */
					initiallyExpanded: {type: "boolean", group: "Behavior", defaultValue: true}
				},
				defaultAggregation: "items",
				aggregations: {
					/**
					 * A list with message items
					 */
					items: {type: "sap.m.MessagePopoverItem", multiple: true, singularName: "item"},

					/**
					 * A custom header button
					 */
					headerButton: {type: "sap.m.Button", multiple: false}
				},
				events: {
					/**
					 * This event will be fired after the popover is opened
					 */
					afterOpen: {
						parameters: {
							/**
							 * This refers to the control which opens the popover
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * This event will be fired after the popover is closed
					 */
					afterClose: {
						parameters: {
							/**
							 * Refers to the control which opens the popover
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * This event will be fired before the popover is opened
					 */
					beforeOpen: {
						parameters: {
							/**
							 * Refers to the control which opens the popover
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * This event will be fired before the popover is closed
					 */
					beforeClose: {
						parameters: {
							/**
							 * Refers to the control which opens the popover
							 * See sap.ui.core.MessageType enum values for types
							 */
							openBy: {type: "sap.ui.core.Control"}
						}
					},

					/**
					 * This event will be fired when description is shown
					 */
					itemSelect: {
						parameters: {
							/**
							 * Refers to the message popover item that is being presented
							 */
							item: {type: "sap.m.MessagePopoverItem"},
							/**
							 * Refers to the type of messages being shown
							 * See sap.ui.core.MessageType values for types
							 */
							messageTypeFilter: {type: "sap.ui.core.MessageType"}

						}
					},

					/**
					 * This event will be fired when one of the lists is shown when (not) filtered  by type
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
					 * This event will be fired when the long text description data from a remote URL is loaded
					 */
					longtextLoaded: {},

					/**
					 * This event will be fired when a validation of a URL from long text description is ready
					 */
					urlValidated: {}
				}
			}
		});


		function capitalize(sName) {
			return sName.charAt(0).toUpperCase() + sName.slice(1);
		}

		var CSS_CLASS = "sapMMsgPopover",
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
								jQuery.sap.log.error(sError);
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
		 * @param {function} mDefaultHandlers.asyncDescriptionHandler
		 * @param {function} mDefaultHandlers.asyncURLHandler
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

			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			this._oMessageView = this._initMessageView();
			// insert the close buttons in both list and details pages as the MessageView
			// doesn't know it is being created in Popover
			this._insertCloseBtn(this._oMessageView._oListHeader);
			this._insertCloseBtn(this._oMessageView._oDetailsHeader);

			this._oMessageView._oSegmentedButton.attachEvent("select", this._onSegButtonSelect, this);

			this._oPopover = new ResponsivePopover(this.getId() + "-messagePopover", {
				showHeader: false,
				contentWidth: "440px",
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

			this._oPopover.addContent(this._oMessageView);
			this._oPopover.addAssociation("ariaLabelledBy", this.getId() + "-messageView-HeadingDescr", true);

			oPopupControl = this._oPopover.getAggregation("_popup");
			oPopupControl.oPopup.setAutoClose(false);
			oPopupControl.addEventDelegate({
				onBeforeRendering: this.onBeforeRenderingPopover,
				onAfterRendering: this.onAfterRenderingPopover
			}, this);

			if (sap.ui.Device.system.phone) {
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

				this._oMessageView.removeAllItems();

				items.forEach(function (item) {

					// we need to know if the MessagePopover's item was changed so to
					// update the MessageView's items as well
					item._updateProperties(function () {
						that._bItemsChanged = true;
					});

					this._oMessageView.addItem(new sap.m.MessageItem({
						type: item.getType(),
						title: item.getTitle(),
						subtitle: item.getSubtitle(),
						description: item.getDescription(),
						markupDescription: item.getMarkupDescription(),
						longtextUrl: item.getLongtextUrl(),
						counter: item.getCounter()
					}));
				}, this);

				this._bItemsChanged = false;
			}

			this._setInitialFocus();
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

			// If MessagePopover is opened from an instance of sap.m.Toolbar and is instance of sap.m.Popover remove the Arrow
			if (oResponsivePopoverControl instanceof Popover) {
				if ((oParent instanceof Toolbar || oParent instanceof Bar || oParent instanceof SemanticPage)) {
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

		/**
		 * The method sets the placement position of the MessagePopover. Only accepted Values are:
		 * sap.m.PlacementType.Top, sap.m.PlacementType.Bottom and sap.m.PlacementType.Vertical
		 *
		 * @param {sap.m.PlacementType} sPlacement Placement type
		 * @returns {sap.m.MessagePopover} Reference to the 'this' for chaining purposes
		 */
		MessagePopover.prototype.setPlacement = function (sPlacement) {
			this.setProperty("placement", sPlacement, true);
			this._oPopover.setPlacement(sPlacement);

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
			if (!this.getInitiallyExpanded()) {
				this._collapseMsgPopover();
				this._oMessageView._oSegmentedButton.setSelectedButton("none");
			} else {
				this._expandMsgPopover();
			}
		};

		/**
		 * Expands the MessagePopover so that the width and height are equal
		 * @private
		 */
		MessagePopover.prototype._expandMsgPopover = function () {
			var sDomHeight,
				sHeight = this._oPopover.getContentWidth();

			if (this.getInitiallyExpanded()) {
				sDomHeight = this._oPopover.$("cont").css("height");
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
		 * Inserts close button in the in the provided location
		 *
		 * @param {sap.ui.core.Control} oInsertCloseBtnHere The object in which we want to insert the control
		 * @private
		 */
		MessagePopover.prototype._insertCloseBtn = function (oInsertCloseBtnHere) {
			var sCloseBtnDescr = this._oResourceBundle.getText("MESSAGEPOPOVER_CLOSE"),
				oCloseBtn = new Button({
				icon: ICONS["close"],
				visible: !sap.ui.Device.system.phone,
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

		/**
		 * Handles navigate event of the NavContainer
		 *
		 * @private
		 */
		MessagePopover.prototype._afterNavigate = function () {
			// Just wait for the next tick to apply the focus
			jQuery.sap.delayedCall(0, this, "_restoreFocus");
		};

		/**
		 * Restores the focus after navigation
		 *
		 * @private
		 */
		MessagePopover.prototype._restoreFocus = function () {
			if (this._oMessageView._isListPage()) {
				var oRestoreFocus = this._oRestoreFocus && this._oRestoreFocus.control(0);

				oRestoreFocus && oRestoreFocus.focus();
			} else {
				this._oMessageView._oBackButton.focus();
			}
		};

		/*
		 * =========================================
		 * MessagePopover async handlers
		 * proxy methods
		 * =========================================
		 */

		MessagePopover.prototype.setAsyncDescriptionHandler = function (asyncDescriptionHandler) {
			// MessagePopover is just a proxy to the MessageView
			this.setProperty('asyncDescriptionHandler', asyncDescriptionHandler, true);
			this._oMessageView.setProperty('asyncDescriptionHandler', asyncDescriptionHandler, true);

			return this;
		};

		MessagePopover.prototype.setAsyncURLHandler = function (asyncURLHandler) {
			// MessagePopover is just a proxy to the MessageView
			this.setProperty('asyncURLHandler', asyncURLHandler, true);
			this._oMessageView.setProperty('asyncURLHandler', asyncURLHandler, true);

			return this;
		};

		/*
		 * =========================================
		 * MessagePopover HeaderButton
		 * proxy methods
		 * =========================================
		 */

		MessagePopover.prototype.setHeaderButton = function (oBtn) {
			this._oMessageView.setHeaderButton(oBtn);
			return this;
		};

		MessagePopover.prototype.getHeaderButton = function () {
			return this._oMessageView.getHeaderButton();
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

	}, /* bExport= */ true);
