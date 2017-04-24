/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/MasterTreeBaseController",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/model/json/JSONModel"
	], function (MasterTreeBaseController, APIInfo, JSONModel) {
		"use strict";

		var aTreeContent = [],
			oLibsData = {},
			iTreeModelLimit = 1000000;

		return MasterTreeBaseController.extend("sap.ui.documentation.sdk.controller.ApiMaster", {

			/**
			 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
			 * @public
			 */
			onInit : function () {
				var tree = this.byId("tree");
				this._parseLibrariesData();
				this._bindAllLibsModel(oLibsData);
				this._bindTreeModel(tree, aTreeContent);

				this._initTreeUtil("name", "nodes");

				this.getRouter().getRoute("api").attachPatternMatched(this._onMatched, this);
				this.getRouter().getRoute("apiId").attachPatternMatched(this._onTopicMatched, this);
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */

			/**
			 * Handles "apiId" routing
			 * @function
			 * @param {sap.ui.base.Event} event pattern match event in route 'apiId'
			 * @private
			 */
			_onTopicMatched: function (event) {

				try {
					this.showMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					jQuery.sap.log.error(e);
				}

				this._topicId = event.getParameter("arguments").id;

				this._expandTreeToNode(this._topicId);
			},

			/**
			 * Handles "api" routing
			 * @function
			 * @private
			 */
			_onMatched: function () {
				var splitApp = this.getView().getParent().getParent();
				splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
			},

			_parseLibrariesData : function () {
				var aLibrariesNames = this._getLibraryNames();
				for (var i = 0; i < aLibrariesNames.length; i++ ) {
					this._fetchLibraryData(aLibrariesNames[i].name);
				}
			},

			_getLibraryNames: function() {
				if (this.extHookgetLibraryNames) {
					// extension logic
					return this.extHookgetLibraryNames();
				}
				// original logic
				return this.getLibraryNames();
			},

			getLibraryNames: function() {
				return sap.ui.getVersionInfo().libraries;
			},

			_fetchLibraryData : function (sLibraryName) {
				if (this.extHookfetchLibraryData) {
					this.extHookfetchLibraryData(sLibraryName, this._parseLibraryElements);
				} else {
					this.fetchLibraryData(sLibraryName);
				}

			},

			fetchLibraryData : function (sLibraryName) {
				APIInfo.getLibraryElementsJSONAsync(this, sLibraryName, this._parseLibraryElements);
			},

			_parseLibraryElements : function (aLibraryElementsJSON) {
				var bSkipRefresh;
				for (var i = 0; i < aLibraryElementsJSON.length; i++) {
					if (!aLibraryElementsJSON[i].children) {
						this._addElementToLibsData(aLibraryElementsJSON[i]);
					}

					this._addElementToTreeData(aLibraryElementsJSON[i]);

					if (aLibraryElementsJSON[i].children) {
						this._parseLibraryElements(aLibraryElementsJSON[i].children, true);
					}
				}

				if (!bSkipRefresh) {
					this._refreshTreeModel();
				}
			},

			_addElementToLibsData : function (oJSONElement) {
				oLibsData[oJSONElement.name] = oJSONElement;
			},

			_refreshTreeModel : function (toDelete) {
				this._optimizeTreeContent();
				this._sortTreeContent();

				var tree = this.byId("tree");
				var oldModel = tree.getModel();
				var newModel = new JSONModel(aTreeContent);
				newModel.setSizeLimit(iTreeModelLimit);
				tree.setModel(newModel);
				oldModel.destroy();

				this._expandTreeToNode(this._topicId);
			},

			_sortTreeContent : function () {
				aTreeContent.sort(function(a, b) {
					if (a.text < b.text){
						return -1;
					}
					if (a.text > b.text){
						return 1;
					}
					return 0;
				});
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

			_optimizeTreeContent : function () {
				var iMaxPackageDepth = this._calculateTreeMaxPackageDepth();

				for (var i = iMaxPackageDepth; i > 0; i--) {
					for (var p = 0; p < aTreeContent.length; p++) {
						if (aTreeContent[p].packageDepth === i && !aTreeContent[p].nodes) {
							for (var j = 0; j < aTreeContent.length; j++) {
								if ((aTreeContent[j].packageDepth === (i - 1)) && (aTreeContent[p].text.indexOf(aTreeContent[j].text) == 0)
									&& (aTreeContent[p].text !== aTreeContent[j].text) && (!aTreeContent[p].nodes)) {
									this._moveNodePIntoNodeJ(p, j);
									j--;
									p--;
								}
							}
						}
					}
				}
			},

			_moveNodePIntoNodeJ: function (p, j) {
				//console.log("Move " + aTreeContent[p].text + " into " + aTreeContent[j].text);
				var oTmpNode = aTreeContent.splice(p, 1);
				if (!aTreeContent[j].nodes) {
					aTreeContent[j].nodes = [];
				}
				aTreeContent[j].nodes.push(oTmpNode[0]);
			},

			_calculateTreeMaxPackageDepth : function () {
				var iMaxPackageDepth = 0;
				for (var i = 0; i < aTreeContent.length; i++) {
					var iPackageDepth = (aTreeContent[i].text.split(".").length) - 1;
					aTreeContent[i].packageDepth = iPackageDepth;
					if (iMaxPackageDepth < iPackageDepth) {
						iMaxPackageDepth = iPackageDepth;
					}
				}
				return iMaxPackageDepth;
			},

			_bindAllLibsModel : function (oAllLibsData) {
				var oLibsModel = new JSONModel(oAllLibsData);
				oLibsModel.setSizeLimit(iTreeModelLimit);
				sap.ui.getCore().setModel(oLibsModel, "libsData");
			},

			_bindTreeModel : function (oTree, aTreeContent) {
				var treeModel = new JSONModel(aTreeContent);
				treeModel.setSizeLimit(iTreeModelLimit);
				oTree.setModel(treeModel);
			},

			onNodeSelect : function (oEvent) {
				var node = oEvent.getParameter("listItem");
				var apiId = node.getCustomData()[0].getValue();

				if (!apiId) {
					jQuery.sap.log.warning("Missing name for entity: " + node.getId() + " - cannot navigate to API ref");
					return;
				}

				this.getRouter().navTo("apiId", {id : apiId}, false);
			}

		});
	}
);