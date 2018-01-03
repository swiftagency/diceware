// Globals
// which diceware language list will be used to lookup words.
var currentList = 'eff'
// an array of objects representing the current random word list.
var wordList = []
// the running tally of total entropy in the wordList
var totalEntropy = new Big(0)

// Proper casing
String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// Simple function to add commas to really large number strings
//  http://www.mredkj.com/javascript/nfbasic.html
function addCommas (nStr) {
  var x, x1, x2
  nStr += ''
  x = nStr.split('.')
  x1 = x[0]
  x2 = x.length > 1 ? '.' + x[1] : ''
  var rgx = /(\d+)(\d{3})/
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2')
  }
  return x1 + x2
}

// See : https://www.reddit.com/r/crypto/comments/4xe21s/
//
// skip is to make result in this range:
// 0 ≤ result < n* count < 2^31
// (where n is the largest integer that satisfies this equation)
// This makes result % count evenly distributed.
//
// P.S. if (((count - 1) & count) === 0) {...} is optional and for
// when count is a nice binary number (2n). If this if statement is
// removed then it might have to loop a few times. So it saves a
// couple of micro seconds.
function secureRandom (count) {
  var cryptoObj = window.crypto || window.msCrypto
  var rand = new Uint32Array(1)
  var skip = 0x7fffffff - 0x7fffffff % count
  var result

  if (((count - 1) & count) === 0) {
	cryptoObj.getRandomValues(rand)
	return rand[0] & (count - 1)
  }

  do {
	cryptoObj.getRandomValues(rand)
	result = rand[0] & 0x7fffffff
  } while (result >= skip)

  return result % count
}

// Returns an array of objects of length numWords (default 1).
// Each object in the array represents a word and its index
// and is the result of numRollsPerWord die rolls (default 5).
function getWords (numWords, numRollsPerWord) {
  'use strict'

  var i,
      j,
      words,
      rollResults,
      rollResultsJoined

  words = []

  if (!numWords) { numWords = 1 }
  if (!numRollsPerWord) { numRollsPerWord = 5 }

  for (i = 0; i < numWords; i += 1) {
    rollResults = []

    for (j = 0; j < numRollsPerWord; j += 1) {
	  // roll a 6 sided die
      rollResults.push(secureRandom(6) + 1)
    }

    rollResultsJoined = rollResults.join('')
    words.push(getWordFromWordNum(rollResultsJoined)[0])
  }

  return words
}

// Polyfill : for Math.log2 which is part of ES6
// See : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log2
Math.log2 = Math.log2 || function (x) {
  return Math.log(x) / Math.LN2
}

// Lookup a word by its wordNum and return
// an Array with a single word object suitable for displayWords.
function getWordFromWordNum (wordNum) {
  if (wordNum.length === 5) {
    var word
    word = eff[wordNum]
    return [{'word': word, 'wordNum': wordNum}]
  } else if (wordNum.length === 2) {
    return [{'word': special[wordNum], 'wordNum': wordNum}]
  }
}

// Takes an array of word objects and display them on the page.
function displayWords (words) {
  'use strict'

  // add the word to the global array of words
  $.each(words, function (index, obj) {
    wordList.push(obj.word)
  })

  // add the word to the main display
  $.each(words, function (index, obj) {
    obj.word = obj.word.toProperCase();
    $('#diceWords').append(obj.word);
  })
}

function resetUI () {
  wordList = []
  $('#diceWords').html('')
}

$(document).ready(function () {
  'use strict'

  // Load any wordlist specified in the URL's hash.
  var listName = 'eff'

  // The nav links are used to select the current word list.
  $('.listSelectionLink').on('click', function (e) {
    currentList = $(this).data('list')
    // the active class gets applied to the parent <li> which
    // gets highlited if that was the last selected link.
    $('.listSelectionLink').parent().removeClass('active')
    $(this).parent().addClass('active')
    resetUI()
    // Propagation of the form submission resets the URL's hash.
    e.preventDefault()
  })

  // The nav links are used to select the current word list.
  $('.genWordsButton').on('click', function (e) {
    var numWords, numRolls, reset
    numWords = parseInt($(this).data('words'), 10)
    numRolls = parseInt($(this).data('rolls'), 10)
    reset = parseInt($(this).data('reset'), 10)
    e.preventDefault()
    if (reset === 1) {
      resetUI()
    }
    displayWords(getWords(numWords, numRolls))
  })
})