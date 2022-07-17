/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/mdc/p13n/P13nBuilder",
	"sap/m/p13n/Container",
	"sap/m/p13n/AbstractContainerItem",
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function (BaseObject, P13nBuilder, P13nContainer, AbstractContainerItem, SAPUriParameters, Log, jQuery) {
	"use strict";

	var ERROR_INSTANCING = "UIManager: This class is a singleton and should not be used without an AdaptationProvider. Please use 'sap.ui.mdc.p13n.Engine.getInstance().uimanager' instead";

	//Singleton storage
	var oUIManager;

	//Used for experimental features (such as livemode)
	var oURLParams = SAPUriParameters.fromQuery(window.location.search);

	/**
	 * Constructor for a new UIManager.
	 * This registry creates and manages default persistence providers for each persistence mode.
	 * It is intended for use cases where no dedicated provider can or should be created by an application.
	 * The UIManager currently resides in the Engine and must never be called separately.
	 *
	 * @class
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.90
	 * @since 1.90
	 * @alias sap.ui.mdc.p13n.UIManager
	 */
	var UIManager = BaseObject.extend("sap.ui.mdc.p13n.UIManager", {
		constructor: function(oAdaptationProvider) {

			if (oUIManager) {
				throw Error(ERROR_INSTANCING);
			}

			this.oAdaptationProvider = oAdaptationProvider;

			BaseObject.call(this);
		}
	});

	/**
	 * Opens a personalization Dialog according to the provided Controller
	 * in the registration that the Engine can find for the Control and key.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance
	 * @param {string} vKey The key(s) for the according Controller
	 * @param {sap.ui.core.Control} oSource The source to be used. This may only
	 * be relevant in case the corresponding Controller is configured
	 * for liveMode
	 *
	 * @returns {Promise} A Promise resolving in the P13n UI.
	 */
	 UIManager.prototype.show = function(vControl, vKey, oSource) {

		this.bLiveMode = false;

		//!!!Warning: experimental and only for testing purposes!!!----------
		if (oURLParams.get("sap-ui-xx-p13nLiveMode") === "true"){
			this.bLiveMode = true;
			Log.warning("Please note that the p13n liveMode is experimental");
		}

		if (!this.hasActiveP13n(vControl)){
			this.setActiveP13n(vControl, vKey);
			return this.create(vControl, vKey).then(function(oP13nDialog){
				this._openP13nControl(vControl, vKey, oP13nDialog, oSource);
				return oP13nDialog;
			}.bind(this), function(eContainerFailure){
				this.setActiveP13n(vControl, null);
				Log.error("Engine UI failure:" + eContainerFailure.stack);
			}.bind(this));
		} else {
			return Promise.resolve();
		}
	};

	/**
	 * This method can be used to create a customized P13nUI without using the default
	 * implementation of <code>Engine#showUI</code> which will use all
	 * properties available by default.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance
	 * @param {string|string[]} vKey The key for the according Controller
	 * @param {Object[]} aCustomInfo A custom set of propertyinfos as base to create the UI
	 *
	 * @returns {Promise} A Promise resolving in the P13n UI.
	 */
	UIManager.prototype.create = function(vControl, vKey, aCustomInfo) {
		var aKeys = vKey instanceof Array ? vKey : [vKey];
		var oControl = typeof vControl == "string" ? sap.ui.getCore().byId(vControl) : vControl;
		return this.oAdaptationProvider.initAdaptation(vControl, aKeys, aCustomInfo).then(function(){
			return this._retrieveP13nContainer(oControl, aKeys).then(function(oContainer){
				oControl.addDependent(oContainer);
				return oContainer;
			});
		}.bind(this));
	};


	/**
	 * This method can be used to open the p13n UI.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance.
	 * @param {string} vKey The registerd key to get the corresponding Controller.
	 * @param {sap.ui.core.Control} oP13nControl The created p13n UI to be displayed.
	 * @param {sap.ui.core.Control} oSource The source control (only for livemode).
	 */
	UIManager.prototype._openP13nControl = function(vControl, vKey, oP13nControl, oSource){
		var aKeys = vKey instanceof Array ? vKey : [vKey];
		if (this.bLiveMode) {
			oP13nControl.openBy(oSource);
			delete this.bLiveMode;
		} else {
			oP13nControl.open();
		}

		if (this.oAdaptationProvider && this.oAdaptationProvider.validateP13n instanceof Function) {
			aKeys.forEach(function(sKey){
				var bWrapperUsed = aKeys.length > 1;
				var oAdaptationUI;
				var oContent = oP13nControl.getContent()[0];
				if (bWrapperUsed && oContent.isA("sap.m.p13n.Container") && oContent.getView(sKey)) {
					oAdaptationUI = oContent.getView(sKey).getContent();
				} else {
					oAdaptationUI = oContent;
				}
				this.oAdaptationProvider.validateP13n(vControl, sKey, oAdaptationUI);
			}.bind(this));
		}
	};

	/**
	 * This method can be used to retrieve the p13n container.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} oControl The registered control instance.
	 * @param {string} aKeys The registered key to get the corresponding Controller.
	 *
	 * @returns {Promise} A Promise resolving in the according container
	 * (Depending on the Controllers livemode config).
	 */
	UIManager.prototype._retrieveP13nContainer = function (oControl, aKeys) {

		var aPAdaptationUI = [];
		var bUseP13nContainer = aKeys instanceof Array && aKeys.length > 1;

		//Note: Engine#getUISettings triggers BaseController#getAdaptationUI, which should only be executed again
		//after the according p13n ui content has been cleaned up properly.
		var oUISettings = this.oAdaptationProvider.getUISettings(oControl, aKeys);

		aKeys.forEach(function(sRelevantKey){
			//Ignore unknown keys for now..
			if (!oUISettings[sRelevantKey]) {
				aKeys.splice(aKeys.indexOf(sRelevantKey), 1);
				return;
			}
		});

		aKeys.forEach(function(sRelevantKey){
			var pAdaptationUI = oUISettings[sRelevantKey].adaptationUI;
			pAdaptationUI._key = sRelevantKey;
			var pWrapped = pAdaptationUI.then(function(oAdaptationUI){
				if (this.bLiveMode && oAdaptationUI && oAdaptationUI.attachChange) {
					oAdaptationUI.attachChange(function(){
						this.oAdaptationProvider.handleP13n(oControl, aKeys);
					}.bind(this));
				}
				if (oAdaptationUI && oAdaptationUI.attachChange) {
					oAdaptationUI.attachChange(function(oEvt){
						var sKey = bUseP13nContainer ? oEvt.getSource().getParent().getParent().getCurrentViewKey() : aKeys[0];
						this.oAdaptationProvider.validateP13n(oControl, sKey, oAdaptationUI);
					}.bind(this));
				}
				var oSetting = oUISettings[pAdaptationUI._key];
				return {
					key: pAdaptationUI._key,
					tab: oSetting.containerSettings && oSetting.containerSettings.tabText ? oSetting.containerSettings.tabText : pAdaptationUI._key,
					panel: oAdaptationUI
				};
			}.bind(this));

			aPAdaptationUI.push(pWrapped);
		}.bind(this));

		return Promise.all(aPAdaptationUI).then(function(aUIs){
			var oPopupContent = bUseP13nContainer ? new P13nContainer({
				afterViewSwitch: function(oEvt) {
					this.oAdaptationProvider.validateP13n(oControl, oEvt.getParameter("target"), oEvt.getSource().getCurrentViewContent());
				}.bind(this)
			}) : aUIs[0].panel;
			if (bUseP13nContainer) {
				aUIs.forEach(function(mUI){
					if (mUI.panel) {
						oPopupContent.addView(new AbstractContainerItem({
							key: mUI.key,
							text: mUI.tab,
							content: mUI.panel
						}));
					}
				});
				oPopupContent.switchView(aUIs[0].key);
			}

			return this._createUIContainer(oControl, aKeys, oPopupContent, oUISettings).then(function(oDialog){
				return oDialog;
			});
		}.bind(this));

	};

	/**
	 * This method can be used to create the p13n container instance.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} oControl The registered control instance.
	 * @param {string[]} aKeys The registered keys to get the corresponding Controller.
	 * @param {*} oPopupContent
	 * @param {*} oUISettings
	 *
	 * @returns {Promise} Returns a Promise resolving in the container instance
	 */
	UIManager.prototype._createUIContainer = function (oControl, aKeys, oPopupContent, oUISettings) {

		var oContainerPromise;
		var mContainerSettings = aKeys.length > 1 ? this._getDefaultContainerConfig(oUISettings) : oUISettings[aKeys[0]];

		if (this.bLiveMode) {
			oContainerPromise = this._createPopover(oControl, aKeys, oPopupContent, mContainerSettings);
		} else {
			oContainerPromise = this._createModalDialog(oControl, aKeys, oPopupContent, mContainerSettings);
		}

		return oContainerPromise.then(function(oContainer){
			// Add custom style class in order to display marked items accordingly
			oContainer.addStyleClass("sapUiMdcPersonalizationDialog");

			oContainer.isPopupAdaptationAllowed = function () {
				return false;
			};

			//EscapeHandler is required for non-liveMode
			if (this.bLiveMode === false){
				oContainer.setEscapeHandler(function(oDialogClose){
					this.setActiveP13n(oControl, null);
					aKeys.forEach(function(sKey){
						if (oUISettings[sKey].containerSettings && oUISettings[sKey].containerSettings.afterClose instanceof Function) {
							oUISettings[sKey].containerSettings.afterClose({
								getSource: function() {
									return oContainer;
								}
							});
						}
					});
					oContainer.close();
					oContainer.destroy();
					oDialogClose.resolve();
				}.bind(this));
			}

			// Set compact style class if the table is compact too
			oContainer.toggleStyleClass("sapUiSizeCompact", !!jQuery(oControl).closest(".sapUiSizeCompact").length);

			//TODO: Clarify whether we really want this
			//If the container has a header itself, don't show any shadows from the dialog
			//if (oContainer && oContainer.getCustomHeader()){
			//	oContainer.getCustomHeader().addStyleClass("sapUiMdcContainerBar");
			//}


			return oContainer;
		}.bind(this));

	};

	/**
	 * This method can be used to create a Popover as container instance.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} oControl The registered control instance.
	 * @param {string[]} aKeys The registerd key to get the corresponding Controller.
	 * @param {sap.ui.core.Control} oPanel The control instance which is set in the content area of the container.
	 * @param {object} mUISettings
	 *
	 * @returns {sap.m.ResponsivePopover} The popover instance.
	 */
	UIManager.prototype._createPopover = function(oControl, aKeys, oPanel, mUISettings){

		var fnAfterDialogClose = function (oEvt) {
			var oPopover = oEvt.getSource();
			this.setActiveP13n(oControl, null);
			oPopover.destroy();
		}.bind(this);

		var mSettings = Object.assign({
			verticalScrolling: true,
			reset: mUISettings.reset,
			afterClose: fnAfterDialogClose
		}, mUISettings.containerSettings);

		if (mUISettings.resetEnabled){
			mSettings.reset = {
				onExecute: function() {
					aKeys.forEach(function(sKey){
						this.oAdaptationProvider.reset(oControl, sKey);
					}.bind(this));
				}
			};
		}

		return P13nBuilder.createP13nPopover(oPanel, mSettings);

	};

	/**
	 * This method can be used to create a Dialog as container instance.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} oControl The registered control instance.
	 * @param {string} aKeys The registerd key to get the corresponding Controller.
	 * @param {sap.ui.core.Control} oPanel The control instance which is set in the content area of the container.
	 *
	 * @returns {sap.m.Dialog} The dialog instance.
	 */
	UIManager.prototype._createModalDialog = function(oControl, aKeys, oPanel, mUISettings){

		var fnDialogOk = function (oEvt) {
			var oDialog = oEvt.getSource().getParent();

			var pConfirmContainer = this._confirmContainer(oControl, aKeys, oPanel);

			pConfirmContainer.then(function(){
				this.setActiveP13n(oControl, null);
				oDialog.close();
			}.bind(this));

		}.bind(this);

		var fnDialogCancel = function(oEvt) {
			var oContainer = oEvt.getSource().getParent();
			this.setActiveP13n(oControl, null);
			oContainer.close();
		}.bind(this);

		var mSettings = Object.assign({
			verticalScrolling: true,
			reset: mUISettings.reset || {},
			afterClose: function(oEvt) {
				var oDialog = oEvt.getSource();
				if (oDialog) {
					oDialog.destroy();
				}
			},
			cancel: fnDialogCancel
		}, mUISettings.containerSettings);

		if (mUISettings.resetEnabled){
			mSettings.reset.onExecute = function() {
				this.oAdaptationProvider.reset(oControl, aKeys);
			}.bind(this);
		}

		mSettings.confirm = {
			handler: function(oEvt) {
				fnDialogOk(oEvt);
			}
		};

		return P13nBuilder.createP13nDialog(oPanel, mSettings);
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
	 * Retrieves the uimanager default setting for the container, these defaults
	 * may only be used in case multiple keys are shown at once.
	 *
	 * @returns {object} The default settings for the container creation
	 */
	UIManager.prototype._getDefaultContainerConfig = function(oUISettings) {
		var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		var aKeys = Object.keys(oUISettings);
		var oContainerConfig =  {
			containerSettings: {
				title: oRB.getText("p13nDialog.VIEW_SETTINGS"),
				verticalScrolling: false, //The Wrapper already takes care of the scrolling
				contentHeight: oUISettings.contentHeight,
				contentWidth: oUISettings.contentWidth,
				afterClose: function(oEvt) {
					aKeys.forEach(function(sKey){
						if (oUISettings[sKey] && oUISettings[sKey].containerSettings && oUISettings[sKey].containerSettings.afterClose instanceof Function) {
							oUISettings[sKey].containerSettings.afterClose(oEvt);
						}
					});
					oEvt.getSource().destroy();
				}
			}
		};

		if (oUISettings.resetEnabled !== false) {
			oContainerConfig.reset = {
				onExecute: function(oControl) {
					this.oAdaptationProvider.reset(oControl, aKeys);
				}.bind(this),
				warningText: oRB.getText("p13nDialog.RESET_WARNING_TEXT")
			};
		}

		return oContainerConfig;

	};

	/**
	 * This method can be used to confirm a Dialog container instance.
	 *
	 * @private
	 *
	 * @param {sap.ui.mdc.Control} vControl The registered control instance
	 * @param {array} aKeys The keys of the controllers that should be called for synchronizations
	 *
	 */
	UIManager.prototype._confirmContainer = function(vControl, aKeys){
		return this.oAdaptationProvider.handleP13n(vControl, aKeys);
	};

	/**
	 * Checks if the UIManager has been initialized with a valid AdaptationProvider interface.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @param {sap.ui.mdc.AdaptationProvider} oAdaptationProvider
	 */
	 UIManager._checkValidInterface = function(oAdaptationProvider) {
		if (!oAdaptationProvider || !oAdaptationProvider.isA("sap.ui.mdc.p13n.AdaptationProvider")){
			throw Error("The UIManager singleton must not be accessed without an AdaptationProvider interface!");
		}
	};

	/**
	 * This method is the central point of access to the UIManager Singleton.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 */
	UIManager.getInstance = function(oAdaptationProvider) {
		if (!oUIManager) {
			this._checkValidInterface(oAdaptationProvider);
			oUIManager = new UIManager(oAdaptationProvider);
		}
		return oUIManager;
	};

	UIManager.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
		oUIManager = null;
	};

	return UIManager;
});
