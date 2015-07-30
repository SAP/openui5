package com.sap.openui5;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.GenericServlet;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;


/**
 * The class <code>ConcatFilter</code> is used to concatenate files like 
 * sap-ui-core.js, sap-ui-core-nojQuery.js and sap-ui-debug.js.
 * <p>
 * <i>This class must not be used in productive systems.</i>
 * 
 * @author Peter Muessig
 */
public class ConcatFilter implements Filter {


  /** default prefix for the classpath */
  private static final String CLASSPATH_PREFIX = "META-INF";


  /** filter configuration */
  private FilterConfig config;


  /* (non-Javadoc)
   * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
   */
  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    
    // keep the filter configuration
    this.config = filterConfig;
    
  } // method: init


  /* (non-Javadoc)
   * @see javax.servlet.Filter#destroy()
   */
  @Override
  public void destroy() {
    this.config = null;
  } // method: destroy


  /* (non-Javadoc)
   * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
   */
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    
    // make sure that the request/response are http request/response
    if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
      
      // determine the path of the request
      HttpServletRequest httpRequest = (HttpServletRequest) request;
      HttpServletResponse httpResponse = (HttpServletResponse) response;
      String method = httpRequest.getMethod().toUpperCase(); // NOSONAR
      String path = httpRequest.getServletPath() + httpRequest.getPathInfo();
      
      // only process GET or HEAD requests
      if (method.matches("GET|HEAD")) {
        
        // check for sap-ui-core.js
        if ("/resources/sap-ui-core.js".equals(path)) {
          
          this.log("Merging module: sap-ui-core.js");
          
          response.setContentType(this.config.getServletContext().getMimeType(path));
          httpResponse.addDateHeader("Last-Modified", System.currentTimeMillis());
          
          if ("GET".equals(method)) {
            OutputStream os = response.getOutputStream();
            IOUtils.write(this.loadResource("/resources/sap/ui/thirdparty/jquery.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/sap/ui/thirdparty/jqueryui/jquery-ui-position.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/sap/ui/Device.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/sap/ui/thirdparty/URI.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/sap/ui/thirdparty/es6-promise.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/jquery.sap.global.js"), os, "UTF-8");
            IOUtils.write("jQuery.sap.require(\"sap.ui.core.Core\"); sap.ui.getCore().boot && sap.ui.getCore().boot();", os, "UTF-8");
            IOUtils.closeQuietly(os);
            
            os.flush();
            os.close();
          }
          
          return;
          
        } else if ("/resources/sap-ui-core-nojQuery.js".equals(path)) {
          
          this.log("Merging module: sap-ui-core-nojQuery.js");
          
          response.setContentType(this.config.getServletContext().getMimeType(path));
          httpResponse.addDateHeader("Last-Modified", System.currentTimeMillis());
          
          if ("GET".equals(method)) {
            OutputStream os = response.getOutputStream();
            IOUtils.write(this.loadResource("/resources/sap/ui/Device.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/sap/ui/thirdparty/URI.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/sap/ui/thirdparty/es6-promise.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/jquery.sap.global.js"), os, "UTF-8");
            IOUtils.write("jQuery.sap.require(\"sap.ui.core.Core\"); sap.ui.getCore().boot && sap.ui.getCore().boot();", os, "UTF-8");
            IOUtils.closeQuietly(os);
            
            os.flush();
            os.close();
          }
          
          return;
          
        } else if ("/resources/sap-ui-debug.js".equals(path)) {
          
          this.log("Merging module: sap-ui-core-nojQuery.js");
          
          response.setContentType(this.config.getServletContext().getMimeType(path));
          httpResponse.addDateHeader("Last-Modified", System.currentTimeMillis());
          
          if ("GET".equals(method)) {
            OutputStream os = response.getOutputStream();
            IOUtils.write(this.loadResource("/resources/sap/ui/debug/ControlTree.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/sap/ui/debug/Highlighter.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/sap/ui/debug/LogViewer.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/sap/ui/debug/PropertyList.js"), os, "UTF-8");
            IOUtils.write(this.loadResource("/resources/sap/ui/debug/DebugEnv.js"), os, "UTF-8");
            IOUtils.closeQuietly(os);
            
            os.flush();
            os.close();
          }
          
          return;
          
        }
        
      }
      
    }
    
    // proceed in the filter chain
    chain.doFilter(request, response);
    
  } // method: doFilter


  /**
   * logs the message prepended by the filter name (copy of {@link GenericServlet#log(String)})
   * @param msg the message
   */
  private void log(String msg) {
    this.config.getServletContext().log(this.config.getFilterName() + ": "+ msg);
  } // method: log
  
  /**
   * logs the message and <code>Throwable</code> prepended by the filter name (copy of {@link GenericServlet#log(String, Throwable)})
   * @param msg the message
   * @param t the <code>Throwable</code>
   */
  @SuppressWarnings("unused")
  private void log(String msg, Throwable t) {
    this.config.getServletContext().log(this.config.getFilterName() + ": "+ msg, t);
  } // method: log
  
  
  /**
   * loads a resource for the specified path
   * @param path path of the resource
   */
  public String loadResource(String path) throws IOException {
    String content = null;
    URL resource = ConcatFilter.this.findResource(path);
    if (resource != null) {
      InputStream is = resource.openStream();
      content = IOUtils.toString(is, "UTF-8");
      IOUtils.closeQuietly(is);
    }
    return content;
  } // method: loadResource
  
  
  /**
   * finds the resource for the given path
   * @param path path of the resource
   * @return URL to the resource or null
   * @throws MalformedURLException
   */
  private URL findResource(String path) throws MalformedURLException {
    
    // normalize the path (JarURLConnection cannot resolve non-normalized paths)
    String normalizedPath = URI.create(path).normalize().toString();
    
    // define the classpath for the classloader lookup
    String classPath = CLASSPATH_PREFIX + normalizedPath;
    
    // first lookup the resource in the web context path
    URL url = this.config.getServletContext().getResource(normalizedPath);

    // lookup the resource in the current threads classloaders
    if (url == null) {
      url = Thread.currentThread().getContextClassLoader().getResource(classPath);
    }

    // lookup the resource in the local classloader
    if (url == null) {
      url = ResourceServlet.class.getClassLoader().getResource(classPath);
    }

    return url;
    
  } // method: findResource

} // class: ConcatFilter