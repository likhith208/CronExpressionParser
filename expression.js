'use strict';

/**
 * Construct a new expression parser
 *
 *
 * @constructor
 * @private
 * @param {Object} fields  Expression fields parsed values
 * @param {Object} options Parser options
 */
function CronExpression (fields) {
  this.fields = fields;
}

/**
 * Field mappings
 * @type {Array}
 */
CronExpression.map = [ 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek' ];

/**
 * Fields constraints
 * @type {Array}
 */
CronExpression.constraints = [
  //{ min: 0, max: 59, chars: [] }, // Second
  { min: 0, max: 59 }, // Minute
  { min: 0, max: 23 }, // Hour
  { min: 1, max: 31 }, // Day of month
  { min: 1, max: 12 }, // Month
  { min: 0, max: 7}, // Day of week
];

/**
 * Days in month
 * @type {number[]}
 */
CronExpression.daysInMonth = [
  31,
  29,
  31,
  30,
  31,
  30,
  31,
  31,
  30,
  31,
  30,
  31
];


/**
 * Field defaults
 * @type {Array}
 */
CronExpression.parseDefaults = [ '0', '*', '*', '*', '*', '*' ];

CronExpression.standardValidCharacters = /^[,*\d/-]+$/;


CronExpression._isValidConstraintChar = function _isValidConstraintChar(constraints, value) {
  if (typeof value !== 'string') {
    return false;
  }
  return true;
};

/**
 * Parse input interval
 *
 * @param {String} field Field symbolic name
 * @param {String} value Field value
 * @param {Array} constraints Range upper and lower constraints
 * @return {Array} Sequence of sorted values
 * @private
 */
CronExpression._parseField = function _parseField (field, value, constraints) {
  
  // Check for valid characters.
  if (!(CronExpression.standardValidCharacters.test(value))) {
    throw new Error('Invalid characters, got value: ' + value);
  }

  // Replace '*' and '?'
  if (value.indexOf('*') !== -1) {
    value = value.replace(/\*/g, constraints.min + '-' + constraints.max);
  } else if (value.indexOf('?') !== -1) {
    value = value.replace(/\?/g, constraints.min + '-' + constraints.max);
  }

  //
  // Inline parsing functions
  //
  // Parser path:
  //  - parseSequence
  //    - parseRepeat
  //      - parseRange

  /**
   * Parse sequence
   *
   * @param {String} val
   * @return {Array}
   * @private
   */
  function parseSequence (val) {
      // console.log("parseSequence: "+ val);
    var stack = [];

    function handleResult (result) {
      if (result instanceof Array) { // Make sequence linear
        for (var i = 0, c = result.length; i < c; i++) {
          // console.log("i: "+ result[i]);
          var value = result[i];

          if (CronExpression._isValidConstraintChar(constraints, value)) {
            stack.push(value);
            continue;
          }
          // Check constraints
          if (typeof value !== 'number' || Number.isNaN(value) || value < constraints.min || value > constraints.max) {
            throw new Error(
                'Constraint error, got value ' + value + ' expected range ' +
                constraints.min + '-' + constraints.max
            );
          }

          stack.push(value);
        }
      } else { // Scalar value

        if (CronExpression._isValidConstraintChar(constraints, result)) {
          stack.push(result);
          return;
        }

        var numResult = +result;

        // Check constraints
        if (Number.isNaN(numResult) || numResult < constraints.min || numResult > constraints.max) {
          throw new Error(
            'Constraint error, got value ' + result + ' expected range ' +
            constraints.min + '-' + constraints.max
          );
        }

        if (field === 'dayOfWeek') {
          numResult = numResult % 7;
        }

        stack.push(numResult);
      }
    }

    var atoms = val.split(',');
    if (!atoms.every(function (atom) {
      return atom.length > 0;
    })) {
      throw new Error('Invalid list value format');
    }

    if (atoms.length > 1) {
      for (var i = 0, c = atoms.length; i < c; i++) {
        handleResult(parseRepeat(atoms[i]));
      }
    } else {
      handleResult(parseRepeat(val));
    }

    stack.sort(CronExpression._sortCompareFn);
    //console.log("LikhithTEST " + stack);
    return stack;
  }

  /**
   * Parse repetition interval
   *
   * @param {String} val
   * @return {Array}
   */
  function parseRepeat (val) {
    var repeatInterval = 1;
    var atoms = val.split('/');

    if (atoms.length > 1) {
      if (atoms[0] == +atoms[0]) {
        atoms = [atoms[0] + '-' + constraints.max, atoms[1]];
        // console.log("parseRepeat: "+ atoms);
      }
      return parseRange(atoms[0], atoms[atoms.length - 1]);
    }

    return parseRange(val, repeatInterval);
  }

  /**
   * Parse range
   *
   * @param {String} val
   * @param {Number} repeatInterval Repetition interval
   * @return {Array}
   * @private
   */
  function parseRange (val, repeatInterval) {
    var stack = [];
    var atoms = val.split('-');
    if (atoms.length > 1 ) {
      // Invalid range, return value
      if (atoms.length < 2) {
        return +val;
      }

      if (!atoms[0].length) {
        if (!atoms[1].length) {
          throw new Error('Invalid range: ' + val);
        }

        return +val;
      }

      // Validate range
      var min = +atoms[0];
      var max = +atoms[1];

      if (Number.isNaN(min) || Number.isNaN(max) ||
          min < constraints.min || max > constraints.max) {
        throw new Error(
          'Constraint error, got range ' +
          min + '-' + max +
          ' expected range ' +
          constraints.min + '-' + constraints.max
        );
      } else if (min >= max) {
        throw new Error('Invalid range: ' + val);
      }

      // Create range
      var repeatIndex = +repeatInterval;

      if (Number.isNaN(repeatIndex) || repeatIndex <= 0) {
        throw new Error('Constraint error, cannot repeat at every ' + repeatIndex + ' time.');
      }

      for (var index = min, count = max; index <= count; index++) {
        if (repeatIndex > 0 && (repeatIndex % repeatInterval) === 0) {
          // console.log("val: "+ val + "repeatInterval: "+ repeatInterval + " min: " +min + " max: "+max + " repeatindex: "+repeatIndex+ " index: "+index);
          repeatIndex = 1;
          stack.push(index);
        } else {
          repeatIndex++;
        }
      }

      return stack;
    }

    return Number.isNaN(+val) ? val : +val;
  }
  var seqresult = parseSequence(value);
  

  return seqresult;
};

CronExpression._sortCompareFn = function(a, b) {
  var aIsNumber = typeof a === 'number';
  var bIsNumber = typeof b === 'number';

  if (aIsNumber && bIsNumber) {
    return a - b;
  }

  if (!aIsNumber && bIsNumber) {
    return 1;
  }

  if (aIsNumber && !bIsNumber) {
    return -1;
  }

  return a.localeCompare(b);
};

CronExpression._handleMaxDaysInMonth = function(mappedFields) {
  // Filter out any day of month value that is larger than given month expects
  if (mappedFields.month.length === 1) {
    var daysInMonth = CronExpression.daysInMonth[mappedFields.month[0] - 1];
    console.log(mappedFields.dayOfMonth[mappedFields.dayOfMonth.length-1]);
    if (mappedFields.dayOfMonth[0] > daysInMonth) {
      throw new Error('Invalid explicit day of month definition');
    }

    return mappedFields.dayOfMonth
      .filter(function(dayOfMonth) {
        return dayOfMonth <= daysInMonth;
      })
      .sort(CronExpression._sortCompareFn);
  }
};


/**
 * Parse input expression
 *
 * @public
 * @param {String} expression Input expression
 */
CronExpression.parse = function parse(expression) {

  function parse (expression) {  

    // Split fields
    var fields = [];
    var atoms2 = (expression + '').trim().split(/\s+/);
    console.log(atoms2);
    if (atoms2.length != 6) {
      throw new Error('Invalid cron expression');
    }
    var atoms = atoms2.slice(0, 5);
    
    var mappedFields = {};
    for (var i = 0, c = CronExpression.map.length; i < c; ++i) {
      var field = CronExpression.map[i]; // Field name
      var val = atoms[i]; // Field value

      mappedFields[field]=CronExpression._parseField(
          field,
          val,
          CronExpression.constraints[i]
          );
    }

    var dayOfMonth = CronExpression._handleMaxDaysInMonth(mappedFields);
    mappedFields.dayOfMonth = dayOfMonth || mappedFields.dayOfMonth;
    for(var key in mappedFields){
        if(key=="minute")
          console.log(key + "        " + mappedFields[key]);
      else if(key=="hour")
        console.log(key + "          " + mappedFields[key]);
      else if(key=="dayOfMonth")
        console.log(key + "    " + mappedFields[key]);
      else if(key=="month")
        console.log(key + "         " + mappedFields[key]);
      else if(key=="dayOfWeek")
        console.log(key + "     " + mappedFields[key]);
    }
    console.log("command       " + atoms2[5]);
    
    return new CronExpression(mappedFields);    
  }

  return parse(expression);
};


module.exports = CronExpression;
