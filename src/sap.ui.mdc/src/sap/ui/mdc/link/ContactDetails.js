/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"./ContactDetailsRenderer",
	"sap/ui/core/Title",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/m/Link",
	"sap/m/Label",
	"sap/m/Image",
	"sap/ui/layout/form/SimpleForm"
], function(Control, ContactDetailsRenderer, Title, VBox, Text, Link, Label, Image, SimpleForm) {
	"use strict";

	/**
	 * Constructor for a new ContactDetails.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The ContactDetails control is used to show additional information like for example 'contact details'.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.56.0
	 * @alias sap.ui.mdc.link.ContactDetails
	 */
	var ContactDetails = Control.extend("sap.ui.mdc.link.ContactDetails", /** @lends sap.ui.mdc.link.ContactDetails.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			defaultAggregation: "items",
			aggregations: {
				items: {
					type: "sap.ui.mdc.link.ContactDetailsItem",
					multiple: true,
					singularName: "item"
				},
				_content: {
					type: "sap.m.VBox",
					visibility: "hidden",
					multiple: false
				}
			}
		},
		renderer: ContactDetailsRenderer
	});

	var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	ContactDetails.prototype.applySettings = function() {
		Control.prototype.applySettings.apply(this, arguments);

		this._createContent();
	};
	ContactDetails.prototype._createContent = function() {
		var aSimpleForms = [];
		this.getItems().forEach(function(oContactDetailsItem) {
			var oTitle = new Title({
				text: oContactDetailsItem.getSectionTitle()
			});
			var oImage = new Image({
				src: oContactDetailsItem.getPhoto(),
				visible: !!oContactDetailsItem.getPhoto(),
				decorative: false,
				width: "5rem",
				height: "5rem"
			});
			var oLabelImage = new Label({
				text: "",
				labelFor: oImage,
				visible: !!oContactDetailsItem.getPhoto()
			});
			var oTextName = new Text({
				text: oContactDetailsItem.getFormattedName(),
				visible: !!oContactDetailsItem.getFormattedName()
			});
			var oLabelName = new Label({
				text: oRB.getText("info.POPOVER_CONTACT_SECTION_NAME"),
				labelFor: oTextName,
				visible: !!oContactDetailsItem.getFormattedName()
			});
			var oTextRole = new Text({
				text: oContactDetailsItem.getRole(),
				visible: !!oContactDetailsItem.getRole()
			});
			var oLabelRole = new Label({
				text: oRB.getText("info.POPOVER_CONTACT_SECTION_ROLE"),
				labelFor: oTextRole,
				visible: !!oContactDetailsItem.getRole()
			});
			var oTextTitle = new Text({
				text: oContactDetailsItem.getTitle(),
				visible: !!oContactDetailsItem.getTitle()
			});
			var oLabelTitle = new Label({
				text: oRB.getText("info.POPOVER_CONTACT_SECTION_JOBTITLE"),
				labelFor: oTextTitle,
				visible: !!oContactDetailsItem.getTitle()
			});
			var oTextOrg = new Text({
				text: oContactDetailsItem.getOrg(),
				visible: !!oContactDetailsItem.getOrg()
			});
			var oLabelOrg = new Label({
				text: oRB.getText("info.POPOVER_CONTACT_SECTION_DEPARTMENT"),
				labelFor: oTextOrg,
				visible: !!oContactDetailsItem.getOrg()
			});

			var oSimpleForm = new SimpleForm({
				editable: false,
				layout: "ColumnLayout",
				content: [
					oTitle, oLabelImage, oImage, oLabelName, oTextName, oLabelRole, oTextRole, oLabelTitle, oTextTitle, oLabelOrg, oTextOrg
				]
			});
			this._addEmailsToSimpleForm(oContactDetailsItem, oSimpleForm, oRB);
			this._addPhonesToSimpleForm(oContactDetailsItem, oSimpleForm, oRB);
			this._addAddressesToSimpleForm(oContactDetailsItem, oSimpleForm, oRB);

			aSimpleForms.push(oSimpleForm);
		}.bind(this));

		this.setAggregation("_content", new VBox({
			//ariaLabelledBy: aSimpleForms.length ? aSimpleForms[0].getContent()[0] : undefined,
			items: aSimpleForms
		}));
	};
	ContactDetails.prototype._addEmailsToSimpleForm = function(oContactDetailsItem, oSimpleForm, oRB) {
		// Show email(s) annotated with 'preferred' on top (independent on type e.g. 'work' or 'home' etc) and then non 'preferred' email(s) below.
		// Non 'preferred' 'home' is ignored.
		oContactDetailsItem.getEmails().filter(function(oContactDetailsLinkItem) {
			return !oContactDetailsLinkItem.processed && !!oContactDetailsLinkItem.getTypes() && (oContactDetailsLinkItem.getTypes().indexOf("preferred") > -1 || oContactDetailsLinkItem.getTypes().indexOf("work") > -1);
		}).sort(function(a, b) {
			if (a.getTypes().indexOf("preferred") > -1 && b.getTypes().indexOf("preferred") < 0) {
				return -1;
			}
			if (b.getTypes().indexOf("preferred") > -1 && a.getTypes().indexOf("preferred") < 0) {
				return 1;
			}
			return 0;
		}).forEach(function(oContactDetailsLinkItem) {
			this._addLabeledLink("email", oRB.getText("info.POPOVER_CONTACT_SECTION_EMAIL"), oContactDetailsLinkItem, oSimpleForm);
			oContactDetailsLinkItem.processed = true;
		}, this);
	};
	ContactDetails.prototype._addPhonesToSimpleForm = function(oContactDetailsItem, oSimpleForm, oRB) {
		// Non 'preferred' 'home' is ignored.

		// 1. Show 'preferred work' tel(s) on top and then 'work' tel(s)
		oContactDetailsItem.getPhones().filter(function(oContactDetailsLinkItem) {
			return !oContactDetailsLinkItem.processed && !!oContactDetailsLinkItem.getTypes() && oContactDetailsLinkItem.getTypes().indexOf("work") > -1;
		}).sort(function(a, b) {
			if (a.getTypes().indexOf("preferred") > -1) {
				return -1;
			}
			if (b.getTypes().indexOf("preferred") > -1) {
				return 1;
			}
			return 0;
		}).forEach(function(oContactDetailsLinkItem) {
			this._addLabeledLink("phone", oRB.getText("info.POPOVER_CONTACT_SECTION_PHONE"), oContactDetailsLinkItem, oSimpleForm);
			oContactDetailsLinkItem.processed = true;
		}, this);

		// 2. Show 'preferred cell' tel(s) on top and then 'cell' tel(s)
		oContactDetailsItem.getPhones().filter(function(oContactDetailsLinkItem) {
			return !oContactDetailsLinkItem.processed && !!oContactDetailsLinkItem.getTypes() && oContactDetailsLinkItem.getTypes().indexOf("cell") > -1;
		}).sort(function(a, b) {
			if (a.getTypes().indexOf("preferred") > -1) {
				return -1;
			}
			if (b.getTypes().indexOf("preferred") > -1) {
				return 1;
			}
			return 0;
		}).forEach(function(oContactDetailsLinkItem) {
			this._addLabeledLink("phone", oRB.getText("info.POPOVER_CONTACT_SECTION_MOBILE"), oContactDetailsLinkItem, oSimpleForm);
			oContactDetailsLinkItem.processed = true;
		}, this);

		// 3. Show 'preferred fax' tel(s) on top and then 'fax' tel(s)
		oContactDetailsItem.getPhones().filter(function(oContactDetailsLinkItem) {
			return !oContactDetailsLinkItem.processed && !!oContactDetailsLinkItem.getTypes() && oContactDetailsLinkItem.getTypes().indexOf("fax") > -1;
		}).sort(function(a, b) {
			if (a.getTypes().indexOf("preferred") > -1) {
				return -1;
			}
			if (b.getTypes().indexOf("preferred") > -1) {
				return 1;
			}
			return 0;
		}).forEach(function(oContactDetailsLinkItem) {
			this._addLabeledLink("phone", oRB.getText("info.POPOVER_CONTACT_SECTION_FAX"), oContactDetailsLinkItem, oSimpleForm);
			oContactDetailsLinkItem.processed = true;
		}, this);

		// 4. Show remain 'preferred' tel(s), independent on type e.g. 'home'
		oContactDetailsItem.getPhones().filter(function(oContactDetailsLinkItem) {
			return !oContactDetailsLinkItem.processed && !!oContactDetailsLinkItem.getTypes() && oContactDetailsLinkItem.getTypes().indexOf("preferred") > -1;
		}).forEach(function(oContactDetailsLinkItem) {
			this._addLabeledLink("phone", oRB.getText("info.POPOVER_CONTACT_SECTION_PHONE"), oContactDetailsLinkItem, oSimpleForm);
			oContactDetailsLinkItem.processed = true;
		}, this);
	};
	ContactDetails.prototype._addAddressesToSimpleForm = function(oContactDetailsItem, oSimpleForm, oRB) {
		// Show address(es) annotated with 'preferred' on top (independent on type e.g. 'work' or 'home' etc) and then non 'preferred' 'work' address(es) below
		// Non 'preferred' 'home' is ignored.
		oContactDetailsItem.getAddresses().filter(function(oContactDetailsAddressItem) {
			return !oContactDetailsAddressItem.processed && !!oContactDetailsAddressItem.getTypes() && (oContactDetailsAddressItem.getTypes().indexOf("preferred") > -1 || oContactDetailsAddressItem.getTypes().indexOf("work") > -1);
		}).sort(function(a, b) {
			if (a.getTypes().indexOf("preferred") > -1 && b.getTypes().indexOf("preferred") < 0) {
				return -1;
			}
			if (b.getTypes().indexOf("preferred") > -1 && a.getTypes().indexOf("preferred") < 0) {
				return 1;
			}
			return 0;
		}).forEach(function(oContactDetailsAddressItem) {
			this._addLabeledAddress(oContactDetailsAddressItem, oSimpleForm, oRB);
			oContactDetailsAddressItem.processed = true;
		}, this);
	};
	ContactDetails.prototype._addLabeledAddress = function(oContactDetailsAddressItem, oSimpleForm, oRB) {
		// Defined order: <Street with housenumber>, <Postalcode> <City>, <State>, <Country>
		var fnAddressFormatter = function(sStreet, sCode, sLocality, sRegion, sCountry) {
			var aValidComponents = [];
			if (sStreet) {
				aValidComponents.push(sStreet);
			}
			if (sCode && sLocality) {
				aValidComponents.push(sCode + " " + sLocality);
			} else {
				if (sCode) {
					aValidComponents.push(sCode);
				}
				if (sLocality) {
					aValidComponents.push(sLocality);
				}
			}
			if (sRegion) {
				aValidComponents.push(sRegion);
			}
			if (sCountry) {
				aValidComponents.push(sCountry);
			}
			return aValidComponents.join(', ');
		};
		var fnAddressVisibilityFormatter = function(sStreet, sCode, sLocality, sRegion, sCountry) {
			return !!(sStreet || sCode || sLocality || sRegion || sCountry);
		};
		var aParts;
		var oControl;
		if (oContactDetailsAddressItem.getBindingPath("street") && oContactDetailsAddressItem.getBindingPath("code") && oContactDetailsAddressItem.getBindingPath("locality") && oContactDetailsAddressItem.getBindingPath("region") && oContactDetailsAddressItem.getBindingPath("country")) {
			aParts = [
				{
					path: oContactDetailsAddressItem.getBindingPath("street") ? oContactDetailsAddressItem.getBindingPath("street") : "$notExisting"
				}, {
					path: oContactDetailsAddressItem.getBindingPath("code") ? oContactDetailsAddressItem.getBindingPath("code") : "$notExisting"
				}, {
					path: oContactDetailsAddressItem.getBindingPath("locality") ? oContactDetailsAddressItem.getBindingPath("locality") : "$notExisting"
				}, {
					path: oContactDetailsAddressItem.getBindingPath("region") ? oContactDetailsAddressItem.getBindingPath("region") : "$notExisting"
				}, {
					path: oContactDetailsAddressItem.getBindingPath("country") ? oContactDetailsAddressItem.getBindingPath("country") : "$notExisting"
				}
			];
			oControl = new Text();
			oControl.bindProperty("text", {
				parts: aParts,
				formatter: fnAddressFormatter
			});
			oControl.bindProperty("visible", {
				parts: aParts,
				formatter: fnAddressVisibilityFormatter
			});
		} else {
			oControl = new Text({
				text: fnAddressFormatter(oContactDetailsAddressItem.getStreet(), oContactDetailsAddressItem.getCode(), oContactDetailsAddressItem.getLocality(), oContactDetailsAddressItem.getRegion(), oContactDetailsAddressItem.getCountry()),
				visible: fnAddressVisibilityFormatter(oContactDetailsAddressItem.getStreet(), oContactDetailsAddressItem.getCode(), oContactDetailsAddressItem.getLocality(), oContactDetailsAddressItem.getRegion(), oContactDetailsAddressItem.getCountry())
			});
		}
		var oLabel = new Label({
			text: oRB.getText("info.POPOVER_CONTACT_SECTION_ADR"),
			labelFor: oControl.getId()
		});
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oControl);
	};
	ContactDetails.prototype._addLabeledLink = function(sLinkType, sLabelText, oContactDetailsLinkItem, oSimpleForm) {
		var oControl;
		if (oContactDetailsLinkItem.getBindingPath("uri")) {
			oControl = new Link();
			oControl.bindProperty("href", {
				path: oContactDetailsLinkItem.getBindingPath("uri"),
				formatter: function(oValue) {
					return (sLinkType === "email" ? "mailto:" : "tel:") + oValue;
				}
			});
			oControl.bindProperty("text", {
				path: oContactDetailsLinkItem.getBindingPath("uri")
			});
			oControl.bindProperty("visible", {
				path: oContactDetailsLinkItem.getBindingPath("uri"),
				formatter: function(oValue) {
					return !!oValue;
				}
			});
		} else {
			oControl = new Link({
				href: sLinkType === "email" ? "mailto:" : "tel:" + oContactDetailsLinkItem.getUri(),
				text: oContactDetailsLinkItem.getUri(),
				visible: !!oContactDetailsLinkItem.getUri()
			});
		}
		var oLabel = new Label({
			text: sLabelText,
			labelFor: oControl.getId()
		});
		oSimpleForm.addContent(oLabel);
		oSimpleForm.addContent(oControl);
	};
	return ContactDetails;

});
