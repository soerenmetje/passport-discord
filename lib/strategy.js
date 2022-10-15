/**
 * Dependencies
 */
const OAuth2Strategy = require("passport-oauth2");
const InternalOAuthError = require("passport-oauth2").InternalOAuthError;
const Constants = require("./constants");

/**
 * Options for the Strategy.
 * @typedef {Object} StrategyOptions
 * @property {string} clientID
 * @property {string} clientSecret
 * @property {string} callbackURL
 * @property {Array} scope
 * @property {string} [authorizationURL="https://discord.com/api/oauth2/authorize"]
 * @property {string} [tokenURL="https://discord.com/api/oauth2/token"]
 * @property {string} [scopeSeparator=" "]
 */

/**
 * `Strategy` constructor.
 *
 * The Discord authentication strategy authenticates requests by delegating to
 * Discord via the OAuth2.0 protocol
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid. If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`       OAuth ID to discord
 *   - `clientSecret`   OAuth Secret to verify client to discord
 *   - `callbackURL`    URL that discord will redirect to after auth
 *   - `scope`          Array of permission scopes to request
 *                      Check the official documentation for valid scopes to pass as an array.
 *
 * @class
 */
class Strategy extends OAuth2Strategy {
  /**
   * Super needs options and verify, so we parse it before using 'this'.
   *
   * @param {StrategyOptions} options
   * @param {function} verify
   */
  constructor(options, verify) {
    const parsedOptions = options || {};

    parsedOptions.authorizationURL =
      options.authorizationURL || Constants.authorizationURL;

    parsedOptions.tokenURL = options.tokenURL || Constants.tokenURL;

    parsedOptions.scopeSeparator = options.scopeSeparator || " ";

    super(parsedOptions, verify);

    this.name = "discord";
    this._oauth2.useAuthorizationHeaderforGET(true);
  }

  /**
   * Retrieve user profile from Discord.
   *
   * This function constructs a normalized profile.
   * Along with the properties returned from /users/@me, properties returned include:
   *   - `fetchedAt`        When the data was fetched as a `Date`
   *   - `accessToken`      The access token used to fetch the (may be useful for refresh)
   *
   * @param {string} accessToken
   * @param {function} done
   */
  userProfile(accessToken, done) {
    this._oauth2.get(Constants.userURL, accessToken, (err, body, _res) => {
      if (err) {
        // Extra hint for rate limiting.
        if (err.statusCode === 429)
          return done(
            new InternalOAuthError(
              "Reached rate limit while fetch the user profile.",
              err
            )
          );
        return done(
          new InternalOAuthError("Failed to fetch the user profile.", err)
        );
      }

      try {
        const profile = JSON.parse(body);

        profile.provider = "discord";
        profile.accessToken = accessToken;

        // removed further requests for scope checks to lower risk of hitting Discord rate limits
      } catch (e) {
        return done(new Error("Failed to parse the user profile."));
      }
    });
  }

  /**
   * Options for the authorization.
   * @typedef {Object} authorizationParams
   * @property {any} permissions
   * @property {any} prompt
   */

  /**
   * Return extra parameters to be included in the authorization request.
   *
   * @param {authorizationParams} options
   * @return {Object}
   */
  authorizationParams(options) {
    // Delete undefined options.
    Object.keys(options).forEach(
      (key) => options[key] === undefined && delete options[key]
    );
    return options;
  }
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
