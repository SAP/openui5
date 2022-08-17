/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_uniq",
	"sap/base/util/merge",
	"sap/base/util/values",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/write/_internal/connectors/ObjectStorageConnector",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	_uniq,
	merge,
	values,
	ObjectStorageUtils,
	FlexObjectFactory,
	JsObjectConnector,
	ObjectStorageConnector,
	SessionStorageWriteConnector,
	Layer,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var oTestData = {
		oChange1: {
			creation: "2021-05-04T12:57:32.229Z",
			fileName: "oChange1",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			content: {
				foo: "bar"
			},
			selector: {
				id: "selector1"
			},
			changeType: "type1"
		},
		oChange2: {
			creation: "2021-05-04T12:57:32.231Z",
			fileName: "oChange2",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			selector: {
				id: "selector2"
			},
			changeType: "type2"
		},
		oChange21: {
			fileName: "oChange21",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.USER,
			selector: {
				id: "selector2"
			},
			changeType: "type1"
		},
		oChange3: {
			fileName: "oChange3",
			fileType: "change",
			reference: "sap.ui.fl.test.1",
			layer: Layer.USER,
			selector: {
				id: "selector2"
			},
			changeType: "type1"
		},
		oChange4: {
			creation: "2021-05-04T12:57:32.230Z",
			fileName: "oChange4",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			changeType: "type1"
		},
		oVariant1: {
			fileName: "oVariant1",
			fileType: "ctrl_variant",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0"
		},
		oVariantChange1: {
			creation: "2021-05-04T12:57:32.240Z",
			fileName: "oVariantChange1",
			fileType: "ctrl_variant_change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			changeType: "setTitle",
			selector: {
				id: "oVariant1"
			}
		},
		oVariantManagementChange: {
			fileName: "oVariantManagementChange",
			fileType: "ctrl_variant_management_change",
			reference: "sap.ui.fl.test",
			layer: Layer.CUSTOMER,
			changeType: "setDefault",
			content: {
				id: "variantManagement0"
			}
		}
	};

	function saveListWithConnector(oConnector, aList) {
		return oConnector.write({
			flexObjects: aList
		});
	}

	function removeListFromStorage(oStorage, aList) {
		var aPromises = aList.map(function(oFlexObject) {
			var sKey = ObjectStorageUtils.createFlexObjectKey(oFlexObject);
			return oStorage.removeItem(sKey);
		});

		return Promise.all(aPromises);
	}

	function getFlexObjectFromStorage(oFlexObject, oStorage) {
		var sKey = ObjectStorageUtils.createFlexObjectKey(oFlexObject);
		return Promise.resolve(oStorage.getItem(sKey));
	}

	function assertFileWritten(assert, oStorage, oData, sMessage) {
		return values(oData).map(function(oFlexObject) {
			return getFlexObjectFromStorage(oFlexObject, oStorage)
				.then(function(vItem) {
					var oItem = oStorage._itemsStoredAsObjects ? vItem : JSON.parse(vItem);
					assert.ok(!!Date.parse(oItem.creation), "then creation property was set for the flex item");
					assert.deepEqual(oFlexObject, oItem, oItem.fileName + sMessage);
				});
		});
	}

	function getNumberOfFlexObjects(oConnector) {
		var iCount = 0;
		return ObjectStorageUtils.forEachObjectInStorage({storage: oConnector.storage}, function() {
			iCount++;
		})
		.then(function() {
			return iCount;
		});
	}

	function parameterizedTest(oConnector, sStorage, bPublicLayer) {
		QUnit.module("loadFlexData: Given a " + sStorage, {
			afterEach: function() {
				sandbox.restore();
			}
		}, function() {
			QUnit.test("when write is called with various changes", function(assert) {
				return saveListWithConnector(oConnector, values(oTestData))
					.then(function() {
						return Promise.all([assertFileWritten(assert, oConnector.storage, oTestData, " was written")]);
					})
					.then(function() {
						return oConnector.loadFlexData({reference: "sap.ui.fl.test"});
					})
					.then(function(aFlexData) {
						assert.strictEqual(aFlexData[0].changes.length, 3, "three changes are returned");
						assert.ok(aFlexData[0].cacheKey, "the cacheKey got calculated");

						// clean up
						return removeListFromStorage(oConnector.storage, values(oTestData));
					});
			});

			QUnit.test("when write is called with changes created with the same timestamp", function(assert) {
				var nCurrentTimestamp = Date.now();
				sandbox.stub(Date, "now").returns(nCurrentTimestamp);
				return saveListWithConnector(oConnector, values(oTestData))
					.then(function() {
						var aCreationFields = [];
						return Promise.all([
							values(oTestData)
							.map(function (oFlexObject) {
								return getFlexObjectFromStorage(oFlexObject, oConnector.storage)
									.then(function (vItem) {
										aCreationFields.push(oConnector.storage._itemsStoredAsObjects ? vItem.creation : JSON.parse(vItem).creation);
									});
							})
						])
							.then(function () {
								var iTotalChanges = aCreationFields.length;
								assert.strictEqual(_uniq(aCreationFields).length, iTotalChanges);
							});
					});
			});

			QUnit.test("when loadFeatures is called", function(assert) {
				return oConnector.loadFeatures().then(function(oFeatures) {
					if (bPublicLayer) {
						assert.strictEqual(oFeatures.isPublicLayerAvailable, bPublicLayer, "the public layer is available");
					}
					assert.strictEqual(oFeatures.isKeyUser, true, "the key user is available");
					assert.strictEqual(oFeatures.isVariantSharingEnabled, true, "the variant sharing is available");
				});
			});

			// TODO: fix the getFlexInfo to take the mandatory reference parameter into account
			QUnit.skip("when getFlexInfo is called without changes present", function(assert) {
				return oConnector.getFlexInfo({storage: oConnector.storage}).then(function(oFlexInfo) {
					var oExpectedFlexInfo = {
						isResetEnabled: false
					};
					assert.deepEqual(oFlexInfo, oExpectedFlexInfo, "the function resolves with an empty object");
				});
			});

			QUnit.test("when getFlexInfo is called with changes present", function(assert) {
				return saveListWithConnector(oConnector, [
					oTestData.oChange1
				])
				.then(function() {
					return oConnector.getFlexInfo({storage: oConnector.storage}).then(function(oFlexInfo) {
						var oExpectedFlexInfo = {
							isResetEnabled: true
						};
						assert.deepEqual(oFlexInfo, oExpectedFlexInfo, "the function resolves with an empty object");

						return removeListFromStorage(oConnector.storage, [
							oTestData.oChange1
						]);
					});
				});
			});
		});

		QUnit.module("Given some changes in a " + sStorage, {
			beforeEach: function() {
				return saveListWithConnector(oConnector, values(oTestData));
			},
			afterEach: function() {
				return removeListFromStorage(oConnector.storage, values(oTestData));
			}
		}, function() {
			QUnit.test("when reset is called", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.reset({
						reference: "sap.ui.fl.test.1",
						layer: Layer.USER
					});
				})
				.then(
					getNumberOfFlexObjects.bind(undefined, oConnector)
				)
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 1, "one change got reset");
				});
			});

			QUnit.test("when reset is called with selector ids", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.reset({
						reference: "sap.ui.fl.test",
						layer: Layer.CUSTOMER,
						selectorIds: ["selector1"]
					});
				})
				.then(function(oResponse) {
					assert.ok(oResponse.response.some(function(oChange) {
						return oChange.fileName === oTestData.oChange1.fileName;
					}), "Change1 was found");
					assert.equal(oResponse.response.length, 1, "1 Change was returned");
				})
				.then(
					getNumberOfFlexObjects.bind(undefined, oConnector)
				)
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 1, "one change got reset");
				});
			});

			QUnit.test("when reset is called with change types", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.reset({
						reference: "sap.ui.fl.test",
						layer: Layer.CUSTOMER,
						changeTypes: ["type1"]
					});
				})
				.then(function(oResponse) {
					assert.ok(oResponse.response.some(function(oChange) {
						return oChange.fileName === oTestData.oChange1.fileName;
					}), "Change1 was found");
					assert.ok(oResponse.response.some(function(oChange) {
						return oChange.fileName === oTestData.oChange4.fileName;
					}), "Change4 was found");
					assert.equal(oResponse.response.length, 2, "2 Changes are returned");
				})
				.then(getNumberOfFlexObjects.bind(undefined, oConnector))
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 2, "two change got reset");
				});
			});

			QUnit.test("when reset is called with selectors and change types", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.reset({
						reference: "sap.ui.fl.test",
						layer: Layer.CUSTOMER,
						changeTypes: ["type1"],
						selectorIds: ["selector2"]
					});
				})
				.then(function(oResponse) {
					assert.equal(oResponse.response, 0, "no changes were returned");
				})
				.then(getNumberOfFlexObjects.bind(undefined, oConnector))
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 0, "no change got reset");
				});
			});

			QUnit.test("when reset is called with selectors and change types", function(assert) {
				return oConnector.reset({
					reference: "sap.ui.fl.test",
					layer: Layer.CUSTOMER,
					changeTypes: ["type2"],
					selectorIds: ["selector2"]
				}).then(function(oResponse) {
					assert.equal(oResponse.response[0].fileName, "oChange2", "deleted Change was returned");
				});
			});

			QUnit.test("when remove is called with a saved flex object", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.remove({
						flexObject: {
							fileName: oTestData.oChange1.fileName
						}
					});
				})
				.then(getNumberOfFlexObjects.bind(undefined, oConnector))
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 1, "one change got removed");
				});
			});

			QUnit.test("when remove is called with a not existing flex object", function(assert) {
				var iInitialCount;
				return getNumberOfFlexObjects(oConnector).then(function(iNumberOfChanges) {
					iInitialCount = iNumberOfChanges;
				})
				.then(function() {
					return oConnector.remove({
						flexObject: {
							fileName: "foo"
						}
					});
				})
				.then(getNumberOfFlexObjects.bind(undefined, oConnector))
				.then(function(iNewCount) {
					assert.equal(iInitialCount - iNewCount, 0, "no change got removed");
				});
			});

			QUnit.test("when condense is called", function(assert) {
				var oNewChange1 = {
					creation: "2022-05-05T12:57:32.229Z",
					fileName: "oChange5",
					fileType: "change",
					reference: "sap.ui.fl.test",
					layer: Layer.CUSTOMER,
					selector: {
						id: "selector1"
					},
					changeType: "type1"
				};
				var oNewChange2 = {
					creation: "2022-06-05T12:57:32.230Z",
					fileName: "oChange6",
					fileType: "change",
					reference: "sap.ui.fl.test",
					layer: Layer.CUSTOMER,
					selector: {
						id: "selector1"
					},
					changeType: "type1"
				};
				var oNewVarChange1 = {
					creation: "2021-05-05T12:57:32.241Z",
					fileName: "oVariantChange2",
					fileType: "ctrl_variant_change",
					reference: "sap.ui.fl.test",
					layer: Layer.CUSTOMER,
					changeType: "setTitle",
					selector: {
						id: "oVariant1"
					}
				};
				var oNewVarChange2 = {
					creation: "2021-05-05T12:57:32.242Z",
					fileName: "oVariantChange3",
					fileType: "ctrl_variant_change",
					reference: "sap.ui.fl.test",
					layer: Layer.CUSTOMER,
					changeType: "setTitle",
					selector: {
						id: "oVariant1"
					}
				};
				var oUpdatedChange = merge({}, oTestData.oChange1, {content: {
					foo: "foobar",
					bar: "foo"
				}});
				var oUpdatedVariantMngtChange = merge({}, oTestData.oVariantManagementChange);
				oUpdatedVariantMngtChange.content = {
					bar: "foo"
				};
				var aFlexObjects = [
					oTestData.oChange21, oTestData.oVariant1,
					oUpdatedChange, oTestData.oChange2, oTestData.oChange4,
					oNewChange2, oNewChange1, oNewVarChange2, oNewVarChange1,
					oTestData.oVariantChange1, oUpdatedVariantMngtChange
				].map(function(oChangeJson) {
					return FlexObjectFactory.createFromFileContent(oChangeJson);
				});
				var mPropertyBag = {
					allChanges: aFlexObjects,
					condensedChanges: aFlexObjects.slice(2),
					flexObjects: {
						namespace: "",
						layer: "",
						create: {
							change: [
								{
									oChange5: oNewChange1
								},
								{
									oChange6: oNewChange2
								}
							],
							ctrl_variant_change: [
								{
									oVariantChange2: oNewVarChange1
								},
								{
									oVariantChange3: oNewVarChange2
								}
							]
						},
						reorder: {
							change: ["oChange2", "oChange4", "oChange6", "oChange5"],
							ctrl_variant_change: ["oVariantChange3", "oVariantChange2", "oVariantChange1"]
						},
						update: {
							change: [
								{
									oChange1: {
										content: {
											foo: "foobar",
											bar: "foo"
										}
									}
								}
							],
							ctrl_variant_management_change: [
								{
									oVariantManagementChange: {
										content: {
											bar: "foo"
										}
									}
								}
							]
						},
						"delete": {
							ctrl_variant: ["oVariant1"],
							change: ["oChange21"]
						}
					}
				};

				return oConnector.condense(mPropertyBag)

				.then(function() {
					return oConnector.loadFlexData({reference: "sap.ui.fl.test"});
				})
				.then(function(aResponses) {
					var aFlexObjectsFileContent = aResponses[0].changes.concat(aResponses[0].variantChanges, aResponses[0].variantManagementChanges, aResponses[0].variants);
					assert.strictEqual(aFlexObjectsFileContent.length, 9, "there is one more change in the storage");

					var aIds = aFlexObjectsFileContent.map(function(oFlexObjectFileContent) {
						return oFlexObjectFileContent.fileName;
					});
					assert.ok(aIds.indexOf("oChange5") > -1, "the first change was added");
					assert.ok(aIds.indexOf("oChange6") > -1, "the second change was added");
					assert.ok(aIds.indexOf("oVariantChange2") > -1, "the first variant change was added");
					assert.ok(aIds.indexOf("oVariantChange3") > -1, "the second variant change was added");

					assert.notOk(aIds.indexOf("oVariant1") > -1, "the variant was deleted");
					assert.notOk(aIds.indexOf("oChange21") > -1, "the change was deleted");

					assert.deepEqual(aFlexObjectsFileContent[aIds.indexOf("oChange1")].content, {
						foo: "foobar",
						bar: "foo"
					}, "the change was updated");
					assert.deepEqual(aFlexObjectsFileContent[aIds.indexOf("oVariantManagementChange")].content, {
						bar: "foo"
					}, "the ctrl_variant_management_change was updated");

					assert.ok(aIds.indexOf("oVariantChange3") < aIds.indexOf("oVariantChange2"), "the variant changes were reordered");
					assert.ok(aIds.indexOf("oVariantChange2") < aIds.indexOf("oVariantChange1"), "the variant changes were reordered");

					assert.ok(aIds.indexOf("oChange1") < aIds.indexOf("oChange2"), "the changes were reordered");
					assert.ok(aIds.indexOf("oChange2") < aIds.indexOf("oChange4"), "the changes were reordered");
					assert.ok(aIds.indexOf("oChange4") < aIds.indexOf("oChange6"), "the changes were reordered");
					assert.ok(aIds.indexOf("oChange6") < aIds.indexOf("oChange5"), "the changes were reordered");

					return removeListFromStorage(oConnector.storage, values(oTestData).concat([oNewChange2, oNewChange1, oNewVarChange2, oNewVarChange1]));
				});
			});
		});
	}

	QUnit.module("write: Given a connector where _itemsStoredAsObjects", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("is true when write is called with a change", function(assert) {
			var oObject = {
				fileName: "id123"
			};

			var oSetItemStub = sandbox.stub(JsObjectConnector.storage, "setItem");

			return JsObjectConnector.write({
				flexObjects: [oObject]
			})
			.then(function() {
				assert.equal(oSetItemStub.getCall(0).args[1], oObject, "the write was called with the object");
			});
		});

		QUnit.test("is false when write is called with a change", function(assert) {
			var oObject = {
				fileName: "id123"
			};

			var sKey = ObjectStorageUtils.createFlexObjectKey(oObject);
			return SessionStorageWriteConnector.write({
				flexObjects: [oObject]
			})
			.then(function() {
				var sObject = JSON.stringify(oObject);
				assert.strictEqual(SessionStorageWriteConnector.storage.getItem(sKey), sObject, "the write was called with the object as string");
			});
		});
	});

	var oAsyncStorage = {
		_itemsStoredAsObjects: true,
		_items: {},
		setItem: function(sKey, vValue) {
			return new Promise(function(resolve) {
				setTimeout(function() {
					oAsyncStorage._items[sKey] = vValue;
					resolve();
				});
			});
		},
		removeItem: function(sKey) {
			return new Promise(function(resolve) {
				setTimeout(function() {
					delete oAsyncStorage._items[sKey];
					resolve();
				});
			});
		},
		clear: function() {
			return new Promise(function(resolve) {
				setTimeout(function() {
					oAsyncStorage._items = {};
					resolve();
				});
			});
		},
		getItem: function(sKey) {
			return Promise.resolve(oAsyncStorage._items[sKey]);
		},
		getItems: function() {
			return Promise.resolve(oAsyncStorage._items);
		}
	};
	var oConnectorWithAsyncStorage = merge({}, ObjectStorageConnector, {
		storage: oAsyncStorage
	});

	parameterizedTest(JsObjectConnector, "JsObjectStorage");
	// LocalStorage behaves similar to Session storage and we rely on this to not run into issues with parallel tests interfering in the LocalStorageTests
	parameterizedTest(SessionStorageWriteConnector, "sessionStorage", true);
	// WebIDE uses the ObjectStorageConnector with an async storage
	parameterizedTest(oConnectorWithAsyncStorage, "asyncStorage");

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
