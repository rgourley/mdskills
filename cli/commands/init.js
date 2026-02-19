const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const TEMPLATE = `---
name: {{name}}
description: {{description}}
version: 1.0.0
---

# {{name}}

{{description}}

## Usage

Describe how an AI agent should use this skill.

## Examples

Provide example prompts and expected behavior.
`

async function initCommand(args) {
  const targetFile = args.find(a => !a.startsWith('--')) || 'SKILL.md'
  const fullPath = path.resolve(process.cwd(), targetFile)

  if (fs.existsSync(fullPath)) {
    console.log(chalk.yellow(`\n  ${targetFile} already exists in this directory.`))
    console.log(chalk.dim('  Use a different filename or remove the existing file.\n'))
    process.exit(1)
  }

  const { default: inquirer } = await import('inquirer')

  console.log('')
  console.log(chalk.bold('  Create a new SKILL.md'))
  console.log(chalk.dim('  This will scaffold a skill file in the current directory.\n'))

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Skill name:',
      validate: v => v.trim() ? true : 'Name is required',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Short description:',
      validate: v => v.trim() ? true : 'Description is required',
    },
  ])

  const content = TEMPLATE
    .replace(/\{\{name\}\}/g, answers.name.trim())
    .replace(/\{\{description\}\}/g, answers.description.trim())

  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(fullPath, content, 'utf-8')

  console.log(chalk.green(`\n  Created ${targetFile}`))
  console.log(chalk.dim('  Edit the file to add your skill instructions.\n'))
  console.log(chalk.dim('  Learn more about the SKILL.md format:'))
  console.log(chalk.dim('    https://www.mdskills.ai/specs/skill-md\n'))
}

module.exports = initCommand
