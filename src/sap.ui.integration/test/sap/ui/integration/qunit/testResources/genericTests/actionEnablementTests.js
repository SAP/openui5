sap.ui.define([
	"qunit/testResources/nextCardReadyEvent",
	"sap/base/util/deepClone",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/cards/actions/NavigationAction",
	"sap/ui/integration/util/Utils",
	"sap/ui/qunit/utils/nextUIUpdate"
], (
	nextCardReadyEvent,
	deepClone,
	Card,
	CardActions,
	NavigationAction,
	Utils,
	nextUIUpdate
) => {
	"use strict";

	return (moduleName, {
		manifest,
		partUnderTestPath,
		getActionControl,
		DOM_RENDER_LOCATION,
		skipEnabledTests,
		QUnit,
		sinon
	}) => {
		QUnit.module(`Action Enablement - ${moduleName}`, {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Action URL should navigate", async function (assert) {
			// Arrange
			const oAttachActionSpy = sinon.spy(CardActions.prototype, "_attachAction");
			const oFireActionSpy = sinon.spy(CardActions, "fireAction");
			const oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute");
			const oManifest = deepClone(manifest);
			Utils.setNestedPropertyValue(
				oManifest,
				`${partUnderTestPath}/actions`,
				[{
					"type": "Navigation",
					"parameters": {
						"url": "https://www.sap.com"
					}
				}]
			);

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const { enabledPropertyName = "enabled", enabledPropertyValue, eventName } = oAttachActionSpy.firstCall.args[0];
			const actionControl = getActionControl(this.oCard);

			// Assert
			if (!skipEnabledTests) {
				assert.strictEqual(actionControl.getMetadata().getProperty(enabledPropertyName).get(actionControl), enabledPropertyValue, `Enabled property "${enabledPropertyName}" should be correctly set`);
			}

			// Act
			actionControl.fireEvent(eventName);
			await nextUIUpdate();

			// Assert
			assert.ok(oFireActionSpy.callCount, "fireAction is called");
			assert.strictEqual(oStubOpenUrl.callCount, 1, "Navigation action is executed");

			// Clean up
			oAttachActionSpy.restore();
			oStubOpenUrl.restore();
			oFireActionSpy.restore();
		});

		QUnit[skipEnabledTests ? "skip" : "test"]("Enabled property of action set to 'false'", async function (assert) {
			// Arrange
			const oAttachActionSpy = sinon.spy(CardActions.prototype, "_attachAction");
			const oManifest = deepClone(manifest);
			Utils.setNestedPropertyValue(
				oManifest,
				`${partUnderTestPath}/actions`,
				[{
					"enabled": false,
					"type": "Navigation",
					"parameters": {
						"url": "https://www.sap.com"
					}
				}]
			);

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const { enabledPropertyName = "enabled", disabledPropertyValue } = oAttachActionSpy.firstCall.args[0];
			const actionControl = getActionControl(this.oCard);

			// Assert
			assert.strictEqual(actionControl.getMetadata().getProperty(enabledPropertyName).get(actionControl), disabledPropertyValue, `Enabled property "${enabledPropertyName}" should be correctly set`);

			// Clean up
			oAttachActionSpy.restore();
		});

		QUnit[skipEnabledTests ? "skip" : "test"]("Enabled property of action set to 'false' with binding", async function (assert) {
			// Arrange
			const oAttachActionSpy = sinon.spy(CardActions.prototype, "_attachAction");
			const oManifest = deepClone(manifest);
			Utils.setNestedPropertyValue(
				oManifest,
				`${partUnderTestPath}/actions`,
				[{
					"enabled": "{/actionEnabled}",
					"type": "Navigation",
					"parameters": {
						"url": "https://www.sap.com"
					}
				}]
			);

			Utils.setNestedPropertyValue(
				oManifest,
				"/sap.card/data",
				{
					"json": {
						"actionEnabled": false
					}
				}
			);

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const { enabledPropertyName = "enabled", disabledPropertyValue } = oAttachActionSpy.firstCall.args[0];
			const actionControl = getActionControl(this.oCard);

			// Assert
			assert.strictEqual(actionControl.getMetadata().getProperty(enabledPropertyName).get(actionControl), disabledPropertyValue, `Enabled property "${enabledPropertyName}" should be correctly set`);

			// Clean up
			oAttachActionSpy.restore();
		});

		QUnit.test("Empty actions list", async function (assert) {
			// Arrange
			const oAttachActionSpy = sinon.spy(CardActions.prototype, "_attachAction");
			const oManifest = deepClone(manifest);
			Utils.setNestedPropertyValue(
				oManifest,
				`${partUnderTestPath}/actions`,
				[]
			);

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			assert.ok(oAttachActionSpy.callCount === 0, "_attachAction should not be called");

			//Clean up
			oAttachActionSpy.restore();
		});

		QUnit.test("No action type given", async function (assert) {
			// Arrange
			const oAttachActionSpy = sinon.spy(CardActions.prototype, "_attachAction");
			const oManifest = deepClone(manifest);
			Utils.setNestedPropertyValue(
				oManifest,
				`${partUnderTestPath}/actions`,
				[{
					"parameters": {
						"url": "https://www.sap.com"
					}
				}]
			);

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(oAttachActionSpy.callCount === 0, "_attachAction should not be called");

			//Clean up
			oAttachActionSpy.restore();
		});
	};
});