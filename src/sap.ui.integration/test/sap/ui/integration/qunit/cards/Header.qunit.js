/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"sap/m/library"
], (
	Card,
	nextUIUpdate,
	nextCardReadyEvent,
	mLibrary
) => {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const WrappingType = mLibrary.WrappingType;
	const AvatarColor = mLibrary.AvatarColor;
	const AvatarImageFitType = mLibrary.AvatarImageFitType;

	QUnit.module("Default Header", {
		beforeEach: async function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Default Header initialization", async function (assert) {
		// Arrange
		const oManifest = {
			"sap.app": {
				"id": "test.card.card1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "L3 Request list content Card",
					"subTitle": "Card subtitle",
					"icon": {
						"src": "sap-icon://accept"
					},
					"status": {
						"text": "100 of 200"
					},
					"dataTimestamp": "2021-03-18T12:00:00Z"
				}
			}
		};
		this.oCard.setManifest(oManifest);
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oCard.getAggregation("_header"), "Card header should be empty.");
		assert.notOk(this.oCard.getAggregation("_content"), "Card content should be empty.");

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oHeader = this.oCard.getAggregation("_header");
		assert.ok(oHeader, "Card should have header.");
		assert.ok(oHeader.getDomRef(), "Card header should be created and rendered.");
		assert.ok(oHeader.getAggregation("_title") && oHeader.getAggregation("_title").getDomRef(), "Card header title should be created and rendered.");
		assert.ok(oHeader.getAggregation("_subtitle") && oHeader.getAggregation("_subtitle").getDomRef(), "Card header subtitle should be created and rendered.");
		assert.ok(oHeader.getAggregation("_avatar") && oHeader.getAggregation("_avatar").getDomRef(), "Card header avatar should be created and rendered.");
		assert.ok(oHeader.getAggregation("_dataTimestamp") && oHeader.getAggregation("_dataTimestamp").getDomRef(), "Card header dataTimestamp should be created and rendered.");

		assert.equal(oHeader.getAggregation("_title").getText(), oManifest["sap.card"].header.title, "Card header title should be correct.");
		assert.equal(oHeader.getAggregation("_subtitle").getText(), oManifest["sap.card"].header.subTitle, "Card header subtitle should be correct.");
		assert.equal(oHeader.getAggregation("_avatar").getSrc(), oManifest["sap.card"].header.icon.src, "Card header icon src should be correct.");
		assert.equal(oHeader.getStatusText(), oManifest["sap.card"].header.status.text, "Card header status should be correct.");
		assert.equal(oHeader.getDataTimestamp(), oManifest["sap.card"].header.dataTimestamp, "Card header dataTimestamp should be correct.");
	});

	QUnit.test("Default Header Avatar", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "test.card.card8"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Title",
					"icon": {
						"initials": "AJ",
						"shape": "Circle",
						"fitType": "Contain"
					}
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oHeader = this.oCard.getAggregation("_header");
		assert.notOk(oHeader.getAggregation("_avatar").getSrc(), "Card header icon src should be empty.");
		assert.equal(oHeader.getAggregation("_avatar").getDisplayShape(), "Circle", "Card header icon shape should be 'Circle'.");
		assert.equal(oHeader.getAggregation("_avatar").getInitials(), "AJ", "Card header initials should be 'AJ'.");
		assert.equal(oHeader.getAggregation("_avatar").getImageFitType(), AvatarImageFitType.Contain, "ImageFitType should be 'Contain'.");
	});

	QUnit.test("Default Header Avatar initials with deprecated 'text' property", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.cardDeprecatedInitialsTextProperty"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"icon": {
						"text": "AJ"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oHeader = this.oCard.getAggregation("_header");
		assert.equal(oHeader.getAggregation("_avatar").getInitials(), "AJ", "Card header initials should be correctly set with deprecated 'text' property.");
	});

	QUnit.test("'backgroundColor' when there is icon src", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.backgroundColorWithIconSrc"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"icon": {
						"src": "sap-icon://accept"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oAvatar = this.oCard.getAggregation("_header").getAggregation("_avatar");

		// Assert
		assert.strictEqual(oAvatar.getBackgroundColor(), AvatarColor.Transparent, "Background should be 'Transparent' when there is only icon.");
	});

	QUnit.test("'backgroundColor' when there are initials", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.backgroundColorWithInitials"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"icon": {
						"initials": "SI"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oAvatar = this.oCard.getAggregation("_header").getAggregation("_avatar"),
		sExpected = oAvatar.getMetadata().getPropertyDefaults().backgroundColor;

		// Assert
		assert.strictEqual(oAvatar.getBackgroundColor(), sExpected, "Background should be default value when there are initials.");
	});

	QUnit.test("'statusText' set with binding", async function (assert) {
		// Arrange
		const oManifest = {
				"sap.app": {
					"id": "my.card.test"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"data": {
							"json": {
								"statusText": "2 of 10"
							}
						},
						"status": {
							"text": "{/statusText}"
						}
					}
				}
			};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getCardHeader();

		// Assert
		assert.strictEqual(oHeader.getStatusText(), oManifest["sap.card"].header.data.json.statusText, "Status text binding should be resolved.");
	});

	QUnit.test("hidden header", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.hiddenHeader"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"visible": false,
					"title": "Card title"
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oCard.getCardHeader().getVisible(), "Card Header is hidden.");
	});

	QUnit.test("hidden header with binding", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.hiddenHeader"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"json": {
						"headerVisible": false
					}
				},
				"header": {
					"visible": "{/headerVisible}",
					"title": "Card title"
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oCard.getCardHeader().getVisible(), "Card Header is hidden.");
	});

	QUnit.test("Header icon when visible property is set to false", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.hiddenHeader"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"data": {
						"json": {
							"iconVisible": false
						}
					},
					"title": "Card title",
					"icon": {
						"src": "",
						"visible": "{iconVisible}",
						"shape": "Circle"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oCard.getCardHeader().getIconVisible(), "Card Header icon is hidden.");
	});

	QUnit.test("Header icon when visible property is not set", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.hiddenHeader"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Card title",
					"icon": {
						"src": "",
						"shape": "Circle"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oCard.getCardHeader().getIconVisible(), "Card Header icon is not hidden.");
	});

	QUnit.test("Hidden header icon if visible property is set to true", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.hiddenHeader"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"data": {
						"json": {
							"iconVisible": true
						}
					},
					"title": "Card title",
					"icon": {
						"src": "",
						"visible": "{iconVisible}",
						"shape": "Circle"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oCard.getCardHeader().getIconVisible(), "Card Header icon is not hidden.");
	});

	QUnit.test("Header icon not visible when src set to IconFormatter.SRC_FOR_HIDDEN_ICON", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.hiddenIconWithSrc"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"json": {
						"iconVisible": true
					}
				},
				"configuration": {
					"parameters": {
						"iconSrc": {
							"value": "SRC_FOR_HIDDEN_ICON"
						}
					}
				},
				"header": {
					"title": "Card header icon should be hidden",
					"icon": {
						"src": "{parameters>/iconSrc/value}",
						"visible": "{iconVisible}"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oCard.getCardHeader().shouldShowIcon(), "Card Header icon should not be shown.");
	});

	QUnit.test("Header status text when visible property is set to false", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.hiddenStatus"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"data": {
						"json": {
							"statusVisible": false
						}
					},
					"title": "Card title",
					"status": {
						"text": "4 of 20",
						"visible": "{statusVisible}"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.notOk(this.oCard.getCardHeader().getStatusVisible(), "Card Header status text is hidden.");
	});

	QUnit.test("Header status when visible property is set to true", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.hiddenStatus"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"data": {
						"json": {
							"statusVisible": true
						}
					},
					"title": "Card title",
					"status": {
						"text": "4 of 20",
						"visible": "{statusVisible}"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oCard.getCardHeader().getStatusVisible(), "Card Header status text is not hidden.");
	});

	QUnit.test("Default header icon when src is empty string and shape is 'Circle'", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.defaultHeaderIcon"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Card title",
					"icon": {
						"src": "",
						"shape": "Circle"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oAvatarIcon = this.oCard.getCardHeader()._getAvatar()._getIcon(),
			sPersonPlaceHolder = "sap-icon://person-placeholder";

		// Assert
		assert.strictEqual(oAvatarIcon.getSrc(), sPersonPlaceHolder, "Should show 'sap-icon://person-placeholder' when icon src is empty and the shape is 'Circle'.");
	});

	QUnit.test("Default header icon when src is empty string and shape is 'Square'", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.defaultHeaderIcon"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Card title",
					"icon": {
						"src": "",
						"shape": "Square"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oAvatarIcon = this.oCard.getCardHeader()._getAvatar()._getIcon(),
			sProduct = "sap-icon://product";

		// Assert
		assert.strictEqual(oAvatarIcon.getSrc(), sProduct, "Should show 'sap-icon://product' when icon src is empty and the shape is 'Square'.");
	});

	QUnit.test("Default header icon when src is empty string and shape is 'Circle' with binding", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.defaultHeaderIcon"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"data": {
						"json": {
							"Icon": "",
							"Shape": "Circle"
						}
					},
					"title": "Card title",
					"icon": {
						"src": "{Icon}",
						"shape": "{Shape}"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oAvatarIcon = this.oCard.getCardHeader()._getAvatar()._getIcon(),
			sPersonPlaceHolder = "sap-icon://person-placeholder";

		// Assert
		assert.strictEqual(oAvatarIcon.getSrc(), sPersonPlaceHolder, "Should show 'sap-icon://person-placeholder' when icon src is empty and the shape is 'Circle'.");
	});

	QUnit.test("Default header icon when src is empty string and shape is 'Square' with binding", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.defaultHeaderIcon"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"data": {
						"json": {
							"Icon": "",
							"Shape": "Square"
						}
					},
					"title": "Card title",
					"icon": {
						"src": "{Icon}",
						"shape": "{Shape}"
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oAvatarIcon = this.oCard.getCardHeader()._getAvatar()._getIcon(),
			sProduct = "sap-icon://product";

		// Assert
		assert.strictEqual(oAvatarIcon.getSrc(), sProduct, "Should show 'sap-icon://product' when icon src is empty and the shape is 'Square'.");
	});

	QUnit.test("Header Hyphenation", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.headerHyphenation"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"wrappingType": "Hyphenated",
					"title": "pneumonoultramicroscopicsilicovolcanoconiosis"
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oCard.getCardHeader().getWrappingType(), WrappingType.Hyphenated, "Card Header has wrappingType: Hyphenated.");
	});

	QUnit.test("Cloning and rendering card header outside of a card", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "test.card.cardClone1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "L3 Request list content Card",
					"subTitle": "Card subtitle",
					"icon": {
						"src": "sap-icon://accept"
					},
					"status": {
						"text": "100 of 200"
					},
					"dataTimestamp": "2021-03-18T12:00:00Z"
				}
			}
		};
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oClonedHeader = this.oCard.getCardHeader().clone();

		// Act
		oClonedHeader.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.ok(oClonedHeader.getDomRef(), "Cloned header is rendered outside of the card");
		assert.ok(oClonedHeader.getAggregation("_title") && oClonedHeader.getAggregation("_title").getDomRef(), "Cloned header title should be created and rendered.");
		assert.ok(oClonedHeader.getAggregation("_subtitle") && oClonedHeader.getAggregation("_subtitle").getDomRef(), "Cloned header subtitle should be created and rendered.");
		assert.ok(oClonedHeader.getAggregation("_avatar") && oClonedHeader.getAggregation("_avatar").getDomRef(), "Cloned header avatar should be created and rendered.");
		assert.ok(oClonedHeader.getAggregation("_dataTimestamp") && oClonedHeader.getAggregation("_dataTimestamp").getDomRef(), "Cloned header dataTimestamp should be created and rendered.");
		assert.equal(oClonedHeader.getAggregation("_title").getText(), oManifest["sap.card"].header.title, "Cloned header title should be correct.");
		assert.equal(oClonedHeader.getAggregation("_subtitle").getText(), oManifest["sap.card"].header.subTitle, "Cloned header subtitle should be correct.");
		assert.equal(oClonedHeader.getAggregation("_avatar").getSrc(), oManifest["sap.card"].header.icon.src, "Cloned header icon src should be correct.");
		assert.equal(oClonedHeader.getStatusText(), oManifest["sap.card"].header.status.text, "Cloned header status should be correct.");
		assert.equal(oClonedHeader.getDataTimestamp(), oManifest["sap.card"].header.dataTimestamp, "Cloned header dataTimestamp should be correct.");
	});
});