/* eslint-disable no-implicit-globals */
var NorthwindData = {};


NorthwindData.Products = {
	"d": {
		"results": [
			{
				"__metadata": {
					"id": "fakeservice://testdata/odata/northwind/Products(1)",
					"uri": "fakeservice://testdata/odata/northwind/Products(1)",
					"type": "NorthwindModel.Product"
				},
				"ProductID": "Product1",
				"ProductName": "Product 1",
				"SupplierID": 0,
				"CategoryID": 17,
				"QuantityPerUnit": "ml",
				"UnitPrice": 25.35128231184987,
				"UnitsInStock": 12,
				"UnitsOnOrder": 2,
				"ReorderLevel": 75,
				"Discontinued": false
			}, {
				"__metadata": {
					"id": "fakeservice://testdata/odata/northwind/Products(2)",
					"uri": "fakeservice://testdata/odata/northwind/Products(2)",
					"type": "NorthwindModel.Product"
				},
				"ProductID": "Product2",
				"ProductName": "Product 2",
				"SupplierID": 0,
				"CategoryID": 17,
				"QuantityPerUnit": "ml",
				"UnitPrice": 25.35128231184987,
				"UnitsInStock": 12,
				"UnitsOnOrder": 2,
				"ReorderLevel": 75,
				"Discontinued": false
			}, {
				"__metadata": {
					"id": "fakeservice://testdata/odata/northwind/Products(3)",
					"uri": "fakeservice://testdata/odata/northwind/Products(3)",
					"type": "NorthwindModel.Product"
				},
				"ProductID": "Product3",
				"ProductName": "Product 3",
				"SupplierID": 0,
				"CategoryID": 17,
				"QuantityPerUnit": "ml",
				"UnitPrice": 25.35128231184987,
				"UnitsInStock": 12,
				"UnitsOnOrder": 2,
				"ReorderLevel": 75,
				"Discontinued": false
			}, {
				"__metadata": {
					"id": "fakeservice://testdata/odata/northwind/Products(4)",
					"uri": "fakeservice://testdata/odata/northwind/Products(4)",
					"type": "NorthwindModel.Product"
				},
				"ProductID": "Product4",
				"ProductName": "Product 4",
				"SupplierID": 0,
				"CategoryID": 17,
				"QuantityPerUnit": "ml",
				"UnitPrice": 25.35128231184987,
				"UnitsInStock": 12,
				"UnitsOnOrder": 2,
				"ReorderLevel": 75,
				"Discontinued": false
			}, {
				"__metadata": {
					"id": "fakeservice://testdata/odata/northwind/Products(5)",
					"uri": "fakeservice://testdata/odata/northwind/Products(5)",
					"type": "NorthwindModel.Product"
				},
				"ProductID": "Product5",
				"ProductName": "Product 5",
				"SupplierID": 0,
				"CategoryID": 17,
				"QuantityPerUnit": "ml",
				"UnitPrice": 25.35128231184987,
				"UnitsInStock": 12,
				"UnitsOnOrder": 2,
				"ReorderLevel": 75,
				"Discontinued": false
			}, {
				"__metadata": {
					"id": "fakeservice://testdata/odata/northwind/Products(6)",
					"uri": "fakeservice://testdata/odata/northwind/Products(6)",
					"type": "NorthwindModel.Product"
				},
				"ProductID": "Product6",
				"ProductName": "Product 6",
				"SupplierID": 0,
				"CategoryID": 17,
				"QuantityPerUnit": "ml",
				"UnitPrice": 25.35128231184987,
				"UnitsInStock": 12,
				"UnitsOnOrder": 2,
				"ReorderLevel": 75,
				"Discontinued": false
			}
		]
	}
};

