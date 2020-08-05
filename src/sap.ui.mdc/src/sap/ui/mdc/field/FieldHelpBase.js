/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/Element',
	'sap/base/Log',
	'sap/base/util/merge',
	'sap/ui/base/SyncPromise',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException'
], function(
	Element,
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
						itemId: { type: "string" }
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
				afterClose: {}
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
	 * @returns {sap.ui.mdc.field.FieldHelpBase} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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

		return this;

	};

	/**
	 * Returns the currently active control to which the <code>FieldHelp</code> element is assigned.
	 *
	 * This is the control set by the <code>connect</code> function or the parent.
	 *
	 * @returns {sap.ui.core.Control} Control to which the <code>FieldHelp</code> element is connected
	 * @private
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype._getField = function() {

		if (this._oField) {
			return this._oField;
		} else {
			return this.getParent();
		}

	};

	/**
	 * Returns the control for which the suggestion is opened.
	 *
	 * @returns {sap.ui.core.Control} Control to which the <code>FieldHelp</code> element is connected
	 * @private
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * Returns the description of the ARIA role added to the assigned field.
	 *
	 * Normally the role is set to <code>combobox</code>. This works for most cases,
	 * so per default no description is needed.
	 * But in some cases, such as the multi-select mode, an additional description is needed.
	 *
	 * @returns {string|null} rode description
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.81.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype.getRoleDescription = function() {

		return null;

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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype.open = function(bSuggestion) {

		var oField = this._getField();

		if (oField) {
			var oPopover = this._getPopover();

			if (oPopover) {
				delete this._bOpen;
				delete this._bSuggestion;
				if (!oPopover.isOpen()) {
					if (!this.isFocusInHelp()) {
						// focus should stay on Field
						oPopover.setInitialFocus(this._getControlForSuggestion());
					}

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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * Creates the internal <code>Popover</code> control.
	 *
	 * To be used by an inherited FieldHelp, not from outside.
	 *
	 * @returns {sap.m.Popover} Popover
	 * @private
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
				placement: mLibrary.PlacementType.VerticalPreferredBottom,
				showHeader: false,
				showArrow: false,
				afterOpen: this._handleAfterOpen.bind(this),
				afterClose: this._handleAfterClose.bind(this)
			});

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
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype.isFocusInHelp = function() {

		return !this.openByTyping(); // in type-ahead focus should stay on field

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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @typedef {Object} sap.ui.mdc.field.FieldHelpItem
	 * @property {any} key - Key of the item
	 * @property {string} description - Description of the item
	 * @property {object} [inParameters] - In parameters of the item. For each field path a value is stored
	 * @property {object} [outParameters] - Out parameters of the item. For each field path a value is stored
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
	 * @returns {string|sap.ui.mdc.field.FieldHelpItem|Promise} Description for key or object containing description, key, in and out parameters. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype.getTextForKey = function(vKey, oInParameters, oOutParameters, oBindingContext) {
		return _getTextForKey.call(this, vKey, oBindingContext, oInParameters, oOutParameters, false);
	};

	function _getTextForKey(vKey, oBindingContext, oInParameters, oOutParameters, bNoRequest) {
		return _getTextOrKeyDelegateHandler.call(this, true, vKey, oBindingContext, oInParameters, oOutParameters, bNoRequest);
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
	 * @returns {any|sap.ui.mdc.field.FieldHelpItem|Promise} Key for description or object containing description, key, in and out parameters. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype.getKeyForText = function(sText, oBindingContext) {
		return _getKeyForText.call(this, sText, oBindingContext, false);
	};

	function _getKeyForText(sText, oBindingContext, bNoRequest) {
		return _getTextOrKeyDelegateHandler.call(this, false, sText, oBindingContext, undefined, undefined, bNoRequest);
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
	 * @returns {string|sap.ui.mdc.field.FieldHelpItem|Promise} Description for key, key for description or object containing description, key, in and out parameters. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 *
	 * @private
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @since 1.77.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype._getTextOrKey = function(vValue, bKey, oBindingContext, oInParameters, oOutParameters, bNoRequest) {
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
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @since 1.81.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype._isTextOrKeyRequestSupported = function() {
		// to be implements by the concrete FieldHelp
		return false;
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
	 * @returns {sap.ui.mdc.field.FieldHelpItem|Promise} Object containing description, key, in and out parameters. If it is not available right now (must be requested), a <code>Promise</code> is returned.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.ui.mdc.field.ConditionType
	 * @since 1.77.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype.getItemForValue = function(vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription) {

		return SyncPromise.resolve().then(function() {
			// first try without backend request
			return _getItemForValue.call(this, vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, bCheckKeyFirst && bCheckKey, bCheckKey, bCheckDescription, true, true);
		}.bind(this)).then(function(vResult) {
			if (!vResult && this._isTextOrKeyRequestSupported()) {
				// try to call with backend request
				return _getItemForValue.call(this, vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, bCheckKeyFirst && bCheckKey, bCheckKey, bCheckDescription, true, false);
			} else {
				return vResult;
			}
		}.bind(this)).catch(function(oException) {
			_checkExceptionThown.call(this, oException, !this._isTextOrKeyRequestSupported());

			if (this._isTextOrKeyRequestSupported()) {
				// try to call with backend request
				var vResult = _getItemForValue.call(this, vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, bCheckKeyFirst && bCheckKey, bCheckKey, bCheckDescription, true, false);

				if (!vResult) {
					// nothing found -> throw initial exception
					throw oException;
				}

				return vResult;
			}
		}.bind(this)).unwrap();

	};

	function _getItemForValue(vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription, bFirstCheck, bNoRequest) {

		return SyncPromise.resolve().then(function() {
			if (bCheckKeyFirst) {
				if (bCheckKey) {
					return _getTextForKey.call(this, vParsedValue, oBindingContext, oInParameters, oOutParameters, bNoRequest);
				}
			} else if (bCheckDescription) {
				return _getKeyForText.call(this, vValue, oBindingContext, bNoRequest);
			}
		}.bind(this)).then(function(vResult) {
			if (vResult) {
				if (typeof vResult === "object") {
					return vResult;
				} else if (bCheckKeyFirst) {
					// create object
					return {key: vParsedValue, description: vResult};
				} else {
					// create object
					return {key: vResult, description: vValue};
				}
			} else if (bFirstCheck && ((bCheckKeyFirst && bCheckDescription) || (!bCheckKeyFirst && bCheckKey))) {
				return _getItemForValue.call(this, vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, !bCheckKeyFirst, bCheckKey, bCheckDescription, false, bNoRequest);
			} else {
				return undefined; // to have alway undefined, not "", null or false
			}
		}.bind(this)).catch(function(oException) {
			_checkExceptionThown.call(this, oException, oException && oException._bSecondCheck);

			if (bFirstCheck && ((bCheckKeyFirst && bCheckDescription) || (!bCheckKeyFirst && bCheckKey))) {
				var vResult = _getItemForValue.call(this, vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, !bCheckKeyFirst, bCheckKey, bCheckDescription, false, bNoRequest);

				if (!vResult) {
					// nothing found -> throw initial exception
					throw oException;
				}

				return vResult;
			} else {
				oException._bSecondCheck = true; // prevent to call _getItemForValue again
				throw oException;
			}
		}.bind(this)).unwrap();

	}

	function _checkExceptionThown(oException, bThowImmediately) {

		if (oException) {
			if (bThowImmediately) {
				// just thow it
				throw oException;
			}

			if (!(oException instanceof ParseException) && !(oException instanceof FormatException)) {
				// unknown error -> just raise it
				throw oException;
			}

			if (oException._bNotUnique) { // TODO: better solution?
				// not unique -> just throw exception
				throw oException;
			}
		}

	}

	/**
	 * Defines if the field help is used for input validation.
	 *
	 * @returns {boolean} True if field help can be used for input validation
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.75.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype.onFieldChange = function() {

	};

	/**
	 * Sets the content of the <code>FieldHelp</code> element.
	 *
	 * To be used by an inherited <code>FieldHelp</code> element, not from outside.
	 *
	 * @param {string} oContent Content control to be placed at the <code>Popover</code>
	 * @returns {sap.ui.mdc.field.FieldHelpBase} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * Returns the <code>sap.ui.core.ScrollEnablement</code> delegate which is used by this control.
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
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @sincs 1.77.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype._fireOpen = function(bSuggestion, fnCallback) {

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
	 * @ui5-restricted to be enhanced by field helps inherit from FieldHelp
	 * @sincs 1.77.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldHelpBase.prototype._callContentRequest = function(bSuggestion, fnCallback) {

		if (!this._bNoContentRequest) {
			if (this._oContentRequestPromise) {
				// we are waiting for resolving the promise - don't request open again
				return false;
			}

			this.initControlDelegate();

			if (this.bDelegateInitialized) {
				var oPromise = this.getControlDelegate().contentRequest(this.getPayload(), this, bSuggestion);
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

	// delegate-handling for getTextForKey and getKeyForText
	function _getTextOrKeyDelegateHandler(bKey, vValue, oBindingContext, oInParameters, oOutParameters, bNoRequest) {

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
			}.bind(this));

			return this._oTextOrKeyPromises[bKey][vValue][sInParameters][sContextPath].promise;
		}

		return this._getTextOrKey(vValue, bKey, oBindingContext, oInParameters, oOutParameters, bNoRequest);

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

		SyncPromise.resolve().then(function() {
			return this._getTextOrKey(vMyValue, bMyKey, oBindingContext, oInParameters, oOutParameters, bNoRequest);
		}.bind(this)).then(function(vResult) {
			fnResolve(vResult);
		}).catch(function(oException) {
			fnReject(oException);
		}).unwrap();

	}

	return FieldHelpBase;

});
