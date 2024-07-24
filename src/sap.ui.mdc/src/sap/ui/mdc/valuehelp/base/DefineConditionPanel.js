/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/base/ManagedObjectObserver',
	'sap/base/i18n/Localization',
	'sap/base/util/merge',
	'sap/base/util/deepEqual',
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/Messaging",
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/field/ConditionsType',
	'sap/ui/mdc/field/splitValue',
	'sap/ui/mdc/enums/FieldEditMode',
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/OperatorValueType',
	'sap/ui/mdc/Field',
	'sap/ui/mdc/ValueHelp',
	'sap/ui/mdc/valuehelp/Popover',
	'sap/ui/mdc/valuehelp/content/FixedList',
	'sap/ui/mdc/valuehelp/content/FixedListItem',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/type/String',
	'sap/ui/model/ParseException',
	'sap/ui/core/library',
	'sap/ui/core/InvisibleText',
	'sap/ui/layout/Grid',
	'sap/ui/layout/GridData',
	'sap/m/library',
	'sap/m/Button',
	'sap/m/Panel',
	'sap/m/OverflowToolbar',
	'sap/m/OverflowToolbarLayoutData',
	'sap/m/ToolbarSpacer',
	'sap/m/Text',
	'sap/m/Title',
	'sap/ui/core/IconPool',
	'sap/ui/core/InvisibleMessage',
	'sap/ui/thirdparty/jquery'
], (
	Control,
	ManagedObjectObserver,
	Localization,
	merge,
	deepEqual,
	Element,
	Library,
	Messaging,
	Condition,
	FilterOperatorUtil,
	ConditionsType,
	splitValue,
	FieldEditMode,
	FieldDisplay,
	BaseType,
	ConditionValidated,
	OperatorValueType,
	Field,
	ValueHelp,
	Popover,
	FixedList,
	FixedListItem,
	ManagedObjectModel,
	JSONModel,
	ResourceModel,
	StringType,
	ParseException,
	coreLibrary,
	InvisibleText,
	Grid,
	GridData,
	mLibrary,
	Button,
	Panel,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	ToolbarSpacer,
	Text,
	Title,
	IconPool,
	InvisibleMessage,
	jQuery
) => {
	"use strict";

	// translation utils
	let oMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	let oMessageBundleM = Library.getResourceBundleFor("sap.m");
	Localization.attachChange(() => {
		oMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
		oMessageBundleM = Library.getResourceBundleFor("sap.m");
	});

	const { ButtonType } = mLibrary;
	const { ValueState } = coreLibrary;
	const { InvisibleMessageMode } = coreLibrary;
	const { TextAlign } = coreLibrary;
	const { BackgroundDesign } = mLibrary;
	const { ToolbarDesign } = mLibrary;
	const { OverflowToolbarPriority } = mLibrary;

	/**
	 * Constructor for a new <code>DefineConditionPanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>DefineConditionPanel</code> control is used inside the <code>ValueHelp</code> content to enter different types
	 * of conditions.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.valuehelp.base.DefineConditionPanel
	 * @since 1.58.0
	 * @abstract
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.content.Conditions
	 */
	const DefineConditionPanel = Control.extend("sap.ui.mdc.valuehelp.base.DefineConditionPanel", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Sets the conditions that represent the selected values of the help.
				 *
				 * <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
				 * @since 1.62.0
				 */
				conditions: {
					type: "object[]",
					group: "Data",
					defaultValue: [],
					byValue: true
				},

				/**
				 * Internal configuration
				 *
				 * <b>Note:</b> This property must not be set from outside, it used to forward the configuration of the <code>ValueHelp</code>
				 * @since 1.115.0
				 */
				config: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * The <code>label</code> for the <code>DefineConditionPanel</code> used as panel headerText.
				 *
				 * @since 1.84.0
				 */
				label: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * If set, there has been no invalid user input.
				 *
				 * <b>Note:</b> This property must not be set from outside. It is a property because that way it can be bound to the
				 * <code>ManagedObjectModel</code> of the calling value help and automatically update it.
				 *
				 * @since 1.87.0
				 */
				inputOK: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Indicates if pagination is active
				 *
				 * @since 1.113.0
				 * @private
				 */
				_pagination: {
					type: "boolean",
					defaultValue: false,
					visibility: "hidden"
				},

				/**
				 * Indicates if previous button is active
				 *
				 * @since 1.121.0
				 * @private
				 */
				_prevButtonActive: {
					type: "boolean",
					defaultValue: false,
					visibility: "hidden"
				},

				/**
				 * Indicates if next button is active
				 *
				 * @since 1.121.0
				 * @private
				 */
				_nextButtonActive: {
					type: "boolean",
					defaultValue: false,
					visibility: "hidden"
				}

			},
			aggregations: {
				/**
				 * Internal content that is rendered.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				/**
				 * Optional <code>ValueHelp</code>.
				 *
				 * This is an association that allows the usage of one <code>ValueHelp</code> instance for the value fields for the <code>DefineConditionPanel</code>.
				 *
				 * <b>Note:</b> The fields are single-value input, and the display is always set to <code>FieldDisplay.Value</code>. Only a <code>ValueHelp</code> with a <code>TypeAhead</code> and single-selection <code>MTable</code> can be used.
				 *
				 * <b>Note:</b> For <code>Boolean</code>, <code>Date</code>, or <code>Time</code>, no <code>ValueHelp</code> should be added, but a default <code>ValueHelp</code> used instead.
				 */
				valueHelp: {
					type: "sap.ui.mdc.ValueHelp",
					multiple: false
				}
			},
			events: {
				/**
				 * Event is fired if the user processes a condition. (Not known if changed.)
				 */
				conditionProcessed: {}
			}
		},
		_oManagedObjectModel: null,

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("section", oControl);
				oRm.class("sapUiMdcDefineConditionPanel");
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("_content"));
				oRm.close("section");
			}
		},

		init: function() {
			Messaging.registerObject(this, true);

			Control.prototype.init.apply(this, arguments);

			this.oInvisibleMessage = InvisibleMessage.getInstance();

			this._oManagedObjectModel = new ManagedObjectModel(this);

			this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

			this._oObserver.observe(this, {
				properties: ["conditions", "config"]
			});

			this._iStartIndex = 0;
			this._iShownConditions = 10;
			this._iShownAdditionalConditions = 0; // to not switch page by addings conditions, new conditions are shown on the current page even if there are more than the limit
			this._sOperatorHelpId = this.getId() + "--rowSelect-help";

			this._oContentEventDelegate = {
				onpaste: this.onPaste
			};

			_createInnerControls.call(this);
			this.setModel(this._oManagedObjectModel, "$this");
			this.setModel(this._oManagedObjectModel, "$condition"); // TODO: better solution to have 2 bindingContexts on one control
		},

		exit: function() {
			Messaging.unregisterObject(this, true);
			this._oObserver.disconnect();
			this._oObserver = undefined;

			if (this._sConditionsTimer) {
				clearTimeout(this._sConditionsTimer);
				this._sConditionsTimer = null;
			}

			if (this._oDefaultType) {
				this._oDefaultType.destroy();
				delete this._oDefaultType;
			}

			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		},

		byId: function(sId) {
			return Element.getElementById(this.getId() + "--" + sId);
		},

		onBeforeRendering: function() {

			if (!this.getModel("$i18n")) {
				// if ResourceModel not provided from outside create own one
				this.setModel(new ResourceModel({ bundleName: "sap/ui/mdc/messagebundle", async: false }), "$i18n");
			}

			if (this.getConditions().length === 0 && !this._sConditionsTimer) {
				// as observer must not be called in the initial case
				this.updateDefineConditions();
			}

		},

		removeCondition: function(oEvent) {
			const { oSource } = oEvent;
			const oBindingContext = oSource.getBindingContext("$this");
			let aConditions = this.getConditions();
			const sPath = oBindingContext.getPath();
			const aMatch = sPath.match(/^.*\/(\d+)\/$/);
			let iIndex;
			if (aMatch) {
				iIndex = parseInt(aMatch[1]);
			}

			if (iIndex > 0 && aConditions.length - 1 === iIndex) {
				this._bFocusLastRemoveBtn = true; // as remove-Button will disappear and focus should set on the last row remove button
			}

			this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.DEFINECONDITIONS_REMOVECONDITION_ANNOUNCE"), InvisibleMessageMode.Assertive);

			// try to reset valueState and value of value Fields inside the removed row
			const oGrid = this.byId("conditions");
			const aGridContent = oGrid.getContent();
			let iRow = -1;

			for (const oField of aGridContent) {
				if (oField instanceof Field && oField.getValueHelp() === this._sOperatorHelpId) {
					// Operator field starts new row
					iRow++;
				}

				if (oField instanceof Field && oField.hasOwnProperty("_iValueIndex") && oField.getBindingContext("$this").getPath().startsWith(sPath)) {
					if (oField.isInvalidInput()) { // TODO: better way to find out parsing error
						oField.setValue(null); // to remove invalid value from parsing
					}
				}
			}

			if (aConditions.length === 1 && iIndex === 0) {
				// the only one existing condition is removed. -> add dummy condition to have it in update in one step
				this.addDummyCondition(1); // TODO: without setProperty to update condition at once?
				aConditions = this.getConditions();
			}

			if (iRow === 0 && this._iStartIndex > 0) {
				// there was only one row on page -> after removing it, go to previous page
				this._iStartIndex = this._iStartIndex - this._iShownConditions;
			}

			aConditions.splice(iIndex, 1);
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel

			this.fireConditionProcessed();
		},

		addCondition: function(oEvent) {
			const aConditions = this.getConditions();
			const oConfig = this.getConfig();
			const iMaxConditions = oConfig.maxConditions;

			const oGrid = this.byId("conditions");
			const aGridContent = oGrid.getContent();
			let iRows = 0;
			let iIndex = -1;

			for (const oField of aGridContent) {
				if (oField instanceof Field && oField.getValueHelp() === this._sOperatorHelpId) {
					// Operator field starts new row
					iRows++;
					const oBindingContext = oField.getBindingContext("$this");
					const sPath = oBindingContext.getPath();
					const aMatch = sPath.match(/^.*\/(\d+)\/$/);
					if (aMatch) {
						iIndex = parseInt(aMatch[1]);
					}
				}
			}

			if (iMaxConditions === -1 || aConditions.length < iMaxConditions) {
				// create a new dummy condition for a new condition on the UI - must be removed later if not used or filled correct
				this.addDummyCondition(iIndex + 1);
				this._bFocusLastCondition = true; // as add-Button will disappear and focus should stay in DefineConditionPanel

				if (iRows >= this._iShownConditions) {
					this._iShownAdditionalConditions++;
				}
			}

			this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.DEFINECONDITIONS_ADDCONDITION_ANNOUNCE"), InvisibleMessageMode.Assertive);
		},

		addDummyCondition: function(index) {
			const aOperators = _getOperators.call(this);
			const oOperator = _getDefaultOperator.call(this);
			const sOperator = oOperator.name;
			const oCondition = Condition.createCondition(sOperator, oOperator.valueDefaults ? oOperator.valueDefaults : [], undefined, undefined, ConditionValidated.NotValidated);

			if (oOperator.valueTypes[0] && oOperator.valueTypes[0] !== OperatorValueType.Static) {
				// mark the condition as initial and not modified by the user
				oCondition.isInitial = true;
			}

			FilterOperatorUtil.updateConditionValues(oCondition);
			FilterOperatorUtil.checkConditionsEmpty(oCondition, aOperators);
			const aConditions = this.getConditions();
			if (index !== undefined) {
				aConditions.splice(index, 0, oCondition);
			} else {
				aConditions.push(oCondition);
			}
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel

			if (!oCondition.isInitial) {
				// static condition added, it is ready to use -> fire event
				this.fireConditionProcessed();
			}

		},

		updateDefineConditions: function() {
			const aConditions = _getDefineConditions.call(this);

			_addStaticText.call(this, aConditions, true, this._bUpdateType);

			if (aConditions.length === 0) {
				this.addDummyCondition();
			}
			if (aConditions.length < this._iStartIndex) {
				this._iStartIndex = 0;
			}
		},

		// called when the user has change the value of the condition field
		onChange: function(oEvent) {
			const oPromise = oEvent && oEvent.getParameter("promise");
			const oSourceControl = oEvent && oEvent.getSource();
			const fnHandleChange = function(oEvent) {
				const aOperators = _getOperators.call(this);
				const aConditions = this.getConditions();
				FilterOperatorUtil.checkConditionsEmpty(aConditions, aOperators);
				FilterOperatorUtil.updateConditionsValues(aConditions, aOperators);
				_addStaticText.call(this, aConditions, false, false); // as updateConditionsValues removes static text

				if (oEvent) {
					// remove isInitial when the user modified the value and the condition is not Empty
					aConditions.forEach((oCondition) => {
						if (!oCondition.isEmpty) {
							delete oCondition.isInitial;
						}
					});
				}

				this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
			}.bind(this);

			if (oPromise) {
				oPromise.then((vResult) => {
					this._bPendingChange = false;
					fnHandleChange({ mParameters: { value: vResult } }); // TODO: use a real event?
					if (this._bPendingValidateCondition) {
						_validateCondition.call(this, oSourceControl);
						delete this._bPendingValidateCondition;
					}
				}).catch((oError) => { // cleanup pending stuff
					this._bPendingChange = false;
					if (this._bPendingValidateCondition) {
						_validateCondition.call(this, oSourceControl);
						delete this._bPendingValidateCondition;
					}
				});

				this._bPendingChange = true; // TODO: handle multiple changes
				return;
			} else {
				fnHandleChange();
			}

		},

		onSelectChange: function(oEvent) {
			const oField = oEvent.getSource();
			const oPromise = oEvent.getParameter("promise"); // as with FixedList direct user input is parsed async wait for the promise

			oPromise.then((sKey) => {
				const sOldKey = oField._sOldKey;
				const oOperator = FilterOperatorUtil.getOperator(sKey); // operator must exist as List is created from valid operators
				const oOperatorOld = sOldKey && FilterOperatorUtil.getOperator(sOldKey);
				const oBindingContext = oField.getBindingContext("$this");
				let oCondition = oBindingContext.getObject();
				const sConditionPath = oBindingContext.getPath(); // Path to condition of the active control
				const iIndex = parseInt(sConditionPath.split("/")[2]); // index of current condition
				const aConditions = this.getConditions();
				if (iIndex >= 0) {
					oCondition = aConditions[iIndex]; // to get right instance
				}

				if (oOperator && oOperatorOld) {
					let bUpdate = false;

					if (!deepEqual(oOperator.valueTypes[0], oOperatorOld.valueTypes[0]) && oOperator.valueTypes[0] !== OperatorValueType.Static) {
						// type changed -> remove entered value (only if changed by user in Select)
						// As Static text updated on condition change, don't delete it here.
						if (iIndex >= 0) {
							oCondition.values.forEach((value, index) => {
								if (value !== null) {
									if ((oOperator.valueTypes[index] === OperatorValueType.Self && oOperatorOld.valueTypes[index] === OperatorValueType.SelfNoParse) ||
										(oOperator.valueTypes[index] === OperatorValueType.SelfNoParse && oOperatorOld.valueTypes[index] === OperatorValueType.Self)) {
										// as for Decimal values the type might change we need to format and parse again
										const oType = _getFieldType.call(this, oOperator.name, index);
										const oTypeOld = _getFieldType.call(this, oOperatorOld.name, index);
										const sValue = oTypeOld.formatValue(oCondition.values[index], "string");
										const vValue = oType.parseValue(sValue, "string");
										if (vValue !== oCondition.values[index]) {
											oCondition.values[index] = oType.parseValue(sValue, "string");
											bUpdate = true;
										}
									} else {
										oCondition.values[index] = null;
										bUpdate = true;
									}
								}
							});
						}
					}

					let bInvalid = false;
					if (oOperator.valueTypes.length === 0 || oOperator.valueTypes[0] === OperatorValueType.Static) {
						// check for duplicate static operators
						for (let i = 0; i < aConditions.length; i++) {
							if (i !== iIndex && sKey === aConditions[i].operator) {
								bInvalid = true;
								oCondition.invalid = true;
								bUpdate = true;
								oField.setValueState(ValueState.Error);
								oField.setValueStateText(oMessageBundle.getText("field.CONDITION_ALREADY_EXIST", [sKey]));
								break;
							}
						}
					}
					if (oOperatorOld.valueTypes.length === 0 || oOperatorOld.valueTypes[0] === OperatorValueType.Static) {
						// check if still duplicates
						let iFirstIndex = -1;
						let bDuplicates = false;
						for (let i = 0; i < aConditions.length; i++) {
							if (sOldKey === aConditions[i].operator) {
								if (iFirstIndex < 0) {
									iFirstIndex = i;
								} else {
									// still duplicates -> keep error
									bDuplicates = true;
									break;
								}
							}
						}
						if (!bDuplicates && iFirstIndex >= 0) {
							delete aConditions[iFirstIndex].invalid;
							bUpdate = true;
						}
					}

					if (iIndex >= 0 && oOperator.valueDefaults) {
						// sets the default values for the operator back to default, if the condition is inital or the value is null
						oCondition.values.forEach((value, index) => {
							if ((oCondition.isInitial && value !== oOperator.valueDefaults[index]) || (value === null)) {
								// set the default value and mark the condition as initial
								oCondition.values[index] = oOperator.valueDefaults[index];
								oCondition.isInitial = true;
								bUpdate = true;
							}
						});
					}

					if (!oOperator.valueTypes[1] && oOperatorOld.valueTypes[1]) {
						// switch from BT to EQ -> remove second value even if filled
						if (iIndex >= 0) {
							if (oCondition.values.length > 1 && oCondition.values[1]) {
								oCondition.values = oCondition.values.slice(0, 1);
								bUpdate = true;
							}
						}
					}

					if (oCondition.invalid && !bInvalid) {
						delete oCondition.invalid;
						bUpdate = true;
					}
					if (bUpdate) {
						FilterOperatorUtil.checkConditionsEmpty(oCondition, _getOperators.call(this));
						this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
					}
					if (!oCondition.invalid && (oOperator.valueTypes.length === 0 || oOperator.valueTypes[0] === OperatorValueType.Static)) {
						// static condition added, it is ready to use -> fire event
						this.fireConditionProcessed();
					}
				}

				delete oField._sOldKey;
			}).catch((oException) => { // if Operator in error state -> don't update values
				const oBindingContext = oField.getBindingContext("$this");
				let oCondition = oBindingContext.getObject();
				const sConditionPath = oBindingContext.getPath(); // Path to condition of the active control
				const iIndex = parseInt(sConditionPath.split("/")[2]); // index of current condition
				const aConditions = this.getConditions();
				if (iIndex >= 0) {
					oCondition = aConditions[iIndex]; // to get right instance
				}
				oCondition.invalid = true;
				this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
				oField._sOldKey = oField.getValue();
			});

		},

		onPaste: function(oEvent) {
			// for the purpose to copy from column in Excel and paste as new conditions
			const sOriginalText = oEvent.originalEvent.clipboardData.getData('text/plain');
			const aSeparatedText = splitValue(sOriginalText, true); // check without BT support as if TAB is inside the Paste logic needs to be used anyhow

			if (aSeparatedText.length > 1) { // if no linebreak just process normal paste-logic
				const oSource = oEvent.srcControl;
				const sConditionPath = oSource.getBindingContext("$condition").getPath(); // Path to condition of the active control
				const iIndex = parseInt(sConditionPath.split("/")[2]); // index of current condition - to remove before adding new ones
				const aConditions = this.getConditions();
				const oFormatOptions = merge({}, this.getConfig());
				oFormatOptions.display = FieldDisplay.Value;
				oFormatOptions.getConditions = function() { return aConditions; }; // as condition where inserted will be removed
				oFormatOptions.defaultOperatorName = aConditions[iIndex].operator; // use current operator as default
				oFormatOptions.valueType = oFormatOptions.dataType;
				delete oFormatOptions.dataType;
				const oConditionsType = new ConditionsType(oFormatOptions);

				aConditions.splice(iIndex, 1); // remove old condition that is overwitten by pasting
				oConditionsType._parseValueToIndex(sOriginalText, "string", iIndex).then((aNewConditions) => {
					oConditionsType.validateValue(aNewConditions);

					FilterOperatorUtil.checkConditionsEmpty(aNewConditions);
					this.setProperty("conditions", aNewConditions, true); // do not invalidate whole DefineConditionPanel

					this.fireConditionProcessed();
					oConditionsType.destroy();
				}).catch((error) => {
					const oException = new ParseException(oMessageBundle.getText("field.PASTE_ERROR"));
					const mErrorParameters = {
						element: oSource,
						property: "value", // TODO: right property for custom content
						type: oConditionsType,
						newValue: sOriginalText,
						oldValue: "", // TODO
						exception: oException,
						message: oException.message
					};
					oSource.fireParseError(mErrorParameters, false, true); // mParameters, bAllowPreventDefault, bEnableEventBubbling
					oConditionsType.destroy();
				});

				oEvent.stopImmediatePropagation(true); // to prevent controls own logic
				oEvent.preventDefault(); // to prevent pasting string into INPUT
			}
		},

		cleanUp: function() {
			// of Dialog is closed all error messages and invalid input should be removed to be clean on reopening
			const oGrid = this.byId("conditions");
			const aGridContent = oGrid.getContent();

			for (const oField of aGridContent) {
				if (oField instanceof Field && oField.hasOwnProperty("_iValueIndex")) {
					if (oField.isInvalidInput()) { // TODO: better was to find out parsing error
						oField.setValue(); // to remove invalid value from parsing
					}
				}
			}

			this.setProperty("inputOK", true, true); // do not invalidate whole DefineConditionPanel
			if (this._iStartIndex > 0 || this._iShownAdditionalConditions > 0) {
				this._iStartIndex = 0;
				this._iShownAdditionalConditions = 0;
				_renderConditions.call(this); // to have right paging on reopening
			}
		},

		/**
		 * Getter for the initial focusable <code>control</code> on the <code>DefineConditionPanel</code>.
		 *
		 * @returns {control} Control instance which could get the focus.
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		getInitialFocusedControl: function() {
			const oGrid = this.getAggregation("_content").getContent()[1];
			const oCtrl = oGrid.getContent()[0]; // 0=Operator Field, 2=first Value Field which might not exist
			return oCtrl;
		},

		// TODO: remove this function and replace by getValueHelp once FieldHelp association is completetly removed.
		_getValueHelp: function() {

			return this.getValueHelp() || (undefined); // as getFieldHelp not exist in legacy-free UI5

		}
	});

	function _observeChanges(oChanges) {

		if (oChanges.name === "value") {
			// operator changed -> update controls
			_operatorChanged.call(this, oChanges.object, oChanges.current, oChanges.old);
		}

		if (oChanges.name === "config") {
			// type or maxConditions might changed -> resume ListBinding
			const aConditions = this.getConditions();
			const oOperators = oChanges.current && oChanges.current.operators;
			const oOperatorsOld = oChanges.old && oChanges.old.operators;
			let bOperatorModelUpdated = false;
			if (!deepEqual(oOperators, oOperatorsOld)) {
				// operators changed
				bOperatorModelUpdated = true;
				_updateOperatorModel.call(this);
			}

			const oType = oChanges.current && oChanges.current.dataType;
			const oTypeOld = oChanges.old && oChanges.old.valueType;
			const sType = oType && oType.getMetadata().getName();
			const sTypeOld = oTypeOld && oTypeOld.getMetadata().getName();
			const oFormatOptions = oType && oType.getFormatOptions();
			const oFormatOptionsOld = oTypeOld && oTypeOld.getFormatOptions();
			const oConstraints = oType && oType.getConstraints();
			const oConstraintsOld = oTypeOld && oTypeOld.getConstraints();
			if (sType !== sTypeOld || !deepEqual(oFormatOptions, oFormatOptionsOld) || !deepEqual(oConstraints, oConstraintsOld)) {
				// operators might be changed if type changed
				// Field binding needs to be updated if type changed
				if (!bOperatorModelUpdated) { // don't do twice
					_updateOperatorModel.call(this);
				}

				if (this._sConditionsTimer) { // already re-rendering pending
					this._bUpdateType = true;
				} else if (aConditions.length > 0) {
					this._bUpdateType = true;
					_renderConditions.call(this);
					this._bUpdateType = false;
					_addStaticText.call(this, aConditions, true, true); // static text might changed if type changed
				}
			}
		}

		if (oChanges.name === "conditions" && !this._bConditionUpdateRunning) { // if Conditions are updated inside Timer, no additional update needed
			if (this._sConditionsTimer) {
				clearTimeout(this._sConditionsTimer);
				this._sConditionsTimer = null;
			}
			this._sConditionsTimer = setTimeout(() => {
				// on multiple changes (dummy row, static text...) perform only one update
				this._sConditionsTimer = null;
				this._bConditionUpdateRunning = true;
				this.updateDefineConditions();
				_renderConditions.call(this);
				this._bUpdateType = false; // might be set from pending type update
				this._bConditionUpdateRunning = false;
			}, 0);
		}

	}

	function _operatorSupportsValueHelp(sKey) {
		return true;
		// var aValueHelpSupportedOperators = [OperatorName.EQ, OperatorName.NE]; // only for this operators we use the ValueHelp on the value fields
		// return aValueHelpSupportedOperators.length === 0 || aValueHelpSupportedOperators.indexOf(sKey) >= 0;
	}

	function _operatorChanged(oField, sKey, sOldKey) {
		oField._sOldKey = sOldKey; // to know in change event

		let iIndex = 0;
		let oCondition;

		// if type of operator changed -> remove binding and create it new later on
		if (sKey && sOldKey) {
			const oOperator = FilterOperatorUtil.getOperator(sKey);
			const oOperatorOld = FilterOperatorUtil.getOperator(sOldKey);
			const oGrid = oField.getParent();
			let oValue0Field;
			let oValue1Field;
			iIndex = oGrid.indexOfContent(oField);

			// find fields and initialize error state
			oValue0Field = oGrid.getContent()[iIndex + 2];
			if (oValue0Field && oValue0Field.hasOwnProperty("_iValueIndex") && oValue0Field._iValueIndex === 0) {
				if (oValue0Field instanceof Field && !oValue0Field.isInvalidInput()) { // TODO: better was to find out parsing error // TODO: handle custom controls
					// if Field is in parsing error state, don't remove error
					oValue0Field.setValueState(ValueState.None);
					oValue0Field.setValueStateText();
				}
				oValue1Field = oGrid.getContent()[iIndex + 3]; // second field only exists if first field exist
				if (oValue1Field && oValue1Field.hasOwnProperty("_iValueIndex") && oValue1Field._iValueIndex === 1) {
					if (oValue1Field instanceof Field && !oValue1Field.isInvalidInput()) { // TODO: better was to find out parsing error // TODO: handle custom controls
						// if Field is in parsing error state, don't remove error
						oValue1Field.setValueState(ValueState.None);
						oValue1Field.setValueStateText();
					}
				} else {
					oValue1Field = undefined;
				}
			} else {
				oValue0Field = undefined;
			}

			if (_operatorSupportsValueHelp(sKey)) {
				// enable the ValueHelp for the used value fields
				const sValueHelp = this._getValueHelp();
				oValue0Field && oValue0Field.setValueHelp && oValue0Field.setValueHelp(sValueHelp);
				oValue1Field && oValue1Field.setValueHelp && oValue1Field.setValueHelp(sValueHelp);
			} else {
				// remove the ValueHelp for the used value fields
				oValue0Field && oValue0Field.setValueHelp && oValue0Field.setValueHelp();
				oValue1Field && oValue1Field.setValueHelp && oValue1Field.setValueHelp();
			}

			if (oOperator.createControl || oOperatorOld.createControl) {
				// custom control used -> needs to be created new
				if (oValue0Field) {
					oValue0Field.destroy();
				}
				if (oValue1Field) {
					oValue1Field.destroy();
				}
			} else {
				if (oValue0Field && oOperator.valueTypes[0] !== oOperatorOld.valueTypes[0]) {
					oValue0Field.unbindProperty("value");
				}
				if (oValue1Field && oOperator.valueTypes[1] !== oOperatorOld.valueTypes[1] && oOperatorOld.valueTypes[1]) { // 2nd Field only exist if there was a valueType defined
					oValue1Field.unbindProperty("value");
				}
			}
		}

		if (!sKey) { // TODO: remove? Because cannot longer happen as Field don't allow empty input because of used data type constraints
			// key must not be empty
			oCondition = oField.getBindingContext("$this").getObject();
			if (oCondition) { // condition might be deleted before Field instance is deleted
				const aConditions = this.getConditions();
				iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
				if (iIndex >= 0) {
					oCondition = aConditions[iIndex]; // to get right instance
					oCondition.operator = sOldKey;
					this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
				}
			}
		}

		// as additinalValue is not updated automatically if operator is set from outside just take it from OperatorModel
		const aOperatorsData = this.oOperatorModel.getData();
		let sDescription;

		for (const oOperatorData of aOperatorsData) {
			if (oOperatorData.key === sKey) {
				sDescription = oOperatorData.text;
				break;
			}
		}

		oField.setAdditionalValue(sDescription);

		this.onChange();
	}

	function _createControl(oCondition, iIndex, sId, oBindingContext) {

		const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
		if (!oOperator || !oOperator.valueTypes[iIndex]) {
			return null; // TODO: exception?
		}

		const oNullableType = _getFieldType.call(this, oOperator.name, iIndex);
		const oValueBindingContext = this._oManagedObjectModel.getContext(oBindingContext.getPath() + "values/" + iIndex + "/");

		let oControl;
		if (oOperator.createControl) {
			oControl = oOperator.createControl(oNullableType, "$this>", iIndex, sId); // the returned control can be null, in this case the default Field will be used
		}

		if (!oControl) {
			oControl = new Field(sId, {
				delegate: _getDelegate.call(this),
				value: { path: "$this>", type: oNullableType, mode: 'TwoWay', targetType: 'raw' },
				editMode: { parts: [{ path: "$condition>operator" }, { path: "$condition>invalid" }], formatter: _getEditModeFromOperator },
				multipleLines: false,
				width: "100%",
				valueHelp: _operatorSupportsValueHelp(oCondition.operator) ? this._getValueHelp() : null
				//display: should always be FieldDisplay.Value
			});
		}

		if (oControl.getMetadata().hasProperty("placeholder")) {
			if (iIndex === 0) {
				oControl.bindProperty("placeholder", { path: "$condition>operator", formatter: _getPlaceholder1ForOperator });
			} else { // from Field cannot switch placeholder
				oControl.bindProperty("placeholder", { path: "$condition>operator", formatter: _getPlaceholder2ForOperator });
			}
		}

		oControl._iValueIndex = iIndex; // to find it for update
		if (oControl.attachChange) { // custom control might not have a change event
			oControl.attachChange(this.onChange.bind(this));
		}
		oControl.addDelegate(this._oContentEventDelegate, true, this);
		oControl.setLayoutData(new GridData({ span: { parts: [{ path: "$condition>" }, { path: "$this>/config" }], formatter: _getSpanForValue.bind(this) } }));
		oControl.setBindingContext(oValueBindingContext, "$this");
		oControl.setBindingContext(oBindingContext, "$condition");
		// add fieldGroup to validate Condition only after both Fields are entered.
		oControl.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition

		return oControl;

	}

	function _getFieldType(sOperator, iIndex) {

		let oDataType = _getType.call(this);
		const oOperator = FilterOperatorUtil.getOperator(sOperator);

		if (oOperator.valueTypes[iIndex] && [OperatorValueType.Self, OperatorValueType.Static].indexOf(oOperator.valueTypes[iIndex]) === -1) {
			oDataType = oOperator._createLocalType(oOperator.valueTypes[iIndex], oDataType);
		}

		let bStaticText = false;

		if (oOperator.valueTypes[iIndex] === OperatorValueType.Static) {
			bStaticText = true;
			oDataType = _getDefaultType.call(this);
		}

		const sType = bStaticText ? BaseType.String : _getBaseType.call(this, oDataType);
		let oNullableType;
		const oFormatOptions = oDataType.getFormatOptions();
		switch (sType) {
			case BaseType.Numeric:
				if (oFormatOptions && oFormatOptions.hasOwnProperty("emptyString") && oFormatOptions.emptyString === null) {
					// given type can be used
					oNullableType = oDataType;
				} else {
					// "clone" type and make nullable
					oNullableType = _createNullableType(oDataType, { emptyString: null });
				}

				break;
			case BaseType.Date:
			case BaseType.Time:
			case BaseType.DateTime:
				oNullableType = oDataType;

				break;
				//TODO: how to handle unit fields?
			default:
				if (oDataType.getConstraints() && oDataType.getConstraints().hasOwnProperty("nullable") && oDataType.getConstraints().nullable === false) {
					// "clone" type and make nullable
					oNullableType = _createNullableType(oDataType);
					if (oDataType._bCreatedByOperator) {
						oNullableType = oOperator._createLocalType(oOperator.valueTypes[iIndex], oDataType);
					}
				} else {
					oNullableType = oDataType; // use given type or default string type
				}
				break;
		}

		return oNullableType;

	}

	function _createNullableType(oType, oNewFormatOprtions, oNewConstraints) {

		const Type = sap.ui.require(oType.getMetadata().getName().replace(/\./g, "/")); // type is already loaded because instance is provided
		const oFormatOptions = merge(oType.getFormatOptions(), oNewFormatOprtions || {});
		const oConstraints = merge(oType.getConstraints(), oNewConstraints || {});

		if (oConstraints.hasOwnProperty("nullable") && oConstraints.nullable === false) {
			oConstraints.nullable = true; // make nullable
		}

		//TODO oConstraints like maximum are not used inside the Double type
		return new Type(oFormatOptions, oConstraints);

	}

	function _getDefaultOperator() {
		const aOperators = _getOperators.call(this);
		let oOperator;
		const sOperatorName = this.getConfig().defaultOperatorName;
		if (sOperatorName) {
			oOperator = FilterOperatorUtil.getOperator(sOperatorName);
		} else {
			const oType = _getType.call(this);
			const sType = _getBaseType.call(this, oType);
			oOperator = FilterOperatorUtil.getDefaultOperator(sType);
		}

		if (oOperator && aOperators.indexOf(oOperator.name) < 0) {
			// default operator not valid -> cannot use -> use first include-operator which requires some values
			for (let i = 0; i < aOperators.length; i++) {
				oOperator = FilterOperatorUtil.getOperator(aOperators[i]);
				if (!oOperator || oOperator.exclude || !oOperator.hasRequiredValues()) {
					oOperator = undefined;
				} else {
					break;
				}
			}
		}

		if (!oOperator) {
			// in case no operator was found, use the first operator
			oOperator = FilterOperatorUtil.getOperator(aOperators[0]);
		}
		return oOperator;
	}

	function _getOperators() {

		const oConfig = this.getConfig();
		let aOperators = oConfig && oConfig.operators;

		if (!aOperators || aOperators.length === 0) {
			// TODO: better default
			aOperators = FilterOperatorUtil.getOperatorsForType(BaseType.String);
		}

		return aOperators;

	}

	function _hasMultipleOperatorGroups() {
		let firstGroupId;
		const aOperators = _getOperators.call(this);

		for (const sOperator of aOperators) {
			const oOperator = FilterOperatorUtil.getOperator(sOperator);

			if (!firstGroupId) {
				firstGroupId = oOperator.group.id;
			} else if (firstGroupId !== oOperator.group.id) {
				return true;
			}
		}

		return false;
	}

	function _updateOperatorModel() {
		if (!this.oOperatorModel) {
			return;
		}

		const oType = _getType.call(this);
		// assert(oOperatorConfig == null, "oOperatorConfig does not exist - no operators for Select control can be added");
		const aOperators = _getOperators.call(this);
		const aOperatorsData = [];

		const bHasMultipleGroups = _hasMultipleOperatorGroups.call(this);

		const sFixedListId = this._sOperatorHelpId + "-pop-fl";
		const oFixedList = Element.getElementById(sFixedListId);

		let oTemplate;
		if (bHasMultipleGroups) {
			oTemplate = new FixedListItem({ key: "{om>key}", text: "{om>text}", additionalText: "{om>additionalText}", groupKey: "{om>groupId}", groupText: "{om>groupText}" });
		} else {
			oTemplate = new FixedListItem({ key: "{om>key}", text: "{om>text}", additionalText: "{om>additionalText}" });
		}
		oFixedList.bindAggregation("items", { path: 'om>/', templateShareable: false, template: oTemplate });
		oFixedList.setGroupable(bHasMultipleGroups);

		for (const sOperator of aOperators) {
			const oOperator = FilterOperatorUtil.getOperator(sOperator);
			if (!oOperator || (oOperator.showInSuggest !== undefined && oOperator.showInSuggest == false)) {
				continue;
			}

			// try to load the operator longText which is type dependent
			const sText = oOperator.getLongText(_getBaseType.call(this, oType));

			//Update the additionalInfo text for the operator
			let sAdditionalText = oOperator.additionalInfo;
			if (sAdditionalText === undefined) {
				if (sAdditionalText !== "" && oOperator.formatRange) {
					sAdditionalText = oOperator.formatRange(oOperator._getRange(undefined, oType), oType);
				} else if (!bHasMultipleGroups) {
					sAdditionalText = oOperator.group.text;
				}
			}

			let sGroupId = oOperator.exclude ? "2" : "1";
			if (oOperator.group.text && oOperator.group.id) {
				// only use the group.id when a text exist. This might be not the case for DynamicDatRange custom operators inside existing groups
				sGroupId = oOperator.group.id;
			}
			aOperatorsData.push({
				key: oOperator.name,
				text: sText,
				additionalText: sAdditionalText,
				groupId: sGroupId,
				groupText: oOperator.group.text
			});
		}

		this.oOperatorModel.setData(aOperatorsData);
	}

	function _getType() {

		const oConfig = this.getConfig();
		let oType = oConfig && oConfig.dataType;
		if (!oType) {
			oType = _getDefaultType.call(this);
		}

		return oType;

	}

	function _getDefaultType() {

		if (!this._oDefaultType) {
			this._oDefaultType = new StringType();
		}
		return this._oDefaultType;

	}

	function _getBaseType(oType) {

		const sType = oType.getMetadata().getName();
		const oFormatOptions = oType.getFormatOptions();
		const oConstraints = oType.getConstraints();
		const oDelegate = this.getConfig().delegate;
		const oField = this.getConfig().control;
		let sBaseType = oDelegate ? oDelegate.getTypeMap(oField).getBaseType(sType, oFormatOptions, oConstraints) : BaseType.String; // if not configured use string

		if (sBaseType === BaseType.Unit) {
			sBaseType = BaseType.Numeric;
		}

		return sBaseType;

	}

	function _getDelegate() {

		const oConfig = this.getConfig();
		const sName = oConfig.delegateName || "sap/ui/mdc/field/FieldBaseDelegate";
		const oPayload = oConfig.payload;

		return { name: sName, payload: oPayload };

	}

	function _addStaticText(aConditions, bUpdateProperty, bTypeChange) {

		// for static operators add static text as value to render text control
		const oDataType = _getType.call(this);
		const aUpdate = [];
		let i = 0;
		for (i = 0; i < aConditions.length; i++) {
			const oCondition = aConditions[i];
			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			if (oOperator && oOperator.valueTypes[0] === OperatorValueType.Static && (oCondition.values.length === 0 || bTypeChange)) {
				// if type changed the text needs to be new formatted (setting of type and conditions might be async.)
				if (oOperator.getStaticText) {
					const sText = oOperator.getStaticText(oDataType, _getBaseType.call(this, oDataType));
					if (oCondition.values.length > 0) {
						oCondition.values[0] = sText;
					} else {
						oCondition.values.push(sText);
					}
					aUpdate.push(i);
				}
			}
		}

		if (bUpdateProperty && aUpdate.length > 0) {
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
		}

	}

	function _createInnerControls() {
		const oInvisibleOperatorText = new InvisibleText(this.getId() + "--ivtOperator", { text: "{$i18n>valuehelp.DEFINECONDITIONS_OPERATORLABEL}" });
		const oTitle = new Title(this.getId() + "-title", { text: { path: "$this>/label" } });
		const oButtonPrev = new Button(this.getId() + "--prev", {
			icon: IconPool.getIconURI("navigation-left-arrow"),
			tooltip: oMessageBundleM.getText("PAGINGBUTTON_PREVIOUS"),
			visible: { path: "$this>/_pagination" },
			enabled: "{= ${$this>/inputOK} && ${$this>/_prevButtonActive}}",
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}),
			press: _handlePrevious.bind(this)
		});
		const oButtonNext = new Button(this.getId() + "--next", {
			icon: IconPool.getIconURI("navigation-right-arrow"),
			tooltip: oMessageBundleM.getText("PAGINGBUTTON_NEXT"),
			visible: { path: "$this>/_pagination" },
			enabled: "{= ${$this>/inputOK} && ${$this>/_nextButtonActive}}",
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}),
			press: _handleNext.bind(this)
		});
		const oButtonRemoveAll = new Button(this.getId() + "--removeAll", {
			text: oMessageBundleM.getText("CONDITIONPANEL_REMOVE_ALL"),
			visible: { path: "$this>/_pagination" },
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			}),
			press: _handleRemoveAll.bind(this)
		});
		const oButtonInsert = new Button(this.getId() + "--insert", {
			icon: IconPool.getIconURI("add"),
			visible: { path: "$this>/_pagination" },
			enabled: { path: "$this>/inputOK" },
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			}),
			press: _handleInsert.bind(this)
		});
		const oPageCount = new Text(this.getId() + "--pageCount", {
			text: _getPageText.call(this),
			wrapping: false,
			textAlign: TextAlign.Center,
			visible: { path: "$this>/_pagination" },
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			})
		});
		const oToolbar = new OverflowToolbar(this.getId() + "--toolbar", {
			width: "100%",
			design: ToolbarDesign.Transparent,
			content: [oTitle,
				new ToolbarSpacer(),
				oButtonPrev,
				oPageCount,
				oButtonNext,
				oButtonRemoveAll,
				oButtonInsert
			]
		});

		const oPanel = new Panel(this.getId() + "--panel", {
			headerToolbar: oToolbar,
			expanded: true,
			height: "100%",
			backgroundDesign: BackgroundDesign.Transparent
		}).addStyleClass("sapMdcDefineconditionPanel");

		oPanel.addDependent(
			new ValueHelp(this._sOperatorHelpId, {
				typeahead: new Popover(this._sOperatorHelpId + "-pop", {
					content: [new FixedList(this._sOperatorHelpId + "-pop-fl", {
						filterList: false,
						useFirstMatch: true
					})]
				})
			})
		);

		const oGrid = new Grid(this.getId() + "--conditions", {
			width: "100%",
			hSpacing: 0,
			vSpacing: 0,
			containerQuery: true
		}).addStyleClass("sapUiMdcDefineConditionGrid");
		oGrid.addDelegate({
			onAfterRendering: _setFocusOnGrid
		}, false, this);

		_createRow.call(this, undefined, oGrid, 0, null, 0); // create dummy row

		oPanel.addContent(oInvisibleOperatorText);
		oPanel.addContent(oGrid);

		this._oInvisibleAddOperatorButtonText = new InvisibleText({
			text: oMessageBundle.getText("valuehelp.DEFINECONDITIONS_ADDCONDITION_DESCRIPTION")
		});
		oPanel.addContent(this._oInvisibleAddOperatorButtonText);

		const oAddBtn = new Button(this.getId() + "--addBtn", {
			press: this.addCondition.bind(this),
			type: ButtonType.Default,
			text: "{$i18n>valuehelp.DEFINECONDITIONS_ADDCONDITION}",
			layoutData: new GridData({
				span: "XL2 L3 M3 S3",
				indent: "XL9 L8 M8 S7",
				linebreak: true,
				visibleS: { parts: [{ path: "$this>/conditions" }, { path: "$this>/config" }], formatter: _getAddButtonVisible.bind(this) },
				visibleM: { parts: [{ path: "$this>/conditions" }, { path: "$this>/config" }], formatter: _getAddButtonVisible.bind(this) },
				visibleL: { parts: [{ path: "$this>/conditions" }, { path: "$this>/config" }], formatter: _getAddButtonVisible.bind(this) },
				visibleXL: { parts: [{ path: "$this>/conditions" }, { path: "$this>/config" }], formatter: _getAddButtonVisible.bind(this) }
			}),
			ariaDescribedBy: this._oInvisibleAddOperatorButtonText
		});

		oGrid.addContent(oAddBtn);

		oGrid.attachValidateFieldGroup(_validateFieldGroup, this); // to validate conditions with more than one field

		this.setAggregation("_content", oPanel);

	}

	function _getAddButtonVisible(aConditions, oConfig) {

		const iMaxConditions = oConfig.hasOwnProperty("maxConditions") ? oConfig.maxConditions : -1;

		return iMaxConditions === -1 || aConditions.length < iMaxConditions;

	}

	function _getRemoveButtonVisible(aConditions, oConfig) {

		const iMaxConditions = oConfig.hasOwnProperty("maxConditions") ? oConfig.maxConditions : -1;

		// only on case of maxCondition==1 the Remove icons should be invisible
		return iMaxConditions !== 1;

	}

	function _renderConditions() {

		const aConditions = this.getConditions();
		const oGrid = this.byId("conditions");
		const oPageCount = this.byId("pageCount");
		let aGridContent;
		let iRow = -1;
		let iIndex = 0;
		let iDefineConditions = -1;
		const iShownConditions = this._iShownConditions + this._iShownAdditionalConditions;

		for (let i = 0; i < aConditions.length && iRow < iShownConditions; i++) {
			const oCondition = aConditions[i];
			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			if (oCondition.validated !== ConditionValidated.Validated || oOperator.exclude) {
				// show only validated conditions
				iDefineConditions++;
				if (iDefineConditions >= this._iStartIndex) {
					// show only conditions on this page
					iRow++;
					if (iRow < iShownConditions) {
						const oBindingContext = this._oManagedObjectModel.getContext("/conditions/" + i + "/");

						if (!this.oOperatorModel) {
							// init operatorModel if first row is created (needed to check operator)
							this.oOperatorModel = new JSONModel();
							this.setModel(this.oOperatorModel, "om");
							_updateOperatorModel.call(this);
						}

						aGridContent = oGrid.getContent(); // to have current content
						if (aGridContent[iIndex] && aGridContent[iIndex].isA("sap.ui.mdc.Field")) {
							// row already exists -> update it
							iIndex = _updateRow.call(this, oCondition, oGrid, iIndex, oBindingContext, iRow);
						} else {
							// reate new row
							iIndex = _createRow.call(this, oCondition, oGrid, iIndex, oBindingContext, iRow);
						}
					}
				}
			}
		}
		// remove unused rows
		aGridContent = oGrid.getContent();
		while (aGridContent[iIndex] && aGridContent[iIndex] !== this.byId("addBtn")) {
			aGridContent[iIndex].destroy();
			iIndex++;
		}

		_checkInvalidInput.call(this, undefined); // check if invalid condition was removed
		oPageCount.setText(_getPageText.call(this));
		this.setProperty("_prevButtonActive", this._iStartIndex > 0);
		this.setProperty("_nextButtonActive", iRow >= iShownConditions); // there is at least one more row than conditions are shown
		this.setProperty("_pagination", iDefineConditions >= iShownConditions);

		this._bGridUpdated = true;
	}

	function _setFocusOnGrid() {
		if (!this._bGridUpdated) {
			return; // as re-rendering might be called because of invalidation in control tree
		}

		const oGrid = this.byId("conditions");
		const aGridContent = oGrid.getContent();
		let iIndex = 0;

		// in onAfterRendering the focus can only be changed if the previous focused control is not longer rendered.
		// If the previous focused control is still there RenderManager calls restoreFocus after onAfterRendering is performed.
		// So if the focus should always jump from the add-button to the new line, this must be done in a timeout
		if (this._bFocusLastCondition) {
			// focus last condition operator field after it is rendered
			iIndex = _getGridIndexOfLastRow.call(this, "-operator");
			aGridContent[iIndex].focus();
			this._bFocusLastCondition = false;
		}
		if (this._bFocusLastRemoveBtn) {
			// focus the remove-Button of the last condition row
			iIndex = _getGridIndexOfLastRowWithVisibleElement.call(this, ["-removeBtnLarge", "-removeBtnSmall"]);
			aGridContent[iIndex].focus();
			this._bFocusLastRemoveBtn = false;
		}

		this._bGridUpdated = false;
	}

	function _getGridIndexOfLastRowWithVisibleElement(aIdEndsWith) {
		const oGrid = this.byId("conditions");
		const aElements = oGrid.getContent();
		let n = aElements.length - 1;

		if (!Array.isArray(aIdEndsWith)) {
			aIdEndsWith = [aIdEndsWith];
		}

		let i = 0;
		let sSearch = aIdEndsWith[i];

		while (n >= 0 && sSearch !== undefined) {
			const oElement = aElements[n];
			if (oElement.getId().endsWith(sSearch)) {
				const $check = jQuery(oElement.getDomRef());
				if ($check.is(":visible")) {
					return n;
				} else {
					i++;
					sSearch = aIdEndsWith[i];
				}
			}
			n--;
		}

		return 0;
	}

	function _getGridIndexOfLastRow(sIdEndsWith) {
		const oGrid = this.byId("conditions");
		const aElements = oGrid.getContent();
		let n = aElements.length - 1;

		const sSearch = sIdEndsWith;

		while (n >= 0) {
			const oElement = aElements[n];
			if (oElement.getId().endsWith(sSearch)) {
				return n;
			}
			n--;
		}

		return 0;
	}

	function _createRow(oCondition, oGrid, iIndex, oBindingContext, iRow) {

		const sIdPrefix = this.getId() + "--" + iRow;

		if (!this._oOperatorFieldType) {
			this._oOperatorFieldType = new StringType({}, { minLength: 1 });
		}

		const oOperatorField = new Field(sIdPrefix + "-operator", {
				value: { path: "$this>operator", type: this._oOperatorFieldType },
				width: "100%",
				display: FieldDisplay.Description,
				editMode: FieldEditMode.Editable,
				multipleLines: false,
				valueHelp: this._sOperatorHelpId,
				change: this.onSelectChange.bind(this),
				ariaLabelledBy: this.getId() + "--ivtOperator"
			})
			.setLayoutData(new GridData({ span: { parts: [{ path: "$this>/conditions" }, { path: "$this>/config" }], formatter: _getSpanForOperator.bind(this) }, linebreak: true }))
			.setBindingContext(oBindingContext, "$this");
		if (oBindingContext) {
			// validate only complete condition
			oOperatorField.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition
		}

		// as selected key can be changed by reopening dialog listen on property change not on change event
		this._oObserver.observe(oOperatorField, {
			properties: ["value"]
		});

		oGrid.insertContent(oOperatorField, iIndex); // insert as add-Button is already at the end
		iIndex++;

		const oRemoveButton = new Button(sIdPrefix + "--removeBtnSmall", {
				press: this.removeCondition.bind(this),
				type: ButtonType.Transparent,
				icon: "sap-icon://decline",
				tooltip: "{$i18n>valuehelp.DEFINECONDITIONS_REMOVECONDITION}"
			})
			.setLayoutData(new GridData({
				span: "XL1 L1 M1 S2",
				indent: { path: "$this>operator", formatter: _getIndentForOperator },
				visibleS: { parts: [{ path: "$this>/conditions" }, { path: "$this>/config" }], formatter: _getRemoveButtonVisible.bind(this) },
				visibleM: false,
				visibleL: false,
				visibleXL: false
			}))
			.setBindingContext(oBindingContext, "$this"); // to find condition on remove
		if (oBindingContext) {
			// as Button is between Operatot and Value don't trigger validation on tabbing between
			oRemoveButton.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition
		}

		oGrid.insertContent(oRemoveButton, iIndex);
		iIndex++;

		if (oCondition) { // for initial dummy row don't create value fields (as we don't know the operator or type)
			for (let i = 0; i < oCondition.values.length; i++) {
				const oControl = _createControl.call(this, oCondition, i, sIdPrefix + "-values" + i, oBindingContext);
				if (oControl) {
					oGrid.insertContent(oControl, iIndex);
					iIndex++;
				}
			}
		}

		const oRemoveButton2 = new Button(sIdPrefix + "--removeBtnLarge", {
				press: this.removeCondition.bind(this),
				type: ButtonType.Transparent,
				icon: "sap-icon://decline",
				tooltip: "{$i18n>valuehelp.DEFINECONDITIONS_REMOVECONDITION}"
			})
			.setLayoutData(new GridData({
				span: "XL1 L1 M1 S1",
				indent: { path: "$this>operator", formatter: _getIndentForOperator },
				visibleS: false,
				visibleM: { parts: [{ path: "$this>/conditions" }, { path: "$this>/config" }], formatter: _getRemoveButtonVisible.bind(this) },
				visibleL: { parts: [{ path: "$this>/conditions" }, { path: "$this>/config" }], formatter: _getRemoveButtonVisible.bind(this) },
				visibleXL: { parts: [{ path: "$this>/conditions" }, { path: "$this>/config" }], formatter: _getRemoveButtonVisible.bind(this) }
			}))
			.setBindingContext(oBindingContext, "$this"); // to find condition on remove

		oGrid.insertContent(oRemoveButton2, iIndex);
		iIndex++;

		return iIndex;

	}

	function _getEditModeFromOperator(sOperator, bInvalid) {

		if (!sOperator) {
			return this.getEditMode(); // do not change edit mode to prevent update if temporary no operator
		} else if (bInvalid) {
			return FieldEditMode.ReadOnly;
		}

		const oOperator = FilterOperatorUtil.getOperator(sOperator);
		let bStaticText = false;

		if (oOperator && oOperator.valueTypes[0] === OperatorValueType.Static) {
			bStaticText = true;
		}

		return bStaticText ? FieldEditMode.Display : FieldEditMode.Editable;

	}

	function _getIndentForOperator(sOperator) {

		const oOperator = sOperator && FilterOperatorUtil.getOperator(sOperator);

		if (!oOperator || !oOperator.valueTypes[0] || (oOperator.valueTypes[0] === OperatorValueType.Static && !oOperator.getStaticText)) {
			return "XL8 L8 M8 S0";
		} else {
			return "";
		}

	}

	function _getSpanForOperator(aConditions, oConfig) {
		const iMaxConditions = oConfig.hasOwnProperty("maxConditions") ? oConfig.maxConditions : -1;
		let sSpan = "XL3 L3 M3 ";

		if (iMaxConditions === 1) {
			sSpan += "S12";
		} else {
			sSpan += "S10";
		}
		return sSpan;
	}

	function _getSpanForValue(oCondition, oConfig) {
		const iMaxConditions = oConfig.hasOwnProperty("maxConditions") ? oConfig.maxConditions : -1;

		const oOperator = oCondition && FilterOperatorUtil.getOperator(oCondition.operator);
		let sSpan = "";

		if (oOperator && oOperator.valueTypes[1]) {
			sSpan = "XL4 L4 M4 ";
		} else {
			sSpan = "XL8 L8 M8 ";
		}

		if (iMaxConditions === 1) {
			sSpan += "S12";
		} else {
			sSpan += "S10";
		}
		return sSpan;
	}

	function _getPlaceholder1ForOperator(sOperator) {

		const oOperator = sOperator && FilterOperatorUtil.getOperator(sOperator);

		if (oOperator && oOperator.aLabels) {
			return oOperator.aLabels[0];
		} else if (oOperator && oOperator.valueTypes[1]) {
			return oMessageBundle.getText("valuehelp.DEFINECONDITIONS_FROM");
		} else {
			return oMessageBundle.getText("valuehelp.DEFINECONDITIONS_VALUE");
		}

	}

	function _getPlaceholder2ForOperator(sOperator) {

		const oOperator = sOperator && FilterOperatorUtil.getOperator(sOperator);

		if (oOperator && oOperator.aLabels) {
			return oOperator.aLabels[1];
		} else if (oOperator && oOperator.valueTypes[1]) {
			return oMessageBundle.getText("valuehelp.DEFINECONDITIONS_TO");
		}
	}

	function _updateRow(oCondition, oGrid, iIndex, oBindingContext, iRow) {

		const sIdPrefix = this.getId() + "--" + iRow;
		let aGridContent = oGrid.getContent();
		let oNullableType;

		const oOperatorField = aGridContent[iIndex];
		oOperatorField.setBindingContext(oBindingContext, "$this");
		if (oBindingContext) {
			oOperatorField.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition
		}
		if (oOperatorField.getValueState() === ValueState.Error && !oCondition.invalid) {
			// remove error and show right value
			oOperatorField.setValue(oOperatorField.getValue());
			oOperatorField.setValueState(ValueState.None);
			oOperatorField.setValueStateText();
		}
		iIndex++;

		const oRemoveButton = aGridContent[iIndex];
		oRemoveButton.setBindingContext(oBindingContext, "$this");
		if (oBindingContext) {
			// as Button is between Operatot and Value don't trigger validation on tabbing between
			oRemoveButton.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition
		}
		iIndex++;

		let oValueBindingContext;
		let oValue0Field = aGridContent[iIndex];
		let oValue1Field;
		if (oValue0Field.hasOwnProperty("_iValueIndex") && oValue0Field._iValueIndex === 0) {
			if (oCondition.values.length > 0) {
				oValueBindingContext = this._oManagedObjectModel.getContext(oBindingContext.getPath() + "values/0/");
				oValue0Field.setBindingContext(oValueBindingContext, "$this");
				oValue0Field.setBindingContext(oBindingContext, "$condition");
				if (oValue0Field.getMetadata().hasProperty("value") && (this._bUpdateType || !oValue0Field.getBindingInfo("value"))) {
					oNullableType = _getFieldType.call(this, oCondition.operator, 0);
					// change type for binding
					oValue0Field.bindProperty("value", { path: "$this>", type: oNullableType });
				}
				iIndex++;

				// value[1] only possible if value[0] exist
				oValue1Field = aGridContent[iIndex];
				if (oValue1Field.hasOwnProperty("_iValueIndex") && oValue1Field._iValueIndex === 1) {
					if (oCondition.values.length > 1) {
						oValueBindingContext = this._oManagedObjectModel.getContext(oBindingContext.getPath() + "values/1/");
						oValue1Field.setBindingContext(oValueBindingContext, "$this");
						if (oValue1Field.getMetadata().hasProperty("value") && (this._bUpdateType || !oValue1Field.getBindingInfo("value"))) {
							oNullableType = _getFieldType.call(this, oCondition.operator, 1);
							// change type for binding
							oValue1Field.bindProperty("value", { path: "$this>", type: oNullableType });
						}
						iIndex++;
					} else {
						oValue1Field.destroy();
					}
				} else if (oCondition.values.length > 1) {
					// insert new field
					oValue1Field = _createControl.call(this, oCondition, 1, sIdPrefix + "-values1", oBindingContext);
					if (oValue1Field) {
						oGrid.insertContent(oValue1Field, iIndex);
						iIndex++;
					}
				}
			} else {
				oValue0Field.destroy();
				oValue0Field = undefined;
				oValue1Field = aGridContent[iIndex + 1];
				if (oValue1Field && oValue1Field.hasOwnProperty("_iValueIndex") && oValue1Field._iValueIndex === 1) {
					oValue1Field.destroy();
				}
			}
		} else if (oCondition.values.length > 0) {
			for (let i = 0; i < oCondition.values.length; i++) {
				const oControl = _createControl.call(this, oCondition, i, sIdPrefix + "-values" + i, oBindingContext);
				if (oControl) {
					oGrid.insertContent(oControl, iIndex);
					iIndex++;
				}
			}
		}

		aGridContent = oGrid.getContent(); // as field might be added or removed
		const oRemoveButton2 = aGridContent[iIndex];
		oRemoveButton2.setBindingContext(oBindingContext, "$this");
		iIndex++;

		return iIndex;

	}

	function _validateFieldGroup(oEvent) {

		if (this._bPendingChange) {
			this._bPendingValidateCondition = true;
			return;
		}

		// TODO: can there be FieldGroups set from outside?
		let oField = oEvent.getSource();
		while (!(oField.getParent() instanceof Grid)) {
			// event might be fired on inner control -> find Field
			oField = oField.getParent();
		}

		_validateCondition.call(this, oField);

	}

	function _validateCondition(oField) {

		const oGrid = oField.getParent();
		let iIndex = oGrid.indexOfContent(oField);
		let oBindingContext;

		if (oField.getId().endsWith("-operator")) {
			// operator field - use first value field fo validate
			oBindingContext = oField.getBindingContext("$this");
			iIndex = iIndex + 2; // as remove button is between operator an value field
			oField = oGrid.getContent()[iIndex];
		} else if (oField.getId().endsWith("-removeBtnSmall")) {
			// operator field - use first value field fo validate
			oBindingContext = oField.getBindingContext("$this");
			iIndex = iIndex + 1; // as remove button is between operator an value field
			oField = oGrid.getContent()[iIndex];
		} else {
			oBindingContext = oField.getBindingContext("$condition");
		}

		let oField2; // also update second Field if exist
		const oCondition = oBindingContext.getObject();
		const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
		let bInvalid = !!oCondition.invalid;

		if (!bInvalid && oOperator.valueTypes.length > 0 && oOperator.valueTypes[0] !== OperatorValueType.Static) {
			// check only not static operators
			if (oOperator.valueTypes.length > 1 && oOperator.valueTypes[1]) {
				// two fields exist
				if (oField.hasOwnProperty("_iValueIndex") && oField._iValueIndex === 0) {
					oField2 = oGrid.getContent()[iIndex + 1];
				} else if (oField.hasOwnProperty("_iValueIndex") && oField._iValueIndex === 1) {
					oField2 = oGrid.getContent()[iIndex - 1];
				}
			}

			if (oField instanceof Field && !oField.isInvalidInput() && (!oField2 || !oField2.isInvalidInput())) { // TODO: better was to find out parsing error
				// if Field is in parsing error state, user entry is not transfered to condition, so validating makes no sense.
				const oType = oField.getBinding("value").getType(); // use nullable data type from Field - don't create new type for each check
				try {
					oOperator.validate(oCondition.values, oType);
					oField.setValueState(ValueState.None);
					oField.setValueStateText();
					if (oField2 && oField2.getMetadata().getAllProperties().valueState) {
						oField2.setValueState(ValueState.None);
						oField2.setValueStateText();
					}
				} catch (oException) {
					bInvalid = true;
					oField.setValueState(ValueState.Error);
					oField.setValueStateText(oException.message);
					if (oField2 && oField2.getMetadata().getAllProperties().valueState) {
						oField2.setValueState(ValueState.Error);
						oField2.setValueStateText(oException.message);
					}
				}
			}

			if (!bInvalid) {
				// check for duplicates
				const aConditions = this.getConditions();
				const sConditionPath = oBindingContext.getPath(); // Path to condition of the active control
				const iIndex = parseInt(sConditionPath.split("/")[2]); // index of current condition
				for (let i = 0; i < aConditions.length; i++) {
					if (i !== iIndex && !oCondition.isEmpty && FilterOperatorUtil.compareConditions(oCondition, aConditions[i])) {
						bInvalid = true;
						oField.setValueState(ValueState.Error);
						oField.setValueStateText(oMessageBundle.getText("field.CONDITION_ALREADY_EXIST", [oCondition.values[0]]));
						if (oField2 && oField2.getMetadata().getAllProperties().valueState) {
							oField2.setValueState(ValueState.Error);
							oField2.setValueStateText(oMessageBundle.getText("field.CONDITION_ALREADY_EXIST", [oCondition.values[1]]));
						}
						break;
					}
				}
			}

		}

		// check if at least one condition has an error
		_checkInvalidInput.call(this, bInvalid);

		this.fireConditionProcessed();

	}

	function _checkInvalidInput(bInvalid) {

		let i = 0;

		if (bInvalid !== true) {
			// if already known that invalid input exist -> no additional check needed
			const aConditions = this.getConditions();
			for (i = 0; i < aConditions.length; i++) {
				if (aConditions[i].invalid) {
					bInvalid = true;
					break;
				}
			}
		}

		if (bInvalid !== true) {
			const oGrid = this.byId("conditions");
			const aContent = oGrid.getContent();
			bInvalid = false;
			for (i = 0; i < aContent.length; i++) {
				const oControl = aContent[i];
				if (oControl.hasOwnProperty("_iValueIndex") && ((oControl instanceof Field && oControl.isInvalidInput()) || (oControl.getValueState && oControl.getValueState() === ValueState.Error))) {
					if (oControl instanceof Field && !oControl.isInvalidInput()) { // TODO: how to check for custom control? (Maybe we need a marker for duplicates)
						// might be a duplicate-error - check if still occurs
						let bDuplicates = false;
						const oBindingContext = oControl.getBindingContext("$condition");
						const oCondition = oBindingContext.getObject();
						const aConditions = this.getConditions();
						const sConditionPath = oBindingContext.getPath(); // Path to condition of the active control
						const iIndex = parseInt(sConditionPath.split("/")[2]); // index of current condition
						for (let i = 0; i < aConditions.length; i++) {
							if (i !== iIndex && !oCondition.isEmpty && FilterOperatorUtil.compareConditions(oCondition, aConditions[i])) {
								bDuplicates = true;
								break;
							}
						}
						if (!bDuplicates) {
							oControl.setValueState(ValueState.None);
							oControl.setValueStateText();
							continue;
						}
					}

					bInvalid = true;
				}
			}
		}

		this.setProperty("inputOK", !bInvalid, true); // do not invalidate whole DefineConditionPanel

	}

	function _getDefineConditions() {

		return this.getConditions().filter((oCondition) => {
			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			return oCondition.validated !== ConditionValidated.Validated || oOperator.exclude;
		});

	}

	function _handleNext(oEvent) {

		this._iStartIndex = this._iStartIndex + this._iShownConditions;
		this._iShownAdditionalConditions = 0;
		_renderConditions.call(this);

	}

	function _handlePrevious(oEvent) {

		this._iStartIndex = this._iStartIndex - this._iShownConditions;
		if (this._iStartIndex < 0) {
			this._iStartIndex = 0;
		}
		this._iShownAdditionalConditions = 0;
		_renderConditions.call(this);

	}

	function _handleRemoveAll(oEvent) {

		const aConditions = this.getConditions().filter((oCondition) => {
			const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			return oCondition.validated === ConditionValidated.Validated && !oOperator.exclude;
		});
		this.addDummyCondition(aConditions.length + 1);

		this._iStartIndex = 0;
		this._iShownAdditionalConditions = 0;
		this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
		this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.DEFINECONDITIONS_REMOVECONDITION_ANNOUNCE"), InvisibleMessageMode.Assertive);
		this.fireConditionProcessed();

	}

	function _handleInsert(oEvent) {
		const aConditions = this.getConditions();
		const oFormatOptions = this.getFormatOptions();
		const iMaxConditions = oFormatOptions.maxConditions;

		// get Index of first row (as validated conditions might exist and are hidden)
		const oGrid = this.byId("conditions");
		const aGridContent = oGrid.getContent();
		let iRows = 0;
		let iIndex = -1;

		for (const oField of aGridContent) {
			if (oField instanceof Field && oField.getValueHelp() === this._sOperatorHelpId) {
				// Operator field starts new row
				iRows++;
				if (iRows === 1) {
					// determine index for condition in first row
					const oBindingContext = oField.getBindingContext("$this");
					const sPath = oBindingContext.getPath();
					const aMatch = sPath.match(/^.*\/(\d+)\/$/);
					if (aMatch) {
						iIndex = parseInt(aMatch[1]);
					}
				}
			}
		}

		if (iMaxConditions === -1 || aConditions.length < iMaxConditions) {
			// create a new dummy condition for a new condition on the UI - must be removed later if not used or filled correct
			this.addDummyCondition(iIndex);

			if (iRows >= this._iShownConditions) {
				this._iShownAdditionalConditions++;
			}
		}

		this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.DEFINECONDITIONS_ADDCONDITION_ANNOUNCE"), InvisibleMessageMode.Assertive);
	}

	function _getPageText() {

		const aConditions = _getDefineConditions.call(this); // show only validated conditions
		const iPages = Math.ceil((aConditions.length - this._iShownAdditionalConditions) / this._iShownConditions);
		const iPage = Math.floor(this._iStartIndex / this._iShownConditions) + 1;
		const sText = oMessageBundle.getText("valuehelp.PAGE_COUNT", [iPage, iPages]);

		return sText;

	}

	return DefineConditionPanel;

});