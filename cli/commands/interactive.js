const chalk = require('chalk')
const ora = require('ora')
const { fetchSkills, fetchCategories } = require('../api')
const { skillsTable, skillDetail, banner } = require('../ui/format')

async function interactiveCommand() {
  const { default: inquirer } = await import('inquirer')

  console.log(banner())

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Search skills', value: 'search' },
          { name: 'Browse popular', value: 'popular' },
          { name: 'Browse by category', value: 'category' },
          { name: 'Install a skill', value: 'install' },
          new inquirer.Separator(),
          { name: 'Visit mdskills.ai', value: 'web' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ])

    if (action === 'exit') {
      break
    }

    if (action === 'web') {
      console.log(chalk.dim('\n  https://www.mdskills.ai\n'))
      continue
    }

    if (action === 'search') {
      const { query } = await inquirer.prompt([
        { type: 'input', name: 'query', message: 'Search:' },
      ])
      if (!query.trim()) continue

      const spinner = ora('Searching...').start()
      try {
        const { skills } = await fetchSkills({ query: query.trim(), limit: 15 })
        spinner.stop()

        if (skills.length === 0) {
          console.log(chalk.yellow(`\n  No results for "${query}"\n`))
          continue
        }

        console.log(`\n${skillsTable(skills)}\n`)
        await selectSkill(inquirer, skills)
      } catch (err) {
        spinner.fail(err.message)
      }
      continue
    }

    if (action === 'popular') {
      const spinner = ora('Loading...').start()
      try {
        const { skills } = await fetchSkills({ sort: 'popular', limit: 15 })
        spinner.stop()

        if (skills.length === 0) {
          console.log(chalk.yellow('\n  No skills found\n'))
          continue
        }

        console.log(chalk.bold('\n  Popular Skills\n'))
        console.log(skillsTable(skills))
        console.log('')
        await selectSkill(inquirer, skills)
      } catch (err) {
        spinner.fail(err.message)
      }
      continue
    }

    if (action === 'category') {
      const spinner = ora('Loading categories...').start()
      try {
        const categories = await fetchCategories()
        spinner.stop()

        if (categories.length === 0) {
          console.log(chalk.yellow('\n  No categories found\n'))
          continue
        }

        const { cat } = await inquirer.prompt([
          {
            type: 'list',
            name: 'cat',
            message: 'Category:',
            choices: [
              ...categories.map(c => ({ name: c.name, value: c.slug })),
              new inquirer.Separator(),
              { name: 'Back', value: null },
            ],
          },
        ])

        if (!cat) continue

        const catSpinner = ora('Loading...').start()
        const { skills } = await fetchSkills({ category: cat, limit: 15 })
        catSpinner.stop()

        if (skills.length === 0) {
          console.log(chalk.yellow('\n  No skills in this category\n'))
          continue
        }

        console.log(`\n${skillsTable(skills)}\n`)
        await selectSkill(inquirer, skills)
      } catch (err) {
        spinner.fail(err.message)
      }
      continue
    }

    if (action === 'install') {
      const { input } = await inquirer.prompt([
        { type: 'input', name: 'input', message: 'Skill slug (owner/slug):' },
      ])
      if (!input.trim()) continue

      // Delegate to install command
      const installCommand = require('./install')
      await installCommand([input.trim()])
      continue
    }
  }
}

async function selectSkill(inquirer, skills) {
  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: 'Select a skill for details:',
      choices: [
        ...skills.map(s => ({
          name: `${s.name} ${chalk.dim(`(${s.owner})`)}`,
          value: s.slug,
        })),
        new inquirer.Separator(),
        { name: 'Back', value: null },
      ],
    },
  ])

  if (!selected) return

  // Fetch and show detail inline (instead of delegating to info command)
  const { fetchSkillDetail } = require('../api')
  const { skillDetail } = require('../ui/format')

  const detailSpinner = ora(`Loading ${selected}...`).start()
  let data
  try {
    data = await fetchSkillDetail(selected)
    detailSpinner.stop()
  } catch (err) {
    detailSpinner.fail('Failed to load skill')
    return
  }

  if (!data || !data.skill) {
    console.log(chalk.yellow(`\n  Skill "${selected}" not found\n`))
    return
  }

  console.log(skillDetail(data.skill))

  // Offer actions after viewing detail
  const choices = []
  if (data.skill.artifact_type === 'mcp_server') {
    choices.push({ name: 'Show install commands', value: 'install' })
  } else if (data.skill.content) {
    choices.push({ name: 'Install this skill', value: 'install' })
  }
  choices.push(
    { name: `View on mdskills.ai`, value: 'web' },
    { name: 'Back', value: 'back' },
  )

  const { action } = await inquirer.prompt([
    { type: 'list', name: 'action', message: 'What would you like to do?', choices },
  ])

  if (action === 'install') {
    const installCommand = require('./install')
    await installCommand([selected])
  } else if (action === 'web') {
    console.log(chalk.dim(`\n  https://www.mdskills.ai/skills/${selected}\n`))
  }
}

module.exports = interactiveCommand
