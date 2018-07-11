sap.ui.define([
	"jquery.sap.global",
	"sap/ui/rta/dttool/controller/BaseController",
	"sap/ui/rta/dttool/DTMetadata",
	'sap/ui/rta/Client',
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/MessageToast",
	"sap/ui/core/postmessage/Bus"
], function (
	jQuery,
	BaseController,
	DTMetadata,
	RTAClient,
	JSONModel,
	Filter,
	FilterOperator,
	Dialog,
	Button,
	Label,
	Input,
	MessageToast,
	PostMessageBus
) {
	"use strict";
	return BaseController.extend("sap.ui.rta.dttool.controller.App", {

		/**
		 * fomats a palette image source path
		 * @param {string} sValue the source path
		 * @returns {string} the formatted source path
		 */
		formatter : function (sValue) {
			if (sValue) {
				return jQuery.sap.getResourcePath(sValue);
			}
			return "";
		},



		onInit : function () {
			// 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288

			this.oPostMessageBus = PostMessageBus.getInstance();

			if (window.location.pathname.endsWith("integration/opaTest.qunit.html")) {
				jQuery(document).ready( function () {
					setTimeout(function () {
						jQuery("#__component0---app--theIFrame").attr("src", "./../preview.html?sap-ui-rta-minimenu=false");
					}, 0);
				});
			}

			jQuery(window).resize(this.onSplitterResize);

			this.oPostMessageBus.subscribe("dtTool", "iFrameReady", this.onIFrameReady, this)
				.subscribe("dtTool", "RTAstarted", this.onRTAstarted, this)
				.subscribe("dtTool", "selectOverlayInOutline", this.onSelectOverlayInOutline, this)
				.subscribe("dtTool", "updatePropertyPanel", this.onUpdatePropertyPanel, this)
				.subscribe("dtTool", "loadLibs", this.onLoadLibs, this)
				.subscribe("dtTool", "updateOutline", this.onUpdateOutline, this)
				.subscribe("dtTool", "dtData", this.onDTData, this);

            var oModel = new JSONModel();

            var oView = this.getView();
            oView.setModel(oModel, "outline");
            oView.byId("Tree").setBusy(true);

            var oPropModel = new JSONModel();
            oView.setModel(oPropModel, "properties");
            oView.byId("PropertyPanel").setBusy(true);

            var oPaletteModel = new JSONModel();
            oView.setModel(oPaletteModel, "palette");
            oView.byId("palette").setBusy(true);

        },

		/**
		 * Called, when the iFrame is ready to receive Messages
		 */
		onIFrameReady : function () {
			this.oRTAClient = new RTAClient({
				window: this.getIFrameWindow(),
				origin: this.getIFrameWindow().location.origin
			});

		},


		/**
		 * called when a palette item is dragged
		 * @param {object} oPaletteDomRef the dom ref of the dragged palette item
		 * @param {sap.ui.base.Event} oEvent the dragstart event
		 */
		onDragStart : function (oPaletteDomRef, oEvent) {

			oEvent.stopPropagation();

			var oItemDom = window.document.activeElement;
			if (oItemDom.tagName === "TR" && oItemDom.id) {
				var oItem = sap.ui.getCore().byId(oItemDom.id);

				if (oItem) {
					var oContext = oItem.getBindingContext("palette");
					var sClassName = oContext.getProperty("className");
					if (oContext.getProperty("is")) {
						sClassName = oContext.getProperty("is");
					}

					var oData = {
						className : sClassName
					};

					if (oContext.getProperty("NOPEcreateTemplate")) {
						jQuery.extend(oData, {
							module : oContext.getProperty("createTemplate")
						});
					}

					this.oPostMessageBus.publish({
						target : this.getIFrameWindow(),
						origin : this.getIFrameWindow().origin,
						channelId : "dtTool",
						eventId : "dragStart",
						data : oData
					});
				}
				oPaletteDomRef.addEventListener("dragend", this.onDragEnd.bind(this));
			}
		},


        /**
         *  Called when selecting an Item in the Switch
         *  Load Samples
         * */
        //TODO Create Model with Sample Libaries
        goToPage : function(oEvent) {

            var oItemSelected = oEvent.getParameters().selectedItem;
            var sItemSelected = oItemSelected.getText();


            var oHashChanger = new sap.ui.core.routing.HashChanger();
            oHashChanger.setHash("sample/" + sItemSelected);
        },

        /**
         * Used to expand the Palette when you click on the Toolbar
         * not only on the arrow
         */
        expandPallete : function(oEvent) {

            var oCustomListItem = oEvent.getSource().getParent().getParent();
            var oLib = this._getPaletteModel().getObject(oCustomListItem.getBindingContextPath());
            var sLib = oLib.groupName;

                DTMetadata.loadLibraries([sLib]).then(function(mLibData, oModel) {
                    var oPaletteData = Object.keys(mLibData[sLib]).reduce(function (oFilteredData, sKey) {

                        if (mLibData[sLib][sKey].palette && mLibData[sLib][sKey].palette.group && !mLibData[sLib][sKey].palette.ignore) {

                            var sGroup = mLibData[sLib][sKey].palette.group.toLowerCase();

                            var oControlData = {
                                icon : mLibData[sLib][sKey].palette.icons ? mLibData[sLib][sKey].palette.icons.svg : "",
                                name : mLibData[sLib][sKey].displayName.singular,
                                description : mLibData[sLib][sKey].descriptions ? "" + mLibData[sLib][sKey].descriptions.short.match(/[^\n\r]*/) : "",
                                className : mLibData[sLib][sKey].className,
                                createTemplate : mLibData[sLib][sKey].templates && mLibData[sLib][sKey].templates.create
                            };

                            if (!oFilteredData.groups.some(function (oGroup) {
                                if (oGroup.groupName === sGroup) {
                                    oGroup.controls.push(oControlData);
                                    oGroup.number++;
                                    return true;
                                }
                            })) {
                                oFilteredData.groups.push({
                                    groupName : sGroup,
                                    number : 1,
                                    controls : [oControlData]
                                });
                            }
                        }
                        return oFilteredData;
                    }, Object.keys(this._getPaletteModel().getData()).length === 0 ? {groups : []} : this._getPaletteModel().getData());

                    this._getPaletteModel().setProperty("/", oPaletteData);

                    // var oPalette = this.getView().byId("palette");

                }.bind(this));




            var isExpanded = oEvent.getSource().getParent().getExpanded();
            oEvent.getSource().getParent().setExpanded(!isExpanded);

        },

        /**
         *
         * Used to expand the outline when you click on the item
         * not only on the arrow
         */
        expandOutline : function(oEvent) {
            // var isExpanded = oEvent.getSource().getParent().getExpanded();
            this.byId("Tree").fireToggleOpenState();

        },

		/**
		 * Called when the dragged palette item is dropped
		 */
		onDragEnd : function () {

			this.oPostMessageBus.publish({
				target : this.getIFrameWindow(),
				origin : this.getIFrameWindow().origin,
				channelId : "dtTool",
				eventId : "dragEnd",
				data : {}
			});
		},

		/**
		 * Called when splitter or window is resized
		 * Workaround because Splitter takes up more space than it should and doesn't fire resize events in all cases
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onSplitterResize : function (oEvent) {
			jQuery(".sapUiDtToolSplitter").css("height", window.innerHeight - parseInt(jQuery(".sapMPageHeader").css("height"), 10) + "px");
		},

		/**
		 * Called when the tree selection changes
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onSelectionChange : function (oEvent) {
			var sId = oEvent.getParameter("listItem").data().id;

			var oModel = this._getOutlineModel();
			var sPath = this.findOverlayInOutline(sId, oModel.getData());

			if (oModel.getProperty(sPath).type === "aggregation") {
				sId = oModel.getProperty(sPath.match(/(.*)\/elements\/\d+$/)[1]).id;
			}

			this.oRTAClient.getService("selection").then(function (oSelectionManager) {
				oSelectionManager.set(sId);
			});
		},

		/**
		 * Loads DTData of all loaded libraries
		 * @param {object} oEvent the event
		 * @param {string[]} oEvent.data.libs the libraries
		 */
		onLoadLibs : function (oEvent) {

            var aLibs = oEvent.data.libs;
            aLibs = ["sap.m"];
            // aLibs.splice(0, aLibs.length - 2);
            //
            // var oLibraryNames = {
            //     groups : []
            // };
            // aLibs.reduce(function (iCounter, sLib) {
            //     oLibraryNames.groups.push({
            //         number: iCounter,
            //         groupName: sLib,
            //         controls: []
            //     });
            //     iCounter++;
            //     return iCounter;
            // }, 1);


			aLibs.map(function (sLib) {
				DTMetadata.loadLibraries([sLib]).then(function(mLibData, oModel) {
					var oPaletteData = Object.keys(mLibData[sLib]).reduce(function (oFilteredData, sKey) {
						if (mLibData[sLib][sKey].palette && mLibData[sLib][sKey].palette.group && !mLibData[sLib][sKey].palette.ignore) {

							var sGroup = mLibData[sLib][sKey].palette.group.toLowerCase();

							var oControlData = {
								icon : mLibData[sLib][sKey].palette.icons ? mLibData[sLib][sKey].palette.icons.svg : "",
								name : mLibData[sLib][sKey].displayName.singular,
								description : mLibData[sLib][sKey].descriptions ? "" + mLibData[sLib][sKey].descriptions.short.match(/[^\n\r]*/) : "",
								className : mLibData[sLib][sKey].className,
								createTemplate : mLibData[sLib][sKey].templates && mLibData[sLib][sKey].templates.create
							};

							if (!oFilteredData.groups.some(function (oGroup) {
								if (oGroup.groupName === sGroup) {
									oGroup.controls.push(oControlData);
									oGroup.number++;
									return true;
								}
							})) {
								oFilteredData.groups.push({
									groupName : sGroup,
									number : 1,
									controls : [oControlData]
								});
							}
						}
						return oFilteredData;
					}, Object.keys(this._getPaletteModel().getData()).length === 0 ? {groups : []} : this._getPaletteModel().getData());

					this._getPaletteModel().setProperty("/", oPaletteData);

				}.bind(this));
			}.bind(this));

            // this._getPaletteModel().setProperty("/", oPaletteData);

            var oPalette = this.getView().byId("palette");
            oPalette.setBusy(false);

            this.setDraggable();
		},

		/**
		 * Makes all palette entry dom refs draggable by setting draggable = true and adding an Event Listener
		 */
		setDraggable : function () {
			setTimeout(function () {
				var aPaletteDomRefs = this.getPaletteDomRefs();

				aPaletteDomRefs.forEach(function (oPaletteDomRef) {
					if (oPaletteDomRef) {
						oPaletteDomRef.setAttribute("draggable", true);
						oPaletteDomRef.addEventListener("dragstart", this.onDragStart.bind(this, oPaletteDomRef));
					}
				}.bind(this));
			}.bind(this), 0);
		},

		/**
		 * returns the DomRefs of all the palette entries
		 * @returns {array} the DomRefs
		 */
		getPaletteDomRefs : function () {
			return this.byId("palette").getItems().reduce(function (aRefs, oItem) {

				var aSpliceParams = oItem.getContent()[0].getContent()[0].getItems().map(function (oGroupItem) {
					return oGroupItem.getDomRef();
				});

				aSpliceParams.unshift(aRefs.length, 0);

				aRefs.splice.apply(aRefs, aSpliceParams);

				return aRefs;
			}, []);
		},

		/**
		 * Called when the stop/start RTA Button is pressed
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onToggleRTA : function (oEvent) {
			var sEventId = oEvent.getParameter("item").getId().replace(this.getView().getId() + "--", "");

			this.oPostMessageBus.publish({
				target : this.getIFrameWindow(),
				origin : this.getIFrameWindow().origin,
				channelId : "dtTool",
				eventId : sEventId,
				data : {}
			});

			if (sEventId === "stopRTA") {
				this.onUpdatePropertyPanel();
			}
		},

		/**
		 * Called when RTA has started in the iframe
		 */
		onRTAstarted : function  () { // TODO
			this.oRTAClient.getService("outline").then(function (oOutlineProvider) {
				oOutlineProvider.get().then(function (oOutline) {
					var oModel = this._getOutlineModel();
					oModel.setProperty("/", [oOutline[0]]);

                    var oTree = this._getTree();
                    var oPropertyPanel = this._getPropertyPanel();


                    oTree.setBusy(false);
                    oPropertyPanel.setBusy(false);


				}.bind(this));
			}.bind(this));
		},

		/**
		 * Selects an overlay in the outline tree
		 * @param {object} oEvent the event
		 * @param {string} oEvent.data.id the id of the overlay
		 */
		onSelectOverlayInOutline : function (oEvent) {

			var sId = oEvent.data.id;

			var oTree = this._getTree();

			var sPath = this.findOverlayInOutline(sId, this._getOutlineModel().getData());

			if (!sPath) {
				return;
			}

			oTree.setSelectedItemByPath(sPath);



		},

		/**
		 * Updates the Property Panel
		 * @param {object} oEvent the event
		 * @param {object} oEvent.data.properties the properties of the selected element
		 */
		onUpdatePropertyPanel : function (oEvent) {

			if (oEvent && oEvent.data && oEvent.data.properties) {

				var mElmntProps = oEvent.data.properties;

				var oDTData = this._getPropertyModel().getData();

				if (typeof oDTData.displayName === "string") {
					oDTData.displayName = {singular : oDTData.displayName};
				}

				oDTData.propertiesList.forEach(function (oProperty) {
					if (mElmntProps[oProperty.name] !== undefined) {
						jQuery.extend(oProperty, {currentValue : mElmntProps[oProperty.name]});
					} else {
						jQuery.extend(oProperty, {currentValue : oProperty.defaultValue});
					}
				});

				this._getPropertyModel().setProperty("/", oDTData);
			} else {
				this._getPropertyModel().setProperty("/", {});
			}
		},

		/**
		 * Updates the outline starting form a given overlay
		 * @param {object} oEvent the event
		 * @param {string} oEvent.data.id the id of the overlay
		 * @param {boolean} oEvent.data.notify if true the iFrame will be informed when the outline was updated succesfully
		 */
		onUpdateOutline : function (oEvent) {

			var sId = oEvent.data.id,
				bNotify = oEvent.data.notify;

			var oModel = this._getOutlineModel();

			var sPath = this.findOverlayInOutline(sId, oModel.getData());

			this.oRTAClient.getService("outline").then(function (oOutlineProvider) {
				oOutlineProvider.get(sId).then(function (oOutline) {

					oModel.setProperty(sPath, oOutline[0]);
					if (bNotify) {

						this.oPostMessageBus.publish({
							target : this.getIFrameWindow(),
							origin : this.getIFrameWindow().origin,
							channelId : "dtTool",
							eventId : "outlineUpdated",
							data : {}
						});
					}

				}.bind(this));
			}.bind(this));
		},

		/**
		 * Updates the palette and propertie panel with the changed design time data
		 * @param {object} oEvent the event
		 * @param {object} oEvent.data.dtData the dt data
		 */
		onDTData : function (oEvent) {

			var oDTData = oEvent.data.dtData;

			var oPropPanModel = this._getPropertyModel();
			var oData = oPropPanModel.getData();

			var sLib = oDTData.designtimeModule.match(/^(?:fake_)?([\/\w]*)\/designtime/)[1].replace(/\//g, ".");
			var sClassName = sLib + "." + oDTData.designtimeModule.match(/^[\/\w]*\/designtime\/(\w*)/)[1];

			var oRuntimeData = DTMetadata.getRuntimeData(sLib, sClassName, oDTData) || {};

			delete oRuntimeData._element;

			oData = jQuery.extend(true, {}, oRuntimeData, oDTData);

			var oElement = oData._element;
			delete oData._element;

			DTMetadata.translate(oData);
			DTMetadata.createLists(oData);

			oData._element = oElement;

			if (oData.palette) {
				this._updatePalette(oData.palette.group || "CUSTOM", this._mapDataForPalette(oData), oData.palette.ignore);
			}

			oPropPanModel.setProperty("/", oData);
		},

		/**
		 * Opens a dialog which allows importing a control via module path
		 * @param {sap.ui.base.Event} oEvent the add button press event
		 */
		onAddControlToPalette : function (oEvent) {
			var oDialog = new Dialog({
				id: "addControlDialog",
				title: "Add Custom Control",
				content: [
					new Input({
						id: "addDialogInput",
						liveChange: function(oEvent) {

							var sText = oEvent.getParameter("value");

							var oInput = oEvent.getSource();

							if (/^(?:\w+\/)+\w+$/.test(sText)) {
								oInput.getParent().getBeginButton().setEnabled(true);
								oInput.setValueState("None");
								oInput.setValueStateText("");
							} else {
								oInput.getParent().getBeginButton().setEnabled(false);
								oInput.setValueState("Error");
								oInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("invalidModulePath"));
							}
						}.bind(this),
						width: "90%",
						placeholder: "Enter module path..."
					}).addStyleClass("sapUiSmallMargin")
				],
				beginButton: new Button({
					id: "addControlButton",
					text: "Add",
					enabled: false,
					press: function () {
						this.onAddCustomControl.call(this);
						oDialog.close();
					}.bind(this)
				}),
				endButton: new Button({
					text: "Cancel",
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function() {
					oDialog.destroy();
				}
			});

			sap.ui.getCore().byId("addDialogInput").onsapenter = function (oEvent) {

				var sText = oEvent.srcControl.getValue();

				if (/^(?:\w+\/)+\w+$/.test(sText)) {
					this.onAddCustomControl.call(this);
					oDialog.close();
				}
			}.bind(this);

			oDialog.open();
		},

		/**
		 * Loads a control and adds it to the palette
		 */
		onAddCustomControl : function () {
			var sText = sap.ui.getCore().byId("addDialogInput").getValue();

			DTMetadata.loadElement(sText.replace(/\//g, ".")).then(function (oData) {

				if (!oData) {
					MessageToast.show("Failed to load Module " + sText);
				}

				var sGroup;
				var oControlData = {};

				sGroup = oData.palette && oData.palette.group || "CUSTOM";
				oControlData = {
					className : sText.replace(/\//g, "."),
					description : oData.descriptions && oData.descriptions.short,
					icon : oData.palette && oData.palette.icons && oData.palette.icons.svg,
					name : oData.displayName && oData.displayName.singular || sText.replace(/\//g, ".").match(/.+\.(\w+)$/)[1],
					createTemplate : oData.templates && oData.templates.create
				};

				this._updatePalette(sGroup, oControlData);

				this.byId("palette").getItems().some(function (oItem) {
					if (oItem.getContent()[0].getContent()[0].data().group === sGroup.toLowerCase()) {
						oItem.getContent()[0].setExpanded(true);
						return true;
					}
				});

			}.bind(this), function () {
				MessageToast.show("Failed to load Module " + sText);
			});
		},

		/**
		 * maps data to the format required for adding/updating an entry to the palette
		 * @param {object} oControlData the control data for the palette entry
		 * @returns {object} the mapped control data
		 */
		_mapDataForPalette : function (oControlData) {

			var oControlPaletteData = {
				className : oControlData.className,
				description : oControlData.descriptions && oControlData.descriptions.short,
				icon : oControlData.palette.icons && oControlData.palette.icons.svg,
				name : oControlData.displayName.singular,
				createTemplate : oControlData.templates && oControlData.templates.create
			};

			return oControlPaletteData;
		},

		/**
		 * adds a new entry to the palette or updates an existing one
		 * @param {string} sGroup the group of the palette entry
		 * @param {object} oControlPaletteData the data of the palette entry
		 * @param {boolean} bIgnore the ignore property of the palette entry. If true the entry will not be added.
		 */
		_updatePalette : function (sGroup, oControlPaletteData, bIgnore) {

			var oPaletteModel = this._getPaletteModel();
			var oPaletteData = oPaletteModel.getData();

			var bRemoved = false;
			var bAdded = bIgnore;
			var bDontAddListeners = false;

			if (!oPaletteData.groups.some(function (oGroup, iGroupIndex) {

				if (!bRemoved || oGroup.groupName === sGroup.toLowerCase()) {

					if (!oGroup.controls.some(function (oControlData, iControlIndex) {

						if (oControlData.className === oControlPaletteData.className) {
							if (!bAdded && oGroup.groupName === sGroup.toLowerCase()) {
								oPaletteData.groups[iGroupIndex].controls[iControlIndex] = oControlPaletteData;
								bAdded = true;
								bRemoved = true;
								bDontAddListeners = true;
							} else {
								if (oPaletteData.groups[iGroupIndex].controls.length === 1) {
									oPaletteData.groups.splice(iGroupIndex, 1);
								} else {
									oPaletteData.groups[iGroupIndex].controls.splice(iControlIndex, 1);
									oPaletteData.groups[iGroupIndex].number--;
								}
								bRemoved = true;
							}
						}

						return bRemoved && bAdded;

					}) && oGroup.groupName === sGroup.toLowerCase()) {
						oPaletteData.groups[iGroupIndex].controls.push(oControlPaletteData);
						oPaletteData.groups[iGroupIndex].number++;
						bAdded = true;
					}
				}

				return bRemoved && bAdded;
			}) && !bAdded) {
				oPaletteData.groups.push({
					groupName : sGroup.toLowerCase(),
					number : 1,
					controls : [oControlPaletteData]
				});
			}

			oPaletteModel.setProperty("/", oPaletteData);

			!bDontAddListeners && this.setDraggable();
		},

		/**
		 * Finds the path of an overlay with a given id in the outline model
		 * @param {string} sId the overlays id
		 * @param {object[]} aData the model data of the current path
		 * @param {string} sPath the path that is currently being searched
		 * @returns {string} the path of the overlay
		 */
		findOverlayInOutline : function (sId, aData, sPath) {

			if (!sPath) {
				sPath = "/";
			}

			var sCorrectPath = null;

			aData.some(function (oData, iIndex) {
				if (oData.id === sId) {
					sCorrectPath = sPath + iIndex;
					return true;
				} else if (Array.isArray(oData.elements)) {
				    // TODO elements was children before -> how to prevent property changes like this
					sCorrectPath = this.findOverlayInOutline(sId, oData.elements, sPath + iIndex + "/elements/");
					return sCorrectPath;
				}
			}.bind(this), null);

			return sCorrectPath;
		},

		/**
		 * Sends a message to the iFrame when a property was changed via the property pannel
		 * @param {sap.ui.base.Event} oEvent the change event
		 */
		onPropertyChange : function (oEvent) {

			var sPropertyName = oEvent.getSource().getPropertyName();
			var vNewValue = oEvent.getParameter("newValue");

			this.oPostMessageBus.publish({
				target : this.getIFrameWindow(),
				origin : this.getIFrameWindow().origin,
				channelId : "dtTool",
				eventId : "propertyChange",
				data : {
					propertyName : sPropertyName,
					newValue : vNewValue
				}
			});
		},

		/**
		 * Filters the Palette tables and updates the counter in the panel header
		 * @param {sap.ui.base.Event} oEvent the liveSearch event
		 */
		onPaletteSearch : function (oEvent) {

			var aFilter = [];
			var sQuery = oEvent.getParameter("newValue");
			if (sQuery) {
				aFilter.push(new Filter("name", FilterOperator.Contains, sQuery));
			}

			var oNumbs = {};

			this._getPaletteTables().forEach(function (oTable) {
				var oBinding = oTable.getBinding("items");
				oBinding.filter(aFilter);

				if (oBinding.getLength() > 0) {
					oTable.getParent().getParent().setVisible(true);
				}

				oNumbs[oTable.data().group] = oBinding.getLength();
			});

			var oModel = this._getPaletteModel();

			oModel.getProperty("/groups").forEach(function (oGroup, iIndex) {
				oModel.setProperty("/groups/" + iIndex + "/number", oNumbs[oGroup.groupName]);
			});

			this.setDraggable();
		},

		/**
		 * Colapses the last expanded panel when a new panel is expanded
		 * @param {sap.ui.base.Event} oEvent the expand event
		 */
		onPanelExpand : function (oEvent) {

			if (oEvent.getParameter("expand") === false) {
				this.sLastExpandedId = "";
			} else {
				if (this.sLastExpandedId) {
					sap.ui.getCore().byId(this.sLastExpandedId).setExpanded(false);
				}
				this.sLastExpandedId = oEvent.getSource().getId();
				oEvent.getSource().getHeaderToolbar().focus();
			}
		},

		/**
		 * Returns the property model
		 * @returns {sap.ui.model.json.JSONModel} the property model
		 */
		_getPropertyModel : function () {
			if (!this.oPropertyModel) {
				this.oPropertyModel = this.getView().getModel("properties");
			}
			return this.oPropertyModel;
		},


        /**
         * Returns the tree
         * @returns {sap.m.Tree} the tree
         */
        _getPropertyPanel : function () {
            if (!this.oPropertyPanel) {
                this.oPropertyPanel = this.byId("PropertyPanel");
            }
            return this.oPropertyPanel;
        },

		/**
		 * Returns the palette model
		 * @returns {sap.ui.model.json.JSONModel} the palette model
		 */
		_getPaletteModel : function () {
			if (!this.oPaletteModel) {
				this.oPaletteModel = this.getView().getModel("palette");
			}
			return this.oPaletteModel;
		},

		/**
		 * Returns the outline model
		 * @returns {sap.ui.model.json.JSONModel} the outline model
		 */
		_getOutlineModel : function () {
			if (!this.oOutlineModel) {
				this.oOutlineModel = this.getView().getModel("outline");
			}
			return this.oOutlineModel;
		},

		/**
		 * Returns the tree
		 * @returns {sap.m.Tree} the tree
		 */
		_getTree : function () {
			if (!this.oTree) {
				this.oTree = this.byId("Tree");
			}
			return this.oTree;
		},

		/**
		 * Retruns the palette tables
		 * @returns {sap.m.Table[]} the tables
		 */
		_getPaletteTables : function () {
			if (!this.oPaletteTables) {
				this.oPaletteTables = this.byId("palette").getItems().map(function (oItem) {
					return oItem.getContent()[0].getContent()[0];
				});
			}
			return this.oPaletteTables;
		},

		/**
		 * Retruns the palette table header ObjectNumbers
		 * @returns {sap.m.ObjectNumber[]} the numbers
		 */
		_getPaletteNumbers : function () {
			if (!this.oPaletteNumbers) {
				this.oPaletteNumbers = this._getPaletteTables().map(function (oTable) {
					return oTable.getHeaderToolbar().getContent()[2];
				});
			}
			return this.oPaletteNumbers;
		}
	});
});