/* global QUnit*/

sap.ui.define([
	"sap/ui/mdc/link/ContactDetails", "sap/ui/mdc/link/ContactDetailsItem", "sap/ui/mdc/link/ContactDetailsPhoneItem", "sap/ui/mdc/link/ContactDetailsEmailItem", "sap/ui/mdc/link/ContactDetailsAddressItem"
], function (ContactDetails, ContactDetailsItem, ContactDetailsPhoneItem, ContactDetailsEmailItem, ContactDetailsAddressItem) {
	"use strict";

	QUnit.module("sap.ui.mdc.link.ContactDetails: API", {
		beforeEach: function () {
			this.oContactDetails = new ContactDetails();
		},
		afterEach: function () {
			this.oContactDetails.destroy();
		}
	});
	QUnit.test("Instance", function (assert) {
		assert.ok(this.oContactDetails);
	});
	QUnit.test("Properties", function (assert) {
		assert.deepEqual(this.oContactDetails.getItems(), []);
	});

	QUnit.module("sap.ui.mdc.link.ContactDetails: display", {
		beforeEach: function () {

		},
		afterEach: function () {
			this.oContactDetails.destroy();
		}
	});
	QUnit.test("'only preferred emails'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					emails: [
						new ContactDetailsEmailItem({
							uri: "work@sap.com",
							types: [
								"work", "preferred"
							]
						}), new ContactDetailsEmailItem({
							uri: "home@sap.com",
							types: [
								"home", "preferred"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 2);
			assert.equal(this.oContactDetails.$().find("a").length, 2);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "E-Mail");
			assert.equal(this.oContactDetails.$().find("a")[0].text, "work@sap.com");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[1].innerText, "E-Mail");
			assert.equal(this.oContactDetails.$().find("a")[1].text, "home@sap.com");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'preferred and not preferred emails'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					emails: [
						new ContactDetailsEmailItem({
							uri: "home@sap.com",
							types: [
								"home", "preferred"
							]
						}), new ContactDetailsEmailItem({
							uri: "work@sap.com",
							types: [
								"work"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 2);
			assert.equal(this.oContactDetails.$().find("a").length, 2);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "E-Mail");
			assert.equal(this.oContactDetails.$().find("a")[0].text, "home@sap.com");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[1].innerText, "E-Mail");
			assert.equal(this.oContactDetails.$().find("a")[1].text, "work@sap.com");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'not preferred home email'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					emails: [
						new ContactDetailsEmailItem({
							uri: "home@sap.com",
							types: [
								"home"
							]
						}), new ContactDetailsEmailItem({
							uri: "work@sap.com",
							types: [
								"preferred"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 1);
			assert.equal(this.oContactDetails.$().find("a").length, 1);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "E-Mail");
			assert.equal(this.oContactDetails.$().find("a")[0].text, "work@sap.com");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'only preferred phones'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					phones: [
						new ContactDetailsPhoneItem({
							uri: "0622734567-2",
							types: [
								"preferred", "cell"
							]
						}), new ContactDetailsPhoneItem({
							uri: "0622734567-3",
							types: [
								"preferred", "fax"
							]
						}), new ContactDetailsPhoneItem({
							uri: "0622734567-1",
							types: [
								"preferred", "work"
							]
						}), new ContactDetailsPhoneItem({
							uri: "0622734567-4",
							types: [
								"preferred"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 4);
			assert.equal(this.oContactDetails.$().find("a").length, 4);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "Phone");
			assert.equal(this.oContactDetails.$().find("a")[0].text, "0622734567-1");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[1].innerText, "Mobile");
			assert.equal(this.oContactDetails.$().find("a")[1].text, "0622734567-2");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[2].innerText, "Fax");
			assert.equal(this.oContactDetails.$().find("a")[2].text, "0622734567-3");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[3].innerText, "Phone");
			assert.equal(this.oContactDetails.$().find("a")[3].text, "0622734567-4");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'preferred and not preferred work phones'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					phones: [
						new ContactDetailsPhoneItem({
							uri: "0622734567-11",
							types: [
								"work"
							]
						}), new ContactDetailsPhoneItem({
							uri: "0622734567-10",
							types: [
								"work", "preferred"
							]
						}), new ContactDetailsPhoneItem({
							uri: "0622734567-12",
							types: [
								"work"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 3);
			assert.equal(this.oContactDetails.$().find("a").length, 3);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "Phone");
			assert.equal(this.oContactDetails.$().find("a")[0].text, "0622734567-10");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[1].innerText, "Phone");
			assert.equal(this.oContactDetails.$().find("a")[1].text, "0622734567-11");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[2].innerText, "Phone");
			assert.equal(this.oContactDetails.$().find("a")[2].text, "0622734567-12");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'preferred and not preferred cells'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					phones: [
						new ContactDetailsPhoneItem({
							uri: "0622734567-11",
							types: [
								"cell"
							]
						}), new ContactDetailsPhoneItem({
							uri: "0622734567-10",
							types: [
								"cell", "preferred"
							]
						}), new ContactDetailsPhoneItem({
							uri: "0622734567-12",
							types: [
								"cell"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 3);
			assert.equal(this.oContactDetails.$().find("a").length, 3);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "Mobile");
			assert.equal(this.oContactDetails.$().find("a")[0].text, "0622734567-10");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[1].innerText, "Mobile");
			assert.equal(this.oContactDetails.$().find("a")[1].text, "0622734567-11");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[2].innerText, "Mobile");
			assert.equal(this.oContactDetails.$().find("a")[2].text, "0622734567-12");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'preferred and not preferred fax'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					phones: [
						new ContactDetailsPhoneItem({
							uri: "0622734567-11",
							types: [
								"fax"
							]
						}), new ContactDetailsPhoneItem({
							uri: "0622734567-10",
							types: [
								"fax", "preferred"
							]
						}), new ContactDetailsPhoneItem({
							uri: "0622734567-12",
							types: [
								"fax"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 3);
			assert.equal(this.oContactDetails.$().find("a").length, 3);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "Fax");
			assert.equal(this.oContactDetails.$().find("a")[0].text, "0622734567-10");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[1].innerText, "Fax");
			assert.equal(this.oContactDetails.$().find("a")[1].text, "0622734567-11");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[2].innerText, "Fax");
			assert.equal(this.oContactDetails.$().find("a")[2].text, "0622734567-12");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'not preferred home phone'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					phones: [
						new ContactDetailsPhoneItem({
							uri: "0622734567-",
							types: [
								"home"
							]
						}), new ContactDetailsPhoneItem({
							uri: "0622734567",
							types: [
								"fax", "preferred"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 1);
			assert.equal(this.oContactDetails.$().find("a").length, 1);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "Fax");
			assert.equal(this.oContactDetails.$().find("a")[0].text, "0622734567");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'only preferred addresses'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					addresses: [
						new ContactDetailsAddressItem({
							street: "home",
							types: [
								"preferred", "home"
							]
						}), new ContactDetailsAddressItem({
							street: "work",
							types: [
								"preferred", "work"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 2);
			assert.equal(this.oContactDetails.$().find("a").length, 0);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "Address");
			assert.equal(this.oContactDetails.$().find("span.sapMText")[0].innerText, "home");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[1].innerText, "Address");
			assert.equal(this.oContactDetails.$().find("span.sapMText")[1].innerText, "work");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'preferred and not preferred addresses'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					addresses: [
						new ContactDetailsAddressItem({
							street: "home",
							types: [
								"preferred", "home"
							]
						}), new ContactDetailsAddressItem({
							street: "work",
							types: [
								"work"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 2);
			assert.equal(this.oContactDetails.$().find("a").length, 0);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "Address");
			assert.equal(this.oContactDetails.$().find("span.sapMText")[0].innerText, "home");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[1].innerText, "Address");
			assert.equal(this.oContactDetails.$().find("span.sapMText")[1].innerText, "work");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'not preferred home addresses'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					addresses: [
						new ContactDetailsAddressItem({
							street: "home",
							types: [
								"home"
							]
						}), new ContactDetailsAddressItem({
							street: "work",
							types: [
								"preferred"
							]
						})
					]
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 1);
			assert.equal(this.oContactDetails.$().find("a").length, 0);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[0].innerText, "Address");
			assert.equal(this.oContactDetails.$().find("span.sapMText")[0].innerText, "work");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			fnTest();
			done();
		});
	});
	QUnit.test("'items'", function (assert) {
		this.oContactDetails = new ContactDetails({
			items: [
				new ContactDetailsItem({
					photo: "/testsuite/test-resources/sap/ui/documentation/sdk/images/johnDoe.png",
					formattedName: "John Doe",
					role: "Research & Development",
					title: "Developer",
					org: "New Economy",
					emails: [
						new ContactDetailsEmailItem({
							uri: "do.not.reply@sap.com",
							types: [
								"work"
							]
						}), new ContactDetailsEmailItem({
							uri: "home@sap.com",
							types: [
								"preferred", "home"
							]
						})
					],
					phones: new ContactDetailsPhoneItem({
						uri: "0622734567",
						types: [
							"preferred", "cell"
						]
					}),
					addresses: new ContactDetailsAddressItem({
						street: "800 E 3rd St.",
						code: "90013",
						locality: "Los Angeles",
						region: "CA",
						country: "USA",
						types: [
							"work"
						]
					})
				})
			]
		});

		this.oContactDetails.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var fnTest = function () {
			assert.ok(this.oContactDetails.getDomRef());
			assert.equal(this.oContactDetails.getItems()[0].getSectionTitle(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));
			assert.equal(this.oContactDetails.getItems()[0].getPhoto(), "/testsuite/test-resources/sap/ui/documentation/sdk/images/johnDoe.png");
			assert.equal(this.oContactDetails.getItems()[0].getFormattedName(), "John Doe");
			assert.equal(this.oContactDetails.getItems()[0].getRole(), "Research & Development");
			assert.equal(this.oContactDetails.getItems()[0].getTitle(), "Developer");
			assert.equal(this.oContactDetails.getItems()[0].getOrg(), "New Economy");

			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").length, 1);
			assert.equal(this.oContactDetails.$().find(".sapUiFormTitle").text(), sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_CONTACT_SECTION_TITLE"));

			assert.equal(this.oContactDetails.$().find("span.sapMLabel").length, 8);
			assert.equal(this.oContactDetails.$().find("a").length, 3);

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[1].innerText, "Name");
			assert.equal(this.oContactDetails.$().find("span.sapMText")[0].innerText, "John Doe");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[2].innerText, "Role");
			assert.equal(this.oContactDetails.$().find("span.sapMText")[1].innerText, "Research & Development");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[3].innerText, "Job Title");
			assert.equal(this.oContactDetails.$().find("span.sapMText")[2].innerText, "Developer");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[4].innerText, "Department");
			assert.equal(this.oContactDetails.$().find("span.sapMText")[3].innerText, "New Economy");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[5].innerText, "E-Mail");
			assert.equal(this.oContactDetails.$().find("a")[0].text, "home@sap.com");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[6].innerText, "E-Mail");
			assert.equal(this.oContactDetails.$().find("a")[1].text, "do.not.reply@sap.com");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[7].innerText, "Mobile");
			assert.equal(this.oContactDetails.$().find("a")[2].text, "0622734567");

			assert.equal(this.oContactDetails.$().find(".sapMLabelTextWrapper")[8].innerText, "Address");
			assert.equal(this.oContactDetails.$().find("span.sapMText")[4].innerText, "800 E 3rd St., 90013 Los Angeles, CA, USA");
		}.bind(this);

		var oResourceModel = this.oContactDetails._getCompositeAggregation().getModel("$this.i18n");
		if (oResourceModel.getContext("/").getObject("info.POPOVER_CONTACT_SECTION_JOBTITLE")) {
			fnTest();
			return;
		}
		var done = assert.async();
		oResourceModel.attachRequestCompleted(function () {
			setTimeout(function(){
				fnTest();
				done();
			},50);
		});
	});
});
