/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.ContentSwitcher.
sap.ui.define([
	'sap/ui/core/Control',
	'./library',
	"./ContentSwitcherRenderer",
	"sap/base/Log"
], function(Control, library, ContentSwitcherRenderer, Log) {
	"use strict";



	// shortcut for sap.ui.unified.ContentSwitcherAnimation
	var ContentSwitcherAnimation = library.ContentSwitcherAnimation;



	/**
	 * Constructor for a new ContentSwitcher.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Switches between two control areas and animates it via CSS transitions
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @experimental Since version 1.16.0.
	 * API is not yet finished and might change completely
	 * @deprecated Since version 1.44.0.
	 * @alias sap.ui.unified.ContentSwitcher
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ContentSwitcher = Control.extend("sap.ui.unified.ContentSwitcher", /** @lends sap.ui.unified.ContentSwitcher.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.unified",
		properties : {

			/**
			 * Set the used animation when changing content. This just sets a CSS-class named "sapUiUnifiedACSwitcherAnimation" + this value on the root element of the control. The animation has to be implemented in CSS. This also enables applications to implement their own animations via CSS by reacting to the parent class.
			 * See the types sap.ui.unified.ContentSwitcherAnimation for default implementations.
			 */
			animation : {type : "string", group : "Appearance", defaultValue : 'None'},

			/**
			 * The number of the currently active content (1 or 2).
			 */
			activeContent : {type : "int", group : "Behavior", defaultValue : 1}
		},
		aggregations : {

			/**
			 * The controls that should be shown in the first content
			 */
			content1 : {type : "sap.ui.core.Control", multiple : true, singularName : "content1"},

			/**
			 * The controls that should be shown in the second content
			 */
			content2 : {type : "sap.ui.core.Control", multiple : true, singularName : "content2"}
		}
	}});

	(function(window) {

	////////////////////////////////////////// Public Methods //////////////////////////////////////////

	ContentSwitcher.prototype.init = function(){
	};

	/**
	 * Changes the currently active content to the other one. If content 1 is active, content 2 will
	 * be activated and the other way around.
	 *
	 * @public
	 */
	ContentSwitcher.prototype.switchContent = function() {
		this.setActiveContent(this.getActiveContent() == 1 ? 2 : 1);
		return this;
	};

	////////////////////////////////////////// onEvent Methods /////////////////////////////////////////

	ContentSwitcher.prototype.onAfterRendering = function() {
		this._$Contents = [
			this.$("content1"),
			this.$("content2")
		];
	};


	////////////////////////////////////////// Private Methods /////////////////////////////////////////

	/**
	 * Make the content-area with the given number appear/visible. This just sets the CSS-class
	 * sapUiUnifiedCSwitcherVisible
	 */
	ContentSwitcher.prototype._showActiveContent = function(iNumber) {
		if (this._$Contents) {
			this._$Contents[0].toggleClass("sapUiUfdCSwitcherVisible", iNumber === 1);
			this._$Contents[1].toggleClass("sapUiUfdCSwitcherVisible", iNumber === 2);
		}
	};

	///////////////////////////////////////// Hidden Functions /////////////////////////////////////////


	//////////////////////////////////////// Overridden Methods ////////////////////////////////////////

		///////////////////////////////// Property "activeContent" /////////////////////////////////

	ContentSwitcher.prototype.setActiveContent = function(iNumber) {
		iNumber = parseInt(iNumber);

		if (isNaN(iNumber) || iNumber < 1) {
			iNumber = 1;

			Log.warning(
				"setActiveContent argument must be either 1 or 2. Active content set to 1."
			);
		} else if (iNumber > 2) {
			iNumber = 2;

			Log.warning(
				"setActiveContent argument must be either 1 or 2. Active content set to 2."
			);
		}

		this.setProperty("activeContent", iNumber, /* supressInvalidate: */ true);

		this._showActiveContent(iNumber);

		return this;
	};


		/////////////////////////////////// Property "animation" ///////////////////////////////////

	ContentSwitcher.prototype.setAnimation = function(sAnimation, bSuppressInvalidate){
		if (typeof (sAnimation) !== "string") {
			sAnimation = ContentSwitcherAnimation.None;
			Log.warning(
				"setAnimation argument must be a string. Animation was set to \"" +
				ContentSwitcherAnimation.None + "\"."
			);
		}

		// Remove all non-alphanumerical characters from the animation string
		sAnimation = sAnimation.replace(/[^a-zA-Z0-9]/g, "");

		var sCurrentAnimation = this.getProperty("animation");

		if (sAnimation === sCurrentAnimation) {
			// No change.
			return this;
		}

		var $Dom = this.$();
		if ($Dom[0]) {
			// We are already rendered - so we have to change the class on the fly...
			$Dom.toggleClass("sapUiUfdCSwitcherAnimation" + sCurrentAnimation, false);
			$Dom.toggleClass("sapUiUfdCSwitcherAnimation" + sAnimation, true);
		}/* else {
			// The renderer will take care of it.
		}/**/

		return this.setProperty("animation", sAnimation, bSuppressInvalidate);
	};


		//////////////////////////////////////// Event "xxx" ///////////////////////////////////////
		///////////////////////////////////// Aggregation "xxx" ////////////////////////////////////
		///////////////////////////////////// Association "xxx" ////////////////////////////////////

	})(window);

	return ContentSwitcher;

});