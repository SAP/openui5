/*!
 * ${copyright}
 */

// QUnit script for sap.ui.core.ElementMetadata
sap.ui.require([
	"sap/ui/core/ElementMetadata",
	"sap/ui/core/Element"], function(ElementMetadata, Element) {
	"use strict";

	QUnit.module("Design Time Metadata", {
		beforeEach: function() {
			var oMetadata = {
				designTime: true
			};

			// build the inheritance chain of DesignTimeElements, one without DesignTime in between
			Element.extend("DTElement", {
				metadata: oMetadata
			});
			DTElement.extend("DTElementChild", {
				metadata: oMetadata
			});
			DTElementChild.extend("NoDTElementChild2");
			NoDTElementChild2.extend("DTElementChild3", {
				metadata: oMetadata
			});

			// DesignTime metadata
			this.oDTForElement = {
				metaProp1: "1",
				metaProp2: "2",
				metaPropDeep: {
					metaPropDeep1 : "deep1"
				},
				metaPropDeep2: {
					metaPropDeep21 : "deep21"
				}
			};
			this.oDTForElementChild = {
				metaProp2: "2-overwritten",
				metaProp3: "3",
				metaProp4: "4",
				metaPropDeep: {
					metaPropDeep2 : "deep2",
					metaPropDeep3 : "deep3"
				},
				metaPropDeep2: {
					metaPropDeep21 : "deep21-overwritten"
				}
			};
			this.oDTForElementChild3 = {
				metaProp3: "3.1",
				metaProp4: undefined,
				metaPropDeep: {
					metaPropDeep1 : "deep1-overwritten",
					metaPropDeep3 : undefined
				},
				metaPropDeep2: undefined
			};

			// stub the DesignTime require calls (make sure the sap.ui.require callback is called asynchronously)
			this.oRequireStub = sinon.stub(sap.ui, "require");
			this.oRequireStub.withArgs(["DTElement.designtime"]).callsArgWithAsync(1, this.oDTForElement);
			this.oRequireStub.withArgs(["DTElementChild.designtime"]).callsArgWithAsync(1, this.oDTForElementChild);
			this.oRequireStub.withArgs(["DTElementChild3.designtime"]).callsArgWithAsync(1, this.oDTForElementChild3);
		},

		afterEach: function() {
			// reset design time cache
			DTElement.getMetadata()._oDesignTime = null;
			DTElement.getMetadata()._oDesignTimePromise = null;

			DTElementChild.getMetadata()._oDesignTime = null;
			DTElementChild.getMetadata()._oDesignTimePromise = null;

			NoDTElementChild2.getMetadata()._oDesignTime = null;
			NoDTElementChild2.getMetadata()._oDesignTimePromise = null;

			DTElementChild3.getMetadata()._oDesignTime = null;
			DTElementChild3.getMetadata()._oDesignTimePromise = null;

			this.oRequireStub.restore();
		}
	});

	QUnit.test("loadDesignTime - no inheritance", function(assert) {
		return DTElement.getMetadata().loadDesignTime().then(function(oDesignTime) {
			assert.ok(oDesignTime, "DesignTime was passed");
			assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaProp2, "2", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21", "DesignTime data was passed");
		}.bind(this));
	});

	QUnit.test("loadDesignTime - with simple inheritance", function(assert) {
		return DTElementChild.getMetadata().loadDesignTime().then(function(oDesignTime) {
			assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");
		}.bind(this));
	});

	QUnit.test("loadDesignTime - with designtime only via inheritance", function(assert) {
		return NoDTElementChild2.getMetadata().loadDesignTime().then(function(oDesignTime) {
			assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");
		}.bind(this));
	});

	QUnit.test("loadDesignTime - with transitive inheritance", function(assert) {
		return DTElementChild3.getMetadata().loadDesignTime().then(function(oDesignTime) {
			assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp3, "3.1", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.metaProp4, undefined, "DesignTime data was removed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1-overwritten", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, undefined, "DesignTime data was removed");
			assert.strictEqual(oDesignTime.metaPropDeep2, undefined, "DesignTime data was removed");
		}.bind(this));
	});

	QUnit.test("loadDesignTime - all in parallel", function(assert) {
		return Promise.all([
			DTElement.getMetadata().loadDesignTime(),
			DTElementChild.getMetadata().loadDesignTime(),
			NoDTElementChild2.getMetadata().loadDesignTime(),
			DTElementChild3.getMetadata().loadDesignTime()
		]).then(function(aDesignTimes) {

			// Only 3 require calls are expected, as one element (NoDTElementChild2) does not have design time data
			sinon.assert.callCount(this.oRequireStub, 3);

			var oDTElementDesignTime = aDesignTimes[0];
			assert.strictEqual(oDTElementDesignTime.metaProp1, "1", "DesignTime data was passed");
			assert.strictEqual(oDTElementDesignTime.metaProp2, "2", "DesignTime data was passed");
			assert.strictEqual(oDTElementDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDTElementDesignTime.metaPropDeep2.metaPropDeep21, "deep21", "DesignTime data was passed");

			var oDTElementChildDesignTime = aDesignTimes[1];
			assert.strictEqual(oDTElementChildDesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDTElementChildDesignTime.metaProp2, "2-overwritten", "DesignTime data was overwritten");
			assert.strictEqual(oDTElementChildDesignTime.metaProp3, "3", "DesignTime data was passed");
			assert.strictEqual(oDTElementChildDesignTime.metaProp4, "4", "DesignTime data was passed");
			assert.strictEqual(oDTElementChildDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDTElementChildDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDTElementChildDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
			assert.strictEqual(oDTElementChildDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");

			var oNoDTElementChild2DesignTime = aDesignTimes[2];
			assert.strictEqual(oNoDTElementChild2DesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oNoDTElementChild2DesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
			assert.strictEqual(oNoDTElementChild2DesignTime.metaProp3, "3", "DesignTime data was inherited");
			assert.strictEqual(oNoDTElementChild2DesignTime.metaProp4, "4", "DesignTime data was inherited");
			assert.strictEqual(oNoDTElementChild2DesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oNoDTElementChild2DesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oNoDTElementChild2DesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
			assert.strictEqual(oNoDTElementChild2DesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");

			var oDTElementChild3DesignTime = aDesignTimes[3];
			assert.strictEqual(oDTElementChild3DesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDTElementChild3DesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
			assert.strictEqual(oDTElementChild3DesignTime.metaProp3, "3.1", "DesignTime data was overwritten");
			assert.strictEqual(oDTElementChild3DesignTime.metaProp4, undefined, "DesignTime data was removed");
			assert.strictEqual(oDTElementChild3DesignTime.metaPropDeep.metaPropDeep1, "deep1-overwritten", "DesignTime data was overwritten");
			assert.strictEqual(oDTElementChild3DesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDTElementChild3DesignTime.metaPropDeep.metaPropDeep3, undefined, "DesignTime data was removed");
			assert.strictEqual(oDTElementChild3DesignTime.metaPropDeep2, undefined, "DesignTime data was removed");

		}.bind(this));
	});

	QUnit.test("loadDesignTime - cache the results", function(assert) {
		var oDTElementMetadata = DTElementChild3.getMetadata();
		return oDTElementMetadata.loadDesignTime().then(function() {
			sinon.assert.callCount(this.oRequireStub, 3);
			this.oRequireStub.reset();
			return oDTElementMetadata.loadDesignTime().then(function() {
				assert.notOk(this.oRequireStub.called, "sap.ui.require was not called");
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("loadDesignTime - cache the results implicitly (parent first)", function(assert) {
		return DTElementChild.getMetadata().loadDesignTime().then(function() {
			sinon.assert.callCount(this.oRequireStub, 2);
			this.oRequireStub.reset();
			return DTElementChild3.getMetadata().loadDesignTime().then(function() {
				sinon.assert.callCount(this.oRequireStub, 1);
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("loadDesignTime - cache the results implicitly (child first)", function(assert) {
		return DTElementChild3.getMetadata().loadDesignTime().then(function() {
			sinon.assert.callCount(this.oRequireStub, 3);
			this.oRequireStub.reset();
			return DTElementChild.getMetadata().loadDesignTime().then(function() {
				assert.notOk(this.oRequireStub.called, "sap.ui.require was not called");
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("loadDesignTime - cache the results with designtime only via inheritance", function(assert) {
		var oDTElementMetadataChild = NoDTElementChild2.getMetadata();
		return oDTElementMetadataChild.loadDesignTime().then(function(oDesignTime) {
			sinon.assert.callCount(this.oRequireStub, 2);
			this.oRequireStub.reset();
			return oDTElementMetadataChild.loadDesignTime().then(function() {
				assert.notOk(this.oRequireStub.called, "sap.ui.require was not called");
			}.bind(this));
		}.bind(this));
	});

});
