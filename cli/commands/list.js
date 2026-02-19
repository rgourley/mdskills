const chalk = require('chalk')
const ora = require('ora')
const { fetchSkills } = require('../api')
const { skillsTable } = require('../ui/format')

async function listCommand(args) {
  const getArg = (flag) => {
    const idx = args.indexOf(flag)
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined
  }

  const category = getArg('--category')
  const sort = getArg('--sort') || 'popular'
  const type = getArg('--type')
  const featured = args.includes('--featured')
  const limit = Number(getArg('--limit') || 20)

  const label = featured ? 'Featured skills' : category ? `Skills in "${category}"` : 'Popular skills'
  const spinner = ora(`Loading ${label.toLowerCase()}...`).start()

  try {
    const { skills } = await fetchSkills({
      category,
      sort,
      artifactType: type,
      featured,
      limit,
    })
    spinner.stop()

    if (skills.length === 0) {
      console.log(chalk.yellow(`\n  No skills found\n`))
      return
    }

    console.log(chalk.bold(`\n  ${label}\n`))
    console.log(skillsTable(skills))
    console.log('')
    console.log(chalk.dim('  Run ') + chalk.cyan('mdskills info <slug>') + chalk.dim(' for details'))
    console.log(chalk.dim('  Run ') + chalk.cyan('mdskills install <owner>/<slug>') + chalk.dim(' to install'))
    console.log('')
  } catch (err) {
    spinner.fail('Failed to load skills')
    console.error(chalk.red(`  ${err.message}`))
    process.exit(1)
  }
}

module.exports = listCommand
