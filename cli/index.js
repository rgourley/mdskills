// Support --no-color / NO_COLOR standard (https://no-color.org)
if (process.argv.includes('--no-color') || process.env.NO_COLOR) {
  process.env.FORCE_COLOR = '0'
}

const chalk = require('chalk')
const { banner } = require('./ui/format')

// Check Node version
const [major] = process.versions.node.split('.').map(Number)
if (major < 18) {
  console.error('mdskills requires Node.js 18 or later.')
  process.exit(1)
}

const args = process.argv.slice(2).filter(a => a !== '--no-color')
const command = args[0]

function showHelp(subcommand) {
  if (subcommand) return showSubcommandHelp(subcommand)

  console.log(banner())
  console.log('  ' + chalk.bold('Commands:'))
  console.log('    mdskills                          Interactive mode')
  console.log('    mdskills search <query>           Search for skills')
  console.log('    mdskills list                     List popular skills')
  console.log('    mdskills categories               List all categories')
  console.log('    mdskills info <slug>              Show skill details')
  console.log('    mdskills install <owner/slug>     Install a skill')
  console.log('    mdskills init                     Scaffold a new SKILL.md')
  console.log('')
  console.log('  ' + chalk.bold('Global options:'))
  console.log('    --help, -h                        Show this help')
  console.log('    --version, -v                     Show version')
  console.log('    --json                            Output as JSON')
  console.log('    --no-color                        Disable colors')
  console.log('')
  console.log('  ' + chalk.bold('Examples:'))
  console.log(chalk.dim('    $ ') + 'mdskills search pdf')
  console.log(chalk.dim('    $ ') + 'mdskills list --category coding --sort trending')
  console.log(chalk.dim('    $ ') + 'mdskills install anthropics/pdf')
  console.log(chalk.dim('    $ ') + 'mdskills info memory-mcp-1file')
  console.log(chalk.dim('    $ ') + 'mdskills init')
  console.log(chalk.dim('    $ ') + 'mdskills list --json | jq ".skills[].name"')
  console.log('')
  console.log('  ' + chalk.dim('Run ') + chalk.cyan('mdskills help <command>') + chalk.dim(' for command-specific help'))
  console.log('  ' + chalk.dim('https://www.mdskills.ai'))
  console.log('')
}

