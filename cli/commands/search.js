const chalk = require('chalk')
const ora = require('ora')
const { fetchSkills } = require('../api')
const { skillsTable } = require('../ui/format')

async function searchCommand(args) {
  const json = args.includes('--json')
  const query = args.filter(a => !a.startsWith('--')).join(' ')
  if (!query) {
    if (json) {
      console.log(JSON.stringify({ error: 'Missing search query' }))
    } else {
      console.error(chalk.red('  Usage: mdskills search <query>'))
      console.error(chalk.dim('  Example: mdskills search pdf'))
    }
    process.exit(1)
  }

  const spinner = json ? null : ora(`Searching for "${query}"...`).start()

  try {
    const { skills } = await fetchSkills({ query, limit: 20 })
    if (spinner) spinner.stop()

    if (json) {
      console.log(JSON.stringify({ query, skills, count: skills.length }))
      return
    }

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
    if (spinner) spinner.fail('Search failed')
    if (json) {
      console.log(JSON.stringify({ error: err.message }))
    } else {
      console.error(chalk.red(`  ${err.message}`))
    }
    process.exit(1)
  }
}

module.exports = searchCommand
