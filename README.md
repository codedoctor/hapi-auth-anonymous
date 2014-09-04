[![Build Status](https://travis-ci.org/codedoctor/hapi-auth-anonymous.svg?branch=master)](https://travis-ci.org/codedoctor/hapi-auth-anonymous)
[![Coverage Status](https://img.shields.io/coveralls/codedoctor/hapi-auth-anonymous.svg)](https://coveralls.io/r/codedoctor/hapi-auth-anonymous)
[![NPM Version](http://img.shields.io/npm/v/hapi-auth-anonymous.svg)](https://www.npmjs.org/package/hapi-auth-anonymous)
[![Dependency Status](https://gemnasium.com/codedoctor/hapi-auth-anonymous.svg)](https://gemnasium.com/codedoctor/hapi-auth-anonymous)
[![NPM Downloads](http://img.shields.io/npm/dm/hapi-auth-anonymous.svg)](https://www.npmjs.org/package/hapi-auth-anonymous)
[![Issues](http://img.shields.io/github/issues/codedoctor/.svg)](https://github.com/codedoctor/hapi-auth-anonymous/issues)
[![HAPI 6.0](http://img.shields.io/badge/hapi-6.0-blue.svg)](http://hapijs.com)
[![API Documentation](http://img.shields.io/badge/API-Documentation-ff69b4.svg)](http://coffeedoc.info/github/codedoctor/hapi-auth-anonymous)


(C) 2014 Martin Wawrusch

HAPI plugin that supports anonymous logins from mobile devices.

1. PLEASE NOTE THAT SIGNIFICANT PARTS OF THE CODE HAVE BEEN USED FROM ANOTHER NPM MODULE (hapi-auth-bearer by Jordan Stout)

2. ALSO, THIS IS WORK IN PROGRESS

3. THIS IS OBVIOUSLY NOT SECURE AS IN BANK LEVEL SECURITY - IT'S FOR CASUAL APPS ONLY

## How does this work?

The scenario is like this: A user opens an app on a mobile device, and is identified by some persistent UUID. Each request to the backend includes and Authorization: anonymous [UUID] header. The UUID can be any format as long as it is a string. This module now ensures that, either a new user is created in the backend or an existing user with that id is retrieved. Voila, we support anonymous users.


## See also

* [hapi-auth-bearer-mw](https://github.com/codedoctor/hapi-auth-bearer-mw)
* [hapi-auth-anonymous](https://github.com/codedoctor/hapi-auth-anonymous)
* [hapi-loggly](https://github.com/codedoctor/hapi-loggly)
* [hapi-mandrill](https://github.com/codedoctor/hapi-mandrill)
* [hapi-mongoose-db-connector](https://github.com/codedoctor/hapi-mongoose-db-connector)
* [hapi-oauth-store-multi-tenant](https://github.com/codedoctor/hapi-oauth-store-multi-tenant)
* [hapi-routes-authorization-and-session-management](https://github.com/codedoctor/hapi-routes-authorization-and-session-management)
* [hapi-routes-oauth-management](https://github.com/codedoctor/hapi-routes-oauth-management)
* [hapi-routes-roles](https://github.com/codedoctor/hapi-routes-roles)
* [hapi-routes-status](https://github.com/codedoctor/hapi-routes-status)
* [hapi-routes-users-authorizations](https://github.com/codedoctor/hapi-routes-users-authorizations)
* [hapi-routes-users](https://github.com/codedoctor/hapi-routes-users)
* [hapi-user-store-multi-tenant](https://github.com/codedoctor/hapi-user-store-multi-tenant)

and additionally

* [api-pagination](https://github.com/codedoctor/api-pagination)
* [mongoose-oauth-store-multi-tenant](https://github.com/codedoctor/mongoose-oauth-store-multi-tenant)
* [mongoose-rest-helper](https://github.com/codedoctor/mongoose-rest-helper)
* [mongoose-user-store-multi-tenant](https://github.com/codedoctor/mongoose-user-store-multi-tenant)

## Contributing
 
* Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet
* Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it
* Fork the project
* Start a feature/bugfix branch
* Commit and push until you are happy with your contribution
* Make sure to add tests for it. This is important so I don't break it in a future version unintentionally.
* Please try not to mess with the package.json, version, or history. If you want to have your own version, or is otherwise necessary, that is fine, but please isolate to its own commit so I can cherry-pick around it.

## Copyright

Copyright (c) 2014 Martin Wawrusch 

