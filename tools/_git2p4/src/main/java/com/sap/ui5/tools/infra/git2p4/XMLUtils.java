package com.sap.ui5.tools.infra.git2p4;

import java.io.File;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXParseException;


public class XMLUtils {
  private static DocumentBuilder builder = null;

  private static DocumentBuilder getDocumentBuilder() {
    if ( builder == null ) {
      try {
        DocumentBuilderFactory builderFactory = DocumentBuilderFactory.newInstance();
        builderFactory.setNamespaceAware(true);
        builderFactory.setIgnoringComments(false);
        builder = builderFactory.newDocumentBuilder();
      } catch (ParserConfigurationException e) {
        throw new RuntimeException(e);
      }
    }
    return builder;
  }

  public static Document getDOM(File file) {

    long t0 = System.nanoTime();
    try {
      return getDocumentBuilder().parse(file);
    } catch (SAXParseException e) {
      String at = " at line " + e.getLineNumber() + ", column " + e.getColumnNumber();
      throw new RuntimeException("Fatal Parsing error in file " + file + at + ": " + e.getLocalizedMessage(), e);
    } catch (Exception e) {
      throw new RuntimeException("Fatal Parsing error in file " + file + ": " + e.getLocalizedMessage(), e);
    } finally {
      long t1 = System.nanoTime();
    }

  }

  public static Element findChild(Element elem, String tagName) {
    if ( elem != null ) {
      NodeList children = elem.getChildNodes();
      for(int i=0; i<children.getLength(); i++) {
        Node child = children.item(i);
        if ( child.getNodeType() == Node.ELEMENT_NODE && tagName.equals(child.getNodeName()) ) {
          return (Element) child;
        }
      }
    }
    return null;
  }

}
