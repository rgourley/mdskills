const chalk = require('chalk')
const Table = require('cli-table3')

const TYPE_LABELS = {
  skill_pack: 'Skill',
  mcp_server: 'MCP Server',
  workflow_pack: 'Workflow',
  ruleset: 'Rules',
  openapi_action: 'OpenAPI',
  extension: 'Extension',
  template_bundle: 'Starter Kit',
}

function formatType(type) {
  return TYPE_LABELS[type] || type || 'Skill'
}

function skillsTable(skills) {
  const table = new Table({
    head: [
      chalk.bold('Name'),
      chalk.bold('Owner'),
      chalk.bold('Type'),
      chalk.bold('Stars'),
    ],
    style: { head: [], border: [] },
    chars: {
      top: '', 'top-mid': '', 'top-left': '', 'top-right': '',
      bottom: '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      left: '  ', 'left-mid': '', mid: '', 'mid-mid': '',
      right: '', 'right-mid': '', middle: '  ',
    },
  })

  for (const s of skills) {
    table.push([
      chalk.cyan(s.name),
      chalk.dim(s.owner),
      formatType(s.artifact_type),
      s.github_stars ? String(s.github_stars) : chalk.dim('-'),
    ])
  }

  return table.toString()
}

function skillDetail(skill) {
  const lines = []
  lines.push('')
  lines.push(chalk.bold.white(`  ${skill.name}`))
  lines.push(chalk.dim(`  by @${skill.owner} | ${formatType(skill.artifact_type)}`))
  lines.push('')
  if (skill.description) {
    lines.push(`  ${chalk.white(skill.description)}`)
    lines.push('')
  }
  if (skill.category) {
    lines.push(`  ${chalk.dim('Category:')}    ${skill.category.name}`)
  }
  if (skill.platforms && skill.platforms.length > 0) {
    lines.push(`  ${chalk.dim('Platforms:')}   ${skill.platforms.join(', ')}`)
  }
  if (skill.tags && skill.tags.length > 0) {
    lines.push(`  ${chalk.dim('Tags:')}        ${skill.tags.join(', ')}`)
  }
  if (skill.license) {
    lines.push(`  ${chalk.dim('License:')}     ${skill.license}`)
  }
  if (skill.github_url) {
    lines.push(`  ${chalk.dim('GitHub:')}      ${skill.github_url}`)
  }
  if (skill.github_stars) {
    lines.push(`  ${chalk.dim('Stars:')}       ${skill.github_stars}`)
  }

  if (skill.permissions) {
    const perms = Object.entries(skill.permissions)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/_/g, ' '))
    if (perms.length > 0) {
      lines.push(`  ${chalk.dim('Permissions:')} ${perms.join(', ')}`)
    }
  }

  lines.push('')
  lines.push(`  ${chalk.dim('Install:')}     ${chalk.green(`npx mdskills install ${skill.owner}/${skill.slug}`)}`)
  lines.push(`  ${chalk.dim('View:')}        https://www.mdskills.ai/skills/${skill.slug}`)
  lines.push('')

  return lines.join('\n')
}

function banner() {
  return [
    '',
    chalk.bold('  mdskills') + chalk.dim('.ai') + chalk.dim(' — AI Skills Marketplace'),
    '',
  ].join('\n')
}

module.exports = { skillsTable, skillDetail, formatType, banner }
