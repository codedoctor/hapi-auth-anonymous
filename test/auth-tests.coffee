_ = require 'underscore'
assert = require 'assert'
should = require 'should'

loadServer = require './support/load-server'

describe 'WHEN index has been loaded', ->
  server = null

  describe 'WITH server setup', ->
    beforeEach (cb) ->
      loadServer (err,serverResult) ->
        return cb err if err
        server = serverResult
        cb null

    describe 'authenticating with a user', ->
      it 'should create a user if it does not exist', (cb) ->
        options =
          method: "POST"
          url: "/test"
          headers: 
            "Authorization" : "anonymous a"

        server.inject options, (response) ->
          response.statusCode.should.equal 200    
          should.exist response.result
          console.log JSON.stringify(response.result)

          cb null

      it 'should use an existing user', (cb) ->
        # CREATE USER FOR TOKEN b first

        options =
          method: "POST"
          url: "/test"
          headers: 
            "Authorization" : "anonymous b"

        server.inject options, (response) ->
          response.statusCode.should.equal 200    
          should.exist response.result
          console.log JSON.stringify(response.result)

          cb null

    describe 'authenticating without a user', ->
      it 'should not be authenticated', (cb) ->
        options =
          method: "POST"
          url: "/test"

        server.inject options, (response) ->
          response.statusCode.should.equal 401

          should.exist response.headers
          response.headers.should.have.property 'www-authenticate','Anonymous'

          should.exist response.result
          response.result.should.have.property 'error','Unauthorized'
          response.result.should.have.property 'message','Missing authentication'

        
          cb null

