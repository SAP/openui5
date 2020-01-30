/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/Device",
	"sap/ui/util/Storage",
	"sap/ui/core/mvc/Controller",
	"sap/ui/testrecorder/ui/models/SharedModel",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/CheckBox",
	"sap/m/Button",
	"sap/ui/support/supportRules/ui/external/ElementTree",
	"sap/ui/testrecorder/interaction/ContextMenu"
], function (Device, Storage, Controller, SharedModel, CommunicationBus, CommunicationChannels, JSONModel, ResourceModel,
		MessageToast, Dialog, CheckBox, Button, ElementTree, ContextMenu) {
	"use strict";

	return Controller.extend("sap.ui.testrecorder.ui.controllers.Main", {
		onInit: function () {
			this._hidden = false;
			this._frameHeight = 1;
			this._treeSelectionId = null;
			this._localStorage = new Storage(Storage.Type.local, "sap-ui-test-recorder");

			jQuery.sap.includeStyleSheet("sap/ui/testrecorder/ui/styles/overlay.css");

			this.elementTree = new ElementTree(null, {
				filter: {
					issues: false,
					search: true
				},
				onSelectionChanged: this._onTreeSelectionChanged.bind(this),
				onContextMenu: this._onTreeContextMenu.bind(this)
			});

			this._setupModels();

			this.toggleHeaderToolbars();
		},
		onBeforeRendering: function () {
			CommunicationBus.publish(CommunicationChannels.REQUEST_ALL_CONTROLS_DATA);
		},
		onAfterRendering: function () {
			CommunicationBus.subscribe(CommunicationChannels.RECEIVE_ALL_CONTROLS_DATA, this._onUpdateAllControls.bind(this));
			CommunicationBus.subscribe(CommunicationChannels.RECEIVE_CONTROL_DATA, this._onUpdateControlDetails.bind(this));
			CommunicationBus.subscribe(CommunicationChannels.RECEIVE_CODE_SNIPPET, this._onUpdateCodeSnippet.bind(this));
			CommunicationBus.subscribe(CommunicationChannels.SELECT_CONTROL_IN_TREE, this._onUpdateSelection.bind(this));
		},
		toggleHeaderToolbars: function () {
			// When hidden is true - the frame is minimized and we show the "show" button
			this.byId("ttMaximizeHeaderBar").setVisible(this._hidden);
		},
		toggleHide: function () {
			this._hidden = !this._hidden;
			this.toggleHeaderToolbars();
			if (this._hidden) {
				CommunicationBus.publish(CommunicationChannels.HIDE_IFRAME);
			} else {
				CommunicationBus.publish(CommunicationChannels.SHOW_IFRAME);
			}
		},
		resizeDown: function () {
			this._frameHeight -= 1;
			CommunicationBus.publish(CommunicationChannels.RESIZE_IFRAME_DOWN);
		},
		resizeUp: function () {
			this._frameHeight += 1;
			CommunicationBus.publish(CommunicationChannels.RESIZE_IFRAME_UP);
		},
		openWindow: function () {
			this._frameHeight = 1;
			CommunicationBus.publish(CommunicationChannels.OPEN_NEW_WINDOW);
		},
		close: function () {
			CommunicationBus.publish(CommunicationChannels.CLOSE_IFRAME);
		},
		dockFrame: function () {
			this._frameHeight = 1;
			CommunicationBus.publish(CommunicationChannels.DOCK_IFRAME);
		},
		copyCodeSnippet: function () {
			var sCodeSnippet = this.byId("codeEditor").getValue();
			var fnCopyToClipboard = function(oEvent) {
				if (oEvent.clipboardData) {
					oEvent.clipboardData.setData('text/plain', sCodeSnippet);
				} else {
					oEvent.originalEvent.clipboardData.setData('text/plain', sCodeSnippet);
				}
				oEvent.preventDefault();
			};
			if (Device.browser.msie && window.clipboardData) {
				window.clipboardData.setData("text", sCodeSnippet);
			} else {
				document.addEventListener('copy', fnCopyToClipboard);
				document.execCommand('copy');
				document.removeEventListener('copy', fnCopyToClipboard);
			}
		},
		openSettingsDialog: function () {
			if (!this.settingsDialog) {
				this.settingsDialog = new Dialog({
					title: this.getView().getModel("i18n").getProperty("TestRecorder.SettingsDialog.Title"),
					content: [
						new CheckBox({
							text: this.getView().getModel("i18n").getProperty("TestRecorder.SettingsDialog.IDCheckBox.Text"),
							selected: this.model.getProperty("/settings/preferViewId"),
							select: this._onSelectCheckBox.bind(this)
						})
					],
					endButton: new Button({
						text: this.getView().getModel("i18n").getProperty("TestRecorder.SettingsDialog.CloseButton.Text"),
						press: this.closeSettingsDialog.bind(this)
					})
				});
				this.getView().addDependent(this.settingsDialog);
			}
			this.settingsDialog.open();
		},
		closeSettingsDialog: function () {
			if (this.settingsDialog) {
				this.settingsDialog.close();
			}
		},
		_setupModels: function () {
			this.model = SharedModel;
			this.getView().setModel(this.model);
			this.model.setProperty("/isInIframe", !window.opener);

			var sSelectedDialect = this._localStorage.get("dialect");
			var bPreferViewId = this._localStorage.get("preferViewId");
			if (sSelectedDialect) {
				this.model.setProperty("/selectedDialect", sSelectedDialect);
				CommunicationBus.publish(CommunicationChannels.SET_DIALECT, sSelectedDialect);
			}
			if (bPreferViewId !== null && bPreferViewId !== undefined) {
				this.model.setProperty("/settings/preferViewId", bPreferViewId);
				CommunicationBus.publish(CommunicationChannels.UPDATE_SELECTOR_SETTINGS, {
					preferViewId: bPreferViewId
				});
			}

			var binding = new sap.ui.model.Binding(SharedModel, "/selectedDialect", SharedModel.getContext("/"));
			binding.attachChange(function() {
				var sSelectedDialect = this.model.getProperty("/selectedDialect");
				CommunicationBus.publish(CommunicationChannels.SET_DIALECT, sSelectedDialect);
				this._localStorage.put("dialect", sSelectedDialect);
			}.bind(this));

			var oI18nModel = new ResourceModel({
				bundleName: "sap.ui.core.messagebundle"
			});
			this.getView().setModel(oI18nModel, "i18n");

			this.getView().setModel(new JSONModel({
				framework: {}
			}), "framework");

			this.getView().setModel(new JSONModel({
				controls: {
					bindings: {},
					properties: {},
					codeSnippet: "",
					renderedControls: []
				}
			}), "controls");
		},
		_onUpdateAllControls: function (mData) {
			this.elementTree.setContainerId(this.byId("elementTreeContainer").getId());
			this._clearControlData();

			if (mData.framework) {
				this.getView().getModel("controls").setProperty("/framework", mData.framework);
			}
			if (mData.renderedControls) {
				this.getView().getModel("controls").setProperty("/renderedControls", mData.renderedControls);
				this.elementTree.setData({
					controls: mData.renderedControls
				});
			}

			if (this._frameHeight > 0 && !this._hidden) {
				MessageToast.show(this.getView().getModel("i18n").getProperty("TestRecorder.ControlTree.MessageToast"), {
					duration: 1000
				});
			}
		},
		_onUpdateControlDetails: function (mData) {
			if (mData.properties) {
				this.getView().getModel("controls").setProperty("/properties", mData.properties);
			}
			if (mData.bindings) {
				this.getView().getModel("controls").setProperty("/bindings", mData.bindings);
			}
		},
		_onUpdateCodeSnippet: function (mData) {
			if (mData.codeSnippet) {
				this.getView().getModel("controls").setProperty("/codeSnippet", mData.codeSnippet);
			} else if (mData.error) {
				var sNotFoundText = this.getView().getModel("i18n").getResourceBundle().getText("TestRecorder.Inspect.Snippet.NotFound.Text", "#" + mData.domElement);
				this.getView().getModel("controls").setProperty("/codeSnippet", sNotFoundText);
			}
		},
		_onUpdateSelection: function (mData) {
				this.elementTree.setSelectedElement(mData.rootElementId, false);
				this._clearControlData();

				// domElementId is the ID of the control focus ref *in the app*,
				// interactionElementId is the ID of the right-clicked element *in the app*
				CommunicationBus.publish(CommunicationChannels.REQUEST_CONTROL_DATA, {domElement: mData.rootElementId });
				CommunicationBus.publish(CommunicationChannels.REQUEST_CODE_SNIPPET, {
					domElement: mData.interactionElementId,
					action: mData.action
				});
				CommunicationBus.publish(CommunicationChannels.HIGHLIGHT_CONTROL, {domElement: mData.rootElementId });
		},
		_onTreeSelectionChanged: function (domElementId) {
			this._clearControlData();

			// here domElementId is the ID of the element *in the app*
			CommunicationBus.publish(CommunicationChannels.REQUEST_CONTROL_DATA, {domElement: domElementId });
			CommunicationBus.publish(CommunicationChannels.REQUEST_CODE_SNIPPET, {domElement: domElementId });
			CommunicationBus.publish(CommunicationChannels.HIGHLIGHT_CONTROL, {domElement: domElementId });
		},
		_onTreeContextMenu: function (mData) {
			mData = mData || {};
			// the context menu is in a different context than the dom element to be located, so communication should happen with events
			mData.withEvents = true;
			mData.items = {
				highlight: false
			};
			ContextMenu.show(mData);
		},
		_clearControlData: function () {
			this.getView().getModel("controls").setProperty("/properties", {});
			this.getView().getModel("controls").setProperty("/bindings", {});
			this.getView().getModel("controls").setProperty("/codeSnippet", "");
		},
		_onSelectCheckBox: function (oEvent) {
			var bSelected = oEvent.getParameter("selected");
			this.model.setProperty("/settings/preferViewId", bSelected);
			CommunicationBus.publish(CommunicationChannels.UPDATE_SELECTOR_SETTINGS, {
				preferViewId: bSelected
			});
			this._localStorage.put("preferViewId", bSelected);
		}
	});
});
