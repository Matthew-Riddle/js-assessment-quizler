import vorpal from 'vorpal'
import { prompt } from 'inquirer'

import {
  readFile,
  writeFile,
  chooseRandom,
  createPrompt,
  createQuestions
} from './lib'

const cli = vorpal()

const askForQuestions = [
  {
    type: 'input',
    name: 'numQuestions',
    message: 'How many questions do you want in your quiz?',
    validate: input => {
      const pass = input.match(/^[1-9]{1}$|^[1-9]{1}[0-9]{1}$|^100$/)
      return pass ? true : 'Please enter a valid number!'
    }
  },
  {
    type: 'input',
    name: 'numChoices',
    message: 'How many choices should each question have?',
    validate: input => {
      const pass = input.match(/^(?:[2-4]|0[2-4]|4)$/)
      return pass ? true : 'Please enter a valid number!'
    }
  }
]

const createQuiz = title =>
  prompt(askForQuestions)
    .then(answer => prompt(createPrompt(answer)))
    .then(answer => createQuestions(answer))
    .then(answer => writeFile(title + '.json', answer))
    .catch(err => console.log('Error creating the quiz.', err))

const takeQuiz = (title, output) =>
  readFile(title + '.json')
    .then(answer => prompt(answer))
    .then(answer => writeFile(output + '.json', answer))
    .catch(err => console.log('Error taking the quiz.', err))

const takeRandomQuiz = (output, n, quizes) => {
  Promise.all(quizes.map(val => readFile(val + '.json'))) // answer.reduce(flat, toflatten => flat.concat(toFlatten), [])
    // .then(answer => answer.flat())
    .then(answer =>
      answer.reduce((flat, toFlatten) => flat.concat(toFlatten), [])
    )
    .then(answer => prompt(chooseRandom(answer, n)))
    .then(answer => writeFile(`${output}.json`, answer))
    .catch(err => console.log('Error with random quiz.', err))
}
cli
  .command(
    'create <fileName>',
    'Creates a new quiz and saves it to the given fileName'
  )
  .action(function (input, callback) {
    // TODO update create command for correct functionality2
    return createQuiz(input.fileName)
  })

cli
  .command(
    'take <fileName> <outputFile>',
    'Loads a quiz and saves the users answers to the given outputFile'
  )
  .action(function (input, callback) {
    // TODO implement functionality for taking a quiz
    return takeQuiz(input.fileName, input.outputFile)
  })

cli
  .command(
    'random <outputFile> <n> <fileNames...>',
    'Loads a quiz or' +
      ' multiple quizes and selects a random number of questions from each quiz.' +
      ' Then, saves the users answers to the given outputFile'
  )
  .action(function (input, callback) {
    // TODO implement the functionality for taking a random quiz
    return takeRandomQuiz(input.outputFile, input.n, input.fileNames)
  })

cli.delimiter(cli.chalk['yellow']('quizler>')).show()
