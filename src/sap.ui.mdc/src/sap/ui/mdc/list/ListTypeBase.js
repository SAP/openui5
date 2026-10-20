/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/ListTableTypeBase",
	"sap/ui/mdc/enums/ListSelectionMode"
], (ListTableTypeBase, ListSelectionMode) => {
	"use strict";

	// Maps the MDC list selection mode to the corresponding sap.m.ListMode of the inner list.
	const mSelectionModeMap = {
		[ListSelectionMode.None]: "None",
		[ListSelectionMode.Single]: "SingleSelectLeft",
		[ListSelectionMode.SingleMaster]: "SingleSelectMaster",
		[ListSelectionMode.Multi]: "MultiSelect"
	};

	/**
	 * Constructor for a new <code>ListTypeBase</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The list type info base class for the metadata-driven list. Base class with no implementation.
	 * @extends sap.ui.mdc.ListTableTypeBase
	 * @author SAP SE
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 * @abstract
	 * @since 1.153
	 * @alias sap.ui.mdc.list.ListTypeBase
	 */
	const ListTypeBase = ListTableTypeBase.extend("sap.ui.mdc.list.ListTypeBase", {
		metadata: {
			library: "sap.ui.mdc",
			"abstract": true,
			properties: {}
		}
	});

	/**
	 * Returns the parent <code>sap.ui.mdc.List</code> control, or <code>null</code> if not part of one.
	 *
	 * @returns {sap.ui.mdc.List|null} The parent MDC List control, or <code>null</code>
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ListTypeBase.prototype.getList = function() {
		const oList = this.getParent();
		return oList && oList.isA("sap.ui.mdc.List") ? oList : null;
	};

	ListTypeBase.prototype.getInnerControl = function() {
		const oList = this.getList();
		return oList ? oList._oList : null;
	};

	/**
	 * Returns the base settings map common to all inner list control types.
	 *
	 * Subclasses should spread this into their own <code>getListSettings</code> override
	 * and add type-specific settings on top.
	 *
	 * @returns {object} Map of common settings for the inner list control
	 * @protected
	 */
	ListTypeBase.prototype.getListSettings = function() {
		const oList = this.getList();

		return {
			id: oList.getId() + "-innerList",
			mode: {
				path: "$sap.ui.mdc.List>/selectionMode",
				formatter: (sSelectionMode) => mSelectionModeMap[sSelectionMode] ?? "None"
			},
			headerToolbar: oList._createToolbar(),
			busyIndicatorDelay: "{$sap.ui.mdc.List>/busyIndicatorDelay}",
			growing: {
				path: "$sap.ui.mdc.List>/growingMode",
				formatter: (sMode) => sMode !== "None"
			},
			growingThreshold: {
				path: "$sap.ui.mdc.List>/threshold",
				// -1 (type-dependent default) is not a valid batch size; fall back to sap.m.ListBase's default of 20.
				formatter: (iThreshold) => (iThreshold >= 0 ? iThreshold : 20)
			},
			growingScrollToLoad: {
				path: "$sap.ui.mdc.List>/growingMode",
				formatter: (sMode) => sMode === "Scroll"
			},
			sticky: ["HeaderToolbar"],
			rememberSelections: false,
			selectionChange: [this._onSelectionChange, this],
			itemPress: [this._onItemPress, this],
			beforeOpenContextMenu: [this._onBeforeOpenContextMenu, this],
			contextMenu: oList.getContextMenu() || null
		};
	};

	/**
	 * Wraps the application-provided content template in the appropriate list item control for this type
	 * and returns the wrapper. The wrapper is what gets bound via <code>bindItems</code>.
	 *
	 * Subclasses must override this to create the concrete item wrapper
	 * (<code>sap.m.CustomListItem</code> or <code>sap.f.GridListItem</code>).
	 *
	 * @param {sap.ui.core.Control} oContentTemplate The application-provided content control
	 * @returns {sap.m.ListItemBase} The wrapper item control containing the content template
	 * @protected
	 * @abstract
	 */
	ListTypeBase.prototype.wrapItemTemplate = function(oContentTemplate) {
		throw new Error(this + " does not implement #wrapItemTemplate");
	};

	/**
	 * Applies visual item actions to the wrapper item.
	 *
	 * Subclasses override this to render actions in the type-appropriate way
	 * (for example, an <code>HBox</code> with buttons for GridList, or a detail button for List).
	 *
	 * @param {sap.m.ListItemBase} oWrapper The wrapper item created by <code>wrapItemTemplate</code>
	 * @param {sap.ui.mdc.list.ItemSettings} oItemSettings The item settings
	 * @param {string} [sModelName] The binding model name used to resolve the binding context
	 * @protected
	 */
	ListTypeBase.prototype.applyItemActions = function(oWrapper, oItemSettings, sModelName) {};

	/**
	 * Binds items to the inner list control using the given binding info.
	 *
	 * @param {object} oBindingInfo The binding info to apply to the inner list's <code>items</code> aggregation
	 * @protected
	 */
	ListTypeBase.prototype.bindItems = function(oBindingInfo) {
		const oInnerList = this.getInnerControl();

		if (!oInnerList) {
			return;
		}

		oInnerList.bindItems(oBindingInfo);
	};

	/**
	 * Handles the <code>selectionChange</code> event of the inner list and forwards it to the MDC List.
	 *
	 * @private
	 */
	ListTypeBase.prototype._onSelectionChange = function() {
		const oList = this.getList();

		if (!oList) {
			return;
		}

		oList.fireSelectionChange();
	};

	/**
	 * Handles the <code>itemPress</code> event of the inner list and forwards it to the MDC List.
	 *
	 * @param {sap.ui.base.Event} oEvent The item press event
	 * @private
	 */
	ListTypeBase.prototype._onItemPress = function(oEvent) {
		const oList = this.getList();
		const oInnerList = this.getInnerControl();

		if (!oList || !oInnerList) {
			return;
		}

		const oItem = oEvent.getParameter("listItem") || oEvent.getParameter("item");
		const sModelName = oInnerList.getBindingInfo("items")?.model;

		oList.fireItemPress({
			bindingContext: oItem?.getBindingContext(sModelName)
		});

		oList._fireDefaultItemAction(oItem?.getBindingContext(sModelName), oItem);
	};

	/**
	 * Handles the <code>beforeOpenContextMenu</code> event of the inner list and forwards it to the MDC List.
	 * If the MDC List's event is prevented, the inner list's event is also prevented.
	 *
	 * @param {sap.ui.base.Event} oEvent The before open context menu event
	 * @private
	 */
	ListTypeBase.prototype._onBeforeOpenContextMenu = function(oEvent) {
		const oList = this.getList();
		const oInnerList = this.getInnerControl();

		if (!oList || !oInnerList) {
			return;
		}

		const oItem = oEvent.getParameter("listItem");
		const sModelName = oInnerList.getBindingInfo("items")?.model;

		const bPreventDefault = !oList.fireBeforeOpenContextMenu({
			bindingContext: oItem?.getBindingContext(sModelName)
		});

		if (bPreventDefault) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Loads the required modules for this list type.
	 *
	 * Subclasses must implement this method to load their specific inner list control modules.
	 *
	 * @returns {Promise} A promise that resolves when all required modules are loaded
	 * @protected
	 * @abstract
	 */
	ListTypeBase.prototype.loadModules = function() {
		return Promise.reject(new Error(this + " does not implement #loadModules"));
	};

	/**
	 * Creates the inner list control instance.
	 *
	 * Subclasses must implement this method to create the appropriate inner list control
	 * (for example, <code>sap.f.GridList</code> or <code>sap.m.List</code>).
	 *
	 * @returns {sap.ui.core.Control} The created inner list control
	 * @protected
	 * @abstract
	 */
	ListTypeBase.prototype.createList = function() {
		throw new Error(this + " does not implement #createList");
	};

	/**
	 * Removes the toolbar from the inner list control before the inner control is destroyed
	 * on a type switch. Subclasses may override if the inner control requires explicit detachment.
	 *
	 * @protected
	 */
	ListTypeBase.prototype.removeToolbar = function() {
		const oInnerList = this.getInnerControl();
		if (oInnerList && oInnerList.setHeaderToolbar instanceof Function) {
			oInnerList.setHeaderToolbar(null);
		}
	};

	ListTypeBase.prototype.insertFilterInfoBar = function(oFilterInfoBar) {
		const oInnerList = this.getInnerControl();

		if (oInnerList) {
			const sFilterInfoBarAccTextId = oFilterInfoBar.getACCTextId();

			oInnerList.setInfoToolbar(oFilterInfoBar);

			if (!oInnerList.getAriaLabelledBy().includes(sFilterInfoBarAccTextId)) {
				oInnerList.addAriaLabelledBy(sFilterInfoBarAccTextId);
			}
		}
	};

	/**
	 * Scrolls the inner list to the item at the given index.
	 *
	 * @param {int} iIndex The index to scroll to
	 * @returns {Promise} A promise that resolves when scrolling is complete
	 * @protected
	 */
	ListTypeBase.prototype.scrollToIndex = function(iIndex) {
		return Promise.reject();
	};

	/**
	 * Updates item settings on the inner list items after a settings change without triggering a full rebind.
	 * Clears existing property bindings on the current item template wrapper before re-applying all
	 * settings from the current <code>ItemSettings</code> aggregation.
	 *
	 * Subclasses should call <code>super</code> and then invoke <code>updateItemActions</code> to refresh
	 * action rendering.
	 *
	 * @protected
	 */
	ListTypeBase.prototype.updateItemSettings = function() {
		const oInnerList = this.getInnerControl();
		const oList = this.getList();

		if (!oInnerList || !oList) {
			return;
		}

		const oBindingInfo = oInnerList.getBindingInfo("items");
		const oWrapper = oBindingInfo?.template;

		if (!oWrapper) {
			return;
		}

		// Unbind all item-settings-owned properties before re-applying, so stale bindings are removed.
		oWrapper.unbindProperty("type");
		oWrapper.unbindProperty("highlight");
		oWrapper.unbindProperty("highlightText");
		oWrapper.unbindProperty("navigated");

		const oItemSettings = oList.getItemSettings();

		if (!oItemSettings) {
			return;
		}

		const mSettings = oItemSettings.getAllSettings();
		const mSetterMap = {
			type: "setType",
			highlight: "setHighlight",
			highlightText: "setHighlightText",
			navigated: "setNavigated"
		};

		Object.keys(mSetterMap).forEach((sProperty) => {
			const vValue = mSettings[sProperty];
			const sSetter = mSetterMap[sProperty];

			if (!(oWrapper[sSetter] instanceof Function) || vValue === undefined) {
				return;
			}

			if (typeof vValue === "object" && vValue !== null) {
				oWrapper.bindProperty(sProperty, vValue);
			} else {
				oWrapper[sSetter](vValue);
			}
		});

		this.updateItemActions();
	};

	/**
	 * Re-applies item action rendering to the current item template wrapper after an actions change.
	 * Subclasses override this to refresh their type-specific action controls (detail button / HBox buttons).
	 *
	 * @protected
	 */
	ListTypeBase.prototype.updateItemActions = function() {};

	/**
	 * Called when personalization modifications have been applied to the MDC List.
	 * Subclasses may override to react to specific controller changes.
	 *
	 * @param {string[]} aAffectedControllers Array of affected personalization controller names
	 * @protected
	 */
	ListTypeBase.prototype.onModifications = function(aAffectedControllers) {};

	/**
	 * Called when a property of this type changes. Subclasses may override to forward the change
	 * to the inner list control.
	 *
	 * @param {string} sProperty The property name
	 * @param {any} vValue The new property value
	 * @protected
	 */
	ListTypeBase.prototype.updateListByProperty = function(sProperty, vValue) {};

	ListTypeBase.prototype.setProperty = function(sProperty, vValue, bSuppressInvalidate) {
		ListTableTypeBase.prototype.setProperty.apply(this, arguments);
		this.updateListByProperty(sProperty, vValue);
		return this;
	};

	/**
	 * Returns an array of CSS class names to be added to the root element of the MDC List.
	 *
	 * Subclasses may override this to add type-specific CSS classes.
	 *
	 * @returns {string[]} Array of CSS class names
	 * @protected
	 */
	ListTypeBase.prototype.getStyleClasses = function() {
		return [];
	};

	return ListTypeBase;
});
