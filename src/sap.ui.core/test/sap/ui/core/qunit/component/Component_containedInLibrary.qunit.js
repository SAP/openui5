/*global QUnit sinon */
sap.ui.define([
	"sap/ui/VersionInfo",
	"sap/ui/core/Component",
	"sap/ui/core/Lib"
], function(VersionInfo, Component, Library) {
	"use strict";

	function noop() {}

	QUnit.module("When a Component is contained in a Library,", {
		beforeEach: function() {
			this.oGetTransitiveDependencyForComponentStub = sinon.stub(VersionInfo, "_getTransitiveDependencyForComponent");
			this.oGetTransitiveDependencyForComponentStub.withArgs("testdata.componentContainedInLibrary.Comp1").returns({
				dependencies: ["sap.m", "sap.ui.core", "sap.ui.layout"],
				hasOwnPreload: false,
				library: "testdata.componentContainedInLibrary"
			});
			this.oGetTransitiveDependencyForComponentStub.withArgs("testdata.componentContainedInLibrary.Comp2").returns({
				dependencies: ["sap.m", "sap.ui.core", "sap.ui.layout", "sap.ui.unified"],
				hasOwnPreload: true,
				library: "testdata.componentContainedInLibrary"
			});
		},
		afterEach: function() {
			this.oGetTransitiveDependencyForComponentStub.restore();
		}
	});

	QUnit.test("and bundled as part of the library-preload...", function(assert) {
		var success = Promise.resolve();
		var loadLibs = this.stub(Library, "_load").returns(success);
		var loadPreload = this.stub(sap.ui.loader._, "loadJSResourceAsync").returns(success);

		return Component.create({
			name: "testdata.componentContainedInLibrary.Comp1",
			manifest: false
		}).catch(noop).finally(function() {
			assert.ok(loadLibs.calledWith(
				sinon.match.array.contains(["sap.m", "sap.ui.core", "sap.ui.layout", "testdata.componentContainedInLibrary"])),
				"...then that library should be implicitly loaded");
			assert.ok(
				loadPreload.neverCalledWith(sinon.match(/testdata\/componentContainedInLibrary\/Comp1\/Component-preload\.js$/)),
				"...then no Component-preload file should be requested for the component");
		});
	});

	QUnit.test("and bundled separately...", function(assert) {
		var success = Promise.resolve();
		var loadLibs = this.stub(Library, "_load").returns(success);
		var loadPreload = this.stub(sap.ui.loader._, "loadJSResourceAsync").returns(success);

		return Component.create({
			name: "testdata.componentContainedInLibrary.Comp2",
			manifest: false
		}).catch(noop).finally(function() {
			assert.ok(
				loadLibs.neverCalledWith(sinon.match.array.contains(["testdata.componentContainedInLibrary"])),
				"...then the containing library should not be loaded");
			assert.ok(
				loadPreload.calledWith(sinon.match(/testdata\/componentContainedInLibrary\/Comp2\/Component-preload\.js$/)),
				"...then a Component-preload file should be requested for the component");
		});
	});

});
