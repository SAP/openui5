/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/m/library",
	"sap/m/Text",
	"sap/m/Link"
	],function(Element,library,Text,Link){
	"use strict";
	// shortcut for sap.m.ContentConfigType
	const ContentConfigType = library.ContentConfigType;
	// shortcut for sap.m.LinkAccessibleRole
	const LinkAccessibleRole = library.LinkAccessibleRole;

	/**
	 * Constructor for a new ContentConfig.
	 *
	 * @param {string} [sId] ID for the new control, it is generated automatically if an ID is not provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class This element is used within the TileAttribute control that generates either a link or text
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.121
	 * @alias sap.m.ContentConfig
	 */
	const ContentConfig = Element.extend("sap.m.ContentConfig",{
		metadata:{
			library: "sap.m",
			properties: {

				/**
				 * The type of the ContentConfig.
				 */
				type: {type: "sap.m.ContentConfigType", group: "Appearance", defaultValue: ContentConfigType.Text},
				/**
				 * Defines the displayed text.
				 */
				text : {type : "string", group : "Data", defaultValue : ''},
				/**
				 * Defines the link target URI. Supports standard hyperlink behavior.
				 * <b>Note:</b> Don't set <code>href</code> property if an action should be triggered by the link. Instead set <code>accessibleRole</code>
				 * property to <code>LinkAccessibleRole.Button</code> and register a <code>press</code> event handler.
				 */
				href : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},
				/**
				 * Describes the accessibility role of the link:<ul>
				 * <li><code>LinkAccessibleRole.Default</code> - a navigation is expected to the location given in <code>href</code> property</li>
				 * <li><code>LinkAccessibleRole.Button</code> - there will be <code>role</code> attribute with value "Button" rendered. In this scenario the <code>href</code>
				 * property value shouldn't be set as navigation isn't expected to occur.</li></ul>
				 *
				 */
				accessibleRole : {type : "sap.m.LinkAccessibleRole", group : "Accessibility", defaultValue : LinkAccessibleRole.Default}
			}
		}
	});
	ContentConfig.prototype.init = function() {
		this._oConfiguredControl = null;
		this._sType = null;
	};

	 /**
     * Returns the current element instance, generates one if it dosent exist
     * @returns {Object<sap.m.LinkTileContent>}
     * @private
     */

	ContentConfig.prototype._getConfigInstance = function() {
		if (!this._oConfiguredControl || (this.getType() != this._sType)) {
			this._sType = this.getType();
			if (this._oConfiguredControl) {
				this._oConfiguredControl.destroy();
				this._oConfiguredControl = null;
			}
			const sType = this.getType();
			const sText = this.getText();
			const sHref = this.getHref();
			const sAccessibleRole = this.getAccessibleRole();
			if (sType === ContentConfigType.Text) {
				this._oConfiguredControl = new Text({
					text: sText,
					maxLines: 1
				});
			} else if (sType === ContentConfigType.Link) {
				this._oConfiguredControl = new Link({
					text: sText,
					href: sHref,
					accessibleRole: sAccessibleRole
				});
			}
			this.addDependent(this._oConfiguredControl);
		}
		return this._oConfiguredControl;
	};

	 /**
     * Returns the current element instance
     * @returns {Object<sap.m.Link> | Object<sap.m.Text>}
     * @public
     */

	ContentConfig.prototype.getInnerControl = function() {
		return this._oConfiguredControl;
	};

	/* --- Setters --- */
	ContentConfig.prototype.setType = function (sType) {
		//The parent control need to be re-rendered if the type has change
		if (this.getType() != sType) {
			this.setProperty("type", sType);
		}
		return this;
	};

	ContentConfig.prototype.setText = function (title) {
		this.setProperty("text", title,true);
		this._oConfiguredControl?.setText(title);
		return this;
	};

	ContentConfig.prototype.setHref = function (sHref) {
		this.setProperty("href", sHref,true);
		if (this._oConfiguredControl?.isA("sap.m.Link")) {
			this._oConfiguredControl.setHref(sHref);
		}
		return this;
	};

	ContentConfig.prototype.setAccessibleRole = function (sAccessibleRole) {
		this.setProperty("accessibleRole", sAccessibleRole,true);
		if (this._oConfiguredControl?.isA("sap.m.Link")) {
			this._oConfiguredControl.setAccessibleRole(sAccessibleRole);
		}
		return this;
	};
	return ContentConfig;
});