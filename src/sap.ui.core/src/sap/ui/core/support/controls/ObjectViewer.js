/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/base/ManagedObject',
	"sap/base/security/encodeXML"
],
function(ManagedObject, encodeXML) {
	'use strict';
	var ObjectViewer = ManagedObject.extend("sap.ui.core.support.controls.ObjectViewer", {
		constructor: function() {
			ManagedObject.apply(this, arguments);
			this._oRenderParent = null;
			this._oRootObject = null;
		}
	});

	//private functions and vars
	var mRenderTemplates = {
		rowstart : "<div class=\"{cssclass}\" collapsed=\"{collapsed}\" visible=\"{visible}\" style=\"padding-left:{pxlevel};margin-left: 16px;\" idx=\"{idx}\" key=\"{key}\" sectionkey=\"{sectionkey}\" level=\"level\" raise=\"_select\" hover=\"_hover\" args=\"{sectionkey},{key}\">",
		namestart : "<span class=\"key\" title=\"{key}\">",
		keyinfo : "<span class=\"keyinfo {color}\" selected=\"{selected}\" sectionkey=\"{sectionkey}\" key=\"{key}\" raise=\"_keyInfoPress\" args=\"{sectionkey},{key},{infoidx}\"  title=\"{tooltip}\" style=\"margin-right:{pxlevel}\"></span>",
		nameend : "{key}</span>",
		separator : "<span class=\"colon\">:</span>",
		valuestart : "<span class=\"value\" title=\"{value}\"><input {readonly} class=\"valueInput\"value=\"{value}\" raise=\"_changeValue\" args=\"{sectionkey},{key}\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\">",
		valueend : "{value}</span>",
		rowend : "</div>",
		headerrow : "<div sectionkey=\"{sectionkey}\" collapsed=\"{collapsed}\" class=\"header\" raise=\"_toggleSection\" args=\"{sectionkey}\"><span class=\"expand\"></span>{header} ({count})</span></div>"
	};

	var iIdx = -1;
	function _visitObject(oObject, oRenderContext) {
		iIdx++;
		for (var n in oObject) {
			var bCollapsed = oRenderContext.initialExpandedSections === null || oRenderContext.initialExpandedSections.indexOf(n) === -1;
			oRenderContext.addWithParam(mRenderTemplates.headerrow, {
				idx : iIdx,
				sectionkey: n,
				header: n,
				level: 0,
				collapsed: bCollapsed,
				count: Object.keys(oObject[n]).length
			});
			var oContent = oObject[n];
			iIdx++;
			for (var m in oContent) {
				oRenderContext.addWithParam(mRenderTemplates.rowstart, {
					idx : iIdx,
					sectionkey: n,
					key: m,
					level: oContent._level || 0,
					pxlevel: ((oContent._level || 0) * 16) + "px",
					cssclass: "",
					visible: !bCollapsed,
					header: n,
					collapsed: bCollapsed
				});
				oRenderContext.addWithParam(mRenderTemplates.namestart, {
					key: m
				});
				var aInfos = oRenderContext.fnObjectInfos(oObject, n, oContent, m);
				if (aInfos) {
					for (var i = 0; i < aInfos.length; i++) {
						var oInfo = aInfos[i];
						oRenderContext.addWithParam(mRenderTemplates.keyinfo, {
							infoidx: i + "",
							sectionkey: n,
							key: m,
							pxlevel: (((oContent[m].__level || 0) * 16) + 3) + "px",
							selected: oInfo.selected || false,
							color: oInfo.color || "orange",
							tooltip: oInfo.tooltip || ""
						});
					}
				}

				oRenderContext.addWithParam(mRenderTemplates.nameend, {
					key: m
				});
				oRenderContext.addWithParam(mRenderTemplates.separator, {});
				oRenderContext.addWithParam(mRenderTemplates.valuestart, {
					value: encodeXML(String(oContent[m].value)),
					readonly: oContent[m].__change ? "" : "readonly",
					sectionkey: n,
					key: m
				});
				oRenderContext.addWithParam(mRenderTemplates.valueend, {
					value: encodeXML(String(oContent[m].value))
				});
				oRenderContext.addWithParam(mRenderTemplates.rowend, {});

				if ("value2" in oContent[m]) {
					oRenderContext.addWithParam(mRenderTemplates.rowstart, {
						idx : iIdx,
						sectionkey: n,
						key: m,
						level: oContent._level || 0,
						pxlevel: ((oContent._level || 0) * 16) + "px",
						cssclass: "hiddenkey",
						visible: !bCollapsed,
						header: n,
						collapsed: bCollapsed
					});
					oRenderContext.addWithParam(mRenderTemplates.namestart, {
						key: m
					});
					var aInfos = oRenderContext.fnObjectInfos(oObject, n, oContent, m);
					if (aInfos) {
						for (var i = 0; i < aInfos.length; i++) {
							var oInfo = aInfos[i];
							oRenderContext.addWithParam(mRenderTemplates.keyinfo, {
								infoidx: i + "",
								sectionkey: n,
								key: m,
								pxlevel: (((oContent[m].__level || 0) * 16) + 3) + "px",
								selected: oInfo.selected || false,
								color: oInfo.color || "orange",
								tooltip: encodeXML(String(oInfo.tooltip) || "")
							});
						}
					}

					oRenderContext.addWithParam(mRenderTemplates.nameend, {
						key: m
					});
					oRenderContext.addWithParam(mRenderTemplates.separator, {});
					oRenderContext.addWithParam(mRenderTemplates.valuestart, {
						value: encodeXML(String(oContent[m].value2)),
						readonly: "readonly",
						sectionkey: n,
						key: m
					});
					oRenderContext.addWithParam(mRenderTemplates.valueend, {
						value: encodeXML(String(oContent[m].value2))
					});
					oRenderContext.addWithParam(mRenderTemplates.rowend, {});

				}
			}
		}
	}

//	function _visitObject(oObject, oRenderContext) {
//		//not implemented
//	};

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
	ObjectViewer.prototype.fnSelect = function() {};
	ObjectViewer.prototype.fnHover = function() {};
	ObjectViewer.prototype.initialExpandedSections = null;
	ObjectViewer.prototype.expandedSections = [];
	ObjectViewer.prototype.setRootObject = function(oObject) {
		this._oRootObject = oObject;
	};
	ObjectViewer.prototype.attachSelect = function(fn) {
		this.fnSelect = fn;
	};
	ObjectViewer.prototype.attachHover = function(fn) {
		this.fnHover = fn;
	};
	ObjectViewer.prototype.attachObjectInfos = function(fn) {
		this.fnObjectInfos = fn;
	};
	ObjectViewer.prototype.attachInfoPress = function(fn) {
		this.fnInfoPress = fn;
	};
	ObjectViewer.prototype.setInfoSelected = function(sSectionkey, sKey, iInfo, bSelected) {
		var oInfo = this._oRenderParent.firstChild.querySelector("[args='" + sSectionkey + "," + sKey + "," + iInfo + "']");
		if (oInfo) {
			oInfo.setAttribute("selected",bSelected + "");
		}
	};
	ObjectViewer.prototype._keyInfoPress = function(sSection, sKey, iInfo) {
		iInfo = parseInt(iInfo);
		this.fnInfoPress(sSection, sKey, iInfo);
		return true;
	};

	ObjectViewer.prototype._changeValue = function(sSectionKey, sKey, sValue, oDomRef) {
		if (sValue === undefined) {
			return;
		}
		var oResult = this._oRootObject[sSectionKey][sKey].__change(sValue);
		if (oResult && oResult.error) {
			oDomRef.setAttribute("error","true");
			oDomRef.setAttribute("title", oResult.error);
		} else {
			oDomRef.removeAttribute("error");
			if ("value" in oResult) {
				if (sValue !== "" + oResult.value) {
					oDomRef.setAttribute("title", sValue + "->" + oResult.value);
				} else {
					oDomRef.setAttribute("title", oResult.value);
				}
				oDomRef.value = oResult.value;
			}
		}
	};
	ObjectViewer.prototype._toggleSection = function(sSection) {
		var aSectionNodes = this._oRenderParent.firstChild.querySelectorAll("[sectionkey='" + sSection + "']");
		if (aSectionNodes[0].getAttribute("collapsed") === "true") {
			for (var i = 1; i < aSectionNodes.length; i++) {
				aSectionNodes[i].setAttribute("visible","true");
			}
			aSectionNodes[0].setAttribute("collapsed","false");
			if (this.expandedSections.indexOf(sSection) === -1) {
				this.expandedSections.push(sSection);
			}
		} else {
			for (var i = 1; i < aSectionNodes.length; i++) {
				aSectionNodes[i].setAttribute("visible","false");
			}
			aSectionNodes[0].setAttribute("collapsed","true");
			if (this.expandedSections.indexOf(sSection) > -1) {
				this.expandedSections.splice(this.expandedSections.indexOf(sSection),1);
			}
		}
	};
	ObjectViewer.prototype._select = function(sSectionKey, sKey) {
		this.fnSelect(this._oRootObject[sSectionKey][sKey], sSectionKey, sKey);
	};

	ObjectViewer.prototype._hover = function(sSectionKey, sKey) {
		this.fnHover(this._oRootObject[sSectionKey][sKey], sSectionKey, sKey);
	};

	ObjectViewer.prototype.update = function(oDomRef) {
		if (!oDomRef && !this._oRenderParent) {
			return;
		}
		if (this._oRenderParent && oDomRef) {
			this._oRenderParent.innerHTML = "";
		}
		this._oRenderParent = oDomRef || this._oRenderParent;
		if (this._oRootObject) {
			var oRenderContext = new RenderContext();
			oRenderContext.initialExpandedSections = this.initialExpandedSections;
			oRenderContext.fnObjectInfos = this.fnObjectInfos || function(){};
			iIdx = -1;
			oRenderContext.add("<div class=\"objectviewer\" id=\"" + this.getId() + "\">");
			if (this._oRootObject) {
				_visitObject(this._oRootObject, oRenderContext);
			}
			oRenderContext.add("</div>");
			this._oRenderParent.innerHTML = oRenderContext.toString();
			var that = this;
			this._oRenderParent.firstChild.addEventListener("click", function(oEvent) {
				if (oEvent.target.tagName === "INPUT") {
					return;
				}
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
				var oDomRef = oEvent.target,
					bResult = false,
					aReasons = [];
				while (!bResult) {
					if (oDomRef.getAttribute("hover")) {
						if (oDomRef.getAttribute("args")) {
							var aArgs = oDomRef.getAttribute("args").split(",");
							aArgs = aArgs.concat(aReasons);
							bResult = that[oDomRef.getAttribute("hover")].apply(that, aArgs);
						} else {
							var aArgs = [oDomRef];
							aArgs = aArgs.concat(aReasons);
							bResult = that[oDomRef.getAttribute("hover")].apply(that, aArgs);
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
			this._oRenderParent.firstChild.addEventListener("change", function(oEvent) {

				var oDomRef = oEvent.target,
					bResult = false,
					aReasons = [],
					sValue = [oDomRef.value, oDomRef];
				while (!bResult) {
					if (oDomRef.getAttribute("raise")) {
						if (oDomRef.getAttribute("args")) {
							var aArgs = oDomRef.getAttribute("args").split(",");
							aArgs = aArgs.concat(aReasons,sValue);
							bResult = that[oDomRef.getAttribute("raise")].apply(that, aArgs);
						}
					}
					break;
				}
			});
			this._oRenderParent.firstChild.addEventListener("mouseout", function(oEvent) {
				var oDomRef = oEvent.target,
					bResult = false,
					aReasons = [];
				while (!bResult) {
					if (oDomRef.getAttribute("hover")) {
						if (oDomRef.getAttribute("args")) {
							var aArgs = oDomRef.getAttribute("args").split(",");
							aArgs = aArgs.concat(aReasons);
							bResult = that[oDomRef.getAttribute("hover")].apply(that, aArgs);
						} else {
							var aArgs = [oDomRef];
							aArgs = aArgs.concat(aReasons);
							bResult = that[oDomRef.getAttribute("hover")].apply(that, aArgs);
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
		}
	};
	ObjectViewer.getCss = function() {
		return [
		'.objectviewer {white-space: nowrap;font-family:consolas;display:block;cursor:default;width: 100%; overflow: auto; height: 100%; padding:10px; box-sizing:border-box;}',
		'.objectviewer .key {white-space: nowrap;color: #b93232; width: 40%; overflow:hidden; display: inline-block; text-overflow: ellipsis;}',
		'.objectviewer .hiddenkey .keyinfo{visibility:hidden}',
		'.objectviewer .hiddenkey .colon{visibility:hidden}',
		'.objectviewer .hiddenkey .key{visibility:hidden}',
		'.objectviewer .value {white-space: nowrap;color: #007dc0; width: 50%; overflow:hidden; display: inline-block; text-overflow: ellipsis;}',
		'.objectviewer .value .valueInput {font-family:consolas;border:none; padding:0; background-color:transparent;white-space: nowrap;color: #007dc0; width: 100%; overflow:hidden; display: inline-block; text-overflow: ellipsis;}',
		'.objectviewer .value .valueInput:not([readonly])[error=\'true\'] {color:#d80000;solid 2px rgba(255, 0, 0, 0.26)}',
		'.objectviewer .value .valueInput:not([readonly]):hover {background-color:#f5f5f5}',
		'.objectviewer .value .valueInput:not([readonly]):focus {background-color:#fff;border:none;outline:none}',
		'.objectviewer .colon {padding:0 6px;display: inline-block;overflow: hidden; width: 2%}',
		'.objectviewer .header {color:#666; font-size: 14px; font-family:arial;margin: 3px 0 2px;}',
		'.objectviewer .control .key{font-weight:bold; color:#333}',
		'.objectviewer .control .value{font-weight:bold; color:#333}',
		'.objectviewer .keyinfo.orange {border: 1px solid orange;}',
		'.objectviewer .keyinfo.blue {border: 1px solid #007dc0;}',
		'.objectviewer .keyinfo.green {border: 1px solid green;}',
		'.objectviewer .keyinfo.red {border: 1px solid #cc1919;}',
		'.objectviewer .keyinfo.orange[selected=\'true\'] {background-color: orange;}',
		'.objectviewer .keyinfo.blue[selected=\'true\'] {background-color: #007dc0;}',
		'.objectviewer .keyinfo.green[selected=\'true\'] {background-color: green;}',
		'.objectviewer .keyinfo.red[selected=\'true\'] {background-color: #cc1919;}',
		'.objectviewer .keyinfo {display: inline-block; border-radius: 10px; height: 10px;width: 10px;overflow: hidden; margin-right: 3px;position: relative;vertical-align: top;margin-top: 1px;}',
		'.objectviewer .header[collapsed=\'true\'] .expand{border-color: transparent transparent transparent #cecece;border-radius: 0;border-style: solid;border-width: 4px 3px 4px 8px;height: 0;width: 0;position: relative;margin-top: 0px;margin-left: 2px;display: inline-block;}',
		'.objectviewer [collapsed=\'false\'] .expand  {border-color: #cecece transparent transparent transparent;border-radius: 0;border-style: solid;border-width: 8px 4px 0px 4px;height: 0;width: 0;position: relative;margin-top: 0px;margin-left: 0px;margin-right: 5px;display: inline-block;}',
		'.objectviewer [collapsed=\'true\'] .expand:hover {border-color: transparent transparent transparent #aaa;}',
		'.objectviewer [collapsed=\'false\'] .expand:hover {border-color: #aaa transparent transparent transparent;}',
		'.objectviewer [visible=\'false\'] {display: none}',
		'.objectviewer .internal {opacity: 0.7}',
		'.objectviewer .private {opacity: 0.7}',
		'.objectviewer .default {opacity: 0.7}',
		'.objectviewer .end { border-top:1px solid #e0e0e0; height:1px;}'].join("");
	};

	return ObjectViewer;
});