/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/Select',
	'sap/ui/mdc/field/FieldSelectRenderer',
	'sap/ui/mdc/field/ConditionsType',
	'sap/ui/core/Element',
	'sap/ui/base/ManagedObjectObserver',
	'sap/base/util/merge'

], (
	Select,
	SelectRenderer,
	ConditionsType,
	Element,
	ManagedObjectObserver,
	merge
) => {
	"use strict";

	/**
	 * Constructor for a new <code>FieldSelect</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * The <code>FieldSelect</code> control is used to render an select field inside a control based on {@link sap.ui.mdc.field.FieldBase FieldBase}.
	 * It enhances the {@link sap.m.Select Select} control to allow {@link sap.ui.mdc.field.FieldBase FieldBase}-specific ValueHelp logic.
	 * @extends sap.m.Input
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.138
	 * @alias sap.ui.mdc.field.FieldSelect
	 */
	const FieldSelect = Select.extend("sap.ui.mdc.field.FieldSelect", /** @lends sap.ui.mdc.field.FieldSelect.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Sets the ARIA attributes added to the <code>Select</code> control.
				 *
				 * The object contains ARIA attributes in an <code>aria</code> node.
				 * Additional attributes, such as <code>role</code>, <code>autocomplete</code> or <code>valueHelpEnabled</code>, are added on root level.
				 */
				ariaAttributes: {
					type: "object",
					defaultValue: {},
					byValue: true
				}
			},
			events: {
				/**
				 * Fired if value help is triggered.
				 */
				valueHelpRequest : {
					parameters : {
						/**
						 * The event parameter is set to true, when the event is fired after keyboard interaction, otherwise false.
						 */
						fromKeyboard: {type: "boolean"}
					}
				}
			}
		},
		renderer: SelectRenderer
	});

	FieldSelect.prototype.init = function() {

		Select.prototype.init.apply(this, arguments);

		this._sSelectedKeyOnFocus = null;

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));
		this._oObserver.observe(this, {
			properties: ["ariaAttributes"]
		});

	};

	FieldSelect.prototype.exit = function() {

		Select.prototype.exit.apply(this, arguments);

		this._sSelectedKeyOnFocus = null;

		if (this._oConditionsType) {
			this._oConditionsType.destroy();
			this._oConditionsType = undefined;
		}

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	FieldSelect.prototype.setProperty = function(sPropertyName, vValue, bSuppressInvalidate) {

		// do not invalidate on ariaAttributes to prevent re-remdering. It needs to be changed directly in any case
		if (sPropertyName === "ariaAttributes") { // TODO: also on selectedKey as changed by ValueHelpSelection and so on
			bSuppressInvalidate = true;
		}

		return Select.prototype.setProperty.apply(this, [sPropertyName, vValue, bSuppressInvalidate]);

	};

	function _observeChanges(oChanges) {

		if (oChanges.name === "ariaAttributes") {
			// set aria-attributes directly as done so in Select
			const oDomRef = this.getFocusDomRef();
			if (oDomRef) {
				const fUpdate = (oChanges, oDomRef, sName) => {
					if (oChanges.current.aria?.[sName] !== oChanges.old.aria?.[sName]) {
						if (!oChanges.current.aria?.[sName]) {
							oDomRef.removeAttribute("aria-" + sName);
						} else {
							oDomRef.setAttribute("aria-" + sName, oChanges.current.aria[sName]);
						}
					}
				};
				fUpdate(oChanges, oDomRef, "activedescendant");
				fUpdate(oChanges, oDomRef, "expanded");
				fUpdate(oChanges, oDomRef, "controls");
			}
		}

	}

	FieldSelect.prototype.createPicker = function() {

		return null; // use ValueHelp, no own popover and list

	};

	function _formatConditions(aConditions) {

		const oField = this.getParent();

		if (!oField?.isA("sap.ui.mdc.field.FieldBase")) { // called from generic tests
			return "";
		}

		const oFormatOptions = merge({}, oField.getFormatOptions());
		oFormatOptions.display = oField.getDisplay();
		oFormatOptions.valueHelpID = oField._getValueHelp() || oField?._sDefaultValueHelp;

		if (this._oConditionsType) {
			this._oConditionsType.setFormatOptions(oFormatOptions); // as FormatOptions might be updated in Field
		} else {
			this._oConditionsType = new ConditionsType(oFormatOptions);
		}

		return this._oConditionsType.formatValue(aConditions, "string");

	}

	function _formatNavigateCondition(bSelectedKeyFallback) {

		const oField = this.getParent();
		let sValue;
		if (oField?._oNavigateCondition) { // format NavigationCondition
			sValue = _formatConditions.call(this, [oField._oNavigateCondition]);
		} else if (oField?._oNavigateCondition === null) { // empty-value navigated
			sValue = _formatConditions.call(this, []);
		} else if (bSelectedKeyFallback) {
			const aConditions = this.getBinding("selectedKey")?.getRawValue();
			sValue = _formatConditions.call(this, aConditions);
		}

		return sValue;

	}

	function _formatNavigateConditionToKey() {

		const oField = this.getParent();
		let sKey;

		if (oField?._oNavigateCondition) {
			sKey = oField.getContentFactory().getConditionsType().formatValue([oField._oNavigateCondition]);
		} else if (oField?._oNavigateCondition === null) {
			sKey = "";
		}

		return sKey;

	}

	FieldSelect.prototype._getSelectedItemText = function(vItem) {

		// TODO: can it happen that no item is selected in Field case?
		if (this._sValue !== undefined) { // formatted text already determined
			return this._sValue;
		} else {
			return _formatNavigateCondition.call(this, true);
		}

	};

	FieldSelect.prototype.setValue = function(sValue) {

		Promise.all([sValue]).then((aResult) => { // as ConditionType.formatValue might return a Promise
			const [sValue] = aResult;
			this._sValue = sValue; // to also forward to _setHiddenSelectValue
			Select.prototype.setValue.call(this, sValue);
			delete this._sValue;
		});

	};

	// here it just sets the string-formatted key from navigation, typeahead or valuehelp-selection
	FieldSelect.prototype.setDOMValue = function(sValue) {

		const sNavigateValue = _formatNavigateCondition.call(this, false);
		sValue = sNavigateValue === undefined ? sValue : sNavigateValue;

		this.setValue(sValue);

	};

	FieldSelect.prototype.getDOMValue = function(sValue) {

		const oDomRef = this.getDomRef();
		const oTextPlaceholder = oDomRef?.querySelector(".sapMSelectListItemText");

		if (oTextPlaceholder) {
			return oTextPlaceholder.textContent; // TODO: parse to key?
		}

		return "";

	};

	FieldSelect.prototype._setHiddenSelectValue = function () {

		const oSelect = this._getHiddenSelect();
		const oInput = this._getHiddenInput();
		let sSelectedKey = _formatNavigateConditionToKey.call(this);
		const sSelectedItemText = this._sValue || this._getSelectedItemText();

		if (sSelectedKey === undefined) {
			sSelectedKey = this.getSelectedKey();
		}

		// the hidden INPUT is only used when the select is submitted
		// with a form so update its value in all cases
		oInput.attr("value", sSelectedKey || "");

		if (!this._isIconOnly()) {
			Promise.all([sSelectedItemText]).then((aResult) => {
				const [sSelectedItemText] = aResult;
				oSelect.text(sSelectedItemText);
			});
		}

	};

	FieldSelect.prototype.onBeforeRendering = function() {

		Select.prototype.onBeforeRendering.apply(this, arguments);

		// as text might be set via Navigation - just remember it
		const sKey = this.getSelectedKey();
		if (this._sSelectedKeyOnFocus === sKey && this.getDomRef()) {
			this._sValue = this.getDOMValue();
		}

	};

	FieldSelect.prototype.onAfterRendering = function() {

		Select.prototype.onAfterRendering.apply(this, arguments);

		// as text might be formatted async, set after rendering
		const sText = this._getSelectedItemText();
		this.setValue(sText);
		delete this._sValue;

	};

	// open/close handled by Field
	FieldSelect.prototype.toggleOpenState = function() {
		return this;
	};

	FieldSelect.prototype.ontap = function(oEvent) {

		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}

		const oValueHelp = _getValueHelp.call(this);
		if (this.isOpenArea(oEvent.target) && oValueHelp?.isOpen()) { // as dropdown should also close on click in field, opening is handled on Field
			this.fireValueHelpRequest();
		}

	};

	// disable Select-specific arrow-handling
	FieldSelect.prototype.onsapdown = function(oEvent) {
	};

	FieldSelect.prototype.onsapup = function(oEvent) {
	};

	FieldSelect.prototype.onsappagedown = function(oEvent) {
	};

	FieldSelect.prototype.onsappageup = function(oEvent) {
	};

	FieldSelect.prototype.onsaphome = function(oEvent) {
	};

	FieldSelect.prototype.onsapend = function(oEvent) {
	};

	FieldSelect.prototype.onsapshow = function(oEvent) {

		// prevents actions from occurring when the control is non-editable
		if (!this.getEditable()) {
			return;
		}

		Select.prototype.onsapshow.apply(this, arguments);

		this.fireValueHelpRequest({fromKeyboard: true}); // fromKeyboard set to force visual focus in dropdown

	};

	FieldSelect.prototype.onsapenter = function(oEvent) {

		_updateSelectedKey.call(this);

		Select.prototype.onsapenter.apply(this, arguments);

	};

	function _updateSelectedKey() {

		const sKey = _formatNavigateConditionToKey.call(this);

		if (sKey !== undefined) {
			this.setSelectedKey(sKey);
		}

	}

	FieldSelect.prototype.onfocusin = function(oEvent) {

		this._sSelectedKeyOnFocus = this.getSelectedKey();
		Select.prototype.onfocusin.apply(this, arguments);

	};

	FieldSelect.prototype.onfocusout = function(oEvent) {

		if (this.getId() !== oEvent.relatedControlId) {
			_updateSelectedKey.call(this);
		}

		Select.prototype.onfocusout.apply(this, arguments);

	};

	FieldSelect.prototype._isKeyAvailable = function (sKey) {

		return false;

	};

	FieldSelect.prototype._checkSelectionChange = function() {

		const sKey = this.getSelectedKey();

		if (this._sSelectedKeyOnFocus !== sKey) {
			this.fireChange({ selectedItem: null, previousSelectedItem: null, selectedKey: sKey });
			this._sSelectedKeyOnFocus = sKey;
		}

	};

	FieldSelect.prototype._revertSelection = function() {

		const sKey = _formatNavigateConditionToKey.call(this); // format NavigationCondition to key to compare with initial one

		if (sKey !== undefined) {
			if (this._sSelectedKeyOnFocus !== sKey) {
				this.fireLiveChange({escPressed: true, value: this._sSelectedKeyOnFocus}); // let the Field close and reset ValueHelp and remove NavigationCondition
				// this.setSelectedKey(this._sSelectedKeyOnFocus);
				this.setValue(this._getSelectedItemText());
			}
		}

	};

	FieldSelect.prototype.searchNextItemByText = function(sText) {

		// validation if sText is relevant string
		if (!(typeof sText === "string" && sText !== "")) {
			return null; // return null if sText is invalid
		}

		this.fireLiveChange({value: sText}); // let the Field do the typeahead

		return null;

	};

	FieldSelect.prototype._addFocusClass = function () {

		const oValueHelp = _getValueHelp.call(this);

		if (!oValueHelp?.isOpen()) { // on open ValueHelp visual focus should be in dropdown
			this.addStyleClass("sapMSltFocused"); // use addStyleClass to have same logoc like Input controls
		}

	};

	FieldSelect.prototype._removeFocusClass = function () {

		this.removeStyleClass("sapMSltFocused"); // use removeStyleClass to have same logoc like Input controls

	};

	function _getValueHelp() {

		const oField = this.getParent();
		let sId = oField?._getValueHelp();
		let oValueHelp;

		if (!sId && oField?._sDefaultValueHelp) {
			sId = oField._sDefaultValueHelp;
		}

		if (sId) {
			oValueHelp = Element.getElementById(sId);
		}

		return oValueHelp;

	}

	return FieldSelect;

});