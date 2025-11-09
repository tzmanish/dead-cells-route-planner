export function Header(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'bg-dc-header shadow-dc h-[60px]';
    header.innerHTML = `
      <div class="mx-auto h-full px-4">
        <div class="flex justify-between items-end h-full">
          <div class="flex items-baseline gap-0 font-title font-bold text-5xl">
            Route
            <img src="${import.meta.env.BASE_URL}logo.svg" alt="Dead Cells Route Planner Logo" class="h-8"/>
            Planner
          </div>
        </div>
      </div>
    `
    return header;
}
