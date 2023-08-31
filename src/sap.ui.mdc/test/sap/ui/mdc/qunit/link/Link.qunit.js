/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/link/LinkItem",
	"sap/m/Button",
	"sap/ui/mdc/Link",
	"sap/m/MessageToast",
	"sap/ui/core/Core",
	"sap/m/Text"
], function(QUnit, LinkItem, Button, Link, MessageToast, oCore, Text) {
	"use strict";

	var aAdditionaLinkItems = [
		new LinkItem({
			key: "item04",
			text: "item 04",
			href: "#item04"
		}), new LinkItem({
			key: "item05",
			text: "item 05",
			href: "#item05"
		}), new LinkItem({
			key: "item06",
			text: "item 06",
			href: "#item06"
		}), new LinkItem({
			key: "item07",
			text: "item 07",
			href: "#item07"
		}), new LinkItem({
			key: "item08",
			text: "item 08",
			href: "#item08"
		}), new LinkItem({
			key: "item09",
			text: "item 09",
			href: "#item09"
		}), new LinkItem({
			key: "item10",
			text: "item 10",
			href: "#item10"
		}), new LinkItem({
			key: "item11",
			text: "item 11",
			href: "#item11"
		})
	];

	var fnHasVisibleLink = function(assert, oPanel, sText, bVisible) {
		var aElements = oPanel.getAggregation("_content").$().find("a:visible");
		var bFound = false;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].text === sText) {
				bFound = true;
			}
		});
		assert.equal(bFound, bVisible);
	};

	var fnHasVisibleText = function(assert, oPanel, sText, bVisible) {
		var aElements = oPanel.getAggregation("_content").$().find("span:visible");
		var bFound = false;
		aElements.each(function(iIndex) {
			if (aElements[iIndex].textContent === sText) {
				bFound = true;
			}
		});
		assert.equal(bFound, bVisible);
	};

	var fnHasVisibleMoreLinksButton = function(assert, oPanel, bVisible) {
		assert.equal(oPanel.getAggregation("_content").$().find("button:visible").length, bVisible ? 1 : 0);
		// fnHasVisibleText(assert, oPanel, sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc", undefined, false).getText("info.POPOVER_DEFINE_LINKS"), bVisible);
	};

	var fnCheckAdditionalLinks = function(assert, oPanel) {
		aAdditionaLinkItems.forEach(function(oLinkItem) {
			fnHasVisibleText(assert, oPanel, oLinkItem.getText(), false);
			fnHasVisibleLink(assert, oPanel, oLinkItem.getText(), false);
		});
	};

	QUnit.module("sap.ui.mdc.Link: API", {
		beforeEach: function() {
			this.aLinkItems = [
				new LinkItem({
					key: "item1",
					text: "item1"
				}),
				new LinkItem({
					key: "item2",
					text: "item2",
					initiallyVisible: true
				})
			];
		},
		afterEach: function() {
			this.aLinkItems.forEach(function(oLinkItem) {
				oLinkItem.destroy();
			});
		}
	});

	QUnit.test("Instance", function(assert) {
		var done = assert.async(2);
		var oLink = new Link();
		assert.ok(oLink);
		assert.equal(oLink.getEnablePersonalization(), true);
		assert.equal(oLink.getSourceControl(), null);
		oLink.retrieveAdditionalContent().then(function(aAdditionalContent) {
			assert.deepEqual(aAdditionalContent, []);
			done();
		});
		oLink.retrieveLinkItems().then(function(aLinkItems) {
			assert.deepEqual(aLinkItems, []);
			done();
		});
	});

	QUnit.test("retrieveLinkItems should cache LinkItems", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems
				}
			}
		});
		var fnUseDelegateItems = sinon.spy(oLink, "_useDelegateItems");
		oLink.retrieveLinkItems().then(function(aRetrievedLinkItems) {
			assert.deepEqual(aRetrievedLinkItems, this.aLinkItems, "First retrievedLinkItems are correct");
			assert.ok(oLink._bLinkItemsFetched, "LinkItems are chached");
			oLink.retrieveLinkItems().then(function(aRetrievedLinkItems) {
				assert.deepEqual(aRetrievedLinkItems, this.aLinkItems, "Second retrievedLinkItems are correct");
				assert.ok(fnUseDelegateItems.calledOnce, "_useDelegateItems only called once");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("retrieveAdditionalContent should only be called once when calling open", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					additionalContent: new Text({
						text: "Additional Content"
					})
				}
			}
		});
		var fnUseDelegateAdditionalContent = sinon.spy(oLink, "_useDelegateAdditionalContent");
		assert.ok(fnUseDelegateAdditionalContent.notCalled, "_useDelegateAdditionalContent not called yet");

		oLink.open(oLink).then(function() {
			assert.ok(fnUseDelegateAdditionalContent.calledOnce, "_useDelegateAdditionalContent called once");
			var oPopover = oLink.getDependents().find(function(oDependent) {
				return oDependent.isA("sap.m.ResponsivePopover");
			});
			assert.ok(oPopover, "Popover created");
			done();
		});
	});

	QUnit.test("retrieveAllMetadata should return all LinkItems", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			var oModel = oLink._getInternalModel();
			var aMLinkItems = oModel.getProperty("/linkItems/");
			var i = 0;
			var aMetadata = Link.retrieveAllMetadata(oPanel);
			aMetadata.forEach(function(oMetadataObject) {
				var oLinkItem = aMLinkItems[i++];
				assert.equal(oMetadataObject.id, oLinkItem.key, "key value is correct");
				assert.equal(oMetadataObject.text, oLinkItem.text, "text value is correct");
				assert.equal(oMetadataObject.href, oLinkItem.href, "href value is correct");
				assert.equal(oMetadataObject.target, oLinkItem.target, "target value is correct");
				assert.equal(oMetadataObject.visible, oLinkItem.visible, "visible value is correct");
			});
			oPanel.destroy();
			done();
		});
	});

	QUnit.test("retrieveAllMetadata should return an empty array if the Panel has no $sapuimdcLink model", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.setModel(null, "$sapuimdcLink");
			assert.deepEqual(Link.retrieveAllMetadata(oPanel), [], "empty array returned");
			oPanel.destroy();
			done();
		});
	});

	QUnit.test("retrieveBaseline should return all baseline LinkItems", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			var oModel = oLink._getInternalModel();
			var aMBaselineLinkItems = oModel.getProperty("/baselineLinkItems/");
			var i = 0;
			var aMBaseline = Link.retrieveBaseline(oPanel);
			aMBaseline.forEach(function(oMetadataObject) {
				var oLinkItem = aMBaselineLinkItems[i++];
				assert.equal(oMetadataObject.id, oLinkItem.key, "key value is correct");
				assert.equal(oMetadataObject.visible, true, "visible value is correct");
			});
			oPanel.destroy();
			done();
		});
	});

	QUnit.test("retrieveBaseline should return an empty array if the Panel has no $sapuimdcLink model", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.setModel(null, "$sapuimdcLink");
			assert.deepEqual(Link.retrieveBaseline(oPanel), [], "empty array returned");
			oPanel.destroy();
			done();
		});
	});

	QUnit.module("sap.ui.mdc.Link: visibility of invalid items", {
		beforeEach: function() {
			this.aLinkItems = [
				new LinkItem({
					key: "item00",
					text: "item 00" // invalid
				}), new LinkItem({
					text: "item 01" // invalid
				}), new LinkItem({
					key: "item02",
					text: "item 02",
					href: "#item02"
				}), new LinkItem({
					key: "item03",
					text: "item 03",
					href: "#item03"
				})
			];
			this.checkLinks = function(assert, oPanel) {
				fnHasVisibleLink(assert, oPanel, "item 00", false);
				fnHasVisibleText(assert, oPanel, "item 00", false);

				fnHasVisibleText(assert, oPanel, "item 01", false);
				fnHasVisibleLink(assert, oPanel, "item 01", false);

				fnHasVisibleText(assert, oPanel, "item 02", false);
				fnHasVisibleLink(assert, oPanel, "item 02", false);

				fnHasVisibleText(assert, oPanel, "item 03", false);
				fnHasVisibleLink(assert, oPanel, "item 03", false);
			};
		},
		afterEach: function() {
			this.aLinkItems = null;
			this.checkLinks = null;
		}
	});

	QUnit.test("invalid 'item' and less items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			oCore.applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);

			this.checkLinks(assert, oPanel);

			done();
			oPanel.destroy();
		}.bind(this));
	});

	QUnit.test("invalid 'item' and many items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems.concat(aAdditionaLinkItems)
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			oCore.applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);

			this.checkLinks(assert, oPanel);

			fnCheckAdditionalLinks(assert, oPanel);

			done();
			oPanel.destroy();
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.Link: visibility of superior item", {
		beforeEach: function() {
			this.aLinkItems = [
				new LinkItem({
					key: "item00",
					text: "item 00",
					initiallyVisible: true
				}), new LinkItem({
					key: "item01",
					text: "item 01",
					href: "#item01",
					// Superior
					initiallyVisible: true
				}), new LinkItem({
					key: "item02",
					text: "item 02",
					href: "#item02"
				}), new LinkItem({
					key: "item03",
					text: "item 03",
					href: "#item03"
				})
			];
			this.checkLinks = function(assert, oPanel) {
				fnHasVisibleText(assert, oPanel, "item 00", true);
				fnHasVisibleLink(assert, oPanel, "item 00", false);

				fnHasVisibleText(assert, oPanel, "item 01", false);
				fnHasVisibleLink(assert, oPanel, "item 01", true);

				fnHasVisibleText(assert, oPanel, "item 02", false);
				fnHasVisibleLink(assert, oPanel, "item 02", false);

				fnHasVisibleText(assert, oPanel, "item 03", false);
				fnHasVisibleLink(assert, oPanel, "item 03", false);
			};
		},
		afterEach: function() {
			this.aLinkItems = null;
			this.checkLinks = null;
		}
	});

	QUnit.test("superior 'item' and less items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			oCore.applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);

			this.checkLinks(assert, oPanel);

			done();
			oPanel.destroy();
		}.bind(this));
	});

	QUnit.test("superior 'item' and many items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems.concat(aAdditionaLinkItems)
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			oCore.applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);

			this.checkLinks(assert, oPanel);

			fnCheckAdditionalLinks(assert, oPanel);

			done();
			oPanel.destroy();
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.Link: visibility of superior item and invalid item", {
		beforeEach: function() {
			this.aLinkItems = [
				new LinkItem({
					key: "item00",
					text: "item 00",
					href: "#item00"
				}), new LinkItem({
					key: "item01",
					text: "item 01",
					href: "#item01",
					// Superior
					initiallyVisible: true
				}), new LinkItem({
					key: "item02",
					text: "item 02",
					href: "#item02"
				}), new LinkItem({
					key: "item03",
					text: "item 03" // invalid item
				})
			];
			this.checkLinks = function(assert, oPanel) {
				fnHasVisibleText(assert, oPanel, "item 00", false);
				fnHasVisibleLink(assert, oPanel, "item 00", false);

				fnHasVisibleText(assert, oPanel, "item 01", false);
				fnHasVisibleLink(assert, oPanel, "item 01", true);

				fnHasVisibleText(assert, oPanel, "item 02", false);
				fnHasVisibleLink(assert, oPanel, "item 02", false);

				fnHasVisibleText(assert, oPanel, "item 03", false);
				fnHasVisibleLink(assert, oPanel, "item 03", false);
			};
		},
		afterEach: function() {
			this.aLinkItems = null;
			this.checkLinks = null;
		}
	});

	QUnit.test("superior 'item', invalid 'item' and less items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			oCore.applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);

			this.checkLinks(assert, oPanel);

			done();
			oPanel.destroy();
		}.bind(this));
	});

	QUnit.test("superior 'item', invalid 'item' and many items", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: this.aLinkItems.concat(aAdditionaLinkItems)
				}
			}
		});

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			oCore.applyChanges();

			fnHasVisibleMoreLinksButton(assert, oPanel, true);

			this.checkLinks(assert, oPanel);

			fnCheckAdditionalLinks(assert, oPanel);

			done();
			oPanel.destroy();
		}.bind(this));
	});

	QUnit.module("sap.ui.mdc.Link: LinkDelegate tests");

	QUnit.test("modifyLinkItemsBeforePopoverOpens", function(assert) {
		var done = assert.async(2);
		var aModfiedLinkItemTexts = [];
		aModfiedLinkItemTexts["Link1"] = "New Text Link1";
		aModfiedLinkItemTexts["Link2"] = "New Text Link2";

		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							text: "Link1",
							href: "#Action01"
						}),
						new LinkItem({
							text: "Link2",
							href: "#Action02"
						})
					],
					modfiedLinkItemTexts: aModfiedLinkItemTexts
				}
			}
		});
		oLink._retrieveUnmodifiedLinkItems().then(function(aLinkItems) {
			assert.equal(aLinkItems[0].getText(), "Link1");
			assert.equal(aLinkItems[1].getText(), "Link2");
			done();
		});
		oLink.retrieveLinkItems().then(function(aModfiedLinkItems) {
			assert.equal(aModfiedLinkItems[0].getText(), "New Text Link1");
			assert.equal(aModfiedLinkItems[1].getText(), "New Text Link2");
			done();
		});
	});

	QUnit.test("beforeNavigationCallback - open MessageToast before navigation", function(assert) {
		var done = assert.async(1);

		var fnMessageToastSpy = sinon.spy(MessageToast, "show");
		var sBaseUrl = window.location.href;

		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							text: "Link1",
							href: sBaseUrl + "#Action01",
							initiallyVisible: true
						}),
						new LinkItem({
							text: "Link2",
							href: sBaseUrl + "#Action02"
						})
					],
					beforeNavigationCallback: function() {
						return new Promise(function(resolve) {
							MessageToast.show("test");
							assert.ok(fnMessageToastSpy.calledOnce);
							resolve(true);
						});
					}
				}
			}
		});

		var fnCheckURL = function() {
			window.removeEventListener('hashchange', fnCheckURL);
			var oResultUrl = window.location.href;
			assert.equal(oResultUrl, sBaseUrl + "#Action01", "Navigation happened");
			done();
		};

		oLink.getContent().then(function(oPanel) {
			oPanel.placeAt("qunit-fixture");
			oCore.applyChanges();
			assert.ok(fnMessageToastSpy.notCalled);

			window.addEventListener('hashchange', fnCheckURL);

			oPanel._getLinkControls()[0].firePress();
		});
	});

	QUnit.test("Updated isTriggerable", function(assert) {
		var done = assert.async();
		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					fetchLinkType: function(oPayload, oLink) {
						var oNewLinkPromise = new Promise(function(resolve) {
							setTimeout(function() {
								resolve({
									type: 1,
									directLink: new LinkItem({
										text: "Link2",
										href: "#Action02"
									})
								});
							}, 1000);
						});

						var oLinkTypeObject = {
							initialType: {
								type: 0,
								directLink: null
							},
							runtimeType: oNewLinkPromise
						};
						return Promise.resolve(oLinkTypeObject);
					}
				}
			}
		});

		var fnDataUpdateSpy = sinon.spy(oLink, "fireDataUpdate");

		oLink.isTriggerable().then(function(bIsTriggerAble) {
			assert.ok(bIsTriggerAble === false, "First isTriggerable call returns false");
			assert.ok(fnDataUpdateSpy.notCalled, "dataUpdate event not fired yet");
			setTimeout(function() {
				assert.ok(fnDataUpdateSpy.calledOnce, "dataUpdate event fired after given timeout");
				oLink.isTriggerable().then(function(bIsTriggerAble) {
					assert.ok(bIsTriggerAble, "Second isTriggerable call returns true");
					oLink.getDirectLinkHrefAndTarget().then(function(oDirectLinkItem) {
						assert.ok(oDirectLinkItem.target === "_self", "Target value of directLink");
						assert.ok(oDirectLinkItem.href === "#Action02", "Href value of directLink");
						done();
					});
				});
			}, 1000);
		});
	});

	QUnit.module("sap.ui.mdc.Link: FieldInfoBase functions");

	var aLinkTypes = [
		{
			type: 0,
			expectedHref: null
		},
		{
			type: 1,
			expectedHref: "#Action01"
		},
		{
			type: 2,
			expectedHref: null
		}
	];

	aLinkTypes.forEach(function(oLinkType) {
		QUnit.test("getTriggerHref type = " + oLinkType.type + " returns '" + oLinkType.expectedHref + "'", function(assert) {
			var done = assert.async(1);
			var oLink = new Link({
				delegate: {
					name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
					payload: {
						fetchLinkType: function() {
							return Promise.resolve({
								initialType: {
									type: oLinkType.type,
									directLink: new LinkItem({
										href: "#Action01"
									})
								}
							});
						}
					}
				}
			});
			oLink.getTriggerHref().then(function(sHref) {
				assert.equal(sHref, oLinkType.expectedHref, "correct triggerHref returned");
				done();
			});
		});
	});

	QUnit.test("getContent when there are no LinkItems and no additionalContent", function(assert) {
		var done = assert.async(1);
		var oLinkNoContent = new Link();

		var oNoContentText = oLinkNoContent._getNoContent().getContent()[0].getText();

		oLinkNoContent.getContent().then(function(oPanel) {
			assert.equal(oPanel._getAdditionalContentArea().getItems()[0].getContent()[0].getText(), oNoContentText, "'No content available' SimpleForm displayed on Panel");
			done();
		});
	});

	QUnit.test("checkDirectNavigation when there is only one LinkItem and additionalContent should not navigate directly", function(assert) {
		var done = assert.async(1);
		var sBaseUrl = window.location.href;

		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							text: "Link1",
							href: sBaseUrl + "#directNavigation",
							initiallyVisible: true
						})
					],
					additionalContent: [
						new Text({
							text: "Additional Content Text"
						})
					]
				}
			}
		});

		oLink.checkDirectNavigation().then(function(bNavigate) {
			var oResultUrl = window.location.href;
			assert.equal(oResultUrl, sBaseUrl, "Direct navigation did not happened");
			assert.ok(!bNavigate, "Promise value is false");
			done();
		});
	});

	QUnit.test("checkDirectNavigation when there is only one LinkItem and no additionalContent should navigate directly", function(assert) {
		var done = assert.async(1);
		var sBaseUrl = window.location.href;

		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							text: "Link1",
							href: sBaseUrl + "#directNavigation",
							initiallyVisible: true
						})
					]
				}
			}
		});

		oLink.checkDirectNavigation().then(function(bNavigate) {
			var oResultUrl = window.location.href;
			assert.equal(oResultUrl, sBaseUrl + "#directNavigation", "Direct navigation happened");
			assert.ok(bNavigate, "Promise value is true");
			done();
		});
	});

	QUnit.test("createPopover - without links, without additional content", function(assert) {
		var done = assert.async();

		var oLink = new Link();
		var oText = new Text({
			text: "Dummy Text"
		});
		oText.placeAt("qunit-fixture");
		oCore.applyChanges();

		oLink.open(oText).then((oPopover) => {
			var oPopover = oLink.getDependents().find((oDependent) => {
				return oDependent.isA("sap.m.ResponsivePopover");
			});
			var oPanel = oPopover.getContent()[0];
			assert.equal(oPopover.getDomRef().getAttribute("aria-labelledby"), oPanel._getAdditionalContentArea().getItems()[0].getId(), "Correct 'aria-labelledby' set");
			oPopover.close();
			done();
		});
	});

	QUnit.test("createPopover - with links, without additional content", function(assert) {
		var done = assert.async();
		var sBaseUrl = window.location.href;

		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							text: "Link1",
							href: sBaseUrl + "#directNavigation",
							initiallyVisible: true
						}),
						new LinkItem({
							text: "Link2",
							href: sBaseUrl + "#directNavigation",
							initiallyVisible: true
						})
					]
				}
			}
		});
		var oText = new Text({
			text: "Dummy Text"
		});
		oText.placeAt("qunit-fixture");
		oCore.applyChanges();

		oLink.open(oText).then((oPopover) => {
			var oPopover = oLink.getDependents().find((oDependent) => {
				return oDependent.isA("sap.m.ResponsivePopover");
			});
			var oPanel = oPopover.getContent()[0];
			assert.equal(oPopover.getDomRef().getAttribute("aria-labelledby"), oPanel._getLinkControls()[0].getId(), "Correct 'aria-labelledby' set");
			oPopover.close();
			done();
		});
	});

	QUnit.test("createPopover - with links and with additional content", function(assert) {
		var done = assert.async();
		var sBaseUrl = window.location.href;
		var oAdditionalContentText = new Text({
			text: "Additional Content Text"
		});

		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					items: [
						new LinkItem({
							text: "Link1",
							href: sBaseUrl + "#directNavigation",
							initiallyVisible: true
						}),
						new LinkItem({
							text: "Link2",
							href: sBaseUrl + "#directNavigation",
							initiallyVisible: true
						})
					],
					additionalContent: [ oAdditionalContentText ]
				}
			}
		});
		var oText = new Text({
			text: "Dummy Text"
		});
		oText.placeAt("qunit-fixture");
		oCore.applyChanges();

		oLink.open(oText).then((oPopover) => {
			var oPopover = oLink.getDependents().find((oDependent) => {
				return oDependent.isA("sap.m.ResponsivePopover");
			});
			assert.equal(oPopover.getDomRef().getAttribute("aria-labelledby"), oAdditionalContentText.getId(), "Correct 'aria-labelledby' set");
			oPopover.close();
			done();
		});
	});

	QUnit.test("createPopover - without links, with additional content", function(assert) {
		var done = assert.async();
		var oAdditionalContentText = new Text({
			text: "Additional Content Text"
		});

		var oLink = new Link({
			delegate: {
				name: "test-resources/sap/ui/mdc/qunit/link/TestDelegate_Link",
				payload: {
					additionalContent: [ oAdditionalContentText ]
				}
			}
		});
		var oText = new Text({
			text: "Dummy Text"
		});
		oText.placeAt("qunit-fixture");
		oCore.applyChanges();

		oLink.open(oText).then((oPopover) => {
			var oPopover = oLink.getDependents().find((oDependent) => {
				return oDependent.isA("sap.m.ResponsivePopover");
			});
			assert.equal(oPopover.getDomRef().getAttribute("aria-labelledby"), oAdditionalContentText.getId(), "Correct 'aria-labelledby' set");
			oPopover.close();
			done();
		});
	});

});
