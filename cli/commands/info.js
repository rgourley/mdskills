const chalk = require('chalk')
const ora = require('ora')
const { fetchSkillDetail } = require('../api')
const { skillDetail } = require('../ui/format')

async function infoCommand(args) {
  const json = args.includes('--json')
  const input = args.find(a => !a.startsWith('--'))
  if (!input) {
    if (json) {
      console.log(JSON.stringify({ error: 'Missing skill slug' }))
    } else {
      console.error(chalk.red('  Usage: mdskills info <slug>'))
      console.error(chalk.dim('  Example: mdskills info interface-design'))
    }
    process.exit(1)
  }

  // Accept owner/slug or just slug
  const slug = input.includes('/') ? input.split('/').pop() : input

  const spinner = json ? null : ora(`Loading ${slug}...`).start()

  try {
    const data = await fetchSkillDetail(slug)
    if (spinner) spinner.stop()

    if (!data || !data.skill) {
      if (json) {
        console.log(JSON.stringify({ error: `Skill "${slug}" not found` }))
      } else {
        console.log(chalk.yellow(`\n  Skill "${slug}" not found\n`))
        console.log(chalk.dim('  Try searching: mdskills search <query>\n'))
      }
      return
    }

    if (json) {
      console.log(JSON.stringify(data.skill))
    } else {
      console.log(skillDetail(data.skill))
    }
  } catch (err) {
    if (spinner) spinner.fail('Failed to load skill')
    if (json) {
      console.log(JSON.stringify({ error: err.message }))
    } else {
      console.error(chalk.red(`  ${err.message}`))
    }
    process.exit(1)
  }
}

module.exports = infoCommand
