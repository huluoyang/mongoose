/**
 * Module dependencies.
 */

var start = require('./common');
var assert = require('assert');
var mongoose = start.mongoose;

describe('sharding', function() {
  it('should handle shard keys properly (gh-2127)', function(done) {
    var mockSchema = {
      options: {
        shardKey: { date: 1 } 
      }
    };
    var Stub = function() {
      this.schema = mockSchema;
      this.$__ = {};
    };
    Stub.prototype.__proto__ = mongoose.Document.prototype;
    var d = new Stub();
    var currentTime = new Date();
    d._doc = { date: currentTime };

    d.$__storeShard();
    assert.equal(currentTime, d.$__.shardval.date);
    done();
  });
});

describe('toObject()', function() {
  var Stub;

  beforeEach(function() {
    Stub = function() {
      var schema = this.schema = {
        options: { toObject: { minimize: false, virtuals: true } },
        virtuals: { virtual: 'test' }
      };
      this._doc = { empty: {} };
      this.get = function(path) { return schema.virtuals[path]; };
      this.$__ = {};
    };
    Stub.prototype = Object.create(mongoose.Document.prototype);
    var d = new Stub();
  });

  it('should inherit options from schema', function(done) {
    var d = new Stub();
    assert.deepEqual(d.toObject(), { empty: {}, virtual: 'test' });
    done();
  });

  it('can overwrite by passing an option', function(done) {
    var d = new Stub();
    assert.equal(d.toObject({ minimize: true }), undefined);
    done();
  });
});
