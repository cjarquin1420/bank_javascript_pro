'use strict'

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Carlos Washington',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-09-22T17:01:17.194Z',
    '2023-09-20T23:36:17.929Z',
    '2023-09-23T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'es-ES',
}

const account2 = {
  owner: 'Kerling Washington',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-02-25T14:18:46.235Z',
    '2020-02-22T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-07-26T18:49:59.371Z',
    '2020-07-23T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
}

const accounts = [account1, account2]

// Elements
const labelWelcome = document.querySelector('.welcome')
const labelDate = document.querySelector('.date')
const labelBalance = document.querySelector('.balance__value')
const labelSumIn = document.querySelector('.summary__value--in')
const labelSumOut = document.querySelector('.summary__value--out')
const labelSumInterest = document.querySelector('.summary__value--interest')
const labelTimer = document.querySelector('.timer')

const containerApp = document.querySelector('.app')
const containerMovements = document.querySelector('.movements')

const btnLogin = document.querySelector('.login__btn')
const btnTransfer = document.querySelector('.form__btn--transfer')
const btnLoan = document.querySelector('.form__btn--loan')
const btnClose = document.querySelector('.form__btn--close')
const btnSort = document.querySelector('.btn--sort')

const inputLoginUsername = document.querySelector('.login__input--user')
const inputLoginPin = document.querySelector('.login__input--pin')
const inputTransferTo = document.querySelector('.form__input--to')
const inputTransferAmount = document.querySelector('.form__input--amount')
const inputLoanAmount = document.querySelector('.form__input--loan-amount')
const inputCloseUsername = document.querySelector('.form__input--user')
const inputClosePin = document.querySelector('.form__input--pin')

// DATE Function
const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))

  const daysPassed = calcDaysPassed(new Date(), date)

  if (daysPassed === 0) return 'Today'
  if (daysPassed === 1) return 'Yesterday'
  if (daysPassed <= 7) return `${daysPassed} days ago`
  return new Intl.DateTimeFormat(locale).format(date)
}

// Currency Format Function
const currencyFormat = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value)
}

// Display Movements
const displayMovements = function (acc, sort = true) {
  containerMovements.innerHTML = ''

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal'

    const date = new Date(acc.movementsDates[i])
    const displayDate = formatMovementDate(date, acc.locale)

    const formattedMov = currencyFormat(mov, acc.locale, acc.currency)

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type} ">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
    `
    containerMovements.insertAdjacentHTML('afterbegin', html)
  })
}

// Display the current balance
const calcDisplayBalance = function (acc) {
  const balance = acc.movements.reduce((acc, mov) => acc + mov, 0)
  acc.balance = balance
  labelBalance.textContent = currencyFormat(
    acc.balance,
    acc.locale,
    acc.currency,
  )
}

// Display Summary Ins, Outs, Interest
const displaySconstummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0)
  labelSumIn.textContent = currencyFormat(incomes, acc.locale, acc.currency)

  const outcomes = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0)
  labelSumOut.textContent = currencyFormat(
    Math.abs(outcomes),
    acc.locale,
    acc.currency,
  )

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1
    })
    .reduce((acc, int) => acc + int, 0)
  labelSumInterest.textContent = currencyFormat(
    interest,
    acc.locale,
    acc.currency,
  )
}

// Create Username
const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map((name) => name[0])
      .join('')
  })
}
createUsername(accounts)

// Update UI
const updateUI = (acc) => {
  // Display movements
  displayMovements(acc)

  // Display Balance
  calcDisplayBalance(acc)

  // Display summary
  displaySconstummary(acc)
}

// Logout timer
const startLogOutTimer = () => {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0)
    const sec = String(time % 60).padStart(2, 0)
    labelTimer.textContent = `${min}:${sec}`
    if (time === 0) {
      clearInterval(timer)
      labelWelcome.textContent = 'Welcome to get started'
      containerApp.style.opacity = 0
    }
    time--
  }
  let time = 300

  tick() // Call timer every second
  const timer = setInterval(tick, 1000)
  return timer
}

//LOGIN EVENT
let currentAccount, timer

btnLogin.addEventListener('click', (e) => {
  // Prevent form from submitting
  e.preventDefault()

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value,
  )
  console.log(currentAccount)

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display the UI and Welcome Message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`
    containerApp.style.opacity = 100

    // Current Date and time
    const now = new Date()
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    }
    const locale = navigator.language

    labelDate.textContent = new Intl.DateTimeFormat('en-US', options).format(
      now,
    )

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = ''
    inputLoginPin.blur()

    // Timer
    if (timer) clearInterval(timer)
    timer = startLogOutTimer()

    // Update UI
    updateUI(currentAccount)
  }
})

// TANSFER MONEY EVENT
btnTransfer.addEventListener('click', (e) => {
  e.preventDefault()
  const amount = +inputTransferAmount.value
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value,
  )

  // Clear input fields for transfer
  inputTransferAmount.value = inputTransferTo.value = ''

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing Transfer
    currentAccount.movements.push(-amount)
    receiverAcc.movements.push(amount)

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAcc.movementsDates.push(new Date().toISOString())

    // Update UI
    updateUI(currentAccount)

    // Reset timer
    clearInterval(timer)
    timer = startLogOutTimer()
  }
})

// LOAN EVENT
btnLoan.addEventListener('click', (e) => {
  e.preventDefault()

  const amount = Math.floor(inputLoanAmount.value)

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount)

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString())

      // Update UI
      updateUI(currentAccount)

      // Reset timer
      clearInterval(timer)
      timer = startLogOutTimer()
    }, 3000)
  }
  inputLoanAmount.value = ''
})

// CLOSE ACCOUNT EVENT
btnClose.addEventListener('click', (e) => {
  e.preventDefault()

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username,
    )
    console.log(index)

    //Delete account
    accounts.splice(index, 1)

    // Hide UI
    containerApp.style.opacity = 0
  }

  inputCloseUsername.value = inputClosePin.value = ''
})

// SORT EVENT
let sorted = false
btnSort.addEventListener('click', (e) => {
  e.preventDefault()

  displayMovements(currentAccount, !sorted)
  sorted = !sorted
})
