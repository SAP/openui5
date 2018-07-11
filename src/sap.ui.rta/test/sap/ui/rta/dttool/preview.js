sap.ui.define([
    "sap/ui/dt/DragDropUtil",
    "sap/ui/core/postmessage/Bus",
    "sap/ui/fl/FakeLrepConnectorLocalStorage",
    "sap/ui/fl/Utils",
    "sap/ui/rta/RuntimeAuthoring"
], function (
    DragDropUtil,
    PostMessageBus,
    FakeLrepConnectorLocalStorage,
    Utils,
    RuntimeAuthoring
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

        if (this.oUiComponent) {
            this.oUiComponent.destroy();
        }
        if (this.oUiComponentContainer) {
            this.oUiComponentContainer.destroy();
        }

        this.oOutlineProvider = null;

        FakeLrepConnectorLocalStorage.enableFakeConnector({
            "isProductiveSystem": true
        });

        Utils.checkControlId = function() {
            return true;
        };

        var sCompId = "sampleComp-" + sCompName;

        this.oUiComponent = sap.ui.getCore().createComponent({
            id : sCompId,
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

        this.oRta = new RuntimeAuthoring({
            rootControl: this.oUiComponent.getRootControl(),
            flexSettings: {
                developerMode: false
            }
        });

        this.oRta.getService("selection").then(function (oSelectionManager) {
            this.oSelectionManager = oSelectionManager;
        }.bind(this));

        this.oRta.setShowToolbars(false);
        var mPlugins = this.oRta.getDefaultPlugins();
        this.oRta.setPlugins(mPlugins);
        this.oRta.attachEvent("start", this.onRTAStarted, this);
        this.oRta.start();

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

    Preview.startRTA = function () {
        if (this.oRta) {
            this.oRta.start();
        }
    };
    Preview.stopRTA = function () {
        if (this.oRta) {
            this.oRta.stop(true);
        }

        oPostMessageBus.publish({
            target : window.parent,
            origin : window.parent.origin,
            channelId : "dtTool",
            eventId : "updateDesignTimeFile",
            data : {}
        });
    };



    Preview.onRTAStarted = function () {

        if (!this.oDesignTime || this.oDesignTime.getId() !== this.oRta._oDesignTime.getId()) {
            this.oDesignTime = this.oRta._oDesignTime;
        }

        this.oDesignTime.attachSelectionChange(this.onOverlaySelected, this);

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
    };

    Preview.onElementModified = function (oEvent) {

        this.oProperties = oEvent && oEvent.getParameters() && oEvent.getParameters().command && oEvent.getParameters().command.mProperties;

        setTimeout(function () {

            if (this.oProperties && this.oProperties.changeType) {

                if (
                    this.oProperties.changeType === "rename" &&
                    this.oProperties.renamedElement &&
                    this.oProperties.renamedElement.mProperties &&
                    this.oProperties.selector &&
                    this.oProperties.selector.controlType &&
                    this.oProperties.selector.controlType.match(/(.*)\..*$/) &&
                    this.oProperties.selector.controlType.match(/(.*)\..*$/)[1]
                )  {

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
                    var oElement = this.oProperties.movedElements[0].element;
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
                        var oElement = oComand.mProperties.movedElements[0].element;
                        this.updateOutline(oElement);
                        return true;
                    } else if (oComand.mProperties.changeType === "hideControl" &&
                        oComand.mProperties.removedElement) {
                        var oElement = oComand.mProperties.removedElement;
                        this.updateOutline(oElement);
                        return true;
                    }
                });
            }
        }, 0);
    };

    Preview.updateOutline = function (oElement, bNotify) {

        var oOverlay = this.getOverlayByElement(oElement);

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

    Preview.getOverlayByElement = function (oElement) {

        var oOverlay;

        this.oDesignTime.getElementOverlays().some(function (oElementOverlay) {
            if (oElementOverlay.getElement().getId() === oElement.getId()) {
                oOverlay = oElementOverlay;
                return true;
            }
        });
        return oOverlay;
    };

    Preview.loadOutline = function (oEvent) {

        var sId = oEvent.data.id,
            iDepth = oEvent.depth;

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

    Preview.onOverlaySelected = function (oEvent) {

        if (oEvent.getParameter("selection")[0] && oEvent.getParameter("selection")[0] != this.oLastSelection) {

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

        } else if (oEvent.getParameter("selection")[0]) {

            oPostMessageBus.publish({
                target : window.parent,
                origin : window.parent.origin,
                channelId : "dtTool",
                eventId : "selectOverlayInOutline",
                data : {
                    id : oEvent.getParameter("selection")[0].getId()
                }
            });
        }
    };
    Preview.propertyChange = function (oEvent) {

        var sPropertyName = oEvent.data.propertyName,
            vNewValue = oEvent.data.newValue;

        var oElement = this.getSelection().getElement();
        var aMatch = sPropertyName.match(/(.)(.*)/);
        var sMethodName = "set" + aMatch[1].toUpperCase() + aMatch[2];

        if (oElement[sMethodName]) {
            oElement[sMethodName](vNewValue);
        }

        if (sPropertyName === "text" || sPropertyName === "title" || sPropertyName === "label") {

            oPostMessageBus.publish({
                target : window.parent,
                origin : window.parent.origin,
                channelId : "dtTool",
                eventId : "updateOutline",
                data : {
                    id : oElement.getId()
                }
            });
        }
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

        var sClassName = oEvent.data.className,
            sModule = oEvent.data.module;

        if (sModule) {

            jQuery.sap.loadResource(jQuery.sap.loadResource("sap/m/designtime/Button.create.fragment.xml"), {async: true}).then( function(oDocument) {
                if (oDocument && oDocument.documentElement) {
                    this.oDragElement = sap.ui.xmlfragment({
                        fragmentContent: oDocument.documentElement
                    });
                    if (this.oDragElement.getMetadata().getName() !== sClassName) {
                        jQuery.sap.log.error("Expected instance of " + sClassName + " as root element in" + sModule + " but found " + this.oDragElement.getMetadata().getName());
                    }
                    DragDropUtil.startDragWithElement(this.oDragElement, this.oDesignTime);
                }
            });

            //  sap.ui.xmlfragment(sModule.replace(/\//g, ".").replace(".fragment.xml",""));
            // if (this.oDragElement.getMetadata().getName() !== sClassName) {
            // 	jQuery.sap.log.error("Expected instance of " + sClassName + " as root element in" + sModule + " but found " + this.oDragElement.getMetadata().getName());
            // }
            // DragDropUtil.startDragWithElement(this.oDragElement, oDt);
        } else {
            this.getClass(sClassName).then(function (aResults) {
                var Constructor = aResults;
                this.oDragElement = new Constructor();
                if (this.oDragElement.setText) {
                    this.oDragElement.setText("text");
                } else if (this.oDragElement.setSrc) {
                    this.oDragElement.setSrc("sap-icon://dishwasher");
                }

                DragDropUtil.startDragWithElement(this.oDragElement, this.oDesignTime);
            }.bind(this));
        }
    };

    Preview.dragEnd = function () {
        if (this.oDragElement) {
            DragDropUtil.dropElement(this.oDragElement, this.oDesignTime);
            var oOverlay = this.getOverlayByElement(this.oDragElement);

            if (!(oOverlay && oOverlay.getParent())) {
                oOverlay.destroy();
                return;
            }

            this.updateOutline(this.oDragElement, true);
            oOverlay.setSelectable(true);
            this.oSelectionManager.set(oOverlay);
        }
    };

    Preview.outlineUpdated = function () {
        if (this.oDragElement) {
            oPostMessageBus.publish({
                target : window.parent,
                origin : window.parent.origin,
                channelId : "dtTool",
                eventId : "selectOverlayInOutline",
                data : {
                    id : this.oDragElement.getId()
                }
            });
            this.oDragElement = null;
        }
    };

    Preview.getClass = function (sClassName) {
        var oClass = jQuery.sap.getObject(sClassName);

        return new Promise(function (resolve, reject) {
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
        } else {
            this.oSelectionManager.set(this.oLastSelection);
            return this.oLastSelection;
        }
    };

    return Preview;
});








