/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/Device',
	'sap/m/Toolbar',
	'sap/m/Title'
], function(coreLibrary, Device, Toolbar, Title) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * @class
	 * Adds link functionality and wrapping to the existing title control for display in the demo kit application
	 * @extends sap.m.Title
	 * @private
	 * @ui5-restricted sdk
	 */
	var TitleLink = Title.extend("sap.ui.documentation.sdk.controls.TitleLink", {
		metadata: {
			properties: {
				/**
				 * Options are the standard values for window.open() supported by browsers: _self, _top, _blank, _parent, _search. Alternatively, a frame name can be entered. This property is only used when the href property is set.
				 */
				target : {type : "string", group : "Behavior", defaultValue : null},

				/**
				 * The link target URI. Supports standard hyperlink behavior. If a JavaScript action should be triggered, this should not be set, but instead an event handler for the "press" event should be registered.
				 */
				href : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

				/**
				 * Stores a text that can be different to the text property for filtering purposes
				 */
				filter : {type : "string", group : "Data", defaultValue : ""},

				/**
				 * If set to true, the text will wrap to multiple lines, if not it will truncate on a single line
				 */
				wrap : {type : "boolean", group : "Behavior", defaultValue : true}
			},
			events: {
				/**
				 * Event is fired when the user triggers the link control.
				 */
				press : {allowPreventDefault : true}
			}
		},

		init: function () {
			if (Device.support.touch) {
				this.ontap = this._handlePress;
			} else {
				this.onclick = this._handlePress;
			}

			/**
			 * Handles the touch event on mobile devices.
			 *
			 * @param {jQuery.Event} oEvent
			 */
			this.ontouchstart = function(oEvent) {
				if (this.getHref()) {
					// for controls which need to know whether they should handle events bubbling from here
					oEvent.setMarked();
				}
			};
		},

		/**
		 * Triggers link activation when space key is pressed on the focused control.
		 *
		 * @param {jQuery.Event} oEvent
		 */
		onsapspace : function(oEvent) {
			this._handlePress(oEvent); // this calls any JS event handlers
			// _handlePress() checks the return value of the event handler and prevents default if required or of the Link is disabled
			if (this.getHref() && !oEvent.isDefaultPrevented()) {
				// Normal browser link, the browser does the job. According to the keyboard spec, Space should do the same as Enter/Click.
				// To make the browser REALLY do the same (history, referrer, frames, target,...), create a new "click" event and let the browser "do the needful".

				// first disarm the Space key event
				oEvent.preventDefault(); // prevent any scrolling which the browser might do because from its perspective the Link does not handle the "space" key
				oEvent.setMarked();

				// then create the click event
				var oClickEvent = document.createEvent('MouseEvents');
				oClickEvent.initEvent('click' /* event type */, false, true); // non-bubbling, cancelable
				this.getDomRef().dispatchEvent(oClickEvent);
			}
		},

		/**
		 * Handler for the "press" event of the link.
		 *
		 * @param {jQuery.Event} oEvent
		 * @private
		 */
		_handlePress : function(oEvent) {
			oEvent.setMarked();

			if (!this.firePress() || !this.getHref()) { // fire event and check return value whether default action should be prevented
				oEvent.preventDefault();
			}
		},

		setHref : function(sUri){
			this.setProperty("href", sUri, true);
			sUri = this.getProperty("href");
			this.$().attr("href", sUri);
			return this;
		},

		setTarget : function(sTarget){
			this.setProperty("target", sTarget, true);
			if (!sTarget) {
				this.$().removeAttr("target");
			} else {
				this.$().attr("target", sTarget);
			}
			return this;
		},

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oTitle an object representation of the control that should be rendered
		 */
		renderer: {
			apiVersion: 2,

			render: function (oRm, oTitle) {
			var oAssoTitle = oTitle._getTitle(),
				sLevel = (oAssoTitle ? oAssoTitle.getLevel() : oTitle.getLevel()) || coreLibrary.TitleLevel.Auto,
				bAutoLevel = sLevel == TitleLevel.Auto,
				sTag = bAutoLevel ? "div" : sLevel;

			oRm.openStart(sTag.toLowerCase(), oTitle)
				.class("sapUiDocTitleLink")
				.class("sapMTitle")
				.class("sapMTitleStyle" + (oTitle.getTitleStyle() || coreLibrary.TitleLevel.Auto))
				.class("sapUiSelectable");

			// adding wrap functionality begin
			if (oTitle.getWrap()) {
				oRm.class("wrap");
			} else {
				oRm.class("sapMTitleNoWrap");
			}
			// adding wrap functionality end

			var sWidth = oTitle.getWidth();
			if (!sWidth) {
				oRm.class("sapMTitleMaxWidth");
			} else {
				oRm.style("width", sWidth);
			}

			var sTextAlign = oTitle.getTextAlign();
			if (sTextAlign && sTextAlign != TextAlign.Initial) {
				oRm.class("sapMTitleAlign" + sTextAlign);
			}

			if (oTitle.getParent().isA("sap.m.Toolbar")) {
				oRm.class("sapMTitleTB");
			}

			var sTooltip = oAssoTitle ? oAssoTitle.getTooltip_AsString() : oTitle.getTooltip_AsString();
			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}

			if (bAutoLevel) {
				oRm.attr("role", "heading");
			}

			oRm.openEnd();

			// adding link functionality begin
			oRm.openStart("a")
				.class("sapMLnk");

			if (oTitle.getText()) {
				oRm.attr("tabindex", "0");
			} else {
				oRm.attr("tabindex", "-1");
			}
			oRm.attr("href", oTitle.getHref());
			if (oTitle.getTarget()) {
				oRm.attr("target", oTitle.getTarget());
			}
			oRm.openEnd();
			// adding link functionality end

			oRm.openStart("span", oTitle.getId() + "-inner")
				.openEnd()
				.text(oAssoTitle ? oAssoTitle.getText() : oTitle.getText());

			oRm.close("span")
				.close("a")
				.close(sTag.toLowerCase());
		}
	}});

	return TitleLink;
});