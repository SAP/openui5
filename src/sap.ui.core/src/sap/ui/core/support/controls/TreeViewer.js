/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/ManagedObject',
	"sap/base/security/encodeXML"
],
function(ManagedObject, encodeXML) {
	'use strict';
	var TreeViewer = ManagedObject.extend("sap.ui.core.support.controls.TreeViewer", {
		constructor: function() {
			ManagedObject.apply(this, arguments);
			this._oRenderParent = null;
			this._oRootObject = null;
		}
	});

	//private functions and vars
	var mRenderTemplates = {
		nodestart : "<div tabIndex=\"0\" idx=\"{idx}\" class=\"node start {cssclass}\" haschildnodes=\"{haschildnodes}\" visible=\"{visible}\" collapsed=\"{collapsed}\" style=\"padding-left:{pxlevel}\" level=\"{level}\" raise=\"_selectNode\" args=\"{idx}\"><span class=\"expand\" raise=\"_toggleNode\" args=\"{idx}\"></span>&lt;<span class=\"nstag\" reason=\"tagName\"><span class=\"ns\" reason=\"namespace\">{namespaceURI}</span><span class=\"tag\"  reason=\"localName\">{localName}</span></span>",
		nodestartend : "&gt;</div>",
		nodenochildend : "&gt;&lt;/<span class=\"nstagend\"><span class=\"nstag\"><span class=\"ns\">{namespaceURI}</span><span class=\"tag\">{localName}</span></span></span>&gt;</div><div class=\"node end\" style=\"display:none\" visible=\"{visible}\" haschildnodes=\"{haschildnodes}\" collapsed=\"{collapsed}\" style=\"padding-left:{pxlevel}\" level=\"{level}\">&lt;/<span class=\"nstag\"><span class=\"ns\">{namespaceURI}</span><span class=\"tag\">{localName}</span></span>&gt;</div>",
		nodeend : "<div class=\"node end {cssclass}\" visible=\"{visible}\" haschildnodes=\"{haschildnodes}\" collapsed=\"{collapsed}\" style=\"padding-left:{pxlevel}\" level=\"{level}\">&lt;/<span class=\"nstag\"><span class=\"ns\">{namespaceURI}</span><span class=\"tag\">{localName}</span></span>&gt;</div>",
		attribute: "&nbsp;<span class=\"attr\" modified=\"{modified}\" oldValue=\"{oldValue}\" title=\"{oldValue}\" reason=\"attributeName\"><span class=\"attrname\">{attributeName}</span>=&quot;<span class=\"attrvalue\" reason=\"attributeValue\">{attributeValue}</span>&quot;</span>",
		idattribute: "&nbsp;<span class=\"attr\" modified=\"{modified}\" oldValue=\"{oldValue}\" title=\"originalValue: {oldValue}\" reason=\"attributeName\"><span class=\"attrname\">{attributeName}</span>=&quot;<span class=\"attrvalue attrvalue1\" reason=\"attributeValue\">{attributeValue1}</span><span class=\"attrvalue attrvalue2\" reason=\"attributeValue\">{attributeValue2}</span>&quot;</span>",
		nodeinfo: "<span class=\"info {color}\" selected=\"{selected}\"title=\"{tooltip}\" raise=\"_onInfoClick\" args=\"{idx},{infoidx}\"></span>"
	};

	var iLevel = 1;
	var iIdx = -1;
	function nextWithIndent(oNode) {
		var iLevel = parseInt(oNode.getAttribute("level"));
		oNode = oNode.nextSibling;
		while (oNode) {
			if (parseInt(oNode.getAttribute("level")) == iLevel) {
				return oNode;
			}
			oNode = oNode.nextSibling;
		}
		return null;
	}

	function _hasChildNodes(oNode) {
		var aChildNodes = oNode.childNodes;
		for (var i = 0; i < aChildNodes.length; i++) {
			if (aChildNodes[i].nodeType === 1) {
				return true;
			}
		}
		return false;
	}

	function _visitAttributes(oNode, oRenderContext) {
		var aModifications = oNode._modified || [];
		var aOldValues = oNode._oldValues;
		var aAttributes = oNode.attributes;
		var aSortedAttributes = aModifications.concat([]) || [];
		//sort the attributes so that the modifications come first
		for (var i = 0; i < aAttributes.length; i++) {
			var iIdx = aSortedAttributes.indexOf(aAttributes[i].name);
			if ( iIdx === -1) {
				aSortedAttributes.push(aAttributes[i]);
			} else {
				aSortedAttributes[iIdx] = aAttributes[i];
			}
		}
		for (var i = 0; i < aSortedAttributes.length; i++) {
			var oAttribute = aSortedAttributes[i];
			var oInfo = oRenderContext.fnAttributeInfos(oNode, oAttribute);
			if (oInfo) {
				if (oInfo.visible === false) {
					continue;
				}
			}
			if (oAttribute.name === "__id") {
				continue;
			}
			if (oAttribute.name === "__inactive") {
				continue;
			}
			if (oAttribute.namespaceURI === "http://schemas.sap.com/sapui5/extension/sap.ui.core.support.Support.info/1") {
				continue;
			}
			if (oAttribute.name.indexOf("__changed") > -1) {
				continue;
			}
			if (oAttribute.name === "xmlns:support") {
				continue;
			}
			var bModified = false,
				sOldValue = "";
			if (aModifications.indexOf(oAttribute.name) > -1) {
				bModified = true;
				sOldValue = "originalValue: " + aOldValues[aModifications.indexOf(oAttribute.name)];
			}
			if (oAttribute.name === "id") {
				if (!oRenderContext.bIgnoreIds) {
					oRenderContext.addWithParam(mRenderTemplates.idattribute, {
						attributeName: oAttribute.name,
						attributeValue1: encodeXML(String(oAttribute.value || "")),
						attributeValue2: oNode.getAttribute("__id"),
						modified: bModified,
						oldValue: encodeXML(sOldValue)
					});
				}
			} else {
				oRenderContext.addWithParam(mRenderTemplates.attribute, {
					attributeName: oAttribute.name,
					attributeValue: encodeXML(String(oAttribute.value || "")),
					modified: bModified,
					oldValue: encodeXML(sOldValue)
				});
			}
		}
	}

	function _visitChildNodes(oNode, oRenderContext) {
		var aChildNodes = oNode.childNodes;
		for (var i = 0; i < aChildNodes.length; i++) {
			if (aChildNodes[i].nodeType === 1) {
				if (oNode.getAttribute("__inactive") === "true") {
					aChildNodes[i].setAttribute("__inactive", "true");
				}
				iLevel++;
				_visitNode(aChildNodes[i], oRenderContext);
				iLevel--;
			}
		}
	}

	function _visitNode(oNode, oRenderContext) {
		iIdx++;
		var bHasChildNodes = _hasChildNodes(oNode);
		var sCssClass = "";
		if (oNode.getAttribute("__inactive") === "true") {
			sCssClass = "inactive";
		} else if (oNode.getAttribute("__replace") === "true") {
			sCssClass = "replace";
		}
		oRenderContext.addWithParam(mRenderTemplates.nodestart, {
			idx : iIdx,
			haschildnodes: bHasChildNodes,
			visible: iLevel < oRenderContext.initialExpandedLevel,
			cssclass: sCssClass,
			level: iLevel,
			pxlevel: (iLevel * 16) + "px",
			collapsed: iLevel >= (oRenderContext.initialExpandedLevel - 1),
			localName: oNode.localName,
			namespaceURI:  oNode.namespaceURI ? encodeXML(String(oNode.namespaceURI)) + ":" : ""
		});

		var aInfos = oRenderContext.fnNodeInfos(oNode);
		if (aInfos) {
			for (var i = 0; i < aInfos.length; i++) {
				var oInfo = aInfos[i];
				oRenderContext.addWithParam(mRenderTemplates.nodeinfo, {
					idx: iIdx + "",
					infoidx: i + "",
					selected: oInfo.selected || false,
					color: encodeXML(oInfo.color) || "orange",
					tooltip: encodeXML(oInfo.tooltip) || ""
				});
			}
		}
		_visitAttributes(oNode, oRenderContext);
		if (bHasChildNodes) {
			oRenderContext.addWithParam(mRenderTemplates.nodestartend, {});
			_visitChildNodes(oNode, oRenderContext);
			oRenderContext.addWithParam(mRenderTemplates.nodeend, {
				idx : iIdx,
				haschildnodes: bHasChildNodes,
				visible: iLevel < oRenderContext.initialExpandedLevel,
				level: iLevel,
				cssclass: sCssClass,
				pxlevel: (iLevel * 16) + "px",
				collapsed: iLevel >= (oRenderContext.initialExpandedLevel - 1),
				localName: oNode.localName,
				namespaceURI:  oNode.namespaceURI ? encodeXML(String(oNode.namespaceURI)) + ":" : ""
			});

		} else {
			oRenderContext.addWithParam(mRenderTemplates.nodenochildend, {
				idx : iIdx,
				haschildnodes: bHasChildNodes,
				visible: iLevel < oRenderContext.initialExpandedLevel,
				level: iLevel,
				pxlevel: (iLevel * 16) + "px",
				collapsed: iLevel >= (oRenderContext.initialExpandedLevel - 1),
				localName: oNode.localName,
				namespaceURI: oNode.namespaceURI ? encodeXML(String(oNode.namespaceURI)) + ":" : ""
			});
		}
	}

	function RenderContext() {
		this._aBuffer = [];
		var that = this;
		this.add = function() {
			that._aBuffer.push.apply(that._aBuffer, arguments);
		};
		this.addWithParam = function(s, o) {
			for (var n in o) {
				var reg = new RegExp("\{" + n + "\}","g");
				s = s.replace(reg,o[n]);
			}
			that.add(s);
		};
		this.toString = function() {
			return that._aBuffer.join("");
		};
	}

	//public methods
	TreeViewer.prototype.initialExpandedLevel = 4;
	TreeViewer.prototype.fnSelectionChange = function(){};
	TreeViewer.prototype.fnInfoPress = function(){};

	TreeViewer.prototype.ignoreIds = function() {
		this.bIgnoreIds = true;
	};
	TreeViewer.prototype.setRootObject = function(oObject) {
		if (oObject.nodeType && oObject.nodeType === 9) {
			oObject = oObject.firstChild;
		}
		this._oRootObject = oObject;
	};
	TreeViewer.prototype.attachSelectionChange = function(fn) {
		this.fnSelectionChange = fn;
	};
	TreeViewer.prototype.attachInfoPress = function(fn) {
		this.fnInfoPress = fn;
	};
	TreeViewer.prototype.attachNodeInfos = function(fn) {
		this.fnNodeInfos = fn;
	};
	TreeViewer.prototype.attachAttributeInfos = function(fn) {
		this.fnAttributeInfos = fn;
	};

	TreeViewer.prototype._getDataObjectByIndex = function(iIndex) {
		if (iIndex === 0) {
			return this._oRootObject;
		} else {
			iIndex--;
			var aAll = this._oRootObject.querySelectorAll("*");
			return aAll[iIndex];
		}
		return null;
	};

	TreeViewer.prototype._getIndexOfNode = function(oDataNode) {
		if (oDataNode === this._oRootObject) {
			return 0;
		} else {
			var aAll = this._oRootObject.querySelectorAll("*");
			for (var i = 0; i < aAll.length; i++) {
				if (aAll[i] === oDataNode) {
					return i + 1;
				}
			}
		}
		return -1;
	};

	TreeViewer.prototype._getStartNodeByIndex = function(iIndex) {
		return this._oRenderParent.firstChild.querySelector("[idx='" + iIndex + "']");
	};

	TreeViewer.prototype.toggleIds = function() {
		var sClassName = this._oRenderParent.firstChild.className;
		if (sClassName.indexOf(" id1") > -1) {
			this._oRenderParent.firstChild.className = sClassName.replace(" id1"," id2");
			return true;
		} else {
			this._oRenderParent.firstChild.className = sClassName.replace(" id2"," id1");
			return false;
		}
	};

	TreeViewer.prototype.toggleNS = function() {
		var sClassName = this._oRenderParent.firstChild.className;
		if (sClassName.indexOf(" hideNS") > -1) {
			this._oRenderParent.firstChild.className = sClassName.replace(" hideNS","");
			return true;
		} else {
			this._oRenderParent.firstChild.className = sClassName + " hideNS";
			return false;
		}
	};

	TreeViewer.prototype.toggleInactive = function() {
		var sClassName = this._oRenderParent.firstChild.className;
		if (sClassName.indexOf(" hideInactive") > -1) {
			this._oRenderParent.firstChild.className = sClassName.replace(" hideInactive","");
			return true;
		} else {
			this._oRenderParent.firstChild.className = sClassName + " hideInactive";
			return false;
		}
	};

	TreeViewer.prototype._iSelectedIndex = -1;
	TreeViewer.prototype._selectNode = function(iIndex, aReasons) {
		iIndex = parseInt(iIndex);
		var oNode = this._getStartNodeByIndex(iIndex);
		if (this._oSelectedNode === oNode) {
			return;
		}
		if (this._oSelectedNode) {
			this._oSelectedNode.className = this._oSelectedNode.className.replace(" select","");
		}
		this._iSelectedIndex = iIndex;
		this._oSelectedNode = oNode;
		this._oSelectedNode.className += " select";
		this.fnSelectionChange(this._getDataObjectByIndex(iIndex), aReasons);
		return true;
	};

	TreeViewer.prototype._onInfoClick = function(iIndex, iInfoIndex) {
		iIndex = parseInt(iIndex);
		this._selectNode(iIndex, ["template"]);
		this.fnInfoPress(this._getDataObjectByIndex(iIndex), parseInt(iInfoIndex));
		return true;
	};

	TreeViewer.prototype.expandNode = function(oNode) {
		var iIndex = this._getIndexOfNode(oNode);
		this.expandNodesToIndex(iIndex);
	};

	TreeViewer.prototype.expandNodesToIndex = function(iIndex) {
		var oDomRef = this._oRenderParent.firstChild.querySelector("div[idx='" + iIndex + "']");
		if (!oDomRef || oDomRef.getAttribute("visible") === "true") {
			return;
		}
		var iLevel = parseInt(oDomRef.getAttribute("level"));
		oDomRef = oDomRef.previousSibling;
		while (oDomRef) {
			var iCurrentLevel = parseInt(oDomRef.getAttribute("level"));
			if (iCurrentLevel < iLevel && oDomRef.getAttribute("collapsed") === "true") {
				this._toggleNode(parseInt(oDomRef.getAttribute("idx")));
			}
			oDomRef = oDomRef.previousSibling;
		}
	};

	TreeViewer.prototype.expandNodesWithSelectedInfo = function(iInfoIndex) {
		var aDomRefs = this._oRenderParent.firstChild.querySelectorAll("div[idx]");
		for (var i = 0; i < aDomRefs.length; i++) {
			var oInfo = aDomRefs[i].querySelector("[args='" + i + "," + iInfoIndex + "'][selected='true']");
			if (oInfo) {
				this.expandNodesToIndex(i);
			}
		}
		return this._iSelectedIndex;
	};

	TreeViewer.prototype.getSelectedIndex = function() {
		return this._iSelectedIndex;
	};

	TreeViewer.prototype.setInfoSelected = function(iIndex, iInfoIndex, bSelected, sTooltip) {
		var oInfo = this._oRenderParent.firstChild.querySelector("[args='" + iIndex + "," + iInfoIndex + "']");
		if (oInfo) {
			oInfo.setAttribute("selected", bSelected + "");
			if (sTooltip) {
				oInfo.setAttribute("title", sTooltip);
			}
		}
	};

	TreeViewer.prototype._toggleNode = function(iIndex) {
		iIndex = parseInt(iIndex);
		var oNode = this._getStartNodeByIndex(iIndex);
		if (oNode) {
			var iLevel = parseInt(oNode.getAttribute("level"));
			var oNextNode = oNode.nextSibling;
			while (oNextNode) {
				if (parseInt(oNextNode.getAttribute("level")) > iLevel) {
					if (oNode.getAttribute("collapsed") === "true") {
						if (oNextNode.getAttribute("collapsed") === "true") {
							oNextNode.setAttribute("visible", "true");
							var oNext = nextWithIndent(oNextNode);
							if (oNext) {
								oNextNode = oNext;
							}
						} else {
							oNextNode.setAttribute("visible", "true");
						}
					} else {
						oNextNode.setAttribute("visible", "false");
					}
				}
				if (parseInt(oNextNode.getAttribute("level")) === iLevel) {
					if (oNode.getAttribute("collapsed") === "true") {
						oNextNode.setAttribute("visible", "true");
					} else {
						oNextNode.setAttribute("visible", "false");
					}
					break;
				}
				oNextNode = oNextNode.nextSibling;
			}

			if (oNode.getAttribute("collapsed") === "true") {
				oNode.setAttribute("collapsed","false");
			} else {
				oNode.setAttribute("collapsed","true");
			}
		}
		this._oSelectedNode && this._oSelectedNode.focus();
		return true;
	};
	TreeViewer.prototype.highlightedDomNodes = [];

	TreeViewer.prototype.clearHighlights = function() {
		for (var i = 0; i < this.highlightedDomNodes.length; i++) {
			this.highlightedDomNodes[i].className = this.highlightedDomNodes[i].className.replace(" highlight", "");
		}
		this.highlightedDomNodes = [];
	};
	TreeViewer.prototype.highlightNodeById = function(sId) {
		var oNode = this._oRootObject.querySelector("[id='" + sId + "']");
		if (oNode) {
			this.highlightNode(oNode);
		}
	};

	TreeViewer.prototype.highlightNode = function(oNode) {
		var iIndex = this._getIndexOfNode(oNode);
		if (iIndex > -1) {
			var oDomRef = this._getStartNodeByIndex(iIndex);
			oDomRef.className += " highlight";
			this.highlightedDomNodes.push(oDomRef);
		}
	};

	TreeViewer.prototype.update = function(oDomRef) {
		if (!oDomRef && !this._oRenderParent) {
			return;
		}
		if (this._oRenderParent && oDomRef) {
			this._oRenderParent.innerHTML = "";
		}
		this._oRenderParent = oDomRef || this._oRenderParent;
		if (this._oRootObject) {
			var oRenderContext = new RenderContext();
			oRenderContext.initialExpandedLevel = this.initialExpandedLevel;
			oRenderContext.fnNodeInfos = this.fnNodeInfos || function(){};
			oRenderContext.fnAttributeInfos = this.fnAttributeInfos || function(){};
			oRenderContext.bIgnoreIds = this.bIgnoreIds;
			iIdx = -1;
			oRenderContext.add("<div class=\"treeviewer id2\" id=\"" + this.getId() + "\">");
			if (this._oRootObject && this._oRootObject.nodeType && this._oRootObject.nodeType === 1) {
				_visitNode(this._oRootObject, oRenderContext);
			}
			oRenderContext.add("</div>");
			this._oRenderParent.innerHTML = oRenderContext.toString();
			var that = this;
			this._oRenderParent.firstChild.addEventListener("click", function(oEvent) {
				var oDomRef = oEvent.target,
					bResult = false,
					aReasons = [];
				while (!bResult) {
					if (oDomRef.getAttribute("raise")) {
						if (oDomRef.getAttribute("args")) {
							var aArgs = oDomRef.getAttribute("args").split(",");
							aArgs = aArgs.concat(aReasons);
							bResult = that[oDomRef.getAttribute("raise")].apply(that, aArgs);
						} else {
							var aArgs = [oDomRef];
							aArgs = aArgs.concat(aReasons);
							bResult = that[oDomRef.getAttribute("raise")].apply(that, aArgs);
						}
					} else if (oDomRef.getAttribute("reason")) {
						aReasons.push(oDomRef.getAttribute("reason"));
					}
					oDomRef = oDomRef.parentNode;
					if (oDomRef === that._oRenderParent) {
						break;
					}
				}
			});
			this._oRenderParent.firstChild.addEventListener("mouseover", function(oEvent) {
				var oNode = oEvent.target;
				while (oNode && oNode.getAttribute && !oNode.getAttribute("collapsed")) {
					oNode = oNode.parentNode;
					if (oNode.className === "nstagend") {
						return;
					}
					if (oNode.getElementsByClassName("nstagend").length > 0) {
						oNode.getElementsByClassName("nstagend")[0].firstChild.style.border = "1px dotted green";
						return;
					}
				}
				if (!oNode || oEvent.target.tagName === "DIV") {
					return;
				}
				if (oNode.getAttribute && oNode.getAttribute("collapsed") === "false") {
					oNode = nextWithIndent(oNode);
					if (oNode) {
						var oEndNode = oNode.getElementsByClassName("nstag")[0];
						oEndNode.style.border = "1px dotted green";
					}
				}
			});
			this._oRenderParent.firstChild.addEventListener("mouseout", function(oEvent) {
				var oNode = oEvent.target;
				while (oNode && oNode.getAttribute && !oNode.getAttribute("collapsed")) {
					oNode = oNode.parentNode;
					if (oNode.className === "nstagend") {
						return;
					}
					if (oNode.getElementsByClassName("nstagend").length > 0) {
						oNode.getElementsByClassName("nstagend")[0].firstChild.style.border = "";
						return;
					}
				}
				if (!oNode || oEvent.target.tagName === "DIV") {
					return;
				}
				if (oNode.getAttribute && oNode.getAttribute("collapsed") === "false") {
					oNode = nextWithIndent(oNode);
					if (oNode) {
						var oEndNode = oNode.getElementsByClassName("nstag")[0];
						oEndNode.style.border = "";
					}
				}
			});
		}
	};

	TreeViewer.getCss = function() {
		return [
		'.treeviewer { padding-top:10px;margin-left:15px;font-family: consolas, monospace; width: 100%; overflow: auto; height: 100%; position: relative; cursor:default}',
		'.treeviewer .node {border: 1px solid transparent}',
		'.treeviewer .node.start {white-space: nowrap;}',
		'.treeviewer .node.inactive {color: gray!important; opacity:0.6}',
		'.treeviewer .node.inactive SPAN {color: gray!important; background-color:transparent!important;}',
		'.treeviewer .node.replace .nstag {text-decoration: line-through}',
		'.treeviewer .node.start.select {background-color: #fff8ad;}',
		'.treeviewer .node.start.highlight {background-color:#fff;}',
		'.treeviewer .node.end {white-space: nowrap;}',
		'.treeviewer .node .info {margin: 0px 2px}',
		'.treeviewer .node .info.orange {border: 1px solid orange;}',
		'.treeviewer .node .info.orange[selected=\'true\'] {background-color:orange;}',
		'.treeviewer .node .info.blue {border: 1px solid #007dc0;}',
		'.treeviewer .node .info.blue[selected=\'true\'] {background-color:#007dc0;}',
		'.treeviewer .node .info.green {border: 1px solid green}',
		'.treeviewer .node .info.green[selected=\'true\'] {background-color:green;}',
		'.treeviewer .node .info.red {border: 1px solid #b93232}',
		'.treeviewer .node .info.red[selected=\'true\'] {background-color:#b93232;}',
		'.treeviewer .node .info {opacity: 0.6;display: inline-block;border-radius: 10px;height: 6px;width: 6px;}',
		'.treeviewer .node .info[selected=\'true\'] {opacity: 1;display: inline-block;border-radius: 10px;height: 6px;width: 6px;}',
		'.treeviewer .node .info:hover {opacity: 1}',
		'.treeviewer .node .attrname {color:#b93232; border: 1px solid transparent; display:inline-block;}',
		'.treeviewer .node .attrname:hover {border: 1px solid #b93232;background-color:#fde3d5}',
		'.treeviewer .node .attrvalue {color:#007dc0; border: 1px solid transparent; display:inline-block;}',
		'.treeviewer .node .attr[modified=\'true\'] .attrvalue {color:#d210f3; border: 1px solid transparent; display:inline-block;}',
		'.treeviewer .node .attr[modified=\'true\'] {background-color:#ffe7fc;}',
		'.treeviewer .node .attr[oldvalue=\'null\'] .attrname {color:#d210f3; border: 1px solid transparent; display:inline-block;}',
		'.treeviewer.id1 .node .attrvalue2 {display:none;}',
		'.treeviewer.id2 .node .attrvalue1 {display:none;}',
		'.treeviewer .node .attrvalue:hover {border: 1px solid #007dc0;background-color:#e1e1ff}',
		'.treeviewer .node .ns {color:green}',
		'.treeviewer.hideNS .node .ns {display:none}',
		'.treeviewer.hideInactive .node.inactive {display:none!important}',
		'.treeviewer .node .tag {color:green}',
		'.treeviewer .node .nstag {color:green; border: 1px solid transparent; display:inline-block;}',
		'.treeviewer .node.start .nstag:hover {border: 1px solid green;background-color:#d5e6d5}',
		'.treeviewer .node.start .nstagend .nstag:hover {border: 1px solid transparent;background-color:transparent}',
		'.treeviewer .node.end[visible=\'true\'] {display: inline-block;}',
		'.treeviewer .node:focus {border: 1px dotted #e1e1ff;outline:none}',
		'.treeviewer .node.end[visible=\'true\'][haschildnodes=\'true\'] {display: block;}',
		'.treeviewer .node[visible=\'false\'] {display: none;}',
		'.treeviewer .node[collapsed=\'true\'][haschildnodes=\'true\'] .expand {border-color: transparent transparent transparent #cecece;border-radius: 0;border-style: solid;border-width: 4px 3px 4px 8px;height: 0;width: 0;position: relative;margin-top: 0px;margin-left: -10px;display: inline-block;}',
		'.treeviewer .node[collapsed=\'false\'][haschildnodes=\'true\'] .expand {border-color: #cecece transparent transparent transparent;border-radius: 0;border-style: solid;border-width: 8px 4px 0px 4px;height: 0;width: 0;position: relative;margin-top: 0px;margin-left: -12px;margin-right: 5px;display: inline-block;}',
		'.treeviewer .node[collapsed=\'true\'][haschildnodes=\'true\']:hover .expand {border-color: transparent transparent transparent #aaa;}',
		'.treeviewer .node[collapsed=\'false\'][haschildnodes=\'true\']:hover .expand {border-color: #aaa transparent transparent transparent;}',
		'.treeviewer .node[collapsed=\'true\'][haschildnodes=\'true\'] .expand:hover {border-color: transparent transparent transparent #999;}',
		'.treeviewer .node[collapsed=\'false\'][haschildnodes=\'true\'] .expand:hover {border-color: #999 transparent transparent transparent;}'].join("");
	};

	return TreeViewer;
});