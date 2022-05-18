/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/Element',
	'sap/ui/mdc/mixin/PromiseMixin',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/FilterConverter',
	'sap/ui/mdc/enum/SelectType',
	'sap/ui/mdc/enum/OutParameterMode',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/model/Context',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/base/ManagedObjectObserver',
	'sap/base/util/merge',
	'sap/base/util/deepEqual',
	'sap/ui/mdc/enum/PropagationReason'
], function(
	Element,
	PromiseMixin,
	Condition,
	FilterOperatorUtil,
	FilterConverter,
	SelectType,
	OutParameterMode,
	ConditionValidated,
	Context,
	FormatException,
	ParseException,
	ManagedObjectModel,
	ManagedObjectObserver,
	merge,
	deepEqual,
	PropagationReason
) {
	"use strict";

	/**
	 * Modules for {@link sap.ui.mdc.ValueHelp ValueHelp}
	 * @namespace
	 * @name sap.ui.mdc.valuehelp
	 * @since 1.95.0
	 * @private
	 * @experimental As of version 1.95
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * Base-modules for {@link sap.ui.mdc.ValueHelp ValueHelp}
	 *
	 * These modules are not to be used stand-alone.
	 * @namespace
	 * @name sap.ui.mdc.valuehelp.base
	 * @since 1.95.0
	 * @private
	 * @experimental As of version 1.95
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * Content-modules to be used in {@link sap.ui.mdc.valueHelp.Popover Popover} or {@link sap.ui.mdc.valueHelp.Dialog Dialog}
	 *
	 * These modules are not to be used stand-alone.
	 * @namespace
	 * @name sap.ui.mdc.valuehelp.content
	 * @since 1.95.0
	 * @private
	 * @experimental As of version 1.95
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * Constructor for a new <code>ValueHelp</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Element for the <code>FieldHelp</code> association in the {@link sap.ui.mdc.field.FieldBase FieldBase} controls.
	 * @extends sap.ui.mdc.Element
	 * @implements sap.ui.core.PopupInterface
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @alias sap.ui.mdc.ValueHelp
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ValueHelp = Element.extend("sap.ui.mdc.ValueHelp", /** @lends sap.ui.mdc.ValueHelp.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The conditions of the selected items.
				 *
				 * <b>Note:</b> This property must only be set by the control the <code>ValueHelp</code> element
				 * belongs to, not by the application.
				 *
				 * <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
				 */
				conditions: {
					type: "object[]",
					defaultValue: [],
					byValue: true
				},

				/**
				 * Path to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. This property can only be configured during control initialization.
				 *
				 * @experimental
				 */
				delegate: {
					type: "object",
					group: "Data",
					defaultValue: {
						name: "sap/ui/mdc/ValueHelpDelegate"
					}
				},

				/**
				 * The value by which the help is filtered.
				 *
				 * <b>Note:</b> This only takes effect if the <code>ValueHelp</code> elements content supports filtering.
				 *
				 * <b>Note:</b> This property must only be set by the control the <code>ValueHelp</code> element
				 * belongs to, not by the application.
				 */
				filterValue: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * If this property is set, the user input of the corresponding field is validated against the value help.
				 * If no entry is found for the user input, an error is shown on the field.
				 *
				 * If this property is not set, the user input is still checked against the value help.
				 * But if no entry is found, the user input is set to the field if the used data type allows this.
				 * (A type parsing error is shown if the user input adheres to the requirements of the used data type.)
				 */
				validateInput: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * internal configuration
				 */
				_config: {
					type: "object",
					defaultValue: {},
					visibility: "hidden"
				},
				/**
				 * Internal property to allow to bind the valid state to OK Button or make it available for all content controls
				 */
				_valid: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true,
					visibility: "hidden"
				}
			},
			aggregations: {
				/**
				 * Container that is used and opened if the value help icon of the input field is pressed.
				 */
				dialog: {
					type: "sap.ui.mdc.valuehelp.IDialogContainer",
					multiple: false
				},
				/**
				 * Container that is used and opened in typeahead
				 */
				typeahead: {
					type: "sap.ui.mdc.valuehelp.ITypeaheadContainer",
					multiple: false
				}
			},
			events: {
				/**
				 * This event is fired when a value is selected in the value help.
				 *
				 * <b>Note:</b> This event must only be handled by the control the <code>ValueHelp</code> element
				 * belongs to, not by the application.
				 */
				select: {
					parameters: {

						/**
						 * The selected <code>conditions</code>
						 *
						 * <b>Note:</b> A condition has the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
						 */
						conditions: { type: "object[]" },

						/**
						 * If set, the selected <code>conditions</code> are added by the listening control, otherwise they replace the existing ones
						 */
						add: { type: "boolean" },

						/**
						 * Indicator if the value help is closed while selection
						 */
						close: {type: "boolean"}
					}
				},

				/**
				 * This event is fired when the <code>ValueHelp</code> element is disconnected from a control.
				 *
				 * <b>Note:</b> This event must only be handled by the control the <code>ValueHelp</code> element
				 * belongs to, not by the application.
				 */
				disconnect: {
				},

				/**
				 * This event is fired after the value help has been closed.
				 */
				closed: {},

				/**
				 * This event is fired after the user navigated, using the arrow keys, in the value help.
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
				},
				/**
				 * This event is fired if the user wants to switch from typeahead to value help.
				 */
				switchToValueHelp: {}
			},
			defaultProperty: "filterValue"
		}
	});

	ValueHelp.prototype.init = function() {

		Element.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
//			properties: ["filterValue", "conditions"],
			aggregations: ["typeahead", "dialog"]
		});

		this.setBindingContext(null); // don't inherit from parent as this could have a invalid BindingContent to read InParameters...

		this._oConditions = {}; // if no FilterBar is used store Conditions for search and InParameters locally

	};

	ValueHelp.prototype.exit = function() {


		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		}

	};

	ValueHelp.prototype.invalidate = function(oOrigin) {
		// do not invalidate parent as this must not be the one who is the active parent.
		// invalidation of rendered content must be done by Dialog or Popover.
		return;
	};

	/**
	 * Connects the <code>ValueHelp</code> element to a control.
	 *
	 * If the <code>ValueHelp</code> element is used as an association to multiple controls, it has to know
	 * the currently active control to open and interact.
	 *
	 * If the <code>ValueHelp</code> element is connected to a control, the <code>disconnected</code> event is fired
	 * to inform the previously connected control.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {sap.ui.core.Control} oControl Control to which the <code>FieldHelp</code> element is connected to
	 * @param {object} [oConfig] Configuration object that holds required data of the connected control
	 * @param {int} [oConfig.maxConditions=-1] Maximum number of allowed conditions
	 * @param {sap.ui.model.Type} [oConfig.dataType] Type of the key (required for condition panel)
	 * @param {string[]} [oConfig.operators] Possible operators to be used in the condition
	 * @param {sap.ui.mdc.enum.FieldDisplay} [oConfig.display] Defines whether the value and/or description of the field is shown and in what order
	 * @param {object} [oConfig.delegate] Field delegate to handle model-specific logic (required for condition panel)
	 * @param {object} [oConfig.delegateName] Field delegate name to handle model-specific logic (required for condition panel)
	 * @param {object} [oConfig.payload] Payload of the field delegate (required for condition panel)
	 * @param {string} [oConfig.conditionModelName] Name of the <code>ConditionModel</code>, if bound to one (required if used for {@link sap.ui.mdc.FilterField FilterField})
	 * @param {string} [oConfig.defaultOperatorName] Name of the default <code>Operator</code> (required if used for {@link sap.ui.mdc.FilterField FilterField})
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.connect = function(oControl, oConfig) {
		if (this._oControl && this._oControl !== oControl) {
			this.close();
			this.setFilterValue("");
			this.setConditions([]);
			this.fireDisconnect();
		}

		this._oControl = oControl;
		this.setProperty("_config", oConfig, true); // TODO: public property to be set by Control?

		_updateBindingContext.call(this); //to get the right values for InParameters ect.

		return this;
	};

	ValueHelp.prototype.getControl = function() {
		return this._oControl;
	};

	ValueHelp.prototype.getDomRef = function() {

		var oTypeahead = this.getTypeahead();
		var oDialog = this.getDialog();

		// check for opening too as focus move sometimes to valuehelp before handleOpened finished
		if (oTypeahead && (oTypeahead.isOpen() || oTypeahead.isOpening())) {
			return oTypeahead.getDomRef();
		} else if (oDialog && (oDialog.isOpen() || oDialog.isOpening())) {
			return oDialog.getDomRef();
		}

	};

	//TODO: define aria attribute object
	/**
	 * Returns the aria attributes the field needs from the value help
	 *
	 * @param {int} iMaxConditions maximal conditions allowed (as FieldHelp might not be connected to a field)
	 * @returns {object} object with the aria-attibutes
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.getAriaAttributes = function(iMaxConditions) {

		var oTypeahead = this.getTypeahead();
		var oDialog = this.getDialog();

		if (!oDialog && oTypeahead && oTypeahead.getUseAsValueHelp()) {
			oDialog = oTypeahead;
		}

		var bTypeaheadOpen = oTypeahead && oTypeahead.isOpen();
		var bDialogOpen = oDialog && oDialog.isOpen();
		var oTypeaheadAttributes = oTypeahead && oTypeahead.getAriaAttributes(iMaxConditions);
		var oDialogAttributes = oDialog && oDialog.getAriaAttributes(iMaxConditions);
		var sContentId; // use from currently open context (only needed if open)
		var sHasPopup; // use from Typeahead. If no Typeahead use from Dialog
		var sRole; // TODO: check Input for only typeahead case
		var sRoleDescription;

		if (bTypeaheadOpen) {
			sContentId = oTypeaheadAttributes.contentId;
		} else if (bDialogOpen) {
			sContentId = oDialogAttributes.contentId;
		}

		sHasPopup = (oTypeahead && oTypeaheadAttributes.ariaHasPopup) || (oDialog && oDialogAttributes.ariaHasPopup);
		sRole = (oTypeahead && oTypeaheadAttributes.role) || (oDialog && oDialogAttributes.role);
		sRoleDescription = (oTypeahead && oTypeaheadAttributes.roleDescription) || (oDialog && oDialogAttributes.roleDescription);

		return {
			contentId: sContentId,
			ariaHasPopup: sHasPopup,
			role: sRole,
			roleDescription: sRoleDescription,
			valueHelpEnabled: !!oDialog || !!oTypeahead && !!oTypeahead.getUseAsValueHelp()
		};

	};

	// retrieve delegate based content modifications
	ValueHelp.prototype._retrieveDelegateContent = function(oContainer, sContentId) {
		var oPromise;
		if (!sContentId) {
			var oSelectedContent = oContainer.getSelectedContent();	// use currently active content id if no other is given
			sContentId = oSelectedContent && oSelectedContent.getId();
		}

		oPromise = this._retrievePromise("delegateContent");
		var bIsOpen = this.isOpen();


		if (!oPromise || (oPromise && bIsOpen) || (oPromise && oPromise.aggregation !== oContainer.sParentAggregationName)) { // Create promises or stack running promises if VH is open or if the previous promise was meant for another container
			var fnFetchContent = function () {
				return this._getControlDelegatePromise().then(function (oDelegateModule) {
					return oDelegateModule.retrieveContent(this.getPayload(), oContainer, sContentId);
				}.bind(this));
			}.bind(this);

			var bChainPromises = oPromise && oPromise.isPending(); // ignore existing promise in case of non-happy result, maybe use .finally instead?
			oPromise = this._addPromise("delegateContent", bChainPromises ? oPromise.getInternalPromise().then(fnFetchContent) : fnFetchContent);
			oPromise.aggregation = oContainer.sParentAggregationName;
		}

		return oPromise.getInternalPromise(); // make sure to always return a non-cancellable promise here as we rely on fulfillment for opening a container
	};

	ValueHelp.prototype._getControlDelegatePromise = function(oContainer) {
		return this._retrievePromise("delegate", this.initControlDelegate.bind(this));
	};

	/**
	 * Opens the value help for the control
	 * to which the <code>ValueHelp</code> element is connected.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {boolean} bTypeahead Flag that determines whether value help is opened for type-ahead or for complex help
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.open = function(bTypeahead) {
		var oContainer = bTypeahead ? this.getTypeahead() : _getValueHelpContainer.call(this);

		var oOtherContainer = bTypeahead ? this.getDialog() : this.getTypeahead();
		if (oOtherContainer && oContainer !== oOtherContainer && (oOtherContainer.isOpen() || oOtherContainer.isOpening())) {
			oOtherContainer.close(); 	// TODO: Check container to be fully closed via promise
		}

		if (oContainer && !oContainer.isOpen() && !oContainer.isOpening()) {
			oContainer.open(this._retrieveDelegateContent(oContainer));
		}
	};

	function _handleRequestDelegateContent(oEvent) {
		var oContainer = oEvent.getSource();
		this._retrieveDelegateContent(oContainer, oEvent.getParameter("contentId"));
	}

	function _handleRequestSwitchToDialog(oEvent) {
		this.fireSwitchToValueHelp();
	}

	/**
	 * closes the value help.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.close = function() {
		var oTypeahead = this.getTypeahead();
		var oDialog = this.getDialog();

		if (oTypeahead && oTypeahead.isOpen()) {
			oTypeahead.close();
		}

		if (oDialog && oDialog.isOpen()) {
			oDialog.close();
		}
	};

	/**
	 * Toggles the open state of the value help.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {boolean} bTypeahead Flag that determines whether value help is opened for type-ahead or for complex help
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.toggleOpen = function(bTypeahead) {
		var oTypeahead = this.getTypeahead();
		var oDialog = this.getDialog();

		if (!bTypeahead && !oDialog && oTypeahead && oTypeahead.getUseAsValueHelp()) {
			oDialog = oTypeahead;
		}

		var bTypeaheadOpen = oTypeahead && oTypeahead.isOpen();
		var bDialogOpen = oDialog && oDialog.isOpen();

		if ((bTypeahead && bTypeaheadOpen) || (!bTypeahead && bDialogOpen)) {
			this.close();
		} else if ((bTypeahead && oTypeahead) || (!bTypeahead && oDialog)) {
			this.open(bTypeahead);
		}
	};

	/**
	 * Determines if the value help is open.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @returns {boolean} true if open or opening
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.isOpen = function() {
		var oTypeahead = this.getTypeahead();
		var oDialog = this.getDialog();
		return !!((oTypeahead && oTypeahead.isOpen()) || (oDialog && oDialog.isOpen()));
	};

	/**
	 * Skips the opening of the value help if it is pending because of loading content.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.skipOpening = function() { // ? Use close based logic instead?
		var oTypeahead = this.getTypeahead();
		var oDialog = this.getDialog();

		if (oTypeahead && oTypeahead.isOpening()) {
			oTypeahead.close();
		}

		if (oDialog && oDialog.isOpening()) {
			oDialog.close();
		}
	};

	/**
	 * Calls initialization of the <code>ValueHelp</code> element before the value help is really opened.
	 * This is called in Typeahead on first letter before the value help is opened with a delay. So the
	 * content can be determined in the delegate coding early.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {boolean} bTypeahead Flag that determines whether value help is opened for type-ahead or for complex help
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.initBeforeOpen = function(bTypeahead) { // ? naming, include as config in open?

	};

	/**
	 * Determines if the value help should be opened when something is typed into the field.
	 *
	 * Opening the value help must be triggered by the control the <code>ValueHelp</code> element
	 * belongs to.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @returns {Promise<boolean>} if <code>true</code>, the field help should open by typing. The result might be returned asynchronously, so a Promise is used.
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.isTypeaheadSupported = function() { // always return promise ?

		var oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			return this._retrieveDelegateContent(oTypeahead).then(function () {
				return !!oTypeahead && oTypeahead.isTypeaheadSupported(); // as might depend on binding in content
			});
		} else {
			return Promise.resolve(false);
		}

	};

	/**
	 * Determines if the value help should be opened when the user clicks into the connected control.
	 *
	 * Opening the value help must be triggered by the control the <code>ValueHelp</code> element
	 * belongs to.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @returns {boolean} If <code>true</code>, the value help should open when user clicks into the connected field control
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.shouldOpenOnClick = function () { // was openByClick before, better naming?

		var oContainer = _getValueHelpContainer.call(this);

		if (oContainer) {
			return oContainer.shouldOpenOnClick(); // TODO: needed async to load content
		}

		return false;
	};

	/**
	 * Determines if the focus is set in the value help or stays in the calling control.
	 *
	 * @returns {boolean} if true, focus goes to the value help, if false it stays in the calling control.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.isFocusInHelp = function() { // find more elegant way?

		var oDialog = _getValueHelpContainer.call(this);
		return oDialog && oDialog.isFocusInHelp();

	};

	/**
	 * The focus visualization of the field help needs to be removed as the user starts typing into the field.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.removeFocus = function() {
		var oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			// could be done sync. as it only occurs if open
			oTypeahead.removeFocus();
		}
	};

	/**
	 * Triggers navigation in the value help.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.navigate = function(iStep) { // pass through to container
		var oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			var _fnOnNavigatable = function () {
				if (oTypeahead.shouldOpenOnNavigate() && !oTypeahead.isOpening() && !oTypeahead.isOpen()) {
					return oTypeahead.open(true).then(function() {
						oTypeahead.navigate(iStep);
					});
				}
				return oTypeahead.navigate(iStep);
			};
			var oNavigatePromise = this._retrievePromise("navigate");
			var oExistingPromise = oNavigatePromise && !oNavigatePromise.isSettled() && oNavigatePromise.getInternalPromise();
			this._addPromise("navigate", oExistingPromise ? oExistingPromise.then(_fnOnNavigatable) : this._retrieveDelegateContent(oTypeahead).then(_fnOnNavigatable));
		}
	};

	ValueHelp.prototype.getTextForKey = function (vKey, oContext, oBindingContext, oConditionModel, sConditionModelName) {
		return this.getItemForValue({
			parsedValue: vKey,
			value: vKey,
			context: oContext,
			bindingContext: oBindingContext,
			conditionModel: oConditionModel,
			conditionModelName: sConditionModelName,
			checkKey: true,
			exception: FormatException,
			caseSensitive: true // case sensitive as used to get description for known key
		});
	};

	ValueHelp.prototype.getKeyForText = function(sText, oContext) {
		return this.getItemForValue({
			value: sText,
			context: oContext,
			checkDescription: true,
			exception: ParseException,
			caseSensitive: true // case sensitive as used to get description for known description
		});
	};

	/**
	 * Determines the item (key and description) for a given value.
	 *
	 * The value help checks if there is an item with a key or description that fits this value.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValuedHelp</code> element
	 * belongs to, not by the application.
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
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 */
	ValueHelp.prototype.getItemForValue = function(oConfig) {
		// TODO: Discuss how we handle binding / typeahead changes ??
		var oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			//TODO: determine values from Inparameters from BindingContext (If not given from outside)
			var aPromiseKey = ["getItemForValue", oConfig.parsedValue || oConfig.value, JSON.stringify(oConfig.context), oConfig.oBindingContext && oConfig.oBindingContext.getPath()];
			var sPromisekey = aPromiseKey.join("_");
			return this._retrievePromise(sPromisekey, function () {
				return this._retrieveDelegateContent(oTypeahead).then(function() {
					oConfig.caseSensitive = oConfig.hasOwnProperty("caseSensitive") ? oConfig.caseSensitive : false; // If supported, search case insensitive
					var pGetItemPromise = oTypeahead.getItemForValue(oConfig);
					// pGetItemPromise.then(function (oResult) {
					// 	_onConditionPropagation.call(this, PropagationReason.Info, oConfig);
					// }.bind(this));
					return pGetItemPromise;
				}/*.bind(this)*/);
			}.bind(this));
		} else {
			// to return always a Promise
			return Promise.reject("No Typeahead"); // TODO message - no translation needed, could only occur on wrng configuration, not on user interaction
		}
	};

	/**
	 * Defines if the value help can be used for input validation.
	 *
	 * @returns {boolean} True if value help can be used for input validation
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.isValidationSupported = function() { // isUsableForValidation also necessary?

		var oTypeahead = this.getTypeahead();

		return oTypeahead && oTypeahead.isValidationSupported();

	};

	/**
	 * Triggers some logic that must be executed in <code>ValueHelp</code> element if a <code>Change</code> event
	 * on the connected control is fired.
	 *
	 * This is done if the corresponding control value is changed (not during navigation).
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.onControlChange = function() {

		if (this.bIsDestroyed) {
			return; // if destroyed meanwhile, don't update
		}

		_onConditionPropagation.call(this, PropagationReason.ControlChange);
		// as BindingContext of Field might change (happens if fast typed and FieldHelp not opened) update if needed
		_updateBindingContext.call(this);
	};

	/**
	 * Determines the icon for the value help.
	 *
	 * @returns {string} Name of the icon
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.getIcon = function() {

		var oTypeahead = this.getTypeahead();
		var oDialog = this.getDialog();

		if (oDialog) {
			return oDialog.getValueHelpIcon();
		} else if (oTypeahead){
			return oTypeahead.getValueHelpIcon();
		}

	};

//	ValueHelp.prototype.getUIArea = function() { // Ask Frank, if better way available
//
//	};

	ValueHelp.prototype.getMaxConditions = function() { // ?
		var oConfig = this.getProperty("_config");
		return (oConfig && oConfig.maxConditions) || -1;
	};

	ValueHelp.prototype.getDisplay = function() { // ? currently necessary to determine how to render the tokens in valuehelp

	};

	ValueHelp.prototype.getDataType = function() { // should only be of interest for content in the future, maybe provide such infos in an abstract way? (interface?)

	};

	/**
	 * If only typeahead is enabled the field should not show a value help icon or open the value help using F4.
	 *
	 * @returns {boolean} <code>true</code> if value help is enabled, <code>false</code> if only typeahead is enabled
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.valueHelpEnabled = function() {

		var oTypeahead = this.getTypeahead();
		var oDialog = this.getDialog();

		if (oDialog) {
			return true;
		} else {
			return oTypeahead && oTypeahead.getUseAsValueHelp();
		}

	};

	function _onConditionPropagation(sReason, oConfig) {
		var oDelegate = this.bDelegateInitialized && this.getControlDelegate();
		if (oDelegate) {
			oDelegate.onConditionPropagation(this._oPayload, this, sReason, oConfig || this.getProperty("_config"));
		}
	}

	function _handleNavigated(oEvent) {

		var oCondition = oEvent.getParameter("condition");
		this.fireNavigated({condition: oCondition, itemId: oEvent.getParameter("itemId"), leaveFocus: oEvent.getParameter("leaveFocus")});
	}

	function _handleSelect(oEvent) {


		var sType = oEvent.getParameter("type");
		var aEventConditions = oEvent.getParameter("conditions") || [];
		var aNextConditions;

		var bSingleSelect = this.getMaxConditions() === 1;

		if (bSingleSelect) {
			aNextConditions = sType === SelectType.Remove ? [] : aEventConditions.slice(0,1);
		}


		if (sType === SelectType.Set) {
			aNextConditions = [].concat(bSingleSelect ? aEventConditions.slice(0,1) : aEventConditions);
		}

		if (sType === SelectType.Add) {
			if (bSingleSelect) {
				aNextConditions = aEventConditions.slice(0,1);
			} else {
				aNextConditions = this.getConditions();
				for (var i = 0; i < aEventConditions.length; i++) {
					aNextConditions.push(aEventConditions[i]);
				}
			}
		}

		if (sType === SelectType.Remove) {
			if (bSingleSelect) {
				aNextConditions = [];
			} else {
				aNextConditions = this.getConditions();
				for (var j = 0; j < aEventConditions.length; j++) {
					var iIndex = FilterOperatorUtil.indexOfCondition(aEventConditions[j], aNextConditions);
					if (iIndex >= 0) {
						aNextConditions.splice(iIndex, 1);
					}
				}
			}
		}

		if (aNextConditions) {
			this.setProperty("conditions", aNextConditions, true);	// TODO: update async to only update remove and add once
		}
	}

	function _handleConfirm(oEvent) {
		if (this.getProperty("_valid")) { // only confirm if valid
			var bSingleSelect = this.getMaxConditions() === 1;
			var bCloseParam = oEvent.getParameter("close");
			var bCloseAfterConfirm = typeof bCloseParam !== 'undefined' ? bCloseParam : bSingleSelect;
			var aConditions = this.getConditions();
			var bAdd = !bSingleSelect && !oEvent.getSource().isMultiSelect();
			if (bCloseAfterConfirm) {
				this.close();
			}
			aConditions = Condition._removeEmptyConditions(aConditions);
			aConditions = Condition._removeInitialFlags(aConditions);
			FilterOperatorUtil.updateConditionsValues(aConditions); // to remove static text from static conditions

			this.fireSelect({conditions: aConditions, add: bAdd, close: bCloseAfterConfirm});
			_onConditionPropagation.call(this, PropagationReason.Select);
		}
	}


	function _handleCancel(oEvent) {

		this.close();

	}

	function _handleOpened(oEvent) {

	}

	function _handleClosed(oEvent) {
		this._removePromise("delegateContent");
		this._removePromise("navigate");
		this.fireClosed();
	}

	function _observeChanges(oChanges) {
		if (["typeahead", "dialog"].indexOf(oChanges.name) !== -1) {
			var oContainer = oChanges.child;

			var bAdded = oChanges.mutation === "insert";
			var fnEvent = bAdded ? oContainer.attachEvent.bind(oContainer) : oContainer.detachEvent.bind(oContainer);

			fnEvent("select", _handleSelect, this);
			fnEvent("requestDelegateContent", _handleRequestDelegateContent, this);
			fnEvent("confirm", _handleConfirm, this);
			fnEvent("cancel", _handleCancel, this);
			fnEvent("opened", _handleOpened, this);
			fnEvent("closed", _handleClosed, this);

			if (oContainer.attachRequestSwitchToDialog) {
				fnEvent("requestSwitchToDialog", _handleRequestSwitchToDialog, this);
			}

			if (oContainer.attachNavigated) {
				fnEvent("navigated", _handleNavigated, this);
			}

			if (bAdded) {
				if (!this._oManagedObjectModel) {
					this._oManagedObjectModel = new ManagedObjectModel(this);
				}
				oContainer.setModel(this._oManagedObjectModel, "$valueHelp");
			}
		}
	}

	function _updateBindingContext() {

		var oBindingContext = this._oControl ? this._oControl.getBindingContext() : null; // if not connected use no BindingContext
		this.setBindingContext(oBindingContext);
	}

	function _getValueHelpContainer() {

		var oContainer = this.getDialog();

		if (!oContainer) { // no Dialog -> check if Typeahead should be opened
			var oTypeahead = this.getTypeahead();
			if (oTypeahead && oTypeahead.getUseAsValueHelp()) {
				oContainer = oTypeahead;
			}
		}

		return oContainer;

	}

	PromiseMixin.call(ValueHelp.prototype);


	return ValueHelp;

});
