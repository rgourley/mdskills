const chalk = require('chalk')
const ora = require('ora')
const { fetchCategories } = require('../api')

async function categoriesCommand(args) {
  const json = args.includes('--json')
  const spinner = json ? null : ora('Loading categories...').start()

  try {
    const categories = await fetchCategories()
    if (spinner) spinner.stop()

    if (json) {
      console.log(JSON.stringify(categories))
      return
    }

    if (categories.length === 0) {
      console.log(chalk.yellow('\n  No categories found\n'))
      return
    }

    console.log(chalk.bold('\n  Categories\n'))
    for (const cat of categories) {
      const count = cat.skill_count ? chalk.dim(` (${cat.skill_count})`) : ''
      console.log(`  ${chalk.cyan(cat.slug.padEnd(24))} ${cat.name}${count}`)
    }
    console.log('')
    console.log(chalk.dim('  Browse a category:'))
    console.log(chalk.dim('    mdskills list --category <slug>\n'))
  } catch (err) {
    if (spinner) spinner.fail('Failed to load categories')
    if (json) {
      console.log(JSON.stringify({ error: err.message }))
    } else {
      console.error(chalk.red(`  ${err.message}`))
    }
    process.exit(1)
  }
}

module.exports = categoriesCommand
