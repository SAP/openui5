/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/support/supportRules/ui/controllers/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/thirdparty/URI",
	"sap/m/library"
], function (BaseController, JSONModel, CommunicationBus, SharedModel, channelNames, constants, storage, URI, mLibrary) {
	"use strict";

	return BaseController.extend("sap.ui.support.supportRules.ui.controllers.Main", {
		onInit: function () {
			this.model = SharedModel;
			this.getView().setModel(this.model);
			this.resizeDown();
			this.setCommunicationSubscriptions();
			this.initSettingsPopoverModel();
			this.hidden = false;
			this.model.setProperty("/hasNoOpener", window.opener ? false : true);
			this.model.setProperty("/constants", constants);
			this.updateShowButton();
			this._setContextSettings();

			this.bAdditionalViewLoaded = false;
			CommunicationBus.subscribe(channelNames.UPDATE_SUPPORT_RULES, function () {
				if (!this.bAdditionalViewLoaded) {
					this.bAdditionalViewLoaded = true;
					this.loadAdditionalUI();
				}
			}, this);
		},

		loadAdditionalUI: function () {
			this._issuesPage = sap.ui.xmlview(this.getView().getId() + "--issues", "sap.ui.support.supportRules.ui.views.Issues");
			this.byId("navCon").insertPage(this._issuesPage);
		},

		onAfterRendering: function () {
			CommunicationBus.publish(channelNames.POST_UI_INFORMATION, {
				version: sap.ui.getVersionInfo(),
				location: new URI(jQuery.sap.getModulePath("sap.ui.support"), window.location.origin + window.location.pathname).toString()
			});
		},

		initSettingsPopoverModel: function () {
			var supportAssistantOrigin = new URI(sap.ui.resource('sap.ui.support', ''), window.location.origin + window.location.pathname)._string,
				supportAssistantVersion = sap.ui.version;

			this.model.setProperty("/supportAssistantOrigin", supportAssistantOrigin);
			this.model.setProperty("/supportAssistantVersion", supportAssistantVersion);
		},

		copySupportAssistantOriginToClipboard: function (oEvent) {
			var supportAssistantOrigin = this.model.getProperty("/supportAssistantOrigin"),
				copyToClipboardEventHandler = function (oEvent) {
					if (oEvent.clipboardData) {
						oEvent.clipboardData.setData('text/plain', supportAssistantOrigin);
					} else {
						oEvent.originalEvent.clipboardData.setData('text/plain', supportAssistantOrigin);
					}
					oEvent.preventDefault();
				};

			if (window.clipboardData) {
				window.clipboardData.setData("text", supportAssistantOrigin);
			} else {
				document.addEventListener('copy', copyToClipboardEventHandler);
				document.execCommand('copy');
				document.removeEventListener('copy', copyToClipboardEventHandler);
			}
		},

		setCommunicationSubscriptions: function () {

			var iProgressTimeout;

			CommunicationBus.subscribe(channelNames.CURRENT_LOADING_PROGRESS, function (data) {
				var iCurrentProgress = data.value,
					oProgressIndicator = this.byId("progressIndicator");

				if (data.value < 100) {
					this.model.setProperty("/showProgressIndicator", true);

					// handling unknown errors
					// if the progress is not updated within 2500ms, remove progress indicator
					clearTimeout(iProgressTimeout);
					iProgressTimeout = setTimeout(function () {
						this.model.setProperty("/showProgressIndicator", false);
					}.bind(this), 2500);

				} else {
					// Hides ProgressIndicator after a timeout of 2 seconds
					setTimeout(function () {
						this.model.setProperty("/showProgressIndicator", false);
					}.bind(this), 2000);
				}

				oProgressIndicator.setDisplayValue(constants.RULESET_LOADING + " " + iCurrentProgress + "%");

				this.model.setProperty("/progress", iCurrentProgress);
			}, this);

			CommunicationBus.subscribe(channelNames.ON_ANALYZE_FINISH, function (data) {
				this._clearProcessIndicator();
				this.ensureOpened();
				this.model.setProperty("/showProgressIndicator", false);
				this.model.setProperty("/coreStateChanged", false);
				this.model.setProperty("/lastAnalysisElapsedTime", data.elapsedTime);
				this.goToIssues();
				this.model.setProperty("/analyzedFinish", true);
			}, this);

			CommunicationBus.subscribe(channelNames.ON_PROGRESS_UPDATE, function (data) {
				var currentProgress = data.currentProgress,
					pi = this.byId("progressIndicator");

				pi.setDisplayValue(currentProgress + "/" + 100);
				this.model.setProperty("/progress", currentProgress);
			}, this);

			CommunicationBus.subscribe(channelNames.ON_CORE_STATE_CHANGE, function () {
				this.model.setProperty("/coreStateChanged", true);
			}, this);
		},

		resizeUp: function () {
			CommunicationBus.publish(channelNames.RESIZE_FRAME, { bigger: true });
		},

		ensureOpened: function () {
			CommunicationBus.publish(channelNames.ENSURE_FRAME_OPENED);
		},

		resizeDown: function () {
			CommunicationBus.publish(channelNames.RESIZE_FRAME, { bigger: false });
		},

		onSettings: function (oEvent) {
			CommunicationBus.publish(channelNames.ENSURE_FRAME_OPENED);

			if (!this._settingsPopover) {
				this._settingsPopover = sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.StorageSettings", this);
				this.getView().addDependent(this._settingsPopover);
			}
			var that = this,
				oSource = oEvent.getSource();

			setTimeout(function () {
				that._settingsPopover.openBy(oSource);
			});
		},
		goToAnalysis: function (oEvent) {
			this._setActiveView("analysis");
		},
		goToIssues: function (oEvent) {
			this._setActiveView("issues");
		},
		_pingUrl: function (sUrl) {
			return jQuery.ajax({
				type: "HEAD",
				async:true,
				context: this,
				url: sUrl
			});
		},

		/**
		 * Pings the passed url for checking that this is valid path and if the ping is
		 * success redirects to passed url. If something goes wrong it fallback
		 * to default public url
		 * @param sUrl URL that needs to be ping and redirect to.
		 * @private
		 */
		_redirectToUrlWithFallback:function (sUrl) {
			this._pingUrl(sUrl).then(function success() {
				mLibrary.URLHelper.redirect(sUrl, true);
			}, function error() {
				jQuery.sap.log.info("Support Assistant tried to load documentation link in " + sUrl + "but fail");
				sUrl = "https://ui5.sap.com/#/topic/57ccd7d7103640e3a187ed55e1d2c163";
				mLibrary.URLHelper.redirect(sUrl, true);
			});
		},

		goToWiki: function () {
			var sUrl = "",
				sVersion = "",
				sFullVersion = sap.ui.getVersionInfo().version,
				iMajorVersion = jQuery.sap.Version(sFullVersion).getMajor(),
				iMinorVersion = jQuery.sap.Version(sFullVersion).getMinor(),
				sOrigin = window.location.origin;

			//This check is to make sure that version is even. Example: 1.53 will back down to 1.52
			// This is used to generate the correct path to demokit
			if (iMinorVersion % 2 !== 0) {
				iMinorVersion--;
			}

			sVersion += String(iMajorVersion) + "." + String(iMinorVersion);

			if (sOrigin.indexOf("veui5infra") !== -1) {
				sUrl = sOrigin + "/sapui5-sdk-internal/#/topic/57ccd7d7103640e3a187ed55e1d2c163";
			} else {
				sUrl = sOrigin + "/demokit-" + sVersion + "/#/topic/57ccd7d7103640e3a187ed55e1d2c163";
			}

			this._redirectToUrlWithFallback(sUrl);
		},

		setRulesLabel: function (libs) {
			var selectedCounter = 0;
			if (libs === null) {
				return "Rules (" + selectedCounter + ")";
			} else {
				libs.forEach(function (lib, libIndex) {
					selectedCounter += lib.rules.length;
				});
				return "Rules (" + selectedCounter + ")";
			}
		},

		updateShowButton: function () {
			// When hidden is true - the frame is minimized and we show the "show" button
			this.byId("sapSTShowButtonBar").setVisible(this.hidden);
		},

		toggleHide: function () {
			this.hidden = !this.hidden;
			this.updateShowButton();

			CommunicationBus.publish(channelNames.TOGGLE_FRAME_HIDDEN, this.hidden);
		},

		_clearProcessIndicator: function () {
			var pi = this.byId("progressIndicator");
			pi.setDisplayValue("None");
			this.model.setProperty("/progress", 0.1);
		},

		_setContextSettings: function () {
			var cookie = storage.readPersistenceCookie(constants.COOKIE_NAME);
			if (cookie) {
				this.model.setProperty("/persistingSettings", true);
				var contextSettings = storage.getSelectedContext();

				if (contextSettings) {
					this.model.setProperty("/analyzeContext", contextSettings.analyzeContext);
					this.model.setProperty("/subtreeExecutionContextId", contextSettings.subtreeExecutionContextId);
				} else {
					this.model.setProperty("/analyzeContext", this.model.getProperty("/analyzeContext"));
					this.model.setProperty("/subtreeExecutionContextId", "");
				}
			}
		},

		_setActiveView: function(sId) {
			this.byId("issuesBtn").setType(sap.m.ButtonType.Default);
			this.byId("analysisBtn").setType(sap.m.ButtonType.Default);

			//The corresponding button must have id with the name of the view
			this.byId(sId + "Btn").setType(sap.m.ButtonType.Emphasized);
			this.byId("navCon").to(this.byId(sId), "show");
			this.ensureOpened();
		}
	});
});
