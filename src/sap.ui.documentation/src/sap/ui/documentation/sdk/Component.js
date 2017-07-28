/*!
 * ${copyright}
 */

sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"sap/ui/documentation/sdk/model/models",
		"sap/ui/documentation/sdk/controller/ErrorHandler",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/util/DocumentationRouter",
		"sap/ui/documentation/sdk/controller/util/ConfigUtil",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/m/ColumnListItem"
	], function (jQuery, UIComponent, Device, models, ErrorHandler, JSONModel, DocumentationRouter, ConfigUtil, APIInfo, ColumnListItem) {
		"use strict";

		var aTreeContent = [],
			oLibsData = {},
			iTreeModelLimit = 1000000;

		return UIComponent.extend("sap.ui.documentation.sdk.Component", {

			metadata : {
				manifest : "json",
				includes : [
					"css/style.css",
					"thirdparty/google-code-prettify/prettify.css",
					"thirdparty/google-code-prettify/prettify.js",
					"thirdparty/google-code-prettify/lang-css.js"
				]
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * In this method, the device models are set and the router is initialized.
			 * @public
			 * @override
			 */
			init : function () {

				// This promise will be resolved when the api-based models (libsData, treeData) have been loaded
				this._modelsPromise = null;

				this._oErrorHandler = new ErrorHandler(this);

				// set the device model
				this.setModel(models.createDeviceModel(), "device");

				// set the global tree data
				this.setModel(new JSONModel(), "treeData");

				// set the global libs data
				this.setModel(new JSONModel(), "libsData");

				// set the global version data
				this.setModel(new JSONModel(), "versionData");

				// call the base component's init function and create the App view
				UIComponent.prototype.init.apply(this, arguments);

				// create the views based on the url/hash
				this.getRouter().initialize();

				if (Device.system.desktop) {
					// Preload API Info on desktop for faster startup
					this.loadVersionInfo().then(this.fetchAPIInfoAndBindModels.bind(this));
				}

				// Prevents inappropriate focus change which causes ObjectPage to scroll,
				// thus text can be selected and copied
				sap.m.TablePopin.prototype.onfocusin = function () {};
			},

			/**
			 * The component is destroyed by UI5 automatically.
			 * In this method, the ListSelector and ErrorHandler are destroyed.
			 * @public
			 * @override
			 */
			destroy : function () {
				this._oErrorHandler.destroy();
				this._oConfigUtil.destroy();
				this._oConfigUtil = null;
				// call the base component's destroy function
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			/**
			 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
			 * design mode class should be set, which influences the size appearance of some controls.
			 * @public
			 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
			 */
			getContentDensityClass : function() {
				if (this._sContentDensityClass === undefined) {
					// check whether FLP has already set the content density class; do nothing in this case
					if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
						this._sContentDensityClass = "";
					}
					// The default density class for the sap.ui.documentation project will be compact
					this._sContentDensityClass = "sapUiSizeCompact";
				}
				return this._sContentDensityClass;
			},
			getConfigUtil: function() {
				if (!this._oConfigUtil) {
					this._oConfigUtil = new ConfigUtil(this);
				}
				return this._oConfigUtil;
			},


			// MODELS

			loadVersionInfo: function () {
				if (!this._oVersionInfoPromise) {
					this._oVersionInfoPromise = sap.ui.getVersionInfo({async: true})
						.then(this._bindVersionModel.bind(this));
				}

				return this._oVersionInfoPromise;
			},

			fetchAPIInfoAndBindModels: function () {
				var oVersionModel = this.getModel("versionData"),
					bIsInternalVersion = oVersionModel.getProperty("/isInternal"),
					aLibraries = oVersionModel.getProperty("/libraries");

				if (this._modelsPromise) {
					return this._modelsPromise;
				}

				this._modelsPromise = new Promise(function (resolve) {
					APIInfo.getAllLibrariesElementsJSONPromise(aLibraries).then(function(aLibsData) {
						aLibsData.forEach(this._parseLibraryElements, this);

						if (aTreeContent.length > 0) {
							aTreeContent.push({
								isSelected: false,
								name : "experimental",
								ref: "#/api/experimental",
								text: "Experimental APIs"
							}, {
								isSelected: false,
								name : "deprecated",
								ref: "#/api/deprecated",
								text: "Deprecated APIs"
							});
						}

						this._addDeprecatedAndExperimentalData(oLibsData, bIsInternalVersion);

						this._bindAllLibsModel(oLibsData);
						this._bindTreeModel(aTreeContent);
						resolve();
					}.bind(this));
				}.bind(this));

				return this._modelsPromise;
			},


			_parseLibraryElements : function (aLibraryElementsJSON) {

				for (var i = 0; i < aLibraryElementsJSON.length; i++) {
					if (!aLibraryElementsJSON[i].children) {
						oLibsData[aLibraryElementsJSON[i].name] = aLibraryElementsJSON[i];
					}

					this._addElementToTreeData(aLibraryElementsJSON[i]);

					if (aLibraryElementsJSON[i].children) {
						this._parseLibraryElements(aLibraryElementsJSON[i].children, true);
					}
				}
			},

			_addElementToTreeData : function (oJSONElement) {
				if (oJSONElement.visibility === "public") {
					if (oJSONElement.kind !== "namespace") {
						var oTreeNode = this._createTreeNode(oJSONElement.basename, oJSONElement.name, oJSONElement.name === this._topicId);
						var sNodeNamespace = oJSONElement.name.substring(0, (oJSONElement.name.indexOf(oJSONElement.basename) - 1));
						var oExistingNodeNamespace = this._findNodeNamespaceInTreeStructure(sNodeNamespace);
						if (oExistingNodeNamespace) {
							if (!oExistingNodeNamespace.nodes) {
								oExistingNodeNamespace.nodes = [];
							}
							oExistingNodeNamespace.nodes.push(oTreeNode);
						} else {
							var oNewNodeNamespace = this._createTreeNode(sNodeNamespace, sNodeNamespace, sNodeNamespace === this._topicId);
							oNewNodeNamespace.nodes = [];
							oNewNodeNamespace.nodes.push(oTreeNode);
							aTreeContent.push(oNewNodeNamespace);

							this._removeDuplicatedNodeFromTree(sNodeNamespace);
						}
					} else {
						var oNewNodeNamespace = this._createTreeNode(oJSONElement.name, oJSONElement.name, oJSONElement.name === this._topicId );
						aTreeContent.push(oNewNodeNamespace);
					}
				}
			},

			_createTreeNode : function (text, name, isSelected) {
				var oTreeNode = {};
				oTreeNode.text = text;
				oTreeNode.name = name;
				oTreeNode.ref = "#/api/" + name;
				oTreeNode.isSelected = isSelected;
				return oTreeNode;
			},

			_findNodeNamespaceInTreeStructure : function (sNodeNamespace, aTreeStructure) {
				aTreeStructure = aTreeStructure || aTreeContent;
				for (var i = 0; i < aTreeStructure.length; i++) {
					var oTreeNode = aTreeStructure[i];
					if (oTreeNode.name === sNodeNamespace) {
						return oTreeNode;
					}
					if (oTreeNode.nodes) {
						var oChildNode = this._findNodeNamespaceInTreeStructure(sNodeNamespace, oTreeNode.nodes);
						if (oChildNode) {
							return oChildNode;
						}
					}
				}
			},

			_removeNodeFromNamespace : function (sNode, oNamespace) {
				for (var i = 0; i < oNamespace.nodes.length; i++) {
					if (oNamespace.nodes[i].text === sNode) {
						oNamespace.nodes.splice(i, 1);
						return;
					}
				}
			},

			_removeDuplicatedNodeFromTree : function (sNodeFullName) {
				if (oLibsData[sNodeFullName]) {
					var sNodeNamespace = sNodeFullName.substring(0, sNodeFullName.lastIndexOf("."));
					var oNamespace = this._findNodeNamespaceInTreeStructure(sNodeNamespace);
					var sNode = sNodeFullName.substring(sNodeFullName.lastIndexOf(".") + 1, sNodeFullName.lenght);
					this._removeNodeFromNamespace(sNode, oNamespace);
				}
			},


			_bindAllLibsModel : function (oAllLibsData) {
				var oLibsModel = this.getModel("libsData");
				oLibsModel.setSizeLimit(iTreeModelLimit);
				oLibsModel.setData(oAllLibsData, false /* mo merge with previous data */);
			},

			_bindTreeModel : function (aTreeContent) {
				var treeModel = this.getModel("treeData");
				treeModel.setSizeLimit(iTreeModelLimit);
				treeModel.setData(aTreeContent, false);
			},

			_bindVersionModel : function (oVersionInfo) {
				var sVersion, oVersionInfoData;

				if (!oVersionInfo) {
					return;
				}

				sVersion = oVersionInfo.version;
				oVersionInfoData = {
					versionGav: oVersionInfo.gav,
					version: jQuery.sap.Version(sap.ui.version).getMajor() + "." + jQuery.sap.Version(sap.ui.version).getMinor(),
					fullVersion: sap.ui.version,
					isOpenUI5: oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav),
					isSnapshotVersion: oVersionInfo && oVersionInfo.gav && /snapshot/i.test(oVersionInfo.gav),
					isDevVersion: sVersion.indexOf("SNAPSHOT") > -1 || (sVersion.split(".").length > 1 && parseInt(sVersion.split(".")[1], 10) % 2 === 1),
					isInternal: /internal/i.test(oVersionInfo.name),
					libraries: oVersionInfo.libraries
				};

				this.getModel("versionData").setData(oVersionInfoData, false /* mo merge with previous data */);
			},

			_addDeprecatedAndExperimentalData : function(oLibsData, bIsInternalVersion) {
				var sWithoutVersion = "Without Version";

				oLibsData.deprecated = {
					noVersion : {
						name : sWithoutVersion,
						apis : []
					}
				};

				oLibsData.experimental = {
					noVersion : {
						name : sWithoutVersion,
						apis : []
					}
				};

				/**
				 * @param {String} oDataType - "deprecated" or "experimental"
				 * @param {Object} oEntityObject - the object which contains the data
				 * @param {String} sObjectType - "method" or "event"
				 * @param {String} sSymbolName - the name of the class or namespace to which the data is relevant
				 */
				function addData(oDataType, oEntityObject, sObjectType, sSymbolName) {
					var oData = {
						control : sSymbolName,
						entityName : oEntityObject.name,
						text : oEntityObject[oDataType].text || oEntityObject.description,
						type : sObjectType,
						"static" : !!oEntityObject.static,
						visibility: oEntityObject.visibility
					};

					if (oEntityObject[oDataType].since) {
						var aSince = oEntityObject[oDataType].since.split(".");
						var sVersion = aSince[0] + "." + aSince[1]; // take only major and minor versions

						oData.since = oEntityObject[oDataType].since;

						if (!oLibsData[oDataType][sVersion]) {
							oLibsData[oDataType][sVersion] = {
								name : sVersion,
								apis : []
							};
						}

						oLibsData[oDataType][sVersion].apis.push(oData);
					} else {
						oLibsData[oDataType].noVersion.apis.push(oData);
					}
				}

				function isMethodRestricted(oMethod) {
					return oMethod.visibility === "restricted";
				}

				/* Iterate over the oLibsData object, gather information about all deprecated and experimental
				entities and aggregate it in new properties in oLibsData.
				 */
				Object.keys(oLibsData).forEach(function(sLibName) {
					var sLib = oLibsData[sLibName];

					sLib.methods && sLib.methods.forEach(function(oMethod) {
						var bIsMethodRestricted = isMethodRestricted(oMethod);

						if (bIsMethodRestricted && !bIsInternalVersion) {
							return; /* exclude restricted methods from non-internal version */
						}
						if (oMethod.deprecated) {
							addData("deprecated", oMethod, "methods", sLib.name);
						}

						if (oMethod.experimental) {
							addData("experimental", oMethod, "methods", sLib.name);
						}
					});

					sLib.events && sLib.events.forEach(function(oEvent) {
						if (oEvent.deprecated) {
							addData("deprecated", oEvent, "events", sLib.name);
						}

						if (oEvent.experimental) {
							addData("experimental", oEvent, "events", sLib.name);
						}
					});
				});
			}
		});
	}
);