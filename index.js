#!/usr/bin/env node
const fs = require('fs')
const { resolve } = require('path')
const licenses = require('./licenses.json')
const inquirer = require('inquirer')
const existsSync = require('exists-sync')

if (existsSync('./LICENSE')) {
  console.log('Already found a license. Aborting ❌')
  process.exit(0)
}

const preCollected = {}

const licenseChoices = [
  {
    name: 'MIT',
    value: licenses.MIT,
  },
  {
    name: 'GPL-3.0',
    value: licenses.GPL,
  },
  {
    name: 'Apache-2.0',
    value: licenses.Apache,
  },
]

try {
  const pack = require(resolve('./package.json'))
  if (pack.author) {
    preCollected.name = pack.author
  }
  if (pack.license) {
    for (const [index, choice] of licenseChoices.entries()) {
      if (pack.license === choice.name) {
        preCollected.licenseIndex = index
        break
      }
    }
  }
} catch (e) {
  console.log(e)
} // do nothing

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      default: preCollected.name,
      message: 'enter your name:',
    },
    {
      type: 'input',
      name: 'year',
      message: 'enter the year:',
      default: new Date().getFullYear(),
      validate: str => /^[0-9]{4,}$/.test(str),
    },
    {
      type: 'list',
      name: 'license',
      message: 'pick a license:',
      default: preCollected.licenseIndex,
      choices: licenseChoices,
    },
  ])
  .then(answers => {
    // fill in the name and year
    answers.license = answers.license.replace('<name>', answers.name)
    answers.license = answers.license.replace('<year>', answers.year)

    // write the license
    fs.writeFileSync('./LICENSE', answers.license)
    console.log('Done! 👌')
  })
  .catch(e => {
    console.error('Something bad happened 😨')
    if (process.env.DEBUG.includes('licker')) {
      console.error(e)
    }
  })
