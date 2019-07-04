	/*global QUnit, my */
	sap.ui.define([
		"sap/ui/base/Object",
		"sap/ui/core/Control",
		"sap/ui/core/Element",
		"sap/m/Button",
		"sap/m/Input",
		"sap/ui/qunit/utils/createAndAppendDiv"
	], function(BaseObject, Control, Element, Button, Input, createAndAppendDiv) {
		"use strict";

		createAndAppendDiv("content");

		var globalState = "initial";

		QUnit.test("Extend function", function(assert) {
			assert.ok(BaseObject.extend, "Object.extend() must exist");
			assert.equal(typeof BaseObject.extend, "function", "Object.extend() must be a function");

			assert.ok(Control.extend, "Control.extend() must exist");
			assert.equal(typeof Control.extend, "function", "Control.extend() must be a function");

			assert.ok(Button.extend, "Button.extend() must exist");
			assert.equal(typeof Button.extend, "function", "Button.extend() must be a function");
		});





		/* test creating a control from scratch */


		QUnit.test("Extend sap.ui.core.Control", function(assert) {
			assert.equal(window.my, undefined, "'my' should not be defined yet");

			// define control
			Control.extend("my.lib.MyControl", {
				metadata : {
					properties : {
						"text" : "string",
						"rows" : {
							type : "int"
						}
					},
					aggregations : {
						"comma" : { type:"sap.ui.core.Control", multiple:false },
						"dots" : {name:"dots",type:"sap.ui.core.Control",multiple:true,singularName:"dut"}
					},
					associations : {
						"assi" : {name:"assi",type:"sap.m.Button",multiple:false}
					},
					events : {
						"somethingHappened" : "somethingHappened"
					}
				},

				init : function() {
					this._state = "initial";
				},

				add : function(x, y) {
					return x + y;
				},

				_secret : function() {
					this._state = "initial";
					return "but it's a secret!";
				},

				onfocusin : function() {
					this._state = "hadFocus";
				},

				renderer : function(rm, c) {
					rm.write("<span tabindex='0'");
					rm.writeControlData(c);
					rm.write(">", c.getText(), "</span>");
				}
			});

			// check control type
			assert.ok(my.lib.MyControl, "my.lib.MyControl should be defined now");
		});

		QUnit.module("", {
			beforeEach: function() {
				this.myControl = new my.lib.MyControl("myControl", {
					text : "test"
				});
			},
			afterEach: function() {
				this.myControl.destroy();
				this.myControl = null;
			}
		});

		QUnit.test("Instantiate new control type", function(assert) {

			// check control instance
			assert.ok(this.myControl, "myControl should be a control instance now");
			assert.ok(this.myControl instanceof my.lib.MyControl, "myControl should be an instance of my.lib.MyControl");
			assert.ok(this.myControl instanceof Control, "myControl should inherit from sap.ui.Core.Control");

			// renderer should not be added as function...
			assert.equal(this.myControl.renderer, undefined, "renderer should not be added as function");

			// ...but a renderer should exist now
			assert.ok(my.lib.MyControlRenderer, "my.lib.MyControlRenderer should be defined"); // TODO: is this the case?
			assert.equal(typeof my.lib.MyControlRenderer.render, "function", "my.lib.MyControlRenderer.render must be a function");
		});


		QUnit.test("Properties", function(assert) {
			assert.expect(7);

			// test generation of setter and getter
			assert.ok(this.myControl.getText, "getter for property 'text' should be created");
			assert.equal(typeof this.myControl.getText, "function", "myControl.getText must be a function");
			assert.ok(this.myControl.setText, "setter for property 'text' should be created");
			assert.equal(typeof this.myControl.setText, "function", "myControl.setText must be a function");

			// test setter and getter
			assert.equal(this.myControl.getText(), "test", "value of 'text' property should be 'test'");
			this.myControl.setText("test2");
			assert.equal(this.myControl.getText(), "test2", "value of 'text' property should be 'test2' now");

			// test validation
			try {
				this.myControl.setRows("wrong type: string");
			} catch (e) {
				assert.ok(true, "this check must be reached");
			}
		});


		QUnit.test("Methods", function(assert) {
			assert.equal(this.myControl.add, my.lib.MyControl.prototype.add, "myControl's add function should actually be a function of the my.lib.MyControl.prototype");
			assert.equal(this.myControl.add(1, 2), 3, "myControl's add function should work");
		});


		QUnit.test("Aggregations", function(assert) {
			assert.equal(typeof this.myControl.getComma, "function", "myControl.getComma should be an aggregation getter");
			assert.equal(typeof this.myControl.setComma, "function", "myControl.setComma should be an aggregation setter");
			assert.equal(typeof this.myControl.destroyComma, "function", "myControl.destroyComma should be an aggregation destructor");

			assert.equal(typeof this.myControl.getDots, "function", "myControl.getDots should be an aggregation getter");
			assert.equal(typeof this.myControl.addDut, "function", "myControl.addDut should be an aggregation mutator");
			assert.equal(typeof this.myControl.removeDut, "function", "myControl.removeDut should be an aggregation mutator");
			assert.equal(typeof this.myControl.indexOfDut, "function", "myControl.indexOfDut should be an aggregation function");
			assert.equal(typeof this.myControl.removeAllDots, "function", "myControl.removeAllDots should be an aggregation function");
			assert.equal(typeof this.myControl.destroyDots, "function", "myControl.destroyDots should be an aggregation function");

			this.myControl.addDut(new Button("myBtn1"));
			var agg = this.myControl.getDots();
			assert.equal(agg.length, 1, "one Button should be aggregated");
			assert.equal(agg[0].getId(), "myBtn1", "'dots' aggregation should work");
		});


		QUnit.test("Associations", function(assert) {
			assert.equal(typeof this.myControl.setAssi, "function", "myControl.setAssi should be an association setter");
			assert.equal(typeof this.myControl.getAssi, "function", "myControl.getAssi should be an association getter");

			this.myControl.setAssi(new Button("myBtn2"));
			assert.equal(this.myControl.getAssi(), "myBtn2", "'assi' association should work");
		});


		QUnit.test("Control Events", function(assert) {
			assert.equal(globalState, "initial", "global state should be initialized");

			// test event registering methods
			assert.equal(typeof this.myControl.fireSomethingHappened, "function", "myControl.fireSomethingHappened should be a function");
			assert.equal(typeof this.myControl.attachSomethingHappened, "function", "myControl.attachSomethingHappened should be a function");
			assert.equal(typeof this.myControl.detachSomethingHappened, "function", "myControl.detachSomethingHappened should be a function");

			this.myControl.attachSomethingHappened(function(){
				globalState = "somethingHappened";
			});

			this.myControl.fireSomethingHappened();

			assert.equal(globalState, "somethingHappened", "global state should be 'somethingHappened' after the event was fired");
		});


		QUnit.test("Metadata", function(assert) {
			var md = this.myControl.getMetadata();

			var properties = md.getProperties();
			assert.equal(Object.keys(properties).length, 2, "there should be two local public properties");
			var properties = md.getAllProperties();
			assert.equal(Object.keys(properties).length, 7, "there should be seven public properties");
			assert.ok(properties.text, "there should be a 'text' property");
			assert.equal(properties.text.type, "string", "'text' should be a string property");

			var methods = md.getAllPublicMethods();
			assert.ok(methods.length > 0, "there should be at least one public method");
			assert.ok(methods.indexOf("add") >= 0, "'add' should be one of the public method");
			assert.ok(methods.indexOf("init") < 0, "'init' must not be part of the public methods");
			assert.ok(methods.indexOf("_secret") < 0, "'_secret' must not be part of the public methods");
			assert.ok(methods.indexOf("onfocusin") < 0, "'onfocusin' must not be part of the public methods");
			assert.ok(methods.indexOf("renderer") < 0, "'renderer' must not be part of the public methods");

			var aggregations = md.getAggregations();
			assert.equal(Object.keys(aggregations).length, 2, "there should be one public aggregation");
			assert.ok(aggregations.dots, "there should be a 'dots' aggregation");
			var aggregations = md.getAllAggregations();
			assert.equal(Object.keys(aggregations).length, 7, "there should be 7 public aggregations across the hierarchy");
			assert.ok(aggregations.dots, "there should be a 'dots' aggregation");

			var associations = md.getAllAssociations();
			assert.equal(Object.keys(associations).length, 1, "there should be one public association");
			assert.ok(associations.assi, "there should be a 'assi' association");
			assert.equal(associations.assi.type, "sap.m.Button", "the 'assi' association should be of type Button");

			var events = md.getAllEvents();
			assert.equal(Object.keys(events).length, 7, "there should be 7 public events");
			assert.ok(events.somethingHappened, "there should be a 'somethingHappened' event");
		});

		QUnit.test("Metadata singluar names", function(assert) {
			var oClass = Control.extend("my.lib.MyGrammarControl", {
				metadata : {
					aggregations : {
						"children" : {},
						"smarties" : {},
						"leaves" : {},
						"potatoes" : {},
						"addresses" : {},
						"churches" : {},
						"boxes" : {},
						"crashes" : {},
						"parts" : {},
						// special case: composite names
						"invisibleChildren" : {},
						// special case: for 'content', singular and plural should be the same
						"content" : {},
						// negative test: don't overwrite predefined singular names
						"axes" : {singularName : "axe"},
						// negative test: create no singular name for singular aggregations
						"hans" : {multiple : false}
					},

					associations : {
						"multiples" : { multiple : true }
					}
				}
			});

			var md = oClass.getMetadata();
			var aggregations = md.getAggregations();
			assert.equal(aggregations.children.singularName, "child");
			assert.equal(typeof oClass.prototype.getChildren, "function");
			assert.equal(typeof oClass.prototype.addChild, "function");
			assert.equal(aggregations.smarties.singularName, "smarty");
			assert.equal(typeof oClass.prototype.getSmarties, "function");
			assert.equal(typeof oClass.prototype.addSmarty, "function");
			assert.equal(aggregations.leaves.singularName, "leaf");
			assert.equal(aggregations.potatoes.singularName, "potato");
			assert.equal(aggregations.addresses.singularName, "address");
			assert.equal(aggregations.churches.singularName, "church");
			assert.equal(aggregations.boxes.singularName, "box");
			assert.equal(aggregations.crashes.singularName, "crash");
			assert.equal(aggregations.parts.singularName, "part");
			assert.equal(aggregations.invisibleChildren.singularName, "invisibleChild");
			assert.equal(typeof oClass.prototype.getInvisibleChildren, "function");
			assert.equal(typeof oClass.prototype.addInvisibleChild, "function");
			assert.equal(aggregations.content.singularName, "content");
			assert.equal(typeof oClass.prototype.getContent, "function");
			assert.equal(typeof oClass.prototype.addContent, "function");
			assert.equal(aggregations.axes.singularName, "axe");
			assert.equal(typeof aggregations.hans.singularName, "undefined");
			assert.equal(typeof oClass.prototype.getHans, "function");
			assert.equal(typeof oClass.prototype.setHans, "function");
			assert.equal(typeof oClass.prototype.addHan, "undefined");

			var associations = md.getAssociations();
			assert.equal(associations.multiples.singularName, "multiple");
			assert.equal(typeof oClass.prototype.getMultiples, "function");
			assert.equal(typeof oClass.prototype.addMultiple, "function");

		});


		QUnit.test("Render new control type", function(assert) {
			this.myControl.placeAt("content");
			sap.ui.getCore().applyChanges();

			var $control = jQuery.sap.byId("myControl");
			assert.ok($control.length === 1, "myControl should be rendered to the page");

			// test rendered content
			var html = $control.html();
			assert.ok(html.indexOf("test") > -1, "the control value 'test' should be written inside the control");
		});


		QUnit.test("Event handler methods (on...)", function(assert) {
			var done = assert.async();
			assert.expect(2);
			this.myControl.placeAt("content");
			sap.ui.getCore().applyChanges();
			assert.equal(this.myControl._state, "initial", "control state should be initialized");

			// focus the control, which should trigger its event handler changing the _state
			this.myControl.focus();

			// wait for focus to actually happen and event to be processed
			setTimeout(function(){
				assert.equal(this.myControl._state, "hadFocus", "control state should reflect the fact that its onfocusin handler should have been executed");
				done();
			}.bind(this), 30);
		});


		/* test subclassing an existing control */


		var htmlFragment = "<span>BLAH!</span>";
		var valueSuffix = " ...and more";

		QUnit.test("Extend sap.m.Input", function(assert) {
			var result = Input.extend("my.lib.MyInput", {

				setValue : function(value) {
					value = value + valueSuffix;
					Input.prototype.setValue.call(this, value);
				},

				renderer: {
					prependInnerContent : function(rm, c) {
						rm.write(htmlFragment);
					}
				}
			});
			assert.ok(typeof result !== "undefined", "result is not undefined");
		});

		QUnit.test("Instantiate MyInput", function(assert) {
			var myTf = new my.lib.MyInput("myTf", {value:"test"});
			assert.ok(myTf, "myTf should be a control instance now");
			assert.ok(myTf instanceof my.lib.MyInput, "myTf should be an instance of my.lib.MyTextField");
			assert.ok(myTf instanceof Input, "myTf should inherit from sap.ui.commons.TextField");
			assert.equal(myTf.getValue(), "test" + valueSuffix, "value should be modified by overridden method");
			myTf.destroy();
		});


		QUnit.test("Test renderer object", function(assert) {
			var myTf = new my.lib.MyInput("myTf", {value:"test"});
			myTf.placeAt("content");
			sap.ui.getCore().applyChanges();

			var $control = jQuery.sap.byId("myTf");
			assert.ok($control.length === 1, "myTf should be rendered to the page");

			// test rendered content
			var html = $control.html();
			assert.ok(html.toUpperCase().indexOf(htmlFragment.toUpperCase()) > -1, "renderOuterContent should have written the renderOuterContent inside the MyTextField");
			assert.ok(html.indexOf("test" + valueSuffix) > -1, "the normal TextFieldRenderer should have written the modified value inside the MyTextField");
			myTf.destroy();
		});


		QUnit.test("LibraryChanged Event", function(assert) {
			var events = [];

			function onlibchange(oEvent) {
				events.push(oEvent.getParameters());
			}

			function equalEvent(params,sName,sStereotype,oMetadata) {
				assert.equal(params.operation, "add", "event should have notified about an 'add' operation");
				assert.equal(params.name, sName, "event should have notified about the right entity");
				assert.equal(params.stereotype, sStereotype, "event should contain the right stereotype");
				assert.equal(params.metadata, oMetadata, "event should contain the right metadata");
			}

			sap.ui.getCore().attachLibraryChanged(onlibchange);

			// create new class
			var oClass = Control.extend("my.lib.TestControl1", {});
			assert.equal(events.length, 1, "one event should have been received");
			equalEvent(events[0], "my.lib.TestControl1", "control", oClass.getMetadata());

			var oClass = Element.extend("my.lib.TestElement1", {});
			assert.equal(events.length, 2, "one event should have been received");
			equalEvent(events[1], "my.lib.TestElement1", "element", oClass.getMetadata());

			sap.ui.getCore().loadLibrary("sap.ui.testlib", sap.ui.require.toUrl("testdata/core/testdata/uilib"));
			assert.equal(events.length, 3, "one event should have been received");
			equalEvent(events[2], "sap.ui.testlib", "library", sap.ui.getCore().getLoadedLibraries()["sap.ui.testlib"]);
			sap.ui.getCore().detachLibraryChanged(onlibchange);

			var oClass = Control.extend("my.lib.TestControl1", {});
			assert.equal(events.length, 3, "no more event should have been received after detach");
		});




		/* test extending the base class sap.ui.base.Object */

		QUnit.test("Extend sap.ui.base.Object", function(assert) {
			var result = BaseObject.extend("my.lib.MyObject", {
				renderer : function() {
					return "renderer";
				},

				_secretRenderer : function() {
					return "secret renderer";
				}

			});

			assert.ok(typeof result !== "undefined", "result is not undefined");
		});


		QUnit.test("Instantiate inherited Object", function(assert) {
			var myObj = new my.lib.MyObject("myObj");

			assert.ok(myObj, "myObj should be an object instance now");
			assert.ok(myObj instanceof my.lib.MyObject, "myObj should be an instance of my.lib.MyObject");
			assert.ok(myObj instanceof BaseObject, "myObj should be an instance of sap.ui.base.Object");
			assert.ok(!(myObj instanceof Control), "myObj should NOT inherit from sap.ui.core.Control");

			// renderer should be a function
			assert.equal(typeof myObj.renderer, "function", "'renderer' should be added as normal function");
			assert.equal(myObj.renderer(), "renderer", "'renderer' should work as normal function");

			// _secretRenderer should be a function
			assert.equal(typeof myObj._secretRenderer, "function", "'_secretRenderer' should be added as normal function");
			assert.equal(myObj._secretRenderer(), "secret renderer", "'_secretRenderer' should work as normal function");

			// Object.getInterface() should work and return only the public method
			var intf = myObj.getInterface();
			assert.equal(typeof intf.renderer, "function", "'renderer' should be added as normal function to the public interface");
			assert.equal(intf._secretRenderer, undefined, "'_secretRenderer' should NOT be added as normal function to the public interface");

			myObj.destroy();
		});


		QUnit.test("Metadata defaulting", function(assert) {

			// define control
			var result = Control.extend("my.lib.MyDefaultedControl", {
				metadata : {
					properties : {
						"text" : "string",
						"rows" : { type : "int" }
					},
					aggregations : {
						"multiples" : {singularName:"control"},
						"single" : {type:"sap.ui.commons.Button", multiple:false}
					},
					associations : {
						"assi" : "sap.ui.commons.Button"
					},
					events : {
						"somethingHappened" : {},
						"somethingElseHappened" : { allowPreventDefault : true }
					}
				}
			});

			var md = result.getMetadata();
			var properties = md.getProperties();
			assert.equal(Object.keys(properties).length, 2, "there should be two local properties");
			assert.equal(typeof properties.text, "object", "there should be a 'text' property info object");
			assert.equal(properties.text.name, "text", "'text' should have name 'text'");
			assert.equal(properties.text.type, "string", "'text' should be a string property");
			assert.equal(properties.text.group, "Misc", "'text' should belong to group 'Misc'");
			assert.equal(typeof properties.rows, "object", "there should be a 'rows' property info object");
			assert.equal(properties.rows.name, "rows", "'rows' should have name 'rows'");
			assert.equal(properties.rows.type, "int", "'rows' should be a string property");
			assert.equal(properties.rows.group, "Misc", "'rows' should belong to group 'Misc'");

			var aggregations = md.getAggregations();
			assert.equal(Object.keys(aggregations).length, 2, "there should be one public aggregation");
			assert.equal(typeof aggregations.multiples, "object", "there should be a 'multiples' aggregation info object");
			assert.equal(aggregations.multiples.name, "multiples", "'multiples' should have name 'multiple'");
			assert.equal(aggregations.multiples.type, "sap.ui.core.Control", "'multiples' should have type 'sap.ui.core.Control'");
			assert.equal(aggregations.multiples.multiple, true, "'multiples' should have cardinality 'multiple'");
			assert.equal(aggregations.multiples.singularName, "control", "'multiples' should have singularName 'control'");
			assert.equal(typeof aggregations.single, "object", "there should be a 'single' aggregation info object");
			assert.equal(aggregations.single.name, "single", "'single' should have name 'single'");
			assert.equal(aggregations.single.type, "sap.ui.commons.Button", "'single' should have type 'sap.ui.commons.Button'");
			assert.equal(aggregations.single.multiple, false, "'single' should have cardinality 'single'");

			var associations = md.getAssociations();
			assert.equal(Object.keys(associations).length, 1, "there should be one public association");
			assert.equal(typeof associations.assi, "object", "there should be a 'assi' aggregation info object");
			assert.equal(associations.assi.name, "assi", "'assi' should have name 'assi'");
			assert.equal(associations.assi.type, "sap.ui.commons.Button", "'assi' should have type 'sap.ui.commons.Button'");
			assert.equal(associations.assi.multiple, false, "'assi' should have cardinality 'single'");

			var events = md.getAllEvents();
			assert.equal(Object.keys(events).length, 8, "there should be 8 public events");
			assert.equal(typeof events.somethingHappened, "object", "there should be a 'somethingHappened' event info object");
			assert.equal(events.somethingHappened.name, "somethingHappened", "'somethingHappened' should have name 'somethingHappened'");
			assert.equal(events.somethingHappened.allowPreventDefault, false, "'somethingHappened' should not allow to preventDefault");
			assert.equal(typeof events.somethingElseHappened, "object", "there should be a 'somethingElseHappened' event info object");
			assert.equal(events.somethingElseHappened.name, "somethingElseHappened", "'somethingElseHappened' should have name 'somethingElseHappened'");
			assert.equal(events.somethingElseHappened.allowPreventDefault, true, "'somethingElseHappened' should allow to preventDefault");
		});

	});