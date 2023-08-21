/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Control",
	"sap/ui/core/ResizeHandler",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Log, Control, ResizeHandler, createAndAppendDiv, nextUIUpdate) {
	"use strict";

	// setup page content
	createAndAppendDiv("resizeArea", createAndAppendDiv("resizeAreaContainer"));
	createAndAppendDiv("content");

	function setStyle(id, style) {
		Object.assign(document.getElementById(id).style, style);
	}

	setStyle("resizeAreaContainer", {
		backgroundColor: "cyan",
		width: "100px",
		height: "100px",
		position: "relative"
	});
	setStyle("resizeArea", {
		backgroundColor: "blue",
		width: "100%",
		height: "100%",
		position: "absolute",
		right: "0",
		top: "0"
	});

	var lastResizeTarget = null;
	var lastResizeTargetCtrl = null;
	var lastSize = null;

	function reset() {
		lastResizeTarget = null;
		lastResizeTargetCtrl = null;
		lastSize = null;
	}

	function _register(oRef) {
		var sResizeListenerId = ResizeHandler.register(oRef, doOnResize);
		lastResizeTarget = null;
		lastResizeTargetCtrl = null;
		lastSize = null;
		return sResizeListenerId;
	}

	function doOnResize(oEvent) {
		lastResizeTarget = oEvent.target;
		lastResizeTargetCtrl = oEvent.control;
		lastSize = oEvent.size;
		QUnit.config.current.assert.ok(true, "ResizeHandler called");
	}

	var TestControl = Control.extend("TestControl", {
		metadata : {
			properties : {
				"height" : {type: "sap.ui.core.CSSSize", defaultValue: "100px"},
				"width" : {type: "sap.ui.core.CSSSize", defaultValue: "100px"}
			}
		},

		renderer : {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl)
					.style("width", oControl.getWidth())
					.style("height", oControl.getHeight())
					.class("ResizeAreaContainer")
					.openEnd();

					oRm.openStart("div", oControl.getId() + "-inner")
						.class("ResizeArea")
						.openEnd()
						.close("div");

				oRm.close("div");
			}
		}
	});

	var control = new TestControl("TestControl", {width: "100px", height: "100px"});
	control.placeAt("content");


	// Test functions

	QUnit.module("Basic");

	QUnit.test("Calling Constructor", function(assert) {
		var oLogSpy = this.spy(Log, "error");
		var sLogMessage = "ResizeHandler is designed as a singleton and should not be created manually! Please require 'sap/ui/core/ResizeHandler' instead and use the module export directly without using 'new'.";

		var oResizeHandler = new ResizeHandler();
		assert.ok(oResizeHandler, "public constructor via ResizeHandler module export");

		// check for error log
		assert.equal(oLogSpy.callCount, 1);
		assert.equal(oLogSpy.getCall(0).args[0], sLogMessage, "Calling the constructor should log an error");
	});

	/**
	 * @deprecated As of version 1.110
	 */
	QUnit.module("[Compatibility] Legacy API");

	QUnit.test("Accessing Resizehandler via globals", function(assert) {
		assert.equal(sap.ui.core.ResizeHandler.register, ResizeHandler.register);
		assert.equal(sap.ui.core.ResizeHandler.deregister, ResizeHandler.deregister);
	});

	QUnit.test("Module export stability", function(assert) {
		assert.equal(ResizeHandler, sap.ui.core.ResizeHandler, "Global export and Module export are identical");
	});

	QUnit.test("Calling Constructor via globals", function(assert) {
		var oLogSpy = this.spy(Log, "error");
		var sLogMessage = "ResizeHandler is designed as a singleton and should not be created manually! Please require 'sap/ui/core/ResizeHandler' instead and use the module export directly without using 'new'.";

		var oResizeHandler = new sap.ui.core.ResizeHandler();
		assert.ok(oResizeHandler, "public constructor via globals works");

		// check for error log
		assert.equal(oLogSpy.callCount, 1);
		assert.equal(oLogSpy.getCall(0).args[0], sLogMessage, "Correct error log");
	});



	QUnit.module("DOM Element Resize");

	QUnit.test("Check DOM Resize", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);

		setStyle("resizeAreaContainer", {
			width:"150px",
			height:"150px"
		});

		setTimeout(function(){
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check that no DOM resize event is fired after deregister", function(assert) {
		var done = assert.async();
		assert.expect(3);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);

		// move 1px up from last test
		setStyle("resizeAreaContainer", {
			width:"151px",
			height:"150px"
		});

		setTimeout(function(){
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);

			// check if handler is not called a second time after deregister
			// (-1px again)
			reset();

			setStyle("resizeAreaContainer", {
				width:"150px",
				height:"150px"
			});

			setTimeout(function() {
				// lastResizeTarget must not be updated
				assert.ok(lastResizeTarget == null, "Listener should not have been called on DOM Resize");
				done();
			}, 300);
		}, 300);
	});

	QUnit.test("Check DOM Resize width +1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", {
			width: "151px",
			height: "150px"
		});
		setTimeout(function(){
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize width -1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", {
			width: "150px",
			height: "150px"
		});
		window.setTimeout(function(){
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize height +1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", {
			width: "150px",
			height: "151px"
		});
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize height -1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", {
			width: "150px",
			height: "150px"
		});
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize width and height +1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", {
			width: "151px",
			height: "151px"
		});
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize width and height -1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", {
			width: "150px",
			height: "150px"
		});
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize width and height +101", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", {
			width: "251px",
			height: "251px"
		});
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize width and height -101", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", {
			width: "150px",
			height: "150px"
		});
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("DetachListener", function(assert) {
		var done = assert.async();
		assert.expect(1);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		ResizeHandler.deregister(sResizeListenerId);
		setStyle("resizeAreaContainer", {
			width: "151px",
			height: "150px"
		});
		setTimeout(function() {
			assert.ok(lastResizeTarget == null, "Listener should be NOT be called on DOM Resize after deregistering: " + lastResizeTarget);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize while setting display:none", function(assert) {
		var done = assert.async();
		assert.expect(7);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		assert.equal(oResizeAreaDom.offsetHeight, 150, "height should be 150px");

		// now make the parent invisible
		setStyle("resizeAreaContainer", {
			width: "151px",
			height: "150px",
			display: "none"
		});
		assert.equal(oResizeAreaDom.offsetHeight, 0, "height should be 0px when the parent is display:none");

		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize due to display:none");
			lastResizeTarget = null;

			// now make the parent visible again
			setStyle("resizeAreaContainer", {
				width: "151px",
				height: "150px",
				display: "block"
			});
			assert.equal(oResizeAreaDom.offsetHeight, 150, "height should be 150px again when the parent is display:block");

			setTimeout(function() {
				assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize due to display:none");
				ResizeHandler.deregister(sResizeListenerId);
				done();
			}, 300);
		}, 300);
	});


	QUnit.module("Control Resize");

	QUnit.test("Check Control Resize - With Rerendering", async function(assert) {
		var done = assert.async();
		assert.expect(3);
		var sResizeListenerId = _register(control);

		control.setWidth("150px");
		control.setHeight("150px");
		await nextUIUpdate();

		setTimeout(function() {
			assert.ok(lastResizeTargetCtrl == control, "Listener should be called on DOM Resize");
			assert.ok(lastSize && lastSize.width == 150 && lastSize.height == 150, "New Size given");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check Control Resize - Dom Changes", function(assert) {
		var done = assert.async();
		assert.expect(3);
		var sResizeListenerId = _register(control);

		control.$().attr("style", "width:151px;height:149px;");

		setTimeout(function() {
			assert.ok(lastResizeTargetCtrl == control, "Listener should be called on DOM Resize");
			assert.ok(lastSize && lastSize.width == 151 && lastSize.height == 149, "New Size given");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check Control Resize - After Destroy no resize should be triggered", async function(assert) {
		assert.expect(4);
		var done = assert.async();
		_register(control);

		control.setWidth("151px");
		control.setHeight("150px");
		await nextUIUpdate();

		setTimeout(async function() {
			assert.ok(lastResizeTargetCtrl == control, "Listener should be called on DOM Resize");
			assert.ok(lastSize && lastSize.width == 151 && lastSize.height == 150, "New Size given");

			reset();

			// sap.ui.core.Control#destroy implicitly deregisters all listeners for a control!
			control.destroy();

			// after destruction, this should not lead to another resize-handler call
			control.setWidth("150px");
			control.setHeight("150px");
			await nextUIUpdate();

			setTimeout(function() {
				assert.ok(lastResizeTargetCtrl == null, "Listener should not have been called on control resize");
				done();
			}, 300);
		}, 300);
	});

	QUnit.module("Suspend/Resume resize listeners");

	QUnit.test("Suspend", function (assert) {

		var oResizeAreaDom = document.getElementById("resizeArea"),
			oResizeAreaContainerDom = document.getElementById("resizeAreaContainer"),
			iResizeAreaContainerWidth = oResizeAreaContainerDom.offsetWidth,
			sResizeListenerId = _register(oResizeAreaDom),
			done = assert.async();

		assert.expect(1);

		ResizeHandler.suspend(document.body);

		// resize while suspended
		oResizeAreaContainerDom.style.width = ++iResizeAreaContainerWidth + "px";

		setTimeout(function() {
			assert.strictEqual(lastResizeTarget, null, "Listener should not be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			ResizeHandler.resume(document.body);
			done();
		}, 300);
	});

	QUnit.test("Resume", function (assert) {

		var oResizeAreaDom = document.getElementById("resizeArea"),
			oResizeAreaContainerDom = document.getElementById("resizeAreaContainer"),
			iResizeAreaContainerWidth = oResizeAreaContainerDom.offsetWidth,
			sResizeListenerId = _register(oResizeAreaDom),
			done = assert.async();

		assert.expect(3);

		ResizeHandler.suspend(document.body);

		// resize while suspended
		oResizeAreaContainerDom.style.width = ++iResizeAreaContainerWidth + "px";

		ResizeHandler.resume(document.body);

		setTimeout(function() {
			assert.strictEqual(lastResizeTarget, oResizeAreaDom, "Listener should be called after DOM Resize");
			assert.strictEqual(lastSize.width, oResizeAreaContainerDom.offsetWidth, "New size given");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("it should call the callback function (registered via .isSuspended(oDomRef, fnCallback)) once " +
				"the DOM element is resumed after it was previously suspended", function(assert) {

		// arrange
		var oResizeAreaDomRef = document.getElementById("resizeArea"),
			sResizeListenerId = _register(oResizeAreaDomRef),
			oSpy = this.spy();

		ResizeHandler.suspend(oResizeAreaDomRef);
		ResizeHandler.isSuspended(oResizeAreaDomRef, oSpy);

		// act
		ResizeHandler.resume(oResizeAreaDomRef);

		// assert
		assert.strictEqual(oSpy.callCount, 1, "it should call the callback");

		// cleanup
		ResizeHandler.deregister(sResizeListenerId);
	});
});
