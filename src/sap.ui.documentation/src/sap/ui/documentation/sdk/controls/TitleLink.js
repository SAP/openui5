/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/Device',
	'sap/m/Toolbar',
	'sap/m/Title',
	'jquery.sap.script'
], function(coreLibrary, Device, Toolbar, Title, jQuery) {
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
				wrap : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Specifies the value of the HTML <code>rel</code> attribute.
				 *
				 * <b>Note:</b> A default value of <code>noopener noreferrer</code> is set only to links that have a cross-origin URL
				 * and a specified <code>target</code> with value other than <code>_self</code>
				 * @since 1.60.33
				 */
				rel : {type : "string", group : "Behavior", defaultValue : null}
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
			var sRelToRender = jQuery.sap.defaultLinkTypes(this.getRel(), this.getHref(), this.getTarget());
			this.setProperty("target", sTarget, true);
			if (!sTarget) {
				this.$().removeAttr("target");
			} else {
				this.$().attr("target", sTarget);
			}

			if (!sRelToRender) {
				this.$().removeAttr("rel");
			} else {
				this.$().attr("rel", sRelToRender);
			}
			return this;
		},

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oTitle an object representation of the control that should be rendered
		 */
		renderer: function (oRm, oTitle) {
			var oAssoTitle = oTitle._getTitle(),
				sLevel = (oAssoTitle ? oAssoTitle.getLevel() : oTitle.getLevel()) || coreLibrary.TitleLevel.Auto,
				bAutoLevel = sLevel == TitleLevel.Auto,
				sTag = bAutoLevel ? "div" : sLevel;

			oRm.write("<", sTag);
			oRm.writeControlData(oTitle);
			oRm.addClass("sapUiDocTitleLink");
			oRm.addClass("sapMTitle");
			oRm.addClass("sapMTitleStyle" + (oTitle.getTitleStyle() || coreLibrary.TitleLevel.Auto));
			oRm.addClass("sapUiSelectable");

			// adding wrap functionality begin
			if (oTitle.getWrap()) {
				oRm.addClass("wrap");
			} else {
				oRm.addClass("sapMTitleNoWrap");
			}
			// adding wrap functionality end

			var sWidth = oTitle.getWidth();
			if (!sWidth) {
				oRm.addClass("sapMTitleMaxWidth");
			} else {
				oRm.addStyle("width", sWidth);
			}

			var sTextAlign = oTitle.getTextAlign();
			if (sTextAlign && sTextAlign != TextAlign.Initial) {
				oRm.addClass("sapMTitleAlign" + sTextAlign);
			}

			if (oTitle.getParent() instanceof Toolbar) {
				oRm.addClass("sapMTitleTB");
			}

			var sTooltip = oAssoTitle ? oAssoTitle.getTooltip_AsString() : oTitle.getTooltip_AsString();
			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			if (bAutoLevel) {
				oRm.writeAttribute("role", "heading");
			}

			oRm.writeClasses();
			oRm.writeStyles();

			oRm.write(">");

			// adding link functionality begin
			oRm.write("<a");
			oRm.addClass("sapMLnk");
			if (oTitle.getText()) {
				oRm.writeAttribute("tabIndex", "0");
			} else {
				oRm.writeAttribute("tabIndex", "-1");
			}
			oRm.writeAttributeEscaped("href", oTitle.getHref());
			if (oTitle.getTarget()) {
				oRm.writeAttributeEscaped("target", oTitle.getTarget());
			}
			var sRelToRender = jQuery.sap.defaultLinkTypes(oTitle.getRel(), oTitle.getHref(), oTitle.getTarget());
			if (sRelToRender) {
				oRm.writeAttributeEscaped("rel", sRelToRender);
			}
			oRm.writeClasses();
			oRm.write(">");
			// adding link functionality end

			oRm.write("<span");
			oRm.writeAttribute("id", oTitle.getId() + "-inner");
			oRm.write(">");
			oRm.writeEscaped(oAssoTitle ? oAssoTitle.getText() : oTitle.getText());
			oRm.write("</span></", sTag, ">");

			oRm.write("</a>");
		}
	});

	return TitleLink;
});