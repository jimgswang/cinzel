'use strict';

const _ = require('lodash');
const { CinzelError } = require('../lib/errors');

class Property {
  static get Number() {
    return new Property(_.isNumber, 'Number');
  }

  static get Integer() {
    return new Property(_.isInteger, 'Integer');
  }

  static get String() {
    return new Property(_.isString, 'String');
  }

  static get Date() {
    return new Property(_.isDate, 'Date');
  }

  /**
   * Create a new Property definition
   * @constructor
   * @param checker - The checking function
   * @param typeName - The name of the property, used for error messages
   * */
  constructor(checker, typeName) {
    this._key = undefined;
    this._required = false;
    this._checker = checker || _.noop;
    this._typeName = typeName || '';
  }

  /**
   * Chained call on a Property to mark it as a required field
   * */
  get isRequired() {
    this._required = true;
    return this;
  }

  setKey(key) {
    this._key = key;
    return this;
  }

  check(value) {
    if (value === undefined || value === null) {
      if (!this._required) {
        return;
      }
      throw new CinzelError(`Missing: ${this._key} is required`);
    }
    if (!this._checker(value)) {
      throw new CinzelError(`Wrong Type: ${this._key} should be type ${this._typeName}`);
    }
  }
}

class ModelProxy {
  constructor() {
    return new Proxy(this, {
      set: (object, key, value) => {
        const definition = this.constructor.definition;
        definition[key] && definition[key].check(value);
        object[key] = value;
        return true;
      },
    });
  }

  _init(object) {
    if (!object && !_.isObject(object)) {
      throw new CinzelError('Constructor argument must be a plain object');
    }

    _.forOwn(this.constructor.keys, (key) => {
      const value = object[key];
      this[key] = value;
    });
  }

  toPlainObject() {
    return _.chain(this)
      .pick(this.constructor.keys)
      .omitBy(value => value === undefined)
      .value();
  }
}

/**
 * Function to invoke to create a new Cinzel class definition
 * @example
 * Cinzel.create({ field1: Property.string })
 * */
function create(definition) {
  _.forOwn(definition, (prop, key) => prop.setKey(key));

  class CinzelModel extends ModelProxy {
    static get keys() {
      return _.keys(definition);
    }

    static get definition() {
      return definition;
    }

    constructor(object) {
      super();
      this._init(object);
    }
  }

  return CinzelModel;
}

Object.assign(exports, { create, Property });
