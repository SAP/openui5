var xhr = sinon.useFakeXMLHttpRequest(),
	baseURL = "../../../../../proxy/http/services.odata.org/V3/Northwind/Northwind.svc/",
	responseDelay = 50,
	_setTimeout = window.setTimeout;

xhr.useFilters = true;
xhr.addFilter(function(method, url) {
	return url.indexOf("fakeService://") != 0;
});
xhr.onCreate = function(request) {
	request.onSend = function() {
		// Default request answer values:
		var iStatus = 200;
		var mHeaders = mXMLHeaders;
		var sAnswer = "This should never be received as an answer!";

		switch (request.url) {
			
			case "fakeService://testdata/odata/northwind/":
			case "fakeService://testdata/odata/northwind-annotated/":
				mHeaders = mMetaDataHeaders;
				sAnswer = sNorthwindData;
				break;
				
			case "fakeService://testdata/odata/northwind/$metadata":
				mHeaders = mMetaDataHeaders;
				sAnswer = sNorthwindMetadata;
				break;

			case "fakeService://testdata/odata/northwind-annotated/$metadata":
				mHeaders = mMetaDataHeaders;
				sAnswer = sNorthwindMetadataAnnotated;
				break;
				
			case "fakeService://testdata/odata/NOT_EXISTANT/$metadata":
				iStatus = 404;
				mHeaders = mMetaDataHeaders;
				sAnswer = "Sorry, not found...";
				break;
				
			case "fakeService://testdata/odata/NOT_EXISTANT":
				iStatus = 404;
				sAnswer = "Sorry, not found...";
				break;
				
			case "fakeService://testdata/odata/northwind-annotations-normal.xml":
				sAnswer = sNorthwindAnnotations;
				break;
				
			case "fakeService://testdata/odata/northwind-annotations-malformed.xml":
				sAnswer = sNorthwindAnnotationsMalformed;
				break;
			
			default:
				// You used the wrong URL, dummy!
				debugger;
				break;
		}
		
		
		if (request.async === true) {
			_setTimeout(function() {
				request.respond(iStatus, mHeaders, sAnswer);
			}, responseDelay);
		} else {
			request.respond(iStatus, mHeaders, sAnswer);
		}
		
	}
};





var mMetaDataHeaders = {
	"Content-Type": "application/xml;charset=utf-8",
	"DataServiceVersion": "1.0;"
};
var mXMLHeaders = 	{
	"Content-Type": "application/atom+xml;charset=utf-8",
	"DataServiceVersion": "2.0;"
};
var mJSONHeaders = 	{
	"Content-Type": "application/json;charset=utf-8",
	"DataServiceVersion": "2.0;"
};
var mCountHeaders = 	{
	"Content-Type": "text/plain;charset=utf-8",
	"DataServiceVersion": "2.0;"
};



var sNorthwindAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
  <edmx:Reference Uri="/coco/vocabularies/UI.xml">\
    <edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI" /> \
  </edmx:Reference>\
  <edmx:Reference Uri="/coco/vocabularies/Communication.xml">\
    <edmx:Include Namespace="com.sap.vocabularies.Communication.v1" Alias="vCard" /> \
  </edmx:Reference> \
  <edmx:Reference Uri="http://docs.oasis-open.org/odata/odata/v4.0/cs01/vocabularies/Org.OData.Measures.V1.xml" >\
    <edmx:Include Namespace="Org.OData.Measures.V1" Alias="CQP" /> \
  </edmx:Reference> \
  <edmx:Reference Uri="http://services.odata.org/Northwind/Northwind.svc/$metadata" >\
    <edmx:Include Namespace="NorthwindModel" Alias="NorthwindModel" /> \
  </edmx:Reference>  \
  <edmx:DataServices>\
    <!-- Entity Data Model Conceptual Schemas, as specified in [MC-CSDL]  and annotated as specified in [MS-ODATA] -->\
    <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="NorthwindModelAnnotations">\
      <Annotations Target="NorthwindModel.Product/UnitPrice">\
        <Annotation Term="CQP.ISOCurrency" String="USD" />\
      </Annotations>\
      <Annotations Target="NorthwindModel.Order_Detail/UnitPrice">\
        <Annotation Term="CQP.ISOCurrency" String="USD" />\
      </Annotations>\
      <Annotations Target="NorthwindModel.Product">\
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="Product" />\
            <PropertyValue Property="TypeNamePlural" String="Products" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/product32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Product" />\
                <PropertyValue Property="Value" Path="ProductName" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Product ID" />\
              <PropertyValue Property="Value" Path="ProductID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Quantity / Unit" />\
              <PropertyValue Property="Value" Path="QuantityPerUnit" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Unit Price" />\
              <PropertyValue Property="Value" Path="UnitPrice" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Category" />\
              <PropertyValue Property="Value" Path="Category/CategoryName" />\
            </Record>\
            <Record Type="UI.DataFieldWithNavigation">\
              <PropertyValue Property="Label" String="Supplier" />\
              <PropertyValue Property="Value" Path="Supplier/CompanyName" />\
              <PropertyValue Property="Target" Path="Supplier" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.LineItem">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Value" String="/coco/apps/main/img/Icons/product32.png">\
                <Annotation Term="UI.IsImageURL"/>\
              </PropertyValue>\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Product ID" />\
              <PropertyValue Property="Value" Path="ProductID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Product" />\
              <PropertyValue Property="Value" Path="ProductName" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Quantity / Unit" />\
              <PropertyValue Property="Value" Path="QuantityPerUnit" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Unit Price" />\
              <PropertyValue Property="Value" Path="UnitPrice" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Units In Stock" />\
              <PropertyValue Property="Value" Path="UnitsInStock" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.Facets">\
          <Collection>\
            <Record Type="UI.CollectionFacet">\
              <PropertyValue Property="Label" String="Supplier" />\
              <PropertyValue Property="Facets">      \
                <Collection>    \
                  <Record Type="UI.ReferenceFacet">\
                    <PropertyValue Property="Label" String="Contact Data" />\
                    <PropertyValue Property="Target" AnnotationPath="Supplier/@UI.Identification" />\
                  </Record>\
                  <Record Type="UI.ReferenceFacet">\
                    <Annotation Term="UI.Map"/>\
                    <PropertyValue Property="Label" String="Supplier Address on Map" />\
                    <PropertyValue Property="Target" AnnotationPath="Supplier/@vCard.Address" />\
                  </Record> \
                </Collection>\
              </PropertyValue>\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
      <Annotations Target="NorthwindModel.Category">\
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="Category" />\
            <PropertyValue Property="TypeNamePlural" String="Categories" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/example_32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Category Name" />\
                <PropertyValue Property="Value" Path="CategoryName" />\
              </Record>\
            </PropertyValue>\
            <PropertyValue Property="Description">\
              <Record>\
                <PropertyValue Property="Label" String="Description" />\
                <PropertyValue Property="Value" Path="Description" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Category ID" />\
              <PropertyValue Property="Value" Path="CategoryID" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.LineItem">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Value" String="/coco/apps/main/img/Icons/example_32.png">\
                <Annotation Term="UI.IsImageURL"/>\
              </PropertyValue>\
            </Record>          \
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Category ID" />\
              <PropertyValue Property="Value" Path="CategoryID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Category Name" />\
              <PropertyValue Property="Value" Path="CategoryName" />\
            </Record>\
            <Record>\
              <PropertyValue Property="Label" String="Description" />\
              <PropertyValue Property="Value" Path="Description" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.Facets">\
          <Collection>\
            <Record Type="UI.ReferenceFacet">\
              <PropertyValue Property="Label" String="Products" />\
              <PropertyValue Property="Target" AnnotationPath="Products/@UI.LineItem" />\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
      <Annotations Target="NorthwindModel.Supplier">     \
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="Supplier" />\
            <PropertyValue Property="TypeNamePlural" String="Suppliers" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/supplier32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Supplier" />\
                <PropertyValue Property="Value" Path="CompanyName" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Supplier ID" />\
              <PropertyValue Property="Value" Path="SupplierID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Contact Name" />\
              <PropertyValue Property="Value">\
                <Apply Function="odata.concat">\
                  <Path>ContactTitle</Path>\
                  <String>&#160;-&#160;</String>\
                  <Path>ContactName</Path>\
                </Apply>\
              </PropertyValue>\
            </Record>\
            <Record Type="UI.DataFieldForAnnotation">\
              <PropertyValue Property="Label" String="Supplier Adress" />\
              <PropertyValue Property="Target" AnnotationPath="@vCard.Address" />\
            </Record>\
            <Record Type="UI.DataFieldWithUrl">\
              <PropertyValue Property="Label" String="Homepage" />\
              <PropertyValue Property="Value" Path="HomePage" />\
              <PropertyValue Property="Url" Path="HomePage" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.LineItem">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Value" String="/coco/apps/main/img/Icons/supplier_48.png">\
                <Annotation Term="UI.IsImageURL"/>\
              </PropertyValue>\
            </Record>           \
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Supplier ID" />\
              <PropertyValue Property="Value" Path="SupplierID" />\
            </Record>\
            <Record Type="UI.DataField">\
               <PropertyValue Property="Label" String="Supplier" />\
               <PropertyValue Property="Value" Path="CompanyName" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="vCard.Address">\
          <Record>\
            <PropertyValue Property="street" Path="Address" />\
            <PropertyValue Property="locality" Path="City" />\
            <PropertyValue Property="postalCode" Path="PostalCode" />\
            <PropertyValue Property="country" Path="Country" />\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Facets">\
          <Collection>\
            <Record Type="UI.ReferenceFacet">\
              <PropertyValue Property="Label" String="Products" />\
              <PropertyValue Property="Target" AnnotationPath="Products/@UI.LineItem" />\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
      <Annotations Target="NorthwindModel.Order">\
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="Order" />\
            <PropertyValue Property="TypeNamePlural" String="Orders" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/cart_32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Order ID" />\
                <PropertyValue Property="Value" Path="OrderID" />\
              </Record>\
            </PropertyValue>\
            <PropertyValue Property="Description">\
              <Record>\
                <PropertyValue Property="Label" String="Description" />\
                <PropertyValue Property="Value" String="No description available" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Order Number" />\
              <PropertyValue Property="Value" Path="OrderID" />\
            </Record>\
            <Record Type="UI.DataFieldWithNavigation">\
              <PropertyValue Property="Label" String="Customer" />\
              <PropertyValue Property="Value" Path="Customer/CompanyName" />\
              <PropertyValue Property="Target" Path="Customer" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Required Date" />\
              <PropertyValue Property="Value" Path="RequiredDate" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Shipped Date" />\
              <PropertyValue Property="Value" Path="ShippedDate" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Ship Via" />\
              <PropertyValue Property="Value" Path="ShipVia" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Ship Name" />\
              <PropertyValue Property="Value" Path="ShipName" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.FieldGroup" Qualifier="Overview">\
          <Record>\
            <PropertyValue Property="Label" String="Overview"/>\
            <PropertyValue Property="Data">\
              <Collection>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Employee" />\
                  <PropertyValue Property="Value">\
                    <Apply Function="odata.concat">\
                      <Path>Employee/FirstName</Path>\
                      <String>&#160;</String>\
                      <Path>Employee/LastName</Path>\
                    </Apply>\
                  </PropertyValue>\
                </Record>\
                <Record Type="UI.DataFieldWithNavigation">\
                  <PropertyValue Property="Label" String="Customer" />\
                  <PropertyValue Property="Value" Path="Customer/CompanyName" />\
                  <PropertyValue Property="Target" Path="Customer" />\
                </Record>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Order Date" />\
                  <PropertyValue Property="Value" Path="OrderDate" />\
                </Record>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Required Date" />\
                  <PropertyValue Property="Value" Path="RequiredDate" />\
                </Record>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Shipped Date" />\
                  <PropertyValue Property="Value" Path="ShippedDate" />\
                </Record>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Ship Via" />\
                  <PropertyValue Property="Value" Path="ShipVia" />\
                </Record>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Ship Name" />\
                  <PropertyValue Property="Value" Path="ShipName" />\
                </Record>\
              </Collection>            \
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.LineItem">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Order Number" />\
              <PropertyValue Property="Value" Path="OrderID" />\
            </Record>\
            <Record Type="UI.DataFieldWithNavigation">\
              <PropertyValue Property="Label" String="Customer" />\
              <PropertyValue Property="Value" Path="Customer/CompanyName" />\
              <PropertyValue Property="Target" Path="Customer" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Order Date" />\
              <PropertyValue Property="Value" Path="OrderDate" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Required Date" />\
              <PropertyValue Property="Value" Path="RequiredDate" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Shipped Date" />\
              <PropertyValue Property="Value" Path="ShippedDate" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Ship Via" />\
              <PropertyValue Property="Value" Path="ShipVia" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Ship Name" />\
              <PropertyValue Property="Value" Path="ShipName" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Value" String="/coco/apps/main/img/Icons/cart_48.png">\
                <Annotation Term="UI.IsImageURL"/>\
              </PropertyValue>\
            </Record>                    \
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.Facets">\
          <Collection>\
            <Record Type="UI.ReferenceFacet">\
              <PropertyValue Property="Label" String="Overview" />\
              <PropertyValue Property="Target" AnnotationPath="@UI.FieldGroup#Overview" />\
            </Record>\
            <Record Type="UI.ReferenceFacet">\
              <PropertyValue Property="Label" String="Order Items" />\
              <PropertyValue Property="Target" AnnotationPath="Order_Details/@UI.LineItem" />\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
      <Annotations Target="NorthwindModel.Customer">     \
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="Customer" />\
            <PropertyValue Property="TypeNamePlural" String="Customers" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/supplier32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Customer" />\
                <PropertyValue Property="Value" Path="CustomerID" />\
              </Record>\
            </PropertyValue>\
            <PropertyValue Property="Description">\
              <Record>\
                <PropertyValue Property="Label" String="Description" />\
                <PropertyValue Property="Value" String="CompanyName" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Customer ID" />\
              <PropertyValue Property="Value" Path="CustomerID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Company" />\
              <PropertyValue Property="Value" Path="CompanyName" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Contact Name" />\
              <PropertyValue Property="Value">\
                <Apply Function="odata.concat">\
                  <Path>ContactTitle</Path>\
                  <String>&#160;-&#160;</String>\
                  <Path>ContactName</Path>\
                </Apply>\
              </PropertyValue>\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
      <Annotations Target="NorthwindModel.Order_Detail">\
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="OrderItem" />\
            <PropertyValue Property="TypeNamePlural" String="OrderItems" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/product32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Product Name" />\
                <PropertyValue Property="Value" Path="Product/ProductName" />\
              </Record>\
            </PropertyValue>\
            <PropertyValue Property="Description">\
              <Record>\
                <PropertyValue Property="Label" String="Description" />\
                <PropertyValue Property="Value" String="No description available" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Order" />\
              <PropertyValue Property="Value" Path="OrderID" />\
            </Record>\
            <Record Type="UI.DataField">\
                <PropertyValue Property="Label" String="Item" />\
                <PropertyValue Property="Value" Path="Product/ProductName" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Quantity" />\
              <PropertyValue Property="Value" Path="Quantity" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Discount" />\
              <PropertyValue Property="Value" Path="Discount" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Unit Price" />\
              <PropertyValue Property="Value" Path="UnitPrice" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.LineItem">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Value" String="/coco/apps/main/img/Icons/product32.png">\
                <Annotation Term="UI.IsImageURL"/>\
              </PropertyValue>\
            </Record>                     \
            <Record Type="UI.DataField">\
               <PropertyValue Property="Label" String="Product Name" />\
               <PropertyValue Property="Value" Path="Product/ProductName" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Product ID" />\
              <PropertyValue Property="Value" Path="Product/ProductID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Quantity" />\
              <PropertyValue Property="Value" Path="Quantity" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Unit Price" />\
              <PropertyValue Property="Value" Path="UnitPrice" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Discount" />\
              <PropertyValue Property="Value" Path="Discount" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.Facets">\
          <Collection>\
            <Record Type="UI.ReferenceFacet">\
              <PropertyValue Property="Label" String="Details" />\
              <PropertyValue Property="Target" AnnotationPath="Product/@UI.Identification" />\
            </Record>\
          </Collection>\
        </Annotation>\
      <Annotation Term="Test.FromAnnotations">\
          <Collection>\
            <Record Type="Test.DataField">\
              <PropertyValue Property="Label" String="From" />\
              <PropertyValue Property="Value" Path="Annotations" />\
            </Record>\
          </Collection>\
      </Annotation>\
      </Annotations>\
      <Annotations Target="UnitTest">\
      <Annotation Term="Test.FromAnnotations">\
          <Collection>\
            <Record Type="Test.DataField">\
              <PropertyValue Property="Label" String="From" />\
              <PropertyValue Property="Value" Path="Annotations" />\
            </Record>\
          </Collection>\
      </Annotation>\
      <Annotation Term="Test.Merged">\
          <Collection>\
            <Record Type="Test.DataField">\
              <PropertyValue Property="Label" String="From" />\
              <PropertyValue Property="Value" Path="Annotations" />\
            </Record>\
          </Collection>\
      </Annotation>\
      </Annotations>\
    </Schema>\
  </edmx:DataServices>\
</edmx:Edmx>';


