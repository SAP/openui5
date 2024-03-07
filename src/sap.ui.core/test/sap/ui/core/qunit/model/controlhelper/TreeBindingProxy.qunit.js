/*global QUnit,sinon */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/controlhelper/TreeBindingProxy",
	"sap/base/Log"
], function(
	Control,
	TreeBindingProxy,
	Log
) {
	"use strict";

	QUnit.module("sap.ui.model.TreeBindingProxy: Behaviour for undefined bindings", {
		beforeEach: function() {
			this.oControl = new Control();
			this.oProxy = new TreeBindingProxy(this.oControl, "rows");

			// Stub oTable.getBinding
			this.fnGetBinding = sinon.stub(this.oControl, "getBinding");
			this.fnGetBinding.returns({
				getMetadata: function() {
					return {
						getName: function () {
							return undefined;
						}
					};
				}
			});
		},
		afterEach: function() {
			this.fnGetBinding.restore();
			this.oControl.destroy();
		}
	});

	// expand, collapse, toggleExpandedState collapseAll, expandToLevel, setRootLevel, setCollapseRecursive
	// does not make sense to test with no binding

	QUnit.test("#isLeaf", function(assert) {
		assert.strictEqual(this.oProxy.isLeaf(0), true, "isLeaf returns true");
	});

	QUnit.test("#getNodeByIndex", function(assert) {
		assert.strictEqual(this.oProxy.getNodeByIndex(0), null, "getNodeByIndex returns null");
	});

	QUnit.test("#getContextByIndex", function(assert) {
		assert.strictEqual(this.oProxy.getContextByIndex(0), null, "getContextByIndex returns null");
	});

	QUnit.test("#isExpanded", function(assert) {
		assert.strictEqual(this.oProxy.isExpanded(0), false, "isExpanded returns false");
	});

	QUnit.test("#getContexts", function(assert) {
		assert.strictEqual(this.oProxy.getContexts(0).length, 0, "getContexts returns []");
	});

	QUnit.test("#getLevel", function(assert) {
		assert.strictEqual(this.oProxy.getLevel(0), undefined, "getLevel returns undefined");
	});

	QUnit.test("#getSiblingCount", function(assert) {
		assert.strictEqual(this.oProxy.getSiblingCount(0), 0, "getSiblingCount returns 0");
	});

	QUnit.test("#getPositionInParent", function(assert) {
		assert.strictEqual(this.oProxy.getPositionInParent(0), -1, "getPositionInParent returns -1");
	});

	QUnit.test("#isSelectionSupported", function(assert) {
		assert.strictEqual(this.oProxy.isSelectionSupported(), false, "isSelectionSupported returns false");
	});

	QUnit.test("#applyLegacySettingsToBindingInfo", function(assert) {
		var oBindingInfo = {};
		var mLegacySettings = {
			rootLevel: 0,
			collapseRecursive: false,
			numberOfExpandedLevels: 0
		};

		this.oProxy.applyLegacySettingsToBindingInfo(oBindingInfo, mLegacySettings);

		assert.strictEqual(oBindingInfo.parameters.rootLevel, mLegacySettings.rootLevel);
		assert.strictEqual(oBindingInfo.parameters.collapseRecursive, mLegacySettings.collapseRecursive);
		assert.strictEqual(oBindingInfo.parameters.numberOfExpandedLevels, mLegacySettings.numberOfExpandedLevels);
	});

	QUnit.module("sap.ui.model.TreeBindingProxy: Behaviour for V4 bindings", {
		beforeEach: function() {
			this.oControl = new Control();
			this.oProxy = new TreeBindingProxy(this.oControl, "rows");

			// Enable V4 branch
			this.oProxy._bEnableV4 = true;

			// Stub oTable.getBinding
			this.fnGetBinding = sinon.stub(this.oControl, "getBinding");
			this.oBinding = {
				getMetadata: function() {
					return {
						getName: function() {
							return "sap.ui.model.odata.v4.ODataListBinding";
						}
					};
				},
				getContexts: function(iStartIndex, iLength, iThreshold, bKeepCurrent) {
					var aContexts = [];
					for (var i = 0; i < iLength; i++) {
						aContexts.push({
							context: "test" + i,
							getProperty: function(sProperty) {
								switch (sProperty) {
									case "@$ui5.node.level": return 0;
									case "@$ui5.node.isExpanded": return true;
								}
							}
						});
					}
					return aContexts;
				},
				getAggregation: function() {
					return {
						hierarchyQualifier: "ExampleQualifier",
						expandTo: this._iExpandTo
					};
				},
				setAggregation: function(oAggregation) {
					this._iExpandTo = oAggregation?.expandTo;
					return;
				},
				refresh: function() {}
			};
			this.fnGetBinding.returns(this.oBinding);
		},
		afterEach: function() {
			this.fnGetBinding.restore();
			this.oControl.destroy();
		}
	});

	QUnit.test("#isLeaf", function(assert) {
		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		fnGetContextByIndexStub.returns({
			getProperty: function(sProperty) {
				return true;
			}
		});

		assert.notOk(this.oProxy.isLeaf(0), "isLeaf returns false");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#isLeaf without V4 flag set", function(assert) {
		this.oProxy._bEnableV4 = false;
		var fnLogErrorSpy = this.spy(Log, "error");

		this.oProxy.isLeaf(0);
		assert.ok(fnLogErrorSpy.calledOnce, "An error was logged regarding V4 usage");

		fnLogErrorSpy.restore();
	});

	QUnit.test("#getContexts without V4 flag set", function(assert) {
		this.oProxy._bEnableV4 = false;
		var fnLogErrorSpy = this.spy(Log, "error");

		var aContexts = this.oProxy.getContexts(0);
		assert.ok(fnLogErrorSpy.calledOnce, "An error was logged regarding V4 usage");
		assert.equal(aContexts.length, 0, "Despite an error, the return value is an empty array");

		fnLogErrorSpy.restore();
	});

	QUnit.test("#getNodeByIndex", function(assert) {
		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		var oContext = { context: "test" };
		fnGetContextByIndexStub.returns(oContext);

		assert.equal(this.oProxy.getNodeByIndex(0), oContext, "getNodeByIndex returns context object");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#getContextByIndex", function(assert) {
		assert.equal(this.oProxy.getContextByIndex(0).context, "test0", "getContextByIndex returns correct context object");
	});

	QUnit.test("#isExpanded", function(assert) {
		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		fnGetContextByIndexStub.returns({
			getProperty: function(sProperty) {
				return true;
			}
		});

		assert.ok(this.oProxy.isExpanded(0), "isExpanded returns true");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#getContexts", function(assert) {
		var aContexts = this.oProxy.getContexts(0, 3);

		assert.equal(aContexts.length, 3, "getContexts returns array with 3 objects");
		aContexts.forEach(function(oContext, iIndex) {
			assert.equal(oContext.context, "test" + iIndex, "context property is set correctly");
			assert.ok(oContext["_mProxyInfo"], "proxyInfo object exists");
			assert.equal(oContext["_mProxyInfo"].level, 0, "level is 0");
			assert.ok(!oContext["_mProxyInfo"].isLeaf, "isLeaf is false");
			assert.ok(oContext["_mProxyInfo"].isExpanded, "isExpanded is true");
		});
	});

	QUnit.test("#expand", function(assert) {
		var iCounter = 0;

		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		fnGetContextByIndexStub.returns({
			expand: function(iIndex) {
				iCounter++;
			}
		});

		this.oProxy.expand([0, 4, 6, 2, 1]);
		assert.equal(iCounter, 5, "Context bindings' expand method called 5 times");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#collapse", function(assert) {
		var iCounter = 0;

		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		fnGetContextByIndexStub.returns({
			collapse: function(iIndex) {
				iCounter++;
			}
		});

		this.oProxy.collapse([0, 4, 6, 2, 1]);
		assert.equal(iCounter, 5, "Context bindings' collapse method called 5 times");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#collapseAll", function(assert) {
		var oSetAggregationSpy = sinon.spy(this.oBinding, "setAggregation");
		var oRefreshSpy = sinon.spy(this.oBinding, "refresh");

		this.oProxy.collapseAll();
		assert.ok(oSetAggregationSpy.calledOnceWithExactly({hierarchyQualifier: "ExampleQualifier", expandTo: 1}),
			"Binding#setAggregation called with the correct parameters if expandTo changes");
		assert.ok(oRefreshSpy.notCalled, "Binding#refresh not called if expandTo changes");

		oSetAggregationSpy.resetHistory();
		oRefreshSpy.resetHistory();
		this.oProxy.collapseAll();
		assert.ok(oSetAggregationSpy.notCalled, "Binding#setAggregation not called if expandTo doesn't change");
		assert.ok(oRefreshSpy.calledOnceWithExactly(), "Binding#refresh called if expandTo doesn't change");

		oSetAggregationSpy.restore();
		oRefreshSpy.restore();
	});

	QUnit.test("#expandToLevel", function(assert) {
		var oSetAggregationSpy = sinon.spy(this.oBinding, "setAggregation");
		var oRefreshSpy = sinon.spy(this.oBinding, "refresh");

		this.oProxy.expandToLevel(2);
		assert.ok(oSetAggregationSpy.calledOnceWithExactly({hierarchyQualifier: "ExampleQualifier", expandTo: 2}),
			"Binding#setAggregation called with the correct parameters if expandTo changes");
		assert.ok(oRefreshSpy.notCalled, "Binding#refresh not called if expandTo changes");

		oSetAggregationSpy.resetHistory();
		oRefreshSpy.resetHistory();
		this.oProxy.expandToLevel(2);
		assert.ok(oSetAggregationSpy.notCalled, "Binding#setAggregation not called if expandTo doesn't change");
		assert.ok(oRefreshSpy.calledOnceWithExactly(), "Binding#refresh called if expandTo doesn't change");

		oSetAggregationSpy.restore();
		oRefreshSpy.restore();
	});

	/**
	 * @deprecated As of version 1.76
	 */
	QUnit.test("#setRootLevel", function(assert) {
		var fnThrows = function() {
			this.oProxy.setRootLevel(0);
		};
		assert.throws(fnThrows, /Setting the root level is not supported with your current binding./, "Setting root level is not supported in V4");
	});

	/**
	 * @deprecated As of version 1.76
	 */
	QUnit.test("#setCollapseRecursive", function(assert) {
		var fnThrows = function() {
			this.oProxy.setCollapseRecursive(false);
		};
		assert.throws(fnThrows, /Setting 'collapseRecursive' is not supported with your current binding./, "Setting collapseRecursive is not supported in V4");
	});

	QUnit.test("#getLevel", function(assert) {
		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		fnGetContextByIndexStub.returns({
			getProperty: function(sProperty) {
				return 0;
			}
		});

		assert.equal(this.oProxy.getLevel(0), 0, "getLevel returns 0");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#getSiblingCount", function(assert) {
		var fnThrows = function() {
			this.oProxy.getSiblingCount(0);
		};
		assert.throws(fnThrows, /The number of siblings of a node cannot be determined with your current binding./, "getSiblingCount throws error");
	});

	QUnit.test("#getPositionInParent", function(assert) {
		var fnThrows = function() {
			this.oProxy.getPositionInParent(0);
		};
		assert.throws(fnThrows, /The position of a node in its parent cannot be determined with your current binding./, "getPositionInParent returns -1");
	});

	QUnit.test("#isSelectionSupported", function(assert) {
		assert.notOk(this.oProxy.isSelectionSupported(), "isSelectionSupported returns false");
	});

	QUnit.module("sap.ui.model.TreeBindingProxy: Behaviour for older bindings", {
		beforeEach: function() {
			this.oControl = new Control();
			this.oProxy = new TreeBindingProxy(this.oControl, "rows");

			// Stub oTable.getBinding
			this.fnGetBinding = sinon.stub(this.oControl, "getBinding");
			this.fnGetBinding.returns({
				getMetadata: function() {
					return {
						getName: function() {
							return "sap.ui.model.odata.v2.ODataBinding";
						}
					};
				},
				getNodes: function(iStartIndex, iLength, iThreshold, bKeepCurrent) {
					var aNodes = [];
					for (var i = 0; i < iLength; i++) {
						aNodes.push({
							context: {node: "test" + i},
							nodeState: "nodeState" + i,
							level: 0
						});
					}
					return aNodes;
				},
				nodeHasChildren: function() {
					return true;
				},
				getNodeByIndex: function(iIndex) {
					if (iIndex === 1) {
						return undefined;
					}
					return {
						node: "test",
						level: 0,
						parent: {children: [1, 2]},
						positionInParent: 3
					};
				},
				getContextByIndex: function(iIndex) {
					if (iIndex === 1) {
						return undefined;
					}
					return {context: "test"};
				},
				isExpanded: function() {
					return true;
				}
			});
		},
		afterEach: function() {
			this.fnGetBinding.restore();
			this.oControl.destroy();
		}
	});

	QUnit.test("#isLeaf", function(assert) {
		var fnGetNodeByIndexStub = sinon.stub(this.oProxy, "getNodeByIndex");
		fnGetNodeByIndexStub.returns({});

		assert.notOk(this.oProxy.isLeaf(0), "isLeaf returns false");

		fnGetNodeByIndexStub.restore();
	});

	QUnit.test("#getNodeByIndex", function(assert) {
		assert.deepEqual(this.oProxy.getNodeByIndex(0), {
			node: "test",
			level: 0,
			parent: {children: [1, 2]},
			positionInParent: 3
		}, "getNodeByIndex returns context object");
		assert.strictEqual(this.oProxy.getNodeByIndex(-1), null, "getNodeByIndex returns null for negative index");
		assert.strictEqual(this.oProxy.getNodeByIndex(1), null, "getNodeByIndex returns null if no node exists at this index");
	});

	QUnit.test("#getContextByIndex", function(assert) {
		assert.deepEqual(this.oProxy.getContextByIndex(0), {context: "test"}, "getContextByIndex returns context object");
		assert.strictEqual(this.oProxy.getContextByIndex(-1), null, "getContextByIndex returns null for negative index");
		assert.strictEqual(this.oProxy.getContextByIndex(1), null, "getContextByIndex returns null if no context exists at this index");
	});

	QUnit.test("#isExpanded", function(assert) {
		assert.ok(this.oProxy.isExpanded(0), "isExpanded returns true");
	});

	QUnit.test("#getContexts", function(assert) {
		var aContexts = this.oProxy.getContexts(0, 3);

		assert.equal(aContexts.length, 3, "getContexts returns array with 3 objects");
		aContexts.forEach(function(oContext, iIndex) {
			assert.equal(oContext.node, "test" + iIndex, "context property is set correctly");
			assert.ok(oContext["_mProxyInfo"], "proxyInfo object exists");
			assert.equal(oContext["_mProxyInfo"].level, 1, "level is 1");
			assert.ok(!oContext["_mProxyInfo"].isLeaf, "isLeaf is false");
			assert.ok(oContext["_mProxyInfo"].isExpanded, "isExpanded is true");
			assert.ok(oContext["_mProxyInfo"].nodeState, "nodeState" + iIndex, "node state is set correctly");
		});
	});

	QUnit.test("#expand", function(assert) {
		var aIndices = [];
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			expand: function(iIndex) {
				aIndices.push(iIndex);
			},
			isExpanded: function() {
				return false;
			},
			getLength: function() {
				return 10;
			}
		});
		var fnIsLeafStub = sinon.stub(this.oProxy, "isLeaf");
		fnIsLeafStub.returns(false);

		this.oProxy.expand([0, 4, 6, 2, 1]);
		assert.equal(aIndices.length, 5, "Context bindings' expand method called 5 times");
		assert.deepEqual(aIndices, [6, 4, 2, 1, 0], "Context bindings' expand order correct");

		fnIsLeafStub.restore();
	});

	QUnit.test("#collapse", function(assert) {
		var aIndices = [];
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			collapse: function(iIndex) {
				aIndices.push(iIndex);
			},
			isExpanded: function() {
				return true;
			},
			getLength: function() {
				return 10;
			}
		});
		var fnIsLeafStub = sinon.stub(this.oProxy, "isLeaf");
		fnIsLeafStub.returns(false);

		this.oProxy.collapse([0, 4, 6, 2, 1]);
		assert.equal(aIndices.length, 5, "Context bindings' expand method called 5 times");
		assert.deepEqual(aIndices, [6, 4, 2, 1, 0], "Context bindings' expand order correct");

		fnIsLeafStub.restore();
	});

	QUnit.test("#collapseAll", function(assert) {
		var bCalled = false;
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			collapseToLevel: function(iIndex) {
				bCalled = true;
			}
		});

		this.oProxy.collapseAll();
		assert.ok(bCalled, "Binding's collapseToLevel was called");
	});

	QUnit.test("#expandToLevel", function(assert) {
		var bCalled = false;
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			expandToLevel: function(iIndex) {
				bCalled = true;
			}
		});

		this.oProxy.expandToLevel(4);
		assert.ok(bCalled, "Binding's collapseToLevel was called");
	});

	/**
	 * @deprecated As of version 1.76
	 */
	QUnit.test("#setRootLevel", function(assert) {
		var iRootLevel = -1;
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			setRootLevel: function(iLevel) {
				iRootLevel = iLevel;
			}
		});
		this.oProxy.setRootLevel(5);
		assert.equal(iRootLevel, 5, "Root level is set to 5");
	});

	/**
	 * @deprecated As of version 1.76
	 */
	QUnit.test("#setCollapseRecursive", function(assert) {
		var bCollapseRecursive = false;
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			setCollapseRecursive: function(bCollapse) {
				bCollapseRecursive = bCollapse;
			}
		});
		this.oProxy.setCollapseRecursive(true);
		assert.ok(bCollapseRecursive, "collapseRecursive is true");
	});

	QUnit.test("#getLevel", function(assert) {
		assert.equal(this.oProxy.getLevel(0), 1, "getLevel returns 1");
	});

	QUnit.test("#getSiblingCount", function(assert) {
		assert.equal(this.oProxy.getSiblingCount(0), 2, "getSiblingCount returns 2");
	});

	QUnit.test("#getPositionInParent", function(assert) {
		assert.equal(this.oProxy.getPositionInParent(0), 3, "getPositionInParent returns 2");
	});

	QUnit.test("#isSelectionSupported", function(assert) {
		assert.ok(this.oProxy.isSelectionSupported(), "isSelectionSupported returns true");
	});
});