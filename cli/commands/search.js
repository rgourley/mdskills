const chalk = require('chalk')
const ora = require('ora')
const { fetchSkills } = require('../api')
const { skillsTable } = require('../ui/format')

async function searchCommand(args) {
  const query = args.filter(a => !a.startsWith('--')).join(' ')
  if (!query) {
    console.log(chalk.red('  Usage: mdskills search <query>'))
    console.log(chalk.dim('  Example: mdskills search pdf'))
    process.exit(1)
  }

  const spinner = ora(`Searching for "${query}"...`).start()

  try {
    const { skills } = await fetchSkills({ query, limit: 20 })
    spinner.stop()

    if (skills.length === 0) {
      console.log(chalk.yellow(`\n  No results for "${query}"\n`))
      console.log(chalk.dim('  Try a broader search or browse all skills:'))
      console.log(chalk.dim('    mdskills list\n'))
      return
    }

    console.log(chalk.bold(`\n  ${skills.length} result${skills.length !== 1 ? 's' : ''} for "${query}"\n`))
    console.log(skillsTable(skills))
    console.log('')
    console.log(chalk.dim('  Run ') + chalk.cyan('mdskills info <slug>') + chalk.dim(' for details'))
    console.log(chalk.dim('  Run ') + chalk.cyan('mdskills install <owner>/<slug>') + chalk.dim(' to install'))
    console.log('')
  } catch (err) {
    spinner.fail('Search failed')
    console.error(chalk.red(`  ${err.message}`))
    process.exit(1)
  }
}

module.exports = searchCommand
