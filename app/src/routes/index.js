/*
 * Routing index
 */

module.exports = function(app, passport) {
  app.get('/', function(req, res, next) {
    // Redirect to user page if they are logged in
    if (req.user) {
      console.log('user', req.user.values);
      res.redirect('/user/' + req.user.uuid);
    } else {
      res.render('index');
    }
  });

  var Auth = require('../controllers/middlewares').Auth;

  app.get('/user/:id', Auth.auth, function(req, res, next) {
    res.render('user', {
      //pass back all of their tabs...
    });
  });

  app.get('/sync/:resource', Auth.authApi, function(req, res, next) {
    res.json(req.user[req.params.resource]);
  });

  var User = require('../models').User;
  var Tab = require('../models').Tab;
  var validator = require('validator');

  app.post('/tab/new', Auth.auth, function(req, res, next) {
    var body = req.body;
    console.log(body);

    var amount = makeCurrency(parseFloat(body.amount)) || null;
    var tip = parseInt(body.tip, 10) || 0;
    var total = makeCurrency(parseFloat(body.total)) || null;

    var names = body.names.filter(function(name) {
      var n = validator.escape(validator.trim(name));
      if (n) return n;
    });
    var ids = body.ids.map(function(id) {
      var n = parseInt(id, 10);
      if (!isNaN(n)) return n;
    });

    var description = validator.escape(validator.trim(body.description)) || null;
    var payment = validator.escape(validator.trim(body.payment)) || null;

    var date = validator.toDate(body.date) || new Date();
    var deadline = validator.toDate(body.deadline) || null;

    if (isNaN(amount) || isNaN(tip) || isNaN(total)) {
      return next('form values are malformed (not a number)');
    }

    if (null === (amount || total || names || ids) || names.length === 0 || ids.length === 0 || names.length != ids.length) {
      return next('form values are missing');
    }

    /*
     *{ amount: '50',
     *  names: [ 'Josh Compagnyolo', 'Aneel Mawji' ],
     *  ids: [ '514588664', '515969532' ],
     *  description: 'Did some stuff together...',
     *  date: 'TODAY',
     *  deadline: 'TOMORROW',
     *  tip: '15',
     *  payment: 'other',
     *  total: '57.50' }
     */

    ids.forEach(function(id, i) {
      console.log(id, i, names[i]);
      //check if that id belongs to user
      //find or create user
      //create tab
      //associate tab
      User.find({
        where: {
          fbid: id
        }
      }).success(function(friend) {
        if (!friend) {
          User.fill(id, names[i], function(err, friend) {
            console.log('filled...', friend, err);
            if (err) return next(err);
            createTab(friend);
          });
        } else {
          console.log(friend);
          createTab(friend);
        }
      }).error(function(err) {
        next(err);
      });
    });

    function createTab(friend) {
      console.log('got the owing party', friend.values);
    }

/*
 *    req.user.addFriend(tab).success(function() {
 *      console.log('added new tab!');
 *    });
 *
 *
 *
 *
 *    req.user.Tab{
 *      amount: amount,
 *      description: description,
 *      date: date,
 *      deadline: deadline,
 *      tip: tip,
 *      payment: payment,
 *      total: total,
 *      paid: false
 *    };
 *
 *    req.user.addFriend(re)
 */

    function makeCurrency(num) {
      return (Math.round(num * 100) / 100).toFixed(2);
    }

    res.redirect('/user/' + req.user.uuid);
  });

  require('./user-auth')(app, passport);
  require('./base')(app);
};
