/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/SelectionController", "sap/ui/mdc/util/getKey"
], (SelectionController, getKey) => {
	"use strict";

	/**
	 * MDC-specific override of the sap.m.p13n.SelectionController.
	 *
	 * Two-layer identifier architecture:
	 * The p13n stack uses different identifiers at different layers.
	 * - p13n layer (sap.m.p13n.Item): items are identified by "name". This is permanent and
	 *   never deprecated — BasePanel uses it as the list-binding key.
	 * - State (sap.ui.mdc.State.Items): items are identified by "key".
	 *   The former "name" property was deprecated in 1.124.0 and is removed in UI5 2.0.
	 *
	 * Boundary adapters — the only two correct translation points between the layers:
	 * - Downward (Engine to Panel): prepareAdaptationData copies key to name so the panel
	 *   can identify items.
	 * - Upward (Panel to Engine): _getP13nDataAsStateItems reads oItem.name from panel items
	 *   and emits state items with only "key".
	 *
	 * sap.ui.comp compatibility:
	 * sap.ui.comp's LinkPanelController reads oContent.name from flex change content.
	 * The permanent (non-deprecated) shim in _getChangeContent and _createMoveChange ensures
	 * "name" is always present alongside "key" in change content. This shim must remain until
	 * sap.ui.comp is migrated to read oContent.key instead.
	 *
	 */
	const MDCSelectionController = SelectionController.extend("sap.ui.mdc.p13n.subcontroller.SelectionController");

	MDCSelectionController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent) {
		const oAddRemoveChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sOperation,
				content: oContent
			}
		};
		return oAddRemoveChange;
	};

	MDCSelectionController.prototype.getCurrentState = function(bExternalize) {
		let vState = this.getAdaptationControl().getCurrentState()[this.getStateKey()];

		/**
		 * @deprecated As of version 1.124.0
		 */
		if (vState instanceof Array && !bExternalize) {
			vState = vState.map((o) => {
				if (!o.hasOwnProperty("key") && o.hasOwnProperty("name")) {
					o.key = o.name;
				}
				return o;
			});
		}
		return vState;
	};

	/**
	 * Ensures both <code>changedState</code> and <code>existingState</code> carry a
	 * <code>key</code> property before the base delta calculation runs.
	 *
	 * <code>sap.m.p13n</code> panels identify items by <code>name</code>; the MDC
	 * state uses <code>key</code>. This override is the explicit
	 * boundary adapter between the two worlds: it maps <code>name&nbsp;→&nbsp;key</code>
	 * on any item that has <code>name</code> but no <code>key</code>, so the base
	 * <code>getDelta</code> always operates on a uniform <code>key</code>-based
	 * representation.
	 *
	 * @override
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MDCSelectionController.prototype.getDelta = function(mDeltaConfig) {
		const fnEnsureKey = (oStateItem) => {
			if (oStateItem.hasOwnProperty("name") && !oStateItem.hasOwnProperty("key")) {
				return Object.assign({}, oStateItem, { key: oStateItem.name });
			}
			/**
			 * @deprecated As of version 1.124.0
			 */
			if (oStateItem.hasOwnProperty("key") && !oStateItem.hasOwnProperty("name")) {
				return Object.assign({}, oStateItem, { name: oStateItem.key });
			}
			return oStateItem;
		};

		if (mDeltaConfig.changedState instanceof Array) {
			mDeltaConfig.changedState = mDeltaConfig.changedState.map(fnEnsureKey);
		}

		if (mDeltaConfig.existingState instanceof Array) {
			mDeltaConfig.existingState = mDeltaConfig.existingState.map(fnEnsureKey);
		}

		/**
		 * @deprecated As of version 1.124.0
		 * The backward-compat name write is now handled explicitly in
		 * _getChangeContent, decoupled from the delta attribute calculation.
		 */
		mDeltaConfig.deltaAttributes.push("name");

		const aChanges = SelectionController.prototype.getDelta.apply(this, arguments);

		return aChanges;
	};

	MDCSelectionController.prototype._createMoveChange = function(sPropertykey, iNewIndex, sMoveOperation, oControl) {
		const oMoveChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sMoveOperation,
				content: {
					key: sPropertykey,
					// Permanent shim: flex change content always carries `name` for sap.ui.comp.
					// See class JSDoc for the removal condition.
					name: sPropertykey,
					index: iNewIndex
				}
			}
		};
		return oMoveChange;
	};

	/**
	 * Extends the base implementation to bridge panel items that carry only a
	 * <code>name</code> property (the <code>sap.m.p13n</code> item identifier)
	 * into change content that also contains <code>key</code> (the MDC state
	 * item identifier), so that flex changes and state restoration work correctly.
	 *
	 * @override
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MDCSelectionController.prototype._getChangeContent = function(oProperty, aDeltaAttributes) {
		const oChangeContent = SelectionController.prototype._getChangeContent(oProperty, aDeltaAttributes);
		if (oChangeContent.name && !oChangeContent.key) {
			oChangeContent.key = oChangeContent.name;
		}

		// Permanent shim: flex change content always carries `name` for sap.ui.comp consumers.
		// Decoupled from deltaAttributes so that deltaAttributes.push("name") can be deprecated.
		if (oChangeContent.key && !oChangeContent.name) {
			oChangeContent.name = oChangeContent.key;
		}
		return oChangeContent;
	};

	/**
	 * Overrides the base implementation to ensure panel items carry both
	 * <code>name</code> and <code>key</code> with the same value.
	 *
	 * The base <code>prepareAdaptationData</code> already sets both fields, but
	 * may derive them from <code>oProperty.name</code> for backward compatibility.
	 * This override additionally guarantees that <code>name</code> is populated
	 * from <code>key</code> when it is absent, so the <code>sap.m.p13n</code>
	 * panel layer can identify items by <code>name</code> while
	 * <code>_getKeyFromContext</code> can retrieve the identifier via <code>key</code>.
	 *
	 * @override
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.148
	 */
	MDCSelectionController.prototype.prepareAdaptationData = function(...args) {
		const oAdaptationData = SelectionController.prototype.prepareAdaptationData.apply(this, args);
		oAdaptationData.items.forEach((oItem) => {
			if (!oItem.name && oItem.key) {
				oItem.name = oItem.key;
			}
		});
		return oAdaptationData;
	};

	/**
	 * Reads panel data and extracts items whose presence attribute is truthy,
	 * returning them as state items with only the <code>key</code> property.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @param {string} sPresenceAttribute The attribute signaling the item is "active"
	 *   in this controller's domain (e.g. "sorted", "grouped", "visible")
	 * @returns {sap.ui.mdc.State.Item[]} Array of state items each with a single <code>key</code> property
	 * @since 1.148
	 */
	MDCSelectionController.prototype._getP13nDataAsStateItems = function(sPresenceAttribute) {
		const aItems = [];
		this._oPanel.getP13nData(true).forEach((oItem) => {
			if (oItem[sPresenceAttribute]) {
				aItems.push({ key: oItem.name });
			}
		});
		return aItems;
	};

	/**
	 * Returns a map (keyed by state item key) of the current controller state items,
	 * each annotated with a <code>position</code> index reflecting their order.
	 *
	 * Convenience wrapper for use in <code>mixInfoAndState</code> implementations.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @returns {Object.<string, object>} Map of state items keyed by their <code>key</code> property
	 * @since 1.148
	 */
	MDCSelectionController.prototype._stateToMap = function() {
		return this.getCurrentState().reduce((mMap, oItem, iIndex) => {
			const sKey = getKey(oItem);
			mMap[sKey] = oItem;
			mMap[sKey].position = iIndex;
			return mMap;
		}, {});
	};

	/**
	 * Inserts placeholder entries for inactive property keys at their canonical
	 * <code>propertyKeys</code> positions so that absolute application of the
	 * dialog state does not drop inactive keys on confirm.
	 *
	 * No-op unless the adaptation control is in propertyKeys mode and
	 * <code>aData</code> is an array, so callers may invoke this unconditionally.
	 *
	 * @param {object[]} aData Panel data array to augment. Not mutated, a shallow copy is returned when modified.
	 * @returns {object[]} Augmented copy, or the original reference when no injection is needed
	 */
	MDCSelectionController.prototype.injectInactivePropertyKeys = function(aData) {
		const oControl = this.getAdaptationControl();
		if (!oControl.isInPropertyKeysMode?.() || !Array.isArray(aData)) {
			return aData;
		}

		aData = aData.slice();
		const oPropertyHelper = oControl.getPropertyHelper();
		const oPresent = new Set(aData.map(getKey));
		let iSlot = 0;

		oControl.getPropertyKeys().forEach((sKey) => {
			if (oPresent.has(sKey)) {
				iSlot++;
			} else if (oPropertyHelper.getProperty(sKey, true)?.isActive === false) {
				aData.splice(iSlot, 0, {key: sKey, name: sKey});
				oPresent.add(sKey);
				iSlot++;
			}
		});

		return aData;
	};

	return MDCSelectionController;

});