function showSubcommandHelp(cmd) {
  console.log('')
  switch (cmd) {
    case 'search':
    case 's':
      console.log(chalk.bold('  mdskills search <query>'))
      console.log(chalk.dim('  Search the mdskills marketplace for AI agent skills.\n'))
      console.log('  ' + chalk.bold('Usage:'))
      console.log('    mdskills search <query>       Search by keyword')
      console.log('')
      console.log('  ' + chalk.bold('Options:'))
      console.log('    --json                        Output results as JSON')
      console.log('')
      console.log('  ' + chalk.bold('Examples:'))
      console.log(chalk.dim('    $ ') + 'mdskills search "code review"')
      console.log(chalk.dim('    $ ') + 'mdskills search mcp server')
      console.log(chalk.dim('    $ ') + 'mdskills search pdf --json')
      break
    case 'list':
    case 'ls':
      console.log(chalk.bold('  mdskills list'))
      console.log(chalk.dim('  List skills from the marketplace.\n'))
      console.log('  ' + chalk.bold('Options:'))
      console.log('    --category <slug>             Filter by category')
      console.log('    --sort <popular|trending|recent>')
      console.log('    --type <skill_pack|mcp_server|ruleset|...>')
      console.log('    --featured                    Show featured only')
      console.log('    --limit <n>                   Max results (default: 20)')
      console.log('    --json                        Output results as JSON')
      console.log('')
      console.log('  ' + chalk.bold('Examples:'))
      console.log(chalk.dim('    $ ') + 'mdskills list')
      console.log(chalk.dim('    $ ') + 'mdskills list --category coding --sort trending')
      console.log(chalk.dim('    $ ') + 'mdskills list --type mcp_server --limit 10')
      console.log(chalk.dim('    $ ') + 'mdskills list --featured --json')
      break
    case 'info':
    case 'show':
      console.log(chalk.bold('  mdskills info <slug>'))
      console.log(chalk.dim('  Show detailed information about a skill.\n'))
      console.log('  ' + chalk.bold('Usage:'))
      console.log('    mdskills info <slug>          By slug')
      console.log('    mdskills info <owner/slug>    By owner/slug')
      console.log('')
      console.log('  ' + chalk.bold('Options:'))
      console.log('    --json                        Output as JSON')
      console.log('')
      console.log('  ' + chalk.bold('Examples:'))
      console.log(chalk.dim('    $ ') + 'mdskills info interface-design')
      console.log(chalk.dim('    $ ') + 'mdskills info anthropics/pdf --json')
      break
    case 'install':
    case 'i':
      console.log(chalk.bold('  mdskills install <owner/slug>'))
      console.log(chalk.dim('  Install a skill into your project.\n'))
      console.log('  ' + chalk.bold('Usage:'))
      console.log('    mdskills install <slug>')
      console.log('    mdskills install <owner/slug>')
      console.log('')
      console.log('  ' + chalk.bold('Options:'))
      console.log('    --yes, -y                     Skip confirmation prompt')
      console.log('')
      console.log('  ' + chalk.bold('Install locations:'))
      console.log('    Skill packs   .claude/skills/<slug>/SKILL.md')
      console.log('    Rulesets      Format-specific path (.cursorrules, CLAUDE.md, etc.)')
      console.log('    MCP servers   Prints install commands (no files written)')
      console.log('')
      console.log('  ' + chalk.bold('Examples:'))
      console.log(chalk.dim('    $ ') + 'mdskills install anthropics/pdf')
      console.log(chalk.dim('    $ ') + 'mdskills install memory-mcp-1file -y')
      break
    case 'init':
      console.log(chalk.bold('  mdskills init'))
      console.log(chalk.dim('  Create a new SKILL.md file in the current directory.\n'))
      console.log('  ' + chalk.bold('Usage:'))
      console.log('    mdskills init                 Create SKILL.md')
      console.log('    mdskills init <filename>      Create with custom filename')
      console.log('')
      console.log('  ' + chalk.bold('Examples:'))
      console.log(chalk.dim('    $ ') + 'mdskills init')
      console.log(chalk.dim('    $ ') + 'mdskills init skills/my-skill.md')
      break
    case 'categories':
    case 'cats':
      console.log(chalk.bold('  mdskills categories'))
      console.log(chalk.dim('  List all skill categories.\n'))
      console.log('  ' + chalk.bold('Options:'))
      console.log('    --json                        Output as JSON')
      console.log('')
      console.log('  ' + chalk.bold('Examples:'))
      console.log(chalk.dim('    $ ') + 'mdskills categories')
      console.log(chalk.dim('    $ ') + 'mdskills categories --json')
      break
    default:
      console.log(chalk.yellow(`  Unknown command: ${cmd}`))
      console.log(chalk.dim('  Run ') + chalk.cyan('mdskills --help') + chalk.dim(' to see all commands'))
  }
  console.log('')
}

function showVersion() {
  try {
    const pkg = require('../package.json')
    console.log(`mdskills v${pkg.version}`)
  } catch {
    console.log('mdskills v1.0.0')
  }
}

async function main() {
  // Handle "mdskills help <subcommand>"
  if (command === 'help' && args[1]) {
    return showHelp(args[1])
  }

  // Handle "mdskills <command> --help"
  if (args.includes('--help') || args.includes('-h')) {
    if (command && command !== '--help' && command !== '-h' && command !== 'help') {
      return showHelp(command)
    }
    return showHelp()
  }

  switch (command) {
    case 'search':
    case 's':
      return require('./commands/search')(args.slice(1))
    case 'install':
    case 'i':
      return require('./commands/install')(args.slice(1))
    case 'list':
    case 'ls':
      return require('./commands/list')(args.slice(1))
    case 'info':
    case 'show':
      return require('./commands/info')(args.slice(1))
    case 'categories':
    case 'cats':
      return require('./commands/categories')(args.slice(1))
    case 'init':
      return require('./commands/init')(args.slice(1))
    case '--help':
    case '-h':
    case 'help':
      return showHelp()
    case '--version':
    case '-v':
    case 'version':
      return showVersion()
    default:
      // No command or unknown command = interactive mode
      return require('./commands/interactive')()
  }
}

main().catch((err) => {
  console.error(chalk.red(`\n  Error: ${err.message}\n`))
  process.exit(1)
})
