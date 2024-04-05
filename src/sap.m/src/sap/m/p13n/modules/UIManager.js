/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/Log",
	"sap/ui/core/Lib"
], (BaseObject, Log, Library) => {
	"use strict";

	const ERROR_INSTANCING = "UIManager: This class is a singleton and should not be used without an AdaptationProvider. Please use 'Engine.getInstance().uimanager' instead";

	//Singleton storage
	let oUIManager;

	/**
	 * Constructor for a new UIManager.
	 * This manager creates and manages <code>sap.m.p13n.Popup</code> instances in order to personalize a certain control instance.
	 * The <cod>UIManager</code> serves as additional implementation for the <code>sap.m.p13n.Engine</code> to visualize p13n UIs for end user personalization.
	 *
	 * <b>Note:</b>The UIManager resides in the Engine and must never be called separately.
	 * The Engine currently is being used to provide controller capabilities, accessed by the UIManager, the according is {@link sap.m.p13n.AdaptationProvider}.
	 *
	 * @class
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 *
	 * @since 1.104
	 * @alias sap.m.p13n.modules.UIManager
	 */
	const UIManager = BaseObject.extend("sap.m.p13n.modules.UIManager", {
		constructor: function(oAdaptationProvider) {

			if (oUIManager) {
				throw Error(ERROR_INSTANCING);
			}

			this.oAdaptationProvider = oAdaptationProvider;

			BaseObject.call(this);
		}
	});

	const loadModules = (aModules) => {
		return new Promise((resolve, reject) => {
			sap.ui.require(aModules, resolve, reject);
		});
	};

	/**
	 *
	 * @param {sap.ui.core.Control} oControl The control instance to be personalized
	 * @param {string|string[]} vPanelKeys The affected panels that should be added to the <code>sap.m.p13n.Popup</code>
	 * @param {object} mSettings The settings object for the personalization
	 * @param {string} [mSettings.title] The title for the <code>sap.m.p13n.Popup</code> control
	 * @param {sap.ui.core.Control} [mSettings.source] The source contro to be used by the <code>sap.m.p13n.Popup</code> control (only necessary in case the mode is set to <code>ResponsivePopover</code>)
	 * @param {sap.m.P13nPopupMode} [mSettings.mode] The mode to be used by the <code>sap.m.p13n.Popup</code> control
	 * @param {sap.ui.core.CSSSize} [mSettings.contentHeight] Height configuration for the related popup container
	 * @param {sap.ui.core.CSSSize} [mSettings.contentWidth] Width configuration for the related popup container
	 * @param {boolean} [mSettings.showReset] Determines the visibility of the <code>Reset</code> button
	 * @param {boolean} [mSettings.enableReset] Determines the enablement status of the <code>Reset</code> button
	 * (Note: only takes effect if the button is shown via <code>showReset</code>)
	 * @param {function} [mSettings.reset] Custom reset handling to opt out the default reset which will trigger a reset for all open tabs.
	 * @param {function} [mSettings.close] Event handler once the Popup has been closed
	 *
	 * @returns {Promise} Promise resolving in the <code>sap.m.p13n.Popup</code> instance.
	 */
	UIManager.prototype.show = function(oControl, vPanelKeys, mSettings) {
		const aPanelKeys = vPanelKeys instanceof Array ? vPanelKeys : [vPanelKeys];
		const oResourceBundle = Library.getResourceBundleFor("sap.m");
		const that = this;
		mSettings = Object.assign({}, mSettings);

		if (!this.hasActiveP13n(oControl)) {
			this.setActiveP13n(oControl, vPanelKeys);

			return this.create(oControl, vPanelKeys, mSettings)
				.then((aInitializedPanels) => {
					return loadModules(["sap/m/p13n/Popup"]).then((Popup) => {

						//if there is no title provided and only one panel created, use it's title as the Popup title
						let sTitle;
						if (!mSettings.title && aPanelKeys.length === 1 && aInitializedPanels.length > 0) {
							sTitle = aInitializedPanels[0].getTitle();
						} else {
							sTitle = mSettings.title || oResourceBundle.getText("p13n.VIEW_SETTINGS");
						}

						//Enrich Popup with AdaptationProvider functionality --> add controller logic (reset and appliance)
						const oP13nContainer = new Popup({
							mode: mSettings.mode,
							warningText: mSettings.warningText || oResourceBundle.getText("p13n.RESET_WARNING_TEXT"),
							title: sTitle,
							close: function(oEvt) {

								const sReason = oEvt.getParameter("reason");
								if (sReason == "Ok") {
									that.oAdaptationProvider.handleP13n(oControl, aPanelKeys);
								}
								const aPanels = oP13nContainer.getPanels();

								aPanels.forEach((oPanel) => {
									if (oPanel.keepAlive instanceof Function && oPanel.keepAlive()) {
										oP13nContainer.removePanel(oPanel);
									}
								});

								that.setActiveP13n(oControl, null);
								oP13nContainer._oPopup.attachAfterClose(() => {
									if (mSettings.close instanceof Function) {
										mSettings.close();
									}
									oP13nContainer.destroy();
								});
							}
						});

						oP13nContainer._getContainer().attachAfterViewSwitch((oEvt) => {
							const affectedKey = oEvt.getParameter("target");
							const affectedPanel = aInitializedPanels[aPanelKeys.indexOf(affectedKey)];
							that.oAdaptationProvider.validateP13n(oControl, affectedKey, affectedPanel);
						});

						if (mSettings.showReset !== false) {
							oP13nContainer.setReset(() => {
								const fnReset = mSettings.reset instanceof Function ? mSettings.reset : that.oAdaptationProvider.reset.bind(that.oAdaptationProvider);
								fnReset(oControl, aPanelKeys);
							});
						}

						aInitializedPanels.forEach((oPanel, iIndex) => {
							oP13nContainer.addPanel(oPanel, aPanelKeys[iIndex]);
						});

						oControl.addDependent(oP13nContainer);
						oP13nContainer.open(mSettings.source, mSettings);
						return oP13nContainer._oPopup;

					});
				}, (eContainerFailure) => {
					this.setActiveP13n(oControl, null);
					Log.error("UIManager failure:" + eContainerFailure.stack);
				});
		} else {
			return Promise.resolve();
		}
	};

	UIManager.prototype.create = function(oControl, vPanelKeys) {
		const aPanelKeys = vPanelKeys instanceof Array ? vPanelKeys : [vPanelKeys];
		const that = this;

		return this.oAdaptationProvider.initAdaptation(oControl, aPanelKeys)
			.then(() => {
				const vSettings = this.oAdaptationProvider.getUISettings(oControl, aPanelKeys);

				//if condition only temporarly necessary until sap.ui.comp adjusted
				if (vSettings instanceof Promise) {
					return vSettings;
				} else {
					const aPanelPromises = [],
						aPanelSettings = [];
					Object.keys(vSettings).forEach((sSetting) => {
						const vSetting = vSettings[sSetting];
						if (vSetting && vSetting.hasOwnProperty("adaptationUI")) {
							const pCreation = vSetting.adaptationUI;
							aPanelPromises.push(pCreation);

							aPanelSettings.push({
								key: sSetting,
								settings: vSetting
							});
						}
					});
					return Promise.all(aPanelPromises).then((aPanels) => {
						const mMappedSetting = {};
						aPanels.forEach((oPanel, iIndex) => {
							if (oPanel) {
								const oPanelSetting = aPanelSettings[iIndex];
								const mContainerSettings = oPanelSetting.settings.containerSettings;
								if (mContainerSettings.title) {
									oPanel.setTitle(mContainerSettings.title);
								}
								mMappedSetting[oPanelSetting.key] = {
									panel: oPanel
								};
							}
						});
						return mMappedSetting;
					});
				}
			})

			.then((mSettings) => {
				const aInitializedPanels = [];

				//Attach state validation during personalization
				Object.keys(mSettings).forEach((sPanel, iIndex) => {
					const oPanel = mSettings[sPanel].panel;

					//not every panel used is a p13n.BasePanel (comp.FilterPanel, AdaptationFilterBar) these panels might not provide a change event
					if (oPanel.attachChange instanceof Function) {
						oPanel.attachChange((oEvt) => {
							that.oAdaptationProvider.validateP13n(oControl, aPanelKeys[iIndex], oEvt.getSource());
						});
					}
					aInitializedPanels.push(oPanel);
				});

				return aInitializedPanels;
			});
	};

	UIManager.getInstance = function(oAdaptationProvider) {
		if (!oUIManager) {
			this._checkValidInterface(oAdaptationProvider);
			oUIManager = new UIManager(oAdaptationProvider);
		}
		return oUIManager;
	};

	UIManager.prototype.setActiveP13n = function(vControl, vKeys, bModified) {
		if (this.oAdaptationProvider.setActiveP13n instanceof Function) {
			this.oAdaptationProvider.setActiveP13n(vControl, vKeys, bModified);
		}
	};

	UIManager.prototype.hasActiveP13n = function(vControl) {
		let bActiveP13n = false;
		if (this.oAdaptationProvider.hasActiveP13n instanceof Function) {
			bActiveP13n = this.oAdaptationProvider.hasActiveP13n(vControl);
		}
		return bActiveP13n;
	};

	/**
	 * Checks if the UIManager has been initialized with a valid AdaptationProvider interface.
	 *
	 * @private
	 * @ui5-restricted sap.m
	 *
	 * @param {sap.m.AdaptationProvider} oAdaptationProvider Object implementing the <code>sap.m.AdaptationProvider</code> interface to provide personalization capabilites.
	 */
	UIManager._checkValidInterface = (oAdaptationProvider) => {
		if (!oAdaptationProvider || !oAdaptationProvider.isA("sap.m.p13n.modules.AdaptationProvider")) {
			throw Error("The UIManager singleton must not be accessed without an AdaptationProvider interface!");
		}
	};

	UIManager.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
		oUIManager = null;
	};

	return UIManager;
});