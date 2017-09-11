/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "sap/ui/demokit/SimpleTreeNode", "jquery.sap.encoder"],
	function(jQuery, SimpleTreeNode) {
		"use strict";

		var SimpleTreeRenderer = {};

		SimpleTreeRenderer.render = function(oRenderManager, oTree) {
			var rm = oRenderManager;

			var oSelectedNode = _findSelectedNode(oTree.getNodes());
			_expandParentNodes(oSelectedNode);

			_startTree();
			if (oTree.getTitle()) {
				_createHeaderTitle();
			}
			if (oTree.getShowFilter() && oTree.getModel()) {
				_createFilter();
			}
			_startTreeContent();
			_writeTreeItems(oTree.getNodes());
			_endTreeContent();
			_endTree();

			function _findSelectedNode(aNodes) {
				if (!aNodes) {
					return null;
				}
				for (var i = 0; i < aNodes.length; i++) {
					if (aNodes[i].getIsSelected()) {
						return aNodes[i];
					}
					var aChildNodes = aNodes[i].getNodes();
					var selectedNode = _findSelectedNode(aChildNodes);
					if (selectedNode) {
						return selectedNode;
					}
				}
				return null;
			}

			function _expandParentNodes(oNode) {
				if (oNode instanceof SimpleTreeNode) {
					oNode.setExpanded(true);
					var oNodeParent = oNode.getParent();
					_expandParentNodes(oNodeParent);
				}
			}

			function _startTree() {
				rm.write("<div");
				rm.writeControlData(oTree);
				rm.addClass("sapDkSimpleTree sapUiSizeCompact");
				rm.writeClasses();
				rm.addStyle("width", oTree.getWidth() || "auto");
				rm.addStyle("height", oTree.getHeight() || "auto");
				rm.writeStyles();
				//ARIA
				rm.writeAttribute("role", "tree");
				rm.write(">");
			}

			function _createHeaderTitle() {
				rm.write("<div");
				rm.addClass("sapDkSimpleTreeTitle");
				rm.writeClasses();
				rm.writeAttribute("role", "heading");
				rm.write(">");
				rm.writeEscaped(oTree.getTitle());
				rm.write("</div>");
			}

			function _createFilter() {
				rm.renderControl(oTree.getAggregation("_searchField"));
			}

			function _startTreeContent() {
				rm.write("<ul");
				rm.addClass("sapDkSimpleTreeRootList");
				rm.writeClasses();
				rm.write(">");
			}

			function _writeTreeItems(nodes) {
				for (var i = 0; i < nodes.length; i++) {
					SimpleTreeRenderer.renderNode(rm, nodes[i], nodes.length, i);
				}
			}

			function _endTreeContent() {
				rm.write("</ul>");
			}

			function _endTree() {
				rm.write("</div>");
			}

		};

		SimpleTreeRenderer.renderNode = function(rm, oTreeNode, iRootLevelNodesNumber, iRootNodePosition) {
			var BASE_NODE_OFFSET = 7;
			var NODE_STEP_OFFSET = 15;
			var ROOT_NESTED_LEVEL = 0;

			_writeNodes(oTreeNode, ROOT_NESTED_LEVEL, iRootLevelNodesNumber, iRootNodePosition);

			function _writeNodes(oNode, iNestedLevel, iSameLevelNodesNumber, iNodePosition) {
				_startNode(oNode, iNestedLevel, iSameLevelNodesNumber, iNodePosition);

				var aChildNodes = oNode.getNodes();
				if (aChildNodes && aChildNodes.length > 0) {
					iNestedLevel++;
					_startNodeList(oNode.getExpanded());
					for (var i = 0; i < aChildNodes.length; i++) {
						_writeNodes(aChildNodes[i], iNestedLevel, aChildNodes.length, i);
					}
					iNestedLevel--;
					_endNodeList();
				}
				_endNode(oNode);
			}

			function _startNode(oNode, iNestedLevel, iSameLevelNodesNumber, iNodePosition) {
				var nodes = oNode.getNodes(),
					bHasChildren = (nodes && nodes.length > 0);

				rm.write("<li");
				rm.writeElementData(oNode);
				rm.addClass("sapDkSimpleTreeNode");

				if (iNestedLevel === 0) {
					if (oNode.getExpanded()) {
						rm.addClass("sapDkSimpleTreeNodeFirstLvlRootExp");
					} else if (bHasChildren) {
						rm.addClass("sapDkSimpleTreeNodeFirstLvlRootCol");
					}
				}
				rm.writeClasses();
				rm.write(">");

				rm.write("<a href=\"" + jQuery.sap.encodeHTML(oNode.getRef() || "") + "\"");
				var bIsRTL = sap.ui.getCore().getConfiguration().getRTL();

				rm.addStyle(bIsRTL ? "padding-right" : "padding-left", ((iNestedLevel * NODE_STEP_OFFSET) + BASE_NODE_OFFSET) + "px");
				rm.writeStyles();
				rm.writeAttribute("tabindex", "-1");

				if (oNode.getIsSelected()) {
					rm.addClass("sapDkSimpleTreeNodeSelected");
				}

				if (iNestedLevel === 0) {
					rm.addClass("sapDkSimpleTreeNodeFirstLvl");
				}

				rm.writeClasses();

				//ARIA
				var mProps = {role: 'treeitem', level: iNestedLevel + 1, setsize: iSameLevelNodesNumber, posinset: iNodePosition + 1};
				if (oNode.getExpanded()) {
					mProps["expanded"] = true;
				} else if (bHasChildren) {
					mProps["expanded"] = false;
				}

				rm.writeAccessibilityState(oNode, mProps);

				rm.write(">");
				if (bHasChildren) {
					rm.renderControl(oNode.getAggregation("_iconControl"));
				} else {
					rm.write("<span");
					rm.addClass("sapDkSimpleTreeNodeNoChildren");
					rm.writeClasses();
					rm.write(">");
					rm.write("</span>");
				}


				rm.write("<span");
				rm.addClass("sapDkSimpleTreeNodeLabel");
				rm.writeClasses();
				rm.write(">");
				rm.writeEscaped(oNode.getText());
				rm.write("</span>");
				rm.write("</a>");
			}

			function _endNode() {
				rm.write("</li>");
			}

			function _startNodeList(bIsExpanded) {
				rm.write("<ul");
				if (bIsExpanded) {
					rm.addClass("sapDkSimpleTreeVisibleChildrenNodes");
				} else {
					rm.addClass("sapDkSimpleTreeHiddenChildrenNodes");
				}
				rm.writeClasses();
				rm.write(">");
			}

			function _endNodeList() {
				rm.write("</ul>");
			}

		};

		return SimpleTreeRenderer;

	}, /* bExport= */ true);
