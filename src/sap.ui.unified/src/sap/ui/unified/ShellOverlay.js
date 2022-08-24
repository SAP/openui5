/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.ShellOverlay.
sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/Control',
	'sap/ui/core/Popup',
	'./library',
	'sap/ui/core/theming/Parameters',
	'./ShellOverlayRenderer',
	"sap/ui/thirdparty/jquery",
	'sap/ui/dom/jquery/rect', // jQuery Plugin "rect"
	'sap/ui/dom/jquery/Selectors' // jQuery custom selectors ":sapTabbable"
],
	function(
		Device,
		Control,
		Popup,
		library,
		Parameters,
		ShellOverlayRenderer,
		jQuery
	) {
	"use strict";



	/**
	 * Constructor for a new ShellOverlay.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ShellOverlay to be opened in front of an sap.ui.unified.Shell
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.3
	 * @alias sap.ui.unified.ShellOverlay
	 * @deprecated Since version 1.44.0.
	 */
	var ShellOverlay = Control.extend("sap.ui.unified.ShellOverlay", /** @lends sap.ui.unified.ShellOverlay.prototype */ { metadata : {

		library : "sap.ui.unified",
		deprecated : true,
		defaultAggregation : "content",
		aggregations : {

			/**
			 * The content to appear in the overlay.
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"},

			/**
			 * Experimental (This aggregation might change in future!): The search control which should be displayed in the overlay header.
			 */
			search : {type : "sap.ui.core.Control", multiple : false}
		},
		associations : {

			/**
			 * Reference to the sap.ui.unified.Shell or sap.ui.unified.ShellLayout control.
			 */
			shell : {type : "sap.ui.unified.ShellLayout", multiple : false},

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		events : {

			/**
			 * Fired when the overlay was closed.
			 */
			closed : {}
		}
	}});


	/**** API ****/

	/**
	 * Opens the ShellOverlay.
	 *
	 * @public
	 */
	ShellOverlay.prototype.open = function(){
		if (this._getPopup().isOpen()) {
			return;
		}

		this._opening = true;
		this._forceShellHeaderVisible();
		this._getPopup().setModal(true, Popup.blStack.length == 0 && this._getAnimActive() ? "sapUiUfdShellOvrlyBly sapUiUfdShellOvrlyBlyTp" : "");
		this._getPopup().open(0, Popup.Dock.BeginTop, Popup.Dock.BeginTop, window, "0 0", "none");
		var oSearch = this.getSearch();
		if (oSearch) {
			oSearch.focus();
		}
		this._opening = false;

		if (this._getAnimActive()) {
			setTimeout(function(){
				jQuery(document.getElementById("sap-ui-blocklayer-popup")).toggleClass("sapUiUfdShellOvrlyBlyTp", false);
			}, 50);
		}

		setTimeout(function(){
			this.$().toggleClass("sapUiUfdShellOvrlyOpening", false);
		}.bind(this), this._getAnimDuration(true));
	};

	/**
	 * Closes the ShellOverlay.
	 *
	 * @public
	 */
	ShellOverlay.prototype.close = function(){
		if (!this._getPopup().isOpen()) {
			return;
		}

		this.$().toggleClass("sapUiUfdShellOvrlyCntntHidden", true).toggleClass("sapUiUfdShellOvrlyClosing", true);

		this._setSearchWidth();

		setTimeout(function(){
			var $Bl = jQuery(document.getElementById("sap-ui-blocklayer-popup"));
			if (Popup.blStack.length == 1 && this._getAnimActive() && $Bl.hasClass("sapUiUfdShellOvrlyBly")) {
				$Bl.toggleClass("sapUiUfdShellOvrlyBlyTp", true);
			}
		}.bind(this), Math.max(this._getAnimDuration(false) - this._getBLAnimDuration(), 0));

		setTimeout(function(){
			this._getPopup().close(0);
			this.$().remove();
			this._forceShellHeaderVisible();
			this.fireClosed();
		}.bind(this), this._getAnimDuration(false));
	};

	ShellOverlay.prototype.setShell = function(vShell){
		return this.setAssociation("shell", vShell, true);
	};

	ShellOverlay.prototype.setSearch = function(oSearch){
		this.setAggregation("search", oSearch, true);
		if (this.getDomRef()) {
			this._headRenderer.render();
		}
		return this;
	};

	ShellOverlay.prototype.insertContent = function(oContent, iIndex) {
		var res = this.insertAggregation("content", oContent, iIndex, true);
		if (this.getDomRef()) {
			this._contentRenderer.render();
		}
		return res;
	};
	ShellOverlay.prototype.addContent = function(oContent) {
		var res = this.addAggregation("content", oContent, true);
		if (this.getDomRef()) {
			this._contentRenderer.render();
		}
		return res;
	};
	ShellOverlay.prototype.removeContent = function(vIndex) {
		var res = this.removeAggregation("content", vIndex, true);
		if (this.getDomRef()) {
			this._contentRenderer.render();
		}
		return res;
	};
	ShellOverlay.prototype.removeAllContent = function() {
		var res = this.removeAllAggregation("content", true);
		if (this.getDomRef()) {
			this._contentRenderer.render();
		}
		return res;
	};
	ShellOverlay.prototype.destroyContent = function() {
		var res = this.destroyAggregation("content", true);
		if (this.getDomRef()) {
			this._contentRenderer.render();
		}
		return res;
	};


	/**** Private ****/

	ShellOverlay.prototype.init = function(){
		this._animOpenDuration = -1;
		this._animCloseDuration = -1;
		this._animBlockLayerDuration = -1;
		this._animation = sap.ui.getCore().getConfiguration().getAnimation();
		this._opening = false;

		var that = this;

		this._headRenderer = new library._ContentRenderer(this, this.getId() + "-hdr-center", function(rm){
			ShellOverlayRenderer.renderSearch(rm, that);
		});
		this._contentRenderer = new library._ContentRenderer(this, this.getId() + "-cntnt", function(rm){
			ShellOverlayRenderer.renderContent(rm, that);
		});
	};

	ShellOverlay.prototype.exit = function(){
		if (this._popup) {
			this._popup.close(0);
			this._popup.destroy();
			this._popup = null;
		}

		this._getPopup = function(){return null;};
		this._headRenderer.destroy();
		delete this._headRenderer;
		this._contentRenderer.destroy();
		delete this._contentRenderer;
	};

	ShellOverlay.prototype.onAfterRendering = function(){
		if (this._opening) {
			this._setSearchWidth();
		}

		setTimeout(function(){
			this.$().toggleClass("sapUiUfdShellOvrlyCntntHidden", false);
			this.$("search").css("width", "");
		}.bind(this), 10);
	};

	ShellOverlay.prototype.onclick = function(oEvent){
		if (jQuery(oEvent.target).attr("id") === this.getId() + "-close") {
			this.close();
			// IE always interprets a click on an anker as navigation and thus triggers the
			// beforeunload-event on the window. Since a ShellHeadItem never has a valid href-attribute,
			// the default behavior should never be triggered
			oEvent.preventDefault();
		}
	};

	ShellOverlay.prototype.onsapspace = ShellOverlay.prototype.onclick;

	ShellOverlay.prototype.onThemeChanged = function(){
		this._animOpenDuration = -1;
		this._animCloseDuration = -1;
		this._animBlockLayerDuration = -1;
	};

	ShellOverlay.prototype.onfocusin = function(oEvent){
		var $FocusableContent, oDomRef;

		if (oEvent.target.id == this.getId() + "-focfirst") {
			// Focus on first dummy element -> Move focus to last element in content
			$FocusableContent = jQuery(":sapTabbable", this.$("inner")); //Contains at least the close button
			oDomRef = $FocusableContent.get($FocusableContent.length - 1);
		} else if (oEvent.target.id == this.getId() + "-foclast") {
			// Focus on last dummy element -> Move focus to first element in content
			$FocusableContent = jQuery(":sapTabbable", this.$("inner")); //Contains at least the close button
			oDomRef = $FocusableContent.get(0);
		}

		if (oDomRef) {
			oDomRef.focus();
		}
	};


	/**** Private Helpers ****/

	ShellOverlay.prototype._getAnimDurationThemeParam = function(sParam, bClearIfNotActive){
		var val = parseInt(Parameters.get(sParam));
		if (!this._getAnimActive() && bClearIfNotActive) {
			val = 0;
		}
		return val;
	};

	ShellOverlay.prototype._getAnimDuration = function(bOpen){
		if ((bOpen && this._animOpenDuration == -1) || (!bOpen && this._animCloseDuration == -1)) {
			var sTxt = bOpen ? "Open" : "Close";
			this["_anim" + sTxt + "Duration"] = this._getAnimDurationThemeParam("_sap_ui_unified_ShellOverlay_" + sTxt + "AnimOverAll", true);
		}
		return bOpen ? this._animOpenDuration : this._animCloseDuration;
	};

	ShellOverlay.prototype._getBLAnimDuration = function(){
		if (this._animBlockLayerDuration == -1) {
			this._animBlockLayerDuration = this._getAnimDurationThemeParam("_sap_ui_unified_ShellOverlay_BlockLayerAnimDuration", true);
		}
		return this._animBlockLayerDuration;
	};

	ShellOverlay.prototype._getAnimActive = function(){
		if (!this._animation) {
			return false;
		}
		return true;
	};

	ShellOverlay.prototype._getPopup = function(){
		if (!this._popup) {
			this._popup = new Popup(this, true, false, false);
			this._popup._applyPosition = function(oPosition) {
				this._$().css("left", "0").css("top", "0");
				this._oLastPosition = oPosition;
				this._oLastOfRect = jQuery(window).rect();
			};
			this._popup.attachOpened(function(){
				library._iNumberOfOpenedShellOverlays++;
			});
			this._popup.attachClosed(function(){
				library._iNumberOfOpenedShellOverlays--;
			});
		}
		return this._popup;
	};

	ShellOverlay.prototype._getShell = function(){
		var sId = this.getShell();
		if (!sId) {
			return;
		}
		var oShell = sap.ui.getCore().byId(sId);
		if (!oShell || !(oShell instanceof sap.ui.unified.ShellLayout)) {
			return;
		}
		return oShell;
	};

	ShellOverlay.prototype._forceShellHeaderVisible = function(){
		var oShell = this._getShell();
		if (oShell) {
			oShell._doShowHeader(true);
		}
	};

	ShellOverlay.prototype._getSearchWidth = function(){
		var oShell = this._getShell();
		return oShell ? oShell._getSearchWidth() : -1;
	};

	ShellOverlay.prototype._setSearchWidth = function(){
		var iWidth = this._getSearchWidth();
		if (iWidth <= 0) {
			return;
		}

		var sWidth = iWidth + "px";

		if (Device.browser.safari) {
			//Safari doesn't support width transition based on different units -> so px must be replaced by %
			var iTotalWidth = this.$("hdr-center").width();
			if (iTotalWidth > iWidth) {
				sWidth = Math.round((iWidth * 100) / iTotalWidth) + "%";
			} else {
				sWidth = "100%";
			}
		}

		this.$("search").css("width", sWidth);
	};




	return ShellOverlay;

});