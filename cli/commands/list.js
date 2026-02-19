const chalk = require('chalk')
const ora = require('ora')
const { fetchSkills } = require('../api')
const { skillsTable } = require('../ui/format')

async function listCommand(args) {
  const json = args.includes('--json')
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
  const spinner = json ? null : ora(`Loading ${label.toLowerCase()}...`).start()

  try {
    const { skills } = await fetchSkills({
      category,
      sort,
      artifactType: type,
      featured,
      limit,
    })
    if (spinner) spinner.stop()

    if (json) {
      console.log(JSON.stringify({ skills, count: skills.length }))
      return
    }

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
    if (spinner) spinner.fail('Failed to load skills')
    if (json) {
      console.log(JSON.stringify({ error: err.message }))
    } else {
      console.error(chalk.red(`  ${err.message}`))
    }
    process.exit(1)
  }
}

module.exports = listCommand
