/*global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/deepEqual",
	"sap/base/util/deepExtend",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Text",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/ControlMessageProcessor",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/util/MockServer",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/DataState",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/type/Currency",
	"sap/ui/model/type/Float"
], function(Localization, deepEqual, deepExtend, Button, Input, Text, Messaging, ControlMessageProcessor,
		Message, MessageType, MockServer, VerticalLayout, DataState, JSONModel, ODataModel, Currency, Float) {
	"use strict";

	//add divs for control tests
	var oContent = document.createElement("div");
	oContent.id = "content";
	document.body.appendChild(oContent);

	var sServiceUri = "/SalesOrderSrv/";
	var sDataRootPath =  "test-resources/sap/ui/core/qunit/testdata/SalesOrder/";
	var oModel;

	var iResponseDelay = 250;

	var oMockServer = new MockServer({
		rootUri: sServiceUri
	});

	function initServer() {
		MockServer.config({
			autoRespond: true,
			autoRespondAfter: iResponseDelay
		});

		oMockServer.simulate("test-resources/sap/ui/core/qunit/testdata/SalesOrder/metadata.xml", sDataRootPath);
		oMockServer.start();
	}

	function stopServer() {
		oMockServer.stop();
	}

	function initModel(mParameters) {
		return new ODataModel(sServiceUri, mParameters);
	}

	function removeSharedMetadata() {
		ODataModel.mServiceData = {};
	}

	var sDefaultLanguage = Localization.getLanguage();

	QUnit.module("ODataModelV2DataState ", {
		beforeEach : function() {
			Localization.setLanguage("en-US");
			initServer();
			oModel = initModel({tokenHandling:false, defaultBindingMode:"TwoWay"});
			oModel.setUseBatch(true);
		},
		afterEach : function() {
			Localization.setLanguage(sDefaultLanguage);
			oModel.destroy();
			oModel = undefined;
			removeSharedMetadata();
			stopServer();
		}
	});

	function testDataState(assert, oBinding, fnFunc, oDataStateObject, sComment, fnContinue) {
		return new Promise(function(fnResolve, fnReject) {
			oDataStateObject = createDataState(oDataStateObject);

			var fCompare = function(oEvent) {
				checkDataState(assert, oEvent.getParameter("dataState"), oDataStateObject, sComment);
				oBinding.detachAggregatedDataStateChange(fCompare);
				if (fnContinue) {
					setTimeout(fnContinue, 0);
				}
				fnResolve();
			};
			oBinding.attachAggregatedDataStateChange(fCompare);
			try {
				fnFunc();
			} catch (e) {
				fnReject(e);
			}
		});

	}

	function createDataState(mDataStateObject) {
		var oDataState = new DataState();
		var aCompareMethods = [
			"isDirty", "isControlDirty"
		];

		if (mDataStateObject.hasOwnProperty("value")) {
			oDataState.setValue(mDataStateObject.value);
			aCompareMethods.push("getValue");
		}

		if (mDataStateObject.hasOwnProperty("invalidValue")) {
			oDataState.setInvalidValue(mDataStateObject.invalidValue);
			aCompareMethods.push("getInvalidValue");
		}

		if (mDataStateObject.hasOwnProperty("originalValue")) {
			oDataState.setOriginalValue(mDataStateObject.originalValue);
			aCompareMethods.push("getOriginalValue");
		}

		if (mDataStateObject.hasOwnProperty("internalValue")) {
			oDataState.setInternalValue(mDataStateObject.internalValue);
			aCompareMethods.push("getInternalValue");
		}

		if (mDataStateObject.hasOwnProperty("originalInternalValue")) {
			oDataState.setOriginalInternalValue(mDataStateObject.originalInternalValue);
			aCompareMethods.push("getOriginalInternalValue");
		}

		if (mDataStateObject.hasOwnProperty("laundering")) {
			oDataState.setLaundering(mDataStateObject.laundering);
			aCompareMethods.push("isLaundering");
		}

		if (mDataStateObject.hasOwnProperty("messages")) {
			if (typeof mDataStateObject.messages === "number" && mDataStateObject.messages) {
					oDataState.setModelMessages(new Array(mDataStateObject.messages));
				} else {
					oDataState.setModelMessages(mDataStateObject.messages);
			}
			aCompareMethods.push("getMessages");
		}




		// Keep comment so it will be added to every test
		oDataState._comment = mDataStateObject.comment;
		// Tell the check funtion what to compare
		oDataState._compareMethods = aCompareMethods;

		return oDataState;
	}

	function checkDataStatesInOrder(assert, oBinding, aDataStateObjects) {
		return new Promise(function(fnResolve, fnReject) {
			var aDataStates = aDataStateObjects.map(createDataState);

			function fnCheckNextDataStateChange(oEvent) {
				var mNextDataState = aDataStates.shift();

				checkDataState(assert, oEvent.getParameter("dataState"), mNextDataState, mNextDataState._comment || "");

				if (aDataStates.length === 0) {
					oBinding.detachAggregatedDataStateChange(fnCheckNextDataStateChange);
					fnResolve();
				}
			}

			oBinding.attachAggregatedDataStateChange(fnCheckNextDataStateChange);
		});
	}

	function checkDataState(assert, oDataState1, oDataState2, sComment) {
		var aCompareMethods = oDataState2._compareMethods;

		assert.ok(true, "Starting Test: " + sComment);

		for (var i = 0; i < aCompareMethods.length; i++) {
			if (!deepEqual(oDataState1[aCompareMethods[i]](),oDataState2[aCompareMethods[i]]())) {
				// do nothing?
			}
			if (aCompareMethods[i] === "getMessages") {
				if (oDataState1[aCompareMethods[i]]() || oDataState2[aCompareMethods[i]]()) {
					var iLength2 = 0;
					var iLength1 = 0;
					if (oDataState2[aCompareMethods[i]]()) {
						iLength2 = oDataState2[aCompareMethods[i]]().length;
					}
					if (oDataState1[aCompareMethods[i]]()) {
						iLength1 = oDataState1[aCompareMethods[i]]().length;
					}
					assert.equal(iLength1 === iLength2,true,"Compared " + aCompareMethods[i] + " : current(" +  iLength1 + "), expected(" + iLength2 + "): " + sComment);
					if (iLength1 === iLength2) {
						var aMessages1 = oDataState1.getMessages();
						var aMessages2 = oDataState2.getMessages();
						for (var j = 0; j < aMessages1.length; j++) {
							if (aMessages1[j] instanceof Message && aMessages2[j] instanceof Message) {
								assert.equal(aMessages1[j] === aMessages2[j],true,"Compared Message " + j + " message:'" + aMessages1[j].getMessage() + "': " + sComment);
							}

						}
					}
				} else {
					//assert.ok(false, "method "+ aCompareMethods[i] + " not implemented");
				}
			} else {
				assert.equal(deepEqual(oDataState1[aCompareMethods[i]](),oDataState2[aCompareMethods[i]]()),true,"Compared " + aCompareMethods[i] + ": current(" +  oDataState1[aCompareMethods[i]]() + "), expected(" + oDataState2[aCompareMethods[i]]() + "): " + sComment);
			}
		}

		assert.ok(true, "Ending Test: " + sComment);
	}

	QUnit.test("test DataState batch deferred",function(assert){
		var done = assert.async();
		// create dummy testdata
		var oNameBinding = oModel.bindProperty("/ProductSet('AD-1000')/Name"),
			oFloatBinding = oModel.bindProperty("/ProductSet('AD-1000')/TaxTarifCode");
		oFloatBinding.setType(new Float(), "string");
		oModel.addBinding(oNameBinding);
		oModel.addBinding(oFloatBinding);
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				testDataState(
					assert,
					oNameBinding,
					function() {
						oModel.setProperty("/ProductSet('AD-1000')/Name","blabla2");
					},
					{
						originalValue : "Flyer",
						value : "blabla2",
						invalidValue: undefined,
						laundering: false
					},
					"Setting a string to a string type binding"
				)
				.then(function() {
					return testDataState(
						assert,
						oNameBinding,
						function() {
							oModel.resetChanges(["/ProductSet('AD-1000')"]);
						},
						{
							originalValue : "Flyer",
							value : "Flyer",
							invalidValue: undefined,
							laundering: false
						},
						"Reset data of model data"
					);
				})
				.then(function() {
					return testDataState(
						assert,
						oNameBinding,
						function() {
							oModel.setProperty("/ProductSet('AD-1000')/Name","blabla2");
						},
						{
							originalValue : "Flyer",
							value : "blabla2",
							invalidValue: undefined,
							laundering: false
						},
						"Setting a string to a string type binding"
					);
				})
				.then(function() {
					var pOthersDone;
					oModel.submitChanges({
						success: function() {
							assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"),"blabla3");
							assert.equal(oModel.getOriginalProperty("/ProductSet('AD-1000')/Name"),"blabla2", "Original was " + oModel.getOriginalProperty("/ProductSet('AD-1000')/Name"));
							pOthersDone.then(function() {
								testDataState(
									assert,
									oNameBinding,
									function() {
										oModel.setProperty("/ProductSet('AD-1000')/Name","blabla4");
									},
									{
										originalValue : "blabla2",
										value : "blabla4",
										invalidValue: undefined,
										laundering: false
									},
									"Setting a string to a string type binding after submit",
									done
								);
							});
						}
					});

					oModel.attachBatchRequestSent(function() {
						pOthersDone = testDataState(
							assert,
							oNameBinding,
							function() {
								oModel.setProperty("/ProductSet('AD-1000')/Name","blabla3");
							},
							{
								originalValue : "Flyer",
								value : "blabla3",
								invalidValue: undefined,
								laundering: true
							},
							"Setting a string to a string type binding after submit"
						)
						.then(function() {
							return testDataState(
								assert,
								oNameBinding,
								function() {
									//do nothing and wait for submit changes
								},
								{
									originalValue : "blabla2",
									value : "blabla3",
									invalidValue: undefined,
									laundering: false
								},
								"Waiting for expected submit change handler."
							);
						});
					});
				});
			},
			error: function() {
				assert.ok(false,"request failed");
			}
		});
	});

	QUnit.test("test DataState single deferred",function(assert){
		var done = assert.async();
		var sRequestId;
		oModel.setUseBatch(false);
		// create dummy testdata
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				var oNameBinding = oModel.bindProperty("/ProductSet('AD-1000')/Name"),
					oFloatBinding = oModel.bindProperty("/ProductSet('AD-1000')/TaxTarifCode");
				oFloatBinding.setType(new Float(), "string");
				oModel.addBinding(oNameBinding);
				oModel.addBinding(oFloatBinding);

				testDataState(
					assert,
					oNameBinding,
					function() {
						oModel.setProperty("/ProductSet('AD-1000')/Name","blabla2");
					},
					{
						originalValue : "Flyer",
						value : "blabla2",
						invalidValue: undefined,
						laundering: false
					},
					"Setting a string to a string type binding"
				)
				.then(function() {
					return testDataState(
						assert,
						oNameBinding,
						function() {
							oModel.resetChanges(["/ProductSet('AD-1000')"]);
						},
						{
							originalValue : "Flyer",
							value : "Flyer",
							invalidValue: undefined,
							laundering: false
						},
						"Reset data of model data"
					);
				})
				.then(function() {
					return testDataState(
						assert,
						oNameBinding,
						function() {
							oModel.setProperty("/ProductSet('AD-1000')/Name","blabla2");
						},
						{
							originalValue : "Flyer",
							value : "blabla2",
							invalidValue: undefined,
							laundering: false
						},
						"Setting a string to a string type binding"
					);
				})
				.then(function() {
					var pOthers;

					oModel.submitChanges();
					oModel.attachRequestSent(function(oInfo) {
						sRequestId = oInfo.mParameters["ID"];
						pOthers = testDataState(
							assert,
							oNameBinding,
							function() {
								oModel.setProperty("/ProductSet('AD-1000')/Name","blabla3");
							},
							{
								originalValue : "Flyer",
								value : "blabla3",
								invalidValue: undefined,
								laundering: true
							},
							"Setting a string to a string type binding after submit"
						)
						.then(function() {
							return testDataState(
								assert,
								oNameBinding,
								function() {
									//do nothing and wait for submit changes
								},
								{
									originalValue : "blabla2",
									value : "blabla3",
									invalidValue: undefined,
									laundering: false
								},
								"Waiting for expected submit change handler."
							);
						});

					});
					oModel.attachRequestCompleted(
						function(oInfo) {
							if (sRequestId && oInfo.mParameters["ID"] == sRequestId) {
								assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"),"blabla3");
								assert.equal(oModel.getOriginalProperty("/ProductSet('AD-1000')/Name"),"blabla2", "Original was " + oModel.getOriginalProperty("/ProductSet('AD-1000')/Name"));
								pOthers.then(function() {
									testDataState(
										assert,
										oNameBinding,
										function() {
											oModel.setProperty("/ProductSet('AD-1000')/Name","blabla4");
										},
										{
											originalValue : "blabla2",
											value : "blabla4",
											invalidValue: undefined,
											laundering: false
										},
										"Setting a string to a string type binding after submit",
										function() {
											done();
										}
									);
								});
							}
						}
					);
				});
			},
			error: function() {
				assert.ok(false,"request failed");
			}
		});
	});

	QUnit.test("test DataState single not deferred",function(assert){
		var done = assert.async();
		var sRequestId;
		var oNameBinding = oModel.bindProperty("/ProductSet('AD-1000')/Name"),
			oFloatBinding = oModel.bindProperty("/ProductSet('AD-1000')/TaxTarifCode");
		var pOthers;

		oModel.setUseBatch(false);
		oModel.setDeferredGroups([]);
		oFloatBinding.setType(new Float(), "string");
		oModel.addBinding(oNameBinding);
		oModel.addBinding(oFloatBinding);
		oModel.read("/ProductSet('AD-1000')",{success: function() {
				Promise.resolve().then(fnOnRead);
			}
		});

		function fnOnRead() {
			testDataState(
				assert,
				oNameBinding,
				function() {
					oModel.setProperty("/ProductSet('AD-1000')/Name","blabla2");
				},
				{
					originalValue : "Flyer",
					value : "blabla2",
					invalidValue: undefined,
					laundering: true
				},
				"Setting a string to a string type binding"
			);
			var fn1 = function(oInfo) {
				oModel.detachRequestSent(fn1);
				sRequestId = oInfo.mParameters["ID"];
				pOthers = testDataState(
					assert,
					oNameBinding,
					function() {
						oModel.checkUpdate();
					},
					{
						originalValue : "Flyer",
						value : "blabla2",
						invalidValue: undefined,
						laundering: true
					},
					"Setting a string to a string type binding after submit"
				)
				.then(function() {
					testDataState(
						assert,
						oNameBinding,
						function() {
							//do nothing and wait for submit changes
						},
						{
							originalValue : "blabla2",
							value : "blabla2",
							invalidValue: undefined,
							laundering: false
						},
						"Waiting for expected submit change handler."
					);
					done();
				});
			};
			oModel.attachRequestSent(fn1);
			oModel.attachRequestCompleted(
				function(oInfo) {
					oInfo = deepExtend({}, oInfo);
					pOthers.then(function() {
						if (sRequestId && oInfo.mParameters["ID"] == sRequestId) {
							assert.equal(oModel.getProperty("/ProductSet('AD-1000')/Name"),"blabla2");
							assert.equal(oModel.getOriginalProperty("/ProductSet('AD-1000')/Name"),"blabla2", "Original was " + oModel.getOriginalProperty("/ProductSet('AD-1000')/Name"));
						}
					});
				}
			);
		}
	});


	QUnit.module("New DataState Tests", {
		beforeEach : function() {
			Localization.setLanguage("en-US");
			initServer();
			oModel = initModel({tokenHandling:false, defaultBindingMode:"TwoWay"});
			oModel.setUseBatch(true);

		},
		afterEach : function() {
			Localization.setLanguage(sDefaultLanguage);
			oModel.destroy();
			oModel = undefined;
			removeSharedMetadata();
			stopServer();
		}
	});

	function promiseRead(oModel, sPath) {
		return new Promise(function(fnResolve, fnReject) {
			oModel.read(sPath, {
				success: fnResolve,
				error: fnReject
			});
		});
	}

	function promiseBatchSent(oModel) {
		return new Promise(function(fnResolve, fnReject) {
			oModel.attachBatchRequestSent(fnResolve);
		});
	}

	/**
	 * Returns a promise that resolves AFTER a setTimeout()
	 */
	function timeoutPromise(oPromise, iTimeout) {
		iTimeout = iTimeout === undefined ? 0 : iTimeout;
		oPromise = oPromise ? oPromise : Promise.resolve();
		return oPromise.then(function() {
			return new Promise(function(fnResolve, fnReject) {
				setTimeout(fnResolve, 0);
			});
		});
	}

	QUnit.test("test DataState multiple submits", function(assert) {
		var done = assert.async();
		var oNameBinding;

		/*
		  Description of what this test is supposed to do.

		  1. Get the information of a single entity (read)
		  2. Create a Binding to the Name property of that entity - it contains the value "Flyer".
		  3. Check the initial data state, which should be clean and value should be the same as originalValue, there
		     should be no invalidValue and the binding should not be currently laundering.
		  4. Set the Name property to "ChangedOnce" and request notification of the next DataStateChange, which should
		     then have its value set to "ChangedOnce" and the originalValue should remain as "Flyer".
		  5. Submit the change done before.
		       On success, the value and originalValue should be set to "ChangedOnce", laundering should be true, as
			   we will have submitted other changes in the meantime (see below).
		  6. Wait for the request to be sent
		  7. Set the Name property to "ChangedTwice" and request notification of the next DataStateChange, which should
		     then have its value set to "ChangedTwice" and the originalValue should now be "ChangedOnce".
		  8. Submit the change done before.
		       On success, the value and originalValue should be set to "ChangedTwice", laundering should be true, as
			   we will have submitted other changes in the meantime (see below).
		  9. Set the Name property to "FinalValue" and request notification of the next DataStateChange, which should
	 	     then have its value set to "FinalValue" and the originalValue should remain as "ChangedTwice".
		 10. Submit the change done before.
		       On success, the value and originalValue should be set to "FinalValue", laundering should be false, as
			   this is the last change we submitted.
		*/

		oNameBinding = oModel.bindProperty("/ProductSet('AD-1000')/Name");
		oModel.addBinding(oNameBinding);


		// The DataStateChanges should come in in the following order:
		checkDataStatesInOrder(
			assert,
			oNameBinding, [{
			comment: "Change after initial read finishes",
			originalValue : "Flyer",
			value : "Flyer",
			invalidValue: undefined,
			laundering: false
		}, {
			comment: "Change after Value set to \"ChangedOnce\"",
			originalValue : "Flyer",
			value : "ChangedOnce",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change after Value set to \"ChangedTwice\"",
			originalValue : "Flyer",
			value : "ChangedTwice",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change after Value set to \"FinalValue\"",
			originalValue : "Flyer",
			value : "FinalValue",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change at the end",
			originalValue : "FinalValue",
			value : "FinalValue",
			invalidValue: undefined,
			laundering: false
		}]).then(function() {
			// Exit after all DataStates have been checked
			done();
		});


		timeoutPromise(promiseRead(oModel, "/ProductSet('AD-1000')"))
			.then(function() {
				oModel.setProperty("/ProductSet('AD-1000')/Name","ChangedOnce");
				oModel.submitChanges();
				return timeoutPromise(promiseBatchSent(oModel));
			})
			.then(function() {
				oModel.setProperty("/ProductSet('AD-1000')/Name","ChangedTwice");
				oModel.submitChanges();
				return timeoutPromise(promiseBatchSent(oModel));
			})
			.then(function() {
				oModel.setProperty("/ProductSet('AD-1000')/Name","FinalValue");
				oModel.submitChanges();
				return timeoutPromise(promiseBatchSent(oModel));
			});

	});


	QUnit.test("Simulated DataState Changes", function(assert) {
		var done = assert.async();

		var oNameBinding = oModel.bindProperty("/test");

		// The DataStateChanges should come in in the following order:
		checkDataStatesInOrder(
			assert,
			oNameBinding, [{
			comment: "Change after initial read finishes",
			originalValue : "Flyer",
			value : "Flyer",
			invalidValue: undefined,
			laundering: false
		}, {
			comment: "Change after Value set to \"Value 1\"",
			originalValue : "Flyer",
			value : "Value 1",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change after Value set to \"Value 2\"",
			originalValue : "Flyer",
			value : "Value 2",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change after Value set to \"Value 1\"",
			originalValue : "Flyer",
			value : "Value 1",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change at the end",
			originalValue : "Value 1",
			value : "Value 1",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change at the end",
			originalValue : "Value 2",
			value : "Value 1",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change at the end",
			originalValue : "Value 1",
			value : "Value 1",
			invalidValue: undefined,
			laundering: false
		}]).then(function() {
			// Exit after all DataStates have been checked
			done();
		});


		var oDataState = new DataState();

		var sTimeoutId;
		function changeDataState(sProperty, vValue) {
			oDataState.setProperty(sProperty, vValue);
			if (oDataState.changed()) {
				if (!sTimeoutId) {
					sTimeoutId = setTimeout(function() {
						//oDataState.calculateChanges();
						oNameBinding.fireEvent("AggregatedDataStateChange", { dataState: oDataState });
						oDataState.changed(false);
						sTimeoutId = null;
					}, 0);
				}
			}
		}

		setTimeout(function() {

			changeDataState("originalValue", "Flyer");
			changeDataState("value", "Flyer");
			changeDataState("laundering", false);
			changeDataState("modelMessages", []);
			changeDataState("controlMessages", []);

			setTimeout(function() {
				changeDataState("value", "Value 1");
				changeDataState("laundering", true);

				setTimeout(function() {
					changeDataState("value", "Value 2");
					changeDataState("laundering", true);

					setTimeout(function() {
						changeDataState("value", "Value 1");
						changeDataState("laundering", true);



						setTimeout(function() {
							changeDataState("originalValue", "Value 1");
							changeDataState("laundering", true);
							changeDataState("modelMessages", []);
							changeDataState("controlMessages", []);

							setTimeout(function() {
								changeDataState("originalValue", "Value 2");
								changeDataState("laundering", true);
								changeDataState("modelMessages", []);
								changeDataState("controlMessages", []);

								setTimeout(function() {
									changeDataState("originalValue", "Value 1");
									changeDataState("laundering", false);
									changeDataState("modelMessages", []);
									changeDataState("controlMessages", []);

								}, 50);
							}, 50);
						}, 50);
					}, 50);
				}, 50);
			}, 50);
		}, 0);


	});


	QUnit.module("Other Old DataState Tests", {
		beforeEach : function() {
			Localization.setLanguage("en-US");
			initServer();
			oModel = initModel({tokenHandling:false, defaultBindingMode:"TwoWay"});
			oModel.setUseBatch(true);

		},
		afterEach : function() {
			Localization.setLanguage(sDefaultLanguage);
			oModel.destroy();
			oModel = undefined;
			removeSharedMetadata();
			stopServer();
		}
	});


	QUnit.test("test DataState submitChanges with expanded nav props",function(assert){
		var done = assert.async();
		// create dummy testdata
		oModel.read("/ProductSet('HT-1000')", {
			urlParameters: {$expand : "ToSalesOrderLineItems"},
			success: function() {
				assert.ok(true, "request success");
				Promise.resolve().then(fnTest);
			},
			error: function() {
				assert.ok(false, "request failed");
			}
		});
		var fnTest = function() {
			var oNameBinding = oModel.bindProperty("/ProductSet('HT-1000')/Name");
			oModel.addBinding(oNameBinding);
			testDataState(
				assert,
				oNameBinding,
				function() {
					oModel.setProperty("/ProductSet('HT-1000')/Name","blabla2");
				},
				{
					originalValue : "Notebook Basic 15",
					value : "blabla2",
					invalidValue: undefined,
					laundering: true
				},
				"Setting a 'blabla2' to a string type binding"
			);
			assert.ok(oModel.hasPendingChanges(), "model should have pending changes");
			oModel.submitChanges(
				{
					success: function() {
						assert.ok(!oModel.hasPendingChanges(), "model should not have pending changes");
						var oOrigData = oModel.getOriginalProperty("/ProductSet('HT-1000')");
						var oData = oModel.getProperty("/ProductSet('HT-1000')");
						assert.equal(oOrigData.Name,oModel.getOriginalProperty("/ProductSet('HT-1000')/Name"),"blabla2");
						assert.equal(oData.Name,oModel.getProperty("/ProductSet('HT-1000')/Name"),"blabla2");
						assert.ok(deepEqual(oOrigData, oData), "Same reference - no changed Entity");
						testDataState(
							assert,
							oNameBinding,
							function() {
								oModel.setProperty("/ProductSet('HT-1000')/Name","blabla3");
							},
							{
								originalValue : "blabla2",
								value : "blabla3",
								invalidValue: undefined,
								laundering: false
							},
							"Setting a 'blabla3' to a string type binding"
						).then(done);
					}
				}
			);
		};
	});

	QUnit.test("test DataState multiple submits with complext type",function(assert){
		var done = assert.async();
		var oCityBinding = oModel.bindProperty("/BusinessPartnerSet('0100000015')/Address/City");
		oModel.addBinding(oCityBinding);

		// The DataStateChanges should come in in the following order:
		checkDataStatesInOrder(
			assert,
			oCityBinding, [{
			comment: "Change after initial read finishes",
			originalValue : "Quebec",
			value : "Quebec",
			invalidValue: undefined,
			laundering: false
		}, {
			comment: "Change after Value set to \"Wiesloch\"",
			originalValue : "Quebec",
			value : "Wiesloch",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change after Value set to \"Mannheim\"",
			originalValue : "Quebec",
			value : "Mannheim",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change after Value set to \"Quebec\"",
			originalValue : "Quebec",
			value : "Quebec",
			invalidValue: undefined,
			laundering: true
		}, {
			comment: "Change at the end",
			originalValue : "Quebec",
			value : "Quebec",
			invalidValue: undefined,
			laundering: false
		}]).then(function() {
			// Exit after all DataStates have been checked
			done();
		});


		timeoutPromise(promiseRead(oModel, "/ProductSet('AD-1000')"))
			.then(function() {
				return timeoutPromise(promiseRead(oModel, "/ProductSet('AD-1000')/ToSupplier"));
			})
			.then(function() {
				oModel.setProperty("/BusinessPartnerSet('0100000015')/Address/City", "Wiesloch");
				oModel.submitChanges();
				return timeoutPromise();
			})
			.then(function() {
				oModel.setProperty("/BusinessPartnerSet('0100000015')/Address/City", "Mannheim");
				oModel.submitChanges();
				return timeoutPromise();
			})
			.then(function() {
				oModel.setProperty("/BusinessPartnerSet('0100000015')/Address/City", "Quebec");
				oModel.submitChanges();
				// return timeoutPromise(promiseBatchSent(oModel));
			});

	});

	QUnit.test("test DataState Context Change",function(assert){
		var done = assert.async();
		// create dummy testdata
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				Promise.resolve().then(fnTest);
			},
			error: function() {
				assert.ok(false,"request failed");
			}
		});
		var fnTest = function() {
			var oNameBinding = oModel.bindProperty("Name", oModel.createBindingContext("/ProductSet('AD-1000')"));
			oModel.addBinding(oNameBinding);
			testDataState(
				assert,
				oNameBinding,
				function() {
					oModel.setProperty("/ProductSet('AD-1000')/Name","blabla2");
				},
				{
					originalValue : "Flyer",
					value : "blabla2",
					invalidValue: undefined,
					laundering: true
				},
				"Setting a 'blabla2' to a string type binding on AD-1000"
			);
			oModel.submitChanges({
				success: function() {
					oModel.read("/ProductSet('HT-1000')", {
						success: function() {
							Promise.resolve().then(function() {
								//switch to HT-1000 context
								oNameBinding.setContext(oModel.createBindingContext("/ProductSet('HT-1000')"));
								return testDataState(
									assert,
									oNameBinding,
									function() {
										oModel.setProperty("/ProductSet('HT-1000')/Name", "blabla2");
									},
									{
										originalValue : "Notebook Basic 15",
										value : "blabla2",
										invalidValue: undefined,
										laundering: false
									},
									"Setting a 'blabla2' to a string type binding on HT-1000"
								);
							})
							.then(function() {
								//switch back to AD-1000 context
								oNameBinding.setContext(oModel.createBindingContext("/ProductSet('AD-1000')"));
								return testDataState(
									assert,
									oNameBinding,
									function() {
										oModel.setProperty("/ProductSet('AD-1000')/Name", "blabla3");
									},
									{
										originalValue : "blabla2",
										value : "blabla3",
										invalidValue: undefined,
										laundering: false
									},
									"Setting a 'blabla3' to a string type binding on AD-1000"
								);
							})
							.then(function() {
								//switch back to HT-1000 context
								oNameBinding.setContext(oModel.createBindingContext("/ProductSet('HT-1000')"));
								return testDataState(
									assert,
									oNameBinding,
									function() {
										oModel.setProperty("/ProductSet('HT-1000')/Name", "blabla3");
									},
									{
										originalValue : "Notebook Basic 15",
										value : "blabla3",
										invalidValue: undefined,
										laundering: false
									},
									"Setting a 'blabla3' to a string type binding on HT-1000"
								);
							})
							.then(function() {
								done();
							});
						}
					});
				},
				error : function() {
					assert.ok(false,"request failed");
				}
			});
		};
	});

	QUnit.test("test DataState Composite Binding",function(assert){
		var done = assert.async();
		// create dummy testdata
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				var oInputField = new Input("ValidationInput", {
					value: {
						path: "TaxTarifCode",
						type: new Float()
					}
				});
				oInputField.setModel(oModel);

				var oContext = oModel.createBindingContext("/ProductSet('AD-1000')");
				oInputField.setBindingContext(oContext);

				var oCompositeControl = new Input("CompositeInput", {
					value: {
						parts: [{
							path: "Name"
						}, {
							path: "TaxTarifCode",
							type: new Float()
						}]
					}
				});
				oCompositeControl.setModel(oModel);
				oCompositeControl.setBindingContext(oContext);
				var oComositeBinding = oCompositeControl.getBinding("value");


				Messaging.registerObject(oInputField, true);
				Messaging.registerObject(oCompositeControl, true);

				Promise.resolve().then(function() {
					return testDataState(
						assert,
						oComositeBinding,
						function() {
							oModel.setProperty("/ProductSet('AD-1000')/Name", "blabla2");
						},
						{
							originalValue : ["Flyer", 1],
							value : ["blabla2",  1],
							invalidValue: undefined,
							laundering: false
						},
						"Setting a 'blabla2' to a composite type binding"
					);
				})
				.then(function() {
					return testDataState(
						assert,
						oComositeBinding,
						function() {
							oCompositeControl.setValue("blabla2 StringToFloatType");
							oModel.checkUpdate();
						},
						{
							originalValue : ["Flyer", 1],
							value : ["blabla2",  1],
							invalidValue: ["blabla2", "StringToFloatType"],
							laundering: false,
							messages: 1
						},
						"Forcing type error with Composite Binding setting StringToFloatType"
					);
				})
				.then(function() {
					return testDataState(
						assert,
						oComositeBinding,
						function() {
							oInputField.getBinding("value").__FROM = "INPUTFIELD";
							oCompositeControl.getBinding("value").aBindings[1].__FROM = "COMPOSITE";

							oCompositeControl.setValue("blabla4 2");
						},
						{
							originalValue : ["Flyer", 1],
							value : ["blabla4",  2],
							invalidValue: undefined,
							laundering: false,
							messages: 0
						},
						"Setting a 'blabla4' to a composite type binding"
					);
				})
				.then(function() {
					return testDataState(
						assert,
						oComositeBinding,
						function() {
							// The DataStateChange from the InputField above should be triggered in its own event as
							// the Model's checkUpdate is done asynchronously
							// Warning: When using the debugger, these steps may produce errors due to timing issues
							oModel.setProperty("/ProductSet('AD-1000')/Name", "blabla3");
						},
						{
							originalValue : ["Flyer", 1],
							value : ["blabla3",  2],
							invalidValue: undefined,
							laundering: false,
							messages: 0
						},
						"Setting a 'blabla3' to on the model"
					);
				})
				.then(function() {
					return testDataState(
						assert,
						oComositeBinding,
						function() {
							oCompositeControl.setValue("blabla3 StringToFloatType");
							// oModel.checkUpdate();
						},
						{
							originalValue : ["Flyer", 1],
							value : ["blabla3",  2],
							invalidValue: ["blabla3", "StringToFloatType"],
							laundering: false,
							messages: 1
						},
						"Forcing type error with Composite Binding setting StringToFloatType"
					);
				})
				.then(function() {
					done();
				});
			},
			error: function() {
				assert.ok(false,"request failed");
			}
		});
	});

	QUnit.test("test DataState and Messages",function(assert){
		var done = assert.async();
		var oVerticalLayout = new VerticalLayout();
		var oFloatInput = new Input({value:{path:'TaxTarifCode', type:'sap.ui.model.type.Float'}});
		var oNameInput = new Input({value:{path:'Name'}});
		var oCompositeInput = new Input({
			value: {
				parts : [{path:'Name'}, {path:'TaxTarifCode', type:'sap.ui.model.type.Float'}]
			}
		});
		//let the message manager control the vertical layout for messages
		Messaging.registerObject(oVerticalLayout, true);

		oVerticalLayout.addContent(oFloatInput);
		oVerticalLayout.addContent(oNameInput);
		oVerticalLayout.addContent(oCompositeInput);
		oVerticalLayout.placeAt("content");
		oVerticalLayout.setModel(oModel);
		// create dummy testdata
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				oVerticalLayout.bindElement("/ProductSet('AD-1000')");
				testDataState(
					assert,
					oFloatInput.getBinding("value"),
					function() {
						oFloatInput.setValue("StringToFloatType"); //force a validation error
					},
					{
						originalValue : 1,
						value : 1,
						invalidValue : "StringToFloatType",
						laundering: false,
						messages: 1
					},
					"Forcing Validation error on float input",
					function() {
						testDataState(
							assert,
							oFloatInput.getBinding("value"),
							function() {
								oFloatInput.setValue(1); //force a validation error
							},
							{
								originalValue : 1,
								value : 1,
								invalidValue : undefined,
								laundering: false,
								messages: 0
							},
							"Forcing Validation error on float input",
							function() {
								var oMessage1 = new Message({
									message: "Invalid order of characters in this name!",
									type: MessageType.Warning,
									target: "/ProductSet('AD-1000')/Name",
									processor: oModel
								});
								var oMessage2 = new Message({
									message: "Test2 is not a valid value",
									type: MessageType.Error,
									target: "/ProductSet('AD-1000')/Name",
									processor: oModel
								});
								testDataState(
									assert,
									oNameInput.getBinding("value"),
									function() {
										oNameInput.setValue("Test1"); //async
										Messaging.addMessages(oMessage1);
									},
									{
										originalValue : "Flyer",
										value : "Test1",
										invalidValue : undefined,
										laundering: false,
										messages:[oMessage1]
									},
									"Added warning and Error on Name input",
									function () {
										oNameInput.setValue("Test2");
										Messaging.addMessages(oMessage2);

										testDataState(
											assert,
											oNameInput.getBinding("value"),
											function() {
											},
											{
												originalValue : "Flyer",
												value : "Test2",
												invalidValue : undefined,
												laundering: false,
												messages:[oMessage1, oMessage2]
											},
											"Added warning and Error on Name input",
											function () {
												testDataState(
													assert,
													oNameInput.getBinding("value"),
													function() {
														Messaging.removeMessages(oMessage1);
													},
													{
														originalValue : "Flyer",
														value : "Test2",
														invalidValue : undefined,
														laundering: false,
														messages:[oMessage2]
													},
													"Remove warning and Error on Name input",
													function () {
														Messaging.removeMessages(oMessage2);
														testDataState(
															assert,
															oNameInput.getBinding("value"),
															function() {
															},
															{
																originalValue : "Flyer",
																value : "Test2",
																invalidValue : undefined,
																laundering: false,
																messages:null
															},
															"Remove warning and Error on Name input",
															function () {
																setTimeout(function() {
																	oVerticalLayout.destroy();
																	oFloatInput.destroy();
																	oNameInput.destroy();
																	oCompositeInput.destroy();
																	done();
																},0);
															}
														);
													}
												);
											}
										);
									}
								);
							}
						);
					}
				);
			},
			error: function() {
				assert.ok(false,"request failed");
			}
		});
	});

	QUnit.test("test DataState and Messages on Composite Binding",function(assert){
		var done = assert.async();
		var oVerticalLayout = new VerticalLayout();
		var oFloatInput = new Input({value:{path:'TaxTarifCode', type:'sap.ui.model.type.Float'}});
		var oNameInput = new Input({value:{path:'Name'}});
		var oCompositeInput = new Input(
				{value: {
					parts : [{path:'Name'}, {path:'TaxTarifCode', type:'sap.ui.model.type.Float'}]
					}
				});
		//let the message manager control the vertical layout for messages
		Messaging.registerObject(oVerticalLayout, true);

		oVerticalLayout.addContent(oFloatInput);
		oVerticalLayout.addContent(oNameInput);
		oVerticalLayout.addContent(oCompositeInput);
		oVerticalLayout.placeAt("content");
		oVerticalLayout.setModel(oModel);
		// create dummy testdata
		oModel.read("/ProductSet('AD-1000')", {
			success: function() {
				oVerticalLayout.bindElement("/ProductSet('AD-1000')");
				var oMessage1 = new Message({
					message: "2 is not valid!",
					type: MessageType.Warning,
					target: "/ProductSet('AD-1000')/TaxTarifCode",
					processor: oModel
				});
				var oMessage2 = new Message({
					message: "3 is valid",
					type: MessageType.Success,
					target: "/ProductSet('AD-1000')/TaxTarifCode",
					processor: oModel
				});
				testDataState(
					assert,
					oCompositeInput.getBinding("value"),
					function() {
						oCompositeInput.setValue("Test1 2");
						Messaging.addMessages(oMessage1);
					},
					{
						originalValue : ["Flyer", 1],
						value : ["Test1", 2],
						invalidValue: undefined,
						laundering: false,
						messages: 1
					},
					"Added Messages to Composite input",
					function() {
						oCompositeInput.setValue("Test2 3");
						Messaging.addMessages(oMessage2);
						testDataState(
							assert,
							oCompositeInput.getBinding("value"),
							function() {
								// wait for second message update
							},
							{
								originalValue : ["Flyer", 1],
								value : ["Test2", 3],
								invalidValue: undefined,
								laundering: false,
								messages: 2
							},
							"Added Messages to Composite input",
							function() {
								setTimeout(function() {
									oVerticalLayout.destroy();
									oFloatInput.destroy();
									oNameInput.destroy();
									oCompositeInput.destroy();
									done();
								},0);
							}
						);
					}
				);
			},
			error: function() {
				assert.ok(false,"request failed");
			}
		});
	});


	QUnit.test("test DataState and Messages on Composite Binding 2",function(assert){
		var done = assert.async();
		var oInput = new Input("compositeInput", {
			value: {
				parts: [
					{ path: "/ProductSet('AD-1000')/Name" },
					{ path: "/ProductSet('AD-1000')/TaxTarifCode", type:'sap.ui.model.type.Float' }
				]
			}
		});
		//let the message manager control the vertical layout for messages
		Messaging.registerObject(oInput, true);
		var oMessageProcessor = new ControlMessageProcessor();

		Messaging.registerMessageProcessor(oMessageProcessor);

		oInput.placeAt("content");
		oInput.setModel(oModel);
		// create dummy testdata
		oModel.read("/ProductSet('AD-1000')");
		oModel.attachBatchRequestCompleted(function() {
			var oBinding = oInput.getBinding("value");
			var oDataState = oBinding.getDataState();

			var oMessage1 = new Message({
				processor: oMessageProcessor,
				type: MessageType.Error,
				message: "All is lost",
				target: "compositeInput/value"
			});

			assert.equal(oDataState.getControlMessages().length, 0, "There should be no control messages on the composite datastate");

			testDataState(
				assert,
				oBinding,
				function() {}, {
					originalValue : ["Flyer", 1],
					value : ["Flyer", 1],
					invalidValue: undefined,
					laundering: false,
					messages: 0
				}, "Initial status of Composite input after read"
			)
			.then(function() {
				Messaging.addMessages(oMessage1);
				return testDataState(
					assert,
					oBinding,
					function() {}, {
						originalValue : ["Flyer", 1],
						value :["Flyer", 1],
						invalidValue: undefined,
						laundering: false,
						messages: 1
					}, "Added Message to Composite input"
				);
			})
			.then(function() {
				oInput.setValue("NewName 2");

				return testDataState(
					assert,
					oBinding,
					function() {}, {
						originalValue : ["Flyer", 1],
						value : ["NewName", 2],
						invalidValue: undefined,
						laundering: false,
						messages: 1
					}, "Added Message to Composite input"
				);
			})
			.then(function() {
				oInput.setValue("NewName Unfug");

				return testDataState(
					assert,
					oBinding,
					function() {}, {
						originalValue : ["Flyer", 1],
						value : ["NewName", 2],
						invalidValue:["NewName", "Unfug"],
						laundering: false,
						messages: 2
					}, "Added Message to Composite input"
				);
			})
			.then(function() {
				oInput.setValue("NewName 1");

				return testDataState(
					assert,
					oBinding,
					function() {}, {
						originalValue : ["Flyer", 1],
						value : ["NewName", 1],
						invalidValue: undefined,
						laundering: false,
						messages: 1
					}, "Added Message to Composite input"
				);
			})
			.then(function() {
				Messaging.removeMessages(oMessage1);
				return testDataState(
					assert,
					oBinding,
					function() {}, {
						originalValue : ["Flyer", 1],
						value : ["NewName", 1],
						invalidValue: undefined,
						laundering: false,
						messages: 0
					}, "Added Message to Composite input"
				);
			})
			.then(function() {
				oInput.destroy();
				done();
			});
		});
	});

	QUnit.test("test DataState and Messages on Composite Binding with type",function(assert){
		var done = assert.async();
		var oInput = new Input("compositeInput", {
			value: {
				parts: [
					{ path: "/ProductSet('AD-1000')/Price" },
					{ path: "/ProductSet('AD-1000')/CurrencyCode" }
				],
				type: Currency.getMetadata().getName()
			}
		});
		//let the message manager control the vertical layout for messages
		Messaging.registerObject(oInput, true);
		var oMessageProcessor = new ControlMessageProcessor();

		Messaging.registerMessageProcessor(oMessageProcessor);

		oInput.placeAt("content");
		oInput.setModel(oModel);
		// create dummy testdata
		oModel.read("/ProductSet('AD-1000')");
		oModel.attachBatchRequestCompleted(function() {
			var oBinding = oInput.getBinding("value");
			var oDataState = oBinding.getDataState();

			var oMessage1 = new Message({
				processor: oMessageProcessor,
				type: MessageType.Error,
				message: "All is lost",
				target: "compositeInput/value"
			});

			assert.equal(oDataState.getControlMessages().length, 0, "There should be no control messages on the composite datastate");

			testDataState(
				assert,
				oBinding,
				function() {}, {
					originalValue : ["0.0", "CAD"],
					value : ["0.0", "CAD"],
					invalidValue: undefined,
					laundering: false,
					messages: 0
				}, "Initial status of Composite input after read"
			)
			.then(function() {
				Messaging.addMessages(oMessage1);
				return testDataState(
					assert,
					oBinding,
					function() {}, {
						originalValue : ["0.0", "CAD"],
						value : ["0.0", "CAD"],
						invalidValue: undefined,
						laundering: false,
						messages: 1
					}, "Added Message to Composite input"
				);
			})
			.then(function() {
				oInput.setValue("CADHORST");
				return testDataState(
					assert,
					oBinding,
					function() {}, {
						originalValue : ["0.0", "CAD"],
						value : ["0.0", "CAD"],
						invalidValue: "CADHORST",
						laundering: false,
						messages: 2
					}, "Added Message to Composite input"
				);
			})
			.then(function() {
				oInput.setValue("CAD500.00");
				return testDataState(
					assert,
					oBinding,
					function() {}, {
						originalValue : ["0.0", "CAD"],
						value : [500.0, "CAD"],
						invalidValue: undefined,
						laundering: false,
						messages: 1
					}, "Added Message to Composite input"
				);
			})
			.then(function() {
				done();
			});
		});
	});


	QUnit.test("Test Formatter Invocation", function(assert) {
		var done = assert.async();
		// Calling formatters too often should not be a problem, but quite some applications use long running formatters
		// or even formatters with side-effects (e.g. calling setProperty in the Model), which can lead to performance
		// issues and even endless loops if the formatters are called more often.
		// Please make sure there is no alternative before changing this test case to allow more formatter invocations.
		assert.expect(4);

		var fnExecuteLater = function(fnFunction) {
			return new Promise(function(fnResolve) {
				window.setTimeout(function() {
					fnFunction();
					fnResolve();
				}, 100 * Math.random());
			});
		};

		var iCounter1 = 0;
		var iCounter2 = 0;

		var oButton = new Text({
			text: {
				path: "/ProductSet('AD-1000')/Price",
				formatter: function (sValue) {
					iCounter1++;
					return "test-" + sValue;
				}
			}
		});
		var oButton2 = new Button({
			text: {
				parts: [ { path: "/ProductSet('AD-1000')/Price" }, { path: "/ProductSet('AD-1000')/Price" } ],
				formatter: function (sValue1, sValue2) {
					iCounter2++;
					return "test-" + sValue1 + ", " + sValue2;
				}
			}
		});

		var oJsonModel = new JSONModel({
			"ProductSet('AD-1000')": { }
		});
		oButton.setModel(oJsonModel);
		oButton2.setModel(oJsonModel);

		var iRepetitions = Math.round(5 + Math.random() * 15);
		var pSet = Promise.resolve();
		for (var i = 0; i < iRepetitions; ++i) {
			/*eslint-disable no-loop-func */
			pSet = pSet.then(function() {
				return fnExecuteLater(function() {
					oJsonModel.setProperty("/ProductSet('AD-1000')/Price", "rosinenbroetchen");
				});
			});
			/*eslint-enable no-loop-func */
		}

		pSet.then(function() {
			assert.equal(iCounter1, 2, "PropertyBinding Formatter called twice (undefined and value)");
			assert.equal(iCounter2, 3, "CompositeBinding Formatter called three times (undefined/undefined, value/undefined and value/value)");

			oJsonModel.destroy();

			iCounter1 = 0;
			iCounter2 = 0;

			var oModel2 = initModel({tokenHandling:false, defaultBindingMode:"TwoWay"});
			oModel2.setUseBatch(true);


			oButton.setModel(oModel2);
			oButton2.setModel(oModel2);

			oModel2.read("/ProductSet('AD-1000')");
			oModel2.attachBatchRequestCompleted(function() {

				var iRepetitions = Math.round(5 + Math.random() * 15);
				var pSet = Promise.resolve();
				for (var i = 0; i < iRepetitions; ++i) {
					/*eslint-disable no-loop-func */
					pSet = pSet.then(function() {
						return fnExecuteLater(function() {
							oModel2.setProperty("/ProductSet('AD-1000')/Price", "quarkstrudel");
						});
					});
					/*eslint-enable no-loop-func */
				}

				pSet.then(function() {
					assert.equal(iCounter1, 3, "PropertyBinding Formatter called three times (values: undefined, server and setProperty)");
					assert.equal(iCounter2, 5, "CompositeBinding Formatter called five times (values: undefined/undefined, undefined/server, server/server, setProperty/server and setProperty/setProperty)");
					oModel2.destroy();
					done();
				});
			});
		});
	});
});