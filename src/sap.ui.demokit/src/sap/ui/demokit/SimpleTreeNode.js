/*!
 * ${copyright}
 */

// This is internal control dedicated for Demo Kit application usage
sap.ui.define(['sap/ui/core/Element', 'sap/ui/core/Icon'],
	function(Element, Icon) {
		"use strict";

		var SimpleTreeNode = Element.extend("sap.ui.demokit.SimpleTreeNode", { metadata : {
			library : "sap.ui.demokit",

			properties : {
				text : {type : "string", defaultValue : null},

				ref : {type : "string", defaultValue : null},

				expanded : {type : "boolean", defaultValue : false},

				isSelected : {type : "boolean", defaultValue : false}
			},

			defaultAggregation : "nodes",

			aggregations : {
				nodes : {type : "sap.ui.demokit.SimpleTreeNode", multiple : true, singularName : "node", bindable : "bindable"},

				_iconControl : {type : "sap.ui.core.Icon", multiple : false, visibility : "hidden"}
			},

			events : {

				selected : {}

			}

		}});

		SimpleTreeNode.ANIMATION_DURATION = 600;

		//***********************************************************************************
		//* PUBLIC METHODS
		//***********************************************************************************

		SimpleTreeNode.prototype.init = function() {
			this._bIsRTL = sap.ui.getCore().getConfiguration().getRTL();

			var oIcon = new Icon({useIconTooltip: false}).addStyleClass('sapDkSimpleTreeNodeIconCol');
			if (this._bIsRTL) {
				oIcon.setSrc("sap-icon://navigation-left-arrow");
			} else {
				oIcon.setSrc("sap-icon://navigation-right-arrow");
			}

			this.setAggregation("_iconControl", oIcon, true);
		};

		SimpleTreeNode.prototype.expand = function(bExpandChildren){
			this._executeExpandCollapse(true, bExpandChildren);
		};

		SimpleTreeNode.prototype.collapse = function(bCollapseChildren){
			this._executeExpandCollapse(false, bCollapseChildren);
		};

		SimpleTreeNode.prototype.setExpanded = function(bExpanded) {
			if (this.getExpanded() !== bExpanded) {
				this.setProperty("expanded", bExpanded, false);

				this._toggleNodeArrow(bExpanded);
			}

		};

		//***********************************************************************************
		//* PRIVATE METHODS
		//***********************************************************************************

		SimpleTreeNode.prototype._executeExpandCollapse = function(bShouldExpand, bRecursive) {
			this._toggleNodeExpandedProperty(bShouldExpand);
			this._toggleNodeArrow(bShouldExpand);
			this._toggleDirectChildrenVisibility(this.$(), bShouldExpand);
			this._toggleNodeBottomBorder(this.$(), bShouldExpand);

			if (bRecursive) {
				this._expandCollapseChildrenRecursively(bShouldExpand);
			}
		};

		SimpleTreeNode.prototype._toggleNodeExpandedProperty = function(bShouldExpand) {
			this.setProperty("expanded", false, true);
			if (bShouldExpand && !this.getExpanded() && this.getNodes().length > 0 ) {
				this.setProperty("expanded", true, true);
			}
		};


		SimpleTreeNode.prototype._toggleNodeArrow = function(bShouldExpand) {
			var oIcon = this.getAggregation("_iconControl");

			if (bShouldExpand && ((oIcon.getSrc().indexOf("navigation-right-arrow") > -1)
				|| (oIcon.getSrc().indexOf("navigation-left-arrow") > -1))) {
				oIcon.removeStyleClass("sapDkSimpleTreeNodeIconCol");
				oIcon.addStyleClass("sapDkSimpleTreeNodeIconExp");
				oIcon.setSrc("navigation-down-arrow");
			} else if (!bShouldExpand && oIcon.getSrc().indexOf("navigation-down-arrow") > -1) {
				oIcon.removeStyleClass("sapDkSimpleTreeNodeIconExp");
				oIcon.addStyleClass("sapDkSimpleTreeNodeIconCol");
				if (this._bIsRTL) {
					oIcon.setSrc("navigation-left-arrow");
				} else {
					oIcon.setSrc("navigation-right-arrow");
				}
			}
		};

		SimpleTreeNode.prototype._toggleDirectChildrenVisibility = function(oDomNode, bShouldExpand) {
			var oListDomNode = oDomNode.children("ul");
			if ((bShouldExpand && oListDomNode.hasClass("sapDkSimpleTreeHiddenChildrenNodes"))
				|| (!bShouldExpand && oListDomNode.hasClass("sapDkSimpleTreeVisibleChildrenNodes"))) {

				oListDomNode.toggleClass("sapDkSimpleTreeHiddenChildrenNodes");
				oListDomNode.toggleClass("sapDkSimpleTreeVisibleChildrenNodes");

				this._executeExpandCollapseAnimation(oListDomNode, bShouldExpand);
			}
			//ARIA
			if (!bShouldExpand && oDomNode.children("a").last().attr("aria-expanded") === "true") {
				oDomNode.children("a").last().attr("aria-expanded", "false");
			} else if (bShouldExpand && this.getNodes().length > 0) {
				oDomNode.children("a").last().attr("aria-expanded", "true");
			}

		};

		SimpleTreeNode.prototype._executeExpandCollapseAnimation = function(oDomNode, bShouldExpand) {
			if (bShouldExpand) {
				//JQuery show/hide methods are not working if 'display' style is not already presented.
				oDomNode.css({display:'none'});
				oDomNode.show(SimpleTreeNode.ANIMATION_DURATION);
			} else {
				oDomNode.css({display:'block'});
				oDomNode.hide(SimpleTreeNode.ANIMATION_DURATION);
			}

		};

		SimpleTreeNode.prototype._toggleNodeBottomBorder = function(oDomNode, bShouldExpand) {
			if ((bShouldExpand && oDomNode.hasClass("sapDkSimpleTreeNodeFirstLvlRootCol")) ||
				(!bShouldExpand && oDomNode.hasClass("sapDkSimpleTreeNodeFirstLvlRootExp"))) {

				oDomNode.toggleClass("sapDkSimpleTreeNodeFirstLvlRootCol sapDkSimpleTreeNodeFirstLvlRootExp");
			}
		};

		SimpleTreeNode.prototype._expandCollapseChildrenRecursively = function(bShouldExpand) {
			var aChildNodes = this.getNodes();
			for (var i = 0; i < aChildNodes.length; i++) {
				if (bShouldExpand) {
					aChildNodes[i].expand(true);
				} else {
					aChildNodes[i].collapse(true);
				}
			}
		};

		SimpleTreeNode.prototype._selectNode = function(bShouldExpand, oEvent) {
			if (!oEvent.target.classList.contains("sapUiIcon")) {
				this.fireSelected();

				this._refreshNodeSelection(this.$());
			} else if (bShouldExpand) {
				this.expand();
			} else {
				this.collapse();
			}

			oEvent.preventDefault();
			oEvent.stopPropagation();
		};

		SimpleTreeNode.prototype._refreshNodeSelection = function(oDomNode) {
			var oTree = this._getTree();
			this._clearPreviousNodeSelection(oTree);
			this._setNodeSelection(oDomNode, oTree);
		};

		SimpleTreeNode.prototype._getTree = function() {
			var oParent = this.getParent();
			while (oParent instanceof SimpleTreeNode) {
				oParent = oParent.getParent();
			}
			return oParent;
		};

		SimpleTreeNode.prototype._clearPreviousNodeSelection = function(oTree) {
			if (oTree.sSelectedNodeId === null) {
				return;
			}

			var oPreviouslySelectedNode = sap.ui.getCore().byId(oTree.sSelectedNodeId);
			if (oPreviouslySelectedNode) {
				oPreviouslySelectedNode.setProperty("isSelected", false, true);
				oPreviouslySelectedNode.$().children("a").removeClass("sapDkSimpleTreeNodeSelected");
				//ARIA
				oPreviouslySelectedNode.$().children("a").removeAttr("aria-selected");
			}
		};

		SimpleTreeNode.prototype._setNodeSelection = function(oDomNode, oTree) {
			this.setProperty("isSelected", true, true);

			oTree.sSelectedNodeId = this.getId();
			oDomNode.children("a").last().addClass("sapDkSimpleTreeNodeSelected");
			//ARIA
			oDomNode.children("a").last().attr("aria-selected", "true");
		};

		//***********************************************************************************
		//* EVENTS HANDLING
		//***********************************************************************************

		SimpleTreeNode.prototype.onclick = function(oEvent) {
			this._selectNode(!this.getExpanded(), oEvent);
		};

		SimpleTreeNode.prototype.ontap = function(oEvent) {
			oEvent.preventDefault();
		};

		SimpleTreeNode.prototype.onsapselect = function(oEvent) {
			this._selectNode(!this.getExpanded(), oEvent);
		};

		SimpleTreeNode.prototype.onsapleft = function(oEvent) {
			this._selectNode(this._bIsRTL ? true : false, oEvent);
		};

		SimpleTreeNode.prototype.onsapright = function(oEvent) {
			this._selectNode(this._bIsRTL ? false : true, oEvent);
		};

		//***********************************************************************************
		//* HELPER METHODS - FOCUS MANAGEMENT
		//***********************************************************************************

		SimpleTreeNode.prototype._getDomRefs = function(aDomRefs) {
			aDomRefs.push(this.$().children("a")[0]);
			var aNodes = this.getNodes();
			for (var i = 0; i < aNodes.length; i++) {
				aNodes[i]._getDomRefs(aDomRefs);
			}
		};


		return SimpleTreeNode;
	});
