/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickViewGroupElement
sap.ui.define([
		'./library', 'sap/ui/core/Element',
		'./Link', './Text', 'sap/ui/core/CustomData'],
	function(library, Element,
				Link, Text, CustomData) {
		"use strict";

		// shortcut for sap.m.QuickViewGroupElementType
		var GroupElementType = library.QuickViewGroupElementType;

		/**
		* Constructor for a new QuickViewGroupElement.
		*
		* @param {string} [sId] ID for the new control, generated automatically if no ID is given
		* @param {object} [mSettings] Initial settings for the new control
		*
		* @class QuickViewGroupElement is a combination of one label and another control (Link or Text) associated to this label.
		*
		* @extends sap.ui.core.Element
		*
		* @author SAP SE
		* @version ${version}
		*
		* @constructor
		* @public
		* @since 1.28.11
		* @alias sap.m.QuickViewGroupElement
		* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		*/
		var GroupElement = Element.extend("sap.m.QuickViewGroupElement", /** @lends sap.m.QuickViewGroupElement.prototype */ {
				metadata: {

					library: "sap.m",
					properties: {

						/**
						 * Determines whether the element should be visible on the screen.
						 */
						visible : {
							type: "boolean",
							group : "Appearance",
							defaultValue: true
						},

						/**
						 * Specifies the text displayed below the associated label.
						 */
						label: {
							type: "string",
							group: "Misc",
							defaultValue: ""
						},

						/**
						 * Specifies the text of the control that associates with the label.
						 */
						value: {
							type: "string",
							group: "Misc",
							defaultValue: ""
						},

						/**
						 * Specifies the address of the QuickViewGroupElement link. Works only with QuickViewGroupElement of type link.
						 */
						url: {
							type: "string",
							group: "Misc",
							defaultValue: ""
						},

						/**
						 * Specifies the target of the link - it works like the target property of the HTML <a> tag. Works only with QuickViewGroupElement of type link.
						 */
						target: {
							type: "string",
							group: "Misc",
							defaultValue: "_blank"
						},

						/**
						 * Specifies the type of the displayed information - phone number, mobile number, e-mail, link, text or a link to another QuickViewPage. Default value is 'text'.
						 */
						type: {
							type: "sap.m.QuickViewGroupElementType",
							group: "Misc",
							defaultValue: GroupElementType.text
						},

						/**
						 * Specifies the ID of the QuickViewPage, which is opened from the link in the QuickViewGroupElement.
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
		 * Returns a control that is associated with the label of the group element.
		 * @param {string} sQuickViewPageId The page to which the element navigates when clicked.
		 * @private
		 */
		GroupElement.prototype._getGroupElementValue = function(sQuickViewPageId) {
			if (!this.getValue()) {
				return null;
			}

			switch (this.getType()) {
				case GroupElementType.email:

					var href = "mailto:" + this.getValue();
					var subject = this.getEmailSubject();
					if (subject) {
						href += '?subject=' + subject;
					}

					return new Link({
						href : href,
						text : this.getValue(),
						wrapping : true
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
					if (sQuickViewPageId) {
						linkValue = sQuickViewPageId + '-' + linkValue;
					}

					return new Link({
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

		GroupElement.prototype.setProperty = function (sName, oValue) {
			var oQuickView = this.getQuickViewBase(),
				bSuppressInvalidate = false;

			if (oQuickView && oQuickView.isA("sap.m.QuickView")) {
				bSuppressInvalidate = true;
			}

			Element.prototype.setProperty.call(this, sName, oValue, bSuppressInvalidate);

			var oGroup = this.getParent();
			if (!oGroup) {
				return this;
			}

			var oPage = oGroup.getParent();
			if (oPage) {
				oPage._updatePage();
			}

			return this;
		};

		GroupElement.prototype.getQuickViewBase = function () {
			var oParent = this.getParent();
			if (oParent && oParent.getQuickViewBase) {
				return oParent.getQuickViewBase();
			}
			return null;
		};

		return GroupElement;

	});
