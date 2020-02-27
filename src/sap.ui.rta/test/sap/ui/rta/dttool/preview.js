sap.ui.define([
	"sap/ui/rta/dttool/util/DragDropUtil",
	"sap/ui/core/postmessage/Bus",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/dttool/plugins/OutsideElementMover",
	"sap/ui/rta/dttool/plugins/OutsideDragDrop",
	"sap/base/util/ObjectPath",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/uid"
], function (
	DragDropUtil,
	PostMessageBus,
	FakeLrepConnectorLocalStorage,
	Layer,
	Utils,
	RuntimeAuthoring,
	OverlayRegistry,
	CommandFactory,
	OutsideElementMover,
	OutsideDragDrop,
	ObjectPath,
	LoaderExtensions,
	uid
) {
	"use strict";
	var Preview = {};
	var oPostMessageBus = PostMessageBus.getInstance();

	Preview.loadComponent = function(oEvent) {
		var sCompName = oEvent.data.compName;

		if (this.oRta) {
			this.oRta.stop(true);
		}

		oPostMessageBus.publish({
			target : window.parent,
			origin : window.parent.origin,
			channelId : "dtTool",
			eventId : "updatePropertyPanel",
			data : {}
		});

		var fnEnsureXMLNodeStableIds = function ($XML) {
			if (!$XML.id) {
				$XML.id = uid();
			}
			if ($XML.childNodes) {
				Array.prototype.slice.call($XML.childNodes).forEach(fnEnsureXMLNodeStableIds);
			}
			return $XML;
		};

		// TODO: Temporary solution
		var fnLoaderExtensionsOriginal = LoaderExtensions.loadResource;
		LoaderExtensions.loadResource = function(sModuleName, mOptions) {
			if (typeof sModuleName === "string" && sModuleName.indexOf("create"/*"create.fragment.xml"*/) > -1 && !mOptions.async) {
				var oDocument = fnLoaderExtensionsOriginal.call(this, sModuleName, {dataType: "xml"});
				return (new XMLSerializer()).serializeToString(fnEnsureXMLNodeStableIds(oDocument));
			}
			return fnLoaderExtensionsOriginal.apply(this, arguments);
		};

		if (this.oUiComponent) {
			this.oUiComponent.destroy();
			if (this.oRta) {
				this.oRta.destroy();
			}

			if (this.oUiComponentContainer) {
				this.oUiComponentContainer.destroy();
			}

			this.refreshIframe(sCompName);
			oPostMessageBus.publish({
				target : window.parent,
				origin : window.parent.origin,
				channelId : "dtTool",
				eventId : "newRTA",
				data : {}
			});
		} else {
			this.refreshIframe(sCompName);
		}

		this.oOutlineProvider = null;

		FakeLrepConnectorLocalStorage.enableFakeConnector({
			isProductiveSystem: true
		});

		Utils.checkControlId = function() {
			return true;
		};
	};

	Preview.refreshIframe = function(sCompName) {
		this.sCompId = "sampleComp-" + sCompName;

		this.oUiComponent = sap.ui.getCore().createComponent({
			id : this.sCompId,
			name : sCompName
		});

		var oMetadata = this.oUiComponent.getMetadata();
		var oConfig = (oMetadata) ? oMetadata.getConfig() : null;
		var aFiles = oConfig && oConfig.sample && oConfig.sample.files;

		oPostMessageBus.publish({
			target : window.parent,
			origin : window.parent.origin,
			channelId : "dtTool",
			eventId : "files",
			data : {
				files : aFiles
			}
		});

		this.oUiComponentContainer = new sap.ui.core.ComponentContainer({
			height: "100%",
			component: this.oUiComponent
		}).placeAt("content");

		this.setupRTA();

		oPostMessageBus.publish({
			target : window.parent,
			origin : window.parent.origin,
			channelId : "dtTool",
			eventId : "loadLibs",
			data : {
				libs : Object.keys(sap.ui.getCore().getLoadedLibraries())
			}
		});
	};

	/**
	 * 	used to restart RTA => toggle RTA
	 */
	Preview.setupRTA = function () {
		this.oRta = new RuntimeAuthoring({
			rootControl: this.oUiComponent.getRootControl(),
			flexSettings: {
				developerMode: true
			},
			showToolbars: false
		});

		this.oRta.getService("selection").then(function (oSelectionManager) {
			this.oSelectionManager = oSelectionManager;
		}.bind(this));

		//Add the custom plugin that handles drag & drop from outside
		var oCommandFactory = new CommandFactory({
			flexSettings: {
				layer: Layer.VENDOR
			}
		});
		var oOutsideElementMover = new OutsideElementMover({
			commandFactory: oCommandFactory
		});
		var mPlugins = this.oRta.getDefaultPlugins();
		var mPluginExtension = {
			dragDrop: new OutsideDragDrop({
				elementMover: oOutsideElementMover,
				commandFactory: oCommandFactory,
				dragStarted: this.oRta._handleStopCutPaste.bind(this.oRta)
			})
		};
		var mExtendedPlugins = Object.assign({}, mPlugins, mPluginExtension);
		this.oRta.setPlugins(mExtendedPlugins);

		this.oRta.attachEvent("start", this.onRTAStarted, this);
		this.oRta.start();
	};

	Preview.startRTA = function () {
		if (!this.oRta) {
			this.setupRTA();
		}
	};

	Preview.stopRTA = function () {
		if (this.oRta) {
			this.oRta.attachEvent('stop', function() {
				this.oRta.destroy();
				delete this.oRta;
			}.bind(this));
			this.oRta.stop();
		}

		//Close files inside code editor
		oPostMessageBus.publish({
			target : window.parent,
			origin : window.parent.origin,
			channelId : "dtTool",
			eventId : "updateDesignTimeFile",
			data : {}
		});

		oPostMessageBus.publish({
			target : window.parent,
			origin : window.parent.origin,
			channelId : "dtTool",
			eventId : "updatePropertyFile",
			data : {}
		});

		this.checkUndoRedo(true);
	};



	Preview.onRTAStarted = function () {
		this.oUiComponent.getRootControl().loaded().then(function() {
			if (!this.oDesignTime || this.oDesignTime.getId() !== this.oRta._oDesignTime.getId()) {
				this.oDesignTime = this.oRta._oDesignTime;
			}

			this.oDesignTime.getSelectionManager().attachChange(this.onOverlaySelected, this);
			window._oRTA = this.oRta;
			oPostMessageBus.publish({
				target : window.parent,
				origin : window.parent.origin,
				channelId : "dtTool",
				eventId : "RTAstarted",
				data : {}
			});

			Object.keys(this.oRta.getPlugins()).forEach(function(sPluginName) {
				if (this.oRta.getPlugins()[sPluginName].attachElementModified) {
					this.oRta.getPlugins()[sPluginName].attachElementModified(this.onElementModified, this);
				}
			}.bind(this));

			this.oRta.attachUndoRedoStackModified(function () {
				this.checkUndoRedo();
			}.bind(this));
		}.bind(this));
	};

	Preview.onElementModified = function (oEvent) {
		this.oProperties = oEvent && oEvent.getParameters() && oEvent.getParameters().command && oEvent.getParameters().command.mProperties;

		setTimeout(function () {
			var oElement;
			if (this.oProperties && this.oProperties.changeType) {
				if (
					this.oProperties.changeType === "rename" &&
					this.oProperties.renamedElement &&
					this.oProperties.renamedElement.mProperties &&
					this.oProperties.selector &&
					this.oProperties.selector.controlType &&
					this.oProperties.selector.controlType.match(/(.*)\..*$/) &&
					this.oProperties.selector.controlType.match(/(.*)\..*$/)[1]
				) {
					oPostMessageBus.publish({
						target : window.parent,
						origin : window.parent.origin,
						channelId : "dtTool",
						eventId : "updatePropertyPanel",
						data : {
							properties : this.oProperties.renamedElement.mProperties
						}
					});
				} else if (
					this.oProperties.changeType === "moveControls" &&
					this.oProperties.movedElements &&
					this.oProperties.movedElements[0] &&
					this.oProperties.movedElements[0].element
				) {
					oElement = this.oProperties.movedElements[0].element;
					this.updateOutline(oElement);
				}

				this.oProperties = null;
			} else if (
				oEvent.getParameters() &&
				oEvent.getParameters().command &&
				oEvent.getParameters().command.getCommands()
			) {
				oEvent.getParameters().command.getCommands().some(function (oComand) {
					if (
						oComand.mProperties.changeType === "moveControls" &&
						oComand.mProperties.movedElements &&
						oComand.mProperties.movedElements[0] &&
						oComand.mProperties.movedElements[0].element
					) {
						oElement = oComand.mProperties.movedElements[0].element;
						this.updateOutline(oElement);
						return true;
					} else if (oComand.mProperties.changeType === "hideControl" &&
						oComand.mProperties.removedElement) {
						oElement = oComand.mProperties.removedElement;
						this.updateOutline(oElement);
						return true;
					}
				});
			}
		}, 0);
	};

	Preview.updateOutline = function (oElement, bNotify) {
		var oOverlay = OverlayRegistry.getOverlay(this.oDragElement);

		var sOverlayId;

		if (oOverlay.getParent() && oOverlay.getParent().getMetadata().getName() === "sap.ui.dt.ElementOverlay") {
			sOverlayId = oOverlay.getParent().getElement().getId();
		} else if (oOverlay.getParent() && oOverlay.getParent().getParent()) {
			sOverlayId = oOverlay.getParent().getParent().getElement().getId();
		} else {
			return;
		}

		oPostMessageBus.publish({
			target : window.parent,
			origin : window.parent.origin,
			channelId : "dtTool",
			eventId : "updateOutline",
			data : {
				id : sOverlayId,
				notify : bNotify
			}
		});
	};

	Preview.loadOutline = function (oEvent) {
		var sId = oEvent.data.id;
		var iDepth = oEvent.depth;

		if (!this.oOutlineProvider) {
			this.oRta.getService("outline").then(function (oOutline) {
			// oRta.getToolFacade("outline", undefined, fnDataFunc).then(function (oOutline) {
				this.oOutlineProvider = oOutline;
				this.oOutlineProvider.get(sId, iDepth).then(function (oOutlineModelData) {
					oPostMessageBus.publish({
						target : window.parent,
						origin : window.parent.origin,
						channelId : "dtTool",
						eventId : "outline",
						data : {
							outline : oOutlineModelData
						}
					});
				});
			});
		} else {
			this.oOutlineProvider.get(sId, iDepth).then(function (oOutlineModelData) {
				oPostMessageBus.publish({
					target : window.parent,
					origin : window.parent.origin,
					channelId : "dtTool",
					eventId : "outline",
					data : {
						outline : oOutlineModelData
					}
				});
			});
		}
	};

	Preview.getOverlayActions = function (sElementId) {
		var oActions = OverlayRegistry.getOverlay(sElementId).getDesignTimeMetadata().getData().actions || {};
		//Filter complex action parameters to pass them through the PostMessageBus
		//This is necessary to remove properties like domRef which can sometimes be present on an action
		Object.keys(oActions).forEach(function (oActionKey) {
			Object.keys(oActions[oActionKey]).forEach(function (oActionParameterKey) {
				var sActionParameterType = typeof oActions[oActionKey][oActionParameterKey];
				if (sActionParameterType === "function") {
					oActions[oActionKey][oActionParameterKey] = "Function";
				} else if (sActionParameterType === "object" && oActions[oActionKey][oActionParameterKey] !== null) {
					oActions[oActionKey][oActionParameterKey] = "Object";
				}
			});
		});
		return oActions;
	};

	Preview.onOverlaySelected = function (oEvent) {
		if (oEvent.getParameter("selection")[0] && oEvent.getParameter("selection")[0] !== this.oLastSelection) {
			this.oLastSelection = oEvent.getParameter("selection")[0];

			var sId = this.oLastSelection.getElement().getId();

			oPostMessageBus.publish({
				target : window.parent,
				origin : window.parent.origin,
				channelId : "dtTool",
				eventId : "selectOverlayInOutline",
				data : {
					id : sId
				}
			});

			var oElement = this.oLastSelection.getElementInstance();
			var oSettings = oElement.data("sap-ui-custom-settings");

			var sName;

			if (oSettings && oSettings["sap.ui.dt"] && oSettings["sap.ui.dt"].is) {
				sName = oSettings["sap.ui.dt"].is;
			} else {
				sName = oElement.getMetadata().getName();
			}

			var sDTModule = oElement.getMetadata()._oDesignTime;

			if (sDTModule && sDTModule.designtimeModule) {
				sDTModule = sDTModule.designtimeModule;
			}

			oPostMessageBus.publish({
				target : window.parent,
				origin : window.parent.origin,
				channelId : "dtTool",
				eventId : "updateDesignTimeFile",
				data : JSON.parse(JSON.stringify({
					name : sName,
					module : sDTModule
				}))
			});

			oPostMessageBus.publish({
				target : window.parent,
				origin : window.parent.origin,
				channelId : "dtTool",
				eventId : "updatePropertyFile",
				data : {
					actions: this.getOverlayActions(oElement.getId()),
					id: oElement.getId()
				}
			});
		}
	};
	Preview.propertyChange = function (oEvent) {
		var sPropertyName = oEvent.data.propertyName;
		var vNewValue = oEvent.data.newValue;

		var oElement = this.getSelection().getElement();
		var aMatch = sPropertyName.match(/(.)(.*)/);
		var sMethodName = "set" + aMatch[1].toUpperCase() + aMatch[2];

		if (oElement[sMethodName]) {
			oElement[sMethodName](vNewValue);
		}

		oPostMessageBus.publish({
			target : window.parent,
			origin : window.parent.origin,
			channelId : "dtTool",
			eventId : "updatePropertyFile",
			data : {
				actions: this.getOverlayActions(oElement.getId()),
				id: oElement.getId()
			}
		});
	};

	Preview.editorDTData = function (oEvent) {
		var oEditorDTData = oEvent.data.dtData;

		var oElement = this.getSelection().getElement();

		var oMetadata = oElement.getMetadata();

		oEditorDTData = jQuery.extend({
			designtimeModule : oMetadata._oDesignTime && oMetadata._oDesignTime.designtimeModule || "fake_" + oMetadata.getLibraryName().replace(/\./g, "/") + "/designtime/" + oMetadata.getName().match(/.+\.(\w+)$/)[1] + ".designtime.js",
			_oLib : oMetadata._oDesignTime && oMetadata._oDesignTime._oLib
		}, oEditorDTData);

		oMetadata._oDesignTime = oEditorDTData;
		oMetadata._oDesignTimePromise = null;

		oMetadata.loadDesignTime(oElement).then(function (oDTData) {
			oPostMessageBus.publish({
				target : window.parent,
				origin : window.parent.origin,
				channelId : "dtTool",
				eventId : "dtData",
				data : {
					dtData : JSON.parse(JSON.stringify(oDTData))
				}
			});

			oPostMessageBus.publish({
				target : window.parent,
				origin : window.parent.origin,
				channelId : "dtTool",
				eventId : "updatePropertyPanel",
				data : {
					properties : oElement.mProperties
				}
			});
		});
	};

	Preview.dragStart = function (oEvent) {
		var sClassName = oEvent.data.className;

		this.getClass(sClassName).then(function (aResults) {
			var Constructor = aResults;
			this.oDragElement = sap.ui.getCore().getComponent(this.sCompId).runAsOwner(function () {
				return new Constructor();
			});
			this.oDragElement
				.placeAt("dragDropContainer")
				.addEventDelegate({
					onAfterRendering: function () {
						DragDropUtil.startDragWithElement(this.oDragElement, this.oRta, oEvent);
					}.bind(this)
				});
		}.bind(this));
	};

	Preview.dragEnd = function () {
		if (!this.oDragElement) {
			return;
		}
		DragDropUtil.dropElement(this.oDragElement, this.oRta);
		delete this.oDragElement;
	};

	Preview.getClass = function (sClassName) {
		var oClass = ObjectPath.get(sClassName);

		return new Promise(function (resolve) {
			if (oClass) {
				resolve(oClass);
			} else {
				sap.ui.require([sClassName.replace(/\./g, "/")], function (Class) {
					resolve(Class);
				});
			}
		});
	};

	Preview.getSelection = function () {
		if (this.oSelectionManager.get()[0]) {
			return this.oSelectionManager.get()[0];
		}

		this.oSelectionManager.set(this.oLastSelection);
		return this.oLastSelection;
	};

	Preview.undo = function () {
		if (this.oRta) {
			this.oRta.undo();
		}
	};

	Preview.redo = function () {
		if (this.oRta) {
			this.oRta.redo();
		}
	};

	Preview.checkUndoRedo = function (bRtaStopped) {
		oPostMessageBus.publish({
			target : window.parent,
			origin : window.parent.origin,
			channelId : "dtTool",
			eventId : "setUndoRedo",
			data : {
				bCanUndo: this.oRta && !bRtaStopped ? this.oRta.canUndo() : false,
				bCanRedo: this.oRta && !bRtaStopped ? this.oRta.canRedo() : false
			}
		});
	};

	return Preview;
});








