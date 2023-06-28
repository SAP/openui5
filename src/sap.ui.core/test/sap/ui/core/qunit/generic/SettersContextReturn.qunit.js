/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/generic/TestBase",
	"sap/ui/test/generic/Utils",
	"sap/base/util/each",
	"sap/ui/test/generic/GenericTestCollection",
	"sap/ui/base/DataType"
], function(TestBase, Utils, each, GenericTestCollection, DataType) {
	"use strict";

	function noop() {}

	// disable require.js to avoid issues with thirdparty
	sap.ui.loader.config({
		map: {
			"*": {
				"sap/ui/thirdparty/require": "test-resources/sap/ui/core/qunit/generic/helper/_emptyModule"
			}
		}
	});

	var mTestedAbstractClasses = Object.create(null);

	/**
	 * @namespace
	 * @private
	 */
	var SettersContextReturn = TestBase.extend("sap.ui.core.qunit.generic.SettersContextReturn", {
		hasUntestedAbstractBaseClass: function(oClass, assert) {
			var oMetadata = oClass.getMetadata();
			while (oMetadata) {
				if (oMetadata.isAbstract() && !mTestedAbstractClasses[oMetadata.getName()]) {
					mTestedAbstractClasses[oMetadata.getName()] = oClass.getMetadata().getName();
					assert.ok(true, "forcing all methods to be tested to cover methods of " + oMetadata.getName());
					return true;
				}
				oMetadata = oMetadata.getParent();
			}
			return false;
		},

		createAggregatedElement: function(sAggregationType) {
			if ( sAggregationType === "sap.ui.core.Control" ) {
				sAggregationType = "sap.m.Text";
			} else if (DataType.isInterfaceType(sAggregationType)) {
				return null;
			}
			return Utils.loadClass(sAggregationType)
				.then(function(oClassInfo) {
					return new oClassInfo.fnClass();
				}, function() {
					return null;
				}
			);
		},

		/**
		 * Creates assertions for all setters of the given class.
		 *
		 * To avoid redundant checks of inherited base class methods in subclasses, only methods are tested
		 * that either have been attached to the instance itself or directly to the prototype of the instance.
		 * This ensures that when a subclass overrides a method locally, the local method also will be tested.
		 *
		 * Abstract base classes are skipped as they often can't be instantiated. To test their 'own' methods, too,
		 * such abstract classes are remembered and the first non-abstract subclass will test all its methods
		 * including the inherited ones, not only its own methods.
		 *
		 * @param {sap.ui.core.Control} Class class to be tested
		 * @param {sap.ui.test.generic.GenericTestCollection.ObjectCapabilities} oObjectCapabilities The controls capability options
		 * @param {QUnit.assert} assert QUnit Assert class of which instances are passed as the argument to QUnit.test() callbacks
		 * @returns {Promise} Promise resolves after all asserts are done
		 *
		 * @private
		 */
		assertAllSettersForClass: function(Class, oObjectCapabilities, assert) {
			var oMetadata = Class.getMetadata(),
				sClassName = oMetadata.getName(),
				that = this,
				oControl;

			// Abstract classes should not be tested on their own
			if (oMetadata.isAbstract()) {
				assert.ok(true, "Abstract class '" + sClassName + "' skipped");
				return;
			}

			var bForceTest4AllMethods = this.hasUntestedAbstractBaseClass(Class, assert);

			try {
				oControl = Utils.createControlOrElement(Class, oObjectCapabilities);
			} catch (e) {
				assert.ok(false, "Failed to instantiate a '" + sClassName + "' with default settings: " + (e.message || e));
				return;
			}

			if (!(oControl instanceof Promise)) {
				oControl = Promise.resolve(oControl);
			}

			// eslint-disable-next-line consistent-return
			return oControl.then(function (oControl) {
				var pChain = Promise.resolve();
				var iOwnSettings = 0;

				function hasOwnMethod(obj, name) {
					return Object.hasOwn(obj, name)
						|| Object.hasOwn(Class.prototype, name)
						|| bForceTest4AllMethods;
				}

				function checkOwnMethod(sMethodName, args, sArgs) {
					if ( hasOwnMethod(oControl, sMethodName) ) {
						iOwnSettings++;
						try {
							assert.ok(
								oControl[sMethodName].apply(oControl, args) === oControl,
								sMethodName + "(" + sArgs + ")" + " should always return <this>");
						} catch (e) {
							// we can't distinguish between expected and unexpected errors here, so we log only
							assert.ok(true,
								sMethodName + "(" + sArgs + ")" + " shouldn't throw an exception");
						}
					}
				}

				each(oMetadata.getAllProperties(), function(sPropertyName, oProperty) {
					var oObjectCapabilities = that.getObjectCapabilities(sClassName);
					if ( oObjectCapabilities && oObjectCapabilities.properties &&
						(oObjectCapabilities.properties[sPropertyName] === GenericTestCollection.ExcludeReason.NotChangeableAfterInit ||
						oObjectCapabilities.properties[sPropertyName] === GenericTestCollection.ExcludeReason.CantSetDefaultValue ||
						oObjectCapabilities.properties[sPropertyName] === GenericTestCollection.ExcludeReason.OnlyChangeableViaBinding)) {
						assert.ok(true, "ignore property '" + sPropertyName + "'");
						return;
					}

					if ( hasOwnMethod(oControl, oProperty._sMutator) ) {

						iOwnSettings++;

						// Get the value of the property
						var oValue = oProperty.get(oControl);

						// Assert
						try {
							assert.ok(
								oControl === oProperty.set(oControl, oValue),
								oProperty._sMutator + "(...) should always return <this>");
						} catch (e) {
							// If the setter fails we have a special scenario where date may be required
							// but as there is no type "date" in our metadata API we need to identify it here
							// and provide a JavaScript Date so we can test the setter
							var sName = oProperty.name;
							var bDateInName = sName.indexOf("Date", sName.length - 4) !== -1 || sName.substring(0, 4) === "date";
							if ((sName === "date" || bDateInName) && oProperty.type === "object") {
								assert.ok(
									oControl === oProperty.set(oControl, new Date()),
									oProperty._sMutator + "({js date}) should always return <this>");
							} else {
								// If the setter fails for some reason called with the value from get collected before that
								// we need to fail with a meaningful error.
								assert.ok(false,
									oProperty._sMutator + "(" + oValue + ") fails when called " +
									"with value received from get with exception: " + e);
							}
						}
					}
				});

				each(oMetadata.getAllAggregations(), function(sAggregationName, oAggregation) {
					var oObjectCapabilities = that.getObjectCapabilities(sClassName);
					if ( oObjectCapabilities && oObjectCapabilities.aggregations &&
						(oObjectCapabilities.aggregations[sAggregationName] === GenericTestCollection.ExcludeReason.NotChangeableAfterInit ||
						oObjectCapabilities.aggregations[sAggregationName] === GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings ||
						oObjectCapabilities.aggregations[sAggregationName] === GenericTestCollection.ExcludeReason.OnlyChangeableViaBinding)) {
						assert.ok(true, "ignore aggregation '" + sAggregationName + "'");
						return;
					}
					pChain = pChain.then(function() {
						return that.createAggregatedElement(oAggregation.type);
					}).then(function(oElement) {
						checkOwnMethod(oAggregation._sMutator, [null], "null");
						if ( oElement ) {
							checkOwnMethod(oAggregation._sMutator, [oElement], "elem");
						}
						if ( oAggregation.multiple ) {
							checkOwnMethod(oAggregation._sInsertMutator, [null], "null");
							if ( oElement ) {
								checkOwnMethod(oAggregation._sInsertMutator, [oElement], "elem");
							}
						}
						checkOwnMethod(oAggregation._sDestructor, [], "");
						if ( oElement && !oElement.bIsDestroyed ) {
							try {
								oElement.destroy();
							} catch (e) {
								// ignore
							}
						}
					});

				});

				each(oMetadata.getAllAssociations(), function(sAssociationName, oAssociation) {
					checkOwnMethod(oAssociation._sMutator, [null], "null");
					checkOwnMethod(oAssociation._sMutator, ["dummy"], "ref");
				});

				each(oMetadata.getAllEvents(), function(sEventName, oEvent) {
					checkOwnMethod(oEvent._sMutator, [noop], "listener");
					checkOwnMethod(oEvent._sDetachMutator, [noop], "listener");
				});

				pChain = pChain.then(function() {
					oControl.destroy();
					if (iOwnSettings === 0 ) {
						assert.ok(true, "no own settings");
					}
				});

				return pChain;
			});
		},

		/**
		 * @override
		 */
		shouldIgnoreControl: function(oClassInfo, assert) {
			var sControlName = oClassInfo.className,
				oCapabilities = this.getObjectCapabilities(sControlName) || {},
				bIgnore = false;

			if (oCapabilities.create === false) {
				assert.ok(true, "WARNING: " + sControlName + " cannot be tested and has therefore been EXCLUDED");
				bIgnore = true;
			}

			return bIgnore;
		},

		/**
		 * @override
		 */
		testControl: function(oClassInfo, assert) {
			var sClassName = oClassInfo.className;
			return Promise.resolve().then(function() {
				this._iFullyTestedControlsOrElements++;
				return this.assertAllSettersForClass(oClassInfo.fnClass, this.getObjectCapabilities(sClassName), assert);
			}.bind(this)).catch(function(err) {
				assert.ok(false, "failed to check class '" + sClassName + "':" + (err.message || err));
			});
		}
	});

	return new SettersContextReturn().setupAndStart({ includeElements: true });
});