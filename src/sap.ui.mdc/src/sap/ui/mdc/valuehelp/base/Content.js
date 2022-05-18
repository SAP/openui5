/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/mdc/mixin/PromiseMixin',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/Operator',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/base/strings/formatMessage'
], function(
	Element,
	PromiseMixin,
	ManagedObjectObserver,
	Condition,
	FilterOperatorUtil,
	Operator,
	ConditionValidated,
	formatMessage
) {
	"use strict";

	/**
	 * Constructor for a new <code>Content</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @alias sap.ui.mdc.valuehelp.base.Content
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Content = Element.extend("sap.ui.mdc.valuehelp.base.Content", /** @lends sap.ui.mdc.valuehelp.base.Content.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Title text that appears tab header.
				 */
				title: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				},
				/**
				 * Title text that appears in the dialog header.
				 */
				shortTitle: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				},
				/**
				 * Title text that appears in the dialog tokenizer panel, when ony one content exist.
				 */
				tokenizerTitle: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				},
				/**
				 * Conditions of the value help
				 *
				 * <b>Note:</b> This property must not be set from outside, it is only to be used by the corresponding container
				 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
				 */
				conditions: { // TODO: only internal? make restricted?
					type: "object[]",
					defaultValue: [],
					byValue: true
				},
				/**
				 * Value for filtering ($search)
				 *
				 * <b>Note:</b> This property must not be set from outside, it is only to be used by the corresponding container
				 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
				 */
				filterValue: { // TODO: how to hide? Or how to access from ValueHelp?
					type: "string",
					defaultValue: ""//,
					//visibility: "hidden"
				},
				/**
				 * internal configuration
				 *
				 * <b>Note:</b> This property must not be set from outside, it is only to be used by the corresponding container
				 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
				 */
				config: {
					type: "object",
					defaultValue: {}//,
//					visibility: "hidden"
				},
				 /**
				 * Hide content temporary.
				 */
				visible: {
					type: "boolean",
					group : "Appearance",
					defaultValue: true
				}

			},
			aggregations: {
				/**
				 * Content control that is put inside the parent container
				 *
				 * <b>Note:</b> This aggregation must not be set from outside, it is only to be used by the corresponding container
				 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
				 */
				displayContent: {
					type: "sap.ui.core.Control",
					multiple: false//,
					//visibility: "hidden" // as ManagedObjectModel can only observe hidden aggregations on root-control
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
				 * Fired if a change on the content is confirmed
				 */
				confirm: {
					parameters: {
						/**
						 * True if the value help need to be closed
						 */
						close: { type: "boolean" }
					}
				},
				/**
				 * Fired if the change is cancelled.
				 */
				cancel: {},

				/**
				 * Fired if the value help should switch to dialog mode.
				 */
				requestSwitchToDialog: {},
				/**
				 * Fired if a navigation was executed in the content
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

	Content.prototype.init = function() {

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["filterValue", "conditions", "config"]
		});

		this._oOperator = FilterOperatorUtil.getEQOperator(); // use as default if no configuartion

	};

	Content.prototype.exit = function() {

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	Content.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		// don't rerender content or parent-container on conditions change. This needs only be updated on
		// content control inside (Table, List, DefineConditionPanel...).
		if (sPropertyName === "conditions" || sPropertyName === "filterValue" || sPropertyName === "config") {
			bSuppressInvalidate = true;
		}

		return Element.prototype.setProperty.apply(this, [sPropertyName, oValue, bSuppressInvalidate]);

	};


	/**
	 * Gets the content controls
	 *
	 * @returns {Promise<sap.ui.core.Control>} This promise resolves after the content is created
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 */
	Content.prototype.getContent = function () {

	};

	/**
	 * Provides a configuration map for supported containers
	 *
	 * @example
	 * 	// Example configuration:
	 * 	{
	 *		'sap.ui.mdc.valuehelp.MyCustomContainer': {
	 *			showArrow: true,
	 *			showHeader: true,
 				getFooter: function () { Promise.resolve(oFooter); },
	 *			getContentWidth: function () { return "500px"; },
	 			getContentHeight: function () { ... },
	 *		}
	 *	}
	 * @returns {object|undefined} if available, a container configuration object is returned.
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.getContainerConfig = function () {

	};

	/**
	 * Finalize content before it is shown
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 */
	Content.prototype.onBeforeShow = function () {

	};

	/**
	 * Called if the content will be shown.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 */
	Content.prototype.onShow = function () {
		this._bVisible = true;
		this._handleConditionsUpdate();
		//this._handleFilterValueUpdate();
	};

	/**
	 * Called if the content will be hidden.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 */
	Content.prototype.onHide = function () {
		this._bVisible = false;
	};

	/**
	 * Determines the item (key and description) for a given value.
	 *
	 * The content checks if there is an item with a key or description that fits this value.
	 *
	 * <b>Note:</b> This function must only be called by the <code>Container</code> element.
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
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.getItemForValue = function (oConfig) {

	};

	/**
	 * Defines if the content can be used for input validation.
	 *
	 * @returns {boolean} True if content can be used for input validation
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.isValidationSupported = function() { // TODO only for TypeAhead content
		return false;
	};

	Content.prototype.getScrollDelegate = function() {
		var oContainer = this.getParent();
		return oContainer && oContainer.getScrollDelegate();
	};

	Content.prototype._observeChanges = function(oChanges) {
		if (oChanges.name === "conditions") {
			this._handleConditionsUpdate(oChanges);
		}

		if (oChanges.name === "filterValue") {
			this._handleFilterValueUpdate(oChanges);
		}

		if (oChanges.name === "config") {
			_configChanged.call(this, oChanges.current);
		}
	};

	Content.prototype._handleFilterValueUpdate = function(oChanges) {

	};

	Content.prototype._handleConditionsUpdate = function(oChanges) {

	};

	/**
	 * Creates a condition based on the used operator.
	 *
	 * @param {any} vValue Value of the condition. For item conditions this must be the key.
	 * @param {string} [sDescription] Description of the operator
	 * @param {object} [oPayload] payload
	 * @returns {sap.ui.mdc.condition.ConditionObject} The new condition object with the maintained operator along with <code>sKey</code> and <code>sDescription</code> as <code>aValues</code>
	 * @private
	 * @ui5-restricted ValueHelp subclasses
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype._createCondition = function(vValue, sDescription, oPayload) {

		var oOperator = _getOperator.call(this);

		var aValues = [vValue];
		if (oOperator.valueTypes.length > 1 && oOperator.valueTypes[1] !== Operator.ValueType.Static && sDescription !== null && sDescription !== undefined) {
			// description is supported
			aValues.push(sDescription);
		}

		return Condition.createCondition(oOperator.name, aValues, undefined, undefined, ConditionValidated.Validated, oPayload); // Conditions from help are always validated
	};

	/**
	 * The focus visualization of the field help needs to be removed as the user starts typing into the field.
	 *
	 * Only needed for typeahead.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.removeFocus = function() {

	};

	/**
	 * Triggers navigation in the content.
	 *
	 * As this could be asyncron as data might be loaded a promise is returned.
	 *
	 * <b>Note:</b> This function must only be called by the <code>Container</code> element.
	 *
	 * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
	 * @returns {Promise<object>} Promise returning object of navigated item (condition and itemId)
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.navigate = function(iStep) {

	};

	Content.prototype.getUIArea = function() {
		// Table, List or other content might be rerendered. In this case the corresponding UIArea is the one of the Popover or Dialog, not the one of the parents.
		var oContainer = this.getParent();
		if (oContainer && oContainer._getUIAreaForContent) {
			return oContainer._getUIAreaForContent();
		}

		return Element.prototype.getUIArea.apply(this, arguments);
	};

	/**
	 * Determines if the container of the content is used as typeAhead inside the value help
	 *
	 * <b>Note:</b> This function is used by the content and must not be used from outside
	 *
	 * @returns {boolean} True if used as typeahead
	 *
	 * @private
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.isTypeahead = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer.isTypeahead();
	};

	/**
	 * Determines if the content supports search
	 *
	 * <b>Note:</b> This function is used by the container and content and must not be used from outside
	 *
	 * @returns {boolean} Flag if searching is supported
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valueHelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.isSearchSupported = function () {
		return false;
	};

	/**
	 * Determines if the the content needs to provide a scrolling mechanism like a
	 * {@link sap.m.ScrollContainer ScrollContainer}
	 *
	 * <b>Note:</b> This function is used by the content and must not be used from outside
	 *
	 * @returns {boolean} True a scrolling mechanism is needed
	 *
	 * @private
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.provideScrolling = function () {
		var oContainer = this.getParent();
		return !oContainer || !oContainer.providesScrolling();
	};

	Content.prototype.isContainerOpen = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer.isOpen();
	};

	Content.prototype.isContainerOpening = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer.isOpening();
	};

	Content.prototype._getValueHelpDelegate = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer.getValueHelpDelegate();
	};

	Content.prototype._getValueHelpDelegatePayload = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer.getValueHelpDelegatePayload();
	};

	Content.prototype._awaitValueHelpDelegate = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer.awaitValueHelpDelegate();
	};

	Content.prototype._isValueHelpDelegateInitialized = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer.isValueHelpDelegateInitialized();
	};

	Content.prototype._getControl = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer._getControl();
	};

	Content.prototype.getCount = function (aConditions) {
		return 0;
	};

	/**
	 * Return the value help icon that should be used for the field.
	 *
	 * <b>Note</b> This function needs only to be implemented for <code>Content</code>
	 * implementing the <code>sap.ui.mdc.valuehelp.Popover</code> container.
	 * On dialogs the <code>sap.ui.mdc.valuehelp.Dialog</code> container defines the icon, as it could have multiple contents.
	 *
	 * @returns {string} Name of the icon
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.getValueHelpIcon = function() {
	};

	//TODO: define aria attribute object
	/**
	 * Returns the aria attributes the field needs from the value help
	 *
	 * <b>Note</b> This function needs only to be implemented for <code>Content</code>
	 * implementing the <code>sap.ui.mdc.valuehelp.Popover</code> container.
	 * On dialogs the <code>Dialog</code> container defines the attributes, as it could have multiple contents.
	 *
	 * @param {int} iMaxConditions maximal conditions allowed (as FieldHelp might not be connected to a field)
	 * @returns {object} object with the aria-attibutes
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.getAriaAttributes = function(iMaxConditions) {

		return { // return default values, but needs to be implemented by specific content
			contentId: null,
			ariaHasPopup: "listbox",
			roleDescription: null
		};

	};

	Content.prototype._isSingleSelect = function (oEvent) {
		return this._getMaxConditions() === 1;
	};

	/**
	 * Determines if the value help should be opened when the user clicks into the connected control.
	 *
	 * @returns {boolean} If <code>true</code>, the value help should open when user clicks into the connected field control
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.shouldOpenOnClick = function() {
		return false;
	};

	/**
	 * Determines if the value help should be opened when the user used the arrow keys.
	 * By default closed navigation is only enabled for single select scenarios
	 *
	 * @returns {boolean} If <code>true</code>, the value help should open when user used the arrow keys in the connected field control
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.shouldOpenOnNavigate = function() {
		return !this._isSingleSelect();
	};


	/**
	 * Determines if the focus is set in the value help or stays in the calling control.
	 *
	 * @returns {boolean} if true, focus goes to the value help, if false it stays in the calling control.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.isFocusInHelp = function() {

		return !this.isTypeahead();

	};

	/**
	 * Determines if multiselection is active.
	 *
	 * @returns {boolean} if true, multi-selection is active.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.isMultiSelect = function() {

		return !this._isSingleSelect();

	};

	/**
	 * Determines if quick selection is supported.
	 *
	 * @returns {boolean} if true, quick-selection is supported.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.isQuickSelectSupported = function() {
		return false;
	};

	/**
	 * Determines if value help dialog should show the tokenizer for the content.
	 *
	 * @returns {boolean} if for one content the value is true, the dialog shows the tokenizer.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 */
	 Content.prototype.getRequiresTokenizer = function() {
		return true;
	};

	function _configChanged(oConfig) {

		_determineOperator.call(this, oConfig.operators);

	}

	function _determineOperator(aOperators) {
		this._oOperator = FilterOperatorUtil.getEQOperator(aOperators); // if no operators provided use default EQ operator
	}

	function _getOperator() {
		return this._oOperator;
	}

	/**
	 * Determines the title used in the <code>TabBar</code> of the dialog.
	 *
	 * <b>Note:</b> This function is used by the container and must not be used from outside
	 *
	 * @param {int} iCount Number of selected items or conditions
	 * @returns {string} title
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.getFormattedTitle = function(iCount) {
		var sTitle = this.getTitle();
		if (sTitle) {
			sTitle = formatMessage(sTitle, iCount ? iCount : "");
		}
		return sTitle;
	};

	/**
	 * Determines the title used in the header of the dialog.
	 *
	 * <b>Note:</b> This function is used by the container and must not be used from outside
	 *
	 * @returns {string} title
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype.getFormattedShortTitle = function() {
		return this.getShortTitle();
	};

	/**
	 * Determines the title used in the header of the dialog for the bottom tokenizer.
	 *
	 * <b>Note:</b> This function is used by the container and must not be used from outside
	 *
	 * @param {int} iCount Number of selected items or conditions
	 * @returns {string} title
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.Container
	 */
	Content.prototype.getFormattedTokenizerTitle = function(iCount) {
		var sTitle = this.getTokenizerTitle();
		if (sTitle) {
			sTitle = formatMessage(sTitle, iCount ? iCount : "");
		}
		return sTitle;
	};

	Content.prototype._getMaxConditions = function() {

		var oConfig = this.getConfig();
		return oConfig && oConfig.maxConditions;

	};

	Content.prototype.onContainerClose = function() {

	};

	Content.prototype.onContainerOpen = function() {

	};


	PromiseMixin.call(Content.prototype);


	return Content;

});
