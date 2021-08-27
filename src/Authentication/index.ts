import * as passport from 'passport'
import * as passportJwt from 'passport-jwt'
import * as passportLocal from 'passport-local'
import * as bcrypt from 'bcrypt'
import * as model from './Model'
import * as jwt from 'jsonwebtoken'

const ExtractJwt = passportJwt.ExtractJwt
const LocalStrategy = passportLocal.Strategy
const JwtStrategy = passportJwt.Strategy

export default (app)=>{
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, cb)=>{
        return model.getUserWithEmail(email)
        .then((user:any)=>{
            if(!user) 
            return cb(null, false,{message: "Incorrect email"})

            if(!bcrypt.compare(password, user.password))
            return cb(null, false,{message: "Incorrect password"})

            return cb(null, user, {message:'Logged in successfully'})
        })
        .catch(e=>{
            return cb(e)
        })
    }))

    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }, (jwtPayload, cb)=>{
        return model.getUserWithId(jwtPayload.id)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        });
    }))

    app.post('/login', (req,res, next)=>{
        passport.authenticate('local', {session:false}, (err, user, info)=>{
            if(err || !user || user.error){
                console.log(err)
                return res.status(400).json({
                    message: info ? info.message: "Login failed",
                    user
                })
            }

            req.login(user, {session:false}, (err)=>{
                if(err) res.send(err)

                const token = jwt.sign(
                    user, 
                    process.env.JWT_SECRET, 
                    {expiresIn: '1h'})
                return res.json({user, token})
            })
        })(req,res, next)
    })
}