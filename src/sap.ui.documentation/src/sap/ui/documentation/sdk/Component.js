/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/documentation/sdk/model/models",
    "sap/ui/documentation/sdk/controller/ErrorHandler",
    "sap/ui/model/json/JSONModel",
    "sap/ui/documentation/sdk/controller/util/ConfigUtil",
    "sap/ui/documentation/sdk/controller/util/APIInfo",
    "sap/base/util/Version",
    "sap/ui/VersionInfo",
    // used via manifest.json
	"sap/ui/documentation/sdk/util/DocumentationRouter",
    // implements sap.m.TablePopin
	"sap/m/ColumnListItem"
], function(
    jQuery,
	UIComponent,
	Device,
	models,
	ErrorHandler,
	JSONModel,
	ConfigUtil,
	APIInfo,
	Version,
	VersionInfo /*, DocumentationRouter, ColumnListItem*/
) {
		"use strict";

		var aTreeContent = [],
			oLibsData = {},
			iTreeModelLimit = 1000000;

		return UIComponent.extend("sap.ui.documentation.sdk.Component", {

			metadata : {
				manifest : "json",
				includes : [
					"css/style.css"
				]
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * In this method, the device models are set and the router is initialized.
			 * @public
			 * @override
			 */
			init : function () {

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

				// Load VersionInfo model promise
				this.loadVersionInfo();

				// create the views based on the url/hash
				this.getRouter().initialize();
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
					this._oVersionInfoPromise = VersionInfo.load().then(this._bindVersionModel.bind(this));
				}

				return this._oVersionInfoPromise;
			},

			fetchAPIIndex: function () {
				if (this._indexPromise) {
					return this._indexPromise;
				}

				this._indexPromise = new Promise(function (resolve, reject) {
					APIInfo.getIndexJsonPromise().then(function (aData) {
						this._aLibraryElements = aData;
						this._parseLibraryElements(aData);
						this._bindTreeModel(aTreeContent);
						resolve(aData);
					}.bind(this));
				}.bind(this));

				return this._indexPromise;
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
				var oNewNodeNamespace,
					oHiddenNamespace,
					aAllowedMembers = this.aAllowedMembers;

				if (aAllowedMembers.indexOf(oJSONElement.visibility) !== -1) {
					if (oJSONElement.kind !== "namespace") {
						var aNameParts = oJSONElement.name.split("."),
							sBaseName = aNameParts.pop(),
							sNodeNamespace = aNameParts.join("."), // Note: Array.pop() on the previous line modifies the array itself
							oTreeNode = this._createTreeNode(sBaseName, oJSONElement.name, oJSONElement.name === this._topicId, oJSONElement.lib, !!oJSONElement.deprecated),
							oExistingNodeNamespace = this._findNodeNamespaceInTreeStructure(sNodeNamespace);

						if (oExistingNodeNamespace) {
							if (!oExistingNodeNamespace.nodes) {
								oExistingNodeNamespace.nodes = [];
							}

							oExistingNodeNamespace.nodes.push(oTreeNode);
						} else if (sNodeNamespace) {

							// Check for existing hidden namespace - In case we have a namespace with visibility that
							// we should not show in this scenario we should also omit it's children
							oHiddenNamespace = this._aLibraryElements.some(function (oNode) {
								return oNode.name === sNodeNamespace && aAllowedMembers.indexOf(oNode.visibility) === -1;
							});

							if (!oHiddenNamespace) {
								oNewNodeNamespace = this._createTreeNode(sNodeNamespace,
									sNodeNamespace,
									sNodeNamespace === this._topicId,
									oJSONElement.lib,
									false /* Virtual namespace can't be deprecated */);

								oNewNodeNamespace.nodes = [];
								oNewNodeNamespace.nodes.push(oTreeNode);

								aTreeContent.push(oNewNodeNamespace);

								this._removeDuplicatedNodeFromTree(sNodeNamespace);

							}
						} else {
							// Entities for which we can't resolve namespace are shown in the root level
							oNewNodeNamespace = this._createTreeNode(oJSONElement.name, oJSONElement.name, oJSONElement.name === this._topicId, oJSONElement.lib, !!oJSONElement.deprecated);
							aTreeContent.push(oNewNodeNamespace);
						}
					} else {
						oNewNodeNamespace = this._createTreeNode(oJSONElement.name, oJSONElement.name, oJSONElement.name === this._topicId, oJSONElement.lib, !!oJSONElement.deprecated);
						aTreeContent.push(oNewNodeNamespace);
					}
				}
			},

			_createTreeNode : function (text, name, isSelected, sLib, bIsDeprecated) {
				var oTreeNode = {};
				oTreeNode.text = text;
				oTreeNode.name = name;
				oTreeNode.ref = "#/api/" + name;
				oTreeNode.isSelected = isSelected;
				oTreeNode.bIsDeprecated = bIsDeprecated;
				oTreeNode.lib = sLib;
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

			_bindTreeModel : function (aTreeContent) {
				var treeModel = this.getModel("treeData");
				treeModel.setSizeLimit(iTreeModelLimit);

				// Inject Deprecated, Experimental and Since links
				if (aTreeContent.length > 0) {
					aTreeContent.push({
						isSelected: false,
						name : "experimental",
						ref: "#/api/experimental",
						text: "Experimental APIs",
						bIsDeprecated: false
					}, {
						isSelected: false,
						name : "deprecated",
						ref: "#/api/deprecated",
						text: "Deprecated APIs",
						bIsDeprecated: false
					}, {
						isSelected: false,
						name : "since",
						ref: "#/api/since",
						text: "Index by Version",
						bIsDeprecated: false
					});
				}

				treeModel.setData(aTreeContent, false);
			},

			_bindVersionModel : function (oVersionInfo) {
				var oVersion,
					bSnapshot,
					bOpenUI5,
					sVersionSuffix,
					bIsInternal;

				this.aAllowedMembers = ["public", "protected"];

				if (!oVersionInfo) {
					return;
				}

				oVersion = Version(oVersionInfo.version);
				sVersionSuffix = oVersion.getSuffix();
				bSnapshot = /-SNAPSHOT$/i.test(sVersionSuffix);
				bOpenUI5 = oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav);

				// We show restricted members for internal versions and if the documentation is in preview mode
				if (/internal/i.test(oVersionInfo.name) || !!window['sap-ui-documentation-preview']) {
					bIsInternal = true;
					this.aAllowedMembers.push("restricted");
				}

				this.getModel("versionData").setData({
					versionGav: oVersionInfo.gav,
					versionName: oVersionInfo.name,
					version: [oVersion.getMajor(), oVersion.getMinor(), oVersion.getPatch()].join("."),
					fullVersion: oVersionInfo.version,
					openUi5Version: sap.ui.version,
					isOpenUI5: bOpenUI5,
					isSnapshotVersion: bSnapshot,
					isDevVersion: bSnapshot,
					isBetaVersion: !bOpenUI5 && !bSnapshot && /-beta$/i.test(sVersionSuffix),
					isInternal: !!bIsInternal,
					libraries: oVersionInfo.libraries,
					allowedMembers: this.aAllowedMembers
				});
			}
		});
	}
);