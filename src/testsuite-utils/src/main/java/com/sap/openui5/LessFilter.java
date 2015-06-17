package com.sap.openui5;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.tools.shell.Global;


/**
 * The class <code>LessFilter</code> is used to compile CSS for Less files 
 * on the fly - once they are requested by the application.
 * <p>
 * <i>This class must not be used in productive systems.</i>
 * 
 * @author Peter Muessig, Matthias Osswald
 */
public class LessFilter implements Filter {


  /** default prefix for the classpath */
  private static final String CLASSPATH_PREFIX = "META-INF";

  /** pattern to identify a theme request */
  private static final Pattern PATTERN_THEME_REQUEST = Pattern.compile("(.*)/(library\\.css|library-RTL\\.css|library-parameters\\.json)$");

  /** pattern to identify a theme request */
  private static final Pattern PATTERN_THEME_REQUEST_PARTS = Pattern.compile("(/resources/(.*)/themes/)([^/]*)/.*");


  /** base path for the less JS sources*/
  private static final String LESS_PATH = CLASSPATH_PREFIX + "/less/";

  /** array of scripts for the rhino less instance */
  private static final String[] LESS_JS = {
    "less-env.js", "less.js", "less-rtl-plugin.js", "less-api.js"
  };

  /** keeps the scope of the rhino */
  private Scriptable scope;

  /** function to parse the less input */
  private Function parse;


  /** filter configuration */
  private FilterConfig config;


  /** map for the lastModified timestamps for up-to-date check (library.source.less path --> max timestamp of all less files) */
  private Map<String, Long> lastModified = new HashMap<String, Long>();

  /** cache for the generated resources (resource path --> content) */
  private Map<String, String> cache = new HashMap<String, String>();


  /* (non-Javadoc)
   * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
   */
  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    
    // keep the filter configuration
    this.config = filterConfig;
    
