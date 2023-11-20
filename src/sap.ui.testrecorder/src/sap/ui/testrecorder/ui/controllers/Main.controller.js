/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/util/Storage",
	"sap/ui/core/mvc/Controller",
	"sap/ui/dom/includeStylesheet",
	"sap/ui/testrecorder/ui/models/SharedModel",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/Binding",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/CheckBox",
	"sap/m/Button",
	"sap/m/VBox",
	"sap/ui/support/supportRules/ui/external/ElementTree",
	"sap/ui/testrecorder/interaction/ContextMenu"
], function ($, Device, Storage, Controller, includeStylesheet, SharedModel, CommunicationBus, CommunicationChannels, JSONModel, ResourceModel,
		Binding, MessageToast, Dialog, CheckBox, Button, VBox, ElementTree, ContextMenu) {
	"use strict";

	return Controller.extend("sap.ui.testrecorder.ui.controllers.Main", {
		onInit: function () {
			this._minimized = false;
			this._selectionId = null;
			this._localStorage = new Storage(Storage.Type.local, "sap-ui-test-recorder");

			includeStylesheet("sap/ui/testrecorder/ui/styles/overlay.css");

			this.elementTree = new ElementTree(null, {
				filter: {
					issues: false,
					search: true
				},
				onSelectionChanged: this._onTreeSelectionChanged.bind(this),
				onContextMenu: this._onTreeContextMenu.bind(this),
				onInitialRendering: this._onElementTreeInitialRendering.bind(this)
			});

			this._setupModels();

			this.toggleHeaderToolbars();
		},
		onBeforeRendering: function () {
			CommunicationBus.publish(CommunicationChannels.REQUEST_ALL_CONTROLS_DATA);
		},
		onAfterRendering: function () {
			CommunicationBus.subscribe(CommunicationChannels.RECEIVE_ALL_CONTROLS_DATA, this._onUpdateAllControls.bind(this));
			CommunicationBus.subscribe(CommunicationChannels.RECEIVE_CONTROL_DATA, this._onReceiveControlDetails.bind(this));
			CommunicationBus.subscribe(CommunicationChannels.RECEIVE_CODE_SNIPPET, this._onUpdateCodeSnippet.bind(this));
			CommunicationBus.subscribe(CommunicationChannels.SELECT_CONTROL_IN_TREE, this._onUpdateSelection.bind(this));
			CommunicationBus.subscribe(CommunicationChannels.DIALECT_CHANGED, this._changeDialect.bind(this));
		},
		toggleHeaderToolbars: function () {
			// When hidden is true - the frame is minimized and we show the "show" button
			this.byId("ttMaximizeHeaderBar").setVisible(this._minimized);
		},
		toggleMinimize: function () {
			this._minimized = !this._minimized;
			this.toggleHeaderToolbars();
			if (this._minimized) {
				CommunicationBus.publish(CommunicationChannels.MINIMIZE_IFRAME);
			} else {
				CommunicationBus.publish(CommunicationChannels.SHOW_IFRAME);
			}
		},
		dockBottom: function () {
			CommunicationBus.publish(CommunicationChannels.DOCK_IFRAME_BOTTOM);
		},
		dockRight: function () {
			CommunicationBus.publish(CommunicationChannels.DOCK_IFRAME_RIGHT);
		},
		dockLeft: function () {
			CommunicationBus.publish(CommunicationChannels.DOCK_IFRAME_LEFT);
		},
		openWindow: function () {
			CommunicationBus.publish(CommunicationChannels.OPEN_NEW_WINDOW);
		},
		close: function () {
			CommunicationBus.publish(CommunicationChannels.CLOSE_IFRAME);
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
		clearCodeSnippet: function () {
			CommunicationBus.publish(CommunicationChannels.CLEAR_SNIPPETS);
			this.byId("codeEditor").setValue("");
		},
		openSettingsDialog: function () {
			if (!this.settingsDialog) {
				this.settingsDialog = new Dialog({
					title: this.getView().getModel("i18n").getProperty("TestRecorder.SettingsDialog.Title"),
					content: [
						new VBox({
							items: [
								new CheckBox({
									text: this.getView().getModel("i18n").getProperty("TestRecorder.SettingsDialog.IDCheckBox.Text"),
									name: "preferViewId",
									selected: this.model.getProperty("/settings/preferViewId"),
									select: this._onSelectCheckBox.bind(this)
								}),
								new CheckBox({
									text: this.getView().getModel("i18n").getProperty("TestRecorder.SettingsDialog.POMethodCheckBox.Text"),
									name: "formatAsPOMethod",
									selected: this.model.getProperty("/settings/formatAsPOMethod"),
									select: this._onSelectCheckBox.bind(this)
								})
							]
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
		handlePropertyIconPress: function (oEvent) {
			var oIcon = oEvent.getSource();
			var oItem = oIcon.getParent().getParent();
			var propertyName = oItem.getCells()[0].getItems()[1].getText();
			var propertyValue = oItem.getCells()[1].getText();
			var propertyType = oItem.getCells()[2].getText();
			CommunicationBus.publish(CommunicationChannels.ASSERT_PROPERTY, {
				domElementId: this._selectionId,
				assertion: {
					propertyName: propertyName,
					expectedValue: propertyValue,
					propertyType: propertyType
				}
			});
		},

		_setupModels: function () {
			this.model = SharedModel;
			this.getView().setModel(this.model);
			this.model.setProperty("/isInIframe", !window.opener);

			// setup stored settings
			var sSelectedDialect = this._localStorage.get("dialect");
			var bPreferViewId = this._localStorage.get("settings-preferViewId");
			var bFormatAsPOMethod = this._localStorage.get("settings-formatAsPOMethod");
			if (sSelectedDialect) {
				this.model.setProperty("/selectedDialect", sSelectedDialect);
				CommunicationBus.publish(CommunicationChannels.SET_DIALECT, sSelectedDialect);
			}
			if (bPreferViewId !== null && bPreferViewId !== "undefined") {
				this.model.setProperty("/settings/preferViewId", bPreferViewId);
			}
			if (bFormatAsPOMethod !== null && bFormatAsPOMethod !== "undefined") {
				this.model.setProperty("/settings/formatAsPOMethod", bFormatAsPOMethod);
			}
			CommunicationBus.publish(CommunicationChannels.UPDATE_SETTINGS, this.model.getProperty("/settings"));

			// listen for changes in the dialect sap.m.Select
			var binding = new Binding(SharedModel, "/", SharedModel.getContext("/selectedDialect"));
			binding.attachChange(function() {
				CommunicationBus.publish(CommunicationChannels.SET_DIALECT, this.model.getProperty("/selectedDialect"));
			}.bind(this));

			// initialize common models
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
			// fill in model data when the app is loaded
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

			if (!this._minimized) {
				MessageToast.show(this.getView().getModel("i18n").getProperty("TestRecorder.ControlTree.MessageToast"), {
					duration: 1000
				});
			}
		},
		_onReceiveControlDetails: function (mData) {
			// fill in data when a control is selected
			if (mData.properties) {
				this.getView().getModel("controls").setProperty("/properties", mData.properties);
			}
			if (mData.bindings) {
				this.getView().getModel("controls").setProperty("/bindings", mData.bindings);
			}
		},
		_onUpdateCodeSnippet: function (mData) {
			// update models when a snippet is generated
			if (mData.codeSnippet !== undefined) {
				this.getView().getModel("controls").setProperty("/codeSnippet", mData.codeSnippet);
			} else if (mData.error) {
				var sNotFoundText = this.getView().getModel("i18n").getResourceBundle().getText("TestRecorder.Inspect.Snippet.NotFound.Text", "#" + mData.domElementId);
				this.getView().getModel("controls").setProperty("/codeSnippet", sNotFoundText);
			}
		},
		_onUpdateSelection: function (mData) {
			// request data for a control that was selected in the app
			this._selectionId = mData.rootElementId;
			this.elementTree.setSelectedElement(mData.rootElementId, false);
			this._clearControlData();

			// domElementId is the ID of the control focus ref *in the app*,
			// interactionElementId is the ID of the right-clicked element *in the app*
			CommunicationBus.publish(CommunicationChannels.REQUEST_CONTROL_DATA, {
				domElementId: mData.rootElementId
			});
			CommunicationBus.publish(CommunicationChannels.REQUEST_CODE_SNIPPET, {
				domElementId: mData.interactionElementId,
				action: mData.action,
				assertion: mData.assertion
			});
			CommunicationBus.publish(CommunicationChannels.HIGHLIGHT_CONTROL, {
				domElementId: mData.rootElementId
			});
		},
		_onTreeSelectionChanged: function (domElementId) {
			// request data for a control that was selected in the tree - via left click
			this._selectionId = domElementId;
			this._clearControlData();

			// here domElementId is the ID of the element *in the app*
			CommunicationBus.publish(CommunicationChannels.REQUEST_CONTROL_DATA, {domElementId: domElementId });
			CommunicationBus.publish(CommunicationChannels.REQUEST_CODE_SNIPPET, {domElementId: domElementId });
			CommunicationBus.publish(CommunicationChannels.HIGHLIGHT_CONTROL, {domElementId: domElementId });
		},
		_onTreeContextMenu: function (mData) {
			// request data for a control that was selected in the app - via right click
			mData = mData || {};
			// the context menu is in a different context than the dom element to be located, so communication should happen with events
			mData.withEvents = true;
			mData.items = {
				highlight: false
			};
			ContextMenu.show(mData);
		},
		_onElementTreeInitialRendering: function () {
			var oFilterContainer = this.elementTree._filterContainer;
			var fnOnSearchInput = oFilterContainer.onkeyup;
			var fnOnOptionsChange = oFilterContainer.onchange;
			var aOptions = ["filter", "attributes", "namespaces"];
			var oModel = this.model;

			aOptions.forEach(function (sOption) {
				var elem = oFilterContainer.querySelector("[" + sOption + "]");
				elem.checked = oModel.getProperty("/elementTree/" + sOption);
				$(elem).change();
			});
			var searchInput = oFilterContainer.querySelector("[search]");
			searchInput.value = oModel.getProperty("/elementTree/search");
			$(searchInput).keyup();

			oFilterContainer.onchange = function (event) {
				aOptions.forEach(function (sOption) {
					if (event.target.getAttribute(sOption) !== null) {
						oModel.setProperty("/elementTree/" + sOption, event.target.checked);
					}
				});
				fnOnOptionsChange.apply(this, arguments);
			};
			oFilterContainer.onkeyup = function (event) {
				oModel.setProperty("/elementTree/search", event.target.value);
				fnOnSearchInput.apply(this, arguments);
			};
		},
		_clearControlData: function () {
			this.getView().getModel("controls").setProperty("/properties", {});
			this.getView().getModel("controls").setProperty("/bindings", {});
			this.getView().getModel("controls").setProperty("/codeSnippet", "");
		},
		_changeDialect: function (mData) {
			this._localStorage.put("dialect", mData.dialect);
		},
		_onSelectCheckBox: function (oEvent) {
			// update models when selecting a checkbox in the settings dialog
			var bSelected = oEvent.getParameter("selected");
			var sSetting = oEvent.getSource().getName();
			var mSetting = {};
			mSetting[sSetting] = bSelected;
			this.model.setProperty("/settings/" + sSetting, bSelected);
			this._localStorage.put("settings-" + sSetting, bSelected);
			CommunicationBus.publish(CommunicationChannels.UPDATE_SETTINGS, mSetting);
		},
		_onChangeMultiple: function (oEvent) {
			// update models when changing the state of the multiple snippets sap.m.Switch
			var bState = oEvent.getParameter("state");
			CommunicationBus.publish(CommunicationChannels.UPDATE_SETTINGS, {
				multipleSnippets: bState
			});
		},
		_onCodeEditorChange: function (oEvent) {
			var oCodeEditor = this.byId("codeEditor");
			var iLineCount = oCodeEditor.getValue().split("\n").length;
			if (iLineCount) {
				oCodeEditor._oEditor.scrollToLine(iLineCount);
			}
		}
	});
});
