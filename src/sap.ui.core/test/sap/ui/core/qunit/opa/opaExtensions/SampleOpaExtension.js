/*!
 * ${copyright}
 */

sap.ui.define([
  'sap/ui/test/_OpaLogger',
  'sap/ui/base/Object',
  'sap/ui/thirdparty/jquery'
],function(_OpaLogger, Ui5Object, $) {
  "use strict";

  var oLogger = _OpaLogger.getLogger("sap.ui.test.SampleOpaExtension");

  var Extension = Ui5Object.extend("sap.ui.test.SampleOpaExtension", {
    metadata : {
      publicMethods : [
        "onAfterInit",
        "onBeforeExit" ,
        "getAssertions"
      ]
    },

    onAfterInit : function() {
      oLogger.debug("Default onAfterInit called");
      return $.when();
    },

    onBeforeExit : function(){
      oLogger.debug("Default onBeforeExit called");
      return $.when();
    },

    getAssertions : function(){
      return {
        myCustomAssertion: function() {
          var deferred = $.Deferred();

          // start custom assertion logic, resolve the promise when ready
          setTimeout(function() {
            // Assertion passes
            deferred.resolve({
               result: true,
               message: "Custom assertion passes"
            });
          },0);

          return deferred.promise();
        }
      };
    }
  });

  return Extension;
});