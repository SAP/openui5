/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickViewGroupElement
sap.ui.define([
		'jquery.sap.global', './library', 'sap/ui/core/Element', './QuickViewGroupElementType',
		'./Link', './Text', 'sap/ui/core/CustomData'],
	function(jQuery, library, Element, GroupElementType,
				Link, Text, CustomData) {
		"use strict";

		/**
		 * Constructor for a new QuickViewGroupElement
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 * @class QuickViewGroupElement is a combination of one label and another control (Link or Text) associated to this label
		 * @extends sap.ui.core.Element
		 * @author SAP SE
		 * @constructor
		 * @public
		 * @alias sap.m.QuickViewGroupElement
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var GroupElement = Element.extend("sap.m.QuickViewGroupElement",
			{
				metadata: {

					library: "sap.m",
					properties: {

						/**
						 * Whether the element should be visible on the screen.
						 */
						visible : {
							type: "boolean",
							group : "Appearance",
							defaultValue: true
						},

						/**
						 * The text displayed below the associated label.
						 */
						label: {
							type: "string",
							group: "Misc",
							defaultValue: ""
						},

						/**
						 * The text of the control that associates with the label.
						 */
						value: {
							type: "string",
							group: "Misc",
							defaultValue: ""
						},

						/**
						 * The address of the QuickViewGroupElement link. Works only with QuickViewGroupElement of type link.
						 */
						url: {
							type: "string",
							group: "Misc",
							defaultValue: ""
						},

						/**
						 * The target of the link – it works like the target property of the HTML <a> tag. Works only with QuickViewGroupElement of type link.
						 */
						target: {
							type: "string",
							group: "Misc",
							defaultValue: "_blank"
						},

						/**
						 * The type of the displayed information – phone number, mobile number, e-mail, link, text or a link to another QuickViewPage. Default value is ‘text’.
						 */
						type: {
							type: "sap.m.QuickViewGroupElementType",
							group: "Misc",
							defaultValue: GroupElementType.text
						},

						/**
						 * The id of the QuickViewPage, which is opened from the link in the QuickViewGroupElement.
						 * Works only with QuickViewGroupElement of type pageLink.
						 */
						pageLinkId: {
							type: "string",
							group: "Misc",
							defaultValue: ""
						},

						/**
						 * The subject of the email.
						 * Works only with QuickViewGroupElement of type email.
						 */
						emailSubject: {
							type: "string",
							group: "Misc",
							defaultValue: ""
						}
					}
				}
			});

		/**
		 * Returns a control that should be associated with the label of the group element.
		 *
		 * @private
		 */
		GroupElement.prototype._getGroupElementValue = function(sQuickViewId) {
			switch (this.getType()) {
				case GroupElementType.email:

					var href = "mailto:" + this.getValue();
					var subject = this.getEmailSubject();
					if (subject) {
						href += '?subject=' + subject;
					}

					return new Link({
						href : href,
						text : this.getValue()
					});
				case GroupElementType.phone:
				case GroupElementType.mobile:
					return new Link({
						href : "tel:" + this.getValue(),
						text : this.getValue()
					});
				case GroupElementType.link:
					return new Link({
						href : this.getUrl(),
						text : this.getValue(),
						target : this.getTarget()
					});
				case GroupElementType.pageLink:

					var linkValue = this.getPageLinkId();
					if (sQuickViewId) {
						linkValue = sQuickViewId + '-' + linkValue;
					}

					return new Link({
						href : "#",
						text : this.getValue(),
						customData : [new CustomData({
							key : "pageNumber",
							value : linkValue
						})]
					});
				default:
					return new Text({
						text : this.getValue()
					});
			}
		};

		return GroupElement;

	}, /* bExport= */true);
