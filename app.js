const express =  require('express');
const session =  require('express-session') ;
const fs = require('fs');

const app = express();
const PORT = 8080;

/*
 * Application setup
 */

app.set('view engine', 'ejs');
app.use(session({ 
    'secret' : 'foo',
    resave: false, 
    saveUninitialized: false,
    cookie: {
        path: '/',
        httponly: true
    }
}));
app.use(express.urlencoded());
app.use('/scripts', express.static(__dirname + '/scripts'));


/*
 * Helpers
 */

function checkUserAuthenticated(req, res, next) {
    if ( req.session.authenticated ) {
        console.log('[*] User authenticated');
        next();
    } else {
        console.log('[*] User is not authenticated');
        res.redirect('/', 302);
    }
}


/*
 * Application routes
 */

app.get('/', (req, res) => { 
    res.render('pages/index', {
        authenticated: req.session.authenticated,
        username: req.session.username
    });
});

app.get('/login', (req, res) => {
    if ( req.session.authenticated ) {
        res.redirect(302, '/');
    }

     res.render('pages/login', {
        authenticated: req.session.authenticated,
        wrongUsername: false,
        wrongPassword: false
    });
});

app.post('/login', (req, res) => {

    if ( req.session.authenticated ) {
        res.redirect(302, '/');
    }

    
    var usernames = fs.readFileSync('./config/users.txt', 'utf-8')
                      .split('\n')
                      .filter(Boolean);
    
    const username = req.body.username;
    const password = req.body.password;
    if ( !usernames.includes(username) ) {
             res.render('pages/login', {
                authenticated: req.session.authenticated,
                wrongUsername: true,
                wrongPassword: false
            });
    }
    else if ( username == 'vader' && password == 'DarkSide2021'  ) {
            req.session.authenticated = true;
            req.session.username = username;
            res.redirect('/');        
    } else {
            res.render('pages/login', {
                authenticated: req.session.authenticated,
                wrongUsername: false,
                wrongPassword: true
            });

    }
});

app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect(302, '/');
});

app.get('/inbox', checkUserAuthenticated, function(req, res) {

    const result = [
        {
            '_id':  1,
            'sender': 'Galactic Empire Quality Control Team',
            'message-subject': 'Exhaust Port',
            'message': 'We have detected some issues with the exhaust port of the death star. Threat seems minimal, will follow up with more details.'
        }
    ];

    res.render('pages/inbox', {
        authenticated: req.session.authenticated,
        messages: result
    }); 
});

var server = app.listen(PORT, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('PM System app listening at http://%s:%s', host, port);
});
