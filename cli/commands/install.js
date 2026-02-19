const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const ora = require('ora')
const { fetchSkillDetail } = require('../api')
const { formatType } = require('../ui/format')

/** Map format_standard to default install path */
function getTargetPath(slug, formatStandard) {
  switch (formatStandard) {
    case 'agents_md': return 'AGENTS.md'
    case 'claude_md': return 'CLAUDE.md'
    case 'cursorrules': return '.cursorrules'
    case 'copilot_instructions': return '.github/copilot-instructions.md'
    case 'gemini_md': return 'GEMINI.md'
    case 'clinerules': return '.clinerules'
    case 'windsurf_rules': return '.windsurf/rules'
    case 'mdc': return `.cursor/rules/${slug}.mdc`
    default: return `.claude/skills/${slug}/SKILL.md`
  }
}

async function installCommand(args) {
  const input = args.find(a => !a.startsWith('--'))
  const yes = args.includes('--yes') || args.includes('-y')

  if (!input) {
    console.log(chalk.red('  Usage: mdskills install <owner/slug>'))
    console.log(chalk.dim('  Example: mdskills install anthropics/pdf'))
    process.exit(1)
  }

  // Accept owner/slug or just slug
  const slug = input.includes('/') ? input.split('/').pop() : input

  const spinner = ora(`Fetching ${slug}...`).start()

  let data
  try {
    data = await fetchSkillDetail(slug)
    spinner.stop()
  } catch (err) {
    spinner.fail('Failed to fetch skill')
    console.error(chalk.red(`  ${err.message}`))
    process.exit(1)
  }

  if (!data || !data.skill) {
    console.log(chalk.yellow(`\n  Skill "${slug}" not found\n`))
    console.log(chalk.dim('  Try searching: mdskills search <query>\n'))
    process.exit(1)
  }

  const skill = data.skill
  console.log('')
  console.log(chalk.bold(`  ${skill.name}`) + chalk.dim(` (${formatType(skill.artifact_type)})`))
  if (skill.description) {
    console.log(chalk.dim(`  ${skill.description.slice(0, 100)}`))
  }
  console.log('')

  // MCP servers: show install command, don't write files
  if (skill.artifact_type === 'mcp_server') {
    console.log(chalk.bold('  MCP Server — install commands:\n'))

    if (skill.clients && skill.clients.length > 0) {
      for (const client of skill.clients) {
        console.log(chalk.dim(`  ${client.client_name}:`))
        if (client.install_instructions) {
          for (const line of client.install_instructions.split('\n')) {
            console.log(`    ${chalk.green(line)}`)
          }
        }
        console.log('')
      }
    } else {
      console.log(chalk.dim('  No install instructions available.'))
      console.log(chalk.dim(`  Check: ${skill.github_url}\n`))
    }
    return
  }

  // Skill / ruleset: write content to file
  const content = skill.content
  if (!content) {
    console.log(chalk.yellow('  No skill content available to install.'))
    console.log(chalk.dim(`  Download from: ${skill.github_url}\n`))
    return
  }

  const targetPath = getTargetPath(slug, skill.format_standard)
  const fullPath = path.resolve(process.cwd(), targetPath)

  // Show what we're about to do
  console.log(`  ${chalk.dim('File:')} ${targetPath}`)

  // Check permissions
  const perms = skill.permissions || {}
  const activePerms = Object.entries(perms).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' '))
  if (activePerms.length > 0) {
    console.log(`  ${chalk.dim('Permissions:')} ${activePerms.join(', ')}`)
  }
  console.log('')

  // Check if file exists
  if (fs.existsSync(fullPath)) {
    if (!yes) {
      // In non-interactive mode, warn and skip
      console.log(chalk.yellow(`  File already exists: ${targetPath}`))
      console.log(chalk.dim('  Use --yes to overwrite, or manually merge.\n'))
      return
    }
  }

  // Confirm if not --yes
  if (!yes) {
    const { default: inquirer } = await import('inquirer')
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Install to ${targetPath}?`,
        default: true,
      },
    ])
    if (!confirm) {
      console.log(chalk.dim('\n  Cancelled.\n'))
      return
    }
  }

  // Write the file
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(fullPath, content, 'utf-8')

  console.log(chalk.green(`\n  Installed ${skill.name} to ${targetPath}`))
  console.log(chalk.dim(`  View: https://www.mdskills.ai/skills/${slug}\n`))
}

module.exports = installCommand
