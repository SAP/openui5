/*!
 * ${copyright}
 */
/*global QUnit, sinon*/
// QUnit script for DesignTime support for ManagedObjectMetadata
sap.ui.define([
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/CustomData"
],
function(
	ManagedObjectMetadata,
	ManagedObject,
	Element,
	CustomData
) {
	"use strict";

	/* eslint no-extra-bind:0 */ // it seems more convenient to consistently bind 'this'

	var DTManagedObject,
		DTManagedObjectChild,
		NoDTManagedObjectChild2,
		DTManagedObjectChild3,
		DTManagedObjectLocal,
		DTManagedObjectModule;

	QUnit.module("Design Time Metadata", {
		beforeEach: function() {
			var oMetadata = {
				designtime: true
			},
			oMetadataLocal = {
				designtime: {
					local: "local"
				}
			},
			oMetadataModule = {
				designtime: "sap/test/DTManagedObjectChild4.designtime"
			};

			// build the inheritance chain of DesignTimeManagedObjects, one without DesignTime in between
			DTManagedObject = ManagedObject.extend("DTManagedObject", {
				metadata: oMetadata
			});
			DTManagedObjectChild = DTManagedObject.extend("DTManagedObjectChild", {
				metadata: oMetadata
			});

			NoDTManagedObjectChild2 = DTManagedObjectChild.extend("NoDTManagedObjectChild2");

			DTManagedObjectChild3 = NoDTManagedObjectChild2.extend("DTManagedObjectChild3", {
				metadata: oMetadata
			});

			DTManagedObjectLocal = DTManagedObjectChild.extend("DTManagedObjectLocal", {
				metadata: oMetadataLocal
			});

			DTManagedObjectModule = DTManagedObjectChild.extend("DTManagedObjectModule", {
				metadata: oMetadataModule
			});

			// DesignTime metadata
			this.oDTForManagedObject = {
				metaProp1: "1",
				metaProp2: "2",
				metaPropDeep: {
					metaPropDeep1 : "deep1"
				},
				metaPropDeep2: {
					metaPropDeep21 : "deep21"
				}
			};
			this.oDTForManagedObjectChild = {
				metaProp2: "2-overwritten",
				metaProp3: "3",
				metaProp4: "4",
				metaPropDeep: {
					metaPropDeep2 : "deep2",
					metaPropDeep3 : "deep3"
				},
				templates: {
					create: "sap/lib/namespace/designtime/<Control>.create.fragment.xml"  //create template will not be inherited, they are special to the current type.
				},
				metaPropDeep2: {
					metaPropDeep21 : "deep21-overwritten"
				}
			};
			this.oDTForManagedObjectChild3 = {
				metaProp3: "3.1",
				metaProp4: undefined,
				metaPropDeep: {
					metaPropDeep1 : "deep1-overwritten",
					metaPropDeep3 : undefined
				},
				metaPropDeep2: undefined
			};

			this.oDTForManagedObjectLocal = {
				local: "local",
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

			this.oDTForManagedObjectModule = {
				module : "module"
			};

			this.oDTForInstance = {
				instance : "instance",
				metaPropDeep: {
					metaPropDeep2 : "deep2-overwritten"
				},
				templates: {
					create: "instance specific dt metadata can set create template"
				}
			};

			this.oDTForOtherInstance = {
				instance : "other-instance",
				metaPropDeep: {
					metaPropDeep2 : "deep2-overwritten"
				}
			};

			this.oDTForInstanceFunction = function(oInstance) {
				return {
					metaProp2: "2-instanceDTFunction",
					instance: oInstance
				};
			};

			this.oDTForPredefinedDefaultDT = {
				metaProp2: "2-defaultDT"
			};

			// stub the DesignTime require calls (make sure the sap.ui.require callback is called asynchronously)
			this.oRequireStub = sinon.stub(sap.ui, "require");
			this.oRequireStub.withArgs(["DTManagedObject.designtime"]).callsArgWithAsync(1, this.oDTForManagedObject);
			this.oRequireStub.withArgs(["DTManagedObjectChild.designtime"]).callsArgWithAsync(1, this.oDTForManagedObjectChild);
			this.oRequireStub.withArgs(["DTManagedObjectChild3.designtime"]).callsArgWithAsync(1, this.oDTForManagedObjectChild3);
			this.oRequireStub.withArgs(["sap/test/DTManagedObjectChild4.designtime"]).callsArgWithAsync(1, this.oDTForManagedObjectModule);
			this.oRequireStub.withArgs(["sap/test/instanceSpecific.designtime"]).callsArgWithAsync(1, this.oDTForInstance);
			this.oRequireStub.withArgs(["sap/test/otherInstanceSpecific.designtime"]).callsArgWithAsync(1, this.oDTForOtherInstance);
			this.oRequireStub.withArgs(["sap/test/instanceSpecificFunction.designtime"]).callsArgWithAsync(1, this.oDTForInstanceFunction);
			this.oRequireStub.withArgs(["sap/ui/dt/defaultDesigntime/defaultDT.designtime"]).callsArgWithAsync(1, this.oDTForPredefinedDefaultDT);

			this.oInstanceWithoutSpecificDTMetadata = new Element();
			this.oInstanceWithSpecificDTMetadata = new Element({
				customData : [new CustomData({
					key : "sap-ui-custom-settings",
					value : {
						"sap.ui.dt" : {
							designtime : "sap/test/instanceSpecific.designtime"
						}
					}
				})]
			});
			this.oOtherInstanceWithSpecificDTMetadata = new Element({
				customData : [new CustomData({
					key : "sap-ui-custom-settings",
					value : {
						"sap.ui.dt" : {
							designtime : "sap/test/otherInstanceSpecific.designtime"
						}
					}
				})]
			});
			this.oInstanceWithSpecificDTMetadataFunction = new Element({
				id: "elementWithFunction",
				customData : [new CustomData({
					key : "sap-ui-custom-settings",
					value : {
						"sap.ui.dt" : {
							designtime : "sap/test/instanceSpecificFunction.designtime"
						}
					}
				})]
			});
			this.oInstanceWithPredefinedDefaultDTMetadata = new Element({
				customData : [new CustomData({
					key : "sap-ui-custom-settings",
					value : {
						"sap.ui.dt" : {
							designtime : "defaultDT"
						}
					}
				})]
			});
		},
		afterEach: function() {
			// reset design time cache
			DTManagedObject.getMetadata()._oDesignTime = null;
			DTManagedObject.getMetadata()._oDesignTimePromise = null;

			DTManagedObjectChild.getMetadata()._oDesignTime = null;
			DTManagedObjectChild.getMetadata()._oDesignTimePromise = null;

			NoDTManagedObjectChild2.getMetadata()._oDesignTime = null;
			NoDTManagedObjectChild2.getMetadata()._oDesignTimePromise = null;

			DTManagedObjectChild3.getMetadata()._oDesignTime = null;
			DTManagedObjectChild3.getMetadata()._oDesignTimePromise = null;

			DTManagedObjectLocal.getMetadata()._oDesignTime = null;
			DTManagedObjectLocal.getMetadata()._oDesignTimePromise = null;

			DTManagedObjectModule.getMetadata()._oDesignTime = null;
			DTManagedObjectModule.getMetadata()._oDesignTimePromise = null;

			DTManagedObject =
			DTManagedObjectChild =
			NoDTManagedObjectChild2 =
			DTManagedObjectChild3 =
			DTManagedObjectLocal =
			DTManagedObjectModule = undefined;

			this.oInstanceWithoutSpecificDTMetadata.destroy();
			this.oInstanceWithSpecificDTMetadata.destroy();
			this.oOtherInstanceWithSpecificDTMetadata.destroy();
			this.oInstanceWithSpecificDTMetadataFunction.destroy();
			this.oInstanceWithPredefinedDefaultDTMetadata.destroy();

			this.oRequireStub.restore();
		}
	}, function () {
		QUnit.test("loadDesignTime - no inheritance", function(assert) {
			return DTManagedObject.getMetadata().loadDesignTime().then(function(oDesignTime) {
				assert.ok(oDesignTime, "DesignTime was passed");
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaProp2, "2", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.templates.create, null, "create template is not defined, but key is available");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with simple inheritance", function(assert) {
			return DTManagedObjectChild.getMetadata().loadDesignTime().then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.templates.create, "sap/lib/namespace/designtime/<Control>.create.fragment.xml", "create template is available");
				assert.strictEqual(oDesignTime.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with designtime only via inheritance", function(assert) {
			return NoDTManagedObjectChild2.getMetadata().loadDesignTime().then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.templates.create, null, "create template is not inherited");
				assert.strictEqual(oDesignTime.designtimeModule, undefined, "DesignTime module path not defined");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with transitive inheritance", function(assert) {
			return DTManagedObjectChild3.getMetadata().loadDesignTime().then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp3, "3.1", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.metaProp4, undefined, "DesignTime data was removed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, undefined, "DesignTime data was removed");
				assert.strictEqual(oDesignTime.metaPropDeep2, undefined, "DesignTime data was removed");
				assert.strictEqual(oDesignTime.templates.create, null, "create template is not inherited");
				assert.strictEqual(oDesignTime.designtimeModule, "DTManagedObjectChild3.designtime", "DesignTime module path defined");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with inheritance and local", function(assert) {
			return DTManagedObjectLocal.getMetadata().loadDesignTime().then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.local, "local", "DesignTime data was local");
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was removed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.templates.create, null, "create template is not inherited");
				assert.strictEqual(oDesignTime.designtimeModule, undefined, "DesignTime module path not defined");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with inheritance and module", function(assert) {
			return DTManagedObjectModule.getMetadata().loadDesignTime().then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.module, "module", "DesignTime data was added from module");
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.templates.create, null, "create template is not inherited");
				assert.strictEqual(oDesignTime.designtimeModule, "sap/test/DTManagedObjectChild4.designtime", "DesignTime module path defined");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with inheritance and instance that has no specific metadata", function(assert) {
			return DTManagedObjectModule.getMetadata().loadDesignTime(this.oInstanceWithoutSpecificDTMetadata).then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.module, "module", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.templates.create, null, "create template is not inherited");
				assert.strictEqual(oDesignTime.designtimeModule, "sap/test/DTManagedObjectChild4.designtime", "DesignTime module path defined");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with inheritance and invalid instance", function(assert) {
			return DTManagedObjectModule.getMetadata().loadDesignTime(null).then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.module, "module", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.templates.create, null, "create template is not inherited");
				assert.strictEqual(oDesignTime.designtimeModule, "sap/test/DTManagedObjectChild4.designtime", "DesignTime module path defined");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with inheritance and instance that has specific metadata", function(assert) {
			return DTManagedObjectModule.getMetadata().loadDesignTime(this.oInstanceWithSpecificDTMetadata).then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.instance, "instance", "DesignTime data was added from instance module");
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2-overwritten", "DesignTime data was overritten");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.templates.create, "instance specific dt metadata can set create template", "instance specific dt metadata can set create template");
				assert.strictEqual(oDesignTime.designtimeModule, "sap/test/DTManagedObjectChild4.designtime", "DesignTime module path defined");
			}).then(function(){
				//should not cache metadata from other instance!
				return DTManagedObjectModule.getMetadata().loadDesignTime(this.oOtherInstanceWithSpecificDTMetadata);
			}.bind(this)).then(function(oDesignTime){
				assert.strictEqual(oDesignTime.instance, "other-instance", "DesignTime data was added from instance module");
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.templates.create, null, "create template is not inherited");
				assert.strictEqual(oDesignTime.designtimeModule, "sap/test/DTManagedObjectChild4.designtime", "DesignTime module path defined");
			});
		});

		QUnit.test("loadDesignTime - with instance that has specific metadata as function", function(assert) {
			return DTManagedObjectModule.getMetadata().loadDesignTime(this.oInstanceWithSpecificDTMetadataFunction).then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.instance.getId(), "elementWithFunction", "DesignTime data was added from instance module");
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-instanceDTFunction", "DesignTime data was overritten");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.templates.create, null, "create template is not inherited");
				assert.strictEqual(oDesignTime.designtimeModule, "sap/test/DTManagedObjectChild4.designtime", "DesignTime module path defined");
			});
		});

		QUnit.test("loadDesignTime - with inheritance and instance that has specific metadata defined by designtime default mapping", function(assert) {
			ManagedObjectMetadata.setDesignTimeDefaultMapping({
				"defaultDT": "sap/ui/dt/defaultDesigntime/defaultDT.designtime"
			});
			return DTManagedObjectModule.getMetadata().loadDesignTime(this.oInstanceWithPredefinedDefaultDTMetadata).then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.module, "module", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-defaultDT", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.templates.create, null, "create template is not inherited");
				assert.strictEqual(oDesignTime.designtimeModule, "sap/test/DTManagedObjectChild4.designtime", "DesignTime module path defined");
			});
		});

		QUnit.test("loadDesignTime - all in parallel", function(assert) {
			return Promise.all([
				DTManagedObject.getMetadata().loadDesignTime(),
				DTManagedObjectChild.getMetadata().loadDesignTime(),
				NoDTManagedObjectChild2.getMetadata().loadDesignTime(),
				DTManagedObjectChild3.getMetadata().loadDesignTime()
			]).then(function(aDesignTimes) {

				// Only 3 require calls are expected, as one ManagedObject (NoDTManagedObjectChild2) does not have design time data
				sinon.assert.callCount(this.oRequireStub, 3);

				var oDTManagedObjectDesignTime = aDesignTimes[0];
				assert.strictEqual(oDTManagedObjectDesignTime.metaProp1, "1", "DesignTime data was passed");
				assert.strictEqual(oDTManagedObjectDesignTime.metaProp2, "2", "DesignTime data was passed");
				assert.strictEqual(oDTManagedObjectDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(oDTManagedObjectDesignTime.metaPropDeep2.metaPropDeep21, "deep21", "DesignTime data was passed");

				var oDTManagedObjectChildDesignTime = aDesignTimes[1];
				assert.strictEqual(oDTManagedObjectChildDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDTManagedObjectChildDesignTime.metaProp2, "2-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDTManagedObjectChildDesignTime.metaProp3, "3", "DesignTime data was passed");
				assert.strictEqual(oDTManagedObjectChildDesignTime.metaProp4, "4", "DesignTime data was passed");
				assert.strictEqual(oDTManagedObjectChildDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(oDTManagedObjectChildDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
				assert.strictEqual(oDTManagedObjectChildDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
				assert.strictEqual(oDTManagedObjectChildDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");

				var oNoDTManagedObjectChild2DesignTime = aDesignTimes[2];
				assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
				assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
				assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");

				var oDTManagedObjectChild3DesignTime = aDesignTimes[3];
				assert.strictEqual(oDTManagedObjectChild3DesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDTManagedObjectChild3DesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(oDTManagedObjectChild3DesignTime.metaProp3, "3.1", "DesignTime data was overwritten");
				assert.strictEqual(oDTManagedObjectChild3DesignTime.metaProp4, undefined, "DesignTime data was removed");
				assert.strictEqual(oDTManagedObjectChild3DesignTime.metaPropDeep.metaPropDeep1, "deep1-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDTManagedObjectChild3DesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
				assert.strictEqual(oDTManagedObjectChild3DesignTime.metaPropDeep.metaPropDeep3, undefined, "DesignTime data was removed");
				assert.strictEqual(oDTManagedObjectChild3DesignTime.metaPropDeep2, undefined, "DesignTime data was removed");

			}.bind(this));
		});

		QUnit.test("loadDesignTime - cache the results", function(assert) {
			var oDTManagedObjectMetadata = DTManagedObjectChild3.getMetadata();
			return oDTManagedObjectMetadata.loadDesignTime().then(function() {
				sinon.assert.callCount(this.oRequireStub, 3);
				this.oRequireStub.reset();
				return oDTManagedObjectMetadata.loadDesignTime().then(function() {
					assert.notOk(this.oRequireStub.called, "sap.ui.require was not called");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("loadDesignTime - cache the results implicitly (parent first)", function(assert) {
			return DTManagedObjectChild.getMetadata().loadDesignTime().then(function() {
				sinon.assert.callCount(this.oRequireStub, 2);
				this.oRequireStub.reset();
				return DTManagedObjectChild3.getMetadata().loadDesignTime().then(function() {
					sinon.assert.callCount(this.oRequireStub, 1);
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("loadDesignTime - cache the results implicitly (child first)", function(assert) {
			return DTManagedObjectChild3.getMetadata().loadDesignTime().then(function() {
				sinon.assert.callCount(this.oRequireStub, 3);
				this.oRequireStub.reset();
				return DTManagedObjectChild.getMetadata().loadDesignTime().then(function() {
					assert.notOk(this.oRequireStub.called, "sap.ui.require was not called");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("loadDesignTime - cache the results implicitly (child  with parent + other child with same parent)", function(assert) {
			return DTManagedObjectChild.getMetadata().loadDesignTime().then(function(oTestOuter) {
				sinon.assert.callCount(this.oRequireStub, 2);
				this.oRequireStub.reset();
				//previously the issue was that a derived control deleted the parents designtimeModule.
				//any other child did not set the correct designtimeModule path

				//load derived metadata DTManagedObjectChild3 that inherits DTManagedObject
				DTManagedObjectChild3.getMetadata().loadDesignTime().then(function(oTestOuter3) {
					sinon.assert.callCount(this.oRequireStub, 1);
					this.oRequireStub.reset();
					return DTManagedObject.getMetadata().loadDesignTime().then(function(oTestInner) {
						assert.strictEqual(oTestInner.designtimeModule, "DTManagedObject.designtime", "DesignTime module path defined DTManagedObjectChild");
					}.bind(this)).then(function() {
						assert.strictEqual(oTestOuter3.designtimeModule, "DTManagedObjectChild3.designtime", "DesignTime module path defined DTManagedObjectChild3");
					});
				}.bind(this));
				//load derived metadata DTManagedObjectChild3 that inherits DTManagedObjectChild
				DTManagedObjectChild.getMetadata().loadDesignTime().then(function(oTestInner) {
					return DTManagedObject.getMetadata().loadDesignTime().then(function(oTestInner2) {
						assert.strictEqual(oTestInner2.designtimeModule, "DTManagedObject.designtime", "DesignTime module path defined DTManagedObjectChild");
					}.bind(this)).then(function() {
						assert.strictEqual(oTestInner.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined DTManagedObjectChild, parent still valid");
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("loadDesignTime - cache the results with designtime only via inheritance", function(assert) {
			var oDTManagedObjectMetadataChild = NoDTManagedObjectChild2.getMetadata();
			return oDTManagedObjectMetadataChild.loadDesignTime().then(function(oDesignTime) {
				sinon.assert.callCount(this.oRequireStub, 2);
				this.oRequireStub.reset();
				return oDTManagedObjectMetadataChild.loadDesignTime().then(function() {
					assert.notOk(this.oRequireStub.called, "sap.ui.require was not called");
				}.bind(this));
			}.bind(this));
		});
	});


//-------------------------------------------------------------------------------------
// preload checks
//-------------------------------------------------------------------------------------
	function matcher(suffix) {
		return sinon.match(new RegExp(suffix));
	}
	var matcherLibPreload = sinon.match({
		url: matcher("library-preload\\.designtime\\.js$")
	});
	var matcherLibModule = sinon.match({
		url: matcher("library\\.designtime\\.js$")
	});
	var matcherDTModule = sinon.match({
		url: matcher("CustomData\\.designtime.js$")
	});

	QUnit.module("Design Time Library and Preload", {
		beforeEach: function(assert) {
			this.TestCorePlugin = {};
			this.TestCorePlugin.startPlugin = function(oCore, bOnInit) {
				this.oRealCore = oCore;
			}.bind(this);
			sap.ui.getCore().registerPlugin(this.TestCorePlugin);
			this.oldCfgPreload = this.oRealCore.oConfiguration.preload;
			var oClass = sap.ui.core.CustomData;
			this.oMetadata = oClass.getMetadata();
			this.vOldDesigntime = this.oMetadata._oDesignTime;
			//create a preload
			var aString = [];
			aString.push("sap.ui.predefine('sap/ui/core/designtime/library.designtime',[],function(){'use strict';return{};});");
			aString.push("sap.ui.predefine('sap/ui/core/designtime/CustomData.designtime',[],function(){'use strict';return{aggregations:{customData:{ignored:true}}};},false);");
			this.sPreloadJs = aString.join("\n");
		},
		afterEach: function(assert) {
			//reset the designtime stores
			this.oMetadata._oDesignTime = this.vOldDesigntime;
			this.oMetadata._oDesignTimePromise = null;
			this.oRealCore.oConfiguration.preload = this.oldCfgPreload;
			delete window.testlibs;
			sap.ui.getCore().unregisterPlugin(this.TestCorePlugin);
		}
	}, function () {
		QUnit.test("loadDesignTime - from core for custom data no preload", function(assert) {
			this.oRealCore.oConfiguration.preload = "off";
			this.spy(sap.ui, 'require');
			this.spy(sap.ui.loader._, 'loadJSResourceAsync');
			return this.oMetadata.loadDesignTime().then(function(oDesignTime) {
				assert.ok(sap.ui.loader._.loadJSResourceAsync.neverCalledWith("sap/ui/core/designtime/library-preload.designtime.js"), "library-preload.designtime.js was required");
				assert.ok(document.querySelectorAll("script[src*='library\.designtime\.js']").length === 1, "request send to sap/ui/core/designtime/library.designtime");
				assert.ok(document.querySelectorAll("script[src*='CustomData\.designtime\.js']").length === 1, "request send to sap/ui/core/designtime/CustomData.designtime");
				assert.ok(sap.ui.require.calledWith(["sap/ui/core/designtime/library.designtime"]), "library.designtime.js was required");
				assert.ok(sap.ui.require.calledWith(["sap/ui/core/designtime/CustomData.designtime"]), "CustomData.designtime.js was required");
				assert.ok(oDesignTime._oLib !== undefined, "sap/ui/core/designtime/library.designtime.js is available in designtime object");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - from core for custom data with preload async", function(assert) {
			//async configuration simulation
			this.oRealCore.oConfiguration.preload = "async";
			this.spy(sap.ui, 'require');
			this.spy(sap.ui.loader._, 'loadJSResourceAsync');

			//return the preload for ajax calls
			this.oStub = this.stub(jQuery, "ajax");
			this.oStub.withArgs(matcherLibPreload).callsArgWithAsync(1, this.sPreloadJs);

			return this.oMetadata.loadDesignTime().then(function(oDesignTime) {
				assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith("sap/ui/core/designtime/library-preload.designtime.js"), "library.designtime-preload.js was loaded async");
				assert.ok(jQuery.ajax.neverCalledWith(matcherLibModule), "request not send to sap/ui/core/designtime/library.designtime");
				assert.ok(jQuery.ajax.neverCalledWith(matcherDTModule), "request not send to sap/ui/core/designtime/CustomData.designtime");
				assert.ok(sap.ui.require.calledWith(["sap/ui/core/designtime/library.designtime"]), "library.designtime.js was required");
				assert.ok(sap.ui.require.calledWith(["sap/ui/core/designtime/CustomData.designtime"]), "CustomData.designtime.js was required");
				assert.ok(oDesignTime._oLib !== undefined, "sap/ui/core/designtime/library.designtime.js loaded");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - from core for custom data with preload sync", function(assert) {
			//sync configuration simulation
			this.oRealCore.oConfiguration.preload = "sync";
			this.spy(sap.ui, 'require');
			this.spy(sap.ui.loader._, 'loadJSResourceAsync');

			//return the preload for ajax calls
			this.oStub = this.stub(jQuery, "ajax");
			this.oStub.withArgs(matcherLibPreload).callsArgWithAsync(1, this.sPreloadJs);

			return this.oMetadata.loadDesignTime().then(function(oDesignTime) {
				assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith("sap/ui/core/designtime/library-preload.designtime.js"), "library.designtime-preload.js was loaded async");
				assert.ok(jQuery.ajax.neverCalledWith(matcherLibModule), "request not send to sap/ui/core/designtime/library.designtime");
				assert.ok(jQuery.ajax.neverCalledWith(matcherDTModule), "request not send to sap/ui/core/designtime/CustomData.designtime");
				assert.ok(sap.ui.require.calledWith(["sap/ui/core/designtime/library.designtime"]), "library.designtime.js was required");
				assert.ok(sap.ui.require.calledWith(["sap/ui/core/designtime/CustomData.designtime"]), "CustomData.designtime.js was required");
				assert.ok(oDesignTime._oLib !== undefined, "sap/ui/core/designtime/library.designtime.js loaded");
			}.bind(this));
		});
	});

	QUnit.module("Design Time Metadata with Scopes", {
		beforeEach: function() {
			var oMetadata = {
				designtime: true
			};

			DTManagedObject = ManagedObject.extend("DTManagedObject", {
				metadata: oMetadata
			});

			DTManagedObjectChild = DTManagedObject.extend("DTManagedObjectChild", {
				metadata: oMetadata
			});

			this.oDTForManagedObject = {
				"default": {
					metaProp1: "1",
					metaProp2: "2",
					metaPropDeep: {
						metaPropDeep1: "deep1"
					},
					metaPropDeep2: {
						metaPropDeep21: "deep21"
					}
				},
				"foo": {
					metaProp1: null,
					metaPropDeep2: {
						metaPropDeep21: "deep21-foo"
					}
				}
			};

			this.oDTForManagedObjectChild = {
				metaProp2: "2-overwritten",
				metaProp3: "3",
				metaProp4: "4",
				metaPropDeep: {
					metaPropDeep2: "deep2",
					metaPropDeep3: "deep3"
				},
				metaPropDeep2: {
					metaPropDeep21: "deep21-overwritten"
				}
			};

			this.oDTForInstance = {
				instance: "instance",
				metaPropDeep: {
					metaPropDeep2: "deep2-overwritten"
				}
			};

			this.oDTForOtherInstance = {
				"default": {
					instance: "other-instance",
					metaPropDeep: {
						metaPropDeep3: "deep3-overwritten"
					}
				},
				"foo": {
					metaPropDeep: {
						metaPropDeep3: null
					},
					metaPropDeep2: {
						metaPropDeep21: null
					}
				}
			};

			// stub the DesignTime require calls (make sure the sap.ui.require callback is called asynchronously)
			this.oRequireStub = sinon.stub(sap.ui, "require");

			this.oRequireStub.withArgs(["DTManagedObject.designtime"]).callsArgWithAsync(1, this.oDTForManagedObject);
			this.oRequireStub.withArgs(["DTManagedObjectChild.designtime"]).callsArgWithAsync(1, this.oDTForManagedObjectChild);
			this.oRequireStub.withArgs(["sap/test/instanceSpecific.designtime"]).callsArgWithAsync(1, this.oDTForInstance);
			this.oRequireStub.withArgs(["sap/test/otherInstanceSpecific.designtime"]).callsArgWithAsync(1, this.oDTForOtherInstance);

			this.oInstanceWithoutSpecificDTMetadata = new Element();
			this.oInstanceWithSpecificDTMetadata = new Element({
				customData: [
					new CustomData({
						key: "sap-ui-custom-settings",
						value: {
							"sap.ui.dt": {
								designtime: "sap/test/instanceSpecific.designtime"
							}
						}
					})
				]
			});
			this.oOtherInstanceWithSpecificDTMetadata = new Element({
				customData: [
					new CustomData({
						key: "sap-ui-custom-settings",
						value: {
							"sap.ui.dt": {
								designtime: "sap/test/otherInstanceSpecific.designtime"
							}
						}
					})
				]
			});
		},

		afterEach: function() {
			DTManagedObject.getMetadata()._oDesignTime = null;
			DTManagedObject.getMetadata()._oDesignTimePromise = null;

			DTManagedObjectChild.getMetadata()._oDesignTime = null;
			DTManagedObjectChild.getMetadata()._oDesignTimePromise = null;

			DTManagedObject =
			DTManagedObjectChild = null;

			this.oInstanceWithoutSpecificDTMetadata.destroy();
			this.oInstanceWithSpecificDTMetadata.destroy();
			this.oOtherInstanceWithSpecificDTMetadata.destroy();

			this.oRequireStub.restore();
		}
	}, function () {
		QUnit.test("loadDesignTime - no inheritance ('default' scope)", function(assert) {
			return DTManagedObject.getMetadata().loadDesignTime().then(function(mDesignTime) {
				assert.ok(mDesignTime, "DesignTime was passed");
				assert.strictEqual(mDesignTime.metaProp1, "1", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaProp2, "2", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaPropDeep2.metaPropDeep21, "deep21", "DesignTime data was passed");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - no inheritance ('foo' scope)", function(assert) {
			return DTManagedObject.getMetadata().loadDesignTime(null, 'foo').then(function(mDesignTime) {
				assert.ok(mDesignTime, "DesignTime was passed");
				assert.strictEqual(mDesignTime.metaProp1, null, "DesignTime data was overwritten");
				assert.strictEqual(mDesignTime.metaProp2, "2", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaPropDeep2.metaPropDeep21, "deep21-foo", "DesignTime data was overwritten");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - no inheritance (invalid scope name #1)", function(assert) {
			return DTManagedObject.getMetadata().loadDesignTime(null, 'bar').then(function(mDesignTime) {
				assert.ok(mDesignTime, "DesignTime was passed");
				assert.strictEqual(mDesignTime.metaProp1, "1", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaProp2, "2", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaPropDeep2.metaPropDeep21, "deep21", "DesignTime data was passed");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - no inheritance (invalid scope name #2)", function(assert) {
			return DTManagedObject.getMetadata().loadDesignTime(null, {}).then(function(mDesignTime) {
				assert.ok(mDesignTime, "DesignTime was passed");
				assert.strictEqual(mDesignTime.metaProp1, "1", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaProp2, "2", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaPropDeep2.metaPropDeep21, "deep21", "DesignTime data was passed");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with simple inheritance ('default' scope)", function(assert) {
			return DTManagedObjectChild.getMetadata().loadDesignTime().then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with simple inheritance ('foo' scope)", function(assert) {
			return DTManagedObjectChild.getMetadata().loadDesignTime(null, 'foo').then(function(oDesignTime) {
				assert.strictEqual(oDesignTime.metaProp1, null, "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
				assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(oDesignTime.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with inheritance and instance that has no specific metadata ('default' scope)", function(assert) {
			return DTManagedObjectChild.getMetadata().loadDesignTime(this.oInstanceWithoutSpecificDTMetadata).then(function(mDesignTime) {
				assert.strictEqual(mDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaProp2, "2-overwritten", "DesignTime data was overwritten");
				assert.strictEqual(mDesignTime.metaProp3, "3", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaProp4, "4", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
				assert.strictEqual(mDesignTime.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined");
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with inheritance and instance that has specific metadata ('default' scope)", function(assert) {
			return DTManagedObjectChild.getMetadata().loadDesignTime(this.oInstanceWithSpecificDTMetadata).then(function(mDesignTime) {
				assert.strictEqual(mDesignTime.instance, "instance", "DesignTime data was added from instance module");
				assert.strictEqual(mDesignTime.metaProp1, "1", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep2, "deep2-overwritten", "DesignTime data was overritten");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined");
			}).then(function(){
				//should not cache metadata from other instance!
				return DTManagedObjectChild.getMetadata().loadDesignTime(this.oOtherInstanceWithSpecificDTMetadata).then(function(mDesignTime){
					assert.strictEqual(mDesignTime.instance, "other-instance", "DesignTime data was added from instance module");
					assert.strictEqual(mDesignTime.metaProp1, "1", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaProp3, "3", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaProp4, "4", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep3, "deep3-overwritten", "DesignTime data was overritten");
					assert.strictEqual(mDesignTime.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined");
				});
			}.bind(this));
		});

		QUnit.test("loadDesignTime - with inheritance and instance that has specific metadata ('foo' scope)", function(assert) {
			return DTManagedObjectChild.getMetadata().loadDesignTime(this.oInstanceWithSpecificDTMetadata, 'foo').then(function(mDesignTime) {
				assert.strictEqual(mDesignTime.instance, "instance", "DesignTime data was added from instance module");
				assert.strictEqual(mDesignTime.metaProp1, null, "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaProp3, "3", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaProp4, "4", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep2, "deep2-overwritten", "DesignTime data was overritten");
				assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was inherited");
				assert.strictEqual(mDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overritten");
				assert.strictEqual(mDesignTime.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined");
			}).then(function(){
				//should not cache metadata from other instance!
				return DTManagedObjectChild.getMetadata().loadDesignTime(this.oOtherInstanceWithSpecificDTMetadata, 'foo').then(function(mDesignTime){
					assert.strictEqual(mDesignTime.instance, "other-instance", "DesignTime data was added from instance module");
					assert.strictEqual(mDesignTime.metaProp1, null, "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaProp3, "3", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaProp4, "4", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was inherited");
					assert.strictEqual(mDesignTime.metaPropDeep.metaPropDeep3, null, "DesignTime data was overritten");
					assert.strictEqual(mDesignTime.metaPropDeep2.metaPropDeep21, null, "DesignTime data was overritten");
					assert.strictEqual(mDesignTime.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined");
				});
			}.bind(this));
		});
	});
});
