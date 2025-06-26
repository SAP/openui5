/*!
 * ${copyright}
 */

sap.ui.define(
	[
		"sap/ui/documentation/sdk/controller/Sample.controller",
		"../model/ExploreSettingsModel",
		"sap/ui/core/Component",
		"sap/ui/core/Fragment",
		"sap/ui/core/HTML",
		"sap/ui/Device",
		"sap/base/Log",
		"sap/base/util/restricted/_debounce",
		"sap/ui/model/odata/v4/lib/_MetadataRequestor",
		"sap/ui/documentation/sdk/controller/util/ControlsInfo",
		"sap/ui/documentation/sdk/model/formatter"
	],
	function (
		SampleController,
		ExploreSettingsModel,
		Component,
		Fragment,
		HTML,
		Device,
		Log,
		_debounce,
		_MetadataRequestor,
		ControlsInfo,
		formatter
	) {
		"use strict";

		return SampleController.extend("sap.ui.documentation.sdk.controller.Code", {
			constructor: function () {
				this.onFileEditorFileChangeDebounced = _debounce(this.onFileEditorFileChangeDebounced, 500);
			},

			/**
			 * Called when the controller is instantiated.
			 */
			onInit: function () {
				SampleController.prototype.onInit.call(this);

				this.getView().setModel(ExploreSettingsModel, "settings");

				this._fileEditor = this.byId("fileEditor");
				this._fileEditor.attachBeforeFileChange(this.onBeforeFileChanged.bind(this));
				this._fileEditor.attachFileChange(this.onFileEditorFileChangeDebounced.bind(this));

				this._registerResize();
			},

			onExit: function () {
				this._deregisterResize();
			},

			onBeforeFileChanged: function (oEvent) {
				var sFile = oEvent.getParameter("sFile");
				this._oChangedFile = {
					sFile: sFile
				};
			},

			onFileEditorFileChangeDebounced: function () {
				var oModelData = this.oModel.getData();

				if (this._oChangedFile) {
					var sRef = sap.ui.require.toUrl((this._sId).replace(/\./g, "/"));
					var sLocalStorageDKSamples = this._getChangedSamplesLocalStorage();
					if (!sLocalStorageDKSamples) {
						this._setChangedSamplesLocalStorage(JSON.stringify([this._sId]));
					} else {
						var aChangedDKSamples = JSON.parse(sLocalStorageDKSamples);

						if (aChangedDKSamples.indexOf(this._sId) < 0) {
							aChangedDKSamples.push(this._sId);
							this._setChangedSamplesLocalStorage(JSON.stringify(aChangedDKSamples));
						}
					}
					oModelData.showWarning = true;
					this.oModel.setData(oModelData);

					this._updateFileContent(sRef, this._oChangedFile.sFile, true);
					this._oChangedFile = null;
				}
				if (ExploreSettingsModel.getProperty("/autoRun")) {
					this._updateSample();
				}
			},

			onFileSwitch: function (oEvent) {
				ExploreSettingsModel.setProperty("/editable", oEvent.getParameter("editable"));
			},

			onRunPressed: function (oEvent) {
				this._updateSample();
			},

			onClearButtonPressed: function (oEvent) {
				var oFrame = document.getElementById("sampleFrameEdit"),
					sLocalStorageDKSamples = this._getChangedSamplesLocalStorage(),
					oModelData = this.oModel.getData(),
					sRef = sap.ui.require.toUrl((this._sId).replace(/\./g, "/"));

				if (sLocalStorageDKSamples) {
					var aChangedDKSamples = JSON.parse(sLocalStorageDKSamples);
					aChangedDKSamples.splice(aChangedDKSamples.indexOf(this._sId), 1);
					this._setChangedSamplesLocalStorage(JSON.stringify(aChangedDKSamples));
				}

				oModelData.showWarning = false;
				this.oModel.setData(oModelData);

				this._getPage().setBusy(true);
				oFrame.addEventListener("load", function() {
					this._getPage().setBusy(false);
				}.bind(this), {
					once: true
				});

				Promise.allSettled(this._oData.files.map(function(file) {
					return fetch(file.url, { method: "DELETE" });
				}))
					.then(function() {
						this._fileEditor._setClearButtonPressed(true);
						this._updateSample();
						this._fileEditor._fetchContents();
						this._oData.files.forEach(function (oFile) {
							this._updateFileContent(sRef, oFile.name, true);
						}, this);
					}.bind(this));
			},

			onChangeSplitterOrientation: function () {
				var oView = this.getView();
				//Toggles the value of splitter orientation
				ExploreSettingsModel.setProperty("/splitViewVertically", !ExploreSettingsModel.getProperty("/splitViewVertically"));
				var isOrientationVertical = ExploreSettingsModel.getProperty("/splitViewVertically");
				oView.byId("splitView")
					.getRootPaneContainer()
					.setOrientation(isOrientationVertical ? "Vertical" : "Horizontal");
				oView.byId("splitButton").setIcon(isOrientationVertical ? "sap-icon://screen-split-one" : "sap-icon://header");
			},

			_attachPaternMatched: function () {
				this.oRouter.getRoute("code").attachPatternMatched(this._onRouteMatched, this);
				this.oRouter.getRoute("codeFile").attachPatternMatched(this._onRouteMatched, this);
			},

			_deregisterResize: function () {
				Device.media.detachHandler(this._onResize, this);
			},

			_registerResize: function () {
				Device.media.attachHandler(this._onResize, this);
				this._onResize();
			},

			_onResize: function () {
				var isOrientationVertical = ExploreSettingsModel.getProperty("/splitViewVertically"),
					sRangeName = Device.media.getCurrentRange("StdExt").name;

				if (sRangeName == "Tablet" || (sRangeName == "Phone" && !isOrientationVertical)) {
					ExploreSettingsModel.setProperty("/splitViewVertically", true);
					this.getView().byId("splitView").getRootPaneContainer().setOrientation("Vertical");
				}
			},

			_onRouteMatched: function (oEvent) {
				var oArguments = oEvent.getParameter("arguments");

				this._sId = oArguments.sampleId;
				this._sEntityId = oArguments.entityId;
				this._sFileName = formatter.routeParamsToFilePath(oArguments);
				this.byId("splitView").setBusy(true);

				this._loadCodeAndSample();
			},

			_loadCodeAndSample: function (bRetrying) {
				ControlsInfo.loadData()
					.then(function(oData) {
						return Promise.all([
							this._loadCode(oData),
							this._loadSample(oData)
						]);
					}.bind(this))
					.then(function(aResults) {
						if (bRetrying) {
							this._showCacheCleanupDialog();
						}
						this._showCode(aResults[0]);
					}.bind(this))
					.catch(function(error) {
						if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller || bRetrying) {
							this._showCacheCleanupDialog(true);
							// If service worker is not supported or already retried, log error // prevent infinite retry loop
							Log.error("Error loading code or sample: " + error.message);
							return;
						}

						 var serviceWorkerResponsePromise = new Promise(function(resolve) {
						// Set up a one-time listener for the service worker response
						var messageHandler = function(event) {
							if (event.data === "CACHE_CLEANED") {
								navigator.serviceWorker.removeEventListener('message', messageHandler);
								resolve();
							}
						};

						navigator.serviceWorker.addEventListener('message', messageHandler);

						// Send message to clean the cache
						this._sendMessageToServiceWorker({
							type: "CLEAN_CACHE"
						});

						// Set a timeout in case the service worker doesn't respond
						setTimeout(function() {
							navigator.serviceWorker.removeEventListener('message', messageHandler);
							resolve();
						}, 5000);
					}.bind(this));

					// Wait for the service worker to respond before retrying
					return serviceWorkerResponsePromise.then(function() {
						this._setChangedSamplesLocalStorage([]);
						this._loadCodeAndSample(true);
					}.bind(this));
				}.bind(this));
			},

			_loadCode: function (oData) {
				var sFileName = this._sFileName;
				var oSample = oData.samples[this._sId]; // retrieve sample object

				// If there is no sample or the context from the URL is for the wrong sample we redirect to not found page
				// If you modify this expression please check with both class and tutorial which won't have a context.
				if (!oSample || (oSample.contexts && !oSample.contexts[this._sEntityId])) {
					this.onRouteNotFound();
					return Promise.reject();
				}

				// cache the data to be reused
				if (!this._oData || oSample.id !== this._oData.id) {
					// get component and data when sample is changed or nothing exists so far
					return this._createComponent().then(function (oComponent) {
						// create data object
						var oConfig = oComponent.getManifestEntry("/sap.ui5/config") || {},
							aAdditionalEditableFiles = oConfig.sample && oConfig.sample.additionalEditableFiles;
						this._oData = {
							id: oSample.id,
							title: "Code: " + oSample.name,
							name: oSample.name,
							stretch: oConfig.sample ? oConfig.sample.stretch : false,
							files:  oConfig.sample.files.map(function(sFile) {
								return {
									key: sFile,
									name: sFile,
									editable: !!(sFile.endsWith(".xml") || sFile.endsWith(".js") || sFile === "manifest.json"
										|| (aAdditionalEditableFiles && aAdditionalEditableFiles.indexOf(sFile) > -1)),
									url: sap.ui.require.toUrl((oSample.id).replace(/\./g, "/")) + "/" + sFile
								};
							}),
							iframe: oConfig.sample.iframe,
							fileName: sFileName,
							includeInDownload: oConfig.sample.additionalDownloadFiles,
							customIndexHTML: oConfig.sample.customIndexHTML
						};

						return this._oData;
					}.bind(this));
				} else {
					this._oData.fileName = sFileName;
					return Promise.resolve(this._oData);
				}
			},

			_showCode: function (oCurrentSample) {
				var bUseIFrame = !!oCurrentSample.useIFrame;
				this._oCurrSample = oCurrentSample;
				if (oCurrentSample.files) {
					this._fileEditor.setFiles(oCurrentSample.files);
				} else {
					this.byId("splitView").setBusy(false);
				}

				ExploreSettingsModel.setProperty("/useIFrame", bUseIFrame);
				this.oModel.setProperty("/sample", oCurrentSample);

				window.addEventListener("message", function (event) {
					if (event.data === "sampleLoaded") {
						this.byId("splitView").setBusy(false);
					}
				}.bind(this));
			},

			_showCacheCleanupDialog: function (bForceReload) {
				ExploreSettingsModel.setProperty("/showWarning", bForceReload ? false : true);

				if (!this._oWarningDialog) {
					Fragment.load({
						name: "sap.ui.documentation.sdk.view.warningSampleDialog",
						controller: this
					}).then(function (oDialog) {
						this.getView().addDependent(oDialog);
						oDialog.setModel(ExploreSettingsModel, "settings");
						this._oWarningDialog = oDialog;
						this._oWarningDialog.open();
					}.bind(this));
				} else {
					this._oWarningDialog.open();
				}
			},

			_createHTMLControl: function () {
				return new HTML({
					id : "sampleFrameEdit",
					content : '<iframe src="' + this.sIFrameUrl + '" frameBorder="0" width="100%" height="100%"></iframe>'
				});
			},

			_getPage: function () {
				return this.byId("samplePageEdit");
			},

			_sendMessageToServiceWorker: function (message) {
				if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
					navigator.serviceWorker.controller.postMessage(message);
				}
			},

			onMessage: function(eMessage) {
				if (eMessage.origin !== this.getOwnerComponent()._sSampleIframeOrigin) {
					return;
				}
				if (eMessage.source !== (this._oHtmlControl.getDomRef() && this._oHtmlControl.getDomRef().contentWindow)) {
					return;
				}

				if (eMessage.data.type === "INIT") {
					this.fnMessageInit(eMessage);
				} else if (eMessage.data.type === "ERR") {
					this.fnMessageError(eMessage);
				} else if (eMessage.data.type === "LOAD") {
					this.fnMessageLoad(eMessage);
				}
			},

			handleDialogClose: function () {
				 var bShowWarning = ExploreSettingsModel.getProperty("/showWarning");

				if (this._oWarningDialog && bShowWarning) {
					this._oWarningDialog.close();
				} else {
					window.location.reload(); // reload the page to try again
				}
			},

			onNavBack: function () {
				this.oRouter.navTo("sample", {
					entityId: this.entityId,
					sampleId: this._sId
				}, false);
			},

			onPreviousSample: function (oEvent) {
				this.oRouter.navTo("code", {
					entityId: this.entityId,
					sampleId: this.oModel.getProperty("/previousSampleId")
				});
			},

			onNextSample: function (oEvent) {
				this.oRouter.navTo("code", {
					entityId: this.entityId,
					sampleId: this.oModel.getProperty("/nextSampleId")
				});
			},

			/**
			 * Reflects changes in the code editor to the sample.
			 * @param {string} sValue The value of the manifest.json file.
			 */
			_updateSample: function () {
				var oFrame = document.getElementById("sampleFrameEdit");

				if (oFrame.contentWindow && oFrame.contentWindow.sap) {
					oFrame.contentWindow.location.reload();
				}
			},

			_createComponent : function () {
				// create component only once
				var sCompId = 'sampleComp-' + this._sId;
				var sCompName = this._sId;

				var oComp = Component.getComponentById(sCompId);

				if (oComp) {
					oComp.destroy();
				}

				return Component.create({
					id: sCompId,
					name: sCompName
				});
			}
		});
	}
);
