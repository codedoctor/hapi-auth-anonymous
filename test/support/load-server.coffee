_ = require 'underscore'
Hapi = require "hapi"
hapiOauthStoreMultiTenant = require 'hapi-oauth-store-multi-tenant'
hapiUserStoreMultiTenant = require 'hapi-user-store-multi-tenant'
mongoose = require 'mongoose'

databaseCleaner = require './database-cleaner'
index = require '../../lib/index'

loggingEnabled = false
testUrl = 'mongodb://localhost/looksnearme-test'


module.exports = loadServer = (cb) ->
    server = new Hapi.Server()
    server.connection
      port: 5675
      host: "localhost"

    pluginConf = [
        register: hapiUserStoreMultiTenant
      ,
        register: hapiOauthStoreMultiTenant
      ,
        register: index
        options: 
          clientId: "53af466e96ab7635384b71fa"
          _tenantId: "53af466e96ab7635384b71fb"
          roles: ['rolea','roleb','rolec']

    ]

    server.register pluginConf, (err) ->
      return cb err if err
      server.auth.strategy 'default', 'hapi-auth-anonymous',  {}
      server.auth.default 'default'

      server.route
        path: "/test"
        method: "POST"
        handler: (request, reply) ->
          reply request.auth?.credentials

      mongoose.disconnect()
      mongoose.connect testUrl, (err) ->
        return cb err if err
        databaseCleaner loggingEnabled, (err) ->
          return cb err if err

          cb err, server

          ###
          plugin = server.plugins['hapi-user-store-multi-tenant']
          plugin.rebuildIndexes (err) ->

            plugin = server.plugins['hapi-oauth-store-multi-tenant']
            plugin.rebuildIndexes (err) ->
              cb err,server
          ###

