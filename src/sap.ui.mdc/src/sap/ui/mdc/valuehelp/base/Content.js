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
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Content for the <code>sap.ui.mdc.valuehelp.base.Container</code> element.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.91.0
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
				select: {
					parameters: {
						type: { type: "sap.ui.mdc.enum.SelectType" },
						conditions: { type: "object[]" }
					}
				},
				requestDelegateContent: {},
				requestSwitchToDialog: {},
				confirm: {
					parameters: {
						close: { type: "boolean" }
					}
				},
				cancel: {},
				navigated: {
					parameters: {
						leaveFocus: { type: "boolean" },
						condition: { type: "object" },
//						value: { type: "string" },
//						key: { type: "string" },
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

	Content.prototype.onShow = function () {
		this._bVisible = true;
		this._handleConditionsUpdate();
		//this._handleFilterValueUpdate();
	};

	Content.prototype.onHide = function () {
		this._bVisible = false;
	};

	Content.prototype.getItemForValue = function (oConfig) {

	};

	Content.prototype.isValidationSupported = function(oConfig) { // TODO only for TypeAhead content
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
	 * @param {string} sKey Operator for the condition
	 * @param {string} sDescription Description of the operator
	 * @param {object} oInParameters In parameters of the condition
	 * @param {object} oOutParameters Out parameters of the condition
	 * @returns {sap.ui.mdc.condition.ConditionObject} The new condition object with the maintained operator along with <code>sKey</code> and <code>sDescription</code> as <code>aValues</code>
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Content.prototype._createCondition = function(sKey, sDescription, oInParameters, oOutParameters) {

		var oOperator = _getOperator.call(this);

		var aValues = [sKey];
		if (oOperator.valueTypes.length > 1 && oOperator.valueTypes[1] !== Operator.ValueType.Static && sDescription !== null && sDescription !== undefined) {
			// description is supported
			aValues.push(sDescription);
		}

		return Condition.createCondition(oOperator.name, aValues, oInParameters, oOutParameters, ConditionValidated.Validated); // Conditions from help are always validated

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

	Content.prototype.isTypeahead = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer.isTypeahead();
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

	Content.prototype._awaitValueHelpDelegate = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer.awaitValueHelpDelegate();
	};

	Content.prototype._isValueHelpDelegateInitialized = function () {
		var oContainer = this.getParent();
		return oContainer && oContainer.isValueHelpDelegateInitialized();
	};

	Content.prototype.getCount = function (aConditions) {
		return 0;
	};

	/**
	 * Return the value help icon that should be used for the field.
	 *
	 * <b>Note</b> This function needs only to be implemented for <code>Content</code>
	 * implementing the <code>sap.ui.mdc.valuehelp.Popover</code> container.
	 * On dialogs the <code>Dialog</code> container defines the icon, as it could have multiple contents.
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
		this._oOperator = undefined;
		if (aOperators) {
			this._oOperator = FilterOperatorUtil.getEQOperator(aOperators);
		}
	}

	function _getOperator() {
		return this._oOperator;
	}

	Content.prototype.getFormattedTitle = function(iCount) {
		var sTitle = this.getTitle();
		if (sTitle) {
			sTitle = formatMessage(sTitle, iCount ? iCount : "");
		}
		return sTitle;
	};

	Content.prototype.getFormattedShortTitle = function() {
		return this.getShortTitle();
	};

	Content.prototype._getMaxConditions = function() {

		var oConfig = this.getConfig();
		return oConfig && oConfig.maxConditions;

	};

	PromiseMixin.call(Content.prototype);


	return Content;

});
