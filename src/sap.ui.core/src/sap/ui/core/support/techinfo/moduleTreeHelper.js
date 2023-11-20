/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/thirdparty/jquery"], function (jQuery) {
	"use strict";

	return {
		/**
		 * Sets the selection state for a package/module.
		 * Package names must end with a slash, modules must not.
		 * @param {object} oObject The resulting hierarchy object
		 * @param {string} sName The name to be set in the hierarchy
		 * @param {boolean} bValue Selected state for the name
		 * @param {boolean} bCreate If set to true non-existing nodes will be created
		 */
		set: function (oObject, sName, bValue, bCreate) {
			sName = sName === '/' ? '' : sName;
			var aNames = sName.split('/'),
				l = aNames.length, i;

			if (l > 0) {
				for (i = 0; oObject && i < l - 1; i++) {
					if (!oObject[aNames[i]]) {
						oObject[aNames[i]] = {};
					}
					if (oObject[aNames[i]]) {
						oObject = oObject[aNames[i]];
					}
				}
				// exlude non-existing nodes except for the root node)
				if (typeof oObject[aNames[l - 1]] !== "undefined" || aNames[l - 1] === "" || bCreate) {
					if (typeof oObject[aNames[l - 1]] !== "object") {
						// mark node as selected
						oObject[aNames[l - 1]] = bValue;
					} else {
						// select existing package
						oObject[aNames[l - 1]][''] = bValue;
					}
				}
			}
		},

		/***
		 * Gets the selection state for a package/module.
		 * Package names must end with a slash, modules must not.
		 * If an ancestor package of the package/module does not exists, undefined is returned.
		 * @param {object} oObject The resulting hierarchy object
		 * @param {string} sName The name to be set in the hierarchy
		 * @returns {boolean} the selected state of a name
		 */
		get: function (oObject, sName) {
			sName = sName === '/' ? '' : sName;
			var aNames = sName.split('/'),
				l = aNames.length, i;

			if (l > 0) {
				for (i = 0; oObject && i < l - 1; i++) {
					if (!oObject[aNames[i]]) {
						return false;
					}
					oObject = oObject[aNames[i]];
				}
				return oObject[aNames[l - 1]];
			}
		},

		/**
		 * Converts a module object to a module hierarchy with selections state based on sap-ui-debug
		 * @param {object} oModules Flat object of modules
		 * @param {object} oResult Hierarchical tree of modules including selection state
		 * */
		modulesToHierarchy: function (oModules, oResult) {
			var modules = oModules.modules,
				vDebugInfo = window["sap-ui-debug"];

			// create tree with all modules and empty selection
			jQuery.each(modules, function (sName) {
				this.set(oResult, sName, false, true);
			}.bind(this));

			// apply current debug info as tree selection
			if (vDebugInfo === true || vDebugInfo === 'x' || vDebugInfo === 'X') {
				this.set(oResult, '/', true);
			} else if (vDebugInfo && typeof vDebugInfo === 'string') {
				vDebugInfo.split(/,/).forEach(function (sPattern) {
					if (/\*/.test(sPattern)) {
						// if a glob pattern is found, select all modules that are matched by it
						var rFilter = new RegExp("^(?:" + this.makeRegExp(sPattern) + ")");
						// collect namespaces
						var oNamespacesAndModules = {};
						Object.keys(modules).forEach(function (sModule) {
							var sModulePath = sModule.split("/").slice(0, -1).join("/") + "/";
							oNamespacesAndModules[sModulePath] = "";
						});
						// join namespaces and modules object
						for (var sKey in modules) {
							oNamespacesAndModules[sKey] = modules[sKey];
						}
						jQuery.each(oNamespacesAndModules, function (sName) {
							if (rFilter.test(sName)) {
								this.set(oResult, sName, true);
							}
						}.bind(this));
					} else {
						// for simple package / module names, just select the corresponding tree node
						this.set(oResult, sPattern, true);
					}
				}.bind(this));
			}
		},

		/**
		 * Converts a module hierarchy to a bindable tree model structure
		 * The returning object contains the tree structure and depth of the deepest selected node
		 * @param {object} oModules Flat object of modules
		 * @return {{tree: {text: string}, depth: number}} The resulting tree and the depth
		 */
		toTreeModel: function (oModules) {
			var oHierarchy = {},
				oTree = {
					text: "All"
				},
				iSelectionDepth;

			this.modulesToHierarchy(oModules, oHierarchy);

			iSelectionDepth = this.setTreeNode(oHierarchy, oTree, 0, window["sap-ui-debug"] === true);
			if (!iSelectionDepth) {
				iSelectionDepth = 0;
			}

			return {
				tree: oTree,
				depth: iSelectionDepth
			};
		},

		/**
		 * Recursively constructs tree nodes in a format that it can be bound to a sap.m.Tree control
		 * @param {object} oHierarchy The module hierarchy node with selected state
		 * @param {object} oTree The tree node to be filled with the hierarchy information
		 * @param {int} iDepth The current depth of the recursion
		 * @param {boolean} bSelected The selected state of the parent node
		 * @return {int} The depth of the deepest node in the tree
		 */
		setTreeNode: function (oHierarchy, oTree, iDepth, bSelected) {
			var iSelectionDepth,
				iInnerSelectionDepth;

			bSelected = oHierarchy === true || oHierarchy[""] || bSelected;
			oTree.nodes = [];
			oTree.selected = bSelected;

			if (bSelected) {
				iSelectionDepth = iDepth;
			}

			for (var sProperty in oHierarchy) {
				if (sProperty === "") {
					continue;
				}
				var oChildNode = {
					text: sProperty
				};
				iInnerSelectionDepth = this.setTreeNode(oHierarchy[sProperty], oChildNode, iDepth + 1, bSelected);
				if (iInnerSelectionDepth > iSelectionDepth || !iSelectionDepth) {
					iSelectionDepth = iInnerSelectionDepth;
				}
				oTree.nodes.push(oChildNode);
			}

			return iSelectionDepth;
		},

		/**
		 * Converts a bindable tree back to the module hierarchy structure
		 * @param {object} oTree The tree to be converted
		 * @return {object} The module hierarchy with the current selection state of the UI
		 */
		toHierarchy: function (oTree) {
			var oResult = {};
			oTree.selected = this.isNodeSelected(oTree);
			this.setHierarchyNode(oResult, oTree);
			return oResult;
		},

		/**
		 * Checks and update the tree model based on selected child nodes.
		 * @param oNode The tree to be updated
		 * @returns {boolean} The selected of the node.
		 */
		isNodeSelected: function (oNode) {
			var iSelectedNodesCount = 0,
				oChildNode;

			for (var i = 0; i < oNode.nodes.length; i++) {
				oChildNode = oNode.nodes[i];
				if (oChildNode.nodes.length) {
					oChildNode.selected = this.isNodeSelected(oChildNode);
				}
				if (oChildNode.selected) {
					iSelectedNodesCount++;
				}
			}

			return iSelectedNodesCount === oNode.nodes.length;
		},
		/**
		 * Recursively converts a bindable tree node to a hierarchical model tree node
	 	 * @param {object} oHierarchy The module hierarchy node with selected state
		 * @param {object} oTree The tree node to be filled with the hierarchy information
		 */
		setHierarchyNode: function (oHierarchy, oTree) {
			if (oTree.selected) {
				oHierarchy[""] = true;
			}

			for (var i = 0; i < oTree.nodes.length; i++) {
				oHierarchy[oTree.nodes[i].text] = {};
				if (oTree.nodes[i].nodes.length) {
					this.setHierarchyNode(oHierarchy[oTree.nodes[i].text], oTree.nodes[i]);
				} else  {
					oHierarchy[oTree.nodes[i].text] = oTree.nodes[i].selected;
				}
			}
		},

		/**
		 * Converts a bindable tree structure to a valid value for sap-ui-debug
		 * @param {object} oTree The tree to be converted
		 * @param {string} sSeparator=, A separator character, default is a comma
		 * @return {string} The tree selection represented as string
		 */
		toDebugInfo: function (oTree, sSeparator) {
			var oObject = this.toHierarchy(oTree),
				aFilters = [];

			function collect(sName, oObject) {
				var aChildren, bChildren;
				if (typeof oObject === 'object') {
					if (oObject['']) {
						aFilters.push(sName + '/');
						return;
					}
					aChildren = Object.keys(oObject);
					bChildren = aChildren.length;
				}
				if (bChildren) {
					aChildren.forEach(function (sChild) {
						if (sChild === '') {
							return;
						}
						if (oObject[sChild] === true) {
							aFilters.push((sName ? sName + '/' : '') + sChild);
						} else if (typeof oObject[sChild] === 'object') {
							collect((sName ? sName + '/' : '') + sChild, oObject[sChild]);
						}
					});
				}
			}

			if (this.get(oObject, '/')) {
				return true;
			}

			collect('', oObject);

			return (aFilters.length > 0 ? aFilters.join(sSeparator || ',') : false);
		},

		/**
		 * Converts a glob pattern to a partial JS regexp.
		 * @param {string} sGlobPattern A regular expression
		 * @returns {string} A parial JS regexp
		 */
		makeRegExp: function (sGlobPattern) {
			if (!/\/\*\*\/$/.test(sGlobPattern)) {
				sGlobPattern = sGlobPattern.replace(/\/$/, '/**/');
			}
			return sGlobPattern.replace(/\*\*\/|\*|[[\]{}()+?.\\^$|]/g, function (sMatch) {
				switch (sMatch) {
					case '**/' :
						return '(?:[^/]+/)*';
					case '*'   :
						return '[^/]*';
					default    :
						return '\\' + sMatch;
				}
			});
		},

		/**
		 * Calculates the number of currently selected debug modules
		 * @param {object} oTree The tree to be analyzed
		 * @return {int} The amount of selected tree nodes
		 */
		getSelectionCount: function (oTree) {
			var sDebugString = this.toDebugInfo(oTree);

			if (sDebugString === true) {
				return 1;
			} else if (sDebugString) {
				return sDebugString.split(",").length;
			}
			return 0;
		},

		/**
		 * Recursively selected or deselects a branch of the tree
		 * @param {object} oTree The tree to be selected
		 * @param {boolean} bSelected Whether the branch should be selected or not
		 */
		recursiveSelect: function (oTree, bSelected) {
			oTree.selected = bSelected;
			for (var i = 0; i < oTree.nodes.length; i++) {
				this.recursiveSelect(oTree.nodes[i], bSelected);
			}
		}

	};
});