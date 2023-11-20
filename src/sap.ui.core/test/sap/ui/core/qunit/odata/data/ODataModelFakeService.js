/*global sinon */
sap.ui.define([], function() {
  "use strict";

  var sBaseUrl = "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/";
  var xhr = sinon.useFakeXMLHttpRequest(),
    baseURL = sBaseUrl,
    responseDelay = 10,
    _setTimeout = window.setTimeout,
    csrfToken,
    sessionContextId;

  function updateCsrfToken() {
    csrfToken = "" + Math.floor(Math.random() * 1000000000);
  }

  function setCsrfToken(newCsrfToken) {
    csrfToken = newCsrfToken;
  }

  function deleteCsrfToken() {
    csrfToken = undefined;
  }

  function updateSessionContextId() {
    sessionContextId = "SID-" + Math.floor(Math.random() * 1000000000) + "-NEW";
  }

  function resetBaseUrl() {
    baseURL = "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/";
  }

  function setBaseUrl(newBaseUrl) {
    baseURL = newBaseUrl;
  }

  function getHeader(headers, header) {
    header = header.toLowerCase();
    for (var i in headers) {
      if (i.toLowerCase() == header) {
        return headers[i];
      }
    }
    return undefined;
  }

  var ofakeService = {
    updateCsrfToken: updateCsrfToken,
    deleteCsrfToken: deleteCsrfToken,
    setBaseUrl: setBaseUrl,
    resetBaseUrl: resetBaseUrl,
    setCsrfToken: setCsrfToken,
    setResponseDelay: function(iDelay) {
      responseDelay = iDelay;
    }
  };

  window.odataFakeServiceData = {
    forbidHeadRequest: false,
    csrfRequests: [],
    requests: []
  };

  xhr.useFilters = true;
  xhr.addFilter(function(method, url) {
    return url.indexOf(baseURL) != 0;
  });
  xhr.onCreate = function(request) {
    var	responses = {
      "GET": {
    "AuthorizationCheck?name='ReportDefinitionPropertiesSet'":
      [200, oJSONHeaders, JSON.stringify(oAuthorizationCheckA)],
    "AuthorizationCheck?name='SchemaEntryPointInfoSet'":
      [200, oJSONHeaders, JSON.stringify(oAuthorizationCheckB)],
		"Customers/$count":
			[200, oCountHeaders, "91"],
		"Customers?$skip=0&$top=60":
			[200, oJSONHeaders, JSON.stringify(oCustomers1)],
    "Customers?$skip=20&$top=40":
			[200, oJSONHeaders, JSON.stringify(oCustomers11)],
		"Customers?$skip=20&$top=50":
			[200, oJSONHeaders, JSON.stringify(oCustomers2)],
		"Customers?$skip=40&$top=50":
			[200, oJSONHeaders, JSON.stringify(oCustomers3)],
		"Customers?$skip=21&$top=42":
			[200, oJSONHeaders, JSON.stringify(oCustomers4)],
		"Customers?$skip=41&$top=22":
			[200, oJSONHeaders, JSON.stringify(oCustomers5)],
		"Customers?$skip=61&$top=16":
			[200, oJSONHeaders, JSON.stringify(oCustomers6)],
        "$metadata":
          [200, oMetaDataHeaders, sMetaData],
        "$metadata?test-namespace=true":
          [200, oMetaDataHeaders, sMetaData4],
        "$metadata?sap-context-token=test-token":
          [200, oMetaDataHeaders, sMetaData],
        "$metadata?sap-value-list=none":
          [200, oMetaDataHeaders, sMetaData1],
        "$metadata?sap-value-list=all":
          [200, oMetaDataHeaders, sMetaData2],
        "$metadata?sap-value-list=Test":
          [200, oMetaDataHeaders, sMetaData2],
        "$metadata?sap-value-list=Test2":
          [200, oMetaDataHeaders, sMetaData2],
        "$metadata?sap-value-list=Test3":
          [200, oMetaDataHeaders, sMetaData3],
        "$metadata?test=x":
          [200, oMetaDataHeaders, sMetaData],
        "$metadata?test=x&sap-language=en&test2=xx":
          [200, oMetaDataHeaders, sMetaData],
        "$metadata?test=complex":
          [200, oMetaDataHeaders, sMetadataComplex],
        "$metadata?sap-language=en&test2=xx":
          [200, oMetaDataHeaders, sMetaData],
        "$metadata?result-property=true":
          [200, oMetaDataHeaders, sMetaData5],
        "Products?$skip=0&$top=100&Error500":
          [500, oXMLErrorHeaders, sError],
        "Products?Error500&$skip=0&$top=100":
          [500, oXMLErrorHeaders, sError],
        "Regions":
          [200, oXMLHeaders, sRegionsXML],
        "Products(2)":
          [200, oXMLHeaders, sProducts2XML],
        "Products(2)?Error500":
          [500, oXMLErrorHeaders, sError],
        "Products(3)":
          [200, oXMLHeaders, sProducts3XML],
        "Products(3)?$select=ProductName":
          [200, oXMLHeaders, sProducts3SelProductNameXML],
        "Products(3)?$expand=Category":
          [200, oXMLHeaders, sProducts3ExpCategoryXML],
        "Products(3)?$expand=Supplier":
          [200, oXMLHeaders, sProducts3ExpSupplierXML],
        "Products(3)?$expand=Supplier%2fProducts":
          [200, oXMLHeaders, sProducts3ExpSupplierProductsXML],
        "Products(7)/Supplier/Products":
          [200, oXMLHeaders, sProducts7EmptyResult],
        "Products(7)?$expand=Supplier%2fProducts":
          [200, oXMLHeaders, sProducts7ExpSupplierProductsXML],
        "Products(7)?$expand=Category":
          [200, oXMLHeaders, sProducts7ExpCategoryXML],
        "Products(3)?$select=ProductName%2cCategory&$expand=Category":
          [200, oXMLHeaders, sProducts3SelProductNameExpCategoryXML],
        "Products(3)?$select=Category%2fCategoryName&$expand=Category":
          [200, oXMLHeaders, sProducts3SelCategoryNameExpCategoryXML],
        "Products(3)?$select=ProductName%2cCategory%2fCategoryName&$expand=Category":
          [200, oXMLHeaders, sProducts3SelProductAndCategoryNameExpCategoryXML],
        "Products(4)?$expand=Category":
          [200, oXMLHeaders, sProducts4ExpCategoryXML],
        "Invoices/$count":
          [200, oCountHeaders, "8"],
        "Invoices?$skip=0&$top=100":
          [200, oJSONHeaders, sInvoicesJSON],
        "Invoices":
          [200, oJSONHeaders, sInvoicesJSON],
        "Categories(2)":
          [200, oXMLHeaders, sCategories2XML],
        "Categories(7)":
          [200, oXMLHeaders, sCategories7XML],
        "Categories(7)?$expand=Products":
          [200, oXMLHeaders, sCategories7ExpandXML],
        "Categories(7)?$expand=Products&$select=Products%2FProductID":
          [200, oXMLHeaders, sCategories7ExpandProductsSelect],
        "Categories(7)?$expand=Products&$select=Products%2fProductID":
          [200, oXMLHeaders, sCategories7ExpandProductsSelect],
        "Categories":
          [200, oXMLHeaders, sCategoriesXML],
        "Categories?hubel=dubel":
          [200, oXMLHeaders, sCategoriesXML],
        "Categories?test=x&hubel=dubel":
          [200, oXMLHeaders, sCategoriesXML],
        "Categories?horst=true":
          [200, oXMLHeaders, sCategoriesXML],
        "Categories?$skip=0&$top=8":
          [200, oXMLHeaders, sCategoriesXML],
        "Categories?$skip=8&$top=8":
          [200, oXMLHeaders, sCategoriesXMLEmpty],
        "Categories?$skip=0&$top=100":
          [200, oXMLHeaders, sCategoriesXML],
        "Products(2)/Category":
          [200, oXMLHeaders, sCategories2XML],
        "Products(3)/Category":
          [200, oXMLHeaders, sCategories7XML],
        "Products(1)/Category?$select=CategoryID":
          [200, oJSONHeaders, sCategorySelect2JSON],
        "Products(1)/Category":
          [200, oJSONHeaders, sCategory1JSON],
        "Products(1)/Supplier":
          [200, oXMLHeaders, sProducts1SupplierXML],
        "Suppliers(1)/Products/$count":
          [200, oCountHeaders, "3"],
        "Products(1)/Supplier/Products/$count":
          [200, oCountHeaders, "3"],
        "Products(1)/Supplier/Products?$skip=0&$top=100":
          [200, oXMLHeaders, sProducts1SupplierProductsXML],
        "Suppliers(1)/Products?$skip=0&$top=100":
          [200, oXMLHeaders, sProducts1SupplierProductsXML],
        "Categories?$skip=0&$top=100&$inlinecount=allpages":
          [200, oXMLHeaders, sCategoriesXML],
        "Categories?$skip=0&$top=8&$orderby=CategoryName%20desc":
          [200, oXMLHeaders, sCategoriesOrderDescXML],
        "Categories?$skip=0&$top=8&$orderby=CategoryName%20asc":
          [200, oXMLHeaders, sCategoriesOrderAscXML],
        "Categories?$skip=0&$top=8&$expand=Products":
          [200, oXMLHeaders, sCategoriesExpandProductsXML],
        "Categories?$skip=0&$top=100&$expand=Products":
          [200, oXMLHeaders, sCategoriesExpandProductsXML],
        "Products(1)?$expand=Category":
          [200, oXMLHeaders, sProducts1ExpandCategoryXML],
        "Products(1)":
          [200, oXMLHeaders, sProducts1XML],
        "Categories/$count":
          [200, oCountHeaders, "8"],
        "Categories/$count?$filter=toupper(CategoryName)%20eq%20%27BEVERAGES%27":
          [200, oCountHeaders, "1"],
        "Categories?$filter=toupper(CategoryName)%20eq%20%27BEVERAGES%27":
          [200, oXMLHeaders, sCategoriesFilter1XML],
        "Categories/$count?$filter=not%20startswith(CategoryName,%27C%27)":
          [200, oCountHeaders, "6"],
        "Categories?$skip=0&$top=100&$filter=not%20startswith(CategoryName,%27C%27)&$select=CategoryName":
          [200, oJSONHeaders, sCategoriesNotFilter1JSON],
        "Categories?$skip=1&$top=5&search=foo&$inlinecount=allpages":
          [200, oJSONHeaders, sCategoriesZeroCount],
        "Categories/$count?$filter=not%20endswith(CategoryName,%27s%27)":
          [200, oCountHeaders, "3"],
        "Categories?$skip=0&$top=100&$filter=not%20endswith(CategoryName,%27s%27)&$select=CategoryName":
          [200, oJSONHeaders, sCategoriesNotFilter2JSON],
        "Categories/$count?$filter=not%20substringof(%27ry%27,CategoryName)":
          [200, oCountHeaders, "6"],
        "Categories?$skip=0&$top=100&$filter=not%20substringof(%27ry%27,CategoryName)&$select=CategoryName":
          [200, oJSONHeaders, sCategoriesNotFilter3JSON],
        "Categories/$count?$filter=(CategoryName%20lt%20%27C%27%20or%20CategoryName%20gt%20%27M%27)":
          [200, oCountHeaders, "6"],
        "Categories?$skip=0&$top=100&$filter=not%20(CategoryName%20ge%20%27C%27%20and%20CategoryName%20le%20%27M%27)&$select=CategoryName":
          [200, oJSONHeaders, sCategoriesNotFilter4JSON],
        "Categories/$count?$filter=CategoryName%20eq%20%27Beverages%27":
          [200, oCountHeaders, "1"],
        "Categories?$skip=0&$top=1&$filter=CategoryName%20eq%20%27Beverages%27":
          [200, oXMLHeaders, sCategoriesFilter1XML],
        "Categories?$skip=0&$top=1&$orderby=CategoryName%20asc":
          [200, oXMLHeaders, sCategoriesXML],
        "Categories?$skip=0&$top=100&$filter=CategoryName%20eq%20%27Beverages%27":
          [200, oXMLHeaders, sCategoriesFilter1XML],
        "Categories/$count?$filter=CategoryName%20eq%20%27Condiments%27%20or%20substringof(%27ons%27,CategoryName)":
          [200, oCountHeaders, "2"],
        "Categories?$skip=0&$top=2&$filter=CategoryName%20eq%20%27Condiments%27%20or%20substringof(%27ons%27,CategoryName)":
          [200, oXMLHeaders, sCategoriesFilter2XML],
        "Categories?$skip=0&$top=100&$filter=CategoryName%20eq%20%27Condiments%27%20or%20substringof(%27ons%27,CategoryName)":
          [200, oXMLHeaders, sCategoriesFilter2XML],
        "Categories/$count?$filter=(CategoryName%20ge%20%27Beverages%27%20and%20CategoryName%20le%20%27D%27)":
          [200, oCountHeaders, "3"],
        "Categories?$skip=0&$top=3&$filter=(CategoryName%20ge%20%27Beverages%27%20and%20CategoryName%20le%20%27D%27)":
          [200, oXMLHeaders, sCategoriesFilter3XML],
        "Categories/$count?$filter=CategoryName%20eq%20%27NONEXISTING%27":
          [200, oCountHeaders, "0"],
        "Categories?$skip=0&$top=100&$filter=CategoryName%20eq%20%27NONEXISTING%27":
          [200, oXMLHeaders, sCategoriesFilterZeroXML],
        "Categories?$skip=0&$top=100&$filter=(CategoryName%20ge%20%27Beverages%27%20and%20CategoryName%20le%20%27D%27)":
          [200, oXMLHeaders, sCategoriesFilter3XML],
        "Categories/$count?$filter=startswith(CategoryName,%27C%27)%20and%20endswith(Description,%27ngs%27)":
          [200, oCountHeaders, "1"],
        "Categories?$skip=0&$top=1&$filter=startswith(CategoryName,%27C%27)%20and%20endswith(Description,%27ngs%27)":
          [200, oXMLHeaders, sCategoriesFilter4XML],
        "Categories?$skip=0&$top=100&$filter=startswith(CategoryName,%27C%27)%20and%20endswith(Description,%27ngs%27)":
          [200, oXMLHeaders, sCategoriesFilter4XML],
        "Categories/$count?$filter=CategoryName%20le%20%27Z%27%20and%20CategoryName%20ge%20%27A%27%20and%20CategoryName%20ne%20%27Beverages%27":
          [200, oCountHeaders, "7"],
        "Categories?$skip=0&$top=7&$filter=CategoryName%20le%20%27Z%27%20and%20CategoryName%20ge%20%27A%27%20and%20CategoryName%20ne%20%27Beverages%27":
          [200, oXMLHeaders, sCategoriesFilter5XML],
        "Categories?$skip=0&$top=100&$filter=CategoryName%20le%20%27Z%27%20and%20CategoryName%20ge%20%27A%27%20and%20CategoryName%20ne%20%27Beverages%27":
          [200, oXMLHeaders, sCategoriesFilter5XML],
        "Categories/$count?$filter=CategoryName%20eq%20%27Condiments%27%20or%20CategoryName%20eq%20%27Beverages%27":
          [200, oCountHeaders, "2"],
        "Categories?$skip=0&$top=2&$filter=CategoryName%20eq%20%27Condiments%27%20or%20CategoryName%20eq%20%27Beverages%27":
          [200, oXMLHeaders, sCategoriesFilter6XML],
        "Categories?$skip=0&$top=100&$filter=CategoryName%20eq%20%27Condiments%27%20or%20CategoryName%20eq%20%27Beverages%27":
          [200, oXMLHeaders, sCategoriesFilter6XML],
        "Categories/$count?$filter=(CategoryName%20eq%20%27Condiments%27%20or%20CategoryName%20eq%20%27Beverages%27)%20and%20endswith(Description,%27ings%27)":
          [200, oCountHeaders, "1"],
        "Categories?$skip=0&$top=1&$filter=(CategoryName%20eq%20%27Condiments%27%20or%20CategoryName%20eq%20%27Beverages%27)%20and%20endswith(Description,%27ings%27)":
          [200, oXMLHeaders, sCategoriesFilter7XML],
        "Categories?$skip=0&$top=100&$filter=(CategoryName%20eq%20%27Condiments%27%20or%20CategoryName%20eq%20%27Beverages%27)%20and%20endswith(Description,%27ings%27)":
          [200, oXMLHeaders, sCategoriesFilter7XML],
        "Categories/$count?$filter=((CategoryName%20eq%20%27Beverages%27%20or%20CategoryName%20eq%20%27Dairy%20Products%27%20or%20CategoryName%20eq%20%27Grains%2fCereals%27)%20or%20CategoryID%20eq%203)%20and%20endswith(Description,%27s%27)":
          [200, oCountHeaders, "3"],
        "Categories?$skip=0&$top=3&$filter=((CategoryName%20eq%20%27Beverages%27%20or%20CategoryName%20eq%20%27Dairy%20Products%27%20or%20CategoryName%20eq%20%27Grains%2fCereals%27)%20or%20CategoryID%20eq%203)%20and%20endswith(Description,%27s%27)":
          [200, oXMLHeaders, sCategoriesFilter8XML],
        "Categories?$skip=0&$top=100&$filter=((CategoryName%20eq%20%27Beverages%27%20or%20CategoryName%20eq%20%27Dairy%20Products%27%20or%20CategoryName%20eq%20%27Grains%2fCereals%27)%20or%20CategoryID%20eq%203)%20and%20endswith(Description,%27s%27)":
          [200, oXMLHeaders, sCategoriesFilter8XML],
        "Categories(7)/Products?$skip=0&$top=5":
          [200, oXMLHeaders, sProductsXML],
        "Categories(7)/Products?$skip=0&$top=100":
          [200, oXMLHeaders, sProductsXML],
        "Categories(7)/Products/$count":
          [200, oCountHeaders, "5"],
        "Categories(2)/Products?$skip=0&$top=100":
            [200, oXMLHeaders, sProductsXML],
        "Categories(2)/Products/$count":
            [200, oCountHeaders, "5"],
        "Categories(1)":
          [200, oJSONHeaders, sCategory1JSON],
        "Categories(20)":
          [200, oJSONHeaders, sCategoryWithResultProp],
        "Categories(1)?test":
          [200, oJSONHeaders, sCategory1JSON],
        "Categories(1)?hubel=dubel&test":
          [200, oJSONHeaders, sCategory1JSON],
        "ZeroTest(1)":
          [200, oJSONHeaders, sZeroTest],
        "Categories(3)":
          [200, oJSONHeaders, sCategory3JSON],
        "Categories(4)":
          [200, oJSONHeaders, sCategory4JSON],
        "Categories(5)":
          [200, oJSONHeaders, sCategoryBrokenJSON],
        "Categories(10)":
          [200, oJSONHeaders, sCategory10JSON],
        "Categories?$skip=0&$top=8&$select=CategoryName":
          [200, oJSONHeaders, sCategorySelectJSON],
        "Categories?$skip=0&$top=100&$select=CategoryName":
          [200, oJSONHeaders, sCategorySelectJSON],
        "Categories(1)?$select=CategoryID":
          [200, oJSONHeaders, sCategorySelect2JSON],
        "Categories(1)?$expand=Products":
          [200, oJSONHeaders, sCategories1ExpandProducts],
        "Categories(1)/Products?$skip=0&$top=100&search=Test":
          [200, oJSONHeaders, sCategories1ProductsSearch],
        "Categories(1)/Products/$count?search=Test":
          [200, oCountHeaders, "12"],
       "Categories(1)/Products?$skip=0&$top=100&$filter=ProductName%20eq%20%27Chai%27":
          [200, oJSONHeaders, sCategories1ProductsFilterChai],
        "Categories(1)/Products/$count?$filter=ProductName%20eq%20%27Chai%27":
          [200, oCountHeaders, "1"],
        "Products/$count?$filter=ProductName%20eq%20%27Chai%27":
          [200, oCountHeaders, "1"],
        "Products?$skip=0&$top=1&$filter=ProductName%20eq%20%27Chai%27&$expand=Category":
          [200, oJSONHeaders, sProductExpandJSON],
        "Products?$skip=0&$top=100&$filter=ProductName%20eq%20%27Chai%27&$expand=Category":
          [200, oJSONHeaders, sProductExpandJSON],
        "Products?$skip=0&$top=1&$filter=ProductName%20eq%20%27Chai%27":
          [200, oJSONHeaders, sProductJSON],
        "Products/$count?$filter=ProductName%20eq%20%27Chang%27":
          [200, oCountHeaders, "1"],
        "Products?$skip=0&$top=1&$filter=ProductName%20eq%20%27Chang%27":
          [200, oJSONHeaders, sProduct2JSON],
        "Products?$skip=0&$top=100&$filter=ProductName%20eq%20%27Chang%27":
          [200, oJSONHeaders, sProduct2JSON],
        "Products(2)?$expand=Category":
          [200, oJSONHeaders, sProduct2ExpandJSON1],
        "Products?$skip=0&$top=1&$filter=ProductName%20eq%20%27Chang%27&$select=Category%2cProductName&$expand=Category":
          [200, oJSONHeaders, sProductSelectExpandJSON],
        "Products?$skip=0&$top=100&$filter=ProductName%20eq%20%27Chang%27&$select=Category%2cProductName&$expand=Category":
          [200, oJSONHeaders, sProductSelectExpandJSON],
        "Products(2)?$select=Category%2c%20ProductID&$expand=Category":
          [200, oJSONHeaders, sProduct2SelectExpandJSON],
        "Products?$skip=0&$top=100&$filter=ProductName%20eq%20%27Chang%27&$select=Category%2fCategoryName%2cProductName&$expand=Category":
          [200, oJSONHeaders, sProduct3SelectExpandJSON],
        "Products":
          [200, oXMLHeaders, sProductsAllXML],
        "Products(1)?$expand=Category%2fProducts%2fSupplier":
          [200, oXMLHeaders, sProductsExpand3LevelsXML],
        "Suppliers(7)?$select=%2a%2cProducts%2f%2a%2cProducts%2fSupplier%2f%2a%2cProducts%2fCategory%2fCategoryID%2cProducts%2fCategory%2fCategoryName&$expand=Products%2cProducts%2fSupplier%2cProducts%2fCategory":
          [200, oJSONHeaders, sSupplierWithMultipleExpandSelectsJSON],
        "Suppliers(7)?$expand=Products%2cProducts%2fSupplier%2cProducts%2fCategory":
          [200, oJSONHeaders, sSupplierWithMultipleExpandJSON],
        "Products(1000)/Supplier":
          [200, oJSONHeaders, sSupplier1],
        "Employees":
          [200, oXMLHeaders, sEmployeesXML],
        "Employees(2)":
          [200, oXMLHeaders, sEmployees2XML],
        "Employees(2)?$expand=Employees1%2fEmployees1%2fEmployees1":
          [200, oXMLHeaders, sEmployees1Expand3LevelsXML],
        //Filter ANDing Tests
        //Products?$skip=0&$top=5&$filter=(substringof(%27o%27,ProductName))%20and%20(startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000M)
        "Products/$count?$filter=startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000m":
          [200, oCountHeaders, "9"],
        "Products?$skip=0&$top=9&$filter=startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000m":
          [200, oXMLHeaders, sProductsForFilterANDing1],
        "Products/$count?$filter=substringof(%27o%27,ProductName)%20and%20(startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000m)":
          [200, oCountHeaders, "5"],
        "Products?$skip=0&$top=5&$filter=substringof(%27o%27,ProductName)%20and%20(startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000m)":
          [200, oXMLHeaders, sProductsForFilterANDing2],
        "Products/$count?$filter=UnitPrice%20le%2030.000m%20and%20(startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000m)":
          [200, oCountHeaders, "6"],
        "Products?$skip=0&$top=6&$filter=UnitPrice%20le%2030.000m%20and%20(startswith(ProductName,%27C%27)%20and%20UnitPrice%20ge%2010.000m)":
          [200, oXMLHeaders, sProductsForFilterANDing3],
            "Regions?$skip=0&$top=100&$expand=Territories&$inlinecount=allpages":
          [200, oJSONHeaders, sRegionsJSON],
        "Regions/$count":
          [200, oJSONHeaders, "4"],
        // Multi-Origin Fault Tolerance
        // Fake filter on ShipCity in Orders collection
        "Orders?$skip=0&$top=2&$filter=ShipCity%20eq%20%27TEST_FAULT_TOLERANCE%27&$inlinecount=allpages":
          [200, oXMLHeaders, sFaultTolerance1],
        "Orders?$skip=2&$top=1&$filter=ShipCity%20eq%20%27TEST_FAULT_TOLERANCE%27&$inlinecount=allpages":
          [200, oXMLHeaders, sFaultTolerance2],
        "Current_Product_Lists":
          [200, oJSONHeaders, sCurrentProductListsJSON],
        "Employees(2)/Employee1":
          [204, oNodataHeaders, ""],
        "SpecialHeaders":
          [204, oSpecialHeaders, ""],
        "SpecialHeadersError":
          [500, oSpecialHeaders, ""]
      },
      "POST":{
        //create Entry
        "Products?create=id_1000":
          [200, oJSONHeaders, sProduct1000CreatedJSON],
        // function import
        "DisableProduct?id='1000'":
          [200, oJSONHeaders, sProduct1000FunctionCallJSON],
        "GetProductsByRating":
          [200, oJSONHeaders, sProduct2JSON],
        "UpdateProducts":
          [200, oJSONHeaders, sProduct2JSON],
        "Products?Fail500=true":
          [500, oJSONHeaders, ''],
        "Products?Fail500=false":
          [201, oJSONHeaders, sProduct2JSON],
        "$batch":
          [202, oJSONHeaders, sProduct2JSON],
        "Categories(1)": function(url, headers) {
          if (headers) {
            if (headers["If-Match"] === "testETag") {
              return [412, oJSONHeaders, ""];
            } else if (headers["If-Match"] === "*") {
              return [204, oJSONHeaders, ""];
            }
          }
        },
        "Employees(2)/Employee1":
          [204, oNodataHeaders, ""]
      },
      "PUT": {
        "Employees(2)/Employee1":
          [204, oNodataHeaders, ""]
      },
      "MERGE": {
        "Employees(2)/Employee1":
          [204, oNodataHeaders, ""]
      },
      "DELETE": {

      },
      "HEAD": {

      }
    };

    var getResponse = function(method, url, headers) {
      var bError =
        url.indexOf("Fail500") >= 0 ||
        (url === "/Categories(1-NOHEAD)" && method === "HEAD");

      if (bError) {
        return [500, oHTMLHeaders, "Server Error"];
      }
      var vResponse = typeof (responses[method][url]) === "function"
        ? responses[method][url](url, headers)
        : responses[method][url];

      switch (method) {
        case "GET":
          return vResponse || [404, oJSONHeaders, ""];
        case "HEAD":
          var aReturnValues = vResponse || [404, oJSONHeaders, ""];
          aReturnValues[2] = ""; // Same as "GET" but without body
          return aReturnValues;
        case "PUT":
          return vResponse || [204, oJSONHeaders, ""];
        case "MERGE":
          return vResponse || [204, oJSONHeaders, ""];
        case "POST":
          return vResponse || [201, oJSONHeaders, sCategory1JSON];
        case "DELETE":
          return vResponse || [204, oJSONHeaders, ""];
        default:
          return vResponse || [500, oHTMLHeaders, ""];
      }
    };

    request.onSend = function() {
      if (window.fakeRequested) {
        window.fakeRequested();
      }
      console.log(">> " + request.url); // eslint-disable-line no-console
      function respond(code, headers, data) {
        if (request.async) {
          _setTimeout(function() {
            if (!request.aborted) {
              if (window.fakeResponded) {
                window.fakeResponded();
              }
              request.respond(code, headers, data);
            }
          }, responseDelay);
        } else if (!request.aborted) {
            if (window.fakeResponded) {
              window.fakeResponded();
            }
            request.respond(code, headers, data);
          }
      }

      // CSRF Token handling

      // Special case: Simulate backend that does not allow HEAD requests
      if (window.odataFakeServiceData.forbidHeadRequest && request.method === "HEAD") {
        if (request.url == baseURL) {
          window.odataFakeServiceData.csrfRequests.push(request.method); // Log Requests to service document
        }
        respond(500, oHTMLHeaders, "Server Error");
        return;
      }

      // Log all requests containing a CSRF token
      if (csrfToken && request.url !== baseURL && getHeader(request.requestHeaders, "X-CSRF-Token")) {
        window.odataFakeServiceData.requests.push(request.method);
      }

      if (["GET", "HEAD"].indexOf(request.method) === -1 && csrfToken) {
        if (getHeader(request.requestHeaders, "X-CSRF-Token") != csrfToken) {

          respond(403, oCsrfRequireHeaders, "");
          return;
        }
      }

      if (request.url == baseURL) {
        // Simulate Soft State header handling
        updateSessionContextId();
        oCsrfResponseHeaders["sap-contextid"] = sessionContextId;

        oCsrfResponseHeaders["X-CSRF-Token"] = csrfToken;
        window.odataFakeServiceData.csrfRequests.push(request.method); // Log Requests to service document
        respond(200, oCsrfResponseHeaders, sServiceDocXML);
        return;
      }

      // Special handling SAML authentication redirect
      if (request.url.indexOf("SAML200") > 0 || (request.requestBody && request.requestBody.indexOf("SAML200") > 0)) {
        respond(200, oSAMLHeaders, sSAMLLoginPage);
        return;
      }

      // Special handling based on headers
      if (request.url == baseURL + "Categories" || request.url == baseURL + "Categories?horst=true") {
        if (request.requestHeaders["Accept"] == "application/atom+xml,application/atomsvc+xml,application/xml") {
          respond(200, oXMLHeaders, sCategoriesXML);
        } else {
          // Simulate Soft State header handling
          updateSessionContextId();
          oJSONHeaders["sap-contextid"] = sessionContextId;

          respond(200, oJSONHeaders, sCategoriesJSON);
        }
        return;
      }

      // Batch request
      if (request.url == baseURL + "$batch") {
        if (request.requestBody.indexOf("Batch500") > 0) {
          respond(500, oJSONHeaders, "Request Failed");
          return;
        }

        var requests = parseBatchRequest(request.requestBody),
          response,
          batchResponses = [],
          nestedResponses,
          failed,
          batchResponse;
        for (var i = 0; i < requests.length; i++) {
          if (requests[i] instanceof Array) {
            nestedResponses = [];
            failed = false;
            for (var j = 0; j < requests[i].length; j++) {
              response = getResponse(requests[i][j].method, requests[i][j].url, requests[i][j].requestHeaders);
              nestedResponses.push(response);
              if (response[0] >= 300) {
                failed = true;
              }
            }
            if (failed) {
              batchResponses.push([500, oJSONHeaders, "Changeset failed"]);
            } else {
              batchResponses.push(nestedResponses);
            }
          } else {
            response = getResponse(requests[i].method, requests[i].url, requests[i].requestHeaders);
            batchResponses.push(response);
          }
        }
        batchResponse = createBatchResponse(batchResponses, "batch-408D0D264EF1AB69CA1BF7");

        updateSessionContextId();
        oBatchHeaders["sap-contextid"] = sessionContextId;

        respond(202, oBatchHeaders, batchResponse);
        return;
      }

      // Look up response
      respond.apply(this, getResponse(request.method, request.url.substr(baseURL.length), request.requestHeaders));
    };
  };

  function parseBatchRequest(body) {
    var token = body.split("\r\n")[1],
      parts = body.split("\r\n" + token),
      part, lines,
      nestedRequests,
      requests = [];
    // loop through parts and create request objects
    for (var i = 1; i < parts.length - 1; i++) {
      part = parts[i];
      if (part.indexOf("\r\nContent-Type: multipart/mixed") == 0) {
        nestedRequests = parseBatchRequest("\r\n" + part.substr(part.indexOf("--")));
        requests.push(nestedRequests);
      } else {
        var request = {};
        var lines = part.split("\r\n");
        var result = lines[4].match(/(GET|POST|MERGE|PUT|DELETE) ([^ ]*) HTTP\/1\.1/);
        request.method = result[1];
        request.url = result[2];
        request.body = "";
        request.headers = {};
        var headers = true;
        for (var j = 5; j < lines.length; j++) {
          if (lines[j] == "") {
            headers = false;
            continue;
          }
          if (headers) {
            var header = lines[j].split(": ");
            request.headers[header[0]] = header[1];
          } else {
            request.body += lines[j] + "\n";
          }
        }
        requests.push(request);
      }
    }
    return requests;
  }

  function createBatchResponse(responses, token) {
    var responseText = "",
      code, headers, body,
      innerText,
      innerToken;
    for (var i = 0; i < responses.length; i++) {
      if (typeof responses[i][0] != "number") {
        innerToken = "changeset-" + Math.random() * 1000000000000000000;
        innerText = "\r\n";
        innerText += createBatchResponse(responses[i], innerToken);
        responseText += "--" + token + "\r\n";
        responseText += "Content-Type: multipart/mixed; boundary=" + innerToken + "\r\n";
        responseText += "Content-Length: " + innerText.length + "\r\n";
        responseText += innerText + "\r\n";
      } else {
        code = responses[i][0];
        headers = responses[i][1];
        body = responses[i][2];
        innerText = "HTTP/1.1 " + code + " ";
        switch (code) {
          case 200:
            innerText += "OK";
            break;
          case 204:
            innerText += "No content";
            break;
          case 201:
            innerText += "Created";
            break;
          case 404:
            innerText += "Not Found";
            break;
          case 500:
            innerText += "Server Error";
            break;
          case 412:
            innerText += "Precodition failed";
            break;
        }
        innerText += "\r\n";
        for (var j in headers) {
          innerText += j + ": " + headers[j] + "\r\n";
        }
        innerText += "Content-Length: " + body.length + "\r\n";
        innerText += "\r\n";
        if (body.length > 0) {
          innerText += body + "\r\n";
        }
        responseText += "--" + token + "\r\n";
        responseText += "Content-Type: application/http\r\n";
        responseText += "Content-Transfer-Encoding: binary\r\n";
        responseText += "Content-Length: " + innerText.length + "\r\n";
        responseText += "\r\n";
        responseText += innerText + "\r\n";
      }
    }
    responseText += "--" + token + "--\r\n";
    return responseText;
  }

  var oMetaDataHeaders = {
      "Content-Type": "application/xml;charset=utf-8",
      "DataServiceVersion": "1.0",
      "last-modified": "Tue, 15 Nov 1994 12:45:26 GMT"
    };
  var oNodataHeaders = 	{
      "DataServiceVersion": "1.0"
    };
  var oXMLHeaders = 	{
      "Content-Type": "application/atom+xml;charset=utf-8",
      "DataServiceVersion": "2.0",
      "Age": "oh so very old",
      "Invalid": "invalid"
    };

  var oXMLErrorHeaders = 	{
      "Content-Type": "application/xml;charset=utf-8"
  };

  var oJSONHeaders = 	{
      "Content-Type": "application/json;charset=utf-8",
      "DataServiceVersion": "2.0"
    };
  var oCountHeaders = 	{
      "Content-Type": "text/plain;charset=utf-8",
      "DataServiceVersion": "2.0"
    };
  var oBatchHeaders = 	{
      "Content-Type": "multipart/mixed; boundary=batch-408D0D264EF1AB69CA1BF7",
      "DataServiceVersion": "2.0"
    };
  var oHTMLHeaders = 	{
      "Content-Type": "text/html"
    };
  var oSAMLHeaders = 	{
      "Content-Type": "text/html",
      "com.sap.cloud.security.login": "login-request"
    };
  var oCsrfRequireHeaders = 	{
      "Content-Type": "text/plain;charset=utf-8",
      "DataServiceVersion": "2.0",
      "X-CSRF-Token": "required"
    };
  var oCsrfResponseHeaders = 	{
      "Content-Type": "application/xml;charset=utf-8",
      "DataServiceVersion": "1.0",
      "X-CSRF-Token": ""
    };
  var oSpecialHeaders = {
    "Content-Type": "application/xml;charset=utf-8",
    "DataServiceVersion": "1.0",
    "lAsT-mOdIfIeD": "morgen frueh",
    "X-CuStOm-HeAdEr": "case-sensitive"
  };
  var sSAMLLoginPage = '<html><body><h1>SAML Login Page</h1></body></html>';

  var sError = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
    <error>\
      <message xml:lang="en-US">Resource not found for the segment Products.</message>\
    </error>';

  var sServiceDocXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
    <service xml:base="http://services.odata.org/V2/Northwind/Northwind.svc/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:app="http://www.w3.org/2007/app" xmlns="http://www.w3.org/2007/app">\
      <workspace>\
        <atom:title>Default</atom:title>\
        <collection href="Categories">\
          <atom:title>Categories</atom:title>\
        </collection>\
        <collection href="CustomerDemographics">\
          <atom:title>CustomerDemographics</atom:title>\
        </collection>\
        <collection href="Customers">\
          <atom:title>Customers</atom:title>\
        </collection>\
        <collection href="Employees">\
          <atom:title>Employees</atom:title>\
        </collection>\
        <collection href="Order_Details">\
          <atom:title>Order_Details</atom:title>\
        </collection>\
        <collection href="Orders">\
          <atom:title>Orders</atom:title>\
        </collection>\
        <collection href="Products">\
          <atom:title>Products</atom:title>\
        </collection>\
        <collection href="Regions">\
          <atom:title>Regions</atom:title>\
        </collection>\
        <collection href="Shippers">\
          <atom:title>Shippers</atom:title>\
        </collection>\
        <collection href="Suppliers">\
          <atom:title>Suppliers</atom:title>\
        </collection>\
        <collection href="Territories">\
          <atom:title>Territories</atom:title>\
        </collection>\
        <collection href="Alphabetical_list_of_products">\
          <atom:title>Alphabetical_list_of_products</atom:title>\
        </collection>\
        <collection href="Category_Sales_for_1997">\
          <atom:title>Category_Sales_for_1997</atom:title>\
        </collection>\
        <collection href="Current_Product_Lists">\
          <atom:title>Current_Product_Lists</atom:title>\
        </collection>\
        <collection href="Customer_and_Suppliers_by_Cities">\
          <atom:title>Customer_and_Suppliers_by_Cities</atom:title>\
        </collection>\
        <collection href="Invoices">\
          <atom:title>Invoices</atom:title>\
        </collection>\
        <collection href="Order_Details_Extendeds">\
          <atom:title>Order_Details_Extendeds</atom:title>\
        </collection>\
        <collection href="Order_Subtotals">\
          <atom:title>Order_Subtotals</atom:title>\
        </collection>\
        <collection href="Orders_Qries">\
          <atom:title>Orders_Qries</atom:title>\
        </collection>\
        <collection href="Product_Sales_for_1997">\
          <atom:title>Product_Sales_for_1997</atom:title>\
        </collection>\
        <collection href="Products_Above_Average_Prices">\
          <atom:title>Products_Above_Average_Prices</atom:title>\
        </collection>\
        <collection href="Products_by_Categories">\
          <atom:title>Products_by_Categories</atom:title>\
        </collection>\
        <collection href="Sales_by_Categories">\
          <atom:title>Sales_by_Categories</atom:title>\
        </collection>\
        <collection href="Sales_Totals_by_Amounts">\
          <atom:title>Sales_Totals_by_Amounts</atom:title>\
        </collection>\
        <collection href="Summary_of_Sales_by_Quarters">\
          <atom:title>Summary_of_Sales_by_Quarters</atom:title>\
        </collection>\
        <collection href="Summary_of_Sales_by_Years">\
          <atom:title>Summary_of_Sales_by_Years</atom:title>\
        </collection>\
      </workspace>\
    </service>\
  ';

  var sMetaData = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\
    <edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="1.0">\
      <Schema Namespace="NorthwindModel" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
        <EntityType Name="Category">\
          <Key>\
            <PropertyRef Name="CategoryID" />\
          </Key>\
          <Property Name="CategoryID" Type="Edm.Int32" Nullable="false" p8:StoreGeneratedPattern="Identity" xmlns:p8="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
          <Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="Description" Type="Edm.String" Nullable="true" MaxLength="Max" Unicode="true" FixedLength="false" />\
          <NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Categories" FromRole="Categories" ToRole="Products" />\
        </EntityType>\
        <EntityType Name="CustomerDemographic">\
          <Key>\
            <PropertyRef Name="CustomerTypeID" />\
          </Key>\
          <Property Name="CustomerTypeID" Type="Edm.String" Nullable="false" MaxLength="10" Unicode="true" FixedLength="true" />\
          <Property Name="CustomerDesc" Type="Edm.String" Nullable="true" MaxLength="Max" Unicode="true" FixedLength="false" />\
          <NavigationProperty Name="Customers" Relationship="NorthwindModel.CustomerCustomerDemo" FromRole="CustomerDemographics" ToRole="Customers" />\
        </EntityType>\
        <EntityType Name="Customer">\
          <Key>\
            <PropertyRef Name="CustomerID" />\
          </Key>\
          <Property Name="CustomerID" Type="Edm.String" Nullable="false" MaxLength="5" Unicode="true" FixedLength="true" />\
          <Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="ContactName" Type="Edm.String" Nullable="true" MaxLength="30" Unicode="true" FixedLength="false" />\
          <Property Name="ContactTitle" Type="Edm.String" Nullable="true" MaxLength="30" Unicode="true" FixedLength="false" />\
          <Property Name="Address" Type="Edm.String" Nullable="true" MaxLength="60" Unicode="true" FixedLength="false" />\
          <Property Name="City" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="Region" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="PostalCode" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="true" FixedLength="false" />\
          <Property Name="Country" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="Phone" Type="Edm.String" Nullable="true" MaxLength="24" Unicode="true" FixedLength="false" />\
          <Property Name="Fax" Type="Edm.String" Nullable="true" MaxLength="24" Unicode="true" FixedLength="false" />\
          <NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Customers" FromRole="Customers" ToRole="Orders" />\
          <NavigationProperty Name="CustomerDemographics" Relationship="NorthwindModel.CustomerCustomerDemo" FromRole="Customers" ToRole="CustomerDemographics" />\
        </EntityType>\
        <EntityType Name="Employee">\
          <Key>\
            <PropertyRef Name="EmployeeID" />\
          </Key>\
          <Property Name="EmployeeID" Type="Edm.Int32" Nullable="false" p8:StoreGeneratedPattern="Identity" xmlns:p8="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
          <Property Name="LastName" Type="Edm.String" Nullable="false" MaxLength="20" Unicode="true" FixedLength="false" />\
          <Property Name="FirstName" Type="Edm.String" Nullable="false" MaxLength="10" Unicode="true" FixedLength="false" />\
          <Property Name="Title" Type="Edm.String" Nullable="true" MaxLength="30" Unicode="true" FixedLength="false" />\
          <Property Name="TitleOfCourtesy" Type="Edm.String" Nullable="true" MaxLength="25" Unicode="true" FixedLength="false" />\
          <Property Name="BirthDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="HireDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="Address" Type="Edm.String" Nullable="true" MaxLength="60" Unicode="true" FixedLength="false" />\
          <Property Name="City" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="Region" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="PostalCode" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="true" FixedLength="false" />\
          <Property Name="Country" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="HomePhone" Type="Edm.String" Nullable="true" MaxLength="24" Unicode="true" FixedLength="false" />\
          <Property Name="Extension" Type="Edm.String" Nullable="true" MaxLength="4" Unicode="true" FixedLength="false" />\
          <Property Name="Photo" Type="Edm.Binary" Nullable="true" MaxLength="Max" FixedLength="false" />\
          <Property Name="Notes" Type="Edm.String" Nullable="true" MaxLength="Max" Unicode="true" FixedLength="false" />\
          <Property Name="ReportsTo" Type="Edm.Int32" Nullable="true" />\
          <Property Name="PhotoPath" Type="Edm.String" Nullable="true" MaxLength="255" Unicode="true" FixedLength="false" />\
          <NavigationProperty Name="Employees1" Relationship="NorthwindModel.FK_Employees_Employees" FromRole="Employees" ToRole="Employees1" />\
          <NavigationProperty Name="Employee1" Relationship="NorthwindModel.FK_Employees_Employees" FromRole="Employees1" ToRole="Employees" />\
          <NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Employees" FromRole="Employees" ToRole="Orders" />\
          <NavigationProperty Name="Territories" Relationship="NorthwindModel.EmployeeTerritories" FromRole="Employees" ToRole="Territories" />\
        </EntityType>\
        <EntityType Name="Order_Detail">\
          <Key>\
            <PropertyRef Name="OrderID" />\
            <PropertyRef Name="ProductID" />\
          </Key>\
          <Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
          <Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
          <Property Name="Discount" Type="Edm.Single" Nullable="false" />\
          <NavigationProperty Name="Order" Relationship="NorthwindModel.FK_Order_Details_Orders" FromRole="Order_Details" ToRole="Orders" />\
          <NavigationProperty Name="Product" Relationship="NorthwindModel.FK_Order_Details_Products" FromRole="Order_Details" ToRole="Products" />\
        </EntityType>\
        <EntityType Name="Order">\
          <Key>\
            <PropertyRef Name="OrderID" />\
          </Key>\
          <Property Name="OrderID" Type="Edm.Int32" Nullable="false" p8:StoreGeneratedPattern="Identity" xmlns:p8="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
          <Property Name="CustomerID" Type="Edm.String" Nullable="true" MaxLength="5" Unicode="true" FixedLength="true" />\
          <Property Name="EmployeeID" Type="Edm.Int32" Nullable="true" />\
          <Property Name="OrderDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="RequiredDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="ShippedDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="ShipVia" Type="Edm.Int32" Nullable="true" />\
          <Property Name="Freight" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
          <Property Name="ShipName" Type="Edm.String" Nullable="true" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="ShipAddress" Type="Edm.String" Nullable="true" MaxLength="60" Unicode="true" FixedLength="false" />\
          <Property Name="ShipCity" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="ShipRegion" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="ShipPostalCode" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="true" FixedLength="false" />\
          <Property Name="ShipCountry" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <NavigationProperty Name="Customer" Relationship="NorthwindModel.FK_Orders_Customers" FromRole="Orders" ToRole="Customers" />\
          <NavigationProperty Name="Employee" Relationship="NorthwindModel.FK_Orders_Employees" FromRole="Orders" ToRole="Employees" />\
          <NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Orders" FromRole="Orders" ToRole="Order_Details" />\
          <NavigationProperty Name="Shipper" Relationship="NorthwindModel.FK_Orders_Shippers" FromRole="Orders" ToRole="Shippers" />\
        </EntityType>\
        <EntityType Name="Product">\
          <Key>\
            <PropertyRef Name="ProductID" />\
          </Key>\
          <Property Name="ProductID" Type="Edm.Int32" Nullable="false" p8:StoreGeneratedPattern="Identity" xmlns:p8="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
          <Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="SupplierID" Type="Edm.Int32" Nullable="true" />\
          <Property Name="CategoryID" Type="Edm.Int32" Nullable="true" />\
          <Property Name="QuantityPerUnit" Type="Edm.String" Nullable="true" MaxLength="20" Unicode="true" FixedLength="false" />\
          <Property Name="UnitPrice" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
          <Property Name="UnitsInStock" Type="Edm.Int16" Nullable="true" />\
          <Property Name="UnitsOnOrder" Type="Edm.Int16" Nullable="true" />\
          <Property Name="ReorderLevel" Type="Edm.Int16" Nullable="true" />\
          <Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
          <NavigationProperty Name="Category" Relationship="NorthwindModel.FK_Products_Categories" FromRole="Products" ToRole="Categories" />\
          <NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Products" FromRole="Products" ToRole="Order_Details" />\
          <NavigationProperty Name="Supplier" Relationship="NorthwindModel.FK_Products_Suppliers" FromRole="Products" ToRole="Suppliers" />\
        </EntityType>\
        <EntityType Name="Region">\
          <Key>\
            <PropertyRef Name="RegionID" />\
          </Key>\
          <Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="RegionDescription" Type="Edm.String" Nullable="false" MaxLength="50" Unicode="true" FixedLength="true" />\
          <NavigationProperty Name="Territories" Relationship="NorthwindModel.FK_Territories_Region" FromRole="Region" ToRole="Territories" />\
        </EntityType>\
        <EntityType Name="Shipper">\
          <Key>\
            <PropertyRef Name="ShipperID" />\
          </Key>\
          <Property Name="ShipperID" Type="Edm.Int32" Nullable="false" p8:StoreGeneratedPattern="Identity" xmlns:p8="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
          <Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="Phone" Type="Edm.String" Nullable="true" MaxLength="24" Unicode="true" FixedLength="false" />\
          <NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Shippers" FromRole="Shippers" ToRole="Orders" />\
        </EntityType>\
        <EntityType Name="Supplier">\
          <Key>\
            <PropertyRef Name="SupplierID" />\
          </Key>\
          <Property Name="SupplierID" Type="Edm.Int32" Nullable="false" p8:StoreGeneratedPattern="Identity" xmlns:p8="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
          <Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="ContactName" Type="Edm.String" Nullable="true" MaxLength="30" Unicode="true" FixedLength="false" />\
          <Property Name="ContactTitle" Type="Edm.String" Nullable="true" MaxLength="30" Unicode="true" FixedLength="false" />\
          <Property Name="Address" Type="Edm.String" Nullable="true" MaxLength="60" Unicode="true" FixedLength="false" />\
          <Property Name="City" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="Region" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="PostalCode" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="true" FixedLength="false" />\
          <Property Name="Country" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="Phone" Type="Edm.String" Nullable="true" MaxLength="24" Unicode="true" FixedLength="false" />\
          <Property Name="Fax" Type="Edm.String" Nullable="true" MaxLength="24" Unicode="true" FixedLength="false" />\
          <Property Name="HomePage" Type="Edm.String" Nullable="true" MaxLength="Max" Unicode="true" FixedLength="false" />\
          <NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Suppliers" FromRole="Suppliers" ToRole="Products" />\
        </EntityType>\
        <EntityType Name="Territory">\
          <Key>\
            <PropertyRef Name="TerritoryID" />\
          </Key>\
          <Property Name="TerritoryID" Type="Edm.String" Nullable="false" MaxLength="20" Unicode="true" FixedLength="false" />\
          <Property Name="TerritoryDescription" Type="Edm.String" Nullable="false" MaxLength="50" Unicode="true" FixedLength="true" />\
          <Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
          <NavigationProperty Name="Region" Relationship="NorthwindModel.FK_Territories_Region" FromRole="Territories" ToRole="Region" />\
          <NavigationProperty Name="Employees" Relationship="NorthwindModel.EmployeeTerritories" FromRole="Territories" ToRole="Employees" />\
        </EntityType>\
        <EntityType Name="Alphabetical_list_of_product">\
          <Key>\
            <PropertyRef Name="ProductID" />\
            <PropertyRef Name="ProductName" />\
            <PropertyRef Name="Discontinued" />\
            <PropertyRef Name="CategoryName" />\
          </Key>\
          <Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="SupplierID" Type="Edm.Int32" Nullable="true" />\
          <Property Name="CategoryID" Type="Edm.Int32" Nullable="true" />\
          <Property Name="QuantityPerUnit" Type="Edm.String" Nullable="true" MaxLength="20" Unicode="true" FixedLength="false" />\
          <Property Name="UnitPrice" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
          <Property Name="UnitsInStock" Type="Edm.Int16" Nullable="true" />\
          <Property Name="UnitsOnOrder" Type="Edm.Int16" Nullable="true" />\
          <Property Name="ReorderLevel" Type="Edm.Int16" Nullable="true" />\
          <Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
          <Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" Unicode="true" FixedLength="false" />\
        </EntityType>\
        <EntityType Name="Category_Sales_for_1997">\
          <Key>\
            <PropertyRef Name="CategoryName" />\
          </Key>\
          <Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="CategorySales" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
        </EntityType>\
        <EntityType Name="Current_Product_List">\
          <Key>\
            <PropertyRef Name="ProductID" />\
            <PropertyRef Name="ProductName" />\
          </Key>\
          <Property Name="ProductID" Type="Edm.Int32" Nullable="false" p8:StoreGeneratedPattern="Identity" xmlns:p8="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
          <Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
        </EntityType>\
        <EntityType Name="Customer_and_Suppliers_by_City">\
          <Key>\
            <PropertyRef Name="CompanyName" />\
            <PropertyRef Name="Relationship" />\
          </Key>\
          <Property Name="City" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="ContactName" Type="Edm.String" Nullable="true" MaxLength="30" Unicode="true" FixedLength="false" />\
          <Property Name="Relationship" Type="Edm.String" Nullable="false" MaxLength="9" Unicode="false" FixedLength="false" />\
        </EntityType>\
        <EntityType Name="Invoice">\
          <Key>\
            <PropertyRef Name="CustomerName" />\
            <PropertyRef Name="Salesperson" />\
            <PropertyRef Name="OrderID" />\
            <PropertyRef Name="ShipperName" />\
            <PropertyRef Name="ProductID" />\
            <PropertyRef Name="ProductName" />\
            <PropertyRef Name="UnitPrice" />\
            <PropertyRef Name="Quantity" />\
            <PropertyRef Name="Discount" />\
          </Key>\
          <Property Name="ShipName" Type="Edm.String" Nullable="true" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="ShipAddress" Type="Edm.String" Nullable="true" MaxLength="60" Unicode="true" FixedLength="false" />\
          <Property Name="ShipCity" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="ShipRegion" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="ShipPostalCode" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="true" FixedLength="false" />\
          <Property Name="ShipCountry" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="CustomerID" Type="Edm.String" Nullable="true" MaxLength="5" Unicode="true" FixedLength="true" />\
          <Property Name="CustomerName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="Address" Type="Edm.String" Nullable="true" MaxLength="60" Unicode="true" FixedLength="false" />\
          <Property Name="City" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="Region" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="PostalCode" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="true" FixedLength="false" />\
          <Property Name="Country" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="Salesperson" Type="Edm.String" Nullable="false" MaxLength="31" Unicode="true" FixedLength="false" />\
          <Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="OrderDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="RequiredDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="ShippedDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="ShipperName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
          <Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
          <Property Name="Discount" Type="Edm.Single" Nullable="false" />\
          <Property Name="ExtendedPrice" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
          <Property Name="Freight" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
        </EntityType>\
        <EntityType Name="Order_Details_Extended">\
          <Key>\
            <PropertyRef Name="OrderID" />\
            <PropertyRef Name="ProductID" />\
            <PropertyRef Name="ProductName" />\
            <PropertyRef Name="UnitPrice" />\
            <PropertyRef Name="Quantity" />\
            <PropertyRef Name="Discount" />\
          </Key>\
          <Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
          <Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
          <Property Name="Discount" Type="Edm.Single" Nullable="false" />\
          <Property Name="ExtendedPrice" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
        </EntityType>\
        <EntityType Name="Order_Subtotal">\
          <Key>\
            <PropertyRef Name="OrderID" />\
          </Key>\
          <Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="Subtotal" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
        </EntityType>\
        <EntityType Name="Orders_Qry">\
          <Key>\
            <PropertyRef Name="OrderID" />\
            <PropertyRef Name="CompanyName" />\
          </Key>\
          <Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="CustomerID" Type="Edm.String" Nullable="true" MaxLength="5" Unicode="true" FixedLength="true" />\
          <Property Name="EmployeeID" Type="Edm.Int32" Nullable="true" />\
          <Property Name="OrderDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="RequiredDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="ShippedDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="ShipVia" Type="Edm.Int32" Nullable="true" />\
          <Property Name="Freight" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
          <Property Name="ShipName" Type="Edm.String" Nullable="true" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="ShipAddress" Type="Edm.String" Nullable="true" MaxLength="60" Unicode="true" FixedLength="false" />\
          <Property Name="ShipCity" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="ShipRegion" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="ShipPostalCode" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="true" FixedLength="false" />\
          <Property Name="ShipCountry" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="Address" Type="Edm.String" Nullable="true" MaxLength="60" Unicode="true" FixedLength="false" />\
          <Property Name="City" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="Region" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="PostalCode" Type="Edm.String" Nullable="true" MaxLength="10" Unicode="true" FixedLength="false" />\
          <Property Name="Country" Type="Edm.String" Nullable="true" MaxLength="15" Unicode="true" FixedLength="false" />\
        </EntityType>\
        <EntityType Name="Product_Sales_for_1997">\
          <Key>\
            <PropertyRef Name="CategoryName" />\
            <PropertyRef Name="ProductName" />\
          </Key>\
          <Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="ProductSales" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
        </EntityType>\
        <EntityType Name="Products_Above_Average_Price">\
          <Key>\
            <PropertyRef Name="ProductName" />\
          </Key>\
          <Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="UnitPrice" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
        </EntityType>\
        <EntityType Name="Products_by_Category">\
          <Key>\
            <PropertyRef Name="CategoryName" />\
            <PropertyRef Name="ProductName" />\
            <PropertyRef Name="Discontinued" />\
          </Key>\
          <Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="QuantityPerUnit" Type="Edm.String" Nullable="true" MaxLength="20" Unicode="true" FixedLength="false" />\
          <Property Name="UnitsInStock" Type="Edm.Int16" Nullable="true" />\
          <Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
        </EntityType>\
        <EntityType Name="Sales_by_Category">\
          <Key>\
            <PropertyRef Name="CategoryID" />\
            <PropertyRef Name="CategoryName" />\
            <PropertyRef Name="ProductName" />\
          </Key>\
          <Property Name="CategoryID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="ProductSales" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
        </EntityType>\
        <EntityType Name="Sales_Totals_by_Amount">\
          <Key>\
            <PropertyRef Name="OrderID" />\
            <PropertyRef Name="CompanyName" />\
          </Key>\
          <Property Name="SaleAmount" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
          <Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" Unicode="true" FixedLength="false" />\
          <Property Name="ShippedDate" Type="Edm.DateTime" Nullable="true" />\
        </EntityType>\
        <EntityType Name="Summary_of_Sales_by_Quarter">\
          <Key>\
            <PropertyRef Name="OrderID" />\
          </Key>\
          <Property Name="ShippedDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="Subtotal" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
        </EntityType>\
        <EntityType Name="Summary_of_Sales_by_Year">\
          <Key>\
            <PropertyRef Name="OrderID" />\
          </Key>\
          <Property Name="ShippedDate" Type="Edm.DateTime" Nullable="true" />\
          <Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
          <Property Name="Subtotal" Type="Edm.Decimal" Nullable="true" Precision="19" Scale="4" />\
        </EntityType>\
        <Association Name="FK_Products_Categories">\
          <End Role="Categories" Type="NorthwindModel.Category" Multiplicity="0..1" />\
          <End Role="Products" Type="NorthwindModel.Product" Multiplicity="*" />\
          <ReferentialConstraint>\
            <Principal Role="Categories">\
              <PropertyRef Name="CategoryID" />\
            </Principal>\
            <Dependent Role="Products">\
              <PropertyRef Name="CategoryID" />\
            </Dependent>\
          </ReferentialConstraint>\
        </Association>\
        <Association Name="FK_Orders_Customers">\
          <End Role="Customers" Type="NorthwindModel.Customer" Multiplicity="0..1" />\
          <End Role="Orders" Type="NorthwindModel.Order" Multiplicity="*" />\
          <ReferentialConstraint>\
            <Principal Role="Customers">\
              <PropertyRef Name="CustomerID" />\
            </Principal>\
            <Dependent Role="Orders">\
              <PropertyRef Name="CustomerID" />\
            </Dependent>\
          </ReferentialConstraint>\
        </Association>\
        <Association Name="FK_Employees_Employees">\
          <End Role="Employees" Type="NorthwindModel.Employee" Multiplicity="0..1" />\
          <End Role="Employees1" Type="NorthwindModel.Employee" Multiplicity="*" />\
          <ReferentialConstraint>\
            <Principal Role="Employees">\
              <PropertyRef Name="EmployeeID" />\
            </Principal>\
            <Dependent Role="Employees1">\
              <PropertyRef Name="ReportsTo" />\
            </Dependent>\
          </ReferentialConstraint>\
        </Association>\
        <Association Name="FK_Orders_Employees">\
          <End Role="Employees" Type="NorthwindModel.Employee" Multiplicity="0..1" />\
          <End Role="Orders" Type="NorthwindModel.Order" Multiplicity="*" />\
          <ReferentialConstraint>\
            <Principal Role="Employees">\
              <PropertyRef Name="EmployeeID" />\
            </Principal>\
            <Dependent Role="Orders">\
              <PropertyRef Name="EmployeeID" />\
            </Dependent>\
          </ReferentialConstraint>\
        </Association>\
        <Association Name="FK_Order_Details_Orders">\
          <End Role="Orders" Type="NorthwindModel.Order" Multiplicity="1" />\
          <End Role="Order_Details" Type="NorthwindModel.Order_Detail" Multiplicity="*" />\
          <ReferentialConstraint>\
            <Principal Role="Orders">\
              <PropertyRef Name="OrderID" />\
            </Principal>\
            <Dependent Role="Order_Details">\
              <PropertyRef Name="OrderID" />\
            </Dependent>\
          </ReferentialConstraint>\
        </Association>\
        <Association Name="FK_Order_Details_Products">\
          <End Role="Products" Type="NorthwindModel.Product" Multiplicity="1" />\
          <End Role="Order_Details" Type="NorthwindModel.Order_Detail" Multiplicity="*" />\
          <ReferentialConstraint>\
            <Principal Role="Products">\
              <PropertyRef Name="ProductID" />\
            </Principal>\
            <Dependent Role="Order_Details">\
              <PropertyRef Name="ProductID" />\
            </Dependent>\
          </ReferentialConstraint>\
        </Association>\
        <Association Name="FK_Orders_Shippers">\
          <End Role="Shippers" Type="NorthwindModel.Shipper" Multiplicity="0..1" />\
          <End Role="Orders" Type="NorthwindModel.Order" Multiplicity="*" />\
          <ReferentialConstraint>\
            <Principal Role="Shippers">\
              <PropertyRef Name="ShipperID" />\
            </Principal>\
            <Dependent Role="Orders">\
              <PropertyRef Name="ShipVia" />\
            </Dependent>\
          </ReferentialConstraint>\
        </Association>\
        <Association Name="FK_Products_Suppliers">\
          <End Role="Suppliers" Type="NorthwindModel.Supplier" Multiplicity="0..1" />\
          <End Role="Products" Type="NorthwindModel.Product" Multiplicity="*" />\
          <ReferentialConstraint>\
            <Principal Role="Suppliers">\
              <PropertyRef Name="SupplierID" />\
            </Principal>\
            <Dependent Role="Products">\
              <PropertyRef Name="SupplierID" />\
            </Dependent>\
          </ReferentialConstraint>\
        </Association>\
        <Association Name="FK_Territories_Region">\
          <End Role="Region" Type="NorthwindModel.Region" Multiplicity="1" />\
          <End Role="Territories" Type="NorthwindModel.Territory" Multiplicity="*" />\
          <ReferentialConstraint>\
            <Principal Role="Region">\
              <PropertyRef Name="RegionID" />\
            </Principal>\
            <Dependent Role="Territories">\
              <PropertyRef Name="RegionID" />\
            </Dependent>\
          </ReferentialConstraint>\
        </Association>\
        <Association Name="CustomerCustomerDemo">\
          <End Role="CustomerDemographics" Type="NorthwindModel.CustomerDemographic" Multiplicity="*" />\
          <End Role="Customers" Type="NorthwindModel.Customer" Multiplicity="*" />\
        </Association>\
        <Association Name="EmployeeTerritories">\
          <End Role="Employees" Type="NorthwindModel.Employee" Multiplicity="*" />\
          <End Role="Territories" Type="NorthwindModel.Territory" Multiplicity="*" />\
        </Association>\
      </Schema>\
      <Schema Namespace="ODataWeb.Northwind.Model" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
        <EntityContainer Name="NorthwindEntities" p7:LazyLoadingEnabled="true" m:IsDefaultEntityContainer="true" xmlns:p7="http://schemas.microsoft.com/ado/2009/02/edm/annotation">\
          <EntitySet Name="Categories" EntityType="NorthwindModel.Category" />\
          <EntitySet Name="CustomerDemographics" EntityType="NorthwindModel.CustomerDemographic" />\
          <EntitySet Name="Customers" EntityType="NorthwindModel.Customer" />\
          <EntitySet Name="Employees" EntityType="NorthwindModel.Employee" />\
          <EntitySet Name="Order_Details" EntityType="NorthwindModel.Order_Detail" />\
          <EntitySet Name="Orders" EntityType="NorthwindModel.Order" />\
          <EntitySet Name="Products" EntityType="NorthwindModel.Product" />\
          <EntitySet Name="Regions" EntityType="NorthwindModel.Region" />\
          <EntitySet Name="Shippers" EntityType="NorthwindModel.Shipper" />\
          <EntitySet Name="Suppliers" EntityType="NorthwindModel.Supplier" />\
          <EntitySet Name="Territories" EntityType="NorthwindModel.Territory" />\
          <EntitySet Name="Alphabetical_list_of_products" EntityType="NorthwindModel.Alphabetical_list_of_product" />\
          <EntitySet Name="Category_Sales_for_1997" EntityType="NorthwindModel.Category_Sales_for_1997" />\
          <EntitySet Name="Current_Product_Lists" EntityType="NorthwindModel.Current_Product_List" />\
  \
          <EntitySet Name="Customer_and_Suppliers_by_Cities" EntityType="NorthwindModel.Customer_and_Suppliers_by_City" />\
          <EntitySet Name="Invoices" EntityType="NorthwindModel.Invoice" />\
          <EntitySet Name="Order_Details_Extendeds" EntityType="NorthwindModel.Order_Details_Extended" />\
          <EntitySet Name="Order_Subtotals" EntityType="NorthwindModel.Order_Subtotal" />\
          <EntitySet Name="Orders_Qries" EntityType="NorthwindModel.Orders_Qry" />\
          <EntitySet Name="Product_Sales_for_1997" EntityType="NorthwindModel.Product_Sales_for_1997" />\
          <EntitySet Name="Products_Above_Average_Prices" EntityType="NorthwindModel.Products_Above_Average_Price" />\
          <EntitySet Name="Products_by_Categories" EntityType="NorthwindModel.Products_by_Category" />\
          <EntitySet Name="Sales_by_Categories" EntityType="NorthwindModel.Sales_by_Category" />\
          <EntitySet Name="Sales_Totals_by_Amounts" EntityType="NorthwindModel.Sales_Totals_by_Amount" />\
          <EntitySet Name="Summary_of_Sales_by_Quarters" EntityType="NorthwindModel.Summary_of_Sales_by_Quarter" />\
          <EntitySet Name="Summary_of_Sales_by_Years" EntityType="NorthwindModel.Summary_of_Sales_by_Year" />\
          <AssociationSet Name="FK_Products_Categories" Association="NorthwindModel.FK_Products_Categories">\
            <End Role="Categories" EntitySet="Categories" />\
            <End Role="Products" EntitySet="Products" />\
          </AssociationSet>\
          <AssociationSet Name="FK_Orders_Customers" Association="NorthwindModel.FK_Orders_Customers">\
            <End Role="Customers" EntitySet="Customers" />\
            <End Role="Orders" EntitySet="Orders" />\
          </AssociationSet>\
          <AssociationSet Name="FK_Employees_Employees" Association="NorthwindModel.FK_Employees_Employees">\
            <End Role="Employees" EntitySet="Employees" />\
            <End Role="Employees1" EntitySet="Employees" />\
          </AssociationSet>\
          <AssociationSet Name="FK_Orders_Employees" Association="NorthwindModel.FK_Orders_Employees">\
            <End Role="Employees" EntitySet="Employees" />\
            <End Role="Orders" EntitySet="Orders" />\
          </AssociationSet>\
          <AssociationSet Name="FK_Order_Details_Orders" Association="NorthwindModel.FK_Order_Details_Orders">\
            <End Role="Orders" EntitySet="Orders" />\
            <End Role="Order_Details" EntitySet="Order_Details" />\
          </AssociationSet>\
          <AssociationSet Name="FK_Order_Details_Products" Association="NorthwindModel.FK_Order_Details_Products">\
            <End Role="Products" EntitySet="Products" />\
            <End Role="Order_Details" EntitySet="Order_Details" />\
          </AssociationSet>\
          <AssociationSet Name="FK_Orders_Shippers" Association="NorthwindModel.FK_Orders_Shippers">\
            <End Role="Shippers" EntitySet="Shippers" />\
            <End Role="Orders" EntitySet="Orders" />\
          </AssociationSet>\
          <AssociationSet Name="FK_Products_Suppliers" Association="NorthwindModel.FK_Products_Suppliers">\
            <End Role="Suppliers" EntitySet="Suppliers" />\
            <End Role="Products" EntitySet="Products" />\
          </AssociationSet>\
          <AssociationSet Name="FK_Territories_Region" Association="NorthwindModel.FK_Territories_Region">\
            <End Role="Region" EntitySet="Regions" />\
            <End Role="Territories" EntitySet="Territories" />\
          </AssociationSet>\
          <AssociationSet Name="CustomerCustomerDemo" Association="NorthwindModel.CustomerCustomerDemo">\
            <End Role="CustomerDemographics" EntitySet="CustomerDemographics" />\
            <End Role="Customers" EntitySet="Customers" />\
          </AssociationSet>\
          <AssociationSet Name="EmployeeTerritories" Association="NorthwindModel.EmployeeTerritories">\
            <End Role="Employees" EntitySet="Employees" />\
            <End Role="Territories" EntitySet="Territories" />\
          </AssociationSet>\
      <FunctionImport Name="GetProductsByRating" EntitySet="Products" ReturnType="Collection(NorthwindModel.Product)" m:HttpMethod="GET">\
        <Parameter Name="rating" Type="Edm.Int32" Mode="In"/>\
      </FunctionImport>\
      <FunctionImport Name="AuthorizationCheck" EntitySet="Products" ReturnType="NorthwindModel.Product" m:HttpMethod="GET">\
        <Parameter Name="name" Type="Edm.String" Mode="In"/>\
      </FunctionImport>\
      <FunctionImport Name="UpdateProducts" EntitySet="Products" ReturnType="Collection(NorthwindModel.Product)" m:HttpMethod="PUT">\
        <Parameter Name="price" Type="Edm.Decimal" Mode="In"/>\
      </FunctionImport>\
      <FunctionImport Name="DisableProduct" EntitySet="Products" ReturnType="NorthwindModel.Product" m:HttpMethod="POST">\
        <Parameter Name="id" Type="Edm.String" Mode="In"/>\
      </FunctionImport>\
        </EntityContainer>\
      </Schema>\
    </edmx:DataServices>\
  </edmx:Edmx>\
    ';

  var sMetaData4 = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\
    <edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="1.0">\
      <Schema Namespace="North.wind.Model" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
        <EntityType Name="Category">\
          <Key>\
            <PropertyRef Name="CategoryID" />\
          </Key>\
          <Property Name="CategoryID" Type="Edm.Int32" Nullable="false" p8:StoreGeneratedPattern="Identity" xmlns:p8="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
          <Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" Unicode="true" FixedLength="false" />\
          <Property Name="Description" Type="Edm.String" Nullable="true" MaxLength="Max" Unicode="true" FixedLength="false" />\
          <NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Categories" FromRole="Categories" ToRole="Products" />\
        </EntityType>\
      <Association Name="FK_Products_Categories">\
          <End Role="Categories" Type="North.wind.Model.Category" Multiplicity="0..1" />\
          <End Role="Products" Type="North.wind.Model.Product" Multiplicity="*" />\
          <ReferentialConstraint>\
            <Principal Role="Categories">\
              <PropertyRef Name="CategoryID" />\
            </Principal>\
            <Dependent Role="Products">\
              <PropertyRef Name="CategoryID" />\
            </Dependent>\
          </ReferentialConstraint>\
        </Association>\
      </Schema>\
      <Schema Namespace="ODataWeb.Northwind.Model" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
        <EntityContainer Name="NorthwindEntities" p7:LazyLoadingEnabled="true" m:IsDefaultEntityContainer="true" xmlns:p7="http://schemas.microsoft.com/ado/2009/02/edm/annotation">\
          <EntitySet Name="Categories" EntityType="North.wind.Model.Category" />\
          <AssociationSet Name="FK_Products_Categories" Association="North.wind.Model.FK_Products_Categories">\
            <End Role="Categories" EntitySet="Categories" />\
            <End Role="Products" EntitySet="Products" />\
          </AssociationSet>\
        </EntityContainer>\
      </Schema>\
    </edmx:DataServices>\
  </edmx:Edmx>\
    ';

    var sMetaData5 = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
    <edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\
      <edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="1.0">\
        <Schema Namespace="North.wind.Model" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
          <EntityType Name="Category">\
            <Key>\
              <PropertyRef Name="CategoryID" />\
            </Key>\
            <Property Name="CategoryID" Type="Edm.Int32" Nullable="false" p8:StoreGeneratedPattern="Identity" xmlns:p8="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
            <Property Name="results" Type="Edm.String" Nullable="true" MaxLength="Max" Unicode="true" FixedLength="false" />\
            <Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" Unicode="true" FixedLength="false" />\
            <Property Name="Description" Type="Edm.String" Nullable="true" MaxLength="Max" Unicode="true" FixedLength="false" />\
            <NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Categories" FromRole="Categories" ToRole="Products" />\
          </EntityType>\
        <Association Name="FK_Products_Categories">\
            <End Role="Categories" Type="North.wind.Model.Category" Multiplicity="0..1" />\
            <End Role="Products" Type="North.wind.Model.Product" Multiplicity="*" />\
            <ReferentialConstraint>\
              <Principal Role="Categories">\
                <PropertyRef Name="CategoryID" />\
              </Principal>\
              <Dependent Role="Products">\
                <PropertyRef Name="CategoryID" />\
              </Dependent>\
            </ReferentialConstraint>\
          </Association>\
        </Schema>\
        <Schema Namespace="ODataWeb.Northwind.Model" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
          <EntityContainer Name="NorthwindEntities" p7:LazyLoadingEnabled="true" m:IsDefaultEntityContainer="true" xmlns:p7="http://schemas.microsoft.com/ado/2009/02/edm/annotation">\
            <EntitySet Name="Categories" EntityType="North.wind.Model.Category" />\
            <AssociationSet Name="FK_Products_Categories" Association="North.wind.Model.FK_Products_Categories">\
              <End Role="Categories" EntitySet="Categories" />\
              <End Role="Products" EntitySet="Products" />\
            </AssociationSet>\
          </EntityContainer>\
        </Schema>\
      </edmx:DataServices>\
    </edmx:Edmx>\
      ';

  var sCategoriesXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-01-31T14:16:20Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>8</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T14:16:20Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(1)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
          <d:CategoryName>Beverages</d:CategoryName>\
          <d:Description>Soft drinks, coffees, teas, beers, and ales</d:Description>\
      <d:Picture></d:Picture>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T14:16:20Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(2)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
      <d:Picture></d:Picture>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T14:16:20Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(3)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
          <d:CategoryName>Confections</d:CategoryName>\
          <d:Description>Desserts, candies, and sweet breads</d:Description>\
      <d:Picture></d:Picture>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T14:16:20Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(4)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
          <d:CategoryName>Dairy Products</d:CategoryName>\
          <d:Description>Cheeses</d:Description>\
      <d:Picture></d:Picture>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T14:16:20Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(5)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
          <d:CategoryName>Grains/Cereals</d:CategoryName>\
          <d:Description>Breads, crackers, pasta, and cereal</d:Description>\
      <d:Picture></d:Picture>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(6)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T14:16:20Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(6)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
          <d:CategoryName>Meat/Poultry</d:CategoryName>\
          <d:Description>Prepared meats</d:Description>\
      <d:Picture></d:Picture>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T14:16:20Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(7)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">7</d:CategoryID>\
          <d:CategoryName>Produce</d:CategoryName>\
          <d:Description>Dried fruit and bean curd</d:Description>\
      <d:Picture></d:Picture>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T14:16:20Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(8)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
          <d:CategoryName>Seafood</d:CategoryName>\
          <d:Description>Seaweed and fish</d:Description>\
      <d:Picture></d:Picture>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sCategoriesXMLEmpty = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-01-31T14:16:20Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
  </feed>\
    ';

  var sCategoriesJSON = '\
  {\
  "d" : {\
  "results": [\
  {\
  "__metadata": {\
  "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)", "type": "NorthwindModel.Category"\
  }, "CategoryID": 1, "CategoryName": "Beverages", "Picture": "", "Description": "Soft drinks, coffees, teas, beers, and ales"\
  }, {\
  "__metadata": {\
  "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)", "type": "NorthwindModel.Category"\
  }, "CategoryID": 2, "CategoryName": "Condiments", "Picture": "", "Description": "Sweet and savory sauces, relishes, spreads, and seasonings"\
  }, {\
  "__metadata": {\
  "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)", "type": "NorthwindModel.Category"\
  }, "CategoryID": 3, "CategoryName": "Confections", "Picture": "", "Description": "Desserts, candies, and sweet breads"\
  }, {\
  "__metadata": {\
  "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)", "type": "NorthwindModel.Category"\
  }, "CategoryID": 4, "CategoryName": "Dairy Products", "Picture": "", "Description": "Cheeses"\
  }, {\
  "__metadata": {\
  "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)", "type": "NorthwindModel.Category"\
  }, "CategoryID": 5, "CategoryName": "Grains/Cereals", "Picture": "", "Description": "Breads, crackers, pasta, and cereal"\
  }, {\
  "__metadata": {\
  "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(6)", "type": "NorthwindModel.Category"\
  }, "CategoryID": 6, "CategoryName": "Meat/Poultry", "Picture": "", "Description": "Prepared meats"\
  }, {\
  "__metadata": {\
  "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)", "type": "NorthwindModel.Category"\
  }, "CategoryID": 7, "CategoryName": "Produce", "Picture": "", "Description": "Dried fruit and bean curd"\
  }, {\
  "__metadata": {\
  "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)", "type": "NorthwindModel.Category"\
  }, "CategoryID": 8, "CategoryName": "Seafood", "Picture": "", "Description": "Seaweed and fish"\
  }\
  ]\
  }\
  }\
    ';

  var sRegionsXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Regions</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Regions</id>\
    <updated>2013-01-31T08:51:31Z</updated>\
    <link rel="self" title="Regions" href="Regions" />\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Regions(1)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T08:51:31Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Region" href="Regions(1)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories" type="application/atom+xml;type=feed" title="Territories" href="Regions(1)/Territories" />\
      <category term="NorthwindModel.Region" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:RegionID m:type="Edm.Int32">1</d:RegionID>\
          <d:RegionDescription xml:space="preserve">Eastern                                           </d:RegionDescription>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Regions(2)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T08:51:31Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Region" href="Regions(2)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories" type="application/atom+xml;type=feed" title="Territories" href="Regions(2)/Territories" />\
      <category term="NorthwindModel.Region" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:RegionID m:type="Edm.Int32">2</d:RegionID>\
          <d:RegionDescription xml:space="preserve">Western                                           </d:RegionDescription>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Regions(3)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T08:51:31Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Region" href="Regions(3)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories" type="application/atom+xml;type=feed" title="Territories" href="Regions(3)/Territories" />\
      <category term="NorthwindModel.Region" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:RegionID m:type="Edm.Int32">3</d:RegionID>\
          <d:RegionDescription xml:space="preserve">Northern                                          </d:RegionDescription>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Regions(4)</id>\
      <title type="text"></title>\
      <updated>2013-01-31T08:51:31Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Region" href="Regions(4)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories" type="application/atom+xml;type=feed" title="Territories" href="Regions(4)/Territories" />\
      <category term="NorthwindModel.Region" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:RegionID m:type="Edm.Int32">4</d:RegionID>\
          <d:RegionDescription xml:space="preserve">Southern                                          </d:RegionDescription>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sProducts2XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)</id>\
    <title type="text"></title>\
    <updated>2013-01-31T08:51:33Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(2)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(2)/Category" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(2)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(2)/Supplier" />\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
        <d:ProductID m:type="Edm.Int32">2</d:ProductID>\
        <d:ProductName>Chang</d:ProductName>\
        <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
        <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
        <d:QuantityPerUnit>24 - 12 oz bottles</d:QuantityPerUnit>\
        <d:UnitPrice m:type="Edm.Decimal">19.0000</d:UnitPrice>\
        <d:UnitsInStock m:type="Edm.Int16">17</d:UnitsInStock>\
        <d:UnitsOnOrder m:type="Edm.Int16">40</d:UnitsOnOrder>\
        <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
        <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
      </m:properties>\
    </content>\
  </entry>\
    ';

  var sProducts3XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(3)</id>\
    <title type="text"></title>\
    <updated>2013-01-31T08:51:33Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(3)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(3)/Category" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(3)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(3)/Supplier" />\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
      <d:ProductID m:type="Edm.Int32">3</d:ProductID>\
      <d:ProductName>Aniseed Syrup</d:ProductName>\
      <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
      <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
      <d:QuantityPerUnit>12 - 550 ml bottles</d:QuantityPerUnit>\
      <d:UnitPrice m:type="Edm.Decimal">10.0000</d:UnitPrice>\
      <d:UnitsInStock m:type="Edm.Int16">13</d:UnitsInStock>\
      <d:UnitsOnOrder m:type="Edm.Int16">70</d:UnitsOnOrder>\
      <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
      <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
      </m:properties>\
    </content>\
  </entry>\
    ';

  var sProducts3SelProductNameXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://services.odata.org/V2/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(3)</id>\
    <title type="text"></title>\
    <updated>2015-11-17T10:40:06Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(3)" />\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
        <d:ProductName>Aniseed Syrup</d:ProductName>\
      </m:properties>\
    </content>\
  </entry>\
    ';

  var sProducts3ExpCategoryXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://services.odata.org/V2/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(3)</id>\
    <title type="text"></title>\
    <updated>2015-11-17T10:42:46Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(3)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(3)/Category">\
      <m:inline>\
        <entry>\
          <id>http://services.odata.org/V2/Northwind/Northwind.svc/Categories(2)</id>\
          <title type="text"></title>\
          <updated>2015-11-17T10:42:46Z</updated>\
          <author>\
            <name />\
          </author>\
          <link rel="edit" title="Category" href="Categories(2)" />\
          <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(2)/Products" />\
          <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
          <content type="application/xml">\
            <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
            <d:Picture m:type="Edm.Binary"></d:Picture>\
            </m:properties>\
          </content>\
        </entry>\
      </m:inline>\
    </link>\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(3)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(3)/Supplier" />\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
      <d:ProductID m:type="Edm.Int32">3</d:ProductID>\
      <d:ProductName>Aniseed Syrup</d:ProductName>\
      <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
      <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
      <d:QuantityPerUnit>12 - 550 ml bottles</d:QuantityPerUnit>\
      <d:UnitPrice m:type="Edm.Decimal">10.0000</d:UnitPrice>\
      <d:UnitsInStock m:type="Edm.Int16">13</d:UnitsInStock>\
      <d:UnitsOnOrder m:type="Edm.Int16">70</d:UnitsOnOrder>\
      <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
      <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
      </m:properties>\
    </content>\
  </entry>\
    ';

  var sProducts4ExpCategoryXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://services.odata.org/V2/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(4)</id>\
    <title type="text"></title>\
    <updated>2015-11-17T10:42:46Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(4)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(4)/Category">\
      <m:inline />\
    </link>\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(4)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(4)/Supplier" />\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
        <d:ProductID m:type="Edm.Int32">4</d:ProductID>\
        <d:ProductName>Chef Anton\'s Cajun Seasoning</d:ProductName>\
        <d:SupplierID m:type="Edm.Int32">2</d:SupplierID>\
        <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
        <d:QuantityPerUnit>48 - 6 oz jars</d:QuantityPerUnit>\
        <d:UnitPrice m:type="Edm.Decimal">22.0000</d:UnitPrice>\
        <d:UnitsInStock m:type="Edm.Int16">53</d:UnitsInStock>\
        <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
        <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
        <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
      </m:properties>\
    </content>\
  </entry>\
    ';


  var sProducts3SelProductNameExpCategoryXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://services.odata.org/V2/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(3)</id>\
    <title type="text"></title>\
    <updated>2015-11-17T10:42:46Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(3)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(3)/Category">\
      <m:inline>\
        <entry>\
          <id>http://services.odata.org/V2/Northwind/Northwind.svc/Categories(2)</id>\
          <title type="text"></title>\
          <updated>2015-11-17T10:42:46Z</updated>\
          <author>\
            <name />\
          </author>\
          <link rel="edit" title="Category" href="Categories(2)" />\
          <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(2)/Products" />\
          <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
          <content type="application/xml">\
            <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
              <d:Picture m:type="Edm.Binary"></d:Picture>\
            </m:properties>\
          </content>\
        </entry>\
      </m:inline>\
    </link>\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(3)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(3)/Supplier" />\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
        <d:ProductName>Aniseed Syrup</d:ProductName>\
      </m:properties>\
    </content>\
  </entry>\
    ';

  var sProducts3SelCategoryNameExpCategoryXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://services.odata.org/V2/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(3)</id>\
    <title type="text"></title>\
    <updated>2015-11-17T10:42:46Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(3)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(3)/Category">\
      <m:inline>\
        <entry>\
          <id>http://services.odata.org/V2/Northwind/Northwind.svc/Categories(2)</id>\
          <title type="text"></title>\
          <updated>2015-11-17T10:42:46Z</updated>\
          <author>\
            <name />\
          </author>\
          <link rel="edit" title="Category" href="Categories(2)" />\
          <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(2)/Products" />\
          <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
          <content type="application/xml">\
            <m:properties>\
              <d:CategoryName>Condiments</d:CategoryName>\
            </m:properties>\
          </content>\
        </entry>\
      </m:inline>\
    </link>\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(3)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(3)/Supplier" />\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
      <d:ProductID m:type="Edm.Int32">3</d:ProductID>\
      <d:ProductName>Aniseed Syrup</d:ProductName>\
      <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
      <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
      <d:QuantityPerUnit>12 - 550 ml bottles</d:QuantityPerUnit>\
      <d:UnitPrice m:type="Edm.Decimal">10.0000</d:UnitPrice>\
      <d:UnitsInStock m:type="Edm.Int16">13</d:UnitsInStock>\
      <d:UnitsOnOrder m:type="Edm.Int16">70</d:UnitsOnOrder>\
      <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
      <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
      </m:properties>\
    </content>\
  </entry>\
    ';

  var sProducts3SelProductAndCategoryNameExpCategoryXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://services.odata.org/V2/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(3)</id>\
    <title type="text"></title>\
    <updated>2015-11-17T10:42:46Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(3)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(3)/Category">\
      <m:inline>\
        <entry>\
          <id>http://services.odata.org/V2/Northwind/Northwind.svc/Categories(2)</id>\
          <title type="text"></title>\
          <updated>2015-11-17T10:42:46Z</updated>\
          <author>\
            <name />\
          </author>\
          <link rel="edit" title="Category" href="Categories(2)" />\
          <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(2)/Products" />\
          <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
          <content type="application/xml">\
            <m:properties>\
              <d:CategoryName>Condiments</d:CategoryName>\
            </m:properties>\
          </content>\
        </entry>\
      </m:inline>\
    </link>\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
        <d:ProductName>Aniseed Syrup</d:ProductName>\
      </m:properties>\
    </content>\
  </entry>\
    ';

  var sProducts1SupplierProductsXML = '<?xml version="1.0" encoding="utf-8"?><feed xml:base="http://services.odata.org/V2/northwind/Northwind.svc/" xmlns="http://www.w3.org/2005/Atom" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"><id>http://services.odata.org/V2/northwind/Northwind.svc/Products(1)/Supplier/Products</id><title type="text">Products</title><updated>2017-07-17T13:15:44Z</updated><link rel="self" title="Products" href="Products" /><entry><id>http://services.odata.org/V2/northwind/Northwind.svc/Products(1)</id><category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" /><link rel="edit" title="Product" href="Products(1)" /><link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(1)/Category" /><link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(1)/Order_Details" /><link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(1)/Supplier" /><title /><updated>2017-07-17T13:15:44Z</updated><author><name /></author><content type="application/xml"><m:properties><d:ProductID m:type="Edm.Int32">1</d:ProductID><d:ProductName>Chai</d:ProductName><d:SupplierID m:type="Edm.Int32">1</d:SupplierID><d:CategoryID m:type="Edm.Int32">1</d:CategoryID><d:QuantityPerUnit>10 boxes x 20 bags</d:QuantityPerUnit><d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice><d:UnitsInStock m:type="Edm.Int16">39</d:UnitsInStock><d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder><d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel><d:Discontinued m:type="Edm.Boolean">false</d:Discontinued></m:properties></content></entry><entry><id>http://services.odata.org/V2/northwind/Northwind.svc/Products(2)</id><category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" /><link rel="edit" title="Product" href="Products(2)" /><link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(2)/Category" /><link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(2)/Order_Details" /><link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(2)/Supplier" /><title /><updated>2017-07-17T13:15:44Z</updated><author><name /></author><content type="application/xml"><m:properties><d:ProductID m:type="Edm.Int32">2</d:ProductID><d:ProductName>Chang</d:ProductName><d:SupplierID m:type="Edm.Int32">1</d:SupplierID><d:CategoryID m:type="Edm.Int32">1</d:CategoryID><d:QuantityPerUnit>24 - 12 oz bottles</d:QuantityPerUnit><d:UnitPrice m:type="Edm.Decimal">19.0000</d:UnitPrice><d:UnitsInStock m:type="Edm.Int16">17</d:UnitsInStock><d:UnitsOnOrder m:type="Edm.Int16">40</d:UnitsOnOrder><d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel><d:Discontinued m:type="Edm.Boolean">false</d:Discontinued></m:properties></content></entry><entry><id>http://services.odata.org/V2/northwind/Northwind.svc/Products(3)</id><category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" /><link rel="edit" title="Product" href="Products(3)" /><link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(3)/Category" /><link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(3)/Order_Details" /><link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(3)/Supplier" /><title /><updated>2017-07-17T13:15:44Z</updated><author><name /></author><content type="application/xml"><m:properties><d:ProductID m:type="Edm.Int32">3</d:ProductID><d:ProductName>Aniseed Syrup</d:ProductName><d:SupplierID m:type="Edm.Int32">1</d:SupplierID><d:CategoryID m:type="Edm.Int32">2</d:CategoryID><d:QuantityPerUnit>12 - 550 ml bottles</d:QuantityPerUnit><d:UnitPrice m:type="Edm.Decimal">10.0000</d:UnitPrice><d:UnitsInStock m:type="Edm.Int16">13</d:UnitsInStock><d:UnitsOnOrder m:type="Edm.Int16">70</d:UnitsOnOrder><d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel><d:Discontinued m:type="Edm.Boolean">false</d:Discontinued></m:properties></content></entry></feed>';

  var sProducts1SupplierXML = '<?xml version="1.0" encoding="utf-8"?><entry xml:base="http://services.odata.org/V2/northwind/Northwind.svc/" xmlns="http://www.w3.org/2005/Atom" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"><id>http://services.odata.org/V2/northwind/Northwind.svc/Suppliers(1)</id><category term="NorthwindModel.Supplier" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" /><link rel="edit" title="Supplier" href="Suppliers(1)" /><link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Suppliers(1)/Products" /><title /><updated>2017-07-17T12:29:11Z</updated><author><name /></author><content type="application/xml"><m:properties><d:SupplierID m:type="Edm.Int32">1</d:SupplierID><d:CompanyName>Exotic Liquids</d:CompanyName><d:ContactName>Charlotte Cooper</d:ContactName><d:ContactTitle>Purchasing Manager</d:ContactTitle><d:Address>49 Gilbert St.</d:Address><d:City>London</d:City><d:Region m:null="true" /><d:PostalCode>EC1 4SD</d:PostalCode><d:Country>UK</d:Country><d:Phone>(171) 555-2222</d:Phone><d:Fax m:null="true" /><d:HomePage m:null="true" /></m:properties></content></entry>';



  var sProducts3ExpSupplierXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://services.odata.org/V2/northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://services.odata.org/V2/northwind/Northwind.svc/Products(3)</id>\
    <title type="text"></title>\
    <updated>2016-05-20T13:51:58Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(3)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(3)/Category" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(3)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(3)/Supplier">\
      <m:inline>\
        <entry>\
          <id>http://services.odata.org/V2/northwind/Northwind.svc/Suppliers(1)</id>\
          <title type="text"></title>\
          <updated>2016-05-20T13:51:58Z</updated>\
          <author>\
            <name />\
          </author>\
          <link rel="edit" title="Supplier" href="Suppliers(1)" />\
          <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Suppliers(1)/Products" />\
          <category term="NorthwindModel.Supplier" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
          <content type="application/xml">\
            <m:properties>\
              <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
              <d:CompanyName m:type="Edm.String">Exotic Liquids</d:CompanyName>\
              <d:ContactName m:type="Edm.String">Charlotte Cooper</d:ContactName>\
              <d:ContactTitle m:type="Edm.String">Purchasing Manager</d:ContactTitle>\
              <d:Address m:type="Edm.String">49 Gilbert St.</d:Address>\
              <d:City m:type="Edm.String">London</d:City>\
              <d:Region m:type="Edm.String" m:null="true" />\
              <d:PostalCode m:type="Edm.String">EC1 4SD</d:PostalCode>\
              <d:Country m:type="Edm.String">UK</d:Country>\
              <d:Phone m:type="Edm.String">(171) 555-2222</d:Phone>\
              <d:Fax m:type="Edm.String" m:null="true" />\
              <d:HomePage m:type="Edm.String" m:null="true" />\
            </m:properties>\
          </content>\
        </entry>\
      </m:inline>\
    </link>\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
        <d:ProductID m:type="Edm.Int32">1</d:ProductID>\
        <d:ProductName m:type="Edm.String">Chai</d:ProductName>\
        <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
        <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
        <d:QuantityPerUnit m:type="Edm.String">10 boxes x 20 bags</d:QuantityPerUnit>\
        <d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice>\
        <d:UnitsInStock m:type="Edm.Int16">39</d:UnitsInStock>\
        <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
        <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
        <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
      </m:properties>\
    </content>\
  </entry>\
    ';

  var sProducts3ExpSupplierProductsXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://services.odata.org/V2/northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://services.odata.org/V2/northwind/Northwind.svc/Products(3)</id>\
    <title type="text"></title>\
    <updated>2016-05-20T13:51:28Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(3)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(3)/Category" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(3)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(3)/Supplier">\
      <m:inline>\
        <entry>\
          <id>http://services.odata.org/V2/northwind/Northwind.svc/Suppliers(1)</id>\
          <title type="text"></title>\
          <updated>2016-05-20T13:51:28Z</updated>\
          <author>\
            <name />\
          </author>\
          <link rel="edit" title="Supplier" href="Suppliers(1)" />\
          <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Suppliers(1)/Products">\
            <m:inline>\
              <feed>\
                <title type="text">Products</title>\
                <id>http://services.odata.org/V2/northwind/Northwind.svc/Suppliers(1)/Products</id>\
                <updated>2016-05-20T13:51:28Z</updated>\
                <link rel="self" title="Products" href="Suppliers(1)/Products" />\
                <entry>\
                  <id>http://services.odata.org/V2/northwind/Northwind.svc/Products(3)</id>\
                  <title type="text"></title>\
                  <updated>2016-05-20T13:51:28Z</updated>\
                  <author>\
                    <name />\
                  </author>\
                  <link rel="edit" title="Product" href="Products(1)" />\
                  <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(3)/Category" />\
                  <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(3)/Order_Details" />\
                  <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(3)/Supplier" />\
                  <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
                  <content type="application/xml">\
                    <m:properties>\
                      <d:ProductID m:type="Edm.Int32">1</d:ProductID>\
                      <d:ProductName m:type="Edm.String">Chai</d:ProductName>\
                      <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
                      <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                      <d:QuantityPerUnit m:type="Edm.String">10 boxes x 20 bags</d:QuantityPerUnit>\
                      <d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice>\
                      <d:UnitsInStock m:type="Edm.Int16">39</d:UnitsInStock>\
                      <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                      <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
                      <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                    </m:properties>\
                  </content>\
                </entry>\
                <entry>\
                  <id>http://services.odata.org/V2/northwind/Northwind.svc/Products(2)</id>\
                  <title type="text"></title>\
                  <updated>2016-05-20T13:51:28Z</updated>\
                  <author>\
                    <name />\
                  </author>\
                  <link rel="edit" title="Product" href="Products(2)" />\
                  <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(2)/Category" />\
                  <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(2)/Order_Details" />\
                  <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(2)/Supplier" />\
                  <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
                  <content type="application/xml">\
                    <m:properties>\
                      <d:ProductID m:type="Edm.Int32">2</d:ProductID>\
                      <d:ProductName m:type="Edm.String">Chang</d:ProductName>\
                      <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
                      <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                      <d:QuantityPerUnit m:type="Edm.String">24 - 12 oz bottles</d:QuantityPerUnit>\
                      <d:UnitPrice m:type="Edm.Decimal">19.0000</d:UnitPrice>\
                      <d:UnitsInStock m:type="Edm.Int16">17</d:UnitsInStock>\
                      <d:UnitsOnOrder m:type="Edm.Int16">40</d:UnitsOnOrder>\
                      <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                      <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                    </m:properties>\
                  </content>\
                </entry>\
                <entry>\
                  <id>http://services.odata.org/V2/northwind/Northwind.svc/Products(1)</id>\
                  <title type="text"></title>\
                  <updated>2016-05-20T13:51:28Z</updated>\
                  <author>\
                    <name />\
                  </author>\
                  <link rel="edit" title="Product" href="Products(1)" />\
                  <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(1)/Category" />\
                  <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(1)/Order_Details" />\
                  <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(1)/Supplier" />\
                  <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
                  <content type="application/xml">\
                    <m:properties>\
                      <d:ProductID m:type="Edm.Int32">3</d:ProductID>\
                      <d:ProductName m:type="Edm.String">Aniseed Syrup</d:ProductName>\
                      <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
                      <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                      <d:QuantityPerUnit m:type="Edm.String">12 - 550 ml bottles</d:QuantityPerUnit>\
                      <d:UnitPrice m:type="Edm.Decimal">10.0000</d:UnitPrice>\
                      <d:UnitsInStock m:type="Edm.Int16">13</d:UnitsInStock>\
                      <d:UnitsOnOrder m:type="Edm.Int16">70</d:UnitsOnOrder>\
                      <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                      <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                    </m:properties>\
                  </content>\
                </entry>\
              </feed>\
            </m:inline>\
          </link>\
          <category term="NorthwindModel.Supplier" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
          <content type="application/xml">\
            <m:properties>\
              <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
              <d:CompanyName m:type="Edm.String">Exotic Liquids</d:CompanyName>\
              <d:ContactName m:type="Edm.String">Charlotte Cooper</d:ContactName>\
              <d:ContactTitle m:type="Edm.String">Purchasing Manager</d:ContactTitle>\
              <d:Address m:type="Edm.String">49 Gilbert St.</d:Address>\
              <d:City m:type="Edm.String">London</d:City>\
              <d:Region m:type="Edm.String" m:null="true" />\
              <d:PostalCode m:type="Edm.String">EC1 4SD</d:PostalCode>\
              <d:Country m:type="Edm.String">UK</d:Country>\
              <d:Phone m:type="Edm.String">(171) 555-2222</d:Phone>\
              <d:Fax m:type="Edm.String" m:null="true" />\
              <d:HomePage m:type="Edm.String" m:null="true" />\
            </m:properties>\
          </content>\
        </entry>\
      </m:inline>\
    </link>\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
        <d:ProductID m:type="Edm.Int32">1</d:ProductID>\
        <d:ProductName m:type="Edm.String">Chai</d:ProductName>\
        <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
        <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
        <d:QuantityPerUnit m:type="Edm.String">10 boxes x 20 bags</d:QuantityPerUnit>\
        <d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice>\
        <d:UnitsInStock m:type="Edm.Int16">39</d:UnitsInStock>\
        <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
        <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
        <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
      </m:properties>\
    </content>\
  </entry>\
    ';

  var sProducts7EmptyResult = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="https://services.odata.org/V2/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Products</title>\
    <id>https://services.odata.org/V2/Northwind/Northwind.svc/Products(7)/Supplier/Products</id>\
    <updated>1985-10-09T08:18:15Z</updated>\
    <link rel="self" title="Products" href="Products" />\
  </feed>\
  ';

  var sProducts7ExpSupplierProductsXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://services.odata.org/V2/northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://services.odata.org/V2/northwind/Northwind.svc/Products(7)</id>\
    <title type="text"></title>\
    <updated>2016-05-20T13:51:28Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(7)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(7)/Category" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(7)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(7)/Supplier">\
      <m:inline>\
      </m:inline>\
    </link>\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
        <d:ProductID m:type="Edm.Int32">1</d:ProductID>\
        <d:ProductName m:type="Edm.String">Chai Foo 7 null</d:ProductName>\
        <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
        <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
        <d:QuantityPerUnit m:type="Edm.String">10 boxes x 20 bags</d:QuantityPerUnit>\
        <d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice>\
        <d:UnitsInStock m:type="Edm.Int16">39</d:UnitsInStock>\
        <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
        <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
        <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
      </m:properties>\
    </content>\
  </entry>\
    ';


  var sCategoriesOrderDescXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T11:42:05Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>8</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:05Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(8)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
          <d:CategoryName>Seafood</d:CategoryName>\
          <d:Description>Seaweed and fish</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:05Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(7)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">7</d:CategoryID>\
          <d:CategoryName>Produce</d:CategoryName>\
          <d:Description>Dried fruit and bean curd</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(6)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:05Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(6)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
          <d:CategoryName>Meat/Poultry</d:CategoryName>\
          <d:Description>Prepared meats</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:05Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(5)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
          <d:CategoryName>Grains/Cereals</d:CategoryName>\
          <d:Description>Breads, crackers, pasta, and cereal</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:05Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(4)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
          <d:CategoryName>Dairy Products</d:CategoryName>\
          <d:Description>Cheeses</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:05Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(3)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
          <d:CategoryName>Confections</d:CategoryName>\
          <d:Description>Desserts, candies, and sweet breads</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:05Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(2)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:05Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(1)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
          <d:CategoryName>Beverages</d:CategoryName>\
          <d:Description>Soft drinks, coffees, teas, beers, and ales</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sCategoriesOrderAscXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T11:42:56Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>8</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:56Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(1)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
          <d:CategoryName>Beverages</d:CategoryName>\
          <d:Description>Soft drinks, coffees, teas, beers, and ales</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:56Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(2)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:56Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(3)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
          <d:CategoryName>Confections</d:CategoryName>\
          <d:Description>Desserts, candies, and sweet breads</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:56Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(4)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
          <d:CategoryName>Dairy Products</d:CategoryName>\
          <d:Description>Cheeses</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:56Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(5)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
          <d:CategoryName>Grains/Cereals</d:CategoryName>\
          <d:Description>Breads, crackers, pasta, and cereal</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(6)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:56Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(6)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
          <d:CategoryName>Meat/Poultry</d:CategoryName>\
          <d:Description>Prepared meats</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:56Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(7)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">7</d:CategoryID>\
          <d:CategoryName>Produce</d:CategoryName>\
          <d:Description>Dried fruit and bean curd</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T11:42:56Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(8)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
          <d:CategoryName>Seafood</d:CategoryName>\
          <d:Description>Seaweed and fish</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';


  var sCategoriesExpandProductsXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T12:06:01Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>8</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:06:01Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(1)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(1)/Products">\
        <m:inline>\
          <feed>\
            <title type="text">Products</title>\
            <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)/Products</id>\
            <updated>2013-02-01T12:06:01Z</updated>\
            <link rel="self" title="Products" href="Categories(1)/Products" />\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(1)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(1)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(1)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(1)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">1</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Chai</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">10 boxes x 20 bags</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">39</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(2)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(2)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(2)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(2)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">2</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Chang</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 12 oz bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">19.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">17</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">40</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(24)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(24)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(24)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(24)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(24)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">24</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Guaraná Fantástica</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">10</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 355 ml cans</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">4.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">20</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">true</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(34)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(34)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(34)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(34)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(34)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">34</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Sasquatch Ale</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">16</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 12 oz bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">14.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">111</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">15</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(35)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(35)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(35)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(35)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(35)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">35</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Steeleye Stout</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">16</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 12 oz bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">20</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">15</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(38)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(38)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(38)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(38)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(38)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">38</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Côte de Blaye</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">18</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 75 cl bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">263.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">17</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">15</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(39)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(39)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(39)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(39)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(39)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">39</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Chartreuse verte</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">18</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">750 cc per bottle</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">69</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">5</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(43)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(43)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(43)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(43)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(43)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">43</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Ipoh Coffee</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">20</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">16 - 500 g tins</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">46.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">17</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">10</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(67)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(67)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(67)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(67)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(67)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">67</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Laughing Lumberjack Lager</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">16</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 12 oz bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">14.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">52</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(70)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(70)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(70)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(70)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(70)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">70</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Outback Lager</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">7</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 355 ml bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">15.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">15</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">10</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">30</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(75)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(75)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(75)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(75)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(75)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">75</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Rhönbräu Klosterbier</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">12</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 0.5 l bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">7.7500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">125</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(76)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(76)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(76)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(76)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(76)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">76</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Lakkalikööri</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">23</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">500 ml</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">57</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">20</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
          </feed>\
        </m:inline>\
      </link>\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
          <d:CategoryName>Beverages</d:CategoryName>\
          <d:Description>Soft drinks, coffees, teas, beers, and ales</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:06:01Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(2)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(2)/Products">\
        <m:inline>\
          <feed>\
            <title type="text">Products</title>\
            <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)/Products</id>\
            <updated>2013-02-01T12:06:01Z</updated>\
            <link rel="self" title="Products" href="Categories(2)/Products" />\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(3)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(3)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(3)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(3)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(3)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">3</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Aniseed Syrup</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 550 ml bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">10.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">13</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">70</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(4)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(4)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(4)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(4)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(4)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">4</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Chef Anton\'s Cajun Seasoning</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">2</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">48 - 6 oz jars</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">22.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">53</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(5)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(5)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(5)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(5)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(5)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">5</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Chef Anton\'s Gumbo Mix</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">2</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">36 boxes</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">21.3500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">0</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">true</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(6)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(6)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(6)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(6)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(6)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">6</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Grandma\'s Boysenberry Spread</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">3</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 8 oz jars</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">25.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">120</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(8)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(8)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(8)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(8)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(8)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">8</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Northwoods Cranberry Sauce</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">3</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 12 oz jars</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">40.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">6</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(15)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(15)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(15)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(15)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(15)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">15</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Genen Shouyu</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">6</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 250 ml bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">15.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">39</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">5</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(44)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(44)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(44)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(44)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(44)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">44</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Gula Malacca</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">20</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">20 - 2 kg bags</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">19.4500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">27</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">15</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(61)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(61)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(61)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(61)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(61)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">61</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Sirop d\'érable</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">29</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 500 ml bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">28.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">113</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(63)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(63)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(63)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(63)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(63)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">63</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Vegie-spread</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">7</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">15 - 625 g jars</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">43.9000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">24</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">5</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(65)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(65)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(65)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(65)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(65)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">65</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Louisiana Fiery Hot Pepper Sauce</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">2</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">32 - 8 oz bottles</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">21.0500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">76</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(66)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(66)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(66)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(66)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(66)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">66</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Louisiana Hot Spiced Okra</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">2</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 8 oz jars</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">17.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">4</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">100</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">20</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(77)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(77)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(77)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(77)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(77)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">77</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Original Frankfurter grüne Soße</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">12</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 boxes</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">13.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">32</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">15</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
          </feed>\
        </m:inline>\
      </link>\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:06:01Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(3)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(3)/Products">\
        <m:inline>\
          <feed>\
            <title type="text">Products</title>\
            <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)/Products</id>\
            <updated>2013-02-01T12:06:01Z</updated>\
            <link rel="self" title="Products" href="Categories(3)/Products" />\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(16)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(16)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(16)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(16)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(16)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">16</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Pavlova</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">7</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">32 - 500 g boxes</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">17.4500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">29</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(19)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(19)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(19)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(19)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(19)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">19</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Teatime Chocolate Biscuits</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">8</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">10 boxes x 12 pieces</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">9.2000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">25</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">5</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(20)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(20)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(20)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(20)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(20)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">20</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Sir Rodney\'s Marmalade</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">8</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">30 gift boxes</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">81.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">40</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(21)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(21)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(21)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(21)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(21)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">21</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Sir Rodney\'s Scones</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">8</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 pkgs. x 4 pieces</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">10.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">3</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">40</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">5</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(25)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(25)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(25)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(25)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(25)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">25</d:ProductID>\
                  <d:ProductName m:type="Edm.String">NuNuCa Nuß-Nougat-Creme</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">11</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">20 - 450 g glasses</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">14.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">76</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">30</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(26)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(26)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(26)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(26)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(26)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">26</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Gumbär Gummibärchen</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">11</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">100 - 250 g bags</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">31.2300</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">15</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(27)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(27)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(27)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(27)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(27)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">27</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Schoggi Schokolade</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">11</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">100 - 100 g pieces</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">43.9000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">49</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">30</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(47)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(47)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(47)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(47)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(47)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">47</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Zaanse koeken</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">22</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">10 - 4 oz boxes</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">9.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">36</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(48)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(48)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(48)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(48)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(48)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">48</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Chocolade</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">22</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">10 pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">12.7500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">15</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">70</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(49)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(49)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(49)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(49)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(49)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">49</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Maxilaku</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">23</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 50 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">20.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">10</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">60</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">15</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(50)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(50)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(50)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(50)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(50)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">50</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Valkoinen suklaa</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">23</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 100 g bars</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">16.2500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">65</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">30</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(62)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(62)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(62)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(62)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(62)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">62</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Tarte au sucre</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">29</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">48 pies</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">49.3000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">17</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(68)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(68)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(68)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(68)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(68)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">68</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Scottish Longbreads</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">8</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">10 boxes x 8 pieces</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">12.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">6</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">10</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">15</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
          </feed>\
        </m:inline>\
      </link>\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
          <d:CategoryName>Confections</d:CategoryName>\
          <d:Description>Desserts, candies, and sweet breads</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:06:01Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(4)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(4)/Products">\
        <m:inline>\
          <feed>\
            <title type="text">Products</title>\
            <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)/Products</id>\
            <updated>2013-02-01T12:06:01Z</updated>\
            <link rel="self" title="Products" href="Categories(4)/Products" />\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(11)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(11)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(11)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(11)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(11)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">11</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Queso Cabrales</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">5</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">1 kg pkg.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">21.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">22</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">30</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">30</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(12)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(12)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(12)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(12)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(12)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">12</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Queso Manchego La Pastora</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">5</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">10 - 500 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">38.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">86</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(31)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(31)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(31)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(31)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(31)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">31</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Gorgonzola Telino</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">14</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 100 g pkgs</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">12.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">0</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">70</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">20</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(32)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(32)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(32)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(32)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(32)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">32</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Mascarpone Fabioli</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">14</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 200 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">32.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">9</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">40</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(33)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(33)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(33)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(33)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(33)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">33</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Geitost</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">15</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">500 g</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">2.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">112</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">20</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(59)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(59)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(59)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(59)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(59)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">59</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Raclette Courdavault</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">28</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">5 kg pkg.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">55.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">79</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(60)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(60)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(60)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(60)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(60)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">60</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Camembert Pierrot</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">28</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">15 - 300 g rounds</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">34.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">19</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(69)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(69)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(69)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(69)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(69)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">69</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Gudbrandsdalsost</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">15</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">10 kg pkg.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">36.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">26</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">15</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(71)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(71)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(71)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(71)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(71)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">71</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Flotemysost</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">15</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">10 - 500 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">21.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">26</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(72)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(72)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(72)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(72)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(72)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">72</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Mozzarella di Giovanni</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">14</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 200 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">34.8000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">14</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
          </feed>\
        </m:inline>\
      </link>\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
          <d:CategoryName>Dairy Products</d:CategoryName>\
          <d:Description>Cheeses</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:06:01Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(5)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(5)/Products">\
        <m:inline>\
          <feed>\
            <title type="text">Products</title>\
            <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)/Products</id>\
            <updated>2013-02-01T12:06:01Z</updated>\
            <link rel="self" title="Products" href="Categories(5)/Products" />\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(22)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(22)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(22)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(22)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(22)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">22</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Gustaf\'s Knäckebröd</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">9</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 500 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">21.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">104</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(23)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(23)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(23)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(23)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(23)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">23</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Tunnbröd</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">9</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 250 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">9.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">61</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(42)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(42)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(42)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(42)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(42)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">42</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Singaporean Hokkien Fried Mee</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">20</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">32 - 1 kg pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">14.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">26</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">true</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(52)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(52)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(52)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(52)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(52)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">52</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Filo Mix</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">24</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">16 - 2 kg boxes</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">7.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">38</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(56)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(56)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(56)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(56)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(56)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">56</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Gnocchi di nonna Alice</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">26</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 250 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">38.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">21</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">10</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">30</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(57)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(57)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(57)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(57)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(57)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">57</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Ravioli Angelo</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">26</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 250 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">19.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">36</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">20</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(64)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(64)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(64)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(64)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(64)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">64</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Wimmers gute Semmelknödel</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">12</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">20 bags x 4 pieces</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">33.2500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">22</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">80</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">30</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
          </feed>\
        </m:inline>\
      </link>\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
          <d:CategoryName>Grains/Cereals</d:CategoryName>\
          <d:Description>Breads, crackers, pasta, and cereal</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(6)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:06:01Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(6)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(6)/Products">\
        <m:inline>\
          <feed>\
            <title type="text">Products</title>\
            <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(6)/Products</id>\
            <updated>2013-02-01T12:06:01Z</updated>\
            <link rel="self" title="Products" href="Categories(6)/Products" />\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(9)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(9)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(9)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(9)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(9)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">9</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Mishi Kobe Niku</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">4</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">18 - 500 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">97.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">29</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">true</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(17)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(17)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(17)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(17)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(17)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">17</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Alice Mutton</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">7</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">20 - 1 kg tins</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">39.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">0</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">true</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(29)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(29)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(29)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(29)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(29)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">29</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Thüringer Rostbratwurst</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">12</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">50 bags x 30 sausgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">123.7900</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">0</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">true</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(53)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(53)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(53)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(53)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(53)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">53</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Perth Pasties</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">24</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">48 pieces</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">32.8000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">0</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">true</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(54)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(54)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(54)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(54)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(54)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">54</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Tourtière</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">25</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">16 pies</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">7.4500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">21</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(55)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(55)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(55)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(55)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(55)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">55</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Pâté chinois</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">25</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 boxes x 2 pies</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">24.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">115</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">20</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
          </feed>\
        </m:inline>\
      </link>\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
          <d:CategoryName>Meat/Poultry</d:CategoryName>\
          <d:Description>Prepared meats</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:06:01Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(7)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(7)/Products">\
        <m:inline>\
          <feed>\
            <title type="text">Products</title>\
            <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)/Products</id>\
            <updated>2013-02-01T12:06:01Z</updated>\
            <link rel="self" title="Products" href="Categories(7)/Products" />\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(7)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(7)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(7)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(7)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(7)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">7</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Uncle Bob\'s Organic Dried Pears</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">3</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">7</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 1 lb pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">30.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">15</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(14)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(14)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(14)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(14)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(14)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">14</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Tofu</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">6</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">7</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">40 - 100 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">23.2500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">35</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(28)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(28)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(28)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(28)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(28)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">28</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Rössle Sauerkraut</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">12</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">7</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">25 - 825 g cans</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">45.6000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">26</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">true</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(51)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(51)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(51)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(51)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(51)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">51</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Manjimup Dried Apples</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">24</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">7</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">50 - 300 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">53.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">20</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(74)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(74)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(74)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(74)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(74)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">74</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Longlife Tofu</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">4</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">7</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">5 kg pkg.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">10.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">4</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">20</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">5</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
          </feed>\
        </m:inline>\
      </link>\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">7</d:CategoryID>\
          <d:CategoryName>Produce</d:CategoryName>\
          <d:Description>Dried fruit and bean curd</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:06:01Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(8)" />\
      <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(8)/Products">\
        <m:inline>\
          <feed>\
            <title type="text">Products</title>\
            <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)/Products</id>\
            <updated>2013-02-01T12:06:01Z</updated>\
            <link rel="self" title="Products" href="Categories(8)/Products" />\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(10)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(10)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(10)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(10)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(10)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">10</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Ikura</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">4</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 200 ml jars</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">31.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">31</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(13)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(13)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(13)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(13)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(13)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">13</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Konbu</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">6</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">2 kg box</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">6.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">24</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">5</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(18)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(18)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(18)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(18)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(18)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">18</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Carnarvon Tigers</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">7</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">16 kg pkg.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">62.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">42</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(30)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(30)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(30)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(30)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(30)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">30</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Nord-Ost Matjeshering</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">13</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">10 - 200 g glasses</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">25.8900</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">10</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">15</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(36)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(36)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(36)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(36)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(36)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">36</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Inlagd Sill</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">17</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 250 g  jars</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">19.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">112</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">20</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(37)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(37)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(37)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(37)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(37)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">37</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Gravad lax</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">17</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 500 g pkgs.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">26.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">11</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">50</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">25</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(40)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(40)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(40)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(40)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(40)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">40</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Boston Crab Meat</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">19</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 4 oz tins</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">18.4000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">123</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">30</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(41)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(41)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(41)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(41)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(41)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">41</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Jack\'s New England Clam Chowder</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">19</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">12 - 12 oz cans</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">9.6500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">85</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(45)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(45)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(45)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(45)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(45)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">45</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Rogede sild</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">21</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">1k pkg.</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">9.5000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">5</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">70</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">15</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(46)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(46)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(46)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(46)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(46)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">46</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Spegesild</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">21</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">4 - 450 g glasses</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">12.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">95</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">0</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(58)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(58)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(58)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(58)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(58)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">58</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Escargots de Bourgogne</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">27</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 pieces</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">13.2500</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">62</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">20</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
            <entry>\
              <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(73)</id>\
              <title type="text"></title>\
              <updated>2013-02-01T12:06:01Z</updated>\
              <author>\
                <name />\
              </author>\
              <link rel="edit" title="Product" href="Products(73)" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(73)/Category" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(73)/Order_Details" />\
              <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(73)/Supplier" />\
              <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
              <content type="application/xml">\
                <m:properties>\
                  <d:ProductID m:type="Edm.Int32">73</d:ProductID>\
                  <d:ProductName m:type="Edm.String">Röd Kaviar</d:ProductName>\
                  <d:SupplierID m:type="Edm.Int32">17</d:SupplierID>\
                  <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
                  <d:QuantityPerUnit m:type="Edm.String">24 - 150 g jars</d:QuantityPerUnit>\
                  <d:UnitPrice m:type="Edm.Decimal">15.0000</d:UnitPrice>\
                  <d:UnitsInStock m:type="Edm.Int16">101</d:UnitsInStock>\
                  <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
                  <d:ReorderLevel m:type="Edm.Int16">5</d:ReorderLevel>\
                  <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
                </m:properties>\
              </content>\
            </entry>\
          </feed>\
        </m:inline>\
      </link>\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
          <d:CategoryName>Seafood</d:CategoryName>\
          <d:Description>Seaweed and fish</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sProducts1ExpandCategoryXML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)</id>\
    <title type="text"></title>\
    <updated>2013-02-01T11:36:35Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(1)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category" type="application/atom+xml;type=entry" title="Category" href="Products(1)/Category">\
      <m:inline>\
        <entry>\
          <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)</id>\
          <title type="text"></title>\
          <updated>2013-02-01T11:36:35Z</updated>\
          <author>\
            <name />\
          </author>\
          <link rel="edit" title="Category" href="Categories(1)" />\
          <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(1)/Products" />\
          <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
          <content type="application/xml">\
            <m:properties>\
              <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
              <d:CategoryName m:type="Edm.String">Beverages</d:CategoryName>\
              <d:Description m:type="Edm.String">Soft drinks, coffees, teas, beers, and ales</d:Description>\
            </m:properties>\
          </content>\
        </entry>\
      </m:inline>\
    </link>\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(1)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(1)/Supplier" />\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
        <d:ProductID m:type="Edm.Int32">1</d:ProductID>\
        <d:ProductName m:type="Edm.String">Chai</d:ProductName>\
        <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
        <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
        <d:QuantityPerUnit m:type="Edm.String">10 boxes x 20 bags</d:QuantityPerUnit>\
        <d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice>\
        <d:UnitsInStock m:type="Edm.Int16">39</d:UnitsInStock>\
        <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
        <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
        <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
      </m:properties>\
    </content>\
  </entry>\
    ';

  var sProducts1XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)</id>\
    <title type="text"></title>\
    <updated>2013-02-01T11:36:35Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Product" href="Products(1)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details" type="application/atom+xml;type=feed" title="Order_Details" href="Products(1)/Order_Details" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier" type="application/atom+xml;type=entry" title="Supplier" href="Products(1)/Supplier" />\
    <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml">\
      <m:properties>\
        <d:ProductID m:type="Edm.Int32">1</d:ProductID>\
        <d:ProductName m:type="Edm.String">Chai</d:ProductName>\
        <d:SupplierID m:type="Edm.Int32">1</d:SupplierID>\
        <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
        <d:QuantityPerUnit m:type="Edm.String">10 boxes x 20 bags</d:QuantityPerUnit>\
        <d:UnitPrice m:type="Edm.Decimal">18.0000</d:UnitPrice>\
        <d:UnitsInStock m:type="Edm.Int16">39</d:UnitsInStock>\
        <d:UnitsOnOrder m:type="Edm.Int16">0</d:UnitsOnOrder>\
        <d:ReorderLevel m:type="Edm.Int16">10</d:ReorderLevel>\
        <d:Discontinued m:type="Edm.Boolean">false</d:Discontinued>\
      </m:properties>\
    </content>\
  </entry>\
  ';

  var sCategoriesNotFilter1JSON = '' +
    '{' +
    '	"d": {' +
    '		"results": [' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http: //services.odata.org/V2/Northwind/Northwind.svc/Categories(1)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Beverages"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http: //services.odata.org/V2/Northwind/Northwind.svc/Categories(4)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Dairy Products"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http: //services.odata.org/V2/Northwind/Northwind.svc/Categories(5)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Grains/Cereals"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http: //services.odata.org/V2/Northwind/Northwind.svc/Categories(6)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Meat/Poultry"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(7)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Produce"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http: //services.odata.org/V2/Northwind/Northwind.svc/Categories(8)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Seafood"' +
    '			}' +
    '		]' +
    '	}' +
    '}';


  var sCategoriesNotFilter2JSON = '' +
    '{' +
    '	"d": {' +
    '		"results": [' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http: //services.odata.org/V2/Northwind/Northwind.svc/Categories(6)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Meat/Poultry"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(7)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Produce"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http: //services.odata.org/V2/Northwind/Northwind.svc/Categories(8)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Seafood"' +
    '			}' +
    '		]' +
    '	}' +
    '}';


  var sCategoriesNotFilter3JSON = '' +
    '{' +
    '	"d": {' +
    '		"results": [' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(1)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Beverages"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(2)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Condiments"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(3)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Confections"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(5)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Grains/Cereals"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(7)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Produce"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(8)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Seafood"' +
    '			}' +
    '		]' +
    '	}' +
    '}';

  var sCategoriesNotFilter4JSON = '' +
    '{' +
    '	"d": {' +
    '		"results": [' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(1)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Beverages"' +
    '			},' +
    '           {' +
    '				"__metadata": {' +
    '					"uri": "http: //services.odata.org/V2/Northwind/Northwind.svc/Categories(6)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Meat/Poultry"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(7)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Produce"' +
    '			},' +
    '			{' +
    '				"__metadata": {' +
    '					"uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(8)",' +
    '					"type": "NorthwindModel.Category"' +
    '				},' +
    '				"CategoryName": "Seafood"' +
    '			}' +
    '		]' +
    '	}' +
    '}';


  var sCategoriesFilter1XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T12:25:29Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>1</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:25:29Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(1)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
          <d:CategoryName>Beverages</d:CategoryName>\
          <d:Description>Soft drinks, coffees, teas, beers, and ales</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sCategoriesFilter2XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T12:26:39Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>2</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:26:39Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(2)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:26:39Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(3)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
          <d:CategoryName>Confections</d:CategoryName>\
          <d:Description>Desserts, candies, and sweet breads</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sCategoriesFilter3XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T12:27:21Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>3</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:25:29Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(1)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
          <d:CategoryName>Beverages</d:CategoryName>\
          <d:Description>Soft drinks, coffees, teas, beers, and ales</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:27:21Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(2)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:27:21Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(3)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
          <d:CategoryName>Confections</d:CategoryName>\
          <d:Description>Desserts, candies, and sweet breads</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sCategoriesFilter4XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T12:27:56Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>1</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:27:56Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(2)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sCategoriesFilter5XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T12:29:35Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>7</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:29:35Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(2)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:29:35Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(3)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
          <d:CategoryName>Confections</d:CategoryName>\
          <d:Description>Desserts, candies, and sweet breads</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:29:35Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(4)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
          <d:CategoryName>Dairy Products</d:CategoryName>\
          <d:Description>Cheeses</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:29:35Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(5)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">5</d:CategoryID>\
          <d:CategoryName>Grains/Cereals</d:CategoryName>\
          <d:Description>Breads, crackers, pasta, and cereal</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(6)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:29:35Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(6)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">6</d:CategoryID>\
          <d:CategoryName>Meat/Poultry</d:CategoryName>\
          <d:Description>Prepared meats</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:29:35Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(7)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">7</d:CategoryID>\
          <d:CategoryName>Produce</d:CategoryName>\
          <d:Description>Dried fruit and bean curd</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:29:35Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(8)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">8</d:CategoryID>\
          <d:CategoryName>Seafood</d:CategoryName>\
          <d:Description>Seaweed and fish</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sCategoriesFilter6XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T12:31:20Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>2</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:31:20Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(1)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
          <d:CategoryName>Beverages</d:CategoryName>\
          <d:Description>Soft drinks, coffees, teas, beers, and ales</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:31:20Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(2)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sCategoriesFilter7XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T12:31:50Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>1</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:31:50Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(2)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">2</d:CategoryID>\
          <d:CategoryName>Condiments</d:CategoryName>\
          <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sCategoriesFilter8XML = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <feed xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <title type="text">Categories</title>\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories</id>\
    <updated>2013-02-01T12:31:50Z</updated>\
    <link rel="self" title="Categories" href="Categories" />\
    <m:count>1</m:count>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:31:50Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(1)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">1</d:CategoryID>\
          <d:CategoryName>Beverages</d:CategoryName>\
          <d:Description>Soft drinks, coffees, teas, beers, and ales</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:31:50Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(3)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">3</d:CategoryID>\
          <d:CategoryName>Confections</d:CategoryName>\
          <d:Description>Desserts, candies, and sweet breads</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
    <entry>\
      <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
      <title type="text"></title>\
      <updated>2013-02-01T12:31:50Z</updated>\
      <author>\
        <name />\
      </author>\
      <link rel="edit" title="Category" href="Categories(4)" />\
      <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
      <content type="application/xml">\
        <m:properties>\
          <d:CategoryID m:type="Edm.Int32">4</d:CategoryID>\
          <d:CategoryName>Dairy Products</d:CategoryName>\
          <d:Description>Cheeses</d:Description>\
        </m:properties>\
      </content>\
    </entry>\
  </feed>\
    ';

  var sProductsXML = "<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?>\n" +
      "<feed xml:base=\"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xmlns=\"http://www.w3.org/2005/Atom\">\n" +
      "  <title type=\"text\">Products</title>\n" +
      "  <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)/Products</id>\n" +
      "  <updated>2013-04-29T12:02:17Z</updated>\n" +
      "  <link rel=\"self\" title=\"Products\" href=\"Products\" />\n" +
      "  <m:count>5</m:count>\n" +
      "  <entry>\n" +
      "    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(7)</id>\n" +
      "    <title type=\"text\"></title>\n" +
      "    <updated>2013-04-29T12:02:17Z</updated>\n" +
      "    <author>\n" +
      "      <name />\n" +
      "    </author>\n" +
      "    <link rel=\"edit\" title=\"Product\" href=\"Products(7)\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(7)/Category\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(7)/Order_Details\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(7)/Supplier\" />\n" +
      "    <category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" />\n" +
      "    <content type=\"application/xml\">\n" +
      "      <m:properties>\n" +
      "        <d:ProductID m:type=\"Edm.Int32\">7</d:ProductID>\n" +
      "        <d:ProductName>Uncle Bob\'s Organic Dried Pears</d:ProductName>\n" +
      "        <d:SupplierID m:type=\"Edm.Int32\">3</d:SupplierID>\n" +
      "        <d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "        <d:QuantityPerUnit>12 - 1 lb pkgs.</d:QuantityPerUnit>\n" +
      "        <d:UnitPrice m:type=\"Edm.Decimal\">30.0000</d:UnitPrice>\n" +
      "        <d:UnitsInStock m:type=\"Edm.Int16\">15</d:UnitsInStock>\n" +
      "        <d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "        <d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel>\n" +
      "        <d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "      </m:properties>\n" +
      "    </content>\n" +
      "  </entry>\n" +
      "  <entry>\n" +
      "    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(14)</id>\n" +
      "    <title type=\"text\"></title>\n" +
      "    <updated>2013-04-29T12:02:17Z</updated>\n" +
      "    <author>\n" +
      "      <name />\n" +
      "    </author>\n" +
      "    <link rel=\"edit\" title=\"Product\" href=\"Products(14)\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(14)/Category\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(14)/Order_Details\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(14)/Supplier\" />\n" +
      "    <category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" />\n" +
      "    <content type=\"application/xml\">\n" +
      "      <m:properties>\n" +
      "        <d:ProductID m:type=\"Edm.Int32\">14</d:ProductID>\n" +
      "        <d:ProductName>Tofu</d:ProductName>\n" +
      "        <d:SupplierID m:type=\"Edm.Int32\">6</d:SupplierID>\n" +
      "        <d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "        <d:QuantityPerUnit>40 - 100 g pkgs.</d:QuantityPerUnit>\n" +
      "        <d:UnitPrice m:type=\"Edm.Decimal\">23.2500</d:UnitPrice>\n" +
      "        <d:UnitsInStock m:type=\"Edm.Int16\">35</d:UnitsInStock>\n" +
      "        <d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "        <d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "        <d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "      </m:properties>\n" +
      "    </content>\n" +
      "  </entry>\n" +
      "  <entry>\n" +
      "    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(28)</id>\n" +
      "    <title type=\"text\"></title>\n" +
      "    <updated>2013-04-29T12:02:17Z</updated>\n" +
      "    <author>\n" +
      "      <name />\n" +
      "    </author>\n" +
      "    <link rel=\"edit\" title=\"Product\" href=\"Products(28)\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(28)/Category\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(28)/Order_Details\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(28)/Supplier\" />\n" +
      "    <category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" />\n" +
      "    <content type=\"application/xml\">\n" +
      "      <m:properties>\n" +
      "        <d:ProductID m:type=\"Edm.Int32\">28</d:ProductID>\n" +
      "        <d:ProductName>Rössle Sauerkraut</d:ProductName>\n" +
      "        <d:SupplierID m:type=\"Edm.Int32\">12</d:SupplierID>\n" +
      "        <d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "        <d:QuantityPerUnit>25 - 825 g cans</d:QuantityPerUnit>\n" +
      "        <d:UnitPrice m:type=\"Edm.Decimal\">45.6000</d:UnitPrice>\n" +
      "        <d:UnitsInStock m:type=\"Edm.Int16\">26</d:UnitsInStock>\n" +
      "        <d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "        <d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "        <d:Discontinued m:type=\"Edm.Boolean\">true</d:Discontinued>\n" +
      "      </m:properties>\n" +
      "    </content>\n" +
      "  </entry>\n" +
      "  <entry>\n" +
      "    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(51)</id>\n" +
      "    <title type=\"text\"></title>\n" +
      "    <updated>2013-04-29T12:02:17Z</updated>\n" +
      "    <author>\n" +
      "      <name />\n" +
      "    </author>\n" +
      "    <link rel=\"edit\" title=\"Product\" href=\"Products(51)\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(51)/Category\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(51)/Order_Details\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(51)/Supplier\" />\n" +
      "    <category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" />\n" +
      "    <content type=\"application/xml\">\n" +
      "      <m:properties>\n" +
      "        <d:ProductID m:type=\"Edm.Int32\">51</d:ProductID>\n" +
      "        <d:ProductName>Manjimup Dried Apples</d:ProductName>\n" +
      "        <d:SupplierID m:type=\"Edm.Int32\">24</d:SupplierID>\n" +
      "        <d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "        <d:QuantityPerUnit>50 - 300 g pkgs.</d:QuantityPerUnit>\n" +
      "        <d:UnitPrice m:type=\"Edm.Decimal\">53.0000</d:UnitPrice>\n" +
      "        <d:UnitsInStock m:type=\"Edm.Int16\">20</d:UnitsInStock>\n" +
      "        <d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "        <d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel>\n" +
      "        <d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "      </m:properties>\n" +
      "    </content>\n" +
      "  </entry>\n" +
      "  <entry>\n" +
      "    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(74)</id>\n" +
      "    <title type=\"text\"></title>\n" +
      "    <updated>2013-04-29T12:02:17Z</updated>\n" +
      "    <author>\n" +
      "      <name />\n" +
      "    </author>\n" +
      "    <link rel=\"edit\" title=\"Product\" href=\"Products(74)\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(74)/Category\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(74)/Order_Details\" />\n" +
      "    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(74)/Supplier\" />\n" +
      "    <category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" />\n" +
      "    <content type=\"application/xml\">\n" +
      "      <m:properties>\n" +
      "        <d:ProductID m:type=\"Edm.Int32\">74</d:ProductID>\n" +
      "        <d:ProductName>Longlife Tofu</d:ProductName>\n" +
      "        <d:SupplierID m:type=\"Edm.Int32\">4</d:SupplierID>\n" +
      "        <d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "        <d:QuantityPerUnit>5 kg pkg.</d:QuantityPerUnit>\n" +
      "        <d:UnitPrice m:type=\"Edm.Decimal\">10.0000</d:UnitPrice>\n" +
      "        <d:UnitsInStock m:type=\"Edm.Int16\">4</d:UnitsInStock>\n" +
      "        <d:UnitsOnOrder m:type=\"Edm.Int16\">20</d:UnitsOnOrder>\n" +
      "        <d:ReorderLevel m:type=\"Edm.Int16\">5</d:ReorderLevel>\n" +
      "        <d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "      </m:properties>\n" +
      "    </content>\n" +
      "  </entry>\n" +
      "</feed>";
  var sCategories2XML = "\<?xml version=\"1.0\" encoding=\"iso-8859-1\" standalone=\"yes\"?>\
  <entry xml:base=\"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xmlns=\"http://www.w3.org/2005/Atom\">\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)</id>\
    <title type=\"text\"></title>\
    <updated>2013-05-15T12:23:22Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel=\"edit\" title=\"Category\" href=\"Categories(2)\" />\
    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Categories(2)/Products\" />\
    <category term=\"NorthwindModel.Category\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" />\
    <content type=\"application/xml\">\
      <m:properties>\
        <d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID>\
        <d:CategoryName>Condiments</d:CategoryName>\
        <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        <d:Picture></d:Picture>\
      </m:properties>\
    </content>\
  </entry>\
    ";

  var sCategories7XML = "\<?xml version=\"1.0\" encoding=\"iso-8859-1\" standalone=\"yes\"?>\
  <entry xml:base=\"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xmlns=\"http://www.w3.org/2005/Atom\">\
    <id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)</id>\
    <title type=\"text\"></title>\
    <updated>2013-05-15T12:23:22Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel=\"edit\" title=\"Category\" href=\"Categories(7)\" />\
    <link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Categories(7)/Products\" />\
    <category term=\"NorthwindModel.Category\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" />\
    <content type=\"application/xml\">\
      <m:properties>\
        <d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\
        <d:CategoryName>Condiments</d:CategoryName>\
        <d:Description>Sweet and savory sauces, relishes, spreads, and seasonings</d:Description>\
        <d:Picture></d:Picture>\
      </m:properties>\
    </content>\
  </entry>\
    ";

  var sCategory1JSON = "{\n" +
      "	\"d\" : {\n" +
      "		\"__metadata\" : {\n" +
      "			\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "			\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "			\"type\" : \"NorthwindModel.Category\"\n" +
      "		},\n" +
      "		\"Products\" : {\n" +
      "			\"__deferred\" : {\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)/Products\"\n" +
      "			}\n" +
      "		},\n" +
      "		\"CategoryID\" : 1,\n" +
      "		\"CategoryName\" : \"Beverages\",\n" +
      "		\"Description\" : \"Soft drinks, coffees, teas, beers, and ales\",\n" +
      "		\"Picture\" : \"\"\n" +
      "	}\n" +
      "}";
  var sCategory3JSON = "{\n" +
      "	\"d\" : {\n" +
      "		\"__metadata\" : {\n" +
      "			\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)\",\n" +
      "			\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)\",\n" +
      "			\"type\" : \"NorthwindModel.Category\"\n" +
      "		},\n" +
      "		\"Products\" : {\n" +
      "			\"__deferred\" : {\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)/Products\"\n" +
      "			}\n" +
      "		},\n" +
      "		\"CategoryID\" : 3,\n" +
      "		\"CategoryName\" : \"Confections\",\n" +
      "		\"Description\" : \"Desserts, candies, and sweet breads\",\n" +
      "		\"Picture\" : \"\"\n" +
      "	}\n" +
      "}";
  var sCategory4JSON = "{\n" +
      "	\"d\" : {\n" +
      "		\"__metadata\" : {\n" +
      "			\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)\",\n" +
      "			\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)\",\n" +
      "			\"type\" : \"NorthwindModel.Category\"\n" +
      "		},\n" +
      "		\"Products\" : {\n" +
      "			\"__deferred\" : {\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)/Products\"\n" +
      "			}\n" +
      "		},\n" +
      "		\"CategoryID\" : 4,\n" +
      "		\"CategoryName\" : \"Dairy Products\",\n" +
      "		\"Description\" : \"Cheeses\",\n" +
      "		\"Picture\" : \"\"\n" +
      "	}\n" +
      "}";
  var sCategoryBrokenJSON = "{\n" +
      "	\"d\" : { \"results\" : {\n" +
      "		\"__metadata\" : {\n" +
      "			\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)\",\n" +
      "			\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)\",\n" +
      "			\"type\" : \"NorthwindModel.Category\"\n" +
      "		},\n" +
      "		\"Products\" : {\n" +
      "			\"__deferred\" : {\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)/Products\"\n" +
      "			}\n" +
      "		},\n" +
      "		\"CategoryID\" : 5,\n" +
      "		\"CategoryName\" : \"Grains/Cereals\",\n" +
      "		\"Description\" : \"Breads, crackers, pasta, and cereal\",\n" +
      "		\"Picture\" : \"\"\n" +
      "	} }\n" +
      "}";
  var sCategorySelectJSON = "\n" +
      "\n" +
      "{\n" +
      "	\"d\" : {\n" +
      "		\"results\" : [\n" +
      "				{\n" +
      "					\"__metadata\" : {\n" +
      "						\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "						\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "						\"type\" : \"NorthwindModel.Category\"\n" +
      "					},\n" +
      "					\"CategoryName\" : \"Beverages\"\n" +
      "				},\n" +
      "				{\n" +
      "					\"__metadata\" : {\n" +
      "						\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)\",\n" +
      "						\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(2)\",\n" +
      "						\"type\" : \"NorthwindModel.Category\"\n" +
      "					},\n" +
      "					\"CategoryName\" : \"Condiments\"\n" +
      "				},\n" +
      "				{\n" +
      "					\"__metadata\" : {\n" +
      "						\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)\",\n" +
      "						\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(3)\",\n" +
      "						\"type\" : \"NorthwindModel.Category\"\n" +
      "					},\n" +
      "					\"CategoryName\" : \"Confections\"\n" +
      "				},\n" +
      "				{\n" +
      "					\"__metadata\" : {\n" +
      "						\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)\",\n" +
      "						\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(4)\",\n" +
      "						\"type\" : \"NorthwindModel.Category\"\n" +
      "					},\n" +
      "					\"CategoryName\" : \"Dairy Products\"\n" +
      "				},\n" +
      "				{\n" +
      "					\"__metadata\" : {\n" +
      "						\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)\",\n" +
      "						\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(5)\",\n" +
      "						\"type\" : \"NorthwindModel.Category\"\n" +
      "					},\n" +
      "					\"CategoryName\" : \"Grains/Cereals\"\n" +
      "				},\n" +
      "				{\n" +
      "					\"__metadata\" : {\n" +
      "						\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(6)\",\n" +
      "						\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(6)\",\n" +
      "						\"type\" : \"NorthwindModel.Category\"\n" +
      "					},\n" +
      "					\"CategoryName\" : \"Meat/Poultry\"\n" +
      "				},\n" +
      "				{\n" +
      "					\"__metadata\" : {\n" +
      "						\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)\",\n" +
      "						\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(7)\",\n" +
      "						\"type\" : \"NorthwindModel.Category\"\n" +
      "					},\n" +
      "					\"CategoryName\" : \"Produce\"\n" +
      "				},\n" +
      "				{\n" +
      "					\"__metadata\" : {\n" +
      "						\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)\",\n" +
      "						\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)\",\n" +
      "						\"type\" : \"NorthwindModel.Category\"\n" +
      "					},\n" +
      "					\"CategoryName\" : \"Seafood\"\n" +
      "				} ],\n" +
      "		\"__count\" : \"8\"\n" +
      "	}\n" +
      "}";

  var sCategorySelect2JSON = "{\n" +
      "	\"d\" : {\n" +
      "		\"__metadata\" : {\n" +
      "			\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "			\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "			\"type\" : \"NorthwindModel.Category\"\n" +
      "		},\n" +
      "		\"CategoryID\" : 1\n" +
      "	}\n" +
      "}";
  var sCategoryWithResultProp = "{\n" +
  "	\"d\" : {\n" +
  "		\"__metadata\" : {\n" +
  "			\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(20)\",\n" +
  "			\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(20)\",\n" +
  "			\"type\" : \"NorthwindModel.Category\"\n" +
  "		},\n" +
  "		\"Products\" : {\n" +
  "			\"__deferred\" : {\n" +
  "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(20)/Products\"\n" +
  "			}\n" +
  "		},\n" +
  "		\"CategoryID\" : 20,\n" +
  "		\"results\" : \"test\",\n" +
  "		\"CategoryName\" : \"Beverages\",\n" +
  "		\"Description\" : \"Soft drinks, coffees, teas, beers, and ales\",\n" +
  "		\"Picture\" : \"\"\n" +
  "	}\n" +
  "}";
  var sProductExpandJSON = "\n" +
      "\n" +
      "{\n" +
      "	\"d\" : {\n" +
      "		\"results\" : [ {\n" +
      "			\"__metadata\" : {\n" +
      "				\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)\",\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)\",\n" +
      "				\"type\" : \"NorthwindModel.Product\"\n" +
      "			},\n" +
      "			\"Category\" : {\n" +
      "				\"__metadata\" : {\n" +
      "					\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "					\"type\" : \"NorthwindModel.Category\"\n" +
      "				},\n" +
      "				\"Products\" : {\n" +
      "					\"__deferred\" : {\n" +
      "						\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)/Products\"\n" +
      "					}\n" +
      "				},\n" +
      "				\"CategoryID\" : 1,\n" +
      "				\"CategoryName\" : \"Beverages\",\n" +
      "				\"Description\" : \"Soft drinks, coffees, teas, beers, and ales\",\n" +
      "				\"Picture\" : \"\"\n" +
      "			},\n" +
      "			\"Order_Details\" : {\n" +
      "				\"__deferred\" : {\n" +
      "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)/Order_Details\"\n" +
      "				}\n" +
      "			},\n" +
      "			\"Supplier\" : {\n" +
      "				\"__deferred\" : {\n" +
      "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)/Supplier\"\n" +
      "				}\n" +
      "			},\n" +
      "			\"ProductID\" : 1,\n" +
      "			\"ProductName\" : \"Chai\",\n" +
      "			\"SupplierID\" : 1,\n" +
      "			\"CategoryID\" : 1,\n" +
      "			\"QuantityPerUnit\" : \"10 boxes x 20 bags\",\n" +
      "			\"UnitPrice\" : \"18.0000\",\n" +
      "			\"UnitsInStock\" : 39,\n" +
      "			\"UnitsOnOrder\" : 0,\n" +
      "			\"ReorderLevel\" : 10,\n" +
      "			\"Discontinued\" : false\n" +
      "		} ],\n" +
      "		\"__count\" : \"1\"\n" +
      "	}\n" +
      "}";

  var sProductJSON = "\n" +
  "\n" +
  "{\n" +
  "	\"d\" : {\n" +
  "		\"results\" : [ {\n" +
  "			\"__metadata\" : {\n" +
  "				\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)\",\n" +
  "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)\",\n" +
  "				\"type\" : \"NorthwindModel.Product\"\n" +
  "			},\n" +
  "			\"Order_Details\" : {\n" +
  "				\"__deferred\" : {\n" +
  "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)/Order_Details\"\n" +
  "				}\n" +
  "			},\n" +
  "			\"Supplier\" : {\n" +
  "				\"__deferred\" : {\n" +
  "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)/Supplier\"\n" +
  "				}\n" +
  "			},\n" +
  "			\"ProductID\" : 1,\n" +
  "			\"ProductName\" : \"Chai\",\n" +
  "			\"SupplierID\" : 1,\n" +
  "			\"CategoryID\" : 1,\n" +
  "			\"QuantityPerUnit\" : \"10 boxes x 20 bags\",\n" +
  "			\"UnitPrice\" : \"18.0000\",\n" +
  "			\"UnitsInStock\" : 39,\n" +
  "			\"UnitsOnOrder\" : 0,\n" +
  "			\"ReorderLevel\" : 10,\n" +
  "			\"Discontinued\" : false\n" +
  "		} ],\n" +
  "		\"__count\" : \"1\"\n" +
  "	}\n" +
  "}";

  var sProduct2ExpandJSON1 = "{\n" +
      "	\"d\" : {\n" +
      "		\"__metadata\" : {\n" +
      "			\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)\",\n" +
      "			\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)\",\n" +
      "			\"type\" : \"NorthwindModel.Product\"\n" +
      "		},\n" +
      "		\"Category\" : {\n" +
      "			\"__metadata\" : {\n" +
      "				\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "				\"type\" : \"NorthwindModel.Category\"\n" +
      "			},\n" +
      "			\"Products\" : {\n" +
      "				\"__deferred\" : {\n" +
      "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)/Products\"\n" +
      "				}\n" +
      "			},\n" +
      "			\"CategoryID\" : 1,\n" +
      "			\"CategoryName\" : \"Beverages\",\n" +
      "			\"Description\" : \"Soft drinks, coffees, teas, beers, and ales\",\n" +
      "			\"Picture\" : \"\"\n" +
      "		},\n" +
      "		\"Order_Details\" : {\n" +
      "			\"__deferred\" : {\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)/Order_Details\"\n" +
      "			}\n" +
      "		},\n" +
      "		\"Supplier\" : {\n" +
      "			\"__deferred\" : {\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)/Supplier\"\n" +
      "			}\n" +
      "		},\n" +
      "		\"ProductID\" : 2,\n" +
      "		\"ProductName\" : \"Chang\",\n" +
      "		\"SupplierID\" : 1,\n" +
      "		\"CategoryID\" : 1,\n" +
      "		\"QuantityPerUnit\" : \"24 - 12 oz bottles\",\n" +
      "		\"UnitPrice\" : \"19.0000\",\n" +
      "		\"UnitsInStock\" : 17,\n" +
      "		\"UnitsOnOrder\" : 40,\n" +
      "		\"ReorderLevel\" : 25,\n" +
      "		\"Discontinued\" : false\n" +
      "	}\n" +
      "}";

	var sProduct1000CreatedJSON = "{" +
		"	\"d\": {" +
		"		\"__metadata\": {" +
		"			\"uri\": \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1000)\"," +
		"			\"type\": \"NorthwindModel.Product\"" +
		"		}," +
    "		\"ID\": 1000," +
    "		\"Name\": \"test\"," +
    "		\"Description\": null," +
    "		\"ReleaseDate\": null," +
    "		\"DiscontinuedDate\": null," +
    "		\"Rating\": null," +
    "		\"Price\": null," +
    "		\"Category\": {" +
    "			\"__deferred\": {" +
    "				\"uri\": \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1000)/Category\"" +
    "			}" +
    "		}," +
    "		\"Supplier\": {" +
    "			\"__deferred\": {" +
    "				\"uri\": \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1000)/Supplier\"" +
    "			}" +
    "		}" +
    "	}" +
    "}";

	var sProduct1000FunctionCallJSON = "{" +
		"	\"d\": {" +
		"		\"__metadata\": {" +
		"			\"uri\": \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1001)\"," +
		"			\"type\": \"NorthwindModel.Product\"" +
		"		}," +
		"		\"ID\": 1001," +
		"		\"Name\": \"test2\"," +
		"		\"Description\": null," +
		"		\"ReleaseDate\": null," +
		"		\"DiscontinuedDate\": null," +
		"		\"Rating\": null," +
		"		\"Price\": null," +
		"		\"Category\": {" +
		"			\"__deferred\": {" +
		"				\"uri\": \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1001)/Category\"" +
		"			}" +
		"		}," +
		"		\"Supplier\": {" +
		"			\"__deferred\": {" +
		"				\"uri\": \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1001)/Supplier\"" +
		"			}" +
		"		}" +
		"	}" +
		"}";

  var sProduct2JSON = "{\n" +
      "	\"d\" : {\n" +
      "		\"results\" : [ {\n" +
      "			\"__metadata\" : {\n" +
      "				\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)\",\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)\",\n" +
      "				\"type\" : \"NorthwindModel.Product\"\n" +
      "			},\n" +
      "			\"Category\" : {\n" +
      "				\"__deferred\" : {\n" +
      "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)/Category\"\n" +
      "				}\n" +
      "			},\n" +
      "			\"Order_Details\" : {\n" +
      "				\"__deferred\" : {\n" +
      "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)/Order_Details\"\n" +
      "				}\n" +
      "			},\n" +
      "			\"Supplier\" : {\n" +
      "				\"__deferred\" : {\n" +
      "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)/Supplier\"\n" +
      "				}\n" +
      "			},\n" +
      "			\"ProductID\" : 2,\n" +
      "			\"ProductName\" : \"Chang\",\n" +
      "			\"SupplierID\" : 1,\n" +
      "			\"CategoryID\" : 1,\n" +
      "			\"QuantityPerUnit\" : \"24 - 12 oz bottles\",\n" +
      "			\"UnitPrice\" : \"19.0000\",\n" +
      "			\"UnitsInStock\" : 17,\n" +
      "			\"UnitsOnOrder\" : 40,\n" +
      "			\"ReorderLevel\" : 25,\n" +
      "			\"Discontinued\" : false\n" +
      "		} ],\n" +
      "		\"__count\" : \"1\"\n" +
      "	}\n" +
      "}";

  var sProductSelectExpandJSON = "{\n" +
      "	\"d\" : {\n" +
      "		\"results\" : [ {\n" +
      "			\"__metadata\" : {\n" +
      "				\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)\",\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)\",\n" +
      "				\"type\" : \"NorthwindModel.Product\"\n" +
      "			},\n" +
      "			\"Category\" : {\n" +
      "				\"__metadata\" : {\n" +
      "					\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "					\"type\" : \"NorthwindModel.Category\"\n" +
      "				},\n" +
      "				\"Products\" : {\n" +
      "					\"__deferred\" : {\n" +
      "						\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)/Products\"\n" +
      "					}\n" +
      "				},\n" +
      "				\"CategoryID\" : 1,\n" +
      "				\"CategoryName\" : \"Beverages\",\n" +
      "				\"Description\" : \"Soft drinks, coffees, teas, beers, and ales\",\n" +
      "				\"Picture\" : \"\"\n" +
      "			},\n" +
      "			\"ProductName\" : \"Chang\"\n" +
      "		} ],\n" +
      "		\"__count\" : \"1\"\n" +
      "	}\n" +
      "}";

  var sProduct2SelectExpandJSON = "{\n" +
      "	\"d\" : {\n" +
      "		\"__metadata\" : {\n" +
      "			\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)\",\n" +
      "			\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)\",\n" +
      "			\"type\" : \"NorthwindModel.Product\"\n" +
      "		},\n" +
      "		\"Category\" : {\n" +
      "			\"__metadata\" : {\n" +
      "				\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)\",\n" +
      "				\"type\" : \"NorthwindModel.Category\"\n" +
      "			},\n" +
      "			\"Products\" : {\n" +
      "				\"__deferred\" : {\n" +
      "					\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(1)/Products\"\n" +
      "				}\n" +
      "			},\n" +
      "			\"CategoryID\" : 1,\n" +
      "			\"CategoryName\" : \"Beverages\",\n" +
      "			\"Description\" : \"Soft drinks, coffees, teas, beers, and ales\",\n" +
      "			\"Picture\" : \"\"\n" +
      "		},\n" +
      "		\"ProductID\" : 2\n" +
      "	}\n" +
      "}";

  var sProduct3SelectExpandJSON = "{\n" +
      "\"d\" : {\n" +
      "\"results\": [\n" +
      "{\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(2)\", \"type\": \"NorthwindModel.Product\"\n" +
      "}, \"ProductName\": \"Chang\", \"Category\": {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(1)\", \"type\": \"NorthwindModel.Category\"\n" +
      "}, \"CategoryName\": \"Beverages\"\n" +
      "}\n" +
      "}\n" +
      "]\n" +
      "}\n" +
      "}";

  var sProductsAllXML = '<?xml version=\"1.0\" encoding=\"utf-8\"?><feed xml:base=\"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/\" xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products</id><title type=\"text\">Products</title><updated>2014-07-31T13:52:29Z</updated><link rel=\"self\" title=\"Products\" href=\"Products\" /><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(1)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(1)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(1)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(1)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(1)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">1</d:ProductID><d:ProductName>Chai</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>10 boxes x 20 bags</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">18.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">39</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(2)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(2)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(2)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(2)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(2)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">2</d:ProductID><d:ProductName>Chang</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>24 - 12 oz bottles</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">19.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">17</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">40</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\" m:null=\"true\" /><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(3)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(3)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(3)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(3)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(3)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">3</d:ProductID><d:ProductName>Aniseed Syrup</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID><d:QuantityPerUnit>12 - 550 ml bottles</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">10.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">13</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">70</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">25</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(4)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(4)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(4)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(4)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(4)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">4</d:ProductID><d:ProductName>Chef Anton\'s Cajun Seasoning</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">2</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID><d:QuantityPerUnit>48 - 6 oz jars</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">22.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">53</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(5)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(5)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(5)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(5)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(5)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">5</d:ProductID><d:ProductName>Chef Anton\'s Gumbo Mix</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">2</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID><d:QuantityPerUnit>36 boxes</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">21.3500</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">0</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">true</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(6)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(6)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(6)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(6)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(6)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">6</d:ProductID><d:ProductName>Grandma\'s Boysenberry Spread</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">3</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID><d:QuantityPerUnit>12 - 8 oz jars</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">25.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">120</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">25</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(7)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(7)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(7)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(7)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(7)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">7</d:ProductID><d:ProductName>Uncle Bob\'s Organic Dried Pears</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">3</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID><d:QuantityPerUnit>12 - 1 lb pkgs.</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">30.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">15</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(8)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(8)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(8)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(8)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(8)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">8</d:ProductID><d:ProductName>Northwoods Cranberry Sauce</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">3</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID><d:QuantityPerUnit>12 - 12 oz jars</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">40.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">6</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(9)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(9)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(9)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(9)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(9)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">9</d:ProductID><d:ProductName>Mishi Kobe Niku</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">4</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">6</d:CategoryID><d:QuantityPerUnit>18 - 500 g pkgs.</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">97.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">29</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">true</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(10)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(10)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(10)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(10)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(10)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">10</d:ProductID><d:ProductName>Ikura</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">4</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">8</d:CategoryID><d:QuantityPerUnit>12 - 200 ml jars</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">31.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">31</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(11)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(11)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(11)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(11)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(11)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">11</d:ProductID><d:ProductName>Queso Cabrales</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">5</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">4</d:CategoryID><d:QuantityPerUnit>1 kg pkg.</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">21.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">22</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">30</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">30</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(12)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(12)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(12)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(12)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(12)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">12</d:ProductID><d:ProductName>Queso Manchego La Pastora</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">5</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">4</d:CategoryID><d:QuantityPerUnit>10 - 500 g pkgs.</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">38.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">86</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(13)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(13)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(13)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(13)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(13)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">13</d:ProductID><d:ProductName>Konbu</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">6</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">8</d:CategoryID><d:QuantityPerUnit>2 kg box</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">6.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">24</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">5</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(14)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(14)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(14)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(14)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(14)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">14</d:ProductID><d:ProductName>Tofu</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">6</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID><d:QuantityPerUnit>40 - 100 g pkgs.</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">23.2500</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">35</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(15)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(15)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(15)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(15)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(15)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">15</d:ProductID><d:ProductName>Genen Shouyu</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">6</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID><d:QuantityPerUnit>24 - 250 ml bottles</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">15.5000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">39</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">5</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(16)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(16)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(16)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(16)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(16)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">16</d:ProductID><d:ProductName>Pavlova</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">7</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">3</d:CategoryID><d:QuantityPerUnit>32 - 500 g boxes</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">17.4500</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">29</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(17)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(17)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(17)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(17)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(17)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">17</d:ProductID><d:ProductName>Alice Mutton</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">7</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">6</d:CategoryID><d:QuantityPerUnit>20 - 1 kg tins</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">39.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">0</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">true</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(18)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(18)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(18)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(18)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(18)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">18</d:ProductID><d:ProductName>Carnarvon Tigers</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">7</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">8</d:CategoryID><d:QuantityPerUnit>16 kg pkg.</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">62.5000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">42</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(19)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(19)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(19)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(19)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(19)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">19</d:ProductID><d:ProductName>Teatime Chocolate Biscuits</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">8</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">3</d:CategoryID><d:QuantityPerUnit>10 boxes x 12 pieces</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">9.2000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">25</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">5</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(20)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(20)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(20)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(20)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(20)/Supplier\" /><title /><updated>2014-07-31T13:52:29Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">20</d:ProductID><d:ProductName>Sir Rodney\'s Marmalade</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">8</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">3</d:CategoryID><d:QuantityPerUnit>30 gift boxes</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">81.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">40</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry></feed>';

  var sProductsExpand3LevelsXML = '<?xml version=\"1.0\" encoding=\"utf-8\"?><entry xml:base=\"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/\" xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(1)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(1)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(1)/Category\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Categories(1)</id><category term=\"NorthwindModel.Category\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Category\" href=\"Categories(1)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Categories(1)/Products\"><m:inline><feed><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Categories(1)/Products</id><title type=\"text\">Products</title><updated>2014-07-30T08:12:52Z</updated><link rel=\"self\" title=\"Products\" href=\"Categories(1)/Products\" /><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(1)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(1)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(1)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(1)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(1)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(1)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(1)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(1)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID><d:CompanyName>Exotic Liquids</d:CompanyName><d:ContactName>Charlotte Cooper</d:ContactName><d:ContactTitle>Purchasing Manager</d:ContactTitle><d:Address>49 Gilbert St.</d:Address><d:City>London</d:City><d:Region m:null=\"true\" /><d:PostalCode>EC1 4SD</d:PostalCode><d:Country>UK</d:Country><d:Phone>(171) 555-2222</d:Phone><d:Fax m:null=\"true\" /><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">1</d:ProductID><d:ProductName>Chai</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>10 boxes x 20 bags</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">18.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">39</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(2)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(2)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(2)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(2)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(2)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(1)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(1)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(1)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID><d:CompanyName>Exotic Liquids</d:CompanyName><d:ContactName>Charlotte Cooper</d:ContactName><d:ContactTitle>Purchasing Manager</d:ContactTitle><d:Address>49 Gilbert St.</d:Address><d:City>London</d:City><d:Region m:null=\"true\" /><d:PostalCode>EC1 4SD</d:PostalCode><d:Country>UK</d:Country><d:Phone>(171) 555-2222</d:Phone><d:Fax m:null=\"true\" /><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">2</d:ProductID><d:ProductName>Chang</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>24 - 12 oz bottles</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">19.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">17</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">40</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">25</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(24)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(24)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(24)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(24)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(24)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(10)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(10)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(10)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">10</d:SupplierID><d:CompanyName>Refrescos Americanas LTDA</d:CompanyName><d:ContactName>Carlos Diaz</d:ContactName><d:ContactTitle>Marketing Manager</d:ContactTitle><d:Address>Av. das Americanas 12.890</d:Address><d:City>Sao Paulo</d:City><d:Region m:null=\"true\" /><d:PostalCode>5442</d:PostalCode><d:Country>Brazil</d:Country><d:Phone>(11) 555 4640</d:Phone><d:Fax m:null=\"true\" /><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">24</d:ProductID><d:ProductName>Guaraná Fantástica</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">10</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>12 - 355 ml cans</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">4.5000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">20</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">true</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(34)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(34)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(34)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(34)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(34)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(16)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(16)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(16)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">16</d:SupplierID><d:CompanyName>Bigfoot Breweries</d:CompanyName><d:ContactName>Cheryl Saylor</d:ContactName><d:ContactTitle>Regional Account Rep.</d:ContactTitle><d:Address>3400 - 8th Avenue Suite 210</d:Address><d:City>Bend</d:City><d:Region>OR</d:Region><d:PostalCode>97101</d:PostalCode><d:Country>USA</d:Country><d:Phone>(503) 555-9931</d:Phone><d:Fax m:null=\"true\" /><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">34</d:ProductID><d:ProductName>Sasquatch Ale</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">16</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>24 - 12 oz bottles</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">14.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">111</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">15</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(35)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(35)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(35)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(35)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(35)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(16)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(16)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(16)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">16</d:SupplierID><d:CompanyName>Bigfoot Breweries</d:CompanyName><d:ContactName>Cheryl Saylor</d:ContactName><d:ContactTitle>Regional Account Rep.</d:ContactTitle><d:Address>3400 - 8th Avenue Suite 210</d:Address><d:City>Bend</d:City><d:Region>OR</d:Region><d:PostalCode>97101</d:PostalCode><d:Country>USA</d:Country><d:Phone>(503) 555-9931</d:Phone><d:Fax m:null=\"true\" /><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">35</d:ProductID><d:ProductName>Steeleye Stout</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">16</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>24 - 12 oz bottles</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">18.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">20</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">15</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(38)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(38)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(38)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(38)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(38)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(18)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(18)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(18)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">18</d:SupplierID><d:CompanyName>Aux joyeux ecclésiastiques</d:CompanyName><d:ContactName>Guylène Nodier</d:ContactName><d:ContactTitle>Sales Manager</d:ContactTitle><d:Address>203, Rue des Francs-Bourgeois</d:Address><d:City>Paris</d:City><d:Region m:null=\"true\" /><d:PostalCode>75004</d:PostalCode><d:Country>France</d:Country><d:Phone>(1) 03.83.00.68</d:Phone><d:Fax>(1) 03.83.00.62</d:Fax><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">38</d:ProductID><d:ProductName>Côte de Blaye</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">18</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>12 - 75 cl bottles</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">263.5000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">17</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">15</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(39)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(39)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(39)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(39)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(39)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(18)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(18)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(18)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">18</d:SupplierID><d:CompanyName>Aux joyeux ecclésiastiques</d:CompanyName><d:ContactName>Guylène Nodier</d:ContactName><d:ContactTitle>Sales Manager</d:ContactTitle><d:Address>203, Rue des Francs-Bourgeois</d:Address><d:City>Paris</d:City><d:Region m:null=\"true\" /><d:PostalCode>75004</d:PostalCode><d:Country>France</d:Country><d:Phone>(1) 03.83.00.68</d:Phone><d:Fax>(1) 03.83.00.62</d:Fax><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">39</d:ProductID><d:ProductName>Chartreuse verte</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">18</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>750 cc per bottle</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">18.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">69</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">5</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(43)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(43)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(43)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(43)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(43)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(20)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(20)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(20)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">20</d:SupplierID><d:CompanyName>Leka Trading</d:CompanyName><d:ContactName>Chandra Leka</d:ContactName><d:ContactTitle>Owner</d:ContactTitle><d:Address>471 Serangoon Loop, Suite #402</d:Address><d:City>Singapore</d:City><d:Region m:null=\"true\" /><d:PostalCode>0512</d:PostalCode><d:Country>Singapore</d:Country><d:Phone>555-8787</d:Phone><d:Fax m:null=\"true\" /><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">43</d:ProductID><d:ProductName>Ipoh Coffee</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">20</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>16 - 500 g tins</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">46.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">17</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">10</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">25</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(67)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(67)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(67)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(67)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(67)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(16)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(16)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(16)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">16</d:SupplierID><d:CompanyName>Bigfoot Breweries</d:CompanyName><d:ContactName>Cheryl Saylor</d:ContactName><d:ContactTitle>Regional Account Rep.</d:ContactTitle><d:Address>3400 - 8th Avenue Suite 210</d:Address><d:City>Bend</d:City><d:Region>OR</d:Region><d:PostalCode>97101</d:PostalCode><d:Country>USA</d:Country><d:Phone>(503) 555-9931</d:Phone><d:Fax m:null=\"true\" /><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">67</d:ProductID><d:ProductName>Laughing Lumberjack Lager</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">16</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>24 - 12 oz bottles</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">14.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">52</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(70)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(70)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(70)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(70)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(70)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(7)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(7)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(7)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">7</d:SupplierID><d:CompanyName>Pavlova, Ltd.</d:CompanyName><d:ContactName>Ian Devling</d:ContactName><d:ContactTitle>Marketing Manager</d:ContactTitle><d:Address>74 Rose St. Moonie Ponds</d:Address><d:City>Melbourne</d:City><d:Region>Victoria</d:Region><d:PostalCode>3058</d:PostalCode><d:Country>Australia</d:Country><d:Phone>(03) 444-2343</d:Phone><d:Fax>(03) 444-6588</d:Fax><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">70</d:ProductID><d:ProductName>Outback Lager</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">7</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>24 - 355 ml bottles</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">15.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">15</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">10</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">30</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(75)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(75)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(75)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(75)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(75)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(12)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(12)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(12)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">12</d:SupplierID><d:CompanyName>Plutzer Lebensmittelgroßmärkte AG</d:CompanyName><d:ContactName>Martin Bein</d:ContactName><d:ContactTitle>International Marketing Mgr.</d:ContactTitle><d:Address>Bogenallee 51</d:Address><d:City>Frankfurt</d:City><d:Region m:null=\"true\" /><d:PostalCode>60439</d:PostalCode><d:Country>Germany</d:Country><d:Phone>(069) 992755</d:Phone><d:Fax m:null=\"true\" /><d:HomePage>Plutzer (on the World Wide Web)#http://www.microsoft.com/accessdev/sampleapps/plutzer.htm#</d:HomePage></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">75</d:ProductID><d:ProductName>Rhönbräu Klosterbier</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">12</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>24 - 0.5 l bottles</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">7.7500</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">125</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">25</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Products(76)</id><category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Product\" href=\"Products(76)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(76)/Category\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(76)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(76)/Supplier\"><m:inline><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Suppliers(23)</id><category term=\"NorthwindModel.Supplier\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Supplier\" href=\"Suppliers(23)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Suppliers(23)/Products\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:SupplierID m:type=\"Edm.Int32\">23</d:SupplierID><d:CompanyName>Karkki Oy</d:CompanyName><d:ContactName>Anne Heikkonen</d:ContactName><d:ContactTitle>Product Manager</d:ContactTitle><d:Address>Valtakatu 12</d:Address><d:City>Lappeenranta</d:City><d:Region m:null=\"true\" /><d:PostalCode>53120</d:PostalCode><d:Country>Finland</d:Country><d:Phone>(953) 10956</d:Phone><d:Fax m:null=\"true\" /><d:HomePage m:null=\"true\" /></m:properties></content></entry></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">76</d:ProductID><d:ProductName>Lakkalikööri</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">23</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>500 ml</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">18.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">57</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">20</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry></feed></m:inline></link><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:CategoryName>Beverages</d:CategoryName><d:Description>Soft drinks, coffees, teas, beers, and ales</d:Description><d:Picture m:type=\"Edm.Binary\"></d:Picture></m:properties></content></entry></m:inline></link><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(1)/Order_Details\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(1)/Supplier\" /><title /><updated>2014-07-30T08:12:52Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:ProductID m:type=\"Edm.Int32\">1</d:ProductID><d:ProductName>Chai</d:ProductName><d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID><d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID><d:QuantityPerUnit>10 boxes x 20 bags</d:QuantityPerUnit><d:UnitPrice m:type=\"Edm.Decimal\">18.0000</d:UnitPrice><d:UnitsInStock m:type=\"Edm.Int16\">39</d:UnitsInStock><d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder><d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel><d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued></m:properties></content></entry>';

  var sEmployeesXML = '<?xml version=\"1.0\" encoding=\"utf-8\"?><feed xml:base=\"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/\" xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Employees</id><title type=\"text\">Employees</title><updated>2014-07-30T15:39:04Z</updated><link rel=\"self\" title=\"Employees\" href=\"Employees\" /><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Employees(1)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(1)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(1)/Employees1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(1)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(1)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(1)/Territories\" /><title /><updated>2014-07-30T15:39:04Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">1</d:EmployeeID><d:LastName>Davolio</d:LastName><d:FirstName>Nancy</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Ms.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1948-12-08T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1992-05-01T00:00:00</d:HireDate><d:Address>507 - 20th Ave. E.&#xD;Apt. 2A</d:Address><d:City>Seattle</d:City><d:Region>WA</d:Region><d:PostalCode>98122</d:PostalCode><d:Country>USA</d:Country><d:HomePhone>(206) 555-9857</d:HomePhone><d:Extension>5467</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Education includes a BA in psychology from Colorado State University in 1970.  She also completed \"The Art of the Cold Call.\"  Nancy is a member of Toastmasters International.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">2</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/davolio.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Employees(2)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(2)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(2)/Employees1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(2)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(2)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(2)/Territories\" /><title /><updated>2014-07-30T15:39:04Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">2</d:EmployeeID><d:LastName>Fuller</d:LastName><d:FirstName>Andrew</d:FirstName><d:Title>Vice President, Sales</d:Title><d:TitleOfCourtesy>Dr.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1952-02-19T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1992-08-14T00:00:00</d:HireDate><d:Address>908 W. Capital Way</d:Address><d:City>Tacoma</d:City><d:Region>WA</d:Region><d:PostalCode>98401</d:PostalCode><d:Country>USA</d:Country><d:HomePhone>(206) 555-9482</d:HomePhone><d:Extension>3457</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Andrew received his BTS commercial in 1974 and a Ph.D. in international marketing from the University of Dallas in 1981.  He is fluent in French and Italian and reads German.  He joined the company as a sales representative, was promoted to sales manager in January 1992 and to vice president of sales in March 1993.  Andrew is a member of the Sales Management Roundtable, the Seattle Chamber of Commerce, and the Pacific Rim Importers Association.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\" m:null=\"true\" /><d:PhotoPath>http://accweb/emmployees/fuller.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Employees(3)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(3)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(3)/Employees1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(3)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(3)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(3)/Territories\" /><title /><updated>2014-07-30T15:39:04Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">3</d:EmployeeID><d:LastName>Leverling</d:LastName><d:FirstName>Janet</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Ms.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1963-08-30T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1992-04-01T00:00:00</d:HireDate><d:Address>722 Moss Bay Blvd.</d:Address><d:City>Kirkland</d:City><d:Region>WA</d:Region><d:PostalCode>98033</d:PostalCode><d:Country>USA</d:Country><d:HomePhone>(206) 555-3412</d:HomePhone><d:Extension>3355</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Janet has a BS degree in chemistry from Boston College (1984).  She has also completed a certificate program in food retailing management.  Janet was hired as a sales associate in 1991 and promoted to sales representative in February 1992.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">2</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/leverling.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Employees(4)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(4)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(4)/Employees1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(4)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(4)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(4)/Territories\" /><title /><updated>2014-07-30T15:39:04Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">4</d:EmployeeID><d:LastName>Peacock</d:LastName><d:FirstName>Margaret</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Mrs.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1937-09-19T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1993-05-03T00:00:00</d:HireDate><d:Address>4110 Old Redmond Rd.</d:Address><d:City>Redmond</d:City><d:Region>WA</d:Region><d:PostalCode>98052</d:PostalCode><d:Country>USA</d:Country><d:HomePhone>(206) 555-8122</d:HomePhone><d:Extension>5176</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Margaret holds a BA in English literature from Concordia College (1958) and an MA from the American Institute of Culinary Arts (1966).  She was assigned to the London office temporarily from July through November 1992.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">2</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/peacock.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Employees(5)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(5)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(5)/Employees1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(5)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(5)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(5)/Territories\" /><title /><updated>2014-07-30T15:39:04Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">5</d:EmployeeID><d:LastName>Buchanan</d:LastName><d:FirstName>Steven</d:FirstName><d:Title>Sales Manager</d:Title><d:TitleOfCourtesy>Mr.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1955-03-04T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1993-10-17T00:00:00</d:HireDate><d:Address>14 Garrett Hill</d:Address><d:City>London</d:City><d:Region m:null=\"true\" /><d:PostalCode>SW1 8JR</d:PostalCode><d:Country>UK</d:Country><d:HomePhone>(71) 555-4848</d:HomePhone><d:Extension>3453</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Steven Buchanan graduated from St. Andrews University, Scotland, with a BSC degree in 1976.  Upon joining the company as a sales representative in 1992, he spent 6 months in an orientation program at the Seattle office and then returned to his permanent post in London.  He was promoted to sales manager in March 1993.  Mr. Buchanan has completed the courses \"Successful Telemarketing\" and \"International Sales Management.\"  He is fluent in French.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">2</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/buchanan.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Employees(6)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(6)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(6)/Employees1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(6)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(6)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(6)/Territories\" /><title /><updated>2014-07-30T15:39:04Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">6</d:EmployeeID><d:LastName>Suyama</d:LastName><d:FirstName>Michael</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Mr.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1963-07-02T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1993-10-17T00:00:00</d:HireDate><d:Address>Coventry House&#xD;Miner Rd.</d:Address><d:City>London</d:City><d:Region m:null=\"true\" /><d:PostalCode>EC2 7JR</d:PostalCode><d:Country>UK</d:Country><d:HomePhone>(71) 555-7773</d:HomePhone><d:Extension>428</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Michael is a graduate of Sussex University (MA, economics, 1983) and the University of California at Los Angeles (MBA, marketing, 1986).  He has also taken the courses \"Multi-Cultural Selling\" and \"Time Management for the Sales Professional.\"  He is fluent in Japanese and can read and write French, Portuguese, and Spanish.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">5</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/davolio.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Employees(7)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(7)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(7)/Employees1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(7)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(7)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(7)/Territories\" /><title /><updated>2014-07-30T15:39:04Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">7</d:EmployeeID><d:LastName>King</d:LastName><d:FirstName>Robert</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Mr.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1960-05-29T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1994-01-02T00:00:00</d:HireDate><d:Address>Edgeham Hollow&#xD;Winchester Way</d:Address><d:City>London</d:City><d:Region m:null=\"true\" /><d:PostalCode>RG1 9SP</d:PostalCode><d:Country>UK</d:Country><d:HomePhone>(71) 555-5598</d:HomePhone><d:Extension>465</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Robert King served in the Peace Corps and traveled extensively before completing his degree in English at the University of Michigan in 1992, the year he joined the company.  After completing a course entitled \"Selling in Europe,\" he was transferred to the London office in March 1993.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">5</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/davolio.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Employees(8)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(8)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(8)/Employees1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(8)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(8)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(8)/Territories\" /><title /><updated>2014-07-30T15:39:04Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">8</d:EmployeeID><d:LastName>Callahan</d:LastName><d:FirstName>Laura</d:FirstName><d:Title>Inside Sales Coordinator</d:Title><d:TitleOfCourtesy>Ms.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1958-01-09T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1994-03-05T00:00:00</d:HireDate><d:Address>4726 - 11th Ave. N.E.</d:Address><d:City>Seattle</d:City><d:Region>WA</d:Region><d:PostalCode>98105</d:PostalCode><d:Country>USA</d:Country><d:HomePhone>(206) 555-1189</d:HomePhone><d:Extension>2344</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Laura received a BA in psychology from the University of Washington.  She has also completed a course in business French.  She reads and writes French.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">2</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/davolio.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Employees(9)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(9)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(9)/Employees1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(9)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(9)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(9)/Territories\" /><title /><updated>2014-07-30T15:39:04Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">9</d:EmployeeID><d:LastName>Dodsworth</d:LastName><d:FirstName>Anne</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Ms.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1966-01-27T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1994-11-15T00:00:00</d:HireDate><d:Address>7 Houndstooth Rd.</d:Address><d:City>London</d:City><d:Region m:null=\"true\" /><d:PostalCode>WG2 7LT</d:PostalCode><d:Country>UK</d:Country><d:HomePhone>(71) 555-4444</d:HomePhone><d:Extension>452</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Anne has a BA degree in English from St. Lawrence College.  She is fluent in French and German.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">5</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/davolio.bmp</d:PhotoPath></m:properties></content></entry></feed>';

  var sEmployees2XML = '<?xml version="1.0" encoding="utf-8"?><entry xml:base="http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/" xmlns="http://www.w3.org/2005/Atom" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(2)</id><category term="NorthwindModel.Employee" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" /><link rel="edit" title="Employee" href="Employees(2)" /><title /><updated>2015-03-04T17:35:34Z</updated><author><name /></author><content type="application/xml"><m:properties><d:EmployeeID m:type="Edm.Int32">2</d:EmployeeID><d:LastName>Fuller</d:LastName><d:FirstName>Andrew</d:FirstName></m:properties></content></entry>';

  var sEmployees1Expand3LevelsXML = '<?xml version=\"1.0\" encoding=\"utf-8\"?><entry xml:base=\"http://services.odata.org/V3/Northwind/Northwind.svc/\" xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(2)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(2)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(2)/Employees1\"><m:inline><feed><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(2)/Employees1</id><title type=\"text\">Employees1</title><updated>2014-07-31T07:10:37Z</updated><link rel=\"self\" title=\"Employees1\" href=\"Employees(2)/Employees1\" /><entry><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(1)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(1)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(1)/Employees1\"><m:inline><feed><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(1)/Employees1</id><title type=\"text\">Employees1</title><updated>2014-07-31T07:10:37Z</updated><link rel=\"self\" title=\"Employees1\" href=\"Employees(1)/Employees1\" /><author><name /></author></feed></m:inline></link><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(1)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(1)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(1)/Territories\" /><title /><updated>2014-07-31T07:10:37Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">1</d:EmployeeID><d:LastName>Davolio</d:LastName><d:FirstName>Nancy</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Ms.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1948-12-08T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1992-05-01T00:00:00</d:HireDate><d:Address>507 - 20th Ave. E.&#xD;	Apt. 2A</d:Address><d:City>Seattle</d:City><d:Region>WA</d:Region><d:PostalCode>98122</d:PostalCode><d:Country>USA</d:Country><d:HomePhone>(206) 555-9857</d:HomePhone><d:Extension>5467</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Education includes a BA in psychology from Colorado State University in 1970.  She also completed \"The Art of the Cold Call.\"  Nancy is a member of Toastmasters International.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">2</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/davolio.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(3)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(3)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(3)/Employees1\"><m:inline><feed><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(3)/Employees1</id><title type=\"text\">Employees1</title><updated>2014-07-31T07:10:37Z</updated><link rel=\"self\" title=\"Employees1\" href=\"Employees(3)/Employees1\" /><author><name /></author></feed></m:inline></link><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(3)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(3)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(3)/Territories\" /><title /><updated>2014-07-31T07:10:37Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">3</d:EmployeeID><d:LastName>Leverling</d:LastName><d:FirstName>Janet</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Ms.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1963-08-30T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1992-04-01T00:00:00</d:HireDate><d:Address>722 Moss Bay Blvd.</d:Address><d:City>Kirkland</d:City><d:Region>WA</d:Region><d:PostalCode>98033</d:PostalCode><d:Country>USA</d:Country><d:HomePhone>(206) 555-3412</d:HomePhone><d:Extension>3355</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Janet has a BS degree in chemistry from Boston College (1984).  She has also completed a certificate program in food retailing management.  Janet was hired as a sales associate in 1991 and promoted to sales representative in February 1992.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">2</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/leverling.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(4)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(4)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(4)/Employees1\"><m:inline><feed><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(4)/Employees1</id><title type=\"text\">Employees1</title><updated>2014-07-31T07:10:37Z</updated><link rel=\"self\" title=\"Employees1\" href=\"Employees(4)/Employees1\" /><author><name /></author></feed></m:inline></link><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(4)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(4)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(4)/Territories\" /><title /><updated>2014-07-31T07:10:37Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">4</d:EmployeeID><d:LastName>Peacock</d:LastName><d:FirstName>Margaret</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Mrs.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1937-09-19T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1993-05-03T00:00:00</d:HireDate><d:Address>4110 Old Redmond Rd.</d:Address><d:City>Redmond</d:City><d:Region>WA</d:Region><d:PostalCode>98052</d:PostalCode><d:Country>USA</d:Country><d:HomePhone>(206) 555-8122</d:HomePhone><d:Extension>5176</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Margaret holds a BA in English literature from Concordia College (1958) and an MA from the American Institute of Culinary Arts (1966).  She was assigned to the London office temporarily from July through November 1992.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">2</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/peacock.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(5)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(5)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(5)/Employees1\"><m:inline><feed><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(5)/Employees1</id><title type=\"text\">Employees1</title><updated>2014-07-31T07:10:37Z</updated><link rel=\"self\" title=\"Employees1\" href=\"Employees(5)/Employees1\" /><entry><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(6)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(6)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(6)/Employees1\"><m:inline><feed><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(6)/Employees1</id><title type=\"text\">Employees1</title><updated>2014-07-31T07:10:37Z</updated><link rel=\"self\" title=\"Employees1\" href=\"Employees(6)/Employees1\" /><author><name /></author></feed></m:inline></link><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(6)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(6)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(6)/Territories\" /><title /><updated>2014-07-31T07:10:37Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">6</d:EmployeeID><d:LastName>Suyama</d:LastName><d:FirstName>Michael</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Mr.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1963-07-02T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1993-10-17T00:00:00</d:HireDate><d:Address>Coventry House&#xD;	Miner Rd.</d:Address><d:City>London</d:City><d:Region m:null=\"true\" /><d:PostalCode>EC2 7JR</d:PostalCode><d:Country>UK</d:Country><d:HomePhone>(71) 555-7773</d:HomePhone><d:Extension>428</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Michael is a graduate of Sussex University (MA, economics, 1983) and the University of California at Los Angeles (MBA, marketing, 1986).  He has also taken the courses \"Multi-Cultural Selling\" and \"Time Management for the Sales Professional.\"  He is fluent in Japanese and can read and write French, Portuguese, and Spanish.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">5</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/davolio.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(7)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(7)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(7)/Employees1\"><m:inline><feed><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(7)/Employees1</id><title type=\"text\">Employees1</title><updated>2014-07-31T07:10:37Z</updated><link rel=\"self\" title=\"Employees1\" href=\"Employees(7)/Employees1\" /><author><name /></author></feed></m:inline></link><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(7)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(7)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(7)/Territories\" /><title /><updated>2014-07-31T07:10:37Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">7</d:EmployeeID><d:LastName>King</d:LastName><d:FirstName>Robert</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Mr.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1960-05-29T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1994-01-02T00:00:00</d:HireDate><d:Address>Edgeham Hollow&#xD;	Winchester Way</d:Address><d:City>London</d:City><d:Region m:null=\"true\" /><d:PostalCode>RG1 9SP</d:PostalCode><d:Country>UK</d:Country><d:HomePhone>(71) 555-5598</d:HomePhone><d:Extension>465</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Robert King served in the Peace Corps and traveled extensively before completing his degree in English at the University of Michigan in 1992, the year he joined the company.  After completing a course entitled \"Selling in Europe,\" he was transferred to the London office in March 1993.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">5</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/davolio.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(9)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(9)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(9)/Employees1\"><m:inline><feed><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(9)/Employees1</id><title type=\"text\">Employees1</title><updated>2014-07-31T07:10:37Z</updated><link rel=\"self\" title=\"Employees1\" href=\"Employees(9)/Employees1\" /><author><name /></author></feed></m:inline></link><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(9)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(9)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(9)/Territories\" /><title /><updated>2014-07-31T07:10:37Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">9</d:EmployeeID><d:LastName>Dodsworth</d:LastName><d:FirstName>Anne</d:FirstName><d:Title>Sales Representative</d:Title><d:TitleOfCourtesy>Ms.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1966-01-27T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1994-11-15T00:00:00</d:HireDate><d:Address>7 Houndstooth Rd.</d:Address><d:City>London</d:City><d:Region m:null=\"true\" /><d:PostalCode>WG2 7LT</d:PostalCode><d:Country>UK</d:Country><d:HomePhone>(71) 555-4444</d:HomePhone><d:Extension>452</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Anne has a BA degree in English from St. Lawrence College.  She is fluent in French and German.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">5</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/davolio.bmp</d:PhotoPath></m:properties></content></entry></feed></m:inline></link><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(5)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(5)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(5)/Territories\" /><title /><updated>2014-07-31T07:10:37Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">5</d:EmployeeID><d:LastName>Buchanan</d:LastName><d:FirstName>Steven</d:FirstName><d:Title>Sales Manager</d:Title><d:TitleOfCourtesy>Mr.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1955-03-04T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1993-10-17T00:00:00</d:HireDate><d:Address>14 Garrett Hill</d:Address><d:City>London</d:City><d:Region m:null=\"true\" /><d:PostalCode>SW1 8JR</d:PostalCode><d:Country>UK</d:Country><d:HomePhone>(71) 555-4848</d:HomePhone><d:Extension>3453</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Steven Buchanan graduated from St. Andrews University, Scotland, with a BSC degree in 1976.  Upon joining the company as a sales representative in 1992, he spent 6 months in an orientation program at the Seattle office and then returned to his permanent post in London.  He was promoted to sales manager in March 1993.  Mr. Buchanan has completed the courses \"Successful Telemarketing\" and \"International Sales Management.\"  He is fluent in French.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">2</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/buchanan.bmp</d:PhotoPath></m:properties></content></entry><entry><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(8)</id><category term=\"NorthwindModel.Employee\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" /><link rel=\"edit\" title=\"Employee\" href=\"Employees(8)\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employees1\" type=\"application/atom+xml;type=feed\" title=\"Employees1\" href=\"Employees(8)/Employees1\"><m:inline><feed><id>http://services.odata.org/V3/Northwind/Northwind.svc/Employees(8)/Employees1</id><title type=\"text\">Employees1</title><updated>2014-07-31T07:10:37Z</updated><link rel=\"self\" title=\"Employees1\" href=\"Employees(8)/Employees1\" /><author><name /></author></feed></m:inline></link><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(8)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(8)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(8)/Territories\" /><title /><updated>2014-07-31T07:10:37Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">8</d:EmployeeID><d:LastName>Callahan</d:LastName><d:FirstName>Laura</d:FirstName><d:Title>Inside Sales Coordinator</d:Title><d:TitleOfCourtesy>Ms.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1958-01-09T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1994-03-05T00:00:00</d:HireDate><d:Address>4726 - 11th Ave. N.E.</d:Address><d:City>Seattle</d:City><d:Region>WA</d:Region><d:PostalCode>98105</d:PostalCode><d:Country>USA</d:Country><d:HomePhone>(206) 555-1189</d:HomePhone><d:Extension>2344</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Laura received a BA in psychology from the University of Washington.  She has also completed a course in business French.  She reads and writes French.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\">2</d:ReportsTo><d:PhotoPath>http://accweb/emmployees/davolio.bmp</d:PhotoPath></m:properties></content></entry></feed></m:inline></link><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee1\" type=\"application/atom+xml;type=entry\" title=\"Employee1\" href=\"Employees(2)/Employee1\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Orders\" type=\"application/atom+xml;type=feed\" title=\"Orders\" href=\"Employees(2)/Orders\" /><link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Territories\" type=\"application/atom+xml;type=feed\" title=\"Territories\" href=\"Employees(2)/Territories\" /><title /><updated>2014-07-31T07:10:37Z</updated><author><name /></author><content type=\"application/xml\"><m:properties><d:EmployeeID m:type=\"Edm.Int32\">2</d:EmployeeID><d:LastName>Fuller</d:LastName><d:FirstName>Andrew</d:FirstName><d:Title>Vice President, Sales</d:Title><d:TitleOfCourtesy>Dr.</d:TitleOfCourtesy><d:BirthDate m:type=\"Edm.DateTime\">1952-02-19T00:00:00</d:BirthDate><d:HireDate m:type=\"Edm.DateTime\">1992-08-14T00:00:00</d:HireDate><d:Address>908 W. Capital Way</d:Address><d:City>Tacoma</d:City><d:Region>WA</d:Region><d:PostalCode>98401</d:PostalCode><d:Country>USA</d:Country><d:HomePhone>(206) 555-9482</d:HomePhone><d:Extension>3457</d:Extension><d:Photo m:type=\"Edm.Binary\"></d:Photo><d:Notes>Andrew received his BTS commercial in 1974 and a Ph.D. in international marketing from the University of Dallas in 1981.  He is fluent in French and Italian and reads German.  He joined the company as a sales representative, was promoted to sales manager in January 1992 and to vice president of sales in March 1993.  Andrew is a member of the Sales Management Roundtable, the Seattle Chamber of Commerce, and the Pacific Rim Importers Association.</d:Notes><d:ReportsTo m:type=\"Edm.Int32\" m:null=\"true\" /><d:PhotoPath>http://accweb/emmployees/fuller.bmp</d:PhotoPath></m:properties></content></entry>';

  var sProductsForFilterANDing1 = "<feed xml:base=\"http://services.odata.org/V3/Northwind/Northwind.svc/\" xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products</id>\n" +
      "<title type=\"text\">Products</title>\n" +
      "<updated>2014-09-03T09:43:07Z</updated>\n" +
      "<link rel=\"self\" title=\"Products\" href=\"Products\"/>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(1)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(1)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(1)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(1)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(1)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:43:07Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">1</d:ProductID>\n" +
      "<d:ProductName>Chai</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID>\n" +
      "<d:QuantityPerUnit>10 boxes x 20 bags</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">18.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">39</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(2)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(2)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(2)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(2)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(2)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:43:07Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">2</d:ProductID>\n" +
      "<d:ProductName>Chang</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID>\n" +
      "<d:QuantityPerUnit>24 - 12 oz bottles</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">19.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">17</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">40</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">25</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(4)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(4)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(4)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(4)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(4)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:43:07Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">4</d:ProductID>\n" +
      "<d:ProductName>Chef Anton\'s Cajun Seasoning</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">2</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID>\n" +
      "<d:QuantityPerUnit>48 - 6 oz jars</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">22.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">53</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(5)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(5)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(5)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(5)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(5)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:43:07Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">5</d:ProductID>\n" +
      "<d:ProductName>Chef Anton\'s Gumbo Mix</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">2</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID>\n" +
      "<d:QuantityPerUnit>36 boxes</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">21.3500</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">0</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">true</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(18)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(18)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(18)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(18)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(18)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:43:07Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">18</d:ProductID>\n" +
      "<d:ProductName>Carnarvon Tigers</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">7</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">8</d:CategoryID>\n" +
      "<d:QuantityPerUnit>16 kg pkg.</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">62.5000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">42</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(38)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(38)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(38)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(38)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(38)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:43:07Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">38</d:ProductID>\n" +
      "<d:ProductName>Côte de Blaye</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">18</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID>\n" +
      "<d:QuantityPerUnit>12 - 75 cl bottles</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">263.5000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">17</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">15</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(39)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(39)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(39)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(39)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(39)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:43:07Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">39</d:ProductID>\n" +
      "<d:ProductName>Chartreuse verte</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">18</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID>\n" +
      "<d:QuantityPerUnit>750 cc per bottle</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">18.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">69</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">5</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(48)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(48)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(48)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(48)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(48)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:43:07Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">48</d:ProductID>\n" +
      "<d:ProductName>Chocolade</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">22</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">3</d:CategoryID>\n" +
      "<d:QuantityPerUnit>10 pkgs.</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">12.7500</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">15</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">70</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">25</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(60)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(60)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(60)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(60)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(60)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:43:07Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">60</d:ProductID>\n" +
      "<d:ProductName>Camembert Pierrot</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">28</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">4</d:CategoryID>\n" +
      "<d:QuantityPerUnit>15 - 300 g rounds</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">34.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">19</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "</feed>";

  var sProductsForFilterANDing2 = "<feed xml:base=\"http://services.odata.org/V3/Northwind/Northwind.svc/\" xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products</id>\n" +
      "<title type=\"text\">Products</title>\n" +
      "<updated>2014-09-03T09:03:52Z</updated>\n" +
      "<link rel=\"self\" title=\"Products\" href=\"Products\"/>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(4)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(4)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(4)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(4)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(4)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:03:52Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">4</d:ProductID>\n" +
      "<d:ProductName>Chef Anton\'s Cajun Seasoning</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">2</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID>\n" +
      "<d:QuantityPerUnit>48 - 6 oz jars</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">22.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">53</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(5)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(5)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(5)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(5)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(5)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:03:52Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">5</d:ProductID>\n" +
      "<d:ProductName>Chef Anton\'s Gumbo Mix</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">2</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID>\n" +
      "<d:QuantityPerUnit>36 boxes</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">21.3500</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">0</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">true</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(18)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(18)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(18)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(18)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(18)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:03:52Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">18</d:ProductID>\n" +
      "<d:ProductName>Carnarvon Tigers</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">7</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">8</d:CategoryID>\n" +
      "<d:QuantityPerUnit>16 kg pkg.</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">62.5000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">42</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(48)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(48)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(48)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(48)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(48)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:03:52Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">48</d:ProductID>\n" +
      "<d:ProductName>Chocolade</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">22</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">3</d:CategoryID>\n" +
      "<d:QuantityPerUnit>10 pkgs.</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">12.7500</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">15</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">70</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">25</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(60)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(60)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(60)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(60)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(60)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:03:52Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">60</d:ProductID>\n" +
      "<d:ProductName>Camembert Pierrot</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">28</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">4</d:CategoryID>\n" +
      "<d:QuantityPerUnit>15 - 300 g rounds</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">34.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">19</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "</feed>";

  var sProductsForFilterANDing3 = "<feed xml:base=\"http://services.odata.org/V3/Northwind/Northwind.svc/\" xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products</id>\n" +
      "<title type=\"text\">Products</title>\n" +
      "<updated>2014-09-03T09:21:10Z</updated>\n" +
      "<link rel=\"self\" title=\"Products\" href=\"Products\"/>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(1)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(1)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(1)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(1)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(1)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:21:10Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">1</d:ProductID>\n" +
      "<d:ProductName>Chai</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID>\n" +
      "<d:QuantityPerUnit>10 boxes x 20 bags</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">18.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">39</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(2)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(2)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(2)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(2)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(2)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:21:10Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">2</d:ProductID>\n" +
      "<d:ProductName>Chang</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">1</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID>\n" +
      "<d:QuantityPerUnit>24 - 12 oz bottles</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">19.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">17</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">40</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">25</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(4)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(4)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(4)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(4)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(4)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:21:10Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">4</d:ProductID>\n" +
      "<d:ProductName>Chef Anton\'s Cajun Seasoning</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">2</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID>\n" +
      "<d:QuantityPerUnit>48 - 6 oz jars</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">22.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">53</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(5)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(5)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(5)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(5)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(5)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:21:10Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">5</d:ProductID>\n" +
      "<d:ProductName>Chef Anton\'s Gumbo Mix</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">2</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">2</d:CategoryID>\n" +
      "<d:QuantityPerUnit>36 boxes</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">21.3500</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">0</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">true</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(39)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(39)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(39)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(39)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(39)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:21:10Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">39</d:ProductID>\n" +
      "<d:ProductName>Chartreuse verte</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">18</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">1</d:CategoryID>\n" +
      "<d:QuantityPerUnit>750 cc per bottle</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">18.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">69</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">5</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(48)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(48)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(48)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(48)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(48)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2014-09-03T09:21:10Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">48</d:ProductID>\n" +
      "<d:ProductName>Chocolade</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">22</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">3</d:CategoryID>\n" +
      "<d:QuantityPerUnit>10 pkgs.</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">12.7500</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">15</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">70</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">25</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "</feed>";

      //var sProductsCategory =
      //{"odata.metadata":"http://services.odata.org/Northwind/Northwind.svc/$metadata#Categories/@Element","CategoryID":1,"CategoryName":"Beverages","Description":"Soft drinks, coffees, teas, beers, and ales","Picture":""};
      var sRegionsJSON = "{\n" +
      "\"d\" : {\n" +
      "\"results\": [\n" +
      "{\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Regions(1)\", \"type\": \"NorthwindModel.Region\"\n" +
      "}, \"RegionID\": 1, \"RegionDescription\": \"Eastern                                           \", \"Territories\": null\n" +
      "}, {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Regions(2)\", \"type\": \"NorthwindModel.Region\"\n" +
      "}, \"RegionID\": 2, \"RegionDescription\": \"Western                                           \", \"Territories\": null\n" +
      "}, {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Regions(3)\", \"type\": \"NorthwindModel.Region\"\n" +
      "}, \"RegionID\": 3, \"RegionDescription\": \"Northern                                          \", \"Territories\": null\n" +
      "}, {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Regions(4)\", \"type\": \"NorthwindModel.Region\"\n" +
      "}, \"RegionID\": 4, \"RegionDescription\": \"Southern                                          \", \"Territories\": { \"results\" : [ { \"Employees\" : { \"__deferred\" : { \"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Territories(\'29202\')/Employees\" } },\n" +
      "                      \"Region\" : { \"__deferred\" : { \"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Territories(\'29202\')/Region\" } },\n" +
      "                      \"RegionID\" : 4,\n" +
      "                      \"TerritoryDescription\" : \"Columbia                                          \",\n" +
      "                      \"TerritoryID\" : \"29202\",\n" +
      "                      \"__metadata\" : { \"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Territories(\'29202\')\",\n" +
      "                          \"type\" : \"NorthwindModel.Territory\",\n" +
      "                          \"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Territories(\'29202\')\"\n" +
      "                        }\n" +
      "                    },\n" +
      "                    { \"Employees\" : { \"__deferred\" : { \"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Territories(\'30346\')/Employees\" } },\n" +
      "                      \"Region\" : { \"__deferred\" : { \"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Territories(\'30346\')/Region\" } },\n" +
      "                      \"RegionID\" : 4,\n" +
      "                      \"TerritoryDescription\" : \"Atlanta                                           \",\n" +
      "                      \"TerritoryID\" : \"30346\",\n" +
      "                      \"__metadata\" : { \"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Territories(\'30346\')\",\n" +
      "                          \"type\" : \"NorthwindModel.Territory\",\n" +
      "                          \"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/Territories(\'30346\')\"\n" +
      "                        }\n" +
      "                    }\n" +
      "\n" +
      "                  ] }\n" +
      "}\n" +
      "]\n" +
      "}\n" +
      "}";

      var sFaultTolerance1 = "<feed xml:base=\"http://services.odata.org/V3/Northwind/Northwind.svc/\" xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">\n" +
          "<m:count>3</m:count>\n" +
          "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Orders</id>\n" +
          "<title type=\"text\">Orders</title>\n" +
          "<updated>2014-11-06T10:17:18Z</updated>\n" +
          "<link rel=\"self\" title=\"Orders\" href=\"Orders\"/>\n" +
          "<entry>\n" +
          "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Orders(10248)</id>\n" +
          "<category term=\"NorthwindModel.Order\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
          "<link rel=\"edit\" title=\"Order\" href=\"Orders(10248)\"/>\n" +
          "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Customer\" type=\"application/atom+xml;type=entry\" title=\"Customer\" href=\"Orders(10248)/Customer\"/>\n" +
          "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee\" type=\"application/atom+xml;type=entry\" title=\"Employee\" href=\"Orders(10248)/Employee\"/>\n" +
          "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Orders(10248)/Order_Details\"/>\n" +
          "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Shipper\" type=\"application/atom+xml;type=entry\" title=\"Shipper\" href=\"Orders(10248)/Shipper\"/>\n" +
          "<title/>\n" +
          "<updated>2014-11-06T10:17:18Z</updated>\n" +
          "<author>\n" +
          "<name/>\n" +
          "</author>\n" +
          "<content type=\"application/xml\">\n" +
          "<m:properties>\n" +
          "<d:OrderID m:type=\"Edm.Int32\">10248</d:OrderID>\n" +
          "<d:CustomerID>VINET</d:CustomerID>\n" +
          "<d:EmployeeID m:type=\"Edm.Int32\">5</d:EmployeeID>\n" +
          "<d:OrderDate m:type=\"Edm.DateTime\">1996-07-04T00:00:00</d:OrderDate>\n" +
          "<d:RequiredDate m:type=\"Edm.DateTime\">1996-08-01T00:00:00</d:RequiredDate>\n" +
          "<d:ShippedDate m:type=\"Edm.DateTime\">1996-07-16T00:00:00</d:ShippedDate>\n" +
          "<d:ShipVia m:type=\"Edm.Int32\">3</d:ShipVia>\n" +
          "<d:Freight m:type=\"Edm.Decimal\">32.3800</d:Freight>\n" +
          "<d:ShipName>Vins et alcools Chevalier</d:ShipName>\n" +
          "<d:ShipAddress>59 rue de l\'Abbaye</d:ShipAddress>\n" +
          "<d:ShipCity>TEST_FAULT_TOLERANCE</d:ShipCity>\n" +
          "<d:ShipRegion m:null=\"true\"/>\n" +
          "<d:ShipPostalCode>51100</d:ShipPostalCode>\n" +
          "<d:ShipCountry>France</d:ShipCountry>\n" +
          "</m:properties>\n" +
          "</content>\n" +
          "</entry>\n" +
          "<entry>\n" +
          "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Orders(10249)</id>\n" +
          "<category term=\"NorthwindModel.Order\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
          "<link rel=\"edit\" title=\"Order\" href=\"Orders(10249)\"/>\n" +
          "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Customer\" type=\"application/atom+xml;type=entry\" title=\"Customer\" href=\"Orders(10249)/Customer\"/>\n" +
          "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Employee\" type=\"application/atom+xml;type=entry\" title=\"Employee\" href=\"Orders(10249)/Employee\"/>\n" +
          "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Orders(10249)/Order_Details\"/>\n" +
          "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Shipper\" type=\"application/atom+xml;type=entry\" title=\"Shipper\" href=\"Orders(10249)/Shipper\"/>\n" +
          "<title/>\n" +
          "<updated>2014-11-06T10:17:18Z</updated>\n" +
          "<author>\n" +
          "<name/>\n" +
          "</author>\n" +
          "<content type=\"application/xml\">\n" +
          "<m:properties>\n" +
          "<d:OrderID m:type=\"Edm.Int32\">10249</d:OrderID>\n" +
          "<d:CustomerID>TOMSP</d:CustomerID>\n" +
          "<d:EmployeeID m:type=\"Edm.Int32\">6</d:EmployeeID>\n" +
          "<d:OrderDate m:type=\"Edm.DateTime\">1996-07-05T00:00:00</d:OrderDate>\n" +
          "<d:RequiredDate m:type=\"Edm.DateTime\">1996-08-16T00:00:00</d:RequiredDate>\n" +
          "<d:ShippedDate m:type=\"Edm.DateTime\">1996-07-10T00:00:00</d:ShippedDate>\n" +
          "<d:ShipVia m:type=\"Edm.Int32\">1</d:ShipVia>\n" +
          "<d:Freight m:type=\"Edm.Decimal\">11.6100</d:Freight>\n" +
          "<d:ShipName>Toms Spezialitäten</d:ShipName>\n" +
          "<d:ShipAddress>Luisenstr. 48</d:ShipAddress>\n" +
          "<d:ShipCity>TEST_FAULT_TOLERANCE</d:ShipCity>\n" +
          "<d:ShipRegion m:null=\"true\"/>\n" +
          "<d:ShipPostalCode>44087</d:ShipPostalCode>\n" +
          "<d:ShipCountry>Germany</d:ShipCountry>\n" +
          "</m:properties>\n" +
          "</content>\n" +
          "</entry>\n" +
          "</feed>";

      var sFaultTolerance2 = "<feed xml:base=\"http://services.odata.org/V3/Northwind/Northwind.svc/\" xmlns=\"http://www.w3.org/2005/Atom\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\">\n" +
          "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Orders</id>\n" +
          "<title type=\"text\">Orders</title>\n" +
          "<updated>2014-11-06T09:34:54Z</updated>\n" +
          "<link href=\"Orders\" rel=\"self\" title=\"Orders\"/>\n" +
          "<m:count>3</m:count>\n" +
          "<link rel=\"next\" href=\"Orders?$top=1&amp;$filter=ShipCity%20eq%20%27TEST_FAULT_TOLERANCE%27&amp;$inlinecount=allpages&amp;$skiptoken=MISSING_DATA_FROM__1\"/>\n" +
          "</feed>";
      var sMetaData1 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
          "<edmx:Edmx xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\"\n" +
          "	xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\n" +
          "	xmlns:sap=\"http://www.sap.com/Protocols/SAPData\" Version=\"1.0\">\n" +
          "	<edmx:Reference xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\"\n" +
          "		Uri=\"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_COMMON\',Version=\'0001\',SAP__Origin=\'ER3_200\')/$value\">\n" +
          "		<edmx:Include Namespace=\"com.sap.vocabularies.Common.v1\"\n" +
          "			Alias=\"Common\" />\n" +
          "	</edmx:Reference>\n" +
          "	<edmx:Reference xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\"\n" +
          "		Uri=\"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_UI\',Version=\'0001\',SAP__Origin=\'ER3_200\')/$value\">\n" +
          "		<edmx:Include Namespace=\"com.sap.vocabularies.UI.v1\"\n" +
          "			Alias=\"UI\" />\n" +
          "	</edmx:Reference>\n" +
          "	<edmx:DataServices m:DataServiceVersion=\"2.0\">\n" +
          "		<Schema xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\"\n" +
          "			Namespace=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV\" xml:lang=\"en\"\n" +
          "			sap:schema-version=\"0\">\n" +
          "			<EntityType Name=\"UpdatableItem\" sap:label=\"UpdatableItem\"\n" +
          "				sap:content-version=\"1\">\n" +
          "				<Key>\n" +
          "					<PropertyRef Name=\"CompanyCode\" />\n" +
          "					<PropertyRef Name=\"AccountingDocument\" />\n" +
          "					<PropertyRef Name=\"FiscalYear\" />\n" +
          "					<PropertyRef Name=\"AccountingDocumentItem\" />\n" +
          "				</Key>\n" +
          "				<Property Name=\"CompanyCode\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"4\" sap:label=\"Company Code\" sap:creatable=\"false\"\n" +
          "					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"AccountingDocument\" Type=\"Edm.String\"\n" +
          "					Nullable=\"false\" MaxLength=\"10\" sap:label=\"Document Number\"\n" +
          "					sap:creatable=\"false\" sap:updatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "				<Property Name=\"FiscalYear\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"4\" sap:label=\"Fiscal Year\" sap:creatable=\"false\"\n" +
          "					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"AccountingDocumentItem\" Type=\"Edm.String\"\n" +
          "					Nullable=\"false\" MaxLength=\"3\" sap:label=\"Line item\" sap:creatable=\"false\"\n" +
          "					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"DunningBlockingReasonCode\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:label=\"Dunning Block\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"PaymentBlockingReasonCode\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:label=\"Item Payment Block\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"DueCalculationBaseDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:label=\"Baseline Date\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"CashDiscount1Days\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"3\" Scale=\"0\" sap:label=\"Days 1\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"CashDiscount1Percent\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"5\" Scale=\"3\" sap:label=\"Disc. Percent 1\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"CashDiscount2Days\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"3\" Scale=\"0\" sap:label=\"Days 2\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"CashDiscount2Percent\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"5\" Scale=\"3\" sap:label=\"Disc. Percent 2\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"NetPaymentDays\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"3\" Scale=\"0\" sap:label=\"Days net\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"PaymentMethod\" Type=\"Edm.String\" MaxLength=\"1\"\n" +
          "					sap:label=\"Payment Method\" sap:creatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "				<Property Name=\"DunningArea\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
          "					sap:label=\"Dunning Area\" sap:creatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "				<Property Name=\"LastDunningDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:label=\"Last Dunned\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"DunningLevel\" Type=\"Edm.String\" MaxLength=\"1\"\n" +
          "					sap:label=\"Dunning Level\" sap:creatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "				<Property Name=\"MaximumDunningLevel\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:label=\"Dunning Key\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"AssignmentReference\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"18\" sap:label=\"Assignment\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"DocumentItemText\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"50\" sap:label=\"Text\" sap:creatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "				<Property Name=\"FinancialAccountType\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:label=\"Account Type\" sap:creatable=\"false\"\n" +
          "					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"SpecialGeneralLedgerCode\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:label=\"Special G/L ind\" sap:creatable=\"false\"\n" +
          "					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"PostingKey\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
          "					sap:label=\"Posting Key\" sap:creatable=\"false\" sap:updatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"AccountingDocumentCategory\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:label=\"Doc.status\" sap:creatable=\"false\"\n" +
          "					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"TaxCode\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
          "					sap:label=\"Tax Code\" sap:creatable=\"false\" sap:updatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"Note\" Type=\"Edm.String\" sap:label=\"Note\"\n" +
          "					sap:creatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"Title\" Type=\"Edm.String\" MaxLength=\"50\"\n" +
          "					sap:label=\"Title\" sap:creatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "			</EntityType>\n" +
          "			<EntityType Name=\"Item\" sap:service-schema-version=\"1\"\n" +
          "				sap:service-version=\"1\" sap:label=\"Item\" sap:semantics=\"aggregate\"\n" +
          "				sap:content-version=\"1\">\n" +
          "				<Key>\n" +
          "					<PropertyRef Name=\"GeneratedID\" />\n" +
          "				</Key>\n" +
          "				<Property Name=\"CashDiscountAmountInTransactionCurrency\"\n" +
          "					Type=\"Edm.Decimal\" Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" +
          "					sap:label=\"Discount (Doc. Crcy)\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"ValuatedAmntInAdditionalCrcy1\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"AdditionalCurrency1\"\n" +
          "					sap:label=\"LC2 Evaluated Amount\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"ValuatedAmntInAdditionalCrcy2\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"AdditionalCurrency2\"\n" +
          "					sap:label=\"LC3 Evaluated Amount\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"ValuatedAmountInCompanyCodeCurrency\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"CompanyCodeCurrency\"\n" +
          "					sap:label=\"LC Evaluated Amount\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AmountInAdditionalCurrency1\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"AdditionalCurrency1\"\n" +
          "					sap:label=\"LC2 Amount\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AmountInAdditionalCurrency2\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"AdditionalCurrency2\"\n" +
          "					sap:label=\"LC3 Amount\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"BalancedAmountInCompanyCodeCurrency\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"CompanyCodeCurrency\"\n" +
          "					sap:label=\"Amnt in LC (no sign)\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AmountInCompanyCodeCurrency\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"CompanyCodeCurrency\"\n" +
          "					sap:label=\"Amount in LC\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"PlannedAmountInTransactionCurrency\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" +
          "					sap:label=\"Planned Amount\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"BilledRevenueAmountInCompanyCodeCurrency\"\n" +
          "					Type=\"Edm.Decimal\" Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"CompanyCodeCurrency\"\n" +
          "					sap:label=\"Billed Revenue\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AmountInBalanceTransactionCurrency\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"BalanceTransactionCurrency\"\n" +
          "					sap:label=\"G/L Update Amount\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AmountInPaymentCurrency\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"PaymentCurrency\"\n" +
          "					sap:label=\"Pymt Currency Amnt\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"WithholdingTaxAmount\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" +
          "					sap:label=\"Withholding Tax\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"WithholdingTaxExemptionAmount\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" +
          "					sap:label=\"Withhold. Tax Exempt\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"WithholdingTaxBaseAmount\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" +
          "					sap:label=\"Withholding Tax Base\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashDiscountBaseAmount\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" +
          "					sap:label=\"Cash Discount Base\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashDiscountAmtInCompanyCodeCrcy\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" +
          "					sap:label=\"Discount (Loc. Crcy)\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AmountInTransactionCurrency\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" +
          "					sap:label=\"Amount in FC\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashDiscountAmount\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" +
          "					sap:label=\"Discount Amount\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"HedgedAmount\" Type=\"Edm.Decimal\" Precision=\"24\"\n" +
          "					Scale=\"3\" sap:aggregation-role=\"measure\" sap:display-format=\"UpperCase\"\n" +
          "					sap:unit=\"TransactionCurrency\" sap:label=\"Hedged Amount\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "				<Property Name=\"InterestToBePosted\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"16\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" +
          "					sap:display-format=\"UpperCase\" sap:unit=\"CompanyCodeCurrency\"\n" +
          "					sap:label=\"Imputed Interest\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashDiscount1ArrearsDays\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"5\" Scale=\"0\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:display-format=\"UpperCase\" sap:label=\"Disc.1 Arrears\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "				<Property Name=\"NetDueArrearsDays\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"5\" Scale=\"0\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:display-format=\"UpperCase\" sap:label=\"Net Arrears\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashDiscount1Percent\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"5\" Scale=\"3\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:display-format=\"UpperCase\" sap:label=\"Disc. Percent 1\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashDiscount2Percent\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"5\" Scale=\"3\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:display-format=\"UpperCase\" sap:label=\"Disc. Percent 2\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashDiscount1Days\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"3\" Scale=\"0\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:display-format=\"UpperCase\" sap:label=\"Cash Discount Days 1\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashDiscount2Days\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"3\" Scale=\"0\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:display-format=\"UpperCase\" sap:label=\"Cash Discount Days 2\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "				<Property Name=\"NetPaymentDays\" Type=\"Edm.Decimal\"\n" +
          "					Precision=\"3\" Scale=\"0\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:display-format=\"UpperCase\" sap:label=\"Days Net\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"ReconciliationAccount\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Recon. Account\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"MasterFixedAsset\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"12\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Main Asset No.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"FixedAsset\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Subnumber\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"Order\" Type=\"Edm.String\" MaxLength=\"12\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Order\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"ClearingAccountingDocument\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Clearing Doc. No.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"ClearingDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Clearing Date\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"ClearingDocFiscalYear\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Clrg Fiscal Yr\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"ClearingStatus\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Clearing Status\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AuthorizationGroup\" Type=\"Edm.String\"\n" +
          "					Nullable=\"false\" MaxLength=\"4\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:display-format=\"UpperCase\" sap:label=\"Authorization\"\n" +
          "					sap:creatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"AccountingDocument\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Document Number\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AccountingDocumentType\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Document Type\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DocumentDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Document Date\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"BooleanParameter\" Type=\"Edm.String\"\n" +
          "					Nullable=\"false\" MaxLength=\"5\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:label=\"for internal use only\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"Industry\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:text=\"IndustryName\" sap:label=\"Industry\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IndustryName\" Type=\"Edm.String\" MaxLength=\"20\"\n" +
          "					sap:label=\"Industry Name\" sap:creatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "				<Property Name=\"PostingKey\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Posting Key\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AccountingDocumentCategory\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Document Status\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"PostingDate\" Type=\"Edm.DateTime\" Precision=\"0\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Posting Date\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CompanyCode\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:text=\"CompanyName\" sap:label=\"Company Code\" sap:creatable=\"false\"\n" +
          "					sap:required-in-filter=\"true\" />\n" +
          "				<Property Name=\"BusinessPlace\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Business Place\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AccountingClerk\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Acctg Clerk\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CompanyName\" Type=\"Edm.String\" MaxLength=\"25\"\n" +
          "					sap:label=\"Company Name\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AccountingDocumentItem\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"3\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Line Item\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"PaymentCardsSettlementRun\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Settlement\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsAccountsReceivablePledged\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"AR Pledging\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AccountingDocumentCreationDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Entered On\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"SettlementReferenceDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Reference Date\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TuningParameter1\" Type=\"Edm.String\"\n" +
          "					Nullable=\"false\" MaxLength=\"40\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:label=\"for internal use only\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"DataExchangeInstruction1\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Instruction 1\" sap:creatable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"DataExchangeInstruction2\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Instruction 2\" sap:creatable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"DataExchangeInstruction3\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Instruction 3\" sap:creatable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"DataExchangeInstruction4\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Instruction 4\" sap:creatable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"PurchasingDocument\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Purchasing Document\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"PurchasingDocumentItem\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Purchasing Doc. Item\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AccountCreationDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Created on\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AccountCreatedByUser\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"12\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Created by\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DeliveryScheduleLine\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Schedule Line\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"BranchAccount\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Branch Account No.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"FundsManagementCenter\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"16\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Funds Center\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"GeneratedID\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"FiscalYear\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Fiscal Year\" sap:creatable=\"false\"\n" +
          "					sap:required-in-filter=\"true\" />\n" +
          "				<Property Name=\"BusinessArea\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Business Area\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"HouseBank\" Type=\"Edm.String\" MaxLength=\"5\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"House Bank\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"GeneralLedgerAccount\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"G/L Account\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AdditionalCurrency1\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Local Currency 2\" sap:creatable=\"false\" sap:semantics=\"currency-code\" />\n" +
          "				<Property Name=\"AdditionalCurrency2\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Local Currency 3\" sap:creatable=\"false\" sap:semantics=\"currency-code\" />\n" +
          "				<Property Name=\"CompanyCodeCurrency\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Local Currency\" sap:creatable=\"false\" sap:semantics=\"currency-code\" />\n" +
          "				<Property Name=\"RealEstateObject\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"8\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Real Estate Key\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TuningParameter2\" Type=\"Edm.String\"\n" +
          "					Nullable=\"false\" MaxLength=\"40\" sap:aggregation-role=\"dimension\"\n" +
          "					sap:label=\"for internal use only\" sap:creatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"FiscalYearPeriod\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"7\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Year/Period\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"KeyDate\" Type=\"Edm.DateTime\" Precision=\"0\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Open at Key Date\" sap:creatable=\"false\" sap:sortable=\"false\" />\n" +
          "				<Property Name=\"PaymentReference\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"30\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Payment Reference\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CreditControlArea\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Credit Control Area\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AlternativePayeeAccount\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Alternative Payer\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"HeadOffice\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Head Office\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"FinancialAccountType\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Account Type\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CustomerVendorAccount\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Account Number\" sap:creatable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"CorporateGroup\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Corporate Group\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CostCenter\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Cost Center\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CustomerAccountName\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Account Group\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"Customer\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:text=\"CustomerName\" sap:label=\"Customer\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"EffectiveExchangeRate\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"12\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Effect. Exch. Rate\" sap:creatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "				<Property Name=\"AccountMemo\" Type=\"Edm.String\" MaxLength=\"30\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:visible=\"false\" sap:label=\"Account Memo\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CustomerCountry\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"3\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Country\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsMarkedForDeletion\" Type=\"Edm.Boolean\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Delete\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DunningArea\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Dunning Area\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"LastDunningDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Last Dunned\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DunningBlockingReasonCode\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Dunning Block\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DunningLevel\" Type=\"Edm.String\" MaxLength=\"1\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Dunning Level\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"FiscalPeriod\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Period\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"MaximumDunningLevel\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Dunning Key\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TaxCode\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Sales/Purchases Tax\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CustomerName\" Type=\"Edm.String\" MaxLength=\"35\"\n" +
          "					sap:label=\"Customer Name\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"NetDueDate\" Type=\"Edm.DateTime\" Precision=\"0\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Due on\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CityName\" Type=\"Edm.String\" MaxLength=\"25\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:label=\"City\" sap:creatable=\"false\"\n" +
          "					sap:semantics=\"city\" />\n" +
          "				<Property Name=\"POBox\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"PO Box\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"SalesDocumentItem\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"6\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Item No.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"ProfitCenter\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Profit Center\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"WorkBreakdownStructureElement\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"24\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"WBS Element\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"POBoxPostalCode\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"PO Box Postal Code\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"PostalCode\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Postal Code\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"BalanceTransactionCurrency\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"G/L Currency\" sap:creatable=\"false\" sap:semantics=\"currency-code\" />\n" +
          "				<Property Name=\"PaymentCurrency\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Autom. Pymt Currency\" sap:creatable=\"false\"\n" +
          "					sap:semantics=\"currency-code\" />\n" +
          "				<Property Name=\"InvoiceReference\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Invoice Reference\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"FollowOnDocumentType\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Follow-On Doc.Type\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"Region\" Type=\"Edm.String\" MaxLength=\"3\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:text=\"RegionName\" sap:label=\"Region\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"RegionName\" Type=\"Edm.String\" MaxLength=\"25\"\n" +
          "					sap:label=\"Region Name\" sap:creatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "				<Property Name=\"PaymentCardItem\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"3\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Payment Card Item\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"PaymentDifferenceReason\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"3\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Reason Code\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"InvoiceList\" Type=\"Edm.String\" MaxLength=\"8\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Coll. Inv. List No.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TaxSection\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Section Code\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DocumentItemText\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"50\" sap:aggregation-role=\"dimension\" sap:label=\"Item Text\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DebitCreditCode\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Debit/Credit\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashDisount1DueDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Cash Disc 1 Due Date\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"SortKey\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Search Term\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CustomerIsBlockedForPosting\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Phys.Invent. Blocked\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TaxID1\" Type=\"Edm.String\" MaxLength=\"16\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Tax Number 1\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TaxID2\" Type=\"Edm.String\" MaxLength=\"11\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Tax Number 2\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"VATRegistration\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"20\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"VAT Registration No.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"HasClearingAccountingDocument\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Item Status\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DueNetSymbol\" Type=\"Edm.String\" MaxLength=\"1\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Due Net (Symbol)\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashDateDueNetSymbol\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Cash Date 1 Due\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AccountingDocumentTextCategory\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Text ID\" sap:creatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "				<Property Name=\"ToleranceGroup\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Tolerance Group\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TaxJurisdiction\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"15\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Tax Jur.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DueItemCategory\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:label=\"Due Item Category\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "				<Property Name=\"SpecialGeneralLedgerTransactionType\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"SG Transaction Type\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"SpecialGeneralLedgerCode\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Special G/L ind\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"PaymentMethodSupplement\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Pymnt Methd Supplemt\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"ValueDate\" Type=\"Edm.DateTime\" Precision=\"0\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Value Date\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"SalesDocument\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Sales Document\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"BillingDocument\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"SD Document No.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CashFlowType\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Flow Type\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TradingPartnerCompanyID\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"6\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Company ID\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AssetContract\" Type=\"Edm.String\" MaxLength=\"13\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Contract Number\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TreasuryContractType\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Contract Type\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"InterestCalculationCode\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Interest Indic.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TransactionCurrency\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Currency\" sap:creatable=\"false\" sap:semantics=\"currency-code\" />\n" +
          "				<Property Name=\"Plant\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Plant\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"BillOfExchangeUsage\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"BoE Usage\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DocumentArchivedIndiator\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Archived\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsCleared\" Type=\"Edm.String\" MaxLength=\"1\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Item Cleared\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DocumentReferenceID\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"16\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Reference\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsOneTimeAccount\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"One-Time Account\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsCashDiscount1Due\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Cash Disc 1 Due Ind\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsDueNet\" Type=\"Edm.String\" MaxLength=\"1\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Due Net Indicator\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsPaytAdviceSentByEDI\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Pmt Adv. by EDI\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsNegativePosting\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Negative Posting\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsSinglePayment\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Individual Payment\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"HasPaymentOrder\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Payment Sent\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsClearingReversed\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Reverse Clearing\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"Reference1IDByBusinessPartner\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"12\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Reference Key 1\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"Reference2IDByBusinessPartner\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"12\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Reference Key 2\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"Reference3IDByBusinessPartner\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"20\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Reference Key 3\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsDisputed\" Type=\"Edm.String\" MaxLength=\"1\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Disputed Item\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"HasText\" Type=\"Edm.String\" MaxLength=\"1\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Text Exists\" sap:creatable=\"false\" sap:sortable=\"false\"\n" +
          "					sap:filterable=\"false\" />\n" +
          "				<Property Name=\"IsSalesRelated\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Sales-Related Item\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IsUsedInPaymentTransaction\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Pymt Tran.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AlternativePayerIsAllowed\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Payee in Doc.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"CustomerPaymentBlockingReason\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Cust. Payment Block\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"FixedCashDiscount\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Fixed Payment Terms\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"DueCalculationBaseDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Baseline Date\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"InterestCalculationDate\" Type=\"Edm.DateTime\"\n" +
          "					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" +
          "					sap:label=\"Int. Last Calculated\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"IntrstCalcFrequencyInMonths\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Interest Calc. Freq.\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"PaymentMethod\" Type=\"Edm.String\" MaxLength=\"1\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Payment Method\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"PaymentBlockingReason\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Item Payment Block\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"TargetTaxCode\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Target Tax Code\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"PaymentTerms\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
          "					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" +
          "					sap:label=\"Payment Terms\" sap:creatable=\"false\" />\n" +
          "				<Property Name=\"AssignmentReference\" Type=\"Edm.String\"\n" +
          "					MaxLength=\"18\" sap:aggregation-role=\"dimension\" sap:label=\"Assignment\"\n" +
          "					sap:creatable=\"false\" />\n" +
          "			</EntityType>\n" +
          "			<EntityType Name=\"Customer\" sap:content-version=\"1\">\n" +
          "				<Key>\n" +
          "					<PropertyRef Name=\"CustomerId\" />\n" +
          "				</Key>\n" +
          "				<Property Name=\"Country\" Type=\"Edm.String\" MaxLength=\"3\"\n" +
          "					sap:label=\"Country\" sap:creatable=\"false\" sap:updatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" sap:semantics=\"country\" />\n" +
          "				<Property Name=\"CustomerName\" Type=\"Edm.String\" MaxLength=\"35\"\n" +
          "					sap:label=\"Customer Name\" sap:creatable=\"false\" sap:updatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"CustomerId\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"10\" sap:text=\"CustomerName\" sap:label=\"Customer\"\n" +
          "					sap:creatable=\"false\" sap:updatable=\"false\" />\n" +
          "				<Property Name=\"AddressNumber\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
          "					sap:label=\"Address Number\" sap:creatable=\"false\" sap:updatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "				<Property Name=\"Address\" Type=\"Edm.String\" MaxLength=\"80\"\n" +
          "					sap:label=\"Address Long\" sap:creatable=\"false\" sap:updatable=\"false\"\n" +
          "					sap:sortable=\"false\" sap:filterable=\"false\" />\n" +
          "			</EntityType>\n" +
          "			<EntityContainer Name=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV_Entities\"\n" +
          "				m:IsDefaultEntityContainer=\"true\" sap:supported-formats=\"atom json xlsx\">\n" +
          "				<EntitySet Name=\"UpdatableItems\"\n" +
          "					EntityType=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.UpdatableItem\" sap:label=\"Updatable Item\"\n" +
          "					sap:creatable=\"false\" sap:deletable=\"false\" sap:pageable=\"false\"\n" +
          "					sap:addressable=\"false\" sap:content-version=\"1\" />\n" +
          "				<EntitySet Name=\"Items\" EntityType=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Item\"\n" +
          "					sap:label=\"Item\" sap:creatable=\"false\" sap:deletable=\"false\"\n" +
          "					sap:pageable=\"false\" sap:addressable=\"false\" sap:content-version=\"1\" />\n" +
          "				<EntitySet Name=\"Customers\" EntityType=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Customer\"\n" +
          "					sap:label=\"Customers\" sap:creatable=\"false\" sap:deletable=\"false\"\n" +
          "					sap:pageable=\"false\" sap:content-version=\"1\" />\n" +
          "			</EntityContainer>\n" +
          "		</Schema>\n" +
          "	</edmx:DataServices>\n" +
          "</edmx:Edmx>";
      var sMetaData2 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
          "<edmx:Edmx xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\"\n" +
          "	xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\n" +
          "	xmlns:sap=\"http://www.sap.com/Protocols/SAPData\" Version=\"1.0\">\n" +
          "	<edmx:Reference xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\"\n" +
          "		Uri=\"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_COMMON\',Version=\'0001\',SAP__Origin=\'ER3_200\')/$value\">\n" +
          "		<edmx:Include Namespace=\"com.sap.vocabularies.Common.v1\"\n" +
          "			Alias=\"Common\" />\n" +
          "	</edmx:Reference>\n" +
          "	<edmx:Reference xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\"\n" +
          "		Uri=\"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_UI\',Version=\'0001\',SAP__Origin=\'ER3_200\')/$value\">\n" +
          "		<edmx:Include Namespace=\"com.sap.vocabularies.UI.v1\"\n" +
          "			Alias=\"UI\" />\n" +
          "	</edmx:Reference>\n" +
          "	<edmx:DataServices m:DataServiceVersion=\"2.0\">\n" +
          "		<Schema xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\"\n" +
          "			Namespace=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV\" xml:lang=\"en\"\n" +
          "			sap:schema-version=\"0\">\n" +
          "			<EntityType Name=\"VL_CH_ANLH\" sap:content-version=\"1\">\n" +
          "				<Key>\n" +
          "					<PropertyRef Name=\"BUKRS\" />\n" +
          "					<PropertyRef Name=\"ANLN1\" />\n" +
          "				</Key>\n" +
          "				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" +
          "				<Property Name=\"ANLN1\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"12\" sap:display-format=\"UpperCase\" sap:label=\"Main Asset No.\" />\n" +
          "			</EntityType>\n" +
          "			<EntityType Name=\"VL_CH_ANLA\" sap:content-version=\"1\">\n" +
          "				<Key>\n" +
          "					<PropertyRef Name=\"BUKRS\" />\n" +
          "					<PropertyRef Name=\"ANLN1\" />\n" +
          "					<PropertyRef Name=\"ANLN2\" />\n" +
          "				</Key>\n" +
          "				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" +
          "				<Property Name=\"ANLN1\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"12\" sap:display-format=\"UpperCase\" sap:label=\"Main Asset No.\" />\n" +
          "				<Property Name=\"ANLN2\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Subnumber\" />\n" +
          "			</EntityType>\n" +
          "			<EntityContainer Name=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV_Entities\"\n" +
          "				m:IsDefaultEntityContainer=\"true\" sap:supported-formats=\"atom json xlsx\">\n" +
          "				<EntitySet Name=\"VL_CH_ANLA\" EntityType=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.VL_CH_ANLA\"\n" +
          "					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" +
          "					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" +
          "			</EntityContainer>\n" +
          "			<Annotations xmlns=\"http://docs.oasis-open.org/odata/ns/edm\"\n" +
          "				Target=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Item/BooleanParameter\">\n" +
          "				<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\n" +
          "					<Record>\n" +
          "						<PropertyValue Property=\"Label\" String=\"boolean true/false\" />\n" +
          "						<PropertyValue Property=\"CollectionPath\" String=\"VL_FV_FARP_BOOLEAN\" />\n" +
          "						<PropertyValue Property=\"Parameters\">\n" +
          "							<Collection>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"BooleanParameter\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"Code\" />\n" +
          "								</Record>\n" +
          "								<Record\n" +
          "									Type=\"com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly\">\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"Text\" />\n" +
          "								</Record>\n" +
          "							</Collection>\n" +
          "						</PropertyValue>\n" +
          "					</Record>\n" +
          "				</Annotation>\n" +
          "			</Annotations>\n" +
          "			<Annotations xmlns=\"http://docs.oasis-open.org/odata/ns/edm\"\n" +
          "				Target=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Item/Industry\">\n" +
          "				<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\n" +
          "					<Record>\n" +
          "						<PropertyValue Property=\"Label\" String=\"&quot;Industry Texts&quot;\" />\n" +
          "						<PropertyValue Property=\"CollectionPath\" String=\"VL_SH_H_T016\" />\n" +
          "						<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\n" +
          "						<PropertyValue Property=\"Parameters\">\n" +
          "							<Collection>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"Industry\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"BRSCH\" />\n" +
          "								</Record>\n" +
          "								<Record\n" +
          "									Type=\"com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly\">\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"BRTXT\" />\n" +
          "								</Record>\n" +
          "							</Collection>\n" +
          "						</PropertyValue>\n" +
          "					</Record>\n" +
          "				</Annotation>\n" +
          "			</Annotations>\n" +
          "			<Annotations xmlns=\"http://docs.oasis-open.org/odata/ns/edm\"\n" +
          "				Target=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Item/PostingKey\">\n" +
          "				<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\n" +
          "					<Record>\n" +
          "						<PropertyValue Property=\"Label\" String=\"Help_View for TBSL\" />\n" +
          "						<PropertyValue Property=\"CollectionPath\" String=\"VL_SH_H_TBSL\" />\n" +
          "						<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\n" +
          "						<PropertyValue Property=\"Parameters\">\n" +
          "							<Collection>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"PostingKey\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"BSCHL\" />\n" +
          "								</Record>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"FinancialAccountType\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"KOART\" />\n" +
          "								</Record>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"DebitCreditCode\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"SHKZG\" />\n" +
          "								</Record>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"IndustryName\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"LTEXT\" />\n" +
          "								</Record>\n" +
          "							</Collection>\n" +
          "						</PropertyValue>\n" +
          "					</Record>\n" +
          "				</Annotation>\n" +
          "			</Annotations>\n" +
          "			<atom:link xmlns:atom=\"http://www.w3.org/2005/Atom\" rel=\"self\"\n" +
          "				href=\"/sap/opu/odata/sap/ZFAR_CUSTOMER_LINE_ITEMS2_SRV/$metadata\" />\n" +
          "			<atom:link xmlns:atom=\"http://www.w3.org/2005/Atom\" rel=\"latest-version\"\n" +
          "				href=\"/sap/opu/odata/sap/ZFAR_CUSTOMER_LINE_ITEMS2_SRV/$metadata\" />\n" +
          "			<atom:link xmlns:atom=\"http://www.w3.org/2005/Atom\" rel=\"self\"\n" +
          "				href=\"/sap/opu/odata/sap/ZFAR_CUSTOMER_LINE_ITEMS2_SRV/$metadata\" />\n" +
          "			<atom:link xmlns:atom=\"http://www.w3.org/2005/Atom\" rel=\"latest-version\"\n" +
          "				href=\"/sap/opu/odata/sap/ZFAR_CUSTOMER_LINE_ITEMS2_SRV/$metadata\" />\n" +
          "		</Schema>\n" +
          "	</edmx:DataServices>\n" +
          "</edmx:Edmx>";
      var sMetaData3 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
          "<edmx:Edmx xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\"\n" +
          "	xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\n" +
          "	xmlns:sap=\"http://www.sap.com/Protocols/SAPData\" Version=\"1.0\">\n" +
          "	<edmx:Reference xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\"\n" +
          "		Uri=\"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_COMMON\',Version=\'0001\',SAP__Origin=\'ER3_200\')/$value\">\n" +
          "		<edmx:Include Namespace=\"com.sap.vocabularies.Common.v1\"\n" +
          "			Alias=\"Common\" />\n" +
          "	</edmx:Reference>\n" +
          "	<edmx:Reference xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\"\n" +
          "		Uri=\"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_UI\',Version=\'0001\',SAP__Origin=\'ER3_200\')/$value\">\n" +
          "		<edmx:Include Namespace=\"com.sap.vocabularies.UI.v1\"\n" +
          "			Alias=\"UI\" />\n" +
          "	</edmx:Reference>\n" +
          "	<edmx:DataServices m:DataServiceVersion=\"2.0\">\n" +
          "		<Schema xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\"\n" +
          "			Namespace=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV\" xml:lang=\"en\"\n" +
          "			sap:schema-version=\"0\">\n" +
          "			<EntityType Name=\"VL_CH_ANLH\" sap:content-version=\"1\">\n" +
          "				<Key>\n" +
          "					<PropertyRef Name=\"BUKRS\" />\n" +
          "					<PropertyRef Name=\"ANLN1\" />\n" +
          "				</Key>\n" +
          "				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" +
          "				<Property Name=\"ANLN1\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"12\" sap:display-format=\"UpperCase\" sap:label=\"Main Asset No.\" />\n" +
          "			</EntityType>\n" +
          "			<EntityType Name=\"VL_CH_ANLA\" sap:content-version=\"1\">\n" +
          "				<Key>\n" +
          "					<PropertyRef Name=\"BUKRS\" />\n" +
          "					<PropertyRef Name=\"ANLN1\" />\n" +
          "					<PropertyRef Name=\"ANLN2\" />\n" +
          "				</Key>\n" +
          "				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" +
          "				<Property Name=\"ANLN1\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"12\" sap:display-format=\"UpperCase\" sap:label=\"Main Asset No.\" />\n" +
          "				<Property Name=\"ANLN2\" Type=\"Edm.String\" Nullable=\"false\"\n" +
          "					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Subnumber\" />\n" +
          "			</EntityType>\n" +
          "			<EntityContainer Name=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV_Entities\"\n" +
          "				m:IsDefaultEntityContainer=\"true\" sap:supported-formats=\"atom json xlsx\">\n" +
          "				<EntitySet Name=\"VL_CH_ANLA\" EntityType=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.VL_CH_ANLA\"\n" +
          "					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" +
          "					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" +
          "			</EntityContainer>\n" +
          "			<Annotations xmlns=\"http://docs.oasis-open.org/odata/ns/edm\"\n" +
          "				Target=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Item/MyProp1\">\n" +
          "				<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\n" +
          "					<Record>\n" +
          "						<PropertyValue Property=\"Label\" String=\"boolean true/false\" />\n" +
          "						<PropertyValue Property=\"CollectionPath\" String=\"VL_FV_FARP_BOOLEAN\" />\n" +
          "						<PropertyValue Property=\"Parameters\">\n" +
          "							<Collection>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"BooleanParameter\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"Code\" />\n" +
          "								</Record>\n" +
          "								<Record\n" +
          "									Type=\"com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly\">\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"Text\" />\n" +
          "								</Record>\n" +
          "							</Collection>\n" +
          "						</PropertyValue>\n" +
          "					</Record>\n" +
          "				</Annotation>\n" +
          "			</Annotations>\n" +
          "			<Annotations xmlns=\"http://docs.oasis-open.org/odata/ns/edm\"\n" +
          "				Target=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Item/MyProp2\">\n" +
          "				<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\n" +
          "					<Record>\n" +
          "						<PropertyValue Property=\"Label\" String=\"&quot;Industry Texts&quot;\" />\n" +
          "						<PropertyValue Property=\"CollectionPath\" String=\"VL_SH_H_T016\" />\n" +
          "						<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\n" +
          "						<PropertyValue Property=\"Parameters\">\n" +
          "							<Collection>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"Industry\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"BRSCH\" />\n" +
          "								</Record>\n" +
          "								<Record\n" +
          "									Type=\"com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly\">\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"BRTXT\" />\n" +
          "								</Record>\n" +
          "							</Collection>\n" +
          "						</PropertyValue>\n" +
          "					</Record>\n" +
          "				</Annotation>\n" +
          "			</Annotations>\n" +
          "			<Annotations xmlns=\"http://docs.oasis-open.org/odata/ns/edm\"\n" +
          "				Target=\"ZFAR_CUSTOMER_LINE_ITEMS2_SRV.Item/MyProp3\">\n" +
          "				<Annotation Term=\"com.sap.vocabularies.Common.v1.ValueList\">\n" +
          "					<Record>\n" +
          "						<PropertyValue Property=\"Label\" String=\"Help_View for TBSL\" />\n" +
          "						<PropertyValue Property=\"CollectionPath\" String=\"VL_SH_H_TBSL\" />\n" +
          "						<PropertyValue Property=\"SearchSupported\" Bool=\"true\" />\n" +
          "						<PropertyValue Property=\"Parameters\">\n" +
          "							<Collection>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"PostingKey\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"BSCHL\" />\n" +
          "								</Record>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"FinancialAccountType\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"KOART\" />\n" +
          "								</Record>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"DebitCreditCode\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"SHKZG\" />\n" +
          "								</Record>\n" +
          "								<Record Type=\"com.sap.vocabularies.Common.v1.ValueListParameterInOut\">\n" +
          "									<PropertyValue Property=\"LocalDataProperty\"\n" +
          "										PropertyPath=\"IndustryName\" />\n" +
          "									<PropertyValue Property=\"ValueListProperty\"\n" +
          "										String=\"LTEXT\" />\n" +
          "								</Record>\n" +
          "							</Collection>\n" +
          "						</PropertyValue>\n" +
          "					</Record>\n" +
          "				</Annotation>\n" +
          "			</Annotations>\n" +
          "			<atom:link xmlns:atom=\"http://www.w3.org/2005/Atom\" rel=\"self\"\n" +
          "				href=\"/sap/opu/odata/sap/ZFAR_CUSTOMER_LINE_ITEMS2_SRV/$metadata\" />\n" +
          "			<atom:link xmlns:atom=\"http://www.w3.org/2005/Atom\" rel=\"latest-version\"\n" +
          "				href=\"/sap/opu/odata/sap/ZFAR_CUSTOMER_LINE_ITEMS2_SRV/$metadata\" />\n" +
          "			<atom:link xmlns:atom=\"http://www.w3.org/2005/Atom\" rel=\"self\"\n" +
          "				href=\"/sap/opu/odata/sap/ZFAR_CUSTOMER_LINE_ITEMS2_SRV/$metadata\" />\n" +
          "			<atom:link xmlns:atom=\"http://www.w3.org/2005/Atom\" rel=\"latest-version\"\n" +
          "				href=\"/sap/opu/odata/sap/ZFAR_CUSTOMER_LINE_ITEMS2_SRV/$metadata\" />\n" +
          "		</Schema>\n" +
          "	</edmx:DataServices>\n" +
          "</edmx:Edmx>";
  var sInvoicesJSON = "{\n" +
      "\"d\" : {\n" +
      "\"results\" : [\n" +
      "{\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Invoices(CustomerName=\'Alfreds%20Futterkiste\',Discount=0f,OrderID=10692,ProductID=63,ProductName=\'Vegie-spread\',Quantity=20,Salesperson=\'Margaret%20Peacock\',ShipperName=\'United%20Package\',UnitPrice=43.9000M)\", \"type\": \"NorthwindModel.Invoice\"\n" +
      "}, \"ShipName\": \"Alfred\'s Futterkiste\", \"ShipAddress\": \"Obere Str. 57\", \"ShipCity\": \"Berlin\", \"ShipRegion\": null, \"ShipPostalCode\": \"12209\", \"ShipCountry\": \"Germany\", \"CustomerID\": \"ALFKI\", \"CustomerName\": \"Alfreds Futterkiste\", \"Address\": \"Obere Str. 57\", \"City\": \"Berlin\", \"Region\": null, \"PostalCode\": \"12209\", \"Country\": \"Germany\", \"Salesperson\": \"Margaret Peacock\", \"OrderID\": 10692, \"OrderDate\": \"\\/Date(875836800000)\\/\", \"RequiredDate\": \"\\/Date(878256000000)\\/\", \"ShippedDate\": \"\\/Date(876700800000)\\/\", \"ShipperName\": \"United Package\", \"ProductID\": 63, \"ProductName\": \"Vegie-spread\", \"UnitPrice\": \"43.9000\", \"Quantity\": 20, \"Discount\": 0, \"ExtendedPrice\": \"878.0000\", \"Freight\": \"61.0200\"\n" +
      "}, {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Invoices(CustomerName=\'Alfreds%20Futterkiste\',Discount=0f,OrderID=10702,ProductID=3,ProductName=\'Aniseed%20Syrup\',Quantity=6,Salesperson=\'Margaret%20Peacock\',ShipperName=\'Speedy%20Express\',UnitPrice=10.0000M)\", \"type\": \"NorthwindModel.Invoice\"\n" +
      "}, \"ShipName\": \"Alfred\'s Futterkiste\", \"ShipAddress\": \"Obere Str. 57\", \"ShipCity\": \"Berlin\", \"ShipRegion\": null, \"ShipPostalCode\": \"12209\", \"ShipCountry\": \"Germany\", \"CustomerID\": \"ALFKI\", \"CustomerName\": \"Alfreds Futterkiste\", \"Address\": \"Obere Str. 57\", \"City\": \"Berlin\", \"Region\": null, \"PostalCode\": \"12209\", \"Country\": \"Germany\", \"Salesperson\": \"Margaret Peacock\", \"OrderID\": 10702, \"OrderDate\": \"\\/Date(876700800000)\\/\", \"RequiredDate\": \"\\/Date(880329600000)\\/\", \"ShippedDate\": \"\\/Date(877392000000)\\/\", \"ShipperName\": \"Speedy Express\", \"ProductID\": 3, \"ProductName\": \"Aniseed Syrup\", \"UnitPrice\": \"10.0000\", \"Quantity\": 6, \"Discount\": 0, \"ExtendedPrice\": \"60.0000\", \"Freight\": \"23.9400\"\n" +
      "}, {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Invoices(CustomerName=\'Alfreds%20Futterkiste\',Discount=0f,OrderID=10702,ProductID=76,ProductName=\'Lakkalik%C3%B6%C3%B6ri\',Quantity=15,Salesperson=\'Margaret%20Peacock\',ShipperName=\'Speedy%20Express\',UnitPrice=18.0000M)\", \"type\": \"NorthwindModel.Invoice\"\n" +
      "}, \"ShipName\": \"Alfred\'s Futterkiste\", \"ShipAddress\": \"Obere Str. 57\", \"ShipCity\": \"Berlin\", \"ShipRegion\": null, \"ShipPostalCode\": \"12209\", \"ShipCountry\": \"Germany\", \"CustomerID\": \"ALFKI\", \"CustomerName\": \"Alfreds Futterkiste\", \"Address\": \"Obere Str. 57\", \"City\": \"Berlin\", \"Region\": null, \"PostalCode\": \"12209\", \"Country\": \"Germany\", \"Salesperson\": \"Margaret Peacock\", \"OrderID\": 10702, \"OrderDate\": \"\\/Date(876700800000)\\/\", \"RequiredDate\": \"\\/Date(880329600000)\\/\", \"ShippedDate\": \"\\/Date(877392000000)\\/\", \"ShipperName\": \"Speedy Express\", \"ProductID\": 76, \"ProductName\": \"Lakkalik\\u00f6\\u00f6ri\", \"UnitPrice\": \"18.0000\", \"Quantity\": 15, \"Discount\": 0, \"ExtendedPrice\": \"270.0000\", \"Freight\": \"23.9400\"\n" +
      "}, {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Invoices(CustomerName=\'Alfreds%20Futterkiste\',Discount=0f,OrderID=10835,ProductID=59,ProductName=\'Raclette%20Courdavault\',Quantity=15,Salesperson=\'Nancy%20Davolio\',ShipperName=\'Federal%20Shipping\',UnitPrice=55.0000M)\", \"type\": \"NorthwindModel.Invoice\"\n" +
      "}, \"ShipName\": \"Alfred\'s Futterkiste\", \"ShipAddress\": \"Obere Str. 57\", \"ShipCity\": \"Berlin\", \"ShipRegion\": null, \"ShipPostalCode\": \"12209\", \"ShipCountry\": \"Germany\", \"CustomerID\": \"ALFKI\", \"CustomerName\": \"Alfreds Futterkiste\", \"Address\": \"Obere Str. 57\", \"City\": \"Berlin\", \"Region\": null, \"PostalCode\": \"12209\", \"Country\": \"Germany\", \"Salesperson\": \"Nancy Davolio\", \"OrderID\": 10835, \"OrderDate\": \"\\/Date(884822400000)\\/\", \"RequiredDate\": \"\\/Date(887241600000)\\/\", \"ShippedDate\": \"\\/Date(885340800000)\\/\", \"ShipperName\": \"Federal Shipping\", \"ProductID\": 59, \"ProductName\": \"Raclette Courdavault\", \"UnitPrice\": \"55.0000\", \"Quantity\": 15, \"Discount\": 0, \"ExtendedPrice\": \"825.0000\", \"Freight\": \"69.5300\"\n" +
      "}, {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Invoices(CustomerName=\'Alfreds%20Futterkiste\',Discount=0f,OrderID=10952,ProductID=28,ProductName=\'R%C3%B6ssle%20Sauerkraut\',Quantity=2,Salesperson=\'Nancy%20Davolio\',ShipperName=\'Speedy%20Express\',UnitPrice=45.6000M)\", \"type\": \"NorthwindModel.Invoice\"\n" +
      "}, \"ShipName\": \"Alfred\'s Futterkiste\", \"ShipAddress\": \"Obere Str. 57\", \"ShipCity\": \"Berlin\", \"ShipRegion\": null, \"ShipPostalCode\": \"12209\", \"ShipCountry\": \"Germany\", \"CustomerID\": \"ALFKI\", \"CustomerName\": \"Alfreds Futterkiste\", \"Address\": \"Obere Str. 57\", \"City\": \"Berlin\", \"Region\": null, \"PostalCode\": \"12209\", \"Country\": \"Germany\", \"Salesperson\": \"Nancy Davolio\", \"OrderID\": 10952, \"OrderDate\": \"\\/Date(890006400000)\\/\", \"RequiredDate\": \"\\/Date(893635200000)\\/\", \"ShippedDate\": \"\\/Date(890697600000)\\/\", \"ShipperName\": \"Speedy Express\", \"ProductID\": 28, \"ProductName\": \"R\\u00f6ssle Sauerkraut\", \"UnitPrice\": \"45.6000\", \"Quantity\": 2, \"Discount\": 0, \"ExtendedPrice\": \"91.2000\", \"Freight\": \"40.4200\"\n" +
      "}, {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Invoices(CustomerName=\'Alfreds%20Futterkiste\',Discount=0f,OrderID=11011,ProductID=71,ProductName=\'Flotemysost\',Quantity=20,Salesperson=\'Janet%20Leverling\',ShipperName=\'Speedy%20Express\',UnitPrice=21.5000M)\", \"type\": \"NorthwindModel.Invoice\"\n" +
      "}, \"ShipName\": \"Alfred\'s Futterkiste\", \"ShipAddress\": \"Obere Str. 57\", \"ShipCity\": \"Berlin\", \"ShipRegion\": null, \"ShipPostalCode\": \"12209\", \"ShipCountry\": \"Germany\", \"CustomerID\": \"ALFKI\", \"CustomerName\": \"Alfreds Futterkiste\", \"Address\": \"Obere Str. 57\", \"City\": \"Berlin\", \"Region\": null, \"PostalCode\": \"12209\", \"Country\": \"Germany\", \"Salesperson\": \"Janet Leverling\", \"OrderID\": 11011, \"OrderDate\": \"\\/Date(892080000000)\\/\", \"RequiredDate\": \"\\/Date(894499200000)\\/\", \"ShippedDate\": \"\\/Date(892425600000)\\/\", \"ShipperName\": \"Speedy Express\", \"ProductID\": 71, \"ProductName\": \"Flotemysost\", \"UnitPrice\": \"21.5000\", \"Quantity\": 20, \"Discount\": 0, \"ExtendedPrice\": \"430.0000\", \"Freight\": \"1.2100\"\n" +
      "}, {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Invoices(CustomerName=\'Alfreds%20Futterkiste\',Discount=0.05f,OrderID=10952,ProductID=6,ProductName=\'Grandma\'\'s%20Boysenberry%20Spread\',Quantity=16,Salesperson=\'Nancy%20Davolio\',ShipperName=\'Speedy%20Express\',UnitPrice=25.0000M)\", \"type\": \"NorthwindModel.Invoice\"\n" +
      "}, \"ShipName\": \"Alfred\'s Futterkiste\", \"ShipAddress\": \"Obere Str. 57\", \"ShipCity\": \"Berlin\", \"ShipRegion\": null, \"ShipPostalCode\": \"12209\", \"ShipCountry\": \"Germany\", \"CustomerID\": \"ALFKI\", \"CustomerName\": \"Alfreds Futterkiste\", \"Address\": \"Obere Str. 57\", \"City\": \"Berlin\", \"Region\": null, \"PostalCode\": \"12209\", \"Country\": \"Germany\", \"Salesperson\": \"Nancy Davolio\", \"OrderID\": 10952, \"OrderDate\": \"\\/Date(890006400000)\\/\", \"RequiredDate\": \"\\/Date(893635200000)\\/\", \"ShippedDate\": \"\\/Date(890697600000)\\/\", \"ShipperName\": \"Speedy Express\", \"ProductID\": 6, \"ProductName\": \"Grandma\'s Boysenberry Spread\", \"UnitPrice\": \"25.0000\", \"Quantity\": 16, \"Discount\": 0.05, \"ExtendedPrice\": \"380.0000\", \"Freight\": \"40.4200\"\n" +
      "}, {\n" +
      "\"__metadata\": {\n" +
      "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Invoices(CustomerName=\'Alfreds%20Futterkiste\',Discount=0.05f,OrderID=11011,ProductID=58,ProductName=\'Escargots%20de%20Bourgogne\',Quantity=40,Salesperson=\'Janet%20Leverling\',ShipperName=\'Speedy%20Express\',UnitPrice=13.2500M)\", \"type\": \"NorthwindModel.Invoice\"\n" +
      "}, \"ShipName\": \"Alfred\'s Futterkiste\", \"ShipAddress\": \"Obere Str. 57\", \"ShipCity\": \"Berlin\", \"ShipRegion\": null, \"ShipPostalCode\": \"12209\", \"ShipCountry\": \"Germany\", \"CustomerID\": \"ALFKI\", \"CustomerName\": \"Alfreds Futterkiste\", \"Address\": \"Obere Str. 57\", \"City\": \"Berlin\", \"Region\": null, \"PostalCode\": \"12209\", \"Country\": \"Germany\", \"Salesperson\": \"Janet Leverling\", \"OrderID\": 11011, \"OrderDate\": \"\\/Date(892080000000)\\/\", \"RequiredDate\": \"\\/Date(894499200000)\\/\", \"ShippedDate\": \"\\/Date(892425600000)\\/\", \"ShipperName\": \"Speedy Express\", \"ProductID\": 58, \"ProductName\": \"Escargots de Bourgogne\", \"UnitPrice\": \"13.2500\", \"Quantity\": 40, \"Discount\": 0.05, \"ExtendedPrice\": \"503.5000\", \"Freight\": \"1.2100\"\n" +
      "}\n" +
      "]\n" +
      "}\n" +
      "}";
  var sCategories7ExpandXML = "<entry xml:base=\"http://services.odata.org/V3/Northwind/Northwind.svc/\" xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Categories(7)</id>\n" +
      "<category term=\"NorthwindModel.Category\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Category\" href=\"Categories(7)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\" type=\"application/atom+xml;type=feed\" title=\"Products\" href=\"Categories(7)/Products\">\n" +
      "<m:inline>\n" +
      "<feed>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Categories(7)/Products</id>\n" +
      "<title type=\"text\">Products</title>\n" +
      "<updated>2015-09-08T14:17:59Z</updated>\n" +
      "<link rel=\"self\" title=\"Products\" href=\"Categories(7)/Products\"/>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(7)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(7)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(7)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(7)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(7)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2015-09-08T14:17:59Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">7</d:ProductID>\n" +
      "<d:ProductName>Uncle Bob\'s Organic Dried Pears</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">3</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "<d:QuantityPerUnit>12 - 1 lb pkgs.</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">30.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">15</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(14)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(14)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(14)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(14)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(14)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2015-09-08T14:17:59Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">14</d:ProductID>\n" +
      "<d:ProductName>Tofu</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">6</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "<d:QuantityPerUnit>40 - 100 g pkgs.</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">23.2500</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">35</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(28)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(28)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(28)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(28)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(28)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2015-09-08T14:17:59Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">28</d:ProductID>\n" +
      "<d:ProductName>Rössle Sauerkraut</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">12</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "<d:QuantityPerUnit>25 - 825 g cans</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">45.6000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">26</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">0</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">true</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(51)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(51)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(51)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(51)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(51)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2015-09-08T14:17:59Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">51</d:ProductID>\n" +
      "<d:ProductName>Manjimup Dried Apples</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">24</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "<d:QuantityPerUnit>50 - 300 g pkgs.</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">53.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">20</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "<entry>\n" +
      "<id>http://services.odata.org/V3/Northwind/Northwind.svc/Products(74)</id>\n" +
      "<category term=\"NorthwindModel.Product\" scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\"/>\n" +
      "<link rel=\"edit\" title=\"Product\" href=\"Products(74)\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\" type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(74)/Category\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\" type=\"application/atom+xml;type=feed\" title=\"Order_Details\" href=\"Products(74)/Order_Details\"/>\n" +
      "<link rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\" type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(74)/Supplier\"/>\n" +
      "<title/>\n" +
      "<updated>2015-09-08T14:17:59Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:ProductID m:type=\"Edm.Int32\">74</d:ProductID>\n" +
      "<d:ProductName>Longlife Tofu</d:ProductName>\n" +
      "<d:SupplierID m:type=\"Edm.Int32\">4</d:SupplierID>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "<d:QuantityPerUnit>5 kg pkg.</d:QuantityPerUnit>\n" +
      "<d:UnitPrice m:type=\"Edm.Decimal\">10.0000</d:UnitPrice>\n" +
      "<d:UnitsInStock m:type=\"Edm.Int16\">4</d:UnitsInStock>\n" +
      "<d:UnitsOnOrder m:type=\"Edm.Int16\">20</d:UnitsOnOrder>\n" +
      "<d:ReorderLevel m:type=\"Edm.Int16\">5</d:ReorderLevel>\n" +
      "<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>\n" +
      "</feed>\n" +
      "</m:inline>\n" +
      "</link>\n" +
      "<title/>\n" +
      "<updated>2015-09-08T14:17:59Z</updated>\n" +
      "<author>\n" +
      "<name/>\n" +
      "</author>\n" +
      "<content type=\"application/xml\">\n" +
      "<m:properties>\n" +
      "<d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
      "<d:CategoryName>Produce</d:CategoryName>\n" +
      "<d:Description>Dried fruit and bean curd</d:Description>\n" +
      "<d:Picture m:type=\"Edm.Binary\"></d:Picture>\n" +
      "</m:properties>\n" +
      "</content>\n" +
      "</entry>";

  var sMetadataComplex = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<edmx:Edmx Version=\"1.0\"\n" +
      "	xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\"\n" +
      "	xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\n" +
      "	xmlns:sap=\"http://www.sap.com/Protocols/SAPData\">\n" +
      "	<edmx:DataServices m:DataServiceVersion=\"2.0\">\n" +
      "		<Schema Namespace=\"sap.ui.test\" xml:lang=\"en\"\n" +
      "			sap:schema-version=\"0000\" xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\">\n" +
      "			<EntityType Name=\"BusinessPartner\" sap:content-version=\"1\">\n" +
      "				<Key>\n" +
      "					<PropertyRef Name=\"BusinessPartnerID\" />\n" +
      "				</Key>\n" +
      "				<Property Name=\"Address\" Type=\"sap.ui.test.CT_Address\"\n" +
      "					Nullable=\"false\" />\n" +
      "				<Property Name=\"BusinessPartnerID\" Type=\"Edm.String\"\n" +
      "					Nullable=\"false\" MaxLength=\"10\" sap:label=\"Bus. Part. ID\"\n" +
      "					sap:creatable=\"false\" sap:updatable=\"false\" />\n" +
      "				<Property Name=\"CompanyName\" Type=\"Edm.String\" MaxLength=\"80\"\n" +
      "					sap:label=\"Company Name\" />\n" +
      "				<Property Name=\"WebAddress\" Type=\"Edm.String\" sap:label=\"Web Address\"\n" +
      "					sap:sortable=\"false\" sap:filterable=\"false\" sap:semantics=\"url\" />\n" +
      "				<Property Name=\"EmailAddress\" Type=\"Edm.String\" MaxLength=\"255\"\n" +
      "					sap:label=\"E-Mail Address\" sap:semantics=\"email\" />\n" +
      "				<Property Name=\"PhoneNumber\" Type=\"Edm.String\" MaxLength=\"30\"\n" +
      "					sap:label=\"Phone No.\" sap:semantics=\"tel\" />\n" +
      "				<Property Name=\"FaxNumber\" Type=\"Edm.String\" MaxLength=\"30\"\n" +
      "					sap:label=\"Fax Number\" />\n" +
      "				<Property Name=\"LegalForm\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
      "					sap:label=\"Legal Form\" />\n" +
      "				<Property Name=\"CurrencyCode\" Type=\"Edm.String\" MaxLength=\"5\"\n" +
      "					sap:label=\"Currency\" sap:semantics=\"currency-code\" />\n" +
      "				<Property Name=\"BusinessPartnerRole\" Type=\"Edm.String\"\n" +
      "					MaxLength=\"3\" sap:label=\"Bus. Part. Role\" />\n" +
      "				<Property Name=\"CreatedAt\" Type=\"Edm.DateTime\" Precision=\"7\"\n" +
      "					sap:label=\"Time Stamp\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" +
      "				<Property Name=\"ChangedAt\" Type=\"Edm.DateTime\" Precision=\"7\"\n" +
      "					ConcurrencyMode=\"Fixed\" sap:label=\"Time Stamp\" sap:creatable=\"false\"\n" +
      "					sap:updatable=\"false\" />\n" +
      "			</EntityType>\n" +
      "			<ComplexType Name=\"CT_Address\">\n" +
      "				<Property Name=\"City\" Type=\"Edm.String\" MaxLength=\"40\"\n" +
      "					sap:label=\"City\" sap:semantics=\"city\" />\n" +
      "				<Property Name=\"PostalCode\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
      "					sap:label=\"Postal Code\" sap:semantics=\"zip\" />\n" +
      "				<Property Name=\"Street\" Type=\"Edm.String\" MaxLength=\"60\"\n" +
      "					sap:label=\"Street\" sap:semantics=\"street\" />\n" +
      "				<Property Name=\"Building\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
      "					sap:label=\"Building\" />\n" +
      "				<Property Name=\"Country\" Type=\"Edm.String\" MaxLength=\"3\"\n" +
      "					sap:label=\"Country\" sap:semantics=\"country\" />\n" +
      "				<Property Name=\"AddressType\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
      "					sap:label=\"Address Type\" />\n" +
      "			</ComplexType>\n" +
      "			<EntityContainer Name=\"gwsample_basic_Entities\"\n" +
      "				m:IsDefaultEntityContainer=\"true\">\n" +
      "				<EntitySet Name=\"BusinessPartnerSet\" EntityType=\"sap.ui.test.BusinessPartner\"\n" +
      "					sap:content-version=\"1\" />\n" +
      "			</EntityContainer>\n" +
      "			<atom:link rel=\"self\"\n" +
      "				href=\"/SalesOrderSrv//$metadata\"\n" +
      "				xmlns:atom=\"http://www.w3.org/2005/Atom\" />\n" +
      "			<atom:link rel=\"latest-version\"\n" +
      "				href=\"/SalesOrderSrv//$metadata\"\n" +
      "				xmlns:atom=\"http://www.w3.org/2005/Atom\" />\n" +
      "		</Schema>\n" +
      "	</edmx:DataServices>\n" +
      "</edmx:Edmx>";

      var sZeroTest = "{\n" +
      "	\"d\" : 0\n" +
      "}";

      var sCategoriesFilterZeroXML = "<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?>\n" +
          "<feed xml:base=\"http://services.odata.org/V2/Northwind/Northwind.svc/\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xmlns=\"http://www.w3.org/2005/Atom\">\n" +
          "  <title type=\"text\">Categories</title>\n" +
          "  <id>http://services.odata.org/V2/Northwind/Northwind.svc/Categories</id>\n" +
          "  <updated>2015-12-14T15:42:48Z</updated>\n" +
          "  <author>\n" +
          "    <name />\n" +
          "  </author>\n" +
          "  <link rel=\"self\" title=\"Categories\" href=\"Categories\" />\n" +
          "</feed>";

      var sSupplierWithMultipleExpandSelectsJSON = "{\n" +
          "	\"d\" : {\n" +
          "		\"__metadata\" : {\n" +
          "			\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "			\"type\" : \"NorthwindModel.Supplier\"\n" +
          "		},\n" +
          "		\"SupplierID\" : 7,\n" +
          "		\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "		\"ContactName\" : \"Ian Devling\",\n" +
          "		\"ContactTitle\" : \"Marketing Manager\",\n" +
          "		\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "		\"City\" : \"Melbourne\",\n" +
          "		\"Region\" : \"Victoria\",\n" +
          "		\"PostalCode\" : \"3058\",\n" +
          "		\"Country\" : \"Australia\",\n" +
          "		\"Phone\" : \"(03) 444-2343\",\n" +
          "		\"Fax\" : \"(03) 444-6588\",\n" +
          "		\"HomePage\" : null,\n" +
          "		\"Products\" : {\n" +
          "			\"results\" : [{\n" +
          "				\"__metadata\" : {\n" +
          "					\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(16)\",\n" +
          "					\"type\" : \"NorthwindModel.Product\"\n" +
          "				},\n" +
          "				\"ProductID\" : 16,\n" +
          "				\"ProductName\" : \"Pavlova\",\n" +
          "				\"SupplierID\" : 7,\n" +
          "				\"CategoryID\" : 3,\n" +
          "				\"QuantityPerUnit\" : \"32 - 500 g boxes\",\n" +
          "				\"UnitPrice\" : \"17.4500\",\n" +
          "				\"UnitsInStock\" : 29,\n" +
          "				\"UnitsOnOrder\" : 0,\n" +
          "				\"ReorderLevel\" : 10,\n" +
          "				\"Discontinued\" : false,\n" +
          "				\"Category\" : {\n" +
          "					\"__metadata\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(3)\",\n" +
          "						\"type\" : \"NorthwindModel.Category\"\n" +
          "					},\n" +
          "					\"CategoryID\" : 3,\n" +
          "					\"CategoryName\" : \"Confections\"\n" +
          "				},\n" +
          "				\"Order_Details\" : {\n" +
          "					\"__deferred\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(16)/Order_Details\"\n" +
          "					}\n" +
          "				},\n" +
          "				\"Supplier\" : {\n" +
          "					\"__metadata\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "						\"type\" : \"NorthwindModel.Supplier\"\n" +
          "					},\n" +
          "					\"SupplierID\" : 7,\n" +
          "					\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "					\"ContactName\" : \"Ian Devling\",\n" +
          "					\"ContactTitle\" : \"Marketing Manager\",\n" +
          "					\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "					\"City\" : \"Melbourne\",\n" +
          "					\"Region\" : \"Victoria\",\n" +
          "					\"PostalCode\" : \"3058\",\n" +
          "					\"Country\" : \"Australia\",\n" +
          "					\"Phone\" : \"(03) 444-2343\",\n" +
          "					\"Fax\" : \"(03) 444-6588\",\n" +
          "					\"HomePage\" : null,\n" +
          "					\"Products\" : {\n" +
          "						\"__deferred\" : {\n" +
          "							\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)/Products\"\n" +
          "						}\n" +
          "					}\n" +
          "				}\n" +
          "			}, {\n" +
          "				\"__metadata\" : {\n" +
          "					\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(17)\",\n" +
          "					\"type\" : \"NorthwindModel.Product\"\n" +
          "				},\n" +
          "				\"ProductID\" : 17,\n" +
          "				\"ProductName\" : \"Alice Mutton\",\n" +
          "				\"SupplierID\" : 7,\n" +
          "				\"CategoryID\" : 6,\n" +
          "				\"QuantityPerUnit\" : \"20 - 1 kg tins\",\n" +
          "				\"UnitPrice\" : \"39.0000\",\n" +
          "				\"UnitsInStock\" : 0,\n" +
          "				\"UnitsOnOrder\" : 0,\n" +
          "				\"ReorderLevel\" : 0,\n" +
          "				\"Discontinued\" : true,\n" +
          "				\"Category\" : {\n" +
          "					\"__metadata\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(6)\",\n" +
          "						\"type\" : \"NorthwindModel.Category\"\n" +
          "					},\n" +
          "					\"CategoryID\" : 6,\n" +
          "					\"CategoryName\" : \"Meat/Poultry\"\n" +
          "				},\n" +
          "				\"Order_Details\" : {\n" +
          "					\"__deferred\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(17)/Order_Details\"\n" +
          "					}\n" +
          "				},\n" +
          "				\"Supplier\" : {\n" +
          "					\"__metadata\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "						\"type\" : \"NorthwindModel.Supplier\"\n" +
          "					},\n" +
          "					\"SupplierID\" : 7,\n" +
          "					\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "					\"ContactName\" : \"Ian Devling\",\n" +
          "					\"ContactTitle\" : \"Marketing Manager\",\n" +
          "					\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "					\"City\" : \"Melbourne\",\n" +
          "					\"Region\" : \"Victoria\",\n" +
          "					\"PostalCode\" : \"3058\",\n" +
          "					\"Country\" : \"Australia\",\n" +
          "					\"Phone\" : \"(03) 444-2343\",\n" +
          "					\"Fax\" : \"(03) 444-6588\",\n" +
          "					\"HomePage\" : null,\n" +
          "					\"Products\" : {\n" +
          "						\"__deferred\" : {\n" +
          "							\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)/Products\"\n" +
          "						}\n" +
          "					}\n" +
          "				}\n" +
          "			}, {\n" +
          "				\"__metadata\" : {\n" +
          "					\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(18)\",\n" +
          "					\"type\" : \"NorthwindModel.Product\"\n" +
          "				},\n" +
          "				\"ProductID\" : 18,\n" +
          "				\"ProductName\" : \"Carnarvon Tigers\",\n" +
          "				\"SupplierID\" : 7,\n" +
          "				\"CategoryID\" : 8,\n" +
          "				\"QuantityPerUnit\" : \"16 kg pkg.\",\n" +
          "				\"UnitPrice\" : \"62.5000\",\n" +
          "				\"UnitsInStock\" : 42,\n" +
          "				\"UnitsOnOrder\" : 0,\n" +
          "				\"ReorderLevel\" : 0,\n" +
          "				\"Discontinued\" : false,\n" +
          "				\"Category\" : {\n" +
          "					\"__metadata\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(8)\",\n" +
          "						\"type\" : \"NorthwindModel.Category\"\n" +
          "					},\n" +
          "					\"CategoryID\" : 8,\n" +
          "					\"CategoryName\" : \"Seafood\"\n" +
          "				},\n" +
          "				\"Order_Details\" : {\n" +
          "					\"__deferred\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(18)/Order_Details\"\n" +
          "					}\n" +
          "				},\n" +
          "				\"Supplier\" : {\n" +
          "					\"__metadata\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "						\"type\" : \"NorthwindModel.Supplier\"\n" +
          "					},\n" +
          "					\"SupplierID\" : 7,\n" +
          "					\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "					\"ContactName\" : \"Ian Devling\",\n" +
          "					\"ContactTitle\" : \"Marketing Manager\",\n" +
          "					\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "					\"City\" : \"Melbourne\",\n" +
          "					\"Region\" : \"Victoria\",\n" +
          "					\"PostalCode\" : \"3058\",\n" +
          "					\"Country\" : \"Australia\",\n" +
          "					\"Phone\" : \"(03) 444-2343\",\n" +
          "					\"Fax\" : \"(03) 444-6588\",\n" +
          "					\"HomePage\" : null,\n" +
          "					\"Products\" : {\n" +
          "						\"__deferred\" : {\n" +
          "							\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)/Products\"\n" +
          "						}\n" +
          "					}\n" +
          "				}\n" +
          "			}, {\n" +
          "				\"__metadata\" : {\n" +
          "					\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(63)\",\n" +
          "					\"type\" : \"NorthwindModel.Product\"\n" +
          "				},\n" +
          "				\"ProductID\" : 63,\n" +
          "				\"ProductName\" : \"Vegie-spread\",\n" +
          "				\"SupplierID\" : 7,\n" +
          "				\"CategoryID\" : 2,\n" +
          "				\"QuantityPerUnit\" : \"15 - 625 g jars\",\n" +
          "				\"UnitPrice\" : \"43.9000\",\n" +
          "				\"UnitsInStock\" : 24,\n" +
          "				\"UnitsOnOrder\" : 0,\n" +
          "				\"ReorderLevel\" : 5,\n" +
          "				\"Discontinued\" : false,\n" +
          "				\"Category\" : {\n" +
          "					\"__metadata\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(2)\",\n" +
          "						\"type\" : \"NorthwindModel.Category\"\n" +
          "					},\n" +
          "					\"CategoryID\" : 2,\n" +
          "					\"CategoryName\" : \"Condiments\"\n" +
          "				},\n" +
          "				\"Order_Details\" : {\n" +
          "					\"__deferred\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(63)/Order_Details\"\n" +
          "					}\n" +
          "				},\n" +
          "				\"Supplier\" : {\n" +
          "					\"__metadata\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "						\"type\" : \"NorthwindModel.Supplier\"\n" +
          "					},\n" +
          "					\"SupplierID\" : 7,\n" +
          "					\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "					\"ContactName\" : \"Ian Devling\",\n" +
          "					\"ContactTitle\" : \"Marketing Manager\",\n" +
          "					\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "					\"City\" : \"Melbourne\",\n" +
          "					\"Region\" : \"Victoria\",\n" +
          "					\"PostalCode\" : \"3058\",\n" +
          "					\"Country\" : \"Australia\",\n" +
          "					\"Phone\" : \"(03) 444-2343\",\n" +
          "					\"Fax\" : \"(03) 444-6588\",\n" +
          "					\"HomePage\" : null,\n" +
          "					\"Products\" : {\n" +
          "						\"__deferred\" : {\n" +
          "							\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)/Products\"\n" +
          "						}\n" +
          "					}\n" +
          "				}\n" +
          "			}, {\n" +
          "				\"__metadata\" : {\n" +
          "					\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)\",\n" +
          "					\"type\" : \"NorthwindModel.Product\"\n" +
          "				},\n" +
          "				\"ProductID\" : 70,\n" +
          "				\"ProductName\" : \"Outback Lager\",\n" +
          "				\"SupplierID\" : 7,\n" +
          "				\"CategoryID\" : 1,\n" +
          "				\"QuantityPerUnit\" : \"24 - 355 ml bottles\",\n" +
          "				\"UnitPrice\" : \"15.0000\",\n" +
          "				\"UnitsInStock\" : 15,\n" +
          "				\"UnitsOnOrder\" : 10,\n" +
          "				\"ReorderLevel\" : 30,\n" +
          "				\"Discontinued\" : false,\n" +
          "				\"Category\" : {\n" +
          "					\"__metadata\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(1)\",\n" +
          "						\"type\" : \"NorthwindModel.Category\"\n" +
          "					},\n" +
          "					\"CategoryID\" : 1,\n" +
          "					\"CategoryName\" : \"Beverages\"\n" +
          "				},\n" +
          "				\"Order_Details\" : {\n" +
          "					\"__deferred\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)/Order_Details\"\n" +
          "					}\n" +
          "				},\n" +
          "				\"Supplier\" : {\n" +
          "					\"__metadata\" : {\n" +
          "						\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "						\"type\" : \"NorthwindModel.Supplier\"\n" +
          "					},\n" +
          "					\"SupplierID\" : 7,\n" +
          "					\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "					\"ContactName\" : \"Ian Devling\",\n" +
          "					\"ContactTitle\" : \"Marketing Manager\",\n" +
          "					\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "					\"City\" : \"Melbourne\",\n" +
          "					\"Region\" : \"Victoria\",\n" +
          "					\"PostalCode\" : \"3058\",\n" +
          "					\"Country\" : \"Australia\",\n" +
          "					\"Phone\" : \"(03) 444-2343\",\n" +
          "					\"Fax\" : \"(03) 444-6588\",\n" +
          "					\"HomePage\" : null,\n" +
          "					\"Products\" : {\n" +
          "						\"__deferred\" : {\n" +
          "							\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)/Products\"\n" +
          "						}\n" +
          "					}\n" +
          "				}\n" +
          "			}]\n" +
          "		}\n" +
          "	}\n" +
          "}";

      var sSupplierWithMultipleExpandJSON = "{\n" +
          "	\"d\" : {\n" +
          "		\"__metadata\" : {\n" +
          "			\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "			\"type\" : \"NorthwindModel.Supplier\"\n" +
          "		},\n" +
          "		\"SupplierID\" : 7,\n" +
          "		\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "		\"ContactName\" : \"Ian Devling\",\n" +
          "		\"ContactTitle\" : \"Marketing Manager\",\n" +
          "		\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "		\"City\" : \"Melbourne\",\n" +
          "		\"Region\" : \"Victoria\",\n" +
          "		\"PostalCode\" : \"3058\",\n" +
          "		\"Country\" : \"Australia\",\n" +
          "		\"Phone\" : \"(03) 444-2343\",\n" +
          "		\"Fax\" : \"(03) 444-6588\",\n" +
          "		\"HomePage\" : null,\n" +
          "		\"Products\" : {\n" +
          "			\"results\" : [\n" +
          "					{\n" +
          "						\"__metadata\" : {\n" +
          "							\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(16)\",\n" +
          "							\"type\" : \"NorthwindModel.Product\"\n" +
          "						},\n" +
          "						\"ProductID\" : 16,\n" +
          "						\"ProductName\" : \"Pavlova\",\n" +
          "						\"SupplierID\" : 7,\n" +
          "						\"CategoryID\" : 3,\n" +
          "						\"QuantityPerUnit\" : \"32 - 500 g boxes\",\n" +
          "						\"UnitPrice\" : \"17.4500\",\n" +
          "						\"UnitsInStock\" : 29,\n" +
          "						\"UnitsOnOrder\" : 0,\n" +
          "						\"ReorderLevel\" : 10,\n" +
          "						\"Discontinued\" : false,\n" +
          "						\"Category\" : {\n" +
          "							\"__metadata\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(3)\",\n" +
          "								\"type\" : \"NorthwindModel.Category\"\n" +
          "							},\n" +
          "							\"CategoryID\" : 3,\n" +
          "							\"CategoryName\" : \"Confections\",\n" +
          "							\"Description\" : \"Desserts, candies, and sweet breads\",\n" +
          "							\"Picture\" : \"\",\n" +
          "							\"Products\" : {\n" +
          "								\"__deferred\" : {\n" +
          "									\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(3)/Products\"\n" +
          "								}\n" +
          "							}\n" +
          "						},\n" +
          "						\"Order_Details\" : {\n" +
          "							\"__deferred\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(16)/Order_Details\"\n" +
          "							}\n" +
          "						},\n" +
          "						\"Supplier\" : {\n" +
          "							\"__metadata\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "								\"type\" : \"NorthwindModel.Supplier\"\n" +
          "							},\n" +
          "							\"SupplierID\" : 7,\n" +
          "							\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "							\"ContactName\" : \"Ian Devling\",\n" +
          "							\"ContactTitle\" : \"Marketing Manager\",\n" +
          "							\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "							\"City\" : \"Melbourne\",\n" +
          "							\"Region\" : \"Victoria\",\n" +
          "							\"PostalCode\" : \"3058\",\n" +
          "							\"Country\" : \"Australia\",\n" +
          "							\"Phone\" : \"(03) 444-2343\",\n" +
          "							\"Fax\" : \"(03) 444-6588\",\n" +
          "							\"HomePage\" : null,\n" +
          "							\"Products\" : {\n" +
          "								\"__deferred\" : {\n" +
          "									\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)/Products\"\n" +
          "								}\n" +
          "							}\n" +
          "						}\n" +
          "					},\n" +
          "					{\n" +
          "						\"__metadata\" : {\n" +
          "							\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(17)\",\n" +
          "							\"type\" : \"NorthwindModel.Product\"\n" +
          "						},\n" +
          "						\"ProductID\" : 17,\n" +
          "						\"ProductName\" : \"Alice Mutton\",\n" +
          "						\"SupplierID\" : 7,\n" +
          "						\"CategoryID\" : 6,\n" +
          "						\"QuantityPerUnit\" : \"20 - 1 kg tins\",\n" +
          "						\"UnitPrice\" : \"39.0000\",\n" +
          "						\"UnitsInStock\" : 0,\n" +
          "						\"UnitsOnOrder\" : 0,\n" +
          "						\"ReorderLevel\" : 0,\n" +
          "						\"Discontinued\" : true,\n" +
          "						\"Category\" : {\n" +
          "							\"__metadata\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(6)\",\n" +
          "								\"type\" : \"NorthwindModel.Category\"\n" +
          "							},\n" +
          "							\"CategoryID\" : 6,\n" +
          "							\"CategoryName\" : \"Meat/Poultry\",\n" +
          "							\"Description\" : \"Prepared meats\",\n" +
          "							\"Picture\" : \"\",\n" +
          "							\"Products\" : {\n" +
          "								\"__deferred\" : {\n" +
          "									\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(6)/Products\"\n" +
          "								}\n" +
          "							}\n" +
          "						},\n" +
          "						\"Order_Details\" : {\n" +
          "							\"__deferred\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(17)/Order_Details\"\n" +
          "							}\n" +
          "						},\n" +
          "						\"Supplier\" : {\n" +
          "							\"__metadata\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "								\"type\" : \"NorthwindModel.Supplier\"\n" +
          "							},\n" +
          "							\"SupplierID\" : 7,\n" +
          "							\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "							\"ContactName\" : \"Ian Devling\",\n" +
          "							\"ContactTitle\" : \"Marketing Manager\",\n" +
          "							\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "							\"City\" : \"Melbourne\",\n" +
          "							\"Region\" : \"Victoria\",\n" +
          "							\"PostalCode\" : \"3058\",\n" +
          "							\"Country\" : \"Australia\",\n" +
          "							\"Phone\" : \"(03) 444-2343\",\n" +
          "							\"Fax\" : \"(03) 444-6588\",\n" +
          "							\"HomePage\" : null,\n" +
          "							\"Products\" : {\n" +
          "								\"__deferred\" : {\n" +
          "									\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)/Products\"\n" +
          "								}\n" +
          "							}\n" +
          "						}\n" +
          "					},\n" +
          "					{\n" +
          "						\"__metadata\" : {\n" +
          "							\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(18)\",\n" +
          "							\"type\" : \"NorthwindModel.Product\"\n" +
          "						},\n" +
          "						\"ProductID\" : 18,\n" +
          "						\"ProductName\" : \"Carnarvon Tigers\",\n" +
          "						\"SupplierID\" : 7,\n" +
          "						\"CategoryID\" : 8,\n" +
          "						\"QuantityPerUnit\" : \"16 kg pkg.\",\n" +
          "						\"UnitPrice\" : \"62.5000\",\n" +
          "						\"UnitsInStock\" : 42,\n" +
          "						\"UnitsOnOrder\" : 0,\n" +
          "						\"ReorderLevel\" : 0,\n" +
          "						\"Discontinued\" : false,\n" +
          "						\"Category\" : {\n" +
          "							\"__metadata\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(8)\",\n" +
          "								\"type\" : \"NorthwindModel.Category\"\n" +
          "							},\n" +
          "							\"CategoryID\" : 8,\n" +
          "							\"CategoryName\" : \"Seafood\",\n" +
          "							\"Description\" : \"Seaweed and fish\",\n" +
          "							\"Picture\" : \"\",\n" +
          "							\"Products\" : {\n" +
          "								\"__deferred\" : {\n" +
          "									\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(8)/Products\"\n" +
          "								}\n" +
          "							}\n" +
          "						},\n" +
          "						\"Order_Details\" : {\n" +
          "							\"__deferred\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(18)/Order_Details\"\n" +
          "							}\n" +
          "						},\n" +
          "						\"Supplier\" : {\n" +
          "							\"__metadata\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "								\"type\" : \"NorthwindModel.Supplier\"\n" +
          "							},\n" +
          "							\"SupplierID\" : 7,\n" +
          "							\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "							\"ContactName\" : \"Ian Devling\",\n" +
          "							\"ContactTitle\" : \"Marketing Manager\",\n" +
          "							\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "							\"City\" : \"Melbourne\",\n" +
          "							\"Region\" : \"Victoria\",\n" +
          "							\"PostalCode\" : \"3058\",\n" +
          "							\"Country\" : \"Australia\",\n" +
          "							\"Phone\" : \"(03) 444-2343\",\n" +
          "							\"Fax\" : \"(03) 444-6588\",\n" +
          "							\"HomePage\" : null,\n" +
          "							\"Products\" : {\n" +
          "								\"__deferred\" : {\n" +
          "									\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)/Products\"\n" +
          "								}\n" +
          "							}\n" +
          "						}\n" +
          "					},\n" +
          "					{\n" +
          "						\"__metadata\" : {\n" +
          "							\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(63)\",\n" +
          "							\"type\" : \"NorthwindModel.Product\"\n" +
          "						},\n" +
          "						\"ProductID\" : 63,\n" +
          "						\"ProductName\" : \"Vegie-spread\",\n" +
          "						\"SupplierID\" : 7,\n" +
          "						\"CategoryID\" : 2,\n" +
          "						\"QuantityPerUnit\" : \"15 - 625 g jars\",\n" +
          "						\"UnitPrice\" : \"43.9000\",\n" +
          "						\"UnitsInStock\" : 24,\n" +
          "						\"UnitsOnOrder\" : 0,\n" +
          "						\"ReorderLevel\" : 5,\n" +
          "						\"Discontinued\" : false,\n" +
          "						\"Category\" : {\n" +
          "							\"__metadata\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(2)\",\n" +
          "								\"type\" : \"NorthwindModel.Category\"\n" +
          "							},\n" +
          "							\"CategoryID\" : 2,\n" +
          "							\"CategoryName\" : \"Condiments\",\n" +
          "							\"Description\" : \"Sweet and savory sauces, relishes, spreads, and seasonings\",\n" +
          "							\"Picture\" : \"\",\n" +
          "							\"Products\" : {\n" +
          "								\"__deferred\" : {\n" +
          "									\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(2)/Products\"\n" +
          "								}\n" +
          "							}\n" +
          "						},\n" +
          "						\"Order_Details\" : {\n" +
          "							\"__deferred\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(63)/Order_Details\"\n" +
          "							}\n" +
          "						},\n" +
          "						\"Supplier\" : {\n" +
          "							\"__metadata\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "								\"type\" : \"NorthwindModel.Supplier\"\n" +
          "							},\n" +
          "							\"SupplierID\" : 7,\n" +
          "							\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "							\"ContactName\" : \"Ian Devling\",\n" +
          "							\"ContactTitle\" : \"Marketing Manager\",\n" +
          "							\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "							\"City\" : \"Melbourne\",\n" +
          "							\"Region\" : \"Victoria\",\n" +
          "							\"PostalCode\" : \"3058\",\n" +
          "							\"Country\" : \"Australia\",\n" +
          "							\"Phone\" : \"(03) 444-2343\",\n" +
          "							\"Fax\" : \"(03) 444-6588\",\n" +
          "							\"HomePage\" : null,\n" +
          "							\"Products\" : {\n" +
          "								\"__deferred\" : {\n" +
          "									\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)/Products\"\n" +
          "								}\n" +
          "							}\n" +
          "						}\n" +
          "					},\n" +
          "					{\n" +
          "						\"__metadata\" : {\n" +
          "							\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)\",\n" +
          "							\"type\" : \"NorthwindModel.Product\"\n" +
          "						},\n" +
          "						\"ProductID\" : 70,\n" +
          "						\"ProductName\" : \"Outback Lager\",\n" +
          "						\"SupplierID\" : 7,\n" +
          "						\"CategoryID\" : 1,\n" +
          "						\"QuantityPerUnit\" : \"24 - 355 ml bottles\",\n" +
          "						\"UnitPrice\" : \"15.0000\",\n" +
          "						\"UnitsInStock\" : 15,\n" +
          "						\"UnitsOnOrder\" : 10,\n" +
          "						\"ReorderLevel\" : 30,\n" +
          "						\"Discontinued\" : false,\n" +
          "						\"Category\" : {\n" +
          "							\"__metadata\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(1)\",\n" +
          "								\"type\" : \"NorthwindModel.Category\"\n" +
          "							},\n" +
          "							\"CategoryID\" : 1,\n" +
          "							\"CategoryName\" : \"Beverages\",\n" +
          "							\"Description\" : \"Soft drinks, coffees, teas, beers, and ales\",\n" +
          "							\"Picture\" : \"\",\n" +
          "							\"Products\" : {\n" +
          "								\"__deferred\" : {\n" +
          "									\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(1)/Products\"\n" +
          "								}\n" +
          "							}\n" +
          "						},\n" +
          "						\"Order_Details\" : {\n" +
          "							\"__deferred\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)/Order_Details\"\n" +
          "							}\n" +
          "						},\n" +
          "						\"Supplier\" : {\n" +
          "							\"__metadata\" : {\n" +
          "								\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)\",\n" +
          "								\"type\" : \"NorthwindModel.Supplier\"\n" +
          "							},\n" +
          "							\"SupplierID\" : 7,\n" +
          "							\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
          "							\"ContactName\" : \"Ian Devling\",\n" +
          "							\"ContactTitle\" : \"Marketing Manager\",\n" +
          "							\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
          "							\"City\" : \"Melbourne\",\n" +
          "							\"Region\" : \"Victoria\",\n" +
          "							\"PostalCode\" : \"3058\",\n" +
          "							\"Country\" : \"Australia\",\n" +
          "							\"Phone\" : \"(03) 444-2343\",\n" +
          "							\"Fax\" : \"(03) 444-6588\",\n" +
          "							\"HomePage\" : null,\n" +
          "							\"Products\" : {\n" +
          "								\"__deferred\" : {\n" +
          "									\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(7)/Products\"\n" +
          "								}\n" +
          "							}\n" +
          "						}\n" +
          "					}]\n" +
          "		}\n" +
          "	}\n" +
          "}";
      var sCategory10JSON = "{\n" +
      "\"d\" : {\n" +
      "		\"__metadata\" : {\n" +
      "			\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(10)\",\n" +
      "			\"type\" : \"NorthwindModel.Category\",\n" +
      "			\"etag\" : \"W/\\\"736010m\\\"\",\n" +
      "			\"content_type\" : \"application/octet-stream\",\n" +
      "			\"media_src\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(10)/Attachment/$value\",\n" +
      "			\"edit_media\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(10)/Attachment/$value\"\n" +
      "		},\n" +
      "		\"CategoryID\" : 10,\n" +
      "		\"CategoryName\" : \"Confections\",\n" +
      "		\"Description\" : \"Desserts, candies, and sweet breads\",\n" +
      "		\"Picture\" : \"\",\n" +
      "		\"Products\" : {\n" +
      "			\"__deferred\" : {\n" +
      "				\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Categories(10)/Products\"\n" +
      "			}\n" +
      "		}\n" +
      "	}\n" +
      "}";
      var sProducts7ExpCategoryXML = "<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?>\n" +
          "<entry xml:base=\"http://services.odata.org/V2/Northwind/Northwind.svc/\"\n" +
          "	xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\"\n" +
          "	xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\n" +
          "	xmlns=\"http://www.w3.org/2005/Atom\">\n" +
          "	<id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(7)</id>\n" +
          "	<title type=\"text\"></title>\n" +
          "	<updated>2016-04-11T08:40:49Z</updated>\n" +
          "	<author>\n" +
          "		<name />\n" +
          "	</author>\n" +
          "	<link rel=\"edit\" title=\"Product\" href=\"Products(7)\" />\n" +
          "	<link\n" +
          "		rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Category\"\n" +
          "		type=\"application/atom+xml;type=entry\" title=\"Category\" href=\"Products(7)/Category\">\n" +
          "		<m:inline>\n" +
          "			<entry>\n" +
          "				<id>http://services.odata.org/V2/Northwind/Northwind.svc/Categories(7)</id>\n" +
          "				<title type=\"text\"></title>\n" +
          "				<updated>2016-04-11T08:40:49Z</updated>\n" +
          "				<author>\n" +
          "					<name />\n" +
          "				</author>\n" +
          "				<link rel=\"edit\" title=\"Category\" href=\"Categories(7)\" />\n" +
          "				<link\n" +
          "					rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products\"\n" +
          "					type=\"application/atom+xml;type=feed\" title=\"Products\"\n" +
          "					href=\"Categories(7)/Products\" />\n" +
          "				<category term=\"NorthwindModel.Category\"\n" +
          "					scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" />\n" +
          "				<content type=\"application/xml\">\n" +
          "					<m:properties>\n" +
          "						<d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
          "						<d:CategoryName m:type=\"Edm.String\">Produce</d:CategoryName>\n" +
          "						<d:Description m:type=\"Edm.String\">Dried fruit and bean curd</d:Description>\n" +
          "						<d:Picture m:type=\"Edm.Binary\"></d:Picture>\n" +
          "					</m:properties>\n" +
          "				</content>\n" +
          "			</entry>\n" +
          "		</m:inline>\n" +
          "	</link>\n" +
          "	<link\n" +
          "		rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Order_Details\"\n" +
          "		type=\"application/atom+xml;type=feed\" title=\"Order_Details\"\n" +
          "		href=\"Products(7)/Order_Details\" />\n" +
          "	<link\n" +
          "		rel=\"http://schemas.microsoft.com/ado/2007/08/dataservices/related/Supplier\"\n" +
          "		type=\"application/atom+xml;type=entry\" title=\"Supplier\" href=\"Products(7)/Supplier\" />\n" +
          "	<category term=\"NorthwindModel.Product\"\n" +
          "		scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" />\n" +
          "	<content type=\"application/xml\">\n" +
          "		<m:properties>\n" +
          "			<d:ProductID m:type=\"Edm.Int32\">7</d:ProductID>\n" +
          "			<d:ProductName m:type=\"Edm.String\">Uncle Bob\'s Organic Dried Pears</d:ProductName>\n" +
          "			<d:SupplierID m:type=\"Edm.Int32\">3</d:SupplierID>\n" +
          "			<d:CategoryID m:type=\"Edm.Int32\">7</d:CategoryID>\n" +
          "			<d:QuantityPerUnit m:type=\"Edm.String\">12 - 1 lb pkgs.</d:QuantityPerUnit>\n" +
          "			<d:UnitPrice m:type=\"Edm.Decimal\">30.0000</d:UnitPrice>\n" +
          "			<d:UnitsInStock m:type=\"Edm.Int16\">15</d:UnitsInStock>\n" +
          "			<d:UnitsOnOrder m:type=\"Edm.Int16\">0</d:UnitsOnOrder>\n" +
          "			<d:ReorderLevel m:type=\"Edm.Int16\">10</d:ReorderLevel>\n" +
          "			<d:Discontinued m:type=\"Edm.Boolean\">false</d:Discontinued>\n" +
          "		</m:properties>\n" +
          "	</content>\n" +
          "</entry>";
      var sCategories7ExpandProductsSelect = '\<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
  <entry xml:base="http://services.odata.org/V2/Northwind/Northwind.svc/" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://www.w3.org/2005/Atom">\
    <id>http://services.odata.org/V2/Northwind/Northwind.svc/Categories(7)</id>\
    <title type="text"></title>\
    <updated>2017-02-03T12:56:28Z</updated>\
    <author>\
      <name />\
    </author>\
    <link rel="edit" title="Category" href="Categories(7)" />\
    <link rel="http://schemas.microsoft.com/ado/2007/08/dataservices/related/Products" type="application/atom+xml;type=feed" title="Products" href="Categories(7)/Products">\
      <m:inline>\
        <feed>\
          <title type="text">Products</title>\
          <id>http://services.odata.org/V2/Northwind/Northwind.svc/Categories(7)/Products</id>\
          <updated>2017-02-03T12:56:28Z</updated>\
          <link rel="self" title="Products" href="Categories(7)/Products" />\
          <entry>\
            <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(7)</id>\
            <title type="text"></title>\
            <updated>2017-02-03T12:56:28Z</updated>\
            <author>\
              <name />\
            </author>\
            <link rel="edit" title="Product" href="Products(7)" />\
            <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
            <content type="application/xml">\
              <m:properties>\
                <d:ProductID m:type="Edm.Int32">7</d:ProductID>\
              </m:properties>\
            </content>\
          </entry>\
          <entry>\
            <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(14)</id>\
            <title type="text"></title>\
            <updated>2017-02-03T12:56:28Z</updated>\
            <author>\
              <name />\
            </author>\
            <link rel="edit" title="Product" href="Products(14)" />\
            <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
            <content type="application/xml">\
              <m:properties>\
                <d:ProductID m:type="Edm.Int32">14</d:ProductID>\
              </m:properties>\
            </content>\
          </entry>\
          <entry>\
            <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(28)</id>\
            <title type="text"></title>\
            <updated>2017-02-03T12:56:28Z</updated>\
            <author>\
              <name />\
            </author>\
            <link rel="edit" title="Product" href="Products(28)" />\
            <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
            <content type="application/xml">\
              <m:properties>\
                <d:ProductID m:type="Edm.Int32">28</d:ProductID>\
              </m:properties>\
            </content>\
          </entry>\
          <entry>\
            <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(51)</id>\
            <title type="text"></title>\
            <updated>2017-02-03T12:56:28Z</updated>\
            <author>\
              <name />\
            </author>\
            <link rel="edit" title="Product" href="Products(51)" />\
            <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
            <content type="application/xml">\
              <m:properties>\
                <d:ProductID m:type="Edm.Int32">51</d:ProductID>\
              </m:properties>\
            </content>\
          </entry>\
          <entry>\
            <id>http://services.odata.org/V2/Northwind/Northwind.svc/Products(74)</id>\
            <title type="text"></title>\
            <updated>2017-02-03T12:56:28Z</updated>\
            <author>\
              <name />\
            </author>\
            <link rel="edit" title="Product" href="Products(74)" />\
            <category term="NorthwindModel.Product" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
            <content type="application/xml">\
              <m:properties>\
                <d:ProductID m:type="Edm.Int32">74</d:ProductID>\
              </m:properties>\
            </content>\
          </entry>\
        </feed>\
      </m:inline>\
    </link>\
    <category term="NorthwindModel.Category" scheme="http://schemas.microsoft.com/ado/2007/08/dataservices/scheme" />\
    <content type="application/xml" />\
  </entry>\
  ';

  var sCurrentProductListsJSON = "{" +
  "\"d\" : {" +
  "\"results\": [" +
  "{" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=1,ProductName='Chai')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 1, \"ProductName\": \"Chai\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=2,ProductName='Chang')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 2, \"ProductName\": \"Chang\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=3,ProductName='Aniseed%20Syrup')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 3, \"ProductName\": \"Aniseed Syrup\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=4,ProductName='Chef%20Anton''s%20Cajun%20Seasoning')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 4, \"ProductName\": \"Chef Anton's Cajun Seasoning\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=6,ProductName='Grandma''s%20Boysenberry%20Spread')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 6, \"ProductName\": \"Grandma's Boysenberry Spread\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=7,ProductName='Uncle%20Bob''s%20Organic%20Dried%20Pears')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 7, \"ProductName\": \"Uncle Bob's Organic Dried Pears\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=8,ProductName='Northwoods%20Cranberry%20Sauce')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 8, \"ProductName\": \"Northwoods Cranberry Sauce\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=10,ProductName='Ikura')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 10, \"ProductName\": \"Ikura\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=11,ProductName='Queso%20Cabrales')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 11, \"ProductName\": \"Queso Cabrales\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=12,ProductName='Queso%20Manchego%20La%20Pastora')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 12, \"ProductName\": \"Queso Manchego La Pastora\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=13,ProductName='Konbu')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 13, \"ProductName\": \"Konbu\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=14,ProductName='Tofu')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 14, \"ProductName\": \"Tofu\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=15,ProductName='Genen%20Shouyu')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 15, \"ProductName\": \"Genen Shouyu\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=16,ProductName='Pavlova')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 16, \"ProductName\": \"Pavlova\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=18,ProductName='Carnarvon%20Tigers')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 18, \"ProductName\": \"Carnarvon Tigers\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=19,ProductName='Teatime%20Chocolate%20Biscuits')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 19, \"ProductName\": \"Teatime Chocolate Biscuits\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=20,ProductName='Sir%20Rodney''s%20Marmalade')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 20, \"ProductName\": \"Sir Rodney's Marmalade\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=21,ProductName='Sir%20Rodney''s%20Scones')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 21, \"ProductName\": \"Sir Rodney's Scones\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=22,ProductName='Gustaf''s%20Kn%C3%A4ckebr%C3%B6d')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 22, \"ProductName\": \"Gustaf's Kn\u00e4ckebr\u00f6d\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=23,ProductName='Tunnbr%C3%B6d')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 23, \"ProductName\": \"Tunnbr\u00f6d\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=25,ProductName='NuNuCa%20Nu%C3%9F-Nougat-Creme')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 25, \"ProductName\": \"NuNuCa Nu\u00df-Nougat-Creme\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=26,ProductName='Gumb%C3%A4r%20Gummib%C3%A4rchen')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 26, \"ProductName\": \"Gumb\u00e4r Gummib\u00e4rchen\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=27,ProductName='Schoggi%20Schokolade')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 27, \"ProductName\": \"Schoggi Schokolade\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=30,ProductName='Nord-Ost%20Matjeshering')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 30, \"ProductName\": \"Nord-Ost Matjeshering\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=31,ProductName='Gorgonzola%20Telino')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 31, \"ProductName\": \"Gorgonzola Telino\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=32,ProductName='Mascarpone%20Fabioli')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 32, \"ProductName\": \"Mascarpone Fabioli\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=33,ProductName='Geitost')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 33, \"ProductName\": \"Geitost\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=34,ProductName='Sasquatch%20Ale')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 34, \"ProductName\": \"Sasquatch Ale\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=35,ProductName='Steeleye%20Stout')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 35, \"ProductName\": \"Steeleye Stout\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=36,ProductName='Inlagd%20Sill')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 36, \"ProductName\": \"Inlagd Sill\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=37,ProductName='Gravad%20lax')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 37, \"ProductName\": \"Gravad lax\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=38,ProductName='C%C3%B4te%20de%20Blaye')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 38, \"ProductName\": \"C\u00f4te de Blaye\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=39,ProductName='Chartreuse%20verte')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 39, \"ProductName\": \"Chartreuse verte\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=40,ProductName='Boston%20Crab%20Meat')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 40, \"ProductName\": \"Boston Crab Meat\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=41,ProductName='Jack''s%20New%20England%20Clam%20Chowder')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 41, \"ProductName\": \"Jack's New England Clam Chowder\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=43,ProductName='Ipoh%20Coffee')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 43, \"ProductName\": \"Ipoh Coffee\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=44,ProductName='Gula%20Malacca')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 44, \"ProductName\": \"Gula Malacca\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=45,ProductName='Rogede%20sild')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 45, \"ProductName\": \"Rogede sild\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=46,ProductName='Spegesild')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 46, \"ProductName\": \"Spegesild\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=47,ProductName='Zaanse%20koeken')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 47, \"ProductName\": \"Zaanse koeken\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=48,ProductName='Chocolade')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 48, \"ProductName\": \"Chocolade\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=49,ProductName='Maxilaku')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 49, \"ProductName\": \"Maxilaku\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=50,ProductName='Valkoinen%20suklaa')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 50, \"ProductName\": \"Valkoinen suklaa\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=51,ProductName='Manjimup%20Dried%20Apples')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 51, \"ProductName\": \"Manjimup Dried Apples\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=52,ProductName='Filo%20Mix')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 52, \"ProductName\": \"Filo Mix\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=54,ProductName='Tourti%C3%A8re')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 54, \"ProductName\": \"Tourti\u00e8re\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=55,ProductName='P%C3%A2t%C3%A9%20chinois')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 55, \"ProductName\": \"P\u00e2t\u00e9 chinois\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=56,ProductName='Gnocchi%20di%20nonna%20Alice')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 56, \"ProductName\": \"Gnocchi di nonna Alice\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=57,ProductName='Ravioli%20Angelo')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 57, \"ProductName\": \"Ravioli Angelo\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=58,ProductName='Escargots%20de%20Bourgogne')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 58, \"ProductName\": \"Escargots de Bourgogne\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=59,ProductName='Raclette%20Courdavault')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 59, \"ProductName\": \"Raclette Courdavault\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=60,ProductName='Camembert%20Pierrot')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 60, \"ProductName\": \"Camembert Pierrot\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=61,ProductName='Sirop%20d''%C3%A9rable')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 61, \"ProductName\": \"Sirop d'\u00e9rable\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=62,ProductName='Tarte%20au%20sucre')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 62, \"ProductName\": \"Tarte au sucre\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=63,ProductName='Vegie-spread')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 63, \"ProductName\": \"Vegie-spread\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=64,ProductName='Wimmers%20gute%20Semmelkn%C3%B6del')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 64, \"ProductName\": \"Wimmers gute Semmelkn\u00f6del\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=65,ProductName='Louisiana%20Fiery%20Hot%20Pepper%20Sauce')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 65, \"ProductName\": \"Louisiana Fiery Hot Pepper Sauce\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=66,ProductName='Louisiana%20Hot%20Spiced%20Okra')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 66, \"ProductName\": \"Louisiana Hot Spiced Okra\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=67,ProductName='Laughing%20Lumberjack%20Lager')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 67, \"ProductName\": \"Laughing Lumberjack Lager\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=68,ProductName='Scottish%20Longbreads')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 68, \"ProductName\": \"Scottish Longbreads\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=69,ProductName='Gudbrandsdalsost')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 69, \"ProductName\": \"Gudbrandsdalsost\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=70,ProductName='Outback%20Lager')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 70, \"ProductName\": \"Outback Lager\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=71,ProductName='Flotemysost')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 71, \"ProductName\": \"Flotemysost\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=72,ProductName='Mozzarella%20di%20Giovanni')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 72, \"ProductName\": \"Mozzarella di Giovanni\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=73,ProductName='R%C3%B6d%20Kaviar')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 73, \"ProductName\": \"R\u00f6d Kaviar\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=74,ProductName='Longlife%20Tofu')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 74, \"ProductName\": \"Longlife Tofu\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=75,ProductName='Rh%C3%B6nbr%C3%A4u%20Klosterbier')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 75, \"ProductName\": \"Rh\u00f6nbr\u00e4u Klosterbier\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=76,ProductName='Lakkalik%C3%B6%C3%B6ri')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 76, \"ProductName\": \"Lakkalik\u00f6\u00f6ri\"" +
  "}, {" +
  "\"__metadata\": {" +
  "\"uri\": \"http://services.odata.org/V2/Northwind/Northwind.svc/Current_Product_Lists(ProductID=77,ProductName='Original%20Frankfurter%20gr%C3%BCne%20So%C3%9Fe')\", \"type\": \"NorthwindModel.Current_Product_List\"" +
  "}, \"ProductID\": 77, \"ProductName\": \"Original Frankfurter gr\u00fcne So\u00dfe\"" +
  "}" +
  "]" +
  "}" +
  "}";

  var sCategories1ExpandProducts = '{\
  "d" : {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Categories(1)", "type": "NorthwindModel.Category"\
  }, "CategoryID": 1, "CategoryName": "Beverages", "Description": "Soft drinks, coffees, teas, beers, and ales", "Products": {\
  "results": [\
  {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)", "type": "NorthwindModel.Product"\
  }, "ProductID": 1, "ProductName": "Chai", "SupplierID": 1, "CategoryID": 1, "QuantityPerUnit": "10 boxes x 20 bags", "UnitPrice": "18.0000", "UnitsInStock": 39, "UnitsOnOrder": 0, "ReorderLevel": 10, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(2)", "type": "NorthwindModel.Product"\
  }, "ProductID": 2, "ProductName": "Chang", "SupplierID": 1, "CategoryID": 1, "QuantityPerUnit": "24 - 12 oz bottles", "UnitPrice": "19.0000", "UnitsInStock": 17, "UnitsOnOrder": 40, "ReorderLevel": 25, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(2)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(2)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(2)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(24)", "type": "NorthwindModel.Product"\
  }, "ProductID": 24, "ProductName": "Guaran\u00e1 Fant\u00e1stica", "SupplierID": 10, "CategoryID": 1, "QuantityPerUnit": "12 - 355 ml cans", "UnitPrice": "4.5000", "UnitsInStock": 20, "UnitsOnOrder": 0, "ReorderLevel": 0, "Discontinued": true, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(24)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(24)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(24)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(34)", "type": "NorthwindModel.Product"\
  }, "ProductID": 34, "ProductName": "Sasquatch Ale", "SupplierID": 16, "CategoryID": 1, "QuantityPerUnit": "24 - 12 oz bottles", "UnitPrice": "14.0000", "UnitsInStock": 111, "UnitsOnOrder": 0, "ReorderLevel": 15, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(34)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(34)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(34)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(35)", "type": "NorthwindModel.Product"\
  }, "ProductID": 35, "ProductName": "Steeleye Stout", "SupplierID": 16, "CategoryID": 1, "QuantityPerUnit": "24 - 12 oz bottles", "UnitPrice": "18.0000", "UnitsInStock": 20, "UnitsOnOrder": 0, "ReorderLevel": 15, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(35)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(35)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(35)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(38)", "type": "NorthwindModel.Product"\
  }, "ProductID": 38, "ProductName": "C\u00f4te de Blaye", "SupplierID": 18, "CategoryID": 1, "QuantityPerUnit": "12 - 75 cl bottles", "UnitPrice": "263.5000", "UnitsInStock": 17, "UnitsOnOrder": 0, "ReorderLevel": 15, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(38)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(38)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(38)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(39)", "type": "NorthwindModel.Product"\
  }, "ProductID": 39, "ProductName": "Chartreuse verte", "SupplierID": 18, "CategoryID": 1, "QuantityPerUnit": "750 cc per bottle", "UnitPrice": "18.0000", "UnitsInStock": 69, "UnitsOnOrder": 0, "ReorderLevel": 5, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(39)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(39)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(39)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(43)", "type": "NorthwindModel.Product"\
  }, "ProductID": 43, "ProductName": "Ipoh Coffee", "SupplierID": 20, "CategoryID": 1, "QuantityPerUnit": "16 - 500 g tins", "UnitPrice": "46.0000", "UnitsInStock": 17, "UnitsOnOrder": 10, "ReorderLevel": 25, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(43)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(43)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(43)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(67)", "type": "NorthwindModel.Product"\
  }, "ProductID": 67, "ProductName": "Laughing Lumberjack Lager", "SupplierID": 16, "CategoryID": 1, "QuantityPerUnit": "24 - 12 oz bottles", "UnitPrice": "14.0000", "UnitsInStock": 52, "UnitsOnOrder": 0, "ReorderLevel": 10, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(67)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(67)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(67)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)", "type": "NorthwindModel.Product"\
  }, "ProductID": 70, "ProductName": "Outback Lager", "SupplierID": 7, "CategoryID": 1, "QuantityPerUnit": "24 - 355 ml bottles", "UnitPrice": "15.0000", "UnitsInStock": 15, "UnitsOnOrder": 10, "ReorderLevel": 30, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(75)", "type": "NorthwindModel.Product"\
  }, "ProductID": 75, "ProductName": "Rh\u00f6nbr\u00e4u Klosterbier", "SupplierID": 12, "CategoryID": 1, "QuantityPerUnit": "24 - 0.5 l bottles", "UnitPrice": "7.7500", "UnitsInStock": 125, "UnitsOnOrder": 0, "ReorderLevel": 25, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(75)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(75)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(75)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(76)", "type": "NorthwindModel.Product"\
  }, "ProductID": 76, "ProductName": "Lakkalik\u00f6\u00f6ri", "SupplierID": 23, "CategoryID": 1, "QuantityPerUnit": "500 ml", "UnitPrice": "18.0000", "UnitsInStock": 57, "UnitsOnOrder": 0, "ReorderLevel": 20, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(76)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(76)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(76)/Supplier"\
  }\
  }\
  }\
  ]\
  }\
  }\
  }';

  var sCategories1ProductsSearch = '{\
  "d" : {\
  "results": [\
  {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)", "type": "NorthwindModel.Product"\
  }, "ProductID": 1, "ProductName": "Chai", "SupplierID": 1, "CategoryID": 1, "QuantityPerUnit": "10 boxes x 20 bags", "UnitPrice": "18.0000", "UnitsInStock": 39, "UnitsOnOrder": 0, "ReorderLevel": 10, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(2)", "type": "NorthwindModel.Product"\
  }, "ProductID": 2, "ProductName": "Chang", "SupplierID": 1, "CategoryID": 1, "QuantityPerUnit": "24 - 12 oz bottles", "UnitPrice": "19.0000", "UnitsInStock": 17, "UnitsOnOrder": 40, "ReorderLevel": 25, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(2)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(2)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(2)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(24)", "type": "NorthwindModel.Product"\
  }, "ProductID": 24, "ProductName": "Guaran\u00e1 Fant\u00e1stica", "SupplierID": 10, "CategoryID": 1, "QuantityPerUnit": "12 - 355 ml cans", "UnitPrice": "4.5000", "UnitsInStock": 20, "UnitsOnOrder": 0, "ReorderLevel": 0, "Discontinued": true, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(24)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(24)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(24)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(34)", "type": "NorthwindModel.Product"\
  }, "ProductID": 34, "ProductName": "Sasquatch Ale", "SupplierID": 16, "CategoryID": 1, "QuantityPerUnit": "24 - 12 oz bottles", "UnitPrice": "14.0000", "UnitsInStock": 111, "UnitsOnOrder": 0, "ReorderLevel": 15, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(34)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(34)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(34)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(35)", "type": "NorthwindModel.Product"\
  }, "ProductID": 35, "ProductName": "Steeleye Stout", "SupplierID": 16, "CategoryID": 1, "QuantityPerUnit": "24 - 12 oz bottles", "UnitPrice": "18.0000", "UnitsInStock": 20, "UnitsOnOrder": 0, "ReorderLevel": 15, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(35)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(35)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(35)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(38)", "type": "NorthwindModel.Product"\
  }, "ProductID": 38, "ProductName": "C\u00f4te de Blaye", "SupplierID": 18, "CategoryID": 1, "QuantityPerUnit": "12 - 75 cl bottles", "UnitPrice": "263.5000", "UnitsInStock": 17, "UnitsOnOrder": 0, "ReorderLevel": 15, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(38)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(38)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(38)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(39)", "type": "NorthwindModel.Product"\
  }, "ProductID": 39, "ProductName": "Chartreuse verte", "SupplierID": 18, "CategoryID": 1, "QuantityPerUnit": "750 cc per bottle", "UnitPrice": "18.0000", "UnitsInStock": 69, "UnitsOnOrder": 0, "ReorderLevel": 5, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(39)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(39)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(39)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(43)", "type": "NorthwindModel.Product"\
  }, "ProductID": 43, "ProductName": "Ipoh Coffee", "SupplierID": 20, "CategoryID": 1, "QuantityPerUnit": "16 - 500 g tins", "UnitPrice": "46.0000", "UnitsInStock": 17, "UnitsOnOrder": 10, "ReorderLevel": 25, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(43)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(43)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(43)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(67)", "type": "NorthwindModel.Product"\
  }, "ProductID": 67, "ProductName": "Laughing Lumberjack Lager", "SupplierID": 16, "CategoryID": 1, "QuantityPerUnit": "24 - 12 oz bottles", "UnitPrice": "14.0000", "UnitsInStock": 52, "UnitsOnOrder": 0, "ReorderLevel": 10, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(67)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(67)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(67)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)", "type": "NorthwindModel.Product"\
  }, "ProductID": 70, "ProductName": "Outback Lager", "SupplierID": 7, "CategoryID": 1, "QuantityPerUnit": "24 - 355 ml bottles", "UnitPrice": "15.0000", "UnitsInStock": 15, "UnitsOnOrder": 10, "ReorderLevel": 30, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(70)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(75)", "type": "NorthwindModel.Product"\
  }, "ProductID": 75, "ProductName": "Rh\u00f6nbr\u00e4u Klosterbier", "SupplierID": 12, "CategoryID": 1, "QuantityPerUnit": "24 - 0.5 l bottles", "UnitPrice": "7.7500", "UnitsInStock": 125, "UnitsOnOrder": 0, "ReorderLevel": 25, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(75)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(75)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(75)/Supplier"\
  }\
  }\
  }, {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(76)", "type": "NorthwindModel.Product"\
  }, "ProductID": 76, "ProductName": "Lakkalik\u00f6\u00f6ri", "SupplierID": 23, "CategoryID": 1, "QuantityPerUnit": "500 ml", "UnitPrice": "18.0000", "UnitsInStock": 57, "UnitsOnOrder": 0, "ReorderLevel": 20, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(76)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(76)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(76)/Supplier"\
  }\
  }\
  }\
  ]\
  }\
  }';

  var sCategories1ProductsFilterChai = '{\
  "d" : {\
  "results": [\
  {\
  "__metadata": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)", "type": "NorthwindModel.Product"\
  }, "ProductID": 1, "ProductName": "Chai", "SupplierID": 1, "CategoryID": 1, "QuantityPerUnit": "10 boxes x 20 bags", "UnitPrice": "18.0000", "UnitsInStock": 39, "UnitsOnOrder": 0, "ReorderLevel": 10, "Discontinued": false, "Category": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Category"\
  }\
  }, "Order_Details": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Order_Details"\
  }\
  }, "Supplier": {\
  "__deferred": {\
  "uri": "http://services.odata.org/V2/Northwind/Northwind.svc/Products(1)/Supplier"\
  }\
  }\
  }\
  ]\
  }\
}';

  var sCategoriesZeroCount = "{" +
	"\"d\" : {" +
		"\"results\": []," +
		"\"__count\": 0" +
	"}" +
 "}";

  var sSupplier1 = "{\n" +
  "	\"d\" : {\n" +
  "		\"__metadata\" : {\n" +
  "			\"uri\" : \"http://services.odata.org/V2/Northwind/Northwind.svc/Suppliers(1)\",\n" +
  "			\"type\" : \"NorthwindModel.Supplier\"\n" +
  "		},\n" +
  "		\"SupplierID\" : 1,\n" +
  "		\"CompanyName\" : \"Pavlova, Ltd.\",\n" +
  "		\"ContactName\" : \"Ian Devling\",\n" +
  "		\"ContactTitle\" : \"Marketing Manager\",\n" +
  "		\"Address\" : \"74 Rose St. Moonie Ponds\",\n" +
  "		\"City\" : \"Melbourne\",\n" +
  "		\"Region\" : \"Victoria\",\n" +
  "		\"PostalCode\" : \"3058\",\n" +
  "		\"Country\" : \"Australia\",\n" +
  "		\"Phone\" : \"(03) 444-2343\",\n" +
  "		\"Fax\" : \"(03) 444-6588\",\n" +
  "		\"HomePage\" : null\n" +
  "	}\n" +
  "}";

  return ofakeService;
});
/* eslint-disable no-implicit-globals */
var oCustomers1 = {
	"d" : {
		"results": [
			{
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ALFKI')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "ALFKI", "CompanyName": "Alfreds Futterkiste", "ContactName": "Maria Anders", "ContactTitle": "Sales Representative", "Address": "Obere Str. 57", "City": "Berlin", "Region": null, "PostalCode": "12209", "Country": "Germany", "Phone": "030-0074321", "Fax": "030-0076545", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ALFKI')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ALFKI')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ANATR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "ANATR", "CompanyName": "Ana Trujillo Emparedados y helados", "ContactName": "Ana Trujillo", "ContactTitle": "Owner", "Address": "Avda. de la Constituci\u00f3n 2222", "City": "M\u00e9xico D.F.", "Region": null, "PostalCode": "05021", "Country": "Mexico", "Phone": "(5) 555-4729", "Fax": "(5) 555-3745", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ANATR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ANATR')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ANTON')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "ANTON", "CompanyName": "Antonio Moreno Taquer\u00eda", "ContactName": "Antonio Moreno", "ContactTitle": "Owner", "Address": "Mataderos  2312", "City": "M\u00e9xico D.F.", "Region": null, "PostalCode": "05023", "Country": "Mexico", "Phone": "(5) 555-3932", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ANTON')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ANTON')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('AROUT')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "AROUT", "CompanyName": "Around the Horn", "ContactName": "Thomas Hardy", "ContactTitle": "Sales Representative", "Address": "120 Hanover Sq.", "City": "London", "Region": null, "PostalCode": "WA1 1DP", "Country": "UK", "Phone": "(171) 555-7788", "Fax": "(171) 555-6750", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('AROUT')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('AROUT')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BERGS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "BERGS", "CompanyName": "Berglunds snabbk\u00f6p", "ContactName": "Christina Berglund", "ContactTitle": "Order Administrator", "Address": "Berguvsv\u00e4gen  8", "City": "Lule\u00e5", "Region": null, "PostalCode": "S-958 22", "Country": "Sweden", "Phone": "0921-12 34 65", "Fax": "0921-12 34 67", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BERGS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BERGS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BLAUS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "BLAUS", "CompanyName": "Blauer See Delikatessen", "ContactName": "Hanna Moos", "ContactTitle": "Sales Representative", "Address": "Forsterstr. 57", "City": "Mannheim", "Region": null, "PostalCode": "68306", "Country": "Germany", "Phone": "0621-08460", "Fax": "0621-08924", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BLAUS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BLAUS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BLONP')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "BLONP", "CompanyName": "Blondesddsl p\u00e8re et fils", "ContactName": "Fr\u00e9d\u00e9rique Citeaux", "ContactTitle": "Marketing Manager", "Address": "24, place Kl\u00e9ber", "City": "Strasbourg", "Region": null, "PostalCode": "67000", "Country": "France", "Phone": "88.60.15.31", "Fax": "88.60.15.32", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BLONP')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BLONP')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BOLID')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "BOLID", "CompanyName": "B\u00f3lido Comidas preparadas", "ContactName": "Mart\u00edn Sommer", "ContactTitle": "Owner", "Address": "C/ Araquil, 67", "City": "Madrid", "Region": null, "PostalCode": "28023", "Country": "Spain", "Phone": "(91) 555 22 82", "Fax": "(91) 555 91 99", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BOLID')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BOLID')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BONAP')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "BONAP", "CompanyName": "Bon app'", "ContactName": "Laurence Lebihan", "ContactTitle": "Owner", "Address": "12, rue des Bouchers", "City": "Marseille", "Region": null, "PostalCode": "13008", "Country": "France", "Phone": "91.24.45.40", "Fax": "91.24.45.41", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BONAP')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BONAP')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BOTTM')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "BOTTM", "CompanyName": "Bottom-Dollar Markets", "ContactName": "Elizabeth Lincoln", "ContactTitle": "Accounting Manager", "Address": "23 Tsawassen Blvd.", "City": "Tsawassen", "Region": "BC", "PostalCode": "T2F 8M4", "Country": "Canada", "Phone": "(604) 555-4729", "Fax": "(604) 555-3745", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BOTTM')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BOTTM')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BSBEV')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "BSBEV", "CompanyName": "B's Beverages", "ContactName": "Victoria Ashworth", "ContactTitle": "Sales Representative", "Address": "Fauntleroy Circus", "City": "London", "Region": null, "PostalCode": "EC2 5NT", "Country": "UK", "Phone": "(171) 555-1212", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BSBEV')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('BSBEV')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CACTU')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "CACTU", "CompanyName": "Cactus Comidas para llevar", "ContactName": "Patricio Simpson", "ContactTitle": "Sales Agent", "Address": "Cerrito 333", "City": "Buenos Aires", "Region": null, "PostalCode": "1010", "Country": "Argentina", "Phone": "(1) 135-5555", "Fax": "(1) 135-4892", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CACTU')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CACTU')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CENTC')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "CENTC", "CompanyName": "Centro comercial Moctezuma", "ContactName": "Francisco Chang", "ContactTitle": "Marketing Manager", "Address": "Sierras de Granada 9993", "City": "M\u00e9xico D.F.", "Region": null, "PostalCode": "05022", "Country": "Mexico", "Phone": "(5) 555-3392", "Fax": "(5) 555-7293", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CENTC')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CENTC')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CHOPS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "CHOPS", "CompanyName": "Chop-suey Chinese", "ContactName": "Yang Wang", "ContactTitle": "Owner", "Address": "Hauptstr. 29", "City": "Bern", "Region": null, "PostalCode": "3012", "Country": "Switzerland", "Phone": "0452-076545", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CHOPS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CHOPS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('COMMI')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "COMMI", "CompanyName": "Com\u00e9rcio Mineiro", "ContactName": "Pedro Afonso", "ContactTitle": "Sales Associate", "Address": "Av. dos Lus\u00edadas, 23", "City": "Sao Paulo", "Region": "SP", "PostalCode": "05432-043", "Country": "Brazil", "Phone": "(11) 555-7647", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('COMMI')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('COMMI')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CONSH')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "CONSH", "CompanyName": "Consolidated Holdings", "ContactName": "Elizabeth Brown", "ContactTitle": "Sales Representative", "Address": "Berkeley Gardens 12  Brewery", "City": "London", "Region": null, "PostalCode": "WX1 6LT", "Country": "UK", "Phone": "(171) 555-2282", "Fax": "(171) 555-9199", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CONSH')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('CONSH')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('DRACD')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "DRACD", "CompanyName": "Drachenblut Delikatessen", "ContactName": "Sven Ottlieb", "ContactTitle": "Order Administrator", "Address": "Walserweg 21", "City": "Aachen", "Region": null, "PostalCode": "52066", "Country": "Germany", "Phone": "0241-039123", "Fax": "0241-059428", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('DRACD')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('DRACD')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('DUMON')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "DUMON", "CompanyName": "Du monde entier", "ContactName": "Janine Labrune", "ContactTitle": "Owner", "Address": "67, rue des Cinquante Otages", "City": "Nantes", "Region": null, "PostalCode": "44000", "Country": "France", "Phone": "40.67.88.88", "Fax": "40.67.89.89", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('DUMON')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('DUMON')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('EASTC')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "EASTC", "CompanyName": "Eastern Connection", "ContactName": "Ann Devon", "ContactTitle": "Sales Agent", "Address": "35 King George", "City": "London", "Region": null, "PostalCode": "WX3 6FW", "Country": "UK", "Phone": "(171) 555-0297", "Fax": "(171) 555-3373", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('EASTC')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('EASTC')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ERNSH')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "ERNSH", "CompanyName": "Ernst Handel", "ContactName": "Roland Mendel", "ContactTitle": "Sales Manager", "Address": "Kirchgasse 6", "City": "Graz", "Region": null, "PostalCode": "8010", "Country": "Austria", "Phone": "7675-3425", "Fax": "7675-3426", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ERNSH')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ERNSH')/CustomerDemographics"
					}
				}
			}
		], "__next": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers?$top=40&$skiptoken='ERNSH'"
	}
};

// skip 20 top 50
var oCustomers2 = {
	"d" : {
		"results": [
			{
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FAMIA')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FAMIA", "CompanyName": "Familia Arquibaldo", "ContactName": "Aria Cruz", "ContactTitle": "Marketing Assistant", "Address": "Rua Or\u00f3s, 92", "City": "Sao Paulo", "Region": "SP", "PostalCode": "05442-030", "Country": "Brazil", "Phone": "(11) 555-9857", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FAMIA')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FAMIA')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FISSA')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FISSA", "CompanyName": "FISSA Fabrica Inter. Salchichas S.A.", "ContactName": "Diego Roel", "ContactTitle": "Accounting Manager", "Address": "C/ Moralzarzal, 86", "City": "Madrid", "Region": null, "PostalCode": "28034", "Country": "Spain", "Phone": "(91) 555 94 44", "Fax": "(91) 555 55 93", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FISSA')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FISSA')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLIG')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FOLIG", "CompanyName": "Folies gourmandes", "ContactName": "Martine Ranc\u00e9", "ContactTitle": "Assistant Sales Agent", "Address": "184, chauss\u00e9e de Tournai", "City": "Lille", "Region": null, "PostalCode": "59000", "Country": "France", "Phone": "20.16.10.16", "Fax": "20.16.10.17", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLIG')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLIG')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLKO')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FOLKO", "CompanyName": "Folk och f\u00e4 HB", "ContactName": "Maria Larsson", "ContactTitle": "Owner", "Address": "\u00c5kergatan 24", "City": "Br\u00e4cke", "Region": null, "PostalCode": "S-844 67", "Country": "Sweden", "Phone": "0695-34 67 21", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLKO')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLKO')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANK')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FRANK", "CompanyName": "Frankenversand", "ContactName": "Peter Franken", "ContactTitle": "Marketing Manager", "Address": "Berliner Platz 43", "City": "M\u00fcnchen", "Region": null, "PostalCode": "80805", "Country": "Germany", "Phone": "089-0877310", "Fax": "089-0877451", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANK')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANK')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FRANR", "CompanyName": "France restauration", "ContactName": "Carine Schmitt", "ContactTitle": "Marketing Manager", "Address": "54, rue Royale", "City": "Nantes", "Region": null, "PostalCode": "44000", "Country": "France", "Phone": "40.32.21.21", "Fax": "40.32.21.20", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANR')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FRANS", "CompanyName": "Franchi S.p.A.", "ContactName": "Paolo Accorti", "ContactTitle": "Sales Representative", "Address": "Via Monte Bianco 34", "City": "Torino", "Region": null, "PostalCode": "10100", "Country": "Italy", "Phone": "011-4988260", "Fax": "011-4988261", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FURIB')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FURIB", "CompanyName": "Furia Bacalhau e Frutos do Mar", "ContactName": "Lino Rodriguez", "ContactTitle": "Sales Manager", "Address": "Jardim das rosas n. 32", "City": "Lisboa", "Region": null, "PostalCode": "1675", "Country": "Portugal", "Phone": "(1) 354-2534", "Fax": "(1) 354-2535", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FURIB')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FURIB')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GALED')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "GALED", "CompanyName": "Galer\u00eda del gastr\u00f3nomo", "ContactName": "Eduardo Saavedra", "ContactTitle": "Marketing Manager", "Address": "Rambla de Catalu\u00f1a, 23", "City": "Barcelona", "Region": null, "PostalCode": "08022", "Country": "Spain", "Phone": "(93) 203 4560", "Fax": "(93) 203 4561", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GALED')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GALED')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GODOS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "GODOS", "CompanyName": "Godos Cocina T\u00edpica", "ContactName": "Jos\u00e9 Pedro Freyre", "ContactTitle": "Sales Manager", "Address": "C/ Romero, 33", "City": "Sevilla", "Region": null, "PostalCode": "41101", "Country": "Spain", "Phone": "(95) 555 82 82", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GODOS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GODOS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GOURL')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "GOURL", "CompanyName": "Gourmet Lanchonetes", "ContactName": "Andr\u00e9 Fonseca", "ContactTitle": "Sales Associate", "Address": "Av. Brasil, 442", "City": "Campinas", "Region": "SP", "PostalCode": "04876-786", "Country": "Brazil", "Phone": "(11) 555-9482", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GOURL')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GOURL')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GREAL')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "GREAL", "CompanyName": "Great Lakes Food Market", "ContactName": "Howard Snyder", "ContactTitle": "Marketing Manager", "Address": "2732 Baker Blvd.", "City": "Eugene", "Region": "OR", "PostalCode": "97403", "Country": "USA", "Phone": "(503) 555-7555", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GREAL')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GREAL')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GROSR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "GROSR", "CompanyName": "GROSELLA-Restaurante", "ContactName": "Manuel Pereira", "ContactTitle": "Owner", "Address": "5\u00aa Ave. Los Palos Grandes", "City": "Caracas", "Region": "DF", "PostalCode": "1081", "Country": "Venezuela", "Phone": "(2) 283-2951", "Fax": "(2) 283-3397", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GROSR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GROSR')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HANAR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "HANAR", "CompanyName": "Hanari Carnes", "ContactName": "Mario Pontes", "ContactTitle": "Accounting Manager", "Address": "Rua do Pa\u00e7o, 67", "City": "Rio de Janeiro", "Region": "RJ", "PostalCode": "05454-876", "Country": "Brazil", "Phone": "(21) 555-0091", "Fax": "(21) 555-8765", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HANAR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HANAR')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HILAA')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "HILAA", "CompanyName": "HILARION-Abastos", "ContactName": "Carlos Hern\u00e1ndez", "ContactTitle": "Sales Representative", "Address": "Carrera 22 con Ave. Carlos Soublette #8-35", "City": "San Crist\u00f3bal", "Region": "T\u00e1chira", "PostalCode": "5022", "Country": "Venezuela", "Phone": "(5) 555-1340", "Fax": "(5) 555-1948", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HILAA')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HILAA')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGC')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "HUNGC", "CompanyName": "Hungry Coyote Import Store", "ContactName": "Yoshi Latimer", "ContactTitle": "Sales Representative", "Address": "City Center Plaza 516 Main St.", "City": "Elgin", "Region": "OR", "PostalCode": "97827", "Country": "USA", "Phone": "(503) 555-6874", "Fax": "(503) 555-2376", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGC')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGC')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGO')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "HUNGO", "CompanyName": "Hungry Owl All-Night Grocers", "ContactName": "Patricia McKenna", "ContactTitle": "Sales Associate", "Address": "8 Johnstown Road", "City": "Cork", "Region": "Co. Cork", "PostalCode": null, "Country": "Ireland", "Phone": "2967 542", "Fax": "2967 3333", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGO')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGO')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ISLAT')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "ISLAT", "CompanyName": "Island Trading", "ContactName": "Helen Bennett", "ContactTitle": "Marketing Manager", "Address": "Garden House Crowther Way", "City": "Cowes", "Region": "Isle of Wight", "PostalCode": "PO31 7PJ", "Country": "UK", "Phone": "(198) 555-8888", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ISLAT')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ISLAT')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('KOENE')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "KOENE", "CompanyName": "K\u00f6niglich Essen", "ContactName": "Philip Cramer", "ContactTitle": "Sales Associate", "Address": "Maubelstr. 90", "City": "Brandenburg", "Region": null, "PostalCode": "14776", "Country": "Germany", "Phone": "0555-09876", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('KOENE')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('KOENE')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LACOR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LACOR", "CompanyName": "La corne d'abondance", "ContactName": "Daniel Tonini", "ContactTitle": "Sales Representative", "Address": "67, avenue de l'Europe", "City": "Versailles", "Region": null, "PostalCode": "78000", "Country": "France", "Phone": "30.59.84.10", "Fax": "30.59.85.11", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LACOR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LACOR')/CustomerDemographics"
					}
				}
			}
		], "__next": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers?$top=30&$skiptoken='LACOR'"
	}
};

// skip 20 top 40
var oCustomers11 = {
  "d" : {
    "results" : oCustomers2.d.results,
    "__next": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers/?$top=20&$skiptoken='LACOR'"
  }
};

var oCustomers3 = {
	"d" : {
		"results": [
			{
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAMAI')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LAMAI", "CompanyName": "La maison d'Asie", "ContactName": "Annette Roulet", "ContactTitle": "Sales Manager", "Address": "1 rue Alsace-Lorraine", "City": "Toulouse", "Region": null, "PostalCode": "31000", "Country": "France", "Phone": "61.77.61.10", "Fax": "61.77.61.11", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAMAI')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAMAI')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAUGB')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LAUGB", "CompanyName": "Laughing Bacchus Wine Cellars", "ContactName": "Yoshi Tannamuri", "ContactTitle": "Marketing Assistant", "Address": "1900 Oak St.", "City": "Vancouver", "Region": "BC", "PostalCode": "V3F 2K1", "Country": "Canada", "Phone": "(604) 555-3392", "Fax": "(604) 555-7293", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAUGB')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAUGB')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAZYK')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LAZYK", "CompanyName": "Lazy K Kountry Store", "ContactName": "John Steel", "ContactTitle": "Marketing Manager", "Address": "12 Orchestra Terrace", "City": "Walla Walla", "Region": "WA", "PostalCode": "99362", "Country": "USA", "Phone": "(509) 555-7969", "Fax": "(509) 555-6221", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAZYK')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAZYK')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LEHMS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LEHMS", "CompanyName": "Lehmanns Marktstand", "ContactName": "Renate Messner", "ContactTitle": "Sales Representative", "Address": "Magazinweg 7", "City": "Frankfurt a.M.", "Region": null, "PostalCode": "60528", "Country": "Germany", "Phone": "069-0245984", "Fax": "069-0245874", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LEHMS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LEHMS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LETSS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LETSS", "CompanyName": "Let's Stop N Shop", "ContactName": "Jaime Yorres", "ContactTitle": "Owner", "Address": "87 Polk St. Suite 5", "City": "San Francisco", "Region": "CA", "PostalCode": "94117", "Country": "USA", "Phone": "(415) 555-5938", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LETSS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LETSS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LILAS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LILAS", "CompanyName": "LILA-Supermercado", "ContactName": "Carlos Gonz\u00e1lez", "ContactTitle": "Accounting Manager", "Address": "Carrera 52 con Ave. Bol\u00edvar #65-98 Llano Largo", "City": "Barquisimeto", "Region": "Lara", "PostalCode": "3508", "Country": "Venezuela", "Phone": "(9) 331-6954", "Fax": "(9) 331-7256", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LILAS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LILAS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LINOD')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LINOD", "CompanyName": "LINO-Delicateses", "ContactName": "Felipe Izquierdo", "ContactTitle": "Owner", "Address": "Ave. 5 de Mayo Porlamar", "City": "I. de Margarita", "Region": "Nueva Esparta", "PostalCode": "4980", "Country": "Venezuela", "Phone": "(8) 34-56-12", "Fax": "(8) 34-93-93", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LINOD')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LINOD')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LONEP')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LONEP", "CompanyName": "Lonesome Pine Restaurant", "ContactName": "Fran Wilson", "ContactTitle": "Sales Manager", "Address": "89 Chiaroscuro Rd.", "City": "Portland", "Region": "OR", "PostalCode": "97219", "Country": "USA", "Phone": "(503) 555-9573", "Fax": "(503) 555-9646", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LONEP')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LONEP')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAGAA')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "MAGAA", "CompanyName": "Magazzini Alimentari Riuniti", "ContactName": "Giovanni Rovelli", "ContactTitle": "Marketing Manager", "Address": "Via Ludovico il Moro 22", "City": "Bergamo", "Region": null, "PostalCode": "24100", "Country": "Italy", "Phone": "035-640230", "Fax": "035-640231", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAGAA')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAGAA')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAISD')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "MAISD", "CompanyName": "Maison Dewey", "ContactName": "Catherine Dewey", "ContactTitle": "Sales Agent", "Address": "Rue Joseph-Bens 532", "City": "Bruxelles", "Region": null, "PostalCode": "B-1180", "Country": "Belgium", "Phone": "(02) 201 24 67", "Fax": "(02) 201 24 68", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAISD')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAISD')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MEREP')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "MEREP", "CompanyName": "M\u00e8re Paillarde", "ContactName": "Jean Fresni\u00e8re", "ContactTitle": "Marketing Assistant", "Address": "43 rue St. Laurent", "City": "Montr\u00e9al", "Region": "Qu\u00e9bec", "PostalCode": "H1J 1C3", "Country": "Canada", "Phone": "(514) 555-8054", "Fax": "(514) 555-8055", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MEREP')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MEREP')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MORGK')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "MORGK", "CompanyName": "Morgenstern Gesundkost", "ContactName": "Alexander Feuer", "ContactTitle": "Marketing Assistant", "Address": "Heerstr. 22", "City": "Leipzig", "Region": null, "PostalCode": "04179", "Country": "Germany", "Phone": "0342-023176", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MORGK')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MORGK')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('NORTS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "NORTS", "CompanyName": "North/South", "ContactName": "Simon Crowther", "ContactTitle": "Sales Associate", "Address": "South House 300 Queensbridge", "City": "London", "Region": null, "PostalCode": "SW7 1RZ", "Country": "UK", "Phone": "(171) 555-7733", "Fax": "(171) 555-2530", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('NORTS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('NORTS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OCEAN')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "OCEAN", "CompanyName": "Oc\u00e9ano Atl\u00e1ntico Ltda.", "ContactName": "Yvonne Moncada", "ContactTitle": "Sales Agent", "Address": "Ing. Gustavo Moncada 8585 Piso 20-A", "City": "Buenos Aires", "Region": null, "PostalCode": "1010", "Country": "Argentina", "Phone": "(1) 135-5333", "Fax": "(1) 135-5535", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OCEAN')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OCEAN')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OLDWO')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "OLDWO", "CompanyName": "Old World Delicatessen", "ContactName": "Rene Phillips", "ContactTitle": "Sales Representative", "Address": "2743 Bering St.", "City": "Anchorage", "Region": "AK", "PostalCode": "99508", "Country": "USA", "Phone": "(907) 555-7584", "Fax": "(907) 555-2880", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OLDWO')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OLDWO')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OTTIK')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "OTTIK", "CompanyName": "Ottilies K\u00e4seladen", "ContactName": "Henriette Pfalzheim", "ContactTitle": "Owner", "Address": "Mehrheimerstr. 369", "City": "K\u00f6ln", "Region": null, "PostalCode": "50739", "Country": "Germany", "Phone": "0221-0644327", "Fax": "0221-0765721", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OTTIK')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OTTIK')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PARIS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "PARIS", "CompanyName": "Paris sp\u00e9cialit\u00e9s", "ContactName": "Marie Bertrand", "ContactTitle": "Owner", "Address": "265, boulevard Charonne", "City": "Paris", "Region": null, "PostalCode": "75012", "Country": "France", "Phone": "(1) 42.34.22.66", "Fax": "(1) 42.34.22.77", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PARIS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PARIS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PERIC')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "PERIC", "CompanyName": "Pericles Comidas cl\u00e1sicas", "ContactName": "Guillermo Fern\u00e1ndez", "ContactTitle": "Sales Representative", "Address": "Calle Dr. Jorge Cash 321", "City": "M\u00e9xico D.F.", "Region": null, "PostalCode": "05033", "Country": "Mexico", "Phone": "(5) 552-3745", "Fax": "(5) 545-3745", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PERIC')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PERIC')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PICCO')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "PICCO", "CompanyName": "Piccolo und mehr", "ContactName": "Georg Pipps", "ContactTitle": "Sales Manager", "Address": "Geislweg 14", "City": "Salzburg", "Region": null, "PostalCode": "5020", "Country": "Austria", "Phone": "6562-9722", "Fax": "6562-9723", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PICCO')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PICCO')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PRINI')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "PRINI", "CompanyName": "Princesa Isabel Vinhos", "ContactName": "Isabel de Castro", "ContactTitle": "Sales Representative", "Address": "Estrada da sa\u00fade n. 58", "City": "Lisboa", "Region": null, "PostalCode": "1756", "Country": "Portugal", "Phone": "(1) 356-5634", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PRINI')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PRINI')/CustomerDemographics"
					}
				}
			}
		], "__next": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers?$top=30&$skiptoken='PRINI'"
	}
};

var oCustomers4 = {
	"d" : {
		"results": [
			{
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FISSA')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FISSA", "CompanyName": "FISSA Fabrica Inter. Salchichas S.A.", "ContactName": "Diego Roel", "ContactTitle": "Accounting Manager", "Address": "C/ Moralzarzal, 86", "City": "Madrid", "Region": null, "PostalCode": "28034", "Country": "Spain", "Phone": "(91) 555 94 44", "Fax": "(91) 555 55 93", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FISSA')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FISSA')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLIG')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FOLIG", "CompanyName": "Folies gourmandes", "ContactName": "Martine Ranc\u00e9", "ContactTitle": "Assistant Sales Agent", "Address": "184, chauss\u00e9e de Tournai", "City": "Lille", "Region": null, "PostalCode": "59000", "Country": "France", "Phone": "20.16.10.16", "Fax": "20.16.10.17", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLIG')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLIG')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLKO')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FOLKO", "CompanyName": "Folk och f\u00e4 HB", "ContactName": "Maria Larsson", "ContactTitle": "Owner", "Address": "\u00c5kergatan 24", "City": "Br\u00e4cke", "Region": null, "PostalCode": "S-844 67", "Country": "Sweden", "Phone": "0695-34 67 21", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLKO')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FOLKO')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANK')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FRANK", "CompanyName": "Frankenversand", "ContactName": "Peter Franken", "ContactTitle": "Marketing Manager", "Address": "Berliner Platz 43", "City": "M\u00fcnchen", "Region": null, "PostalCode": "80805", "Country": "Germany", "Phone": "089-0877310", "Fax": "089-0877451", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANK')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANK')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FRANR", "CompanyName": "France restauration", "ContactName": "Carine Schmitt", "ContactTitle": "Marketing Manager", "Address": "54, rue Royale", "City": "Nantes", "Region": null, "PostalCode": "44000", "Country": "France", "Phone": "40.32.21.21", "Fax": "40.32.21.20", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANR')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FRANS", "CompanyName": "Franchi S.p.A.", "ContactName": "Paolo Accorti", "ContactTitle": "Sales Representative", "Address": "Via Monte Bianco 34", "City": "Torino", "Region": null, "PostalCode": "10100", "Country": "Italy", "Phone": "011-4988260", "Fax": "011-4988261", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FRANS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FURIB')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "FURIB", "CompanyName": "Furia Bacalhau e Frutos do Mar", "ContactName": "Lino Rodriguez", "ContactTitle": "Sales Manager", "Address": "Jardim das rosas n. 32", "City": "Lisboa", "Region": null, "PostalCode": "1675", "Country": "Portugal", "Phone": "(1) 354-2534", "Fax": "(1) 354-2535", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FURIB')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('FURIB')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GALED')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "GALED", "CompanyName": "Galer\u00eda del gastr\u00f3nomo", "ContactName": "Eduardo Saavedra", "ContactTitle": "Marketing Manager", "Address": "Rambla de Catalu\u00f1a, 23", "City": "Barcelona", "Region": null, "PostalCode": "08022", "Country": "Spain", "Phone": "(93) 203 4560", "Fax": "(93) 203 4561", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GALED')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GALED')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GODOS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "GODOS", "CompanyName": "Godos Cocina T\u00edpica", "ContactName": "Jos\u00e9 Pedro Freyre", "ContactTitle": "Sales Manager", "Address": "C/ Romero, 33", "City": "Sevilla", "Region": null, "PostalCode": "41101", "Country": "Spain", "Phone": "(95) 555 82 82", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GODOS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GODOS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GOURL')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "GOURL", "CompanyName": "Gourmet Lanchonetes", "ContactName": "Andr\u00e9 Fonseca", "ContactTitle": "Sales Associate", "Address": "Av. Brasil, 442", "City": "Campinas", "Region": "SP", "PostalCode": "04876-786", "Country": "Brazil", "Phone": "(11) 555-9482", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GOURL')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GOURL')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GREAL')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "GREAL", "CompanyName": "Great Lakes Food Market", "ContactName": "Howard Snyder", "ContactTitle": "Marketing Manager", "Address": "2732 Baker Blvd.", "City": "Eugene", "Region": "OR", "PostalCode": "97403", "Country": "USA", "Phone": "(503) 555-7555", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GREAL')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GREAL')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GROSR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "GROSR", "CompanyName": "GROSELLA-Restaurante", "ContactName": "Manuel Pereira", "ContactTitle": "Owner", "Address": "5\u00aa Ave. Los Palos Grandes", "City": "Caracas", "Region": "DF", "PostalCode": "1081", "Country": "Venezuela", "Phone": "(2) 283-2951", "Fax": "(2) 283-3397", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GROSR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('GROSR')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HANAR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "HANAR", "CompanyName": "Hanari Carnes", "ContactName": "Mario Pontes", "ContactTitle": "Accounting Manager", "Address": "Rua do Pa\u00e7o, 67", "City": "Rio de Janeiro", "Region": "RJ", "PostalCode": "05454-876", "Country": "Brazil", "Phone": "(21) 555-0091", "Fax": "(21) 555-8765", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HANAR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HANAR')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HILAA')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "HILAA", "CompanyName": "HILARION-Abastos", "ContactName": "Carlos Hern\u00e1ndez", "ContactTitle": "Sales Representative", "Address": "Carrera 22 con Ave. Carlos Soublette #8-35", "City": "San Crist\u00f3bal", "Region": "T\u00e1chira", "PostalCode": "5022", "Country": "Venezuela", "Phone": "(5) 555-1340", "Fax": "(5) 555-1948", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HILAA')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HILAA')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGC')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "HUNGC", "CompanyName": "Hungry Coyote Import Store", "ContactName": "Yoshi Latimer", "ContactTitle": "Sales Representative", "Address": "City Center Plaza 516 Main St.", "City": "Elgin", "Region": "OR", "PostalCode": "97827", "Country": "USA", "Phone": "(503) 555-6874", "Fax": "(503) 555-2376", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGC')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGC')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGO')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "HUNGO", "CompanyName": "Hungry Owl All-Night Grocers", "ContactName": "Patricia McKenna", "ContactTitle": "Sales Associate", "Address": "8 Johnstown Road", "City": "Cork", "Region": "Co. Cork", "PostalCode": null, "Country": "Ireland", "Phone": "2967 542", "Fax": "2967 3333", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGO')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('HUNGO')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ISLAT')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "ISLAT", "CompanyName": "Island Trading", "ContactName": "Helen Bennett", "ContactTitle": "Marketing Manager", "Address": "Garden House Crowther Way", "City": "Cowes", "Region": "Isle of Wight", "PostalCode": "PO31 7PJ", "Country": "UK", "Phone": "(198) 555-8888", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ISLAT')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ISLAT')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('KOENE')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "KOENE", "CompanyName": "K\u00f6niglich Essen", "ContactName": "Philip Cramer", "ContactTitle": "Sales Associate", "Address": "Maubelstr. 90", "City": "Brandenburg", "Region": null, "PostalCode": "14776", "Country": "Germany", "Phone": "0555-09876", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('KOENE')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('KOENE')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LACOR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LACOR", "CompanyName": "La corne d'abondance", "ContactName": "Daniel Tonini", "ContactTitle": "Sales Representative", "Address": "67, avenue de l'Europe", "City": "Versailles", "Region": null, "PostalCode": "78000", "Country": "France", "Phone": "30.59.84.10", "Fax": "30.59.85.11", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LACOR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LACOR')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAMAI')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LAMAI", "CompanyName": "La maison d'Asie", "ContactName": "Annette Roulet", "ContactTitle": "Sales Manager", "Address": "1 rue Alsace-Lorraine", "City": "Toulouse", "Region": null, "PostalCode": "31000", "Country": "France", "Phone": "61.77.61.10", "Fax": "61.77.61.11", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAMAI')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAMAI')/CustomerDemographics"
					}
				}
			}
		], "__next": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers?$top=22&$skiptoken='LAMAI'"
	}
};

var oCustomers5 = {
	"d" : {
		"results": [
			{
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAUGB')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LAUGB", "CompanyName": "Laughing Bacchus Wine Cellars", "ContactName": "Yoshi Tannamuri", "ContactTitle": "Marketing Assistant", "Address": "1900 Oak St.", "City": "Vancouver", "Region": "BC", "PostalCode": "V3F 2K1", "Country": "Canada", "Phone": "(604) 555-3392", "Fax": "(604) 555-7293", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAUGB')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAUGB')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAZYK')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LAZYK", "CompanyName": "Lazy K Kountry Store", "ContactName": "John Steel", "ContactTitle": "Marketing Manager", "Address": "12 Orchestra Terrace", "City": "Walla Walla", "Region": "WA", "PostalCode": "99362", "Country": "USA", "Phone": "(509) 555-7969", "Fax": "(509) 555-6221", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAZYK')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LAZYK')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LEHMS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LEHMS", "CompanyName": "Lehmanns Marktstand", "ContactName": "Renate Messner", "ContactTitle": "Sales Representative", "Address": "Magazinweg 7", "City": "Frankfurt a.M.", "Region": null, "PostalCode": "60528", "Country": "Germany", "Phone": "069-0245984", "Fax": "069-0245874", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LEHMS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LEHMS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LETSS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LETSS", "CompanyName": "Let's Stop N Shop", "ContactName": "Jaime Yorres", "ContactTitle": "Owner", "Address": "87 Polk St. Suite 5", "City": "San Francisco", "Region": "CA", "PostalCode": "94117", "Country": "USA", "Phone": "(415) 555-5938", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LETSS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LETSS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LILAS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LILAS", "CompanyName": "LILA-Supermercado", "ContactName": "Carlos Gonz\u00e1lez", "ContactTitle": "Accounting Manager", "Address": "Carrera 52 con Ave. Bol\u00edvar #65-98 Llano Largo", "City": "Barquisimeto", "Region": "Lara", "PostalCode": "3508", "Country": "Venezuela", "Phone": "(9) 331-6954", "Fax": "(9) 331-7256", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LILAS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LILAS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LINOD')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LINOD", "CompanyName": "LINO-Delicateses", "ContactName": "Felipe Izquierdo", "ContactTitle": "Owner", "Address": "Ave. 5 de Mayo Porlamar", "City": "I. de Margarita", "Region": "Nueva Esparta", "PostalCode": "4980", "Country": "Venezuela", "Phone": "(8) 34-56-12", "Fax": "(8) 34-93-93", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LINOD')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LINOD')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LONEP')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "LONEP", "CompanyName": "Lonesome Pine Restaurant", "ContactName": "Fran Wilson", "ContactTitle": "Sales Manager", "Address": "89 Chiaroscuro Rd.", "City": "Portland", "Region": "OR", "PostalCode": "97219", "Country": "USA", "Phone": "(503) 555-9573", "Fax": "(503) 555-9646", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LONEP')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('LONEP')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAGAA')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "MAGAA", "CompanyName": "Magazzini Alimentari Riuniti", "ContactName": "Giovanni Rovelli", "ContactTitle": "Marketing Manager", "Address": "Via Ludovico il Moro 22", "City": "Bergamo", "Region": null, "PostalCode": "24100", "Country": "Italy", "Phone": "035-640230", "Fax": "035-640231", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAGAA')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAGAA')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAISD')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "MAISD", "CompanyName": "Maison Dewey", "ContactName": "Catherine Dewey", "ContactTitle": "Sales Agent", "Address": "Rue Joseph-Bens 532", "City": "Bruxelles", "Region": null, "PostalCode": "B-1180", "Country": "Belgium", "Phone": "(02) 201 24 67", "Fax": "(02) 201 24 68", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAISD')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MAISD')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MEREP')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "MEREP", "CompanyName": "M\u00e8re Paillarde", "ContactName": "Jean Fresni\u00e8re", "ContactTitle": "Marketing Assistant", "Address": "43 rue St. Laurent", "City": "Montr\u00e9al", "Region": "Qu\u00e9bec", "PostalCode": "H1J 1C3", "Country": "Canada", "Phone": "(514) 555-8054", "Fax": "(514) 555-8055", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MEREP')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MEREP')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MORGK')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "MORGK", "CompanyName": "Morgenstern Gesundkost", "ContactName": "Alexander Feuer", "ContactTitle": "Marketing Assistant", "Address": "Heerstr. 22", "City": "Leipzig", "Region": null, "PostalCode": "04179", "Country": "Germany", "Phone": "0342-023176", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MORGK')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('MORGK')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('NORTS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "NORTS", "CompanyName": "North/South", "ContactName": "Simon Crowther", "ContactTitle": "Sales Associate", "Address": "South House 300 Queensbridge", "City": "London", "Region": null, "PostalCode": "SW7 1RZ", "Country": "UK", "Phone": "(171) 555-7733", "Fax": "(171) 555-2530", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('NORTS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('NORTS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OCEAN')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "OCEAN", "CompanyName": "Oc\u00e9ano Atl\u00e1ntico Ltda.", "ContactName": "Yvonne Moncada", "ContactTitle": "Sales Agent", "Address": "Ing. Gustavo Moncada 8585 Piso 20-A", "City": "Buenos Aires", "Region": null, "PostalCode": "1010", "Country": "Argentina", "Phone": "(1) 135-5333", "Fax": "(1) 135-5535", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OCEAN')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OCEAN')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OLDWO')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "OLDWO", "CompanyName": "Old World Delicatessen", "ContactName": "Rene Phillips", "ContactTitle": "Sales Representative", "Address": "2743 Bering St.", "City": "Anchorage", "Region": "AK", "PostalCode": "99508", "Country": "USA", "Phone": "(907) 555-7584", "Fax": "(907) 555-2880", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OLDWO')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OLDWO')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OTTIK')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "OTTIK", "CompanyName": "Ottilies K\u00e4seladen", "ContactName": "Henriette Pfalzheim", "ContactTitle": "Owner", "Address": "Mehrheimerstr. 369", "City": "K\u00f6ln", "Region": null, "PostalCode": "50739", "Country": "Germany", "Phone": "0221-0644327", "Fax": "0221-0765721", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OTTIK')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('OTTIK')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PARIS')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "PARIS", "CompanyName": "Paris sp\u00e9cialit\u00e9s", "ContactName": "Marie Bertrand", "ContactTitle": "Owner", "Address": "265, boulevard Charonne", "City": "Paris", "Region": null, "PostalCode": "75012", "Country": "France", "Phone": "(1) 42.34.22.66", "Fax": "(1) 42.34.22.77", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PARIS')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PARIS')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PERIC')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "PERIC", "CompanyName": "Pericles Comidas cl\u00e1sicas", "ContactName": "Guillermo Fern\u00e1ndez", "ContactTitle": "Sales Representative", "Address": "Calle Dr. Jorge Cash 321", "City": "M\u00e9xico D.F.", "Region": null, "PostalCode": "05033", "Country": "Mexico", "Phone": "(5) 552-3745", "Fax": "(5) 545-3745", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PERIC')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PERIC')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PICCO')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "PICCO", "CompanyName": "Piccolo und mehr", "ContactName": "Georg Pipps", "ContactTitle": "Sales Manager", "Address": "Geislweg 14", "City": "Salzburg", "Region": null, "PostalCode": "5020", "Country": "Austria", "Phone": "6562-9722", "Fax": "6562-9723", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PICCO')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PICCO')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PRINI')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "PRINI", "CompanyName": "Princesa Isabel Vinhos", "ContactName": "Isabel de Castro", "ContactTitle": "Sales Representative", "Address": "Estrada da sa\u00fade n. 58", "City": "Lisboa", "Region": null, "PostalCode": "1756", "Country": "Portugal", "Phone": "(1) 356-5634", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PRINI')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('PRINI')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('QUEDE')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "QUEDE", "CompanyName": "Que Del\u00edcia", "ContactName": "Bernardo Batista", "ContactTitle": "Accounting Manager", "Address": "Rua da Panificadora, 12", "City": "Rio de Janeiro", "Region": "RJ", "PostalCode": "02389-673", "Country": "Brazil", "Phone": "(21) 555-4252", "Fax": "(21) 555-4545", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('QUEDE')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('QUEDE')/CustomerDemographics"
					}
				}
			}
		], "__next": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers?$top=2&$skiptoken='QUEDE'"
	}
};

var oCustomers6 = {
	"d" : {
		"results": [
			{
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('QUEEN')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "QUEEN", "CompanyName": "Queen Cozinha", "ContactName": "L\u00facia Carvalho", "ContactTitle": "Marketing Assistant", "Address": "Alameda dos Can\u00e0rios, 891", "City": "Sao Paulo", "Region": "SP", "PostalCode": "05487-020", "Country": "Brazil", "Phone": "(11) 555-1189", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('QUEEN')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('QUEEN')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('QUICK')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "QUICK", "CompanyName": "QUICK-Stop", "ContactName": "Horst Kloss", "ContactTitle": "Accounting Manager", "Address": "Taucherstra\u00dfe 10", "City": "Cunewalde", "Region": null, "PostalCode": "01307", "Country": "Germany", "Phone": "0372-035188", "Fax": null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('QUICK')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('QUICK')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RANCH')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "RANCH", "CompanyName": "Rancho grande", "ContactName": "Sergio Guti\u00e9rrez", "ContactTitle": "Sales Representative", "Address": "Av. del Libertador 900", "City": "Buenos Aires", "Region":null,"PostalCode": "1010", "Country": "Argentina", "Phone": "(1) 123-5555", "Fax": "(1) 123-5556", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RANCH')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RANCH')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RATTC')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "RATTC", "CompanyName": "Rattlesnake Canyon Grocery", "ContactName": "Paula Wilson", "ContactTitle": "Assistant Sales Representative", "Address": "2817 Milton Dr.", "City": "Albuquerque", "Region": "NM", "PostalCode": "87110", "Country": "USA", "Phone": "(505) 555-5939", "Fax": "(505) 555-3620", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RATTC')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RATTC')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('REGGC')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "REGGC", "CompanyName": "Reggiani Caseifici", "ContactName": "Maurizio Moroni", "ContactTitle": "Sales Associate", "Address": "Strada Provinciale 124", "City": "Reggio Emilia", "Region":null,"PostalCode": "42100", "Country": "Italy", "Phone": "0522-556721", "Fax": "0522-556722", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('REGGC')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('REGGC')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RICAR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "RICAR", "CompanyName": "Ricardo Adocicados", "ContactName": "Janete Limeira", "ContactTitle": "Assistant Sales Agent", "Address": "Av. Copacabana, 267", "City": "Rio de Janeiro", "Region": "RJ", "PostalCode": "02389-890", "Country": "Brazil", "Phone": "(21) 555-3412", "Fax":null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RICAR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RICAR')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RICSU')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "RICSU", "CompanyName": "Richter Supermarkt", "ContactName": "Michael Holz", "ContactTitle": "Sales Manager", "Address": "Grenzacherweg 237", "City": "Gen\u00e8ve", "Region":null,"PostalCode": "1203", "Country": "Switzerland", "Phone": "0897-034214", "Fax":null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RICSU')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('RICSU')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ROMEY')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "ROMEY", "CompanyName": "Romero y tomillo", "ContactName": "Alejandra Camino", "ContactTitle": "Accounting Manager", "Address": "Gran V\u00eda, 1", "City": "Madrid", "Region":null,"PostalCode": "28001", "Country": "Spain", "Phone": "(91) 745 6200", "Fax": "(91) 745 6210", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ROMEY')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('ROMEY')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SANTG')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "SANTG", "CompanyName": "Sant\u00e9 Gourmet", "ContactName": "Jonas Bergulfsen", "ContactTitle": "Owner", "Address": "Erling Skakkes gate 78", "City": "Stavern", "Region":null,"PostalCode": "4110", "Country": "Norway", "Phone": "07-98 92 35", "Fax": "07-98 92 47", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SANTG')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SANTG')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SAVEA')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "SAVEA", "CompanyName": "Save-a-lot Markets", "ContactName": "Jose Pavarotti", "ContactTitle": "Sales Representative", "Address": "187 Suffolk Ln.", "City": "Boise", "Region": "ID", "PostalCode": "83720", "Country": "USA", "Phone": "(208) 555-8097", "Fax":null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SAVEA')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SAVEA')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SEVES')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "SEVES", "CompanyName": "Seven Seas Imports", "ContactName": "Hari Kumar", "ContactTitle": "Sales Manager", "Address": "90 Wadhurst Rd.", "City": "London", "Region":null,"PostalCode": "OX15 4NB", "Country": "UK", "Phone": "(171) 555-1717", "Fax": "(171) 555-5646", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SEVES')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SEVES')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SIMOB')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "SIMOB", "CompanyName": "Simons bistro", "ContactName": "Jytte Petersen", "ContactTitle": "Owner", "Address": "Vinb\u00e6ltet 34", "City": "Kobenhavn", "Region":null,"PostalCode": "1734", "Country": "Denmark", "Phone": "31 12 34 56", "Fax": "31 13 35 57", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SIMOB')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SIMOB')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SPECD')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "SPECD", "CompanyName": "Sp\u00e9cialit\u00e9s du monde", "ContactName": "Dominique Perrier", "ContactTitle": "Marketing Manager", "Address": "25, rue Lauriston", "City": "Paris", "Region":null,"PostalCode": "75016", "Country": "France", "Phone": "(1) 47.55.60.10", "Fax": "(1) 47.55.60.20", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SPECD')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SPECD')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SPLIR')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "SPLIR", "CompanyName": "Split Rail Beer & Ale", "ContactName": "Art Braunschweiger", "ContactTitle": "Sales Manager", "Address": "P.O. Box 555", "City": "Lander", "Region": "WY", "PostalCode": "82520", "Country": "USA", "Phone": "(307) 555-4680", "Fax": "(307) 555-6525", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SPLIR')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SPLIR')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SUPRD')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "SUPRD", "CompanyName": "Supr\u00eames d\u00e9lices", "ContactName": "Pascale Cartrain", "ContactTitle": "Accounting Manager", "Address": "Boulevard Tirou, 255", "City": "Charleroi", "Region":null,"PostalCode": "B-6000", "Country": "Belgium", "Phone": "(071) 23 67 22 20", "Fax": "(071) 23 67 22 21", "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SUPRD')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('SUPRD')/CustomerDemographics"
					}
				}
			}, {
				"__metadata": {
					"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('THEBI')", "type": "NorthwindModel.Customer"
				}, "CustomerID": "THEBI", "CompanyName": "The Big Cheese", "ContactName": "Liz Nixon", "ContactTitle": "Marketing Manager", "Address": "89 Jefferson Way Suite 2", "City": "Portland", "Region": "OR", "PostalCode": "97201", "Country": "USA", "Phone": "(503) 555-3612", "Fax":null, "Orders": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('THEBI')/Orders"
					}
				}, "CustomerDemographics": {
					"__deferred": {
						"uri": "https://services.odata.org/V2/Northwind/Northwind.svc/Customers('THEBI')/CustomerDemographics"
					}
				}
			}
		]
	}
};

var oAuthorizationCheckA = {
  "d": {
    "__metadata": {
      "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)",
      "type": "NorthwindModel.Product"
    },
    "ID": 1,
    "Name": "ReportDefinitionPropertiesSet",
    "Description": null,
    "ReleaseDate": null,
    "DiscontinuedDate": null,
    "Rating": null,
    "Price": null,
    "Category": {
      "__deferred": {
        "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)/Category"
      }
    },
    "Supplier": {
      "__deferred": {
        "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(1)/Supplier"
      }
    }
  }
};

var oAuthorizationCheckB = {
  "d": {
    "__metadata": {
      "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)",
      "type": "NorthwindModel.Product"
    },
    "ID": 2,
    "Name": "SchemaEntryPointInfoSet",
    "Description": null,
    "ReleaseDate": null,
    "DiscontinuedDate": null,
    "Rating": null,
    "Price": null,
    "Category": {
      "__deferred": {
        "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)/Category"
      }
    },
    "Supplier": {
      "__deferred": {
        "uri": "http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Products(2)/Supplier"
      }
    }
  }
};
