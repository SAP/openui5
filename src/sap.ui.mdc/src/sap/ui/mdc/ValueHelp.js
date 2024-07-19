/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/Element',
	'sap/ui/mdc/mixin/PromiseMixin',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/enums/ValueHelpSelectionType',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/mdc/enums/ValueHelpPropagationReason',
	'sap/ui/Device',
	"sap/ui/mdc/enums/FieldDisplay"
], (
	Element,
	PromiseMixin,
	Condition,
	FilterOperatorUtil,
	ValueHelpSelectionType,
	ManagedObjectModel,
	ManagedObjectObserver,
	ValueHelpPropagationReason,
	Device,
	FieldDisplay
) => {
	"use strict";

	/**
	 * Modules for {@link sap.ui.mdc.ValueHelp ValueHelp}
	 * @namespace
	 * @name sap.ui.mdc.valuehelp
	 * @since 1.95.0
	 * @public
	 */

	/**
	 * Base-modules for {@link sap.ui.mdc.ValueHelp ValueHelp}
	 *
	 * These modules must not be used stand-alone.
	 * @namespace
	 * @name sap.ui.mdc.valuehelp.base
	 * @since 1.95.0
	 * @public
	 */

	/**
	 * Content-modules that is used in {@link sap.ui.mdc.valueHelp.Popover Popover} or {@link sap.ui.mdc.valueHelp.Dialog Dialog}
	 *
	 * These modules must not be used stand-alone.
	 * @namespace
	 * @name sap.ui.mdc.valuehelp.content
	 * @since 1.95.0
	 * @public
	 */

	/**
	 * Constructor for a new <code>ValueHelp</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class
	 * The <code>ValueHelp</code> element can be assigned to the {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.MultiValueField MultiValueField},
	 * and {@link sap.ui.mdc.FilterField FilterField} controls using the <code>valueHelp</code> association. One <code>ValueHelp</code> element instance can be
	 * assigned to multiple fields (like in different table rows). It should be placed in the control tree on the container holding the fields.
	 * @extends sap.ui.mdc.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @public
	 * @since 1.95.0
	 * @alias sap.ui.mdc.ValueHelp
	 */
	const ValueHelp = Element.extend("sap.ui.mdc.ValueHelp", /** @lends sap.ui.mdc.ValueHelp.prototype */ {
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
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.field.FieldBase
				 */
				conditions: {
					type: "object[]",
					defaultValue: [],
					byValue: true
				},
				/**
				 * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
				 * The object has the following properties:
				 * <ul>
				 * 	<li><code>name</code> defines the path to the <code>Delegate</code> module. The used delegate module must inherit from {@link module:sap/ui/mdc/ValueHelpDelegate ValueHelpDelegate}</li>
				 * 	<li><code>payload</code> (optional) defines application-specific information that can be used in the given delegate</li>
				 * </ul>
				 * <i>Sample delegate object:</i>
				 * <pre><code>{
				 * 	name: "sap/ui/mdc/ValueHelpDelegate",
				 * 	payload: {}
				 * }</code></pre>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. This property can only be configured during control initialization.
				 */
				delegate: {
					type: "object",
					group: "Data",
					defaultValue: {
						name: "sap/ui/mdc/ValueHelpDelegate",
						payload: {}
					}
				},

				/**
				 * The value by which the help is filtered.
				 * Here the field provides the typed value to allow the value help to filter for it.
				 *
				 * <b>Note:</b> This only takes effect if the <code>ValueHelp</code> elements content supports filtering.
				 *
				 * <b>Note:</b> This property must only be set by the control the <code>ValueHelp</code> element
				 * belongs to, not by the application.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.field.FieldBase
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
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.field.FieldBase
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
						close: { type: "boolean" }
					}
				},

				/**
				 * This event is fired when the <code>ValueHelp</code> element is disconnected from a control.
				 *
				 * <b>Note:</b> This event must only be handled by the control the <code>ValueHelp</code> element
				 * belongs to, not by the application.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.field.FieldBase
				 */
				disconnect: {},

				/**
				 * This event is fired after the value help has been closed.
				 */
				closed: {},

				/**
				 * This event is fired as the value help opening is triggered.
				 */
				open: {
					parameters: {
						/**
						 * The container which will be opened
						 */
						container: { type: "sap.ui.mdc.valuehelp.base.Container" }
					}
				},

				/**
				 * This event is fired as the value help is fully open.
				 */
				opened: {
					parameters: {
						/**
						 * The container which was opened
						 */
						container: { type: "sap.ui.mdc.valuehelp.base.Container" },
						/**
						 * ID of the initially selected item
						 */
						itemId: { type: "string" }
					}
				},

				/**
				 * This event is fired after the user navigated, using the arrow keys, in the value help.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.field.FieldBase
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
						itemId: { type: "string" },
						/**
						 * If <code>true</code> the filtering was executed case sensitive
						 * @since 1.127.0
						 */
						caseSensitive: { type: "boolean" }
					}
				},
				/**
				 * This event is fired if the user wants to switch from typeahead to value help.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.field.FieldBase
				 */
				switchToValueHelp: {},
				/**
				 * This event is fired after a suggested item has been found for a type-ahead.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc.field.FieldBase
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
	 * @param {sap.ui.core.Control} oControl Control to which the <code>ValueHelp</code> element is connected to
	 * @param {object} [oConfig] Configuration object that holds required data of the connected control
	 * @param {int} [oConfig.maxConditions=-1] Maximum number of allowed conditions
	 * @param {sap.ui.model.Type} [oConfig.dataType] Type of the key (required for condition panel)
	 * @param {sap.ui.model.Type} [oConfig.additionalDataType] Type of the description (required for condition panel)
	 * @param {string[]} [oConfig.operators] Possible operators to be used in the condition
	 * @param {sap.ui.mdc.enums.FieldDisplay} [oConfig.display] Defines whether the value and/or description of the field is shown and in what order
	 * @param {object} [oConfig.delegate] Field delegate to handle model-specific logic (required for condition panel)
	 * @param {object} [oConfig.delegateName] Field delegate name to handle model-specific logic (required for condition panel)
	 * @param {object} [oConfig.payload] Payload of the field delegate (required for condition panel)
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.connect = function(oControl, oConfig) {
		if (this._oControl && this._oControl !== oControl) {
			this.close();
			this.setFilterValue("");
			this.setConditions([]);

			const oTypeahead = this.getTypeahead();
			const oDialog = this.getDialog();
			if (oTypeahead) {
				oTypeahead.onConnectionChange();
			}
			if (oDialog) {
				oDialog.onConnectionChange();
			}

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

		const oTypeahead = this.getTypeahead();
		const oDialog = this.getDialog();

		// check for opening too as focus move sometimes to valuehelp before handleOpened finished
		if (oTypeahead && (oTypeahead.isOpen() || oTypeahead.isOpening())) {
			return oTypeahead.getDomRef();
		} else if (oDialog && (oDialog.isOpen() || oDialog.isOpening())) {
			return oDialog.getDomRef();
		}

	};

	/**
	 * Aria attributes determined by value help to be set on connected control
	 *
	 * @static
	 * @constant
	 * @typedef {object} sap.ui.mdc.valuehelp.base.AriaAttributes
	 * @property {string} contentId ID of the current content control the calling control should point to (for example the table inside the popover)
	 * @property {string} ariaHasPopup the value to be set in <code>aria-haspopup</code> attribute (for example "listbox")
	 * @property {string} role value of the <code>role</code> attribute (for example "combobox")
	 * @property {string} roleDescription value of the <code>aria-roledescription</code> attribute
	 * @property {boolean} valueHelpEnabled If set a <code>valueHelpEnabled</code> text is announced
	 * @property {string} autocomplete value of the <code>aria-autocomplete</code> attribute
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * Returns the aria attributes the field needs from the value help
	 *
	 * @param {int} iMaxConditions maximal conditions allowed (as ValueHelp might not be connected to a field)
	 * @returns {sap.ui.mdc.valuehelp.base.AriaAttributes} object with the aria-attibutes
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.getAriaAttributes = function(iMaxConditions) {

		const oTypeahead = this.getTypeahead();
		let oDialog = this.getDialog();

		if (!oDialog && oTypeahead && oTypeahead.getUseAsValueHelp()) {
			oDialog = oTypeahead;
		}

		const bTypeaheadOpen = oTypeahead && oTypeahead.isOpen();
		const bDialogOpen = oDialog && oDialog.isOpen();
		const oTypeaheadAttributes = oTypeahead && oTypeahead.getAriaAttributes(iMaxConditions);
		const oDialogAttributes = oDialog && oDialog.getAriaAttributes(iMaxConditions);
		let sContentId; // use from currently open context (only needed if open)

		if (bTypeaheadOpen) {
			sContentId = oTypeaheadAttributes.contentId;
		} else if (bDialogOpen) {
			sContentId = oDialogAttributes.contentId;
		}

		const sHasPopup = (oTypeahead && oTypeaheadAttributes.ariaHasPopup) || (oDialog && oDialogAttributes.ariaHasPopup); // use from Typeahead. If no Typeahead use from Dialog
		const sRole = (oTypeahead && oTypeaheadAttributes.role) || (oDialog && oDialogAttributes.role); // TODO: check Input for only typeahead case
		const sRoleDescription = (oTypeahead && oTypeaheadAttributes.roleDescription) || (oDialog && oDialogAttributes.roleDescription);
		const bValueHelpEnabled = !!oDialog && oDialogAttributes.valueHelpEnabled; // a pure typeahead is not a value help
		const sAutocomplete = (oTypeahead && oTypeaheadAttributes.autocomplete) || (oDialog && oDialogAttributes.autocomplete);

		return {
			contentId: sContentId,
			ariaHasPopup: sHasPopup,
			role: sRole,
			roleDescription: sRoleDescription,
			valueHelpEnabled: bValueHelpEnabled,
			autocomplete: sAutocomplete
		};

	};

	// retrieve delegate based content modifications
	ValueHelp.prototype._retrieveDelegateContent = function(oContainer, sContentId) {
		let oPromise;
		if (!sContentId) {
			const oSelectedContent = oContainer.getSelectedContent(); // use currently active content id if no other is given
			sContentId = oSelectedContent && oSelectedContent.getId();
		}

		oPromise = this._retrievePromise("delegateContent");
		const bIsOpen = this.isOpen();


		if (!oPromise || (oPromise && bIsOpen) || (oPromise && oPromise.aggregation !== oContainer.sParentAggregationName)) { // Create promises or stack running promises if VH is open or if the previous promise was meant for another container
			const fnFetchContent = function() {
				return this._getControlDelegatePromise().then((oDelegateModule) => {
					return oDelegateModule.retrieveContent(this, oContainer, sContentId);
				});
			}.bind(this);

			const bChainPromises = oPromise && oPromise.isPending(); // ignore existing promise in case of non-happy result, maybe use .finally instead?
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
		const oContainer = bTypeahead ? this.getTypeahead() : _getValueHelpContainer.call(this);

		const oOtherContainer = bTypeahead ? this.getDialog() : this.getTypeahead();
		if (oOtherContainer && oContainer !== oOtherContainer && (oOtherContainer.isOpen() || oOtherContainer.isOpening())) {
			oOtherContainer.close(); // TODO: Check container to be fully closed via promise
		}

		if (oContainer && !oContainer.isOpen() && !oContainer.isOpening()) {
			oContainer.open(this._retrieveDelegateContent(oContainer), bTypeahead);
			this.fireOpen({ container: oContainer });
		}
	};

	function _handleRequestDelegateContent(oEvent) {
		const oContainer = oEvent.getSource();
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
		const oTypeahead = this.getTypeahead();
		const oDialog = this.getDialog();

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
		const oTypeahead = this.getTypeahead();
		let oDialog = this.getDialog();

		if (!bTypeahead && !oDialog && oTypeahead && oTypeahead.getUseAsValueHelp()) {
			oDialog = oTypeahead;
		}

		const bTypeaheadOpen = oTypeahead && oTypeahead.isOpen();
		const bDialogOpen = oDialog && oDialog.isOpen();

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
		const oTypeahead = this.getTypeahead();
		const oDialog = this.getDialog();
		return !!((oTypeahead && (oTypeahead.isOpen() || oTypeahead.isOpening())) || (oDialog && (oDialog.isOpen() || oDialog.isOpening())));
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
		const oTypeahead = this.getTypeahead();
		const oDialog = this.getDialog();

		if (oTypeahead && oTypeahead.isOpening()) {
			oTypeahead.close();
		}

		if (oDialog && oDialog.isOpening()) {
			oDialog.close();
		}
	};

	/**
	 * Calls initialization of the <code>ValueHelp</code> element before the value help is really opened.
	 * This is called during type-ahead when the user types the first letter and before the value help is opened with a delay.
	 * This way the content can be determined in the delegate coding early.
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

		const oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			return this._retrieveDelegateContent(oTypeahead).then(() => {
				return !!oTypeahead && oTypeahead.isTypeaheadSupported(); // as might depend on binding in content
			});
		} else {
			return Promise.resolve(false);
		}

	};

	/**
	 * Determines if the value help should be opened when the user focuses the connected control.
	 *
	 * Opening the value help must be triggered by the control the <code>ValueHelp</code> element
	 * belongs to.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @returns {Promise<boolean>} If <code>true</code>, the value help should open when user focuses the connected field control
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.shouldOpenOnFocus = function() {
		const oContainer = _getValueHelpContainer.call(this, true);
		return this._getControlDelegatePromise().then((oDelegateModule) => {
			return oContainer ? oContainer.shouldOpenOnFocus() : Promise.resolve(false);
		});
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
	 * @returns {Promise<boolean>} If <code>true</code>, the value help should open when user clicks into the connected field control
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.shouldOpenOnClick = function() {
		const oContainer = _getValueHelpContainer.call(this, true);
		return this._getControlDelegatePromise().then((oDelegateModule) => {
			return oContainer ? oContainer.shouldOpenOnClick() : Promise.resolve(false);
		});
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

		const oDialog = _getValueHelpContainer.call(this);
		return oDialog && oDialog.isFocusInHelp();

	};

	/**
	 * The focus visualization of the field help needs to be removed as the user starts typing into the field.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.removeVisualFocus = function() {
		const oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			// could be done sync. as it only occurs if open
			oTypeahead.removeVisualFocus();
		}
	};

	/**
	 * The focus visualization of the field help needs to be set as the user starts naigation into the value help items.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.127.0
	 */
	ValueHelp.prototype.setVisualFocus = function() {
		const oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			// could be done sync. as it only occurs if open
			oTypeahead.setVisualFocus();
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
		const oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			const _fnOnNavigatable = function() {
				if (oTypeahead.shouldOpenOnNavigate() && !oTypeahead.isOpening() && !oTypeahead.isOpen()) {
					return oTypeahead.open(true).then(() => {
						oTypeahead.navigate(iStep);
					});
				}
				return oTypeahead.navigate(iStep);
			};
			const oNavigatePromise = this._retrievePromise("navigate");
			const oExistingPromise = oNavigatePromise && !oNavigatePromise.isSettled() && oNavigatePromise.getInternalPromise();
			this._addPromise("navigate", oExistingPromise ? oExistingPromise.then(_fnOnNavigatable) : this._retrieveDelegateContent(oTypeahead).then(_fnOnNavigatable));
		}
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
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.isNavigationEnabled = function(iStep) {
		const oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			const oDialog = this.getDialog();
			const bIsOpen = oTypeahead.isOpen();

			if (bIsOpen || !oDialog) {
				return oTypeahead.isNavigationEnabled(iStep); // if Typeahead open or typeahead is used as value help, keyboard navigation could be used
			}
		}

		return false;
	};

	/**
	 * Configuration object type for normalized definition of a <code>ValueHelpItem</code>.
	 *
	 * @static
	 * @constant
	 * @typedef {object} sap.ui.mdc.valuehelp.ValueHelpItem
	 * @property {any} key Key
	 * @property {any} [description] Description
	 * @property {object} [payload] Payload of the condition. Set by application. Data needs to be stringified. (as stored and loaded in variants)
	 * @public
	 */

	/**
	 * Configuration object type to determine a <code>ValueHelpItem</code> for a given value.
	 *
	 * @static
	 * @constant
	 * @typedef {object} sap.ui.mdc.valuehelp.base.ItemForValueConfiguration
	 * @property {any} value Value as entered by user
	 * @property {any} [parsedValue] Value parsed by type of key to match the data type of the key
	 * @property {any} [parsedDescription] Value parsed by type of description to match the data type of the description
	 * @property {object} [context] Contextual information provided by condition <code>payload</code> or <code>inParameters</code>/<code>outParameters</code>. This is only filled if the description needs to be determined for an existing condition.
	 * @property {object} [context.inParameter] In parameters of the current condition (<code>inParameters</code> are not used any longer, but it might be filled in older conditions stored in variants.)
	 * @property {object} [context.ouParameter] Out parameters of the current condition (<code>outParameters</code> are not used any longer, but it might be filled in older conditions stored in variants.)
	 * @property {object} [context.payload] Payload of the current condition
	 * @property {sap.ui.model.Context} [bindingContext] <code>BindingContext</code> of the checked field. Inside a table, the <code>ValueHelp</code> element might be connected to a different row.
	 * @property {boolean} checkKey If set, the value help checks only if there is an item with the given key. This is set to <code>false</code> if the value cannot be a valid key because of type validation.
	 * @property {boolean} checkDescription If set, the value help checks only if there is an item with the given description. This is set to <code>false</code> if only the key is used in the field.
	 * @property {boolean} [caseSensitive] If set, the check is done case-sensitively
	 * @property {boolean} [exactMatch] If set, only exact matches are requested and no suggestions
	 * @property {sap.ui.core.Control} control Instance of the calling control
	 * @public
	 */

	/**
	 * Determines the item (key and description) for a given value.
	 *
	 * The value help checks if there is an item with a key or description that fits this value.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValuedHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {sap.ui.mdc.valuehelp.base.ItemForValueConfiguration} oConfig Configuration
	 * @returns {Promise<sap.ui.mdc.valuehelp.ValueHelpItem>} Promise returning object containing description, key and payload.
	 * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 */
	ValueHelp.prototype.getItemForValue = function(oConfig) {
		// TODO: Discuss how we handle binding / typeahead changes ??
		const oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			return this._retrieveDelegateContent(oTypeahead).then(() => {
				oConfig.caseSensitive = oConfig.hasOwnProperty("caseSensitive") ? oConfig.caseSensitive : false; // If supported, search case insensitive
				const pGetItemPromise = oTypeahead.getItemForValue(oConfig);
				return pGetItemPromise;
			});
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

		const oTypeahead = this.getTypeahead();

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

		if (this.isDestroyed()) {
			return; // if destroyed meanwhile, don't update
		}

		_onConditionPropagation.call(this, ValueHelpPropagationReason.ControlChange);
		// as BindingContext of Field might change (happens if fast typed and ValueHelp not opened) update if needed
		_updateBindingContext.call(this);
	};

	/**
	 * Determines the icon for the value help.
	 *
	 * @returns {null|string} Name of the icon. If <code>null</code> no value help icon will be shown and it is used only as typeahead.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ValueHelp.prototype.getIcon = function() {

		const oTypeahead = this.getTypeahead();
		const oDialog = this.getDialog();

		if (oDialog) {
			return oDialog.getValueHelpIcon();
		} else if (oTypeahead) {
			return oTypeahead.getValueHelpIcon();
		}

	};

	ValueHelp.prototype.getMaxConditions = function() { // ?
		const oConfig = this.getProperty("_config");
		return (oConfig && oConfig.maxConditions) || -1;
	};

	ValueHelp.prototype.getDisplay = function() { // ? currently necessary to determine how to render the tokens in valuehelp
		return this.getProperty("_config")?.display || FieldDisplay.Value;
	};

	ValueHelp.prototype.getDataType = function() { // should only be of interest for content in the future, maybe provide such infos in an abstract way? (interface?)

	};

	function _onConditionPropagation(sReason, oConfig) {
		const oDelegate = this.bDelegateInitialized && this.getControlDelegate();
		if (oDelegate) {
			oDelegate.onConditionPropagation(this, sReason, oConfig || this.getProperty("_config"));
		}
	}

	function _handleNavigated(oEvent) {

		const oCondition = oEvent.getParameter("condition");
		this.fireNavigated({ condition: oCondition, itemId: oEvent.getParameter("itemId"), leaveFocus: oEvent.getParameter("leaveFocus"), caseSensitive: oEvent.getParameter("caseSensitive") });

	}

	function _handleVisualFocusSet(oEvent) {

		this.fireVisualFocusSet();

	}

	function _handleTypeaheadSuggested(oEvent) {

		const oCondition = oEvent.getParameter("condition");
		const sFilterValue = oEvent.getParameter("filterValue");
		const sItemId = oEvent.getParameter("itemId");
		const iItems = oEvent.getParameter("items");
		const bCaseSensitive = oEvent.getParameter("caseSensitive");
		this.fireTypeaheadSuggested({ condition: oCondition, filterValue: sFilterValue, itemId: sItemId, items: iItems, caseSensitive: bCaseSensitive });

	}

	function _handleSelect(oEvent) {


		const sType = oEvent.getParameter("type");
		const aEventConditions = oEvent.getParameter("conditions") || [];
		const oDelegate = this.getControlDelegate();

		const _findIndex = (oSearchCondition, aConditions) => aConditions.findIndex((oCondition) => oDelegate.compareConditions(this, oSearchCondition, oCondition));

		let aNextConditions;

		const bSingleSelect = this.getMaxConditions() === 1;

		if (bSingleSelect) {
			aNextConditions = sType === ValueHelpSelectionType.Remove ? [] : aEventConditions.slice(0, 1);
		}


		if (sType === ValueHelpSelectionType.Set) {
			aNextConditions = [].concat(bSingleSelect ? aEventConditions.slice(0, 1) : aEventConditions);
		}

		if (sType === ValueHelpSelectionType.Add) {
			if (bSingleSelect) {
				aNextConditions = aEventConditions.slice(0, 1);
			} else {
				aNextConditions = this.getConditions();
				for (let i = 0; i < aEventConditions.length; i++) {
					if (_findIndex(aEventConditions[i], aNextConditions) === -1) {
						aNextConditions.push(aEventConditions[i]);
					}
				}
			}
		}

		if (sType === ValueHelpSelectionType.Remove) {
			if (bSingleSelect) {
				aNextConditions = [];
			} else {
				aNextConditions = this.getConditions();
				for (let j = 0; j < aEventConditions.length; j++) {
					const iIndex = _findIndex(aEventConditions[j], aNextConditions);
					if (iIndex !== -1) {
						aNextConditions.splice(iIndex, 1);
					}
				}
			}
		}

		if (aNextConditions) {
			this.setProperty("conditions", aNextConditions, true); // TODO: update async to only update remove and add once
		}
	}

	function _handleConfirm(oEvent) {
		if (this.getProperty("_valid")) { // only confirm if valid
			const bSingleSelect = this.getMaxConditions() === 1;
			const bCloseParam = oEvent.getParameter("close");
			const bCloseAfterConfirm = typeof bCloseParam !== 'undefined' ? bCloseParam : bSingleSelect;
			let aConditions = this.getConditions();
			const bAdd = !bSingleSelect && !oEvent.getSource().isMultiSelect();
			if (bCloseAfterConfirm) {
				this.close();
			}
			aConditions = Condition._removeEmptyConditions(aConditions);
			aConditions = Condition._removeInitialFlags(aConditions);
			FilterOperatorUtil.updateConditionsValues(aConditions); // to remove static text from static conditions

			this.fireSelect({ conditions: aConditions, add: bAdd, close: bCloseAfterConfirm });
			_onConditionPropagation.call(this, ValueHelpPropagationReason.Select);
		}
	}


	function _handleCancel(oEvent) {

		this.close();

	}

	function _handleOpened(oEvent) {
		this.fireOpened({ container: oEvent.getSource(), itemId: oEvent.getParameter("itemId") });
	}

	function _handleClosed(oEvent) {
		this._removePromise("delegateContent");
		this._removePromise("navigate");
		this.fireClosed();
	}

	function _observeChanges(oChanges) {
		if (["typeahead", "dialog"].indexOf(oChanges.name) !== -1) {
			const oContainer = oChanges.child;

			const bAdded = oChanges.mutation === "insert";
			const fnEvent = bAdded ? oContainer.attachEvent.bind(oContainer) : oContainer.detachEvent.bind(oContainer);

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

			if (oContainer.attachVisualFocusSet) {
				fnEvent("visualFocusSet", _handleVisualFocusSet, this);
			}

			if (oContainer.attachTypeaheadSuggested) {
				fnEvent("typeaheadSuggested", _handleTypeaheadSuggested, this);
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

		const oBindingContext = this._oControl ? this._oControl.getBindingContext() : null; // if not connected use no BindingContext
		this.setBindingContext(oBindingContext);
	}

	function _getValueHelpContainer(bPreferTypeahead) {

		const oTypeahead = this.getTypeahead();
		const bUseAsValueHelp = !!oTypeahead && oTypeahead.getUseAsValueHelp();
		const oDialog = this.getDialog();

		if (bPreferTypeahead) {
			return (bUseAsValueHelp || oDialog || Device.system.phone) && oTypeahead || oDialog; // on phone open typeahead on click/focus even if not defined as ValueHelp
		} else {
			return oDialog || bUseAsValueHelp && oTypeahead;
		}
	}

	// overwrite standard logic of Element to use FieldGroups of connected Field for all content (children aggregations)
	ValueHelp.prototype._getFieldGroupIds = function() {

		const oControl = this.getControl();

		if (oControl) {
			return oControl.getFieldGroupIds();
		} else {
			return Element.prototype._getFieldGroupIds.apply(this, arguments);
		}

	};

	/**
	 * Temporarily highlights a typeahead item identified by it's id.
	 * Navigation events or other updates may lead to the item no longer being highlighted.
	 *
	 * @param {string} sHighlightId control id of the item to be highlighted
	 *
	 * @private
 	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.123.0
	 */
	ValueHelp.prototype.setHighlightId = function(sHighlightId) {
		this.getTypeahead()?.setHighlightId(sHighlightId);
	};

	PromiseMixin.call(ValueHelp.prototype);


	return ValueHelp;

});