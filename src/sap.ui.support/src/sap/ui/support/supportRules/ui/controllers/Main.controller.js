/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/ui/models/SharedModel",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/Storage"
], function (Controller, JSONModel, CommunicationBus, SharedModel, channelNames, constants, storage) {
	"use strict";

	return Controller.extend("sap.ui.support.supportRules.ui.controllers.Main", {
		onInit: function () {
			this.model = SharedModel;
			this.getView().setModel(this.model);
			this.resizeDown();
			this.setCommunicationSubscriptions();
			this.initSettingsPopover();

			this.hidden = false;
			this.model.setProperty("/hasNoOpener", window.opener ? false : true);
			this.model.setProperty("/constants", constants);
			this.updateShowButton();
			this._setContextSettings();

		},

		initSettingsPopover: function () {
			this._settingsPopover = sap.ui.xmlfragment("sap.ui.support.supportRules.ui.views.StorageSettings", this);
			this._settingsPopover.setModel(SharedModel);
			this.getView().addDependent(this._oPopover);
		},

		setCommunicationSubscriptions: function () {
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
					pi = this.getView().byId("progressIndicator");

				pi.setDisplayValue(currentProgress + "/" + 100);
				this.model.setProperty("/progress", currentProgress);
			}, this);

			CommunicationBus.subscribe(channelNames.ON_CORE_STATE_CHANGE, function () {
				this.model.setProperty("/coreStateChanged", true);
			}, this);
		},

		resizeUp: function () {
			CommunicationBus.publish(channelNames.RESIZE_FRAME, {bigger: true});
		},

		ensureOpened: function () {
			CommunicationBus.publish(channelNames.ENSURE_FRAME_OPENED);
		},

		resizeDown: function () {
			CommunicationBus.publish(channelNames.RESIZE_FRAME, {bigger: false});
		},

		onPersistedSettingSelect: function() {
			if (this.model.getProperty("/persistingSettings")) {
				storage.createPersistenceCookie(constants.COOKIE_NAME, true);

				this.model.getProperty("/libraries").forEach(function (lib) {
					if (lib.title == constants.TEMP_RULESETS_NAME) {
							storage.setRules(lib.rules);
						}
				});
				this.persistExecutionScope();

			} else {
				storage.deletePersistenceCookie(constants.COOKIE_NAME);
				this.deletePersistedData();
			}
		},
		onSettings: function (oEvent) {
			CommunicationBus.publish(channelNames.ENSURE_FRAME_OPENED);

			var that = this,
				source = oEvent.getSource();
			setTimeout(function() {
				that._settingsPopover.openBy(source);
			}, 0);
		},

		onNavConAfterNavigate: function (oEvent) {
			var to = oEvent.getParameter("to");
			if (to === this.getView().byId("analysis")) {
				setTimeout(function () {
					to.getController().markLIBAsSelected();
				}, 250);
			}
		},


		goToAnalysis: function (evt) {
			var navCon = this.getView().byId("navCon");
			navCon.to(this.getView().byId("analysis"), "show");
			this.ensureOpened();
		},
		goToIssues: function () {
			var navCon = this.getView().byId("navCon");
			navCon.to(this.getView().byId("issues"), "show");
			this.ensureOpened();
		},

		goToWiki: function () {
			 window.open('https://uacp2.hana.ondemand.com/viewer/DRAFT/SAPUI5_Internal/57ccd7d7103640e3a187ed55e1d2c163.html','_blank');
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
			this.getView().byId("sapSTShowButtonBar").setVisible(this.hidden);
		},

		toggleHide: function () {
			this.hidden = !this.hidden;
			this.updateShowButton();

			CommunicationBus.publish(channelNames.TOGGLE_FRAME_HIDDEN, this.hidden);
		},

		persistExecutionScope: function() {
			var setting = {
				analyzeContext: this.model.getProperty("/analyzeContext"),
				subtreeExecutionContextId: this.model.getProperty("/subtreeExecutionContextId")
			},
			scopeComponent = this.model.getProperty("/executionScopeComponents");

			storage.setSelectedScopeComponents(scopeComponent);
			storage.setSelectedContext(setting);
		},

		deletePersistedData: function() {
			storage.deletePersistenceCookie(constants.COOKIE_NAME);
			this.model.setProperty("/persistingSettings", false);
			storage.removeAllData();
		},

		_clearProcessIndicator: function() {
			var pi = this.getView().byId("progressIndicator");
			pi.setDisplayValue("None");
			this.model.setProperty("/progress", 0.1);
		},

		_setContextSettings:function() {
			var cookie = storage.readPersistenceCookie(constants.COOKIE_NAME);
			if (cookie) {
				this.model.setProperty("/persistingSettings", true);
				var contextSettings = storage.getSelectedContext();

				if (contextSettings) {
					this.model.setProperty("/analyzeContext", contextSettings.analyzeContext);
					this.model.setProperty("/subtreeExecutionContextId", contextSettings.subtreeExecutionContextId);
				}else {
					this.model.setProperty("/analyzeContext", this.model.getProperty("/analyzeContext"));
					this.model.setProperty("/subtreeExecutionContextId", "");
				}
			}
		}
	});
});
