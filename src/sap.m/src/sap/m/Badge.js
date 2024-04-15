/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element"
	],function(Element){
	"use strict";
	/**
	 * Constructor for a new Badge.
	 *
	 * @param {string} [sId] ID for the new control, it is generated automatically if an ID is not provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 * @class This element is used within the GenericTile control that generates a combination of an icon and a text to create a badge
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.124
	 * @alias sap.m.Badge
	 */
		const Badge = Element.extend("sap.m.Badge",{
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
				src: {type : "sap.ui.core.URI", group : "Data", defaultValue : null},
				/**
				 * Defines the text inside the badge.
				 */
				text: {type : "string", group : "Data", defaultValue : ''},
				/**
				 * Defines the text color inside the badge
				 */
				textColor: {type : "string", group : "Data", defaultValue : null},
				 /**
				 * Defines the background color inside the badge
				 */
				backgroundColor: {type : "string", group : "Data", defaultValue : null},
				/**
				 * Defines the border color of the badge
				 */
				borderColor: {type : "string", group : "Data", defaultValue : null}
			}
		}
	});
    return Badge;
});