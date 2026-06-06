import MainLayout from "../layouts/MainLayout"

function PagePlaceholder({
  eyebrow,
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
}) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">{title}</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            {icon}
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-900">
            {emptyTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-slate-500">
            {emptyDescription}
          </p>
        </div>
      </div>
    </MainLayout>
  )
}

export default PagePlaceholder