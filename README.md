# passport-discord
<span class="badge-npmversion"><a href="https://www.npmjs.com/package/@soerenmetje/passport-discord" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@soerenmetje/passport-discord.svg" alt="NPM version"/></a></span>
<span class="badge-npmdownloads"><a href="https://www.npmjs.org/package/@soerenmetje/passport-discord" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/@soerenmetje/passport-discord.svg" alt="NPM downloads" /></a></span>

Passport strategy for authentication with [Discord](http://discordapp.com) through the OAuth 2.0 API.

Compared to original packages, this removes Discord user connections & guilds fetching on login.
This aims at reducing sporadically occurring rate limit errors.

If Discord connections or guilds are still needed, they can be directly fetched from Discord.
Advantage here is also to get more recent data.

### Disclaimer

No warranty for anything.
Before using this strategy, it is strongly recommended that you read through the official docs page [here](https://discord.com/developers/docs/topics/oauth2), especially about the scopes and understand how the auth works.

## Installation

```bash
npm install @soerenmetje/passport-discord --save
```

## Usage

### Configure Strategy
The Discord authentication strategy authenticates users via a Discord user account and OAuth 2.0 token(s). A Discord API client ID, secret and redirect URL must be supplied when using this strategy. The strategy also requires a `verify` callback, which receives the access token and an optional refresh token, as well as a `profile` which contains the authenticated Discord user's profile. The `verify` callback must also call `cb` providing a user to complete the authentication.

```javascript
import { Strategy } from "@soerenmetje/passport-discord";
//const Strategy = require('@soerenmetje/passport-discord').Strategy;
import passport from "passport";
//const passport = require('passport')

const scopes = ["identify", "email", "connections", "guilds", "guilds.join"];
const prompt = "consent";

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new Strategy({
    clientID: 'id',
    clientSecret: 'secret',
    callbackURL: 'callbackURL',
    scope: scopes,
    prompt: prompt,
},
(accessToken, refreshToken, profile, cb) => {
    User.findOrCreate({ discordId: profile.id }, (err, user) => {
        return cb(err, user);
    });
}));
```

### Authentication Requests
Use `passport.authenticate()`, and specify the `'discord'` strategy to authenticate requests.

For example, as a route middleware in an Express app:

```javascript
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/' // Failure
}), (req, res) => {
    res.redirect('/profile') // Success
});
```

### Bot Authentication
If using the `bot` scope, the `permissions` option can be set to indicate
specific permissions your bot needs on the server ([permission codes](https://discordapp.com/developers/docs/topics/permissions)):

```javascript
app.get("/auth/discord", passport.authenticate("discord", { permissions: 66321471 }));
```
You can also determine the default guild by passing in a Guild Discord ID and toggle the appearance of the guilds dropdown,

```javascript
app.get("/auth/discord", passport.authenticate("discord", { disable_guild_select: true, guild_id: 'id' }));
```

### Refresh Token Usage
In some use cases where the profile may be fetched more than once or you want to keep the user authenticated, refresh tokens may wish to be used. A package such as `passport-oauth2-refresh` can assist in doing this.

Example:

```bash
npm install passport-oauth2-refresh --save # or pnpm add passport-oauth2-refresh
```

```javascript
import passport from "passport";
//const passport = require('passport')
import { Strategy } from "@soerenmetje/passport-discord";
//const Strategy = require('@soerenmetje/passport-discord').Strategy
import refresh from "passport-oauth2-refresh";
//const refresh = require('passport-oauth2-refresh');

const discordStrategy = new Strategy({
    clientID: 'id',
    clientSecret: 'secret',
    callbackURL: 'callbackURL'
  },
  (accessToken, refreshToken, profile, cb) => {
    profile.refreshToken = refreshToken; // store this for later use
    User.findOrCreate({ discordId: profile.id }, (err, user) => {
        if (err)
            return done(err);

        return cb(err, user);
    });
});

passport.use(discordStrategy);
refresh.use(discordStrategy);
```

Then when refreshing the token

```javascript
refresh.requestNewAccessToken('discord', profile.refreshToken, (err, accessToken, refreshToken) => {
    if (err)
        throw Error(error);

    profile.accessToken = accessToken;  // Store this
});
```


## Examples
The examples can be found in the `/examples` directory.

- Express setup
- vite-plugin-ssr (This one is with Vue but can be easily adapted)


## Change Log

### By this Repository

- Removed Discord user connections & guilds fetching on login.

### By https://github.com/QGIsK/passport-discord

- Added a separate error when being rate limited by Discord. (Note: This does not kill the auth process, when being rate limited on scopes. The 'scope' will simply be empty)
- Rewrite of both original repositories in a more 'modern' fashion.


### By https://github.com/tonestrike/passport-discord

- Ability to configure `disable_guild_select`, and `guild_id` parameters when authenticating bots
- Fixed bug causing callback to be called twice when get guilds request failed
- Fixed bug causing the response to be sent twice on error

### Original Package: https://github.com/nicholastay/passport-discord
- No longer maintained

## Credits
* [QGIsK](https://github.com/QGIsK) - Author of the rewrite
* [tonestrike](https://github.com/tonestrike/) - Author of intermediate fork
* [Nicolas Tay](https://github.com/nicholastay) - Original author of passport-discord package
* [Jared Hanson](https://github.com/jaredhanson) -Author of Passport

## License
Licensed under the [MIT](https://github.com/soerenmetje/passport-discord/blob/main/LICENSE) license.
