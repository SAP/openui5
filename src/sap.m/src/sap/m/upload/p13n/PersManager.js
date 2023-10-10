/*!
 * ${copyright}
 */

sap.ui.define(
	[
		"sap/ui/base/Object",
		"sap/base/Log",
		"sap/m/upload/p13n/modules/PersPopupManager",
		"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
		"sap/m/upload/p13n/mediator/SortMediator",
		"sap/m/upload/p13n/mediator/GroupMediator",
		"sap/ui/fl/apply/api/ControlVariantApplyAPI",
		"sap/ui/fl/Utils"
	],
	function (
		BaseObject,
		Log,
		PersPopupManager,
		ControlPersonalizationWriteAPI,
		SortMediator,
		GroupMediator,
		ControlVariantApplyAPI,
		Utils
	) {
		"use strict";
		// Storage for mediators
		const _mRegistry = new WeakMap();

		//Singleton storage
		let oPersManager;
		let pRuntimeAPI;

		const _requireFlexRuntimeAPI = function () {
			if (!pRuntimeAPI) {
				pRuntimeAPI = new Promise(function (resolve, reject) {
					sap.ui.require(
						["sap/ui/fl/apply/api/FlexRuntimeInfoAPI"],
						function (FlexRuntimeInfoAPI) {
							resolve(FlexRuntimeInfoAPI);
						},
						reject
					);
				});
			}
			return pRuntimeAPI;
		};

		/**
		 * @class
		 * The <code>PersonalizationManager</code> entity provides robust personalization capabilities for controlling instances, including:
		 *
		 * <ul>
		 *   <li>Initialization of <code>sap.m.p13n.Popup</code> for user interaction</li>
		 *   <li>Storage of personalization states, with the flexibility to choose the preferred persistence layer</li>
		 *   <li>Application of states, taking into consideration the chosen persistence layer</li>
		 * </ul>
		 *
		 * PersonalizationManager is essential when enabling personalization for uploadSetTable
		 * Various mediators implementations can be employed for the registration process, such as:
		 *
		 * <ul>
		 *   <li>{@link sap.m.upload.p13n.mediator.ColumnsMediator ColumnsMediator}: To manage a list of selectable,visible and ordering of entries</li>
		 *   <li>{@link sap.m.upload.p13n.mediator.SortMediator SortMediator}: To organize a list of sortable properties</li>
		 *   <li>{@link sap.m.upload.p13n.mediator.GroupMediator GroupMediator}: To define groupable properties</li>
		 * </ul>
		 *
		 * Additionally, it can be effectively used in conjunction with <code>sap.ui.fl.variants.VariantManagement</code> to persist a state within variants, utilizing <code>sap.ui.fl</code> capabilities.
		 *
		 * @alias sap.m.upload.p13n.PersManager
		 * @extends sap.ui.base.Object
		 * @author SAP SE
		 * @version ${version}
		 * @experimental
		 * @internal
		 * @private
		 *
		 */
		const PersManager = BaseObject.extend("sap.m.upload.p13n.PersManager", {
			constructor: function () {
				BaseObject.call(this);
				this.oPersPopupManager = PersPopupManager.getInstance();
			}
		});

		/**
		 * Registers upload set table inside perso manager registry
		 * @param {sap.m.upload.UploadSetwithTable} oControl upload set table that needs to be registered
		 * @param {object} oConfig metadata and mediators that will control the panel.
		 */
		PersManager.prototype.register = function (oControl, oConfig) {
			if (!oControl) {
				throw Error("Please provide control for which will be performed adaptation");
			}
			if (!oConfig?.mediators || oConfig.mediators.length === 0) {
				throw Error(
					"Please provide at least a configuration 'mediator' containing a map of key-value pairs (key + Mediator class) in order to register adaptation."
				);
			}
			const oRegisteredEntry = this._getRegisterEntry(oControl);
			if (oRegisteredEntry) {
				this.deregister(oRegisteredEntry);
			}
			const oEntry = this._registerControl(oControl);
			Object.entries(oConfig.mediators).forEach(([sKey, oValue]) => {
				oEntry.mediators[sKey] = oValue;
			});
			if (oControl.getEnableVariantManagement() && Utils.getAppComponentForControl(oControl)) {
				//In case when control is just initialized and initial changes are not available to it register the control
				ControlVariantApplyAPI.attachVariantApplied({
					selector: oControl,
					vmControlId: oControl._getVariantManagementControl().getId(),
					callAfterInitialVariant: true,
					callback: () => {
						PersManager.getInstance().applyStateChange(oControl);
						ControlVariantApplyAPI.detachVariantApplied({
							selector: oControl,
							vmControlId: oControl._getVariantManagementControl().getId()
						});
					}
				});
			}
		};
		/**
		 * Upload set table that needs to be deregistered
		 * @param {sap.m.upload.UploadSetwithTable} oControl upload set table that needs to be deregistered
		 *
		 */
		PersManager.prototype.deregister = function (oControl) {
			const oRegisteredEntry = this._getRegisterEntry(oControl);
			if (!oRegisteredEntry) {
				return;
			}
			Object.keys(oRegisteredEntry.mediators).forEach((sKey) => {
				const oMediator = oRegisteredEntry.mediators[sKey];
				oMediator.destroy();
				delete oRegisteredEntry.mediators[sKey];
			});

			_mRegistry.delete(oControl);
		};

		PersManager.prototype._registerControl = function (oControl) {
			const oEntry = {
				mediators: {},
				activeP13n: null
			};
			_mRegistry.set(oControl, oEntry);
			return oEntry;
		};

		PersManager.prototype._getRegisterEntry = function (oControl) {
			return _mRegistry.get(oControl);
		};

		PersManager.prototype.destroy = function () {
			oPersManager = null;
			_mRegistry.delete(this);
		};


		/**
		 * Returns the singleton instance of PersManager
	 	 * @internal
		 * @private
		 * @returns {object} returns object of PersManager
	 	 */

		PersManager.getInstance = function () {
			if (!oPersManager) {
				oPersManager = new PersManager();
			}
			return oPersManager;
		};

		PersManager.prototype.show = function (oControl, vPanels) {
			const aPanels = vPanels instanceof Array ? vPanels : [vPanels];
			if (!this.verifyMediators(oControl, aPanels)) {
				return;
			}
			const oEntry = this._getRegisterEntry(oControl);
			if (oEntry.activeP13n) {
				return;
			}
			oEntry.activeP13n = true;
			this.oPersPopupManager.openP13nPopup(
				oControl,
				oEntry.mediators,
				aPanels,
				function (bIsOk) {
					let aChanges = [];
					if (bIsOk) {
						aPanels.forEach((sPanelKey) => {
							aChanges = aChanges.concat(oEntry.mediators[sPanelKey].getChanges());
						});
					}
					if (aChanges.length) {
						this.addChangesToFlex(aChanges);
					}
					oEntry.activeP13n = false;
				}.bind(this)
			);
		};

		PersManager.prototype.verifyMediators = function (oControl, aPanels) {
			const oEntry = this._getRegisterEntry(oControl);
			if (!oEntry || !aPanels || !(aPanels instanceof Array) || !aPanels?.length) {
				return false;
			}
			return aPanels.every((sKey) => {
				if (!oEntry.mediators[sKey]) {
					Log.error(`No mediator registered yet for ${oControl.getId()} and key: ${sKey}`);
					return false;
				}
				return true;
			});
		};

		PersManager.prototype.addChangesToFlex = function (aChanges) {
			ControlPersonalizationWriteAPI.add({
				changes: aChanges
			});
		};

		PersManager.prototype.waitForChanges = function (oControl) {
			return _requireFlexRuntimeAPI().then((FlexRuntimeInfoAPI) => {
				return FlexRuntimeInfoAPI.waitForChanges({ element: oControl });
			});
		};

		PersManager.prototype.applyStateChange = function (oControl) {
			const oRegistryEntry = this._getRegisterEntry(oControl);
			if (!oRegistryEntry?.mediators) {
				return;
			}
			const oSorters = [];
			Object.entries(oRegistryEntry.mediators).forEach(([sKey, oMediator]) => {
				if (oMediator instanceof SortMediator || oMediator instanceof GroupMediator) {
					oMediator.applyStateToTable(oSorters);
				} else {
					oMediator.applyStateToTable();
				}
			});
			const aSorters = Object.values(oSorters);
			oControl.getBinding("items").sort(aSorters.length ? aSorters : null);
		};
		return PersManager;
	}
);
