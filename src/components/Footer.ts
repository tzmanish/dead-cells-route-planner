export function Footer(): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = 'text-center bg-dc-footer py-6';
  footer.innerHTML = `
    <div class="mx-auto text-dc-gray">
      <p class="text-sm">&copy; 2025 Dead Cells Route Planner</p>
      <p class="text-sm">Fan-made tool for Dead Cells by Motion Twin</p>
    </div>
  `
  return footer;
}
