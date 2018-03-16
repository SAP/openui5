/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.RuleEngineOpaExtension
sap.ui.define(['sap/ui/base/Object'],function(Ui5Object) {
    "use strict";

    /*
    var oLogger = _OpaLogger.getLogger("sap.ui.test.OpaExtension",
        $.sap.log.Level.DEBUG);
    */

    /**
     * OPA extension interface.
     *
     * @class OPA extension interface.
     * @public
     * @alias sap.ui.test.OpaExtension
     * @author SAP SE
     * @since 1.48
     */
    var Extension = Ui5Object.extend("sap.ui.test.OpaExtension", {
        metadata : {
            publicMethods : [
                "onAfterInit",
                "onBeforeExit" ,
                "getAssertions"
            ]
        }

        /**
         * Startup hook, executed after startup of the application under test.
         * Executed in the application frame.
         * Subsequent waitFor's will wait for the returned promise to be resolved.
         *
         * @name sap.ui.test.OpaExtension.onAfterInit
         * @public
         * @function
         * @since 1.48
         * @returns {jQuery.promise} A promise that gets resolved on success or get rejected with the error.
         * Rejection of this promise does not prevent the application under test from loading
         * but will disable this extension.
         *
         * Sample usage:
         * <pre>
         *     <code>
         *      onAfterInit : function() {
         *          oLogger.debug("Default onAfterInit called");
         *          return $.when();
         *      }
         *     </code>
         * </pre>
         */

        /**
         * Shutdown hook, executed before shutdown of the application under test.
         * Executed in the application frame.
         * Subsequent waitFor's will wait for the returned promise to be resolved.
         *
         * @name sap.ui.test.OpaExtension.onBeforeExit
         * @public
         * @function
         * @since 1.48
         * @returns {jQuery.promise} A promise that gets resolved on success or get rejected with the error
         *
         * <pre>
         *     <code>
         *      onBeforeExit : function(){
         *          oLogger.debug("Default onBeforeExit called");
         *          return $.when();
         *      }
         *     </code>
         * </pre>
         */

        /**
         * Return the custom assertions provided by this extension.
         * The default QUnit assertion object will be augmented with them.
         * Subsequent waitFor's will wait for the returned promise to be resolved.
         *
         * @name sap.ui.test.OpaExtension.getAssertions
         * @public
         * @function
         * @since 1.48
         * @returns A map of custom assertion names and associated function. The assertion
         * function returns a {jQuery.promise} that get resolved with {@link QUnit.pushResult} object.
         * Promise is resolved for both passing and failing assertion and rejected if assertion
         * evaluation fails.
         *
         * Sample:
         *
         * Custom extension:
         * <pre>
         *     <code>
         *      sap.ui.define([
         *          'jquery.sap.global',
         *          'sap/ui/test/OpaExtension'
         *      ],function($, OpaExtension) {
         *          "use strict";
         *
         *          var customExtension = OpaExtension.extend("sap.ui.test.sample.CustomOpaExtension", {
         *              metadata : {
         *                  publicMethods : [
         *                      "getAssertions"
         *                  ]
         *              },
         *
         *              getAssertions : function() {
         *                  return {
         *                      myCustomAssertion: function() {
         *                          var deferred = $.Deferred();
         *
         *                          // start custom assertion logic, resolve the promise when ready
         *                          setTimeout(function() {
         *                              // Assertion passes
         *                              deferred.resolve({
         *                                  result: true,
         *                                  message: "Custom assertion passes"
         *                              });
         *
         *                              // OR Assertion fails
         *                              deferred.resolve({
         *                                  result: false,
         *                                  message: "Custom assertion fails"
         *                              });
         *
         *                              // OR Propagate an error while evaluating assertion
         *                              deferred.reject(new Error("Error while evaluating assertion, details: " + details));
         *                          },0);
         *
         *                          return deferred.promise();
         *                      }
         *                  }
         *              }
         *          });
         *
         *          return customExtension;
         *      });
         *     </code>
         * </pre>
         *
         * Usage:
         *
         * Activate this extension and provide some uri parameters:
         * <pre>
         *     <code>
         *      Opa5.extendConfig({
         *          extensions: ["sap/ui/test/sample/CustomOpaExtension"],
         *          appParams: {
         *              "key": "value"
         *          }
         *      });
         *     </code>
         * </pre>
         *
         * Call the custom assertion from the page object:
         * <pre>
         *     <code>
         *      Opa5.createPageObjects({
         *          onMyView : {
         *              viewName : "MyView",
         *              assertions : {
         *                  iShouldUseMyCustomAssertion : function () {
         *                      return this.waitFor({
         *                          id: "MyControlId",
         *                          actions: new Press(),
         *                          success : function () {
         *                              Opa5.assert.myCustomAssertion();
         *                          }
         *                      });
         *                  }
         *              }
         *          }
         *      });
         *     </code>
         * </pre>
         */
    });

    return Extension;
});
