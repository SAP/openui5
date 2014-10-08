// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//
// TODO: 
//   - Do not use real OData services for testing or at least do not hardcode the context path!!
//   - Think about mocking the backend this is much more safe than trusting a foreign system!
//
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//Service URI used to match requests to this fake service. This should be used by unit tests that consume this service.
var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc";
var sContextPath = "/" + window.location.pathname.split("/")[1];
sURI = sContextPath + "/proxy/http/" + sURI.replace("http://", "") + "/";

//var sURI = "http://services.odata.org/V3/Northwind/Northwind.svc/";
//sURI = "/uilib-sample/proxy/http/" + sURI.replace("http://", "");

var xhr = sinon.useFakeXMLHttpRequest(),
	baseURL = sURI,
	responseDelay = 10,
	_setTimeout = window.setTimeout;

xhr.useFilters = true;
xhr.addFilter(function(method, url) {
	return url.indexOf(baseURL) != 0;
});
xhr.onCreate = function(request) {
	request.onSend = function() {
		if (request.url == baseURL + "$metadata") {
			if (request.async === true) {
				_setTimeout(function() {
					request.respond(200, oMetaDataHeaders, sMetaData);
				}, responseDelay);
			} else {
				request.respond(200, oMetaDataHeaders, sMetaData);				
			}
		}
		else if (request.url == baseURL + "Categories") {
			_setTimeout(function() { 
				request.respond(200, oJSONHeaders, sCategoriesJSON);
			}, responseDelay);
		}
		else if (request.url == baseURL + "Categories/$count") {
			request.respond(200, oCountHeaders, "8");
		}
		else if (request.url == baseURL + "Products/$count") {
			request.respond(200, oCountHeaders, "10");
		}
		else if (request.url == baseURL + "Categories?$skip=0&$top=8") {
			_setTimeout(function() {
				request.respond(200, oJSONHeaders, sCategoriesJSON);
			}, responseDelay); 
		}
		else if (request.url == baseURL + "Products?$skip=0&$top=10") {
			_setTimeout(function() {
				request.respond(200, oJSONHeaders, sAllProductsJSON);
			}, responseDelay); 
		}
		else if (request.url == baseURL + "Categories?$skip=0&$top=5") {
			_setTimeout(function() {
				request.respond(200, oJSONHeaders, sCategoriesTop5JSON);
			}, responseDelay); 
		}
		else if (request.url == baseURL + "Categories?$skip=5&$top=3") {
			_setTimeout(function() {
				request.respond(200, oJSONHeaders, sCategoriesSkip5Top3JSON);
			}, responseDelay); 
		}
		else if (request.url == baseURL + "Categories?$skip=0&$top=100&$filter=substringof(%27Seafood%27,CategoryName)&$inlinecount=allpages") {
			_setTimeout(function() {
				request.respond(200, oJSONHeaders, sCategorySeafoodJSON);
			}, responseDelay); 
		}
		else if (request.url == baseURL + "Categories/$count?$filter=substringof(%27Seafood%27,CategoryName)") {
			_setTimeout(function() {
				request.respond(200, oCountHeaders, "1");
			}, responseDelay); 
		}
		else if (request.url == baseURL + "Categories/$count?$filter=(substringof(%27%27,CategoryName))%20and%20CategoryName%20eq%20%27Seafood%27") { // 5 triggerMouseEvent() (manual search)
			_setTimeout(function() {
				request.respond(200, oCountHeaders, "1");
			}, responseDelay); 
		}
		else if (request.url == baseURL + "Categories?$skip=0&$top=1&$filter=(substringof(%27%27,CategoryName))%20and%20CategoryName%20eq%20%27Seafood%27") {
			_setTimeout(function() {
				request.respond(200, oJSONHeaders, sCategorySeafoodJSON);
			}, responseDelay); 
		}		
		else if (request.url == baseURL + "Categories/$count?$filter=(substringof(%27Seafood%27,CategoryName))") {
			_setTimeout(function() {
				request.respond(200, oCountHeaders, "1");
			}, responseDelay); 
		}					
		else if (request.url == baseURL + "Categories?$skip=0&$top=100&$filter=CategoryName%20eq%20%27Seafood%27&$inlinecount=allpages") { //2 placeAt()
			_setTimeout(function() {
				request.respond(200, oJSONHeaders, sCategorySeafoodJSON);
			}, responseDelay); 
		}		
		else if (request.url == baseURL + "Categories?$skip=0&$top=100&$filter=(substringof(%27Seafood%27,CategoryName))&$inlinecount=allpages") { 
			_setTimeout(function() {
				request.respond(200, oJSONHeaders, sCategorySeafoodJSON);
			}, responseDelay); 
		}					
		else if (request.url == baseURL + "Categories?$skip=0&$top=20&$filter=CategoryName%20eq%20%27Seafood%27&$inlinecount=allpages") { // 4 openFFL()
			_setTimeout(function() {
				request.respond(200, oJSONHeaders, sCategorySeafoodJSON);
			}, responseDelay); 
		}			
		else if (request.url == baseURL + "Categories?$skip=0&$top=20&$filter=(substringof(%27%27,CategoryName))%20and%20CategoryName%20eq%20%27Seafood%27&$inlinecount=allpages") { //6 triggerMouseEvent() (manual search)
			_setTimeout(function() {
				request.respond(200, oJSONHeaders, sCategorySeafoodJSON);
			}, responseDelay); 
		}		
		else if (request.url == baseURL + "Categories/$count?$filter=CategoryName%20eq%20%27Seafood%27") { //1 placeAt(), 3 openFFL()
			_setTimeout(function() {
				request.respond(200, oCountHeaders, "1");
			}, responseDelay); 
		}			
		else {
			jQuery.sap.log.debug("FacetFilterODataFakeService: No match found for request.url=" + request.url);
		}
		
		jQuery.sap.log.info("Fake AJAX request started for URL: " + request.url);
	};
};

