import { $ } from '@core/dom'
import { getCountOfDecimalPlaces } from '@core/utils'
import { factorial } from './utils'

const ERROR_FORMULA_MESSAGE = '#Error#'

export function parseFormula($node) {
  const { value, currentCellData } = getValue($node)
  if (isFormula(value)) {
    try {
      checkValue(value, currentCellData)
      const operators = parseOperators(value)
      const operands = getOperandsOrThrowError(value)
      const formula = []

      let isBitIntValues = false
      operands.forEach(({ letter, number, isFac }, i) => {
        let { text, $cell } = getCellValue({ letter, number, currentCellData })
        if (text && isFormula(text)) {
          text = parseFormula($cell)
        }
        if (i !== 0) {
          if (operators[i - 1] === '!') {
            formula.push(operators[i])
          } else {
            formula.push(operators[i - 1])
          }
        }

        if (text) {
          if (isFac) {
            text = handleFac(text)
            if (text > Number.MAX_SAFE_INTEGER) {
              isBitIntValues = true
            }
          }
          formula.push(text)
        } else {
          formula.push(0)
        }
      })
      if (isBitIntValues) {
        formula.map(n => {
          if (isNaN(+n)) return n
          return BigInt(n)
        })
      }
      return parseFormulaText(formula.join(''))
    } catch (e) {
      console.warn(
        `Bad formula in cell "${currentCellData.letter}:${
          +currentCellData.number + 1
        }":`,
        e.message
      )
      return ERROR_FORMULA_MESSAGE
    }
  }
}

// utils
function checkValue(value, currentCellData) {
  if (value === '=') {
    throw new Error('No formula found')
  }
  const opObg = makeOperandObject(value.slice(1))
  if (
    opObg.letter === currentCellData.letter &&
    +opObg.number === +currentCellData.number + 1
  ) {
    throw new Error('Self reference')
  }
}

function getOperandsOrThrowError(value) {
  const operands = parseOperands(value)
  if (operands.length) {
    return operands.map(makeOperandObject)
  } else {
    throw new Error('Invalid formula')
  }
}

function parseFormulaText(value = '') {
  try {
    let result = eval(value)
    console.log(result)
    if (result > Number.MAX_SAFE_INTEGER) {
      result = BigInt(result)
    }
    console.log(result)
    return parseResult(result)
  } catch (e) {
    console.log(e.message)
    throw new Error('Error execute')
  }
}

function parseResult(result) {
  if (typeof result === 'bigint' || result > Number.MAX_SAFE_INTEGER) {
    return result.toString()
  }
  if (Number.isInteger(result)) {
    return result
  }
  return result.toFixed(3)
}

function isFormula(value) {
  return value.startsWith('=')
}

function parseOperands(value) {
  return value.match(/\w+!*/g)
}

function parseOperators(value) {
  return value.match(/[-+*\/]/g)
}

function getCellValue({ letter, number, currentCellData }) {
  if (letter && currentCellData) {
    const $cellInFormula = $.findOne(
      `[data-letter="${letter}"][data-row="${number - 1}"]`
    )
    let users = JSON.parse($cellInFormula.attr('data-users'))
    if (users) {
      let user = users.some(user => !(user.l === letter && user.n === number))
      if (!user) {
        users.push({ l: currentCellData.letter, n: currentCellData.number })
      }
    } else {
      users = [{ l: currentCellData.letter, n: currentCellData.number }]
    }

    $cellInFormula.attr('data-users', JSON.stringify(users))
    const r = { text: $cellInFormula.text(), $cell: $cellInFormula }
    console.log(r)
    return r
  } else {
    return { text: number }
  }
}
function handleFac(text) {
  return String(factorial(text))
}
function makeOperandObject(operand) {
  const letter = operand.match(/[a-zA-Z]+/)
  let number = operand.match(/\d+!*/)
  const isFac = number[0].match(/!/) !== null
  if (isFac) {
    number[0] = number[0].slice(0, -1)
  }
  if (letter && !number) {
    throw new Error('Invalid formula: Bad cell reference')
  }
  return {
    letter: letter ? letter[0] : letter,
    number: number ? number[0] : number,
    isFac,
  }
}

function getValue(val) {
  if (typeof val === 'string') {
    return { value: val }
  } else {
    let v = val.attr('data-value')
    const letter = val.attr('data-letter')
    const number = val.attr('data-row')
    return {
      value: v,
      currentCellData: {
        letter,
        number,
        pos: letter + number,
      },
    }
  }
}
