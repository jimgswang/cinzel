'use strict';

const assert = require('assert');
const Cinzel = require('../index');

const { Property, CinzelError } = Cinzel;

describe('Cinzel', () => {
  const missingProperty = propName => `Missing: ${propName} is required`;
  const wrongProperty = (propName, typeName) => `Wrong Type: ${propName} should be type ${typeName}`;

  describe('construction', () => {
    const definition = {
      col1: Property.Integer.isRequired,
      col2: Property.String.isRequired,
      col3: Property.Date.isRequired,
      col4: Property.Number.isRequired,
    };
    const params = {
      col1: 1337,
      col2: 'foobar',
      col3: new Date('2017-04-20'),
      col4: 23.11,
    };

    it('should create a class instance', () => {
      const Clazz = Cinzel.create({});
      const obj = new Clazz({});
      assert.ok(obj instanceof Clazz, 'created objects should be instance of model');
    });

    it('should create object with params from constructor', () => {
      const Clazz = Cinzel.create(definition);
      const obj = new Clazz(params);
      assert.strictEqual(obj.col1, params.col1);
      assert.strictEqual(obj.col2, params.col2);
      assert.strictEqual(obj.col3, params.col3);
      assert.strictEqual(obj.col4, params.col4);
    });

    it('should return columns as properties in Object.keys', () => {
      const Clazz = Cinzel.create(definition);
      const obj = new Clazz(params);
      assert.deepEqual(Object.keys(obj), Object.keys(params));
    });
  });

  describe('validation', () => {
    describe('negative cases', () => {
      it('should error when missing required property', () => {
        const Clazz = Cinzel.create({
          col1: Property.Number.isRequired,
        });
        assert.throws(() => new Clazz({}), CinzelError, missingProperty('col1'));
      });

      it('should error when not number type', () => {
        const Clazz = Cinzel.create({
          col1: Property.Number.isRequired,
        });
        assert.throws(() => new Clazz({ col1: 'foobar' }), CinzelError, wrongProperty('col1', 'Number'));
      });

      it('should error when not integer type', () => {
        const Clazz = Cinzel.create({
          col1: Property.Integer.isRequired,
        });
        assert.throws(() => new Clazz({ col1: 32.23 }), CinzelError, wrongProperty('col1', 'Integer'));
      });

      it('should error when not string type', () => {
        const Clazz = Cinzel.create({
          col1: Property.String.isRequired,
        });
        assert.throws(() => new Clazz({ col1: {} }), CinzelError, wrongProperty('col1', 'String'));
      });

      it('should error when not date type', () => {
        const Clazz = Cinzel.create({
          col1: Property.Date.isRequired,
        });
        assert.throws(() => new Clazz({ col1: {} }), CinzelError, wrongProperty('col1', 'Date'));
      });
    });

    describe('positive cases', () => {
      it('should pass when optional property is not defined', () => {
        const Clazz = Cinzel.create({
          col1: Property.String,
        });
        assert.doesNotThrow(() => new Clazz({}));
      });

      it('should pass when optional property is undefined', () => {
        const Clazz = Cinzel.create({
          col1: Property.String,
        });
        assert.doesNotThrow(() => new Clazz({ col1: undefined }));
      });

      it('should pass number type', () => {
        const Clazz = Cinzel.create({
          col1: Property.Number.isRequired,
        });
        assert.doesNotThrow(() => new Clazz({ col1: 23.21 }));
      });

      it('should pass integer type', () => {
        const Clazz = Cinzel.create({
          col1: Property.Integer.isRequired,
        });
        assert.doesNotThrow(() => new Clazz({ col1: 23 }));
      });

      it('should pass number type using integer', () => {
        const Clazz = Cinzel.create({
          col1: Property.Number.isRequired,
        });
        assert.doesNotThrow(() => new Clazz({ col1: 23 }));
      });

      it('should pass string type', () => {
        const Clazz = Cinzel.create({
          col1: Property.String.isRequired,
        });
        assert.doesNotThrow(() => new Clazz({ col1: 'foobar' }));
      });

      it('should pass date type', () => {
        const Clazz = Cinzel.create({
          col1: Property.Date.isRequired,
        });
        assert.doesNotThrow(() => new Clazz({ col1: new Date() }));
      });
    });

    describe('setters', () => {
      it('should throw when modifying validated model to invalid', () => {
        const Clazz = Cinzel.create({
          col1: Property.String.isRequired,
        });
        const obj = new Clazz({ col1: 'foobar' });
        assert.throws(() => { obj.col1 = 232; }, CinzelError, wrongProperty('col1', 'String'));
        assert.strictEqual(obj.col1, 'foobar');
      });
    });

    describe('functions', () => {
      it('should create a valid plain object', () => {
        const Clazz = Cinzel.create({
          col1: Property.String.isRequired,
          col2: Property.Integer.isRequired,
          col3: Property.Date.isRequired,
          col4: Property.Number.isRequired,
        });
        const params = {
          col1: 'foobar',
          col2: 12,
          col3: new Date('2017-03-01'),
          col4: 12.21,
        };
        const obj = new Clazz(params);
        assert.deepEqual(obj.toPlainObject(), params);
      });

      it('should create plain object without missing optional params', () => {
        const Clazz = Cinzel.create({
          col1: Property.String.isRequired,
          col2: Property.Integer.isRequired,
          col3: Property.Date,
          col4: Property.Number,
          col5: Property.Number,
        });
        const params = {
          col1: 'foobar',
          col2: 13,
        };
        const obj = new Clazz(params);
        assert.deepEqual(obj.toPlainObject(), params);
      });
    });
  });
});
