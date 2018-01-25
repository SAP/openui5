/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.Link.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/LabelEnablement',
	"./LinkRenderer"
],
	function(jQuery, library, Control, EnabledPropagator, LabelEnablement, LinkRenderer) {
	"use strict";



	/**
	 * Constructor for a new Link.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * Provides an absolute or relative reference to an internal or external URL. The classical target parameters are supported.
	 * Another usage scenario is triggering an action, for example to open a popup window. In both cases, the link is a hypertext link.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.commons.ToolbarItem,sap.ui.commons.FormattedTextViewControl, sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.m.Link</code> control.
	 * @alias sap.ui.commons.Link
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Link = Control.extend("sap.ui.commons.Link", /** @lends sap.ui.commons.Link.prototype */ { metadata : {

		interfaces : [
			"sap.ui.commons.ToolbarItem",
			"sap.ui.commons.FormattedTextViewControl",
			"sap.ui.core.IFormContent"
		],
		library : "sap.ui.commons",
		properties : {

			/**
			 *
			 * Link text to be displayed.
			 */
			text : {type : "string", group : "Appearance", defaultValue : ''},

			/**
			 * Whether the link can be triggered by the user.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 *
			 * Unique identifier used for help service.
			 */
			helpId : {type : "string", group : "Behavior", defaultValue : ''},

			/**
			 * The link target URI. Supports standard hyperlink behavior. If an action should be triggered, this should not be set, but instead an event handler for the "press" event should be registered.
			 */
			href : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 *
			 * Options are _self, _top, _blank, _parent, _search. Alternatively, a frame name can be entered.
			 */
			target : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Width of text link. When it is set (CSS-size such as % or px), this is the exact size. When left blank, the text defines the size.
			 * @since 1.8.0
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null}
		},
		associations : {

			/**
			 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"},

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		events : {

			/**
			 *
			 * Event is fired when the user clicks the control.
			 */
			press : {allowPreventDefault : true}
		}
	}});


	/**
	 * Puts the focus to the link.
	 *
	 * @name sap.ui.commons.Link#focus
	 * @function
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */


	EnabledPropagator.call(Link.prototype);

	/**
	 * Required adaptations before rendering.
	 *
	 * @private
	 */
	Link.prototype.onBeforeRendering = function() {
		// add/remove self reference for aria-labelledby  to fix reading issues
		this.removeAssociation("ariaLabelledBy", this.getId(), true);
		if (this.getAriaLabelledBy().length > 0 || LabelEnablement.getReferencingLabels(this).length > 0) {
			this.addAssociation("ariaLabelledBy", this.getId(), true);
		}
	};

	/**
	 * Also trigger link activation when space is pressed on the focused control
	 */
	Link.prototype.onsapspace = function(oEvent) {
		Link.prototype.onclick.apply(this, arguments);
	};

	/**
	 * Function is called when Link is clicked.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Link.prototype.onclick = function(oEvent) {
		if (this.getEnabled()) {
			// the default behavior will be supressed, when oEvent.preventDefault() is
			// called or when the link doesn't contain a valid href (#)).
			// The last thing will trigger the onbeforeunload event in IE when not
			// preventing the default behavior
			if (!this.firePress() || !this.getHref()) {
				oEvent.preventDefault();
			}
		} else {
			oEvent.preventDefault();
		}
	};

	/**
	 * The Link handles the enter by itself
	 * @since 1.16.2
	 */
	Link.prototype.onsapenter = function(oEvent) {
		oEvent.stopPropagation();
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	Link.prototype.getAccessibilityInfo = function() {
		return {
			role: "link",
			type: sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons").getText("ACC_CTR_TYPE_LINK"),
			description: this.getText() || this.getHref() || "",
			focusable: this.getEnabled(),
			enabled: this.getEnabled()
		};
	};

	return Link;

}, /* bExport= */ true);
