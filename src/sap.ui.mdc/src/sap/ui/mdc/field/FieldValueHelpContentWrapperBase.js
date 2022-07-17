/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
	], function(
		Element
	) {
	"use strict";

	/**
	 * Constructor for a new <code>FieldValueHelpContentWrapperBase</code>.
	 *
	 * The <code>FieldValueHelp</code> element supports different types of content. To map the content control
	 * API to the <code>FieldValueHelp</code> element, a wrapper is needed. This base class just defines the API.
	 *
	 * <b>Note:</b> All events and functions must only be used by the corresponding field help.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Base type for <code>FieldValueHelp</code> content control wrapper.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 * @since 1.60.0
	 * @alias sap.ui.mdc.field.FieldValueHelpContentWrapperBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldValueHelpContentWrapperBase = Element.extend("sap.ui.mdc.field.FieldValueHelpContentWrapperBase", /** @lends sap.ui.mdc.field.FieldValueHelpContentWrapperBase.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The selected items.
				 *
				 * An item is an object with the properties <code>key</code>, <code>description</code>, <code>inParameters</code> and <code>outParameters</code>.
				 *
				 * <b>Note:</b> This property must only be set by the <code>FieldValueHelp</code> element, not by the application.
				 */
				selectedItems: {
					type: "object[]",
					defaultValue: []
				}
			},
			defaultProperty: "selectedItems",
			events: {
				/**
				 * This event is fired when content is navigated.
				 */
				navigate: {
					parameters: {

						/**
						 * The navigated <code>key</code>
						 */
						key: { type: "any" },

						/**
						 * The navigated <code>description</code>
						 */
						description: { type: "string" },

						/**
						 * <code>true</code> if there is navigation away from content (for example, from a table)
						 *
						 * In this case the field should get the focus.
						 * @since: 1.79.0
						 */
						leave: { type: "boolean" },

						/**
						 * Disable initial popover focus
						 */
						disableFocus: { type: "boolean" },

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
				 * This event is fired after a selection has been changed.
				 */
				selectionChange: {
					parameters: {
						/**
						 * Array of selected items
						 *
						 * Each item is represented as an object with the properties <code>key</code>, <code>description</code>, <code>inParameters</code> and <code>outParameters</code>.
						 */
						selectedItems: {type: "object[]"},

						/**
						 * Indicator of item is chosen via press or enter or via a selection
						 *
						 * Depending of the field help logic the field help needs to be closed on click, but not on
						 * multi-selection. (If a Table is used, clicking an item in the suggestion closes it bit activation the check box not.)
						 *
						 * since: 1.76.0
						 */
						itemPress: {type: "boolean"}
					}
				},
				/**
				 * This event is fired when the data of the field help is changed.
				 *
				 * This is needed for the <code>FieldValueHelp</code> element to update the popup or dialog.
				 * This might be needed to trigger an update for formatting a key with its description in the connected field.
				 */
				dataUpdate: {
					parameters: {
						/**
						 * If set, the content control has changed. If not set, only the data has changed
						 */
						contentChange: {type: "boolean"}
					}
				}
			}
		}
	});

	// define empty to add it to inherited wrappers, maybe later it might be filled and other wrappers must not changed.
	FieldValueHelpContentWrapperBase.prototype.init = function() {

	};

	// define empty to add it to inherited wrappers, maybe later it might be filled and other wrappers must not changed.
	FieldValueHelpContentWrapperBase.prototype.exit = function() {
		this.dispose();
	};

	/**
	 * Initializes the wrapper. This is called if the <code>FieldValueHelp</code> element is opened. Here modules
	 * should be loaded that are only needed if the help is open.
	 *
	 * @param {boolean} bSuggestion Flag if field help is opened as suggestion or dialog
	 * @returns {this|Promise} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.initialize = function(bSuggestion) {
		return this;
	};

	/**
	 * Disposes the wrapper. This method should clean up entities created during initialize
	 *
	 * @param {boolean} bSuggestion Flag if field help is opened as suggestion or dialog
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.dispose = function(bSuggestion) {
	};

	FieldValueHelpContentWrapperBase.prototype.setSelectedItems = function(aSelectedItems) {

		// changing selected items should update the content (e.g. table) of the Wrapper.
		// It should not invalidate the wrapper itself if not needed.
		this.setProperty("selectedItems", aSelectedItems, true);

		return this;

	};

	/**
	 * Returns the content shown in the value help dialog.
	 *
	 * @returns {sap.ui.core.Control} Content to be shown in the value help
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.getDialogContent = function() {

		return undefined;

	};

	/**
	 * Returns the content shown in the value help suggestion popup.
	 *
	 * @returns {sap.ui.core.Control} Content to be shown in the value help
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.getSuggestionContent = function() {

		return undefined;

	};

	/**
	 * This function is called if the field help is opened. Here the wrapper can focus on the selected
	 * item or do similar things.
	 *
	 * @param {boolean} bSuggestion Flag if field help is opened as suggestion or dialog
	 * @returns {sap.ui.mdc.field.FieldValueHelpContentWrapperBase} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.fieldHelpOpen = function(bSuggestion) {

		this._bSuggestion = bSuggestion;
		return this;

	};

	/**
	 * This function is called if the field help is closed.
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.fieldHelpClose = function() {

		delete this._bSuggestion;
		return this;

	};

	/**
	 * The focus visualization of the table needs to be removed as the user starts typing into the field.
	 *
	 * @since 1.91.0
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.removeFocus = function() {

		return this;

	};

	/**
	 * Returns <code>true</code> if filtering of the content is supported.
	 *
	 * @returns {boolean} true if filtering on the content is supported
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.getFilterEnabled = function() {

		return true;

	};

	/**
	 * Triggers navigation of the content.
	 *
	 * @param {int} iStep Number of steps for navigation (for example, 1 means next item, -1 means previous item)
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.navigate = function(iStep) {

	};

	/**
	 * Determines the description for n given key.
	 *
	 * As the key might change (uppercase), an object with key and description can be returned.
	 *
	 * @param {any} vKey Key
	 * @param {sap.ui.model.Filter} oInParameters In parameters for the key (as a key must not be unique.)
	 * @param {sap.ui.model.Filter} oOutParameters Out parameters for the key (as a key must not be unique.)
	 * @param {boolean} bNoRequest If <code>true</code>, the check must be only done on existing content (table items). Otherwise a backend request could be triggered if needed
	 * @param {boolean} bCaseSensitive If <code>true</code>, the filtering is case-sensitive
	 * @returns {string|sap.ui.mdc.field.FieldHelpItem|Promise} Description for key or object containing description, key, in and out parameters. If it is not available right away (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.FormatException} if entry is not found or not unique
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.getTextForKey = function(vKey, oInParameters, oOutParameters, bNoRequest, bCaseSensitive) {

		return "";

	};

	/**
	 * Determines the key for an given description.
	 *
	 * As the description might change (uppercase), an object with key and description can be returned.
	 *
	 * @param {string} sText Description
	 * @param {sap.ui.model.Filter} oInParameters In parameters for the key (as a key must not be unique.)
	 * @param {boolean} bNoRequest If <code>true</code>, the check must be only done on existing content (table items). Otherwise a backend request could be triggered if needed
	 * @param {boolean} bCaseSensitive If <code>true</code>, the filtering is case-sensitive
	 * @returns {any|sap.ui.mdc.field.FieldHelpItem|Promise} Key for description or object containing description, key, in and out parameters. If it is not available right away (must be requested), a <code>Promise</code> is returned.
	 * @throws {sap.ui.model.ParseException} if entry is not found or not unique
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.getKeyForText = function(sText, oInParameters, bNoRequest, bCaseSensitive) {

		return undefined;

	};

	/**
	 * Determines the key for a given description.
	 *
	 * As the description might change (uppercase), an object with key and description can be returned.
	 *
	 * @param {any} vKey Parsed value used for key determination
	 * @param {string} sText Description
	 * @param {object} oInParameters In parameters for the key (as a key does not have to be unique.)
	 * @param {object} oOutParameters Out parameters for the key (as a key does not have to be unique.)
	 * @param {boolean} bCaseSensitive If <code>true</code>, the filtering is case-sensitive
	 * @returns {sap.ui.mdc.field.FieldHelpItem|Promise<sap.ui.mdc.field.FieldHelpItem>} Object containing description, key, in and out parameters. If it is not available right away (must be requested), a <code>Promise</code> is returned.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 * @since 1.88.0
	 */
	FieldValueHelpContentWrapperBase.prototype.getKeyAndText = function(vKey, sText, oInParameters, oOutParameters, bCaseSensitive) {

		return undefined;

	};

	/**
	 * Returns the <code>ListBinding</code> used for the field help.
	 *
	 * @returns {sap.ui.model.ListBinding} ListBinding
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	FieldValueHelpContentWrapperBase.prototype.getListBinding = function() {

		return undefined;

	};

	/**
	 * Checks if the field help supports asynchronous loading for <code>getKeyForText</code>
	 * and <code>getTextForKey</code>.
	 *
	 * If skey or description can be loaded asynchronously, it doesn't depend on the content of the
	 * table or filtering. So in this case no <code>dataUpdate</code> event for the field is needed.
	 *
	 * @returns {boolean} Indicator if asynchronous loading is supported
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 * @since 1.67.0
	 */
	FieldValueHelpContentWrapperBase.prototype.getAsyncKeyText = function() {

		return false;

	};

	/**
	 * Applies the entered filters and search string to the content control (table).
	 *
	 * As the way how filters and search are applied depends on the <code>ListBinding</code> and the used
	 * content control, this needs to be done in the wrapper.
	 *
	 * If the <code>ListBinding</code> in the wrapper is suspended, it must be resumed in this function after setting the filters.
	 * It will not be resumed in the <code>FieldValueHelp</code> element. There <code>applyFilters</code> is only called if the filters should really be set.
	 *
	 * @param {sap.ui.model.Filter[]} aFilters Filter objects
	 * @param {string} sSearch Search string (for $search request)
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 * @since 1.73.0
	 */
	FieldValueHelpContentWrapperBase.prototype.applyFilters = function(aFilters, sSearch) {

	};

	/**
	 * Checks if the <code>ListBinding</code> of the wrapper has been suspended.
	 *
	 * @returns {boolean} true if the <code>ListBinding</code> of the wrapper has been suspended
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 * @since 1.73.0
	 */
	FieldValueHelpContentWrapperBase.prototype.isSuspended = function() {

		return false;

	};

	/**
	 * Checks if a ShoWAllItems-Footer should be created in the suggestion popover which will be shown if further selectable items are available.
	 *
	 * @returns {boolean} true if the ShoWAllItems Feature should be enabled
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 * @since 1.92.0
	 */
	 FieldValueHelpContentWrapperBase.prototype.enableShowAllItems = function() {

		return false;

	};

	/**
	 * Checks if the shown content currently displays all relevant values
	 *
	 * @returns {boolean} true if all relevant values are shown
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
 	 * @since 1.92.0
	 */
	FieldValueHelpContentWrapperBase.prototype.getAllItemsShown = function() {

		return false;

	};

	/* get Information from FieldHelp. Do not use properties here as it would be difficult to keep them
	* in sync. Also some information depend on the connected field and the state of the field help.
	*/

	FieldValueHelpContentWrapperBase.prototype._getFieldHelp = function() {

		var oFieldHelp = this.getParent();

		if (!oFieldHelp || !oFieldHelp.isA("sap.ui.mdc.field.FieldValueHelp")) {
			throw new Error(this.getId() + " must be assigned to a sap.ui.mdc.field.FieldValueHelp");
		}

		return oFieldHelp;

	};

	FieldValueHelpContentWrapperBase.prototype._getKeyPath = function() {

		var oFieldHelp = this._getFieldHelp();
		return oFieldHelp._getKeyPath();

	};

	FieldValueHelpContentWrapperBase.prototype._getDescriptionPath = function() {

		var oFieldHelp = this._getFieldHelp();
		return oFieldHelp.getDescriptionPath();

	};

	FieldValueHelpContentWrapperBase.prototype._getInParameters = function() {

		var oFieldHelp = this._getFieldHelp();
		var aHelpInParameters = [];

		if (oFieldHelp) {
			aHelpInParameters = _getParameters(oFieldHelp.getInParameters());
		}

		return aHelpInParameters;

	};

	FieldValueHelpContentWrapperBase.prototype._getOutParameters = function() {

		var oFieldHelp = this._getFieldHelp();
		var aHelpOutParameters = [];

		if (oFieldHelp) {
			aHelpOutParameters = _getParameters(oFieldHelp.getOutParameters());
		}

		return aHelpOutParameters;

	};

	function _getParameters(aParameters) {

		var aHelpParameters = [];

		for (var i = 0; i < aParameters.length; i++) {
			var oParameter = aParameters[i];
			var sHelpPath = oParameter.getHelpPath();
			if (sHelpPath) {
				aHelpParameters.push(sHelpPath);
			}
		}

		return aHelpParameters;

	}

	FieldValueHelpContentWrapperBase.prototype._getMaxConditions = function() {

		var oFieldHelp = this._getFieldHelp();
		return oFieldHelp.getMaxConditions();

	};

	FieldValueHelpContentWrapperBase.prototype._getDelegate = function() {

		var oFieldHelp = this._getFieldHelp();
		return {delegate: oFieldHelp.getControlDelegate(), payload: oFieldHelp.getPayload()};
		// TODO: handle delegate not loaded right now. But should not happen as FieldHelp is not opened without

	};

	FieldValueHelpContentWrapperBase.prototype.getScrollDelegate = function() {

		var oFieldHelp = this._getFieldHelp();
		return oFieldHelp.getScrollDelegate && oFieldHelp.getScrollDelegate();

	};

	return FieldValueHelpContentWrapperBase;

});
