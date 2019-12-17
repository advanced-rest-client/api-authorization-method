import { AuthorizationMethod } from '@advanced-rest-client/authorization-method/src/AuthorizationMethod.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import {
  normalizeType,
  METHOD_OAUTH2,
  METHOD_OAUTH1,
} from '@advanced-rest-client/authorization-method/src/Utils.js';
import {
  CustomMethodMixin,
  initializeCustomModel,
  renderCustom,
  validateCustom,
  serializeCustom,
  restoreCustom,
  updateQueryParameterCustom,
  updateHeaderCustom,
} from './CustomMethodMixin.js';
import {
  PassThroughMethodMixin,
  renderPassThrough,
  initializePassThroughModel,
  restorePassThrough,
  serializePassThrough,
  validatePassThrough,
  updateQueryParameterPassThrough,
  updateHeaderPassThrough,
} from './PassThroughMethodMixin.js';
import {
  ApiOauth1MethodMixin,
  initializeOauth1Model,
} from './ApiOauth1MethodMixin.js';
import {
  ApiOauth2MethodMixin,
  initializeOauth2Model,
} from './ApiOauth2MethodMixin.js';
import {
  serializeOauth2Auth,
} from '@advanced-rest-client/authorization-method/src/Oauth2MethodMixin.js';
import styles from './Styles.js';

export const METHOD_CUSTOM = 'custom';
export const METHOD_PASS_THROUGH = 'pass through';

export class ApiAuthorizationMethod extends AmfHelperMixin(
  ApiOauth2MethodMixin(
    ApiOauth1MethodMixin(
      CustomMethodMixin(
        PassThroughMethodMixin(AuthorizationMethod))))) {

  get styles() {
    return [
      super.styles,
      styles,
    ];
  }

  static get properties() {
    return {
      /**
       * A security model generated by the AMF parser.
       * @type {Object|Array}
       */
      security: { type: Object },
      /**
       * When set the "description" of the security definition is rendered.
       * @type {Boolean}
       */
      descriptionOpened: { type: Boolean }
    };
  }

  get _transformer() {
    if (!this.__transformer) {
      this.__transformer = document.createElement('api-view-model-transformer');
    }
    return this.__transformer;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.__transformer = null;
  }

  updated(changed) {
    if (changed.has('security') || changed.has('type')) {
      // the `updated()` is called asynchronously anyway so no need to
      // call `__apiPropHandler()`
      this._processSecurity();
    }
  }

  /**
   * Overrides `AmfHelperMixin.__amfChanged`
   */
  async __amfChanged() {
    this.__apiPropHandler();
  }

  async __apiPropHandler() {
    if (this.__schemeDebouncer) {
      return;
    }
    // This ensures that the `type` and `security` properties are reflected
    // from the attribute, if set.
    await this.updateComplete;
    this.__schemeDebouncer = true;
    setTimeout(() => {
      this.__schemeDebouncer = false;
      this._processSecurity();
    });
  }

  _processSecurity() {
    const type = normalizeType(this.type);
    switch (type) {
      case METHOD_CUSTOM: this[initializeCustomModel](); break;
      case METHOD_OAUTH2: this[initializeOauth2Model](); break;
      case METHOD_OAUTH1: this[initializeOauth1Model](); break;
      case METHOD_PASS_THROUGH: this[initializePassThroughModel](); break;
    }
  }
  /**
   * Toggles value of `descriptionOpened` property.
   *
   * This is a utility method for UI event handling. Use `descriptionOpened`
   * attribute directly instead of this method.
   */
  toggleDescription() {
    this.descriptionOpened = !this.descriptionOpened;
  }

  /**
   * Validates current method.
   * @return {Boolean}
   */
  validate() {
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_CUSTOM: return this[validateCustom]();
      case METHOD_PASS_THROUGH: return this[validatePassThrough]();
      default: return super.validate();
    }
  }

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @return {Object} User provided data
   */
  serialize() {
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_CUSTOM: return this[serializeCustom]();
      case METHOD_OAUTH2: return this[serializeOauth2Auth]();
      case METHOD_PASS_THROUGH: return this[serializePassThrough]();
      default: return super.serialize();
    }
  }

  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param {Object} settings Depends on current type.
   * @return {any}
   */
  restore(settings) {
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_CUSTOM: return this[restoreCustom](settings);
      case METHOD_PASS_THROUGH: return this[restorePassThrough](settings);
      default: return super.restore(settings);
    }
  }

  render() {
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_CUSTOM: return this[renderCustom]();
      case METHOD_PASS_THROUGH: return this[renderPassThrough]();
      default: return super.render();
    }
  }
  /**
   * Updates, if applicable, query parameter value.
   * This is supported for RAML's custom scheme and Pass Through
   * that operates on query parameters model which is only an internal
   * model.
   *
   * This does nothing if the query parameter has not been defined for current
   * scheme.
   *
   * @param {String} name The name of the changed parameter
   * @param {String} newValue A value to apply. May be empty but must be defined.
   */
  updateQueryParameter(name, newValue) {
    if (newValue === null || newValue === undefined) {
      newValue = '';
    }
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_CUSTOM:
        this[updateQueryParameterCustom](name, newValue);
        break;
      case METHOD_PASS_THROUGH:
        this[updateQueryParameterPassThrough](name, newValue);
        break;
    }
  }

  /**
   * Updates, if applicable, header value.
   * This is supported for RAML's custom scheme and Pass Through
   * that operates on headers model which is only an internal model.
   *
   * This does nothing if the header has not been defined for current
   * scheme.
   *
   * @param {String} name The name of the changed header
   * @param {String} newValue A value to apply. May be empty but must be defined.
   */
  updateHeader(name, newValue) {
    if (newValue === null || newValue === undefined) {
      newValue = '';
    }
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_CUSTOM:
        this[updateHeaderCustom](name, newValue);
        break;
      case METHOD_PASS_THROUGH:
        this[updateHeaderPassThrough](name, newValue);
        break;
    }
  }
}
