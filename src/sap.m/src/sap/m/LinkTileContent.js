/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/core/Element",
    "sap/m/HBox",
    "sap/m/Link",
    "sap/ui/core/Icon"
    ],function(Element,HBox,Link,Icon){
    "use strict";
    /**
	 * Constructor for a new LinkTileContent.
	 *
	 * @param {string} [sId] ID for the new control, it is generated automatically if an ID is not provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class This element is used within the GenericTile control that generates a combination of an icon and a linkl
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.120
	 * @alias sap.m.LinkTileContent
	 */
    const LinkTileContent = Element.extend("sap.m.LinkTileContent",{
        metadata:{
            library: "sap.m",
            properties: {
                /**
				 * This property can be set by following options:
				 *
				 * <b>Option 1:</b></br>
				 * The value has to be matched by following pattern <code>sap-icon://collection-name/icon-name</code> where
				 * <code>collection-name</code> and <code>icon-name</code> have to be replaced by the desired values.
				 * In case the default UI5 icons are used the <code>collection-name</code> can be omited.</br>
				 * <i>Example:</i> <code>sap-icon://accept</code>
				 *
				 * <b>Option 2:</b>
				 * The value is determined by using {@link sap.ui.core.IconPool.getIconURI} with an Icon name parameter
				 * and an optional collection parameter which is required when using application extended Icons.</br>
				 * <i>Example:</i> <code>IconPool.getIconURI("accept")</code>
				 */
                iconSrc: {type : "sap.ui.core.URI", group : "Data", defaultValue : null},
				/**
				 * Defines the displayed link text.
				 */
                linkText: {type : "string", group : "Data", defaultValue : ''},
                /**
				 * Defines the link target URI. Supports standard hyperlink behavior.
				 * <b>Note:</b> Don't set <code>href</code> property if an action should be triggered by the link. Instead set <code>accessibleRole</code>
				 * property to <code>LinkAccessibleRole.Button</code> and register a <code>press</code> event handler.
				 */
                linkHref: {type : "sap.ui.core.URI", group : "Data", defaultValue : null}
            },
            events: {
                /**
				 * Event is fired when the user triggers the link control.
				 */
                linkPress: {
                    allowPreventDefault : true,
					parameters: {
						/**
						 * Indicates whether the CTRL key was pressed when the link was selected.
						 * @since 1.120
						 */
						ctrlKey: { type: "boolean" },
						/**
						 * Indicates whether the "meta" key was pressed when the link was selected.
						 *
						 * On Macintosh keyboards, this is the command key (⌘).
						 * On Windows keyboards, this is the windows key (⊞).
						 *
						 * @since 1.120
						 */
						metaKey: { type: "boolean" }
					}
                }
            }
        }
    });
    LinkTileContent.prototype.init = function() {
        this._linkTileContent = null;
    };
    /**
     * Returns the current element instance
     * @returns {Object<sap.m.LinkTileContent>}
     * @public
     */
    LinkTileContent.prototype.getLinkTileContentInstance = function() {
        if (!this._linkTileContent) {
            this._linkTileContent = new HBox();
            this._addItem(this._linkTileContent);
            this._linkTileContent.addStyleClass("sapLTC");
        }
        return this._linkTileContent;
    };
    /**
     * It adds an icon and link to the element
     * @param {Object<sap.m.HBox>} oHBox
     * @private
     */
    LinkTileContent.prototype._addItem = function(oHBox) {
        const {iconSrc,linkText,linkHref} = this.mProperties;
        this._oIcon = new Icon({
            size: "1rem",
            src: iconSrc
        });
        this._oLink = new Link({
            text: linkText,
            href: linkHref,
            press: this._onLinkPress.bind(this)
        });
        oHBox.addItem(this._oIcon);
        oHBox.addItem(this._oLink);
    };
    /**
     * Returns the current element instance
     * @returns {Object<sap.m.Link>}
     * @private
     */
    LinkTileContent.prototype._getLink = function() {
        return this._oLink;
    };
    /**
     * Returns the current element instance
     * @returns {Object<sap.ui.core.Icon>}
     * @private
     */
    LinkTileContent.prototype._getIcon = function() {
        return this._oIcon;
    };
    /**
     * Sets the press event handler on the link
     * @private
     */
    LinkTileContent.prototype._onLinkPress = function(oEvent) {
        const {ctrlKey,metaKey} = oEvent.mParameters;
        this.fireLinkPress({ctrlKey,metaKey});
    };
    return LinkTileContent;
});