var sNorthwindAnnotationsMalformed = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
  <edmx:Reference Uri="/coco/vocabularies/UI.xml">\
    <edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI" /> \
  </edmx:Reference>\
    <edmx:Include Namespace="com.sap.vocabularies.Communication.v1" Alias="vCard" /> \
  </edmx:Reference> \
  <edmx:Reference Uri="http://docs.oasis-open.org/odata/odata/v4.0/cs01/vocabularies/Org.OData.Measures.V1.xml" >\
    <edmx:Include Namespace="Org.OData.Measures.V1" Alias="CQP" /> \
  </edmx:Reference> \
  <edmx:Reference Uri="http://services.odata.org/Northwind/Northwind.svc/$metadata" >\
    <edmx:Include Namespace="NorthwindModel" Alias="NorthwindModel" /> \
\
  <edmx:DataServices>\
    <!-- Entity Data Model Conceptual Schemas, as specified in [MC-CSDL]  and annotated as specified in [MS-ODATA] -->\
    <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="NorthwindModelAnnotations">\
      <Annotations Target="NorthwindModel.Product/UnitPrice">\
        <Annotation Term="CQP.ISOCurrency" String="USD" />\
      </Annotations>\
        <Annotation Term="CQP.ISOCurrency" String="USD" />\
      </Annotations>\
      <Annotations Target="NorthwindModel.Product">\
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="Product" />\
            <PropertyValue Property="TypeNamePlural" String="Products" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/product32.png" />\
            <PropertyValue Property="Title">\
                <PropertyValue Property="Label" String="Product" />\
                <PropertyValue Property="Value" Path="ProductName" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Product ID" />\
              <PropertyValue Property="Value" Path="ProductID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Quantity / Unit" />\
              <PropertyValue Property="Value" Path="QuantityPerUnit" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Unit Price" />\
              <PropertyValue Property="Value" Path="UnitPrice" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Category" />\
              <PropertyValue Property="Value" Path="Category/CategoryName" />\
            </Record>\
            <Record Type="UI.DataFieldWithNavigation">\
              <PropertyValue Property="Label" String="Supplier" />\
              <PropertyValue Property="Value" Path="Supplier/CompanyName" />\
              <PropertyValue Property="Target" Path="Supplier" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.LineItem">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Value" String="/coco/apps/main/img/Icons/product32.png">\
                <Annotation Term="UI.IsImageURL"/>\
              </PropertyValue>\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Product ID" />\
              <PropertyValue Property="Value" Path="ProductID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Product" />\
              <PropertyValue Property="Value" Path="ProductName" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Quantity / Unit" />\
              <PropertyValue Property="Value" Path="QuantityPerUnit" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Unit Price" />\
              <PropertyValue Property="Value" Path="UnitPrice" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Units In Stock" />\
              <PropertyValue Property="Value" Path="UnitsInStock" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.Facets">\
          <Collection>\
            <Record Type="UI.CollectionFacet">\
              <PropertyValue Property="Label" String="Supplier" />\
              <PropertyValue Property="Facets">      \
                <Collection>    \
                  <Record Type="UI.ReferenceFacet">\
                    <PropertyValue Property="Label" String="Contact Data" />\
                    <PropertyValue Property="Target" AnnotationPath="Supplier/@UI.Identification" />\
                  </Record>\
                  <Record Type="UI.ReferenceFacet">\
                    <Annotation Term="UI.Map"/>\
                    <PropertyValue Property="Label" String="Supplier Address on Map" />\
                    <PropertyValue Property="Target" AnnotationPath="Supplier/@vCard.Address" />\
                  </Record> \
                </Collection>\
              </PropertyValue>\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
      <Annotations Target="NorthwindModel.Category">\
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="Category" />\
            <PropertyValue Property="TypeNamePlural" String="Categories" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/example_32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Category Name" />\
                <PropertyValue Property="Value" Path="CategoryName" />\
              </Record>\
            </PropertyValue>\
            <PropertyValue Property="Description">\
              <Record>\
                <PropertyValue Property="Label" String="Description" />\
                <PropertyValue Property="Value" Path="Description" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Category ID" />\
              <PropertyValue Property="Value" Path="CategoryID" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.LineItem">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Value" String="/coco/apps/main/img/Icons/example_32.png">\
                <Annotation Term="UI.IsImageURL"/>\
              </PropertyValue>\
            </Record>          \
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Category ID" />\
              <PropertyValue Property="Value" Path="CategoryID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Category Name" />\
              <PropertyValue Property="Value" Path="CategoryName" />\
            </Record>\
            <Record>\
              <PropertyValue Property="Label" String="Description" />\
              <PropertyValue Property="Value" Path="Description" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.Facets">\
          <Collection>\
            <Record Type="UI.ReferenceFacet">\
              <PropertyValue Property="Label" String="Products" />\
              <PropertyValue Property="Target" AnnotationPath="Products/@UI.LineItem" />\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
      <Annotations Target="NorthwindModel.Supplier">     \
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="Supplier" />\
            <PropertyValue Property="TypeNamePlural" String="Suppliers" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/supplier32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Supplier" />\
                <PropertyValue Property="Value" Path="CompanyName" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Supplier ID" />\
              <PropertyValue Property="Value" Path="SupplierID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Contact Name" />\
              <PropertyValue Property="Value">\
                <Apply Function="odata.concat">\
                  <Path>ContactTitle</Path>\
                  <String>&#160;-&#160;</String>\
                  <Path>ContactName</Path>\
                </Apply>\
              </PropertyValue>\
            </Record>\
            <Record Type="UI.DataFieldForAnnotation">\
              <PropertyValue Property="Label" String="Supplier Adress" />\
              <PropertyValue Property="Target" AnnotationPath="@vCard.Address" />\
            </Record>\
            <Record Type="UI.DataFieldWithUrl">\
              <PropertyValue Property="Label" String="Homepage" />\
              <PropertyValue Property="Value" Path="HomePage" />\
              <PropertyValue Property="Url" Path="HomePage" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.LineItem">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Value" String="/coco/apps/main/img/Icons/supplier_48.png">\
                <Annotation Term="UI.IsImageURL"/>\
              </PropertyValue>\
            </Record>           \
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Supplier ID" />\
              <PropertyValue Property="Value" Path="SupplierID" />\
            </Record>\
            <Record Type="UI.DataField">\
               <PropertyValue Property="Label" String="Supplier" />\
               <PropertyValue Property="Value" Path="CompanyName" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="vCard.Address">\
          <Record>\
            <PropertyValue Property="street" Path="Address" />\
            <PropertyValue Property="locality" Path="City" />\
            <PropertyValue Property="postalCode" Path="PostalCode" />\
            <PropertyValue Property="country" Path="Country" />\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Facets">\
          <Collection>\
            <Record Type="UI.ReferenceFacet">\
              <PropertyValue Property="Label" String="Products" />\
              <PropertyValue Property="Target" AnnotationPath="Products/@UI.LineItem" />\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
      <Annotations Target="NorthwindModel.Order">\
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="Order" />\
            <PropertyValue Property="TypeNamePlural" String="Orders" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/cart_32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Order ID" />\
                <PropertyValue Property="Value" Path="OrderID" />\
              </Record>\
            </PropertyValue>\
            <PropertyValue Property="Description">\
              <Record>\
                <PropertyValue Property="Label" String="Description" />\
                <PropertyValue Property="Value" String="No description available" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Order Number" />\
              <PropertyValue Property="Value" Path="OrderID" />\
            </Record>\
            <Record Type="UI.DataFieldWithNavigation">\
              <PropertyValue Property="Label" String="Customer" />\
              <PropertyValue Property="Value" Path="Customer/CompanyName" />\
              <PropertyValue Property="Target" Path="Customer" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Required Date" />\
              <PropertyValue Property="Value" Path="RequiredDate" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Shipped Date" />\
              <PropertyValue Property="Value" Path="ShippedDate" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Ship Via" />\
              <PropertyValue Property="Value" Path="ShipVia" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Ship Name" />\
              <PropertyValue Property="Value" Path="ShipName" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.FieldGroup" Qualifier="Overview">\
          <Record>\
            <PropertyValue Property="Label" String="Overview"/>\
            <PropertyValue Property="Data">\
              <Collection>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Employee" />\
                  <PropertyValue Property="Value">\
                    <Apply Function="odata.concat">\
                      <Path>Employee/FirstName</Path>\
                      <String>&#160;</String>\
                      <Path>Employee/LastName</Path>\
                    </Apply>\
                  </PropertyValue>\
                </Record>\
                <Record Type="UI.DataFieldWithNavigation">\
                  <PropertyValue Property="Label" String="Customer" />\
                  <PropertyValue Property="Value" Path="Customer/CompanyName" />\
                  <PropertyValue Property="Target" Path="Customer" />\
                </Record>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Order Date" />\
                  <PropertyValue Property="Value" Path="OrderDate" />\
                </Record>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Required Date" />\
                  <PropertyValue Property="Value" Path="RequiredDate" />\
                </Record>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Shipped Date" />\
                  <PropertyValue Property="Value" Path="ShippedDate" />\
                </Record>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Ship Via" />\
                  <PropertyValue Property="Value" Path="ShipVia" />\
                </Record>\
                <Record Type="UI.DataField">\
                  <PropertyValue Property="Label" String="Ship Name" />\
                  <PropertyValue Property="Value" Path="ShipName" />\
                </Record>\
              </Collection>            \
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.LineItem">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Order Number" />\
              <PropertyValue Property="Value" Path="OrderID" />\
            </Record>\
            <Record Type="UI.DataFieldWithNavigation">\
              <PropertyValue Property="Label" String="Customer" />\
              <PropertyValue Property="Value" Path="Customer/CompanyName" />\
              <PropertyValue Property="Target" Path="Customer" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Order Date" />\
              <PropertyValue Property="Value" Path="OrderDate" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Required Date" />\
              <PropertyValue Property="Value" Path="RequiredDate" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Shipped Date" />\
              <PropertyValue Property="Value" Path="ShippedDate" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Ship Via" />\
              <PropertyValue Property="Value" Path="ShipVia" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Ship Name" />\
              <PropertyValue Property="Value" Path="ShipName" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Value" String="/coco/apps/main/img/Icons/cart_48.png">\
                <Annotation Term="UI.IsImageURL"/>\
              </PropertyValue>\
            </Record>                    \
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.Facets">\
          <Collection>\
            <Record Type="UI.ReferenceFacet">\
              <PropertyValue Property="Label" String="Overview" />\
              <PropertyValue Property="Target" AnnotationPath="@UI.FieldGroup#Overview" />\
            </Record>\
            <Record Type="UI.ReferenceFacet">\
              <PropertyValue Property="Label" String="Order Items" />\
              <PropertyValue Property="Target" AnnotationPath="Order_Details/@UI.LineItem" />\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
      <Annotations Target="NorthwindModel.Customer">     \
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="Customer" />\
            <PropertyValue Property="TypeNamePlural" String="Customers" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/supplier32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Customer" />\
                <PropertyValue Property="Value" Path="CustomerID" />\
              </Record>\
            </PropertyValue>\
            <PropertyValue Property="Description">\
              <Record>\
                <PropertyValue Property="Label" String="Description" />\
                <PropertyValue Property="Value" String="CompanyName" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Customer ID" />\
              <PropertyValue Property="Value" Path="CustomerID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Company" />\
              <PropertyValue Property="Value" Path="CompanyName" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Contact Name" />\
              <PropertyValue Property="Value">\
                <Apply Function="odata.concat">\
                  <Path>ContactTitle</Path>\
                  <String>&#160;-&#160;</String>\
                  <Path>ContactName</Path>\
                </Apply>\
              </PropertyValue>\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
      <Annotations Target="NorthwindModel.Order_Detail">\
        <Annotation Term="UI.HeaderInfo">\
          <Record>\
            <PropertyValue Property="TypeName" String="OrderItem" />\
            <PropertyValue Property="TypeNamePlural" String="OrderItems" />\
            <PropertyValue Property="ImageUrl" String="/coco/apps/main/img/Icons/product32.png" />\
            <PropertyValue Property="Title">\
              <Record>\
                <PropertyValue Property="Label" String="Product Name" />\
                <PropertyValue Property="Value" Path="Product/ProductName" />\
              </Record>\
            </PropertyValue>\
            <PropertyValue Property="Description">\
              <Record>\
                <PropertyValue Property="Label" String="Description" />\
                <PropertyValue Property="Value" String="No description available" />\
              </Record>\
            </PropertyValue>\
          </Record>\
        </Annotation>\
        <Annotation Term="UI.Identification">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Order" />\
              <PropertyValue Property="Value" Path="OrderID" />\
            </Record>\
            <Record Type="UI.DataField">\
                <PropertyValue Property="Label" String="Item" />\
                <PropertyValue Property="Value" Path="Product/ProductName" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Quantity" />\
              <PropertyValue Property="Value" Path="Quantity" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Discount" />\
              <PropertyValue Property="Value" Path="Discount" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Unit Price" />\
              <PropertyValue Property="Value" Path="UnitPrice" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.LineItem">\
          <Collection>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Value" String="/coco/apps/main/img/Icons/product32.png">\
                <Annotation Term="UI.IsImageURL"/>\
              </PropertyValue>\
            </Record>                     \
            <Record Type="UI.DataField">\
               <PropertyValue Property="Label" String="Product Name" />\
               <PropertyValue Property="Value" Path="Product/ProductName" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Product ID" />\
              <PropertyValue Property="Value" Path="Product/ProductID" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Quantity" />\
              <PropertyValue Property="Value" Path="Quantity" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Unit Price" />\
              <PropertyValue Property="Value" Path="UnitPrice" />\
            </Record>\
            <Record Type="UI.DataField">\
              <PropertyValue Property="Label" String="Discount" />\
              <PropertyValue Property="Value" Path="Discount" />\
            </Record>\
          </Collection>\
        </Annotation>\
        <Annotation Term="UI.Facets">\
          <Collection>\
            <Record Type="UI.ReferenceFacet">\
              <PropertyValue Property="Label" String="Details" />\
              <PropertyValue Property="Target" AnnotationPath="Product/@UI.Identification" />\
            </Record>\
          </Collection>\
        </Annotation>\
      </Annotations>\
    </Schema>\
  </edmx:DataServices>\
</edmx:Edmx>';

