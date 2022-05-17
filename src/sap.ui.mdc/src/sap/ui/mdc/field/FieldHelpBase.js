/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/Element',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/Operator',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/base/Log',
	'sap/base/util/merge',
	'sap/ui/base/SyncPromise',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException'
], function(
	Element,
	FilterOperatorUtil,
	Operator,
	Condition,
	ConditionValidated,
	Log,
	merge,
	SyncPromise,
	FormatException,
	ParseException
) {
	"use strict";

	var Popover;
	var mLibrary;

	/**
	 * Constructor for a new <code>FieldHelpBase</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Base type for the <code>FieldHelp</code> association in the <code>FieldBase</code> controls.
	 * @extends sap.ui.mdc.Element
	 * @implements sap.ui.core.PopupInterface
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.54.0
	 * @alias sap.ui.mdc.field.FieldHelpBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldHelpBase = Element.extend("sap.ui.mdc.field.FieldHelpBase", /** @lends sap.ui.mdc.field.FieldHelpBase.prototype */
	{
		metadata: {
			interfaces: ["sap.ui.core.PopupInterface"],
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The conditions of the selected items.
				 *
				 * <b>Note:</b> This property must only be set by the control the <code>FieldHelp</code> element
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
				 * Defines the module path of the metadata delegate.
				 */
				delegate: {
					type: "object",
					group: "Data",
					defaultValue: {
						name: "sap/ui/mdc/field/FieldHelpBaseDelegate"
					}
				},

				/**
				 * The value by which the help is filtered.
				 *
				 * <b>Note:</b> This only takes effect if the <code>FieldHelp</code> element supports filtering.
				 *
				 * <b>Note:</b> This property must only be set by the control the <code>FieldHelp</code> element
				 * belongs to, not by the application.
				 */
				filterValue: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * If this property is set, the user input is validated against the field help.
				 * If no entry is found for the user input, an error occurs.
				 *
				 * If this property is not set, the user input is still checked against the field help.
				 * But if no entry is found, the user input is set to the field if the used data type allows this.
				 * (A type parsing error is shown if the user input adheres to the requirements of the used data type.)
				 *
				 * @since 1.69.0
				 */
				validateInput: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				/**
				 * internal popover
				 */
				_popover: {
					type: "sap.m.Popover",
					multiple: false,
					visibility: "hidden"
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
						 * @since 1.60.0
						 */
						add: { type: "boolean" },

						/**
						 * Indicator if the field help is closed while selection
						 *
						 * since: 1.77.0
						 */
						close: {type: "boolean"}
					}
				},
				/**
				 * This event is fired when a value help entry is navigated using arrow keys.
				 *
				 * <b>Note:</b> This event must only be handled by the control the <code>FieldHelp</code> element
				 * belongs to, not by the application.
				 */
				navigate: {
					parameters: {

						/**
						 * The navigated <code>value</code>
						 */
						value: { type: "any" },

						/**
						 * The navigated <code>key</code>
						 */
						key: { type: "any" },

						/**
						 * The navigated <code>condition</code>
						 *
						 * <b>Note</b> A condition has the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
						 *
						 * @since 1.66.0
						 */
						condition: { type: "object" },

						/**
						 * The ID of the navigated item
						 *
						 * This is the DOM reference needed for ARIA support to point to the navigated item.
						 *
						 * @since 1.81.0
						 */
						itemId: { type: "string" },

						/**
						 * If set the focus visualization should be moved back to the field
						 *
						 * @since 1.91.0
						 */
						leaveFocus: { type: "boolean" }
					}
				},

				/**
				 * This event is fired when the data of the <code>FieldHelp</code> element has been changed.
				 *
				 * This might be needed to trigger an update for formatting a key with it's description.
				 *
				 * <b>Note:</b> This event must only be handled by the control the <code>FieldHelp</code> element
				 * belongs to, not by the application.
				 */
				dataUpdate: {
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
				 * This event is fired when the field help is opened.
				 * @since 1.60.0
				 */
				open: {
					/**
					 * If set, the field help is opened to display a suggestion
					 */
					suggestion: { type: "boolean" }
				},

				/**
				 * This event is fired after the field help has been closed.
				 * @since 1.61.0
				 */
				afterClose: {},

				/**
				 * This event is fired if suggestion should be closed and value help should be opened.
				 *
				 * The opening must be handled by the field as focus and accessibility handling is needed.
				 * @since 1.92.0
				 */
				switchToValueHelp: {}
			},
			defaultProperty: "filterValue"
		}
	});

	// private function to initialize globals for qUnit tests
	FieldHelpBase._init = function() {

		Popover = undefined;
		mLibrary = undefined;

	};

	FieldHelpBase.prototype.init = function() {

		Element.prototype.init.apply(this, arguments);

		this._oTextOrKeyPromises = {};

	};

	FieldHelpBase.prototype.invalidate = function(oOrigin) {
		// do not invalidate parent as this must not be the one who is the active parent.
		// invalidation must be done by Dialog.
		if (oOrigin) {
			var oPopover = this.getAggregation("_popover");
			if (oPopover && oOrigin === oPopover) {
				if (oOrigin.bOutput && !this._bIsBeingDestroyed) {
					// Popover content changed but no UiArea found, this should not happen.
					// now invalidate parent to trigger re-rendering somehow.
					var oParent = this.getParent();
					if (oParent) {
						oParent.invalidate(this);
					}
				}
				return;
			}
		}

	};

	FieldHelpBase.prototype.setFilterValue = function(sFilterValue) {

		this.setProperty("filterValue", sFilterValue, true); // do not invalidate whole FieldHelp

		return this;

	};

	/**
	 * Connects the <code>FieldHelp</code> element to a control.
	 *
	 * If the <code>FieldHelp</code> element is used as an association to multiple controls, it has to know
	 * the currently active control to open and interact.
	 *
	 * If the <code>FieldHelp</code> element is connected to a control, the <code>disconnected</code> event is fired
	 * to inform the previously connected control.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {sap.ui.core.Control} oField Control to which the <code>FieldHelp</code> element is connected to
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.connect = function(oField) {

		if (this._oField && this._oField !== oField) {
			var oPopover = this.getAggregation("_popover");
			if (oPopover) {
				oPopover._oPreviousFocus = null; // TODO - find real solution
			}
			this.close();
			this.setFilterValue("");
			this.setConditions([]);
			this.fireDisconnect();
		}

		this._oField = oField;

		_determineOperator.call(this, oField);

		return this;

	};

	/**
	 * Returns the currently active control to which the <code>FieldHelp</code> element is assigned.
	 *
	 * This is the control set by the <code>connect</code> function or the parent.
	 *
	 * @returns {sap.ui.core.Control} Control to which the <code>FieldHelp</code> element is connected
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 */
	FieldHelpBase.prototype._getField = function() {

		if (this._oField) {
			return this._oField;
		} else {
			return this.getParent();
		}

	};

	/**
	 * Returns the currently used operator for chosen values.
	 *
	 * @returns {sap.ui.mdc.condition.Operator} Operator used
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 */
	FieldHelpBase.prototype._getOperator = function() {

		if (!this._oOperator) {
			// use default
			this._oOperator = FilterOperatorUtil.getEQOperator();
		}

		return this._oOperator;

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
	 */
	FieldHelpBase.prototype._createCondition = function(sKey, sDescription, oInParameters, oOutParameters) {

		var oOperator = this._getOperator();

		var aValues = [sKey];
		if (oOperator.valueTypes.length > 1 && oOperator.valueTypes[1] !== Operator.ValueType.Static && sDescription !== null && sDescription !== undefined) {
			// description is supported
			aValues.push(sDescription);
		}

		return Condition.createCondition(oOperator.name, aValues, oInParameters, oOutParameters, ConditionValidated.Validated); // Conditions from help are always validated

	};

	/**
	 * Returns the control for which the suggestion is opened.
	 *
	 * @returns {sap.ui.core.Control} Control to which the <code>FieldHelp</code> element is connected
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 */
	FieldHelpBase.prototype._getControlForSuggestion = function() {

		var oField = this._getField();

		if (oField.getControlForSuggestion) {
			return oField.getControlForSuggestion();
		} else {
			return oField;
		}

	};

	/**
	 * Returns the currently used FieldPath.
	 *
	 * This is taken from the connected field.
	 *
	 * @returns {string} FieldPath
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 */
	FieldHelpBase.prototype.getFieldPath = function() {

		var sFieldPath = "";

		if (this._oField && this._oField.getFieldPath) {
			// if Field or FilterField -> use it's fieldPath
			sFieldPath =  this._oField.getFieldPath();
		}

		return sFieldPath || "Help";

	};

	FieldHelpBase.prototype.getDomRef = function() {

		var oPopover = this.getAggregation("_popover");
		if (oPopover) {
			return oPopover.getDomRef();
		} else {
			return Element.prototype.getDomRef.apply(this, arguments);
		}

	};

	/**
	 * Returns the ID of the content that displays the values (list or table).
	 *
	 * This is used to enrich the field with the corresponding ARIA attributes.
	 *
	 * @returns {string} Id
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.81.0
	 */
	FieldHelpBase.prototype.getContentId = function() {

		var oPopover = this.getAggregation("_popover");

		if (oPopover) {
			var aContent = oPopover._getAllContent();
			if (aContent.length === 1) {
				return aContent[0].getId();
			}
		}

	};

	/**
	 * Returns the value for aria attribute <code>haspopup</code>
	 *
	 * The screenreader needs to know what content the popup has.
	 *
	 * @returns {string|null} value for <code>haspopup</code>
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.92.0
	 */
	FieldHelpBase.prototype.getAriaHasPopup = function() {

		return "listbox"; // use listbox as default at it meets the most cases

	};

	/**
	 * Returns the description of the ARIA role added to the assigned field.
	 *
	 * Normally the role is set to <code>combobox</code>. This works for most cases,
	 * so per default no description is needed.
	 * But in some cases, such as the multi-select mode, an additional description is needed.
	 *
	 * @param {int} iMaxConditions maximal conditions allowed (as FieldHelp might not be connected to a field)
	 * @returns {string|null} rode description
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.81.0
	 */
	FieldHelpBase.prototype.getRoleDescription = function(iMaxConditions) {

		return null;

	};

	/**
	 * Checks if a "valueHelp enabled" text should be rendered for screenreader.
	 *
	 * If a complex value help exists on a field a corresponding text needs to be read out by screen readers.
	 * For simple "combobox" cases this is not needed. So this depends on the specific value help.
	 *
	 * @returns {boolean} If set, value help text needs to be rendered
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.86.0
	 */
	FieldHelpBase.prototype.getValueHelpEnabled = function() {

		return true;

	};

	/**
	 * Opens the field help for the <code>Field</code> control
	 * to which the <code>FieldHelp</code> element is connected.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {boolean} bSuggestion Flag that determines whether field help is opened for suggestion or for complex help
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.open = function(bSuggestion) {

		var oField = this._getField();

		if (oField) {
			var oPopover = this._getPopover();

			if (oPopover && !this._bOpenAfterPromise) { // if already waiting for popover or delegate it don't need to try
				delete this._bOpen;
				delete this._bSuggestion;
				if (!oPopover.isOpen()) {
					if (!this.isFocusInHelp()) {
						// focus should stay on Field
						oPopover.setInitialFocus(this._getControlForSuggestion());
					}

					// use FieldGropuIDs of field, to not leave group if focus moves to field help
					oPopover.setFieldGroupIds(oField.getFieldGroupIds());

					var fnOpen = function() {
						if (this._bOpenAfterPromise) {
							delete this._bOpenAfterPromise;
							this.open(bSuggestion);
						}
					}.bind(this);
					var bOpenSync = this._fireOpen(!!bSuggestion, fnOpen);
					if (bOpenSync) {
						if (oPopover._getAllContent().length > 0) {
							oPopover.openBy(this._getControlForSuggestion());
						} else {
							this._bOpenIfContent = true;
						}
					} else {
						this._bOpenAfterPromise = true;
					}
				}
			} else {
				this._bOpen = true;
				this._bSuggestion = bSuggestion;
			}
		} else {
			Log.warning("FieldHelp not assigned to field -> can not be opened.", this);
		}

	};

	/**
	 * closes the field help.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.close = function() {

		var oPopover = this.getAggregation("_popover");

		if (oPopover && oPopover.isOpen()) {
			var eOpenState = oPopover.oPopup.getOpenState();
			if (eOpenState !== "CLOSED" && eOpenState !== "CLOSING") { // TODO: better logic
				this._bClosing = true;
				oPopover.close();
			}
		} else {
			delete this._bOpen;
			delete this._bSuggestion;
			delete this._bOpenIfContent;
			delete this._bOpenAfterPromise;
		}

		this._bReopen = false;

	};

	/**
	 * Toggles the open state of the field help.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {boolean} bSuggestion Flag that determines whether field help is opened for suggestion or for complex help
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.toggleOpen = function(bSuggestion) {

		var oPopover = this.getAggregation("_popover");

		if (oPopover) {
			if (oPopover.isOpen()) {
				var eOpenState = oPopover.oPopup.getOpenState();
				if (eOpenState !== "CLOSED" && eOpenState !== "CLOSING") { // TODO: better logic
					this.close();
				} else {
					this._bReopen = true;
				}
			} else {
				this.open(bSuggestion);
			}
		} else if (this._bOpen || this._bOpenIfContent || this._bOpenAfterPromise) {
			// popover is requested and open is pending -> skip opening
			delete this._bOpen;
			delete this._bSuggestion;
			delete this._bOpenIfContent;
			delete this._bOpenAfterPromise;
		} else {
			// it is closed -> just open
			this.open(bSuggestion);
		}

	};

	/**
	 * Determines if the field help is open.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {boolean} bCheckClosing If set a closing field help is handled as closed
	 * @returns {boolean} true if open
	 *
	 * @since 1.66.0
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.isOpen = function(bCheckClosing) {

		if (bCheckClosing && this._bClosing) {
			return false;
		}

		var bIsOpen = false;
		var oPopover = this.getAggregation("_popover");

		if (oPopover) {
			bIsOpen = oPopover.isOpen();
		}

		return bIsOpen;

	};

	/**
	 * Skips the opening of the field help if it is pending because of loading content.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @since 1.73.0
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.skipOpening = function() {

		if (this._bOpenIfContent) {
			delete this._bOpenIfContent;
		}

		if (this._bOpenAfterPromise) {
			// we are waiting for resolving the promise - don't open if resolved
			delete this._bOpenAfterPromise;
		}

	};

	/**
	 * Calls initialization of the FieldHelp before the FieldHelp is really opened.
	 * This is called in Typeahead on first letter before the FieldHelp is opened with a delay. So the
	 * content can be determined in the delegate coding early.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {boolean} bSuggestion Flag that determines whether field help is opened for suggestion or for complex help
	 *
	 * @since 1.84.0
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.initBeforeOpen = function(bSuggestion) {

		if (this._bOpenAfterPromise) {
			return; // it already waits for opening, must not be initialized again
		}

		var fnBeforeOpen = function() {
			this._bBeforeOpenPending = false;
			if (this._bOpenAfterPromise) {
				delete this._bOpenAfterPromise;
				this.open(bSuggestion);
			}
		}.bind(this);

		var bSync = this._callContentRequest(bSuggestion, fnBeforeOpen);
		if (!bSync) {
			this._bBeforeOpenPending = true;
		}

	};


	/**
	 * Creates the internal <code>Popover</code> control.
	 *
	 * To be used by an inherited FieldHelp, not from outside.
	 *
	 * @returns {sap.m.Popover} Popover
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 */
	FieldHelpBase.prototype._createPopover = function() {

		var oPopover;

		if ((!Popover || !mLibrary) && !this._bPopoverRequested) {
			Popover = sap.ui.require("sap/m/Popover");
			mLibrary = sap.ui.require("sap/m/library");
			if (!Popover || !mLibrary) {
				sap.ui.require(["sap/m/Popover", "sap/m/library"], _PopoverLoaded.bind(this));
				this._bPopoverRequested = true;
			}
		}
		if (Popover && mLibrary && !this._bPopoverRequested) {
			oPopover = new Popover(this.getId() + "-pop", {
				contentHeight: "auto",
				placement: mLibrary.PlacementType.VerticalPreferredBottom,
				showHeader: false,
				showArrow: false,
				afterOpen: this._handleAfterOpen.bind(this),
				afterClose: this._handleAfterClose.bind(this)
			}).addStyleClass("sapMComboBoxBasePicker").addStyleClass("sapMComboBoxBasePicker-CTX"); // to have a ComboBox popup

			oPopover.isPopupAdaptationAllowed = function () {
				return false;
			};

			this.setAggregation("_popover", oPopover, true);

			if (this._oContent) {
				this._setContent(this._oContent);
			}
		}


		return oPopover;

	};

	function _PopoverLoaded(fnPopover, fnLibrary) {

		Popover = fnPopover;
		mLibrary = fnLibrary;
		this._bPopoverRequested = false;

		if (!this._bIsBeingDestroyed) {
			this._createPopover();
			if (this._bOpen) {
				this.open(this._bSuggestion);
			}
		}

	}

	/**
	 * Returns the internal <code>Popover</code> control. If the <code>Popover</code> control doesn't exist, it will be created.
	 *
	 * To be used by an inherited <code>FieldHelp</code> element, not from outside.
	 *
	 * @returns {sap.m.Popover} Popover
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 */
	FieldHelpBase.prototype._getPopover = function() {

		var oPopover = this.getAggregation("_popover");

		if (!oPopover) {
			oPopover = this._createPopover();
		}

		return oPopover;

	};

	/**
	 * Executed after the <code>Popover</code> control has been opened.
	 *
	 * To be used by an inherited <code>FieldHelp</code> element, not from outside.
	 *
	 * @param {object} oEvent Event object
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 */
	FieldHelpBase.prototype._handleAfterOpen = function(oEvent) {
	};

	/**
	 * Executed after the <code>Popover</code> control has been closed,
	 *
	 * To be used by an inherited <code>FieldHelp</code> element, not from outside.
	 *
	 * @param {object} oEvent Event object
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 */
	FieldHelpBase.prototype._handleAfterClose = function(oEvent) {

		this._bClosing = false;

		if (this._bReopen) {
			this._bReopen = false;
			this.open();
		}

		this.fireAfterClose();

	};

	/**
	 * Determines if the field help should be opened when something is typed into the field.
	 *
	 * Opening the field help must be triggered by the control the <code>FieldHelp</code> element
	 * belongs to.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @returns {boolean|Promise} if <code>true</code>, the field help should open by typing. If determined asynchronously, a <code>Promise</code> is returned
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.openByTyping = function() {

		return false;

	};

	/**
	 * Determines if the field help should be opened when the user clicks into the connected field.
	 *
	 * Opening the field help must be triggered by the control the <code>FieldHelp</code> element
	 * belongs to.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @returns {boolean} If <code>true</code>, the field help should open when user clicks into the connected field
	 * @since 1.81.0
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.openByClick = function() {

		return false;

	};

	/**
	 * Determines if the focus is set in the value help or stays in the calling control.
	 *
	 * @returns {boolean} if true, focus goes to the value help, if false it stays in the calling control.
	 *
	 * @since 1.75.0
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.isFocusInHelp = function() {

		return !this.openByTyping(); // in type-ahead focus should stay on field

	};

	/**
	 * The focus visualization of the field help needs to be removed as the user starts typing into the field.
	 *
	 * @since 1.92.0
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.removeFocus = function() {

	};

	/**
	 * Triggers navigation in the field help.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.navigate = function(iStep) {
		// to be implements by the concrete FieldHelp
	};

	/**
	 * Item object type.
	 *
	 * If an item is requested using a description or key, an object with the following
	 * properties is returned.
	 *
	 * @type {sap.ui.mdc.field.FieldHelpItem}
	 * @static
	 * @constant
	 * @typedef {object} sap.ui.mdc.field.FieldHelpItem
	 * @property {any} key Key of the item
	 * @property {string} description Description of the item
	 * @property {object} [inParameters] In parameters of the item. For each field path a value is stored
	 * @property {object} [outParameters] Out parameters of the item. For each field path a value is stored
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 */

	/**
	 * Determines the description for a given key.
	 *
	 * As the key might change (uppercase), an object with key and description can be returned.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {any} vKey Key
	 * @param {object} oInParameters In parameters for the key (as a key must not be unique.)
	 * @param {object} oOutParameters Out parameters for the key (as a key must not be unique.)
	 * @param {sap.ui.model.Context} oBindingContext <code>BindingContext</code> of the checked field. (Inside a table the <code>FieldHelp</code> element might be connected to a different row.)
	 * @param {sap.ui.mdc.condition.ConditionModel} [oConditionModel] <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @param {string} [sConditionModelName] Name of the <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @returns {string|sap.ui.mdc.field.FieldHelpItem|Promise} Description for key or object containing description, key, in and out parameters. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.FormatException} if entry is not found or not unique
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 */
	FieldHelpBase.prototype.getTextForKey = function(vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName) {
		return _getTextForKey.call(this, vKey, oBindingContext, oInParameters, oOutParameters, false, oConditionModel, sConditionModelName, true); // case sensitive as used to get description for known key
	};

	function _getTextForKey(vKey, oBindingContext, oInParameters, oOutParameters, bNoRequest, oConditionModel, sConditionModelName, bCaseSensitive) {
		return _getTextOrKeyDelegateHandler.call(this, true, vKey, oBindingContext, oInParameters, oOutParameters, bNoRequest, oConditionModel, sConditionModelName, undefined, false, bCaseSensitive);
	}

	/**
	 * Determines the key for a given description.
	 *
	 * As the description might change (uppercase), an object with key and description can be returned.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * <b>Note:</b> As this must not be unique, the result key may be just one for one of the matching texts.
	 *
	 * @param {string} sText Description
	 * @param {sap.ui.model.Context} oBindingContext <code>BindingContext</code> of the checked field. (Inside a table the <code>FieldHelp</code> element might be connected to a different row.)
	 * @param {sap.ui.mdc.condition.ConditionModel} [oConditionModel] <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @param {string} [sConditionModelName] Name of the <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @returns {any|sap.ui.mdc.field.FieldHelpItem|Promise} Key for description or object containing description, key, in and out parameters. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.ParseException} if entry is not found or not unique
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 */
	FieldHelpBase.prototype.getKeyForText = function(sText, oBindingContext, oConditionModel, sConditionModelName) {
		return _getKeyForText.call(this, sText, oBindingContext, false, oConditionModel, sConditionModelName, true); // case sensitive as used to get key for known description
	};

	function _getKeyForText(sText, oBindingContext, bNoRequest, oConditionModel, sConditionModelName, bCaseSensitive) {
		return _getTextOrKeyDelegateHandler.call(this, false, sText, oBindingContext, undefined, undefined, bNoRequest, oConditionModel, sConditionModelName, undefined, false, bCaseSensitive);
	}

	/**
	 * Determines the description for a given key or the key for a given description.
	 *
	 * As the key might also change (uppercase), an object with key and description can be returned.
	 *
	 * When using <code>getKeyForText</code>, <code>oInParamer</code> and </code>oOutParameter</code> are not supported.
	 *
	 * @param {any} vValue Key or description
	 * @param {boolean} bKey If <code>true</code> <code>vValue</code> is handled as key, otherwise as description
	 * @param {sap.ui.model.Context} oBindingContext BindingContext of the checked field. (Inside a table FieldHelp might be connected to a different row.)
	 * @param {object} oInParameters In parameters for the key (as a key must not be unique.)
	 * @param {object} oOutParameters Out parameters for the key (as a key must not be unique.)
	 * @param {boolean} bNoRequest If <code>true</code> the check must be only done on existing content (table items). Otherwise a backend request could be triggered if needed
	 * @param {sap.ui.mdc.condition.ConditionModel} [oConditionModel] <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @param {string} [sConditionModelName] Name of the <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @param {any} vParsedValue Parsed value to be used as key
	 * @param {boolean} bKeyAndDescription If <code>true</code>, key and description are determined with one call
	 * @param {boolean} bCaseSensitive If <code>true</code>, the filtering is case-sensitive
	 * @returns {string|sap.ui.mdc.field.FieldHelpItem|Promise} Description for key, key for description or object containing description, key, in and out parameters. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
	 *
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 * @since 1.77.0
	 */
	FieldHelpBase.prototype._getTextOrKey = function(vValue, bKey, oBindingContext, oInParameters, oOutParameters, bNoRequest, oConditionModel, sConditionModelName, vParsedValue, bKeyAndDescription, bCaseSensitive) {
		// to be implements by the concrete FieldHelp
		if (bKey) {
			return "";
		} else {
			return undefined;
		}
	};

	/**
	 * Defines if the field help supports backend requests to determine key or description
	 *
	 * @returns {boolean} Flag if backend requests are supported
	 *
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 * @since 1.81.0
	 */
	FieldHelpBase.prototype._isTextOrKeyRequestSupported = function() {
		// to be implemented by the concrete FieldHelp
		return false;
	};

	/**
	 * Defines if the field help supports input validation to determine key or description
	 *
	 * @returns {boolean} Flag if validation is supported
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 * @since 1.82.0
	 */
	FieldHelpBase.prototype.isValidationSupported = function() {
		// to be implemented by the concrete FieldHelp
		return this.isUsableForValidation();
	};

	/**
	 * Determines the item (key and description) for a given value.
	 *
	 * The field help checks if there is an item with a key or description that fits this value.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @param {any} vValue Value as entered by user
	 * @param {any} vParsedValue Value parsed by type to fit the data type of the key
	 * @param {object} oInParameters In parameters for the key (as a key must not be unique.)
	 * @param {object} oOutParameters Out parameters for the key (as a key must not be unique.)
	 * @param {sap.ui.model.Context} oBindingContext <code>BindingContext</code> of the checked field. Inside a table the <code>FieldHelp</code> element might be connected to a different row.
	 * @param {boolean} bCheckKeyFirst If set, the field help checks first if the value fits a key
	 * @param {boolean} bCheckKey If set, the field help checks only if there is an item with the given key. This is set to <code>false</code> if the value cannot be a valid key because of type validation.
	 * @param {boolean} bCheckDescription If set, the field help checks only if there is an item with the given description. This is set to <code>false</code> if only the key is used in the field.
	 * @param {sap.ui.mdc.condition.ConditionModel} [oConditionModel] <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @param {string} [sConditionModelName] Name of the <code>ConditionModel</code>, in case of <code>FilterField</code>
	 * @returns {sap.ui.mdc.field.FieldHelpItem|Promise} Object containing description, key, in and out parameters. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 * @since 1.77.0
	 */
	FieldHelpBase.prototype.getItemForValue = function(vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName) {

		if (typeof vValue !== "object" || !vValue.hasOwnProperty("value")) {
			// not new config object -> map old properties to config
			vValue = {
					value: vValue,
					parsedValue: vParsedValue,
					inParameters: oInParameters, // TODO: needed?
					outParameters: oOutParameters, // TODO: needed?
					bindingContext: oBindingContext,
					checkKeyFirst: bCheckKeyFirst, // TODO: not longer needed?
					checkKey: bCheckKey,
					checkDescription: bCheckDescription,
					conditionModel: oConditionModel,
					conditionModelName: sConditionModelName
			};
		}

		if (vValue && typeof vValue === "object" && vValue.hasOwnProperty("value")) {
			// map new Config to old API
			return _getItemForValue.call(this, vValue.value, vValue.parsedValue, vValue.inParameters, vValue.outParameters, vValue.bindingContext, vValue.checkKeyFirst && vValue.checkKey, vValue.checkKey, vValue.checkDescription, vValue.conditionModel, vValue.conditionModelName);
		} else {
			return _getItemForValue.call(this, vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, bCheckKeyFirst && bCheckKey, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName);
		}

	};

	function _getItemForValue(vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, oConditionModel, sConditionModelName) {

		return SyncPromise.resolve().then(function() {
			// filter case insensitive as user input might in this way
			if (bCheckKey && bCheckDescription) {
				return _getTextOrKeyDelegateHandler.call(this, true, vValue, oBindingContext, oInParameters, oOutParameters, false, oConditionModel, sConditionModelName, vParsedValue, true, false);
			} else if (bCheckKey) {
				return _getTextForKey.call(this, vParsedValue, oBindingContext, oInParameters, oOutParameters, false, oConditionModel, sConditionModelName, false);
			} else if (bCheckDescription) {
				return _getKeyForText.call(this, vValue, oBindingContext, false, oConditionModel, sConditionModelName, false);
			}
		}.bind(this)).then(function(vResult) {
			if (vResult) {
				if (typeof vResult === "object") {
					return vResult;
				} else if (bCheckKey) {
					// create object
					return {key: vParsedValue, description: vResult};
				} else {
					// create object
					return {key: vResult, description: vValue};
				}
			} else {
				return undefined; // to have alway undefined, not "", null or false
			}
		}).catch(function(oException) {
			throw oException;
		}).unwrap();

	}

	/**
	 * Defines if the field help is used for input validation.
	 *
	 * @returns {boolean} True if field help can be used for input validation
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.75.0
	 */
	FieldHelpBase.prototype.isUsableForValidation = function() {
		// to be implements by the concrete FieldHelp
		return true;
	};

	/**
	 * Triggers some logic that must be executed in <code>FieldHelp</code> element if a <code>Change</code> event
	 * on the connected field is fired.
	 *
	 * This is done if the corresponding field value is changed (not during navigation).
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>FieldHelp</code> element
	 * belongs to, not by the application.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.66.0
	 */
	FieldHelpBase.prototype.onFieldChange = function() {

	};

	/**
	 * Sets the content of the <code>FieldHelp</code> element.
	 *
	 * To be used by an inherited <code>FieldHelp</code> element, not from outside.
	 *
	 * @param {string} oContent Content control to be placed at the <code>Popover</code>
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 */
	FieldHelpBase.prototype._setContent = function(oContent) {

		var oPopover = this.getAggregation("_popover");

		if (oPopover) {
			oPopover.removeAllContent();
			oPopover.addContent(oContent);
			this._oContent = undefined;
			if (this._bOpenIfContent) {
				var oField = this._getField();
				if (oField) {
					oPopover.openBy(this._getControlForSuggestion());
				}
				this._bOpenIfContent = false;
			}
		} else {
			this._oContent = oContent;
		}
		return this;

	};

	/**
	 * Determines the icon for the value help.
	 *
	 * @returns {string} Name of the icon
	 *
	 * @since 1.60.0
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	FieldHelpBase.prototype.getIcon = function() {
		return "sap-icon://slim-arrow-down";
	};

	// if UIArea not found - use the one of the connected field
	// TODO: find better solution
	FieldHelpBase.prototype.getUIArea = function() {
		var oUIArea = Element.prototype.getUIArea.apply(this, arguments);
		if (!oUIArea) {
			if (this._oField) {
				oUIArea = this._oField.getUIArea();
			}
		}

		return oUIArea;
	};

	/**
	 * Returns the {@link ap.ui.core.delegate.ScrollEnablement ScrollEnablement} delegate which is used by this control.
	 * @returns {sap.ui.core.ScrollEnablementDelegate} The scroll delegate instance
	 * @private
	 */
	FieldHelpBase.prototype.getScrollDelegate = function () {

		var oPopover = this.getAggregation("_popover");

		if (oPopover) {
			return oPopover.getScrollDelegate();
		} else {
			return undefined;
		}

	};

	/**
	 * Fires the <code>open</code> event and calls <code>contentRequest</code> function of the delegate.
	 *
	 * If the delegate returns a promise, the callback function is called (for example, to open the field help) after the Promise has been resolved.
	 *
	 * @param {boolean} bSuggestion Flag if field help is opened for a suggestion or for ValueHelp
	 * @param {function} fnCallback Callback function executed after asynchronous execution
	 * @returns {boolean} True if the field help can be opened synchronously
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 * @since 1.77.0
	 */
	FieldHelpBase.prototype._fireOpen = function(bSuggestion, fnCallback) {

		if (this._bBeforeOpenPending) {
			// it allready waits for content
			return false;
		}

		var bSync = this._callContentRequest(bSuggestion, fnCallback);

		if (bSync) {
			this.fireOpen({suggestion: bSuggestion});
		}

		return bSync;

	};

	/**
	 * Calls the <code>contentRequest</code> function of the delegate.
	 *
	 * @param {boolean} bSuggestion Flag if field help is opened for a suggestion or for ValueHelp
	 * @param {function} fnCallback Callback function executed after asynchronous execution
	 * @returns {boolean} True if the field help can be opened synchronously
	 * @private
	 * @ui5-restricted FieldHelp subclasses
	 * @since 1.77.0
	 */
	FieldHelpBase.prototype._callContentRequest = function(bSuggestion, fnCallback) {

		if (!this._bNoContentRequest) {
			if (this._oContentRequestPromise) {
				// we are waiting for resolving the promise - don't request open again
				this._oContentRequestPromise.then(function() {
					this._bNoContentRequest = true;
					fnCallback();
					this._bNoContentRequest = false;
				}.bind(this));
				return false;
			}

			if (!this.bDelegateInitialized && !this.bDelegateLoading) {
				this.initControlDelegate();
			}

			if (this.bDelegateInitialized) {
				var oProperties = this._getContenRequestProperties(bSuggestion);
				var oPromise = this.getControlDelegate().contentRequest(this.getPayload(), this, bSuggestion, oProperties);
				if (oPromise instanceof Promise) {
					this._oContentRequestPromise = oPromise;

					oPromise.then(function() {
						this._oContentRequestPromise = undefined;
						this._bNoContentRequest = true;
						fnCallback();
						this._bNoContentRequest = false;
					}.bind(this));

					return false;
				}
			} else {
				this.awaitControlDelegate().then(function() {
					if (this._callContentRequest(bSuggestion, fnCallback)) {
						// callback can be directly executed
						fnCallback();
					}
				}.bind(this));
				return false;
			}
		}

		return true;

	};

	/**
	 * Gets the field help specific properties for <code>contentRequest</code> function of the delegate.
	 *
	 * @param {boolean} bSuggestion Flag if field help is opened for a suggestion or for ValueHelp
	 * @returns {null|object} Object with properties
	 * @private
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @since 1.87.0
	 */
	FieldHelpBase.prototype._getContenRequestProperties = function(bSuggestion) {
		return null;
	};

	// delegate-handling for getTextForKey and getKeyForText
	function _getTextOrKeyDelegateHandler(bKey, vValue, oBindingContext, oInParameters, oOutParameters, bNoRequest, oConditionModel, sConditionModelName, vParsedValue, bKeyAndDescription, bCaseSensitive) {

		var sInParameters = JSON.stringify(oInParameters);
		var sContextPath = oBindingContext && oBindingContext.getPath();
		if (this._oTextOrKeyPromises[bKey] &&
				this._oTextOrKeyPromises[bKey][vValue] &&
				this._oTextOrKeyPromises[bKey][vValue][sInParameters] &&
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath]) {
			return this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].promise;
		}

		var fnContentLoaded = function() {
			_handleContentLoadedForTextAndKey.call(this);
		}.bind(this);

		var bSync = this._callContentRequest(true, fnContentLoaded); // use suggestion as FilterBar is not needed here
		if (!bSync) {
			if (!this._oTextOrKeyPromises[bKey]) {
				this._oTextOrKeyPromises[bKey] = {};
			}
			if (!this._oTextOrKeyPromises[bKey][vValue]) {
				this._oTextOrKeyPromises[bKey][vValue] = {};
			}
			if (!this._oTextOrKeyPromises[bKey][vValue][sInParameters]) {
				this._oTextOrKeyPromises[bKey][vValue][sInParameters] = {};
			}
			if (!this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath]) {
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath] = {};
			}

			this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].promise = new Promise(function(fnResolve, fnReject) {
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].resolve = fnResolve;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].reject = fnReject;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].key = bKey;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].value = vValue;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].inParameters = oInParameters ? merge({}, oInParameters) : undefined;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].outParameters = oOutParameters ? merge({}, oOutParameters) : undefined;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].bindingContext = oBindingContext;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].noRequest = bNoRequest;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].conditionModel = oConditionModel;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].conditionModelName = sConditionModelName;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].parsedValue = vParsedValue;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].keyAndDescription = bKeyAndDescription;
				this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].caseSensitive = bCaseSensitive;
			}.bind(this));

			return this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].promise;
		}

		return this._getTextOrKey(vValue, bKey, oBindingContext, oInParameters, oOutParameters, bNoRequest, oConditionModel, sConditionModelName, vParsedValue, bKeyAndDescription, bCaseSensitive);

	}

	function _handleContentLoadedForTextAndKey() {

		// resolve all waiting promises
		for ( var bKey in this._oTextOrKeyPromises) {
			for ( var vValue in this._oTextOrKeyPromises[bKey]) {
				for ( var sInParameters in this._oTextOrKeyPromises[bKey][vValue]) {
					for ( var sContextPath in this._oTextOrKeyPromises[bKey][vValue][sInParameters]) {
						_getTextAndKeyAfterContentLoaded.call(this, this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath]);
						delete this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath];
					}
				}
			}
		}

	}

	// own function to not define functions in loop
	function _getTextAndKeyAfterContentLoaded(oTextOrKeyInfo) {

		var vMyValue = oTextOrKeyInfo.value;
		var bMyKey = oTextOrKeyInfo.key;
		var oInParameters = oTextOrKeyInfo.inParameters;
		var oOutParameters = oTextOrKeyInfo.outParameters;
		var oBindingContext = oTextOrKeyInfo.bindingContext;
		var bNoRequest = oTextOrKeyInfo.noRequest;
		var fnResolve = oTextOrKeyInfo.resolve;
		var fnReject = oTextOrKeyInfo.reject;
		var oConditionModel = oTextOrKeyInfo.conditionModel;
		var sConditionModelName = oTextOrKeyInfo.conditionModelName;
		var vParsedValue = oTextOrKeyInfo.parsedValue;
		var bKeyAndDescription = oTextOrKeyInfo.keyAndDescription;
		var bCaseSensitive = oTextOrKeyInfo.caseSensitive;

		SyncPromise.resolve().then(function() {
			return this._getTextOrKey(vMyValue, bMyKey, oBindingContext, oInParameters, oOutParameters, bNoRequest, oConditionModel, sConditionModelName, vParsedValue, bKeyAndDescription, bCaseSensitive);
		}.bind(this)).then(function(vResult) {
			fnResolve(vResult);
		}).catch(function(oException) {
			fnReject(oException);
		}).unwrap();

	}

	function _determineOperator(oField) {

		this._oOperator = undefined;

		if (oField && oField._getOperators) {
			this._oOperator = FilterOperatorUtil.getEQOperator(oField._getOperators());
		}

	}

	/// renaming of functions -> call original ones
	FieldHelpBase.prototype.isTypeaheadSupported = function() {
		return this.openByTyping();
	};
	FieldHelpBase.prototype.shouldOpenOnClick = function() {
		return this.openByClick();
	};
	FieldHelpBase.prototype.onControlChange = function() {
		return this.onFieldChange();
	};

	FieldHelpBase.prototype.getAriaAttributes = function(iMaxConditions) {

		return {
			contentId: this.getContentId(),
			ariaHasPopup: this.getAriaHasPopup(),
			role: "combobox",
			roleDescription: this.getRoleDescription(iMaxConditions),
			valueHelpEnabled: this.getValueHelpEnabled()
		};

	};

	FieldHelpBase.prototype.attachEvent = function(sEventId, oData, fnFunction, oListener) {
		if (sEventId === "navigated") {
			return Element.prototype.attachEvent.apply(this, ["navigate", oData, fnFunction, oListener]);
		} else {
			return Element.prototype.attachEvent.apply(this, arguments);
		}
	};

	FieldHelpBase.prototype.detachEvent = function(sEventId, fnFunction, oListener) {
		if (sEventId === "navigated") {
			return Element.prototype.detachEvent.apply(this, ["navigate", fnFunction, oListener]);
		} else {
			return Element.prototype.detachEvent.apply(this, arguments);
		}
	};

	return FieldHelpBase;

});
