/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.Debugging
sap.ui.define(['jquery.sap.global', 'sap/ui/core/RenderManager', 'sap/ui/core/support/Plugin'],
	function(jQuery, RenderManager, Plugin) {
	"use strict";


	
	
	
		var $ = jQuery;
		var Debugging = Plugin.extend("sap.ui.core.support.plugins.Debugging", {
			constructor: function(oSupportStub) {
				Plugin.apply(this, ["sapUiSupportDebugging", "Debugging", oSupportStub]);
	
				// tools plugin only!
				if (!this.isToolPlugin()) {
					throw Error();
				}
	
				this._oStub = oSupportStub;
	
				this._aEventIds = [
					this.getId() + "ReceiveClasses",
					this.getId() + "ReceiveClassMethods"
				];
	
				this._breakpointId = "sapUiSupportBreakpoint";
	
				this._aClasses = [];
				this._mAddedClasses = {};
				this._sSelectedClass = "";
	
			}
		});
	
		Debugging.prototype.init = function(oSupportStub) {
			Plugin.prototype.init.apply(this, arguments);
	
			if (this.isToolPlugin()) {
				var _$ = this.$();
				_$.on("keyup", '#sapUiSupportDebuggingClassInput', $.proxy(this._autoComplete, this));
				_$.on("blur", '#sapUiSupportDebuggingClassInput', $.proxy(this._updateSelectOptions, this));
				_$.on("change", '#sapUiSupportDebuggingClassSelect', $.proxy(this._selectOptionsChanged, this));
				_$.on("click", '#sapUiSupportDebuggingAddClass', $.proxy(this._onAddClassClicked, this));
				_$.on("click", '#sapUiSupportDebuggingClassList li div', $.proxy(this._onSelectClass, this));
				_$.on("click", '#sapUiSupportDebuggingClassList li img.remove-class', $.proxy(this._onRemoveClass, this));
				_$.on("keyup", '#sapUiSupportDebuggingMethodInput', $.proxy(this._autoComplete, this));
				_$.on("blur", '#sapUiSupportDebuggingMethodInput', $.proxy(this._updateSelectOptions, this));
				_$.on("change", '#sapUiSupportDebuggingMethodSelect', $.proxy(this._selectOptionsChanged, this));
				_$.on("click", '#sapUiSupportDebuggingAddBreakpoint', $.proxy(this._onAddBreakpointClicked, this));
				_$.on("click", '#sapUiSupportDebuggingBreakpointList li img.remove-breakpoint', $.proxy(this._onRemoveBreakpoint, this));
	
				this.renderContainer();
	
				this._oStub.sendEvent(this._breakpointId + "RequestClasses", {
					callback: this.getId() + "ReceiveClasses"
				});
	
			}
	
		};
	
		Debugging.prototype.exit = function(oSupportStub) {
			Plugin.prototype.exit.apply(this, arguments);
	
			if (this.isToolPlugin()) {
				var _$ = this.$();
				_$.off("keyup", '#sapUiSupportDebuggingClassInput');
				_$.on("blur", '#sapUiSupportDebuggingClassInput');
				_$.on("change", '#sapUiSupportDebuggingClassSelect');
				_$.on("click", '#sapUiSupportDebuggingAddClass');
				_$.on("click", '#sapUiSupportDebuggingClassList li div');
				_$.on("click", '#sapUiSupportDebuggingClassList li img.remove-class');
				_$.on("keyup", '#sapUiSupportDebuggingMethodInput');
				_$.on("blur", '#sapUiSupportDebuggingMethodInput');
				_$.on("change", '#sapUiSupportDebuggingMethodSelect');
				_$.on("click", '#sapUiSupportDebuggingAddBreakpoint');
				_$.on("click", '#sapUiSupportDebuggingBreakpointList li img.remove-breakpoint');
			}
	
		};
	
		Debugging.prototype.renderContainer = function() {
	
			var rm = sap.ui.getCore().createRenderManager();
	
			rm.write('<div id="sapUiSupportDebuggingClassContainer" class="sapUiSupportDottedContainer"></div>');
			rm.write('<div id="sapUiSupportDebuggingMethodContainer" class="sapUiSupportDottedContainer"></div>');
	
			rm.flush(this.$().get(0));
			rm.destroy();
		};
	
		Debugging.prototype.renderClasses = function() {
	
			var that = this;
	
			var aClasses = this._aClasses;
			var rm = sap.ui.getCore().createRenderManager();
	
			rm.write('<span style="margin-right:5px">Class:</span>');
	
			rm.write('<select id="sapUiSupportDebuggingClassSelect" class="sapUiSupportAutocomplete"><option></option>');
	
			$.each(aClasses, function(iIndex, oValue) {
				if (typeof (that._mAddedClasses[oValue]) === 'undefined') {
					rm.write('<option>' + oValue + '</option>');
				}
			});
	
			rm.write('</select>');
	
			rm.write('<input id="sapUiSupportDebuggingClassInput" class="sapUiSupportAutocomplete" type="text"/>');
			rm.write('<button id="sapUiSupportDebuggingAddClass" class="sapUiSupportBtn">Add</button>');
	
			rm.write('<hr class="no-border"/><ul id="sapUiSupportDebuggingClassList" class="sapUiSupportList">');
	
			$.each(aClasses, function(iIndex, oValue) {
				if (typeof (that._mAddedClasses[oValue]) === 'undefined') {
					return;
				}
	
				var bpCount = that._mAddedClasses[oValue].bpCount;
				var bpCountText = "";
	
				if (bpCount) {
					bpCountText = bpCount.active + " / " + bpCount.all;
				}
	
				rm.write('<li data-class-name="' + oValue + '"');
	
				if (that._sSelectedClass === oValue) {
					rm.write(' class="selected"');
				}
	
				rm.write('><div><span class="className">' + oValue + '</span>' +
						 '<span class="breakpoints">' + bpCountText + '</span></div>' +
						 '<img class="remove-class" style="cursor:pointer;margin-left:5px" ' +
						 'src="../../debug/images/delete.gif" alt="X"></li>');
			});
	
			rm.write('</ul>');
	
			rm.flush($("#sapUiSupportDebuggingClassContainer").get(0));
			rm.destroy();
		};
	
		Debugging.prototype.renderMethods = function(mMethods) {
	
			var rm = sap.ui.getCore().createRenderManager();
	
			if (typeof (mMethods) === 'undefined') {
				rm.write('<p style="text-align:center;font-weight: bold">Please add a class to the list on the left side</p>');
				rm.flush($("#sapUiSupportDebuggingMethodContainer").get(0));
				rm.destroy();
				return;
			}
	
			rm.write('<span style="margin-right:5px">Method:</span>');
	
			rm.write('<select id="sapUiSupportDebuggingMethodSelect" class="sapUiSupportAutocomplete"><option></option>');
	
			$.each(mMethods, function(iIndex, oValue) {
				if (!oValue.active) {
					rm.write('<option data-method-type="' + oValue.type + '">' + oValue.name + '</option>');
				}
			});
	
			rm.write('</select>');
	
			rm.write('<input id="sapUiSupportDebuggingMethodInput" class="sapUiSupportAutocomplete" type="text"/>');
			rm.write('<button id="sapUiSupportDebuggingAddBreakpoint" class="sapUiSupportBtn">Add breakpoint</button>');
	
			rm.write('<hr class="no-border"/><ul id="sapUiSupportDebuggingBreakpointList" class="sapUiSupportList sapUiSupportBreakpointList">');
	
			$.each(mMethods, function(iIndex, oValue) {
				if (!oValue.active) {
					return;
				}
	
				rm.write('<li data-method-type="' + oValue.type + '"><span>' + oValue.name + '</span>' +
						 '<img class="remove-breakpoint" style="cursor:pointer;margin-left:5px" ' +
						 'src="../../debug/images/delete.gif" alt="Remove"></li>');
			});
	
			rm.write('</ul>');
	
			rm.flush($("#sapUiSupportDebuggingMethodContainer").get(0));
			rm.destroy();
		};
	
		Debugging.prototype.onsapUiSupportDebuggingReceiveClasses = function(oEvent) {
			this._aClasses = JSON.parse(oEvent.getParameter("classes"));
			this.renderClasses();
			this.renderMethods();
	
			$('#sapUiSupportDebuggingClassInput').focus();
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
			var $breakpoints = $('li[data-class-name="' + sClassName + '"] span.breakpoints');
			$breakpoints.text(mBreakpointCount.active + " / " + mBreakpointCount.all).show();
	
			$('#sapUiSupportDebuggingMethodInput').focus();
		};
	
		Debugging.prototype._autoComplete = function(oEvent) {
	
			var $input = $(oEvent.target);
	
			if (oEvent.keyCode == jQuery.sap.KeyCodes.ENTER) {
				this._updateSelectOptions(oEvent);
	
				if ($input.attr('id') === "sapUiSupportDebuggingClassInput") {
					this._onAddClassClicked();
				} else {
					this._onAddBreakpointClicked();
				}
	
			}
	
			if (oEvent.keyCode >= jQuery.sap.KeyCodes.ARROW_LEFT && oEvent.keyCode <= jQuery.sap.KeyCodes.ARROW_DOWN) {
				return;
			}
	
			var $select = $input.prev("select"),
				sInputVal = $input.val();
	
			if (sInputVal == "") {
				return;
			}
	
			var aOptions = $select.find("option").map(function() {
				return $(this).val();
			}).get();
	
			var sOption;
	
			for (var i = 0; i < aOptions.length; i++) {
				sOption = aOptions[i];
	
				if (sOption.toUpperCase().indexOf(sInputVal.toUpperCase()) == 0) {
	
					var iCurrentStart = $input.cursorPos();
	
					if (oEvent.keyCode == jQuery.sap.KeyCodes.BACKSPACE) {
						iCurrentStart--;
					}
	
					$input.val(sOption);
					$input.selectText(iCurrentStart, sOption.length);
	
					break;
				}
			}
	
			return;
		};
	
		Debugging.prototype._onAddClassClicked = function() {
	
			var sClassName = $("#sapUiSupportDebuggingClassInput").val();
	
			this._mAddedClasses[sClassName] = {};
	
			this.renderClasses();
			$('#sapUiSupportDebuggingClassInput').focus();
		};
	
		Debugging.prototype._onRemoveClass = function(oEvent) {
	
			var sClassName = $(oEvent.target).prev().find('span.className').text();
	
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
	
			$('#sapUiSupportDebuggingClassInput').focus();
		};
	
		Debugging.prototype._onAddBreakpointClicked = function() {
			this.changeBreakpoint($("#sapUiSupportDebuggingClassList li.selected span.className").text(),
					$("#sapUiSupportDebuggingMethodInput").val(),
					$("#sapUiSupportDebuggingMethodSelect option:selected").attr("data-method-type"), true);
		};
	
		Debugging.prototype._onRemoveBreakpoint = function(oEvent) {
			this.changeBreakpoint($("#sapUiSupportDebuggingClassList li.selected span.className").text(),
					$(oEvent.target).prev().text(),
					$(oEvent.target).parent("li").attr("data-method-type"), false);
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
	
		Debugging.prototype._onSelectClass = function(oEvent) {
	
			var $li = $(oEvent.target).parents("li");
	
			if ($li.hasClass("selected")) {
				return;
			}
	
			var className = $li.find('span.className').text();
	
			$li.addClass("selected").siblings("li").removeClass("selected");
			this._sSelectedClass = className;
	
			this._oStub.sendEvent(this._breakpointId + "RequestClassMethods", {
				className: className,
				callback: this.getId() + "ReceiveClassMethods"
			});
		};
	
		Debugging.prototype._isClassSelected = function() {
			var selected = false;
			$.each(this._mClasses, function(iIndex, oValue) {
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
				type: parseInt(type, 10),
				callback: this.getId() + "ReceiveClassMethods"
			});
		};
	
	

	return Debugging;

}, /* bExport= */ true);
