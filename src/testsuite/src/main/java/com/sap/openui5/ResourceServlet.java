package com.sap.openui5;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;


/**
 * The class <code>ResourceServlet</code> is used to return the resources
 * from the local web application context and from the JAR files in the 
 * classpath. The resources have to be located in the META-INF path of the
 * JARs.
 * 
 * @author Peter Muessig
 */
public class ResourceServlet extends HttpServlet {


  /** serial version UID */
  private static final long serialVersionUID = -13060227690820674L;

  /** default prefix for the classpath */
  private static final String CLASSPATH_PREFIX = "META-INF";

  /** name of the base theme */
  private static final String BASE_THEME_NAME = "base";

  /** pattern to identify a theme request */
  private static final Pattern PATTERN_THEME_REQUEST = Pattern.compile("(.*/themes/)([^/]*)(/.*)");

  /** pattern to identify a properties request */
  private static final Pattern PATTERN_PROPERTIES_REQUEST = Pattern.compile("(.*/)([^_]*)(_[^_]*)?(_.*)?\\.properties");


  /* (non-Javadoc)
   * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    
    // lookup the resource
    String path = request.getServletPath() + request.getPathInfo();
    URL url = this.findResource(path);
    
    // return the resource or send 404
    if (url != null) {
      
      URLConnection connection = url.openConnection();
      this.prepareResponse(response, connection);
      
      InputStream is = connection.getInputStream();
      OutputStream os = response.getOutputStream();
      IOUtils.copyLarge(is, os);
      IOUtils.closeQuietly(is);
      
      // include the LessSupport plugin for local testing
      if ("/resources/sap-ui-core.js".equals(path)) {
        
        URL url4less = this.findResource(request.getServletPath() + "/sap/ui/core/plugin/LessSupport.js");
        InputStream is4less = url4less.openStream();
        IOUtils.copyLarge(is4less, os);
        IOUtils.closeQuietly(is4less);
        
      }
      
      os.flush();
      os.close();
      
      response.setStatus(HttpServletResponse.SC_OK);
      this.log("[200] " + request.getRequestURI());
      
    } else {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      this.log("[404] " + request.getRequestURI());
    }
    
  } // method: doGet


  /* (non-Javadoc)
   * @see javax.servlet.http.HttpServlet#doHead(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doHead(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    
    // lookup the resource
    String contextPath = request.getServletPath() + request.getPathInfo();
    URL url = this.findResource(contextPath);
    
    // return the resource or send 404
    if (url != null) {
      
      URLConnection connection = url.openConnection();
      this.prepareResponse(response, connection);
      
      response.setStatus(HttpServletResponse.SC_OK);
      this.log("[200] " + request.getRequestURI());
      
    } else {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      this.log("[404] " + request.getRequestURI());
    }
    
  } // method: doHead


  /**
   * prepares the response and sets the response headers properly
   * @param response response object
   * @param connection URL connection of the content to return
   */
  private void prepareResponse(HttpServletResponse response, URLConnection connection) {
    
    String url = connection.getURL().toString();
    
    String contentType = connection.getContentType();
    if ("content/unknown".equals(contentType)) {
      if (PATTERN_PROPERTIES_REQUEST.matcher(url).matches()) {
        contentType = "text/plain;charset=ISO-8859-1";
      } else {
        contentType = this.getServletContext().getMimeType(url);
      }
    }
    response.setContentType(contentType);
    response.addDateHeader("Last-Modified", connection.getLastModified());
    
  } // method: prepareResponse


  /**
   * finds the resource for the given path
   * @param path path of the resource
   * @return URL to the resource or null
   * @throws MalformedURLException
   */
  private URL findResource(String path) throws MalformedURLException {
    
    // define the classpath for the classloader lookup
    String classPath = CLASSPATH_PREFIX + path;
    
    // first lookup the resource in the web context path
    URL url = this.getServletContext().getResource(path);
    
    // lookup the resource in the current threads classloaders
    if (url == null) {
      url = Thread.currentThread().getContextClassLoader().getResource(classPath);
    }
    
    // lookup the resource in the local classloader
    if (url == null) {
      url = ResourceServlet.class.getClassLoader().getResource(classPath);
    }
    
    // theme fallback? 
    if (url == null) {
      Matcher m = PATTERN_THEME_REQUEST.matcher(path);
      if (m.matches()) {
        String newContextPath = negotiateThemeRequest(path);
        if (!newContextPath.equals(path)) {
          url = this.findResource(newContextPath);
        }
      }
    }
    
    // properties fallback? 
    if (url == null) {
      Matcher m = PATTERN_PROPERTIES_REQUEST.matcher(path);
      if (m.matches()) {
        String newContextPath = negotiatePropertiesRequest(path);
        if (!newContextPath.equals(path)) {
          url = this.findResource(newContextPath);
        }
      }
    }
    
    return url;
    
  } // method: findResource


  /**
   * negotiates the theme request to the base theme
   * @param requestPath requested path
   * @return base theme request path
   */
  private static String negotiateThemeRequest(String requestPath) {
    Matcher m = PATTERN_THEME_REQUEST.matcher(requestPath);
    if (m.matches()) {
      String prePath = m.group(1);
      String postPath = m.group(3);
      return prePath + BASE_THEME_NAME + postPath;
    } else {
      return requestPath;
    }
  } // method: negotiateThemeRequest


  /**
   * negotiates the request path to the more general properties (resource bundle)
   * @param requestPath requested path
   * @return request path to the more general properties file (resource bundle)
   */
  private static String negotiatePropertiesRequest(String requestPath) {
    Matcher m = PATTERN_PROPERTIES_REQUEST.matcher(requestPath);
    if (m.matches()) {
      String prePath = m.group(1);
      String fileName = m.group(2);
      String lang = m.group(3) != null ? m.group(3) : "";
      String country = m.group(4) != null ? m.group(4) : "";
      if (!country.isEmpty()) {
        // special fallback for zh_HK => zh_TW
        // keep in sync with fallback mechanism in JavaScript, ABAP (MIME & BSP)
        // resource handler (JavaScript: Frank W., MIME: Sebastian A., BSP: Silke A.)
        if ("_HK".equals(country)) {
          country = "_TW";
        } else {
          // when a country is set we remove it
          country = "";
        }
      } else if (!lang.isEmpty()) {
        // non english resource bundles will fallback to 
        // the english resource bundle!
        if (!"_en".equals(lang)) {
          lang = "_en";
        } else {
          // when a language is set we remove it
          lang = "";
        }
      }
      return prePath + fileName + lang + country + ".properties";
    } else {
      return requestPath;
    }

  } // method: negotiatePropertiesRequest


} // class: ResourceServlet