import Link from 'next/link'

export default function CreatePage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Create a Skill</h1>
        <p className="mt-4 text-neutral-600">
          The in-browser skill editor is coming soon. For now, use the CLI to create skills:
        </p>
        <div className="mt-8 p-6 rounded-xl bg-neutral-100 text-left font-mono text-sm">
          <p className="text-neutral-500"># Initialize a new skill</p>
          <p className="text-neutral-900 mt-2">npx skills init my-skill</p>
        </div>
      </div>
    </div>
  )
}
