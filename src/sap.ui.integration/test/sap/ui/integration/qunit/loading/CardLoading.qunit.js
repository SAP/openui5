/* global QUnit, sinon */

sap.ui.define([
		"sap/ui/integration/widgets/Card",
		"sap/f/cards/RequestDataProvider",
		"sap/ui/core/Core",
		"sap/f/cards/loading/LoadingProvider",
		"sap/f/cards/BaseContent"
	],
	function (
		Card,
		RequestDataProvider,
		Core,
		LoadingProvider,
		BaseContent
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var oManifest_CardCase1 = {
			"sap.card": {
				"type": "List",
				"header": {
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
						}
					},
					"title": "Some title",
					"subTitle": "{some}",
					"icon": {
						"src": "{totalResults}"
					},
					"status": {
						"text": "{totalResults} of 200"
					}
				}
			}
		},
			oManifest_CardCase2 = {
			"sap.card": {
				"type": "List",
				"data": {
					"request": {
						"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
					}
				},
				"header": {
				   "data": {
					   "path": "/"
				   },
					"title": "Some title",
					"subTitle": "{some}",
					"icon": {
						"src": "{totalResults}"
					},
					"status": {
						"text": "{totalResults} of 200"
					}
				}
			}
		},
			oManifest_CardCase3_No_Loading = {
			"sap.card": {
				"type": "List",
				"data": {
					"request": {
						"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
					}
				},
				"header": {
					"data": {
						"json": {
							"some": "test"
						}
					},
					"title": "Some title",
					"subTitle": "{some}",
					"icon": {
						"src": "{some}"
					},
					"status": {
						"text": "{some} of 200"
					}
				}
			}
		},
			oManifest_NumericHeader_ContentLevel = {
				"sap.card": {
					"type": "List",
					"header": {
						"type": "Numeric",
						"data": {
							"request": {
								"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
							}
						},
						"title": "Project Cloud Transformation {n}",
						"subTitle": "Depending on {n}",
						"unitOfMeasurement": "{n}",
						"mainIndicator": {
							"number": "{n}",
							"unit": "{u}",
							"trend": "{trend}",
							"state": "{valueColor}"
						},
						"details": "{n}",
						"sideIndicators": [
							{
								"title": "{n}",
								"number": "{n}",
								"unit": "K"
							},
							{
								"title": "{n}",
								"number": "22.43",
								"unit": "%"
							}
						]
					}
				}
			},
			oManifest_NumericHeader_CardLevel = {
				"sap.card": {
					"type": "List",
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
						}
					},
					"header": {
						"type": "Numeric",
						"data": {
							"path": "/"
						},
						"title": "Project Cloud Transformation {n}",
						"subTitle": "Depending on {n}",
						"unitOfMeasurement": "{n}",
						"mainIndicator": {
							"number": "{n}",
							"unit": "{u}",
							"trend": "{trend}",
							"state": "{valueColor}"
						},
						"details": "{n}",
						"sideIndicators": [
							{
								"title": "{n}",
								"number": "{n}",
								"unit": "K"
							},
							{
								"title": "{n}",
								"number": "{n}",
								"unit": "%"
							}
						]
					}
				}
			},
			oManifest_NumericHeader_CardLevel_ContentJson = {
				"sap.card": {
					"type": "List",
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
						}
					},
					"header": {
						"type": "Numeric",
						 "data": {
							"json": {
								"n": "56",
								"u": "%",
								"trend": "Up",
								"valueColor": "Good"
							}
						},
						"title": "Project Cloud Transformation {n}",
						"subTitle": "Depending on {n}",
						"unitOfMeasurement": "{n}",
						"mainIndicator": {
							"number": "{n}",
							"unit": "{u}",
							"trend": "{trend}",
							"state": "{valueColor}"
						},
						"details": "{n}",
						"sideIndicators": [
							{
								"title": "{n}",
								"number": "{n}",
								"unit": "K"
							},
							{
								"title": "{n}",
								"number": "22.43",
								"unit": "%"
							}
						]
					}
				}
			},
			oManifest_List_CardLevel = {
			 "sap.app": {
				 "type": "card"
			 },
			 "sap.card": {
				 "data": {
					 "request": {
						 "url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
					 }
				 },
				 "type": "List",
				 "header": {
					 "title": "Title",
					 "subTitle": "Test Subtitle",
					 "icon": {
						 "src": "sap-icon://business-objects-experience"
					 },
					 "status": {
						 "text": {
							 "format": {
								 "translationKey": "i18n>CARD.COUNT_X_OF_Y",
								 "parts": [
									 "parameters>/visibleItems",
									 "/count"
								 ]
							 }
						 }
					 }
				 },
				 "content": {
					 "data": {
						 "path": "/items"
					 },
					 "maxItems": 2,
					 "item": {
						 "icon": {
							 "src": "{icon}"
						 },
						 "title": {
							 "value": "{title}"
						 },
						 "description": {
							 "value": "{description}"
						 },
						 "highlight": "{highlight}",
						 "info": {
							 "state": "{infoState}"
						 }
					 }
				 }
			 }
		 },
			oManifest_List_CardLevel_Error = {
				"sap.app": {
					"type": "card"
				},
				"sap.card": {
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/manifes.json"
						}
					},
					"type": "List",
					"header": {
						"title": "Title",
						"subTitle": "Test Subtitle",
						"icon": {
							"src": "sap-icon://business-objects-experience"
						},
						"status": {
							"text": {
								"format": {
									"translationKey": "i18n>CARD.COUNT_X_OF_Y",
									"parts": [
										"parameters>/visibleItems",
										"/count"
									]
								}
							}
						}
					},
					"content": {
						"data": {
							"path": "/items"
						},
						"maxItems": 2,
						"item": {
							"icon": {
								"src": "{icon}"
							},
							"title": {
								"value": "{title}"
							},
							"description": {
								"value": "{description}"
							},
							"highlight": "{highlight}",
							"info": {
								"state": "{infoState}"
							}
						}
					}
				}
			},
			oManifest_List_CardLevel_No_Loading = {
				"sap.app": {
					"type": "card"
				},
				"sap.card": {
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
						}
					},
					"type": "List",
					"header": {
						"title": "Title",
						"subTitle": "Test Subtitle",
						"icon": {
							"src": "sap-icon://business-objects-experience"
						},
						"status": {
							"text": {
								"format": {
									"translationKey": "i18n>CARD.COUNT_X_OF_Y",
									"parts": [
										"parameters>/visibleItems",
										"/count"
									]
								}
							}
						}
					},
					"content": {
						"data": {
							"json": {
								"items": [
									{
										"title": "Laurent Dubois",
										"icon": "../images/Elena_Petrova.png",
										"description": "I am Laurent. I put great attention to detail.",
										"infoState": "Error",
										"info": "Manager",
										"highlight": "Success",
										"action": {
											"url": "https://www.w3schools.com"
										}
									},
									{
										"title": "Alain Chevalier",
										"icon": "../images/Alain_Chevalier.png",
										"description": "I am Alain. I put great attention to detail.",
										"infoState": "Success",
										"info": "Credit Analyst",
										"highlight": "Error"
									},
									{
										"title": "Alain Chevalier",
										"icon": "../images/Monique_Legrand.png",
										"description": "I am Alain. I put great attention to detail.",
										"infoState": "Information",
										"info": "Configuration Expert",
										"highlight": "Information"
									},
									{
										"title": "Alain Chevalier",
										"icon": "../images/Alain_Chevalier.png",
										"description": "I am Alain. I put great attention to detail.",
										"highlight": "Warning"
									},
									{
										"title": "Laurent Dubois",
										"icon": "../images/Elena_Petrova.png",
										"description": "I am Laurent. I put great attention to detail.",
										"infoState": "Error",
										"info": "Manager",
										"highlight": "Success",
										"action": {
											"url": "https://www.w3schools.com"
										}
									}
								],
								"count": 115
							}
						},
						"maxItems": 2,
						"item": {
							"icon": {
								"src": "{icon}"
							},
							"title": {
								"value": "{title}"
							},
							"description": {
								"value": "{description}"
							},
							"highlight": "{highlight}",
							"info": {
								"state": "{infoState}"
							}
						}
					}
				}
			},
			oManifest_List_ContentLevel = {
				"sap.app": {
					"type": "card"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Title",
						"subTitle": "Test Subtitle",
						"icon": {
							"src": "sap-icon://business-objects-experience"
						},
						"status": {
							"text": {
								"format": {
									"translationKey": "i18n>CARD.COUNT_X_OF_Y",
									"parts": [
										"parameters>/visibleItems",
										"/count"
									]
								}
							}
						}
					},
					"content": {
						"data": {
							"request": {
								"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
							}
						},
						"maxItems": 2,
						"item": {
							"icon": {
								"src": "{icon}"
							},
							"title": {
								"value": "{title}"
							},
							"description": {
								"value": "{description}"
							},
							"highlight": "{highlight}",
							"info": {
								"state": "{infoState}"
							}
						}
					}
				}
			},
			oManifest_AnalyticalCard = {
			"sap.card": {
				"type": "Analytical",
				"header": {
					"title": "L3 Request list content Card",
					"subTitle": "Card subtitle",
					"icon": {
						"src": "sap-icon://accept"
					},
					"status": {
						"text": "100 of 200"
					}
				},
				"content": {
					"chartType": "StackedBar",
					"legend": {
						"visible": "{legendVisible}",
						"position": "Bottom",
						"alignment": "Center"
					},
					"plotArea": {
						"dataLabel": {
							"visible": true,
							"showTotal": false
						},
						"categoryAxisText": {
							"visible": false
						},
						"valueAxisText": {
							"visible": true
						}
					},
					"title": {
						"text": "Stacked Bar chart",
						"visible": true,
						"alignment": "Center"
					},
					"measureAxis": "valueAxis",
					"dimensionAxis": "categoryAxis",
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
						}
					},
					"dimensions": [
						{
							"label": "Weeks",
							"value": "{Week}"
						}
					],
					"measures": [
						{
							"label": "{measures/revenueLabel}",
							"value": "{Revenue}"
						},
						{
							"label": "{measures/costLabel}",
							"value": "{Cost}"
						}
					]
				}
			}
		},
			oManifest_ObjectCard = {
			"sap.app": {
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
					}
				},
				"header": {
					"icon": {
						"src": "{photo}"
					},
					"title": "{firstName} {lastName}",
					"subTitle": "{position}"
				},
				"content": {
					"groups": [
						{
							"title": "Contact Details",
							"items": [
								{
									"label": "First Name",
									"value": "{firstName}"
								},
								{
									"label": "Last Name",
									"value": "{lastName}"
								},
								{
									"label": "Phone",
									"value": "{phone}",
									"type": "phone"
								},
								{
									"label": "Email",
									"value": "{email}",
									"type": "email"
								}
							]
						},
						{
							"title": "Organizational Details",
							"items": [
								{
									"label": "Direct Manager",
									"value": "{manager/firstName} {manager/lastName}",
									"icon": {
										"src": "{manager/photo}"
									}
								}
							]
						},
						{
							"title": "Company Details",
							"items": [
								{
									"label": "Company Name",
									"value": "{company/name}"
								},
								{
									"label": "Address",
									"value": "{company/address}"
								},
								{
									"label": "Email",
									"value": "{company/email}",
									"emailSubject": "{company/emailSubject}",
									"type": "email"
								},
								{
									"label": "Website",
									"value": "{company/website}",
									"url": "{company/url}",
									"type": "link"
								}
							]
						}
					]
				}
			}
		},
			Manifest_TableCard_WithCardLevelData = {
				"sap.card": {
					"type": "Table",
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/manifest.json"
						}
					},
					"header": {
						"title": "Sales Orders for Key Accounts"
					},
					"content": {
						"row": {
							"columns": [
								{
									"label": "Sales Order",
									"value": "{salesOrder}",
									"identifier": true
								},
								{
									"label": "Customer",
									"value": "{customer}"
								},
								{
									"label": "Status",
									"value": "{status}",
									"state": "{statusState}"
								},
								{
									"label": "Order ID",
									"value": "{orderUrl}",
									"url": "{orderUrl}"
								},
								{
									"label": "Progress",
									"progressIndicator": {
										"percent": "{percent}",
										"text": "{percentValue}",
										"state": "{progressState}"
									}
								},
								{
									"label": "Avatar",
									"icon": {
										"src": "{iconSrc}"
									}
								}
							]
						}
					}
				}
			};

		function isLoadingIndicatorShowingHeader(oManifest, oCard, bLoading, bExpectedTitle, bExpectedSubtitle, bExpectedAvatar, assert)  {

		// Arrange
			var done = assert.async();
			oCard.attachManifestReady(function () {
				oCard.addEventDelegate({
					"onAfterRendering": function() {
						var oHeader = oCard.getCardHeader();
						assert.strictEqual(oHeader.isLoading(), bLoading, "isLoading should be 'true'");
						assert.strictEqual(oHeader.getDomRef().classList.contains("sapFCardHeaderLoading"), bLoading, "On header level there is a 'sapFCardHeaderLoading' CSS class");
						assert.strictEqual(oHeader._getTitle().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedTitle, "Title has no loading placeholder");
						assert.strictEqual(oHeader._getSubtitle().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedSubtitle, "Subtitle has a loading placeholder");
						assert.strictEqual(oHeader._getAvatar().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedAvatar, "Avatar has a loading placeholder");
						oHeader._oLoadingProvider.removeHeaderPlaceholder(oHeader);
						assert.strictEqual(oHeader.getDomRef().classList.contains("sapFCardHeaderLoading"), false, "On header level there no is a 'sapFCardHeaderLoading' CSS class");
						done();
					}
				}, this);
			}.bind(this));

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}
		function isLoadingIndicatorShowingNumericHeader(oManifest, oCard, bLoading, bExpectedTitle, bExpectedSubtitle, bExpectedDetails, bExpectMainIndicator, bExpectSideIndicator, assert)  {

			// Arrange
			var done = assert.async();
			oCard.attachManifestReady(function () {
				oCard.addEventDelegate({
					"onAfterRendering": function() {
						var oHeader = oCard.getCardHeader();
						assert.strictEqual(oHeader.isLoading(), bLoading, "isLoading should be 'true'");
						assert.strictEqual(oHeader.getDomRef().classList.contains("sapFCardHeaderLoading"), bLoading, "On header level there is a 'sapFCardHeaderLoading' CSS class");
						assert.strictEqual(oHeader._getTitle().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedTitle, "Title has no loading placeholder");
						assert.strictEqual(oHeader._getSubtitle().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedSubtitle, "Subtitle has no loading placeholder");
						assert.strictEqual(oHeader._getDetails().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedDetails,  "Details has no loading placeholder");
						assert.strictEqual(oHeader._getMainIndicator().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectMainIndicator,  "Main indicator has no loading placeholder");
						assert.strictEqual(oHeader.getSideIndicators()[0].getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectSideIndicator,  "Side indicators has no loading placeholder");
						oHeader._oLoadingProvider.removeHeaderPlaceholder(oHeader);
						assert.strictEqual(oHeader.getDomRef().classList.contains("sapFCardHeaderLoading"), false, "On header level there no is a 'sapFCardHeaderLoading' CSS class");
						done();
					}
				}, this);
			}.bind(this));

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}

		function isLoadingIndicatorShowingContent(oManifest, oCard, sMassage, bExpected, sCSSClass,  assert) {

			// Arrange
			var done = assert.async();
			oCard.attachManifestReady(function () {
				oCard.addEventDelegate({
					"onAfterRendering": function () {
						var oContent = oCard.getCardContent();
						if (oContent) {
							assert.strictEqual(jQuery(sCSSClass).length > 0, bExpected, sMassage);
							done();
						}
					}
				}, this);
			}.bind(this));

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}

		function isLoadingIndicatorShowingContentDataReady(oManifest, oCard, sMassage, bExpected, sCSSClass,  assert)  {

			// Arrange
			var done = assert.async();
			oCard.attachEvent("_ready", function () {
				Core.applyChanges();
					var oContent = oCard.getCardContent();
					if (oContent) {
						assert.strictEqual(jQuery(sCSSClass).length > 0, bExpected, sMassage);
						done();
					}
			});

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}

		function isLoadingPlaceholderCorrectType(oLoadingProvider, oConfiguration, sType, sPlaceholderType, sMessage,  assert) {

			// Arrange
			var oPlaceholder = oLoadingProvider.createContentPlaceholder(oConfiguration, sType);

			//Act
			assert.ok(oPlaceholder.getMetadata().getName().indexOf(sPlaceholderType) > -1, sMessage);
		}

		QUnit.module("Loading", {
			beforeEach: function () {
				var fnFake = function (oRequestConfig) {

					return new Promise(function (resolve, reject) {

						var oRequest = {
							"mode": oRequestConfig.mode || "cors",
							"url": oRequestConfig.url,
							"method": (oRequestConfig.method && oRequestConfig.method.toUpperCase()) || "GET",
							"data": oRequestConfig.parameters,
							"headers": oRequestConfig.headers,
							"timeout": 15000,
							"xhrFields": {
								"withCredentials": !!oRequestConfig.withCredentials
							}
						};

						if (oRequest.method === "GET") {
							oRequest.dataType = "json";
						}
						jQuery.ajax(oRequest).done(function (oData) {
							setTimeout(function() {
								resolve(oData);
							}, 150000000);
						}).fail(function (jqXHR, sTextStatus, sError) {
							reject(sError);
						});
					});
				};

				this.oCard = new Card();
				this._fnRequestStub = sinon.stub(RequestDataProvider.prototype, "_fetch").callsFake(fnFake);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this._fnRequestStub.restore();
			}
		});


		QUnit.test("Default Header - Title should not have a loading indicator and all other controls should", function (assert) {
			isLoadingIndicatorShowingHeader(oManifest_CardCase1, this.oCard, true, false, true, true, assert);
		});

		QUnit.test("Default Header - Title should not have a loading indicator and all other controls should - card level level request", function (assert) {
			isLoadingIndicatorShowingHeader(oManifest_CardCase2, this.oCard, true, false, true, true, assert);
		});

		QUnit.test("Default Header - No loading indicator should be present - card level request, json data on content level", function (assert) {
			isLoadingIndicatorShowingHeader(oManifest_CardCase3_No_Loading, this.oCard, false, false, true, true, assert);
		});

		QUnit.test("Numeric Header - Elements should  have a loading indicator - content level request", function (assert) {
			isLoadingIndicatorShowingNumericHeader(oManifest_NumericHeader_ContentLevel, this.oCard, true, true, true, true, true, true, assert);
		});

		QUnit.test("Numeric Header - Elements should  have a loading indicator - card level level request", function (assert) {
			isLoadingIndicatorShowingNumericHeader(oManifest_NumericHeader_CardLevel, this.oCard, true, true, true, true, true, true, assert);
		});

		QUnit.test("Numeric Header - No loading indicator should be present - card level request, json data on content level", function (assert) {
			isLoadingIndicatorShowingNumericHeader(oManifest_NumericHeader_CardLevel_ContentJson, this.oCard, false, true, true, true, true, true, assert);
		});

		QUnit.test("List - Loading indicator should be present - card level request", function (assert) {
			isLoadingIndicatorShowingContent(oManifest_List_CardLevel, this.oCard, "List content has a loading placeholder", true, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("List - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContent(oManifest_List_ContentLevel, this.oCard, "List content has a loading placeholder", true, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("Analytical - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContent(oManifest_AnalyticalCard, this.oCard, "Analytical content has a loading placeholder", true, ".sapFCardContentGenericPlaceholder", assert);
		});

		QUnit.test("Object - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContent(oManifest_ObjectCard, this.oCard, "Object content has a loading placeholder", true, ".sapFCardContentGenericPlaceholder", assert);
		});

		QUnit.test("Table - Loading indicator should be present - card level request", function (assert) {
			isLoadingIndicatorShowingContent(Manifest_TableCard_WithCardLevelData, this.oCard, "Table content has a loading placeholder", true, ".sapFCardContentGenericPlaceholder", assert);
		});


		QUnit.module("Loading with loaded data", {
			beforeEach: function () {
				this.oCard = new Card();

			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("List - Loading indicator should not be present - card level request, content level JSON", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_List_CardLevel_No_Loading, this.oCard, "List content does not have a loading placeholder", false, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("List - Loading indicator should not be present - card level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_List_CardLevel, this.oCard, "List content does not have a loading placeholder", false, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("List - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_List_ContentLevel, this.oCard, "List content has a loading placeholder", false, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("Analytical - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_AnalyticalCard, this.oCard, "Analytical content has a loading placeholder", false, ".sapFCardContentGenericPlaceholder", assert);
		});

		QUnit.test("Object - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_ObjectCard, this.oCard, "Object content has a loading placeholder", false, ".sapFCardContentGenericPlaceholder", assert);
		});

		QUnit.test("Table - Loading indicator should be present - card level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(Manifest_TableCard_WithCardLevelData, this.oCard, "Table content has a loading placeholder", false, ".sapFCardContentGenericPlaceholder", assert);
		});

		QUnit.test("List - error should be visible when request can not be resolved", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_List_CardLevel_Error, this.oCard, "Error content is visible", true, ".sapFCardErrorContent", assert);
		});

		QUnit.module("Loading Provider", {
			beforeEach: function () {
				this.oLoadingProvider = new LoadingProvider();
				this.oCard = new Card();

			},
			afterEach: function () {
				this.oLoadingProvider.destroy();
				this.oLoadingProvider = null;
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Loading provider should provide correct loading placeholder", function (assert) {
			var oConfiguration = {
				"maxItems": 2
			},
				sType = "List";

			isLoadingPlaceholderCorrectType(this.oLoadingProvider, oConfiguration, sType, "List", "Loading placeholder is of type ListPlaceholder", assert);
		});

		QUnit.test("Loading provider should provide correct loading placeholder", function (assert) {
			var oConfiguration = {
					"maxItems": 2
				},
				sType = "Table";

			isLoadingPlaceholderCorrectType(this.oLoadingProvider, oConfiguration, sType, "Generic", "Loading placeholder is of type GenericPlaceholder", assert);
		});

		QUnit.test("Loading provider should provide correct loading placeholder", function (assert) {
			var sType = "Object";

			isLoadingPlaceholderCorrectType(this.oLoadingProvider, {}, sType, "Generic", "Loading placeholder is of type GenericPlaceholder", assert);
		});

		QUnit.test("Loading provider should provide correct loading placeholder", function (assert) {
			var sType = "Analytical";

			isLoadingPlaceholderCorrectType(this.oLoadingProvider, {}, sType, "Generic", "Loading placeholder is of type GenericPlaceholder", assert);
		});

		QUnit.test("setConfiguration of BaseContent should be called with sType as a parameter", function (assert) {

			// Arrange
			var done = assert.async();

			var fnSetConfigurationSpy = sinon.spy(BaseContent.prototype, "setConfiguration");
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();
				var oConfiguration = this.oCard.getCardContent().getConfiguration();

				assert.ok(fnSetConfigurationSpy.calledWithExactly(oConfiguration, "List"), "setConfiguration is called with two arguments 'oConfiguration and sType'");

				// Cleanup
				fnSetConfigurationSpy.restore();
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_List_CardLevel);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

	});