NorthwindData.$metadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\
	<edmx:DataServices m:DataServiceVersion="1.0" m:MaxDataServiceVersion="3.0"\
		xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
		xmlns:sap="http://www.sap.com/Protocols/SAPData">\
		<Schema Namespace="NorthwindModel" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<EntityType Name="Category">\
				<Key>\
					<PropertyRef Name="CategoryID" />\
				</Key>\
				<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="Description" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<Property Name="Picture" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
				<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Products"\
					FromRole="Categories" />\
			</EntityType>\
			<EntityType Name="CustomerDemographic">\
				<Key>\
					<PropertyRef Name="CustomerTypeID" />\
				</Key>\
				<Property Name="CustomerTypeID" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="true"\
					Unicode="true" />\
				<Property Name="CustomerDesc" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Customers" Relationship="NorthwindModel.CustomerCustomerDemo" ToRole="Customers"\
					FromRole="CustomerDemographics" />\
			</EntityType>\
			<EntityType Name="Customer">\
				<Key>\
					<PropertyRef Name="CustomerID" />\
				</Key>\
				<Property Name="CustomerID" Type="Edm.String" Nullable="false" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Orders"\
					FromRole="Customers" />\
				<NavigationProperty Name="CustomerDemographics" Relationship="NorthwindModel.CustomerCustomerDemo"\
					ToRole="CustomerDemographics" FromRole="Customers" />\
			</EntityType>\
			<EntityType Name="Employee">\
				<Key>\
					<PropertyRef Name="EmployeeID" />\
				</Key>\
				<Property Name="EmployeeID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="LastName" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="FirstName" Type="Edm.String" Nullable="false" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Title" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="TitleOfCourtesy" Type="Edm.String" MaxLength="25" FixedLength="false" Unicode="true" />\
				<Property Name="BirthDate" Type="Edm.DateTime" />\
				<Property Name="HireDate" Type="Edm.DateTime" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="HomePhone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="Extension" Type="Edm.String" MaxLength="4" FixedLength="false" Unicode="true" />\
				<Property Name="Photo" Type="Edm.Binary" MaxLength="Max" FixedLength="false" />\
				<Property Name="Notes" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<Property Name="ReportsTo" Type="Edm.Int32" />\
				<Property Name="PhotoPath" Type="Edm.String" MaxLength="255" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Employees1" Relationship="NorthwindModel.FK_Employees_Employees"\
					ToRole="Employees1" FromRole="Employees" />\
				<NavigationProperty Name="Employee1" Relationship="NorthwindModel.FK_Employees_Employees" ToRole="Employees"\
					FromRole="Employees1" />\
				<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Orders"\
					FromRole="Employees" />\
				<NavigationProperty Name="Territories" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Territories"\
					FromRole="Employees" />\
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
				<NavigationProperty Name="Order" Relationship="NorthwindModel.FK_Order_Details_Orders" ToRole="Orders"\
					FromRole="Order_Details" />\
				<NavigationProperty Name="Product" Relationship="NorthwindModel.FK_Order_Details_Products"\
					ToRole="Products" FromRole="Order_Details" />\
			</EntityType>\
			<EntityType Name="Order">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="EmployeeID" Type="Edm.Int32" />\
				<Property Name="OrderDate" Type="Edm.DateTime" />\
				<Property Name="RequiredDate" Type="Edm.DateTime" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="ShipVia" Type="Edm.Int32" />\
				<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Customer" Relationship="NorthwindModel.FK_Orders_Customers" ToRole="Customers"\
					FromRole="Orders" />\
				<NavigationProperty Name="Employee" Relationship="NorthwindModel.FK_Orders_Employees" ToRole="Employees"\
					FromRole="Orders" />\
				<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Orders"\
					ToRole="Order_Details" FromRole="Orders" />\
				<NavigationProperty Name="Shipper" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Shippers"\
					FromRole="Orders" />\
			</EntityType>\
			<EntityType Name="Product">\
				<Key>\
					<PropertyRef Name="ProductID" />\
				</Key>\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="SupplierID" Type="Edm.Int32" />\
				<Property Name="CategoryID" Type="Edm.Int32" />\
				<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="UnitsInStock" Type="Edm.Int16" />\
				<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
				<Property Name="ReorderLevel" Type="Edm.Int16" />\
				<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
				<NavigationProperty Name="Category" Relationship="NorthwindModel.FK_Products_Categories" ToRole="Categories"\
					FromRole="Products" />\
				<NavigationProperty Name="Order_Details" Relationship="NorthwindModel.FK_Order_Details_Products"\
					ToRole="Order_Details" FromRole="Products" />\
				<NavigationProperty Name="Supplier" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Suppliers"\
					FromRole="Products" />\
			</EntityType>\
			<EntityType Name="Region">\
				<Key>\
					<PropertyRef Name="RegionID" />\
				</Key>\
				<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="RegionDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
					Unicode="true" />\
				<NavigationProperty Name="Territories" Relationship="NorthwindModel.FK_Territories_Region"\
					ToRole="Territories" FromRole="Region" />\
			</EntityType>\
			<EntityType Name="Shipper">\
				<Key>\
					<PropertyRef Name="ShipperID" />\
				</Key>\
				<Property Name="ShipperID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Orders" Relationship="NorthwindModel.FK_Orders_Shippers" ToRole="Orders"\
					FromRole="Shippers" />\
			</EntityType>\
			<EntityType Name="Supplier">\
				<Key>\
					<PropertyRef Name="SupplierID" />\
				</Key>\
				<Property Name="SupplierID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="ContactTitle" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Phone" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="Fax" Type="Edm.String" MaxLength="24" FixedLength="false" Unicode="true" />\
				<Property Name="HomePage" Type="Edm.String" MaxLength="Max" FixedLength="false" Unicode="true" />\
				<NavigationProperty Name="Products" Relationship="NorthwindModel.FK_Products_Suppliers" ToRole="Products"\
					FromRole="Suppliers" />\
			</EntityType>\
			<EntityType Name="Territory">\
				<Key>\
					<PropertyRef Name="TerritoryID" />\
				</Key>\
				<Property Name="TerritoryID" Type="Edm.String" Nullable="false" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="TerritoryDescription" Type="Edm.String" Nullable="false" MaxLength="50" FixedLength="true"\
					Unicode="true" />\
				<Property Name="RegionID" Type="Edm.Int32" Nullable="false" />\
				NavigationProperty Name="Region" Relationship="NorthwindModel.FK_Territories_Region" ToRole="Region"\
				FromRole="Territories" />\
				<NavigationProperty Name="Employees" Relationship="NorthwindModel.EmployeeTerritories" ToRole="Employees"\
					FromRole="Territories" />\
			</EntityType>\
			<EntityType Name="Alphabetical_list_of_product">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="Discontinued" />\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="SupplierID" Type="Edm.Int32" />\
				<Property Name="CategoryID" Type="Edm.Int32" />\
				<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="UnitsInStock" Type="Edm.Int16" />\
				<Property Name="UnitsOnOrder" Type="Edm.Int16" />\
				<Property Name="ReorderLevel" Type="Edm.Int16" />\
				<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
			</EntityType>\
			<EntityType Name="Category_Sales_for_1997">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
				</Key>\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="CategorySales" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Current_Product_List">\
				<Key>\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" p6:StoreGeneratedPattern="Identity"\
					xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
			</EntityType>\
			<EntityType Name="Customer_and_Suppliers_by_City">\
				<Key>\
					<PropertyRef Name="CompanyName" />\
					<PropertyRef Name="Relationship" />\
				</Key>\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ContactName" Type="Edm.String" MaxLength="30" FixedLength="false" Unicode="true" />\
				<Property Name="Relationship" Type="Edm.String" Nullable="false" MaxLength="9" FixedLength="false" Unicode="false" />\
			</EntityType>\
			<EntityType Name="Invoice">\
				<Key>\
					<PropertyRef Name="CustomerName" />\
					<PropertyRef Name="Discount" />\
					<PropertyRef Name="OrderID" />\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
					<PropertyRef Name="Quantity" />\
					<PropertyRef Name="Salesperson" />\
					<PropertyRef Name="ShipperName" />\
					<PropertyRef Name="UnitPrice" />\
				</Key>\
				<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="CustomerName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false"\
					Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Salesperson" Type="Edm.String" Nullable="false" MaxLength="31" FixedLength="false" Unicode="true" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="OrderDate" Type="Edm.DateTime" />\
				<Property Name="RequiredDate" Type="Edm.DateTime" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="ShipperName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
				<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
				<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
				<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Order_Details_Extended">\
				<Key>\
					<PropertyRef Name="Discount" />\
					<PropertyRef Name="OrderID" />\
					<PropertyRef Name="ProductID" />\
					<PropertyRef Name="ProductName" />\
					<PropertyRef Name="Quantity" />\
					<PropertyRef Name="UnitPrice" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Nullable="false" Precision="19" Scale="4" />\
				<Property Name="Quantity" Type="Edm.Int16" Nullable="false" />\
				<Property Name="Discount" Type="Edm.Single" Nullable="false" />\
				<Property Name="ExtendedPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Order_Subtotal">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Orders_Qry">\
				<Key>\
					<PropertyRef Name="CompanyName" />\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="CustomerID" Type="Edm.String" MaxLength="5" FixedLength="true" Unicode="true" />\
				<Property Name="EmployeeID" Type="Edm.Int32" />\
				<Property Name="OrderDate" Type="Edm.DateTime" />\
				<Property Name="RequiredDate" Type="Edm.DateTime" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="ShipVia" Type="Edm.Int32" />\
				<Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="ShipName" Type="Edm.String" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShipAddress" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCity" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipRegion" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="ShipCountry" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="Address" Type="Edm.String" MaxLength="60" FixedLength="false" Unicode="true" />\
				<Property Name="City" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="Region" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
				<Property Name="PostalCode" Type="Edm.String" MaxLength="10" FixedLength="false" Unicode="true" />\
				<Property Name="Country" Type="Edm.String" MaxLength="15" FixedLength="false" Unicode="true" />\
			</EntityType>\
			<EntityType Name="Product_Sales_for_1997">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Products_Above_Average_Price">\
				<Key>\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="UnitPrice" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Products_by_Category">\
				<Key>\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="Discontinued" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="QuantityPerUnit" Type="Edm.String" MaxLength="20" FixedLength="false" Unicode="true" />\
				<Property Name="UnitsInStock" Type="Edm.Int16" />\
				<Property Name="Discontinued" Type="Edm.Boolean" Nullable="false" />\
			</EntityType>\
			<EntityType Name="Sales_by_Category">\
				<Key>\
					<PropertyRef Name="CategoryID" />\
					<PropertyRef Name="CategoryName" />\
					<PropertyRef Name="ProductName" />\
				</Key>\
				<Property Name="CategoryID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="CategoryName" Type="Edm.String" Nullable="false" MaxLength="15" FixedLength="false"\
					Unicode="true" />\
				<Property Name="ProductName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ProductSales" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Sales_Totals_by_Amount">\
				<Key>\
					<PropertyRef Name="CompanyName" />\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="SaleAmount" Type="Edm.Decimal" Precision="19" Scale="4" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="CompanyName" Type="Edm.String" Nullable="false" MaxLength="40" FixedLength="false" Unicode="true" />\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
			</EntityType>\
			<EntityType Name="Summary_of_Sales_by_Quarter">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<EntityType Name="Summary_of_Sales_by_Year">\
				<Key>\
					<PropertyRef Name="OrderID" />\
				</Key>\
				<Property Name="ShippedDate" Type="Edm.DateTime" />\
				<Property Name="OrderID" Type="Edm.Int32" Nullable="false" />\
				<Property Name="Subtotal" Type="Edm.Decimal" Precision="19" Scale="4" />\
			</EntityType>\
			<Association Name="FK_Products_Categories">\
				<End Type="NorthwindModel.Category" Role="Categories" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Categories">\
						<PropertyRef Name="CategoryID" />\
					</Principal>\
					<Dependent Role="Products">\
						<PropertyRef Name="CategoryID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="CustomerCustomerDemo">\
				<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="*" />\
				<End Type="NorthwindModel.CustomerDemographic" Role="CustomerDemographics" Multiplicity="*" />\
			</Association>\
			<Association Name="FK_Orders_Customers">\
				<End Type="NorthwindModel.Customer" Role="Customers" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
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
				<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Employee" Role="Employees1" Multiplicity="*" />\
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
				<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Employees">\
						<PropertyRef Name="EmployeeID" />\
					</Principal>\
					<Dependent Role="Orders">\
						<PropertyRef Name="EmployeeID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<Association Name="EmployeeTerritories">\
				<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
				<End Type="NorthwindModel.Employee" Role="Employees" Multiplicity="*" />\
			</Association>\
			<Association Name="FK_Order_Details_Orders">\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="1" />\
				<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
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
				<End Type="NorthwindModel.Product" Role="Products" Multiplicity="1" />\
				<End Type="NorthwindModel.Order_Detail" Role="Order_Details" Multiplicity="*" />\
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
				<End Type="NorthwindModel.Shipper" Role="Shippers" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Order" Role="Orders" Multiplicity="*" />\
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
				<End Type="NorthwindModel.Supplier" Role="Suppliers" Multiplicity="0..1" />\
				<End Type="NorthwindModel.Product" Role="Products" Multiplicity="*" />\
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
				<End Type="NorthwindModel.Region" Role="Region" Multiplicity="1" />\
				<End Type="NorthwindModel.Territory" Role="Territories" Multiplicity="*" />\
				<ReferentialConstraint>\
					<Principal Role="Region">\
						<PropertyRef Name="RegionID" />\
					</Principal>\
					<Dependent Role="Territories">\
						<PropertyRef Name="RegionID" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<EntityContainer Name="FunctionImports">\
				<FunctionImport Name="functionWithInvalidTarget" m:HttpMethod="POST">\
				</FunctionImport>\
			</EntityContainer>\
		</Schema>\
		<Schema Namespace="ODataWebV3.Northwind.Model" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<EntityContainer Name="NorthwindEntities" m:IsDefaultEntityContainer="true" p6:LazyLoadingEnabled="true"\
				xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation">\
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
				<AssociationSet Name="CustomerCustomerDemo" Association="NorthwindModel.CustomerCustomerDemo">\
					<End Role="CustomerDemographics" EntitySet="CustomerDemographics" />\
					<End Role="Customers" EntitySet="Customers" />\
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
				<AssociationSet Name="EmployeeTerritories" Association="NorthwindModel.EmployeeTerritories">\
					<End Role="Employees" EntitySet="Employees" />\
					<End Role="Territories" EntitySet="Territories" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Order_Details_Orders" Association="NorthwindModel.FK_Order_Details_Orders">\
					<End Role="Order_Details" EntitySet="Order_Details" />\
					<End Role="Orders" EntitySet="Orders" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Order_Details_Products" Association="NorthwindModel.FK_Order_Details_Products">\
					<End Role="Order_Details" EntitySet="Order_Details" />\
					<End Role="Products" EntitySet="Products" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Orders_Shippers" Association="NorthwindModel.FK_Orders_Shippers">\
					<End Role="Orders" EntitySet="Orders" />\
					<End Role="Shippers" EntitySet="Shippers" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Products_Suppliers" Association="NorthwindModel.FK_Products_Suppliers">\
					<End Role="Products" EntitySet="Products" />\
					<End Role="Suppliers" EntitySet="Suppliers" />\
				</AssociationSet>\
				<AssociationSet Name="FK_Territories_Region" Association="NorthwindModel.FK_Territories_Region">\
					<End Role="Region" EntitySet="Regions" />\
					<End Role="Territories" EntitySet="Territories" />\
				</AssociationSet>\
			</EntityContainer>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>';
