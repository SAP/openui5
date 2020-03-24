/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/write/_internal/appVariant/AppVariantFactory",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	AppVariantInlineChangeFactory,
	AppVariantFactory,
	Settings,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a AppVariantInlineChangeFactory for S4/Hana onPremise systems", {
		beforeEach : function() {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:false,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
		},
		afterEach : function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("create_app_setTitle", function(assert) {
			var _oDescriptorInlineChange;
			var _oVariant;
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
			return AppVariantInlineChangeFactory.create_app_setTitle({
				changeType: "appdescr_app_setTitle",
				texts: {
					"": mParameter
				},
				content: mParameter
			}).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setTitle");
				return AppVariantFactory.prepareCreate({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oVariant) {
				_oVariant = oVariant;
				return oVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oVariant.getDefinition().content[0].texts['a.id_sap.app.title'], 'Initial empty text key replaced');
				assert.ok(!_oVariant.getDefinition().content[0].texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oVariant.getDefinition().content[0].texts['a.id_sap.app.title'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_app_setSubTitle", function(assert) {
			var _oDescriptorInlineChange;
			var _oVariant;
			var mParameter = {
				type : "XTIT",
				maxLength : 30,
				comment : "comment on subtitle",
				value : {
					"": "Default Subtitle",
					en: "English Subtitle",
					de: "Deutscher Untertitel",
					en_US: "English Subtitle in en_US"
				}
			};
			return AppVariantInlineChangeFactory.create_app_setSubTitle({
				changeType: "appdescr_app_setSubTitle",
				texts: {
					"": mParameter
				},
				content: mParameter
			}).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setSubTitle");
				return AppVariantFactory.prepareCreate({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oVariant) {
				_oVariant = oVariant;
				return oVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oVariant.getDefinition().content[0].texts['a.id_sap.app.subTitle'], 'Initial empty text key replaced');
				assert.ok(!_oVariant.getDefinition().content[0].texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oVariant.getDefinition().content[0].texts['a.id_sap.app.subTitle'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_ui5_addLibraries", function(assert) {
			var _oDescriptorInlineChange;
			var _oVariant;
			var mParameter = {
				libraries: {
					"descriptor.mocha133": {
						minVersion: "1.44",
						lazy: false
					}
				}
			};
			return AppVariantInlineChangeFactory.create_ui5_addLibraries({
				changeType: "appdescr_ui5_addLibraries",
				content: mParameter
			}).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_addLibraries");
				return AppVariantFactory.prepareCreate({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oVariant) {
				_oVariant = oVariant;
				return oVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oVariant.getDefinition().content[0].content.libraries['descriptor.mocha133'], 'Library is added');
				assert.deepEqual(_oVariant.getDefinition().content[0].content, mParameter, 'Added library properties are equal to parameters set in factory method');
			});
		});

		QUnit.test("create_ui5_addLibraries failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui5_addLibraries({
					content: {
						libraries : "a.id"
					}
				});
			});
		});

		QUnit.test("create_app_setShortTitle", function(assert) {
			var _oDescriptorInlineChange;
			var _oVariant;
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
			return AppVariantInlineChangeFactory.create_app_setShortTitle({
				changeType: "appdescr_app_setShortTitle",
				texts: {
					"": mParameter
				},
				content: mParameter
			}).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setShortTitle");
				return AppVariantFactory.prepareCreate({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oVariant) {
				_oVariant = oVariant;
				return oVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oVariant.getDefinition().content[0].texts['a.id_sap.app.shortTitle'], 'Initial empty text key replaced');
				assert.ok(!_oVariant.getDefinition().content[0].texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oVariant.getDefinition().content[0].texts['a.id_sap.app.shortTitle'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_app_setDescription", function(assert) {
			var _oDescriptorInlineChange;
			var _oVariant;
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
			return AppVariantInlineChangeFactory.create_app_setDescription({
				changeType: "appdescr_app_setDescription",
				texts: {
					"": mParameter
				},
				content: mParameter
			}).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setDescription");
				return AppVariantFactory.prepareCreate({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oVariant) {
				_oVariant = oVariant;
				return oVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oVariant.getDefinition().content[0].texts['a.id_sap.app.description'], 'Initial empty text key replaced');
				assert.ok(!_oVariant.getDefinition().content[0].texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oVariant.getDefinition().content[0].texts['a.id_sap.app.description'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_app_setInfo", function(assert) {
			var _oDescriptorInlineChange;
			var _oVariant;
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
			return AppVariantInlineChangeFactory.create_app_setInfo({
				changeType: "appdescr_app_setInfo",
				texts: {
					"": mParameter
				},
				content: mParameter
			}).then(function(oDescriptorInlineChange) {
				assert.ok(oDescriptorInlineChange, "Descriptor Inline Change created");
				_oDescriptorInlineChange = oDescriptorInlineChange;
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setInfo");
				return AppVariantFactory.prepareCreate({
					id : "a.id",
					reference: "a.reference"
				});
			}).then(function(oVariant) {
				_oVariant = oVariant;
				return oVariant.addDescriptorInlineChange(_oDescriptorInlineChange);
			}).then(function() {
				assert.ok(_oVariant.getDefinition().content[0].texts['a.id_sap.app.info'], 'Initial empty text key replaced');
				assert.ok(!_oVariant.getDefinition().content[0].texts[''], 'Initial empty text key removed ');
				assert.deepEqual(_oVariant.getDefinition().content[0].texts['a.id_sap.app.info'], mParameter, 'Text in "texts"-node equals parameters set in factory method');
			});
		});

		QUnit.test("create_app_setAch", function(assert) {
			return AppVariantInlineChangeFactory.create_app_setAch({
				changeType: "appdescr_app_setAch",
				content: {
					ach: "CA-ZZ-TEST"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setAch");
			});
		});

		QUnit.test("create_app_Ach failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_setAch({
					content: {
						AchH : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_setAch({
					content: {
						Ach : "a.id"
					}
				});
			});
		});

		QUnit.test("addDescriptorInlineChange", function(assert) {
			var _oVariant;
			return AppVariantFactory.prepareCreate({
				id : "a.id",
				reference: "a.reference"
			}).then(function(oVariant) {
				_oVariant = oVariant;
				return AppVariantInlineChangeFactory.createNew({
					changeType: "changeType",
					content: {
						param: "value"
					},
					texts: {
						a: "b"
					}
				});
			}).then(function(oDescriptorInlineChange) {
				return _oVariant.addDescriptorInlineChange(oDescriptorInlineChange);
			}).then(function() {
				assert.notEqual(_oVariant.getDefinition().content, null);
				assert.equal(_oVariant.getDefinition().content.length, 1);
				assert.equal(_oVariant.getDefinition().content[0].changeType, "changeType");
				assert.deepEqual(_oVariant.getDefinition().content[0].content, {param:"value"});
				assert.deepEqual(_oVariant.getDefinition().content[0].texts, {a: "b"});
			});
		});

		QUnit.test("create_app_setKeywords", function(assert) {
			return AppVariantInlineChangeFactory.create_app_setKeywords({
				changeType: "appdescr_app_setKeywords",
				content: {
					keywords: ["{{customer.newid_sap.app.tags.keywords.0}}", "{{customer.newid_sap.app.tags.keywords.1}}"]
				},
				texts: {
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
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.notEqual(oDescriptorInlineChange.getMap().texts, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setKeywords");
			});
		});

		QUnit.test("create_app_setKeywords failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_setKeywords({
					content: {
						keywords : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_setKeywords({
					content: {
						keywords : "a.id"
					}
				});
			});
		});

		QUnit.test("createDescriptorInlineChange", function(assert) {
			return AppVariantInlineChangeFactory.createDescriptorInlineChange({
				changeType: 'appdescr_ovp_addNewCard',
				content: {
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
				},
				texts: {
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

			return AppVariantInlineChangeFactory.create_ovp_changeCard({
				changeType: "appdescr_ovp_changeCard",
				content: mParameters,
				texts: mTexts
			}).then(function(oInlineChange) {
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

			return AppVariantInlineChangeFactory.create_ovp_changeCard({
				changeType: "appdescr_ovp_changeCard",
				content: mParameters,
				texts: mTexts
			}).then(function(oInlineChange) {
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

			return AppVariantInlineChangeFactory.create_app_setTitle({
				changeType: "appdescr_app_setTitle",
				texts: {
					"": mParameters
				},
				content: mParameters
			}).then(function(oInlineChange) {
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
			return AppVariantInlineChangeFactory.create_ovp_addNewCard({
				changeType: "appdescr_ovp_addNewCard",
				content: {
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
				},
				texts: {
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
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.notEqual(oDescriptorInlineChange.getMap().texts, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ovp_addNewCard");
			});
		});

		QUnit.test("create_ovp_addNewCard failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ovp_addNewCard({
					content: {
						cardId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ovp_addNewCard({
					content: {
						cardId : "a.id"
					}
				});
			});
		});

		QUnit.test("create_ovp_removeCard", function(assert) {
			return AppVariantInlineChangeFactory.create_ovp_removeCard({
				changeType: "appdescr_ovp_removeCard",
				content: {
					cardId : "a.id"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ovp_removeCard");
			});
		});

		QUnit.test("create_ovp_removeCard failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ovp_removeCard({
					content: {
						cards : "a.id"
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ovp_removeCard({
					content: {
						cardId : {}
					}
				});
			});
		});

		//Test change card with valid input and multiple changes
		QUnit.test("create_ovp_changeCard multiple changes", function (assert) {
			return AppVariantInlineChangeFactory.create_ovp_changeCard({
				changeType: "appdescr_ovp_changeCard",
				content: {
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
				}
			}).then(function (oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ovp_changeCard");
			});
		});

		//Test change card with invalid parameters
		QUnit.test("create_ovp_changeCard failure", function (assert) {
			assert.throws(function () {
				AppVariantInlineChangeFactory.create_ovp_changeCard({
					content: {
						cards: "sap.existingCard01"
					}
				});
			});
			assert.throws(function () {
				AppVariantInlineChangeFactory.create_ovp_changeCard({
					content: {
						cardId: undefined
					}
				});
			});
			assert.throws(function () {
				AppVariantInlineChangeFactory.create_ovp_changeCard({
					content: {
						cardId: {}
					}
				});
			});
		});

		QUnit.test("create_app_addNewInbound", function(assert) {
			return AppVariantInlineChangeFactory.create_app_addNewInbound({
				changeType: "appdescr_app_addNewInbound",
				content: {
					inbound: {
						"customer.contactCreate": {
							semanticObject: "Contact",
							action: "create",
							icon: "sap-icon://add-contact",
							title: "{{contactCreate_title}}",
							subTitle: "{{contactCreate_subtitle}}"
						}
					}
				},
				texts: {
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
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.notEqual(oDescriptorInlineChange.getMap().texts, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addNewInbound");
			});
		});

		QUnit.test("create_app_addNewInbound failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addNewInbound({
					content: {
						inboundId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addNewInbound({
					content: {
						inbound : "a.id"
					}
				});
			});
		});

		QUnit.test("create_app_removeInbound", function(assert) {
			return AppVariantInlineChangeFactory.create_app_removeInbound({
				changeType: "appdescr_app_removeInbound",
				content: {
					inboundId : "a.id"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeInbound");
			});
		});

		QUnit.test("create_app_removeInbound failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeInbound({
					content: {
						inbounds : "a.id"
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeInbound({
					content: {
						inboundId : {}
					}
				});
			});
		});

		QUnit.test("create_app_removeAllInboundsExceptOne", function(assert) {
			return AppVariantInlineChangeFactory.create_app_removeAllInboundsExceptOne({
				changeType: "appdescr_app_removeAllInboundsExceptOne",
				content: {
					inboundId : "a.id"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeAllInboundsExceptOne");
			});
		});

		QUnit.test("create_app_removeAllInboundsExceptOne failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeAllInboundsExceptOne({
					content: {
						inbounds : "a.id"
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeAllInboundsExceptOne({
					content: {
						inboundId : {}
					}
				});
			});
		});

		QUnit.test("create_app_changeInbound multiple changes", function(assert) {
			return AppVariantInlineChangeFactory.create_app_changeInbound({
				changeType: "appdescr_app_changeInbound",
				content: {
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
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeInbound");
			});
		});

		QUnit.test("create_app_changeInbound", function(assert) {
			return AppVariantInlineChangeFactory.create_app_changeInbound({
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "a.id",
					entityPropertyChange: {
						propertyPath: "signature/parameters/id/required",
						operation: "UPSERT",
						propertyValue: false
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeInbound");
			});
		});

		QUnit.test("create_app_changeInbound", function(assert) {
			return AppVariantInlineChangeFactory.create_app_changeInbound({
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "a.id",
					entityPropertyChange: {
						propertyPath: "title",
						operation: "UPSERT",
						propertyValue: "{{newtitle}}"
					}
				},
				texts: {
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
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.notEqual(oDescriptorInlineChange.getMap().texts, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeInbound");
			});
		});

		QUnit.test("create_app_changeInbound failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_changeInbound({
					content: {
						inbounds : "a.id"
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_changeInbound({
					content: {
						inboundId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_changeInbound({
					content: {
						inboundId : "a.id"
					}
				});
			});
		});

		QUnit.test("create_app_addNewOutbound", function(assert) {
			return AppVariantInlineChangeFactory.create_app_addNewOutbound({
				changeType: "appdescr_app_addNewOutbound",
				content: {
					outbound: {
						"customer.addressDisplay": {
							semanticObject: "Address",
							action: "display",
							parameters: {
								companyName: {}
							}
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
				AppVariantInlineChangeFactory.create_app_addNewOutbound({
					content: {
						outboundId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addNewOutbound({
					content: {
						outbound : "a.id"
					}
				});
			});
		});

		QUnit.test("create_app_removeOutbound", function(assert) {
			return AppVariantInlineChangeFactory.create_app_removeOutbound({
				changeType: "appdescr_app_removeOutbound",
				content: {
					outboundId : "a.id"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeOutbound");
			});
		});

		QUnit.test("create_app_removeOutbound failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeOutbound({
					content: {
						outbounds : "a.id"
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeOutbound({
					content: {
						outboundId : {}
					}
				});
			});
		});

		QUnit.test("create_app_changeOutbound multiple changes", function(assert) {
			return AppVariantInlineChangeFactory.create_app_changeOutbound({
				changeType: "appdescr_app_changeOutbound",
				content: {
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
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeOutbound");
			});
		});

		QUnit.test("create_app_changeOutbound", function(assert) {
			return AppVariantInlineChangeFactory.create_app_changeOutbound({
				changeType: "appdescr_app_changeOutbound",
				content: {
					outboundId: "a.id",
					entityPropertyChange: {
						propertyPath : "action",
						operation : "UPDATE",
						propertyValue : "newAction"
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeOutbound");
			});
		});

		QUnit.test("create_app_changeOutbound failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_changeOutbound({
					content: {
						outbounds : "a.id"
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_changeOutbound({
					content: {
						outboundId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_changeOutbound({
					content: {
						outboundId : "a.id"
					}
				});
			});
		});

		QUnit.test("create_app_addNewDataSource", function(assert) {
			return AppVariantInlineChangeFactory.create_app_addNewDataSource({
				changeType: "appdescr_app_addNewDataSource",
				content: {
					dataSource: {}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addNewDataSource");
			});
		});

		QUnit.test("create_app_addNewDataSource failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addNewDataSource({
					content: {
						dataSourceId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addNewDataSource({
					content: {
						dataSource : "a.id"
					}
				});
			});
		});

		QUnit.test("create_app_removeDataSource", function(assert) {
			return AppVariantInlineChangeFactory.create_app_removeDataSource({
				changeType: "appdescr_app_removeDataSource",
				content: {
					dataSourceId : "a.id"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeDataSource");
			});
		});

		QUnit.test("create_app_removeDataSource failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeDataSource({
					content: {
						dataSources : "a.id"
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeDataSource({
					content: {
						dataSourceId : {}
					}
				});
			});
		});

		QUnit.test("create_app_changeDataSource", function(assert) {
			return AppVariantInlineChangeFactory.create_app_changeDataSource({
				changeType: "appdescr_app_changeDataSource",
				content: {
					dataSourceId: "a.id",
					entityPropertyChange: {
						propertyPath: "uri",
						operation: "UPDATE",
						propertyValue: "abc"
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeDataSource");
			});
		});

		QUnit.test("create_app_changeDataSource multiple changes", function(assert) {
			return AppVariantInlineChangeFactory.create_app_changeDataSource({
				changeType: "appdescr_app_changeDataSource",
				content: {
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
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_changeDataSource");
			});
		});

		QUnit.test("create_app_changeDataSource failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_changeDataSource({
					content: {
						dataSources : "a.id"
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_changeDataSource({
					content: {
						dataSourceId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_changeDataSource({
					content: {
						dataSourceId : "a.id"
					}
				});
			});
		});

		QUnit.test("create_appdescr_app_addAnnotationsToOData", function(assert) {
			return AppVariantInlineChangeFactory.create_app_addAnnotationsToOData({
				changeType: "appdescr_app_addAnnotationsToOData",
				content: {
					dataSourceId: "customer.existingDataSource",
					annotations : ["customer.anno1"],
					dataSource : { }
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addAnnotationsToOData");
			});
		});

		QUnit.test("create_appdescr_app_addAnnotationsToOData failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addAnnotationsToOData({
					content: {
						dataSourceId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addAnnotationsToOData({
					content: {
						dataSourceId : "a.id"
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addAnnotationsToOData({
					content: {
						dataSourceId: "customer.existingDataSource",
						dataSource : { }
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addAnnotationsToOData({
					content: {
						dataSourceId: "customer.existingDataSource",
						annotations : { },
						dataSource : { }
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addAnnotationsToOData({
					content: {
						dataSourceId: "customer.existingDataSource",
						annotations : ["customer.anno1"],
						dataSource : ""
					}
				});
			});
		});

		QUnit.test("create_app_setDestination", function(assert) {
			return AppVariantInlineChangeFactory.create_app_setDestination({
				changeType: "appdescr_app_setDestination",
				content: {
					destination: {
						name: "ERP"
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_setDestination");
			});
		});

		QUnit.test("create_app_setDestination failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_setDestination({
					content: {
						destinations : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_setDestination({
					content: {
						destination : "a.id"
					}
				});
			});
		});

		QUnit.test("create_app_addTechnicalAttributes", function(assert) {
			return AppVariantInlineChangeFactory.create_app_addTechnicalAttributes({
				changeType: "appdescr_app_addTechnicalAttributes",
				content: {
					technicalAttributes: ["TAG1", "TAG2"]
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addTechnicalAttributes");
			});
		});

		QUnit.test("create_app_addTechnicalAttributes failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addTechnicalAttributes({
					content: {
						technicalAttributes : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addTechnicalAttributes({
					content: {
						technicalAttributes : "TAG1"
					}
				});
			});
		});

		QUnit.test("create_app_removeTechnicalAttributes", function(assert) {
			return AppVariantInlineChangeFactory.create_app_removeTechnicalAttributes({
				changeType: "appdescr_app_removeTechnicalAttributes",
				content: {
					technicalAttributes: ["TAG1"]
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeTechnicalAttributes");
			});
		});

		QUnit.test("create_app_removeTechnicalAttributes failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeTechnicalAttributes({
					content: {
						technicalAttributes : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeTechnicalAttributes({
					content: {
						technicalAttributes : "TAG1"
					}
				});
			});
		});

		QUnit.test("create_app_addCdsViews", function(assert) {
			return AppVariantInlineChangeFactory.create_app_addCdsViews({
				changeType: "appdescr_app_addCdsViews",
				content: {
					cdsViews: ["VIEW1", "VIEW2"]
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_addCdsViews");
			});
		});

		QUnit.test("create_app_addCdsViews failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addCdsViews({
					content: {
						cdsViews : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_addCdsViews({
					content: {
						cdsViews : "VIEW1"
					}
				});
			});
		});

		QUnit.test("create_app_removeCdsViews", function(assert) {
			return AppVariantInlineChangeFactory.create_app_removeCdsViews({
				changeType: "appdescr_app_removeCdsViews",
				content: {
					cdsViews: ["VIEW1"]
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_app_removeCdsViews");
			});
		});

		QUnit.test("create_app_removeCdsViews failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeCdsViews({
					content: {
						cdsViews : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_app_removeCdsViews({
					content: {
						cdsViews : "VIEW1"
					}
				});
			});
		});

		QUnit.test("create_flp_setConfig", function(assert) {
			return AppVariantInlineChangeFactory.create_flp_setConfig({
				changeType: "appdescr_flp_setConfig",
				content: {
					config : {
						property1 : "value1",
						property2 : "value2",
						propertyList : ["a", "b"]
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
			});
		});

		QUnit.test("create_flp_setConfig failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_flp_setConfig({
					content: {
						configs : { }
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_flp_setConfig({
					content: {
						config : "wrongType"
					}
				});
			});
		});

		QUnit.test("appdescr_ui5_addNewModel", function(assert) {
			return AppVariantInlineChangeFactory.create_ui5_addNewModel({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					model : {
						"customer.fancy_model": {
							dataSource: "customer.fancy_dataSource",
							settings: {}
						}
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_addNewModel");
			});
		});

		QUnit.test("appdescr_ui5_addNewModel failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui5_addNewModel({
					content: {
						modelId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui5_addNewModel({
					content: {
						model : "a.id"
					}
				});
			});
		});


		QUnit.test("appdescr_ui5_removeModel", function(assert) {
			return AppVariantInlineChangeFactory.create_ui5_removeModel({
				changeType: "appdescr_ui5_removeModel",
				content: {
					modelId : "aModelId"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_removeModel");
			});
		});

		QUnit.test("appdescr_ui5_removeModel failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui5_removeModel({
					content: {
						modelId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui5_removeModel({
					content: {
						model : "a.id"
					}
				});
			});
		});


		QUnit.test("appdescr_ui5_addNewModelEnhanceWith", function(assert) {
			return AppVariantInlineChangeFactory.create_ui5_addNewModelEnhanceWith({
				changeType: "appdescr_ui5_addNewModelEnhanceWith",
				content: {
					modelId : "customer.existingModelId"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_addNewModelEnhanceWith");
			});
		});

		QUnit.test("appdescr_ui5_addNewModelEnhanceWith failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui5_addNewModelEnhanceWith({
					content: {
						modelId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui5_addNewModelEnhanceWith({
					content: {
						model : "a.id"
					}
				});
			});
		});

		QUnit.test("appdescr_ui5_replaceComponentUsage", function(assert) {
			return AppVariantInlineChangeFactory.create_ui5_replaceComponentUsage({
				changeType: "appdescr_ui5_replaceComponentUsage",
				content: {
					componentUsageId: "usageAttachment",
					componentUsage: {
						name: "new.component",
						settings: {},
						componentData: {}
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_replaceComponentUsage");
			});
		});

		QUnit.test("appdescr_ui5_replaceComponentUsage failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui5_replaceComponentUsage({
					content: {
						componentUsageId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui5_replaceComponentUsage({
					content: {
						componentUsage : "a.id"
					}
				});
			});
		});

		QUnit.test("appdescr_ui5_setMinUI5Version", function(assert) {
			return AppVariantInlineChangeFactory.create_ui5_setMinUI5Version({
				changeType: "appdescr_ui5_setMinUI5Version",
				content: {
					minUI5Version : "1.63.0"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_ui5_setMinUI5Version");
			});
		});

		QUnit.test("appdescr_ui5_setMinUI5Version failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui5_setMinUI5Version({
					content: {
						minUI5Version : {}
					}
				});
			});
		});

		QUnit.test("appdescr_smb_addNamespace", function(assert) {
			return AppVariantInlineChangeFactory.create_smb_addNamespace({
				changeType: "appdescr_smb_addNamespace",
				content: {
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
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_smb_addNamespace");
			});
		});

		QUnit.test("appdescr_smb_addNamespace failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_smb_addNamespace({
					content: {
						smartBusinessAppId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_smb_addNamespace({
					content: {
						smartBusinessApp : "a.id"
					}
				});
			});
		});

		QUnit.test("appdescr_smb_changeNamespace", function(assert) {
			return AppVariantInlineChangeFactory.create_smb_changeNamespace({
				changeType: "appdescr_smb_changeNamespace",
				content: {
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
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
				assert.equal(oDescriptorInlineChange.getMap().changeType, "appdescr_smb_changeNamespace");
			});
		});

		QUnit.test("appdescr_smb_changeNamespace failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_smb_changeNamespace({
					content: {
						smartBusinessAppId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_smb_changeNamespace({
					content: {
						smartBusinessApp : "a.id"
					}
				});
			});
		});

		QUnit.test("appdescr_ui_generic_app_setMainPage", function(assert) {
			return AppVariantInlineChangeFactory.create_ui_generic_app_setMainPage({
				changeType: "appdescr_ui_generic_app_setMainPage",
				content: {
					page : {
						page_1: {
							entitySet: "STTA_C_MP_Product",
							component: {
								name: "sap.suite.ui.generic.template.ListReport",
								settings: {}
							}
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
				AppVariantInlineChangeFactory.create_ui_generic_app_setMainPage({
					content: {
						pageId : {}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui_generic_app_setMainPage({
					content: {
						page : "a.id"
					}
				});
			});
		});

		QUnit.test("create_ui_setIcon", function(assert) {
			return AppVariantInlineChangeFactory.create_ui_setIcon({
				changeType: "appdescr_ui_setIcon",
				content: {
					icon : "sap-icon://add-contact"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
			});
		});

		QUnit.test("create_ui_setIcon failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui_setIcon({
					content: {
						iconId : "a.string"
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui_setIcon({
					content: {
						icon : { }
					}
				});
			});
		});

		QUnit.test("create_ui_setDeviceTypes", function(assert) {
			return AppVariantInlineChangeFactory.create_ui_setDeviceTypes({
				changeType: "appdescr_ui_setDeviceTypes",
				content: {
					deviceTypes : {
						desktop : true,
						tablet : true,
						phone : true
					}
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
			});
		});

		QUnit.test("create_ui_setDeviceTypes failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui_setDeviceTypes({
					content: {
						types : {
							desktop : true,
							tablet : true,
							phone : true
						}
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_ui_setDeviceTypes({
					content: {
						deviceTypes : "desktop"
					}
				});
			});
		});

		QUnit.test("create_url_setUri", function(assert) {
			return AppVariantInlineChangeFactory.create_url_setUri({
				changeType: "appdescr_url_setUri",
				content: {
					uri : "uri.com"
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
			});
		});

		QUnit.test("create_url_setUri failure", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_url_setUri({
					content: {
						uri : { }
					}
				});
			});
		});

		QUnit.test("create_fiori_setRegistrationIds", function(assert) {
			return AppVariantInlineChangeFactory.create_fiori_setRegistrationIds({
				changeType: "appdescr_fiori_setRegistrationIds",
				content: {
					registrationIds : ["F01234"]
				}
			}).then(function(oDescriptorInlineChange) {
				assert.notEqual(oDescriptorInlineChange, null);
			});
		});

		QUnit.test("create_fiori_setRegistrationIds", function (assert) {
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_fiori_setRegistrationIds({
					content: {
						registrationIds : 1.0
					}
				});
			});
			assert.throws(function() {
				AppVariantInlineChangeFactory.create_fiori_setRegistrationIds({
					content: {
						registrationIds : { }
					}
				});
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});