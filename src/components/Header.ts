export function Header(): string {
    return `
    <header class="bg-dc-header shadow-dc h-[60px]">
      <div class="mx-auto h-full px-6">
        <div class="flex justify-between items-center h-full">
          <div class="flex items-center gap-0 font-title font-bold text-5xl">
            Route
            <img src="/logo.svg" alt="Dead Cells Route Planner Logo" class="h-[32px]"/>
            Planner
          </div>
        </div>
      </div>
    </header>
  `
}
