/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.ShellHeadUserItem.
sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/core/IconPool',
	'./library',
	"sap/base/security/encodeXML"
],
	function(Element, IconPool, library, encodeXML) {
	"use strict";



	/**
	 * Constructor for a new ShellHeadUserItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * User Header Action Item of the Shell.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22.0
	 * @alias sap.ui.unified.ShellHeadUserItem
	 * @deprecated Since version 1.44.0.
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ShellHeadUserItem = Element.extend("sap.ui.unified.ShellHeadUserItem", /** @lends sap.ui.unified.ShellHeadUserItem.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * The name of the user.
			 */
			username : {type : "string", group : "Appearance", defaultValue : ''},

			/**
			 * The user item is intended to be used for user settings. Normally these settings are done via a Menu or Dialog.
			 * If this property is set to true an indicator for such a popup mechanismn is shown in the item.
			 * @since 1.27.0
			 */
			showPopupIndicator : {type : "boolean", group : "Accessibility", defaultValue : true},

			/**
			 * An image of the user, normally a URI to an image but also an icon from the sap.ui.core.IconPool is possible.
			 */
			image : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null}
		},
		associations : {
			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		events : {

			/**
			 * Event is fired when the user presses the button.
			 */
			press : {}
		}
	}});

	IconPool.insertFontFaceStyle(); //Ensure Icon Font is loaded

	ShellHeadUserItem.prototype.onclick = function(oEvent){
		this.firePress();
		// IE always interprets a click on an anker as navigation and thus triggers the
		// beforeunload-event on the window. Since a ShellHeadItem never has a valid href-attribute,
		// the default behavior should never be triggered
		oEvent.preventDefault();
	};

	ShellHeadUserItem.prototype.onsapspace = ShellHeadUserItem.prototype.onclick;
	ShellHeadUserItem.prototype.onsapenter = ShellHeadUserItem.prototype.onclick;

	ShellHeadUserItem.prototype.setImage = function(sImage){
		this.setProperty("image", sImage, true);
		if (this.getDomRef()) {
			this._refreshImage();
		}
		return this;
	};

	ShellHeadUserItem.prototype._refreshImage = function(){
		var $Ico = this.$("img");
		var sImage = this.getImage();
		if (!sImage) {
			$Ico.html("").attr("style", "").css("display", "none");
		} else if (IconPool.isIconURI(sImage)) {
			var oIconInfo = IconPool.getIconInfo(sImage);
			$Ico.html("").attr("style", "");
			if (oIconInfo) {
				$Ico.text(oIconInfo.content).attr("role", "presentation").attr("aria-label", oIconInfo.text || oIconInfo.name).css("font-family", "'" + oIconInfo.fontFamily + "'");
			}
		} else {
			var $Image = this.$("img-inner");
			if ($Image.length == 0 || $Image.attr("src") != sImage) {
				$Ico.attr("style", "").attr("aria-label", null).html("<img role='presentation' id='" + this.getId() + "-img-inner' src='" + encodeXML(sImage) + "'/>");
			}
		}
	};

	ShellHeadUserItem.prototype._checkAndAdaptWidth = function(bShellSearchVisible){
		if (!this.getDomRef()) {
			return false;
		}

		var $Ref = this.$(),
			$NameRef = this.$("name");
		var iBeforeWidth = $Ref.width();
		$Ref.toggleClass("sapUiUfdShellHeadUsrItmLimit", false);
		//User name cannot be larger than 240px
		//(if a search field is shown in the shell this max size decreases depending on the screen width)
		var iMax = 240;
		if (bShellSearchVisible) {
			iMax = Math.min(iMax, 0.5 * document.documentElement.clientWidth - 225);
		}
		if (iMax < $NameRef.width()) {
			$Ref.toggleClass("sapUiUfdShellHeadUsrItmLimit", true);
		}
		return iBeforeWidth != $Ref.width();
	};

	return ShellHeadUserItem;

});