var oMetaDataHeaders = {
		"Content-Type": "application/xml;charset=utf-8",
		"DataServiceVersion": "1.0;"
	};
var oXMLHeaders = 	{
		"Content-Type": "application/atom+xml;charset=utf-8",
		"DataServiceVersion": "2.0;"
	};
var oJSONHeaders = 	{
		"Content-Type": "application/json;charset=utf-8",
		"DataServiceVersion": "2.0;"
	};
var oCountHeaders = 	{
		"Content-Type": "text/plain;charset=utf-8",
		"DataServiceVersion": "2.0;"
	};



var sMetaData = '\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
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
        <Property Name="Picture" Type="Edm.Binary" Nullable="true" MaxLength="Max" FixedLength="false" />\
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
      </EntityContainer>\
    </Schema>\
  </edmx:DataServices>\
</edmx:Edmx>\
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

var sCategoriesTop5JSON = '\
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
	}\
	]\
	}\
	}\
	';

var sCategoriesSkip5Top3JSON = '\
	{\
	"d" : {\
	"results": [\
	{\
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
var sCategorySeafoodJSON = "{\n" + 
"	\"d\" : {\n" + 
"		\"results\" : [\n" + 
"				{\n" + 
"		\"__metadata\" : {\n" + 
"			\"id\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)\",\n" + 
"			\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)\",\n" + 
"			\"type\" : \"NorthwindModel.Category\"\n" + 
"		},\n" + 
"		\"Products\" : {\n" + 
"			\"__deferred\" : {\n" + 
"				\"uri\" : \"http://localhost:8080/uilib-sample/proxy/http/services.odata.org/Northwind/Northwind.svc/Categories(8)/Products\"\n" + 
"			}\n" + 
"		},\n" + 
"		\"CategoryID\" : 8,\n" + 
"		\"CategoryName\" : \"Seafood\",\n" + 
"		\"Description\" : \"Seaweed and fish\",\n" + 
"		\"Picture\" : \"\"\n" + 
"	}\n" + 
"	]\n" + 
"	}\n" + 
"}"
; 

