/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.Selector (Selector support plugin)
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Popup",
	"../Plugin",
	"../Support",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/uid"
], function (Core, Popup, Plugin, Support, jQuery, uid) {
	"use strict";

		/**
		 * Creates an instance of sap.ui.core.support.plugins.Selector.
		 * @class This class represents the selector plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
		 *
		 * @extends sap.ui.core.support.Plugin
		 * @version ${version}
		 * @private
		 * @alias sap.ui.core.support.plugins.Selector
		 */
		var Selector = Plugin.extend("sap.ui.core.support.plugins.Selector", {
			constructor : function(oSupportStub) {
				Plugin.apply(this, ["sapUiSupportSelector", "", oSupportStub]);
				this._aEventIds = [this.getId() + "Highlight"];
				this._oPopup = new Popup();
			}
		});

		Selector.prototype.isToolPlugin = function(){
			return false;
		};

		/**
		 * Handler for sapUiSupportSelectorHighlight event
		 *
		 * @param {sap.ui.base.Event} oEvent the event
		 * @private
		 */
		Selector.prototype.onsapUiSupportSelectorHighlight = function(oEvent){
			highlight(oEvent.getParameter("id"), this, oEvent.getParameter("sendInfo"));
		};

		Selector.prototype.init = function(oSupportStub){
			Plugin.prototype.init.apply(this, arguments);

			var jPopupRef;

			if (!this._sPopupId) {
				this._sPopupId = this.getId() + "-" + uid();
				var rm = Core.createRenderManager();
				rm.openStart("div", this._sPopupId)
					.style("border", "2px solid rgb(0, 128, 0)")
					.style("background-color", "rgba(0, 128, 0, .55)")
					.openEnd()
					.close("div");

				rm.flush(Core.getStaticAreaRef(), false, true);
				rm.destroy();

				jPopupRef = jQuery(document.getElementById(this._sPopupId));
				this._oPopup.setContent(jPopupRef[0]);
			} else {
				jPopupRef = jQuery(document.getElementById(this._sPopupId));
			}

			var that = this;

			this._fSelectHandler = function(oEvent){
				if (!oEvent.shiftKey || !oEvent.altKey || !oEvent.ctrlKey) {
					return;
				}
				var sId = jQuery(oEvent.target).closest("[data-sap-ui]").attr("id");

				if (highlight(sId, that, true)) {
					oEvent.stopPropagation();
					oEvent.preventDefault();
				}
			};

			this._fCloseHandler = function(oEvent){
				that._oPopup.close(0);
			};

			jPopupRef.on("click", this._fCloseHandler);
			jQuery(document).on("mousedown", this._fSelectHandler);

		};

		Selector.prototype.exit = function(oSupportStub){
			this._oPopup.close(0);
			if (this._fCloseHandler) {
				jQuery(document.getElementById(this._sPopupId)).off("click", this._fCloseHandler);
				this._fCloseHandler = null;
			}
			if (this._fSelectHandler) {
				jQuery(document).off("mousedown", this._fSelectHandler);
				this._fSelectHandler = null;
			}
			Plugin.prototype.exit.apply(this, arguments);
		};

		function highlight(sId, oPlugin, bSend){
			if (sId) {
				var oElem = Core.byId(sId);
				if (oElem) {
					var jPopupRef = jQuery(document.getElementById(oPlugin._sPopupId));
					var jRef = oElem.$();
					if (jRef.is(":visible")) {
						jPopupRef.width(jRef.outerWidth());
						jPopupRef.height(jRef.outerHeight());
						oPlugin._oPopup.open(0, "BeginTop", "BeginTop", jRef[0], "0 0", "none");
						if (bSend) {
							Support.getStub().sendEvent(oPlugin.getId() + "Select", getElementDetailsForEvent(oElem, oPlugin));
						}
						setTimeout(function(){
							oPlugin._oPopup.close(0);
						}, 1000);
						return true;
					}
				}
			}
			return false;
		}

		function getElementDetailsForEvent(oElement, oPlugin){
			//TODO: to be extended
			return {"id": oElement.getId()};
		}

	return Selector;

});