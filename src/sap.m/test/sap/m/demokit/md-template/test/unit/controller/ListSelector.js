sap.ui.require(
	[
		"sap/ui/demo/mdtemplate/controller/ListSelector",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function(ListSelector) {
		"use strict";

		QUnit.module("Initialization", {
			setup: function () {
				sinon.config.useFakeTimers = false;
				this.oListSelector = new ListSelector();
			},
			teardown: function () {
				this.oListSelector.destroy();
			}
		});

		QUnit.asyncTest("Should initialize the List loading promise", function (assert) {
			// Arrange
			var fnRejectSpy = this.spy(),
				fnResolveSpy = this.spy();

			// Act
			this.oListSelector.oWhenListLoadingIsDone.then(fnResolveSpy, fnRejectSpy);

			// Assert
			setTimeout(function () {
				assert.strictEqual(fnResolveSpy.callCount, 0, "Did not resolve the promise");
				assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject the promise");
				QUnit.start();
			}, 0);
		});

		QUnit.module("List loading", {
			setup: function () {
				sinon.config.useFakeTimers = false;
				this.oListSelector = new ListSelector();
			},
			teardown: function () {
				this.oListSelector.destroy();
			}
		});

		function createListStub (bCreateListItem, sBindingPath) {
			var fnAttachEventOnce = function (sEventName, fnCallback) {
					fnCallback();
				},
				oListItemStub = {
					getBindingContext: this.stub().returns({
						getPath : this.stub().returns(sBindingPath)
					})
				},
				aListItems = [];

			if (bCreateListItem) {
				aListItems.push(oListItemStub);
			}

			return {
				attachEventOnce : fnAttachEventOnce,
				getItems: this.stub().returns(aListItems)
			};
		}

		QUnit.asyncTest("Should resolve the list loading promise, if the list has items", function (assert) {
			// Arrange
			var sBindingPath = "anything",
				fnRejectSpy = this.spy(),
				fnResolveSpy = function (sBindingPath) {
					// Assert
					assert.strictEqual(sBindingPath, sBindingPath, "Did pass the binding path");
					assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject the promise");
					QUnit.start();
				};

			// Act
			this.oListSelector.oWhenListLoadingIsDone.then(fnResolveSpy, fnRejectSpy);
			this.oListSelector.setBoundMasterList(createListStub.call(this, true, sBindingPath));
		});

		QUnit.asyncTest("Should reject the list loading promise, if the list has no items", function (assert) {
			// Arrange
			var fnRejectSpy = function () {
					// Assert
					assert.strictEqual(fnResolveSpy.callCount, 0, "Did not resolve the promise");
					QUnit.start();
				},
				fnResolveSpy = this.spy();

			// Act
			this.oListSelector.oWhenListLoadingIsDone.then(fnResolveSpy, fnRejectSpy);
			this.oListSelector.setBoundMasterList(createListStub.call(this, false));
		});

		QUnit.module("Selecting item in the list", {
			setup: function () {
				sinon.config.useFakeTimers = false;
				this.oListSelector = new ListSelector();
				this.oListSelector.oWhenListLoadingIsDone = {
					then: function (fnAct) {
						this.fnAct = fnAct;
					}.bind(this)
				};
			},
			teardown: function () {
				this.oListSelector.destroy();
			}
		});

		function createStubbedListItem (sBindingPath) {
			return {
				getBindingContext: this.stub().returns({
					getPath : this.stub().returns(sBindingPath)
				})
			};
		}

		QUnit.test("Should select an Item of the list when it is loaded and the binding contexts match", function (assert) {
			// Arrange
			var sBindingPath = "anything",
				oListItemToSelect = createStubbedListItem.call(this, sBindingPath),
				oSelectedListItemStub = createStubbedListItem.call(this, "a different binding path");

			this.oListSelector._oList = {
				getMode: this.stub().returns("SingleSelectMaster"),
				getSelectedItem: this.stub().returns(oSelectedListItemStub),
				getItems: this.stub().returns([ oSelectedListItemStub, oListItemToSelect, createListStub.call(this, "yet another list binding") ]),
				setSelectedItem: function (oItem) {
					//Assert
					assert.strictEqual(oItem, oListItemToSelect, "Did select the list item with a matching binding context");
				}
			};

			// Act
			this.oListSelector.selectAndScrollToAListItem(sBindingPath);
			// Resolve list loading
			this.fnAct();
		});

		QUnit.test("Should not select an Item of the list when it is already selected", function (assert) {
			// Arrange
			var sBindingPath = "anything",
				oSelectedListItemStub = createStubbedListItem.call(this, sBindingPath);

			this.oListSelector._oList = {
				getMode: this.stub().returns("SingleSelectMaster"),
				getSelectedItem: this.stub().returns(oSelectedListItemStub)
			};

			// Act
			this.oListSelector.selectAndScrollToAListItem(sBindingPath);
			// Resolve list loading
			this.fnAct();

			// Assert
			assert.ok(true, "did not fail");
		});

		QUnit.test("Should not select an item of the list when the list has the selection mode none", function (assert) {
			// Arrange
			var sBindingPath = "anything";

			this.oListSelector._oList = {
				getMode: this.stub().returns("None")
			};

			// Act
			this.oListSelector.selectAndScrollToAListItem(sBindingPath);
			// Resolve list loading
			this.fnAct();

			// Assert
			assert.ok(true, "did not fail");
		});

		QUnit.test("Should select the first item of the list", function (assert) {
			// Arrange
			var sBindingPath = "a binding path",
				fnSelectAndScrollToAListItemStub = this.stub(this.oListSelector, "selectAndScrollToAListItem", jQuery.noop);

			// Act
			this.oListSelector.selectAndScrollToFirstItem();
			// Resolve list loading
			this.fnAct(sBindingPath);

			ok(fnSelectAndScrollToAListItemStub.calledWithExactly(sBindingPath), "Did select the first item");
		});
	}

);