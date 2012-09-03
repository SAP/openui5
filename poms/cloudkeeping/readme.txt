= NW Cloud Deployment Information = 

== Managing the NW Cloud node ==

Deploy the apps on the JPaaS node:
> mvn compile -Dcommand=deploy -Duser=D039071 -Dpassword=

Starting the JPaaS node:
> mvn compile -Dcommand=start -Duser=D039071 -Dpassword=

Stopping the JPaaS node:
> mvn compile -Dcommand=stop -Duser=D039071 -Dpassword=

Undeploying the JPaaS node:
> mvn compile -Dcommand=undeploy -Duser=D039071 -Dpassword=

Status of the JPaaS node:
> mvn compile -Dcommand=status -Duser=D039071 -Dpassword=

