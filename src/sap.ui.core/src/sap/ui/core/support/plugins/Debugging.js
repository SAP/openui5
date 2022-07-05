/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.Debugging
sap.ui.define([
	'sap/ui/core/support/Plugin',
	"sap/base/security/encodeXML",
	"sap/base/util/each",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/cursorPos", // provides jQuery.fn.cursorPos
	"sap/ui/dom/jquery/selectText" // provides jQuery.fn.selectText
],
	function(Plugin, encodeXML, each, KeyCodes, jQuery) {
		"use strict";


		var Debugging = Plugin.extend("sap.ui.core.support.plugins.Debugging", {
			constructor: function(oSupportStub) {
				Plugin.apply(this, ["sapUiSupportDebugging", "Debugging", oSupportStub]);
				this._oStub = oSupportStub;
				this._aEventIds = [
					this.getId() + "ReceiveClasses",
					this.getId() + "ReceiveClassMethods",
					this.getId() + "SaveUrlIfNew",
					this.getId() + "AppendUserUrls"
				];

				this._breakpointId = "sapUiSupportBreakpoint";
				this._localStorageId = "sapUiSupportLocalStorage";
				this._techInfoId = "sapUiSupportTechInfo";

				this._aClasses = [];
				this._mAddedClasses = {};
				this._sSelectedClass = "";
				this._mRebootUrls = {};

			}
		});

		Debugging.prototype.isToolPlugin = function(){
			return true;
		};

		Debugging.prototype.isAppPlugin = function(){
			return false;
		};

		Debugging.prototype.init = function(oSupportStub) {
			Plugin.prototype.init.apply(this, arguments);

			this.renderContainer();
			this._populateRebootUrls();

			this._oStub.sendEvent(this._breakpointId + "RequestClasses", {
				callback: this.getId() + "ReceiveClasses"
			});
		};

		Debugging.prototype.exit = function(oSupportStub) {
			Plugin.prototype.exit.apply(this, arguments);
		};

		Debugging.prototype.renderContainer = function() {

			var rm = sap.ui.getCore().createRenderManager();

			rm.openStart("div", this.getId() + "-RebootContainer").class("sapUiSupportContainer").openEnd();
				rm.openStart("div").class("sapUISupportLabel").class("sapUISupportLabelBold").openEnd().text("Note: Designed to work with apps loaded with the standard UI5 loading bootstrap script tag:").close("div");
				rm.openStart("div").class("sapUISupportLabel").class("sapUISupportLabelBold").openEnd().text("<" + "script id=\"sap-ui-bootstrap\" src=\"somepath/resources/sap-ui-core.js\" ...");
				rm.voidStart("br").voidEnd();
				rm.voidStart("br").voidEnd();
				rm.close("div");

				rm.openStart("div").class("sapUISupportLabel").openEnd().text("Boot application with different UI5 version on next reload:").close("div");
				rm.openStart("select", this.getId() + "-RebootSelect").class("sapUiSupportSelect").openEnd();
				rm.openStart("option").attr("value", "none").openEnd().text("Disabled (no custom reboot URL)").close("option");
				rm.openStart("option", this.getId() + "-RebootOther").attr("value", "other").openEnd().text("Other (enter URL to sap-ui-core.js below)...:").close("option");
				rm.close("select");
				rm.voidStart("input", this.getId() + "-RebootInput").attr("type", "text").attr("disabled", "disabled").voidEnd();
				rm.openStart("button", this.getId() + "-Reboot").class("sapUiSupportRoundedButton").openEnd().text("Activate Reboot URL").close("button");
			rm.close("div");

			rm.openStart("div", this.getId() + "-ClassContainer").class("sapUiSupportContainer").openEnd().close("div");
			rm.openStart("div", this.getId() + "-MethodContainer").class("sapUiSupportContainer").openEnd().close("div");

			rm.flush(this.dom());
			rm.destroy();

			// register listeners
			this.dom("Reboot").addEventListener("click", this._onUseOtherUI5Version.bind(this));
			this.dom("RebootSelect").addEventListener("change", this._onUI5VersionDropdownChanged.bind(this));
		};

		Debugging.prototype.renderClasses = function() {

			var that = this;

			var aClasses = this._aClasses;
			var rm = sap.ui.getCore().createRenderManager();

			rm.openStart("div").class("sapUISupportLabel").openEnd().text("Select Class:").close("div");

			rm.openStart("select", this.getId() + "-ClassSelect").class("sapUiSupportAutocomplete").class("sapUiSupportSelect").openEnd();
			rm.openStart("option").openEnd().close("option");

			each(aClasses, function(iIndex, oValue) {
				if (typeof (that._mAddedClasses[oValue]) === 'undefined') {
					rm.openStart("option").openEnd();
					rm.text(oValue);
					rm.close("option");
				}
			});

			rm.close("select");

			rm.voidStart("input", this.getId() + "-ClassInput").class("sapUiSupportAutocomplete").attr("type", "text").voidEnd();
			rm.openStart("button", this.getId() + "-AddClass").class("sapUiSupportRoundedButton").openEnd().text("Add class").close("button");

			rm.voidStart("hr").class("no-border").voidEnd();
			rm.openStart("ul", this.getId() + "-ClassList").class("sapUiSupportList").openEnd();

			each(aClasses, function(iIndex, oValue) {
				if (typeof (that._mAddedClasses[oValue]) === 'undefined') {
					return;
				}

				var bpCount = that._mAddedClasses[oValue].bpCount;
				var bpCountText = "";

				if (bpCount) {
					bpCountText = bpCount.active + " / " + bpCount.all;
				}

				rm.openStart("li").attr("data-class-name", oValue);
				if (that._sSelectedClass === oValue) {
					rm.class("selected");
				}
				rm.openEnd();

				rm.openStart("div").openEnd()
					.openStart("span").class("className").openEnd()
					.text(oValue)
					.close("span")
					.openStart("span").class("breakpoints").openEnd()
					.text(bpCountText)
					.close("span")
				.close("div")
				.voidStart("img").class("remove-class").attr("src", "../../debug/images/delete.gif").attr("alt", "X").voidEnd();

				rm.close("li");
			});

			rm.close("ul");

			rm.flush(this.dom("ClassContainer"));
			rm.destroy();

			// register listeners
			this.dom("ClassInput").addEventListener("keyup", this._autoComplete.bind(this));
			this.dom("ClassInput").addEventListener("blur", this._updateSelectOptions.bind(this));
			this.dom("ClassSelect").addEventListener("change", this._selectOptionsChanged.bind(this));
			this.dom("AddClass").addEventListener("click", this._onAddClassClicked.bind(this));
			this.dom("ClassList").addEventListener("click", this._onSelectOrRemoveClass.bind(this));
		};

		Debugging.prototype.renderMethods = function(mMethods) {

			var rm = sap.ui.getCore().createRenderManager();

			if (typeof (mMethods) === 'undefined') {
				rm.openStart("p").openEnd().text("Select a class in the list on the left side to add breakpoint.").close("p");
				rm.flush(this.dom("MethodContainer"));
				rm.destroy();
				return;
			}

			rm.openStart("div").class("sapUISupportLabel").openEnd().text("Select Method").close("div");

			rm.openStart("select", this.getId() + "-MethodSelect").class("sapUiSupportAutocomplete").class("sapUiSupportSelect").openEnd()
				.openStart("option").openEnd().close("option");

			each(mMethods, function(iIndex, oValue) {
				if (!oValue.active) {
					rm.openStart("option").attr("data-method-type", oValue.type).openEnd();
					rm.text(oValue.name);
					rm.close("option");
				}
			});

			rm.close("select");

			rm.voidStart("input", this.getId() + "-MethodInput").class("sapUiSupportAutocomplete").attr("type", "text").voidEnd();
			rm.openStart("button", this.getId() + "-AddBreakpoint").class("sapUiSupportRoundedButton").openEnd().text("Add breakpoint").close("button");

			rm.voidStart("hr").class("no-border").voidEnd();
			rm.openStart("ul", this.getId() + "-BreakpointList").class("sapUiSupportList").class("sapUiSupportBreakpointList").openEnd();

			each(mMethods, function(iIndex, oValue) {
				if (!oValue.active) {
					return;
				}

				rm.openStart("li").attr("data-method-name", oValue.name).attr("data-method-type", oValue.type).openEnd()
					.openStart("span").openEnd().text(oValue.name).close("span")
					.voidStart("img").class("remove-breakpoint").attr("src", "../../debug/images/delete.gif").attr("alt", "Remove").voidEnd()
					.close("li");
			});

			rm.close('ul');

			rm.flush(this.dom("MethodContainer"));
			rm.destroy();

			this.dom("MethodInput").addEventListener("keyup", this._autoComplete.bind(this));
			this.dom("MethodInput").addEventListener("blur", this._updateSelectOptions.bind(this));
			this.dom("MethodSelect").addEventListener("change", this._selectOptionsChanged.bind(this));
			this.dom("AddBreakpoint").addEventListener("click", this._onAddBreakpointClicked.bind(this));
			this.dom("BreakpointList").addEventListener("click", this._onRemoveBreakpoint.bind(this));

		};

		Debugging.prototype.onsapUiSupportDebuggingReceiveClasses = function(oEvent) {
			this._aClasses = JSON.parse(oEvent.getParameter("classes"));
			this.renderClasses();
			this.renderMethods();

			this.dom("ClassInput").focus();
		};

		Debugging.prototype.onsapUiSupportDebuggingReceiveClassMethods = function(oEvent) {
			var mMethods = JSON.parse(oEvent.getParameter("methods"));
			this.renderMethods(mMethods);

			var sClassName = oEvent.getParameter("className");
			var mBreakpointCount = JSON.parse(oEvent.getParameter("breakpointCount"));

			this._mAddedClasses[sClassName] = {
				bpCount: mBreakpointCount
			};

			// Update breakpoint-count
			var oBreakpoints = this.dom('li[data-class-name="' + sClassName + '"] span.breakpoints');
			oBreakpoints.textContent = mBreakpointCount.active + " / " + mBreakpointCount.all;

			this.dom("MethodInput").focus();
		};

		Debugging.prototype._autoComplete = function(oEvent) {

			var oInput = oEvent.target;

			if (oEvent.keyCode == KeyCodes.ENTER) {
				this._updateSelectOptions(oEvent);

				if (oInput.id === this.getId() + "-ClassInput") {
					this._onAddClassClicked();
				} else {
					this._onAddBreakpointClicked();
				}
				return;
			}

			if (oEvent.keyCode >= KeyCodes.ARROW_LEFT && oEvent.keyCode <= KeyCodes.ARROW_DOWN) {
				return;
			}

			var sInputVal = oInput.value,
				oSelect = oInput.previousElementSibling;

			if (sInputVal == "") {
				return;
			}

			var aOptions = Array.from(oSelect.querySelectorAll("option")).map(function(oOption) {
				return oOption.value;
			});

			var sOption;

			for (var i = 0; i < aOptions.length; i++) {
				sOption = aOptions[i];

				if (sOption.toUpperCase().indexOf(sInputVal.toUpperCase()) == 0) {

					var $input = jQuery(oInput),
						iCurrentStart = $input.cursorPos();

					if (oEvent.keyCode == KeyCodes.BACKSPACE) {
						iCurrentStart--;
					}

					oInput.value = sOption;
					$input.selectText(iCurrentStart, sOption.length);

					break;
				}
			}

			return;
		};

		Debugging.prototype._onAddClassClicked = function() {

			var sClassName = this.dom("ClassInput").value;

			this._mAddedClasses[sClassName] = {};

			this.renderClasses();
			this.dom("ClassInput").focus();
		};

		Debugging.prototype._onRemoveClass = function(oEvent) {

			var oLi = oEvent.target.closest("li[data-class-name]");
			var sClassName = oLi.dataset.className;

			delete this._mAddedClasses[sClassName];

			var wasSelected = false;

			if (this._sSelectedClass === sClassName) {
				this._sSelectedClass = "";
				wasSelected = true;
			}

			this._oStub.sendEvent(this._breakpointId + "RemoveAllClassBreakpoints", {
				className: sClassName
			});

			this.renderClasses();

			if (wasSelected) {
				// rerender method view
				this.renderMethods();
			}

			this.dom("ClassInput").focus();
		};

		Debugging.prototype._onAddBreakpointClicked = function() {
			this.changeBreakpoint(
				this.dom("ClassList").querySelector("li.selected").dataset.className,
				this.dom("MethodInput").value,
				this.dom("MethodSelect").querySelector("option:checked").dataset.methodType, true);
		};

		Debugging.prototype._onRemoveBreakpoint = function(oEvent) {
			if (oEvent.target.nodeName === "IMG" && oEvent.target.classList.contains("remove-breakpoint")) {
				var oLi = oEvent.target.closest("li");
				this.changeBreakpoint(
					this.dom("ClassList").querySelector("li.selected").dataset.className,
					oLi.dataset.methodName,
					oLi.dataset.methodType, false);
			}
		};

		Debugging.prototype._updateSelectOptions = function(oEvent) {

			var oSelect = oEvent.srcElement || oEvent.target;

			if (oSelect.tagName == "INPUT") {
				var sValue = oSelect.value;
				oSelect = oSelect.previousSibling;
				var aOptions = oSelect.options;
				for (var i = 0;i < aOptions.length;i++) {
					var sText = aOptions[i].value || aOptions[i].text;
					if (sText.toUpperCase() == sValue.toUpperCase()) {
						oSelect.selectedIndex = i;
						break;
					}
				}
			}

			var selIndex = oSelect.selectedIndex;
			var sClassName = oSelect.options[selIndex].value || oSelect.options[selIndex].text;

			if (oSelect.nextSibling && oSelect.nextSibling.tagName == "INPUT") {
				oSelect.nextSibling.value = sClassName;
			}

		};

		Debugging.prototype._selectOptionsChanged = function (oEvent) {

			var oSelect = oEvent.srcElement || oEvent.target;

			var oInput = oSelect.nextSibling;

			oInput.value = oSelect.options[oSelect.selectedIndex].value;
		};

		Debugging.prototype._onSelectOrRemoveClass = function(oEvent) {
			if (oEvent.target.nodeName === "IMG" && oEvent.target.classList.contains("remove-class")) {
				this._onRemoveClass(oEvent);
			} else {
				this._onSelectClass(oEvent);
			}
		};

		Debugging.prototype._onSelectClass = function(oEvent) {

			var oLi = oEvent.target.closest("li[data-class-name]");

			if (oLi == null || oLi.classList.contains("selected")) {
				return;
			}

			// single selecT: deselect all others, select the current one
			oLi.parentElement.querySelectorAll("li.selected").forEach(function(node) {
				node.classList.remove("selected");
			});
			oLi.classList.add("selected");

			var className = this._sSelectedClass = oLi.dataset.className;

			this._oStub.sendEvent(this._breakpointId + "RequestClassMethods", {
				className: className,
				callback: this.getId() + "ReceiveClassMethods"
			});
		};

		Debugging.prototype._isClassSelected = function() {
			var selected = false;
			each(this._mClasses, function(iIndex, oValue) {
				if (oValue.selected === true) {
					selected = true;
				}
			});
			return selected;
		};

		Debugging.prototype.changeBreakpoint = function(className, methodName, type, active) {
			this._oStub.sendEvent(this._breakpointId + "ChangeClassBreakpoint", {
				className: className,
				methodName: methodName,
				active: active,
				type: parseInt(type),
				callback: this.getId() + "ReceiveClassMethods"
			});
		};

		/* "reboot with other UI5 core" methods */

		Debugging.prototype._populateRebootUrls = function() { // checks whether known URLs where UI5 could be booted from are reachable

			// these are the known standard URLs; add them to the dropdown if reachable
			this._mRebootUrls = {
				// unfortunately we are not allowed to add the known internal URLs here
				"https://openui5.hana.ondemand.com/resources/sap-ui-core.js": "Public OpenUI5 server",
				"https://openui5beta.hana.ondemand.com/resources/sap-ui-core.js": "Public OpenUI5 PREVIEW server",
				"https://sapui5.hana.ondemand.com/resources/sap-ui-core.js": "Public SAPUI5 server",
				"http://localhost:8080/testsuite/resources/sap-ui-core.js": "Localhost (port 8080), /testsuite ('grunt serve' URL)",
				"http://localhost:8080/sapui5/resources/sap-ui-core.js": "Localhost (port 8080), /sapui5 (maven URL)"
			};

			this._testAndAddUrls(this._mRebootUrls);

			// also try any previously entered URLs
			// need to get them from the domain of the app window
			// but the app plugins are initialized AFTER the tool popup plugins...
			var that = this;
			window.setTimeout(function(){
				that._oStub.sendEvent(that._localStorageId + "GetItem", {
					id: "sap-ui-reboot-URLs",
					callback: that.getId() + "AppendUserUrls"
				});
			}, 0);
		};

		Debugging.prototype._testAndAddUrls = function(mUrls) {
			var oOther = this.dom("RebootOther");
			function createAppendFunction(sUrl) {
				return function() {
					// append URL and description to select box
					var sHtml = "<option value='" + encodeXML(sUrl) + "'>" + mUrls[sUrl] + "</option>";
					oOther.insertAdjacentHTML("beforebegin", sHtml);
				};
			}

			// send an async HEAD request to each URL and append URL to the list in case of success
			for (var sUrl in mUrls) {
				jQuery.ajax({
					type: "HEAD",
					url: sUrl,
					success: createAppendFunction(sUrl)
				});
			}
		};

		Debugging.prototype.onsapUiSupportDebuggingAppendUserUrls = function(oEvent) {
			var sUserUrls = oEvent.getParameter("value"),
				mUrls = {},
				aUserUrls = sUserUrls.split(" ");

			for (var i = 0; i < aUserUrls.length; i++) {
				var sUrl = aUserUrls[i];
				if (sUrl && !this._mRebootUrls[sUrl]) {
					mUrls[sUrl] = encodeXML(sUrl) + " (user-defined URL)";
				}
			}

			this._testAndAddUrls(mUrls);
		};

		Debugging.prototype._onUI5VersionDropdownChanged = function() {
			var sRebootUrl = this.dom("RebootSelect").value,
				oInput = this.dom("RebootInput");

			if (sRebootUrl === "other") {
				// enable input field for custom URL
				oInput.disabled = false;

			} else {
				// disable input field and fill the selected URL (if any)
				oInput.disabled = true;
				if (sRebootUrl === "none") {
					oInput.value = "";
				} else {
					oInput.value = sRebootUrl;
				}
			}
		};

		Debugging.prototype._onUseOtherUI5Version = function() {
			var sRebootUrl = this.dom("RebootSelect").value;
			if (sRebootUrl === "other") {
				// use content of input field
				sRebootUrl = this.dom("RebootInput").value;
			}

			if (!sRebootUrl || sRebootUrl === "none") {
				// no custom reboot
				this._oStub.sendEvent(this._techInfoId + "SetReboot", {
					rebootUrl: null
				});
				/*eslint-disable no-alert */
				alert("Reboot URL cleared. App will start normally.");
				/*eslint-enable no-alert */
			} else {
				// configure a reboot in the original window
				this._oStub.sendEvent(this._techInfoId + "SetReboot", {
					rebootUrl: sRebootUrl
				});

				// remember this URL in case it is a custom one
				if (!this._mRebootUrls[sRebootUrl]) {
					// need to get them from the domain of the app window
					this._oStub.sendEvent(this._localStorageId + "GetItem", {
						id: "sap-ui-reboot-URLs",
						passThroughData: sRebootUrl,
						callback: this.getId() + "SaveUrlIfNew"
					});
				}
			}
		};

		/*
		 * Receives a string containing a list of custom reboot URLs;
		 */
		Debugging.prototype.onsapUiSupportDebuggingSaveUrlIfNew = function(oEvent) {
			var sUserUrls = oEvent.getParameter("value"),
				sNewUrl = oEvent.getParameter("passThroughData"),
				aUserUrls = sUserUrls.split(" ");

			if (aUserUrls.indexOf(sNewUrl) === -1) {
				aUserUrls.push(sNewUrl.replace(/ /g,"%20"));

				this._oStub.sendEvent(this._localStorageId + "SetItem", {
					id: "sap-ui-reboot-URLs",
					value: aUserUrls.join(" ")
				});
			}
		};

	return Debugging;

});