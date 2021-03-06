(function() {
  var Hoek, _, boom, internals;

  _ = require('underscore');

  Hoek = require('hoek');

  boom = require('boom');

  internals = {};

  module.exports.register = function(server, options, cb) {
    if (options == null) {
      options = {};
    }
    options = Hoek.applyToDefaults({
      clientId: null,
      _tenantId: null,
      scope: ['user-anonymous-access']
    }, options);
    internals.clientId = options.clientId;
    internals._tenantId = options._tenantId;
    if (options.scope && _.isString(options.scope)) {
      options.scope = [options.scope];
    }
    internals.scope = options.scope;
    internals.roles = [];
    if (_.isArray(options.roles)) {
      internals.roles = options.roles;
    }
    internals.hapiOauthStoreMultiTenant = server.plugins['hapi-oauth-store-multi-tenant'];
    internals.hapiUserStoreMultiTenant = server.plugins['hapi-user-store-multi-tenant'];
    Hoek.assert(internals.clientId, 'Missing required clientId property in hapi-auth-anonymous configuration');
    Hoek.assert(internals._tenantId, 'Missing required _tenantId property in hapi-auth-anonymous configuration');
    Hoek.assert(internals.hapiOauthStoreMultiTenant, "Could not access oauth store. Make sure 'hapi-oauth-store-multi-tenant' is loaded as a plugin.");
    Hoek.assert(internals.hapiUserStoreMultiTenant, "Could not access user store. Make sure 'hapi-oauth-store-multi-tenant' is loaded as a plugin.");
    internals.oauthAuth = function() {
      var ref, ref1;
      return (ref = internals.hapiOauthStoreMultiTenant) != null ? (ref1 = ref.methods) != null ? ref1.oauthAuth : void 0 : void 0;
    };
    internals.users = function() {
      var ref, ref1;
      return (ref = internals.hapiUserStoreMultiTenant) != null ? (ref1 = ref.methods) != null ? ref1.users : void 0 : void 0;
    };
    Hoek.assert(_.isFunction(internals.oauthAuth, "No oauth auth accessible."));
    Hoek.assert(_.isFunction(internals.users, "No users accessible."));
    server.auth.scheme('hapi-auth-anonymous', internals.bearer);
    return cb();
  };

  module.exports.register.attributes = {
    pkg: require('../package.json')
  };

  internals.validateFunc = function(secretOrToken, cb) {
    var createOptions, dummyProfile;
    dummyProfile = {
      id: secretOrToken
    };
    createOptions = {
      roles: internals.roles
    };
    return internals.users().getOrCreateUserFromProvider(internals._tenantId, 'hapi-auth-anonymous', secretOrToken, null, dummyProfile, createOptions, function(err, userResult) {
      var credentials;
      if (err) {
        return cb(err);
      }
      if (_.isFunction(userResult.toObject)) {
        userResult = userResult.toObject();
      }
      userResult._id = userResult._id.toString();
      credentials = {
        id: userResult._id,
        clientId: internals.clientId,
        isValid: true,
        isAnonymous: true,
        name: userResult.username,
        user: userResult,
        isClientValid: true,
        scopes: internals.scope,
        scope: internals.scope,
        roles: userResult.roles || []
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
                  tags: ["auth", "anonynous-auth", "anonymous-auth"],
                  data: err
                }
              });
            }
            if (!credentials) {
              return reply(boom.unauthorized("Invalid token", "Anonymous"), {
                credentials: credentials
              });
            }
            return reply["continue"]({
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
