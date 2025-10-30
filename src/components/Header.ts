export function Header(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'bg-dc-header shadow-dc h-[60px]';
    header.innerHTML = `
      <div class="mx-auto h-full px-6">
        <div class="flex justify-between items-center h-full">
          <div class="flex items-center gap-0 font-title font-bold text-5xl">
            Route
            <img src="/logo.svg" alt="Dead Cells Route Planner Logo" class="h-[32px]"/>
            Planner
          </div>
        </div>
      </div>
    `
    return header;
}
