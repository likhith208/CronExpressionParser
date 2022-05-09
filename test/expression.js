
var test = require('tap').test;
var CronExpression = require('../expression');

test('Minute value out of the range', function(t) {
  t.throws(function() {
    CronExpression.parse('61 * * * * /user/bin');
  }, new Error('Constraint error, got value 61 expected range 0-59'));

  t.end();
});

test('Minute  value out of the range', function(t) {
  t.throws(function() {
    CronExpression.parse('-1  * * * * /user/bin');
  }, new Error('Constraint error, got value -1 expected range 0-59'));

  t.end();
});

test('invalid range', function(t) {
  t.throws(function() {
    CronExpression.parse('- * * * * /user/bin');
  }, new Error('Invalid range: -'));

  t.end();
});


test('minute value out of the range', function(t) {
  t.throws(function() {
    CronExpression.parse('32,72 * * * * /user/bin');
  }, new Error('Constraint error, got value 72 expected range 0-59'));

  t.end();
});

test('hour value out of the range', function(t) {
  t.throws(function() {
    CronExpression.parse('* 12-36 * * * /user/bin');
  }, new Error('Constraint error, got range 12-36 expected range 0-23'));

  t.end();
});


test('day of the month value out of the range', function(t) {
  t.throws(function() {
    CronExpression.parse('* * 10-15,40 * * /user/bin');
  }, ('Constraint error, got value 40 expected range 1-31'));

  t.end();
});


test('month value out of the range', function(t) {
  t.throws(function() {
    CronExpression.parse('* * * 12-13 * /user/bin');
  }, new Error('Constraint error, got range 12-13 expected range 1-12'));

  t.end();
});


test('day of the week value out of the range', function(t) {
  t.throws(function() {
    CronExpression.parse('* * * * 9 /user/bin');
  }, new Error('Constraint error, got value 9 expected range 0-7'));

  t.end();
});


test('invalid expression that contains too many fields', function (t) {
  t.throws(function() {
    CronExpression.parse('* * * * * * * *ASD');
  }, new Error('Invalid cron expression'));

  t.end();
});

test('April doesnt have 31 days', function(t) {
  t.throws(function() {
    const iter = CronExpression.parse('0 0 31 4 * /user/bin');
    iter.next();
  }, new Error('Invalid explicit day of month definition'));

  t.end();
});


test('fixed expression test', function(t) {
  try {
    var interval = CronExpression.parse('10 2 12 8 0 /user/bin');
    t.ok(interval, 'Interval parsed');
  } catch (err) {
    t.error(err, 'Interval parse error');
  }

  t.end();
});


test('minutes is multiples of five expression test', function(t) {
  try {
    var interval = CronExpression.parse('*/5 * * * * /user/bin');
    t.ok(interval, 'Interval parsed');
    for (var i = 0, c = interval.fields.minute; i < c; ++i) {
      var minute = interval.fields.minute[i];
      t.equal(minute%5,0,"Minute is multiple to five");
      
    }
  } catch (err) {
    t.error(err, 'Interval parse error');
  }

  t.end();
});

test('incremental minutes expression test', function(t) {
  try {
    var interval = CronExpression.parse('1-5 * * * * /user/bin');
    t.ok(interval, 'Interval parsed');
    for (var i = 0, c = interval.fields.minute; i < c; ++i) {
      var minute = interval.fields.minute[i];
      t.equal(minute,i+1,"Minute is in the range" );  
    }
  } catch (err) {
    t.error(err, 'Interval parse error');
  }

  t.end();
});

test('hours is multiples of two expression test', function(t) {
  try {
    var interval = CronExpression.parse('* */2 * * * /user/bin');
    t.ok(interval, 'Interval parsed');
    for (var i = 0, c = interval.fields.hour; i < c; ++i) {
      var hour = interval.fields.hour[i];
      t.equal(hour%2,0,"hour is multiple to two");
      
    }
  } catch (err) {
    t.error(err, 'Interval parse error');
  }

  t.end();
});

