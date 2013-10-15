package com.sap.ui5.tools.infra.git2p4.commands.relnotes;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.sap.ui5.tools.infra.git2p4.Git2P4Main.Context;
import com.sap.ui5.tools.infra.git2p4.GitClient;
import com.sap.ui5.tools.infra.git2p4.GitClient.Commit;
import com.sap.ui5.tools.infra.git2p4.Log;
import com.sap.ui5.tools.infra.git2p4.Version;
import com.sap.ui5.tools.infra.git2p4.commands.relnotes.CommitMsgAnalyzer.CSS;

/**
 * Command object that implements the "prepare release notes" command.
 * 
 * @author Frank Weigel
 * @since 1.13.1
 */
public class ReleaseNotes {

  public ReleaseNotes() {
  }
  
  private Context context;
  private List<String> relNotes;
  
  public void execute(Context context) throws IOException { 
    
    this.context = context;
    
    List<GitClient.Commit> fixes = new ArrayList<GitClient.Commit>();
    Set<String> untouched = new HashSet<String>();
    // filter out infrastructure commits
    for(GitClient.Commit commit : context.allCommits) {
      String desc = commit.getOriginalCommit().getSummary();
      if ( desc.matches("^\\s*(Release\\s*:.*|Infra\\s*:.*|VERSION CHANGE ONLY\\s*)$") || (context.fixOrFeatureOnly && !FIXORFEATURE.matcher(desc).find()) || INTERNAL.matcher(desc).find() ) {
        continue;
      }
      fixes.add(commit);
      untouched.add(commit.getId());
    }
    
    Collections.sort(fixes, new Comparator<GitClient.Commit>() {
      @Override
      public int compare(Commit o1, Commit o2) {
        String s1 = o1.getOriginalCommit().getSummary(); 
        String s2 = o2.getOriginalCommit().getSummary(); 
        return s1.compareTo(s2);
      }
    });
    Version version = new Version(context.findVersion(context.branch));
    version = new Version(version.major, version.minor, version.patch, null);
    
    relNotes = new ArrayList<String>(512);
    relNotes.add("");
    relNotes.add("== Version " + version + " (" + new SimpleDateFormat("MMMM yyyy", Locale.ENGLISH).format(new Date()) + ") ==");
    relNotes.add("");
    relNotes.add("A patch for the " + context.branch + " code line. It contains the following fixes for the UI5 Core and Controls:");
    relNotes.add("");
    // _filterLog("Fixes", fixes, untouched);
    _filterLog("Core", fixes, untouched, "src/framework");
    _filterLog("Desktop", fixes, untouched, "src/libraries/_sap.ui.layout", "src/libraries/_sap.ui.commons", "src/libraries/_sap.ui.table/", "src/libraries/_sap.ui.ux3/");
    _filterLog("Mobile", fixes, untouched, "src/libraries/_sap.m/", "src/libraries/_sap.me/", "src/libraries/_sap.makit/");
    _filterLog("Charts", fixes, untouched, "src/libraries/_sap.viz/", "src/libraries/_sap.viz.gen/");
    _filterLog("Inbox", fixes, untouched, "src/libraries/_sap.uiext.inbox/");
    if ( !untouched.isEmpty() ) {
      _filterLog("Others", fixes, null, untouched);
    }
    
    Log.println("");
    Log.println("---- 8< --------------------------------------------------------------------------");
    Log.println("");
    for(String line : relNotes) {
      Log.println(line);
    }
    Log.println("");
    Log.println("---- 8< --------------------------------------------------------------------------");
    Log.println("");
  }
  
  private void _filterLog(String caption, List<GitClient.Commit> commits, Set<String> untouched, String ... paths) throws IOException {
    Set<String> filter = null;
    if ( paths != null && paths.length > 0 ) {
      filter = context.getCommits(paths);
    }
    _filterLog(caption, commits, untouched, filter);
  }

  private void _filterLog(String caption, List<GitClient.Commit> commits, Set<String> untouched, Set<String> filter) throws IOException {
    
    boolean header = false;
    
    for(GitClient.Commit commit : commits) {
      if ( filter != null && !filter.contains(commit.getId()) && !filter.contains(commit.getOriginalCommit().getId() )) {
        continue;
      }
      if ( untouched != null ) {
        untouched.remove(commit.getId());
      }
      
      if ( !header ) {
        if ( context.htmlOutput ) {
          renderHtmlBeginSection(caption);
        } else {
          renderWikiBeginSection(caption);
        }
        header = true;
      }

      Commit originalCommit = commit.getOriginalCommit();
      CommitMsgAnalyzer msg = new CommitMsgAnalyzer(originalCommit);

      if ( context.htmlOutput ) {
        renderHtml(msg);
      } else {
        renderWiki(msg);
      }
    }

    if ( header ) {
      if ( context.htmlOutput ) {
        renderHtmlEndSection();
      } else {
        renderWikiEndSection();
      }
    }
  }

  private void renderWikiBeginSection(String caption) {
    relNotes.add("'''" + caption + "'''[[BR]]");
  }
  
  private void renderWikiEndSection() { 
    relNotes.add("");
  }
  
