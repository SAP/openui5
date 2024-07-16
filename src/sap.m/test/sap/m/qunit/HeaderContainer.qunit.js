/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery",
	"sap/m/HeaderContainer",
	"sap/m/FlexBox",
	"sap/m/Label",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/ui/Device",
	"sap/ui/core/Icon",
	"sap/ui/core/library",
	"sap/ui/events/PseudoEvents",
	"sap/ui/util/Mobile",
	"sap/m/library",
	"sap/base/Log",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/m/Panel",
	"sap/m/GenericTile",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Localization, Element, jQuery, HeaderContainer, FlexBox, Label, VerticalLayout, Button, Device, Icon, coreLibrary, PseudoEvents, Mobile, mobileLibrary, Log, Text, oCore, Panel, GenericTile, nextUIUpdate) {
	"use strict";

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = mobileLibrary.BackgroundDesign;

	// shortcut for sap.ui.core.Orientation
	var Orientation = coreLibrary.Orientation;

	// shortcut for sap.m.ScreenSizes
	var ScreenSizes = mobileLibrary.ScreenSizes;

	Mobile.init();

	QUnit.module("Default Property Values", {
		beforeEach: async function () {
			this.oHeaderContainer = new HeaderContainer("headerContainer");
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		}
	});

	QUnit.test("Warning is logged if no value for the mandatory width or height property is set", function (assert) {
		//Arrange
		sinon.spy(Log, "warning");
		//Act
		this.oHeaderContainer.onBeforeRendering();
		//Assert
		assert.equal(this.oHeaderContainer.getWidth(), undefined);
		assert.equal(Log.warning.callCount, 2, "Warning logged twice");
		assert.ok(Log.warning.calledWith("No width provided", this.oHeaderContainer),
			"Warning logged with expected message for width");
		assert.ok(Log.warning.calledWith("No height provided", this.oHeaderContainer),
			"Warning logged with expected message for height");
		// Restore
		Log.warning.restore();
	});

	QUnit.test("ScrollStep should be set to 300", function (assert) {
		assert.equal(this.oHeaderContainer.getScrollStep(), 300);
	});

	QUnit.test("ScrollStepByItem should be set to 1", function (assert) {
		assert.equal(this.oHeaderContainer.getScrollStepByItem(), 1);
	});

	QUnit.test("ScrollTime should be set to 500", function (assert) {
		assert.equal(this.oHeaderContainer.getScrollTime(), 500);
	});

	QUnit.test("ShowDividers should be set to true", function (assert) {
		assert.ok(this.oHeaderContainer.getShowDividers());
	});

	QUnit.test("Content changes should not break out container timer", async function (assert) {
		this.oHeaderContainer.addContent(new Label({
			text: "test"
		}));
		await nextUIUpdate();

		this.oHeaderContainer.removeAllContent();
		this.oHeaderContainer.addContent(new Label({
			text: "test"
		}));
		assert.equal(this.oHeaderContainer.getContent().length, 1);
	});

	QUnit.test("Orientation should be set to Horizontal", function (assert) {
		assert.deepEqual(this.oHeaderContainer.getOrientation(), Orientation.Horizontal);
	});

	QUnit.test("BackgroundDesign should be set to Transparent", function (assert) {
		assert.deepEqual(this.oHeaderContainer.getBackgroundDesign(), BackgroundDesign.Transparent);
	});

	QUnit.test("Aggregation content exists", function (assert) {
		assert.ok(this.oHeaderContainer.getContent());
	});

	QUnit.module("Basic Rendering", {
		beforeEach: async function () {
			this.oHeaderContainer = new HeaderContainer("headerContainer");
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		}
	});

	QUnit.test("DOM Structure should exist for horizontal header container", function (assert) {
		assert.ok(document.getElementById("headerContainer"), "HeaderContainer was rendered successfully");
		assert.ok(document.getElementById("headerContainer-scroll-area"), "HeaderContainer scroll area was rendered successfully");
	});

	QUnit.test("DOM Structure should exist for vertical header container", async function (assert) {
		this.oHeaderContainer.setOrientation("Vertical");
		await nextUIUpdate();
		assert.ok(document.getElementById("headerContainer"), "HeaderContainer was rendered successfully");
		assert.ok(document.getElementById("headerContainer-scroll-area"), "HeaderContainer scroll area was rendered successfully");
	});

	QUnit.test("Default inline style for width and height in DOM structure", function (assert) {
		assert.equal(document.getElementById("headerContainer").style.width, "100%");
		assert.equal(document.getElementById("headerContainer").style.height, "auto");
	});

	QUnit.test("Default inline style for width and height in DOM structure (vertical mode)", async function (assert) {
		//Arrange
		this.oHeaderContainer.setOrientation(Orientation.Vertical);
		//Act
		await nextUIUpdate();
		//Assert
		assert.equal(document.getElementById("headerContainer").style.width, "auto");
		assert.equal(document.getElementById("headerContainer").style.height, "100%");
	});

	QUnit.test("Inline style for width and height in DOM structure", async function (assert) {
		//Arrange
		this.oHeaderContainer.setWidth("31%");
		this.oHeaderContainer.setHeight("32%");
		//Act
		await nextUIUpdate();
		//Assert
		assert.equal(document.getElementById("headerContainer").style.width, "31%");
		assert.equal(document.getElementById("headerContainer").style.height, "32%");
	});

	QUnit.skip("Acc - role assigned is of type list", async function (assert) {
		//Arrange
		var sRole = this.oHeaderContainer.$().attr( "role" );
		//Act
		await nextUIUpdate();
		//Assert
		assert.equal(sRole, "list", "HeaderContainer role is of type list");
	});

	QUnit.test("Acc - role assigned is of type list to scroll container(immediate parent of listitems)", async function (assert) {
		//Arrange
		var sRole = this.oHeaderContainer.aDelegates[0].oDelegate.oDomRef.getAttribute("role");
		//Act
		await nextUIUpdate();
		//Assert
		assert.equal(sRole, "list", "scrollContainer role is of type list");
	});

	QUnit.module("Background design", {
		beforeEach: async function () {
			this.oHeaderContainer = new HeaderContainer("headerContainer");
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		}
	});

	QUnit.test("onAfterRendering is triggered only once after initial rendering", async function (assert) {
		//Arrange
		var oHeaderContainer = new HeaderContainer();
		var oSpy = sinon.spy(oHeaderContainer, "onAfterRendering");
		//Act
		oHeaderContainer.placeAt("qunit-fixture");
		await nextUIUpdate();
		//Assert
		assert.strictEqual(oSpy.callCount, 1, "HeaderContainer was rendered only once");
		//Cleanup
		oHeaderContainer.destroy();
	});

	QUnit.test("Correct CSS Class added in case of 'Solid'", async function (assert) {
		//arrange
		var oBackgroundDesignDefault = this.oHeaderContainer.getBackgroundDesign();
		//act
		this.oHeaderContainer.setBackgroundDesign(BackgroundDesign.Solid);
		this.oHeaderContainer.invalidate();
		await nextUIUpdate();
		var oBackgroundDesignNew = this.oHeaderContainer.getBackgroundDesign();
		var sCssClassNew = document.getElementById("headerContainer-scroll-area").className;
		//assert
		assert.equal(oBackgroundDesignDefault, BackgroundDesign.Transparent, "The default value is 'sapMHdrCntrBGTransparent'");
		assert.equal(oBackgroundDesignNew, BackgroundDesign.Solid, "The new value is 'sapMHdrCntrBGSolid'");
		assert.ok(sCssClassNew.indexOf("sapMHdrCntrBGSolid") >= 0, "Background design was set to Solid. CssClass 'sapMHdrCntrBGSolid' is present");
	});

	QUnit.module("Scrolling", {
		beforeEach: async function () {
			this.OFFSET = 10;
			this.oItem1 = new FlexBox({
				height: "120px",
				width: "320px"
			});
			this.oItem2 = new FlexBox({
				height: "120px",
				width: "330px"
			});
			this.oItem3 = new FlexBox({
				height: "120px",
				width: "290px"
			});
			this.oItemSmall = new FlexBox({
				height: "120px",
				width: "70px"
			});
			this.oItemLarge = new FlexBox({
				height: "120px",
				width: "600px"
			});
			this.oHeaderContainer = new HeaderContainer("headerContainer", {
				content: [this.oItem1, this.oItem2, this.oItem3],
				height: '150px',
				width: '400px'
			});
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();

		},
		afterEach: function () {
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		},
		SMALL: 1,
		LARGE: 2,
		NUMBER_OF_TRIES: 10,
		prepareContent: async function (itemsConfiguration) {
			this.oHeaderContainer.removeAllContent();
			itemsConfiguration.forEach(function (i) {
				this.oHeaderContainer.addContent(i === this.SMALL ? this.oItemSmall.clone() : this.oItemLarge.clone());
			}.bind(this));
			await nextUIUpdate();
		},
		testOverflowVisibility: function (assert, itemsConfiguration, invisibleBeforeScroll, invisibleAfterScroll) {
			var done = assert.async();
			this.prepareContent(itemsConfiguration);
			var items = this.oHeaderContainer.getContent();
			this.oHeaderContainer.setShowOverflowItem(false);

			assert.equal(items.length, itemsConfiguration.length);
			var beforeScrollCounter = 0;
			var itemsInterval = setInterval(function () {
				var res = items.reduce(function (prev, item, index) {
					return prev && index < invisibleBeforeScroll ? item.$().is(":visible") : item.$().is(":hidden");
				}, true);
				if (res || beforeScrollCounter > this.NUMBER_OF_TRIES) {
					clearInterval(itemsInterval);
					assert.ok(true, "Items visibility before scroll is correct.");
					if (!res) {
						done();
					}
				}
				if (res) {
					this.oHeaderContainer._scroll(items[0].$().parent().outerWidth(true) + this.OFFSET, 0);
					var afterScrollCounter = 0;
					var scrollInterval = setInterval(function () {
						var res = items.reduce(function (prev, item, index) {
							return prev && index < invisibleAfterScroll ? item.$().is(":visible") : item.$().is(":hidden");
						}, true);
						if (res || afterScrollCounter > this.NUMBER_OF_TRIES) {
							clearInterval(scrollInterval);
							assert.ok(res, "Items visibility after scroll is correct.");
							done();
						}
						afterScrollCounter++;
					}.bind(this), 400);
				}
				beforeScrollCounter++;
			}.bind(this), 400);
		}
	});

	QUnit.test("Scroll event is being triggered", async function (assert) {
		this.oHeaderContainer.attachScroll(function (oEvent) {
			assert.ok(oEvent, "Scroll event is fired");
		});
		await nextUIUpdate();
		this.oHeaderContainer._scroll();
	});

	QUnit.test("Scrolling by item, using _getScrollValue, scroll 100", function (assert) {
		assert.equal(this.oHeaderContainer._getScrollValue(true), this.oItem1.$().parent().outerWidth(true) + this.OFFSET);
		assert.equal(this.oHeaderContainer._getScrollValue(false), 0);

		this.oHeaderContainer._scroll(100, 0);
		assert.equal(this.oHeaderContainer._getScrollValue(true), this.oItem1.$().parent().outerWidth(true) + this.OFFSET - 100);
		assert.equal(this.oHeaderContainer._getScrollValue(false), -100);
	});

	QUnit.test("Shifting content to the left", function (assert) {
		var done = assert.async();
		setTimeout(function () {
			assert.notOk(jQuery("#headerContainer-prev-button-container").is(":visible"), "Previous Button is not visible before scrolling.");
			this.oHeaderContainer._scroll(100, 0);
			setTimeout(function () {
				assert.ok(jQuery("#headerContainer-prev-button-container").is(":visible"), "Previous Button is visible after scrolling.");
				done();
			}, 1000);
		}.bind(this), 200);
	});

	QUnit.test("Test shifting content to the right", function (assert) {
		var done = assert.async();
		this.oHeaderContainer._scroll(-200, 500);
		setTimeout(function () {
			assert.ok(jQuery("#headerContainer-scrl-next-button").css("visibility") !== "hidden", "Next Button is visible after scrolling.");
			done();
		}, 1000);
	});

	QUnit.test("Test showOverflowItem", function (assert) {
		var done = assert.async();
		assert.ok(this.oItem1.$().is(":visible"), "Item1 is visible.");
		assert.ok(this.oItem2.$().is(":visible"), "Item2 is visible.");
		assert.ok(this.oItem3.$().is(":visible"), "Item3 is visible.");
		this.oHeaderContainer.setShowOverflowItem(false);
		setTimeout(function () {
			assert.ok(this.oItem1.$().is(":visible"), "Item1 is visible.");
			assert.ok(this.oItem2.$().is(":hidden"), "Item2 is hidden.");
			assert.ok(this.oItem3.$().is(":hidden"), "Item3 is hidden.");
			done();
		}.bind(this), 500);
	});

	QUnit.test("Test showOverflowItem, small items only", function (assert) {
		var itemConfig = [this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL];
		this.testOverflowVisibility(assert, itemConfig, 3, 4);
	});

	QUnit.test("Test showOverflowItem, small then large", function (assert) {
		var itemConfig = [this.SMALL, this.LARGE, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL];
		this.testOverflowVisibility(assert, itemConfig, 1, 2);
	});

	QUnit.test("Test showOverflowItem, 2 smalls then large", function (assert) {
		var itemConfig = [this.SMALL, this.SMALL, this.LARGE, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL];
		this.testOverflowVisibility(assert, itemConfig, 2, 2);
	});

	QUnit.test("Test showOverflowItem, 3 smalls then large", function (assert) {
		var itemConfig = [this.SMALL, this.SMALL, this.SMALL, this.LARGE, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL];
		this.testOverflowVisibility(assert, itemConfig, 3, 3);
	});

	QUnit.test("Test showOverflowItem, 4 smalls then large", function (assert) {
		var itemConfig = [this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.LARGE, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL];
		this.testOverflowVisibility(assert, itemConfig, 3, 4);
	});

	QUnit.test("Test showOverflowItem, large then small", function (assert) {
		var itemConfig = [this.LARGE, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL];
		this.testOverflowVisibility(assert, itemConfig, 1, 4);
	});

	QUnit.test("Test showOverflowItem, large then large", function (assert) {
		var itemConfig = [this.LARGE, this.LARGE, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL, this.SMALL];
		this.testOverflowVisibility(assert, itemConfig, 1, 2);
	});

	if (Device.system.desktop) {

		QUnit.module("Keyboard navigation focus issues", {
			beforeEach: async function () {
				this.oHeaderContainer = new HeaderContainer("headerContainer", {
					content: [
						new VerticalLayout(),
						new VerticalLayout(),
						new VerticalLayout()
					]
				});
				this.oHeaderContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oHeaderContainer.destroy();
				this.oHeaderContainer = null;
			}
		});

		QUnit.test("The item navigation includes all the content of the HeaderContainer", function (assert) {
			assert.equal(this.oHeaderContainer._oItemNavigation.getItemDomRefs().length, this.oHeaderContainer.getContent().length, "Correct content received focus.");
		});

		QUnit.test("Surrogate div with tab index which is used to catch shift tab focus is rendered ", function (assert) {
			assert.equal(this.oHeaderContainer.$("after").attr("tabindex"), "0", "Correct content received focus.");
		});

		QUnit.test("_restoreLastFocused method sets the focus on the content that was saved as focused before", function (assert) {
			//Arrange
			this.oHeaderContainer._oItemNavigation.setFocusedIndex(1);
			//Act
			this.oHeaderContainer._restoreLastFocused();
			//Assert
			assert.deepEqual(this.oHeaderContainer._oItemNavigation.getItemDomRefs()[1], document.activeElement, "Correct content received focus.");
		});

		QUnit.test("When focusing from outside (through shift + tab) on the surrogate div element, the focus is set on the previous focused element of the itemnavigation", function (assert) {
			//Arrange
			this.oHeaderContainer._oItemNavigation.setFocusedIndex(0);
			var oEvt = {
				preventDefault: function () {
				},
				target: this.oHeaderContainer.$("after").get(0)
			};
			//Act
			this.oHeaderContainer.onfocusin(oEvt);
			//Assert
			assert.equal(document.activeElement, this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0], "Focus from outside was moved to the right last focused item");
		});

		QUnit.test("Test tab button click event", function (assert) {
			//Arrange
			this.oHeaderContainer._oItemNavigation.setFocusedIndex(0);
			this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0].focus();
			var oEvt = {
				preventDefault: function () {
				},
				target: this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0]
			};
			//Act
			this.oHeaderContainer.onsaptabnext(oEvt);
			//Assert
			assert.deepEqual(document.activeElement, this.oHeaderContainer.$("after").get(0), "Focus leaves away from the ScrollContainer");
			assert.equal(this.oHeaderContainer._oItemNavigation.getFocusedIndex(), 0, "The focused content index is still correct after the focus leaves away from the ScrollContainer");
		});

		QUnit.test("Test shift Tab button click event", function (assert) {
			//Arrange
			this.oHeaderContainer._oItemNavigation.setFocusedIndex(0);
			this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0].focus();
			var oEvt = {
				preventDefault: function () {
				},
				target: this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0]
			};
			//Act
			this.oHeaderContainer.onsaptabprevious(oEvt);
			//Assert
			assert.notOk(this.oHeaderContainer.getDomRef() !== document.activeElement && this.oHeaderContainer.getDomRef().contains(document.activeElement), "Focus leaves away from the ScrollContainer");
			assert.equal(this.oHeaderContainer._oItemNavigation.getFocusedIndex(), 0, "The focused content index is still correct after the focus leaves away from the ScrollContainer");
		});

		QUnit.test("Focus is set to next content after the button to the right of the element was clicked", function (assert) {
			//Arrange
			this.oHeaderContainer._oItemNavigation.setFocusedIndex(0);
			this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0].focus();
			var oEvt = {
				preventDefault: function () {
				},
				stopPropagation: function () {
				},
				target: this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0]
			};
			//Act
			this.oHeaderContainer._oItemNavigation.onsapnext(oEvt);
			//Assert
			assert.deepEqual(document.activeElement, this.oHeaderContainer._oItemNavigation.getItemDomRefs()[1], "Focus is set to the next content");
			assert.equal(this.oHeaderContainer._oItemNavigation.getFocusedIndex(), 1, "Focused index of itemnavigation is updated");
		});

		QUnit.test("Focus is set to previous content after the button to the left of the element was clicked", function (assert) {
			//Arrange
			this.oHeaderContainer._oItemNavigation.setFocusedIndex(1);
			this.oHeaderContainer._oItemNavigation.getItemDomRefs()[1].focus();
			var oEvt = {
				preventDefault: function () {
				},
				stopPropagation: function () {
				},
				target: this.oHeaderContainer._oItemNavigation.getItemDomRefs()[1]
			};
			//Act
			this.oHeaderContainer._oItemNavigation.onsapprevious(oEvt);
			//Assert
			assert.deepEqual(document.activeElement, this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0], "Focus is set to the previous content");
			assert.equal(this.oHeaderContainer._oItemNavigation.getFocusedIndex(), 0, "Focused index of itemnavigation is updated");
		});

		QUnit.test("Test transparency of button", function (assert) {
			assert.equal(this.oHeaderContainer._oArrowPrev.getType(), "Transparent", "Previous button is transparent");
			assert.equal(this.oHeaderContainer._oArrowNext.getType(), "Transparent", "Next button is transparent");
		});

		QUnit.test("Internal ItemNavigation alt/meta key + right/left or cmd + right/left arrow or cmd + [] is not handled",function (assert){
			// Prepare
            var oModifiers;
            // Assert
            var oModifiers = this.oHeaderContainer._oItemNavigation.getDisabledModifiers();
            assert.ok(oModifiers["sapnext"], "sapnext has disabled modifiers");
            assert.ok(oModifiers["sapprevious"], "sapprevious has disabled modifiers");
            assert.ok(oModifiers["sapnext"].indexOf("alt") !== -1, "right is not handled when alt is pressed");
            assert.ok(oModifiers["sapnext"].indexOf("meta") !== -1, "right is not handled when meta key is pressed");
            assert.ok(oModifiers["sapprevious"].indexOf("alt") !== -1, "left is not handled when alt is pressed");
            assert.ok(oModifiers["sapprevious"].indexOf("meta") !== -1, "left is not handled when meta key is pressed");
        });

		QUnit.module("Special focus issues", {
			afterEach: function () {
				this.oHeaderContainer.destroy();
				this.oHeaderContainer = null;
			}
		});

		QUnit.module("General focus issues", {
			beforeEach: async function () {
				this.oHeaderContainer = new HeaderContainer("headerContainer", {
					content: [
						new Button({
							text: "test", press: function () {
							}
						}),
						new Button({
							text: "test", press: function () {
							}
						}),
						new Button({
							text: "test", press: function () {
							}
						})
					]
				});
				this.oHeaderContainer.placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oHeaderContainer.destroy();
				this.oHeaderContainer = null;
			}
		});

		QUnit.test("BeforeFocus Event of ItemNavigation", function (assert) {
			//Arrange
			//Act
			//Assert
			assert.ok(this.oHeaderContainer._oItemNavigation.hasListeners("BeforeFocus"), "Event handler for Event BeforeFocus has been attached.");
		});

		QUnit.test("Focus border after right button", function (assert) {
			//Arrange
			var oEvt = {
				preventDefault: function () {
				},
				target: this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0],
				getParameter: function () {
					return {target: ""};
				}
			};
			var oStub = sinon.stub(PseudoEvents.events.sapnext, "fnCheck").returns(true);
			//Act
			this.oHeaderContainer._handleBeforeFocus(oEvt);
			//Assert
			assert.notEqual(this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0].style["border-color"], "transparent", "Headercontainer border is not transparent.");
			oStub.restore();
		});

		QUnit.test("Focus border after left button", function (assert) {
			//Arrange
			var oEvt = {
				preventDefault: function () {
				},
				target: this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0],
				getParameter: function () {
					return {target: ""};
				}
			};
			var oStub = sinon.stub(PseudoEvents.events.sapprevious, "fnCheck").returns(true);
			//Act
			this.oHeaderContainer._handleBeforeFocus(oEvt);
			//Assert
			assert.notEqual(this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0].style["border-color"], "transparent", "Headercontainer border is not transparent.");
			oStub.restore();
		});

		QUnit.test("Focus border after leaving focus", function (assert) {
			//Arrange
			var oEvt = {
				preventDefault: function () {
				},
				target: jQuery("body"),
				getParameter: function () {
					return {target: ""};
				}
			};
			//Act
			this.oHeaderContainer._handleBeforeFocus(oEvt);
			//Assert
			assert.equal(this.oHeaderContainer._oItemNavigation.getItemDomRefs()[0].style["border-color"], "transparent", "Headercontainer border is transparent.");
		});

	} //End of Device.system.desktop

	QUnit.module("Padding removed when scrolling to begin and end", {
		beforeEach: async function () {
			this.oHeaderContainer = new HeaderContainer("headerContainer", {
				width: "400px",
				height: "400px",
				content: [
					new FlexBox({
						height: "120px",
						width: "320px"
					}),
					new FlexBox({
						height: "120px",
						width: "320px"
					}),
					new FlexBox({
						height: "120px",
						width: "320px"
					}),
					new FlexBox({
						height: "120px",
						width: "320px"
					})
				]
			});
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		}
	});

	QUnit.test("Left padding is removed when scrolling to left edge in horizontal layout", function (assert) {
		//Arrange
		this.oHeaderContainer._oScrollCntr.scrollTo(200, 0, 0);
		this.oHeaderContainer.$().addClass("sapMHrdrLeftPadding");
		//Act
		this.oHeaderContainer._hScroll(-200, 500);
		//Assert
		assert.notOk(this.oHeaderContainer.$().hasClass("sapMHrdrLeftPadding"), "The left padding is removed.");
	});

	QUnit.test("Right padding is removed and left padding is added, when scrolling directly from the left edge to the right edge in horizontal layout", function (assert) {
		//Arrange
		this.oHeaderContainer.$().addClass("sapMHrdrRightPadding");
		this.oHeaderContainer._oScrollCntr.getDomRef().style.width = "300px"; // set the client width smaller than scroll width so that HeaderContainer is scrollable
		//Act
		this.oHeaderContainer._hScroll(3000, 500); // a big scroll step to the end
		//Assert
		assert.notOk(this.oHeaderContainer.$().hasClass("sapMHrdrRightPadding", "The right padding is removed"));
		assert.ok(this.oHeaderContainer.$().hasClass("sapMHrdrLeftPadding", "The left padding is added"));
	});

	QUnit.test("Top padding is removed when scrolling to top edge in vertical layout", async function (assert) {
		//Arrange
		this.oHeaderContainer.setOrientation("Vertical");
		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		this.oHeaderContainer._oScrollCntr.scrollTo(0, 200, 0);
		this.oHeaderContainer.$().addClass("sapMHrdrTopPadding");
		//Act
		this.oHeaderContainer._vScroll(-200, 500);
		//Assert
		assert.notOk(this.oHeaderContainer.$().hasClass("sapMHrdrTopPadding"), "The top padding is removed");
	});

	QUnit.test("Bottom padding is removed and top padding is added, when scrolling directly from top edge to the bottom edge in vertical layout", async function (assert) {
		//Arrange
		this.oHeaderContainer.setOrientation("Vertical");
		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		this.oHeaderContainer.$().addClass("sapMHrdrBottomPadding");
		this.oHeaderContainer._oScrollCntr.getDomRef().style.height = "300px"; // set the client height smaller than scroll width so that HeaderContainer is scrollable
		//Act
		this.oHeaderContainer._vScroll(3000, 500); // a big scroll step to the bottom
		//Assert
		assert.notOk(this.oHeaderContainer.$().hasClass("sapMHrdrBottomPadding"), "The bottom padding is removed");
		assert.ok(this.oHeaderContainer.$().hasClass("sapMHrdrTopPadding"), "The top padding is added");
	});

	QUnit.module("Aggregation Handling", {
		beforeEach: async function () {
			this.oHeaderContainer = new HeaderContainer("headerContainer", {
				content: [
					new FlexBox({
						height: "120px",
						width: "320px"
					}),
					new FlexBox({
						height: "120px",
						width: "320px"
					}),
					new FlexBox({
						height: "120px",
						width: "320px"
					}),
					new FlexBox({
						height: "120px",
						width: "320px"
					})
				]
			});
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		}
	});

	QUnit.test("Overall", function (assert) {
		assert.equal(this.oHeaderContainer.getAggregation("content").length, 4, "The function should return 12 content");
		var aContent = this.oHeaderContainer.getAggregation("content");
		assert.equal(this.oHeaderContainer.indexOfAggregation("content", aContent[0]), 0, "Index of the first content aggregation should be 0");
		this.oHeaderContainer.removeAggregation("content", aContent[0], true);
		assert.equal(this.oHeaderContainer.getAggregation("content").length, 3, "There should be 11 contents now");
		this.oHeaderContainer.addAggregation("content", aContent[0], true);
		assert.equal(this.oHeaderContainer.getAggregation("content").length, 4, "There should be 12 contents now");
		this.oHeaderContainer.removeAggregation("content", aContent[0], true);
		this.oHeaderContainer.insertAggregation("content", aContent[0], 1, true);
		assert.equal(this.oHeaderContainer.getAggregation("content").length, 4, "There should be 12 kpis now");
		assert.equal(this.oHeaderContainer.indexOfAggregation("content", aContent[0]), 1, "The inserted content should be on second position now");
		assert.equal(this.oHeaderContainer._callSuperMethod("indexOfAggregation", "content", aContent[0]), 1, "The inserted kpi should be on second position now");
		this.oHeaderContainer.removeAllAggregation("content", true);
		var bContentsRemoved = false;
		if ( !this.oHeaderContainer.getAggregation("content") || this.oHeaderContainer.getAggregation("content").length == 0) {
			bContentsRemoved = true;
		}
		assert.equal(bContentsRemoved, true, "All content should be removed");
	});

	QUnit.module("Wrapping and unwrapping HeaderContainerItemContainer", {
		beforeEach: async function () {
			this.oBox0 = new FlexBox("box0");
			this.oBox1 = new FlexBox("box1");
			this.oBox2 = new FlexBox("box2");
			this.oBox3 = new FlexBox("box3");
			this.oHeaderContainer = new HeaderContainer("headerContainer", {
				content: [
					this.oBox0
				]
			});
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oBox0.destroy();
			this.oBox0 = null;
			this.oBox1.destroy();
			this.oBox1 = null;
			this.oBox2.destroy();
			this.oBox2 = null;
			this.oBox3.destroy();
			this.oBox3 = null;
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		}
	});

	QUnit.test("HeaderContainer addContent is properly overwritten", function (assert) {
		//Act
		this.oHeaderContainer.addContent(this.oBox1);
		//Assert
		assert.strictEqual(this.oHeaderContainer.getAggregation("content").length, 2, "HeaderContainer returns 2 contents also if called via getAggregation");
		assert.strictEqual(this.oHeaderContainer.getContent().length, 2, "HeaderContainer has 2 contents");
		assert.equal(this.oHeaderContainer.getAggregation("content")[0], this.oBox0, "Unwrapping has been done correctly");
		assert.equal(this.oHeaderContainer.getContent()[1], this.oBox1, "Unwrapping has been done correctly");
	});

	QUnit.test("HeaderContainer destroyContent is properly overwritten", function (assert) {
		//Arrange
		var sContentId = this.oBox1.getId();
		this.oHeaderContainer.addContent(this.oBox1);
		//Act
		this.oHeaderContainer.destroyContent();
		//Assert
		assert.strictEqual(this.oHeaderContainer.getContent().length, 0, "Content aggregation has been removed");
		assert.notOk(Element.getElementById(sContentId), "The content control has been destroyed");
	});

	QUnit.test("HeaderContainer removeContent is properly overwritten", function (assert) {
		//Arrange
		this.oHeaderContainer.addContent(this.oBox1);
		this.oHeaderContainer.addContent(this.oBox2);
		//Act
		var oRemovedContent = this.oHeaderContainer.removeContent(this.oBox1);
		//Assert
		assert.strictEqual(this.oHeaderContainer.getContent().length, 2, "Content has been properly removed from the HeaderContainer");
		assert.strictEqual(this.oBox1, oRemovedContent, "Correct content has been returned from the removeAggregation");
		assert.strictEqual(this.oHeaderContainer.indexOfContent(this.oBox1), -1, "Content has been deleted from aggregation ");
	});

	QUnit.test("HeaderContainer removeAllContent is properly overwritten", async function (assert) {
		//Arrange
		this.oHeaderContainer.addContent(this.oBox1);
		this.oHeaderContainer.addContent(this.oBox2);
		await nextUIUpdate();
		//Act
		var aRemovedContent = this.oHeaderContainer.removeAllContent();
		//Assert
		assert.strictEqual(this.oHeaderContainer.getContent().length, 0, "Content aggregation has been removed from the HeaderContainer");
		assert.strictEqual(aRemovedContent.length, 3, "Content aggregation has been removed from the HeaderContainer");
		assert.strictEqual(this.oBox1, aRemovedContent[1], "Correct content has been returned from the removeAggregation");
		assert.strictEqual(this.oHeaderContainer.indexOfContent(this.oBox1), -1, "Content has been deleted from aggregation ");
		assert.strictEqual(this.oHeaderContainer.indexOfContent(this.oBox2), -1, "Content has been deleted from aggregation ");
	});

	QUnit.test("HeaderContainer insertContent is properly overwritten", function (assert) {
		//Arrange
		var sContentId = this.oBox3.getId();
		this.oHeaderContainer.addContent(this.oBox1);
		this.oHeaderContainer.addContent(this.oBox2);
		//Act
		this.oHeaderContainer.insertContent(this.oBox3, 1);
		//Assert
		assert.strictEqual(this.oHeaderContainer.getContent()[1].getId(), sContentId, "The control has been inserted on correct place");
	});

	QUnit.test("HeaderContainer indexOfContent is properly overwritten", function (assert) {
		//Arrange
		this.oHeaderContainer.addContent(this.oBox1);
		this.oHeaderContainer.addContent(this.oBox2);
		this.oHeaderContainer.addContent(this.oBox3);
		//Act
		var iIndexOfContent = this.oHeaderContainer.indexOfContent(this.oBox3);
		//Assert
		assert.strictEqual(iIndexOfContent, 3, "The correct index of the content has been returned");
	});

	QUnit.module("Rendering of Left and Right Arrow Indicators for Mobile Devices", {
		beforeEach: async function () {
			Device.system.phone = true;
			Device.system.desktop = false;
			this.oHeaderContainer = new HeaderContainer("headerContainer");
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			Device.system.phone = false;
			Device.system.desktop = true;
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		}
	});

	QUnit.test("Left and right indicators are created on mobile devices", function (assert) {
		//Act
		var bIsLeftIcon = this.oHeaderContainer.getAggregation("_prevButton") instanceof Icon;
		var bIsRightIcon = this.oHeaderContainer.getAggregation("_nextButton") instanceof Icon;
		//Assert
		assert.ok(bIsLeftIcon, "Left arrow indicator is rendered on mobile devices");
		assert.ok(bIsRightIcon, "Right arrow indicator is rendered on mobile devices");
	});

	QUnit.test("Left and right indicators are hidden on Mobile Devices for an empty Header Container with Hotizontal Orientation", function (assert) {
		//Arrange
		this.oHeaderContainer.setOrientation("Horizontal");
		//Act
		var leftArrowOffsetWidth = this.oHeaderContainer.getDomRef("prev-button-container").offsetWidth;
		var leftArrowOffsetHeight = this.oHeaderContainer.getDomRef("prev-button-container").offsetHeight;
		var isLeftArrowVisible = false;
		if (leftArrowOffsetWidth > 0 && leftArrowOffsetHeight > 0) {
			isLeftArrowVisible = true;
		} else {
			isLeftArrowVisible = false;
		}
		var rightArrowOffsetWidth = this.oHeaderContainer.getDomRef("next-button-container").offsetWidth;
		var rightArrowOffsetHeight = this.oHeaderContainer.getDomRef("next-button-container").offsetHeight;
		var isRightArrowVisible = false;
		if (rightArrowOffsetWidth > 0 && rightArrowOffsetHeight > 0) {
			isRightArrowVisible = true;
		} else {
			isRightArrowVisible = false;
		}
		//Assert
		assert.notOk(isLeftArrowVisible,"Left arrow indicator is hidden on mobile devices");
		assert.notOk(isRightArrowVisible,"Right arrow indicator is hidden on mobile devices");
	});

	QUnit.test("Left and right indicators are hidden on Mobile Devices for an empty Header Container with Vertical Orientation", function (assert) {
		//Arrange
		this.oHeaderContainer.setOrientation("Vertical");
		//Act
		var leftArrowOffsetWidth = this.oHeaderContainer.getDomRef("prev-button-container").offsetWidth;
		var leftArrowOffsetHeight = this.oHeaderContainer.getDomRef("prev-button-container").offsetHeight;
		var isLeftArrowVisible = false;
		if (leftArrowOffsetWidth > 0 && leftArrowOffsetHeight > 0) {
			isLeftArrowVisible = true;
		} else {
			isLeftArrowVisible = false;
		}
		var rightArrowOffsetWidth = this.oHeaderContainer.getDomRef("next-button-container").offsetWidth;
		var rightArrowOffsetHeight = this.oHeaderContainer.getDomRef("next-button-container").offsetHeight;
		var isRightArrowVisible = false;
		if (rightArrowOffsetWidth > 0 && rightArrowOffsetHeight > 0) {
			isRightArrowVisible = true;
		} else {
			isRightArrowVisible = false;
		}
		//Assert
		assert.notOk(isLeftArrowVisible,"Left arrow indicator is hidden on mobile devices");
		assert.notOk(isRightArrowVisible,"Right arrow indicator is hidden on mobile devices");
	});

	QUnit.module("Rendering of Left and Right Arrow Indicators for Desktop Devices", {
		beforeEach: async function () {
			this.oHeaderContainer = new HeaderContainer("headerContainer");
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		}
	});

	QUnit.test("Left and right arrow buttons are created on desktop", function (assert) {
		//Act
		var bIsLeftButton = this.oHeaderContainer.getAggregation("_prevButton") instanceof Button;
		var bIsRightButton = this.oHeaderContainer.getAggregation("_nextButton") instanceof Button;
		//Assert
		assert.ok(bIsLeftButton, "Arrow buttons are rendered on desktop");
		assert.ok(bIsRightButton, "Arrow buttons are rendered on desktop");
	});

	QUnit.test("Left and Right arrow buttons are hidden on Desktop for an empty Header Container with Hotizontal Orientation", function (assert) {
		//Arrange
		this.oHeaderContainer.setOrientation("Horizontal");
		//Act
		var leftArrowOffsetWidth = this.oHeaderContainer.getDomRef("prev-button-container").offsetWidth;
		var leftArrowOffsetHeight = this.oHeaderContainer.getDomRef("prev-button-container").offsetHeight;
		var isLeftArrowVisible = false;
		if (leftArrowOffsetWidth > 0 && leftArrowOffsetHeight > 0) {
			isLeftArrowVisible = true;
		} else {
			isLeftArrowVisible = false;
		}
		var rightArrowOffsetWidth = this.oHeaderContainer.getDomRef("next-button-container").offsetWidth;
		var rightArrowOffsetHeight = this.oHeaderContainer.getDomRef("next-button-container").offsetHeight;
		var isRightArrowVisible = false;
		if (rightArrowOffsetWidth > 0 && rightArrowOffsetHeight > 0) {
			isRightArrowVisible = true;
		} else {
			isRightArrowVisible = false;
		}
		//Assert
		assert.notOk(isLeftArrowVisible,"Left arrow indicator is hidden on Desktop devices");
		assert.notOk(isRightArrowVisible,"Right arrow indicator is hidden on Desktop devices");
	});

	QUnit.test("Left and Right arrow buttons are hidden on Desktop for an empty Header Container with Vertical Orientation", function (assert) {
		//Arrange
		this.oHeaderContainer.setOrientation("Vertical");
		//Act
		var leftArrowOffsetWidth = this.oHeaderContainer.getDomRef("prev-button-container").offsetWidth;
		var leftArrowOffsetHeight = this.oHeaderContainer.getDomRef("prev-button-container").offsetHeight;
		var isLeftArrowVisible = false;
		if (leftArrowOffsetWidth > 0 && leftArrowOffsetHeight > 0) {
			isLeftArrowVisible = true;
		} else {
			isLeftArrowVisible = false;
		}
		var rightArrowOffsetWidth = this.oHeaderContainer.getDomRef("next-button-container").offsetWidth;
		var rightArrowOffsetHeight = this.oHeaderContainer.getDomRef("next-button-container").offsetHeight;
		var isRightArrowVisible = false;
		if (rightArrowOffsetWidth > 0 && rightArrowOffsetHeight > 0) {
			isRightArrowVisible = true;
		} else {
			isRightArrowVisible = false;
		}
		//Assert
		assert.notOk(isLeftArrowVisible,"Left arrow indicator is hidden on Desktop devices");
		assert.notOk(isRightArrowVisible,"Right arrow indicator is hidden on Desktop devices");
	});

	QUnit.module("Aria handling", {
		beforeEach: async function () {
			this.oHeaderContainer = new HeaderContainer("headerContainer");
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		}
	});

	QUnit.test("aria-setsize & aria-posinset", async function (assert) {
		var iCount = 5,
			i;

		for (i = 0; i < iCount; i++) {
			this.oHeaderContainer.addContent(new Text());
		}

		await nextUIUpdate();

		var $items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");

		for (i = 0; i < iCount; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1);
			assert.equal($items.eq(i).attr("aria-setsize"), iCount);
		}
		assert.equal(this.oHeaderContainer.mAggregations._scrollContainer.mAggregations.content[1].getDomRef().tabIndex, "-1", "-1 is the tabIndex for the content of HeaderContainer");
	});

	QUnit.test("aria-ariaLabelledBy", async function (assert) {
		var aTexts = [],
			iCount = 5,
			i;

		for (i = 0; i < iCount; i++) {
			aTexts.push(new Text());
			this.oHeaderContainer.addAriaLabelledBy(aTexts[i]);
			this.oHeaderContainer.addContent(new Text());
		}

		await nextUIUpdate();

		var $items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");

		for (i = 0; i < iCount; i++) {
			assert.equal($items.eq(i).attr("aria-labelledby"), aTexts[i].getId());
		}
	});

	QUnit.test("aria-setsize & aria-posinset for hidden elements", async function (assert) {
		var iCount = 10, i, bVisible;

		for (i = 0; i < iCount; i++) {
			bVisible = true;
			if (i % 2 == 0) {
				bVisible = false;
			}
			this.oHeaderContainer.addContent(new Label({
				text: "test",
				visible: bVisible
			}));
		}

		await nextUIUpdate();

		var $items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");

		assert.equal(this.oHeaderContainer.getContent().length, iCount, "Number of elements added to the HeaderContainer is " + iCount);
		assert.ok($items.length, "Number of Visible elements added to the HeaderContainer is " + $items.length);

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}
	});

	QUnit.module("Handle deleted HeaderContainer Contents", {
		beforeEach: async function () {
			this.oHeaderContainer = new HeaderContainer("headerContainer");
			this.oHeaderContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oHeaderContainer.destroy();
			this.oHeaderContainer = null;
		}
	});

	QUnit.test("Content deleted at the beginning.", async function (assert) {
		var iCount = 5,
			i;

		for (i = 0; i < iCount; i++) {
			this.oHeaderContainer.addContent(new Text("testID" + i));
		}

		await nextUIUpdate();

		var $items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is 5");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

		Element.getElementById("testID0").destroy();

		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		$items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is reduced by 1");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

		Element.getElementById("testID1").destroy();

		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		$items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is reduced by 2");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

		Element.getElementById("testID2").destroy();

		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		$items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is reduced by 3");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

	});

	QUnit.test("Content deleted at the end.", async function (assert) {
		var iCount = 5,
			i;

		for (i = 0; i < iCount; i++) {
			this.oHeaderContainer.addContent(new Text("testID" + i));
		}

		await nextUIUpdate();

		var $items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is 5");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

		Element.getElementById("testID4").destroy();

		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		$items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is reduced by 1");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

		Element.getElementById("testID3").destroy();

		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		$items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is reduced by 2");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

		Element.getElementById("testID2").destroy();

		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		$items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is reduced by 3");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

	});

	QUnit.test("Content deleted at Random.", async function (assert) {
		var iCount = 5,
			i;

		for (i = 0; i < iCount; i++) {
			this.oHeaderContainer.addContent(new Text("testID" + i));
		}

		await nextUIUpdate();

		var $items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is 5");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

		Element.getElementById("testID0").destroy();

		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		$items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is reduced by 1");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

		Element.getElementById("testID2").destroy();

		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		$items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is reduced by 2");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

		Element.getElementById("testID4").destroy();

		this.oHeaderContainer.invalidate();
		await nextUIUpdate();

		$items = this.oHeaderContainer.$().find(".sapMHrdrCntrInner");
		assert.equal($items.length, this.oHeaderContainer.getContent().length, "Length of the Header Container Contents is reduced by 3");

		for (i = 0; i < $items.length; i++) {
			assert.equal($items.eq(i).attr("aria-posinset"), i + 1,  "aria-posinset is " + (i + 1));
			assert.equal($items.eq(i).attr("aria-setsize"), $items.length, "aria-setsize is " + $items.length );
		}

	});

	QUnit.module("HeaderContainer in Mobile View", {
		afterEach: function () {
			if (this.oHeaderContainer) {
				this.oHeaderContainer.destroy();
				this.oHeaderContainer = null;
			}
			if (this.initialScreenWidth && this.initialWidth) {
				this.resetMobileView();
			}
		},
		initializeMobileView: function(iScreenWidth) {
			this.initialScreenWidth = Device.resize.width;
			this.initialWidth = document.getElementById("qunit-fixture").offsetWidth;
			Device.resize.width = iScreenWidth;
			document.getElementById("qunit-fixture").style.width = iScreenWidth + "px";
			Device.system.desktop = false;
			Device.system.phone = true;
			document.querySelector("html").classList.add("sap-phone");
			document.querySelector("html").classList.remove("sap-desktop");
		},
		resetMobileView: function(){
			Device.resize.width = this.initialScreenWidth;
			document.getElementById("qunit-fixture").style.width = this.initialWidth;
			Device.system.desktop = true;
			Device.system.phone = false;
			document.querySelector("html").classList.remove("sap-phone");
			document.querySelector("html").classList.add("sap-desktop");
		}
	});

	QUnit.test("HeaderContainer in Normal View initialization.", async function (assert) {

		var fnDone = assert.async(),
			iCount = 5,
			i;
			this.oHeaderContainer = new HeaderContainer({
				gridLayout: true,
				orientation: Orientation.Horizontal,
				showDividers: false,
				scrollTime: 1000
			});
			var afterRenderDelegate = {
				onAfterRendering: function () {
					var rightArrowOffsetWidth = this.oHeaderContainer.getDomRef("next-button-container").offsetWidth;
					var rightArrowOffsetHeight = this.oHeaderContainer.getDomRef("next-button-container").offsetHeight;
					var isRightArrowVisible = false;
					if (rightArrowOffsetWidth > 0 && rightArrowOffsetHeight > 0) {
						isRightArrowVisible = true;
					}
					assert.ok(this.oHeaderContainer._oArrowPrev,  "Previous Arrow is present.");
					assert.ok(this.oHeaderContainer._oArrowNext,  "Next Arrow is present.");
					assert.ok(isRightArrowVisible,"Right arrow indicator is not hidden.");
					assert.equal(this.oHeaderContainer.getGridLayout(), true,  "Property gridLayout is true.");
					assert.equal(this.oHeaderContainer.getOrientation(), Orientation.Horizontal,  "Orientation is Hotizontal.");
					assert.equal(Device.resize.width >= ScreenSizes.xsmall, true,  "Large screen size.");
					this.oHeaderContainer.removeEventDelegate(afterRenderDelegate);
					fnDone();
				}.bind(this)
			};
		this.oHeaderContainer.addEventDelegate(afterRenderDelegate);
		for (i = 0; i < iCount; i++) {
			this.oHeaderContainer.addContent(new Panel({
				width: "272px",
				content: createTile()
			}));
		}
		this.oHeaderContainer.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("HeaderContainer in Mobile View initialization.", async function (assert) {
		var fnDone = assert.async(),
			iCount = 5,
			i;

		this.initializeMobileView(320);
		this.oHeaderContainer = new HeaderContainer({
			gridLayout: true,
			orientation: Orientation.Horizontal,
			showDividers: false,
			scrollTime: 1000
		});
		var afterRenderDelegate = {
			onAfterRendering: function () {
				var leftArrowOffsetWidth = this.oHeaderContainer.getDomRef("prev-button-container").offsetWidth;
				var leftArrowOffsetHeight = this.oHeaderContainer.getDomRef("prev-button-container").offsetHeight;
				var isLeftArrowVisible = false;
				if (leftArrowOffsetWidth > 0 && leftArrowOffsetHeight > 0) {
					isLeftArrowVisible = true;
				} else {
					isLeftArrowVisible = false;
				}
				var rightArrowOffsetWidth = this.oHeaderContainer.getDomRef("next-button-container").offsetWidth;
				var rightArrowOffsetHeight = this.oHeaderContainer.getDomRef("next-button-container").offsetHeight;
				var isRightArrowVisible = false;
				if (rightArrowOffsetWidth > 0 && rightArrowOffsetHeight > 0) {
					isRightArrowVisible = true;
				} else {
					isRightArrowVisible = false;
				}

				assert.ok(this.oHeaderContainer._oArrowPrev, "Previous Arrow is present.");
				assert.ok(this.oHeaderContainer._oArrowNext, "Next Arrow is present.");
				if (!isLeftArrowVisible && !isRightArrowVisible) {
					assert.notOk(isLeftArrowVisible,"Left arrow indicator is hidden on mobile devices");
					assert.notOk(isRightArrowVisible,"Right arrow indicator is hidden on mobile devices");
				}
				assert.equal(this.oHeaderContainer.getGridLayout(), true,  "Property gridLayout is true.");
				assert.equal(this.oHeaderContainer.getOrientation(), Orientation.Horizontal,  "Orientation is Hotizontal.");
				assert.equal(Device.resize.width >= ScreenSizes.xsmall && Device.resize.width < ScreenSizes.tablet, true,  "Screen size is Mobilee.");
				assert.equal(this.oHeaderContainer._isMobileView(), true,  "Method returns true.");
				assert.equal(this.oHeaderContainer._oScrollCntr.aBindParameters[0].sEventType, "scrollstart", "scrollstart Event is bound.");
				assert.equal(this.oHeaderContainer._oScrollCntr.aBindParameters[1].sEventType, "scrollstop", "scrollstop Event is bound.");
				this.oHeaderContainer.removeEventDelegate(afterRenderDelegate);
				fnDone();
			}.bind(this)
		};
		this.oHeaderContainer.addEventDelegate(afterRenderDelegate);
		for (i = 0; i < iCount; i++) {
			this.oHeaderContainer.addContent(new Panel({
				width: "272px",
				content: createTile()
			}));
		}
		this.oHeaderContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

	});

	QUnit.test("HeaderContainer in Mobile View initialization-ScreenSize 420.", async function (assert) {
		var fnDone = assert.async(),
			iCount = 5,
			i;

		this.initializeMobileView(420);
		this.oHeaderContainer = new HeaderContainer({
			gridLayout: true,
			orientation: Orientation.Horizontal,
			showDividers: false,
			scrollTime: 1000
		});
		var afterRenderDelegate = {
			onAfterRendering: function () {
				var leftArrowOffsetWidth = this.oHeaderContainer.getDomRef("prev-button-container").offsetWidth;
				var leftArrowOffsetHeight = this.oHeaderContainer.getDomRef("prev-button-container").offsetHeight;
				var isLeftArrowVisible = false;
				if (leftArrowOffsetWidth > 0 && leftArrowOffsetHeight > 0) {
					isLeftArrowVisible = true;
				} else {
					isLeftArrowVisible = false;
				}
				var rightArrowOffsetWidth = this.oHeaderContainer.getDomRef("next-button-container").offsetWidth;
				var rightArrowOffsetHeight = this.oHeaderContainer.getDomRef("next-button-container").offsetHeight;
				var isRightArrowVisible = false;
				if (rightArrowOffsetWidth > 0 && rightArrowOffsetHeight > 0) {
					isRightArrowVisible = true;
				} else {
					isRightArrowVisible = false;
				}

				assert.ok(this.oHeaderContainer._oArrowPrev, "Previous Arrow is present.");
				assert.ok(this.oHeaderContainer._oArrowNext, "Next Arrow is present.");
				if (!isLeftArrowVisible && !isRightArrowVisible) {
					assert.notOk(isLeftArrowVisible,"Left arrow indicator is hidden on mobile devices");
					assert.notOk(isRightArrowVisible,"Right arrow indicator is hidden on mobile devices");
				}
				assert.equal(this.oHeaderContainer.getGridLayout(), true,  "Property gridLayout is true.");
				assert.equal(this.oHeaderContainer.getOrientation(), Orientation.Horizontal,  "Orientation is Hotizontal.");
				assert.equal(Device.resize.width >= ScreenSizes.xsmall && Device.resize.width < ScreenSizes.tablet, true,  "Screen size is Mobilee.");
				assert.equal(this.oHeaderContainer._isMobileView(), true,  "Method returns true.");
				assert.equal(this.oHeaderContainer._oScrollCntr.aBindParameters[0].sEventType, "scrollstart", "scrollstart Event is bound.");
				assert.equal(this.oHeaderContainer._oScrollCntr.aBindParameters[1].sEventType, "scrollstop", "scrollstop Event is bound.");
				assert.notOk(bIsFinalItemVisible , "Final item is not visible.");

				this.oHeaderContainer._oScrollCntr.scrollTo(1100);
				var aItems = this.oHeaderContainer._filterVisibleItems();
				var oFinalItem = aItems[aItems.length - 1];
				var iScrollContainerScrollLeft = this.oHeaderContainer._oScrollCntr.getDomRef().scrollLeft;
				var iScrollContainerWidth = iScrollContainerScrollLeft + this.oHeaderContainer._oScrollCntr.getDomRef().clientWidth;
				var oFinalItem = aItems[aItems.length - 1];
				var iFinalElementScrollLeft = oFinalItem.getParent().getDomRef().offsetLeft;
				var iFinalElementContainerWidth = iFinalElementScrollLeft + oFinalItem.getDomRef().clientWidth;
				var bIsFinalItemVisible = ((iFinalElementContainerWidth <= iScrollContainerWidth) && (iFinalElementScrollLeft >= iScrollContainerScrollLeft));

				assert.ok(bIsFinalItemVisible , "Final item is visible.");

				this.oHeaderContainer.removeEventDelegate(afterRenderDelegate);
				fnDone();
			}.bind(this)
		};
		this.oHeaderContainer.addEventDelegate(afterRenderDelegate);
		for (i = 0; i < iCount; i++) {
			this.oHeaderContainer.addContent(new Panel({
				width: "272px",
				content: createTile()
			}));
		}
		this.oHeaderContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

	});
	QUnit.module("HeaderContainer with snapToRow enabled", {
		beforeEach: async function () {
			this.oHeaderContainer = new HeaderContainer({
				gridLayout: true,
				orientation: Orientation.Horizontal,
				showDividers: false,
				scrollTime: 1000,
				snapToRow: true,
				content: createTile()
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			if (this.oHeaderContainer) {
				this.oHeaderContainer.destroy();
				this.oHeaderContainer = null;
			}
		}
	});

	QUnit.test("Min-Height of the tile to be set as 100%",function (assert) {
		var oGenericTile = this.oHeaderContainer.getContent()[0];
		assert.equal(getComputedStyle(oGenericTile.getDomRef()).minHeight,"100%","min-height has been set to 100%");
	});
	QUnit.module("HeaderContainer with RTL", {
		beforeEach: async function () {
		Localization.setRTL(true);
		await nextUIUpdate();
		this.initializeMobileView(320);
		this.oHeaderContainer = new HeaderContainer({
			gridLayout: true,
			orientation: Orientation.Horizontal,
			showDividers: false,
			scrollTime: 1000
		});
		},
		afterEach: async function () {
			if (this.oHeaderContainer) {
				this.oHeaderContainer.destroy();
				this.oHeaderContainer = null;
			}
			if (this.initialScreenWidth && this.initialWidth) {
				this.resetMobileView();
			}
			Localization.setRTL(false);
			await nextUIUpdate();
		},
		initializeMobileView: function(iScreenWidth) {
			this.initialScreenWidth = Device.resize.width;
			this.initialWidth = document.getElementById("qunit-fixture").offsetWidth;
			Device.resize.width = iScreenWidth;
			document.getElementById("qunit-fixture").style.width = iScreenWidth + "px";
			Device.system.desktop = false;
			Device.system.phone = true;
			document.querySelector("html").classList.add("sap-phone");
			document.querySelector("html").classList.remove("sap-desktop");
		},
		resetMobileView: function(){
			Device.resize.width = this.initialScreenWidth;
			document.getElementById("qunit-fixture").style.width = this.initialWidth;
			Device.system.desktop = true;
			Device.system.phone = false;
			document.querySelector("html").classList.remove("sap-phone");
			document.querySelector("html").classList.add("sap-desktop");
		}
	});
	QUnit.test("HeaderContainer in Mobile View initialization in RTL Mode.", async function (assert) {
		var fnDone = assert.async(),
			iCount = 5,
			i;
		var afterRenderDelegate = {
			onAfterRendering: function () {
				var leftArrowOffsetWidth = this.oHeaderContainer.getDomRef("prev-button-container").offsetWidth;
				var leftArrowOffsetHeight = this.oHeaderContainer.getDomRef("prev-button-container").offsetHeight;
				var isLeftArrowVisible = false;
				if (leftArrowOffsetWidth > 0 && leftArrowOffsetHeight > 0) {
					isLeftArrowVisible = true;
				} else {
					isLeftArrowVisible = false;
				}
				var rightArrowOffsetWidth = this.oHeaderContainer.getDomRef("next-button-container").offsetWidth;
				var rightArrowOffsetHeight = this.oHeaderContainer.getDomRef("next-button-container").offsetHeight;
				var isRightArrowVisible = false;
				if (rightArrowOffsetWidth > 0 && rightArrowOffsetHeight > 0) {
					isRightArrowVisible = true;
				} else {
					isRightArrowVisible = false;
				}

				assert.ok(this.oHeaderContainer._oArrowPrev, "Previous Arrow is present.");
				assert.ok(this.oHeaderContainer._oArrowNext, "Next Arrow is present.");
				if (!isLeftArrowVisible && !isRightArrowVisible) {
					assert.notOk(isLeftArrowVisible,"Left arrow indicator is hidden on mobile devices");
					assert.notOk(isRightArrowVisible,"Right arrow indicator is hidden on mobile devices");
				}
				assert.equal(this.oHeaderContainer.getGridLayout(), true,  "Property gridLayout is true.");
				assert.equal(this.oHeaderContainer.getOrientation(), Orientation.Horizontal,  "Orientation is Hotizontal.");
				assert.equal(Device.resize.width >= ScreenSizes.xsmall && Device.resize.width < ScreenSizes.tablet, true,  "Screen size is Mobilee.");
				assert.equal(this.oHeaderContainer._isMobileView(), true,  "Method returns true.");
				assert.equal(this.oHeaderContainer._oScrollCntr.aBindParameters[0].sEventType, "scrollstart", "scrollstart Event is bound.");
				assert.equal(this.oHeaderContainer._oScrollCntr.aBindParameters[1].sEventType, "scrollstop", "scrollstop Event is bound.");
				this.oHeaderContainer.removeEventDelegate(afterRenderDelegate);
				fnDone();
			}.bind(this)
		};
		this.oHeaderContainer.addEventDelegate(afterRenderDelegate);
		for (i = 0; i < iCount; i++) {
			this.oHeaderContainer.addContent(new Panel({
				width: "272px",
				content: createTile()
			}));
		}
		this.oHeaderContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

	});

	function createTile(){
		var aTile = [];
		for (var i = 0; i < 5 ; i++){
			aTile.push(new GenericTile({
				mode: "IconMode",
				sizeBehavior: "Small",
				header: "title" + i,
				backgroundColor: "blue" ,
				tileIcon: "sap-icon://home-share" ,
				frameType: "TwoByHalf",
				width: "14.875rem"
			}));
		}
		return aTile;
	}
});