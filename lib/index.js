(function() {
  var Hoek, boom, internals, _;

  _ = require('underscore');

  Hoek = require('hoek');

  boom = require('boom');

  internals = {};

  module.exports.register = function(plugin, options, cb) {
    if (options == null) {
      options = {};
    }
    options = Hoek.applyToDefaults({
      clientId: null,
      _tenantId: null,
      scope: ['anonymous-access']
    }, options);
    internals.clientId = options.clientId;
    internals._tenantId = options._tenantId;
    if (options.scope && _.isString(options.scope)) {
      options.scope = [options.scope];
    }
    internals.scope = options.scope;
    internals.hapiOauthStoreMultiTenant = plugin.plugins['hapi-oauth-store-multi-tenant'];
    internals.hapiUserStoreMultiTenant = plugin.plugins['hapi-user-store-multi-tenant'];
    Hoek.assert(internals.clientId, 'Missing required clientId property in hapi-auth-anonymous configuration');
    Hoek.assert(internals._tenantId, 'Missing required _tenantId property in hapi-auth-anonymous configuration');
    Hoek.assert(internals.hapiOauthStoreMultiTenant, "Could not access oauth store. Make sure 'hapi-oauth-store-multi-tenant' is loaded as a plugin.");
    Hoek.assert(internals.hapiUserStoreMultiTenant, "Could not access user store. Make sure 'hapi-oauth-store-multi-tenant' is loaded as a plugin.");
    internals.oauthAuth = function() {
      var _ref, _ref1;
      return (_ref = internals.hapiOauthStoreMultiTenant) != null ? (_ref1 = _ref.methods) != null ? _ref1.oauthAuth : void 0 : void 0;
    };
    internals.users = function() {
      var _ref, _ref1;
      return (_ref = internals.hapiUserStoreMultiTenant) != null ? (_ref1 = _ref.methods) != null ? _ref1.users : void 0 : void 0;
    };
    Hoek.assert(_.isFunction(internals.oauthAuth, "No oauth auth accessible."));
    Hoek.assert(_.isFunction(internals.users, "No users accessible."));
    plugin.auth.scheme('hapi-auth-anonymous', internals.bearer);
    return cb();
  };

  module.exports.register.attributes = {
    pkg: require('../package.json')
  };

  internals.validateFunc = function(secretOrToken, cb) {
    var dummyProfile;
    dummyProfile = {
      id: secretOrToken
    };
    return internals.users().getOrCreateUserFromProvider(internals._tenantId, 'hapi-auth-anonymous', secretOrToken, null, dummyProfile, {}, function(err, userResult) {
      var credentials;
      console.log("DDDDDD " + err);
      if (err) {
        return cb(err);
      }
      console.log("USER: " + (JSON.stringify(userResult)));

      /*
      return cb null, null unless infoResult and infoResult.isValid # No token found, not authorized, check
      
      Hoek.assert infoResult.actor,"No actor present in token result"
      Hoek.assert infoResult.actor.actorId,"No actor id present in token result"
       */
      credentials = {
        id: userResult._id || userResult.id,
        clientId: internals.clientId,
        isValid: true,
        isAnonymous: true,
        name: userResult.username,
        user: userResult,
        isClientValid: true,
        scopes: internals.scope,
        scope: internals.scope
      };
      return cb(null, credentials);
    });
  };

  internals.bearer = function(server, options) {
    var scheme;
    scheme = {
      authenticate: function(request, reply) {
        var accessToken, authorization, createCallback, parts, req;
        req = request.raw.req;
        accessToken = request.query['anonymous_token'];
        if (!accessToken) {
          authorization = req.headers.authorization;
          if (!authorization) {
            return reply(boom.unauthorized(null, "Anonymous"));
          }
          parts = authorization.split(/\s+/);
          if (parts.length !== 2) {
            return reply(boom.badRequest("Bad HTTP authentication header format"));
          }
          if (parts[0] && parts[0].toLowerCase() !== "anonymous") {
            return reply(boom.unauthorized(null, "Anonymous"));
          }
          accessToken = parts[1];
        }
        createCallback = function(token) {
          return function(err, credentials) {
            if (err) {
              return reply(err, {
                credentials: credentials,
                log: {
                  tags: ["auth", "anonynous-auth"],
                  data: err
                }
              });
            }
            if (!credentials) {
              return reply(boom.unauthorized("Invalid token", "Anonymous"), {
                credentials: credentials
              });
            }
            return reply(null, {
              credentials: credentials
            });
          };
        };
        return internals.validateFunc(accessToken, createCallback(accessToken));
      }
    };
    return scheme;
  };

}).call(this);

//# sourceMappingURL=index.js.map
