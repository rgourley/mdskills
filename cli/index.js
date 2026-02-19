const chalk = require('chalk')
const { banner } = require('./ui/format')

// Check Node version
const [major] = process.versions.node.split('.').map(Number)
if (major < 18) {
  console.error('mdskills requires Node.js 18 or later.')
  process.exit(1)
}

const args = process.argv.slice(2)
const command = args[0]

function showHelp() {
  console.log(banner())
  console.log('  ' + chalk.bold('Usage:'))
  console.log('    mdskills                      Interactive mode')
  console.log('    mdskills search <query>       Search for skills')
  console.log('    mdskills list                 List popular skills')
  console.log('    mdskills info <slug>          Show skill details')
  console.log('    mdskills install <owner/slug> Install a skill')
  console.log('')
  console.log('  ' + chalk.bold('Options:'))
  console.log('    --help, -h                    Show this help')
  console.log('    --version, -v                 Show version')
  console.log('')
  console.log('  ' + chalk.bold('List options:'))
  console.log('    --category <slug>             Filter by category')
  console.log('    --sort <popular|trending|recent>')
  console.log('    --type <skill_pack|mcp_server|ruleset|...>')
  console.log('    --featured                    Show featured only')
  console.log('')
  console.log('  ' + chalk.bold('Install options:'))
  console.log('    --yes, -y                     Skip confirmation')
  console.log('')
  console.log('  ' + chalk.dim('https://www.mdskills.ai'))
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
