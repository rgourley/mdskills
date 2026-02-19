const chalk = require('chalk')
const ora = require('ora')
const { fetchSkillDetail } = require('../api')
const { skillDetail } = require('../ui/format')

async function infoCommand(args) {
  const input = args.find(a => !a.startsWith('--'))
  if (!input) {
    console.log(chalk.red('  Usage: mdskills info <slug>'))
    console.log(chalk.dim('  Example: mdskills info interface-design'))
    process.exit(1)
  }

  // Accept owner/slug or just slug
  const slug = input.includes('/') ? input.split('/').pop() : input

  const spinner = ora(`Loading ${slug}...`).start()

  try {
    const data = await fetchSkillDetail(slug)
    spinner.stop()

    if (!data || !data.skill) {
      console.log(chalk.yellow(`\n  Skill "${slug}" not found\n`))
      console.log(chalk.dim('  Try searching: mdskills search <query>\n'))
      return
    }

    console.log(skillDetail(data.skill))
  } catch (err) {
    spinner.fail('Failed to load skill')
    console.error(chalk.red(`  ${err.message}`))
    process.exit(1)
  }
}

module.exports = infoCommand
