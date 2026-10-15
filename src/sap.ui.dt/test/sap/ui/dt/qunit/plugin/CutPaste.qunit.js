/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/CustomListItem",
	"sap/m/List",
	"sap/m/VBox",
	"sap/ui/dt/plugin/CutPaste",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/events/KeyCodes",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/Device",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
],
function(
	Button,
	CustomListItem,
	List,
	VBox,
	CutPaste,
	DesignTime,
	OverlayRegistry,
	KeyCodes,
	VerticalLayout,
	JSONModel,
	nextUIUpdate,
	sinon,
	Device,
	RtaQunitUtils
) {
	"use strict";
	const oSandbox = sinon.createSandbox();

	QUnit.module("Given that a CutPaste is initialized", {
		async beforeEach(assert) {
			// Test Setup:
			// VerticalLayout
			// 	 content
			//      Button

			this.oButton = new Button();
			this.oButton2 = new Button();
			this.oButton3 = new Button();
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton,
					this.oButton2,
					this.oButton3
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oCutPaste = new CutPaste({
				movableTypes: [
					"sap.m.Button"
				]
			});

			var done = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				],
				plugins: [
					this.oCutPaste
				]
			});

			this.oDesignTime.attachEventOnce("synced", async function() {
				await nextUIUpdate();
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.oCutPaste.destroy();
		}
	}, function() {
		QUnit.test("when CutPaste is initialized", function(assert) {
			var bElementMoverExist = !!this.oCutPaste.getElementMover();
			assert.ok(bElementMoverExist, "parameter elementMover exists");
		});

		QUnit.test("when cut is triggered on a button overlay, with macintosh device and metaKey is pushed", function(assert) {
			Device.os.macintosh = true;
			RtaQunitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, { metaKey: true });
			assert.ok(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
			assert.equal(this.oCutPaste.getElementMover().getMovedOverlay(), this.oButtonOverlay, "then the button overlay is remembered as to be cut");
		});

		QUnit.test("when cut is triggered on a button overlay, with macintosh device and ctrlKey is pushed", function(assert) {
			Device.os.macintosh = true;
			RtaQunitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, { ctrlKey: true });
			assert.notOk(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
			assert.equal(this.oCutPaste.getElementMover().getMovedOverlay(), undefined, "then the button overlay is undefined");
		});

		QUnit.test("when cut is triggered on a button overlay, with no macintosh device and ctrlKey is pushed", function(assert) {
			Device.os.macintosh = false;
			RtaQunitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, { ctrlKey: true });
			assert.ok(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
			assert.equal(this.oCutPaste.getElementMover().getMovedOverlay(), this.oButtonOverlay, "then the button overlay is remembered as to be cut");
		});

		QUnit.test("when cut is triggered on a button overlay, with no macintosh device and metaKey is pushed", function(assert) {
			Device.os.macintosh = false;
			RtaQunitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, { metaKey: true });
			assert.notOk(this.oButtonOverlay.hasStyleClass("sapUiDtOverlayCutted"), "the button overlay is marked with the correct style");
			assert.equal(this.oCutPaste.getElementMover().getMovedOverlay(), undefined, "then the button overlay is undefined");
		});

		QUnit.test("when cut is triggered on a button overlay and paste is triggered on the last button overlay", function(assert) {
			var done = assert.async();
			Device.os.macintosh = false;
			RtaQunitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, { ctrlKey: true });

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(function() {
				RtaQunitUtils.triggerKeydown(this.oButton3Overlay.getDomRef(), KeyCodes.V, { ctrlKey: true });
				var aContent = this.oLayout.getContent();
				assert.equal(aContent.indexOf(this.oButton), 2, "the first Button is at position 2");
				assert.equal(aContent.indexOf(this.oButton2), 0, "the second Button is at position 0");
				assert.equal(aContent.indexOf(this.oButton3), 1, "the third Button is at position 1");
				done();
			}.bind(this));
		});

		QUnit.test("when cut is triggered on a button overlay and paste is triggered on the first button overlay", function(assert) {
			var done = assert.async();
			Device.os.macintosh = false;
			RtaQunitUtils.triggerKeydown(this.oButton3Overlay.getDomRef(), KeyCodes.X, { ctrlKey: true });

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(function() {
				RtaQunitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.V, { ctrlKey: true });
				var aContent = this.oLayout.getContent();
				assert.equal(aContent.indexOf(this.oButton), 0, "the first Button is at position 0");
				assert.equal(aContent.indexOf(this.oButton2), 2, "the second Button is at position 2");
				assert.equal(aContent.indexOf(this.oButton3), 1, "the third Button is at position 1");
				done();
			}.bind(this));
		});

		QUnit.test("when cut is triggered on a button overlay and paste is triggered on layout overlay", function(assert) {
			Device.os.macintosh = false;
			RtaQunitUtils.triggerKeydown(this.oButtonOverlay.getDomRef(), KeyCodes.X, { ctrlKey: true });
			RtaQunitUtils.triggerKeydown(this.oLayoutOverlay.getDomRef(), KeyCodes.V, { ctrlKey: true });

			var aContent = this.oLayout.getContent();
			assert.equal(aContent.indexOf(this.oButton), 0, "the first Button is at position 0");
			assert.equal(aContent.indexOf(this.oButton2), 1, "the second Button is at position 1");
			assert.equal(aContent.indexOf(this.oButton3), 2, "the third Button is at position 2");
		});

		QUnit.test("when paste is triggered on a Layout overlay and cut was not triggered before", function(assert) {
			Device.os.macintosh = false;
			var oPasteSpy = sinon.spy(this.oCutPaste, "paste");

			RtaQunitUtils.triggerKeydown(this.oLayoutOverlay.getDomRef(), KeyCodes.V, { ctrlKey: true });

			var aContent = this.oLayout.getContent();
			assert.equal(aContent.indexOf(this.oButton), 0, "the first Button is at position 0");
			assert.equal(aContent.indexOf(this.oButton2), 1, "the second Button is at position 1");
			assert.equal(aContent.indexOf(this.oButton3), 2, "the third Button is at position 2");
			assert.equal(oPasteSpy.callCount, 0, "then the paste function was not called");
		});

		QUnit.test("when _executePaste is called on a container overlay with targetIndex 0", async function(assert) {
			// cut the last button, then request the first position in the layout content
			await this.oCutPaste.cut(this.oButton3Overlay);
			const bResult = this.oCutPaste._executePaste(this.oLayoutOverlay, 0);
			assert.ok(bResult, "then the paste is executed");
			const aContent = this.oLayout.getContent();
			assert.equal(aContent.indexOf(this.oButton3), 0, "then the moved button lands at position 0");
			assert.equal(aContent.indexOf(this.oButton), 1, "then the first button shifts to position 1");
			assert.equal(aContent.indexOf(this.oButton2), 2, "then the second button shifts to position 2");
		});

		QUnit.test("when _executePaste is called on a container overlay with an arbitrary middle targetIndex", async function(assert) {
			// cut the first button; siblings excluding it are [button2, button3].
			// targetIndex 1 -> land after the sibling at index 0 (button2)
			await this.oCutPaste.cut(this.oButtonOverlay);
			const bResult = this.oCutPaste._executePaste(this.oLayoutOverlay, 1);
			assert.ok(bResult, "then the paste is executed");
			const aContent = this.oLayout.getContent();
			assert.equal(aContent.indexOf(this.oButton2), 0, "then the second button is at position 0");
			assert.equal(aContent.indexOf(this.oButton), 1, "then the moved button lands at the requested position 1");
			assert.equal(aContent.indexOf(this.oButton3), 2, "then the third button is at position 2");
		});

		QUnit.test("when _executePaste is called on a container overlay with targetIndex past the end", async function(assert) {
			await this.oCutPaste.cut(this.oButtonOverlay);
			const bResult = this.oCutPaste._executePaste(this.oLayoutOverlay, 99);
			assert.ok(bResult, "then the paste is executed");
			const aContent = this.oLayout.getContent();
			assert.equal(aContent.indexOf(this.oButton), 2, "then the moved button is appended at the end");
		});

		QUnit.test("when _executePaste is called on a container overlay without a targetIndex", async function(assert) {
			// omitting the index keeps the legacy paste behavior: insert at the start
			await this.oCutPaste.cut(this.oButton3Overlay);
			const bResult = this.oCutPaste._executePaste(this.oLayoutOverlay);
			assert.ok(bResult, "then the paste is executed");
			const aContent = this.oLayout.getContent();
			assert.equal(aContent.indexOf(this.oButton3), 0, "then the moved button is inserted at the start");
		});

		QUnit.test("when _executePaste is called with an index but the target resolves to a sibling", async function(assert) {
			// pasting relative to a sibling overlay ignores the index and inserts after the sibling
			await this.oCutPaste.cut(this.oButtonOverlay);
			const bResult = this.oCutPaste._executePaste(this.oButton3Overlay, 0);
			assert.ok(bResult, "then the paste is executed");
			const aContent = this.oLayout.getContent();
			assert.equal(aContent.indexOf(this.oButton), 2, "then the moved button lands after the sibling regardless of the index");
			assert.equal(aContent.indexOf(this.oButton3), 1, "then the sibling stays before the moved button");
		});
	});

	QUnit.module("Given a control with a template containing multiple containers", {
		async beforeEach(assert) {
			const fnDone = assert.async();

			const oModel = new JSONModel({
				texts: [
					{ text1: "Text 1", text2: "More Text 1", text3: "Even More Text 1" },
					{ text1: "Text 2", text2: "More Text 2", text3: "Even More Text 2" },
					{ text1: "Text 3", text2: "More Text 3", text3: "Even More Text 3" }
				]
			});
			this.oButton1 = new Button("text1", { text: "{text1}" });
			this.oButton3 = new Button("text3", { text: "{text3}" });
			this.oItemTemplate = new CustomListItem("item", {
				content: new VBox("vbox1", {
					items: [
						new VBox("vbox2", {
							items: [
								new VBox("vbox31", {
									items: [
										this.oButton1,
										new Button("text2", { text: "{text2}" })
									]
								}),
								new VBox("vbox32", {
									items: [
										this.oButton3
									]
								})
							]
						})
					]
				})
			});
			this.oList = new List("list", {
				items: {
					path: "/texts",
					template: this.oItemTemplate,
					templateShareable: true
				}
			}).setModel(oModel);

			this.oList.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oCutPaste = new CutPaste({
				movableTypes: [
					"sap.m.Button"
				]
			});

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oList
				],
				plugins: [
					this.oCutPaste
				]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone);
		},
		afterEach() {
			oSandbox.restore();
			this.oList.destroy();
			this.oItemTemplate.destroy();
			this.oCutPaste.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("When a control is pasted on another container", function(assert) {
			const fnDone = assert.async();
			const [oVBox1, oVBox2] = this.oList.getItems()[1].getContent()[0].getItems()[0].getItems();
			const [oButton1] = oVBox1.getItems();
			const oButton1Overlay = OverlayRegistry.getOverlay(oButton1);
			const oVBox2Overlay = OverlayRegistry.getOverlay(oVBox2);
			const oSetSpy = oSandbox.spy(oButton1Overlay, "setOngoingMoveInformation");
			const oResetSpy = oSandbox.spy(oButton1Overlay, "resetOngoingMoveInformation");
			RtaQunitUtils.triggerKeydown(oButton1Overlay.getDomRef(), KeyCodes.X, { ctrlKey: true });

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(() => {
				RtaQunitUtils.triggerKeydown(oVBox2Overlay.getDomRef(), KeyCodes.V, { ctrlKey: true });

				assert.strictEqual(oSetSpy.callCount, 1, "then the setOngoingMoveInformation function was called once");
				assert.deepEqual(oSetSpy.firstCall.args[0], {
					sourceParentInstance: oVBox1
				}, "then the setOngoingMoveInformation function was called with the correct move information");
				assert.strictEqual(oResetSpy.callCount, 1, "then the resetOngoingMoveInformation function was called once");
				fnDone();
			});
		});

		QUnit.test("When a control is pasted on an element in another container", function(assert) {
			const fnDone = assert.async();
			const [oVBox1, oVBox2] = this.oList.getItems()[1].getContent()[0].getItems()[0].getItems();
			const [oButton1] = oVBox1.getItems();
			const oButton1Overlay = OverlayRegistry.getOverlay(oButton1);
			const [oButton3] = oVBox2.getItems();
			const oButton3Overlay = OverlayRegistry.getOverlay(oButton3);
			const oSetSpy = oSandbox.spy(oButton1Overlay, "setOngoingMoveInformation");
			const oResetSpy = oSandbox.spy(oButton1Overlay, "resetOngoingMoveInformation");
			RtaQunitUtils.triggerKeydown(oButton1Overlay.getDomRef(), KeyCodes.X, { ctrlKey: true });

			this.oCutPaste.getElementMover().attachValidTargetZonesActivated(() => {
				RtaQunitUtils.triggerKeydown(oButton3Overlay.getDomRef(), KeyCodes.V, { ctrlKey: true });

				assert.strictEqual(oSetSpy.callCount, 1, "then the setOngoingMoveInformation function was called once");
				assert.deepEqual(oSetSpy.firstCall.args[0], {
					sourceParentInstance: oVBox1
				}, "then the setOngoingMoveInformation function was called with the correct move information");
				assert.strictEqual(oResetSpy.callCount, 1, "then the resetOngoingMoveInformation function was called once");
				fnDone();
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});