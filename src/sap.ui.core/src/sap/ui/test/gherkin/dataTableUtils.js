/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global"], function($) {
  "use strict";

  /**
   * Provides utility functions for formatting 2D arrays of strings (such as the raw data loaded from a Gherkin
   * feature file) into a more useful format such as an array of objects or a single object. Also handles normalization
   * of the raw strings.
   *
   * @author Rodrigo Jordao
   * @author Jonathan Benn
   * @alias sap.ui.test.gherkin.dataTableUtils
   * @since 1.40
   * @namespace
   * @static
   * @public
   */
  var dataTableUtils = {

    /**
     * A simple object containing a series of normalization functions that change a string according to a
     * particular strategy.
     *
     * @alias sap.ui.test.gherkin.dataTableUtils.normalization
     * @namespace
     * @static
     * @public
     */
    normalization: {

      /**
       * For example: "first name" -> "First Name"
       *
       * @param {string} sString - the string to normalize
       * @returns {string} the trimmed input string with all words capitalized
       * @public
       * @function
       * @static
       */
      titleCase : function(sString) {
        dataTableUtils._testNormalizationInput(sString, "titleCase");
        return sString
            .trim()
            .replace(/(?!\s)\W/g, "")
            .replace(/\s+/g, " ")
            .replace(/\w\S*/g, function(s){return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();});
      },

      /**
       * For example: "first name" -> "FirstName"
       *
       * @param {string} sString - the string to normalize
       * @returns {string} the trimmed input string with all words capitalized and all spaces removed
       * @public
       * @function
       * @static
       */
      pascalCase : function(sString) {
        dataTableUtils._testNormalizationInput(sString, "pascalCase");
        return dataTableUtils.normalization.titleCase(sString).split(/\s/).join("");
      },

      /**
       * For example: "First Name" -> "firstName"
       *
       * @param {string} sString - the string to normalize
       * @returns {string} the trimmed input string with all words after the first capitalized and all spaces removed
       * @public
       * @function
       * @static
       */
      camelCase : function(sString) {
        dataTableUtils._testNormalizationInput(sString, "camelCase");
        return dataTableUtils.normalization.pascalCase(sString)
            .replace(/^(\w)/, function(s){return s.toLowerCase();});
      },

      /**
       * For example: "First Name" -> "first-name"
       *
       * @param {string} sString - the string to normalize
       * @returns {string} the trimmed input string changed to lower case and with space between words
       *                   replaced by a hyphen ("-")
       * @public
       * @function
       * @static
       */
      hyphenated : function(sString) {
        dataTableUtils._testNormalizationInput(sString, "hyphenated");
        return sString.trim().replace(/(?!\s)\W/g, "").replace(/\s+/g, "-").toLowerCase();
      },

      /**
       * For example: "First Name" -> "First Name"
       *
       * @param {string} sString - the string to normalize
       * @returns {string} the original unchanged input string
       * @public
       * @function
       * @static
       */
      none : function(sString) {
        dataTableUtils._testNormalizationInput(sString, "none");
        return sString;
      }
    },

    /**
     * Takes the inputed 2D array "aData" and returns an equivalent array of objects. The data is expected to
     * have a header row, with each subsequent row being an entity, and each column being a property of that
     * entity. E.g.
     * <pre>
     *   [
     *     ["Their Name",  "Their Age"],
     *     ["Alice",       "16"],
     *     ["Bob",         "22"]
     *   ]
     * </pre>
     *
     * The data's column headers become the returned objects' property names. The property names get normalized
     * according to the strategy defined by the parameter "vNorm". E.g. using hyphenation strategy this is returned:
     * <pre>
     *   [
     *     {their-name: "Alice", their-age: "16"},
     *     {their-name: "Bob", their-age: "22"}
     *   ]
     * </pre>
     *
     * @param {string[]} aData - the 2D array of strings to be converted, with a header row
     * @param {(string|function)} [vNorm="none"] - the normalization function to use to normalize property
     *                                             names. Can also be a String with values "titleCase", "pascalCase",
     *                                             "camelCase", "hyphenated" or "none".
     * @returns {object[]} - an array of objects equivalent to the input data, with property names normalized
     * @public
     * @function
     * @static
     */
    toTable : function(aData, vNorm) {

      this._testArrayInput(aData, "toTable");
      var fnNorm = this._getNormalizationFunction(vNorm, "toTable");

      // first row are the object's keys (table column headers)
      var aKeyStore = aData[0].map(fnNorm);
      return aData.slice(1).map(function(aRow) {
        var oGeneratedObject = {};
        for (var i = 0; i < aKeyStore.length; ++i) {
          oGeneratedObject[aKeyStore[i]] = aRow[i];
        }
        return oGeneratedObject;
      });
    },

    /**
     * Takes the inputed 2D array "aData" and returns an equivalent object. Each row of data is expected to
     * be a property-value pair. To create nested objects, add extra columns to the data. E.g.
     * <pre>
     *  [
     *    ["Name", "Alice"],
     *    ["Mass", "135 lbs"],
     *    ["Telephone Number", "Home", "123-456-7890"],
     *    ["Telephone Number", "Work", "123-456-0987"]
     *  ]
     * </pre>
     * For each data row, the right-most element becomes a property value, and everything else is a property
     * name. The property names get normalized according to the strategy defined by the parameter "vNorm".
     * E.g. using camelCase strategy
     * <pre>
     *   {
     *     name: "Alice",
     *     mass: "135 lbs",
     *     telephoneNumber: {
     *       home: "123-456-7890",
     *       work: "123-456-0987"
     *     }
     *   }
     * </pre>
     * @param {string[]} aData - the 2D array of strings to be converted
     * @param {(string|function)} [vNorm="none"] - the normalization function to use to normalize property
     *                                             names. Can also be a string with values "titleCase", "pascalCase",
     *                                             "camelCase", "hyphenated" or "none".
     * @returns {object} - an object equivalent to the input data, with property names normalized
     * @public
     * @function
     * @static
     */
    toObject : function(aData, vNorm) {

      this._testArrayInput(aData, "toObject");
      vNorm = this._getNormalizationFunction(vNorm, "toObject");

      var oResult = {};
      for (var i = 0; i < aData.length; ++i) {
        var aRow = aData[i];
        var sKey = aRow[0];
        var sValue = aRow.slice(1);
        if (sValue.length === 1) {
          sValue = sValue[0];
        } else {
          sValue = this.toObject([sValue], vNorm); // recurse on array data
        }
        if (oResult[sKey]) {
          $.extend(oResult[sKey], sValue);
        } else {
          oResult[sKey] = sValue;
        }
      }
      return this._normalizeKeys(oResult, vNorm);
    },

    /**
     * Normalizes all of the property names in the given object
     *
     * @param {object} oObject - the object whose properties we want to normalize
     * @param {function} fnNormalization - the normalization function to execute
     * @returns {string} the normalized string
     * @private
     */
    _normalizeKeys : function(oObject, fnNormalization) {
      for (var sProperty in oObject) {
        if (oObject.hasOwnProperty(sProperty)) {
          var sNewKey = fnNormalization.call(this.normalization, sProperty);
          if (!oObject.hasOwnProperty(sNewKey)) {
            oObject[sNewKey] = oObject[sProperty];
            delete oObject[sProperty];
          }
        }
      }
      return oObject;
    },

    /**
     * Finds the normalization function equivalent to input parameter "vFun"
     *
     * @param {(string|function)} [vFun="none"] - a normalization function. Can also be a string with values
     *                                            "titleCase", "pascalCase", "camelCase", "hyphenated" or "none".
     * @param {string} sFunc - the name of the calling function, for error reporting
     * @returns {function} the normalization function equivalent to the inputed value, or <none> if the input was
     *                     undefined.
     * @throws {Error} if the input string is invalid
     * @private
     */
    _getNormalizationFunction: function(vFun, sFunc) {

      var sErrorMessage = "dataTableUtils." + sFunc + ": parameter 'vNorm' must be either a Function or a String with the value 'titleCase', 'pascalCase', 'camelCase', 'hyphenated' or 'none'";

      switch ($.type(vFun)) {

        case "string":
          var fnNormalize = this.normalization[vFun];
          if (fnNormalize === undefined) {
            throw new Error(sErrorMessage);
          }
          return fnNormalize;

        case "function":
          return vFun;

        case "undefined":
        case "null":
          return this.normalization.none;

        default:
          throw new Error(sErrorMessage);
      }
    },

    /**
     * Tests a normalization function's input parameter to make sure it's valid
     *
     * @param {string} sString - the parameter to test
     * @param {string} sNormalizationFunction - the normalization function whose input we're testing
     * @throws {Error} if the input string is invalid
     * @private
     */
    _testNormalizationInput: function(sString, sNormalizationFunction) {
      if ($.type(sString) !== "string") {
        throw new Error("dataTableUtils.normalization." + sNormalizationFunction + ": parameter 'sString' must be a valid string");
      }
    },

    /**
     * Tests a conversion function's input parameter to make sure it's valid
     *
     * @param {array} aArray - the parameter to test
     * @param {string} sFunc - the conversion function whose input we're testing (e.g. "toObject" or "toTable")
     * @throws {Error} if the input parameter is invalid
     * @private
     */
    _testArrayInput: function(aArray, sFunc) {

      var sErrorMessage = "dataTableUtils." + sFunc + ": parameter 'aData' must be an Array of Array of Strings";

      if ($.type(aArray) !== "array") {
        throw new Error(sErrorMessage);
      }

      if (!aArray.every(function(a) {
            return ($.type(a) === "array") && (a.every(function(s){return ($.type(s) === "string");}));
          })) {
        throw new Error(sErrorMessage);
      }
    }
  };

  return dataTableUtils;
}, /* bExport= */ true);
