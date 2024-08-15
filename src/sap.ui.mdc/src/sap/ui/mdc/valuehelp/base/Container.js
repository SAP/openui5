/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/mdc/mixin/PromiseMixin',
	'sap/ui/model/BindingMode',
	'sap/ui/base/ManagedObjectObserver'
], (
	Element,
	PromiseMixin,
	BindingMode,
	ManagedObjectObserver
) => {
	"use strict";

	/**
	 * Constructor for a new <code>Container</code>.
	 *
	 * This is the basis for various value help containers. It cannot be used directly.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Container for the {@link sap.ui.mdc.ValueHelp ValueHelp} element.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @public
	 * @since 1.95.0
	 * @alias sap.ui.mdc.valuehelp.base.Container
	 */
	const Container = Element.extend("sap.ui.mdc.valuehelp.base.Container", /** @lends sap.ui.mdc.valuehelp.base.Container.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Title text that appears in the dialog or tab header.
				 */
				title: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				},
				/**
				 * This property may be used by <code>FilterableListContents</code> to share basic search states in collective search scenarios.
				 *
				 * @private
				 * @ui5-restricted
				 */
				localFilterValue: {
					type: "string"
				}
			},
			aggregations: {
				/**
				 * Used container element (for example, {@link sap.m.Popover Popover} or {@link sap.m.Dialog Dialog}).
				 */
				_container: {
					type: "sap.ui.core.Element",
					multiple: false,
					visibility: "hidden"
				},
				/**
				 * Content of the container.
				 * This aggregation holds the actual controls enabling the user to select items or create conditions (for example, tables or condition panels).
				 */
				content: {
					type: "sap.ui.mdc.valuehelp.base.Content",
					multiple: true
				}
			},
			events: {
				/**
				 * This event is fired if the selected condition has changed.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.ValueHelp
				 */
				select: {
					parameters: {
						/**
						 * Type of the selection change (add, remove)
						 */
						type: { type: "sap.ui.mdc.enums.ValueHelpSelectionType" },
						/**
						 * Changed conditions
						 *
						 * <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
						 */
						conditions: { type: "object[]" }
					}
				},
				/**
				 * This event is fired if a change of the value help is confirmed.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.ValueHelp
				 */
				confirm: {
					parameters: {
						/**
						 * <code>true</code> if the value help needs to be closed
						 */
						close: { type: "boolean" }
					}
				},
				/**
				 * This event is fired if the value help is opened.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.ValueHelp
				 */
				opened: {
					parameters: {
						/**
						 * ID of the initially selected item
						 */
						itemId: { type: "string" }
					}
				},
				/**
				 * This event is fired if the value help is closed.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.ValueHelp
				 */
				closed: {},
				/**
				 * This event is fired if the change is cancelled.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.ValueHelp
				 */
				cancel: {},
				/**
				 * This event is fired if the container requests the delegate content.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.ValueHelp
				 */
				requestDelegateContent: {
					parameters: {
						/**
						 * Content wrapper ID for which contents are requested
						 */
						contentId: { type: "string" }
					}
				},
				/**
				 * This event is fired if the value help should switch to dialog mode.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.ValueHelp
				 */
				requestSwitchToDialog: {},
				/**
				 * This event is fired if a navigation has been executed in the content of the container.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.ValueHelp
				 */
				navigated: {
					parameters: {
						/**
						 * <code>true</code> if the focus should be set back to the field.
						 */
						leaveFocus: { type: "boolean" },
						/**
						 * Navigated condition.
						 *
						 * <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
						 */
						condition: { type: "object" },
						/**
						 * ID of the navigated item. (This is needed to set the corresponding aria-attribute)
						 */
						itemId: { type: "string" },
						/**
						 * If <code>true</code> the filtering was executed case sensitive
						 * @since 1.127.0
						 */
						caseSensitive: { type: "boolean" }
					}
				},
				/**
				 * This event is fired after a suggested item has been found for a type-ahead.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.ValueHelp
				 * @since 1.120.0
				 */
				typeaheadSuggested: {
					parameters: {
						/**
						 * Suggested condition
						 *
						 * <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
						 */
						condition: { type: "object" },
						/**
						 * Used filter value
						 * (as the event might fire asynchronously, and the current user input might have changed.)
						 */
						filterValue: { type: "string" },
						/**
						 * ID of the suggested item (This is needed to set the corresponding ARIA attribute)
						 */
						itemId: { type: "string" },
						/**
						 * Number of found items
						 * @since 1.127.0
						 */
						items: { type: "int" },
						/**
						 * If <code>true</code> the filtering was executed case sensitive
						 * @since 1.121.0
						 */
						caseSensitive: { type: "boolean" }
					}
				},
				/**
				 * This event is fired if the visual focus is set to the value help.
				 *
				 * In this case the visual focus needs to be removed from the opening field, but the real focus must stay there.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.field.FieldBase
				 * @since 1.127.0
				 */
				visualFocusSet: {
				}
			}
		}
	});

	Container.prototype.init = function() {
		this._oObserver = new ManagedObjectObserver(this.observeChanges.bind(this));
		this._oObserver.observe(this, {
			aggregations: ["content"]
		});
	};

	/**
	 * Observes property and aggregation changes.
	 * @param {object} oChanges Change
	 * @protected
	 */
	Container.prototype.observeChanges = function(oChanges) {
		if (oChanges.name === "content") {
			const oContent = oChanges.child;
			if (oChanges.mutation === "remove") {
				this.unbindContentFromContainer(oContent);
			}
		}
	};

	/**
	 * Binds the content to the container.
	 * @param {sap.ui.mdc.valuehelp.base.Content} oContent content
	 * @protected
	 */
	Container.prototype.bindContentToContainer = function(oContent) {
		if (oContent && !oContent._bContentBound) { // to prevent multiple event handlers
			// aatach events before binding as updation of properties might lead to an event
			oContent.attachConfirm(this.handleConfirmed, this);
			oContent.attachCancel(this.handleCanceled, this);
			oContent.attachSelect(this.handleSelect, this);

			if (oContent.attachNavigated) {
				oContent.attachNavigated(this.handleNavigated, this);
			}

			if (oContent.attachVisualFocusSet) {
				oContent.attachVisualFocusSet(this.handleVisualFocusSet, this);
			}

			if (oContent.attachTypeaheadSuggested) {
				oContent.attachTypeaheadSuggested(this.handleTypeaheadSuggested, this);
			}

			if (oContent.attachRequestSwitchToDialog) {
				oContent.attachRequestSwitchToDialog(this.handleRequestSwitchToDialog, this);
			}

			oContent.bindProperty("filterValue", { path: "/filterValue", model: "$valueHelp", mode: BindingMode.OneWay }); // inherit from ValueHelp
			const oBindingOptions = { path: "/conditions", model: "$valueHelp", mode: BindingMode.OneWay };
			if (oContent._formatConditions) {
				oBindingOptions.formatter = oContent._formatConditions.bind(oContent);
			}
			oContent.bindProperty("config", { path: "/_config", model: "$valueHelp", mode: BindingMode.OneWay }); // inherit from ValueHelp
			oContent.bindProperty("conditions", oBindingOptions); // inherit from ValueHelp
			oContent._bContentBound = true;
		}
	};

	/**
	 * Unbinds the content from the container.
	 * @param {sap.ui.mdc.valuehelp.base.Content} oContent content
	 * @protected
	 */
	Container.prototype.unbindContentFromContainer = function(oContent) {
		if (oContent._bContentBound) {
			oContent.unbindProperty("filterValue", true); // don't update values in Content to prevent unneeded updates
			oContent.unbindProperty("config", true);
			oContent.unbindProperty("conditions", true);
			oContent.detachConfirm(this.handleConfirmed, this);
			oContent.detachCancel(this.handleCanceled, this);
			oContent.detachSelect(this.handleSelect, this);

			if (oContent.detachNavigated) {
				oContent.detachNavigated(this.handleNavigated, this);
			}

			if (oContent.detachVisualFocusSet) {
				oContent.detachVisualFocusSet(this.handleVisualFocusSet, this);
			}

			if (oContent.detachTypeaheadSuggested) {
				oContent.detachTypeaheadSuggested(this.handleTypeaheadSuggested, this);
			}

			if (oContent.detachRequestSwitchToDialog) {
				oContent.detachRequestSwitchToDialog(this.handleRequestSwitchToDialog, this);
			}
			oContent._bContentBound = false;
		}
	};

	/**
	 * Handles the <code>navigated</code> event of the content.
	 * @param {sap.ui.base.Event} oEvent event
	 * @protected
	 */
	Container.prototype.handleNavigated = function(oEvent) {
		this.fireNavigated(oEvent.mParameters);
	};

	/**
	 * Handles the <code>visualFocusSet</code> event of the content.
	 * @param {sap.ui.base.Event} oEvent event
	 * @protected
	 */
	Container.prototype.handleVisualFocusSet = function(oEvent) {
		this.fireVisualFocusSet(oEvent.mParameters);
	};

	/**
	 * Handles the <code>typeaheadSuggested</code> event of the content.
	 * @param {sap.ui.base.Event} oEvent event
	 * @protected
	 */
	Container.prototype.handleTypeaheadSuggested = function(oEvent) {
		this.fireTypeaheadSuggested(oEvent.mParameters);
	};

	/**
	 * Handles the <code>requestSwitchToDialog</code> event of the content.
	 * @param {sap.ui.base.Event} oEvent event
	 * @protected
	 */
	Container.prototype.handleRequestSwitchToDialog = function(oEvent) {
		this.fireRequestSwitchToDialog({ container: this });
	};

	/**
	 * Returns the container control or element that is opened (for example, a popover or dialog).
	 * @reurns {sap.ui.core.Element} container
	 * @protected
	 */
	Container.prototype.getContainerControl = function() {};

	/**
	 * Returns control connected to value help.
	 * @returns {sap.ui.core.Control} connected control
	 * @protected
	 */
	Container.prototype.getControl = function() {
		const oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.getControl();
	};

	/**
	 * Returns the maximum allowed number of conditions, -1 if no limit is set.
	 * @returns {int} maximum allowed number of conditions
	 * @protected
	 */
	Container.prototype.getMaxConditions = function() {
		const oVHModel = this.getModel("$valueHelp");
		return oVHModel && oVHModel.getObject("/_config/maxConditions");
	};

	/**
	 * Returns if the value help is used for single selection.
	 * @returns {boolean} <code>true</code> id single selection
	 * @protected
	 */
	Container.prototype.isSingleSelect = function() {
		return this.getMaxConditions() === 1;
	};

	Container.prototype.getDomRef = function() {
		const oContainer = this.getAggregation("_container");
		return oContainer && oContainer.getDomRef();
	};

	Container.prototype.getUIArea = function() { // TODO: Ask Frank, if better way available
		return null; // don't use UIArea of parent as rendered as Popover or Dialog
	};

	/**
	 * Returns the <code>UIArea</code> of the content.
	 * @returns {sap.ui.core.UIArea|null} The UI area of the content or <code>null</code>
	 * @protected
	 */
	Container.prototype.getUIAreaForContent = function() { // to map UIArea of content to Popover or Dialog
		return this.getUIArea();
	};

	/**
	 * Opens the container.
	 *
	 * @param {Promise} oValueHelpContentPromise Promise for content request
	 * @param {boolean} bTypeahead Flag indicating whether the container is opened as type-ahead or dialog-like help
	 * @returns {Promise} This promise resolves after the container completely opened.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.open = function(oValueHelpContentPromise, bTypeahead) {
		if (!this.isOpening()) {
			const oOpenPromise = this._addPromise("open");
			return Promise.all([this.getContainerControl(), oValueHelpContentPromise]).then((aResults) => {
				return this.placeContent(aResults[0]);
			}).then((oContainer) => {
				if (!oOpenPromise.isCanceled()) {
					this.openContainer(oContainer, bTypeahead);
				}
				return oOpenPromise;
			});
		}

		return this._retrievePromise("open");
	};

	/**
	 * Closes the container.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.close = function() {
		const oPromise = this._retrievePromise("open");
		if (oPromise) {
			if (oPromise.isSettled()) {
				this.closeContainer();
			} else {
				this._cancelPromise(oPromise);
			}
		}
	};

	/**
	 * Places the content into the container control or element.
	 * @param {sap.ui.core.Element} oContainer container
	 * @returns {sap.ui.core.Element} container
	 * @protected
	 */
	Container.prototype.placeContent = function(oContainer) {
		return oContainer;
	};

	/**
	 * Opens the container control or element.
	 * @param {sap.ui.core.Element} oContainer container
	 * @param {boolean} bTypeahead if set, container is opened for typeahead
	 * @protected
	 */
	Container.prototype.openContainer = function(oContainer, bTypeahead) {

		const aContent = this.getContent();
		for (let i = 0; i < aContent.length; i++) { // for Dialog overwrite to only bind shown content
			this.bindContentToContainer(aContent[i]);
		}

	};

	/**
	 * Closes the container control or element.
	 * @protected
	 */
	Container.prototype.closeContainer = function() {

	};

	/**
	 * Handles the <code>opened</code> event of the container control or element.
	 * @param {sap.ui.base.Event} oEvent event
	 * @protected
	 */
	Container.prototype.handleOpened = function(oEvent) {
		this._resolvePromise("open");
		this.fireOpened();
	};

	/**
	 * Handles the <code>closed</code> event of the container control or element.
	 * @param {sap.ui.base.Event} oEvent event
	 * @protected
	 */
	Container.prototype.handleClosed = function(oEvent) {
		this._removePromise("open");

		const aContent = this.getContent();
		for (let i = 0; i < aContent.length; i++) {
			this.unbindContentFromContainer(aContent[i]);
		}

		this.fireClosed();
	};

	/**
	 * Handles the <code>confirmed</code> event of the content.
	 *
	 * Here the {@link #event:confirm confirm} event needs to be fired.
	 * @param {sap.ui.base.Event} oEvent event
	 * @protected
	 */
	Container.prototype.handleConfirmed = function(oEvent) {
		this.fireConfirm();
	};

	/**
	 * Handles the <code>cancelled</code> event of the content.
	 *
	 * Here the {@link #event:cancel cancel} event needs to be fired.
	 * @param {sap.ui.base.Event} oEvent event
	 * @protected
	 */
	Container.prototype.handleCanceled = function(oEvent) {
		this.fireCancel();
	};

	/**
	 * Handles the <code>select</code> event of the content.
	 *
	 * Here the {@link #event:select select} event needs to be fired.
	 * @param {sap.ui.base.Event} oEvent event
	 * @protected
	 */
	Container.prototype.handleSelect = function(oEvent) {
		this.fireSelect({ type: oEvent.getParameter("type"), conditions: oEvent.getParameter("conditions") });
	};

	/**
	 * Determines if the container is open.
	 *
	 * <b>Note:</b> This function must only be called by the <code>ValueHelp</code> element.
	 *
	 * @returns {boolean} true if open or opening
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.isOpen = function() {
		const oPromise = this._retrievePromise("open");
		return oPromise && oPromise.isSettled();
	};

	/**
	 * Determines if the container is opening.
	 *
	 * <b>Note:</b> This function must only be called by the <code>ValueHelp</code> element.
	 *
	 * @returns {boolean} true if opening
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.isOpening = function() {
		const oPromise = this._retrievePromise("open");
		return oPromise && !oPromise.isCanceled() && !oPromise.isSettled();
	};

	/**
	 * Determines the item (key and description) for a given value.
	 *
	 * The container checks if there is an item with a key or description that fits this value.
	 *
	 * <b>Note:</b> This function must only be called by the <code>ValueHelp</code> element.
	 *
	 * @param {sap.ui.mdc.valuehelp.base.ItemForValueConfiguration} oConfig Configuration
	 * @returns {Promise<sap.ui.mdc.valuehelp.base.ValueHelpItem>} Promise returning object containing description, key and payload.
	 * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.getItemForValue = function(oConfig) { // TODO only for TypeAhead container
		return undefined;
	};

	/**
	 * Defines if the content of the container can be used for input validation.
	 *
	 * @returns {boolean} True if content can be used for input validation
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.isValidationSupported = function() { // TODO only for TypeAhead container
		return false;
	};


	/**
	 * Triggers navigation in the content of the container.
	 *
	 * As this could be asynchronous in case additional data needs to be loaded a promise is returned.
	 *
	 * <b>Note:</b> This function must only be called by the <code>ValueHelp</code> element.
	 *
	 * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
	 * @returns {Promise<object>} Promise returning object of navigated item (condition and itemId)
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.navigate = function(iStep) { // pass through to content
		return Promise.all([this.getContainerControl()]).then((aResults) => { // TODO: Container control needed if navigated without opening?
			return this.placeContent(aResults[0]);
		}).then((oContainer) => {
			this.navigateInContent(iStep);
		});
	};

	/**
	 * Triggers navigation in the content of the container.
	 * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
	 * @protected
	 */
	Container.prototype.navigateInContent = function(iStep) { // implemented by Popover
	};

	/**
	 * The focus visualization of the field help needs to be removed as the user starts typing into the field.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.removeVisualFocus = function() {};

	/**
	 * The focus visualization of the field help needs to be set as the user starts naigation into the value help items.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 * @since 1.127.0
	 */
	Container.prototype.setVisualFocus = function() {
	};

	/**
	 * Determines if the container is used as typeahead inside the value help.
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {boolean} True if used as typeahead
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.isTypeahead = function() {
		const oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.getTypeahead() === this;
	};

	/**
	 * Determines if the content of the container supports typeahead.
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {boolean} Flag if searching is supported
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp, sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.isTypeaheadSupported = function() {
		return false;
	};

	/**
	 * Determines if the container is used as dialog inside the value help.
	 *
	 * The container is also used as dialog if <code>useAsValueHelp</code> is set on content and no other dialog is set.
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {boolean} True if used as dialog
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.isDialog = function() {
		const oValueHelp = this.getParent();
		return oValueHelp && (oValueHelp.getDialog() === this || (this.isTypeahead() && !oValueHelp.getDialog() && this.getUseAsValueHelp()));
	};

	/**
	 * Determines if the container parent has a dialog inside the value help.
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {boolean} True if parent has a dialog
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.hasDialog = function() {
		const oValueHelp = this.getParent();
		return !!(oValueHelp && (oValueHelp.getDialog()));
	};

	/**
	 * Determines if the container provides a own scroll functionality.
	 * If not, the <code>Content</code> needs to provide a scrolling solution like a {@link sap.m.ScrollContainer ScrollContainer}.
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {boolean} True if scrolling is provided
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.providesScrolling = function() {
		return false;
	};

	/**
	 * Determines the value help instance.
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {sap.ui.mdc.ValueHelp} <code>ValueHelp</code> instance
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.getValueHelp = function() {
		const oValueHelp = this.getParent();
		return oValueHelp;
	};

	/**
	 * Determines the delegate of the value help.
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {module:sap/ui/mdc/BaseDelegate} <code>Delegate</code> module
	 * @throws Throws an error if the delegate module is not available
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.getValueHelpDelegate = function() {
		const oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.getControlDelegate();
	};

	/**
	 * Determines the delegate payload of the value help.
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {object} payload
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.getValueHelpDelegatePayload = function() {
		const oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.getPayload();
	};

	/**
	 * Provides access to the delegate initialization <code>Promise</code> of the value help.
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {Promise} <code>Promise</code> reflecting the delegate initialization
	 * @throws Throws an error if the delegate module is not available
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.awaitValueHelpDelegate = function() {
		const oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.awaitControlDelegate();
	};

	/**
	 * Determines if delegate of the value help is initialized.
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {boolean} True if delegate is initialized
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.isValueHelpDelegateInitialized = function() {
		const oValueHelp = this.getParent();
		return !!oValueHelp && oValueHelp.bDelegateInitialized;
	};

	/**
	 * If the container is used for type-ahead it might be wanted that the same content should
	 * also be shown as valuehelp. If not, the field should not show a valuehelp icon.
	 *
	 * <b>Note</b> This function needs only to be implemented for <code>Container</code>
	 * implementing the <code>sap.ui.mdc.valuehelp.container.ITypeahead</code> interface.
	 *
	 * @returns {boolean} True if value help shall open as valuehelp
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.getUseAsValueHelp = function() {
		return false;
	};

	/**
	 * Return the value help icon that should be used for the field.
	 *
	 * @returns {null|string} Name of the icon for this container. If <code>null</code> this container will not be used as value help and could only be used as typeahead.
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.getValueHelpIcon = function() {
		// not define icon property on Container as it might be dependent Popover/Dialog or used content
	};

	//TODO: define aria attribute object
	/**
	 * Returns the aria attributes the field needs from the value help.
	 *
	 * @param {int} iMaxConditions maximal conditions allowed (as <code>ValueHelp</code> might not be connected to a field)
	 * @returns {object} object with the aria-attibutes
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.getAriaAttributes = function(iMaxConditions) {

		return { // return default values, but needs to be implemented by specific container
			contentId: null,
			ariaHasPopup: "listbox",
			role: "combobox",
			roleDescription: null,
			valueHelpEnabled: false,
			autocomplete: "none"
		};

	};

	/**
	 * Returns the sap.ui.core.delegate.ScrollEnablement delegate which is used with this control.
	 * @param {int} iMaxConditions maximal conditions allowed (as <code>ValueHelp</code> might not be connected to a field)
	 * @returns {sap.ui.core.delegate.ScrollEnablement} The scroll enablement delegate
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 */
	Container.prototype.getScrollDelegate = function(iMaxConditions) {
		const oContainer = this.getAggregation("_container");
		return oContainer && oContainer.getScrollDelegate && oContainer.getScrollDelegate();
	};

	/**
	 * Determines if the value help should be opened when the user focuses the connected control.
	 *
	 * @returns {Promise<boolean>} If <code>true</code>, the value help should open when user focuses the connected field control
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.shouldOpenOnFocus = function() {
		const oDelegate = this.getValueHelpDelegate();
		const oValueHelp = this.getValueHelp();
		return oDelegate ? oDelegate.shouldOpenOnFocus(oValueHelp, this) : Promise.resolve(false);
	};

	/**
	 * Determines if the value help should be opened when the user clicks into the connected control.
	 *
	 * @returns {Promise<boolean>} If <code>true</code>, the value help should open when user clicks into the connected field control
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.shouldOpenOnClick = function() {
		const oDelegate = this.getValueHelpDelegate();
		const oValueHelp = this.getValueHelp();
		return oDelegate ? oDelegate.shouldOpenOnClick(oValueHelp, this) : Promise.resolve(false);
	};

	/**
	 * Determines if the value help should be opened when the user used the arrow keys.
	 *
	 * @returns {boolean} If <code>true</code>, the value help should open when user used the arrow keys in the connected field control
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.shouldOpenOnNavigate = function() {
		return false;
	};

	/**
	 * Determines if navigation via arrow keys should be possible.
	 *
	 * In ComboBox-like case keyboard-navigation should be anabled if closed and if open.
	 * If only typeahead is used (and maybe an value help dialog) keyboard-navigation schould be enabled only if typeahed is open.
	 *
	 * As not all rowas might be loaded navigation with home, end, page up or dowm might be disabled, depending of the used content.
	 *
	 * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
	 *
	 * @returns {boolean} If <code>true</code>, the navigation should be enabled if value help is closed
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.isNavigationEnabled = function(iStep) {
		return false; // enable only for Popover and supported Content
	};

	/**
	 * Determines if the focus is set in the value help or stays in the calling control.
	 *
	 * @returns {boolean} if true, focus goes to the value help, if false it stays in the calling control.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.isFocusInHelp = function() {

		return !this.isTypeahead();

	};

	/**
	 * Determines if multiselection is active.
	 *
	 * @returns {boolean} if true, multi-selection is active.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.isMultiSelect = function() {

		return false;

	};

	/**
	 * Gets the configuration for a specific content.
	 * @param {sap.ui.mdc.valuehelp.base.Content} oContent content
	 * @returns {object} configuration
	 * @protected
	 */
	Container.prototype.getContainerConfig = function(oContent) {
		const oConfig = oContent && oContent.getContainerConfig();
		let oResult = oConfig && oConfig[this.getMetadata().getName()]; // find configuration for this exact type

		if (!oResult && oConfig) { // search for configurations of other implemented types
			const aTypes = Object.keys(oConfig);
			const sNonSpecificType = aTypes.find((sType) => {
				return this.isA(sType);
			});
			if (sNonSpecificType) {
				oResult = oConfig[sNonSpecificType];
			}
		}

		return oResult;
	};

	/**
	 * Returns the <code>Promise</code> for content creation.
	 * @returns {Promise} <code>Promise</code> for delegate content
	 * @protected
	 */
	Container.prototype.getRetrieveDelegateContentPromise = function() {
		const oValueHelp = this.getParent();
		return oValueHelp && oValueHelp._retrievePromise("delegateContent");
	};

	/**
	 * Returns the currently used content.
	 * @returns {sap.ui.mdc.valuehelp.base.Content} currently used content
	 * @protected
	 */
	Container.prototype.getSelectedContent = function() {
		const oContent = this.getContent();
		return oContent && oContent[0];
	};

	/**
	 * Called if <code>ValueHelp</code> connection to a control has changed.
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.onConnectionChange = function() {
		const aContent = this.getContent();
		for (let i = 0; i < aContent.length; i++) { // for Dialog overwrite to only bind shown content
			this.unbindContentFromContainer(aContent[i]); // in navigation case binding might still exist
			aContent[i].onConnectionChange();
		}
	};

	/**
	 * Temporarily highlights a typeahead item identified by it's id.
	 * Navigation events or other updates may lead to the item no longer being highlighted.
	 *
	 * @param {string} sHighlightId control id of the item to be highlighted
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.setHighlightId = function(sHighlightId) {

	};

	Container.prototype.clone = function(sIdSuffix, aLocalIds) {

		// detach event handler before cloning to not have it twice on the clone
		// attach it after clone again
		const aContent = this.getContent();

		for (let i = 0; i < aContent.length; i++) {
			if (aContent[i]._bContentBound) {
				aContent[i]._bRebindContent = true;
				this.unbindContentFromContainer(aContent[i]);
			}
		}

		const oClone = Element.prototype.clone.apply(this, arguments);

		for (let i = 0; i < aContent.length; i++) { // for Dialog overwrite to only bind shown content
			if (aContent[i]._bRebindContent) {
				this.bindContentToContainer(aContent[i]);
				delete aContent[i]._bRebindContent;
			}
		}

		return oClone;

	};

	Container.prototype.exit = function() {
		this._oObserver.disconnect();
		this._oObserver = undefined;
	};

	PromiseMixin.call(Container.prototype);

	return Container;

});