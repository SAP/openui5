/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"sap/ui/documentation/sdk/model/models",
		"sap/ui/documentation/sdk/controller/ErrorHandler",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/util/DocumentationRouter",
		"sap/ui/documentation/sdk/controller/util/ConfigUtil",
		"sap/ui/documentation/sdk/controller/util/APIInfo"
	], function (UIComponent, Device, models, ErrorHandler, JSONModel, DocumentationRouter, ConfigUtil, APIInfo) {
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

				// call the base component's init function and create the App view
				UIComponent.prototype.init.apply(this, arguments);

				// create the views based on the url/hash
				this.getRouter().initialize();

				// Preload API Info on desktop for faster startup
				if (Device.system.desktop) {
					this.fetchAPIInfoAndBindModels();
				}
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
					} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
						this._sContentDensityClass = "sapUiSizeCozy";
					}
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

			fetchAPIInfoAndBindModels: function () {

				if (this._modelsPromise) {
					return this._modelsPromise;
				}

				this._modelsPromise = new Promise(function (resolve) {
					APIInfo.getAllLibrariesElementsJSONPromise().then(function(aLibsData) {
						aLibsData.forEach(this._parseLibraryElements, this);
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
			}
		});

	}
);