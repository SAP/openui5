/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	DescriptorInlineChangeFactory,
	DescriptorVariantFactory,
	DescriptorChangeFactory,
	LrepConnector,
	CompatibilityConnector,
	Settings,
	sinon
) {
	"use strict";

	QUnit.module("DescriptorInlineChangeFactory", {
		beforeEach : function() {
			//define sandboxes and stubs explicitly for each modules
			this._oSandbox = sinon.sandbox.create();
			this._oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
		},
		afterEach : function() {
			this._oSandbox.restore();
			delete this._oSandbox;
		}
	}, function() {
		QUnit.test("createForExistingVariant", function(assert) {
			var oServer = this._oSandbox.useFakeServer();
			oServer.respondWith("GET", "/sap/bc/lrep/appdescr_variants/id.string",
								[200, { "Content-Type": "text/plain" }, //Simulate an server with incorrect content type response
								'{ "id": "id.string", "reference":"base.id", "content": [] }']);
			oServer.respondWith("GET", "/sap/bc/lrep/appdescr_variants/id.json",
								[200, { "Content-Type": "application/json" },
								'{ "id": "id.json", "reference":"base.id", "content": [] }']);
			oServer.respondWith("GET", "/sap/bc/lrep/appdescr_variants/id.refVer",
					[200, { "Content-Type": "application/json" },
						'{ "id": "id.refVer", "reference":"base.id", "referenceVersion":"1.1", "content": [] }']);
			oServer.autoRespond = true;

			return DescriptorVariantFactory.createForExisting("id.string").then(function(oVariant) {
				assert.equal(oVariant._getMap().id, "id.string");
				assert.equal(oVariant._getMap().reference, "base.id");
				assert.ok(!oVariant._getMap().referenceVersion);
				return DescriptorVariantFactory.createForExisting("id.json");
			}).then(function(oVariant) {
				assert.equal(oVariant._getMap().id, "id.json");
				assert.equal(oVariant._getMap().reference, "base.id");
				assert.ok(!oVariant._getMap().referenceVersion);
				return DescriptorVariantFactory.createForExisting("id.refVer");
			}).then(function(oVariant) {
				assert.equal(oVariant._getMap().id, "id.refVer");
				assert.equal(oVariant._getMap().reference, "base.id");
				assert.equal(oVariant._getMap().referenceVersion, "1.1");
			});
		});

		QUnit.test("createFromJson", function(assert) {
			return DescriptorVariantFactory.createFromJson({
				id: "id1",
				reference: "base.id1",
				fileName: "fileName1",
				namespace: "namespace1",
				layer: "layer1",
				fileType: "fileType1",
				content: []
			}).then(function(oVariant) {
				assert.equal(oVariant._getMap().id, "id1");
				assert.equal(oVariant._getMap().reference, "base.id1");
				assert.ok(!oVariant._getMap().referenceVersion);
				assert.equal(oVariant._getMap().fileName, "fileName1");
				assert.equal(oVariant._getMap().namespace, "namespace1");
				assert.equal(oVariant._getMap().layer, "layer1");
				assert.equal(oVariant._getMap().fileType, "fileType1");
				assert.deepEqual(oVariant._getMap().content, []);
				return DescriptorVariantFactory.createFromJson({
					id: "id2",
					reference: "base.id2",
					referenceVersion: "1.2",
					fileName: "fileName2",
					namespace: "namespace2",
					layer: "layer2",
					fileType: "fileType2",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				});
			}).then(function(oVariant) {
				assert.equal(oVariant._getMap().id, "id2");
				assert.equal(oVariant._getMap().reference, "base.id2");
				assert.equal(oVariant._getMap().referenceVersion, "1.2");
				assert.equal(oVariant._getMap().fileName, "fileName2");
				assert.equal(oVariant._getMap().namespace, "namespace2");
				assert.equal(oVariant._getMap().layer, "layer2");
				assert.equal(oVariant._getMap().fileType, "fileType2");
				assert.deepEqual(oVariant._getMap().content, [{
					changeType: "changeType2",
					content: {}
				}]);
			});
		});

		QUnit.test("createFromJson failure", function (assert) {
			assert.throws(function() {
				DescriptorVariantFactory.createFromJson();
			});
			assert.throws(function() {
				DescriptorVariantFactory.createFromJson("string");
			});
		});

		QUnit.test("createDescriptorInlineChange", function(assert) {
			return DescriptorInlineChangeFactory.createDescriptorInlineChange('appdescr_ovp_addNewCard', {
				card : {
					"customer.acard" : {
						model : "customer.boring_model",
						template : "sap.ovp.cards.list",
						settings : {
							category : "{{customer.newid_sap.app.ovp.cards.customer.acard.category}}",
							title : "{{customer.newid_sap.app.ovp.cards.customer.acard.title}}",
							description : "extended",
							entitySet : "Zme_Overdue",
							sortBy : "OverdueTime",
							sortOrder : "desc",
							listType : "extended"
						}
					}
				}
			}, {
				"customer.newid_sap.app.ovp.cards.customer.acard.category": {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Category example default text",
						en: "Category example text in en",
						de: "Kategorie Beispieltext in de",
						en_US: "Category example text in en_US"
					}
				},
				"customer.newid_sap.app.ovp.cards.customer.acard.title": {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Title example default text",
						en: "Title example text in en",
						de: "Titel Beispieltext in de",
						en_US: "Title example text in en_US"
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, 'appdescr_ovp_addNewCard');
				assert.notEqual(oDescriptorInlineChange.getMap().content, null);
				assert.notEqual(oDescriptorInlineChange.getMap().texts, null);
			});
		});

		QUnit.test("replaceHostingIdForTextKey - changeNewCard with text keys", function(assert) {
			var mParameters = {
				cardId: "ZDEMOOVP_card00",
				entityPropertyChange: {
					propertyPath: "customer.settings",
					operation: "UPSERT",
					propertyValue: {
						defaultSpan: {
							cols: 1,
							rows: 5
						},
						tabs: [{
							value: "{{ZDEMOOVP_RESIZE_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs.0.value}}",
							annotationPath: "com.sap.vocabularies.UI.v1.LineItem#ordOverView2"
						}, {
							value: "{{ZDEMOOVP_RESIZE_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs.1.value}}",
							annotationPath: "com.sap.vocabularies.UI.v1.LineItem#ordOverView2"
						}]
					}
				}
			};

			var mTexts = {
				"ZDEMOOVP_RESIZE_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs.0.value": {
					type: "XTIT",
					maxLength: 40,
					value: {
						"": "First View (Extended bar list deleted after save as)"
					}
				},
				"ZDEMOOVP_RESIZE_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs.1.value": {
					type: "XTIT",
					maxLength: 40,
					value: {
						"": "Second View"
					}
				}
			};

			return DescriptorInlineChangeFactory.create_ovp_changeCard(mParameters, mTexts)
				.then(function(oInlineChange) {
					oInlineChange.replaceHostingIdForTextKey("customer.ZDEMOOVP_RESIZE.id_1559043616388_1827", "ZDEMOOVP_RESIZE", oInlineChange.getContent(), oInlineChange.getTexts());
					Object.keys(oInlineChange.getTexts()).forEach(function(sTextKey, index) {
						assert.strictEqual(sTextKey, "customer.ZDEMOOVP_RESIZE.id_1559043616388_1827_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs." + index + ".value", "then the text keys are properly set and are correct");
					});
					var aProperties = oInlineChange.getContent().entityPropertyChange.propertyValue.tabs;
					aProperties.forEach(function(oProperty, index) {
						assert.strictEqual(oProperty.value, "{{customer.ZDEMOOVP_RESIZE.id_1559043616388_1827_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs." + index + ".value}}", "then the property values are correctly set");
					});
				});
		});

		QUnit.test("replaceHostingIdForTextKey - changeNewCard without text keys", function(assert) {
			var mParameters = {
				cardId: "ZDEMOOVP_card00",
				entityPropertyChange: {
					propertyPath: "customer.settings",
					operation: "UPSERT",
					propertyValue: {
						defaultSpan: {
							cols: 1,
							rows: 5
						},
						tabs: [{
							value: "ZDEMOOVP_RESIZE_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs.0.value",
							annotationPath: "com.sap.vocabularies.UI.v1.LineItem#ordOverView2"
						}, {
							value: "ZDEMOOVP_RESIZE_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs.1.value",
							annotationPath: "com.sap.vocabularies.UI.v1.LineItem#ordOverView2"
						}]
					}
				}
			};

			var mTexts = {
				"ZDEMOOVP_RESIZE_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs.0.value": {
					type: "XTIT",
					maxLength: 40,
					value: {
						"": "First View (Extended bar list deleted after save as)"
					}
				},
				"ZDEMOOVP_RESIZE_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs.1.value": {
					type: "XTIT",
					maxLength: 40,
					value: {
						"": "Second View"
					}
				}
			};

			return DescriptorInlineChangeFactory.create_ovp_changeCard(mParameters, mTexts)
				.then(function(oInlineChange) {
					oInlineChange.replaceHostingIdForTextKey("customer.ZDEMOOVP_RESIZE.id_1559043616388_1827", "ZDEMOOVP_RESIZE", oInlineChange.getContent(), oInlineChange.getTexts());
					Object.keys(oInlineChange.getTexts()).forEach(function(sTextKey, index) {
						assert.strictEqual(sTextKey, "customer.ZDEMOOVP_RESIZE.id_1559043616388_1827_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs." + index + ".value", "then the text keys are properly set and are correct");
					});
					var aProperties = oInlineChange.getContent().entityPropertyChange.propertyValue.tabs;
					aProperties.forEach(function(oProperty, index) {
						assert.strictEqual(oProperty.value, "ZDEMOOVP_RESIZE_sap.ovp.cards.ZDEMOOVP_card00.customer.settings.tabs." + index + ".value", "then the property values are correctly set");
					});
				});
		});

		QUnit.test("replaceHostingIdForTextKey - addTitle", function(assert) {
			var mParameters = {
				type: "XTIT",
				maxLength: 50,
				comment: "New title entered by a key user via RTA tool",
				value: {
					"": "E2E Test OVP Variant"
				}
			};

			return DescriptorInlineChangeFactory.create_app_setTitle(mParameters)
				.then(function(oInlineChange) {
					if (oInlineChange["setHostingIdForTextKey"]) {
						oInlineChange["setHostingIdForTextKey"]("ZDEMOOVP_RESIZE");
					}
					oInlineChange.replaceHostingIdForTextKey("customer.ZDEMOOVP_RESIZE.id_1559043616388_1827", "ZDEMOOVP_RESIZE", oInlineChange.getContent(), oInlineChange.getTexts());
					Object.keys(oInlineChange.getTexts()).forEach(function(sTextKey) {
						assert.strictEqual(sTextKey, "customer.ZDEMOOVP_RESIZE.id_1559043616388_1827_sap.app.title", "then the text keys are properly replaced and are correct");
					});
				});
		});

		QUnit.test("create_ovp_addNewCard", function(assert) {
			return DescriptorInlineChangeFactory.create_ovp_addNewCard({
				card : {
					"customer.acard" : {
						model : "customer.boring_model",
						template : "sap.ovp.cards.list",
						settings : {
							category : "{{cardId_category}}",
							title : "{{cardId_title}}",
							description : "extended",
							entitySet : "Zme_Overdue",
							sortBy : "OverdueTime",
							sortOrder : "desc",
							listType : "extended"
						}
					}
				}
			}, {
				cardId_category: {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Category example default text",
						en: "Category example text in en",
						de: "Kategorie Beispieltext in de",
						en_US: "Category example text in en_US"
					}
				},
				cardId_title: {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Title example default text",
						en: "Title example text in en",
						de: "Titel Beispieltext in de",
						en_US: "Title example text in en_US"
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.notEqual(oDescriptorInlineChange.getMap().texts, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ovp_addNewCard");
			});
		});

		QUnit.test("create_ovp_addNewCard failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ovp_addNewCard({
					cardId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ovp_addNewCard({
					card : "a.id"
				});
			});
		});

		QUnit.test("create_ovp_removeCard", function(assert) {
			return DescriptorInlineChangeFactory.create_ovp_removeCard({
				cardId : "a.id"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ovp_removeCard");
			});
		});

		QUnit.test("create_ovp_removeCard failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ovp_removeCard({
					cards : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ovp_removeCard({
					cardId : {}
				});
			});
		});

		//Test change card with valid input and multiple changes
		QUnit.test("create_ovp_changeCard multiple changes", function (assert) {
			return DescriptorInlineChangeFactory.create_ovp_changeCard({
				cardId: "sap.existingCard01",
				entityPropertyChange: [
					{
						propertyPath: "/settings/title",
						operation: "UPDATE",
						propertyValue: "New Updated Title"
					},
					{
						propertyPath: "/settings/addODataSelect",
						operation: "UPDATE",
						propertyValue: true
					},
					{
						propertyPath: "/settings/subTitle",
						operation: "INSERT",
						propertyValue: "New Added Subtitle"
					}
				]
			}).then(function (oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ovp_changeCard");
			});
		});

		//Test change card with invalid parameters
		QUnit.test("create_ovp_changeCard failure", function (assert) {
			assert.throws(function () {
				DescriptorInlineChangeFactory.create_ovp_changeCard({
					cards: "sap.existingCard01"
				});
			});
			assert.throws(function () {
				DescriptorInlineChangeFactory.create_ovp_changeCard({
					cardId: undefined
				});
			});
			assert.throws(function () {
				DescriptorInlineChangeFactory.create_ovp_changeCard({
					cardId: {}
				});
			});
		});

		QUnit.test("create_app_addNewInbound", function(assert) {
			return DescriptorInlineChangeFactory.create_app_addNewInbound({
				inbound: {
					"customer.contactCreate": {
						semanticObject: "Contact",
						action: "create",
						icon: "sap-icon://add-contact",
						title: "{{contactCreate_title}}",
						subTitle: "{{contactCreate_subtitle}}"
					}
				}
			}, {
				contactCreate_title: {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Category example default text",
						en: "Category example text in en",
						de: "Kategorie Beispieltext in de",
						en_US: "Category example text in en_US"
					}
				},
				contactCreate_subtitle: {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Title example default text",
						en: "Title example text in en",
						de: "Titel Beispieltext in de",
						en_US: "Title example text in en_US"
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.notEqual(oDescriptorInlineChange.getMap().texts, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addNewInbound");
			});
		});

		QUnit.test("create_app_addNewInbound failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addNewInbound({
					inboundId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addNewInbound({
					inbound : "a.id"
				});
			});
		});

		QUnit.test("create_app_removeInbound", function(assert) {
			return DescriptorInlineChangeFactory.create_app_removeInbound({
				inboundId : "a.id"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeInbound");
			});
		});

		QUnit.test("create_app_removeInbound failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeInbound({
					inbounds : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeInbound({
					inboundId : {}
				});
			});
		});

		QUnit.test("create_app_removeAllInboundsExceptOne", function(assert) {
			return DescriptorInlineChangeFactory.create_app_removeAllInboundsExceptOne({
				inboundId : "a.id"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeAllInboundsExceptOne");
			});
		});

		QUnit.test("create_app_removeAllInboundsExceptOne failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeAllInboundsExceptOne({
					inbounds : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeAllInboundsExceptOne({
					inboundId : {}
				});
			});
		});

		QUnit.test("create_app_changeInbound multiple changes", function(assert) {
			return DescriptorInlineChangeFactory.create_app_changeInbound({
				inboundId: "a.id",
				entityPropertyChange: [{
					propertyPath: "signature/parameters/id/required",
					operation: "UPSERT",
					propertyValue: true
				},
				{
					propertyPath: "icon",
					operation: "UPSERT",
					propertyValue: "sap-icon://contact"
				}]
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeInbound");
			});
		});

		QUnit.test("create_app_changeInbound", function(assert) {
			return DescriptorInlineChangeFactory.create_app_changeInbound({
				inboundId: "a.id",
				entityPropertyChange: {
					propertyPath: "signature/parameters/id/required",
					operation: "UPSERT",
					propertyValue: false
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeInbound");
			});
		});

		QUnit.test("create_app_changeInbound", function(assert) {
			return DescriptorInlineChangeFactory.create_app_changeInbound({
				inboundId: "a.id",
				entityPropertyChange: {
					propertyPath: "title",
					operation: "UPSERT",
					propertyValue: "{{newtitle}}"
				}
			}, {
				newtitle: {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Title example default text",
						en: "Title example text in en",
						de: "Titel Beispieltext in de",
						en_US: "Title example text in en_US"
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.notEqual(oDescriptorInlineChange.getMap().texts, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeInbound");
			});
		});

		QUnit.test("create_app_changeInbound failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_changeInbound({
					inbounds : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_changeInbound({
					inboundId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_changeInbound({
					inboundId : "a.id"
				});
			});
		});

		QUnit.test("create_app_addNewOutbound", function(assert) {
			return DescriptorInlineChangeFactory.create_app_addNewOutbound({
				outbound: {
					"customer.addressDisplay": {
						semanticObject: "Address",
						action: "display",
						parameters: {
							companyName: {}
						}
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addNewOutbound");
			});
		});

		QUnit.test("create_app_addNewOutbound failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addNewOutbound({
					outboundId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addNewOutbound({
					outbound : "a.id"
				});
			});
		});

		QUnit.test("create_app_removeOutbound", function(assert) {
			return DescriptorInlineChangeFactory.create_app_removeOutbound({
				outboundId : "a.id"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeOutbound");
			});
		});

		QUnit.test("create_app_removeOutbound failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeOutbound({
					outbounds : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeOutbound({
					outboundId : {}
				});
			});
		});

		QUnit.test("create_app_changeOutbound multiple changes", function(assert) {
			return DescriptorInlineChangeFactory.create_app_changeOutbound({
				outboundId: "a.id",
				entityPropertyChange: [{
					propertyPath : "action",
					operation : "UPDATE",
					propertyValue : "newAction"
				},
				{
					propertyPath : "parameters/newAddedParameter",
					operation : "INSERT",
					propertyValue : {
						value : {
							value : "someValue",
							format : "plain"
						}
					}
				},
				{
					propertyPath : "parameters/Language",
					operation : "DELETE"
				}]
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeOutbound");
			});
		});

		QUnit.test("create_app_changeOutbound", function(assert) {
			return DescriptorInlineChangeFactory.create_app_changeOutbound({
				outboundId: "a.id",
				entityPropertyChange: {
					propertyPath : "action",
					operation : "UPDATE",
					propertyValue : "newAction"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeOutbound");
			});
		});

		QUnit.test("create_app_changeOutbound failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_changeOutbound({
					outbounds : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_changeOutbound({
					outboundId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_changeOutbound({
					outboundId : "a.id"
				});
			});
		});

		QUnit.test("create_app_addNewDataSource", function(assert) {
			return DescriptorInlineChangeFactory.create_app_addNewDataSource({
				dataSource: {}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addNewDataSource");
			});
		});

		QUnit.test("create_app_addNewDataSource failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addNewDataSource({
					dataSourceId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addNewDataSource({
					dataSource : "a.id"
				});
			});
		});

		QUnit.test("create_app_removeDataSource", function(assert) {
			return DescriptorInlineChangeFactory.create_app_removeDataSource({
				dataSourceId : "a.id"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeDataSource");
			});
		});

		QUnit.test("create_app_removeDataSource failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeDataSource({
					dataSources : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeDataSource({
					dataSourceId : {}
				});
			});
		});

		QUnit.test("create_app_changeDataSource", function(assert) {
			return DescriptorInlineChangeFactory.create_app_changeDataSource({
				dataSourceId: "a.id",
				entityPropertyChange: {
					propertyPath: "uri",
					operation: "UPDATE",
					propertyValue: "abc"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeDataSource");
			});
		});

		QUnit.test("create_app_changeDataSource multiple changes", function(assert) {
			return DescriptorInlineChangeFactory.create_app_changeDataSource({
				dataSourceId: "a.id",
				entityPropertyChange: [{
					propertyPath: "uri",
					operation: "UPDATE",
					propertyValue: "abc"
				},
				{
					propertyPath: "settings/maxAge",
					operation: "UPSERT",
					propertyValue: 3600
				}]
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeDataSource");
			});
		});

		QUnit.test("create_app_changeDataSource failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_changeDataSource({
					dataSources : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_changeDataSource({
					dataSourceId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_changeDataSource({
					dataSourceId : "a.id"
				});
			});
		});

		QUnit.test("create_appdescr_app_addAnnotationsToOData", function(assert) {
			return DescriptorInlineChangeFactory.create_app_addAnnotationsToOData({
				dataSourceId: "customer.existingDataSource",
				annotations : ["customer.anno1"],
				dataSource : { }
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addAnnotationsToOData");
			});
		});

		QUnit.test("create_appdescr_app_addAnnotationsToOData failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addAnnotationsToOData({
					dataSourceId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addAnnotationsToOData({
					dataSourceId : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addAnnotationsToOData({
					dataSourceId: "customer.existingDataSource",
					dataSource : { }
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addAnnotationsToOData({
					dataSourceId: "customer.existingDataSource",
					annotations : { },
					dataSource : { }
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addAnnotationsToOData({
					dataSourceId: "customer.existingDataSource",
					annotations : ["customer.anno1"],
					dataSource : ""
				});
			});
		});

		QUnit.test("getId", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				assert.strictEqual(oDescriptorVariant.getId(), "a.id");
			});
		});

		QUnit.test("setId", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				assert.strictEqual(oDescriptorVariant.getReference(), "a.reference");
				oDescriptorVariant.setReference("new.reference");
				assert.strictEqual(oDescriptorVariant.getReference(), "new.reference");
			});
		});

		QUnit.test("setReference failure", function (assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				assert.throws(function() {
					oDescriptorVariant.setReference({
						ref : "a.id"
					});
				});
			});
		});

		QUnit.test("getReference", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				assert.strictEqual(oDescriptorVariant.getReference(), "a.reference");
			});
		});

		QUnit.test("getVersion", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference",
				version: "1.0.0"
			}).then(function(oDescriptorVariant) {
				assert.strictEqual(oDescriptorVariant.getVersion(), "1.0.0");
			});
		});

		QUnit.test("getSettings", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				assert.equal(oDescriptorVariant.getSettings().isAtoAvailable(), false);
				assert.equal(oDescriptorVariant.getSettings().isAtoEnabled(), false);
				assert.equal(oDescriptorVariant.getSettings().isKeyUser(), false);
				assert.equal(oDescriptorVariant.getSettings().isProductiveSystem(), false);
			});
		});

		QUnit.test("getNamespace", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				assert.strictEqual(oDescriptorVariant.getNamespace(), "apps/a.reference/appVariants/a.id/");
			});
		});

		QUnit.test("create_app_setTitle", function(assert) {
			var _oDescriptorInlineChange;
			var _oDescriptorVariant;
			var mParameter = {
				type : "XTIT",
				maxLength : 20,
				comment : "a comment",
				value : {
					"" : "Default Title",
					en:"English Title",
					de:"Deutscher Titel",
					en_US:"English Title in en_US"
				}
			};
			return DescriptorInlineChangeFactory.create_app_setTitle(mParameter).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setTitle");
				return DescriptorVariantFactory.createNew({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oDescriptorVariant) {
				_oDescriptorVariant = oDescriptorVariant;
				return oDescriptorVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oDescriptorVariant._content[0].texts['a.id_sap.app.title'], 'Initial empty text key replaced');
				assert.ok(!_oDescriptorVariant._content[0].texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oDescriptorVariant._content[0].texts['a.id_sap.app.title'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_app_setTitle descriptor change", function(assert) {
			var _oDescriptorInlineChange;
			var mParameter = {
				type : "XTIT",
				maxLength : 20,
				comment : "a comment",
				value : {
					"" : "Default Title",
					en:"English Title",
					de:"Deutscher Titel",
					en_US:"English Title in en_US"
				}
			};
			return DescriptorInlineChangeFactory.create_app_setTitle(mParameter).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setTitle");
				return new DescriptorChangeFactory().createNew("a.reference", _oDescriptorInlineChange);
			}).then(function(_oDescriptorChange) {
				_oDescriptorChange._getChangeToSubmit();
				assert.ok(_oDescriptorChange._mChangeFile.texts['a.reference_sap.app.title'], 'Initial empty text key replaced');
				assert.ok(!_oDescriptorChange._mChangeFile.texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oDescriptorChange._mChangeFile.texts['a.reference_sap.app.title'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_app_setSubTitle", function(assert) {
			var _oDescriptorInlineChange;
			var _oDescriptorVariant;
			var mParameter = {
				type : "XTIT",
				maxLength : 30,
				comment : "comment on subtitle",
				value : {
					"" : "Default Subtitle",
					en:"English Subtitle",
					de:"Deutscher Untertitel",
					en_US:"English Subtitle in en_US"
				}
			};
			return DescriptorInlineChangeFactory.create_app_setSubTitle(mParameter).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setSubTitle");
				return DescriptorVariantFactory.createNew({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oDescriptorVariant) {
				_oDescriptorVariant = oDescriptorVariant;
				return oDescriptorVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oDescriptorVariant._content[0].texts['a.id_sap.app.subTitle'], 'Initial empty text key replaced');
				assert.ok(!_oDescriptorVariant._content[0].texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oDescriptorVariant._content[0].texts['a.id_sap.app.subTitle'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_ui5_addLibraries", function(assert) {
			var _oDescriptorInlineChange;
			var _oDescriptorVariant;
			var mParameter = {
				libraries: {
					"descriptor.mocha133": {
						minVersion: "1.44",
						lazy: false
					}
				}
			};
			return DescriptorInlineChangeFactory.create_ui5_addLibraries(mParameter).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_addLibraries");
				return DescriptorVariantFactory.createNew({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oDescriptorVariant) {
				_oDescriptorVariant = oDescriptorVariant;
				return oDescriptorVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oDescriptorVariant._content[0].content.libraries['descriptor.mocha133'], 'Library is added');
				assert.deepEqual(_oDescriptorVariant._content[0].content, mParameter, 'Added library properties are equal to parameters set in factory method');
			});
		});

		QUnit.test("create_ui5_addLibraries failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui5_addLibraries({
					libraries : "a.id"
				});
			});
		});

		QUnit.test("create_app_setShortTitle", function(assert) {
			var _oDescriptorInlineChange;
			var _oDescriptorVariant;
			var mParameter = {
				type : "XTIT",
				maxLength : 30,
				comment : "comment on shorttitle",
				value : {
					"" : "Default Shorttitle",
					en:"English Shorttitle",
					de:"Deutscher Kurztitel",
					en_US:"English Shorttitle in en_US"
				}
			};
			return DescriptorInlineChangeFactory.create_app_setShortTitle(mParameter).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setShortTitle");
				return DescriptorVariantFactory.createNew({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oDescriptorVariant) {
				_oDescriptorVariant = oDescriptorVariant;
				return oDescriptorVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oDescriptorVariant._content[0].texts['a.id_sap.app.shortTitle'], 'Initial empty text key replaced');
				assert.ok(!_oDescriptorVariant._content[0].texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oDescriptorVariant._content[0].texts['a.id_sap.app.shortTitle'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_app_setDescription", function(assert) {
			var _oDescriptorInlineChange;
			var _oDescriptorVariant;
			var mParameter = {
				type : "XTXT",
				maxLength : 50,
				comment : "comment on description",
				value : {
					"" : "Default Description",
					en:"English Description",
					de:"Deutsche Beschreibung",
					en_US:"English Description in en_US"
				}
			};
			return DescriptorInlineChangeFactory.create_app_setDescription(mParameter).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setDescription");
				return DescriptorVariantFactory.createNew({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oDescriptorVariant) {
				_oDescriptorVariant = oDescriptorVariant;
				return oDescriptorVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oDescriptorVariant._content[0].texts['a.id_sap.app.description'], 'Initial empty text key replaced');
				assert.ok(!_oDescriptorVariant._content[0].texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oDescriptorVariant._content[0].texts['a.id_sap.app.description'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_app_setInfo", function(assert) {
			var _oDescriptorInlineChange;
			var _oDescriptorVariant;
			var mParameter = {
				maxLength : 70,
				comment : "comment on info",
				value : {
					"" : "Default Info",
					en:"English Info",
					de:"Deutsche Info",
					en_US:"English Info in en_US"
				}
			};
			return DescriptorInlineChangeFactory.create_app_setInfo(mParameter).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setInfo");
				return DescriptorVariantFactory.createNew({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oDescriptorVariant) {
				_oDescriptorVariant = oDescriptorVariant;
				return oDescriptorVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oDescriptorVariant._content[0].texts['a.id_sap.app.info'], 'Initial empty text key replaced');
				assert.ok(!_oDescriptorVariant._content[0].texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oDescriptorVariant._content[0].texts['a.id_sap.app.info'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_app_setAch", function(assert) {
			return DescriptorInlineChangeFactory.create_app_setAch({
				ach: "CA-ZZ-TEST"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setAch");
			});
		});

		QUnit.test("create_app_Ach failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_setAch({
					AchH : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_setAch({
					Ach : "a.id"
				});
			});
		});

		QUnit.test("create_app_setKeywords", function(assert) {
			return DescriptorInlineChangeFactory.create_app_setKeywords({
				keywords: ["{{customer.newid_sap.app.tags.keywords.0}}", "{{customer.newid_sap.app.tags.keywords.1}}"]
			}, {
				"customer.newid_sap.app.tags.keywords.0" : {
					type: "XTIT",
					maxLength: 20,
					comment: "sample comment",
					value: {
						"": "Default Keyword 1",
						en: "English Keyword 1",
						de: "Deutsches Schlagwort 1",
						en_US: "English Keyword 1 in en_US"
					}
				},
				"customer.newid_sap.app.tags.keywords.1" : {
					type: "XTIT",
					maxLength: 20,
					comment: "sample comment",
					value: {
						"": "Default Keyword 2",
						en: "English Keyword 2",
						de: "Deutsches Schlagwort 2",
						en_US: "English Keyword 2 in en_US"
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.notEqual(oDescriptorInlineChange.getMap().texts, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setKeywords");
			});
		});

		QUnit.test("create_app_setKeywords failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_setKeywords({
					keywords : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_setKeywords({
					keywords : "a.id"
				});
			});
		});

		QUnit.test("create_app_setDestination", function(assert) {
			return DescriptorInlineChangeFactory.create_app_setDestination({
				destination: {
					name: "ERP"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setDestination");
			});
		});

		QUnit.test("create_app_setDestination failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_setDestination({
					destinations : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_setDestination({
					destination : "a.id"
				});
			});
		});

		QUnit.test("create_app_addTechnicalAttributes", function(assert) {
			return DescriptorInlineChangeFactory.create_app_addTechnicalAttributes({
				technicalAttributes: ["TAG1", "TAG2"]
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addTechnicalAttributes");
			});
		});

		QUnit.test("create_app_addTechnicalAttributes failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addTechnicalAttributes({
					technicalAttributes : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addTechnicalAttributes({
					technicalAttributes : "TAG1"
				});
			});
		});

		QUnit.test("create_app_removeTechnicalAttributes", function(assert) {
			return DescriptorInlineChangeFactory.create_app_removeTechnicalAttributes({
				technicalAttributes: ["TAG1"]
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeTechnicalAttributes");
			});
		});

		QUnit.test("create_app_removeTechnicalAttributes failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeTechnicalAttributes({
					technicalAttributes : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeTechnicalAttributes({
					technicalAttributes : "TAG1"
				});
			});
		});

		QUnit.test("create_app_addCdsViews", function(assert) {
			return DescriptorInlineChangeFactory.create_app_addCdsViews({
				cdsViews: ["VIEW1", "VIEW2"]
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addCdsViews");
			});
		});

		QUnit.test("create_app_addCdsViews failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addCdsViews({
					cdsViews : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_addCdsViews({
					cdsViews : "VIEW1"
				});
			});
		});

		QUnit.test("create_app_removeCdsViews", function(assert) {
			return DescriptorInlineChangeFactory.create_app_removeCdsViews({
				cdsViews: ["VIEW1"]
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeCdsViews");
			});
		});

		QUnit.test("create_app_removeCdsViews failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeCdsViews({
					cdsViews : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_app_removeCdsViews({
					cdsViews : "VIEW1"
				});
			});
		});

		QUnit.test("create_flp_setConfig", function(assert) {
			return DescriptorInlineChangeFactory.create_flp_setConfig({
				config : { property1 : "value1",
											property2 : "value2",
											propertyList : ["a", "b"]
										}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
			});
		});

		QUnit.test("create_flp_setConfig failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_flp_setConfig({
					configs : { }
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_flp_setConfig({
					config : "wrongType"
				});
			});
		});

		QUnit.test("appdescr_ui5_addNewModel", function(assert) {
			return DescriptorInlineChangeFactory.create_ui5_addNewModel({
				model : {
					"customer.fancy_model": {
						dataSource: "customer.fancy_dataSource",
						settings: {}
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_addNewModel");
			});
		});

		QUnit.test("appdescr_ui5_addNewModel failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui5_addNewModel({
					modelId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui5_addNewModel({
					model : "a.id"
				});
			});
		});


		QUnit.test("appdescr_ui5_removeModel", function(assert) {
			return DescriptorInlineChangeFactory.create_ui5_removeModel({
				modelId : "aModelId"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_removeModel");
			});
		});

		QUnit.test("appdescr_ui5_removeModel failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui5_removeModel({
					modelId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui5_removeModel({
					model : "a.id"
				});
			});
		});


		QUnit.test("appdescr_ui5_addNewModelEnhanceWith", function(assert) {
			return DescriptorInlineChangeFactory.create_ui5_addNewModelEnhanceWith({
				modelId : "customer.existingModelId"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_addNewModelEnhanceWith");
			});
		});

		QUnit.test("appdescr_ui5_addNewModelEnhanceWith failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui5_addNewModelEnhanceWith({
					modelId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui5_addNewModelEnhanceWith({
					model : "a.id"
				});
			});
		});

		QUnit.test("appdescr_ui5_replaceComponentUsage", function(assert) {
			return DescriptorInlineChangeFactory.create_ui5_replaceComponentUsage({
				componentUsageId: "usageAttachment",
				componentUsage: {
					name: "new.component",
					settings: {},
					componentData: {}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_replaceComponentUsage");
			});
		});

		QUnit.test("appdescr_ui5_replaceComponentUsage failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui5_replaceComponentUsage({
					componentUsageId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui5_replaceComponentUsage({
					componentUsage : "a.id"
				});
			});
		});

		QUnit.test("appdescr_ui5_setMinUI5Version", function(assert) {
			return DescriptorInlineChangeFactory.create_ui5_setMinUI5Version({
				minUI5Version : "1.63.0"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_setMinUI5Version");
			});
		});

		QUnit.test("appdescr_ui5_setMinUI5Version failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui5_setMinUI5Version({
					minUI5Version : {}
				});
			});
		});

		QUnit.test("appdescr_smb_addNamespace", function(assert) {
			return DescriptorInlineChangeFactory.create_smb_addNamespace({
				smartBusinessApp: {
					leadingModel: "leadingModelName",
					annotationFragments: {
						dataPoint: "PERP_FCLM_MP05_CASH_POS_SRV.ERP_FCLM_MP05_QCP01Result/@com.sap.vocabularies.UI.v1.DataPoint#_SFIN_CASHMGR_CASHPOSITION_VIEW1"
					},
					drilldown: {
						annotationFragments: {
							selectionFields: "PERP_FCLM_MP05_CASH_POS_SRV.ERP_FCLM_MP05_QCP01Result/@com.sap.vocabularies.UI.v1.SelectionFields#_SFIN_CASHMGR_CASHPOSITION_VIEW1"
						},
						mainCharts: [{
							annotationFragment: "«target»/@com.sap.vocabularies.UI.v1.SelectionPresentationVariant#«qualifier»"
						}],
						miniCharts: [{
							model: "UI5ModelName",
							annotationFragment: "«target»/@com.sap.vocabularies.UI.v1.SelectionPresentationVariant#«qualifier»"
						}]
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_smb_addNamespace");
			});
		});

		QUnit.test("appdescr_smb_addNamespace failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_smb_addNamespace({
					smartBusinessAppId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_smb_addNamespace({
					smartBusinessApp : "a.id"
				});
			});
		});

		QUnit.test("appdescr_smb_changeNamespace", function(assert) {
			return DescriptorInlineChangeFactory.create_smb_changeNamespace({
				smartBusinessApp: {
					tile: {
						tileConfiguration: "{\"TILE_PROPERTIES\":\" {\\\"id\\\":\\\"\\\",\\\"instanceId\\\":\\\"\\\",\\\"evaluationId\\\":\\\"\\\"," +
						"\\\"navType\\\":\\\"0\\\",\\\"cacheMaxAge\\\":1,\\\"cacheMaxAgeUnit\\\":\\\"MIN\\\",\\\"tileSpecific\\\":{}}\"}"
					},
					annotationFragments : {
						selectionVariant : "<entityTypeQualifiedName>/@com.sap.vocabularies.UI.v1.SelectionVariant#<qualifier>",
						dataPoint : "<entityTypeQualifiedName>/@com.sap.vocabularies.UI.v1.DataPoint#<qualifier>",
						selectionField : "<entityTypeQualifiedName>/@com.sap.vocabularies.UI.v1.SelectionFields#<qualifier>"
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_smb_changeNamespace");
			});
		});

		QUnit.test("appdescr_smb_changeNamespace failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_smb_changeNamespace({
					smartBusinessAppId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_smb_changeNamespace({
					smartBusinessApp : "a.id"
				});
			});
		});

		QUnit.test("appdescr_ui_generic_app_setMainPage", function(assert) {
			return DescriptorInlineChangeFactory.create_ui_generic_app_setMainPage({
				page : {
					page_1: {
						entitySet: "STTA_C_MP_Product",
						component: {
							name: "sap.suite.ui.generic.template.ListReport",
							settings: {}
						}
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui_generic_app_setMainPage");
			});
		});

		QUnit.test("appdescr_ui_generic_app_setMainPage failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui_generic_app_setMainPage({
					pageId : {}
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui_generic_app_setMainPage({
					page : "a.id"
				});
			});
		});

		QUnit.test("create_ui_setIcon", function(assert) {
			return DescriptorInlineChangeFactory.create_ui_setIcon({
				icon : "sap-icon://add-contact"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
			});
		});

		QUnit.test("create_ui_setIcon failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui_setIcon({
					iconId : "a.string"
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui_setIcon({
					icon : { }
				});
			});
		});

		QUnit.test("create_ui_setDeviceTypes", function(assert) {
			return DescriptorInlineChangeFactory.create_ui_setDeviceTypes({
				deviceTypes : { desktop : true, tablet : true, phone : true }
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
			});
		});

		QUnit.test("create_ui_setDeviceTypes failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui_setDeviceTypes({
					types : { desktop : true, tablet : true, phone : true }
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_ui_setDeviceTypes({
					deviceTypes : "desktop"
				});
			});
		});

		QUnit.test("create_url_setUri", function(assert) {
			return DescriptorInlineChangeFactory.create_url_setUri({
				uri : "uri.com"
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
			});
		});

		QUnit.test("create_url_setUri failure", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_url_setUri({
					uri : { }
				});
			});
		});

		QUnit.test("create_fiori_setRegistrationIds", function(assert) {
			return DescriptorInlineChangeFactory.create_fiori_setRegistrationIds({
				registrationIds : ["F01234"]
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
			});
		});

		QUnit.test("create_fiori_setRegistrationIds", function (assert) {
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_fiori_setRegistrationIds({
					registrationIds : 1.0
				});
			});
			assert.throws(function() {
				DescriptorInlineChangeFactory.create_fiori_setRegistrationIds({
					registrationIds : { }
				});
			});
		});
	});


	QUnit.module("DescriptorVariant", {
		beforeEach: function() {
			this._oSandbox = sinon.sandbox.create();
			this._oSandbox.stub(LrepConnector.prototype, "send").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference"
				})
			});
			this._oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
		},
		afterEach: function() {
			this._oSandbox.restore();
			delete this._oSandbox;
		}
	}, function() {
		QUnit.test("addDescriptorInlineChange", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
					return oDescriptorVariant.addDescriptorInlineChange(oDescriptorInlineChange).then(function() {
						assert.notEqual(oDescriptorVariant._content, null);
						assert.equal(oDescriptorVariant._content.length, 1);
						assert.equal(oDescriptorVariant._content[0].changeType, "changeType");
						assert.deepEqual(oDescriptorVariant._content[0].content, {param:"value"});
						assert.deepEqual(oDescriptorVariant._content[0].texts, {a: "b"});
					});
				});
			});
		});

		QUnit.test("setTransportRequest", function(assert) {
			var oDescriptorVariant_;
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				oDescriptorVariant_ = oDescriptorVariant;
				return oDescriptorVariant.setTransportRequest("TR12345");
			}).then(function() {
				assert.equal(oDescriptorVariant_._sTransportRequest, "TR12345");
			});
		});

		QUnit.test("setTransportRequest - wrong format - error expected", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				return oDescriptorVariant.setTransportRequest("Wrong Format");
			}).then(
				function() {
					assert.ok(false, "success function not supposed to be called");
				},
				function(oError) {
					assert.notEqual(oError, null);
				}
			);
		});

		QUnit.test("setPackage", function(assert) {
			var oDescriptorVariant_;
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				assert.equal(oDescriptorVariant._getMap().packageName, "");//check the default
				oDescriptorVariant_ = oDescriptorVariant;
				return oDescriptorVariant.setPackage("/ABC/DEFGH_IJKL12345");
			}).then(function() {
				assert.equal(oDescriptorVariant_._getMap().packageName, "/ABC/DEFGH_IJKL12345");
			});
		});

		QUnit.test("setPackage - wrong format - error expected", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				assert.equal(oDescriptorVariant._getMap().packageName, "");//check the default
				return oDescriptorVariant.setPackage("SomePackage_WrongFormat");
			}).then(
				function() {
					assert.ok(false, "success function not supposed to be called");
				},
				function(oError) {
					assert.notEqual(oError, null);
				}
			);
		});

		QUnit.test("submit", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				return oDescriptorVariant.submit().then(function(oResponse) {
					assert.notEqual(oResponse, null);
				});
			});
		});
	});

	QUnit.module("DescriptorVariantFactory", {
		beforeEach: function() {
			this._oSandbox = sinon.sandbox.create();
			this._oSandbox.stub(LrepConnector.prototype, "send").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference"
				})
			});
			this._oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
		},
		afterEach: function() {
			this._oSandbox.restore();
			delete this._oSandbox;
		}
	}, function() {
		QUnit.test("createNew", function(assert) {
			// assert.strictEqual(typeof FlexControllerFactory.create, 'function');
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
						//no layer -> default to customer expected
			}).then(function(oDescriptorVariant) {
				assert.notEqual(oDescriptorVariant, null);
				assert.equal(oDescriptorVariant._id, "a.id");
				assert.equal(oDescriptorVariant._reference, "a.reference");
				assert.equal(oDescriptorVariant._mode, "NEW");
				assert.equal(oDescriptorVariant._layer, "CUSTOMER");
				assert.equal(oDescriptorVariant._getMap().fileType, "appdescr_variant");
			});
		});

		QUnit.test("createNew failure", function(assert) {
			assert.throws(function() {
				DescriptorVariantFactory.createNew({
				});
			});
			assert.throws(function() {
				DescriptorVariantFactory.createNew({
					id : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorVariantFactory.createNew({
					reference: "a.reference"
				});
			});
			assert.throws(function() {
				DescriptorVariantFactory.createNew({
					id : 1,
					reference: "a.reference"
				});
			});
			assert.throws(function() {
				DescriptorVariantFactory.createNew({
					id : "a.id",
					reference: 1
				});
			});
			assert.throws(function() {
				DescriptorVariantFactory.createNew({
					id : "a.id",
					reference : "a.reference",
					version : 2 //wrong type, string expected
				});
			});
			assert.throws(function() {
				DescriptorVariantFactory.createNew({
					id : "a.id",
					reference : "a.reference",
					layer : true //wrong type, string expected
				});
			});
		});

		QUnit.test("createNew - layer - set to CUSTOMER", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference",
				layer: "CUSTOMER"
			}).then(function(oDescriptorVariant) {
				assert.equal(oDescriptorVariant._getMap().layer, 'CUSTOMER');
			});
		});

		QUnit.test("createNew - layer - set to CUSTOMER_BASE", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference",
				layer: "CUSTOMER_BASE"
			}).then(function(oDescriptorVariant) {
				assert.equal(oDescriptorVariant._getMap().layer, 'CUSTOMER_BASE');
			});
		});

		QUnit.test("createNew - layer - set to PARTNER", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference",
				layer: "PARTNER"
			}).then(function(oDescriptorVariant) {
				assert.equal(oDescriptorVariant._getMap().layer, 'PARTNER');
			});
		});

		QUnit.test("createNew - layer - set to VENDOR", function(assert) {
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference",
				layer: "VENDOR"
			}).then(function(oDescriptorVariant) {
				assert.equal(oDescriptorVariant._getMap().layer, 'VENDOR');
			});
		});

		QUnit.test("createForExisting", function(assert) {
			return DescriptorVariantFactory.createForExisting("a.id"
					).then(function(oDescriptorVariant) {
						assert.notEqual(oDescriptorVariant, null);
						assert.equal(oDescriptorVariant._mMap.id, "a.id");
						assert.equal(oDescriptorVariant._mMap.reference, "a.reference");
						assert.equal(oDescriptorVariant._mode, "FROM_EXISTING");
					});
		});

		QUnit.test("createForExisting failure", function(assert) {
			assert.throws(function() {
				DescriptorVariantFactory.createForExisting();
			});
			assert.throws(function() {
				DescriptorVariantFactory.createForExisting({
				});
			});
		});

		QUnit.test("createDeletion", function(assert) {
			return DescriptorVariantFactory.createDeletion(
						"a.id"
					).then(function(oDescriptorVariant) {
						assert.notEqual(oDescriptorVariant, null);
						assert.equal(oDescriptorVariant._id, "a.id");
						assert.equal(oDescriptorVariant._mode, "DELETION");
					});
		});

		QUnit.test("createDeletion failure", function(assert) {
			assert.throws(function() {
				DescriptorVariantFactory.createDeletion({
				});
			});
			assert.throws(function() {
				DescriptorVariantFactory.createDeletion({
					reference : "a.id"
				});
			});
			assert.throws(function() {
				DescriptorVariantFactory.createDeletion({
					id : 1
				});
			});
		});
	});

	QUnit.module("DescriptorChange", {
		beforeEach: function() {
			this.sCreateResponse = JSON.stringify({
				reference: "a.reference"
			});
			this._oSandbox = sinon.sandbox.create();
			// required since we store changes via changepersistence --> CompatibilityConnector
			this._oSandbox.stub(CompatibilityConnector, "create").resolves(this.sCreateResponse);
			this._oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
		},
		afterEach: function() {
			this._oSandbox.restore();
			delete this._oSandbox;
		}
	}, function() {
		QUnit.test("setPackage - default", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange);
			}).then(function(oDescriptorChange) {
				assert.equal(oDescriptorChange._getChangeToSubmit().getPackage(), "$TMP");
			});
		});

		QUnit.test("setPackage", function(assert) {
			var _oDescriptorChange;
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange);
			}).then(function(oDescriptorChange) {
				_oDescriptorChange = oDescriptorChange;
				return oDescriptorChange.setPackage('/ABC/DEF_GHIJ_123445');
			}).then(function() {
				assert.equal(_oDescriptorChange._getChangeToSubmit().getPackage(), "/ABC/DEF_GHIJ_123445");
			});
		});

		QUnit.test("setPackage", function(assert) {
			var _oDescriptorChange;
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange);
			}).then(function(oDescriptorChange) {
				_oDescriptorChange = oDescriptorChange;
				return oDescriptorChange.setPackage('/ABC/DEF_GHIJ_123445');
			}).then(function() {
				assert.equal(_oDescriptorChange._getChangeToSubmit().getPackage(), "/ABC/DEF_GHIJ_123445");
			});
		});

		QUnit.test("setPackage - wrong format - error expected", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange);
			}).then(function(oDescriptorChange) {
				return oDescriptorChange.setPackage('Wrong Format');
			}).then(
				function() {
					assert.ok(false, "error expected, success function not supposed to be called");
				},
				function(oError) {
					assert.notEqual(oError, null);
				}
			);
		});

		QUnit.test("setTransportRequest", function(assert) {
			var _oDescriptorChange;
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange);
			}).then(function(oDescriptorChange) {
				_oDescriptorChange = oDescriptorChange;
				return oDescriptorChange.setTransportRequest("XYZ12345");
			}).then(function() {
				assert.equal(_oDescriptorChange._getChangeToSubmit().getRequest(), "XYZ12345");
			});
		});

		QUnit.test("setTransportRequest - wrong format - error expected", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange);
			}).then(function(oDescriptorChange) {
				return oDescriptorChange.setTransportRequest("Wrong Format");
			}).then(function() {
				assert.ok(false, "error expected, success function not supposed to be called");
			},
				function(oError) {
					assert.notEqual(oError, null);
				});
		});

		QUnit.test("submit", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"})
			.then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange);
			}).then(function(oDescriptorChange) {
				return oDescriptorChange.submit();
			}).then(function(oResponse) {
				assert.equal(oResponse, this.sCreateResponse);
			}.bind(this));
		});

		QUnit.test("createNew - w/o layer, check default", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				new DescriptorChangeFactory().createNew(
						"a.reference",
						oDescriptorInlineChange
						//no sLayer -> default is 'CUSTOMER'
						).then(function(oDescriptorChange) {
							assert.equal(oDescriptorChange._mChangeFile.layer, 'CUSTOMER');
						});
			});
		});

		QUnit.test("createNew - with layer VENDOR", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				new DescriptorChangeFactory().createNew(
						"a.reference",
						oDescriptorInlineChange,
						'VENDOR'
						).then(function(oDescriptorChange) {
							assert.equal(oDescriptorChange._mChangeFile.layer, 'VENDOR');
						});
			});
		});

		QUnit.test("createNew - with layer CUSTOMER", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				new DescriptorChangeFactory().createNew(
						"a.reference",
						oDescriptorInlineChange,
						'CUSTOMER'
						).then(function(oDescriptorChange) {
							assert.equal(oDescriptorChange._mChangeFile.layer, 'CUSTOMER');
						});
			});
		});

		QUnit.test("createNew - with layer CUSTOMER_BASE", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				new DescriptorChangeFactory().createNew(
						"a.reference",
						oDescriptorInlineChange,
						'CUSTOMER_BASE'
						).then(function(oDescriptorChange) {
							assert.equal(oDescriptorChange._mChangeFile.layer, 'CUSTOMER_BASE');
						});
			});
		});

		QUnit.test("createNew - with layer PARTNER", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				new DescriptorChangeFactory().createNew(
						"a.reference",
						oDescriptorInlineChange,
						'PARTNER'
						).then(function(oDescriptorChange) {
							assert.equal(oDescriptorChange._mChangeFile.layer, 'PARTNER');
						});
			});
		});

		QUnit.test("getJson", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				new DescriptorChangeFactory().createNew(
						"a.reference",
						oDescriptorInlineChange,
						'CUSTOMER'
						).then(function(oDescriptorChange) {
							var mExpectedPartJson = {
								reference: "a.reference",
								fileType:	"change",
								layer: "CUSTOMER",
								namespace: "apps/a.reference/changes/",
								packageName: "$TMP",
								changeType: "changeType",
								content: {
									param:"value"
								},
								texts: {a: "b"}
							};
							var mJsonResult = oDescriptorChange.getJson();
							assert.ok(mJsonResult);
							assert.equal(mJsonResult.reference, mExpectedPartJson.reference);
							assert.equal(mJsonResult.fileType, mExpectedPartJson.fileType);
							assert.equal(mJsonResult.layer, mExpectedPartJson.layer);
							assert.equal(mJsonResult.namespace, mExpectedPartJson.namespace);
							assert.equal(mJsonResult.packageName, mExpectedPartJson.packageName);
							assert.equal(mJsonResult.changeType, mExpectedPartJson.changeType);
							assert.deepEqual(mJsonResult.content, mExpectedPartJson.content);
							assert.deepEqual(mJsonResult.texts, mExpectedPartJson.texts);
						});
			});
		});
	});

	QUnit.module("DescriptorChangeFactory", {
		beforeEach: function() {
			this._oSandbox = sinon.sandbox.create();
			this._oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
		},
		afterEach: function() {
			this._oSandbox.restore();
			delete this._oSandbox;
		}
	}, function() {
		QUnit.test("createNew", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange).then(function(oDescriptorChange) {
					assert.notEqual(oDescriptorChange, null);
					assert.equal(oDescriptorChange._mChangeFile.reference, "a.reference");
					assert.equal(oDescriptorChange._mChangeFile.changeType, "changeType");
					assert.equal(oDescriptorChange._mChangeFile.layer, "CUSTOMER");
					assert.equal(oDescriptorChange._oInlineChange, oDescriptorInlineChange);
				});
			});
		});

		QUnit.test("createNew - with tool", function(assert) {
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange, 'VENDOR', undefined, 'RTA');
			}).then(function(oDescriptorChange) {
				assert.equal(oDescriptorChange._mChangeFile.layer, "VENDOR");
				assert.equal(oDescriptorChange._mChangeFile.support.generator, 'RTA');
			});
		});
	});

	QUnit.module("DescriptorVariantFactory - ATO false", {
		beforeEach: function() {
			this._oSandbox = sinon.sandbox.create();
			this._fStubSend = this._oSandbox.stub(LrepConnector.prototype, "send").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER"
				})
			});
			this._oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
		},
		afterEach: function() {
			this._oSandbox.restore();
			delete this._oSandbox;
		}
	}, function() {
		QUnit.test("new - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oDescriptorVariant) {
				return oDescriptorVariant.submit().then(function(oResponse) {
					assert.notEqual(oResponse, null);
					assert.equal(that._fStubSend.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/");
				});
			});
		});

		QUnit.test("new with referenceVersion - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference",
				referenceVersion: "1.1"
			}).then(function(oDescriptorVariant) {
				return oDescriptorVariant.submit().then(function(oResponse) {
					assert.notEqual(oResponse, null);
					assert.equal(that._fStubSend.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/");
					assert.equal(that._fStubSend.getCall(0).args[2].referenceVersion, "1.1");
				});
			});
		});

		QUnit.test("for existing - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createForExisting("a.id"
					).then(function(oDescriptorVariant) {
						return oDescriptorVariant.submit().then(function(oResponse) {
							assert.notEqual(oResponse, null);
							assert.equal(that._fStubSend.getCall(0).args[0], "/sap/bc/lrep/appdescr_variants/a.id");
						});
					});
		});

		QUnit.test("delete - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createDeletion(
						"a.id"
					).then(function(oDescriptorVariant) {
						return oDescriptorVariant.submit().then(function(oResponse) {
							assert.notEqual(oResponse, null);
							assert.equal(that._fStubSend.getCall(0).args[0], '/sap/bc/lrep/appdescr_variants/a.id');
						});
					});
		});
	});

	QUnit.module("DescriptorVariantFactory - ATO true and app variant not yet published", {
		beforeEach: function() {
			this._oSandbox = sinon.sandbox.create();
			this._fStubSend = this._oSandbox.stub(LrepConnector.prototype, "send");
			this._fStubSend.resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER",
					packageName: '$TMP'
				})
			});
			this._oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
		},
		afterEach: function() {
			this._oSandbox.restore();
			delete this._oSandbox;
		}
	}, function() {
		QUnit.test("new - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference",
				layer: "CUSTOMER"
			}).then(function(oDescriptorVariant) {
				return oDescriptorVariant.submit();
			}).then(function(oResponse) {
				assert.notEqual(oResponse, null);
				assert.equal(that._fStubSend.getCall(0).args[0], '/sap/bc/lrep/appdescr_variants/');
			});
		});

		QUnit.test("Smart Business: new - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference",
				layer: "CUSTOMER",
				skipIam: true
			}).then(function(oDescriptorVariant) {
				return oDescriptorVariant.submit();
			}).then(function(oResponse) {
				assert.notEqual(oResponse, null);
				assert.equal(that._fStubSend.getCall(0).args[0], '/sap/bc/lrep/appdescr_variants/?changelist=ATO_NOTIFICATION&skipIam=true');
			});
		});

		QUnit.test("for existing - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createForExisting("a.id")
				.then(function(oDescriptorVariant) {
					return oDescriptorVariant.submit();
				}).then(function(oResponse) {
					assert.notEqual(oResponse, null);
					assert.equal(that._fStubSend.getCall(1).args[0], '/sap/bc/lrep/appdescr_variants/a.id');
				});
		});

		QUnit.test("delete - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createDeletion("a.id")
				.then(function(oDescriptorVariant) {
					return oDescriptorVariant.submit();
				}).then(function(oResponse) {
					assert.notEqual(oResponse, null);
					assert.equal(that._fStubSend.getCall(1).args[0], '/sap/bc/lrep/appdescr_variants/a.id');
				});
		});
	});

	QUnit.module("DescriptorVariantFactory - ATO true and app variant already published", {
		beforeEach: function() {
			this._oSandbox = sinon.sandbox.create();
			this._fStubSend = this._oSandbox.stub(LrepConnector.prototype, "send");
			this._fStubSend.resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference",
					layer: "CUSTOMER",
					packageName: "YY1_DEFAULT_123"
				})
			});
			this._oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
		},
		afterEach: function() {
			this._oSandbox.restore();
			delete this._oSandbox;
		}
	}, function() {
		QUnit.test("new - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference",
				layer: "CUSTOMER"
			}).then(function(oDescriptorVariant) {
				return oDescriptorVariant.submit();
			}).then(function(oResponse) {
				assert.notEqual(oResponse, null);
				assert.equal(that._fStubSend.getCall(0).args[0], '/sap/bc/lrep/appdescr_variants/');
			});
		});

		QUnit.test("Smart Business: new - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createNew({
				id : "a.id",
				reference: "a.reference",
				layer: "CUSTOMER",
				skipIam: true
			}).then(function(oDescriptorVariant) {
				return oDescriptorVariant.submit();
			}).then(function(oResponse) {
				assert.notEqual(oResponse, null);
				assert.equal(that._fStubSend.getCall(0).args[0], '/sap/bc/lrep/appdescr_variants/?changelist=ATO_NOTIFICATION&skipIam=true');
			});
		});

		QUnit.test("Smart Business: for existing - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createForExisting("a.id")
				.then(function(oDescriptorVariant) {
					return oDescriptorVariant.submit();
				}).then(function(oResponse) {
					assert.notEqual(oResponse, null);
					assert.equal(that._fStubSend.getCall(1).args[0], '/sap/bc/lrep/appdescr_variants/a.id?changelist=ATO_NOTIFICATION');
				});
		});

		QUnit.test("Smart Business: delete - submit", function(assert) {
			var that = this;
			return DescriptorVariantFactory.createDeletion("a.id")
				.then(function(oDescriptorVariant) {
					return oDescriptorVariant.submit();
				}).then(function(oResponse) {
					assert.notEqual(oResponse, null);
					assert.equal(that._fStubSend.getCall(1).args[0], '/sap/bc/lrep/appdescr_variants/a.id?changelist=ATO_NOTIFICATION');
				});
		});
	});

	QUnit.module("DescriptorChangeFactory - ATO false", {
		beforeEach: function() {
			this._oSandbox = sinon.sandbox.create();
			this._oSandbox.stub(LrepConnector.prototype, "send").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference"
				})
			});
			this._oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
		},
		afterEach: function() {
			this._oSandbox.restore();
			delete this._oSandbox;
		}
	}, function() {
		QUnit.test("create new", function(assert) {
			var _oDescriptorChange;
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange);
			}).then(function(oDescriptorChange) {
				_oDescriptorChange = oDescriptorChange;
				assert.equal(_oDescriptorChange._getChangeToSubmit().getRequest(), '');
			});
		});
	});

	QUnit.module("DescriptorChangeFactory - ATO true", {
		beforeEach: function() {
			this._oSandbox = sinon.sandbox.create();
			this._fStubSend = this._oSandbox.stub(LrepConnector.prototype, "send").resolves({
				response: JSON.stringify({
					id : "a.id",
					reference: "a.reference"
				})
			});
			this._oSandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
		},
		afterEach: function() {
			this._oSandbox.restore();
			delete this._oSandbox;
		}
	}, function() {
		QUnit.test("create new - CUSTOMER layer", function(assert) {
			var _oDescriptorChange;
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange);
			}).then(function(oDescriptorChange) {
				_oDescriptorChange = oDescriptorChange;
				assert.equal(_oDescriptorChange._mChangeFile.layer, 'CUSTOMER');
				assert.equal(_oDescriptorChange._getChangeToSubmit().getRequest(), 'ATO_NOTIFICATION');
			});
		});

		QUnit.test("create new - CUSTOMER_BASE layer", function(assert) {
			var _oDescriptorChange;
			return DescriptorInlineChangeFactory.createNew("changeType", {param:"value"}, {a: "b"}).then(function(oDescriptorInlineChange) {
				return new DescriptorChangeFactory().createNew("a.reference", oDescriptorInlineChange, 'CUSTOMER_BASE');
			}).then(function(oDescriptorChange) {
				_oDescriptorChange = oDescriptorChange;
				assert.equal(_oDescriptorChange._mChangeFile.layer, 'CUSTOMER_BASE');
				assert.equal(_oDescriptorChange._getChangeToSubmit().getRequest(), 'ATO_NOTIFICATION');
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});