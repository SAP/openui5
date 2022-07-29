/*!
 * ${copyright}
 */

// Provides a (modifiable) list of properties for a given control
sap.ui.define('sap/ui/debug/PropertyList', [
	'sap/ui/base/DataType',
	'sap/ui/base/EventProvider',
	'sap/ui/core/Element',
	'sap/ui/core/ElementMetadata',
	'sap/base/util/isEmptyObject',
	'sap/base/security/encodeXML'
],
	function(
		DataType,
		EventProvider,
		Element,
		ElementMetadata,
		isEmptyObject,
		encodeXML
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
		aHTML.push("Type : " + oMetadata.getName() + "<br >");
		aHTML.push("Id : " + oControl.getId() + "<br >");
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
			aHTML.push(sName);
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
		});
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

	return PropertyList;

});