var sAllProductsJSON = "{\"d\":{\"results\":[{\"__metadata\":{\"id\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(1)\",\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(1)\",\"type\":\"NorthwindModel.Product\"},\"Category\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(1)\/Category\"}},\"Order_Details\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(1)\/Order_Details\"}},\"Supplier\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(1)\/Supplier\"}},\"ProductID\":1,\"ProductName\":\"Chai\",\"SupplierID\":1,\"CategoryID\":1,\"QuantityPerUnit\":\"10 boxes x 20 bags\",\"UnitPrice\":\"18.0000\",\"UnitsInStock\":39,\"UnitsOnOrder\":0,\"ReorderLevel\":10,\"Discontinued\":false},{\"__metadata\":{\"id\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(2)\",\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(2)\",\"type\":\"NorthwindModel.Product\"},\"Category\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(2)\/Category\"}},\"Order_Details\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(2)\/Order_Details\"}},\"Supplier\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(2)\/Supplier\"}},\"ProductID\":2,\"ProductName\":\"Chang\",\"SupplierID\":1,\"CategoryID\":1,\"QuantityPerUnit\":\"24 - 12 oz bottles\",\"UnitPrice\":\"19.0000\",\"UnitsInStock\":17,\"UnitsOnOrder\":40,\"ReorderLevel\":25,\"Discontinued\":false},{\"__metadata\":{\"id\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(3)\",\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(3)\",\"type\":\"NorthwindModel.Product\"},\"Category\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(3)\/Category\"}},\"Order_Details\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(3)\/Order_Details\"}},\"Supplier\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(3)\/Supplier\"}},\"ProductID\":3,\"ProductName\":\"Aniseed Syrup\",\"SupplierID\":1,\"CategoryID\":2,\"QuantityPerUnit\":\"12 - 550 ml bottles\",\"UnitPrice\":\"10.0000\",\"UnitsInStock\":13,\"UnitsOnOrder\":70,\"ReorderLevel\":25,\"Discontinued\":false},{\"__metadata\":{\"id\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(4)\",\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(4)\",\"type\":\"NorthwindModel.Product\"},\"Category\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(4)\/Category\"}},\"Order_Details\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(4)\/Order_Details\"}},\"Supplier\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(4)\/Supplier\"}},\"ProductID\":4,\"ProductName\":\"Chef Anton\'s Cajun Seasoning\",\"SupplierID\":2,\"CategoryID\":2,\"QuantityPerUnit\":\"48 - 6 oz jars\",\"UnitPrice\":\"22.0000\",\"UnitsInStock\":53,\"UnitsOnOrder\":0,\"ReorderLevel\":0,\"Discontinued\":false},{\"__metadata\":{\"id\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(5)\",\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(5)\",\"type\":\"NorthwindModel.Product\"},\"Category\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(5)\/Category\"}},\"Order_Details\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(5)\/Order_Details\"}},\"Supplier\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(5)\/Supplier\"}},\"ProductID\":5,\"ProductName\":\"Chef Anton\'s Gumbo Mix\",\"SupplierID\":2,\"CategoryID\":2,\"QuantityPerUnit\":\"36 boxes\",\"UnitPrice\":\"21.3500\",\"UnitsInStock\":0,\"UnitsOnOrder\":0,\"ReorderLevel\":0,\"Discontinued\":true},{\"__metadata\":{\"id\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(6)\",\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(6)\",\"type\":\"NorthwindModel.Product\"},\"Category\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(6)\/Category\"}},\"Order_Details\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(6)\/Order_Details\"}},\"Supplier\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(6)\/Supplier\"}},\"ProductID\":6,\"ProductName\":\"Grandma\'s Boysenberry Spread\",\"SupplierID\":3,\"CategoryID\":2,\"QuantityPerUnit\":\"12 - 8 oz jars\",\"UnitPrice\":\"25.0000\",\"UnitsInStock\":120,\"UnitsOnOrder\":0,\"ReorderLevel\":25,\"Discontinued\":false},{\"__metadata\":{\"id\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(7)\",\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(7)\",\"type\":\"NorthwindModel.Product\"},\"Category\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(7)\/Category\"}},\"Order_Details\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(7)\/Order_Details\"}},\"Supplier\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(7)\/Supplier\"}},\"ProductID\":7,\"ProductName\":\"Uncle Bob\'s Organic Dried Pears\",\"SupplierID\":3,\"CategoryID\":7,\"QuantityPerUnit\":\"12 - 1 lb pkgs.\",\"UnitPrice\":\"30.0000\",\"UnitsInStock\":15,\"UnitsOnOrder\":0,\"ReorderLevel\":10,\"Discontinued\":false},{\"__metadata\":{\"id\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(8)\",\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(8)\",\"type\":\"NorthwindModel.Product\"},\"Category\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(8)\/Category\"}},\"Order_Details\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(8)\/Order_Details\"}},\"Supplier\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(8)\/Supplier\"}},\"ProductID\":8,\"ProductName\":\"Northwoods Cranberry Sauce\",\"SupplierID\":3,\"CategoryID\":2,\"QuantityPerUnit\":\"12 - 12 oz jars\",\"UnitPrice\":\"40.0000\",\"UnitsInStock\":6,\"UnitsOnOrder\":0,\"ReorderLevel\":0,\"Discontinued\":false},{\"__metadata\":{\"id\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(9)\",\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(9)\",\"type\":\"NorthwindModel.Product\"},\"Category\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(9)\/Category\"}},\"Order_Details\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(9)\/Order_Details\"}},\"Supplier\":{\"__deferred\":{\"uri\":\"http:\/\/localhost:8080\/uilib-sample\/proxy\/http\/services.odata.org\/Northwind\/Northwind.svc\/Products(9)\/Supplier\"}},\"ProductID\":9,\"ProductName\":\"Mishi Kobe Niku\",\"SupplierID\":4,\"CategoryID\":6,\"QuantityPerUnit\":\"18 - 500 g pkgs.\",\"UnitPrice\":\"97.0000\",\"UnitsInStock\":29,\"UnitsOnOrder\":0,\"ReorderLevel\":0,\"Discontinued\":true}],\"__count\":\"10\"}}"; 