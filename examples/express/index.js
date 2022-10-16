import { config } from "dotenv";
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy } from "@soerenmetje/passport-discord";
// const Strategy = require('@soerenmetje/passport-discord').Strategy

config();
const { CLIENT_ID, CLIENT_SECRET, CALLBACK, PORT } = process.env;

const app = express();

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

const scopes = ["identify", "email", "connections", "guilds", "guilds.join"];
const prompt = "consent";

const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.send("not logged in :(");
};

passport.use(
  new Strategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK,
      scope: scopes,
      prompt: prompt,
    },
    (_accessToken, _refreshToken, profile, done) => {
      process.nextTick(function () {
        return done(null, profile);
      });
    }
  )
);

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.get(
  "/",
  passport.authenticate("discord", { scope: scopes, prompt: prompt })
);

app.get(
  "/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (_req, res) => {
    res.redirect("/info");
  }
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/info", checkAuth, (req, res) => {
  // console.log(req.user)
  res.json(req.user);
});

app.listen(PORT, (err) => {
  /* eslint-disable no-console */
  if (err) return console.log(err);

  console.log(`Listening at port ${PORT}`);
});