  private void renderWiki(CommitMsgAnalyzer msg) throws IOException {
    Pattern csnPrefix = Pattern.compile("(?:CSN|CSS|OSS)[:\\s]+([- 0-9]+[0-9])(?:[-:\\s(]+|$)");
    Pattern wikiTag = Pattern.compile("\\b[A-Z][a-z0-9_]+([A-Z][a-z0-9_]+)+\\b");
    
    String summary = wikiTag.matcher(msg.getSummary()).replaceAll("!$0");
    List<CSS> tickets = msg.getCSSes();
    if ( tickets != null && !tickets.isEmpty() ) {
      summary += " [[span((fixes ";
      boolean firstticket=true;
      for(CSS css : tickets) {
        if ( firstticket ) {
          firstticket = false;
        } else {
          summary += ", ";
        }
        if ( css.isComplete() ) {
          summary = summary + "[css:" + css.csinsta + ":" + css.mnumm + ":" + css.myear + " CSS " + css.mnumm + "]";
        } else {
          summary = summary + "CSS " + css.mnumm;
        }
      }
      summary += "), class=sapinternal)]]";
    }
    relNotes.add(" * " + summary);
    
    List<String> publicBody = msg.getBody();
    if ( context.includeCommitDetails && publicBody != null && !publicBody.isEmpty() ) {
      relNotes.add("");
      for(int i=0; i<publicBody.size(); i++) {
        String line = publicBody.get(i);
        Matcher m = BULLET.matcher(line);
        if ( m.find() ) {
          int indent = m.group(0).length(); 
          line = " * " + line.substring(indent); // add indent
          while ( i+1<publicBody.size() && getIndent(publicBody.get(i+1)) >= indent ) {
            i++;
            line = line + " " + publicBody.get(i).replaceFirst("^\\s*", "");
          }
        }
        //line = BULLET.matcher(line).replaceAll(" * ");
        line = csnPrefix.matcher(line).replaceAll("[[span((CSN $1) -, class=sapinternal)]] ");
        line = wikiTag.matcher(line).replaceAll("!$0");
        relNotes.add("   " + line);
      }
    }
  }

  private void renderHtmlBeginSection(String caption) {
    relNotes.add("'''" + caption + "'''[[BR]]");
    relNotes.add("{{{");
    relNotes.add("#!html");
    relNotes.add("<ul>");
  }
  
  private void renderHtmlEndSection() { 
    relNotes.add("</ul>");
    relNotes.add("}}}");
  }
  
  private void renderHtml(CommitMsgAnalyzer msg) throws IOException {
    String summary = msg.getSummary();
    List<CSS> tickets = msg.getCSSes();
    if ( tickets != null && !tickets.isEmpty() ) {
      summary += " <span class=\"sapinternal\">(fixes ";
      boolean firstticket=true;
      for(CSS css : tickets) {
        if ( firstticket ) {
          firstticket = false;
        } else {
          summary += ", ";
        }
        if ( css.isComplete() ) {
          summary = summary + "<a href=\"https://gtp.wdf.sap.corp/sap/bc/webdynpro/qce/msg_gui_edit?sap-language=EN&csinsta=" + css.csinsta + "&mnumm=" + css.mnumm + "&myear=" + css.myear + "\">CSS " + css.mnumm + "</a>";
        } else {
          summary = summary + "CSS " + css.mnumm;
        }
      }
      summary += ")</span>";
    }
    
    List<String> details = msg.getPublicBody();
    
    if ( context.includeCommitDetails && details != null && !details.isEmpty() ) {
      
      relNotes.add("<li class=\"sapCommit\">" + summary + "<span class=\"sapCommitMore\"></span>"); // don't close <li>

      relNotes.add("<p class=\"sapCommitDetails\">");
      
      boolean ul=false;
      
      for(int i=0; i<details.size(); i++) {
        String line = details.get(i);
        Matcher m = BULLET.matcher(line);
        if ( m.find() ) {
          int indent = m.group(0).length(); 
          line = "<li>" + line.substring(indent); // add indent
          while ( i+1<details.size() && getIndent(details.get(i+1)) >= indent ) {
            i++;
            line = line + " " + details.get(i).replaceFirst("^\\s*", "");
          }
          if ( !ul ) {
            relNotes.add("<ul>");
            ul = true;
          }
        } else {
          if ( ul ) {
            relNotes.add("</ul>");
            ul = false;  
          }
        }
        line = makeCSSLinks(line);
        relNotes.add("   " + line);
      }
      
      if ( ul ) {
        relNotes.add("</ul>");
        ul = false;  
      }
      
      relNotes.add("</p></li>");
      
    } else {

      relNotes.add("<li class=\"sapCommit\">" + summary + "</li>");

    }
    
  }

  private static final String makeCSSLinks(String line) {
    Pattern csnPrefix = Pattern.compile("(?:CSN|CSS|OSS)[:\\s]+([- 0-9]+[0-9])(?:[-:\\s(]+|$)");
    return csnPrefix.matcher(line).replaceAll("<span class=\"sapinternal\">(CSN $1) -</span>");
  }
  
  private static int getIndent(String line) {
    if ( BULLET.matcher(line).find() ) {
      return -1;
    }
    Matcher m = INDENT.matcher(line);
    if ( m.find() ) {
      return m.group(0).length();
    }
    return -1;
  }
  
  private static final Pattern FIXORFEATURE = Pattern.compile("\\[\\s*(FIX|FEATURE)\\s*\\]", Pattern.CASE_INSENSITIVE);
  private static final Pattern INTERNAL = Pattern.compile("\\[\\s*INTERNAL\\s*\\]", Pattern.CASE_INSENSITIVE);
  private static final Pattern BULLET = Pattern.compile("^(\\s*)[-+*]");
  private static final Pattern INDENT = Pattern.compile("^(\\s*)");

  

}
