/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/rta/toolbar/ChangeIndicator",
	"sap/ui/rta/toolbar/ChangeVisualization",
	"sap/m/Popover",
	"sap/ui/core/Fragment",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/core/Control",
	"sap/ui/core/format/DateFormat"
],
function(
	sinon,
	ChangeIndicator,
	ChangeVisualization,
	Popover,
	Fragment,
	OverlayRegistry,
	Control,
	DateFormat

) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("ChangeVisualization", {
		beforeEach: function() {
			this.oChangeIndicator = new ChangeIndicator({
				changes: [],
				mode: "change",
				parentId: "qunit-fixture"
			});
		},
		afterEach: function() {
			this.oChangeIndicator.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("init", function(assert) {
			var oText = this.oChangeIndicator.getAggregation("_text");
			var oIcon = this.oChangeIndicator.getAggregation("_icon");
			assert.ok(oText, "the text was initialized");
			assert.equal(oText.getText(), this.oChangeIndicator.getChanges().length, "the text is set to the count");
			assert.ok(oText.hasStyleClass("sapUiRtaChangeIndicatorText"), "the text has the correct style class");
			assert.ok(oIcon, "the icon was initialized");
			assert.ok(!oIcon.getVisible(), "the icon is not visible");
			assert.equal(oIcon.getSrc(), "sap-icon://display", "the icon has the correct source");
			assert.ok(oIcon.hasStyleClass("sapUiRtaChangeIndicatorIcon"), "the icon got the correct style class");
		});

		QUnit.test("addChange", function(assert) {
			var oChange = {};
			this.oChangeIndicator.addChange(oChange);
			assert.equal(this.oChangeIndicator.getAggregation("_text").getText(), this.oChangeIndicator.getChanges().length, "the text is set to the count");
			assert.equal(this.oChangeIndicator.getChanges().pop(), oChange, "the change was pushed into the array");
		});

		QUnit.test("renderer", function(assert) {
			var done = assert.async();
			this.oChangeIndicator.onAfterRendering = function() {
				var oElement = document.getElementById(this.oChangeIndicator.sId);
				assert.equal(oElement.tagName, "DIV", "the change indicator has the correct tag name");
				assert.ok(oElement.classList.contains("sapUiRtaChangeIndicator"), "the change indicator has the correct style class");
				assert.ok(oElement.classList.contains("sapUiRtaChangeIndicator-" + this.oChangeIndicator.getMode()));
				var oChild = oElement.firstChild;
				assert.ok(oChild, "the change indicator has a child element");
				assert.equal(oChild.tagName, "DIV", "the child has the correct tag name");
				assert.equal(oChild.children.length, 1, "the change indicator has an icon");
				done();
			}.bind(this);
			this.oChangeIndicator.placeAt("qunit-fixture");
		});

		QUnit.test("renderer when there are multiple changes on the change indicator", function(assert) {
			var done = assert.async();
			this.oChangeIndicator.setChanges([{}, {}]);
			this.oChangeIndicator.onAfterRendering = function() {
				var oElement = document.getElementById(this.oChangeIndicator.sId);
				assert.equal(oElement.tagName, "DIV", "the change indicator has the correct tag name");
				assert.ok(oElement.classList.contains("sapUiRtaChangeIndicator"), "the change indicator has the correct style class");
				assert.ok(oElement.classList.contains("sapUiRtaChangeIndicator-" + this.oChangeIndicator.getMode()));
				var oChild = oElement.firstChild;
				assert.ok(oChild, "the change indicator has a child element");
				assert.equal(oChild.tagName, "DIV", "the child has the correct tag name");
				assert.equal(oChild.children.length, 2, "the change indicator has an icon and a text");
				done();
			}.bind(this);
			this.oChangeIndicator.placeAt("qunit-fixture");
		});

		QUnit.test("onAfterRendering when the change indicator has maximum size", function(assert) {
			var done = assert.async();
			var oControl = document.createElement("div");
			oControl.id = "testControl";
			this.oChangeIndicator.setParentId(oControl.id);
			document.getElementById("qunit-fixture").appendChild(oControl);
			oControl.style.width = "100px";
			oControl.style.height = "100px";
			var fnOnAfterRendering = this.oChangeIndicator.onAfterRendering.bind(this.oChangeIndicator);
			this.oChangeIndicator.onAfterRendering = function() {
				this.oChangeIndicator.onAfterRendering = function() {};
				var oElement = document.getElementById(this.oChangeIndicator.sId);
				fnOnAfterRendering();
				for (var oChild in oControl.children) {
					if (oChild === oElement) {
						assert.ok(true, "the change indicator was added to its correct parent");
						break;
					}
				}
				var sTextSize = null;
				if (this.oChangeIndicator.getAggregation("_text").getDomRef()) {
					sTextSize = this.oChangeIndicator.getAggregation("_text").getDomRef().style.fontSize;
				}
				var sIconSize = null;
				if (this.oChangeIndicator.getAggregation("_icon").getDomRef()) {
					sIconSize = this.oChangeIndicator.getAggregation("_icon").getDomRef().style.fontSize;
				}
				assert.equal(oElement.style.width, "48px", "the change indicator has the correct width");
				assert.equal(oElement.style.height, "48px", "the change indicator has the correct height");
				assert.equal(null, sTextSize, "the text font size did not change");
				assert.equal(null, sIconSize, "the icon font size did not change");
				// Missing assertion: How can I test if a browser event has been attached?
				done();
			}.bind(this);
			this.oChangeIndicator.placeAt("qunit-fixture");
		});

		QUnit.test("onAfterRendering when the change indicator keeps its size", function(assert) {
			var done = assert.async();
			this.oChangeIndicator.setChanges([{}, {}]);
			this.oChangeIndicator.getAggregation("_icon").setVisible(true);
			var oControl = document.createElement("div");
			oControl.id = "testControl2";
			this.oChangeIndicator.setParentId(oControl.id);
			document.getElementById("qunit-fixture").appendChild(oControl);
			oControl.style.width = "25px";
			oControl.style.height = "25px";
			var fnOnAfterRendering = this.oChangeIndicator.onAfterRendering.bind(this.oChangeIndicator);
			this.oChangeIndicator.onAfterRendering = function() {
				var oElement = document.getElementById(this.oChangeIndicator.sId);
				fnOnAfterRendering();
				for (var oChild in oControl.children) {
					if (oChild === oElement) {
						assert.ok(true, "the change indicator was added to its correct parent");
						break;
					}
				}
				var sTextSize = null;
				if (this.oChangeIndicator.getAggregation("_text").getDomRef()) {
					sTextSize = this.oChangeIndicator.getAggregation("_text").getDomRef().style.fontSize;
				}
				var sIconSize = null;
				if (this.oChangeIndicator.getAggregation("_icon").getDomRef()) {
					sIconSize = this.oChangeIndicator.getAggregation("_icon").getDomRef().style.fontSize;
				}
				assert.equal(oElement.style.width, "23px", "the change indicator has the correct width");
				assert.equal(oElement.style.height, "23px", "the change indicator has the correct height");
				assert.notEqual(null, sTextSize, "the text font size changed");
				assert.notEqual(null, sIconSize, "the icon font size changed");
				// Missing assertion: How can I test if a browser event has been attached?
				done();
			}.bind(this);
			this.oChangeIndicator.placeAt("qunit-fixture");
		});

		QUnit.test("remove", function(assert) {
			var oRemoveDependentElementsStub = sandbox.stub(this.oChangeIndicator, "remove");
			var sPrefix = "";
			if (!document.getElementById(this.oChangeIndicator.sId)) {
				sPrefix = "sap-ui-invisible-";
			}
			this.oChangeIndicator.remove();
			assert.ok(!document.getElementById(sPrefix + this.sId), "the change indicator was removed from screen");
			assert.equal(oRemoveDependentElementsStub.callCount, 1, "the dependent elements are removed");
		});

		QUnit.test("hide", function(assert) {
			this.oChangeIndicator.hide();
			assert.ok(!this.oChangeIndicator.getVisible(), "the change indicator is not visible");
		});

		QUnit.test("reveal", function(assert) {
			this.oChangeIndicator.reveal();
			assert.ok(this.oChangeIndicator.getVisible(), "the change indicator is visible");
		});

		QUnit.test("showDependentElements when the dependent change indicator has the same parent and there is a single change", function(assert) {
			this.oChangeIndicator.hideChangeIndicators = ChangeVisualization.hideChangeIndicators.bind(ChangeVisualization);
			this.oChangeIndicator.createChangeIndicator = function(oChange) {
				return new ChangeIndicator({
					mode: "dependent",
					parentId: "qunit-fixture",
					changes: [oChange],
					count: 1
				});
			};
			this.oChangeIndicator.getChangedElements = ChangeVisualization.getChangedElements.bind(ChangeVisualization);
			var oHideChangeIndicatorsStub = sandbox.stub(this.oChangeIndicator, "hideChangeIndicators");
			var oRevealStub = sandbox.stub(this.oChangeIndicator, "reveal");
			var aChanges = [{}];
			this.oChangeIndicator.setChanges(aChanges);
			var oGetChangedElementsStub = sandbox.stub(this.oChangeIndicator, "getChangedElements").resolves(["qunit-fixture"]);
			this.oChangeIndicator.setAggregation("_popover", new Popover());

			this.oChangeIndicator.showDependentElements();

			assert.ok(this.oChangeIndicator.getAggregation("_icon").getVisible(), "the icon is visible");
			assert.equal(oHideChangeIndicatorsStub.callCount, 1, "the function 'hideChangeIndicators' is called");
			assert.equal(oRevealStub.callCount, 1, "the function 'reveal' is called");
			assert.notOk(this.oChangeIndicator.getAggregation("_popover").isOpen(), "the popover is closed");
			assert.ok(this.oChangeIndicator.hasStyleClass("sapUiRtaChangeIndicator-change-solid"), "the new style class was correctly added to the change indicator");
			assert.equal(oGetChangedElementsStub.callCount, 1, "the function 'getChangedElements' is called");
			assert.deepEqual(oGetChangedElementsStub.lastCall.args[0], aChanges[0], "the function 'getChangedElements' is called with the correct change");
			assert.deepEqual(oGetChangedElementsStub.lastCall.args[1], true, "the function 'getChangedElements' is called with the correct boolean, that indicates that the element is dependent");
			assert.deepEqual(this.oChangeIndicator.aDependentElementsChangeIndicators, [], "the dependent element array is empty");
		});

		QUnit.test("showDependentElements when the dependent change indicator has the same parent and there are multiple changes", function(assert) {
			this.oChangeIndicator.hideChangeIndicators = ChangeVisualization.hideChangeIndicators.bind(ChangeVisualization);
			this.oChangeIndicator.createChangeIndicator = function(oChange) {
				return new ChangeIndicator({
					mode: "dependent",
					parentId: "qunit-fixture",
					changes: [oChange],
					count: 1
				});
			};
			this.oChangeIndicator.getChangedElements = ChangeVisualization.getChangedElements.bind(ChangeVisualization);
			var oHideChangeIndicatorsStub = sandbox.stub(this.oChangeIndicator, "hideChangeIndicators");
			var oRevealStub = sandbox.stub(this.oChangeIndicator, "reveal");
			var aChanges = [{}, {}];
			this.oChangeIndicator.setChanges([aChanges[0]]);
			var oGetChangedElementsStub = sandbox.stub(this.oChangeIndicator, "getChangedElements").resolves(["qunit-fixture"]);
			this.oChangeIndicator.setAggregation("_popover", new Popover());
			var oEvent = {
				getModel: function() {
					return {
						getProperty: function() {
							return {
								change: {}
							};
						}
					};
				}
			};

			this.oChangeIndicator.showDependentElements(oEvent);

			assert.ok(this.oChangeIndicator.getAggregation("_icon").getVisible(), "the icon is visible");
			assert.equal(oHideChangeIndicatorsStub.callCount, 1, "the function 'hideChangeIndicators' is called");
			assert.equal(oRevealStub.callCount, 1, "the function 'reveal' is called");
			assert.notOk(this.oChangeIndicator.getAggregation("_popover").isOpen(), "the popover is closed");
			assert.ok(this.oChangeIndicator.hasStyleClass("sapUiRtaChangeIndicator-change-solid"), "the new style class was correctly added to the change indicator");
			assert.equal(oGetChangedElementsStub.callCount, 1, "the function 'getChangedElements' is called");
			assert.deepEqual(oGetChangedElementsStub.lastCall.args[0], aChanges[0], "the function 'getChangedElements' is called with the correct change");
			assert.deepEqual(oGetChangedElementsStub.lastCall.args[1], true, "the function 'getChangedElements' is called with the correct boolean, that indicates that the element is dependent");
			assert.deepEqual(this.oChangeIndicator.aDependentElementsChangeIndicators, [], "the dependent element array is empty");
		});

		QUnit.test("showDependentElements when the dependent change indicator has a different parent and the dependent change indicators is displayed the screen", function(assert) {
			var done = assert.async();
			this.oChangeIndicator.onAfterRendering = function() {
				this.oChangeIndicator.onAfterRendering = function() {};
				var oElement = document.createElement("div");
				oElement.id = "testElement";
				document.getElementById("qunit-fixture").appendChild(oElement);
				var aChanges = [{}];
				this.oChangeIndicator.hideChangeIndicators = ChangeVisualization.hideChangeIndicators.bind(ChangeVisualization);
				var oDependentChangeIndicator = new ChangeIndicator({
					mode: "dependent",
					parentId: oElement.id,
					changes: [aChanges[0]],
					count: 1
				});
				this.oChangeIndicator.createChangeIndicator = function() {
					return oDependentChangeIndicator;
				};
				this.oChangeIndicator.getChangedElements = ChangeVisualization.getChangedElements.bind(ChangeVisualization);
				var oHideChangeIndicatorsStub = sandbox.stub(this.oChangeIndicator, "hideChangeIndicators");
				var oRevealStub = sandbox.stub(this.oChangeIndicator, "reveal");
				this.oChangeIndicator.setChanges(aChanges);
				var oGetChangedElementsStub = sandbox.stub(this.oChangeIndicator, "getChangedElements").resolves([oElement.id]);
				this.oChangeIndicator.setAggregation("_popover", new Popover());
				oDependentChangeIndicator.onAfterRendering = function() {
					assert.ok(true, "the dependent change indicator was added to the content");
					assert.ok(this.oChangeIndicator.getAggregation("_icon").getVisible(), "the icon is visible");
					assert.equal(oHideChangeIndicatorsStub.callCount, 1, "the function 'hideChangeIndicators' is called");
					assert.equal(oRevealStub.callCount, 1, "the function 'reveal' is called");
					assert.notOk(this.oChangeIndicator.getAggregation("_popover").isOpen(), "the popover is closed");
					assert.ok(this.oChangeIndicator.hasStyleClass("sapUiRtaChangeIndicator-change-solid"), "the new style class was correctly added to the change indicator");
					assert.equal(oGetChangedElementsStub.callCount, 1, "the function 'getChangedElements' is called");
					assert.deepEqual(oGetChangedElementsStub.lastCall.args[0], aChanges[0], "the function 'getChangedElements' is called with the correct change");
					assert.deepEqual(oGetChangedElementsStub.lastCall.args[1], true, "the function 'getChangedElements' is called with the boolean that indicates, that the element is dependent");
					assert.deepEqual(this.oChangeIndicator.aDependentElementsChangeIndicators, [oDependentChangeIndicator], "the dependent element array is filled with the dependent change indicators");
					oDependentChangeIndicator.remove();
					oDependentChangeIndicator.destroy();
					done();
				}.bind(this);
				this.oChangeIndicator.showDependentElements();
			}.bind(this);
			this.oChangeIndicator.placeAt("qunit-fixture");
		});

		QUnit.test("removeDependentElements when the dependent element array is undefined", function(assert) {
			var oDependentChangeIndicator = new ChangeIndicator({
				mode: "dependent"
			});
			var oRemoveStub = sandbox.stub(oDependentChangeIndicator, "remove");
			var oDestroyStub = sandbox.stub(oDependentChangeIndicator, "destroy");
			this.oChangeIndicator.removeDependentElements();
			assert.deepEqual(this.oChangeIndicator.aDependentElementsChangeIndicators, [], "the dependent element array is empty");
			assert.equal(oRemoveStub.callCount, 0, "the change indicators were not removed");
			assert.equal(oDestroyStub.callCount, 0, "the change indicators were not destroyed");
		});

		QUnit.test("removeDependentElements when the dependent element array is filled", function(assert) {
			var oDependentChangeIndicator = new ChangeIndicator({
				mode: "dependent"
			});
			this.oChangeIndicator.aDependentElementsChangeIndicators = [oDependentChangeIndicator];
			var oRemoveStub = sandbox.stub(oDependentChangeIndicator, "remove");
			var oDestroyStub = sandbox.stub(oDependentChangeIndicator, "destroy");
			this.oChangeIndicator.removeDependentElements();
			assert.deepEqual(this.oChangeIndicator.aDependentElementsChangeIndicators, [], "the dependent element array is empty");
			assert.equal(oRemoveStub.callCount, 1, "the change indicators were removed");
			assert.equal(oDestroyStub.callCount, 1, "the change indicators were destroyed");
		});

		QUnit.test("hideDependentElements when the detail mode ends and the dependent element are hidden", function(assert) {
			var done = assert.async();
			this.oChangeIndicator.onAfterRendering = function() {
				this.oChangeIndicator.onAfterRendering = function() {};
				this.oChangeIndicator.revealChangeIndicators = function() {return;};
				this.oChangeIndicator.setAggregation("_popover", new Popover());
				var oRemoveDependentElementsStub = sandbox.stub(this.oChangeIndicator, "removeDependentElements");
				var oRevealChangeIndicatorsStub = sandbox.stub(this.oChangeIndicator, "revealChangeIndicators");
				this.oChangeIndicator.hideDependentElements();
				assert.equal(oRemoveDependentElementsStub.callCount, 1, "the function 'removeDependentElements' is called");
				assert.equal(oRevealChangeIndicatorsStub.callCount, 1, "the function 'revealChangeIndicators' is called");
				assert.ok(this.oChangeIndicator.getAggregation("_popover").isOpen(), "the popover is open");
				assert.notOk(this.oChangeIndicator.getAggregation("_icon").getVisible(), "the icon is hidden");
				assert.notOk(this.oChangeIndicator.hasStyleClass("sapUiRtaChangeIndicator-change-solid"), "the style class has been removed from the change indicator");
				done();
			}.bind(this);
			this.oChangeIndicator.placeAt("qunit-fixture");
		});

		QUnit.test("openDetailPopover when the popover is opened initially and there is a single change", function(assert) {
			var done = assert.async();
			this.oChangeIndicator.onAfterRendering = function() {
				this.oChangeIndicator.onAfterRendering = function() {};
				var aChanges = [{}];
				this.oChangeIndicator.setChanges(aChanges);
				var oPopover = new Popover();
				var oLoadStub = sandbox.stub(Fragment, "load").resolves(oPopover);
				var oGetChangesModelItemStub = sandbox.stub(this.oChangeIndicator, "getChangesModelItem").resolves({});
				oPopover.attachAfterOpen(function() {
					assert.equal(oGetChangesModelItemStub.callCount, aChanges.length, "the function 'getChangesModelItem' is called");
					assert.equal(oGetChangesModelItemStub.lastCall.args[0], aChanges[0], "the function 'getChangesModelItem' is called with the correct change");
					assert.equal(oLoadStub.callCount, 1, "the fragment was loaded");
					assert.equal(oLoadStub.lastCall.args[0].name, "sap.ui.rta.toolbar.SingleChangeIndicatorPopover", "the fragment was loaded with the corrcect xml");
					assert.equal(oLoadStub.lastCall.args[0].id, this.oChangeIndicator.getId() + "_fragment", "the fragment was loaded with the correct id");
					assert.equal(oLoadStub.lastCall.args[0].controller, this.oChangeIndicator, "the fragment was loaded with the correct controller");
					assert.ok(oPopover.getModel("changesModel"), "the changes model was set to the popover");
					assert.ok(oPopover.isOpen(), "the popover is open");
					done();
				}.bind(this));
				this.oChangeIndicator.openDetailPopover();
			}.bind(this);
			this.oChangeIndicator.placeAt("qunit-fixture");
		});

		QUnit.test("openDetailPopover when the popover is opened initially and there are multiple changes", function(assert) {
			var done = assert.async();
			this.oChangeIndicator.onAfterRendering = function() {
				this.oChangeIndicator.onAfterRendering = function() {};
				var aChanges = [{}, {}];
				this.oChangeIndicator.setChanges(aChanges);
				var oPopover = new Popover();
				var oLoadStub = sandbox.stub(Fragment, "load").resolves(oPopover);
				var oGetChangesModelItemStub = sandbox.stub(this.oChangeIndicator, "getChangesModelItem").resolves({});
				oPopover.attachAfterOpen(function() {
					assert.equal(oGetChangesModelItemStub.callCount, aChanges.length, "the function 'getChangesModelItem' is called dependent on the change array");
					assert.equal(oGetChangesModelItemStub.firstCall.args[0], aChanges[0], "the function 'getChangesModelItem' is called with the correct change");
					assert.equal(oGetChangesModelItemStub.lastCall.args[0], aChanges[1], "the function 'getChangesModelItem' is called with the correct change");
					assert.equal(oLoadStub.callCount, 1, "the fragment was loaded");
					assert.equal(oLoadStub.lastCall.args[0].name, "sap.ui.rta.toolbar.ChangeIndicatorPopover", "the fragment was loaded with the corrcect xml");
					assert.equal(oLoadStub.lastCall.args[0].id, this.oChangeIndicator.getId() + "_fragment", "the fragment was loaded with the correct id");
					assert.equal(oLoadStub.lastCall.args[0].controller, this.oChangeIndicator, "the fragment was loaded with the correct controller");
					assert.ok(oPopover.getModel("changesModel"), "the changes model was set to the popover");
					assert.ok(oPopover.isOpen(), "the popover is open");
					done();
				}.bind(this));
				this.oChangeIndicator.openDetailPopover();
			}.bind(this);
			this.oChangeIndicator.placeAt("qunit-fixture");
		});

		QUnit.test("openDetailPopover when the popover is not opened initially", function(assert) {
			var done = assert.async();
			this.oChangeIndicator.onAfterRendering = function() {
				this.oChangeIndicator.onAfterRendering = function() {};
				var aChanges = [{}];
				this.oChangeIndicator.setChanges(aChanges);
				var oPopover = new Popover();
				var oLoadStub = sandbox.stub(Fragment, "load").resolves(oPopover);
				var oGetChangesModelItemStub = sandbox.stub(this.oChangeIndicator, "getChangesModelItem").resolves({});
				this.oChangeIndicator.setAggregation("_popover", oPopover);
				oPopover.attachAfterOpen(function() {
					assert.equal(oGetChangesModelItemStub.callCount, aChanges.length, "the function 'getChangesModelItem' is called");
					assert.equal(oGetChangesModelItemStub.lastCall.args[0], aChanges[0], "the function 'getChangesModelItem' is called with the correct change");
					assert.equal(oLoadStub.callCount, 0, "the fragment was not loaded");
					assert.notOk(oPopover.getModel("changesModel"), "the changes model was not set to the popover");
					assert.ok(oPopover.isOpen(), "the popover is open");
					done();
				});
				this.oChangeIndicator.openDetailPopover();
			}.bind(this);
			this.oChangeIndicator.placeAt("qunit-fixture");
		});

		QUnit.test("getChangesModelItem", function(assert) {
			var done = assert.async();
			var oOriginalRTATexts = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			var sCommand = "move";
			var oChange = {
				getDefinition: function() {
					return {
						support: {
							command: sCommand
						}
					};
				},
				getCreation: function() {
					return "2020-01-01T00:00:00.000Z";
				}
			};
			var oElement = new Control();
			var sLabel = "testLabel";
			var oGetOverlayStub = sandbox.stub(OverlayRegistry, "getOverlay").returns({
				getDesignTimeMetadata: function() {
					return {
						getLabel: function() {
							return sLabel;
						}
					};
				}
			});
			var sMode = this.oChangeIndicator.getMode();
			var sElementLabel = "'" + sLabel + "'";
			var sChangeText = oOriginalRTATexts.getText("TXT_CHANGEVISUALIZATION_" + sMode.toUpperCase() + "_" + sCommand.toUpperCase(), sElementLabel);
			this.oChangeIndicator.getChangedElements = function() {return;};
			var oGetChangedElementsStub = sandbox.stub(this.oChangeIndicator, "getChangedElements").resolves([oElement]);
			var sDate = DateFormat.getDateTimeInstance().format(new Date(oChange.getCreation()));
			var bEnableDetailButton = (sMode === "change" && (sCommand === "move" || sCommand === "split"));
			this.oChangeIndicator.getChangesModelItem(oChange).then(function(oChangesModelItem) {
				assert.equal(oGetChangedElementsStub.callCount, 1, "the function 'getChangedElements' is called");
				assert.equal(oGetChangedElementsStub.lastCall.args[0], oChange, "the function 'getChangedElements' is called with the correct change");
				assert.equal(oGetChangedElementsStub.lastCall.args[1], false, "the function 'getChangedElements' is called with the correct mode");
				assert.deepEqual(oChangesModelItem.change, oChange, "the item has the correct change");
				assert.equal(oChangesModelItem.changeTitle, (sCommand).charAt(0).toUpperCase() + (sCommand).slice(1), "the item has the correct change title");
				assert.equal(oGetOverlayStub.callCount, 1, "the function 'getOverlay' is called");
				assert.equal(oGetOverlayStub.lastCall.args[0], oElement, "the function 'getOverlay' is called with the correct element");
				assert.equal(oChangesModelItem.description, sChangeText, "the item has the correct description");
				assert.equal(oChangesModelItem.date, sDate, "the item has the correct date");
				assert.equal(oChangesModelItem.enableDetailButton, bEnableDetailButton, "the boolean if details may be shown is set correctly to the item");
				done();
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