    // initialize the Less Compiler in the Rhino container
    try {
      
      // create a new JS execution context
      Context context = Context.enter();
      context.setOptimizationLevel(9);
      context.setLanguageVersion(Context.VERSION_1_7);

      // initialize the global context sharing object
      Global global = new Global();
      global.init(context);

      // create the scope
      this.scope = context.initStandardObjects(global);

      // load the scripts and evaluate them in the Rhino context
      ClassLoader loader = LessFilter.class.getClassLoader();
      for (String script : LESS_JS) {
        URL url = loader.getResource(LESS_PATH + script);
        Reader reader = new InputStreamReader(url.openStream(), "UTF-8");
        context.evaluateReader(this.scope, reader, script, 1, null);
      }
      
      // get environment object and set the resource loader used in less (see less-api.js)
      Scriptable env = (Scriptable) this.scope.get("__env", this.scope);
      env.put("resourceLoader", env, Context.javaToJS(new ResourceLoader(), this.scope));

      // keep the reference to the JS less API
      this.parse = (Function) this.scope.get("parse", this.scope);
      
      // exit the context
      Context.exit();
      
    } catch (Exception ex) {
      String message = "Failed to initialize LESS compiler!";
      throw new ServletException(message, ex);
    }

  } // method: init


  /* (non-Javadoc)
   * @see javax.servlet.Filter#destroy()
   */
  @Override
  public void destroy() {
    this.parse = null;
    this.scope = null;
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
        
        // compile the less if required (up-to-date check happens in the compile function)
        Matcher m = PATTERN_THEME_REQUEST.matcher(path);
        if (m.matches()) {
          
          // check for existence of the resource
          URL url = this.findResource(path);
          if (url == null) {
            
            String prefixPath = m.group(1);
            String sourcePath = prefixPath + "/library.source.less";
            
            this.compile(sourcePath, false, false);
            
            // return the cached CSS or JSON file
            if (this.cache.containsKey(path)) {
              
              httpResponse.setStatus(HttpServletResponse.SC_OK);
              response.setContentType(this.config.getServletContext().getMimeType(path));
              httpResponse.addDateHeader("Last-Modified", this.lastModified.get(sourcePath));
              
              if ("GET".equals(method)) {
                OutputStream os = response.getOutputStream();
                IOUtils.write(this.cache.get(path), os, "UTF-8");
                IOUtils.closeQuietly(os);
                
                os.flush();
                os.close();
              }
              
              return;
              
            }
              
          } else {
            
            this.log("The resource " + path + " already exists and will not be compiled on-the-fly.");
            
          }
          
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
  private void log(String msg, Throwable t) {
    this.config.getServletContext().log(this.config.getFilterName() + ": "+ msg, t);
  } // method: log
  
  
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

  
  /**
   * determines the max last modified timestamp for the given paths
   * @param paths array of paths
   * @return max last modified timestamp
   */
  private long getMaxLastModified(String[] paths) {
    long lastModified = -1;
    try {
      for (String path : paths) {
        URL url = this.findResource(path);
        if (url != null) {
          URLConnection c = url.openConnection();
          c.connect();
          lastModified = Math.max(lastModified, c.getLastModified());
        }
      }
    } catch (Exception ex) {
      this.log("Failed to determine max last modified timestamp.", ex);
    }
    return lastModified;
  } // method: getMaxLastModified


  /**
   * compiles the CSS, RTL-CSS and theme parameters as JSON
   * @param sourcePath source path
   * @param compressCSS true, if CSS should be compressed
   * @param compressJSON true if JSON should be compressed
   */
  private void compile(String sourcePath, boolean compressCSS, boolean compressJSON) {
    
    Matcher m = PATTERN_THEME_REQUEST_PARTS.matcher(sourcePath);
    if (m.matches()) {
      
      // extract the relevant parts from the request path
      String prefixPath = m.group(1);
      String library = m.group(2);
      String libraryName = library.replace('/', '.');
      String theme = m.group(3);
      String path = prefixPath + theme + "/";
      
      try {
        
        URL url = this.findResource(sourcePath);
        if (url != null) {
          
          // read the library.source.less
          URLConnection conn = url.openConnection();
          conn.connect();
          
          // up-to-date check
          String resources = this.cache.get(path + "resources");
          long lastModified = resources != null ? this.getMaxLastModified(resources.split(";")) : -1;
          if (!this.lastModified.containsKey(sourcePath) || this.lastModified.get(sourcePath) < lastModified) {
            
            // some info
            this.log("Compiling CSS/JSON of library " + libraryName + " for theme " + theme);
            
            // read the content
            InputStream is = conn.getInputStream();
            String input = IOUtils.toString(is, "UTF-8");
            IOUtils.closeQuietly(is);
            
            // time measurement begin
            long millis = System.currentTimeMillis();
            
            // compile the CSS/JSON
            Scriptable result = this.compileCSS(input, path, compressCSS, compressJSON, libraryName);
            
            // cache the result
            String css = Context.toString(ScriptableObject.getProperty((Scriptable) result, "css"));
            this.cache.put(path + "library.css", css);
            String rtlCss = Context.toString(ScriptableObject.getProperty((Scriptable) result, "cssRtl"));
            this.cache.put(path + "library-RTL.css", rtlCss);
            String json = Context.toString(ScriptableObject.getProperty((Scriptable) result, "json"));
            this.cache.put(path + "library-parameters.json", json);
            resources = Context.toString(ScriptableObject.getProperty((Scriptable) result, "resources"));
            this.cache.put(path + "resources", resources);
            
            // log the compile duration
            this.log("  => took " + (System.currentTimeMillis() - millis) + "ms");
            
            // store when the resource has been compiled
            this.lastModified.put(sourcePath, this.getMaxLastModified(resources.split(";")));
            
          }
          
        } else {
          this.log("The less source file cannot be found: " + sourcePath);
        }
      
      } catch (Exception ex) {
        // in case of error we also cleanup the cache!
        this.log("Failed to compile CSS for " + sourcePath, ex);
        this.cache.remove(path + "library.css");
        this.cache.remove(path + "library-RTL.css");
        this.cache.remove(path + "library-parameters.json");
        this.cache.remove(path + "resources");
        this.lastModified.remove(sourcePath);
      }
      
    }
    
  } // method: compile


  /**
   * compiles the CSS, RTL-CSS and theme parameters as JSON
   * @param input less input
   * @param path source path
   * @param compressCSS true, if CSS should be compressed
   * @param compressJSON true if JSON should be compressed
   * @param libraryName name of the library
   */
  private synchronized Scriptable compileCSS(String input, String path, boolean compressCSS, boolean compressJSON, String libraryName) {
    // compile the CSS/JSON within the Rhino environment
    return (Scriptable) Context.call(null, this.parse, this.scope, this.scope, new Object[] { input, path, compressCSS, compressJSON, libraryName });
  } // method: compileCSS


  /**
   * The <code>ResourceLoader</code> is used to load dedicated resources
   * requested by Rhino out of the classpath. 
   */
  public class ResourceLoader {
    
    /**
     * loads a resource for the specified path
     * @param path path of the resource
     */
    public String load(String path) throws IOException {
      String content = null;
      URL resource = LessFilter.this.findResource(path);
      if (resource != null) {
        InputStream is = resource.openStream();
        content = IOUtils.toString(is, "UTF-8");
        IOUtils.closeQuietly(is);
      }
      return content;
    } // method: load
    
  } // inner class: ResourceLoader


} // class: LessFilter