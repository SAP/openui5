/*!
 * ${copyright}
 */

// Provides a (modifiable) list of properties for a given control
sap.ui.define('sap/ui/debug/PropertyList', [
	'sap/ui/base/DataType',
	'sap/ui/base/EventProvider',
	'sap/ui/core/Element',
	'sap/ui/core/ElementMetadata',
	'sap/base/util/fetch',
	'sap/base/util/isEmptyObject',
	'sap/base/security/encodeXML',
	'sap/ui/thirdparty/jquery',
	'sap/ui/dom/jquery/rect' // jQuery Plugin "rect"
],
	function(
		DataType,
		EventProvider,
		Element,
		ElementMetadata,
		fetch,
		isEmptyObject,
		encodeXML,
		jQuery
	) {
	"use strict";


	/**
	 * Constructs the class <code>sap.ui.debug.PropertyList</code>.
	 *
	 * @class HTML Property list for a <code>sap.ui.core.Control</code> in the
	 * Debug Environment
	 *
	 * @extends sap.ui.base.EventProvider
	 * @author Martin Schaus
	 * @version ${version}
	 *
	 * @param {sap.ui.core.Core}
	 *            oCore Core instance of the app; version might differ!
	 * @param {Window}
	 *            oWindow Window in which the app is running
	 * @param {object}
	 *            oParentDomRef DOM element where the PropertyList will be rendered (part of testsuite window)
	 *
	 * @alias sap.ui.debug.PropertyList
	 * @private
	 */
	var PropertyList = EventProvider.extend("sap.ui.debug.PropertyList", /** @lends sap.ui.debug.PropertyList.prototype */ {
		constructor: function(oCore, oWindow, oParentDomRef) {
			EventProvider.apply(this,arguments);
			this.oWindow = oWindow;
			this.oParentDomRef = oParentDomRef;
		//	this.oCore = oWindow.sap.ui.getCore();
			this.oCore = oCore;
			this.bEmbedded = window.top === oWindow;
			// Note: window.top is assumed to refer to the app window in embedded mode or to the testsuite window otherwise
			var link = window.top.document.createElement("link");
			link.rel = "stylesheet";
			link.href = window.top.sap.ui.require.toUrl("sap/ui/debug/PropertyList.css");
			window.top.document.head.appendChild(link);

			this.onchange = PropertyList.prototype.onchange.bind(this);
			oParentDomRef.addEventListener("change", this.onchange);
			this.onfocus = PropertyList.prototype.onfocus.bind(this);
			oParentDomRef.addEventListener("focusin", this.onfocus);
			this.onkeydown = PropertyList.prototype.onkeydown.bind(this);
			oParentDomRef.addEventListener("keydown", this.onkeydown);
			if ( !this.bEmbedded ) {
				this.onmouseover = PropertyList.prototype.onmouseover.bind(this);
				oParentDomRef.addEventListener("mouseover", this.onmouseover);
				this.onmouseout = PropertyList.prototype.onmouseout.bind(this);
				oParentDomRef.addEventListener("mouseout", this.onmouseout);
			}
			//this.oParentDomRef.style.backgroundColor = "#e0e0e0";
			//this.oParentDomRef.style.border = "solid 1px gray";
			//this.oParentDomRef.style.padding = "2px";

		}
	});

	/**
	 * TODO: missing internal JSDoc... @author please update
	 * @private
	 */
	PropertyList.prototype.exit = function() {
		this.oParentDomRef.removeEventListener("change", this.onchange);
		this.oParentDomRef.removeEventListener("focusin", this.onfocus);
		this.oParentDomRef.removeEventListener("keydown", this.onkeydown);
		if ( !this.bEmbedded ) {
			this.oParentDomRef.removeEventListener("mouseover", this.onmouseover);
			this.oParentDomRef.removeEventListener("mouseout", this.onmouseout);
		}
	};

	/**
	 * TODO: missing internal JSDoc... @author please update
	 * @private
	 */
	PropertyList.prototype.update = function(oParams) {
		var sControlId = this.sControlId = oParams.getParameter("controlId");
		this.oParentDomRef.innerHTML = "";

		var oControl = this.oCore.byId(sControlId);
		if (!oControl) {
			this.oParentDomRef.innerHTML = "Please select a valid control";
			return;
		}
		var oMetadata = oControl.getMetadata(),
			aHTML = [];
		aHTML.push("<span data-sap-ui-quickhelp='" + this._calcHelpId(oMetadata) + "'>Type : " + oMetadata.getName() + "</span><br >");
		aHTML.push("Id : " + oControl.getId() + "<br >");
		if ( !this.bEmbedded ) {
			aHTML.push("<div id='sap-ui-quickhelp' class='sapDbgQH'>Help</div>");
		}
		aHTML.push("<div class='sapDbgSeparator'>&nbsp;</div>");
		aHTML.push("<table class='sapDbgPropertyList' cellspacing='1'><tbody>");

		while ( oMetadata instanceof ElementMetadata ) {
			var oSettings = this.getPropertyLikeSettings(oMetadata);
			if ( !isEmptyObject(oSettings) ) {
				if ( oMetadata !== oControl.getMetadata() ) {
					aHTML.push("<tr><td class='sapDbgPLSubheader' colspan=\"2\">BaseType: ");
					aHTML.push(oMetadata.getName());
					aHTML.push("</td></tr>");
				}
				this.renderSettings(aHTML, oControl, oSettings);
			}
			oMetadata = oMetadata.getParent();
		}

		aHTML.push("</tbody></table>");
		this.oParentDomRef.innerHTML = aHTML.join("");
		this.mHelpDocs = {};
	};

	PropertyList.prototype.getPropertyLikeSettings = function(oMetadata) {
		var mSettings = {};
		Object.values(oMetadata.getProperties()).forEach(function(oProp) {
			mSettings[oProp.name] = oProp;
		});
		// also display 0..1 aggregations with a simple altType
		Object.values(oMetadata.getAggregations()).forEach(function(oAggr) {
			if ( oAggr.multiple === false
				 && oAggr.altTypes && oAggr.altTypes.length
				 && DataType.getType(oAggr.altTypes[0]) != null ) {
				mSettings[oAggr.name] = oAggr;
			}
		});
		return mSettings;
	};

	/**
	 * TODO: missing internal JSDoc... @author please update
	 * @private
	 */
	PropertyList.prototype.renderSettings = function(aHTML, oControl, mSettings) {
		Object.values(mSettings).forEach(function(oSetting) {
			var sName = oSetting.name,
				oValue = oSetting.get(oControl),
				oType = oSetting.multiple === false ? DataType.getType(oSetting.altTypes[0]) : oSetting.getType();

			aHTML.push("<tr><td>");
			aHTML.push("<span data-sap-ui-quickhelp='", this._calcHelpId(oSetting._oParent, sName), "' >", sName, '</span>');
			aHTML.push("</td><td>");
			var sTitle = "";

			if ( oType.getPrimitiveType().getName() === "boolean" ) {
				aHTML.push("<input type='checkbox' data-name='" + sName + "' ");
				if (oValue == true) {
					aHTML.push("checked='checked'");
				}
				aHTML.push(">");
			} else if ( oType.isEnumType() ) {
				var oEnum = oType.getEnumValues();
				aHTML.push("<select data-name='" + sName + "'>");
				for (var n in oEnum) {
					aHTML.push("<option ");
					if (n === oValue) {
						aHTML.push(" selected ");
					}
					aHTML.push("value='" + encodeXML(n) + "'>");
					aHTML.push(encodeXML(n));
					aHTML.push("</option>");
				}
				aHTML.push("</select>");
			} else {
				var sValueClass = '';
				if ( oValue === null ) {
					sValueClass = "class='sapDbgComplexValue'";
					oValue = '(null)';
				} else if ( oValue instanceof Element ) {
					sValueClass = "class='sapDbgComplexValue'";
					if (Array.isArray(oValue)) {
						// array type (copied from primitive values above and modified the value to string / comma separated)
						oValue = oValue.join(", ");
					} else {
						oValue = String(oValue);
					}
					sTitle = ' title="This aggregation currently references an Element. You can set a ' + oType.getName() +  ' value instead"';
				}
				aHTML.push("<input type='text' " + sValueClass + " value='" + encodeXML("" + oValue) + "'" + sTitle + " data-name='" + sName + "'>");
			}
			aHTML.push("</td></tr>");
		}.bind(this));
	};

	/**
	 * TODO: missing internal JSDoc... @author please update
	 * @private
	 */
	PropertyList.prototype.onkeydown = function(oEvent) {
		var oSource = oEvent.target;
		if (oEvent.keyCode == 13 && oSource.tagName === "INPUT" && oSource.type === "text") {
			this.applyChange(oSource);
		}
	};

	/**
	 * Listener for the 'change' event of editor controls.
	 * @private
	 */
	PropertyList.prototype.onchange = function(oEvent) {
		var oSource = oEvent.target;
		if (oSource.tagName === "SELECT" || oSource.tagName === "INPUT") {
			this.applyChange(oSource);
		}
	};

	/**
	 * TODO: missing internal JSDoc... @author please update
	 * @private
	 */
	PropertyList.prototype.onfocus = function(oEvent) {
		var oSource = oEvent.target;
		if (oSource.tagName === "INPUT" && oSource.dataset.name ) {
			if ( oSource.style.color === '#a5a5a5' /* && oSource.value === '(null)' */ ) {
				oSource.style.color = '';
				oSource.value = '';
			}
		}
	};

	/**
	 * Applies the current value from the given editor field
	 * to the corresponding setting of the currently displayed control or element.
	 * @param {HTMLInputElement|HTMLSelectElement} oField An editor field
	 * @private
	 */
	PropertyList.prototype.applyChange = function(oField) {
		var oControl = this.oCore.byId(this.sControlId),
			sName = oField.dataset.name,
			oSetting = oControl.getMetadata().getPropertyLikeSetting(sName);

		if ( oSetting ) {
			var sValue = oField.type === "checkbox" ? String(oField.checked) : oField.value,
				oType = oSetting.multiple != null ? DataType.getType(oSetting.altTypes[0]) : oSetting.getType();
			if (oType) {
				var vValue = oType.parseValue(sValue);
				if (oType.isValid(vValue) && vValue !== "(null)" ) {
					oSetting.set(oControl, vValue);
					oField.classList.remove("sapDbgComplexValue");
				}
			}
		}
	};

	PropertyList.prototype.showQuickHelp = function(oSource) {
		if ( this.oQuickHelpTimer ) {
			clearTimeout(this.oQuickHelpTimer);
			this.oQuickHelpTimer = undefined;
		}
		var oTooltipDomRef = this.oParentDomRef.ownerDocument.getElementById("sap-ui-quickhelp");
		if ( oTooltipDomRef ) {
			this.sCurrentHelpId = oSource.getAttribute("data-sap-ui-quickhelp");
			var oRect = jQuery(oSource).rect();
			oTooltipDomRef.style.left = (oRect.left + 40 + 10) + "px";
			oTooltipDomRef.style.top = (oRect.top - 40) + "px";
			oTooltipDomRef.style.display = 'block';
			oTooltipDomRef.style.opacity = '0.2';
			if ( this.mHelpDocs[this.sCurrentHelpId] ) {
				this.updateQuickHelp(this.mHelpDocs[this.sCurrentHelpId], 2000);
			} else {
				oTooltipDomRef.innerHTML = "<b>Quickhelp</b> for " + this.sCurrentHelpId + " is being retrieved...";
				this.sCurrentHelpDoc = this.sCurrentHelpId;
				this.sCurrentHelpDocPart = undefined;
				if ( this.sCurrentHelpId.indexOf('#') >= 0 ) {
					this.sCurrentHelpDoc = this.sCurrentHelpId.substring(0, this.sCurrentHelpId.indexOf('#'));
					this.sCurrentHelpDocPart = this.sCurrentHelpId.substring(this.sCurrentHelpId.indexOf('#') + 1);
				}
				var sUrl = this.oWindow.jQuery.sap.getModulePath(this.sCurrentHelpDoc, ".control");
				var that = this;

				fetch(sUrl, {
					headers: {
						Accept: fetch.ContentTypes.XML
					}
				}).then(function(response) {
					if (response.ok) {
						return response.text().then(function(responseText) {
							var parser = new DOMParser();
							var data = parser.parseFromString(responseText, "application/xml");
							that.receiveQuickHelp(data);
						});
					} else {
						throw new Error(response.statusText || response.status);
					}
				}).catch(function() {
					that.receiveQuickHelp(undefined);
				});
				this.oQuickHelpTimer = setTimeout(function () {
					that.hideQuickHelp();
				}, 2000);
			}
		}
	};

	// ---- Quickhelp ----

	PropertyList.prototype.receiveQuickHelp = function(oDocument) {
		if ( oDocument ) {
			var oControlNode = oDocument.getElementsByTagName("control")[0];
			if ( oControlNode ) {
				var get = function(oXMLNode, sName) {
					var result = [];
					var oCandidate = oXMLNode.firstChild;
					while ( oCandidate ) {
						if ( sName === oCandidate.nodeName ) {
							result.push(oCandidate);
						}
						oCandidate = oCandidate.nextSibling;
					}
					return result;
				};
				var aName = get(oControlNode, "name");
				var sName = '';
				if ( aName[0] ) {
					sName = aName[0].text || aName[0].textContent;
				}
				var aDocumentation = get(oControlNode, "documentation");
				if ( aDocumentation[0] ) {
					if ( sName && aDocumentation[0] ) {
						var doc = [];
						doc.push("<div class='sapDbgQHClassTitle'>", sName.replace('/', '.'), "</div>");
						doc.push("<div class='sapDbgQHDocPadding'>", aDocumentation[0].text || aDocumentation[0].textContent, "</div>");
						this.mHelpDocs[this.sCurrentHelpDoc] = doc.join("");
					}
				}
				var aProperties = get(oControlNode, "properties");
				if ( aProperties[0] ) {
					aProperties = get(aProperties[0], "property");
				}
				for (var i = 0, l = aProperties.length; i < l; i++) {
					var oProperty = aProperties[i];
					var sName = oProperty.getAttribute("name");
					var sType = oProperty.getAttribute("type") || "string";
					var sDefaultValue = oProperty.getAttribute("defaultValue") || "empty/undefined";
					var aDocumentation = get(oProperty, "documentation");
					if ( sName && aDocumentation[0] ) {
						var doc = [];
						doc.push("<div class='sapDbgQHSettingDoc'>", sName, "</div>");
						doc.push("<div class='sapDbgQHDocPadding'><i><strong>Type</strong></i>: ", sType, "</div>");
						doc.push("<div class='sapDbgQHDocPadding'>", aDocumentation[0].text || aDocumentation[0].textContent, "</div>");
						doc.push("<div class='sapDbgQHDocPadding'><i><strong>Default Value</strong></i>: ", sDefaultValue, "</div>");
						this.mHelpDocs[this.sCurrentHelpDoc + "#" + sName] = doc.join("");
					}
				}
				var aProperties = get(oControlNode, "aggregations");
				if ( aProperties[0] ) {
					aProperties = get(aProperties[0], "aggregation");
				}
				for (var i = 0, l = aProperties.length; i < l; i++) {
					var oProperty = aProperties[i];
					var sName = oProperty.getAttribute("name");
					var sType = oProperty.getAttribute("type") || "sap.ui.core/Control";
					var sDefaultValue = oProperty.getAttribute("defaultValue") || "empty/undefined";
					var aDocumentation = get(oProperty, "documentation");
					if ( sName && aDocumentation[0] && !this.mHelpDocs[this.sCurrentHelpDoc + "#" + sName]) {
						var doc = [];
						doc.push("<div class='sapDbgQHSettingTitle'>", sName, "</div>");
						doc.push("<div class='sapDbgQHDocPadding'><i><strong>Type</strong></i>: ", sType, "</div>");
						doc.push("<div class='sapDbgQHDocPadding'>", aDocumentation[0].text || aDocumentation[0].textContent, "</div>");
						doc.push("<div class='sapDbgQHDocPadding'><i><strong>Default Value</strong></i>: ", sDefaultValue, "</div>");
						this.mHelpDocs[this.sCurrentHelpDoc + "#" + sName] = doc.join("");
					}
				}
			}
			if ( this.mHelpDocs[this.sCurrentHelpId] ) {
				this.updateQuickHelp(this.mHelpDocs[this.sCurrentHelpId], 2000);
			} else {
				this.updateQuickHelp(undefined, 0);
			}
		} else {
			this.updateQuickHelp(undefined, 0);
		}
	};

	PropertyList.prototype.updateQuickHelp = function(sNewContent, iTimeout) {
		if ( this.oQuickHelpTimer ) {
			clearTimeout(this.oQuickHelpTimer);
			this.oQuickHelpTimer = undefined;
		}
		var oTooltipDomRef = this.oParentDomRef.ownerDocument.getElementById("sap-ui-quickhelp");
		if ( oTooltipDomRef ) {
			if ( !sNewContent ) {
				oTooltipDomRef.innerHTML = "<i>No quick help...</i>";
				oTooltipDomRef.style.display = 'none';
			} else {
				oTooltipDomRef.innerHTML = sNewContent;
				this.oQuickHelpTimer = setTimeout(function () {
					this.hideQuickHelp();
				}.bind(this), iTimeout);
			}
		}
	};

	PropertyList.prototype.hideQuickHelp = function() {
		var oTooltipDomRef = this.oParentDomRef.ownerDocument.getElementById("sap-ui-quickhelp");
		if ( oTooltipDomRef ) {
			oTooltipDomRef.style.display = 'none';
		}
		this.bMovedOverTooltip = false;
	};

	PropertyList.prototype._calcHelpId = function(oMetadata, sName) {
		var sHelpId = oMetadata.getName();
		if ( sName ) {
			sHelpId = sHelpId + "#" + sName;
		}
		return sHelpId;
	};

	PropertyList.prototype._isChildOfQuickHelp = function(oDomRef) {
		while ( oDomRef ) {
			if ( oDomRef.id === "sap-ui-quickhelp" ) {
				return true;
			}
			oDomRef = oDomRef.parentNode;
		}
		return false;
	};

	/**
	 * TODO: missing internal JSDoc... @author please update
	 * @private
	 */
	PropertyList.prototype.onmouseover = function(oEvent) {
		var oSource = oEvent.target;
		if ( this._isChildOfQuickHelp(oSource) ) {
			// if the user enters the tooltip with the mouse, we don't close it automatically
			if ( this.oQuickHelpTimer ) {
				clearTimeout(this.oQuickHelpTimer);
				this.oQuickHelpTimer = undefined;
			}
			this.bMovedOverTooltip = true;
			var oTooltipDomRef = this.oParentDomRef.ownerDocument.getElementById("sap-ui-quickhelp");
			if ( oTooltipDomRef ) {
				oTooltipDomRef.style.opacity = '';
			}
		} else if ( oSource.getAttribute("data-sap-ui-quickhelp") ) {
			this.showQuickHelp(oSource);
		}
	};

	/**
	 * TODO: missing internal JSDoc... @author please update
	 * @private
	 */
	PropertyList.prototype.onmouseout = function(oEvent) {
		var oSource = oEvent.target;
		if ( this._isChildOfQuickHelp(oSource) ) {
			if ( this.oQuickHelpTimer ) {
				clearTimeout(this.oQuickHelpTimer);
				this.oQuickHelpTimer = undefined;
			}
			this.bMovedOverTooltip = false;
			this.oQuickHelpTimer = setTimeout(function () {
				this.hideQuickHelp();
			}.bind(this), 50);
		} else if (oSource.getAttribute("data-sap-ui-quickhelp")) {
			if ( this.oQuickHelpTimer ) {
				clearTimeout(this.oQuickHelpTimer);
				this.oQuickHelpTimer = undefined;
			}
			if ( !this.bMovedOverTooltip ) {
				this.oQuickHelpTimer = setTimeout(function () {
					this.hideQuickHelp();
				}.bind(this), 800);
			}
		}
	};

	return PropertyList;

});