var sNorthwindData = '\
<?xml version="1.0" encoding="utf-8"?>\
<service xml:base="http://services.odata.org/V3/Northwind/Northwind.svc/" xmlns="http://www.w3.org/2007/app"\
	xmlns:atom="http://www.w3.org/2005/Atom">\
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
</service>';

var sNorthwindMetadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\
	<edmx:DataServices m:DataServiceVersion="1.0" m:MaxDataServiceVersion="3.0"\
		xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">\
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

var sNorthwindMetadataAnnotated = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">\
	<edmx:DataServices m:DataServiceVersion="1.0" m:MaxDataServiceVersion="3.0"\
		xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">\
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
  <edmx:DataServices>\
    <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="NorthwindModelAnnotations">\
      <Annotations Target="UnitTest">\
      <Annotation Term="Test.FromMetadata">\
          <Collection>\
            <Record Type="Test.DataField">\
              <PropertyValue Property="Label" String="From" />\
              <PropertyValue Property="Value" Path="Metadata" />\
            </Record>\
          </Collection>\
      </Annotation>\
      <Annotation Term="Test.Merged">\
          <Collection>\
            <Record Type="Test.DataField">\
              <PropertyValue Property="Label" String="From" />\
              <PropertyValue Property="Value" Path="Metadata" />\
            </Record>\
          </Collection>\
      </Annotation>\
      </Annotations>\
    </Schema>\
  </edmx:DataServices>\
</edmx:Edmx>';