test('incremental hour expression test', function(t) {
  try {
    var interval = CronExpression.parse('* 1-5 * * * /user/bin');
    t.ok(interval, 'Interval parsed');
    for (var i = 0, c = interval.fields.hour; i < c; ++i) {
      var hour = interval.fields.hour[i];
      t.equal(hour,i+1,"hour is in the range" );  
    }
  } catch (err) {
    t.error(err, 'Interval parse error');
  }

  t.end();
});

test('month is multiples of four expression test', function(t) {
  try {
    var interval = CronExpression.parse('* * */4 * * /user/bin');
    t.ok(interval, 'Interval parsed');
    for (var i = 0, c = interval.fields.month; i < c; ++i) {
      var month = interval.fields.month[i];
      t.equal(month%4,0,"hour is multiple to two");
      
    }
  } catch (err) {
    t.error(err, 'Interval parse error');
  }

  t.end();
});

test('incremental month expression test', function(t) {
  try {
    var interval = CronExpression.parse('* * 1-11 * * /user/bin');
    t.ok(interval, 'Interval parsed');
    for (var i = 0, c = interval.fields.month; i < c; ++i) {
      var month = interval.fields.month[i];
      t.equal(month,i+1,"month is in the range" );  
    }
  } catch (err) {
    t.error(err, 'Interval parse error');
  }

  t.end();
});

test('dayofWeek is multiples of two expression test', function(t) {
  try {
    var interval = CronExpression.parse('* * * * */2 /user/bin');
    t.ok(interval, 'Interval parsed');
    for (var i = 0, c = interval.fields.dayOfWeek; i < c; ++i) {
      var dayOfWeek = interval.fields.dayOfWeek[i];
      t.equal(dayOfWeek%2,0,"dayOfWeek is multiple to two");
      
    }
  } catch (err) {
    t.error(err, 'Interval parse error');
  }

  t.end();
});

test('incremental dayofWeek expression test', function(t) {
  try {
    var interval = CronExpression.parse('* * * * 1-5 /user/bin');
    t.ok(interval, 'Interval parsed');
    for (var i = 0, c = interval.fields.dayOfWeek; i < c; ++i) {
      var dayOfWeek = interval.fields.dayOfWeek[i];
      t.equal(dayOfWeek,i+1,"dayOfWeek is in the range" );  
    }
  } catch (err) {
    t.error(err, 'Interval parse error');
  }

  t.end();
});


test('invalid characters test - symbol', function(t) {
  t.throws(function() {
    CronExpression.parse('10 ! 12 8 0 /user/bin');
  }, new Error('Invalid characters, got value: !'));

  t.end();
});

test('invalid characters test - letter', function(t) {
  t.throws(function() {
    CronExpression.parse('10 x 12 8 0 /user/bin');
  }, new Error('Invalid characters, got value: x'));

  t.end();
});

test('invalid characters test - parentheses', function(t) {
  t.throws(function() {
    CronExpression.parse('10 ) 12 8 0 /user/bin');
  }, new Error('Invalid characters, got value: )'));

  t.end();
});

test('interval with invalid characters test', function(t) {
  t.throws(function() {
    CronExpression.parse('10 */A 12 8 0 /user/bin');
  }, new Error('Invalid characters, got value: */A'));

  t.end();
});

test('range with invalid characters test', function(t) {
  t.throws(function() {
    CronExpression.parse('10 0-z 12 8 0 /user/bin');
  }, new Error('Invalid characters, got value: 0-z'));

  t.end();
});

test('group with invalid characters test', function(t) {
  t.throws(function() {
    CronExpression.parse('10 0,1,z 12 8 0 /user/bin');
  }, new Error('Invalid characters, got value: 0,1,z'));

  t.end();
});

test('invalid expression which has repeat 0 times', function(t) {
  t.throws(function() {
    CronExpression.parse('0 */0 * * * /user/bin');
  }, new Error('Constraint error, cannot repeat at every 0 time.'));

  t.end();
});
