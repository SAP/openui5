/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/mdc/util/loadModules",
	"sap/base/Log"
], function (BaseObject, loadModules, Log) {
	"use strict";

	var ERROR_INSTANCING = "UIManager: This class is a singleton and should not be used without an AdaptationProvider. Please use 'sap.m.p13n.Engine.getInstance().uimanager' instead";

	//Singleton storage
	var oUIManager;

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
	var UIManager = BaseObject.extend("sap.m.p13n.UIManager", {
		constructor: function(oAdaptationProvider) {

			if (oUIManager) {
				throw Error(ERROR_INSTANCING);
			}

			this.oAdaptationProvider = oAdaptationProvider;

			BaseObject.call(this);
		}
	});

	/**
	 *
	 * @param {sap.ui.core.Control} oControl The control instance to be personalized
	 * @param {string|string[]} vPanelKeys The affected panels that should be added to the <code>sap.m.p13n.Popup</code>
	 * @param {object} mSettings The settings object for the personalization
	 * @param {string} [mSettings.title] The title for the <code>sap.m.p13n.Popup</code> control
	 * @param {object} [mSettings.source] The source contro to be used by the <code>sap.m.p13n.Popup</code> control (only necessary in case the mode is set to <code>ResponsivePopover</code>)
	 * @param {object} [mSettings.mode] The mode to be used by the <code>sap.m.p13n.Popup</code> control
	 * @param {object} [mSettings.contentHeight] Height configuration for the related popup container
	 * @param {object} [mSettings.contentWidth] Width configuration for the related popup container
	 *
	 * @returns {Promise} Promise resolving in the <code>sap.m.p13n.Popup</code> instance.
	 */
	UIManager.prototype.show = function(oControl, vPanelKeys, mSettings) {
		var aPanelKeys = vPanelKeys instanceof Array ? vPanelKeys : [vPanelKeys];
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		var that = this;
		mSettings = Object.assign({}, mSettings);

		if (!this.hasActiveP13n(oControl)){
			this.setActiveP13n(oControl, vPanelKeys);

			return this.create(oControl, vPanelKeys, mSettings)
			.then(function(aInitializedPanels){
				return loadModules(["sap/m/p13n/Popup"]).then(function(aModules){

					//if there is no title provided and only one panel created, use it's title as the Popup title
					var sTitle;
					if (!mSettings.title && aPanelKeys.length === 1) {
						sTitle = aInitializedPanels[0].getTitle();
					} else {
						sTitle = mSettings.title || oResourceBundle.getText("p13n.VIEW_SETTINGS");
					}

					//Enrich Popup with AdaptationProvider functionality --> add controller logic (reset and appliance)
					var Popup = aModules[0];
					var oP13nContainer = new Popup({
						mode: mSettings.mode,
						warningText: mSettings.warningText || oResourceBundle.getText("p13n.RESET_WARNING_TEXT"),
						title: sTitle,
						close: function(oEvt){
							var sReason = oEvt.getParameter("reason");
							if (sReason == "Ok") {
								that.oAdaptationProvider.handleP13n(oControl, aPanelKeys);
							}
							oP13nContainer.removeAllPanels();//TODO
							that.setActiveP13n(oControl, null);

							oP13nContainer.destroy();
						},
						reset: function(){
							that.oAdaptationProvider.reset(oControl, aPanelKeys);
						}
					});

					aInitializedPanels.forEach(function(oPanel, iIndex){
						oP13nContainer.addPanel(oPanel, aPanelKeys[iIndex]);
					});

					oControl.addDependent(oP13nContainer);
					oP13nContainer.open(mSettings.source, mSettings);
					return oP13nContainer._oPopup;

				});
			}, function(eContainerFailure){
				this.setActiveP13n(oControl, null);
				Log.error("UIManager failure:" + eContainerFailure.stack);
			}.bind(this));
		} else {
			return Promise.resolve();
		}
	};

	UIManager.prototype.create = function(oControl, vPanelKeys) {
		var aPanelKeys = vPanelKeys instanceof Array ? vPanelKeys : [vPanelKeys];
		var that = this;

		return this.oAdaptationProvider.initAdaptation(oControl, aPanelKeys)
		.then(function(){
			var vSettings = this.oAdaptationProvider.getUISettings(oControl, aPanelKeys);

			//if condition only temporarly necessary until sap.ui.comp adjusted
			if (vSettings instanceof Promise) {
				return vSettings;
			} else {
				var aPanelPromises = [], aPanelSettings = [];
				Object.keys(vSettings).forEach(function(sSetting){
					var vSetting = vSettings[sSetting];
					if (vSetting && vSetting.hasOwnProperty("adaptationUI")) {
						var pCreation = vSetting.adaptationUI;
						aPanelPromises.push(pCreation);

						aPanelSettings.push({
							key: sSetting,
							settings: vSetting
						});
					}
				});
				return Promise.all(aPanelPromises).then(function(aPanels){
					var mMappedSetting = {};
					aPanels.forEach(function(oPanel, iIndex){
						if (oPanel) {
							var oPanelSetting = aPanelSettings[iIndex];
							var mContainerSettings = oPanelSetting.settings.containerSettings;
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
		}.bind(this))

		.then(function(mSettings){
			var aInitializedPanels = [];

			//Attach state validation during personalization
			Object.keys(mSettings).forEach(function(sPanel, iIndex){
				var oPanel = mSettings[sPanel].panel;

				//not every panel used is a p13n.BasePanel (comp.FilterPanel, AdaptationFilterBar) these panels might not provide a change event
				if (oPanel.attachChange instanceof Function) {
					oPanel.attachChange(function(oEvt){
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

	UIManager.prototype.setActiveP13n = function(vControl, vKeys) {
		if (this.oAdaptationProvider.setActiveP13n instanceof Function) {
			this.oAdaptationProvider.setActiveP13n(vControl, vKeys);
		}
	};

	UIManager.prototype.hasActiveP13n = function(vControl) {
		var bActiveP13n = false;
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
	UIManager._checkValidInterface = function(oAdaptationProvider) {
		if (!oAdaptationProvider || !oAdaptationProvider.isA("sap.m.p13n.AdaptationProvider")){
			throw Error("The UIManager singleton must not be accessed without an AdaptationProvider interface!");
		}
	};

	UIManager.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
		oUIManager = null;
	};

	return UIManager;
});