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
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Container for the <code>ValueHelp</code> element.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.91.0
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
				_container: {
					type: "sap.ui.core.Element",
					multiple: false,
					visibility: "hidden"
				},
				content: {
					type: "sap.ui.mdc.valuehelp.base.Content",
					multiple: true
				}
			},
			events: {
				select: {
					parameters: {
						type: { type: "sap.ui.mdc.enum.SelectType" },
						conditions: { type: "object[]" }
					}
				},
				confirm: {
					parameters: {
						close: { type: "boolean" }
					}
				},
				opened: {},
				closed: {},
				cancel: {},
				requestDelegateContent: {
					parameters: {
						container: { type: "sap.ui.mdc.valuehelp.base.Container" }
					}
				},
				requestSwitchToDialog: {},
				navigated: {
					parameters: {
						bLeaveFocus: { type: "boolean" },
						condition: { type: "object" },
						value: { type: "string" },
						key: { type: "string" },
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
				oContent.unbindProperty("filterValue");
				oContent.unbindProperty("conditions");
				oContent.unbindProperty("config");
				oContent.detachConfirm(this._handleConfirmed, this);
				oContent.detachCancel(this._handleCanceled, this);
				oContent.detachSelect(this._handleSelect, this);
				oContent.detachRequestDelegateContent(this._handleRequestDelegateContent, this);

				if (oContent.detachNavigated) {
					oContent.detachNavigated(this._handleNavigated, this);
				}

				if (oContent.detachRequestSwitchToDialog) {
					oContent.detachRequestSwitchToDialog(this._handleRequestSwitchToDialog, this);
				}

			} else {
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
				oContent.attachRequestDelegateContent(this._handleRequestDelegateContent, this);

				if (oContent.attachNavigated) {
					oContent.attachNavigated(this._handleNavigated, this);
				}

				if (oContent.attachRequestSwitchToDialog) {
					oContent.attachRequestSwitchToDialog(this._handleRequestSwitchToDialog, this);
				}
			}
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
		if (oContainer) {
			return oContainer.getDomRef();
		}
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
	 * @returns {Promise} This promise resolves after the container completely closed.
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

	};

	Container.prototype._close = function () {
	};

	Container.prototype._handleOpened = function () {
		this._resolvePromise("open");
		this.fireOpened();
	};

	Container.prototype._handleClosed = function (oEvent) {
		this._removePromise("open");
		this.fireClosed();
	};

	Container.prototype._handleConfirmed = function (oEvent) {
		this.fireConfirm();
	};

	Container.prototype._handleCanceled = function (oEvent) {
		this.fireCancel();
	};

	Container.prototype._handleRequestDelegateContent = function (oEvent) {
		this.fireRequestDelegateContent({container: this});
	};

	Container.prototype._handleSelect = function (oEvent) {
		this.fireSelect({type: oEvent.getParameter("type"), conditions: oEvent.getParameter("conditions")});
	};

	Container.prototype.isOpen = function () {
		var oPromise = this._retrievePromise("open");
		return oPromise && oPromise.isSettled();
	};

	Container.prototype.isOpening = function () {
		var oPromise = this._retrievePromise("open");
		return oPromise && !oPromise.isCanceled() && !oPromise.isSettled();
	};

	Container.prototype.getItemForValue = function(oConfig) { // TODO only for TypeAhead container
	};

	Container.prototype.isValidationSupported = function(oConfig) { // TODO only for TypeAhead container
	};


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

	Container.prototype.isTypeahead = function () {
		var oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.getTypeahead() === this;
	};

	Container.prototype.getValueHelpDelegate = function () {
		var oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.getControlDelegate();
	};

	Container.prototype.getValueHelpDelegatePayload = function () {
		var oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.getPayload();
	};

	Container.prototype.awaitValueHelpDelegate = function () {
		var oValueHelp = this.getParent();
		return oValueHelp && oValueHelp.awaitControlDelegate();
	};

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
	 * @param {int} iMaxConditions maximal conditions allowed (as FieldHelp might not be connected to a field)
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

	Container.prototype.exit = function() {
		this._oObserver.disconnect();
		this._oObserver = undefined;
	};

	PromiseMixin.call(Container.prototype);

	return Container;

});
