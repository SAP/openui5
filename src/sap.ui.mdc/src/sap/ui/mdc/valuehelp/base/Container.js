/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/mdc/mixin/PromiseMixin',
	'sap/ui/model/BindingMode',
	'sap/ui/base/ManagedObjectObserver'
], function(
	Element,
	PromiseMixin,
	BindingMode,
	ManagedObjectObserver
) {
	"use strict";

	/**
	 * Constructor for a new <code>Container</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Container for the {@link sap.ui.mdc.ValueHelp ValueHelp} element.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @alias sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Container = Element.extend("sap.ui.mdc.valuehelp.base.Container", /** @lends sap.ui.mdc.valuehelp.base.Container.prototype */
	{
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
				}
			},
			aggregations: {
				/**
				 * Used container element. (e.g. Popover or Dialog)
				 */
				_container: {
					type: "sap.ui.core.Element",
					multiple: false,
					visibility: "hidden"
				},
				/**
				 * Content of the container.
				 * This aggregation holds the actual controls enabling the user to select items or create conditions (e.g. tables or condition panels)
				 */
				 content: {
					type: "sap.ui.mdc.valuehelp.base.Content",
					multiple: true
				}
			},
			events: {
				/**
				 * Fired if the selected condition changed.
				 */
				select: {
					parameters: {
						/**
						 * Type of the selection change (add, remove)
						 */
						type: { type: "sap.ui.mdc.enum.SelectType" },
						/**
						 * Changed conditions
						 *
						 * <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
						 */
						conditions: { type: "object[]" }
					}
				},
				/**
				 * Fired if a change on the value help is confirmed
				 */
				confirm: {
					parameters: {
						/**
						 * True if the value help needs to be closed
						 */
						close: { type: "boolean" }
					}
				},
				/**
				 * Fired if the value help is opened.
				 */
				opened: {},
				/**
				 * Fired if the value help is closed.
				 */
				closed: {},
				/**
				 * Fired if the change is cancelled.
				 */
				cancel: {},
				/**
				 * Fired if the Container requests the delegate content.
				 */
				requestDelegateContent: {
					parameters: {
						/**
						 * Content wrapper id for which contents are requested
						 */
						contentId: { type: "string" }
					}
				},
				/**
				 * Fired if the value help should switch to dialog mode.
				 */
				requestSwitchToDialog: {},
				/**
				 * Fired if a navigation was executed in the content of the container
				 */
				navigated: {
					parameters: {
						/**
						 * True if the focus should be set back to the field.
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
						itemId: { type: "string" }
					}
				}
			}
		}
	});

	Container.prototype.init = function () {
		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
		this._oObserver.observe(this, {
			aggregations: ["content"]
		});
	};

	Container.prototype._observeChanges = function (oChanges) {
		if (oChanges.name === "content") {
			var oContent = oChanges.child;
			if (oChanges.mutation === "remove") {
				this._unbindContent(oContent);

			// } else {
			// 	this._bindContent(oContent);
			}
		}
	};

	Container.prototype._bindContent = function (oContent) {
		oContent.bindProperty("filterValue", { path: "/filterValue", model: "$valueHelp", mode: BindingMode.OneWay}); // inherit from ValueHelp
		var oBindingOptions = { path: "/conditions", model: "$valueHelp", mode: BindingMode.OneWay};
		if (oContent._formatConditions) {
			oBindingOptions.formatter = oContent._formatConditions.bind(oContent);
		}
		oContent.bindProperty("conditions", oBindingOptions); // inherit from ValueHelp
		oContent.bindProperty("config", { path: "/_config", model: "$valueHelp", mode: BindingMode.OneWay}); // inherit from ValueHelp

		oContent.attachConfirm(this._handleConfirmed, this);
		oContent.attachCancel(this._handleCanceled, this);
		oContent.attachSelect(this._handleSelect, this);

		if (oContent.attachNavigated) {
			oContent.attachNavigated(this._handleNavigated, this);
		}

		if (oContent.attachRequestSwitchToDialog) {
			oContent.attachRequestSwitchToDialog(this._handleRequestSwitchToDialog, this);
		}
	};

	Container.prototype._unbindContent = function (oContent) {
		oContent.unbindProperty("filterValue");
		oContent.unbindProperty("conditions");
		oContent.unbindProperty("config");
		oContent.detachConfirm(this._handleConfirmed, this);
		oContent.detachCancel(this._handleCanceled, this);
		oContent.detachSelect(this._handleSelect, this);

		if (oContent.detachNavigated) {
			oContent.detachNavigated(this._handleNavigated, this);
		}

		if (oContent.detachRequestSwitchToDialog) {
			oContent.detachRequestSwitchToDialog(this._handleRequestSwitchToDialog, this);
		}
	};

	Container.prototype._handleNavigated = function (oEvent) {
		this.fireNavigated(oEvent.mParameters);
	};

	Container.prototype._handleRequestSwitchToDialog = function (oEvent) {
		this.fireRequestSwitchToDialog({container: this});
	};

	Container.prototype._getContainer = function () {
	};

	Container.prototype._getControl = function () {
		var oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.getControl();
	};

	Container.prototype.getMaxConditions = function() {
		var oVHModel = this.getModel("$valueHelp");
		return oVHModel && oVHModel.getObject("/_config/maxConditions");
	};

	Container.prototype._isSingleSelect = function() {
		return this.getMaxConditions() === 1;
	};

	Container.prototype.getDomRef = function() {
		var oContainer = this.getAggregation("_container");
		return oContainer && oContainer.getDomRef();
	};

	Container.prototype.getUIArea = function() { // TODO: Ask Frank, if better way available
		return null; // don't use UIArea of parent as rendered as Popover or Dialog
	};

	Container.prototype._getUIAreaForContent = function() { // to map UIArea of content to Popover or Dialog
		return this.getUIArea();
	};

	/**
	 * Opens the container
	 *
	 * @param {Promise} oValueHelpContentPromise Promise for content request
	 * @returns {Promise} This promise resolves after the container completely opened.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.open = function (oValueHelpContentPromise) {
		if (!this.isOpening()) {
			var oOpenPromise = this._addPromise("open");
			return Promise.all([this._getContainer(), oValueHelpContentPromise]).then(function (aResults) {
				return this._placeContent(aResults[0]);
			}.bind(this)).then(function(oContainer) {
				if (!oOpenPromise.isCanceled()) {
					this._open(oContainer);
				}
				return oOpenPromise;
			}.bind(this));
		}

		return this._retrievePromise("open");
	};

	/**
	 * Closes the container
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	Container.prototype.close = function () {
		var oPromise = this._retrievePromise("open");
		if (oPromise) {
			if (oPromise.isSettled()) {
				this._close();
			} else {
				this._cancelPromise(oPromise);
			}
		}
	};

	Container.prototype._placeContent = function (oContainer) {
		return oContainer;
	};

	Container.prototype._open = function (oContainer) {

		var aContent = this.getContent();
		for (var i = 0; i < aContent.length; i++) { // for Dialog overwrite to only bind shown content
			this._bindContent(aContent[i]);
		}

	};

	Container.prototype._close = function () {

	};

	Container.prototype._handleOpened = function () {
		this._resolvePromise("open");
		this.fireOpened();
	};

	Container.prototype._handleClosed = function (oEvent) {
		this._removePromise("open");

		var aContent = this.getContent();
		for (var i = 0; i < aContent.length; i++) {
			this._unbindContent(aContent[i]);
		}

		this.fireClosed();
	};

	Container.prototype._handleConfirmed = function (oEvent) {
		this.fireConfirm();
	};

	Container.prototype._handleCanceled = function (oEvent) {
		this.fireCancel();
	};

	Container.prototype._handleSelect = function (oEvent) {
		this.fireSelect({type: oEvent.getParameter("type"), conditions: oEvent.getParameter("conditions")});
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	 Container.prototype.isOpen = function () {
		var oPromise = this._retrievePromise("open");
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	 Container.prototype.isOpening = function () {
		var oPromise = this._retrievePromise("open");
		return oPromise && !oPromise.isCanceled() && !oPromise.isSettled();
	};

	/**
	 * Determines the item (key and description) for a given value.
	 *
	 * The container checks if there is an item with a key or description that fits this value.
	 *
	 * <b>Note:</b> This function must only be called by the <code>ValueHelp</code> element.
	 *
	 * @param {object} oConfig Configuration
	 * @param {any} oConfig.value Value as entered by user
	 * @param {any} [oConfig.parsedValue] Value parsed by type to fit the data type of the key
	 * @param {object} [oConfig.context] Contextual information provided by condition payload or inParameters/outParameters. This is only filled if the description needs to be determined for an existing condition.
	 * @param {object} [oConfig.context.inParameter] inParameters of the current condition
	 * @param {object} [oConfig.context.ouParameter] outParameters of the current condition
	 * @param {object} [oConfig.context.payload] payload of the current condition
	 * @param {sap.ui.model.Context} [oConfig.bindingContext] <code>BindingContext</code> of the checked field. Inside a table the <code>ValueHelp</code> element might be connected to a different row.
	 * @param {boolean} [oConfig.checkKeyFirst] If set, the value help checks first if the value fits a key // TODO: not longer needed?
	 * @param {boolean} oConfig.checkKey If set, the value help checks only if there is an item with the given key. This is set to <code>false</code> if the value cannot be a valid key because of type validation.
	 * @param {boolean} oConfig.checkDescription If set, the value help checks only if there is an item with the given description. This is set to <code>false</code> if only the key is used in the field.
	 * @param {sap.ui.mdc.condition.ConditionModel} [oConfig.conditionModel] <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @param {string} [oConfig.conditionModelName] Name of the <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @param {boolean} [oConfig.caseSensitive] If set, the check is done case sensitive
	 * @param {sap.ui.core.Control} oConfig.control Instance of the calling control
	 * @returns {Promise<sap.ui.mdc.field.FieldHelpItem>} Promise returning object containing description, key, in and out parameters.
	 * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.getItemForValue = function(oConfig) { // TODO only for TypeAhead container
	};

	/**
	 * Defines if the content of the container can be used for input validation.
	 *
	 * @returns {boolean} True if content can be used for input validation
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.navigate = function(iStep) { // pass through to content
		return Promise.all([this._getContainer()]).then(function (aResults) {
			return this._placeContent(aResults[0]);
		}.bind(this)).then(function(oContainer) {
				this._navigate(iStep);
		}.bind(this));
	};

	Container.prototype._navigate = function(iStep) { // implemented by Popover
	};

	/**
	 * The focus visualization of the field help needs to be removed as the user starts typing into the field.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.removeFocus = function() {
	};

	/**
	 * Determines if the container is used as typeahead inside the value help
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {boolean} True if used as typeahead
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.isTypeahead = function () {
		var oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.getTypeahead() === this;
	};

	/**
	 * Determines if the content of the container supports typeahead
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {boolean} Flag if searching is supported
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp, sap.ui.mdc.valueHelp.base.Content
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.isTypeaheadSupported = function () {
		return false;
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.providesScrolling = function () {
		return false;
	};

	/**
	 * Determines the delegate of the value help
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {sap.ui.mdc.BaseDelegate} <code>Delegate</code> module
	 * @throws Throws an error if the delegate module is not available
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.getValueHelpDelegate = function () {
		var oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.getControlDelegate();
	};

	/**
	 * Determines the delegate payload of the value help
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {object} payload
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	 Container.prototype.getValueHelpDelegatePayload = function () {
		var oValueHelp = this.getParent();
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	 Container.prototype.awaitValueHelpDelegate = function () {
		var oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.awaitControlDelegate();
	};

	/**
	 * Determines if delegate of the value help is initialized
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {boolean} True if delegate is initialized
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Content
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	 Container.prototype.isValueHelpDelegateInitialized = function () {
		var oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.bDelegateInitialized;
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.getUseAsValueHelp = function() {
		return false;
	};

	/**
	 * Return the value help icon that should be used for the field.
	 *
	 * @returns {string} Name of the icon
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.getValueHelpIcon = function() {
		// not define icon property on Container as it might be dependent Popover/Dialog or used content
	};

	//TODO: define aria attribute object
	/**
	 * Returns the aria attributes the field needs from the value help
	 *
	 * @param {int} iMaxConditions maximal conditions allowed (as <code>ValueHelp</code> might not be connected to a field)
	 * @returns {object} object with the aria-attibutes
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.getAriaAttributes = function(iMaxConditions) {

		return { // return default values, but needs to be implemented by specific container
			contentId: null,
			ariaHasPopup: "listbox",
			role: "combobox",
			roleDescription: null
		};

	};

	Container.prototype.getScrollDelegate = function(iMaxConditions) {
		var oContainer = this.getAggregation("_container");
		return oContainer && oContainer.getScrollDelegate && oContainer.getScrollDelegate();
	};

	/**
	 * Determines if the value help should be opened when the user clicks into the connected control.
	 *
	 * @returns {boolean} If <code>true</code>, the value help should open when user clicks into the connected field control
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.shouldOpenOnClick = function() {
		return false;
	};

	/**
	 * Determines if the value help should be opened when the user used the arrow keys.
	 *
	 * @returns {boolean} If <code>true</code>, the value help should open when user used the arrow keys in the connected field control
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	 Container.prototype.shouldOpenOnNavigate = function() {
		return false;
	};


	/**
	 * Determines if the focus is set in the value help or stays in the calling control.
	 *
	 * @returns {boolean} if true, focus goes to the value help, if false it stays in the calling control.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Container.prototype.isMultiSelect = function() {

		return false;

	};

	Container.prototype._getContainerConfig = function (oContent) {
		var oConfig = oContent && oContent.getContainerConfig();
		var oResult = oConfig && oConfig[this.getMetadata().getName()];	// find configuration for this exact type

		if (!oResult && oConfig) {	// search for configurations of other implemented types
			var aTypes = Object.keys(oConfig);
			var sNonSpecificType = aTypes.find(function (sType) {
				return this.isA(sType);
			}.bind(this));
			if (sNonSpecificType) {
				oResult = oConfig[sNonSpecificType];
			}
		}

		return oResult;
	};


	Container.prototype._getRetrieveDelegateContentPromise = function () {
		var oValueHelp = this.getParent();
		return 	oValueHelp && oValueHelp._retrievePromise("delegateContent");
	};

	Container.prototype.getSelectedContent = function () {
		var oContent = this.getContent();
		return oContent && oContent[0];
	};

	Container.prototype.exit = function() {
		this._oObserver.disconnect();
		this._oObserver = undefined;
	};

	PromiseMixin.call(Container.prototype);

	return Container;

});
