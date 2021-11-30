/*
 * ! ${copyright}
 */


/*
	TODO: Remove!

	<ValueHelp>
		<typeahead>
			<valuehelp.Popover useFirstMatch="true">
				<popover.MTableContent><mTable/></popover.MTableContent>
			</valuehelp.Popover>
		</typeahead>
		<dialog>
			<valueHelp.Dialog title="My cool Dialog">
				<dialog.MdcTableContent title="List View" keyPath="ID" descriptionPath="descr">
					<filterbar><FilterBar/></filterbar>
					<mdc.Table/>
				</dialog.MdcTableContent>
				<dialog.Conditions title="Condition View"/>
			</valueHelp.Dialog>
		</dialog>
	</ValueHelp>
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
	'sap/base/util/deepEqual'
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
	deepEqual
) {
	"use strict";

	/**
	 * Constructor for a new <code>ValueHelp</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Element for the <code>FieldHelp</code> association in the <code>FieldBase</code> controls.
	 * @extends sap.ui.mdc.Element
	 * @implements sap.ui.core.PopupInterface
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.91.0
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
				 * If this property is set, the user input is validated against the value help.
				 * If no entry is found for the user input, an error occurs.
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
				},
				/**
				 * Internal property to allow to bind the conditions created by InParameters to content
				 */
				_inConditions: {
					type: "object",
					defaultValue: {},
					byValue: true,
					visibility: "hidden"
				},
				/**
				 * Internal property to allow to bind the paths used by OutParameters to content
				 */
				_outParameters: {
					type: "string[]",
					defaultValue: [],
					byValue: true,
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
				},

				/**
				 * Sets the in parameters of a field help.
				 *
				 * If set, the value help reads the data of these entities in the model and uses it to filter in the value help.
				 *
				 * <b>Note:</b> In parameters are only used if the content of the value help supports it
				 */
				inParameters: {
					type: "sap.ui.mdc.field.InParameter",
					group: "Data",
					multiple: true
				},

				/**
				 * Sets the out parameters of a field help.
				 *
				 * If set, the fields sets the data of these entities in the model based to the selected values.
				 *
				 * <b>Note:</b> Out parameters are only used if the content of the value help supports it
				 */
				outParameters: {
					type: "sap.ui.mdc.field.OutParameter",
					group: "Data",
					multiple: true
				}
			},
			events: {
				/**
				 * This event is fired when a value is selected in the field help.
				 *
				 * <b>Note:</b> This event must only be handled by the control the <code>FieldHelp</code> element
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
						 * Indicator if the field help is closed while selection
						 */
						close: {type: "boolean"}
					}
				},

				/**
				 * This event is fired when the <code>FieldHelp</code> element is disconnected from a control.
				 *
				 * <b>Note:</b> This event must only be handled by the control the <code>FieldHelp</code> element
				 * belongs to, not by the application.
				 */
				disconnect: {
				},

				/**
				 * This event is fired after the field help has been closed.
				 */
				closed: {},

				/**
				 * This event is fired after the user navigated in the value help.
				 */
				navigated: {
					parameters: {
						/**
						 * True if the focus should be set back to the field.
						 */
						bLeaveFocus: { type: "boolean" },
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
			aggregations: ["inParameters", "outParameters", "typeahead", "dialog"]
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
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	ValueHelp.prototype._retrieveDelegateContent = function(oContainer) {
		return this._retrievePromise("delegateContent--" + oContainer.getId(), function() {
			var oDelegatePromise = this._getControlDelegatePromise();
			return oDelegatePromise.then(function (oDelegateModule) {
				return oDelegateModule.retrieveContent(this.getPayload(), oContainer); // TODO: wait until In/OutParameter bindings finished?
			}.bind(this));
		}.bind(this));
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ValueHelp.prototype.open = function(bTypeahead) {
		var oContainer = bTypeahead ? this.getTypeahead() : _getValueHelpContainer.call(this);

		var oOtherContainer = bTypeahead ? this.getDialog() : this.getTypeahead();
		if (oOtherContainer && oContainer !== oOtherContainer && (oOtherContainer.isOpen() || oOtherContainer.isOpening())) {
			oOtherContainer.close(); 	// TODO: Check container to be fully closed via promise
		}

		if (oContainer && !oContainer.isOpen() && !oContainer.isOpening()) {
			this._removePromise("delegateContent" + "--" + oContainer.getId());
			oContainer.open(this._retrieveDelegateContent(oContainer, true));
		}
	};

	function _handleRequestDelegateContent(oEvent) {
		var oContainer = oEvent.getParameter("container");
		this._removePromise("delegateContent" + "--" + oContainer.getId());
		this._retrieveDelegateContent(oContainer);
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ValueHelp.prototype.isOpen = function() {
		var oTypeahead = this.getTypeahead();
		var oDialog = this.getDialog();
		return (oTypeahead && oTypeahead.isOpen()) || (oDialog && oDialog.isOpen());
	};

	/**
	 * Skips the opening of the value help if it is pending because of loading content.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * Calls initialization of the ValueHelp before the ValueHelp is really opened.
	 * This is called in Typeahead on first letter before the ValueHelp is opened with a delay. So the
	 * content can be determined in the delegate coding early.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {boolean} bTypeahead Flag that determines whether value help is opened for suggestion or for complex help
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * As this could be asyncron as data might be loaded a promise is returned.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValueHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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

	ValueHelp.prototype.getTextForKey = function (vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName) {
		return this.getItemForValue({
			parsedValue: vKey,
			value: vKey,
			inParameters: oInParameters,
			outParameters: oOutParameters,
			bindingContext: oBindingContext,
			conditionModel: oConditionModel,
			conditionModelName: sConditionModelName,
			checkKey: true,
			exception: FormatException,
			caseSensitive: true // case sensitive as used to get description for known key
		});
	};

	ValueHelp.prototype.getKeyForText = function(sText, oInParameters) {
		return this.getItemForValue({
			value: sText,
			inParameters: oInParameters,
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
	 * @param {object} [oConfig.inParameters] In parameters for the key (as a key must not be unique.)
	 * @param {object} [oConfig.outParameters] Out parameters for the key (as a key must not be unique.)
	 * @param {sap.ui.model.Context} [oConfig.bindingContext] <code>BindingContext</code> of the checked field. Inside a table the <code>ValueHelp</code> element might be connected to a different row.
	 * @param {boolean} [oConfig.checkKeyFirst] If set, the value help checks first if the value fits a key // TODO: not longer needed?
	 * @param {boolean} oConfig.checkKey If set, the value help checks only if there is an item with the given key. This is set to <code>false</code> if the value cannot be a valid key because of type validation.
	 * @param {boolean} oConfig.checkDescription If set, the value help checks only if there is an item with the given description. This is set to <code>false</code> if only the key is used in the field.
	 * @param {sap.ui.mdc.condition.ConditionModel} [oConfig.conditionModel] <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @param {string} [oConfig.conditionModelName] Name of the <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @param {boolean} [oConfig.caseSensitive] If set, the check is done case sensitive
	 * @returns {Promise<sap.ui.mdc.field.FieldHelpItem>} Promise returning object containing description, key, in and out parameters.
	 * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ValueHelp.prototype.getItemForValue = function(oConfig) {
		// TODO: Discuss how we handle binding / typeahead changes ??
		var oTypeahead = this.getTypeahead();
		if (oTypeahead) {
			//TODO: determine values from Inparameters from BindingContext (If not given from outside)
			var aPromiseKey = ["getItemForValue", oConfig.parsedValue || oConfig.value, JSON.stringify(oConfig.oInParameters), oConfig.oBindingContext && oConfig.oBindingContext.getPath()];
			var sPromisekey = aPromiseKey.join("_");
			return this._retrievePromise(sPromisekey, function () {
				return this._retrieveDelegateContent(oTypeahead).then(function() {
					var aInBindings = _getParameterBinding.call(this, this.getInParameters(), oConfig.bindingContext, oConfig.conditionModel, oConfig.conditionModelName);
					return _checkBindingsPending.call(this, aInBindings).then(function() {
						oConfig.inParameters = _getParameterFilter.call(this, oConfig.inParameters, this.getInParameters(), aInBindings, oConfig.bindingContext);
						oConfig.outParameters = null; // TODO: do we want to check for OutParameters if provided? (normally not needed)
						oConfig.caseSensitive = oConfig.hasOwnProperty("caseSensitive") ? oConfig.caseSensitive : false; // If supported, search case insensitive

						return oTypeahead.getItemForValue(oConfig).then(function(oItem) {
							_cleanupParameterBinding.call(this, aInBindings);
							if (oItem.inParameters) {
								oItem.inParameters = _mapParametersToField.call(this, oItem.inParameters, this.getInParameters());
							}
							if (oItem.outParameters) {
								oItem.outParameters = _mapParametersToField.call(this, oItem.outParameters, this.getOutParameters());
							}
							return oItem;
						}.bind(this));
					}.bind(this));
				}.bind(this));
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ValueHelp.prototype.onControlChange = function() {

		if (this.bIsDestroyed) {
			return; // if destroyed meanwhile, don't update
		}
		// apply out-parameters
		var aOutParameters = this.getOutParameters();

		// as BindingContext of Field might change (happens if fast typed and FieldHelp not opened) update if needed
		_updateBindingContext.call(this);

		// if OutParameters are bound and binding is pending, wait until finished
		var aOutBindings = _getParameterBinding.call(this, aOutParameters); // do not provide BindingContext or ConditionModel, as only the current binding is used
		_checkBindingsPending.call(this, aOutBindings).then(function() {
			var aConditions = this.getConditions();
			for (var j = 0; j < aOutParameters.length; j++) {
				var oOutParameter = aOutParameters[j];
				var vValue = oOutParameter.getValue();
				var bUseConditions = oOutParameter.getUseConditions();
				var bUpdate = true;
				if (oOutParameter.getMode() === OutParameterMode.WhenEmpty) {
					if (bUseConditions) {
						bUpdate = !vValue || (Array.isArray(vValue) && vValue.length === 0);
					} else {
						bUpdate = !vValue;
					}
				}
				if (bUpdate) {
					var vNewValue;
					var oNewCondition;
					if (bUseConditions) {
						if (!Array.isArray(vValue)) {
							throw new Error("Value on OutParameter must be an array " + oOutParameter);
						}
						vNewValue = merge([], vValue);
					} else {
						vNewValue = vValue;
					}
					if (!oOutParameter.getHelpPath()) { // use fixed value
						if (bUseConditions) {
							oNewCondition = Condition.createCondition("EQ", [oOutParameter.getFixedValue()], undefined, undefined, ConditionValidated.Validated);
							if (FilterOperatorUtil.indexOfCondition(oNewCondition, vNewValue) < 0) {
								vNewValue.push(oNewCondition);
							}
						} else {
							vNewValue = oOutParameter.getFixedValue();
						}
					} else {
						for (var i = 0; i < aConditions.length; i++) {
							var oCondition = aConditions[i];
							if (oCondition.outParameters) {
								for ( var sPath in oCondition.outParameters) {
									if (oOutParameter.getFieldPath() === sPath) { // in Conditions fieldPath is used
										if (bUseConditions) {
											oNewCondition = Condition.createCondition("EQ", [oCondition.outParameters[sPath]], undefined, undefined, ConditionValidated.Validated); // as choosen from help -> validated

											// TODO: handle in/out Parameters in ConditionModel (to let the condition know it's out-Parameters)
											if (FilterOperatorUtil.indexOfCondition(oNewCondition, vNewValue) < 0) {
												vNewValue.push(oNewCondition);
											}
										} else {
											vNewValue = oCondition.outParameters[sPath];
										}
									}
								}
							}
						}
					}
					if (bUseConditions) {
						FilterOperatorUtil.checkConditionsEmpty(vNewValue); // to set isEmpty same as on directly selected in ValueHelp
					}
					oOutParameter.setValue(vNewValue);
				}
			}
		}.bind(this));

	};

	/**
	 * Determines the icon for the value help.
	 *
	 * @returns {string} Name of the icon
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * If only typeahead is enabled the field should not show a valuehelp icon or open the valuehelp using F4.
	 *
	 * @returns {boolean} <code>true</code> if value help is enabled, <code>false</code> if only typeahead is enabled
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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

	function _handleNavigated(oEvent) {

		var oCondition = _mapConditionParametersToField.call(this, oEvent.getParameter("condition"));
		this.fireNavigated({condition: oCondition, itemId: oEvent.getParameter("itemId"), leaveFocus: oEvent.getParameter("leaveFocus")});

	}

	function _handleSelect(oEvent) {

		var bSingleSelect = this.getMaxConditions() === 1;

		var sType = oEvent.getParameter("type");
		var aEventConditions = oEvent.getParameter("conditions") || [];
		var aNextConditions;

		if (bSingleSelect) {
			aEventConditions = aEventConditions.slice(0,1); // only use first condition of event
		}

		if (sType === SelectType.Set || sType === SelectType.Add) {
			aNextConditions = sType === SelectType.Set || bSingleSelect ? [] : this.getConditions();

			for (var i = 0; i < aEventConditions.length; i++) {
				var oNewCondition = _mapConditionParametersToField.call(this, aEventConditions[i]);
				//if (FilterOperatorUtil.indexOfCondition(oNewCondition, aNextConditions) === -1) {
					aNextConditions.push(oNewCondition);
				//}
			}
		} else if (sType === SelectType.Remove) {
			aNextConditions = bSingleSelect ? [] : this.getConditions(); // in SingleSelect just remove existing condition
			for (var j = 0; j < aEventConditions.length; j++) {
				var oRemoveCondition = _mapConditionParametersToField.call(this, aEventConditions[j]);
				var iIndex = FilterOperatorUtil.indexOfCondition(oRemoveCondition, aNextConditions);
				if (iIndex >= 0) {
					aNextConditions.splice(iIndex, 1);
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
		}

	}

	function _handleCancel(oEvent) {

		this.close();

	}

	function _handleOpened(oEvent) {

	}

	function _handleClosed(oEvent) {
		var oContainer = oEvent.getSource();
		this._removePromise("delegateContent--" + oContainer.getId());
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

		if (oChanges.object == this) { // ValueHelp
			if (oChanges.name === "inParameters") {
				_inParametersChanged.call(this, oChanges.child, oChanges.mutation);
			}

			if (oChanges.name === "outParameters") {
				_outParametersChanged.call(this, oChanges.child, oChanges.mutation);
			}
		} else if (oChanges.object.isA("sap.ui.mdc.field.OutParameter")){
			if (oChanges.name === "helpPath") {
				_outParameterPathChanged.call(this, oChanges.current, oChanges.old);
			}
		} else if (oChanges.object.isA("sap.ui.mdc.field.InParameter")){
			if (oChanges.name === "value") {
				_inParameterValueChanged.call(this, oChanges.object.getHelpPath(), oChanges.current, oChanges.object.getUseConditions(), oChanges.object.getInitialValueFilterEmpty());
			}
			if (oChanges.name === "helpPath") {
				_inParameterPathChanged.call(this, oChanges.current, oChanges.old, oChanges.object.getValue(), oChanges.object.getUseConditions(), oChanges.object.getInitialValueFilterEmpty());
			}
		}

	}

	function _inParametersChanged(oInParameter, sMutation) {

		var sFilterPath = oInParameter.getHelpPath();

		if (sMutation === "remove") {
			this._oObserver.unobserve(oInParameter);
			var oInConditions = this.getProperty("_inConditions");
			delete oInConditions[sFilterPath];
			this.setProperty("_inConditions", oInConditions, true);
		} else {
			this._oObserver.observe(oInParameter, {properties: ["value", "helpPath"]});
			_inParameterValueChanged.call(this, sFilterPath, oInParameter.getValue(), oInParameter.getUseConditions(), oInParameter.getInitialValueFilterEmpty());
		}

	}

	function _inParameterValueChanged(sFilterPath, vValue, bUseConditions, bInitialValueFilterEmpty) {

		var oInConditions = this.getProperty("_inConditions");
		var oCondition;

		oInConditions[sFilterPath] = [];

		if (bUseConditions) {
			if (Array.isArray(vValue)) {
				for (var i = 0; i < vValue.length; i++) {
					oCondition = merge({}, vValue[i]);
					// change paths of in- and out-parameters
					if (oCondition.inParameters) {
						oCondition.inParameters = _mapParametersToHelp.call(this, oCondition.inParameters, this.getInParameters());
					}
					if (oCondition.outParameters) {
						oCondition.outParameters = _mapParametersToHelp.call(this, oCondition.outParameters, this.getOutParameters());
					}

					oInConditions[sFilterPath].push(oCondition);
				}
			}
		} else {
			if (!vValue && bInitialValueFilterEmpty) {
				oCondition = Condition.createCondition("Empty", []);
				oCondition.isEmpty = false; // no explicit check needed
			} else {
				// TODO: way to provide description on InParameter
				// validated to let FilterField determine description if visible on FilterBar.
				// Also to show it as selected on table in FieldHelp of FilterField.
				oCondition = Condition.createItemCondition(vValue);
				oCondition.validated = ConditionValidated.Validated;
			}
			oInConditions[sFilterPath].push(oCondition);
		}

		this.setProperty("_inConditions", oInConditions, true);

	}

	function _inParameterPathChanged(sFilterPath, sOldFilterPath, vValue, bUseConditions, bInitialValueFilterEmpty) {

		var oInConditions = this.getProperty("_inConditions");

		delete oInConditions[sOldFilterPath];
		this.setProperty("_inConditions", oInConditions, true);

		_inParameterValueChanged.call(this, sFilterPath, vValue, bUseConditions, bInitialValueFilterEmpty);

	}

	function _outParametersChanged(oOutParameter, sMutation) {

		var sFilterPath = oOutParameter.getHelpPath();
		var aOutParameters = this.getProperty("_outParameters");
		var iIndex = aOutParameters.indexOf(sFilterPath);

		if (sMutation === "remove") {
			this._oObserver.unobserve(oOutParameter);
			if (iIndex > -1) {
				aOutParameters.splice(iIndex, 1);
			}
		} else {
			this._oObserver.observe(oOutParameter, {properties: ["helpPath"]});
			if (iIndex === -1) {
				aOutParameters.push(sFilterPath);
			}
		}

		this.setProperty("_outParameters", aOutParameters, true);

	}

	function _outParameterPathChanged(sFilterPath, sOldFilterPath) {

		var aOutParameters = this.getProperty("_outParameters");
		var iIndex = aOutParameters.indexOf(sOldFilterPath);
		if (iIndex > -1) {
			aOutParameters[iIndex] = sFilterPath;
		}

		this.setProperty("_outParameters", aOutParameters, true);

	}

	function _mapParametersToHelp(oParameters, aParameters) {

		var oHelpParameters;

		if (aParameters.length > 0) {
			for (var sMyFieldPath in oParameters) {
				for (var i = 0; i < aParameters.length; i++) {
					var oParameter = aParameters[i];
					var sHelpPath = "conditions/" + oParameter.getHelpPath(); // if InParameter of InParameter it is part of the same FilterBar
					var sFieldPath = oParameter.getFieldPath();
					if (sFieldPath && (sFieldPath === sMyFieldPath || sFieldPath === "conditions/" + sMyFieldPath) && sHelpPath) { // support also old saved conditions without "conditions/" in name
						if (!oHelpParameters) {
							oHelpParameters = {};
						}
						oHelpParameters[sHelpPath] = oParameters[sMyFieldPath];
					}
				}
			}
		}

		return oHelpParameters;

	}

	function _mapParametersToField(oParameters, aParameters) {

		if (!oParameters || aParameters.length === 0) {
			return null; // should not happen
		}

		var oFieldParameters = {};

		for (var i = 0; i < aParameters.length; i++) {
			var oParameter = aParameters[i];
			var sHelpPath = oParameter.getHelpPath();
			var sFieldPath = oParameter.getFieldPath();
			if (sHelpPath && sFieldPath) {
				for (var sMyFieldPath in oParameters) {
					if ([sHelpPath,sFieldPath].indexOf(sMyFieldPath) >= 0) {
						oFieldParameters[sFieldPath] = oParameters[sMyFieldPath];
						break;
					}
				}
			} else if (!sHelpPath && sFieldPath && oParameter.getFixedValue) {
				// if helpPath is not set we expect a fix value for out-parameter
				oFieldParameters[sFieldPath] = oParameter.getFixedValue(); // TODO: do we want to add fixedValues to condition?
			}
		}

		return oFieldParameters;

	}

	function _mapConditionParametersToField(oCondition) {

		oCondition = merge({}, oCondition);
		if (oCondition.inParameters) {
			oCondition.inParameters = _mapParametersToField.call(this, oCondition.inParameters, this.getInParameters());
		}
		if (oCondition.outParameters) {
			oCondition.outParameters = _mapParametersToField.call(this, oCondition.outParameters, this.getOutParameters());
		}
		return oCondition;

	}

	function _updateBindingContext() {

		var oBindingContext = this._oControl ? this._oControl.getBindingContext() : null; // if not connected use no BindingContext
		this.setBindingContext(oBindingContext);

		// in FilterField case also set right ConditionModel
		var oConfig = this.getProperty("_config");
		if (oConfig && oConfig.conditionModel && this.getModel(oConfig.conditionModelName) !== oConfig.conditionModel) { // don't update propagated model
			this.setModel(oConfig.conditionModel, oConfig.conditionModelName);
		}

	}

	function _getParameterBinding(aParameters, oBindingContext, oConditionModel, sConditionModelName) {

		var aBindings = [];
		var bBindingChanged = false;
		var oMyBindingContext;

		if (oBindingContext) {
			oMyBindingContext = this.oBindingContexts[undefined]; // as getBindingContext returns propagated Context if own context don't fit to model
			if (oBindingContext && Context.hasChanged(oMyBindingContext, oBindingContext)) {
				bBindingChanged = true;
			}
		}

		for (var i = 0; i < aParameters.length; i++) {
			var oParameter = aParameters[i];
			var oBinding = oParameter.getBinding("value");

			if (oParameter.getUseConditions() && oConditionModel) {
				// if ConditionModel is used, check if Binding is OK and same ConditionModel is used
				var oMyConditionModel = this.getModel(sConditionModelName);
				if (oMyConditionModel !== oConditionModel) {
					// no or different ConditionModel -> create new binding on given ConditionModel
					oBinding = oConditionModel.bindProperty("/" + oParameter.getFieldPath());
					oBinding._bValueHelp = true; // to make cleanup easier
					aBindings.push(oBinding);
				}
			} else if (oBinding) {
				var sPath = oBinding.getPath();
				var oParameterBindingContext = oBinding.getContext();

				if (bBindingChanged && oBinding.isRelative() && (oParameterBindingContext === oMyBindingContext || (!oParameterBindingContext && oMyBindingContext))) {
					// InParameter is bound and uses the same BindingContext like the FieldHelp or has no BindingContext right now.
					// If InParameter is bound to a different BindingContext just use this one.
					if (oBindingContext.getProperty(sPath) === undefined) {
						// if value is already known in BindingContext from other existing Binding, don't request again.
						var oModel = oBinding.getModel();
						oBinding = oModel.bindProperty(sPath, oBindingContext);
						oBinding._bValueHelp = true; // to make cleanup easier
						aBindings.push(oBinding);
					}
				} else if ((!oParameterBindingContext && oBinding.isRelative()) // we don't have a BindingContext but need one -> need to wait for one
							|| (oParameterBindingContext && oParameterBindingContext.getProperty(sPath) === undefined) // the BindingContext has no data right now -> need to wait for update
							|| oBinding.getValue() === undefined // the Binding has no data right now, need to wait for update
							|| (oParameterBindingContext && !deepEqual(oParameter.validateProperty("value", oParameterBindingContext.getProperty(sPath)), oParameter.getValue()))) { // value not alreday set
						// Property not already known on BindingContext or not already updated in Parameter value
						// use validateProperty as null might be converted to undefined, if invalid value don't run into a check
						// use deepEqual as, depending on type, the value could be complex (same logic as in setProperty)
						aBindings.push(oBinding);
					}
			}
		}

		return aBindings;

	}

	function _cleanupParameterBinding(aBindings) {

		for (var i = 0; i < aBindings.length; i++) {
			if (aBindings[i]._bValueHelp) {
				aBindings[i].destroy();
			}
		}

	}

	function _checkBindingsPending(aBindings) {

		var oDelegatePromise = this._getControlDelegatePromise();
		return oDelegatePromise.then(function (oDelegateModule) {
			if (aBindings.length === 0) {
				return null;
			}

			return oDelegateModule.checkBindingsPending(this.getPayload(), aBindings);
		}.bind(this));

	}

	function _getParameterFilter(oParameters, aParameters, aBindings, oBindingContext) {

		if (aParameters.length === 0) {
			return null;
		}

		var oConditions = {};
		var oCondition;
		var oParameter;
		var sHelpPath;
		var sFieldPath;
		var i = 0;

		if (oParameters) {
			// InParameters provided for value -> use it
			for (var sMyFieldPath in oParameters) {
				for (i = 0; i < aParameters.length; i++) {
					oParameter = aParameters[i];
					sHelpPath = oParameter.getHelpPath();
					sFieldPath = oParameter.getFieldPath();
					if (sFieldPath && sHelpPath && (sFieldPath === sMyFieldPath || sFieldPath === "conditions/" + sMyFieldPath)) { // support also old saved conditions without "conditions/" in name
						oConditions[sHelpPath] = [];
						oCondition = Condition.createItemCondition(oParameters[sMyFieldPath]);
						oCondition.validated = ConditionValidated.Validated;
						oConditions[sHelpPath].push(oCondition);
					}
				}
			}
		} else {
			// use current values of in/out-parameters
			// If Bindings are provided (from different BindingContext) use the value of this Binding
			var oMyBindingContext = this.getBindingContext();
			for (i = 0; i < aParameters.length; i++) {
				oParameter = aParameters[i];
				sHelpPath = oParameter.getHelpPath();
				if (sHelpPath) {
					var vValue = oParameter.getValue();
					var bUseConditions = oParameter.getUseConditions();
					var bInitialValueFilterEmpty = oParameter.getInitialValueFilterEmpty();
					var j = 0;
					if ((aBindings && aBindings.length > 0) || oBindingContext) {
						var oBinding = oParameter.getBinding("value");
						var bFound = false;
						if (oBinding || bUseConditions) {
							sFieldPath = oParameter.getFieldPath();
							for (j = 0; j < aBindings.length; j++) {
								if ((oBinding && oBinding.getPath() === aBindings[j].getPath()) ||
										(bUseConditions && aBindings[j].getPath() === "/" + sFieldPath)) {
									vValue = aBindings[j].getValue();
									bFound = true;
									break;
								}
							}
							if (!bFound && !bUseConditions && oBindingContext && oBinding && oBinding.isRelative() && (!oBinding.getContext() || (oBinding.getContext() !== oBindingContext && oBinding.getContext() === oMyBindingContext))) {
								// no new binding created and different BindingContext -> use propery from BindingConext (was already read before)
								vValue = oBindingContext.getProperty(oBinding.getPath());
							}
						}
					}

					// create Filter statements here as here the data type of the Parameters can be determined
					// allow multiple values
					// ignore empty conditions for filtering
					oConditions[sHelpPath] = [];
					if (bUseConditions) { // just use conditions
						for (j = 0; j < vValue.length; j++) {
							oCondition = merge({}, vValue[j]);
							// change paths of in- and out-parameters
							if (oCondition.inParameters) {
								oCondition.inParameters = _mapParametersToHelp.call(this, oCondition.inParameters, this.getInParameters());
							}
							if (oCondition.outParameters) {
								oCondition.outParameters = _mapParametersToHelp.call(this, oCondition.outParameters, this.getOutParameters());
							}
							oConditions[sHelpPath].push(oCondition);
						}
					} else {
						if (!vValue && bInitialValueFilterEmpty) {
							oCondition = Condition.createCondition("Empty", []);
							oCondition.isEmpty = false; // no explicit check needed
						} else if (vValue) {
							oCondition = Condition.createItemCondition(vValue);
							oCondition.validated = ConditionValidated.Validated;
						}
						if (oCondition) {
							oConditions[sHelpPath].push(oCondition);
						}
					}
					oCondition = undefined;
				}
			}
		}

		// return filters for filtering
		var oConditionTypes = _getTypesForConditions.call(this, oConditions);
		var oFilter = FilterConverter.createFilters(oConditions, oConditionTypes);

		return oFilter;

	}

	function _getTypesForConditions(oConditions) {

		var aInParameters = this.getInParameters();
		var oConditionTypes = {};
		var sFieldPath;

		// collect condition Fieldpaths here
		for (sFieldPath in oConditions) {
			var oType;
			// try to find missing type from InParameter
			for (var i = 0; i < aInParameters.length; i++) {
				var oInParameter = aInParameters[i];
				if (oInParameter.getHelpPath() === sFieldPath) {
					oType = oInParameter.getDataType();
					break;
				}
			}

			oConditionTypes[sFieldPath] = {type: oType};
		}

		return oConditionTypes;

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


/*

Valuehelp Interface:
	_getOperator
	_getControlForSuggestion
	getFieldPath

*/
