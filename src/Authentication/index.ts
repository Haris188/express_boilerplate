import * as passport from 'passport'
import * as passportJwt from 'passport-jwt'
import * as passportLocal from 'passport-local'
import * as bcrypt from 'bcrypt'
import * as model from './Model'
import * as jwt from 'jsonwebtoken'

const ExtractJwt = passportJwt.ExtractJwt
const LocalStrategy = passportLocal.Strategy
const JwtStrategy = passportJwt.Strategy

export default (app) => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, cb) => {
        return model.getUserWithEmail(email)
            .then(async (user: any) => {
                if (!user)
                    return cb(null, false, { message: "Incorrect email" })

                if (!await bcrypt.compare(password, user.password))
                    return cb(null, false, { message: "Incorrect password" })

                return cb(null, user, { message: 'Logged in successfully' })
            })
            .catch(e => {
                return cb(e)
            })
    }))

    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }, (jwtPayload, cb) => {
        return model.getUserWithId(jwtPayload.id)
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }))

    app.post('/login', (req, res, next) => {
        passport.authenticate('local', { session: false }, (err, user, info) => {
            if (err || !user || user.error) {
                console.log(err)
                return res.status(400).json({
                    message: info ? info.message : "Login failed",
                    user
                })
            }

            req.login(user, { session: false }, (err) => {
                if (err) res.send(err)

                const userRes = user
                delete userRes.password

                const token = jwt.sign(
                    user,
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' })
                return res.json({ data: { userRes, token } })
            })
        })(req, res, next)
    })

    app.post('/register', async (req, res) => {
        if (!req.body)
            res.status(400).send({ error: 'Provided user info is invalid' })

        const userData = req.body
        userData.password = await bcrypt.hash(userData.password, 10)

        const response = await model.insertUser(userData)

        if (!response) {
            res.status(403).send({ message: 'User registeration failed' })
            return
        }

        if (response.userExists) {
            res.status(403).send({ message: 'User Already exists' })
            return
        }

        res.status(200).send({ data: response })
    })
}

export const authBoundary = (app)=>{
    app.use(passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        if (req.user) {
            next()
        }
        else {
            req.status(403).send({ error: 'You are not logged in' })
        }
    })
}